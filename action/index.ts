import * as core from '@actions/core'
import { createRepository } from './organization/create-repository.js'
import {
  createActionsVariable,
  createAnnouncement,
  createProject,
  createRepositoryTransfer
} from './organization/index.js'
import {
  archiveRepository,
  changeRepositoryVisibility,
  renameRepository,
  unarchiveRepository
} from './repository/index.js'
import type { Action } from './types.js'
import { DEMO_MODE } from './utils/mode.js'

// If this action is running in the `issue-ops/self-service` repository, don't
// actually run anything. This repository hosts the self-service page and
// actions, but shouldn't actually run them.
if (DEMO_MODE)
  core.info('Running in `issue-ops/self-service`...switching to demo mode!')

// Get the action. This determines what function to run.
const action = core
  .getInput('action', { required: true })
  .replace('.yml', '') as Action

if (action === 'archive-repository') await archiveRepository()
else if (action === 'change-repository-visibility')
  await changeRepositoryVisibility()
else if (action === 'create-actions-variable') await createActionsVariable()
else if (action === 'create-announcement') await createAnnouncement()
else if (action === 'create-project') await createProject()
else if (action === 'create-repository-transfer')
  await createRepositoryTransfer()
else if (action === 'create-repository') await createRepository()
else if (action === 'rename-repository') await renameRepository()
else if (action === 'unarchive-repository') await unarchiveRepository()
else core.setFailed(`Unknown Action: ${action}`)

core.info('Action Complete!')
