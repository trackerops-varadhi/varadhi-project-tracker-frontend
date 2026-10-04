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
      <div className="dashboard-content">
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
      </div>

      <style>{`
        .dashboard-page { width:100%; min-width:0; max-width:1900px; margin:auto; container-type:inline-size; container-name:dashboard; }
        .dashboard-content { display:grid; gap:16px; min-width:0; }
        .dashboard-filter { display:flex; align-items:center; justify-content:space-between; gap:12px; }
        .dashboard-filter h1 { font-size:22px; line-height:28px; }
        .dashboard-stats > div:not([role="alert"]) { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; height:100%; }
        .dashboard-stats > div > div,.dashboard-stats > div > a { padding:16px; border-radius:16px; }
        .dashboard-stats p[title] { font-size:12px; line-height:16px; }
        .dashboard-stats p:not([title]) { font-size:24px; line-height:26px; font-variant-numeric:tabular-nums; }
        .dashboard-stats p[title]:last-child { font-size:10px; line-height:14px; }
        .dashboard-row-one,.dashboard-row-two { display:grid; gap:16px; min-width:0; min-height:0; }
        .dashboard-card-slot { min-width:0; min-height:0; height:280px; }
        .dashboard-card-slot > div,.dashboard-gantt > div { height:100%; min-height:0; overflow:hidden; border-radius:16px; }
        .dashboard-card-slot h3,.dashboard-gantt h3 { flex-shrink:0; font-size:11px; line-height:15px; font-weight:600; margin:0; }
        .dashboard-card-slot [class~="text-[11px]"],.dashboard-gantt [class~="text-[11px]"] { font-size:11px; line-height:15px; }
        .dashboard-card-slot [class~="text-[10px]"] { font-size:10px; line-height:14px; }
        .dashboard-card-slot > div:not(:has(> div.border-b)):not(.task-overview-card),.dashboard-gantt > div { padding:16px; gap:12px; }
        .dashboard-card-slot > div > div.border-b { height:42px; flex-shrink:0; padding:0 16px; }
        .dashboard-row-two .dashboard-card-slot > div > div.border-b + div:not(.dashboard-project-scroll) { padding:8px 16px 12px; }
        /* Reference bounds: two equal cards and a deadline card 1.62 times wider. */
        .dashboard-row-one .dashboard-card-slot { height:240px; }
        .dashboard-row-one .dashboard-card-slot > div { padding:12px 16px; gap:8px; }
        .dashboard-row-one .dashboard-card-slot h3 { font-size:12px; line-height:18px; }
        .dashboard-row-one .dashboard-card-slot [class~="text-[11px]"] { font-size:11px; line-height:15px; }
        .dashboard-row-one .dashboard-card-slot [class~="text-[10px]"] { font-size:10px; line-height:14px; }
        .dashboard-row-one .project-health-body { gap:8px; }
        .dashboard-row-one .project-health-chart { padding:0; }
        .dashboard-row-one .project-health-ring { width:100px; height:100px; max-width:100%; }
        .dashboard-row-one .project-health-legend { gap:4px; }
        .dashboard-row-one .project-health-legend span { font-size:11px; line-height:16px; }
        .dashboard-row-one .task-overview-body { gap:8px; }
        .dashboard-row-one .task-overview-body p { font-size:12px; line-height:16px; }
        .dashboard-row-one .task-overview-body [role="progressbar"] { height:22px; flex-shrink:0; }
        .dashboard-row-one .task-overview-body dt { font-size:11px; line-height:16px; }
        .dashboard-row-one .task-overview-body dd { font-size:20px; }
        .dashboard-row-one .deadline-list { margin-top:0; scrollbar-width:thin; scrollbar-color:#c4b5fd transparent; }
        .dashboard-row-one .deadline-row { height:34px; min-height:34px; padding:2px 0; gap:8px; }
        .dashboard-row-one .deadline-due { width:96px; font-size:10px; line-height:14px; }
        .dashboard-row-one .deadline-priority { font-size:10px; line-height:14px; padding:2px 6px; }
        @container dashboard (max-width:599px) {
          .dashboard-row-one .deadline-row { gap:5px; }
          .dashboard-row-one .deadline-due { width:76px; }
          .dashboard-row-one .deadline-priority { max-width:78px; white-space:normal; text-align:center; }
        }
        .calendar-empty-state { gap:3px; padding:6px 10px; }
        .calendar-empty-state > div { display:none; }
        .calendar-empty-state p,.calendar-empty-state a { margin-top:0; }
        .dashboard-gantt { height:260px; min-height:0; min-width:0; }
        .dashboard-gantt > div > div:last-of-type { margin-top:8px; }
        .dashboard-activity-row { align-items:center; }
        .dashboard-activity-row > div:last-child { display:flex; align-items:center; gap:8px; }
        .dashboard-activity-row > div:last-child > p { flex:1; }
        .dashboard-activity-row > div:last-child > span { flex-shrink:0; margin-top:0; white-space:nowrap; }
        .dashboard-project-details { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:6px 8px; align-items:center; }
        .dashboard-project-details > div:first-child { display:contents; }
        .dashboard-project-details > div:first-child > div { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:6px; grid-column:1; grid-row:1; }
        .dashboard-project-details > div:first-child > span { grid-column:2; grid-row:1; text-align:right; }
        .dashboard-project-details > div:nth-child(2) { grid-column:1/-1; grid-row:2; margin-top:0; }
        .dashboard-project-details > div:last-child { grid-column:1/-1; grid-row:3; margin-top:0; }
        .dashboard-row-two .dashboard-card-slot > div > div.border-b { height:42px; }
        .dashboard-row-two .dashboard-card-slot:nth-child(3) > div { padding:16px; gap:12px; }
        .dashboard-row-two .dashboard-card-slot:nth-child(3) > div > div:last-child { margin-top:0; }
        .dashboard-gantt > div { padding:16px; gap:12px; }
        .dashboard-row-one,.dashboard-row-two { align-items:stretch; }
        .dashboard-gantt .gantt-table { height:100%; }
        .dashboard-gantt .gantt-table .gantt-project-row { height:44px; }
        .dashboard-gantt .gantt-scroll { height:100%; }
        .dashboard-scroll-preview { scrollbar-width:thin; scrollbar-color:#c4b5fd transparent; }
        .dashboard-row-two .dashboard-card-slot > div > .dashboard-edge-scroll { padding-left:0; padding-right:0; }
        .dashboard-notifications-card > .dashboard-edge-scroll { margin-left:-16px; margin-right:-16px; }
        .dashboard-edge-scroll > .dashboard-scroll-preview { padding-right:0; }
        .dashboard-edge-scroll > .dashboard-scroll-preview > div { padding-left:16px; padding-right:16px; }
        @container dashboard (min-width:600px) {
          .dashboard-stats > div:not([role="alert"]) { grid-template-columns:repeat(3,minmax(0,1fr)); }
          .dashboard-row-one,.dashboard-row-two { grid-template-columns:repeat(2,minmax(0,1fr)); }
          .dashboard-deadlines { grid-column:1/-1; }
        }
        @media (min-width:1024px) {
          .dashboard-content { grid-template-rows:32px auto auto auto auto; gap:16px; }
          .dashboard-stats > div:not([role="alert"]) { grid-template-columns:repeat(6,minmax(0,1fr)); }
          .dashboard-row-one { grid-template-columns:1fr 1fr 1.62fr; }
          .dashboard-row-two { grid-template-columns:repeat(4,minmax(0,1fr)); }
          .dashboard-deadlines { grid-column:auto; }
        }
      `}</style>
    </div>
  )
}
