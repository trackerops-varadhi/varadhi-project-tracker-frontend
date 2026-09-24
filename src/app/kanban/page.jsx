import { KanbanBoard } from '@/components/kanban/kanban-board'
import { TeamWorkloadCard } from '@/components/kanban/team-workload-card'
import { UpcomingDeadlinesCard } from '@/components/kanban/upcoming-deadlines-card'
import { KanbanStats } from '@/components/kanban/kanban-stats'

export const metadata = {
  title: 'Kanban Board',
}

export default function KanbanPage() {
  return (
    <div className="kanban-page min-w-0 space-y-5 sm:space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Kanban Board
        </h2>

        <p className="text-sm text-muted-foreground mt-0.5">
          Drag and drop tasks across columns to update their status.
        </p>
      </div>

      {/* Stats Row */}
      <KanbanStats />

      {/* Kanban Board */}
      <KanbanBoard />

      {/* Dashboard Cards */}
      <div className="kanban-insights grid grid-cols-2 gap-5">
        <TeamWorkloadCard />
        <UpcomingDeadlinesCard />
      </div>
      <style>{`
        .kanban-board-region {
          width: 100%;
          min-width: 0;
          container-type: inline-size;
        }

        .kanban-columns {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          align-items: start;
        }

        .kanban-page > .grid:not(.kanban-insights) {
          grid-template-columns: repeat(4, minmax(0, 1fr));
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
