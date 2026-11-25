import { HeroUiHeader } from "../components/ui/HeroUiHeader"
import AppModal from "../components/app/AppModal"
import {
  KpiStatCard
} from '../components/app'
import {
  useEffect,
  useState,
  useMemo,
  useRef
} from 'react'
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import {
  AnimatePresence,
  motion
} from 'framer-motion'
import {
  BookHeart,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Edit3,
  History,
  MessageSquareText,
  Printer,
  RotateCcw,
  Search,
  Signature,
  UserRound,
  Users,
  X,
  XCircle,
  Sparkles
} from 'lucide-react'
import Swal from '@/components/ui/compat/swal-heroui'
import {
  mutabaahService
} from '../services/mutabaahService'
import MutabaahSubNav from '../components/mutabaah/MutabaahSubNav'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import PageContainer from '../components/app/PageContainer'
import AppSkeleton from '../components/app/AppSkeleton'
import AppEmptyState from '../components/app/AppEmptyState'
import AppErrorState from '../components/app/AppErrorState'
import {
  MasterActionButton,
  MasterActionIconButton,
  SquircleActionButton,
  PrintOptionModal
} from '../components/master-data'
import {
  useAuthStore
} from '../stores/authStore'
import {
  hasRoleLevel,
  ROLE_LEVELS
} from '../auth/portalResolver'
import {
  downloadPdfTable,
  printCleanTable
} from '../utils/printHelper'
import {
  DatePicker
} from '@/components/ui/date-picker'
import './MutabaahFamilyPortal.css'

export const containerVariants = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: {
 staggerChildren: 0.05,
 delayChildren: 0.02,
 },
 },
}

export const itemVariants = {
 hidden: { opacity: 0, y: 12 },
 visible: {
 opacity: 1,
 y: 0,
 transition: { duration: 0.35, ease: 'easeOut' },
 },
}

const today = () => new Date().toLocaleDateString('en-CA')
const statusMeta = {
 good: { label: 'Baik', bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300', icon: CheckCircle2 },
 less: { label: 'Kurang', bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-300', icon: Clock3 },
 not_done: { label: 'Belum', bg: 'bg-rose-100 dark:bg-rose-950/60', text: 'text-rose-700 dark:text-rose-300', icon: XCircle },
 na: { label: 'N/A', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-400', icon: Clock3 },
}

// ── MODERN CARD TONES (§C HeroUI_Pengaturan_Halaman) ──
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
 popoverWidth = 'min-w-[200px]',
 searchable = false,
 ariaLabel = '',
 disabled = false,
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
 (opt.label && String(opt.label).toLowerCase().includes(q)) ||
 (opt.subtext && String(opt.subtext).toLowerCase().includes(q))
 )
 }, [options, search, searchable])

 const hasValue = value !== '' && value !== undefined && value !== null

 return (
 <div className={`relative ${className}`} ref={containerRef}>
 <button
 type="button"
 aria-label={ariaLabel}
 disabled={disabled}
 onClick={() => {
 if (!disabled) {
 setIsOpen((prev) => !prev)
 setSearch('')
 }
 }}
 className={`h-9 sm:h-10 w-full flex items-center justify-between gap-2 rounded-lg border px-3 text-xs font-semibold transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${isOpen
 ? 'border-slate-600 bg-white ring-2 ring-emerald-500/20 dark:border-emerald-800/60 dark:bg-slate-800 dark:ring-emerald-400/20 text-slate-900 dark:text-white shadow-xs'
 : hasValue
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/80 text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-200 font-bold'
 : 'border-emerald-300 dark:border-emerald-700/80 bg-white text-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-emerald-600/80'
 }`}
 >
 <div className="flex items-center gap-2 truncate">
 {IconComponent && (
 <IconComponent className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
 )}
 <span className="truncate">
 {selectedOption ? (
 <>
 <span>{selectedOption.label}</span>
 {selectedOption.subtext && (
 <span className="ml-1.5 opacity-75 font-normal text-xs">
 ({selectedOption.subtext})
 </span>
 )}
 </>
 ) : (
 placeholder
 )}
 </span>
 </div>
 <ChevronDown
 className={`size-3.5 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
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
 className={`absolute left-0 top-full mt-1.5 z-[90] ${popoverWidth} overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-white dark:bg-slate-800 p-1.5 shadow-xl shadow-slate-900/10 dark:shadow-black/40`}
 >
 {searchable && options.length > 5 && (
 <div className="p-1.5 border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80/60 mb-1">
 <div className="relative">
 <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Cari..."
 className="w-full rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900/60 pl-8 pr-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
 autoFocus
 />
 </div>
 </div>
 )}

 <div className="max-h-56 overflow-y-auto space-y-0.5">
 {filteredOptions.length === 0 ? (
 <div className="px-3 py-3 text-center text-xs text-slate-400 dark:text-slate-500">
 Tidak ada data
 </div>
 ) : (
 filteredOptions.map((opt) => {
 const isSelected = String(opt.value) === String(value)
 return (
 <button
 key={String(opt.value)}
 type="button"
 onClick={() => {
 onChange(opt.value)
 setIsOpen(false)
 setSearch('')
 }}
 className={`w-full flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors text-left cursor-pointer ${isSelected
 ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
 : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300'
 }`}
 >
 <div className="truncate pr-2">
 <div className="truncate font-semibold">{opt.label}</div>
 {opt.subtext && (
 <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal truncate mt-0.5">
 {opt.subtext}
 </div>
 )}
 </div>
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

export default function MutabaahFamilyPortal({ mode }) {
 const queryClient = useQueryClient()
 const user = useAuthStore((state) => state.user)
 const roles = user?.roles || []
 const isStaff = hasRoleLevel(user, ROLE_LEVELS.MUSYRIF) // Level 1 s/d 7 (Staf Internal Sekolah)

 const [date, setDate] = useState(today)
 const [studentId, setStudentId] = useState('')
 const [unitId, setUnitId] = useState('')
 const [classId, setClassId] = useState('')
 const [search, setSearch] = useState('')
 const [signatureOpen, setSignatureOpen] = useState(false)
 const [noteOpen, setNoteOpen] = useState(false)
 const [printModalOpen, setPrintModalOpen] = useState(false)

 // Master options (units, classes) for staff filtering
 const optionsQuery = useQuery({
 queryKey: ['mutabaah-portal-options'],
 queryFn: () => mutabaahService.options(),
 enabled: isStaff,
 })

 // Children query
 const children = useQuery({
 queryKey: ['parent-mutabaah-children', unitId, classId, search],
 queryFn: () => mutabaahService.parentChildren({ unit_id: unitId, class_id: classId, search }),
 enabled: mode === 'parent' || isStaff,
 })

 const unitOptions = useMemo(() => {
 const list = (optionsQuery.data?.units || []).map((u) => ({
 value: String(u.id),
 label: u.name,
 }))
 return [{ value: '', label: 'Semua Unit' }, ...list]
 }, [optionsQuery.data?.units])

 const santriOptions = useMemo(() => {
 return (children.data || []).map((child) => ({
 value: String(child.id),
 label: child.name,
 subtext: `Kelas ${child.class_name || '-'} (${child.unit || '-'})`,
 }))
 }, [children.data])

 useEffect(() => {
 if (!studentId && children.data?.[0]?.id) setStudentId(children.data[0].id)
 }, [children.data, studentId])

 const enabled = mode === 'student' || Boolean(studentId)
 const overview = useQuery({
 queryKey: ['family-mutabaah', mode, studentId, date],
 queryFn: () => (mode === 'parent' || isStaff ? mutabaahService.parentMutabaah(studentId, { date }) : mutabaahService.studentMutabaah({ date })),
 enabled,
 placeholderData: keepPreviousData,
 })

 const history = useQuery({
 queryKey: ['family-mutabaah-history', mode, studentId],
 queryFn: () => (mode === 'parent' || isStaff ? mutabaahService.parentHistory(studentId) : mutabaahService.studentMutabaahHistory()),
 enabled,
 })

 const data = overview.data

 const changeDay = (offset) => {
 const current = new Date(`${date}T12:00:00`)
 current.setDate(current.getDate() + offset)
 setDate(current.toLocaleDateString('en-CA'))
 }

 const sign = useMutation({
 mutationFn: ({ id, payload }) => mutabaahService.parentSignature(id, payload),
 onSuccess: (result) => {
 setSignatureOpen(false)
 queryClient.invalidateQueries({ queryKey: ['family-mutabaah'] })
 Swal.fire({ icon: 'success', title: 'Paraf tersimpan', text: result.message, timer: 1500, showConfirmButton: false })
 },
 onError: showError,
 })

 const updateNote = useMutation({
 mutationFn: ({ notes }) => mutabaahService.finalizeStudent({ student_id: studentId, supervisor_notes: notes }),
 onSuccess: (result) => {
 setNoteOpen(false)
 queryClient.invalidateQueries({ queryKey: ['family-mutabaah'] })
 Swal.fire({ icon: 'success', title: 'Catatan tersimpan', text: result?.message || 'Catatan pembimbing berhasil diperbarui.', timer: 1500, showConfirmButton: false })
 },
 onError: showError,
 })

 const handlePrint = (type) => {
 setPrintModalOpen(false)
 const activeStudent = children.data?.find((c) => String(c.id) === String(studentId)) || data?.student
 const studentName = activeStudent?.name || 'Santri'

 const columns = [
 { key: 'category', label: 'Kategori' },
 { key: 'name', label: 'Nama Agenda' },
 { key: 'status_label', label: 'Status' },
 { key: 'notes', label: 'Catatan' },
 ]

 const rows = (data?.today?.details || []).map((item) => ({
 category: item.category || '-',
 name: item.name || '-',
 status_label: statusMeta[item.status_value]?.label || 'Belum',
 notes: item.notes || '-',
 }))

 const payload = {
 title: `Laporan Mutaba'ah - ${studentName}`,
 subtitle: `Tanggal: ${new Date(`${date}T12:00:00`).toLocaleDateString('id-ID', { dateStyle: 'full' })}`,
 headers: columns.map((c) => c.label),
 rows: rows.map((r) => columns.map((c) => String(r[c.key] || '-'))),
 }

 if (type === 'clean') {
 printCleanTable(payload)
 } else {
 downloadPdfTable({ ...payload, filename: `Mutabaah_${studentName}_${date}.pdf` })
 }
 }

 return (
 <PageContainer className="space-y-6 pb-12">
 {/* BREADCRUMB NAV (§W) */}
 <motion.div variants={itemVariants} initial="hidden" animate="visible" className="print:hidden">
 <AppBreadcrumb
 items={[
 { label: 'Dashboard', href: '/dashboard' },
 { label: 'Mutaba’ah Yaumiyyah', href: '/dashboard/mutabaah' },
 { label: 'Monitoring Orang Tua' },
 ]}
 />
 </motion.div>

 {/* MODERN HERO CARD HEADER (§B / §7.7 Vivid Emerald Responsive Hero) */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="print:hidden">
          <HeroUiHeader
            title="Monitoring Mutaba’ah Yaumiyyah"
            subtitle={isStaff
              ? "Pantau pembiasaan ibadah harian seluruh santri, cek status paraf orang tua, dan beri catatan supervisi pembimbing."
              : "Pantau pembiasaan ibadah harian santri, rekap mingguan/bulanan, dan berikan paraf persetujuan."}
            badge={isStaff ? "Supervisi Sekolah" : "Portal Orang Tua"}
            icon={BookHeart}
            actions={
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold text-emerald-900 dark:text-emerald-200 shadow-2xs">
                <Users className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="tabular-nums">{children.data?.length || (data?.student ? 1 : 0)} Santri Terhubung</span>
              </span>
            }
          />
        </motion.div>

        {/* 📊 KPI CARDS GRID (§C + §7.3) */}
 <motion.div variants={itemVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <ModernKpiCard
 icon={Users}
 label="Total Santri Terhubung"
 value={children.data?.length || (data?.student ? 1 : 0)}
 subtext={isStaff ? 'Santri terpilih / binaan' : 'Anak terdaftar di portal'}
 tag="Terhubung"
 tone="blue"
 />
 <ModernKpiCard
 icon={CheckCircle2}
 label="Pencapaian Hari Ini"
 value={`${Math.round(data?.today?.score || 0)}%`}
 subtext="Capaian amalan ibadah harian"
 tag="Harian"
 tone="emerald"
 />
 <ModernKpiCard
 icon={Signature}
 label="Status Paraf Ortu"
 value={data?.today?.signature ? 'Sudah Diparaf' : 'Menunggu Paraf'}
 subtext={data?.today?.signature ? `Jenis: ${data.today.signature.signature_status}` : 'Belum dikonfirmasi ortu'}
 tag="Paraf"
 tone={data?.today?.signature ? 'emerald' : 'amber'}
 />
 <ModernKpiCard
 icon={History}
 label="Riwayat Mutabaah"
 value={history.data?.rows?.data?.length || 0}
 subtext="Hari difinalisasi tersimpan"
 tag="Riwayat"
 tone="blue"
 />
 </motion.div>

 {/* 🧭 SUB NAV */}
 <MutabaahSubNav />

 {/* 🟢 MAIN WORKSPACE CARD (ANIMATED CONTAINER §K) */}
 <motion.section
 initial="hidden"
 animate="visible"
 variants={containerVariants}
 className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433] space-y-5"
 >
 {/* BARIS 1: TITLE & ACTION BUTTONS (§H.5) */}
 <motion.div variants={itemVariants} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3.5 sm:px-6 md:px-8 bg-slate-50/50 dark:bg-slate-900/50 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <div className="flex items-center gap-3">
 <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shrink-0 shadow-xs">
 <BookHeart className="size-5" />
 </div>
 <div>
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
 {isStaff ? 'Supervisi & Monitoring Sekolah' : 'Portal Monitoring Orang Tua'}
 </span>
 <h1 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mt-0.5">Monitoring Mutaba’ah Yaumiyyah</h1>
 <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
 {isStaff
 ? 'Pantau pembiasaan ibadah harian seluruh santri, cek status paraf orang tua, dan beri catatan supervisi pembimbing.'
 : 'Pantau pembiasaan ibadah harian santri, rekap mingguan/bulanan, dan berikan paraf persetujuan.'}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
 {/* PRINT BUTTON */}
 <SquircleActionButton variant="print" icon={Printer} label="Cetak Data" onClick={() => setPrintModalOpen(true)} />

 {/* EXPORT BUTTON */}
 <SquircleActionButton variant="export" icon={Download} label="Export PDF" onClick={() => handlePrint('pdf')} />

 {/* MUSYRIF / STAFF NOTE ACTION BUTTON */}
 {isStaff && data?.today && (
 <SquircleActionButton variant="edit" icon={Edit3} label="Edit Catatan Pembimbing" onClick={() => setNoteOpen(true)} />
 )}

 {/* PARAF ACTION BUTTON */}
 {mode === 'parent' && data?.today && (
 <SquircleActionButton variant="secondary" icon={Signature} label="Beri Paraf Ortu" onClick={() => setSignatureOpen(true)} />
 )}
 </div>
 </motion.div>

 {/* BARIS 2: CONTROLS & FILTERS (§7.9 flex-wrap + field §J.3) */}
 <motion.div variants={itemVariants} className="px-4 py-3 sm:px-6 md:px-8 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-2.5 w-full">
 <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">
 Filter:
 </span>
 {/* UNIT FILTER */}
 {isStaff && optionsQuery.data?.units?.length > 0 && (
 <div className="w-full sm:w-auto min-w-[160px]">
 <label className="sr-only">Unit pendidikan</label>
 <HeroUiFilterSelect
 value={unitId}
 onChange={(val) => setUnitId(val)}
 options={unitOptions}
 placeholder="Semua Unit"
 icon={Building2}
 ariaLabel="Unit pendidikan"
 popoverWidth="min-w-[200px]"
 />
 </div>
 )}

 {/* INPUT PENCARIAN NAMA SANTRI / NIS */}
 {isStaff && (
 <div className="w-full sm:w-auto sm:flex-1 sm:min-w-[160px]">
 <label htmlFor="portal-search" className="sr-only">Cari santri</label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <Search className="size-4" />
 </div>
 <input
 id="portal-search"
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Cari Nama Santri / NIS..."
 className="w-full h-9 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-white dark:bg-slate-800 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-700/80 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:text-slate-100 dark:hover:border-emerald-600/80"
 />
 </div>
 </div>
 )}

 {/* SANTRI SELECT DROPDOWN */}
 <div className="w-full sm:w-auto sm:flex-1 sm:min-w-[220px]">
 <label className="sr-only">Pilih santri</label>
 <HeroUiFilterSelect
 value={studentId}
 onChange={(val) => setStudentId(val)}
 options={santriOptions}
 placeholder={
 !children.data?.length
 ? children.isLoading
 ? 'Memuat data santri...'
 : '-- Tidak Ada Data Santri --'
 : '-- Pilih Santri --'
 }
 icon={UserRound}
 ariaLabel="Pilih santri"
 popoverWidth="min-w-[280px] sm:w-96"
 searchable
 disabled={children.isLoading || !children.data?.length}
 />
 </div>

 <div className="flex items-center gap-1.5">
 <button
 type="button"
 onClick={() => changeDay(-1)}
 aria-label="Hari sebelumnya"
 className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all duration-150 active:scale-95 cursor-pointer"
 >
 <ChevronLeft className="size-5 shrink-0" />
 </button>
 <label htmlFor="portal-date" className="sr-only">Tanggal</label>
 <DatePicker
 id="portal-date"
 value={date}
 onChange={(e) => setDate(e.target.value)}
 className="w-40"
 inputClassName="py-2 text-xs font-semibold"
 />
 <button
 type="button"
 onClick={() => changeDay(1)}
 aria-label="Hari berikutnya"
 className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all duration-150 active:scale-95 cursor-pointer"
 >
 <ChevronRight className="size-5 shrink-0" />
 </button>
 </div>

 <button
 type="button"
 onClick={() => {
 setDate(today())
 setUnitId('')
 setClassId('')
 setSearch('')
 }}
 className="w-full sm:w-auto sm:ml-auto inline-flex items-center justify-center gap-1.5 h-9 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-all cursor-pointer"
 >
 <RotateCcw className="size-3.5" /> Reset
 </button>
 </div>
 </motion.div>

 {/* LOADING & ERROR STATES (§U.1) */}
 {(overview.isLoading || children.isLoading) && <AppSkeleton variant="card" className="h-40" />}
 {overview.isError && <AppErrorState title="Data mutabaah gagal dimuat" description="Silakan periksa koneksi dan coba kembali." onRetry={() => overview.refetch()} compact />}

 {/* CONTENT WITH STAGGERED ITEM VARIANTS */}
 {!overview.isLoading && data && (
 <motion.div variants={containerVariants} className="space-y-5">
 {/* STUDENT SUMMARY HEADER CARD */}
 <motion.div variants={itemVariants}>
 <StudentSummary data={data} />
 </motion.div>

 {/* REKAP MINGGUAN & BULANAN GRID */}
 <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <ProgressCard title="Rekap Mingguan" data={data.weekly} />
 <ProgressCard title="Rekap Bulanan" data={data.monthly} />
 </motion.div>

 {/* AGENDA HARI INI */}
 {data.today ? (
 <>
 <motion.div variants={itemVariants} className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 sm:p-6 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <div className="flex items-center gap-3">
 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-xs">
 <BookHeart className="size-5" />
 </div>
 <div>
 <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Agenda Mutabaah Hari Ini</h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 {new Date(`${data.date}T12:00:00`).toLocaleDateString('id-ID', { dateStyle: 'full' })}
 </p>
 </div>
 </div>
 <ProgressRing value={Number(data.today.score || 0)} />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
 {data.today.details.map((item) => {
 const meta = statusMeta[item.status_value] || statusMeta.na
 const StatusIcon = meta.icon
 return (
 <motion.div
 key={item.id}
 whileHover={{ y: -2, scale: 1.02 }}
 transition={{ type: 'spring', stiffness: 400, damping: 25 }}
 className="flex items-start gap-3 p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 hover:border-emerald-300 dark:hover:border-emerald-700/80 dark:border-emerald-800/60 dark:bg-slate-900/40"
 >
 <div className={`p-2 rounded-xl shrink-0 ${meta.bg} ${meta.text}`}>
 <StatusIcon className="size-4" />
 </div>
 <div className="flex-1 min-w-0">
 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{item.category}</span>
 <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 ">{item.name}</h4>
 {item.notes && <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{item.notes}</p>}
 </div>
 <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.bg} ${meta.text}`}>
 {meta.label}
 </span>
 </motion.div>
 )
 })}
 </div>
 </motion.div>

 {/* CATATAN MUSYRIF / SUPERVISI */}
 <motion.div variants={itemVariants} className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/50 p-5 dark:border-emerald-800/60 dark:bg-amber-950/20 flex items-start justify-between gap-3">
 <div className="flex items-start gap-3">
 <div className="p-2.5 rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm shrink-0">
 <MessageSquareText className="size-5" />
 </div>
 <div>
 <h3 className="text-xs font-bold text-slate-900 dark:text-white">Catatan Pembimbing / Musyrif / Kepala Sekolah</h3>
 <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
 {data.today.notes || 'Belum ada catatan pembimbing untuk hari ini.'}
 </p>
 </div>
 </div>
 {isStaff && (
 <MasterActionIconButton variant="edit" label="Edit Catatan" onClick={() => setNoteOpen(true)} />
 )}
 </motion.div>

 {/* PARAF ORANG TUA (STATUS & CONFIRMATION) */}
 <motion.div variants={itemVariants} className="rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 p-5 dark:border-emerald-800/60 dark:bg-emerald-950/30 flex flex-col sm:flex-row items-center justify-between gap-4">
 <div className="flex items-center gap-3">
 <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 shrink-0">
 <Signature className="size-6" />
 </div>
 <div>
 <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Paraf Persetujuan Orang Tua</h4>
 <p className="text-xs text-emerald-700 dark:text-emerald-300/80 mt-0.5">
 {data.today.signature
 ? `Diparaf pada ${new Date(data.today.signature.signed_at).toLocaleString('id-ID')} · Status: ${data.today.signature.signature_status}`
 : 'Menunggu konfirmasi dan paraf dari Orang Tua'}
 </p>
 {data.today.signature?.comment && (
 <p className="text-xs text-emerald-800 dark:text-emerald-200 font-medium italic mt-1">
 Pesan Ortu: "{data.today.signature.comment}"
 </p>
 )}
 </div>
 </div>

 {mode === 'parent' && (
 <MasterActionButton variant="primary" icon={Signature} onClick={() => setSignatureOpen(true)}>
 {data.today.signature ? 'Perbarui Paraf' : 'Beri Paraf Persetujuan'}
 </MasterActionButton>
 )}
 </motion.div>
 </>
 ) : (
 <AppEmptyState
 title="Belum ada hasil hari ini"
 description="Hasil mutabaah akan tampil setelah pembimbing/musyrif mencatat amalan santri."
 />
 )}

 {/* RIWAYAT HARIAN TIMELINE */}
 <motion.div variants={itemVariants}>
 <HistoryTimeline rows={history.data?.rows?.data || []} />
 </motion.div>
 </motion.div>
 )}

 {/* MODAL PARAF ORANG TUA (WITH ANIMATE PRESENCE SPRING POPUP) */}
 <AnimatePresence>
 {signatureOpen && data?.today && (
 <SignatureSheet
 close={() => setSignatureOpen(false)}
 submit={(payload) => sign.mutate({ id: data.today.id, payload })}
 saving={sign.isPending}
 />
 )}
 </AnimatePresence>

 {/* MODAL CATATAN PEMBIMBING (WITH ANIMATE PRESENCE SPRING POPUP) */}
 <AnimatePresence>
 {noteOpen && data?.today && (
 <NoteSheet
 close={() => setNoteOpen(false)}
 initialNote={data.today.notes || ''}
 submit={(notes) => updateNote.mutate({ notes })}
 saving={updateNote.isPending}
 />
 )}
 </AnimatePresence>

 {/* MODAL CETAK DATA (§Q — prop onPrint/onDownload, bukan onPrintClean) */}
 {printModalOpen && (
 <PrintOptionModal
 isOpen={printModalOpen}
 onClose={() => setPrintModalOpen(false)}
 onPrint={() => handlePrint('clean')}
 onDownload={() => handlePrint('pdf')}
 title="Laporan Mutaba'ah Santri"
 subtitle={`Tanggal: ${new Date(`${date}T12:00:00`).toLocaleDateString('id-ID', { dateStyle: 'full' })}`}
 />
 )}
 </motion.section>
 </PageContainer>
 )
}

function StudentSummary({ data }) {
 return (
 <motion.div
 whileHover={{ y: -2, scale: 1.01 }}
 transition={{ type: 'spring', stiffness: 400, damping: 25 }}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 shadow-xs dark:border-emerald-800/60 dark:bg-[#1B2433] flex items-center justify-between gap-4"
 >
 <div className="flex items-center gap-3.5">
 {data.student.photo ? (
 <img src={data.student.photo} alt={data.student.name} className="h-9 w-12 rounded-xl object-cover border border-emerald-200/80 dark:border-emerald-800/60" />
 ) : (
 <div className="grid h-9 w-12 place-items-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-sm dark:bg-emerald-950 dark:text-emerald-300">
 {data.student.name?.slice(0, 2)?.toUpperCase() || <UserRound className="size-6" />}
 </div>
 )}
 <div>
 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Profil Santri</span>
 <h2 className="text-base font-bold text-slate-900 dark:text-white">{data.student.name}</h2>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 NIS: {data.student.nis} · Kelas: {data.student.class_name || '-'} · Unit: {data.student.unit || '-'}
 </p>
 </div>
 </div>

 <div className="shrink-0">
 <ProgressRing value={Number(data.today?.score || 0)} />
 </div>
 </motion.div>
 )
}

function ProgressCard({ title, data }) {
 return (
 <motion.div
 whileHover={{ y: -2, scale: 1.01 }}
 transition={{ type: 'spring', stiffness: 400, damping: 25 }}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 shadow-xs dark:border-emerald-800/60 dark:bg-[#1B2433]"
 >
 <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3 dark:border-emerald-800/60 mb-3">
 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</h4>
 <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{data.score}%</span>
 </div>
 <p className="text-xs text-slate-400 mb-3">{data.days} hari tercatat dalam periode</p>
 <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
 <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
 <span>Baik</span>
 <p className="text-xs font-black mt-0.5">{data.good}</p>
 </div>
 <div className="rounded-xl bg-amber-50 p-2 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
 <span>Kurang</span>
 <p className="text-xs font-black mt-0.5">{data.less}</p>
 </div>
 <div className="rounded-xl bg-rose-50 p-2 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
 <span>Belum</span>
 <p className="text-xs font-black mt-0.5">{data.not_done}</p>
 </div>
 <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
 <span>N/A</span>
 <p className="text-xs font-black mt-0.5">{data.na}</p>
 </div>
 </div>
 </motion.div>
 )
}

function ProgressRing({ value }) {
 const rounded = Math.round(value)
 return (
 <div className="flex flex-col items-center justify-center rounded-xl bg-emerald-50 px-3.5 py-2 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60">
 <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{rounded}%</span>
 <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Skor Total</span>
 </div>
 )
}

function HistoryTimeline({ rows }) {
 return (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 shadow-xs dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="flex items-center gap-2.5 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3 dark:border-emerald-800/60 mb-4">
 <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm shrink-0">
 <History className="size-4" />
 </div>
 <h3 className="text-sm font-black text-slate-900 dark:text-white">Riwayat Mutabaah Harian</h3>
 </div>
 <div className="space-y-2.5">
 {rows.map((row) => (
 <motion.div
 key={row.id}
 whileHover={{ x: 3 }}
 transition={{ type: 'spring', stiffness: 400, damping: 25 }}
 className="flex items-center justify-between p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 hover:border-emerald-300 dark:hover:border-emerald-700/80 dark:border-emerald-800/60 dark:bg-slate-900/40 text-xs"
 >
 <div className="flex items-center gap-3">
 <span className={`size-2.5 rounded-full ${row.parent_signed ? 'bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950' : 'bg-slate-300 dark:bg-slate-600'}`} />
 <div>
 <b className="block font-bold text-slate-800 dark:text-slate-200">
 {new Date(row.activity_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
 </b>
 <p className="text-[10px] text-slate-400">
 Baik {row.good_count} · Kurang {row.less_count} · Belum {row.not_done_count} · N/A {row.na_count}
 </p>
 {row.supervisor_notes && (
 <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 italic">"{row.supervisor_notes}"</p>
 )}
 </div>
 </div>
 <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{row.score || 0}%</span>
 </motion.div>
 ))}
 {!rows.length && <AppEmptyState title="Belum ada riwayat" description="Belum ada riwayat mutabaah yang difinalisasi." />}
 </div>
 </div>
 )
}

function SignatureSheet({ close, submit, saving }) {
 const [status, setStatus] = useState('approved')
 const [comment, setComment] = useState('')

 return (
 <AppModal
 isOpen={true}
 onClose={() => { if (!saving) close() }}
 disableBackdropClose={saving}
 hideCloseButton={saving}
 badge="Konfirmasi Orang Tua"
 title="Paraf Mutaba’ah Yaumiyyah"
 icon={Signature}
 maxWidth="max-w-md"
 footer={
 <div className="flex w-full items-center justify-between gap-2.5">
 <button
 type="button"
 onClick={close}
 disabled={saving}
 className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
 >
 Batal
 </button>
 <button
 type="submit"
 form="mutabaah-signature-form"
 disabled={saving}
 className="inline-flex h-9.5 items-center gap-2 rounded-xl border-2 border-emerald-600 bg-emerald-600 px-5 text-xs font-black text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50 cursor-pointer"
 >
 {saving ? (
 <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
 ) : (
 <Signature className="size-3.5" strokeWidth={2.2} />
 )}
 <span>{saving ? 'Menyimpan...' : 'Konfirmasi Paraf'}</span>
 </button>
 </div>
 }
 >
 <form id="mutabaah-signature-form" onSubmit={(e) => { e.preventDefault(); submit({ signature_status: status, comment: comment || null, device_info: { platform: navigator.platform, app: 'Dareliman Edu Web' } }) }} className="space-y-4">
 <div className="space-y-2">
 <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${status === 'approved' ? 'border-[#059669] bg-emerald-50/50 dark:bg-emerald-950/30' : 'border-emerald-200/80 dark:border-emerald-700/80'}`}>
 <input type="radio" value="approved" checked={status === 'approved'} onChange={(e) => setStatus(e.target.value)} className="mt-0.5 text-emerald-600 focus:ring-emerald-500" />
 <div>
 <b className="block text-xs text-slate-900 dark:text-white">Setujui & Beri Paraf</b>
 <small className="text-[10px] text-slate-400">Saya telah memeriksa hasil mutabaah harian anak.</small>
 </div>
 </label>

 <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${status === 'clarification_requested' ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/50 dark:bg-amber-950/30' : 'border-emerald-200/80 dark:border-emerald-700/80'}`}>
 <input type="radio" value="clarification_requested" checked={status === 'clarification_requested'} onChange={(e) => setStatus(e.target.value)} className="mt-0.5 text-amber-600 focus:ring-amber-500" />
 <div>
 <b className="block text-xs text-slate-900 dark:text-white">Minta Klarifikasi</b>
 <small className="text-[10px] text-slate-400">Memerlukan penjelaskan lebih lanjut dari pembimbing.</small>
 </div>
 </label>

 <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${status === 'unable_to_verify' ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/50 dark:bg-rose-950/30' : 'border-emerald-200/80 dark:border-emerald-700/80'}`}>
 <input type="radio" value="unable_to_verify" checked={status === 'unable_to_verify'} onChange={(e) => setStatus(e.target.value)} className="mt-0.5 text-rose-600 focus:ring-rose-500" />
 <div>
 <b className="block text-xs text-slate-900 dark:text-white">Tidak Dapat Memverifikasi</b>
 <small className="text-[10px] text-slate-400">Data belum dapat saya pastikan kebenarannya.</small>
 </div>
 </label>
 </div>

 <div>
 <label htmlFor="paraf-note" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Catatan Tambahan (Opsional)</label>
 <div className="relative">
 <div className="pointer-events-none absolute left-3.5 top-3 flex items-center text-slate-400 dark:text-slate-500">
 <MessageSquareText className="size-4" />
 </div>
 <textarea
 id="paraf-note"
 value={comment}
 onChange={(e) => setComment(e.target.value)}
 maxLength={1000}
 rows={3}
 placeholder="Tuliskan pesan untuk pembimbing..."
 className="w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400/80 transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
 />
 </div>
 </div>
 </form>
 </AppModal>
 )
}

function NoteSheet({ close, initialNote, submit, saving }) {
 const [note, setNote] = useState(initialNote)

 return (
 <AppModal
 isOpen={true}
 onClose={() => { if (!saving) close() }}
 disableBackdropClose={saving}
 hideCloseButton={saving}
 badge="Supervisi Sekolah"
 title="Edit Catatan Pembimbing / Musyrif"
 icon={MessageSquareText}
 maxWidth="max-w-md"
 footer={
 <div className="flex w-full items-center justify-between gap-2.5">
 <button
 type="button"
 onClick={close}
 disabled={saving}
 className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
 >
 Batal
 </button>
 <button
 type="submit"
 form="mutabaah-note-form"
 disabled={saving}
 className="inline-flex h-9.5 items-center gap-2 rounded-xl border-2 border-emerald-600 bg-emerald-600 px-5 text-xs font-black text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50 cursor-pointer"
 >
 {saving ? (
 <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
 ) : (
 <CheckCircle2 className="size-3.5" strokeWidth={2.2} />
 )}
 <span>{saving ? 'Menyimpan...' : 'Simpan Catatan'}</span>
 </button>
 </div>
 }
 >
 <form id="mutabaah-note-form" onSubmit={(e) => { e.preventDefault(); submit(note) }} className="space-y-4">
 <div>
 <label htmlFor="note-text" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Pesan / Evaluasi Musyrif untuk Santri & Orang Tua</label>
 <div className="relative">
 <div className="pointer-events-none absolute left-3.5 top-3 flex items-center text-slate-400 dark:text-slate-500">
 <MessageSquareText className="size-4" />
 </div>
 <textarea
 id="note-text"
 value={note}
 onChange={(e) => setNote(e.target.value)}
 maxLength={1000}
 rows={4}
 placeholder="Tuliskan evaluasi amalan ibadah santri hari ini..."
 className="w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400/80 transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
 />
 </div>
 </div>
 </form>
 </AppModal>
 )
}

function showError(error) {
 Swal.fire({ icon: 'error', title: 'Tidak dapat menyimpan', text: error?.response?.data?.message || 'Terjadi kesalahan.', confirmButtonColor: '#059669' })
}
