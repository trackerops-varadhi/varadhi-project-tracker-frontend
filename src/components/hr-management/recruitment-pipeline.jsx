import { Card } from '@/components/ui/card'
import { UserSearch } from 'lucide-react'

// Candidate states follow the People & Workforce specification.
const MOCK_STAGES = [
  { label: 'Applied', count: 12, color: 'bg-slate-400' },
  { label: 'Screening', count: 8, color: 'bg-sky-500' },
  { label: 'Interview scheduled', count: 5, color: 'bg-violet-500' },
  { label: 'Interviewed', count: 2, color: 'bg-indigo-500' },
  { label: 'Selected', count: 4, color: 'bg-emerald-500' },
  { label: 'Hold', count: 3, color: 'bg-amber-500' },
  { label: 'Rejected', count: 1, color: 'bg-rose-500' },
  { label: 'Offered', count: 1, color: 'bg-teal-500' },
  { label: 'Joined', count: 0, color: 'bg-green-500' },
  { label: 'Declined', count: 0, color: 'bg-orange-500' },
]

export function RecruitmentPipeline({ stages = MOCK_STAGES }) {
  const total = stages.reduce((count, stage) => count + stage.count, 0)

  return (
    <Card asChild layout="custom">
    <section
      aria-labelledby="recruitment-pipeline-title"
      className="flex h-full min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
        <div>
          <h2 id="recruitment-pipeline-title" className="text-xs font-semibold text-slate-900">Recruitment Pipeline</h2>
          <p className="mt-0.5 text-[11px] leading-4 text-slate-500">Candidates by current status</p>
        </div>
        <span className="rounded-lg bg-sky-50 p-1.5 text-sky-600">
          <UserSearch aria-hidden="true" className="h-4 w-4" />
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5">
        <p className="text-xl font-bold leading-none tabular-nums text-slate-900">{total}</p>
        <p className="text-[11px] leading-4 text-slate-500">Candidates across all stages</p>
      </div>
      <div aria-hidden="true" className="mt-2 flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-slate-100">
        {stages.filter((stage) => stage.count > 0).map((stage) => (
          <span key={stage.label} className={stage.color} style={{ width: `${total > 0 ? stage.count / total * 100 : 0}%` }} />
        ))}
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
        {stages.map((stage) => (
          <div key={stage.label} className="flex min-w-0 items-center justify-between gap-2 border-b border-slate-100 pb-1">
            <dt className="flex min-w-0 items-center gap-1.5 text-[11px] leading-4 text-slate-600">
              <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-full ${stage.color}`} />
              {stage.label}
            </dt>
            <dd className="min-w-5 shrink-0 rounded bg-slate-50 px-1 text-center text-[11px] font-semibold leading-4 tabular-nums text-slate-900">{stage.count}</dd>
          </div>
        ))}
      </dl>
    </section>
    </Card>
  )
}
