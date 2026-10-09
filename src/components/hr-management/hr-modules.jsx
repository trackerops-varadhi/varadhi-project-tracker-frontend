'use client'

import Link from 'next/link'
import {
  Users,
  CalendarCheck,
  UserCheck,
  FolderDown,
  Briefcase,
  UsersRound,
  UserX,
  ClipboardList,
  ArrowUpRight,
  MessagesSquare,
} from 'lucide-react'

/**
 * HR Workspaces — every tile opens the full screen for that area. `roles` on a
 * tile only decides whether it is clickable for the viewer; each destination's
 * API enforces access on its own.
 */
const GROUPS = [
  {
    title: 'People',
    description: 'Employee records and reporting relationships',
    modules: [
      { title: 'Employee Details', subtitle: 'Admin / HR · full record', icon: Users, href: '/people', roles: ['admin', 'hr'] },
      { title: 'Team Directory', subtitle: 'Admin / HR · work information only', icon: UsersRound, href: '/directory', roles: ['admin', 'hr'] },
      { title: 'Attrition Management', subtitle: 'Admin / HR · exit records', icon: UserX, href: '/people?tab=attrition', roles: ['admin', 'hr'] },
    ],
  },
  {
    title: 'Recruitment',
    description: 'Candidates, interview rounds and resumes',
    modules: [
      { title: 'Interview Management', subtitle: 'Admin / HR · pipeline and rounds', icon: Briefcase, href: '/recruitment', roles: ['admin', 'hr'] },
      { title: 'Resume Folder', subtitle: 'Admin / HR · private, expiring links', icon: FolderDown, href: '/recruitment?tab=resumes', roles: ['admin', 'hr'] },
      { title: 'My Interviews', subtitle: 'Rounds assigned to you', icon: MessagesSquare, href: '/my-interviews' },
    ],
  },
  {
    title: 'Workforce',
    description: 'Daily attendance, leave and work updates',
    modules: [
      { title: 'Attendance', subtitle: 'Register · present / WFH / leave / absent', icon: CalendarCheck, href: '/time-management?tab=attendance', roles: ['admin', 'manager', 'hr'] },
      { title: 'Leave Management', subtitle: 'Planned / unplanned · balances · who is away', icon: UserCheck, href: '/leave-management' },
      { title: 'Daily Work Status', subtitle: 'Summary, blockers and tomorrow’s plan', icon: ClipboardList, href: '/time-management?tab=team-status', roles: ['admin', 'manager', 'hr'] },
    ],
  },
]

export function HrModules({ role }) {
  return (
    <section aria-labelledby="hr-modules-title" className="rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm">
      <div className="mb-2">
        <h2 id="hr-modules-title" className="text-xs font-semibold text-slate-900">HR Workspaces</h2>
        <p className="mt-0.5 text-[11px] leading-4 text-slate-500">People, Recruitment and Workforce</p>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {GROUPS.map((group) => (
          <div key={group.title} className="min-w-0">
            <h3 className="text-xs font-semibold text-primary-hover">{group.title}</h3>
            <p className="mt-1 min-h-0 text-[11px] leading-4 text-slate-500">{group.description}</p>
            <div className="mt-1.5 space-y-1.5">
              {group.modules.map((mod) => {
                const Icon = mod.icon
                const allowed = !mod.roles || mod.roles.includes(role)
                const body = (
                  <>
                    <span className="rounded-lg bg-white p-1.5 text-primary ring-1 ring-slate-100">
                      <Icon aria-hidden="true" className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-slate-800">{mod.title}</span>
                      <span className="mt-0.5 block text-[10px] leading-4 text-slate-500">{mod.subtitle}</span>
                    </span>
                    <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                  </>
                )
                const className = 'group flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-2 text-left transition-colors'
                return allowed ? (
                  <Link key={mod.title} href={mod.href} aria-label={`Open ${mod.title}`}
                    className={`${className} hover:border-violet-200 hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}>
                    {body}
                  </Link>
                ) : (
                  <div key={mod.title} aria-disabled="true" title="Not available for your role" className={`${className} cursor-not-allowed opacity-50`}>
                    {body}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
