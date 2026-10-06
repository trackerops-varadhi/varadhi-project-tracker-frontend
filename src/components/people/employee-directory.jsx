'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react'

import { peopleApi } from '@/lib/api/people.api'
import { EMPLOYEE_STATUS_COLORS, EMPLOYEE_STATUS_LABELS, formatTenure } from '@/constants/people'
import { formatDate } from '@/utils'
import { EmployeeFormModal } from './employee-form-modal'
import { Banner, errorMessage, inputClass, primaryButton, secondaryButton } from './ui'

const LIMIT = 20

/**
 * The HR employee directory: server-side search, filters and pagination
 * (/api/people/employees). The list is the PII-free summary; the profile page
 * holds the full record. Writes are admin/hr — `canEdit` only hides the button,
 * the backend decides.
 */
export function EmployeeDirectory({ canEdit }) {
  const [filters, setFilters] = useState({ search: '', status: 'active', product: 'all', sort: 'created', order: 'desc' })
  const [query, setQuery] = useState(filters)
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [notice, setNotice] = useState('')
  const [reload, setReload] = useState(0)

  // 300 ms debounce via effect teardown: typing resets the timer.
  useEffect(() => {
    const t = setTimeout(() => { setQuery(filters); setPage(1) }, 300)
    return () => clearTimeout(t)
  }, [filters])

  useEffect(() => {
    let active = true
    peopleApi.getEmployees({ ...query, page, limit: LIMIT })
      .then((d) => { if (active) { setData(d); setError('') } })
      .catch((err) => { if (active) setError(errorMessage(err, 'Could not load employees.')) })
    return () => { active = false }
  }, [query, page, reload])

  useEffect(() => {
    let active = true
    peopleApi.getProducts().then((p) => { if (active) setProducts(p) }).catch(() => {})
    return () => { active = false }
  }, [reload])

  const items = data?.items ?? []
  const totalPages = data ? Math.max(1, Math.ceil(data.total / LIMIT)) : 1
  const set = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }))

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-2">
        <label className="relative min-w-[200px] flex-1">
          <span className="sr-only">Search employees</span>
          <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
          <input className={`${inputClass} pl-8`} placeholder="Search by name" value={filters.search} onChange={set('search')} />
        </label>
        <select aria-label="Status" className={`${inputClass} w-auto`} value={filters.status} onChange={set('status')}>
          <option value="all">All statuses</option>
          {Object.entries(EMPLOYEE_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select aria-label="Product" className={`${inputClass} w-auto`} value={filters.product} onChange={set('product')}>
          <option value="all">All products</option>
          {products.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select aria-label="Sort" className={`${inputClass} w-auto`} value={`${filters.sort}:${filters.order}`}
          onChange={(e) => { const [sort, order] = e.target.value.split(':'); setFilters((f) => ({ ...f, sort, order })) }}>
          <option value="created:desc">Recently added</option>
          <option value="joined:desc">Joined (newest)</option>
          <option value="joined:asc">Joined (oldest)</option>
          <option value="code:asc">Employee code</option>
          <option value="designation:asc">Role</option>
        </select>
        {canEdit && (
          <button type="button" className={primaryButton} onClick={() => setShowAdd(true)}>
            <Plus size={14} /> Add employee
          </button>
        )}
      </div>

      <div className="mt-3 space-y-2">
        <Banner error={error} success={notice} />
      </div>

      <div className="mt-3 overflow-x-auto" role="region" aria-label="Employee directory" tabIndex={0}>
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead className="border-b border-slate-200 text-[11px] text-slate-500">
            <tr>
              {['Employee', 'Code', 'Role', 'Product', 'Reports to', 'Joined', 'Status'].map((h) => (
                <th key={h} scope="col" className="px-2 py-2 font-medium first:pl-0">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!data && !error && (
              <tr><td colSpan={7} className="py-6 text-center text-slate-400">Loading…</td></tr>
            )}
            {data && items.length === 0 && (
              <tr><td colSpan={7} className="py-6 text-center text-slate-500">No employees match these filters.</td></tr>
            )}
            {items.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50">
                <th scope="row" className="py-2 pr-2 font-medium">
                  <Link href={`/people/${e.userId}`} className="text-slate-900 hover:text-primary">{e.name ?? 'Unknown user'}</Link>
                  <span className="block text-[10px] font-normal text-slate-400">{e.email}</span>
                </th>
                <td className="px-2 py-2 text-slate-500">{e.employeeCode ?? '—'}</td>
                <td className="px-2 py-2">{e.designation}</td>
                <td className="px-2 py-2 text-slate-500">{e.product ?? '—'}</td>
                <td className="px-2 py-2 text-slate-500">{e.reportingManager?.name ?? '—'}</td>
                <td className="px-2 py-2 text-slate-500">
                  {e.dateOfJoining ? formatDate(e.dateOfJoining, 'dd MMM yyyy') : '—'}
                  {e.tenureMonths != null && <span className="block text-[10px] text-slate-400">{formatTenure(e.tenureMonths)}</span>}
                </td>
                <td className="px-2 py-2">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${EMPLOYEE_STATUS_COLORS[e.status]}`}>
                    {e.status === 'active' && e.onLeaveToday ? 'On Leave' : EMPLOYEE_STATUS_LABELS[e.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.total > LIMIT && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>{data.total} employees · page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button type="button" className={secondaryButton} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft size={14} /> Prev
            </button>
            <button type="button" className={secondaryButton} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {showAdd && (
        <EmployeeFormModal
          onClose={() => setShowAdd(false)}
          onSaved={(saved) => {
            setShowAdd(false)
            setNotice(`${saved.name ?? 'Employee'} added to the directory.`)
            setReload((n) => n + 1)
          }}
        />
      )}
    </section>
  )
}
