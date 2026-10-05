'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Plus, Bug, MoreHorizontal, Eye, Pencil, UserPlus,
  CircleDot, MessageSquarePlus, Trash2, ArrowUpDown, ChevronUp, ChevronDown,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { BugFilters } from './bug-filters'
import { CreateBugModal } from './create-bug-modal'
import { BugStatusBadge, BugSeverityBadge, BugPriorityBadge } from './bug-badge'
import { SlaIndicator } from './sla-indicator'
import { bugsApi } from '@/lib/api/bugs.api'
import { projectsApi } from '@/lib/api/projects.api'
import { usersApi } from '@/lib/api/users.api'
import { useAuthStore } from '@/store/auth.store'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { BUGS_PER_PAGE } from '@/constants/bugs'
import { formatDate, getInitials, getAvatarColor, cn } from '@/utils'

const EMPTY_FILTERS = {
  search: '', projectId: 'all', assigneeId: 'all', reporterId: 'all',
  status: 'all', severity: 'all', priority: 'all', slaStatus: 'all',
  environment: 'all', dateFrom: '', dateTo: '',
}

function BugRowSkeleton() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 11 }).map((_, i) => (
        <td key={i} className="px-3 py-3">
          <div className="h-3 bg-slate-100 rounded" style={{ width: i === 1 ? 180 : 60 }} />
        </td>
      ))}
    </tr>
  )
}

// Menu height is needed before the menu renders, to decide whether it opens
// downward or flips up. Rows are a fixed set of items, so a constant is both
// accurate enough and avoids a measure-then-reposition flicker.
const MENU_WIDTH = 208 // w-52
const MENU_ROW = 36
const MENU_PADDING = 8
const MENU_DIVIDER = 9

function BugActionsMenu({ bug, canManage, canDelete, onChanged }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  // Viewport coordinates for the fixed-position menu, set when it opens.
  const [coords, setCoords] = useState(null)
  const buttonRef = useRef(null)

  const itemCount = 3 + (canManage ? 1 : 0) + 1 + (canDelete ? 1 : 0)
  const menuHeight = itemCount * MENU_ROW + MENU_PADDING + (canDelete ? MENU_DIVIDER : 0)

  // The table sits inside `overflow-hidden` + `overflow-x-auto` wrappers, and
  // an absolutely-positioned menu is clipped by those no matter how high its
  // z-index is — which is why this menu is positioned `fixed` against the
  // viewport instead, from the trigger's own bounding box.
  const openMenu = () => {
    const rect = buttonRef.current?.getBoundingClientRect()
    if (!rect) return

    // Flip upward when there isn't room below, so the menu is never pushed off
    // the bottom of the window.
    const spaceBelow = window.innerHeight - rect.bottom
    const flipUp = spaceBelow < menuHeight + 16 && rect.top > menuHeight + 16

    setCoords({
      top: flipUp ? rect.top - menuHeight - 8 : rect.bottom + 8,
      // Right-aligned to the trigger, clamped so it can never sit off-screen.
      left: Math.max(8, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8)),
    })
    setOpen(true)
  }

  // A fixed menu does not travel with the row, so close it if the page or the
  // table scrolls underneath it rather than leaving it stranded.
  useEffect(() => {
    if (!open) return undefined
    const close = () => setOpen(false)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [open])

  const go = (suffix = '') => {
    setOpen(false)
    router.push(`/bugs/${bug.id}${suffix}`)
  }

  async function handleDelete() {
    if (!window.confirm(`Delete ${bug.key} "${bug.title}"? This cannot be undone.`)) {
      setOpen(false)
      return
    }
    setBusy(true)
    try {
      await bugsApi.delete(bug.id)
      setOpen(false)
      onChanged?.()
    } catch (err) {
      window.alert(err.response?.data?.message || 'Failed to delete the bug.')
    } finally {
      setBusy(false)
    }
  }

  const item = 'w-full text-left px-3 py-2 text-sm text-foreground hover:bg-background flex items-center gap-2'

  return (
    <div className="inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (open) setOpen(false)
          else openMenu()
        }}
        className="text-slate-400 hover:text-muted-foreground p-1 rounded hover:bg-slate-100"
        aria-label={`Actions for ${bug.key}`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && coords && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div
            role="menu"
            style={{ top: coords.top, left: coords.left, width: MENU_WIDTH }}
            className="fixed bg-card border border-border rounded-xl shadow-lg z-[9999] py-1"
          >
            <button onClick={() => go()} className={item}>
              <Eye className="w-3.5 h-3.5 text-slate-400" /> View Bug
            </button>
            <button onClick={() => go('?edit=true')} className={item}>
              <Pencil className="w-3.5 h-3.5 text-slate-400" /> Edit Bug
            </button>
            <button onClick={() => go('#status')} className={item}>
              <CircleDot className="w-3.5 h-3.5 text-slate-400" /> Change Status
            </button>
            {canManage && (
              <button onClick={() => go('#assign')} className={item}>
                <UserPlus className="w-3.5 h-3.5 text-slate-400" /> Assign Developer
              </button>
            )}
            <button onClick={() => go('#comments')} className={item}>
              <MessageSquarePlus className="w-3.5 h-3.5 text-slate-400" /> Add Comment
            </button>
            {canDelete && (
              <>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={handleDelete}
                  disabled={busy}
                  className={cn(item, 'text-red-500 hover:bg-red-50', busy && 'opacity-50 cursor-not-allowed')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {busy ? 'Deleting…' : 'Delete Bug'}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function SortHeader({ label, column, sortBy, sortDir, onSort, className }) {
  const active = sortBy === column
  const Icon = !active ? ArrowUpDown : sortDir === 'asc' ? ChevronUp : ChevronDown
  return (
    <th className={cn('text-left px-3 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap', className)}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn('inline-flex items-center gap-1 hover:text-foreground', active && 'text-foreground')}
      >
        {label}
        <Icon className="w-3 h-3" />
      </button>
    </th>
  )
}

/**
 * The bug management table (§9).
 *
 * Search, filters, sorting and pagination all round-trip to the backend — the
 * browser only ever holds one page of rows (§24). `projectId` pins the list to
 * a single project when embedded in the project detail page.
 */
export function BugsList({ projectId = null, embedded = false, onCountChange }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()
  const mounted = useHasMounted()

  const canManage = mounted && ['admin', 'manager'].includes(user?.role)
  const canDelete = mounted && user?.role === 'admin'

  const [filters, setFilters] = useState({
    ...EMPTY_FILTERS,
    // Honour a search term handed over by the topbar, matching how the tasks
    // list picks up ?search=.
    search: searchParams?.get('search') || '',
    ...(projectId ? { projectId } : {}),
  })
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)

  const [bugs, setBugs] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [notice, setNotice] = useState(null)

  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])

  // Guards against an older, slower request overwriting a newer response.
  const requestRef = useRef(0)

  const fetchBugs = useCallback(async () => {
    const requestId = requestRef.current + 1
    requestRef.current = requestId

    setIsLoading(true)
    setError(null)
    try {
      const query = { ...filters, sortBy, sortDir }
      // When embedded the project is fixed, so it is sent as a path param
      // rather than a filter the user could change.
      const res = projectId
        ? await bugsApi.getByProject(projectId, { ...query, projectId: undefined }, page, BUGS_PER_PAGE)
        : await bugsApi.getAll(query, page, BUGS_PER_PAGE)

      if (requestRef.current !== requestId) return

      setBugs(res?.data || [])
      setTotal(res?.total || 0)
      setTotalPages(res?.totalPages || 1)
      onCountChange?.(res?.total || 0)
    } catch (err) {
      if (requestRef.current !== requestId) return
      setError(
        err.response?.data?.message || 'Failed to load bugs. Check your connection and try again.'
      )
      setBugs([])
      setTotal(0)
    } finally {
      if (requestRef.current === requestId) setIsLoading(false)
    }
  }, [filters, sortBy, sortDir, page, projectId, onCountChange])

  // Debounced so typing in the search box does not fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(fetchBugs, 300)
    return () => clearTimeout(timer)
  }, [fetchBugs])

  // Lookup data for the filter dropdowns. Employees cannot read /users, so that
  // call is skipped for them rather than surfacing a 403.
  useEffect(() => {
    let active = true
    projectsApi
      .getAll()
      .then((res) => { if (active) setProjects(Array.isArray(res?.data ?? res) ? res?.data ?? res : []) })
      .catch(() => {})
    if (canManage) {
      usersApi
        .getAll()
        .then((res) => { if (active) setUsers(Array.isArray(res?.data ?? res) ? res?.data ?? res : []) })
        .catch(() => {})
    }
    return () => { active = false }
  }, [canManage])

  function handleSort(column) {
    if (sortBy === column) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(column)
      setSortDir('desc')
    }
    setPage(1)
  }

  function handleFilterChange(next) {
    setFilters(next)
    setPage(1)
  }

  function handleClear() {
    setFilters({ ...EMPTY_FILTERS, ...(projectId ? { projectId } : {}) })
    setPage(1)
  }

  const from = total === 0 ? 0 : (page - 1) * BUGS_PER_PAGE + 1
  const to = Math.min(page * BUGS_PER_PAGE, total)

  // Window the pager so a large backlog does not render hundreds of buttons.
  const pageNumbers = []
  const windowStart = Math.max(1, Math.min(page - 2, totalPages - 4))
  for (let p = windowStart; p <= Math.min(totalPages, windowStart + 4); p += 1) pageNumbers.push(p)

  return (
    <div className="space-y-4">

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div>
          {!embedded && (
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Loading bugs…' : `${total} bug${total === 1 ? '' : 's'} found`}
            </p>
          )}
        </div>
        {/* Reporting is admin/manager only, matching how the tasks list gates
            its own New Task button. The backend refuses an employee outright,
            so showing this to them would only produce a 403. */}
        {canManage && (
          <Button onClick={() => setShowCreate(true)} className="bg-violet-600 hover:bg-violet-700 shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            Report Bug
          </Button>
        )}
      </div>

      {notice && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg px-4 py-3">
          {notice}
        </div>
      )}

      {/* Filters */}
      <BugFilters
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClear}
        projects={projects}
        users={users}
        isLoading={isLoading}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {error}{' '}
          <button onClick={fetchBugs} className="underline font-medium">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-100 bg-background">
                <SortHeader label="Bug ID" column="bugNumber" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Bug Title" column="title" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} className="w-full" />
                <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">Project</th>
                <SortHeader label="Severity" column="severity" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Priority" column="priority" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Status" column="status" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">Developer</th>
                <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">Reporter</th>
                <SortHeader label="SLA" column="slaDueAt" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Created" column="createdAt" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <th className="px-3 py-3" />
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <BugRowSkeleton key={i} />)
              ) : bugs.length > 0 ? (
                bugs.map((bug) => (
                  <tr key={bug.id} className="hover:bg-background transition-colors">
                    <td className="px-3 py-3">
                      <Link
                        href={`/bugs/${bug.id}`}
                        className="text-xs font-mono font-medium text-violet-600 hover:underline whitespace-nowrap"
                      >
                        {bug.key}
                      </Link>
                    </td>

                    <td className="px-3 py-3">
                      <Link href={`/bugs/${bug.id}`} className="block max-w-md">
                        <p className="text-sm font-medium text-foreground hover:text-violet-600 line-clamp-2">
                          {bug.title}
                        </p>
                      </Link>
                    </td>

                    <td className="px-3 py-3">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {bug.project?.name || '—'}
                      </span>
                    </td>

                    <td className="px-3 py-3"><BugSeverityBadge severity={bug.severity} /></td>
                    <td className="px-3 py-3"><BugPriorityBadge priority={bug.priority} /></td>
                    <td className="px-3 py-3"><BugStatusBadge status={bug.status} /></td>

                    <td className="px-3 py-3">
                      {bug.assignee ? (
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0',
                            getAvatarColor(bug.assignee.name)
                          )}>
                            {getInitials(bug.assignee.name)}
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {bug.assignee.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Unassigned</span>
                      )}
                    </td>

                    <td className="px-3 py-3">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {bug.reporter?.name || '—'}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <SlaIndicator sla={bug.sla} compact />
                    </td>

                    <td className="px-3 py-3">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(bug.createdAt, 'MMM dd')}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      {/* The menu decides for itself whether to open up or
                          down, from its own position in the viewport. */}
                      <BugActionsMenu
                        bug={bug}
                        canManage={canManage}
                        canDelete={canDelete}
                        onChanged={fetchBugs}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="text-center py-16">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Bug className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">No bugs found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {Object.values(filters).some((v) => v && v !== 'all')
                        ? 'Try clearing your filters.'
                        : canManage
                        ? 'Nothing to fix right now. Report a bug when you find one.'
                        : 'No bugs are assigned to you right now.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Showing {from}–{to} of {total} bugs
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-50 hover:bg-background"
              >
                Previous
              </button>
              {pageNumbers.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={cn(
                    'w-8 h-8 rounded-lg text-sm transition',
                    page === p ? 'bg-violet-600 text-white' : 'border border-border hover:bg-background'
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-50 hover:bg-background"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateBugModal
          defaultProjectId={projectId || ''}
          onClose={() => setShowCreate(false)}
          onSuccess={(bug, meta) => {
            setShowCreate(false)
            if (meta?.failedAttachments?.length) {
              setNotice(
                `${bug.key} was reported, but these attachments failed to upload: ${meta.failedAttachments.join(', ')}. You can retry from the bug detail page.`
              )
            }
            fetchBugs()
          }}
        />
      )}
    </div>
  )
}
