import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileText, BookOpen, Target, Award, Plus, Search, Edit3, Trash2,
  Copy, CheckCircle2, XCircle, Clock, Sparkles, RefreshCw, X,
  AlertTriangle, ChevronRight, ShieldAlert,
} from 'lucide-react'
import { lmsKisiKisiService } from '../services/lmsKisiKisiService'
import { subjectService } from '../services/subjectService'
import { useAuthStore } from '../stores/authStore'
import { useUnitStore } from '../stores/unitStore'
import ActionDropdown from '../components/app/ActionDropdown'
import PageContainer from '../components/app/PageContainer'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import { MasterDataTable, SquircleActionButton, PrintOptionModal } from '../components/master-data'
import CsvImportModal from '../components/master-data/CsvImportModal'
import { RotateCcw, Printer } from 'lucide-react'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.02 } } }
const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } } }

function KpiTintedCard({ icon: Icon, label, subtext, value, tone = 'emerald', onClick }) {
  const tones = {
    emerald: { card: 'border-emerald-100 bg-emerald-50/50 hover:border-emerald-200 dark:border-emerald-950/50 dark:bg-emerald-950/20', title: 'text-emerald-700 dark:text-emerald-400', icon: 'text-emerald-500', val: 'text-emerald-600 dark:text-emerald-300', sub: 'text-emerald-600/70 dark:text-emerald-400/70' },
    blue: { card: 'border-blue-100 bg-blue-50/50 hover:border-blue-200 dark:border-blue-950/50 dark:bg-blue-950/20', title: 'text-blue-700 dark:text-blue-400', icon: 'text-blue-500', val: 'text-blue-600 dark:text-blue-300', sub: 'text-blue-600/70 dark:text-blue-400/70' },
    purple: { card: 'border-purple-100 bg-purple-50/50 hover:border-purple-200 dark:border-purple-950/50 dark:bg-purple-950/20', title: 'text-purple-700 dark:text-purple-400', icon: 'text-purple-500', val: 'text-purple-600 dark:text-purple-300', sub: 'text-purple-600/70 dark:text-purple-400/70' },
    amber: { card: 'border-amber-100 bg-amber-50/50 hover:border-amber-200 dark:border-amber-950/50 dark:bg-amber-950/20', title: 'text-amber-700 dark:text-amber-400', icon: 'text-amber-500', val: 'text-amber-600 dark:text-amber-300', sub: 'text-amber-600/70 dark:text-amber-400/70' },
  }
  const t = tones[tone] || tones.emerald
  return (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }} onClick={onClick}
      className={`text-left rounded-2xl border ${t.card} p-5 shadow-xs transition-all hover:shadow-md ${onClick ? 'cursor-pointer' : 'cursor-default'} group`}>
      <div className="flex items-center justify-between">
        <p className={`text-xs font-semibold ${t.title}`}>{label}</p>
        <Icon className={`h-4 w-4 ${t.icon} opacity-0 group-hover:opacity-100 transition-opacity`} />
      </div>
      <p className={`mt-2 text-2xl font-extrabold ${t.val}`}>{value ?? 0}</p>
      {subtext && <p className={`mt-1.5 text-[10px] font-bold ${t.sub} flex items-center gap-0.5 truncate`}>{subtext}</p>}
    </motion.div>
  )
}

function SoalProgressBar({ current, target }) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0
  const color = pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-rose-400'
  const textColor = pct >= 100 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-rose-500'
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{current}/{target} soal</span>
        <span className={`text-[10px] font-black ${textColor}`}>{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

const normalizeArray = (v) => { if (Array.isArray(v)) return v; if (Array.isArray(v?.data)) return v.data; return [] }
const getSubjectLabel = (s) => s?.label || s?.nama_mapel || s?.nama || s?.name || s?.kode_mapel || 'Mata Pelajaran'
const getJenisBadgeColor = (j) => {
  switch (j) {
    case 'UH': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300'
    case 'PTS': case 'UTS': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300'
    case 'PAS': case 'UAS': return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300'
    case 'CBT': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-300'
  }
}
// Distribusi default ditangani oleh backend (LmsKisiKisiService::simpan)

export default function LmsKisiKisiPage({ embedded, hidePageHeader, tabNav, onNavigateToBankSoal }) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const activeUnit = useUnitStore((s) => s.activeUnit)

  const handleGoToBankSoal = (item) => {
    if (item?.id) {
      sessionStorage.setItem('bankSoal_prefill_kisi_id', item.id)
      sessionStorage.setItem('bankSoal_prefill_kisi_judul', item.judul_kisi || '')
      sessionStorage.setItem('bankSoal_prefill_mapel_id', item.mata_pelajaran_id || '')
    }
    if (typeof onNavigateToBankSoal === 'function') {
      onNavigateToBankSoal(item)
      return
    }
    navigate(`/dashboard/akademik/perencanaan?tab=bank-soal&kisi_id=${item?.id || ''}`)
  }

  const userUnitId = useMemo(() => {
    const c = [user?.unit_id, user?.unit_pendidikan_id, user?.education_unit_id, user?.unit?.id, user?.education_unit?.id, user?.unit_pendidikan?.id, user?.employee?.unit_id, user?.employee?.unit_pendidikan_id, user?.employee?.education_unit_id, user?.school_info?.id].filter(Boolean)
    return c.length > 0 ? String(c[0]) : null
  }, [user])

  const userEmployeeId = useMemo(() => {
    const c = [user?.employee_id, user?.employee?.id, user?.unit?.employee_id].filter(Boolean)
    return c.length > 0 ? String(c[0]) : null
  }, [user])

  const [dataList, setDataList] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })
  const [stats, setStats] = useState({ total: 0, aktif: 0, nonaktif: 0, total_soal_target: 0, uh: 0, pts: 0, pas: 0 })
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [options, setOptions] = useState({ subjects: [], kurikulum: [], kelas: [], semesters: [], tahun_ajaran: [], guru: [], capaian_pembelajaran: [], tujuan_pembelajaran: [], jenis_ujian_options: [], level_kognitif_options: [] })
  const [filters, setFilters] = useState({ search: '', mata_pelajaran_id: '', jenis_ujian: '', status: '', kelas_id: '', semester_id: '' })
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [viewingItem, setViewingItem] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [rowDetailItem, setRowDetailItem] = useState(null)
  const [showRowDetailModal, setShowRowDetailModal] = useState(false)
  const [distribusiError, setDistribusiError] = useState('')
  const [formData, setFormData] = useState({
    judul_kisi: '', mata_pelajaran_id: '', cp_id: '', tp_id: '', kurikulum_id: '',
    kelas_id: '', semester_id: '', tahun_ajaran_id: '', guru_id: '',
    jenis_ujian: '', jumlah_soal: 20, alokasi_waktu_menit: 60,
    kompetensi_dasar: '', level_kognitif: '',
    distribusi_bobot: {}, status: true,
  })

  useEffect(() => { fetchStats(); fetchOptions() }, [userUnitId, activeUnit])
  useEffect(() => { fetchData(1) }, [filters, userUnitId, activeUnit])

  // Auto-set default jenis_ujian dan level_kognitif dari opsi pertama backend
  useEffect(() => {
    if (options.jenis_ujian_options.length > 0 && !formData.jenis_ujian) {
      setFormData((p) => ({ ...p, jenis_ujian: options.jenis_ujian_options[0].id }))
    }
  }, [options.jenis_ujian_options])

  useEffect(() => {
    if (options.level_kognitif_options.length > 0 && !formData.level_kognitif) {
      setFormData((p) => ({ ...p, level_kognitif: options.level_kognitif_options[0].id }))
    }
  }, [options.level_kognitif_options])

  const showNotification = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async (page = 1) => {
    setLoading(true)
    try {
      const params = { page, per_page: 10, ...filters }
      if (userUnitId) params.unit_pendidikan_id = userUnitId
      if (activeUnit) params.jenjang = activeUnit
      const response = await lmsKisiKisiService.getDaftar(params)
      if (response?.data) {
        let raw = Array.isArray(response.data) ? response.data : (response.data?.data || [])
        let filtered = raw.filter((item) => {
          if (!item) return false
          const iUnit = item.unit_pendidikan_id || item.unit_id || item.mata_pelajaran?.unit_pendidikan_id
          if (userUnitId && iUnit) return String(iUnit) === String(userUnitId)
          return true
        })
        setDataList(filtered)
        setPagination({ currentPage: response.meta?.current_page || 1, lastPage: response.meta?.last_page || 1, total: response.meta?.total || filtered.length })
      }
    } catch (err) { console.error('Gagal mengambil data kisi-kisi:', err); showNotification('Gagal memuat data kisi-kisi ujian.', 'error') }
    finally { setLoading(false) }
  }

  const fetchStats = async () => {
    try {
      const params = {}
      if (userUnitId) params.unit_pendidikan_id = userUnitId
      if (activeUnit) params.jenjang = activeUnit
      const res = await lmsKisiKisiService.getStats(params)
      if (res?.data) setStats(res.data)
    } catch (err) { console.error('Gagal stats:', err) }
  }

  const fetchOptions = async (mapelId = null, cpId = null) => {
    setLoadingOptions(true)
    try {
      const params = {}
      if (userUnitId) params.unit_pendidikan_id = userUnitId
      if (activeUnit) params.jenjang = activeUnit
      if (mapelId) params.mata_pelajaran_id = mapelId
      if (cpId) params.cp_id = cpId
      const [resOpts, resSub] = await Promise.allSettled([lmsKisiKisiService.getOptions(params), subjectService.getDaftar({ ...params, status: 1, per_page: 100 })])
      const response = resOpts.status === 'fulfilled' ? resOpts.value : {}
      const resData = response?.data?.data ?? response?.data ?? response ?? {}
      let dbSubRaw = resSub.status === 'fulfilled' ? resSub.value?.data || resSub.value || [] : []
      if (Array.isArray(dbSubRaw?.data)) dbSubRaw = dbSubRaw.data
      let dbSub = Array.isArray(dbSubRaw) ? dbSubRaw.filter((s) => {
        if (!s) return false
        const sU = s.unit_pendidikan_id || s.unit_id || s.education_unit_id
        if (userUnitId && sU) return String(sU) === String(userUnitId)
        return true
      }) : []
      const subjects = dbSub.length > 0 ? dbSub : normalizeArray(resData.subjects ?? resData.mata_pelajaran ?? resData.mata_pelajarans).filter((s) => { const sU = s.unit_pendidikan_id || s.unit_id; if (userUnitId && sU) return String(sU) === String(userUnitId); return true })
      setOptions((prev) => ({
        ...prev,
        subjects: (dbSub.length > 0 || resData.subjects !== undefined || resData.mata_pelajaran !== undefined) ? subjects : prev.subjects,
        kurikulum: resData.kurikulum !== undefined ? normalizeArray(resData.kurikulum) : prev.kurikulum,
        kelas: resData.kelas !== undefined ? normalizeArray(resData.kelas) : prev.kelas,
        semesters: resData.semesters !== undefined ? normalizeArray(resData.semesters) : prev.semesters,
        tahun_ajaran: resData.tahun_ajaran !== undefined ? normalizeArray(resData.tahun_ajaran) : prev.tahun_ajaran,
        guru: resData.guru !== undefined ? normalizeArray(resData.guru) : prev.guru,
        capaian_pembelajaran: (resData.capaian_pembelajaran !== undefined || resData.cp !== undefined) ? normalizeArray(resData.capaian_pembelajaran ?? resData.cp) : prev.capaian_pembelajaran,
        tujuan_pembelajaran: (resData.tujuan_pembelajaran !== undefined || resData.tp !== undefined) ? normalizeArray(resData.tujuan_pembelajaran ?? resData.tp) : prev.tujuan_pembelajaran,
        jenis_ujian_options: resData.jenis_ujian_options !== undefined ? normalizeArray(resData.jenis_ujian_options) : prev.jenis_ujian_options,
        level_kognitif_options: resData.level_kognitif_options !== undefined ? normalizeArray(resData.level_kognitif_options) : prev.level_kognitif_options,
      }))
    } catch (err) { console.error('Gagal opsi:', err) }
    finally { setLoadingOptions(false) }
  }

  const handleMataPelajaranChange = async (mapelId) => {
    setFormData((p) => ({ ...p, mata_pelajaran_id: mapelId, cp_id: '', tp_id: '' }))
    setOptions((p) => ({ ...p, capaian_pembelajaran: [], tujuan_pembelajaran: [] }))
    if (!mapelId) return
    await fetchOptions(mapelId, null)
  }

  const handleCpChange = async (cpId) => {
    setFormData((p) => ({ ...p, cp_id: cpId, tp_id: '' }))
    setOptions((p) => ({ ...p, tujuan_pembelajaran: [] }))
    if (!cpId) return
    await fetchOptions(formData.mata_pelajaran_id, cpId)
  }

  const handleDistribusiChange = (key, val) => {
    const updated = { ...formData.distribusi_bobot, [key]: Number(val) }
    const total = (updated.pg || 0) + (updated.isian || 0) + (updated.esai || 0)
    setDistribusiError(total !== 100 ? `Total bobot harus 100%. Saat ini: ${total}%` : '')
    setFormData((p) => ({ ...p, distribusi_bobot: updated }))
  }

  const handleOpenModal = (item = null) => {
    setDistribusiError('')
    if (item) {
      setEditingItem(item)
      setFormData({
        judul_kisi: item.judul_kisi || '', mata_pelajaran_id: item.mata_pelajaran_id || '',
        cp_id: item.cp_id || '', tp_id: item.tp_id || '', kurikulum_id: item.kurikulum_id || '',
        kelas_id: item.kelas_id || '', semester_id: item.semester_id || '',
        tahun_ajaran_id: item.tahun_ajaran_id || '', guru_id: item.guru_id || userEmployeeId || '',
        jenis_ujian: item.jenis_ujian || '', jumlah_soal: item.jumlah_soal || 20,
        alokasi_waktu_menit: item.alokasi_waktu_menit || 60, kompetensi_dasar: item.kompetensi_dasar || '',
        level_kognitif: item.level_kognitif || '',
        distribusi_bobot: item.distribusi_bobot || {},
        status: item.status !== undefined ? item.status : true,
      })
      fetchOptions(item.mata_pelajaran_id || null, item.cp_id || null)
    } else {
      setEditingItem(null)
      setFormData({
        judul_kisi: '', mata_pelajaran_id: '', cp_id: '', tp_id: '',
        kurikulum_id: '', kelas_id: '', semester_id: '', tahun_ajaran_id: '',
        guru_id: userEmployeeId || '',
        jenis_ujian: '',
        jumlah_soal: 20, alokasi_waktu_menit: 60, kompetensi_dasar: '',
        level_kognitif: '', distribusi_bobot: {}, status: true,
      })
      fetchOptions(null, null)
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { pg = 0, isian = 0, esai = 0 } = formData.distribusi_bobot || {}
    const totalBobot = pg + isian + esai
    if (totalBobot > 0 && totalBobot !== 100) { setDistribusiError(`Total bobot harus 100%. Saat ini: ${totalBobot}%`); return }
    try {
      if (editingItem) { await lmsKisiKisiService.update(editingItem.id, formData); showNotification('Kisi-kisi Ujian berhasil diperbarui.') }
      else { await lmsKisiKisiService.create(formData); showNotification('Kisi-kisi Ujian berhasil dibuat.') }
      setShowModal(false); fetchData(pagination.currentPage); fetchStats()
    } catch (err) { showNotification(err?.response?.data?.message || 'Gagal menyimpan kisi-kisi ujian.', 'error') }
  }

  const handleDelete = async (id, item) => {
    const cnt = item?.ujian_count || 0
    if (cnt > 0) { if (!window.confirm(`Kisi-kisi ini dipakai di ${cnt} ujian aktif. Hapus tetap akan dilanjutkan?`)) return }
    else { if (!window.confirm('Yakin ingin menghapus kisi-kisi ujian ini?')) return }
    try { await lmsKisiKisiService.delete(id); showNotification('Kisi-kisi Ujian berhasil dihapus.'); fetchData(pagination.currentPage); fetchStats() }
    catch (err) { showNotification('Gagal menghapus kisi-kisi.', 'error') }
  }

  const handleDuplicate = async (id) => {
    try { await lmsKisiKisiService.duplicate(id); showNotification('Kisi-kisi Ujian berhasil diduplikasi.'); fetchData(pagination.currentPage); fetchStats() }
    catch (err) { showNotification('Gagal menduplikasi.', 'error') }
  }

  const handleExportCSV = () => {
    if (!dataList.length) return
    const headers = ['Judul Kisi-kisi', 'Mapel', 'Jenis Ujian', 'Jumlah Soal', 'Soal Tersedia', 'Status']
    const rows = dataList.map((i) => [`"${(i.judul_kisi || '').replace(/"/g, '""')}"`, `"${(i.mata_pelajaran?.name || '').replace(/"/g, '""')}"`, i.jenis_ujian || '-', i.jumlah_soal || 0, i.bank_soal_count ?? 0, i.status ? 'Aktif' : 'Nonaktif'])
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const link = document.createElement('a'); link.href = encodeURI(csv); link.download = `kisi_kisi_ujian_${new Date().toISOString().slice(0, 10)}.csv`; document.body.appendChild(link); link.click(); document.body.removeChild(link)
  }

  const resetFilters = () => { setFilters({ search: '', mata_pelajaran_id: '', jenis_ujian: '', status: '', kelas_id: '', semester_id: '' }); fetchData(1) }
  const hasActiveFilter = filters.search || filters.mata_pelajaran_id || filters.jenis_ujian || filters.status || filters.kelas_id || filters.semester_id

  const dropdownCls = 'h-10 rounded-[12px] border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100'
  const inputCls = 'w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-600 outline-none transition'
  const labelCls = 'block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5'

  const pageActions = (
    <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
      <SquircleActionButton variant="import" label="Import" onClick={() => setImportOpen(true)} />
      <SquircleActionButton variant="export" label="Export" onClick={handleExportCSV} />
      <SquircleActionButton variant="view" label="Cetak" icon={Printer} onClick={() => setIsPrintModalOpen(true)} />
      <SquircleActionButton variant="primary" label="Buat Kisi-kisi Baru" onClick={() => handleOpenModal()} />
    </div>
  )

  return (
    <PageContainer maxW="7xl">
      <div className="education-unit-page lms-kisi-kisi-page space-y-6">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">

          {/* Toast */}
          {toast.show && (
            <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-white font-medium text-sm ${toast.type === 'error' ? 'bg-rose-600' : 'bg-[#0E5C44]'}`}>
              {toast.type === 'error' ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              <span>{toast.message}</span>
            </div>
          )}

          {/* Hero */}
          {!embedded && !hidePageHeader && (
            <motion.div variants={itemVariants}>
              <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#0E5C44] via-[#1E8E5A] to-[#3FBF75] p-8 text-white shadow-xl">
                <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-3">
                      <Sparkles className="h-3.5 w-3.5" /><span>Modul Evaluasi &amp; Penilaian LMS</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Kisi-kisi Ujian (Exam Blueprint)</h1>
                    <p className="mt-2 text-emerald-100 text-sm max-w-2xl leading-relaxed">Cetak biru penyelarasan CP, TP, dan Taksonomi Bloom — fondasi utama sebelum membuat soal dan ujian CBT.</p>
                  </div>
                  <button onClick={() => handleOpenModal()} className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#0E5C44] shadow-lg hover:bg-emerald-50 active:scale-95 transition-all">
                    <Plus className="h-4 w-4 stroke-[2.5]" /><span>Buat Kisi-kisi Baru</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* KPI */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiTintedCard icon={FileText} label="Total Kisi-kisi" value={stats.total} subtext={`${stats.aktif} Status Aktif`} tone="emerald" onClick={() => setFilters((p) => ({ ...p, jenis_ujian: '', status: '' }))} />
            <KpiTintedCard icon={Target} label="Target Butir Soal" value={stats.total_soal_target} subtext="Soal direncanakan" tone="blue" onClick={() => setFilters((p) => ({ ...p, jenis_ujian: '', status: '' }))} />
            <KpiTintedCard icon={BookOpen} label="Kisi-kisi UH" value={stats.uh} subtext="Ulangan Harian" tone="purple" onClick={() => setFilters((p) => ({ ...p, jenis_ujian: 'UH' }))} />
            <KpiTintedCard icon={Award} label="PTS &amp; PAS / UAS" value={(stats.pts || 0) + (stats.pas || 0)} subtext="Ujian Semester" tone="amber" onClick={() => setFilters((p) => ({ ...p, jenis_ujian: 'PTS' }))} />
          </motion.div>

          {/* Tab Nav */}
          {tabNav && <div className="my-2">{typeof tabNav === 'function' ? tabNav() : tabNav}</div>}

          {/* Filter Bar */}
          <motion.div variants={itemVariants} className="rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700/80 dark:bg-[#1B2433] space-y-3">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input type="text" placeholder="Cari judul kisi-kisi, KD, level kognitif..." value={filters.search}
                onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                className="h-12 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-xs font-semibold text-slate-700 outline-none placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100" />
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <select value={filters.mata_pelajaran_id} onChange={(e) => setFilters((p) => ({ ...p, mata_pelajaran_id: e.target.value }))} className={dropdownCls}>
                <option value="">Semua Mata Pelajaran</option>
                {options.subjects.map((s) => <option key={s.id} value={s.id}>{getSubjectLabel(s)}</option>)}
              </select>
              <select value={filters.jenis_ujian} onChange={(e) => setFilters((p) => ({ ...p, jenis_ujian: e.target.value }))} className={dropdownCls}>
                <option value="">Semua Jenis Ujian</option>
                {options.jenis_ujian_options.length > 0
                  ? options.jenis_ujian_options.map((j) => <option key={j.id} value={j.id}>{j.nama}</option>)
                  : <><option value="UH">Ulangan Harian (UH)</option><option value="PTS">PTS / UTS</option><option value="PAS">PAS / UAS</option><option value="CBT">CBT</option><option value="Remedial">Remedial</option></>
                }
              </select>
              <select value={filters.kelas_id} onChange={(e) => setFilters((p) => ({ ...p, kelas_id: e.target.value }))} className={dropdownCls}>
                <option value="">Semua Kelas</option>
                {options.kelas.map((k) => <option key={k.id} value={k.id}>{k.nama_kelas || k.tingkat || k.nama}</option>)}
              </select>
              <select value={filters.semester_id} onChange={(e) => setFilters((p) => ({ ...p, semester_id: e.target.value }))} className={dropdownCls}>
                <option value="">Semua Semester</option>
                {options.semesters.map((s) => <option key={s.id} value={s.id}>{s.name || s.nama || s.nama_semester}</option>)}
              </select>
              <select value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))} className={dropdownCls}>
                <option value="">Semua Status</option>
                <option value="1">Aktif</option>
                <option value="0">Nonaktif</option>
              </select>
              {hasActiveFilter && (
                <button type="button" onClick={resetFilters} className="inline-flex h-10 items-center gap-1.5 rounded-[12px] border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                  <RotateCcw className="h-3.5 w-3.5" /><span>Reset Filter</span>
                </button>
              )}
            </div>
          </motion.div>

          {/* Datatable — Emerald Style */}
          <motion.div variants={itemVariants}>
            <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-500/20 px-5 py-4 sm:px-6">
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">
                    Daftar Kisi-kisi Ujian <span className="text-xs font-normal text-slate-400">({pagination.total} total)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Indikator kelengkapan soal aktual vs target ditampilkan di setiap baris</p>
                </div>
                {pageActions}
              </div>

              <MasterDataTable className="!rounded-none !border-0 !shadow-none">
                <div className="overflow-x-auto min-h-[340px] pb-4">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/50 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <tr>
                        <th className="px-5 py-3.5 whitespace-nowrap">Judul &amp; Mata Pelajaran</th>
                        <th className="px-5 py-3.5 whitespace-nowrap">Capaian (CP / TP)</th>
                        <th className="px-5 py-3.5 whitespace-nowrap">Jenis &amp; Kognitif</th>
                        <th className="px-5 py-3.5 whitespace-nowrap">Soal / Durasi</th>
                        <th className="px-5 py-3.5 whitespace-nowrap">Kelengkapan Soal</th>
                        <th className="px-5 py-3.5 whitespace-nowrap">Status</th>
                        <th className="px-5 py-3.5 text-right whitespace-nowrap">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50 dark:divide-emerald-950/30">
                      {loading ? (
                        <tr><td colSpan="7" className="text-center py-14 text-slate-400">
                          <div className="flex flex-col items-center gap-2"><RefreshCw className="w-6 h-6 animate-spin text-emerald-600" /><span className="text-xs">Memuat data kisi-kisi...</span></div>
                        </td></tr>
                      ) : dataList.length === 0 ? (
                        <tr><td colSpan="7" className="text-center py-14 text-slate-400">
                          <div className="flex flex-col items-center gap-2"><FileText className="w-10 h-10 text-slate-200 dark:text-slate-700" /><span className="text-xs font-medium">Belum ada kisi-kisi ujian ditemukan.</span></div>
                        </td></tr>
                      ) : dataList.map((item) => {
                        const bankCount = item.bank_soal_count ?? 0
                        const ujianCount = item.ujian_count ?? 0
                        return (
                          <tr key={item.id} className="group hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors cursor-pointer"
                            onClick={(e) => { if (e.target.closest('button, a, [data-no-rowclick]')) return; setRowDetailItem(item); setShowRowDetailModal(true) }}>
                            <td className="px-5 py-4">
                              <div className="font-semibold text-slate-800 dark:text-white leading-snug">{item.judul_kisi}</div>
                              <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">{item.mata_pelajaran?.name || 'Mata Pelajaran N/A'}</div>
                              {(item.kelas || item.semester) && (
                                <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                                  {item.kelas && <span>{item.kelas.nama_kelas || item.kelas.tingkat}</span>}
                                  {item.kelas && item.semester && <span>·</span>}
                                  {item.semester && <span>{item.semester.nama_semester || item.semester.name}</span>}
                                </div>
                              )}
                              {ujianCount > 0 && (
                                <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
                                  <ShieldAlert className="w-2.5 h-2.5 text-amber-500" />
                                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">Dipakai di {ujianCount} ujian</span>
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-4 max-w-[180px]">
                              {item.cp ? (
                                <div className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-md text-[11px] font-medium mb-1 border border-emerald-100 dark:border-emerald-800">
                                  {item.cp.kode_cp ? `CP: ${item.cp.kode_cp}` : item.cp.nama_cp}
                                </div>
                              ) : <div className="text-[11px] text-slate-400 italic">CP belum ditentukan</div>}
                              {item.tp && <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">TP: {item.tp.kode_tp || item.tp.nama_tp}</div>}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getJenisBadgeColor(item.jenis_ujian)}`}>{item.jenis_ujian}</span>
                              {item.level_kognitif && <div className="text-[10px] text-slate-400 mt-1">{item.level_kognitif}</div>}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="font-bold text-slate-800 dark:text-white text-sm">{item.jumlah_soal} Soal</div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /><span>{item.alokasi_waktu_menit} Menit</span></div>
                            </td>
                            <td className="px-5 py-4 min-w-[140px]">
                              <SoalProgressBar current={bankCount} target={item.jumlah_soal || 0} />
                              {bankCount < (item.jumlah_soal || 0) && (
                                <button
                                  type="button"
                                  data-no-rowclick
                                  onClick={(e) => { e.stopPropagation(); handleGoToBankSoal(item) }}
                                  className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer">
                                  <Plus className="w-3 h-3" />Tambah Soal<ChevronRight className="w-3 h-3" />
                                </button>
                              )}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              {item.status
                                ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-full text-xs font-medium"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Aktif</span>
                                : <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 rounded-full text-xs font-medium"><span className="w-1.5 h-1.5 rounded-full bg-slate-400" />Nonaktif</span>
                              }
                            </td>
                            <td className="px-5 py-4 text-right">
                              <ActionDropdown
                                onView={() => { setViewingItem(item); setShowRowDetailModal(true); setRowDetailItem(item) }}
                                onEdit={() => handleOpenModal(item)}
                                onDelete={() => handleDelete(item.id, item)}
                                extraItems={[
                                  { label: 'Duplikasi Kisi-kisi', icon: <Copy className="size-4 text-emerald-500" />, onClick: () => handleDuplicate(item.id) },
                                  { label: 'Buat Soal dari Kisi ini', icon: <ChevronRight className="size-4 text-blue-500" />, onClick: () => handleGoToBankSoal(item) },
                                ]} />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-4 border-t border-emerald-100/60 dark:border-emerald-900/30 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-emerald-950/30 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Halaman {pagination.currentPage} dari {pagination.lastPage} ({pagination.total} Data Total)</span>
                  <div className="flex gap-2">
                    <button disabled={pagination.currentPage <= 1} onClick={() => fetchData(pagination.currentPage - 1)} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-emerald-200/60 dark:border-slate-700 rounded-xl text-xs font-medium disabled:opacity-50 hover:bg-emerald-50 dark:hover:bg-slate-700 transition">Sebelumnya</button>
                    <button disabled={pagination.currentPage >= pagination.lastPage} onClick={() => fetchData(pagination.currentPage + 1)} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-emerald-200/60 dark:border-slate-700 rounded-xl text-xs font-medium disabled:opacity-50 hover:bg-emerald-50 dark:hover:bg-slate-700 transition">Selanjutnya</button>
                  </div>
                </div>
              </MasterDataTable>
            </section>
          </motion.div>

          {/* Row Detail Modal */}
          {showRowDetailModal && rowDetailItem && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowRowDetailModal(false)}>
              <div className="bg-white dark:bg-[#1B2433] rounded-[20px] w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-950/30">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5"><FileText className="w-5 h-5" /></div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{rowDetailItem.judul_kisi}</h2>
                      <p className="text-xs text-slate-500 mt-0.5">{rowDetailItem.mata_pelajaran?.name || '-'} · {rowDetailItem.jenis_ujian || '-'}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowRowDetailModal(false)} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"><X className="w-5 h-5" /></button>
                </div>
                <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getJenisBadgeColor(rowDetailItem.jenis_ujian)}`}>{rowDetailItem.jenis_ujian}</span>
                    {rowDetailItem.status
                      ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Aktif</span>
                      : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200"><span className="w-1.5 h-1.5 rounded-full bg-slate-400" />Nonaktif</span>
                    }
                    {(rowDetailItem.ujian_count || 0) > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><ShieldAlert className="w-3 h-3" />Dipakai di {rowDetailItem.ujian_count} ujian</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-3"><p className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">Target Soal</p><p className="text-sm font-bold text-purple-700 dark:text-purple-400 mt-0.5">{rowDetailItem.jumlah_soal} Soal</p></div>
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3"><p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Soal Tersedia</p><p className="text-sm font-bold text-blue-700 dark:text-blue-400 mt-0.5">{rowDetailItem.bank_soal_count ?? 0} Soal</p></div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3"><p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Waktu</p><p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">{rowDetailItem.alokasi_waktu_menit} Menit</p></div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3"><p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Level Kognitif</p><p className="text-xs font-semibold text-slate-800 dark:text-white mt-0.5">{rowDetailItem.level_kognitif || '-'}</p></div>
                  </div>
                  <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900">
                    <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-2">Kelengkapan Bank Soal</p>
                    <SoalProgressBar current={rowDetailItem.bank_soal_count ?? 0} target={rowDetailItem.jumlah_soal || 0} />
                  </div>
                  {rowDetailItem.distribusi_bobot && (
                    <div className="rounded-xl p-3 border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Distribusi Bobot Soal</p>
                      <div className="flex items-center gap-4">
                        {Object.entries(rowDetailItem.distribusi_bobot).map(([k, v]) => (
                          <div key={k} className="text-center"><p className="text-[10px] text-slate-400 uppercase">{k}</p><p className="text-sm font-bold text-slate-700 dark:text-slate-200">{v}%</p></div>
                        ))}
                      </div>
                    </div>
                  )}
                  {rowDetailItem.cp && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-3 border border-emerald-100 dark:border-emerald-800">
                      <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">Capaian Pembelajaran (CP)</p>
                      <p className="text-xs text-slate-700 dark:text-slate-300">{rowDetailItem.cp.kode_cp ? `[${rowDetailItem.cp.kode_cp}] ` : ''}{rowDetailItem.cp.nama_cp}</p>
                    </div>
                  )}
                  {rowDetailItem.tp && (
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3 border border-blue-100 dark:border-blue-800">
                      <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider mb-1">Tujuan Pembelajaran (TP)</p>
                      <p className="text-xs text-slate-700 dark:text-slate-300">{rowDetailItem.tp.kode_tp ? `[${rowDetailItem.tp.kode_tp}] ` : ''}{rowDetailItem.tp.nama_tp || rowDetailItem.tp.deskripsi}</p>
                    </div>
                  )}
                  {rowDetailItem.kompetensi_dasar && (
                    <div><p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Indikator / KD</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">{rowDetailItem.kompetensi_dasar}</p>
                    </div>
                  )}
                </div>
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
                  <button onClick={() => setShowRowDetailModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Tutup</button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowRowDetailModal(false); handleGoToBankSoal(rowDetailItem) }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer">
                      <Plus className="w-3.5 h-3.5" />Buat Soal
                    </button>
                    <button onClick={() => { setShowRowDetailModal(false); handleDelete(rowDetailItem.id, rowDetailItem) }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-semibold hover:bg-rose-100 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />Hapus
                    </button>
                    <button onClick={() => { setShowRowDetailModal(false); handleOpenModal(rowDetailItem) }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0E5C44] text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm">
                      <Edit3 className="w-3.5 h-3.5" />Edit Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Create/Edit Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
              <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-[24px] shadow-2xl overflow-hidden my-8">
                <div className="flex items-center justify-between px-6 py-5 border-b border-emerald-100/60 dark:border-slate-700 bg-gradient-to-r from-emerald-50/60 to-transparent dark:from-emerald-950/30">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700"><FileText className="w-4 h-4" /></div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">{editingItem ? 'Edit Kisi-kisi Ujian' : 'Buat Kisi-kisi Ujian Baru'}</h3>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                  <div><label className={labelCls}>Judul Kisi-kisi Ujian *</label>
                    <input type="text" required placeholder="Contoh: Kisi-kisi PTS Gasal Matematika Kelas 8" value={formData.judul_kisi} onChange={(e) => setFormData({ ...formData, judul_kisi: e.target.value })} className={inputCls} /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className={labelCls}>Mata Pelajaran *</label>
                      <select required value={formData.mata_pelajaran_id} onChange={(e) => handleMataPelajaranChange(e.target.value)} className={inputCls}>
                        <option value="">-- Pilih Mata Pelajaran --</option>
                        {options.subjects.length > 0 ? options.subjects.map((s) => <option key={s.id} value={s.id}>{getSubjectLabel(s)}</option>) : <option value="" disabled>Belum ada mapel aktif</option>}
                      </select></div>
                    <div><label className={labelCls}>Jenis Ujian *</label>
                      <select required value={formData.jenis_ujian} onChange={(e) => setFormData({ ...formData, jenis_ujian: e.target.value })} className={inputCls}>
                        <option value="">-- Pilih Jenis Ujian --</option>
                        {options.jenis_ujian_options.map((j) => <option key={j.id} value={j.id}>{j.nama}</option>)}
                      </select></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className={labelCls}>Capaian Pembelajaran (CP)</label>
                      <select value={formData.cp_id} disabled={!formData.mata_pelajaran_id} onChange={(e) => handleCpChange(e.target.value)} className={`${inputCls} disabled:opacity-50`}>
                        {!formData.mata_pelajaran_id ? <option value="">Pilih mapel terlebih dahulu</option>
                          : loadingOptions ? <option value="">Memuat CP...</option>
                          : options.capaian_pembelajaran.length > 0
                            ? <>{<option value="">-- Pilih CP (Opsional) --</option>}{options.capaian_pembelajaran.map((cp) => <option key={cp.id} value={cp.id}>{cp.label || (cp.kode_cp ? `[${cp.kode_cp}] ${cp.nama_cp}` : cp.nama_cp)}</option>)}</>
                            : <option value="">Belum ada CP untuk mapel ini</option>}
                      </select></div>
                    <div><label className={labelCls}>Tujuan Pembelajaran (TP)</label>
                      <select value={formData.tp_id} disabled={!formData.cp_id} onChange={(e) => setFormData({ ...formData, tp_id: e.target.value })} className={`${inputCls} disabled:opacity-50`}>
                        {!formData.cp_id ? <option value="">Pilih CP terlebih dahulu</option>
                          : loadingOptions ? <option value="">Memuat TP...</option>
                          : options.tujuan_pembelajaran.length > 0
                            ? <>{<option value="">-- Pilih TP (Opsional) --</option>}{options.tujuan_pembelajaran.map((tp) => <option key={tp.id} value={tp.id}>{tp.label || (tp.kode_tp ? `[${tp.kode_tp}] ${tp.nama_tp}` : tp.nama_tp)}</option>)}</>
                            : <option value="">Belum ada TP untuk CP ini</option>}
                      </select></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className={labelCls}>Kelas</label>
                      <select value={formData.kelas_id} onChange={(e) => setFormData({ ...formData, kelas_id: e.target.value })} className={inputCls}>
                        <option value="">-- Pilih Kelas --</option>
                        {options.kelas.map((k) => <option key={k.id} value={k.id}>{k.nama_kelas || k.tingkat || k.nama}</option>)}
                      </select></div>
                    <div><label className={labelCls}>Semester</label>
                      <select value={formData.semester_id} onChange={(e) => setFormData({ ...formData, semester_id: e.target.value })} className={inputCls}>
                        <option value="">-- Pilih Semester --</option>
                        {options.semesters.map((s) => <option key={s.id} value={s.id}>{s.name || s.nama || s.nama_semester}</option>)}
                      </select></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className={labelCls}>Jumlah Soal Target *</label>
                      <input type="number" required min="1" value={formData.jumlah_soal} onChange={(e) => setFormData({ ...formData, jumlah_soal: parseInt(e.target.value) || 0 })} className={inputCls} /></div>
                    <div><label className={labelCls}>Alokasi Waktu (Menit) *</label>
                      <input type="number" required min="5" value={formData.alokasi_waktu_menit} onChange={(e) => setFormData({ ...formData, alokasi_waktu_menit: parseInt(e.target.value) || 0 })} className={inputCls} /></div>
                  </div>
                  <div><label className={labelCls}>Level Kognitif Bloom</label>
                    <select value={formData.level_kognitif} onChange={(e) => setFormData({ ...formData, level_kognitif: e.target.value })} className={inputCls}>
                      <option value="">-- Pilih Level Kognitif --</option>
                      {options.level_kognitif_options.map((l) => <option key={l.id} value={l.id}>{l.nama}</option>)}
                    </select></div>
                  <div>
                    <label className={labelCls}>Distribusi Bobot Soal <span className="text-slate-400 font-normal normal-case">(Total harus = 100%)</span></label>
                    <div className="grid grid-cols-3 gap-3">
                      {[{ key: 'pg', label: 'Pilihan Ganda (%)' }, { key: 'isian', label: 'Isian (%)' }, { key: 'esai', label: 'Esai (%)' }].map(({ key, label }) => (
                        <div key={key}>
                          <label className="block text-[10px] font-semibold text-slate-400 mb-1">{label}</label>
                          <input type="number" min="0" max="100" value={formData.distribusi_bobot?.[key] ?? 0} onChange={(e) => handleDistribusiChange(key, e.target.value)}
                            className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl text-sm text-center font-semibold outline-none focus:ring-2 transition ${distribusiError ? 'border-rose-300 focus:ring-rose-400/30' : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500/40 focus:border-emerald-600'}`} />
                        </div>
                      ))}
                    </div>
                    {distribusiError
                      ? <div className="mt-2 flex items-center gap-1.5 text-rose-600 dark:text-rose-400"><AlertTriangle className="w-3.5 h-3.5" /><p className="text-xs font-medium">{distribusiError}</p></div>
                      : (() => { const tot = (formData.distribusi_bobot?.pg || 0) + (formData.distribusi_bobot?.isian || 0) + (formData.distribusi_bobot?.esai || 0); return tot > 0 ? <p className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">✓ Total: {tot}% {tot === 100 ? '— Valid' : ''}</p> : <p className="mt-1 text-[10px] text-slate-400">Kosongkan jika tidak ingin mengatur distribusi bobot</p> })()}
                  </div>
                  <div><label className={labelCls}>Guru Penyusun</label>
                    <select value={formData.guru_id} onChange={(e) => setFormData({ ...formData, guru_id: e.target.value })} className={inputCls}>
                      <option value="">-- Pilih Guru --</option>
                      {options.guru.map((g) => <option key={g.id} value={g.id}>{g.nama_lengkap || g.name || g.nama}{String(g.id) === String(userEmployeeId) ? ' (Anda)' : ''}</option>)}
                    </select></div>
                  <div><label className={labelCls}>Uraian Indikator / Kompetensi Dasar</label>
                    <textarea rows="3" placeholder="Tuliskan materi pokok atau indikator pencapaian..." value={formData.kompetensi_dasar} onChange={(e) => setFormData({ ...formData, kompetensi_dasar: e.target.value })} className={`${inputCls} resize-none`} /></div>
                  <div className="flex items-center gap-3 pt-1">
                    <label className={labelCls + ' mb-0'}>Status</label>
                    <button type="button" onClick={() => setFormData((p) => ({ ...p, status: !p.status }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.status ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${formData.status ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className={`text-xs font-semibold ${formData.status ? 'text-emerald-600' : 'text-slate-400'}`}>{formData.status ? 'Aktif' : 'Nonaktif'}</span>
                  </div>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                    <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl hover:bg-slate-200 transition">Batal</button>
                    <button type="submit" disabled={!!distribusiError} className="px-5 py-2.5 bg-[#0E5C44] text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed">
                      {editingItem ? 'Simpan Perubahan' : 'Buat Kisi-kisi'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <PrintOptionModal isOpen={isPrintModalOpen} onClose={() => setIsPrintModalOpen(false)}
            title="Opsi Cetak Data Kisi-kisi Ujian" subtitle="Pilih metode pencetakan atau unduh cetak biru kisi-kisi"
            onPrintClean={() => { printCleanTable({ title: 'Laporan Kisi-kisi Ujian', data: dataList, columns: [{ header: 'Judul', accessor: (r) => r.judul_kisi || '-' }, { header: 'Mapel', accessor: (r) => getSubjectLabel(r.mata_pelajaran) }, { header: 'Jenis Ujian', accessor: (r) => r.jenis_ujian || '-' }, { header: 'Target Soal', accessor: (r) => r.jumlah_soal || 0 }, { header: 'Soal Tersedia', accessor: (r) => r.bank_soal_count ?? 0 }, { header: 'Status', accessor: (r) => r.status ? 'Aktif' : 'Nonaktif' }] }); setIsPrintModalOpen(false) }}
            onDownloadPdf={() => { downloadPdfTable({ title: 'Laporan Kisi-kisi Ujian', data: dataList, columns: [{ header: 'Judul', accessor: (r) => r.judul_kisi || '-' }, { header: 'Mapel', accessor: (r) => getSubjectLabel(r.mata_pelajaran) }, { header: 'Jenis Ujian', accessor: (r) => r.jenis_ujian || '-' }, { header: 'Target Soal', accessor: (r) => r.jumlah_soal || 0 }, { header: 'Soal Tersedia', accessor: (r) => r.bank_soal_count ?? 0 }, { header: 'Status', accessor: (r) => r.status ? 'Aktif' : 'Nonaktif' }], filename: `laporan_kisi_kisi_ujian_${new Date().toISOString().slice(0, 10)}.pdf` }); setIsPrintModalOpen(false) }} />
          <CsvImportModal isOpen={importOpen} onClose={() => setImportOpen(false)} title="Import Data Kisi-kisi Ujian" onImport={(file) => showNotification(`File ${file.name} berhasil diproses.`)} templateFields={['judul_kisi', 'mata_pelajaran_id', 'jenis_ujian', 'jumlah_soal', 'alokasi_waktu_menit', 'status']} />
        </motion.div>
      </div>
    </PageContainer>
  )
}
