'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, Calendar, Clock, Pencil, Plus, Search } from 'lucide-react'

import { peopleApi } from '@/lib/api/people.api'
import { EXIT_TYPE_LABELS, REASON_CATEGORY_LABELS, formatTenure } from '@/constants/people'
import { formatDate } from '@/utils'
import { RecordExitModal } from './record-exit-modal'
import { Banner, errorMessage, inputClass, primaryButton, secondaryButton } from './ui'

const show = (d) => formatDate(d, 'dd MMM yyyy')

/** Exit records (admin/hr). Low volume, so filtering is client-side. */
export function AttritionList() {
  const [exits, setExits] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [reason, setReason] = useState('all')
  const [modal, setModal] = useState(null) // null | 'new' | exit
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let active = true
    peopleApi.getExits()
      .then((d) => { if (active) { setExits(d); setError('') } })
      .catch((err) => { if (active) setError(errorMessage(err, 'Could not load attrition records.')) })
    return () => { active = false }
  }, [reload])

  const shown = useMemo(() => (exits ?? []).filter((x) => {
    if (reason !== 'all' && x.reasonCategory !== reason) return false
    const term = search.trim().toLowerCase()
    return !term || `${x.name} ${x.designation} ${x.product}`.toLowerCase().includes(term)
  }), [exits, search, reason])

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-[200px] flex-1">
          <span className="sr-only">Search exits</span>
          <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
          <input className={`${inputClass} pl-8`} placeholder="Search name, role, product" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <select aria-label="Reason" className={`${inputClass} w-auto`} value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="all">All reasons</option>
          {Object.entries(REASON_CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button type="button" className={primaryButton} onClick={() => setModal('new')}>
          <Plus size={14} /> Record exit
        </button>
      </div>
      <Banner error={error} success={notice} />
      {!exits && !error && <p className="text-xs text-slate-400">Loading…</p>}
      {exits && shown.length === 0 && <p className="py-6 text-center text-xs text-slate-500">No attrition records.</p>}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {shown.map((x) => (
          <article key={x.id} className="space-y-2 rounded-xl border border-rose-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link href={`/people/${x.userId}`} className="text-sm font-bold text-slate-900 hover:text-primary">{x.name ?? 'Unknown user'}</Link>
                <p className="mt-0.5 text-xs text-slate-500">
                  {x.designation}{x.product ? ` · ${x.product}` : ''} · {EXIT_TYPE_LABELS[x.exitType] ?? x.exitType}
                </p>
              </div>
              <button type="button" className={secondaryButton} onClick={() => setModal(x)} aria-label={`Edit exit for ${x.name}`}>
                <Pencil size={12} /> Edit
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <span className="flex items-center gap-1"><Calendar size={13} className="text-rose-500" /> Resigned {show(x.resignationDate)}</span>
              <span className="flex items-center gap-1"><Clock size={13} className="text-rose-500" /> Last day {show(x.lastWorkingDate)}</span>
              {x.tenureMonths != null && <span className="col-span-2">Worked in Varadhi: {formatTenure(x.tenureMonths)}</span>}
            </div>
            <div className="rounded-lg border border-rose-100 bg-rose-50/60 p-2 text-xs">
              <p className="flex items-center gap-1 font-semibold text-rose-900">
                <AlertCircle size={13} /> {REASON_CATEGORY_LABELS[x.reasonCategory] ?? x.reasonCategory}
              </p>
              <p className="mt-0.5 text-rose-800/80">{x.reasonDetail}</p>
            </div>
            {x.exitFeedback && (
              <p className="rounded-lg border border-slate-100 bg-slate-50 p-2 text-xs italic text-slate-600">&quot;{x.exitFeedback}&quot;</p>
            )}
            {x.recordedBy && <p className="text-[10px] text-slate-400">Recorded by {x.recordedBy.name}</p>}
          </article>
        ))}
      </div>

      {modal && (
        <RecordExitModal
          exit={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={(saved) => {
            setModal(null)
            setNotice(`Exit saved for ${saved.name ?? 'the employee'}.`)
            setReload((n) => n + 1)
          }}
        />
      )}
    </section>
  )
}
