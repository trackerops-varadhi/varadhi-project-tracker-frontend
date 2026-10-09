'use client'

/**
 * The QC Workspace home.
 *
 * WHAT THIS SCREEN IS FOR
 * QC's job is not "look at bugs" — it is three things, and the page is built
 * in that order:
 *
 *   1. Verify the fixes that are waiting on me. Nobody else can close a bug,
 *      so a fix sitting in qa_verification is blocked on this person alone.
 *      That is why it is the first tile and the first list, with an age on
 *      every row: a four-day-old fix is a developer who has moved on and will
 *      have to context-switch back.
 *   2. Protect the SLA. Breached and at-risk are separated, because they are
 *      different jobs: at-risk can still be saved, breached has to be
 *      explained.
 *   3. Judge whether quality is actually improving. One number does that
 *      honestly — the reopen rate. A team can close every bug inside SLA and
 *      still be shipping fixes that do not hold.
 *
 * WHAT CHANGED, AND WHY
 * The old page showed six counts and three flat lists. Everything the backend
 * computes in `getReports()` beyond three headline percentages was fetched and
 * discarded: the weekly trend, the severity mix, and the per-developer split.
 * They are the only data here that answers "is this getting better or worse",
 * so they now have cards.
 *
 * ONE CAREFUL READING OF THE TREND DATA
 * `trend` groups by the week a bug was REPORTED and counts how many of that
 * week's bugs are resolved TODAY (repo.js: `date_trunc('week', b.created_at)`
 * with `COUNT(*) FILTER (WHERE b.resolved_at IS NOT NULL)`). It is therefore
 * not "reported versus resolved each week" — the two bars belong to the same
 * cohort, and the gap between them is that week's intake that is still open.
 * The card says exactly that. Labelling it in/out flow would have been the
 * easy chart and the wrong number.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle, Bug, CircleDot, Clock, Gauge, Plus, RotateCcw, ShieldCheck, Timer, TrendingUp, UserCog,
} from 'lucide-react'

import { bugsApi } from '@/lib/api/bugs.api'
import { useAuthStore } from '@/store/auth.store'
import { shortDate } from '@/lib/business-date'
import {
  AttentionStrip, Empty, Flag, HeroBand, LegendDot, Loading, MetricTile, MiniBars, Panel, RowList, ShareBar,
} from '@/components/shared/dashboard-kit'
import { formatRelativeTime } from '@/utils'

const errorMessage = (err, fallback) => err?.response?.data?.message || fallback

// Every status in which the clock is still running and someone still owes
// work. Used for "live" counts, so a closed or rejected bug never inflates
// them.
const LIVE_STATUSES = 'open,assigned,in_progress,reopened,fixed,qa_verification'

// A fix waiting longer than this on QC is holding up a developer who has
// already moved on to something else.
const VERIFY_STALE_DAYS = 2

const SEVERITY_CLASS = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-slate-100 text-slate-700',
}

// Severity shares the palette with the bug list, so the bar and the rows agree.
const SEVERITY_BAR = {
  critical: 'bg-rose-600',
  high: 'bg-orange-500',
  medium: 'bg-amber-500',
  low: 'bg-slate-400',
}

const SEVERITY_LABELS = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' }

// The total for one filter, from a one-row page.
const countOf = (filters) => bugsApi.getAll(filters, 1, 1).then((d) => d.total ?? 0)

/**
 * Whole days between a timestamp and now. `nowMs` comes from the server's own
 * clock (every bug row carries `serverTime`) rather than the browser's, for
 * the same reason the SLA countdown does: a laptop whose clock is a day out
 * would otherwise age every row by a day.
 */
const daysSince = (iso, nowMs) => {
  if (!iso) return null
  const ms = nowMs - new Date(iso).getTime()
  return ms < 0 ? 0 : Math.floor(ms / 86400000)
}

// Verdicts. These are the thresholds the SLA report is read against; they are
// here rather than inline so the two tiles cannot disagree.
const complianceTone = (pct) => (pct == null ? 'neutral' : pct >= 90 ? 'positive' : pct >= 75 ? 'caution' : 'critical')
const reopenTone = (pct) => (pct == null ? 'neutral' : pct <= 10 ? 'positive' : pct <= 20 ? 'caution' : 'critical')

function BugRow({ bug, trailing }) {
  return (
    <li>
      <Link href={`/bugs/${bug.id}`} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-slate-50">
        <span className="w-14 shrink-0 font-semibold text-slate-500">{bug.key}</span>
        <span className="min-w-0 flex-1 truncate text-slate-800">{bug.title}</span>
        <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] capitalize ${SEVERITY_CLASS[bug.severity]}`}>
          {bug.severity}
        </span>
        {trailing}
      </Link>
    </li>
  )
}

export function QcDashboard() {
  const user = useAuthStore((s) => s.user)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.id) return undefined
    let active = true

    Promise.all([
      countOf({ status: 'open' }),
      countOf({ status: 'assigned,reopened' }),
      countOf({ status: 'in_progress' }),
      countOf({ status: 'fixed,qa_verification' }),
      countOf({ slaStatus: 'at_risk' }),
      countOf({ slaStatus: 'breached', status: LIVE_STATUSES }),
      countOf({ status: 'reopened' }),
      countOf({ severity: 'critical', status: LIVE_STATUSES }),
      // Oldest first: the top of this list is the fix that has waited longest
      // on QC, which is the one worth opening.
      bugsApi.getAll({ status: 'fixed,qa_verification', sortBy: 'updatedAt', sortDir: 'asc' }, 1, 8),
      bugsApi.getAll({ slaStatus: 'at_risk' }, 1, 8),
      bugsApi.getAll({ reporterId: user.id }, 1, 6),
      bugsApi.getReports().catch(() => null),
    ])
      .then(([unassigned, assigned, inProgress, awaiting, risk, breached, reopened, critical, verify, atRisk, mine, report]) => {
        if (!active) return
        setData({
          counts: { unassigned, assigned, inProgress, awaiting, risk, breached, reopened, critical },
          verify: verify.data ?? [],
          atRisk: atRisk.data ?? [],
          mine: mine.data ?? [],
          report,
          // The server's clock, from whichever list came back with rows.
          nowMs: new Date(
            verify.data?.[0]?.serverTime || atRisk.data?.[0]?.serverTime || mine.data?.[0]?.serverTime || Date.now()
          ).getTime(),
        })
      })
      .catch((err) => {
        if (active) setError(errorMessage(err, 'Could not load the QC dashboard.'))
      })

    return () => { active = false }
  }, [user?.id])

  const c = data?.counts || {}
  const report = data?.report
  const loading = !data && !error
  const live = (c.unassigned ?? 0) + (c.assigned ?? 0) + (c.inProgress ?? 0) + (c.awaiting ?? 0)

  // The oldest fix in the verification queue, in days. Stated rather than
  // counted: the queue page holds eight rows, so "N older than two days"
  // could only ever be a count of what happened to be fetched, while "the
  // oldest has waited five days" is true however long the queue is.
  const oldestVerifyDays = data?.verify.length ? daysSince(data.verify[0].updatedAt, data.nowMs) : null

  const attention = [
    {
      key: 'breached',
      count: c.breached ?? 0,
      label: 'SLA breached and still open',
      tone: 'critical',
      href: `/bugs?slaStatus=breached&status=${LIVE_STATUSES}`,
    },
    {
      key: 'critical',
      count: c.critical ?? 0,
      label: 'critical defects still live',
      tone: 'critical',
      href: `/bugs?severity=critical&status=${LIVE_STATUSES}`,
    },
    {
      key: 'stale-verify',
      count: oldestVerifyDays != null && oldestVerifyDays >= VERIFY_STALE_DAYS ? oldestVerifyDays : 0,
      label: 'days the oldest fix has waited on you',
      tone: 'caution',
      href: '/bugs?status=fixed,qa_verification',
    },
    {
      key: 'risk',
      count: c.risk ?? 0,
      label: 'defects close to their deadline',
      tone: 'caution',
      href: '/bugs?slaStatus=at_risk',
    },
    {
      key: 'reopened',
      count: c.reopened ?? 0,
      label: 'reopened — the fix did not hold',
      tone: 'caution',
      href: '/bugs?status=reopened',
    },
    {
      key: 'unassigned',
      count: c.unassigned ?? 0,
      label: 'open with nobody on them yet',
      tone: 'info',
      href: '/bugs?status=open',
    },
    {
      key: 'verify',
      count: c.awaiting ?? 0,
      label: 'fixes awaiting your verification',
      tone: 'info',
      href: '/bugs?status=fixed,qa_verification',
    },
  ]

  const tiles = [
    {
      label: 'Awaiting your verification',
      value: c.awaiting ?? 0,
      hint: oldestVerifyDays != null
        ? `oldest has waited ${oldestVerifyDays} day${oldestVerifyDays === 1 ? '' : 's'}`
        : 'nothing is blocked on you',
      icon: ShieldCheck,
      tone: (c.awaiting ?? 0) === 0 ? 'positive' : oldestVerifyDays >= VERIFY_STALE_DAYS ? 'caution' : 'info',
      href: '/bugs?status=fixed,qa_verification',
    },
    {
      label: 'Live defects',
      value: live,
      hint: `${c.unassigned ?? 0} unassigned · ${c.inProgress ?? 0} being worked on`,
      icon: Bug,
      tone: 'primary',
      href: `/bugs?status=${LIVE_STATUSES}`,
    },
    {
      label: 'SLA at risk',
      value: c.risk ?? 0,
      hint: `${c.breached ?? 0} already breached`,
      icon: AlertTriangle,
      tone: (c.breached ?? 0) > 0 ? 'critical' : (c.risk ?? 0) > 0 ? 'caution' : 'positive',
      href: '/bugs?slaStatus=at_risk',
    },
    {
      label: 'Reopened',
      value: c.reopened ?? 0,
      hint: report ? `${report.reopenRatePercent ?? 0}% of every defect ever raised` : 'fixes that did not hold',
      icon: RotateCcw,
      tone: (c.reopened ?? 0) > 0 ? 'caution' : 'positive',
      href: '/bugs?status=reopened',
    },
  ]

  const headline = data
    ? [
        `${live} live defect${live === 1 ? '' : 's'}`,
        (c.awaiting ?? 0) > 0 ? `${c.awaiting} waiting on your verification` : 'nothing waiting on you',
        (c.breached ?? 0) > 0 ? `${c.breached} past SLA` : null,
        report?.slaCompliancePercent != null ? `${report.slaCompliancePercent}% SLA compliance` : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : 'Loading the defect picture…'

  // The last eight weeks of intake, newest at the right.
  const trend = (report?.trend || []).slice(-8)
  const recent = trend.slice(-4)
  const recentReported = recent.reduce((n, w) => n + w.reported, 0)
  const recentResolved = recent.reduce((n, w) => n + w.resolved, 0)
  const stillOpen = recentReported - recentResolved

  const quality = [
    {
      label: 'SLA compliance',
      value: report?.slaCompliancePercent == null ? '—' : `${report.slaCompliancePercent}%`,
      hint: 'of defects whose clock has finished',
      icon: Gauge,
      tone: complianceTone(report?.slaCompliancePercent),
    },
    {
      label: 'Reopen rate',
      value: `${report?.reopenRatePercent ?? 0}%`,
      hint: 'fixes that came back',
      icon: RotateCcw,
      tone: reopenTone(report?.reopenRatePercent),
    },
    {
      label: 'Avg. first response',
      value: report?.avgResponseHours == null ? '—' : `${report.avgResponseHours}h`,
      hint: 'raised to first action',
      icon: Timer,
      tone: 'neutral',
    },
    {
      label: 'Avg. resolution',
      value: report?.avgResolutionHours == null ? '—' : `${report.avgResolutionHours}h`,
      hint: 'raised to fixed',
      icon: Clock,
      tone: 'neutral',
    },
  ]

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-4">
      <HeroBand
        accent="teal"
        eyebrow="QC Workspace"
        title={`Welcome${user?.name ? `, ${user.name}` : ''}`}
        headline={headline}
        action={
          <Link
            href="/bugs?new=1"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-hover"
          >
            <Plus aria-hidden="true" className="h-4 w-4" /> Report a bug
          </Link>
        }
      >
        <p className="relative rounded-xl border border-teal-100 bg-white/70 px-3 py-2 text-xs text-slate-600">
          Bugs you raise reach developers as tasks, so they never have to open this module. Closing one is yours alone —
          a fix stays in verification until you accept it.
        </p>
      </HeroBand>

      {error && (
        <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </p>
      )}

      <AttentionStrip
        items={attention}
        loading={loading}
        allClear="No breaches, nothing at risk, nothing waiting on your verification. All clear."
      />

      <section aria-label="Defect statistics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <MetricTile key={t.label} {...t} loading={loading} />
        ))}
      </section>

      <section aria-label="Quality indicators" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {quality.map((q) => (
          <MetricTile key={q.label} {...q} loading={loading} />
        ))}
      </section>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel title="Where this month's defects stand" icon={TrendingUp} href="/reports">
          {!data ? <Loading /> : trend.length === 0 ? <Empty>No defects reported yet.</Empty> : (
            <>
              <MiniBars
                height={72}
                label={`Defects reported each week and how many are resolved today: ${trend
                  .map((w) => `week of ${shortDate(w.week)}, ${w.reported} reported, ${w.resolved} resolved`)
                  .join('; ')}`}
                columns={trend.map((w) => ({
                  key: w.week,
                  label: shortDate(w.week),
                  bars: [
                    { value: w.reported, tone: 'info', title: `${w.reported} reported in the week of ${shortDate(w.week)}` },
                    { value: w.resolved, tone: 'positive', title: `${w.resolved} of them resolved` },
                  ],
                }))}
                legend={
                  <>
                    <LegendDot tone="info">Reported that week</LegendDot>
                    <LegendDot tone="positive">Of those, resolved today</LegendDot>
                  </>
                }
              />
              <p className="mt-2 text-[11px] leading-4 text-slate-600">
                Last four weeks: <strong className="tabular-nums">{recentReported}</strong> reported,{' '}
                <strong className="tabular-nums">{recentResolved}</strong> of them resolved —{' '}
                {stillOpen > 0 ? (
                  <span className="font-semibold text-amber-700">{stillOpen} still open</span>
                ) : (
                  <span className="font-semibold text-emerald-700">all cleared</span>
                )}
                .
              </p>
              <p className="mt-1 text-[10px] leading-4 text-slate-400">
                Both bars are the same cohort: the week a defect was reported, and how much of that week has since been
                resolved. The gap is that week&apos;s backlog, not a slower month.
              </p>
            </>
          )}
        </Panel>

        <Panel title="Severity mix" icon={CircleDot} href="/bugs">
          {!data ? <Loading /> : (
            <>
              <ShareBar
                empty="No defects to break down yet."
                segments={(report?.bySeverity || []).map((s) => ({
                  key: s.severity,
                  label: SEVERITY_LABELS[s.severity] ?? s.severity,
                  value: s.count,
                  className: SEVERITY_BAR[s.severity] ?? 'bg-slate-400',
                }))}
              />
              <p className="mt-2 text-[10px] leading-4 text-slate-400">
                Every defect ever raised. Critical runs on wall-clock time; every other severity is measured against an
                8-hour, Monday-to-Friday calendar, which is why a high-severity bug raised on Friday is not late on
                Monday morning.
              </p>
            </>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel
          title="Waiting for your verification"
          icon={ShieldCheck}
          badge={c.awaiting}
          href="/bugs?status=fixed,qa_verification"
          linkLabel="View all"
        >
          {!data ? <Loading /> : data.verify.length === 0 ? <Empty>Nothing to verify — the queue is clear.</Empty> : (
            <RowList>
              {data.verify.map((b) => {
                const waited = daysSince(b.updatedAt, data.nowMs)
                return (
                  <BugRow
                    key={b.id}
                    bug={b}
                    trailing={
                      <Flag
                        tone={waited >= VERIFY_STALE_DAYS ? 'caution' : 'neutral'}
                        title={`Marked fixed ${formatRelativeTime(b.updatedAt)}`}
                      >
                        {waited === 0 ? 'today' : `${waited}d`}
                      </Flag>
                    }
                  />
                )
              })}
            </RowList>
          )}
        </Panel>

        <Panel title="Close to their deadline" icon={AlertTriangle} badge={c.risk} href="/bugs?slaStatus=at_risk" linkLabel="View all">
          {!data ? <Loading /> : data.atRisk.length === 0 ? <Empty>No live defect is close to its deadline.</Empty> : (
            <RowList>
              {data.atRisk.map((b) => (
                <BugRow
                  key={b.id}
                  bug={b}
                  trailing={
                    <Flag tone="caution" title={b.assignee?.name ? `Assigned to ${b.assignee.name}` : 'Unassigned'}>
                      {b.sla?.label ?? 'due soon'}
                    </Flag>
                  }
                />
              ))}
            </RowList>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel title="Fix load by developer" icon={UserCog} href="/reports">
          {!data ? <Loading /> : (report?.byDeveloper || []).length === 0 ? (
            <Empty>No defect is assigned to anyone yet.</Empty>
          ) : (
            <RowList>
              {report.byDeveloper.slice(0, 8).map((dev) => (
                <li key={dev.name ?? 'unknown'} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs">
                  <span className="min-w-0 flex-1 truncate font-medium text-slate-800">{dev.name ?? 'Unknown user'}</span>
                  <span className="shrink-0 text-[10px] text-slate-500">
                    <strong className="tabular-nums text-slate-800">{dev.closed}</strong>/{dev.count} closed
                  </span>
                  {dev.breached > 0 && (
                    <Flag tone="critical" title={`${dev.breached} breached their SLA`}>{dev.breached} late</Flag>
                  )}
                </li>
              ))}
            </RowList>
          )}
          <p className="mt-auto pt-2 text-[10px] text-slate-400">
            Assignment and triage stay with the lead; this is here so a reassignment can be asked for with a number
            behind it.
          </p>
        </Panel>

        <Panel title="My recent reports" icon={Bug} href={`/bugs?reporterId=${user?.id ?? ''}`} linkLabel="View all">
          {!data ? <Loading /> : data.mine.length === 0 ? <Empty>You have not reported any defects yet.</Empty> : (
            <RowList>
              {data.mine.map((b) => (
                <BugRow
                  key={b.id}
                  bug={b}
                  trailing={
                    <Flag tone={b.status === 'closed' ? 'positive' : 'neutral'} title={formatRelativeTime(b.createdAt)}>
                      {b.statusLabel}
                    </Flag>
                  }
                />
              ))}
            </RowList>
          )}
        </Panel>
      </div>
    </div>
  )
}
