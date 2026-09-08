import api from './api'

export const worshipAssessmentSettingService = {
  list: async () => (await api.get('/worship-assessment-settings')).data,
  options: async () => (await api.get('/worship-assessment-settings/options')).data,
  createProgram: async (payload) => (await api.post('/worship-assessment-settings/programs', payload)).data,
  createPeriod: async (payload) => (await api.post('/worship-assessment-settings/periods', payload)).data,
  createRule: async (payload) => (await api.post('/worship-assessment-settings/rules', payload)).data,
}

