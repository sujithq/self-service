import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/rest'
import { ArchiveRepositoryBody, IssueOpsInputs } from '../types.js'
import { addComment, closeIssue } from '../utils/issues.js'
import { DEMO_MODE } from '../utils/mode.js'

/**
 * Archive a repository.
 *
 * @param issueOpsInputs IssueOps Inputs
 * @returns Resolves when the action is complete.
 */
export async function archiveRepository(
  issueOpsInputs: IssueOpsInputs
): Promise<void> {
  // Get the action inputs
  const issue: ArchiveRepositoryBody = JSON.parse(
    core.getInput('parsed_issue_body', {
      required: true
    })
  )

  core.info('Action Inputs')
  core.info(`  Organization: ${issue.archive_repository_organization}`)
  core.info(`  Repository: ${issue.archive_repository_name}`)

  // If the organization name is not the same as the organization where this
  // action is running, we need to use the enterprise token.
  const octokit = new Octokit({
    auth:
      issue.archive_repository_organization === github.context.repo.owner
        ? process.env.GH_TOKEN
        : process.env.GH_ENTERPRISE_TOKEN
  })

  // Get the repository information
  const { data: repo } = await octokit.rest.repos.get({
    owner: issue.archive_repository_organization,
    repo: issue.archive_repository_name
  })
  core.info(`Repository Information: ${JSON.stringify(repo)}`)

  // Archive the repository (when not in demo mode)
  if (!DEMO_MODE() && repo.archived === false)
    await octokit.rest.repos.update({
      owner: issue.archive_repository_organization,
      repo: issue.archive_repository_name,
      archived: true
    })

  // Add a comment to the issue
  await addComment(
    octokit,
    issueOpsInputs.organization,
    issueOpsInputs.repository,
    issueOpsInputs.issueNumber,
    repo.archived === false
      ? `Archived repository \`${issue.archive_repository_organization}/${issue.archive_repository_name}\``
      : `Repository is already archived \`${issue.archive_repository_organization}/${issue.archive_repository_name}\``
  )

  // Close the issue
  await closeIssue(
    octokit,
    issueOpsInputs.organization,
    issueOpsInputs.repository,
    issueOpsInputs.issueNumber
  )
}
