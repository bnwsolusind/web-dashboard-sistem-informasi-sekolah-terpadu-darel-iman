import React, { useState, useEffect, useMemo } from 'react'
import CustomSelect from '@/components/ui/CustomSelect'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Megaphone,
  Plus,
  RefreshCw,
  Search,
  Building2,
  Calendar,
  BookOpen,
  Award,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Globe,
} from 'lucide-react'
import { Download as Download1, Upload as Upload1, ArrowRightLeft as ArrowBothDirectionHorizontal2 } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { usePengaturanStore } from '../stores/pengaturanStore'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import ActionDropdown from '../components/app/ActionDropdown'
import CsvImportModal from '../components/master-data/CsvImportModal'
import { educationUnitService } from '../services/educationUnitService'
import { dashboardPemantauanService } from '../services/dashboardPemantauanService'

import { Button } from '../components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { Pagination } from '@/components/ui/pagination'
import {
  TableRoot,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { MasterStatsGrid, MasterStatCard } from '../components/master-data'
import { SmartScrollFab } from '../components/common'

const STORAGE_KEY = 'school_news_announcements_db'

function KpiTintedCard({ icon: Icon, label, subtext, value, tone = 'emerald', onClick }) {
  const tones = {
    emerald: {
      card: 'border-2 border-emerald-300/90 bg-gradient-to-br from-emerald-100/90 via-teal-50/70 to-emerald-50/40 hover:border-emerald-500 dark:border-emerald-700/90 dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 shadow-xs shadow-emerald-500/10',
      title: 'text-emerald-900 dark:text-emerald-300 font-extrabold',
      icon: 'text-emerald-600 dark:text-emerald-400',
      val: 'text-emerald-800 dark:text-emerald-200',
      sub: 'text-emerald-800/90 dark:text-emerald-300/90',
    },
    blue: {
      card: 'border-blue-200/80 bg-gradient-to-br from-blue-50/90 via-sky-50/40 to-white hover:border-blue-300 dark:border-blue-800/60 dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-900',
      title: 'text-blue-800 dark:text-blue-300',
      icon: 'text-blue-600 dark:text-blue-400',
      val: 'text-blue-700 dark:text-blue-200',
      sub: 'text-blue-700/80 dark:text-blue-400/80',
    },
    amber: {
      card: 'border-amber-200/80 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-white hover:border-amber-300 dark:border-amber-800/60 dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900',
      title: 'text-amber-800 dark:text-amber-300',
      icon: 'text-amber-600 dark:text-amber-400',
      val: 'text-amber-700 dark:text-amber-200',
      sub: 'text-amber-700/80 dark:text-amber-400/80',
    },
    purple: {
      card: 'border-purple-200/80 bg-gradient-to-br from-purple-50/90 via-indigo-50/40 to-white hover:border-purple-300 dark:border-purple-800/60 dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-900',
      title: 'text-purple-800 dark:text-purple-300',
      icon: 'text-purple-600 dark:text-purple-400',
      val: 'text-purple-700 dark:text-purple-200',
      sub: 'text-purple-700/80 dark:text-purple-400/80',
    },
  }

  const t = tones[tone] || tones.emerald

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={`text-left rounded-2xl border ${t.card} p-5 shadow-xs transition-all hover:shadow-md cursor-pointer group`}
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
    </motion.button>
  )
}

const DEFAULT_BASE_UNITS = [
  { id: 'all', name: 'Seluruh Unit (Yayasan)', code: 'YAYASAN' },
]

const CATEGORY_OPTIONS = [
  { id: 'PPDB', label: 'PPDB & Pendaftaran', color: 'amber', icon: Megaphone },
  { id: 'Akademik', label: 'Pengumuman Akademik', color: 'sky', icon: BookOpen },
  { id: 'Prestasi', label: 'Capaian Prestasi', color: 'purple', icon: Award },
  { id: 'Kegiatan', label: 'Kegiatan Sekolah', color: 'emerald', icon: Calendar },
  { id: 'Umum', label: 'Informasi Umum', color: 'cyan', icon: FileText },
]

export default function NewsManagementPage() {
  const user = useAuthStore((state) => state.user)
  const pengaturan = usePengaturanStore((state) => state.pengaturan)

  // 1. Dynamic Units State (Fetched from Database)
  const [unitOptions, setUnitOptions] = useState(DEFAULT_BASE_UNITS)

  useEffect(() => {
    let cancelled = false
    educationUnitService.getDaftar()
      .then((res) => {
        if (cancelled) return
        const list = res?.data?.data || res?.data || res || []
        if (Array.isArray(list) && list.length > 0) {
          const mappedUnits = [
            { id: 'all', name: 'Seluruh Unit (Yayasan)', code: 'YAYASAN' },
            ...list.map((u) => ({
              id: String(u.id || u.code || u.name),
              name: u.name || u.nama || 'Unit Sekolah',
              code: u.code || u.level || 'UNIT',
            })),
          ]
          setUnitOptions(mappedUnits)
        }
      })
      .catch((err) => {
        console.warn('Load units from database failed, using fallback:', err)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // 2. Role Scope Calculation
  const roleAnalysis = useMemo(() => {
    if (!user) return { isGlobalAdmin: true, assignedUnitId: 'all', assignedUnitName: 'Seluruh Unit (Yayasan)' }

    const roles = user.roles ? (Array.isArray(user.roles) ? user.roles.map(r => typeof r === 'string' ? r : r.name) : [user.roles]) : []
    const roleNames = roles.map(r => String(r).toLowerCase())

    const isGlobal = roleNames.some(r =>
      r.includes('super') || r.includes('yayasan') || r.includes('pengurus') || r.includes('ketua') || r.includes('admin')
    )

    const uCode = user.unit_code || user.unit_name || user.unit || ''
    const defaultUnit = unitOptions.find((u) => u.id !== 'all')
    let assignedId = defaultUnit?.id || ''
    let assignedName = defaultUnit?.name || (uCode ? String(uCode) : 'Unit Sekolah')

    const matchedFromDb = unitOptions.find(u =>
      u.id !== 'all' && (
        String(u.name).toLowerCase().includes(String(uCode).toLowerCase()) ||
        String(u.code).toLowerCase().includes(String(uCode).toLowerCase())
      )
    )

    if (matchedFromDb) {
      assignedId = matchedFromDb.id
      assignedName = matchedFromDb.name
    }

    return {
      isGlobalAdmin: isGlobal,
      assignedUnitId: isGlobal ? 'all' : assignedId,
      assignedUnitName: isGlobal ? 'Seluruh Unit (Yayasan)' : assignedName,
    }
  }, [user, unitOptions])

  // State List Berita
  const [newsList, setNewsList] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters State
  const [filters, setFilters] = useState({
    search: '',
    unit_id: 'all',
    kategori: 'all',
    status: 'all',
    page: 1,
    per_page: 10,
  })

  // Modals State
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [detailItem, setDetailItem] = useState(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState(null)

  // KPI Cards Drill-Down Modal State
  const [activeKpiModal, setActiveKpiModal] = useState(null) // null | 'total' | 'published' | 'draft' | 'global'
  const [kpiModalSearch, setKpiModalSearch] = useState('')

  // Form State
  const [form, setForm] = useState({
    judul: '',
    kategori: 'PPDB',
    target_unit: 'all',
    target_unit_name: 'Seluruh Unit (Yayasan)',
    ringkasan: '',
    isi: '',
    tanggal_publikasi: new Date().toISOString().slice(0, 10),
    status: 'Dipublikasikan',
    gambar_url: '',
  })

  // Load News from Database API & LocalStorage Cache
  const loadNews = async () => {
    setLoading(true)
    try {
      // 1. Try DB API Endpoint
      const res = await dashboardPemantauanService.getDaftarPengumumanSekolah({ per_page: 100 }).catch(() => null)
      const rawApiList = res?.data?.data || res?.data || res || []

      if (Array.isArray(rawApiList) && rawApiList.length > 0) {
        const normalized = rawApiList.map((item) => {
          const extra = item.data_tambahan || {}
          return {
            id: item.id,
            judul: item.judul_pengumuman || item.judul || 'Pengumuman Sekolah',
            isi: item.isi_pengumuman || item.isi || '',
            kategori: extra.kategori || 'PPDB',
            target_unit: extra.unit_id || 'all',
            target_unit_name: extra.unit_name || 'Seluruh Unit (Yayasan)',
            ringkasan: extra.ringkasan || (item.isi_pengumuman || '').slice(0, 120),
            tanggal_publikasi: item.mulai_tampil ? String(item.mulai_tampil).slice(0, 10) : new Date().toISOString().slice(0, 10),
            status: item.status_aktif ? 'Dipublikasikan' : 'Draf',
            penerbit: item.penerbit || 'Pengelola Sekolah',
            penerbit_role: item.penerbit_role || 'Pengurus',
            gambar_url: extra.gambar_url || '',
          }
        })

        setNewsList(normalized)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
      } else {
        const stored = localStorage.getItem(STORAGE_KEY)
        const parsed = stored ? JSON.parse(stored) : []
        setNewsList(Array.isArray(parsed) ? parsed : [])
      }
    } catch {
      const stored = localStorage.getItem(STORAGE_KEY)
      const parsed = stored ? JSON.parse(stored) : []
      setNewsList(Array.isArray(parsed) ? parsed : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNews()
  }, [])

  const saveNewsListToCache = (updated) => {
    setNewsList(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (e) {
      console.warn('LocalStorage save error:', e)
    }
  }

  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  const handleExportNews = () => {
    try {
      const headers = ['ID', 'Judul', 'Kategori', 'Target Unit', 'Status', 'Tanggal Publikasi', 'Penulis']
      const rows = filteredList.map((item) => [
        `"${item.id || ''}"`,
        `"${(item.judul || '').replace(/"/g, '""')}"`,
        `"${(item.kategori || '').replace(/"/g, '""')}"`,
        `"${(item.target_unit_name || item.target_unit || 'Seluruh Unit').replace(/"/g, '""')}"`,
        `"${item.status || 'draft'}"`,
        `"${item.tanggal_publikasi || item.created_at || '-'}"`,
        `"${(item.penulis || '-').replace(/"/g, '""')}"`,
      ])
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `Daftar_Berita_Informasi_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Export news error:', e)
    }
  }

  const handleImportNews = (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) return
    const importedItems = rows.map((r, idx) => ({
      id: 'news-imp-' + Date.now() + '-' + idx,
      judul: r.judul || r.title || 'Informasi Baru',
      kategori: r.kategori || r.category || 'Umum',
      target_unit: r.target_unit || 'all',
      target_unit_name: r.target_unit_name || 'Seluruh Unit',
      status: r.status || 'published',
      tanggal_publikasi: r.tanggal_publikasi || new Date().toISOString().slice(0, 10),
      ringkasan: r.ringkasan || r.summary || (r.isi || '').slice(0, 100),
      isi: r.isi || r.content || r.ringkasan || '',
      penulis: r.penulis || user?.name || 'Administrator',
    }))
    const updated = [...importedItems, ...newsList]
    saveNewsListToCache(updated)
    setIsImportModalOpen(false)
  }

  // Filtered List based on Search & Role Scoping
  const filteredList = useMemo(() => {
    return newsList.filter((item) => {
      if (!roleAnalysis.isGlobalAdmin) {
        const itemUnit = (item.target_unit || '').toLowerCase()
        const assignedUnit = roleAnalysis.assignedUnitId.toLowerCase()
        if (itemUnit !== 'all' && itemUnit !== assignedUnit) {
          return false
        }
      }

      if (filters.unit_id !== 'all' && item.target_unit !== filters.unit_id) {
        return false
      }

      if (filters.kategori !== 'all' && item.kategori !== filters.kategori) {
        return false
      }

      if (filters.status !== 'all' && item.status !== filters.status) {
        return false
      }

      if (filters.search.trim()) {
        const q = filters.search.toLowerCase()
        const j = (item.judul || '').toLowerCase()
        const r = (item.ringkasan || '').toLowerCase()
        const i = (item.isi || '').toLowerCase()
        if (!j.includes(q) && !r.includes(q) && !i.includes(q)) return false
      }

      return true
    })
  }, [newsList, filters, roleAnalysis])

  // Filtered List for KPI Cards Drill-Down Modal
  const filteredKpiNewsItems = useMemo(() => {
    if (!activeKpiModal) return []
    let base = filteredList
    if (activeKpiModal === 'published') {
      base = base.filter((item) => item.status === 'Dipublikasikan')
    } else if (activeKpiModal === 'draft') {
      base = base.filter((item) => item.status === 'Draf')
    } else if (activeKpiModal === 'global') {
      base = base.filter((item) => item.target_unit === 'all')
    }

    if (kpiModalSearch.trim()) {
      const q = kpiModalSearch.toLowerCase()
      base = base.filter(
        (item) =>
          (item.judul || '').toLowerCase().includes(q) ||
          (item.ringkasan || '').toLowerCase().includes(q) ||
          (item.kategori || '').toLowerCase().includes(q) ||
          (item.target_unit_name || '').toLowerCase().includes(q)
      )
    }

    return base
  }, [activeKpiModal, filteredList, kpiModalSearch])

  // Pagination Slice
  const totalPages = Math.ceil(filteredList.length / filters.per_page) || 1
  const paginatedList = useMemo(() => {
    const start = (filters.page - 1) * filters.per_page
    return filteredList.slice(start, start + filters.per_page)
  }, [filteredList, filters.page, filters.per_page])

  // Stats Calculation
  const stats = useMemo(() => {
    const total = filteredList.length
    const published = filteredList.filter(i => i.status === 'Dipublikasikan').length
    const draft = filteredList.filter(i => i.status === 'Draf').length
    const globalUnit = filteredList.filter(i => i.target_unit === 'all').length

    return { total, published, draft, globalUnit }
  }, [filteredList])

  // Form Handlers
  const handleOpenAdd = () => {
    setEditingItem(null)
    setForm({
      judul: '',
      kategori: 'PPDB',
      target_unit: roleAnalysis.isGlobalAdmin ? 'all' : roleAnalysis.assignedUnitId,
      target_unit_name: roleAnalysis.isGlobalAdmin ? 'Seluruh Unit (Yayasan)' : roleAnalysis.assignedUnitName,
      ringkasan: '',
      isi: '',
      tanggal_publikasi: new Date().toISOString().slice(0, 10),
      status: 'Dipublikasikan',
      gambar_url: '',
    })
    setIsFormOpen(true)
  }

  const handleOpenEdit = (item) => {
    setEditingItem(item)
    setForm({
      judul: item.judul || '',
      kategori: item.kategori || 'PPDB',
      target_unit: item.target_unit || 'all',
      target_unit_name: item.target_unit_name || 'Seluruh Unit (Yayasan)',
      ringkasan: item.ringkasan || '',
      isi: item.isi || '',
      tanggal_publikasi: item.tanggal_publikasi || new Date().toISOString().slice(0, 10),
      status: item.status || 'Dipublikasikan',
      gambar_url: item.gambar_url || '',
    })
    setIsFormOpen(true)
  }

  const handleSaveForm = async (e) => {
    e.preventDefault()
    const trimmedJudul = form.judul.trim().replace(/\s+/g, ' ')
    const trimmedRingkasan = form.ringkasan.trim().replace(/\s+/g, ' ')
    const trimmedIsi = form.isi.trim()

    if (!trimmedJudul || !trimmedRingkasan) return

    const selectedU = unitOptions.find((u) => u.id === form.target_unit) || unitOptions[0]

    const payload = {
      judul_pengumuman: trimmedJudul,
      isi_pengumuman: trimmedIsi || trimmedRingkasan,
      target_peran: ['Orang Tua', 'Siswa'],
      status_aktif: form.status === 'Dipublikasikan',
      mulai_tampil: form.tanggal_publikasi,
      data_tambahan: {
        unit_id: form.target_unit,
        unit_name: selectedU.name,
        unit_code: selectedU.code,
        kategori: form.kategori,
        ringkasan: trimmedRingkasan,
        gambar_url: form.gambar_url,
      },
    }

    if (editingItem) {
      // 1. Send DB Update
      await dashboardPemantauanService.ubahPengumumanSekolah({ id: editingItem.id, payload }).catch(() => null)

      // 2. Update State & Local Cache
      const updated = newsList.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              ...form,
              target_unit_name: selectedU.name,
              updated_at: new Date().toISOString(),
            }
          : item
      )
      saveNewsListToCache(updated)
    } else {
      // 1. Send DB Post
      const dbRes = await dashboardPemantauanService.tambahPengumumanSekolah(payload).catch(() => null)
      const newId = dbRes?.data?.id || 'news-' + Date.now()

      // 2. Insert to State & Local Cache
      const newItem = {
        id: newId,
        ...form,
        target_unit_name: selectedU.name,
        penerbit: user?.name || user?.nama || 'Pengelola Berita',
        penerbit_role: roleAnalysis.isGlobalAdmin ? 'Pengurus Yayasan' : 'Pengelola Unit',
        created_at: new Date().toISOString(),
      }
      saveNewsListToCache([newItem, ...newsList])
    }

    setIsFormOpen(false)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return
    await dashboardPemantauanService.hapusPengumumanSekolah(deletingItem.id).catch(() => null)

    const updated = newsList.filter((item) => item.id !== deletingItem.id)
    saveNewsListToCache(updated)
    setIsDeleteOpen(false)
    setDeletingItem(null)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.02 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  }

  return (
    <PageContainer maxW="7xl">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-12">
        {/* 0. BREADCRUMB NAV (Kanonikal AppBreadcrumb) */}
        <motion.div variants={itemVariants} className="print:hidden">
          <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Berita & Pengumuman' }]} />
        </motion.div>

        {/* Header Halaman Modern Hero Card */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden">
          {/* Ambient Glow Background Accent (Vibrant Dual Emerald-Teal Blobs) */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <Megaphone className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Berita & Pengumuman Sekolah
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {roleAnalysis.isGlobalAdmin ? 'Lintas Unit Yayasan' : `Unit: ${roleAnalysis.assignedUnitName}`}
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 w-full leading-relaxed">
                  {roleAnalysis.isGlobalAdmin
                    ? 'Pusat pengumuman dan publikasi berita resmi terpadu seluruh unit sekolah dan lembaga yayasan.'
                    : `Pusat pengumuman dan berita resmi khusus untuk unit ${roleAnalysis.assignedUnitName}.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 px-3.5 py-1.5 text-xs font-black text-emerald-900 dark:border-emerald-700 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Publikasi Resmi</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* KPI STATS CARDS (HEROUI_CARD_COMPONENT) */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
          <KpiTintedCard
            icon={Megaphone}
            label="Total Berita"
            value={stats.total}
            subtext="Total publikasi di database (Klik detail)"
            tone="emerald"
            onClick={() => { setKpiModalSearch(''); setActiveKpiModal('total'); }}
          />
          <KpiTintedCard
            icon={CheckCircle2}
            label="Dipublikasikan"
            value={stats.published}
            subtext="Aktif di portal ortu & siswa (Klik detail)"
            tone="blue"
            onClick={() => { setKpiModalSearch(''); setActiveKpiModal('published'); }}
          />
          <KpiTintedCard
            icon={AlertCircle}
            label="Draf Internal"
            value={stats.draft}
            subtext="Belum dipublikasikan (Klik detail)"
            tone="amber"
            onClick={() => { setKpiModalSearch(''); setActiveKpiModal('draft'); }}
          />
          <KpiTintedCard
            icon={Globe}
            label="Lintas Unit"
            value={stats.globalUnit}
            subtext="Target seluruh yayasan (Klik detail)"
            tone="purple"
            onClick={() => { setKpiModalSearch(''); setActiveKpiModal('global'); }}
          />
        </motion.div>

        {/* 1. SINGLE UNIFIED DATATABLE CARD CONTAINER (FILTER BAR & DATATABLE DIGABUNGKAN DENGAN GRADASI ZAMRUD) */}
        <motion.div variants={itemVariants} id="tabel-berita-informasi" className="scroll-mt-6 relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
        {/* BARIS 1: HEADER CARD TITLE + SOFT PASTEL SQUIRCLE ACTION BUTTONS */}
        <div className="flex flex-col gap-4 border-b border-emerald-200/90 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-5 sm:p-6 dark:border-emerald-800/60 dark:bg-gradient-to-r dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-transparent sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                Daftar Publikasi Berita
              </h2>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                {filteredList.length} Berita
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Riwayat publikasi berita dan pengumuman yang dapat difilter berdasarkan target unit sekolah.
            </p>
          </div>

          {/* Soft Pastel Squircle Action Buttons Baris 1 */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Tombol Impor (Sky Blue Soft Pastel Squircle) */}
            <HoverCard>
              <HoverCardTrigger>
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(true)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-700 shadow-xs transition hover:scale-105 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
                >
                  <Upload1 className="h-4 w-4" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="text-[11px] font-bold text-slate-700 dark:text-slate-200 p-2">
                Impor Data Berita (Excel/CSV)
              </HoverCardContent>
            </HoverCard>

            {/* Tombol Ekspor (Amber/Orange Soft Pastel Squircle) */}
            <HoverCard>
              <HoverCardTrigger>
                <button
                  type="button"
                  onClick={handleExportNews}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700 shadow-xs transition hover:scale-105 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                >
                  <Download1 className="h-4 w-4" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="text-[11px] font-bold text-slate-700 dark:text-slate-200 p-2">
                Ekspor Laporan Berita
              </HoverCardContent>
            </HoverCard>

            {/* Tombol Buat Berita Baru (Emerald/Green Soft Pastel Squircle) */}
            <HoverCard>
              <HoverCardTrigger>
                <Button
                  variant="ghost"
                  size="md"
                  className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 font-bold shadow-xs transition hover:scale-105 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  onClick={handleOpenAdd}
                >
                  <Plus className="h-4 w-4" />
                  <span>Buat Berita Baru</span>
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="text-[11px] font-bold text-slate-700 dark:text-slate-200 p-2">
                Publikasikan berita baru
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>

        {/* BARIS 2: CARD FILTER (DILENGKAPI DENGAN SEARCH, DROPDOWN UNIT DARI DATABASE & PERPAGE SELECTOR) */}
        <div className="flex flex-col gap-3 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 p-4 dark:bg-emerald-950/20 lg:flex-row lg:items-center lg:justify-between border-b border-emerald-500/15 dark:border-emerald-900/40">
          {/* Search Input */}
          <div className="relative min-w-[240px] flex-1 sm:w-72">
            <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              placeholder="Cari judul, ringkasan, atau isi berita..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2 text-xs font-semibold focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {/* Filters & perPage Selector */}
          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            {roleAnalysis.isGlobalAdmin && (
              <CustomSelect
                value={filters.unit_id}
                onChange={(e) => setFilters({ ...filters, unit_id: e.target.value, page: 1 })}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="all">Semua Unit</option>
                {unitOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </CustomSelect>
            )}

            <CustomSelect
              value={filters.kategori}
              onChange={(e) => setFilters({ ...filters, kategori: e.target.value, page: 1 })}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="all">Semua Kategori</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </CustomSelect>

            <CustomSelect
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="all">Semua Status</option>
              <option value="Dipublikasikan">Dipublikasikan</option>
              <option value="Draf">Draf</option>
            </CustomSelect>

            {/* perPage Selector */}
            <CustomSelect
              value={filters.per_page}
              onChange={(e) => setFilters({ ...filters, per_page: Number(e.target.value), page: 1 })}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value={5}>5 / hal</option>
              <option value={10}>10 / hal</option>
              <option value={15}>15 / hal</option>
              <option value={25}>25 / hal</option>
              <option value={50}>50 / hal</option>
              <option value={100}>100 / hal</option>
            </CustomSelect>

            {/* Tombol Muat Ulang (Sky Pastel) */}
            <HoverCard>
              <HoverCardTrigger>
                <button
                  type="button"
                  onClick={loadNews}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-700 shadow-xs transition hover:scale-105 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="text-[11px] font-bold text-slate-700 dark:text-slate-200 p-2">
                Muat Ulang Data dari Database
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>

        {/* HEROUI TABLE ROOT & ROWS WITH RICH COLOR STYLING */}
        <div className="overflow-x-auto">
          <TableRoot fullBleed={false}>
            <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
              <TableRow className="border-b-2 border-emerald-200/90 dark:border-emerald-800/80 bg-transparent hover:bg-transparent">
                <TableHead className="bg-transparent font-extrabold text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200 py-3.5 px-4">
                  <div className="flex items-center gap-1.5 cursor-pointer">
                    <span className="font-extrabold text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">Judul Berita & Kategori</span>
                    <ArrowBothDirectionHorizontal2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </TableHead>
                <TableHead className="bg-transparent font-extrabold text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200 py-3.5 px-4">Target Unit Sekolah</TableHead>
                <TableHead className="bg-transparent font-extrabold text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200 py-3.5 px-4">Penerbit & Peran</TableHead>
                <TableHead className="bg-transparent font-extrabold text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200 py-3.5 px-4">Tanggal Publikasi</TableHead>
                <TableHead className="bg-transparent font-extrabold text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200 py-3.5 px-4">Status</TableHead>
                <TableHead className="bg-transparent text-center font-extrabold text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200 py-3.5 px-4">Aksi</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-xs font-semibold text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
                    Belum ada berita atau pengumuman yang sesuai dengan filter pencarian.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedList.map((row, idx) => {
                  const cat = CATEGORY_OPTIONS.find((c) => c.id === row.kategori) || CATEGORY_OPTIONS[0]
                  const IconComp = cat.icon

                  const catStyles = {
                    PPDB: 'bg-amber-100/90 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 ring-1 ring-amber-300/60 dark:ring-amber-800',
                    Akademik: 'bg-sky-100/90 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 ring-1 ring-sky-300/60 dark:ring-sky-800',
                    Prestasi: 'bg-purple-100/90 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 ring-1 ring-purple-300/60 dark:ring-purple-800',
                    Kegiatan: 'bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 ring-1 ring-emerald-300/60 dark:ring-emerald-800',
                    Umum: 'bg-cyan-100/90 text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-300 ring-1 ring-cyan-300/60 dark:ring-cyan-800',
                  }
                  const iconStyle = catStyles[cat.id] || catStyles.Umum

                  return (
                    <TableRow
                      key={row.id || idx}
                      onClick={() => {
                        setDetailItem(row)
                        setIsDetailOpen(true)
                      }}
                      className="transition-all duration-200 even:bg-slate-50/50 dark:even:bg-slate-900/30 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 hover:shadow-xs cursor-pointer group border-b border-slate-100 dark:border-slate-800/80"
                    >
                      {/* Judul & Kategori */}
                      <TableCell className="max-w-xs py-3.5">
                        <div className="flex items-start gap-3">
                          <div className={`rounded-xl p-2.5 shrink-0 mt-0.5 shadow-xs transition-transform group-hover:scale-110 ${iconStyle}`}>
                            <IconComp className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                              {row.judul}
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{row.ringkasan}</p>
                            <div className="mt-1.5">
                              <Badge color={cat.color} size="sm" className="font-bold text-[10px] shadow-xs">
                                {cat.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Target Unit Sekolah */}
                      <TableCell className="py-3.5">
                        <div className="inline-flex">
                          <Badge
                            color={row.target_unit === 'all' ? 'amber' : 'cyan'}
                            size="sm"
                            prefixIcon={row.target_unit === 'all' ? Globe : Building2}
                            className="font-bold shadow-2xs px-2.5 py-1"
                          >
                            {row.target_unit_name || 'Seluruh Unit (Yayasan)'}
                          </Badge>
                        </div>
                      </TableCell>

                      {/* Penerbit & Peran */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-300/60 dark:border-emerald-700/60">
                            {(row.penerbit || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{row.penerbit}</p>
                            <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 mt-0.5">
                              {row.penerbit_role}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Tanggal Publikasi */}
                      <TableCell className="py-3.5">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/80 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-bold border border-slate-200/60 dark:border-slate-700/60">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{row.tanggal_publikasi}</span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3.5">
                        <Badge
                          color={row.status === 'Dipublikasikan' ? 'success' : 'warning'}
                          size="sm"
                          prefixIcon={row.status === 'Dipublikasikan' ? CheckCircle2 : AlertCircle}
                          className="font-extrabold shadow-2xs px-2.5 py-1"
                        >
                          {row.status}
                        </Badge>
                      </TableCell>

                      {/* KOLOM AKSI: ACTION DROPDOWN */}
                      <TableCell className="text-center py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center">
                          <ActionDropdown
                            onView={() => {
                              setDetailItem(row)
                              setIsDetailOpen(true)
                            }}
                            onEdit={() => handleOpenEdit(row)}
                            onDelete={() => {
                              setDeletingItem(row)
                              setIsDeleteOpen(true)
                            }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </TableRoot>
        </div>

        {/* CONTAINER PAGINATION DI BAGIAN BAWAH CARD */}
        {totalPages > 1 && (
          <div className="w-full border-t border-slate-100 p-4 dark:border-slate-800">
            <Pagination
              currentPage={filters.page}
              totalPages={totalPages}
              onPageChange={(page) => setFilters({ ...filters, page })}
              sideLayout="full"
            />
          </div>
        )}
      </motion.div>

      {/* MODAL FORM TAMBAH / EDIT BERITA */}
      <Dialog isOpen={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Edit Berita & Pengumuman' : 'Buat Berita / Pengumuman Baru'}</DialogTitle>
          <DialogDescription>
            {roleAnalysis.isGlobalAdmin
              ? 'Isi formulir untuk mempublikasikan berita/pengumuman ke seluruh unit yayasan atau unit tertentu.'
              : `Formulir pembuatan berita resmi khusus untuk ${roleAnalysis.assignedUnitName}.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSaveForm}>
          <DialogBody className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                Judul Berita / Pengumuman *
              </label>
              <input
                type="text"
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                required
                placeholder="Contoh: Penerimaan Siswa Baru T.A. 2026/2027 Resmi Dibuka"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Kategori Berita *
                </label>
                <CustomSelect
                  value={form.kategori}
                  onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </CustomSelect>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Target Unit Sekolah *
                </label>
                {roleAnalysis.isGlobalAdmin ? (
                  <CustomSelect
                    value={form.target_unit}
                    onChange={(e) => {
                      const u = unitOptions.find((opt) => opt.id === e.target.value)
                      setForm({
                        ...form,
                        target_unit: e.target.value,
                        target_unit_name: u?.name || 'Seluruh Unit (Yayasan)',
                      })
                    }}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {unitOptions.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </CustomSelect>
                ) : (
                  <input
                    type="text"
                    disabled
                    value={roleAnalysis.assignedUnitName}
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Publikasi *
                </label>
                <DatePicker
                  value={form.tanggal_publikasi}
                  onChange={(e) => setForm({ ...form, tanggal_publikasi: e.target.value })}
                  required
                  inputClassName="py-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Status Publikasi *
                </label>
                <CustomSelect
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Dipublikasikan">Dipublikasikan (Tampil di Portal)</option>
                  <option value="Draf">Draf (Disimpan Internal)</option>
                </CustomSelect>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                Ringkasan Singkat *
              </label>
              <textarea
                rows={2}
                value={form.ringkasan}
                onChange={(e) => setForm({ ...form, ringkasan: e.target.value })}
                required
                placeholder="Ringkasan 1-2 kalimat yang akan tampil di kartu preview berita..."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                Isi Lengkap Berita / Pengumuman *
              </label>
              <textarea
                rows={4}
                value={form.isi}
                onChange={(e) => setForm({ ...form, isi: e.target.value })}
                required
                placeholder="Tuliskan isi berita, ketentuan, pengumuman lengkap untuk wali murid & siswa..."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                URL Gambar / Banner (Opsional)
              </label>
              <input
                type="url"
                value={form.gambar_url}
                onChange={(e) => setForm({ ...form, gambar_url: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </DialogBody>

          <DialogFooter className="gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <DialogClose appearance="outline" size="sm" type="button">
              Batal
            </DialogClose>
            <Button variant="primary" appearance="fill" size="sm" type="submit" className="font-bold px-5">
              {editingItem ? 'Simpan Perubahan' : 'Publikasi'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* MODAL DETAIL PRATINJAU BERITA */}
      <Dialog isOpen={isDetailOpen} onOpenChange={setIsDetailOpen}>
        {detailItem && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Badge color="amber" size="sm">
                  {detailItem.kategori}
                </Badge>
                <Badge color="emerald" size="sm">
                  {detailItem.target_unit_name}
                </Badge>
              </div>
              <DialogTitle className="mt-2 text-lg font-black">{detailItem.judul}</DialogTitle>
              <DialogDescription className="text-xs">
                Dipublikasikan oleh {detailItem.penerbit} ({detailItem.penerbit_role}) pada {detailItem.tanggal_publikasi}
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-4">
              {detailItem.gambar_url && (
                <img
                  src={detailItem.gambar_url}
                  alt={detailItem.judul}
                  className="w-full h-48 object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                />
              )}

              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Ringkasan:</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{detailItem.ringkasan}</p>
              </div>

              <div>
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1">Isi Lengkap Berita:</p>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {detailItem.isi}
                </p>
              </div>
            </DialogBody>

            <DialogFooter className="gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <DialogClose appearance="outline" size="sm" type="button">
                Tutup Pratinjau
              </DialogClose>
            </DialogFooter>
          </>
        )}
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════
          KPI CARDS DRILL-DOWN MODAL — Interactive News Analytics Breakdown
      ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {activeKpiModal && (
          <div
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
            onMouseDown={(e) => { if (e.target === e.currentTarget) setActiveKpiModal(null) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className="modal-dialog font-sans w-full max-w-4xl"
            >
              <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#1B2433]">
                {/* Header */}
                <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                      {activeKpiModal === 'total' && <Megaphone className="h-5 w-5" />}
                      {activeKpiModal === 'published' && <CheckCircle2 className="h-5 w-5" />}
                      {activeKpiModal === 'draft' && <AlertCircle className="h-5 w-5" />}
                      {activeKpiModal === 'global' && <Globe className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="modal-title text-base font-extrabold text-slate-900 dark:text-white">
                        {activeKpiModal === 'total' && 'Analisis Total Publikasi Berita & Pengumuman'}
                        {activeKpiModal === 'published' && 'Rincian Berita Dipublikasikan (Aktif Portal)'}
                        {activeKpiModal === 'draft' && 'Rincian Berita Draf Internal (Belum Rilis)'}
                        {activeKpiModal === 'global' && 'Rincian Berita Lintas Unit (Target Yayasan)'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Menampilkan {filteredKpiNewsItems.length} data berita terfilter
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveKpiModal(null)}
                    aria-label="Tutup modal"
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <span className="text-lg font-bold">✕</span>
                  </button>
                </div>

                {/* Toolbar Search inside Modal */}
                <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-3 dark:border-slate-800 dark:bg-slate-900/40">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={kpiModalSearch}
                      onChange={(e) => setKpiModalSearch(e.target.value)}
                      placeholder="Cari judul berita, ringkasan, atau kategori..."
                      className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    />
                  </div>
                  <Badge color="emerald" size="md">
                    {filteredKpiNewsItems.length} Publikasi
                  </Badge>
                </div>

                {/* Table Body inside Modal */}
                <div className="modal-body flex-1 overflow-y-auto p-6">
                  {filteredKpiNewsItems.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-sm font-bold text-slate-500">Tidak ada berita yang cocok dengan kriteria filter ini.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-[11px] font-extrabold uppercase text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                          <tr>
                            <th className="px-4 py-3">No</th>
                            <th className="px-4 py-3">Judul Berita & Kategori</th>
                            <th className="px-4 py-3">Target Unit</th>
                            <th className="px-4 py-3 text-center">Tanggal Publikasi</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700 dark:divide-slate-800 dark:text-slate-300">
                          {filteredKpiNewsItems.map((item, idx) => {
                            const cat = CATEGORY_OPTIONS.find((c) => c.id === item.kategori) || CATEGORY_OPTIONS[0]
                            const IconComp = cat.icon
                            return (
                              <tr key={item.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
                                <td className="px-4 py-3 font-bold text-slate-400">{idx + 1}</td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 shrink-0">
                                      <IconComp className="h-3.5 w-3.5" />
                                    </div>
                                    <div>
                                      <span className="block font-bold text-slate-900 dark:text-white line-clamp-1">{item.judul}</span>
                                      <Badge color={cat.color} size="sm" className="mt-0.5 text-[9px]">
                                        {cat.label}
                                      </Badge>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <Badge color={item.target_unit === 'all' ? 'amber' : 'cyan'} size="sm" prefixIcon={item.target_unit === 'all' ? Globe : Building2}>
                                    {item.target_unit_name || 'Seluruh Unit (Yayasan)'}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-300">
                                  {item.tanggal_publikasi}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <Badge color={item.status === 'Dipublikasikan' ? 'success' : 'warning'} size="sm">
                                    {item.status}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <Button
                                    type="button"
                                    size="xs"
                                    variant="primary"
                                    onClick={() => {
                                      setActiveKpiModal(null)
                                      setDetailItem(item)
                                      setIsDetailOpen(true)
                                    }}
                                    className="font-bold cursor-pointer"
                                  >
                                    Lihat Rincian
                                  </Button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="modal-footer flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3 dark:border-slate-800 dark:bg-slate-900/50">
                  <span className="text-xs font-semibold text-slate-500">
                    Menampilkan total {filteredKpiNewsItems.length} baris
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveKpiModal(null)}
                    className="h-8 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL KONFIRMASI HAPUS (ALERT DIALOG HEROUI) */}
      <AnimatePresence>
        <AlertDialog isOpen={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogHeader>
            <DialogTitle>Hapus Berita Ini dari Database?</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus berita "{deletingItem?.judul}" dari database? Berita yang dihapus tidak akan tampil lagi di portal orang tua dan siswa.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <DialogClose appearance="outline" size="sm" type="button">
              Batal
            </DialogClose>
            <Button variant="danger" appearance="fill" size="sm" onClick={handleDeleteConfirm} className="font-bold px-5">
              Hapus Permanen dari Database
            </Button>
          </DialogFooter>
        </AlertDialog>
      </AnimatePresence>

      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Impor Data Berita & Informasi"
        templateColumns={[
          { key: 'judul', label: 'Judul Berita', example: 'Penerimaan Santri Baru Gelombang 1' },
          { key: 'kategori', label: 'Kategori (PPDB/Akademik/Prestasi/Kegiatan/Umum)', example: 'PPDB' },
          { key: 'status', label: 'Status (published/draft)', example: 'published' },
          { key: 'ringkasan', label: 'Ringkasan', example: 'Pendaftaran gelombang pertama resmi dibuka' },
          { key: 'isi', label: 'Isi Berita', example: 'Pendaftaran dibuka secara daring maupun luring' },
        ]}
        onImport={handleImportNews}
      />

      {/* Smart Floating Scroll Navigator */}
      <SmartScrollFab targetId="tabel-berita-informasi" downTooltip="Langsung ke Tabel Berita" />
      </motion.div>
    </PageContainer>
  )
}
