import { HeroUiHeader } from "../components/ui/HeroUiHeader"
import {
  KpiStatCard
} from '../components/app'
import {
  useToast
} from '../components/app/ToastProvider'
import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  Navigate
} from 'react-router-dom'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import PersonAvatar from '../components/ui/PersonAvatar'
import InAppEmbedViewerModal from '../components/portal/InAppEmbedViewerModal'
import {
  ClipboardList,
  BookOpen,
  Plus,
  Search,
  Edit3,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  X,
  Send,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Clock,
  SlidersHorizontal,
  FileText,
  Paperclip,
  Check,
  Eye,
  Award,
  Users,
  UserCheck,
  Globe,
  Lock,
  Info,
  Calendar,
  Sparkles,
  Printer,
  Upload,
  Download,
  FileSpreadsheet,
  RotateCcw,
  ExternalLink,
  Mic,
  Video,
  Bookmark,
  ChevronDown,
  School,
  Layers
} from 'lucide-react'
import {
  lmsPenugasanService
} from '../services/lmsPenugasanService'
import {
  subjectService
} from '../services/subjectService'
import {
  useAuthStore
} from '../stores/authStore'
import {
  useUnitStore
} from '../stores/unitStore'
import ActionDropdown from '../components/app/ActionDropdown'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import {
  printCleanTable,
  downloadPdfTable
} from '../utils/printHelper'
import {
  SquircleActionButton,
  PrintOptionModal,
} from '../components/master-data'
import AppDataTable from '../components/app/AppDataTable'
import MobileDataCard from '../components/app/MobileDataCard'
import {
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '../components/ui/table'
import CsvImportModal from '../components/master-data/CsvImportModal'
import {
  useDebounce
} from '../hooks/useDebounce'
import {
  downloadSpreadsheetTemplate
} from '../utils/spreadsheetParser'

// ── 1. DEFINISI TONE WARNA KARTU KPI MODERN ──
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

// ── 2. TOAST NOTIFICATION STACK HOOK ──
function useNotifications() {
 const toast = useToast()
 const push = (title, message, tone = 'success') => {
 toast(title, message, tone)
 }
 const dismiss = () => {}
 return { items: [], push, dismiss }
}

// ── HEROUI MODAL SELECT DROPDOWN COMPONENT ──
function HeroUiModalSelect({
 label,
 value,
 onChange,
 options = [],
 placeholder = '-- Pilih Opsi --',
 disabled = false,
 required = false,
 helperText = '',
 icon: IconComponent = null,
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
 return options.filter(
 (opt) =>
 (opt.label && String(opt.label).toLowerCase().includes(q)) ||
 (opt.subtext && String(opt.subtext).toLowerCase().includes(q))
 )
 }, [options, search, searchable])

 return (
 <div className="relative w-full" ref={containerRef}>
 {label && (
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
 {label} {required && <span className="text-rose-500">*</span>}
 </label>
 )}

 {/* Button Trigger HeroUI */}
 <button
 type="button"
 disabled={disabled}
 onClick={() => {
 if (!disabled) {
 setIsOpen((prev) => !prev)
 setSearch('')
 }
 }}
 className={`w-full flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 text-left cursor-pointer ${
 disabled
 ? 'bg-slate-100 dark:bg-slate-800/60 border-emerald-200/80 dark:border-emerald-800/60 text-slate-400 cursor-not-allowed'
 : isOpen
 ? 'border-[#059669] bg-white ring-4 ring-[#059669]/12 dark:border-[#10B981] dark:bg-slate-900 dark:ring-[#10B981]/20 text-slate-800 dark:text-slate-100 shadow-sm'
 : 'border-emerald-200/80 bg-slate-50/50 hover:bg-white hover:border-emerald-300 dark:border-emerald-800/80 dark:bg-slate-900/50 dark:hover:bg-slate-900 dark:hover:border-emerald-200/80 text-slate-800 dark:text-slate-100'
 }`}
 >
 <div className="flex items-center gap-2 truncate">
 {IconComponent && (
 <IconComponent className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
 )}
 {selectedOption ? (
 <span className="truncate">{selectedOption.label}</span>
 ) : (
 <span className="text-slate-400 dark:text-slate-500 truncate">{placeholder}</span>
 )}
 </div>
 <ChevronDown
 className={`size-4 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${
 isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
 }`}
 />
 </button>

 {/* Dropdown Popover Panel HeroUI */}
 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ opacity: 0, scale: 0.96, y: -4 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.96, y: -4 }}
 transition={{ duration: 0.15, ease: 'easeOut' }}
 className="absolute left-0 right-0 top-full mt-1.5 z-[90] overflow-hidden rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white/95 backdrop-blur-md shadow-2xl dark:border-emerald-800/80 dark:bg-[#182232]/95"
 >
 {/* Search Input jika searchable */}
 {searchable && options.length > 5 && (
 <div className="p-2 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <div className="relative">
 <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Ketik untuk mencari..."
 className="w-full rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/60 pl-8 pr-2.5 py-1.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#059669] focus:outline-none dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100"
 autoFocus
 />
 </div>
 </div>
 )}

 {/* List options */}
 <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
 {filteredOptions.length === 0 ? (
 <div className="px-3 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
 Tidak ada data yang cocok
 </div>
 ) : (
 filteredOptions.map((opt) => {
 const isSelected = String(opt.value) === String(value)
 return (
 <button
 key={opt.value}
 type="button"
 disabled={opt.disabled}
 onClick={() => {
 onChange(opt.value)
 setIsOpen(false)
 }}
 className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors text-left cursor-pointer ${
 isSelected
 ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
 : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300'
 }`}
 >
 <div className="truncate pr-2">
 <div>{opt.label}</div>
 {opt.subtext && (
 <div className="text-[10px] text-slate-400 font-normal">{opt.subtext}</div>
 )}
 </div>
 {isSelected && (
 <Check className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
 )}
 </button>
 )
 })
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {helperText && (
 <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
 {helperText}
 </p>
 )}
 </div>
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
 className={`absolute left-0 top-full mt-1.5 z-[90] ${popoverWidth} overflow-hidden rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white/95 backdrop-blur-md shadow-2xl dark:border-emerald-800/80 dark:bg-[#182232]/95`}
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

// ── 3. HARMONIZED BATCH EXPORT MODAL ──
function HarmonizedBatchExportModal({
 isOpen,
 onClose,
 onExport,
 isExporting,
 totalCount,
 moduleTitle = 'Penugasan & Asesmen',
}) {
 const [exportFormat, setExportFormat] = useState('xlsx')

 if (!isOpen) return null

 return (
 <div
 className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-fadeIn"
 role="dialog"
 aria-modal="true"
 tabIndex={-1}
 onMouseDown={(e) => {
 if (e.target === e.currentTarget && !isExporting) onClose()
 }}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="w-full max-w-lg"
 >
 <div className="flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 dark:border-emerald-800/60 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-[#182232]">

 <div className="flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-[#182232] shrink-0">
 <div className="flex items-center gap-3">
 <div className="rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 p-2.5 shadow-md shadow-xs shrink-0">
 <Download className="h-5 w-5 text-emerald-600" strokeWidth={2.2} />
 </div>
 <div>
 <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>Export Data {moduleTitle}</span>
 <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/60 dark:text-amber-400 dark:border-emerald-800/60">
 <Sparkles className="size-3" /> Unduh Data
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Pilih format berkas untuk mengekspor data sesuai filter aktif.
 </p>
 </div>
 </div>
 <button
 type="button"
 disabled={isExporting}
 onClick={onClose}
 className="size-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-sky-950/60 dark:text-sky-300 transition-colors cursor-pointer disabled:opacity-50"
 >
 <X className="size-4" />
 </button>
 </div>

 <div className="p-6 space-y-4 overflow-y-auto flex-1">
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 {[
 ['xlsx', 'Excel (.xlsx)', FileSpreadsheet, 'Format spreadsheet modern Microsoft Excel.'],
 ['xls', 'Excel (.xls)', FileSpreadsheet, 'Format kompatibilitas Excel 97-2003.'],
 ['csv', 'CSV (.csv)', FileText, 'Format teks koma terpisah universal.'],
 ].map(([value, label, Icon, desc]) => (
 <button
 key={value}
 type="button"
 onClick={() => setExportFormat(value)}
 className={`rounded-xl border p-4 text-left transition-all duration-200 cursor-pointer ${
 exportFormat === value
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/70 shadow-sm dark:border-emerald-800/60 dark:bg-emerald-950/40'
 : 'border-emerald-200/80 bg-white hover:border-emerald-300 dark:border-emerald-800/60 dark:bg-slate-900/40'
 }`}
 >
 <div className="flex items-center gap-2 mb-1.5">
 <Icon
 className={`size-4 ${
 exportFormat === value ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'
 }`}
 />
 <span className="text-xs font-black text-slate-900 dark:text-white">{label}</span>
 </div>
 <p className="text-[10px] text-slate-500 leading-snug">{desc}</p>
 </button>
 ))}
 </div>

 <div className="p-3.5 rounded-xl bg-amber-50/70 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/30 dark:border-emerald-800/60 text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
 <p className="font-bold flex items-center gap-1.5 mb-0.5">
 <Sparkles className="size-3.5 text-amber-600 dark:text-amber-400" />
 Filter Ekspor Aktif
 </p>
 <p className="text-xs text-amber-800/90 dark:text-amber-300/80">
 Data yang diekspor akan mencakup seluruh entitas terfilter ({totalCount} butir {moduleTitle.toLowerCase()}).
 </p>
 </div>
 </div>

 <div className="px-6 py-4 border-t border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-end gap-2.5 bg-slate-50/50 dark:bg-slate-900/40 shrink-0">
 <button
 type="button"
 onClick={onClose}
 className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200/80 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs dark:border-emerald-800/60 dark:bg-emerald-600 dark:text-slate-200 transition cursor-pointer text-sm font-medium"
 >
 Batal
 </button>
 <button
 type="button"
 disabled={isExporting}
 onClick={() => onExport(exportFormat)}
 className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-[#1B2433] px-5 py-2.5 text-xs font-extrabold shadow-sm hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60"
 >
 <Download className="size-4" />
 {isExporting ? 'Menyiapkan...' : 'Unduh Berkas'}
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )
}

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
 transition: { duration: 0.35, ease: 'easeOut' },
 },
}

export default function LmsPenugasanPage({ embedded = false, hideBreadcrumb = false, hidePageHeader = false, tabNav = null }) {
 const { items: toastList, push: pushToast, dismiss: dismissToast } = useNotifications()
 const user = useAuthStore((state) => state.user)
 const activeUnit = useUnitStore((state) => state.activeUnit)

 const userRoles = useMemo(() => {
 if (!user?.roles) return []
 return user.roles.map((r) => (typeof r === 'string' ? r : r.name || r.role_name || ''))
 }, [user])

 const isSupervisor = useMemo(() => {
 const rList = userRoles.map((r) => r.toLowerCase())
 const mainRole = String(user?.role || '').toLowerCase()
 const checkRole = (name) => rList.some((r) => r.includes(name)) || mainRole.includes(name)
 return (
 checkRole('super admin') ||
 checkRole('superadmin') ||
 checkRole('admin') ||
 checkRole('operator') ||
 checkRole('tata usaha') ||
 checkRole('tata_usaha') ||
 checkRole('tu') ||
 checkRole('kepala sekolah') ||
 checkRole('kepala_sekolah') ||
 checkRole('kepsek') ||
 checkRole('principal') ||
 checkRole('waka') ||
 checkRole('kurikulum') ||
 checkRole('divisi pendidikan') ||
 checkRole('divisi_pendidikan') ||
 checkRole('kabid') ||
 checkRole('yayasan')
 )
 }, [userRoles, user?.role])

 const isTeacherOnly = useMemo(() => {
 if (isSupervisor) return false
 const rList = userRoles.map((r) => r.toLowerCase())
 const mainRole = String(user?.role || '').toLowerCase()
 return (
 rList.some((r) => r.includes('guru') || r.includes('wali_kelas') || r.includes('wali kelas') || r.includes('musyrif') || r.includes('pembimbing')) ||
 mainRole.includes('guru')
 )
 }, [isSupervisor, userRoles, user?.role])

 const currentTeacherId = useMemo(() => {
 return user?.employee?.id || user?.employee_id || user?.teacher?.id || user?.teacher_id || user?.id || null
 }, [user])

 const userUnitId = useMemo(() => {
 const candidateIds = [
 user?.unit_id,
 user?.unit_pendidikan_id,
 user?.education_unit_id,
 user?.unit?.id,
 user?.education_unit?.id,
 user?.unit_pendidikan?.id,
 user?.employee?.unit_id,
 user?.employee?.unit_pendidikan_id,
 user?.employee?.education_unit_id,
 user?.school_info?.id,
 ].filter(Boolean)
 return candidateIds.length > 0 ? String(candidateIds[0]) : null
 }, [user])

 const isSuperAdminOrYayasan = useMemo(() => {
 const roles = (user?.roles || []).map((r) => (typeof r === 'string' ? r : r.name || ''))
 return roles.some((r) => ['super_admin', 'Super Admin', 'super-admin', 'yayasan', 'Yayasan', 'pengurus_yayasan', 'ketua_yayasan'].includes(r))
 }, [user])

 const isDivisiPendidikan = useMemo(() => {
 const roles = (user?.roles || []).map((r) => (typeof r === 'string' ? r : r.name || ''))
 return roles.some((r) => ['Divisi Pendidikan', 'divisi_pendidikan', 'divisi-pendidikan', 'Kepala Bidang Pendidikan', 'kepala_bidang_pendidikan', 'Divisi Kurikulum', 'Divisi Kesiswaan'].includes(r))
 }, [user])

 const canSelectUnit = isSuperAdminOrYayasan || isDivisiPendidikan
 const userUnitName = user?.unit_name || user?.employee?.unit?.nama_unit || user?.employee?.unit?.name || 'Unit Anda'
 const [selectedUnit, setSelectedUnit] = useState(canSelectUnit ? '' : (userUnitId ? String(userUnitId) : ''))

 const [dataPenugasan, setDataPenugasan] = useState([])
 const [options, setOptions] = useState({
 units: [],
 modul_ajar: [],
 kelas: [],
 guru: [],
 subjects: [],
 semesters: [],
 tahun_ajaran: [],
 tipe: [
 { value: 'individu', label: 'Individu' },
 { value: 'kelompok', label: 'Kelompok' },
 ],
 jenis: [
 { value: 'tertulis', label: 'Tertulis (Teks / Foto)', cara: 'Teks / foto', penilaian: 'Manual' },
 { value: 'quiz', label: 'Kuis Formatif (Jawaban di Aplikasi)', cara: 'Jawaban di aplikasi', penilaian: 'Otomatis / manual' },
 { value: 'esai', label: 'Esai (Teks Panjang)', cara: 'Teks panjang', penilaian: 'Manual' },
 { value: 'dokumen', label: 'Unggah Dokumen (PDF / DOCX)', cara: 'PDF / DOCX', penilaian: 'Manual' },
 { value: 'praktik', label: 'Praktik (Foto / Video)', cara: 'Foto / video', penilaian: 'Manual' },
 { value: 'tahfizh', label: 'Tahfizh (Setoran Langsung / Audio / Video)', cara: 'Setoran langsung / audio / video', penilaian: 'Rubrik guru' },
 { value: 'literasi', label: 'Literasi (Teks / Audio)', cara: 'Teks / audio', penilaian: 'Manual' },
 { value: 'proyek', label: 'Proyek Kelompok (File / Laporan / Presentasi)', cara: 'File / laporan / presentasi', penilaian: 'Manual / rubrik' },
 { value: 'tugas', label: 'Tugas Mandiri / PR (Umum)', cara: 'Umum', penilaian: 'Manual' },
 { value: 'latihan', label: 'Latihan Soal (Umum)', cara: 'Umum', penilaian: 'Manual' },
 ],
 status: [
 { value: 'dipublikasikan', label: 'Dipublikasikan' },
 { value: 'draft', label: 'Draft' },
 ],
 })

 const [stats, setStats] = useState({
 total: 0,
 published: 0,
 draft: 0,
 total_pengumpulan: 0,
 total_dinilai: 0,
 })

 const [loading, setLoading] = useState(true)
 const [errorMsg, setErrorMsg] = useState('')
 const [successMsg, setSuccessMsg] = useState('')

 // Filters & Pagination with Debounce
 const [searchInput, setSearchInput] = useState('')
 const debouncedSearch = useDebounce(searchInput, 350)
 const [selectedModulAjar, setSelectedModulAjar] = useState('')
 const [selectedTipe, setSelectedTipe] = useState('')
 const [selectedStatus, setSelectedStatus] = useState('')
 const [selectedKelas, setSelectedKelas] = useState('')
 const [selectedGuru, setSelectedGuru] = useState('')
 const [page, setPage] = useState(1)
 const [pagination, setPagination] = useState({
 current_page: 1,
 last_page: 1,
 total: 0,
 per_page: 15,
 })

 // Print, Export & Import State
 const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
 const [importOpen, setImportOpen] = useState(false)
 const [isExportModalOpen, setIsExportModalOpen] = useState(false)
 const [isExporting, setIsExporting] = useState(false)
 const [deleteTarget, setDeleteTarget] = useState(null)
 const [isDeleting, setIsDeleting] = useState(false)

 // Harmonized Save / Update & Error Confirmation Modal State
 const [confirmSaveModal, setConfirmSaveModal] = useState({
 isOpen: false,
 mode: 'create', // 'create' | 'update'
 })
 const [errorDialogModal, setErrorDialogModal] = useState({
 isOpen: false,
 title: '',
 message: '',
 })

 const handleExportSpreadsheet = (format = 'xlsx') => {
 try {
 setIsExporting(true)
 if (!dataPenugasan.length) {
 pushToast('Data Kosong', 'Tidak ada data penugasan untuk diekspor.', 'warning')
 return
 }
 const exportData = dataPenugasan.map((item, idx) => ({
 'No': idx + 1,
 'ID': item.id,
 'Judul Penugasan': item.judul || item.judul_tugas || '-',
 'Modul Ajar': item.modul_ajar?.judul || '-',
 'Kelas': item.kelas?.nama_kelas || item.kelas?.name || 'Semua Kelas',
 'Guru Pengampu': item.guru?.nama || item.guru?.nama_lengkap || '-',
 'Tipe': item.tipe || 'individu',
 'Jenis Tugas': item.jenis_tugas || 'tugas',
 'Nilai Maksimal': item.nilai_maksimal || 100,
 'Bobot Nilai (%)': item.bobot_persen ?? 10,
 'Tanggal Mulai': item.tanggal_mulai || '-',
 'Deadline': item.deadline || item.tanggal_selesai || '-',
 'Total Pengumpulan': item.total_pengumpulan ?? 0,
 'Total Dinilai': item.total_dinilai ?? 0,
 'Status': item.is_published || item.status === 'dipublikasikan' ? 'Dipublikasikan' : 'Draft',
 }))
 downloadSpreadsheetTemplate(
 exportData,
 `penugasan_siswa_${new Date().toISOString().slice(0, 10)}`,
 format,
 'Penugasan'
 )
 setIsExportModalOpen(false)
 pushToast('Export Berhasil', `Berkas Penugasan .${format.toUpperCase()} berhasil diunduh.`, 'success')
 } catch (err) {
 pushToast('Gagal Export', err?.message || 'Terjadi kesalahan saat menyiapkan berkas ekspor.', 'error')
 } finally {
 setIsExporting(false)
 }
 }

 const handleImport = (file) => {
 pushToast('Import Berhasil', `File ${file.name} telah diproses.`, 'success')
 }

 // Modal Form State (Create / Edit Penugasan)
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [editId, setEditId] = useState(null)
 const [formLoading, setFormLoading] = useState(false)

 const [formData, setFormData] = useState({
 judul: '',
 deskripsi: '',
 instruksi: '',
 tipe: 'individu',
 jenis_tugas: 'tertulis',
 nilai_maksimal: 100,
 bobot_persen: 10,
 tanggal_mulai: '',
 tanggal_selesai: '',
 izin_kumpul_terlambat: true,
 status: 'dipublikasikan',
 lampiran: '',
 link_lampiran: '',
 metadata: {
 surah: '',
 ayat_awal: '',
 ayat_akhir: '',
 metode_setoran: 'langsung',
 min_words: 150,
 max_group_members: 4,
 rubrik: { kelancaran: 40, tajwid: 40, adab: 20 },
 soal_kuis: [],
 },
 modul_ajar_id: '',
 mata_pelajaran_id: '',
 kelas_id: '',
 guru_id: '',
 semester_id: '',
 tahun_ajaran_id: '',
 })

 // In-App Embed Viewer Modal State (Never leave dashboard/app)
 const [embedViewer, setEmbedViewer] = useState({
 isOpen: false,
 url: '',
 title: '',
 subtitle: '',
 })

 const handleOpenEmbed = (url, title = 'Lampiran Tugas', subtitle = 'Pratinjau Dalam Aplikasi') => {
 if (!url) return
 setEmbedViewer({
 isOpen: true,
 url,
 title,
 subtitle,
 })
 }

 // Hover & Row Detail Modal State
 const [rowDetailItem, setRowDetailItem] = useState(null)
 const [showRowDetailModal, setShowRowDetailModal] = useState(false)

 // Drawer / Detail Modal for Student Submissions & Grading
 const [isDetailOpen, setIsDetailOpen] = useState(false)
 const [selectedPenugasan, setSelectedPenugasan] = useState(null)
 const [gradingStudentId, setGradingStudentId] = useState(null)
 const [gradingForm, setGradingForm] = useState({
 nilai_guru: '',
 catatan_guru: '',
 status: 'dinilai',
 })
 const [gradingLoading, setGradingLoading] = useState(false)

 useEffect(() => {
 fetchOptions()
 fetchStats()
 }, [userUnitId, activeUnit, selectedUnit, isTeacherOnly, currentTeacherId, selectedGuru])

 useEffect(() => {
 fetchPenugasan()
 }, [page, debouncedSearch, selectedUnit, selectedModulAjar, selectedTipe, selectedStatus, selectedKelas, selectedGuru, userUnitId, activeUnit, isTeacherOnly, currentTeacherId])

 const fetchOptions = async () => {
 try {
 const params = {}
 const effectiveUnit = canSelectUnit ? (selectedUnit || undefined) : (userUnitId || undefined)
 if (effectiveUnit) params.unit_pendidikan_id = effectiveUnit
 if (activeUnit) params.jenjang = activeUnit

 const [resOptions, resSubjects] = await Promise.allSettled([
 lmsPenugasanService.getOptions(params),
 subjectService.getDaftar({ ...params, status: 1, per_page: 100 }),
 ])

 const data = resOptions.status === 'fulfilled' ? resOptions.value?.data || resOptions.value || {} : {}
 let dbSubjectsRaw = resSubjects.status === 'fulfilled' ? resSubjects.value?.data || resSubjects.value || [] : []
 if (Array.isArray(dbSubjectsRaw?.data)) dbSubjectsRaw = dbSubjectsRaw.data

 let dbSubjects = Array.isArray(dbSubjectsRaw) ? dbSubjectsRaw.filter((s) => {
 if (!s) return false
 const sUnitId = s.unit_pendidikan_id || s.unit_id || s.education_unit_id
 if (!canSelectUnit && userUnitId && sUnitId) return String(sUnitId) === String(userUnitId)
 if (canSelectUnit && selectedUnit && sUnitId) return String(sUnitId) === String(selectedUnit)
 if (activeUnit && s.jenjang) return s.jenjang === activeUnit || s.jenjang === 'All'
 return true
 }) : []

 if (data) {
 setOptions((prev) => ({
 ...prev,
 units: data.units || [],
 modul_ajar: data.modul_ajar || data.modulAjar || [],
 kelas: data.kelas || data.classes || [],
 guru: data.guru || data.teachers || [],
 subjects: dbSubjects.length > 0 ? dbSubjects : (data.subjects || []).filter((s) => {
 const sUnitId = s.unit_pendidikan_id || s.unit_id
 if (!canSelectUnit && userUnitId && sUnitId) return String(sUnitId) === String(userUnitId)
 if (canSelectUnit && selectedUnit && sUnitId) return String(sUnitId) === String(selectedUnit)
 return true
 }),
 semesters: data.semesters || [],
 tahun_ajaran: data.tahun_ajaran || data.academic_years || [],
 }))
 }
 } catch (err) {
 console.error('Gagal memuat opsi penugasan:', err)
 }
 }

 const fetchStats = async () => {
 try {
 const params = {}
 const effectiveUnit = canSelectUnit ? (selectedUnit || undefined) : (userUnitId || undefined)
 if (effectiveUnit) params.unit_pendidikan_id = effectiveUnit
 if (activeUnit) params.jenjang = activeUnit
 if (isTeacherOnly && currentTeacherId) {
 params.guru_id = currentTeacherId
 } else if (selectedGuru) {
 params.guru_id = selectedGuru
 }
 const res = await lmsPenugasanService.getStats(params)
 if (res.success && res.data) {
 setStats(res.data)
 }
 } catch (err) {
 console.error('Gagal memuat statistik:', err)
 }
 }

 const fetchPenugasan = async () => {
 setLoading(true)
 setErrorMsg('')
 try {
 const params = {
 page,
 per_page: 15,
 search: debouncedSearch,
 modul_ajar_id: selectedModulAjar,
 tipe: selectedTipe,
 status: selectedStatus,
 kelas_id: selectedKelas,
 }
 const effectiveUnit = canSelectUnit ? (selectedUnit || undefined) : (userUnitId || undefined)
 if (effectiveUnit) params.unit_pendidikan_id = effectiveUnit
 if (activeUnit) params.jenjang = activeUnit
 if (isTeacherOnly && currentTeacherId) {
 params.guru_id = currentTeacherId
 } else if (selectedGuru) {
 params.guru_id = selectedGuru
 }

 const res = await lmsPenugasanService.getDaftar(params)
 const resObj = res?.data || res
 let list = Array.isArray(resObj) ? resObj : (resObj?.data || (Array.isArray(res) ? res : []))
 let filteredList = list.filter((item) => {
 if (!item) return false
 const itemUnitId = item.unit_pendidikan_id || item.unit_id || item.mata_pelajaran?.unit_pendidikan_id
 if (!canSelectUnit && userUnitId && itemUnitId && String(itemUnitId) !== String(userUnitId)) {
 return false
 }
 if (canSelectUnit && selectedUnit && itemUnitId && String(itemUnitId) !== String(selectedUnit)) {
 return false
 }
 if (isTeacherOnly) {
 const ownerIds = [
 user?.id,
 user?.employee?.id,
 user?.employee_id,
 user?.teacher?.id,
 user?.teacher_id,
 ].filter(Boolean).map(String)
 const itemGuruId = String(item.guru_id || item.teacher_id || item.guru?.id || '')
 const itemCreatedBy = String(item.created_by || '')
 if (!ownerIds.includes(itemGuruId) && !ownerIds.includes(itemCreatedBy)) {
 return false
 }
 } else if (selectedGuru) {
 const itemGuruId = String(item.guru_id || item.teacher_id || item.guru?.id || '')
 if (itemGuruId !== String(selectedGuru)) {
 return false
 }
 }
 return true
 })
 setDataPenugasan(filteredList)
 setPagination({
 current_page: resObj?.current_page || res?.meta?.current_page || 1,
 last_page: resObj?.last_page || res?.meta?.last_page || 1,
 total: resObj?.total || res?.meta?.total || filteredList.length,
 per_page: resObj?.per_page || res?.meta?.per_page || 15,
 })
 } catch (err) {
 console.error('Gagal memuat data penugasan:', err)
 setErrorMsg('Gagal mengambil data penugasan dari server.')
 } finally {
 setLoading(false)
 }
 }

 const handleOpenCreateModal = () => {
 setEditId(null)
 setFormData({
 judul: '',
 deskripsi: '',
 instruksi: '',
 tipe: 'individu',
 jenis_tugas: 'tertulis',
 nilai_maksimal: 100,
 bobot_persen: 10,
 tanggal_mulai: new Date().toISOString().slice(0, 16),
 tanggal_selesai: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
 izin_kumpul_terlambat: true,
 status: 'dipublikasikan',
 lampiran: '',
 link_lampiran: '',
 metadata: {
 surah: '',
 ayat_awal: '',
 ayat_akhir: '',
 metode_setoran: 'langsung',
 min_words: 150,
 max_group_members: 4,
 rubrik: { kelancaran: 40, tajwid: 40, adab: 20 },
 soal_kuis: [],
 },
 modul_ajar_id: options.modul_ajar[0]?.value || '',
 mata_pelajaran_id: options.subjects[0]?.value || '',
 kelas_id: options.kelas[0]?.value || '',
 guru_id: (isTeacherOnly && currentTeacherId) ? currentTeacherId : (options.guru[0]?.value || ''),
 semester_id: options.semesters[0]?.value || '',
 tahun_ajaran_id: options.tahun_ajaran[0]?.value || '',
 })
 setIsModalOpen(true)
 }

 const handleOpenEditModal = (item) => {
 setEditId(item.id)
 let meta = {}
 try {
 meta = typeof item.metadata === 'string' ? JSON.parse(item.metadata || '{}') : (item.metadata || {})
 } catch {
 meta = {}
 }
 setFormData({
 judul: item.judul || item.judul_tugas || '',
 deskripsi: item.deskripsi || '',
 instruksi: item.instruksi || '',
 tipe: item.tipe || item.tipe_tugas || 'individu',
 jenis_tugas: item.jenis_tugas || 'tertulis',
 nilai_maksimal: item.nilai_maksimal ?? 100,
 bobot_persen: item.bobot_persen ?? 10,
 tanggal_mulai: item.tanggal_mulai ? item.tanggal_mulai.replace(' ', 'T').slice(0, 16) : '',
 tanggal_selesai: item.tanggal_selesai ? item.tanggal_selesai.replace(' ', 'T').slice(0, 16) : '',
 izin_kumpul_terlambat: Boolean(item.izin_kumpul_terlambat),
 status: item.status || (item.is_published ? 'dipublikasikan' : 'draft'),
 lampiran: item.lampiran || item.file_lampiran || '',
 link_lampiran: item.link_lampiran || meta?.link_lampiran || '',
 metadata: {
 surah: meta?.surah || '',
 ayat_awal: meta?.ayat_awal || '',
 ayat_akhir: meta?.ayat_akhir || '',
 metode_setoran: meta?.metode_setoran || 'langsung',
 min_words: meta?.min_words || 150,
 max_group_members: meta?.max_group_members || 4,
 rubrik: meta?.rubrik || { kelancaran: 40, tajwid: 40, adab: 20 },
 soal_kuis: meta?.soal_kuis || [],
 },
 modul_ajar_id: item.modul_ajar_id || '',
 mata_pelajaran_id: item.mata_pelajaran_id || '',
 kelas_id: item.kelas_id || '',
 guru_id: item.guru_id || ((isTeacherOnly && currentTeacherId) ? currentTeacherId : ''),
 semester_id: item.semester_id || '',
 tahun_ajaran_id: item.tahun_ajaran_id || '',
 })
 setIsModalOpen(true)
 }

 // Step 1: Validasi form dan buka modal konfirmasi simpan / perbarui
 const handleFormSubmit = (e) => {
 e.preventDefault()
 if (!formData.judul?.trim()) {
 setErrorDialogModal({
 isOpen: true,
 title: 'Judul Penugasan Kosong',
 message: 'Silakan isi judul penugasan sebelum melanjutkan proses penyimpanan.',
 })
 return
 }

 setConfirmSaveModal({
 isOpen: true,
 mode: editId ? 'update' : 'create',
 })
 }

 // Step 2: Eksekusi simpan setelah disetujui di modal konfirmasi
 const handleExecuteSave = async () => {
 setFormLoading(true)
 setErrorMsg('')

 try {
 const payload = { ...formData }
 if (isTeacherOnly && currentTeacherId) {
 payload.guru_id = currentTeacherId
 }
 if (editId) {
 await lmsPenugasanService.update(editId, payload)
 pushToast('Penugasan Diperbarui', `Penugasan "${payload.judul}" berhasil diperbarui.`, 'success')
 } else {
 await lmsPenugasanService.create(payload)
 pushToast('Penugasan Ditambahkan', `Penugasan baru "${payload.judul}" berhasil ditambahkan.`, 'success')
 }
 setConfirmSaveModal({ isOpen: false, mode: 'create' })
 setIsModalOpen(false)
 fetchPenugasan()
 fetchStats()
 } catch (err) {
 setConfirmSaveModal({ isOpen: false, mode: 'create' })
 const errorText = err?.response?.data?.message || err?.message || 'Gagal memproses data penugasan.'
 setErrorMsg(errorText)
 setErrorDialogModal({
 isOpen: true,
 title: editId ? 'Gagal Memperbarui Penugasan' : 'Gagal Menyimpan Penugasan',
 message: errorText,
 })
 } finally {
 setFormLoading(false)
 }
 }

 const handleRequestDelete = (item) => {
 setDeleteTarget(item)
 }

 const handleConfirmDelete = async () => {
 if (!deleteTarget?.id) return
 setIsDeleting(true)
 try {
 await lmsPenugasanService.delete(deleteTarget.id)
 pushToast('Penugasan Dihapus', `Penugasan "${deleteTarget.judul || deleteTarget.judul_tugas}" berhasil dihapus.`, 'success')
 setDeleteTarget(null)
 fetchPenugasan()
 fetchStats()
 } catch (err) {
 const errorText = err?.response?.data?.message || err?.message || 'Gagal menghapus penugasan.'
 pushToast('Gagal Menghapus', errorText, 'error')
 setErrorDialogModal({
 isOpen: true,
 title: 'Gagal Menghapus Penugasan',
 message: errorText,
 })
 } finally {
 setIsDeleting(false)
 }
 }

 const handleTogglePublish = async (item) => {
 try {
 const res = await lmsPenugasanService.togglePublish(item.id)
 if (res.success) {
 pushToast('Status Diperbarui', res.message || 'Status publikasi penugasan berhasil diperbarui.', 'success')
 fetchPenugasan()
 fetchStats()
 }
 } catch (err) {
 setErrorMsg(err?.response?.data?.message || 'Gagal mengubah status publikasi.')
 }
 }

 const handleOpenDetail = async (item) => {
 setSelectedPenugasan(item)
 setIsDetailOpen(true)
 try {
 const res = await lmsPenugasanService.getById(item.id)
 if (res.success && res.data) {
 setSelectedPenugasan(res.data)
 }
 } catch (err) {
 console.error('Gagal mengambil detail penugasan:', err)
 }
 }

 const handleStartGrading = (submission) => {
 setGradingStudentId(submission.siswa_id)
 setGradingForm({
 nilai_guru: submission.nilai_guru !== null ? submission.nilai_guru : '',
 catatan_guru: submission.catatan_guru || '',
 status: 'dinilai',
 })
 }

 const handleSaveGrade = async (e) => {
 e.preventDefault()
 if (!selectedPenugasan || !gradingStudentId) return

 setGradingLoading(true)
 try {
 const payload = {
 siswa_id: gradingStudentId,
 nilai_guru: parseFloat(gradingForm.nilai_guru),
 catatan_guru: gradingForm.catatan_guru,
 status: 'dinilai',
 }

 const res = await lmsPenugasanService.gradeSubmission(selectedPenugasan.id, payload)
 if (res.success) {
 pushToast('Nilai Disimpan', 'Nilai tugas siswa berhasil disimpan.', 'success')
 setGradingStudentId(null)
 // Refresh detail
 const updated = await lmsPenugasanService.getById(selectedPenugasan.id)
 if (updated.success) {
 setSelectedPenugasan(updated.data)
 }
 fetchPenugasan()
 fetchStats()
 }
 } catch (err) {
 pushToast('Gagal Menyimpan', err?.response?.data?.message || 'Gagal menyimpan nilai.', 'error')
 } finally {
 setGradingLoading(false)
 }
 }


  // Canonical Columns for Penugasan & Proyek Siswa
  const penugasanColumns = useMemo(() => [
    {
      key: 'judul',
      label: 'Penugasan & Modul Ajar',
      width: '35%',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-800 dark:text-white line-clamp-2">
            {item?.judul || item?.judul_tugas}
          </div>
          {item?.modul_ajar && (
            <div className="flex items-center gap-1 text-xs text-[#059669] dark:text-emerald-400 mt-1 font-medium">
              <BookOpen size={12} className="shrink-0" />
              <span className="line-clamp-1">{item.modul_ajar.judul}</span>
            </div>
          )}
          {item?.lampiran && (
            <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
              <Paperclip size={10} className="shrink-0" />
              <span className="truncate max-w-[200px]">{item.lampiran}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'kelas_guru',
      label: 'Kelas & Pengajar',
      width: '24%',
      render: (item) => (
        <div>
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {item?.kelas?.nama_kelas || 'Semua Kelas'}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            Guru: {item?.guru?.nama || '-'}
          </div>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium mt-1 ${
              item?.tipe === 'kelompok' || item?.tipe_tugas === 'kelompok'
                ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-emerald-200/80 dark:border-emerald-800/60'
                : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-emerald-200/80 dark:border-emerald-800/60'
            }`}
          >
            {item?.tipe === 'kelompok' || item?.tipe_tugas === 'kelompok' ? 'Kelompok' : 'Individu'} ({item?.nilai_maksimal || 100} poin)
          </span>
        </div>
      ),
    },
    {
      key: 'deadline_pengumpulan',
      label: 'Tenggat & Evaluasi',
      width: '23%',
      render: (item) => (
        <div>
          <div className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Clock size={12} className="text-slate-400 shrink-0" />
            <span>{item?.deadline || item?.tanggal_selesai || '-'}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs font-bold text-slate-800 dark:text-white">
              {item?.total_pengumpulan ?? 0} Siswa Kumpul
            </span>
            {item?.total_dinilai > 0 && (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                {item.total_dinilai} dinilai
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '12%',
      render: (item) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleTogglePublish(item)
          }}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            item?.is_published || item?.status === 'dipublikasikan'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-amber-100'
          }`}
        >
          {item?.is_published || item?.status === 'dipublikasikan' ? (
            <>
              <Globe size={12} />
              <span>Publik</span>
            </>
          ) : (
            <>
              <Lock size={12} />
              <span>Draft</span>
            </>
          )}
        </button>
      ),
    },
  ], [])

 const pageContent = (
 <div className="lms-penugasan-page space-y-6">
 <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
 {/* ── MODERN VIVID EMERALD HERO HEADER CARD ── */}
 {!embedded && !hidePageHeader && (
 <HeroUiHeader
          title="Penugasan & Asesmen"
          subtitle="Pemberian tugas individu, kelompok, proyek, dan portofolio siswa beserta instruksi, tenggat, dan rubrik penilaian."
          badge="LMS Penugasan & Asesmen"
          icon={ClipboardList}
          className="mb-6"
        />
 )}

 {/* Alert Notifications */}
 {errorMsg && (
 <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between text-sm animate-fade-in">
 <div className="flex items-center gap-2">
 <AlertCircle size={18} />
 <span>{errorMsg}</span>
 </div>
 <button onClick={() => setErrorMsg('')} className="text-red-500 hover:text-red-700">
 <X size={16} />
 </button>
 </div>
 )}

 {successMsg && (
 <div className="bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-700 px-4 py-3 rounded-xl flex items-center justify-between text-sm animate-fade-in">
 <div className="flex items-center gap-2">
 <CheckCircle2 size={18} />
 <span>{successMsg}</span>
 </div>
 <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-700">
 <X size={16} />
 </button>
 </div>
 )}

 {/* ── 5 KARTU KPI MODERN (MULTI-TONE RESPONSIVE) ── */}
 <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
 <ModernKpiCard
 icon={ClipboardList}
 label="Total Penugasan"
 value={stats.total}
 tag={`${stats.total} Tugas`}
 subtext="Tercatat di sistem"
 tone="emerald"
 onClick={() => {
 setSelectedStatus('')
 setPage(1)
 }}
 />
 <ModernKpiCard
 icon={Globe}
 label="Dipublikasikan"
 value={stats.published}
 tag="Aktif"
 subtext="Dapat diakses siswa"
 tone="blue"
 onClick={() => {
 setSelectedStatus('dipublikasikan')
 setPage(1)
 }}
 />
 <ModernKpiCard
 icon={Lock}
 label="Draft"
 value={stats.draft}
 tag="Penyusunan"
 subtext="Belum dipublish"
 tone="amber"
 onClick={() => {
 setSelectedStatus('draft')
 setPage(1)
 }}
 />
 <ModernKpiCard
 icon={Users}
 label="Pengumpulan"
 value={stats.total_pengumpulan}
 tag="Submisi"
 subtext="Tugas terkirim"
 tone="purple"
 onClick={() => {
 setSelectedStatus('dipublikasikan')
 setPage(1)
 }}
 />
 <ModernKpiCard
 icon={Award}
 label="Tugas Dinilai"
 value={stats.total_dinilai}
 tag="Selesai"
 subtext="Sudah diberi nilai"
 tone="teal"
 className="col-span-2 sm:col-span-1"
 onClick={() => {
 setSelectedStatus('dipublikasikan')
 setPage(1)
 }}
 />
 </motion.div>

 {/* Tab Navigation Slot if provided */}
 {tabNav && <div className="my-2">{typeof tabNav === 'function' ? tabNav() : tabNav}</div>}

 {/* ── CANONICAL EMERALD DATATABLE CONTAINER ── */}
 <motion.div variants={itemVariants}>
        <AppDataTable
          id="tabel-penugasan"
          title="Daftar Penugasan & Proyek Siswa"
          subtitle="Kelola instruksi tugas, bobot nilai, publikasi, dan evaluasi per kelas"
          icon={ClipboardList}
          countLabel={`${Number(pagination.total || dataPenugasan.length).toLocaleString('id-ID')} Penugasan`}
          actions={
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
              <SquircleActionButton
                variant="print"
                label="Cetak"
                icon={Printer}
                onClick={() => setIsPrintModalOpen(true)}
              />
              <SquircleActionButton
                variant="import"
                label="Import"
                icon={Upload}
                onClick={() => setImportOpen(true)}
              />
              <SquircleActionButton
                variant="export"
                label="Export"
                icon={Download}
                onClick={() => setIsExportModalOpen(true)}
              />
              <SquircleActionButton
                variant="primary"
                label="Buat Penugasan Baru"
                icon={Plus}
                onClick={handleOpenCreateModal}
              />
            </div>
          }
          search={searchInput}
          onSearchChange={(e) => {
            setSearchInput(e.target.value)
            setPage(1)
          }}
          searchPlaceholder="Cari judul, deskripsi, instruksi penugasan..."
          filters={
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2 sm:gap-2.5 w-full">
              {canSelectUnit ? (
                <HeroUiFilterSelect
                  value={selectedUnit}
                  onChange={(val) => {
                    setSelectedUnit(val)
                    setPage(1)
                  }}
                  placeholder={`Semua Unit (${options.units?.length || 'SIT'})`}
                  icon={School}
                  popoverWidth="min-w-[220px]"
                  searchable={(options.units?.length || 0) > 5}
                  options={[
                    { value: '', label: `Semua Unit (${options.units?.length || 'SIT'})` },
                    ...(options.units || []).map((u) => ({ value: String(u.id), label: u.name || u.nama_unit })),
                  ]}
                />
              ) : (
                <div
                  title="Terkunci: Menampilkan data khusus unit wewenang Anda"
                  className="col-span-2 sm:col-span-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50 text-xs font-bold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-200"
                >
                  <School className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{userUnitName}</span>
                  <Lock className="size-3 text-emerald-500 ml-0.5 opacity-80" />
                </div>
              )}
              <HeroUiFilterSelect
                value={selectedModulAjar}
                onChange={(val) => {
                  setSelectedModulAjar(val)
                  setPage(1)
                }}
                placeholder="Semua Modul Ajar"
                icon={BookOpen}
                popoverWidth="min-w-[240px]"
                searchable
                options={[
                  { value: '', label: 'Semua Modul Ajar' },
                  ...(options.modul_ajar || []).map((m) => ({
                    value: m.value || m.id,
                    label: m.label || m.judul || m.judul_modul,
                  })),
                ]}
              />

              {!isTeacherOnly && (
                <HeroUiFilterSelect
                  value={selectedGuru}
                  onChange={(val) => {
                    setSelectedGuru(val)
                    setPage(1)
                  }}
                  placeholder="Semua Guru"
                  icon={GraduationCap}
                  popoverWidth="min-w-[200px]"
                  searchable
                  options={[
                    { value: '', label: 'Semua Guru' },
                    ...(options.guru || []).map((g) => ({
                      value: g.value || g.id,
                      label: g.label || g.nama || g.nama_lengkap,
                    })),
                  ]}
                />
              )}

              <HeroUiFilterSelect
                value={selectedKelas}
                onChange={(val) => {
                  setSelectedKelas(val)
                  setPage(1)
                }}
                placeholder="Semua Kelas"
                icon={Layers}
                popoverWidth="min-w-[170px]"
                options={[
                  { value: '', label: 'Semua Kelas' },
                  ...(options.kelas || []).map((k) => ({
                    value: k.value || k.id,
                    label: k.label || k.nama_kelas || k.name,
                  })),
                ]}
              />

              <HeroUiFilterSelect
                value={selectedTipe}
                onChange={(val) => {
                  setSelectedTipe(val)
                  setPage(1)
                }}
                placeholder="Semua Tipe"
                icon={FileText}
                popoverWidth="min-w-[150px]"
                options={[
                  { value: '', label: 'Semua Tipe' },
                  ...options.tipe.map((t) => ({
                    value: t.value,
                    label: t.label,
                  })),
                ]}
              />

              <HeroUiFilterSelect
                value={selectedStatus}
                onChange={(val) => {
                  setSelectedStatus(val)
                  setPage(1)
                }}
                placeholder="Semua Status"
                popoverWidth="min-w-[150px]"
                options={[
                  { value: '', label: 'Semua Status' },
                  ...options.status.map((s) => ({
                    value: s.value,
                    label: s.label,
                  })),
                ]}
              />

              {((canSelectUnit && selectedUnit) || searchInput || selectedModulAjar || selectedKelas || selectedTipe || selectedStatus || selectedGuru) && (
                <button
                  type="button"
                  onClick={() => {
                    if (canSelectUnit) setSelectedUnit('')
                    setSearchInput('')
                    setSelectedModulAjar('')
                    setSelectedKelas('')
                    setSelectedTipe('')
                    setSelectedStatus('')
                    setSelectedGuru('')
                    setPage(1)
                  }}
                  className="col-span-2 sm:col-span-1 sm:ml-auto h-9 px-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 dark:border-emerald-800/60 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/60 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>
          }
          columns={penugasanColumns}
          data={dataPenugasan}
          isLoading={loading}
          page={page}
          totalPages={pagination.last_page}
          onPageChange={setPage}
          onRowClick={(item) => {
            setRowDetailItem(item)
            setShowRowDetailModal(true)
          }}
          onView={(item) => handleOpenDetail(item)}
          onEdit={(item) => handleOpenEditModal(item)}
          onDelete={(item) => handleRequestDelete(item)}
          renderMobileCard={(item) => (
            <MobileDataCard
              key={item?.id}
              title={item?.judul || item?.judul_tugas || 'Penugasan'}
              subtitle={item?.modul_ajar?.judul || 'Modul Ajar'}
              badge={item?.tipe === 'kelompok' || item?.tipe_tugas === 'kelompok' ? 'Kelompok' : 'Individu'}
              badgeVariant={item?.is_published || item?.status === 'dipublikasikan' ? 'success' : 'warning'}
              fields={[
                { label: 'Kelas', value: item?.kelas?.nama_kelas || 'Semua Kelas', icon: Layers },
                { label: 'Guru', value: item?.guru?.nama || '-', icon: GraduationCap },
                { label: 'Deadline', value: item?.deadline || item?.tanggal_selesai || '-', icon: Clock },
                { label: 'Pengumpulan', value: `${item?.total_pengumpulan ?? 0} Submisi`, icon: Users },
              ]}
              onView={() => handleOpenDetail(item)}
              onEdit={() => handleOpenEditModal(item)}
              onDelete={() => handleRequestDelete(item)}
            />
          )}
        />
 </motion.div>

 {/* CREATE / EDIT MODAL - HERO UI STYLE */}
 {isModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
 <div className="relative w-full max-w-3xl overflow-hidden rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white/95 dark:bg-slate-900/95 shadow-2xl shadow-sm flex flex-col max-h-[92vh] backdrop-blur-md">
 {/* Top Accent Gradient Bar */}

 {/* Modal Header */}
 <div className="px-6 py-4 border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
 <div className="flex items-center gap-3">
 <div className="w-10 h-9 rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 flex items-center justify-center shadow-md shadow-xs">
 <ClipboardList size={20} />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h3 className="text-base font-black tracking-tight text-slate-800 dark:text-white">
 {editId ? 'Edit Penugasan & Asesmen' : 'Buat Penugasan Baru'}
 </h3>
 <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
 Hero UI Form
 </span>
 </div>
 <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
 Konfigurasi parameter tugas terpadu dengan 8 tipe pengerjaan dan lampiran in-app
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setIsModalOpen(false)}
 className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition-colors cursor-pointer"
 >
 <X size={18} />
 </button>
 </div>

 {/* Modal Form */}
 <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
 {/* Judul Penugasan */}
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Judul Penugasan <span className="text-rose-500">*</span>
 </label>
 <input
 type="text"
 required
 placeholder="Contoh: Penugasan 1: Analisis Hukum Newton / Setoran Surah Al-Mulk..."
 value={formData.judul}
 onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
 className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 </div>

 {/* Modul Ajar Relasi */}
 <div>
 <HeroUiModalSelect
 label="Tautkan ke Modul Ajar (1 : N)"
 value={formData.modul_ajar_id}
 onChange={(val) => setFormData({ ...formData, modul_ajar_id: val })}
 placeholder="-- Opsional: Pilih Modul Ajar --"
 icon={BookOpen}
 searchable
 options={[
 { value: '', label: '-- Opsional: Pilih Modul Ajar --' },
 ...(options.modul_ajar || []).map((m) => ({
 value: m.value || m.id,
 label: m.label || m.judul || m.judul_modul,
 })),
 ]}
 />
 </div>

 {/* Grid 2 Kolom: Kelas & Guru */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <HeroUiModalSelect
 label="Target Kelas / Rombel"
 value={formData.kelas_id}
 onChange={(val) => setFormData({ ...formData, kelas_id: val })}
 placeholder="-- Pilih Kelas --"
 icon={Layers}
 options={[
 { value: '', label: '-- Pilih Kelas --' },
 ...(options.kelas || []).map((k) => ({
 value: k.value || k.id,
 label: k.label || k.nama_kelas || k.name,
 })),
 ]}
 />
 </div>

 <div>
 <div className="flex items-center justify-between mb-1">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
 Guru Pengampu
 </label>
 {isTeacherOnly && (
 <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/60">
 Akun Guru Anda
 </span>
 )}
 </div>
 <HeroUiModalSelect
 value={formData.guru_id}
 disabled={isTeacherOnly}
 onChange={(val) => setFormData({ ...formData, guru_id: val })}
 placeholder="-- Pilih Guru --"
 icon={GraduationCap}
 searchable
 options={[
 { value: '', label: '-- Pilih Guru --' },
 ...(options.guru || []).map((g) => ({
 value: g.value || g.id,
 label: g.label || g.nama || g.nama_lengkap,
 })),
 ]}
 />
 </div>
 </div>

 {/* Grid 2 Kolom: Tipe & Jenis */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <HeroUiModalSelect
 label="Tipe Pengerjaan"
 value={formData.tipe}
 onChange={(val) => setFormData({ ...formData, tipe: val })}
 placeholder="Pilih Tipe"
 options={options.tipe.map((t) => ({
 value: t.value,
 label: t.label,
 }))}
 />
 </div>

 <div>
 <HeroUiModalSelect
 label="Jenis Tugas (8 Ragam Asesmen)"
 value={formData.jenis_tugas}
 onChange={(val) => setFormData({ ...formData, jenis_tugas: val })}
 placeholder="Pilih Jenis Tugas"
 options={options.jenis.map((j) => ({
 value: j.value,
 label: `${j.label} [${j.penilaian || 'Manual'}]`,
 }))}
 />
 </div>
 </div>

 {/* ── DYNAMIC HERO UI CONFIG CARD SESUAI JENIS TUGAS ── */}
 {formData.jenis_tugas === 'tahfizh' && (
 <div className="p-4 rounded-xl border border-emerald-200/80 bg-white dark:bg-[#1B2433] dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/40 space-y-3">
 <div className="flex items-center justify-between">
 <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
 <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
 Konfigurasi Khusus Tugas Tahfizh &amp; Rubrik Guru
 </span>
 <span className="text-xs font-bold bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 px-2.5 py-0.5 rounded-full">
 Setoran Langsung / Audio / Video
 </span>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Surah</label>
 <input
 type="text"
 placeholder="Contoh: Al-Mulk / An-Naba"
 value={formData.metadata?.surah || ''}
 onChange={(e) =>
 setFormData({
 ...formData,
 metadata: { ...formData.metadata, surah: e.target.value },
 })
 }
 className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ayat Awal</label>
 <input
 type="number"
 min="1"
 placeholder="1"
 value={formData.metadata?.ayat_awal || ''}
 onChange={(e) =>
 setFormData({
 ...formData,
 metadata: { ...formData.metadata, ayat_awal: e.target.value },
 })
 }
 className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ayat Akhir</label>
 <input
 type="number"
 min="1"
 placeholder="30"
 value={formData.metadata?.ayat_akhir || ''}
 onChange={(e) =>
 setFormData({
 ...formData,
 metadata: { ...formData.metadata, ayat_akhir: e.target.value },
 })
 }
 className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 </div>
 </div>

 <div className="pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 text-xs text-emerald-950 dark:text-emerald-200">
 <p className="font-semibold text-xs">Rubrik Standar Penilaian Guru:</p>
 <div className="flex flex-wrap gap-2 mt-1">
 <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800 text-xs font-bold border border-emerald-200/80 dark:border-emerald-800/60">
 Kelancaran: 40 Poin
 </span>
 <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800 text-xs font-bold border border-emerald-200/80 dark:border-emerald-800/60">
 Tajwid &amp; Tartil: 40 Poin
 </span>
 <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800 text-xs font-bold border border-emerald-200/80 dark:border-emerald-800/60">
 Adab &amp; Makhraj: 20 Poin
 </span>
 </div>
 </div>
 </div>
 )}

 {formData.jenis_tugas === 'esai' && (
 <div className="p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-indigo-950/40 space-y-2">
 <div className="flex items-center justify-between">
 <span className="inline-flex items-center gap-1.5 text-xs font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
 <FileText size={14} className="text-indigo-600 dark:text-indigo-400" />
 Konfigurasi Esai (Teks Panjang)
 </span>
 <span className="text-xs font-bold bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 px-2.5 py-0.5 rounded-full">
 Live Word Counter Siswa
 </span>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Minimal Target Kata
 </label>
 <input
 type="number"
 min="50"
 step="10"
 placeholder="Contoh: 150"
 value={formData.metadata?.min_words || 150}
 onChange={(e) =>
 setFormData({
 ...formData,
 metadata: { ...formData.metadata, min_words: parseInt(e.target.value) || 150 },
 })
 }
 className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
 />
 </div>
 <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
 Siswa akan melihat indikator jumlah kata saat mengetik teks esai secara real-time.
 </div>
 </div>
 </div>
 )}

 {formData.jenis_tugas === 'proyek' && (
 <div className="p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] dark:from-teal-950/40 dark:via-cyan-950/30 dark:to-teal-950/40 space-y-2">
 <div className="flex items-center justify-between">
 <span className="inline-flex items-center gap-1.5 text-xs font-black text-teal-900 dark:text-teal-300 uppercase tracking-wider">
 <Users size={14} className="text-teal-600 dark:text-teal-400" />
 Konfigurasi Proyek Kelompok / Portofolio
 </span>
 <span className="text-xs font-bold bg-teal-200 dark:bg-teal-900 text-teal-900 dark:text-teal-200 px-2.5 py-0.5 rounded-full">
 Laporan &amp; Presentasi
 </span>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Maksimal Anggota per Kelompok
 </label>
 <input
 type="number"
 min="2"
 max="15"
 placeholder="Contoh: 4"
 value={formData.metadata?.max_group_members || 4}
 onChange={(e) =>
 setFormData({
 ...formData,
 metadata: { ...formData.metadata, max_group_members: parseInt(e.target.value) || 4 },
 })
 }
 className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
 />
 </div>
 <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
 Perwakilan kelompok dapat mengunggah file laporan atau link presentasi Canva / Google Slides.
 </div>
 </div>
 </div>
 )}

 {formData.jenis_tugas === 'dokumen' && (
 <div className="p-3.5 rounded-xl border-2 border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
 <Paperclip size={16} className="text-amber-600 shrink-0" />
 <span>Siswa akan diminta mengunggah dokumen digital dalam format <strong>PDF, DOCX, XLSX, atau PPTX</strong> (Maksimal 25 MB).</span>
 </div>
 )}

 {formData.jenis_tugas === 'praktik' && (
 <div className="p-3.5 rounded-xl border-2 border-rose-300 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-950/30 text-xs text-rose-900 dark:text-rose-200 flex items-center gap-2">
 <Video size={16} className="text-rose-600 shrink-0" />
 <span>Siswa akan melampirkan dokumentasi foto atau video demonstrasi praktik (bisa via unggah file atau link YouTube / Google Drive).</span>
 </div>
 )}

 {formData.jenis_tugas === 'literasi' && (
 <div className="p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-cyan-50/60 dark:bg-cyan-950/30 text-xs text-cyan-900 dark:text-cyan-200 flex items-center gap-2">
 <BookOpen size={16} className="text-cyan-600 shrink-0" />
 <span>Siswa dapat menyetorkan ringkasan bacaan kitab / buku dalam bentuk catatan teks atau rekaman suara (audio).</span>
 </div>
 )}

 {formData.jenis_tugas === 'quiz' && (
 <div className="p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-purple-50/60 dark:bg-purple-950/30 text-xs text-purple-900 dark:text-purple-200 flex items-center gap-2">
 <Award size={16} className="text-purple-600 shrink-0" />
 <span>Asesmen kuis dikerjakan langsung oleh siswa di portal aplikasi dan dinilai secara otomatis / manual terhubung dengan bank soal CBT.</span>
 </div>
 )}

 {/* Grid 2 Kolom: Nilai Maksimal & Bobot */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Nilai Maksimal
 </label>
 <input
 type="number"
 min="0"
 max="1000"
 value={formData.nilai_maksimal}
 onChange={(e) => setFormData({ ...formData, nilai_maksimal: e.target.value })}
 className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Bobot Nilai (%)
 </label>
 <input
 type="number"
 min="0"
 max="100"
 value={formData.bobot_persen}
 onChange={(e) => setFormData({ ...formData, bobot_persen: e.target.value })}
 className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 </div>
 </div>

 {/* Grid 2 Kolom: Tanggal Mulai & Tanggal Selesai (Deadline) */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Tanggal Mulai
 </label>
 <input
 type="datetime-local"
 value={formData.tanggal_mulai}
 onChange={(e) => setFormData({ ...formData, tanggal_mulai: e.target.value })}
 className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Tanggal Selesai (Deadline)
 </label>
 <input
 type="datetime-local"
 value={formData.tanggal_selesai}
 onChange={(e) => setFormData({ ...formData, tanggal_selesai: e.target.value })}
 className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 </div>
 </div>

 {/* Deskripsi & Instruksi */}
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Deskripsi Tugas
 </label>
 <textarea
 rows="2"
 placeholder="Ringkasan atau gambaran umum penugasan..."
 value={formData.deskripsi}
 onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
 className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Instruksi Pengerjaan
 </label>
 <textarea
 rows="3"
 placeholder="Langkah-langkah pengerjaan, format berkas yang diminta, dsb..."
 value={formData.instruksi}
 onChange={(e) => setFormData({ ...formData, instruksi: e.target.value })}
 className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 </div>

 {/* File Lampiran & Tautan Link */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 File Lampiran Berkas Guru (Path / URL)
 </label>
 <input
 type="text"
 placeholder="URL berkas lampiran (e.g. /storage/...)"
 value={formData.lampiran}
 onChange={(e) => setFormData({ ...formData, lampiran: e.target.value })}
 className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 </div>

 <div>
 <div className="flex items-center justify-between mb-1">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
 Tautan Eksternal / Video (Drive / YouTube)
 </label>
 {Boolean(formData.link_lampiran || formData.lampiran) && (
 <button
 type="button"
 onClick={() =>
 handleOpenEmbed(
 formData.link_lampiran || formData.lampiran,
 formData.judul || 'Lampiran Tugas Guru',
 'Pratinjau Dalam Aplikasi'
 )
 }
 className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
 >
 <Eye size={12} />
 Uji In-App
 </button>
 )}
 </div>
 <input
 type="url"
 placeholder="https://drive.google.com/... atau YouTube"
 value={formData.link_lampiran}
 onChange={(e) => setFormData({ ...formData, link_lampiran: e.target.value })}
 className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 </div>
 </div>

 {/* Status Publikasi */}
 <div>
 <HeroUiModalSelect
 label="Status Publikasi"
 value={formData.status}
 onChange={(val) => setFormData({ ...formData, status: val })}
 placeholder="Pilih Status"
 options={[
 { value: 'dipublikasikan', label: 'Dipublikasikan (Dapat diakses Siswa)' },
 { value: 'draft', label: 'Draft (Simpan Sementara)' },
 ]}
 />
 </div>

 {/* Action Buttons */}
 <div className="pt-4 border-t border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 flex items-center justify-end gap-3">
 <button
 type="button"
 onClick={() => setIsModalOpen(false)}
 className="px-4 py-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition-colors cursor-pointer"
 >
 Batal
 </button>
 <button
 type="submit"
 disabled={formLoading}
 className="px-6 py-2.5 rounded-lg bg-emerald-600 dark:bg-slate-100 dark:text-slate-900 dark: hover:from-emerald-700 hover:to-teal-700 text-xs font-black shadow-sm transition-all duration-200 flex items-center gap-2 disabled:opacity-50 cursor-pointer text-white border border-emerald-200/80 dark:border-emerald-800/60 h-9 text-sm font-medium"
 >
 {formLoading && <RefreshCw size={14} className="animate-spin" />}
 <span>{editId ? 'Simpan Perubahan' : 'Buat Penugasan'}</span>
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* DETAIL & GRADING DRAWER / MODAL - HERO UI STYLE */}
 {isDetailOpen && selectedPenugasan && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
 <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white/95 dark:bg-slate-900/95 shadow-2xl shadow-sm backdrop-blur-md">
 {/* Top Accent Gradient Bar */}

 {/* Detail Header */}
 <div className="px-6 py-4 border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
 <div className="flex items-center gap-3">
 <div className="w-10 h-9 rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 flex items-center justify-center font-bold shadow-sm">
 <ClipboardList size={22} />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h3 className="text-base font-black text-slate-800 dark:text-white line-clamp-1">
 {selectedPenugasan.judul || selectedPenugasan.judul_tugas}
 </h3>
 <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
 {selectedPenugasan.jenis_tugas || 'Tugas'}
 </span>
 </div>
 <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 <span>Modul: {selectedPenugasan.modul_ajar?.judul || 'Tidak ditautkan'}</span>
 <span>•</span>
 <span>Deadline: {selectedPenugasan.deadline || selectedPenugasan.tanggal_selesai || '-'}</span>
 </div>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setIsDetailOpen(false)}
 className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 cursor-pointer"
 >
 <X size={20} />
 </button>
 </div>

 {/* Content Area */}
 <div className="p-6 overflow-y-auto space-y-6 flex-1">
 {/* Deskripsi & Instruksi Card */}
 <div className="bg-slate-50/80 dark:bg-slate-900/60 rounded-xl p-4 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
 <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400">Deskripsi &amp; Instruksi Pengerjaan</h4>
 <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">
 {selectedPenugasan.deskripsi || 'Tidak ada deskripsi.'}
 </p>
 {selectedPenugasan.instruksi && (
 <div className="mt-3 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 text-xs text-slate-600 dark:text-slate-400">
 <strong className="text-slate-800 dark:text-slate-200">Instruksi:</strong>
 <p className="mt-1 whitespace-pre-line">{selectedPenugasan.instruksi}</p>
 </div>
 )}

 {/* Teacher Attachments In-App Openers */}
 {(selectedPenugasan.lampiran || selectedPenugasan.link_lampiran) && (
 <div className="mt-3 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 flex flex-wrap gap-2 text-xs">
 {selectedPenugasan.lampiran && (
 <button
 type="button"
 onClick={() =>
 handleOpenEmbed(
 selectedPenugasan.lampiran,
 selectedPenugasan.judul,
 'File Berkas Lampiran Guru'
 )
 }
 className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-emerald-900 dark:text-emerald-200 font-bold border border-emerald-200/80 dark:border-emerald-800/60 transition cursor-pointer"
 >
 <Paperclip size={13} />
 <span>Buka File Lampiran Guru (In-App)</span>
 </button>
 )}
 {selectedPenugasan.link_lampiran && (
 <button
 type="button"
 onClick={() =>
 handleOpenEmbed(
 selectedPenugasan.link_lampiran,
 selectedPenugasan.judul,
 'Tautan Materi / Video Referensi Guru'
 )
 }
 className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/80 dark:hover:bg-blue-900 text-blue-900 dark:text-blue-200 font-bold border border-emerald-200/80 dark:border-emerald-800/60 transition cursor-pointer"
 >
 <Globe size={13} />
 <span>Buka Tautan Materi Guru (In-App)</span>
 </button>
 )}
 </div>
 )}
 </div>

 {/* Submissions List Header */}
 <div className="flex items-center justify-between">
 <div>
 <h4 className="text-base font-black text-slate-800 dark:text-white">Pengumpulan Tugas Siswa</h4>
 <p className="text-xs text-slate-500 dark:text-slate-400">Daftar siswa yang telah mengumpulkan jawaban beserta evaluasi nilai</p>
 </div>
 <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 px-3.5 py-1 rounded-full font-black border border-emerald-200/80 dark:border-emerald-800/60">
 {selectedPenugasan.pengumpulan?.length || 0} Pengumpulan
 </span>
 </div>

 {/* Submissions Table / Cards */}
 {!selectedPenugasan.pengumpulan || selectedPenugasan.pengumpulan.length === 0 ? (
 <div className="p-8 text-center bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border-2 border-dashed border-emerald-200/80 dark:border-emerald-800/60">
 <UserCheck className="mx-auto text-emerald-500/60 mb-2" size={32} />
 <p className="text-xs font-semibold text-slate-500">Belum ada siswa yang mengumpulkan tugas ini.</p>
 </div>
 ) : (
 <div className="space-y-3">
 {selectedPenugasan.pengumpulan.map((sub) => {
 const subMeta = typeof sub.metadata === 'string' ? JSON.parse(sub.metadata || '{}') : (sub.metadata || {})
 return (
 <div
 key={sub.id}
 className="bg-white dark:bg-[#1B2433] rounded-xl p-4 border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm space-y-3"
 >
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3">
 <div className="flex items-center gap-3">
 <PersonAvatar
 src={sub.siswa?.foto || sub.siswa?.photo_url || sub.siswa?.avatar_url}
 name={sub.siswa?.nama || 'Siswa'}
 size="sm"
 />
 <div>
 <div className="flex items-center gap-2 flex-wrap">
 <h5 className="text-sm font-bold text-slate-800 dark:text-white">
 {sub.siswa?.nama || 'Siswa'}
 </h5>
 {subMeta?.tahfizh_mode && (
 <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-200/80 dark:border-emerald-800/60">
 Metode: {subMeta.tahfizh_mode}
 </span>
 )}
 {subMeta?.group_members && (
 <span className="text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-md border border-emerald-200/80 dark:border-emerald-800/60">
 Anggota: {subMeta.group_members}
 </span>
 )}
 {subMeta?.word_count && (
 <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-md border border-emerald-200/80 dark:border-emerald-800/60">
 {subMeta.word_count} Kata
 </span>
 )}
 </div>
 <span className="text-xs text-slate-400">
 NISN: {sub.siswa?.nisn || '-'} • Waktu Kumpul: {sub.waktu_kumpul || '-'}
 </span>
 </div>
 </div>

 <div className="flex items-center gap-2">
 {sub.nilai_guru !== null ? (
 <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold px-3 py-1 rounded-lg text-xs border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-1">
 <Award size={14} />
 Nilai: {sub.nilai_guru} / {selectedPenugasan.nilai_maksimal || 100}
 </span>
 ) : (
 <span className="bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 font-semibold px-3 py-1 rounded-lg text-xs border border-emerald-200/80 dark:border-emerald-800/60">
 Belum Dinilai
 </span>
 )}

 <button
 type="button"
 onClick={() => handleStartGrading(sub)}
 className="px-3.5 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white hover:from-emerald-700 hover:to-teal-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
 >
 {sub.nilai_guru !== null ? 'Edit Nilai' : 'Beri Nilai'}
 </button>
 </div>
 </div>

 {/* Jawaban Siswa */}
 {sub.jawaban_teks && (
 <div className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
 <strong className="text-slate-900 dark:text-white block mb-1">Jawaban Teks Siswa:</strong>
 <p className="whitespace-pre-line leading-relaxed">{sub.jawaban_teks}</p>
 </div>
 )}

 {/* Link / File Jawaban - In-App Embed Buttons (NO target="_blank") */}
 {(sub.file_path || sub.url_link) && (
 <div className="flex flex-wrap gap-2 text-xs">
 {sub.file_path && (
 <button
 type="button"
 onClick={() =>
 handleOpenEmbed(
 sub.file_path,
 `Berkas Siswa: ${sub.siswa?.nama || 'Siswa'}`,
 'Pratinjau Berkas Dokumen Jawaban'
 )
 }
 className="inline-flex items-center gap-1.5 text-emerald-800 dark:text-emerald-200 font-bold bg-emerald-100/80 hover:bg-emerald-200 dark:bg-emerald-950/70 dark:hover:bg-emerald-900 px-3 py-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 transition cursor-pointer"
 >
 <Paperclip size={13} />
 <span>Buka Berkas Siswa (In-App)</span>
 </button>
 )}
 {sub.url_link && (
 <button
 type="button"
 onClick={() =>
 handleOpenEmbed(
 sub.url_link,
 `Tautan Siswa: ${sub.siswa?.nama || 'Siswa'}`,
 'Pratinjau Tautan Eksternal Siswa'
 )
 }
 className="inline-flex items-center gap-1.5 text-blue-800 dark:text-blue-200 font-bold bg-blue-100/80 hover:bg-blue-200 dark:bg-blue-950/70 dark:hover:bg-blue-900 px-3 py-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 transition cursor-pointer"
 >
 <Globe size={13} />
 <span>Buka Tautan Jawaban (In-App)</span>
 </button>
 )}
 </div>
 )}

 {/* Catatan Guru */}
 {sub.catatan_guru && (
 <div className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
 <strong>Catatan Guru:</strong> {sub.catatan_guru}
 </div>
 )}

 {/* Inline Form Input Nilai jika tombol Beri Nilai diklik */}
 {gradingStudentId === sub.siswa_id && (
 <form onSubmit={handleSaveGrade} className="mt-3 p-4 bg-emerald-50/80 dark:bg-slate-900 rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 dark:border-emerald-800/60 space-y-3">
 <div className="flex items-center justify-between">
 <h6 className="text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wide">
 Form Evaluasi &amp; Nilai Guru
 </h6>
 {selectedPenugasan.jenis_tugas === 'tahfizh' && (
 <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-200/80 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
 Tersedia Rubrik Tahfizh
 </span>
 )}
 </div>

 {/* Optional Rubrik Tahfizh Quick Helper */}
 {selectedPenugasan.jenis_tugas === 'tahfizh' && (
 <div className="p-3 bg-white/90 dark:bg-slate-800/80 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
 <div>
 <span className="block text-[10px] font-bold text-slate-500">1. Kelancaran (0 - 40)</span>
 <input
 type="number"
 min="0"
 max="40"
 placeholder="40"
 defaultValue="40"
 id="rubrik_kelancaran"
 className="w-full mt-1 px-2.5 py-1 text-xs border rounded-lg bg-slate-50 dark:bg-slate-900 border-emerald-300 dark:border-emerald-800/60"
 onChange={() => {
 const k = parseFloat(document.getElementById('rubrik_kelancaran')?.value || 0)
 const t = parseFloat(document.getElementById('rubrik_tajwid')?.value || 0)
 const a = parseFloat(document.getElementById('rubrik_adab')?.value || 0)
 setGradingForm((prev) => ({ ...prev, nilai_guru: Math.min(100, k + t + a) }))
 }}
 />
 </div>
 <div>
 <span className="block text-[10px] font-bold text-slate-500">2. Tajwid (0 - 40)</span>
 <input
 type="number"
 min="0"
 max="40"
 placeholder="40"
 defaultValue="40"
 id="rubrik_tajwid"
 className="w-full mt-1 px-2.5 py-1 text-xs border rounded-lg bg-slate-50 dark:bg-slate-900 border-emerald-300 dark:border-emerald-800/60"
 onChange={() => {
 const k = parseFloat(document.getElementById('rubrik_kelancaran')?.value || 0)
 const t = parseFloat(document.getElementById('rubrik_tajwid')?.value || 0)
 const a = parseFloat(document.getElementById('rubrik_adab')?.value || 0)
 setGradingForm((prev) => ({ ...prev, nilai_guru: Math.min(100, k + t + a) }))
 }}
 />
 </div>
 <div>
 <span className="block text-[10px] font-bold text-slate-500">3. Adab/Makhraj (0 - 20)</span>
 <input
 type="number"
 min="0"
 max="20"
 placeholder="20"
 defaultValue="20"
 id="rubrik_adab"
 className="w-full mt-1 px-2.5 py-1 text-xs border rounded-lg bg-slate-50 dark:bg-slate-900 border-emerald-300 dark:border-emerald-800/60"
 onChange={() => {
 const k = parseFloat(document.getElementById('rubrik_kelancaran')?.value || 0)
 const t = parseFloat(document.getElementById('rubrik_tajwid')?.value || 0)
 const a = parseFloat(document.getElementById('rubrik_adab')?.value || 0)
 setGradingForm((prev) => ({ ...prev, nilai_guru: Math.min(100, k + t + a) }))
 }}
 />
 </div>
 </div>
 )}

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Nilai Total (0 - {selectedPenugasan.nilai_maksimal || 100})
 </label>
 <input
 type="number"
 step="0.1"
 required
 min="0"
 max={selectedPenugasan.nilai_maksimal || 100}
 value={gradingForm.nilai_guru}
 onChange={(e) => setGradingForm({ ...gradingForm, nilai_guru: e.target.value })}
 className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl text-sm font-black text-emerald-950 dark:text-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 </div>
 <div className="sm:col-span-2">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Catatan / Umpan Balik Guru
 </label>
 <input
 type="text"
 placeholder="Apresiasi atau evaluasi untuk siswa..."
 value={gradingForm.catatan_guru}
 onChange={(e) => setGradingForm({ ...gradingForm, catatan_guru: e.target.value })}
 className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 </div>
 </div>

 <div className="flex justify-end gap-2 pt-1">
 <button
 type="button"
 onClick={() => setGradingStudentId(null)}
 className="px-3.5 py-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition-colors cursor-pointer"
 >
 Batal
 </button>
 <button
 type="submit"
 disabled={gradingLoading}
 className="px-5 py-1.5 rounded-lg bg-emerald-600 dark:bg-slate-100 dark:text-slate-900 dark: hover:from-emerald-700 hover:to-teal-700 text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50 text-white border border-emerald-200/80 dark:border-emerald-800/60 h-9 text-sm font-medium"
 >
 {gradingLoading && <RefreshCw size={12} className="animate-spin" />}
 <span>Simpan Nilai</span>
 </button>
 </div>
 </form>
 )}
 </div>
 )
 })}
 </div>
 )}
 </div>
 </div>
 </div>
 )}

 {/* ROW DETAIL MODAL POPUP */}
 {showRowDetailModal && rowDetailItem && (
 <div
 className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
 onClick={() => setShowRowDetailModal(false)}
 >
 <div
 className="bg-white dark:bg-[#182232] rounded-3xl w-full max-w-lg shadow-2xl shadow-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-700/80 dark:border-emerald-800/60 dark:border-emerald-800/60 overflow-hidden"
 onClick={(e) => e.stopPropagation()}
 >
 {/* Header */}
 <div className="flex items-start justify-between px-6 py-4 border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 bg-slate-50/50 dark:bg-slate-800/40">
 <div className="flex items-start gap-3">
 <div className="w-10 h-9 rounded-xl bg-sky-100 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0 mt-0.5">
 <ClipboardList className="w-5 h-5" />
 </div>
 <div>
 <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{rowDetailItem.judul || rowDetailItem.judul_tugas}</h2>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 {rowDetailItem.modul_ajar?.judul || 'Tanpa Modul Ajar'} · {rowDetailItem.kelas?.nama_kelas || 'Semua Kelas'}
 </p>
 </div>
 </div>
 <button
 onClick={() => setShowRowDetailModal(false)}
 className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 shrink-0"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Body */}
 <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
 {/* Badges */}
 <div className="flex flex-wrap gap-2">
 <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
 rowDetailItem.tipe === 'kelompok' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-emerald-200/80 dark:border-emerald-800/60' : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-emerald-200/80 dark:border-emerald-800/60'
 }`}>
 <Users className="w-3 h-3" />
 {rowDetailItem.tipe === 'kelompok' ? 'Kelompok' : 'Individu'}
 </span>
 <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-emerald-200/80 dark:border-emerald-800/60 capitalize">
 <FileText className="w-3 h-3" />
 {rowDetailItem.jenis_tugas || 'tugas'}
 </span>
 <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
 rowDetailItem.status === 'dipublikasikan' || rowDetailItem.is_published ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60' : 'bg-slate-100 text-slate-600 dark:bg-sky-950/60 dark:text-sky-300 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60'
 }`}>
 {rowDetailItem.status === 'dipublikasikan' || rowDetailItem.is_published ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
 {rowDetailItem.status === 'dipublikasikan' || rowDetailItem.is_published ? 'Dipublikasikan' : 'Draft'}
 </span>
 </div>

 {/* Info Grid */}
 <div className="grid grid-cols-2 gap-3">
 <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
 <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tanggal Mulai</p>
 <p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">{rowDetailItem.tanggal_mulai || '-'}</p>
 </div>
 <div className="bg-rose-50 dark:bg-rose-950/30 rounded-xl p-3">
 <p className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider">Deadline</p>
 <p className="text-sm font-semibold text-rose-700 dark:text-rose-400 mt-0.5">{rowDetailItem.deadline || rowDetailItem.tanggal_selesai || '-'}</p>
 </div>
 <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-3">
 <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">Nilai Maks</p>
 <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">{rowDetailItem.nilai_maksimal ?? 100} Poin</p>
 </div>
 <div className="bg-violet-50 dark:bg-violet-950/30 rounded-xl p-3">
 <p className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider">Bobot</p>
 <p className="text-sm font-bold text-violet-700 dark:text-violet-400 mt-0.5">{rowDetailItem.bobot_persen ?? 10}%</p>
 </div>
 </div>

 {/* Guru & Pengumpulan */}
 <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 py-3">
 <div>
 <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pengajar</p>
 <p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">{rowDetailItem.guru?.nama || '-'}</p>
 </div>
 <div className="text-right">
 <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pengumpulan</p>
 <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{rowDetailItem.total_pengumpulan ?? 0} Siswa</p>
 </div>
 </div>

 {/* Deskripsi */}
 {rowDetailItem.deskripsi && (
 <div>
 <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Deskripsi</p>
 <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-4">{rowDetailItem.deskripsi}</p>
 </div>
 )}
 </div>

 {/* Footer Actions */}
 <div className="px-6 py-4 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
 <button
 onClick={() => setShowRowDetailModal(false)}
 className="px-4 py-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
 >
 Tutup
 </button>
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => {
 setShowRowDetailModal(false)
 handleRequestDelete(rowDetailItem)
 }}
 className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors cursor-pointer"
 >
 <Trash2 className="w-3.5 h-3.5" />
 Hapus
 </button>
 <button
 type="button"
 onClick={() => {
 setShowRowDetailModal(false)
 handleOpenEditModal(rowDetailItem)
 }}
 className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#059669] text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
 >
 <Edit3 className="w-3.5 h-3.5" />
 Edit Data
 </button>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* ── HARMONIZED BATCH EXPORT MODAL ── */}
 <HarmonizedBatchExportModal
 isOpen={isExportModalOpen}
 onClose={() => setIsExportModalOpen(false)}
 onExport={handleExportSpreadsheet}
 isExporting={isExporting}
 totalCount={pagination.total || dataPenugasan.length}
 moduleTitle="Penugasan & Asesmen"
 />

 {/* ── HARMONIZED DELETE CONFIRMATION MODAL ── */}
 <AnimatePresence>
 {deleteTarget && (
 <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 12 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="w-full max-w-md overflow-hidden rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 dark:border-emerald-800/60 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-slate-950"
 >
 <div className="p-6">
 <div className="flex items-center gap-3 mb-4">
 <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 shadow-md shadow-xs">
 <Trash2 className="size-5 text-rose-600" strokeWidth={2.2} />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h4 className="text-sm font-black text-slate-900 dark:text-white">
 Hapus Penugasan?
 </h4>
 <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold text-rose-700 dark:bg-rose-950/80 dark:text-rose-300">
 Hapus Permanen
 </span>
 </div>
 <span className="text-xs font-semibold text-slate-500">
 Data pengumpulan siswa terkait juga akan terdampak
 </span>
 </div>
 </div>

 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/50 p-3.5 space-y-1 dark:border-emerald-800/60 dark:bg-rose-950/20">
 <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
 {deleteTarget.judul || deleteTarget.judul_tugas}
 </p>
 <p className="text-xs text-slate-500">
 Kelas: {deleteTarget.kelas?.nama_kelas || deleteTarget.kelas?.name || 'Semua Kelas'} • Tipe: {deleteTarget.tipe || 'individu'}
 </p>
 </div>

 <p className="mt-3 text-xs text-rose-700/80 dark:text-rose-400 font-medium leading-relaxed">
 Apakah Anda yakin ingin menghapus penugasan ini? Tindakan ini tidak dapat dibatalkan.
 </p>

 <div className="mt-6 flex items-center justify-end gap-2.5">
 <button
 type="button"
 disabled={isDeleting}
 onClick={() => setDeleteTarget(null)}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-emerald-800/60 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
 >
 Batal
 </button>
 <button
 type="button"
 disabled={isDeleting}
 onClick={handleConfirmDelete}
 className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 px-5 py-2 text-xs font-black border border-emerald-200/80 dark:border-emerald-800/60 hover:scale-[1.02] active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50"
 >
 {isDeleting ? (
 <RefreshCw className="size-3.5 animate-spin" />
 ) : (
 <Trash2 className="size-3.5" />
 )}
 <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus'}</span>
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* ── HARMONIZED SAVE / UPDATE CONFIRMATION MODAL ── */}
 <AnimatePresence>
 {confirmSaveModal.isOpen && (
 <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 12 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className={`w-full max-w-md overflow-hidden rounded-xl border bg-white shadow-2xl dark:bg-slate-950 ${
 confirmSaveModal.mode === 'update'
 ? 'border-emerald-200/80 dark:border-emerald-800/60 shadow-sm dark:border-emerald-800/60'
 : 'border-emerald-200/80 dark:border-emerald-800/60 shadow-sm dark:border-emerald-800/60'
 }`}
 >
 <div
 className={`h-1.5 w-full ${
 confirmSaveModal.mode === 'update'
 ? 'bg-white dark:bg-[#1B2433]'
 : 'bg-white dark:bg-[#1B2433]'
 }`}
 />
 <div className="p-6">
 <div className="flex items-center gap-3 mb-4">
 <div
 className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md border ${
 confirmSaveModal.mode === 'update'
 ? 'bg-white dark:bg-[#1B2433] shadow-sm border-emerald-200/80 dark:border-emerald-800/60'
 : 'bg-white dark:bg-[#1B2433] shadow-sm border-emerald-300/40'
 }`}
 >
 {confirmSaveModal.mode === 'update' ? (
 <Edit3 className="size-5 text-slate-600" strokeWidth={2.2} />
 ) : (
 <Sparkles className="size-5 text-amber-600" strokeWidth={2.2} />
 )}
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h4 className="text-sm font-black text-slate-900 dark:text-white">
 {confirmSaveModal.mode === 'update' ? 'Simpan Perubahan Penugasan?' : 'Terbitkan Penugasan Baru?'}
 </h4>
 <span
 className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold ${
 confirmSaveModal.mode === 'update'
 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
 : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
 }`}
 >
 {confirmSaveModal.mode === 'update' ? 'Update Data' : 'Penugasan Baru'}
 </span>
 </div>
 <span className="text-xs font-semibold text-slate-500">
 Konfirmasi validasi data sebelum disimpan ke server
 </span>
 </div>
 </div>

 <div
 className={`rounded-xl border p-3.5 space-y-1.5 ${
 confirmSaveModal.mode === 'update'
 ? 'border-amber-100 bg-amber-50/50 dark:border-emerald-800/60 dark:bg-amber-950/20'
 : 'border-emerald-100/80 bg-emerald-50/50 dark:border-emerald-800/60 dark:bg-emerald-950/20'
 }`}
 >
 <p className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-2">
 {formData.judul || '-'}
 </p>
 <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
 <span>
 Kelas:{' '}
 <strong className="text-slate-700 dark:text-slate-300">
 {options.kelas.find((k) => String(k.value || k.id) === String(formData.kelas_id))?.label ||
 'Semua Kelas'}
 </strong>
 </span>
 <span>•</span>
 <span>
 Tipe: <strong className="text-slate-700 dark:text-slate-300 capitalize">{formData.tipe}</strong>
 </span>
 <span>•</span>
 <span>
 Status:{' '}
 <strong className="text-slate-700 dark:text-slate-300 capitalize">
 {formData.status === 'dipublikasikan' ? 'Dipublikasikan' : 'Draft'}
 </strong>
 </span>
 </div>
 {formData.tanggal_selesai && (
 <p className="text-[10px] text-slate-500">
 Batas Waktu: {formData.tanggal_selesai.replace('T', ' ')}
 </p>
 )}
 </div>

 <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
 {confirmSaveModal.mode === 'update'
 ? 'Pastikan seluruh parameter dan materi penugasan telah sesuai sebelum memperbarui data.'
 : 'Penugasan ini akan tersimpan dan dapat segera diakses oleh siswa sesuai dengan kelas tujuan.'}
 </p>

 <div className="mt-6 flex items-center justify-end gap-2.5">
 <button
 type="button"
 disabled={formLoading}
 onClick={() => setConfirmSaveModal({ isOpen: false, mode: 'create' })}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-emerald-800/60 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
 >
 Batal
 </button>
 <button
 type="button"
 disabled={formLoading}
 onClick={handleExecuteSave}
 className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-black text-white hover:scale-[1.02] active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50 ${
 confirmSaveModal.mode === 'update'
 ? 'bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm'
 : 'bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm'
 }`}
 >
 {formLoading ? (
 <RefreshCw className="size-3.5 animate-spin" />
 ) : confirmSaveModal.mode === 'update' ? (
 <Check className="size-3.5" />
 ) : (
 <Sparkles className="size-3.5" />
 )}
 <span>
 {formLoading
 ? 'Menyimpan...'
 : confirmSaveModal.mode === 'update'
 ? 'Ya, Perbarui Data'
 : 'Ya, Simpan Penugasan'}
 </span>
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* ── HARMONIZED ERROR DIALOG MODAL ── */}
 <AnimatePresence>
 {errorDialogModal.isOpen && (
 <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 12 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="w-full max-w-md overflow-hidden rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 dark:border-emerald-800/60 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-slate-950"
 >
 <div className="p-6">
 <div className="flex items-center gap-3 mb-4">
 <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 shadow-md shadow-xs">
 <XCircle className="size-5 text-rose-600" strokeWidth={2.2} />
 </div>
 <div>
 <h4 className="text-sm font-black text-slate-900 dark:text-white">
 {errorDialogModal.title || 'Terjadi Kendala'}
 </h4>
 <span className="text-xs font-semibold text-rose-500">
 Peringatan validasi sistem
 </span>
 </div>
 </div>

 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/50 p-3.5 dark:border-emerald-800/60 dark:bg-rose-950/20">
 <p className="text-xs text-rose-800 dark:text-rose-200 leading-relaxed font-medium">
 {errorDialogModal.message || 'Operasi gagal dijalankan. Silakan periksa kembali data Anda.'}
 </p>
 </div>

 <div className="mt-6 flex items-center justify-end">
 <button
 type="button"
 onClick={() => setErrorDialogModal({ isOpen: false, title: '', message: '' })}
 className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-black hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 transition-all cursor-pointer shadow-xs"
 >
 Tutup
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* Print Option Modal */}
 <PrintOptionModal
 isOpen={isPrintModalOpen}
 onClose={() => setIsPrintModalOpen(false)}
 title="Opsi Cetak Data Penugasan"
 subtitle="Pilih metode pencetakan atau unduh dokumen penugasan"
 onPrintClean={() => {
 printCleanTable({
 title: 'Laporan Penugasan & Proyek Siswa',
 data: dataPenugasan,
 columns: [
 { header: 'Judul Penugasan', accessor: (row) => row.judul || row.judul_tugas },
 { header: 'Modul Ajar', accessor: (row) => row.modul_ajar?.judul || '-' },
 { header: 'Kelas', accessor: (row) => row.kelas?.nama_kelas || 'Semua Kelas' },
 { header: 'Tipe', accessor: (row) => row.tipe || 'individu' },
 { header: 'Deadline', accessor: (row) => row.deadline || '-' },
 { header: 'Status', accessor: (row) => row.status || 'draft' },
 ],
 })
 setIsPrintModalOpen(false)
 }}
 onDownloadPdf={() => {
 downloadPdfTable({
 title: 'Laporan Penugasan & Proyek Siswa',
 data: dataPenugasan,
 columns: [
 { header: 'Judul Penugasan', accessor: (row) => row.judul || row.judul_tugas },
 { header: 'Modul Ajar', accessor: (row) => row.modul_ajar?.judul || '-' },
 { header: 'Kelas', accessor: (row) => row.kelas?.nama_kelas || 'Semua Kelas' },
 { header: 'Tipe', accessor: (row) => row.tipe || 'individu' },
 { header: 'Deadline', accessor: (row) => row.deadline || '-' },
 { header: 'Status', accessor: (row) => row.status || 'draft' },
 ],
 filename: `laporan_penugasan_${new Date().toISOString().slice(0, 10)}.pdf`,
 })
 setIsPrintModalOpen(false)
 }}
 />

 {/* CSV Import Modal */}
 <CsvImportModal
 isOpen={importOpen}
 onClose={() => setImportOpen(false)}
 title="Import Data Penugasan"
 onImport={handleImport}
 templateFields={['judul', 'deskripsi', 'tipe', 'jenis_tugas', 'deadline', 'status']}
 />

 {/* IN-APP EMBED VIEWER MODAL (HERO UI STYLE) */}
 <InAppEmbedViewerModal
 isOpen={embedViewer.isOpen}
 url={embedViewer.url}
 title={embedViewer.title}
 subtitle={embedViewer.subtitle}
 onClose={() => setEmbedViewer({ isOpen: false, url: '', title: '', subtitle: '' })}
 />

 </motion.div>
 </div>
 )

 if (!embedded && isTeacherOnly) {
 return <Navigate to="/portal-guru/workspace?tab=penugasan" replace />
 }

 return (
 <PageContainer maxW="7xl">
 {!(embedded || hideBreadcrumb) && (
 <AppBreadcrumb
 items={[
 { label: 'LMS & Akademik', href: '/dashboard' },
 { label: 'Penugasan & Asesmen' },
 ]}
 />
 )}
 {pageContent}
 </PageContainer>
 )
}
