import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  BookOpen,
  Search,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Tag,
  X,
  Loader2,
  Layers,
  Eye,
  Hash,
  Bookmark,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Check,
  CheckCircle2,
  Printer,
  Download,
  RotateCcw,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import ActionDropdown from '../components/app/ActionDropdown'
import AppDataTable from '../components/app/AppDataTable'
import AppModal from '../components/app/AppModal'
import MobileDataCard from '../components/app/MobileDataCard'
import {
  equranService
} from '../services/equranService'
import PageContainer from '../components/app/PageContainer'
import HeroUiHeader from '../components/ui/HeroUiHeader'
import {
  useToast,
  KpiStatCard
} from '../components/app'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import {
  useDebounce
} from '../hooks/useDebounce'
import {
  Pagination
} from '../components/ui/pagination'
import {
  printCleanTable,
  resolveFoundationName
} from '../utils/printHelper'
import {
  usePengaturanStore
} from '../stores/pengaturanStore'
import {
  useAuthStore
} from '../stores/authStore'
import {
  getUserRoleLevel,
  ROLE_LEVELS
} from '../auth/portalResolver'
import {
  MasterActionButton,
  MasterDataPage,
  MasterFilterSelect,
  SquircleActionButton,
  MasterStatsGrid,
  MasterStatCard
} from '../components/master-data'

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
 disabled = false,
}) {
 const [isOpen, setIsOpen] = useState(false)
 const [search, setSearch] = useState('')
 const containerRef = React.useRef(null)

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
 disabled={disabled}
 onClick={() => {
 if (!disabled) {
 setIsOpen((prev) => !prev)
 setSearch('')
 }
 }}
 className={`h-9 w-full flex items-center justify-between gap-2 rounded-lg border px-3 text-xs font-semibold transition-all duration-200 cursor-pointer ${disabled
 ? 'border-emerald-200/80 bg-slate-100 text-slate-400 dark:border-emerald-800/60 dark:bg-slate-800/60 cursor-not-allowed'
 : isOpen
 ? 'border-[#059669] bg-white ring-2 ring-[#059669]/15 dark:border-[#10B981] dark:bg-[#111827] dark:ring-[#10B981]/20 text-slate-900 dark:text-white shadow-xs'
 : value !== '' && value !== undefined && value !== null && value !== 'all'
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200'
 : 'border-emerald-200/80 bg-white text-slate-800 hover:border-emerald-300 dark:border-emerald-700/80 dark:bg-[#111827] dark:text-slate-100 dark:hover:border-emerald-600/80'
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
 className={`absolute left-0 top-full mt-1.5 z-[90] ${popoverWidth} overflow-hidden rounded-xl border border-emerald-200/80 bg-white/95 backdrop-blur-md shadow-2xl dark:border-emerald-700/80/80 dark:bg-[#182232]/95`}
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
 className="w-full rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/60 pl-8 pr-2.5 py-1 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#059669] focus:outline-none dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-100"
 autoFocus
 />
 </div>
 </div>
 )}

 <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
 {filteredOptions.length === 0 ? (
 <div className="px-3 py-3 text-center text-xs text-slate-400">
 Tidak ada data
 </div>
 ) : (
 filteredOptions.map((opt) => {
 const isSelected = String(opt.value) === String(value)
 return (
 <button
 key={String(opt.value)}
 type="button"
 disabled={opt.disabled}
 onClick={() => {
 onChange(opt.value)
 setIsOpen(false)
 }}
 className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold transition-colors text-left cursor-pointer ${isSelected
 ? 'bg-emerald-500/15 text-emerald-900 font-bold dark:bg-emerald-500/20 dark:text-emerald-300'
 : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300'
 }`}
 >
 <span className="truncate">{opt.label}</span>
 {isSelected && (
 <Check className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-1.5" />
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

// ── DEFINISI TONE WARNA KARTU KPI MODERN (HEROUI SPEC) ──
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

const emptyDoa = {
 id: '',
 nama: '',
 grup: 'Doa Harian',
 ar: '',
 tr: '',
 idn: '',
 tentang: '',
 tagInput: '',
}

function HarmonizedDeleteModal({ isOpen, onClose, onConfirm, item, isSubmitting }) {
  return (
    <AppModal
      isOpen={Boolean(isOpen && item)}
      onClose={() => !isSubmitting && onClose()}
      title="Hapus Data Doa?"
      badge="Hapus Permanen"
      description="Tindakan ini tidak dapat dibatalkan."
      icon={Trash2}
      variant="danger"
      maxWidth="max-w-md"
      zIndex={70}
      disableBackdropClose={isSubmitting}
      hideCloseButton={isSubmitting}
      bodyClassName="space-y-4"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700 disabled:opacity-50"
          >
            <X className="size-4" strokeWidth={2} />
            <span>Batal</span>
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="h-9.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border-2 border-rose-600 shadow-md shadow-rose-600/20 disabled:opacity-50"
          >
            {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            <span>Hapus Doa</span>
          </button>
        </>
      }
    >
      {item && (
        <>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Apakah Anda yakin ingin menghapus doa ini dari database? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-rose-50/50 p-3.5 dark:bg-rose-950/20">
            <p className="text-xs font-black text-rose-950 dark:text-rose-100">
              #{item?.id} • {item?.nama}
            </p>
            <p className="text-xs text-rose-800/80 dark:text-rose-300/80 mt-0.5">
              Kategori: {item?.grup || 'Doa Harian'}
            </p>
          </div>
        </>
      )}
    </AppModal>
  )
}

function HarmonizedDeleteAllModal({ isOpen, onClose, onConfirm, isSubmitting }) {
  return (
    <AppModal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title="Hapus Seluruh Data Doa?"
      badge="Kosongkan Database"
      description="Seluruh data doa dan dzikir lokal akan dihapus dari sistem."
      icon={Trash2}
      variant="danger"
      maxWidth="max-w-md"
      zIndex={70}
      disableBackdropClose={isSubmitting}
      hideCloseButton={isSubmitting}
      bodyClassName="space-y-4"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700 disabled:opacity-50"
          >
            <X className="size-4" strokeWidth={2} />
            <span>Batal</span>
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="h-9.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border-2 border-rose-600 shadow-md shadow-rose-600/20 disabled:opacity-50"
          >
            {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            <span>Ya, Kosongkan Semua</span>
          </button>
        </>
      }
    >
      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        Seluruh data doa dan dzikir lokal akan dihapus dari sistem. Anda dapat mengimpor kembali melalui katalog EQuran.id kapan saja.
      </p>
      <div className="rounded-xl border border-rose-200/80 dark:border-rose-900/50 bg-rose-50/70 p-3.5 dark:bg-rose-950/30">
        <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
          Peringatan: Seluruh data doa &amp; dzikir lokal akan dikosongkan.
        </p>
      </div>
    </AppModal>
  )
}

export default function MasterDoaPage() {
 const user = useAuthStore((state) => state.user)
 const canManageMaster = useMemo(() => {
 if (!user) return false
 const level = getUserRoleLevel(user)
 const perms = Array.isArray(user?.permissions) ? user.permissions : []
 return level <= ROLE_LEVELS.ADMIN || perms.includes('sistem.master_data')
 }, [user])

 const [doas, setDoas] = useState([])
 const pengaturan = usePengaturanStore((state) => state.pengaturan)
 const foundationName = resolveFoundationName(pengaturan)
 const [grupOptions, setGrupOptions] = useState([])
 const [tagOptions, setTagOptions] = useState([])
 const [stats, setStats] = useState({ total_doa: 0, total_grup: 0, total_tag: 0 })
 const [loading, setLoading] = useState(true)
 const [remoteDoas, setRemoteDoas] = useState([])
 const [showRemoteCatalog, setShowRemoteCatalog] = useState(false)
 const [loadingRemote, setLoadingRemote] = useState(false)
 const [importingId, setImportingId] = useState(null)

 // Filters for Master Data
 const [search, setSearch] = useState('')
 const [grupFilter, setGrupFilter] = useState('all')
 const [tagFilter, setTagFilter] = useState('all')
 const [currentPage, setCurrentPage] = useState(1)
 const [perPage, setPerPage] = useState(10)

 const formattedGrupOptions = useMemo(() => [
 { value: 'all', label: 'Semua Kategori / Grup' },
 ...grupOptions.map((g) => ({ value: g, label: g })),
 ], [grupOptions])

 const formattedTagOptions = useMemo(() => [
 { value: 'all', label: 'Semua Tag' },
 ...tagOptions.map((t) => ({ value: t, label: `#${t}` })),
 ], [tagOptions])

 const perPageOptions = useMemo(() => [
 { value: 10, label: '10 Baris' },
 { value: 25, label: '25 Baris' },
 { value: 50, label: '50 Baris' },
 ], [])

 // Modal State for Add / Edit
 const [showModal, setShowModal] = useState(false)
 const [editingItem, setEditingItem] = useState(null)
 const [formData, setFormData] = useState(emptyDoa)
 const [saving, setSaving] = useState(false)

 // Modal State for Reader Detail Doa
 const [showDetailModal, setShowDetailModal] = useState(false)
 const [selectedDoa, setSelectedDoa] = useState(null)
 const [loadingDetail, setLoadingDetail] = useState(false)

 // Modal State for Delete
 const [deleteItem, setDeleteItem] = useState(null)
 const [isDeleteOpen, setIsDeleteOpen] = useState(false)
 const [isDeleting, setIsDeleting] = useState(false)
 const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false)
 const [isDeletingAll, setIsDeletingAll] = useState(false)

 // Global Toast
 const { pushToast } = useToast()

 // Fetch Doa list from Backend Database
 const fetchDoas = async () => {
 setLoading(true)
 try {
 const res = await equranService.getDoas({
 grup: grupFilter !== 'all' ? grupFilter : undefined,
 tag: tagFilter !== 'all' ? tagFilter : undefined,
 search: search || undefined,
 })

 if (res && res.data) {
 setDoas(res.data || [])
 setGrupOptions(res.grup_options || [])
 setTagOptions(res.tag_options || [])
 if (res.stats) {
 setStats(res.stats)
 }
 }
 } catch (e) {
 console.error('Failed loading doa data', e)
 pushToast('Gagal memuat data doa dari database', 'error')
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 fetchDoas()
 }, [grupFilter, tagFilter])

 // Load source-only catalogue. Nothing is saved until a row is imported.
 const handleOpenRemoteCatalog = async () => {
 setShowRemoteCatalog(true)
 setLoadingRemote(true)
 try {
 const res = await equranService.getRemoteDoaCatalog()
 setRemoteDoas(res.data || [])
 } catch (e) {
 console.error(e)
 pushToast('Gagal memuat katalog dari EQuran.id', 'error')
 } finally {
 setLoadingRemote(false)
 }
 }

 const handleImportRemoteDoa = async (remoteDoa) => {
 setImportingId(remoteDoa.id)
 try {
 await equranService.importRemoteDoa(remoteDoa.id)
 await fetchDoas()
 pushToast(`“${remoteDoa.nama}” telah ditambahkan ke database.`, 'success')
 } catch (e) {
 pushToast(e.response?.data?.message || 'Gagal mengimpor data dari EQuran.id.', 'error')
 } finally {
 setImportingId(null)
 }
 }

 const handleDeleteAll = () => {
 setIsDeleteAllOpen(true)
 }

 const handleConfirmDeleteAll = async () => {
 setIsDeletingAll(true)
 try {
 const res = await equranService.deleteAllDoas()
 setDoas([])
 setGrupOptions([])
 setTagOptions([])
 setStats({ total_doa: 0, total_grup: 0, total_tag: 0 })
 setIsDeleteAllOpen(false)
 pushToast(res.message || 'Seluruh data doa berhasil dikosongkan.', 'success')
 } catch (e) {
 pushToast(e.response?.data?.message || 'Gagal menghapus seluruh data doa.', 'error')
 } finally {
 setIsDeletingAll(false)
 }
 }

 // Open Detail Reader Modal
 const handleOpenDetail = async (doa) => {
 setSelectedDoa(doa)
 setShowDetailModal(true)
 setLoadingDetail(true)

 try {
 const res = await equranService.getDoaDetail(doa.id)
 if (res && res.data) {
 setSelectedDoa(res.data)
 }
 } catch (e) {
 console.error('Failed fetching doa detail:', e)
 } finally {
 setLoadingDetail(false)
 }
 }

 // Open Add Modal
 const handleOpenAdd = () => {
 setEditingItem(null)
 const nextId = doas.length > 0 ? Math.max(...doas.map((d) => Number(d.id) || 0)) + 1 : 1
 setFormData({
 ...emptyDoa,
 id: nextId,
 })
 setShowModal(true)
 }

 // Open Edit Modal
 const handleOpenEdit = (doa, e) => {
 e?.stopPropagation()
 setEditingItem(doa)
 const tagsArr = Array.isArray(doa.tag) ? doa.tag : []
 setFormData({
 id: doa.id,
 nama: doa.nama || '',
 grup: doa.grup || 'Doa Harian',
 ar: doa.ar || '',
 tr: doa.tr || '',
 idn: doa.idn || '',
 tentang: doa.tentang || '',
 tagInput: tagsArr.join(', '),
 })
 setShowModal(true)
 }

 // Submit Handler for Modal
 const handleSave = async (e) => {
 e.preventDefault()
 setSaving(true)

 try {
 const tagsArray = formData.tagInput
 ? formData.tagInput.split(',').map((t) => t.trim()).filter(Boolean)
 : []

 const payload = {
 id: Number(formData.id),
 nama: formData.nama,
 grup: formData.grup,
 ar: formData.ar,
 tr: formData.tr,
 idn: formData.idn,
 tentang: formData.tentang,
 tag: tagsArray,
 }

 if (editingItem) {
 await equranService.updateDoa(editingItem.id, payload)
 pushToast('Data doa berhasil diperbarui', 'success')
 } else {
 await equranService.createDoa(payload)
 pushToast('Doa baru berhasil ditambahkan ke database', 'success')
 }

 setShowModal(false)
 fetchDoas()
 } catch (e) {
 console.error(e)
 const errMessage = e.response?.data?.message || 'Gagal menyimpan data doa. Periksa form input.'
 pushToast(errMessage, 'error')
 } finally {
 setSaving(false)
 }
 }

 // Delete Doa
 const handleDelete = (doa, e) => {
 e?.stopPropagation()
 setDeleteItem(doa)
 setIsDeleteOpen(true)
 }

 const handleConfirmDelete = async () => {
 if (!deleteItem) return
 setIsDeleting(true)
 try {
 await equranService.deleteDoa(deleteItem.id)
 pushToast('Doa berhasil dihapus dari database', 'success')
 setIsDeleteOpen(false)
 setDeleteItem(null)
 fetchDoas()
 } catch (e) {
 console.error(e)
 pushToast('Gagal menghapus data doa', 'error')
 } finally {
 setIsDeleting(false)
 }
 }

 // Debounced search for smooth typing without jitter
 const debouncedSearch = useDebounce(search, 350)

 // Filtered Doa List for Search Input
 const filteredDoas = useMemo(() => {
 const s = debouncedSearch.trim().toLowerCase()
 return doas.filter((d) => {
 const matchSearch =
 !s ||
 d.nama?.toLowerCase().includes(s) ||
 d.grup?.toLowerCase().includes(s) ||
 d.tr?.toLowerCase().includes(s) ||
 d.idn?.toLowerCase().includes(s) ||
 d.tentang?.toLowerCase().includes(s) ||
 String(d.id).includes(s) ||
 (Array.isArray(d.tag) && d.tag.some((t) => t.toLowerCase().includes(s)))

 const matchGrup = grupFilter === 'all' || d.grup?.toLowerCase() === grupFilter.toLowerCase()
 const matchTag = tagFilter === 'all' || (Array.isArray(d.tag) && d.tag.includes(tagFilter))

 return matchSearch && matchGrup && matchTag
 })
 }, [doas, debouncedSearch, grupFilter, tagFilter])

 // Pagination calculation
 const totalPages = Math.max(1, Math.ceil(filteredDoas.length / perPage))
 const paginatedDoas = useMemo(() => {
 const start = (currentPage - 1) * perPage
 return filteredDoas.slice(start, start + perPage)
 }, [filteredDoas, currentPage, perPage])

 const handleResetFilter = () => {
 setSearch('')
 setGrupFilter('all')
 setTagFilter('all')
 setCurrentPage(1)
 }

 // Computed Stats
 const displayStats = useMemo(() => {
 const totalHadits = doas.filter((d) => d.tentang && d.tentang.trim().length > 0).length
 return {
 totalDoa: doas.length,
 totalGrup: grupOptions.length || [...new Set(doas.map((d) => d.grup).filter(Boolean))].length,
 totalTag: tagOptions.length || [...new Set(doas.flatMap((d) => d.tag || []).filter(Boolean))].length,
 totalHadits,
 }
 }, [doas, grupOptions, tagOptions])

 const filteredRemoteDoas = useMemo(() => {
 const term = search.trim().toLowerCase()
 if (!term) return remoteDoas
 return remoteDoas.filter((doa) => [doa.id, doa.nama, doa.grup, doa.kategori, doa.tr, doa.idn]
 .some((value) => String(value || '').toLowerCase().includes(term)))
 }, [remoteDoas, search])

 const importedDoaIds = useMemo(() => new Set(doas.map((doa) => Number(doa.id))), [doas])

  const doaColumns = useMemo(
    () => [
      {
        key: 'id',
        label: 'ID',
        className: 'w-16 text-center font-mono font-bold text-xs text-emerald-800 dark:text-emerald-300',
        render: (doa) => `#${doa.id}`
      },
      {
        key: 'nama',
        label: 'Judul & Kategori',
        className: 'min-w-[200px]',
        render: (doa) => (
          <div>
            <div className="font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-sm">
              <span>{doa.nama}</span>
              <Eye className="w-3.5 h-3.5 text-emerald-600 opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300">
                {doa.grup || 'Doa Harian'}
              </span>
              {doa.tentang && (
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs font-medium">
                  • {doa.tentang}
                </span>
              )}
            </div>
          </div>
        )
      },
      {
        key: 'lafadz',
        label: 'Lafadz, Latin & Terjemahan',
        className: 'max-w-md',
        render: (doa) => (
          <div>
            <div className="font-serif text-right text-base text-slate-900 dark:text-slate-100 leading-relaxed line-clamp-1 mb-1 font-bold">
              {doa.ar}
            </div>
            <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 italic line-clamp-1 mb-0.5">
              "{doa.tr}"
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {doa.idn}
            </div>
          </div>
        )
      },
      {
        key: 'tag',
        label: 'Tag Terkait',
        className: 'hidden md:table-cell w-48',
        render: (doa) => (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {Array.isArray(doa.tag) && doa.tag.length > 0 ? (
              doa.tag.slice(0, 3).map((t, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-md"
                >
                  #{t}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">-</span>
            )}
          </div>
        )
      }
    ],
    []
  )

  const renderMobileCard = useCallback(
    (doa) => (
      <MobileDataCard
        key={doa.id}
        title={doa.nama}
        subtitle={doa.grup || 'Doa Harian'}
        fields={[
          { label: 'Lafadz', value: doa.ar },
          { label: 'Artinya', value: doa.idn },
          { label: 'Tag', value: Array.isArray(doa.tag) && doa.tag.length ? doa.tag.join(', ') : '-' }
        ]}
        onView={() => handleOpenDetail(doa)}
        onEdit={canManageMaster ? () => handleOpenEdit(doa) : undefined}
        onDelete={canManageMaster ? () => handleDelete(doa) : undefined}
      />
    ),
    [canManageMaster, handleOpenDetail, handleOpenEdit, handleDelete]
  )

  const doaPageActions = useMemo(
    () => (
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
        {canManageMaster && (
          <SquircleActionButton
            variant="sync"
            icon={RefreshCw}
            label="Katalog EQuran.id"
            onClick={handleOpenRemoteCatalog}
          />
        )}
        <SquircleActionButton
          variant="view"
          icon={Printer}
          label="Cetak Doa"
          onClick={() => {
            const rows = (filteredDoas || []).map((d, idx) => [
              idx + 1,
              d.nama || d.judul || '-',
              d.grup || '-',
              d.ar || d.arab || '-',
              d.idn || d.terjemah || d.arti || '-',
              d.sumber || d.riwayat || '-',
            ])
            printCleanTable({
              title: 'KUMPULAN DOA & DZIKIR HARIAN',
              subtitle: `Data Master Panduan Doa ${foundationName}`,
              headers: ['No', 'Judul Doa', 'Kategori', 'Lafadz Arab', 'Terjemahan', 'Sumber/Riwayat'],
              rows,
              orientation: 'landscape',
            })
          }}
        />
        <SquircleActionButton
          variant="export"
          icon={Download}
          label="Export JSON"
          onClick={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(doas, null, 2))
            const downloadAnchor = document.createElement('a')
            downloadAnchor.setAttribute("href", dataStr)
            downloadAnchor.setAttribute("download", `master_doa_${new Date().toISOString().slice(0, 10)}.json`)
            document.body.appendChild(downloadAnchor)
            downloadAnchor.click()
            downloadAnchor.remove()
            pushToast('Data doa berhasil diexport', 'success')
          }}
        />
        {canManageMaster && (
          <SquircleActionButton
            variant="restore"
            icon={Plus}
            label="Tambah Doa"
            onClick={handleOpenAdd}
          />
        )}
        {canManageMaster && doas.length > 0 && (
          <SquircleActionButton
            variant="delete"
            icon={Trash2}
            label="Kosongkan Data"
            onClick={handleDeleteAll}
          />
        )}
      </div>
    ),
    [canManageMaster, doas, filteredDoas, foundationName, handleOpenRemoteCatalog, handleOpenAdd, handleDeleteAll, pushToast]
  )

 return (
 <PageContainer maxW="7xl">
 <AppBreadcrumb className="mb-6" items={[{ label: 'Master Data', href: '/dashboard' }, { label: 'Doa Harian' }]} />

 {/* Modern Hero Header Banner */}
      <HeroUiHeader
        title="Master Doa & Dzikir Yaumiyah"
        subtitle="Kumpulan doa harian santri/siswa beserta teks Arab, transliterasi Latin, terjemahan Indonesia, dan referensi hadits."
        icon={BookOpen}
        roleTag="Master Data Doa & Dzikir"
        badge={`${displayStats.totalDoa} Doa`}
        className="mb-6"
      />

 <MasterDataPage className="doa-master-page space-y-6" hideBreadcrumb>
 {/* Summary Cards Grid (ModernKpiCard with MODERN_CARD_TONES & Ambient Glow) */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
 <ModernKpiCard
 label="Total Doa DB"
 value={displayStats.totalDoa}
 subtext="Tersimpan di database"
 tag="Database"
 icon={Layers}
 tone="emerald"
 ctaText="Semua Doa"
 onClick={() => { setGrupFilter('all'); setTagFilter('all'); setCurrentPage(1) }}
 />
 <ModernKpiCard
 label="Kategori / Grup"
 value={displayStats.totalGrup}
 subtext="Grup doa harian santri"
 tag="Grup Doa"
 icon={Bookmark}
 tone="blue"
 ctaText="Daftar Grup"
 />
 <ModernKpiCard
 label="Total Tag Unik"
 value={displayStats.totalTag}
 subtext="Tag kata kunci pencarian"
 tag="Keywords"
 icon={Tag}
 tone="purple"
 ctaText="Semua Tag"
 />
 <ModernKpiCard
 label="Referensi Hadits"
 value={displayStats.totalHadits}
 subtext="Disertai sumber hadits shahih"
 tag="Shahih"
 icon={ShieldCheck}
 tone="amber"
 ctaText="Doa Berhadits"
 />
 </div>

        {/* ── Master Datatable Panel (AppDataTable) ── */}
        <AppDataTable
          id="tabel-koleksi-doa"
          title="Koleksi Doa & Dzikir Yaumiyah"
          icon={BookOpen}
          iconClassName="bg-emerald-50 border border-emerald-200/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm"
          countLabel={`${Number(filteredDoas.length).toLocaleString('id-ID')} Doa`}
          description="Katalog doa lengkap dengan transliterasi Latin, arti, dan referensi sanad hadits."
          actions={doaPageActions}
          search={search}
          onSearchChange={(value) => {
            setSearch(value)
            setCurrentPage(1)
          }}
          searchPlaceholder="Cari ID, judul doa, lafadz Arab, transliterasi Latin, terjemahan, atau tag..."
          filters={
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-1 w-full">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="text-emerald-700 dark:text-emerald-400">Filter:</span>
                </span>

                <HeroUiFilterSelect
                  value={grupFilter}
                  onChange={(val) => { setGrupFilter(val); setCurrentPage(1) }}
                  options={formattedGrupOptions}
                  placeholder="Kategori / Grup"
                  icon={BookOpen}
                  className="w-full sm:w-auto min-w-[190px]"
                  popoverWidth="w-64"
                  searchable={formattedGrupOptions.length > 5}
                />

                <HeroUiFilterSelect
                  value={tagFilter}
                  onChange={(val) => { setTagFilter(val); setCurrentPage(1) }}
                  options={formattedTagOptions}
                  placeholder="Pilih Tag"
                  icon={Sparkles}
                  className="w-full sm:w-auto min-w-[150px]"
                  popoverWidth="w-56"
                  searchable={formattedTagOptions.length > 5}
                />

                <HeroUiFilterSelect
                  value={perPage}
                  onChange={(val) => { setPerPage(Number(val)); setCurrentPage(1) }}
                  options={perPageOptions}
                  placeholder="Per Halaman"
                  icon={Layers}
                  className="w-full sm:w-auto min-w-[120px]"
                  popoverWidth="w-32"
                />
              </div>

              {(search || grupFilter !== 'all' || tagFilter !== 'all') && (
                <button
                  type="button"
                  onClick={handleResetFilter}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/70 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300 cursor-pointer transition-all self-start sm:self-auto"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>
          }
          columns={doaColumns}
          data={paginatedDoas}
          renderMobileCard={renderMobileCard}
          page={currentPage}
          totalPages={totalPages}
          totalItems={filteredDoas.length}
          itemsPerPage={perPage}
          onPageChange={setCurrentPage}
          isLoading={loading}
          onRowClick={(doa) => handleOpenDetail(doa)}
          onView={(doa) => handleOpenDetail(doa)}
          onEdit={canManageMaster ? (doa) => handleOpenEdit(doa) : undefined}
          onDelete={canManageMaster ? (doa) => handleDelete(doa) : undefined}
          actionColumnLabel="AKSI"
        />

 {/* MODAL PILIH & IMPOR KATALOG EQURAN.ID (Harmonized Remote Modal - z-[70]) */}
      <AppModal
        isOpen={showRemoteCatalog}
        onClose={() => setShowRemoteCatalog(false)}
        title="Pilih & Impor Koleksi Doa"
        badge="Katalog Sumber EQuran.id"
        description="Pilih satu atau sinkronkan seluruh doa resmi ke database sekolah."
        icon={RefreshCw}
        maxWidth="max-w-3xl"
        zIndex={70}
        headerActions={
          <button
            type="button"
            disabled={syncingAll || loadingRemote}
            onClick={handleSyncAllFromCatalog}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30 px-3.5 py-1.5 text-xs font-black backdrop-blur-md disabled:opacity-60 transition cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${syncingAll ? 'animate-spin' : ''}`} />
            <span>{syncingAll ? 'Sinkron Seluruh…' : 'Impor Semua Sekaligus'}</span>
          </button>
        }
        subHeader={
          <div className="bg-emerald-50/90 dark:bg-emerald-950/40 border-b border-emerald-200/80 dark:border-emerald-800/60 px-6 py-2.5 text-xs font-bold text-emerald-900 dark:text-emerald-200">
            {loadingRemote ? 'Mengambil katalog EQuran.id…' : `${filteredRemoteDoas.length} item sumber tersedia. Item yang sudah ada dapat diimpor ulang untuk memperbarui isinya.`}
          </div>
        }
        bodyClassName="bg-slate-50/50 dark:bg-slate-900/30 p-4 sm:p-5"
        footer={
          <div className="flex w-full items-center justify-between gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Data resmi Kementerian Agama RI via EQuran.id
            </span>
            <button
              type="button"
              onClick={() => setShowRemoteCatalog(false)}
              className="h-9.5 px-5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700"
            >
              <X className="size-4" strokeWidth={2} />
              <span>Tutup Katalog</span>
            </button>
          </div>
        }
      >
 {loadingRemote ? (
 <div className="flex items-center justify-center gap-2 p-12 text-slate-500">
 <Loader2 className="size-5 animate-spin text-sky-600" />
 <span className="text-xs font-medium">Memuat katalog resmi…</span>
 </div>
 ) : (
 <div className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433]">
 {filteredRemoteDoas.map((doa) => {
 const id = Number(doa.id)
 const imported = importedDoaIds.has(id)
 return (
 <div key={id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-sky-50/30 dark:hover:bg-slate-800/40 transition-colors">
 <div className="min-w-0">
 <p className="font-extrabold text-slate-900 dark:text-white text-sm">#{id} · {doa.nama || doa.judul || 'Tanpa judul'}</p>
 <p className="mt-1 text-xs font-semibold text-sky-700 dark:text-sky-300">{doa.grup || doa.kategori || 'Doa Harian'}</p>
 </div>
 <button
 type="button"
 disabled={importingId === id}
 onClick={() => handleImportRemoteDoa(doa)}
 className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-extrabold text-white transition disabled:cursor-wait disabled:opacity-60 cursor-pointer shadow-xs"
 >
 {importingId === id ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
 {imported ? 'Impor Ulang' : 'Impor ke DB'}
 </button>
 </div>
 )
 })}
 </div>
 )}
      </AppModal>


 {/* MODAL READER DETAIL DOA (Harmonized Reader Detail Modal - z-[70]) */}
      <AppModal
        isOpen={Boolean(showDetailModal && selectedDoa)}
        onClose={() => setShowDetailModal(false)}
        title={selectedDoa?.nama}
        badge={selectedDoa ? `ID Doa #${selectedDoa.id}` : undefined}
        description={selectedDoa?.grup || 'Doa Harian'}
        icon={Bookmark}
        maxWidth="max-w-2xl"
        zIndex={70}
        bodyClassName="space-y-4 bg-slate-50/50 dark:bg-slate-900/30"
        footer={
          <div className="flex w-full items-center justify-between gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Konten Referensi Doa Resmi EQuran.id
            </span>
            <button
              type="button"
              onClick={() => setShowDetailModal(false)}
              className="h-9.5 px-5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700"
            >
              <X className="size-4" strokeWidth={2} />
              <span>Tutup Pembaca Doa</span>
            </button>
          </div>
        }
      >
        {selectedDoa && (
          loadingDetail ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <span className="text-sm font-medium">Memuat rincian doa...</span>
            </div>
          ) : (
            <>
 {/* Teks Arab (Large Right Aligned) */}
 <div className="bg-white dark:bg-[#1C2637] p-6 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs text-right text-3xl font-serif leading-loose text-slate-900 dark:text-white tracking-wide font-medium">
 {selectedDoa.ar}
 </div>

 {/* Transliterasi Latin */}
 <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border-l-4 border-slate-500 p-4 rounded-r-2xl text-emerald-900 dark:text-emerald-200 text-sm font-semibold italic shadow-xs">
 "{selectedDoa.tr}"
 </div>

 {/* Terjemahan Indonesia */}
 <div className="bg-white dark:bg-[#1C2637] p-5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs space-y-1.5">
 <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
 Terjemahan Bahasa Indonesia:
 </div>
 <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-normal">
 {selectedDoa.idn}
 </div>
 </div>

 {/* Referensi Sumber Hadits */}
 {selectedDoa.tentang && (
 <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-emerald-200/80 dark:border-emerald-800/60 p-4 rounded-xl text-amber-900 dark:text-amber-200 text-xs leading-relaxed space-y-1 shadow-xs">
 <div className="font-extrabold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
 <ShieldCheck className="w-4 h-4 text-amber-600" />
 <span>Referensi Sumber Hadits / Keterangan:</span>
 </div>
 <div>{selectedDoa.tentang}</div>
 </div>
 )}

 {/* Tags Badges */}
 {Array.isArray(selectedDoa.tag) && selectedDoa.tag.length > 0 && (
 <div className="flex items-center gap-2 flex-wrap pt-2">
 <span className="text-xs font-bold text-slate-400">Tag Keyword:</span>
 {selectedDoa.tag.map((t, i) => (
 <span
 key={i}
 className="px-2.5 py-1 bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs"
 >
 #{t}
 </span>
 ))}
 </div>
 )}
          </>
          )
        )}
      </AppModal>


 {/* MODAL FORM ADD / EDIT DOA (Harmonized Form Modal - z-[70]) */}
      <AppModal
        isOpen={showModal}
        onClose={() => !saving && setShowModal(false)}
        title={editingItem ? `Edit Doa: ${editingItem.nama}` : 'Tambah Doa Baru Manual'}
        badge={editingItem ? 'Perbarui Data' : 'Doa Baru'}
        description="Kelola teks Arab, transliterasi latin, terjemahan, serta kata kunci pencarian doa."
        icon={BookOpen}
        maxWidth="max-w-lg"
        zIndex={70}
        disableBackdropClose={saving}
        hideCloseButton={saving}
        footer={
          <>
            <button
              type="button"
              disabled={saving}
              onClick={() => setShowModal(false)}
              className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700 disabled:opacity-50"
            >
              <X className="size-4" strokeWidth={2} />
              <span>Batal</span>
            </button>
            <button
              type="submit"
              form="master-doa-form"
              disabled={saving}
              className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{editingItem ? 'Simpan Perubahan' : 'Tambah Doa'}</span>
            </button>
          </>
        }
      >
        <form id="master-doa-form" onSubmit={handleSave} className="space-y-4">
 <div className="grid grid-cols-3 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">ID Doa</label>
 <input
 type="number"
 required
 min="1"
 value={formData.id}
 onChange={(e) => setFormData({ ...formData, id: e.target.value })}
 className="w-full px-3 py-2 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 dark:bg-slate-900 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
 />
 </div>

 <div className="col-span-2">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori / Grup Doa</label>
 <input
 type="text"
 required
 value={formData.grup}
 onChange={(e) => setFormData({ ...formData, grup: e.target.value })}
 placeholder="Contoh: Doa Sebelum dan Sesudah Tidur"
 className="w-full px-3 py-2 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 dark:bg-slate-900 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Judul Doa</label>
 <input
 type="text"
 required
 value={formData.nama}
 onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
 placeholder="Contoh: Doa Sebelum Tidur"
 className="w-full px-3 py-2 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 dark:bg-slate-900 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Teks Arab (dengan Harakat)</label>
 <textarea
 rows="2"
 dir="rtl"
 value={formData.ar}
 onChange={(e) => setFormData({ ...formData, ar: e.target.value })}
 placeholder="بِسْمِكَ اللَّهُمَّ..."
 className="w-full px-3 py-2 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 dark:bg-slate-900 rounded-xl text-xs font-serif font-bold text-right text-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Transliterasi Latin</label>
 <input
 type="text"
 value={formData.tr}
 onChange={(e) => setFormData({ ...formData, tr: e.target.value })}
 placeholder="Bismikallāhumma aḥyā..."
 className="w-full px-3 py-2 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 dark:bg-slate-900 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Terjemahan Bahasa Indonesia</label>
 <textarea
 rows="2"
 value={formData.idn}
 onChange={(e) => setFormData({ ...formData, idn: e.target.value })}
 placeholder="Dengan nama-Mu ya Allah..."
 className="w-full px-3 py-2 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 dark:bg-slate-900 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Referensi Sumber Hadits (Opsional)</label>
 <input
 type="text"
 value={formData.tentang}
 onChange={(e) => setFormData({ ...formData, tentang: e.target.value })}
 placeholder="Contoh: HR. Bukhari no. 6312"
 className="w-full px-3 py-2 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 dark:bg-slate-900 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tag Keywords (pisahkan dengan koma)</label>
 <input
 type="text"
 value={formData.tagInput}
 onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
 placeholder="Contoh: tidur, malam, sebelum tidur"
 className="w-full px-3 py-2 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 dark:bg-slate-900 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
 />
 </div>

        </form>
      </AppModal>

      <HarmonizedDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false)
          setDeleteItem(null)
        }}
        onConfirm={handleConfirmDelete}
        item={deleteItem}
        isSubmitting={isDeleting}
      />

      <HarmonizedDeleteAllModal
        isOpen={isDeleteAllOpen}
        onClose={() => setIsDeleteAllOpen(false)}
        onConfirm={handleConfirmDeleteAll}
        isSubmitting={isDeletingAll}
      />

 </MasterDataPage>
 </PageContainer>
 )
}
