import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/rest'
import { CreateActionsVariableBody } from '../types.js'
import { getIssueOpsInputs } from '../utils/inputs.js'
import { addComment, closeIssue } from '../utils/issues.js'
import { DEMO_MODE } from '../utils/mode.js'

export async function createActionsVariable(): Promise<void> {
  const issueOps = getIssueOpsInputs()

  // Get the action inputs
  const issue: CreateActionsVariableBody = JSON.parse(
    core.getInput('parsed_issue_body', {
      required: true
    })
  )

  const repositories = issue.create_actions_variable_repository_names
    .split(/[\s,\n]+/)
    .filter((repository) => repository.trim() !== '')

  core.info('Action Inputs')
  core.info(`  Organization: ${issue.create_actions_variable_organization}`)
  core.info(`  Variable Name: ${issue.create_actions_variable_name}`)
  core.info(`  Variable Value: ${issue.create_actions_variable_value}`)
  core.info(`  Visibility: ${issue.create_actions_variable_visibility}`)
  core.info(`  Repositories: ${repositories.join(', ')}`)

  // If the organization name is not the same as the organization where this
  // action is running, we need to use the enterprise token.
  const octokit = new Octokit({
    auth:
      issue.create_actions_variable_organization === github.context.repo.owner
        ? process.env.GH_TOKEN
        : process.env.GH_ENTERPRISE_TOKEN
  })

  // If the visibility is 'selected', we need to get the repository IDs.
  const repositoryIds = await Promise.all(
    repositories.map(async (repo) => {
      const { data: repoData } = await octokit.rest.repos.get({
        owner: issue.create_actions_variable_organization,
        repo
      })
      return repoData.id
    })
  )

  // Create the variable (when not in demo mode)
  if (!DEMO_MODE)
    if (issue.create_actions_variable_visibility === 'selected')
      await octokit.rest.actions.createOrgVariable({
        org: issue.create_actions_variable_organization,
        name: issue.create_actions_variable_name,
        value: issue.create_actions_variable_value,
        visibility: issue.create_actions_variable_visibility,
        selected_repository_ids: repositoryIds
      })
    else
      await octokit.rest.actions.createOrgVariable({
        org: issue.create_actions_variable_organization,
        name: issue.create_actions_variable_name,
        value: issue.create_actions_variable_value,
        visibility: issue.create_actions_variable_visibility
      })

  // Add a comment to the issue
  await addComment(
    octokit,
    issueOps.organization,
    issueOps.repository,
    issueOps.issueNumber,
    `Created organization variable [\`${issue.create_actions_variable_name}\`](https://github.com/organizations/${issue.create_actions_variable_organization}/settings/variables/actions)`
  )

  // Close the issue
  await closeIssue(
    octokit,
    issueOps.organization,
    issueOps.repository,
    issueOps.issueNumber
  )
}
