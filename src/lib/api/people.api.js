// People (Module 9) API client — employees, team directory, attrition and
// recruitment.
//
// Same shape as every other file in this directory: one object per resource,
// each method unwrapping `data.data` from the backend's standard envelope.
// Imported directly (`@/lib/api/people.api`) — there is no barrel.
//
// Auth is httpOnly cookies handled by api-client; no Authorization header.

import apiClient from '@/lib/api-client'

// Drop empty filter values (and the 'all' sentinel) so only real filters
// reach the query string.
const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== 'all')
  )

export const peopleApi = {
  getDashboard: async () => {
    const { data } = await apiClient.get('/people/dashboard')
    return data.data
  },

  // ── Employee directory (admin/manager/hr; PII-free list) ───────────────
  // { search, status, product, managerId, sort, order, page, limit }
  // → { items, total, page, limit }
  getEmployees: async (params = {}) => {
    const { data } = await apiClient.get('/people/employees', { params: cleanParams(params) })
    return data.data
  },

  getProducts: async () => {
    const { data } = await apiClient.get('/people/products')
    return data.data
  },

  // Active tracker accounts without an HR profile — the "Select user" dropdown.
  getEligibleUsers: async () => {
    const { data } = await apiClient.get('/people/employees/eligible-users')
    return data.data
  },

  // Full record: admin/hr, or the person themselves. Aadhaar is masked.
  getEmployee: async (userId) => {
    const { data } = await apiClient.get(`/people/employees/${userId}`)
    return data.data
  },

  createEmployee: async (payload) => {
    const { data } = await apiClient.post('/people/employees', payload)
    return data.data
  },

  updateEmployee: async (userId, payload) => {
    const { data } = await apiClient.put(`/people/employees/${userId}`, payload)
    return data.data
  },

  // admin/hr only; every reveal is logged server-side.
  revealAadhaar: async (userId) => {
    const { data } = await apiClient.get(`/people/employees/${userId}/aadhaar`)
    return data.data
  },

  // ── Every role ─────────────────────────────────────────────────────────
  getTeam: async () => {
    const { data } = await apiClient.get('/people/team')
    return data.data
  },

  getMe: async () => {
    const { data } = await apiClient.get('/people/me')
    return data.data
  },

  // Only temporaryAddress / permanentAddress are accepted.
  updateMyAddresses: async (payload) => {
    const { data } = await apiClient.patch('/people/me', payload)
    return data.data
  },

  // ── Attrition ──────────────────────────────────────────────────────────
  getExits: async () => {
    const { data } = await apiClient.get('/people/exits')
    return data.data
  },

  createExit: async (payload) => {
    const { data } = await apiClient.post('/people/exits', payload)
    return data.data
  },

  updateExit: async (id, payload) => {
    const { data } = await apiClient.patch(`/people/exits/${id}`, payload)
    return data.data
  },

  // admin/manager/hr — { from, to }
  getAttritionAnalytics: async (params = {}) => {
    const { data } = await apiClient.get('/people/exits/analytics', { params: cleanParams(params) })
    return data.data
  },

  // ── Candidates (admin/hr) ──────────────────────────────────────────────
  getCandidates: async (params = {}) => {
    const { data } = await apiClient.get('/people/candidates', { params: cleanParams(params) })
    return data.data
  },

  getCandidate: async (id) => {
    const { data } = await apiClient.get(`/people/candidates/${id}`)
    return data.data
  },

  createCandidate: async (payload) => {
    const { data } = await apiClient.post('/people/candidates', payload)
    return data.data
  },

  updateCandidate: async (id, payload) => {
    const { data } = await apiClient.put(`/people/candidates/${id}`, payload)
    return data.data
  },

  setCandidateStatus: async (id, status) => {
    const { data } = await apiClient.patch(`/people/candidates/${id}/status`, { status })
    return data.data
  },

  deleteCandidate: async (id) => {
    await apiClient.delete(`/people/candidates/${id}`)
  },

  // Invites an account and creates the HR profile. → { candidate, employee }
  convertCandidate: async (id, payload) => {
    const { data } = await apiClient.post(`/people/candidates/${id}/convert`, payload)
    return data.data
  },

  uploadResume: async (candidateId, file, onUploadProgress) => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await apiClient.post(`/people/candidates/${candidateId}/resumes`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    })
    return data.data
  },

  // → { url, expiresInSeconds, fileName } — a signed URL valid for a minute.
  getResumeLink: async (candidateId, resumeId) => {
    const { data } = await apiClient.get(`/people/candidates/${candidateId}/resumes/${resumeId}`)
    return data.data
  },

  deleteResume: async (candidateId, resumeId) => {
    await apiClient.delete(`/people/candidates/${candidateId}/resumes/${resumeId}`)
  },

  getAllResumes: async () => {
    const { data } = await apiClient.get('/people/candidates/resumes')
    return data.data
  },

  // ── Interviews ─────────────────────────────────────────────────────────
  getInterviews: async (params = {}) => {
    const { data } = await apiClient.get('/people/interviews', { params: cleanParams(params) })
    return data.data
  },

  // Any role — the rounds assigned to me as interviewer.
  getMyInterviews: async () => {
    const { data } = await apiClient.get('/people/interviews/mine')
    return data.data
  },

  // { candidateId, interviewDate, startTime?, interviewType?, interviewerId? }
  // schedules a round; { candidateName, roleApplied, interviewDate, outcome, … }
  // is the quick record (creates the candidate too).
  createInterview: async (payload) => {
    const { data } = await apiClient.post('/people/interviews', payload)
    return data.data
  },

  // admin/hr or the assigned interviewer.
  recordInterviewOutcome: async (id, payload) => {
    const { data } = await apiClient.patch(`/people/interviews/${id}/outcome`, payload)
    return data.data
  },

  getExpectationsReport: async () => {
    const { data } = await apiClient.get('/people/interviews/expectations')
    return data.data
  },
}
