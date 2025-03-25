import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/rest'
import { CreateAnnouncementBody } from './types.js'
import { addComment, closeIssue } from './utils/issues.js'
import { DEMO_MODE } from './utils/mode.js'

export async function createAnnouncement(): Promise<void> {
  // Get the IssueOps inputs
  const issueOpsOrganization: string = core.getInput('issue_ops_organization', {
    required: true
  })
  const issueOpsRepository: string = core.getInput('issue_ops_repository', {
    required: true
  })
  const issueNumber: number = parseInt(
    core.getInput('issue_number', {
      required: true
    }),
    10
  )

  // Get the action inputs
  const parsedIssueBody: CreateAnnouncementBody = JSON.parse(
    core.getInput('parsed_issue_body', {
      required: true
    })
  ) as CreateAnnouncementBody

  core.info('IssueOps Inputs')
  core.info(`  Organization: ${issueOpsOrganization}`)
  core.info(`  Repository: ${issueOpsRepository}`)
  core.info(`  Issue Number: ${issueNumber}`)

  core.info('Action Inputs')
  core.info(
    `  Organization: ${parsedIssueBody.create_announcement_organization}`
  )
  core.info(
    `  Expiration Date: ${parsedIssueBody.create_announcement_expiration_date}`
  )
  core.info(
    `  User Dismissible: ${parsedIssueBody.create_announcement_user_dismissible}`
  )
  core.info(`  Markdown: ${parsedIssueBody.create_announcement_markdown}`)

  // If the organization name is not the same as the organization where this
  // action is running, we need to use the enterprise token.
  const octokit = new Octokit({
    auth:
      parsedIssueBody.create_announcement_organization ===
      github.context.repo.owner
        ? process.env.GH_TOKEN
        : process.env.GH_ENTERPRISE_TOKEN
  })

  // Create the announcement (when not in demo mode)
  if (!DEMO_MODE)
    // https://docs.github.com/en/enterprise-cloud@latest/rest/announcement-banners/organizations#set-announcement-banner-for-organization
    await octokit.request('PATCH /orgs/{org}/announcement', {
      org: parsedIssueBody.create_announcement_organization,
      announcement: parsedIssueBody.create_announcement_markdown,
      expires_at: new Date(
        parsedIssueBody.create_announcement_expiration_date
      ).toISOString(),
      user_dismissible:
        parsedIssueBody.create_announcement_user_dismissible.selected.includes(
          'Enable'
        )
    })

  // Add a comment to the issue
  await addComment(
    octokit,
    issueOpsOrganization,
    issueOpsRepository,
    issueNumber,
    `Created announcement expiring \`${parsedIssueBody.create_announcement_expiration_date}`
  )

  core.info(
    `Created Announcement Expiring: ${parsedIssueBody.create_announcement_expiration_date}`
  )

  // Close the issue
  await closeIssue(
    octokit,
    issueOpsOrganization,
    issueOpsRepository,
    issueNumber
  )

  core.setOutput(
    'expiration_date',
    parsedIssueBody.create_announcement_expiration_date
  )
  core.info('Action Complete!')
}
