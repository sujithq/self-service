/**
 * Passes validation if the repository does not exist.
 *
 * @param {string | string[] | {label: string; required: boolean }} field Input field
 * @returns {Promise<string>} An error message or `'success'`
 */
export default async (field) => {
  const { Octokit } = await import('@octokit/rest')

  // If the organization name is not the same as the organization where this
  // action is running, we need to use the enterprise token.
  const octokit = new Octokit({
    auth:
      process.env.ORGANIZATION === github.context.repo.owner
        ? process.env.GH_TOKEN
        : process.env.GH_ENTERPRISE_TOKEN
  })

  try {
    // Check if the repository exists
    await octokit.rest.repos.get({
      owner: process.env.ORGANIZATION,
      repo: field
    })

    return `Repository \`${field}\` already exists`
  } catch (error) {
    if (error.status === 404) return 'success'
    else throw error
  }
}
