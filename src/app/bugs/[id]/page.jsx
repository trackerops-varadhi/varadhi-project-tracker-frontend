'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Bug, Loader2, Pencil, Save, X, Trash2,
  FolderOpen, ListChecks, UserPlus, Clock, Plus,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BugStatusBadge, BugSeverityBadge, BugPriorityBadge, BugEnvironmentBadge } from '@/components/bugs/bug-badge'
import { SlaIndicator } from '@/components/bugs/sla-indicator'
import { BugComments } from '@/components/bugs/bug-comments'
import { BugActivity } from '@/components/bugs/bug-activity'
import { BugAttachments } from '@/components/bugs/bug-attachments'
import { bugsApi } from '@/lib/api/bugs.api'
import { usersApi } from '@/lib/api/users.api'
import { tasksApi } from '@/lib/api/tasks.api'
import { useAuthStore } from '@/store/auth.store'
import {
  BUG_TRANSITIONS, BUG_STATUS_LABELS, BUG_EMPLOYEE_STATUSES,
  BUG_SEVERITIES, BUG_SEVERITY_LABELS,
  BUG_PRIORITIES, BUG_PRIORITY_LABELS,
  BUG_ENVIRONMENTS, BUG_ENVIRONMENT_LABELS,
} from '@/constants/bugs'
import { formatDate, formatExactTime, getInitials, getAvatarColor, cn } from '@/utils'

const SELECT =
  'w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-card'

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-4 w-28 bg-slate-100 rounded" />
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <div className="h-7 w-1/2 bg-slate-100 rounded" />
        <div className="h-3 w-2/3 bg-slate-100 rounded" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border h-48" />
        ))}
      </div>
    </div>
  )
}

function Row({ label, icon: Icon, children }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <dt className="text-slate-400 inline-flex items-center gap-1.5 whitespace-nowrap">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </dt>
      <dd className="text-foreground font-medium text-right min-w-0">{children}</dd>
    </div>
  )
}

export default function BugDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()

  const isEmployee = String(user?.role || '').toLowerCase() === 'employee'
  const canManage = ['admin', 'manager'].includes(user?.role)
  const canDelete = user?.role === 'admin'

  const [bug, setBug] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)

  const [editing, setEditing] = useState(searchParams?.get('edit') === 'true')
  const [form, setForm] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [busyAction, setBusyAction] = useState(null)

  const [users, setUsers] = useState([])
  // Duplicate-of picker, only loaded when the user actually chooses that status.
  const [duplicateOf, setDuplicateOf] = useState('')
  const [pendingStatus, setPendingStatus] = useState('')
  const [candidates, setCandidates] = useState([])

  const buildForm = (data) => ({
    title: data.title ?? '',
    description: data.description ?? '',
    stepsToReproduce: data.stepsToReproduce ?? '',
    severity: data.severity ?? 'medium',
    priority: data.priority ?? 'p2',
    environment: data.environment ?? 'production',
    resolution: data.resolution ?? '',
    rootCause: data.rootCause ?? '',
  })

  const fetchBug = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await bugsApi.getById(id)
      setBug(data)
      setForm(buildForm(data))
    } catch (err) {
      const status = err.response?.status
      setError(
        status === 403
          ? 'You do not have permission to view this bug.'
          : status === 404
          ? 'This bug no longer exists.'
          : 'Failed to load this bug.'
      )
      setBug(null)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    // fetchBug only calls setState after its internal await — the same traced
    // false positive tasks/[id]/page.jsx documents for its own fetchTask.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBug()
  }, [fetchBug])

  // Only admins/managers can read the user list, and only they can assign.
  useEffect(() => {
    if (!canManage) return
    let active = true
    usersApi
      .getAll()
      .then((res) => { if (active) setUsers(Array.isArray(res?.data ?? res) ? res?.data ?? res : []) })
      .catch(() => {})
    return () => { active = false }
  }, [canManage])

  // Refresh the SLA countdown periodically so an at-risk bug flips to breached
  // without the user reloading. Only while the clock is actually running.
  const slaClockStopped = bug?.sla?.clockStopped
  const hasBug = Boolean(bug)

  useEffect(() => {
    if (!hasBug || slaClockStopped) return undefined
    const timer = setInterval(fetchBug, 60000)
    return () => clearInterval(timer)
  }, [hasBug, slaClockStopped, fetchBug])

  function handleFormChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSave() {
    setIsSaving(true)
    setActionError(null)
    try {
      // Send only what changed — an employee is limited to the fix-documentation
      // fields server-side, so a full payload would be refused outright.
      const payload = {}
      for (const [key, value] of Object.entries(form)) {
        const before = bug[key] ?? ''
        if (String(value ?? '') !== String(before)) payload[key] = value || null
      }
      if (!Object.keys(payload).length) {
        setEditing(false)
        return
      }
      const updated = await bugsApi.update(id, payload)
      setBug(updated)
      setForm(buildForm(updated))
      setEditing(false)
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to save your changes.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleStatusChange(nextStatus) {
    if (!nextStatus || nextStatus === bug.status) return

    // 'duplicate' needs a target bug, so it opens a picker instead of applying
    // immediately.
    if (nextStatus === 'duplicate') {
      setPendingStatus('duplicate')
      try {
        const res = await bugsApi.getAll({ projectId: bug.project?.id }, 1, 50)
        setCandidates((res?.data || []).filter((b) => b.id !== bug.id))
      } catch {
        setCandidates([])
      }
      return
    }

    await applyStatus(nextStatus)
  }

  async function applyStatus(nextStatus, extra = {}) {
    setBusyAction('status')
    setActionError(null)
    try {
      const updated = await bugsApi.updateStatus(id, nextStatus, extra)
      setBug(updated)
      setForm(buildForm(updated))
      setPendingStatus('')
      setDuplicateOf('')
      // Reload so the activity timeline picks up the new entries.
      await fetchBug()
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to change the status.')
    } finally {
      setBusyAction(null)
    }
  }

  async function handleAssign(assigneeId) {
    setBusyAction('assign')
    setActionError(null)
    try {
      await bugsApi.assign(id, assigneeId || null)
      await fetchBug()
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to assign the bug.')
    } finally {
      setBusyAction(null)
    }
  }

  async function handleCreateTask() {
    setBusyAction('task')
    setActionError(null)
    try {
      await bugsApi.createTask(id)
      await fetchBug()
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to create the development task.')
    } finally {
      setBusyAction(null)
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete ${bug.key} "${bug.title}"? This cannot be undone.`)) return
    setIsDeleting(true)
    try {
      await bugsApi.delete(id)
      router.push('/bugs')
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to delete the bug.')
      setIsDeleting(false)
    }
  }

  if (isLoading) return <DetailSkeleton />

  if (error || !bug) {
    return (
      <div className="space-y-4">
        <Link href="/bugs" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Back to Bugs Finder
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {error || 'Bug not found.'}{' '}
          <button onClick={fetchBug} className="underline font-medium">Retry</button>
        </div>
      </div>
    )
  }

  // Which statuses this user may move to from here. The backend re-checks both
  // the transition and the role, so this only avoids offering a refused option.
  const allowedStatuses = (BUG_TRANSITIONS[bug.status] || []).filter((s) =>
    isEmployee ? BUG_EMPLOYEE_STATUSES.includes(s) : true
  )
  const canChangeStatus =
    canManage || (isEmployee && bug.assignee?.id === user?.id && allowedStatuses.length > 0)
  const canEditFields = canManage || bug.reporter?.id === user?.id || bug.assignee?.id === user?.id

  return (
    <div className="space-y-6">

      <Link href="/bugs" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" />
        Back to Bugs Finder
      </Link>

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {actionError}
        </div>
      )}

      {/* --- Overview -------------------------------------------------------- */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-sm font-mono font-semibold text-violet-600">{bug.key}</span>
              <BugStatusBadge status={bug.status} />
              <BugSeverityBadge severity={bug.severity} />
              <BugPriorityBadge priority={bug.priority} />
              <BugEnvironmentBadge environment={bug.environment} />
              {bug.reopenCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-red-100 text-red-700">
                  Reopened {bug.reopenCount}×
                </span>
              )}
            </div>

            {editing ? (
              <div className="space-y-1.5">
                <Label htmlFor="title">Bug Title *</Label>
                <Input
                  id="title" name="title" value={form.title}
                  onChange={handleFormChange}
                  disabled={isSaving || isEmployee}
                />
              </div>
            ) : (
              <h2 className="text-2xl font-bold text-foreground break-words">{bug.title}</h2>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {editing ? (
              <>
                <Button
                  type="button"
                  className="bg-violet-600 hover:bg-violet-700"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                    : <><Save className="w-4 h-4 mr-2" />Save</>}
                </Button>
                <Button
                  type="button" variant="outline" disabled={isSaving}
                  onClick={() => { setForm(buildForm(bug)); setEditing(false) }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <>
                {canEditFields && (
                  <Button type="button" variant="outline" onClick={() => setEditing(true)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
                {canDelete && (
                  <Button
                    type="button" variant="outline" onClick={handleDelete} disabled={isDeleting}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    {isDeleting
                      ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting...</>
                      : <><Trash2 className="w-4 h-4 mr-2" />Delete</>}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Description + steps */}
        {editing ? (
          <div className="space-y-4 mt-5">
            <div className="space-y-1.5">
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description" name="description" rows={4}
                value={form.description} onChange={handleFormChange}
                disabled={isSaving || isEmployee}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stepsToReproduce">Steps to Reproduce</Label>
              <textarea
                id="stepsToReproduce" name="stepsToReproduce" rows={3}
                value={form.stepsToReproduce} onChange={handleFormChange}
                disabled={isSaving}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="severity">Severity</Label>
                <select
                  id="severity" name="severity" value={form.severity}
                  onChange={handleFormChange}
                  disabled={isSaving || isEmployee}
                  className={SELECT}
                >
                  {BUG_SEVERITIES.map((s) => (
                    <option key={s} value={s}>{BUG_SEVERITY_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority" name="priority" value={form.priority}
                  onChange={handleFormChange}
                  disabled={isSaving || isEmployee}
                  className={SELECT}
                >
                  {BUG_PRIORITIES.map((p) => (
                    <option key={p} value={p}>{BUG_PRIORITY_LABELS[p]}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="environment">Environment</Label>
                <select
                  id="environment" name="environment" value={form.environment}
                  onChange={handleFormChange}
                  disabled={isSaving || isEmployee}
                  className={SELECT}
                >
                  {BUG_ENVIRONMENTS.map((e) => (
                    <option key={e} value={e}>{BUG_ENVIRONMENT_LABELS[e]}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="resolution">Resolution</Label>
                <textarea
                  id="resolution" name="resolution" rows={3}
                  value={form.resolution} onChange={handleFormChange} disabled={isSaving}
                  placeholder="What was changed to fix this?"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none placeholder:text-slate-400"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rootCause">Root Cause</Label>
                <textarea
                  id="rootCause" name="rootCause" rows={3}
                  value={form.rootCause} onChange={handleFormChange} disabled={isSaving}
                  placeholder="Why did this happen?"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none placeholder:text-slate-400"
                />
              </div>
            </div>
            {isEmployee && (
              <p className="text-xs text-slate-400">
                As a developer you can document the resolution and root cause. Severity,
                priority and triage fields are managed by an admin or manager.
              </p>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                  {bug.description}
                </p>
              </div>
            </div>

            {bug.stepsToReproduce && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Steps to Reproduce</h3>
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                    {bug.stepsToReproduce}
                  </p>
                </div>
              </div>
            )}

            {(bug.resolution || bug.rootCause) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bug.resolution && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Resolution</h3>
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                        {bug.resolution}
                      </p>
                    </div>
                  </div>
                )}
                {bug.rootCause && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Root Cause</h3>
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                        {bug.rootCause}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- SLA / Assignment / Workflow -------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* SLA */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 inline-flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            SLA
          </h3>
          <div className="space-y-3">
            <SlaIndicator sla={bug.sla} />
            <dl className="space-y-2.5 pt-2 border-t border-slate-100">
              <Row label="Rule">
                {BUG_SEVERITY_LABELS[bug.sla.ruleSeverity] || bug.sla.ruleSeverity}
              </Row>
              <Row label="Started">
                {bug.sla.startedAt ? formatExactTime(bug.sla.startedAt) : '—'}
              </Row>
              <Row label="Response due">
                {bug.sla.responseDueAt ? formatExactTime(bug.sla.responseDueAt) : '—'}
              </Row>
              <Row label="Resolution due">
                {bug.sla.dueAt ? formatExactTime(bug.sla.dueAt) : '—'}
              </Row>
              <Row label="First response">
                {bug.sla.firstResponseAt ? formatExactTime(bug.sla.firstResponseAt) : 'Awaiting'}
              </Row>
              <Row label="Resolved">
                {bug.resolvedAt ? formatExactTime(bug.resolvedAt) : '—'}
              </Row>
            </dl>
          </div>
        </div>

        {/* Assignment */}
        <div className="bg-card rounded-xl border border-border p-5" id="assign">
          <h3 className="text-sm font-semibold text-foreground mb-4 inline-flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-slate-400" />
            Assignment
          </h3>

          <dl className="space-y-3">
            <Row label="Reporter">
              {bug.reporter ? (
                <span className="inline-flex items-center gap-2">
                  <span className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold',
                    getAvatarColor(bug.reporter.name)
                  )}>
                    {getInitials(bug.reporter.name)}
                  </span>
                  {bug.reporter.name}
                </span>
              ) : '—'}
            </Row>

            <Row label="Developer">
              {bug.assignee ? (
                <span className="inline-flex items-center gap-2">
                  <span className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold',
                    getAvatarColor(bug.assignee.name)
                  )}>
                    {getInitials(bug.assignee.name)}
                  </span>
                  {bug.assignee.name}
                </span>
              ) : (
                <span className="text-slate-400 font-normal">Unassigned</span>
              )}
            </Row>

            <Row label="Project" icon={FolderOpen}>
              {bug.project ? (
                <Link href={`/projects/${bug.project.id}`} className="text-violet-600 hover:underline">
                  {bug.project.name}
                </Link>
              ) : '—'}
            </Row>

            <Row label="Linked task" icon={ListChecks}>
              {bug.linkedTask ? (
                <Link href={`/tasks/${bug.linkedTask.id}`} className="text-violet-600 hover:underline">
                  {bug.linkedTask.title}
                </Link>
              ) : (
                <span className="text-slate-400 font-normal">None</span>
              )}
            </Row>

            {bug.duplicateOf && (
              <Row label="Duplicate of">
                <Link href={`/bugs/${bug.duplicateOf.id}`} className="text-violet-600 hover:underline">
                  {bug.duplicateOf.key}
                </Link>
              </Row>
            )}
          </dl>

          {canManage && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="assignee">Assign developer</Label>
                <select
                  id="assignee"
                  value={bug.assignee?.id || ''}
                  onChange={(e) => handleAssign(e.target.value)}
                  disabled={busyAction === 'assign'}
                  className={SELECT}
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              {!bug.linkedTask && bug.project && (
                <Button
                  type="button" variant="outline" className="w-full"
                  onClick={handleCreateTask}
                  disabled={busyAction === 'task'}
                >
                  {busyAction === 'task'
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>
                    : <><Plus className="w-4 h-4 mr-2" />Create Development Task</>}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Workflow */}
        <div className="bg-card rounded-xl border border-border p-5" id="status">
          <h3 className="text-sm font-semibold text-foreground mb-4 inline-flex items-center gap-2">
            <Bug className="w-4 h-4 text-slate-400" />
            Workflow
          </h3>

          <dl className="space-y-3 mb-4">
            <Row label="Status"><BugStatusBadge status={bug.status} /></Row>
            <Row label="Created">{formatDate(bug.createdAt)}</Row>
            <Row label="Updated">{formatDate(bug.updatedAt)}</Row>
            {bug.closedAt && <Row label="Closed">{formatDate(bug.closedAt)}</Row>}
          </dl>

          {canChangeStatus ? (
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <Label htmlFor="status-select">Change status</Label>
              <select
                id="status-select"
                value=""
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={busyAction === 'status'}
                className={SELECT}
              >
                <option value="">Select a transition...</option>
                {allowedStatuses.map((s) => (
                  <option key={s} value={s}>{BUG_STATUS_LABELS[s]}</option>
                ))}
              </select>
              {busyAction === 'status' && (
                <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Updating...
                </p>
              )}
              {allowedStatuses.length === 0 && (
                <p className="text-xs text-slate-400">
                  No transitions available from {BUG_STATUS_LABELS[bug.status]} for your role.
                </p>
              )}

              {/* Duplicate needs a target before it can be applied. */}
              {pendingStatus === 'duplicate' && (
                <div className="space-y-2 pt-2">
                  <Label htmlFor="duplicate-of">Duplicate of</Label>
                  <select
                    id="duplicate-of"
                    value={duplicateOf}
                    onChange={(e) => setDuplicateOf(e.target.value)}
                    className={SELECT}
                  >
                    <option value="">Select the original bug...</option>
                    {candidates.map((c) => (
                      <option key={c.id} value={c.id}>{c.key} — {c.title}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <Button
                      type="button" size="sm"
                      className="bg-violet-600 hover:bg-violet-700"
                      disabled={!duplicateOf || busyAction === 'status'}
                      onClick={() => applyStatus('duplicate', { duplicateOfId: duplicateOf })}
                    >
                      Mark Duplicate
                    </Button>
                    <Button
                      type="button" size="sm" variant="outline"
                      onClick={() => { setPendingStatus(''); setDuplicateOf('') }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 pt-3 border-t border-slate-100">
              {isEmployee
                ? 'Only the assigned developer can move this bug through the workflow.'
                : 'You do not have permission to change this bug’s status.'}
            </p>
          )}
        </div>
      </div>

      {/* --- Attachments / Comments / Activity -------------------------------- */}
      <BugAttachments bugId={id} attachments={bug.attachments || []} onChanged={fetchBug} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <BugComments bugId={id} comments={bug.comments || []} onChanged={fetchBug} />
        <BugActivity
          activity={bug.activity || []}
          participants={[bug.assignee, bug.reporter, ...users]}
        />
      </div>
    </div>
  )
}
