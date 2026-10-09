'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Users, UserCheck, CalendarDays, BriefcaseBusiness, UserPlus, UserX, CalendarCheck,
  MessagesSquare, Clock3, ClipboardList, ArrowUpRight,
} from 'lucide-react'

import { peopleApi } from '@/lib/api/people.api'
import { leaveManagementApi } from '@/lib/api/leave-management.api'
import { useAuthStore } from '@/store/auth.store'
import { businessToday, shortDate } from '@/lib/business-date'
import { StatCard } from '@/components/shared/stat-card'
import { INTERVIEW_TYPE_LABELS, INTERVIEW_STATUS_LABELS } from '@/constants/people'

const errorMessage = (err, fallback) => err?.response?.data?.message || fallback

function Panel({ title, icon: Icon, href, children }) {
  return (
    <section className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
          <Icon aria-hidden="true" className="h-4 w-4 text-primary" /> {title}
        </h2>
        {href && <Link href={href} className="text-xs font-medium text-primary hover:underline">Open</Link>}
      </div>
      {children}
    </section>
  )
}

const Empty = ({ children }) => <p className="py-4 text-center text-xs text-slate-500">{children}</p>
const Loading = () => <p className="py-4 text-center text-xs text-slate-400">Loading…</p>

const QUICK_LINKS = [
  { label: 'Add employee', href: '/people', icon: UserPlus },
  { label: 'Add candidate', href: '/recruitment', icon: BriefcaseBusiness },
  { label: 'Record exit', href: '/people?tab=attrition', icon: UserX },
  { label: 'Attendance', href: '/time-management?tab=attendance', icon: CalendarCheck },
  { label: 'Work status', href: '/time-management?tab=team-status', icon: ClipboardList },
  { label: 'Leave', href: '/leave-management', icon: CalendarDays },
]

/**
 * The HR Workspace home. HR has no use for the tracker's project/task
 * dashboard; this is their own: headcount and attendance today, who is away,
 * leave waiting on managers, today's interviews, people on notice and recent
 * joiners.
 */
export function HrHome() {
  const user = useAuthStore((s) => s.user)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const today = businessToday()
    Promise.all([
      peopleApi.getDashboard(),
      peopleApi.getInterviews({ from: today, to: today }),
      leaveManagementApi.getCalendar(today, today),
      leaveManagementApi.getAll({ status: 'pending' }),
      peopleApi.getEmployees({ status: 'notice_period', limit: 10 }),
      peopleApi.getEmployees({ status: 'active', sort: 'joined', order: 'desc', limit: 5 }),
    ])
      .then(([dashboard, interviews, away, pending, notice, joiners]) => {
        if (!active) return
        setData({
          dashboard,
          interviews,
          away: away.items,
          pending: (pending || []).filter((p) => p.status === 'pending'),
          notice: notice.items,
          joiners: joiners.items,
        })
      })
      .catch((err) => { if (active) setError(errorMessage(err, 'Could not load the HR dashboard.')) })
    return () => { active = false }
  }, [])

  const d = data?.dashboard
  const cards = [
    { title: 'Employees', value: d?.employees.total, subtitle: d && `+${d.employees.newThisMonth} this month · ${d.employees.onNotice} on notice`, icon: Users, href: '/people' },
    { title: 'Present today', value: d?.attendance.presentToday, subtitle: d && `${d.attendance.attendancePercent}% attendance`, icon: UserCheck, href: '/time-management?tab=attendance' },
    { title: 'On leave today', value: d?.leave.onLeaveToday, subtitle: d && `${d.leave.planned} planned · ${d.leave.unplanned} unplanned · ${d.leave.pending} pending`, icon: CalendarDays, href: '/leave-management' },
    { title: 'Active candidates', value: d?.recruitment.activeCandidates, subtitle: d && `${d.recruitment.interviewsToday} interviews today`, icon: BriefcaseBusiness, href: '/recruitment' },
  ]

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">HR Dashboard</h1>
        <p className="text-sm text-slate-500">
          Welcome{user?.name ? `, ${user.name}` : ''}. Your people, attendance and hiring at a glance{d ? ` — ${shortDate(d.asOf)}` : ''}.
        </p>
      </div>

      {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}

      <section aria-label="HR statistics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <StatCard key={c.title} title={c.title} value={c.value ?? 0} subtitle={c.subtitle || null}
            icon={c.icon} href={c.href} loading={!data && !error} />
        ))}
      </section>

      <section aria-label="Quick actions" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
          <Link key={label} href={href}
            className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50/60 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-violet-300 hover:bg-violet-50">
            <Icon aria-hidden="true" className="h-4 w-4 text-primary" />
            <span className="min-w-0 flex-1 truncate">{label}</span>
            <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 text-violet-400" />
          </Link>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Panel title="Today's interviews" icon={MessagesSquare} href="/recruitment?tab=interviews">
          {!data ? <Loading /> : data.interviews.length === 0 ? <Empty>No interviews today.</Empty> : (
            <ul className="space-y-1.5">
              {data.interviews.map((i) => (
                <li key={i.id}>
                  <Link href={`/recruitment/${i.candidateId}`} className="block rounded-lg px-2 py-1.5 text-xs hover:bg-slate-50">
                    <span className="font-semibold text-slate-800">{i.candidateName}</span>
                    <span className="text-slate-500"> · {i.roleApplied}</span>
                    <span className="block text-[10px] text-slate-400">
                      {i.startTime ?? 'Any time'} · Round {i.roundNumber}{i.interviewType ? ` ${INTERVIEW_TYPE_LABELS[i.interviewType]}` : ''} · {i.interviewer?.name ?? 'No interviewer'} · {INTERVIEW_STATUS_LABELS[i.status]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Away today" icon={CalendarDays} href="/leave-management">
          {!data ? <Loading /> : data.away.length === 0 ? <Empty>Everyone is in today.</Empty> : (
            <ul className="space-y-1">
              {data.away.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1 text-xs">
                  <span className="font-medium text-slate-800">{a.userName ?? 'Someone'}</span>
                  <span className="text-[10px] text-slate-500">
                    {a.dayType === 'half_day' ? 'Half day' : 'Full day'} · {a.planningType === 'unplanned' ? 'Unplanned' : 'Planned'}
                    {a.status === 'pending' ? ' · pending' : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Leave awaiting approval" icon={Clock3} href="/leave-management">
          {!data ? <Loading /> : data.pending.length === 0 ? <Empty>No pending leave requests.</Empty> : (
            <ul className="space-y-1">
              {data.pending.slice(0, 8).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1 text-xs">
                  <span className="min-w-0 truncate font-medium text-slate-800">{p.userName ?? 'Someone'}</span>
                  <span className="shrink-0 text-[10px] text-slate-500">
                    {shortDate(p.startDate)}{p.endDate !== p.startDate ? `–${shortDate(p.endDate)}` : ''} · {p.type}
                    {p.isLateNotice ? ' · short notice' : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-auto pt-2 text-[10px] text-slate-400">Approval is the line manager&apos;s decision; HR sees the queue.</p>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel title="On notice period" icon={UserX} href="/people?tab=attrition">
          {!data ? <Loading /> : data.notice.length === 0 ? <Empty>Nobody is serving notice.</Empty> : (
            <ul className="space-y-1">
              {data.notice.map((e) => (
                <li key={e.id}>
                  <Link href={`/people/${e.userId}`} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1 text-xs hover:bg-slate-50">
                    <span className="font-medium text-slate-800">{e.name}</span>
                    <span className="text-[10px] text-slate-500">{e.designation} · last day {shortDate(e.exit?.lastWorkingDate)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent joiners" icon={UserPlus} href="/people">
          {!data ? <Loading /> : data.joiners.length === 0 ? <Empty>No employees in the directory yet.</Empty> : (
            <ul className="space-y-1">
              {data.joiners.map((e) => (
                <li key={e.id}>
                  <Link href={`/people/${e.userId}`} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1 text-xs hover:bg-slate-50">
                    <span className="font-medium text-slate-800">{e.name}</span>
                    <span className="text-[10px] text-slate-500">{e.designation}{e.dateOfJoining ? ` · joined ${shortDate(e.dateOfJoining)}` : ''}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  )
}
