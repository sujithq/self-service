import * as octokit from '../@octokit/rest.js'

export const getOctokit = () => octokit

export const context = {
  runId: 1234,
  job: 'job-name',
  payload: {},
  repo: {
    owner: 'issue-ops',
    repo: 'self-service'
  }
}
