'use client'

import { StatCard } from '@/components/shared/stat-card'

import { useState, useEffect } from 'react'

import { dashboardApi } from '@/lib/api/dashboard.api'

import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  AlertCircle
} from 'lucide-react'

function SummaryCard({ label, value, sub, loading, icon }) {
  return <StatCard title={label} value={value} subtitle={sub} loading={loading} icon={icon} />
}

export function SummaryCards() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const data = await dashboardApi.getStats()
        if (active) setStats(data ?? null)
      } catch (err) {
        console.error('REPORTS STATS ERROR =>', err)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  const s = stats || {}
  const total = s.totalTasks ?? 0
  const completed = s.completedTasks ?? 0
  const members = s.teamMembers ?? 0

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
  const avgPerMember = members > 0 ? (total / members).toFixed(1) : '0'

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <SummaryCard
        label="Tasks Completed"
        value={completed}
        sub={`of ${total} total`}
        icon={CheckCircle2}
        loading={loading}
      />
      <SummaryCard
        label="Completion Rate"
        value={`${completionRate}%`}
        sub="Across all tasks"
        icon={ClipboardList}
        loading={loading}
      />
      <SummaryCard
        label="Avg per Member"
        value={avgPerMember}
        sub="Tasks per active member"
        icon={Clock3}
        loading={loading}
      />
      <SummaryCard
        label="Overdue Tasks"
        value={s.overdueTasks ?? 0}
        sub="Need attention"
        icon={AlertCircle}
        loading={loading}
      />
    </div>
  )
}