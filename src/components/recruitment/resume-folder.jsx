'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Download, FileText, Search } from 'lucide-react'

import { peopleApi } from '@/lib/api/people.api'
import { CANDIDATE_STATUS_LABELS } from '@/constants/people'
import { formatDate, formatFileSize } from '@/utils'
import { Banner, errorMessage, inputClass, secondaryButton } from '@/components/people/ui'

/**
 * Open a resume through a fresh one-minute signed URL. The file lives in a
 * private bucket; there is no permanent link to share or leak (plan §7.3).
 */
export async function openResume(candidateId, resumeId) {
  const { url } = await peopleApi.getResumeLink(candidateId, resumeId)
  window.open(url, '_blank', 'noopener,noreferrer')
}

/** Every candidate resume on file (admin/hr). */
export function ResumeFolder() {
  const [rows, setRows] = useState(null)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    peopleApi.getAllResumes()
      .then((d) => { if (active) setRows(d) })
      .catch((err) => { if (active) setError(errorMessage(err, 'Could not load the resume folder.')) })
    return () => { active = false }
  }, [])

  const shown = useMemo(() => {
    const term = search.trim().toLowerCase()
    return (rows ?? []).filter((r) => !term || `${r.candidateName} ${r.appliedFor} ${r.fileName}`.toLowerCase().includes(term))
  }, [rows, search])

  const open = async (r) => {
    setError('')
    try {
      await openResume(r.candidateId, r.id)
    } catch (err) {
      setError(errorMessage(err, 'Could not open the resume.'))
    }
  }

  return (
    <section className="space-y-3">
      <label className="relative block max-w-md">
        <span className="sr-only">Search resumes</span>
        <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
        <input className={`${inputClass} pl-8`} placeholder="Search candidate, role or file" value={search} onChange={(e) => setSearch(e.target.value)} />
      </label>
      <Banner error={error} />
      {!rows && !error && <p className="text-xs text-slate-400">Loading…</p>}
      {rows && shown.length === 0 && <p className="py-6 text-center text-xs text-slate-500">No resumes yet — upload one from a candidate&apos;s page.</p>}
      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((r) => (
          <li key={r.id} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-sm">
            <FileText size={20} className="mt-0.5 shrink-0 text-sky-600" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-800" title={r.fileName}>{r.fileName}</p>
              <Link href={`/recruitment/${r.candidateId}`} className="text-slate-600 hover:text-primary">{r.candidateName}</Link>
              <p className="text-[10px] text-slate-400">
                {r.appliedFor} · {CANDIDATE_STATUS_LABELS[r.candidateStatus] ?? r.candidateStatus} · {formatFileSize(r.fileSize ?? 0)} · {formatDate(r.createdAt, 'dd MMM yyyy')}
              </p>
            </div>
            <button type="button" className={secondaryButton} onClick={() => open(r)} aria-label={`Open ${r.fileName}`}>
              <Download size={13} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
