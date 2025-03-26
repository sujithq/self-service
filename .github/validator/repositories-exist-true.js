/**
 * Passes validation if all the repositories exist.
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

  // Split the field into an array (by newlines and commas) and remove any
  // whitespace or empty strings.
  const repositories = field
    .split(/[\s,\n]+/)
    .filter((repository) => repository.trim() !== '')

  for (const repository of repositories) {
    try {
      // Check if the repository exists
      await octokit.rest.repos.get({
        owner: issue.github_organization,
        repo: repository
      })
    } catch (error) {
      if (error.status === 404)
        return `Repository \`${repository}\` does not exist`
      else throw error
    }
  }

  return 'success'
}
