import { MarkGithubIcon } from '@primer/octicons-react'
import {
  ArrowLeftRight,
  BookDashed,
  BookLock,
  BookUp2,
  Building,
  FolderSync,
  GitBranch,
  SquareKanban,
  Variable,
  Volume2,
  type LucideIcon
} from 'lucide-react'
import { Category } from './enums'

// For icons, see: https://lucide.dev/icons

/**
 * Maintains the list of available IssueOps operations.
 *
 * This is used to generate the list of operations in the Self-Service UI.
 */
export const AvailableIssueOps: {
  assignees: string[]
  category: Category
  description: string
  icon: LucideIcon
  issueFormTemplate: string
  issueTitle: string
  labels: string[]
  name: string
}[] = [
  {
    assignees: [],
    category: Category.ENTERPRISE,
    description:
      'Create a new organization. Requires enterprise admin approval.',
    icon: Building,
    issueFormTemplate: 'create-organization.yml',
    issueTitle: '[IssueOps] Create a new organization',
    labels: ['create-organization'],
    name: 'Organization'
  },
  {
    assignees: [],
    category: Category.ENTERPRISE,
    description: 'Create a new GitHub App. Requires enterprise admin approval.',
    icon: MarkGithubIcon as LucideIcon,
    issueFormTemplate: 'create-github-app.yml',
    issueTitle: '[IssueOps] Create a new GitHub App',
    labels: ['create-github-app'],
    name: 'GitHub App'
  },
  {
    assignees: [],
    category: Category.ENTERPRISE,
    description: 'Migrate your data. Requires human interaction to complete.',
    icon: ArrowLeftRight,
    issueFormTemplate: 'create-migration.yml',
    issueTitle: '[IssueOps] Create a data migration',
    labels: ['create-migration'],
    name: 'Data Migration'
  },
  {
    assignees: [],
    category: Category.ORGANIZATION,
    description: 'Create an organization announcement banner.',
    icon: Volume2,
    issueFormTemplate: 'create-announcement.yml',
    issueTitle: '[IssueOps] Create a new announcement',
    labels: ['create-announcement'],
    name: 'Announcement'
  },
  {
    assignees: [],
    category: Category.ORGANIZATION,
    description:
      'Create a project for your organization users and repositories.',
    icon: SquareKanban,
    issueFormTemplate: 'create-project.yml',
    issueTitle: '[IssueOps] Create a new project',
    labels: ['create-project'],
    name: 'Project'
  },
  {
    assignees: [],
    category: Category.ORGANIZATION,
    description:
      'Create an organization variable to use in your GitHub Actions workflows.',
    icon: Variable,
    issueFormTemplate: 'create-actions-variable.yml',
    issueTitle: '[IssueOps] Create a new GitHub Actions variable',
    labels: ['create-actions-variable'],
    name: 'GitHub Actions Variable'
  },
  {
    assignees: [],
    category: Category.ORGANIZATION,
    description: 'Transfer a repository. Requires enterprise admin approval.',
    icon: FolderSync,
    issueFormTemplate: 'create-repository-transfer.yml',
    issueTitle: '[IssueOps] Create a new repository transfer',
    labels: ['create-repository-transfer'],
    name: 'Repository Transfer'
  },
  {
    assignees: [],
    category: Category.REPOSITORY,
    description: 'Create a new repository in your organization.',
    icon: BookDashed,
    issueFormTemplate: 'create-repository.yml',
    issueTitle: '[IssueOps] Create a new repository',
    labels: ['create-repository'],
    name: 'Create Repository'
  },
  {
    assignees: [],
    category: Category.REPOSITORY,
    description:
      'Archive a repository in your organization, converting it to read-only.',
    icon: BookLock,
    issueFormTemplate: 'archive-repository.yml',
    issueTitle: '[IssueOps] Archive a repository',
    labels: ['archive-repository'],
    name: 'Archive Repository'
  },
  {
    assignees: [],
    category: Category.REPOSITORY,
    description: 'Create a new branch protection rule for your repository.',
    icon: GitBranch,
    issueFormTemplate: 'create-branch-protection.yml',
    issueTitle: '[IssueOps] Create a new branch protection rule',
    labels: ['create-branch-protection'],
    name: 'Branch Protection Rule'
  },
  {
    assignees: [],
    category: Category.REPOSITORY,
    description: 'Create new branch ruleset for your repository.',
    icon: GitBranch,
    issueFormTemplate: 'create-branch-ruleset.yml',
    issueTitle: '[IssueOps] Create a new branch ruleset',
    labels: ['create-branch-ruleset'],
    name: 'Branch Ruleset'
  },
  {
    assignees: [],
    category: Category.REPOSITORY,
    description: 'Change the visibility of your repository.',
    icon: BookUp2,
    issueFormTemplate: 'change-repository-visibility.yml',
    issueTitle: '[IssueOps] Change the visibility of a repository',
    labels: ['change-repository-visibility'],
    name: 'Change Visibility'
  }
]
