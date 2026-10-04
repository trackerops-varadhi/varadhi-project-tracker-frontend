"use client";
import { StatCard } from '@/components/shared/stat-card'
import { Users, UserCheck, CalendarDays, BriefcaseBusiness } from 'lucide-react'

const MOCK_STATS = {
  totalEmployees: 128,
  newEmployeesThisMonth: 8,
  presentToday: 112,
  attendancePercent: 87.5,
  onLeave: 9,
  plannedLeave: 3,
  unplannedLeave: 6,
  openPositions: 14,
  interviewsToday: 5,
}

// Later, pass backend data with the same fields: <HRStats stats={data} />.
export function HRStats({ stats = MOCK_STATS }) {
  const cards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      subtitle: `+${stats.newEmployeesThisMonth} this month`,
      icon: Users,
      color: 'text-primary',
    },
    {
      title: 'Present Today',
      value: stats.presentToday,
      subtitle: `${stats.attendancePercent}% attendance`,
      icon: UserCheck,
      color: 'text-green-600',
    },
    {
      title: 'On Leave',
      value: stats.onLeave,
      subtitle: `${stats.plannedLeave} planned · ${stats.unplannedLeave} unplanned`,
      icon: CalendarDays,
      color: 'text-amber-600',
    },
    {
      title: 'Open Positions',
      value: stats.openPositions,
      subtitle: `${stats.interviewsToday} interviews today`,
      icon: BriefcaseBusiness,
      color: 'text-sky-600',
    },
  ]

  return (
    <section aria-label="HR statistics" className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(card => <StatCard key={card.title} title={card.title} value={card.value} subtitle={card.subtitle} icon={card.icon} />)}
    </section>
  )
}
