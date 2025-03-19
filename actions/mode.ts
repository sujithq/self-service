import * as github from '@actions/github'

export const DEMO_MODE =
  github.context.repo.owner === 'issue-ops' &&
  github.context.repo.repo === 'self-service'
    ? true
    : false
