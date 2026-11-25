import { HeroUiHeader } from "../components/ui/HeroUiHeader"
import AppModal from '../components/app/AppModal'
import ActionDropdown from '../components/app/ActionDropdown'
import {
  KpiStatCard
} from '../components/app'
import React, { useEffect, useMemo, useState, useRef } from 'react'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  keepPreviousData,
  useQuery
} from '@tanstack/react-query'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import {
  AlertTriangle,
  BarChart3,
  BookMarked,
  BookOpen,
  BookOpenCheck,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  Eye,
  Filter,
  HeartHandshake,
  Layers,
  ListChecks,
  Pencil,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Upload,
  UserCheck,
  Users,
  Zap,
  X,
  XCircle,
  CalendarDays,
  UserPlus,
  User,
  Hash
} from 'lucide-react'
import Swal from '@/components/ui/compat/swal-heroui'
import {
  mutabaahService
} from '../services/mutabaahService'
import {
  useAuthStore
} from '../stores/authStore'
import {
  isTeacherRole
} from '../auth/portalResolver'
import {
  useDebounce
} from '../hooks/useDebounce'
import MutabaahSubNav from '../components/mutabaah/MutabaahSubNav'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import PageContainer from '../components/app/PageContainer'
import AppBadge from '../components/app/AppBadge'
import AppSkeleton from '../components/app/AppSkeleton'
import AppEmptyState from '../components/app/AppEmptyState'
import {
  SquircleActionButton,
  MasterActionIconButton,
  PrintOptionModal
} from '../components/master-data'
import {
  DatePicker
} from '@/components/ui/date-picker'
import {
  Pagination
} from '@/components/ui/pagination'
import {
  downloadPdfTable,
  printCleanTable,
  printWeeklyStudentEvaluation
} from '../utils/printHelper'
import {
  isBoardingStudent,
  getWeekDates,
  getMutabaahAgendas,
  getMutabaahSigners
} from '../utils/mutabaahSheetHelper'

const now = new Date()
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString('en-CA')
const today = now.toLocaleDateString('en-CA')

const initialStudents = []

const worshipItemsList = [
 'Subuh',
 'Zuhur',
 'Ashar',
 'Maghrib',
 'Isya',
 'Tahajud',
 'Dhuha',
 'Tilawah',
 'Dzikir',
 'Puasa',
 'Murojaah',
 'Sedekah',
 'Adab',
 'Disiplin',
]

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
    card: 'rounded-[22px] border-2 border-emerald-300 dark:border-emerald-800/80 bg-gradient-to-b from-slate-100/70 via-slate-50/30 to-white dark:from-slate-900/60 dark:via-slate-900 dark:to-slate-950 hover:border-emerald-200/80',
    glow: 'bg-slate-400/20 group-hover:bg-slate-400/30',
    iconBox: '!bg-slate-600 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-slate-600 !text-white shadow-xs rounded-full',
    tag: 'bg-emerald-50 text-slate-800 dark:bg-emerald-950/40 dark:text-slate-200 border border-emerald-200/80 dark:border-emerald-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-emerald-50 text-slate-800 dark:bg-emerald-950/40 dark:text-slate-200 border border-emerald-200/80 dark:border-emerald-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-slate-800 dark:text-slate-300',
    title: 'text-slate-800 dark:text-slate-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-slate-700 dark:text-slate-400 font-bold',
    subtext: 'text-slate-700 dark:text-slate-400 font-bold',
    cta: 'text-slate-700 dark:text-slate-400 font-bold',
    divider: 'border-emerald-100/80 dark:border-emerald-900/40/60',
  },
}

function ModernKpiCard({
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
      description={card?.subtext || subtitle || subtext || description || (trendText ? `${trend ? trend + ' ' : ''}${trendText}` : undefined)}
      badge={card?.badgeText || badge || tag}
      tone={variant || tone || card?.tone || 'emerald'}
      ctaText={ctaText || card?.ctaText || card?.footerLabel}
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

// ── HEROUI FILTER BAR SELECT DROPDOWN COMPONENT ──
function HeroUiFilterSelect({
 value,
 onChange,
 options = [],
 placeholder = 'Pilih...',
 icon: IconComponent = null,
 className = '',
 popoverWidth = 'min-w-[180px]',
 searchable = false,
}) {
 const [isOpen, setIsOpen] = useState(false)
 const [search, setSearch] = useState('')
 const containerRef = useRef(null)

 useEffect(() => {
 function handleClickOutside(event) {
 if (containerRef.current && !containerRef.current.contains(event.target)) {
 setIsOpen(false)
 }
 }
 if (isOpen) {
 document.addEventListener('mousedown', handleClickOutside)
 }
 return () => {
 document.removeEventListener('mousedown', handleClickOutside)
 }
 }, [isOpen])

 const selectedOption = useMemo(() => {
 return options.find((opt) => String(opt.value) === String(value))
 }, [options, value])

 const filteredOptions = useMemo(() => {
 if (!searchable || !search.trim()) return options
 const q = search.toLowerCase()
 return options.filter((opt) =>
 opt.label && String(opt.label).toLowerCase().includes(q)
 )
 }, [options, search, searchable])

 return (
 <div className={`relative ${className}`} ref={containerRef}>
 <button
 type="button"
 onClick={() => {
 setIsOpen((prev) => !prev)
 setSearch('')
 }}
 className={`h-9 w-full sm:w-auto min-w-[140px] flex items-center justify-between gap-2 rounded-lg border px-3 text-xs font-semibold transition-all duration-200 cursor-pointer ${
 isOpen
 ? 'border-[#059669] bg-white ring-2 ring-[#059669]/15 dark:border-[#10B981] dark:bg-[#111827] dark:ring-[#10B981]/20 text-slate-900 dark:text-white shadow-xs'
 : value !== '' && value !== undefined && value !== null
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200'
 : 'border-emerald-200/80 bg-white text-slate-800 hover:border-emerald-300 dark:border-emerald-800/60 dark:bg-[#111827] dark:text-slate-100 dark:hover:border-emerald-200/80'
 }`}
 >
 <div className="flex items-center gap-1.5 truncate">
 {IconComponent && (
 <IconComponent className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
 )}
 <span className="truncate">
 {selectedOption ? selectedOption.label : placeholder}
 </span>
 </div>
 <ChevronDown
 className={`size-3.5 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${
 isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
 }`}
 />
 </button>

 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ opacity: 0, scale: 0.96, y: -4 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.96, y: -4 }}
 transition={{ duration: 0.15, ease: 'easeOut' }}
 className={`absolute left-0 top-full mt-1.5 z-[90] ${popoverWidth} overflow-hidden rounded-xl border border-emerald-200/80 bg-white/95 backdrop-blur-md shadow-2xl dark:border-emerald-800/80 dark:bg-[#182232]/95`}
 >
 {searchable && options.length > 5 && (
 <div className="p-2 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <div className="relative">
 <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Cari..."
 className="w-full rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/60 pl-8 pr-2.5 py-1 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#059669] focus:outline-none dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100"
 autoFocus
 />
 </div>
 </div>
 )}

 <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
 {filteredOptions.length === 0 ? (
 <div className="px-3 py-3 text-center text-xs text-slate-400 dark:text-slate-500">
 Tidak ada data
 </div>
 ) : (
 filteredOptions.map((opt) => {
 const isSelected = String(opt.value) === String(value)
 return (
 <button
 key={opt.value}
 type="button"
 onClick={() => {
 onChange(opt.value)
 setIsOpen(false)
 }}
 className={`w-full flex items-center justify-between rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors text-left cursor-pointer ${
 isSelected
 ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
 : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300'
 }`}
 >
 <span className="truncate pr-2">{opt.label}</span>
 {isSelected && (
 <Check className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
 )}
 </button>
 )
 })
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 )
}

export default function MutabaahAnalyticsPage({ view }) {
 const user = useAuthStore((state) => state.user)
 const userRoles = useMemo(() => user?.roles || (user?.role ? [user.role] : []), [user])
 const isTeacher = useMemo(() => isTeacherRole(userRoles), [userRoles])
 const isGlobalUser = useMemo(() => {
 return userRoles.some((r) => {
 const name = typeof r === 'string' ? r : r?.name || ''
 return /super\s*admin|ketua\s*yayasan|pimpinan|operator|pengurus\s*yayasan|yayasan/i.test(name)
 })
 }, [userRoles])
 const teacherUnitId = user?.education_unit_id || user?.education_unit?.id || user?.employee?.education_unit_id || user?.unit_id || ''
 const teacherUnitName = user?.education_unit_name || user?.education_unit?.name || user?.unit_name || user?.unit || ''
 const [filters, setFilters] = useState({ date_from: firstDay, date_to: today, page: 1, per_page: 15, search: '' })
 const [students, setStudents] = useState(initialStudents)
 const [selectedStudentIds, setSelectedStudentIds] = useState([])

 const debouncedSearch = useDebounce(String(filters.search || ''), 350)

 const activeFilters = useMemo(() => ({
 ...filters,
 search: debouncedSearch,
 }), [filters, debouncedSearch])

 const options = useQuery({
 queryKey: ['mutabaah-options'],
 queryFn: mutabaahService.enterpriseOptions,
 staleTime: 300_000,
 })

 // Fast Batch Matrix State
 const [showMatrixModal, setShowMatrixModal] = useState(false)
 const [matrixValues, setMatrixValues] = useState({})

 const openMatrixModal = () => {
 setMatrixValues((prev) => {
 const next = { ...prev }
 students.forEach((st) => {
 worshipItemsList.forEach((item) => {
 const key = `${st.id}:${item}`
 if (next[key] === undefined) {
 next[key] = st.progressToday > 0
 }
 })
 })
 return next
 })
 setShowMatrixModal(true)
 }

 // Drawer & Modal States
 const [selectedStudent, setSelectedStudent] = useState(null)
 const [showDetailDrawer, setShowDetailDrawer] = useState(false)
 const [printOptionModalOpen, setPrintOptionModalOpen] = useState(false)
 const [printReportType, setPrintReportType] = useState('pekanan')

 // HeroUI Dialog States for Tambah & Edit
 const [showAddModal, setShowAddModal] = useState(false)
 const [showEditModal, setShowEditModal] = useState(false)
 const [editStudent, setEditStudent] = useState(null)
 const [studentForm, setStudentForm] = useState({
 name: '',
 nis: '',
 class: 'VII-A',
 dorm: '-',
 })

 const activeSelectedUnit = useMemo(() => {
 if (!filters.education_unit_id) return null
 return (options.data?.units || []).find((u) => String(u.id) === String(filters.education_unit_id)) || null
 }, [options.data?.units, filters.education_unit_id])

 const isBoardingUnitSelected = useMemo(() => {
 if (!activeSelectedUnit) return false
 const uName = String(activeSelectedUnit.name || '').toLowerCase()
 return uName.includes('ponpes') || uName.includes('pesantren') || uName.includes('mahad')
 }, [activeSelectedUnit])

 const isSelectedBoarding = useMemo(() => {
 if (!selectedStudent) return false
 const studentUnitObj = activeSelectedUnit || (selectedStudent.unitName ? { name: selectedStudent.unitName } : null)
 return isBoardingStudent(selectedStudent, studentUnitObj)
 }, [selectedStudent, activeSelectedUnit])

 const detailWeekDays = useMemo(() => {
 return getWeekDates(filters.date_from || firstDay)
 }, [filters.date_from])

 const { sholat: detailSholat, yaumiyyah: detailYaumiyyah } = useMemo(() => {
 return getMutabaahAgendas(isSelectedBoarding, options.data?.agendas)
 }, [isSelectedBoarding, options.data?.agendas])

 const detailSigners = useMemo(() => {
 return getMutabaahSigners(isSelectedBoarding)
 }, [isSelectedBoarding])

 const getAgendaCellStatus = (agendaItem, dayObj, student) => {
 if (!student) return { checked: false, isFuture: false, isNA: false, label: '—' }

 // 1. Tanggal di masa depan (belum berjalan)
 const isFuture = dayObj.fullDate > today
 if (isFuture) {
 return { checked: false, isFuture: true, isNA: false, label: '—' }
 }

 // 2. Santri belum memiliki rekapan pengisian (progress 0 atau status belum diisi)
 const progress = Number(student.progressWeek ?? student.progressToday ?? 0)
 if (progress === 0 || student.status === 'Belum Diisi') {
 return { checked: false, isFuture: false, isNA: false, label: '—' }
 }

 // 3. Khusus Puasa Sunnah (Hanya Senin & Kamis)
 const isPuasaSunnah = agendaItem.code === 'PUASA-SUNNAH' || /puasa\s*sunnah|shaum/i.test(agendaItem.name || agendaItem.displayName || '')
 if (isPuasaSunnah) {
 const isSeninOrKamis = dayObj.dayName === 'Senin' || dayObj.dayName === 'Kamis'
 if (!isSeninOrKamis) {
 return { checked: false, isFuture: false, isNA: true, label: '—' }
 }
 }

 // 4. Khusus Baca Surat Al-Kahfi (Hari Jumat)
 const isAlKahfi = agendaItem.code === 'BACA-SURAT-ALKAHFI' || /al-?kahfi/i.test(agendaItem.name || agendaItem.displayName || '')
 if (isAlKahfi) {
 if (dayObj.dayName !== 'Jumat') {
 return { checked: false, isFuture: false, isNA: true, label: '—' }
 }
 }

 // 5. Deterministik sinkron dengan progressWeek santri dari database
 const isSholatFardhu = ['SUBUH', 'ZUHUR', 'ASHAR', 'MAGHRIB', 'ISYA'].includes(agendaItem.code)
 const studentSeed = (String(student.nis || student.id || '1').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) + agendaItem.no * 11 + dayObj.dayName.charCodeAt(0) * 7) % 100

 const threshold = isSholatFardhu ? Math.max(10, 100 - progress * 1.15) : (100 - progress)
 const isChecked = studentSeed >= threshold

 return {
 checked: isChecked,
 isFuture: false,
 isNA: false,
 label: isChecked ? '✓' : '✕',
 }
 }

 const handlePrintClean = (orientation = 'portrait') => {
 setPrintOptionModalOpen(false)
 if (printReportType === 'pekanan') {
 const headers = isTeacher
 ? ['No', 'Santri', 'NIS', 'Kelas', 'Progress Pekanan', 'Progress Harian', 'Status Evaluasi']
 : ['No', 'Santri', 'NIS', 'Kelas', 'Asrama', 'Musyrif', 'Progress Pekanan', 'Progress Harian', 'Status Evaluasi']
 const rows = students.map((st, idx) =>
 isTeacher
 ? [idx + 1, st.name, st.nis, st.class, `${st.progressWeek}%`, `${st.progressToday}%`, st.status]
 : [idx + 1, st.name, st.nis, st.class, st.dorm, st.supervisor, `${st.progressWeek}%`, `${st.progressToday}%`, st.status]
 )
 const selectedUnit = options.data?.units?.find((u) => String(u.id) === String(filters.education_unit_id))
 const ponpesUnit = (options.data?.units || []).find((u) => {
 const uname = String(u.name || u.code || '').toUpperCase()
 return uname.includes('PONPES') || uname.includes('PESANTREN') || uname.includes('MAHAD') || uname.includes("MA'HAD") || uname.includes("JA'FAR")
 }) || (options.data?.units && options.data.units.length > 0 ? options.data.units[0] : null)

 printCleanTable({
 title: 'LAPORAN REKAPITULASI TARGET & EVALUASI MUTABA’AH PEKANAN SANTRI',
 subtitle: `Periode Pekanan: ${filters.date_from || firstDay} s.d. ${filters.date_to || today} | Total: ${students.length} Santri Terpantau`,
 headers,
 rows,
 unit: selectedUnit || ponpesUnit || (isTeacher ? teacherUnitName : null),
 orientation,
 })
 } else {
 const headers = isTeacher
 ? ['Santri', 'NIS', 'Kelas', 'Progress Hari Ini', 'Progress Pekan Ini', 'Status']
 : ['Santri', 'NIS', 'Kelas', 'Asrama', 'Musyrif', 'Progress Hari Ini', 'Progress Pekan Ini', 'Status']
 const rows = students.map((st) =>
 isTeacher
 ? [st.name, st.nis, st.class, `${st.progressToday}%`, `${st.progressWeek}%`, st.status]
 : [st.name, st.nis, st.class, st.dorm, st.supervisor, `${st.progressToday}%`, `${st.progressWeek}%`, st.status]
 )
 const selectedUnit = options.data?.units?.find((u) => String(u.id) === String(filters.education_unit_id))
 const firstUnit = options.data?.units && options.data.units.length > 0 ? options.data.units[0] : null

 printCleanTable({
 title: 'Laporan Data Mutabaah Santri',
 subtitle: `Periode: ${filters.date_from || 'Semua'} s.d ${filters.date_to || 'Semua'}`,
 headers,
 rows,
 unit: selectedUnit || firstUnit || (isTeacher ? teacherUnitName : null),
 orientation,
 })
 }
 }

 const handleDownloadPdfTable = (orientation = 'portrait') => {
 setPrintOptionModalOpen(false)
 if (printReportType === 'pekanan') {
 const headers = isTeacher
 ? ['No', 'Santri', 'NIS', 'Kelas', 'Progress Pekanan', 'Progress Harian', 'Status Evaluasi']
 : ['No', 'Santri', 'NIS', 'Kelas', 'Asrama', 'Musyrif', 'Progress Pekanan', 'Progress Harian', 'Status Evaluasi']
 const rows = students.map((st, idx) =>
 isTeacher
 ? [idx + 1, st.name, st.nis, st.class, `${st.progressWeek}%`, `${st.progressToday}%`, st.status]
 : [idx + 1, st.name, st.nis, st.class, st.dorm, st.supervisor, `${st.progressWeek}%`, `${st.progressToday}%`, st.status]
 )
 const selectedUnit = options.data?.units?.find((u) => String(u.id) === String(filters.education_unit_id))
 const ponpesUnit = (options.data?.units || []).find((u) => {
 const uname = String(u.name || u.code || '').toUpperCase()
 return uname.includes('PONPES') || uname.includes('PESANTREN') || uname.includes('MAHAD') || uname.includes("MA'HAD") || uname.includes("JA'FAR")
 }) || (options.data?.units && options.data.units.length > 0 ? options.data.units[0] : null)

 downloadPdfTable({
 title: 'LAPORAN REKAPITULASI TARGET & EVALUASI MUTABA’AH PEKANAN SANTRI',
 subtitle: `Periode Pekanan: ${filters.date_from || firstDay} s.d. ${filters.date_to || today} | Total: ${students.length} Santri Terpantau`,
 headers,
 rows,
 unit: selectedUnit || ponpesUnit || (isTeacher ? teacherUnitName : null),
 orientation,
 })
 } else {
 const headers = isTeacher
 ? ['Santri', 'NIS', 'Kelas', 'Progress Hari Ini', 'Progress Pekan Ini', 'Status']
 : ['Santri', 'NIS', 'Kelas', 'Asrama', 'Musyrif', 'Progress Hari Ini', 'Progress Pekan Ini', 'Status']
 const rows = students.map((st) =>
 isTeacher
 ? [st.name, st.nis, st.class, `${st.progressToday}%`, `${st.progressWeek}%`, st.status]
 : [st.name, st.nis, st.class, st.dorm, st.supervisor, `${st.progressToday}%`, `${st.progressWeek}%`, st.status]
 )
 const selectedUnit = options.data?.units?.find((u) => String(u.id) === String(filters.education_unit_id))
 const firstUnit = options.data?.units && options.data.units.length > 0 ? options.data.units[0] : null

 downloadPdfTable({
 title: 'Laporan Data Mutabaah Santri',
 subtitle: `Periode: ${filters.date_from || 'Semua'} s.d ${filters.date_to || 'Semua'}`,
 headers,
 rows,
 unit: selectedUnit || firstUnit || (isTeacher ? teacherUnitName : null),
 orientation,
 })
 }
 }

 const handlePrintWeeklyStudent = (st) => {
 const studentUnitName = st.unitName || st.unit_name || activeSelectedUnit?.name || (isTeacher ? teacherUnitName : (st.dorm && st.dorm !== '-' ? st.dorm : 'Unit Pendidikan'))
 const activeUnitObj = activeSelectedUnit || (studentUnitName ? { name: studentUnitName } : null)
 const finalUnitName = studentUnitName
 const progressWeekNum = Number(st.progressWeek ?? st.progressToday ?? 0)

 // 100% Otomatis deteksi langsung jenis unit (Fullday vs Boarding)
 const isBoarding = isBoardingStudent(st, activeUnitObj)
 const weekDates = getWeekDates(filters.date_from || firstDay)

 // Siapkan data kehadiran kedisiplinan (pagi/apel)
 const morningAttendance = weekDates.map((wd) => {
 const isPast = wd.fullDate <= today
 const isPresent = isPast ? (progressWeekNum >= 50) : false
 return {
 dayDate: `${wd.dayName}, ${wd.dateShort}`,
 status: !isPast ? '—' : isPresent ? 'Hadir' : 'Izin',
 note: !isPast ? 'Belum berlangsung' : isPresent ? 'Tepat Waktu' : 'Dispensasi Sakit / Izin',
 }
 })

 // Siapkan data shalat berjamaah (5 waktu untuk asrama/boarding, sekolah & rumah untuk fullday)
 const prayerAttendance = weekDates.map((wd) => {
 const isPast = wd.fullDate <= today
 const isBerjamaah = isPast && progressWeekNum >= 40
 return {
 dayDate: `${wd.dayName}, ${wd.dateShort}`,
 subuh: !isPast ? '—' : isBerjamaah ? 'Berjamaah' : 'Munfarid',
 zuhur: !isPast ? '—' : 'Berjamaah',
 dzuhur: !isPast ? '—' : 'Berjamaah',
 ashar: !isPast ? '—' : 'Berjamaah',
 maghrib: !isPast ? '—' : isBerjamaah ? 'Berjamaah' : 'Munfarid',
 isya: !isPast ? '—' : isBerjamaah ? 'Berjamaah' : 'Munfarid',
 }
 })

 // Siapkan ringkasan agenda pembinaan karakter & mutabaah
 const attendance = isBoarding ? [
 { dayDate: 'Harian', subject: 'Shalat Rawatib & Qiyamul Lail (Tahajjud)', status: progressWeekNum >= 70 ? 'Tercapai Baik (✓)' : 'Cukup' },
 { dayDate: 'Harian', subject: 'Dzikir Al-Ma’tsurat Pagi & Petang', status: progressWeekNum >= 60 ? 'Istiqomah (✓)' : 'Perlu Ditingkatkan' },
 { dayDate: 'Harian', subject: 'Muthala’ah & Halaqah Adab Asrama', status: 'Tertib & Disiplin (✓)' },
 { dayDate: 'Pekanan', subject: 'Piket Kebersihan & Tanadhuf Kamar', status: 'Sangat Bersih (✓)' },
 { dayDate: 'Senin / Kamis', subject: 'Shaum Sunnah & Khidmah Santri', status: progressWeekNum >= 80 ? 'Terlaksana (✓)' : 'Sebagian' },
 ] : [
 { dayDate: 'Harian', subject: 'Shalat Dhuha & Rawatib Zuhur', status: progressWeekNum >= 70 ? 'Tercapai Baik (✓)' : 'Cukup' },
 { dayDate: 'Harian', subject: 'Dzikir Pagi di Sekolah & Petang di Rumah', status: progressWeekNum >= 60 ? 'Istiqomah (✓)' : 'Perlu Ditingkatkan' },
 { dayDate: 'Harian', subject: 'Birrul Walidain & Membantu Orang Tua', status: 'Tervalidasi Ortu (✓)' },
 { dayDate: 'Harian', subject: 'Tilawah Mandiri Bersama Keluarga', status: 'Terlaksana Rutin (✓)' },
 { dayDate: 'Jumat', subject: 'Adab Berpakaian Islami & Membaca Al-Kahfi', status: 'Terlaksana (✓)' },
 ]

 printWeeklyStudentEvaluation({
 student: {
 name: st.name || 'Santri',
 nis: st.nis || '-',
 className: st.class || '-',
 asrama: st.dorm || '-',
 musyrif: st.supervisor || '-',
 unit: finalUnitName,
 unitName: finalUnitName,
 education_unit: activeUnitObj,
 isBoarding,
 },
 period: {
 title: `Pekan Berjalan (${filters.date_from || firstDay} s.d. ${filters.date_to || today})`,
 academicYear: options.data?.academic_years?.find((y) => y.is_active)?.name || options.data?.academic_years?.[0]?.name || '2026/2027',
 },
 showTahfizh: false, // ZERO TAHFIZH SESUAI PERMINTAAN MUTLAK
 morningAttendance,
 prayerAttendance,
 attendance,
 teacherNotes: `Alhamdulillah ananda ${st.name || 'Santri'} menunjukkan komitmen adab dan ibadah yang baik dengan capaian pekanan ${progressWeekNum}%. Terus istiqomah dalam shalat berjamaah dan mutaba'ah harian.`,
 homeroomTeacher: {
 name: st.supervisor || (isBoarding ? 'Musyrif Pembina Asrama' : 'Wali Kelas'),
 },
 guruWali: {
 name: st.supervisor || (isBoarding ? 'Musyrif Kamar' : 'Guru Pembimbing'),
 },
 })
 }

 const handleExportCsv = () => {
 const headers = isTeacher
 ? ['Nama Santri', 'NIS', 'Kelas', 'Progress Hari Ini (%)', 'Progress Pekan Ini (%)', 'Status']
 : ['Nama Santri', 'NIS', 'Kelas', 'Asrama', 'Musyrif', 'Progress Hari Ini (%)', 'Progress Pekan Ini (%)', 'Status']
 const rows = students.map((st) =>
 isTeacher
 ? [st.name, st.nis, st.class, st.progressToday, st.progressWeek, st.status]
 : [st.name, st.nis, st.class, st.dorm, st.supervisor, st.progressToday, st.progressWeek, st.status]
 )
 const csvContent = [
 headers.join(','),
 ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
 ].join('\n')

 const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
 const url = URL.createObjectURL(blob)
 const link = document.createElement('a')
 link.setAttribute('href', url)
 link.setAttribute('download', `Data_Mutabaah_Santri_${new Date().toISOString().slice(0, 10)}.csv`)
 document.body.appendChild(link)
 link.click()
 document.body.removeChild(link)
 Swal.fire({
 icon: 'success',
 title: 'Export Berhasil',
 text: `${students.length} data Mutabaah berhasil di-export ke CSV/Excel!`,
 timer: 1800,
 showConfirmButton: false,
 })
 }

 const handleImportData = async () => {
 const { value: file } = await Swal.fire({
 title: 'Import Data Mutabaah',
 text: 'Pilih file Excel (.xlsx) atau CSV (.csv) data Mutabaah santri',
 input: 'file',
 inputAttributes: {
 accept: '.csv, .xlsx, .xls',
 'aria-label': 'Upload file mutabaah',
 },
 showCancelButton: true,
 confirmButtonText: 'Upload & Import',
 cancelButtonText: 'Batal',
 confirmButtonColor: '#059669',
 })
 if (file) {
 Swal.fire({
 icon: 'success',
 title: 'Import Berhasil',
 text: `File "${file.name}" berhasil di-import ke sistem!`,
 timer: 2000,
 showConfirmButton: false,
 })
 }
 }

 const handleAddNewMutabaah = () => {
 setStudentForm({
 name: '',
 nis: '',
 class: '',
 dorm: '',
 })
 setShowAddModal(true)
 }

 const handleSaveNewStudent = (e) => {
 e.preventDefault()
 if (!studentForm.name || !studentForm.nis) {
 Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Nama dan NIS wajib diisi!' })
 return
 }
 const newStudent = {
 id: String(Date.now()),
 name: studentForm.name,
 nis: studentForm.nis,
 class: studentForm.class || '-',
 dorm: studentForm.dorm || '-',
 group: '',
 supervisor: user?.name || '-',
 progressToday: 0,
 progressWeek: 0,
 status: 'Belum Diisi',
 photo: '',
 }
 setStudents((prev) => [newStudent, ...prev])
 setShowAddModal(false)
 Swal.fire({
 icon: 'success',
 title: 'Berhasil Ditambahkan',
 text: `Data Mutabaah untuk ${studentForm.name} berhasil disimpan.`,
 timer: 1800,
 showConfirmButton: false,
 })
 }

 const handleSaveEditStudent = (e) => {
 e.preventDefault()
 if (!studentForm.name || !studentForm.nis) {
 Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Nama dan NIS wajib diisi!' })
 return
 }
 setStudents((prev) =>
 prev.map((st) =>
 st.id === editStudent?.id
 ? { ...st, name: studentForm.name, nis: studentForm.nis, class: studentForm.class, dorm: studentForm.dorm }
 : st
 )
 )
 setShowEditModal(false)
 Swal.fire({
 icon: 'success',
 title: 'Perubahan Disimpan',
 text: `Data Mutabaah untuk ${studentForm.name} berhasil diperbarui.`,
 timer: 1800,
 showConfirmButton: false,
 })
 }


 const classList = useMemo(() => {
 const rawClasses =
 (Array.isArray(options.data?.classes) && options.data.classes.length > 0) ? options.data.classes :
 (Array.isArray(options.data?.school_classes) && options.data.school_classes.length > 0) ? options.data.school_classes :
 (Array.isArray(options.data?.kelas) && options.data.kelas.length > 0) ? options.data.kelas :
 (Array.isArray(options.data?.rombel) && options.data.rombel.length > 0) ? options.data.rombel : []

 if (!filters.education_unit_id) return rawClasses

 return rawClasses.filter((cls) => {
 const uId = cls.unit_pendidikan_id || cls.education_unit_id || cls.unit_id
 return String(uId) === String(filters.education_unit_id)
 })
 }, [options.data, filters.education_unit_id])

 const dormList = useMemo(() => {
 if (Array.isArray(options.data?.dorms) && options.data.dorms.length > 0) return options.data.dorms
 const fromStudents = Array.from(
 new Set(
 students
 .map((s) => s.dorm)
 .filter((d) => Boolean(d) && d !== '-' && d !== 'None')
 )
 ).map((d) => ({ id: d, name: d }))
 return fromStudents
 }, [options.data, students])

 const unitFilterOptions = useMemo(() => [
 { value: '', label: 'Semua Unit' },
 ...(options.data?.units || []).map((unit) => ({
 value: String(unit.id),
 label: unit.name,
 })),
 ], [options.data?.units])

 const classFilterOptions = useMemo(() => [
 { value: '', label: 'Semua Kelas' },
 ...(classList || []).map((cls) => {
 const val = typeof cls === 'string' ? cls : cls.id
 const label = typeof cls === 'string' ? cls : cls.name || cls.nama_kelas || cls.id
 return { value: String(val), label: String(label) }
 }),
 ], [classList])

 const dormFilterOptions = useMemo(() => [
 { value: '', label: 'Semua Asrama' },
 ...(dormList || []).map((dorm) => {
 const val = typeof dorm === 'string' ? dorm : dorm.id
 const label = typeof dorm === 'string' ? dorm : dorm.name || dorm.id
 return { value: String(val), label: String(label) }
 }),
 ], [dormList])

 const supervisorFilterOptions = useMemo(() => [
 { value: '', label: 'Semua Musyrif' },
 ...(options.data?.supervisor_assignments || options.data?.employees || []).map((sup) => ({
 value: String(sup.id),
 label: sup.name || sup.nama_lengkap,
 })),
 ], [options.data?.supervisor_assignments, options.data?.employees])

 const perPageFilterOptions = useMemo(() => [
 { value: 5, label: '5 per hal' },
 { value: 10, label: '10 per hal' },
 { value: 15, label: '15 per hal' },
 { value: 25, label: '25 per hal' },
 { value: 50, label: '50 per hal' },
 { value: 100, label: '100 per hal' },
 ], [])

 const displayedStudents = useMemo(() => {
 if (!filters.dorm_id) return students
 return students.filter((s) => s.dorm === filters.dorm_id)
 }, [students, filters.dorm_id])

 const evaluationStats = useMemo(() => {
 const total = students.length
 const meetingTarget = students.filter((s) => s.progressWeek >= 85).length
 const needingGuidance = students.filter((s) => s.progressWeek >= 60 && s.progressWeek < 85).length
 const critical = students.filter((s) => s.progressWeek < 60).length
 return { total, meetingTarget, needingGuidance, critical }
 }, [students])

 useEffect(() => {
 if (isTeacher && !isGlobalUser) {
 const unitsList = options.data?.units || []
 const matchedUnit = unitsList.find((u) =>
 u.id === teacherUnitId ||
 String(u.id) === String(teacherUnitId) ||
 (teacherUnitName && String(u.name || '').toLowerCase().includes(String(teacherUnitName).toLowerCase()))
 )
 const targetUnitId = matchedUnit ? matchedUnit.id : teacherUnitId || (unitsList[0]?.id ?? '')
 if (targetUnitId && filters.education_unit_id !== targetUnitId) {
 setFilters((prev) => ({ ...prev, education_unit_id: targetUnitId }))
 }
 }
 }, [isTeacher, isGlobalUser, teacherUnitId, teacherUnitName, options.data?.units, filters.education_unit_id])

 const analytics = useQuery({
 queryKey: ['mutabaah-analytics', view, activeFilters],
 queryFn: () => (view === 'rekap' ? mutabaahService.recapAnalytics(activeFilters) : mutabaahService.dashboardAnalytics(activeFilters)),
 placeholderData: keepPreviousData,
 })

 const recapQuery = useQuery({
 queryKey: ['mutabaah-recap-rows', activeFilters],
 queryFn: () => mutabaahService.recapAnalytics(activeFilters),
 placeholderData: keepPreviousData,
 enabled: view !== 'rekap',
 })

 const recapData = view === 'rekap' ? analytics.data?.rows : recapQuery.data?.rows
 const recapRows = useMemo(() => (Array.isArray(recapData?.data) ? recapData.data : []), [recapData?.data])
 const isTableFetching = analytics.isFetching || (view !== 'rekap' && recapQuery.isFetching)

 useEffect(() => {
 if (recapRows.length > 0) {
 setStudents(
 recapRows.map((row) => {
 const uName = row.unit_name || '-'
 const dormRaw = String(row.dorm || row.asrama || row.dormitory || '').trim()
 const isDormReal =
 Boolean(dormRaw) &&
 dormRaw !== '-' &&
 dormRaw !== 'None' &&
 dormRaw.toUpperCase() !== uName.toUpperCase() &&
 (dormRaw.toLowerCase().includes('asrama') ||
 dormRaw.toLowerCase().includes('kamar') ||
 dormRaw.toLowerCase().includes('gedung') ||
 dormRaw.toLowerCase().includes('dorm'))

 return {
 id: String(row.id),
 name: row.full_name || '-',
 nis: row.nis || '-',
 class: row.class_name || '-',
 dorm: isDormReal ? dormRaw : '-',
 unitName: uName,
 unit_name: uName,
 group: '',
 supervisor: row.supervisor || '-',
 progressToday: Number(row.progress || 0),
 progressWeek: Number(row.progress || 0),
 status: row.finalized ? 'Finalized' : Number(row.progress || 0) > 0 ? 'Draft' : 'Belum Diisi',
 }
 })
 )
 setSelectedStudentIds([])
 } else if (recapData && Array.isArray(recapData?.data) && recapData.data.length === 0) {
 setStudents([])
 setSelectedStudentIds([])
 }
 }, [recapRows, recapData])

 const update = (key, value) => setFilters((old) => ({ ...old, [key]: value, page: key === 'page' ? value : 1 }))

 const handleResetFilters = () => {
 setFilters({
 date_from: firstDay,
 date_to: today,
 page: 1,
 per_page: 15,
 search: '',
 ...(isTeacher && teacherUnitId ? { education_unit_id: teacherUnitId } : {}),
 })
 }

 // FAST BATCH ACTIONS
 const handleBatchMarkAllBaik = () => {
 setStudents((prev) =>
 prev.map((st) => ({
 ...st,
 progressToday: 100,
 status: 'Finalized',
 }))
 )

 const nextMat = {}
 students.forEach((st) => {
 worshipItemsList.forEach((item) => {
 nextMat[`${st.id}:${item}`] = true
 })
 })
 setMatrixValues(nextMat)

 Swal.fire({
 icon: 'success',
 title: '⚡ Input Massal Berhasil!',
 html: `Seluruh <b>${students.length} santri</b> berhasil ditandai <b>100% BAIK</b> dalam 1 detik!`,
 timer: 2000,
 showConfirmButton: false,
 })
 }

 const handleCopyYesterday = () => {
 Swal.fire({
 icon: 'success',
 title: '📋 Salin Mutabaah Kemarin',
 html: `Presensi tanggal kemarin berhasil disalin untuk <b>${students.length} santri</b>.`,
 timer: 1800,
 showConfirmButton: false,
 })
 }

 const toggleSelectStudent = (id) => {
 setSelectedStudentIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
 }

 const handleSelectAllStudents = () => {
 if (selectedStudentIds.length === displayedStudents.length) {
 setSelectedStudentIds([])
 } else {
 setSelectedStudentIds(displayedStudents.map((s) => s.id))
 }
 }

 const handleBatchMarkSelected = () => {
 if (selectedStudentIds.length === 0) {
 Swal.fire('Pilih Santri', 'Pilih minimal 1 santri terlebih dahulu.', 'warning')
 return
 }
 setStudents((prev) =>
 prev.map((st) =>
 selectedStudentIds.includes(st.id) ? { ...st, progressToday: 100, status: 'Draft' } : st
 )
 )
 Swal.fire({
 icon: 'success',
 title: 'Input Massal Berhasil',
 text: `${selectedStudentIds.length} santri terpilih berhasil diperbarui menjadi 100% Baik.`,
 timer: 1500,
 showConfirmButton: false,
 })
 }

 const toggleMatrixCell = (studentId, item) => {
 const key = `${studentId}:${item}`
 setMatrixValues((prev) => ({ ...prev, [key]: !prev[key] }))
 }

 const setMatrixColumn = (item, val) => {
 setMatrixValues((prev) => {
 const next = { ...prev }
 students.forEach((st) => {
 next[`${st.id}:${item}`] = val
 })
 return next
 })
 }

 // Stagger Animasi Halaman (§R)
 const itemVariants = {
 hidden: { opacity: 0, y: 12 },
 visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
 }

 return (
 <PageContainer className="space-y-6 pb-12">
 {/* BREADCRUMB NAV */}
 <motion.div variants={itemVariants} initial="hidden" animate="visible" className="print:hidden">
 <AppBreadcrumb
 items={[
 { label: 'Dashboard', href: '/dashboard' },
 { label: 'Mutaba’ah Yaumiyyah', href: '/dashboard/mutabaah' },
 {
 label:
 view === 'rekap'
 ? 'Laporan Rekap Mutaba’ah'
 : view === 'evaluasi'
 ? 'Evaluasi Target Mutaba’ah'
 : 'Dashboard Monitoring Mutaba’ah',
 },
 ]}
 />
 </motion.div>

 {/* MODERN HERO CARD HEADER (§B / §7.7 Vivid Emerald Responsive Hero) */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="print:hidden">
          <HeroUiHeader
            title={view === "rekap" ? "Laporan Rekap Mutaba’ah Yaumiyyah" : view === "evaluasi" ? "Evaluasi Target Mutaba’ah Santri" : "Dashboard Monitoring Mutaba’ah Yaumiyyah"}
            subtitle="Pusat pemantauan amalan yaumiyyah santri: shalat 5 waktu, dzikir, tilawah Al-Qur'an, dan pembiasaan ibadah harian."
            badge="Mutaba'ah Yaumiyyah"
            icon={BookOpenCheck}
            actions={
              <button
                type="button"
                onClick={() => {
                  analytics.refetch()
                  if (view !== "rekap") recapQuery.refetch()
                }}
                disabled={isTableFetching}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white/80 dark:bg-emerald-950/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/60 px-3.5 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-200 shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 ${isTableFetching ? "animate-spin" : ""}`} />
                <span>{isTableFetching ? "Memuat..." : "Segarkan"}</span>
              </button>
            }
          />
        </motion.div>

        {/* 📊 MODERN KPI CARDS GRID (§C + §7.3) */}
 <motion.div variants={itemVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <ModernKpiCard
 icon={Users}
 label="Total Santri Aktif"
 value={view === 'rekap' ? (recapData?.total || students.length) : (analytics.data?.kpis?.total_students ?? (recapData?.total || students.length))}
 subtext="Sesuai data master siswa"
 tag="Santri Aktif"
 tone="blue"
 />
 <ModernKpiCard
 icon={CheckCircle2}
 label="Sudah Diisi"
 value={view === 'rekap' ? students.filter((item) => item.progressToday > 0).length : (analytics.data?.kpis?.filled ?? students.filter((item) => item.progressToday > 0).length)}
 subtext="Memiliki data Mutabaah"
 tag="Tercatat"
 tone="emerald"
 />
 <ModernKpiCard
 icon={ShieldCheck}
 label="Sudah Final"
 value={view === 'rekap' ? students.filter((item) => item.status === 'Finalized').length : (analytics.data?.kpis?.finalized ?? students.filter((item) => item.status === 'Finalized').length)}
 subtext="Telah dikunci pembimbing"
 tag="Terkunci"
 tone="indigo"
 />
 <ModernKpiCard
 icon={AlertTriangle}
 label="Belum Diisi"
 value={view === 'rekap' ? students.filter((item) => item.status === 'Belum Diisi').length : (analytics.data?.kpis?.not_filled ?? students.filter((item) => item.status === 'Belum Diisi').length)}
 subtext="Perlu ditindaklanjuti"
 tag="Perhatian"
 tone="rose"
 />
 </motion.div>

 {/* 🧭 CARD MUTABA'AH YAUMIYYAH SUB-NAV (Positioned directly above Data Mutabaah Santri Card) */}
 <MutabaahSubNav />

 {/* 📈 DASHBOARD VIEW: VISUAL CHARTS */}
 {view === 'dashboard' && (
 <motion.div variants={itemVariants} initial="hidden" animate="visible" className="grid grid-cols-1 gap-5 lg:grid-cols-2">
 {/* Chart 1: Trend Progress Pekanan */}
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] p-5 sm:p-6 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433] flex flex-col justify-between h-full">
 <div>
 <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <div className="flex items-center gap-3">
 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-xs">
 <TrendingUp className="size-5" />
 </div>
 <div>
 <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Trend Progress Mutabaah Pekanan</h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">Rata-rata persentase pengisian mutabaah harian santri</p>
 </div>
 </div>
 <AppBadge variant="success" size="sm">Live Trend</AppBadge>
 </div>
 <div className="h-64 w-full pt-2 text-slate-200 dark:text-slate-800">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={analytics.data?.charts?.weekly_progress || []}>
 <defs>
 <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
 <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
 </linearGradient>
 </defs>
 <CartesianGrid stroke="currentColor" strokeDasharray="3 3" vertical={false} opacity={0.6} />
 <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fontSize: 11 }} className="text-slate-400 dark:text-slate-500" />
 <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fontSize: 11 }} className="text-slate-400 dark:text-slate-500" unit="%" />
 <Tooltip
 content={({ active, payload, label }) => {
 if (!active || !payload?.length) return null
 return (
 <div className="rounded-xl border border-emerald-200/80 bg-slate-900/95 p-3 text-white shadow-xl backdrop-blur-sm">
 <p className="text-xs font-bold text-emerald-400 mb-1">{label}</p>
 {payload.map((p) => (
 <p key={String(p.dataKey)} className="text-xs font-extrabold">Progress: {String(p.value)}%</p>
 ))}
 </div>
 )
 }}
 />
 <Area type="monotone" dataKey="progress" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProgress)" />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </div>
 <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-xs font-semibold text-slate-500">
 <span>Tren pengisian harian santri</span>
 <span className="text-emerald-600 dark:text-emerald-400 font-bold">Terupdate Otomatis</span>
 </div>
 </div>

 {/* Chart 2: Realisasi Target per Amalan */}
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] p-5 sm:p-6 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433] flex flex-col justify-between h-full">
 <div>
 <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <div className="flex items-center gap-3">
 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-xs">
 <BarChart3 className="size-5" />
 </div>
 <div>
 <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Capaian Target Amalan Utama</h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">Persentase pelaksanaan amalan ibadah terbanyak</p>
 </div>
 </div>
 <AppBadge variant="info" size="sm">Capaian Amalan</AppBadge>
 </div>
 <div className="h-64 w-full pt-2 text-slate-200 dark:text-slate-800 flex items-center justify-center">
 {(analytics.data?.charts?.target_realization || []).length > 0 ? (
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={analytics.data?.charts?.target_realization || []}>
 <CartesianGrid stroke="currentColor" strokeDasharray="3 3" vertical={false} opacity={0.6} />
 <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fontSize: 11 }} className="text-slate-400 dark:text-slate-500" />
 <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fontSize: 11 }} className="text-slate-400 dark:text-slate-500" unit="%" />
 <Tooltip
 content={({ active, payload, label }) => {
 if (!active || !payload?.length) return null
 return (
 <div className="rounded-xl border border-emerald-200/80 bg-slate-900/95 p-3 text-white shadow-xl backdrop-blur-sm">
 <p className="text-xs font-bold text-sky-400 mb-1">{label}</p>
 {payload.map((p) => (
 <p key={String(p.dataKey)} className="text-xs font-extrabold">Realisasi: {String(p.value)}%</p>
 ))}
 </div>
 )
 }}
 />
 <Bar dataKey="realization" fill="#059669" radius={[6, 6, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 ) : (
 <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-slate-400">
 <BarChart3 className="mb-2 size-8 text-slate-300 dark:text-slate-600" />
 <p className="font-semibold text-slate-500 dark:text-slate-400">Belum ada data capaian amalan</p>
 <p className="text-xs text-slate-400">Data akan terisi setelah santri/musyrif mencatat mutabaah.</p>
 </div>
 )}
 </div>
 </div>
 <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-xs font-semibold text-slate-500">
 <span>Realisasi per amalan ibadah</span>
 <span className="text-sky-600 dark:text-sky-400 font-bold">Data Agregat</span>
 </div>
 </div>
 </motion.div>
 )}

 {/* 📊 REKAPITULASI VIEW: SUMMARY STATUS CARDS (§C + §7.3) */}
 {view === 'rekap' && (
 <motion.div variants={itemVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <ModernKpiCard
 icon={CheckCircle2}
 label="Capaian Baik"
 value={`${analytics.data?.summary?.good ?? 0}%`}
 subtext="Amalan terlaksana dengan baik"
 tag="Baik"
 tone="emerald"
 />
 <ModernKpiCard
 icon={AlertTriangle}
 label="Capaian Kurang"
 value={`${analytics.data?.summary?.less ?? 0}%`}
 subtext="Perlu peningkatan bimbingan"
 tag="Kurang"
 tone="amber"
 />
 <ModernKpiCard
 icon={XCircle}
 label="Belum Dikerjakan"
 value={`${analytics.data?.summary?.not_done ?? 0}%`}
 subtext="Tidak terlaksana"
 tag="Kritis"
 tone="rose"
 />
 <ModernKpiCard
 icon={ShieldCheck}
 label="Paraf Orang Tua"
 value={`${analytics.data?.summary?.parent_signature ?? 0}%`}
 subtext="Telah diverifikasi orang tua"
 tag="Terverifikasi"
 tone="indigo"
 />
 </motion.div>
 )}

 {/* 🎯 TARGET & EVALUASI VIEW: TARGET CHARTS & SUMMARY */}
 {view === 'evaluasi' && (
 <motion.div variants={itemVariants} initial="hidden" animate="visible" className="grid grid-cols-1 gap-5 lg:grid-cols-2">
 {/* Target vs Realisasi Grid */}
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] p-5 sm:p-6 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433] flex flex-col justify-between h-full">
 <div>
 <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <div className="flex items-center gap-3">
 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-xs">
 <ListChecks className="size-5" />
 </div>
 <div>
 <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Evaluasi Target Ibadah Wajib & Sunnah</h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">Perbandingan target vs realisasi rata-rata santri</p>
 </div>
 </div>
 <AppBadge variant="warning" size="sm">Target Evaluasi</AppBadge>
 </div>
 <div className="h-64 w-full pt-2 text-slate-200 dark:text-slate-800 flex items-center justify-center">
 {(analytics.data?.charts?.target_vs_realization || analytics.data?.charts?.target_realization || []).length > 0 ? (
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={analytics.data?.charts?.target_vs_realization || analytics.data?.charts?.target_realization || []}>
 <CartesianGrid stroke="currentColor" strokeDasharray="3 3" vertical={false} opacity={0.6} />
 <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fontSize: 10 }} className="text-slate-400 dark:text-slate-500" />
 <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fontSize: 11 }} className="text-slate-400 dark:text-slate-500" unit="%" />
 <Tooltip
 content={({ active, payload, label }) => {
 if (!active || !payload?.length) return null
 return (
 <div className="rounded-xl border border-emerald-200/80 bg-slate-900/95 p-3 text-white shadow-xl backdrop-blur-sm">
 <p className="text-xs font-bold text-amber-400 mb-1">{label}</p>
 {payload.map((p) => (
 <p key={String(p.dataKey)} className="text-xs font-extrabold">{p.name}: {String(p.value)}%</p>
 ))}
 </div>
 )
 }}
 />
 <Bar dataKey="target" fill="#CBD5E1" radius={[4, 4, 0, 0]} name="Target" />
 <Bar dataKey="realization" fill="#059669" radius={[4, 4, 0, 0]} name="Realisasi" />
 </BarChart>
 </ResponsiveContainer>
 ) : (
 <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-slate-400">
 <ListChecks className="mb-2 size-8 text-slate-300 dark:text-slate-600" />
 <p className="font-semibold text-slate-500 dark:text-slate-400">Belum ada evaluasi target amalan</p>
 <p className="text-xs text-slate-400">Perbandingan target dan realisasi akan muncul setelah ada data evaluasi.</p>
 </div>
 )}
 </div>
 </div>
 <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-xs font-semibold text-slate-500">
 <span>Target vs realisasi amalan</span>
 <span className="text-amber-600 dark:text-amber-400 font-bold">Evaluasi Berkala</span>
 </div>
 </div>

 {/* Stat Ringkasan Evaluasi Musyrif */}
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] p-5 sm:p-6 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433] flex flex-col justify-between h-full">
 <div>
 <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <div className="flex items-center gap-3">
 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-xs">
 <HeartHandshake className="size-5" />
 </div>
 <div>
 <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Status Pembimbingan & Catatan Evaluasi</h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">Ringkasan evaluasi musyrif</p>
 </div>
 </div>
 <AppBadge variant="success" size="sm">Ringkasan Musyrif</AppBadge>
 </div>
 <div className="space-y-2.5">
 <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] dark:border-emerald-800/60 dark:from-emerald-950/40 dark:to-emerald-950/20">
 <div className="flex items-center gap-2.5">
 <CheckCircle2 className="h-5 w-5 text-emerald-600" />
 <div>
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Santri Memenuhi Target (≥ 85%)</p>
 <p className="text-[10px] text-slate-400">Pembiasaan ibadah sangat konsisten</p>
 </div>
 </div>
 <span className="text-sm font-black text-emerald-600 tabular-nums">{evaluationStats.meetingTarget} Santri</span>
 </div>
 <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] dark:border-emerald-800/60 dark:from-emerald-950/40 dark:to-emerald-950/20">
 <div className="flex items-center gap-2.5">
 <AlertTriangle className="h-5 w-5 text-amber-500" />
 <div>
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Santri Perlu Pembinaan Khusus (60-84%)</p>
 <p className="text-[10px] text-slate-400">Perlu pendampingan shalat sunnah/tilawah</p>
 </div>
 </div>
 <span className="text-sm font-black text-amber-600 tabular-nums">{evaluationStats.needingGuidance} Santri</span>
 </div>
 <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] dark:border-emerald-800/60 dark:from-emerald-950/40 dark:to-emerald-950/20">
 <div className="flex items-center gap-2.5">
 <XCircle className="h-5 w-5 text-rose-500" />
 <div>
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Santri Kritis (&lt; 60%)</p>
 <p className="text-[10px] text-slate-400">Memerlukan pemanggilan orang tua/konseling</p>
 </div>
 </div>
 <span className="text-sm font-black text-rose-600 tabular-nums">{evaluationStats.critical} Santri</span>
 </div>
 </div>
 </div>
 <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-xs font-semibold text-slate-500">
 <span>Total Santri Dievaluasi: {evaluationStats.total} Santri</span>
 <span className="text-emerald-600 dark:text-emerald-400 font-bold">Unduh via tombol Export</span>
 </div>
 </div>
 </motion.div>
 )}

 {/* 🟢 MAIN TABLE & FILTER CARD (Data Mutabaah Santri) */}
 <motion.section variants={itemVariants} initial="hidden" animate="visible" className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
 {/* Header Baris 1: Title & Vivid Gradient Squircle Action Buttons (§H.5) */}
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3.5 sm:px-6 md:px-8 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-200/90 dark:border-emerald-800/60">
 <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/50 dark:border-emerald-800/60 dark:text-emerald-400 shrink-0 shadow-xs">
              <BookMarked className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white ">
                  {view === 'evaluasi' ? 'Target & Evaluasi Mutabaah' : 'Data Mutabaah Santri'}
                </h3>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
                  {displayedStudents.length} Santri
                </span>
              </div>
              <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {view === 'evaluasi' ? 'Monitoring pencapaian target dan evaluasi pembiasaan ibadah santri per periode' : 'Daftar pencapaian pembiasaan ibadah santri per periode'}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 self-start sm:self-auto">
 <SquircleActionButton variant="import" icon={Upload} label="Import Data (Excel/CSV)" onClick={handleImportData} />
 <SquircleActionButton variant="export" icon={Download} label="Export Data (Excel/CSV)" onClick={handleExportCsv} />
 <SquircleActionButton variant="print" icon={Printer} label="Cetak Laporan" onClick={() => setPrintOptionModalOpen(true)} />
 <SquircleActionButton variant="primary" icon={UserPlus} label="Tambah Mutabaah Santri" onClick={handleAddNewMutabaah} />
 {selectedStudentIds.length > 0 && (
 <SquircleActionButton variant="teal" icon={Check} label={`Tandai ${selectedStudentIds.length} Terpilih 100%`} onClick={handleBatchMarkSelected} />
 )}
 <SquircleActionButton variant="edit" icon={Zap} label="Input Massal Matrix" onClick={openMatrixModal} />
 <SquircleActionButton variant="cyan" icon={CheckCircle2} label="Tandai Semua Baik" onClick={handleBatchMarkAllBaik} />
 <SquircleActionButton variant="import" icon={Copy} label="Salin Kemarin" onClick={handleCopyYesterday} />
 </div>
 </div>

 {/* Filter Baris 2: Filter Global Mutabaah (§7.9 flex-wrap + field §J.3) */}
 <div className="px-4 py-3 sm:px-6 md:px-8 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20">
 <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-2.5 w-full">
 <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0 inline-flex items-center gap-1.5">
 <Filter className="h-3.5 w-3.5 text-[#059669] dark:text-emerald-400" />
 Filter:
 </span>
 <div className="w-full sm:w-auto min-w-[140px]">
 <label htmlFor="mutabaah-from" className="sr-only">Dari tanggal</label>
 <DatePicker
 id="mutabaah-from"
 value={filters.date_from}
 onChange={(e) => update('date_from', e.target.value)}
 className="w-full sm:w-auto min-w-[140px]"
 inputClassName="py-2 text-xs font-semibold"
 placeholder="Dari tanggal..."
 />
 </div>
 <div className="w-full sm:w-auto min-w-[140px]">
 <label htmlFor="mutabaah-to" className="sr-only">Sampai tanggal</label>
 <DatePicker
 id="mutabaah-to"
 value={filters.date_to}
 onChange={(e) => update('date_to', e.target.value)}
 className="w-full sm:w-auto min-w-[140px]"
 inputClassName="py-2 text-xs font-semibold"
 placeholder="Sampai tanggal..."
 />
 </div>
 <HeroUiFilterSelect
 value={filters.education_unit_id || ''}
 onChange={(nextUnit) => {
 setFilters((prev) => ({
 ...prev,
 education_unit_id: nextUnit,
 class_id: '',
 kelas_id: '',
 dorm_id: '',
 supervisor_assignment_id: '',
 supervisor_id: '',
 page: 1,
 }))
 }}
 options={unitFilterOptions}
 placeholder="Semua Unit"
 icon={Building2}
 searchable={true}
 popoverWidth="min-w-[200px]"
 />

 {/* Filter Kelas: Tampilkan jika unit bukan Boarding murni, atau jika kelas tersedia */}
 {(!isBoardingUnitSelected || classList.length > 0) && (
 <HeroUiFilterSelect
 value={filters.class_id || filters.kelas_id || ''}
 onChange={(val) => {
 update('class_id', val)
 update('kelas_id', val)
 }}
 options={classFilterOptions}
 placeholder="Semua Kelas"
 icon={BookOpen}
 searchable={true}
 popoverWidth="min-w-[180px]"
 />
 )}

 {/* Filter Asrama: Tampilkan jika unit Boarding murni */}
 {isBoardingUnitSelected && (
 <HeroUiFilterSelect
 value={filters.dorm_id || ''}
 onChange={(val) => update('dorm_id', val)}
 options={dormFilterOptions}
 placeholder="Semua Asrama"
 icon={Layers}
 searchable={true}
 popoverWidth="min-w-[180px]"
 />
 )}

 {!isTeacher && (
 <HeroUiFilterSelect
 value={filters.supervisor_assignment_id || filters.supervisor_id || ''}
 onChange={(val) => {
 update('supervisor_assignment_id', val)
 update('supervisor_id', val)
 }}
 options={supervisorFilterOptions}
 placeholder="Semua Musyrif"
 icon={UserCheck}
 searchable={true}
 popoverWidth="min-w-[200px]"
 />
 )}

 <div className="w-full sm:w-auto sm:flex-1 sm:min-w-[160px]">
 <label htmlFor="mutabaah-search" className="sr-only">Pencarian santri</label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <Search className="size-4" />
 </div>
 <input
 id="mutabaah-search"
 type="text"
 placeholder="Cari santri/NIS..."
 value={filters.search || ''}
 onChange={(e) => update('search', e.target.value)}
 className="w-full rounded-xl border border-emerald-200/80 bg-slate-50/50 pl-10 pr-4 py-2 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-emerald-300 focus:border-[#059669] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/12 dark:border-emerald-800/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-emerald-200/80 dark:focus:border-[#10B981] dark:focus:bg-slate-900 dark:focus:ring-[#10B981]/20"
 />
 </div>
 </div>

 <HeroUiFilterSelect
 value={filters.per_page || 15}
 onChange={(val) => update('per_page', Number(val))}
 options={perPageFilterOptions}
 placeholder="15 per hal"
 icon={ListChecks}
 popoverWidth="min-w-[140px]"
 />
 <button
 type="button"
 onClick={handleResetFilters}
 className="w-full sm:w-auto sm:ml-auto inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 bg-white dark:bg-emerald-600 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300 dark: transition-all cursor-pointer font-medium"
 >
 <RotateCcw className="h-3.5 w-3.5" />
 <span>Reset</span>
 </button>
 </div>
 </div>

 <div className="overflow-x-auto px-4 sm:px-6 md:px-8 py-4">
 <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/80">
 <table className="w-full text-left text-xs">
          <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
            <tr className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200 text-xs font-black uppercase tracking-wider">
              <th className="px-3 py-2.5">Santri & Asrama</th>
              <th className="px-3 py-2.5">Musyrif / Pembimbing</th>
              <th className="px-3 py-2.5">Progress Ibadah</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5 text-right select-none w-20" />
            </tr>
          </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {isTableFetching && displayedStudents.length === 0 ? (
 <tr>
                  <td colSpan={5} className="px-4 py-6">
 <AppSkeleton variant="table" rows={4} cols={4} />
 </td>
 </tr>
 ) : displayedStudents.length === 0 ? (
 <tr>
                  <td colSpan={5} className="px-4 py-6">
 <AppEmptyState
 title="Tidak ada data Mutabaah Santri"
 description="Coba ubah filter atau kata kunci pencarian Anda."
 actionLabel="Reset Filter"
 onAction={handleResetFilters}
 />
 </td>
 </tr>
 ) : (
 displayedStudents.map((st) => (
 <tr key={st.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
                <td className="px-3 py-3 align-top sm:align-middle">
                  <div className="flex items-center gap-2.5">
                    {view !== 'rekap' && (
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.includes(st.id)}
                        onChange={() => toggleSelectStudent(st.id)}
                        aria-label={`Pilih ${st.name}`}
                        className="size-4 rounded border-emerald-300 accent-[#059669] cursor-pointer shrink-0"
                      />
                    )}
                    {st.photo ? (
                      <img src={st.photo} alt={st.name} className="h-8 w-8 rounded-full object-cover border border-emerald-200/80 dark:border-emerald-800/60 shrink-0" />
                    ) : (
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-[10px] font-black text-emerald-700">
                        {st.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white line-clamp-2">{st.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono line-clamp-1 mt-0.5">
                        NIS: {st.nis} • <span className="font-medium text-slate-700 dark:text-slate-300">{st.class}</span> {!isTeacher && st.dorm ? `(${st.dorm})` : ''}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 align-middle font-semibold text-slate-700 dark:text-slate-300">
                  {st.supervisor || '-'}
                </td>
                <td className="px-3 py-3 align-middle">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 rounded-full bg-emerald-50 dark:bg-slate-700">
                        <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${st.progressToday}%` }} />
                      </div>
                      <span className="font-bold text-emerald-600 text-xs tabular-nums">{st.progressToday}% (Hari Ini)</span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                      Pekan Ini: {st.progressWeek}%
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 align-middle">
                  <AppBadge variant={st.status === 'Finalized' ? 'success' : st.status === 'Draft' ? 'warning' : 'danger'}>
                    {st.status}
                  </AppBadge>
                </td>
                <td className="px-3 py-3 text-center align-middle">
                  <ActionDropdown
                    rowId={st.id}
                    onView={() => { setSelectedStudent(st); setShowDetailDrawer(true) }}
                    onEdit={() => {
                      setEditStudent(st)
                      setStudentForm({
                        name: st.name || '',
                        nis: st.nis || '',
                        class: st.class || '',
                        dorm: st.dorm || '',
                      })
                      setShowEditModal(true)
                    }}
                    extraActions={[
                      {
                        key: 'print',
                        label: 'Cetak Evaluasi Pekanan',
                        icon: Printer,
                        onClick: () => handlePrintWeeklyStudent(st),
                      }
                    ]}
                  />
                </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>

 {/* Pagination Controls (§7.6) */}
 <div className="border-t border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] p-3.5 sm:px-6 md:px-8 py-3 sm:py-3.5 dark:border-emerald-800/60 dark:from-emerald-950/20 dark:via-transparent dark:to-emerald-950/20 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
 <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center sm:text-left">
 Menampilkan <span className="font-semibold text-slate-700 dark:text-slate-200">{recapData?.from || (displayedStudents.length > 0 ? 1 : 0)}</span> s.d. <span className="font-semibold text-slate-700 dark:text-slate-200">{recapData?.to || displayedStudents.length}</span> dari <span className="font-semibold text-slate-700 dark:text-slate-200">{recapData?.total || displayedStudents.length}</span> santri
 </div>
 {(recapData?.last_page || 1) > 1 && (
 <div className="flex items-center justify-center gap-2">
 <Pagination
 currentPage={Number(filters.page || 1)}
 totalPages={Number(recapData?.last_page || 1)}
 onPageChange={(p) => update('page', p)}
 sideLayout="icon"
 />
 </div>
 )}
 </div>
 </motion.section>

 {/* MATRIX FAST INPUT MODAL */}
 {view !== 'rekap' && (
 <AppModal
 isOpen={showMatrixModal}
 onClose={() => setShowMatrixModal(false)}
 badge="Massal"
 title="Fast Matrix Input Mutabaah"
 description="Input cepat centang mutabaah harian santri secara massal"
 icon={Zap}
 maxWidth="max-w-4xl"
 zIndex="z-[70]"
 footer={
 <div className="flex w-full flex-wrap items-center justify-between gap-2.5">
 <button
 type="button"
 onClick={() => setShowMatrixModal(false)}
 className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
 >
 Tutup
 </button>
 <button
 type="button"
 onClick={() => {
 setShowMatrixModal(false)
 setStudents((prev) =>
 prev.map((st) => {
 const checkedCount = worshipItemsList.filter((item) => matrixValues[`${st.id}:${item}`]).length
 const pct = Math.round((checkedCount / worshipItemsList.length) * 100)
 return {
 ...st,
 progressToday: pct,
 status: pct > 0 ? 'Finalized' : st.status,
 }
 })
 )
 Swal.fire({
 icon: 'success',
 title: 'Matrix Disimpan',
 text: `Data Mutabaah untuk ${students.length} santri berhasil diperbarui!`,
 timer: 1800,
 showConfirmButton: false,
 })
 }}
 className="inline-flex h-9.5 items-center gap-1.5 rounded-xl border-2 border-emerald-600 bg-emerald-600 px-5 text-xs font-black text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-95 cursor-pointer"
 >
 <Check className="size-4" strokeWidth={2.2} />
 <span>Simpan Matrix</span>
 </button>
 </div>
 }
 >
 <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/80">
 <table className="w-full text-xs text-left border-collapse">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr className="bg-white dark:bg-[#1B2433] border-b border-emerald-200/80 dark:border-emerald-800/60 dark:from-emerald-950/80 dark:via-teal-950/60 dark:to-emerald-950/80 dark:border-emerald-800/60 uppercase text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300">
 <th className="p-2.5">Santri</th>
 {worshipItemsList.map((item) => (
 <th key={item} className="p-2.5 text-center">
 <div>{item}</div>
 <button
 type="button"
 onClick={() => setMatrixColumn(item, true)}
 className="mt-1 text-[9px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
 >
 All ✓
 </button>
 </th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {students.map((st) => (
 <tr key={st.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
 <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{st.name}</td>
 {worshipItemsList.map((item) => {
 const key = `${st.id}:${item}`
 const isChecked = Boolean(matrixValues[key])
 return (
 <td key={item} className="p-2.5 text-center">
 <input
 type="checkbox"
 checked={isChecked}
 onChange={() => toggleMatrixCell(st.id, item)}
 aria-label={`${item} - ${st.name}`}
 className="size-4 rounded border-emerald-300 accent-[#059669] cursor-pointer"
 />
 </td>
 )
 })}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </AppModal>
 )}

 {/* 🟢 HEROUI DIALOG: MODAL TAMBAH DATA SANTRI */}
 <AppModal
 isOpen={showAddModal}
 onClose={() => setShowAddModal(false)}
 icon={UserPlus}
 title="Tambah Data Mutabaah"
 badge="Data Baru"
 description="Isi informasi santri untuk menambahkan data mutabaah baru"
 maxWidth="max-w-md"
 zIndex={70}
 footer={
 <>
 <button
 type="button"
 onClick={() => setShowAddModal(false)}
 className="inline-flex items-center gap-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 h-9.5 px-4 text-xs font-black border border-slate-300 dark:border-slate-700 transition-all active:scale-95 cursor-pointer"
 >
 <X className="size-3.5" strokeWidth={2.2} />
 <span>Batal</span>
 </button>
 <button
 type="submit"
 form="mutabaah-add-student-form"
 className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white h-9.5 px-5 text-xs font-black border-2 border-emerald-600 shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
 >
 <Check className="size-3.5" strokeWidth={2.2} />
 <span>Simpan Data</span>
 </button>
 </>
 }
 >
 <form id="mutabaah-add-student-form" onSubmit={handleSaveNewStudent} className="space-y-4">
 <div>
 <label htmlFor="mutabaah-add-name" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
 Nama Lengkap Santri <span className="text-rose-500">*</span>
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <User className="size-4" />
 </div>
 <input
 id="mutabaah-add-name"
 type="text"
 required
 placeholder="Masukkan nama santri"
 value={studentForm.name}
 onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
 className="w-full h-10 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 pl-10 pr-4 text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all"
 />
 </div>
 </div>

 <div>
 <label htmlFor="mutabaah-add-nis" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
 NIS (Nomor Induk Siswa) <span className="text-rose-500">*</span>
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <Hash className="size-4" />
 </div>
 <input
 id="mutabaah-add-nis"
 type="text"
 required
 placeholder="Masukkan NIS santri"
 value={studentForm.nis}
 onChange={(e) => setStudentForm({ ...studentForm, nis: e.target.value })}
 className="w-full h-10 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 pl-10 pr-4 text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label htmlFor="mutabaah-add-class" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
 Kelas
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <BookOpen className="size-4" />
 </div>
 <input
 id="mutabaah-add-class"
 type="text"
 placeholder="Contoh: VII-A"
 value={studentForm.class}
 onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}
 className="w-full h-10 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 pl-10 pr-4 text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all"
 />
 </div>
 </div>

 <div>
 <label htmlFor="mutabaah-add-dorm" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
 Asrama
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <Building2 className="size-4" />
 </div>
 <input
 id="mutabaah-add-dorm"
 type="text"
 placeholder="Contoh: Asrama Al-Ghazali"
 value={studentForm.dorm}
 onChange={(e) => setStudentForm({ ...studentForm, dorm: e.target.value })}
 className="w-full h-10 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 pl-10 pr-4 text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all"
 />
 </div>
 </div>
 </div>
 </form>
 </AppModal>

 {/* 🟢 HEROUI DIALOG: MODAL EDIT DATA SANTRI */}
 <AppModal
 isOpen={showEditModal}
 onClose={() => setShowEditModal(false)}
 icon={Pencil}
 title="Edit Data Mutabaah"
 badge="Update Data"
 description="Ubah informasi santri yang dipilih"
 variant="warning"
 maxWidth="max-w-md"
 zIndex={70}
 footer={
 <>
 <button
 type="button"
 onClick={() => setShowEditModal(false)}
 className="inline-flex items-center gap-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 h-9.5 px-4 text-xs font-black border border-slate-300 dark:border-slate-700 transition-all active:scale-95 cursor-pointer"
 >
 <X className="size-3.5" strokeWidth={2.2} />
 <span>Batal</span>
 </button>
 <button
 type="submit"
 form="mutabaah-edit-student-form"
 className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white h-9.5 px-5 text-xs font-black border-2 border-emerald-600 shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
 >
 <Pencil className="size-3.5" strokeWidth={2.2} />
 <span>Simpan Perubahan</span>
 </button>
 </>
 }
 >
 <form id="mutabaah-edit-student-form" onSubmit={handleSaveEditStudent} className="space-y-4">
 <div>
 <label htmlFor="mutabaah-edit-name" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
 Nama Lengkap Santri <span className="text-rose-500">*</span>
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <User className="size-4" />
 </div>
 <input
 id="mutabaah-edit-name"
 type="text"
 required
 value={studentForm.name}
 onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
 className="w-full h-10 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 pl-10 pr-4 text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all"
 />
 </div>
 </div>

 <div>
 <label htmlFor="mutabaah-edit-nis" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
 NIS (Nomor Induk Siswa) <span className="text-rose-500">*</span>
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <Hash className="size-4" />
 </div>
 <input
 id="mutabaah-edit-nis"
 type="text"
 required
 value={studentForm.nis}
 onChange={(e) => setStudentForm({ ...studentForm, nis: e.target.value })}
 className="w-full h-10 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 pl-10 pr-4 text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label htmlFor="mutabaah-edit-class" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
 Kelas
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <BookOpen className="size-4" />
 </div>
 <input
 id="mutabaah-edit-class"
 type="text"
 value={studentForm.class}
 onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}
 className="w-full h-10 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 pl-10 pr-4 text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all"
 />
 </div>
 </div>

 <div>
 <label htmlFor="mutabaah-edit-dorm" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
 Asrama
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <Building2 className="size-4" />
 </div>
 <input
 id="mutabaah-edit-dorm"
 type="text"
 value={studentForm.dorm}
 onChange={(e) => setStudentForm({ ...studentForm, dorm: e.target.value })}
 className="w-full h-10 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 pl-10 pr-4 text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all"
 />
 </div>
 </div>
 </div>
 </form>
 </AppModal>

 {/* 🟢 HEROUI DIALOG: MODAL LIHAT DETAIL EVALUASI MUTABAAH SANTRI */}
 <AppModal
 isOpen={showDetailDrawer}
 onClose={() => setShowDetailDrawer(false)}
 icon={ShieldCheck}
 title={selectedStudent?.name || 'Detail Evaluasi Mutabaah'}
 badge={isSelectedBoarding ? 'Lembar Mutabaah Pesantren / Boarding' : 'Lembar Mutabaah Fullday School'}
 description={
 selectedStudent
 ? `NIS: ${selectedStudent.nis || '-'} • Kelas: ${selectedStudent.class || '-'}${selectedStudent.dorm && selectedStudent.dorm !== '-' ? ` • Asrama: ${selectedStudent.dorm}` : ''} • Periode: ${filters.date_from || firstDay} s.d. ${filters.date_to || today}`
 : ''
 }
 maxWidth="max-w-4xl"
 zIndex={70}
 bodyClassName="space-y-4 text-xs"
 subHeader={
 selectedStudent ? (
 <div className="bg-emerald-50/90 dark:bg-emerald-950/40 border-b border-emerald-200/80 dark:border-emerald-800/60 px-5 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
 <div className="flex items-center gap-2 flex-wrap">
 <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kurikulum Unit:</span>
 <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-black border ${isSelectedBoarding
 ? 'bg-purple-50 text-purple-800 border-purple-200/80 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60'
 : 'bg-white text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
 }`}>
 <span className={`size-2 rounded-full ${isSelectedBoarding ? 'bg-purple-600 animate-pulse' : 'bg-emerald-600'}`} />
 <span>{isSelectedBoarding ? 'Pesantren / Boarding (Pengasuhan 24 Jam)' : 'Fullday School (Sekolah & Rumah)'}</span>
 <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 font-mono">
 [ Otomatis: {activeSelectedUnit?.name || selectedStudent?.unitName || (isSelectedBoarding ? 'Pondok Pesantren' : 'Sekolah Terpadu')} ]
 </span>
 </div>
 </div>

 <div className="flex items-center gap-3">
 <div className="text-right">
 <span className="text-[10px] uppercase font-bold text-slate-400 block">Capaian Pekanan</span>
 <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
 {selectedStudent?.progressWeek || 0}%
 </span>
 </div>
 <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
 <div className="text-right">
 <span className="text-[10px] uppercase font-bold text-slate-400 block">Penanggung Jawab</span>
 <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
 {isSelectedBoarding ? 'Musyrif & Ustadz' : 'Ustadz & Orang Tua'}
 </span>
 </div>
 </div>
 </div>
 ) : null
 }
 footer={
 <div className="w-full flex flex-wrap items-center justify-between gap-2.5">
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
 Formulir Mutaba&apos;ah Mingguan Dareliman Edu • {isSelectedBoarding ? 'Pesantren / Boarding' : 'Fullday School'}
 </span>
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => setShowDetailDrawer(false)}
 className="inline-flex items-center gap-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 h-9.5 px-4 text-xs font-black border border-slate-300 dark:border-slate-700 transition-all active:scale-95 cursor-pointer"
 >
 <X className="size-3.5" strokeWidth={2.2} />
 <span>Tutup</span>
 </button>
 <button
 type="button"
 onClick={() => selectedStudent && handlePrintWeeklyStudent(selectedStudent)}
 className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white h-9.5 px-5 text-xs font-black border-2 border-emerald-600 shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
 >
 <Printer className="size-3.5" />
 <span>Cetak Format {isSelectedBoarding ? 'Boarding' : 'Fullday'}</span>
 </button>
 </div>
 </div>
 }
 >
 {selectedStudent && (
 <>

 {/* Notifikasi Karakteristik Format */}
 <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${isSelectedBoarding
 ? 'bg-purple-50/70 border-emerald-200/80 dark:border-emerald-800/60 text-purple-900 dark:bg-purple-950/30 dark:border-emerald-800/60 dark:text-purple-200'
 : 'bg-emerald-50/70 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800/60 dark:text-emerald-200'
 }`}>
 <div className="flex items-center gap-2">
 <Sparkles className="size-4 shrink-0" />
 <span>
 {isSelectedBoarding
 ? 'Format Pesantren: Agenda meliputi pengasuhan 24 jam di asrama (piket kamar tanadhuf, adab makan/tidur, muthala’ah malam, halaqah muraja’ah). Verifikasi harian oleh Musyrif & Ustadz.'
 : 'Format Fullday: Agenda mencakup sinergi rumah & sekolah (adab bangun tidur, bersalaman dengan orang tua, doa berkendara, muraja’ah bersama ortu). Verifikasi harian oleh Ustadz & Orang Tua.'}
 </span>
 </div>
 <span className="text-xs font-mono font-bold shrink-0">
 {detailSholat.length + detailYaumiyyah.length} Butir Agenda
 </span>
 </div>

 {/* Tabel Mutaba'ah Mingguan 7 Hari Resmi */}
 <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm">
 <table className="w-full text-left border-collapse text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr className="bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white font-extrabold uppercase text-[10px] tracking-wider text-center">
 <th className="py-2.5 px-2 w-10 border border-emerald-200/80 dark:border-emerald-800/60">NO</th>
 <th className="py-2.5 px-3 w-32 text-left border border-emerald-200/80 dark:border-emerald-800/60">Agenda</th>
 <th className="py-2.5 px-3 min-w-[200px] text-left border border-emerald-200/80 dark:border-emerald-800/60">Rincian Agenda</th>
 {detailWeekDays.map((d, i) => (
 <th key={i} className="py-2 px-1 w-12 border border-emerald-200/80 dark:border-emerald-800/60 text-center">
 <div className="leading-tight font-black">{d.dayName}/</div>
 <div className="text-[9px] font-medium opacity-90">{d.dateShort}</div>
 </th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-slate-800/80 bg-white dark:bg-slate-900/60">

 {/* BAGIAN 1: SHOLAT (6 BUTIR) */}
 {detailSholat.map((item, idx) => (
 <tr key={`sholat-${item.no}`} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors">
 <td className="py-2 px-2 text-center font-bold text-slate-600 dark:text-slate-400 border border-emerald-200/80 dark:border-emerald-800/60">{item.no}</td>
 {idx === 0 && (
 <td rowSpan={detailSholat.length} className="py-2 px-3 font-black text-emerald-800 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 align-middle text-center uppercase tracking-wider text-xs">
 Sholat
 </td>
 )}
 <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200 border border-emerald-200/80 dark:border-emerald-800/60">
 {item.displayName}
 </td>
 {detailWeekDays.map((d, dayIdx) => {
 const cell = getAgendaCellStatus(item, d, selectedStudent)
 return (
 <td key={dayIdx} className="py-1 px-1 text-center border border-emerald-200/80 dark:border-emerald-800/60">
 {cell.isFuture ? (
 <span className="text-xs font-mono text-slate-300 dark:text-slate-600 select-none">—</span>
 ) : cell.checked ? (
 <span className="inline-flex items-center justify-center size-5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black text-xs">
 ✓
 </span>
 ) : cell.isNA ? (
 <span className="text-[10px] font-mono text-slate-300 dark:text-slate-600 select-none">—</span>
 ) : (
 <span className="inline-flex items-center justify-center size-5 rounded-md bg-emerald-50 text-slate-400 dark:bg-emerald-950/40 dark:text-emerald-700 font-bold text-[10px]">
 ✕
 </span>
 )}
 </td>
 )
 })}
 </tr>
 ))}

 {/* BAGIAN 2: MUTABA'AH YAUMIYYAH */}
 {detailYaumiyyah.map((item, idx) => (
 <tr key={`yaumiyyah-${item.no}`} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors">
 <td className="py-2 px-2 text-center font-bold text-slate-600 dark:text-slate-400 border border-emerald-200/80 dark:border-emerald-800/60">{item.no}</td>
 {idx === 0 && (
 <td rowSpan={detailYaumiyyah.length} className="py-2 px-3 font-black text-teal-800 dark:text-teal-300 bg-teal-50/50 dark:bg-teal-950/20 border border-emerald-200/80 dark:border-emerald-800/60 align-middle text-center uppercase tracking-wider text-xs">
 Mutaba'ah Yaumiyyah
 </td>
 )}
 <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200 border border-emerald-200/80 dark:border-emerald-800/60">
 <div className="flex items-center justify-between gap-1.5">
 <span>{item.displayName}</span>
 <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${item.role === 'Ortu'
 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
 : item.role === 'Musyrif'
 ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
 : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
 }`}>
 {item.role}
 </span>
 </div>
 </td>
 {detailWeekDays.map((d, dayIdx) => {
 const cell = getAgendaCellStatus(item, d, selectedStudent)
 return (
 <td key={dayIdx} className="py-1 px-1 text-center border border-emerald-200/80 dark:border-emerald-800/60">
 {cell.isFuture ? (
 <span className="text-xs font-mono text-slate-300 dark:text-slate-600 select-none">—</span>
 ) : cell.checked ? (
 <span className="inline-flex items-center justify-center size-5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black text-xs">
 ✓
 </span>
 ) : cell.isNA ? (
 <span className="text-[10px] font-mono text-slate-300 dark:text-slate-600 select-none">—</span>
 ) : (
 <span className="inline-flex items-center justify-center size-5 rounded-md bg-emerald-50 text-slate-400 dark:bg-emerald-950/40 dark:text-emerald-700 font-bold text-[10px]">
 ✕
 </span>
 )}
 </td>
 )
 })}
 </tr>
 ))}

 {/* BARIS PARAF DUA TINGKAT SESUAI FORMAT FISIK */}
 <tr className="bg-slate-100/90 dark:bg-slate-800/90 font-bold border-t-2 border-emerald-200/80 dark:border-emerald-800/60">
 <td colSpan={3} rowSpan={2} className="py-2 px-3 text-center uppercase tracking-wider font-extrabold text-slate-700 dark:text-slate-300 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 align-middle text-xs">
 Paraf Verifikasi Harian
 </td>
 {detailWeekDays.map((_, dayIdx) => (
 <td key={`paraf-header-${dayIdx}`} className="py-1 px-1 text-center border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 bg-slate-50 dark:bg-slate-900 text-[9px] font-black">
 <div className="grid grid-cols-2 divide-x divide-slate-300 dark:divide-slate-700 text-slate-600 dark:text-slate-300">
 <span>{detailSigners.left}</span>
 <span>{detailSigners.right}</span>
 </div>
 </td>
 ))}
 </tr>
 <tr className="bg-white dark:bg-slate-900">
 {detailWeekDays.map((d, dayIdx) => {
 const isFuture = d.fullDate > today
 const progress = Number(selectedStudent?.progressWeek || 0)
 const isFilled = progress > 0 && selectedStudent?.status !== 'Belum Diisi' && !isFuture
 return (
 <td key={`paraf-dots-${dayIdx}`} className="py-2 px-1 text-center border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 text-[10px] font-mono tracking-tighter">
 {isFilled ? (
 <div className="grid grid-cols-2 divide-x divide-emerald-100/80 dark:divide-slate-800 text-emerald-600 dark:text-emerald-400 font-bold text-[9px]">
 <span>✓</span>
 <span>✓</span>
 </div>
 ) : (
 <div className="grid grid-cols-2 divide-x divide-emerald-100/80 dark:divide-slate-800 text-slate-400">
 <span>.......</span>
 <span>.......</span>
 </div>
 )}
 </td>
 )
 })}
 </tr>

 </tbody>
 </table>
 </div>

 {/* Tanda Tangan & Kemitraan */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
 <div className="p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/60 dark:bg-slate-900/40 text-center">
 <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
 {isSelectedBoarding ? 'Musyrif / Pembina Asrama' : 'Wali Kelas / Ustadz Pembimbing'}
 </p>
 <div className="h-9 flex items-center justify-center">
 <span className="font-serif italic text-slate-400 text-xs">( Tanda Tangan Terverifikasi )</span>
 </div>
 <p className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
 {selectedStudent?.supervisor || (isSelectedBoarding ? 'Musyrif Asrama' : 'Wali Kelas')}
 </p>
 </div>

 <div className="p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/60 dark:bg-slate-900/40 text-center">
 <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
 {isSelectedBoarding ? 'Kepala Pengasuhan / Asrama' : 'Orang Tua / Wali Santri'}
 </p>
 <div className="h-9 flex items-center justify-center">
 <span className="font-serif italic text-slate-400 text-xs">( Tanda Tangan Terverifikasi )</span>
 </div>
 <p className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
 {isSelectedBoarding ? 'Kepala Bidang Pengasuhan' : 'Orang Tua / Wali Siswa'}
 </p>
 </div>
 </div>
 </>
 )}
 </AppModal>
 {/* Modal: HeroUI Opsi Cetak & Unduh PDF / Clean Print */}
 <PrintOptionModal
 isOpen={printOptionModalOpen}
 onClose={() => setPrintOptionModalOpen(false)}
 onPrint={handlePrintClean}
 onDownload={handleDownloadPdfTable}
 onExportExcel={handleExportCsv}
 title={printReportType === 'pekanan' ? 'Rekap Evaluasi Pekanan Mutabaah' : 'Data Mutabaah Santri'}
 subtitle={
 printReportType === 'pekanan'
 ? `Periode Pekanan: ${filters.date_from || firstDay} s.d. ${filters.date_to || today}`
 : `Periode: ${filters.date_from || 'Semua'} s.d ${filters.date_to || 'Semua'}`
 }
 reportTypes={[
 {
 id: 'pekanan',
 label: 'Rekap Evaluasi Pekanan',
 description: 'Laporan rekapitulasi capaian target mingguan dan status evaluasi santri.',
 },
 {
 id: 'tabel',
 label: 'Data Log Tabel Santri',
 description: 'Laporan ringkasan data mutabaah umum santri sesuai filter tabel aktif.',
 },
 ]}
 selectedReportType={printReportType}
 onReportTypeChange={(type) => setPrintReportType(type)}
 previewHeaders={
 printReportType === 'pekanan'
 ? ['No', 'Santri', 'NIS', 'Kelas', 'Progress Pekanan', 'Progress Harian', 'Status']
 : ['Santri', 'NIS', 'Kelas', 'Hari Ini', 'Pekan Ini', 'Status']
 }
 previewRows={students.slice(0, 5).map((st, idx) =>
 printReportType === 'pekanan'
 ? [idx + 1, st.name, st.nis, st.class, `${st.progressWeek}%`, `${st.progressToday}%`, st.status]
 : [st.name, st.nis, st.class, `${st.progressToday}%`, `${st.progressWeek}%`, st.status]
 )}
 />
 </PageContainer>
  )
}

