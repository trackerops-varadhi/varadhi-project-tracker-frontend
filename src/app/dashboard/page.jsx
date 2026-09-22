import { StatsCards, DashboardPeriodSelector } from '@/components/dashboard/stats-cards'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { ProjectProgress } from '@/components/dashboard/project-progress'
import { CalendarSyncWidget } from '@/components/dashboard/calendar-sync-widget'
import { ProjectHealth } from '@/components/dashboard/ProjectHealth'
import { TasksOverview } from '@/components/dashboard/TasksOverview'
import { UpcomingDeadlines } from '@/components/dashboard/UpcomingDeadlines'
import { NotificationsCard } from '@/components/dashboard/NotificationsCard'
import { GanttPreview } from '@/components/dashboard/GanttPreview'


export const metadata = {
  title: 'Dashboard',
}

export default function DashboardPage() {
  return (
    <div className="dashboard-page bg-slate-50">
      <input
        className="dashboard-panel-choice"
        type="radio"
        name="dashboard-panel"
        id="dashboard-overview"
        defaultChecked
      />
      <input
        className="dashboard-panel-choice"
        type="radio"
        name="dashboard-panel"
        id="dashboard-activity"
      />
      <input
        className="dashboard-panel-choice"
        type="radio"
        name="dashboard-panel"
        id="dashboard-timeline"
      />
      <div className="dashboard-mobile-navigation" role="group" aria-label="Dashboard sections">
        <label htmlFor="dashboard-overview">Overview</label>
        <label htmlFor="dashboard-activity">Activity</label>
        <label htmlFor="dashboard-timeline">Timeline</label>
      </div>
      {/* =====================================================
          TOP FILTER
      ====================================================== */}

      <div className="dashboard-filter">
        <DashboardPeriodSelector />
      </div>

      {/* =====================================================
          STATS
      ====================================================== */}

      <section className="dashboard-stats">
        <StatsCards />
      </section>

      {/* =====================================================
          ROW 1
      ====================================================== */}

      <section className="dashboard-row-one">
        <div className="dashboard-card-slot">
          <ProjectHealth />
        </div>

        <div className="dashboard-card-slot">
          <TasksOverview />
        </div>

        <div className="dashboard-card-slot dashboard-deadlines">
          <UpcomingDeadlines />
        </div>
      </section>

      {/* =====================================================
          ROW 2
      ====================================================== */}

      <section className="dashboard-row-two">
        <div className="dashboard-card-slot">
          <RecentActivity />
        </div>

        <div className="dashboard-card-slot">
          <ProjectProgress />
        </div>

        <div className="dashboard-card-slot">
          <NotificationsCard />
        </div>

        <div className="dashboard-card-slot">
          <CalendarSyncWidget />
        </div>
      </section>

      {/* =====================================================
          ROW 3
      ====================================================== */}

      <section className="dashboard-gantt">
        <GanttPreview />
      </section>

      <style>{`

        .dashboard-shell > div > header {
          flex-shrink: 0;
        }

        .dashboard-page {
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 1500px;
          height: 100%;
          min-height: 0;
          margin: 0 auto;
          padding: 0 16px 8px;
          overflow: hidden;
        }

        .dashboard-filter {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          height: 28px;
          flex-shrink: 0;
          margin-bottom: 6px;
        }

        .dashboard-stats {
          flex: 0 0 76px;
          min-width: 0;
          min-height: 0;
          margin-bottom: 8px;
          overflow: hidden;
        }

        .dashboard-stats > div {
          height: 100%;
          grid-template-columns: repeat(6, minmax(0, 1fr));
        }

        .dashboard-row-one,
        .dashboard-row-two {
          display: grid;
          gap: 8px;
          flex: 1 1 0;
          min-width: 0;
          min-height: 0;
          margin-bottom: 8px;
        }

        .dashboard-row-one {
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.7fr);
        }

        .dashboard-row-two {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .dashboard-card-slot {
          width: 100%;
          height: 100%;
          min-width: 0;
          min-height: 0;
          overflow: hidden;
        }

        .dashboard-gantt {
          flex: 0.9 1 0;
          min-width: 0;
          min-height: 105px;
          overflow: hidden;
        }

        .dashboard-panel-choice,
        .dashboard-mobile-navigation {
          display: none;
        }

        .dashboard-canvas[data-mobile="true"] .dashboard-page {
          padding: 0 0 4px;
        }

        .dashboard-canvas[data-mobile="true"] .dashboard-panel-choice {
          display: block;
          position: absolute;
          width: 1px;
          height: 1px;
          clip-path: inset(50%);
          overflow: hidden;
        }

        .dashboard-canvas[data-mobile="true"] .dashboard-mobile-navigation {
          display: flex;
          flex-shrink: 0;
          gap: 4px;
          margin-bottom: 8px;
        }

        .dashboard-mobile-navigation label {
          flex: 1;
          padding: 8px 4px;
          border-radius: 8px;
          background: white;
          color: #475569;
          text-align: center;
          font-size: 12px;
          cursor: pointer;
        }

        #dashboard-overview:checked ~ .dashboard-mobile-navigation label[for="dashboard-overview"],
        #dashboard-activity:checked ~ .dashboard-mobile-navigation label[for="dashboard-activity"],
        #dashboard-timeline:checked ~ .dashboard-mobile-navigation label[for="dashboard-timeline"] {
          background: #ede9fe;
          color: #6d28d9;
          font-weight: 600;
        }

        .dashboard-panel-choice:focus-visible ~ .dashboard-mobile-navigation {
          outline: 2px solid #7c3aed;
          outline-offset: 2px;
        }

        .dashboard-canvas[data-mobile="true"] .dashboard-stats {
          flex-basis: 152px;
        }

        .dashboard-canvas[data-mobile="true"] .dashboard-stats > div {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          grid-template-rows: repeat(2, minmax(0, 1fr));
        }

        .dashboard-canvas[data-mobile="true"] .dashboard-row-one,
        .dashboard-canvas[data-mobile="true"] .dashboard-row-two {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          grid-template-rows: repeat(2, minmax(0, 1fr));
          margin-bottom: 0;
        }

        .dashboard-canvas[data-mobile="true"] .dashboard-deadlines {
          grid-column: 1 / -1;
        }

        .dashboard-canvas[data-mobile="true"] #dashboard-overview:not(:checked) ~ .dashboard-row-one,
        .dashboard-canvas[data-mobile="true"] #dashboard-activity:not(:checked) ~ .dashboard-row-two,
        .dashboard-canvas[data-mobile="true"] #dashboard-timeline:not(:checked) ~ .dashboard-gantt {
          display: none;
        }

        @media (max-width: 767px) {
          .dashboard-shell > div > header {
            gap: 8px;
            padding-left: 8px;
            padding-right: 8px;
          }
        }
      `}</style>
    </div>
  )
}
