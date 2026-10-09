'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bug, ShieldCheck, RotateCcw, Clock, ExternalLink } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts'

import { bugsApi } from '@/lib/api/bugs.api'
import { BUG_SEVERITY_LABELS } from '@/constants/bugs'
import { cn } from '@/utils'
import { useAuthStore } from '@/store/auth.store'
import { useHasMounted } from '@/hooks/use-has-mounted'

// Same severity palette the Bugs Finder dashboard uses, so a defect chart
// means the same thing wherever it appears.
const SEVERITY_FILL = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#f59e0b',
  low: '#94a3b8',
}

function Stat({ label, value, hint, tone = 'slate', icon: Icon }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={cn(
        'text-xl font-semibold leading-none',
        tone === 'red' ? 'text-red-600' : tone === 'green' ? 'text-green-600' : 'text-foreground'
      )}>
        {value}
      </p>
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  )
}

/**
 * Defect metrics on the Reports page (§26).
 *
 * Reads /api/bugs/reports, which is admin/manager-only on the backend — the
 * same audience the Reports route itself is limited to in NAV_ITEMS.
 */
// Role workspaces: defect metrics are QC's data (admin and qc). The Reports
// page is shared with managers, who have no Bugs module, so the card hides
// itself for them instead of rendering a 403.
export function DefectMetricsCard() {
  const mounted = useHasMounted()
  const role = useAuthStore((s) => s.user?.role)
  if (!mounted || !['admin', 'qc'].includes(role)) return null
  return <DefectMetricsCardContent />
}

function DefectMetricsCardContent() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    bugsApi
      .getReports()
      .then((res) => { if (active) setData(res) })
      .catch(() => { if (active) setError(true) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="h-4 w-32 bg-slate-100 rounded mb-4 animate-pulse" />
        <div className="h-48 bg-slate-50 rounded animate-pulse" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Defect Metrics</h3>
        <p className="text-xs text-slate-400">Couldn&apos;t load defect metrics.</p>
      </div>
    )
  }

  const severityData = data.bySeverity.map((s) => ({
    name: BUG_SEVERITY_LABELS[s.severity],
    value: s.count,
    fill: SEVERITY_FILL[s.severity],
  }))
  const hasSeverity = severityData.some((s) => s.value > 0)

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-start justify-between mb-1">
        <h3 className="text-sm font-semibold text-foreground inline-flex items-center gap-2">
          <Bug className="w-4 h-4 text-red-500" />
          Defect Metrics
        </h3>
        <Link
          href="/bugs"
          className="text-xs text-violet-600 hover:underline inline-flex items-center gap-1"
        >
          Bugs Finder
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Quality and SLA performance across every project
      </p>

      {/* Headline numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Stat label="Total Defects" value={data.totals.total} />
        <Stat label="Open" value={data.totals.open} />
        <Stat label="Closed" value={data.totals.closed} tone="green" />
        <Stat
          label="Critical"
          value={data.totals.critical}
          tone={data.totals.critical > 0 ? 'red' : 'slate'}
        />
        <Stat
          label="SLA Compliance"
          icon={ShieldCheck}
          value={data.slaCompliancePercent === null ? '—' : `${data.slaCompliancePercent}%`}
          hint={data.slaCompliancePercent === null ? 'No resolved defects yet' : 'Of resolved defects'}
          tone={
            data.slaCompliancePercent === null ? 'slate'
              : data.slaCompliancePercent >= 90 ? 'green'
              : data.slaCompliancePercent < 70 ? 'red' : 'slate'
          }
        />
        <Stat
          label="Avg Resolution"
          icon={Clock}
          value={data.avgResolutionHours !== null ? `${data.avgResolutionHours}h` : '—'}
        />
        <Stat
          label="Avg Response"
          icon={Clock}
          value={data.avgResponseHours !== null ? `${data.avgResponseHours}h` : '—'}
        />
        <Stat
          label="Reopen Rate"
          icon={RotateCcw}
          value={`${data.reopenRatePercent}%`}
          tone={data.reopenRatePercent > 20 ? 'red' : 'slate'}
          hint="Defects sent back by QA"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Defects by severity */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Defects by Severity</h4>
          {hasSeverity ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {severityData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-slate-400 py-12 text-center">No defects recorded yet.</p>
          )}
        </div>

        {/* Defects by developer */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Defects by Developer</h4>
          {data.byDeveloper.length ? (
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {data.byDeveloper.map((d) => (
                <div
                  key={d.name}
                  className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-0"
                >
                  <span className="text-foreground truncate pr-2">{d.name}</span>
                  <span className="flex items-center gap-2.5 whitespace-nowrap">
                    <span className="text-muted-foreground">{d.count} total</span>
                    <span className="text-green-600">{d.closed} closed</span>
                    {d.breached > 0 && (
                      <span className="text-red-600 font-medium">{d.breached} breached</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-12 text-center">No defects assigned yet.</p>
          )}
        </div>
      </div>

      {/* Defects by project */}
      {data.byProject.length > 0 && (
        <div className="mt-5">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Defects by Project</h4>
          <div className="space-y-2">
            {data.byProject.slice(0, 6).map((p) => {
              const max = Math.max(...data.byProject.map((x) => x.count), 1)
              return (
                <div key={p.project}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-foreground truncate pr-2">{p.project}</span>
                    <span className="text-muted-foreground whitespace-nowrap">
                      {p.closed} closed / {p.count}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-400 rounded-full"
                      style={{ width: `${(p.count / max) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
