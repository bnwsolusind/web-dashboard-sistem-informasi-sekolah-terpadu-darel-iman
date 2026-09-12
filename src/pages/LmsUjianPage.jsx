import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  FileText,
  Award,
  Layers,
  Sparkles,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Copy,
  Eye,
  RefreshCw,
  X,
  Shuffle,
  BarChart2,
  Users,
  CheckSquare,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Send,
  Calendar,
  Lock,
} from 'lucide-react'
import { lmsUjianService } from '../services/lmsUjianService'
import { useAuthStore } from '../stores/authStore'
import { useUnitStore } from '../stores/unitStore'
import ActionDropdown from '../components/app/ActionDropdown'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import {
  MasterDataTable,
  SquircleActionButton,
  PrintOptionModal,
} from '../components/master-data'
import CsvImportModal from '../components/master-data/CsvImportModal'
import { RotateCcw, Printer } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
}

function KpiTintedCard({ icon: Icon, label, subtext, value, tone = 'emerald', onClick }) {
  const tones = {
    emerald: {
      card: 'border-emerald-100 bg-emerald-50/50 hover:border-emerald-200 dark:border-emerald-950/50 dark:bg-emerald-950/20',
      title: 'text-emerald-700 dark:text-emerald-400',
      icon: 'text-emerald-500',
      val: 'text-emerald-600 dark:text-emerald-300',
      sub: 'text-emerald-600/70 dark:text-emerald-400/70',
    },
    amber: {
      card: 'border-amber-100 bg-amber-50/50 hover:border-amber-200 dark:border-amber-950/50 dark:bg-amber-950/20',
      title: 'text-amber-700 dark:text-amber-400',
      icon: 'text-amber-500',
      val: 'text-amber-600 dark:text-amber-300',
      sub: 'text-amber-600/70 dark:text-amber-400/70',
    },
    purple: {
      card: 'border-purple-100 bg-purple-50/50 hover:border-purple-200 dark:border-purple-950/50 dark:bg-purple-950/20',
      title: 'text-purple-700 dark:text-purple-400',
      icon: 'text-purple-500',
      val: 'text-purple-600 dark:text-purple-300',
      sub: 'text-purple-600/70 dark:text-purple-400/70',
    },
    blue: {
      card: 'border-blue-100 bg-blue-50/50 hover:border-blue-200 dark:border-blue-950/50 dark:bg-blue-950/20',
      title: 'text-blue-700 dark:text-blue-400',
      icon: 'text-blue-500',
      val: 'text-blue-600 dark:text-blue-300',
      sub: 'text-blue-600/70 dark:text-blue-400/70',
    },
  }
  const t = tones[tone] || tones.emerald
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={`text-left rounded-2xl border ${t.card} p-5 shadow-xs transition-all hover:shadow-md ${onClick ? 'cursor-pointer' : 'cursor-default'} group`}
    >
      <div className="flex items-center justify-between">
        <p className={`text-xs font-semibold ${t.title}`}>{label}</p>
        <Icon className={`h-4 w-4 ${t.icon} opacity-0 group-hover:opacity-100 transition-opacity`} />
      </div>
      <p className={`mt-2 text-2xl font-extrabold ${t.val}`}>{value ?? 0}</p>
      {subtext && (
        <p className={`mt-1.5 text-[10px] font-bold ${t.sub} flex items-center gap-0.5 truncate`}>
          {subtext}
        </p>
      )}
    </motion.div>
  )
}

export default function LmsUjianPage({ embedded, hidePageHeader, tabNav }) {
  const user = useAuthStore((state) => state.user)
  const activeUnit = useUnitStore((state) => state.activeUnit)

  const userUnitId = useMemo(() => {
    const candidateIds = [
      user?.unit_id,
      user?.unit_pendidikan_id,
      user?.education_unit_id,
      user?.unit?.id,
      user?.education_unit?.id,
      user?.unit_pendidikan?.id,
      user?.employee?.unit_id,
      user?.employee?.unit_pendidikan_id,
      user?.employee?.education_unit_id,
      user?.school_info?.id,
    ].filter(Boolean)
    return candidateIds.length > 0 ? String(candidateIds[0]) : null
  }, [user])

  const [dataList, setDataList] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })
  const [stats, setStats] = useState({
    total_ujian: 0,
    total_published: 0,
    total_berlangsung: 0,
    total_selesai: 0,
    total_peserta: 0,
    rata_nilai: 0,
  })
  const [options, setOptions] = useState({
    kisi_kisi: [],
    kelas: [],
    semesters: [],
    guru: [],
    status_options: [],
  })

  const [filters, setFilters] = useState({
    search: '',
    kelas_id: '',
    status: '',
  })

  // Print & Import State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  const handleExportCSV = () => {
    if (!dataList.length) return
    const headers = ['ID', 'Judul Ujian', 'Mata Pelajaran', 'Durasi', 'Status']
    const rows = dataList.map((item) => [
      item.id,
      `"${(item.nama_ujian || item.judul || '').replace(/"/g, '""')}"`,
      `"${(item.mata_pelajaran?.name || item.subject || '').replace(/"/g, '""')}"`,
      `${item.durasi_menit || 0} Menit`,
      item.status || 'Draft',
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `jadwal_ujian_cbt_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImport = (file) => {
    alert(`File ${file.name} berhasil diproses.`)
  }

  // Modals
  const [showModal, setShowModal] = useState(false)
  const [showResultsModal, setShowResultsModal] = useState(false)
  const [showCbtEngineModal, setShowCbtEngineModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [resultsData, setResultsData] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  // Hover & Row Detail Modal State
  const [rowDetailItem, setRowDetailItem] = useState(null)
  const [showRowDetailModal, setShowRowDetailModal] = useState(false)

  // Form Data
  const [formData, setFormData] = useState({
    kisi_kisi_id: '',
    kelas_id: '',
    semester_id: '',
    guru_id: '',
    judul_ujian: '',
    instruksi: '',
    waktu_mulai: '',
    waktu_selesai: '',
    durasi_menit: 60,
    acak_soal: true,
    acak_jawaban: true,
    tampilkan_nilai_langsung: true,
    nilai_kkm: 75.0,
    max_attempt: 1,
    status: 'draft',
  })

  // CBT Student Exam Simulation Engine State
  const [cbtSession, setCbtSession] = useState(null)
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [cbtSubmitting, setCbtSubmitting] = useState(false)
  const [examResultSummary, setExamResultSummary] = useState(null)
  const timerIntervalRef = useRef(null)

  useEffect(() => {
    fetchStats()
    fetchOptions()
  }, [userUnitId, activeUnit])

  useEffect(() => {
    fetchData(1)
  }, [filters, userUnitId, activeUnit])

  // Timer Countdown Effect
  useEffect(() => {
    if (showCbtEngineModal && timerSeconds > 0 && !examResultSummary) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current)
            handleAutoSubmitCbt()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [showCbtEngineModal, timerSeconds, examResultSummary])

  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async (page = 1) => {
    setLoading(true)
    try {
      const params = { page, per_page: 10, ...filters }
      if (userUnitId) params.unit_pendidikan_id = userUnitId
      if (activeUnit) params.jenjang = activeUnit

      const response = await lmsUjianService.getDaftar(params)
      if (response && response.data) {
        let rawData = Array.isArray(response.data) ? response.data : (response.data?.data || [])
        let filteredData = rawData.filter((item) => {
          if (!item) return false
          const itemUnitId = item.unit_pendidikan_id || item.unit_id || item.kisi_kisi?.unit_pendidikan_id || item.kisi_kisi?.mata_pelajaran?.unit_pendidikan_id
          if (userUnitId && itemUnitId) return String(itemUnitId) === String(userUnitId)
          return true
        })
        setDataList(filteredData)
        setPagination({
          currentPage: response.meta?.current_page || 1,
          lastPage: response.meta?.last_page || 1,
          total: response.meta?.total || filteredData.length,
        })
      }
    } catch (error) {
      console.error('Error loading CBT Ujian data:', error)
      showNotification('Gagal memuat data CBT Ujian', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const params = {}
      if (userUnitId) params.unit_pendidikan_id = userUnitId
      if (activeUnit) params.jenjang = activeUnit
      const response = await lmsUjianService.getStats(params)
      if (response && response.data) setStats(response.data)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const fetchOptions = async () => {
    try {
      const params = {}
      if (userUnitId) params.unit_pendidikan_id = userUnitId
      if (activeUnit) params.jenjang = activeUnit

      const response = await lmsUjianService.getOptions(params)
      if (response && response.data) {
        const optData = response.data
        const filteredKisi = (optData.kisi_kisi || []).filter((k) => {
          if (!k) return false
          const kUnitId = k.unit_pendidikan_id || k.unit_id || k.mata_pelajaran?.unit_pendidikan_id
          if (userUnitId && kUnitId) return String(kUnitId) === String(userUnitId)
          return true
        })
        setOptions({
          ...optData,
          kisi_kisi: filteredKisi,
        })
      }
    } catch (error) {
      console.error('Error loading options:', error)
    }
  }

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        kisi_kisi_id: item.kisi_kisi_id || '',
        kelas_id: item.kelas_id || '',
        semester_id: item.semester_id || '',
        guru_id: item.guru_id || '',
        judul_ujian: item.judul_ujian || '',
        instruksi: item.instruksi || '',
        waktu_mulai: item.waktu_mulai ? item.waktu_mulai.substring(0, 16) : '',
        waktu_selesai: item.waktu_selesai ? item.waktu_selesai.substring(0, 16) : '',
        durasi_menit: item.durasi_menit || 60,
        acak_soal: item.acak_soal !== undefined ? item.acak_soal : true,
        acak_jawaban: item.acak_jawaban !== undefined ? item.acak_jawaban : true,
        tampilkan_nilai_langsung: item.tampilkan_nilai_langsung !== undefined ? item.tampilkan_nilai_langsung : true,
        nilai_kkm: item.nilai_kkm || 75.0,
        max_attempt: item.max_attempt || 1,
        status: item.status || 'draft',
      })
    } else {
      setEditingItem(null)
      const defaultKisi = options.kisi_kisi.length > 0 ? options.kisi_kisi[0].id : ''
      const defaultKelas = options.kelas.length > 0 ? options.kelas[0].id : ''
      const defaultSemester = options.semesters.length > 0 ? options.semesters[0].id : ''

      setFormData({
        kisi_kisi_id: defaultKisi,
        kelas_id: defaultKelas,
        semester_id: defaultSemester,
        guru_id: '',
        judul_ujian: '',
        instruksi: 'Kerjakan ujian ini dengan teliti. Selamat mengerjakan!',
        waktu_mulai: '',
        waktu_selesai: '',
        durasi_menit: 60,
        acak_soal: true,
        acak_jawaban: true,
        tampilkan_nilai_langsung: true,
        nilai_kkm: 75.0,
        max_attempt: 1,
        status: 'published',
      })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.judul_ujian.trim()) {
      showNotification('Judul Ujian wajib diisi.', 'error')
      return
    }

    try {
      if (editingItem) {
        await lmsUjianService.update(editingItem.id, formData)
        showNotification('Sesi CBT Ujian berhasil diperbarui!')
      } else {
        await lmsUjianService.create(formData)
        showNotification('Sesi CBT Ujian baru berhasil diterbitkan!')
      }
      setShowModal(false)
      fetchData(pagination.currentPage)
      fetchStats()
    } catch (error) {
      console.error('Error saving CBT Ujian:', error)
      const errorMsg = error.response?.data?.message || 'Gagal menyimpan CBT Ujian.'
      showNotification(errorMsg, 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus sesi CBT Ujian ini?')) return
    try {
      await lmsUjianService.delete(id)
      showNotification('Sesi CBT Ujian berhasil dihapus!')
      fetchData(pagination.currentPage)
      fetchStats()
    } catch (error) {
      console.error('Error deleting item:', error)
      showNotification('Gagal menghapus sesi CBT Ujian.', 'error')
    }
  }

  const handleDuplicate = async (id) => {
    try {
      await lmsUjianService.duplicate(id)
      showNotification('Sesi CBT Ujian berhasil diduplikasi!')
      fetchData(pagination.currentPage)
      fetchStats()
    } catch (error) {
      console.error('Error duplicating item:', error)
      showNotification('Gagal menduplikasi sesi CBT Ujian.', 'error')
    }
  }

  const handleTogglePublish = async (id, newStatus) => {
    try {
      await lmsUjianService.togglePublish(id, newStatus)
      showNotification(`Status Ujian diubah menjadi ${newStatus}`)
      fetchData(pagination.currentPage)
      fetchStats()
    } catch (error) {
      console.error('Error updating status:', error)
      showNotification('Gagal mengubah status publish.', 'error')
    }
  }

  // View Results & Analytics
  const handleOpenResults = async (ujianId) => {
    try {
      const response = await lmsUjianService.getResults(ujianId)
      if (response && response.data) {
        setResultsData(response.data)
        setShowResultsModal(true)
      }
    } catch (error) {
      console.error('Error fetching CBT results:', error)
      showNotification('Gagal memuat hasil Ujian CBT.', 'error')
    }
  }

  // Launch Live Interactive CBT Student Exam Engine Simulation
  const handleLaunchCbtEngine = async (ujianItem) => {
    try {
      const response = await lmsUjianService.startSession(ujianItem.id)
      if (response && response.data) {
        const sess = response.data
        setCbtSession(sess)
        setCurrentQuestionIdx(0)
        setUserAnswers({})
        setExamResultSummary(null)
        setTimerSeconds(sess.ujian.sisa_waktu_detik || sess.ujian.durasi_menit * 60)
        setShowCbtEngineModal(true)
      }
    } catch (error) {
      console.error('Error launching CBT Engine:', error)
      showNotification('Gagal memulai simulasi CBT Ujian.', 'error')
    }
  }

  const handleSelectAnswer = (soalId, value, tipe) => {
    setUserAnswers((prev) => ({
      ...prev,
      [soalId]: {
        soal_id: soalId,
        jawaban_dipilih: tipe === 'pg' || tipe === 'benar_salah' ? value : null,
        jawaban_esai: tipe === 'esai' || tipe === 'menjodohkan' ? value : null,
      },
    }))
  }

  const handleFinishCbt = async () => {
    if (!cbtSession) return
    if (!window.confirm('Apakah Anda yakin ingin menyelesaikan dan mengumpulkan ujian ini?')) return

    setCbtSubmitting(true)
    try {
      const formattedAnswers = Object.values(userAnswers)
      const response = await lmsUjianService.finishSession(cbtSession.sesi_id, formattedAnswers)
      if (response && response.data) {
        setExamResultSummary(response.data)
        showNotification('Ujian CBT berhasil diselesaikan dan dinilai otomatis!')
        fetchStats()
        fetchData(pagination.currentPage)
      }
    } catch (error) {
      console.error('Error finishing CBT session:', error)
      showNotification('Gagal mengumpulkan CBT Ujian.', 'error')
    } finally {
      setCbtSubmitting(false)
    }
  }

  const handleAutoSubmitCbt = async () => {
    if (!cbtSession || examResultSummary) return
    setCbtSubmitting(true)
    try {
      const formattedAnswers = Object.values(userAnswers)
      const response = await lmsUjianService.finishSession(cbtSession.sesi_id, formattedAnswers)
      if (response && response.data) {
        setExamResultSummary(response.data)
        showNotification('Waktu habis! Ujian otomatis dikumpulkan & dinilai.', 'warning')
      }
    } catch (error) {
      console.error('Auto submit error:', error)
    } finally {
      setCbtSubmitting(false)
    }
  }

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Dipublikasikan</span>
      case 'berlangsung':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse">Sedang Berlangsung</span>
      case 'selesai':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">Selesai</span>
      case 'draft':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">Draft</span>
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">{status}</span>
    }
  }

  const pageActions = (
    <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
      <SquircleActionButton
        variant="import"
        label="Import"
        onClick={() => setImportOpen(true)}
      />
      <SquircleActionButton
        variant="export"
        label="Export"
        onClick={handleExportCSV}
      />
      <SquircleActionButton
        variant="view"
        label="Cetak"
        icon={Printer}
        onClick={() => setIsPrintModalOpen(true)}
      />
      <SquircleActionButton
        variant="primary"
        label="Buat Ujian / CBT Baru"
        onClick={() => handleOpenModal()}
      />
    </div>
  )

  const pageContent = (
    <div className="education-unit-page lms-cbt-page space-y-6">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-white transition-all transform duration-300 ${
            toast.type === 'error' ? 'bg-rose-600' : toast.type === 'warning' ? 'bg-amber-600' : 'bg-[#0E5C44]'
          }`}
        >
          {toast.type === 'error' ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Hero Banner Header (Hidden when embedded) */}
      {!embedded && !hidePageHeader && (
        <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-[18px] bg-gradient-to-r from-[#0E5C44] via-[#1E8E5A] to-[#3FBF75] p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <Sparkles className="w-72 h-72 text-white" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" /> Layer 3: Evaluasi CBT & Penilaian Online
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Ujian Online (CBT)</h1>
              <p className="text-emerald-100 text-sm mt-1 max-w-xl">
                Platform Computer Based Test terintegrasi Bank Soal dengan Timer real-time, Acak Soal/Jawaban, Auto Scoring, & Analisis Hasil Ujian.
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-[#0E5C44] font-semibold text-sm shadow-md hover:bg-emerald-50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" /> Terbitkan Ujian Baru
            </button>
          </div>
        </div>
        </motion.div>
      )}

      {/* KPI Stats Cards (Interactive Click Filters) */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiTintedCard
          icon={Layers}
          label="Total Ujian CBT"
          value={stats.total_ujian}
          subtext={`${stats.total_published} Dipublikasikan`}
          tone="emerald"
          onClick={() => setFilters((prev) => ({ ...prev, status: '' }))}
        />
        <KpiTintedCard
          icon={Play}
          label="Sedang Berlangsung"
          value={stats.total_berlangsung}
          subtext="Sesi Ujian Aktif"
          tone="amber"
          onClick={() => setFilters((prev) => ({ ...prev, status: 'berlangsung' }))}
        />
        <KpiTintedCard
          icon={Users}
          label="Total Peserta Sesi"
          value={stats.total_peserta}
          subtext="Siswa Mengikuti"
          tone="purple"
          onClick={() => setFilters((prev) => ({ ...prev, status: 'published' }))}
        />
        <KpiTintedCard
          icon={Award}
          label="Rata-rata Nilai"
          value={stats.rata_nilai}
          subtext="Skor Auto Scoring"
          tone="blue"
          onClick={() => setFilters((prev) => ({ ...prev, status: 'selesai' }))}
        />
      </motion.div>

      {/* Tab Navigation (Pindahkan di atas card datatable) */}
      {tabNav && <div className="my-2">{typeof tabNav === 'function' ? tabNav() : tabNav}</div>}

      {/* SEARCH & FILTER BAR (2-ROW LAYOUT) */}
      <motion.div variants={itemVariants} className="rounded-[18px] border border-slate-200/80 bg-white p-4.5 shadow-sm dark:border-slate-700/80 dark:bg-[#1B2433] space-y-3.5">
        {/* Baris 1: Full-width Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari ujian, instruksi..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="h-12 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-xs font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100"
          />
        </div>

        {/* Baris 2: Dropdown Filters & Reset Button */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <select
              value={filters.kelas_id}
              onChange={(e) => setFilters((prev) => ({ ...prev, kelas_id: e.target.value }))}
              className="h-12 rounded-[14px] border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100"
            >
              <option value="">Semua Kelas Sasaran</option>
              {options.kelas.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama_kelas}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              className="h-12 rounded-[14px] border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100"
            >
              <option value="">Semua Status Ujian</option>
              <option value="draft">Draft</option>
              <option value="published">Dipublikasikan</option>
              <option value="berlangsung">Sedang Berlangsung</option>
              <option value="selesai">Selesai</option>
            </select>

            {(filters.search || filters.kelas_id || filters.status) && (
              <button
                type="button"
                onClick={() => {
                  setFilters({ search: '', kelas_id: '', status: '' })
                  fetchData(1)
                }}
                className="inline-flex h-12 items-center gap-1.5 rounded-[14px] border border-slate-200 bg-slate-50 px-3.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* MAIN DATATABLE SECTION */}
      <motion.div variants={itemVariants}>
      <section className="overflow-hidden rounded-[var(--master-card-radius,18px)] border border-slate-200/80 bg-white shadow-sm dark:border-slate-700 dark:bg-[#1B2433]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 px-4 py-4 sm:px-6 md:px-8 dark:border-slate-700">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              Daftar Ujian Online (Evaluasi CBT)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sesi ujian, timer, acak soal & auto scoring
            </p>
          </div>
          {pageActions}
        </div>

        <MasterDataTable className="!rounded-none !border-0 !shadow-none">

        {loading ? (
          <div className="p-8 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#0E5C44] animate-spin mx-auto" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Memuat sesi CBT Ujian...</p>
          </div>
        ) : dataList.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Belum Ada Sesi Ujian CBT</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Silakan buat dan terbitkan sesi CBT Ujian Online baru untuk kelas Anda.
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0E5C44] text-white text-xs font-medium hover:bg-emerald-700 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Terbitkan Ujian Baru
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[340px] pb-12">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111827]/50 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Judul & Kisi-kisi Ujian</th>
                  <th className="py-3.5 px-4">Kelas & Guru</th>
                  <th className="py-3.5 px-4 text-center">Durasi & KKM</th>
                  <th className="py-3.5 px-4 text-center">Pengaturan CBT</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi CBT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {dataList.map((item) => (
                  <tr
                    key={item.id}
                    className="group relative hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors duration-150 cursor-pointer"
                    onClick={(e) => {
                      if (e.target.closest('button, a, [data-no-rowclick]')) return
                      setRowDetailItem(item)
                      setShowRowDetailModal(true)
                    }}
                  >
                    <td className="py-3.5 px-4 align-top max-w-xs relative">
                      {/* Hover Card */}
                      <div className="pointer-events-none absolute left-4 top-full mt-1.5 z-50 w-64 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out">
                        <div className="bg-white dark:bg-[#1B2433] rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl p-3 space-y-1.5">
                          <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-100 dark:border-slate-700">
                            <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <p className="text-xs font-bold text-slate-800 dark:text-white line-clamp-2">{item.judul_ujian}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Durasi</p>
                              <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{item.durasi_menit || 0} Menit</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider">KKM</p>
                              <p className="text-[11px] font-bold text-emerald-600">{item.nilai_kkm || 75}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Kelas</p>
                              <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 line-clamp-1">{item.kelas?.nama_kelas || 'Semua'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Status</p>
                              <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 capitalize">{item.status || 'draft'}</p>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700">Klik baris untuk detail lengkap</p>
                        </div>
                        <div className="absolute -top-1.5 left-6 border-4 border-transparent border-b-white dark:border-b-[#1B2433] drop-shadow" />
                      </div>

                      <div className="font-bold text-gray-900 dark:text-white leading-tight mb-1">{item.judul_ujian}</div>
                      <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                        {item.kisi_kisi?.judul_kisi} ({item.kisi_kisi?.mata_pelajaran || '-'})
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-top">
                      <div className="font-semibold text-gray-800 dark:text-gray-200">{item.kelas?.nama_kelas || 'Semua Kelas'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.guru?.nama_lengkap || 'Pengampu'}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center align-top">
                      <div className="inline-flex items-center gap-1 text-xs font-bold text-gray-700 dark:text-gray-300">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" /> {item.durasi_menit} Menit
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">KKM: <span className="font-semibold text-emerald-700 dark:text-emerald-400">{item.nilai_kkm}</span></div>
                    </td>

                    <td className="py-3.5 px-4 text-center align-top">
                      <div className="flex items-center justify-center gap-1 text-[11px]">
                        {item.acak_soal && (
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-medium flex items-center gap-1">
                            <Shuffle className="w-3 h-3" /> Acak Soal
                          </span>
                        )}
                        {item.tampilkan_nilai_langsung && (
                          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 font-medium flex items-center gap-1">
                            <Award className="w-3 h-3" /> Auto Scoring
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center align-top">
                      {getStatusBadge(item.status)}
                    </td>

                    <td className="py-3.5 px-4 text-right align-top">
                      <ActionDropdown
                        onView={() => handleOpenResults(item.id)}
                        onEdit={() => handleOpenModal(item)}
                        onDelete={() => handleDelete(item.id)}
                        extraItems={[
                          {
                            label: 'Simulasi Tes CBT',
                            icon: <Play className="size-4 text-emerald-500" />,
                            onClick: () => handleLaunchCbtEngine(item),
                          },
                          {
                            label: 'Hasil Ujian & Rekap Nilai',
                            icon: <BarChart2 className="size-4 text-purple-500" />,
                            onClick: () => handleOpenResults(item.id),
                          },
                          {
                            label: 'Duplikasi Ujian',
                            icon: <Copy className="size-4 text-indigo-500" />,
                            onClick: () => handleDuplicate(item.id),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && pagination.lastPage > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <span>
              Halaman {pagination.currentPage} dari {pagination.lastPage} ({pagination.total} Ujian)
            </span>
            <div className="flex gap-1">
              <button
                disabled={pagination.currentPage <= 1}
                onClick={() => fetchData(pagination.currentPage - 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Sebelumnya
              </button>
              <button
                disabled={pagination.currentPage >= pagination.lastPage}
                onClick={() => fetchData(pagination.currentPage + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
        </MasterDataTable>
      </section>
      </motion.div>

      {/* ROW DETAIL MODAL POPUP — CBT Ujian */}
      {showRowDetailModal && rowDetailItem && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowRowDetailModal(false)}
        >
          <div
            className="bg-white dark:bg-[#1B2433] rounded-[18px] w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{rowDetailItem.judul_ujian}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {rowDetailItem.kelas?.nama_kelas || 'Semua Kelas'} · {rowDetailItem.guru?.nama_lengkap || 'Pengampu'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRowDetailModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(rowDetailItem.status)}
                {rowDetailItem.acak_soal && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    <Shuffle className="w-3 h-3" /> Acak Soal
                  </span>
                )}
                {rowDetailItem.tampilkan_nilai_langsung && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    <Award className="w-3 h-3" /> Auto Scoring
                  </span>
                )}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">Durasi Ujian</p>
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">{rowDetailItem.durasi_menit || 0} Menit</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Nilai KKM</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{rowDetailItem.nilai_kkm || 75}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 col-span-2">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Kisi-kisi Ujian</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">
                    {rowDetailItem.kisi_kisi?.judul_kisi || '-'} ({rowDetailItem.kisi_kisi?.mata_pelajaran || '-'})
                  </p>
                </div>
              </div>

              {/* Instruksi */}
              {rowDetailItem.instruksi && (
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Instruksi Pengerjaan</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{rowDetailItem.instruksi}</p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
              <button
                onClick={() => setShowRowDetailModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Tutup
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowRowDetailModal(false)
                    handleDelete(rowDetailItem.id)
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus
                </button>
                <button
                  onClick={() => {
                    setShowRowDetailModal(false)
                    handleOpenModal(rowDetailItem)
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0E5C44] text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CRUD Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1B2433] rounded-[18px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-[#1B2433] z-10">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {editingItem ? <Edit3 className="w-5 h-5 text-[#0E5C44]" /> : <Plus className="w-5 h-5 text-[#0E5C44]" />}
                {editingItem ? 'Edit Sesi CBT Ujian' : 'Terbitkan Ujian CBT Baru'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Judul Ujian CBT <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Ujian Akhir Semester CBT Matematika X"
                  value={formData.judul_ujian}
                  onChange={(e) => setFormData((prev) => ({ ...prev, judul_ujian: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Kisi-kisi Ujian (Bank Soal Source) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.kisi_kisi_id}
                    onChange={(e) => setFormData((prev) => ({ ...prev, kisi_kisi_id: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827]"
                    required
                  >
                    <option value="">-- Pilih Kisi-kisi --</option>
                    {options.kisi_kisi.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.judul_kisi} ({k.subject_name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Kelas Sasaran <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.kelas_id}
                    onChange={(e) => setFormData((prev) => ({ ...prev, kelas_id: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827]"
                    required
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {options.kelas.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama_kelas}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Durasi (Menit) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="360"
                    value={formData.durasi_menit}
                    onChange={(e) => setFormData((prev) => ({ ...prev, durasi_menit: parseInt(e.target.value) || 60 }))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Nilai KKM</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.nilai_kkm}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nilai_kkm: parseFloat(e.target.value) || 75.0 }))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Status Publish</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827]"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Dipublikasikan</option>
                    <option value="berlangsung">Sedang Berlangsung</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </div>
              </div>

              {/* Switches: Acak Soal, Acak Jawaban, Auto Scoring */}
              <div className="bg-emerald-50/50 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/50 space-y-2">
                <h4 className="text-xs font-bold text-[#0E5C44] dark:text-emerald-300 uppercase tracking-wider">
                  Pengaturan Engine CBT
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                    <input
                      type="checkbox"
                      checked={formData.acak_soal}
                      onChange={(e) => setFormData((prev) => ({ ...prev, acak_soal: e.target.checked }))}
                      className="w-4 h-4 text-[#0E5C44] rounded"
                    />
                    <span>Acak Urutan Soal</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                    <input
                      type="checkbox"
                      checked={formData.acak_jawaban}
                      onChange={(e) => setFormData((prev) => ({ ...prev, acak_jawaban: e.target.checked }))}
                      className="w-4 h-4 text-[#0E5C44] rounded"
                    />
                    <span>Acak Opsi Pilihan</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                    <input
                      type="checkbox"
                      checked={formData.tampilkan_nilai_langsung}
                      onChange={(e) => setFormData((prev) => ({ ...prev, tampilkan_nilai_langsung: e.target.checked }))}
                      className="w-4 h-4 text-[#0E5C44] rounded"
                    />
                    <span>Auto Scoring Langsung</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Instruksi & Peraturan Ujian
                </label>
                <textarea
                  rows={2}
                  value={formData.instruksi}
                  onChange={(e) => setFormData((prev) => ({ ...prev, instruksi: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827]"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2 sticky bottom-0 bg-white dark:bg-[#1B2433] py-2 z-10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0E5C44] text-white text-xs font-semibold hover:bg-emerald-700 shadow-md transition-all"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Terbitkan Ujian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIVE INTERACTIVE CBT STUDENT ENGINE SIMULATION MODAL */}
      {showCbtEngineModal && cbtSession && (
        <div className="fixed inset-0 z-50 bg-[#0F172A] text-white flex flex-col overflow-hidden">
          {/* CBT Header with Countdown Timer */}
          <div className="bg-[#1E293B] px-6 py-3.5 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#0E5C44] text-white font-bold text-sm">CBT</div>
              <div>
                <h3 className="font-bold text-sm text-white leading-tight">{cbtSession.ujian.judul_ujian}</h3>
                <p className="text-xs text-emerald-400">Simulasi Mode Siswa</p>
              </div>
            </div>

            {/* Countdown Timer Banner */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-base font-bold shadow-inner ${
                timerSeconds < 300 ? 'bg-rose-950/80 text-rose-300 border border-rose-700 animate-pulse' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-700'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span>Sisa Waktu: {formatTimer(timerSeconds)}</span>
            </div>

            <button
              onClick={() => setShowCbtEngineModal(false)}
              className="p-2 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* CBT Main Engine Body */}
          {!examResultSummary ? (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Question Navigator Sidebar */}
              <div className="w-full md:w-64 bg-[#1E293B]/60 p-4 border-r border-gray-800 overflow-y-auto shrink-0 space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Navigasi Soal ({cbtSession.soal.length})</h4>
                <div className="grid grid-cols-5 gap-2">
                  {cbtSession.soal.map((soal, idx) => {
                    const isCurrent = currentQuestionIdx === idx
                    const isAnswered = !!userAnswers[soal.id]?.jawaban_dipilih || !!userAnswers[soal.id]?.jawaban_esai
                    return (
                      <button
                        key={soal.id}
                        onClick={() => setCurrentQuestionIdx(idx)}
                        className={`h-9 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                          isCurrent
                            ? 'ring-2 ring-emerald-400 bg-[#0E5C44] text-white'
                            : isAnswered
                            ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    )
                  })}
                </div>

                <div className="pt-4 border-t border-gray-800 space-y-2 text-[11px] text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-[#0E5C44] ring-1 ring-emerald-400" />
                    <span>Sedang Dikerjakan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-emerald-900/60 border border-emerald-700" />
                    <span>Sudah Dijawab</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-gray-800" />
                    <span>Belum Dijawab</span>
                  </div>
                </div>

                <button
                  onClick={handleFinishCbt}
                  disabled={cbtSubmitting}
                  className="w-full mt-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <Send className="w-4 h-4" /> Kumpulkan Ujian
                </button>
              </div>

              {/* Active Question Content View */}
              {cbtSession.soal[currentQuestionIdx] && (
                <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between space-y-6">
                  <div className="space-y-4 max-w-3xl">
                    <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
                      <span>Soal No. {currentQuestionIdx + 1} dari {cbtSession.soal.length}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Bobot: {cbtSession.soal[currentQuestionIdx].poin} Poin
                      </span>
                    </div>

                    <div className="bg-[#1E293B] p-5 rounded-2xl border border-gray-800 text-base leading-relaxed font-medium">
                      {cbtSession.soal[currentQuestionIdx].pertanyaan}
                    </div>

                    {/* Render Choices based on Question Type */}
                    {cbtSession.soal[currentQuestionIdx].tipe_soal === 'pg' && (
                      <div className="space-y-2.5 pt-2">
                        {cbtSession.soal[currentQuestionIdx].opsi.map((opt) => {
                          const activeKey = userAnswers[cbtSession.soal[currentQuestionIdx].id]?.jawaban_dipilih
                          const isSelected = activeKey === opt.key
                          return (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() => handleSelectAnswer(cbtSession.soal[currentQuestionIdx].id, opt.key, 'pg')}
                              className={`w-full flex items-center gap-3.5 p-4 rounded-xl border text-left text-sm font-medium transition-all ${
                                isSelected
                                  ? 'bg-[#0E5C44] border-emerald-400 text-white ring-2 ring-emerald-400'
                                  : 'bg-[#1E293B] border-gray-800 text-gray-200 hover:bg-gray-800'
                              }`}
                            >
                              <span
                                className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                                  isSelected ? 'bg-white text-[#0E5C44]' : 'bg-gray-800 text-gray-400'
                                }`}
                              >
                                {opt.key}
                              </span>
                              <span>{opt.text}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {cbtSession.soal[currentQuestionIdx].tipe_soal === 'benar_salah' && (
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        {['Benar', 'Salah'].map((val) => {
                          const isSelected = userAnswers[cbtSession.soal[currentQuestionIdx].id]?.jawaban_dipilih === val
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleSelectAnswer(cbtSession.soal[currentQuestionIdx].id, val, 'benar_salah')}
                              className={`p-5 rounded-2xl border font-bold text-base flex items-center justify-center gap-3 transition-all ${
                                isSelected
                                  ? 'bg-[#0E5C44] border-emerald-400 text-white ring-2 ring-emerald-400'
                                  : 'bg-[#1E293B] border-gray-800 text-gray-300 hover:bg-gray-800'
                              }`}
                            >
                              {val === 'Benar' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-rose-400" />}
                              {val}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {cbtSession.soal[currentQuestionIdx].tipe_soal === 'esai' && (
                      <div className="pt-2">
                        <textarea
                          rows={5}
                          placeholder="Tuliskan jawaban essay lengkap Anda di sini..."
                          value={userAnswers[cbtSession.soal[currentQuestionIdx].id]?.jawaban_esai || ''}
                          onChange={(e) => handleSelectAnswer(cbtSession.soal[currentQuestionIdx].id, e.target.value, 'esai')}
                          className="w-full p-4 rounded-xl border border-gray-800 bg-[#1E293B] text-white text-sm focus:ring-2 focus:ring-emerald-400"
                        />
                      </div>
                    )}
                  </div>

                  {/* Previous / Next Button Controls */}
                  <div className="flex items-center justify-between border-t border-gray-800 pt-4 max-w-3xl">
                    <button
                      disabled={currentQuestionIdx === 0}
                      onClick={() => setCurrentQuestionIdx((prev) => prev - 1)}
                      className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-xs font-semibold flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" /> Soal Sebelumnya
                    </button>
                    <button
                      disabled={currentQuestionIdx >= cbtSession.soal.length - 1}
                      onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                      className="px-4 py-2 rounded-xl bg-[#0E5C44] hover:bg-emerald-600 disabled:opacity-40 text-xs font-semibold flex items-center gap-2"
                    >
                      Soal Selanjutnya <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* AUTO SCORING EXAM RESULT SUMMARY CARD */
            <div className="flex-1 p-8 overflow-y-auto flex items-center justify-center">
              <div className="bg-[#1E293B] rounded-3xl p-8 max-w-lg w-full text-center border border-gray-800 space-y-6 shadow-2xl">
                <div className="w-20 h-20 rounded-full bg-emerald-950/80 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
                  <Award className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Ujian Selesai!</h3>
                  <p className="text-xs text-gray-400 mt-1">Hasil Auto Scoring CBT secara Real-time</p>
                </div>

                <div className="bg-[#0F172A] p-6 rounded-2xl border border-gray-800 space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">Skor Final CBT</span>
                  <div className="text-5xl font-black text-emerald-400">{examResultSummary.nilai_final}</div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      examResultSummary.nilai_final >= (cbtSession.ujian.nilai_kkm || 75)
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {examResultSummary.nilai_final >= (cbtSession.ujian.nilai_kkm || 75) ? 'LULUS KKM' : 'TIDAK LULUS KKM'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="bg-[#0F172A] p-3 rounded-xl border border-gray-800">
                    <span className="text-gray-400 block">Benar</span>
                    <span className="text-base font-bold text-emerald-400">{examResultSummary.jumlah_benar}</span>
                  </div>
                  <div className="bg-[#0F172A] p-3 rounded-xl border border-gray-800">
                    <span className="text-gray-400 block">Salah</span>
                    <span className="text-base font-bold text-rose-400">{examResultSummary.jumlah_salah}</span>
                  </div>
                  <div className="bg-[#0F172A] p-3 rounded-xl border border-gray-800">
                    <span className="text-gray-400 block">Kosong</span>
                    <span className="text-base font-bold text-amber-400">{examResultSummary.jumlah_kosong}</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowCbtEngineModal(false)}
                  className="w-full py-3 rounded-xl bg-[#0E5C44] hover:bg-emerald-600 text-white font-bold text-sm shadow-lg transition"
                >
                  Tutup Simulasi CBT
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results & Score Analytics Modal */}
      {showResultsModal && resultsData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1B2433] rounded-[18px] max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-[#0E5C44]" /> Hasil & Analisis Nilai CBT
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {resultsData.ujian?.judul_ujian} — {resultsData.ujian?.kelas}
                </p>
              </div>
              <button onClick={() => setShowResultsModal(false)} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ringkasan Analytic Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">Total Peserta</span>
                <span className="text-lg font-bold text-emerald-800 dark:text-emerald-300">{resultsData.ringkasan?.total_peserta} Siswa</span>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-100 dark:border-blue-900/50">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">Kelulusan KKM</span>
                <span className="text-lg font-bold text-blue-800 dark:text-blue-300">{resultsData.ringkasan?.persentase_kelulusan}%</span>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950/40 p-3 rounded-xl border border-purple-100 dark:border-purple-900/50">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">Rata-rata Nilai</span>
                <span className="text-lg font-bold text-purple-800 dark:text-purple-300">{resultsData.ringkasan?.rata_nilai}</span>
              </div>
              <div className="bg-teal-50 dark:bg-teal-950/40 p-3 rounded-xl border border-teal-100 dark:border-teal-900/50">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">Nilai Tertinggi</span>
                <span className="text-lg font-bold text-teal-800 dark:text-teal-300">{resultsData.ringkasan?.nilai_tertinggi}</span>
              </div>
              <div className="bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-100 dark:border-rose-900/50">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">Nilai Terendah</span>
                <span className="text-lg font-bold text-rose-800 dark:text-rose-300">{resultsData.ringkasan?.nilai_terendah}</span>
              </div>
            </div>

            {/* Student Score Table */}
            <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-[#111827] text-gray-500 font-semibold border-b border-gray-100 dark:border-gray-800">
                    <th className="p-3">Nama Siswa</th>
                    <th className="p-3 text-center">Durasi (m)</th>
                    <th className="p-3 text-center">Benar</th>
                    <th className="p-3 text-center">Salah</th>
                    <th className="p-3 text-center">Kosong</th>
                    <th className="p-3 text-center font-bold">Nilai Final</th>
                    <th className="p-3 text-center">Status KKM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {(resultsData.peserta || []).map((p) => (
                    <tr key={p.sesi_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="p-3 font-semibold text-gray-900 dark:text-gray-100">{p.nama_siswa}</td>
                      <td className="p-3 text-center">{p.durasi_menit}m</td>
                      <td className="p-3 text-center text-emerald-600 font-bold">{p.jumlah_benar}</td>
                      <td className="p-3 text-center text-rose-600 font-bold">{p.jumlah_salah}</td>
                      <td className="p-3 text-center text-amber-600">{p.jumlah_kosong}</td>
                      <td className="p-3 text-center text-sm font-extrabold text-[#0E5C44] dark:text-emerald-400">{p.nilai_final}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.is_lulus
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {p.is_lulus ? 'LULUS' : 'TIDAK LULUS'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end border-t border-gray-100 dark:border-gray-800 pt-3">
              <button
                onClick={() => setShowResultsModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200"
              >
                Tutup Rekap Nilai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Option Modal */}
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Opsi Cetak Data Ujian Online (CBT)"
        subtitle="Pilih metode pencetakan atau unduh rekap jadwal CBT"
        onPrintClean={() => {
          printCleanTable({
            title: 'Laporan Jadwal Ujian Online (CBT)',
            data: dataList,
            columns: [
              { header: 'Nama Ujian', accessor: (row) => row.nama_ujian || row.judul || '-' },
              { header: 'Mata Pelajaran', accessor: (row) => row.mata_pelajaran?.name || row.subject || '-' },
              { header: 'Durasi', accessor: (row) => `${row.durasi_menit || 0} Menit` },
              { header: 'Status', accessor: (row) => row.status || 'Draft' },
            ],
          })
          setIsPrintModalOpen(false)
        }}
        onDownloadPdf={() => {
          downloadPdfTable({
            title: 'Laporan Jadwal Ujian Online (CBT)',
            data: dataList,
            columns: [
              { header: 'Nama Ujian', accessor: (row) => row.nama_ujian || row.judul || '-' },
              { header: 'Mata Pelajaran', accessor: (row) => row.mata_pelajaran?.name || row.subject || '-' },
              { header: 'Durasi', accessor: (row) => `${row.durasi_menit || 0} Menit` },
              { header: 'Status', accessor: (row) => row.status || 'Draft' },
            ],
            filename: `laporan_ujian_cbt_${new Date().toISOString().slice(0, 10)}.pdf`,
          })
          setIsPrintModalOpen(false)
        }}
      />

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        title="Import Data Ujian CBT"
        onImport={handleImport}
        templateFields={['nama_ujian', 'mata_pelajaran_id', 'kelas_id', 'durasi_menit', 'status']}
      />
      </motion.div>
    </div>
  )

  return <PageContainer maxW="7xl">{pageContent}</PageContainer>
}
