import api from './api'

export const assessmentFormulaService = {
  list: async (params = {}) => (await api.get('/assessment-formulas', { params })).data,
  options: async () => (await api.get('/assessment-formulas/options')).data,
  create: async (payload) => (await api.post('/assessment-formulas', payload)).data,
  update: async (id, payload) => (await api.put(`/assessment-formulas/${id}`, payload)).data,
  transition: async (id, action) => (await api.post(`/assessment-formulas/${id}/${action}`)).data,
}
