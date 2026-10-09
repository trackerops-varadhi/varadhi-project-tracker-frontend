'use client'

import { Bug, Paperclip, AlertTriangle } from 'lucide-react'

import { cn, formatDate } from '@/utils'

// Role workspaces: a bug reaches its developer as a task in their ordinary
// task list. These pieces make such a task unmistakably a bug — distinct
// colour, bug key and severity — while it sits in the same list as tasks.

const SEVERITY_CLASS = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-slate-100 text-slate-700',
}

/** Compact "BUG-1042 · High" mark for list rows and kanban cards. */
export function BugMark({ bug, className }) {
  if (!bug) return null
  return (
    <span
      title={`${bug.key}: ${bug.title} (${bug.statusLabel})`}
      className={cn('inline-flex max-w-full items-center gap-1 rounded-md border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-700', className)}
    >
      <Bug aria-hidden="true" className="h-3 w-3 shrink-0" />
      <span className="truncate">{bug.key}</span>
      <span className={cn('rounded px-1 text-[10px] capitalize', SEVERITY_CLASS[bug.severity])}>{bug.severity}</span>
    </span>
  )
}

/** The full bug context on the task detail page. */
export function BugDetailsPanel({ bug }) {
  if (!bug) return null
  return (
    <section aria-labelledby="bug-details-title" className="rounded-xl border border-red-200 bg-red-50/50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="bug-details-title" className="flex items-center gap-1.5 text-sm font-semibold text-red-800">
          <Bug aria-hidden="true" className="h-4 w-4" /> This task is a bug fix — {bug.key}
        </h2>
        <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-semibold capitalize', SEVERITY_CLASS[bug.severity])}>{bug.severity}</span>
        <span className="rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-600 ring-1 ring-slate-200">Bug status: {bug.statusLabel}</span>
        <span className="rounded bg-white px-1.5 py-0.5 text-[10px] capitalize text-slate-600 ring-1 ring-slate-200">{bug.environment}</span>
        {bug.slaBreached && (
          <span className="inline-flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            <AlertTriangle aria-hidden="true" className="h-3 w-3" /> SLA breached
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-slate-600">
        Reported by {bug.reporter?.name ?? 'QC'}{bug.slaDueAt ? ` · fix due ${formatDate(bug.slaDueAt, 'dd MMM yyyy, h:mm a')}` : ''}.
        Move this task to <strong>In Progress</strong> when you start and <strong>Completed</strong> when it is fixed — QC is then asked to verify.
      </p>
      {bug.stepsToReproduce && (
        <div className="mt-3">
          <p className="text-[11px] font-semibold text-slate-700">Steps to reproduce</p>
          <p className="mt-0.5 whitespace-pre-wrap text-xs text-slate-700">{bug.stepsToReproduce}</p>
        </div>
      )}
      {bug.attachments?.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] font-semibold text-slate-700">Attachments</p>
          <ul className="mt-1 flex flex-wrap gap-2">
            {bug.attachments.map((a) => (
              <li key={a.id}>
                <a href={a.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 hover:border-primary hover:text-primary">
                  <Paperclip aria-hidden="true" className="h-3 w-3" /> {a.fileName}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
