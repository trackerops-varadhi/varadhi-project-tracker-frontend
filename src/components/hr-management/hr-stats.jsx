"use client";
import { StatCard } from '@/components/shared/stat-card'
import { Users, UserCheck, CalendarDays, BriefcaseBusiness } from 'lucide-react'

// `stats` comes from GET /api/people/dashboard via HrDashboard; null while loading.
export function HRStats({ stats, loading = false }) {
  const s = stats || {}
  const cards = [
    {
      title: 'Total Employees',
      value: s.totalEmployees ?? 0,
      subtitle: stats ? `+${s.newEmployeesThisMonth} this month` : null,
      icon: Users,
    },
    {
      title: 'Present Today',
      value: s.presentToday ?? 0,
      subtitle: stats ? `${s.attendancePercent}% attendance` : null,
      icon: UserCheck,
    },
    {
      title: 'On Leave',
      value: s.onLeave ?? 0,
      subtitle: stats ? `${s.plannedLeave} planned · ${s.unplannedLeave} unplanned` : null,
      icon: CalendarDays,
    },
    {
      // There is no requisition/opening record yet, so this counts candidates
      // still in the funnel rather than inventing an "open positions" figure.
      title: 'Active Candidates',
      value: s.activeCandidates ?? 0,
      subtitle: stats ? `${s.interviewsToday} interviews today` : null,
      icon: BriefcaseBusiness,
    },
  ]

  return (
    <section aria-label="HR statistics" className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(card => (
        <StatCard
          key={card.title}
          title={card.title}
          value={card.value}
          subtitle={card.subtitle}
          icon={card.icon}
          loading={loading}
        />
      ))}
    </section>
  )
}
