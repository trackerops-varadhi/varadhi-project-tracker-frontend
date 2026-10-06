'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, UserRound } from 'lucide-react'

import { peopleApi } from '@/lib/api/people.api'
import { getAvatarColor, getInitials } from '@/utils'
import { Banner, errorMessage, inputClass } from './ui'

/**
 * Team list + reporting TL/manager — every role. Consumes /api/people/team,
 * which is PII-free by construction: no address, DOB, Aadhaar or exit reason
 * can appear here because the endpoint never returns them.
 */
export function TeamDirectory() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let active = true
    peopleApi.getTeam()
      .then((d) => { if (active) setData(d) })
      .catch((err) => { if (active) setError(errorMessage(err, 'Could not load the team directory.')) })
    return () => { active = false }
  }, [])

  const groups = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!data) return []
    return data.groups
      .map((g) => ({
        ...g,
        members: g.members.filter((m) => !term ||
          `${m.name} ${m.designation} ${m.product} ${m.coreSkills.join(' ')}`.toLowerCase().includes(term)),
      }))
      .filter((g) => g.members.length)
  }, [data, search])

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-[220px] flex-1">
          <span className="sr-only">Search the team</span>
          <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
          <input className={`${inputClass} pl-8`} placeholder="Search name, role, product or skill" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        {data && <span className="text-xs text-slate-500">{data.total} people</span>}
      </div>
      <Banner error={error} />
      {!data && !error && <p className="text-xs text-slate-400">Loading…</p>}
      {data && groups.length === 0 && (
        <p className="py-6 text-center text-xs text-slate-500">
          {data.total === 0 ? 'HR has not added anyone to the directory yet.' : 'Nobody matches that search.'}
        </p>
      )}

      {groups.map((g) => (
        <div key={g.manager?.id ?? 'none'} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <UserRound size={15} className="text-primary" />
            {g.manager ? <>Reports to {g.manager.name}</> : 'No reporting manager set'}
            <span className="text-xs font-normal text-slate-400">· {g.members.length}</span>
          </h2>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {g.members.map((m) => (
              <li key={m.userId} className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <span aria-hidden="true" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${getAvatarColor(m.name || '?')}`}>
                  {getInitials(m.name || '?')}
                </span>
                <div className="min-w-0 text-xs">
                  <p className="truncate font-semibold text-slate-800">{m.name ?? 'Unknown user'}</p>
                  <p className="truncate text-slate-500">{m.designation}{m.product ? ` · ${m.product}` : ''}</p>
                  {m.email && <p className="truncate text-slate-400">{m.email}</p>}
                  <div className="mt-1 flex flex-wrap gap-1">
                    {m.onLeaveToday && <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">On leave today</span>}
                    {m.status === 'notice_period' && <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-700">Notice period</span>}
                    {m.shift && <span className="rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-500 ring-1 ring-slate-100">{m.shift}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
