import { Octokit } from '@octokit/rest'

/**
 * Checks if a user is a member of a team.
 *
 * @param octokit Octokit Instance
 * @param team Team Name/Slug
 * @param user User
 * @returns Whether the user is a member of the team
 */
export async function isMember(
  octokit: Octokit,
  team: string,
  user: string
): Promise<boolean> {
  try {
    await octokit.rest.teams.getMembershipForUserInOrg({
      org: team.split('/')[0],
      team_slug: team.split('/')[1],
      username: user
    })

    return true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.status === 404) return false
    throw error
  }
}
