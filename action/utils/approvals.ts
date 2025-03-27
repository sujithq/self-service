import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/rest'
import { dedent } from 'ts-dedent'
import type {
  IssueOpsInputs,
  IssueOpsMetadata,
  RequestStatus
} from '../types.js'
import { addComment } from './issues.js'
import { isMember } from './teams.js'

/**
 * Add a comment to the issue requesting approval.
 *
 * @param issueOpsInputs IssueOps Inputs
 * @param metadata IssueOps Metadata
 * @returns Resolves when the comment is added.
 */
export async function tagApprovers(
  issueOpsInputs: IssueOpsInputs,
  metadata: IssueOpsMetadata
): Promise<void> {
  if (metadata.approvers.length === 0)
    return core.info('No approvals required!')

  // Comment on the issue and tag the approvers.
  const approvers = metadata.approvers
    .map((a) => `- ${!a.includes('@') ? '@' : ''}${a}`)
    .join('\n')

  let comment = dedent`This request requires approval from the following users and/or teams. Please note that the user who created the issue is not able to approve their own requests.
  
  ${approvers}

  To approve this request, add \`/approve\` as a comment.

  To deny this request, add \`/deny\` as a comment.`

  // If this issue is being reopened or edited, we should also indicate that any
  // previous approvals are no longer valid.
  if (['reopened', 'edited'].includes(github.context.payload.action as string))
    comment += dedent`

    > [!NOTE]
    >
    > This request has been ${github.context.payload.action}! Previous approvals are no longer valid. Please re-approve this request.`

  await addComment(
    new Octokit({
      auth: process.env.GH_TOKEN
    }),
    issueOpsInputs.organization,
    issueOpsInputs.repository,
    issueOpsInputs.issueNumber,
    comment
  )
}

/**
 * Get the status of the request.
 *
 * This will check if the request has been approved or denied by the approvers.
 * If the request has not been approved or denied, it will return the list of
 * pending approvers.
 *
 * This takes into account when the issue is opened, reopened, or edited. If the
 * issue has been reopened or edited, it will only include approvals from
 * **AFTER** the last time it was reopened or edited.
 *
 * @param issueOpsInputs IssueOps Inputs
 * @param metadata IssueOps Metadata
 * @returns Resolves with the status of the request.
 */
export async function getStatus(
  issueOpsInputs: IssueOpsInputs,
  metadata: IssueOpsMetadata
): Promise<RequestStatus> {
  const octokit = new Octokit({
    auth: process.env.GH_TOKEN
  })

  // If no approvals are required, return an empty array.
  if (metadata.approvers.length === 0)
    return {
      state: 'approved'
    }

  // Keep track of the approvals since the last opened/reopened/edited event.
  let pending: string[] = metadata.approvers.map((a) => a.replaceAll('@', ''))

  // Get the timeline events for the issue, sorted by date. If the event does
  // not have a date, ignore it for sorting purposes.
  const timeline = (
    await octokit.paginate(octokit.rest.issues.listEventsForTimeline, {
      owner: issueOpsInputs.organization,
      repo: issueOpsInputs.repository,
      issue_number: issueOpsInputs.issueNumber
    })
  ).sort((a, b) => {
    if (!('created_at' in a) || !('created_at' in b)) return 0

    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })

  // Iterate through the timeline events and check for approvals, denials, or
  // changes to the issue that would require a reset of the approvals.
  for (const event of timeline) {
    // Skip any events that are not used.
    if (!['commented', 'edited', 'reopened'].includes(event.event as string))
      continue

    // If the event is the issue being reopened or edited, reset the approvals.
    if (['edited', 'reopened'].includes(event.event as string)) {
      pending = metadata.approvers.map((a) => a.replaceAll('@', ''))
      continue
    }

    // Skip events if there is no comment body.
    if (!('body' in event)) continue

    // Skip events if the body is not `/approve` or `/deny`.
    if (event.body !== '/approve' && event.body !== '/deny') continue

    // Check if the user is an approver (handle is in the approver list).
    const approver = pending.find((a) => a === event.user.login)
    if (approver)
      if (event.body === '/approve')
        // Approved. Remove them from the pending list.
        pending = pending.filter((a) => a !== approver)
      else if (event.body === '/deny')
        // Denied. Set the state to denied and stop.
        return {
          state: 'denied'
        }

    // Check if the user is a member of an approval team. However, skip this
    // if the user who created the issue is the same as the user who commented.
    // This is to prevent a user from approving their own request unless they
    // are explicitly listed as an approver by handle (not team).
    if (event.user.login === github.context.payload.issue?.user.login) continue

    for (const team of pending.filter((a) => a.includes('/'))) {
      if (await isMember(octokit, team, event.user.login))
        if (event.body === '/approve')
          // Approved. Remove them from the pending list.
          pending = pending.filter((a) => a !== team)
        else if (event.body === '/deny')
          // Denied. Set the state to denied and stop.
          return {
            state: 'denied'
          }
    }
  }

  // If there are no pending approvers, set the state to approved. Otherwise,
  // set the state to pending.
  return pending.length === 0
    ? { state: 'approved' }
    : { state: 'pending', pending }
}
