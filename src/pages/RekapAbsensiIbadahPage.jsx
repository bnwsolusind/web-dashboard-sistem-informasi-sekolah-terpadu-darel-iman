import { useCallback, useEffect, useMemo, useState } from 'react'
import CustomSelect from '@/components/ui/CustomSelect'
import { DatePicker } from '@/components/ui/date-picker'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUpDown,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  HeartHandshake,
  MoreVertical,
  Printer,
  RefreshCcw,
  Search,
  UserCheck,
  UserMinus,
  Users,
  UserX,
  X,
  Sparkles,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { exportCsv } from '../components/reports/ReportKit'
import { worshipAttendanceService } from '../services/worshipAttendanceService'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppBadge from '../components/app/AppBadge'
import AppSkeleton from '../components/app/AppSkeleton'
import AppEmptyState from '../components/app/AppEmptyState'
import {
  MasterStatsGrid,
  MasterStatCard,
  MasterStatusBadge,
  MasterErrorState,
  MasterEmptyState,
  PrintOptionModal,
  SquircleActionButton,
} from '../components/master-data'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from '@/components/ui/table'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import {
  Dialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Backdrop, OverlayWrapper } from '@/components/ui/dialog'

const MODAL_PAGE_SIZE = 6
const today = () => new Date().toISOString().slice(0, 10)
const formatAngka = (value) => new Intl.NumberFormat('id-ID').format(Number(value || 0))

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
}

const warnaStatus = {
  hadirBerjamaah: '#12a968',
  hadirSendiri: '#8b5cf6',
  izinSakit: '#3182f6',
  tidakHadir: '#ff4668',
}

const toneStyles = {
  emerald: {
    cardBg: 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-900/50',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/80',
    iconColor: 'text-emerald-700 dark:text-emerald-300',
    badge: 'bg-emerald-200/80 text-emerald-800 dark:bg-emerald-900/90 dark:text-emerald-200',
  },
  violet: {
    cardBg: 'bg-violet-50/70 dark:bg-violet-950/40 border-violet-200/80 dark:border-violet-900/50',
    iconBg: 'bg-violet-100 dark:bg-violet-900/80',
    iconColor: 'text-violet-700 dark:text-violet-300',
    badge: 'bg-violet-200/80 text-violet-800 dark:bg-violet-900/90 dark:text-violet-200',
  },
  sky: {
    cardBg: 'bg-sky-50/70 dark:bg-sky-950/40 border-sky-200/80 dark:border-sky-900/50',
    iconBg: 'bg-sky-100 dark:bg-sky-900/80',
    iconColor: 'text-sky-700 dark:text-sky-300',
    badge: 'bg-sky-200/80 text-sky-800 dark:bg-sky-900/90 dark:text-sky-200',
  },
  amber: {
    cardBg: 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-900/50',
    iconBg: 'bg-amber-100 dark:bg-amber-900/80',
    iconColor: 'text-amber-700 dark:text-amber-300',
    badge: 'bg-amber-200/80 text-amber-800 dark:bg-amber-900/90 dark:text-amber-200',
  },
  rose: {
    cardBg: 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200/80 dark:border-rose-900/50',
    iconBg: 'bg-rose-100 dark:bg-rose-900/80',
    iconColor: 'text-rose-700 dark:text-rose-300',
    badge: 'bg-rose-200/80 text-rose-800 dark:bg-rose-900/90 dark:text-rose-200',
  },
}

const formatStatusText = (status) => {
  const s = String(status || '').toLowerCase()
  if (s === 'hadir_berjamaah') return 'Hadir Berjamaah'
  if (s === 'hadir_sendiri') return 'Hadir Sendiri'
  if (s === 'izin') return 'Izin'
  if (s === 'sakit') return 'Sakit'
  if (s === 'tidak_hadir' || s === 'alpha') return 'Tidak Hadir'
  return status || 'Hadir'
}

const getStatusBadgeVariant = (status) => {
  const s = String(status || '').toLowerCase()
  if (s === 'hadir_berjamaah') return 'success'
  if (s === 'hadir_sendiri') return 'info'
  if (s === 'izin' || s === 'sakit') return 'warning'
  if (s === 'tidak_hadir' || s === 'alpha') return 'danger'
  return 'primary'
}

const getPeriodDateRange = (periodKey) => {
  const now = new Date()
  const iso = (d) => d.toISOString().slice(0, 10)
  const todayStr = iso(now)

  if (periodKey === 'hari') return { from: todayStr, to: todayStr }
  if (periodKey === 'minggu') {
    const past = new Date(now)
    past.setDate(now.getDate() - 6)
    return { from: iso(past), to: todayStr }
  }
  if (periodKey === 'bulan') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    return { from: iso(firstDay), to: todayStr }
  }
  if (periodKey === 'semester') {
    const past = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    return { from: iso(past), to: todayStr }
  }
  if (periodKey === 'tahun') {
    const firstDay = new Date(now.getFullYear(), 0, 1)
    return { from: iso(firstDay), to: todayStr }
  }
  return { from: '', to: '' }
}

export default function RekapAbsensiIbadahPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState([])
  const [sessions, setSessions] = useState([])

  // Filters
  const [selectedIbadah, setSelectedIbadah] = useState('semua')
  const [status, setStatus] = useState('semua')
  const [period, setPeriod] = useState('hari')
  const [dateFrom, setDateFrom] = useState(today())
  const [dateTo, setDateTo] = useState(today())

  // Pagination & Sorting
  const [halaman, setHalaman] = useState(1)
  const [perHalaman, setPerHalaman] = useState(10)
  const [sortKey, setSortKey] = useState('student_nama')
  const [sortOrder, setSortOrder] = useState('asc')

  // Modals
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [selectedRowModal, setSelectedRowModal] = useState(null)
  const [printTargetRow, setPrintTargetRow] = useState(null)

  // Card Modal State for Summary Cards click
  const [cardModal, setCardModal] = useState({
    isOpen: false,
    statusKey: 'semua',
    title: '',
    tone: 'emerald',
    searchQuery: '',
    page: 1,
  })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const queryDate = dateFrom || today()
      const response = await worshipAttendanceService.getSessions({ date: queryDate })
      const list = response.data?.data || []
      setSessions(list)

      const details = await Promise.all(
        list.map((session) => worshipAttendanceService.getSessionDetail(session.id))
      )

      const flatted = details.flatMap((item) => {
        const data = item.data?.data || {}
        return (data.details || []).map((detail) => ({
          ...detail,
          template: data.template || item.template,
          session: data.session || item.session,
        }))
      })

      setRows(flatted)
    } catch (err) {
      setError(err?.response?.data?.message || 'Rekap absensi ibadah gagal dimuat.')
    } finally {
      setLoading(false)
    }
  }, [dateFrom])

  useEffect(() => {
    loadData()
  }, [loadData])

  const daftarIbadah = useMemo(() => {
    const setNames = new Set()
    rows.forEach((r) => {
      const n = r.template?.nama || r.template?.name || r.session?.nama || r.session?.name
      if (n) setNames.add(n)
    })
    return [...setNames]
  }, [rows])

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const hasilFilter = useMemo(() => {
    const filtered = rows.filter((r) => {
      const nama = r.student?.nama_lengkap || r.student?.full_name || r.student?.nama || ''
      const nis = r.student?.nis || ''
      const ibadahNama = r.template?.nama || r.template?.name || r.session?.nama || ''
      const cocokCari = `${nama} ${nis} ${ibadahNama}`.toLowerCase().includes(search.toLowerCase())

      const cocokIbadah = selectedIbadah === 'semua' || ibadahNama === selectedIbadah

      const statusRaw = String(r.attendance_status || r.status || '').toLowerCase()
      const cocokStatus =
        status === 'semua' ||
        (status === 'hadir_berjamaah' && statusRaw === 'hadir_berjamaah') ||
        (status === 'hadir_sendiri' && statusRaw === 'hadir_sendiri') ||
        (status === 'izin' && (statusRaw === 'izin' || statusRaw === 'sakit')) ||
        (status === 'tidak_hadir' && (statusRaw === 'tidak_hadir' || statusRaw === 'alpha'))

      const tglItem = r.scan_time?.slice(0, 10) || r.created_at?.slice(0, 10) || dateFrom
      let cocokPeriode = true
      if (dateFrom && tglItem) cocokPeriode = tglItem >= dateFrom
      if (dateTo && tglItem && cocokPeriode) cocokPeriode = tglItem <= dateTo

      return cocokCari && cocokIbadah && cocokStatus && cocokPeriode
    })

    if (sortKey) {
      filtered.sort((a, b) => {
        let valA = a.student?.nama_lengkap || a.student?.full_name || a.student?.nama || ''
        let valB = b.student?.nama_lengkap || b.student?.full_name || b.student?.nama || ''
        if (sortKey === 'ibadah') {
          valA = a.template?.nama || a.template?.name || ''
          valB = b.template?.nama || b.template?.name || ''
        } else if (sortKey === 'status') {
          valA = a.attendance_status || a.status || ''
          valB = b.attendance_status || b.status || ''
        }
        if (typeof valA === 'string') valA = valA.toLowerCase()
        if (typeof valB === 'string') valB = valB.toLowerCase()
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1
        return 0
      })
    }
    return filtered
  }, [rows, search, selectedIbadah, status, dateFrom, dateTo, sortKey, sortOrder])

  const totalHalaman = Math.max(Math.ceil(hasilFilter.length / perHalaman), 1)
  const baris = useMemo(() => {
    const start = (halaman - 1) * perHalaman
    return hasilFilter.slice(start, start + perHalaman)
  }, [hasilFilter, halaman, perHalaman])

  useEffect(() => {
    setHalaman(1)
  }, [search, selectedIbadah, status, period, dateFrom, dateTo, perHalaman])

  // KPIs Metrics
  const metrics = useMemo(() => {
    const total = rows.length
    const hadirBerjamaah = rows.filter((r) => String(r.attendance_status || r.status || '').toLowerCase() === 'hadir_berjamaah').length
    const hadirSendiri = rows.filter((r) => String(r.attendance_status || r.status || '').toLowerCase() === 'hadir_sendiri').length
    const izinSakit = rows.filter((r) => ['izin', 'sakit'].includes(String(r.attendance_status || r.status || '').toLowerCase())).length
    const tidakHadir = rows.filter((r) => ['tidak_hadir', 'alpha'].includes(String(r.attendance_status || r.status || '').toLowerCase())).length
    const baseTotal = total > 0 ? total : 1

    return { total, hadirBerjamaah, hadirSendiri, izinSakit, tidakHadir, baseTotal }
  }, [rows])

  const cards = useMemo(
    () => [
      {
        label: 'Hadir Berjamaah',
        statusKey: 'hadir_berjamaah',
        value: metrics.hadirBerjamaah,
        icon: CheckCircle2,
        tone: 'emerald',
        percent: (metrics.hadirBerjamaah / metrics.baseTotal) * 100,
      },
      {
        label: 'Hadir Sendiri',
        statusKey: 'hadir_sendiri',
        value: metrics.hadirSendiri,
        icon: Clock,
        tone: 'violet',
        percent: (metrics.hadirSendiri / metrics.baseTotal) * 100,
      },
      {
        label: 'Izin / Sakit',
        statusKey: 'izin',
        value: metrics.izinSakit,
        icon: HeartHandshake,
        tone: 'sky',
        percent: (metrics.izinSakit / metrics.baseTotal) * 100,
      },
      {
        label: 'Tidak Hadir',
        statusKey: 'tidak_hadir',
        value: metrics.tidakHadir,
        icon: UserX,
        tone: 'rose',
        percent: (metrics.tidakHadir / metrics.baseTotal) * 100,
      },
      {
        label: 'Total Presensi',
        statusKey: 'semua',
        value: metrics.total,
        icon: Users,
        tone: 'amber',
        percent: 100,
      },
    ],
    [metrics]
  )

  const distribution = useMemo(
    () => [
      { name: 'Berjamaah', value: metrics.hadirBerjamaah, color: warnaStatus.hadirBerjamaah },
      { name: 'Sendiri', value: metrics.hadirSendiri, color: warnaStatus.hadirSendiri },
      { name: 'Izin/Sakit', value: metrics.izinSakit, color: warnaStatus.izinSakit },
      { name: 'Tidak Hadir', value: metrics.tidakHadir, color: warnaStatus.tidakHadir },
    ],
    [metrics]
  )

  const chartIbadah = useMemo(() => {
    const map = new Map()
    hasilFilter.forEach((r) => {
      const ibadahNama = r.template?.nama || r.template?.name || r.session?.nama || 'Ibadah'
      map.set(ibadahNama, (map.get(ibadahNama) || 0) + 1)
    })
    return [...map].map(([nama, jumlah]) => ({ nama, jumlah }))
  }, [hasilFilter])

  const resetFilter = () => {
    setSelectedIbadah('semua')
    setStatus('semua')
    setPeriod('hari')
    const todayStr = today()
    setDateFrom(todayStr)
    setDateTo(todayStr)
    setSearch('')
    setSortKey('student_nama')
    setSortOrder('asc')
    setHalaman(1)
  }

  // Card Modal Handlers
  const openCardModal = (statusKey, label, tone) => {
    setCardModal({
      isOpen: true,
      statusKey,
      title: `Data Santri Status ${label}`,
      tone,
      searchQuery: '',
      page: 1,
    })
  }

  const closeCardModal = () => {
    setCardModal((prev) => ({ ...prev, isOpen: false }))
  }

  const modalRows = useMemo(() => {
    if (!cardModal.isOpen) return []
    let list = hasilFilter
    if (cardModal.statusKey && cardModal.statusKey !== 'semua') {
      if (cardModal.statusKey === 'izin') {
        list = list.filter((r) => ['izin', 'sakit'].includes(String(r.attendance_status || r.status || '').toLowerCase()))
      } else if (cardModal.statusKey === 'tidak_hadir') {
        list = list.filter((r) => ['tidak_hadir', 'alpha'].includes(String(r.attendance_status || r.status || '').toLowerCase()))
      } else {
        list = list.filter((r) => String(r.attendance_status || r.status || '').toLowerCase() === cardModal.statusKey)
      }
    }
    if (cardModal.searchQuery.trim()) {
      const q = cardModal.searchQuery.toLowerCase().trim()
      list = list.filter((r) => {
        const name = (r.student?.nama_lengkap || r.student?.full_name || r.student?.nama || '').toLowerCase()
        const nis = (r.student?.nis || '').toLowerCase()
        const ibadah = (r.template?.nama || r.template?.name || '').toLowerCase()
        return name.includes(q) || nis.includes(q) || ibadah.includes(q)
      })
    }
    return list
  }, [hasilFilter, cardModal.isOpen, cardModal.statusKey, cardModal.searchQuery])

  const modalTotalPages = Math.max(1, Math.ceil(modalRows.length / MODAL_PAGE_SIZE))
  const paginatedModalRows = useMemo(() => {
    return modalRows.slice((cardModal.page - 1) * MODAL_PAGE_SIZE, cardModal.page * MODAL_PAGE_SIZE)
  }, [modalRows, cardModal.page])

  const kolomCsv = [
    { key: 'ibadah', label: 'Ibadah / Sesi', export: (r) => r.template?.nama || r.template?.name || '-' },
    { key: 'siswa', label: 'Nama Santri / Siswa', export: (r) => r.student?.nama_lengkap || r.student?.full_name || r.student?.nama || '-' },
    { key: 'nis', label: 'NIS', export: (r) => r.student?.nis || '-' },
    { key: 'status', label: 'Status Kehadiran', export: (r) => formatStatusText(r.attendance_status || r.status) },
    { key: 'scan_time', label: 'Waktu Scan', export: (r) => r.scan_time || '-' },
    { key: 'method', label: 'Metode', export: (r) => r.method || '-' },
    { key: 'notes', label: 'Catatan', export: (r) => r.notes || '-' },
  ]

  const handlePrintClean = () => {
    const listToPrint = printTargetRow ? [printTargetRow] : hasilFilter
    const title = printTargetRow ? `Laporan Presensi Ibadah: ${printTargetRow.student?.nama_lengkap || printTargetRow.student?.full_name}` : 'Rekap Laporan Presensi Ibadah Santri'
    const subtitle = `Tanggal: ${dateFrom || today()} s/d ${dateTo || today()} — Total: ${listToPrint.length} Records`

    printCleanTable({
      title,
      subtitle,
      headers: ['NO', 'IBADAH', 'NAMA SANTRI / SISWA', 'NIS', 'STATUS KEHADIRAN', 'WAKTU SCAN', 'METODE'],
      rows: listToPrint.map((r, i) => [
        i + 1,
        r.template?.nama || r.template?.name || '-',
        r.student?.nama_lengkap || r.student?.full_name || r.student?.nama || '-',
        r.student?.nis || '-',
        formatStatusText(r.attendance_status || r.status),
        r.scan_time || '-',
        r.method || '-',
      ]),
    })
  }

  const handleDownloadPdf = () => {
    const listToPrint = printTargetRow ? [printTargetRow] : hasilFilter
    const title = printTargetRow ? `Laporan Presensi Ibadah: ${printTargetRow.student?.nama_lengkap || printTargetRow.student?.full_name}` : 'Rekap Laporan Presensi Ibadah Santri'
    const filename = `rekap-absensi-ibadah-${dateFrom || today()}.pdf`

    downloadPdfTable({
      title,
      filename,
      headers: ['NO', 'IBADAH', 'NAMA SANTRI / SISWA', 'NIS', 'STATUS KEHADIRAN', 'WAKTU SCAN', 'METODE'],
      rows: listToPrint.map((r, i) => [
        i + 1,
        r.template?.nama || r.template?.name || '-',
        r.student?.nama_lengkap || r.student?.full_name || r.student?.nama || '-',
        r.student?.nis || '-',
        formatStatusText(r.attendance_status || r.status),
        r.scan_time || '-',
        r.method || '-',
      ]),
    })
  }

  if (loading) {
    return (
      <PageContainer className="space-y-6 pb-12">
        <AppSkeleton rows={8} />
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer className="space-y-6 pb-12">
        <MasterErrorState message={error} onRetry={loadData} />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-12">
        {/* Navigation Breadcrumb */}
        <motion.div variants={itemVariants} className="mb-2">
          <AppBreadcrumb
            items={[
              { label: 'Absensi', href: '/absensi' },
              { label: 'Rekap Absensi Ibadah' },
            ]}
          />
        </motion.div>

        {/* MODERN HERO CARD HEADER (MATCHING PORTAL ORANG TUA / SISWA STYLE) */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
            <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                  <HeartHandshake className="size-6 sm:size-7 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                      <Sparkles className="size-3 text-amber-300 animate-pulse" />
                      Rekap Absensi Ibadah Santri
                    </span>
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                      Ibadah Wajib & Sunnah
                    </span>
                  </div>
                  <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Rekapitulasi Absensi Ibadah Santri
                  </h1>
                  <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 w-full">
                    Pemantauan dan rekapitulasi verifikasi presensi shalat 5 waktu jamaah, qiyamul lail, tilawah, dan ibadah yaumiyyah santri.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 z-10">
                <Button
                  type="button"
                  variant="primary"
                  appearance="fill"
                  size="sm"
                  onClick={loadData}
                  disabled={loading}
                  prefixIcon={<RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
                  className="!bg-gradient-to-r !from-emerald-600 !to-teal-600 !text-white font-bold shadow-md shadow-emerald-600/25 cursor-pointer"
                >
                  Segarkan Data
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards Grid (5 Equal & Colored Cards with Spring Physics) */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
          {cards.map(({ label, statusKey, value, icon: Icon, tone, percent }) => {
            const style = toneStyles[tone] || toneStyles.emerald
            return (
              <motion.article
                key={label}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={() => openCardModal(statusKey, label, tone)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openCardModal(statusKey, label, tone)}
                className={`group flex flex-col justify-between h-full p-4 rounded-[18px] border shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer ${style.cardBg}`}
                title={`Klik untuk melihat detail data ${label}`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={`size-10 sm:size-11 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg} ${style.iconColor}`}>
                    <Icon className="size-5 sm:size-6" />
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${style.badge}`}>
                    {percent.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">{label}</span>
                  <strong className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white block">
                    {formatAngka(value)}
                  </strong>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800/80">
                  <span>dari total data</span>
                  <span className="inline-flex items-center gap-0.5 text-emerald-700 dark:text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform">
                    Detail &rarr;
                  </span>
                </div>
              </motion.article>
            )
          })}
        </motion.div>

        {/* 3-Column Equal Grid: Filter Absensi Ibadah, Grafik Sesi, & Donut Komposisi */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {/* Col 1: Panel Filter Laporan */}
          <article className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Filter Absensi Ibadah</h2>
                <button
                  type="button"
                  onClick={resetFilter}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Nama Ibadah / Sesi
                  </label>
                  <CustomSelect
                    value={selectedIbadah}
                    onChange={(e) => {
                      setSelectedIbadah(e.target.value)
                      setHalaman(1)
                    }}
                    className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="semua">Semua Sesi Ibadah</option>
                    {daftarIbadah.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </CustomSelect>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Status Kehadiran
                  </label>
                  <CustomSelect
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value)
                      setHalaman(1)
                    }}
                    className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="semua">Semua Status Kehadiran</option>
                    <option value="hadir_berjamaah">Hadir Berjamaah</option>
                    <option value="hadir_sendiri">Hadir Sendiri</option>
                    <option value="izin">Izin / Sakit</option>
                    <option value="tidak_hadir">Tidak Hadir</option>
                  </CustomSelect>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Periode Waktu
                  </label>
                  <CustomSelect
                    value={period}
                    onChange={(e) => {
                      const nextP = e.target.value
                      setPeriod(nextP)
                      if (nextP !== 'custom' && nextP !== 'semua') {
                        const { from, to } = getPeriodDateRange(nextP)
                        setDateFrom(from)
                        setDateTo(to)
                      } else if (nextP === 'semua') {
                        setDateFrom('')
                        setDateTo('')
                      }
                      setHalaman(1)
                    }}
                    className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="semua">Semua Periode Data</option>
                    <option value="hari">Hari Ini (Per Hari)</option>
                    <option value="minggu">7 Hari Terakhir (Per Minggu)</option>
                    <option value="bulan">Bulan Ini (Per Bulan)</option>
                    <option value="semester">6 Bulan Terakhir (Per Semester)</option>
                    <option value="tahun">Tahun Ini (Per Tahun)</option>
                    <option value="custom">Rentang Tanggal Kustom</option>
                  </CustomSelect>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Tanggal Mulai</label>
                    <DatePicker
                      value={dateFrom}
                      onChange={(e) => {
                        setDateFrom(e.target.value)
                        setPeriod('custom')
                        setHalaman(1)
                      }}
                      placeholder="Mulai..."
                      inputClassName="h-8 text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Tanggal Selesai</label>
                    <DatePicker
                      value={dateTo}
                      onChange={(e) => {
                        setDateTo(e.target.value)
                        setPeriod('custom')
                        setHalaman(1)
                      }}
                      placeholder="Selesai..."
                      inputClassName="h-8 text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Pencarian Santri / Siswa
                  </label>
                  <input
                    type="text"
                    placeholder="Nama, NIS, atau Sesi Ibadah..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </article>

          {/* Col 2: BarChart Breakdown per Sesi Ibadah */}
          <article className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Absensi per Sesi Ibadah</h2>
              <span className="text-xs font-semibold text-slate-400">Breakdown Sesi</span>
            </div>
            <div className="h-64 w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">Memuat grafik...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartIbadah} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="nama" tick={{ fontSize: 10 }} stroke="#888888" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#888888" />
                    <Tooltip formatter={(v) => [formatAngka(v), 'Santri']} />
                    <Bar dataKey="jumlah" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={44} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </article>

          {/* Col 3: Donut Komposisi Kehadiran */}
          <article className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Komposisi Kehadiran</h2>
              <span className="text-xs font-bold text-slate-500">{formatAngka(metrics.total)} Total</span>
            </div>
            <div className="flex flex-col items-center justify-center flex-1">
              <div className="relative w-40 h-40 mb-3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distribution} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="88%" paddingAngle={2}>
                      {distribution.map((item) => (
                        <Cell key={item.name} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [formatAngka(v), 'Santri']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <strong className="text-xl font-black text-slate-900 dark:text-white">{formatAngka(metrics.total)}</strong>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Presensi</span>
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-2 text-xs">
                {distribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60">
                    <span className="size-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                    <div className="flex items-center justify-between w-full min-w-0">
                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate">{item.name}</span>
                      <span className="text-[11px] font-bold text-slate-900 dark:text-white ml-1">{formatAngka(item.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </motion.div>

        {/* Main Datatable Outer Container */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
          {/* Header Baris 1: Title & Action Buttons */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-500/20">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Hasil & Rekap Absensi Ibadah</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Rekapan verifikasi kehadiran sholat dan ibadah santri berbasis QR / Scan.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-nowrap shrink-0">
              <SquircleActionButton
                variant="export"
                label="Export CSV"
                onClick={() => exportCsv('rekap-absensi-ibadah.csv', kolomCsv, hasilFilter)}
              />
              <SquircleActionButton
                variant="view"
                icon={Printer}
                label="Cetak Data"
                onClick={() => {
                  setPrintTargetRow(null)
                  setIsPrintModalOpen(true)
                }}
              />
            </div>
          </div>

          {/* Toolbar Baris 2: Search Input & Per-Page Controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Cari nama santri, NIS, atau sesi ibadah..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setHalaman(1)
                }}
                className="pl-9 text-xs font-medium"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <span className="text-xs font-medium text-slate-500">Per Halaman:</span>
              <div className="relative">
                <CustomSelect
                  value={perHalaman}
                  onChange={(e) => {
                    setPerHalaman(Number(e.target.value))
                    setHalaman(1)
                  }}
                  className="h-9 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-800 shadow-2xs focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </CustomSelect>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Viewport Tabel dengan Horizontal Padding */}
          <div className="px-4 sm:px-6 md:px-8 overflow-x-auto">
            {loading ? (
              <div className="py-6">
                <AppSkeleton rows={6} />
              </div>
            ) : baris.length === 0 ? (
              <div className="py-8">
                <AppEmptyState
                  title="Tidak ada data presensi ibadah"
                  description="Belum ada data presensi ibadah yang sesuai dengan kriteria pencarian dan filter pilihan Anda."
                />
              </div>
            ) : (
              <TableRoot fullBleed={false}>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">#</TableHead>

                    <TableHead
                      className="cursor-pointer select-none hover:text-emerald-600 transition-colors"
                      onClick={() => handleSort('student_nama')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Nama Santri / Siswa</span>
                        <ArrowUpDown className="size-3.5 text-slate-400" />
                      </div>
                    </TableHead>

                    <TableHead className="text-center">NIS</TableHead>

                    <TableHead
                      className="text-center cursor-pointer select-none hover:text-emerald-600 transition-colors"
                      onClick={() => handleSort('ibadah')}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>Ibadah / Sesi</span>
                        <ArrowUpDown className="size-3.5 text-slate-400" />
                      </div>
                    </TableHead>

                    <TableHead className="text-center">Waktu Scan</TableHead>
                    <TableHead className="text-center">Metode</TableHead>
                    <TableHead className="text-right">Status Kehadiran</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {baris.map((item, index) => {
                    const studentName = item.student?.nama_lengkap || item.student?.full_name || item.student?.nama || 'Santri'
                    const studentNis = item.student?.nis || '-'
                    const ibadahStr = item.template?.nama || item.template?.name || item.session?.nama || '-'
                    const st = item.attendance_status || item.status
                    const statusVariant = getStatusBadgeVariant(st)

                    return (
                      <TableRow key={item.id || index} className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors">
                        <TableCell className="text-center font-bold text-slate-400 text-xs">
                          {(halaman - 1) * perHalaman + index + 1}
                        </TableCell>

                        {/* Cell Identitas Santri dengan HoverCard */}
                        <TableCell>
                          <HoverCard>
                            <HoverCardTrigger
                              onClick={(e) => {
                                e.preventDefault()
                                setSelectedRowModal(item)
                              }}
                              className="font-extrabold text-slate-900 dark:text-white text-sm border-b border-dashed border-slate-400/60 hover:border-[#0E5C44] transition-colors cursor-pointer inline-block"
                            >
                              {studentName}
                            </HoverCardTrigger>

                            <HoverCardContent className="w-72 p-0 overflow-hidden border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#1B2433] shadow-xl rounded-2xl z-50">
                              <div className="relative h-20 w-full bg-gradient-to-r from-emerald-800 to-teal-900 p-3.5 flex items-center justify-between text-white">
                                <div>
                                  <span className="text-[9px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-white">
                                    {ibadahStr}
                                  </span>
                                  <h4 className="text-sm font-extrabold mt-1 text-white truncate max-w-[170px]">
                                    {studentName}
                                  </h4>
                                </div>
                                <div className="size-10 rounded-full bg-white/10 backdrop-blur-xs flex items-center justify-center font-black text-xs text-white border border-white/20 shrink-0">
                                  {studentName.slice(0, 2).toUpperCase()}
                                </div>
                              </div>

                              <div className="p-3.5 space-y-2.5">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-slate-400 block text-[10px] font-semibold">NIS</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono truncate block">{studentNis}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[10px] font-semibold">Waktu Scan</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono truncate block">{item.scan_time || '-'}</span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setSelectedRowModal(item)}
                                  className="w-full py-2 bg-[#0E5C44] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all hover:bg-[#1E8E5A] active:scale-98 shadow-xs cursor-pointer"
                                >
                                  Lihat Detail Presensi
                                </button>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </TableCell>

                        <TableCell className="text-center font-mono font-semibold text-slate-600 dark:text-slate-400 text-xs">
                          {studentNis}
                        </TableCell>

                        <TableCell className="text-center font-semibold text-slate-800 dark:text-slate-200">
                          {ibadahStr}
                        </TableCell>

                        <TableCell className="text-center font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
                          {item.scan_time || '-'}
                        </TableCell>

                        <TableCell className="text-center text-xs font-semibold text-slate-500">
                          {item.method || 'QR / Scan'}
                        </TableCell>

                        <TableCell className="text-right">
                          <AppBadge
                            variant={statusVariant}
                            className="hover:scale-105 transition-transform cursor-pointer"
                            onClick={() => setSelectedRowModal(item)}
                          >
                            {formatStatusText(st)}
                          </AppBadge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </TableRoot>
            )}
          </div>

          {/* Footer Pagination Navigation */}
          <div className="w-full border-t border-slate-100 px-4 py-3.5 sm:px-6 md:px-8 dark:border-slate-800">
            <Pagination
              currentPage={halaman}
              totalPages={totalHalaman}
              onPageChange={(page) => setHalaman(page)}
              sideLayout="full"
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Summary Card Interactive Datatable Modal */}
      {cardModal.isOpen && (
        <Dialog
          isOpen={cardModal.isOpen}
          onOpenChange={(open) => !open && closeCardModal()}
          className="w-full max-w-4xl max-h-[90vh] flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl"
        >
          <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {cardModal.title}
                </DialogTitle>
                <AppBadge variant={cardModal.tone === 'rose' ? 'danger' : cardModal.tone === 'amber' ? 'warning' : 'success'}>
                  {modalRows.length} Data Santri
                </AppBadge>
              </div>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Daftar rincian log presensi ibadah santri dengan status {cardModal.title} pada periode {dateFrom || today()} s/d {dateTo || today()}
              </DialogDescription>
            </div>
          </DialogHeader>

          <DialogBody className="flex-1 overflow-y-auto py-4 space-y-4">
            {/* Modal Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama santri, NIS, atau ibadah..."
                  value={cardModal.searchQuery}
                  onChange={(e) => setCardModal((prev) => ({ ...prev, searchQuery: e.target.value, page: 1 }))}
                  className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {cardModal.searchQuery && (
                  <button
                    type="button"
                    onClick={() => setCardModal((prev) => ({ ...prev, searchQuery: '', page: 1 }))}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Modal Datatable */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">No</th>
                    <th className="py-3 px-4">Santri / Siswa</th>
                    <th className="py-3 px-4">NIS</th>
                    <th className="py-3 px-4">Sesi Ibadah</th>
                    <th className="py-3 px-4">Waktu Scan</th>
                    <th className="py-3 px-4">Metode</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedModalRows.length > 0 ? (
                    paginatedModalRows.map((row, idx) => {
                      const studentName = row.student?.nama_lengkap || row.student?.full_name || row.student?.nama || 'Santri'
                      const studentNis = row.student?.nis || '-'
                      const ibadahStr = row.template?.nama || row.template?.name || row.session?.nama || '-'
                      const st = row.attendance_status || row.status

                      return (
                        <tr key={row.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-medium text-slate-500">
                            {(cardModal.page - 1) * MODAL_PAGE_SIZE + idx + 1}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            {studentName}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                            {studentNis}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                            {ibadahStr}
                          </td>
                          <td className="py-3 px-4 text-emerald-700 dark:text-emerald-400 font-bold font-mono">
                            {row.scan_time || '-'}
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-medium">
                            {row.method || 'QR / Scan'}
                          </td>
                          <td className="py-3 px-4">
                            <AppBadge variant={getStatusBadgeVariant(st)}>
                              {formatStatusText(st)}
                            </AppBadge>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400 font-medium">
                        {cardModal.searchQuery ? 'Tidak ada data presensi yang cocok dengan pencarian.' : 'Belum ada data pada kategori ini.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </DialogBody>

          <DialogFooter className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium">
              Menampilkan {modalRows.length ? (cardModal.page - 1) * MODAL_PAGE_SIZE + 1 : 0}–{Math.min(cardModal.page * MODAL_PAGE_SIZE, modalRows.length)} dari {modalRows.length} data
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 mr-4">
                <button
                  type="button"
                  disabled={cardModal.page === 1}
                  onClick={() => setCardModal((prev) => ({ ...prev, page: prev.page - 1 }))}
                  className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-semibold px-2 text-slate-700 dark:text-slate-300">
                  {cardModal.page} / {modalTotalPages}
                </span>
                <button
                  type="button"
                  disabled={cardModal.page === modalTotalPages}
                  onClick={() => setCardModal((prev) => ({ ...prev, page: prev.page + 1 }))}
                  className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <Button variant="ghost" onClick={closeCardModal}>
                Tutup
              </Button>
            </div>
          </DialogFooter>
        </Dialog>
      )}

      {/* Modal Detail Rincian Presensi Santri saat Klik Data */}
      <OverlayWrapper isOpen={!!selectedRowModal} onOpenChange={() => setSelectedRowModal(null)}>
        <Backdrop isOpen={!!selectedRowModal} onOpenChange={() => setSelectedRowModal(null)}>
          <Dialog
            isOpen={!!selectedRowModal}
            onOpenChange={() => setSelectedRowModal(null)}
            showCloseButton={true}
            className="w-full max-w-lg rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
          >
            {selectedRowModal && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-[#0E5C44] dark:text-[#3FBF75] flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-[#0E5C44] dark:text-[#3FBF75] flex items-center justify-center font-extrabold text-sm shrink-0">
                      {(selectedRowModal.student?.nama_lengkap || selectedRowModal.student?.full_name || selectedRowModal.student?.nama || 'S')[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold leading-tight text-slate-900 dark:text-white">
                        {selectedRowModal.student?.nama_lengkap || selectedRowModal.student?.full_name || selectedRowModal.student?.nama}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium font-mono">
                        NIS: {selectedRowModal.student?.nis || '-'}
                      </p>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                <DialogBody className="space-y-4 py-2">
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold">Nama Ibadah / Sesi</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {selectedRowModal.template?.nama || selectedRowModal.template?.name || selectedRowModal.session?.nama || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold">Status Kehadiran</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatStatusText(selectedRowModal.attendance_status || selectedRowModal.status)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold">Metode Presensi</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {selectedRowModal.method || 'QR / Scan'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold">Catatan</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {selectedRowModal.notes || '-'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60">
                    <span className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                      Waktu Scan Presensi
                    </span>
                    <span className="text-xl font-black text-emerald-900 dark:text-emerald-200 font-mono">
                      {selectedRowModal.scan_time || '-'}
                    </span>
                  </div>
                </DialogBody>

                <DialogFooter className="pt-2 flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    appearance="outline"
                    size="sm"
                    onClick={() => setSelectedRowModal(null)}
                  >
                    Tutup
                  </Button>
                  <Button
                    variant="primary"
                    appearance="fill"
                    size="sm"
                    onClick={() => {
                      setPrintTargetRow(selectedRowModal)
                      setSelectedRowModal(null)
                      setIsPrintModalOpen(true)
                    }}
                  >
                    <Printer className="size-4 mr-1.5" /> Cetak Data Ibadah
                  </Button>
                </DialogFooter>
              </>
            )}
          </Dialog>
        </Backdrop>
      </OverlayWrapper>

      {/* Modal Opsi Cetak & Unduh PDF */}
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false)
          setPrintTargetRow(null)
        }}
        onPrint={handlePrintClean}
        onDownloadPdf={handleDownloadPdf}
        title={
          printTargetRow
            ? `Cetak Laporan: ${printTargetRow.student?.nama_lengkap || printTargetRow.student?.full_name}`
            : 'Rekap Absensi Ibadah Santri'
        }
      />
    </PageContainer>
  )
}

