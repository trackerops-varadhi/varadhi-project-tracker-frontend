'use client'

/**
 * One confirmation dialog for the whole app.
 *
 * WHY THIS EXISTS
 * Sixteen destructive actions across bugs, tasks, projects, documents, users,
 * leave and recruitment each called window.confirm(). That dialog is the
 * browser's, not the app's: it cannot show which record is affected in the
 * app's own type, it cannot distinguish "archive" from "permanently delete",
 * it is unstyled and off-brand, it blocks the whole tab, and on iOS Safari it
 * can be suppressed entirely by the user — in which case the delete silently
 * never happens.
 *
 * It is imperative on purpose. The call sites all read
 *
 *     if (!window.confirm('Delete?')) return
 *
 * and an imperative hook keeps them that shape:
 *
 *     if (!(await confirm({ title: 'Delete?' }))) return
 *
 * rather than forcing every list to hoist a "which row is pending deletion"
 * state and render a dialog of its own. Built on ui/alert-dialog (radix), so
 * focus trapping, Escape, the focus return and aria wiring are not re-invented
 * here: the confirm button takes focus on open, Escape and the backdrop
 * cancel, and `role="alertdialog"` is what radix gives us.
 */

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/utils'

const ConfirmContext = createContext(null)

const TONES = {
  // Irreversible: deleting a row, a file, an account.
  danger: {
    icon: Trash2,
    media: 'bg-rose-50 text-rose-600',
    action: 'bg-rose-600 text-white hover:bg-rose-700',
    confirmLabel: 'Delete',
  },
  // Reversible but consequential: archiving, cancelling, removing a member.
  warning: {
    icon: AlertTriangle,
    media: 'bg-amber-50 text-amber-600',
    action: 'bg-amber-600 text-white hover:bg-amber-700',
    confirmLabel: 'Continue',
  },
  // Ordinary confirmation.
  neutral: {
    icon: null,
    media: 'bg-muted text-muted-foreground',
    action: '',
    confirmLabel: 'Confirm',
  },
}

/**
 * Wraps the tree once (in Providers) and renders the single dialog.
 *
 * `pending` keeps the dialog open with a spinner while an async onConfirm
 * runs, so a slow delete cannot be fired twice by a double click and the row
 * does not vanish before the request has actually succeeded.
 */
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null)
  const [pending, setPending] = useState(false)
  const resolveRef = useRef(null)

  const confirm = useCallback((options = {}) => {
    const opts = typeof options === 'string' ? { title: options } : options
    return new Promise((resolve) => {
      resolveRef.current = resolve
      setState(opts)
    })
  }, [])

  const settle = useCallback((answer) => {
    const resolve = resolveRef.current
    resolveRef.current = null
    setState(null)
    setPending(false)
    if (resolve) resolve(answer)
  }, [])

  const onConfirm = useCallback(async () => {
    if (!state?.onConfirm) {
      settle(true)
      return
    }
    // The caller passed the work itself: run it with the dialog still up, so
    // the button can show progress and errors surface before it closes.
    setPending(true)
    try {
      await state.onConfirm()
      settle(true)
    } catch (err) {
      setPending(false)
      // Give the dialog back to the caller's own error handling rather than
      // swallowing it: resolving false would read as "the user cancelled".
      settle(false)
      throw err
    }
  }, [state, settle])

  const value = useMemo(() => ({ confirm }), [confirm])

  const tone = TONES[state?.tone || 'danger'] || TONES.danger
  const Icon = state?.icon ?? tone.icon
  const confirmLabel = state?.confirmLabel || tone.confirmLabel
  const busyLabel = state?.busyLabel || `${confirmLabel.replace(/e$/, '')}ing…`

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <AlertDialog
        open={Boolean(state)}
        onOpenChange={(open) => {
          // Escape, the backdrop and the close affordance all land here. While
          // the action is running, ignore them: cancelling a request already
          // in flight would leave the caller unsure whether it happened.
          if (!open && !pending) settle(false)
        }}
      >
        {state && (
          <AlertDialogContent>
            <AlertDialogHeader>
              {Icon && (
                <AlertDialogMedia className={cn(tone.media)}>
                  <Icon aria-hidden="true" />
                </AlertDialogMedia>
              )}
              <AlertDialogTitle>{state.title || 'Are you sure?'}</AlertDialogTitle>
              {state.message && (
                <AlertDialogDescription>{state.message}</AlertDialogDescription>
              )}
            </AlertDialogHeader>

            {/* What exactly is being acted on, in the app's own voice: the
                record's name, and anything that goes with it. */}
            {(state.subject || state.detail) && (
              <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-left text-xs">
                {state.subject && (
                  <p className="truncate font-medium text-foreground" title={state.subject}>
                    {state.subject}
                  </p>
                )}
                {state.detail && <p className="mt-0.5 text-muted-foreground">{state.detail}</p>}
              </div>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel disabled={pending}>
                {state.cancelLabel || 'Cancel'}
              </AlertDialogCancel>
              <AlertDialogAction
                className={cn(tone.action)}
                disabled={pending}
                onClick={(event) => {
                  // Radix closes on click by default; we close ourselves once
                  // the work has finished.
                  event.preventDefault()
                  onConfirm()
                }}
              >
                {pending ? (
                  <>
                    <Loader2 aria-hidden="true" className="mr-1.5 animate-spin" />
                    {busyLabel}
                  </>
                ) : (
                  confirmLabel
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </ConfirmContext.Provider>
  )
}

/**
 * `const confirm = useConfirm()` then `await confirm({ ... })`.
 *
 * Options: title, message, subject (the record's name), detail, tone
 * ('danger' | 'warning' | 'neutral'), confirmLabel, cancelLabel, busyLabel,
 * icon, and optionally onConfirm — pass the async work itself and the dialog
 * shows progress until it settles.
 *
 * Outside the provider it falls back to window.confirm rather than throwing,
 * so a component rendered in isolation still behaves.
 */
export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  return useCallback(
    (options = {}) => {
      const opts = typeof options === 'string' ? { title: options } : options
      if (ctx) return ctx.confirm(opts)
      const text = [opts.title, opts.subject, opts.message].filter(Boolean).join('\n')
      return Promise.resolve(window.confirm(text || 'Are you sure?'))
    },
    [ctx]
  )
}
