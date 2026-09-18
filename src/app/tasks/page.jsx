import { Suspense } from 'react'

import { TaskStats } from '@/components/tasks/task-stats'
import { TasksList, TaskViewport } from '@/components/tasks/tasks-list'
import { PriorityBreakdown } from '@/components/tasks/priority-breakdown'
import { UpcomingDeadlines } from '@/components/tasks/UpcomingDeadlines'

// Keep the scoped task styles with the page so they arrive with its markup.
const taskPageStyles = `
.tasks-filterOptions {
  width: 96px;
  height: 28px;
  overflow-x: hidden;
  scroll-snap-type: y mandatory;
  overscroll-behavior-y: contain;
  overflow-y: scroll !important;
  scrollbar-width: thin !important;
  scrollbar-color: #94a3b8 #f1f5f9;
}

.tasks-filterOptions::-webkit-scrollbar {
  display: block !important;
  width: 6px;
}

.tasks-filterOptions::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.tasks-filterOptions::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: #94a3b8;
}

.tasks-page {
  display: grid;
  grid-template-rows: 88px minmax(0, 1fr);
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  gap: 10px;
  padding-bottom: 3px;
  overflow: hidden;
}

.tasks-stats {
  flex: 0 0 82px;
  min-height: 0;
}

.tasks-stats .task-summary-grid {
  display: grid;
  height: 100%;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.tasks-stats .task-summary-grid > div {
  padding: 8px 12px;
}

.tasks-stats h2,
.tasks-stats p:last-child {
  font-size: 11px;
  line-height: 1.3;
}

.tasks-stats p.tabular-nums {
  margin-top: 4px;
  font-size: 24px;
  line-height: 1;
}

.tasks-content {
  display: grid;
  flex: 1;
  min-height: 0;
  grid-template-columns: minmax(0, 1fr) clamp(230px, 24%, 300px);
  grid-template-rows: minmax(0, 1fr);
  gap: 10px;
}

.tasks-list {
  min-width: 0;
  min-height: 0;
  height: 100%;
}

.tasks-list .task-table-card {
  display: grid;
  grid-template-rows: minmax(0, 1fr) 40px;
  flex: 1 1 0;
  min-height: 0;
}

.tasks-list .task-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 40px;
  min-width: 0;
  padding: 0 12px;
  border-top: 1px solid #e2e8f0;
  background: white;
}

.tasks-list th,
.tasks-list td p,
.tasks-list td span {
  font-size: 11px;
}

.tasks-list td > div > span.inline-flex {
  font-size: 9px;
  line-height: 1.4;
  padding: 2px 4px;
}

.tasks-list .task-list-toolbar > div:first-child {
  height: 32px;
  gap: 4px;
}

.tasks-list .task-list-toolbar button,
.tasks-list .task-list-toolbar select {
  font-size: 11px;
}

.tasks-list button:focus-visible,
.tasks-list select:focus-visible,
.tasks-insights a:focus-visible {
  outline: 2px solid #7c3aed;
  outline-offset: 2px;
}

.tasks-insights {
  display: grid;
  min-width: 0;
  min-height: 0;
  height: 100%;
  gap: 10px;
  grid-template-rows: minmax(135px, 28%) minmax(0, 1fr);
}

.tasks-insights [data-slot="card"] {
  padding: 10px;
  gap: 8px;
}

.tasks-insights h3 {
  font-size: 12px;
}

.tasks-insights p,
.tasks-insights span,
.tasks-insights a {
  font-size: 11px;
}

.tasks-insights .overflow-auto {
  overflow: hidden;
}

.tasks-insights a.min-w-0 {
  min-height: 0;
}

/* Let the task rows use the available card height above the fixed footer. */
.tasks-list .task-table-card table {
  height: 100%;
}

.tasks-list .task-table-card thead {
  height: 32px;
}

.tasks-insights .deadline-content {
  display: flex;
  min-height: 0;
  flex: 1;
}

.tasks-insights .deadline-items {
  display: grid;
  grid-auto-rows: minmax(0, 1fr);
  gap: 8px;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.tasks-insights .deadline-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 0;
  padding: 8px;
  border: 1px solid #ede9fe;
  border-left: 3px solid #a78bfa;
  background: #faf9ff;
}

.tasks-insights .deadline-item:hover {
  background: #f5f3ff;
}
`

export default function TasksPage() {
  return (
    <>
      <style>{taskPageStyles}</style>
      <TaskViewport className="tasks-page">
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
