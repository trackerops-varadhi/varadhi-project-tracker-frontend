import { PageHeader } from '@/components/layout/topbar'
import { Suspense } from 'react'
import { ProjectsList } from '@/components/projects/projects-list'

export const metadata = {
  title: 'Projects',
}

export default function ProjectsPage() {
  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <PageHeader>Projects</PageHeader>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage and track all your team projects.
        </p>
      </div>

      {/* Projects List — Suspense required: ProjectsList reads useSearchParams()
          (topbar search hand-off) and this page is statically prerendered. */}
      <Suspense fallback={null}>
        <ProjectsList />
      </Suspense>

    </div>
  )
}