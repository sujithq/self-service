import * as core from '@actions/core'
import * as github from '@actions/github'
import { run as renameRepository } from './rename-repository.js'

let demoMode = false

// Get the action. This determines what function to run.
const action = core.getInput('action', { required: true })

// If this actions is running in the `issue-ops/self-service` repository, don't
// actually run anything. This repository hosts the self-service page and
// actions, but shouldn't actually run them.
if (
  github.context.repo.owner === 'issue-ops' &&
  github.context.repo.repo === 'self-service'
) {
  core.info('Running in `issue-ops/self-service`...switching to demo mode!')
  demoMode = true
}

switch (action) {
  case 'rename-repository':
    renameRepository(demoMode)
    break
  default:
    core.setFailed(`Unknown action: ${action}`)
    break
}
