import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/rest'
import { ChangeRepositoryVisibilityBody } from './types.js'
import { getIssueOpsInputs } from './utils/inputs.js'
import { addComment, closeIssue } from './utils/issues.js'
import { DEMO_MODE } from './utils/mode.js'

// TODO: If setting to public, this should require approval.

export async function changeRepositoryVisibility(): Promise<void> {
  const issueOps = getIssueOpsInputs()

  // Get the action inputs
  const issue: ChangeRepositoryVisibilityBody = JSON.parse(
    core.getInput('parsed_issue_body', {
      required: true
    })
  )

  core.info('Action Inputs')
  core.info(
    `  Organization: ${issue.change_repository_visibility_organization}`
  )
  core.info(`  Repository: ${issue.change_repository_visibility_name}`)
  core.info(`  Visibility: ${issue.change_repository_visibility_visibility}`)

  // If the organization name is not the same as the organization where this
  // action is running, we need to use the enterprise token.
  const octokit = new Octokit({
    auth:
      issue.change_repository_visibility_organization ===
      github.context.repo.owner
        ? process.env.GH_TOKEN
        : process.env.GH_ENTERPRISE_TOKEN
  })

  // Get the repository information
  const { data: repo } = await octokit.repos.get({
    owner: issue.change_repository_visibility_organization,
    repo: issue.change_repository_visibility_name
  })
  core.info(`Repository Information: ${JSON.stringify(repo)}`)

  // Rename the repository (when not in demo mode)
  if (!DEMO_MODE && repo.archived === false)
    await octokit.repos.update({
      owner: issue.change_repository_visibility_organization,
      repo: issue.change_repository_visibility_name,
      visibility:
        // Note: The `internal` visibility option is not included in the
        // TypeScript type definition for the `repos.update` method.
        issue.change_repository_visibility_visibility.toLowerCase() as
          | 'public'
          | 'private'
    })

  // Add a comment to the issue
  await addComment(
    octokit,
    issueOps.organization,
    issueOps.repository,
    issueOps.issueNumber,
    repo.archived === false
      ? `Set repository \`${issue.change_repository_visibility_organization}/${issue.change_repository_visibility_name}\` to \`${issue.change_repository_visibility_visibility}\` visibility`
      : `Repository \`${issue.change_repository_visibility_organization}/${issue.change_repository_visibility_name}\` is already \`${issue.change_repository_visibility_visibility}\` visibility`
  )

  // Close the issue
  await closeIssue(
    octokit,
    issueOps.organization,
    issueOps.repository,
    issueOps.issueNumber
  )
}
