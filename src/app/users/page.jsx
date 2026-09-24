import { Suspense } from 'react'

import { UsersList } from '@/components/users/users-list'
import { RecentlyJoinedCard } from '@/components/users/recently-joined-card'
import { TopPerformersCard } from '@/components/users/top-performers-card'
import { PendingInvitesCard } from '@/components/users/pending-invites-card'
import { TeamsFiltersCard } from '@/components/users/teams-filters-card'
import { MemberProfileCard } from '@/components/users/member-profile-card'

export const metadata = {
  title: 'Users',
}

export default function UsersPage() {
  return (
    <div className="users-page flex w-full min-w-0 flex-col gap-3 pb-3">
      <header>
        <h2 className="text-[18px] font-bold tracking-tight text-foreground">Team Members</h2>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Manage your team roles, permissions and invites.
        </p>
      </header>

      <Suspense fallback={null}>
        <UsersList
          leftColumn={<><TeamsFiltersCard /><MemberProfileCard /></>}
          rightColumn={<><TopPerformersCard /><PendingInvitesCard /><RecentlyJoinedCard /></>}
        />
      </Suspense>

      <style>{`
        .users-page { container-type: inline-size; }
        .users-columns {
          display: grid;
          grid-template-columns: minmax(180px, 0.95fr) minmax(0, 3.15fr) minmax(200px, 1fr);
          gap: 12px;
          align-items: stretch;
          min-width: 0;
        }
        .users-left, .users-right {
          display: grid;
          min-height: 0;
          min-width: 0;
          gap: 12px;
        }
        .users-columns { height: clamp(500px, 68dvh, 680px); }
        .users-left { grid-template-rows: 0.9fr 1.1fr; }
        .users-right { grid-template-rows: 1fr 0.8fr 1.4fr; }
        .users-left > div, .users-right > div {
          min-width: 0;
          min-height: 0;
          height: 100%;
          overflow-y: auto;
          scrollbar-width: thin;
        }
        .users-right > div { padding: 12px; overflow: hidden; }
        .users-right > div > div:first-child { margin-bottom: 12px; }
        .users-directory { height: 100%; }
        @container (max-width: 850px) {
          .users-columns { height: auto; }
          .users-directory { height: 520px; }
          .users-left { grid-template-rows: auto auto; }
          .users-right { grid-template-rows: 240px; }
          .users-columns { grid-template-columns: minmax(180px, 1fr) minmax(0, 3fr); }
          .users-right { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @container (max-width: 640px) {
          .users-columns, .users-right { grid-template-columns: minmax(0, 1fr); }
          .users-right { grid-template-rows: none; grid-auto-rows: auto; }
        }
      `}</style>
    </div>
  )
}
