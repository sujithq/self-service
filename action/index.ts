import * as core from '@actions/core'
import { archiveRepository } from './archive-repository.js'
import { changeRepositoryVisibility } from './change-repository-visibility.js'
import { createActionsVariable } from './create-actions-variable.js'
import { createAnnouncement } from './create-announcement.js'
import { createProject } from './create-project.js'
import { createRepositoryTransfer } from './create-repository-transfer.js'
import { createRepository } from './create-repository.js'
import { renameRepository } from './rename-repository.js'
import { Action } from './types.js'
import { unarchiveRepository } from './unarchive-repository.js'
import { DEMO_MODE } from './utils/mode.js'

// If this action is running in the `issue-ops/self-service` repository, don't
// actually run anything. This repository hosts the self-service page and
// actions, but shouldn't actually run them.
if (DEMO_MODE)
  core.info('Running in `issue-ops/self-service`...switching to demo mode!')

// Get the action. This determines what function to run.
const action: Action = core
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
