import React, { useState, useEffect } from 'react'
import CustomSelect from '@/components/ui/CustomSelect'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  CheckCircle2,
  Clock,
  FileText,
  AlertTriangle,
  FileCheck,
  Award,
  BookOpen,
  Send,
  Eye,
  PhoneCall,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Layers,
  Calendar,
} from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'
import { motion } from 'framer-motion'

import {
  AppPageHeader,
  AppBreadcrumb,
  AppFilterBar,
  AppDataTable,
  AppBadge,
  AppButton,
  SectionHeader,
  PageContainer,
} from '../components/app'

import ChartCard from '../components/dashboard/ChartCard'
import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'
import KpiQuickViewModal from '../components/KpiQuickViewModal'
import ModalErrorBoundary from '../components/common/ModalErrorBoundary'

import { waliKelasDashboardService } from '../services/waliKelasDashboardService'

const COLORS = ['#059669', '#0D9488', '#10B981', '#F59E0B', '#EF4444']

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

// ── SUB-KOMPONEN MODERN KPI & SUMMARY CARDS (Spesifikasi Sesuai Dashboard Kepala Sekolah) ──
const MODERN_CARD_TONES = {
  emerald: {
    card: 'border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
    glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
    iconBox: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/30',
    tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    title: 'text-emerald-700 dark:text-emerald-400',
    val: 'text-emerald-700 dark:text-emerald-300',
    sub: 'text-emerald-600/80 dark:text-emerald-400/80',
    cta: 'text-emerald-600/60 dark:text-emerald-500/60',
  },
  blue: {
    card: 'border-blue-300/70 bg-gradient-to-br from-blue-50 via-cyan-50/60 to-white hover:border-blue-400 dark:border-blue-700/50 dark:from-blue-950/40 dark:via-cyan-950/20 dark:to-slate-900',
    glow: 'bg-blue-400/20 group-hover:bg-blue-400/30',
    iconBox: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-blue-500/30',
    tag: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
    title: 'text-blue-700 dark:text-blue-400',
    val: 'text-blue-700 dark:text-blue-300',
    sub: 'text-blue-600/80 dark:text-blue-400/80',
    cta: 'text-blue-600/60 dark:text-blue-500/60',
  },
  amber: {
    card: 'border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
    glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
    iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/30',
    tag: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    title: 'text-amber-700 dark:text-amber-400',
    val: 'text-amber-700 dark:text-amber-300',
    sub: 'text-amber-600/80 dark:text-amber-400/80',
    cta: 'text-amber-600/60 dark:text-amber-500/60',
  },
  rose: {
    card: 'border-rose-300/70 bg-gradient-to-br from-rose-50 via-pink-50/60 to-white hover:border-rose-400 dark:border-rose-700/50 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-slate-900',
    glow: 'bg-rose-400/20 group-hover:bg-rose-400/30',
    iconBox: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-rose-500/30',
    tag: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
    title: 'text-rose-700 dark:text-rose-400',
    val: 'text-rose-700 dark:text-rose-300',
    sub: 'text-rose-600/80 dark:text-rose-400/80',
    cta: 'text-rose-600/60 dark:text-rose-500/60',
  },
  purple: {
    card: 'border-purple-300/70 bg-gradient-to-br from-purple-50 via-indigo-50/60 to-white hover:border-purple-400 dark:border-purple-700/50 dark:from-purple-950/40 dark:via-indigo-950/20 dark:to-slate-900',
    glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
    iconBox: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-500/30',
    tag: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
    title: 'text-purple-700 dark:text-purple-400',
    val: 'text-purple-700 dark:text-purple-300',
    sub: 'text-purple-600/80 dark:text-purple-400/80',
    cta: 'text-purple-600/60 dark:text-purple-500/60',
  },
  indigo: {
    card: 'border-indigo-300/70 bg-gradient-to-br from-indigo-50 via-sky-50/60 to-white hover:border-indigo-400 dark:border-indigo-700/50 dark:from-indigo-950/40 dark:via-sky-950/20 dark:to-slate-900',
    glow: 'bg-indigo-400/20 group-hover:bg-indigo-400/30',
    iconBox: 'bg-gradient-to-br from-indigo-500 to-sky-600 text-white shadow-indigo-500/30',
    tag: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300',
    title: 'text-indigo-700 dark:text-indigo-400',
    val: 'text-indigo-700 dark:text-indigo-300',
    sub: 'text-indigo-600/80 dark:text-indigo-400/80',
    cta: 'text-indigo-600/60 dark:text-indigo-500/60',
  },
}

function ModernKpiCard({ icon: Icon, title, value, subtext, tag, tone = 'emerald', onClick }) {
  const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
  const isClickable = typeof onClick === 'function'

  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      className={`group relative overflow-hidden rounded-[18px] border-2 p-5 shadow-sm transition-all duration-200 text-left ${
        isClickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      } ${t.card}`}
    >
      {/* Ambient Glow */}
      <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all ${t.glow}`} />

      {/* Header with Gradient Icon Box & Pill Tag */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm ${t.iconBox}`}>
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-wider ${t.title}`}>{title}</p>
          </div>
        </div>
        {tag && (
          <span className={`rounded-lg px-2 py-0.5 text-[10px] font-extrabold ${t.tag}`}>
            {tag}
          </span>
        )}
      </div>

      {/* Metric Value */}
      <p className={`text-4xl font-black tabular-nums ${t.val}`}>
        {value ?? '0'}
      </p>
      {subtext && (
        <p className={`mt-0.5 text-[11px] font-semibold ${t.sub}`}>
          {subtext}
        </p>
      )}

      {/* Click Affordance Footer */}
      {isClickable && (
        <p className={`mt-3 text-[10px] font-bold flex items-center gap-1 ${t.cta}`}>
          <Eye className="h-3 w-3" /> Klik untuk detail lengkap
        </p>
      )}
    </div>
  )
}

function ModernSummaryCard({ icon: Icon, title, value, subtext, tag, tone = 'emerald', onClick }) {
  const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
  const isClickable = typeof onClick === 'function'

  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      className={`group relative overflow-hidden rounded-[18px] border-2 p-4.5 shadow-sm transition-all duration-200 text-left ${
        isClickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      } ${t.card}`}
    >
      <div className={`pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full blur-xl transition-all ${t.glow}`} />

      <div className="flex items-center justify-between mb-2.5">
        <div className={`flex h-8.5 w-8.5 items-center justify-center rounded-xl text-white shadow-xs ${t.iconBox}`}>
          <Icon className="h-4 w-4" />
        </div>
        {tag && (
          <span className={`rounded-lg px-2 py-0.5 text-[9px] font-extrabold ${t.tag}`}>
            {tag}
          </span>
        )}
      </div>

      <p className={`text-[10.5px] font-bold uppercase tracking-wider ${t.title}`}>{title}</p>
      <p className={`text-3xl font-black tabular-nums ${t.val}`}>
        {value ?? '0'}
      </p>
      {subtext && (
        <p className={`mt-0.5 text-[10.5px] font-semibold ${t.sub}`}>
          {subtext}
        </p>
      )}

      {isClickable && (
        <p className={`mt-2.5 text-[9.5px] font-bold flex items-center gap-1 ${t.cta}`}>
          <Eye className="h-2.5 w-2.5" /> Detail lengkap
        </p>
      )}
    </div>
  )
}

export default function WaliKelasDashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [selectedClassId, setSelectedClassId] = useState('')
  const [activeModal, setActiveModal] = useState(null)

  const fetchDashboard = async (classId = selectedClassId) => {
    setLoading(true)
    setError(null)
    try {
      const res = await waliKelasDashboardService.getOverview({ class_id: classId })
      if (res && res.data) {
        setData(res.data)
      } else {
        setError('Format respon server tidak valid.')
      }
    } catch (err) {
      console.error('Failed to load Wali Kelas dashboard:', err)
      setError(err.response?.data?.message || 'Gagal memuat data dashboard Wali Kelas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const handleClassChange = (classId) => {
    setSelectedClassId(classId)
    fetchDashboard(classId)
  }

  if (loading && !data) return <SkeletonDashboard />
  if (error && !data) return <ErrorState message={error} onRetry={() => fetchDashboard(selectedClassId)} />

  const kpis = data?.kpis || {}
  const context = data?.context || {}
  const charts = data?.charts || {}
  const tables = data?.tables || {}
  const rombelOptions = context.rombel_options || []

  const formatNumber = (num) => (num !== undefined && num !== null ? Number(num).toLocaleString('id-ID') : '0')

  const studentColumns = [
    {
      key: 'full_name',
      label: 'Nama Siswa',
      sortable: true,
      render: (row) => (
        <span className="font-extrabold text-slate-900 dark:text-white text-xs">{row.full_name}</span>
      ),
    },
    {
      key: 'nisn',
      label: 'NISN',
      render: (row) => <span className="text-xs font-mono text-slate-600 dark:text-slate-300">{row.nisn || '-'}</span>,
    },
    {
      key: 'gender',
      label: 'Jenis Kelamin',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          {row.gender === 'male' || row.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (row) => (
        <AppBadge variant={row.is_active ? 'success' : 'secondary'} dot>
          {row.is_active ? 'Aktif' : 'Non-aktif'}
        </AppBadge>
      ),
    },
  ]

  return (
    <PageContainer maxW="7xl">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-12">
      {/* Breadcrumb Navigation */}
      <motion.div variants={itemVariants}>
        <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Dashboard Wali Kelas' }]} />
      </motion.div>

      {/* MODERN HERO CARD HEADER (MATCHING KEPALA SEKOLAH STYLE) */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
        <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-emerald-500/20 dark:border-emerald-800/40">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
              <Users className="size-6 sm:size-7 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Dashboard Wali Kelas
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                  {context.rombel?.nama || 'Rombel Binaan'}
                </span>
              </div>
              <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Dashboard Wali Kelas — {context.rombel?.nama || 'Rombel Binaan'}
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                Monitoring presensi, akademik, tahfizh, mutabaah, dan kelengkapan catatan siswa rombel binaan.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 z-10">
            <AppBadge variant="info" className="font-extrabold">TA {context.tahun_ajaran?.nama || '2026/2027'}</AppBadge>
            <AppBadge variant="purple" className="font-extrabold">Semester {context.semester?.nama || 'Ganjil'}</AppBadge>
            {rombelOptions.length > 1 && (
              <CustomSelect
                value={selectedClassId || context.rombel?.id || ''}
                onChange={(e) => handleClassChange(e.target.value)}
                className="rounded-xl border border-emerald-500/30 bg-white/90 px-3.5 py-2 text-xs font-extrabold text-slate-800 shadow-sm focus:border-emerald-600 focus:outline-none dark:border-emerald-800 dark:bg-slate-900 dark:text-slate-100 cursor-pointer"
              >
                {rombelOptions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nama_kelas}
                  </option>
                ))}
              </CustomSelect>
            )}
            <AppButton variant="outline" size="sm" icon={RefreshCw} onClick={() => fetchDashboard(selectedClassId)} className="border-emerald-500/30 text-emerald-800 hover:bg-emerald-500/10 dark:text-emerald-200">
              Segarkan Data
            </AppButton>
          </div>
        </div>

        {/* 3-Summary Info inside Hero */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/60 dark:bg-slate-900/50 border border-emerald-500/20 dark:border-emerald-800/40">
            <Layers className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white block">Rombongan Belajar</span>
              <span className="text-slate-600 dark:text-slate-400 font-medium">{context.rombel?.nama || 'Rombel Binaan'}</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/60 dark:bg-slate-900/50 border border-emerald-500/20 dark:border-emerald-800/40">
            <Calendar className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400 mt-0.5" />
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white block">Periode Akademik Aktif</span>
              <span className="text-slate-600 dark:text-slate-400 font-medium">TA {context.tahun_ajaran?.nama || '2026/2027'} • Semester {context.semester?.nama || 'Ganjil'}</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/60 dark:bg-slate-900/50 border border-emerald-500/20 dark:border-emerald-800/40">
            <Users className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white block">Total Siswa Terdaftar</span>
              <span className="text-slate-600 dark:text-slate-400 font-medium">{formatNumber(kpis.total_siswa_rombel?.total)} Siswa Binaan</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Primary Unit KPIs - Modern Style Cards */}
      <motion.section variants={itemVariants} className="space-y-3">
        <SectionHeader title="Kondisi Presensi & Izin Siswa Rombel" subtitle="Jumlah siswa, tingkat kehadiran hari ini, dan permohonan izin" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ModernKpiCard
            title="Total Siswa Rombel"
            value={formatNumber(kpis.total_siswa_rombel?.total)}
            subtext="Terdaftar aktif di rombel"
            icon={Users}
            tone="emerald"
            tag="Binaan"
            onClick={() => setActiveModal('total_siswa_rombel')}
          />
          <ModernKpiCard
            title="Hadir Hari Ini"
            value={formatNumber(kpis.siswa_hadir_hari_ini?.total)}
            subtext="Kehadiran tepat waktu"
            icon={CheckCircle2}
            tone="blue"
            tag="Presensi"
          />
          <ModernKpiCard
            title="Terlambat Hari Ini"
            value={formatNumber(kpis.siswa_terlambat?.total)}
            subtext="Perlu pendampingan"
            icon={Clock}
            tone="amber"
            tag="Scan Gerbang"
          />
          <ModernKpiCard
            title="Permohonan Izin / Sakit"
            value={formatNumber(kpis.pending_permissions?.total)}
            subtext="Menunggu approval wali"
            icon={FileText}
            tone="rose"
            tag="Perlu Tindakan"
            onClick={() => setActiveModal('pending_permissions')}
          />
        </div>
      </motion.section>

      {/* Secondary KPI Grid - Modern Summary Cards */}
      <motion.section variants={itemVariants} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ModernSummaryCard
            title="Catatan Siswa Aktif"
            value={formatNumber(kpis.active_student_notes?.total)}
            subtext="Perlu pembinaan lanjutan"
            icon={AlertTriangle}
            tone="amber"
            tag="Catatan Wali"
            onClick={() => setActiveModal('active_student_notes')}
          />
          <ModernSummaryCard
            title="Tindak Lanjut Catatan"
            value={formatNumber(kpis.followup_notes?.total)}
            subtext="Telah diproses wali"
            icon={FileCheck}
            tone="emerald"
            tag="Selesai"
          />
          <ModernSummaryCard
            title="Mutabaah Belum TTD Ortu"
            value={formatNumber(kpis.unsigned_parent_notes?.total)}
            subtext="Buku kendali ibadah harian"
            icon={Award}
            tone="purple"
            tag="Buku Ibadah"
          />
          <ModernSummaryCard
            title="Izin Perlu Verifikasi"
            value={formatNumber(kpis.pending_permissions?.total)}
            subtext="Konfirmasi presensi siswa"
            icon={CheckCircle2}
            tone="indigo"
            tag="Verifikasi"
            onClick={() => setActiveModal('pending_permissions')}
          />
        </div>
      </motion.section>

      {/* Quick Action Navigation (Soft Pastel Squircle Buttons) */}
      <motion.section variants={itemVariants} className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#0E5C44]/10 text-[#0E5C44] dark:bg-[#3FBF75]/20 dark:text-[#3FBF75]">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Aksi Cepat Wali Kelas</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pintas manajemen presensi rombel, catatan wali, rekap mutabaah, dan tahfizh</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* 1. Presensi Rombel - Emerald Theme */}
            <button
              type="button"
              onClick={() => navigate('/absensi/dashboard-wali-kelas')}
              className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-2.5 transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-50/50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-emerald-700/60 dark:hover:bg-emerald-950/30 text-left cursor-pointer"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100/80 text-emerald-600 border border-emerald-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 pr-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300">Presensi Rombel</p>
                <p className="text-[10px] text-slate-400 truncate">Input Kehadiran</p>
              </div>
            </button>

            {/* 2. Input Catatan Wali - Amber Theme */}
            <button
              type="button"
              onClick={() => navigate('/absensi/dashboard-wali-kelas')}
              className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-2.5 transition-all duration-200 hover:border-amber-300 hover:bg-amber-50/50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-amber-700/60 dark:hover:bg-amber-950/30 text-left cursor-pointer"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100/80 text-amber-600 border border-amber-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 pr-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-amber-700 dark:group-hover:text-amber-300">Catatan Wali</p>
                <p className="text-[10px] text-slate-400 truncate">Bimbingan & Disiplin</p>
              </div>
            </button>

            {/* 3. Rekap Presensi - Sky Blue Theme */}
            <button
              type="button"
              onClick={() => navigate('/absensi/rekap-kehadiran')}
              className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-2.5 transition-all duration-200 hover:border-sky-300 hover:bg-sky-50/50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-sky-700/60 dark:hover:bg-sky-950/30 text-left cursor-pointer"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100/80 text-sky-600 border border-sky-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-sky-950/60 dark:text-sky-400 dark:border-sky-800/60">
                <FileCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0 pr-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-sky-700 dark:group-hover:text-sky-300">Rekap Presensi</p>
                <p className="text-[10px] text-slate-400 truncate">Riwayat Kehadiran</p>
              </div>
            </button>

            {/* 4. Rekap Tahfizh - Violet Theme */}
            <button
              type="button"
              onClick={() => navigate('/portal-guru/workspace?tab=tahfizh')}
              className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-2.5 transition-all duration-200 hover:border-violet-300 hover:bg-violet-50/50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-violet-700/60 dark:hover:bg-violet-950/30 text-left cursor-pointer"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100/80 text-violet-600 border border-violet-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-violet-950/60 dark:text-violet-400 dark:border-violet-800/60">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0 pr-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-violet-700 dark:group-hover:text-violet-300">Rekap Tahfizh</p>
                <p className="text-[10px] text-slate-400 truncate">Hafalan Al-Qur'an</p>
              </div>
            </button>
          </div>
        </div>
      </motion.section>

      {/* Attendance Chart & Students Table */}
      <motion.section variants={itemVariants} className="space-y-3">
        <SectionHeader title="Distribusi Presensi & Daftar Siswa Rombel" subtitle="Persentase kehadiran hari ini dan tabel siswa binaan" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/5 space-y-4 dark:border-emerald-600/35 dark:bg-[#1B2433] flex flex-col justify-between">
            <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
            <div className="space-y-3">
              <div className="pb-3 border-b border-emerald-500/15 dark:border-emerald-800/40">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Distribusi Presensi Siswa
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Persentase kehadiran per kategori presensi rombel
                </p>
              </div>

              <div className="h-64 w-full pt-2">
                {!charts.attendance_distribution || charts.attendance_distribution.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
                    Belum ada data distribusi presensi
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.attendance_distribution || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="total"
                        nameKey="status"
                      >
                        {(charts.attendance_distribution || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <AppDataTable
              title="Daftar Siswa Rombel"
              description="Identitas dan status siswa binaan di rombel ini"
              data={tables.students || []}
              columns={studentColumns}
              keyField="full_name"
              searchPlaceholder="Cari nama atau NISN..."
            />
          </div>
        </div>
      </motion.section>

      {/* KPI Detail Modal */}
      <ModalErrorBoundary onClose={() => setActiveModal(null)}>
        <KpiQuickViewModal
          type={activeModal}
          isOpen={Boolean(activeModal)}
          onClose={() => setActiveModal(null)}
        />
      </ModalErrorBoundary>
      </motion.div>
    </PageContainer>
  )
}
