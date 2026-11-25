import { HeroUiHeader } from "../components/ui/HeroUiHeader"
import {
  KpiStatCard
} from '../components/app'
import {
  useState,
  useEffect,
  useMemo,
  useRef
} from 'react'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  Activity,
  BookOpen,
  Plus,
  Search,
  Edit3,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  Clock,
  Layers,
  ListOrdered,
  FileText,
  Tag,
  Check,
  Ban,
  SlidersHorizontal
} from 'lucide-react'
import Swal from '@/components/ui/compat/swal-heroui'
import {
  lmsAktivitasBelajarService
} from '../services/lmsAktivitasBelajarService'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import {
  useDebounce
} from '../hooks/useDebounce'
import {
  printCleanTable,
  downloadPdfTable
} from '../utils/printHelper'
import {
  SquircleActionButton,
  PrintOptionModal
} from '../components/master-data'
import AppDataTable from '../components/app/AppDataTable'
import MobileDataCard from '../components/app/MobileDataCard'
import CsvImportModal from '../components/master-data/CsvImportModal'
import AppModal from '../components/app/AppModal'
import ActionDropdown from '../components/app/ActionDropdown'
import {
  RotateCcw,
  Printer
} from 'lucide-react'

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

// ── HEROUI MODAL FORM SELECT DROPDOWN COMPONENT ──
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
 : 'border-emerald-200/80 bg-slate-50/50 hover:bg-white hover:border-emerald-300 dark:border-emerald-700/80/80 dark:bg-slate-900/50 dark:hover:bg-slate-900 dark:hover:border-emerald-600/80 text-slate-800 dark:text-slate-100'
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
 className="absolute left-0 right-0 top-full mt-1.5 z-[90] overflow-hidden rounded-xl border border-emerald-200/80 bg-white/95 backdrop-blur-md shadow-2xl dark:border-emerald-700/80/80 dark:bg-[#182232]/95"
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
 className="w-full rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/60 pl-8 pr-2.5 py-1.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#059669] focus:outline-none dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-100"
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

export default function LmsAktivitasBelajarPage({ embedded = false, hideBreadcrumb = false, hidePageHeader = false, tabNav = null }) {
 const [dataAktivitas, setDataAktivitas] = useState([])
 const [optionsModulAjar, setOptionsModulAjar] = useState([])
 const [optionsJenis, setOptionsJenis] = useState([
 'Pendahuluan',
 'Inti',
 'Penutup',
 'Diskusi',
 'Kuis',
 'Tugas',
 'Presentasi',
 'Refleksi',
 'Eksperimen',
 'Praktikum',
 ])
 const [stats, setStats] = useState({
 total: 0,
 pendahuluan: 0,
 inti: 0,
 penutup: 0,
 aktif: 0,
 draft: 0,
 })

 // KPI Modal State
 const [kpiModalOpen, setKpiModalOpen] = useState(false)
 const [kpiModalCategory, setKpiModalCategory] = useState({
 title: '',
 items: [],
 })

 const [loading, setLoading] = useState(true)
 const [errorMsg, setErrorMsg] = useState('')
 const [successMsg, setSuccessMsg] = useState('')

 // Filters & Pagination
 const [search, setSearch] = useState('')
 const debouncedSearch = useDebounce(search, 350)
 const [selectedModulAjar, setSelectedModulAjar] = useState('')
 const [selectedJenis, setSelectedJenis] = useState('')
 const [selectedStatus, setSelectedStatus] = useState('')
 const [page, setPage] = useState(1)
 const [pagination, setPagination] = useState({
 current_page: 1,
 last_page: 1,
 total: 0,
 per_page: 15,
 })

 const filterModulAjarOptions = useMemo(() => [
 { value: '', label: 'Semua Modul Ajar' },
 ...optionsModulAjar.map((m) => ({ value: String(m.id), label: m.judul_modul })),
 ], [optionsModulAjar])

 const filterJenisOptions = useMemo(() => [
 { value: '', label: 'Semua Jenis' },
 ...optionsJenis.map((j) => ({ value: j, label: j })),
 ], [optionsJenis])

 const filterStatusOptions = useMemo(() => [
 { value: '', label: 'Semua Status' },
 { value: 'aktif', label: 'Aktif' },
 { value: 'draft', label: 'Draft' },
 { value: 'nonaktif', label: 'Nonaktif' },
 ], [])

 const modalModulAjarOptions = useMemo(() => [
 ...optionsModulAjar.map((m) => ({
 value: String(m.id),
 label: m.kode_modul ? `${m.judul_modul} (${m.kode_modul})` : m.judul_modul,
 })),
 ], [optionsModulAjar])

 const modalJenisOptions = useMemo(() => [
 ...optionsJenis.map((j) => ({ value: j, label: j })),
 ], [optionsJenis])

 const modalStatusOptions = useMemo(() => [
 { value: 'aktif', label: 'Aktif' },
 { value: 'draft', label: 'Draft' },
 { value: 'nonaktif', label: 'Nonaktif' },
 ], [])

 // Modal Form State
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [isDetailOpen, setIsDetailOpen] = useState(false)
 const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
 const [importOpen, setImportOpen] = useState(false)
 const [selectedDetail, setSelectedDetail] = useState(null)
 const [editId, setEditId] = useState(null)
 const [formLoading, setFormLoading] = useState(false)

 const handleExportCSV = () => {
 const headers = ['NO', 'JUDUL AKTIVITAS', 'JENIS', 'MODUL AJAR', 'DURASI', 'STATUS']
 const rows = (dataAktivitas || []).map((a, i) => [
 i + 1,
 `"${(a.judul_aktivitas || a.nama_aktivitas || '').replace(/"/g, '""')}"`,
 a.jenis_aktivitas || a.jenis || '',
 `"${(a.modul_ajar?.judul_modul || '').replace(/"/g, '""')}"`,
 a.durasi_menit ? `${a.durasi_menit} Menit` : '',
 a.status === 'aktif' ? 'Aktif' : 'Draft',
 ])
 const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
 const encodedUri = encodeURI(csvContent)
 const link = document.createElement('a')
 link.setAttribute('href', encodedUri)
 link.setAttribute('download', `export_aktivitas_belajar_${new Date().toISOString().slice(0, 10)}.csv`)
 document.body.appendChild(link)
 link.click()
 document.body.removeChild(link)
 }

 const handleImport = async (parsedData) => {
 setSuccessMsg(`Berhasil mengimpor ${parsedData.length} data aktivitas belajar.`)
 fetchDaftarAktivitas()
 }

 const pageActions = (
 <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
 <SquircleActionButton variant="import" label="Import Data" onClick={() => setImportOpen(true)} />
 <SquircleActionButton variant="export" label="Export Data" onClick={handleExportCSV} />
 <SquircleActionButton variant="print" icon={Printer} label="Cetak Data" onClick={() => setIsPrintModalOpen(true)} />
 <SquircleActionButton variant="primary" label="Tambah Aktivitas" onClick={() => handleOpenCreateModal()} />
 </div>
 )

 const [formData, setFormData] = useState({
 modul_ajar_id: '',
 nama_aktivitas: '',
 jenis_aktivitas: 'Inti',
 instruksi: '',
 waktu: 15,
 urutan: 1,
 status: 'aktif',
 })

 useEffect(() => {
 fetchOptions()
 fetchStats()
 }, [])

 useEffect(() => {
 fetchData()
 }, [page, debouncedSearch, selectedModulAjar, selectedJenis, selectedStatus])

 const fetchStats = async () => {
 try {
 const res = await lmsAktivitasBelajarService.getStats()
 if (res.success) {
 setStats(res.data)
 }
 } catch (err) {
 console.error('Gagal mengambil statistik aktivitas:', err)
 }
 }

 const computedStats = useMemo(() => {
 return {
 total: dataAktivitas.length,
 pendahuluan: dataAktivitas.filter((a) => a.jenis_aktivitas === 'Pendahuluan').length,
 inti: dataAktivitas.filter((a) => a.jenis_aktivitas === 'Inti').length,
 penutup: dataAktivitas.filter((a) => a.jenis_aktivitas === 'Penutup' || a.jenis_aktivitas === 'Refleksi').length,
 }
 }, [dataAktivitas])

 const handleOpenKpiModal = (type) => {
 let title = ''
 let items = []

 if (type === 'total') {
 title = 'Total Aktivitas Belajar Terdaftar'
 items = dataAktivitas
 } else if (type === 'pendahuluan') {
 title = 'Daftar Aktivitas Pendahuluan (Orientasi & Apersepsi)'
 items = dataAktivitas.filter((a) => a.jenis_aktivitas === 'Pendahuluan')
 } else if (type === 'inti') {
 title = 'Daftar Aktivitas Kegiatan Inti (Eksplorasi & Praktik)'
 items = dataAktivitas.filter((a) => a.jenis_aktivitas === 'Inti')
 } else if (type === 'penutup') {
 title = 'Daftar Aktivitas Penutup & Refleksi'
 items = dataAktivitas.filter((a) => a.jenis_aktivitas === 'Penutup' || a.jenis_aktivitas === 'Refleksi')
 }

 setKpiModalCategory({ title, items })
 setKpiModalOpen(true)
 }

 const fetchOptions = async () => {
 try {
 const res = await lmsAktivitasBelajarService.getOptions()
 if (res.success) {
 if (res.data.modul_ajar) setOptionsModulAjar(res.data.modul_ajar)
 if (res.data.jenis_aktivitas) setOptionsJenis(res.data.jenis_aktivitas)
 }
 } catch (err) {
 console.error('Gagal mengambil opsi data:', err)
 }
 }

 const fetchData = async () => {
 setLoading(true)
 setErrorMsg('')
 try {
 const params = {
 page,
 per_page: 15,
 search: debouncedSearch,
 modul_ajar_id: selectedModulAjar,
 jenis_aktivitas: selectedJenis,
 status: selectedStatus,
 }
 const res = await lmsAktivitasBelajarService.getDaftar(params)
 setDataAktivitas(res.data || [])
 if (res.meta) {
 setPagination({
 current_page: res.meta.current_page,
 last_page: res.meta.last_page,
 total: res.meta.total,
 per_page: res.meta.per_page,
 })
 }
 } catch (err) {
 console.error('Error fetching data aktivitas:', err)
 setErrorMsg('Gagal memuat data aktivitas belajar. Silakan coba lagi.')
 } finally {
 setLoading(false)
 }
 }

 const handleOpenCreateModal = () => {
 setEditId(null)
 setFormData({
 modul_ajar_id: optionsModulAjar.length > 0 ? optionsModulAjar[0].id : '',
 nama_aktivitas: '',
 jenis_aktivitas: 'Inti',
 instruksi: '',
 waktu: 15,
 urutan: dataAktivitas.length + 1,
 status: 'aktif',
 })
 setIsModalOpen(true)
 }

 const handleOpenEditModal = (item) => {
 setEditId(item.id)
 setFormData({
 modul_ajar_id: item.modul_ajar_id || '',
 nama_aktivitas: item.nama_aktivitas || '',
 jenis_aktivitas: item.jenis_aktivitas || 'Inti',
 instruksi: item.instruksi || '',
 waktu: item.waktu || 15,
 urutan: item.urutan || 1,
 status: item.status || 'aktif',
 })
 setIsModalOpen(true)
 }

 const handleOpenDetail = (item) => {
 setSelectedDetail(item)
 setIsDetailOpen(true)
 }

 const handleSubmit = async (e) => {
 e.preventDefault()
 setFormLoading(true)
 setErrorMsg('')
 setSuccessMsg('')

 try {
 let res
 if (editId) {
 res = await lmsAktivitasBelajarService.update(editId, formData)
 } else {
 res = await lmsAktivitasBelajarService.create(formData)
 }

 if (res.success) {
 setSuccessMsg(editId ? 'Aktivitas Belajar berhasil diperbarui!' : 'Aktivitas Belajar berhasil dibuat!')
 setIsModalOpen(false)
 fetchData()
 fetchStats()
 setTimeout(() => setSuccessMsg(''), 4000)
 }
 } catch (err) {
 console.error('Error submitting form:', err)
 const errRes = err.response?.data
 if (errRes && errRes.message) {
 setErrorMsg(errRes.message)
 } else {
 setErrorMsg('Terjadi kesalahan saat menyimpan data. Periksa kembali form Anda.')
 }
 } finally {
 setFormLoading(false)
 }
 }

 const handleDelete = async (id, nama) => {
 const result = await Swal.fire({
 title: 'Hapus Aktivitas Belajar?',
 text: `Apakah Anda yakin ingin menghapus aktivitas "${nama}"?`,
 icon: 'warning',
 showCancelButton: true,
 confirmButtonColor: '#059669',
 cancelButtonColor: '#EF4444',
 confirmButtonText: 'Ya, Hapus!',
 cancelButtonText: 'Batal',
 customClass: {
 popup: 'rounded-xl',
 confirmButton: 'px-5 py-2.5 rounded-xl  font-medium',
 cancelButton: 'px-5 py-2.5 rounded-xl font-medium',
 },
 })

 if (result.isConfirmed) {
 try {
 const res = await lmsAktivitasBelajarService.delete(id)
 if (res.success) {
 Swal.fire({
 title: 'Terhapus!',
 text: 'Aktivitas belajar berhasil dihapus.',
 icon: 'success',
 confirmButtonColor: '#059669',
 customClass: { popup: 'rounded-xl' },
 })
 fetchData()
 fetchStats()
 }
 } catch (err) {
 console.error('Gagal menghapus aktivitas:', err)
 Swal.fire({
 title: 'Gagal!',
 text: 'Gagal menghapus data aktivitas belajar.',
 icon: 'error',
 confirmButtonColor: '#059669',
 })
 }
 }
 }

 const getJenisBadgeColor = (jenis) => {
 switch (jenis) {
 case 'Pendahuluan':
 return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-emerald-200/80 dark:border-emerald-800/60'
 case 'Inti':
 return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/60'
 case 'Penutup':
 case 'Refleksi':
 return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-emerald-200/80 dark:border-emerald-800/60'
 case 'Diskusi':
 case 'Presentasi':
 return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-emerald-200/80 dark:border-emerald-800/60'
 case 'Kuis':
 case 'Tugas':
 return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-emerald-200/80 dark:border-emerald-800/60'
 default:
 return 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-emerald-200/80 dark:border-emerald-800/60'
 }
 }

  // ── Canonical Columns for Aktivitas Belajar ──
  const aktivitasColumns = useMemo(() => [
    {
      key: 'no',
      label: 'No',
      width: 'w-12',
      align: 'center',
      render: (_, idx) => (
        <span className="font-medium text-slate-400">
          {(pagination.current_page - 1) * pagination.per_page + idx + 1}
        </span>
      ),
    },
    {
      key: 'urutan',
      label: 'Urutan',
      width: 'w-16',
      align: 'center',
      render: (item, idx) => (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          #{item.urutan || idx + 1}
        </span>
      ),
    },
    {
      key: 'nama_aktivitas',
      label: 'Nama Aktivitas Belajar',
      render: (item) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">{item.nama_aktivitas}</p>
          {item.instruksi ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 font-medium">{item.instruksi}</p>
          ) : (
            <p className="text-xs text-slate-400 italic mt-0.5">Tanpa instruksi khusus</p>
          )}
        </div>
      ),
    },
    {
      key: 'jenis_aktivitas',
      label: 'Jenis Kegiatan',
      align: 'center',
      render: (item) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getJenisBadgeColor(item.jenis_aktivitas)}`}>
          {item.jenis_aktivitas}
        </span>
      ),
    },
    {
      key: 'modul_ajar',
      label: 'Modul Ajar',
      render: (item) => item.modul_ajar ? (
        <div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 line-clamp-1">
            {item.modul_ajar.judul_modul}
          </p>
          <p className="text-xs text-slate-400 font-mono">{item.modul_ajar.kode_modul}</p>
        </div>
      ) : (
        <span className="text-xs text-slate-400 italic">-</span>
      ),
    },
    {
      key: 'durasi',
      label: 'Durasi',
      align: 'center',
      render: (item) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg">
          <Clock className="w-3.5 h-3.5 text-[#059669]" /> {item.waktu || item.durasi_menit || 0} mnt
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (item) => item.status === 'aktif' ? (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60">
          <Check className="w-3 h-3" /> Aktif
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-emerald-200/80 dark:border-emerald-800/60">
          Draft
        </span>
      ),
    },
  ], [pagination.current_page, pagination.per_page])

 return (
 <PageContainer maxW="7xl">
 {!(embedded || hideBreadcrumb) && (
 <AppBreadcrumb items={[{ label: 'LMS & Akademik', href: '/dashboard' }, { label: 'Aktivitas Belajar' }]} />
 )}
 <div className="lms-aktivitas-page space-y-6">
 <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
 <PrintOptionModal
 isOpen={isPrintModalOpen}
 onClose={() => setIsPrintModalOpen(false)}
 title="Aktivitas Belajar"
 onPrint={() => {
 const rowsToPrint = Array.isArray(dataAktivitas) ? dataAktivitas : []
 printCleanTable({
 title: 'Laporan Data Aktivitas Belajar',
 subtitle: 'Daftar Aktivitas Belajar Sekolah Islam Terpadu',
 headers: ['NO', 'JUDUL AKTIVITAS', 'JENIS', 'MODUL AJAR', 'DURASI', 'STATUS'],
 rows: rowsToPrint.map((row, i) => [
 i + 1,
 row.judul_aktivitas || row.nama_aktivitas || '-',
 row.jenis_aktivitas || row.jenis || '-',
 row.modul_ajar?.judul_modul || '-',
 row.durasi_menit ? `${row.durasi_menit} Menit` : '-',
 row.status === 'aktif' ? 'Aktif' : 'Draft',
 ]),
 })
 }}
 onDownload={() => {
 const rowsToPrint = Array.isArray(dataAktivitas) ? dataAktivitas : []
 downloadPdfTable({
 title: 'Laporan Data Aktivitas Belajar',
 subtitle: 'Daftar Aktivitas Belajar Sekolah Islam Terpadu',
 headers: ['NO', 'JUDUL AKTIVITAS', 'JENIS', 'MODUL AJAR', 'DURASI', 'STATUS'],
 rows: rowsToPrint.map((row, i) => [
 i + 1,
 row.judul_aktivitas || row.nama_aktivitas || '-',
 row.jenis_aktivitas || row.jenis || '-',
 row.modul_ajar?.judul_modul || '-',
 row.durasi_menit ? `${row.durasi_menit} Menit` : '-',
 row.status === 'aktif' ? 'Aktif' : 'Draft',
 ]),
 filename: 'laporan_aktivitas_belajar.pdf',
 })
 }}
 />

 <CsvImportModal
 open={importOpen}
 onClose={() => setImportOpen(false)}
 title="Aktivitas Belajar"
 onImport={handleImport}
 columns={[
 { key: 'modul_ajar_id' },
 { key: 'nama_aktivitas', required: true, example: 'Diskusi Kelompok Fiqih' },
 { key: 'jenis_aktivitas', example: 'Inti' },
 { key: 'durasi_menit', example: '30' },
 { key: 'deskripsi', example: 'Petunjuk aktivitas...' },
 { key: 'status', example: 'aktif' },
 ]}
 />
 {/* Hero Banner */}
      {!hidePageHeader && (
        <div className="mb-6">
          <HeroUiHeader
            title="Aktivitas Belajar"
            subtitle="Kelola alur skenario kegiatan pembelajaran (Pendahuluan, Inti, Penutup, Diskusi, Tugas) terintegrasi Modul Ajar."
            badge="LMS — Rencana Aktivitas Belajar"
            icon={Activity}
            actions={
              <SquircleActionButton
                variant="primary"
                icon={Plus}
                label="Tambah Aktivitas"
                onClick={handleOpenCreateModal}
              />
            }
          />
        </div>
      )}

      {/* Alert Messages */}
 {successMsg && (
 <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60">
 <div className="flex items-center gap-3">
 <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
 <span className="text-sm font-medium">{successMsg}</span>
 </div>
 <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-800">
 <X className="w-4 h-4" />
 </button>
 </div>
 )}

 {errorMsg && (
 <div className="flex items-center justify-between p-4 rounded-xl bg-rose-50 text-rose-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm dark:bg-rose-950/40 dark:text-rose-300 dark:border-emerald-800/60">
 <div className="flex items-center gap-3">
 <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
 <span className="text-sm font-medium">{errorMsg}</span>
 </div>
 <button onClick={() => setErrorMsg('')} className="text-rose-600 hover:text-rose-800">
 <X className="w-4 h-4" />
 </button>
 </div>
 )}

 {/* KPI Stats Cards Grid */}
 <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <KpiTintedCard
 icon={Activity}
 label="Total Aktivitas"
 value={computedStats.total}
 subtext="Kegiatan Terdaftar"
 tone="emerald"
 onClick={() => handleOpenKpiModal('total')}
 />
 <KpiTintedCard
 icon={Clock}
 label="Pendahuluan"
 value={computedStats.pendahuluan}
 subtext="Orientasi & Apersepsi"
 tone="blue"
 onClick={() => handleOpenKpiModal('pendahuluan')}
 />
 <KpiTintedCard
 icon={Layers}
 label="Kegiatan Inti"
 value={computedStats.inti}
 subtext="Eksplorasi & Praktik"
 tone="emerald"
 onClick={() => handleOpenKpiModal('inti')}
 />
 <KpiTintedCard
 icon={Tag}
 label="Penutup & Refleksi"
 value={computedStats.penutup}
 subtext="Evaluasi & Kesimpulan"
 tone="purple"
 onClick={() => handleOpenKpiModal('penutup')}
 />
 </motion.div>

 {/* Tab Navigation Card (below KPI grid) */}
 {tabNav && (
 <motion.div variants={itemVariants}>
 {typeof tabNav === 'function' ? tabNav() : tabNav}
 </motion.div>
 )}

      {/* DATA TABLE CONTAINER (Integrated Canonical AppDataTable) */}
      <motion.div variants={itemVariants}>
        <AppDataTable
          id="tabel-aktivitas-belajar"
          title="Data Aktivitas Belajar"
          subtitle="Daftar alur skenario kegiatan kelas terpadu per modul ajar."
          icon={Activity}
          countLabel="data"
          actions={pageActions}
          search={search}
          onSearchChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          searchPlaceholder="Cari nama aktivitas, instruksi, atau modul..."
          filters={
            <div className="flex flex-wrap items-center gap-2.5 w-full">
              <HeroUiFilterSelect
                value={selectedModulAjar}
                onChange={(val) => {
                  setSelectedModulAjar(val)
                  setPage(1)
                }}
                options={filterModulAjarOptions}
                placeholder="Semua Modul Ajar"
                icon={BookOpen}
                searchable={true}
                popoverWidth="min-w-[240px]"
              />

              <HeroUiFilterSelect
                value={selectedJenis}
                onChange={(val) => {
                  setSelectedJenis(val)
                  setPage(1)
                }}
                options={filterJenisOptions}
                placeholder="Semua Jenis"
                icon={Layers}
                popoverWidth="min-w-[180px]"
              />

              <HeroUiFilterSelect
                value={selectedStatus}
                onChange={(val) => {
                  setSelectedStatus(val)
                  setPage(1)
                }}
                options={filterStatusOptions}
                placeholder="Semua Status"
                popoverWidth="min-w-[160px]"
              />

              {(search || selectedModulAjar || selectedJenis || selectedStatus) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setSelectedModulAjar('')
                    setSelectedJenis('')
                    setSelectedStatus('')
                    setPage(1)
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-white dark:bg-slate-900 px-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors ml-auto cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>
          }
          columns={aktivitasColumns}
          data={dataAktivitas}
          isLoading={loading}
          page={pagination.current_page}
          totalPages={pagination.last_page}
          onPageChange={setPage}
          onView={(item) => handleOpenDetail(item)}
          onEdit={(item) => handleOpenEditModal(item)}
          onDelete={(item) => handleDelete(item.id, item.nama_aktivitas)}
          renderMobileCard={(item) => (
            <MobileDataCard
              key={item.id}
              title={item.nama_aktivitas}
              subtitle={item.modul_ajar?.judul_modul || 'Modul Ajar'}
              badge={item.jenis_aktivitas}
              badgeVariant="neutral"
              fields={[
                { label: 'Urutan', value: `#${item.urutan || 1}`, icon: Layers },
                { label: 'Durasi', value: `${item.waktu || item.durasi_menit || 0} Menit`, icon: Clock },
                { label: 'Status', value: item.status === 'aktif' ? 'Aktif' : 'Draft', icon: Check },
              ]}
              onView={() => handleOpenDetail(item)}
              onEdit={() => handleOpenEditModal(item)}
              onDelete={() => handleDelete(item.id, item.nama_aktivitas)}
            />
          )}
        />
      </motion.div>

 {/* KPI DETAIL MODAL */}
 <AppModal
 isOpen={kpiModalOpen}
 onClose={() => setKpiModalOpen(false)}
 title={kpiModalCategory.title}
 description={`Menampilkan ${kpiModalCategory.items.length} aktivitas terdaftar`}
 icon={Activity}
 maxWidth="max-w-4xl"
 zIndex={50}
 footer={
 <button
 type="button"
 onClick={() => setKpiModalOpen(false)}
 className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-slate-200 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
 >
 Tutup
 </button>
 }
 >
 {kpiModalCategory.items.length === 0 ? (
 <div className="py-12 text-center text-slate-400">
 <Activity className="w-12 h-9 mx-auto mb-3 opacity-30" />
 <p className="font-semibold text-sm">Tidak ada data aktivitas dalam kategori ini.</p>
 </div>
 ) : (
 <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
 <TableRoot className="w-full text-left border-collapse">
 <TableHeader>
 <TableRow className="bg-slate-50 dark:bg-slate-800/50 border-b border-emerald-200/80 dark:border-emerald-800/60 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
 
 <TableHead className="py-3 px-4">Nama Aktivitas</TableHead>
 <TableHead className="py-3 px-4">Jenis</TableHead>
 <TableHead className="py-3 px-4">Modul Ajar</TableHead>
 <TableHead className="py-3 px-4 text-center">Waktu</TableHead>
 <TableHead className="py-3 px-4 text-right"></TableHead>
 </TableRow>
 </TableHeader>
 <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-sm">
 {kpiModalCategory.items.map((item, idx) => (
 <TableRow key={item.id || idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30">
 
 <TableCell className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">{item.nama_aktivitas}</TableCell>
 <TableCell className="py-3 px-4">
 <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${getJenisBadgeColor(item.jenis_aktivitas)}`}>
 {item.jenis_aktivitas}
 </span>
 </TableCell>
 <TableCell className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
 {item.modul_ajar?.judul_modul || '-'}
 </TableCell>
 <TableCell className="py-3 px-4 text-center text-xs font-semibold text-slate-700 dark:text-slate-200">
 {item.waktu} mnt
 </TableCell>
 <TableCell className="py-3 px-4 text-right">
 <button
 onClick={() => {
 setKpiModalOpen(false)
 handleOpenDetail(item)
 }}
 className="px-3 py-1.5 rounded-lg bg-emerald-50 text-[#059669] dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold text-xs hover:bg-emerald-100 transition-colors"
 >
 Detail
 </button>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </TableRoot>
 </div>
 )}
 </AppModal>

 {/* Modal Form Tambah / Edit */}
 <AppModal
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 title={editId ? 'Edit Aktivitas Belajar' : 'Tambah Aktivitas Belajar'}
 description="Isi kelengkapan data alur skenario pembelajaran"
 icon={Activity}
 maxWidth="max-w-xl"
 zIndex={50}
 footer={
 <>
 <button
 type="button"
 onClick={() => setIsModalOpen(false)}
 className="px-4 py-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition-colors"
 >
 Batal
 </button>
 <button
 type="submit"
 form="lms-aktivitas-belajar-form"
 disabled={formLoading}
 className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#059669] text-white font-semibold text-sm shadow-md hover:bg-[#1E8E5A] disabled:opacity-50 transition-all duration-200"
 >
 {formLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : editId ? 'Simpan Perubahan' : 'Tambah Aktivitas'}
 </button>
 </>
 }
 >
 <form id="lms-aktivitas-belajar-form" onSubmit={handleSubmit} className="space-y-4">
 {/* Modul Ajar Dropdown */}
 <div>
 <HeroUiModalSelect
 label="Modul Ajar"
 required
 icon={BookOpen}
 searchable={true}
 placeholder="-- Pilih Modul Ajar --"
 value={formData.modul_ajar_id}
 onChange={(val) => setFormData({ ...formData, modul_ajar_id: val })}
 options={modalModulAjarOptions}
 />
 </div>

 {/* Nama Aktivitas */}
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
 Nama Aktivitas Belajar <span className="text-rose-500">*</span>
 </label>
 <input
 type="text"
 required
 placeholder="Contoh: Eksplorasi Konsep & Studi Kasus Kelompok"
 value={formData.nama_aktivitas}
 onChange={(e) => setFormData({ ...formData, nama_aktivitas: e.target.value })}
 className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-[#111827] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
 />
 </div>

 {/* Jenis Aktivitas & Status Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <HeroUiModalSelect
 label="Jenis Kegiatan"
 required
 icon={Layers}
 placeholder="-- Pilih Jenis Kegiatan --"
 value={formData.jenis_aktivitas}
 onChange={(val) => setFormData({ ...formData, jenis_aktivitas: val })}
 options={modalJenisOptions}
 />
 </div>

 <div>
 <HeroUiModalSelect
 label="Status Aktivitas"
 required
 placeholder="-- Pilih Status --"
 value={formData.status}
 onChange={(val) => setFormData({ ...formData, status: val })}
 options={modalStatusOptions}
 />
 </div>
 </div>

 {/* Waktu & Urutan Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
 Alokasi Waktu (Menit) <span className="text-rose-500">*</span>
 </label>
 <div className="relative">
 <input
 type="number"
 min="1"
 max="600"
 required
 value={formData.waktu}
 onChange={(e) => setFormData({ ...formData, waktu: parseInt(e.target.value) || 1 })}
 className="w-full pl-3.5 pr-12 py-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-[#111827] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
 />
 <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">menit</span>
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
 Nomor Urut <span className="text-rose-500">*</span>
 </label>
 <input
 type="number"
 min="1"
 required
 value={formData.urutan}
 onChange={(e) => setFormData({ ...formData, urutan: parseInt(e.target.value) || 1 })}
 className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-[#111827] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
 />
 </div>
 </div>

 {/* Instruksi Textarea */}
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
 Instruksi / Langkah Kegiatan
 </label>
 <textarea
 rows="4"
 placeholder="Tuliskan petunjuk teknis atau instruksi detail bagi guru/siswa dalam aktivitas ini..."
 value={formData.instruksi}
 onChange={(e) => setFormData({ ...formData, instruksi: e.target.value })}
 className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-[#111827] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
 ></textarea>
 </div>
 </form>
 </AppModal>

 {/* Modal Detail View */}
 <AppModal
 isOpen={Boolean(isDetailOpen && selectedDetail)}
 onClose={() => setIsDetailOpen(false)}
 title="Detail Aktivitas Belajar"
 icon={Activity}
 maxWidth="max-w-lg"
 zIndex={50}
 footer={
 <button
 type="button"
 onClick={() => setIsDetailOpen(false)}
 className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-700"
 >
 Tutup
 </button>
 }
 >
 {selectedDetail && (
 <div className="space-y-4">
 <div>
 <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getJenisBadgeColor(selectedDetail.jenis_aktivitas)}`}>
 {selectedDetail.jenis_aktivitas}
 </span>
 <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-2">{selectedDetail.nama_aktivitas}</h4>
 </div>

 <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#111827] text-xs">
 <div>
 <span className="text-slate-400 block">Modul Ajar:</span>
 <span className="font-semibold text-slate-800 dark:text-slate-200">
 {selectedDetail.modul_ajar?.judul_modul || '-'}
 </span>
 </div>
 <div>
 <span className="text-slate-400 block">Alokasi Waktu:</span>
 <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedDetail.waktu} menit</span>
 </div>
 <div>
 <span className="text-slate-400 block">Nomor Urutan:</span>
 <span className="font-semibold text-slate-800 dark:text-slate-200">Urutan ke-{selectedDetail.urutan}</span>
 </div>
 <div>
 <span className="text-slate-400 block">Status:</span>
 <span className="font-semibold capitalize text-emerald-600 dark:text-emerald-400">{selectedDetail.status}</span>
 </div>
 </div>

 <div>
 <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Instruksi Kegiatan:</h5>
 <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#111827] border border-emerald-200/80 dark:border-emerald-800/60 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
 {selectedDetail.instruksi || 'Tidak ada instruksi khusus.'}
 </div>
 </div>
 </div>
 )}
 </AppModal>
 </motion.div>
 </div>
 </PageContainer>
 )
}
