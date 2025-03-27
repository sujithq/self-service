import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/rest'
import IssueOps from '../data/issue-ops.json' assert { type: 'json' }
import { createRepository } from './organization/create-repository.js'
import {
  createActionsVariable,
  createAnnouncement,
  createProject,
  createRepositoryTransfer
} from './organization/index.js'
import {
  archiveRepository,
  changeRepositoryVisibility,
  renameRepository,
  unarchiveRepository
} from './repository/index.js'
import type { Action, IssueOpsMetadata } from './types.js'
import { getStatus, tagApprovers } from './utils/approvals'
import { getIssueOpsInputs } from './utils/inputs'
import { addComment, closeIssue } from './utils/issues'
import { DEMO_MODE } from './utils/mode.js'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  // If this action is running in the `issue-ops/self-service` repository, don't
  // actually do anything. This repository hosts the self-service page and
  // actions, but shouldn't actually run them!
  if (DEMO_MODE)
    core.info('Running in `issue-ops/self-service`...switching to demo mode!')

  // This Octokit instance only needs a token with access to the IssueOps
  // repository.
  const octokit = new Octokit({
    auth: process.env.GH_TOKEN
  })

  // Get the inputs that are passed to all actions.
  const issueOpsInputs = getIssueOpsInputs()

  // Get the action. This determines what function to run.
  const actionYaml = core.getInput('action', { required: true })
  const action = actionYaml.replace('.yml', '') as Action

  // Get the metadata for this IssueOps action.
  const metadata = (IssueOps as IssueOpsMetadata[]).filter(
    (a) => a.issueFormTemplate === actionYaml
  )[0]

  // Fail the workflow if the metadata is not found.
  if (metadata === undefined) return core.setFailed(`Unknown Action: ${action}`)

  // Tag the approvers. This should only happen when the issue is opened,
  // reopened, or edited.
  if (github.context.eventName === 'issues')
    tagApprovers(issueOpsInputs, metadata)

  // Get the list of missing approvers.
  const status = await getStatus(issueOpsInputs, metadata)

  if (status.state === 'approved') {
    // Request is approved, proceed with the action.
    core.info('Request approved! Running action...')

    // TODO: Make this dynamic? How would that affect bundling with rollup?
    if (action === 'archive-repository') await archiveRepository(issueOpsInputs)
    else if (action === 'change-repository-visibility')
      await changeRepositoryVisibility(issueOpsInputs)
    else if (action === 'create-actions-variable')
      await createActionsVariable(issueOpsInputs)
    else if (action === 'create-announcement')
      await createAnnouncement(issueOpsInputs)
    else if (action === 'create-project') await createProject(issueOpsInputs)
    else if (action === 'create-repository-transfer')
      await createRepositoryTransfer(issueOpsInputs)
    else if (action === 'create-repository')
      await createRepository(issueOpsInputs)
    else if (action === 'rename-repository')
      await renameRepository(issueOpsInputs)
    else if (action === 'unarchive-repository')
      await unarchiveRepository(issueOpsInputs)
    else core.setFailed(`Unknown Action: ${action}`)
  } else if (status.state === 'denied') {
    // The request was denied, notify the user and close the issue.
    core.info('Request denied! Closing issue...')

    // Add a comment to the issue
    await addComment(
      octokit,
      issueOpsInputs.organization,
      issueOpsInputs.repository,
      issueOpsInputs.issueNumber,
      'Request has been denied! Closing.'
    )

    // Close the issue
    await closeIssue(
      octokit,
      issueOpsInputs.organization,
      issueOpsInputs.repository,
      issueOpsInputs.issueNumber,
      'not_planned'
    )
  } else if (status.state === 'pending') {
    // The request is pending. Nothing to do...
    core.info('Request pending! Waiting for approval from the following...')
    core.info(`${status.pending.map((a) => `- ${a}`).join('\n')}`)
  }

  core.info('Action Complete!')
}
