'use client'

// Small shared pieces for the People / Recruitment screens: form styles, a
// modal frame, URL-driven tabs and inline banners. The app has no toast
// library, so success and error are inline (plan §5.1).

import { useRouter, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'

import { KeyboardModal } from '@/components/ui/dialog'

export const inputClass = 'w-full rounded-lg border border-slate-200 bg-white p-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:bg-slate-50'

export const errorMessage = (err, fallback) => err?.response?.data?.message || fallback

export function Field({ label, required, hint, children, className = '' }) {
  return (
    <label className={`block text-[11px] font-medium text-slate-600 ${className}`}>
      <span className="mb-1 block">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {hint && <span className="mt-0.5 block text-[10px] font-normal text-slate-400">{hint}</span>}
    </label>
  )
}

export function Banner({ error, success }) {
  if (error) {
    return <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>
  }
  if (success) {
    return <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{success}</p>
  }
  return null
}

export function Modal({ title, subtitle, onClose, children, footer, size = 'max-w-3xl', busy = false }) {
  return (
    <KeyboardModal
      title={title}
      onClose={onClose}
      preventClose={busy}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
    >
      <div className={`flex max-h-[92vh] w-full ${size} flex-col overflow-hidden rounded-2xl bg-white shadow-xl`}>
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">{footer}</div>}
      </div>
    </KeyboardModal>
  )
}

/**
 * Tabs whose selection lives in `?tab=` so notifications and the HR hub can
 * deep-link. The caller must sit inside a <Suspense> (useSearchParams).
 */
export function useUrlTab(tabs, basePath) {
  const router = useRouter()
  const params = useSearchParams()
  const requested = params.get('tab')
  const active = tabs.some((t) => t.key === requested) ? requested : tabs[0].key
  const select = (key) => router.replace(key === tabs[0].key ? basePath : `${basePath}?tab=${key}`)
  return [active, select]
}

export function TabBar({ tabs, active, onSelect, label }) {
  return (
    <div role="tablist" aria-label={label} className="flex flex-wrap gap-2">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          role="tab"
          aria-selected={active === t.key}
          onClick={() => onSelect(t.key)}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
            active === t.key ? 'border-primary bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export const primaryButton = 'inline-flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-60'
export const secondaryButton = 'inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60'
