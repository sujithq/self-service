import { jest } from '@jest/globals'
import * as core from '../../__fixtures__/@actions/core.js'
import * as github from '../../__fixtures__/@actions/github.js'
import * as octokit from '../../__fixtures__/@octokit/rest.js'

jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@actions/github', () => github)
jest.unstable_mockModule('@octokit/rest', () => {
  class Octokit {
    constructor() {
      return octokit
    }
  }

  return {
    Octokit
  }
})

const teams = await import('../../action/utils/teams.js')

const { Octokit } = await import('@octokit/rest')
const mocktokit = jest.mocked(new Octokit())

describe('isMember', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Returns true if the user is a member', async () => {
    mocktokit.rest.teams.getMembershipForUserInOrg.mockResolvedValue({
      status: 200
    } as any)

    const result = await teams.isMember(mocktokit, 'issue-ops/test', 'octokit')

    expect(result).toBe(true)
  })

  it('Returns false if the user is not a member', async () => {
    mocktokit.rest.teams.getMembershipForUserInOrg.mockRejectedValue({
      status: 404
    } as any)

    const result = await teams.isMember(mocktokit, 'issue-ops/test', 'octokit')

    expect(result).toBe(false)
  })

  it('Throws an error if the request fails', async () => {
    mocktokit.rest.teams.getMembershipForUserInOrg.mockRejectedValue({
      status: 500
    } as any)

    try {
      await teams.isMember(mocktokit, 'issue-ops/test', 'octokit')
    } catch (error) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(error).toEqual({
        status: 500
      })
    }
  })
})
