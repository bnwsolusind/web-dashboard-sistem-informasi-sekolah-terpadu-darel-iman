import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  FileText,
  Video,
  Link as LinkIcon,
  Layers,
  Plus,
  Search,
  Edit3,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  FileUp,
  Hash,
  Clock,
  ArrowUpDown,
  FileCode,
  ShieldCheck,
  Paperclip,
  RotateCcw,
  Printer,
} from 'lucide-react'
import { lmsMateriService } from '../services/lmsMateriService'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { useAuthStore } from '../stores/authStore'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import {
  MasterStatsGrid,
  MasterStatCard,
  MasterDataTable,
  SquircleActionButton,
  PrintOptionModal,
} from '../components/master-data'
import CsvImportModal from '../components/master-data/CsvImportModal'
import ActionDropdown from '../components/app/ActionDropdown'
import MateriMediaEmbed, { VideoEmbedPlayer, PdfDocumentViewer, parseVideoEmbed } from '../components/common/MateriMediaEmbed'

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
    blue: {
      card: 'border-blue-100 bg-blue-50/50 hover:border-blue-200 dark:border-blue-950/50 dark:bg-blue-950/20',
      title: 'text-blue-700 dark:text-blue-400',
      icon: 'text-blue-500',
      val: 'text-blue-600 dark:text-blue-300',
      sub: 'text-blue-600/70 dark:text-blue-400/70',
    },
    rose: {
      card: 'border-rose-100 bg-rose-50/50 hover:border-rose-200 dark:border-rose-950/50 dark:bg-rose-950/20',
      title: 'text-rose-700 dark:text-rose-400',
      icon: 'text-rose-500',
      val: 'text-rose-600 dark:text-rose-300',
      sub: 'text-rose-600/70 dark:text-rose-400/70',
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
      <p className={`mt-2 text-3xl font-extrabold ${t.val}`}>{value ?? 0}</p>
      {subtext && (
        <p className={`mt-1.5 text-[10px] font-bold ${t.sub} flex items-center gap-0.5`}>
          {subtext}
        </p>
      )}
    </motion.div>
  )
}

// TailGrids Core UI Components
import { Button } from '@/components/tailgrids/core/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/tailgrids/core/dialog'
import { AlertDialog } from '@/components/tailgrids/core/alert-dialog'
import { FieldDescription, FieldError, FieldLabel } from '@/components/tailgrids/core/field'
import { Input } from '@/components/tailgrids/core/input'
import { TextArea } from '@/components/tailgrids/core/text-area'
import { TextField } from '@/components/tailgrids/core/text-field'
import { Alert, AlertContent, AlertDescription, AlertIndicator, AlertTitle } from '@/components/tailgrids/core/alert'
import { Badge } from '@/components/tailgrids/core/badge'

export default function LmsMateriPage({ embedded = false, hideBreadcrumb = false, hidePageHeader = false, tabNav = null }) {
  const [dataMateri, setDataMateri] = useState([])
  const [optionsModul, setOptionsModul] = useState([])
  const [tipeOptions, setTipeOptions] = useState([
    { id: 'teks', nama: 'Teks / Ringkasan' },
    { id: 'dokumen', nama: 'Dokumen / PDF' },
    { id: 'video', nama: 'Video Pembelajaran' },
    { id: 'link', nama: 'Link Eksternal' },
    { id: 'presentasi', nama: 'Slide Presentasi' },
  ])
  const [stats, setStats] = useState({
    total_materi: 0,
    materi_aktif: 0,
    materi_dokumen: 0,
    materi_video: 0,
    materi_link: 0,
    total_modul_ajar: 0,
  })

  // User Auth & Teacher Scoping
  const user = useAuthStore((state) => state.user)

  const userRoles = useMemo(() => {
    if (!user?.roles) return []
    return user.roles.map((r) => (typeof r === 'string' ? r : r.name || r.role_name || ''))
  }, [user])

  const isGuru = useMemo(() => {
    const rList = userRoles.map((r) => r.toLowerCase())
    const mainRole = String(user?.role || '').toLowerCase()
    return (
      rList.some((r) => r.includes('guru') || r.includes('wali_kelas') || r.includes('wali kelas')) ||
      mainRole.includes('guru')
    )
  }, [userRoles, user?.role])

  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Filters & Pagination
  const [search, setSearch] = useState('')
  const [selectedModul, setSelectedModul] = useState('')
  const [selectedTipe, setSelectedTipe] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [denganSampah, setDenganSampah] = useState(false)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  })
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewItem, setPreviewItem] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  // Delete Dialog State (TailGrids AlertDialog)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  // KPI Modal State
  const [kpiModalOpen, setKpiModalOpen] = useState(false)
  const [kpiModalCategory, setKpiModalCategory] = useState({
    title: '',
    type: '',
    items: [],
    badgeColor: '',
  })

  // Form Data with new Pembelajaran inputs: ringkasan, catatan, bobot (menit)
  const [formData, setFormData] = useState({
    modul_ajar_id: '',
    judul: '',
    tipe: 'teks',
    ringkasan: '',
    isi: '',
    catatan: '',
    bobot: 45,
    file_url: '',
    video: '',
    link: '',
    urutan: 1,
    status: 'aktif',
  })

  const loadInitialOptionsAndStats = async () => {
    try {
      const [optRes, statsRes] = await Promise.all([
        lmsMateriService.getOptions(),
        lmsMateriService.getStats(),
      ])
      if (optRes?.data?.modul_ajar) {
        setOptionsModul(optRes.data.modul_ajar)
      }
      if (optRes?.data?.tipe_options) {
        setTipeOptions(optRes.data.tipe_options)
      }
      if (statsRes?.data) {
        setStats(statsRes.data)
      }
    } catch (err) {
      console.error('Gagal memuat opsi/statistik:', err)
    }
  }

  const fetchDaftarMateri = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const response = await lmsMateriService.getDaftar({
        page,
        search,
        modul_ajar_id: selectedModul,
        tipe: selectedTipe,
        status: selectedStatus,
        dengan_sampah: denganSampah ? 1 : 0,
        per_page: 15,
      })
      if (response?.data) {
        setDataMateri(response.data)
        if (response.meta) {
          setPagination({
            current_page: response.meta.current_page || 1,
            last_page: response.meta.last_page || 1,
            total: response.meta.total || 0,
            per_page: response.meta.per_page || 15,
          })
        }
        if (response.statistik) {
          setStats(response.statistik)
        }
      }
    } catch (err) {
      setErrorMsg('Gagal memuat daftar Materi Pembelajaran. Silakan coba lagi.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const computedStats = useMemo(() => {
    const total_materi = dataMateri.length
    const materi_dokumen = dataMateri.filter((m) => m.tipe === 'dokumen' || m.tipe === 'pdf' || !!m.file).length
    const materi_video = dataMateri.filter((m) => m.tipe === 'video' || !!m.video).length
    const materi_aktif = dataMateri.filter((m) => (m.status === 'aktif' || m.status === 'publish') && !m.deleted_at).length
    const uniqueModulIds = new Set(dataMateri.map((m) => m.modul_ajar_id || m.modul_ajar?.id).filter(Boolean))
    const total_modul_ajar = uniqueModulIds.size

    return {
      total_materi,
      materi_dokumen,
      materi_video,
      materi_aktif,
      total_modul_ajar,
    }
  }, [dataMateri])

  const handleExportCSV = () => {
    if (!dataMateri || dataMateri.length === 0) {
      alert('Tidak ada data Materi Pembelajaran untuk diekspor.')
      return
    }
    const headers = ['NO', 'URUTAN', 'JUDUL MATERI', 'MODUL AJAR', 'TIPE', 'RINGKASAN', 'BOBOT (MENIT)', 'STATUS']
    let csvStr = headers.join(',') + '\n'
    dataMateri.forEach((row, i) => {
      const line = [
        i + 1,
        `"${row.urutan || 1}"`,
        `"${(row.judul || '').replace(/"/g, '""')}"`,
        `"${(row.modul_ajar?.judul_modul || '').replace(/"/g, '""')}"`,
        `"${row.tipe || 'teks'}"`,
        `"${(row.ringkasan || '').replace(/"/g, '""')}"`,
        `"${row.bobot || 0}"`,
        `"${row.status || 'aktif'}"`,
      ].join(',')
      csvStr += line + '\n'
    })
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `export_materi_pembelajaran_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (rows) => {
    const failures = []
    let success = 0
    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index]
      try {
        const payload = new FormData()
        payload.append('modul_ajar_id', row.modul_ajar_id || optionsModul[0]?.id || '')
        payload.append('judul', row.judul)
        payload.append('tipe', row.tipe || 'teks')
        payload.append('ringkasan', row.ringkasan || '')
        payload.append('isi', row.isi || '')
        payload.append('catatan', row.catatan || '')
        payload.append('bobot', Number(row.bobot || 45))
        payload.append('video', row.video || '')
        payload.append('link', row.link || '')
        payload.append('urutan', Number(row.urutan || index + 1))
        payload.append('status', row.status || 'aktif')
        await lmsMateriService.simpan(payload)
        success += 1
      } catch (error) {
        failures.push(`baris ${index + 2}: ${error.response?.data?.message || 'gagal'}`)
      }
    }
    await fetchDaftarMateri()
    await loadInitialOptionsAndStats()
    setSuccessMsg(`${success} Materi berhasil diimpor${failures.length ? `, ${failures.length} gagal (${failures.slice(0, 3).join('; ')})` : '.'}`)
  }

  const handleOpenKpiModal = (categoryType) => {
    let filteredList = [...dataMateri]
    let title = ''
    let badgeColor = ''

    if (categoryType === 'total') {
      title = 'Total Materi Pembelajaran'
      badgeColor = 'bg-[#0E5C44]/10 text-[#0E5C44] dark:text-[#3FBF75]'
      filteredList = dataMateri
    } else if (categoryType === 'dokumen') {
      title = 'Daftar Materi Dokumen & PDF'
      badgeColor = 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
      filteredList = dataMateri.filter((m) => m.tipe === 'dokumen' || m.tipe === 'pdf' || !!m.file)
    } else if (categoryType === 'video') {
      title = 'Daftar Video Pembelajaran'
      badgeColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
      filteredList = dataMateri.filter((m) => m.tipe === 'video' || !!m.video)
    } else if (categoryType === 'aktif') {
      title = 'Daftar Materi Aktif'
      badgeColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
      filteredList = dataMateri.filter((m) => m.status === 'aktif' && !m.deleted_at)
    }

    setKpiModalCategory({
      title,
      type: categoryType,
      items: filteredList,
      badgeColor,
    })
    setKpiModalOpen(true)
  }

  const handlePrintKpiModal = () => {
    const rowsToPrint = Array.isArray(kpiModalCategory.items) ? kpiModalCategory.items : []
    printCleanTable({
      title: kpiModalCategory.title,
      subtitle: `Daftar Ringkasan Kategori ${kpiModalCategory.title}`,
      headers: ['NO', 'JUDUL MATERI', 'MODUL AJAR', 'TIPE', 'STATUS'],
      rows: rowsToPrint.map((row, i) => [
        i + 1,
        row.judul || '-',
        row.modul_ajar?.judul_modul || '-',
        row.tipe || '-',
        row.status === 'aktif' ? 'Aktif' : row.status === 'draft' ? 'Draft' : 'Nonaktif',
      ]),
    })
  }

  const handlePrintSingleMateri = (item) => {
    if (!item) return
    printCleanTable({
      title: `Detail Materi: ${item.judul}`,
      subtitle: `Modul Ajar: ${item.modul_ajar?.judul_modul || '-'}`,
      headers: ['PROPERTI MATERI', 'KETERANGAN / DOKUMEN'],
      rows: [
        ['Judul Materi', item.judul || '-'],
        ['Modul Ajar Induk', item.modul_ajar?.judul_modul || '-'],
        ['Tipe Materi', item.tipe || '-'],
        ['Urutan Materi', `#${item.urutan || 1}`],
        ['Estimasi Waktu Belajar', item.bobot ? `${item.bobot} Menit` : '-'],
        ['Status Publikasi', item.status === 'aktif' ? 'Aktif' : item.status === 'draft' ? 'Draft' : 'Nonaktif'],
        ['Ringkasan Singkat', item.ringkasan || '-'],
        ['Uraian Lengkap Materi', item.isi ? item.isi.replace(/<[^>]*>?/gm, '') : '-'],
        ['Catatan / Instruksi Guru', item.catatan || '-'],
        ['Tautan File Dokumen', item.file || '-'],
        ['Tautan Video Pembelajaran', item.video || '-'],
        ['Tautan Referensi Eksternal', item.link || '-'],
      ],
    })
  }

  useEffect(() => {
    loadInitialOptionsAndStats()
  }, [])

  useEffect(() => {
    fetchDaftarMateri()
  }, [page, search, selectedModul, selectedTipe, selectedStatus, denganSampah])

  const handleOpenCreateModal = () => {
    setEditingItem(null)
    setSelectedFile(null)
    setFormData({
      modul_ajar_id: optionsModul[0]?.id || '',
      judul: '',
      tipe: 'teks',
      ringkasan: '',
      isi: '',
      catatan: '',
      bobot: 45,
      file_url: '',
      video: '',
      link: '',
      urutan: dataMateri.length + 1,
      status: 'aktif',
    })
    setModalOpen(true)
  }

  const pageActions = (
    <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
      <SquircleActionButton variant="import" label="Import Data" onClick={() => setImportOpen(true)} />
      <SquircleActionButton variant="export" label="Export Data" onClick={handleExportCSV} />
      <SquircleActionButton variant="view" icon={Printer} label="Cetak Data" onClick={() => setIsPrintModalOpen(true)} />
      <SquircleActionButton variant="primary" label="Tambah Materi" onClick={() => handleOpenCreateModal()} />
    </div>
  )

  const handleOpenEditModal = (item) => {
    setEditingItem(item)
    setSelectedFile(null)
    setFormData({
      modul_ajar_id: item.modul_ajar_id || item.modul_ajar?.id || '',
      judul: item.judul || '',
      tipe: item.tipe || 'teks',
      ringkasan: item.ringkasan || '',
      isi: item.isi || '',
      catatan: item.catatan || '',
      bobot: item.bobot || 45,
      file_url: item.file_raw || '',
      video: item.video || '',
      link: item.link || '',
      urutan: item.urutan || 1,
      status: item.status || 'aktif',
    })
    setModalOpen(true)
  }

  const handleOpenPreviewModal = (item) => {
    setPreviewItem(item)
    setPreviewModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.modul_ajar_id) {
      setErrorMsg('Pilih Modul Ajar terlebih dahulu.')
      return
    }
    if (!formData.judul.trim()) {
      setErrorMsg('Judul Materi wajib diisi.')
      return
    }

    setFormSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const payload = new FormData()
      payload.append('modul_ajar_id', formData.modul_ajar_id)
      payload.append('judul', formData.judul)
      payload.append('tipe', formData.tipe)
      payload.append('ringkasan', formData.ringkasan || '')
      payload.append('isi', formData.isi || '')
      payload.append('catatan', formData.catatan || '')
      payload.append('bobot', formData.bobot || 0)
      payload.append('video', formData.video || '')
      payload.append('link', formData.link || '')
      payload.append('urutan', formData.urutan)
      payload.append('status', formData.status)

      if (selectedFile) {
        payload.append('file', selectedFile)
      } else if (formData.file_url) {
        payload.append('file_url', formData.file_url)
      }

      if (editingItem) {
        await lmsMateriService.ubah(editingItem.id, payload)
        setSuccessMsg('Materi Pembelajaran berhasil diperbarui!')
      } else {
        await lmsMateriService.simpan(payload)
        setSuccessMsg('Materi Pembelajaran baru berhasil ditambahkan!')
      }

      setModalOpen(false)
      fetchDaftarMateri()
      loadInitialOptionsAndStats()
    } catch (err) {
      const errRes = err.response?.data
      if (errRes?.message) {
        setErrorMsg(errRes.message)
      } else if (errRes?.errors) {
        const msgList = Object.values(errRes.errors).flat().join(' ')
        setErrorMsg(msgList)
      } else {
        setErrorMsg('Gagal menyimpan data Materi Pembelajaran.')
      }
    } finally {
      setFormSubmitting(false)
    }
  }

  const promptDelete = (item) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const executeDelete = async () => {
    if (!itemToDelete) return
    try {
      await lmsMateriService.hapus(itemToDelete.id)
      setSuccessMsg(`Materi "${itemToDelete.judul}" berhasil dihapus.`)
      fetchDaftarMateri()
      loadInitialOptionsAndStats()
    } catch (err) {
      setErrorMsg('Gagal menghapus Materi Pembelajaran.')
    } finally {
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  const handleRestore = async (id, judul) => {
    try {
      await lmsMateriService.pulihkan(id)
      setSuccessMsg(`Materi "${judul}" berhasil dipulihkan.`)
      fetchDaftarMateri()
      loadInitialOptionsAndStats()
    } catch (err) {
      setErrorMsg('Gagal memulihkan Materi Pembelajaran.')
    }
  }

  const getTipeBadge = (tipe) => {
    switch (tipe) {
      case 'video':
        return (
          <Badge color="rose" size="sm" prefixIcon={<Video className="w-3.5 h-3.5" />}>
            Video
          </Badge>
        )
      case 'dokumen':
      case 'pdf':
        return (
          <Badge color="blue" size="sm" prefixIcon={<FileText className="w-3.5 h-3.5" />}>
            Dokumen
          </Badge>
        )
      case 'link':
        return (
          <Badge color="orange" size="sm" prefixIcon={<LinkIcon className="w-3.5 h-3.5" />}>
            Link Eksternal
          </Badge>
        )
      case 'presentasi':
        return (
          <Badge color="purple" size="sm" prefixIcon={<Layers className="w-3.5 h-3.5" />}>
            Presentasi
          </Badge>
        )
      default:
        return (
          <Badge color="success" size="sm" prefixIcon={<BookOpen className="w-3.5 h-3.5" />}>
            Teks Ringkasan
          </Badge>
        )
    }
  }

  const getStatusBadge = (status, deletedAt) => {
    if (deletedAt) {
      return (
        <Badge color="error" size="sm">
          Terhapus
        </Badge>
      )
    }
    if (status === 'draft') {
      return (
        <Badge color="warning" size="sm">
          Draft
        </Badge>
      )
    }
    if (status === 'nonaktif') {
      return (
        <Badge color="gray" size="sm">
          Nonaktif
        </Badge>
      )
    }
    return (
      <Badge color="success" size="sm">
        Aktif
      </Badge>
    )
  }

  return (
    <PageContainer maxW="7xl">
      {!(embedded || hideBreadcrumb) && (
        <AppBreadcrumb items={[{ label: 'LMS & Akademik', href: '/dashboard' }, { label: 'Materi Pembelajaran' }]} />
      )}
      <div className="education-unit-page lms-materi-page space-y-6">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <PrintOptionModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title="Materi Pembelajaran"
          onPrint={() => {
            const rowsToPrint = Array.isArray(dataMateri) ? dataMateri : []
            printCleanTable({
              title: 'Laporan Data Materi Pembelajaran',
              subtitle: 'Daftar Materi Pembelajaran Sekolah Islam Terpadu',
              headers: ['NO', 'URUTAN', 'JUDUL MATERI', 'MODUL AJAR', 'TIPE', 'STATUS'],
              rows: rowsToPrint.map((row, i) => [
                i + 1,
                `#${row.urutan || 1}`,
                row.judul || '-',
                row.modul_ajar?.judul_modul || '-',
                row.tipe || '-',
                row.status === 'aktif' ? 'Aktif' : row.status === 'draft' ? 'Draft' : 'Nonaktif',
              ]),
            })
          }}
          onDownload={() => {
            const rowsToPrint = Array.isArray(dataMateri) ? dataMateri : []
            downloadPdfTable({
              title: 'Laporan Data Materi Pembelajaran',
              subtitle: 'Daftar Materi Pembelajaran Sekolah Islam Terpadu',
              headers: ['NO', 'URUTAN', 'JUDUL MATERI', 'MODUL AJAR', 'TIPE', 'STATUS'],
              rows: rowsToPrint.map((row, i) => [
                i + 1,
                `#${row.urutan || 1}`,
                row.judul || '-',
                row.modul_ajar?.judul_modul || '-',
                row.tipe || '-',
                row.status === 'aktif' ? 'Aktif' : row.status === 'draft' ? 'Draft' : 'Nonaktif',
              ]),
              filename: 'laporan_materi_pembelajaran.pdf',
            })
          }}
        />

        <CsvImportModal
          open={importOpen}
          onClose={() => setImportOpen(false)}
          title="Materi Pembelajaran"
          onImport={handleImport}
          columns={[
            { key: 'modul_ajar_id' },
            { key: 'judul', required: true, example: 'Pengenalan Tajwid' },
            { key: 'tipe', example: 'teks' },
            { key: 'ringkasan', example: 'Ringkasan singkat...' },
            { key: 'isi' },
            { key: 'catatan' },
            { key: 'bobot', example: '45' },
            { key: 'video', example: 'https://youtube.com/...' },
            { key: 'link' },
            { key: 'urutan', example: '1' },
            { key: 'status', example: 'aktif' },
          ]}
        />

        {/* HERO BANNER */}
        {!hidePageHeader && (
          <motion.div variants={itemVariants}>
            <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 mb-6">
              <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
              <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

              <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                    <BookOpen className="size-6 sm:size-7 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                        <Sparkles className="size-3 text-amber-300 animate-pulse" />
                        Modul &amp; Materi Pembelajaran
                      </span>
                    </div>
                    <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                      Materi Pembelajaran
                    </h1>
                    <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
                      Kelola dokumen, video, link referensi, ringkasan, dan teks bahan ajar terstruktur per Modul Ajar.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <SquircleActionButton
                    variant="primary"
                    icon={Plus}
                    label="Tambah Materi"
                    onClick={handleOpenCreateModal}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAILGRIDS NOTIFICATION ALERTS */}
        {errorMsg && (
          <Alert status="error" className="animate-fadeIn shadow-xs">
            <AlertIndicator />
            <AlertContent className="flex-1">
              <AlertTitle>Gagal Menyimpan / Memuat Data</AlertTitle>
              <AlertDescription>{errorMsg}</AlertDescription>
            </AlertContent>
            <button onClick={() => setErrorMsg('')} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </Alert>
        )}

        {successMsg && (
          <Alert status="success" className="animate-fadeIn shadow-xs">
            <AlertIndicator />
            <AlertContent className="flex-1">
              <AlertTitle>Berhasil</AlertTitle>
              <AlertDescription>{successMsg}</AlertDescription>
            </AlertContent>
            <button onClick={() => setSuccessMsg('')} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </Alert>
        )}

        {/* KPI STATS CARDS */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiTintedCard
            icon={BookOpen}
            label="Total Materi"
            value={computedStats.total_materi ?? 0}
            subtext={`Dari ${computedStats.total_modul_ajar ?? 0} Modul Ajar`}
            tone="emerald"
            onClick={() => handleOpenKpiModal('total')}
          />
          <KpiTintedCard
            icon={FileText}
            label="Dokumen & PDF"
            value={computedStats.materi_dokumen ?? 0}
            subtext="Bahan ajar unduhan"
            tone="blue"
            onClick={() => handleOpenKpiModal('dokumen')}
          />
          <KpiTintedCard
            icon={Video}
            label="Video Pembelajaran"
            value={computedStats.materi_video ?? 0}
            subtext="Video tutorial & link"
            tone="rose"
            onClick={() => handleOpenKpiModal('video')}
          />
          <KpiTintedCard
            icon={ShieldCheck}
            label="Materi Aktif"
            value={computedStats.materi_aktif ?? 0}
            subtext="Siap diakses siswa"
            tone="emerald"
            onClick={() => handleOpenKpiModal('aktif')}
          />
        </motion.div>

        {/* Tab Navigation Card (below KPI grid, above filter) */}
        {tabNav && (
          <motion.div variants={itemVariants}>
            {typeof tabNav === 'function' ? tabNav() : tabNav}
          </motion.div>
        )}

        {/* SEARCH & FILTER BAR (2-Row Layout) */}
        <motion.div variants={itemVariants} className="rounded-[18px] border border-slate-200/80 bg-white p-4.5 shadow-sm dark:border-slate-700/80 dark:bg-[#1B2433] space-y-3.5">
          {/* Baris 1: Field Pencarian Full-Width */}
          <div className="w-full">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari judul materi, ringkasan, atau modul ajar..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="h-12 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-700 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100"
              />
            </div>
          </div>

          {/* Baris 2: Dropdown Filter & Sortir */}
          <div className="flex flex-wrap items-center gap-2.5 w-full">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">
              Filter &amp; Sortir:
            </span>

            <select
              value={selectedModul}
              onChange={(e) => {
                setSelectedModul(e.target.value)
                setPage(1)
              }}
              className="h-12 rounded-[14px] border border-slate-200 bg-white px-3.5 text-xs font-semibold dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100"
            >
              <option value="">-- Semua Modul Ajar --</option>
              {optionsModul.map((mod) => (
                <option key={mod.id} value={mod.id}>
                  {mod.kode_modul ? `[${mod.kode_modul}] ` : ''}{mod.judul_modul}
                </option>
              ))}
            </select>

            <select
              value={selectedTipe}
              onChange={(e) => {
                setSelectedTipe(e.target.value)
                setPage(1)
              }}
              className="h-12 rounded-[14px] border border-slate-200 bg-white px-3.5 text-xs font-semibold dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100"
            >
              <option value="">-- Semua Tipe --</option>
              {tipeOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nama}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value)
                setPage(1)
              }}
              className="h-12 rounded-[14px] border border-slate-200 bg-white px-3.5 text-xs font-semibold dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100"
            >
              <option value="">-- Semua Status --</option>
              <option value="aktif">Aktif</option>
              <option value="draft">Draft</option>
              <option value="nonaktif">Nonaktif</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setDenganSampah(!denganSampah)
                setPage(1)
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 h-12 rounded-[14px] border text-xs font-semibold transition ${
                denganSampah
                  ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
                  : 'bg-white border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>{denganSampah ? 'Dengan Sampah' : 'Tanpa Sampah'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSearch('')
                setSelectedModul('')
                setSelectedTipe('')
                setSelectedStatus('')
                setDenganSampah(false)
                setPage(1)
              }}
              className="inline-flex items-center gap-1.5 px-4 h-12 rounded-[14px] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Reset Filter"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </motion.div>

        {/* DATA TABLE CONTAINER */}
        <motion.div variants={itemVariants}>
        <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]" aria-labelledby="materi-table-title">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-5 py-4 sm:px-6 md:px-8 dark:border-emerald-800/40 dark:bg-gradient-to-r dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-transparent">
            <div>
              <h2 id="materi-table-title" className="text-base font-extrabold text-slate-900 dark:text-white">Data Materi Pembelajaran</h2>
              <p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">Daftar bahan ajar terstruktur per modul ajar.</p>
            </div>
            {pageActions}
          </div>

          <MasterDataTable className="!rounded-none !border-0 !shadow-none">
            <table className="w-full table-fixed text-left text-sm border-collapse">
              <thead className="bg-gradient-to-r from-emerald-600 to-teal-600 font-extrabold text-white uppercase text-[11px] tracking-wider border-b border-emerald-700">
                <tr>
                  <th className="w-[6%] bg-gradient-to-r from-emerald-600 to-teal-600 px-5 sm:px-6 md:px-8 py-3.5 text-center text-white font-extrabold uppercase tracking-wider">No</th>
                  <th className="w-[8%] bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-3.5 text-center text-white font-extrabold uppercase tracking-wider">Urutan</th>
                  <th className="w-[34%] bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-3.5 text-white font-extrabold uppercase tracking-wider">Judul Materi</th>
                  <th className="hidden w-[24%] bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-3.5 text-white font-extrabold uppercase tracking-wider md:table-cell">Modul Ajar &amp; Mapel</th>
                  <th className="hidden w-[12%] bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-3.5 text-center text-white font-extrabold uppercase tracking-wider lg:table-cell">Tipe</th>
                  <th className="hidden w-[10%] bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-3.5 text-center text-white font-extrabold uppercase tracking-wider sm:table-cell">Status</th>
                  <th className="hidden w-[16%] bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-3.5 text-center text-white font-extrabold uppercase tracking-wider sm:table-cell">Lampiran / Link</th>
                  <th className="w-[10%] bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-3.5 text-center text-white font-extrabold uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-6 mx-auto"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-8 mx-auto"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-36"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 mx-auto"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 mx-auto"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12 mx-auto"></div></td>
                      <td className="py-4 px-4"><div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-10 mx-auto"></div></td>
                    </tr>
                  ))
                ) : dataMateri.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="font-semibold text-base">Belum Ada Materi Pembelajaran</p>
                      <p className="text-xs mt-1">Klik "Tambah Materi" untuk menambahkan bahan ajar baru.</p>
                    </td>
                  </tr>
                ) : (
                  dataMateri.map((item, idx) => (
                    <tr
                      key={item.id}
                      onClick={() => handleOpenPreviewModal(item)}
                      className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-5 sm:px-6 md:px-8 text-center font-medium text-slate-400">
                        {(pagination.current_page - 1) * pagination.per_page + idx + 1}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                          #{item.urutan}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-900 dark:text-white hover:text-[#0E5C44] transition-colors">
                              {item.judul}
                            </p>
                            {item.bobot > 0 && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-[#0E5C44] dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                                <Clock className="w-3 h-3" /> {item.bobot} mnt
                              </span>
                            )}
                          </div>
                          {item.ringkasan ? (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 font-medium">
                              {item.ringkasan}
                            </p>
                          ) : item.isi ? (
                            <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5">
                              {item.isi.replace(/<[^>]*>?/gm, '')}
                            </p>
                          ) : null}
                        </div>
                      </td>
                      <td className="hidden py-3.5 px-3 md:table-cell">
                        <div className="text-xs">
                          <p className="font-semibold text-slate-700 dark:text-slate-300">
                            {item.modul_ajar?.judul_modul || 'Modul Ajar'}
                          </p>
                          <p className="text-slate-400">
                            {item.modul_ajar?.kode_modul || ''} {item.subject?.nama_mapel ? `• ${item.subject.nama_mapel}` : ''}
                          </p>
                        </div>
                      </td>
                      <td className="hidden py-3.5 px-3 text-center lg:table-cell">
                        {getTipeBadge(item.tipe)}
                      </td>
                      <td className="hidden py-3.5 px-3 text-center sm:table-cell">
                        {getStatusBadge(item.status, item.deleted_at)}
                      </td>
                      <td className="hidden py-3.5 px-3 text-center sm:table-cell" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          {item.file && (
                            <div className="relative group/tooltip">
                              <a
                                href={item.file}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 hover:bg-blue-100 transition-colors flex items-center justify-center"
                                aria-label="Unduh Dokumen PDF"
                              >
                                <FileText className="w-4 h-4" />
                              </a>
                              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/tooltip:flex flex-col items-center pointer-events-none z-30">
                                <span className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-semibold shadow-md">
                                  Unduh Dokumen PDF
                                </span>
                                <div className="w-2 h-2 -mt-1 rotate-45 bg-slate-900" />
                              </div>
                            </div>
                          )}
                          {item.video && (
                            <div className="relative group/tooltip">
                              <a
                                href={item.video}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 hover:bg-rose-100 transition-colors flex items-center justify-center"
                                aria-label="Tonton Video Pembelajaran"
                              >
                                <Video className="w-4 h-4" />
                              </a>
                              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/tooltip:flex flex-col items-center pointer-events-none z-30">
                                <span className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-semibold shadow-md">
                                  Tonton Video Pembelajaran
                                </span>
                                <div className="w-2 h-2 -mt-1 rotate-45 bg-slate-900" />
                              </div>
                            </div>
                          )}
                          {item.link && (
                            <div className="relative group/tooltip">
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 hover:bg-amber-100 transition-colors flex items-center justify-center"
                                aria-label="Buka Link Eksternal"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/tooltip:flex flex-col items-center pointer-events-none z-30">
                                <span className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-semibold shadow-md">
                                  Buka Link Eksternal
                                </span>
                                <div className="w-2 h-2 -mt-1 rotate-45 bg-slate-900" />
                              </div>
                            </div>
                          )}
                          {!item.file && !item.video && !item.link && (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenPreviewModal(item)}
                            title="Lihat Detail Materi"
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span className="hidden xl:inline">Lihat</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            title="Edit Data Materi"
                            className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/50"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span className="hidden xl:inline">Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteConfirm(item)}
                            title="Hapus Data Materi"
                            aria-label="Hapus Data Materi"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </MasterDataTable>

          {/* PAGINATION CONTAINER */}
          {pagination.last_page > 1 && (
            <div className="w-full border-t border-slate-200/80 px-4 py-3.5 sm:px-6 md:px-8 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500">
              <span>
                Menampilkan halaman <strong>{pagination.current_page}</strong> dari <strong>{pagination.last_page}</strong> ({pagination.total} materi)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= pagination.last_page}
                  onClick={() => setPage(page + 1)}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </section>
        </motion.div>

        {/* KPI DETAIL MODAL (TailGrids Dialog) */}
        {kpiModalOpen && (
          <Dialog isOpen={kpiModalOpen} onOpenChange={setKpiModalOpen} showCloseButton={false} className="max-w-4xl">
            <DialogHeader className="bg-gradient-to-r from-[#0E5C44] to-[#1E8E5A] -mx-6 -mt-6 p-5 text-white rounded-t-2xl">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                    <BookOpen className="w-5 h-5 text-emerald-200" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold text-white">{kpiModalCategory.title}</DialogTitle>
                    <DialogDescription className="text-xs text-emerald-100 mt-0.5">
                      Menampilkan {kpiModalCategory.items.length} materi terdaftar
                    </DialogDescription>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setKpiModalOpen(false)}
                  className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Tutup Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </DialogHeader>

            <DialogBody className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {kpiModalCategory.items.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-semibold text-sm">Tidak ada data materi dalam kategori ini.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4 text-center w-12">No</th>
                        <th className="py-3 px-4">Judul Materi</th>
                        <th className="py-3 px-4">Modul Ajar</th>
                        <th className="py-3 px-4">Tipe</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                      {kpiModalCategory.items.map((item, idx) => (
                        <tr
                          key={item.id || idx}
                          onClick={() => {
                            setKpiModalOpen(false)
                            handleOpenPreviewModal(item)
                          }}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-4 text-center text-slate-400 text-xs font-medium">{idx + 1}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">{item.judul}</td>
                          <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                            {item.modul_ajar?.judul_modul || '-'}
                          </td>
                          <td className="py-3 px-4">{getTipeBadge(item.tipe)}</td>
                          <td className="py-3 px-4 text-center">{getStatusBadge(item.status, item.deleted_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </DialogBody>

            <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <SquircleActionButton
                variant="view"
                icon={Printer}
                label="Cetak Data Ringkasan"
                onClick={handlePrintKpiModal}
              />
              <Button
                variant="ghost"
                onClick={() => setKpiModalOpen(false)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold"
              >
                Tutup
              </Button>
            </DialogFooter>
          </Dialog>
        )}

        {/* FORM MODAL (CREATE / EDIT) - TailGrids Dialog benchmarked from Perencanaan CP */}
        {modalOpen && (
          <Dialog isOpen={modalOpen} onOpenChange={setModalOpen} showCloseButton={false} className="max-w-2xl">
            <DialogHeader className="bg-gradient-to-r from-[#0E5C44] to-[#1E8E5A] -mx-6 -mt-6 p-5 text-white rounded-t-2xl">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                    <BookOpen className="w-5 h-5 text-emerald-200" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold text-white">
                      {editingItem ? 'Edit Materi Pembelajaran' : 'Tambah Materi Pembelajaran Baru'}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-emerald-100 mt-0.5">
                      Tautkan materi ke Modul Ajar dan lengkapi instruksi &amp; bahan ajar
                    </DialogDescription>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Tutup Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </DialogHeader>

            <DialogBody className="py-4 space-y-4 max-h-[75vh] overflow-y-auto">
              <form id="form-materi-pembelajaran" onSubmit={handleSubmit} className="space-y-4">
                {/* Modul Ajar Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Modul Ajar Induk (Relasi 1:N) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="modul_ajar_id"
                    required
                    value={formData.modul_ajar_id}
                    onChange={(e) => setFormData({ ...formData, modul_ajar_id: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44] dark:text-slate-100 transition-colors"
                  >
                    <option value="">-- Pilih Modul Ajar --</option>
                    {optionsModul.map((mod) => (
                      <option key={mod.id} value={mod.id}>
                        {mod.kode_modul ? `[${mod.kode_modul}] ` : ''}{mod.judul_modul}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Judul & Urutan */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Judul Materi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="judul"
                      type="text"
                      required
                      placeholder="Contoh: Pengenalan Al-Qur'an dan Hukum Tajwid"
                      value={formData.judul}
                      onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44] dark:text-slate-100 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Urutan</label>
                    <input
                      id="urutan"
                      type="number"
                      min="1"
                      value={formData.urutan}
                      onChange={(e) => setFormData({ ...formData, urutan: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44] dark:text-slate-100 transition-colors"
                    />
                  </div>
                </div>

                {/* Tipe & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Tipe Materi</label>
                    <select
                      id="tipe"
                      value={formData.tipe}
                      onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44] dark:text-slate-100 transition-colors"
                    >
                      {tipeOptions.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Status Aktivasi</label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44] dark:text-slate-100 transition-colors"
                    >
                      <option value="aktif">Aktif</option>
                      <option value="draft">Draft</option>
                      <option value="nonaktif">Nonaktif</option>
                    </select>
                  </div>
                </div>

                {/* Ringkasan Singkat & Estimasi Waktu Belajar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Ringkasan Singkat Materi</label>
                    <input
                      id="ringkasan"
                      type="text"
                      placeholder="Ringkasan atau poin-poin utama materi..."
                      value={formData.ringkasan}
                      onChange={(e) => setFormData({ ...formData, ringkasan: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44] dark:text-slate-100 transition-colors"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Tampil pada ikhtisar daftar materi.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Estimasi Belajar (Menit)</label>
                    <input
                      id="bobot"
                      type="number"
                      min="0"
                      step="5"
                      placeholder="45"
                      value={formData.bobot}
                      onChange={(e) => setFormData({ ...formData, bobot: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44] dark:text-slate-100 transition-colors"
                    />
                  </div>
                </div>

                {/* Uraian Lengkap Materi */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Isi / Uraian Materi Lengkap</label>
                  <textarea
                    id="isi"
                    rows={4}
                    placeholder="Tulis uraian materi lengkap, pembahasan, atau petunjuk pembelajaran..."
                    value={formData.isi}
                    onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44] dark:text-slate-100 transition-colors"
                  />
                </div>

                {/* Catatan Guru & Instruksi Khusus */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Catatan Guru &amp; Instruksi Khusus</label>
                  <textarea
                    id="catatan"
                    rows={2}
                    placeholder="Catatan tambahan, instruksi pengerjaan, atau pesan penting untuk peserta didik..."
                    value={formData.catatan}
                    onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44] dark:text-slate-100 transition-colors"
                  />
                </div>

                {/* File Attachment (Upload & Online URL) */}
                <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4 dark:border-sky-950 dark:bg-sky-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-sky-900 dark:text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                      Lampiran Dokumen / Modul PDF (Embed View)
                    </label>
                    <span className="text-[10px] font-semibold text-slate-400">PDF, DOCX, PPTX (Maks 20MB)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Pilihan 1: Unggah Berkas PDF / Dokumen
                      </label>
                      <input
                        id="file"
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,image/*"
                        onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-700 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Pilihan 2: Atau Tautan Dokumen PDF Online
                      </label>
                      <input
                        id="file_url"
                        type="url"
                        placeholder="https://.../dokumen-materi.pdf"
                        value={formData.file_url}
                        onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-sky-600 dark:text-slate-100 transition-colors"
                      />
                    </div>
                  </div>

                  {(editingItem?.file || formData.file_url || selectedFile) && (
                    <div className="flex items-center gap-2 text-xs text-sky-700 dark:text-sky-300 font-medium pt-1">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        {selectedFile
                          ? `Berkas lokal: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(0)} KB)`
                          : formData.file_url
                          ? `Tautan PDF: ${formData.file_url}`
                          : `Tersimpan: ${editingItem?.file}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Video Pembelajaran & External Link */}
                <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 dark:border-rose-950 dark:bg-rose-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-rose-900 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      Video Pembelajaran (Embed Otomatis)
                    </label>
                    <span className="text-[10px] font-semibold text-slate-400">YouTube, Vimeo, atau MP4</span>
                  </div>

                  <div>
                    <input
                      id="video"
                      type="url"
                      placeholder="Contoh: https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                      value={formData.video}
                      onChange={(e) => setFormData({ ...formData, video: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-600 dark:text-slate-100 transition-colors"
                    />
                    {formData.video && (
                      <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-rose-700 dark:text-rose-300">
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {parseVideoEmbed(formData.video)?.type === 'youtube'
                            ? 'YouTube Video terdeteksi — otomatis di-embed pada pemutar materi siswa & guru.'
                            : parseVideoEmbed(formData.video)?.type === 'vimeo'
                            ? 'Vimeo Video terdeteksi — otomatis di-embed.'
                            : 'Tautan video valid — akan disematkan di frame player interaktif.'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Link Referensi Eksternal */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Link Referensi Tambahan (Opsional)
                  </label>
                  <input
                    id="link"
                    type="url"
                    placeholder="https://pustaka.kemdikbud.go.id/..."
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44] dark:text-slate-100 transition-colors"
                  />
                </div>
              </form>
            </DialogBody>

            <DialogFooter className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                form="form-materi-pembelajaran"
                disabled={formSubmitting}
                className="inline-flex items-center gap-2 bg-[#0E5C44] hover:bg-[#1E8E5A] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition disabled:opacity-50"
              >
                {formSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {editingItem ? 'Simpan Perubahan' : 'Tambah Materi'}
                  </>
                )}
              </button>
            </DialogFooter>
          </Dialog>
        )}

        {/* PREVIEW DETAIL MODAL - TailGrids Dialog */}
        {previewModalOpen && previewItem && (
          <Dialog isOpen={previewModalOpen} onOpenChange={setPreviewModalOpen} showCloseButton={false} className="max-w-4xl">
            <DialogHeader className="bg-gradient-to-r from-[#0E5C44] to-[#1E8E5A] -mx-6 -mt-6 p-5 text-white rounded-t-2xl">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                    <BookOpen className="w-5 h-5 text-emerald-200" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold text-white">
                      {previewItem.judul}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-emerald-100 mt-0.5">
                      Modul: {previewItem.modul_ajar?.judul_modul || '-'}
                    </DialogDescription>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewModalOpen(false)}
                  className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Tutup Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </DialogHeader>

            <DialogBody className="py-4 space-y-4 text-sm text-slate-700 dark:text-slate-300 max-h-[78vh] overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                <span>Tipe Materi: <strong>{previewItem.tipe}</strong></span>
                <span>Urutan ke-<strong>{previewItem.urutan}</strong></span>
                {previewItem.bobot > 0 && (
                  <span className="inline-flex items-center gap-1 font-semibold text-[#0E5C44] dark:text-emerald-400">
                    <Clock className="w-3.5 h-3.5" /> {previewItem.bobot} Menit
                  </span>
                )}
                {getStatusBadge(previewItem.status, previewItem.deleted_at)}
              </div>

              {previewItem.ringkasan && (
                <div className="p-3.5 rounded-xl border border-emerald-200/80 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800/60">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#0E5C44] dark:text-emerald-400 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Ringkasan Singkat Materi
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{previewItem.ringkasan}</p>
                </div>
              )}

              {/* Video Pembelajaran Tersemat (Video Embed Player) */}
              {previewItem.video && (
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" /> Pemutar Video Pembelajaran (Embed)
                  </h4>
                  <VideoEmbedPlayer
                    url={previewItem.video}
                    title={`Video: ${previewItem.judul}`}
                  />
                </div>
              )}

              {/* Dokumen PDF Tersemat (Interactive PDF Viewer) */}
              {previewItem.file && (
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Pratinjau Dokumen PDF / Modul Digital
                  </h4>
                  <PdfDocumentViewer
                    url={previewItem.file}
                    title={`Dokumen: ${previewItem.judul}`}
                    height="500px"
                  />
                </div>
              )}

              {previewItem.isi && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Uraian Materi Lengkap</h4>
                  <div className="whitespace-pre-line leading-relaxed text-slate-800 dark:text-slate-200">{previewItem.isi}</div>
                </div>
              )}

              {previewItem.catatan && (
                <div className="p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800/60">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5" /> Catatan &amp; Instruksi Guru
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{previewItem.catatan}</p>
                </div>
              )}

              {previewItem.link && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="font-semibold text-amber-900 dark:text-amber-200 text-xs">Tautan Referensi Eksternal</p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 truncate max-w-xs">{previewItem.link}</p>
                    </div>
                  </div>
                  <a
                    href={previewItem.link}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-lg bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 transition-colors"
                  >
                    Kunjungi Link
                  </a>
                </div>
              )}
            </DialogBody>

            <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <SquircleActionButton
                  variant="view"
                  icon={Printer}
                  label="Cetak Detail Materi"
                  onClick={() => handlePrintSingleMateri(previewItem)}
                />
                <SquircleActionButton
                  variant="edit"
                  label="Edit Materi"
                  icon={Edit3}
                  onClick={() => {
                    setPreviewModalOpen(false)
                    handleOpenEditModal(previewItem)
                  }}
                />
                <SquircleActionButton
                  variant="delete"
                  label="Hapus Materi"
                  icon={Trash2}
                  onClick={() => {
                    setPreviewModalOpen(false)
                    promptDelete(previewItem)
                  }}
                />
                <a
                  href={`/dashboard/lms/media-pembelajaran?materi_id=${previewItem.id}`}
                  className="inline-flex items-center"
                >
                  <SquircleActionButton
                    variant="import"
                    label="Kelola Media Pembelajaran"
                    icon={Paperclip}
                  />
                </a>
              </div>
              <Button
                variant="ghost"
                onClick={() => setPreviewModalOpen(false)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
              >
                Tutup
              </Button>
            </DialogFooter>
          </Dialog>
        )}

        {/* DELETE CONFIRMATION MODAL - TailGrids AlertDialog benchmarked from Perencanaan CP */}
        {deleteDialogOpen && (
          <AlertDialog isOpen={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogHeader className="bg-gradient-to-r from-rose-600 to-rose-700 -mx-6 -mt-6 p-5 text-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                  <Trash2 className="w-5 h-5 text-rose-100" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-white">Konfirmasi Hapus Data</DialogTitle>
                  <DialogDescription className="text-xs text-rose-100 mt-0.5">
                    Tindakan ini akan memindahkan data ke tempat sampah (soft delete)
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <DialogBody className="py-5 text-sm text-slate-600 dark:text-slate-300">
              Apakah Anda yakin ingin menghapus materi <strong>"{itemToDelete?.judul}"</strong>? Data akan dipindahkan ke tempat sampah dan dapat dipulihkan kapan saja.
            </DialogBody>

            <DialogFooter className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition"
              >
                <Trash2 className="w-4 h-4" />
                Hapus Materi
              </button>
            </DialogFooter>
          </AlertDialog>
        )}
        </motion.div>
      </div>
    </PageContainer>
  )
}

