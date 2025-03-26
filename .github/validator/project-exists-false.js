/**
 * Passes validation if the GitHub project does not exist.
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

  // Check if the project exists (the REST API does not support ProjectsV2).
  const response = await octokit.graphql(
    `
      query($org: String!, $proj: String!, $cursor: String) {
        organization(login: $org) {
          projectsV2(query: $proj, first: 1, after: $cursor) {
            nodes {
              id
            }
          }
        }
      }
    `,
    {
      org: issue.github_organization,
      proj: field
    }
  )

  return response.organization.projectsV2.nodes.length === 0
    ? 'success'
    : `Project \`${field}\` already exists`
}
