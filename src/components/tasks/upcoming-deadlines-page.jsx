"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import { tasksApi } from '@/lib/api/tasks.api'
import { formatDueLabel, priorityBadgeClass, priorityLabel } from '@/lib/deadline-format'
import { StatusBadge } from './task-badge'

export function UpcomingDeadlinesPage() {
  const [request, setRequest] = useState(0)
  const [result, setResult] = useState(null)
  const [days, setDays] = useState(30)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        // Fetch every page: the preview endpoint caps results at 50 tasks.
        const tasks = await tasksApi.getAllPages()
        if (!cancelled) setResult({ request, tasks, error: null })
      } catch (error) {
        if (!cancelled) setResult({ request, tasks: [], error: error.response?.data?.message || 'Unable to load upcoming deadlines.' })
      }
    }
    load()
    return () => { cancelled = true }
  }, [request])

  const loading = !result || result.request !== request
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(today)
  end.setDate(end.getDate() + days + 1)
  const tasks = (result?.tasks ?? [])
    .filter(task => task.status !== 'completed' && task.dueDate && Number.isFinite(new Date(task.dueDate).getTime()) && new Date(task.dueDate) < end)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      <Link href="/tasks" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-primary"><ArrowLeft className="h-3.5 w-3.5" />Back to tasks</Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-xl font-semibold text-slate-900">Upcoming Deadlines</h1><p className="mt-1 text-xs text-slate-500">Overdue tasks and deadlines in the next {days} days.</p></div>
        <div role="group" aria-label="Deadline range" className="flex gap-1 rounded-full bg-slate-100 p-1">{[7, 30].map(range => <button key={range} type="button" aria-pressed={days === range} onClick={() => setDays(range)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${days === range ? 'bg-primary text-white' : 'text-slate-600 hover:bg-white'}`}>{range}d</button>)}</div>
      </div>
      <section aria-label="Upcoming deadlines" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? <p role="status" className="p-8 text-center text-sm text-slate-500">Loading deadlines...</p> : result.error ? <div role="alert" className="p-6 text-center text-sm text-red-600"><p>{result.error}</p><button type="button" onClick={() => setRequest(value => value + 1)} className="mt-3 font-medium underline">Retry</button></div> : tasks.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">No upcoming deadlines.</p> : <ul className="divide-y divide-slate-100">{tasks.map(task => {
          const due = new Date(task.dueDate)
          due.setHours(0, 0, 0, 0)
          const daysLeft = Math.round((due - today) / 86400000)
          return <li key={task.id}><Link href={`/tasks/${task.id}`} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-primary sm:grid-cols-[minmax(0,1fr)_140px_110px]">
            <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800" title={task.title}>{task.title}</p><p className="mt-1 truncate text-xs text-slate-500">{task.project?.name || 'No project'}{task.assignee?.name ? ` ? ${task.assignee.name}` : ''}</p><div className="mt-1.5"><StatusBadge status={task.status} /></div></div>
            <div className={`flex items-center gap-1.5 text-xs ${daysLeft < 0 ? 'text-red-600' : 'text-slate-500'}`}><CalendarDays className="h-3.5 w-3.5 shrink-0" /><span>{formatDueLabel(daysLeft, task.dueDate)}</span></div>
            <span className={`col-span-2 w-fit rounded-full px-2 py-1 text-[11px] font-medium sm:col-span-1 ${priorityBadgeClass(task.priority)}`}>{priorityLabel(task.priority)}</span>
          </Link></li>
        })}</ul>}
      </section>
    </div>
  )
}
