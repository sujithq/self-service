import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/rest'
import type { CreateRepositoryTransferBody, IssueOpsInputs } from '../types.js'
import { addComment, closeIssue } from '../utils/issues.js'
import { DEMO_MODE } from '../utils/mode.js'

/**
 * Create a repository transfer request.
 *
 * @param issueOpsInputs IssueOps Inputs
 * @returns Resolves when the action is complete.
 */
export async function createRepositoryTransfer(
  issueOpsInputs: IssueOpsInputs
): Promise<void> {
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
        : process.env.GH_ENTERPRISE_TOKEN,
    baseUrl: core.getInput('api_url', { required: true })
  })

  // Create the transfer request (when not in demo mode)
  if (!DEMO_MODE())
    await octokit.rest.repos.transfer({
      owner: issue.create_repository_transfer_current_organization,
      repo: issue.create_repository_transfer_name,
      new_owner: issue.create_repository_transfer_target_organization
    })

  // Add a comment to the issue
  await addComment(
    octokit,
    issueOpsInputs.organization,
    issueOpsInputs.repository,
    issueOpsInputs.issueNumber,
    `Transferred \`${issue.create_repository_transfer_name}\` from \`${issue.create_repository_transfer_current_organization} to \`${issue.create_repository_transfer_target_organization}\``
  )

  // Close the issue
  await closeIssue(
    octokit,
    issueOpsInputs.organization,
    issueOpsInputs.repository,
    issueOpsInputs.issueNumber
  )
}
