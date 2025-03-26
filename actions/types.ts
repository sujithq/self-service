import { Checkboxes } from '@github/issue-parser'

export type Action =
  | 'archive-repository'
  | 'change-repository-visibility'
  | 'create-announcement'
  | 'create-actions-variable'
  | 'rename-repository'
  | 'unarchive-repository'

export type ArchiveRepositoryBody = {
  archive_repository_organization: string
  archive_repository_name: string
}

export type ChangeRepositoryVisibilityBody = {
  change_repository_visibility_organization: string
  change_repository_visibility_name: string
  change_repository_visibility_visibility: 'internal' | 'public' | 'private'
}

export type CreateActionsVariableBody = {
  create_actions_variable_organization: string
  create_actions_variable_name: string
  create_actions_variable_value: string
  create_actions_variable_visibility: 'all' | 'private' | 'selected'
  create_actions_variable_repository_names: string
}

export type CreateAnnouncementBody = {
  create_announcement_organization: string
  create_announcement_markdown: string
  create_announcement_expiration_date: string
  create_announcement_user_dismissible: Checkboxes
}

export type RenameRepositoryBody = {
  rename_repository_organization: string
  rename_repository_current_name: string
  rename_repository_new_name: string
}

export type UnarchiveRepositoryBody = {
  unarchive_repository_organization: string
  unarchive_repository_name: string
}
