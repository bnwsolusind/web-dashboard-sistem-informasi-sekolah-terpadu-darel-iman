import { HeroUiHeader } from "../components/ui/HeroUiHeader"
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  DatePicker
} from '@/components/ui/date-picker'
import {
  AlertCircle,
  AlertTriangle,
  Award,
  BookOpenCheck,
  CalendarDays,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Clock,
  Eye,
  FilePlus2,
  GraduationCap,
  Hash,
  HeartPulse,
  Info,
  Lock,
  NotebookPen,
  Pencil,
  Play,
  PlayCircle,
  Printer,
  RotateCcw,
  Save,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Square,
  Type,
  UserCheck,
  Users,
  X
} from 'lucide-react'
import {
  useParams,
  useSearchParams
} from 'react-router-dom'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  cn
} from '../lib/utils'
import {
  TableRoot,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table'
import {
  Badge
} from '@/components/ui/badge'
import {
  Pagination
} from '@/components/ui/pagination'
import {
  useDebounce
} from '../hooks/useDebounce'
import {
  lmsPresensiService
} from '../services/lmsPresensiService'
import api from '../services/api'
import {
  useAuthStore
} from '../stores/authStore'
import {
  getUserRoleLevel,
  hasRoleLevel,
  hasAnyRole,
  ROLE_LEVELS
} from '../auth/portalResolver'
import {
  AttendanceCapturePanel,
  AttendanceMethodSelector
} from '../components/attendance/AttendanceCapturePanels'
import {
  WorkflowStepBar
} from '../components/common/WorkflowStepBar'
import {
  SquircleActionButton,
  PrintOptionModal
} from '../components/master-data'
import {
  printCleanTable,
  downloadPdfTable
} from '../utils/printHelper'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import PageContainer from '../components/app/PageContainer'
import AppSkeleton from '../components/app/AppSkeleton'
import AppEmptyState from '../components/app/AppEmptyState'
import AppErrorState from '../components/app/AppErrorState'
import {
  useToast,
  KpiStatCard
} from '../components/app'

const today = new Date().toLocaleDateString('en-CA')
const unwrapPage = (response) => {
 const payload = response?.data?.data || response?.data || []
 return Array.isArray(payload) ? payload : (payload?.data || [])
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


function Metric({ icon: Icon, label, subtext, value, tag, tone = 'emerald', onClick }) {
 const toneMap = { emerald: 'emerald', amber: 'amber', blue: 'sky', violet: 'indigo', rose: 'rose' }
 return (
 <KpiStatCard
 title={label}
 value={value ?? '0'}
 description={subtext}
 badge={tag}
 icon={Icon}
 variant={toneMap[tone] || 'emerald'}
 onClick={onClick}
 />
 )
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
 {selectedOption && selectedOption.value !== '' ? (
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
 className="absolute left-0 right-0 top-full mt-1.5 z-[90] overflow-hidden rounded-xl border border-emerald-200/80 bg-white/95 backdrop-blur-md shadow-2xl dark:border-emerald-800/80 dark:bg-[#182232]/95"
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
 aria-label={label ? `Cari pilihan ${label}` : placeholder ? `Cari pilihan ${placeholder}` : 'Cari pilihan'}
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
 ariaLabel = '',
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
 aria-label={ariaLabel}
 onClick={() => {
 setIsOpen((prev) => !prev)
 setSearch('')
 }}
 className={`h-9 sm:h-10 w-full sm:w-auto min-w-[130px] flex items-center justify-between gap-2 rounded-lg border px-3 text-xs font-semibold transition-all duration-200 cursor-pointer ${
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
 aria-label={ariaLabel ? `Cari ${ariaLabel}` : placeholder ? `Cari ${placeholder}` : 'Cari pilihan'}
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

function TeacherWorkspace({ activeScheduleId = '', activeDate = '', requestedSessionId = '' }) {
 const storeUser = useAuthStore((state) => state.user)
 const currentUser = storeUser || (() => {
 try {
 return JSON.parse(localStorage.getItem('school_erp_user') || '{}')
 } catch {
 return {}
 }
 })()
 const authUser = currentUser

 const roleNames = (Array.isArray(currentUser?.roles) ? currentUser.roles : [])
 .map((role) => typeof role === 'string' ? role : role?.name)
 .filter(Boolean)
 const userRole = String(currentUser?.role || currentUser?.user_type || roleNames[0] || '').toLowerCase()

 const isOverrideUser = hasRoleLevel(currentUser, ROLE_LEVELS.KEPALA_SEKOLAH) || // Level <= 4 (Super Admin, Admin, Yayasan, TU/Operator, Kepsek, Divisi)
 hasAnyRole(currentUser?.roles || currentUser?.role, [
 'Super Admin', 'super_admin', 'Admin', 'admin', 'Pengurus Yayasan', 'Yayasan',
 'Tata Usaha', 'TU', 'tata_usaha', 'Operator', 'operator',
 'Kepala Sekolah', 'kepala_sekolah', 'Divisi Pendidikan', 'divisi_pendidikan'
 ])

 const activeLogin = Boolean(activeScheduleId)
 const [date, setDate] = useState(activeDate || today)
 const [schedules, setSchedules] = useState([])
 const [scheduleId, setScheduleId] = useState('')
 const [students, setStudents] = useState([])
 const [meeting, setMeeting] = useState(1)
 const [topic, setTopic] = useState('')
 const [notes, setNotes] = useState('')
 const [session, setSession] = useState(null)
 const [busy, setBusy] = useState(false)
 const [rosterLoading, setRosterLoading] = useState(false)
 const [rosterError, setRosterError] = useState('')
 const [reloadKey, setReloadKey] = useState(0)
 const [captureBusy, setCaptureBusy] = useState(false)
 const [reviewMode, setReviewMode] = useState(false)
 const [method, setMethod] = useState('manual')
 const [substituteReason, setSubstituteReason] = useState('')
 const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
 const [printTeacherFilter, setPrintTeacherFilter] = useState('')
 const toast = useToast()
 const toastSuccess = (title, message) => toast.success(title, message)
 const toastError = (title, message) => toast.error(title, message)
 const toastWarning = (title, message) => toast.warning(title, message)

 const scheduleOptions = useMemo(() => [
 { value: '', label: schedules.length === 0 ? 'Belum ada jadwal pelajaran' : 'Pilih Jadwal Pelajaran' },
 ...schedules.map((item) => ({
 value: String(item.id),
 label: `${item.subject?.name || item.subject?.nama_mapel || 'Mapel'} · ${item.kelas?.nama_kelas || item.kelas?.name || 'Kelas'} · ${item.time_start?.slice(0, 5)}–${item.time_end?.slice(0, 5)} WIB`,
 })),
 ], [schedules])

 const teachersList = useMemo(() => {
 const map = new Map()
 schedules.forEach((item) => {
 const emp = item.employee || item.teacher
 if (emp && emp.id && !map.has(emp.id)) {
 map.set(emp.id, {
 id: emp.id,
 nama_lengkap: emp.nama_lengkap || emp.name || 'Guru',
 niy: emp.niy || emp.nip || '',
 })
 }
 })
 return Array.from(map.values())
 }, [schedules])

 const handleTeacherChange = (teacherId) => {
 setPrintTeacherFilter(teacherId)
 if (teacherId) {
 const matchingSchedule = schedules.find(
 (s) => (s.employee?.id || s.employee_id || s.teacher_id) === teacherId
 )
 if (matchingSchedule) {
 setScheduleId(matchingSchedule.id)
 }
 }
 }

 const formatStatusLabel = (status) => {
 switch (status) {
 case 'hadir':
 return 'Hadir'
 case 'terlambat':
 return 'Terlambat'
 case 'izin':
 return 'Izin'
 case 'sakit':
 return 'Sakit'
 case 'alpa':
 return 'Alpha'
 case 'dispensasi':
 return 'Dispensasi'
 case 'belum_diverifikasi':
 case 'belum_diisi':
 default:
 return 'Belum Diisi'
 }
 }

 const handlePrintClean = () => {
 if (!students.length) {
 toastWarning('Roster Siswa Kosong', 'Pilih jadwal pelajaran yang memiliki daftar siswa terlebih dahulu.')
 return
 }

 const teacherName = selected?.employee?.nama_lengkap || selected?.teacher?.name || currentUser?.nama_lengkap || currentUser?.name || '-'
 const teacherNiy = selected?.employee?.niy || selected?.employee?.nip || currentUser?.niy || '-'
 const subjectName = selected?.subject?.name || selected?.subject?.nama_mapel || '-'
 const className = selected?.kelas?.nama_kelas || selected?.kelas?.name || '-'
 const timeRange = selected?.time_start && selected?.time_end ? `${selected.time_start.slice(0, 5)} - ${selected.time_end.slice(0, 5)}` : '-'

 const headers = [
 'NO',
 'NIS / NISN',
 'NAMA SISWA',
 'KELAS',
 'MATA PELAJARAN',
 'GURU PENGAMPU',
 'STATUS PRESENSI',
 'JAM HADIR',
 'CATATAN',
 ]

 const rows = students.map((s, idx) => [
 idx + 1,
 s.nis || s.nisn || '-',
 s.full_name || s.name || s.nama || '-',
 className,
 subjectName,
 teacherName,
 formatStatusLabel(s.status),
 s.arrival_time || '-',
 s.notes || '-',
 ])

 const subtitleInfo = `Guru: ${teacherName}${teacherNiy !== '-' ? ` (NIY/NIP: ${teacherNiy})` : ''} | Mapel: ${subjectName} | Kelas: ${className} | Tanggal: ${date} (${timeRange}) | Pertemuan ke-${meeting}`

 printCleanTable({
 title: 'DAFTAR MURID & PRESENSI MATA PELAJARAN',
 subtitle: subtitleInfo,
 headers,
 rows,
 })
 }

 const handleDownloadPdf = () => {
 if (!students.length) {
 toastWarning('Roster Siswa Kosong', 'Pilih jadwal pelajaran yang memiliki daftar siswa terlebih dahulu.')
 return
 }

 const teacherName = selected?.employee?.nama_lengkap || selected?.teacher?.name || currentUser?.nama_lengkap || currentUser?.name || '-'
 const teacherNiy = selected?.employee?.niy || selected?.employee?.nip || currentUser?.niy || '-'
 const subjectName = selected?.subject?.name || selected?.subject?.nama_mapel || '-'
 const className = selected?.kelas?.nama_kelas || selected?.kelas?.name || '-'
 const timeRange = selected?.time_start && selected?.time_end ? `${selected.time_start.slice(0, 5)} - ${selected.time_end.slice(0, 5)}` : '-'

 const headers = [
 'NO',
 'NIS / NISN',
 'NAMA SISWA',
 'KELAS',
 'MATA PELAJARAN',
 'GURU PENGAMPU',
 'STATUS PRESENSI',
 'JAM HADIR',
 'CATATAN',
 ]

 const rows = students.map((s, idx) => [
 idx + 1,
 s.nis || s.nisn || '-',
 s.full_name || s.name || s.nama || '-',
 className,
 subjectName,
 teacherName,
 formatStatusLabel(s.status),
 s.arrival_time || '-',
 s.notes || '-',
 ])

 const subtitleInfo = `Guru: ${teacherName}${teacherNiy !== '-' ? ` (NIY/NIP: ${teacherNiy})` : ''} | Mapel: ${subjectName} | Kelas: ${className} | Tanggal: ${date} (${timeRange}) | Pertemuan ke-${meeting}`

 downloadPdfTable({
 title: 'DAFTAR MURID & PRESENSI MATA PELAJARAN',
 subtitle: subtitleInfo,
 headers,
 rows,
 filename: `Daftar_Murid_${subjectName.replace(/\s+/g, '_')}_${className.replace(/\s+/g, '_')}_${date}.pdf`,
 })
 }

 useEffect(() => {
 let cancelled = false
 const loadSchedules = async () => {
 try {
 const response = activeLogin
 ? await lmsPresensiService.getActiveSchedules()
 : await lmsPresensiService.getMySchedules(date)
 if (cancelled) return
 const list = activeLogin ? (response?.data?.schedules || []) : (response?.data || [])
 setSchedules(list)
 const findBestScheduleId = (items, targetId) => {
 if (!items || items.length === 0) return ''
 if (targetId && items.some((item) => String(item.id) === String(targetId))) {
 return targetId
 }
 // 1. Detect if any schedule is currently ongoing right now
 const now = new Date()
 const currentMin = now.getHours() * 60 + now.getMinutes()
 const ongoing = items.find((item) => {
 if (!item.time_start || !item.time_end) return false
 const [sH, sM] = String(item.time_start).split(':').map(Number)
 const [eH, eM] = String(item.time_end).split(':').map(Number)
 const startMin = (sH || 0) * 60 + (sM || 0)
 const endMin = (eH || 0) * 60 + (eM || 0)
 return currentMin >= startMin && currentMin <= endMin
 })
 if (ongoing) return ongoing.id

 // 2. Detect next upcoming schedule today
 const upcoming = items.find((item) => {
 if (!item.time_start) return false
 const [sH, sM] = String(item.time_start).split(':').map(Number)
 const startMin = (sH || 0) * 60 + (sM || 0)
 return startMin > currentMin
 })
 if (upcoming) return upcoming.id

 return items[0]?.id || ''
 }

 const bestId = findBestScheduleId(list, activeScheduleId)
 setScheduleId((current) => {
 if (activeLogin && activeScheduleId && list.some((item) => String(item.id) === String(activeScheduleId))) {
 return activeScheduleId
 }
 if (current && list.some((item) => String(item.id) === String(current))) {
 return current
 }
 return bestId
 })
 } catch (error) {
 if (!cancelled) {
 setSchedules([])
 setScheduleId('')
 setRosterError(error.response?.data?.message || 'Jadwal pelajaran belum dapat dimuat.')
 }
 }
 }
 loadSchedules()
 return () => { cancelled = true }
 }, [activeLogin, activeScheduleId, date])

 useEffect(() => {
 if (!scheduleId) {
 setStudents([])
 setSession(null)
 return undefined
 }

 let cancelled = false
 const loadRoster = async () => {
 setRosterLoading(true)
 setRosterError('')
 try {
 const rosterResponse = await lmsPresensiService.getScheduleStudents(scheduleId, date, activeLogin ? 'active_login' : null)
 let existingSession = rosterResponse?.session || null
 const activeSchedule = schedules.find((item) => item.id === scheduleId)
 const sessionId = requestedSessionId || activeSchedule?.attendance_session_id
 if (!existingSession && sessionId) {
 const existingResponse = await lmsPresensiService.getSession(sessionId)
 existingSession = existingResponse?.data || null
 }
 if (cancelled) return
 const attendanceByStudent = new Map(
 (existingSession?.attendances || []).map((item) => [item.siswa_id, item])
 )
 setSession(existingSession)
 setStudents((rosterResponse?.data || []).map((student) => {
 const recorded = attendanceByStudent.get(student.id)
 return {
 ...student,
 status: recorded?.status_hadir || 'belum_diverifikasi',
 recommended_status: student.recommended_status || null,
 arrival_time: recorded?.arrival_time?.slice(0, 5) || '',
 notes: recorded?.keterangan || '',
 verification_status: recorded?.verification_status || 'unverified',
 recorded_method: recorded?.recorded_method || null,
 }
 }))
 } catch (error) {
 if (!cancelled) {
 setStudents([])
 setSession(null)
 setRosterError(error.response?.data?.message || 'Roster siswa belum dapat dimuat.')
 }
 } finally {
 if (!cancelled) setRosterLoading(false)
 }
 }
 loadRoster()
 return () => { cancelled = true }
 }, [activeLogin, scheduleId, date, schedules, requestedSessionId, reloadKey])

 const selected = schedules.find((item) => item.id === scheduleId)
 const teachingSessionStatus = session?.teaching_session_status ?? selected?.teaching_session_status ?? null
 const hasStep04Context = activeLogin || teachingSessionStatus !== null
 const step04Blocked = hasStep04Context && teachingSessionStatus !== 'active'
 const captureStarted = Boolean(
 session?.session_started_at
 && !session?.session_closed_at
 && (!session?.session_expires_at || new Date(session.session_expires_at).getTime() > Date.now())
 )
 const sessionFinal = ['final', 'locked', 'cancelled'].includes(session?.status)

 // Status Presensi Kehadiran Guru Mengajar
 const isTeacherCheckedIn = Boolean(
 (session?.session_started_at && !session?.session_closed_at) ||
 session?.teaching_session_status === 'active' ||
 captureStarted
 )
 const isSessionFinished = sessionFinal || Boolean(session?.session_closed_at && session?.teaching_session_status === 'completed')
 const isTeacherReadyOrActive = isTeacherCheckedIn || isSessionFinished || isOverrideUser

 // Live Timer Stopwatch KBM
 const [elapsedSeconds, setElapsedSeconds] = useState(0)
 useEffect(() => {
 let timer
 if (session?.session_started_at && !session?.session_closed_at && !sessionFinal) {
 const startTime = new Date(session.session_started_at).getTime()
 const updateTimer = () => {
 const diff = Math.max(0, Math.floor((Date.now() - startTime) / 1000))
 setElapsedSeconds(diff)
 }
 updateTimer()
 timer = window.setInterval(updateTimer, 1000)
 } else {
 setElapsedSeconds(0)
 }
 return () => window.clearInterval(timer)
 }, [session?.session_started_at, session?.session_closed_at, sessionFinal])

 const formatElapsed = (sec) => {
 const h = Math.floor(sec / 3600).toString().padStart(2, '0')
 const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0')
 const s = (sec % 60).toString().padStart(2, '0')
 return h !== '00' ? `${h}:${m}:${s}` : `${m}:${s}`
 }

 // Handler Check-In Hadir Guru Mengajar
 const handleTeacherCheckIn = async () => {
 if (captureBusy || isTeacherCheckedIn || sessionFinal) return
 if (!scheduleId || !students.length) {
 toastWarning('Pilih Jadwal Terlebih Dahulu', 'Silakan pilih jadwal pelajaran yang memiliki daftar siswa aktif.')
 return
 }
 if (!isScheduleTimeActive) {
 toastWarning('Di Luar Jam KBM', 'Presensi hanya dapat diambil saat jam pelajaran KBM sedang berlangsung sesuai jadwal.')
 return
 }
 setCaptureBusy(true)
 try {
 const draft = session?.id ? session : await save(false, { silent: true })
 if (!draft?.id) {
 toastError('Sesi Belum Siap', 'Gagal membuat sesi KBM untuk jadwal ini.')
 return
 }
 const response = await lmsPresensiService.startCaptureSession(draft.id)
 const nextSession = response?.data?.session || response?.data || null
 const updatedSession = nextSession || {
 ...draft,
 session_started_at: new Date().toISOString(),
 teaching_session_status: 'active',
 }
 setSession(updatedSession)
 toastSuccess('Presensi Guru Berhasil!', 'Kehadiran mengajar Anda telah tercatat dan tersinkron ke Kepala Sekolah & Divisi Pendidikan. Daftar hadir siswa rombel sekarang terbuka.')
 } catch (error) {
 toastError('Check-in Belum Berhasil', error.response?.data?.message || 'Gagal melakukan check-in guru mengajar.')
 } finally {
 setCaptureBusy(false)
 }
 }

 // Handler Tutup Sesi Mengajar Guru
 const handleTeacherCloseTeaching = async () => {
 if (captureBusy || !session?.id) return
 setCaptureBusy(true)
 try {
 const response = await lmsPresensiService.closeCaptureSession(session.id)
 const updatedSession = response?.data || {
 ...session,
 session_closed_at: new Date().toISOString(),
 teaching_session_status: 'completed',
 }
 setSession(updatedSession)
 toastSuccess('KBM Selesai', 'Sesi jam mengajar berhasil ditutup dan tercatat di sistem pemantauan.')
 } catch (error) {
 toastError('Gagal Menutup Sesi', error.response?.data?.message || 'Sesi KBM tidak dapat ditutup.')
 } finally {
 setCaptureBusy(false)
 }
 }

 // Grace Period Time Guard for Teacher Lesson Attendance:
 // Aktif jika jadwal ada pada hari ini. Toleransi pengisian diberikan hingga akhir hari sekolah agar guru tidak terblokir saat jam mapel lewat.
 const isScheduleTimeActive = useMemo(() => {
 if (isOverrideUser) return true
 if (!selected || !selected.time_start || !selected.time_end) return false
 const now = new Date()
 const currentDayIso = now.getDay() === 0 ? 7 : now.getDay()

 if (date !== today) return false
 if (selected.day_of_week && Number(selected.day_of_week) !== currentDayIso) return false

 // Toleransi hingga akhir hari untuk tanggal KBM yang sama
 return true
 }, [selected, date, isOverrideUser])

 const isLockedForTeacher = sessionFinal || (!isScheduleTimeActive && !isTeacherCheckedIn)

 const [lateModalStudent, setLateModalStudent] = useState(null)
 const [lateArrivalTime, setLateArrivalTime] = useState('')
 const [lateReason, setLateReason] = useState('')

 const handleOpenLateModal = (student) => {
 if (isLockedForTeacher || reviewMode) return
 const currentNow = new Date().toTimeString().slice(0, 5)
 setLateModalStudent(student)
 setLateArrivalTime(student.arrival_time || currentNow)
 setLateReason(student.notes || '')
 }

 const handleSaveLateModal = () => {
 if (!lateModalStudent) return
 if (!lateReason.trim()) {
 toastWarning('Alasan Wajib Diisi', 'Mohon isi alasan keterlambatan ananda agar dapat diketahui oleh orang tua.')
 return
 }
 updateStudent(lateModalStudent.id, {
 status: 'terlambat',
 arrival_time: lateArrivalTime || new Date().toTimeString().slice(0, 5),
 notes: lateReason.trim(),
 recorded_method: 'manual',
 verification_status: 'verified',
 })
 toastSuccess('Keterlambatan Dicatat', `Status ${lateModalStudent.full_name} diatur Terlambat dengan alasan: "${lateReason.trim()}".`)
 setLateModalStudent(null)
 }

 // Violation & Discipline Modal State for Teacher (Tahap 1)
 const [violationModalStudent, setViolationModalStudent] = useState(null)
 const [violationCategories, setViolationCategories] = useState([])
 const [selectedViolationCategory, setSelectedViolationCategory] = useState('')
 const [violationPointDeduction, setViolationPointDeduction] = useState(5)
 const [violationDescription, setViolationDescription] = useState('')
 const [violationReferBk, setViolationReferBk] = useState(false)
 const [violationSaving, setViolationSaving] = useState(false)

 const violationCategoryOptions = useMemo(() => {
 return violationCategories.map((cat) => ({
 value: String(cat.id),
 label: `[${cat.code || 'VIO'}] ${cat.name} (${cat.point_weight || -5} poin) - Level ${cat.level || 'ringan'}`,
 }))
 }, [violationCategories])

 const handleOpenViolationModal = async (student) => {
 setViolationModalStudent(student)
 setViolationDescription('')
 setViolationReferBk(false)
 if (violationCategories.length === 0) {
 try {
 const res = await api.get('/teacher/discipline-categories?type=violation')
 const items = res.data?.data || []
 setViolationCategories(items)
 if (items.length > 0) {
 setSelectedViolationCategory(items[0].id)
 setViolationPointDeduction(Math.abs(items[0].point_weight || 5))
 }
 } catch (err) {
 console.error('Failed to load discipline categories:', err)
 }
 } else {
 setSelectedViolationCategory(violationCategories[0]?.id || '')
 setViolationPointDeduction(Math.abs(violationCategories[0]?.point_weight || 5))
 }
 }

 const handleCategoryChange = (catId) => {
 setSelectedViolationCategory(catId)
 const found = violationCategories.find((c) => String(c.id) === String(catId))
 if (found) {
 setViolationPointDeduction(Math.abs(found.point_weight || 5))
 }
 }

 const handleSaveViolationModal = async () => {
 if (!violationModalStudent || !selectedViolationCategory) return
 if (!violationDescription.trim()) {
 toastWarning('Deskripsi Wajib Diisi', 'Mohon isi catatan atau kronologi kejadian pelanggaran santri.')
 return
 }
 setViolationSaving(true)
 try {
 const activeSchedule = schedules.find((s) => String(s.id) === String(scheduleId))
 await api.post('/teacher/discipline-violations', {
 student_id: violationModalStudent.id,
 category_id: selectedViolationCategory,
 points: -Math.abs(violationPointDeduction),
 custom_points: violationPointDeduction,
 description: violationDescription.trim(),
 transaction_date: date || today,
 status: violationReferBk ? 'dirujuk_bk' : 'tercatat',
 follow_up: violationReferBk ? 'Dirujuk ke Guru BK / Wali Kelas' : null,
 class_id: activeSchedule?.class_id || activeSchedule?.kelas_id || null,
 schedule_id: scheduleId || null,
 })
 toastSuccess(
 'Pelanggaran Berhasil Dicatat',
 `Pelanggaran santri ${violationModalStudent.full_name} (-${violationPointDeduction} poin) telah tersimpan ke Buku Poin & tersinkron ke Portal Orang Tua.`
 )
 setViolationModalStudent(null)
 } catch (err) {
 console.error('Failed to save discipline violation:', err)
 toastError('Gagal Menyimpan', err.response?.data?.message || 'Gagal menyimpan catatan pelanggaran santri.')
 } finally {
 setViolationSaving(false)
 }
 }

 const updateStudent = (id, values) => setStudents((list) => list.map((student) => student.id === id ? { ...student, ...values } : student))
 const markAllPresent = () => setStudents((list) => list.map((student) => ({
 ...student,
 status: 'hadir',
 recorded_method: 'manual',
 verification_status: 'verified',
 })))
 const applyScan = (result) => updateStudent(result.student.id, {
 status: result.attendance_status || 'hadir',
 arrival_time: result.recorded_at ? new Date(result.recorded_at).toTimeString().slice(0, 5) : '',
 recorded_method: method === 'qr' ? 'qr_code' : method === 'face' ? 'face_recognition' : method,
 verification_status: method === 'face' ? 'pending' : 'verified',
 })

 const save = async (finalize = false, { silent = false } = {}) => {
 if (isLockedForTeacher) {
 if (!silent) toastError('Absensi Telah Selesai!', 'Sesi presensi ini telah berstatus final dan tidak dapat diubah lagi.')
 return null
 }
 if (!scheduleId || !students.length) return null

 setBusy(true)
 try {
 const result = await lmsPresensiService.saveDraft({
 schedule_id: scheduleId, attendance_date: date, meeting_number: Number(meeting),
 topic, meeting_notes: notes,
 attendance_context: activeLogin ? 'active_login' : undefined,
 substitute_reason: selected?.requires_substitute_reason ? substituteReason : undefined,
 items: students.map((student) => ({
 student_id: student.id, status: student.status,
 arrival_time: student.arrival_time || null, notes: student.notes || null,
 recorded_method: student.recorded_method || null,
 })),
 })
 const saved = result.data
 setSession(saved)
 if (finalize) {
 const finalized = await lmsPresensiService.finalize(saved.id)
 setSession(finalized?.data || { ...saved, status: 'final' })
 }
 if (!silent) toastSuccess(finalize ? 'Presensi Difinalisasi' : 'Draft Tersimpan', finalize ? 'Data presensi siswa berhasil diverifikasi dan difinalisasi.' : 'Data presensi berhasil disimpan sebagai draft.')
 return saved
 } catch (error) {
 if (!silent) toastError('Presensi Belum Tersimpan', error.response?.data?.message || 'Periksa kembali data presensi.')
 return null
 } finally {
 setBusy(false)
 }
 }

 const startCapture = async () => {
 if (captureBusy || sessionFinal || isLockedForTeacher) return
 setCaptureBusy(true)
 try {
 const draft = session?.id ? session : await save(false, { silent: true })
 if (!draft?.id) {
 toastError('Sesi Belum Siap', 'Simpan roster siswa terlebih dahulu sebelum membuka capture QR.')
 return
 }
 const response = await lmsPresensiService.startCaptureSession(draft.id)
 const nextSession = response?.data?.session || response?.data || null
 setSession(nextSession)
 toastSuccess('Capture Dibuka', 'Sesi QR aktif. Setiap scan tetap divalidasi server.')
 } catch (error) {
 toastError('Capture Belum Dibuka', error.response?.data?.message || 'Sesi presensi tidak dapat dimulai.')
 } finally {
 setCaptureBusy(false)
 }
 }

 const closeCapture = async () => {
 if (captureBusy || !session?.id || !captureStarted) return
 setCaptureBusy(true)
 try {
 const response = await lmsPresensiService.closeCaptureSession(session.id)
 setSession(response?.data || null)
 toastSuccess('Capture Ditutup', 'Roster tetap dapat diperiksa dan difinalisasi.')
 } catch (error) {
 toastError('Capture Belum Ditutup', error.response?.data?.message || 'Sesi presensi tidak dapat ditutup.')
 } finally {
 setCaptureBusy(false)
 }
 }

 const statusCounts = students.reduce((counts, student) => {
 const status = student.status || 'belum_diverifikasi'
 counts[status] = (counts[status] || 0) + 1
 return counts
 }, {})
 const unmarkedCount = (statusCounts.belum_diverifikasi || 0) + (statusCounts.belum_diisi || 0)

 // Search & Filtering for Roster
 const [studentSearch, setStudentSearch] = useState('')
 const [studentStatusFilter, setStudentStatusFilter] = useState('all')
 const [studentPage, setStudentPage] = useState(1)
 const studentPerPage = 10
 const debouncedStudentSearch = useDebounce(studentSearch, 350)

 const filteredStudents = useMemo(() => {
 let list = students
 if (studentStatusFilter !== 'all') {
 if (studentStatusFilter === 'izin_sakit') {
 list = list.filter((s) => ['izin', 'sakit'].includes(s.status))
 } else if (studentStatusFilter === 'belum') {
 list = list.filter((s) => ['belum_diverifikasi', 'belum_diisi', ''].includes(s.status) || !s.status)
 } else {
 list = list.filter((s) => s.status === studentStatusFilter)
 }
 }
 if (debouncedStudentSearch.trim()) {
 const q = debouncedStudentSearch.toLowerCase().trim()
 list = list.filter((s) =>
 (s.full_name || '').toLowerCase().includes(q) ||
 (s.nis || '').toLowerCase().includes(q) ||
 (s.nisn || '').toLowerCase().includes(q)
 )
 }
 return list
 }, [students, studentStatusFilter, debouncedStudentSearch])

 const totalStudentPages = Math.max(1, Math.ceil(filteredStudents.length / studentPerPage))
 const paginatedStudents = useMemo(() => {
 const start = (studentPage - 1) * studentPerPage
 return filteredStudents.slice(start, start + studentPerPage)
 }, [filteredStudents, studentPage, studentPerPage])

 return (
 <div className="space-y-6 sm:space-y-8 pb-10">
 {/* Workflow Step Indicator */}
 <WorkflowStepBar
 moduleName="Presensi Mengajar Guru Mapel & Roster Kelas"
 currentStepIndex={
 sessionFinal
 ? 3
 : reviewMode
 ? 2
 : isTeacherReadyOrActive
 ? 2
 : scheduleId
 ? 1
 : 0
 }
 steps={[
 { label: 'Jadwal & Jurnal' },
 { label: 'Presensi Guru' },
 { label: 'Presensi Siswa', onClick: () => isTeacherReadyOrActive && setReviewMode(false) },
 { label: 'Finalisasi', onClick: () => isTeacherReadyOrActive && setReviewMode(true) },
 ]}
 />

 {/* Sesi Final Alert Banner */}
 {selected && sessionFinal && (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/90 p-4 sm:p-5 text-sm font-semibold text-rose-800 shadow-sm dark:border-emerald-800/60 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-3.5">
 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300">
 <Lock className="size-5" />
 </div>
 <div>
 <h4 className="font-extrabold text-sm sm:text-base text-rose-900 dark:text-rose-200">Presensi Sesi Ini Telah Selesai (Final)</h4>
 <p className="text-xs font-medium text-rose-700 dark:text-rose-300/90 mt-0.5">
 Sesi presensi jam pelajaran ini telah diverifikasi dan dikunci. Data berstatus permanen (read-only) untuk rekapitulasi rapor dan laporan presensi.
 </p>
 </div>
 </div>
 )}

 {/* =========================================================================
 HERO CARD 1: PRESENSI MENGAJAR GURU PENGAMPU (KBM CHECK-IN)
 SOP: Guru Pengampu WAJIB check-in sebelum presensi siswa rombel terbuka.
 Sinkronisasi langsung ke Dashboard Pemantauan Kepala Sekolah & Divisi.
 ========================================================================= */}
 <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] p-6 sm:p-7 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 {/* Ambient Multi-tone Glows */}

 <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
 {/* Info Guru & Status Mengajar */}
 <div className="flex items-start sm:items-center gap-4 sm:gap-5">
 <div className="relative flex size-14 sm:size-16 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-300 shadow-lg shadow-xs">
 <GraduationCap className="size-7 sm:size-8" />
 {isTeacherCheckedIn && !isSessionFinished && (
 <span className="absolute -top-1 -right-1 flex h-4 w-4">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
 <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-emerald-200/80 dark:border-emerald-800/60"></span>
 </span>
 )}
 </div>

 <div className="min-w-0 space-y-1.5">
 <div className="flex flex-wrap items-center gap-2">
 <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
 <Sparkles className="size-3 text-emerald-600 dark:text-emerald-400" />
 Langkah 1: Presensi Guru Pengampu
 </span>
 {isSessionFinished ? (
 <Badge color="success" size="sm">
 Selesai Mengajar
 </Badge>
 ) : isTeacherCheckedIn ? (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-600 text-white shadow-xs animate-pulse">
 <span className="size-2 rounded-full bg-white" />
 Sedang Mengajar (Aktif)
 </span>
 ) : isOverrideUser ? (
 <Badge color="cyan" size="sm">
 Akses Pengawas / TU (Override)
 </Badge>
 ) : !isScheduleTimeActive ? (
 <Badge color="gray" size="sm">
 Di Luar Jam KBM (Presensi Nonaktif)
 </Badge>
 ) : (
 <Badge color="warning" size="sm">
 Belum Check-In Mengajar
 </Badge>
 )}
 </div>

 <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
 {selected?.employee?.nama_lengkap || selected?.teacher?.name || authUser?.nama_lengkap || authUser?.name || currentUser?.nama_lengkap || currentUser?.name || 'Guru Mata Pelajaran'}
 </h2>

 <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-x-2 gap-y-1">
 <span className="font-bold text-emerald-800 dark:text-emerald-300">
 {selected?.subject?.name || selected?.subject?.nama_mapel || 'Pilih Jadwal Pelajaran'}
 </span>
 {selected && <span>•</span>}
 {selected && <span>Kelas {selected?.kelas?.nama_kelas || selected?.kelas?.name}</span>}
 {selected && <span>•</span>}
 {selected && <span>{selected?.time_start?.slice(0, 5)}–{selected?.time_end?.slice(0, 5)} WIB</span>}
 </p>

 {/* Real-time Kepsek & Divisi Sync Notice */}
 <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 pt-0.5">
 <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
 <span>Tersinkron otomatis ke Panel Pemantauan Kepala Sekolah & Divisi Pendidikan</span>
 </div>
 </div>
 </div>

 {/* Stopwatch & Action Button Panel */}
 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 pt-2 lg:pt-0">
 {/* Live Stopwatch KBM */}
 {isTeacherCheckedIn && !isSessionFinished && (
 <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs backdrop-blur-sm">
 <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
 <Clock className="size-4 animate-spin-slow" />
 </div>
 <div>
 <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Durasi Mengajar</p>
 <p className="text-base font-black font-mono text-emerald-700 dark:text-emerald-400 leading-none">
 {formatElapsed(elapsedSeconds)}
 </p>
 </div>
 </div>
 )}

 {/* Tombol Check-In / Tutup Sesi */}
 {!isTeacherCheckedIn && !isSessionFinished ? (
 <button
 type="button"
 onClick={handleTeacherCheckIn}
 disabled={captureBusy || !scheduleId || !students.length || (!isScheduleTimeActive && !isOverrideUser)}
 className={`inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-black text-xs sm:text-sm tracking-wide shadow-lg border transition-all duration-200 ${
 (isScheduleTimeActive || isOverrideUser) ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-emerald-500 shadow-md shadow-emerald-600/25 hover:scale-[1.02] active:scale-95 cursor-pointer'
 : 'bg-slate-200 text-slate-500 border-emerald-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-emerald-800/60 cursor-not-allowed opacity-75 shadow-none'
 }`}
 title={isOverrideUser ? 'Buka sesi KBM secara administratif' : !isScheduleTimeActive ? 'Tombol presensi hanya aktif pada jam pelajaran KBM berlangsung' : 'Mulai jam mengajar'}
 >
 {captureBusy ? (
 <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
 ) : (
 <UserCheck className="size-5" />
 )}
 <span>
 {isOverrideUser
 ? 'Check-In Sesi KBM'
 : !isScheduleTimeActive
 ? 'Presensi Tidak Aktif (Di Luar Jam KBM)'
 : 'Check-In Mulai Mengajar'}
 </span>
 </button>
 ) : isTeacherCheckedIn && !isSessionFinished ? (
 <button
 type="button"
 onClick={handleTeacherCloseTeaching}
 disabled={captureBusy}
 className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/90 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-xs transition-all duration-200 cursor-pointer disabled:opacity-50"
 title="Tutup jam mengajar sesi ini"
 >
 <Square className="size-4 text-slate-500 dark:text-slate-400" />
 <span>Akhiri Jam Mengajar</span>
 </button>
 ) : null}
 </div>
 </div>
 </div>

 {/* =========================================================================
 CARD 2: PEMILIHAN JADWAL & JURNAL KBM
 Layout lapang dan teratur dengan grid responsif tanpa memotong popover/dropdown.
 ========================================================================= */}
 <div className="relative rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-6 sm:p-7 shadow-sm dark:bg-[#1B2433] space-y-5">
 {/* Glow ambient background terisolasi agar tidak memotong dropdown / date picker */}
 <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
 <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
 </div>

 {/* Header Section */}
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-4">
 <div className="flex items-center gap-3.5 shrink-0 min-w-0">
 <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300 shadow-xs">
 <BookOpenCheck className="size-5" />
 </div>
 <div>
 <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Jadwal Pelajaran & Jurnal KBM</h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tentukan jadwal mengajar aktif dan catat topik pembelajaran pertemuan hari ini.</p>
 </div>
 </div>
 {selected && (
 <SquircleActionButton
 variant="view"
 icon={Printer}
 label="Cetak Roster Rombel"
 onClick={() => setIsPrintModalOpen(true)}
 disabled={!students.length}
 />
 )}
 </div>

 {/* Input Fields Grid */}
 <div className="grid gap-5 grid-cols-1 md:grid-cols-12 items-start">
 <div className="col-span-12 md:col-span-5 lg:col-span-5 xl:col-span-4 min-w-0">
 <label htmlFor="attendance-date" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
 Tanggal Pelaksanaan
 </label>
 <DatePicker
 id="attendance-date"
 disabled={activeLogin}
 value={date}
 showDayName
 onChange={(event) => setDate(event.target.value)}
 placeholder="Pilih tanggal..."
 className="w-full"
 />
 </div>

 <div className="col-span-12 md:col-span-7 lg:col-span-7 xl:col-span-8 min-w-0">
 <HeroUiModalSelect
 label="Pilih Jadwal Mengajar"
 value={scheduleId}
 onChange={(val) => setScheduleId(val)}
 options={scheduleOptions}
 placeholder={schedules.length === 0 ? 'Belum ada jadwal pelajaran' : 'Pilih Jadwal Pelajaran'}
 icon={BookOpenCheck}
 disabled={activeLogin}
 searchable
 />
 </div>

 {selected && (
 <div className="col-span-12 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 dark:border-emerald-800/60 p-4 text-xs sm:text-sm text-emerald-950 dark:bg-emerald-950/30 dark:border-emerald-800/60 dark:text-emerald-200">
 <div className="min-w-0 font-medium">
 <b className="font-black text-emerald-900 dark:text-emerald-100">{selected.subject?.name || selected.subject?.nama_mapel}</b>
 <span className="mx-2">•</span>
 <span>Kelas {selected.kelas?.nama_kelas || selected.kelas?.name}</span>
 <span className="mx-2">•</span>
 <span>{selected.employee?.nama_lengkap || selected.teacher?.name}</span>
 <span className="mx-2">•</span>
 <span>{selected.time_start?.slice(0, 5)}–{selected.time_end?.slice(0, 5)} WIB</span>
 </div>
 <div className="flex items-center gap-2 shrink-0">
 {isOverrideUser ? (
 <Badge color="cyan" size="sm">
 Akses Pengawas / TU (Override)
 </Badge>
 ) : step04Blocked ? (
 <Badge color="warning" size="sm">
 Status: {teachingSessionStatus || 'Belum Aktif'}
 </Badge>
 ) : isScheduleTimeActive ? (
 <Badge color="success" size="sm">
 Jam Mengajar Aktif
 </Badge>
 ) : (
 <Badge color="primary" size="sm">
 Akses Terbuka
 </Badge>
 )}
 </div>
 </div>
 )}

 {selected?.requires_substitute_reason && (
 <div className="col-span-12">
 <label htmlFor="attendance-substitute" className="block text-xs font-bold text-amber-700 dark:text-amber-300 mb-2">
 Alasan mengambil presensi sebagai wali kelas / guru pengganti <span className="text-rose-500">*</span>
 </label>
 <div className="relative">
 <div className="pointer-events-none absolute left-3.5 top-3 flex items-center text-amber-500 dark:text-amber-400">
 <AlertCircle className="size-4" />
 </div>
 <textarea
 id="attendance-substitute"
 required
 value={substituteReason}
 onChange={(event) => setSubstituteReason(event.target.value)}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/60 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-200/80 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/15 dark:border-emerald-800/60 dark:bg-amber-950/20 dark:text-slate-100 resize-none"
 rows="2"
 placeholder="Contoh: Guru mata pelajaran sedang menghadiri dinas luar / sakit."
 />
 </div>
 </div>
 )}

 <div className="col-span-12 sm:col-span-4 md:col-span-3 min-w-0">
 <label htmlFor="attendance-meeting" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">Pertemuan Ke-</label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <Hash className="size-4" />
 </div>
 <input
 id="attendance-meeting"
 disabled={isLockedForTeacher}
 type="number"
 min="1"
 value={meeting}
 onChange={(event) => setMeeting(event.target.value)}
 className="w-full rounded-xl border border-emerald-200/80 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-emerald-300 focus:border-[#059669] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/12 dark:border-emerald-800/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-emerald-200/80 dark:focus:border-[#10B981] dark:focus:bg-slate-900 dark:focus:ring-[#10B981]/20 disabled:opacity-50"
 />
 </div>
 </div>

 <div className="col-span-12 sm:col-span-8 md:col-span-9 min-w-0">
 <label htmlFor="attendance-topic" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">Topik Pembelajaran</label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <Type className="size-4" />
 </div>
 <input
 id="attendance-topic"
 disabled={isLockedForTeacher}
 value={topic}
 onChange={(event) => setTopic(event.target.value)}
 className="w-full rounded-xl border border-emerald-200/80 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-emerald-300 focus:border-[#059669] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/12 dark:border-emerald-800/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-emerald-200/80 dark:focus:border-[#10B981] dark:focus:bg-slate-900 dark:focus:ring-[#10B981]/20 disabled:opacity-50"
 placeholder="Contoh: Bab 3 - Persamaan Kuadrat dan Aplikasinya"
 />
 </div>
 </div>

 <div className="col-span-12">
 <label htmlFor="attendance-notes" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">Catatan Jurnal KBM</label>
 <div className="relative">
 <div className="pointer-events-none absolute left-3.5 top-3 flex items-center text-slate-400 dark:text-slate-500">
 <NotebookPen className="size-4" />
 </div>
 <textarea
 id="attendance-notes"
 disabled={isLockedForTeacher}
 value={notes}
 onChange={(event) => setNotes(event.target.value)}
 className="w-full rounded-xl border border-emerald-200/80 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-emerald-300 focus:border-[#059669] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/12 dark:border-emerald-800/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-emerald-200/80 dark:focus:border-[#10B981] dark:focus:bg-slate-900 dark:focus:ring-[#10B981]/20 disabled:opacity-50 resize-none"
 rows="2"
 placeholder="Catatan pelaksanaan KBM, ringkasan capaian materi, tugas, atau tindak lanjut..."
 />
 </div>
 </div>
 </div>
 </div>

 {/* =========================================================================
 CARD 3: GATED FLOW / ROSTER PRESENSI SISWA ROMBEL
 Jika Guru Belum Check-In: Tampilkan Gated Card Hero yang elegan.
 Jika Guru Sudah Check-In: Tampilkan Pilihan Metode & HeroUI Emerald Datatable.
 ========================================================================= */}
 {!isTeacherReadyOrActive ? (
 <div className={`relative overflow-hidden rounded-xl border-2 border-dashed p-8 sm:p-12 text-center shadow-md space-y-4 ${
 !isScheduleTimeActive
 ? 'border-emerald-300 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433]'
 : 'border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433]'
 }`}>
 <div className={`mx-auto flex size-16 items-center justify-center rounded-xl text-white shadow-lg border ${
 !isScheduleTimeActive
 ? 'bg-white dark:bg-[#1B2433] shadow-slate-500/20 border-emerald-200/80'
 : 'bg-white dark:bg-[#1B2433] shadow-sm border-emerald-200/80 dark:border-emerald-800/60'
 }`}>
 {!isScheduleTimeActive ? <Clock className="size-8" /> : <ShieldAlert className="size-8" />}
 </div>
 <div className="max-w-xl mx-auto space-y-2">
 <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
 !isScheduleTimeActive
 ? 'bg-slate-100 text-slate-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/60'
 : 'bg-amber-100 text-amber-900 dark:bg-amber-950/90 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-800/60'
 }`}>
 {!isScheduleTimeActive ? 'Di Luar Jam KBM (Presensi Nonaktif)' : 'Langkah 2: Menunggu Presensi Guru'}
 </span>
 <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
 {!isScheduleTimeActive ? 'Jadwal Pelajaran Sedang Tidak Aktif' : 'Presensi Siswa Rombel Terkunci'}
 </h3>
 <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
 {!isScheduleTimeActive ? (
 <>
 Sesuai SOP akademik, tombol presensi hanya aktif pada jam pelajaran berlangsung{' '}
 <b className="text-slate-900 dark:text-white">
 ({selected?.time_start?.slice(0, 5) || '00:00'}–{selected?.time_end?.slice(0, 5) || '00:00'} WIB)
 </b>
 . Saat ini berada di luar rentang waktu KBM, sehingga pengisian presensi dinonaktifkan.
 </>
 ) : (
 <>
 Sesuai SOP presensi sekolah terpadu, Guru Pengampu diwajibkan melakukan <b className="text-slate-900 dark:text-white">Check-In Mulai Mengajar (Langkah 1)</b> terlebih dahulu. Kehadiran Anda akan dicatat dan dilaporkan langsung ke Kepala Sekolah sebelum checklist presensi siswa dibuka.
 </>
 )}
 </p>
 </div>
 <div className="pt-2">
 <button
 type="button"
 onClick={handleTeacherCheckIn}
 disabled={(!isScheduleTimeActive && !isOverrideUser) || captureBusy || !scheduleId || !students.length}
 className={`inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-black text-xs sm:text-sm tracking-wide shadow-lg transition-all duration-200 ${
 !isScheduleTimeActive
 ? 'bg-slate-200 text-slate-500 shadow-none cursor-not-allowed dark:bg-slate-800 dark:text-slate-500'
 : 'bg-white dark:bg-[#1B2433] shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50'
 }`}
 >
 {!isScheduleTimeActive ? (
 <>
 <Clock className="size-5" />
 <span>Presensi Tidak Aktif (Di Luar Jam KBM)</span>
 </>
 ) : (
 <>
 <UserCheck className="size-5" />
 <span>Lakukan Check-In Mengajar Sekarang</span>
 </>
 )}
 </button>
 </div>
 </div>
 ) : (
 <>
 {/* Banner Informasi Mode Administrasi Override (TU / Kepsek / Admin) */}
 {isOverrideUser && !isTeacherCheckedIn && !sessionFinal && (
 <div className="flex items-center gap-3 rounded-xl bg-cyan-50/90 p-4 text-xs font-semibold text-cyan-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-cyan-950/40 dark:text-cyan-200 dark:border-emerald-800/60 shadow-xs">
 <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 dark:bg-cyan-900/60 dark:text-cyan-300">
 <ShieldCheck className="size-5" />
 </div>
 <div className="space-y-0.5">
 <p className="font-black text-cyan-950 dark:text-cyan-100">Mode Administrasi Akademik & Pengawas (Override)</p>
 <p className="text-xs text-cyan-800/90 dark:text-cyan-300/90 leading-relaxed">
 Anda memiliki akses manajerial untuk melihat daftar murid, mencatat kehadiran santri/siswa, atau mencetak lembar presensi KBM tanpa dibatasi jam pelajaran.
 </p>
 </div>
 </div>
 )}

 {/* Section 3.1: Metode Presensi Siswa */}
 <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] p-6 sm:p-7 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433] space-y-5">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-4">
 <div className="flex items-center gap-3.5 shrink-0 min-w-0">
 <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300 shadow-xs">
 <Sliders className="size-5" />
 </div>
 <div>
 <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">Metode Presensi Siswa</h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Semua metode otomatis terpusat ke draft yang sama dan dapat ditinjau sebelum finalisasi.</p>
 </div>
 </div>
 <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
 <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black border shadow-2xs ${
 captureStarted
 ? 'bg-emerald-100 text-emerald-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60'
 : session?.session_closed_at
 ? 'bg-rose-100 text-rose-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950 dark:text-rose-300 dark:border-emerald-800/60'
 : 'bg-amber-100 text-amber-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950 dark:text-amber-300 dark:border-emerald-800/60'
 }`}>
 <span className={`h-2 w-2 rounded-full ${
 captureStarted ? 'bg-emerald-500 animate-pulse' : session?.session_closed_at ? 'bg-rose-500' : 'bg-amber-500'
 }`} />
 {captureStarted ? 'Capture QR Aktif' : session?.session_closed_at ? 'Capture Ditutup' : 'Capture Siap Dibuka'}
 </span>
 {!captureStarted && !sessionFinal && (
 <button
 type="button"
 onClick={startCapture}
 disabled={captureBusy || busy || isLockedForTeacher}
 className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-emerald-500 px-5 py-2.5 text-xs font-black shadow-md shadow-emerald-600/20 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
 >
 {captureBusy ? (
 <span className="size-3.5 animate-spin rounded-full border-2 border-emerald-200/80 border-t-transparent" />
 ) : (
 <div className="flex size-5 items-center justify-center rounded-lg bg-white/20">
 <PlayCircle className="size-4 text-white" strokeWidth={2.2} />
 </div>
 )}
 <span>{captureBusy ? 'Membuka...' : 'Buka Capture QR'}</span>
 </button>
 )}
 {captureStarted && (
 <button
 type="button"
 onClick={closeCapture}
 disabled={captureBusy}
 className="inline-flex items-center gap-2 rounded-xl border border-emerald-200/80 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition-all dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
 >
 <Square size={16} className="shrink-0 text-slate-500" /> {captureBusy ? 'Menutup...' : 'Tutup Capture'}
 </button>
 )}
 </div>
 </div>
 <AttendanceMethodSelector value={method} onChange={setMethod} />
 <AttendanceCapturePanel
 method={method}
 session={session}
 captureActive={captureStarted}
 disabled={isLockedForTeacher || !captureStarted}
 onRecorded={applyScan}
 onScanMatch={(studentId, data) => updateStudent(studentId, data)}
 />
 </section>

 {/* Section 3.2: HeroUI Emerald Datatable Roster Siswa */}
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-sm dark:bg-[#1B2433]">
 
 {/* Baris 1: Toolbar Header */}
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-4 sm:px-6 md:px-8 bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <div className="flex items-center gap-3.5 shrink-0 min-w-0">
 <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300 shrink-0 shadow-xs">
 <Users className="size-5" />
 </div>
 <div>
 <div className="flex items-center gap-2 flex-wrap">
 <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">Daftar Kehadiran Siswa</h3>
 <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
 {students.length} Siswa
 </span>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Roster peserta didik pada rombel kelas mengajar aktif</p>
 </div>
 </div>

 <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
 <SquircleActionButton
 variant="view"
 icon={Printer}
 label="Cetak Daftar Siswa"
 onClick={() => setIsPrintModalOpen(true)}
 disabled={!students.length}
 />
 <button
 type="button"
 disabled={isLockedForTeacher || reviewMode || !students.length}
 onClick={markAllPresent}
 className="inline-flex items-center gap-2 rounded-xl bg-slate-100 border border-emerald-200/80 text-slate-700 dark:bg-slate-800 dark:border-emerald-800/60 dark:text-slate-300 px-4 py-2.5 text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
 >
 <div className="flex size-5 items-center justify-center rounded-lg bg-white/20">
 <CheckCircle2 className="size-3.5 text-slate-600" strokeWidth={2.2} />
 </div>
 <span>Tandai Semua Hadir</span>
 </button>
 <button
 type="button"
 onClick={() => setReviewMode((current) => !current)}
 disabled={!students.length}
 className="inline-flex items-center gap-2 rounded-xl border border-emerald-200/80 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition-all dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
 >
 <Eye className="size-3.5 text-slate-500 dark:text-slate-400" />
 <span>{reviewMode ? 'Kembali ke Checklist' : 'Tinjau Roster'}</span>
 </button>
 </div>
 </div>

 {/* Baris 2: Search Input Full-Width */}
 <div className="p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-900/50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-emerald-950/30 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <div className="relative">
 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={studentSearch}
 onChange={(e) => {
 setStudentSearch(e.target.value)
 setStudentPage(1)
 }}
 placeholder="Cari siswa berdasarkan nama atau NIS/NISN..."
 aria-label="Cari siswa berdasarkan nama atau NIS/NISN"
 className="h-9 w-full rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#151D2A] pl-10 pr-10 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#059669]/12 focus:border-[#059669] transition-all shadow-xs"
 />
 {studentSearch && (
 <button
 type="button"
 onClick={() => {
 setStudentSearch('')
 setStudentPage(1)
 }}
 className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
 >
 <X className="size-3.5" />
 </button>
 )}
 </div>
 </div>

 {/* Baris 3: Filter Horizontal Status */}
 <div className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-2.5 bg-emerald-50/30 dark:bg-emerald-950/10 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
 {[
 { id: 'all', label: `Semua (${students.length})` },
 { id: 'hadir', label: `Hadir (${statusCounts.hadir || 0})` },
 { id: 'terlambat', label: `Terlambat (${statusCounts.terlambat || 0})` },
 { id: 'izin_sakit', label: `Izin/Sakit (${(statusCounts.izin || 0) + (statusCounts.sakit || 0)})` },
 { id: 'alpa', label: `Alpha (${statusCounts.alpa || 0})` },
 { id: 'belum', label: `Belum Diisi (${unmarkedCount})` },
 ].map((f) => (
 <button
 key={f.id}
 type="button"
 onClick={() => {
 setStudentStatusFilter(f.id)
 setStudentPage(1)
 }}
 className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
 studentStatusFilter === f.id
 ? 'bg-emerald-600 text-white shadow-xs'
 : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60'
 }`}
 >
 {f.label}
 </button>
 ))}
 </div>

 {(studentSearch || studentStatusFilter !== 'all') && (
 <button
 type="button"
 onClick={() => {
 setStudentSearch('')
 setStudentStatusFilter('all')
 setStudentPage(1)
 }}
 className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:text-rose-400 transition-all cursor-pointer"
 >
 <RotateCcw className="size-3" /> Reset Filter
 </button>
 )}
 </div>

 {rosterLoading && (
 <div className="border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 px-6 py-5">
 <AppSkeleton variant="table" rows={3} cols={4} />
 </div>
 )}
 {rosterError && (
 <div className="border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 px-6 py-5">
 <AppErrorState title="Roster siswa gagal dimuat" description={rosterError} onRetry={() => setReloadKey((k) => k + 1)} compact />
 </div>
 )}
 {reviewMode && (
 <div className="grid gap-3 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/70 p-5 sm:grid-cols-3 dark:border-emerald-800/60 dark:bg-amber-950/20">
 <div>
 <p className="text-xs font-bold text-amber-800 dark:text-amber-300">Review Sebelum Finalisasi</p>
 <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">Periksa seluruh status roster siswa. Rekomendasi izin/sakit tetap harus dikonfirmasi guru.</p>
 </div>
 <div className="flex flex-wrap items-center gap-2 text-xs font-bold sm:col-span-2 sm:justify-end">
 <span className="rounded-full border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300">Hadir {statusCounts.hadir || 0}</span>
 <span className="rounded-full border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-800 dark:border-emerald-800/60 dark:bg-amber-950/60 dark:text-amber-300">Terlambat {statusCounts.terlambat || 0}</span>
 <span className="rounded-full border border-emerald-200/80 dark:border-emerald-800/60 bg-sky-100 px-3 py-1 text-xs font-extrabold text-sky-800 dark:border-emerald-800/60 dark:bg-sky-950/60 dark:text-sky-300">Izin/Sakit {(statusCounts.izin || 0) + (statusCounts.sakit || 0)}</span>
 <span className="rounded-full border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-100 px-3 py-1 text-xs font-extrabold text-rose-800 dark:border-emerald-800/60 dark:bg-rose-950/60 dark:text-rose-300">Alpha {statusCounts.alpa || 0}</span>
 <span className="rounded-full border border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50 border border-sky-200/80 px-3 py-1 text-xs font-extrabold text-sky-700 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300">Belum {unmarkedCount}</span>
 </div>
 </div>
 )}

 {/* Datatable Body */}
 <div className="overflow-x-auto">
 <TableRoot fullBleed={false}>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200">
              <TableHead className="py-4 pl-6 pr-4 font-black text-xs uppercase tracking-wider">Siswa</TableHead>
              <TableHead className="py-4 px-4 font-black text-xs uppercase tracking-wider">Status Kehadiran</TableHead>
              <TableHead className="py-4 px-4 font-black text-xs uppercase tracking-wider">Jam & Metode</TableHead>
              <TableHead className="py-4 px-4 font-black text-xs uppercase tracking-wider">Catatan & Verifikasi</TableHead>
              <TableHead className="py-4 pr-6 pl-4 text-right select-none w-24" />
            </TableRow>
          </TableHeader>
 <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {paginatedStudents.map((student) => (
 <TableRow key={student.id} className="transition-colors hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20">
 <TableCell className="py-4 pl-6 pr-4 align-top sm:align-middle">
 <b className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">{student.full_name}</b>
 <p className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{student.nis || student.nisn}</p>

 {/* Rich Parent Permission Card (Izin yang Diajukan Orang Tua & Verifikasi Wali Kelas) */}
 {student.recommended_status && (
 <div className="mt-2 p-2 rounded-xl bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-amber-950/40 dark:border-emerald-800/60 text-xs space-y-1 shadow-2xs">
 <div className="flex items-center justify-between gap-1.5 flex-wrap">
 <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-200/80 text-amber-900 dark:bg-amber-900/80 dark:text-amber-200">
 <AlertCircle className="size-3 text-amber-700 shrink-0" />
 Pengajuan Ortu: {student.recommended_status}
 </span>
 <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold ${
 student.recommendation_verified
 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
 : 'bg-slate-200 text-slate-700 dark:bg-emerald-950/60 dark:text-emerald-300'
 }`}>
 {student.recommendation_verified ? <CheckCircle2 className="size-2.5 text-emerald-600" /> : null}
 {student.recommendation_verified ? 'Disetujui Wali Kelas' : 'Menunggu Wali Kelas'}
 </span>
 </div>

 {student.permission_reason ? (
 <p className="text-[10px] font-medium text-amber-950/90 dark:text-amber-200/90 leading-tight italic">
 <span className="font-bold not-italic">Alasan:</span> "{student.permission_reason}"
 </p>
 ) : null}

 {student.status !== student.recommended_status.toLowerCase() && !isLockedForTeacher && !reviewMode && (
 <button
 type="button"
 onClick={() => {
 const targetStatus = student.recommended_status.toLowerCase() === 'sakit' ? 'sakit' : 'izin'
 updateStudent(student.id, {
 status: targetStatus,
 notes: student.permission_reason ? `Izin orang tua: ${student.permission_reason}` : 'Izin orang tua',
 recorded_method: 'manual',
 verification_status: student.recommendation_verified ? 'verified' : 'pending',
 })
 toastSuccess('Izin Ortu Diterapkan', `Status presensi ${student.full_name} diatur ke ${targetStatus.toUpperCase()} sesuai pengajuan orang tua.`)
 }}
 className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-extrabold text-[9px] shadow-xs transition cursor-pointer"
 >
 <CheckCheck className="size-2.5" />
 Terapkan Izin Ortu Ini
 </button>
 )}
 </div>
 )}

 {/* Catatan Keterlambatan Badge di Kolom Nama */}
 {student.status === 'terlambat' && (
 <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
 <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/80 dark:text-amber-300 dark:border-emerald-800/60">
 <Clock className="size-2.5 text-amber-600" />
 Alasan: {student.notes || 'Wajib diisi'}
 </span>
 {!isLockedForTeacher && !reviewMode && (
 <button
 type="button"
 onClick={() => handleOpenLateModal(student)}
 className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 hover:text-amber-900 dark:text-amber-400 underline cursor-pointer"
 >
 <Pencil className="size-2.5" /> Ubah
 </button>
 )}
 </div>
 )}

 {/* Mobile Compact Metadata Row */}
 <div className="sm:hidden mt-2 flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60">
 <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
 {formatStatusLabel(student.status)}
 </span>
 {student.arrival_time && (
 <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-emerald-950/60 dark:text-emerald-300">
 {student.arrival_time}
 </span>
 )}
 <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
 student.verification_status === 'verified' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-500'
 }`}>
 {student.verification_status === 'verified' ? 'Terverifikasi' : 'Belum'}
 </span>
 {student.notes && (
 <span className="w-full text-[10px] font-medium text-slate-600 dark:text-slate-400 italic">
 Catatan: "{student.notes}"
 </span>
 )}
 <button
 type="button"
 onClick={() => handleOpenViolationModal(student)}
 className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:hover:bg-rose-900 border border-emerald-200/80 dark:border-emerald-800/60 cursor-pointer shadow-2xs"
 >
 <ShieldAlert className="size-2.5 text-rose-600 dark:text-rose-400" />
 Catat Pelanggaran
 </button>
 </div>
 </TableCell>
 <TableCell className="py-4 px-4">
 <div className="flex flex-wrap gap-1.5 my-1">
 {['belum_diverifikasi', 'belum_diisi'].includes(student.status) && (
 <span className="rounded-xl bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
 Belum Diisi
 </span>
 )}
 <button
 type="button"
 disabled={isLockedForTeacher || reviewMode}
 onClick={() => updateStudent(student.id, { status: 'hadir', recorded_method: 'manual' })}
 className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${
 student.status === 'hadir'
 ? 'bg-emerald-600 text-white shadow-sm scale-105'
 : 'bg-emerald-100/80 text-emerald-800 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/80 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white'
 }`}
 >
 Hadir
 </button>
 <button
 type="button"
 disabled={isLockedForTeacher || reviewMode}
 onClick={() => handleOpenLateModal(student)}
 className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${
 student.status === 'terlambat'
 ? 'bg-amber-500 text-white shadow-sm scale-105'
 : 'bg-amber-100/80 text-amber-800 hover:bg-amber-500 hover:text-white dark:bg-amber-950/80 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white'
 }`}
 title="Tandai terlambat dan isi alasan untuk orang tua"
 >
 Terlambat
 </button>
 <button
 type="button"
 disabled={isLockedForTeacher || reviewMode}
 onClick={() => updateStudent(student.id, { status: 'izin', recorded_method: 'manual' })}
 className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${
 student.status === 'izin'
 ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 scale-105'
 : 'bg-sky-100/80 text-sky-800 hover:bg-sky-500 hover:text-white dark:bg-sky-950/80 dark:text-sky-300 dark:hover:bg-sky-500 dark:hover:text-white'
 }`}
 >
 Izin
 </button>
 <button
 type="button"
 disabled={isLockedForTeacher || reviewMode}
 onClick={() => updateStudent(student.id, { status: 'sakit', recorded_method: 'manual' })}
 className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${
 student.status === 'sakit'
 ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30 scale-105'
 : 'bg-violet-100/80 text-violet-800 hover:bg-violet-600 hover:text-white dark:bg-violet-950/80 dark:text-violet-300 dark:hover:bg-violet-600 dark:hover:text-white'
 }`}
 >
 Sakit
 </button>
 <button
 type="button"
 disabled={isLockedForTeacher || reviewMode}
 onClick={() => updateStudent(student.id, { status: 'alpa', recorded_method: 'manual' })}
 className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${
 student.status === 'alpa'
 ? 'bg-rose-600 text-white shadow-sm scale-105'
 : 'bg-rose-100/80 text-rose-800 hover:bg-rose-600 hover:text-white dark:bg-rose-950/80 dark:text-rose-300 dark:hover:bg-rose-600 dark:hover:text-white'
 }`}
 >
 Alpha
 </button>
 <button
 type="button"
 disabled={isLockedForTeacher || reviewMode}
 onClick={() => updateStudent(student.id, { status: 'dispensasi', recorded_method: 'manual' })}
 className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${
 student.status === 'dispensasi'
												? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20 scale-105'
												: 'bg-teal-50 text-teal-800 hover:bg-teal-600 hover:text-white dark:bg-teal-950/80 dark:text-teal-300 dark:hover:bg-teal-600 dark:hover:text-white'}`}
 >
 Dispensasi
 </button>
 </div>
 </TableCell>
 <TableCell className="py-4 px-4 align-middle">
                      <div className="flex flex-col gap-1.5">
                        <input
                          disabled={isLockedForTeacher || reviewMode}
                          type="time"
                          value={student.arrival_time}
                          onChange={(event) => updateStudent(student.id, { arrival_time: event.target.value })}
                          aria-label={`Jam hadir ${student.full_name}`}
                          className="rounded-xl border border-emerald-200/80 bg-slate-50/50 p-1.5 text-xs font-bold text-slate-900 outline-none focus:border-emerald-200/80 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-40 dark:border-emerald-800/60 dark:bg-slate-900/60 dark:text-white"
                        />
                        <div>
                          <Badge color="cyan" size="sm">
                            {student.recorded_method || 'manual'}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4 align-middle">
                      <div className="flex flex-col gap-1.5">
                        <input
                          disabled={isLockedForTeacher || reviewMode}
                          value={student.notes}
                          onChange={(event) => updateStudent(student.id, { notes: event.target.value })}
                          aria-label={`Catatan ${student.full_name}`}
                          className={`w-full rounded-xl border p-1.5 text-xs text-slate-900 outline-none focus:ring-2 disabled:opacity-40 dark:bg-slate-900/60 dark:text-white ${
                            student.status === 'terlambat'
                              ? 'border-amber-400 bg-amber-50/50 focus:border-amber-500 focus:ring-amber-500/20 dark:border-amber-700'
                              : 'border-emerald-200/80 bg-slate-50/50 focus:border-emerald-200/80 focus:bg-white focus:ring-emerald-500/20 dark:border-emerald-800/60'
                          }`}
                          placeholder={student.status === 'terlambat' ? 'Alasan terlambat (wajib)...' : 'Catatan...'}
                        />
                        <div>
                          <Badge color={student.verification_status === 'verified' ? 'success' : 'gray'} size="sm">
                            {student.verification_status === 'verified' ? 'Terverifikasi' : 'Belum Diverifikasi'}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
 <TableCell className="py-4 pr-6 pl-4 text-center align-middle">
 <button
 type="button"
 onClick={() => handleOpenViolationModal(student)}
 title={`Catat pelanggaran & poin disiplin untuk ${student.full_name}`}
 className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-emerald-800/60 dark:hover:bg-rose-600 dark:hover:text-white transition-all duration-200 shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer group"
 >
 <ShieldAlert className="size-3.5 text-rose-600 group-hover:text-emerald-600 transition-colors" />
 <span className="hidden xl:inline">Pelanggaran</span>
 </button>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </TableRoot>
 </div>

 {!students.length ? (
 <div className="px-6 py-10">
 <AppEmptyState title="Belum ada roster siswa" description="Pilih jadwal pelajaran yang memiliki siswa aktif untuk mulai mengisi presensi." />
 </div>
 ) : filteredStudents.length === 0 ? (
 <div className="px-6 py-10">
 <AppEmptyState
 title="Data tidak ditemukan"
 description="Coba ubah kata kunci pencarian atau filter status yang digunakan."
 actionLabel="Reset Filter"
 onAction={() => { setStudentSearch(''); setStudentStatusFilter('all'); setStudentPage(1) }}
 />
 </div>
 ) : null}

 {/* Pagination Footer */}
 {filteredStudents.length > 0 && (
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] dark:from-emerald-950/20 dark:via-transparent dark:to-emerald-950/20">
 <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center sm:text-left">
 Menampilkan <span className="font-semibold text-slate-700 dark:text-slate-200">{(studentPage - 1) * studentPerPage + 1}</span>–<span className="font-semibold text-slate-700 dark:text-slate-200">{Math.min(studentPage * studentPerPage, filteredStudents.length)}</span> dari <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredStudents.length}</span> siswa
 </p>
 {totalStudentPages > 1 && (
 <div className="flex items-center justify-center gap-2">
 <Pagination
 currentPage={studentPage}
 totalPages={totalStudentPages}
 onPageChange={(p) => setStudentPage(p)}
 sideLayout="icon"
 />
 </div>
 )}
 </div>
 )}

 {/* Sticky Action Footer */}
 <div className="flex flex-wrap items-center justify-end gap-3 border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:border-emerald-800/60 dark:bg-emerald-950/20 px-6 py-4 dark:border-emerald-800/60 dark:bg-slate-900/50">
 <button
 type="button"
 disabled={busy || !students.length || isLockedForTeacher}
 onClick={() => save(false)}
 className="inline-flex items-center gap-2 rounded-xl border border-emerald-200/80 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition-all dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
 >
 {busy ? (
 <span className="size-3.5 animate-spin rounded-full border-2 border-emerald-200/80 border-t-transparent" />
 ) : (
 <Save size={17} className="text-slate-500 dark:text-slate-400" />
 )}
 <span>Simpan Draft</span>
 </button>
 <button
 type="button"
 disabled={busy || !students.length || sessionFinal || isLockedForTeacher || unmarkedCount > 0}
 onClick={() => save(true)}
 title={unmarkedCount > 0 ? `Masih ada ${unmarkedCount} siswa belum diisi` : 'Finalisasi presensi'}
 className="inline-flex items-center gap-2 rounded-xl bg-slate-100 border border-emerald-200/80 text-slate-700 dark:bg-slate-800 dark:border-emerald-800/60 dark:text-slate-300 px-6 py-2.5 text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-sm"
 >
 {busy ? (
 <span className="size-3.5 animate-spin rounded-full border-2 border-emerald-200/80 border-t-transparent" />
 ) : (
 <div className="flex size-5 items-center justify-center rounded-lg bg-white/20">
 <ShieldCheck size={17} className="text-slate-600" strokeWidth={2.2} />
 </div>
 )}
 <span>Finalisasi Presensi</span>
 </button>
 </div>
 </div>
 </>
 )}

 {/* PRINT OPTION MODAL */}
 <PrintOptionModal
 isOpen={isPrintModalOpen}
 onClose={() => setIsPrintModalOpen(false)}
 title={`Daftar Murid (${selected?.subject?.name || selected?.subject?.nama_mapel || 'Mata Pelajaran'} - ${selected?.kelas?.nama_kelas || selected?.kelas?.name || 'Kelas'})`}
 teachersList={teachersList}
 selectedTeacherId={printTeacherFilter}
 onTeacherChange={handleTeacherChange}
 onPrint={() => {
 handlePrintClean()
 setIsPrintModalOpen(false)
 }}
 onDownload={() => {
 handleDownloadPdf()
 setIsPrintModalOpen(false)
 }}
 />

 {/* =========================================================================
 MODAL CATATAN KETERLAMBATAN SANTRI (TERLAMBAT)
 SOP: Memastikan alasan keterlambatan ananda tercatat jelas sehingga
 orang tua mengetahuinya di portal orang tua web & mobile app.
 ========================================================================= */}
 <AnimatePresence>
 {lateModalStudent && (
 <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={() => setLateModalStudent(null)}
 className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
 />
 <motion.div
 initial={{ scale: 0.95, opacity: 0, y: 15 }}
 animate={{ scale: 1, opacity: 1, y: 0 }}
 exit={{ scale: 0.95, opacity: 0, y: 15 }}
 transition={{ type: 'spring', duration: 0.3, bounce: 0.2 }}
 className="relative w-full max-w-xl overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-6 sm:p-7 shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433] space-y-5"
 >
 {/* Header Gradient Accent */}

 <div className="flex items-start justify-between gap-4 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-4 dark:border-emerald-800/60">
 <div className="flex items-center gap-3">
 <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-sm border border-emerald-200/80 dark:border-emerald-800/60">
 <Clock className="size-6" />
 </div>
 <div>
 <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
 Presensi KBM • Terlambat
 </span>
 <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight mt-0.5">
 Catatan Keterlambatan Santri
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Santri: <b className="text-slate-800 dark:text-slate-200">{lateModalStudent.full_name}</b> ({lateModalStudent.nis || '-'})
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setLateModalStudent(null)}
 className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 cursor-pointer"
 >
 <X className="size-5" />
 </button>
 </div>

 {/* Form Input */}
 <div className="space-y-4 text-xs">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
 Jam Kedatangan di Kelas
 </label>
 <input
 type="time"
 value={lateArrivalTime}
 onChange={(e) => setLateArrivalTime(e.target.value)}
 className="w-full sm:w-48 rounded-xl border border-emerald-200/80 bg-slate-50/50 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-white"
 />
 </div>

 <div>
 <div className="flex items-center justify-between mb-1.5">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 Alasan Keterlambatan <span className="text-rose-500">*</span>
 </label>
 <span className="text-[10px] text-slate-400">Tersinkron ke Portal Orang Tua</span>
 </div>
 <textarea
 rows={4}
 value={lateReason}
 onChange={(e) => setLateReason(e.target.value)}
 placeholder="Tuliskan catatan detail alasan kenapa santri terlambat mengikuti jam pelajaran..."
 className="w-full rounded-xl border border-emerald-200/80 bg-slate-50/50 p-3 text-xs font-medium text-slate-900 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-white resize-none"
 />
 </div>

 {/* Notice Info */}
 <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-300 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:border-emerald-800/60 flex items-start gap-2">
 <Info className="size-4 text-amber-600 shrink-0 mt-0.5" />
 <span>
 Catatan ini akan langsung tampil di <b>Portal Orang Tua (Web & Mobile App)</b> sehingga wali santri dapat mengetahui alasan keterlambatan ananda secara transparan.
 </span>
 </div>
 </div>

 {/* Actions */}
 <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60">
 <button
 type="button"
 onClick={() => setLateModalStudent(null)}
 className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
 >
 Batal
 </button>
 <button
 type="button"
 onClick={handleSaveLateModal}
 className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-white dark:bg-[#1B2433] hover:from-amber-600 hover:to-orange-700 shadow-sm active:scale-95 transition cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60"
 >
 <CheckCheck className="size-4" />
 Simpan & Tandai Terlambat
 </button>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* =========================================================================
 MODAL CATAT PELANGGARAN & POIN DISIPLIN SANTRI (HEROUI UI)
 SOP: Memastikan guru mapel dapat mencatat pelanggaran santri secara
 resmi, terhubung ke Buku Poin & tersinkron ke Portal Orang Tua.
 ========================================================================= */}
 <AnimatePresence>
 {violationModalStudent && (
 <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={() => !violationSaving && setViolationModalStudent(null)}
 className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
 />
 <motion.div
 initial={{ scale: 0.95, opacity: 0, y: 15 }}
 animate={{ scale: 1, opacity: 1, y: 0 }}
 exit={{ scale: 0.95, opacity: 0, y: 15 }}
 transition={{ type: 'spring', duration: 0.3, bounce: 0.2 }}
 className="relative w-full max-w-xl overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-6 sm:p-7 shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433] space-y-5"
 >
 {/* Header Gradient Accent */}

 <div className="flex items-start justify-between gap-4 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-4 dark:border-emerald-800/60">
 <div className="flex items-center gap-3">
 <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 shadow-sm">
 <ShieldAlert className="size-6" />
 </div>
 <div>
 <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
 Kedisiplinan • Guru Mapel
 </span>
 <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight mt-0.5">
 Catat Pelanggaran Santri
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Santri: <b className="text-slate-800 dark:text-slate-200">{violationModalStudent.full_name}</b> ({violationModalStudent.nis || '-'})
 </p>
 </div>
 </div>
 <button
 type="button"
 disabled={violationSaving}
 onClick={() => setViolationModalStudent(null)}
 className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-40"
 >
 <X className="size-5" />
 </button>
 </div>

 {/* Form Input */}
 <div className="space-y-4 text-xs">
 <div>
 <HeroUiModalSelect
 label="Kategori Pelanggaran"
 value={selectedViolationCategory}
 onChange={(val) => handleCategoryChange(val)}
 options={violationCategoryOptions}
 placeholder="Pilih Kategori Pelanggaran"
 icon={ShieldAlert}
 disabled={violationSaving}
 required
 searchable
 />
 </div>

 <div>
 <div className="flex items-center justify-between mb-1.5">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 Bobot Poin Pengurangan <span className="text-rose-500">*</span>
 </label>
 <span className="text-[10px] text-rose-600 font-bold dark:text-rose-400">
 Akan mengurangi skor kedisiplinan santri
 </span>
 </div>
 <div className="relative">
 <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-rose-600">-</span>
 <input
 type="number"
 min={1}
 max={100}
 disabled={violationSaving}
 value={violationPointDeduction}
 onChange={(e) => setViolationPointDeduction(Math.max(1, parseInt(e.target.value || '1', 10)))}
 className="w-full pl-7 rounded-xl border border-emerald-200/80 bg-slate-50/50 p-2.5 text-xs font-black text-slate-900 outline-none focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-white"
 />
 </div>
 </div>

 <div>
 <div className="flex items-center justify-between mb-1.5">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 Catatan / Kronologi Kejadian <span className="text-rose-500">*</span>
 </label>
 <span className="text-[10px] text-slate-400">Tersinkron ke Portal Orang Tua</span>
 </div>
 <textarea
 rows={3}
 disabled={violationSaving}
 value={violationDescription}
 onChange={(e) => setViolationDescription(e.target.value)}
 placeholder="Tuliskan catatan kejadian pelanggaran saat jam pelajaran berlangsung secara jelas..."
 className="w-full rounded-xl border border-emerald-200/80 bg-slate-50/50 p-3 text-xs font-medium text-slate-900 outline-none focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-white resize-none"
 />
 </div>

 <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-emerald-200/80 dark:border-emerald-800/60">
 <input
 type="checkbox"
 id="violationReferBk"
 disabled={violationSaving}
 checked={violationReferBk}
 onChange={(e) => setViolationReferBk(e.target.checked)}
 className="size-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
 />
 <label htmlFor="violationReferBk" className="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
 Rujuk kasus ini langsung ke Guru BK / Wali Kelas
 </label>
 </div>

 {/* Notice Info */}
 <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-emerald-800/60 flex items-start gap-2">
 <Info className="size-4 text-rose-600 shrink-0 mt-0.5" />
 <span>
 Catatan ini akan otomatis masuk ke <b>Buku Poin Santri</b> dan disinkronkan ke <b>Catatan Siswa Portal Orang Tua</b> sehingga wali santri dapat memantau kedisiplinan ananda secara transparan.
 </span>
 </div>
 </div>

 {/* Actions */}
 <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60">
 <button
 type="button"
 disabled={violationSaving}
 onClick={() => setViolationModalStudent(null)}
 className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-40"
 >
 Batal
 </button>
 <button
 type="button"
 disabled={violationSaving}
 onClick={handleSaveViolationModal}
 className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-white dark:bg-[#1B2433] hover:from-rose-700 hover:to-red-700 shadow-sm active:scale-95 transition cursor-pointer disabled:opacity-40 border border-emerald-200/80 dark:border-emerald-800/60"
 >
 <ShieldAlert className="size-4" />
 {violationSaving ? 'Menyimpan...' : 'Simpan & Kurangi Poin'}
 </button>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 </div>
 )
}

export default function AttendanceWorkspacePage() {
 const [params] = useSearchParams()
 const { id: routeSessionId = '' } = useParams()
 const authUser = useAuthStore((state) => state.user)
 const [counts, setCounts] = useState({ permissions: 0, corrections: 0, followUps: 0 })
 const activeScheduleId = params.get('schedule_id') || params.get('active_schedule') || ''
 const activeDate = params.get('date') || params.get('attendance_date') || ''

 useEffect(() => {
 const permissionNames = Array.isArray(authUser?.permissions) ? authUser.permissions : []
 const isStudent = getUserRoleLevel(authUser) === ROLE_LEVELS.SISWA // Level 9
 const isHomeroomReviewer = permissionNames.includes('homeroom_attendance.verify_permission')
 const canReviewCorrections = permissionNames.includes('lesson_attendance.correct')
 const canReviewFollowUps = permissionNames.includes('homeroom_attendance.follow_up')

 Promise.all([
 isStudent || isHomeroomReviewer
 ? (isHomeroomReviewer ? lmsPresensiService.getHomeroomPermissions({ status: 'pending' }) : lmsPresensiService.getPermissions({ status: 'pending' })).catch(() => null)
 : Promise.resolve(null),
 canReviewCorrections ? lmsPresensiService.getCorrections({ status: 'submitted' }).catch(() => null) : Promise.resolve(null),
 canReviewFollowUps ? lmsPresensiService.getFollowUps({ status: 'new' }).catch(() => null) : Promise.resolve(null),
 ]).then(([permissions, corrections, followUps]) => {
 setCounts({
 permissions: unwrapPage(permissions).length,
 corrections: unwrapPage(corrections).length,
 followUps: unwrapPage(followUps).length,
 })
 })
 }, [authUser])

 const containerVariants = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: { staggerChildren: 0.05, delayChildren: 0.02 },
 },
 }

 const itemVariants = {
 hidden: { opacity: 0, y: 12 },
 visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
 }

 return (
 <PageContainer>
 <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-12">
 {/* BREADCRUMB NAV */}
 <motion.div variants={itemVariants} className="print:hidden">
 <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Absensi Kelas & Mata Pelajaran' }]} />
 </motion.div>

      <HeroUiHeader
        title="Absensi Kelas & Mata Pelajaran"
        subtitle="Pencatatan presensi siswa sesuai jadwal mata pelajaran aktif dengan pengawasan ketat, log izin/sakit, dan rekapitulasi kehadiran."
        badge="Presensi Jam Mengajar Aktif"
        icon={BookOpenCheck}
        className="mb-6"
      />

 <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
 <Metric icon={FilePlus2} label="Izin Membutuhkan Verifikasi" subtext="Pengajuan izin/sakit siswa" value={counts.permissions} tag="Verifikasi" tone="blue" />
 <Metric icon={AlertCircle} label="Pengajuan Koreksi" subtext="Permohonan koreksi presensi" value={counts.corrections} tag="Koreksi" tone="amber" />
 <Metric icon={HeartPulse} label="Tindak Lanjut Siswa" subtext="Catatan BK / Musyrif" value={counts.followUps} tag="Tindak Lanjut" tone="violet" />
 <Metric icon={BookOpenCheck} label="Status Jadwal Harian" subtext="Jadwal mengajar aktif" value="Aktif" tag="Sesi Aktif" tone="emerald" />
 </motion.div>

 <motion.div variants={itemVariants}>
 <TeacherWorkspace activeScheduleId={activeScheduleId} activeDate={activeDate} requestedSessionId={routeSessionId} />
 </motion.div>
 </motion.div>
 </PageContainer>
 )
}
