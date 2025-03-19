import { Checkboxes } from '@github/issue-parser'

export type Action = 'create-announcement' | 'rename-repository'

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
