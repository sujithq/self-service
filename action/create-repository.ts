import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/rest'
import { CreateRepositoryBody } from './types.js'
import { addComment, closeIssue } from './utils/issues.js'
import { DEMO_MODE } from './utils/mode.js'

export async function createRepository(): Promise<void> {
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
  const parsedIssueBody: CreateRepositoryBody = JSON.parse(
    core.getInput('parsed_issue_body', {
      required: true
    })
  )

  core.info('IssueOps Inputs')
  core.info(`  Organization: ${issueOpsOrganization}`)
  core.info(`  Repository: ${issueOpsRepository}`)
  core.info(`  Issue Number: ${issueNumber}`)

  core.info('Action Inputs')
  core.info(`  Organization: ${parsedIssueBody.create_repository_organization}`)
  core.info(`  Repository Name: ${parsedIssueBody.create_repository_name}`)
  core.info(`  Description: ${parsedIssueBody.create_repository_description}`)
  core.info(`  Visibility: ${parsedIssueBody.create_repository_visibility}`)
  core.info(`  Auto-Init: ${parsedIssueBody.create_repository_auto_init}`)

  // If the organization name is not the same as the organization where this
  // action is running, we need to use the enterprise token.
  const octokit = new Octokit({
    auth:
      parsedIssueBody.create_repository_organization ===
      github.context.repo.owner
        ? process.env.GH_TOKEN
        : process.env.GH_ENTERPRISE_TOKEN
  })

  // Create the repository (when not in demo mode)
  if (!DEMO_MODE)
    await octokit.rest.repos.createInOrg({
      org: parsedIssueBody.create_repository_organization,
      name: parsedIssueBody.create_repository_name,
      description: parsedIssueBody.create_repository_description,
      visibility: parsedIssueBody.create_repository_visibility as
        | 'public'
        | 'private',
      auto_init:
        parsedIssueBody.create_repository_auto_init.selected.includes('Enable')
    })

  // Add a comment to the issue
  await addComment(
    octokit,
    issueOpsOrganization,
    issueOpsRepository,
    issueNumber,
    `Created repository \`${parsedIssueBody.create_repository_organization}/${parsedIssueBody.create_repository_name}\``
  )

  core.info(
    `Created Repository: \`${parsedIssueBody.create_repository_organization}/${parsedIssueBody.create_repository_name}\``
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
