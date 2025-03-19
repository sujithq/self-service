import * as core from '@actions/core'
import * as github from '@actions/github'
import { renameRepository } from './rename-repository.js'
import { Action } from './types.js'

export const DEMO_MODE =
  github.context.repo.owner === 'issue-ops' &&
  github.context.repo.repo === 'self-service'
    ? true
    : false

// If this action is running in the `issue-ops/self-service` repository, don't
// actually run anything. This repository hosts the self-service page and
// actions, but shouldn't actually run them.
if (DEMO_MODE)
  core.info('Running in `issue-ops/self-service`...switching to demo mode!')

// Get the action. This determines what function to run.
const action: Action = core
  .getInput('action', { required: true })
  .replace('.yml', '') as Action

if (action === 'create-announcement') await renameRepository()
else if (action === 'rename-repository') await renameRepository()
else core.setFailed(`Unknown Action: ${action}`)
