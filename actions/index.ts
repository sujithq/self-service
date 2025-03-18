import * as core from '@actions/core'
import { run as renameRepository } from './rename-repository.js'

// Get the action. This determines what function to run.
const action = core.getInput('action', { required: true })

switch (action) {
  case 'rename-repository':
    renameRepository()
    break
  default:
    core.setFailed(`Unknown action: ${action}`)
    break
}
