'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DndContext, PointerSensor, KeyboardSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core'
import { FileText, Plus, Search } from 'lucide-react'

import { peopleApi } from '@/lib/api/people.api'
import { CANDIDATE_STAGES, CANDIDATE_SOURCE_LABELS, INTERVIEW_OUTCOME_LABELS } from '@/constants/people'
import { CandidateFormModal } from './candidate-form-modal'
import { Banner, errorMessage, inputClass, primaryButton } from '@/components/people/ui'

function CandidateCard({ candidate }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: candidate.id })
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab rounded-lg border border-slate-200 bg-white p-2 text-xs shadow-sm ${isDragging ? 'z-10 opacity-80 ring-2 ring-primary' : ''}`}
    >
      <Link href={`/recruitment/${candidate.id}`} className="block font-semibold text-slate-800 hover:text-primary"
        onPointerDown={(e) => e.stopPropagation()}>
        {candidate.fullName}
      </Link>
      <p className="truncate text-slate-500">{candidate.appliedFor}</p>
      <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-slate-500">
        {candidate.source && <span className="rounded bg-slate-100 px-1">{CANDIDATE_SOURCE_LABELS[candidate.source]}</span>}
        {candidate.interviewCount > 0 && <span className="rounded bg-violet-50 px-1 text-violet-700">{candidate.interviewCount} round{candidate.interviewCount === 1 ? '' : 's'}</span>}
        {candidate.lastInterview?.outcome && <span className="rounded bg-slate-100 px-1">{INTERVIEW_OUTCOME_LABELS[candidate.lastInterview.outcome]}</span>}
        {candidate.resumeCount > 0 && <span className="inline-flex items-center gap-0.5 rounded bg-sky-50 px-1 text-sky-700"><FileText size={10} /> CV</span>}
      </div>
    </div>
  )
}

function Column({ stage, candidates }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.key })
  return (
    <div ref={setNodeRef} className={`flex w-60 shrink-0 flex-col rounded-xl border bg-slate-50 p-2 ${isOver ? 'border-primary bg-violet-50' : 'border-slate-200'}`}>
      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-700">
        <span className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${stage.color}`} /> {stage.label}</span>
        <span className="rounded bg-white px-1.5 text-[10px] text-slate-500">{candidates.length}</span>
      </div>
      <div className="flex min-h-16 flex-col gap-2">
        {candidates.map((c) => <CandidateCard key={c.id} candidate={c} />)}
      </div>
    </div>
  )
}

/**
 * The recruitment pipeline as a board by candidate status. Dragging a card to
 * another column changes the status (optimistically, rolled back on error).
 */
export function CandidatePipeline() {
  const [candidates, setCandidates] = useState(null)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [reload, setReload] = useState(0)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor))

  useEffect(() => {
    const t = setTimeout(() => setQuery(search), 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    let active = true
    peopleApi.getCandidates({ search: query, limit: 100 })
      .then((d) => { if (active) { setCandidates(d.items); setError('') } })
      .catch((err) => { if (active) setError(errorMessage(err, 'Could not load candidates.')) })
    return () => { active = false }
  }, [query, reload])

  const onDragEnd = async ({ active, over }) => {
    if (!over) return
    const candidate = candidates.find((c) => c.id === active.id)
    if (!candidate || candidate.status === over.id) return
    const previous = candidate.status
    setCandidates((list) => list.map((c) => (c.id === candidate.id ? { ...c, status: over.id } : c)))
    try {
      await peopleApi.setCandidateStatus(candidate.id, over.id)
      setError('')
    } catch (err) {
      setCandidates((list) => list.map((c) => (c.id === candidate.id ? { ...c, status: previous } : c)))
      setError(errorMessage(err, 'Could not move the candidate.'))
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-[220px] flex-1">
          <span className="sr-only">Search candidates</span>
          <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
          <input className={`${inputClass} pl-8`} placeholder="Search name, email or role" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <button type="button" className={primaryButton} onClick={() => setShowAdd(true)}><Plus size={14} /> Add candidate</button>
      </div>
      <Banner error={error} />
      <p className="text-[11px] text-slate-400">Drag a card to another column to change its status. Open a card to schedule rounds, upload a resume or convert to an employee.</p>
      {!candidates && !error && <p className="text-xs text-slate-400">Loading…</p>}
      {candidates && (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {CANDIDATE_STAGES.map((stage) => (
              <Column key={stage.key} stage={stage} candidates={candidates.filter((c) => c.status === stage.key)} />
            ))}
          </div>
        </DndContext>
      )}
      {showAdd && (
        <CandidateFormModal
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); setReload((n) => n + 1) }}
        />
      )}
    </section>
  )
}
