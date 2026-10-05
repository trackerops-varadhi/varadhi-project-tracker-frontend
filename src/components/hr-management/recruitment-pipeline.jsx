import { Card } from '@/components/ui/card'
import { UserSearch } from 'lucide-react'

// `stages` comes from HrDashboard: CANDIDATE_STAGES (constants/people.js) with
// live counts from the dashboard's recruitment pipeline.
export function RecruitmentPipeline({ stages = [] }) {
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
          <span key={stage.key ?? stage.label} className={stage.color} style={{ width: `${total > 0 ? stage.count / total * 100 : 0}%` }} />
        ))}
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
        {stages.map((stage) => (
          <div key={stage.key ?? stage.label} className="flex min-w-0 items-center justify-between gap-2 border-b border-slate-100 pb-1">
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
