import * as Icons from 'lucide-react'
import { type LucideIcon } from 'lucide-react'
import IssueOps from '../data/issue-ops.json'
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
}[] = IssueOps.map((issueOp) => ({
  assignees: issueOp.assignees as string[],
  category: issueOp.category as Category,
  description: issueOp.description as string,
  icon: Icons[issueOp.icon as keyof typeof Icons] as LucideIcon,
  issueFormTemplate: issueOp.issueFormTemplate as string,
  issueTitle: issueOp.issueTitle as string,
  labels: issueOp.labels as string[],
  name: issueOp.name as string
}))
