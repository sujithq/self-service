import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/rest'
import type {
  CreateOrganizationInvitationBody,
  IssueOpsInputs
} from '../types.js'
import { addComment, closeIssue } from '../utils/issues.js'
import { DEMO_MODE } from '../utils/mode.js'

/**
 * Create an organization invitation.
 *
 * @param issueOpsInputs IssueOps Inputs
 * @returns Resolves when the action is complete.
 */
export async function createOrganizationInvitation(
  issueOpsInputs: IssueOpsInputs
): Promise<void> {
  // Get the action inputs
  const issue: CreateOrganizationInvitationBody = JSON.parse(
    core.getInput('parsed_issue_body', {
      required: true
    })
  )

  core.info('Action Inputs')
  core.info(
    `  Organization: ${issue.create_organization_invitation_organization}`
  )
  core.info(`  Handle: ${issue.create_organization_invitation_handle}`)
  core.info(`  Role: ${issue.create_organization_invitation_role}`)

  // If the organization name is not the same as the organization where this
  // action is running, we need to use the enterprise token.
  const octokit = new Octokit({
    auth:
      issue.create_organization_invitation_organization ===
      github.context.repo.owner
        ? process.env.GH_TOKEN
        : process.env.GH_ENTERPRISE_TOKEN
  })

  // Check if there is a pending invitation for this user
  const pendingInvitation = (
    await octokit.paginate(octokit.rest.orgs.listPendingInvitations, {
      org: issue.create_organization_invitation_organization,
      role: issue.create_organization_invitation_role[0]
        .toLowerCase()
        .replaceAll(' ', '_') as any
    })
  ).find(
    (invitation) =>
      invitation.login === issue.create_organization_invitation_handle
  )

  // Get the user's ID
  const user = await octokit.rest.users.getByUsername({
    username: issue.create_organization_invitation_handle
  })

  // Create the invitation (when not in demo mode)
  if (!DEMO_MODE() && !pendingInvitation)
    await octokit.rest.orgs.createInvitation({
      org: issue.create_organization_invitation_organization,
      invitee_id: user.data.id,
      role: issue.create_organization_invitation_role[0]
        .toLowerCase()
        .replaceAll(' ', '_') as any
    })

  // Add a comment to the issue
  await addComment(
    octokit,
    issueOpsInputs.organization,
    issueOpsInputs.repository,
    issueOpsInputs.issueNumber,
    pendingInvitation
      ? `User \`${issue.create_organization_invitation_handle}\` already has a pending invitation.`
      : `Invited \`${issue.create_organization_invitation_handle}\` to the organization \`${issue.create_organization_invitation_organization}\` as \`${issue.create_organization_invitation_role[0]}\`.`
  )

  // Close the issue
  await closeIssue(
    octokit,
    issueOpsInputs.organization,
    issueOpsInputs.repository,
    issueOpsInputs.issueNumber
  )
}
