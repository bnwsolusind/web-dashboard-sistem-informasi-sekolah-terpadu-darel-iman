import {
  KpiStatCard
} from '../components/app'
import {
  useToast
} from '../components/app/ToastProvider'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  Compass,
  Play,
  Save,
  Database,
  RefreshCw,
  Search,
  Trash2,
  Copy,
  Check,
  MapPin,
  Calendar,
  Clock,
  Layers,
  FileCode,
  Globe,
  Sparkles,
  Server,
  Download,
  AlertTriangle,
  X,
  Printer,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Filter,
  Info
} from 'lucide-react'
import {
  equranService
} from '../services/equranService'
import ActionDropdown from '../components/app/ActionDropdown'
import AppDataTable from '../components/app/AppDataTable'
import AppModal from '../components/app/AppModal'
import MobileDataCard from '../components/app/MobileDataCard'
import PageContainer from '../components/app/PageContainer'
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
  SquircleActionButton,
  MasterDataPage
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

// ── HEROUI MODAL/FORM SELECT DROPDOWN COMPONENT ──
function HeroUiModalSelect({
 value,
 onChange,
 options = [],
 placeholder = 'Pilih...',
 label = null,
 required = false,
 icon: IconComponent = null,
 disabled = false,
 searchable = false,
 className = '',
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
 return options.filter(
 (opt) =>
 (opt.label && String(opt.label).toLowerCase().includes(q)) ||
 (opt.subtext && String(opt.subtext).toLowerCase().includes(q))
 )
 }, [options, search, searchable])

 return (
 <div className={`relative w-full ${className}`} ref={containerRef}>
 {label && (
 <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
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
 className={`w-full flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-medium transition-all duration-200 text-left cursor-pointer ${disabled
 ? 'bg-slate-100 dark:bg-slate-800/60 border-emerald-200/80 dark:border-emerald-800/60 text-slate-400 cursor-not-allowed'
 : isOpen
 ? 'border-[#059669] bg-white ring-2 ring-[#059669]/15 dark:border-[#10B981] dark:bg-slate-900 dark:ring-[#10B981]/20 text-slate-800 dark:text-slate-100 shadow-xs'
 : 'border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-slate-800 hover:border-slate-400 dark:hover:border-emerald-600/80 text-slate-800 dark:text-slate-100'
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
 className={`size-3.5 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
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
 className="absolute left-0 right-0 top-full mt-1.5 z-[95] overflow-hidden rounded-xl border border-emerald-200/80 bg-white/95 backdrop-blur-md shadow-2xl dark:border-emerald-700/80/80 dark:bg-[#182232]/95"
 >
 {searchable && options.length > 5 && (
 <div className="p-2 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <div className="relative">
 <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Ketik untuk mencari..."
 className="w-full rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/60 pl-8 pr-2.5 py-1.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#059669] focus:outline-none dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-100"
 autoFocus
 />
 </div>
 </div>
 )}

 <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
 {filteredOptions.length === 0 ? (
 <div className="px-3 py-3 text-center text-xs text-slate-400">
 Tidak ada opsi yang sesuai
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
 className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors text-left cursor-pointer ${isSelected
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

function HarmonizedDeleteModal({ isOpen, onClose, onConfirm, item, isSubmitting }) {
  return (
    <AppModal
      isOpen={Boolean(isOpen && item)}
      onClose={() => !isSubmitting && onClose()}
      title="Hapus Jadwal Sholat?"
      badge="Hapus Permanen"
      description="Apakah Anda yakin ingin menghapus data jadwal sholat ini dari database? Tindakan ini tidak dapat dibatalkan."
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
            <span>Hapus Jadwal</span>
          </button>
        </>
      }
    >
      {item && (
        <>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Apakah Anda yakin ingin menghapus data jadwal sholat ini dari database? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-rose-50/50 p-3.5 dark:bg-rose-950/20">
            <p className="text-xs font-black text-rose-950 dark:text-rose-100">
              {item?.kabkota_name || 'Kab/Kota'} ({item?.provinsi || 'Provinsi'})
            </p>
            <p className="text-xs text-rose-800/80 dark:text-rose-300/80 mt-1">
              Tanggal: {item?.tanggal_lengkap || item?.tanggal} ({item?.hari || '-'})
            </p>
          </div>
        </>
      )}
    </AppModal>
  )
}

function HarmonizedSaveConfirmModal({ isOpen, onClose, onConfirm, payload, isSubmitting }) {
  return (
    <AppModal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title="Simpan Jadwal Sholat Bulanan?"
      badge="Simpan Database"
      description="Sinkronisasi jadwal sholat bulanan ke database master aplikasi."
      icon={Database}
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
            className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Konfirmasi Simpan</span>
          </button>
        </>
      }
    >
      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        Data jadwal sholat bulanan untuk wilayah ini akan disimpan ke database master aplikasi untuk sinkronisasi otomatis absensi dan ibadah harian santri/siswa.
      </p>
      <div className="rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-emerald-50/50 p-3.5 dark:bg-emerald-950/20">
        <p className="text-xs font-black text-emerald-950 dark:text-emerald-100">
          {payload?.kabkota || 'Kota'} ({payload?.provinsi || 'Provinsi'})
        </p>
        <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-1">
          Bulan: {payload?.bulan} / {payload?.tahun} • {payload?.totalDays || '1 Bulan Penuh'}
        </p>
      </div>
    </AppModal>
  )
}

export default function MasterJadwalSholatPage() {
 const user = useAuthStore((state) => state.user)
 const canManageMaster = useMemo(() => {
 if (!user) return false
 const level = getUserRoleLevel(user)
 const perms = Array.isArray(user?.permissions) ? user.permissions : []
 return level <= ROLE_LEVELS.ADMIN || perms.includes('sistem.master_data')
 }, [user])

 const pengaturan = usePengaturanStore((state) => state.pengaturan)
 const foundationName = resolveFoundationName(pengaturan)
 // State for Interactive Testing Form
 const [activeEndpoint, setActiveEndpoint] = useState('POST_SHALAT') // GET_PROVINSI | POST_KABKOTA | POST_SHALAT
 const [provinsiList, setProvinsiList] = useState([])
 const [kabkotaList, setKabkotaList] = useState([])
 const [selectedProvinsi, setSelectedProvinsi] = useState('Jawa Barat')
 const [selectedKabkota, setSelectedKabkota] = useState('Kota Bogor')
 const [selectedBulan, setSelectedBulan] = useState(new Date().getMonth() + 1)
 const [selectedTahun, setSelectedTahun] = useState(2026)

 // Testing Response & Loading
 const [loadingTest, setLoadingTest] = useState(false)
 const [apiResponse, setApiResponse] = useState(null)
 const [savingDb, setSavingDb] = useState(false)
 const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false)

 // Toast notifications state
 const toast = useToast()
 const pushToast = (type, title, message = '') => {
 const tone = type === 'error' || type === 'danger' ? 'error' : type === 'warning' ? 'warning' : 'success'
 toast(message ? `${title}: ${message}` : title, tone)
 }

 // Delete modal state
 const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
 const [deleteItem, setDeleteItem] = useState(null)
 const [isDeleting, setIsDeleting] = useState(false)

 // Master Data DB Viewer State
 const [masterList, setMasterList] = useState([])
 const [masterStats, setMasterStats] = useState({ total_records: 0, total_provinsi: 0, total_kabkota: 0 })
 const [loadingMaster, setLoadingMaster] = useState(false)
 const [filterProvinsi, setFilterProvinsi] = useState('')
 const [filterKabkota, setFilterKabkota] = useState('')
 const [filterSearch, setFilterSearch] = useState('')
 const debouncedSearch = useDebounce(filterSearch, 350)
 const [currentPage, setCurrentPage] = useState(1)
 const perPage = 10

 // Load Provinces on mount
 useEffect(() => {
 fetchProvinsi()
 loadMasterFromDb()
 }, [])

 // Load Kabkota when selectedProvinsi changes
 useEffect(() => {
 if (selectedProvinsi) {
 fetchKabkota(selectedProvinsi)
 }
 }, [selectedProvinsi])

 const showToast = (msg, type = 'success') => {
 pushToast(type, type === 'error' ? 'Terjadi Kesalahan' : 'Berhasil', msg)
 }

 const fetchProvinsi = async () => {
 try {
 const res = await equranService.getProvinsi()
 if (res?.data) {
 setProvinsiList(res.data)
 }
 } catch (e) {
 console.error('Failed loading provinsi', e)
 }
 }

 const fetchKabkota = async (prov) => {
 try {
 const res = await equranService.getKabkota(prov)
 if (res?.data) {
 setKabkotaList(res.data)
 if (res.data.length > 0 && !res.data.includes(selectedKabkota)) {
 setSelectedKabkota(res.data[0])
 }
 }
 } catch (e) {
 console.error('Failed loading kabkota', e)
 }
 }

 const loadMasterFromDb = async () => {
 setLoadingMaster(true)
 try {
 const res = await equranService.getMasterShalatList({
 provinsi: filterProvinsi,
 kabkota: filterKabkota,
 search: debouncedSearch,
 })
 if (res?.data) {
 setMasterList(res.data)
 setMasterStats(res.stats || { total_records: res.data.length, total_provinsi: 0, total_kabkota: 0 })
 }
 } catch (e) {
 console.error('Failed loading master shalat from DB', e)
 } finally {
 setLoadingMaster(false)
 }
 }

 // Trigger search on debounce or filter change
 useEffect(() => {
 loadMasterFromDb()
 setCurrentPage(1)
 }, [debouncedSearch, filterProvinsi, filterKabkota])

 const handleRunTest = async () => {
 setLoadingTest(true)
 try {
 let res = null
 if (activeEndpoint === 'GET_PROVINSI') {
 res = await equranService.getProvinsi()
 } else if (activeEndpoint === 'POST_KABKOTA') {
 res = await equranService.getKabkota(selectedProvinsi)
 } else {
 res = await equranService.getJadwalShalatBulanan(
 selectedProvinsi,
 selectedKabkota,
 Number(selectedBulan),
 Number(selectedTahun)
 )
 }
 setApiResponse(res)
 showToast('Uji API berhasil dijalankan!')
 } catch (e) {
 setApiResponse({ code: 500, message: 'Gagal menjalankan uji API', error: e.message })
 showToast('Gagal menjalankan uji API', 'error')
 } finally {
 setLoadingTest(false)
 }
 }

 const handleConfirmSaveToDb = async () => {
 setSavingDb(true)
 try {
 let payload = {}
 if (apiResponse?.data?.jadwal) {
 payload = {
 provinsi: apiResponse.data.provinsi || selectedProvinsi,
 kabkota: apiResponse.data.kabkota || selectedKabkota,
 bulan: Number(apiResponse.data.bulan || selectedBulan),
 tahun: Number(apiResponse.data.tahun || selectedTahun),
 jadwal: apiResponse.data.jadwal,
 }
 } else {
 const fetched = await equranService.getJadwalShalatBulanan(
 selectedProvinsi,
 selectedKabkota,
 Number(selectedBulan),
 Number(selectedTahun)
 )
 payload = {
 provinsi: selectedProvinsi,
 kabkota: selectedKabkota,
 bulan: Number(selectedBulan),
 tahun: Number(selectedTahun),
 jadwal: fetched.data?.jadwal || [],
 }
 }

 const res = await equranService.saveMasterShalat(payload)
 if (res?.success) {
 showToast(res.message || 'Data jadwal sholat berhasil disimpan ke Database!')
 setIsConfirmSaveOpen(false)
 loadMasterFromDb()
 } else {
 showToast(res?.message || 'Gagal menyimpan data ke database', 'error')
 }
 } catch (e) {
 console.error('Error saving to DB:', e)
 const errorMsg = e.response?.data?.message || e.message || 'Gagal menyimpan data ke database'
 showToast(errorMsg, 'error')
 } finally {
 setSavingDb(false)
 }
 }

 const handleDeleteMaster = (row) => {
 setDeleteItem(row)
 setIsDeleteModalOpen(true)
 }

 const handleConfirmHapus = async () => {
 if (!deleteItem) return
 setIsDeleting(true)
 try {
 const res = await equranService.deleteMasterShalat(deleteItem.id)
 if (res?.success) {
 showToast(res.message || 'Data jadwal sholat berhasil dihapus')
 setIsDeleteModalOpen(false)
 setDeleteItem(null)
 loadMasterFromDb()
 }
 } catch (e) {
 showToast('Gagal menghapus data master', 'error')
 } finally {
 setIsDeleting(false)
 }
 }

 const handlePrint = () => {
 if (!masterList || masterList.length === 0) return
 const rows = masterList.map((m, idx) => [
 idx + 1,
 m.tanggal_lengkap || m.tanggal || '-',
 m.hari || '-',
 m.imsak || '-',
 m.subuh || '-',
 m.terbit || '-',
 m.dhuha || '-',
 m.dzuhur || '-',
 m.ashar || '-',
 m.maghrib || '-',
 m.isya || '-',
 ])
 printCleanTable({
 title: 'JADWAL WAKTU SHOLAT & IMSAKIYAH RESMI',
 subtitle: `Wilayah: ${filterKabkota ? filterKabkota + ', ' : ''}${filterProvinsi || (pengaturan?.province || '-')}${foundationName ? ` (${foundationName})` : ''}`,
 headers: ['No', 'Tanggal', 'Hari', 'Imsak', 'Subuh', 'Terbit', 'Dhuha', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'],
 rows,
 orientation: 'landscape',
 })
 }

 const exportToCsv = () => {
 if (masterList.length === 0) return
 const headers = ['Provinsi', 'KabKota', 'Tanggal', 'Hari', 'Imsak', 'Subuh', 'Terbit', 'Dhuha', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya']
 const rows = masterList.map((m) => [
 m.provinsi || '',
 m.kabkota_name || '',
 m.tanggal_lengkap || m.tanggal || '',
 m.hari || '',
 m.imsak || '',
 m.subuh || '',
 m.terbit || '',
 m.dhuha || '',
 m.dzuhur || '',
 m.ashar || '',
 m.maghrib || '',
 m.isya || '',
 ])

 const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
 const encodedUri = encodeURI(csvContent)
 const link = document.createElement('a')
 link.setAttribute('href', encodedUri)
 link.setAttribute('download', `Master_Jadwal_Sholat_${new Date().toISOString().split('T')[0]}.csv`)
 document.body.appendChild(link)
 link.click()
 document.body.removeChild(link)
 }

 const resetFilters = () => {
 setFilterSearch('')
 setFilterProvinsi('')
 setFilterKabkota('')
 setCurrentPage(1)
 }

 const bulanNames = [
 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
 ]

 const provinsiOptions = useMemo(() => provinsiList.map((p) => ({ value: p, label: p })), [provinsiList])
 const kabkotaOptions = useMemo(() => kabkotaList.map((k) => ({ value: k, label: k })), [kabkotaList])
 const bulanOptions = useMemo(() => [
 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
 ].map((name, idx) => ({ value: idx + 1, label: `${idx + 1} - ${name}` })), [])
 const filterProvinsiOptions = useMemo(() => [
 { value: '', label: 'Semua Provinsi' },
 ...provinsiList.map((p) => ({ value: p, label: p }))
 ], [provinsiList])

 // Pagination calculation
 const totalPages = Math.max(1, Math.ceil(masterList.length / perPage))
 const paginatedList = useMemo(() => {
 const start = (currentPage - 1) * perPage
 return masterList.slice(start, start + perPage)
 }, [masterList, currentPage, perPage])

  const jadwalColumns = useMemo(
    () => [
      {
        key: 'provinsi',
        label: 'Provinsi',
        className: 'hidden sm:table-cell py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200',
        render: (row) => row.provinsi || '-'
      },
      {
        key: 'kabkota',
        label: 'Kab / Kota',
        className: 'hidden sm:table-cell py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300',
        render: (row) => row.kabkota || '-'
      },
      {
        key: 'tanggal',
        label: 'Tanggal',
        className: 'py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200',
        render: (row) => row.tanggal || '-'
      },
      {
        key: 'hari',
        label: 'Hari',
        className: 'hidden md:table-cell py-3.5 px-4 font-medium text-slate-600 dark:text-slate-400',
        render: (row) => row.hari || '-'
      },
      {
        key: 'imsak',
        label: 'Imsak',
        className: 'hidden lg:table-cell py-3.5 px-3 text-center font-mono text-slate-500 dark:text-slate-400',
        render: (row) => row.imsak || '-'
      },
      {
        key: 'subuh',
        label: 'Subuh',
        className: 'py-3.5 px-3 text-center font-mono font-bold text-emerald-800 dark:text-emerald-300',
        render: (row) => row.subuh || '-'
      },
      {
        key: 'terbit',
        label: 'Terbit',
        className: 'hidden lg:table-cell py-3.5 px-3 text-center font-mono text-slate-500 dark:text-slate-400',
        render: (row) => row.terbit || '-'
      },
      {
        key: 'dhuha',
        label: 'Dhuha',
        className: 'hidden lg:table-cell py-3.5 px-3 text-center font-mono text-slate-500 dark:text-slate-400',
        render: (row) => row.dhuha || '-'
      },
      {
        key: 'dzuhur',
        label: 'Dzuhur',
        className: 'py-3.5 px-3 text-center font-mono font-bold text-blue-800 dark:text-blue-300',
        render: (row) => row.dzuhur || '-'
      },
      {
        key: 'ashar',
        label: 'Ashar',
        className: 'py-3.5 px-3 text-center font-mono font-bold text-indigo-800 dark:text-indigo-300',
        render: (row) => row.ashar || '-'
      },
      {
        key: 'maghrib',
        label: 'Maghrib',
        className: 'py-3.5 px-3 text-center font-mono font-bold text-orange-800 dark:text-orange-300',
        render: (row) => row.maghrib || '-'
      },
      {
        key: 'isya',
        label: 'Isya',
        className: 'py-3.5 px-3 text-center font-mono font-bold text-purple-800 dark:text-purple-300',
        render: (row) => row.isya || '-'
      }
    ],
    []
  )

  const renderMobileCard = useCallback(
    (row) => (
      <MobileDataCard
        key={row.id || `${row.tanggal}-${row.kabkota}`}
        title={`${row.hari || ''}, ${row.tanggal || ''}`}
        subtitle={`${row.kabkota || ''}, ${row.provinsi || ''}`}
        fields={[
          { label: 'Subuh', value: row.subuh || '-', icon: Clock },
          { label: 'Dzuhur', value: row.dzuhur || '-', icon: Clock },
          { label: 'Ashar', value: row.ashar || '-', icon: Clock },
          { label: 'Maghrib', value: row.maghrib || '-', icon: Clock },
          { label: 'Isya', value: row.isya || '-', icon: Clock }
        ]}
        onDelete={canManageMaster ? () => handleDeleteMaster(row) : undefined}
      />
    ),
    [canManageMaster, handleDeleteMaster]
  )

  const jadwalPageActions = useMemo(
    () => (
      <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
        <SquircleActionButton
          variant="print"
          icon={Printer}
          onClick={handlePrint}
          title="Cetak Jadwal Sholat"
        />
        <SquircleActionButton
          variant="export"
          icon={Download}
          onClick={exportToCsv}
          disabled={masterList.length === 0}
          title="Ekspor Jadwal Sholat ke CSV"
        />
        <SquircleActionButton
          variant="sync"
          icon={RefreshCw}
          onClick={loadMasterFromDb}
          disabled={loadingMaster}
          title="Muat Ulang Data dari Database"
        />
      </div>
    ),
    [handlePrint, exportToCsv, masterList.length, loadMasterFromDb, loadingMaster]
  )

 return (
 <PageContainer maxW="7xl">
 <div className="mb-4">
 <AppBreadcrumb items={[{ label: 'Master Data', href: '/dashboard' }, { label: 'Jadwal Sholat' }]} />
 </div>

 {/* Modern Hero Header Banner */}
 <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 !bg-[#D5F2E3] p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:!bg-[#112a22] print:hidden mb-6">

 <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div className="flex items-center gap-4">
 <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
 
            <Compass className="size-6 sm:size-7 text-white" />
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2.5 flex-wrap">
 <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold bg-emerald-600 text-white shadow-xs border border-emerald-500/40 dark:border-emerald-600/50">
 
                  <Sparkles className="size-3 animate-pulse text-white" />
 Master Data Ibadah
 </span>
 <span className="inline-flex items-center rounded-full bg-emerald-100/90 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
 Waktu Sholat
 </span>
 </div>
 <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
 Master Jadwal Sholat
 </h1>
 <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
 Pengelolaan data jadwal waktu sholat harian per kabupaten/kota seluruh Indonesia terintegrasi API EQuran.id.
 </p>
 </div>
 </div>
 </div>
 </div>

 <MasterDataPage className="sholat-master-page space-y-6" hideBreadcrumb>
 {/* Modern KPI Cards Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <ModernKpiCard
 title="Rekord Jadwal Sholat"
 value={`${masterStats.total_records || masterList.length} Hari`}
 subtext="Data jadwal dalam DB"
 icon={Database}
 tone="emerald"
 tag="JADWAL SHOLAT"
 />
 <ModernKpiCard
 title="Provinsi Tercover"
 value={`${masterStats.total_provinsi || 0} / 34`}
 subtext="Seluruh provinsi Indonesia"
 icon={Globe}
 tone="blue"
 tag="WILAYAH"
 />
 <ModernKpiCard
 title="Kab/Kota Tercover"
 value={`${masterStats.total_kabkota || 0} / 517`}
 subtext="Kota dan kabupaten nasional"
 icon={MapPin}
 tone="purple"
 tag="KAB / KOTA"
 />
 <ModernKpiCard
 title="Periode Kalender Uji"
 value={`${bulanNames[selectedBulan - 1]}`}
 subtext={`Tahun ${selectedTahun}`}
 icon={Calendar}
 tone="amber"
 tag="PERIODE"
 />
 </div>

 {/* Interactive Testing & API Pull Panel (Postman-style) */}
 <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-sm dark:bg-[#1B2433]">
 <div className="p-5 border-b border-emerald-200/80 dark:border-emerald-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
 <div className="flex items-center gap-3">
 <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm">
 <FileCode className="w-5 h-5 text-slate-600" />
 </div>
 <div>
 <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Testing Interaktif & Tarik Data API EQuran.id</h2>
 <p className="text-xs text-slate-500 dark:text-slate-400">Uji semua endpoint secara real-time dan simpan hasilnya ke database master.</p>
 </div>
 </div>

 {/* Endpoint Selector Tabs */}
 <div className="flex bg-emerald-50 dark:bg-emerald-950/40 p-1 rounded-xl gap-1 text-xs font-semibold">
 <button
 type="button"
 onClick={() => setActiveEndpoint('GET_PROVINSI')}
 className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeEndpoint === 'GET_PROVINSI'
 ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
 : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
 }`}
 >
 Data Provinsi
 </button>
 <button
 type="button"
 onClick={() => setActiveEndpoint('POST_KABKOTA')}
 className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeEndpoint === 'POST_KABKOTA'
 ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
 : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
 }`}
 >
 Data Kab/Kota
 </button>
 <button
 type="button"
 onClick={() => setActiveEndpoint('POST_SHALAT')}
 className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeEndpoint === 'POST_SHALAT'
 ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
 : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
 }`}
 >
 Data Bulanan
 </button>
 </div>
 </div>

 <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
 {/* Input Controls */}
 <div className="lg:col-span-5 space-y-4">
 <div className="bg-slate-50/80 dark:bg-slate-900/60 p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 space-y-4">
 <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
 <Layers className="w-4 h-4 text-emerald-600" /> Parameter Permintaan
 </h3>

 {/* Provinsi Select */}
 {activeEndpoint !== 'GET_PROVINSI' && (
 <div>
 <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
 Provinsi (Wajib)
 </label>
 <HeroUiModalSelect
 value={selectedProvinsi}
 onChange={setSelectedProvinsi}
 options={provinsiOptions}
 placeholder="Pilih Provinsi..."
 searchable={true}
 />
 </div>
 )}

 {/* Kabkota Select */}
 {activeEndpoint === 'POST_SHALAT' && (
 <div>
 <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
 Kabupaten / Kota (Wajib)
 </label>
 <HeroUiModalSelect
 value={selectedKabkota}
 onChange={setSelectedKabkota}
 options={kabkotaOptions}
 placeholder="Pilih Kab / Kota..."
 searchable={true}
 />
 </div>
 )}

 {/* Month & Year Select */}
 {activeEndpoint === 'POST_SHALAT' && (
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
 Bulan
 </label>
 <HeroUiModalSelect
 value={selectedBulan}
 onChange={(val) => setSelectedBulan(Number(val))}
 options={bulanOptions}
 placeholder="Pilih Bulan..."
 searchable={false}
 />
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
 Tahun
 </label>
 <input
 type="number"
 value={selectedTahun}
 onChange={(e) => setSelectedTahun(e.target.value)}
 className="w-full bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
 />
 </div>
 </div>
 )}

 {/* Action Buttons */}
 <div className="flex gap-2.5 pt-2">
 <button
 type="button"
 onClick={handleRunTest}
 disabled={loadingTest}
 className="flex-1 bg-emerald-600 dark:bg-slate-100 dark:text-slate-900 dark: hover:from-emerald-700 hover:to-teal-700 font-bold py-2.5 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs cursor-pointer text-white border border-emerald-200/80 dark:border-emerald-800/60 h-9 text-sm font-medium"
 >
 <Play className={`w-3.5 h-3.5 ${loadingTest ? 'animate-spin' : ''}`} />
 {loadingTest ? 'Memuat Data...' : 'Lihat Data API'}
 </button>

 {canManageMaster && (
 <button
 type="button"
 onClick={() => setIsConfirmSaveOpen(true)}
 disabled={savingDb}
 className="bg-white dark:bg-[#1B2433] hover:from-teal-700 hover:to-cyan-700 font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 text-xs cursor-pointer"
 title="Simpan Jadwal Sholat ke Database Master"
 >
 <Save className={`w-3.5 h-3.5 ${savingDb ? 'animate-spin' : ''}`} />
 {savingDb ? 'Menyimpan...' : 'Simpan DB'}
 </button>
 )}
 </div>
 </div>
 </div>

 {/* Response UI/UX Data Preview */}
 <div className="lg:col-span-7 flex flex-col">
 <div className="bg-slate-900 text-slate-100 rounded-xl p-5 flex-1 flex flex-col border border-emerald-800/60 shadow-inner min-h-[340px]">
 <div className="flex justify-between items-center border-b border-emerald-800/60 pb-3 mb-4">
 <div className="flex items-center gap-2">
 <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
 <span className="text-xs font-bold tracking-wider uppercase text-slate-200">
 PRATINJAU HASIL DATA {apiResponse?.code ? `(Status: ${apiResponse.code})` : ''}
 </span>
 </div>
 {apiResponse && (
 <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 font-semibold">
 {apiResponse.message || '200 OK'}
 </span>
 )}
 </div>

 <div className="flex-1 overflow-auto max-h-[380px]">
 {!apiResponse ? (
 <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-12">
 <Server className="w-12 h-9 stroke-[1.5] mb-2 opacity-40 text-emerald-500" />
 <p className="font-semibold text-slate-400 text-xs">Pilih parameter dan klik "Lihat Data API" untuk menguji data.</p>
 </div>
 ) : Array.isArray(apiResponse.data) ? (
 <div className="space-y-3">
 <div className="flex justify-between items-center text-xs text-slate-400 bg-slate-800/60 p-2.5 rounded-xl border border-emerald-700/80/60">
 <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
 <Globe className="w-4 h-4" /> Total Data Ditemukan: {apiResponse.data.length} Wilayah
 </span>
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
 {apiResponse.data.map((item, idx) => (
 <div
 key={idx}
 className="bg-slate-800/80 hover:bg-slate-800 border border-emerald-700/80/70 p-2.5 rounded-xl text-xs font-medium text-slate-200 flex items-center gap-2 transition-all"
 >
 <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
 <span className="truncate">{item}</span>
 </div>
 ))}
 </div>
 </div>
 ) : apiResponse.data?.jadwal ? (
 <div className="space-y-4">
 <div className="bg-white dark:bg-[#1B2433] p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/40 flex flex-wrap justify-between items-center gap-2">
 <div>
 <h4 className="text-sm font-bold text-emerald-200">
 {apiResponse.data.provinsi} - {apiResponse.data.kabkota}
 </h4>
 <p className="text-xs text-emerald-300/80">
 Jadwal Shalat Bulanan: {apiResponse.data.bulan_nama || `Bulan ${apiResponse.data.bulan}`} {apiResponse.data.tahun}
 </p>
 </div>
 <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-200/80 dark:border-emerald-800/60 font-semibold">
 {apiResponse.data.jadwal.length} Hari
 </span>
 </div>

 <div className="overflow-x-auto rounded-xl border border-emerald-800/60">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 <th className="py-2.5 px-3">Tgl</th>
 <th className="py-2.5 px-3">Hari</th>
 <th className="py-2.5 px-2 text-center text-slate-400">Imsak</th>
 <th className="py-2.5 px-2 text-center text-emerald-400">Subuh</th>
 <th className="py-2.5 px-2 text-center text-amber-400">Dzuhur</th>
 <th className="py-2.5 px-2 text-center text-indigo-400">Ashar</th>
 <th className="py-2.5 px-2 text-center text-orange-400">Maghrib</th>
 <th className="py-2.5 px-2 text-center text-purple-400">Isya</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-900/40/60 font-mono">
 {apiResponse.data.jadwal.slice(0, 10).map((row, idx) => (
 <tr key={idx} className="hover:bg-emerald-50/40 transition-colors text-slate-300">
 <td className="py-2 px-3 font-bold text-emerald-400">{row.tanggal}</td>
 <td className="py-2 px-3 font-sans font-medium">{row.hari}</td>
 <td className="py-2 px-2 text-center text-slate-400">{row.imsak}</td>
 <td className="py-2 px-2 text-center font-semibold text-emerald-300">{row.subuh}</td>
 <td className="py-2 px-2 text-center font-semibold text-amber-300">{row.dzuhur}</td>
 <td className="py-2 px-2 text-center font-semibold text-indigo-300">{row.ashar}</td>
 <td className="py-2 px-2 text-center font-semibold text-orange-300">{row.maghrib}</td>
 <td className="py-2 px-2 text-center font-semibold text-purple-300">{row.isya}</td>
 </tr>
 ))}
 </tbody>
 </table>
 {apiResponse.data.jadwal.length > 10 && (
 <p className="text-center py-2 text-xs text-slate-400 italic bg-slate-800/30">
 Menampilkan 10 dari {apiResponse.data.jadwal.length} hari...
 {canManageMaster ? ' (Klik "Simpan DB" untuk memasukkan seluruh data ke Database Master)' : ''}
 </p>
 )}
 </div>
 </div>
 ) : (
 <div className="p-4 bg-slate-800 rounded-xl text-xs text-slate-300">
 <p className="font-semibold text-emerald-400">{apiResponse.message || 'Respon berhasil diterima'}</p>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>

        {/* ── Master Datatable Panel (AppDataTable) ── */}
        <AppDataTable
          id="tabel-jadwal-sholat"
          title="Master Jadwal Sholat"
          icon={Clock}
          iconClassName="bg-emerald-50 border border-emerald-200/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm"
          countLabel={`${Number(masterList.length).toLocaleString('id-ID')} Tersimpan`}
          description="Jadwal sholat harian per wilayah yang siap digunakan modul Absensi & Mutaba'ah."
          actions={jadwalPageActions}
          search={filterSearch}
          onSearchChange={(value) => {
            setFilterSearch(value)
            setCurrentPage(1)
          }}
          searchPlaceholder="Cari berdasarkan nama provinsi, kabupaten/kota, hari, atau tanggal..."
          filters={
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs w-full">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold mr-1">
                  <Filter className="size-3.5 text-emerald-600" />
                  <span>Filter Wilayah:</span>
                </div>

                <HeroUiFilterSelect
                  value={filterProvinsi}
                  onChange={(val) => {
                    setFilterProvinsi(val)
                    setCurrentPage(1)
                  }}
                  options={filterProvinsiOptions}
                  placeholder="Semua Provinsi"
                  searchable={true}
                />

                {(filterSearch || filterProvinsi || filterKabkota) && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-700/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="size-3 text-emerald-600" />
                    <span>Reset Filter</span>
                  </button>
                )}
              </div>
            </div>
          }
          columns={jadwalColumns}
          data={paginatedList}
          renderMobileCard={renderMobileCard}
          page={currentPage}
          totalPages={totalPages}
          totalItems={masterList.length}
          itemsPerPage={perPage}
          onPageChange={setCurrentPage}
          isLoading={loadingMaster}
          onDelete={canManageMaster ? (row) => handleDeleteMaster(row) : undefined}
          actionColumnLabel="AKSI"
        />

 {/* Harmonized Delete Modal */}
 <HarmonizedDeleteModal
 isOpen={isDeleteModalOpen}
 onClose={() => {
 setIsDeleteModalOpen(false)
 setDeleteItem(null)
 }}
 onConfirm={handleConfirmHapus}
 item={deleteItem}
 isSubmitting={isDeleting}
 />

 {/* Harmonized Save Confirmation Modal */}
 <HarmonizedSaveConfirmModal
 isOpen={isConfirmSaveOpen}
 onClose={() => setIsConfirmSaveOpen(false)}
 onConfirm={handleConfirmSaveToDb}
 payload={{
 provinsi: selectedProvinsi,
 kabkota: selectedKabkota,
 bulan: selectedBulan,
 tahun: selectedTahun,
 totalDays: apiResponse?.data?.jadwal?.length ? `${apiResponse.data.jadwal.length} Hari` : null,
 }}
 isSubmitting={savingDb}
 />


 </MasterDataPage>
 </PageContainer>
 )
}
