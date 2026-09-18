'use client'

import { CalendarCheck, CalendarDays, FolderOpen, MessagesSquare } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const MOCK_ACTIONS = [
  {
    id: 'attendance',
    title: 'Attendance',
    summary: '112 present ? 3 late',
    details: [
      ['Present today', '112 employees'],
      ['Late arrivals', '3 employees'],
      ['Attendance rate', '87.5%'],
    ],
  },
  {
    id: 'leave',
    title: 'Leave Management',
    summary: '9 employees on leave',
    details: [
      ['Planned leave', '3 employees'],
      ['Unplanned leave', '6 employees'],
      ['Pending requests', '3 requests'],
    ],
  },
  {
    id: 'resumes',
    title: 'Resume Folder',
    summary: '36 candidate resumes',
    details: [
      ['Resume records', '36'],
      ['Access', 'Admin / HR workspace preview'],
      ['Files', 'Sample counts only; no files uploaded'],
    ],
  },
  {
    id: 'interviews',
    title: 'Interviews',
    summary: '5 scheduled today',
    details: [
      ['Scheduled today', '5 interviews'],
      ['Selected candidates', '4'],
      ['Candidates on hold', '3'],
    ],
  },
]

const ACTION_ICONS = {
  attendance: CalendarCheck,
  leave: CalendarDays,
  resumes: FolderOpen,
  interviews: MessagesSquare,
}

// Local previews only. No navigation, uploads or API requests.
export function HRQuickActions({ actions = MOCK_ACTIONS }) {
  return (
    <section
      aria-labelledby="hr-quick-actions-title"
      className="h-full min-w-0 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-200/80 via-purple-100/70 to-blue-200/70 p-2.5 shadow-sm"
    >
      <h2 id="hr-quick-actions-title" className="text-xs font-semibold text-violet-900">
        HR Quick Actions
      </h2>
      <p className="mt-0.5 text-[11px] leading-4 text-slate-500">Select a module to view its details</p>

      <div className="mt-2 grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const Icon = ACTION_ICONS[action.id] ?? FolderOpen

          return (
            <Dialog key={action.id}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  aria-label={`View ${action.title}`}
                  className="group flex min-w-0 flex-col items-start rounded-xl border border-violet-300/80 bg-white/70 p-2 text-left transition-colors hover:border-violet-400 hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
                >
                  <Icon aria-hidden="true" className="mb-1 h-4 w-4 text-violet-600" />
                  <span className="text-xs font-semibold text-slate-800">{action.title}</span>
                  <span className="mt-0.5 text-[11px] leading-4 text-slate-500">{action.summary}</span>
                </button>
              </DialogTrigger>

              <DialogContent className="max-h-[85dvh] overflow-y-auto rounded-2xl sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{action.title}</DialogTitle>
                  <DialogDescription>{action.summary} ? Mock data preview</DialogDescription>
                </DialogHeader>
                <dl className="divide-y divide-slate-100">
                  {(action.details ?? []).map(([label, value]) => (
                    <div key={label} className="grid grid-cols-2 gap-4 py-3 text-xs">
                      <dt className="text-slate-500">{label}</dt>
                      <dd className="break-words font-medium text-slate-800">{value}</dd>
                    </div>
                  ))}
                </dl>
              </DialogContent>
            </Dialog>
          )
        })}
      </div>

      {actions.length === 0 && (
        <p className="py-4 text-xs text-slate-500">No quick actions available.</p>
      )}
    </section>
  )
}
