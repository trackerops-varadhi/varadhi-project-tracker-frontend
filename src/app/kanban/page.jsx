import { PageHeader } from '@/components/layout/topbar'
import { KanbanBoard } from '@/components/kanban/kanban-board'
import { TeamWorkloadCard } from '@/components/kanban/team-workload-card'
import { UpcomingDeadlinesCard } from '@/components/kanban/upcoming-deadlines-card'
import { KanbanStats } from '@/components/kanban/kanban-stats'

export const metadata = {
  title: 'Kanban Board',
}

export default function KanbanPage() {
  return (
    <div className="kanban-page mx-auto w-full max-w-[1500px] min-w-0 space-y-3 sm:space-y-4">
      <div>
        <PageHeader>Kanban Board</PageHeader>

        <p className="text-sm text-muted-foreground mt-0.5">
          Drag and drop tasks across columns to update their status.
        </p>
      </div>

      {/* Stats Row */}
      <KanbanStats />

      {/* Kanban Board */}
      <KanbanBoard />

      {/* Dashboard Cards */}
      <div className="kanban-insights grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 [&>*]:min-w-0">
        <TeamWorkloadCard />
        <UpcomingDeadlinesCard />
      </div>
      <style>{`
        .kanban-board-region {
          width: 100%;
          min-width: 0;
          max-width: 100%;
          overflow-x: auto;
          overscroll-behavior-x: contain;
          padding-bottom: 8px;
        }

        .kanban-columns {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          align-items: start;
        }

        .kanban-page > .grid:not(.kanban-insights) {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        @media (max-width: 1279px) {
          .kanban-columns { grid-template-columns: repeat(4, minmax(250px, 1fr)); }
        }
        @media (min-width: 1024px) {
          .kanban-page > .grid:not(.kanban-insights) { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }
        @media (max-width: 767px) {
          .compact-mobile-shell > div > header {
            gap: 8px;
            padding-left: 8px;
            padding-right: 8px;
          }
        }
      `}</style>
    </div>
  )
}
