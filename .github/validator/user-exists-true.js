/**
 * Passes validation if the GitHub user exists.
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
  const issue = parseIssue(github.context.payload.issue.body, undefined, {
    slugify: true
  })

  // If the organization name is not the same as the organization where this
  // action is running, we need to use the enterprise token.
  const octokit = new Octokit({
    auth:
      issue.github_organization === github.context.repo.owner
        ? process.env.GH_TOKEN
        : process.env.GH_ENTERPRISE_TOKEN
  })

  try {
    // Check if the user exists
    await octokit.rest.users.getByUsername({
      username: field
    })

    return 'success'
  } catch (error) {
    if (error.status === 404) return `User \`${field}\` does not exist`
    else throw error
  }
}
