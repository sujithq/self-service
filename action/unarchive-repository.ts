import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/rest'
import { UnarchiveRepositoryBody } from './types.js'
import { addComment, closeIssue } from './utils/issues.js'
import { DEMO_MODE } from './utils/mode.js'

export async function unarchiveRepository(): Promise<void> {
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
  const parsedIssueBody: UnarchiveRepositoryBody = JSON.parse(
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
    `  Organization: ${parsedIssueBody.unarchive_repository_organization}`
  )
  core.info(`  Repository: ${parsedIssueBody.unarchive_repository_name}`)

  // If the organization name is not the same as the organization where this
  // action is running, we need to use the enterprise token.
  const octokit = new Octokit({
    auth:
      parsedIssueBody.unarchive_repository_organization ===
      github.context.repo.owner
        ? process.env.GH_TOKEN
        : process.env.GH_ENTERPRISE_TOKEN
  })

  // Get the repository information
  const { data: repo } = await octokit.repos.get({
    owner: parsedIssueBody.unarchive_repository_organization,
    repo: parsedIssueBody.unarchive_repository_name
  })
  core.info(`Repository Information: ${JSON.stringify(repo)}`)

  // Unarchive the repository (when not in demo mode and the repository is
  // currently archived)
  if (!DEMO_MODE && repo.archived === true)
    await octokit.repos.update({
      owner: parsedIssueBody.unarchive_repository_organization,
      repo: parsedIssueBody.unarchive_repository_name,
      archived: false
    })

  // Add a comment to the issue
  await addComment(
    octokit,
    issueOpsOrganization,
    issueOpsRepository,
    issueNumber,
    repo.archived === false
      ? `Unarchived repository \`${parsedIssueBody.unarchive_repository_organization}/${parsedIssueBody.unarchive_repository_name}\``
      : `Repository is already unarchived \`${parsedIssueBody.unarchive_repository_organization}/${parsedIssueBody.unarchive_repository_name}\``
  )

  core.info(
    `Unarchived Repository: ${parsedIssueBody.unarchive_repository_organization}/${parsedIssueBody.unarchive_repository_name}`
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
