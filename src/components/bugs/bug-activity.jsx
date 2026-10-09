'use client'

import {
  History, Bug, UserPlus, UserMinus, CircleDot, Flag, AlertTriangle,
  MessageSquare, Paperclip, ShieldAlert, RotateCcw, CheckCircle2, Pencil, Link2,
} from 'lucide-react'

import {
  BUG_ACTION_LABELS, BUG_STATUS_LABELS,
  BUG_SEVERITY_LABELS, BUG_PRIORITY_LABELS,
} from '@/constants/bugs'
import { formatRelativeTime, formatExactTime, getInitials, getAvatarColor, cn } from '@/utils'

// Icon + accent per action, so the timeline is scannable rather than a wall of
// identical rows.
const ACTION_STYLE = {
  BUG_CREATED: { icon: Bug, tone: 'text-violet-600 bg-violet-100' },
  BUG_ASSIGNED: { icon: UserPlus, tone: 'text-indigo-600 bg-indigo-100' },
  BUG_REASSIGNED: { icon: UserPlus, tone: 'text-indigo-600 bg-indigo-100' },
  BUG_UNASSIGNED: { icon: UserMinus, tone: 'text-slate-500 bg-slate-100' },
  BUG_STATUS_CHANGED: { icon: CircleDot, tone: 'text-blue-600 bg-blue-100' },
  BUG_PRIORITY_CHANGED: { icon: Flag, tone: 'text-amber-600 bg-amber-100' },
  BUG_SEVERITY_CHANGED: { icon: AlertTriangle, tone: 'text-orange-600 bg-orange-100' },
  BUG_COMMENT_ADDED: { icon: MessageSquare, tone: 'text-slate-500 bg-slate-100' },
  BUG_COMMENT_EDITED: { icon: MessageSquare, tone: 'text-slate-500 bg-slate-100' },
  BUG_COMMENT_DELETED: { icon: MessageSquare, tone: 'text-slate-500 bg-slate-100' },
  BUG_ATTACHMENT_ADDED: { icon: Paperclip, tone: 'text-teal-600 bg-teal-100' },
  BUG_ATTACHMENT_DELETED: { icon: Paperclip, tone: 'text-slate-500 bg-slate-100' },
  BUG_SLA_BREACHED: { icon: ShieldAlert, tone: 'text-red-600 bg-red-100' },
  BUG_SLA_AT_RISK: { icon: AlertTriangle, tone: 'text-amber-600 bg-amber-100' },
  BUG_REOPENED: { icon: RotateCcw, tone: 'text-red-600 bg-red-100' },
  BUG_CLOSED: { icon: CheckCircle2, tone: 'text-green-600 bg-green-100' },
  BUG_RESOLVED: { icon: CheckCircle2, tone: 'text-teal-600 bg-teal-100' },
  BUG_UPDATED: { icon: Pencil, tone: 'text-slate-500 bg-slate-100' },
  BUG_TASK_LINKED: { icon: Link2, tone: 'text-violet-600 bg-violet-100' },
  BUG_TASK_CREATED: { icon: Link2, tone: 'text-violet-600 bg-violet-100' },
  BUG_TASK_UNLINKED: { icon: Link2, tone: 'text-slate-500 bg-slate-100' },
}

// Raw column values are ids and enum keys. Render them as the labels the user
// already sees elsewhere, and never print a bare UUID at them.
function describeValue(entry, value, users) {
  if (value === null || value === undefined || value === '') return null

  if (entry.field === 'status') return BUG_STATUS_LABELS[value] || value
  if (entry.field === 'severity') return BUG_SEVERITY_LABELS[value] || value
  if (entry.field === 'priority') return BUG_PRIORITY_LABELS[value] || value
  if (entry.field === 'assignee') return users?.[value] || 'a developer'
  // Ids for linked tasks/projects carry no meaning on their own.
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(String(value))) return null

  return String(value)
}

/**
 * Bug activity timeline (§12/§25).
 *
 * Every entry comes from bug_activity_logs — written server-side inside the
 * same request as the change it records, including the SLA events the cron
 * sweep writes with no human actor.
 */
export function BugActivity({ activity = [], participants = [] }) {
  // id -> name, so an assignee change reads as a person rather than a UUID.
  const users = Object.fromEntries(participants.filter(Boolean).map((p) => [p.id, p.name]))

  return (
    <div className="bg-card rounded-xl border border-border p-5" id="activity">
      <h3 className="text-sm font-semibold text-foreground mb-4 inline-flex items-center gap-2">
        <History className="w-4 h-4 text-slate-400" />
        Activity
        <span className="text-xs bg-slate-100 text-muted-foreground px-1.5 py-0.5 rounded-full">
          {activity.length}
        </span>
      </h3>

      {activity.length === 0 ? (
        <p className="text-xs text-slate-400 py-4 text-center">No activity recorded yet.</p>
      ) : (
        <ol className="space-y-3">
          {activity.map((entry) => {
            const style = ACTION_STYLE[entry.action] || { icon: History, tone: 'text-slate-500 bg-slate-100' }
            const Icon = style.icon
            const label = BUG_ACTION_LABELS[entry.action] || entry.action

            const from = describeValue(entry, entry.oldValue, users)
            const to = describeValue(entry, entry.newValue, users)

            return (
              <li key={entry.id} className="flex gap-3">
                <span className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                  style.tone
                )}>
                  <Icon className="w-3.5 h-3.5" />
                </span>

                <div className="min-w-0 flex-1 pb-2 border-b border-slate-100 last:border-0">
                  <p className="text-sm text-foreground">
                    {entry.actor ? (
                      <span className="inline-flex items-center gap-1.5 align-middle">
                        <span className={cn(
                          'w-4 h-4 rounded-full inline-flex items-center justify-center text-white text-[10px] font-semibold',
                          getAvatarColor(entry.actor.name)
                        )}>
                          {getInitials(entry.actor.name)}
                        </span>
                        <span className="font-medium">{entry.actor.name}</span>
                      </span>
                    ) : (
                      // The SLA sweep has no human actor.
                      <span className="font-medium text-muted-foreground">System</span>
                    )}
                    {' '}
                    <span className="text-muted-foreground">{label}</span>
                    {from && to && (
                      <span className="text-muted-foreground">
                        {' '}from <span className="text-foreground">{from}</span>
                        {' '}to <span className="text-foreground">{to}</span>
                      </span>
                    )}
                    {!from && to && (
                      <span className="text-muted-foreground">
                        {' '}— <span className="text-foreground">{to}</span>
                      </span>
                    )}
                  </p>
                  <p
                    className="text-xs text-slate-400 mt-0.5"
                    title={formatExactTime(entry.createdAt)}
                  >
                    {formatRelativeTime(entry.createdAt)}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
