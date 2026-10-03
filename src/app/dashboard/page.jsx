import { PageHeader } from '@/components/layout/topbar'
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
      {/* =====================================================
          TOP FILTER
      ====================================================== */}

      <div className="dashboard-filter">
        <PageHeader>Dashboard</PageHeader>
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
        .dashboard-page {
          width: 100%;
          min-width: 0;
          /* 1900px comfortably fits the reference's full-width Gantt
             (measured ~1829px) plus its own padding. 1500px was clipping
             the proportions below on wide screens before they ever had a
             chance to apply. */
          max-width: 1900px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .dashboard-filter { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .dashboard-stats { min-width: 0; }
        .dashboard-stats > div { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .dashboard-row-one, .dashboard-row-two {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 16px;
          min-width: 0;
        }
        .dashboard-card-slot { min-width: 0; min-height: 240px; }
        .dashboard-card-slot > div { min-height: 240px; }
        .dashboard-gantt { min-width: 0; min-height: 240px; }
        .dashboard-gantt > div { min-height: 240px; }
        @media (min-width: 640px) {
          .dashboard-stats > div { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .dashboard-row-one, .dashboard-row-two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .dashboard-deadlines { grid-column: 1 / -1; }
        }
        @media (min-width: 1280px) {
          .dashboard-stats > div { grid-template-columns: repeat(6, minmax(0, 1fr)); }
          .dashboard-row-one { grid-template-columns: 1fr 1fr 1.62fr; }
          .dashboard-row-two { grid-template-columns: 1fr 1fr 1.05fr 1.05fr; }
          .dashboard-deadlines { grid-column: auto; }
        }
        @media (min-width: 1024px) {
          /*
            Row proportions below are ratios measured off the reference
            design (card width/height in px), not arbitrary — converted to
            fr/flex weights so they hold at any viewport width instead of
            pinning literal pixels:
              row-one  (Health/Tasks/Deadlines)      495:495:802  -> 1 : 1 : 1.62
              row-two  (Activity/Progress/Notif/Cal) 438:438:460:460 -> 1 : 1 : 1.05 : 1.05
              vertical (row-one:row-two:gantt)       428:386:388  -> 1.11 : 1 : 1
            Stats height (123px) comes from the same measurement — the
            cramped 76px here predates this card's larger type/padding.
          */
          .dashboard-page { flex: 1; min-height: 0; height: 100%; gap: 10px; }
          .dashboard-filter { flex: 0 0 28px; }
          .dashboard-stats { flex: 0 0 123px; min-height: 0; }
          .dashboard-stats > div { height: 100%; grid-template-columns: repeat(6, minmax(0, 1fr)); }
          .dashboard-row-one, .dashboard-row-two { min-height: 0; gap: 10px; }
          .dashboard-row-one { flex: 1.11 1 0; grid-template-columns: 1fr 1fr 1.62fr; }
          .dashboard-row-two { flex: 1 1 0; grid-template-columns: 1fr 1fr 1.05fr 1.05fr; }
          .dashboard-deadlines { grid-column: auto; }
          .dashboard-card-slot, .dashboard-card-slot > div { height: 100%; min-height: 0; }
          .dashboard-gantt { flex: 1 1 0; min-height: 0; }
          .dashboard-gantt > div { height: 100%; min-height: 0; }
        }
      `}</style>
    </div>
  )
}
