'use client'

// Badge primitives for Bugs Finder, mirroring components/tasks/task-badge.jsx
// so a bug row and a task row read the same way.

import {
  BUG_STATUS_LABELS, BUG_STATUS_COLORS,
  BUG_SEVERITY_LABELS, BUG_SEVERITY_COLORS,
  BUG_PRIORITY_SHORT, BUG_PRIORITY_LABELS, BUG_PRIORITY_COLORS,
  BUG_ENVIRONMENT_LABELS,
} from '@/constants/bugs'
import { cn } from '@/utils'

const BASE = 'inline-flex items-center text-xs px-2 py-0.5 rounded-md font-medium whitespace-nowrap'

export function BugStatusBadge({ status, className }) {
  return (
    <span className={cn(BASE, BUG_STATUS_COLORS[status] || BUG_STATUS_COLORS.open, className)}>
      {BUG_STATUS_LABELS[status] || status}
    </span>
  )
}

export function BugSeverityBadge({ severity, className }) {
  return (
    <span className={cn(BASE, BUG_SEVERITY_COLORS[severity] || BUG_SEVERITY_COLORS.medium, className)}>
      {BUG_SEVERITY_LABELS[severity] || severity}
    </span>
  )
}

export function BugPriorityBadge({ priority, className }) {
  return (
    <span
      className={cn(BASE, BUG_PRIORITY_COLORS[priority] || BUG_PRIORITY_COLORS.p2, className)}
      // The short form (P1) fits the table; the full label lives in the tooltip
      // so the meaning is still reachable.
      title={BUG_PRIORITY_LABELS[priority] || priority}
    >
      {BUG_PRIORITY_SHORT[priority] || priority}
    </span>
  )
}

export function BugEnvironmentBadge({ environment, className }) {
  return (
    <span className={cn(BASE, 'bg-slate-100 text-muted-foreground', className)}>
      {BUG_ENVIRONMENT_LABELS[environment] || environment}
    </span>
  )
}
