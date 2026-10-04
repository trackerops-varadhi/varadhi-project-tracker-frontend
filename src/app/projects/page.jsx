import { PageHeader } from '@/components/layout/topbar'
import { Suspense } from 'react'
import { ProjectsList } from '@/components/projects/projects-list'

export const metadata = {
  title: 'Projects',
}

export default function ProjectsPage() {
  return (
    <div className="projects-page">
      <style>{`
        .projects-page { width:100%; max-width:1500px; margin:0 auto; min-width:0; display:flex; flex-direction:column; gap:16px; }
        .projects-workspace { display:grid; gap:16px; min-width:0; }
        .project-summary-grid { gap:12px; }
        .projects-content { display:grid; grid-template-columns:minmax(0,1fr); gap:16px; align-items:start; }
        .projects-list { display:flex; flex-direction:column; gap:8px; min-width:0; }
        .projects-insights { display:grid; grid-template-columns:minmax(0,1fr); gap:16px; min-width:0; align-content:start; align-items:stretch; }
        .projects-insights > * { min-width:0; }
        .projects-bottom-insights { grid-column:1/-1; }
        .projects-insights .project-panel { border-color:#e2e8f0; box-shadow:0 1px 2px rgb(0 0 0 / .05); }
        .projects-insights .project-panel-title { font-size:12px; line-height:16px; font-weight:600; }
        .project-data-panel { display:flex; flex-direction:column; min-width:0; overflow:hidden; border-color:#e2e8f0; box-shadow:0 1px 2px rgb(0 0 0 / .05); }
        .project-data-panel th,.project-data-panel td { padding:8px 4px; font-size:12px; }
        .project-data-panel th { text-transform:none; letter-spacing:normal; }
        .project-data-panel td { overflow-wrap:anywhere; }
        .project-data-panel td a { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .project-data-panel td .truncate { min-width:0; }
        .project-data-panel thead { background:#f8fafc; }
        .project-pagination { flex-shrink:0; }
        @media(max-width:639px) {
          .project-data-panel th,.project-data-panel td { padding-left:2px; padding-right:2px; font-size:10px; }
          .project-data-panel td:nth-child(3) .rounded-full { display:none; }
        }
        @media(min-width:640px) { .projects-insights { grid-template-columns:repeat(2,minmax(0,1fr)); } }
        @media(min-width:1024px) {
          .projects-page { gap:10px; }
          .projects-workspace { gap:10px; }
          .project-summary-grid { min-height:100px; grid-template-columns:repeat(5,minmax(0,1fr)); gap:10px; }

          .projects-content { grid-template-columns:minmax(0,1fr) clamp(240px,26%,320px); gap:16px; }
          .projects-list { display:contents; }
          .projects-toolbar { grid-column:1/-1; grid-row:1; }
          .project-data-panel { grid-column:1; grid-row:2; align-self:stretch; }
          .project-data-panel th,.project-data-panel td { padding-top:4px; padding-bottom:4px; font-size:11px; }
          .projects-insights { grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; }
          .projects-side-insights { grid-column:2; grid-row:2; align-self:stretch; grid-template-columns:minmax(0,1fr); grid-template-rows:auto minmax(auto,1fr); }
          .projects-bottom-insights { grid-row:3; }
        }
      `}</style>

      {/* Page Header */}
      <div>
        <PageHeader>Projects</PageHeader>
      </div>

      {/* Projects List — Suspense required: ProjectsList reads useSearchParams()
          (topbar search hand-off) and this page is statically prerendered. */}
      <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-white" />}>
        <ProjectsList />
      </Suspense>

    </div>
  )
}
