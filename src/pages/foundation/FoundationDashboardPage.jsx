import React, { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Building2,
  Users,
  UserCheck,
  GraduationCap,
  HeartHandshake,
  School,
  Layers,
  Award,
  CheckCircle2,
  Clock3,
  BookOpen,
  TrendingUp,
  FileSpreadsheet,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Bell,
  Activity,
  RefreshCw,
  Eye,
  Filter,
  Network,
  ChevronRight,
  Zap,
  Printer,
  Download
} from 'lucide-react'
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'

import { HeroUiHeader } from '../../components/ui/HeroUiHeader'
import { Tooltip as UiTooltip } from '../../components/ui/tooltip'
import HeroUiFilterSelect from '../../components/ui/HeroUiFilterSelect'
import { SmartScrollFab } from '../../components/common'
import FoundationDisciplineExecutiveSection from '../../components/foundation/FoundationDisciplineExecutiveSection'
import { Button } from '../../components/ui/button'
import {
  AppBreadcrumb,
  AppBadge,
  AppButton,
  SectionHeader,
  KpiStatCard
} from '../../components/app'
import PageContainer from '../../components/app/PageContainer'
import { QuickAccessCard } from '../../components/master-data'

import SkeletonDashboard from '../../components/dashboard/SkeletonDashboard'
import ErrorState from '../../components/dashboard/ErrorState'
import KpiQuickViewModal from '../../components/KpiQuickViewModal'
import ModalErrorBoundary from '../../components/common/ModalErrorBoundary'
import KpiDetailDrawer from '../../components/KpiDetailDrawer'

import api from '../../services/api'
import { useAuthStore } from '../../stores/authStore'
import { getUserRoleLevel, ROLE_LEVELS } from '../../auth/portalResolver'

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

const PASTEL_PALETTES = [
  {
    card: 'border-emerald-300 dark:border-emerald-700/80 bg-gradient-to-b from-[#E6F8F3] via-[#E6F8F3]/30 to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-emerald-500',
    iconBox: 'bg-emerald-600 text-white shadow-xs',
    tagHeader: 'text-emerald-800 dark:text-emerald-300',
    tag: 'bg-[#D1FAE5] text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60',
    divider: 'border-emerald-100 dark:border-emerald-900/60',
    cta: 'text-emerald-700 dark:text-emerald-400',
  },
  {
    card: 'border-amber-300 dark:border-amber-700/80 bg-gradient-to-b from-[#FEF3C7]/70 via-[#FEF3C7]/20 to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-amber-500',
    iconBox: 'bg-amber-500 text-white shadow-xs',
    tagHeader: 'text-amber-800 dark:text-amber-300',
    tag: 'bg-[#FEF3C7] text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60',
    divider: 'border-amber-100 dark:border-amber-900/60',
    cta: 'text-amber-700 dark:text-amber-400',
  },
  {
    card: 'border-sky-300 dark:border-sky-700/80 bg-gradient-to-b from-[#E0F2FE]/70 via-[#E0F2FE]/20 to-white dark:from-sky-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-sky-500',
    iconBox: 'bg-sky-600 text-white shadow-xs',
    tagHeader: 'text-sky-800 dark:text-sky-300',
    tag: 'bg-[#E0F2FE] text-sky-900 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60',
    divider: 'border-sky-100 dark:border-sky-900/60',
    cta: 'text-sky-700 dark:text-sky-400',
  },
  {
    card: 'border-teal-300 dark:border-teal-700/80 bg-gradient-to-b from-[#CCFBF1]/70 via-[#CCFBF1]/20 to-white dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-teal-500',
    iconBox: 'bg-teal-600 text-white shadow-xs',
    tagHeader: 'text-teal-800 dark:text-teal-300',
    tag: 'bg-[#CCFBF1] text-teal-900 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60',
    divider: 'border-teal-100 dark:border-teal-900/60',
    cta: 'text-teal-700 dark:text-teal-400',
  },
  {
    card: 'border-purple-300 dark:border-purple-700/80 bg-gradient-to-b from-[#F3E8FF]/70 via-[#F3E8FF]/20 to-white dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-purple-500',
    iconBox: 'bg-purple-600 text-white shadow-xs',
    tagHeader: 'text-purple-800 dark:text-purple-300',
    tag: 'bg-[#F3E8FF] text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60',
    divider: 'border-purple-100 dark:border-purple-900/60',
    cta: 'text-purple-700 dark:text-purple-400',
  },
  {
    card: 'border-rose-300 dark:border-rose-700/80 bg-gradient-to-b from-[#FFE4E6]/70 via-[#FFE4E6]/20 to-white dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-rose-500',
    iconBox: 'bg-rose-500 text-white shadow-xs',
    tagHeader: 'text-rose-800 dark:text-rose-300',
    tag: 'bg-[#FFE4E6] text-rose-900 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60',
    divider: 'border-rose-100 dark:border-rose-900/60',
    cta: 'text-rose-700 dark:text-rose-400',
  },
]

const CATEGORY_COLOR_MAP = {
  all: {
    active: 'bg-emerald-600 text-white shadow-xs',
    inactive: 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/90 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
    countActive: 'bg-white/25 text-white',
    countInactive: 'bg-emerald-200/70 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200',
  },
  TK: {
    active: 'bg-sky-600 text-white shadow-xs',
    inactive: 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200/90 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60',
    countActive: 'bg-white/25 text-white',
    countInactive: 'bg-sky-200/70 text-sky-900 dark:bg-sky-900/60 dark:text-sky-200',
  },
  SD: {
    active: 'bg-amber-600 text-white shadow-xs',
    inactive: 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/90 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
    countActive: 'bg-white/25 text-white',
    countInactive: 'bg-amber-200/70 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200',
  },
  SMP: {
    active: 'bg-purple-600 text-white shadow-xs',
    inactive: 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200/90 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60',
    countActive: 'bg-white/25 text-white',
    countInactive: 'bg-purple-200/70 text-purple-900 dark:bg-purple-900/60 dark:text-purple-200',
  },
  SMA: {
    active: 'bg-rose-600 text-white shadow-xs',
    inactive: 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/90 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
    countActive: 'bg-white/25 text-white',
    countInactive: 'bg-rose-200/70 text-rose-900 dark:bg-rose-900/60 dark:text-rose-200',
  },
  PON: {
    active: 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/20',
    inactive: 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/90 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
    countActive: 'bg-white/25 text-white',
    countInactive: 'bg-emerald-200/70 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200',
  },
  MAH: {
    active: 'bg-teal-600 text-white shadow-xs',
    inactive: 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200/90 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60',
    countActive: 'bg-white/25 text-white',
    countInactive: 'bg-teal-200/70 text-teal-900 dark:bg-teal-900/60 dark:text-teal-200',
  },
}

function ModernKpiCard({ card, onClick }) {
  const toneMap = {
    emerald: 'emerald',
    sky: 'sky',
    violet: 'violet',
    indigo: 'indigo',
    amber: 'amber',
    rose: 'rose',
    purple: 'purple',
    blue: 'blue',
    teal: 'teal',
  }

  return (
    <KpiStatCard
      card={card}
      icon={card?.icon}
      title={card?.title}
      value={card?.formattedValue ?? card?.value}
      description={card?.subtext}
      badge={card?.badgeText || card?.tag}
      tone={toneMap[card?.tone] || card?.tone || 'emerald'}
      onClick={onClick}
      ctaText={card?.ctaText}
      footerAction={onClick ? { label: card?.ctaText || 'Lihat Rincian', onClick } : undefined}
    />
  )
}

function VibrantMetricCard({
  icon: Icon,
  title,
  label,
  value,
  subtitle,
  subtext,
  description,
  tag,
  badge,
  tone = 'emerald',
  variant,
  ctaText,
  onClick,
  active = false,
  isActive = false,
  className = '',
  trend,
  trendText,
  card,
  ...props
}) {
  return (
    <KpiStatCard
      icon={Icon || card?.icon}
      title={card?.title || title || label}
      value={card?.formattedValue ?? card?.value ?? value}
      description={
        card?.subtext ||
        subtitle ||
        subtext ||
        description ||
        (trendText ? `${trend ? trend + ' ' : ''}${trendText}` : undefined)
      }
      badge={card?.badgeText || badge || tag}
      tone={variant || tone || card?.tone || 'emerald'}
      ctaText={ctaText || card?.ctaText || card?.footerLabel || (onClick ? 'Lihat Rincian' : 'Statistik')}
      onClick={onClick || card?.onClick}
      className={className}
      active={active || isActive}
      trend={trend}
      trendText={trendText}
      card={card}
      {...props}
    />
  )
}

export function FoundationDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const userLevel = useMemo(() => getUserRoleLevel(user), [user])
  const isSuperAdmin = userLevel === ROLE_LEVELS.SUPER_ADMIN || userLevel === ROLE_LEVELS.ADMIN_SISTEM
  const isKepalaSekolah = userLevel === ROLE_LEVELS.KEPALA_SEKOLAH

  const [selectedUnitFilter, setSelectedUnitFilter] = useState('all')
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState('year')
  const [activeModal, setActiveModal] = useState(null)
  const [detailDrawer, setDetailDrawer] = useState({ isOpen: false, type: null, id: null })
  const [cardUnitFilter, setCardUnitFilter] = useState('all')

  // ── 1. TANSTACK REACT QUERY V5 FETCHING DENGAN CACHING ──
  const {
    data,
    isLoading: loading,
    isError,
    error: queryError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['foundation-dashboard-overview', selectedUnitFilter, selectedPeriodFilter],
    queryFn: async () => {
      const res = await api.get('/foundation/dashboard', {
        params: { unit_id: selectedUnitFilter, period: selectedPeriodFilter },
      })
      return res?.data?.data || null
    },
    staleTime: 60000,
    placeholderData: (previousData) => previousData,
  })

  // ── 2. TANSTACK REACT QUERY UNTUK UNITS LIST ──
  const { data: unitsList = [] } = useQuery({
    queryKey: ['foundation-units-list'],
    queryFn: async () => {
      const res = await api.get('/foundation/units')
      return res?.data?.data || []
    },
    staleTime: 120000,
  })

  const handleUnitFilterChange = (unitId) => {
    setSelectedUnitFilter(unitId)
  }

  const handleResetFilter = useCallback(() => {
    setSelectedUnitFilter('all')
    setSelectedPeriodFilter('year')
    setCardUnitFilter('all')
  }, [])

  const handleOpenUnitDetail = (unit) => {
    setDetailDrawer({
      isOpen: true,
      type: 'unit_pendidikan',
      id: unit.id,
    })
  }

  const kpis = data?.kpis || {}
  const charts = data?.charts || {}
  const unitSummaries = data?.unit_summaries || []
  const recentInformation = data?.recent_information || []
  const recentActivities = data?.recent_activities || []
  const monitoringAkademik = data?.monitoring_akademik || {}
  const monitoringIbadah = data?.monitoring_ibadah || {}
  const sdmDistribution = charts.sdm_distribution || []
  const prestasiDistribution = charts.prestasi_distribution || []

  const formatNumber = (num) =>
    num !== undefined && num !== null ? Number(num).toLocaleString('id-ID') : '0'

  // ── 3. EXPORT & PRINT HANDLERS ──
  const handlePrintDashboard = () => {
    window.print()
  }

  const handleExportUnitsCsv = () => {
    if (!filteredUnitSummaries || filteredUnitSummaries.length === 0) return

    const headers = ['ID', 'Nama Unit', 'Kode', 'Jenis Unit', 'Siswa Aktif', 'Guru Pendidik', 'Pegawai & Tendik']
    const csvRows = [
      headers.join(','),
      ...filteredUnitSummaries.map((u) => [
        u.id || '',
        `"${(u.name || '').replace(/"/g, '""')}"`,
        `"${(u.code || '').replace(/"/g, '""')}"`,
        `"${(u.jenis_unit || u.level || '').replace(/"/g, '""')}"`,
        u.siswa_aktif_count ?? u.siswa_count ?? 0,
        u.guru_count || 0,
        u.pegawai_count || 0,
      ].join(',')),
    ]

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `ringkasan_unit_yayasan_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getUnitCategoryKey = (row) => {
    const code = (row.code || '').toUpperCase()
    const name = (row.name || '').toUpperCase()
    const jenis = (row.jenis_unit || row.level || '').toUpperCase()

    if (
      code.includes('TK') ||
      code.includes('TAU') ||
      name.includes('TK') ||
      name.includes('TAUD') ||
      jenis.includes('KANAK') ||
      jenis.includes('USIA DINI')
    ) {
      return 'TK'
    }
    if (
      code.includes('SD') ||
      code.includes('MIT') ||
      name.includes('SD') ||
      name.includes('MIT') ||
      jenis.includes('DASAR') ||
      jenis.includes('IBTIDAIYAH')
    ) {
      return 'SD'
    }
    if (code.includes('SMP') || name.includes('SMP') || jenis.includes('PERTAMA')) {
      return 'SMP'
    }
    if (code.includes('SMA') || name.includes('SMA') || jenis.includes('ATAS')) {
      return 'SMA'
    }
    if (
      code.includes('PON') ||
      name.includes('PONPES') ||
      name.includes('PESANTREN') ||
      jenis.includes('PESANTREN')
    ) {
      return 'PON'
    }
    if (
      code.includes('MAH') ||
      name.includes('MAHAD') ||
      name.includes("MA'HAD") ||
      jenis.includes('MAHAD') ||
      jenis.includes("MA'HAD")
    ) {
      return 'MAH'
    }
    return code || 'OTHERS'
  }

  const getShortUnitBadgeLabel = (row) => {
    const val = (row?.jenis_unit || row?.level || '').trim()
    if (!val) return 'Unit'
    const upper = val.toUpperCase()
    if (upper.includes('KANAK') || upper.includes('TK')) return 'TKIT'
    if (upper.includes('USIA DINI') || upper.includes('TAUD')) return 'TAUD'
    if (upper.includes('DASAR') || upper.includes('SD')) return 'SDIT'
    if (upper.includes('IBTIDAIYAH') || upper.includes('MIT')) return 'MIT'
    if (upper.includes('PERTAMA') || upper.includes('SMP')) return 'SMPIT'
    if (upper.includes('ATAS') || upper.includes('SMA')) return 'SMAIT'
    if (upper.includes('PESANTREN') || upper.includes('PON')) return 'Ponpes'
    if (upper.includes('MAHAD') || upper.includes("MA'HAD") || upper.includes('MAH')) return "Ma'had"
    if (val.length > 12) return val.substring(0, 10) + '...'
    return val
  }

  const categoryCounts = useMemo(() => {
    const counts = {
      all: unitSummaries.length,
      TK: 0,
      SD: 0,
      SMP: 0,
      SMA: 0,
      PON: 0,
      MAH: 0,
    }
    unitSummaries.forEach((row) => {
      const key = getUnitCategoryKey(row)
      if (counts[key] !== undefined) {
        counts[key] += 1
      } else {
        counts[key] = (counts[key] || 0) + 1
      }
    })
    return counts
  }, [unitSummaries])

  const availableFilterCategories = useMemo(() => {
    const defaultCats = [
      { id: 'all', label: 'Semua Unit' },
      { id: 'TK', label: 'TK / PAUD' },
      { id: 'SD', label: 'SD / MI' },
      { id: 'SMP', label: 'SMP' },
      { id: 'SMA', label: 'SMA' },
      { id: 'PON', label: 'Pondok Pesantren' },
      { id: 'MAH', label: "Ma'had" },
    ]
    const extraKeys = Object.keys(categoryCounts).filter(
      (k) => !defaultCats.some((c) => c.id === k) && categoryCounts[k] > 0
    )
    extraKeys.forEach((k) => {
      defaultCats.push({ id: k, label: k })
    })
    return defaultCats
  }, [categoryCounts])

  const unitFilterOptions = useMemo(
    () => [
      {
        value: 'all',
        label: `Semua Unit Pendidikan (${unitsList.length ? `${unitsList.length} Unit` : 'Terdaftar'})`,
        badge: 'SEMUA',
        subtext: 'Agregat monitoring seluruh unit yayasan',
      },
      ...unitsList.map((u) => ({
        value: String(u.id),
        label: u.name,
        badge: u.code || u.jenis_unit || 'Unit',
        subtext: u.alamat || `${u.student_count || 0} Siswa • ${u.employee_count || 0} Pegawai`,
      })),
    ],
    [unitsList]
  )

  const periodFilterOptions = useMemo(
    () => [
      { value: 'year', label: 'Tahun Berjalan (2026/2027)', badge: 'TAHUNAN', subtext: 'Akumulasi tahun ajaran aktif' },
      { value: 'semester', label: 'Semester Berjalan', badge: 'SEMESTER', subtext: 'Data semester ganjil/genap aktif' },
      { value: 'month', label: 'Bulan Ini', badge: 'BULANAN', subtext: 'Rekapitulasi 30 hari terakhir' },
    ],
    []
  )

  const mobileCategoryOptions = useMemo(
    () =>
      availableFilterCategories.map((cat) => ({
        value: cat.id,
        label: cat.label,
        badge: `${categoryCounts[cat.id] || 0} Unit`,
      })),
    [availableFilterCategories, categoryCounts]
  )

  const filteredUnitSummaries = useMemo(() => {
    if (cardUnitFilter === 'all') return unitSummaries
    return unitSummaries.filter((row) => {
      const catKey = getUnitCategoryKey(row)
      if (cardUnitFilter === catKey) return true
      const code = (row.code || '').toUpperCase()
      const jenis = (row.jenis_unit || row.level || '').toUpperCase()
      return code === cardUnitFilter.toUpperCase() || jenis === cardUnitFilter.toUpperCase()
    })
  }, [unitSummaries, cardUnitFilter])

  if (loading && !data) return <SkeletonDashboard />
  if (isError && !data) {
    return (
      <ErrorState
        message={queryError?.response?.data?.message || 'Gagal memuat data dashboard yayasan.'}
        onRetry={() => refetch()}
      />
    )
  }

  const isFiltered = selectedUnitFilter !== 'all' || selectedPeriodFilter !== 'year'

  // Header Title & Context
  const pageTitle = isSuperAdmin
    ? 'Dashboard Eksekutif Yayasan'
    : isKepalaSekolah
    ? 'Dashboard Kepala Sekolah'
    : 'Dashboard Pengurus Yayasan'

  const roleBadge = isSuperAdmin ? 'Super Admin (Supervisi)' : isKepalaSekolah ? 'Kepala Sekolah' : 'Pengurus Yayasan'

  return (
    <PageContainer maxW="7xl">
      <div className="mb-4">
        <AppBreadcrumb items={[{ label: pageTitle }]} />
      </div>

      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-12">
        {/* Header Halaman Modern Hero Card */}
        <motion.div variants={itemVariants} className="print:hidden">
          <HeroUiHeader
            title={pageTitle}
            subtitle={`Pusat kendali eksekutif: monitoring terpadu kinerja SDM guru & pegawai, rekapitulasi santri & siswa, analisis akademik, dan supervisi ${formatNumber(kpis.unit_pendidikan?.total ?? kpis.total_unit_aktif ?? unitsList.length)} unit pendidikan yayasan.`}
            badge={roleBadge}
            icon={Building2}
            actions={
              <div className="flex items-center gap-2 shrink-0 self-start lg:self-center">
                <UiTooltip content="Perbarui Data Dashboard">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    aria-label="Perbarui Data Dashboard"
                    className="size-9 rounded-xl border-2 border-emerald-300 dark:border-emerald-700 bg-white hover:bg-emerald-50 text-emerald-800 dark:bg-slate-900 dark:text-emerald-300 shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center justify-center p-0"
                  >
                    <RefreshCw className={`size-4 text-emerald-700 dark:text-emerald-300 ${isFetching ? 'animate-spin' : ''}`} />
                  </Button>
                </UiTooltip>
              </div>
            }
          />
        </motion.div>

        {/* Informasi Resmi & Aktivitas Terbaru */}
        <motion.section variants={itemVariants} className="space-y-3">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-stretch">
            {/* Announcements Feed */}
            <div className="relative overflow-hidden rounded-container border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-sm dark:border-emerald-600/35 dark:bg-card-dark lg:col-span-7 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-950/40 px-5 py-4 dark:border-emerald-800/40 min-h-[72px] h-[72px]">
                <div className="flex items-center gap-3">
                  <div className="flex size-8.5 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                    <Bell className="size-4.5 text-white" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200 leading-tight">Pengumuman & Agenda Yayasan</h3>
                    <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 font-medium mt-0.5">Informasi dan edaran resmi terbaru lintas unit</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-black text-white shadow-xs">
                  {recentInformation.length} Informasi
                </span>
              </div>

              <div className="p-5 sm:p-6 space-y-3 flex-1">
                {recentInformation.map((info) => (
                  <div
                    key={info.id}
                    className="group rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 border-l-4 border-l-sky-500 bg-white/90 p-3.5 transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md dark:border-l-sky-400 dark:bg-card-dark space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400 transition line-clamp-1">
                        {info.judul}
                      </h4>
                      <span className="shrink-0 rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-extrabold text-sky-700 dark:bg-sky-900/80 dark:text-sky-300">
                        {info.tanggal}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">{info.isi}</p>
                  </div>
                ))}
                {!recentInformation.length && (
                  <p className="py-8 text-center text-xs text-slate-400 italic">Belum ada pengumuman resmi terbaru.</p>
                )}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="relative overflow-hidden rounded-container border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-sm dark:border-emerald-600/35 dark:bg-card-dark lg:col-span-5 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-950/40 px-5 py-4 dark:border-emerald-800/40 min-h-[72px] h-[72px]">
                <div className="flex items-center gap-3">
                  <div className="flex size-8.5 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                    <Activity className="size-4.5 text-white" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200 leading-tight">Aktivitas Sistem Terbaru</h3>
                    <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 font-medium mt-0.5">Log presensi, nilai & mutaba'ah real-time</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-black text-white shadow-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                  <span>Live Feed</span>
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-2.5 flex-1">
                {recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 border-l-4 border-l-emerald-500 bg-white/90 p-3 transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md dark:border-l-emerald-400 dark:bg-card-dark"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition">
                        {act.title}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate font-medium">
                        {act.subtitle}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-emerald-100 px-2.5 py-1 text-[10px] font-black text-emerald-800 dark:bg-emerald-900/90 dark:text-emerald-200">
                      {act.time}
                    </span>
                  </div>
                ))}
                {!recentActivities.length && (
                  <p className="py-8 text-center text-xs text-slate-400 italic">Belum ada aktivitas terbaru tercatat.</p>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Filter Global Unit & Periode & Akses Cepat Modul Eksekutif */}
        <motion.section variants={itemVariants} className="space-y-3">
          <div className="relative overflow-hidden rounded-container border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-sm dark:border-emerald-600/35 dark:bg-card-dark">
            <div className="flex items-center justify-between border-b border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-950/40 px-5 py-4 dark:border-emerald-800/40 min-h-[72px] h-[72px]">
              <div className="flex items-center gap-3">
                <div className="flex size-8.5 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                  <Filter className="size-4.5 text-white" strokeWidth={2.2} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      Filter Monitoring Yayasan
                    </h2>
                    {isFiltered && (
                      <span className="inline-flex items-center rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-black text-white shadow-xs">
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Pilih unit pendidikan & rentang periode data
                  </p>
                </div>
              </div>

              {isFiltered && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilter}
                  prefixIcon={<RefreshCw className="size-3.5" />}
                  className="rounded-xl font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/90 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300 shadow-xs transition cursor-pointer text-xs h-8 px-3.5"
                >
                  Reset Filter
                </Button>
              )}
            </div>

            <div className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 sm:gap-5 min-w-0">
                {/* Filter 1: Unit Pendidikan */}
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">Unit:</span>
                  <div className="flex-1 min-w-0">
                    <HeroUiFilterSelect
                      value={selectedUnitFilter}
                      onChange={(val) => handleUnitFilterChange(val || 'all')}
                      options={unitFilterOptions}
                      placeholder="Pilih Unit..."
                      icon={School}
                      searchable={true}
                      popoverWidth="w-80 sm:w-96"
                      size="md"
                    />
                  </div>
                </div>

                {/* Filter 2: Periode Data */}
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">Periode:</span>
                  <div className="flex-1 min-w-0">
                    <HeroUiFilterSelect
                      value={selectedPeriodFilter}
                      onChange={(val) => setSelectedPeriodFilter(val || 'year')}
                      options={periodFilterOptions}
                      placeholder="Pilih Periode..."
                      icon={Calendar}
                      popoverWidth="w-72"
                      size="md"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Akses Cepat Modul Eksekutif */}
          <div className="relative overflow-hidden rounded-container border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-sm dark:border-emerald-600/35 dark:bg-card-dark">
            <div className="flex items-center justify-between border-b border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-950/40 px-5 py-4 dark:border-emerald-800/40 min-h-[72px] h-[72px]">
              <div className="flex items-center gap-3">
                <div className="flex size-8.5 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                  <Sparkles className="size-4.5 text-white" strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Akses Cepat Modul Eksekutif</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Navigasi langsung ke modul monitoring spesifik yayasan</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-black text-white shadow-xs">
                5 Modul
              </span>
            </div>

            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <QuickAccessCard
                  tone="emerald"
                  icon={UserCheck}
                  title="Pegawai & Guru"
                  subtitle="SDM Seluruh Unit"
                  onClick={() => navigate('/dashboard/yayasan/pegawai-guru')}
                />
                <QuickAccessCard
                  tone="sky"
                  icon={Network}
                  title="Struktur Organisasi"
                  subtitle="Hirarki Per Unit"
                  onClick={() => navigate('/dashboard/yayasan/struktur-organisasi')}
                />
                <QuickAccessCard
                  tone="purple"
                  icon={Users}
                  title="Data Siswa"
                  subtitle="Tahun Ajaran"
                  onClick={() => navigate('/dashboard/yayasan/siswa')}
                />
                <QuickAccessCard
                  tone="amber"
                  icon={GraduationCap}
                  title="Siswa Masuk/Keluar"
                  subtitle="Mobilisasi Siswa"
                  onClick={() => navigate('/dashboard/yayasan/siswa-baru')}
                />
                <QuickAccessCard
                  tone="rose"
                  icon={Building2}
                  title="Unit Pendidikan"
                  subtitle="Seluruh Unit"
                  onClick={() => navigate('/dashboard/yayasan/unit-pendidikan')}
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* KPI Cards Grid - Strictly Zero Hardcode Database Values */}
        {(() => {
          const primaryCards = [
            {
              title: 'Total Unit Pendidikan',
              formattedValue: formatNumber(kpis.unit_pendidikan?.total ?? kpis.total_unit_aktif ?? unitsList.length),
              icon: Building2,
              tone: 'emerald',
              modalKey: 'total_units',
              badgeText: 'Terdaftar',
              subtext: 'Unit Sekolah Terdata',
              ctaText: 'Rincian Unit',
            },
            {
              title: 'Unit Sekolah Aktif',
              formattedValue: formatNumber(kpis.unit_pendidikan?.total ?? kpis.total_unit_aktif ?? unitsList.length),
              icon: School,
              tone: 'sky',
              modalKey: 'active_units',
              badgeText: 'Aktif',
              subtext: 'Operasional Berjalan',
              ctaText: 'Status Operasional',
            },
            {
              title: 'Total Pegawai & Tendik',
              formattedValue: formatNumber(kpis.pegawai?.total ?? kpis.total_pegawai ?? 0),
              icon: UserCheck,
              tone: 'violet',
              modalKey: 'total_employees',
              badgeText: 'SDM Staf',
              subtext: 'Tenaga Kependidikan',
              ctaText: 'Rincian Tendik',
            },
            {
              title: 'Total Guru Pengajar',
              formattedValue: formatNumber(kpis.guru?.total ?? kpis.total_guru ?? 0),
              icon: GraduationCap,
              tone: 'indigo',
              modalKey: 'total_teachers',
              badgeText: 'Pendidik',
              subtext: 'Guru Aktif Mengajar',
              ctaText: 'Komposisi Guru',
            },
            {
              title: 'Total Siswa Aktif',
              formattedValue: formatNumber(kpis.siswa?.total ?? kpis.total_siswa_aktif ?? 0),
              icon: Users,
              tone: 'amber',
              modalKey: 'total_students',
              badgeText: 'Siswa',
              subtext: 'Peserta Didik Aktif',
              ctaText: 'Distribusi Siswa',
            },
          ]

          const secondaryCards = [
            {
              title: 'Total Orang Tua / Wali',
              formattedValue: formatNumber(kpis.orang_tua?.total ?? kpis.total_ortu ?? 0),
              icon: HeartHandshake,
              tone: 'rose',
              modalKey: 'total_parents',
              badgeText: 'Wali',
              subtext: 'Keluarga Siswa',
              ctaText: 'Rincian Wali',
            },
            {
              title: 'Total Rombel / Kelas',
              formattedValue: formatNumber(kpis.rombel?.total ?? kpis.total_rombel ?? 0),
              icon: Layers,
              tone: 'sky',
              modalKey: 'total_rombel',
              badgeText: 'Rombel',
              subtext: 'Rombongan Belajar',
              ctaText: 'Rincian Rombel',
            },
            {
              title: 'Total Kelas Belajar',
              formattedValue: formatNumber(kpis.kelas?.total ?? kpis.total_kelas ?? 0),
              icon: School,
              tone: 'blue',
              modalKey: 'total_classes',
              badgeText: 'Ruang',
              subtext: 'Ruang Kelas Aktif',
              ctaText: 'Rincian Kelas',
            },
            {
              title: 'Total Alumni Lulusan',
              formattedValue: formatNumber(kpis.alumni?.total ?? kpis.total_alumni ?? 0),
              icon: Sparkles,
              tone: 'amber',
              modalKey: 'total_alumni',
              badgeText: 'Lulusan',
              subtext: 'Alumni Terdata',
              ctaText: 'Daftar Alumni',
            },
            {
              title: 'Mitigasi Integritas Adab',
              formattedValue: '100%',
              icon: ShieldCheck,
              tone: 'emerald',
              badgeText: 'Terkendali',
              subtext: 'Zero Public Escalation',
              ctaText: 'Status Integritas',
              onClick: () => {
                const el = document.getElementById('tata-kelola-disiplin')
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
              },
            },
          ]

          return (
            <motion.section variants={itemVariants} className="space-y-6">
              {/* Primary KPI Summary Cards */}
              <div className="space-y-2.5">
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 sm:gap-2">
                  <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Zap className="size-4 text-emerald-600 dark:text-emerald-400" />
                    Metrik Utama Sistem & Unit Yayasan
                  </h2>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-bold">Updated Realtime</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                  {primaryCards.map((card) => (
                    <ModernKpiCard
                      key={card.title}
                      card={card}
                      onClick={card.onClick ? card.onClick : () => setActiveModal(card.modalKey)}
                    />
                  ))}
                </div>
              </div>

              {/* Secondary KPI Grid */}
              <div className="space-y-2.5">
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 sm:gap-2">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Layers className="size-4 text-teal-600 dark:text-teal-400" />
                    Metrik Pendukung, Komposisi & Integritas Yayasan
                  </h3>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-bold">Sinkronisasi Penuh</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                  {secondaryCards.map((card) => (
                    <ModernKpiCard
                      key={card.title}
                      card={card}
                      onClick={card.onClick ? card.onClick : () => setActiveModal(card.modalKey)}
                    />
                  ))}
                </div>
              </div>
            </motion.section>
          )
        })()}

        {/* Ringkasan Operasional & Monitoring Akademik */}
        <motion.section variants={itemVariants} className="space-y-3">
          <SectionHeader
            icon={Activity}
            title="Monitoring Operasional & Akademik"
            subtitle="Kondisi presensi guru & siswa, input nilai LMS, setoran tahfizh, dan mutaba'ah ibadah"
            badge="Harian & Real-time"
          />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
            <VibrantMetricCard
              title="Kehadiran Guru"
              value={monitoringAkademik.kehadiran_guru != null ? `${monitoringAkademik.kehadiran_guru}%` : '—'}
              description={
                monitoringAkademik.teacher_sessions_total > 0
                  ? `${monitoringAkademik.teacher_sessions_present} dari ${monitoringAkademik.teacher_sessions_total} sesi`
                  : 'Belum ada sesi'
              }
              icon={UserCheck}
              tone="emerald"
              onClick={() => setActiveModal('kehadiran_guru')}
            />
            <VibrantMetricCard
              title="Kehadiran Siswa"
              value={monitoringAkademik.kehadiran_siswa != null ? `${monitoringAkademik.kehadiran_siswa}%` : '—'}
              description={
                monitoringAkademik.total_siswa_aktif > 0
                  ? `${formatNumber(Math.max(0, (monitoringAkademik.total_siswa_aktif || 0) - (monitoringAkademik.tidak_hadir_hari_ini || 0)))} dari ${formatNumber(monitoringAkademik.total_siswa_aktif)} siswa`
                  : 'Belum ada data'
              }
              icon={Users}
              tone="blue"
              onClick={() => setActiveModal('kehadiran_siswa')}
            />
            <VibrantMetricCard
              title="Nilai LMS"
              value={monitoringAkademik.input_nilai != null ? `${monitoringAkademik.input_nilai}%` : '—'}
              description={
                monitoringAkademik.total_grades > 0
                  ? `${formatNumber(monitoringAkademik.total_grades)} entri terdata`
                  : 'Belum ada entri'
              }
              icon={CheckCircle2}
              tone="violet"
              onClick={() => setActiveModal('input_nilai')}
            />
            <VibrantMetricCard
              title="Tahfizh Qur'an"
              value={monitoringAkademik.input_tahfiz != null ? `${monitoringAkademik.input_tahfiz}%` : '—'}
              description={
                monitoringAkademik.today_tahfizh_logs > 0
                  ? `${formatNumber(monitoringAkademik.today_tahfizh_logs)} setoran hari ini`
                  : 'Belum ada setoran'
              }
              icon={Award}
              tone="amber"
              onClick={() => setActiveModal('input_tahfiz')}
            />
            <VibrantMetricCard
              title="Mutaba'ah"
              value={monitoringAkademik.input_mutabaah != null ? `${monitoringAkademik.input_mutabaah}%` : '—'}
              description={
                monitoringAkademik.today_mutabaah_headers > 0
                  ? `${formatNumber(monitoringAkademik.today_mutabaah_headers)} jurnal hari ini`
                  : 'Belum ada jurnal'
              }
              icon={HeartHandshake}
              tone="indigo"
              onClick={() => setActiveModal('input_mutabaah')}
            />
            <VibrantMetricCard
              title="Terlambat"
              value={formatNumber(monitoringAkademik.terlambat_hari_ini)}
              description="Presensi melewati batas jam masuk"
              icon={Clock3}
              tone="amber"
              onClick={() => setActiveModal('kehadiran_siswa')}
            />
            <VibrantMetricCard
              title="Tidak Hadir"
              value={formatNumber(monitoringAkademik.tidak_hadir_hari_ini)}
              description="Alpa / Sakit / Izin hari ini"
              icon={UserCheck}
              tone="rose"
              onClick={() => setActiveModal('kehadiran_siswa')}
            />
          </div>

          {/* Demographic & Movement Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <VibrantMetricCard
              title="Siswa Baru"
              value={formatNumber(kpis.siswa_baru)}
              description="Tahun ajaran berjalan"
              icon={TrendingUp}
              tone="emerald"
              onClick={() => navigate('/dashboard/yayasan/siswa-baru')}
            />
            <VibrantMetricCard
              title="Mutasi Masuk"
              value={formatNumber(kpis.mutasi_masuk)}
              description="Siswa pindahan masuk"
              icon={TrendingUp}
              tone="sky"
              onClick={() => navigate('/dashboard/yayasan/mutasi-siswa')}
            />
            <VibrantMetricCard
              title="Mutasi Keluar"
              value={formatNumber(kpis.mutasi_keluar)}
              description="Siswa pindahan keluar"
              icon={TrendingUp}
              tone="amber"
              onClick={() => navigate('/dashboard/yayasan/mutasi-siswa')}
            />
            <VibrantMetricCard
              title="Siswa Lulus"
              value={formatNumber(kpis.siswa_lulus)}
              description="Telah menyelesaikan pendidikan"
              icon={GraduationCap}
              tone="indigo"
              onClick={() => navigate('/dashboard/yayasan/kelulusan-alumni')}
            />
          </div>
        </motion.section>

        {/* Visual Analytics & Charts */}
        <motion.section variants={itemVariants} className="space-y-3">
          <SectionHeader
            icon={TrendingUp}
            title="Analitik Capaian & Distribusi Lintas Unit"
            subtitle="Visualisasi grafik distribusi SDM, capaian prestasi, dan mutaba'ah ibadah"
            badge="Grafik Analitik"
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-stretch">
            {/* Chart 1: Distribusi SDM Guru & Tendik per Unit */}
            <div className="relative overflow-hidden rounded-container border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-sm dark:border-emerald-600/35 dark:bg-card-dark lg:col-span-6 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between border-b border-emerald-500/20 dark:border-emerald-800/40 bg-emerald-500/10 dark:bg-emerald-950/40 px-5 py-4 min-h-[72px] h-[72px]">
                <div className="flex items-center gap-3">
                  <div className="flex size-8.5 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                    <Users className="size-4.5 text-white" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200 leading-tight">
                      Distribusi SDM per Unit Pendidikan
                    </h3>
                    <p className="text-xs font-semibold text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                      Perbandingan jumlah Guru vs Tendik di seluruh unit
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-black text-white shadow-xs">
                  SDM Staf
                </span>
              </div>

              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div className="h-64 sm:h-72 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sdmDistribution} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis
                        dataKey="code"
                        stroke="#888888"
                        fontSize={10}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={45}
                      />
                      <YAxis stroke="#888888" fontSize={11} />
                      <Tooltip
                        cursor={{ fill: 'rgba(5, 150, 105, 0.08)' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const item = payload[0].payload
                            return (
                              <div className="rounded-xl border border-emerald-500/30 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-md text-white min-w-[210px]">
                                <div className="flex items-center gap-2 mb-1.5 pb-1.5 border-b border-emerald-500/20">
                                  <span className="size-3 rounded-full shrink-0 shadow-sm bg-emerald-500" />
                                  <span className="text-xs font-bold leading-tight text-emerald-400">
                                    {item.name || item.code}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs gap-3">
                                  <span className="text-slate-400 font-medium">Guru:</span>
                                  <span className="font-extrabold text-white tabular-nums">{item.guru} Orang</span>
                                </div>
                                <div className="flex items-center justify-between text-xs gap-3 mt-1">
                                  <span className="text-slate-400 font-medium">Tendik:</span>
                                  <span className="font-extrabold text-white tabular-nums">{item.tendik} Orang</span>
                                </div>
                                <div className="flex items-center justify-between text-xs gap-3 mt-1.5 pt-1.5 border-t border-emerald-500/20">
                                  <span className="text-slate-400 font-medium">Total SDM:</span>
                                  <span className="font-extrabold text-emerald-400 tabular-nums">
                                    {(item.guru || 0) + (item.tendik || 0)} Orang
                                  </span>
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '11px', paddingBottom: '12px' }}
                      />
                      <Bar dataKey="guru" fill="#059669" name="Guru" radius={[6, 6, 0, 0]} maxBarSize={18} />
                      <Bar dataKey="tendik" fill="#10B981" name="Tendik" radius={[6, 6, 0, 0]} maxBarSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Chart 2: Monitoring Mutaba'ah Ibadah */}
            <div className="relative overflow-hidden rounded-container border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-sm dark:border-emerald-600/35 dark:bg-card-dark lg:col-span-3 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between border-b border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-950/40 px-3.5 sm:px-4 py-3 min-h-[72px] h-[72px]">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                    <HeartHandshake className="size-4 text-white" strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 leading-tight truncate" title="Ibadah Harian">
                      Ibadah Harian
                    </h3>
                    <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 font-medium mt-0.5 truncate leading-tight" title="Tingkat kelengkapan mutaba'ah siswa">
                      Tingkat kelengkapan mutaba'ah siswa
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white shadow-xs ml-1.5">
                  Mutaba'ah
                </span>
              </div>

              <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
                {[
                  {
                    label: 'Shalat Wajib & Sunnah',
                    value: monitoringIbadah.shalat,
                    detail: monitoringIbadah.shalat_detail,
                    icon: Clock3,
                    iconBg: 'bg-emerald-600 text-white',
                    cardStyle: 'border-emerald-200/90 dark:border-emerald-800/60 bg-emerald-50/70 hover:bg-emerald-100/70 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60',
                    titleColor: 'text-emerald-900 dark:text-emerald-200',
                    valueColor: 'text-emerald-700 dark:text-emerald-400',
                    gradient: 'from-emerald-500 to-teal-500',
                  },
                  {
                    label: "Tilawah Al-Qur'an",
                    value: monitoringIbadah.tilawah,
                    detail: monitoringIbadah.tilawah_detail,
                    icon: BookOpen,
                    iconBg: 'bg-sky-600 text-white',
                    cardStyle: 'border-sky-200/90 dark:border-sky-800/60 bg-sky-50/70 hover:bg-sky-100/70 dark:bg-sky-950/40 dark:hover:bg-sky-950/60',
                    titleColor: 'text-sky-900 dark:text-sky-200',
                    valueColor: 'text-sky-700 dark:text-sky-400',
                    gradient: 'from-sky-500 to-blue-500',
                  },
                  {
                    label: "Muraja'ah Hafalan",
                    value: monitoringIbadah.murajaah,
                    detail: monitoringIbadah.murajaah_detail,
                    icon: Award,
                    iconBg: 'bg-purple-600 text-white',
                    cardStyle: 'border-purple-200/90 dark:border-purple-800/60 bg-purple-50/70 hover:bg-purple-100/70 dark:bg-purple-950/40 dark:hover:bg-purple-950/60',
                    titleColor: 'text-purple-900 dark:text-purple-200',
                    valueColor: 'text-purple-700 dark:text-purple-400',
                    gradient: 'from-purple-500 to-violet-500',
                  },
                  {
                    label: "Mutaba'ah Terverifikasi",
                    value: monitoringIbadah.mutabaah,
                    detail: monitoringIbadah.mutabaah_detail,
                    icon: ShieldCheck,
                    iconBg: 'bg-amber-600 text-white',
                    cardStyle: 'border-amber-200/90 dark:border-amber-800/60 bg-amber-50/70 hover:bg-amber-100/70 dark:bg-amber-950/40 dark:hover:bg-amber-950/60',
                    titleColor: 'text-amber-900 dark:text-amber-200',
                    valueColor: 'text-amber-700 dark:text-amber-400',
                    gradient: 'from-amber-500 to-orange-500',
                  },
                ].map((item) => {
                  const ItemIcon = item.icon
                  return (
                    <div
                      key={item.label}
                      onClick={() => setActiveModal('monitoring_ibadah')}
                      className={`group p-2.5 rounded-xl border transition-all duration-150 cursor-pointer shadow-xs ${item.cardStyle}`}
                      role="button"
                      tabIndex={0}
                      title="Klik untuk melihat rincian data sumber monitoring ibadah"
                    >
                      <div className="flex items-center justify-between text-xs font-bold gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className={`flex size-6 shrink-0 items-center justify-center rounded-lg shadow-2xs ${item.iconBg}`}>
                            <ItemIcon className="size-3.5 text-white" strokeWidth={2.2} />
                          </div>
                          <span className={`truncate text-xs font-bold ${item.titleColor}`} title={item.label}>
                            {item.label}
                          </span>
                        </div>
                        <span className={`font-black tabular-nums shrink-0 text-xs ${item.valueColor}`}>
                          {item.value != null ? `${item.value}%` : '—'}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-emerald-50 dark:bg-emerald-950/40 my-1.5">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${item.gradient} transition-all duration-500`}
                          style={{ width: `${Math.min(100, Math.max(0, Number(item.value) || 0))}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        <span>Kelengkapan</span>
                        <span>
                          {item.detail?.total > 0 ? `${item.detail.completed}/${item.detail.total} entri` : 'Belum ada data'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Chart 3: Distribusi Prestasi Siswa */}
            <div className="relative overflow-hidden rounded-container border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-sm dark:border-emerald-600/35 dark:bg-card-dark lg:col-span-3 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between border-b border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-950/40 px-3.5 sm:px-4 py-3 min-h-[72px] h-[72px]">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                    <Award className="size-4 text-white" strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 leading-tight truncate" title="Distribusi Prestasi Siswa">
                      Distribusi Prestasi Siswa
                    </h3>
                    <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 font-medium mt-0.5 truncate leading-tight" title="Kategori capaian prestasi terdaftar">
                      Kategori capaian prestasi terdaftar
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white shadow-xs ml-1.5">
                  Prestasi
                </span>
              </div>

              <div className="p-4 sm:p-5 flex-1 flex flex-col items-center justify-center">
                {!prestasiDistribution.some((item) => Number(item.value) > 0) ? (
                  <div className="flex flex-col items-center justify-center text-center p-4">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20 mb-2.5 shadow-xs">
                      <Award className="size-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Data Prestasi Kosong</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 max-w-[200px] leading-relaxed">
                      Belum ada data prestasi tercatat periode ini.
                    </p>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center justify-center">
                    <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={prestasiDistribution}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={46}
                            outerRadius={68}
                            paddingAngle={3}
                            cx="50%"
                            cy="50%"
                          >
                            {prestasiDistribution.map((entry, index) => (
                              <Cell
                                key={`${entry.name}-${index}`}
                                fill={entry.color || ['#059669', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'][index % 5]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0F172A',
                              borderColor: '#334155',
                              borderRadius: '12px',
                              color: '#FFF',
                              fontSize: '12px',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <strong className="text-xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                          {prestasiDistribution.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0)}
                        </strong>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">
                          TOTAL
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5 max-w-[240px]">
                      {prestasiDistribution.map((entry, index) => (
                        <span
                          key={entry.name}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300"
                        >
                          <span
                            className="size-2 rounded-full shrink-0"
                            style={{ backgroundColor: entry.color || ['#059669', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'][index % 5] }}
                          />
                          <span className="truncate max-w-[85px]">{entry.name}</span>
                          <span className="font-extrabold ml-0.5">({entry.value})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Cross-Unit Comparison & Performance Ranking */}
        <motion.section variants={itemVariants} id="kinerja-unit-pendidikan" className="space-y-3 scroll-mt-6">
          <SectionHeader
            icon={School}
            title="Perbandingan Kinerja Unit Pendidikan"
            subtitle="Daftar unit pendidikan beserta statistik jumlah siswa, guru, pegawai, dan rombel"
            badge={`${unitsList.length || unitSummaries.length || 0} Unit`}
            actions={
              <AppButton
                variant="primary"
                size="sm"
                icon={Building2}
                onClick={() => navigate('/dashboard/yayasan/unit-pendidikan')}
                className="!bg-emerald-600 hover:!bg-emerald-700 !text-white rounded-xl shadow-xs"
              >
                Lihat Seluruh Unit
              </AppButton>
            }
          />

          {/* Filter Selection Bar for Card Unit Types */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border-2 border-emerald-500/30 !bg-[#D5F2E3]/60 dark:!bg-[#112a22]/70 p-4 shadow-md shadow-emerald-500/5 dark:border-emerald-600/40">
            {/* Category Filter Pills (Desktop & Tablet) */}
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-1.5 hidden sm:inline-flex items-center gap-2">
                <div className="flex size-6.5 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                  <Filter className="size-3.5 text-white" strokeWidth={2.2} />
                </div>
                Jenis Unit:
              </span>
              {availableFilterCategories.map((cat) => {
                const count = categoryCounts[cat.id] || 0
                const isActive = cardUnitFilter === cat.id
                const catColors = CATEGORY_COLOR_MAP[cat.id] || CATEGORY_COLOR_MAP.all
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCardUnitFilter(cat.id)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isActive ? `${catColors.active} scale-[1.03] shadow-xs` : `${catColors.inactive} hover:scale-[1.02]`
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${
                        isActive ? catColors.countActive : catColors.countInactive
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Select Dropdown (Mobile) & Counter */}
            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
              <div className="w-48 sm:hidden">
                <HeroUiFilterSelect
                  value={cardUnitFilter}
                  onChange={(val) => setCardUnitFilter(val || 'all')}
                  options={mobileCategoryOptions}
                  placeholder="Kategori Unit..."
                  icon={Filter}
                  popoverWidth="w-56"
                  size="sm"
                />
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Menampilkan <strong className="font-extrabold text-emerald-800 dark:text-emerald-300">{filteredUnitSummaries.length}</strong> dari {unitSummaries.length} unit
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredUnitSummaries.map((row, idx) => {
              const palette = PASTEL_PALETTES[idx % PASTEL_PALETTES.length]
              const shortBadge = getShortUnitBadgeLabel(row)
              const avatarCode = (row.code || getUnitCategoryKey(row) || 'UN').substring(0, 4).toUpperCase()

              return (
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  key={row.id}
                  type="button"
                  onClick={() => handleOpenUnitDetail(row)}
                  className={`group relative overflow-hidden rounded-container border-2 p-4 shadow-xs transition-all duration-200 flex flex-col justify-between text-left cursor-pointer ${palette.card}`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className={`flex size-11 shrink-0 items-center justify-center rounded-full ${palette.iconBox} font-black text-xs`}>
                        {avatarCode}
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider ${palette.tagHeader}`}>
                          JENIS UNIT
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs ${palette.tag}`}>
                          {shortBadge}
                        </span>
                      </div>
                    </div>
                    <h4
                      className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors"
                      title={row.name}
                    >
                      {row.name}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1 truncate">
                      {formatNumber(row.siswa_aktif_count ?? row.siswa_count ?? 0)} Siswa • {formatNumber(row.guru_count || 0)} Guru
                    </p>
                  </div>
                  <div className={`flex items-center justify-between text-xs font-bold pt-2.5 mt-3 border-t ${palette.divider}`}>
                    <span className={palette.cta}>Rincian Unit</span>
                    <span className={`inline-flex items-center gap-1 font-extrabold group-hover:translate-x-0.5 transition-transform ${palette.cta}`}>
                      Detail &rarr;
                    </span>
                  </div>
                </motion.button>
              )
            })}
            {!filteredUnitSummaries.length && (
              <div className="col-span-full py-12 text-center rounded-xl border-2 border-dashed border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Tidak ada unit pendidikan pada jenis unit ini.</p>
                <button
                  type="button"
                  onClick={() => setCardUnitFilter('all')}
                  className="mt-2 text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400 cursor-pointer"
                >
                  Tampilkan Semua Unit
                </button>
              </div>
            )}
          </div>
        </motion.section>

        {/* Tata Kelola Kedisiplinan & Critical Watchlist Yayasan */}
        <motion.section id="tata-kelola-disiplin" variants={itemVariants} className="mt-8">
          <FoundationDisciplineExecutiveSection />
        </motion.section>

        {/* Modal Quick View KPI */}
        <ModalErrorBoundary onClose={() => setActiveModal(null)}>
          <KpiQuickViewModal
            type={activeModal}
            isOpen={Boolean(activeModal)}
            onClose={() => setActiveModal(null)}
          />
        </ModalErrorBoundary>

        {/* Canonical Detail Drawer Slide-over */}
        <KpiDetailDrawer
          type={detailDrawer.type}
          id={detailDrawer.id}
          isOpen={detailDrawer.isOpen}
          onClose={() => setDetailDrawer({ isOpen: false, type: null, id: null })}
        />

        {/* Smart Floating Scroll Navigator */}
        <SmartScrollFab targetId="kinerja-unit-pendidikan" downTooltip="Langsung ke Kinerja Unit" />
      </motion.div>
    </PageContainer>
  )
}

export default FoundationDashboardPage
