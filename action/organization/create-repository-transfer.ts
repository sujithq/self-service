import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/rest'
import { CreateRepositoryTransferBody } from '../types.js'
import { getIssueOpsInputs } from '../utils/inputs.js'
import { addComment, closeIssue } from '../utils/issues.js'
import { DEMO_MODE } from '../utils/mode.js'

export async function createRepositoryTransfer(): Promise<void> {
  const issueOps = getIssueOpsInputs()

  // Get the action inputs
  const issue: CreateRepositoryTransferBody = JSON.parse(
    core.getInput('parsed_issue_body', {
      required: true
    })
  )

  core.info('Action Inputs')
  core.info(
    `  Current Organization: ${issue.create_repository_transfer_current_organization}`
  )
  core.info(
    `  Target Organization: ${issue.create_repository_transfer_target_organization}`
  )
  core.info(`  Repository Name: ${issue.create_repository_transfer_name}`)

  // If the organization name is not the same as the organization where this
  // action is running, we need to use the enterprise token.
  const octokit = new Octokit({
    auth:
      issue.create_repository_transfer_current_organization ===
      github.context.repo.owner
        ? process.env.GH_TOKEN
        : process.env.GH_ENTERPRISE_TOKEN
  })

  // Create the transfer request (when not in demo mode)
  if (!DEMO_MODE)
    await octokit.rest.repos.transfer({
      owner: issue.create_repository_transfer_current_organization,
      repo: issue.create_repository_transfer_name,
      new_owner: issue.create_repository_transfer_target_organization
    })

  // Add a comment to the issue
  await addComment(
    octokit,
    issueOps.organization,
    issueOps.repository,
    issueOps.issueNumber,
    `Transferred \`${issue.create_repository_transfer_name}\` from \`${issue.create_repository_transfer_current_organization} to \`${issue.create_repository_transfer_target_organization}\``
  )

  // Close the issue
  await closeIssue(
    octokit,
    issueOps.organization,
    issueOps.repository,
    issueOps.issueNumber
  )
}
