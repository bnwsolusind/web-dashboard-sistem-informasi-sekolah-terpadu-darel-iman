import {
  KpiStatCard
} from '../../../components/app'
import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  Building2,
  Users,
  GraduationCap,
  ArrowRightLeft,
  Award,
  School,
  Scale,
  TrendingUp,
  Sparkles,
  Printer,
  RefreshCw,
  RotateCcw,
  Filter,
  Layers,
  CheckCircle2,
  Calendar,
  Check,
  ChevronDown,
  Search
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  CartesianGrid
} from 'recharts'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  reportService
} from '../../../services/reportService'
import PageContainer from '../../../components/app/PageContainer'
import AppBreadcrumb from '../../../components/app/AppBreadcrumb'
import {
  MasterStatsGrid,
  MasterStatCard,
  SquircleActionButton,
  PrintOptionModal
} from '../../../components/master-data'
import {
  SmartScrollFab
} from '../../../components/common'
import {
  Button
} from '@/components/ui/button'
import {
  Badge
} from '@/components/ui/badge'
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIndicator,
  AlertTitle
} from '@/components/ui/alert'
import {
  TableRoot,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table'
import {
  ReportSkeleton
} from '../../../components/reports/ReportSkeleton'
import {
  ReportEmptyState
} from '../../../components/reports/ReportEmptyState'
import {
  ReportErrorState
} from '../../../components/reports/ReportErrorState'
import {
  ReportExportModal
} from '../../../components/reports/ReportExportModal'
import {
  printCleanTable,
  downloadPdfTable
} from '../../../utils/printHelper'

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
 popoverWidth = 'w-full',
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

 const hasValue = value !== '' && value !== 'semua' && value !== 'all' && value !== undefined && value !== null

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
 className={`h-9 w-full flex items-center justify-between gap-2 rounded-lg border px-3 text-xs font-semibold transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
 isOpen
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
 className={`absolute left-0 top-full mt-1.5 z-[90] ${popoverWidth} min-w-[200px] overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-white dark:bg-slate-800 p-1.5 shadow-xl shadow-slate-900/10 dark:shadow-black/40`}
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
 className={`w-full flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors text-left cursor-pointer ${
 isSelected
 ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
 : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300'
 }`}
 >
 <div className="truncate pr-2">
 <div className="truncate">{opt.label}</div>
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

export function LaporanLintasUnitPage() {
 const [filters, setFilters] = useState({ period: 'year' })
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(false)
 const [reportData, setReportData] = useState(null)

 const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
 const [isExportOpen, setIsExportOpen] = useState(false)
 const [exportFormat, setExportFormat] = useState('pdf')

 const fetchReport = async () => {
 setLoading(true)
 setError(false)
 try {
 const res = await reportService.getFoundationLintasUnitReport(filters)
 setReportData(res)
 } catch (err) {
 console.error('Failed to fetch Lintas Unit report', err)
 setError(true)
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 fetchReport()
 }, [filters])

 const handlePeriodChange = (val) => {
 setFilters((prev) => ({ ...prev, period: val }))
 }

 const handleResetFilter = () => {
 setFilters({ period: 'year' })
 }

 const periodOptions = useMemo(() => [
 { value: 'year', label: 'Tahun Ajaran Penuh (2026/2027)' },
 { value: 'semester', label: 'Semester Ini' },
 { value: 'month', label: 'Bulan Ini' },
 { value: 'all', label: 'Seluruh Riwayat Data' },
 ], [])

 const handleConfirmExport = ({ format, orientation }) => {
 setIsExportOpen(false)
 const url = reportService.exportFoundationReport('lintas-unit', { ...filters, format, orientation })
 window.open(url, '_blank')
 }

 const handlePrintClean = () => {
 setIsPrintModalOpen(false)
 const headers = ['Unit Pendidikan', 'Guru', 'Pegawai', 'Siswa Aktif', 'Siswa Baru', 'Mutasi Masuk', 'Mutasi Keluar', 'Kelulusan', 'Alumni', 'Kelas', 'Rombel']
 const rows = (reportData?.main_comparison || []).map((r) => [
 r.unit_name || '-',
 String(r.guru ?? 0),
 String(r.pegawai ?? 0),
 String(r.siswa ?? 0),
 String(r.siswa_baru ?? 0),
 String(r.mutasi_masuk ?? 0),
 String(r.mutasi_keluar ?? 0),
 String(r.lulus ?? 0),
 String(r.alumni ?? 0),
 String(r.kelas ?? 0),
 String(r.rombel ?? 0),
 ])
 printCleanTable({
 title: 'Laporan Komparasi Eksekutif Lintas Unit Pendidikan',
 subtitle: `Periode: ${reportData?.report?.period?.label || 'Tahun Ini'} • Total Unit: ${reportData?.summary?.total_unit || rows.length}`,
 headers,
 rows,
 })
 }

 const handleDownloadPdf = () => {
 setIsPrintModalOpen(false)
 const headers = ['Unit Pendidikan', 'Guru', 'Pegawai', 'Siswa Aktif', 'Siswa Baru', 'Mutasi Masuk', 'Mutasi Keluar', 'Kelulusan', 'Alumni', 'Kelas', 'Rombel']
 const rows = (reportData?.main_comparison || []).map((r) => [
 r.unit_name || '-',
 String(r.guru ?? 0),
 String(r.pegawai ?? 0),
 String(r.siswa ?? 0),
 String(r.siswa_baru ?? 0),
 String(r.mutasi_masuk ?? 0),
 String(r.mutasi_keluar ?? 0),
 String(r.lulus ?? 0),
 String(r.alumni ?? 0),
 String(r.kelas ?? 0),
 String(r.rombel ?? 0),
 ])
 downloadPdfTable({
 title: 'Laporan Komparasi Eksekutif Lintas Unit Pendidikan',
 subtitle: `Periode: ${reportData?.report?.period?.label || 'Tahun Ini'} • Total Unit: ${reportData?.summary?.total_unit || rows.length}`,
 headers,
 rows,
 })
 }

 if (loading && !reportData) return <ReportSkeleton />
 if (error) return <ReportErrorState onRetry={fetchReport} />
 if (!reportData || !reportData.summary) return <ReportEmptyState onReset={handleResetFilter} />

 const { summary, charts, main_comparison, ratio_table, comparison_total, insights, report } = reportData

 return (
 <PageContainer maxW="7xl" className="space-y-6 pb-12">
 {/* 🧭 AppBreadcrumb Navigation */}
 <div className="mb-4 print:hidden">
 <AppBreadcrumb
 items={[
 { href: '/dashboard/yayasan', label: 'Yayasan' },
 { href: '/dashboard/yayasan/laporan', label: 'Laporan Eksekutif' },
 { label: 'Laporan Lintas Unit (Eksekutif)' },
 ]}
 />
 </div>

 {/* ── 1. MODERN VIVID EMERALD HERO HEADER CARD ── */}
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3 }}
 className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 !bg-[#D5F2E3] p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:!bg-[#112a22] print:hidden"
 >

 <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div className="flex items-start gap-4 min-w-0">
 <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
 
            <Building2 className="size-6 sm:size-7 text-white" />
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2.5 flex-wrap">
 <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold bg-emerald-600 text-white shadow-xs border border-emerald-500/40 dark:border-emerald-600/50">
 
                  <Sparkles className="size-3 animate-pulse text-white" />
 Laporan Eksekutif Multi-Unit
 </span>
 <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
 Periode: {report?.period?.label || 'Tahun Ini'}
 </span>
 </div>
 <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
 {report?.title || 'Laporan Komparasi Lintas Unit Pendidikan'}
 </h1>
 <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 w-full leading-relaxed">
 {report?.description || 'Agregasi seluruh indikator operasional, perbandingan populasi siswa, rasio guru, dan efisiensi pembelajaran di seluruh unit sekolah.'}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
 <Button
 type="button"
 variant="primary"
 appearance="fill"
 size="sm"
 onClick={fetchReport}
 disabled={loading}
 prefixIcon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
 className="!bg-white dark:bg-[#1B2433] !from-emerald-600 !to-teal-600 ! font-bold shadow-sm cursor-pointer"
 >
 Segarkan Data
 </Button>
 </div>
 </div>
 </motion.div>

 {/* ── 2. EXECUTIVE KPI GRID (MODERN KPI CARDS) ── */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
 <ModernKpiCard
 icon={Building2}
 title="Total Unit Sekolah"
 value={summary.total_unit}
 subtext="Satuan pendidikan aktif"
 tone="emerald"
 tag="UNIT SEKOLAH"
 />
 <ModernKpiCard
 icon={Users}
 title="Total SDM Pegawai"
 value={summary.total_sdm}
 subtext="Guru & Tenaga Kependidikan"
 tone="sky"
 tag="SDM TERPADU"
 />
 <ModernKpiCard
 icon={GraduationCap}
 title="Total Siswa Aktif"
 value={summary.total_siswa}
 subtext="Peserta didik terdaftar"
 tone="indigo"
 tag="SISWA AKTIF"
 />
 <ModernKpiCard
 icon={ArrowRightLeft}
 title="Total Mutasi"
 value={summary.total_mutasi}
 subtext="Mutasi masuk & keluar"
 tone="amber"
 tag="MUTASI SISWA"
 />
 <ModernKpiCard
 icon={Award}
 title="Total Kelulusan"
 value={summary.total_kelulusan}
 subtext="Alumni & kelulusan unit"
 tone="purple"
 tag="KELULUSAN"
 />
 </div>

 {/* ── 3. 3-COLUMN EQUAL GRID: FILTER + POPULASI BAR CHART + RADAR MULTIDIMENSI ── */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch print:hidden">
 {/* Col 1: Kartu Filter Periode Laporan */}
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] p-5 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433] flex flex-col justify-between">
 <div className="relative z-10">
 <div className="flex items-center justify-between mb-4 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3">
 <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
 <Filter className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 Filter Komparasi Lintas Unit
 </h3>
 <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
 Eksekutif
 </span>
 </div>

 <div className="space-y-3">
 <div>
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
 Periode Analisis
 </label>
 <HeroUiFilterSelect
 value={filters.period}
 onChange={(val) => handlePeriodChange(val)}
 options={periodOptions}
 placeholder="Pilih Periode Analisis"
 icon={Calendar}
 ariaLabel="Pilih Periode Analisis"
 />
 </div>

 <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:border-emerald-800/60 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
 <div className="flex justify-between font-medium">
 <span>Rata-rata Siswa / Guru:</span>
 <b className="text-emerald-800 dark:text-emerald-200">1 : {summary.avg_siswa_per_guru}</b>
 </div>
 <div className="flex justify-between font-medium">
 <span>Rata-rata Siswa / Rombel:</span>
 <b className="text-emerald-800 dark:text-emerald-200">{summary.avg_siswa_per_rombel} Siswa</b>
 </div>
 <div className="flex justify-between font-medium">
 <span>Unit Siswa Terbanyak:</span>
 <b className="text-emerald-800 dark:text-emerald-200">{summary.unit_siswa_terbanyak}</b>
 </div>
 </div>
 </div>
 </div>

 <div className="relative z-10 mt-4 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60">
 <button
 type="button"
 onClick={handleResetFilter}
 className="w-full flex items-center justify-center gap-1.5 rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 p-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300 cursor-pointer transition-colors"
 >
 <RotateCcw className="h-3.5 w-3.5" /> Reset Filter Periode
 </button>
 </div>
 </div>

 {/* Col 2: Perbandingan Populasi Siswa per Unit (BarChart) */}
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] p-5 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="relative z-10 h-full flex flex-col justify-between">
 <div className="flex items-center justify-between mb-3 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-2.5">
 <div>
 <h4 className="text-sm font-bold text-slate-900 dark:text-white">Populasi Siswa per Unit</h4>
 <p className="text-xs text-slate-400">Siswa aktif & siswa baru terdaftar</p>
 </div>
 <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
 Populasi
 </span>
 </div>
 <div className="h-56 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={charts.perbandingan_siswa || []}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
 <XAxis dataKey="name" tick={{ fontSize: 10 }} />
 <YAxis tick={{ fontSize: 10 }} />
 <Tooltip />
 <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
 <Bar dataKey="siswa" name="Siswa Aktif" fill="#059669" radius={[4, 4, 0, 0]} />
 <Bar dataKey="siswa_baru" name="Siswa Baru" fill="#10B981" radius={[4, 4, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>

 {/* Col 3: Radar Perbandingan Dinormalisasi (Skala 0-100) */}
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] p-5 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="relative z-10 h-full flex flex-col justify-between">
 <div className="flex items-center justify-between mb-3 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-2.5">
 <div>
 <h4 className="text-sm font-bold text-slate-900 dark:text-white">Radar Kapasitas Unit</h4>
 <p className="text-xs text-slate-400">Normalisasi skor siswa vs SDM</p>
 </div>
 <span className="rounded-lg bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
 Radar
 </span>
 </div>
 <div className="h-56 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <RadarChart data={charts.radar_normalized || []}>
 <PolarGrid stroke="#E2E8F0" />
 <PolarAngleAxis dataKey="unit" tick={{ fontSize: 9 }} />
 <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 8 }} />
 <Radar name="Skor Populasi" dataKey="siswa_norm" stroke="#059669" fill="#059669" fillOpacity={0.35} />
 <Radar name="Skor SDM" dataKey="sdm_norm" stroke="#0284C7" fill="#0284C7" fillOpacity={0.35} />
 <Tooltip />
 <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
 </RadarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>
 </div>

 {/* ── 4. EMERALD DATATABLE CONTAINER 1: TABEL KOMPARASI UTAMA ── */}
 <section id="tabel-komparasi-lintas-unit" className="scroll-mt-6 relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-sm dark:bg-[#1B2433]">
 {/* Toolbar Header */}
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 dark:bg-slate-900/50 p-5 dark:border-emerald-800/60">
 <div>
 <div className="flex items-center gap-2">
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
 <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
 Tabel Perbandingan Utama Lintas Unit
 </h3>
 <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
 {(main_comparison || []).length} Unit Pendidikan
 </span>
 </div>
 <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
 Agregasi seluruh indikator operasional utama per Unit Pendidikan di bawah naungan Yayasan.
 </p>
 </div>

 <div className="flex items-center gap-2 flex-nowrap shrink-0 overflow-visible py-1">
 <SquircleActionButton
 variant="view"
 icon={Printer}
 label="Cetak / Unduh PDF Komparasi"
 onClick={() => setIsPrintModalOpen(true)}
 />
 <SquircleActionButton
 variant="export"
 label="Export Excel (.xlsx)"
 onClick={() => {
 setExportFormat('excel')
 setIsExportOpen(true)
 }}
 />
 </div>
 </div>

 {/* Datatable Body */}
 <div className="overflow-x-auto">
 <TableRoot className="w-full text-left border-collapse text-xs min-w-[700px]">
 <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/60 dark:text-emerald-100 font-bold text-xs uppercase tracking-wider">
 <TableRow>
 <TableHead className="py-3.5 px-4">Unit Pendidikan</TableHead>
 <TableHead className="py-3.5 px-3 text-right">Guru</TableHead>
 <TableHead className="py-3.5 px-3 text-right">Pegawai</TableHead>
 <TableHead className="py-3.5 px-3 text-right font-black">Siswa Aktif</TableHead>
 <TableHead className="py-3.5 px-3 text-right">Siswa Baru</TableHead>
 <TableHead className="py-3.5 px-3 text-right">Mutasi Masuk</TableHead>
 <TableHead className="py-3.5 px-3 text-right">Mutasi Keluar</TableHead>
 <TableHead className="py-3.5 px-3 text-right">Kelulusan</TableHead>
 <TableHead className="py-3.5 px-3 text-right">Alumni</TableHead>
 <TableHead className="py-3.5 px-3 text-right">Kelas</TableHead>
 <TableHead className="py-3.5 px-4 text-right">Rombel</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-xs">
 {(main_comparison || []).map((row, idx) => (
 <TableRow key={idx} className="transition hover:bg-emerald-50/30 dark:hover:bg-emerald-950/30">
 <TableCell className="py-3 px-4 font-extrabold text-slate-900 dark:text-emerald-600">
 {row.unit_name}
 </TableCell>
 <TableCell className="py-3 px-3 text-right">{row.guru}</TableCell>
 <TableCell className="py-3 px-3 text-right">{row.pegawai}</TableCell>
 <TableCell className="py-3 px-3 text-right font-black text-emerald-700 dark:text-emerald-300">{row.siswa}</TableCell>
 <TableCell className="py-3 px-3 text-right">{row.siswa_baru}</TableCell>
 <TableCell className="py-3 px-3 text-right text-emerald-600 font-bold">{row.mutasi_masuk}</TableCell>
 <TableCell className="py-3 px-3 text-right text-rose-600 font-bold">{row.mutasi_keluar}</TableCell>
 <TableCell className="py-3 px-3 text-right">{row.lulus}</TableCell>
 <TableCell className="py-3 px-3 text-right">{row.alumni}</TableCell>
 <TableCell className="py-3 px-3 text-right">{row.kelas}</TableCell>
 <TableCell className="py-3 px-4 text-right">{row.rombel}</TableCell>
 </TableRow>
 ))}
 {comparison_total && (
 <TableRow className="bg-emerald-50/80 font-black text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-200 border-t-2 border-emerald-300">
 <TableCell className="py-3.5 px-4 font-black">TOTAL KONSOLIDASI</TableCell>
 <TableCell className="py-3.5 px-3 text-right font-bold">{comparison_total.guru}</TableCell>
 <TableCell className="py-3.5 px-3 text-right font-bold">{comparison_total.pegawai}</TableCell>
 <TableCell className="py-3.5 px-3 text-right font-black text-sm text-emerald-800 dark:text-emerald-200">{comparison_total.siswa}</TableCell>
 <TableCell className="py-3.5 px-3 text-right font-bold">{comparison_total.siswa_baru}</TableCell>
 <TableCell className="py-3.5 px-3 text-right font-bold">{comparison_total.mutasi_masuk}</TableCell>
 <TableCell className="py-3.5 px-3 text-right font-bold">{comparison_total.mutasi_keluar}</TableCell>
 <TableCell className="py-3.5 px-3 text-right font-bold">{comparison_total.lulus}</TableCell>
 <TableCell className="py-3.5 px-3 text-right font-bold">{comparison_total.alumni}</TableCell>
 <TableCell className="py-3.5 px-3 text-right font-bold">{comparison_total.kelas}</TableCell>
 <TableCell className="py-3.5 px-4 text-right font-bold">{comparison_total.rombel}</TableCell>
 </TableRow>
 )}
 </TableBody>
 </TableRoot>
 </div>
 </section>

 {/* ── 5. EMERALD DATATABLE CONTAINER 2: TABEL RASIO & EFISIENSI ── */}
 <section className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-sm dark:bg-[#1B2433]">
 <div className="border-b border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 dark:bg-slate-900/50 p-5 dark:border-emerald-800/60">
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
 <Scale className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
 Tabel Rasio & Efisiensi Operasional Unit
 </h3>
 <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
 Analisis rasio kecukupan guru, kepadatan rombel, dan persentase kelulusan tahunan.
 </p>
 </div>

 <div className="overflow-x-auto">
 <TableRoot className="w-full text-left border-collapse text-xs min-w-[700px]">
 <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/60 dark:text-emerald-100 font-bold text-xs uppercase tracking-wider">
 <TableRow>
 <TableHead className="py-3.5 px-4">Unit Pendidikan</TableHead>
 <TableHead className="py-3.5 px-4 text-center">Rasio Siswa / Guru</TableHead>
 <TableHead className="py-3.5 px-4 text-center">Rasio Siswa / Rombel</TableHead>
 <TableHead className="py-3.5 px-4 text-center">Guru per Rombel</TableHead>
 <TableHead className="py-3.5 px-4 text-right">Pertumbuhan Siswa</TableHead>
 <TableHead className="py-3.5 px-4 text-right">Persentase Kelulusan</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-xs">
 {(ratio_table || []).map((row, idx) => (
 <TableRow key={idx} className="transition hover:bg-emerald-50/30 dark:hover:bg-emerald-950/30">
 <TableCell className="py-3 px-4 font-extrabold text-slate-900 dark:text-emerald-600">
 {row.unit_name}
 </TableCell>
 <TableCell className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-200">
 {row.siswa_guru}
 </TableCell>
 <TableCell className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-200">
 {row.siswa_rombel}
 </TableCell>
 <TableCell className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-200">
 {row.guru_rombel}
 </TableCell>
 <TableCell className="py-3 px-4 text-right font-black text-emerald-700 dark:text-emerald-400">
 {row.pertumbuhan_siswa}
 </TableCell>
 <TableCell className="py-3 px-4 text-right font-black text-blue-600 dark:text-blue-400">
 {row.persentase_kelulusan}
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </TableRoot>
 </div>
 </section>

 {/* ── 6. EXECUTIVE INSIGHTS ALERTS ── */}
 {insights && insights.length > 0 && (
 <div className="space-y-3">
 {insights.map((ins, idx) => (
 <Alert key={idx} status={ins.type === 'success' ? 'success' : ins.type === 'warning' ? 'warning' : 'info'}>
 <AlertIndicator />
 <AlertContent>
 <AlertTitle>{ins.title}</AlertTitle>
 <AlertDescription>{ins.description}</AlertDescription>
 </AlertContent>
 </Alert>
 ))}
 </div>
 )}

 {/* ── 7. PRINT & EXPORT MODALS ── */}
 <PrintOptionModal
 isOpen={isPrintModalOpen}
 onClose={() => setIsPrintModalOpen(false)}
 onPrint={handlePrintClean}
 onDownloadPdf={handleDownloadPdf}
 title="Cetak Laporan Komparasi Lintas Unit Pendidikan"
 />

 <ReportExportModal
 isOpen={isExportOpen}
 onClose={() => setIsExportOpen(false)}
 onConfirmExport={handleConfirmExport}
 defaultFormat={exportFormat}
 title="Export Laporan Komparasi Lintas Unit"
 />

 {/* Smart Floating Scroll Navigator */}
 <SmartScrollFab targetId="tabel-komparasi-lintas-unit" downTooltip="Langsung ke Tabel Komparasi" />
 </PageContainer>
 )
}
