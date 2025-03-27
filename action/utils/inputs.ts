import * as core from '@actions/core'
import type { IssueOpsInputs } from '../types'

/**
 * Gets the inputs for the IssueOps action.
 *
 * These inputs are used for all actions, regardless of other inputs.
 *
 * @returns The inputs for the IssueOps action.
 */
export function getIssueOpsInputs(): IssueOpsInputs {
  const organization = core.getInput('issue_ops_organization', {
    required: true
  })
  const repository = core.getInput('issue_ops_repository', {
    required: true
  })
  const issueNumber = parseInt(
    core.getInput('issue_number', {
      required: true
    }),
    10
  )

  core.info('IssueOps Inputs')
  core.info(`  Organization: ${organization}`)
  core.info(`  Repository: ${repository}`)
  core.info(`  Issue Number: ${issueNumber}`)

  return {
    organization,
    repository,
    issueNumber
  }
}
