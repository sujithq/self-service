import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/rest'
import { ArchiveRepositoryBody } from './types.js'
import { addComment, closeIssue } from './utils/issues.js'
import { DEMO_MODE } from './utils/mode.js'

export async function archiveRepository(): Promise<void> {
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
  const parsedIssueBody: ArchiveRepositoryBody = JSON.parse(
    core.getInput('parsed_issue_body', {
      required: true
    })
  ) as ArchiveRepositoryBody

  core.info('IssueOps Inputs')
  core.info(`  Organization: ${issueOpsOrganization}`)
  core.info(`  Repository: ${issueOpsRepository}`)
  core.info(`  Issue Number: ${issueNumber}`)

  core.info('Action Inputs')
  core.info(
    `  Organization: ${parsedIssueBody.archive_repository_organization}`
  )
  core.info(`  Repository: ${parsedIssueBody.archive_repository_name}`)

  // If the organization name is not the same as the organization where this
  // action is running, we need to use the enterprise token.
  const octokit = new Octokit({
    auth:
      parsedIssueBody.archive_repository_organization ===
      github.context.repo.owner
        ? process.env.GH_TOKEN
        : process.env.GH_ENTERPRISE_TOKEN
  })

  // Get the repository information
  const { data: repo } = await octokit.repos.get({
    owner: parsedIssueBody.archive_repository_organization,
    repo: parsedIssueBody.archive_repository_name
  })
  core.info(`Repository Information: ${JSON.stringify(repo)}`)

  // Rename the repository (when not in demo mode)
  if (!DEMO_MODE && repo.archived === false)
    await octokit.repos.update({
      owner: parsedIssueBody.archive_repository_organization,
      repo: parsedIssueBody.archive_repository_name,
      archived: true
    })

  // Add a comment to the issue
  await addComment(
    octokit,
    issueOpsOrganization,
    issueOpsRepository,
    issueNumber,
    repo.archived === false
      ? `Archived repository \`${parsedIssueBody.archive_repository_organization}/${parsedIssueBody.archive_repository_name}\``
      : `Repository is already archived \`${parsedIssueBody.archive_repository_organization}/${parsedIssueBody.archive_repository_name}\``
  )

  core.info(
    `Archived Repository: ${parsedIssueBody.archive_repository_organization}/${parsedIssueBody.archive_repository_name}`
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
