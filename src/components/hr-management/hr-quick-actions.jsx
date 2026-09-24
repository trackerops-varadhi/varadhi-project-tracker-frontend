import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const MOCK_ACTIONS = [
  { id: 'attendance', title: 'Attendance', summary: '112 present · 3 late', href: null },
  { id: 'leave', title: 'Leave Management', summary: '9 employees on leave', href: '/leave-management' },
  { id: 'resumes', title: 'Resume Folder', summary: '36 candidate resumes', href: null },
  { id: 'interviews', title: 'Interviews', summary: '5 scheduled today', href: null },
]

// Supply each workspace's href when its page is ready.
export function HRQuickActions({ actions = MOCK_ACTIONS }) {
  return (
    <section aria-labelledby="hr-quick-actions-title" className="h-full min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 id="hr-quick-actions-title" className="text-sm font-semibold text-slate-900">HR Quick Actions</h2>
      <p className="mt-1 text-xs text-slate-500">Open a detailed workspace in one click</p>

      <ul className="mt-3 divide-y divide-slate-100">
        {actions.map((action) => (
          <li key={action.id} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 py-3 sm:grid-cols-[1fr_1.2fr_auto]">
            <span className="text-xs font-medium text-slate-800">{action.title}</span>
            <span className="col-start-1 row-start-2 text-[11px] text-slate-500 sm:col-start-auto sm:row-start-auto">{action.summary}</span>
            {action.href ? (
              <Link href={action.href} prefetch={false} aria-label={`Open ${action.title}`} className="col-start-2 row-span-2 row-start-1 inline-flex items-center gap-1 rounded text-xs font-semibold text-violet-600 hover:text-violet-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-600 sm:col-start-auto sm:row-span-1 sm:row-start-auto">
                Open <ArrowRight aria-hidden="true" className="h-3 w-3" />
              </Link>
            ) : (
              <span title={`${action.title} workspace is coming soon`} className="col-start-2 row-span-2 row-start-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-500 sm:col-start-auto sm:row-span-1 sm:row-start-auto">Coming soon</span>
            )}
          </li>
        ))}
        {actions.length === 0 && <li className="py-6 text-xs text-slate-500">No quick actions available.</li>}
      </ul>
    </section>
  )
}
