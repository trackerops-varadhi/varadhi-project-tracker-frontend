import apiClient from '@/lib/api-client'

export const leaveManagementApi = {
  getAll: async (filters = {}) => {
    const { data } = await apiClient.get('/leave-management', { params: filters })
    return data.data
  },

  create: async (payload) => {
    const { data } = await apiClient.post('/leave-management', payload)
    return data.data
  },

  updateStatus: async (id, status) => {
    const { data } = await apiClient.patch(`/leave-management/${id}/status`, { status })
    return data.data
  },

  // ── Module 9, Phase 3 ──────────────────────────────────────────────────
  // The owner withdraws a still-pending request.
  cancel: async (id) => {
    const { data } = await apiClient.patch(`/leave-management/${id}/cancel`)
    return data.data
  },

  // Who is away between two dates — every role, no reason text.
  getCalendar: async (from, to) => {
    const { data } = await apiClient.get('/leave-management/calendar', { params: { from, to } })
    return data.data
  },

  // Own balance by default; { userId } or { scope: 'team' } for admin/manager/hr.
  getBalances: async (params = {}) => {
    const { data } = await apiClient.get('/leave-management/balances', { params })
    return data.data
  },

  // admin/hr: { userId, year, leaveType, entitled, carriedForward }
  setEntitlement: async (payload) => {
    const { data } = await apiClient.put('/leave-management/balances', payload)
    return data.data
  },
}
