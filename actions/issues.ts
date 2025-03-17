/**
 * Utility functions for working with issues
 */
import * as core from '@actions/core'
import { Octokit } from '@octokit/rest'

/**
 * Adds a comment to an issue
 *
 * @param octokit Octokit instance
 * @param organization Organization where the issue is located
 * @param repository Repository where the issue is located
 * @param issueNumber Issue number
 * @param comment Comment to add
 */
export async function addComment(
  octokit: Octokit,
  organization: string,
  repository: string,
  issueNumber: number,
  comment: string
): Promise<void> {
  core.info(`Adding Comment: ${organization}/${repository} #${issueNumber}`)

  await octokit.issues.createComment({
    owner: organization,
    repo: repository,
    issue_number: issueNumber,
    body: comment
  })

  core.info(`Added Comment: ${organization}/${repository} #${issueNumber}`)
}

/**
 * Closes an issue
 */
export async function closeIssue(
  octokit: Octokit,
  organization: string,
  repository: string,
  issueNumber: number
): Promise<void> {
  core.info(`Closing Issue: ${organization}/${repository} #${issueNumber}`)

  await octokit.issues.update({
    owner: organization,
    repo: repository,
    issue_number: issueNumber,
    state: 'closed'
  })

  core.info(`Closed Issue: ${organization}/${repository} #${issueNumber}`)
}
