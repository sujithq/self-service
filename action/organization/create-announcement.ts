import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/rest'
import { CreateAnnouncementBody } from '../types.js'
import { getIssueOpsInputs } from '../utils/inputs.js'
import { addComment, closeIssue } from '../utils/issues.js'
import { DEMO_MODE } from '../utils/mode.js'

export async function createAnnouncement(): Promise<void> {
  const issueOps = getIssueOpsInputs()

  // Get the action inputs
  const issue: CreateAnnouncementBody = JSON.parse(
    core.getInput('parsed_issue_body', {
      required: true
    })
  )

  core.info('Action Inputs')
  core.info(`  Organization: ${issue.create_announcement_organization}`)
  core.info(`  Expiration Date: ${issue.create_announcement_expiration_date}`)
  core.info(`  User Dismissible: ${issue.create_announcement_user_dismissible}`)
  core.info(`  Markdown: ${issue.create_announcement_markdown}`)

  // If the organization name is not the same as the organization where this
  // action is running, we need to use the enterprise token.
  const octokit = new Octokit({
    auth:
      issue.create_announcement_organization === github.context.repo.owner
        ? process.env.GH_TOKEN
        : process.env.GH_ENTERPRISE_TOKEN
  })

  // Create the announcement (when not in demo mode)
  if (!DEMO_MODE)
    // https://docs.github.com/en/enterprise-cloud@latest/rest/announcement-banners/organizations#set-announcement-banner-for-organization
    await octokit.request('PATCH /orgs/{org}/announcement', {
      org: issue.create_announcement_organization,
      announcement: issue.create_announcement_markdown,
      expires_at: new Date(
        issue.create_announcement_expiration_date
      ).toISOString(),
      user_dismissible:
        issue.create_announcement_user_dismissible.selected.includes('Enable')
    })

  // Add a comment to the issue
  await addComment(
    octokit,
    issueOps.organization,
    issueOps.repository,
    issueOps.issueNumber,
    `Created announcement expiring \`${issue.create_announcement_expiration_date}`
  )

  // Close the issue
  await closeIssue(
    octokit,
    issueOps.organization,
    issueOps.repository,
    issueOps.issueNumber
  )
}
