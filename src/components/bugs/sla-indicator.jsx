'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock, MinusCircle } from 'lucide-react'

import { SLA_STATUS_LABELS, SLA_STATUS_COLORS } from '@/constants/bugs'
import { cn } from '@/utils'
import { useHasMounted } from '@/hooks/use-has-mounted'

/**
 * Live SLA countdown.
 *
 * The authority on SLA state is always the server: `sla.status`, `sla.dueAt`
 * and `sla.serverTime` are computed in Postgres against NOW(). This component
 * only animates BETWEEN those payloads, and it does so by measuring elapsed
 * time locally rather than by trusting the browser's wall clock — so a device
 * with a badly wrong system time still shows a correct remaining duration.
 *
 * Once the clock has stopped (fixed / QA / closed / triaged out) there is
 * nothing to animate and the server's verdict is rendered as-is.
 */

const ICONS = {
  within_sla: Clock,
  at_risk: AlertTriangle,
  breached: AlertTriangle,
  resolved_within_sla: CheckCircle2,
  resolved_after_sla: AlertTriangle,
  not_applicable: MinusCircle,
}

/** ms -> "1d 04h 20m remaining" / "Breached by 42m". Mirrors the server's formatSlaRemaining. */
function formatRemaining(ms) {
  if (ms === null || ms === undefined || Number.isNaN(ms)) return null

  const overdue = ms < 0
  const totalMinutes = Math.floor(Math.abs(ms) / 60000)
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60

  const parts = []
  if (days) parts.push(`${days}d`)
  if (hours || days) parts.push(`${String(hours).padStart(2, '0')}h`)
  parts.push(`${String(minutes).padStart(2, '0')}m`)

  return overdue ? `Breached by ${parts.join(' ')}` : `${parts.join(' ')} remaining`
}

export function SlaIndicator({ sla, showLabel = true, compact = false, className }) {
  const mounted = useHasMounted()

  // Milliseconds of drift measured since this payload arrived. Using a monotonic
  // delta rather than Date.now() vs dueAt keeps the countdown correct even when
  // the client clock disagrees with the server's.
  const [elapsed, setElapsed] = useState(0)

  const clockRunning = Boolean(sla) && !sla.clockStopped && sla.remainingMs !== null

  useEffect(() => {
    // Reset the drift whenever a fresh payload arrives.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setElapsed(0)
    if (!clockRunning) return undefined

    const startedAt = Date.now()
    const timer = setInterval(() => setElapsed(Date.now() - startedAt), 30000)
    return () => clearInterval(timer)
  }, [sla?.dueAt, sla?.remainingMs, clockRunning])

  if (!sla) return <span className="text-xs text-slate-400">—</span>

  const status = sla.status || 'not_applicable'
  const Icon = ICONS[status] || Clock

  // Server-provided label until mount, so SSR and the first client render agree;
  // after that, the locally-ticked value.
  const remainingMs = clockRunning ? sla.remainingMs - elapsed : null
  const text = !clockRunning
    ? SLA_STATUS_LABELS[status] || status
    : (mounted ? formatRemaining(remainingMs) : sla.label) || SLA_STATUS_LABELS[status]

  // A countdown that crosses zero between polls should already look breached
  // rather than showing "00m remaining" until the next refresh.
  const effectiveStatus =
    clockRunning && remainingMs !== null && remainingMs <= 0 ? 'breached' : status

  if (compact) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap',
          effectiveStatus === 'breached' && 'text-red-600',
          effectiveStatus === 'at_risk' && 'text-amber-600',
          effectiveStatus === 'within_sla' && 'text-muted-foreground',
          effectiveStatus.startsWith('resolved') && 'text-green-600',
          effectiveStatus === 'not_applicable' && 'text-slate-400',
          className
        )}
        title={SLA_STATUS_LABELS[effectiveStatus]}
      >
        <Icon className="w-3 h-3 flex-shrink-0" />
        {text}
      </span>
    )
  }

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <span
        className={cn(
          'inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-md font-medium whitespace-nowrap',
          SLA_STATUS_COLORS[effectiveStatus] || SLA_STATUS_COLORS.not_applicable
        )}
      >
        <Icon className="w-3 h-3" />
        {SLA_STATUS_LABELS[effectiveStatus] || effectiveStatus}
      </span>
      {showLabel && clockRunning && (
        <span
          className={cn(
            'text-xs whitespace-nowrap',
            effectiveStatus === 'breached'
              ? 'text-red-600 font-medium'
              : effectiveStatus === 'at_risk'
              ? 'text-amber-600 font-medium'
              : 'text-muted-foreground'
          )}
        >
          {text}
        </span>
      )}
    </div>
  )
}
