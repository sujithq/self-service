import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/rest'
import { CreateActionsVariableBody } from './types.js'
import { addComment, closeIssue } from './utils/issues.js'
import { DEMO_MODE } from './utils/mode.js'

export async function createActionsVariable(): Promise<void> {
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
  const parsedIssueBody: CreateActionsVariableBody = JSON.parse(
    core.getInput('parsed_issue_body', {
      required: true
    })
  ) as CreateActionsVariableBody

  const repositories = parsedIssueBody.create_actions_variable_repository_names
    .split(/[\s,\n]+/)
    .filter((repository) => repository.trim() !== '')

  core.info('IssueOps Inputs')
  core.info(`  Organization: ${issueOpsOrganization}`)
  core.info(`  Repository: ${issueOpsRepository}`)
  core.info(`  Issue Number: ${issueNumber}`)

  core.info('Action Inputs')
  core.info(
    `  Organization: ${parsedIssueBody.create_actions_variable_organization}`
  )
  core.info(`  Variable Name: ${parsedIssueBody.create_actions_variable_name}`)
  core.info(
    `  Variable Value: ${parsedIssueBody.create_actions_variable_value}`
  )
  core.info(
    `  Visibility: ${parsedIssueBody.create_actions_variable_visibility}`
  )
  core.info(`  Repositories: ${repositories.join(', ')}`)

  // If the organization name is not the same as the organization where this
  // action is running, we need to use the enterprise token.
  const octokit = new Octokit({
    auth:
      parsedIssueBody.create_actions_variable_organization ===
      github.context.repo.owner
        ? process.env.GH_TOKEN
        : process.env.GH_ENTERPRISE_TOKEN
  })

  // If the visibility is 'selected', we need to get the repository IDs.
  const repositoryIds = await Promise.all(
    repositories.map(async (repo) => {
      const { data: repoData } = await octokit.rest.repos.get({
        owner: parsedIssueBody.create_actions_variable_organization,
        repo
      })
      return repoData.id
    })
  )

  // Create the variable (when not in demo mode)
  if (!DEMO_MODE)
    if (parsedIssueBody.create_actions_variable_visibility === 'selected')
      await octokit.rest.actions.createOrgVariable({
        org: parsedIssueBody.create_actions_variable_organization,
        name: parsedIssueBody.create_actions_variable_name,
        value: parsedIssueBody.create_actions_variable_value,
        visibility: parsedIssueBody.create_actions_variable_visibility,
        selected_repository_ids: repositoryIds
      })
    else
      await octokit.rest.actions.createOrgVariable({
        org: parsedIssueBody.create_actions_variable_organization,
        name: parsedIssueBody.create_actions_variable_name,
        value: parsedIssueBody.create_actions_variable_value,
        visibility: parsedIssueBody.create_actions_variable_visibility
      })

  // Add a comment to the issue
  await addComment(
    octokit,
    issueOpsOrganization,
    issueOpsRepository,
    issueNumber,
    `Created organization variable \`${parsedIssueBody.create_actions_variable_name}`
  )

  core.info(
    `Created Organization Variable: ${parsedIssueBody.create_actions_variable_name}`
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
