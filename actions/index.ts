import * as core from '@actions/core'
import { createAnnouncement } from './create-announcement.js'
import { DEMO_MODE } from './mode.js'
import { renameRepository } from './rename-repository.js'
import { Action } from './types.js'

// If this action is running in the `issue-ops/self-service` repository, don't
// actually run anything. This repository hosts the self-service page and
// actions, but shouldn't actually run them.
if (DEMO_MODE)
  core.info('Running in `issue-ops/self-service`...switching to demo mode!')

// Get the action. This determines what function to run.
const action: Action = core
  .getInput('action', { required: true })
  .replace('.yml', '') as Action

if (action === 'create-announcement') await createAnnouncement()
else if (action === 'rename-repository') await renameRepository()
else core.setFailed(`Unknown Action: ${action}`)
