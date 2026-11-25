import { api } from './api'

export const authService = {
  login: async ({ identifier, email, password, portal_type, device_name = 'web-dashboard' }) => {
    const resolvedIdentifier = identifier ?? email
    const { data } = await api.post('/auth/login', { identifier: resolvedIdentifier, email: resolvedIdentifier, password, portal_type, device_name })
    return data
  },

  loginAdmin: async ({ username, password, device_name = 'web-dashboard' }) => {
    const { data } = await api.post('/v2/auth/login/admin', { username, password, device_name })
    return data
  },

  loginEmployee: async ({ identifier, password, device_name = 'web-dashboard' }) => {
    const { data } = await api.post('/v2/auth/login/employee', { identifier, password, device_name })
    return data
  },

  loginEmployeeQr: async ({ qr_token, device_name = 'web-dashboard' }) => {
    const { data } = await api.post('/v2/auth/login/employee-qr', { qr_token, device_name })
    return data
  },

  loginParentStudent: async ({ portal_type, identifier, password, device_name = 'web-dashboard' }) => {
    const { data } = await api.post('/v2/auth/login/parent-student', { portal_type, identifier, password, device_name })
    return data
  },

  profile: async () => {
    const { data } = await api.get('/profile')
    return data
  },

  updateProfile: async (payload) => {
    const { data } = await api.put('/profile', payload)
    return data
  },

  uploadAvatar: async (formData) => {
    const { data } = await api.post('/profile/avatar', formData)
    return data
  },

  changePassword: async (payload) => {
    const { data } = await api.put('/profile/password', payload)
    return data
  },

  impersonate: async (role, customToken = null) => {
    const config = customToken
      ? { headers: { Authorization: `Bearer ${customToken}` } }
      : {}
    const { data } = await api.post('/auth/impersonate', { role, device_name: 'web-dashboard-impersonation' }, config)
    return data
  },

  logout: async () => {
    const { data } = await api.post('/auth/logout')
    return data
  },
}
