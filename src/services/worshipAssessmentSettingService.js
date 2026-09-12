import api from './api'

export const worshipAssessmentSettingService = {
  list: async () => (await api.get('/worship-assessment-settings')).data,
  options: async () => (await api.get('/worship-assessment-settings/options')).data,
  createProgram: async (payload) => (await api.post('/worship-assessment-settings/programs', payload)).data,
  deleteProgram: async (id) => (await api.delete(`/worship-assessment-settings/programs/${id}`)).data,
  createPeriod: async (payload) => (await api.post('/worship-assessment-settings/periods', payload)).data,
  deletePeriod: async (id) => (await api.delete(`/worship-assessment-settings/periods/${id}`)).data,
  createRule: async (payload) => (await api.post('/worship-assessment-settings/rules', payload)).data,
  deleteRule: async (id) => (await api.delete(`/worship-assessment-settings/rules/${id}`)).data,
}

