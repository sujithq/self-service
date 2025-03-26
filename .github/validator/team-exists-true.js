/**
 * Passes validation if the GitHub team exists.
 *
 * https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/store-information-in-variables#defining-configuration-variables-for-multiple-workflows
 *
 * @param {string | string[] | {label: string; required: boolean }} field Input field
 * @returns {Promise<string>} An error message or `'success'`
 */
export default async (field) => {
  const github = await import('@actions/github')
  const { parseIssue } = await import('@github/issue-parser')
  const { Octokit } = await import('@octokit/rest')

  // Since this requires additional information from the issue, we need to get
  // and parse the issue body.
  const issue = parseIssue(github.context.payload.issue.body)

  // If the organization name is not the same as the organization where this
  // action is running, we need to use the enterprise token.
  const octokit = new Octokit({
    auth:
      issue.github_organization === github.context.repo.owner
        ? process.env.GH_TOKEN
        : process.env.GH_ENTERPRISE_TOKEN
  })

  try {
    // Check if the team exists
    await octokit.rest.teams.getByName({
      org: issue.github_organization,
      team_slug: field
    })

    return 'success'
  } catch (error) {
    if (error.status === 404) return `Team \`${field}\` does not exist`
    else throw error
  }
}
