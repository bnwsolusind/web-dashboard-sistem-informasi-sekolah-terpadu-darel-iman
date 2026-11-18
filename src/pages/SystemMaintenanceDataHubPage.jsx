import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Database,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  Server,
  Cpu,
  Trash2,
  HardDrive,
  Users,
  GraduationCap,
  Building2,
  Layers,
  BookOpen,
  Briefcase,
  Sliders,
  Check,
  X,
  FileCheck,
  Terminal,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react'

import { PageContainer, AppBreadcrumb } from '../components/app'
import { Button } from '../components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { useAuthStore } from '../stores/authStore'
import { systemMaintenanceService } from '../services/systemMaintenanceService'

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

// Master Table Entities Configuration
const MASTER_TABLES = [
  {
    id: 'students',
    name: 'Data Siswa & Santri',
    subtitle: 'Mendukung format lengkap 109 kolom (Biodata, Ortu, SPP, Mutasi)',
    icon: GraduationCap,
    badgeColor: 'emerald',
    metricKey: 'students',
    docUrl: 'https://docs.google.com/spreadsheets/d/15P--ejXn_FahqQDze6-fOk5MGVXrOclILazHPGfWN7E/edit?gid=2024181082#gid=2024181082',
  },
  {
    id: 'employees',
    name: 'Data Pegawai & Guru',
    subtitle: 'Mendukung format 13 kolom (NIY, NIK, Jabatan, Wali Kelas, Mapel)',
    icon: Users,
    badgeColor: 'teal',
    metricKey: 'employees',
    docUrl: 'https://docs.google.com/spreadsheets/d/15P--ejXn_FahqQDze6-fOk5MGVXrOclILazHPGfWN7E/edit?gid=1155007152#gid=1155007152',
  },
  {
    id: 'positions',
    name: 'Jabatan & Struktur Organisasi',
    subtitle: 'Mendukung format hierarki 4 kolom (Satuan Kerja, Level User)',
    icon: Briefcase,
    badgeColor: 'indigo',
    metricKey: 'positions',
    docUrl: 'https://docs.google.com/spreadsheets/d/15P--ejXn_FahqQDze6-fOk5MGVXrOclILazHPGfWN7E/edit?gid=1116523928#gid=1116523928',
  },
  {
    id: 'education_units',
    name: 'Unit Pendidikan',
    subtitle: 'TKIT, SDIT, SMPIT, SMAIT, TAUD, Pondok Pesantren, Playhouse',
    icon: Building2,
    badgeColor: 'sky',
    metricKey: 'education_units',
  },
  {
    id: 'classes',
    name: 'Kelas & Rombel',
    subtitle: 'Daftar rombongan belajar, tingkat kelas, dan alokasi wali kelas',
    icon: Layers,
    badgeColor: 'amber',
    metricKey: 'classes',
  },
  {
    id: 'subjects',
    name: 'Mata Pelajaran (Mapel)',
    subtitle: 'Kurikulum umum, diniyyah, tahfizh, dan muatan lokal',
    icon: BookOpen,
    badgeColor: 'purple',
    metricKey: 'subjects',
  },
]

export default function SystemMaintenanceDataHubPage() {
  const user = useAuthStore((state) => state.user)
  const isSuperAdmin = useMemo(() => {
    const roles = user?.roles || []
    return roles.some((r) => {
      const name = typeof r === 'string' ? r : r.name
      return String(name).toLowerCase().replace(/[\s_-]+/g, '') === 'superadmin'
    })
  }, [user])

  const [activeTab, setActiveTab] = useState('partial') // 'partial' | 'all' | 'cache' | 'danger'
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [statusData, setStatusData] = useState(null)
  const [toast, setToast] = useState(null)

  // Cache & Optimize execution states
  const [optimizing, setOptimizing] = useState(false)
  const [optimizeLogs, setOptimizeLogs] = useState([])

  // Import Modal states
  const [importModal, setImportModal] = useState({
    isOpen: false,
    table: 'students',
    tableName: 'Data Siswa & Santri',
    file: null,
    uploading: false,
    result: null,
  })

  // Reset Database Modal states
  const [resetModal, setResetModal] = useState({
    isOpen: false,
    confirmText: '',
    scope: 'all_except_superadmin',
    processing: false,
    result: null,
  })

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  // Fetch Status
  const fetchStatus = async (isManual = false) => {
    if (isManual) setRefreshing(true)
    else setLoading(true)
    try {
      const data = await systemMaintenanceService.getStatus()
      setStatusData(data)
    } catch (err) {
      console.error('Failed to fetch status:', err)
      const errorMsg = err?.response?.data?.message || err?.message || 'Error'
      showToast('Gagal memuat status sistem: ' + errorMsg, 'error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  // Action: Optimize & Clear Cache
  const handleOptimizeClear = async () => {
    setOptimizing(true)
    try {
      const res = await systemMaintenanceService.optimizeClear()
      if (res?.success) {
        showToast('Pembersihan cache & optimasi backend berhasil dijalankan!', 'success')
        setOptimizeLogs(res.data?.logs || ['Pembersihan cache berhasil'])
        fetchStatus(true)
      } else {
        showToast(res?.message || 'Gagal menjalankan pembersihan cache', 'error')
      }
    } catch (err) {
      showToast('Terjadi kesalahan: ' + (err?.response?.data?.message || err?.message), 'error')
    } finally {
      setOptimizing(false)
    }
  }

  // Action: Export
  const handleExport = async (tableKey) => {
    try {
      showToast(`Mempersiapkan ekspor data ${tableKey}...`, 'info')
      await systemMaintenanceService.downloadExport(tableKey)
      showToast(`Berkas ekspor ${tableKey} berhasil diunduh.`, 'success')
    } catch (err) {
      showToast('Gagal mengunduh berkas ekspor: ' + err.message, 'error')
    }
  }

  // Action: Template
  const handleDownloadTemplate = async (tableKey) => {
    try {
      showToast(`Mengunduh template impor ${tableKey}...`, 'info')
      await systemMaintenanceService.downloadTemplate(tableKey)
      showToast(`Template ${tableKey} berhasil diunduh.`, 'success')
    } catch (err) {
      showToast('Gagal mengunduh template: ' + err.message, 'error')
    }
  }

  // Action: Open Import Modal
  const openImportModal = (tableKey, tableName) => {
    setImportModal({
      isOpen: true,
      table: tableKey,
      tableName: tableName,
      file: null,
      uploading: false,
      result: null,
    })
  }

  // Action: Submit Import
  const handleSubmitImport = async () => {
    if (!importModal.file) {
      showToast('Pilih berkas Excel (.xlsx) atau CSV terlebih dahulu.', 'error')
      return
    }

    setImportModal((prev) => ({ ...prev, uploading: true, result: null }))
    try {
      const res = await systemMaintenanceService.importTable(importModal.table, importModal.file)
      if (res?.success) {
        setImportModal((prev) => ({
          ...prev,
          uploading: false,
          result: res.data,
        }))
        showToast(`Impor ${importModal.tableName} berhasil diproses!`, 'success')
        fetchStatus(true)
      } else {
        showToast(res?.message || 'Gagal memproses impor.', 'error')
        setImportModal((prev) => ({ ...prev, uploading: false }))
      }
    } catch (err) {
      setImportModal((prev) => ({ ...prev, uploading: false }))
      showToast('Kesalahan impor: ' + (err?.response?.data?.message || err?.message), 'error')
    }
  }

  // Action: Submit Reset Database
  const handleExecuteResetDatabase = async () => {
    if (resetModal.confirmText.trim() !== 'RESET DATABASE') {
      showToast('Ketik tepat "RESET DATABASE" untuk konfirmasi.', 'error')
      return
    }

    setResetModal((prev) => ({ ...prev, processing: true }))
    try {
      const res = await systemMaintenanceService.resetDatabase({
        confirmation_key: resetModal.confirmText.trim(),
        scope: resetModal.scope,
      })
      if (res?.success) {
        showToast('Reset database berhasil dieksekusi dengan aman!', 'success')
        setResetModal((prev) => ({
          ...prev,
          processing: false,
          result: res.data,
        }))
        fetchStatus(true)
      } else {
        showToast(res?.message || 'Gagal reset database.', 'error')
        setResetModal((prev) => ({ ...prev, processing: false }))
      }
    } catch (err) {
      setResetModal((prev) => ({ ...prev, processing: false }))
      showToast('Kesalahan reset database: ' + (err?.response?.data?.message || err?.message), 'error')
    }
  }

  const metrics = statusData?.metrics || {}
  const server = statusData?.server || {}

  return (
    <PageContainer maxW="7xl">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-16">
        
        {/* Breadcrumb Navigation */}
        <motion.div variants={itemVariants} className="print:hidden">
          <AppBreadcrumb
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Pengaturan', href: '/dashboard/pengaturan' },
              { label: 'Pusat Data & Pemeliharaan Sistem' },
            ]}
          />
        </motion.div>

        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`fixed top-5 right-5 z-[100] flex items-center gap-2.5 rounded-xl px-4 py-3 shadow-2xl text-xs font-bold ${
                toast.type === 'error'
                  ? 'bg-rose-600 text-white shadow-rose-900/30'
                  : toast.type === 'info'
                  ? 'bg-sky-600 text-white shadow-sky-900/30'
                  : 'bg-emerald-600 text-white shadow-emerald-900/30'
              }`}
            >
              {toast.type === 'error' ? <AlertCircle className="size-4 shrink-0" /> : <CheckCircle2 className="size-4 shrink-0" />}
              <span>{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. HEROUI MODERN HERO CARD (GOLD BENCHMARK) */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900"
        >
          {/* Dual Multi-tone Ambient Glow Accent */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="flex items-start gap-4 min-w-0">
              <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40">
                <Database className="size-6 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-xs border border-emerald-300/40">
                    <Server className="h-3.5 w-3.5" />
                    Pusat Data &amp; Pemeliharaan Sistem
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 font-mono">
                    {server.database_driver || 'PostgreSQL'} • {server.laravel_version ? `Laravel ${server.laravel_version}` : 'Laravel 11'}
                  </span>
                </div>
                <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Pusat Integrasi Data &amp; Pemeliharaan Server
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  Manajemen impor/ekspor massal (Siswa, Pegawai, Jabatan, Rombel, Mapel), optimasi cache, dan kontrol basis data.
                </p>
              </div>
            </div>

            {/* Quick Actions & Status */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => fetchStatus(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-white/90 px-3.5 py-2 text-xs font-black text-emerald-800 hover:bg-emerald-50 dark:border-emerald-600/40 dark:bg-slate-900/90 dark:text-emerald-300 transition cursor-pointer shadow-xs"
              >
                <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Segarkan Status</span>
              </button>

              <button
                type="button"
                onClick={() => handleExport('all')}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-2 text-xs font-black text-white shadow-md shadow-emerald-600/30 hover:from-emerald-700 hover:to-teal-800 transition cursor-pointer"
              >
                <Download className="size-4" />
                <span>Ekspor Semua Data (.xlsx)</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* 2. 4 MASTER KPI CARDS GRID */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Siswa Card */}
          <div className="rounded-[20px] border-2 border-emerald-300/80 bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white dark:border-emerald-700/60 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-[#1B2433] p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
                MASTER SISWA
              </span>
              <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs">
                <GraduationCap className="size-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white leading-none">
              {metrics.students?.total ?? 0}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
              {metrics.students?.male ?? 0} Ikhwan • {metrics.students?.female ?? 0} Akhwat
            </p>
          </div>

          {/* Pegawai Card */}
          <div className="rounded-[20px] border-2 border-teal-300/80 bg-gradient-to-br from-teal-50/70 via-emerald-50/40 to-white dark:border-teal-700/60 dark:from-teal-950/40 dark:via-emerald-950/20 dark:to-[#1B2433] p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/60 px-2 py-0.5 rounded-md">
                PEGAWAI &amp; GURU
              </span>
              <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-xs">
                <Users className="size-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white leading-none">
              {metrics.employees?.total ?? 0}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
              {metrics.positions?.total ?? 0} Jabatan • {metrics.employees?.active ?? 0} Status Aktif
            </p>
          </div>

          {/* Unit & Kelas Card */}
          <div className="rounded-[20px] border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white dark:border-amber-700/60 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-[#1B2433] p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-md">
                UNIT &amp; KELAS
              </span>
              <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xs">
                <Building2 className="size-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white leading-none">
              {metrics.education_units?.total ?? 0} Unit
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
              {metrics.classes?.total ?? 0} Rombel • {metrics.subjects?.total ?? 0} Mata Pelajaran
            </p>
          </div>

          {/* Cache & Engine Card */}
          <div className="rounded-[20px] border-2 border-indigo-300/80 bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-white dark:border-indigo-700/60 dark:from-indigo-950/40 dark:via-blue-950/20 dark:to-[#1B2433] p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-md">
                ENGINE SERVER
              </span>
              <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-xs">
                <Cpu className="size-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white leading-none uppercase">
              {server.cache_driver || 'Database'}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
              PHP {server.php_version || '8.2'} • {server.environment || 'Production'}
            </p>
          </div>
        </motion.div>

        {/* 3. NAVIGATION TABS */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('partial')}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black transition cursor-pointer ${
              activeTab === 'partial'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-white dark:bg-[#1B2433] text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <FileSpreadsheet className="size-4" />
            <span>Impor &amp; Ekspor Parsial (Per Tabel)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-white dark:bg-[#1B2433] text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <HardDrive className="size-4" />
            <span>Impor &amp; Ekspor Semua Tabel Sekaligus</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cache')}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black transition cursor-pointer ${
              activeTab === 'cache'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-white dark:bg-[#1B2433] text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <RefreshCw className="size-4" />
            <span>Optimasi &amp; Bersihkan Cache Server</span>
          </button>

          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('danger')}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black transition cursor-pointer ${
                activeTab === 'danger'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-white dark:bg-[#1B2433] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60'
              }`}
            >
              <Trash2 className="size-4" />
              <span>Zona Bahaya: Reset Database</span>
            </button>
          )}
        </motion.div>

        {/* TAB 1: IMPOR & EKSPOR PARSIAL (PER TABEL) */}
        {activeTab === 'partial' && (
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] shadow-md shadow-emerald-500/10 overflow-hidden">
              <div className="p-5 border-b border-emerald-100/90 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FileSpreadsheet className="size-5 text-emerald-600" />
                    Manajemen Impor &amp; Ekspor Parsial per Jenis Tabel
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Format telah diselaraskan dengan spreadsheet data riil yayasan tanpa mengubah atau menghilangkan field yang sudah ada.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                {MASTER_TABLES.map((t) => {
                  const Icon = t.icon
                  const count = metrics[t.metricKey]?.total ?? 0

                  return (
                    <div key={t.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <Icon className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                              {t.name}
                            </h4>
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              {count} Data Terdaftar
                            </span>
                            {t.docUrl && (
                              <a
                                href={t.docUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] font-bold text-teal-600 hover:text-teal-700 underline flex items-center gap-1"
                              >
                                Sumber Google Sheet &rarr;
                              </a>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {t.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        {/* Download Template */}
                        <button
                          type="button"
                          onClick={() => handleDownloadTemplate(t.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition cursor-pointer"
                        >
                          <Download className="size-3.5 text-slate-400" />
                          <span>Unduh Template</span>
                        </button>

                        {/* Export Data */}
                        <button
                          type="button"
                          onClick={() => handleExport(t.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300/80 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300 transition cursor-pointer"
                        >
                          <FileText className="size-3.5 text-amber-600" />
                          <span>Ekspor Excel</span>
                        </button>

                        {/* Import Data */}
                        <button
                          type="button"
                          onClick={() => openImportModal(t.id, t.name)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:from-emerald-700 hover:to-teal-800 transition cursor-pointer"
                        >
                          <Upload className="size-3.5" />
                          <span>Impor Berkas</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: IMPOR & EKSPOR TERPADU (SEMUA TABEL SEKALIGUS) */}
        {activeTab === 'all' && (
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kartu Ekspor Semua */}
            <div className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] p-6 shadow-md shadow-emerald-500/10 flex flex-col justify-between">
              <div>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30">
                  <Download className="size-6" />
                </div>
                <h3 className="mt-4 text-base font-black text-slate-900 dark:text-white">
                  Ekspor Seluruh Data Master Sekaligus
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Menghasilkan 1 berkas Excel (.xlsx) multi-sheet yang berisi seluruh data master secara komprehensif:
                </p>
                <ul className="mt-3 space-y-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2"><Check className="size-3.5 text-emerald-600" /> Sheet 1: Unit Pendidikan</li>
                  <li className="flex items-center gap-2"><Check className="size-3.5 text-emerald-600" /> Sheet 2: Jabatan &amp; Struktur Organisasi</li>
                  <li className="flex items-center gap-2"><Check className="size-3.5 text-emerald-600" /> Sheet 3: Kelas &amp; Rombel</li>
                  <li className="flex items-center gap-2"><Check className="size-3.5 text-emerald-600" /> Sheet 4: Mata Pelajaran</li>
                  <li className="flex items-center gap-2"><Check className="size-3.5 text-emerald-600" /> Sheet 5: Pegawai &amp; Guru</li>
                  <li className="flex items-center gap-2"><Check className="size-3.5 text-emerald-600" /> Sheet 6: Siswa &amp; Santri Lengkap</li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleExport('all')}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-3 text-xs font-black text-white shadow-md shadow-emerald-600/30 hover:from-emerald-700 hover:to-teal-800 transition cursor-pointer"
                >
                  <Download className="size-4" />
                  <span>Unduh Paket Master Data (.xlsx)</span>
                </button>
              </div>
            </div>

            {/* Kartu Impor Semua */}
            <div className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] p-6 shadow-md shadow-emerald-500/10 flex flex-col justify-between">
              <div>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/30">
                  <Upload className="size-6" />
                </div>
                <h3 className="mt-4 text-base font-black text-slate-900 dark:text-white">
                  Impor Paket Master Data Terpadu
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Unggah berkas Excel (.xlsx) multi-sheet. Sistem akan memproses dan mengimpor setiap lembar kerja secara berurutan dan otomatis menautkan relasi kunci asing (Foreign Key).
                </p>

                <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-900 border border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/40">
                  <span className="font-bold">Urutan Impor Otomatis:</span>
                  <div className="mt-1 font-mono text-[11px] text-emerald-800 dark:text-emerald-300">
                    Unit &rarr; Jabatan &rarr; Kelas &rarr; Mapel &rarr; Pegawai &rarr; Siswa
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => openImportModal('all', 'Paket Terpadu Semua Tabel')}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-4 py-3 text-xs font-black text-white shadow-md shadow-emerald-600/20 transition cursor-pointer"
                >
                  <Upload className="size-4" />
                  <span>Mulai Impor Paket Terpadu</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: OPTIMASI & BERSIHKAN CACHE SERVER */}
        {activeTab === 'cache' && (
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] p-6 shadow-md shadow-emerald-500/10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-emerald-100/90 dark:border-emerald-800/60 pb-5">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Server className="size-5 text-emerald-600" />
                    Pembersihan Cache &amp; Optimasi Backend
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Mengeksekusi perintah backend <code className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">php artisan optimize:clear</code> dan <code className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">cache:clear</code> secara terprogram.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOptimizeClear}
                  disabled={optimizing}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-600/30 hover:from-emerald-700 hover:to-teal-800 transition cursor-pointer shrink-0"
                >
                  <RefreshCw className={`size-4 ${optimizing ? 'animate-spin' : ''}`} />
                  <span>{optimizing ? 'Sedang Membersihkan...' : 'Jalankan optimize:clear Sekarang'}</span>
                </button>
              </div>

              {/* Status Cache Matrix */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/40">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Config Cache</span>
                  <p className="text-xs font-black text-slate-800 dark:text-slate-100 mt-1">
                    {server.config_cached ? 'Tercache (Cached)' : 'Bersih (Not Cached)'}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/40">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Routes Cache</span>
                  <p className="text-xs font-black text-slate-800 dark:text-slate-100 mt-1">
                    {server.routes_cached ? 'Tercache (Cached)' : 'Bersih (Not Cached)'}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/40">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Events Cache</span>
                  <p className="text-xs font-black text-slate-800 dark:text-slate-100 mt-1">
                    {server.events_cached ? 'Tercache (Cached)' : 'Bersih (Not Cached)'}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/40">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Cache Driver</span>
                  <p className="text-xs font-black text-slate-800 dark:text-slate-100 mt-1 uppercase font-mono">
                    {server.cache_driver || 'Database'}
                  </p>
                </div>
              </div>

              {/* Terminal Logs Output */}
              {optimizeLogs.length > 0 && (
                <div className="mt-5 rounded-2xl bg-slate-950 p-4 border border-slate-800 shadow-inner">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2 border-b border-slate-800/80 pb-2">
                    <Terminal className="size-4 text-emerald-400" />
                    <span>Terminal Execution Output</span>
                  </div>
                  <pre className="font-mono text-[11px] text-emerald-400 whitespace-pre-wrap leading-relaxed">
                    {optimizeLogs.join('\n\n')}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 4: ZONA BAHAYA: RESET DATABASE (SUPER ADMIN ONLY) */}
        {activeTab === 'danger' && isSuperAdmin && (
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="rounded-[22px] border-2 border-rose-300 dark:border-rose-800/80 bg-white dark:bg-[#1B2433] p-6 shadow-md shadow-rose-500/10">
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-700 text-white shadow-md shadow-rose-600/30">
                  <AlertTriangle className="size-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-rose-900 dark:text-rose-200">
                    Zona Bahaya: Reset Basis Data &amp; Pembersihan Massal
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Fitur ini digunakan oleh Super Admin untuk membersihkan data operasional dan data master (misal: saat perpindahan siklus pengujian atau inisialisasi awal tahun ajaran baru).
                  </p>

                  <div className="mt-4 rounded-xl bg-rose-50 p-3.5 border border-rose-200 text-xs text-rose-900 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-200 space-y-1.5">
                    <p className="font-black flex items-center gap-1.5">
                      <ShieldAlert className="size-4 text-rose-600" />
                      Perlindungan Akun Super Admin:
                    </p>
                    <p className="text-[11px]">
                      Sistem dirancang secara aman: Akun pengguna dengan hak akses <strong>Super Admin</strong>, skema migrasi tabel, hak akses Spatie, dan konfigurasi sistem lembaga <strong>TIDAK AKAN DIHAPUS</strong> sehingga Anda tidak akan terkunci keluar dari sistem.
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setResetModal({ isOpen: true, confirmText: '', scope: 'all_except_superadmin', processing: false, result: null })}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-600 to-red-700 px-5 py-3 text-xs font-black text-white shadow-lg shadow-rose-600/30 hover:from-rose-700 hover:to-red-800 transition cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                      <span>Buka Panel Konfirmasi Reset Database</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* MODAL IMPOR UNIVERSAL (HEROUI HARMONIZED BATCH MODAL)                 */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {importModal.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !importModal.uploading && setImportModal((p) => ({ ...p, isOpen: false }))}
                className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-emerald-500/20 bg-white p-6 shadow-2xl shadow-emerald-950/20 dark:bg-slate-900"
              >
                {/* Accent Top Border */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

                <div className="flex items-center justify-between border-b border-emerald-100/90 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
                      <Upload className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        Impor Berkas: {importModal.tableName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Unggah berkas Excel (.xlsx / .xls) atau CSV
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImportModal((p) => ({ ...p, isOpen: false }))}
                    disabled={importModal.uploading}
                    className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <div className="mt-5 space-y-4">
                  {/* Dropzone */}
                  <div className="rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/30 dark:bg-emerald-950/20 p-6 text-center">
                    <FileSpreadsheet className="mx-auto size-10 text-emerald-500" />
                    <p className="mt-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                      {importModal.file ? importModal.file.name : 'Pilih berkas Excel (.xlsx) atau CSV dari komputer'}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {importModal.file ? `${(importModal.file.size / 1024).toFixed(1)} KB` : 'Maksimal ukuran berkas 20MB'}
                    </p>

                    <input
                      type="file"
                      id="import-file-input"
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setImportModal((p) => ({ ...p, file: e.target.files[0], result: null }))
                        }
                      }}
                    />
                    <label
                      htmlFor="import-file-input"
                      className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                    >
                      <span>Pilih Berkas</span>
                    </label>
                  </div>

                  {/* Template quick download button */}
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>Belum memiliki format berkas?</span>
                    <button
                      type="button"
                      onClick={() => handleDownloadTemplate(importModal.table)}
                      className="font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                    >
                      Unduh Template {importModal.tableName}
                    </button>
                  </div>

                  {/* Result Summary if available */}
                  {importModal.result && (
                    <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/80 p-4 border border-emerald-200/80 dark:border-slate-700 space-y-2">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <CheckCircle2 className="size-4 text-emerald-600" />
                        Hasil Pemrosesan Impor:
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="rounded-xl bg-emerald-100/70 dark:bg-emerald-950/60 p-2">
                          <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold block">Berhasil Baru</span>
                          <span className="text-sm font-black text-emerald-900 dark:text-emerald-200">
                            {importModal.result.berhasil ?? 0}
                          </span>
                        </div>
                        <div className="rounded-xl bg-teal-100/70 dark:bg-teal-950/60 p-2">
                          <span className="text-[10px] text-teal-800 dark:text-teal-300 font-bold block">Diperbarui</span>
                          <span className="text-sm font-black text-teal-900 dark:text-teal-200">
                            {importModal.result.diperbarui ?? 0}
                          </span>
                        </div>
                        <div className="rounded-xl bg-rose-100/70 dark:bg-rose-950/60 p-2">
                          <span className="text-[10px] text-rose-800 dark:text-rose-300 font-bold block">Gagal / Skip</span>
                          <span className="text-sm font-black text-rose-900 dark:text-rose-200">
                            {importModal.result.gagal ?? 0}
                          </span>
                        </div>
                      </div>

                      {importModal.result.errors?.length > 0 && (
                        <div className="mt-2 text-[11px] text-rose-600 dark:text-rose-400 space-y-1">
                          <span className="font-bold flex items-center justify-between">
                            <span>Catatan Data Dilewati / Duplikat ({importModal.result.errors.length}):</span>
                          </span>
                          <div className="max-h-36 overflow-y-auto rounded-lg border border-rose-200/90 dark:border-rose-900/50 p-2 bg-rose-50/60 dark:bg-rose-950/20">
                            <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-rose-200">
                              {importModal.result.errors.map((err, idx) => (
                                <li key={idx} className="leading-snug">{err}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <button
                    type="button"
                    onClick={() => setImportModal((p) => ({ ...p, isOpen: false }))}
                    disabled={importModal.uploading}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 transition cursor-pointer"
                  >
                    Tutup
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitImport}
                    disabled={!importModal.file || importModal.uploading}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:from-emerald-700 hover:to-teal-800 transition cursor-pointer disabled:opacity-50"
                  >
                    <Upload className={`size-3.5 ${importModal.uploading ? 'animate-spin' : ''}`} />
                    <span>{importModal.uploading ? 'Memproses Berkas...' : 'Mulai Impor Sekarang'}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* MODAL RESET DATABASE (HEROUI HARMONIZED DELETE MODAL)                 */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {resetModal.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !resetModal.processing && setResetModal((p) => ({ ...p, isOpen: false }))}
                className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-rose-500/30 bg-white p-6 shadow-2xl shadow-rose-950/30 dark:bg-slate-900"
              >
                {/* Accent Top Border */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-rose-600 to-red-700" />

                <div className="flex items-center justify-between border-b border-rose-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      <AlertTriangle className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-rose-950 dark:text-rose-200">
                        Konfirmasi Reset Database
                      </h3>
                      <p className="text-xs text-rose-600 dark:text-rose-400">
                        Tindakan permanen dan tidak dapat dibatalkan
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setResetModal((p) => ({ ...p, isOpen: false }))}
                    disabled={resetModal.processing}
                    className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl bg-rose-50 p-4 border border-rose-200 text-xs text-rose-900 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-200 leading-relaxed">
                    <p className="font-bold">Peringatan Kritis:</p>
                    <p className="mt-1">
                      Data siswa, orang tua, absensi, nilai, LMS, dan pegawai non-admin akan dibersihkan. Akun Super Admin Anda akan tetap dipertahankan agar dapat login dan mengimpor data kembali.
                    </p>
                  </div>

                  {/* Scope Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Pilihan Cakupan Reset:
                    </label>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium">
                        <input
                          type="radio"
                          name="scope"
                          value="all_except_superadmin"
                          checked={resetModal.scope === 'all_except_superadmin'}
                          onChange={(e) => setResetModal((p) => ({ ...p, scope: e.target.value }))}
                          className="accent-rose-600"
                        />
                        <span>Seluruh Data (Siswa, Pegawai Non-Admin, &amp; Operasional)</span>
                      </label>
                      <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium">
                        <input
                          type="radio"
                          name="scope"
                          value="operational"
                          checked={resetModal.scope === 'operational'}
                          onChange={(e) => setResetModal((p) => ({ ...p, scope: e.target.value }))}
                          className="accent-rose-600"
                        />
                        <span>Hanya Data Operasional (Presensi, Nilai, LMS, Mutabaah, Tahfizh)</span>
                      </label>
                    </div>
                  </div>

                  {/* Text Confirmation */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Ketik <span className="font-mono text-rose-600 font-extrabold">RESET DATABASE</span> untuk mengonfirmasi:
                    </label>
                    <input
                      type="text"
                      placeholder="RESET DATABASE"
                      value={resetModal.confirmText}
                      onChange={(e) => setResetModal((p) => ({ ...p, confirmText: e.target.value }))}
                      className="w-full rounded-xl border border-rose-300 px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-rose-600 focus:outline-none dark:border-rose-800 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <button
                    type="button"
                    onClick={() => setResetModal((p) => ({ ...p, isOpen: false }))}
                    disabled={resetModal.processing}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 transition cursor-pointer"
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    onClick={handleExecuteResetDatabase}
                    disabled={resetModal.confirmText.trim() !== 'RESET DATABASE' || resetModal.processing}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 px-5 py-2 text-xs font-black text-white shadow-md shadow-rose-600/30 hover:from-rose-700 hover:to-red-800 transition cursor-pointer disabled:opacity-40"
                  >
                    <Trash2 className={`size-3.5 ${resetModal.processing ? 'animate-spin' : ''}`} />
                    <span>{resetModal.processing ? 'Mengeksekusi Reset...' : 'Konfirmasi Reset Sekarang'}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </motion.div>
    </PageContainer>
  )
}
