import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/rest'
import { addComment, closeIssue } from '../issues.js'

export async function run(): Promise<void> {
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
  const organization: string = core.getInput('organization', {
    required: true
  })
  const repository: string = core.getInput('repository', {
    required: true
  })
  const newName: string = core.getInput('new_name', {
    required: true
  })

  core.info('IssueOps Inputs')
  core.info(`  Organization: ${issueOpsOrganization}`)
  core.info(`  Repository: ${issueOpsRepository}`)
  core.info(`  Issue Number: ${issueNumber}`)

  core.info('Action Inputs')
  core.info(`  Organization: ${organization}`)
  core.info(`  Repository: ${repository}`)
  core.info(`  New Name: ${newName}`)

  // If the organization name is not the same as the organization where this
  // action is running, we need to use the enterprise token.
  const octokit = new Octokit({
    auth:
      organization === github.context.repo.owner
        ? process.env.GH_TOKEN
        : process.env.GH_ENTERPRISE_TOKEN
  })

  // Get the repository information
  const { data: repo } = await octokit.repos.get({
    owner: organization,
    repo: repository
  })
  core.info(`Repository Information: ${JSON.stringify(repo)}`)

  // Rename the repository
  if (repo.name !== newName)
    await octokit.repos.update({
      owner: organization,
      repo: repository,
      name: newName
    })

  // Add a comment to the issue
  await addComment(
    octokit,
    issueOpsOrganization,
    issueOpsRepository,
    issueNumber,
    repo.name !== newName
      ? `Renamed repository \`${organization}/${repository}\` to \`${organization}/${newName}\``
      : `Repository is already named \`${organization}/${newName}\``
  )

  core.info(`Renamed Repository: ${repository} -> ${newName}`)

  // Close the issue
  await closeIssue(
    octokit,
    issueOpsOrganization,
    issueOpsRepository,
    issueNumber
  )

  core.setOutput('new_name', newName)
  core.info('Action Complete!')
}
