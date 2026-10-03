import { PageHeader } from '@/components/layout/topbar'
import { Suspense } from 'react'

import { TaskStats } from '@/components/tasks/task-stats'
import { TasksList, TaskViewport } from '@/components/tasks/tasks-list'
import { PriorityBreakdown } from '@/components/tasks/priority-breakdown'
import { UpcomingDeadlines } from '@/components/tasks/UpcomingDeadlines'

// Keep the scoped task styles with the page so they arrive with its markup.
const taskPageStyles = `
.tasks-page { width:100%; max-width:1500px; margin:0 auto; min-width:0; display:grid; gap:16px; }
.tasks-stats .task-summary-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
.tasks-content { display:grid; grid-template-columns:minmax(0,1fr); gap:16px; align-items:start; }
.tasks-list, .tasks-insights { min-width:0; }
.tasks-list .task-table-card { display:flex; flex-direction:column; }
.tasks-list .task-table-card table { min-width:760px; }
.tasks-list th, .tasks-list td { padding-top:10px; padding-bottom:10px; }
.tasks-list .task-pagination { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px; padding:12px; border-top:1px solid #e2e8f0; }
.tasks-insights { display:grid; gap:16px; align-content:start; }
.tasks-insights .deadline-items { display:grid; gap:8px; }
.tasks-insights .deadline-item { padding:10px; border:1px solid #ede9fe; border-left:3px solid #a78bfa; border-radius:8px; background:#faf9ff; }
@media(min-width:640px) {
 .tasks-stats .task-summary-grid { grid-template-columns:repeat(3,minmax(0,1fr)); }
 .tasks-insights { grid-template-columns:repeat(2,minmax(0,1fr)); }
}
@media(min-width:1280px) {
 .tasks-stats .task-summary-grid { grid-template-columns:repeat(5,minmax(0,1fr)); }
 .tasks-content { grid-template-columns:minmax(0,1fr) 280px; }
 .tasks-insights { grid-template-columns:minmax(0,1fr); }
}
@media(min-width:1024px) {
 .tasks-page { flex:1; height:100%; min-height:0; grid-template-rows:auto 100px minmax(0,1fr); gap:10px; }
 .tasks-stats .task-summary-grid { height:100%; grid-template-columns:repeat(5,minmax(0,1fr)); gap:10px; }
 .tasks-stats .task-summary-grid > div { padding:8px 12px; }
 .tasks-content { min-height:0; grid-template-columns:minmax(0,1fr) clamp(210px,24%,280px); gap:10px; align-items:stretch; }
 .tasks-list { min-height:0; height:100%; }
 .tasks-list .task-table-card { flex:1; min-height:0; }
 .tasks-list .task-table-card > div:first-child { overflow:auto; }
 .tasks-list .task-table-card table { min-width:0; }
 .tasks-list th, .tasks-list td { padding-top:4px; padding-bottom:4px; font-size:11px; }
 .tasks-list .task-pagination { flex-shrink:0; padding:8px 12px; }
 .tasks-insights { min-height:0; height:100%; grid-template-columns:minmax(0,1fr); grid-template-rows:auto minmax(0,1fr); gap:10px; }
 .tasks-insights > * { min-height:0; }
 .tasks-insights .deadline-item { padding:6px 8px; }
}

`

export default function TasksPage() {
  return (
    <>
      <style>{taskPageStyles}</style>
      <TaskViewport className="tasks-page">
        <PageHeader>Tasks</PageHeader>
        <section aria-label="Task statistics" className="tasks-stats">
          <TaskStats />
        </section>

        <div className="tasks-content">
          <section aria-label="Task list" className="tasks-list">
            <Suspense
              fallback={
                <div className="h-80 animate-pulse rounded-2xl bg-white" />
              }
            >
              <TasksList />
            </Suspense>
          </section>

          <aside aria-label="Task insights" className="tasks-insights">
            <PriorityBreakdown />
            <UpcomingDeadlines />
          </aside>
        </div>
      </TaskViewport>
    </>
  )
}
