import {
  KpiStatCard
} from '../../components/app'
import CustomSelect from "../../components/ui/CustomSelect"
import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'
import {
  motion
} from 'framer-motion'
import {
  BookOpen,
  CalendarRange,
  CheckCircle2,
  Clock3,
  Filter,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles
} from 'lucide-react'
import {
  attendanceDashboardService
} from '../../services/attendance/attendanceDashboardService'
import AppBreadcrumb from '../../components/app/AppBreadcrumb'
import {
  MasterEmptyState,
  MasterErrorState
} from '../../components/master-data'
import {
  Badge
} from '@/components/ui/badge'
import {
  Button
} from '@/components/ui/button'
import {
  DatePicker
} from '@/components/ui/date-picker'

const unwrap = (response) => response?.data?.data || response?.data || []
const formatDate = (value) =>
 value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value)) : '-'

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

const MODERN_CARD_TONES = {
  emerald: {
    card: 'rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-gradient-to-b from-[#E6F8F3] via-[#E6F8F3]/30 to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-emerald-400',
    glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
    iconBox: '!bg-emerald-600 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-emerald-600 !text-white shadow-xs rounded-full',
    tag: 'bg-[#D1FAE5] text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-[#D1FAE5] text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-emerald-800 dark:text-emerald-300',
    title: 'text-emerald-800 dark:text-emerald-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-emerald-700 dark:text-emerald-400 font-bold',
    subtext: 'text-emerald-700 dark:text-emerald-400 font-bold',
    cta: 'text-emerald-700 dark:text-emerald-400 font-bold',
    divider: 'border-emerald-100 dark:border-emerald-900/60',
  },
  blue: {
    card: 'rounded-[22px] border-2 border-sky-300 dark:border-sky-700/80 bg-gradient-to-b from-[#E0F2FE]/70 via-[#E0F2FE]/20 to-white dark:from-sky-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-sky-400',
    glow: 'bg-sky-400/20 group-hover:bg-sky-400/30',
    iconBox: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20 rounded-2xl',
    iconGradient: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20 rounded-2xl',
    tag: 'bg-[#E0F2FE] text-sky-900 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-[#E0F2FE] text-sky-900 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-sky-800 dark:text-sky-300',
    title: 'text-sky-800 dark:text-sky-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-sky-700 dark:text-sky-400 font-bold',
    subtext: 'text-sky-700 dark:text-sky-400 font-bold',
    cta: 'text-sky-700 dark:text-sky-400 font-bold',
    divider: 'border-sky-100 dark:border-sky-900/60',
  },
  sky: {
    card: 'rounded-[22px] border-2 border-sky-300 dark:border-sky-700/80 bg-gradient-to-b from-[#E0F2FE]/70 via-[#E0F2FE]/20 to-white dark:from-sky-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-sky-400',
    glow: 'bg-sky-400/20 group-hover:bg-sky-400/30',
    iconBox: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20 rounded-2xl',
    iconGradient: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20 rounded-2xl',
    tag: 'bg-[#E0F2FE] text-sky-900 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-[#E0F2FE] text-sky-900 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-sky-800 dark:text-sky-300',
    title: 'text-sky-800 dark:text-sky-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-sky-700 dark:text-sky-400 font-bold',
    subtext: 'text-sky-700 dark:text-sky-400 font-bold',
    cta: 'text-sky-700 dark:text-sky-400 font-bold',
    divider: 'border-sky-100 dark:border-sky-900/60',
  },
  cyan: {
    card: 'rounded-[22px] border-2 border-teal-300 dark:border-teal-700/80 bg-gradient-to-b from-[#CCFBF1]/70 via-[#CCFBF1]/20 to-white dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-teal-400',
    glow: 'bg-teal-400/20 group-hover:bg-teal-400/30',
    iconBox: '!bg-teal-600 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-teal-600 !text-white shadow-xs rounded-full',
    tag: 'bg-[#CCFBF1] text-teal-900 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-[#CCFBF1] text-teal-900 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-teal-800 dark:text-teal-300',
    title: 'text-teal-800 dark:text-teal-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-teal-700 dark:text-teal-400 font-bold',
    subtext: 'text-teal-700 dark:text-teal-400 font-bold',
    cta: 'text-teal-700 dark:text-teal-400 font-bold',
    divider: 'border-teal-100 dark:border-teal-900/60',
  },
  indigo: {
    card: 'rounded-[22px] border-2 border-indigo-300 dark:border-indigo-700/80 bg-gradient-to-b from-[#E0E7FF]/70 via-[#E0E7FF]/20 to-white dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-indigo-400',
    glow: 'bg-indigo-400/20 group-hover:bg-indigo-400/30',
    iconBox: '!bg-indigo-600 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-indigo-600 !text-white shadow-xs rounded-full',
    tag: 'bg-[#E0E7FF] text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-[#E0E7FF] text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-indigo-800 dark:text-indigo-300',
    title: 'text-indigo-800 dark:text-indigo-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-indigo-700 dark:text-indigo-400 font-bold',
    subtext: 'text-indigo-700 dark:text-indigo-400 font-bold',
    cta: 'text-indigo-700 dark:text-indigo-400 font-bold',
    divider: 'border-indigo-100 dark:border-indigo-900/60',
  },
  rose: {
    card: 'rounded-[22px] border-2 border-rose-300 dark:border-rose-700/80 bg-gradient-to-b from-[#FFE4E6]/70 via-[#FFE4E6]/20 to-white dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-rose-400',
    glow: 'bg-rose-400/20 group-hover:bg-rose-400/30',
    iconBox: '!bg-rose-500 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-rose-500 !text-white shadow-xs rounded-full',
    tag: 'bg-[#FFE4E6] text-rose-900 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-[#FFE4E6] text-rose-900 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-rose-800 dark:text-rose-300',
    title: 'text-rose-800 dark:text-rose-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-rose-700 dark:text-rose-400 font-bold',
    subtext: 'text-rose-700 dark:text-rose-400 font-bold',
    cta: 'text-rose-700 dark:text-rose-400 font-bold',
    divider: 'border-rose-100 dark:border-rose-900/60',
  },
  amber: {
    card: 'rounded-[22px] border-2 border-amber-300 dark:border-amber-700/80 bg-gradient-to-b from-[#FEF3C7]/70 via-[#FEF3C7]/20 to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-amber-400',
    glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
    iconBox: '!bg-amber-500 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-amber-500 !text-white shadow-xs rounded-full',
    tag: 'bg-[#FEF3C7] text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-[#FEF3C7] text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-amber-800 dark:text-amber-300',
    title: 'text-amber-800 dark:text-amber-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-amber-700 dark:text-amber-400 font-bold',
    subtext: 'text-amber-700 dark:text-amber-400 font-bold',
    cta: 'text-amber-700 dark:text-amber-400 font-bold',
    divider: 'border-amber-100 dark:border-amber-900/60',
  },
  violet: {
    card: 'rounded-[22px] border-2 border-purple-300 dark:border-purple-700/80 bg-gradient-to-b from-[#F3E8FF]/70 via-[#F3E8FF]/20 to-white dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-purple-400',
    glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
    iconBox: '!bg-purple-600 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-purple-600 !text-white shadow-xs rounded-full',
    tag: 'bg-[#F3E8FF] text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-[#F3E8FF] text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-purple-800 dark:text-purple-300',
    title: 'text-purple-800 dark:text-purple-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-purple-700 dark:text-purple-400 font-bold',
    subtext: 'text-purple-700 dark:text-purple-400 font-bold',
    cta: 'text-purple-700 dark:text-purple-400 font-bold',
    divider: 'border-purple-100 dark:border-purple-900/60',
  },
  purple: {
    card: 'rounded-[22px] border-2 border-purple-300 dark:border-purple-700/80 bg-gradient-to-b from-[#F3E8FF]/70 via-[#F3E8FF]/20 to-white dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-purple-400',
    glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
    iconBox: '!bg-purple-600 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-purple-600 !text-white shadow-xs rounded-full',
    tag: 'bg-[#F3E8FF] text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-[#F3E8FF] text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-purple-800 dark:text-purple-300',
    title: 'text-purple-800 dark:text-purple-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-purple-700 dark:text-purple-400 font-bold',
    subtext: 'text-purple-700 dark:text-purple-400 font-bold',
    cta: 'text-purple-700 dark:text-purple-400 font-bold',
    divider: 'border-purple-100 dark:border-purple-900/60',
  },
  teal: {
    card: 'rounded-[22px] border-2 border-teal-300 dark:border-teal-700/80 bg-gradient-to-b from-[#CCFBF1]/70 via-[#CCFBF1]/20 to-white dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-teal-400',
    glow: 'bg-teal-400/20 group-hover:bg-teal-400/30',
    iconBox: '!bg-teal-600 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-teal-600 !text-white shadow-xs rounded-full',
    tag: 'bg-[#CCFBF1] text-teal-900 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-[#CCFBF1] text-teal-900 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-teal-800 dark:text-teal-300',
    title: 'text-teal-800 dark:text-teal-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-teal-700 dark:text-teal-400 font-bold',
    subtext: 'text-teal-700 dark:text-teal-400 font-bold',
    cta: 'text-teal-700 dark:text-teal-400 font-bold',
    divider: 'border-teal-100 dark:border-teal-900/60',
  },
  slate: {
    card: 'rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80/80 bg-gradient-to-b from-slate-100/70 via-slate-50/30 to-white dark:from-slate-900/60 dark:via-slate-900 dark:to-slate-950 hover:border-slate-400',
    glow: 'bg-slate-400/20 group-hover:bg-slate-400/30',
    iconBox: '!bg-slate-600 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-slate-600 !text-white shadow-xs rounded-full',
    tag: 'bg-emerald-50 text-slate-800 dark:bg-emerald-950/40 dark:text-slate-200 border border-emerald-200/80 dark:border-emerald-700/80/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-emerald-50 text-slate-800 dark:bg-emerald-950/40 dark:text-slate-200 border border-emerald-200/80 dark:border-emerald-700/80/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-slate-800 dark:text-slate-300',
    title: 'text-slate-800 dark:text-slate-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-slate-700 dark:text-slate-400 font-bold',
    subtext: 'text-slate-700 dark:text-slate-400 font-bold',
    cta: 'text-slate-700 dark:text-slate-400 font-bold',
    divider: 'border-emerald-100/80 dark:border-emerald-800/60',
  },
}

function KpiTintedCard({
  icon: Icon,
  label,
  title,
  subtext,
  subtitle,
  value,
  tag,
  badge,
  tone = 'emerald',
  variant,
  ctaText,
  onClick,
  active = false,
  isActive = false,
  isLoading = false,
  className = '',
  ...props
}) {
  return (
    <KpiStatCard
      icon={Icon}
      title={title || label}
      value={isLoading ? '...' : (typeof value === 'number' ? value.toLocaleString('id-ID') : (value ?? 0))}
      description={subtitle || subtext}
      badge={badge || tag}
      tone={variant || tone || 'emerald'}
      ctaText={ctaText || (onClick ? 'Lihat Rincian' : 'Statistik')}
      onClick={onClick}
      className={className}
      active={active || isActive}
      {...props}
    />
  )
}

function StatusBadge({ status }) {
 const normalized = String(status || '').toLowerCase()
 switch (normalized) {
 case 'hadir':
 return <Badge color="success" size="md">Hadir</Badge>
 case 'terlambat':
 return <Badge color="warning" size="md">Terlambat</Badge>
 case 'izin':
 return <Badge color="blue" size="md">Izin</Badge>
 case 'sakit':
 return <Badge color="purple" size="md">Sakit</Badge>
 case 'alpa':
 return <Badge color="error" size="md">Alpa</Badge>
 default:
 return <Badge color="gray" size="md">{status || 'Belum diverifikasi'}</Badge>
 }
}

export default function StudentAttendanceHistoryPage() {
 const now = new Date()
 const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
 const [filters, setFilters] = useState({
 date_from: first,
 date_to: now.toISOString().slice(0, 10),
 status: '',
 })
 const [records, setRecords] = useState([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState('')

 const load = useCallback(() => {
 setLoading(true)
 setError('')
 attendanceDashboardService
 .getStudentAttendance({ ...filters, per_page: 100 })
 .then((r) => setRecords(unwrap(r)))
 .catch((e) => setError(e.response?.data?.message || 'Riwayat belum dapat dimuat.'))
 .finally(() => setLoading(false))
 }, [filters])

 useEffect(load, [load])

 const filtered = useMemo(
 () =>
 records.filter((item) => {
 const d = String(item.tanggal || item.created_at || '').slice(0, 10)
 const s = String(item.status_hadir || item.status || '').toLowerCase()
 return (
 (!filters.date_from || d >= filters.date_from) &&
 (!filters.date_to || d <= filters.date_to) &&
 (!filters.status || s === filters.status)
 )
 }),
 [records, filters]
 )

 const counts = useMemo(
 () =>
 Object.fromEntries(
 ['hadir', 'terlambat', 'izin', 'sakit', 'alpa'].map((s) => [
 s,
 filtered.filter((i) => String(i.status_hadir || i.status).toLowerCase() === s).length,
 ])
 ),
 [filtered]
 )

 return (
 <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
 {/* BREADCRUMB NAV */}
 <AppBreadcrumb
 items={[
 { label: 'Absensi', href: '/absensi/rekap-kehadiran' },
 { label: 'Kehadiran Saya', href: '/absensi/kehadiran-saya' },
 { label: 'Riwayat Kehadiran' },
 ]}
 />

 {/* MODERN HERO CARD HEADER (MATCHING PORTAL ORANG TUA / SISWA STYLE) */}
 <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
 <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 !bg-[#D5F2E3] p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:!bg-[#112a22] print:hidden">

 <div className="relative z-10 flex flex-col gap-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
 
            <CalendarRange className="size-6 sm:size-7 text-white" />
 </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
 <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold bg-emerald-600 text-white shadow-xs border border-emerald-500/40 dark:border-emerald-600/50">
 
                  <Sparkles className="size-3 animate-pulse text-white" />
 Arsip Presensi Siswa
 </span>
 <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
 {filtered.length} Record Terpilih
 </span>
 </div>
 <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
 Riwayat & Historis Kehadiran
 </h1>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
 <Button
 type="button"
 variant="primary"
 appearance="fill"
 size="sm"
 onClick={load}
 disabled={loading}
 prefixIcon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
 className="!bg-white dark:bg-[#1B2433] !from-emerald-600 !to-teal-600 ! font-bold shadow-sm cursor-pointer"
 >
 Segarkan
 </Button>
          </div>
          </div>

          <div className="w-full pt-2 border-t border-emerald-500/20 dark:border-emerald-500/30">
            <p className="w-full text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
 Arsip lengkap riwayat presensi harian siswa berdasarkan rentang tanggal, status kehadiran (Hadir, Sakit, Izin, Alpa, Terlambat), dan mata pelajaran.
 </p>
          </div>
        </div>
      </div>
    </motion.div>

 {/* HeroUI Card KPI Metric Grid */}
 <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
 <KpiTintedCard
 icon={CalendarRange}
 label="Total Catatan"
 value={filtered.length}
 subtext="Sesuai Filter Aktif"
 tone="blue"
 />
 <KpiTintedCard
 icon={CheckCircle2}
 label="Hadir"
 value={counts.hadir}
 subtext="Kehadiran Tepat Waktu"
 tone="emerald"
 />
 <KpiTintedCard
 icon={Clock3}
 label="Terlambat"
 value={counts.terlambat}
 subtext="Tercatat Terlambat"
 tone="amber"
 />
 <KpiTintedCard
 icon={ShieldAlert}
 label="Tidak Hadir"
 value={counts.izin + counts.sakit + counts.alpa}
 subtext="Izin, Sakit, & Alpa"
 tone="rose"
 />
 </motion.div>

 {/* Filter Section */}
 <motion.section
 variants={itemVariants}
 className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]"
 aria-label="Filter riwayat kehadiran"
 >
 <div className="flex flex-wrap items-center gap-3">
 <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
 <Filter className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 <span>Filter Data:</span>
 </div>

 <div className="flex flex-wrap items-center gap-2.5">
 <div className="flex items-center gap-1.5">
 <label className="text-xs font-semibold text-slate-500" htmlFor="attendance-from">
 Dari:
 </label>
 <DatePicker
 id="attendance-from"
 value={filters.date_from}
 onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
 className="w-36"
 inputClassName="h-10 text-xs font-medium"
 />
 </div>

 <div className="flex items-center gap-1.5">
 <label className="text-xs font-semibold text-slate-500" htmlFor="attendance-to">
 Sampai:
 </label>
 <DatePicker
 id="attendance-to"
 value={filters.date_to}
 onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
 className="w-36"
 inputClassName="h-10 text-xs font-medium"
 />
 </div>

 <CustomSelect
 aria-label="Filter status kehadiran"
 value={filters.status}
 onChange={(e) => setFilters({ ...filters, status: e.target.value })}
 className="h-9 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 text-xs font-medium text-slate-900 outline-none transition focus:border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-white"
 >
 <option value="">Semua Status</option>
 {['hadir', 'terlambat', 'izin', 'sakit', 'alpa'].map((s) => (
 <option key={s} value={s}>
 {s[0].toUpperCase() + s.slice(1)}
 </option>
 ))}
 </CustomSelect>

 <Button
 variant="ghost"
 appearance="outline"
 size="sm"
 onClick={load}
 disabled={loading}
 className="gap-2"
 >
 <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
 <span>Muat Ulang</span>
 </Button>
 </div>
 </div>
 </motion.section>

 {/* Datatable / History List */}
 <motion.section
 variants={itemVariants}
 className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]"
 >
 <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50 border-b border-emerald-200/80 dark:border-emerald-800/80 px-5 py-4">
 <div>
 <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Daftar Riwayat Kehadiran</h2>
 <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
 Data presensi sesuai periode dan status yang dipilih.
 </p>
 </div>
 <Badge color="emerald" size="md">
 {filtered.length} Catatan
 </Badge>
 </div>

 {error ? (
 <div className="p-6">
 <MasterErrorState description={error} onRetry={load} />
 </div>
 ) : loading ? (
 <div className="space-y-3 p-5">
 {[1, 2, 3, 4].map((i) => (
 <div key={i} className="h-16 animate-pulse rounded-xl bg-emerald-50 dark:bg-emerald-950/40" />
 ))}
 </div>
 ) : filtered.length ? (
 <div className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40/80">
 {filtered.map((item) => {
 const subjectName =
 item.jadwal_pelajaran?.subject?.name || item.session?.subject?.name || 'Mata Pelajaran'
 const status = item.status_hadir || item.status
 const dateStr = formatDate(item.tanggal || item.created_at)

 return (
 <div
 key={item.id}
 className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 transition hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30"
 >
 <div className="flex items-center gap-3.5 min-w-0">
 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
 <BookOpen className="size-5" />
 </div>
 <div className="min-w-0">
 <b className="text-sm font-bold text-slate-900 dark:text-white truncate block">
 {subjectName}
 </b>
 <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
 {dateStr} · {item.arrival_time || item.jam_masuk || 'Presensi Kelas'}
 </p>
 </div>
 </div>

 <div className="shrink-0">
 <StatusBadge status={status} />
 </div>
 </div>
 )
 })}
 </div>
 ) : (
 <div className="p-6">
 <MasterEmptyState
 title="Riwayat Tidak Ditemukan"
 description="Ubah periode atau status filter untuk melihat data presensi lainnya."
 />
 </div>
 )}
 </motion.section>
 </motion.div>
 )
}

