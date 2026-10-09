'use client'

/**
 * The HR Workspace home.
 *
 * WHAT THIS SCREEN IS FOR
 * HR has no use for the tracker's project/task dashboard, and a wall of totals
 * is not much better: "20 employees" is not a thing anyone does something
 * about. So this page is built around the four questions an HR lead actually
 * opens it to answer, in this order:
 *
 *   1. Is anything waiting on me?        -> the attention strip, derived
 *   2. Who is in, and who is missing?    -> presence today, and the week
 *   3. What is coming at me?             -> interviews, notice periods
 *   4. Is hiring moving?                 -> the pipeline, stage by stage
 *
 * The attention strip is the point of the redesign. Every item in it is a
 * judgement, not a count: leave sitting longer than three days is a manager
 * who has stopped reading their queue; an unplanned absence is a plan that
 * needs rework today; an interview whose date has passed while still marked
 * scheduled is feedback nobody recorded, which is the single most common way a
 * candidate goes cold. Each is a link to the screen where it gets fixed, and
 * an item with nothing behind it is not rendered — so an empty strip is a
 * genuine all-clear rather than a row of zeroes.
 *
 * Two figures the backend was already computing and the page used to throw
 * away now carry their own cards: `attendance.week` (Mon-Fri present counts,
 * which is what makes today's number mean anything) and
 * `recruitment.pipeline` (stage by stage, so a funnel stalled at "interviewed"
 * is visible instead of hiding inside one "active candidates" total).
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Users, UserCheck, CalendarDays, BriefcaseBusiness, UserPlus, UserX, CalendarCheck,
  MessagesSquare, Clock3, ClipboardList, ArrowUpRight, TrendingUp, IdCard,
} from 'lucide-react'

import { peopleApi } from '@/lib/api/people.api'
import { leaveManagementApi } from '@/lib/api/leave-management.api'
import { useAuthStore } from '@/store/auth.store'
import { addDays, businessToday, daysBetween, shortDate } from '@/lib/business-date'
import {
  AttentionStrip, Empty, Flag, HeroBand, LegendDot, Loading, MetricTile, MiniBars, Panel, RowList, ShareBar,
} from '@/components/shared/dashboard-kit'
import {
  CANDIDATE_STAGES, INTERVIEW_TYPE_LABELS, INTERVIEW_STATUS_LABELS,
} from '@/constants/people'

const errorMessage = (err, fallback) => err?.response?.data?.message || fallback

// A manager who has not answered in three working-ish days has stopped
// reading the queue; that is HR's problem to chase, not the employee's.
const STALE_LEAVE_DAYS = 3
// Inside a week of someone's last day, handover and the exit checklist are
// late if they have not started.
const EXIT_SOON_DAYS = 7
// How far back to look for interviews that never got their feedback recorded.
const FEEDBACK_LOOKBACK_DAYS = 21
// The stages worth drawing in the funnel: "where is everyone we are still
// talking to". Joined/rejected/declined are outcomes, not stages, and would
// swamp the bar within a month.
const FUNNEL_STAGES = ['applied', 'screening', 'interview_scheduled', 'interviewed', 'hold', 'offered']

const QUICK_LINKS = [
  { label: 'Add employee', href: '/people', icon: UserPlus },
  { label: 'Add candidate', href: '/recruitment', icon: BriefcaseBusiness },
  { label: 'Record exit', href: '/people?tab=attrition', icon: UserX },
  { label: 'Attendance', href: '/time-management?tab=attendance', icon: CalendarCheck },
  { label: 'Work status', href: '/time-management?tab=team-status', icon: ClipboardList },
  { label: 'Leave', href: '/leave-management', icon: CalendarDays },
]

// Attendance is a judgement, not a number: the same 80% is fine in a team of
// five and a problem in a team of fifty, but a threshold is still the only
// honest way to colour it, and these are the thresholds HR uses when asked.
const presenceTone = (percent) => (percent >= 85 ? 'positive' : percent >= 70 ? 'caution' : 'critical')

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
      // Interviews whose date has passed while still marked scheduled: the
      // round happened (or did not) and nobody recorded the outcome.
      peopleApi.getInterviews({
        status: 'scheduled',
        from: addDays(today, -FEEDBACK_LOOKBACK_DAYS),
        to: addDays(today, -1),
      }),
      leaveManagementApi.getCalendar(today, today),
      leaveManagementApi.getAll({ status: 'pending' }),
      peopleApi.getEmployees({ status: 'notice_period', limit: 10 }),
      peopleApi.getEmployees({ status: 'active', sort: 'joined', order: 'desc', limit: 5 }),
    ])
      .then(([dashboard, interviews, staleInterviews, away, pending, notice, joiners]) => {
        if (!active) return
        setData({
          today,
          dashboard,
          interviews,
          staleInterviews: staleInterviews || [],
          away: away.items,
          // The endpoint is asked for pending only; the filter is belt and
          // braces for a cached payload. Oldest first, because the queue is
          // the point of the panel and the oldest request is the one rotting.
          pending: (pending || [])
            .filter((p) => p.status === 'pending')
            .sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || ''))),
          notice: notice.items,
          joiners: joiners.items,
        })
      })
      .catch((err) => {
        if (active) setError(errorMessage(err, 'Could not load the HR dashboard.'))
      })

    return () => { active = false }
  }, [])

  const d = data?.dashboard
  const today = data?.today
  const loading = !data && !error

  // How long a pending request has been waiting, in days. createdAt is a
  // timestamp; the leave dates are plain 'YYYY-MM-DD', so compare in one
  // currency by taking the date part.
  const waitingDays = (req) =>
    today && req?.createdAt ? daysBetween(String(req.createdAt).slice(0, 10), today) : null

  const staleLeave = (data?.pending || []).filter((p) => (waitingDays(p) ?? 0) >= STALE_LEAVE_DAYS)
  const unplannedToday = (data?.away || []).filter((a) => a.planningType === 'unplanned')
  const interviewsUnstaffed = (data?.interviews || []).filter((i) => !i.interviewer)
  const exitsSoon = (data?.notice || []).filter((e) => {
    const left = daysBetween(today, e.exit?.lastWorkingDate)
    return left !== null && left <= EXIT_SOON_DAYS
  })
  // Accounts on the roster with no HR profile keyed in: no designation, no
  // joining date, nothing to put on a letter.
  const missingProfiles = d ? Math.max(0, d.employees.total - d.employees.withProfile) : 0

  const attention = [
    {
      key: 'stale-leave',
      count: staleLeave.length,
      label: `leave request${staleLeave.length === 1 ? '' : 's'} waiting ${STALE_LEAVE_DAYS}+ days`,
      tone: 'critical',
      href: '/leave-management',
    },
    {
      key: 'feedback',
      count: data?.staleInterviews.length ?? 0,
      label: 'interviews with no outcome recorded',
      tone: 'critical',
      href: '/recruitment?tab=interviews',
    },
    {
      key: 'exit-soon',
      count: exitsSoon.length,
      label: `last working day within ${EXIT_SOON_DAYS} days`,
      tone: 'critical',
      href: '/people?tab=attrition',
    },
    {
      key: 'unplanned',
      count: unplannedToday.length,
      label: 'unplanned absences today',
      tone: 'caution',
      href: '/leave-management',
    },
    {
      key: 'unstaffed',
      count: interviewsUnstaffed.length,
      label: 'interviews today with no interviewer',
      tone: 'caution',
      href: '/recruitment?tab=interviews',
    },
    {
      key: 'pending',
      count: (data?.pending.length ?? 0) - staleLeave.length,
      label: 'leave requests awaiting a manager',
      tone: 'caution',
      href: '/leave-management',
    },
    {
      key: 'profiles',
      count: missingProfiles,
      label: 'accounts with no HR profile',
      tone: 'info',
      href: '/people',
    },
  ]

  const presentPercent = d?.attendance.attendancePercent ?? 0
  const week = d?.attendance.week || []

  const tiles = [
    {
      label: 'On the roster',
      value: d?.employees.total ?? 0,
      hint: d && `+${d.employees.newThisMonth} joined this month · ${d.employees.onNotice} on notice`,
      icon: Users,
      tone: 'primary',
      href: '/people',
    },
    {
      label: 'In today',
      value: d ? `${d.attendance.presentToday}` : 0,
      hint: d && `${presentPercent}% of the roster`,
      icon: UserCheck,
      tone: d ? presenceTone(presentPercent) : 'neutral',
      href: '/time-management?tab=attendance',
    },
    {
      label: 'Away today',
      value: d?.leave.onLeaveToday ?? 0,
      hint: d && `${d.leave.planned} planned · ${d.leave.unplanned} unplanned`,
      icon: CalendarDays,
      tone: d && d.leave.unplanned > 0 ? 'caution' : 'neutral',
      href: '/leave-management',
    },
    {
      label: 'In the hiring pipeline',
      value: d?.recruitment.activeCandidates ?? 0,
      hint: d && `${d.recruitment.interviewsToday} interview${d.recruitment.interviewsToday === 1 ? '' : 's'} today`,
      icon: BriefcaseBusiness,
      tone: 'info',
      href: '/recruitment',
    },
  ]

  // The one sentence at the top. Assembled, not templated, so it reads as a
  // sentence whichever clauses survive.
  const headline = d
    ? [
        `${d.attendance.presentToday} of ${d.employees.total} in today`,
        d.leave.onLeaveToday > 0 ? `${d.leave.onLeaveToday} away` : null,
        d.leave.pending > 0 ? `${d.leave.pending} leave request${d.leave.pending === 1 ? '' : 's'} pending` : null,
        d.recruitment.interviewsToday > 0
          ? `${d.recruitment.interviewsToday} interview${d.recruitment.interviewsToday === 1 ? '' : 's'} today`
          : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : 'Loading your people, attendance and hiring…'

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-4">
      <HeroBand
        accent="violet"
        eyebrow={`HR Workspace${d ? ` · ${shortDate(d.asOf)}` : ''}`}
        title={`Welcome${user?.name ? `, ${user.name}` : ''}`}
        headline={headline}
        action={
          <Link
            href="/people"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-hover"
          >
            <UserPlus aria-hidden="true" className="h-4 w-4" /> Add employee
          </Link>
        }
      >
        {/* Today's attendance only means something next to the rest of the
            week, so the week is in the band with it. */}
        {week.length > 0 && (
          <div className="flex flex-wrap items-end gap-4 rounded-xl border border-violet-100 bg-white/70 p-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Present this week</p>
              <p className="text-xs text-slate-500">Mon to Fri, out of {d.employees.total} on the roster</p>
            </div>
            <div className="min-w-[180px] flex-1">
              <MiniBars
                height={56}
                max={d.employees.total}
                label={`Present each day this week: ${week.map((w) => `${w.day} ${w.present}`).join(', ')}`}
                columns={week.map((w) => ({
                  key: w.date,
                  label: w.day,
                  muted: w.isFuture,
                  active: w.date === d.asOf,
                  bars: [
                    {
                      value: w.present,
                      tone: w.isFuture ? 'neutral' : w.date === d.asOf ? 'primary' : 'info',
                      title: `${w.day} ${shortDate(w.date)}: ${w.present} present`,
                    },
                  ],
                }))}
                legend={
                  <>
                    <LegendDot tone="primary">Today</LegendDot>
                    <LegendDot tone="info">Earlier this week</LegendDot>
                    <LegendDot tone="neutral">Still to come</LegendDot>
                  </>
                }
              />
            </div>
          </div>
        )}
      </HeroBand>

      {error && (
        <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </p>
      )}

      <AttentionStrip
        items={attention}
        loading={loading}
        allClear="No stale approvals, no missing interview feedback, no exits this week. All clear."
      />

      <section aria-label="HR statistics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <MetricTile key={t.label} {...t} hint={t.hint || null} loading={loading} />
        ))}
      </section>

      <section aria-label="Quick actions" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50/60 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-violet-300 hover:bg-violet-50"
          >
            <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
            <span className="min-w-0 flex-1 truncate">{label}</span>
            <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-violet-400" />
          </Link>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Panel
          title="Today's interviews"
          icon={MessagesSquare}
          badge={data?.interviews.length}
          href="/recruitment?tab=interviews"
        >
          {!data ? <Loading /> : data.interviews.length === 0 ? <Empty>No interviews today.</Empty> : (
            <RowList>
              {data.interviews.map((i) => (
                <li key={i.id}>
                  <Link href={`/recruitment/${i.candidateId}`} className="block rounded-lg px-2 py-1.5 text-xs hover:bg-slate-50">
                    <span className="flex items-center gap-2">
                      <span className="min-w-0 flex-1 truncate">
                        <span className="font-semibold text-slate-800">{i.candidateName}</span>
                        <span className="text-slate-500"> · {i.roleApplied}</span>
                      </span>
                      {i.startTime && <Flag tone="info">{i.startTime}</Flag>}
                      {!i.interviewer && <Flag tone="caution" title="No interviewer assigned">No interviewer</Flag>}
                    </span>
                    <span className="mt-0.5 block truncate text-[10px] text-slate-400">
                      Round {i.roundNumber}
                      {i.interviewType ? ` ${INTERVIEW_TYPE_LABELS[i.interviewType]}` : ''}
                      {i.interviewer ? ` · ${i.interviewer.name}` : ''}
                      {` · ${INTERVIEW_STATUS_LABELS[i.status]}`}
                    </span>
                  </Link>
                </li>
              ))}
            </RowList>
          )}
        </Panel>

        <Panel title="Away today" icon={CalendarDays} badge={data?.away.length} href="/leave-management">
          {!data ? <Loading /> : data.away.length === 0 ? <Empty>Everyone is in today.</Empty> : (
            <RowList>
              {data.away.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs">
                  <span className="min-w-0 truncate font-medium text-slate-800">{a.userName ?? 'Someone'}</span>
                  <span className="flex shrink-0 items-center gap-1">
                    <span className="text-[10px] text-slate-500">{a.dayType === 'half_day' ? 'Half day' : 'Full day'}</span>
                    {a.planningType === 'unplanned'
                      ? <Flag tone="caution" title="Applied on or after the day it started">Unplanned</Flag>
                      : <Flag tone="neutral">Planned</Flag>}
                    {a.status === 'pending' && <Flag tone="info">Pending</Flag>}
                  </span>
                </li>
              ))}
            </RowList>
          )}
        </Panel>

        <Panel
          title="Leave awaiting approval"
          icon={Clock3}
          badge={data?.pending.length}
          href="/leave-management"
        >
          {!data ? <Loading /> : data.pending.length === 0 ? <Empty>No pending leave requests.</Empty> : (
            <RowList>
              {data.pending.slice(0, 8).map((p) => {
                const waited = waitingDays(p)
                return (
                  <li key={p.id} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs">
                    <span className="min-w-0 flex-1 truncate">
                      <span className="font-medium text-slate-800">{p.userName ?? 'Someone'}</span>
                      <span className="block text-[10px] text-slate-400">
                        {shortDate(p.startDate)}
                        {p.endDate !== p.startDate ? `–${shortDate(p.endDate)}` : ''} · {p.type}
                        {p.isLateNotice ? ' · short notice' : ''}
                      </span>
                    </span>
                    {waited != null && waited > 0 && (
                      <Flag
                        tone={waited >= STALE_LEAVE_DAYS ? 'critical' : 'neutral'}
                        title={`Raised ${waited} day${waited === 1 ? '' : 's'} ago`}
                      >
                        {waited}d
                      </Flag>
                    )}
                  </li>
                )
              })}
            </RowList>
          )}
          <p className="mt-auto pt-2 text-[10px] text-slate-400">
            Approval is the line manager&apos;s decision; HR sees the queue and chases what has stalled.
          </p>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel title="Hiring pipeline" icon={TrendingUp} href="/recruitment">
          {!data ? <Loading /> : (
            <>
              <ShareBar
                empty="No candidates in the pipeline."
                segments={FUNNEL_STAGES.map((key) => {
                  const stage = CANDIDATE_STAGES.find((s) => s.key === key)
                  return {
                    key,
                    label: stage?.label ?? key,
                    className: stage?.color ?? 'bg-slate-400',
                    value: d.recruitment.pipeline[key] || 0,
                  }
                })}
              />
              <p className="mt-2 text-[10px] text-slate-400">
                Everyone still in play. Joined, not selected and declined are outcomes, not stages, so they are counted
                on the Recruitment page rather than here.
              </p>
            </>
          )}
        </Panel>

        <Panel title="Roster health" icon={IdCard} href="/people">
          {!data ? <Loading /> : (
            <dl className="grid grid-cols-2 gap-2">
              {[
                { label: 'HR profiles complete', value: `${d.employees.withProfile}/${d.employees.total}`, tone: missingProfiles > 0 ? 'caution' : 'positive' },
                { label: 'Joined this month', value: d.employees.newThisMonth, tone: 'positive' },
                { label: 'Serving notice', value: d.employees.onNotice, tone: d.employees.onNotice > 0 ? 'caution' : 'neutral' },
                { label: 'Leave pending', value: d.leave.pending, tone: d.leave.pending > 0 ? 'caution' : 'positive' },
              ].map((row) => (
                <div key={row.label} className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2">
                  <dt className="truncate text-[11px] text-slate-500">{row.label}</dt>
                  <dd className={`text-lg font-bold tabular-nums ${row.tone === 'caution' ? 'text-amber-700' : row.tone === 'positive' ? 'text-emerald-700' : 'text-slate-900'}`}>
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel title="On notice period" icon={UserX} badge={data?.notice.length} href="/people?tab=attrition">
          {!data ? <Loading /> : data.notice.length === 0 ? <Empty>Nobody is serving notice.</Empty> : (
            <RowList>
              {data.notice.map((e) => {
                const left = daysBetween(today, e.exit?.lastWorkingDate)
                return (
                  <li key={e.id}>
                    <Link href={`/people/${e.userId}`} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-slate-50">
                      <span className="min-w-0 flex-1 truncate">
                        <span className="font-medium text-slate-800">{e.name}</span>
                        <span className="block text-[10px] text-slate-400">
                          {e.designation} · last day {shortDate(e.exit?.lastWorkingDate)}
                        </span>
                      </span>
                      {left != null && (
                        <Flag
                          tone={left <= EXIT_SOON_DAYS ? 'critical' : 'caution'}
                          title={left < 0 ? 'Last working day has passed' : `${left} days left`}
                        >
                          {left < 0 ? 'passed' : `${left}d left`}
                        </Flag>
                      )}
                    </Link>
                  </li>
                )
              })}
            </RowList>
          )}
        </Panel>

        <Panel title="Recent joiners" icon={UserPlus} href="/people">
          {!data ? <Loading /> : data.joiners.length === 0 ? <Empty>No employees in the directory yet.</Empty> : (
            <RowList>
              {data.joiners.map((e) => {
                const ago = daysBetween(e.dateOfJoining, today)
                return (
                  <li key={e.id}>
                    <Link href={`/people/${e.userId}`} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-slate-50">
                      <span className="min-w-0 flex-1 truncate">
                        <span className="font-medium text-slate-800">{e.name}</span>
                        <span className="block text-[10px] text-slate-400">
                          {e.designation}
                          {e.dateOfJoining ? ` · joined ${shortDate(e.dateOfJoining)}` : ''}
                        </span>
                      </span>
                      {/* A joiner inside their first week is the one whose
                          induction, kit and buddy are still being chased. */}
                      {ago != null && ago >= 0 && ago <= 7 && <Flag tone="positive">New</Flag>}
                    </Link>
                  </li>
                )
              })}
            </RowList>
          )}
        </Panel>
      </div>
    </div>
  )
}
