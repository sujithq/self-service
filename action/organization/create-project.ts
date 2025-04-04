import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/rest'
import type { CreateProjectBody, IssueOpsInputs } from '../types.js'
import { addComment, closeIssue } from '../utils/issues.js'
import { DEMO_MODE } from '../utils/mode.js'

/**
 * Create a organization project.
 *
 * @param issueOpsInputs IssueOps Inputs
 * @returns Resolves when the action is complete.
 */
export async function createProject(
  issueOpsInputs: IssueOpsInputs
): Promise<void> {
  // Get the action inputs
  const issue: CreateProjectBody = JSON.parse(
    core.getInput('parsed_issue_body', {
      required: true
    })
  )

  core.info('Action Inputs')
  core.info(`  Organization: ${issue.create_project_organization}`)
  core.info(`  Project Name: ${issue.create_project_title}`)
  core.info(`  Team: ${issue.create_project_team}`)
  core.info(`  Repository: ${issue.create_project_repository}`)

  // If the organization name is not the same as the organization where this
  // action is running, we need to use the enterprise token.
  const octokit = new Octokit({
    auth:
      issue.create_project_organization === github.context.repo.owner
        ? process.env.GH_TOKEN
        : process.env.GH_ENTERPRISE_TOKEN
  })

  // Get the organization ID
  const ownerId = (
    await octokit.rest.orgs.get({
      org: issue.create_project_organization
    })
  ).data.node_id

  // Get the repository ID
  const repoId = (
    await octokit.rest.repos.get({
      owner: issue.create_project_organization,
      repo: issue.create_project_repository
    })
  ).data.node_id

  // Get the team ID
  const teamId = (
    await octokit.rest.teams.getByName({
      org: issue.create_project_organization,
      team_slug: issue.create_project_team
    })
  ).data.id

  core.info('GitHub IDs')
  core.info(`  Owner ID: ${ownerId}`)
  core.info(`  Repo ID: ${repoId}`)
  core.info(`  Team ID: ${teamId}`)

  // Create the project (when not in demo mode)
  let projectNumber = 3 // Fall back to 3 for demo mode
  if (!DEMO_MODE()) {
    const response: {
      data: { createProjectV2: { projectV2: { number: number } } }
    } = await octokit.graphql(
      `
        mutation($ownerId: ID!, $repoId: ID!, $teamId: ID!, $title: String!) {
          createProjectV2(
            input: {
              organizationId: $ownerId
              repositoryId: $repoId
              teamId: $teamId
              title: $title
            }
          ) {
            projectV2 {
              number
            }
          }
        }
      `,
      {
        ownerId,
        repoId,
        teamId,
        title: issue.create_project_title
      }
    )

    projectNumber = response.data.createProjectV2.projectV2.number
  }

  // Add a comment to the issue
  await addComment(
    octokit,
    issueOpsInputs.organization,
    issueOpsInputs.repository,
    issueOpsInputs.issueNumber,
    `Created project [\`${issue.create_project_title}\`](https://github.com/orgs/${issue.create_project_organization}/projects/${projectNumber})`
  )

  // Close the issue
  await closeIssue(
    octokit,
    issueOpsInputs.organization,
    issueOpsInputs.repository,
    issueOpsInputs.issueNumber
  )
}
