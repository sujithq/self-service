/**
 * Utility functions for working with issues
 */
import * as core from '@actions/core'
import { Octokit } from '@octokit/rest'

/**
 * Adds a comment to an issue
 *
 * @param octokit Octokit Instance
 * @param organization Organization
 * @param repository Repository
 * @param issueNumber Issue Number
 * @param comment Comment Body
 * @returns Resolves when the action is complete.
 */
export async function addComment(
  octokit: Octokit,
  organization: string,
  repository: string,
  issueNumber: number,
  comment: string
): Promise<void> {
  core.info(`Adding Comment: ${organization}/${repository} #${issueNumber}`)

  await octokit.rest.issues.createComment({
    owner: organization,
    repo: repository,
    issue_number: issueNumber,
    body: comment
  })

  core.info(`Added Comment: ${organization}/${repository} #${issueNumber}`)
}

/**
 * Closes an issue
 *
 * @param octokit Octokit Instance
 * @param organization Organization
 * @param repository Repository
 * @param issueNumber Issue Number
 * @param reason Reason for Closure
 * @returns Resolves when the action is complete.
 */
export async function closeIssue(
  octokit: Octokit,
  organization: string,
  repository: string,
  issueNumber: number,
  reason: 'completed' | 'not_planned' = 'completed'
): Promise<void> {
  core.info(`Closing Issue: ${organization}/${repository} #${issueNumber}`)

  await octokit.rest.issues.update({
    owner: organization,
    repo: repository,
    issue_number: issueNumber,
    state: 'closed',
    state_reason: reason
  })

  core.info(`Closed Issue: ${organization}/${repository} #${issueNumber}`)
}
