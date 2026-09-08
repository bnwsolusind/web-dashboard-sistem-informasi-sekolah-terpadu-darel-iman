import { api } from './api'

export const prayerAssessmentService = {
  // Ambil daftar 62 item doa
  getItems: async (params = {}) => {
    const res = await api.get('/prayer-assessment/items', { params })
    return res.data
  },

  // Tambah item doa baru (Kepsek, Divisi Pendidikan, TU)
  createItem: async (payload) => {
    const res = await api.post('/prayer-assessment/items', payload)
    return res.data
  },

  // Update item doa (nomor, nama, bobot poin)
  updateItem: async (id, payload) => {
    const res = await api.put(`/prayer-assessment/items/${id}`, payload)
    return res.data
  },

  // Ambil aturan grade
  getGradeRules: async () => {
    const res = await api.get('/prayer-assessment/grade-rules')
    return res.data
  },

  // Update aturan grade (Kepsek, Divisi Pendidikan, TU)
  updateGradeRules: async (rules) => {
    const res = await api.put('/prayer-assessment/grade-rules', { rules })
    return res.data
  },

  // Ambil lembar penilaian siswa (Format tabel fisik: No, Doa Doa Harian, Poin, Paraf)
  getStudentSheet: async (studentId) => {
    const res = await api.get(`/prayer-assessment/student/${studentId}`)
    return res.data
  },

  // Simpan nilai poin & paraf penguji
  saveStudentScores: async (studentId, scores) => {
    const res = await api.post(`/prayer-assessment/student/${studentId}/save`, { scores })
    return res.data
  },
}
