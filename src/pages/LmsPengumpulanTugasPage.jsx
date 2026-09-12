import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UploadCloud,
  FileText,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Award,
  BookOpen,
  Eye,
  ExternalLink,
  File,
  AlertTriangle,
  FileCheck,
  Edit3,
  Trash2,
  Users,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { lmsPengumpulanTugasService } from '../services/lmsPengumpulanTugasService'
import { api } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { useUnitStore } from '../stores/unitStore'
import {
  AppPageHeader,
  KpiCard,
  AppFilterBar,
  AppSearch,
  ActionDropdown,
  AppModal,
  AppDrawer,
  PersonAvatar,
  PersonIdentityCell,
} from '../components/app'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import {
  MasterDataTable,
  SquircleActionButton,
  PrintOptionModal,
} from '../components/master-data'
import CsvImportModal from '../components/master-data/CsvImportModal'
import { RotateCcw, Printer, Search } from 'lucide-react'

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
    teal: {
      card: 'border-teal-100 bg-teal-50/50 hover:border-teal-200 dark:border-teal-950/50 dark:bg-teal-950/20',
      title: 'text-teal-700 dark:text-teal-400',
      icon: 'text-teal-500',
      val: 'text-teal-600 dark:text-teal-300',
      sub: 'text-teal-600/70 dark:text-teal-400/70',
    },
    blue: {
      card: 'border-blue-100 bg-blue-50/50 hover:border-blue-200 dark:border-blue-950/50 dark:bg-blue-950/20',
      title: 'text-blue-700 dark:text-blue-400',
      icon: 'text-blue-500',
      val: 'text-blue-600 dark:text-blue-300',
      sub: 'text-blue-600/70 dark:text-blue-400/70',
    },
    amber: {
      card: 'border-amber-100 bg-amber-50/50 hover:border-amber-200 dark:border-amber-950/50 dark:bg-amber-950/20',
      title: 'text-amber-700 dark:text-amber-400',
      icon: 'text-amber-500',
      val: 'text-amber-600 dark:text-amber-300',
      sub: 'text-amber-600/70 dark:text-amber-400/70',
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

export default function LmsPengumpulanTugasPage({ embedded, hidePageHeader, tabNav }) {
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

  const [dataPengumpulan, setDataPengumpulan] = useState([])
  const [options, setOptions] = useState({
    penugasan: [],
    siswa: [],
    status: [
      { id: 'belum', label: 'Belum Kumpul' },
      { id: 'dikumpulkan', label: 'Dikumpulkan' },
      { id: 'terlambat', label: 'Terlambat' },
      { id: 'dinilai', label: 'Sudah Dinilai' },
      { id: 'revisi', label: 'Perlu Revisi' },
    ],
  })

  const [stats, setStats] = useState({
    total: 0,
    dikumpulkan: 0,
    terlambat: 0,
    dinilai: 0,
    belum_dinilai: 0,
    revisi: 0,
  })

  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Filters & Pagination
  const [search, setSearch] = useState('')
  const [selectedPenugasan, setSelectedPenugasan] = useState('')
  const [selectedSiswa, setSelectedSiswa] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  })

  // Print & Import State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  const handleExportCSV = () => {
    if (!dataPengumpulan.length) return
    const headers = ['ID', 'Siswa', 'Penugasan', 'Tanggal Kumpul', 'Nilai', 'Status']
    const rows = dataPengumpulan.map((item) => [
      item.id,
      `"${(item.siswa?.nama || '').replace(/"/g, '""')}"`,
      `"${(item.penugasan?.judul || '').replace(/"/g, '""')}"`,
      item.tanggal_pengumpulan || '-',
      item.nilai ?? '-',
      item.status || '-',
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `pengumpulan_tugas_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImport = (file) => {
    Swal.fire({
      icon: 'success',
      title: 'Import Berhasil',
      text: `File ${file.name} telah diproses.`,
      confirmButtonColor: '#0E5C44',
    })
  }

  // Modal Form State (Submit / Grade / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  const [formData, setFormData] = useState({
    penugasan_id: '',
    siswa_id: '',
    file: '',
    link: '',
    catatan: '',
    nilai: '',
    status: 'dikumpulkan',
  })

  // Detail Drawer State
  const [selectedDetail, setSelectedDetail] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Hover & Row Detail Modal State
  const [rowDetailItem, setRowDetailItem] = useState(null)
  const [showRowDetailModal, setShowRowDetailModal] = useState(false)

  const fetchOptionsAndStats = async () => {
    try {
      let penugasanOptions = []
      let siswaOptions = []

      try {
        const optRes = await lmsPengumpulanTugasService.getOptions()
        const optData = optRes?.data || optRes
        if (optData) {
          if (Array.isArray(optData.penugasan) && optData.penugasan.length > 0) {
            penugasanOptions = optData.penugasan
          }
          if (Array.isArray(optData.siswa) && optData.siswa.length > 0) {
            siswaOptions = optData.siswa
          }
        }
      } catch (errOpt) {
        console.warn('Error from main options endpoint:', errOpt)
      }

      // Fallback for Penugasan if empty
      if (penugasanOptions.length === 0) {
        try {
          const penRes = await api.get('/lms/penugasan', { params: { per_page: 100 } })
          const penList = penRes?.data?.data || penRes?.data || []
          if (Array.isArray(penList)) {
            penugasanOptions = penList.map((p) => ({
              id: p.id,
              label: p.judul_tugas || p.judul || 'Penugasan',
              subject: p.subject?.nama_mapel || p.subject?.name || (typeof p.subject === 'string' ? p.subject : null),
              kelas: p.kelas?.nama_kelas || p.kelas?.kode_kelas || (typeof p.kelas === 'string' ? p.kelas : null),
            }))
          }
        } catch (errPen) {
          console.warn('Fallback penugasan error:', errPen)
        }
      }

      // Fallback for Siswa if empty
      if (siswaOptions.length === 0) {
        try {
          const stdRes = await api.get('/students', { params: { per_page: 100 } })
          const stdList = stdRes?.data?.data || stdRes?.data || []
          if (Array.isArray(stdList)) {
            siswaOptions = stdList.map((s) => ({
              id: s.id,
              label: s.full_name || s.name || s.nama_lengkap || 'Siswa',
              nisn: s.nisn || s.metadata?.nisn || null,
            }))
          }
        } catch (errStd) {
          console.warn('Fallback student error:', errStd)
        }
      }

      setOptions((prev) => ({
        ...prev,
        penugasan: penugasanOptions,
        siswa: siswaOptions,
      }))

      try {
        const statRes = await lmsPengumpulanTugasService.getStats()
        if (statRes && (statRes.data || statRes.total !== undefined)) {
          setStats(statRes.data || statRes)
        }
      } catch (errStat) {
        console.warn('Error fetching stats:', errStat)
      }
    } catch (err) {
      console.error('Error in fetchOptionsAndStats:', err)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const params = {
        page,
        per_page: 15,
        search: search || undefined,
        penugasan_id: selectedPenugasan || undefined,
        siswa_id: selectedSiswa || undefined,
        status: selectedStatus || undefined,
      }
      if (userUnitId) params.unit_pendidikan_id = userUnitId
      if (activeUnit) params.jenjang = activeUnit

      const res = await lmsPengumpulanTugasService.getDaftar(params)
      if (res && res.data) {
        let rawData = Array.isArray(res.data) ? res.data : (res.data?.data || [])
        let filteredData = rawData.filter((item) => {
          if (!item) return false
          const itemUnitId = item.unit_pendidikan_id || item.unit_id || item.siswa?.unit_pendidikan_id || item.penugasan?.unit_pendidikan_id
          if (userUnitId && itemUnitId) return String(itemUnitId) === String(userUnitId)
          return true
        })
        setDataPengumpulan(filteredData)
        if (res.meta) {
          setPagination({
            current_page: res.meta.current_page || 1,
            last_page: res.meta.last_page || 1,
            total: res.meta.total || filteredData.length,
            per_page: res.meta.per_page || 15,
          })
        }
      }
    } catch (err) {
      console.error('Gagal memuat data pengumpulan tugas:', err)
      setErrorMsg('Gagal mengambil data pengumpulan tugas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOptionsAndStats()
  }, [])

  useEffect(() => {
    fetchData()
  }, [page, selectedPenugasan, selectedSiswa, selectedStatus])

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault()
    setPage(1)
    fetchData()
  }

  const handleResetFilter = () => {
    setSearch('')
    setSelectedPenugasan('')
    setSelectedSiswa('')
    setSelectedStatus('')
    setPage(1)
  }

  const handleOpenCreateModal = () => {
    setEditId(null)
    setFormData({
      penugasan_id: '',
      siswa_id: '',
      file: '',
      link: '',
      catatan: '',
      nilai: '',
      status: 'dikumpulkan',
    })
    if (options.penugasan.length === 0 || options.siswa.length === 0) {
      fetchOptionsAndStats()
    }
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (item) => {
    setEditId(item.id)
    setFormData({
      penugasan_id: item.penugasan_id || '',
      siswa_id: item.siswa_id || '',
      file: item.file || item.file_path || '',
      link: item.link || item.url_link || '',
      catatan: item.catatan || item.catatan_guru || item.jawaban_teks || '',
      nilai: item.nilai !== null && item.nilai !== undefined ? item.nilai : (item.nilai_guru ?? ''),
      status: item.status || 'dikumpulkan',
    })
    setIsModalOpen(true)
  }

  const handleSubmitForm = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const payload = {
        penugasan_id: formData.penugasan_id,
        siswa_id: formData.siswa_id,
        file: formData.file,
        link: formData.link,
        catatan: formData.catatan,
        nilai: formData.nilai !== '' ? parseFloat(formData.nilai) : null,
        status: formData.status,
      }

      if (editId) {
        await lmsPengumpulanTugasService.update(editId, payload)
        setSuccessMsg('Pengumpulan tugas & penilaian berhasil diperbarui.')
      } else {
        await lmsPengumpulanTugasService.create(payload)
        setSuccessMsg('Submission pengumpulan tugas baru berhasil ditambahkan.')
      }

      setIsModalOpen(false)
      fetchData()
      fetchOptionsAndStats()
    } catch (err) {
      console.error(err)
      const errRes = err.response?.data?.message || 'Gagal menyimpan pengumpulan tugas.'
      setErrorMsg(errRes)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id, namaSiswa) => {
    const result = await Swal.fire({
      title: 'Hapus Submission?',
      text: `Apakah Anda yakin ingin menghapus data pengumpulan tugas dari ${namaSiswa || 'Siswa'}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0E5C44',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-white',
      },
    })

    if (result.isConfirmed) {
      try {
        await lmsPengumpulanTugasService.delete(id)
        Swal.fire({
          title: 'Berhasil!',
          text: 'Data pengumpulan tugas berhasil dihapus.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        })
        fetchData()
        fetchOptionsAndStats()
      } catch (err) {
        console.error(err)
        Swal.fire('Error!', 'Gagal menghapus data pengumpulan tugas.', 'error')
      }
    }
  }

  const handleOpenDetail = (item) => {
    setSelectedDetail(item)
    setIsDetailOpen(true)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'dinilai':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Sudah Dinilai
          </span>
        )
      case 'dikumpulkan':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900">
            <UploadCloud className="w-3.5 h-3.5" />
            Dikumpulkan
          </span>
        )
      case 'terlambat':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900">
            <Clock className="w-3.5 h-3.5" />
            Terlambat
          </span>
        )
      case 'revisi':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900">
            <AlertTriangle className="w-3.5 h-3.5" />
            Perlu Revisi
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5" />
            Belum Kumpul
          </span>
        )
    }
  }

  const activeFilterCount =
    (selectedPenugasan ? 1 : 0) + (selectedSiswa ? 1 : 0) + (selectedStatus ? 1 : 0) + (search ? 1 : 0)

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
        label="Input / Kumpul Tugas"
        onClick={handleOpenCreateModal}
      />
    </div>
  )

  const pageContent = (
    <div className="education-unit-page lms-pengumpulan-page space-y-6">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
      {/* Master Canonical Page Header (Hidden when embedded) */}
      {!embedded && !hidePageHeader && (
        <motion.div variants={itemVariants}>
        <AppPageHeader
          variant="brand"
          icon={UploadCloud}
          eyebrow="LMS Pelaksanaan Pembelajaran"
          title="Pengumpulan Tugas Siswa"
          description="Kelola submission tugas siswa, riwayat pengumpulan file & link, serta proses koreksi dan penilaian hasil kerja secara terpadu."
          actions={
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#0E5C44] font-semibold text-sm shadow-lg hover:bg-emerald-50 transition-all duration-200 active:scale-95 dark:bg-slate-900 dark:text-[#3FBF75] dark:hover:bg-slate-800"
            >
              <Plus className="w-4 h-4" />
              Input / Kumpul Tugas
            </button>
          }
        />
        </motion.div>
      )}

      {/* Alert Notifications */}
      {successMsg && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium dark:bg-emerald-950/60 dark:border-emerald-900 dark:text-emerald-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium dark:bg-rose-950/60 dark:border-rose-900 dark:text-rose-300">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-600 hover:text-rose-800 dark:hover:text-rose-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI STATS CARDS */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTintedCard
          icon={UploadCloud}
          label="Total Pengumpulan"
          value={stats.total || 0}
          subtext="Seluruh submission tugas"
          tone="emerald"
          onClick={() => {
            setSelectedStatus('')
            setPage(1)
          }}
        />
        <KpiTintedCard
          icon={Award}
          label="Sudah Dinilai"
          value={stats.dinilai || 0}
          subtext="Telah diberi nilai oleh guru"
          tone="teal"
          onClick={() => {
            setSelectedStatus('dinilai')
            setPage(1)
          }}
        />
        <KpiTintedCard
          icon={Clock}
          label="Belum Dinilai"
          value={stats.dikumpulkan || stats.belum_dinilai || 0}
          subtext="Menunggu pemeriksaan guru"
          tone="blue"
          onClick={() => {
            setSelectedStatus('dikumpulkan')
            setPage(1)
          }}
        />
        <KpiTintedCard
          icon={AlertTriangle}
          label="Terlambat Kumpul"
          value={stats.terlambat || 0}
          subtext="Melewati deadline"
          tone="amber"
          onClick={() => {
            setSelectedStatus('terlambat')
            setPage(1)
          }}
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
            placeholder="Cari siswa, tugas, catatan, berkas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-xs font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100"
          />
        </div>

        {/* Baris 2: Dropdown Filters & Reset Button */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <select
              value={selectedPenugasan}
              onChange={(e) => {
                setSelectedPenugasan(e.target.value)
                setPage(1)
              }}
              className="h-12 rounded-[14px] border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100"
            >
              <option value="">Semua Penugasan</option>
              {options.penugasan.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>

            <select
              value={selectedSiswa}
              onChange={(e) => {
                setSelectedSiswa(e.target.value)
                setPage(1)
              }}
              className="h-12 rounded-[14px] border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100"
            >
              <option value="">Semua Siswa</option>
              {options.siswa.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value)
                setPage(1)
              }}
              className="h-12 rounded-[14px] border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100"
            >
              <option value="">Semua Status</option>
              {options.status.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>

            {(search || selectedPenugasan || selectedSiswa || selectedStatus) && (
              <button
                type="button"
                onClick={handleResetFilter}
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
              Daftar Pengumpulan & Submission Tugas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pemeriksaan dan penilaian lembar kerja siswa
            </p>
          </div>
          {pageActions}
        </div>

        <MasterDataTable className="!rounded-none !border-0 !shadow-none">

        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-3 dark:text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#0E5C44] dark:text-[#3FBF75]" />
            <p className="text-sm font-medium">Memuat data pengumpulan tugas...</p>
          </div>
        ) : dataPengumpulan.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3 dark:text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-base font-semibold text-slate-700 dark:text-slate-200">Belum ada pengumpulan tugas</p>
            <p className="text-sm text-slate-400 dark:text-slate-500">Silakan tambahkan submission atau ubah kata kunci filter Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[340px] pb-12">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-400">
                  <th className="py-3.5 px-4">Siswa</th>
                  <th className="py-3.5 px-4">Penugasan & Mapel</th>
                  <th className="py-3.5 px-4">File / Link</th>
                  <th className="py-3.5 px-4">Waktu Kumpul</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Nilai & Catatan</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
                {dataPengumpulan.map((item) => (
                  <tr
                    key={item.id}
                    className="group relative hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={(e) => {
                      if (e.target.closest('button, a, [data-no-rowclick]')) return
                      setRowDetailItem(item)
                      setShowRowDetailModal(true)
                    }}
                  >
                    <td className="py-3.5 px-4 relative">
                      {/* Hover Card */}
                      <div className="pointer-events-none absolute left-4 top-full mt-1.5 z-50 w-60 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out">
                        <div className="bg-white dark:bg-[#1B2433] rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl p-3 space-y-1.5">
                          <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-100 dark:border-slate-700">
                            <UploadCloud className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <p className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1">{item.siswa?.nama || 'Siswa'}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Tugas</p>
                              <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 line-clamp-1">{item.penugasan?.judul || '-'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Nilai</p>
                              <p className="text-[11px] font-bold text-emerald-600">{item.nilai ?? 'Belum dinilai'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Status</p>
                              <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 capitalize">{item.status || '-'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Waktu</p>
                              <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{item.waktu_kumpul || '-'}</p>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700">Klik baris untuk detail lengkap</p>
                        </div>
                        <div className="absolute -top-1.5 left-6 border-4 border-transparent border-b-white dark:border-b-[#1B2433] drop-shadow" />
                      </div>

                      <PersonIdentityCell
                        name={item.siswa?.nama || 'Siswa'}
                        subtitle={item.siswa?.nisn ? `NISN: ${item.siswa.nisn}` : 'NISN -'}
                        avatarSrc={item.siswa?.foto || item.siswa?.photo_url || item.siswa?.avatar_url}
                      />
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {item.penugasan?.judul || item.penugasan?.judul_tugas || 'Penugasan'}
                      </div>
                      <div className="text-xs text-[#0E5C44] font-medium dark:text-[#3FBF75]">
                        {item.penugasan?.subject || 'Mata Pelajaran'} • {item.penugasan?.kelas || 'Kelas'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 text-xs">
                        {item.file || item.file_path ? (
                          <a
                            href={item.file || item.file_path}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-900 font-medium hover:underline dark:text-emerald-400 dark:hover:text-emerald-300"
                          >
                            <File className="w-3.5 h-3.5" />
                            Berkas Lampiran
                          </a>
                        ) : null}

                        {item.link || item.url_link ? (
                          <a
                            href={item.link || item.url_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Link Tautan External
                          </a>
                        ) : null}

                        {!item.file && !item.file_path && !item.link && !item.url_link && (
                          <span className="text-slate-400 dark:text-slate-500 italic">Hanya Jawaban Teks</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                      <div>{item.waktu_kumpul || '-'}</div>
                      {item.waktu_kumpul_formatted && (
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">{item.waktu_kumpul_formatted}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(item.status)}
                    </td>

                    <td className="py-3.5 px-4">
                      {item.nilai !== null && item.nilai !== undefined ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-[#0E5C44] font-bold text-sm dark:bg-emerald-950/80 dark:text-[#3FBF75]">
                            {item.nilai} / 100
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500 italic">Belum Dinilai</span>
                      )}
                      {item.catatan && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 italic">
                          "{item.catatan}"
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <ActionDropdown
                        onView={() => handleOpenDetail(item)}
                        onEdit={() => handleOpenEditModal(item)}
                        onDelete={() => handleDelete(item.id, item.siswa?.nama)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && dataPengumpulan.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div>
              Halaman <span className="font-semibold text-slate-700 dark:text-slate-200">{pagination.current_page}</span> dari{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">{pagination.last_page}</span> (Total {pagination.total} data)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.current_page <= 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.current_page >= pagination.last_page}
                onClick={() => setPage((prev) => prev + 1)}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        </MasterDataTable>
      </section>
      </motion.div>

      {/* ROW DETAIL MODAL POPUP — Pengumpulan Tugas */}
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
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{rowDetailItem.siswa?.nama || 'Siswa'}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {rowDetailItem.penugasan?.judul || 'Penugasan'} · {rowDetailItem.status || '-'}
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
              {/* Status badge */}
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(rowDetailItem.status)}
                {rowDetailItem.nilai !== null && rowDetailItem.nilai !== undefined && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <Award className="w-3 h-3" />
                    Nilai: {rowDetailItem.nilai} / 100
                  </span>
                )}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 col-span-2">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Penugasan</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">{rowDetailItem.penugasan?.judul || '-'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Kelas</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">{rowDetailItem.penugasan?.kelas || '-'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Waktu Kumpul</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">{rowDetailItem.waktu_kumpul || '-'}</p>
                </div>
              </div>

              {/* Catatan */}
              {rowDetailItem.catatan && (
                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider mb-1">Catatan Guru</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{rowDetailItem.catatan}</p>
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
                    handleDelete(rowDetailItem.id, rowDetailItem.siswa?.nama)
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus
                </button>
                <button
                  onClick={() => {
                    setShowRowDetailModal(false)
                    handleOpenEditModal(rowDetailItem)
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

      {/* Modal Form for Create / Edit / Grade using AppModal */}
      <AppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editId ? 'Koreksi & Form Penilaian' : 'Input Submission Pengumpulan Tugas'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4 text-sm">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Penugasan <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.penugasan_id}
              onChange={(e) => setFormData({ ...formData, penugasan_id: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E5C44]/20 focus:border-[#0E5C44] dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            >
              <option value="">-- Pilih Penugasan --</option>
              {options.penugasan.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label || p.judul_tugas || p.judul} {p.subject ? `(${p.subject})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Siswa <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.siswa_id}
              onChange={(e) => setFormData({ ...formData, siswa_id: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E5C44]/20 focus:border-[#0E5C44] dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            >
              <option value="">-- Pilih Siswa --</option>
              {options.siswa.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label || s.full_name || s.name || s.nama_lengkap} {s.nisn ? `(${s.nisn})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status Submission
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E5C44]/20 focus:border-[#0E5C44] dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                {options.status.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nilai (0 - 100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="Contoh: 90"
                value={formData.nilai}
                onChange={(e) => setFormData({ ...formData, nilai: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E5C44]/20 focus:border-[#0E5C44] dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              URL / Path File Lampiran (file)
            </label>
            <input
              type="text"
              placeholder="https://drive.google.com/... atau /storage/tugas/file.pdf"
              value={formData.file}
              onChange={(e) => setFormData({ ...formData, file: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E5C44]/20 focus:border-[#0E5C44] dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Link Tautan Eksternal (link)
            </label>
            <input
              type="url"
              placeholder="https://github.com/... atau https://docs.google.com/..."
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E5C44]/20 focus:border-[#0E5C44] dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan / Ulasan Guru & Teks Jawaban (catatan)
            </label>
            <textarea
              rows="3"
              placeholder="Tuliskan catatan apresiasi, saran perbaikan, atau rangkuman jawaban siswa..."
              value={formData.catatan}
              onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E5C44]/20 focus:border-[#0E5C44] dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            ></textarea>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-5 py-2.5 bg-[#0E5C44] text-white rounded-xl font-semibold shadow-lg hover:bg-[#1E8E5A] transition-all flex items-center gap-2 disabled:opacity-50 dark:bg-[#3FBF75] dark:text-slate-900"
            >
              {formLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
              {editId ? 'Simpan Koreksi' : 'Kumpulkan Tugas'}
            </button>
          </div>
        </form>
      </AppModal>

      {/* Detail Drawer using AppDrawer */}
      <AppDrawer
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Detail Pengumpulan Tugas"
      >
        {selectedDetail && (
          <div className="space-y-6 text-sm">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Identitas Siswa</p>
              <PersonIdentityCell
                name={selectedDetail.siswa?.nama || 'Siswa'}
                subtitle={`NISN: ${selectedDetail.siswa?.nisn || '-'}`}
                avatarSrc={selectedDetail.siswa?.foto || selectedDetail.siswa?.photo_url || selectedDetail.siswa?.avatar_url}
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Penugasan</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedDetail.penugasan?.judul || 'Judul Penugasan'}</p>
              <p className="text-xs text-[#0E5C44] dark:text-[#3FBF75] font-medium">
                {selectedDetail.penugasan?.subject} • Kelas {selectedDetail.penugasan?.kelas}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50/50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Nilai Akhir</p>
                <p className="text-xl font-bold text-[#0E5C44] dark:text-[#3FBF75] mt-0.5">
                  {selectedDetail.nilai !== null && selectedDetail.nilai !== undefined ? `${selectedDetail.nilai} / 100` : 'Belum Dinilai'}
                </p>
              </div>
              <div className="bg-blue-50/50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-100 dark:border-blue-900">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Status</p>
                <div className="mt-1">{getStatusBadge(selectedDetail.status)}</div>
              </div>
            </div>

            {selectedDetail.jawaban_teks && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Teks Jawaban Siswa</p>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 whitespace-pre-line">
                  {selectedDetail.jawaban_teks}
                </div>
              </div>
            )}

            {selectedDetail.file || selectedDetail.file_path ? (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Berkas File</p>
                <a
                  href={selectedDetail.file || selectedDetail.file_path}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 font-medium hover:bg-emerald-100 transition-colors"
                >
                  <File className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="flex-1 truncate">{selectedDetail.file || selectedDetail.file_path}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ) : null}

            {selectedDetail.link || selectedDetail.url_link ? (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tautan External</p>
                <a
                  href={selectedDetail.link || selectedDetail.url_link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/60 rounded-xl border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 font-medium hover:bg-blue-100 transition-colors"
                >
                  <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="flex-1 truncate">{selectedDetail.link || selectedDetail.url_link}</span>
                </a>
              </div>
            ) : null}

            {selectedDetail.catatan && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Catatan Guru / Penilai</p>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/60 rounded-xl border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 italic">
                  "{selectedDetail.catatan}"
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Waktu Kumpul:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{selectedDetail.waktu_kumpul || '-'}</span>
              </div>
              {selectedDetail.penilai && (
                <div className="flex justify-between">
                  <span>Penilai (Guru):</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{selectedDetail.penilai.nama}</span>
                </div>
              )}
            </div>

            <div className="pt-4">
              <button
                onClick={() => {
                  setIsDetailOpen(false)
                  handleOpenEditModal(selectedDetail)
                }}
                className="w-full py-2.5 bg-[#0E5C44] text-white rounded-xl font-semibold hover:bg-[#1E8E5A] transition-colors flex items-center justify-center gap-2 dark:bg-[#3FBF75] dark:text-slate-900"
              >
                <FileCheck className="w-4 h-4" />
                Koreksi / Beri Nilai
              </button>
            </div>
          </div>
        )}
      </AppDrawer>

      {/* Print Option Modal */}
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Opsi Cetak Data Pengumpulan"
        subtitle="Pilih metode pencetakan atau unduh dokumen pengumpulan tugas"
        onPrintClean={() => {
          printCleanTable({
            title: 'Laporan Pengumpulan & Submission Tugas',
            data: dataPengumpulan,
            columns: [
              { header: 'Siswa', accessor: (row) => row.siswa?.nama || '-' },
              { header: 'Penugasan', accessor: (row) => row.penugasan?.judul || '-' },
              { header: 'Waktu Kumpul', accessor: (row) => row.waktu_kumpul || '-' },
              { header: 'Status', accessor: (row) => row.status || '-' },
              { header: 'Nilai', accessor: (row) => row.nilai ?? '-' },
            ],
          })
          setIsPrintModalOpen(false)
        }}
        onDownloadPdf={() => {
          downloadPdfTable({
            title: 'Laporan Pengumpulan & Submission Tugas',
            data: dataPengumpulan,
            columns: [
              { header: 'Siswa', accessor: (row) => row.siswa?.nama || '-' },
              { header: 'Penugasan', accessor: (row) => row.penugasan?.judul || '-' },
              { header: 'Waktu Kumpul', accessor: (row) => row.waktu_kumpul || '-' },
              { header: 'Status', accessor: (row) => row.status || '-' },
              { header: 'Nilai', accessor: (row) => row.nilai ?? '-' },
            ],
            filename: `laporan_pengumpulan_tugas_${new Date().toISOString().slice(0, 10)}.pdf`,
          })
          setIsPrintModalOpen(false)
        }}
      />

      <CsvImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        title="Import Data Pengumpulan"
        onImport={handleImport}
        templateFields={['siswa_id', 'penugasan_id', 'jawaban_teks', 'nilai', 'status']}
      />
      </motion.div>
    </div>
  )

  return <PageContainer maxW="7xl">{pageContent}</PageContainer>
}
