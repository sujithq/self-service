/**
 * Passes validation if the repository does exist.
 *
 * @param {string | string[] | {label: string; required: boolean }} field Input field
 * @returns {Promise<string>} An error message or `'success'`
 */
export default async (field) => {
  const { Octokit } = await import('@octokit/rest')
  const github = await import('@actions/github')

  // If the organization name is not the same as the organization where this
  // action is running, we need to use the enterprise token.
  const octokit = new Octokit({
    auth:
      process.env.ORGANIZATION === github.context.repo.owner
        ? process.env.GH_TOKEN
        : process.env.GH_ENTERPRISE_TOKEN
  })

  console.log('Validating repository exists')
  console.log(`Field: ${field}`)
  console.log(`Organization: ${process.env.ORGANIZATION}`)
  console.log(`Owner: ${github.context.repo.owner}`)
  console.log(process.env.ORGANIZATION === github.context.repo.owner)
  try {
    // Check if the repository exists
    await octokit.rest.repos.get({
      owner: process.env.ORGANIZATION,
      repo: field
    })

    return 'success'
  } catch (error) {
    if (error.status === 404) return `Repository \`${field}\` does not exist`
    else throw error
  }
}
