'use client'

import { useEffect, useState } from 'react'
import { ClipboardList, CheckCircle2 } from 'lucide-react'

import { timeManagementApi } from '@/lib/api/time-management.api'
import { shortDate } from '@/lib/business-date'

const errorMessage = (err, fallback) => err?.response?.data?.message || fallback
const EMPTY = { summary: '', blockers: '', tomorrowPlan: '' }

/**
 * Module 9, Phase 3: the end-of-day work status. One entry per day, editable
 * until the day is a week old; the evening nudge and next-morning manager
 * escalation (backend jobs) key off whether today's entry exists.
 */
export function WorkStatusPanel() {
  const [data, setData] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let active = true
    timeManagementApi.getMyWorkStatus()
      .then((d) => {
        if (!active) return
        setData(d)
        if (d.today) {
          setForm({ summary: d.today.summary, blockers: d.today.blockers ?? '', tomorrowPlan: d.today.tomorrowPlan ?? '' })
        }
      })
      .catch((err) => { if (active) setError(errorMessage(err, 'Could not load your work status.')) })
    return () => { active = false }
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const entry = await timeManagementApi.submitWorkStatus(form)
      setData((d) => ({
        ...d,
        today: entry,
        recent: [entry, ...(d?.recent ?? []).filter((r) => r.date !== entry.date)],
      }))
      setSaved(true)
    } catch (err) {
      setError(errorMessage(err, 'Could not save your work status.'))
    } finally {
      setSaving(false)
    }
  }

  const area = 'w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm'

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="eod-title">
        <h2 id="eod-title" className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <ClipboardList size={18} className="text-primary" />
          End-of-day work status {data?.date ? `· ${shortDate(data.date)}` : ''}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          What you did today, what is blocking you, and tomorrow&apos;s plan. You can update it until the end of the day.
        </p>
        <form onSubmit={submit} className="mt-3 space-y-3">
          <label className="block text-xs font-medium text-slate-700">
            Summary <span className="text-red-500">*</span>
            <textarea className={area} rows={4} required maxLength={4000} value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Tasks completed, progress made…" />
          </label>
          <label className="block text-xs font-medium text-slate-700">
            Blockers
            <textarea className={area} rows={2} maxLength={4000} value={form.blockers}
              onChange={(e) => setForm({ ...form, blockers: e.target.value })} placeholder="Anything stopping you?" />
          </label>
          <label className="block text-xs font-medium text-slate-700">
            Tomorrow&apos;s plan
            <textarea className={area} rows={2} maxLength={4000} value={form.tomorrowPlan}
              onChange={(e) => setForm({ ...form, tomorrowPlan: e.target.value })} />
          </label>
          {error && <p role="alert" className="text-xs text-rose-600">{error}</p>}
          {saved && <p className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 size={13} /> Saved.</p>}
          <button type="submit" disabled={saving || !form.summary.trim()}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {saving ? 'Saving…' : data?.today ? 'Update today’s status' : 'Submit today’s status'}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="eod-recent">
        <h3 id="eod-recent" className="text-sm font-semibold text-slate-800">Recent</h3>
        {!data && !error && <p className="mt-2 text-xs text-slate-400">Loading…</p>}
        {data && data.recent.length === 0 && <p className="mt-2 text-xs text-slate-500">No work status submitted yet.</p>}
        <ul className="mt-2 max-h-[420px] space-y-2 overflow-y-auto pr-1">
          {data?.recent.map((r) => (
            <li key={r.id} className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs">
              <p className="font-semibold text-slate-700">{shortDate(r.date)}</p>
              <p className="mt-1 whitespace-pre-wrap text-slate-600">{r.summary}</p>
              {r.blockers && <p className="mt-1 text-rose-700">Blockers: {r.blockers}</p>}
              {r.tomorrowPlan && <p className="mt-1 text-slate-500">Next: {r.tomorrowPlan}</p>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
