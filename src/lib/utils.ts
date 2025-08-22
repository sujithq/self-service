import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Build a URL to open a new GitHub Issue in the repository hosting this portal
 * using a specific issue form template and label.
 *
 * Owner/Repo resolution strategy:
 * - If NEXT_PUBLIC_GH_OWNER/NEXT_PUBLIC_GH_REPO are set, use them.
 * - Otherwise, derive from the GitHub Pages URL:
 *   - owner = hostname up to `.github.io` (e.g., `sujithq`)
 *   - repo = first pathname segment (e.g., `/self-service/...` -> `self-service`)
 */
export function getIssueCreationUrl(args: {
  issueFormTemplate: string
  labels: string | string[]
  owner?: string
  repo?: string
}): string {
  const envOwner =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_GH_OWNER) ||
    undefined
  const envRepo =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_GH_REPO) ||
    undefined

  let owner = args.owner || envOwner
  let repo = args.repo || envRepo

  if (!owner || !repo) {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname // e.g., sujithq.github.io
      const path = window.location.pathname // e.g., /self-service/...
      const hostPrefix = host.endsWith('.github.io')
        ? host.replace(/\.github\.io$/, '')
        : host.split('.')[0]
      const firstSeg = path.split('/').filter(Boolean)[0] || 'self-service'
      owner = owner || hostPrefix
      repo = repo || firstSeg
    }
  }

  const labelsArray = Array.isArray(args.labels) ? args.labels : [args.labels]
  const params = new URLSearchParams({
    template: args.issueFormTemplate,
    labels: labelsArray.join(',')
  })
  return `https://github.com/${owner}/${repo}/issues/new?${params.toString()}`
}
