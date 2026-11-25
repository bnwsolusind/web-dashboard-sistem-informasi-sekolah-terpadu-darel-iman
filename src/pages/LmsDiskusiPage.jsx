import { HeroUiHeader } from "../components/ui/HeroUiHeader"
import {
  KpiStatCard
} from '../components/app'
import {
  useToast
} from '../components/app/ToastProvider'
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
  MessageSquare,
  BookOpen,
  Plus,
  Search,
  Edit3,
  Trash2,
  RefreshCw,
  X,
  Pin,
  Lock,
  Unlock,
  Send,
  GraduationCap,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Tag,
  Clock,
  RotateCcw,
  Printer,
  Eye,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  Layers,
  FileSpreadsheet,
  CornerDownRight,
  User,
  ShieldCheck,
  FileText,
  ChevronDown,
  Check,
  School
} from 'lucide-react'
import {
  useAuthStore
} from '../stores/authStore'
import {
  lmsDiskusiService
} from '../services/lmsDiskusiService'
import {
  lmsModulAjarService
} from '../services/lmsModulAjarService'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import {
  printCleanTable,
  downloadPdfTable
} from '../utils/printHelper'
import AppDataTable from '../components/app/AppDataTable'
import MobileDataCard from '../components/app/MobileDataCard'
import {
  PrintOptionModal,
  SquircleActionButton
} from '../components/master-data'
import {
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '../components/ui/table'
import ActionDropdown from '../components/app/ActionDropdown'
import AppModal from '../components/app/AppModal'
import AppDrawer from '../components/app/AppDrawer'
import {
  useDebounce
} from '../hooks/useDebounce'
import {
  downloadSpreadsheetTemplate
} from '../utils/spreadsheetParser'

// ── 1. PALET WARNA RESMI MODERN KPI CARDS ──
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

// ── 3. HARMONIZED BATCH IMPORT MODAL ──
function HarmonizedBatchImportModal({ isOpen, onClose, onImportSuccess, notify }) {
 const [dragActive, setDragActive] = useState(false)
 const [selectedFile, setSelectedFile] = useState(null)
 const [previewRows, setPreviewRows] = useState([])
 const [isSubmitting, setIsSubmitting] = useState(false)
 const fileInputRef = useRef(null)

 if (!isOpen) return null

 const handleDrag = (e) => {
 e.preventDefault()
 e.stopPropagation()
 if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
 else if (e.type === 'dragleave') setDragActive(false)
 }

 const handleDrop = (e) => {
 e.preventDefault()
 e.stopPropagation()
 setDragActive(false)
 if (e.dataTransfer.files && e.dataTransfer.files[0]) {
 handleProcessFile(e.dataTransfer.files[0])
 }
 }

 const handleProcessFile = (file) => {
 if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
 notify('Format Berkas Tidak Valid', 'Unggah berkas berformat .csv atau .xlsx', 'error')
 return
 }
 setSelectedFile(file)
 const reader = new FileReader()
 reader.onload = (e) => {
 const text = e.target.result
 const lines = text.split('\n').filter((l) => l.trim().length > 0)
 if (lines.length > 1) {
 const rows = lines.slice(1, 6).map((line, idx) => {
 const parts = line.split(',')
 return {
 id: idx + 1,
 judul: (parts[0] || '').replace(/["\r]/g, '').trim(),
 kategori: (parts[1] || 'Umum').replace(/["\r]/g, '').trim(),
 deskripsi: (parts[2] || '').replace(/["\r]/g, '').trim(),
 status: (parts[3] || 'aktif').replace(/["\r]/g, '').trim(),
 }
 })
 setPreviewRows(rows)
 } else {
 setPreviewRows([])
 }
 }
 reader.readAsText(file)
 }

 const handleDownloadTemplate = () => {
 const headers = ['JUDUL_DISKUSI', 'KATEGORI', 'DESKRIPSI', 'STATUS']
 const sampleRows = [
 ['"Diskusi Pemahaman Hukum Fiqih Thaharah"', '"Tanya Jawab"', '"Diskusikan syarat dan rukun thaharah bersama teman sekelas."', '"aktif"'],
 ['"Tanya Jawab Projek P5 Gaya Hidup Berkelanjutan"', '"Proyek"', '"Pertanyaan seputar pengelolaan limbah organik sekolah."', '"aktif"'],
 ]
 const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...sampleRows.map((e) => e.join(','))].join('\n')
 const encodedUri = encodeURI(csvContent)
 const link = document.createElement('a')
 link.setAttribute('href', encodedUri)
 link.setAttribute('download', 'template_import_forum_diskusi.csv')
 document.body.appendChild(link)
 link.click()
 document.body.removeChild(link)
 notify('Unduh Template', 'Template berkas CSV berhasil diunduh.', 'success')
 }

 const handleSubmit = async () => {
 if (!selectedFile) {
 notify('Pilih Berkas', 'Harap pilih berkas CSV atau XLSX terlebih dahulu.', 'warning')
 return
 }
 setIsSubmitting(true)
 try {
 const formData = new FormData()
 formData.append('file', selectedFile)
 const res = await lmsDiskusiService.import(formData)
 notify('Impor Berhasil', res?.message || `Berkas ${selectedFile.name} berhasil diimpor ke sistem.`, 'success')
 onImportSuccess?.()
 onClose()
 } catch (err) {
 notify('Impor Gagal', err?.response?.data?.message || err?.message || 'Terjadi kendala saat memproses berkas impor.', 'error')
 } finally {
 setIsSubmitting(false)
 }
 }

 return (
 <AppModal
 isOpen={isOpen}
 onClose={onClose}
 title="Impor Data Forum Diskusi"
 description="Unggah berkas CSV atau XLSX berisi topik diskusi kelas."
 icon={Upload}
 maxWidth="max-w-2xl"
 zIndex={60}
 disableBackdropClose={isSubmitting}
 bodyClassName="space-y-5"
 footer={
 <>
 <button
 type="button"
 onClick={onClose}
 disabled={isSubmitting}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition-all"
 >
 Batal
 </button>
 <button
 type="button"
 onClick={handleSubmit}
 disabled={isSubmitting || !selectedFile}
 className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-bold shadow-md disabled:opacity-50 transition-all"
 >
 {isSubmitting && <RefreshCw className="h-4 w-4 animate-spin" />}
 <span>{isSubmitting ? 'Memproses Berkas...' : 'Proses Impor Topik'}</span>
 </button>
 </>
 }
 >
 {/* Download Template Card */}
 <div className="flex items-center justify-between rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 p-4 dark:bg-emerald-950/20">
 <div className="flex items-center gap-3">
 <FileSpreadsheet className="h-8 w-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
 <div>
 <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200">Template Berkas Data Diskusi</p>
 <p className="text-xs text-emerald-800/80 dark:text-emerald-400/80">Gunakan format tabel resmi agar sistem memetakan kolom secara otomatis.</p>
 </div>
 </div>
 <button
 type="button"
 onClick={handleDownloadTemplate}
 className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3.5 py-2 text-xs font-bold text-emerald-700 shadow-xs dark:bg-emerald-600 dark:text-emerald-300 transition-all text-sm font-medium"
 >
 <Download className="h-3.5 w-3.5" /> Unduh Format
 </button>
 </div>

 {/* Dropzone */}
 <div
 onDragEnter={handleDrag}
 onDragLeave={handleDrag}
 onDragOver={handleDrag}
 onDrop={handleDrop}
 onClick={() => fileInputRef.current?.click()}
 className={`cursor-pointer rounded-xl border-2 border-dashed p-7 text-center transition-all ${
 dragActive
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/30'
 : 'border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 hover:bg-emerald-50/30 dark:bg-slate-900/40'
 }`}
 >
 <input
 ref={fileInputRef}
 type="file"
 accept=".csv,.xlsx,.xls"
 onChange={(e) => e.target.files?.[0] && handleProcessFile(e.target.files[0])}
 className="hidden"
 />
 <div className="mx-auto flex h-9 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 mb-3">
 <Upload className="h-6 w-6" />
 </div>
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
 {selectedFile ? selectedFile.name : 'Tarik & lepas berkas ke sini, atau klik untuk memilih'}
 </p>
 <p className="text-xs text-slate-400 mt-1">Mendukung file .CSV, .XLSX (Maks. 5MB)</p>
 </div>

 {/* Mini Preview Datatable */}
 {previewRows.length > 0 && (
 <div className="space-y-2">
 <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
 Pratinjau Data (5 Baris Pertama)
 </p>
 <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/80">
 <TableRoot className="w-full text-left text-xs">
 <TableHeader className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold border-b border-emerald-200/80 dark:border-emerald-800/80">
 <TableRow>
 <TableHead className="py-2 px-3">No</TableHead>
 <TableHead className="py-2 px-3">Judul Topik</TableHead>
 <TableHead className="py-2 px-3">Kategori</TableHead>
 <TableHead className="py-2 px-3">Status</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody className="divide-y divide-emerald-100/70 dark:divide-emerald-900/40">
 {previewRows.map((r, i) => (
 <TableRow key={i} className="hover:bg-emerald-50/30">
 <TableCell className="py-2 px-3 font-semibold text-emerald-600">{i + 1}</TableCell>
 <TableCell className="py-2 px-3 font-bold text-slate-800 dark:text-slate-100 truncate max-w-[200px]">{r.judul || '-'}</TableCell>
 <TableCell className="py-2 px-3 text-slate-600 dark:text-slate-300">{r.kategori}</TableCell>
 <TableCell className="py-2 px-3 font-semibold text-emerald-700 dark:text-emerald-400">{r.status}</TableCell>
 </TableRow>
 ))}
 </TableBody>
 </TableRoot>
 </div>
 </div>
 )}
 </AppModal>
 )
}

// ── 4. HARMONIZED SAVE CONFIRMATION MODAL ──
function HarmonizedSaveModal({ isOpen, onClose, onConfirm, isEdit, title, isSubmitting }) {
 return (
 <AppModal
 isOpen={isOpen}
 onClose={onClose}
 title="Konfirmasi Penyimpanan"
 badge={isEdit ? 'Perbarui Diskusi' : 'Diskusi Baru'}
 icon={isEdit ? Edit3 : MessageSquare}
 variant={isEdit ? 'warning' : 'emerald'}
 maxWidth="max-w-md"
 zIndex={70}
 disableBackdropClose={isSubmitting}
 footer={
 <>
 <button
 type="button"
 onClick={onClose}
 disabled={isSubmitting}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition-all"
 >
 Batal
 </button>
 <button
 type="button"
 onClick={onConfirm}
 disabled={isSubmitting}
 className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-md transition-all ${
 isEdit
 ? 'bg-amber-600 hover:bg-amber-700'
 : 'bg-emerald-600 hover:bg-emerald-700'
 } disabled:opacity-50`}
 >
 {isSubmitting && <RefreshCw className="h-4 w-4 animate-spin" />}
 <span>{isSubmitting ? 'Menyimpan...' : 'Ya, Konfirmasi & Simpan'}</span>
 </button>
 </>
 }
 >
 <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
 Apakah Anda yakin ingin {isEdit ? 'memperbarui informasi' : 'mempublikasikan'} topik diskusi:
 </p>

 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 p-3.5 dark:bg-emerald-950/20">
 <p className="text-xs font-black text-emerald-950 dark:text-emerald-100 line-clamp-2">{title || 'Topik Forum Diskusi'}</p>
 </div>
 </AppModal>
 )
}

// ── 5. HARMONIZED BATCH EXPORT MODAL ──
function HarmonizedBatchExportModal({
 isOpen,
 onClose,
 onExport,
 isExporting,
 totalCount,
 moduleTitle = 'Forum Diskusi',
}) {
 const [exportFormat, setExportFormat] = useState('xlsx')

 return (
 <AppModal
 isOpen={isOpen}
 onClose={onClose}
 title={`Export Data ${moduleTitle}`}
 badge="Unduh Data"
 description="Pilih format berkas untuk mengekspor data sesuai filter aktif."
 icon={Download}
 maxWidth="max-w-lg"
 zIndex={50}
 disableBackdropClose={isExporting}
 footer={
 <>
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
 className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-extrabold shadow-sm hover:shadow-lg transition-all duration-200 disabled:opacity-50 cursor-pointer"
 >
 <Download className="size-4" />
 {isExporting ? 'Menyiapkan...' : 'Unduh Berkas'}
 </button>
 </>
 }
 >
 <div className="space-y-4">
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
 Data yang diekspor akan mencakup seluruh entitas terfilter ({totalCount} topik {moduleTitle.toLowerCase()}).
 </p>
 </div>
 </div>
 </AppModal>
 )
}

// ── 6. HARMONIZED DELETE CONFIRMATION MODAL ──
function HarmonizedDeleteModal({ isOpen, onClose, onConfirm, title, isSubmitting }) {
 return (
 <AppModal
 isOpen={isOpen}
 onClose={onClose}
 title="Konfirmasi Hapus Diskusi"
 badge="Hapus Permanen"
 icon={Trash2}
 variant="danger"
 maxWidth="max-w-md"
 zIndex={70}
 disableBackdropClose={isSubmitting}
 footer={
 <>
 <button
 type="button"
 onClick={onClose}
 disabled={isSubmitting}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition-all"
 >
 Batal
 </button>
 <button
 type="button"
 onClick={onConfirm}
 disabled={isSubmitting}
 className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 text-xs font-bold shadow-sm hover:brightness-105 disabled:opacity-50 transition-all"
 >
 {isSubmitting && <RefreshCw className="h-4 w-4 animate-spin" />}
 <span>{isSubmitting ? 'Menghapus...' : 'Ya, Hapus Diskusi'}</span>
 </button>
 </>
 }
 >
 <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
 Apakah Anda yakin ingin menghapus topik diskusi berikut beserta seluruh komentar yang ada di dalamnya? Tindakan ini tidak dapat dibatalkan.
 </p>

 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/50 p-3.5 dark:bg-rose-950/20">
 <p className="text-xs font-black text-rose-950 dark:text-rose-100 line-clamp-2">{title || 'Topik Forum Diskusi'}</p>
 </div>
 </AppModal>
 )
}

// ── 6. KOMPONEN UTAMA HALAMAN ──
export default function LmsDiskusiPage({ embedded = false, hideBreadcrumb = false, hidePageHeader = false, tabNav = null }) {
 const { items: toastItems, push: notify, dismiss: dismissToast } = useNotifications()

 const [dataDiskusi, setDataDiskusi] = useState([])
 const [optionsModulAjar, setOptionsModulAjar] = useState([])
 const [optionsKategori, setOptionsKategori] = useState([
 'Umum',
 'Tanya Jawab',
 'Tugas',
 'Materi',
 'Proyek',
 'Refleksi',
 ])
 const [stats, setStats] = useState({
 total_diskusi: 0,
 diskusi_aktif: 0,
 diskusi_ditutup: 0,
 diskusi_pinned: 0,
 total_komentar: 0,
 })

 const [loading, setLoading] = useState(true)

 // User Auth & Multi-unit Scoping
 const user = useAuthStore((state) => state.user)
 const isSuperAdminOrYayasan = useMemo(() => {
 const roles = (user?.roles || []).map((r) => (typeof r === 'string' ? r : r.name || ''))
 return roles.some((r) => ['super_admin', 'Super Admin', 'super-admin', 'yayasan', 'Yayasan', 'pengurus_yayasan', 'ketua_yayasan'].includes(r))
 }, [user])
 const isDivisiPendidikan = useMemo(() => {
 const roles = (user?.roles || []).map((r) => (typeof r === 'string' ? r : r.name || ''))
 return roles.some((r) => ['Divisi Pendidikan', 'divisi_pendidikan', 'divisi-pendidikan', 'Kepala Bidang Pendidikan', 'kepala_bidang_pendidikan', 'Divisi Kurikulum', 'Divisi Kesiswaan'].includes(r))
 }, [user])
 const canSelectUnit = isSuperAdminOrYayasan || isDivisiPendidikan
 const userUnitId = user?.unit_id || user?.employee?.unit_id || user?.unit_pendidikan_id || ''
 const userUnitName = user?.unit_name || user?.employee?.unit?.nama_unit || user?.employee?.unit?.name || 'Unit Anda'

 // Filters & Pagination
 const [selectedUnit, setSelectedUnit] = useState(canSelectUnit ? '' : (userUnitId ? String(userUnitId) : ''))
 const [optionsUnits, setOptionsUnits] = useState([])
 const [searchInput, setSearchInput] = useState('')
 const debouncedSearch = useDebounce(searchInput, 350)
 const [selectedModulAjar, setSelectedModulAjar] = useState('')
 const [selectedKategori, setSelectedKategori] = useState('')
 const [selectedStatus, setSelectedStatus] = useState('')
 const [page, setPage] = useState(1)
 const [perPage, setPerPage] = useState(10)
 const [pagination, setPagination] = useState({
 current_page: 1,
 last_page: 1,
 total: 0,
 per_page: 10,
 })

 // Options for HeroUI Selects
 const filterModulAjarOptions = useMemo(() => [
 { value: '', label: 'Semua Modul Ajar' },
 ...optionsModulAjar.map((opt) => ({
 value: String(opt.value || opt.id),
 label: opt.label || opt.judul_modul || opt.judul,
 })),
 ], [optionsModulAjar])

 const filterKategoriOptions = useMemo(() => [
 { value: '', label: 'Semua Kategori' },
 ...optionsKategori.map((kat) => ({
 value: kat,
 label: kat,
 })),
 ], [optionsKategori])

 const filterStatusOptions = useMemo(() => [
 { value: '', label: 'Semua Status' },
 { value: 'aktif', label: 'Aktif' },
 { value: 'draft', label: 'Draft' },
 { value: 'ditutup', label: 'Ditutup' },
 ], [])

 const modalModulAjarOptions = useMemo(() => [
 { value: '', label: '-- Tanpa Modul (Diskusi Umum) --' },
 ...optionsModulAjar.map((opt) => ({
 value: String(opt.value || opt.id),
 label: opt.label || opt.judul_modul || opt.judul,
 })),
 ], [optionsModulAjar])

 const modalKategoriOptions = useMemo(() => [
 ...optionsKategori.map((kat) => ({
 value: kat,
 label: kat,
 })),
 ], [optionsKategori])

 const modalStatusOptions = useMemo(() => [
 { value: 'aktif', label: 'Aktif (Terbuka untuk Komentar)' },
 { value: 'draft', label: 'Draft (Disimpan Sementara)' },
 { value: 'ditutup', label: 'Ditutup (Hanya Baca)' },
 ], [])

 const perPageOptions = useMemo(() => [
 { value: '10', label: '10 Baris' },
 { value: '25', label: '25 Baris' },
 { value: '50', label: '50 Baris' },
 ], [])

 const peranPengirimOptions = useMemo(() => [
 { value: 'Guru', label: 'Guru (Pengajar)' },
 { value: 'Siswa', label: 'Siswa (Peserta)' },
 { value: 'Admin', label: 'Admin' },
 ], [])

 // Modal Form State (Create / Edit Diskusi)
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
 const [importOpen, setImportOpen] = useState(false)
 const [editId, setEditId] = useState(null)
 const [formSubmitting, setFormSubmitting] = useState(false)
 const [isExportModalOpen, setIsExportModalOpen] = useState(false)
 const [isExporting, setIsExporting] = useState(false)

 // Save and Delete Confirmation Modals
 const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
 const [deleteModalState, setDeleteModalState] = useState({
 isOpen: false,
 id: null,
 title: '',
 isSubmitting: false,
 })

 // KPI Modal State
 const [kpiModalOpen, setKpiModalOpen] = useState(false)
 const [kpiModalCategory, setKpiModalCategory] = useState({
 title: '',
 items: [],
 })

 // Thread Drawer State
 const [isThreadOpen, setIsThreadOpen] = useState(false)
 const [selectedDiskusi, setSelectedDiskusi] = useState(null)
 const [threadLoading, setThreadLoading] = useState(false)
 const [replyParentId, setReplyParentId] = useState(null)
 const [komentarForm, setKomentarForm] = useState({
 konten: '',
 peran_pengirim: 'Guru',
 })
 const [submittingKomentar, setSubmittingKomentar] = useState(false)

 const [formData, setFormData] = useState({
 modul_ajar_id: '',
 judul: '',
 deskripsi: '',
 kategori: 'Umum',
 tanggal_mulai: '',
 tanggal_tutup: '',
 status: 'aktif',
 })

 useEffect(() => {
 fetchOptions()
 }, [selectedUnit])

 useEffect(() => {
 fetchData()
 fetchStats()
 }, [page, perPage, debouncedSearch, selectedUnit, selectedModulAjar, selectedKategori, selectedStatus])

 const fetchStats = async () => {
 try {
 const res = await lmsDiskusiService.getStats()
 if (res.success) {
 setStats(res.data)
 }
 } catch (err) {
 console.error('Gagal mengambil statistik diskusi:', err)
 }
 }

 const computedStats = useMemo(() => {
 const total_diskusi = dataDiskusi.length
 const diskusi_aktif = dataDiskusi.filter((d) => d.status === 'aktif').length
 const diskusi_pinned = dataDiskusi.filter((d) => d.is_pinned).length
 const diskusi_ditutup = dataDiskusi.filter((d) => d.status === 'ditutup' || d.is_closed).length
 const total_komentar = dataDiskusi.reduce((acc, d) => acc + (d.komentar_count || d.komentars_count || (d.komentar ? d.komentar.length : 0)), 0)

 return {
 total_diskusi: stats.total_diskusi || total_diskusi,
 diskusi_aktif: stats.diskusi_aktif || diskusi_aktif,
 diskusi_pinned: stats.diskusi_pinned || diskusi_pinned,
 diskusi_ditutup: stats.diskusi_ditutup || diskusi_ditutup,
 total_komentar: stats.total_komentar || total_komentar,
 }
 }, [dataDiskusi, stats])

 const handleOpenKpiModal = (type) => {
 let title = ''
 let items = []

 if (type === 'total') {
 title = 'Total Topik Forum Diskusi Kelas'
 items = dataDiskusi
 } else if (type === 'aktif') {
 title = 'Daftar Diskusi Berstatus Aktif'
 items = dataDiskusi.filter((d) => d.status === 'aktif')
 } else if (type === 'pinned') {
 title = 'Topik Diskusi Disematkan (Pin)'
 items = dataDiskusi.filter((d) => d.is_pinned)
 } else if (type === 'komentar') {
 title = 'Daftar Diskusi Berinteraksi Tinggi'
 items = dataDiskusi.filter((d) => (d.komentar_count || d.komentar?.length || 0) > 0)
 }

 setKpiModalCategory({ title, items })
 setKpiModalOpen(true)
 }

 const fetchOptions = async () => {
 try {
 const res = await lmsDiskusiService.getOptions(selectedUnit ? { unit_pendidikan_id: selectedUnit } : {})
 if (res?.data?.units) {
 setOptionsUnits(res.data.units)
 }
 let modulList = []

 const rawModul = res?.data?.modul_ajar || res?.data?.modul_ajar_options || res?.modul_ajar
 if (Array.isArray(rawModul) && rawModul.length > 0) {
 modulList = rawModul.map((opt) => ({
 value: opt.value || opt.id,
 id: opt.value || opt.id,
 label: opt.label || (opt.kode_modul ? `[${opt.kode_modul}] ${opt.judul_modul || opt.judul}` : (opt.judul_modul || opt.judul)),
 judul: opt.judul_modul || opt.judul,
 }))
 } else {
 try {
 const maRes = await lmsModulAjarService.getAll({ per_page: 100 })
 const rawList = maRes?.data || maRes || []
 if (Array.isArray(rawList) && rawList.length > 0) {
 modulList = rawList.map((opt) => ({
 value: opt.id,
 id: opt.id,
 label: opt.kode_modul ? `[${opt.kode_modul}] ${opt.judul_modul || opt.judul}` : (opt.judul_modul || opt.judul),
 judul: opt.judul_modul || opt.judul,
 }))
 }
 } catch (maErr) {
 console.error('Fallback fetch modul ajar failed:', maErr)
 }
 }

 setOptionsModulAjar(modulList)
 if (res?.data?.kategori) setOptionsKategori(res.data.kategori)
 } catch (err) {
 console.error('Gagal mengambil opsi data diskusi:', err)
 try {
 const maRes = await lmsModulAjarService.getAll({ per_page: 100 })
 const rawList = maRes?.data || maRes || []
 if (Array.isArray(rawList) && rawList.length > 0) {
 const modulList = rawList.map((opt) => ({
 value: opt.id,
 id: opt.id,
 label: opt.kode_modul ? `[${opt.kode_modul}] ${opt.judul_modul || opt.judul}` : (opt.judul_modul || opt.judul),
 judul: opt.judul_modul || opt.judul,
 }))
 setOptionsModulAjar(modulList)
 }
 } catch (fallbackErr) {
 console.error('Fallback fetch modul ajar failed:', fallbackErr)
 }
 }
 }

 const fetchData = async () => {
 setLoading(true)
 try {
 const params = {
 page,
 per_page: perPage,
 search: debouncedSearch,
 unit_pendidikan_id: canSelectUnit ? (selectedUnit || undefined) : (userUnitId || undefined),
 modul_ajar_id: selectedModulAjar,
 kategori: selectedKategori,
 status: selectedStatus,
 }
 const res = await lmsDiskusiService.getDaftar(params)
 setDataDiskusi(res.data || [])
 if (res.meta) {
 setPagination({
 current_page: res.meta.current_page,
 last_page: res.meta.last_page,
 total: res.meta.total,
 per_page: res.meta.per_page,
 })
 } else {
 setPagination({
 current_page: 1,
 last_page: 1,
 total: res.data?.length || 0,
 per_page: perPage,
 })
 }
 } catch (err) {
 console.error('Error fetching data diskusi:', err)
 notify('Gagal Memuat Data', 'Tidak dapat mengambil daftar topik forum diskusi.', 'error')
 } finally {
 setLoading(false)
 }
 }

 const handleOpenCreateModal = () => {
 setEditId(null)
 setFormData({
 modul_ajar_id: '',
 judul: '',
 deskripsi: '',
 kategori: 'Umum',
 tanggal_mulai: '',
 tanggal_tutup: '',
 status: 'aktif',
 })
 setIsModalOpen(true)
 }

 const handleOpenEditModal = (item) => {
 setEditId(item.id)
 setFormData({
 modul_ajar_id: item.modul_ajar_id || '',
 judul: item.judul_diskusi || item.judul || '',
 deskripsi: item.deskripsi || '',
 kategori: item.kategori || 'Umum',
 tanggal_mulai: item.tanggal_mulai ? item.tanggal_mulai.replace(' ', 'T') : '',
 tanggal_tutup: item.tanggal_tutup ? item.tanggal_tutup.replace(' ', 'T') : '',
 status: item.status || 'aktif',
 })
 setIsModalOpen(true)
 }

 const handleTriggerSave = (e) => {
 e.preventDefault()
 if (!formData.judul.trim()) {
 notify('Judul Diperlukan', 'Harap isi judul topik diskusi sebelum menyimpan.', 'warning')
 return
 }
 setIsSaveModalOpen(true)
 }

 const handleConfirmSave = async () => {
 setFormSubmitting(true)
 try {
 let res
 if (editId) {
 res = await lmsDiskusiService.update(editId, formData)
 } else {
 res = await lmsDiskusiService.create(formData)
 }

 if (res.success) {
 notify('Berhasil Disimpan', res.message || 'Data forum diskusi berhasil diperbarui.', 'success')
 setIsSaveModalOpen(false)
 setIsModalOpen(false)
 fetchData()
 fetchStats()
 } else {
 notify('Gagal Menyimpan', res.message || 'Terjadi kendala saat menyimpan topik diskusi.', 'error')
 }
 } catch (err) {
 const msg = err.response?.data?.message || 'Gagal menyimpan data diskusi.'
 notify('Gagal Menyimpan', msg, 'error')
 } finally {
 setFormSubmitting(false)
 }
 }

 const handleDeletePrompt = (item) => {
 setDeleteModalState({
 isOpen: true,
 id: item.id,
 title: item.judul_diskusi || item.judul,
 isSubmitting: false,
 })
 }

 const handleConfirmDelete = async () => {
 setDeleteModalState((prev) => ({ ...prev, isSubmitting: true }))
 try {
 const res = await lmsDiskusiService.delete(deleteModalState.id)
 if (res.success) {
 notify('Diskusi Dihapus', res.message || 'Topik diskusi berhasil dihapus.', 'success')
 setDeleteModalState({ isOpen: false, id: null, title: '', isSubmitting: false })
 fetchData()
 fetchStats()
 } else {
 notify('Gagal Menghapus', res.message || 'Topik diskusi tidak dapat dihapus.', 'error')
 setDeleteModalState((prev) => ({ ...prev, isSubmitting: false }))
 }
 } catch (err) {
 notify('Gagal Menghapus', err.response?.data?.message || 'Terjadi kesalahan sistem saat menghapus diskusi.', 'error')
 setDeleteModalState((prev) => ({ ...prev, isSubmitting: false }))
 }
 }

 const handleTogglePin = async (id) => {
 try {
 const res = await lmsDiskusiService.togglePin(id)
 if (res.success) {
 notify('Status Sematan', res.message || 'Status sematan topik berhasil diperbarui.', 'success')
 fetchData()
 fetchStats()
 }
 } catch (err) {
 console.error('Error toggling pin:', err)
 notify('Gagal Menyematkan', 'Tidak dapat mengubah status sematan topik.', 'error')
 }
 }

 const handleToggleClose = async (id) => {
 try {
 const res = await lmsDiskusiService.toggleClose(id)
 if (res.success) {
 notify('Status Kunci', res.message || 'Status kunci komentar topik berhasil diperbarui.', 'success')
 fetchData()
 fetchStats()
 if (selectedDiskusi && selectedDiskusi.id === id) {
 fetchThreadDetail(id)
 }
 }
 } catch (err) {
 console.error('Error toggling close:', err)
 notify('Gagal Mengubah Kunci', 'Tidak dapat memperbarui status akses diskusi.', 'error')
 }
 }

 // Comment Thread Drawer Detail
 const handleOpenThread = async (diskusiId) => {
 setIsThreadOpen(true)
 setReplyParentId(null)
 setKomentarForm({ konten: '', peran_pengirim: 'Guru' })
 await fetchThreadDetail(diskusiId)
 }

 const fetchThreadDetail = async (diskusiId) => {
 setThreadLoading(true)
 try {
 const res = await lmsDiskusiService.getById(diskusiId)
 if (res.success) {
 setSelectedDiskusi(res.data)
 }
 } catch (err) {
 console.error('Error fetching thread detail:', err)
 notify('Gagal Mengambil Utasan', 'Tidak dapat memuat detail komentar diskusi.', 'error')
 } finally {
 setThreadLoading(false)
 }
 }

 const handlePostKomentar = async (e) => {
 e.preventDefault()
 if (!komentarForm.konten.trim()) return

 setSubmittingKomentar(true)
 try {
 const payload = {
 konten: komentarForm.konten,
 peran_pengirim: komentarForm.peran_pengirim,
 parent_id: replyParentId,
 }
 const res = await lmsDiskusiService.tambahKomentar(selectedDiskusi.id, payload)
 if (res.success) {
 notify('Komentar Terkirim', 'Tanggapan berhasil dipublikasikan ke forum.', 'success')
 setKomentarForm({ ...komentarForm, konten: '' })
 setReplyParentId(null)
 await fetchThreadDetail(selectedDiskusi.id)
 fetchStats()
 } else {
 notify('Gagal Mengirim', res.message || 'Komentar tidak dapat dikirim.', 'error')
 }
 } catch (err) {
 notify('Gagal Mengirim', err.response?.data?.message || 'Terjadi kendala saat mengirim komentar.', 'error')
 } finally {
 setSubmittingKomentar(false)
 }
 }

 const handleDeleteKomentar = async (komentarId) => {
 try {
 const res = await lmsDiskusiService.hapusKomentar(selectedDiskusi.id, komentarId)
 if (res.success) {
 notify('Komentar Dihapus', 'Tanggapan berhasil dihapus dari utasan.', 'success')
 await fetchThreadDetail(selectedDiskusi.id)
 fetchStats()
 }
 } catch (err) {
 notify('Gagal Menghapus', 'Tidak dapat menghapus komentar.', 'error')
 }
 }

 const handleProcessExport = async (format = 'xlsx') => {
 if (!dataDiskusi?.length) {
 notify('Data Kosong', 'Tidak ada data diskusi untuk diekspor.', 'warning')
 return
 }
 setIsExporting(true)
 try {
 const exportData = (dataDiskusi || []).map((d, i) => ({
 'No': i + 1,
 'Judul Diskusi': (d.judul_diskusi || d.judul || '').trim(),
 'Kategori': d.kategori || 'Umum',
 'Modul Ajar': d.modul_ajar?.judul_modul || d.modul_ajar?.judul || 'Umum',
 'Total Komentar': d.total_komentar || d.komentar_count || 0,
 'Status': d.status === 'tertutup' || d.is_closed ? 'Tertutup' : 'Aktif',
 'Disematkan': d.is_pinned ? 'Ya' : 'Tidak',
 }))

 downloadSpreadsheetTemplate(
 exportData,
 `forum_diskusi_${new Date().toISOString().slice(0, 10)}`,
 format,
 'Forum Diskusi'
 )
 setIsExportModalOpen(false)
 notify('Export Berhasil', `Berkas Forum Diskusi .${format.toUpperCase()} berhasil diunduh.`, 'success')
 } catch (err) {
 notify('Gagal Export', err?.message || 'Terjadi kesalahan saat menyiapkan berkas ekspor.', 'error')
 } finally {
 setIsExporting(false)
 }
 }

  const diskusiColumns = useMemo(
    () => [
      {
        key: 'judul_diskusi',
        label: 'Topik & Modul Ajar',
        sortable: true,
        render: (item) => (
          <div
            className="flex items-start gap-3 cursor-pointer group"
            onClick={() => handleOpenThread(item.id)}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleTogglePin(item.id)
              }}
              className={`mt-0.5 p-1.5 rounded-xl transition-all ${
                item.is_pinned
                  ? 'text-amber-500 bg-amber-50 shadow-xs dark:bg-amber-950/50'
                  : 'text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400'
              }`}
              title={item.is_pinned ? 'Lepas Sematan (Pin)' : 'Sematkan di Atas'}
            >
              <Pin className="h-4 w-4 fill-current" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-extrabold text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {item.judul_diskusi || item.judul}
                </h4>
                {item.is_closed && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                    <Lock className="w-3 h-3" /> Ditutup
                  </span>
                )}
              </div>
              {item.modul_ajar ? (
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5 flex items-center gap-1 truncate">
                  <BookOpen className="w-3 h-3 inline shrink-0" />
                  <span>{item.modul_ajar.judul_modul || item.modul_ajar.judul}</span>
                </p>
              ) : (
                <p className="text-xs text-slate-400 mt-0.5 font-medium">Umum (Tanpa Modul)</p>
              )}
              {item.deskripsi && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 max-w-xl leading-relaxed">
                  {item.deskripsi}
                </p>
              )}
            </div>
          </div>
        ),
      },
      {
        key: 'kategori',
        label: 'Kategori',
        sortable: true,
        headerAlign: 'center',
        align: 'center',
        render: (item) => (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-[#059669] dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs">
            <Tag className="w-3 h-3" /> {item.kategori || 'Umum'}
          </span>
        ),
      },
      {
        key: 'status',
        label: 'Status & Akses',
        sortable: true,
        headerAlign: 'center',
        align: 'center',
        render: (item) => (
          <div className="space-y-1">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                item.status === 'aktif'
                  ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                  : item.status === 'draft'
                  ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {item.status === 'aktif' ? 'Aktif' : item.status === 'draft' ? 'Draft' : 'Ditutup'}
            </span>
            {item.created_at_formatted && (
              <p className="text-xs font-medium text-slate-400 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" /> {item.created_at_formatted}
              </p>
            )}
          </div>
        ),
      },
      {
        key: 'total_komentar',
        label: 'Tanggapan',
        sortable: true,
        headerAlign: 'center',
        align: 'center',
        render: (item) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleOpenThread(item.id)
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100/70 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-200 hover:text-[#059669] dark:hover:text-emerald-300 text-xs font-bold transition-all shadow-2xs"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{item.total_komentar || item.komentar_count || 0} Tanggapan</span>
          </button>
        ),
      },
    ],
    []
  )

  const pageActions = (
    <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
      <SquircleActionButton
        variant="print"
        icon={Printer}
        label="Cetak & PDF"
        onClick={() => setIsPrintModalOpen(true)}
      />
      <SquircleActionButton
        variant="import"
        icon={Upload}
        label="Import Data"
        onClick={() => setImportOpen(true)}
      />
      <SquircleActionButton
        variant="export"
        icon={Download}
        label="Export Data"
        onClick={() => setIsExportModalOpen(true)}
      />
      <SquircleActionButton
        variant="primary"
        icon={Plus}
        label="Buat Diskusi"
        onClick={handleOpenCreateModal}
      />
    </div>
  )

  return (
 <PageContainer maxW="7xl">

 {!(embedded || hideBreadcrumb) && (
 <div className="mb-4">
 <AppBreadcrumb items={[{ label: 'LMS & Akademik', href: '/dashboard' }, { label: 'Forum Diskusi Kelas' }]} />
 </div>
 )}

 <div className="lms-diskusi-page space-y-6 pb-12">
 {/* Modern Hero Header Card */}
        {!hidePageHeader && (
          <div className="mb-6">
            <HeroUiHeader
              title="Forum Diskusi & Kolaborasi Kelas"
              subtitle="Ruang tanya jawab, pemantik diskusi, dan kolaborasi aktif antara guru dan siswa terstruktur per Modul Ajar."
              badge="Kurikulum Merdeka & KBM Interaktif"
              icon={MessageSquare}
            />
          </div>
        )}

 {/* Modern Multi-Tone KPI Summary Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <ModernKpiCard
 icon={MessageSquare}
 label="Total Diskusi"
 value={computedStats.total_diskusi}
 tag={`${computedStats.total_diskusi} Topik`}
 subtext="Terdaftar di forum KBM"
 tone="emerald"
 onClick={() => handleOpenKpiModal('total')}
 />
 <ModernKpiCard
 icon={BookOpen}
 label="Diskusi Aktif"
 value={computedStats.diskusi_aktif}
 tag="Aktif Terbuka"
 subtext="Siap menerima tanggapan"
 tone="blue"
 onClick={() => handleOpenKpiModal('aktif')}
 />
 <ModernKpiCard
 icon={Pin}
 label="Disematkan (Pin)"
 value={computedStats.diskusi_pinned}
 tag="Topik Utama"
 subtext="Diprioritaskan di atas"
 tone="amber"
 onClick={() => handleOpenKpiModal('pinned')}
 />
 <ModernKpiCard
 icon={MessageCircle}
 label="Total Interaksi"
 value={computedStats.total_komentar}
 tag="Interaksi"
 subtext="Komentar guru &amp; siswa"
 tone="purple"
 onClick={() => handleOpenKpiModal('komentar')}
 />
 </div>

 {/* Tab Navigation Card (if provided) */}
 {tabNav && (
 <div>
 {typeof tabNav === 'function' ? tabNav() : tabNav}
 </div>
 )}

 <AppDataTable
          id="tabel-forum-diskusi"
          title="Daftar Topik Forum Diskusi"
          description="Ruang kolaborasi aktif, tanya jawab modul ajar, dan refleksi pembelajaran."
          icon={MessageSquare}
          countLabel={`${pagination.total} Data`}
          actions={pageActions}
          columns={diskusiColumns}
          data={dataDiskusi}
          isLoading={loading}
          search={searchInput}
          onSearchChange={(e) => {
            setSearchInput(e.target.value)
            setPage(1)
          }}
          searchPlaceholder="Cari judul diskusi, deskripsi pemantik, atau kategori..."
          serverControlled={true}
          serverPage={page}
          serverTotalPages={pagination.last_page || 1}
          serverTotal={pagination.total}
          serverPerPage={perPage}
          onServerPageChange={(p) => setPage(p)}
          onServerPerPageChange={(sz) => {
            setPerPage(sz)
            setPage(1)
          }}
          perPageOptions={[10, 20, 50, 100]}
          filters={
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-2.5 w-full">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">
                Filter:
              </span>
              {canSelectUnit ? (
                <HeroUiFilterSelect
                  value={selectedUnit}
                  onChange={(val) => {
                    setSelectedUnit(val)
                    setPage(1)
                  }}
                  options={[
                    { value: '', label: `Semua Unit (${optionsUnits.length || 'SIT'})` },
                    ...optionsUnits.map((u) => ({ value: String(u.id), label: u.name || u.nama_unit })),
                  ]}
                  placeholder={`Semua Unit (${optionsUnits.length || 'SIT'})`}
                  searchable={optionsUnits.length > 5}
                  icon={School}
                  popoverWidth="min-w-[220px]"
                />
              ) : (
                <div
                  title="Terkunci: Menampilkan data khusus unit wewenang Anda"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50 text-xs font-bold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-200"
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
                options={filterModulAjarOptions}
                placeholder="Semua Modul Ajar"
                icon={BookOpen}
                popoverWidth="min-w-[240px]"
                searchable
              />

              <HeroUiFilterSelect
                value={selectedKategori}
                onChange={(val) => {
                  setSelectedKategori(val)
                  setPage(1)
                }}
                options={filterKategoriOptions}
                placeholder="Semua Kategori"
                icon={Tag}
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

              <button
                type="button"
                onClick={() => {
                  if (canSelectUnit) setSelectedUnit('')
                  setSearchInput('')
                  setSelectedModulAjar('')
                  setSelectedKategori('')
                  setSelectedStatus('')
                  setPage(1)
                }}
                className="w-full sm:w-auto sm:ml-auto inline-flex items-center justify-center gap-1.5 h-9.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                title="Reset Semua Filter"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            </div>
          }
          hasActionColumn={true}
          onView={(row) => handleOpenThread(row.id)}
          onEdit={(row) => handleOpenEditModal(row)}
          onDelete={(row) => handleDeletePrompt(row)}
          extraItems={(row) => [
            {
              label: row.is_pinned ? 'Lepas Sematan' : 'Sematkan di Atas',
              icon: <Pin className="h-4 w-4" />,
              onClick: () => handleTogglePin(row.id),
            },
            {
              label: row.is_closed ? 'Buka Kunci Diskusi' : 'Kunci Diskusi',
              icon: row.is_closed ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />,
              onClick: () => handleToggleClose(row.id),
            },
          ]}
          renderMobileCard={(row) => (
            <MobileDataCard
              key={row.id}
              title={row.judul_diskusi || row.judul}
              subtitle={row.modul_ajar ? (row.modul_ajar.judul_modul || row.modul_ajar.judul) : 'Umum (Tanpa Modul)'}
              badge={row.status === 'aktif' ? 'Aktif' : row.status === 'draft' ? 'Draft' : 'Ditutup'}
              badgeColor={row.status === 'aktif' ? 'success' : row.status === 'draft' ? 'warning' : 'slate'}
              onClick={() => handleOpenThread(row.id)}
              items={[
                { label: 'Kategori', value: row.kategori || 'Umum' },
                { label: 'Tanggapan', value: `${row.total_komentar || row.komentar_count || 0} Tanggapan` },
                { label: 'Dibuat', value: row.created_at_formatted || '-' },
              ]}
              actions={[
                { label: 'Buka Diskusi', icon: Eye, onClick: () => handleOpenThread(row.id) },
                { label: 'Edit', icon: Edit3, onClick: () => handleOpenEditModal(row) },
                { label: 'Hapus', icon: Trash2, variant: 'danger', onClick: () => handleDeletePrompt(row) },
              ]}
            />
          )}
        />

 {/* Print & PDF Modal */}
 <PrintOptionModal
 isOpen={isPrintModalOpen}
 onClose={() => setIsPrintModalOpen(false)}
 title="Forum Diskusi Kelas"
 onPrint={() => {
 const rowsToPrint = Array.isArray(dataDiskusi) ? dataDiskusi : []
 printCleanTable({
 title: 'Laporan Data Forum Diskusi Kelas',
 subtitle: 'Daftar Topik Forum Diskusi Pembelajaran Sekolah Islam Terpadu',
 headers: ['NO', 'TOPIK / JUDUL DISKUSI', 'KATEGORI', 'MODUL AJAR TERKAIT', 'KOMENTAR', 'STATUS'],
 rows: rowsToPrint.map((row, i) => [
 i + 1,
 row.judul_diskusi || row.judul || '-',
 row.kategori || 'Umum',
 row.modul_ajar?.judul_modul || row.modul_ajar?.judul || '-',
 row.total_komentar || row.komentar_count || 0,
 row.status === 'tertutup' || row.is_closed ? 'Tertutup' : 'Aktif',
 ]),
 })
 }}
 onDownload={() => {
 const rowsToPrint = Array.isArray(dataDiskusi) ? dataDiskusi : []
 downloadPdfTable({
 title: 'Laporan Data Forum Diskusi Kelas',
 subtitle: 'Daftar Topik Forum Diskusi Pembelajaran Sekolah Islam Terpadu',
 headers: ['NO', 'TOPIK / JUDUL DISKUSI', 'KATEGORI', 'MODUL AJAR TERKAIT', 'KOMENTAR', 'STATUS'],
 rows: rowsToPrint.map((row, i) => [
 i + 1,
 row.judul_diskusi || row.judul || '-',
 row.kategori || 'Umum',
 row.modul_ajar?.judul_modul || row.modul_ajar?.judul || '-',
 row.total_komentar || row.komentar_count || 0,
 row.status === 'tertutup' || row.is_closed ? 'Tertutup' : 'Aktif',
 ]),
 filename: 'laporan_forum_diskusi_kelas.pdf',
 })
 }}
 />

 {/* Harmonized Batch Import Modal */}
 <HarmonizedBatchImportModal
 isOpen={importOpen}
 onClose={() => setImportOpen(false)}
 onImportSuccess={() => {
 fetchData()
 fetchStats()
 }}
 notify={notify}
 />

 {/* Harmonized KPI Detail Modal */}
 <AppModal
 isOpen={kpiModalOpen}
 onClose={() => setKpiModalOpen(false)}
 title={kpiModalCategory.title}
 description={`Menampilkan ${kpiModalCategory.items.length} topik diskusi terdaftar`}
 icon={MessageSquare}
 maxWidth="max-w-4xl"
 zIndex={50}
 footer={
 <button
 onClick={() => setKpiModalOpen(false)}
 className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
 >
 Tutup
 </button>
 }
 >
 {kpiModalCategory.items.length === 0 ? (
 <div className="py-12 text-center text-slate-400">
 <MessageSquare className="w-12 h-9 mx-auto mb-3 opacity-30 text-emerald-600" />
 <p className="font-bold text-sm text-slate-700 dark:text-slate-300">Tidak ada data diskusi dalam kategori ini.</p>
 </div>
 ) : (
 <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
 <TableRoot className="w-full text-left border-collapse text-xs">
 <TableHeader>
 <TableRow className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200/80 dark:border-emerald-800/80 text-xs font-black text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
 <TableHead className="py-3 px-4">Judul Diskusi</TableHead>
 <TableHead className="py-3 px-4">Kategori</TableHead>
 <TableHead className="py-3 px-4">Modul Ajar</TableHead>
 <TableHead className="py-3 px-4 text-center">Status</TableHead>
 <TableHead className="py-3 px-4 text-right"></TableHead>
 </TableRow>
 </TableHeader>
 <TableBody className="divide-y divide-emerald-100/80 dark:divide-slate-800">
 {kpiModalCategory.items.map((item, idx) => (
 <TableRow key={item.id || idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors">
 <TableCell className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{item.judul_diskusi || item.judul}</TableCell>
 <TableCell className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">
 {item.kategori || 'Umum'}
 </TableCell>
 <TableCell className="py-3 px-4 text-slate-600 dark:text-slate-300">
 {item.modul_ajar?.judul_modul || item.modul_ajar?.judul || '-'}
 </TableCell>
 <TableCell className="py-3 px-4 text-center">
 <span
 className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
 item.status === 'aktif'
 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
 : 'bg-slate-100 text-slate-700 dark:bg-emerald-950/60 dark:text-emerald-300'
 }`}
 >
 {item.status || 'aktif'}
 </span>
 </TableCell>
 <TableCell className="py-3 px-4 text-right">
 <button
 onClick={() => {
 setKpiModalOpen(false)
 handleOpenThread(item.id)
 }}
 className="px-3 py-1.5 rounded-xl bg-emerald-50 text-[#059669] dark:bg-emerald-950/40 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 transition-colors"
 >
 Buka Thread
 </button>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </TableRoot>
 </div>
 )}
 </AppModal>

 {/* Modal Form Tambah / Edit Diskusi */}
 <AppModal
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 title={editId ? 'Edit Topik Diskusi Kelas' : 'Buat Topik Diskusi Kelas Baru'}
 description="Publikasikan bahan diskusi atau pertanyaan pemantik modul ajar."
 icon={MessageSquare}
 variant={editId ? 'warning' : 'emerald'}
 maxWidth="max-w-2xl"
 zIndex={50}
 footer={
 <>
 <button
 type="button"
 onClick={() => setIsModalOpen(false)}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-all"
 >
 Batal
 </button>
 <button
 type="submit"
 form="diskusiForm"
 className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all ${
 editId
 ? 'bg-amber-600 hover:bg-amber-700'
 : 'bg-emerald-600 hover:bg-emerald-700'
 }`}
 >
 <span>{editId ? 'Perbarui Topik' : 'Publikasikan Diskusi'}</span>
 </button>
 </>
 }
 >
 <form id="diskusiForm" onSubmit={handleTriggerSave} className="space-y-4">
 {/* Modul Ajar Relasi */}
 <div>
 <HeroUiModalSelect
 label="Modul Ajar Terkait"
 value={formData.modul_ajar_id}
 onChange={(val) => setFormData({ ...formData, modul_ajar_id: val })}
 options={modalModulAjarOptions}
 placeholder="-- Tanpa Modul (Diskusi Umum) --"
 icon={BookOpen}
 searchable
 />
 </div>

 {/* Judul Diskusi */}
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
 Judul Topik Diskusi <span className="text-rose-500">*</span>
 </label>
 <input
 type="text"
 required
 placeholder="Contoh: Pemahaman Kasus Hukum Newton II Pada Kehidupan..."
 value={formData.judul}
 onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
 className="w-full px-3.5 py-2.5 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 text-xs font-semibold focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/12 outline-none"
 />
 </div>

 {/* Kategori Diskusi */}
 <div>
 <HeroUiModalSelect
 label="Kategori Diskusi"
 value={formData.kategori}
 onChange={(val) => setFormData({ ...formData, kategori: val })}
 options={modalKategoriOptions}
 placeholder="Pilih Kategori Diskusi"
 icon={Tag}
 />
 </div>

 {/* Deskripsi / Pertanyaan Pemicu */}
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
 Deskripsi / Pertanyaan Pemantik
 </label>
 <textarea
 rows={4}
 placeholder="Tuliskan petunjuk diskusi, topik pemantik, atau studi kasus bagi santri/siswa..."
 value={formData.deskripsi}
 onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
 className="w-full px-3.5 py-2.5 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 text-xs font-semibold focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/12 outline-none leading-relaxed"
 />
 </div>

 {/* Tanggal Mulai & Tutup */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
 Tanggal &amp; Jam Mulai
 </label>
 <input
 type="datetime-local"
 value={formData.tanggal_mulai}
 onChange={(e) => setFormData({ ...formData, tanggal_mulai: e.target.value })}
 className="w-full px-3.5 py-2.5 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 text-xs font-semibold focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/12 outline-none"
 />
 </div>
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
 Tanggal &amp; Jam Tutup
 </label>
 <input
 type="datetime-local"
 value={formData.tanggal_tutup}
 onChange={(e) => setFormData({ ...formData, tanggal_tutup: e.target.value })}
 className="w-full px-3.5 py-2.5 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 text-xs font-semibold focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/12 outline-none"
 />
 </div>
 </div>

 {/* Status Diskusi */}
 <div>
 <HeroUiModalSelect
 label="Status Topik Diskusi"
 value={formData.status}
 onChange={(val) => setFormData({ ...formData, status: val })}
 options={modalStatusOptions}
 placeholder="Pilih Status"
 />
 </div>
 </form>
 </AppModal>

 {/* Harmonized Save Confirmation Modal */}
 <HarmonizedSaveModal
 isOpen={isSaveModalOpen}
 onClose={() => setIsSaveModalOpen(false)}
 onConfirm={handleConfirmSave}
 isEdit={Boolean(editId)}
 title={formData.judul}
 isSubmitting={formSubmitting}
 />

 {/* Harmonized Delete Confirmation Modal */}
 <HarmonizedDeleteModal
 isOpen={deleteModalState.isOpen}
 onClose={() => setDeleteModalState({ isOpen: false, id: null, title: '', isSubmitting: false })}
 onConfirm={handleConfirmDelete}
 title={deleteModalState.title}
 isSubmitting={deleteModalState.isSubmitting}
 />

 {/* Interactive Comments & Thread Drawer */}
 <AppDrawer
 isOpen={isThreadOpen && Boolean(selectedDiskusi)}
 onClose={() => setIsThreadOpen(false)}
 title={selectedDiskusi?.judul_diskusi || selectedDiskusi?.judul}
 description="Utasan Komentar Diskusi"
 icon={MessageCircle}
 position="right"
 footer={
 selectedDiskusi && !selectedDiskusi.is_closed ? (
 <div className="w-full">
 {replyParentId && (
 <div className="mb-2 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
 <span className="font-semibold">Membalas tanggapan terpilih...</span>
 <button
 onClick={() => setReplyParentId(null)}
 className="text-emerald-600 font-bold hover:underline"
 >
 Batal
 </button>
 </div>
 )}

 <form onSubmit={handlePostKomentar} className="space-y-2.5">
 <div className="flex items-center justify-between gap-2">
 <div className="flex items-center gap-2">
 <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
 Kirim Sebagai:
 </span>
 <div className="w-48">
 <HeroUiFilterSelect
 value={komentarForm.peran_pengirim}
 onChange={(val) =>
 setKomentarForm({ ...komentarForm, peran_pengirim: val })
 }
 options={peranPengirimOptions}
 placeholder="Kirim Sebagai"
 popoverWidth="min-w-[170px]"
 />
 </div>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <input
 type="text"
 required
 placeholder="Tuliskan komentar atau tanggapan diskusi..."
 value={komentarForm.konten}
 onChange={(e) =>
 setKomentarForm({ ...komentarForm, konten: e.target.value })
 }
 className="flex-1 px-4 py-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-800 text-xs font-medium focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20 outline-none"
 />
 <button
 type="submit"
 disabled={submittingKomentar || !komentarForm.konten.trim()}
 className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md disabled:opacity-50 flex items-center gap-1.5 shrink-0 transition-all"
 >
 {submittingKomentar ? (
 <RefreshCw className="w-4 h-4 animate-spin" />
 ) : (
 <Send className="w-4 h-4" />
 )}
 <span>Kirim</span>
 </button>
 </div>
 </form>
 </div>
 ) : null
 }
 >
 {selectedDiskusi && (
 <div className="space-y-5">
 {/* Discussion Prompt Card */}
 <div className="p-5 rounded-xl bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs">
 <div className="flex items-center justify-between mb-2">
 <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-[#059669] dark:text-emerald-300">
 {selectedDiskusi.kategori}
 </span>
 {selectedDiskusi.modul_ajar && (
 <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold truncate max-w-xs flex items-center gap-1">
 <BookOpen className="h-3.5 w-3.5 text-emerald-600 inline" />
 {selectedDiskusi.modul_ajar.judul_modul || selectedDiskusi.modul_ajar.judul}
 </span>
 )}
 </div>
 <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line font-medium">
 {selectedDiskusi.deskripsi || 'Tidak ada catatan deskripsi rinci.'}
 </p>
 {selectedDiskusi.is_closed && (
 <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-amber-800 dark:text-amber-200 text-xs font-semibold flex items-center gap-2">
 <Lock className="w-4 h-4 shrink-0 text-amber-600" />
 <span>Diskusi telah dikunci. Komentar baru tidak dapat ditambahkan.</span>
 </div>
 )}
 </div>

 {/* Comments List */}
 <div>
 <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center justify-between">
 <span>Tanggapan &amp; Jawaban ({selectedDiskusi.komentar?.length || selectedDiskusi.total_komentar || 0})</span>
 {threadLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#059669]" />}
 </h4>

 {selectedDiskusi.komentar && selectedDiskusi.komentar.length > 0 ? (
 <div className="space-y-3.5">
 {selectedDiskusi.komentar.map((kom) => (
 <div
 key={kom.id}
 className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs"
 >
 <div className="flex items-center justify-between mb-2">
 <div className="flex items-center gap-2">
 <span
 className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
 kom.peran_pengirim === 'Guru'
 ? 'bg-emerald-100 dark:bg-emerald-950 text-[#059669] dark:text-emerald-300'
 : kom.peran_pengirim === 'Admin'
 ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
 : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
 }`}
 >
 {kom.peran_pengirim}
 </span>
 <span className="text-xs font-black text-slate-800 dark:text-slate-200">
 {kom.nama_pengirim}
 </span>
 </div>
 <div className="flex items-center gap-2 text-xs text-slate-400">
 <span>{kom.created_at_formatted}</span>
 <button
 onClick={() => handleDeleteKomentar(kom.id)}
 className="text-slate-400 hover:text-rose-500 transition-colors p-1"
 title="Hapus Komentar"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>

 <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
 {kom.konten}
 </p>

 {/* Reply Action */}
 {!selectedDiskusi.is_closed && (
 <button
 onClick={() => setReplyParentId(replyParentId === kom.id ? null : kom.id)}
 className="mt-2 text-xs font-bold text-[#059669] dark:text-emerald-400 hover:underline flex items-center gap-1"
 >
 <CornerDownRight className="w-3.5 h-3.5" /> Balas Tanggapan
 </button>
 )}

 {/* Nested Replies */}
 {kom.replies && kom.replies.length > 0 && (
 <div className="mt-3 pl-3.5 border-l-2 border-emerald-200/80 space-y-2.5">
 {kom.replies.map((reply) => (
 <div key={reply.id} className="pt-1.5">
 <div className="flex items-center justify-between mb-1">
 <div className="flex items-center gap-2">
 <span
 className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
 reply.peran_pengirim === 'Guru'
 ? 'bg-emerald-100 dark:bg-emerald-950 text-[#059669] dark:text-emerald-300'
 : reply.peran_pengirim === 'Admin'
 ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
 : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
 }`}
 >
 {reply.peran_pengirim}
 </span>
 <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
 {reply.nama_pengirim}
 </span>
 </div>
 <button
 onClick={() => handleDeleteKomentar(reply.id)}
 className="text-slate-400 hover:text-rose-500 transition-colors p-1"
 >
 <Trash2 className="w-3 h-3" />
 </button>
 </div>
 <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
 {reply.konten}
 </p>
 </div>
 ))}
 </div>
 )}
 </div>
 ))}
 </div>
 ) : (
 <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-emerald-200/80 dark:border-emerald-800/60">
 <MessageCircle className="h-8 w-8 mx-auto mb-2 text-slate-300" />
 <p className="text-xs text-slate-400 font-medium">
 Belum ada komentar pada topik ini. Jadilah yang pertama memberikan tanggapan!
 </p>
 </div>
 )}
 </div>
 </div>
 )}
 </AppDrawer>

 {/* Harmonized Batch Export Modal */}
 <HarmonizedBatchExportModal
 isOpen={isExportModalOpen}
 onClose={() => setIsExportModalOpen(false)}
 onExport={handleProcessExport}
 isExporting={isExporting}
 totalCount={pagination.total || dataDiskusi.length}
 moduleTitle="Forum Diskusi"
 />
 </div>
 </PageContainer>
 )
}
