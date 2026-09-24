import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils'

import {
  TASK_STATUS_COLORS,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_COLORS,
  TASK_PRIORITY_LABELS,
  TASK_TYPE_COLORS,
  TASK_TYPE_LABELS,
} from '@/constants'

/* =========================================================
   STATUS BADGE
========================================================= */

export function StatusBadge({ status }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        `
          h-auto
          border-0
          shrink
          inline-flex
          max-w-full
          items-center
          justify-center
          whitespace-nowrap
          rounded-md
          px-1.5
          py-[1px]
          text-[7px]
          font-medium
          leading-[9px]
        `,
        TASK_STATUS_COLORS[status]
      )}
    >
      {TASK_STATUS_LABELS[status] || status || '—'}
    </Badge>
  )
}

/* =========================================================
   PRIORITY BADGE
========================================================= */

export function PriorityBadge({ priority }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        `
          h-auto
          border-0
          shrink
          inline-flex
          max-w-full
          items-center
          justify-center
          whitespace-nowrap
          rounded-md
          px-1.5
          py-[1px]
          text-[7px]
          font-medium
          leading-[9px]
        `,
        TASK_PRIORITY_COLORS[priority]
      )}
    >
      {TASK_PRIORITY_LABELS[priority] || priority || '—'}
    </Badge>
  )
}

/* =========================================================
   TYPE BADGE
========================================================= */

export function TypeBadge({ type }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        `
          h-auto
          border-0
          shrink
          inline-flex
          max-w-full
          items-center
          justify-center
          whitespace-nowrap
          rounded-md
          px-1.5
          py-[1px]
          text-[7px]
          font-medium
          leading-[9px]
        `,
        TASK_TYPE_COLORS[type]
      )}
    >
      {TASK_TYPE_LABELS[type] || type || '—'}
    </Badge>
  )
}