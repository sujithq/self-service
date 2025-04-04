import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/rest'
import type { IssueOpsInputs, UnarchiveRepositoryBody } from '../types.js'
import { addComment, closeIssue } from '../utils/issues.js'
import { DEMO_MODE } from '../utils/mode.js'

/**
 * Unarchive a repository.
 *
 * @param issueOpsInputs IssueOps Inputs
 * @returns Resolves when the action is complete.
 */
export async function unarchiveRepository(
  issueOpsInputs: IssueOpsInputs
): Promise<void> {
  // Get the action inputs
  const issue: UnarchiveRepositoryBody = JSON.parse(
    core.getInput('parsed_issue_body', {
      required: true
    })
  )

  core.info('Action Inputs')
  core.info(`  Organization: ${issue.unarchive_repository_organization}`)
  core.info(`  Repository: ${issue.unarchive_repository_name}`)

  // If the organization name is not the same as the organization where this
  // action is running, we need to use the enterprise token.
  const octokit = new Octokit({
    auth:
      issue.unarchive_repository_organization === github.context.repo.owner
        ? process.env.GH_TOKEN
        : process.env.GH_ENTERPRISE_TOKEN
  })

  // Get the repository information
  const { data: repo } = await octokit.rest.repos.get({
    owner: issue.unarchive_repository_organization,
    repo: issue.unarchive_repository_name
  })
  core.info(`Repository Information: ${JSON.stringify(repo)}`)

  // Unarchive the repository (when not in demo mode and the repository is
  // currently archived)
  if (!DEMO_MODE() && repo.archived === true)
    await octokit.rest.repos.update({
      owner: issue.unarchive_repository_organization,
      repo: issue.unarchive_repository_name,
      archived: false
    })

  // Add a comment to the issue
  await addComment(
    octokit,
    issueOpsInputs.organization,
    issueOpsInputs.repository,
    issueOpsInputs.issueNumber,
    repo.archived === false
      ? `Unarchived repository \`${issue.unarchive_repository_organization}/${issue.unarchive_repository_name}\``
      : `Repository is already unarchived \`${issue.unarchive_repository_organization}/${issue.unarchive_repository_name}\``
  )

  // Close the issue
  await closeIssue(
    octokit,
    issueOpsInputs.organization,
    issueOpsInputs.repository,
    issueOpsInputs.issueNumber
  )
}
