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
  ShieldCheck,
  Sparkles,
  UserX,
  Key,
  RefreshCw,
  Filter,
  Eye,
  Zap,
  ArrowRight,
  Printer,
  Download,
  Settings,
  UserPlus,
  Copy,
  Check,
  CheckCircle2,
  Globe,
  Clock,
  Laptop
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { Tooltip as HeroTooltip } from '@heroui/react'

import {
  AppBreadcrumb,
  PageContainer,
  AppDataTable,
  HeroUiHeader,
  KpiStatCard
} from '../components/app'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIndicator,
  AlertTitle
} from '../components/ui/alert'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel
} from '../components/ui/select'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose
} from '../components/ui/dialog'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'
import KpiQuickViewModal from '../components/KpiQuickViewModal'
import ModalErrorBoundary from '../components/common/ModalErrorBoundary'

import { useAuthStore } from '../stores/authStore'
import { getUserRoleLevel } from '../auth/portalResolver'
import { superAdminDashboardService } from '../services/superAdminDashboardService'
import { cn } from '../lib/utils'

// ── 1. DEFINISI VARIAN ANIMASI FRAMER MOTION ──
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
    transition: { duration: 0.3, ease: 'easeOut' },
  },
}

// ── 2. KOMPONEN KARTU KPI MODERN ──
function ModernKpiCard({ card, onClick }) {
  const toneMap = {
    emerald: 'emerald',
    indigo: 'indigo',
    violet: 'violet',
    teal: 'teal',
    amber: 'amber',
    sky: 'sky',
    blue: 'blue',
    rose: 'rose',
    slate: 'slate',
  }

  return (
    <KpiStatCard
      icon={card.icon}
      title={card.title}
      value={card.formattedValue}
      description={card.subtext}
      badge={card.badgeText}
      tone={toneMap[card.tone] || card.tone || 'emerald'}
      onClick={onClick}
      ctaText={card.ctaText}
      footerAction={onClick ? { label: card.ctaText || 'Lihat Rincian', onClick } : undefined}
    />
  )
}

const getRoleBadgeProps = (roleStr) => {
  const r = (roleStr || '').toLowerCase()
  if (r.includes('super') || r.includes('admin')) {
    return {
      color: 'secondary',
      className: 'text-[9px] font-bold h-5 px-1.5 shrink-0 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40'
    }
  }
  if (r.includes('guru') || r.includes('pengajar') || r.includes('teacher') || r.includes('kepala') || r.includes('kepsek')) {
    return {
      color: 'primary',
      className: 'text-[9px] font-bold h-5 px-1.5 shrink-0 bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/40'
    }
  }
  if (r.includes('musyrif') || r.includes('pembina') || r.includes('asrama')) {
    return {
      color: 'primary',
      className: 'text-[9px] font-bold h-5 px-1.5 shrink-0 bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/40'
    }
  }
  if (r.includes('ortu') || r.includes('orang tua') || r.includes('wali')) {
    return {
      color: 'warning',
      className: 'text-[9px] font-bold h-5 px-1.5 shrink-0 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40'
    }
  }
  if (r.includes('siswa') || r.includes('santri')) {
    return {
      color: 'success',
      className: 'text-[9px] font-bold h-5 px-1.5 shrink-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40'
    }
  }
  return {
    color: 'default',
    className: 'text-[9px] font-bold h-5 px-1.5 shrink-0 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60'
  }
}

export default function SuperAdminDashboardPage() {
  const navigate = useNavigate()
  const currentUser = useAuthStore((state) => state.user)

  // Filter state
  const [selectedUnit, setSelectedUnit] = useState('semua')
  const [selectedStatus, setSelectedStatus] = useState('semua')
  const [periodOption, setPeriodOption] = useState('minggu')
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('semua')
  const [selectedSemester, setSelectedSemester] = useState('semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeModal, setActiveModal] = useState(null)
  const [selectedLoginAudit, setSelectedLoginAudit] = useState(null)
  const [isCopiedIp, setIsCopiedIp] = useState(false)
  const pageSize = 5

  // ── 3. DATA FETCHING TANSTACK REACT QUERY V5 ──
  const {
    data,
    isLoading,
    isError,
    error: queryError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: [
      'superadmin-dashboard-overview',
      selectedUnit,
      selectedStatus,
      periodOption,
      selectedAcademicYear,
      selectedSemester,
    ],
    queryFn: async () => {
      const params = {}
      if (selectedUnit && selectedUnit !== 'semua') params.unit_id = selectedUnit
      if (selectedStatus && selectedStatus !== 'semua') params.status = selectedStatus
      if (periodOption && periodOption !== 'semua') params.period = periodOption
      if (selectedAcademicYear && selectedAcademicYear !== 'semua') params.academic_year_id = selectedAcademicYear
      if (selectedSemester && selectedSemester !== 'semua') params.semester_id = selectedSemester

      const res = await superAdminDashboardService.getOverview(params)
      return res?.data || null
    },
    staleTime: 60000,
    placeholderData: (previousData) => previousData,
  })

  const resetFilter = useCallback(() => {
    setSelectedUnit('semua')
    setSelectedStatus('semua')
    setPeriodOption('minggu')
    setSelectedAcademicYear('semua')
    setSelectedSemester('semua')
    setSearchQuery('')
  }, [])

  const kpis = data?.kpis || {}
  const context = data?.context || {}
  const charts = data?.charts || {}
  const unitSummaries = data?.unit_summaries || []
  const recentLogins = data?.recent_logins || []

  const availableUnits = context?.available_units || unitSummaries || []
  const availableAcademicYears = context?.available_academic_years || []
  const availableSemesters = context?.available_semesters || []

  const formatAngka = (num) =>
    num !== undefined && num !== null ? Number(num).toLocaleString('id-ID') : '0'

  // Filtered unit summaries
  const filteredUnits = useMemo(() => {
    return unitSummaries.filter((unit) => {
      const matchUnit = selectedUnit === 'semua' || String(unit.id) === String(selectedUnit)
      const matchStatus =
        selectedStatus === 'semua' ||
        String(unit.status).toLowerCase() === selectedStatus.toLowerCase()

      return matchUnit && matchStatus
    })
  }, [unitSummaries, selectedUnit, selectedStatus])

  // ── 4. CETAK DAN EKSPOR REAL FUNCTIONAL HANDLERS ──
  const handlePrintDashboard = () => {
    window.print()
  }

  const handleExportUnitsCsv = () => {
    if (!filteredUnits || filteredUnits.length === 0) return

    const headers = ['ID', 'Nama Unit', 'Kode', 'Siswa Aktif', 'Guru Pendidik', 'Pegawai & Tendik', 'Status']
    const csvRows = [
      headers.join(','),
      ...filteredUnits.map((u) => [
        u.id || '',
        `"${(u.name || '').replace(/"/g, '""')}"`,
        `"${(u.code || '').replace(/"/g, '""')}"`,
        u.siswa_count || 0,
        u.guru_count || 0,
        u.pegawai_count || 0,
        `"${u.status || 'Aktif'}"`,
      ].join(',')),
    ]

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `ringkasan_unit_pendidikan_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleCopyIp = (ip) => {
    if (!ip) return
    navigator.clipboard.writeText(ip)
    setIsCopiedIp(true)
    setTimeout(() => setIsCopiedIp(false), 2000)
  }

  // Kolom Master Datatable Unit Pendidikan
  const unitTableColumns = useMemo(
    () => [
      {
        key: 'name',
        label: 'Nama Unit Pendidikan',
        sortable: true,
        className: 'w-[36%] min-w-[200px]',
        render: (row) => (
          <div className="flex items-center gap-3 max-w-md">
            <div className="flex h-9 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-card-dark border border-emerald-200/60 text-emerald-800 font-black text-xs dark:from-emerald-950/60 dark:to-teal-950/40 dark:border-emerald-800/60 dark:text-emerald-300 shadow-xs">
              {(row.code || row.name || 'UN').substring(0, 3).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="font-extrabold text-slate-900 dark:text-white truncate text-xs">
                {row.name}
              </p>
              <p className="text-xs text-slate-400 font-medium truncate">
                Kode: {row.code || 'UNIT'}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: 'siswa_count',
        label: 'Siswa Aktif',
        sortable: true,
        className: 'w-[14%] whitespace-nowrap',
        render: (row) => (
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
            {formatAngka(row.siswa_count)} Siswa
          </span>
        ),
      },
      {
        key: 'guru_count',
        label: 'Guru Pendidik',
        sortable: true,
        className: 'w-[14%] whitespace-nowrap',
        render: (row) => (
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {formatAngka(row.guru_count)} Guru
          </span>
        ),
      },
      {
        key: 'pegawai_count',
        label: 'Pegawai & Tendik',
        sortable: true,
        className: 'w-[14%] whitespace-nowrap',
        render: (row) => (
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            {formatAngka(row.pegawai_count)} Pegawai
          </span>
        ),
      },
      {
        key: 'status',
        label: 'Status Operasional',
        sortable: true,
        className: 'w-[14%] whitespace-nowrap',
        render: (row) => (
          <Badge
            variant={row.status === 'Aktif' || row.status === 'aktif' ? 'success' : 'danger'}
          >
            {row.status || 'Aktif'}
          </Badge>
        ),
      },
      {
        key: 'action',
        label: 'Aksi',
        align: 'right',
        className: 'w-[80px] text-right whitespace-nowrap',
        render: (row) => (
          <HeroTooltip content={`Kelola Data Unit: ${row.name}`}>
            <Button
              type="button"
              variant="view"
              size="xs"
              iconOnly
              aria-label={`Kelola Data Unit: ${row.name}`}
              onClick={() => navigate('/dashboard/master/unit-pendidikan')}
              className="size-8 rounded-xl cursor-pointer"
            >
              <Eye className="size-4" />
            </Button>
          </HeroTooltip>
        ),
      },
    ],
    [navigate]
  )

  // Donut chart komposisi staf SDM
  const staffStats = useMemo(() => {
    const guru = Number(kpis.total_teachers?.total || 0)
    const total = Number(kpis.total_employees?.total || 0)
    const tendik = Math.max(0, total - guru)
    const totalStaff = guru + tendik
    const guruPct = totalStaff > 0 ? Math.round((guru / totalStaff) * 100) : 0
    const tendikPct = totalStaff > 0 ? 100 - guruPct : 0
    return {
      guru,
      tendik,
      total: totalStaff || total,
      guruPct,
      tendikPct,
      pieData: [
        { name: 'Guru Pendidik', value: guru, color: '#0ea5e9' },
        { name: 'Pegawai & Tendik', value: tendik, color: '#f43f5e' },
      ],
    }
  }, [kpis])

  // Distribusi siswa per unit
  const DYNAMIC_CHART_PALETTE = [
    '#059669', // Emerald
    '#0284c7', // Sky Blue
    '#6366f1', // Indigo
    '#d97706', // Amber
    '#e11d48', // Rose
    '#0d9488', // Teal
    '#7c3aed', // Violet
    '#2563eb', // Blue
    '#ea580c', // Orange
    '#16a34a', // Green
    '#c026d3', // Fuchsia
    '#0891b2', // Cyan
  ]

  const studentStats = useMemo(() => {
    const rawList = charts.student_distribution || []
    const totalStudents = rawList.reduce((acc, item) => acc + (Number(item.total) || 0), 0)
    const listWithMeta = rawList.map((item, index) => {
      const count = Number(item.total) || 0
      const pct = totalStudents > 0 ? ((count / totalStudents) * 100).toFixed(1) : '0'
      const color = DYNAMIC_CHART_PALETTE[index % DYNAMIC_CHART_PALETTE.length]
      const rawName = item.name || 'Unit'
      const shortName = item.code || (rawName.length > 14 ? rawName.slice(0, 12) + '…' : rawName)
      return {
        ...item,
        total: count,
        percentage: pct,
        color,
        shortName,
      }
    })

    const topUnit =
      listWithMeta.length > 0
        ? [...listWithMeta].sort((a, b) => b.total - a.total)[0]
        : null

    return {
      items: listWithMeta,
      totalStudents,
      topUnit,
      countUnits: listWithMeta.length,
    }
  }, [charts.student_distribution])

  // Display role label
  const welcomeRoleName = useMemo(() => {
    return getUserRoleLevel(currentUser) === 1 ? 'Super Admin' : 'Admin Sistem'
  }, [currentUser])

  if (isLoading && !data) return <SkeletonDashboard />
  if (isError && !data) {
    return (
      <ErrorState
        message={queryError?.response?.data?.message || 'Gagal memuat data dashboard.'}
        onRetry={() => refetch()}
      />
    )
  }

  // ── 5. KARTU METRIK UTAMA ──
  const primaryCards = [
    {
      title: 'Total Unit Pendidikan',
      formattedValue: formatAngka(kpis.total_units?.total),
      icon: Building2,
      tone: 'emerald',
      modalKey: 'total_units',
      badgeText: 'Terdaftar',
      subtext: 'Unit Sekolah Terdata',
      ctaText: 'Rincian Unit',
    },
    {
      title: 'Unit Sekolah Aktif',
      formattedValue: formatAngka(kpis.active_units?.total),
      icon: School,
      tone: 'sky',
      modalKey: 'active_units',
      badgeText: 'Aktif',
      subtext: 'Operasional Berjalan',
      ctaText: 'Status Operasional',
    },
    {
      title: 'Total Pegawai & Tendik',
      formattedValue: formatAngka(kpis.total_employees?.total),
      icon: UserCheck,
      tone: 'violet',
      modalKey: 'total_employees',
      badgeText: 'SDM Staf',
      subtext: 'Tenaga Kependidikan',
      ctaText: 'Rincian Tendik',
    },
    {
      title: 'Total Guru Pengajar',
      formattedValue: formatAngka(kpis.total_teachers?.total),
      icon: GraduationCap,
      tone: 'indigo',
      modalKey: 'total_teachers',
      badgeText: 'Pendidik',
      subtext: 'Guru Aktif Mengajar',
      ctaText: 'Komposisi Guru',
    },
    {
      title: 'Total Siswa Aktif',
      formattedValue: formatAngka(kpis.total_students?.total),
      icon: Users,
      tone: 'amber',
      modalKey: 'total_students',
      badgeText: 'Siswa',
      subtext: 'Peserta Didik Aktif',
      ctaText: 'Distribusi Siswa',
    },
  ]

  // ── 6. KARTU METRIK SEKUNDER ──
  const secondaryCards = [
    {
      title: 'Total Orang Tua / Wali',
      formattedValue: formatAngka(kpis.total_parents?.total),
      icon: HeartHandshake,
      tone: 'rose',
      modalKey: 'total_parents',
      badgeText: 'Wali',
      subtext: 'Keluarga Siswa',
      ctaText: 'Rincian Wali',
    },
    {
      title: 'Total Rombel / Kelas',
      formattedValue: formatAngka(kpis.total_rombel?.total || kpis.total_classes?.total),
      icon: Layers,
      tone: 'sky',
      modalKey: 'total_rombel',
      badgeText: 'Rombel',
      subtext: 'Rombongan Belajar',
      ctaText: 'Rincian Rombel',
    },
    {
      title: 'Pengguna Sistem Aktif',
      formattedValue: formatAngka(kpis.active_users?.total),
      icon: ShieldCheck,
      tone: 'emerald',
      modalKey: 'active_users',
      badgeText: 'User System',
      subtext: 'Akun Terverifikasi',
      ctaText: 'Akun Pengguna',
    },
    {
      title: 'Role Spatie Terdaftar',
      formattedValue: formatAngka(kpis.active_roles?.total),
      icon: Key,
      tone: 'indigo',
      modalKey: 'active_roles',
      badgeText: 'Spatie Roles',
      subtext: 'Peran Otoritas Hak Akses',
      ctaText: 'Daftar Role',
    },
    {
      title: 'User Tanpa Role',
      formattedValue: formatAngka(kpis.users_without_role?.total),
      icon: UserX,
      tone: 'rose',
      modalKey: 'users_without_role',
      badgeText: 'Perlu Action',
      subtext: 'Belum Ada Penugasan Peran',
      ctaText: 'Review Akses',
    },
  ]

  const activeFiltersCount = [
    selectedUnit !== 'semua',
    selectedStatus !== 'semua',
    periodOption !== 'minggu',
    selectedAcademicYear !== 'semua',
    selectedSemester !== 'semua',
    Boolean(searchQuery),
  ].filter(Boolean).length

  return (
    <PageContainer maxW="7xl">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6 pb-12"
      >
        {/* 1. Header & Quick Toolbar Handlers */}
        <motion.div variants={itemVariants} className="space-y-4">
          <AppBreadcrumb items={[{ label: `Dashboard Utama ${welcomeRoleName}` }]} />

          <HeroUiHeader
            icon={ShieldCheck}
            title={`Dashboard Utama ${welcomeRoleName}`}
            tag={{ text: welcomeRoleName, icon: Sparkles }}
            description="Pusat kendali dan pemantauan terpadu seluruh unit pendidikan, operasional sistem, dan integrasi hak akses sekolah."
            className="rounded-container !border-2 !border-emerald-300 dark:!border-emerald-700/80 shadow-md shadow-emerald-500/10"
            actions={
              <div className="flex items-center gap-2 print:hidden flex-wrap">
                <HeroTooltip content="Segarkan Data Realtime">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    aria-label="Segarkan Data Realtime"
                    className="h-8.5 rounded-xl px-2.5 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 bg-white hover:bg-emerald-50 dark:bg-slate-900 shadow-2xs"
                  >
                    <RefreshCw className={cn('size-3.5', isFetching && 'animate-spin')} />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                </HeroTooltip>
              </div>
            }
          />
        </motion.div>

        {/* 2. Operational Alert Section */}
        <motion.div variants={itemVariants}>
          <Alert
            status={kpis.users_without_role?.total > 0 ? 'warning' : 'info'}
            className={
              kpis.users_without_role?.total > 0
                ? 'border-amber-300/80 bg-amber-50/70 dark:border-amber-700/50 dark:bg-amber-950/30'
                : 'border-emerald-300/80 bg-emerald-50/70 dark:border-emerald-700/50 dark:bg-emerald-950/30'
            }
          >
            <AlertIndicator />
            <AlertContent>
              <AlertTitle className="text-xs sm:text-sm font-black text-slate-900 dark:text-emerald-400">
                {kpis.users_without_role?.total > 0
                  ? 'Perhatian Administrasi Hak Akses Sistem'
                  : 'Integritas Operasional & Sistem Terverifikasi'}
              </AlertTitle>
              <AlertDescription className="text-xs text-slate-700 dark:text-slate-300">
                {kpis.users_without_role?.total > 0
                  ? `Terdapat ${kpis.users_without_role?.total} pengguna sistem yang belum memiliki penetapan peran (role). Klik kartu 'User Tanpa Role' untuk meninjau dan menetapkan hak akses.`
                  : `Seluruh ${formatAngka(kpis.total_units?.total)} unit sekolah dan ${formatAngka(kpis.total_employees?.total)} pegawai aktif terhubung dengan aman ke sistem manajemen terpadu.`}
              </AlertDescription>
            </AlertContent>
          </Alert>
        </motion.div>

        {/* 3. Primary KPI Summary Cards (5-Card Grid) */}
        <motion.div variants={itemVariants} className="space-y-2.5">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 sm:gap-2">
            <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Zap className="size-4 text-emerald-600 dark:text-emerald-400" />
              Metrik Utama Sistem & Unit Sekolah
            </h2>
            
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {primaryCards.map((card, idx) => (
              <div
                key={card.title}
                className={idx === 4 ? 'col-span-2 sm:col-span-1' : 'col-span-1'}
              >
                <ModernKpiCard
                  card={card}
                  enableModal={false}
                  onClick={() => setActiveModal(card.modalKey)}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* 4. Secondary KPI Grid (5-Card Grid) */}
        <motion.div variants={itemVariants} className="space-y-2.5">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {secondaryCards.map((card, idx) => (
              <div
                key={card.title}
                className={idx === 4 ? 'col-span-2 sm:col-span-1' : 'col-span-1'}
              >
                <ModernKpiCard
                  card={card}
                  enableModal={false}
                  onClick={() => setActiveModal(card.modalKey)}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* 5. Recent Logins Section (Audit User Login Terbaru) */}
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden rounded-container border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-card-dark">
            <div className="flex items-center justify-between border-b border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-950/40 px-5 py-4 dark:border-emerald-800/40 min-h-[72px]">
              <div className="flex items-center gap-3">
                <div className="flex size-8.5 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                  <UserCheck className="size-4.5 text-white" strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200 leading-tight">
                    Audit User Login Terbaru
                  </h3>
                  <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 font-medium mt-0.5">
                    Daftar pengguna dengan riwayat aktivitas sesi masuk terkini dalam sistem terpadu
                  </p>
                </div>
              </div>
              
            </div>

            <div className="p-5 sm:p-6">
              {recentLogins.length === 0 ? (
                <div className="text-center py-8 flex flex-col items-center justify-center">
                  <div className="size-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2 border border-emerald-200 dark:border-emerald-800">
                    <UserX className="size-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Belum ada sesi login terkini</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Riwayat autentikasi pengguna akan tercatat otomatis saat sesi dimulai.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                  {recentLogins.slice(0, 8).map((userItem, idx) => (
                    <div
                      key={userItem.event_id || userItem.id ? `${userItem.event_id || userItem.id}-${idx}` : idx}
                      role="button"
                      tabIndex={0}
                      aria-label={`Audit sesi masuk untuk ${userItem.name} (${userItem.role || 'Pengguna'})`}
                      title={`Klik untuk melihat audit rincian sesi masuk ${userItem.name}`}
                      onClick={() => setSelectedLoginAudit(userItem)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setSelectedLoginAudit(userItem)
                        }
                      }}
                      className="relative overflow-hidden flex items-start gap-3 p-3.5 rounded-2xl border-2 border-emerald-500/25 dark:border-emerald-700/40 bg-slate-50/70 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800/80 hover:border-emerald-500/50 hover:shadow-md transition-all duration-200 cursor-pointer group active:scale-[0.98]"
                    >
                      <Avatar className="size-10 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800/80 dark:text-emerald-300 font-black text-xs shrink-0 shadow-sm group-hover:scale-105 transition-transform mt-0.5">
                        <AvatarFallback>
                          {(userItem.name || 'U').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p
                          className="w-full font-extrabold text-slate-800 dark:text-slate-100 text-xs truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                          title={userItem.name}
                        >
                          {userItem.name}
                        </p>
                        <div className="flex items-center justify-between gap-1 mt-0.5">
                          <p className="text-[10px] text-slate-400 truncate">
                            {userItem.email}
                          </p>
                          <span className={cn('inline-flex items-center rounded-full text-[9px] font-bold h-5 px-2 shrink-0 shadow-2xs', getRoleBadgeProps(userItem.role).className)}>
                            {userItem.role || 'Pengguna'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-emerald-500/20 dark:border-emerald-800/40">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate flex items-center gap-1">
                            <Clock className="size-3 text-slate-400" />
                            {userItem.created_at || 'Baru saja'}
                          </span>
                          <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1">
                            Audit &rarr;
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* 6. Panel Filter Analitik & Sistem */}
        <motion.div variants={itemVariants}>
          <article className="relative overflow-hidden rounded-container border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-card-dark">
            <div className="flex items-center justify-between border-b border-emerald-500/20 dark:border-emerald-800/40 bg-emerald-500/10 dark:bg-emerald-950/40 px-5 py-4 min-h-[72px] h-[72px]">
              <div className="flex items-center gap-3">
                <div className="flex size-8.5 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                  <Filter className="size-4 text-white" strokeWidth={2.2} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      Filter Sistem & Unit
                    </h2>
                    {activeFiltersCount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white font-black text-[10px] px-2 py-0.5 shadow-2xs">
                        {activeFiltersCount} Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                    Konfigurasi parameter agregasi analitik & master unit sekolah
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetFilter}
                className="h-8 rounded-xl font-bold text-xs px-3.5 cursor-pointer inline-flex items-center gap-1.5 border border-emerald-300 dark:border-emerald-700/80 text-emerald-800 dark:text-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/80 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 shadow-xs transition-all active:scale-95"
              >
                <RefreshCw className="size-3.5" />
                <span>Reset Filter</span>
              </Button>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {/* Dropdown Unit Pendidikan */}
              <div className="min-w-0">
                <SelectLabel>Pilihan Unit Sekolah</SelectLabel>
                <Select
                  value={String(selectedUnit)}
                  onChange={(val) => {
                    setSelectedUnit(val ? String(val) : 'semua')
                  }}
                >
                  <SelectTrigger className="w-full h-8.5 px-2.5 text-[11px] rounded-xl border border-emerald-200/90 bg-emerald-50/70 hover:bg-emerald-100/70 hover:border-emerald-300 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800/80 dark:text-emerald-100 font-medium shadow-2xs cursor-pointer min-w-0">
                    <SelectValue placeholder="Semua Unit Pendidikan" />
                  </SelectTrigger>
                  <SelectContent className="z-50 overflow-y-auto bg-white dark:bg-card-dark border border-emerald-200/90 dark:border-emerald-800/80 rounded-xl shadow-xl p-1 min-w-[var(--trigger-width)] w-auto max-w-[min(calc(100vw-2rem),24rem)]">
                    <SelectItem
                      id="semua"
                      value="semua"
                      className="text-[11px] font-medium py-2 px-2.5 rounded-lg text-emerald-950 dark:text-emerald-100 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/70 transition whitespace-normal text-left leading-snug cursor-pointer"
                      title={`Semua Unit Pendidikan (${availableUnits.length} Unit)`}
                    >
                      Semua Unit Pendidikan ({availableUnits.length} Unit)
                    </SelectItem>
                    {availableUnits.map((unit) => (
                      <SelectItem
                        key={unit.id}
                        id={String(unit.id)}
                        value={String(unit.id)}
                        className="text-[11px] font-medium py-2 px-2.5 rounded-lg text-emerald-950 dark:text-emerald-100 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/70 transition whitespace-normal text-left leading-snug cursor-pointer"
                        title={`${unit.name} (${unit.code})`}
                      >
                        {unit.name} ({unit.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dropdown Tahun Ajaran */}
              <div className="min-w-0">
                <SelectLabel>Tahun Ajaran</SelectLabel>
                <Select
                  value={String(selectedAcademicYear)}
                  onChange={(val) => {
                    setSelectedAcademicYear(val ? String(val) : 'semua')
                  }}
                >
                  <SelectTrigger className="w-full h-8.5 px-2.5 text-[11px] rounded-xl border border-emerald-200/90 bg-emerald-50/70 hover:bg-emerald-100/70 hover:border-emerald-300 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800/80 dark:text-emerald-100 font-medium shadow-2xs cursor-pointer min-w-0">
                    <SelectValue placeholder="Semua Tahun Ajaran" />
                  </SelectTrigger>
                  <SelectContent className="z-50 overflow-y-auto bg-white dark:bg-card-dark border border-emerald-200/90 dark:border-emerald-800/80 rounded-xl shadow-xl p-1 min-w-[var(--trigger-width)] w-auto max-w-[min(calc(100vw-2rem),24rem)]">
                    <SelectItem
                      id="semua"
                      value="semua"
                      className="text-[11px] font-medium py-2 px-2.5 rounded-lg text-emerald-950 dark:text-emerald-100 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/70 transition whitespace-normal text-left leading-snug cursor-pointer"
                      title="Semua Tahun Ajaran"
                    >
                      Semua Tahun Ajaran
                    </SelectItem>
                    {availableAcademicYears.map((year) => (
                      <SelectItem
                        key={year.id}
                        id={String(year.id)}
                        value={String(year.id)}
                        className="text-[11px] font-medium py-2 px-2.5 rounded-lg text-emerald-950 dark:text-emerald-100 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/70 transition whitespace-normal text-left leading-snug cursor-pointer"
                        title={`${year.name} ${year.is_active ? '(Aktif)' : ''}`}
                      >
                        {year.name} {year.is_active ? '(Aktif)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dropdown Semester */}
              <div className="min-w-0">
                <SelectLabel>Semester Akademik</SelectLabel>
                <Select
                  value={String(selectedSemester)}
                  onChange={(val) => {
                    setSelectedSemester(val ? String(val) : 'semua')
                  }}
                >
                  <SelectTrigger className="w-full h-8.5 px-2.5 text-[11px] rounded-xl border border-emerald-200/90 bg-emerald-50/70 hover:bg-emerald-100/70 hover:border-emerald-300 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800/80 dark:text-emerald-100 font-medium shadow-2xs cursor-pointer min-w-0">
                    <SelectValue placeholder="Semua Semester" />
                  </SelectTrigger>
                  <SelectContent className="z-50 overflow-y-auto bg-white dark:bg-card-dark border border-emerald-200/90 dark:border-emerald-800/80 rounded-xl shadow-xl p-1 min-w-[var(--trigger-width)] w-auto max-w-[min(calc(100vw-2rem),24rem)]">
                    <SelectItem
                      id="semua"
                      value="semua"
                      className="text-[11px] font-medium py-2 px-2.5 rounded-lg text-emerald-950 dark:text-emerald-100 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/70 transition whitespace-normal text-left leading-snug cursor-pointer"
                      title="Semua Semester"
                    >
                      Semua Semester
                    </SelectItem>
                    {availableSemesters.map((sem) => (
                      <SelectItem
                        key={sem.id}
                        id={String(sem.id)}
                        value={String(sem.id)}
                        className="text-[11px] font-medium py-2 px-2.5 rounded-lg text-emerald-950 dark:text-emerald-100 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/70 transition whitespace-normal text-left leading-snug cursor-pointer"
                        title={`${sem.name} ${sem.is_active ? '(Aktif)' : ''}`}
                      >
                        {sem.name} {sem.is_active ? '(Aktif)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dropdown Periode Analisis Data */}
              <div className="min-w-0">
                <SelectLabel>Periode Analisis Data</SelectLabel>
                <Select
                  value={String(periodOption)}
                  onChange={(val) => {
                    setPeriodOption(val ? String(val) : 'minggu')
                  }}
                >
                  <SelectTrigger className="w-full h-8.5 px-2.5 text-[11px] rounded-xl border border-emerald-200/90 bg-emerald-50/70 hover:bg-emerald-100/70 hover:border-emerald-300 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800/80 dark:text-emerald-100 font-medium shadow-2xs cursor-pointer min-w-0">
                    <SelectValue placeholder="Pilih Periode..." />
                  </SelectTrigger>
                  <SelectContent className="z-50 overflow-y-auto bg-white dark:bg-card-dark border border-emerald-200/90 dark:border-emerald-800/80 rounded-xl shadow-xl p-1 min-w-[var(--trigger-width)] w-auto max-w-[min(calc(100vw-2rem),24rem)]">
                    <SelectItem id="hari" value="hari" className="text-[11px] font-medium py-2 px-2.5 rounded-lg text-emerald-950 dark:text-emerald-100 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/70 transition whitespace-normal text-left leading-snug cursor-pointer" title="Hari Ini">Hari Ini</SelectItem>
                    <SelectItem id="minggu" value="minggu" className="text-[11px] font-medium py-2 px-2.5 rounded-lg text-emerald-950 dark:text-emerald-100 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/70 transition whitespace-normal text-left leading-snug cursor-pointer" title="7 Hari Terakhir (Default)">7 Hari Terakhir (Default)</SelectItem>
                    <SelectItem id="bulan" value="bulan" className="text-[11px] font-medium py-2 px-2.5 rounded-lg text-emerald-950 dark:text-emerald-100 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/70 transition whitespace-normal text-left leading-snug cursor-pointer" title="Bulan Ini">Bulan Ini</SelectItem>
                    <SelectItem id="semester" value="semester" className="text-[11px] font-medium py-2 px-2.5 rounded-lg text-emerald-950 dark:text-emerald-100 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/70 transition whitespace-normal text-left leading-snug cursor-pointer" title="6 Bulan Terakhir">6 Bulan Terakhir</SelectItem>
                    <SelectItem id="tahun" value="tahun" className="text-[11px] font-medium py-2 px-2.5 rounded-lg text-emerald-950 dark:text-emerald-100 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/70 transition whitespace-normal text-left leading-snug cursor-pointer" title="Tahun Ini">Tahun Ini</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dropdown Status Operasional */}
              <div className="min-w-0">
                <SelectLabel>Status Operasional Unit</SelectLabel>
                <Select
                  value={String(selectedStatus)}
                  onChange={(val) => {
                    setSelectedStatus(val ? String(val) : 'semua')
                  }}
                >
                  <SelectTrigger className="w-full h-8.5 px-2.5 text-[11px] rounded-xl border border-emerald-200/90 bg-emerald-50/70 hover:bg-emerald-100/70 hover:border-emerald-300 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800/80 dark:text-emerald-100 font-medium shadow-2xs cursor-pointer min-w-0">
                    <SelectValue placeholder="Semua Status Operasional" />
                  </SelectTrigger>
                  <SelectContent className="z-50 overflow-y-auto bg-white dark:bg-card-dark border border-emerald-200/90 dark:border-emerald-800/80 rounded-xl shadow-xl p-1 min-w-[var(--trigger-width)] w-auto max-w-[min(calc(100vw-2rem),24rem)]">
                    <SelectItem id="semua" value="semua" className="text-[11px] font-medium py-2 px-2.5 rounded-lg text-emerald-950 dark:text-emerald-100 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/70 transition whitespace-normal text-left leading-snug cursor-pointer" title="Semua Status Operasional">Semua Status Operasional</SelectItem>
                    <SelectItem id="aktif" value="aktif" className="text-[11px] font-medium py-2 px-2.5 rounded-lg text-emerald-950 dark:text-emerald-100 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/70 transition whitespace-normal text-left leading-snug cursor-pointer" title="Aktif Operasional">Aktif Operasional</SelectItem>
                    <SelectItem id="nonaktif" value="nonaktif" className="text-[11px] font-semibold py-2 px-2.5 rounded-lg text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/50 transition whitespace-normal text-left leading-snug cursor-pointer" title="Non-Aktif">Non-Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-5 py-3 border-t border-emerald-500/20 dark:border-emerald-800/40 min-h-[58px] flex items-center bg-emerald-500/5 dark:bg-emerald-950/20">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Filter di atas langsung terhubung ke database. Seluruh ringkasan metrik, distribusi grafik, dan tabel unit akan menyesuaikan secara realtime.
              </p>
            </div>
          </article>
        </motion.div>

        {/* 7. Section Grafik Distribusi Siswa & Komposisi SDM */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
            {/* Card 1: Distribusi Siswa per Unit */}
            <article className="relative overflow-hidden rounded-container border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-card-dark flex flex-col justify-between h-full">
              <div className="flex items-center justify-between border-b border-emerald-500/20 dark:border-emerald-800/40 bg-emerald-500/10 dark:bg-emerald-950/40 px-5 py-4 min-h-[72px] h-[72px]">
                <div className="flex items-center gap-3">
                  <div className="flex size-8.5 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                    <Users className="size-4.5 text-white" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-emerald-900 dark:text-emerald-200 leading-tight">
                      Distribusi Siswa per Unit
                    </h2>
                    <p className="text-xs font-semibold text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                      Jumlah siswa aktif terdaftar di masing-masing unit
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 text-white px-3 py-1 text-xs font-extrabold shadow-xs">
                  Kesiswaan
                </span>
              </div>

              {/* Bar Chart */}
              <div className="flex-1 flex flex-col justify-center items-center w-full p-4 min-h-[300px]">
                <div className="w-full h-72 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={studentStats.items} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis
                        dataKey="shortName"
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
                                  <span
                                    className="size-3 rounded-full shrink-0 shadow-sm"
                                    style={{ backgroundColor: item.color }}
                                  />
                                  <span className="text-xs font-bold leading-tight" style={{ color: item.color }}>
                                    {item.name}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs gap-3">
                                  <span className="text-slate-400 font-medium">Siswa Terdaftar:</span>
                                  <span className="font-extrabold text-white tabular-nums">
                                    {formatAngka(item.total)} Siswa
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs gap-3 mt-1.5">
                                  <span className="text-slate-400 font-medium">Kontribusi:</span>
                                  <span
                                    className="font-bold text-[11px] px-2 py-0.5 rounded-md"
                                    style={{
                                      backgroundColor: `${item.color}25`,
                                      color: item.color,
                                    }}
                                  >
                                    {item.percentage}% dari Total
                                  </span>
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Bar dataKey="total" radius={[6, 6, 0, 0]} name="Siswa Aktif">
                        {studentStats.items.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Dynamic Metric Pills */}
              <div className="w-full grid grid-cols-2 gap-2.5 px-4 pb-3">
                <div className="flex items-center justify-between gap-1.5 p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <span className="size-2.5 rounded-full shrink-0 bg-emerald-500 shadow-xs" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">Total Siswa Aktif</span>
                  </div>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 tabular-nums shrink-0">
                    {formatAngka(studentStats.totalStudents)} ({studentStats.countUnits} Unit)
                  </span>
                </div>
                <div className="flex items-center justify-between gap-1.5 p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <span
                      className="size-2.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: studentStats.topUnit?.color || '#0284c7' }}
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">Siswa Terbanyak</span>
                  </div>
                  <span
                    className="text-xs font-black tabular-nums shrink-0 truncate max-w-[130px]"
                    style={{ color: studentStats.topUnit?.color || '#0284c7' }}
                    title={studentStats.topUnit?.name}
                  >
                    {studentStats.topUnit ? `${studentStats.topUnit.name.split(' - ')[0]} (${formatAngka(studentStats.topUnit.total)})` : '-'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-5 py-3 border-t border-emerald-500/20 dark:border-emerald-800/40 text-xs font-bold text-slate-500 min-h-[58px] bg-emerald-500/5 dark:bg-emerald-950/20">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 dark:text-slate-400">Total Unit Terdaftar:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                    {unitSummaries.length} Unit Sekolah
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 dark:text-slate-400">Total Terdata:</span>
                  <span className="text-teal-600 dark:text-teal-400 font-extrabold">
                    {formatAngka(studentStats.totalStudents)} Siswa
                  </span>
                </div>
              </div>
            </article>

            {/* Card 2: Komposisi SDM & Pendidik */}
            <article className="relative overflow-hidden rounded-container border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-card-dark flex flex-col justify-between h-full">
              <div className="flex items-center justify-between border-b border-emerald-500/20 dark:border-emerald-800/40 bg-emerald-500/10 dark:bg-emerald-950/40 px-5 py-4 min-h-[72px] h-[72px]">
                <div className="flex items-center gap-3">
                  <div className="flex size-8.5 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                    <UserCheck className="size-4.5 text-white" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-emerald-900 dark:text-emerald-200 leading-tight">
                      Komposisi SDM & Pendidik
                    </h2>
                    <p className="text-xs font-semibold text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                      Perbandingan Guru Pendidik dan Tenaga Kependidikan
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 text-white px-3 py-1 text-xs font-extrabold shadow-xs">
                  SDM Staf
                </span>
              </div>

              {/* Donut Chart */}
              <div className="flex-1 flex flex-col justify-center items-center w-full p-4 space-y-4">
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={staffStats.pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={72}
                        outerRadius={108}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {staffStats.pieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(2, 44, 34, 0.95)',
                          borderColor: 'rgba(16, 185, 129, 0.3)',
                          borderRadius: '14px',
                          color: '#F8FAFC',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <strong className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                      {formatAngka(staffStats.total)}
                    </strong>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                      TOTAL
                    </span>
                  </div>
                </div>

                {/* Legend Pills */}
                <div className="w-full grid grid-cols-2 gap-2.5 px-1">
                  <div className="flex items-center justify-between gap-1.5 p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0 truncate">
                      <span className="size-2.5 rounded-full shrink-0 bg-[#0ea5e9] shadow-xs" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">Guru</span>
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums shrink-0">
                      {formatAngka(staffStats.guru)} ({staffStats.guruPct}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1.5 p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0 truncate">
                      <span className="size-2.5 rounded-full shrink-0 bg-[#f43f5e] shadow-xs" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">Tendik</span>
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums shrink-0">
                      {formatAngka(staffStats.tendik)} ({staffStats.tendikPct}%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-5 py-3 border-t border-emerald-500/20 dark:border-emerald-800/40 text-xs font-bold text-slate-500 min-h-[58px] bg-emerald-500/5 dark:bg-emerald-950/20">
                <span>Total SDM Terdaftar</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                  {formatAngka(kpis.total_employees?.total)} Personel
                </span>
              </div>
            </article>
          </div>
        </motion.div>

        {/* 8. Quick Action Navigation Bar */}
        <motion.div variants={itemVariants}>
          <section className="relative overflow-hidden rounded-container border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-card-dark p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-8.5 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                  <Zap className="size-4.5 text-white" strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200 leading-tight">
                    Aksi Cepat Navigasi Master
                  </h3>
                  <p className="text-xs font-semibold text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                    Pintas cepat ke pengelolaan master unit pendidikan, SDM pegawai, peserta didik, dan konfigurasi hak akses
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap shrink-0 py-1">
                <HeroTooltip content="Kelola Master Unit Sekolah">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/dashboard/master/unit-pendidikan')}
                    className="rounded-xl font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Building2 className="size-3.5" />
                    <span>Tambah Unit</span>
                  </Button>
                </HeroTooltip>
                <HeroTooltip content="Kelola & Tambah Pegawai">
                  <Button
                    type="button"
                    variant="export"
                    size="sm"
                    onClick={() => navigate('/dashboard/employees')}
                    className="rounded-xl font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <UserPlus className="size-3.5" />
                    <span>Tambah Pegawai</span>
                  </Button>
                </HeroTooltip>
                <HeroTooltip content="Kelola & Tambah Peserta Didik">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/dashboard/master/siswa')}
                    className="rounded-xl font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Users className="size-3.5" />
                    <span>Tambah Siswa</span>
                  </Button>
                </HeroTooltip>
                <HeroTooltip content="Konfigurasi Hak Akses & Peran Spatie">
                  <Button
                    type="button"
                    variant="edit"
                    size="sm"
                    onClick={() => navigate('/dashboard/hak-akses')}
                    className="rounded-xl font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Key className="size-3.5" />
                    <span>Kelola Hak Akses</span>
                  </Button>
                </HeroTooltip>
                <HeroTooltip content="Pengaturan Preferensi Sistem">
                  <Button
                    type="button"
                    variant="print"
                    size="sm"
                    onClick={() => navigate('/dashboard/pengaturan')}
                    className="rounded-xl font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Settings className="size-3.5" />
                    <span>Pengaturan</span>
                  </Button>
                </HeroTooltip>
              </div>
            </div>
          </section>
        </motion.div>

        {/* 9. Master Datatable Unit Pendidikan */}
        <motion.div variants={itemVariants}>
          <AppDataTable
            title="Ringkasan Master Unit Pendidikan"
            description="Daftar unit sekolah Islam terpadu beserta status operasional dan statistik kesiswaan & pendidik."
            icon={<School className="size-4.5 text-white" strokeWidth={2.2} />}
            iconClassName="!bg-emerald-600 !text-white !border-emerald-600 !rounded-xl !size-8.5 shadow-xs"
            className="rounded-container border-2 border-emerald-300 dark:border-emerald-700/80 shadow-md shadow-emerald-500/10"
            fullBleed={true}
            headerClassName="bg-emerald-500/10 dark:bg-emerald-950/40 border-b border-emerald-500/20 dark:border-emerald-800/40 px-5 py-4 min-h-[72px]"
            columns={unitTableColumns}
            data={filteredUnits}
            countLabel={`${filteredUnits.length} Unit`}
            searchableKeys={['name', 'code', 'status']}
            search={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Cari nama unit pendidikan atau kode unit..."
            clientPagination={true}
            clientPageSize={pageSize}
            isLoading={isLoading}
            density="compact"
            actions={
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="export"
                  size="sm"
                  onClick={handleExportUnitsCsv}
                  className="rounded-xl font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Download className="size-3.5" />
                  <span className="hidden sm:inline">CSV</span>
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/dashboard/master/unit-pendidikan')}
                  className="rounded-xl font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>Kelola Semua</span>
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            }
            filters={
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Status Operasional:</span>
                <div className="flex items-center gap-1.5">
                  {[
                    { id: 'semua', label: 'Semua' },
                    { id: 'aktif', label: 'Aktif' },
                    { id: 'nonaktif', label: 'Non-Aktif' },
                  ].map((st) => (
                    <Button
                      key={st.id}
                      type="button"
                      variant={selectedStatus === st.id ? (st.id === 'nonaktif' ? 'danger' : 'primary') : 'ghost'}
                      size="xs"
                      onClick={() => setSelectedStatus(st.id)}
                      className={cn(
                        'rounded-xl px-3 py-1 text-xs font-bold transition-all cursor-pointer h-7',
                        selectedStatus !== st.id && 'border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300'
                      )}
                    >
                      {st.label}
                    </Button>
                  ))}
                </div>
              </div>
            }
            hasActiveFilters={selectedStatus !== 'semua' || selectedUnit !== 'semua' || Boolean(searchQuery)}
            onResetFilters={resetFilter}
            emptyTitle="Tidak ada data unit sekolah"
            emptyDescription="Tidak ada data unit sekolah yang sesuai dengan filter atau kata kunci pencarian."
          />
        </motion.div>

        {/* 10. Drill-down KPI Quick View Modal */}
        <ModalErrorBoundary onClose={() => setActiveModal(null)}>
          <AnimatePresence>
            {Boolean(activeModal) && (
              <KpiQuickViewModal
                type={activeModal}
                isOpen={Boolean(activeModal)}
                onClose={() => setActiveModal(null)}
              />
            )}
          </AnimatePresence>
        </ModalErrorBoundary>

        {/* 11. Modal Audit Rincian Sesi Masuk User (Standardized HeroUI Dialog) */}
        {selectedLoginAudit && (
          <Dialog
            isOpen={Boolean(selectedLoginAudit)}
            onClose={() => setSelectedLoginAudit(null)}
            className="max-w-xl"
          >
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/25">
                  <ShieldCheck className="size-5 text-white" />
                </div>
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <DialogTitle className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                      Audit Rincian Sesi Masuk Pengguna
                    </DialogTitle>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                      <Sparkles className="size-3 text-emerald-600" /> Sesi Terverifikasi
                    </span>
                  </div>
                  <DialogDescription className="text-xs text-slate-500 font-medium dark:text-slate-400 mt-0.5 truncate">
                    Informasi autentikasi pengguna, hak akses, alamat IP, dan perangkat sesi aktif
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <DialogBody className="space-y-4">
              {/* Header Profil User */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-card-dark border border-emerald-500/20">
                <Avatar className="size-14 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white font-black text-lg shadow-md shadow-emerald-600/25 shrink-0">
                  <AvatarFallback className="text-white font-black text-lg">
                    {(selectedLoginAudit.name || 'U').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                      {selectedLoginAudit.name}
                    </h4>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white font-bold text-[10px] h-5 px-2 shadow-2xs">
                      Akun Aktif
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                    {selectedLoginAudit.email}
                  </p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    No. Telepon: {selectedLoginAudit.phone || '-'}
                  </p>
                </div>
              </div>

              {/* Grid Data Audit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900/50">
                  <span className="text-xs font-bold text-slate-400 block mb-1">Role Utama</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
                    {selectedLoginAudit.role || 'Pengguna'}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900/50">
                  <span className="text-xs font-bold text-slate-400 block mb-1">Unit Pendidikan</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
                    {selectedLoginAudit.unit_name || 'Semua Unit'}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900/50">
                  <span className="text-xs font-bold text-slate-400 block mb-1">Waktu Masuk Sesi</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block">
                    {selectedLoginAudit.exact_time || selectedLoginAudit.created_at || 'Baru saja'}
                  </span>
                  {selectedLoginAudit.exact_time && selectedLoginAudit.created_at && selectedLoginAudit.exact_time !== selectedLoginAudit.created_at && (
                    <span className="text-[10px] text-slate-400">({selectedLoginAudit.created_at})</span>
                  )}
                </div>
                <div className="p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900/50">
                  <span className="text-xs font-bold text-slate-400 block mb-1">Alamat IP & Keamanan</span>
                  <div className="flex items-center justify-between gap-1">
                    <code className="px-2 py-0.5 rounded-md font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-800/60 font-bold text-xs">
                      {selectedLoginAudit.ip_address || '127.0.0.1'}
                    </code>
                    <HeroTooltip content={isCopiedIp ? 'Tersalin!' : 'Salin IP'}>
                      <button
                        type="button"
                        onClick={() => handleCopyIp(selectedLoginAudit.ip_address || '127.0.0.1')}
                        aria-label="Salin IP Alamat"
                        className="size-6 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-600 cursor-pointer"
                      >
                        {isCopiedIp ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                      </button>
                    </HeroTooltip>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900/50">
                  <span className="text-xs font-bold text-slate-400 block mb-1 flex items-center gap-1">
                    <Globe className="size-3" /> Portal Masuk
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase text-xs">
                    {selectedLoginAudit.portal_type || 'Unified Web Dashboard'}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900/50">
                  <span className="text-xs font-bold text-slate-400 block mb-1 flex items-center gap-1">
                    <Laptop className="size-3" /> Metode Autentikasi
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize text-xs">
                    {selectedLoginAudit.login_method || 'Password'}
                  </span>
                </div>
              </div>

              {/* Seluruh Role Terdaftar */}
              {Array.isArray(selectedLoginAudit.roles) && selectedLoginAudit.roles.length > 0 && (
                <div className="p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/20">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
                    Seluruh Role Terdaftar ({selectedLoginAudit.roles.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLoginAudit.roles.map((r) => (
                      <span
                        key={r}
                        className="inline-flex items-center rounded-full bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 text-[10px] font-bold h-5 px-2 shadow-2xs"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* User Agent / Client Info */}
              <div className="p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/20 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">User Agent:</span>
                <span className="font-mono text-[10px] break-all">
                  {selectedLoginAudit.user_agent || 'Mozilla/5.0 (Client Session)'}
                </span>
              </div>
            </DialogBody>

            <DialogFooter>
              <div className="flex items-center justify-between w-full">
                <DialogClose variant="ghost" size="sm" onClick={() => setSelectedLoginAudit(null)}>
                  Tutup
                </DialogClose>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedLoginAudit(null)
                    navigate('/dashboard/hak-akses')
                  }}
                  className="rounded-xl font-extrabold px-5 py-2 text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  <span>Lihat Hak Akses</span>
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </DialogFooter>
          </Dialog>
        )}
      </motion.div>
    </PageContainer>
  )
}
