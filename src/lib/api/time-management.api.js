import apiClient from '@/lib/api-client'

export const timeManagementApi = {
  getAll: async (filters = {}) => {
    const { data } = await apiClient.get('/time-management', { params: filters })
    return data.data
  },

  create: async (payload) => {
    const { data } = await apiClient.post('/time-management', payload)
    return data.data
  },
  checkIn: async (payload) => {
    const { data } = await apiClient.post('/time-management/check-in', payload)
    return data.data
  },

  checkOut: async (payload) => {
    const { data } = await apiClient.post('/time-management/check-out', payload)
    return data.data
  },

  // ── Module 9, Phase 3 ──────────────────────────────────────────────────
  // { date, today, recent } — the caller's own end-of-day statuses.
  getMyWorkStatus: async () => {
    const { data } = await apiClient.get('/time-management/work-status')
    return data.data
  },

  // { summary, blockers?, tomorrowPlan?, date? } — upserts that day.
  submitWorkStatus: async (payload) => {
    const { data } = await apiClient.post('/time-management/work-status', payload)
    return data.data
  },

  // admin/manager/hr
  getTeamWorkStatus: async (date) => {
    const { data } = await apiClient.get('/time-management/work-status/team', { params: { date } })
    return data.data
  },

  // admin/manager/hr — the attendance register for a date range (max 31 days).
  getAttendance: async (from, to) => {
    const { data } = await apiClient.get('/time-management/attendance', { params: { from, to } })
    return data.data
  },
}
