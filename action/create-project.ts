import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/rest'
import { CreateProjectBody } from './types.js'
import { addComment, closeIssue } from './utils/issues.js'
import { DEMO_MODE } from './utils/mode.js'

export async function createProject(): Promise<void> {
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
  const parsedIssueBody: CreateProjectBody = JSON.parse(
    core.getInput('parsed_issue_body', {
      required: true
    })
  )

  core.info('IssueOps Inputs')
  core.info(`  Organization: ${issueOpsOrganization}`)
  core.info(`  Repository: ${issueOpsRepository}`)
  core.info(`  Issue Number: ${issueNumber}`)

  core.info('Action Inputs')
  core.info(`  Organization: ${parsedIssueBody.create_project_organization}`)
  core.info(`  Project Name: ${parsedIssueBody.create_project_title}`)
  core.info(`  Team: ${parsedIssueBody.create_project_team}`)
  core.info(`  Repository: ${parsedIssueBody.create_project_repository}`)

  // If the organization name is not the same as the organization where this
  // action is running, we need to use the enterprise token.
  const octokit = new Octokit({
    auth:
      parsedIssueBody.create_project_organization === github.context.repo.owner
        ? process.env.GH_TOKEN
        : process.env.GH_ENTERPRISE_TOKEN
  })

  // Get the organization ID
  const ownerId = (
    await octokit.rest.orgs.get({
      org: parsedIssueBody.create_project_organization
    })
  ).data.node_id

  // Get the repository ID
  const repoId = (
    await octokit.rest.repos.get({
      owner: parsedIssueBody.create_project_organization,
      repo: parsedIssueBody.create_project_repository
    })
  ).data.node_id

  // Get the team ID
  const teamId = (
    await octokit.rest.teams.getByName({
      org: parsedIssueBody.create_project_organization,
      team_slug: parsedIssueBody.create_project_team
    })
  ).data.id

  core.info('GitHub IDs')
  core.info(`  Owner ID: ${ownerId}`)
  core.info(`  Repo ID: ${repoId}`)
  core.info(`  Team ID: ${teamId}`)

  // Create the project (when not in demo mode)
  if (!DEMO_MODE)
    await octokit.graphql(
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
              id
            }
          }
        }
      `,
      {
        ownerId,
        repoId,
        teamId,
        title: parsedIssueBody.create_project_title
      }
    )

  // Add a comment to the issue
  await addComment(
    octokit,
    issueOpsOrganization,
    issueOpsRepository,
    issueNumber,
    `Created project \`${parsedIssueBody.create_project_title}`
  )

  core.info(`Created Project: ${parsedIssueBody.create_project_title}`)

  // Close the issue
  await closeIssue(
    octokit,
    issueOpsOrganization,
    issueOpsRepository,
    issueNumber
  )

  core.info('Action Complete!')
}
