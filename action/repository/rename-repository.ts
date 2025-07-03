import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/rest'
import type { IssueOpsInputs, RenameRepositoryBody } from '../types.js'
import { addComment, closeIssue } from '../utils/issues.js'
import { DEMO_MODE } from '../utils/mode.js'

/**
 * Rename a repository.
 *
 * @param issueOpsInputs IssueOps Inputs
 * @returns Resolves when the action is complete.
 */
export async function renameRepository(
  issueOpsInputs: IssueOpsInputs
): Promise<void> {
  // Get the action inputs
  const issue: RenameRepositoryBody = JSON.parse(
    core.getInput('parsed_issue_body', {
      required: true
    })
  )

  core.info('Action Inputs')
  core.info(`  Organization: ${issue.rename_repository_organization}`)
  core.info(`  Repository: ${issue.rename_repository_current_name}`)
  core.info(`  New Name: ${issue.rename_repository_new_name}`)

  // If the organization name is not the same as the organization where this
  // action is running, we need to use the enterprise token.
  const octokit = new Octokit({
    auth:
      issue.rename_repository_organization === github.context.repo.owner
        ? process.env.GH_TOKEN
        : process.env.GH_ENTERPRISE_TOKEN,
    baseUrl: core.getInput('api_url', { required: true })
  })

  // Get the repository information
  const { data: repo } = await octokit.rest.repos.get({
    owner: issue.rename_repository_organization,
    repo: issue.rename_repository_current_name
  })
  core.info(`Repository Information: ${JSON.stringify(repo)}`)

  // Rename the repository (when not in demo mode and the name is different)
  if (!DEMO_MODE() && repo.name !== issue.rename_repository_new_name)
    await octokit.rest.repos.update({
      owner: issue.rename_repository_organization,
      repo: issue.rename_repository_current_name,
      name: issue.rename_repository_new_name
    })

  // Add a comment to the issue
  await addComment(
    octokit,
    issueOpsInputs.organization,
    issueOpsInputs.repository,
    issueOpsInputs.issueNumber,
    repo.name !== issue.rename_repository_new_name
      ? `Renamed repository \`${issue.rename_repository_organization}/${issue.rename_repository_current_name}\` to [\`${issue.rename_repository_organization}/${issue.rename_repository_new_name}\`](https://github.com/${issue.rename_repository_organization}/${issue.rename_repository_new_name})`
      : `Repository is already named [\`${issue.rename_repository_organization}/${issue.rename_repository_new_name}\`](https://github.com/${issue.rename_repository_organization}/${issue.rename_repository_new_name})`
  )

  // Close the issue
  await closeIssue(
    octokit,
    issueOpsInputs.organization,
    issueOpsInputs.repository,
    issueOpsInputs.issueNumber
  )
}
