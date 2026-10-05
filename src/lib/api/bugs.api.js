// Bugs Finder API client (Module 8).
//
// Same shape as every other file in this directory: one object per resource,
// each method unwrapping `data.data` from the backend's standard envelope. Not
// exported through lib/api/index.js — like reports/notifications/folders, this
// is imported directly by its consumers (`@/lib/api/bugs.api`).

import apiClient from '@/lib/api-client'

export const bugsApi = {
  // --- List -------------------------------------------------------------------
  // Every filter is applied server-side; the response is one page, never the
  // whole table. Returns { data, total, page, limit, totalPages }.
  getAll: async (filters = {}, page = 1, limit = 20) => {
    // Drop empty values so the query string carries only real filters — an
    // `?status=` with no value would otherwise reach the backend as a filter.
    const params = { page, limit }
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        params[key] = value
      }
    }
    const { data } = await apiClient.get('/bugs', { params })
    return data.data
  },

  getById: async (id) => {
    const { data } = await apiClient.get(`/bugs/${id}`)
    return data.data
  },

  // Bugs for one project — powers the project detail page's Bugs tab.
  getByProject: async (projectId, filters = {}, page = 1, limit = 20) => {
    const { data } = await apiClient.get(`/projects/${projectId}/bugs`, {
      params: { ...filters, page, limit },
    })
    return data.data
  },

  // --- Reports ----------------------------------------------------------------
  getReports: async (filters = {}) => {
    const { data } = await apiClient.get('/bugs/reports', { params: filters })
    return data.data
  },

  getActivity: async (id, limit = 100) => {
    const { data } = await apiClient.get(`/bugs/${id}/activity`, { params: { limit } })
    return data.data
  },

  // Enum vocabularies, so a dropdown can be built from the server's own
  // definitions rather than a hardcoded list that could drift.
  getOptions: async () => {
    const { data } = await apiClient.get('/bugs/options')
    return data.data
  },

  // --- Mutations --------------------------------------------------------------
  create: async (payload) => {
    const { data } = await apiClient.post('/bugs', payload)
    return data.data
  },

  update: async (id, payload) => {
    const { data } = await apiClient.put(`/bugs/${id}`, payload)
    return data.data
  },

  delete: async (id) => {
    const { data } = await apiClient.delete(`/bugs/${id}`)
    return data.data
  },

  // `extra` carries resolution / rootCause / duplicateOfId where the target
  // status needs them.
  updateStatus: async (id, status, extra = {}) => {
    const { data } = await apiClient.patch(`/bugs/${id}/status`, { status, ...extra })
    return data.data
  },

  // Pass null to unassign.
  assign: async (id, assigneeId) => {
    const { data } = await apiClient.patch(`/bugs/${id}/assign`, { assigneeId })
    return data.data
  },

  // Creates a development task from the bug and links the two.
  createTask: async (id, payload = {}) => {
    const { data } = await apiClient.post(`/bugs/${id}/task`, payload)
    return data.data
  },

  // --- Comments ---------------------------------------------------------------
  getComments: async (id) => {
    const { data } = await apiClient.get(`/bugs/${id}/comments`)
    return data.data
  },

  addComment: async (id, content) => {
    const { data } = await apiClient.post(`/bugs/${id}/comments`, { content })
    return data.data
  },

  updateComment: async (id, commentId, content) => {
    const { data } = await apiClient.put(`/bugs/${id}/comments/${commentId}`, { content })
    return data.data
  },

  deleteComment: async (id, commentId) => {
    const { data } = await apiClient.delete(`/bugs/${id}/comments/${commentId}`)
    return data.data
  },

  // --- Attachments ------------------------------------------------------------
  // Reuses the same multipart upload path and 10MB/type policy as Documents.
  uploadAttachment: async (id, formData, onUploadProgress) => {
    const { data } = await apiClient.post(`/bugs/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      // Uploads routinely outrun the client's 10s default — a 10MB file on a
      // slow connection would otherwise abort mid-transfer.
      timeout: 60000,
      onUploadProgress,
    })
    return data.data
  },

  deleteAttachment: async (id, attachmentId) => {
    const { data } = await apiClient.delete(`/bugs/${id}/attachments/${attachmentId}`)
    return data.data
  },

  // --- SLA rules --------------------------------------------------------------
  getSlaRules: async () => {
    const { data } = await apiClient.get('/bugs/sla-rules')
    return data.data
  },

  updateSlaRule: async (severity, payload) => {
    const { data } = await apiClient.put(`/bugs/sla-rules/${severity}`, payload)
    return data.data
  },
}
