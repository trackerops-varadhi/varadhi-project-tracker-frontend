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
      color: 'text-violet-600',
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
    <section aria-label="HR statistics" className="grid w-full min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 lg:gap-3">
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <div key={card.title} className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-semibold text-slate-700">{card.title}</h2>
              <Icon aria-hidden="true" className={`h-4 w-4 shrink-0 ${card.color}`} />
            </div>
            <p className="mt-2 break-words text-2xl font-bold leading-tight tabular-nums text-slate-900">
              {card.value}
            </p>
            <p className={`mt-1 text-xs leading-relaxed ${card.color}`}>{card.subtitle}</p>
          </div>
        )
      })}
    </section>
  )
}
