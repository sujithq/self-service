import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/rest'
import { ChangeRepositoryVisibilityBody } from './types.js'
import { addComment, closeIssue } from './utils/issues.js'
import { DEMO_MODE } from './utils/mode.js'

// TODO: If setting to public, this should require approval.

export async function changeRepositoryVisibility(): Promise<void> {
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
  const parsedIssueBody: ChangeRepositoryVisibilityBody = JSON.parse(
    core.getInput('parsed_issue_body', {
      required: true
    })
  ) as ChangeRepositoryVisibilityBody

  core.info('IssueOps Inputs')
  core.info(`  Organization: ${issueOpsOrganization}`)
  core.info(`  Repository: ${issueOpsRepository}`)
  core.info(`  Issue Number: ${issueNumber}`)

  core.info('Action Inputs')
  core.info(
    `  Organization: ${parsedIssueBody.change_repository_visibility_organization}`
  )
  core.info(
    `  Repository: ${parsedIssueBody.change_repository_visibility_name}`
  )
  core.info(
    `  Visibility: ${parsedIssueBody.change_repository_visibility_visibility}`
  )

  // If the organization name is not the same as the organization where this
  // action is running, we need to use the enterprise token.
  const octokit = new Octokit({
    auth:
      parsedIssueBody.change_repository_visibility_organization ===
      github.context.repo.owner
        ? process.env.GH_TOKEN
        : process.env.GH_ENTERPRISE_TOKEN
  })

  // Get the repository information
  const { data: repo } = await octokit.repos.get({
    owner: parsedIssueBody.change_repository_visibility_organization,
    repo: parsedIssueBody.change_repository_visibility_name
  })
  core.info(`Repository Information: ${JSON.stringify(repo)}`)

  // Rename the repository (when not in demo mode)
  if (!DEMO_MODE && repo.archived === false)
    await octokit.repos.update({
      owner: parsedIssueBody.change_repository_visibility_organization,
      repo: parsedIssueBody.change_repository_visibility_name,
      visibility:
        // Note: The `internal` visibility option is not included in the
        // TypeScript type definition for the `repos.update` method.
        parsedIssueBody.change_repository_visibility_visibility.toLowerCase() as
          | 'public'
          | 'private'
    })

  // Add a comment to the issue
  await addComment(
    octokit,
    issueOpsOrganization,
    issueOpsRepository,
    issueNumber,
    repo.archived === false
      ? `Set repository \`${parsedIssueBody.change_repository_visibility_organization}/${parsedIssueBody.change_repository_visibility_name}\` to \`${parsedIssueBody.change_repository_visibility_visibility}\` visibility`
      : `Repository \`${parsedIssueBody.change_repository_visibility_organization}/${parsedIssueBody.change_repository_visibility_name}\` is already \`${parsedIssueBody.change_repository_visibility_visibility}\` visibility`
  )

  core.info(
    `Set Repository Visibility: ${parsedIssueBody.change_repository_visibility_organization}/${parsedIssueBody.change_repository_visibility_name} to ${parsedIssueBody.change_repository_visibility_visibility}`
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
