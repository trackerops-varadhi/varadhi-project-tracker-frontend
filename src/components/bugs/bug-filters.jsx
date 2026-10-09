'use client'

import { Search, X } from 'lucide-react'

import {
  BUG_STATUS_ORDER, BUG_STATUS_LABELS,
  BUG_SEVERITIES, BUG_SEVERITY_LABELS,
  BUG_PRIORITIES, BUG_PRIORITY_LABELS,
  BUG_ENVIRONMENTS, BUG_ENVIRONMENT_LABELS,
  SLA_STATUSES, SLA_STATUS_LABELS,
} from '@/constants/bugs'
import { cn } from '@/utils'

// Shared classes so every control on the bar lines up.
const CONTROL =
  'h-9 px-2.5 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-violet-500'

/**
 * Filter bar for the bug list (§10).
 *
 * Purely presentational: it owns no state and applies no filtering. The parent
 * holds the filter object and sends it to the backend, so what is on screen is
 * always a page the SERVER filtered — never a client-side slice of loaded rows.
 */
export function BugFilters({
  filters,
  onChange,
  onClear,
  projects = [],
  users = [],
  isLoading = false,
}) {
  const set = (key) => (event) => onChange({ ...filters, [key]: event.target.value, page: 1 })

  // Any filter other than the default sort/page counts as "active" and enables
  // the Clear button.
  const activeCount = [
    'search', 'projectId', 'assigneeId', 'reporterId', 'status',
    'severity', 'priority', 'slaStatus', 'environment', 'dateFrom', 'dateTo',
  ].filter((key) => filters[key] && filters[key] !== 'all').length

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-3">

      {/* Row 1 — search + clear */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={set('search')}
            placeholder="Search by bug ID, title, description, project or developer..."
            className="w-full h-9 pl-9 pr-3 text-sm border border-border rounded-lg bg-card placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-sm rounded-lg border border-border text-muted-foreground hover:bg-background transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear Filters
            <span className="ml-1 text-xs bg-violet-100 text-violet-700 px-1.5 rounded-full">
              {activeCount}
            </span>
          </button>
        )}
      </div>

      {/* Row 2 — the dropdowns */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2">
        <select
          value={filters.projectId || 'all'}
          onChange={set('projectId')}
          disabled={isLoading}
          className={cn(CONTROL, 'w-full')}
          aria-label="Filter by project"
        >
          <option value="all">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          value={filters.assigneeId || 'all'}
          onChange={set('assigneeId')}
          disabled={isLoading}
          className={cn(CONTROL, 'w-full')}
          aria-label="Filter by developer"
        >
          <option value="all">All Developers</option>
          <option value="unassigned">Unassigned</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>

        <select
          value={filters.reporterId || 'all'}
          onChange={set('reporterId')}
          disabled={isLoading}
          className={cn(CONTROL, 'w-full')}
          aria-label="Filter by reporter"
        >
          <option value="all">All Reporters</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>

        <select
          value={filters.status || 'all'}
          onChange={set('status')}
          disabled={isLoading}
          className={cn(CONTROL, 'w-full')}
          aria-label="Filter by status"
        >
          <option value="all">All Statuses</option>
          {BUG_STATUS_ORDER.map((s) => (
            <option key={s} value={s}>{BUG_STATUS_LABELS[s]}</option>
          ))}
        </select>

        <select
          value={filters.severity || 'all'}
          onChange={set('severity')}
          disabled={isLoading}
          className={cn(CONTROL, 'w-full')}
          aria-label="Filter by severity"
        >
          <option value="all">All Severities</option>
          {BUG_SEVERITIES.map((s) => (
            <option key={s} value={s}>{BUG_SEVERITY_LABELS[s]}</option>
          ))}
        </select>

        <select
          value={filters.priority || 'all'}
          onChange={set('priority')}
          disabled={isLoading}
          className={cn(CONTROL, 'w-full')}
          aria-label="Filter by priority"
        >
          <option value="all">All Priorities</option>
          {BUG_PRIORITIES.map((p) => (
            <option key={p} value={p}>{BUG_PRIORITY_LABELS[p]}</option>
          ))}
        </select>

        <select
          value={filters.slaStatus || 'all'}
          onChange={set('slaStatus')}
          disabled={isLoading}
          className={cn(CONTROL, 'w-full')}
          aria-label="Filter by SLA status"
        >
          <option value="all">All SLA</option>
          {SLA_STATUSES.map((s) => (
            <option key={s} value={s}>{SLA_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* Row 3 — environment + date range */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={filters.environment || 'all'}
          onChange={set('environment')}
          disabled={isLoading}
          className={cn(CONTROL, 'w-[160px]')}
          aria-label="Filter by environment"
        >
          <option value="all">All Environments</option>
          {BUG_ENVIRONMENTS.map((e) => (
            <option key={e} value={e}>{BUG_ENVIRONMENT_LABELS[e]}</option>
          ))}
        </select>

        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="bug-date-from" className="text-xs text-muted-foreground">
            Reported
          </label>
          <input
            id="bug-date-from"
            type="date"
            value={filters.dateFrom || ''}
            onChange={set('dateFrom')}
            disabled={isLoading}
            className={cn(CONTROL, 'w-[150px]')}
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            id="bug-date-to"
            type="date"
            value={filters.dateTo || ''}
            onChange={set('dateTo')}
            disabled={isLoading}
            className={cn(CONTROL, 'w-[150px]')}
          />
        </div>
      </div>
    </div>
  )
}
