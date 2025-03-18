export type Action = 'rename-repository'

export type RenameRepositoryBody = {
  rename_repository_organization: string
  rename_repository_current_name: string
  rename_repository_new_name: string
}
