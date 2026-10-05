// People (HR, Module 9) API client.
//
// Same shape as every other file in this directory: one object per resource,
// each method unwrapping `data.data` from the backend's standard envelope. Not
// exported through lib/api/index.js — imported directly by its consumers
// (`@/lib/api/people.api`), like bugs/reports/notifications.
//
// Every endpoint is admin/manager only on the backend.

import apiClient from '@/lib/api-client'

export const peopleApi = {
  getDashboard: async () => {
    const { data } = await apiClient.get('/people/dashboard')
    return data.data
  },

  // --- Employee directory ------------------------------------------------------
  getEmployees: async () => {
    const { data } = await apiClient.get('/people/employees')
    return data.data
  },

  // Active tracker accounts without an HR profile — the "Select user" dropdown.
  getEligibleUsers: async () => {
    const { data } = await apiClient.get('/people/employees/eligible-users')
    return data.data
  },

  createEmployee: async (payload) => {
    const { data } = await apiClient.post('/people/employees', payload)
    return data.data
  },

  // --- Attrition ---------------------------------------------------------------
  getExits: async () => {
    const { data } = await apiClient.get('/people/exits')
    return data.data
  },

  createExit: async (payload) => {
    const { data } = await apiClient.post('/people/exits', payload)
    return data.data
  },

  // --- Interviews --------------------------------------------------------------
  getInterviews: async () => {
    const { data } = await apiClient.get('/people/interviews')
    return data.data
  },

  createInterview: async (payload) => {
    const { data } = await apiClient.post('/people/interviews', payload)
    return data.data
  },
}
