import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/rest'
import { CreateRepositoryTransferBody } from './types.js'
import { addComment, closeIssue } from './utils/issues.js'
import { DEMO_MODE } from './utils/mode.js'

export async function createRepositoryTransfer(): Promise<void> {
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
  const parsedIssueBody: CreateRepositoryTransferBody = JSON.parse(
    core.getInput('parsed_issue_body', {
      required: true
    })
  )

  core.info('IssueOps Inputs')
  core.info(`  Organization: ${issueOpsOrganization}`)
  core.info(`  Repository: ${issueOpsRepository}`)
  core.info(`  Issue Number: ${issueNumber}`)

  core.info('Action Inputs')
  core.info(
    `  Current Organization: ${parsedIssueBody.create_repository_transfer_current_organization}`
  )
  core.info(
    `  Target Organization: ${parsedIssueBody.create_repository_transfer_target_organization}`
  )
  core.info(
    `  Repository Name: ${parsedIssueBody.create_repository_transfer_name}`
  )

  // If the organization name is not the same as the organization where this
  // action is running, we need to use the enterprise token.
  const octokit = new Octokit({
    auth:
      parsedIssueBody.create_repository_transfer_current_organization ===
      github.context.repo.owner
        ? process.env.GH_TOKEN
        : process.env.GH_ENTERPRISE_TOKEN
  })

  // Create the transfer request (when not in demo mode)
  if (!DEMO_MODE)
    await octokit.rest.repos.transfer({
      owner: parsedIssueBody.create_repository_transfer_current_organization,
      repo: parsedIssueBody.create_repository_transfer_name,
      new_owner: parsedIssueBody.create_repository_transfer_target_organization
    })

  // Add a comment to the issue
  await addComment(
    octokit,
    issueOpsOrganization,
    issueOpsRepository,
    issueNumber,
    `Transferred \`${parsedIssueBody.create_repository_transfer_name}\` from \`${parsedIssueBody.create_repository_transfer_current_organization} to \`${parsedIssueBody.create_repository_transfer_target_organization}\``
  )

  core.info(
    `Transferred \`${parsedIssueBody.create_repository_transfer_name}\` from \`${parsedIssueBody.create_repository_transfer_current_organization} to \`${parsedIssueBody.create_repository_transfer_target_organization}\``
  )

  // Close the issue
  await closeIssue(
    octokit,
    issueOpsOrganization,
    issueOpsRepository,
    issueNumber
  )

  core.info('Action Complete!')
}
