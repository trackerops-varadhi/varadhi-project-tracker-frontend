'use client'

/**
 * The sidebar's second line: the product, then the workspace.
 *
 * It opens on "Project Tracker" — what the app is — and three seconds later
 * slides up to the signed-in role's workspace ("Admin Workspace", "HR
 * Workspace", ...) — where in the app you are. The delay is the point: the
 * product name is readable on arrival, and the swap happens once the sidebar
 * has settled, so it reads as the app introducing itself rather than as a
 * label that loaded wrong and corrected itself.
 *
 * Both lines are stacked in one 1rem-tall box (`text-xs` line height), so the
 * logo block never reflows mid-animation. The outgoing line is aria-hidden as
 * it leaves, so a screen reader is told the workspace once, not both names.
 *
 * A role with no workspace name keeps "Project Tracker" and never animates:
 * there is nothing to swap to, so the product name is the final state rather
 * than a placeholder.
 */

import { useEffect, useState } from 'react'

import { WORKSPACE_LABELS } from '@/constants'
import { cn } from '@/utils'

const PRODUCT_NAME = 'Project Tracker'
const SWAP_DELAY_MS = 3000

// Same transition on both lines, so they cross over together instead of one
// arriving before the other has left. motion-reduce drops the movement for
// anyone who has asked the OS for less animation; the text still swaps.
const LINE =
  'absolute inset-x-0 top-0 block truncate transition-all duration-500 ease-out motion-reduce:transition-none'

export function WorkspaceWordmark({ role, className }) {
  const workspace = WORKSPACE_LABELS[String(role || '').toLowerCase()]

  // Holds the label that has animated in, not a boolean: if the role changes
  // (a different user signs in without a remount) `swapped` no longer matches
  // the new workspace, so the line falls back to the product name and the
  // three seconds run again for the new one.
  const [swapped, setSwapped] = useState(null)
  const showWorkspace = Boolean(workspace) && swapped === workspace

  useEffect(() => {
    if (!workspace) return
    const timer = setTimeout(() => setSwapped(workspace), SWAP_DELAY_MS)
    return () => clearTimeout(timer)
  }, [workspace])

  return (
    <span className={cn('relative block h-4 overflow-hidden', className)}>
      <span
        aria-hidden={showWorkspace ? 'true' : undefined}
        className={cn(LINE, showWorkspace ? '-translate-y-2 opacity-0' : 'translate-y-0 opacity-100')}
      >
        {PRODUCT_NAME}
      </span>

      {workspace && (
        <span
          aria-hidden={showWorkspace ? undefined : 'true'}
          className={cn(LINE, showWorkspace ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0')}
        >
          {workspace}
        </span>
      )}
    </span>
  )
}
