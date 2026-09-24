import { CalendarCheck } from 'lucide-react'

const MOCK_DAYS = [
  { day: 'Mon', present: 116 },
  { day: 'Tue', present: 120 },
  { day: 'Wed', present: 114 },
  { day: 'Thu', present: 118 },
  { day: 'Fri', present: 112 },
]

export function AttendanceSnapshot({ days = MOCK_DAYS, totalEmployees = 128 }) {
  const average = days.length
    ? Math.round(days.reduce((total, day) => total + day.present, 0) / days.length)
    : 0
  const attendanceRate = days.length && totalEmployees > 0
    ? Math.round(days.reduce((total, day) => total + day.present, 0) / (days.length * totalEmployees) * 100)
    : null

  return (
    <section
      aria-labelledby="attendance-snapshot-title"
      className="flex h-full min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
        <div>
          <h2 id="attendance-snapshot-title" className="text-xs font-semibold text-slate-900">
            Attendance Snapshot
          </h2>
          <p className="mt-0.5 text-[11px] leading-4 text-slate-500">Daily presence / sample workweek</p>
        </div>
        <span className="rounded-lg bg-violet-50 p-1.5 text-violet-600">
          <CalendarCheck aria-hidden="true" className="h-4 w-4" />
        </span>
      </div>

      {days.length ? (
        <>
          <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5">
            <div>
              <p className="text-xl font-bold leading-none tabular-nums text-slate-900">
                {average} <span className="text-[11px] font-normal text-slate-500">/ {totalEmployees}</span>
              </p>
              <p className="mt-1 text-[11px] text-slate-500">Average present</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold tabular-nums text-violet-700">{attendanceRate === null ? 'N/A' : `${attendanceRate}%`}</p>
              <p className="mt-1 text-[11px] text-slate-500">Attendance</p>
            </div>
          </div>
          <ul aria-label="Employees present by day" className="mt-2 flex items-end gap-2 border-b border-slate-100 pb-1">
            {days.map((day) => {
              const percentage = totalEmployees > 0
                ? Math.min(100, Math.max(0, day.present / totalEmployees * 100))
                : 0

              return (
                <li key={day.day} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                  <span className="text-[11px] font-semibold tabular-nums text-slate-700">{day.present}</span>
                  <div aria-hidden="true" className="flex h-12 w-full max-w-7 items-end overflow-hidden rounded-md bg-violet-50">
                    <div className="w-full rounded-t-md bg-violet-500" style={{ height: `${percentage}%` }} />
                  </div>
                  <span className="text-[11px] text-slate-500">{day.day}</span>
                </li>
              )
            })}
          </ul>
        </>
      ) : (
        <p className="py-4 text-center text-xs text-slate-500">No attendance data to display.</p>
      )}
    </section>
  )
}
