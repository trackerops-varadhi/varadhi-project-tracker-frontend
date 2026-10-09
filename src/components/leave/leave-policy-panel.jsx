'use client'

import { useEffect, useState } from 'react'
import { CalendarRange, Wallet, Settings2, X } from 'lucide-react'

import { leaveManagementApi } from '@/lib/api/leave-management.api'
import { MODAL_SIZE } from '@/components/shared/modal-size'
import { usersApi } from '@/lib/api/users.api'
import { businessToday, addDays, shortDate, weekdayShort } from '@/lib/business-date'
import { LEAVE_TYPE_LABELS } from '@/constants/people'

const errorMessage = (err, fallback) => err?.response?.data?.message || fallback
const LEAVE_TYPES = Object.keys(LEAVE_TYPE_LABELS)

/**
 * Module 9, Phase 3: the requester's own balance and the absence calendar for
 * the next two weeks (everyone sees who is away — reasons are never shown).
 * admin/hr also get the entitlement editor.
 */
export function LeavePolicyPanel({ role, refreshKey = 0 }) {
  const canSetEntitlements = ['admin', 'hr'].includes(role)
  const [balance, setBalance] = useState(null)
  const [calendar, setCalendar] = useState(null)
  const [error, setError] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let active = true
    const from = businessToday()
    Promise.all([leaveManagementApi.getBalances(), leaveManagementApi.getCalendar(from, addDays(from, 13))])
      .then(([b, c]) => {
        if (!active) return
        setBalance(b)
        setCalendar(c)
        setError('')
      })
      .catch((err) => { if (active) setError(errorMessage(err, 'Could not load leave balance.')) })
    return () => { active = false }
  }, [refreshKey, reload])

  // Group calendar entries by day, so each of the next 14 days lists who is away.
  const days = []
  if (calendar) {
    for (let d = calendar.from; d <= calendar.to; d = addDays(d, 1)) {
      const away = calendar.items.filter((i) => i.startDate <= d && i.endDate >= d)
      if (away.length) days.push({ date: d, away })
    }
  }

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm" aria-labelledby="leave-balance-title">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 id="leave-balance-title" className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
            <Wallet size={15} className="text-primary" /> My Leave Balance {balance ? `· ${balance.year}` : ''}
          </h3>
          {canSetEntitlements && (
            <button
              type="button"
              onClick={() => setShowEditor(true)}
              className="flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <Settings2 size={13} /> Set entitlements
            </button>
          )}
        </div>
        {error && <p role="alert" className="text-xs text-rose-600">{error}</p>}
        {!error && !balance && <p className="text-xs text-slate-400">Loading…</p>}
        {balance && balance.types.length === 0 && (
          <p className="text-xs text-slate-500">No entitlement has been set for you this year, and no leave has been taken.</p>
        )}
        {balance && balance.types.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {balance.types.map((t) => (
              <div key={t.leaveType} className="rounded-xl border border-slate-100 bg-slate-50 px-2.5 py-2">
                <p className="text-[11px] font-medium text-slate-500">{LEAVE_TYPE_LABELS[t.leaveType] ?? t.leaveType}</p>
                <p className="text-lg font-bold tabular-nums text-slate-900">{t.remaining}</p>
                <p className="text-[10px] text-slate-400">
                  {t.used} used of {t.entitled + t.carriedForward}
                  {t.carriedForward ? ` (incl. ${t.carriedForward} carried)` : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm" aria-labelledby="absence-calendar-title">
        <h3 id="absence-calendar-title" className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
          <CalendarRange size={15} className="text-primary" /> Who&apos;s away · next 14 days
        </h3>
        {!calendar && !error && <p className="text-xs text-slate-400">Loading…</p>}
        {calendar && days.length === 0 && <p className="text-xs text-slate-500">Nobody has leave in the next two weeks.</p>}
        <ul className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
          {days.map(({ date, away }) => (
            <li key={date} className="flex gap-2 text-xs">
              <span className="w-16 shrink-0 font-medium text-slate-600">{weekdayShort(date)} {shortDate(date)}</span>
              <span className="flex flex-wrap gap-1">
                {away.map((a) => (
                  <span
                    key={a.id}
                    className={`rounded-full px-2 py-0.5 text-[11px] ${a.status === 'approved' ? 'bg-amber-50 text-amber-800' : 'border border-dashed border-slate-300 text-slate-500'}`}
                    title={a.status === 'pending' ? 'Pending approval' : 'Approved'}
                  >
                    {a.userName ?? 'Someone'}{a.dayType === 'half_day' ? ' (½)' : ''}
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {showEditor && (
        <EntitlementEditor
          onClose={() => setShowEditor(false)}
          onSaved={() => setReload((n) => n + 1)}
        />
      )}
    </div>
  )
}

function EntitlementEditor({ onClose, onSaved }) {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({
    userId: '', year: Number(businessToday().slice(0, 4)), leaveType: 'casual', entitled: '', carriedForward: '',
  })
  const [current, setCurrent] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    usersApi.getAll({ status: 'active' })
      .then((data) => {
        if (!active) return
        const list = Array.isArray(data) ? data : (data?.data ?? data?.users ?? [])
        setUsers(list)
      })
      .catch(() => { if (active) setError('Could not load users.') })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!form.userId) return undefined
    let active = true
    leaveManagementApi.getBalances({ userId: form.userId, year: form.year })
      .then((b) => { if (active) setCurrent(b) })
      .catch(() => { if (active) setCurrent(null) })
    return () => { active = false }
  }, [form.userId, form.year])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const b = await leaveManagementApi.setEntitlement({
        ...form,
        entitled: form.entitled === '' ? 0 : Number(form.entitled),
        carriedForward: form.carriedForward === '' ? 0 : Number(form.carriedForward),
      })
      setCurrent(b)
      setMessage('Saved.')
      onSaved()
    } catch (err) {
      setError(errorMessage(err, 'Could not save the entitlement.'))
    } finally {
      setSaving(false)
    }
  }

  const input = 'w-full rounded-lg border border-slate-200 bg-white p-2 text-xs'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="entitlement-title">
      <div className={`w-full ${MODAL_SIZE.compact} max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-4 shadow-xl`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 id="entitlement-title" className="text-sm font-bold text-slate-900">Leave entitlement</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1 hover:bg-slate-100"><X size={16} /></button>
        </div>
        <form onSubmit={save} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <select aria-label="Employee" className={`${input} sm:col-span-2`} required value={form.userId}
            onChange={(e) => setForm({ ...form, userId: e.target.value })}>
            <option value="">Select employee</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
          </select>
          <input aria-label="Year" type="number" className={input} value={form.year} min={2000} max={2100}
            onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
          <select aria-label="Leave type" className={input} value={form.leaveType}
            onChange={(e) => setForm({ ...form, leaveType: e.target.value })}>
            {LEAVE_TYPES.map((t) => <option key={t} value={t}>{LEAVE_TYPE_LABELS[t]}</option>)}
          </select>
          <input aria-label="Entitled days" type="number" step="0.5" min="0" placeholder="Entitled days" className={input}
            value={form.entitled} onChange={(e) => setForm({ ...form, entitled: e.target.value })} required />
          <input aria-label="Carried forward days" type="number" step="0.5" min="0" placeholder="Carried forward" className={input}
            value={form.carriedForward} onChange={(e) => setForm({ ...form, carriedForward: e.target.value })} />
          {current && (
            <p className="sm:col-span-2 text-[11px] text-slate-500">
              Current: {current.types.length
                ? current.types.map((t) => `${LEAVE_TYPE_LABELS[t.leaveType] ?? t.leaveType} ${t.remaining}/${t.entitled + t.carriedForward}`).join(' · ')
                : 'nothing set'}
            </p>
          )}
          {error && <p role="alert" className="sm:col-span-2 text-xs text-rose-600">{error}</p>}
          {message && <p className="sm:col-span-2 text-xs text-emerald-600">{message}</p>}
          <button type="submit" disabled={saving} className="sm:col-span-2 rounded-lg bg-primary py-2 text-xs font-semibold text-white disabled:opacity-60">
            {saving ? 'Saving…' : 'Save entitlement'}
          </button>
        </form>
      </div>
    </div>
  )
}
