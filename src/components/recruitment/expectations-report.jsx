'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { peopleApi } from '@/lib/api/people.api'
import { INTERVIEW_OUTCOME_LABELS } from '@/constants/people'
import { formatDate } from '@/utils'
import { Banner, errorMessage } from '@/components/people/ui'

const THEME_LABELS = {
  pay: 'Pay / salary', shift: 'Shift / timings', remote: 'Remote / hybrid',
  growth: 'Growth / learning', location: 'Location', other: 'Other',
}

/**
 * "Candidates' expectations to improve our organisation — e.g. Pay / Shift":
 * market feedback on why people decline, surfaced as its own report rather
 * than buried in each interview (plan §2.5).
 */
export function ExpectationsReport() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    peopleApi.getExpectationsReport()
      .then((d) => { if (active) setData(d) })
      .catch((err) => { if (active) setError(errorMessage(err, 'Could not load the report.')) })
    return () => { active = false }
  }, [])

  const max = data ? Math.max(1, ...Object.values(data.themes)) : 1

  return (
    <section className="space-y-3">
      <Banner error={error} />
      {!data && !error && <p className="text-xs text-slate-400">Loading…</p>}
      {data && (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800">What candidates ask for · {data.total} responses</h3>
            <dl className="mt-3 space-y-2">
              {Object.entries(data.themes).map(([k, n]) => (
                <div key={k} className="grid grid-cols-[140px_1fr_32px] items-center gap-2 text-xs">
                  <dt className="text-slate-600">{THEME_LABELS[k] ?? k}</dt>
                  <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${(n / max) * 100}%` }} />
                  </div>
                  <dd className="text-right font-semibold tabular-nums text-slate-800">{n}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-2 text-[10px] text-slate-400">Grouped by keywords; one response can mention several themes.</p>
          </div>
          <ul className="space-y-2">
            {data.items.map((i) => (
              <li key={i.interviewId} className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link href={`/recruitment/${i.candidateId}`} className="font-semibold text-slate-800 hover:text-primary">{i.candidateName}</Link>
                  <span className="text-[10px] text-slate-400">
                    {i.roleApplied} · {formatDate(i.interviewDate, 'dd MMM yyyy')}{i.outcome ? ` · ${INTERVIEW_OUTCOME_LABELS[i.outcome]}` : ''}
                  </span>
                </div>
                <p className="mt-1 italic text-slate-600">&quot;{i.expectations}&quot;</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
