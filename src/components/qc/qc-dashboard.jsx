'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bug, CircleDot, ShieldCheck, AlertTriangle, Clock, RotateCcw, Plus } from 'lucide-react'

import { bugsApi } from '@/lib/api/bugs.api'
import { useAuthStore } from '@/store/auth.store'
import { StatCard } from '@/components/shared/stat-card'
import { formatRelativeTime } from '@/utils'

const errorMessage = (err, fallback) => err?.response?.data?.message || fallback

const SEVERITY_CLASS = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-slate-100 text-slate-700',
}

// The total for one filter, from a one-row page.
const countOf = (filters) => bugsApi.getAll(filters, 1, 1).then((d) => d.total ?? 0)

function BugRow({ bug }) {
  return (
    <li>
      <Link href={`/bugs/${bug.id}`} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-slate-50">
        <span className="w-16 shrink-0 font-semibold text-slate-500">{bug.key}</span>
        <span className="min-w-0 flex-1 truncate text-slate-800">{bug.title}</span>
        <span className={`rounded px-1.5 py-0.5 text-[10px] capitalize ${SEVERITY_CLASS[bug.severity]}`}>{bug.severity}</span>
        <span className="hidden w-24 shrink-0 truncate text-right text-slate-400 sm:block">{bug.assignee?.name ?? 'Unassigned'}</span>
      </Link>
    </li>
  )
}

function ListCard({ title, icon: Icon, bugs, empty, href }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
          <Icon aria-hidden="true" className="h-4 w-4 text-primary" /> {title}
        </h2>
        {href && <Link href={href} className="text-xs font-medium text-primary hover:underline">View all</Link>}
      </div>
      {bugs === null ? (
        <p className="py-4 text-center text-xs text-slate-400">Loading…</p>
      ) : bugs.length === 0 ? (
        <p className="py-4 text-center text-xs text-slate-500">{empty}</p>
      ) : (
        <ul className="divide-y divide-slate-50">{bugs.map((b) => <BugRow key={b.id} bug={b} />)}</ul>
      )}
    </section>
  )
}

/**
 * The QC Workspace home: what needs QC's attention right now — fixes waiting
 * to be verified, SLA risk, and the overall defect picture.
 */
export function QcDashboard() {
  const user = useAuthStore((s) => s.user)
  const [counts, setCounts] = useState(null)
  const [verify, setVerify] = useState(null)
  const [atRisk, setAtRisk] = useState(null)
  const [mine, setMine] = useState(null)
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.id) return undefined
    let active = true
    Promise.all([
      countOf({ status: 'open,assigned,reopened' }),
      countOf({ status: 'in_progress' }),
      countOf({ status: 'fixed,qa_verification' }),
      countOf({ slaStatus: 'at_risk' }),
      countOf({ slaStatus: 'breached', status: 'open,assigned,in_progress,reopened,fixed,qa_verification' }),
      countOf({ status: 'reopened' }),
      bugsApi.getAll({ status: 'fixed,qa_verification', sortBy: 'updatedAt', sortDir: 'asc' }, 1, 8),
      bugsApi.getAll({ slaStatus: 'at_risk' }, 1, 8),
      bugsApi.getAll({ reporterId: user.id }, 1, 6),
      bugsApi.getReports().catch(() => null),
    ])
      .then(([open, inProgress, awaiting, risk, breached, reopened, v, r, m, rep]) => {
        if (!active) return
        setCounts({ open, inProgress, awaiting, risk, breached, reopened })
        setVerify(v.data ?? [])
        setAtRisk(r.data ?? [])
        setMine(m.data ?? [])
        setReport(rep)
      })
      .catch((err) => { if (active) setError(errorMessage(err, 'Could not load the QC dashboard.')) })
    return () => { active = false }
  }, [user?.id])

  const c = counts || {}
  const cards = [
    { title: 'Open / to fix', value: c.open, subtitle: 'open, assigned, reopened', icon: Bug, href: '/bugs?status=open,assigned,reopened' },
    { title: 'In progress', value: c.inProgress, subtitle: 'developers working', icon: CircleDot, href: '/bugs?status=in_progress' },
    { title: 'Awaiting verification', value: c.awaiting, subtitle: 'fixed — verify and close', icon: ShieldCheck, href: '/bugs?status=fixed,qa_verification' },
    { title: 'SLA at risk', value: c.risk, subtitle: `${c.breached ?? 0} breached`, icon: AlertTriangle, href: '/bugs?slaStatus=at_risk' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">QC Dashboard</h1>
          <p className="text-sm text-slate-500">
            Welcome{user?.name ? `, ${user.name}` : ''}. Bugs reported by QC reach developers as tasks; verify their fixes here.
          </p>
        </div>
        <Link href="/bugs?new=1" className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-hover">
          <Plus size={14} /> Report a bug
        </Link>
      </div>

      {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}

      <section aria-label="Bug statistics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.title} title={card.title} value={card.value ?? 0} subtitle={counts ? card.subtitle : null}
            icon={card.icon} href={card.href} loading={!counts && !error} />
        ))}
      </section>

      {report && (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-sm">
            <p className="text-slate-500">SLA compliance</p>
            <p className="text-2xl font-bold tabular-nums text-slate-900">{report.slaCompliancePercent == null ? '—' : `${report.slaCompliancePercent}%`}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-sm">
            <p className="flex items-center gap-1 text-slate-500"><RotateCcw size={12} /> Reopen rate</p>
            <p className="text-2xl font-bold tabular-nums text-slate-900">{report.reopenRatePercent ?? 0}%</p>
            <p className="text-[10px] text-slate-400">{c.reopened ?? 0} currently reopened</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-sm">
            <p className="flex items-center gap-1 text-slate-500"><Clock size={12} /> Avg. resolution</p>
            <p className="text-2xl font-bold tabular-nums text-slate-900">{report.avgResolutionHours == null ? '—' : `${report.avgResolutionHours}h`}</p>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <ListCard title="Waiting for your verification" icon={ShieldCheck} bugs={verify}
          empty="Nothing to verify." href="/bugs?status=fixed,qa_verification" />
        <ListCard title="SLA at risk" icon={AlertTriangle} bugs={atRisk}
          empty="No live bug is close to its deadline." href="/bugs?slaStatus=at_risk" />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-slate-800">My recent reports</h2>
        {mine === null ? <p className="py-3 text-center text-xs text-slate-400">Loading…</p>
          : mine.length === 0 ? <p className="py-3 text-center text-xs text-slate-500">You have not reported any bugs yet.</p>
          : (
            <ul className="divide-y divide-slate-50">
              {mine.map((b) => (
                <li key={b.id}>
                  <Link href={`/bugs/${b.id}`} className="flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-slate-50">
                    <span className="w-16 shrink-0 font-semibold text-slate-500">{b.key}</span>
                    <span className="min-w-0 flex-1 truncate text-slate-800">{b.title}</span>
                    <span className="text-slate-500">{b.statusLabel}</span>
                    <span className="hidden w-24 text-right text-slate-400 sm:block">{formatRelativeTime(b.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
      </section>
    </div>
  )
}
