import {
 KpiStatCard
} from '../components/app'
import AppModal from '../components/app/AppModal'
import {
  useToast
} from '../components/app/ToastProvider'
import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  CheckCircle2,
  Edit3,
  FileCheck,
  Filter,
  GraduationCap,
  HelpCircle,
  Layers,
  PenTool,
  Printer,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Sliders,
  Sparkles,
  UserCheck,
  Users,
  AlertTriangle,
  Check,
  X,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Award
} from 'lucide-react'
import {
  prayerAssessmentService
} from '../services/prayerAssessmentService'
import {
  kelasService
} from '../services/kelasService'
import {
  useAuthStore
} from '../stores/authStore'
import {
  useUnitStore
} from '../stores/unitStore'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import {
  useDebounce
} from '../hooks/useDebounce'
import {
  Pagination
} from '../components/ui/pagination'
import {
  printCleanTable
} from '../utils/printHelper'
import {
  SquircleActionButton,
  MasterDataPage
} from '../components/master-data'
import AppTabs from '../components/app/AppTabs'

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

function HeroUiFilterSelect({
 value,
 onChange,
 options = [],
 placeholder = 'Pilih...',
 disabled = false,
 searchable = false,
 widthClass = 'min-w-[160px]',
}) {
 const [isOpen, setIsOpen] = useState(false)
 const [search, setSearch] = useState('')
 const containerRef = useRef(null)

 useEffect(() => {
 const handleClickOutside = (e) => {
 if (containerRef.current && !containerRef.current.contains(e.target)) {
 setIsOpen(false)
 }
 }
 document.addEventListener('mousedown', handleClickOutside)
 return () => document.removeEventListener('mousedown', handleClickOutside)
 }, [])

 const selectedOption = options.find((opt) => String(opt.value) === String(value))
 const filteredOptions = searchable || options.length > 5
 ? options.filter((opt) => String(opt.label).toLowerCase().includes(search.toLowerCase()))
 : options

 return (
 <div ref={containerRef} className={`relative ${widthClass}`}>
 <button
 type="button"
 disabled={disabled}
 onClick={() => setIsOpen((prev) => !prev)}
 className={`w-full flex items-center justify-between gap-2 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs transition-all hover:border-emerald-300 dark:hover:border-emerald-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer`}
 >
 <span className="truncate">
 {selectedOption ? selectedOption.label : placeholder}
 </span>
 <ChevronDown
 className={`size-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
 isOpen ? 'rotate-180 text-emerald-600' : ''
 }`}
 />
 </button>

 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ opacity: 0, y: -4, scale: 0.98 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: -4, scale: 0.98 }}
 transition={{ duration: 0.15, ease: 'easeOut' }}
 className="absolute left-0 top-full z-[80] mt-1.5 w-full min-w-[220px] overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-white dark:bg-slate-800 p-1.5 shadow-xl shadow-slate-900/10 dark:shadow-black/40"
 >
 {(searchable || options.length > 5) && (
 <div className="mb-1.5 px-1 pt-1">
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Cari..."
 className="w-full rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900/60 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
 autoFocus
 />
 </div>
 )}
 <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5">
 {filteredOptions.length === 0 ? (
 <div className="py-2 text-center text-xs text-slate-400">Tidak ada pilihan</div>
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
 className={`flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer ${
 isSelected
 ? 'bg-emerald-50 text-emerald-700 font-bold dark:bg-emerald-950/60 dark:text-emerald-300'
 : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 font-medium'
 }`}
 >
 <span className="truncate">{opt.label}</span>
 {isSelected && <Check className="size-3.5 text-emerald-600 shrink-0" />}
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

function HarmonizedSaveScoresModal({ isOpen, onClose, onConfirm, studentName, classNameStr, totalEdited, isSubmitting }) {
 return (
 <AppModal
 isOpen={isOpen}
 onClose={() => { if (!isSubmitting) onClose() }}
 disableBackdropClose={isSubmitting}
 hideCloseButton={isSubmitting}
 badge="Simpan Penilaian"
 title="Simpan Nilai & Paraf Doa?"
 icon={CheckCircle2}
 maxWidth="max-w-md"
 zIndex="z-[70]"
 footer={
 <div className="flex w-full items-center justify-end gap-2.5">
 <button
 type="button"
 onClick={onClose}
 disabled={isSubmitting}
 className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
 >
 Batal
 </button>
 <button
 type="button"
 onClick={onConfirm}
 disabled={isSubmitting}
 className="inline-flex h-9.5 items-center gap-1.5 rounded-xl border-2 border-emerald-600 bg-emerald-600 px-5 text-xs font-black text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50 cursor-pointer"
 >
 {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
 Konfirmasi Simpan
 </button>
 </div>
 }
 >
 <div className="space-y-4">
 <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
 Nilai poin capaian doa dan status paraf guru penguji untuk santri/siswa berikut akan disimpan secara permanen ke database akademik.
 </p>
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 p-3.5 dark:bg-emerald-950/20">
 <p className="text-xs font-black text-emerald-950 dark:text-emerald-100">
 {studentName || 'Nama Siswa'} ({classNameStr || 'Kelas'})
 </p>
 <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-1">
 {totalEdited} Butir Penilaian Siap Diperbarui
 </p>
 </div>
 </div>
 </AppModal>
 )
}

export default function PoinPenilaianDoaPage() {
 const user = useAuthStore((state) => state.user)
 const activeUnit = useUnitStore((state) => state.activeUnit)

 // Toast notifications state
 const toast = useToast()
 const pushToast = (type, title, message = '') => {
 const tone = type === 'error' || type === 'danger' ? 'error' : type === 'warning' ? 'warning' : 'success'
 toast(message ? `${title}: ${message}` : title, tone)
 }

 // Roles permission check
 const roles = useMemo(() => {
 return (user?.roles || []).map((r) => (typeof r === 'string' ? r.toLowerCase() : (r.name || '').toLowerCase()))
 }, [user])

 const canManageSettings = useMemo(() => {
 return (
 user?.is_superadmin ||
 roles.some((r) =>
 ['super admin', 'admin', 'kepala sekolah', 'kepsek', 'divisi pendidikan', 'tata usaha', 'tu'].includes(r)
 )
 )
 }, [user, roles])

 // Mode: 'scoring' vs 'settings'
 const [activeTab, setActiveTab] = useState('scoring')

 // Master Items (62 Doa) & Grade Rules
 const [items, setItems] = useState([])
 const [gradeRules, setGradeRules] = useState([])
 const [loadingItems, setLoadingItems] = useState(true)

 // Filter Siswa untuk Mode Lembar Penilaian
 const [classes, setClasses] = useState([])
 const [selectedClassId, setSelectedClassId] = useState('')
 const [students, setStudents] = useState([])
 const [selectedStudentId, setSelectedStudentId] = useState('')
 const [loadingStudents, setLoadingStudents] = useState(false)

 // Lembar Penilaian Siswa
 const [studentSheet, setStudentSheet] = useState(null)
 const [editScores, setEditScores] = useState({})
 const [loadingSheet, setLoadingSheet] = useState(false)
 const [savingSheet, setSavingSheet] = useState(false)
 const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false)

 // State Edit Pengaturan (Mode Settings)
 const [editableItems, setEditableItems] = useState([])
 const [editableGrades, setEditableGrades] = useState([])
 const [savingSettings, setSavingSettings] = useState(false)

 // Search filter
 const [searchQuery, setSearchQuery] = useState('')
 const debouncedSearch = useDebounce(searchQuery, 350)

 // Pagination for Doa List
 const [currentPage, setCurrentPage] = useState(1)
 const perPage = 15

 const classOptions = useMemo(() => {
 return classes.map((c) => ({
 value: c.id,
 label: `Kelas ${c.nama_kelas} (${c.tingkat})`,
 }))
 }, [classes])

 const studentOptions = useMemo(() => {
 if (students.length === 0) {
 return [{ value: '', label: 'Tidak ada siswa di kelas ini' }]
 }
 return students.map((s) => ({
 value: s.id,
 label: `${s.nama_lengkap || s.name} (NIS: ${s.nis})`,
 }))
 }, [students])

 // 1. Muat Master Items & Grade Rules
 const loadMasterData = async () => {
 setLoadingItems(true)
 try {
 const [itemsRes, gradeRes] = await Promise.all([
 prayerAssessmentService.getItems(),
 prayerAssessmentService.getGradeRules(),
 ])
 if (itemsRes?.success) {
 setItems(itemsRes.data || [])
 setEditableItems(JSON.parse(JSON.stringify(itemsRes.data || [])))
 }
 if (gradeRes?.success) {
 setGradeRules(gradeRes.data || [])
 setEditableGrades(JSON.parse(JSON.stringify(gradeRes.data || [])))
 }
 } catch (err) {
 console.error('Error loading master prayer data:', err)
 pushToast('error', 'Gagal Memuat Data', 'Data target doa harian belum berhasil dimuat dari server.')
 } finally {
 setLoadingItems(false)
 }
 }

 // 2. Muat Kelas
 useEffect(() => {
 const loadClasses = async () => {
 try {
 const res = await kelasService.getAll()
 const list = Array.isArray(res) ? res : res?.data || []
 setClasses(list)
 if (list.length > 0 && !selectedClassId) {
 setSelectedClassId(list[0].id)
 }
 } catch (err) {
 console.error('Error loading classes:', err)
 }
 }
 loadClasses()
 loadMasterData()
 }, [])

 // 3. Muat Siswa saat Kelas Dipilih
 useEffect(() => {
 if (!selectedClassId) {
 setStudents([])
 setSelectedStudentId('')
 return
 }
 const loadStudents = async () => {
 setLoadingStudents(true)
 try {
 const res = await kelasService.getById(selectedClassId)
 const studentList = res?.students || res?.data?.students || []
 setStudents(studentList)
 if (studentList.length > 0) {
 setSelectedStudentId(studentList[0].id)
 } else {
 setSelectedStudentId('')
 setStudentSheet(null)
 }
 } catch (err) {
 console.error('Error loading students for class:', err)
 } finally {
 setLoadingStudents(false)
 }
 }
 loadStudents()
 }, [selectedClassId])

 // 4. Muat Lembar Penilaian Siswa saat Siswa Dipilih
 const loadStudentAssessment = async (studentId) => {
 if (!studentId) return
 setLoadingSheet(true)
 try {
 const res = await prayerAssessmentService.getStudentSheet(studentId)
 if (res?.success) {
 setStudentSheet(res)
 const initial = {}
 ;(res.items || []).forEach((row) => {
 initial[row.id] = {
 score: row.poin !== null ? row.poin : '',
 is_paraf: false,
 notes: row.notes || '',
 originalParaf: Boolean(row.paraf_name),
 }
 })
 setEditScores(initial)
 }
 } catch (err) {
 console.error('Error loading student sheet:', err)
 } finally {
 setLoadingSheet(false)
 }
 }

 useEffect(() => {
 if (selectedStudentId) {
 loadStudentAssessment(selectedStudentId)
 }
 }, [selectedStudentId])

 // Handler Nilai diubah
 const handleScoreChange = (itemId, val) => {
 setEditScores((prev) => ({
 ...prev,
 [itemId]: {
 ...prev[itemId],
 score: val,
 },
 }))
 }

 // Handler Paraf diklik
 const handleToggleParaf = (itemId) => {
 setEditScores((prev) => ({
 ...prev,
 [itemId]: {
 ...prev[itemId],
 is_paraf: !prev[itemId]?.is_paraf,
 },
 }))
 }

 // Simpan Lembar Penilaian Siswa
 const handleSaveStudentScores = async () => {
 if (!selectedStudentId) return
 setSavingSheet(true)
 try {
 const payload = Object.entries(editScores).map(([prayer_item_id, item]) => ({
 prayer_item_id,
 score: item.score !== '' && item.score !== null ? Number(item.score) : null,
 is_paraf: Boolean(item.is_paraf),
 notes: item.notes || null,
 }))

 await prayerAssessmentService.saveStudentScores(selectedStudentId, payload)
 pushToast('success', 'Berhasil Disimpan', 'Nilai poin dan paraf ujian hafalan doa telah diperbarui di database.')
 setIsConfirmSaveOpen(false)
 await loadStudentAssessment(selectedStudentId)
 } catch (err) {
 console.error('Error saving scores:', err)
 pushToast('error', 'Gagal Menyimpan', err?.response?.data?.message || 'Terjadi kesalahan saat menyimpan nilai.')
 } finally {
 setSavingSheet(false)
 }
 }

 // Simpan Pengaturan 62 Target Doa & Skala Grade
 const handleSaveSettings = async () => {
 setSavingSettings(true)
 try {
 const updatePromises = editableItems.map((item) =>
 prayerAssessmentService.updateItem(item.id, {
 order_number: Number(item.order_number),
 name: item.name,
 max_score: Number(item.max_score),
 passing_score: Number(item.passing_score),
 is_active: Boolean(item.is_active),
 })
 )
 const gradePromise = prayerAssessmentService.updateGradeRules(editableGrades)

 await Promise.all([...updatePromises, gradePromise])

 pushToast('success', 'Pengaturan Tersimpan', 'Perubahan daftar 62 doa dan skala grade berhasil diperbarui.')
 await loadMasterData()
 } catch (err) {
 console.error('Error saving settings:', err)
 pushToast('error', 'Gagal Menyimpan Pengaturan', err?.response?.data?.message || 'Periksa hak akses atau format inputan Anda.')
 } finally {
 setSavingSettings(false)
 }
 }

 // Filter daftar doa
 const filteredRows = useMemo(() => {
 const list = studentSheet?.items || items || []
 if (!debouncedSearch.trim()) return list
 const q = debouncedSearch.toLowerCase()
 return list.filter(
 (r) =>
 r.nama?.toLowerCase().includes(q) ||
 r.name?.toLowerCase().includes(q) ||
 String(r.no || r.order_number).includes(q)
 )
 }, [studentSheet, items, debouncedSearch])

 // Pagination calculation
 const totalPages = Math.max(1, Math.ceil(filteredRows.length / perPage))
 const paginatedRows = useMemo(() => {
 const start = (currentPage - 1) * perPage
 return filteredRows.slice(start, start + perPage)
 }, [filteredRows, currentPage, perPage])

 // Reset page when search changes
 useEffect(() => {
 setCurrentPage(1)
 }, [debouncedSearch])

 const handlePrint = () => {
 if (!filteredRows || filteredRows.length === 0) return
 const rows = filteredRows.map((r, idx) => [
 r.no || r.order_number || idx + 1,
 r.nama || r.name || '-',
 r.score ?? r.nilai ?? '-',
 r.max_score ?? 100,
 r.status || (Number(r.score) >= Number(r.passing_score || 75) ? 'Tuntas' : 'Perlu Bimbingan'),
 ])
 const studentTitle = selectedStudentObj ? `Siswa: ${selectedStudentObj.name} (${selectedClassObj?.name || '-'})` : 'Target Capaian Pembelajaran Doa'
 printCleanTable({
 title: 'LEMBAR PENILAIAN CAPAIAN DOA & DZIKIR',
 subtitle: studentTitle,
 headers: ['No', 'Materi Doa & Dzikir', 'Nilai', 'Skor Maks', 'Status'],
 rows,
 orientation: 'portrait',
 })
 }

 const selectedStudentObj = students.find((s) => s.id === selectedStudentId)
 const selectedClassObj = classes.find((c) => c.id === selectedClassId)

 return (
 <PageContainer maxW="7xl">
 {/* Breadcrumb */}
 <div className="mb-4 print:hidden">
 <AppBreadcrumb
 items={[
 { label: 'Dashboard', href: '/dashboard' },
 { label: 'Tahfizh & Mutabaah', href: '/mutabaah' },
 { label: 'Poin Penilaian Doa' },
 ]}
 />
 </div>

 {/* Modern Hero Header Card (HeroUI Standard) */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 !bg-[#D5F2E3] p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:!bg-[#112a22] print:hidden mb-6">
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
                <FileCheck className="size-6 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold bg-emerald-600 text-white shadow-xs border border-emerald-500/40 dark:border-emerald-600/50">
                    <Sparkles className="size-3 animate-pulse text-white" />
                    Kurikulum Doa Harian
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100/90 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    {loadingItems ? 'Memuat Target...' : items.length > 0 ? `${items.length} Target Doa` : 'Target Doa Harian'}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  Poin Penilaian Doa Harian
                </h1>
              </div>
            </div>

            {/* Action Buttons: Tab Switcher */}
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center flex-wrap">
              {canManageSettings && (
                <AppTabs
                  tabs={[
                    { id: 'scoring', label: 'Lembar Penilaian', icon: PenTool },
                    { id: 'settings', label: 'Pengaturan Grade', icon: Settings },
                  ]}
                  activeTab={activeTab}
                  onChange={setActiveTab}
                  ariaLabel="Mode lembar doa"
                />
              )}
            </div>
          </div>

          {/* Row 2: Deskripsi Full Width */}
          <div className="w-full pt-2 border-t border-emerald-500/20 dark:border-emerald-500/30">
            <p className="w-full text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
              Dokumen resmi kurikulum evaluasi hafalan target doa harian, paraf guru penguji, dan kalkulasi predikat A–D.
            </p>
          </div>
        </div>
      </div>

 <MasterDataPage className="doa-points-page space-y-6" hideBreadcrumb>
 {/* Modern KPI Cards Grid */}
 {(() => {
 const totalTargetDoa = items.length
 const totalSheetItems = studentSheet?.summary?.total_items ?? totalTargetDoa
 const passedCount = studentSheet?.summary?.passed_items ?? 0
 const testedCount = studentSheet?.summary?.tested_items ?? 0
 const avgScore = studentSheet?.summary?.average_score
 const hasTestedScore = Boolean(testedCount > 0 && avgScore !== undefined && avgScore !== null)
 const pctLulus = totalSheetItems > 0 ? Math.round((passedCount / totalSheetItems) * 100) : 0
 const pctTested = testedCount > 0 ? Math.round((passedCount / testedCount) * 100) : 0

 const validScores = items.map((i) => Number(i.passing_score)).filter((n) => !isNaN(n) && n > 0)
 const kkmMin = validScores.length > 0 ? Math.min(...validScores) : null
 const kkmMax = validScores.length > 0 ? Math.max(...validScores) : null
 const isKkmUniform = kkmMin !== null && kkmMin === kkmMax
 const kkmLabel = validScores.length === 0
 ? 'Pilih siswa untuk melihat nilai'
 : isKkmUniform
 ? `KKM Acuan: ${kkmMin.toFixed(1)}`
 : `KKM Bervariasi: ${kkmMin.toFixed(1)} - ${kkmMax.toFixed(1)}`

 return (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
 <ModernKpiCard
 title="Target Kurikulum Doa"
 value={loadingItems ? 'Memuat...' : `${totalTargetDoa} Doa`}
 subtext={totalTargetDoa > 0 ? 'Hafalan harian terstruktur' : 'Belum ada target doa'}
 icon={BookOpen}
 tone="emerald"
 tag="KURIKULUM"
 />
 <ModernKpiCard
 title="Rata-rata Skor Siswa"
 value={
 loadingSheet
 ? '...'
 : !selectedStudentId
 ? '—'
 : hasTestedScore
 ? `${avgScore}`
 : 'Belum Dinilai'
 }
 subtext={
 hasTestedScore && studentSheet?.summary?.grade_label
 ? `Grade ${studentSheet.summary.grade} (${studentSheet.summary.grade_label})`
 : !selectedStudentId
 ? kkmLabel
 : 'Belum ada butir doa yang dinilai'
 }
 icon={GraduationCap}
 tone="blue"
 tag="CAPAIAN NILAI"
 />
 <ModernKpiCard
 title="Doa Tuntas (Lulus KKM)"
 value={
 loadingSheet
 ? '...'
 : !selectedStudentId
 ? '—'
 : `${passedCount} / ${totalSheetItems} Doa`
 }
 subtext={
 !selectedStudentId
 ? 'Pilih siswa untuk melihat capaian'
 : totalSheetItems === 0
 ? 'Belum ada master target doa'
 : testedCount === 0
 ? '0% Target Tercapai (Belum ada doa diuji)'
 : `${pctLulus}% Kurikulum (${passedCount}/${totalSheetItems}) • Lulus Uji: ${pctTested}% (${passedCount}/${testedCount})`
 }
 icon={CheckCircle2}
 tone="purple"
 tag="PREDIKAT"
 />
 <ModernKpiCard
 title="Siswa Terpilih"
 value={selectedStudentObj?.nama_lengkap || selectedStudentObj?.name || 'Pilih Siswa'}
 subtext={selectedClassObj?.nama_kelas ? `Kelas: ${selectedClassObj.nama_kelas}` : 'Pilih dari filter kelas'}
 icon={Users}
 tone="amber"
 tag="IDENTITAS"
 />
 </div>
 )
 })()}

 {/* MODE 1: LEMBAR PENILAIAN SISWA */}
 {activeTab === 'scoring' && (
 <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-sm dark:bg-[#1B2433]">
 {/* Toolbar Baris 1 */}
 <div className="p-5 border-b border-emerald-200/80 dark:border-emerald-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4 dark:border-emerald-800/60 dark:bg-[#1B2433] print:hidden">
 <div className="flex items-center gap-3">
 <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-md shadow-xs">
 <PenTool className="w-5 h-5 text-slate-600" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Lembar Penilaian Doa</h2>
 <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
 {filteredRows.length} Butir Doa
 </span>
 </div>
 <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
 Input nilai poin 0-100 dan verifikasi paraf guru penguji per butir doa harian.
 </p>
 </div>
 </div>

 {/* Action Buttons */}
 <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
 <SquircleActionButton
 variant="print"
 icon={Printer}
 onClick={handlePrint}
 title="Cetak Lembar Penilaian Siswa"
 />
 <SquircleActionButton
 variant="sync"
 icon={RefreshCw}
 onClick={() => selectedStudentId && loadStudentAssessment(selectedStudentId)}
 disabled={loadingSheet || !selectedStudentId}
 title="Muat Ulang Data Siswa"
 />
 <button
 type="button"
 onClick={() => setIsConfirmSaveOpen(true)}
 disabled={savingSheet || !selectedStudentId}
 className="inline-flex items-center gap-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white px-4 py-2 text-xs font-bold shadow-sm hover:brightness-105 disabled:opacity-50 transition-all cursor-pointer"
 >
 <Save className="size-3.5" />
 <span>Simpan Nilai & Paraf</span>
 </button>
 </div>
 </div>

 {/* Toolbar Baris 2: Full-Width Search Input */}
 <div className="px-5 py-3.5 border-b border-emerald-200/80 dark:border-emerald-800/80 bg-slate-50/50 dark:bg-slate-900/50 dark:from-slate-900/60 dark:via-emerald-950/20 dark:to-slate-900/60 print:hidden">
 <div className="relative w-full">
 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-emerald-600/70 dark:text-emerald-400/70" />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Ketik nama doa harian atau nomor urut..."
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white py-2.5 pl-10 pr-10 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800/60 dark:bg-slate-800/90 dark:text-white"
 />
 {searchQuery && (
 <button
 type="button"
 onClick={() => setSearchQuery('')}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
 >
 <X className="size-4" />
 </button>
 )}
 </div>
 </div>

 {/* Toolbar Baris 3: Horizontal Filters (Pilih Kelas & Siswa) */}
 <div className="px-5 py-3 border-b border-emerald-200/80 dark:border-emerald-800/80 dark:border-emerald-800/60 bg-slate-50/70 dark:bg-slate-900/40 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
 <div className="flex flex-wrap items-center gap-3">
 <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold mr-1">
 <Filter className="size-3.5 text-emerald-600" />
 <span>Pilih Subjek:</span>
 </div>

 {/* Pilih Kelas */}
 <HeroUiFilterSelect
 value={selectedClassId}
 onChange={(val) => setSelectedClassId(val)}
 options={classOptions}
 placeholder="Pilih Kelas..."
 searchable={true}
 widthClass="min-w-[180px]"
 />

 {/* Pilih Siswa */}
 <HeroUiFilterSelect
 value={selectedStudentId}
 onChange={(val) => setSelectedStudentId(val)}
 options={studentOptions}
 disabled={loadingStudents || students.length === 0}
 placeholder="Pilih Siswa..."
 searchable={true}
 widthClass="min-w-[240px]"
 />
 </div>

 <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
 Menampilkan {paginatedRows.length} dari {filteredRows.length} butir doa
 </div>
 </div>

 {/* Header Cetak Formal (Hanya Tampil Saat Print) */}
 <div className="p-6 text-center border-b border-emerald-200/80 dark:border-emerald-800/60 hidden print:block">
 <h2 className="text-2xl font-black tracking-tight text-slate-900">
 LEMBAR PENILAIAN DOA HARIAN
 </h2>
 {studentSheet?.student && (
 <div className="mt-2 flex flex-wrap justify-center gap-6 text-xs text-slate-600">
 <span>
 Nama: <strong className="text-slate-900">{studentSheet.student.name}</strong>
 </span>
 <span>
 Kelas: <strong className="text-slate-900">{studentSheet.student.class}</strong>
 </span>
 <span>
 Tahun Ajaran: <strong className="text-slate-900">{studentSheet.student.academic_year || '2026/2027'}</strong>
 </span>
 </div>
 )}
 </div>

 {/* Table Penilaian Doa */}
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr className="border-b border-emerald-200/80 dark:border-emerald-800/60 bg-transparent text-emerald-950 dark:text-emerald-200 font-extrabold text-xs uppercase tracking-wider">
 <th className="w-16 py-3.5 px-4 bg-transparent text-center">No</th>
 <th className="py-3.5 px-4 bg-transparent">Doa-Doa Harian</th>
 <th className="hidden sm:table-cell w-36 py-3.5 px-4 bg-transparent">Kelompok</th>
 <th className="w-28 py-3.5 px-3 bg-transparent text-center">Poin (0-100)</th>
 <th className="w-36 py-3.5 px-4 bg-transparent text-center">Paraf Penguji</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {loadingSheet ? (
 <tr>
 <td colSpan="5" className="py-14 text-center text-slate-400">
 <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2 text-emerald-600" />
 <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Memuat lembar penilaian doa siswa...</p>
 </td>
 </tr>
 ) : paginatedRows.length === 0 ? (
 <tr>
 <td colSpan="5" className="py-14 text-center text-slate-400">
 <div className="flex flex-col items-center justify-center">
 <FileCheck className="size-10 text-emerald-400/50 mb-2" />
 <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">Tidak ada butir doa ditemukan</p>
 <p className="text-xs text-slate-500 max-w-sm mt-1">
 Periksa kata kunci pencarian atau muat ulang daftar master doa.
 </p>
 </div>
 </td>
 </tr>
 ) : (
 paginatedRows.map((row, idx) => {
 const scoreState = editScores[row.id] || {}
 const currentScore = scoreState.score
 const isParafed = scoreState.is_paraf || Boolean(row.paraf_name)

 return (
 <tr key={row.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
 <td className="py-3 px-4 text-center font-bold text-slate-900 dark:text-white">
 {row.no || row.order_number || (currentPage - 1) * perPage + idx + 1}
 </td>
 <td className="py-3 px-4">
 <div className="flex flex-wrap items-center gap-2">
 <span className="font-bold text-slate-900 dark:text-slate-100">{row.nama || row.name}</span>
 <span className="inline-block rounded px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80">
 KKM: {row.passing_score ?? row.kkm ?? 75}
 </span>
 </div>
 </td>
 <td className="hidden sm:table-cell py-3 px-4">
 {row.grup || row.group ? (
 <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
 {row.grup || row.group}
 </span>
 ) : (
 <span className="text-slate-400">-</span>
 )}
 </td>
 <td className="py-2 px-3 text-center">
 <input
 type="number"
 min="0"
 max="100"
 placeholder="-"
 value={currentScore !== undefined ? currentScore : ''}
 onChange={(e) => handleScoreChange(row.id, e.target.value)}
 className="w-20 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-2 py-1.5 text-center text-xs font-black text-slate-900 shadow-xs focus:border-emerald-600 focus:outline-none dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white"
 />
 </td>
 <td className="py-2 px-4 text-center">
 {row.paraf_name ? (
 <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
 <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
 <span className="truncate max-w-[120px]">{row.paraf_name}</span>
 </div>
 ) : (
 <button
 type="button"
 onClick={() => handleToggleParaf(row.id)}
 className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
 scoreState.is_paraf
 ? 'bg-emerald-600 text-white shadow-xs'
 : 'border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-emerald-700/80 dark:bg-emerald-950/60 dark:text-emerald-300'
 }`}
 >
 {scoreState.is_paraf ? '✓ Siap Paraf' : 'Paraf'}
 </button>
 )}
 </td>
 </tr>
 )
 })
 )}
 </tbody>
 </table>
 </div>

 {/* Pagination Footer */}
 {filteredRows.length > perPage && (
 <div className="px-5 py-3 border-t border-emerald-200/80 dark:border-emerald-800/80 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-[#1B2433] print:hidden">
 <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
 Halaman {currentPage} dari {totalPages} ({filteredRows.length} total doa)
 </p>
 <div className="flex items-center gap-1">
 <Pagination
 currentPage={currentPage}
 totalPages={totalPages}
 onPageChange={(page) => setCurrentPage(page)}
 sideLayout="full"
 />
 </div>
 </div>
 )}
 </div>
 )}

 {/* MODE 2: PENGATURAN MASTER 62 DOA & SKALA GRADE */}
 {activeTab === 'settings' && canManageSettings && (
 <div className="space-y-6">
 {/* Action Bar */}
 <div className="flex items-center justify-between rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 shadow-xs dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div>
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
 Konfigurasi Master Target Doa & Standar Grade
 </h3>
 <p className="text-xs font-medium text-slate-500 mt-0.5">
 Wewenang Kepala Sekolah, Divisi Pendidikan, dan Tata Usaha (TU) untuk mengatur kurikulum poin doa.
 </p>
 </div>
 <button
 type="button"
 onClick={handleSaveSettings}
 disabled={savingSettings}
 className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 dark:bg-slate-100 dark:text-slate-900 dark: px-5 py-2.5 text-xs font-bold shadow-sm transition-all hover:brightness-105 disabled:opacity-50 cursor-pointer text-white border border-emerald-200/80 dark:border-emerald-800/60 h-9 text-sm font-medium"
 >
 {savingSettings ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
 Simpan Seluruh Perubahan
 </button>
 </div>

 {/* Skala Konversi Grade */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 shadow-xs dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <h4 className="mb-3.5 text-xs font-black uppercase tracking-wider text-slate-500">
 1. Skala Konversi Nilai ke Grade & Predikat
 </h4>
 <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
 {editableGrades.map((g, idx) => (
 <div
 key={g.id || idx}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 p-3.5 dark:border-emerald-700/80 dark:bg-slate-800/60"
 >
 <div className="flex items-center justify-between">
 <span className="rounded-lg bg-emerald-700 px-2.5 py-0.5 text-xs font-black text-white">
 Grade {g.grade}
 </span>
 <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
 Urutan: {g.order_index}
 </span>
 </div>
 <div className="mt-2.5 space-y-2">
 <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
 Nama Predikat
 <input
 type="text"
 value={g.label}
 onChange={(e) => {
 const next = [...editableGrades]
 next[idx].label = e.target.value
 setEditableGrades(next)
 }}
 className="mt-1 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-2 text-xs font-bold text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
 />
 </label>
 <div className="grid grid-cols-2 gap-2">
 <label className="block text-[10px] font-semibold text-slate-500">
 Skor Min
 <input
 type="number"
 value={g.min_score}
 onChange={(e) => {
 const next = [...editableGrades]
 next[idx].min_score = Number(e.target.value)
 setEditableGrades(next)
 }}
 className="mt-0.5 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-1.5 text-center text-xs font-bold dark:border-slate-600 dark:bg-slate-700 dark:text-white"
 />
 </label>
 <label className="block text-[10px] font-semibold text-slate-500">
 Skor Max
 <input
 type="number"
 value={g.max_score}
 onChange={(e) => {
 const next = [...editableGrades]
 next[idx].max_score = Number(e.target.value)
 setEditableGrades(next)
 }}
 className="mt-0.5 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-1.5 text-center text-xs font-bold dark:border-slate-600 dark:bg-slate-700 dark:text-white"
 />
 </label>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Tabel Master Doa */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433] overflow-hidden">
 <div className="p-4 border-b border-emerald-200/80 dark:border-emerald-800/80 bg-slate-50/50 dark:bg-slate-900/50">
 <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
 {editableItems.length > 0 ? `2. Daftar ${editableItems.length} Doa Harian & Bobot Poin Maksimum` : '2. Daftar Doa Harian & Bobot Poin Maksimum'}
 </h4>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full border-collapse text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr className="border-b border-emerald-200/80 dark:border-emerald-800/60 bg-transparent text-emerald-950 dark:text-emerald-200 font-extrabold text-xs uppercase tracking-wider">
 <th className="w-16 px-3 py-3 text-center">No</th>
 <th className="px-4 py-3">Nama Doa-Doa Harian</th>
 <th className="w-36 px-3 py-3 text-center">Kelompok</th>
 <th className="w-28 px-3 py-3 text-center">Poin Maks</th>
 <th className="w-28 px-3 py-3 text-center">KKM</th>
 <th className="w-20 px-3 py-3 text-center">Aktif</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {editableItems.map((item, idx) => (
 <tr key={item.id || idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20">
 <td className="px-3 py-2 text-center">
 <input
 type="number"
 value={item.order_number}
 onChange={(e) => {
 const next = [...editableItems]
 next[idx].order_number = e.target.value
 setEditableItems(next)
 }}
 className="w-12 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-1 text-center font-bold text-slate-900 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white"
 />
 </td>
 <td className="px-4 py-2">
 <input
 type="text"
 value={item.name}
 onChange={(e) => {
 const next = [...editableItems]
 next[idx].name = e.target.value
 setEditableItems(next)
 }}
 className="w-full rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-1.5 font-bold text-slate-900 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white"
 />
 </td>
 <td className="px-3 py-2 text-center">
 <input
 type="text"
 value={item.group || ''}
 onChange={(e) => {
 const next = [...editableItems]
 next[idx].group = e.target.value
 setEditableItems(next)
 }}
 className="w-full rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-1 text-center text-xs dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white"
 />
 </td>
 <td className="px-3 py-2 text-center">
 <input
 type="number"
 value={item.max_score}
 onChange={(e) => {
 const next = [...editableItems]
 next[idx].max_score = e.target.value
 setEditableItems(next)
 }}
 className="w-16 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-1 text-center font-bold dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white"
 />
 </td>
 <td className="px-3 py-2 text-center">
 <input
 type="number"
 value={item.passing_score}
 onChange={(e) => {
 const next = [...editableItems]
 next[idx].passing_score = e.target.value
 setEditableItems(next)
 }}
 className="w-16 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-1 text-center font-bold text-emerald-700 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-emerald-400"
 />
 </td>
 <td className="px-3 py-2 text-center">
 <input
 type="checkbox"
 checked={Boolean(item.is_active)}
 onChange={(e) => {
 const next = [...editableItems]
 next[idx].is_active = e.target.checked
 setEditableItems(next)
 }}
 className="size-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
 />
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}

 {/* Harmonized Save Scores Modal */}
 <HarmonizedSaveScoresModal
 isOpen={isConfirmSaveOpen}
 onClose={() => setIsConfirmSaveOpen(false)}
 onConfirm={handleSaveStudentScores}
 studentName={selectedStudentObj?.nama_lengkap || selectedStudentObj?.name}
 classNameStr={selectedClassObj?.nama_kelas}
 totalEdited={Object.keys(editScores).length}
 isSubmitting={savingSheet}
 />


 </MasterDataPage>
 </PageContainer>
 )
}
