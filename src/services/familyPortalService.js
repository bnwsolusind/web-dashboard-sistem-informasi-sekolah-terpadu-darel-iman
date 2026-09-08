import api from './api'

const childParams = (childId) => ({ params: childId ? { child_id: childId } : {} })

export const familyPortalService = {
  children: async () => {
    try {
      const response = await api.get('/portal/children')
      return response.data
    } catch {
      return { success: false, data: [] }
    }
  },
  updateChildPassword: async (childId, payload) => (await api.put(`/portal/children/${childId}/password`, payload)).data,
  updateChildPhoto: async (childId, formData) => (await api.post(`/portal/children/${childId}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })).data,
  dashboard: async (childId) => (await api.get('/portal/dashboard', childParams(childId))).data,
  list: async (resource, childId) => (await api.get(`/portal/${resource}`, childParams(childId))).data,
  submitPermission: async (payload) => (await api.post('/portal/permissions', payload)).data,

  // Parent Chat
  chatContacts: async (childId) => (await api.get('/portal/chat/contacts', childParams(childId))).data,
  chatMessages: async (teacherId, childId) => (await api.get(`/portal/chat/${teacherId}`, childParams(childId))).data,
  sendMessage: async (teacherId, childId, message, attachment = null) => {
    if (attachment) {
      const formData = new FormData()
      formData.append('child_id', childId)
      if (message) formData.append('message', message)
      formData.append('attachment', attachment)
      return (await api.post(`/portal/chat/${teacherId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })).data
    }
    return (await api.post(`/portal/chat/${teacherId}`, { child_id: childId, message })).data
  },

  // Teacher Chat
  teacherConversations: async () => (await api.get('/teacher/chat/conversations')).data,
  teacherMessages: async (parentUserId, studentId) => (await api.get(`/teacher/chat/parent/${parentUserId}/student/${studentId}`)).data,
  sendTeacherMessage: async (parentUserId, studentId, message, attachment = null) => {
    if (attachment) {
      const formData = new FormData()
      if (message) formData.append('message', message)
      formData.append('attachment', attachment)
      return (await api.post(`/teacher/chat/parent/${parentUserId}/student/${studentId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })).data
    }
    return (await api.post(`/teacher/chat/parent/${parentUserId}/student/${studentId}`, { message })).data
  },

  // Employee-to-Employee Chat
  employeeContacts: async (search = '', unitId = '', status = '', category = '') => {
    const params = {}
    if (search && String(search).trim()) params.search = String(search).trim()
    if (unitId && unitId !== 'all') params.unit_id = unitId
    if (status && status !== 'all') params.status = status
    if (category && category !== 'all') params.category = category

    try {
      const res = await api.get('/chat/employee/contacts', { params })
      const rawData = res.data?.data || res.data || []
      const list = Array.isArray(rawData) ? rawData : (Array.isArray(rawData.data) ? rawData.data : [])
      const normalizedList = list.map((emp) => ({
        ...emp,
        id: emp.id,
        user_id: emp.user_id || emp.id,
        name: emp.name || emp.nama_lengkap || emp.nama_panggilan || emp.nama || 'Pegawai',
        nama_lengkap: emp.nama_lengkap || emp.name || emp.nama,
        nip_niy: emp.nip_niy || emp.niy || emp.nik || '-',
        foto: emp.foto || emp.photo || emp.avatar,
        unit_id: emp.unit_id || emp.unit?.id,
        unit_name: emp.unit_name || emp.unit?.name || emp.unit?.code || 'Yayasan / Lintas Unit',
        position_name: emp.position_name || emp.position?.name || emp.jabatan || 'Staf Pegawai',
        role: emp.role || emp.position_name || emp.position?.name || 'Pegawai',
      }))
      return { success: true, data: normalizedList }
    } catch (err) {
      try {
        const fallbackRes = await api.get('/foundation/employees?per_page=100')
        const rawData = fallbackRes.data?.data || fallbackRes.data || []
        const list = Array.isArray(rawData) ? rawData : (Array.isArray(rawData.data) ? rawData.data : [])
        const normalizedList = list.map((emp) => ({
          ...emp,
          id: emp.id,
          user_id: emp.user_id || emp.id,
          name: emp.name || emp.nama_lengkap || emp.nama_panggilan || emp.nama || 'Pegawai',
          nama_lengkap: emp.nama_lengkap || emp.name || emp.nama,
          nip_niy: emp.nip_niy || emp.niy || emp.nik || '-',
          foto: emp.foto || emp.photo || emp.avatar,
          unit_id: emp.unit_id || emp.unit?.id,
          unit_name: emp.unit_name || emp.unit?.name || emp.unit?.code || 'Yayasan / Lintas Unit',
          position_name: emp.position_name || emp.position?.name || emp.jabatan || 'Staf Pegawai',
          role: emp.role || emp.position_name || emp.position?.name || 'Pegawai',
        }))
        return { success: true, data: normalizedList }
      } catch {
        return { success: false, data: [] }
      }
    }
  },
  employeeConversations: async () => {
    try {
      return (await api.get('/employee/chat/conversations')).data
    } catch {
      try {
        return (await api.get('/employee/conversations')).data
      } catch {
        return (await api.get('/chat/employee/conversations')).data
      }
    }
  },
  employeeMessages: async (recipientUserId) => {
    try {
      return (await api.get(`/employee/chat/messages/${recipientUserId}`)).data
    } catch {
      try {
        return (await api.get(`/employee/messages/${recipientUserId}`)).data
      } catch {
        return (await api.get(`/chat/employee/messages/${recipientUserId}`)).data
      }
    }
  },
  sendEmployeeMessage: async (recipientUserId, message, attachment = null) => {
    const payload = attachment ? (() => {
      const fd = new FormData()
      if (message) fd.append('message', message)
      fd.append('attachment', attachment)
      return fd
    })() : { message }
    const config = attachment ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}

    try {
      return (await api.post(`/employee/chat/messages/${recipientUserId}`, payload, config)).data
    } catch {
      try {
        return (await api.post(`/employee/messages/${recipientUserId}`, payload, config)).data
      } catch {
        return (await api.post(`/chat/employee/messages/${recipientUserId}`, payload, config)).data
      }
    }
  },

  createGroupConversation: async (name, participantIds) => (await api.post('/chat/conversations/group', { name, participant_ids: participantIds })).data,
  addReaction: async (messageId, reaction) => (await api.post(`/chat/messages/${messageId}/reactions`, { reaction })).data,
  removeReaction: async (messageId, reaction) => (await api.delete(`/chat/messages/${messageId}/reactions/${reaction}`)).data,
  updatePresence: async (status) => (await api.post('/chat/presence', { status })).data,
  getChatCapabilities: async () => (await api.get('/chat/capabilities')).data,

  downloadReport: async (reportId, childId) => (await api.get(`/portal/reports/${reportId}/download`, { ...childParams(childId), responseType: 'blob' })).data,
}
