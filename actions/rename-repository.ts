import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/rest'
import { DEMO_MODE } from './index.js'
import { RenameRepositoryBody } from './types.js'
import { addComment, closeIssue } from './utils/issues.js'

export async function renameRepository(): Promise<void> {
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
  const parsedIssueBody: RenameRepositoryBody = JSON.parse(
    core.getInput('parsed_issue_body', {
      required: true
    })
  ) as RenameRepositoryBody

  core.info('IssueOps Inputs')
  core.info(`  Organization: ${issueOpsOrganization}`)
  core.info(`  Repository: ${issueOpsRepository}`)
  core.info(`  Issue Number: ${issueNumber}`)

  core.info('Action Inputs')
  core.info(`  Organization: ${parsedIssueBody.rename_repository_organization}`)
  core.info(`  Repository: ${parsedIssueBody.rename_repository_current_name}`)
  core.info(`  New Name: ${parsedIssueBody.rename_repository_new_name}`)

  // If the organization name is not the same as the organization where this
  // action is running, we need to use the enterprise token.
  const octokit = new Octokit({
    auth:
      parsedIssueBody.rename_repository_organization ===
      github.context.repo.owner
        ? process.env.GH_TOKEN
        : process.env.GH_ENTERPRISE_TOKEN
  })

  // Get the repository information
  const { data: repo } = await octokit.repos.get({
    owner: parsedIssueBody.rename_repository_organization,
    repo: parsedIssueBody.rename_repository_current_name
  })
  core.info(`Repository Information: ${JSON.stringify(repo)}`)

  // Rename the repository (when not in demo mode)
  if (repo.name !== parsedIssueBody.rename_repository_new_name && !DEMO_MODE)
    await octokit.repos.update({
      owner: parsedIssueBody.rename_repository_organization,
      repo: parsedIssueBody.rename_repository_current_name,
      name: parsedIssueBody.rename_repository_new_name
    })

  // Add a comment to the issue
  await addComment(
    octokit,
    issueOpsOrganization,
    issueOpsRepository,
    issueNumber,
    repo.name !== parsedIssueBody.rename_repository_new_name
      ? `Renamed repository \`${parsedIssueBody.rename_repository_organization}/${parsedIssueBody.rename_repository_current_name}\` to \`${parsedIssueBody.rename_repository_organization}/${parsedIssueBody.rename_repository_new_name}\``
      : `Repository is already named \`${parsedIssueBody.rename_repository_organization}/${parsedIssueBody.rename_repository_new_name}\``
  )

  core.info(
    `Renamed Repository: ${parsedIssueBody.rename_repository_current_name} -> ${parsedIssueBody.rename_repository_new_name}`
  )

  // Close the issue
  await closeIssue(
    octokit,
    issueOpsOrganization,
    issueOpsRepository,
    issueNumber
  )

  core.setOutput('new_name', parsedIssueBody.rename_repository_new_name)
  core.info('Action Complete!')
}
