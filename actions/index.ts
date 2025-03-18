import * as core from '@actions/core'
import * as github from '@actions/github'
import { renameRepository } from './rename-repository.js'
import { Action } from './types.js'

let demoMode = false

// Get the action. This determines what function to run.
const action: Action = core
  .getInput('action', { required: true })
  .replace('.yml', '') as Action

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

if (action === 'rename-repository') await renameRepository(demoMode)
else core.setFailed(`Unknown Action: ${action}`)
