import { Checkboxes } from '@github/issue-parser'

export type Action =
  | 'archive-repository'
  | 'change-repository-visibility'
  | 'create-announcement'
  | 'rename-repository'
  | 'unarchive-repository'

export type ArchiveRepositoryBody = {
  archive_repository_organization: string
  archive_repository_name: string
}

export type ChangeRepositoryVisibilityBody = {
  change_repository_visibility_organization: string
  change_repository_visibility_name: string
  change_repository_visibility_visibility:
    | 'internal'
    | 'Internal'
    | 'public'
    | 'Public'
    | 'private'
    | 'Private'
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
