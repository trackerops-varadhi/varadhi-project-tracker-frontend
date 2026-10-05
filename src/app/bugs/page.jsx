import { Suspense } from 'react'

import { BugsList } from '@/components/bugs/bugs-list'

export const metadata = {
  title: 'Bugs',
}

/**
 * Bugs Finder home — the bug management table (§9).
 *
 * The KPI/widget dashboard still exists as `components/bugs/bugs-dashboard.jsx`
 * and is reachable through the Reports page's defect metrics; this route is
 * deliberately just the list, so opening Bugs lands straight on the work
 * rather than on a summary the user has to click past.
 */
export default function BugsPage() {
  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-xl font-semibold text-foreground">Bugs Finder</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Report, triage and resolve defects — with SLA tracking from the moment a bug is filed.
        </p>
      </div>

      {/* Suspense: BugsList reads useSearchParams() for the topbar search
          hand-off, the same reason the tasks page wraps its list. */}
      <Suspense fallback={null}>
        <BugsList />
      </Suspense>
    </div>
  )
}
