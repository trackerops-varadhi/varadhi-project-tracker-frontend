'use client'

import { StatCard as StatCard } from '@/components/shared/stat-card'

import { Table } from '@/components/ui/table'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import {

  Clock3,

  LogIn,

  LogOut,

  CalendarDays,

  Timer,

} from 'lucide-react'

import { timeManagementApi } from '@/lib/api/time-management.api'
import { useAuthStore } from '@/store/auth.store'
import { businessToday } from '@/lib/business-date'
import { WorkStatusPanel } from '@/components/time/work-status-panel'
import { TeamWorkStatus } from '@/components/time/team-work-status'
import { AttendanceRegister } from '@/components/time/attendance-register'

// Module 9, Phase 3 tabs. Team views are admin/manager/hr — the backend
// enforces the same list.
const TABS = [
  { key: 'time', label: 'My Time', roles: null },
  { key: 'work-status', label: 'Work Status', roles: null },
  { key: 'team-status', label: 'Team Status', roles: ['admin', 'manager', 'hr'] },
  { key: 'attendance', label: 'Attendance', roles: ['admin', 'manager', 'hr'] },
]

// useSearchParams needs a Suspense boundary or the production build fails.
export default function TimeManagementPage() {
  return (
    <Suspense fallback={null}>
      <TimeManagementContent />
    </Suspense>
  )
}

function TimeManagementContent() {

  const router = useRouter()
  const searchParams = useSearchParams()
  const role = useAuthStore((st) => st.user?.role)
  const visibleTabs = TABS.filter((t) => !t.roles || t.roles.includes(role))
  const requestedTab = searchParams.get('tab')
  const tab = visibleTabs.some((t) => t.key === requestedTab) ? requestedTab : 'time'
  const selectTab = (key) => router.replace(key === 'time' ? '/time-management' : `/time-management?tab=${key}`)

  // Office vs work-from-home for today's check-in (Module 9 attendance status).
  const [workMode, setWorkMode] = useState('present')

  const [loading, setLoading] = useState(true)

  const [logs, setLogs] = useState([])

  const [checkIn, setCheckIn] = useState(null)

  const [checkOut, setCheckOut] = useState(null)

  const [currentTime, setCurrentTime] = useState(new Date())

  const [error, setError] = useState("");



  // ============================================

  // LOAD DATA

  // ============================================

  useEffect(() => {

    loadData()

  }, [])



  async function loadData() {

    try {

      setLoading(true)

      const data =

        await timeManagementApi.getAll()

      const records = data || []

      setLogs(records)

      // Find today's record

      const today =

        new Date()

          .toISOString()

          .split('T')[0]

      const todayRecord =

        records.find(

          item =>

            new Date(item.date)

              .toISOString()

              .split('T')[0] === today

        )

      if (todayRecord) {

        if (todayRecord.checkIn) {

          setCheckIn(

            new Date(todayRecord.checkIn)

          )

        }

        if (todayRecord.checkOut) {

          setCheckOut(

            new Date(todayRecord.checkOut)

          )

        }

      }

    } catch (error) {

      console.error(

        'Failed to load time data:',

        error

      )

    } finally {

      setLoading(false)

    }

  }



  // ============================================

  // LIVE CLOCK

  // ============================================

  useEffect(() => {

    const interval =

      setInterval(() => {

        setCurrentTime(

          new Date()

        )

      }, 1000)

    return () =>

      clearInterval(interval)

  }, [])



  // ============================================

  // CHECK IN

  // ============================================

  const handleCheckIn = async () => {

  const previousCheckIn = checkIn;

  const now = new Date();

  setCheckIn(now);

  setError("");

  try {

    const date = businessToday()
    await timeManagementApi.checkIn({
      date,
      checkIn: now.toISOString(),
      attendanceStatus: workMode,
    })
    await loadData()

  } catch (error) {

    console.error(error);

    // Roll back UI state

    setCheckIn(previousCheckIn);

    // Show error to user

    setError("Check-in failed. Your attendance was not recorded. Please try again.");

  }

};



  // ============================================

  // CHECK OUT

  // ============================================

 const handleCheckOut = async () => {

  const previousCheckOut = checkOut;

  const now = new Date();

  setCheckOut(now);

  setError("");

  try {

    const date = businessToday()
    await timeManagementApi.checkOut({
      date,
      checkOut: now.toISOString()
    })
    await loadData()

  } catch (error) {

    console.error(error);

    // Roll back UI state

    setCheckOut(previousCheckOut);

    // Show error to user

    setError("Check-out failed. Your attendance was not recorded. Please try again.");

  }

};



  // ============================================

  // CALCULATE TODAY HOURS

  // ============================================

  function getTodayHours() {

    if (!checkIn) {

      return 0

    }

    const start =

      new Date(checkIn)

    const end =

      checkOut

        ? new Date(checkOut)

        : currentTime

    const difference =

      end - start

    return difference /

      (1000 * 60 * 60)

  }



  // ============================================

  // TOTAL HOURS FROM DATABASE

  // ============================================

  function getTotalHours() {

    return logs.reduce(

      (total, item) => {

        return total +

          Number(item.hours || 0)

      },

      0

    )

  }



  // ============================================

  // WEEKLY HOURS

  // ============================================

  function getWeeklyHours() {

    const today =

      new Date()

    const startOfWeek =

      new Date(today)

    startOfWeek.setDate(

      today.getDate() -

      today.getDay()

    )

    startOfWeek.setHours(

      0,

      0,

      0,

      0

    )



    return logs.reduce(

      (total, item) => {

        const date =

          new Date(item.date)

        if (date >= startOfWeek) {

          return total +

            Number(item.hours || 0)

        }

        return total

      },

      0

    )

  }



  // ============================================

  // MONTHLY HOURS

  // ============================================

  function getMonthlyHours() {

    const today =

      new Date()

    return logs.reduce(

      (total, item) => {

        const date =

          new Date(item.date)

        if (

          date.getMonth() ===

            today.getMonth() &&

          date.getFullYear() ===

            today.getFullYear()

        ) {

          return total +

            Number(item.hours || 0)

        }

        return total

      },

      0

    )

  }



  // ============================================

  // FORMAT HOURS

  // ============================================

  function formatHours(hours) {

    const h =

      Math.floor(hours)

    const m =

      Math.round(

        (hours - h) * 60

      )

    return (

      `${String(h).padStart(2, '0')}:` +

      `${String(m).padStart(2, '0')}`

    )

  }



  // ============================================

  // FORMAT TIME

  // ============================================

  function formatTime(time) {

    if (!time) {

      return '--:--'

    }

    return new Date(time)

      .toLocaleTimeString(

        'en-IN',

        {

          hour: '2-digit',

          minute: '2-digit',

          hour12: true,

        }

      )

  }



  // ============================================

  // DATE

  // ============================================

  const today =

    new Date()

      .toLocaleDateString(

        'en-IN',

        {

          day: '2-digit',

          month: 'short',

          year: '2-digit',

        }

      )



  return (

    <div className="space-y-6">

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}



      {/* ==========================================

          HEADER

      =========================================== */}

      <div>

<h1 className="text-2xl font-bold text-primary">
          Time Management
        </h1>

        <p className="mt-1 text-sm text-slate-500">

          Track your daily login, logout and working hours.

        </p>

      </div>

      <div role="tablist" aria-label="Time management sections" className="flex flex-wrap gap-2">
        {visibleTabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={tab === t.key}
            onClick={() => selectTab(t.key)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              tab === t.key ? 'border-primary bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'work-status' && <WorkStatusPanel />}
      {tab === 'team-status' && <TeamWorkStatus />}
      {tab === 'attendance' && <AttendanceRegister />}

      {tab === 'time' && (<>



      {/* ==========================================

          TOTAL HOURS CARDS

      =========================================== */}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard title="Total Worked Today" value={formatHours(getTodayHours())} subtitle="Hours : Minutes" icon={Clock3} />
        <StatCard title="Total Weekly Time" value={formatHours(getWeeklyHours())} subtitle="Monday - Sunday" icon={CalendarDays} />
        <StatCard title="Total Monthly Time" value={formatHours(getMonthlyHours())} subtitle="Current Month" icon={Timer} />
      </div>

      {/* ==========================================

          DAILY CHECK IN / CHECK OUT

      =========================================== */}

      <div className="rounded-xl border bg-white shadow-sm">



        <div className="border-b p-5">

          <h2 className="text-xl font-semibold text-primary">

            Do Your Daily Check-In / Check-Out

          </h2>

        </div>



        <div className="p-5">



          <div className="grid items-center gap-5 md:grid-cols-5">



            {/* DATE */}

            <div>

              <div className="flex items-center gap-2">

                <CalendarDays

                  size={22}

                  className="text-blue-600"

                />

                <span className="font-bold">

                  {today}

                </span>

              </div>

              <p className="mt-1 text-sm text-slate-500">

                SHIFT START DATE

              </p>

            </div>



            {/* LOGIN */}

            <div className="text-center">

              <div className="mb-2 flex justify-center gap-1 text-xs" role="radiogroup" aria-label="Working from">
                {[['present', 'Office'], ['wfh', 'WFH']].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={workMode === value}
                    disabled={!!checkIn}
                    onClick={() => setWorkMode(value)}
                    className={`rounded-full border px-3 py-1 ${workMode === value ? 'border-primary bg-primary/10 text-primary' : 'text-slate-500'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <button

                onClick={

                  handleCheckIn

                }

                disabled={

                  !!checkIn

                }

                className="flex w-full items-center

                           justify-center gap-2

                           rounded-full border

                           px-5 py-3

                           font-medium

                           hover:bg-primary

                           hover:text-white

                           disabled:bg-slate-100

                           disabled:text-slate-400"

              >

                <LogIn size={18} />

                CHECK IN

              </button>

              <p className="mt-2 text-sm text-slate-500">

                Login Time

              </p>

              <p className="font-bold text-slate-800">

                {formatTime(checkIn)}

              </p>

            </div>



            {/* LOGOUT */}

            <div className="text-center">

              <button

                onClick={

                  handleCheckOut

                }

                disabled={

                  !checkIn ||

                  !!checkOut

                }

                className="flex w-full items-center

                           justify-center gap-2

                           rounded-full border

                           px-5 py-3

                           font-medium

                           hover:bg-primary

                           hover:text-white

                           disabled:bg-slate-100

                           disabled:text-slate-400"

              >

                <LogOut size={18} />

                CHECK OUT

              </button>

              <p className="mt-2 text-sm text-slate-500">

                Logout Time

              </p>

              <p className="font-bold text-slate-800">

                {formatTime(checkOut)}

              </p>

            </div>



            {/* WORK HOURS */}

            <div className="text-center">

              <p className="text-3xl font-bold text-slate-800">

                {formatHours(

                  getTodayHours()

                )}

              </p>

              <p className="text-sm text-slate-500">

                TOTAL WORK HOURS

              </p>

            </div>



            {/* STATUS */}

            <div className="text-center">

              {!checkIn && (

                <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">

                  Not Checked In

                </span>

              )}

              {checkIn && !checkOut && (

                <span className="rounded-full bg-green-100 px-4 py-2 text-sm text-green-700">

                  Working

                </span>

              )}

              {checkIn && checkOut && (

                <span className="rounded-full bg-blue-100 px-4 py-2 text-sm text-blue-700">

                  Completed

                </span>

              )}

            </div>

          </div>

        </div>

      </div>



      {/* ==========================================

          HISTORY

      =========================================== */}

      <div className="rounded-xl border bg-white shadow-sm">



        <div className="border-b p-5">

          <h2 className="text-xl font-semibold text-primary">

            View Past Submissions

          </h2>

        </div>



        {loading ? (

          <div className="p-6 text-center text-slate-500">

            Loading...

          </div>

        ) : logs.length === 0 ? (

          <div className="p-6 text-center text-slate-500">

            No records found.

          </div>

        ) : (

          <div className="overflow-x-auto">

            <Table scrollable={false} className="w-full">

              <thead className="bg-slate-100">

                <tr>

                  <th className="px-5 py-4 text-left">

                    Shift Date

                  </th>

                  <th className="px-5 py-4 text-left">

                    First Check In

                  </th>

                  <th className="px-5 py-4 text-left">

                    Last Check Out

                  </th>

                  <th className="px-5 py-4 text-left">

                    Total Work Hours

                  </th>

                </tr>

              </thead>



              <tbody>

                {logs.map(log => (

                  <tr

                    key={log.id}

                    className="border-t hover:bg-slate-50"

                  >

                    <td className="px-5 py-4">

                      {new Date(

                        log.date

                      ).toLocaleDateString(

                        'en-IN'

                      )}

                    </td>



                    <td className="px-5 py-4 font-medium">

                      {formatTime(

                        log.checkIn

                      )}

                    </td>



                    <td className="px-5 py-4 font-medium">

                      {formatTime(

                        log.checkOut

                      )}

                    </td>



                    <td className="px-5 py-4">

                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">

                        {formatHours(

                          Number(

                            log.hours || 0

                          )

                        )}

                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </Table>

          </div>

        )}

      </div>

      </>)}

    </div>

  )

}
