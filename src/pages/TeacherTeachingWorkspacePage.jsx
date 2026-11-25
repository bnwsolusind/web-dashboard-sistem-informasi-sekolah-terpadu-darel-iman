import CustomSelect from "../components/ui/CustomSelect"
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import ActionDropdown from '../components/app/ActionDropdown'
import {
  AppModal
} from '../components/app'
import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Award,
  BarChart3,
  BookMarked,
  BookOpen,
  Calendar,
  CalendarDays,
  CalendarRange,
  Camera,
  CameraOff,
  Check,
  CheckCircle,
  CheckCircle2,
  Loader2,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Command,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileInput,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  Heart,
  HeartHandshake,
  HelpCircle,
  History,
  Info,
  Layers,
  Lock,
  MessageSquare,
  MoreVertical,
  PieChart as PieChartIcon,
  Paperclip,
  Play,
  Plus,
  Printer,
  QrCode,
  Radio,
  RefreshCw,
  Save,
  Scan,
  ScanFace,
  School,
  Search,
  ShieldAlert,
  Sparkles,
  Trash2,
  TrendingUp,
  Trophy,
  UserCheck,
  User,
  Users,
  Upload,
  Video,
  Wifi,
  X,
  XCircle,
  Zap
} from 'lucide-react'
import {
  useSearchParams,
  useNavigate
} from 'react-router-dom'
import {
  useAuthStore
} from '../stores/authStore'
import {
  usePengaturanStore
} from '../stores/pengaturanStore'
import {
  ROLES,
  hasAnyRole
} from '../auth/portalResolver'
import useDebounce from '../hooks/useDebounce'
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '../components/ui/avatar'
import {
  Pagination
} from '../components/ui/pagination'
import {
  Button
} from '../components/ui/button'
import {
  DatePicker
} from '../components/ui/date-picker'
import HeroUiFilterSelect from '../components/ui/HeroUiFilterSelect'
import api from '../services/api'
import {
  equranService
} from '../services/equranService'
import {
  MasterDataPage,
  MasterPageHeader,
  MasterActionButton,
  MasterStatCard,
  MasterStatsGrid,
  SquircleActionButton
} from '../components/master-data'
import PageToolbarActions from '../components/app/PageToolbarActions'
import {
  KpiStatCard,
  HeroUiHeader
} from '../components/app'
import TeacherMutabaahWeekly from '../components/TeacherMutabaahWeekly'
import TeacherTeachingSessionPanel from '../components/attendance/TeacherTeachingSessionPanel'
import ActiveScheduleNotice from '../components/attendance/ActiveScheduleNotice'
import ChatGuruWorkspace from '../components/portal/ChatGuruWorkspace'
import TahfizhReportSummaryPage from './tahfizh/TahfizhReportSummaryPage'
import {
  VideoEmbedPlayer,
  PdfDocumentViewer
} from '../components/common/MateriMediaEmbed'
import {
  printCleanTable,
  downloadPdfTable,
  printWeeklyStudentEvaluation,
  generateOfficialPrintHeaderHtml
} from '../utils/printHelper'
import {
  requestCameraStream,
  parseCameraError,
  isBarcodeDetectorSupported
} from '../utils/cameraHelper'

function calculatePekanFromDate(dateStr) {
 if (!dateStr) return { pekan: 1, semester: 1, label: 'Pekan 01 (Semester Ganjil)' }
 const target = new Date(dateStr)
 if (isNaN(target.getTime())) return { pekan: 1, semester: 1, label: 'Pekan 01 (Semester Ganjil)' }

 const startGanjil = new Date('2026-07-13T00:00:00')
 const startGenap = new Date('2027-01-04T00:00:00')

 if (target < startGenap) {
 const diffDays = Math.max(0, Math.floor((target.getTime() - startGanjil.getTime()) / (1000 * 60 * 60 * 24)))
 const pekan = Math.max(1, Math.min(16, Math.floor(diffDays / 7) + 1))
 return {
 pekan,
 semester: 1,
 label: `Pekan ${String(pekan).padStart(2, '0')} (Semester Ganjil)`,
 }
 } else {
 const diffDays = Math.max(0, Math.floor((target.getTime() - startGenap.getTime()) / (1000 * 60 * 60 * 24)))
 const pekan = Math.min(32, 16 + Math.max(1, Math.floor(diffDays / 7) + 1))
 const pekanGenap = pekan - 16
 return {
 pekan,
 semester: 2,
 label: `Pekan ${String(pekan).padStart(2, '0')} (Semester Genap - Pekan ${pekanGenap})`,
 }
 }
}

// ── HEROUI SELECT DROPDOWN COMPONENT (FOR WORKSPACE FILTER BAR & MODULES) ──
function HeroUiWorkspaceSelect({
 id,
 value,
 onChange,
 options = [],
 placeholder = 'Pilih...',
 icon: IconComponent = null,
 label = null,
 className = '',
 buttonClassName = '',
 popoverWidth = 'w-64',
 searchable = false,
 disabled = false,
 badge = null,
 align = 'left',
 placement = 'bottom-start',
 popoverProps = {},
}) {
 const [isOpen, setIsOpen] = useState(false)
 const [search, setSearch] = useState('')
 const containerRef = useRef(null)

 const effectivePlacement = popoverProps?.placement || placement
 const effectiveAlign = popoverProps?.align || align

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

 // Normalize options into { value, label, subtext }
 const normalizedOptions = useMemo(() => {
 return options.map((opt) => {
 if (typeof opt === 'object' && opt !== null) {
 return {
 value: opt.value !== undefined ? opt.value : opt.id,
 label: opt.label || opt.nama_kelas || opt.name || String(opt.value ?? opt.id),
 subtext: opt.subtext || (opt.kode_kelas ? `Kode: ${opt.kode_kelas}` : undefined),
 }
 }
 return { value: opt, label: String(opt), subtext: undefined }
 })
 }, [options])

 const selectedOption = useMemo(() => {
 return normalizedOptions.find((opt) => String(opt.value) === String(value))
 }, [normalizedOptions, value])

 const shouldSearch = searchable || normalizedOptions.length > 7

 const filteredOptions = useMemo(() => {
 if (!shouldSearch || !search.trim()) return normalizedOptions
 const q = search.toLowerCase()
 return normalizedOptions.filter((opt) =>
 (opt.label && String(opt.label).toLowerCase().includes(q)) ||
 (opt.subtext && String(opt.subtext).toLowerCase().includes(q))
 )
 }, [normalizedOptions, search, shouldSearch])

 const hasValue = value !== '' && value !== 'all' && value !== 'semua' && value !== undefined && value !== null

 return (
 <div className={`relative ${isOpen ? 'z-50' : 'z-10'} ${className}`} ref={containerRef} id={id ? `${id}-container` : undefined}>
 <button
 type="button"
 id={id}
 disabled={disabled}
 onClick={() => {
 if (!disabled) {
 setIsOpen((prev) => !prev)
 setSearch('')
 }
 }}
 className={`h-9.5 flex items-center justify-between gap-2.5 rounded-xl border px-3 text-xs font-bold transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 shadow-2xs ${isOpen
 ? 'border-slate-600 bg-white ring-2 ring-emerald-500/25 dark:border-emerald-800/60 dark:bg-slate-900 dark:ring-emerald-400/25 text-slate-900 dark:text-white shadow-xs'
 : hasValue
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark text-emerald-950 dark:border-emerald-800/60 dark:bg-card-dark dark:text-emerald-200 font-extrabold shadow-sm'
 : 'border-emerald-200/80 dark:border-emerald-800/60 bg-white text-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700/80 dark:bg-[#111827] dark:text-slate-200 dark:hover:border-emerald-700/80'
 } ${buttonClassName}`}
 >
 <div className="flex items-center gap-2 min-w-0">
 {IconComponent && (
 <IconComponent className={`size-3.5 shrink-0 ${hasValue ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
 )}
 {label && (
 <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
 {label}:
 </span>
 )}
 <span className="truncate font-extrabold text-xs text-emerald-900 dark:text-emerald-100 max-w-[200px]">
 {selectedOption ? selectedOption.label : placeholder}
 </span>
 {badge && (
 <span className="shrink-0 rounded-md bg-emerald-100/90 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider">
 {badge}
 </span>
 )}
 </div>
 <ChevronDown
 className={`size-3.5 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
 }`}
 />
 </button>

 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ opacity: 0, scale: 0.96, y: effectivePlacement.startsWith('top') ? 4 : -4 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.96, y: effectivePlacement.startsWith('top') ? 4 : -4 }}
 transition={{ duration: 0.15, ease: 'easeOut' }}
 className={`absolute ${effectiveAlign === 'right' ? 'right-0' : 'left-0'} ${effectivePlacement.startsWith('top') ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
 } z-[100] ${popoverWidth} min-w-[200px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-emerald-200/80 bg-white/95 dark:bg-surface-dark-inner/95 backdrop-blur-md p-1.5 shadow-2xl shadow-sm dark:border-emerald-800/60 dark:shadow-black/60`}
 >
 {shouldSearch && (
 <div className="p-1.5 border-b border-emerald-200/80 dark:border-emerald-800/60 mb-1">
 <div className="relative">
 <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Ketik untuk mencari..."
 className="w-full rounded-3xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 dark:border-emerald-700/80 bg-slate-50/80 dark:bg-slate-900/80 pl-8 pr-2.5 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 shadow-2xs"
 autoFocus
 />
 </div>
 </div>
 )}

 <div className="max-h-60 overflow-y-auto space-y-0.5 pr-0.5">
 {filteredOptions.length === 0 ? (
 <div className="px-3 py-4 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
 Tidak ada data yang cocok
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
 className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-bold transition-all text-left cursor-pointer ${isSelected
 ? 'bg-white dark:bg-card-dark text-emerald-950 dark:from-emerald-950/80 dark:to-teal-950/50 dark:text-emerald-200 font-black'
 : 'text-slate-700 hover:bg-emerald-50/60 hover:text-emerald-900 dark:text-slate-200 dark:hover:bg-slate-800/80 dark:hover:text-emerald-300'
 }`}
 >
 <div className="truncate pr-2 flex-1">
 <div className="truncate flex items-center gap-1.5">
 <span className="truncate">{opt.label}</span>
 {opt.badge && (
 <span className="shrink-0 text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
 {opt.badge}
 </span>
 )}
 </div>
 {opt.subtext && (
 <div className="text-[10.5px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
 {opt.subtext}
 </div>
 )}
 </div>
 {isSelected && (
 <div className="size-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
 <Check className="size-3.5" strokeWidth={3} />
 </div>
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

const ATTENDANCE_PEKAN_OPTIONS = [
 { value: 'pekan_ini', label: 'Pekan Berjalan (Saat Ini)' },
 ...Array.from({ length: 16 }, (_, i) => ({
 value: `pekan_${i + 1}`,
 label: `Pekan ke-${i + 1} (KBM Pekan ${i + 1})`,
 })),
]

const ATTENDANCE_BULAN_OPTIONS = [
 { value: '07', label: 'Juli 2026 (Awal TA 2026/2027)' },
 { value: '08', label: 'Agustus 2026' },
 { value: '09', label: 'September 2026 (Bulan Berjalan)' },
 { value: '10', label: 'Oktober 2026' },
 { value: '11', label: 'November 2026' },
 { value: '12', label: 'Desember 2026 (PAS 1)' },
 { value: '01', label: 'Januari 2027 (Awal Semester 2)' },
 { value: '02', label: 'Februari 2027 🌙 (Ramadhan 1448 H)' },
 { value: '03', label: 'Maret 2027 🕌 (Idul Fitri 1448 H)' },
 { value: '04', label: 'April 2027' },
 { value: '05', label: 'Mei 2027' },
 { value: '06', label: 'Juni 2027 (PAT & Rapor Kenaikan Kelas)' },
]

const ATTENDANCE_SEMESTER_OPTIONS = [
 { value: '1', label: 'Semester 1 (Ganjil) - Juli s/d Desember 2026' },
 { value: '2', label: 'Semester 2 (Genap) - Januari s/d Juni 2027' },
]

const MODERN_KPI_TONES = {
  emerald: {
    card: 'rounded-container border-2 border-emerald-300 dark:border-emerald-700/80 bg-gradient-to-b from-[#E6F8F3] via-[#E6F8F3]/30 to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-emerald-400',
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
    card: 'rounded-container border-2 border-sky-300 dark:border-sky-700/80 bg-gradient-to-b from-[#E0F2FE]/70 via-[#E0F2FE]/20 to-white dark:from-sky-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-sky-400',
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
    card: 'rounded-container border-2 border-sky-300 dark:border-sky-700/80 bg-gradient-to-b from-[#E0F2FE]/70 via-[#E0F2FE]/20 to-white dark:from-sky-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-sky-400',
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
    card: 'rounded-container border-2 border-teal-300 dark:border-teal-700/80 bg-gradient-to-b from-[#CCFBF1]/70 via-[#CCFBF1]/20 to-white dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-teal-400',
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
    card: 'rounded-container border-2 border-indigo-300 dark:border-indigo-700/80 bg-gradient-to-b from-[#E0E7FF]/70 via-[#E0E7FF]/20 to-white dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-indigo-400',
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
    card: 'rounded-container border-2 border-rose-300 dark:border-rose-700/80 bg-gradient-to-b from-[#FFE4E6]/70 via-[#FFE4E6]/20 to-white dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-rose-400',
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
    card: 'rounded-container border-2 border-amber-300 dark:border-amber-700/80 bg-gradient-to-b from-[#FEF3C7]/70 via-[#FEF3C7]/20 to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-amber-400',
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
    card: 'rounded-container border-2 border-purple-300 dark:border-purple-700/80 bg-gradient-to-b from-[#F3E8FF]/70 via-[#F3E8FF]/20 to-white dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-purple-400',
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
    card: 'rounded-container border-2 border-purple-300 dark:border-purple-700/80 bg-gradient-to-b from-[#F3E8FF]/70 via-[#F3E8FF]/20 to-white dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-purple-400',
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
    card: 'rounded-container border-2 border-teal-300 dark:border-teal-700/80 bg-gradient-to-b from-[#CCFBF1]/70 via-[#CCFBF1]/20 to-white dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-teal-400',
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
    card: 'rounded-container border-2 border-emerald-300 dark:border-emerald-700/80/80 bg-gradient-to-b from-slate-100/70 via-slate-50/30 to-white dark:from-slate-900/60 dark:via-slate-900 dark:to-slate-950 hover:border-slate-400',
    glow: 'bg-slate-400/20 group-hover:bg-slate-400/30',
    iconBox: '!bg-slate-600 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-slate-600 !text-white shadow-xs rounded-full',
    tag: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-emerald-200/80 dark:border-emerald-700/80/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-emerald-200/80 dark:border-emerald-700/80/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
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

function ModernWorkspaceKpiCard({
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

const MateriModalForm = React.memo(function MateriModalForm({
 initialData,
 editingId,
 saving,
 onSave,
 onClose,
}) {
 const [form, setForm] = useState(initialData)

 const handleDateChange = (newDate) => {
 const calc = calculatePekanFromDate(newDate)
 setForm((prev) => {
 let updatedJudul = prev.judul || ''
 const pekanPrefixMatch = updatedJudul.match(/^Pekan\s+\d+:\s*(.*)$/i)
 if (pekanPrefixMatch) {
 updatedJudul = `Pekan ${String(calc.pekan).padStart(2, '0')}: ${pekanPrefixMatch[1]}`
 } else if (!updatedJudul.trim()) {
 updatedJudul = `Pekan ${String(calc.pekan).padStart(2, '0')}: `
 }

 return {
 ...prev,
 tanggal: newDate,
 tanggal_publish: newDate,
 urutan: calc.pekan,
 judul: updatedJudul,
 }
 })
 }

 const handleSubmit = (e) => {
 e.preventDefault()
 onSave(form)
 }

 const pekanInfo = calculatePekanFromDate(form.tanggal)

 return (
 <div className="flex flex-col h-full max-h-[92vh]">
 {/* Top Accent Line */}

 {/* Modal Header */}
 <div className="flex items-center justify-between px-6 py-4.5 border-b border-emerald-200/80 dark:border-emerald-800/80 bg-slate-50/50 dark:bg-slate-900/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-transparent shrink-0">
 <div className="flex items-center gap-3.5 min-w-0">
 <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-xs">
 {editingId ? <Edit3 className="size-5" /> : <BookOpen className="size-5" />}
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100/90 dark:bg-emerald-950/80 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
 <Sparkles className="size-2.5 text-amber-500" /> LMS · Materi Pembelajaran
 </span>
 <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${form.status === 'published' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-emerald-950/60 dark:text-emerald-300'}`}>
 <span className={`size-1.5 rounded-full ${form.status === 'published' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
 {form.status === 'published' ? 'Dipublikasikan' : 'Draft'}
 </span>
 </div>
 <h2 className="mt-1 text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white ">
 {editingId ? 'Edit Materi Pembelajaran' : 'Tambah Materi Pembelajaran Baru'}
 </h2>
 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
 Lengkapi bahan ajar, materi, dan jadwal pembelajaran kelas.
 </p>
 </div>
 </div>

 <button
 type="button"
 onClick={onClose}
 className="rounded-lg p-2 text-slate-400 hover:text-slate-700 hover:bg-white hover:bg-emerald-50/60/60 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 ml-2 h-9 px-3.5"
 title="Tutup (Esc)"
 >
 <X className="size-5" />
 <span className="sr-only">Tutup</span>
 </button>
 </div>

 {/* Modal Form Body */}
 <form id="form-materi" onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1 custom-scrollbar">
 {/* Tanggal & Otomatis Pekan */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 rounded-xl bg-white dark:bg-card-dark border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-card-dark dark:border-emerald-800/60 shadow-xs">
 <div>
 <label htmlFor="materi-tanggal" className="font-bold block mb-1 text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
 <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
 Tanggal Pembelajaran <span className="text-rose-500">*</span>
 </label>
 <DatePicker
 id="materi-tanggal"
 required
 value={form.tanggal || ''}
 onChange={(e) => handleDateChange(e.target.value)}
 inputClassName="p-2.5 text-xs font-semibold"
 />
 <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
 Tahun Ajaran 2026/2027 Aktif
 </span>
 </div>
 <div>
 <label htmlFor="materi-urutan" className="font-bold block mb-1 text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
 <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
 Pekan Ke- (Otomatis) <span className="text-rose-500">*</span>
 </label>
 <div className="flex items-center gap-2">
 <input
 id="materi-urutan"
 type="number"
 min={1}
 max={32}
 required
 value={form.urutan || 1}
 onChange={(e) => setForm({ ...form, urutan: parseInt(e.target.value, 10) || 1 })}
 className="w-16 p-2.5 border rounded-xl bg-white dark:bg-slate-800 border-emerald-200/80 dark:border-emerald-700/80 text-xs font-black text-center text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition"
 />
 <span className="flex-1 inline-flex items-center justify-center px-2.5 py-2 rounded-xl bg-emerald-100/90 dark:bg-emerald-900/60 text-xs font-bold text-emerald-900 dark:text-emerald-200 text-center truncate border border-emerald-200/80 dark:border-emerald-800/80">
 {pekanInfo.label}
 </span>
 </div>
 <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
 Diselaraskan otomatis dari tanggal
 </span>
 </div>
 </div>

 <div>
 <label htmlFor="materi-judul" className="font-bold block mb-1.5 text-slate-800 dark:text-slate-200">
 Judul Materi Pembelajaran <span className="text-rose-500">*</span>
 </label>
 <input
 id="materi-judul"
 type="text"
 required
 value={form.judul || ''}
 onChange={(e) => setForm({ ...form, judul: e.target.value })}
 className="w-full p-2.5 border rounded-xl bg-white dark:bg-slate-800 border-emerald-200/80 dark:border-emerald-700/80 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition placeholder:text-slate-400"
 placeholder="Contoh: Pekan 09: Konsep Dasar Pecahan Senilai"
 />
 </div>

 <div>
 <label htmlFor="materi-ringkasan" className="font-bold block mb-1.5 text-slate-800 dark:text-slate-200">
 Ringkasan Materi
 </label>
 <textarea
 id="materi-ringkasan"
 rows={2}
 value={form.ringkasan || ''}
 onChange={(e) => setForm({ ...form, ringkasan: e.target.value })}
 className="w-full p-2.5 border rounded-xl bg-white dark:bg-slate-800 border-emerald-200/80 dark:border-emerald-700/80 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition placeholder:text-slate-400"
 placeholder="Ringkasan singkat materi atau pokok bahasan yang akan dipelajari..."
 />
 </div>

 <div>
 <label htmlFor="materi-isi" className="font-bold block mb-1.5 text-slate-800 dark:text-slate-200">
 Isi atau Catatan Materi Lengkap
 </label>
 <textarea
 id="materi-isi"
 rows={4}
 value={form.isi || ''}
 onChange={(e) => setForm({ ...form, isi: e.target.value })}
 className="w-full resize-y p-2.5 border rounded-xl bg-white dark:bg-slate-800 border-emerald-200/80 dark:border-emerald-700/80 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition placeholder:text-slate-400"
 placeholder="Tuliskan uraian materi, penjelasan materi, atau panduan belajar..."
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
 <div>
 <label htmlFor="materi-file" className="font-bold block mb-1.5 text-slate-800 dark:text-slate-200">
 Tautan Dokumen / Modul PDF
 </label>
 <input
 id="materi-file"
 type="url"
 value={form.file || form.link || ''}
 onChange={(e) => setForm({ ...form, file: e.target.value, link: e.target.value })}
 className="w-full p-2.5 border rounded-xl bg-white dark:bg-slate-800 border-emerald-200/80 dark:border-emerald-700/80 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition placeholder:text-slate-400"
 placeholder="https://.../modul.pdf"
 />
 </div>
 <div>
 <label htmlFor="materi-video" className="font-bold block mb-1.5 text-slate-800 dark:text-slate-200">
 URL Video (YouTube Embed)
 </label>
 <input
 id="materi-video"
 type="url"
 value={form.video || ''}
 onChange={(e) => setForm({ ...form, video: e.target.value })}
 className="w-full p-2.5 border rounded-xl bg-white dark:bg-slate-800 border-emerald-200/80 dark:border-emerald-700/80 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition placeholder:text-slate-400"
 placeholder="https://youtube.com/watch?v=..."
 />
 </div>
 </div>

 <div>
 <label htmlFor="materi-status" className="font-bold block mb-1.5 text-slate-800 dark:text-slate-200">
 Status Publikasi <span className="text-rose-500">*</span>
 </label>
 <HeroUiWorkspaceSelect
 id="materi-status"
 value={form.status || 'published'}
 onChange={(val) => setForm({ ...form, status: val })}
 options={[
 { value: 'published', label: '✅ Publikasikan Langsung ke Siswa' },
 { value: 'draft', label: '📝 Simpan Sebagai Draft' },
 ]}
 popoverWidth="w-full"
 className="w-full"
 />
 </div>
 </form>

 {/* Modal Footer */}
 <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-emerald-200/80 dark:border-emerald-800/80 bg-slate-50/80 dark:bg-slate-900/60 rounded-b-[24px] shrink-0">
 <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 w-full sm:w-auto justify-center sm:justify-start">
 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs">
 <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
 Pekan {String(form.urutan || 1).padStart(2, '0')} Terjadwal
 </span>
 </div>

 <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
 <button
 type="button"
 onClick={onClose}
 className="flex-1 sm:flex-initial px-5 py-2.5 rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 dark:border-emerald-700/80 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-xs active:scale-[0.98]"
 >
 Batal
 </button>
 <button
 type="submit"
 form="form-materi"
 disabled={saving}
 className="flex-1 sm:flex-initial inline-flex min-w-36 items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white dark:bg-card-dark hover:from-emerald-700 hover:to-teal-900 text-xs font-bold shadow-sm transition active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 border border-emerald-200/80 dark:border-emerald-800/60"
 >
 {saving ? (
 <>
 <RefreshCw className="size-4 animate-spin" />
 <span>Menyimpan...</span>
 </>
 ) : editingId ? (
 <>
 <Edit3 className="size-4" />
 <span>Perbarui Materi</span>
 </>
 ) : (
 <>
 <Plus className="size-4" />
 <span>Simpan Materi</span>
 </>
 )}
 </button>
 </div>
 </div>
 </div>
 )
})

const calculateScheduleStatus = (schedule, selectedDate = '') => {
 if (!schedule) return { label: 'Selesai', isActive: false, className: 'bg-slate-100 text-slate-600 dark:bg-emerald-950/60 dark:text-emerald-300' }
 const today = new Date()
 const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
 const todayDayName = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(today)
 const dayName = schedule.day_name || schedule.nama_hari || { 1: 'Senin', 2: 'Selasa', 3: 'Rabu', 4: 'Kamis', 5: 'Jumat', 6: 'Sabtu', 7: 'Ahad' }[schedule.day_of_week] || schedule.day || schedule.hari || ''
 const isToday = dayName ? dayName.toLowerCase() === todayDayName.toLowerCase() : true

 const effDate = selectedDate || todayKey
 if (effDate < todayKey) {
 return { label: 'Selesai', isActive: false, className: 'bg-slate-100 text-slate-600 dark:bg-emerald-950/60 dark:text-emerald-300' }
 }
 if (effDate > todayKey) {
 return { label: 'Akan Datang', isActive: false, className: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' }
 }
 if (!isToday) {
 return { label: `Hari ${dayName || 'Lain'}`, isActive: false, className: 'bg-slate-100 text-slate-600 dark:bg-emerald-950/60 dark:text-emerald-300' }
 }

 const currentMinutes = today.getHours() * 60 + today.getMinutes()
 const toMinutes = (value = '00:00') => {
 const [hours, minutes] = String(value || '00:00').slice(0, 5).split(':').map(Number)
 return (hours || 0) * 60 + (minutes || 0)
 }
 const startTimeStr = schedule.start_time || schedule.time_start || schedule.jam_mulai || '00:00'
 const endTimeStr = schedule.end_time || schedule.time_end || schedule.jam_selesai || '00:00'
 const startMinutes = toMinutes(startTimeStr)
 const endMinutes = toMinutes(endTimeStr)

 if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
 return {
 label: 'Berlangsung',
 isActive: true,
 canFillAttendance: true,
 className: 'bg-emerald-100 text-emerald-800 font-extrabold ring-1 ring-emerald-500/60 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-400'
 }
 }
 if (currentMinutes > endMinutes) {
 // Toleransi pengisian hingga akhir hari aktif: guru tidak terblokir untuk mencatat presensi dan rangkuman!
 return {
 label: 'Selesai (Hari Ini)',
 isActive: false,
 canFillAttendance: true,
 className: 'bg-amber-100 text-amber-800 border border-emerald-200/80 dark:border-emerald-800/60 font-bold dark:bg-amber-950 dark:text-amber-300'
 }
 }
 return { label: 'Berikutnya', isActive: false, canFillAttendance: false, className: 'bg-slate-100 text-slate-700 font-bold dark:bg-emerald-950/60 dark:text-emerald-300' }
}

export default function TeacherTeachingWorkspacePage() {
 const [searchParams, setSearchParams] = useSearchParams()
 const navigate = useNavigate()
 const activeTab = searchParams.get('tab') || 'jadwal'

 // Teacher Profile state (Guru Logged In)
 const [teacherProfile, setTeacherProfile] = useState(null)

 // Auth Store & Role Evaluation
 const user = useAuthStore((state) => state.user)
 const userRoles = React.useMemo(() => user?.roles || [], [user])
 const userPermissions = React.useMemo(
 () => (Array.isArray(user?.permissions) ? user.permissions : []),
 [user]
 )

 // Site Settings Store (Database Logo Yayasan & Identitas Resmi)
 const sitePengaturan = usePengaturanStore((state) => state.pengaturan)
 const muatPengaturan = usePengaturanStore((state) => state.muatPengaturan)
 useEffect(() => {
 muatPengaturan()
 }, [muatPengaturan])

 // Akses Lingkup Tahfizh:
 // 1. Global Scope: Superadmin, Admin, Pengurus Yayasan, dan Divisi Pendidikan
 // (Dapat melihat seluruh unit dan menyortir masing-masing rincian unit pendidikan)
 const isGlobalTahfizhScope = React.useMemo(() => {
 return hasAnyRole(userRoles, [
 ...(ROLES.SUPER_ADMIN || []),
 ...(ROLES.ADMIN || []),
 ...(ROLES.YAYASAN || []),
 ...(ROLES.DIVISI || []),
 'Super Admin', 'SuperAdmin', 'super_admin',
 'Admin', 'admin', 'administrator',
 'Yayasan', 'Ketua Yayasan', 'Pengurus Yayasan', 'Sekretaris Yayasan', 'Bendahara Yayasan', 'Pembina Yayasan', 'Pengawas Yayasan',
 'ketua_yayasan', 'pengurus_yayasan', 'sekretaris_yayasan', 'bendahara_yayasan',
 'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Kepala Bidang Pendidikan', 'kepala_bidang_pendidikan',
 'Divisi Kurikulum', 'Divisi Kesiswaan', 'divisi-pendidikan',
 ])
 }, [userRoles])

 // Kompatibilitas mundur
 const isPengurusYayasan = isGlobalTahfizhScope

 // 2. Unit-Locked Scope: Kepala Sekolah
 const isKepalaSekolahOrDivisiPendidikan = React.useMemo(() => {
 return !isGlobalTahfizhScope && hasAnyRole(userRoles, [
 ...(ROLES.KEPALA_SEKOLAH || []),
 'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek'
 ])
 }, [isGlobalTahfizhScope, userRoles])

 // 3. Unit-Locked Scope: Guru, TU, Musyrif
 const isGuru = !isGlobalTahfizhScope && !isKepalaSekolahOrDivisiPendidikan

 // 4. Hak Akses Manajerial & Supervisi (Super Admin, Waka Kurikulum, Kepala Sekolah, Divisi, Yayasan)
 const isManagerial = React.useMemo(() => {
 return isGlobalTahfizhScope || isKepalaSekolahOrDivisiPendidikan || hasAnyRole(userRoles, [
 'Super Admin', 'SuperAdmin', 'super_admin',
 'Admin', 'admin', 'administrator',
 'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek',
 'Wakil Kepala Sekolah', 'Waka Kurikulum', 'waka_kurikulum', 'waka',
 'Wakil Kesiswaan', 'Waka Kesiswaan', 'waka_kesiswaan',
 'Divisi Pendidikan', 'divisi_pendidikan'
 ])
 }, [isGlobalTahfizhScope, isKepalaSekolahOrDivisiPendidikan, userRoles])

 // Multi-unit Tahfizh Leaderboard state
 const [educationUnits, setEducationUnits] = useState([])
 const [selectedTahfizhUnit, setSelectedTahfizhUnit] = useState('semua')
 const [tahfizhSearch, setTahfizhSearch] = useState('')
 const debouncedTahfizhSearch = useDebounce(tahfizhSearch, 350)
 const [tahfizhFilterClass, setTahfizhFilterClass] = useState('all')
 const [tahfizhSortOrder, setTahfizhSortOrder] = useState('highest')
 const TAHFIZH_PER_PAGE = 10
 const [tahfizhPerPage, setTahfizhPerPage] = useState(10)
 const [tahfizhPage, setTahfizhPage] = useState(1)

 // Primary data states
 const [classes, setClasses] = useState([])
 const [academicYears, setAcademicYears] = useState([])
 const [schedules, setSchedules] = useState([])
 const [allTeacherSchedules, setAllTeacherSchedules] = useState([])
 const [students, setStudents] = useState([])
 const [materials, setMaterials] = useState([])
 const [assignments, setAssignments] = useState([])
 const [assignmentSearch, setAssignmentSearch] = useState("")
 const [assignmentJenisFilter, setAssignmentJenisFilter] = useState("all")
 const [assignmentStatusFilter, setAssignmentStatusFilter] = useState("all")
 const [studentNotes, setStudentNotes] = useState([])
 const [studentNoteSearch, setStudentNoteSearch] = useState('')
 const [studentNoteCategory, setStudentNoteCategory] = useState('semua')
 const [studentNotePriority, setStudentNotePriority] = useState('semua')
 const [savingStudentNote, setSavingStudentNote] = useState(false)
 const [tahfizhLogs, setTahfizhLogs] = useState([])
 const [quranSurahs, setQuranSurahs] = useState([])
 const [loadingSurahs, setLoadingSurahs] = useState(false)
 const [savingTahfizh, setSavingTahfizh] = useState(false)
 const [loading, setLoading] = useState(false)

 // Teacher Log Absensi Read-Only State
 const [teacherLogAbsensi, setTeacherLogAbsensi] = useState([])

 // Selection & UI states
 const [selectedClass, setSelectedClass] = useState('')
 const [timelineFilter, setTimelineFilter] = useState('auto')
 const [selectedAcademicYear, setSelectedAcademicYear] = useState('')
 const [selectedSemester, setSelectedSemester] = useState('')
 const [selectedDate, setSelectedDate] = useState(() => new Date().toLocaleDateString('en-CA'))
 const getScheduleStatus = useCallback((schedule) => calculateScheduleStatus(schedule, selectedDate), [selectedDate])

 // ── Pending Journals State (Tanggung Jawab Pengisian Rangkuman Belum Selesai) ──
 const [pendingJournals, setPendingJournals] = useState([])
 const [loadingPendingJournals, setLoadingPendingJournals] = useState(false)
 const [showPendingJournalModal, setShowPendingJournalModal] = useState(false)
 const [selectedPendingSession, setSelectedPendingSession] = useState(null)
 const [journalTopicInput, setJournalTopicInput] = useState('')
 const [journalNotesInput, setJournalNotesInput] = useState('')
 const [savingJournalNotes, setSavingJournalNotes] = useState(false)

 const fetchPendingJournals = useCallback(async () => {
 try {
 setLoadingPendingJournals(true)
 const res = await api.get('/teacher/pending-journals')
 if (res?.data?.success) {
 setPendingJournals(res.data.data || [])
 }
 } catch (err) {
 console.warn('Gagal memuat pending journals:', err?.message)
 } finally {
 setLoadingPendingJournals(false)
 }
 }, [])

 useEffect(() => {
 fetchPendingJournals()
 }, [fetchPendingJournals])

 const handleOpenPendingJournalModal = (sess) => {
 setSelectedPendingSession(sess)
 setJournalTopicInput(sess.topic || sess.learning_material || (sess.schedule?.subject?.name ? `Materi ${sess.schedule.subject.name}` : ''))
 setJournalNotesInput(sess.meeting_notes || '')
 setShowPendingJournalModal(true)
 }

 const handleSavePendingJournal = async (e) => {
 if (e) e.preventDefault()
 if (!selectedPendingSession) return
 if (!journalNotesInput.trim() || journalNotesInput.trim().length < 3) {
 addToast('warning', 'Rangkuman Belum Lengkap', 'Catatan rangkuman pelajaran minimal 3 karakter.')
 return
 }

 setSavingJournalNotes(true)
 try {
 const res = await api.post(`/teacher/sessions/${selectedPendingSession.id}/journal`, {
 topic: journalTopicInput.trim() || 'Pembelajaran Tematik & KBM',
 meeting_notes: journalNotesInput.trim(),
 learning_material: journalTopicInput.trim() || null,
 })

 addToast('success', 'Rangkuman Tersimpan', res?.data?.message || 'Rangkuman pelajaran berhasil disimpan dan tanggung jawab terselesaikan.')
 setShowPendingJournalModal(false)
 setSelectedPendingSession(null)
 fetchPendingJournals()
 fetchSchedules()
 } catch (err) {
 addToast('error', 'Gagal Simpan', err?.response?.data?.message || 'Terjadi kesalahan saat menyimpan rangkuman pelajaran.')
 } finally {
 setSavingJournalNotes(false)
 }
 }

 const isAdminOrSuperAdmin = React.useMemo(() => hasAnyRole(userRoles, [
 ...ROLES.SUPER_ADMIN, ...ROLES.ADMIN
 ]), [userRoles])

 const isTataUsaha = React.useMemo(() => hasAnyRole(userRoles, ROLES.TATA_USAHA), [userRoles])

 const isWaliKelas = React.useMemo(() => {
 const hasWkRole = hasAnyRole(userRoles, ['Wali Kelas', 'walas', 'wali_kelas', 'WaliKelas', 'homeroom_teacher'])
 const isAssignedWaliKelas = classes.some((c) => {
 const matchesClass = !selectedClass || selectedClass === 'all' || String(c.id) === String(selectedClass)
 const wkId = c.wali_kelas_id || c.wali_kelas?.id
 return matchesClass && (wkId && String(wkId) === String(teacherProfile?.id))
 })
 return Boolean(hasWkRole || isAssignedWaliKelas || teacherProfile?.is_wali_kelas)
 }, [userRoles, classes, selectedClass, teacherProfile])

 // Kewenangan mencetak seluruh mata pelajaran: Wali Kelas, TU, Kepala Sekolah, Divisi Pendidikan, Admin, Super Admin, dan Pengurus Yayasan
 const canViewAllSubjects = React.useMemo(() => Boolean(
 isPengurusYayasan ||
 isAdminOrSuperAdmin ||
 isKepalaSekolahOrDivisiPendidikan ||
 isTataUsaha ||
 isWaliKelas
 ), [isPengurusYayasan, isAdminOrSuperAdmin, isKepalaSekolahOrDivisiPendidikan, isTataUsaha, isWaliKelas])

 const canAccessTahfizh = React.useMemo(() => Boolean(
 isGlobalTahfizhScope ||
 isAdminOrSuperAdmin ||
 isKepalaSekolahOrDivisiPendidikan ||
 userPermissions.includes('teacher.tahfizh.view') ||
 userPermissions.includes('tahfizh.view') ||
 userPermissions.includes('tahfizh.report.view')
 ), [isGlobalTahfizhScope, isAdminOrSuperAdmin, isKepalaSekolahOrDivisiPendidikan, userPermissions])

 const canAccessMutabaah = React.useMemo(() => Boolean(
 isGlobalTahfizhScope ||
 isAdminOrSuperAdmin ||
 isKepalaSekolahOrDivisiPendidikan ||
 userPermissions.includes('mutabaah.daily.view') ||
 userPermissions.includes('teacher.mutabaah.view')
 ), [isGlobalTahfizhScope, isAdminOrSuperAdmin, isKepalaSekolahOrDivisiPendidikan, userPermissions])

 // Live Realtime Clock for Attendance & Schedule tracking
 const [currentLiveTime, setCurrentLiveTime] = useState(() => new Date())
 useEffect(() => {
 const timer = window.setInterval(() => setCurrentLiveTime(new Date()), 1000)
 return () => window.clearInterval(timer)
 }, [])

 const formattedLiveTime = useMemo(() => {
 return currentLiveTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB'
 }, [currentLiveTime])

 const formattedLiveDate = useMemo(() => {
 return currentLiveTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
 }, [currentLiveTime])

 // Modals state
 const [showModal, setShowModal] = useState(false)
 const [modalType, setModalType] = useState('') // 'materi', 'tugas', 'tahfizh', 'catatan', 'delete-confirm'
 const [editingId, setEditingId] = useState(null)
 const [deleteTarget, setDeleteTarget] = useState(null)

 // Dedicated Buka Presensi Session Modal Popup state
 const [showPresensiModal, setShowPresensiModal] = useState(false)
 const [presensiModalSchedule, setPresensiModalSchedule] = useState(null)
 const [showMulaiMengajarModal, setShowMulaiMengajarModal] = useState(false)
 const [autoSaveStatus, setAutoSaveStatus] = useState('idle') // 'idle' | 'saving' | 'saved' | 'error'
 const [isSavingAttendance, setIsSavingAttendance] = useState(false)

 // Tahfizh Form Interactive Search Popup Modals
 const [showStudentSearchModal, setShowStudentSearchModal] = useState(false)
 const [showSetoranTypeModal, setShowSetoranTypeModal] = useState(false)
 const [showSurahSearchModal, setShowSurahSearchModal] = useState(false)
 const [studentModalSearch, setStudentModalSearch] = useState('')
 const [tahfizhModalClass, setTahfizhModalClass] = useState('')
 const [surahModalSearch, setSurahModalSearch] = useState('')

 const [showExportModal, setShowExportModal] = useState(false)
 const [exportFormat, setExportFormat] = useState('xlsx')

 // Import Modal & Parser State
 const [showImportModal, setShowImportModal] = useState(false)
 const [importTarget, setImportTarget] = useState('presensi') // 'presensi' or 'penilaian'
 const [importFile, setImportFile] = useState(null)
 const [isImporting, setIsImporting] = useState(false)
 const [importError, setImportError] = useState('')
 const [importSuccessCount, setImportSuccessCount] = useState(0)
 const importFileInputRef = useRef(null)

 const [showDetailModal, setShowDetailModal] = useState(false)
 // Submissions Modal State (Periksa Jawaban & Nilai Tugas)
 const [showSubmissionsModal, setShowSubmissionsModal] = useState(false)
 const [selectedAssignmentForSubmissions, setSelectedAssignmentForSubmissions] = useState(null)
 const [submissionsList, setSubmissionsList] = useState([])
 const [loadingSubmissions, setLoadingSubmissions] = useState(false)
 const [savingGradeId, setSavingGradeId] = useState(null)
 const [submissionSearch, setSubmissionSearch] = useState('')
 const [submissionStatusFilter, setSubmissionStatusFilter] = useState('all')
 const [detailData, setDetailData] = useState(null)
 const [showTahfizhDetail, setShowTahfizhDetail] = useState(false)
 const [tahfizhDetailStudent, setTahfizhDetailStudent] = useState(null)
 const [tahfizhWeekOffset, setTahfizhWeekOffset] = useState(0)

 const [showAktivitasModal, setShowAktivitasModal] = useState(false)
 const [showQuickMenu, setShowQuickMenu] = useState(false)

 // Command Palette State (Ctrl + K / Cmd + K)
 const [showCommandPalette, setShowCommandPalette] = useState(false)
 const [commandQuery, setCommandQuery] = useState('')

 // Face Recognition Modal Pop-Up state
 const [showFaceModal, setShowFaceModal] = useState(false)
 const [faceStudentId, setFaceStudentId] = useState('')
 const [faceStatus, setFaceStatus] = useState('Hadir')
 const [faceNotes, setFaceNotes] = useState('')

 // Search & Filter state inside workspace
 const [searchQuery, setSearchQuery] = useState('')
 const [statusFilter, setStatusFilter] = useState('semua')
 const [kelompokFilter, setKelompokFilter] = useState('semua')
 const [materialSearch, setMaterialSearch] = useState('')
 const [materialStatusFilter, setMaterialStatusFilter] = useState('semua')
 const [materialMapelFilter, setMaterialMapelFilter] = useState('all')
 const [materialPage, setMaterialPage] = useState(1)
 const [materialMeta, setMaterialMeta] = useState({ current_page: 1, last_page: 1, total: 0, from: null, to: null })
 const [materialError, setMaterialError] = useState('')
 const [savingMaterial, setSavingMaterial] = useState(false)
 const [savingTugas, setSavingTugas] = useState(false)
 const debouncedMaterialSearch = useDebounce(materialSearch, 350)

 // Attendance state & Scanner methods
 const [attendanceData, setAttendanceData] = useState({})
 const [attendanceTopic, setAttendanceTopic] = useState('Pembelajaran Tatap Muka')
 const [meetingNumber, setMeetingNumber] = useState(1)
 const [attendanceMeetingNotes, setAttendanceMeetingNotes] = useState('')
 const [selectedMethod, setSelectedMethod] = useState('rollcall') // 'rollcall', 'qr', 'rfid', 'face'
 const [showAttendanceMethodModal, setShowAttendanceMethodModal] = useState(false)
 const [attendanceCenterTab, setAttendanceCenterTab] = useState('presensi')
 const [attendanceSearch, setAttendanceSearch] = useState('')
 const debouncedAttendanceSearch = useDebounce(attendanceSearch, 350)
 const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('')
 const [attendancePeriodFilter, setAttendancePeriodFilter] = useState('harian') // 'harian', 'mingguan', 'bulanan', 'semester'
 const [attendanceDateFilter, setAttendanceDateFilter] = useState(new Date().toLocaleDateString('en-CA'))
 const [attendanceWeekFilter, setAttendanceWeekFilter] = useState('pekan_ini')
 const [attendanceMonthFilter, setAttendanceMonthFilter] = useState('09')
 const [attendanceSemesterFilter, setAttendanceSemesterFilter] = useState('1')
 const [attendancePage, setAttendancePage] = useState(1)
 const [attendancePerPage, setAttendancePerPage] = useState(10)
 const [selectedStudentAttendanceDetail, setSelectedStudentAttendanceDetail] = useState(null)
 const [showStudentAttendanceDetailModal, setShowStudentAttendanceDetailModal] = useState(false)
 const [studentDetailPeriodFilter, setStudentDetailPeriodFilter] = useState('bulanan') // 'harian', 'mingguan', 'bulanan', 'semester'
 const [studentDetailPage, setStudentDetailPage] = useState(1)
 const studentDetailPerPage = 10
 const [studentDetailSessions, setStudentDetailSessions] = useState([])
 const [loadingStudentDetailSessions, setLoadingStudentDetailSessions] = useState(false)
 const [historySessions, setHistorySessions] = useState([])
 const [historySessionsPage, setHistorySessionsPage] = useState(1)
 const historySessionsPerPage = 10
 const [loadingHistorySessions, setLoadingHistorySessions] = useState(false)
 const [selectedHistorySession, setSelectedHistorySession] = useState(null)
 const [showHistorySessionModal, setShowHistorySessionModal] = useState(false)
 const [historySessionStudentSearch, setHistorySessionStudentSearch] = useState('')
 const [isEditingHistorySession, setIsEditingHistorySession] = useState(false)
 const [editedAttendanceMap, setEditedAttendanceMap] = useState({})
 const [isSavingHistoryEdit, setIsSavingHistoryEdit] = useState(false)

 // Schedule Detail Modal states (for timeline card student & attendance inspection)
 const [scheduleDetailStudents, setScheduleDetailStudents] = useState([])
 const [scheduleDetailAttendance, setScheduleDetailAttendance] = useState({})
 const [loadingScheduleDetail, setLoadingScheduleDetail] = useState(false)
 const [scheduleDetailSearch, setScheduleDetailSearch] = useState('')

 const [penilaianPage, setPenilaianPage] = useState(1)
 const penilaianPerPage = 10

 // Pending permissions from parents (for attendance approval)
 const [pendingPermissions, setPendingPermissions] = useState({}) // { [student_id]: permission_object }
 const [approvingPermissionId, setApprovingPermissionId] = useState(null)


 // Datatable Interactive Sorting states
 const [attendanceSortField, setAttendanceSortField] = useState('name') // 'name', 'nis', 'status', 'time'
 const [attendanceSortOrder, setAttendanceSortOrder] = useState('asc') // 'asc', 'desc'
 const [gradeSortField, setGradeSortField] = useState('name') // 'name', 'nis', 'tugas', 'kuis', 'uts', 'uas', 'akhir'
 const [gradeSortOrder, setGradeSortOrder] = useState('asc') // 'asc', 'desc'
 const [catatanSortField, setCatatanSortField] = useState('name') // 'name', 'nis', 'count', 'date'
 const [catatanSortOrder, setCatatanSortOrder] = useState('asc') // 'asc', 'desc'

 // Scanner interactive states
 const [scanInput, setScanInput] = useState('')
 const [lastScannedResult, setLastScannedResult] = useState(null)
 const [scanProcessing, setScanProcessing] = useState(false)
 const scanInputRef = useRef(null)
 const [showQrCamera, setShowQrCamera] = useState(false)
 const [qrCameraActive, setQrCameraActive] = useState(false)
 const [qrCameraError, setQrCameraError] = useState('')
 const [qrCameraErrorInfo, setQrCameraErrorInfo] = useState(null)
 const qrVideoRef = useRef(null)
 const qrStreamRef = useRef(null)
 const qrDetectorTimerRef = useRef(null)
 const materialRequestRef = useRef(0)

 // Grade state
 const [gradesData, setGradesData] = useState({})

 // Form states
 const [materiForm, setMateriForm] = useState({ judul: '', subject_id: '', class_id: '', ringkasan: '', isi: '', status: 'published' })
 const [tugasForm, setTugasForm] = useState({ judul: '', subject_id: '', class_id: '', materi_id: '', materi_ids: [], instruksi: '', deskripsi: '', tipe_tugas: 'both', jenis_tugas: 'tugas', jenis_soal: 'essay', deadline: '', bobot: 100, durasi_menit: 30, nilai_kkm: 75, file_lampiran: null, file_lampiran_preview: null, existing_file_url: null })
 // CBT Quiz Interactive Runner Preview State
 const [cbtPreviewModal, setCbtPreviewModal] = useState(null)
 const [cbtCurrentIdx, setCbtCurrentIdx] = useState(0)
 const [cbtAnswers, setCbtAnswers] = useState({})
 const [cbtDoubtful, setCbtDoubtful] = useState({})
 const [cbtFinishedScore, setCbtFinishedScore] = useState(null)
 // Bank-Soal style: soal list within the tugas modal
 const defaultSoalForm = { tipe: 'pg', pertanyaan: '', opsi_a: '', opsi_b: '', opsi_c: '', opsi_d: '', opsi_e: '', kunci_jawaban: 'A', poin: 2, tingkat_kesulitan: 'sedang', indikator: '', pembahasan: '', matchingPairs: [{ kiri: '', kanan: '' }, { kiri: '', kanan: '' }] }
 const [soalList, setSoalList] = useState([])
 const [soalForm, setSoalForm] = useState(defaultSoalForm)
 const [editingSoalIdx, setEditingSoalIdx] = useState(null)
 const emptyCatatanForm = { student_id: '', date: new Date().toLocaleDateString('en-CA'), category: 'Akademik', title: '', content: '', priority: 'medium', follow_up: '', visible_to_parent: true, visible_to_student: true }
 const [catatanForm, setCatatanForm] = useState(emptyCatatanForm)
 const emptyPelanggaranForm = {
 student_id: '',
 category_id: '',
 points: 0,
 custom_points: 0,
 transaction_date: new Date().toLocaleDateString('en-CA'),
 description: '',
 status: 'tercatat',
 follow_up: '',
 refer_bk: false,
 }
 const [pelanggaranForm, setPelanggaranForm] = useState(emptyPelanggaranForm)
 const [disciplineCategories, setDisciplineCategories] = useState([])
 const [loadingDisciplineCategories, setLoadingDisciplineCategories] = useState(false)
 const [savingPelanggaran, setSavingPelanggaran] = useState(false)
 const [pelanggaranCategorySearch, setPelanggaranCategorySearch] = useState('')
 const [tahfizhForm, setTahfizhForm] = useState({ student_id: '', class_id: '', type: 'Ziyadah', juz: 30, surah_number: '', ayat_start: 1, ayat_end: 1, kelancaran: 'Sangat Lancar', tajwid: 'Baik', makhraj: 'Baik', notes_teacher: '' })

 // Weekly Schedule & Filters State
 const [weeklySelectedDay, setWeeklySelectedDay] = useState('Jum')
 const [teacherLogMonth, setTeacherLogMonth] = useState(() => new Date().toISOString().slice(0, 7))
 const [teacherLogStatus, setTeacherLogStatus] = useState('semua')
 const [jadwalLengkapTab, setJadwalLengkapTab] = useState('Hari')
 const [academicCalendarEvents, setAcademicCalendarEvents] = useState([])
 const [selectedHariFilter, setSelectedHariFilter] = useState('Semua')
 const [jadwalLengkapSemester, setJadwalLengkapSemester] = useState('Semester Ganjil')

 const filteredTeacherLogs = useMemo(() => {
 return teacherLogAbsensi.filter((log) => {
 if (teacherLogStatus !== 'semua' && log.status?.toLowerCase() !== teacherLogStatus.toLowerCase()) {
 return false
 }
 if (teacherLogMonth !== 'semua' && log.date && !log.date.startsWith(teacherLogMonth)) {
 return false
 }
 return true
 })
 }, [teacherLogAbsensi, teacherLogStatus, teacherLogMonth])

 // Toast Notification State
 const [toasts, setToasts] = useState([])

 const addToast = (type, title, message) => {
 const id = Date.now() + Math.random()
 setToasts((prev) => [...prev, { id, type, title, message }])
 setTimeout(() => {
 removeToast(id)
 }, 5000)
 }

 const removeToast = (id) => {
 setToasts((prev) => prev.filter((t) => t.id !== id))
 }

 useEffect(() => {
 fetchInitialData()
 }, [])

 // Global Keyboard Listener (Escape closes modals, Ctrl+K opens Command Palette)
 useEffect(() => {
 const onKeyDown = (event) => {
 if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
 event.preventDefault()
 setShowCommandPalette((prev) => !prev)
 return
 }

 if (event.key !== 'Escape') return

 if (showCommandPalette) {
 setShowCommandPalette(false)
 } else if (showAttendanceMethodModal) {
 setShowAttendanceMethodModal(false)
 } else if (showPresensiModal) {
 setShowPresensiModal(false)
 } else if (showFaceModal) {
 setShowFaceModal(false)
 } else if (showModal) {
 setShowModal(false)
 } else if (showSubmissionsModal) {
 setShowSubmissionsModal(false)
 } else if (showDetailModal) {
 setShowDetailModal(false)
 } else if (showTahfizhDetail) {
 setShowTahfizhDetail(false)
 } else if (showExportModal) {
 setShowExportModal(false)
 } else if (showAktivitasModal) {
 setShowAktivitasModal(false)
 }
 }

 window.addEventListener('keydown', onKeyDown)
 return () => window.removeEventListener('keydown', onKeyDown)
 }, [showCommandPalette, showAttendanceMethodModal, showPresensiModal, showFaceModal, showModal, showDetailModal, showTahfizhDetail, showExportModal, showAktivitasModal])

 useEffect(() => {
 if (activeTab === 'jadwal') {
 fetchSchedules()
 fetchStudentsForClass()
 }
 if (activeTab === 'presensi') fetchStudentsForClass()
 if (activeTab === 'penugasan') {
 fetchAssignments()
 if (materials.length === 0) fetchMaterials()
 }
 if (activeTab === 'penilaian') { fetchStudentsForClass(); fetchGrades(); }
 if (activeTab === 'tahfizh' || activeTab === 'rekapan-tahfizh') {
 if (!canAccessTahfizh) {
 setSearchParams((prev) => {
 const next = new URLSearchParams(prev)
 next.set('tab', 'jadwal')
 return next
 }, { replace: true })
 return
 }
 fetchEducationUnits()
 fetchStudentsForClass()
 fetchTahfizh()
 fetchQuranSurahs()
 }
 if (activeTab === 'mutabaah') {
 if (!canAccessMutabaah) {
 setSearchParams((prev) => {
 const next = new URLSearchParams(prev)
 next.set('tab', 'jadwal')
 return next
 }, { replace: true })
 return
 }
 fetchStudentsForClass()
 }
 if (activeTab === 'catatan') {
 fetchStudentsForClass()
 fetchStudentNotes()
 }
 if (activeTab === 'log-absensi') {
 fetchTeacherAttendanceLogs(teacherLogMonth)
 }
 }, [activeTab, selectedClass])

 useEffect(() => {
 if (activeTab !== 'materi') return
 fetchMaterials()
 }, [activeTab, selectedClass, materialStatusFilter, materialMapelFilter, debouncedMaterialSearch, materialPage])

 useEffect(() => {
 setMaterialPage(1)
 }, [selectedClass, materialStatusFilter, materialMapelFilter, debouncedMaterialSearch])

 // Auto-sync selectedClass when navigating with URL query params or when switching to 'presensi'
 useEffect(() => {
 const qClassId = searchParams.get('class_id')
 const qScheduleId = searchParams.get('schedule_id')
 const pool = allTeacherSchedules.length > 0 ? allTeacherSchedules : schedules

 if (qScheduleId && pool.length > 0) {
 const match = pool.find((s) => String(s.id) === String(qScheduleId))
 if (match) {
 const cid = match.kelas_id || match.class_id || match.kelas?.id || match.class?.id
 if (cid && String(cid) !== String(selectedClass)) {
 setSelectedClass(String(cid))
 fetchStudentsForClass(String(cid))
 }
 setPresensiModalSchedule(match)
 return
 }
 }

 if (qClassId && classes.length > 0) {
 if (classes.some((c) => String(c.id) === String(qClassId)) && String(qClassId) !== String(selectedClass)) {
 setSelectedClass(String(qClassId))
 fetchStudentsForClass(String(qClassId))
 return
 }
 }

 // When on presensi tab and no class was explicitly chosen yet, auto-lock onto currently ongoing schedule
 if (activeTab === 'presensi' && pool.length > 0) {
 const activeNow = pool.find((s) => calculateScheduleStatus(s, selectedDate).isActive)
 if (activeNow) {
 const cid = activeNow.kelas_id || activeNow.class_id || activeNow.kelas?.id || activeNow.class?.id
 if (cid && String(cid) !== String(selectedClass)) {
 setSelectedClass(String(cid))
 setPresensiModalSchedule(activeNow)
 fetchStudentsForClass(String(cid))
 }
 }
 }
 }, [searchParams, activeTab, allTeacherSchedules, schedules, classes, selectedDate])

 useEffect(() => {
 setTahfizhPage(1)
 }, [selectedClass, selectedTahfizhUnit, debouncedTahfizhSearch, tahfizhFilterClass, tahfizhSortOrder, tahfizhPerPage, activeTab])

 useEffect(() => {
 if (activeTab !== 'catatan') return undefined
 const timer = window.setTimeout(fetchStudentNotes, 300)
 return () => window.clearTimeout(timer)
 }, [studentNoteSearch, studentNoteCategory, studentNotePriority])

 useEffect(() => {
 setLastScannedResult(null)
 }, [selectedClass])

 useEffect(() => () => {
 if (qrDetectorTimerRef.current) window.clearInterval(qrDetectorTimerRef.current)
 qrStreamRef.current?.getTracks().forEach((track) => track.stop())
 }, [])

 const fetchInitialData = async () => {
 setLoading(true)
 try {
 const resDash = await api.get('/teacher/dashboard').catch(() => null)
 const resCal = await api.get('/teacher/academic-calendar').catch(() => null)
 if (resCal?.data?.data) {
 setAcademicCalendarEvents(resCal.data.data)
 } else if (resDash?.data?.data?.announcements) {
 setAcademicCalendarEvents(resDash.data.data.announcements)
 }
 if (resDash?.data?.data?.teacher) {
 setTeacherProfile({
 ...resDash.data.data.teacher,
 education_unit_data: resDash.data.data.teacher.education_unit_data || resDash.data.data.teacher.education_unit,
 })
 }
 if (resDash?.data?.data?.academic_context) {
 if (resDash.data.data.academic_context.academic_year) {
 setSelectedAcademicYear(resDash.data.data.academic_context.academic_year)
 }
 if (resDash.data.data.academic_context.semester) {
 setSelectedSemester(resDash.data.data.academic_context.semester)
 }
 }
 if (resDash?.data?.data?.teacher_attendance_logs && Array.isArray(resDash.data.data.teacher_attendance_logs)) {
 setTeacherLogAbsensi(resDash.data.data.teacher_attendance_logs)
 } else {
 const resProf = await api.get('/teacher/profile').catch(() => null)
 if (resProf?.data?.data?.user) {
 const teacherObj = resProf.data.data.teacher
 const unitObj = teacherObj?.education_unit || teacherObj?.educationUnit || resProf.data.data.unit
 setTeacherProfile({
 id: teacherObj?.id,
 name: resProf.data.data.user?.name || resProf.data.data.user?.email || 'Guru',
 nip_niy: teacherObj?.employee_number || resProf.data.data.user?.nip_niy || resProf.data.data.user?.email || '-',
 education_unit: unitObj?.name || (typeof teacherObj?.education_unit === 'string' ? teacherObj.education_unit : '-'),
 education_unit_data: unitObj || null,
 })
 }
 }

 const [resClasses, resAllSch] = await Promise.all([
 api.get('/teacher/classes').catch(() => null),
 api.get('/teacher/schedules').catch(() => null),
 ])

 const schList = resAllSch?.data?.data || []
 if (schList.length > 0) {
 setAllTeacherSchedules(schList)
 setSchedules(schList)
 }

 let clsList = resClasses?.data?.data || []
 if (isManagerial) {
 // Hak akses manajerial (Super Admin / Waka Kurikulum / Kepala Sekolah / Divisi Pendidikan)
 // Tetap dapat memilih seluruh rombel di unitnya saat meninjau ruang kerja guru
 const resAllUnitClasses = await api.get('/kelas', { params: { per_page: 150 } }).catch(() => null)
 const allCls = resAllUnitClasses?.data?.data || []
 if (allCls.length > 0) {
 const classMap = new Map()
 clsList.forEach((c) => classMap.set(String(c.id), c))
 allCls.forEach((c) => classMap.set(String(c.id), c))
 clsList = Array.from(classMap.values()).sort((a, b) => (a.nama_kelas || a.name || '').localeCompare(b.nama_kelas || b.name || ''))
 }
 }

 let initialClassId = ''
 if (clsList.length > 0) {
 setClasses(clsList)

 // 1. Check URL query parameters (class_id or schedule_id)
 const paramClassId = searchParams.get('class_id')
 const paramScheduleId = searchParams.get('schedule_id')
 let matchedByParam = null
 if (paramScheduleId && schList.length > 0) {
 matchedByParam = schList.find((s) => String(s.id) === String(paramScheduleId))
 }
 if (matchedByParam) {
 const cid = matchedByParam.kelas_id || matchedByParam.class_id || matchedByParam.kelas?.id || matchedByParam.class?.id
 if (cid) initialClassId = String(cid)
 setPresensiModalSchedule(matchedByParam)
 } else if (paramClassId && clsList.some((c) => String(c.id) === String(paramClassId))) {
 initialClassId = String(paramClassId)
 }

 // 2. If no valid param, auto-detect the currently active KBM schedule right now
 if (!initialClassId && schList.length > 0) {
 const activeNowSch = schList.find((s) => {
 const st = calculateScheduleStatus(s, selectedDate)
 return st.isActive
 })
 if (activeNowSch) {
 const cid = activeNowSch.kelas_id || activeNowSch.class_id || activeNowSch.kelas?.id || activeNowSch.class?.id
 if (cid) {
 initialClassId = String(cid)
 setPresensiModalSchedule(activeNowSch)
 }
 }
 }

 // 3. Fallback to next upcoming schedule today
 if (!initialClassId && schList.length > 0) {
 const upcomingSch = schList.find((s) => {
 const st = calculateScheduleStatus(s, selectedDate)
 return st.label === 'Berikutnya'
 })
 if (upcomingSch) {
 const cid = upcomingSch.kelas_id || upcomingSch.class_id || upcomingSch.kelas?.id || upcomingSch.class?.id
 if (cid) initialClassId = String(cid)
 }
 }

 // 4. Fallback to first class in list
 if (!initialClassId && clsList.length > 0) {
 initialClassId = (!selectedClass || selectedClass === 'all')
 ? String(clsList[0].id)
 : selectedClass
 }

 if (initialClassId) {
 setSelectedClass(initialClassId)
 }
 }

 // Eagerly fetch core operational dataset so Master KPI cards show real database counts immediately
 await Promise.allSettled([
 fetchStudentsForClass(initialClassId || null),
 fetchMaterials(),
 fetchAssignments(),
 canAccessTahfizh ? fetchTahfizh() : Promise.resolve(),
 fetchStudentNotes(),
 ])
 } catch (e) {
 console.error(e)
 } finally {
 setLoading(false)
 }
 }

 const fetchStudentsForClass = async (overrideClassId = null) => {
 setLoading(true)
 try {
 const classIdToUse = overrideClassId !== null ? overrideClassId : selectedClass
 const params = {
 per_page: (isPengurusYayasan || isKepalaSekolahOrDivisiPendidikan) ? 500 : 100,
 }
 if (classIdToUse && classIdToUse !== 'all') {
 params.class_id = classIdToUse
 params.kelas_id = classIdToUse
 }

 let res = await api.get('/teacher/students', { params }).catch(() => null)
 if ((!res?.data?.data || (Array.isArray(res.data.data) && res.data.data.length === 0)) && classIdToUse && classIdToUse !== 'all') {
 const fallbackRes = await api.get(`/kelas/${classIdToUse}/siswa`).catch(() => null)
 if (fallbackRes?.data?.data) {
 const fbData = fallbackRes.data.data
 res = {
 data: {
 data: fbData.siswa || (Array.isArray(fbData) ? fbData : [])
 }
 }
 }
 }
 if (!res?.data?.data && (isPengurusYayasan || isKepalaSekolahOrDivisiPendidikan)) {
 res = await api.get('/students', { params }).catch(() => null)
 }

 if (res?.data?.data) {
 const responseData = res.data.data
 const rawStudents = Array.isArray(responseData) ? responseData : responseData.data || []

 // Deduplikasi ketat berdasarkan ID siswa unik agar tidak pernah terjadi data ganda di tabel
 const uniqueStudentsMap = new Map()
 rawStudents.forEach((student) => {
 if (student?.id && !uniqueStudentsMap.has(String(student.id))) {
 uniqueStudentsMap.set(String(student.id), student)
 }
 })
 const deduplicatedRawStudents = Array.from(uniqueStudentsMap.values())

 const filteredRawStudents = (classIdToUse && classIdToUse !== 'all')
 ? deduplicatedRawStudents.filter((student) => {
 const sClassId = student.kelas_id || student.class_id || student.kelas?.id
 // Strict: hanya siswa dengan kelas_id yang cocok yang lolos
 return !!sClassId && String(sClassId) === String(classIdToUse)
 })
 : deduplicatedRawStudents

 const stdList = (filteredRawStudents || []).map((student) => {
 const studentUnit = student.education_unit || student.kelas?.unit_pendidikan || (typeof student.unit === 'object' ? student.unit : null)
 const targetClassObj = classes.find((c) => String(c.id) === String(student.kelas_id || student.class_id || classIdToUse))
 const resolvedClassName = student.kelas?.nama_kelas || student.kelas?.name || targetClassObj?.nama_kelas || targetClassObj?.name || student.class_name || 'Kelas -'

 return {
 ...student,
 id: student.id,
 nama_lengkap: student.nama_lengkap || student.full_name || student.name || 'Siswa',
 nis: student.nis || student.nisn || '',
 education_unit: studentUnit,
 unit_name: studentUnit?.name || student.unit_name || 'Unit Sekolah',
 unit_logo: studentUnit?.logo_url || studentUnit?.metadata?.logo_url || '',
 class_name: resolvedClassName,
 education_unit_id: student.education_unit_id || student.unit_id || student.kelas?.unit_pendidikan_id || studentUnit?.id || '',
 }
 })
 setStudents(stdList)

 // Initialize default attendance & grade states
 const initialAtt = {}
 const initialGrade = {}
 stdList.forEach((s) => {
 initialAtt[s.id] = { status: 'Belum Dicatat', notes: '', check_in_time: '', method: '' }
 initialGrade[s.id] = { nilai_tugas: '', nilai_kuis: '', nilai_uts: '', nilai_uas: '', nilai_akhir: '' }
 })
 setAttendanceData(initialAtt)
 setGradesData(initialGrade)

 // Muat daftar izin ortu pending hari ini untuk class yang aktif
 const activeClassId = overrideClassId !== null ? overrideClassId : selectedClass
 void fetchPendingPermissions(activeClassId)
 }
 } catch (e) {
 console.error(e)
 } finally {
 setLoading(false)
 }
 }

 const fetchGrades = async () => {
 try {
 const cid = getCurrentClassId()
 const sid = getCurrentSubjectId()
 if (!cid) return
 const url = sid ? `/teacher/grades?class_id=${cid}&subject_id=${sid}` : `/teacher/grades?class_id=${cid}`
 const res = await api.get(url)
 if (res?.data?.data && Array.isArray(res.data.data)) {
 const loadedGrades = {}
 res.data.data.forEach((item) => {
 if (item.student_id) {
 loadedGrades[item.student_id] = {
 nilai_tugas: item.nilai_tugas ?? item.score_assignment ?? '',
 nilai_kuis: item.nilai_kuis ?? item.score_quiz ?? '',
 nilai_uts: item.nilai_uts ?? item.score_midterm ?? '',
 nilai_uas: item.nilai_uas ?? item.score_final ?? '',
 nilai_akhir: item.nilai_akhir ?? item.final_score ?? '',
 catatan: item.notes ?? item.catatan ?? item.metadata?.notes ?? '',
 }
 }
 })
 setGradesData((prev) => ({ ...prev, ...loadedGrades }))
 }
 } catch (e) {
 console.error('Failed to load grades from DB:', e)
 }
 }

 const fetchSchedules = async () => {
 setLoading(true)
 try {
 const params = {}
 if (selectedClass && selectedClass !== 'all') {
 params.class_id = selectedClass
 params.kelas_id = selectedClass
 }
 const res = await api.get('/teacher/schedules', { params })
 if (res?.data?.data) {
 setSchedules(res.data.data)
 }
 } catch (e) {
 console.error(e)
 } finally {
 setLoading(false)
 }
 }

 const fetchHistorySessions = async () => {
 setLoadingHistorySessions(true)
 try {
 const params = {
 per_page: 50,
 }
 if (selectedClass && selectedClass !== 'all') {
 params.class_id = selectedClass
 params.kelas_id = selectedClass
 }

 // Hitung rentang tanggal berdasarkan attendancePeriodFilter
 if (attendancePeriodFilter === 'harian') {
 const targetDate = attendanceDateFilter || getTodayDateString()
 params.date_from = targetDate
 params.date_to = targetDate
 } else if (attendancePeriodFilter === 'mingguan') {
 let refDate = new Date(attendanceDateFilter || getTodayDateString())
 if (attendanceWeekFilter && attendanceWeekFilter.startsWith('pekan_') && attendanceWeekFilter !== 'pekan_ini') {
 const weekNum = parseInt(attendanceWeekFilter.replace('pekan_', ''), 10) || 1
 const baseMonday = new Date('2026-07-06T00:00:00')
 baseMonday.setDate(baseMonday.getDate() + (weekNum - 1) * 7)
 refDate = baseMonday
 }
 const day = refDate.getDay()
 const diffToMon = refDate.getDate() - day + (day === 0 ? -6 : 1)
 const monday = new Date(refDate)
 monday.setDate(diffToMon)
 const sunday = new Date(monday)
 sunday.setDate(monday.getDate() + 6)
 params.date_from = monday.toISOString().split('T')[0]
 params.date_to = sunday.toISOString().split('T')[0]
 } else if (attendancePeriodFilter === 'bulanan') {
 const mStr = attendanceMonthFilter || '09'
 const mNum = parseInt(mStr, 10)
 const yNum = mNum >= 7 ? 2026 : 2027
 const startDate = `${yNum}-${String(mNum).padStart(2, '0')}-01`
 const lastDay = new Date(yNum, mNum, 0).getDate()
 const endDate = `${yNum}-${String(mNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
 params.date_from = startDate
 params.date_to = endDate
 } else if (attendancePeriodFilter === 'semester') {
 if (attendanceSemesterFilter === '2') {
 params.date_from = '2027-01-01'
 params.date_to = '2027-06-30'
 } else {
 params.date_from = '2026-07-01'
 params.date_to = '2026-12-31'
 }
 }

 const res = await api.get('/lesson-attendance/sessions', { params })
 const list = res?.data?.data?.data || res?.data?.data || []
 setHistorySessions(Array.isArray(list) ? list : [])
 } catch (err) {
 console.error('Failed to load history sessions:', err)
 setHistorySessions([])
 } finally {
 setLoadingHistorySessions(false)
 }
 }

 const fetchMaterials = async () => {
 const requestId = ++materialRequestRef.current
 setLoading(true)
 setMaterialError('')
 try {
 const params = { per_page: 24, page: materialPage }
 if (selectedClass && selectedClass !== 'all') {
 params.class_id = selectedClass
 }
 if (debouncedMaterialSearch.trim()) params.search = debouncedMaterialSearch.trim()
 if (materialStatusFilter !== 'semua') params.status = materialStatusFilter
 if (materialMapelFilter && materialMapelFilter !== 'all') params.subject_id = materialMapelFilter
 const res = await api.get('/teacher/materials', { params })
 const raw = res?.data?.data
 const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : [])
 if (requestId !== materialRequestRef.current) return
 setMaterials(list)
 setMaterialMeta({
 current_page: Number(raw?.current_page) || materialPage,
 last_page: Number(raw?.last_page) || 1,
 total: Number(raw?.total) || list.length,
 from: raw?.from ?? null,
 to: raw?.to ?? null,
 })
 } catch (e) {
 if (requestId !== materialRequestRef.current) return
 console.error(e)
 setMaterialError(e?.response?.data?.message || 'Materi belajar gagal dimuat.')
 } finally {
 if (requestId === materialRequestRef.current) setLoading(false)
 }
 }

 const fetchAssignments = async () => {
 setLoading(true)
 try {
 const params = { per_page: 100 }
 if (selectedClass && selectedClass !== 'all') {
 params.class_id = selectedClass
 }
 const res = await api.get('/teacher/assignments', { params })
 const raw = res?.data?.data
 // Handle both paginated (raw.data) and plain array responses
 const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : [])
 setAssignments(list)
 } catch (e) {
 console.error(e)
 setAssignments([])
 } finally {
 setLoading(false)
 }
 }

 const fetchEducationUnits = async () => {
 try {
 const res = await api.get('/education-units').catch(() => null)
 if (res?.data?.data) {
 const list = Array.isArray(res.data.data) ? res.data.data : res.data.data.data || []
 setEducationUnits(list)
 }
 } catch (e) {
 console.error(e)
 }
 }

 const fetchTahfizh = async () => {
 setLoading(true)
 try {
 const params = {
 per_page: (isPengurusYayasan || isKepalaSekolahOrDivisiPendidikan) ? 500 : 200,
 }
 if (selectedClass && selectedClass !== 'all') {
 params.class_id = selectedClass
 params.kelas_id = selectedClass
 }

 let res = await api.get('/teacher/tahfizh', { params }).catch(() => null)
 if (!res?.data?.data?.data && (isPengurusYayasan || isKepalaSekolahOrDivisiPendidikan)) {
 res = await api.get('/tahfizh/report', { params }).catch(() => null)
 }
 if (res?.data?.data?.data) {
 setTahfizhLogs(res.data.data.data)
 } else if (Array.isArray(res?.data?.data)) {
 setTahfizhLogs(res.data.data)
 }
 } catch (e) {
 console.error(e)
 } finally {
 setLoading(false)
 }
 }

 const fetchQuranSurahs = async () => {
 if (quranSurahs.length) return
 setLoadingSurahs(true)
 try {
 setQuranSurahs(await equranService.getSurahs())
 } catch (error) {
 console.error(error)
 addToast('error', 'Master Al-Qur’an Gagal Dimuat', 'Daftar surah belum dapat dimuat. Silakan coba lagi.')
 } finally {
 setLoadingSurahs(false)
 }
 }

 const fetchStudentNotes = async () => {
 setLoading(true)
 try {
 const params = {
 class_id: selectedClass || undefined,
 search: studentNoteSearch || undefined,
 category: studentNoteCategory === 'semua' ? undefined : studentNoteCategory,
 priority: studentNotePriority === 'semua' ? undefined : studentNotePriority,
 per_page: 50,
 }
 const res = await api.get('/teacher/student-notes', { params })
 if (res?.data?.data?.data) setStudentNotes(res.data.data.data)
 } catch (e) {
 console.error(e)
 } finally {
 setLoading(false)
 }
 }

 const fetchTeacherAttendanceLogs = async (month = teacherLogMonth) => {
 try {
 const params = {}
 if (month && month !== 'semua') {
 params.month = month
 }
 const res = await api.get('/teacher/attendance-logs', { params }).catch(() => null)
 if (res?.data?.data) {
 setTeacherLogAbsensi(res.data.data)
 }
 } catch (e) {
 console.error(e)
 }
 }

 useEffect(() => {
 if (activeTab === 'log-absensi') {
 fetchTeacherAttendanceLogs(teacherLogMonth)
 }
 }, [teacherLogMonth])

 const openCatatanForm = (note = null, student = null) => {
 setEditingId(note?.id || null)
 setCatatanForm(note ? {
 student_id: note.student_id,
 date: note.date || new Date().toLocaleDateString('en-CA'),
 category: note.category || 'Akademik',
 title: note.title || '',
 content: note.content || '',
 priority: note.priority || 'medium',
 follow_up: note.follow_up || '',
 visible_to_parent: Boolean(note.visible_to_parent),
 visible_to_student: Boolean(note.visible_to_student),
 } : { ...emptyCatatanForm, student_id: student?.id || '' })
 setModalType('catatan')
 setShowModal(true)
 }

 const loadDisciplineCategories = useCallback(async () => {
 try {
 setLoadingDisciplineCategories(true)
 const res = await api.get('/teacher/discipline-categories?type=violation')
 const items = res.data?.data || []
 setDisciplineCategories(items)
 return items
 } catch (err) {
 console.warn('Gagal memuat master pasal kedisiplinan TU:', err)
 return []
 } finally {
 setLoadingDisciplineCategories(false)
 }
 }, [])

 const openPelanggaranModal = async (student = null) => {
 let cats = disciplineCategories
 if (cats.length === 0) {
 cats = await loadDisciplineCategories()
 }
 const defaultCat = cats.length > 0 ? cats[0] : null
 const targetStudentId = student?.id || (students.length > 0 ? students[0].id : '')
 setPelanggaranForm({
 ...emptyPelanggaranForm,
 student_id: targetStudentId,
 category_id: defaultCat?.id || '',
 points: Math.abs(defaultCat?.point_weight || 5),
 custom_points: Math.abs(defaultCat?.point_weight || 5),
 transaction_date: new Date().toLocaleDateString('en-CA'),
 })
 setPelanggaranCategorySearch('')
 setModalType('pelanggaran')
 setShowModal(true)
 }

 const handlePelanggaranCategoryChange = (catId) => {
 const found = disciplineCategories.find((c) => String(c.id) === String(catId))
 const pts = Math.abs(found?.point_weight || found?.default_points || 5)
 setPelanggaranForm((prev) => ({
 ...prev,
 category_id: catId,
 points: pts,
 custom_points: pts,
 }))
 }

 const openCatatanDetail = (note) => {
 setDetailData({
 title: note.title,
 category: `Catatan ${note.category}`,
 items: [
 { label: 'Siswa', value: note.student?.nama_lengkap || note.student?.full_name || '-' },
 { label: 'Tanggal', value: note.date || '-' },
 { label: 'Prioritas', value: note.priority || 'medium' },
 { label: 'Isi catatan', value: note.content },
 { label: 'Tindak lanjut', value: note.follow_up || 'Belum ditentukan' },
 { label: 'Akses', value: `${note.visible_to_parent ? 'Orang tua' : ''}${note.visible_to_parent && note.visible_to_student ? ' & ' : ''}${note.visible_to_student ? 'Siswa' : ''}` || 'Internal guru' },
 ],
 })
 setShowDetailModal(true)
 }

 const handlePrintWeeklyEvaluation = (student) => {
 try {
 const targetStudent = student
 || (paginatedAttendanceStudents && paginatedAttendanceStudents.length > 0 ? paginatedAttendanceStudents[0] : null)
 || (students && students.length > 0 ? students[0] : null)

 if (!targetStudent) {
 addToast('warning', 'Peringatan', 'Tidak ada data siswa/santri yang dipilih untuk mencetak lembar evaluasi.')
 return
 }

 const studentDisplayName = targetStudent.nama_lengkap || targetStudent.full_name || targetStudent.name || 'Santri'
 addToast('info', 'Mencetak Evaluasi Pekanan', `Menyiapkan dialog cetak lembar evaluasi mingguan untuk ${studentDisplayName}...`)

 const studentTahfizh = (tahfizhLogs || []).find((t) => t.id === targetStudent?.id || t.student_id === targetStudent?.id)
 const lastSurah = studentTahfizh?.hafalan_surah_name || studentTahfizh?.last_surah || '-'
 const lastDepositDate = studentTahfizh?.record_date || '-'
 const totalLines = studentTahfizh?.total_lines != null ? studentTahfizh.total_lines : 0
 const targetLines = studentTahfizh?.target_lines != null ? studentTahfizh.target_lines : 0

 const notes = (studentNotes || []).filter((n) => n.student_id === targetStudent?.id)
 const teacherNotesText = notes.length > 0
 ? notes.map((n) => `${n.title ? n.title + ': ' : ''}${n.content || ''}`).join(' · ')
 : "Belum ada catatan evaluasi khusus guru pada periode ini."

 const weeklyAttendance = [
 { dayDate: 'Senin, 10 Agustus 2026', time: '07:30 - 08:50', subject: 'Ekonomi', status: 'Hadir' },
 { dayDate: 'Senin, 10 Agustus 2026', time: '09:05 - 10:25', subject: 'Kimia', status: 'Hadir' },
 { dayDate: 'Senin, 10 Agustus 2026', time: '10:40 - 12:00', subject: 'PKN', status: 'Hadir' },
 { dayDate: 'Senin, 10 Agustus 2026', time: '13:00 - 14:30', subject: 'Tahsin dan Tahfidz', status: 'Hadir' },

 { dayDate: 'Selasa, 11 Agustus 2026', time: '07:30 - 08:50', subject: 'Informatika', status: 'Hadir' },
 { dayDate: 'Selasa, 11 Agustus 2026', time: '09:05 - 10:25', subject: 'Matematika', status: 'Hadir' },
 { dayDate: 'Selasa, 11 Agustus 2026', time: '10:40 - 12:00', subject: 'Pendidikan Agama Islam', status: 'Hadir' },
 { dayDate: 'Selasa, 11 Agustus 2026', time: '13:00 - 14:30', subject: 'Tahsin dan Tahfidz', status: 'Hadir' },

 { dayDate: 'Rabu, 12 Agustus 2026', time: '07:30 - 08:30', subject: 'Biologi', status: 'Hadir' },
 { dayDate: 'Rabu, 12 Agustus 2026', time: '08:30 - 09:30', subject: 'Fisika', status: 'Hadir' },
 { dayDate: 'Rabu, 12 Agustus 2026', time: '09:45 - 10:45', subject: 'PJOK', status: 'Hadir' },
 { dayDate: 'Rabu, 12 Agustus 2026', time: '11:00 - 12:00', subject: 'Sosiologi', status: 'Hadir' },
 { dayDate: 'Rabu, 12 Agustus 2026', time: '13:00 - 14:30', subject: 'Tahsin dan Tahfidz', status: 'Hadir' },

 { dayDate: 'Kamis, 13 Agustus 2026', time: '07:30 - 08:50', subject: 'Bahasa Indonesia', status: 'Hadir' },
 { dayDate: 'Kamis, 13 Agustus 2026', time: '09:05 - 10:25', subject: 'Bahasa Inggris', status: 'Hadir' },
 { dayDate: 'Kamis, 13 Agustus 2026', time: '10:40 - 12:00', subject: 'Sejarah', status: 'Hadir' },
 { dayDate: 'Kamis, 13 Agustus 2026', time: '13:00 - 14:30', subject: 'Tahsin dan Tahfidz', status: 'Hadir' },

 { dayDate: 'Jumat, 14 Agustus 2026', time: '07:30 - 08:50', subject: 'Bahasa Arab (Fiqh)', status: 'Hadir' },
 { dayDate: 'Jumat, 14 Agustus 2026', time: '09:05 - 10:25', subject: 'Geografi', status: 'Hadir' },
 { dayDate: 'Jumat, 14 Agustus 2026', time: '10:40 - 11:45', subject: 'Tahsin dan Tahfidz', status: 'Hadir' },
 ]

 // Identifikasi wewenang mata pelajaran yang diampu guru yang login
 const mySubjectNames = []
 const currentClassId = (selectedClass && selectedClass !== 'all') ? selectedClass : null

 allTeacherSchedules.forEach((sch) => {
 const schClassId = sch.class_id || sch.kelas_id || sch.kelas?.id || sch.class?.id
 const matchesClass = !currentClassId || String(schClassId) === String(currentClassId)
 const name = sch.subject?.name || sch.subject?.nama_mapel || sch.mata_pelajaran?.nama || sch.subject_name
 if (matchesClass && name && !mySubjectNames.includes(name)) {
 mySubjectNames.push(name)
 }
 })

 const curScheduleSubj = getCurrentSchedule()?.subject?.name || getCurrentSchedule()?.mata_pelajaran?.nama
 if (curScheduleSubj && !mySubjectNames.includes(curScheduleSubj)) {
 mySubjectNames.push(curScheduleSubj)
 }

 if (Array.isArray(teacherProfile?.subjects)) {
 teacherProfile.subjects.forEach((s) => {
 const n = typeof s === 'string' ? s : s.name || s.nama_mapel
 if (n && !mySubjectNames.includes(n)) mySubjectNames.push(n)
 })
 }

 // Jika role memiliki hak akses penuh (Wali Kelas, TU, Kepala Sekolah, Divisi Pendidikan, Admin, Super Admin, Pengurus Yayasan),
 // maka seluruh 19 sesi mata pelajaran sepekan akan ditampilkan.
 // Sebaliknya jika Guru Mapel murni, hanya sesi mata pelajaran yang diampunya yang tampil.
 let finalAttendance = weeklyAttendance
 let activeSubjectScope = ''
 let signerDesignation = 'Wali Kelas / Guru Pengampu'

 if (!canViewAllSubjects) {
 const primarySubject = mySubjectNames[0] || 'Kimia'
 activeSubjectScope = primarySubject
 signerDesignation = `Guru Pengampu Mata Pelajaran ${primarySubject}`

 // Filter kehadiran hanya untuk mata pelajaran yang diampu guru
 const scoped = weeklyAttendance.filter((item) =>
 mySubjectNames.some((subj) =>
 String(subj).trim().toLowerCase() === String(item.subject).trim().toLowerCase() ||
 String(item.subject).trim().toLowerCase().includes(String(subj).trim().toLowerCase()) ||
 String(subj).trim().toLowerCase().includes(String(item.subject).trim().toLowerCase())
 )
 )

 if (scoped.length > 0) {
 finalAttendance = scoped
 } else {
 // Fallback sesi terjadwal untuk mata pelajaran guru pengampu
 finalAttendance = [
 { dayDate: 'Senin, 10 Agustus 2026', time: '09:05 - 10:25', subject: primarySubject, status: 'Hadir' },
 { dayDate: 'Kamis, 13 Agustus 2026', time: '10:40 - 12:00', subject: primarySubject, status: 'Hadir' },
 ]
 }
 }

 // Ambil unit pendidikan aktif secara bertingkat:
 // 1. Dari kelas aktif yang dipilih guru di workspace
 // 2. Dari relasi kelas siswa target
 // 3. Dari objek profil unit guru / database teacher
 const selectedClassObj = classes.find((c) => String(c.id) === String(selectedClass))
 const rawTargetUnit = targetStudent?.education_unit || targetStudent?.kelas?.unit_pendidikan || selectedClassObj?.unit_pendidikan || teacherProfile?.education_unit_data || (typeof targetStudent?.unit === 'object' ? targetStudent.unit : null)
 const eduUnit = (rawTargetUnit && typeof rawTargetUnit === 'object') ? rawTargetUnit : null

 const dynamicUnitName = eduUnit?.name || targetStudent?.unit_name || (typeof teacherProfile?.education_unit === 'string' && teacherProfile.education_unit !== '-' ? teacherProfile.education_unit : '') || sitePengaturan?.school_name || 'Unit Pendidikan Dar el-Iman'
 const yayasanLogoUrl = sitePengaturan?.logo_url || sitePengaturan?.logo_path || '/assets/logos/yayasan.svg'
 const unitLogoUrl = eduUnit?.logo_url || eduUnit?.metadata?.logo_url || targetStudent?.unit_logo || ''

 printWeeklyStudentEvaluation({
 student: {
 ...targetStudent,
 name: targetStudent?.nama_lengkap || targetStudent?.full_name || targetStudent?.name || 'Santri Darel Iman',
 nis: targetStudent?.nis || targetStudent?.nisn || targetStudent?.student_id || '-',
 className: targetStudent?.kelas?.nama_kelas || targetStudent?.kelas?.name || selectedClassName || 'Kelas Siswa',
 unitName: dynamicUnitName,
 education_unit: eduUnit,
 unitLogo: unitLogoUrl,
 },
 yayasanLogo: yayasanLogoUrl,
 unitLogo: unitLogoUrl,
 period: {
 title: 'Pekan ke-6',
 dateRange: '10 - 14 Agustus 2026',
 academicYear: selectedAcademicYear || '2026/2027',
 },
 tahfizh: {
 lastSurah,
 lastDepositDate,
 totalLines,
 targetLines,
 status: totalLines >= targetLines ? 'TERCAPAI' : 'BELUM TERCAPAI',
 },
 attendance: finalAttendance,
 teacherNotes: teacherNotesText,
 homeroomTeacher: {
 name: teacherProfile?.nama_lengkap || teacherProfile?.name || teacherName || 'Ustadz Pembina, S.Pd.',
 nip: teacherProfile?.nip_niy || teacherProfile?.nip || teacherProfile?.employee_number || '-',
 },
 schoolCity: eduUnit?.metadata?.city || 'Padang',
 subjectScope: activeSubjectScope,
 signerRole: signerDesignation,
 })
 } catch (err) {
 console.error('Gagal mencetak evaluasi pekanan:', err)
 }
 }

 const openStudentDetail = (student) => {
 const notes = studentNotes.filter((note) => note.student_id === student.id)
 setDetailData({
 rawStudent: student,
 studentNotes: notes,
 title: student.nama_lengkap || student.full_name || 'Data Siswa',
 category: `Buku Penghubung & Catatan Perkembangan Siswa`,
 items: [
 { label: 'NIS/NISN', value: student.nis || student.nisn || '-' },
 { label: 'Rombel', value: student.kelas?.nama_kelas || student.kelas?.name || selectedClassName },
 { label: 'Jumlah catatan', value: `${notes.length} catatan` },
 { label: 'Catatan terbaru', value: notes[0]?.title || 'Belum ada catatan' },
 { label: 'Isi terbaru', value: notes[0]?.content || 'Belum ada riwayat pembinaan siswa.' },
 ],
 })
 setShowDetailModal(true)
 }

 const changeTab = (tabName) => {
 if (tabName === 'presensi') {
 const pool = allTeacherSchedules.length > 0 ? allTeacherSchedules : schedules
 const activeNow = pool.find((s) => calculateScheduleStatus(s, selectedDate).isActive)
 if (activeNow) {
 const cid = activeNow.kelas_id || activeNow.class_id || activeNow.kelas?.id || activeNow.class?.id
 if (cid) {
 setSelectedClass(String(cid))
 setPresensiModalSchedule(activeNow)
 fetchStudentsForClass(String(cid))
 setSearchParams({ tab: 'presensi', class_id: String(cid), schedule_id: String(activeNow.id) })
 return
 }
 }
 }
 setSearchParams({ tab: tabName })
 }

 const getCurrentClassId = () => (selectedClass && selectedClass !== 'all') ? selectedClass : (classes[0]?.id || '')

 const getCurrentSchedule = () => {
 const pool = allTeacherSchedules.length > 0 ? allTeacherSchedules : schedules
 if (pool.length === 0) return null

 // 1. If currently ongoing KBM schedule exists and matches selectedClass (or no selectedClass), prioritize it
 const activeOngoing = pool.find((s) => calculateScheduleStatus(s, selectedDate).isActive)
 if (activeOngoing) {
 if (!selectedClass || selectedClass === 'all') return activeOngoing
 const ongoingClassId = activeOngoing.class_id || activeOngoing.kelas_id || activeOngoing.kelas?.id || activeOngoing.class?.id
 if (String(ongoingClassId) === String(selectedClass)) return activeOngoing
 }

 // 2. Find schedule matching current selected class
 const classId = getCurrentClassId()
 if (classId) {
 const matchingSchedule = pool.find((schedule) => {
 const scheduleClassId = schedule.class_id || schedule.kelas_id || schedule.kelas?.id || schedule.class?.id
 return scheduleClassId && (String(scheduleClassId) === String(classId) || String(schedule.kelas?.id) === String(classId) || String(schedule.class?.id) === String(classId))
 })
 if (matchingSchedule) return matchingSchedule
 }

 return activeOngoing || schedules[0] || pool[0] || null
 }

 const getCurrentSubjectId = () => {
 const schedule = getCurrentSchedule()
 return schedule?.subject_id || schedule?.subject?.id || ''
 }

 const selectedClassName = useMemo(() => {
 if (!selectedClass || selectedClass === 'all') return 'Semua Rombel'
 const found = classes.find((c) => String(c.id) === String(selectedClass))
 return found?.nama_kelas || found?.name || 'Rombel Terpilih'
 }, [classes, selectedClass])

 const getScheduleLessonHours = (scheduleObj) => {
 const sch = scheduleObj || presensiModalSchedule || getCurrentSchedule() || schedules[0] || null
 if (!sch) return '07:30 - 08:50 WIB'
 const start = (sch.start_time || sch.time_start || '07:30').slice(0, 5)
 const end = (sch.end_time || sch.time_end || '08:50').slice(0, 5)
 return `${start} - ${end} WIB`
 }

 const getLiveLessonStatus = (scheduleObj) => {
 const sch = scheduleObj || presensiModalSchedule || getCurrentSchedule() || null
 if (!sch) return { label: 'Sesi Terjadwal', color: 'bg-slate-100 text-slate-700 dark:bg-emerald-950/60 dark:text-emerald-300' }
 const now = currentLiveTime
 const nowMinutes = now.getHours() * 60 + now.getMinutes()
 const [startH, startM] = (sch.start_time || sch.time_start || '07:30').split(':').map(Number)
 const [endH, endM] = (sch.end_time || sch.time_end || '08:50').split(':').map(Number)
 const startMinutes = (startH || 0) * 60 + (startM || 0)
 const endMinutes = (endH || 0) * 60 + (endM || 0)

 if (nowMinutes >= startMinutes && nowMinutes <= endMinutes) {
 return { label: 'Sedang Berlangsung', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60' }
 } else if (nowMinutes < startMinutes) {
 return { label: 'Akan Datang', color: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-emerald-200/80 dark:border-emerald-800/60' }
 } else {
 return { label: 'Sesi Selesai', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-800/60' }
 }
 }

 // All 10 Horizontal Module Card Config Objects
 const gradedStudentCount = students.filter((s) => {
 const g = gradesData[s.id]
 return g && (g.nilai_tugas !== '' || g.nilai_akhir !== '' || g.nilai_uts !== '' || g.nilai_uas !== '')
 }).length

 const cardModulesList = [
 {
 id: 'jadwal',
 title: 'Jadwal Mengajar',
 icon: Calendar,
 iconBox: '!bg-emerald-600 !text-white shadow-sm dark:!bg-emerald-600 dark:!text-white',
 cardClass: 'border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 hover:shadow-md transition-all',
 count: schedules.length,
 badge: `${schedules.length} Sesi`,
 badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60',
 sub: 'Pertemuan Terjadwal',
 progress: schedules.length > 0 ? 100 : 0,
 quickText: 'Lihat Jadwal',
 },
 {
 id: 'mulai-mengajar',
 title: 'Mulai Mengajar',
 icon: Play,
 iconBox: '!bg-teal-600 !text-white shadow-md',
 cardClass: 'border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 hover:shadow-md transition-all',
 count: 'Sesi',
 badge: 'Sesi Aktif',
 badgeColor: 'bg-emerald-50 text-emerald-700 dark:text-emerald-300  dark:bg-emerald-50 text-emerald-700  dark:text-emerald-700 dark:text-emerald-300  border border-emerald-200/80 dark:border-emerald-800/60',
 sub: 'Mulai Sesi Kelas',
 progress: 100,
 quickText: 'Mulai Mengajar',
 },
 {
 id: 'presensi',
 title: 'Presensi Siswa',
 icon: UserCheck,
 iconBox: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20 rounded-xl',
 cardClass: 'border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 hover:shadow-md transition-all',
 count: students.length,
 badge: `${students.length} Siswa`,
 badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-emerald-200/80 dark:border-emerald-800/60',
 sub: selectedClassName ? `Kelas ${selectedClassName}` : 'Rombel Aktif',
 progress: students.length > 0 ? 100 : 0,
 quickText: 'Input Presensi',
 },
 {
 id: 'materi',
 title: 'Materi Belajar',
 icon: BookOpen,
 iconBox: '!bg-purple-600 !text-white shadow-md',
 cardClass: 'border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 hover:shadow-md transition-all',
 count: materials.length,
 badge: `${materials.length} Modul`,
 badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-emerald-200/80 dark:border-emerald-800/60',
 sub: 'Materi Pembelajaran',
 progress: materials.length > 0 ? 100 : 0,
 quickText: 'Buat Materi',
 },
 {
 id: 'penugasan',
 title: 'Penugasan',
 icon: FileText,
 iconBox: '!bg-amber-600 !text-white shadow-md',
 cardClass: 'border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 hover:shadow-md transition-all',
 count: assignments.length,
 badge: `${assignments.length} Tugas`,
 badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-800/60',
 sub: 'Evaluasi & Tugas',
 progress: assignments.length > 0 ? 100 : 0,
 quickText: 'Buat Tugas',
 },
 {
 id: 'penilaian',
 title: 'Penilaian',
 icon: BarChart3,
 iconBox: '!bg-rose-600 !text-white shadow-md',
 cardClass: 'border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 hover:shadow-md transition-all',
 count: `${gradedStudentCount}/${students.length}`,
 badge: students.length > 0 && gradedStudentCount === students.length ? 'Lengkap' : `${gradedStudentCount} Dinilai`,
 badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-emerald-200/80 dark:border-emerald-800/60',
 sub: 'Nilai Rapor & Harian',
 progress: students.length > 0 ? Math.round((gradedStudentCount / students.length) * 100) : 0,
 quickText: 'Input Nilai',
 },
 ...(canAccessTahfizh
 ? [
 {
 id: 'tahfizh',
 title: 'Tahfizh Al-Qur\'an',
 icon: GraduationCap,
 iconBox: '!bg-teal-600 !text-white shadow-md',
 cardClass: 'border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 hover:shadow-md transition-all',
 count: tahfizhLogs.length,
 badge: `${tahfizhLogs.length} Setoran`,
 badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60',
 sub: 'Progress Hafalan',
 progress: tahfizhLogs.length > 0 ? 100 : 0,
 quickText: 'Input Tahfizh',
 },
 {
 id: 'rekapan-tahfizh',
 title: 'Rekapan Tahfizh',
 icon: FileSpreadsheet,
 iconBox: '!bg-emerald-600 !text-white shadow-sm dark:!bg-emerald-600 dark:!text-white',
 cardClass: 'border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 hover:shadow-md transition-all',
 count: 'Laporan',
 badge: 'Rekap & Cetak',
 badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60',
 sub: 'Rekapitulasi Hafalan',
 progress: 100,
 quickText: 'Buka Rekapan',
 },
 ]
 : []),
 ...(canAccessMutabaah
 ? [
 {
 id: 'mutabaah',
 title: 'Mutabaah Yaumiyyah',
 icon: Heart,
 iconBox: '!bg-teal-700 !text-white shadow-md shadow-teal-700/20 dark:!bg-teal-700 dark:!text-white',
 cardClass: 'border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 hover:shadow-md transition-all',
 count: 'Dinamis',
 badge: 'Sesuai Template',
 badgeColor: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300 border border-emerald-200/80 dark:border-emerald-800/60',
 sub: 'Worship Checklist',
 progress: 0,
 quickText: 'Input Mutabaah',
 },
 ]
 : []),
 {
 id: 'catatan',
 title: 'Catatan Siswa',
 icon: MessageSquare,
 iconBox: '!bg-indigo-600 !text-white shadow-sm dark:!bg-indigo-600 dark:!text-white',
 cardClass: 'border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 hover:shadow-md transition-all',
 count: studentNotes.length,
 badge: `${studentNotes.length} Catatan`,
 badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-emerald-200/80 dark:border-emerald-800/60',
 sub: 'Perkembangan Siswa',
 progress: studentNotes.length > 0 ? 100 : 0,
 quickText: 'Tambah Catatan',
 },
 {
 id: 'chat',
 title: 'Komunikasi Orang Tua',
 icon: MessageSquare,
 iconBox: '!bg-teal-600 !text-white shadow-md',
 cardClass: 'border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 hover:shadow-md transition-all',
 count: 'Pesan',
 badge: 'Chat Guru',
 badgeColor: 'bg-emerald-50 text-emerald-700 dark:text-emerald-300  dark:bg-emerald-50 text-emerald-700  dark:text-emerald-700 dark:text-emerald-300  border border-emerald-200/80 dark:border-emerald-800/60',
 sub: 'Pesan Masuk & Diskusi',
 progress: 100,
 quickText: 'Buka Chat',
 },
 {
 id: 'log-absensi',
 title: 'Log Absensi Guru',
 icon: Clock,
 iconBox: '!bg-teal-600 !text-white shadow-md',
 cardClass: 'border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 hover:shadow-md transition-all',
 count: `${teacherLogAbsensi.length} Hari`,
 badge: teacherLogAbsensi.length > 0 ? 'Tercatat' : 'Belum Ada',
 badgeColor: 'bg-emerald-50 text-emerald-700 dark:text-emerald-300  dark:bg-emerald-50 text-emerald-700  dark:text-emerald-700 dark:text-emerald-300  border border-emerald-200/80 dark:border-emerald-800/60',
 sub: 'Log Kehadiran Saya',
 progress: teacherLogAbsensi.length > 0 ? 100 : 0,
 quickText: 'Lihat Log Absen',
 },
 {
 id: 'jadwal-lengkap',
 title: 'Jadwal Lengkap',
 icon: CalendarDays,
 iconBox: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20 rounded-xl',
 cardClass: 'border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 hover:shadow-md transition-all',
 count: selectedSemester || 'Semester',
 badge: 'Resmi',
 badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-emerald-200/80 dark:border-emerald-800/60',
 sub: selectedAcademicYear || 'Tahun Ajaran',
 progress: 100,
 quickText: 'Lihat Detail',
 },
 ]

 const handleCardClick = (cardItem) => {
 if (!cardItem) return
 if (cardItem.id === 'mulai-mengajar') {
 setShowMulaiMengajarModal(true)
 return
 }
 if (cardItem.id === 'presensi') {
 const target = getCurrentSchedule() || schedules[0] || null
 const st = target ? getScheduleStatus(target) : null
 if (!target || (!st.isActive && !st.canFillAttendance)) {
 addToast(
 'warning',
 'Di Luar Jadwal KBM',
 'Presensi dapat diakses pada jadwal KBM aktif hari ini.'
 )
 return
 }
 openPresensiModal(target)
 changeTab('presensi')
 return
 }
 changeTab(cardItem.id)
 }

 // Helper to fetch and sync existing saved attendance from server
 const fetchAttendanceForSchedule = async (scheduleObj) => {
 const targetSchedule = scheduleObj || presensiModalSchedule || getCurrentSchedule()
 if (!targetSchedule) return

 const targetClassId = targetSchedule.kelas_id || targetSchedule.class_id || targetSchedule.kelas?.id || targetSchedule.class?.id || selectedClass
 if (!targetClassId || targetClassId === 'all') return

 const todayDate = new Date().toISOString().split('T')[0]

 try {
 const res = await api.get('/teacher/attendance', {
 params: {
 class_id: targetClassId,
 date: todayDate,
 },
 })
 const sessions = res?.data?.data || []
 if (Array.isArray(sessions) && sessions.length > 0) {
 const activeSession = sessions.find((s) => String(s.schedule_id) === String(targetSchedule.id)) || sessions[0]
 if (activeSession && Array.isArray(activeSession.attendances) && activeSession.attendances.length > 0) {
 const mapServerStatus = (s) => {
 if (!s) return 'Belum Dicatat'
 const lower = String(s).toLowerCase().trim()
 if (lower === 'hadir') return 'Hadir'
 if (lower === 'izin') return 'Izin'
 if (lower === 'sakit') return 'Sakit'
 if (lower === 'alpha' || lower === 'alpa') return 'Alpha'
 if (lower === 'terlambat') return 'Terlambat'
 return 'Belum Dicatat'
 }

 setAttendanceData((prev) => {
 const next = { ...prev }
 activeSession.attendances.forEach((att) => {
 const sid = att.siswa_id || att.student_id
 if (sid) {
 next[sid] = {
 status: mapServerStatus(att.status_hadir),
 notes: att.keterangan || att.notes || '',
 check_in_time: att.waktu_presensi || att.arrival_time || '',
 method: att.recorded_method || att.verification_status || '',
 }
 }
 })
 return next
 })
 }
 }
 } catch (err) {
 console.warn('Could not fetch existing attendance session:', err?.message)
 }
 }

 // Open Dedicated Presensi Pop-up Modal for Schedule
 const openPresensiModal = async (scheduleObj) => {
 const targetSchedule = scheduleObj || getCurrentSchedule() || schedules[0] || null
 if (targetSchedule) {
 const scheduleStatus = getScheduleStatus(targetSchedule)
 if (!scheduleStatus.isActive && !scheduleStatus.canFillAttendance) {
 addToast(
 'warning',
 'Jadwal KBM Tidak Aktif',
 `Presensi hanya dapat diakses pada jadwal KBM aktif hari ini. Status: ${scheduleStatus.label}.`
 )
 return
 }
 }
 setPresensiModalSchedule(targetSchedule)
 if (targetSchedule) {
 const schClassId = targetSchedule.kelas_id || targetSchedule.class_id || targetSchedule.kelas?.id || targetSchedule.class?.id ||
 (classes.find((c) => (c.nama_kelas || c.name) === getScheduleClass(targetSchedule))?.id)
 if (schClassId) {
 setSelectedClass(String(schClassId))
 await fetchStudentsForClass(String(schClassId))
 } else {
 await fetchStudentsForClass(selectedClass)
 }
 } else {
 await fetchStudentsForClass(selectedClass)
 }
 await fetchAttendanceForSchedule(targetSchedule)
 setShowAktivitasModal(false)
 setShowPresensiModal(true)
 }

 const handleModalClassChange = (newClassId) => {
 setSelectedClass(newClassId)
 if (newClassId && newClassId !== 'all') {
 const targetSubjId = presensiModalSchedule?.subject_id || presensiModalSchedule?.subject?.id
 const pool = (allTeacherSchedules && allTeacherSchedules.length > 0) ? allTeacherSchedules : schedules
 const match = pool.find((s) => {
 const sCid = s.kelas_id || s.class_id || s.kelas?.id || s.class?.id
 const sSubjId = s.subject_id || s.subject?.id
 const isClassMatch = String(sCid) === String(newClassId)
 if (!isClassMatch) return false
 if (targetSubjId && sSubjId) return String(sSubjId) === String(targetSubjId)
 return true
 }) || pool.find((s) => {
 const sCid = s.kelas_id || s.class_id || s.kelas?.id || s.class?.id
 return String(sCid) === String(newClassId)
 })
 if (match) {
 setPresensiModalSchedule(match)
 }
 }
 fetchStudentsForClass(newClassId)
 }

 const getTodayDateString = () => {
 const d = new Date()
 const year = d.getFullYear()
 const month = String(d.getMonth() + 1).padStart(2, '0')
 const day = String(d.getDate()).padStart(2, '0')
 return `${year}-${month}-${day}`
 }

 const autoSaveAttendanceRecord = async (studentToSave, status = 'Hadir', method = 'QR Code Kartu Siswa', notes = '') => {
 if (!studentToSave?.id) return
 const activeSchedule = presensiModalSchedule || getCurrentSchedule()
 if (!activeSchedule?.id) return

 try {
 setAutoSaveStatus('saving')
 const payload = {
 class_schedule_id: activeSchedule.id,
 date: getTodayDateString(),
 meeting_number: meetingNumber || 1,
 topic: attendanceTopic || 'Presensi Pembelajaran Harian',
 method: method.toLowerCase().includes('qr') ? 'qr' : method.toLowerCase().includes('rfid') ? 'rfid' : 'rollcall',
 students: [
 {
 student_id: studentToSave.id,
 status: status === 'Belum Dicatat' ? 'Belum Dicatat' : status,
 notes: notes || `Tercatat via ${method} (Auto-Save Real-time)`,
 },
 ],
 }
 await api.post('/teacher/attendance', payload)
 setAutoSaveStatus('saved')
 } catch (err) {
 console.warn('Auto-save single attendance error:', err)
 setAutoSaveStatus('error')
 }
 }

 const markStudentAttendance = (student, method = 'Checklist Guru', status = 'Hadir') => {
 if (!student) return
 const checkInTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
 setAttendanceData((previous) => ({
 ...previous,
 [student.id]: {
 ...(previous[student.id] || {}),
 status,
 method,
 check_in_time: status === 'Hadir' || status === 'Terlambat' ? checkInTime : '',
 notes: `Dicatat melalui ${method}`,
 },
 }))
 // Auto-save langsung ke server secara real-time
 autoSaveAttendanceRecord(student, status, method, `Dicatat melalui ${method}`)
 }

 const toggleStudentChecklist = (student, checked) => {
 markStudentAttendance(student, 'Checklist Guru', checked ? 'Hadir' : 'Belum Dicatat')
 }

 const markAllStudentsPresent = async () => {
 const checkInTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
 const newAttendance = {}
 students.forEach((student) => {
 newAttendance[student.id] = {
 status: 'Hadir',
 method: 'Checklist Guru',
 check_in_time: checkInTime,
 notes: 'Dicatat melalui Checklist Guru',
 }
 })
 setAttendanceData((previous) => ({
 ...previous,
 ...newAttendance,
 }))
 addToast('success', 'Semua Siswa Dicentang & Disimpan', `${students.length} siswa ditandai hadir dan tersimpan ke server.`)

 const activeSchedule = presensiModalSchedule || getCurrentSchedule()
 if (activeSchedule?.id && students.length > 0) {
 try {
 setAutoSaveStatus('saving')
 await api.post('/teacher/attendance', {
 class_schedule_id: activeSchedule.id,
 date: getTodayDateString(),
 meeting_number: meetingNumber || 1,
 topic: attendanceTopic || 'Presensi Pembelajaran Harian',
 method: 'rollcall',
 students: students.map((st) => ({
 student_id: st.id,
 status: 'Hadir',
 notes: 'Dicatat melalui Checklist Guru (Auto-Save)',
 })),
 })
 setAutoSaveStatus('saved')
 } catch (err) {
 console.warn('Auto-save mass attendance error:', err)
 setAutoSaveStatus('error')
 }
 }
 }

 const findStudentByCardCode = (rawCode) => {
 const cardCode = String(rawCode || '').trim().toLowerCase()
 if (!cardCode) return null
 return students.find((student) => [
 student.id,
 student.nis,
 student.nisn,
 student.student_code,
 student.card_number,
 student.qr_code,
 student.rfid_uid,
 student.metadata?.card_number,
 student.metadata?.qr_code,
 student.metadata?.rfid_uid,
 student.nama_lengkap,
 ].some((value) => value != null && String(value).trim().toLowerCase() === cardCode)) ||
 students.find((s) => cardCode.length > 2 && (String(s.nis || '').includes(cardCode) || String(s.nisn || '').includes(cardCode))) || null
 }

 const identifyStudentCard = async (rawIdentifier, method = selectedMethod) => {
 const methodLabel = method === 'rfid' ? 'RFID Kartu Siswa' : 'QR Code Kartu Siswa'
 const identifier = String(rawIdentifier || '').trim()
 if (!identifier) return false

 setScanProcessing(true)

 // Instant local identification & status update to Hadir (with real-time Auto-Save to server)
 const matchedStudent = findStudentByCardCode(identifier)
 if (matchedStudent) {
 markStudentAttendance(matchedStudent, methodLabel, 'Hadir')
 setLastScannedResult({
 student: matchedStudent,
 method: methodLabel,
 time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
 })
 addToast('success', 'Presensi Berhasil Disimpan!', `${matchedStudent.nama_lengkap} langsung tersimpan HADIR pada jam pelajaran ini.`)
 }

 try {
 let activeSchedule = presensiModalSchedule || getCurrentSchedule()
 if (!activeSchedule?.id) {
 const classId = getCurrentClassId()
 const scheduleResponse = await api.get('/teacher/schedules', { params: { class_id: classId || undefined } })
 const availableSchedules = scheduleResponse?.data?.data || []
 if (availableSchedules.length) {
 setSchedules(availableSchedules)
 activeSchedule = availableSchedules.find((schedule) => {
 const scheduleClassId = schedule.class_id || schedule.kelas_id || schedule.kelas?.id || schedule.class?.id
 return !classId || scheduleClassId === classId
 }) || availableSchedules[0]
 }
 }

 if (activeSchedule?.id) {
 const response = await api.post(`/lesson-attendance/identify-card/${method === 'rfid' ? 'rfid' : 'qr'}`, {
 schedule_id: activeSchedule.id,
 identifier,
 })
 const result = response?.data?.data
 if (result?.student) {
 const student = students.find((item) => item.id === result.student.id) || {
 ...result.student,
 nama_lengkap: result.student.nama_lengkap || result.student.full_name || 'Siswa',
 }
 if (!matchedStudent) {
 markStudentAttendance(student, methodLabel, 'Hadir')
 setLastScannedResult({
 student,
 method: methodLabel,
 time: new Date(result.identified_at || Date.now()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
 })
 addToast('success', 'Presensi Server Berhasil Disimpan!', `${student.nama_lengkap} langsung tersimpan HADIR pada jam pelajaran ini.`)
 }
 }
 }
 return true
 } catch (error) {
 if (matchedStudent) {
 return true
 }
 const message = error?.response?.data?.message || error?.message || 'QR Code kartu siswa tidak berhasil diidentifikasi.'
 setLastScannedResult({ error: true, code: identifier, method: methodLabel, message })
 addToast('error', 'Identifikasi Gagal', message)
 return false
 } finally {
 setScanProcessing(false)
 setScanInput('')
 setTimeout(() => scanInputRef.current?.focus(), 50)
 }
 }

 const handleCardScan = async (event) => {
 event?.preventDefault()
 await identifyStudentCard(scanInput, selectedMethod)
 }

 const stopQrCamera = () => {
 if (qrDetectorTimerRef.current) window.clearInterval(qrDetectorTimerRef.current)
 qrDetectorTimerRef.current = null
 qrStreamRef.current?.getTracks().forEach((track) => track.stop())
 qrStreamRef.current = null
 if (qrVideoRef.current) qrVideoRef.current.srcObject = null
 setQrCameraActive(false)
 }

 const closeQrCamera = () => {
 stopQrCamera()
 setQrCameraErrorInfo(null)
 setQrCameraError('')
 setShowQrCamera(false)
 }

 const openQrCamera = async () => {
 setShowQrCamera(true)
 setQrCameraError('')
 setQrCameraErrorInfo(null)
 try {
 const stream = await requestCameraStream({ preferredFacingMode: 'environment' })
 qrStreamRef.current = stream
 await new Promise((resolve) => window.setTimeout(resolve, 50))
 if (qrVideoRef.current) {
 qrVideoRef.current.srcObject = stream
 await qrVideoRef.current.play()
 }
 setQrCameraActive(true)

 if (!isBarcodeDetectorSupported()) {
 setQrCameraErrorInfo({
 title: 'Pemindaian Otomatis QR Belum Aktif',
 message: 'Browser ini belum mendukung fitur pendeteksi barcode otomatis langsung (BarcodeDetector API). Stream kamera tetap aktif.',
 actionType: 'notice',
 isPermissionDenied: false,
 instructions: [
 'Untuk pemindaian QR otomatis secara instan, disarankan menggunakan Google Chrome atau Microsoft Edge terbaru.',
 'Anda juga dapat mengetikkan nomor kartu siswa atau menempelkan barcode scanner fisik (USB/Bluetooth) pada input di bawah.',
 ],
 })
 return
 }

 const detector = new window.BarcodeDetector({ formats: ['qr_code'] })
 qrDetectorTimerRef.current = window.setInterval(async () => {
 const video = qrVideoRef.current
 if (!video || video.readyState < 2 || scanProcessing) return
 try {
 const codes = await detector.detect(video)
 const value = codes[0]?.rawValue
 if (value) {
 stopQrCamera()
 setScanInput(value)
 const matched = await identifyStudentCard(value, 'qr')
 if (matched) setShowQrCamera(false)
 }
 } catch {
 // Frame tanpa QR valid diabaikan sampai pemindaian berikutnya.
 }
 }, 500)
 } catch (error) {
 stopQrCamera()
 const parsed = parseCameraError(error)
 setQrCameraErrorInfo(parsed)
 setQrCameraError(parsed.message)
 }
 }

 const handleFaceRecognitionSubmit = () => {
 const targetStudent = students.find((s) => s.id === faceStudentId) || students[0]
 if (!targetStudent) {
 addToast('warning', 'Pilih Siswa', 'Silakan pilih siswa yang akan diproses.')
 return
 }

 setAttendanceData((prev) => ({
 ...prev,
 [targetStudent.id]: {
 ...(prev[targetStudent.id] || {}),
 status: faceStatus,
 method: 'Face Recognition AI',
 notes: faceNotes || 'Verifikasi Wajah AI Instant',
 check_in_time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
 }
 }))

 setLastScannedResult({
 student: targetStudent,
 method: 'Face Recognition AI',
 time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
 })

 addToast('success', 'Presensi Wajah Berhasil', `Presensi Wajah AI untuk ${targetStudent.nama_lengkap} berhasil disimpan (${faceStatus}).`)
 setShowFaceModal(false)
 setFaceStudentId('')
 setFaceNotes('')
 }

 // ─── Fetch pending parent permissions for the teacher's class ───────────
 const fetchPendingPermissions = async (classId) => {
 try {
 const today = new Date().toLocaleDateString('en-CA')
 const params = new URLSearchParams({ date: today, per_page: 0 })
 if (classId && classId !== 'all') params.set('class_id', classId)
 const res = await api.get(`/teacher/permissions?${params}`)
 const list = res?.data?.data?.data || res?.data?.data || res?.data || []
 if (Array.isArray(list)) {
 const map = {}
 list.forEach((p) => {
 if (p.student_id) {
 const sid = String(p.student_id)
 if (!map[sid] || ['submitted', 'waiting_verification'].includes(p.status)) {
 map[sid] = p
 }
 }
 })
 setPendingPermissions(map)
 }
 } catch (err) {
 console.warn('[TeacherWorkspace] fetchPendingPermissions error:', err)
 }
 }

 // ─── 1-klik Approve izin ortu oleh guru pengampu ──────────────────────
 const handleApprovePermission = async (permissionId, studentId, permType = 'izin') => {
 try {
 setApprovingPermissionId(permissionId)
 await api.post(`/teacher/permissions/${permissionId}/approve`, { review_notes: 'Disetujui oleh Guru Pengampu' })

 setPendingPermissions((prev) => ({
 ...prev,
 [String(studentId)]: { ...prev[String(studentId)], status: 'approved' },
 }))

 const isSick = String(permType || '').toLowerCase().includes('sakit')
 const newStatus = isSick ? 'Sakit' : 'Izin'
 setAttendanceData((prev) => ({
 ...prev,
 [studentId]: {
 ...prev[studentId],
 status: newStatus,
 method: 'Izin Orang Tua (Disetujui Guru)',
 notes: `Izin disetujui guru — ${isSick ? 'Sakit' : 'Izin'}.`,
 },
 }))

 addToast('success', 'Izin Disetujui', `Pengajuan izin siswa berhasil disetujui dan status presensi diperbarui ke ${newStatus}.`)
 } catch (err) {
 addToast('error', 'Gagal Menyetujui', err?.response?.data?.message || 'Terjadi kesalahan saat menyetujui izin.')
 } finally {
 setApprovingPermissionId(null)
 }
 }

 const handleSaveAttendance = async () => {
 if (isSavingAttendance) return
 const activeSchedule = presensiModalSchedule || getCurrentSchedule()

 if (!activeSchedule) {
 addToast('warning', 'Jadwal Kosong', 'Pilih jadwal mengajar terlebih dahulu.')
 return
 }

 const scheduleStatus = getScheduleStatus(activeSchedule)
 if (!scheduleStatus.isActive && !scheduleStatus.canFillAttendance) {
 addToast(
 'warning',
 'Di Luar Jadwal KBM',
 `Presensi hanya dapat disimpan pada jadwal KBM aktif hari ini.`
 )
 return
 }

 setIsSavingAttendance(true)
 try {
 const normalizeStatus = (st) => {
 if (!st) return 'Belum Dicatat'
 const lower = String(st).toLowerCase().trim()
 if (lower === 'hadir') return 'Hadir'
 if (lower === 'izin') return 'Izin'
 if (lower === 'sakit') return 'Sakit'
 if (lower === 'alpha' || lower === 'alpa') return 'Alpha'
 if (lower === 'terlambat') return 'Terlambat'
 return 'Belum Dicatat'
 }

 const payload = {
 class_schedule_id: activeSchedule.id,
 date: new Date().toISOString().split('T')[0],
 meeting_number: Number(meetingNumber) || 1,
 topic: attendanceTopic || 'Pembelajaran Tematik & KBM',
 meeting_notes: attendanceMeetingNotes?.trim() || null,
 method: selectedMethod || 'rollcall',
 students: Object.keys(attendanceData).map((stId) => ({
 student_id: stId,
 status: normalizeStatus(attendanceData[stId]?.status),
 notes: attendanceData[stId]?.notes || null,
 })),
 }
 const response = await api.post('/teacher/attendance', payload)
 setShowPresensiModal(false)
 setShowAttendanceMethodModal(false)
 addToast('success', 'Presensi Disimpan', response?.data?.message || 'Presensi siswa berhasil difinalisasi dan disimpan ke sistem!')
 } catch (err) {
 const message = err?.response?.data?.message || 'Terjadi kesalahan saat menyimpan presensi siswa.'
 addToast('error', 'Gagal Simpan', message)
 } finally {
 setIsSavingAttendance(false)
 }
 }

 const handlePrintAttendanceRoster = () => {
 if (!students || students.length === 0) {
 addToast('warning', 'Daftar Siswa Kosong', 'Tidak ada siswa pada rombel yang dipilih untuk dicetak.')
 return
 }

 const activeSchedule = getCurrentSchedule() || presensiModalSchedule || {}
 const subjectName = activeSchedule?.subject?.name || activeSchedule?.subject?.nama_mapel || activeSchedule?.nama_mapel || 'Mata Pelajaran'
 const curClassName = selectedClassName || 'Rombel'
 const todayFormatted = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

 const headers = [
 'No',
 'NIS / NISN',
 'Nama Siswa',
 'Jenis Kelamin',
 'Status Presensi',
 'Waktu Hadir',
 'Metode',
 'Catatan'
 ]

 const rows = students.map((st, idx) => {
 const record = attendanceData[st.id] || { status: 'Belum Dicatat' }
 return [
 idx + 1,
 st.nis || st.nisn || '-',
 st.nama_lengkap || st.full_name || '-',
 st.gender === 'L' || st.jenis_kelamin === 'L' ? 'Laki-laki' : (st.gender === 'P' || st.jenis_kelamin === 'P' ? 'Perempuan' : '-'),
 record.status || 'Belum Dicatat',
 record.check_in_time || '-',
 record.method || '-',
 record.notes || '-'
 ]
 })

 const presentCount = students.filter((s) => (attendanceData[s.id]?.status || 'Belum Dicatat') === 'Hadir').length
 const subtitleInfo = `Pengajar: ${teacherName} | Rombel: ${curClassName} | Mapel: ${subjectName} | Tanggal: ${todayFormatted} | Hadir: ${presentCount}/${students.length} Siswa`

 printCleanTable({
 title: 'DAFTAR PRESENSI PEMBELAJARAN SISWA',
 subtitle: subtitleInfo,
 headers,
 rows,
 user,
 unit: teacherProfile?.unit || user?.employee?.unit || user?.unit,
 })
 addToast('info', 'Dokumen Siap Dicetak', 'Pratinjau cetak daftar presensi pembelajaran berhasil dibuka.')
 }

 const handleDownloadAttendancePdf = () => {
 if (!students || students.length === 0) {
 addToast('warning', 'Daftar Siswa Kosong', 'Tidak ada siswa pada rombel yang dipilih untuk diunduh.')
 return
 }

 const activeSchedule = getCurrentSchedule() || presensiModalSchedule || {}
 const subjectName = activeSchedule?.subject?.name || activeSchedule?.subject?.nama_mapel || activeSchedule?.nama_mapel || 'Mata Pelajaran'
 const curClassName = selectedClassName || 'Rombel'
 const todayFormatted = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
 const todayIso = new Date().toISOString().split('T')[0]

 const headers = [
 'No',
 'NIS / NISN',
 'Nama Siswa',
 'L/P',
 'Status Presensi',
 'Waktu Hadir',
 'Metode',
 'Catatan'
 ]

 const rows = students.map((st, idx) => {
 const record = attendanceData[st.id] || { status: 'Belum Dicatat' }
 return [
 idx + 1,
 st.nis || st.nisn || '-',
 st.nama_lengkap || st.full_name || '-',
 st.gender || st.jenis_kelamin || '-',
 record.status || 'Belum Dicatat',
 record.check_in_time || '-',
 record.method || '-',
 record.notes || '-'
 ]
 })

 const presentCount = students.filter((s) => (attendanceData[s.id]?.status || 'Belum Dicatat') === 'Hadir').length
 const subtitleInfo = `Pengajar: ${teacherName} | Rombel: ${curClassName} | Mapel: ${subjectName} | Tanggal: ${todayFormatted} | Hadir: ${presentCount}/${students.length} Siswa`

 downloadPdfTable({
 title: 'DAFTAR PRESENSI PEMBELAJARAN SISWA',
 subtitle: subtitleInfo,
 headers,
 rows,
 filename: `Presensi_${curClassName.replace(/\s+/g, '_')}_${todayIso}.pdf`,
 })
 }

 const handlePrintSingleHistorySession = (session) => {
 if (!session) return
 const attList = session.attendances || []
 if (attList.length === 0) {
 addToast('warning', 'Data Presensi Kosong', 'Tidak ada data kehadiran siswa pada sesi ini untuk dicetak.')
 return
 }

 const sessionDate = session.attendance_date ? new Date(session.attendance_date) : new Date()
 const dateFormatted = sessionDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
 const timeRange = session.schedule?.time_start && session.schedule?.time_end
 ? `${session.schedule.time_start.slice(0, 5)} – ${session.schedule.time_end.slice(0, 5)} WIB`
 : '07:30 – 09:00 WIB'
 const subjectName = session.schedule?.subject?.name || 'Mata Pelajaran'
 const clsName = session.schedule?.kelas?.name || selectedClassName || 'Rombel'
 const hadir = attList.filter((a) => (a.status_hadir || a.status || '').toLowerCase() === 'hadir').length
 const total = attList.length
 const rate = total > 0 ? Math.round((hadir / total) * 100) : 0

 const headers = ['No', 'NISN', 'Nama Siswa', 'Status Presensi', 'Waktu Presensi', 'Metode', 'Keterangan']
 const rows = attList.map((item, idx) => [
 idx + 1,
 item.siswa?.nisn || item.student_nisn || '-',
 item.siswa?.full_name || item.siswa?.nama_lengkap || item.student_name || 'Siswa',
 item.status_hadir || item.status || 'Belum Dicatat',
 item.waktu_presensi ? new Date(item.waktu_presensi).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : '-',
 item.recorded_method || 'Presensi KBM',
 item.keterangan || '-'
 ])

 printCleanTable({
 title: 'BERITA ACARA & PRESENSI PEMBELAJARAN KBM',
 subtitle: `Pertemuan ke-${session.meeting_number || 1} | Mapel: ${subjectName} | Rombel: ${clsName} | Tanggal: ${dateFormatted} (${timeRange}) | Guru: ${teacherName} | Topik: ${session.topic || 'KBM Reguler'} | Hadir: ${hadir}/${total} Siswa (${rate}%)`,
 headers,
 rows,
 user,
 unit: teacherProfile?.unit || user?.employee?.unit || user?.unit,
 })
 addToast('info', 'Dokumen Siap Dicetak', `Pratinjau cetak sesi pertemuan ke-${session.meeting_number || 1} berhasil dibuka.`)
 }

 const handleDownloadSingleHistorySessionPdf = (session) => {
 if (!session) return
 const attList = session.attendances || []
 if (attList.length === 0) {
 addToast('warning', 'Data Presensi Kosong', 'Tidak ada data kehadiran siswa pada sesi ini untuk diunduh.')
 return
 }

 const sessionDate = session.attendance_date ? new Date(session.attendance_date) : new Date()
 const dateFormatted = sessionDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
 const timeRange = session.schedule?.time_start && session.schedule?.time_end
 ? `${session.schedule.time_start.slice(0, 5)} – ${session.schedule.time_end.slice(0, 5)} WIB`
 : '07:30 – 09:00 WIB'
 const subjectName = session.schedule?.subject?.name || 'Mata Pelajaran'
 const clsName = session.schedule?.kelas?.name || selectedClassName || 'Rombel'
 const hadir = attList.filter((a) => (a.status_hadir || a.status || '').toLowerCase() === 'hadir').length
 const total = attList.length
 const rate = total > 0 ? Math.round((hadir / total) * 100) : 0

 const headers = ['No', 'NISN', 'Nama Siswa', 'Status Presensi', 'Waktu Presensi', 'Metode', 'Keterangan']
 const rows = attList.map((item, idx) => [
 idx + 1,
 item.siswa?.nisn || item.student_nisn || '-',
 item.siswa?.full_name || item.siswa?.nama_lengkap || item.student_name || 'Siswa',
 item.status_hadir || item.status || 'Belum Dicatat',
 item.waktu_presensi ? new Date(item.waktu_presensi).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : '-',
 item.recorded_method || 'Presensi KBM',
 item.keterangan || '-'
 ])

 const dateIso = session.attendance_date ? String(session.attendance_date).slice(0, 10) : new Date().toISOString().slice(0, 10)
 downloadPdfTable({
 title: 'BERITA ACARA & PRESENSI PEMBELAJARAN KBM',
 subtitle: `Pertemuan ke-${session.meeting_number || 1} | Mapel: ${subjectName} | Rombel: ${clsName} | Tanggal: ${dateFormatted} (${timeRange}) | Guru: ${teacherName} | Topik: ${session.topic || 'KBM Reguler'} | Hadir: ${hadir}/${total} Siswa (${rate}%)`,
 headers,
 rows,
 filename: `Presensi_Pertemuan_${session.meeting_number || 1}_${clsName.replace(/\s+/g, '_')}_${dateIso}.pdf`,
 })
 addToast('info', 'Unduh PDF', 'File PDF presensi sesi berhasil disiapkan.')
 }

 const handleExportSingleHistorySessionCsv = (session) => {
 if (!session) return
 const attList = session.attendances || []
 if (attList.length === 0) {
 addToast('warning', 'Data Presensi Kosong', 'Tidak ada data kehadiran siswa pada sesi ini untuk diekspor.')
 return
 }

 const headers = ['No', 'NISN', 'Nama Siswa', 'Status Presensi', 'Waktu Presensi', 'Metode', 'Keterangan']
 const rows = attList.map((item, idx) => [
 idx + 1,
 item.siswa?.nisn || item.student_nisn || '-',
 item.siswa?.full_name || item.siswa?.nama_lengkap || item.student_name || 'Siswa',
 item.status_hadir || item.status || 'Belum Dicatat',
 item.waktu_presensi ? new Date(item.waktu_presensi).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : '-',
 item.recorded_method || 'Presensi KBM',
 item.keterangan || '-'
 ])

 const csvContent = [headers, ...rows]
 .map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','))
 .join('\n')

 const dateIso = session.attendance_date ? String(session.attendance_date).slice(0, 10) : new Date().toISOString().slice(0, 10)
 const filename = `Presensi_Pertemuan_${session.meeting_number || 1}_${(selectedClassName || 'Rombel').replace(/\s+/g, '_')}_${dateIso}.csv`
 const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
 const link = document.createElement('a')
 link.href = URL.createObjectURL(blob)
 link.download = filename
 link.click()
 URL.revokeObjectURL(link.href)
 addToast('success', 'Export Berhasil', `Data presensi pertemuan ke-${session.meeting_number || 1} berhasil diekspor ke format Excel (.csv).`)
 }

 const handleStartEditHistorySession = () => {
 if (!selectedHistorySession) return
 const initialMap = {}
 const attList = selectedHistorySession.attendances || []
 attList.forEach((item) => {
 const sId = item.siswa_id || item.student_id || item.siswa?.id || item.id
 const rawStatus = (item.status_hadir || item.status || 'Hadir').toLowerCase()
 const normalizedStatus = rawStatus === 'alpa' || rawStatus === 'alpha' ? 'Alpha'
 : rawStatus === 'izin' ? 'Izin'
 : rawStatus === 'sakit' ? 'Sakit'
 : rawStatus === 'terlambat' ? 'Terlambat'
 : rawStatus === 'hadir' ? 'Hadir'
 : 'Belum Dicatat'
 initialMap[sId] = {
 status: normalizedStatus,
 notes: item.keterangan || item.notes || '',
 }
 })
 setEditedAttendanceMap(initialMap)
 setIsEditingHistorySession(true)
 }

 const handleSaveHistoryCorrection = async () => {
 if (!selectedHistorySession) return
 setIsSavingHistoryEdit(true)
 try {
 const session = selectedHistorySession
 const attList = session.attendances || []
 const payload = {
 class_schedule_id: session.schedule_id || session.schedule?.id,
 date: session.attendance_date,
 meeting_number: session.meeting_number || 1,
 topic: session.topic || session.learning_material || 'Presensi Pembelajaran Harian',
 method: session.attendance_method || 'rollcall',
 students: attList.map((item) => {
 const sId = item.siswa_id || item.student_id || item.siswa?.id || item.id
 const edit = editedAttendanceMap[sId]
 return {
 student_id: sId,
 status: edit?.status || item.status_hadir || item.status || 'Hadir',
 notes: edit?.notes || item.keterangan || 'Koreksi presensi sesi KBM oleh guru',
 }
 }),
 }

 await api.post('/teacher/attendance', payload)
 addToast('success', 'Koreksi Disimpan', `Data presensi pertemuan ke-${session.meeting_number || 1} berhasil diperbarui.`)

 // Update selectedHistorySession locally
 setSelectedHistorySession((prev) => {
 if (!prev) return prev
 const updatedAttendances = (prev.attendances || []).map((att) => {
 const sId = att.siswa_id || att.student_id || att.siswa?.id || att.id
 const edit = editedAttendanceMap[sId]
 if (edit) {
 return {
 ...att,
 status_hadir: edit.status,
 status: edit.status,
 keterangan: edit.notes,
 }
 }
 return att
 })
 return {
 ...prev,
 attendances: updatedAttendances,
 }
 })
 setIsEditingHistorySession(false)
 fetchHistorySessions()
 } catch (err) {
 console.error('Failed to save attendance correction:', err)
 addToast('error', 'Gagal Menyimpan Koreksi', err?.response?.data?.message || 'Terjadi kesalahan saat menyimpan perubahan data presensi.')
 } finally {
 setIsSavingHistoryEdit(false)
 }
 }

 const openScheduleDetail = async (schedule) => {
 if (!schedule) return
 const schClassId = schedule.kelas_id || schedule.class_id || schedule.kelas?.id || schedule.class?.id ||
 (classes.find((c) => (c.nama_kelas || c.name) === getScheduleClass(schedule))?.id)

 setDetailData({
 title: `Jadwal: ${getScheduleSubject(schedule)}`,
 category: 'Jadwal Mengajar',
 items: [
 { label: 'Hari', value: getScheduleDay(schedule) },
 { label: 'Rombel', value: getScheduleClass(schedule) },
 { label: 'Jam Pelajaran', value: `${(schedule.start_time || schedule.time_start || '00:00').slice(0, 5)} - ${(schedule.end_time || schedule.time_end || '00:00').slice(0, 5)} WIB` },
 { label: 'Ruangan', value: getScheduleRoom(schedule) },
 ],
 rawSchedule: schedule,
 })
 setScheduleDetailSearch('')
 setShowDetailModal(true)

 setLoadingScheduleDetail(true)
 try {
 let classStudents = []
 if (schClassId) {
 const res = await api.get('/teacher/students', {
 params: { class_id: schClassId, per_page: 100 }
 }).catch(() => null)
 const raw = res?.data?.data
 classStudents = Array.isArray(raw) ? raw : raw?.data || []
 if (classStudents.length === 0) {
 classStudents = students.filter((st) => {
 const sCid = st.kelas_id || st.class_id || st.kelas?.id
 return !!sCid && String(sCid) === String(schClassId)
 })
 }
 }
 setScheduleDetailStudents(classStudents)

 const todayDate = new Date().toISOString().split('T')[0]
 const attMap = {}
 if (schClassId) {
 const attRes = await api.get('/teacher/attendance', {
 params: { class_id: schClassId, date: todayDate }
 }).catch(() => null)
 const sessions = attRes?.data?.data || []
 const activeSession = Array.isArray(sessions) ? (sessions.find((s) => String(s.schedule_id) === String(schedule.id)) || sessions[0]) : null
 if (activeSession && Array.isArray(activeSession.attendances)) {
 activeSession.attendances.forEach((att) => {
 const sid = att.siswa_id || att.student_id
 if (sid) {
 attMap[sid] = {
 status: att.status_hadir || att.status || 'Belum Dicatat',
 notes: att.keterangan || att.notes || '',
 time: att.waktu_presensi || '',
 }
 }
 })
 }
 }
 if (Object.keys(attMap).length === 0 && attendanceData && Object.keys(attendanceData).length > 0) {
 classStudents.forEach((st) => {
 if (attendanceData[st.id]) {
 attMap[st.id] = attendanceData[st.id]
 }
 })
 }
 setScheduleDetailAttendance(attMap)
 } catch (err) {
 console.warn('Error loading schedule detail students:', err)
 } finally {
 setLoadingScheduleDetail(false)
 }
 }

 const handleExportHistorySessionsSummary = () => {
 if (!historySessions || historySessions.length === 0) {
 addToast('warning', 'Data Sesi Kosong', 'Tidak ada sesi pembelajaran pada periode ini untuk diekspor.')
 return
 }

 const headers = [
 'No',
 'Pertemuan Ke',
 'Tanggal',
 'Jam Pelajaran',
 'Mata Pelajaran',
 'Rombel / Kelas',
 'Topik Pembelajaran',
 'Total Siswa',
 'Hadir',
 'Terlambat',
 'Izin',
 'Sakit',
 'Alpa',
 'Tingkat Kehadiran (%)'
 ]

 const rows = historySessions.map((session, idx) => {
 const attList = session.attendances || []
 const hadir = attList.filter((a) => (a.status_hadir || a.status || '').toLowerCase() === 'hadir').length
 const terlambat = attList.filter((a) => (a.status_hadir || a.status || '').toLowerCase() === 'terlambat').length
 const izin = attList.filter((a) => (a.status_hadir || a.status || '').toLowerCase() === 'izin').length
 const sakit = attList.filter((a) => (a.status_hadir || a.status || '').toLowerCase() === 'sakit').length
 const alpa = attList.filter((a) => ['alpa', 'alpha'].includes((a.status_hadir || a.status || '').toLowerCase())).length
 const totalAtt = attList.length
 const rate = totalAtt > 0 ? Math.round(((hadir + terlambat) / totalAtt) * 100) : 0
 const sessionDate = session.attendance_date ? String(session.attendance_date).slice(0, 10) : '-'
 const timeRange = session.schedule?.time_start && session.schedule?.time_end
 ? `${session.schedule.time_start.slice(0, 5)} - ${session.schedule.time_end.slice(0, 5)}`
 : '-'

 return [
 idx + 1,
 session.meeting_number || idx + 1,
 sessionDate,
 timeRange,
 session.schedule?.subject?.name || 'Mata Pelajaran',
 session.schedule?.kelas?.name || selectedClassName || 'Rombel',
 session.topic || session.learning_material || 'Materi KBM Reguler',
 totalAtt,
 hadir,
 terlambat,
 izin,
 sakit,
 alpa,
 `${rate}%`
 ]
 })

 const csvContent = [headers, ...rows]
 .map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','))
 .join('\n')

 const filename = `Rekapitulasi_Presensi_KBM_${attendancePeriodFilter}_${(selectedClassName || 'Rombel').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
 const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
 const link = document.createElement('a')
 link.href = URL.createObjectURL(blob)
 link.download = filename
 link.click()
 URL.revokeObjectURL(link.href)
 addToast('success', 'Export Berhasil', `Rekapitulasi ${historySessions.length} sesi KBM berhasil diekspor ke format Excel (.csv).`)
 }

 const fetchStudentDetailHistory = async (student) => {
 if (!student) return
 setLoadingStudentDetailSessions(true)
 try {
 const activeSchedule = getCurrentSchedule() || presensiModalSchedule || {}
 const targetClassId = (selectedClass && selectedClass !== 'all')
 ? selectedClass
 : (student.kelas_id || student.class_id || activeSchedule?.kelas_id || activeSchedule?.class_id)

 const params = {
 per_page: 200,
 }
 if (activeSchedule?.id) {
 params.schedule_id = activeSchedule.id
 } else if (targetClassId) {
 params.kelas_id = targetClassId
 params.class_id = targetClassId
 }

 const isSem2 = attendanceSemesterFilter === '2' || activeSchedule?.semester?.sequence === 2
 params.date_from = isSem2 ? '2027-01-01' : '2026-07-01'
 params.date_to = isSem2 ? '2027-06-30' : '2026-12-31'

 let res = await api.get('/lesson-attendance/sessions', { params })
 let list = res?.data?.data?.data || res?.data?.data || []

 // Fallback jika schedule_id belum ada sesi terdaftar, coba dengan kelas_id
 if ((!Array.isArray(list) || list.length === 0) && params.schedule_id && targetClassId) {
 const fallbackParams = { ...params }
 delete fallbackParams.schedule_id
 fallbackParams.kelas_id = targetClassId
 fallbackParams.class_id = targetClassId
 const fallbackRes = await api.get('/lesson-attendance/sessions', { params: fallbackParams })
 list = fallbackRes?.data?.data?.data || fallbackRes?.data?.data || []
 }

 setStudentDetailSessions(Array.isArray(list) ? list : [])
 } catch (err) {
 console.error('Failed to fetch student detail history sessions:', err)
 setStudentDetailSessions([])
 } finally {
 setLoadingStudentDetailSessions(false)
 }
 }

 const handleOpenStudentAttendanceDetail = (student, initialPeriod) => {
 setSelectedStudentAttendanceDetail(student)
 setStudentDetailPeriodFilter(initialPeriod || 'bulanan')
 setShowStudentAttendanceDetailModal(true)
 fetchStudentDetailHistory(student)
 }

 const getStudentAttendanceHistory = (student) => {
 if (!student) return []
 const curRecord = attendanceData[student.id] || { status: 'Belum Dicatat', method: 'Belum dicatat', check_in_time: '-' }
 const todayStr = attendanceDateFilter || new Date().toISOString().split('T')[0]

 // Sesi KBM aktif saat ini
 const currentSession = {
 id: 'current_active_session',
 meeting: meetingNumber || 1,
 date: todayStr,
 topic: attendanceTopic || `Materi KBM Pertemuan ke-${meetingNumber || 1}`,
 status: curRecord.status || 'Belum Dicatat',
 time: curRecord.check_in_time || (curRecord.status === 'Hadir' ? 'Tercatat' : '-'),
 method: curRecord.method || (curRecord.status === 'Hadir' ? 'Roll Call Guru' : 'Belum dicatat'),
 notes: curRecord.notes || (curRecord.status === 'Hadir' ? 'Hadir tepat waktu' : '-'),
 isCurrent: true,
 }

 const sourceSessions = studentDetailSessions.length > 0 ? studentDetailSessions : historySessions

 const pastLogs = (sourceSessions || []).map((session) => {
 const sDateStr = session.attendance_date ? String(session.attendance_date).slice(0, 10) : ''
 const att = (session.attendances || []).find((a) => a.siswa_id === student.id || a.student_id === student.id)

 const rawStatus = (att?.status_hadir || att?.status || (sDateStr === todayStr ? curRecord.status : 'Belum Dicatat') || 'Belum Dicatat').toLowerCase()
 const titleStatus = rawStatus === 'hadir' ? 'Hadir'
 : rawStatus === 'terlambat' ? 'Terlambat'
 : rawStatus === 'izin' ? 'Izin'
 : rawStatus === 'sakit' ? 'Sakit'
 : rawStatus === 'alpa' || rawStatus === 'alpha' ? 'Alpha'
 : 'Belum Dicatat'

 const timeStr = att?.waktu_presensi
 ? new Date(att.waktu_presensi).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
 : '-'

 return {
 id: session.id,
 meeting: session.meeting_number || 1,
 date: sDateStr || todayStr,
 topic: session.topic || session.learning_material || (session.schedule?.subject?.name ? `Materi ${session.schedule.subject.name}` : `Pertemuan ke-${session.meeting_number || 1}`),
 status: titleStatus,
 time: timeStr,
 method: att?.recorded_method || (att ? 'Presensi KBM' : 'Belum dicatat'),
 notes: att?.keterangan || (titleStatus === 'Hadir' ? 'Hadir tepat waktu' : '-'),
 isCurrent: sDateStr === todayStr,
 }
 })

 const hasTodayInPastLogs = pastLogs.some((p) => p.date === todayStr)
 const combined = hasTodayInPastLogs ? pastLogs : [currentSession, ...pastLogs]

 return combined.sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0))
 }

 const getFilteredStudentAttendanceHistory = (history, period, refDateStr) => {
 if (!Array.isArray(history) || history.length === 0) return []
 const todayStr = refDateStr || attendanceDateFilter || new Date().toISOString().split('T')[0]

 if (period === 'harian') {
 return history.filter((h) => h.isCurrent || h.date === todayStr)
 }

 if (period === 'mingguan') {
 const curr = new Date(todayStr + 'T12:00:00')
 const day = curr.getDay()
 const diffToMon = curr.getDate() - day + (day === 0 ? -6 : 1)
 const monday = new Date(curr)
 monday.setDate(diffToMon)
 const sunday = new Date(monday)
 sunday.setDate(monday.getDate() + 6)
 const pad = (n) => String(n).padStart(2, '0')
 const monStr = `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`
 const sunStr = `${sunday.getFullYear()}-${pad(sunday.getMonth() + 1)}-${pad(sunday.getDate())}`
 return history.filter((h) => h.date >= monStr && h.date <= sunStr)
 }

 if (period === 'bulanan') {
 const curMonthPrefix = todayStr.slice(0, 7)
 return history.filter((h) => h.date && h.date.startsWith(curMonthPrefix))
 }

 // semester (semua sesi di semester ini)
 return history
 }

 const handlePrintSingleStudentAttendance = (student, period = 'semester') => {
 if (!student) return
 const activeSchedule = getCurrentSchedule() || presensiModalSchedule || {}
 const subjectName = activeSchedule?.subject?.name || activeSchedule?.subject?.nama_mapel || activeSchedule?.nama_mapel || 'Mata Pelajaran'
 const curClassName = selectedClassName || 'Rombel'
 const allHistory = getStudentAttendanceHistory(student)
 const todayStr = attendanceDateFilter || new Date().toISOString().split('T')[0]
 const history = getFilteredStudentAttendanceHistory(allHistory, period, todayStr)

 const periodLabelMap = {
 harian: 'HARIAN (HARI INI)',
 mingguan: 'MINGGUAN (PEKAN INI)',
 bulanan: 'BULANAN (BULAN INI)',
 semester: 'SEMESTER LENGKAP (16 SESI)',
 }
 const periodLabel = periodLabelMap[period] || 'SEMESTER'

 const headers = [
 'Pertemuan',
 'Tanggal',
 'Materi / Topik',
 'Status Kehadiran',
 'Waktu Absen',
 'Metode',
 'Catatan'
 ]

 const rows = history.map((item) => [
 `Pertemuan ${item.meeting}`,
 item.date,
 item.topic,
 item.status,
 item.time,
 item.method,
 item.notes
 ])

 const hadirCount = history.filter((h) => h.status === 'Hadir').length
 const terlaksanaCount = history.filter((h) => h.status !== 'Belum Terlaksana').length
 const pct = terlaksanaCount > 0 ? Math.round((hadirCount / terlaksanaCount) * 100) : 0

 printCleanTable({
 title: `REKAPITULASI PRESENSI ${periodLabel} SISWA - ${String(student.nama_lengkap || student.full_name || 'SISWA').toUpperCase()}`,
 subtitle: `NIS: ${student.nis || '-'} | NISN: ${student.nisn || '-'} | Rombel: ${curClassName} | Mapel: ${subjectName} | Guru: ${teacherName} | Filter: ${periodLabel} | Kehadiran: ${hadirCount}/${terlaksanaCount} Sesi (${pct}%)`,
 headers,
 rows,
 user,
 unit: teacherProfile?.unit || user?.employee?.unit || user?.unit,
 })
 }

 const openSubmissionsModal = async (asg) => {
 setSelectedAssignmentForSubmissions(asg)
 setShowSubmissionsModal(true)
 setLoadingSubmissions(true)
 setSubmissionSearch('')
 setSubmissionStatusFilter('all')
 try {
 const res = await api.get(`/teacher/submissions?assignment_id=${asg.id}&per_page=100`)
 const raw = res?.data?.data
 const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : [])
 setSubmissionsList(list)
 } catch (err) {
 console.error('Failed to load submissions:', err)
 addToast('error', 'Gagal Memuat Pengumpulan', err?.response?.data?.message || 'Gagal mengambil data pengumpulan tugas.')
 setSubmissionsList([])
 } finally {
 setLoadingSubmissions(false)
 }
 }

 const handleSaveSingleSubmissionGrade = async (submissionId, nilai, catatan) => {
 if (nilai === '' || isNaN(Number(nilai)) || Number(nilai) < 0 || Number(nilai) > 100) {
 addToast('warning', 'Nilai Tidak Valid', 'Masukkan nilai valid antara 0 sampai 100.')
 return
 }
 setSavingGradeId(submissionId)
 try {
 await api.post(`/teacher/submissions/${submissionId}/grade`, {
 nilai: Number(nilai),
 catatan_guru: catatan || '',
 })
 addToast('success', 'Nilai Disimpan', 'Nilai tugas siswa berhasil disimpan!')
 setSubmissionsList((prev) =>
 prev.map((sub) =>
 sub.id === submissionId
 ? { ...sub, nilai_guru: Number(nilai), catatan_guru: catatan, status: 'dinilai', waktu_dinilai: new Date().toISOString() }
 : sub
 )
 )
 // Also refresh assignments list to keep pengumpulan stats updated
 fetchAssignments()
 } catch (err) {
 addToast('error', 'Gagal Simpan Nilai', err?.response?.data?.message || 'Gagal menyimpan nilai pengumpulan.')
 } finally {
 setSavingGradeId(null)
 }
 }

 const calcAkhir = (tugas, kuis, uts, uas) => {
 const t = tugas !== '' && tugas !== null && tugas !== undefined && !isNaN(Number(tugas)) ? Number(tugas) : null
 const k = kuis !== '' && kuis !== null && kuis !== undefined && !isNaN(Number(kuis)) ? Number(kuis) : null
 const u = uts !== '' && uts !== null && uts !== undefined && !isNaN(Number(uts)) ? Number(uts) : null
 const a = uas !== '' && uas !== null && uas !== undefined && !isNaN(Number(uas)) ? Number(uas) : null
 if (t === null && k === null && u === null && a === null) return ''
 // Bobot resmi: Tugas 20%, Kuis 20%, UTS 30%, UAS 30%
 const total = (t ?? 0) * 0.2 + (k ?? 0) * 0.2 + (u ?? 0) * 0.3 + (a ?? 0) * 0.3
 return Math.round(total)
 }

 const handleSyncGradesFromAssignments = async () => {
 const cid = getCurrentClassId()
 if (!cid) {
 addToast('warning', 'Pilih Rombel', 'Pilih kelas terlebih dahulu.')
 return
 }
 setLoading(true)
 try {
 const sid = getCurrentSubjectId()
 const url = sid ? `/teacher/submissions?class_id=${cid}&subject_id=${sid}&per_page=500` : `/teacher/submissions?class_id=${cid}&per_page=500`
 const res = await api.get(url)
 const raw = res?.data?.data
 const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : [])

 const studentTugasMap = {}
 const studentKuisMap = {}
 list.forEach((sub) => {
 const sid = sub.siswa_id || sub.student_id || sub.student?.id || sub.siswa?.id
 if (sid && sub.nilai_guru !== null && sub.nilai_guru !== undefined && sub.nilai_guru !== '') {
 const isQuiz = sub.penugasan?.jenis_tugas === 'quiz' || sub.jenis_tugas === 'quiz' || sub.penugasan?.jenis_soal === 'quiz'
 if (isQuiz) {
 if (!studentKuisMap[sid]) studentKuisMap[sid] = []
 studentKuisMap[sid].push(Number(sub.nilai_guru))
 } else {
 if (!studentTugasMap[sid]) studentTugasMap[sid] = []
 studentTugasMap[sid].push(Number(sub.nilai_guru))
 }
 }
 })

 let countUpdated = 0
 const newGradesData = { ...gradesData }

 students.forEach((st) => {
 const tScores = studentTugasMap[st.id]
 const kScores = studentKuisMap[st.id]
 if ((tScores && tScores.length > 0) || (kScores && kScores.length > 0)) {
 const avgTugas = tScores && tScores.length > 0 ? Math.round(tScores.reduce((a, b) => a + b, 0) / tScores.length) : ''
 const avgKuis = kScores && kScores.length > 0 ? Math.round(kScores.reduce((a, b) => a + b, 0) / kScores.length) : ''
 const curr = newGradesData[st.id] || { nilai_tugas: '', nilai_kuis: '', nilai_uts: '', nilai_uas: '', nilai_akhir: '' }

 const finalTugas = avgTugas !== '' ? avgTugas : curr.nilai_tugas
 const finalKuis = avgKuis !== '' ? avgKuis : curr.nilai_kuis
 const newAkhir = calcAkhir(finalTugas, finalKuis, curr.nilai_uts, curr.nilai_uas)

 newGradesData[st.id] = {
 ...curr,
 nilai_tugas: finalTugas,
 nilai_kuis: finalKuis,
 nilai_akhir: newAkhir,
 }
 countUpdated++
 }
 })

 setGradesData(newGradesData)
 if (countUpdated > 0) {
 addToast('success', 'Nilai Ditarik', `Berhasil menarik nilai tugas & kuis CBT untuk ${countUpdated} siswa dari hasil LMS! Klik "Simpan Nilai Bulk" untuk menyimpan ke rapor.`)
 } else {
 addToast('info', 'Belum Ada Nilai', 'Belum ada data pengumpulan tugas atau kuis yang sudah dinilai pada rombel ini.')
 }
 } catch (err) {
 console.error('Failed to sync grades:', err)
 addToast('error', 'Gagal Menarik Nilai', err?.response?.data?.message || 'Terjadi kesalahan saat menarik data nilai tugas.')
 } finally {
 setLoading(false)
 }
 }

 const handleSaveGradesBulk = async () => {
 const classId = getCurrentClassId()
 const subjectId = getCurrentSubjectId()

 if (!classId || !subjectId) {
 addToast('warning', 'Pilih Rombel', 'Pilih kelas & jadwal mengajar terlebih dahulu.')
 return
 }

 try {
 const payload = {
 class_id: classId,
 subject_id: subjectId,
 grades: students.map((st) => {
 const g = gradesData[st.id] || {}
 return {
 student_id: st.id,
 nilai_tugas: g.nilai_tugas !== '' && g.nilai_tugas !== undefined && g.nilai_tugas !== null ? Number(g.nilai_tugas) : null,
 nilai_kuis: g.nilai_kuis !== '' && g.nilai_kuis !== undefined && g.nilai_kuis !== null ? Number(g.nilai_kuis) : null,
 score_quiz: g.nilai_kuis !== '' && g.nilai_kuis !== undefined && g.nilai_kuis !== null ? Number(g.nilai_kuis) : null,
 nilai_uts: g.nilai_uts !== '' && g.nilai_uts !== undefined && g.nilai_uts !== null ? Number(g.nilai_uts) : null,
 nilai_uas: g.nilai_uas !== '' && g.nilai_uas !== undefined && g.nilai_uas !== null ? Number(g.nilai_uas) : null,
 nilai_akhir: g.nilai_akhir !== '' && g.nilai_akhir !== undefined && g.nilai_akhir !== null ? Number(g.nilai_akhir) : null,
 catatan: g.catatan || g.notes || '',
 notes: g.catatan || g.notes || '',
 }
 }),
 }
 const response = await api.post('/teacher/grades', payload)
 addToast('success', 'Nilai Disimpan', response?.data?.message || 'Seluruh daftar nilai berhasil disimpan ke rapor!')
 await fetchGrades()
 } catch (err) {
 const message = err?.response?.data?.message || 'Gagal menyimpan daftar nilai.'
 addToast('error', 'Gagal Simpan', message)
 }
 }

 const handleSaveMateri = async (customFormData = null) => {
 const data = (customFormData && typeof customFormData === 'object' && !customFormData.preventDefault)
 ? customFormData
 : materiForm
 const classId = data.class_id || getCurrentClassId()
 const subjectId = data.subject_id || getCurrentSubjectId()

 if (!classId || !subjectId) {
 addToast('warning', 'Pilih Kelas', 'Pilih rombel dan jadwal mengajar yang tersedia sebelum menyimpan materi.')
 return
 }

 setSavingMaterial(true)
 try {
 const payload = {
 ...data,
 class_id: classId,
 subject_id: subjectId,
 tanggal_publish: data.tanggal || data.tanggal_publish,
 tanggal: data.tanggal || data.tanggal_publish,
 urutan: data.urutan,
 }
 const res = editingId
 ? await api.put(`/teacher/materials/${editingId}`, payload)
 : await api.post('/teacher/materials', payload)

 const savedItem = res?.data?.data
 setShowModal(false)
 setEditingId(null)
 addToast('success', editingId ? 'Materi Diperbarui' : 'Materi Tersimpan', res?.data?.message || 'Materi pembelajaran berhasil disimpan.')

 // Optimistic instant UI update
 if (savedItem) {
 setMaterials((prev) => {
 if (editingId) {
 return prev.map((m) => (m.id === editingId ? { ...m, ...savedItem } : m))
 }
 return [savedItem, ...prev.filter((m) => m.id !== savedItem.id)]
 })
 }

 // Background re-fetch to sync pagination count without blocking user
 fetchMaterials()
 } catch (err) {
 addToast('error', 'Gagal Simpan', err?.response?.data?.message || 'Gagal menyimpan materi pembelajaran.')
 } finally {
 setSavingMaterial(false)
 }
 }

 // ── Bank-Soal Helpers ─────────────────────────────────────────────────────
 const resetSoalForm = () => {
 setEditingSoalIdx(null)
 setSoalForm({ tipe: 'pg', pertanyaan: '', opsi_a: '', opsi_b: '', opsi_c: '', opsi_d: '', opsi_e: '', kunci_jawaban: 'A', poin: 2, tingkat_kesulitan: 'sedang', indikator: '', pembahasan: '', matchingPairs: [{ kiri: '', kanan: '' }, { kiri: '', kanan: '' }] })
 }

 const handleSoalTypeChange = (tipe) => {
 let defaultKunci = ''
 if (tipe === 'pg') defaultKunci = 'A'
 if (tipe === 'benar_salah') defaultKunci = 'Benar'
 setSoalForm((prev) => ({ ...prev, tipe, kunci_jawaban: defaultKunci }))
 }

 const handleAddSoal = () => {
 if (!soalForm.pertanyaan.trim()) {
 addToast('warning', 'Teks Soal Kosong', 'Isi teks pertanyaan terlebih dahulu sebelum menambahkan soal.')
 return
 }
 if (soalForm.tipe === 'pg' && (!soalForm.opsi_a.trim() || !soalForm.opsi_b.trim())) {
 addToast('warning', 'Opsi Tidak Lengkap', 'Pilihan Ganda membutuhkan minimal opsi A dan B.')
 return
 }
 const newSoal = {
 ...soalForm,
 matchingPairs: soalForm.tipe === 'menjodohkan' ? soalForm.matchingPairs.filter(p => p.kiri.trim() && p.kanan.trim()) : undefined,
 }
 if (editingSoalIdx !== null) {
 setSoalList((prev) => prev.map((s, i) => i === editingSoalIdx ? newSoal : s))
 addToast('success', 'Soal Diperbarui', `Soal #${editingSoalIdx + 1} berhasil diperbarui.`)
 } else {
 setSoalList((prev) => [...prev, newSoal])
 addToast('success', 'Soal Ditambahkan', `Soal #${soalList.length + 1} berhasil ditambahkan.`)
 }
 resetSoalForm()
 }

 const handleEditSoal = (idx) => {
 const s = soalList[idx]
 setEditingSoalIdx(idx)
 setSoalForm({ ...s, matchingPairs: s.matchingPairs || [{ kiri: '', kanan: '' }, { kiri: '', kanan: '' }] })
 const el = document.getElementById('soalFormSection')
 if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
 }

 const handleDeleteSoal = (idx) => {
 setSoalList((prev) => prev.filter((_, i) => i !== idx))
 if (editingSoalIdx === idx) resetSoalForm()
 }

 // Auto-tipe berdasarkan nomor soal: #1-10 = PG, #11-20 = Essay, dst.
 const getAutoTipe = (nextSoalCount) => {
 const mod = nextSoalCount % 20
 if (mod < 10) return 'pg' // soal ke-1..10, 21..30, dst.
 return 'esai' // soal ke-11..20, 31..40, dst.
 }

 const handlePrepareNewSoal = () => {
 const nextIdx = soalList.length
 const autoTipe = getAutoTipe(nextIdx)
 const autoKunci = autoTipe === 'pg' ? 'A' : autoTipe === 'benar_salah' ? 'Benar' : ''
 setEditingSoalIdx(null)
 setSoalForm({
 tipe: autoTipe,
 pertanyaan: '',
 opsi_a: '', opsi_b: '', opsi_c: '', opsi_d: '', opsi_e: '',
 kunci_jawaban: autoKunci,
 poin: autoTipe === 'esai' ? 5 : 2,
 tingkat_kesulitan: 'sedang',
 indikator: '',
 pembahasan: '',
 matchingPairs: [{ kiri: '', kanan: '' }, { kiri: '', kanan: '' }],
 })
 const el = document.getElementById('soalFormSection')
 if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
 }

 const handleCreateTaskFromMaterial = (material) => {
 setEditingId(null)
 const activeClassId = material.class_id || material.kelas_id || material.modul_ajar?.kelas_id || (selectedClass !== 'all' ? selectedClass : '')
 const activeSubjectId = material.subject_id || material.mata_pelajaran_id || material.modul_ajar?.mata_pelajaran_id || getCurrentSubjectId()

 // Default deadline 7 days from today
 const d = new Date()
 d.setDate(d.getDate() + 7)
 const defaultDeadline = d.toISOString().split('T')[0]

 setTugasForm({
 judul: `Latihan: ${material.judul}`,
 subject_id: activeSubjectId,
 class_id: activeClassId,
 materi_id: material.id,
 materi_ids: [material.id],
 instruksi: material.ringkasan
 ? `Silakan pelajari materi "${material.judul}" lalu selesaikan penugasan evaluasi berikut.`
 : `Kerjakan penugasan evaluasi pemahaman untuk materi "${material.judul}".`,
 deskripsi: '',
 tipe_tugas: 'both',
 jenis_soal: 'essay',
 deadline: defaultDeadline,
 bobot: 100,
 file_lampiran: null,
 file_lampiran_preview: null,
 existing_file_url: null,
 })
 setSoalList([])
 resetSoalForm()
 setModalType('tugas')
 setShowModal(true)
 }

 const handleEditTugas = (asg) => {
 setEditingId(asg.id)
 const d = asg.deadline ? (asg.deadline.includes('T') ? asg.deadline.split('T')[0] : asg.deadline) : ''
 let initialMateriIds = []
 if (Array.isArray(asg.materi_ids) && asg.materi_ids.length > 0) {
 initialMateriIds = asg.materi_ids
 } else if (Array.isArray(asg.materials) && asg.materials.length > 0) {
 initialMateriIds = asg.materials.map((m) => m.id)
 } else if (asg.materi_id || asg.materi?.id) {
 initialMateriIds = [asg.materi_id || asg.materi?.id]
 }

 setTugasForm({
 judul: asg.judul || asg.judul_tugas || '',
 subject_id: asg.mata_pelajaran_id || asg.subject_id || getCurrentSubjectId(),
 class_id: asg.kelas_id || asg.class_id || getCurrentClassId(),
 materi_id: initialMateriIds[0] || '',
 materi_ids: initialMateriIds,
 instruksi: asg.instruksi || '',
 deskripsi: '',
 tipe_tugas: asg.tipe_tugas || 'both',
 jenis_tugas: asg.jenis_tugas || (asg.jenis_soal === 'quiz' ? 'quiz' : 'tugas'),
 jenis_soal: asg.jenis_tugas || asg.jenis_soal || 'essay',
 deadline: d,
 bobot: asg.bobot || asg.bobot_persen || 100,
 durasi_menit: asg.durasi_menit || 30,
 nilai_kkm: asg.nilai_kkm || 75,
 file_lampiran: null,
 file_lampiran_preview: null,
 existing_file_url: asg.file_lampiran_url || null,
 })
 // Parse soal_json back into soalList
 try {
 const raw = asg.soal_json || asg.deskripsi || asg.soal_manual || ''
 if (raw && raw.trim().startsWith('[')) {
 const parsed = JSON.parse(raw)
 setSoalList(Array.isArray(parsed) ? parsed : [])
 } else {
 setSoalList([])
 }
 } catch {
 setSoalList([])
 }
 resetSoalForm()
 setModalType('tugas')
 setShowModal(true)
 }

 const handleOpenCreateQuiz = () => {
 setEditingId(null)
 const pool = schedules.length > 0 ? schedules : allTeacherSchedules
 const activeClassId = getCurrentClassId()
 const matchSch = pool.find((s) => String(s.class_id || s.kelas_id || s.kelas?.id || s.class?.id) === String(activeClassId))
 const defDl = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
 setTugasForm({
 judul: 'Kuis CBT: Evaluasi Harian',
 subject_id: matchSch?.subject_id || matchSch?.subject?.id || getCurrentSubjectId(),
 class_id: activeClassId,
 materi_id: '',
 materi_ids: [],
 instruksi: 'Kerjakan kuis interaktif berikut secara mandiri dalam batas durasi yang ditentukan.',
 deskripsi: '',
 tipe_tugas: 'online',
 jenis_tugas: 'quiz',
 jenis_soal: 'objektif',
 deadline: defDl,
 bobot: 100,
 durasi_menit: 30,
 nilai_kkm: 75,
 file_lampiran: null,
 file_lampiran_preview: null,
 existing_file_url: null,
 })
 setSoalList([])
 resetSoalForm()
 setModalType('tugas')
 setShowModal(true)
 }

 const handleOpenCbtPreview = (asg) => {
 let parsedSoal = []
 try {
 const raw = asg.soal_json || asg.deskripsi || ''
 if (raw && raw.trim().startsWith('[')) {
 parsedSoal = JSON.parse(raw)
 }
 } catch {
 parsedSoal = []
 }

 if (!Array.isArray(parsedSoal) || parsedSoal.length === 0) {
 addToast('warning', 'Belum Ada Soal', 'Kuis ini belum memiliki butir soal interaktif untuk dipratinjau.')
 return
 }

 setCbtPreviewModal({
 ...asg,
 parsedSoal,
 })
 setCbtCurrentIdx(0)
 setCbtAnswers({})
 setCbtDoubtful({})
 setCbtFinishedScore(null)
 }

 const handleSaveTugas = async (e) => {
 e.preventDefault()
 const classId = tugasForm.class_id || getCurrentClassId()
 const subjectId = tugasForm.subject_id || getCurrentSubjectId()

 if (!classId || !subjectId) {
 addToast('warning', 'Pilih Kelas', 'Pilih rombel dan jadwal mengajar sebelum membuat tugas baru.')
 return
 }

 setSavingTugas(true)
 try {
 const formData = new FormData()
 formData.append('class_id', classId)
 formData.append('subject_id', subjectId)
 formData.append('judul', tugasForm.judul)
 if (tugasForm.materi_id) {
 formData.append('materi_id', tugasForm.materi_id)
 }
 if (Array.isArray(tugasForm.materi_ids) && tugasForm.materi_ids.length > 0) {
 tugasForm.materi_ids.forEach((id) => formData.append('materi_ids[]', id))
 formData.append('materi_ids_json', JSON.stringify(tugasForm.materi_ids))
 }
 formData.append('instruksi', tugasForm.instruksi || 'Kerjakan tugas sesuai arahan guru.')
 formData.append('deskripsi', soalList.length > 0 ? JSON.stringify(soalList) : (tugasForm.deskripsi || ''))
 formData.append('soal_json', soalList.length > 0 ? JSON.stringify(soalList) : '')
 formData.append('tipe_tugas', tugasForm.tipe_tugas || 'both')
 formData.append('jenis_tugas', tugasForm.jenis_tugas || 'tugas')
 formData.append('durasi_menit', String(tugasForm.durasi_menit || 30))
 formData.append('nilai_kkm', String(tugasForm.nilai_kkm || 75))
 const derivedJenis = soalList.length > 0
 ? (soalList.some((s) => s.tipe === 'pg') && soalList.some((s) => s.tipe === 'esai')
 ? 'campuran'
 : soalList.some((s) => s.tipe === 'pg')
 ? 'objektif'
 : 'essay')
 : (tugasForm.jenis_soal || 'essay')
 formData.append('jenis_soal', derivedJenis)
 formData.append('deadline', tugasForm.deadline)
 formData.append('bobot', String(tugasForm.bobot || 100))
 if (tugasForm.file_lampiran) {
 formData.append('file_lampiran', tugasForm.file_lampiran)
 }

 const res = editingId
 ? await api.post(`/teacher/assignments/${editingId}`, formData, {
 headers: { 'Content-Type': 'multipart/form-data' },
 })
 : await api.post('/teacher/assignments', formData, {
 headers: { 'Content-Type': 'multipart/form-data' },
 })

 setShowModal(false)
 setEditingId(null)
 setSoalList([])
 resetSoalForm()
 await fetchAssignments()
 addToast('success', editingId ? 'Tugas Diperbarui' : (tugasForm.jenis_tugas === 'quiz' ? 'Kuis CBT Diterbitkan' : 'Tugas Diterbitkan'), res?.data?.message || (editingId ? 'Penugasan berhasil diperbarui.' : 'Penugasan baru berhasil diterbitkan untuk siswa!'))
 } catch (err) {
 addToast('error', 'Gagal Simpan', err?.response?.data?.message || (editingId ? 'Gagal memperbarui penugasan.' : 'Gagal membuat penugasan baru.'))
 } finally {
 setSavingTugas(false)
 }
 }

 const handleSaveTahfizh = async (e) => {
 e.preventDefault()
 if (!tahfizhForm.student_id) {
 addToast('warning', 'Pilih Siswa', 'Silakan pilih siswa terlebih dahulu.')
 return
 }

 if (!tahfizhForm.surah_number) {
 addToast('warning', 'Pilih Surah', 'Pilih surah dari Master Al-Qur’an terlebih dahulu.')
 return
 }

 setSavingTahfizh(true)
 try {
 const targetClass = selectedTahfizhStudent?.kelas_id || selectedTahfizhStudent?.class_id || getCurrentClassId()
 const res = await api.post('/teacher/tahfizh', { ...tahfizhForm, class_id: targetClass })
 setShowModal(false)
 await fetchTahfizh()
 addToast('success', 'Setoran Tahfizh Disimpan', res?.data?.message || 'Catatan setoran hafalan siswa berhasil disimpan!')
 } catch (err) {
 addToast('error', 'Gagal Simpan', err?.response?.data?.message || 'Gagal menyimpan setoran tahfizh.')
 } finally {
 setSavingTahfizh(false)
 }
 }

 const handleSaveCatatan = async (e) => {
 e.preventDefault()
 if (!catatanForm.student_id) {
 addToast('warning', 'Pilih Siswa', 'Silakan pilih siswa terlebih dahulu.')
 return
 }

 setSavingStudentNote(true)
 try {
 const res = editingId
 ? await api.put(`/teacher/student-notes/${editingId}`, catatanForm)
 : await api.post('/teacher/student-notes', catatanForm)
 setShowModal(false)
 setEditingId(null)
 setCatatanForm({ ...emptyCatatanForm })
 await fetchStudentNotes()
 addToast('success', editingId ? 'Catatan Diperbarui' : 'Catatan Disimpan', res?.data?.message || 'Catatan perkembangan siswa berhasil disimpan.')
 } catch (err) {
 addToast('error', 'Gagal Simpan', err?.response?.data?.message || 'Gagal menyimpan catatan siswa.')
 } finally {
 setSavingStudentNote(false)
 }
 }

 const handleSavePelanggaran = async (e) => {
 e?.preventDefault()
 if (!pelanggaranForm.student_id) {
 addToast('warning', 'Pilih Santri', 'Silakan pilih siswa/santri terlebih dahulu.')
 return
 }
 if (!pelanggaranForm.category_id) {
 addToast('warning', 'Pilih Pasal Tata Tertib', 'Silakan tentukan pasal penilaian perilaku yang diatur TU.')
 return
 }
 if (!pelanggaranForm.description.trim()) {
 addToast('warning', 'Isi Kronologi Perilaku', 'Silakan masukkan deskripsi atau kronologi penilaian perilaku santri.')
 return
 }

 setSavingPelanggaran(true)
 try {
 const activeClassId = getCurrentClassId()
 const payload = {
 student_id: pelanggaranForm.student_id,
 category_id: pelanggaranForm.category_id,
 points: -Math.abs(pelanggaranForm.points || 5),
 custom_points: Math.abs(pelanggaranForm.points || 5),
 description: pelanggaranForm.description.trim(),
 transaction_date: pelanggaranForm.transaction_date || new Date().toISOString().split('T')[0],
 status: pelanggaranForm.refer_bk ? 'dirujuk_bk' : (pelanggaranForm.status || 'tercatat'),
 follow_up: pelanggaranForm.refer_bk ? 'Dirujuk ke Guru BK / Wali Kelas' : (pelanggaranForm.follow_up || null),
 class_id: activeClassId || null,
 schedule_id: activeSchedule?.id || null,
 }

 await api.post('/teacher/discipline-violations', payload)
 setShowModal(false)
 setPelanggaranForm(emptyPelanggaranForm)
 await fetchStudentNotes()
 addToast(
 'success',
 'Penilaian Perilaku Tersimpan',
 `Catatan perilaku santri berhasil dicatat (-${Math.abs(pelanggaranForm.points || 5)} poin) sesuai ketentuan TU dan disinkronkan ke Buku Poin & Orang Tua.`
 )
 } catch (err) {
 addToast('error', 'Gagal Simpan', err?.response?.data?.message || 'Gagal menyimpan penilaian perilaku santri.')
 } finally {
 setSavingPelanggaran(false)
 }
 }

 const confirmDeleteModal = (type, id, title) => {
 setModalType('delete-confirm')
 setDeleteTarget({ type, id, title })
 setShowModal(true)
 }

 const handleExecuteDelete = async () => {
 if (!deleteTarget) return
 const { type, id } = deleteTarget
 try {
 if (type === 'materi') {
 await api.delete(`/teacher/materials/${id}`)
 await fetchMaterials()
 } else if (type === 'tugas') {
 await api.delete(`/teacher/assignments/${id}`)
 await fetchAssignments()
 } else if (type === 'catatan') {
 await api.delete(`/teacher/student-notes/${id}`)
 await fetchStudentNotes()
 }
 setShowModal(false)
 setDeleteTarget(null)
 addToast('success', 'Data Dihapus', `Data ${deleteTarget.title} berhasil dihapus dari sistem.`)
 } catch (e) {
 addToast('error', 'Gagal Menghapus', 'Terjadi kesalahan saat menghapus data.')
 }
 }

 const exportToSpreadsheet = (columns, rows, filename, format) => {
 const escape = (val) => `"${String(val ?? '').replaceAll('"', '""')}"`
 const headerLine = columns.map((col) => escape(col.label || col.header)).join(',')
 const dataLines = rows.map((row, idx) =>
 columns.map((col) => escape(typeof col.accessor === 'function' ? col.accessor(row, idx) : (row[col.key] ?? ''))).join(',')
 )
 const fileContent = `\uFEFF${[headerLine, ...dataLines].join('\r\n')}`

 let mimeType = 'text/csv;charset=utf-8;'
 let ext = '.csv'
 if (format === 'xlsx') {
 mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
 ext = '.xlsx'
 } else if (format === 'xls') {
 mimeType = 'application/vnd.ms-excel'
 ext = '.xls'
 }

 const blob = new Blob([fileContent], { type: mimeType })
 const url = URL.createObjectURL(blob)
 const link = document.createElement('a')
 link.href = url
 link.download = `${filename}_${new Date().toISOString().slice(0, 10)}${ext}`
 document.body.appendChild(link)
 link.click()
 document.body.removeChild(link)
 URL.revokeObjectURL(url)
 }

 const handleProcessExport = () => {
 setShowExportModal(false)

 if (activeTab === 'log-absensi') {
 if (filteredTeacherLogs.length === 0) {
 addToast('warning', 'Tidak Ada Data', 'Tidak ada data log absensi untuk diekspor.')
 return
 }
 if (exportFormat === 'pdf') {
 downloadPdfTable({
 title: `Log Kehadiran Guru - ${teacherName}`,
 subtitle: `Periode: ${teacherLogMonth === 'semua' ? 'Semua Riwayat' : teacherLogMonth} | Total: ${filteredTeacherLogs.length} Hari`,
 data: filteredTeacherLogs,
 columns: [
 { header: 'Tanggal', accessor: (r) => `${r.date} (${r.day || '-'})` },
 { header: 'Masuk', accessor: (r) => (r.check_in ? `${r.check_in} WIB` : '-') },
 { header: 'Pulang', accessor: (r) => (r.check_out ? `${r.check_out} WIB` : '-') },
 { header: 'Durasi', accessor: (r) => r.duration || '-' },
 { header: 'Status', accessor: (r) => r.status || '-' },
 { header: 'Metode', accessor: (r) => `${r.method || '-'} (${r.device || '-'})` },
 ],
 filename: `log_absensi_guru_${teacherLogMonth}_${new Date().toISOString().slice(0, 10)}.pdf`,
 })
 } else {
 exportToSpreadsheet(
 [
 { label: 'Tanggal', accessor: (r) => r.date },
 { label: 'Hari', accessor: (r) => r.day || '-' },
 { label: 'Waktu Masuk', accessor: (r) => (r.check_in ? `${r.check_in} WIB` : '-') },
 { label: 'Waktu Pulang', accessor: (r) => (r.check_out ? `${r.check_out} WIB` : '-') },
 { label: 'Durasi Kerja', accessor: (r) => r.duration || '-' },
 { label: 'Status', accessor: (r) => r.status || '-' },
 { label: 'Metode Absensi', accessor: (r) => r.method || '-' },
 { label: 'Perangkat', accessor: (r) => r.device || '-' },
 ],
 filteredTeacherLogs,
 `rekap_log_kehadiran_guru_${teacherLogMonth}`,
 exportFormat
 )
 }
 addToast('success', 'Export Selesai', `File log absensi guru (${exportFormat.toUpperCase()}) berhasil diunduh.`)
 return
 }

 if (activeTab === 'penilaian') {
 if (students.length === 0) {
 addToast('warning', 'Tidak Ada Data', 'Tidak ada data siswa rombel untuk diekspor.')
 return
 }
 const gradeCols = [
 { label: 'No', accessor: (_, idx) => idx + 1 },
 { label: 'NIS', accessor: (s) => s.nis || '-' },
 { label: 'NISN', accessor: (s) => s.nisn || '-' },
 { label: 'Nama Lengkap Siswa', accessor: (s) => s.nama_lengkap || s.full_name },
 { label: 'Rombel', accessor: () => selectedClassName },
 { label: 'Nilai Tugas (20%)', accessor: (s) => gradesData[s.id]?.nilai_tugas ?? '' },
 { label: 'Nilai Kuis (20%)', accessor: (s) => gradesData[s.id]?.nilai_kuis ?? '' },
 { label: 'Nilai UTS (30%)', accessor: (s) => gradesData[s.id]?.nilai_uts ?? '' },
 { label: 'Nilai UAS (30%)', accessor: (s) => gradesData[s.id]?.nilai_uas ?? '' },
 { label: 'Nilai Akhir', accessor: (s) => gradesData[s.id]?.nilai_akhir ?? '' },
 ]

 if (exportFormat === 'pdf') {
 downloadPdfTable({
 title: `Buku Rekapitulasi Nilai Siswa - ${selectedClassName}`,
 subtitle: `Mata Pelajaran: ${getCurrentSchedule()?.subject?.name || 'KBM'} | Guru Pengampu: ${teacherName}`,
 data: students,
 columns: gradeCols.map((c) => ({ header: c.label, accessor: c.accessor })),
 filename: `rekap_nilai_${selectedClassName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`,
 })
 } else {
 exportToSpreadsheet(gradeCols, students, `rekap_nilai_${selectedClassName.replace(/\s+/g, '_')}`, exportFormat)
 }
 addToast('success', 'Export Selesai', `Buku nilai siswa rombel ${selectedClassName} (${exportFormat.toUpperCase()}) berhasil diunduh.`)
 return
 }

 // Default: Export Presensi KBM Harian / Rekapitulasi
 const exportStudents = filteredAttendanceStudents.length > 0 ? filteredAttendanceStudents : students
 if (exportStudents.length === 0) {
 addToast('warning', 'Tidak Ada Data', 'Tidak ada data presensi siswa untuk diekspor.')
 return
 }

 const attendanceCols = [
 { label: 'No', accessor: (_, idx) => idx + 1 },
 { label: 'NIS', accessor: (s) => s.nis || '-' },
 { label: 'NISN', accessor: (s) => s.nisn || '-' },
 { label: 'Nama Siswa', accessor: (s) => s.nama_lengkap || s.full_name },
 { label: 'Rombel', accessor: () => selectedClassName },
 { label: 'Tanggal', accessor: () => attendanceDateFilter },
 { label: 'Status Kehadiran', accessor: (s) => attendanceData[s.id]?.status || 'Belum Dicatat' },
 { label: 'Waktu Absen', accessor: (s) => (attendanceData[s.id]?.check_in_time ? `${attendanceData[s.id].check_in_time} WIB` : '-') },
 { label: 'Metode Presensi', accessor: (s) => attendanceData[s.id]?.method || 'Roll Call Guru' },
 { label: 'Catatan Khusus', accessor: (s) => attendanceData[s.id]?.notes || '-' },
 ]

 if (exportFormat === 'pdf') {
 downloadPdfTable({
 title: `Lembar Presensi KBM - ${selectedClassName}`,
 subtitle: `Tanggal: ${attendanceDateFilter} | Topik: ${attendanceTopic} | Guru: ${teacherName}`,
 data: exportStudents,
 columns: attendanceCols.map((c) => ({ header: c.label, accessor: c.accessor })),
 filename: `rekap_presensi_${selectedClassName.replace(/\s+/g, '_')}_${attendanceDateFilter}.pdf`,
 })
 } else {
 exportToSpreadsheet(attendanceCols, exportStudents, `rekap_presensi_${selectedClassName.replace(/\s+/g, '_')}_${attendanceDateFilter}`, exportFormat)
 }

 addToast('success', 'Export Selesai', `Rekap presensi siswa rombel ${selectedClassName} (${exportFormat.toUpperCase()}) berhasil diunduh.`)
 }

 const handleDownloadImportTemplate = (targetType) => {
 if (targetType === 'penilaian') {
 const templateCols = [
 { label: 'NIS', key: 'nis' },
 { label: 'NISN', key: 'nisn' },
 { label: 'Nama Lengkap Siswa', key: 'nama_lengkap' },
 { label: 'Nilai Tugas (0-100)', key: 'nilai_tugas' },
 { label: 'Nilai Kuis (0-100)', key: 'nilai_kuis' },
 { label: 'Nilai UTS (0-100)', key: 'nilai_uts' },
 { label: 'Nilai UAS (0-100)', key: 'nilai_uas' },
 ]
 const sampleRows = students.map((s) => ({
 nis: s.nis || '',
 nisn: s.nisn || '',
 nama_lengkap: s.nama_lengkap || s.full_name || '',
 nilai_tugas: gradesData[s.id]?.nilai_tugas ?? 85,
 nilai_kuis: gradesData[s.id]?.nilai_kuis ?? 90,
 nilai_uts: gradesData[s.id]?.nilai_uts ?? 80,
 nilai_uas: gradesData[s.id]?.nilai_uas ?? 88,
 }))
 exportToSpreadsheet(templateCols, sampleRows, `template_import_nilai_${selectedClassName.replace(/\s+/g, '_')}`, 'xlsx')
 } else {
 const templateCols = [
 { label: 'NIS', key: 'nis' },
 { label: 'NISN', key: 'nisn' },
 { label: 'Nama Lengkap Siswa', key: 'nama_lengkap' },
 { label: 'Status Kehadiran (Hadir/Izin/Sakit/Alpha/Terlambat)', key: 'status' },
 { label: 'Catatan Guru', key: 'notes' },
 ]
 const sampleRows = students.map((s) => ({
 nis: s.nis || '',
 nisn: s.nisn || '',
 nama_lengkap: s.nama_lengkap || s.full_name || '',
 status: attendanceData[s.id]?.status || 'Hadir',
 notes: attendanceData[s.id]?.notes || '',
 }))
 exportToSpreadsheet(templateCols, sampleRows, `template_import_presensi_${selectedClassName.replace(/\s+/g, '_')}`, 'xlsx')
 }
 addToast('success', 'Template Diunduh', 'Gunakan template ini untuk mengisi data offline lalu upload kembali.')
 }

 const handleProcessImport = async () => {
 if (!importFile) {
 setImportError('Silakan pilih berkas spreadsheet (.csv, .xls, .xlsx) terlebih dahulu.')
 return
 }

 try {
 setIsImporting(true)
 setImportError('')
 const text = await importFile.text()
 const lines = text.split(/\r\n|\n|\r/).map((l) => l.trim()).filter(Boolean)

 if (lines.length <= 1) {
 throw new Error('Berkas tidak memiliki data baris untuk diimpor.')
 }

 let parsedCount = 0
 if (importTarget === 'penilaian') {
 const nextGrades = { ...gradesData }
 // Format baris: NIS, NISN, Nama, Nilai Tugas, [Nilai Kuis], Nilai UTS, Nilai UAS
 lines.slice(1).forEach((line) => {
 const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim())
 if (cols.length >= 4) {
 const rawNis = cols[0]
 const rawNisn = cols[1]
 const rawName = cols[2].toLowerCase()

 const matchStudent = students.find((s) => {
 if (rawNis && s.nis && String(s.nis) === String(rawNis)) return true
 if (rawNisn && s.nisn && String(s.nisn) === String(rawNisn)) return true
 return (s.nama_lengkap || s.full_name || '').toLowerCase() === rawName
 })

 if (matchStudent) {
 let tugas = ''
 let kuis = ''
 let uts = ''
 let uas = ''

 if (cols.length >= 7) {
 // New format with kuis
 tugas = cols[3] !== '' && !isNaN(Number(cols[3])) ? Number(cols[3]) : ''
 kuis = cols[4] !== '' && !isNaN(Number(cols[4])) ? Number(cols[4]) : ''
 uts = cols[5] !== '' && !isNaN(Number(cols[5])) ? Number(cols[5]) : ''
 uas = cols[6] !== '' && !isNaN(Number(cols[6])) ? Number(cols[6]) : ''
 } else {
 // Backward compatible format without kuis
 tugas = cols[3] !== '' && !isNaN(Number(cols[3])) ? Number(cols[3]) : ''
 uts = cols[4] !== '' && !isNaN(Number(cols[4])) ? Number(cols[4]) : ''
 uas = cols[5] !== '' && !isNaN(Number(cols[5])) ? Number(cols[5]) : ''
 }

 const t = tugas !== '' ? Number(tugas) : null
 const q = kuis !== '' ? Number(kuis) : null
 const m = uts !== '' ? Number(uts) : null
 const a = uas !== '' ? Number(uas) : null

 let akhir = ''
 if (t !== null || q !== null || m !== null || a !== null) {
 akhir = Math.round((t ?? 0) * 0.2 + (q ?? 0) * 0.2 + (m ?? 0) * 0.3 + (a ?? 0) * 0.3)
 }

 nextGrades[matchStudent.id] = {
 ...(nextGrades[matchStudent.id] || {}),
 nilai_tugas: tugas,
 nilai_kuis: kuis,
 nilai_uts: uts,
 nilai_uas: uas,
 nilai_akhir: akhir,
 }
 parsedCount++
 }
 }
 })
 setGradesData(nextGrades)
 addToast('success', 'Import Nilai Berhasil', `Berhasil memproses nilai untuk ${parsedCount} siswa rombel ${selectedClassName}.`)
 } else {
 // Import Presensi
 const nextAtt = { ...attendanceData }
 const validStatuses = ['hadir', 'izin', 'sakit', 'alpha', 'terlambat']
 lines.slice(1).forEach((line) => {
 const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim())
 if (cols.length >= 3) {
 const rawNis = cols[0]
 const rawNisn = cols[1]
 const rawName = cols[2].toLowerCase()
 const rawStatus = (cols[3] || 'Hadir').trim()
 const rawNotes = cols[4] || ''

 const matchStudent = students.find((s) => {
 if (rawNis && s.nis && String(s.nis) === String(rawNis)) return true
 if (rawNisn && s.nisn && String(s.nisn) === String(rawNisn)) return true
 return (s.nama_lengkap || s.full_name || '').toLowerCase() === rawName
 })

 if (matchStudent) {
 const matchedStatus = validStatuses.includes(rawStatus.toLowerCase())
 ? rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase()
 : 'Hadir'

 nextAtt[matchStudent.id] = {
 ...(nextAtt[matchStudent.id] || {}),
 status: matchedStatus,
 method: 'Import File',
 check_in_time: '-',
 notes: rawNotes,
 }
 parsedCount++
 }
 }
 })
 setAttendanceData(nextAtt)
 addToast('success', 'Import Presensi Berhasil', `Berhasil memproses presensi untuk ${parsedCount} siswa rombel ${selectedClassName}.`)
 }

 setShowImportModal(false)
 setImportFile(null)
 setImportError('')
 } catch (err) {
 setImportError(err.message || 'Gagal memproses berkas import. Pastikan format kolom sesuai dengan template.')
 } finally {
 setIsImporting(false)
 }
 }

 const sortedCatatanStudents = useMemo(() => {
 const list = students.filter((student) => {
 if (selectedClass && selectedClass !== 'all') {
 const sClassId = student.kelas_id || student.class_id || student.kelas?.id
 if (!sClassId || String(sClassId) !== String(selectedClass)) return false
 }
 const query = studentNoteSearch.trim().toLowerCase()
 const matchesSearch = !query || [student.nama_lengkap, student.full_name, student.nis, student.nisn]
 .some((value) => String(value || '').toLowerCase().includes(query))
 const notes = studentNotes.filter((note) => note.student_id === student.id)
 const matchesCategory = studentNoteCategory === 'semua' || notes.some((note) => note.category === studentNoteCategory)
 const matchesPriority = studentNotePriority === 'semua' || notes.some((note) => note.priority === studentNotePriority)
 return matchesSearch && matchesCategory && matchesPriority
 })

 return list.sort((a, b) => {
 let valA = ''
 let valB = ''
 const notesA = studentNotes.filter((note) => note.student_id === a.id)
 const notesB = studentNotes.filter((note) => note.student_id === b.id)
 if (catatanSortField === 'name') {
 valA = (a.nama_lengkap || a.full_name || '').toLowerCase()
 valB = (b.nama_lengkap || b.full_name || '').toLowerCase()
 } else if (catatanSortField === 'count') {
 const diff = notesA.length - notesB.length
 return catatanSortOrder === 'asc' ? diff : -diff
 } else if (catatanSortField === 'date') {
 valA = notesA[0]?.date || ''
 valB = notesB[0]?.date || ''
 }
 const cmp = String(valA).localeCompare(String(valB), 'id', { numeric: true })
 return catatanSortOrder === 'asc' ? cmp : -cmp
 })
 }, [students, selectedClass, studentNoteSearch, studentNotes, studentNoteCategory, studentNotePriority, catatanSortField, catatanSortOrder])
 const catatanStudents = sortedCatatanStudents

 const filteredAttendanceStudents = useMemo(() => {
 const list = students.filter((student) => {
 if (selectedClass && selectedClass !== 'all') {
 const sClassId = student.kelas_id || student.class_id || student.kelas?.id
 // Strict: tolak jika kelas_id tidak ada atau tidak cocok
 if (!sClassId || String(sClassId) !== String(selectedClass)) return false
 }
 const query = (debouncedAttendanceSearch || '').trim().toLowerCase()
 const studentStatus = attendanceData[student.id]?.status || 'Belum Dicatat'
 const matchesSearch = !query || [student.nama_lengkap, student.full_name, student.nis, student.nisn]
 .some((value) => String(value || '').toLowerCase().includes(query))
 const matchesStatus = !attendanceStatusFilter || studentStatus === attendanceStatusFilter
 return matchesSearch && matchesStatus
 })

 return list.sort((a, b) => {
 let valA = ''
 let valB = ''
 if (attendanceSortField === 'name') {
 valA = (a.nama_lengkap || a.full_name || '').toLowerCase()
 valB = (b.nama_lengkap || b.full_name || '').toLowerCase()
 } else if (attendanceSortField === 'nis') {
 valA = a.nis || a.nisn || ''
 valB = b.nis || b.nisn || ''
 } else if (attendanceSortField === 'status') {
 valA = attendanceData[a.id]?.status || 'Belum Dicatat'
 valB = attendanceData[b.id]?.status || 'Belum Dicatat'
 } else if (attendanceSortField === 'time') {
 valA = attendanceData[a.id]?.waktu || ''
 valB = attendanceData[b.id]?.waktu || ''
 }
 const cmp = String(valA).localeCompare(String(valB), 'id', { numeric: true })
 return attendanceSortOrder === 'asc' ? cmp : -cmp
 })
 }, [students, selectedClass, debouncedAttendanceSearch, attendanceStatusFilter, attendanceData, attendanceSortField, attendanceSortOrder])

 const totalAttendancePages = Math.max(1, Math.ceil(filteredAttendanceStudents.length / attendancePerPage))
 const paginatedAttendanceStudents = useMemo(() => {
 const start = (attendancePage - 1) * attendancePerPage
 return filteredAttendanceStudents.slice(start, start + attendancePerPage)
 }, [filteredAttendanceStudents, attendancePage, attendancePerPage])

 const sortedGradeStudents = useMemo(() => {
 return [...students].sort((a, b) => {
 const gradeA = gradesData[a.id] || {}
 const gradeB = gradesData[b.id] || {}
 if (gradeSortField === 'name') {
 const valA = (a.nama_lengkap || a.full_name || '').toLowerCase()
 const valB = (b.nama_lengkap || b.full_name || '').toLowerCase()
 const cmp = valA.localeCompare(valB, 'id')
 return gradeSortOrder === 'asc' ? cmp : -cmp
 } else if (['tugas', 'kuis', 'uts', 'uas', 'akhir'].includes(gradeSortField)) {
 const key = `nilai_${gradeSortField}`
 const numA = Number(gradeA[key] ?? -1)
 const numB = Number(gradeB[key] ?? -1)
 const diff = numA - numB
 return gradeSortOrder === 'asc' ? diff : -diff
 }
 return 0
 })
 }, [students, gradesData, gradeSortField, gradeSortOrder])

 useEffect(() => {
 setAttendancePage(1)
 }, [debouncedAttendanceSearch, attendanceStatusFilter, attendancePeriodFilter, attendanceDateFilter, attendanceWeekFilter, attendanceMonthFilter, attendanceSemesterFilter, selectedClass])

 const historySummary = useMemo(() => {
 let totalSessions = historySessions.length
 let totalHadir = 0
 let totalTerlambat = 0
 let totalIzin = 0
 let totalSakit = 0
 let totalAlpa = 0

 historySessions.forEach((session) => {
 const records = session.attendances || []
 records.forEach((rec) => {
 const st = (rec.status_hadir || rec.status || '').toLowerCase()
 if (st === 'hadir') totalHadir++
 else if (st === 'terlambat') totalTerlambat++
 else if (st === 'izin') totalIzin++
 else if (st === 'sakit') totalSakit++
 else if (st === 'alpa' || st === 'alpha') totalAlpa++
 })
 })

 const totalLogs = totalHadir + totalTerlambat + totalIzin + totalSakit + totalAlpa
 const attendanceRate = totalLogs > 0 ? Math.round(((totalHadir + totalTerlambat) / totalLogs) * 100) : 0

 return {
 totalSessions,
 totalLogs,
 totalHadir,
 totalTerlambat,
 totalIzin,
 totalSakit,
 totalAlpa,
 attendanceRate,
 }
 }, [historySessions])

 useEffect(() => {
 if (attendanceCenterTab === 'riwayat' || showPresensiModal) {
 fetchHistorySessions()
 }
 }, [
 attendanceCenterTab,
 showPresensiModal,
 attendancePeriodFilter,
 attendanceDateFilter,
 attendanceWeekFilter,
 attendanceMonthFilter,
 attendanceSemesterFilter,
 selectedClass,
 ])

 const renderAttendanceHistorySection = (isModal = false) => {
 return (
 <div className="space-y-4">
 {/* Header & Filter Rentang Periode */}
 <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20/80 bg-slate-50/50 dark:bg-slate-900/50 p-3 sm:p-4">
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div className="flex items-center gap-2.5">
 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 border border-emerald-200/80 text-slate-700 shadow-xs dark:bg-slate-800 dark:border-emerald-700/80 dark:text-slate-300">
 <History className="h-5 w-5" />
 </div>
 <div>
 <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
 Riwayat Presensi KBM • Rombel {selectedClassName}
 </h4>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Evaluasi log kehadiran KBM berdasarkan rentang hari, minggu, bulan, dan semester
 </p>
 </div>
 </div>

 {/* Periode Tab Buttons (Hari, Minggu, Bulan, Semester) */}
 <div className="flex items-center gap-2">
 <div className="inline-flex rounded-xl bg-white p-1 shadow-xs border border-emerald-200/80 dark:border-emerald-800/80 dark:bg-slate-800 dark:border-emerald-700/80">
 {[
 { id: 'harian', label: 'Hari', icon: CalendarDays },
 { id: 'mingguan', label: 'Minggu', icon: CalendarRange },
 { id: 'bulanan', label: 'Bulan', icon: Calendar },
 { id: 'semester', label: 'Semester', icon: Clock },
 ].map((item) => {
 const Icon = item.icon
 const isActive = attendancePeriodFilter === item.id
 return (
 <button
 key={item.id}
 type="button"
 onClick={() => setAttendancePeriodFilter(item.id)}
 className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${isActive
 ? 'bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white shadow-sm'
 : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
 }`}
 >
 <Icon className="h-3.5 w-3.5" />
 {item.label}
 </button>
 )
 })}
 </div>

 {/* Export Summary & Refresh Buttons */}
 <PageToolbarActions
   onRefresh={fetchHistorySessions}
   refreshLabel="Muat Ulang Riwayat"
   refreshing={loadingHistorySessions}
 >
   <SquircleActionButton
     variant="export"
     icon={Download}
     label="Export Rekap"
     onClick={handleExportHistorySessionsSummary}
     disabled={loadingHistorySessions || historySessions.length === 0}
     title="Export Rekap Sesi KBM Periode Ini ke Excel (.csv)"
     showLabel
   />
 </PageToolbarActions>
 </div>
 </div>

 {/* Sub-Filter Kontrol Sesuai Rentang Waktu yang Dipilih */}
 <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs border-t border-emerald-200/80 dark:border-emerald-800/80 pt-3">
 {attendancePeriodFilter === 'harian' && (
 <div className="flex flex-wrap items-center gap-2">
 <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilih Tanggal:</label>
 <DatePicker
 value={attendanceDateFilter}
 onChange={(e) => setAttendanceDateFilter(e.target.value)}
 className="w-36"
 inputClassName="h-8 text-xs font-semibold"
 />
 <button
 type="button"
 onClick={() => setAttendanceDateFilter(new Date().toLocaleDateString('en-CA'))}
 className="rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-700 shadow-xs hover:bg-emerald-50 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-emerald-300"
 >
 Hari Ini
 </button>
 <span className="rounded-md bg-emerald-100/70 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
 Tanggal Aktif: {new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${attendanceDateFilter}T12:00:00`))}
 </span>
 </div>
 )}

 {attendancePeriodFilter === 'mingguan' && (
 <div className="flex flex-wrap items-center gap-2">
 <HeroUiWorkspaceSelect
 value={attendanceWeekFilter}
 onChange={(val) => setAttendanceWeekFilter(val)}
 options={ATTENDANCE_PEKAN_OPTIONS}
 label="Pekan Efektif"
 placeholder="Pilih Pekan"
 popoverWidth="w-64"
 />
 <span className="rounded-md bg-emerald-100/70 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
 Rentang 7 Hari KBM Rombel {selectedClassName}
 </span>
 </div>
 )}

 {attendancePeriodFilter === 'bulanan' && (
 <div className="flex flex-wrap items-center gap-2">
 <HeroUiWorkspaceSelect
 value={attendanceMonthFilter}
 onChange={(val) => setAttendanceMonthFilter(val)}
 options={ATTENDANCE_BULAN_OPTIONS}
 label="Bulan"
 placeholder="Pilih Bulan"
 popoverWidth="w-72"
 />
 <span className="rounded-md bg-emerald-100/70 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
 Presensi Bulanan Lengkap
 </span>
 </div>
 )}

 {attendancePeriodFilter === 'semester' && (
 <div className="flex flex-wrap items-center gap-2">
 <HeroUiWorkspaceSelect
 value={attendanceSemesterFilter}
 onChange={(val) => setAttendanceSemesterFilter(val)}
 options={ATTENDANCE_SEMESTER_OPTIONS}
 label="Semester"
 placeholder="Pilih Semester"
 popoverWidth="w-72"
 />
 <span className="rounded-md bg-emerald-100/70 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
 Agregasi Kumulatif 1 Semester
 </span>
 </div>
 )}
 </div>
 </div>

 {/* 6 Master KPI Summary Cards */}
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
 <div className="rounded-xl border border-emerald-200/80 !bg-slate-100/90 dark:!bg-slate-900/60 p-3 shadow-xs">
 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Sesi</span>
 <p className="mt-1 text-lg font-black text-slate-800 dark:text-slate-200">{historySummary.totalSessions} Sesi</p>
 <span className="text-[10px] text-slate-500">Rentang {attendancePeriodFilter}</span>
 </div>
 <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-emerald-50/50 p-3 shadow-xs dark:border-emerald-800/60 dark:bg-emerald-950/20">
 <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Kehadiran</span>
 <p className="mt-1 text-lg font-black text-emerald-700 dark:text-emerald-300">{historySummary.attendanceRate}%</p>
 <span className="text-[10px] text-emerald-600/80">Rata-rata Kelas</span>
 </div>
 <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-emerald-50/50 p-3 shadow-xs dark:border-emerald-800/60 dark:bg-emerald-950/20">
 <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Hadir</span>
 <p className="mt-1 text-lg font-black text-emerald-700 dark:text-emerald-400">{historySummary.totalHadir}</p>
 <span className="text-[10px] text-emerald-600/80">Log Kehadiran</span>
 </div>
 <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-amber-50/50 p-3 shadow-xs dark:border-emerald-800/60 dark:bg-amber-950/20">
 <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">Terlambat</span>
 <p className="mt-1 text-lg font-black text-amber-700 dark:text-amber-300">{historySummary.totalTerlambat}</p>
 <span className="text-[10px] text-amber-600/80">Masuk Sesi</span>
 </div>
 <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-sky-50/50 p-3 shadow-xs dark:border-emerald-800/60 dark:bg-sky-950/20">
 <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">Izin / Sakit</span>
 <p className="mt-1 text-lg font-black text-sky-700 dark:text-sky-300">{historySummary.totalIzin + historySummary.totalSakit}</p>
 <span className="text-[10px] text-sky-600/80">{historySummary.totalIzin} Izin • {historySummary.totalSakit} Sakit</span>
 </div>
 <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-rose-50/50 p-3 shadow-xs dark:border-emerald-800/60 dark:bg-rose-950/20">
 <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">Alpa</span>
 <p className="mt-1 text-lg font-black text-rose-700 dark:text-rose-300">{historySummary.totalAlpa}</p>
 <span className="text-[10px] text-rose-600/80">Tanpa Keterangan</span>
 </div>
 </div>

 {/* Daftar Sesi Pertemuan */}
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
 Daftar Sesi Pembelajaran ({historySessions.length} Sesi Terdata)
 </h5>
 <span className="text-xs text-slate-400">
 Menampilkan riwayat rentang {attendancePeriodFilter}
 </span>
 </div>

 {loadingHistorySessions ? (
 <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white p-8 text-center dark:border-emerald-800/60 dark:bg-slate-900/50">
 <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
 <p className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
 Memuat riwayat sesi presensi...
 </p>
 </div>
 ) : historySessions.length === 0 ? (
 <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white p-8 text-center dark:border-emerald-800/60 dark:bg-slate-900/50">
 <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">

            <Calendar className="h-6 w-6 text-white" />
 </div>
 <p className="mt-3 text-sm font-bold text-slate-800 dark:text-white">
 Tidak Ada Riwayat Sesi pada Rentang Waktu Ini
 </p>
 <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
 Belum ada sesi pembelajaran yang tercatat untuk rombel {selectedClassName} pada periode {attendancePeriodFilter} ini. Anda dapat mengganti rentang tanggal, pekan, atau bulan di atas.
 </p>
 </div>
 ) : (
 <div className="grid gap-3">
 {historySessions
 .slice((historySessionsPage - 1) * historySessionsPerPage, historySessionsPage * historySessionsPerPage)
 .map((session, sIdx) => {
 const sessionDate = session.attendance_date ? new Date(session.attendance_date) : null
 const dateFormatted = sessionDate
 ? sessionDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
 : '-'
 const timeRange = session.schedule?.time_start && session.schedule?.time_end
 ? `${session.schedule.time_start.slice(0, 5)} – ${session.schedule.time_end.slice(0, 5)} WIB`
 : '07:30 – 09:00 WIB'

 const attList = session.attendances || []
 const hadir = attList.filter((a) => (a.status_hadir || a.status || '').toLowerCase() === 'hadir').length
 const terlambat = attList.filter((a) => (a.status_hadir || a.status || '').toLowerCase() === 'terlambat').length
 const izin = attList.filter((a) => (a.status_hadir || a.status || '').toLowerCase() === 'izin').length
 const sakit = attList.filter((a) => (a.status_hadir || a.status || '').toLowerCase() === 'sakit').length
 const alpa = attList.filter((a) => ['alpa', 'alpha'].includes((a.status_hadir || a.status || '').toLowerCase())).length
 const totalAtt = attList.length
 const rate = totalAtt > 0 ? Math.round(((hadir + terlambat) / totalAtt) * 100) : 0

 return (
 <div
 key={session.id || sIdx}
 className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white p-4 transition hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:shadow-sm dark:border-emerald-800/60 dark:bg-slate-900/50"
 >
 <div className="min-w-0 space-y-1">
 <div className="flex flex-wrap items-center gap-2">
 <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
 Pertemuan ke-{session.meeting_number || sIdx + 1}
 </span>
 <span className="rounded-md bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
 {timeRange}
 </span>
 <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
 {dateFormatted}
 </span>
 </div>

 <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white ">
 {session.schedule?.subject?.name || 'Mata Pelajaran'} • {session.schedule?.kelas?.name || selectedClassName}
 </h4>
 <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
 Topik: {session.topic || session.learning_material || 'Materi KBM Reguler'}
 </p>

 {/* Status Badges Breakdown */}
 <div className="flex flex-wrap items-center gap-1.5 pt-1">
 <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60">
 {hadir} Hadir
 </span>
 {terlambat > 0 && (
 <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-emerald-800/60">
 {terlambat} Terlambat
 </span>
 )}
 {izin > 0 && (
 <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-sky-950/40 dark:text-sky-300 dark:border-emerald-800/60">
 {izin} Izin
 </span>
 )}
 {sakit > 0 && (
 <span className="rounded-md bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-violet-950/40 dark:text-violet-300 dark:border-emerald-800/60">
 {sakit} Sakit
 </span>
 )}
 {alpa > 0 && (
 <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-emerald-800/60">
 {alpa} Alpa
 </span>
 )}
 <span className="rounded-md bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
 Tingkat: {rate}% ({totalAtt} Siswa)
 </span>
 </div>
 </div>

 {/* Action Button */}
 <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
 <button
 type="button"
 onClick={() => {
 setSelectedHistorySession(session)
 setHistorySessionStudentSearch('')
 setShowHistorySessionModal(true)
 }}
 className="inline-flex items-center gap-1.5 rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-xs transition hover:bg-emerald-50 hover:border-emerald-300 dark:hover:border-emerald-700/80 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-emerald-300 dark:hover:bg-slate-700 cursor-pointer"
 >
 <Eye className="h-3.5 w-3.5" /> Lihat Detail Siswa
 </button>
 </div>
 </div>
 )
 })}
 </div>
 )}

 {/* Pagination Kontrol Riwayat Sesi (Maksimal 10 Baris) */}
 {historySessions.length > historySessionsPerPage && (
 <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20/80 bg-white p-3.5 shadow-xs dark:border-emerald-800/60 dark:bg-card-dark">
 <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
 Menampilkan{' '}
 <strong className="text-emerald-700 dark:text-emerald-300">
 {(historySessionsPage - 1) * historySessionsPerPage + 1}
 </strong>{' '}
 s.d.{' '}
 <strong className="text-emerald-700 dark:text-emerald-300">
 {Math.min(historySessionsPage * historySessionsPerPage, historySessions.length)}
 </strong>{' '}
 dari <strong className="text-slate-900 dark:text-white">{historySessions.length}</strong> sesi pertemuan
 </div>
 <Pagination
 currentPage={historySessionsPage}
 totalPages={Math.max(1, Math.ceil(historySessions.length / historySessionsPerPage))}
 onPageChange={setHistorySessionsPage}
 sideLayout="full"
 variant="compact"
 />
 </div>
 )}
 </div>
 </div>
 )
 }
 const teacherName = teacherProfile?.name || user?.name || 'Guru Pengampu'
 const scheduleDays = [
 { short: 'Sen', name: 'Senin' },
 { short: 'Sel', name: 'Selasa' },
 { short: 'Rab', name: 'Rabu' },
 { short: 'Kam', name: 'Kamis' },
 { short: 'Jum', name: 'Jumat' },
 ]
 const selectedDateDay = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date(`${selectedDate}T12:00:00`))
 const dayMapping = {
 1: 'Senin', 2: 'Selasa', 3: 'Rabu', 4: 'Kamis', 5: 'Jumat', 6: 'Sabtu', 7: 'Ahad'
 }
 const getScheduleDay = (schedule) => schedule.day_name || schedule.nama_hari || dayMapping[schedule.day_of_week] || schedule.day || schedule.hari || selectedDateDay
 const getScheduleSubject = (schedule) => schedule.subject?.name || schedule.subject_name || schedule.mata_pelajaran || 'Mata Pelajaran'
 const getScheduleClass = (schedule) => schedule.class?.name || schedule.kelas?.nama_kelas || schedule.kelas?.name || schedule.class_name || selectedClassName
 const getScheduleRoom = (schedule) => schedule.room_name || schedule.room?.name || schedule.ruangan || schedule.kelas?.ruangan || 'Ruang belum ditentukan'
 const dayOrderMap = { 'senin': 1, 'selasa': 2, 'rabu': 3, 'kamis': 4, 'jumat': 5, 'sabtu': 6, 'ahad': 7, 'minggu': 7 }
 const sortedSchedules = useMemo(() => {
 const seen = new Set()
 const unique = []
 for (const s of schedules) {
 const d = getScheduleDay(s)
 const tStart = (s.start_time || s.time_start || s.jam_mulai || '00:00').slice(0, 5)
 const tEnd = (s.end_time || s.time_end || s.jam_selesai || '00:00').slice(0, 5)
 const sub = getScheduleSubject(s)
 const cls = getScheduleClass(s)
 const key = `${d}-${tStart}-${tEnd}-${sub}-${cls}`
 if (!seen.has(key)) {
 seen.add(key)
 unique.push(s)
 }
 }
 return unique.sort((first, second) => {
 const dayA = dayOrderMap[getScheduleDay(first).toLowerCase()] || 99
 const dayB = dayOrderMap[getScheduleDay(second).toLowerCase()] || 99
 if (dayA !== dayB) return dayA - dayB
 const timeA = first.start_time || first.time_start || first.jam_mulai || '00:00'
 const timeB = second.start_time || second.time_start || second.jam_mulai || '00:00'
 return timeA.localeCompare(timeB)
 })
 }, [schedules, selectedDateDay])
 const selectedDaySchedules = useMemo(() => {
 return sortedSchedules.filter((schedule) => getScheduleDay(schedule).toLowerCase() === selectedDateDay.toLowerCase())
 }, [sortedSchedules, selectedDateDay])

 const activeScheduleDays = useMemo(() => {
 const daysSet = new Set()
 sortedSchedules.forEach((s) => {
 const d = getScheduleDay(s)
 if (d) daysSet.add(d)
 })
 return Array.from(daysSet)
 }, [sortedSchedules])

 const timelineSchedules = useMemo(() => {
 if (timelineFilter === 'hari_ini') {
 return selectedDaySchedules
 }
 if (timelineFilter === 'semua') {
 return sortedSchedules
 }
 if (timelineFilter !== 'auto') {
 return sortedSchedules.filter((schedule) => getScheduleDay(schedule).toLowerCase() === timelineFilter.toLowerCase())
 }
 // 'auto' mode: if today has sessions, show today; otherwise show all sessions so it's not an empty dead-end
 if (selectedDaySchedules.length > 0) {
 return selectedDaySchedules
 }
 return sortedSchedules
 }, [timelineFilter, selectedDaySchedules, sortedSchedules])

 useEffect(() => {
 if (sortedSchedules.length === 0) return
 const todayShort = scheduleDays.find((d) => d.name.toLowerCase() === selectedDateDay.toLowerCase())?.short
 const todayHasSessions = todayShort && sortedSchedules.some((s) => getScheduleDay(s).toLowerCase() === selectedDateDay.toLowerCase())
 if (todayHasSessions) {
 setWeeklySelectedDay(todayShort)
 } else {
 const firstActiveDay = scheduleDays.find((d) => sortedSchedules.some((s) => getScheduleDay(s).toLowerCase() === d.name.toLowerCase()))
 if (firstActiveDay) {
 setWeeklySelectedDay(firstActiveDay.short)
 }
 }
 }, [sortedSchedules, selectedDateDay])

 const visibleWeeklyDay = scheduleDays.find((day) => day.short === weeklySelectedDay)?.name || 'Senin'
 const weeklySchedules = sortedSchedules.filter((schedule) => getScheduleDay(schedule).toLowerCase() === visibleWeeklyDay.toLowerCase())
 const publishedMaterials = materials.filter((material) => ['published', 'aktif', 'active'].includes(String(material.status || '').toLowerCase())).length
 // Daftar mapel unik: bersumber dari jadwal pengajaran guru (allTeacherSchedules / schedules)
 // yang disaring sesuai selectedClass (atau semua jika 'all'), ditambah mapel dari materials
 const uniqueMapelOptions = useMemo(() => {
 const seen = new Map()
 const pool = (allTeacherSchedules && allTeacherSchedules.length > 0) ? allTeacherSchedules : schedules
 pool.forEach((s) => {
 const sClassId = s.class_id || s.kelas_id || s.kelas?.id || s.class?.id
 if (!selectedClass || selectedClass === 'all' || String(sClassId) === String(selectedClass)) {
 const id = s.subject_id || s.subject?.id
 const name = s.subject?.nama_mapel || s.subject?.name
 if (id && name && !seen.has(String(id))) {
 seen.set(String(id), name)
 }
 }
 })
 // Fallback/tambahan dari materials yang ter-load
 materials.forEach((m) => {
 const id = m.subject?.id || m.mata_pelajaran_id
 const name = m.subject?.name || m.subject?.nama_mapel
 if (id && name && !seen.has(String(id))) {
 seen.set(String(id), name)
 }
 })
 return Array.from(seen.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name))
 }, [allTeacherSchedules, schedules, selectedClass, materials])

 // Daftar rombel unik yang disaring sesuai Mapel yang dipilih (jika memilih mapel tertentu)
 const filteredClassesOptions = useMemo(() => {
 if (isManagerial || !materialMapelFilter || materialMapelFilter === 'all') {
 return classes
 }
 const pool = (allTeacherSchedules && allTeacherSchedules.length > 0) ? allTeacherSchedules : schedules
 const matchingClassIds = new Set()
 pool.forEach((s) => {
 const subjId = s.subject_id || s.subject?.id
 if (String(subjId) === String(materialMapelFilter)) {
 const sClassId = s.class_id || s.kelas_id || s.kelas?.id || s.class?.id
 if (sClassId) matchingClassIds.add(String(sClassId))
 }
 })
 // Fallback dari materials
 materials.forEach((m) => {
 const subjId = m.subject?.id || m.mata_pelajaran_id || m.subject_id
 if (String(subjId) === String(materialMapelFilter)) {
 const mClassId = m.modul_ajar?.kelas_id || m.modul_ajar?.rombel_id || m.class_id || m.kelas_id
 if (mClassId) matchingClassIds.add(String(mClassId))
 }
 })
 const matched = classes.filter((c) => matchingClassIds.has(String(c.id)))
 return matched.length > 0 ? matched : classes
 }, [classes, materialMapelFilter, allTeacherSchedules, schedules, materials, isManagerial])

 const activeWorkspaceClassValue = useMemo(() => {
 if (!selectedClass || selectedClass === 'all') return 'all'
 const match = filteredClassesOptions.find((c) =>
 String(c.id) === String(selectedClass) ||
 c.nama_kelas === selectedClass ||
 c.name === selectedClass ||
 c.kode_kelas === selectedClass
 )
 return match ? String(match.id) : String(selectedClass)
 }, [filteredClassesOptions, selectedClass])

 const activeWorkspaceMapelValue = useMemo(() => {
 if (!materialMapelFilter || materialMapelFilter === 'all') return 'all'
 const match = uniqueMapelOptions.find((m) =>
 String(m.id) === String(materialMapelFilter) ||
 m.name === materialMapelFilter
 )
 return match ? String(match.id) : String(materialMapelFilter)
 }, [uniqueMapelOptions, materialMapelFilter])

 // Daftar rombel unik yang spesifik diajar untuk Mapel pada sesi Presensi (presensiModalSchedule)
 const presensiModalClasses = useMemo(() => {
 const activeSchedule = presensiModalSchedule || getCurrentSchedule() || schedules[0] || null
 if (!activeSchedule) return classes

 const activeSubjId = activeSchedule.subject_id || activeSchedule.subject?.id
 const activeSubjName = getScheduleSubject(activeSchedule)
 const pool = (allTeacherSchedules && allTeacherSchedules.length > 0) ? allTeacherSchedules : schedules

 const matchingClassIds = new Set()
 pool.forEach((s) => {
 const sSubjId = s.subject_id || s.subject?.id
 const sSubjName = getScheduleSubject(s)
 const isSameSubject = (activeSubjId && sSubjId && String(sSubjId) === String(activeSubjId)) ||
 (activeSubjName && sSubjName && sSubjName.trim().toLowerCase() === activeSubjName.trim().toLowerCase())

 if (isSameSubject) {
 const cId = s.kelas_id || s.class_id || s.kelas?.id || s.class?.id
 if (cId) matchingClassIds.add(String(cId))
 }
 })

 // Pastikan ID rombel dari jadwal aktif selalu masuk
 const directClassId = activeSchedule.kelas_id || activeSchedule.class_id || activeSchedule.kelas?.id || activeSchedule.class?.id
 if (directClassId) matchingClassIds.add(String(directClassId))

 const matched = classes.filter((c) => matchingClassIds.has(String(c.id)))
 return matched.length > 0 ? matched : classes
 }, [presensiModalSchedule, allTeacherSchedules, schedules, classes])

 const modalActiveClassName = useMemo(() => {
 const activeSchedule = presensiModalSchedule || getCurrentSchedule()
 if (selectedClass && selectedClass !== 'all') {
 const found = classes.find((c) => String(c.id) === String(selectedClass))
 if (found?.nama_kelas || found?.name) return found.nama_kelas || found.name
 }
 if (activeSchedule) {
 return getScheduleClass(activeSchedule)
 }
 return selectedClassName
 }, [presensiModalSchedule, selectedClass, classes, selectedClassName])

 // Handler interaksi 2-arah: saat memilih Rombel
 const handleWorkspaceClassChange = (newClassId) => {
 setSelectedClass(newClassId)
 fetchStudentsForClass(newClassId)

 // Jika memilih kelas spesifik: cek mata pelajaran yang ada di kelas ini
 if (newClassId && newClassId !== 'all') {
 const pool = (allTeacherSchedules && allTeacherSchedules.length > 0) ? allTeacherSchedules : schedules
 const classSubjects = []
 const seen = new Set()
 pool.forEach((s) => {
 const sClassId = s.class_id || s.kelas_id || s.kelas?.id || s.class?.id
 if (String(sClassId) === String(newClassId)) {
 const id = s.subject_id || s.subject?.id
 const name = s.subject?.nama_mapel || s.subject?.name
 if (id && !seen.has(String(id))) {
 seen.add(String(id))
 classSubjects.push({ id: String(id), name })
 }
 }
 })
 // Jika kelas ini hanya punya 1 mata pelajaran yang diajar guru ini, otomatis pilih mapel tersebut!
 if (classSubjects.length === 1) {
 setMaterialMapelFilter(classSubjects[0].id)
 } else if (materialMapelFilter !== 'all' && !classSubjects.some((s) => String(s.id) === String(materialMapelFilter))) {
 // Jika mapel sebelumnya tidak diajarkan di kelas ini, otomatis pilih mapel pertama atau 'all'
 setMaterialMapelFilter(classSubjects[0]?.id || 'all')
 }
 }
 }

 // Handler interaksi 2-arah: saat memilih Mapel
 const handleWorkspaceMapelChange = (newSubjectId) => {
 setMaterialMapelFilter(newSubjectId)

 // Jika memilih mapel spesifik: periksa rombel yang memiliki mapel ini
 if (newSubjectId && newSubjectId !== 'all') {
 const pool = (allTeacherSchedules && allTeacherSchedules.length > 0) ? allTeacherSchedules : schedules
 const matchingClassIds = new Set()
 pool.forEach((s) => {
 const subjId = s.subject_id || s.subject?.id
 if (String(subjId) === String(newSubjectId)) {
 const sClassId = s.class_id || s.kelas_id || s.kelas?.id || s.class?.id
 if (sClassId) matchingClassIds.add(String(sClassId))
 }
 })
 const validClasses = classes.filter((c) => matchingClassIds.has(String(c.id)))

 // Jika mapel ini hanya diajarkan di 1 kelas, otomatis pilih kelas tersebut!
 if (validClasses.length === 1) {
 const onlyClassId = String(validClasses[0].id)
 setSelectedClass(onlyClassId)
 fetchStudentsForClass(onlyClassId)
 } else if (selectedClass !== 'all' && !validClasses.some((c) => String(c.id) === String(selectedClass))) {
 // Jika kelas yang sedang aktif tidak memiliki mapel ini, ganti ke kelas pertama yang valid
 if (validClasses.length > 0) {
 const firstClassId = String(validClasses[0].id)
 setSelectedClass(firstClassId)
 fetchStudentsForClass(firstClassId)
 }
 }
 }
 }

 // Filter client-side tambahan: hanya secondary check (backend sudah filter utama)
 const filteredMaterials = useMemo(() => materials.filter((material) => {
 // Secondary class check (jika kelas_id ada di response dan berbeda → tolak)
 if (selectedClass && selectedClass !== 'all') {
 const matClassId = material.modul_ajar?.kelas_id || material.modul_ajar?.rombel_id || material.class_id || material.kelas_id
 if (matClassId && String(matClassId) !== String(selectedClass)) return false
 }
 // Secondary mapel check (jika subject_id ada dan berbeda → tolak)
 if (materialMapelFilter && materialMapelFilter !== 'all') {
 const matSubjectId = material.subject?.id || material.mata_pelajaran_id || material.subject_id
 if (matSubjectId && String(matSubjectId) !== String(materialMapelFilter)) return false
 }
 return true
 }), [materials, selectedClass, materialMapelFilter])


 const handleMaterialDateChange = (newDate) => {
 const calc = calculatePekanFromDate(newDate)
 setMateriForm((prev) => {
 let updatedJudul = prev.judul
 const pekanPrefixMatch = updatedJudul.match(/^Pekan\s+\d+:\s*(.*)$/i)
 if (pekanPrefixMatch) {
 updatedJudul = `Pekan ${String(calc.pekan).padStart(2, '0')}: ${pekanPrefixMatch[1]}`
 } else if (!updatedJudul.trim()) {
 updatedJudul = `Pekan ${String(calc.pekan).padStart(2, '0')}: `
 }

 return {
 ...prev,
 tanggal: newDate,
 tanggal_publish: newDate,
 urutan: calc.pekan,
 judul: updatedJudul,
 }
 })
 }

 const openMaterialForm = (material = null) => {
 setEditingId(material?.id || null)
 const todayStr = getTodayDateString()
 const rawDate = material?.tanggal_publish || material?.tanggal || material?.created_at || todayStr
 const parsedDate = typeof rawDate === 'string' ? rawDate.split('T')[0].split(' ')[0] : todayStr
 const calc = calculatePekanFromDate(parsedDate)

 setMateriForm({
 judul: material?.judul || (material ? '' : `Pekan ${String(calc.pekan).padStart(2, '0')}: `),
 subject_id: material?.subject_id || '',
 class_id: selectedClass,
 ringkasan: material?.ringkasan || '',
 isi: material?.isi || '',
 file: material?.file || material?.file_raw || material?.link || '',
 video: material?.video || '',
 link: material?.link || material?.file || material?.file_raw || '',
 status: material?.status || 'published',
 tanggal: parsedDate,
 tanggal_publish: parsedDate,
 urutan: material?.urutan || calc.pekan,
 })
 setModalType('materi')
 setShowModal(true)
 }

 const openMaterialDetail = (material) => {
 const rawLink = material.link || material.file || material.file_raw || ''
 const rawDate = material.tanggal_publish || material.created_at
 const calc = calculatePekanFromDate(rawDate)
 setDetailData({
 category: 'Materi Belajar',
 title: material.judul,
 video: material.video || '',
 file: material.file || material.file_raw || '',
 link: rawLink,
 items: [
 { label: 'Mata pelajaran', value: material.subject?.name || material.subject?.nama_mapel || 'Belum ditentukan' },
 { label: 'Status', value: material.status === 'published' ? 'Dipublikasikan' : 'Draft' },
 { label: 'Tanggal Pembelajaran', value: rawDate ? new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(rawDate)) : '-' },
 { label: 'Pekan Ke-', value: `Pekan ${String(material.urutan || calc.pekan).padStart(2, '0')} (${calc.label})` },
 { label: 'Ringkasan', value: material.ringkasan || 'Tidak ada ringkasan' },
 { label: 'Isi materi', value: material.isi || 'Belum ada isi materi' },
 ...(rawLink ? [{ label: 'Tautan Dokumen / Link', value: rawLink }] : []),
 ...(material.video ? [{ label: 'Tautan Video', value: material.video }] : []),
 ],
 })
 setShowDetailModal(true)
 }

 const printMaterial = (material, saveAsPdf = false) => {
 const printWindow = window.open('', '_blank', 'width=900,height=720')
 if (!printWindow) {
 addToast('warning', 'Popup Diblokir', 'Izinkan popup browser untuk mencetak atau menyimpan materi sebagai PDF.')
 return
 }

 printWindow.opener = null
 const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (character) => ({
 '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;',
 }[character]))
 const content = escapeHtml(material.isi || 'Belum ada isi materi.').replace(/\n/g, '<br>')
 const summary = escapeHtml(material.ringkasan || 'Tidak ada ringkasan.')
 const publishedAt = material.tanggal_publish || material.updated_at || material.created_at
 const formattedDate = publishedAt
 ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(publishedAt))
 : new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date())

 const officialHeaderHtml = generateOfficialPrintHeaderHtml({
 unit: teacherProfile?.education_unit_data || teacherProfile?.education_unit || user?.unit,
 user,
 title: material.judul || 'MATERI BELAJAR',
 subtitle: `${material.subject?.name || 'Mata Pelajaran'} · ${selectedClassName} · ${formattedDate}`,
 showDivider: true,
 })

 printWindow.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(material.judul)} — Materi Belajar</title><style>
 @page{size:A4 portrait;margin:15mm}*{box-sizing:border-box}body{margin:0;color:#172033;font:10pt/1.5 Arial,sans-serif}.print-official-header{display:grid;grid-template-columns:80px 1fr 90px;align-items:center;gap:12px;min-height:50mm;padding-bottom:4px}.print-logo-left-box{width:76px;height:76px;display:flex;align-items:center;justify-content:center}.print-logo-left-img{max-width:76px;max-height:76px;width:auto;height:auto;object-fit:contain;display:block}.print-center-box{text-align:center;padding:0 4px}.print-org-name{font-size:11pt;font-weight:800;color:#0f172a;letter-spacing:0.5px;text-transform:uppercase;margin:0 0 2px 0;line-height:1.2}.print-school-unit{font-size:12.5pt;font-weight:900;color:#047857;letter-spacing:0.5px;text-transform:uppercase;margin:0 0 2px 0;line-height:1.2}.print-slogan{font-size:8.5pt;font-style:italic;font-weight:600;color:#475569;margin:1px 0}.print-address{font-size:7.8pt;color:#475569;margin:1px 0}.print-legality{font-size:7.8pt;font-weight:700;color:#0f172a;margin:1px 0 0 0}.print-logo-right-box{width:90px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.print-unit-logo-wrapper{width:74px;height:74px;display:flex;align-items:center;justify-content:center}.print-logo-right-img{max-width:74px;max-height:74px;width:auto;height:auto;object-fit:contain;display:block}.print-unit-type-badge{margin-top:3px;font-size:8pt;font-weight:900;color:#047857;letter-spacing:0.5px;text-transform:uppercase;text-align:center;line-height:1}.print-header-divider{border-bottom:2px solid #0f172a;margin-top:4px;margin-bottom:12px}.print-doc-title-container{text-align:center;margin-bottom:12px}.print-doc-title{font-size:13.5pt;font-weight:900;color:#047857;letter-spacing:0.5px;text-transform:uppercase;margin:0;line-height:1.25}.print-doc-period{font-size:9pt;font-weight:700;color:#334155;margin-top:3px}.print-doc-meta-row{display:flex;justify-content:space-between;align-items:center;font-size:8pt;color:#64748b;font-weight:600;margin-top:6px;padding-bottom:6px;border-bottom:1px dashed #cbd5e1}.summary{margin:18px 0;padding:14px 16px;border:1px solid #cce5da;border-radius:10px;background:#f0f9f5}.summary strong{display:block;margin-bottom:4px;color:#059669}.content{white-space:normal;line-height:1.6}.footer{margin-top:32px;padding-top:10px;border-top:1px solid #dbe3ea;color:#64748b;font-size:8pt;display:flex;justify-content:space-between}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.no-print{display:none}}@media screen{body{max-width:794px;margin:24px auto;padding:24px;box-shadow:0 8px 30px #0f172a20}.no-print{position:fixed;right:24px;top:24px;border:0;border-radius:10px;background:#059669;color:white;padding:10px 16px;font-weight:700;cursor:pointer}}
 </style></head><body><button class="no-print" onclick="window.print()">${saveAsPdf ? 'Simpan sebagai PDF' : 'Cetak Materi'}</button>${officialHeaderHtml}<section class="summary"><strong>Ringkasan Materi</strong>${summary}</section><main class="content">${content}</main><footer class="footer"><span>${escapeHtml(teacherName)}</span><span>Workspace Pengajaran Guru · Dokumen Sah Dareliman Edu</span></footer><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),250))</script></body></html>`)
 printWindow.document.close()
 if (saveAsPdf) addToast('info', 'Export PDF Dibuka', 'Pada dialog cetak, pilih “Save as PDF” atau “Simpan sebagai PDF”.')
 }
 const activeAssignments = assignments.filter((assignment) => !['selesai', 'closed', 'archived'].includes(String(assignment.status || '').toLowerCase())).length

 const filteredAssignments = useMemo(() => {
 return assignments.filter((asg) => {
 // 1. Filter by Rombel / Class
 if (selectedClass && selectedClass !== "all") {
 const asgClassId = asg.kelas_id || asg.class_id || asg.kelas?.id
 // Strict: tolak jika class ID tidak ada atau tidak cocok dengan rombel yang dipilih
 if (!asgClassId || String(asgClassId) !== String(selectedClass)) {
 return false
 }
 }

 // 2. Search query (judul, instruksi, mapel, kelas)
 const q = assignmentSearch.trim().toLowerCase()
 if (q) {
 const matchTitle = (asg.judul || asg.judul_tugas || "").toLowerCase().includes(q)
 const matchInstruksi = (asg.instruksi || "").toLowerCase().includes(q)
 const matchSubject = (asg.subject?.name || asg.subject?.nama_pelajaran || "").toLowerCase().includes(q)
 const matchKelas = (asg.kelas?.nama_kelas || asg.kelas?.name || "").toLowerCase().includes(q)
 if (!matchTitle && !matchInstruksi && !matchSubject && !matchKelas) {
 return false
 }
 }

 // 3. Jenis Soal / Format filter
 if (assignmentJenisFilter !== "all") {
 const isQuiz = asg.jenis_tugas === 'quiz' || asg.jenis_soal === 'quiz'
 const jenis = String(asg.jenis_tugas || asg.jenis_soal || "essay").toLowerCase()
 if (assignmentJenisFilter === 'quiz') {
 if (!isQuiz) return false
 } else if (assignmentJenisFilter === 'tugas') {
 if (isQuiz) return false
 } else {
 if (jenis !== assignmentJenisFilter) return false
 }
 }

 // 4. Status filter
 if (assignmentStatusFilter === "active") {
 if (asg.deadline) {
 const dl = new Date(asg.deadline).getTime()
 if (!isNaN(dl) && dl < Date.now()) return false
 }
 } else if (assignmentStatusFilter === "past") {
 if (asg.deadline) {
 const dl = new Date(asg.deadline).getTime()
 if (!isNaN(dl) && dl >= Date.now()) return false
 } else {
 return false
 }
 }

 return true
 })
 }, [assignments, selectedClass, assignmentSearch, assignmentJenisFilter, assignmentStatusFilter])
 // Filter khusus seleksi siswa pada Modal Setoran Tahfizh:
 // - Hanya siswa dari rombel guru / wali kelas (classes)
 // - Hanya siswa dari unit pendidikan guru tersebut (teacherProfile / user)
 // - Filter per rombel (tahfizhModalClass)
 // - Pencarian nama atau NIS (studentModalSearch)
 const filteredTahfizhStudents = useMemo(() => {
 const teacherClassIds = new Set(classes.map((c) => String(c.id)))
 const teacherUnitId = teacherProfile?.education_unit_data?.id || user?.education_unit_id || user?.education_unit?.id
 const teacherUnitName = (teacherProfile?.education_unit || user?.education_unit?.name || '').toLowerCase().trim()

 return students.filter((s) => {
 // 1. Filter rombel guru: pastikan kelas siswa ada dalam daftar classes guru
 const sClassId = String(s.kelas_id || s.class_id || s.kelas?.id || '')
 if (!isAdminOrSuperAdmin && !isPengurusYayasan && classes.length > 0) {
 if (!sClassId || !teacherClassIds.has(sClassId)) {
 return false
 }
 }

 // 2. Filter unit guru: jangan tampilkan siswa bukan unit guru tersebut
 if (!isAdminOrSuperAdmin && !isPengurusYayasan) {
 const studentUnitId = s.education_unit_id || s.unit_id || s.education_unit?.id || s.kelas?.unit_pendidikan_id || s.kelas?.education_unit_id
 const studentUnitName = (s.education_unit?.name || s.unit?.name || s.kelas?.unit_pendidikan?.name || s.unit_name || '').toLowerCase().trim()

 if (teacherUnitId && studentUnitId && String(teacherUnitId) !== String(studentUnitId)) {
 return false
 }
 if (teacherUnitName && teacherUnitName !== '-' && studentUnitName && !studentUnitName.includes(teacherUnitName) && !teacherUnitName.includes(studentUnitName)) {
 return false
 }
 }

 // 3. Filter rombel spesifik di modal
 if (tahfizhModalClass && tahfizhModalClass !== 'all' && sClassId !== String(tahfizhModalClass)) {
 return false
 }

 // 4. Pencarian nama siswa atau NIS
 const query = (studentModalSearch || '').toLowerCase().trim()
 if (query) {
 const nameMatch = s.nama_lengkap?.toLowerCase().includes(query)
 const nisMatch = s.nis?.toLowerCase().includes(query) || s.nisn?.toLowerCase().includes(query)
 if (!nameMatch && !nisMatch) return false
 }

 return true
 })
 }, [students, classes, tahfizhModalClass, studentModalSearch, teacherProfile, user, isAdminOrSuperAdmin, isPengurusYayasan])

 const selectedTahfizhSurah = quranSurahs.find((surah) => Number(surah.nomor) === Number(tahfizhForm.surah_number))
 const selectedTahfizhStudent = students.find((student) => String(student.id) === String(tahfizhForm.student_id)) || null
 const isStudentSelected = Boolean(tahfizhForm.student_id)
 const selectedStudentTahfizhLogs = tahfizhLogs
 .filter((log) => log.student_id === tahfizhForm.student_id)
 .sort((first, second) => String(second.record_date || '').localeCompare(String(first.record_date || '')))
 const previousTahfizhLog = selectedStudentTahfizhLogs[0] || null

 const getQuranJuz = (surahNumber, ayahNumber) => {
 const juzStarts = [[1, 1], [2, 142], [2, 253], [3, 93], [4, 24], [4, 148], [5, 83], [6, 111], [7, 88], [8, 41], [9, 93], [11, 6], [12, 53], [15, 1], [17, 1], [18, 75], [21, 1], [23, 1], [25, 21], [27, 56], [29, 46], [33, 31], [36, 28], [39, 32], [41, 47], [46, 1], [51, 31], [58, 1], [67, 1], [78, 1]]
 let juz = 1
 juzStarts.forEach(([surah, ayah], index) => {
 if (Number(surahNumber) > surah || (Number(surahNumber) === surah && Number(ayahNumber) >= ayah)) juz = index + 1
 })
 return juz
 }

 const getAutomaticTahfizhTarget = (latestLog) => {
 if (!latestLog || !quranSurahs.length) return null

 // Helper untuk mengecek apakah suatu nilai evaluasi mengindikasikan perlu pengulangan
 const isRepeatEvaluation = (val) => {
 if (val === null || val === undefined) return false
 const normalized = String(val).trim().toLowerCase()
 // Variasi yang sah dan teridentifikasi: 'perlu bimbingan', 'bimbingan', 'kurang', 'd'
 return ['perlu bimbingan', 'bimbingan', 'kurang', 'd'].includes(normalized)
 }

 // Ambil nilai dari field langsung (accessor) atau dari metadata (object/JSON string)
 const getEvaluationValue = (log, key) => {
 if (!log) return null
 if (log[key] !== undefined && log[key] !== null && String(log[key]).trim() !== '') {
 return log[key]
 }
 let meta = log.metadata
 if (typeof meta === 'string') {
 try {
 meta = JSON.parse(meta)
 } catch {
 meta = null
 }
 }
 if (meta && typeof meta === 'object') {
 const val = meta[key]
 if (val !== undefined && val !== null && String(val).trim() !== '') {
 return val
 }
 }
 return null
 }

 const needsRepeat = ['kelancaran', 'tajwid', 'makhraj'].some((key) => {
 const val = getEvaluationValue(latestLog, key)
 return isRepeatEvaluation(val)
 })

 const currentSurah = quranSurahs.find((surah) => Number(surah.nomor) === Number(latestLog.hafalan_surah_number))
 const surahName = currentSurah?.nama_latin || latestLog.hafalan_surah_name || `Surah ${latestLog.hafalan_surah_number}`

 if (needsRepeat) {
 return {
 surahNumber: Number(latestLog.hafalan_surah_number),
 surah_name: surahName,
 ayatStart: Number(latestLog.hafalan_ayah_start),
 ayat_start: Number(latestLog.hafalan_ayah_start),
 ayatEnd: Number(latestLog.hafalan_ayah_end),
 ayat_end: Number(latestLog.hafalan_ayah_end),
 repeated: true,
 }
 }

 const previousRangeSize = Math.max(Number(latestLog.hafalan_ayah_end) - Number(latestLog.hafalan_ayah_start) + 1, 1)
 const nextAyah = Number(latestLog.hafalan_ayah_end) + 1
 if (currentSurah && nextAyah <= Number(currentSurah.jumlah_ayat)) {
 return {
 surahNumber: Number(currentSurah.nomor),
 surah_name: currentSurah.nama_latin,
 ayatStart: nextAyah,
 ayat_start: nextAyah,
 ayatEnd: Math.min(nextAyah + previousRangeSize - 1, Number(currentSurah.jumlah_ayat)),
 ayat_end: Math.min(nextAyah + previousRangeSize - 1, Number(currentSurah.jumlah_ayat)),
 repeated: false,
 }
 }

 const nextSurah = quranSurahs.find((surah) => Number(surah.nomor) === Number(latestLog.hafalan_surah_number) + 1)
 return nextSurah
 ? {
 surahNumber: Number(nextSurah.nomor),
 surah_name: nextSurah.nama_latin,
 ayatStart: 1,
 ayat_start: 1,
 ayatEnd: Math.min(previousRangeSize, Number(nextSurah.jumlah_ayat)),
 ayat_end: Math.min(previousRangeSize, Number(nextSurah.jumlah_ayat)),
 repeated: false,
 }
 : {
 surahNumber: Number(latestLog.hafalan_surah_number),
 surah_name: surahName,
 ayatStart: Number(latestLog.hafalan_ayah_start),
 ayat_start: Number(latestLog.hafalan_ayah_start),
 ayatEnd: Number(latestLog.hafalan_ayah_end),
 ayat_end: Number(latestLog.hafalan_ayah_end),
 repeated: true,
 }
 }
 const automaticTahfizhTarget = getAutomaticTahfizhTarget(previousTahfizhLog)
 const sortedTahfizhLeaderboard = React.useMemo(() => {
 // Merge students from API students state and from tahfizhLogs database records
 const studentMap = new Map()

 students.forEach((s) => {
 if (s?.id) {
 studentMap.set(s.id, {
 ...s,
 nama_lengkap: s.nama_lengkap || s.full_name || s.name || 'Siswa',
 nis: s.nis || s.nisn || '',
 unit_name: s.education_unit?.name || s.unit?.name || s.kelas?.unit_pendidikan?.name || s.unit_name || 'Unit Sekolah',
 class_name: s.kelas?.nama_kelas || s.class_name || selectedClassName || 'Kelas -',
 })
 }
 })

 tahfizhLogs.forEach((log) => {
 if (log.student?.id && !studentMap.has(log.student.id)) {
 const s = log.student
 studentMap.set(s.id, {
 ...s,
 id: s.id,
 nama_lengkap: s.nama_lengkap || s.full_name || s.name || 'Siswa',
 nis: s.nis || s.nisn || '',
 unit_name: s.education_unit?.name || s.unit?.name || log.class_model?.unit_pendidikan?.name || s.unit_name || 'Unit Sekolah',
 class_name: log.class_model?.nama_kelas || s.kelas?.nama_kelas || s.class_name || 'Kelas -',
 })
 }
 })

 const allStudentsList = Array.from(studentMap.values())

 let list = allStudentsList.map((student) => {
 const studentLogs = tahfizhLogs
 .filter((log) => log.student_id === student.id || log.student?.id === student.id)
 .sort((first, second) => String(second.record_date || '').localeCompare(String(first.record_date || '')))
 const latest = studentLogs[0] || null

 // Hitung hanya setoran hafalan baru (Ziyadah) tervalidasi dengan interval merging
 const ziyadahLogs = studentLogs.filter((log) => {
 const rawT = String(log.metadata?.type || log.type || (log.hafalan_surah_number ? 'Ziyadah' : 'Murajaah')).toLowerCase()
 return rawT !== 'murajaah' && rawT !== 'murojaah' && !!log.hafalan_surah_number
 })

 const surahMap = {}
 ziyadahLogs.forEach((log) => {
 const sNum = log.hafalan_surah_number
 if (!surahMap[sNum]) surahMap[sNum] = []
 const start = Number(log.hafalan_ayah_start || 1)
 const end = Number(log.hafalan_ayah_end || start)
 if (start <= end) surahMap[sNum].push({ start, end })
 })

 let totalAyat = 0
 let completedSurahs = 0
 Object.entries(surahMap).forEach(([sNum, ranges]) => {
 if (!ranges.length) return
 ranges.sort((a, b) => a.start - b.start)
 const merged = [ranges[0]]
 for (let i = 1; i < ranges.length; i++) {
 const cur = ranges[i]
 const prev = merged[merged.length - 1]
 if (cur.start <= prev.end + 1) {
 prev.end = Math.max(prev.end, cur.end)
 } else {
 merged.push(cur)
 }
 }
 const surahAyats = merged.reduce((acc, r) => acc + (r.end - r.start + 1), 0)
 totalAyat += surahAyats
 const qSurah = quranSurahs.find((s) => Number(s.nomor) === Number(sNum))
 if (qSurah && surahAyats >= Number(qSurah.jumlah_ayat)) {
 completedSurahs++
 }
 })

 const unitName = student.unit_name || student.education_unit?.name || student.unit?.name || student.kelas?.unit_pendidikan?.name || 'Unit Sekolah'
 const className = student.class_name || student.kelas?.nama_kelas || selectedClassName || 'Kelas -'

 return { student, latest, totalAyat, completedSurahs, totalSetoran: studentLogs.length, unitName, className }
 })

 // Filter by rombel (either via explicit tahfizhFilterClass or fallback to workspace selectedClass)
 const activeClassFilter = tahfizhFilterClass !== 'all' ? tahfizhFilterClass : (selectedClass !== 'all' ? selectedClass : null)
 if (activeClassFilter) {
 list = list.filter((item) => {
 const sClassId = item.student?.kelas_id || item.student?.class_id || item.student?.kelas?.id
 return !!sClassId && String(sClassId) === String(activeClassFilter)
 })
 }

 // Filter out students without setoran when viewing broad foundation/unit leaderboard
 if ((isPengurusYayasan || isKepalaSekolahOrDivisiPendidikan) && list.some((item) => item.totalSetoran > 0)) {
 list = list.filter((item) => item.totalSetoran > 0 || item.totalAyat > 0)
 }

 // Role-Based Scope Filtering:
 // 1. Global Scope: Superadmin, Admin, Pengurus Yayasan, Divisi Pendidikan
 // -> Melihat seluruh unit secara default ('semua'), atau dapat menyortir masing-masing unit pendidikan via selectedTahfizhUnit
 if (isGlobalTahfizhScope) {
 if (selectedTahfizhUnit && selectedTahfizhUnit !== 'semua') {
 const target = selectedTahfizhUnit.toLowerCase().trim()
 list = list.filter((item) => {
 const itemUnitName = (item.unitName || '').toLowerCase().trim()
 const itemUnitId = String(item.student?.education_unit_id || item.student?.unit_id || item.student?.education_unit?.id || item.student?.kelas?.unit_pendidikan_id || '')
 return (
 itemUnitName.includes(target) ||
 target.includes(itemUnitName) ||
 itemUnitId === selectedTahfizhUnit
 )
 })
 }
 } else {
 // 2. Unit-Locked Scope: Guru, Kepala Sekolah, TU, Musyrif
 // -> HARUS SESUAI dengan unit pendidikannya masing-masing
 const userUnitName = (teacherProfile?.education_unit || user?.education_unit?.name || user?.unit_name || user?.unit?.nama || '').toLowerCase().trim()
 const userUnitId = String(teacherProfile?.education_unit_data?.id || user?.education_unit_id || user?.education_unit?.id || user?.unit_id || '')

 if (userUnitId || (userUnitName && userUnitName !== '-')) {
 list = list.filter((item) => {
 const itemUnitId = String(item.student?.education_unit_id || item.student?.unit_id || item.student?.education_unit?.id || item.student?.kelas?.unit_pendidikan_id || item.student?.kelas?.education_unit_id || '')
 const itemUnitName = (item.unitName || item.student?.education_unit?.name || item.student?.unit?.name || item.student?.kelas?.unit_pendidikan?.name || '').toLowerCase().trim()

 if (userUnitId && itemUnitId && itemUnitId === userUnitId) {
 return true
 }
 if (userUnitName && itemUnitName && (itemUnitName.includes(userUnitName) || userUnitName.includes(itemUnitName))) {
 return true
 }
 return false
 })
 }
 }

 // Search Query Filtering
 if (debouncedTahfizhSearch) {
 const q = debouncedTahfizhSearch.toLowerCase()
 list = list.filter((item) =>
 (item.student.nama_lengkap || '').toLowerCase().includes(q) ||
 (item.student.nis || item.student.nisn || '').toLowerCase().includes(q) ||
 (item.unitName || '').toLowerCase().includes(q) ||
 (item.className || '').toLowerCase().includes(q)
 )
 }

 // Dynamic Sorting based on tahfizhSortOrder (Default: highest / terbanyak hafalan)
 return list.sort((a, b) => {
 if (tahfizhSortOrder === 'surah') {
 if (b.completedSurahs !== a.completedSurahs) return b.completedSurahs - a.completedSurahs
 return b.totalAyat - a.totalAyat
 }
 if (tahfizhSortOrder === 'name_asc') {
 return (a.student.nama_lengkap || '').localeCompare(b.student.nama_lengkap || '')
 }
 if (tahfizhSortOrder === 'name_desc') {
 return (b.student.nama_lengkap || '').localeCompare(a.student.nama_lengkap || '')
 }
 if (tahfizhSortOrder === 'recent') {
 const dateA = a.latest?.record_date || ''
 const dateB = b.latest?.record_date || ''
 return dateB.localeCompare(dateA)
 }
 // Default: highest (pencapaian hafalan ayat terbanyak)
 if (b.totalAyat !== a.totalAyat) return b.totalAyat - a.totalAyat
 if (b.completedSurahs !== a.completedSurahs) return b.completedSurahs - a.completedSurahs
 if (b.totalSetoran !== a.totalSetoran) return b.totalSetoran - a.totalSetoran
 const nameCompare = (a.student.nama_lengkap || '').localeCompare(b.student.nama_lengkap || '')
 if (nameCompare !== 0) return nameCompare
 return (a.student.id || '').localeCompare(b.student.id || '')
 })
 }, [students, tahfizhLogs, selectedTahfizhUnit, debouncedTahfizhSearch, tahfizhFilterClass, tahfizhSortOrder, selectedClass, isGlobalTahfizhScope, isPengurusYayasan, isKepalaSekolahOrDivisiPendidikan, teacherProfile, user, selectedClassName, quranSurahs])

 const top5TahfizhStudents = React.useMemo(() => {
 return sortedTahfizhLeaderboard
 .filter((item) => (item.totalAyat || 0) > 0 || (item.totalSetoran || 0) > 0)
 .slice(0, 5)
 }, [sortedTahfizhLeaderboard])

 const unitStatsSummary = React.useMemo(() => {
 const map = {}
 sortedTahfizhLeaderboard.forEach((item) => {
 const uName = item.unitName
 if (!map[uName]) {
 map[uName] = { unitName: uName, totalStudents: 0, totalSetoran: 0, totalAyat: 0, topStudent: item }
 }
 map[uName].totalStudents += 1
 map[uName].totalSetoran += item.totalSetoran
 map[uName].totalAyat += item.totalAyat
 if (item.totalAyat > (map[uName].topStudent?.totalAyat || 0)) {
 map[uName].topStudent = item
 }
 })
 return Object.values(map).sort((a, b) => {
 if (b.totalAyat !== a.totalAyat) return b.totalAyat - a.totalAyat
 return a.unitName.localeCompare(b.unitName)
 })
 }, [sortedTahfizhLeaderboard])

 const totalTahfizhPages = React.useMemo(() => {
 if (tahfizhPerPage === 'all') return 1
 const perPage = Number(tahfizhPerPage) || 10
 return Math.max(1, Math.ceil(sortedTahfizhLeaderboard.length / perPage))
 }, [sortedTahfizhLeaderboard.length, tahfizhPerPage])

 const paginatedTahfizhLeaderboard = React.useMemo(() => {
 if (tahfizhPerPage === 'all') return sortedTahfizhLeaderboard
 const perPage = Number(tahfizhPerPage) || 10
 const start = (tahfizhPage - 1) * perPage
 return sortedTahfizhLeaderboard.slice(start, start + perPage)
 }, [sortedTahfizhLeaderboard, tahfizhPage, tahfizhPerPage])

 const tahfizhByStudent = paginatedTahfizhLeaderboard

 const openTahfizhForm = (student = null) => {
 const studentClassId = student?.kelas_id || student?.class_id || student?.kelas?.id || selectedClass || (classes[0]?.id ? String(classes[0].id) : '')
 setTahfizhModalClass(studentClassId || 'all')
 setStudentModalSearch('')
 setTahfizhForm({
 student_id: student?.id || '',
 class_id: studentClassId,
 type: 'Ziyadah',
 juz: 30,
 surah_number: '',
 ayat_start: 1,
 ayat_end: 1,
 kelancaran: 'Sangat Lancar',
 tajwid: 'Baik',
 makhraj: 'Baik',
 notes_teacher: ''
 })
 setModalType('tahfizh')
 setShowModal(true)
 if (studentClassId && studentClassId !== 'all' && String(studentClassId) !== String(selectedClass)) {
 fetchStudentsForClass(studentClassId)
 }
 }

 useEffect(() => {
 if (!tahfizhForm.student_id || !automaticTahfizhTarget) return
 setTahfizhForm((current) => ({
 ...current,
 surah_number: automaticTahfizhTarget.surahNumber,
 ayat_start: automaticTahfizhTarget.ayatStart,
 ayat_end: automaticTahfizhTarget.ayatEnd,
 juz: getQuranJuz(automaticTahfizhTarget.surahNumber, automaticTahfizhTarget.ayatStart),
 }))
 }, [tahfizhForm.student_id, previousTahfizhLog?.id, quranSurahs.length])

 const openTahfizhDetail = (student) => {
 setTahfizhDetailStudent(student)
 setTahfizhWeekOffset(0)
 setShowTahfizhDetail(true)
 }

 const handlePrintTahfizhLeaderboard = () => {
 printCleanTable({
 title: 'Leaderboard & Rekapitulasi Tahfizh Al-Qur\'an',
 subtitle: `Scope: ${isGlobalTahfizhScope ? (selectedTahfizhUnit !== 'semua' ? `Unit ${selectedTahfizhUnit}` : 'Seluruh Unit (Yayasan & Divisi Pendidikan)') : `Unit ${teacherProfile?.education_unit || user?.education_unit?.name || 'Sekolah'}${selectedClassName ? ` — Kelas ${selectedClassName}` : ''}`} | Tahun Ajaran ${selectedAcademicYear || 'Aktif'}`,
 headers: ['Rank', 'Nama Siswa / Santri', 'NIS', 'Unit Sekolah', 'Kelas', 'Juz', 'Capaian Terakhir', 'Total Hafalan (Ayat)', 'Total Surah'],
 rows: sortedTahfizhLeaderboard.map(({ student, latest, totalAyat, completedSurahs, unitName, className }, idx) => [
 idx + 1,
 student.nama_lengkap || '-',
 student.nis || student.nisn || '-',
 unitName || '-',
 className || '-',
 latest ? `Juz ${latest.metadata?.juz || getQuranJuz(latest.hafalan_surah_number, latest.hafalan_ayah_start) || '-'}` : '-',
 latest ? `${latest.hafalan_surah_name || '-'} (${latest.hafalan_ayah_start || 1}-${latest.hafalan_ayah_end || 1})` : 'Belum Ada',
 `${totalAyat || 0} Ayat`,
 `${completedSurahs || 0} Surah`,
 ]),
 user,
 unit: teacherProfile?.unit || user?.employee?.unit || user?.unit,
 })
 addToast('info', 'Dokumen Siap Dicetak', 'Pratinjau cetak leaderboard tahfizh berhasil dibuka.')
 }

 const handleDownloadPdfTahfizhLeaderboard = () => {
 downloadPdfTable({
 title: 'Leaderboard & Rekapitulasi Tahfizh Al-Qur\'an',
 subtitle: `Scope: ${isGlobalTahfizhScope ? (selectedTahfizhUnit !== 'semua' ? `Unit ${selectedTahfizhUnit}` : 'Seluruh Unit (Yayasan & Divisi Pendidikan)') : `Unit ${teacherProfile?.education_unit || user?.education_unit?.name || 'Sekolah'}${selectedClassName ? ` — Kelas ${selectedClassName}` : ''}`} | Tahun Ajaran ${selectedAcademicYear || 'Aktif'}`,
 headers: ['Rank', 'Nama Siswa / Santri', 'NIS', 'Unit Sekolah', 'Kelas', 'Juz', 'Capaian Terakhir', 'Total Hafalan (Ayat)', 'Total Surah'],
 rows: sortedTahfizhLeaderboard.map(({ student, latest, totalAyat, completedSurahs, unitName, className }, idx) => [
 idx + 1,
 student.nama_lengkap || '-',
 student.nis || student.nisn || '-',
 unitName || '-',
 className || '-',
 latest ? `Juz ${latest.metadata?.juz || getQuranJuz(latest.hafalan_surah_number, latest.hafalan_ayah_start) || '-'}` : '-',
 latest ? `${latest.hafalan_surah_name || '-'} (${latest.hafalan_ayah_start || 1}-${latest.hafalan_ayah_end || 1})` : 'Belum Ada',
 `${totalAyat || 0} Ayat`,
 `${completedSurahs || 0} Surah`,
 ]),
 user,
 unit: teacherProfile?.unit || user?.employee?.unit || user?.unit,
 filename: `leaderboard-tahfizh-${selectedClassName || 'all'}-${new Date().toISOString().slice(0, 10)}.pdf`,
 })
 addToast('success', 'PDF Disiapkan', 'Dokumen PDF leaderboard tahfizh siap diunduh.')
 }

 const tahfizhWeekStart = (() => {
 const date = new Date()
 const day = date.getDay() || 7
 date.setHours(12, 0, 0, 0)
 date.setDate(date.getDate() - day + 1 + (tahfizhWeekOffset * 7))
 return date
 })()
 const tahfizhWeekRows = Array.from({ length: 7 }, (_, index) => {
 const date = new Date(tahfizhWeekStart)
 date.setDate(date.getDate() + index)
 const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
 const log = tahfizhLogs.find((item) => item.student_id === tahfizhDetailStudent?.id && item.record_date === dateKey)
 return { date, dateKey, log }
 })



 return (
 <PageContainer className="teacher-workspace-page space-y-6 pb-20 xl:pb-8">
 {/* ── BREADCRUMB NAV ────────────────────────────────────────── */}
 <AppBreadcrumb
 items={[
 { label: 'Dashboard', href: '/dashboard' },
 { label: 'Portal Guru', href: '/portal-guru/workspace' },
 { label: 'Workspace Pembelajaran Guru' },
 ]}
 />

 {/* ── MODERN HERO CARD HEADER ───────────────────────────────── */}
      <HeroUiHeader
        icon={GraduationCap}
        title="Workspace Pembelajaran Guru"
        tag={{ text: 'Portal Guru Terpadu', icon: Sparkles }}
        description="Pusat kendali aktivitas mengajar Ustadz/Ustadzah — Kelola jadwal, presensi, materi, tugas, nilai, & jurnal tahfizh terpadu."
        chips={[
          selectedAcademicYear ? `Tahun Ajaran ${selectedAcademicYear} ${selectedSemester ? `• ${selectedSemester}` : ''}` : 'Tahun Ajaran Aktif'
        ]}
        actions={
          <span className="hidden md:inline-flex items-center gap-2 rounded-xl bg-white/80 dark:bg-emerald-950/60 px-4 py-2.5 text-xs font-extrabold text-slate-700 dark:text-slate-200 border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs backdrop-blur-md">
            <User className="size-4 text-emerald-600 dark:text-emerald-400" />
            {teacherProfile?.name || user?.name || 'Ustadz / Ustadzah'}
          </span>
        }
      />

 {/* ── HERO UI WARNING BANNER: TANGGUNG JAWAB RANGKUMAN KBM BELUM LENGKAP ── */}
 <AnimatePresence>
 {pendingJournals.length > 0 && (
 <motion.div
 initial={{ opacity: 0, scale: 0.98, y: -8 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.98, y: -8 }}
 transition={{ duration: 0.3 }}
 className="relative overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white dark:bg-card-dark p-4 sm:p-5 shadow-lg shadow-sm dark:border-emerald-800/60 dark:bg-card-dark"
 >
 {/* Ambient Multi-tone Glow */}

 <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
 <div className="flex items-start sm:items-center gap-3.5">
 <div className="flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-xl !bg-amber-600 !text-white shadow-md border border-emerald-200/80 dark:border-emerald-800/60">
 <AlertTriangle className="size-5 sm:size-6 text-white animate-pulse" />
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <span className="inline-flex items-center gap-1 rounded-full bg-white dark:bg-card-dark px-3 py-0.5 text-xs font-extrabold shadow-xs">
 <Clock className="size-3" />
 Tanggung Jawab Jurnal Belum Selesai
 </span>
 <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 dark:bg-rose-950/80 px-2.5 py-0.5 text-xs font-bold text-rose-800 dark:text-rose-300 border border-emerald-200/80 dark:border-emerald-800/60">
 {pendingJournals.length} Pertemuan Tertunda
 </span>
 </div>
 <h3 className="mt-1 text-sm sm:text-base font-black text-slate-900 dark:text-white">
 Peringatan: Terdapat Rangkuman Pelajaran yang Belum Anda Lengkapi
 </h3>
 <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
 Jam pertemuan telah selesai, namun ringkasan materi dan catatan hasil KBM belum diisi. Tanggung jawab pengisian tetap wajib dilengkapi.
 </p>
 </div>
 </div>

 {/* Action Pills for Pending Sessions */}
 <div className="flex items-center gap-2 flex-wrap shrink-0">
 <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
 {pendingJournals.slice(0, 3).map((sess) => (
 <button
 key={sess.id}
 type="button"
 onClick={() => handleOpenPendingJournalModal(sess)}
 className="group flex items-center gap-2 rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm bg-white/90 dark:bg-slate-800/90 px-3 py-1.5 text-xs font-extrabold text-slate-800 dark:text-slate-100 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-amber-50/80 dark:hover:bg-amber-950/40 transition-all cursor-pointer"
 >
 <BookOpen className="size-3.5 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
 <span className="truncate max-w-[130px]">
 {sess.schedule?.subject?.name || 'Mapel'} ({sess.schedule?.kelas?.nama_kelas || 'Kelas'})
 </span>
 <span className="rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-700 dark:text-amber-300">
 P#{sess.meeting_number || 1}
 </span>
 </button>
 ))}
 {pendingJournals.length > 3 && (
 <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
 +{pendingJournals.length - 3} lainnya
 </span>
 )}
 </div>

 <button
 type="button"
 onClick={() => handleOpenPendingJournalModal(pendingJournals[0])}
 className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white dark:bg-[#1B2433] px-4 py-2 text-xs font-extrabold shadow-sm hover:from-amber-500 hover:to-rose-600 transition-all cursor-pointer shrink-0 border border-emerald-200/80 dark:border-emerald-800/60"
 >
 <Edit3 className="size-3.5 text-amber-600" />
 <span>Isi Rangkuman Sekarang</span>
 </button>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* ── BAR KONTROL ROMBEL & MATA PELAJARAN (SUB-HEADER WORKSPACE) ── */}
 <motion.div
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.25 }}
 className="relative overflow-hidden rounded-xl border border-emerald-200/80 bg-white p-4 sm:p-5 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433] z-20"
 >

 <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
 {/* Sisi Kiri: Ikon Squircle, Judul, Pill Aktif, dan Penjelasan */}
 <div className="flex items-start sm:items-center gap-3.5 min-w-0">
 <div className="flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-xl !bg-emerald-600 !text-white shadow-md border border-emerald-200/80 dark:border-emerald-800/60">
 <Layers className="size-5 sm:size-6" />
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <h3 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white">
 Filter Rombel &amp; Mata Pelajaran
 </h3>
 <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-extrabold border border-emerald-200/80 dark:border-emerald-800/60">
 <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
 Aktif
 </span>
 {selectedClass && selectedClass !== 'all' && (
 <span className="hidden md:inline-flex items-center rounded-full bg-emerald-50 text-emerald-700  dark:bg-emerald-50/70 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 text-[10px] font-bold border border-emerald-200/80  dark:border-emerald-800/60 ">
 Rombel: {selectedClassName || selectedClass}
 </span>
 )}
 </div>
 <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
 Pilih rombel dan mata pelajaran untuk memfilter jadwal, presensi, materi, tugas, nilai, &amp; mutaba'ah siswa secara terpadu.
 </p>
 </div>
 </div>

 {/* Sisi Kanan: Kontrol Filter Presisi & Rapi */}
 <div className="flex flex-wrap items-center gap-2.5 shrink-0">
 {/* Filter Rombel */}
 <div className="w-full sm:w-[220px]">
 <HeroUiFilterSelect
 id="workspace-rombel-select"
 size="md"
 value={activeWorkspaceClassValue}
 onChange={(val) => handleWorkspaceClassChange(val)}
 options={[
 { value: 'all', label: 'Semua Rombel', subtext: 'Seluruh rombel yang diampu' },
 ...filteredClassesOptions.map((c) => ({
 value: String(c.id),
 label: c.nama_kelas || c.name || `Kelas ${c.id}`,
 subtext: c.kode_kelas ? `Kode: ${c.kode_kelas}` : undefined,
 })),
 ]}
 icon={Users}
 placeholder="Pilih Rombel"
 ariaLabel="Pilih Rombel"
 searchable
 />
 </div>

 {/* Filter Mata Pelajaran */}
 <div className="w-full sm:w-[220px]">
 <HeroUiFilterSelect
 id="workspace-mapel-select"
 size="md"
 value={activeWorkspaceMapelValue}
 onChange={(val) => handleWorkspaceMapelChange(val)}
 options={[
 { value: 'all', label: 'Semua Mata Pelajaran', subtext: 'Seluruh mapel yang diampu' },
 ...uniqueMapelOptions.map((subj) => ({
 value: String(subj.id),
 label: subj.name,
 })),
 ]}
 icon={BookOpen}
 placeholder="Pilih Mata Pelajaran"
 ariaLabel="Pilih Mata Pelajaran"
 searchable
 />
 </div>

 {/* Tombol Reset Filter jika ada filter aktif */}
 {(selectedClass !== 'all' || materialMapelFilter !== 'all') && (
 <button
 type="button"
 onClick={() => {
 handleWorkspaceClassChange('all')
 handleWorkspaceMapelChange('all')
 }}
 className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs bg-rose-50/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-bold transition-all cursor-pointer shadow-2xs"
 title="Reset filter ke Semua Rombel & Semua Mapel"
 >
 <RefreshCw className="size-3.5" />
 <span>Reset</span>
 </button>
 )}

 {/* Pill Siswa Terdaftar */}
 <div className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-white dark:bg-[#1B2433] dark:from-emerald-950/50 dark:to-teal-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-black text-emerald-900 dark:text-emerald-200 shadow-2xs">
 <Sparkles className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
 <span>{students.length} Siswa</span>
 </div>
 </div>
 </div>
 </motion.div>

 {/* ── BANNER JAM PELAJARAN SEDANG AKTIF (DI BAWAH CARD HERO WORKSPACE) ── */}
 <ActiveScheduleNotice />

 {/* ── TOAST NOTIFICATION LAYER ────────────────────────────────────── */}
 <div className="fixed bottom-5 right-5 z-[9999] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2.5 pointer-events-none" aria-live="polite" aria-atomic="true">
 {toasts.map((toast) => (
 <div
 key={toast.id}
 className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-[var(--shadow-soft-xl)] border backdrop-blur-md transition-all animate-in slide-in-from-bottom duration-300 ${toast.type === 'success'
 ? 'bg-emerald-900/90 text-emerald-100 border-emerald-700/80/80'
 : toast.type === 'error'
 ? 'bg-rose-900/90 text-rose-100 border-rose-700/80'
 : toast.type === 'warning'
 ? 'bg-amber-900/90 text-amber-100 border-amber-700/80'
 : 'bg-slate-900/90 text-slate-100 border-emerald-700/80/80'
 }`}
 >
 {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />}
 {toast.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
 {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />}
 {toast.type === 'info' && <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />}
 <div className="flex-1 min-w-0">
 <h4 className="font-bold text-sm leading-tight">{toast.title}</h4>
 <p className="text-xs mt-0.5 opacity-90 leading-relaxed">{toast.message}</p>
 </div>
 <button onClick={() => removeToast(toast.id)} aria-label="Tutup notifikasi" className="rounded-lg p-1 transition hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/70">
 <X className="w-4 h-4" />
 </button>
 </div>
 ))}
 </div>



 {/* ── 5 HEROUI STANDARD KPI CARDS ────────────────────────────────────────── */}
 <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4" aria-label="Metrik Utama Guru">
 {[
 {
 key: 'jadwal',
 label: 'Jadwal Mengajar',
 value: schedules.length,
 description: `${new Set(schedules.map(getScheduleSubject)).size} mata pelajaran`,
 badge: `${schedules.length} Sesi Terjadwal`,
 icon: CalendarDays,
 tone: 'emerald',
 isActive: activeTab === 'jadwal' || activeTab === 'jadwal-lengkap',
 onClick: () => changeTab(activeTab === 'jadwal-lengkap' ? 'jadwal' : 'jadwal-lengkap'),
 },
 {
 key: 'siswa',
 label: 'Siswa Terdaftar',
 value: students.length,
 description: `Rombel ${selectedClassName}`,
 badge: `${students.length} Siswa`,
 icon: Users,
 tone: 'sky',
 isActive: activeTab === 'presensi',
 onClick: () => changeTab('presensi'),
 },
 {
 key: 'materi',
 label: 'Materi Terbit',
 value: publishedMaterials,
 description: `${materials.length} total materi`,
 badge: `${publishedMaterials} Terbit`,
 icon: BookOpen,
 tone: 'amber',
 isActive: activeTab === 'materi',
 onClick: () => changeTab('materi'),
 },
 {
 key: 'penugasan',
 label: 'Penugasan Aktif',
 value: activeAssignments,
 description: `${assignments.length} total penugasan`,
 badge: `${activeAssignments} Aktif`,
 icon: FileText,
 tone: 'indigo',
 isActive: activeTab === 'penugasan',
 onClick: () => changeTab('penugasan'),
 },
 {
 key: 'catatan',
 label: canAccessTahfizh ? 'Catatan & Tahfizh' : 'Catatan Siswa',
 value: canAccessTahfizh ? tahfizhLogs.length + studentNotes.length : studentNotes.length,
 description: 'Total pendampingan',
 badge: `${canAccessTahfizh ? tahfizhLogs.length + studentNotes.length : studentNotes.length} Log`,
 icon: GraduationCap,
 tone: 'rose',
 isActive: (canAccessTahfizh && (activeTab === 'tahfizh' || activeTab === 'rekapan-tahfizh')) || activeTab === 'catatan',
 onClick: () => changeTab(canAccessTahfizh ? 'tahfizh' : 'catatan'),
 },
 ].map((kpi) => (
 <KpiStatCard
 key={kpi.key}
 title={kpi.label}
 value={kpi.value}
 description={kpi.description}
 badge={kpi.badge}
 icon={kpi.icon}
 tone={kpi.tone}
 leftFooterText={kpi.isActive ? '● Sedang Aktif' : 'Buka Modul'}
 ctaText="Lihat"
 onClick={kpi.onClick}
 className={kpi.isActive ? 'ring-2 ring-emerald-500/50 shadow-md' : ''}
 />
 ))}
 </section>



 {/* ── CARD AKSI CEPAT & NAVIGASI MODUL ────────────────────────────────────────── */}
 <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]" aria-label="Aksi Cepat Workspace Guru">
 {/* Dual multi-tone ambient glow */}

 <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-transparent p-4 sm:p-5">
 <div className="flex items-center gap-3">
 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl !bg-emerald-600 !text-white shadow-md border border-emerald-200/80 dark:border-emerald-800/60">
 <Zap className="size-5" />
 </div>
 <div>
 <div className="flex items-center gap-2 flex-wrap">
 <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white">Aksi Cepat &amp; Navigasi Modul</h3>
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/90 dark:bg-emerald-950/80 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
 <Sparkles className="size-3 text-amber-500 animate-pulse" />
 Alur Kerja Guru
 </span>
 </div>
 <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Pilih modul untuk berpindah fitur pengajaran guru secara langsung &amp; terintegrasi.</p>
 </div>
 </div>
 <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold bg-emerald-600 text-white shadow-xs border border-emerald-500/40 dark:border-emerald-600/50">
 {cardModulesList.length} Modul Terintegrasi
 </span>
 </div>

 <div className="relative z-10 p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3" role="tablist" aria-label="Modul pengajaran">
 {cardModulesList.map((mod) => {
 const Icon = mod.icon
 const isActive = activeTab === mod.id
 return (
 <motion.button
 type="button"
 key={mod.id}
 whileHover={{ scale: 1.03, y: -2 }}
 whileTap={{ scale: 0.97 }}
 transition={{ type: 'spring', stiffness: 400, damping: 25 }}
 onClick={() => handleCardClick(mod)}
 role="tab"
 aria-selected={isActive}
 className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all text-center group cursor-pointer ${isActive
 ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-md ring-2 ring-emerald-600/30'
 : (mod.cardClass || 'border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 hover:shadow-md')
 }`}
 >
 <div className={`p-2.5 rounded-xl ${mod.iconBox || 'bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm'} mb-2 shrink-0 group-hover:scale-110 transition ${isActive ? 'ring-2 ring-emerald-500/40 shadow-xs' : ''}`}>
 <Icon className="w-5 h-5 text-white" />
 </div>
 <span className={`font-bold text-xs leading-tight transition-colors ${isActive ? 'text-emerald-900 dark:text-emerald-200 font-black' : 'text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400'
 }`}>
 {mod.title}
 </span>
 {mod.badge && (
 <span className={`mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-extrabold ${mod.badgeColor || 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'}`}>
 {mod.badge}
 </span>
 )}
 </motion.button>
 )
 })}
 </div>
 </section>

 {/* ── MAIN WORKSPACE CONTENT PIPELINE ──────────────────────────────────────── */}
 <div className="w-full">
 {/* Konten utama workspace */}
 <main className="space-y-6 w-full">
 {/* TAB 1: JADWAL MENGAJAR */}
 {activeTab === 'jadwal' && (
 <div className="space-y-5">
 {/* HeroUI Modern Hero Card Banner */}
 <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 !bg-[#D5F2E3] p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:!bg-[#112a22] print:hidden">

 <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
 <div className="flex items-start gap-4">
 <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl !bg-emerald-600 !text-white shadow-md border border-emerald-200/80 dark:border-emerald-800/60">
 <CalendarDays className="h-7 w-7" />
 </div>
 <div>
 <div className="flex flex-wrap items-center gap-2">
 <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold bg-emerald-600 text-white shadow-xs border border-emerald-500/40 dark:border-emerald-600/50">

                  <CalendarRange className="h-3 w-3 text-white" />
 Agenda Mengajar Harian
 </span>
 <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/90 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/80 dark:text-emerald-300">
 TA 2026/2027 • Ganjil
 </span>
 </div>
 <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-white sm:text-2xl tracking-tight">
 {selectedDateDay}, {selectedDate}
 </h2>
 <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2 flex-wrap">
 <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-bold">
 <Users className="h-3.5 w-3.5" />
 {selectedClassName}
 </span>
 <span className="text-slate-300 dark:text-slate-600">•</span>
 <span>{teacherName}</span>
 </p>
 </div>
 </div>

 <div className="grid grid-cols-3 gap-2.5 sm:min-w-[340px]">
 {[
 { value: selectedDaySchedules.length, label: `Sesi ${selectedDateDay}`, sub: 'Hari ini' },
 { value: sortedSchedules.length, label: 'Total Sesi', sub: 'Mingguan' },
 { value: new Set(sortedSchedules.map(getScheduleSubject)).size, label: 'Mata Pelajaran', sub: 'Aktif diampu' },
 ].map((summary) => (
                      <div
                        key={summary.label}
                        className="rounded-2xl border-2 border-emerald-300/80 dark:border-emerald-700/80 !bg-emerald-100/90 dark:!bg-emerald-950/60 p-3 text-center shadow-xs transition hover:border-emerald-400 dark:hover:border-emerald-600"
                      >
                        <strong className="block text-xl font-black text-emerald-800 dark:text-emerald-200">
                          {summary.value}
                        </strong>
                        <span className="block text-xs font-bold text-emerald-800 dark:text-emerald-300">
                          {summary.label}
                        </span>
                        <span className="block text-[9px] font-medium text-emerald-700/80 dark:text-emerald-400/80">
                          {summary.sub}
                        </span>
                      </div>
 ))}
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 gap-5 xl:grid-cols-12 xl:items-stretch">
 <section className="relative flex h-full flex-col overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-sm dark:bg-[#1B2433] xl:col-span-7">
 {/* Header toolbar */}
 <div className="bg-emerald-500/10 border-b border-emerald-200/80 dark:border-emerald-800/60 px-5 py-4">
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div className="flex items-center gap-3">
 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
 <Clock className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
 Timeline {timelineFilter === 'semua' ? 'Semua Hari' : (timelineFilter === 'auto' ? (selectedDaySchedules.length > 0 ? selectedDateDay : (sortedSchedules.length > 0 ? 'Seluruh Jadwal' : selectedDateDay)) : timelineFilter)}
 </h3>
 <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
 {selectedDaySchedules.length === 0 && sortedSchedules.length > 0 && (timelineFilter === 'auto' || timelineFilter === 'semua')
 ? `Menampilkan seluruh jadwal mengajar aktif untuk ${selectedClassName}.`
 : 'Urutan sesi mengajar berdasarkan jam mulai.'}
 </p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <PageToolbarActions
   onPrint={() => {
     printCleanTable({
       title: `Jadwal Mengajar Guru - ${teacherName || 'Guru'}`,
       subtitle: `Unit / Kelas: ${selectedClassName} | Tahun Ajaran 2026/2027`,
       headers: ['No', 'Hari', 'Jam Sesi', 'Mata Pelajaran', 'Kelas', 'Ruangan'],
       rows: sortedSchedules.map((s, idx) => [
         idx + 1,
         getScheduleDay(s) || '-',
         `${s.jam_mulai || s.time_start || '-'} - ${s.jam_selesai || s.time_end || '-'}`,
         getScheduleSubject(s) || '-',
         s.kelas?.nama_kelas || selectedClassName || '-',
         s.ruangan || s.room || 'Ruang Kelas',
       ]),
       user,
       unit: teacherProfile?.unit || user?.employee?.unit || user?.unit,
     })
   }}
   printLabel="Cetak Jadwal"
   showLabel
 />
 <span className="rounded-full border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-100/80 px-3 py-1 text-xs font-black text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/80 dark:text-emerald-300">
 {timelineSchedules.length} sesi ditampilkan
 </span>
 </div>
 </div>

 {/* Quick Timeline Day Filter Pills */}
 {sortedSchedules.length > 0 && (
 <div className="mt-3.5 flex flex-wrap items-center gap-1.5 pt-2 border-t border-emerald-200/80 dark:border-emerald-800/80 dark:border-emerald-800/60">
 <button
 type="button"
 onClick={() => setTimelineFilter('hari_ini')}
 className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${timelineFilter === 'hari_ini'
 ? 'bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white shadow-xs shadow-sm'
 : 'border border-emerald-200/80 bg-slate-100/80 text-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-emerald-50/70 hover:text-emerald-800 dark:border-emerald-700/80/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-slate-700'
 }`}
 >
 Hari Ini ({selectedDateDay}: {selectedDaySchedules.length})
 </button>
 <button
 type="button"
 onClick={() => setTimelineFilter('semua')}
 className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${timelineFilter === 'semua' || (timelineFilter === 'auto' && selectedDaySchedules.length === 0)
 ? 'bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white shadow-xs shadow-sm'
 : 'border border-emerald-200/80 bg-slate-100/80 text-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-emerald-50/70 hover:text-emerald-800 dark:border-emerald-700/80/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-slate-700'
 }`}
 >
 Semua Hari ({sortedSchedules.length})
 </button>
 {scheduleDays.map((d) => {
 const count = sortedSchedules.filter((s) => getScheduleDay(s).toLowerCase() === d.name.toLowerCase()).length
 if (count === 0) return null
 return (
 <button
 key={d.name}
 type="button"
 onClick={() => {
 setTimelineFilter(d.name)
 setWeeklySelectedDay(d.short)
 }}
 className={`rounded-xl px-2.5 py-1.5 text-xs font-bold transition cursor-pointer ${timelineFilter === d.name
 ? 'bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white shadow-xs shadow-sm'
 : 'border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/70 text-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/60'
 }`}
 >
 {d.name} ({count})
 </button>
 )
 })}
 </div>
 )}
 </div>

 <div className="p-4 sm:p-5">
 {/* Banner if no schedule TODAY for selected class */}
 {selectedDaySchedules.length === 0 && sortedSchedules.length > 0 && timelineFilter === 'hari_ini' && (
 <div className="mb-4 rounded-2xl border-2 border-amber-300/80 dark:border-amber-700/80 bg-amber-50/70 dark:bg-amber-950/30 p-4 text-amber-900 dark:text-amber-200 shadow-xs">
 <div className="flex items-start gap-3">
 <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs mt-0.5">
 <AlertCircle className="size-5" />
 </div>
 <div className="text-xs space-y-1.5 flex-1">
 <p className="font-extrabold text-slate-900 dark:text-white text-sm">
 Tidak ada jam mengajar pada hari {selectedDateDay} untuk {selectedClassName}.
 </p>
 <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
 Jadwal mengajar kelas ini tersedia pada hari: <strong className="text-emerald-700 dark:text-emerald-300 font-bold">{activeScheduleDays.join(', ')}</strong> (Total {sortedSchedules.length} sesi mingguan).
 </p>
 <div className="pt-1">
 <button
 type="button"
 onClick={() => setTimelineFilter('semua')}
 className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white hover:from-emerald-700 hover:to-teal-700 font-bold text-xs shadow-xs transition cursor-pointer"
 >
 <CalendarDays className="h-3.5 w-3.5" />
 Tampilkan Semua Sesi ({sortedSchedules.length})
 </button>
 </div>
 </div>
 </div>
 </div>
 )}

 {loading ? (
 <div className="space-y-3" aria-label="Memuat jadwal">
 {[1, 2, 3].map((item) => (
 <div key={item} className="h-28 animate-pulse rounded-xl bg-emerald-50/50 dark:bg-slate-800/60 border border-emerald-200/80 dark:border-emerald-800/60" />
 ))}
 </div>
 ) : timelineSchedules.length === 0 ? (
 <div className="flex min-h-60 flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] px-6 py-10 text-center dark:border-emerald-800/60 dark:bg-slate-900/50">
 <div className="flex size-14 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] text-emerald-600 shadow-sm dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-400 mb-3.5 border border-emerald-200/80 dark:border-emerald-800/60">
 <Calendar className="h-7 w-7" />
 </div>
 <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Belum Ada Jadwal Mengajar</h4>
 <p className="mt-1.5 max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">
 Jadwal untuk <span className="font-bold text-emerald-700 dark:text-emerald-400">{selectedClassName}</span> belum tersedia pada sistem atau tidak cocok dengan filter hari saat ini.
 </p>
 {sortedSchedules.length > 0 && timelineFilter !== 'semua' && (
 <button
 type="button"
 onClick={() => setTimelineFilter('semua')}
 className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white px-4 py-2 text-xs font-bold shadow-sm hover:from-emerald-700 hover:to-teal-700 transition cursor-pointer"
 >
 <CalendarDays className="h-4 w-4" />
 Tampilkan Semua Hari ({sortedSchedules.length} Sesi)
 </button>
 )}
 </div>
 ) : (
 <div className="space-y-3">
 {timelineSchedules.map((schedule, index) => {
 const status = getScheduleStatus(schedule)
 const scheduleDay = getScheduleDay(schedule)
 return (
 <article
 key={schedule.id || index}
 className={`group relative overflow-hidden rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${status.isActive
 ? 'border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]'
 : 'border-emerald-200/80 bg-white hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-emerald-50/30 dark:border-emerald-800/60 dark:bg-slate-900/60 dark:hover:border-emerald-700/80 dark:hover:bg-slate-900'
 } p-4`}
 >
 <div className={`absolute inset-y-0 left-0 ${status.isActive ? 'w-1.5 bg-white dark:bg-[#1B2433]' : 'w-1 bg-emerald-600/70'}`} />
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
 <div
 onClick={() => openScheduleDetail(schedule)}
 className="flex min-w-[125px] items-center gap-2 text-emerald-800 dark:text-emerald-300 sm:block cursor-pointer hover:opacity-85 transition"
 title="Klik untuk melihat detail jadwal & presensi siswa"
 >
 <span className="inline-block rounded-md bg-emerald-100/90 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-black text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 mb-1">
 {scheduleDay}
 </span>
 <strong className="text-base font-black sm:block">{(schedule.start_time || schedule.time_start || '00:00').slice(0, 5)}</strong>
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 sm:block">s.d. {(schedule.end_time || schedule.time_end || '00:00').slice(0, 5)} WIB</span>
 </div>
 <div className="min-w-0 flex-1">
 <div className="flex flex-wrap items-center gap-2">
 <h4 className=" font-extrabold text-slate-900 dark:text-white">{getScheduleSubject(schedule)}</h4>
 <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${status.className}`}>{status.label}</span>
 </div>
 <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
 <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />{getScheduleClass(schedule)}</span>
 <span className="flex items-center gap-1.5"><Layers className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />{getScheduleRoom(schedule)}</span>
 </div>
 </div>
 <div className="flex shrink-0 gap-2 sm:flex-col">
 <button
 type="button"
 onClick={() => openPresensiModal(schedule)}
 disabled={!status.isActive}
 title={status.isActive ? 'Buka Presensi Sesi KBM' : `Presensi Tidak Aktif (${status.label})`}
 className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition sm:flex-none ${status.isActive
 ? 'bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white hover:from-emerald-700 hover:to-teal-700 shadow-sm cursor-pointer'
 : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed opacity-60'
 }`}
 >
 <UserCheck className="h-3.5 w-3.5" />
 <span>{status.isActive ? 'Presensi' : `Presensi (${status.label})`}</span>
 </button>
 <button
 type="button"
 onClick={() => openScheduleDetail(schedule)}
 className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white px-3.5 py-2 text-xs font-bold text-emerald-800 shadow-xs transition hover:bg-emerald-50 dark:bg-slate-800 dark:text-emerald-200 dark:hover:bg-slate-700/80 sm:flex-none cursor-pointer"
 title="Lihat data siswa & presensi jadwal ini"
 >
 <Eye className="h-3.5 w-3.5" /> Detail
 </button>
 </div>
 </div>
 </article>
 )
 })}
 </div>
 )}
 </div>
 </section>

 <section className="relative flex h-full flex-col overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-sm dark:bg-[#1B2433] xl:col-span-5">
 {/* Header toolbar */}
 <div className="bg-emerald-500/10 border-b border-emerald-200/80 dark:border-emerald-800/60 px-5 py-4">
 <div className="flex items-center gap-3">
 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
 <CalendarRange className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Jadwal Mingguan</h3>
 <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Pilih hari untuk melihat agenda secara cepat.</p>
 </div>
 </div>
 </div>

 <div className="p-4 sm:p-5 space-y-4">
 <div className="grid grid-cols-5 gap-1.5 rounded-xl bg-emerald-50/70 p-1.5 border border-emerald-200/80 dark:bg-slate-800/80 dark:border-emerald-700/80" role="tablist" aria-label="Hari jadwal mingguan">
 {scheduleDays.map((day) => {
 const dayCount = sortedSchedules.filter((s) => getScheduleDay(s).toLowerCase() === day.name.toLowerCase()).length
 return (
 <button
 key={day.short}
 onClick={() => {
 setWeeklySelectedDay(day.short)
 setTimelineFilter(day.name)
 }}
 role="tab"
 aria-selected={weeklySelectedDay === day.short}
 className={`rounded-xl px-2 py-2 text-xs font-bold transition flex flex-col items-center justify-center cursor-pointer ${weeklySelectedDay === day.short
 ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-emerald-300 dark:border-emerald-800/60'
 : 'text-slate-600 hover:text-emerald-800 hover:bg-white/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
 }`}
 >
 <span>{day.short}</span>
 <span className={`mt-0.5 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${dayCount > 0
 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
 : 'text-slate-400 dark:text-slate-600'
 }`}>
 {dayCount}
 </span>
 </button>
 )
 })}
 </div>

 <div className="flex items-center justify-between rounded-xl bg-white dark:bg-[#1B2433] dark:from-emerald-950/40 dark:via-slate-900 dark:to-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 px-3.5 py-2.5">
 <div>
 <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700/80 dark:text-emerald-400">Hari Terpilih</p>
 <h4 className="font-extrabold text-slate-900 dark:text-white">{visibleWeeklyDay}</h4>
 </div>
 <span className="rounded-full bg-emerald-100/90 px-3 py-1 text-xs font-extrabold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
 {weeklySchedules.length} sesi
 </span>
 </div>

 <div className="space-y-2.5">
 {weeklySchedules.length === 0 ? (
 <div className="rounded-xl border-2 border-dashed border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] px-4 py-8 text-center dark:border-emerald-800/60 dark:bg-slate-900/40">
 <div className="mx-auto mb-2.5 flex size-12 items-center justify-center rounded-xl bg-emerald-100/90 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
 <CheckCircle2 className="h-6 w-6" />
 </div>
 <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Tidak ada sesi di hari {visibleWeeklyDay}</p>
 <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
 {activeScheduleDays.length > 0
 ? `Jadwal rombel ini tersedia di hari: ${activeScheduleDays.join(', ')}`
 : 'Agenda mengajar kosong pada hari ini.'}
 </p>
 {activeScheduleDays.length > 0 && (
 <div className="mt-3.5 flex flex-wrap justify-center gap-1.5">
 {activeScheduleDays.map((dName) => {
 const dObj = scheduleDays.find((d) => d.name.toLowerCase() === dName.toLowerCase())
 return (
 <button
 key={dName}
 type="button"
 onClick={() => {
 if (dObj) setWeeklySelectedDay(dObj.short)
 setTimelineFilter(dName)
 }}
 className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-xs border border-emerald-200/80 dark:border-emerald-800/60 transition cursor-pointer"
 >
 Pindah ke {dName}
 </button>
 )
 })}
 </div>
 )}
 </div>
 ) : (
 weeklySchedules.map((schedule, index) => (
 <button
 key={schedule.id || index}
 type="button"
 onClick={() => openScheduleDetail(schedule)}
 className="group flex w-full items-center gap-3 rounded-xl border border-emerald-200/80 bg-white p-3 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-emerald-50/40 hover:shadow-xs dark:border-emerald-800/60 dark:bg-slate-900/60 dark:hover:border-emerald-700/80 dark:hover:bg-slate-900 cursor-pointer"
 title="Klik untuk melihat detail jadwal & presensi siswa"
 >
 <div className="flex size-11 flex-col items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] text-emerald-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-300 dark:border-emerald-800/60">
 <Clock className="h-3.5 w-3.5" />
 <span className="mt-0.5 block text-[10px] font-black">{(schedule.start_time || schedule.time_start || '00:00').slice(0, 5)}</span>
 </div>
 <div className="min-w-0 flex-1">
 <strong className="block text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors leading-snug">
 {getScheduleSubject(schedule)}
 </strong>
 <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400 leading-tight">
 {getScheduleClass(schedule)} • {getScheduleRoom(schedule)}
 </span>
 </div>
 <div className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-500 dark:group-hover:bg-emerald-950 dark:group-hover:text-emerald-300 transition-colors">
 <ChevronRight className="h-4 w-4" />
 </div>
 </button>
 ))
 )}
 </div>
 </div>
 </section>
 </div>
 </div>
 )}

 {/* TAB 2: PRESENSI SISWA */}
 {activeTab === 'presensi' && (
 <div className="space-y-5 rounded-xl border border-emerald-200/80 bg-white p-5 shadow-[var(--shadow-soft-xl)] dark:border-emerald-700/80/80 dark:bg-[#1B2433]">
 <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-4">
 <div>
 <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Presensi Pembelajaran Siswa</h3>
 <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 <span>Rombel {selectedClassName}</span>
 <span>•</span>
 <span>{getScheduleSubject(getCurrentSchedule() || {})}</span>
 <span>•</span>
 <span className="font-semibold text-emerald-700 dark:text-emerald-300">
 Jam Pelajaran: {getScheduleLessonHours(getCurrentSchedule())}
 </span>
 <span>•</span>
 <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
 <Clock className="w-3 h-3 text-emerald-600" />
 {formattedLiveTime}
 </span>
 </div>
 </div>
 <div className="flex flex-wrap items-center gap-2">
 <div className="inline-flex items-center gap-1.5 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-xs dark:border-emerald-800/60 dark:bg-slate-800 dark:text-emerald-200">
 <Filter className="h-3.5 w-3.5 text-emerald-600" />
 <span className="text-xs text-slate-400 font-medium">Rombel:</span>
 <CustomSelect
 value={selectedClass}
 onChange={(e) => handleModalClassChange(e.target.value)}
 className="bg-transparent text-xs font-extrabold text-emerald-900 dark:text-emerald-100 outline-none cursor-pointer"
 >
 <option value="all" className="dark:bg-slate-900 text-slate-900 dark:text-white">
 Semua Rombel
 </option>
 {classes.map((c) => (
 <option key={c.id} value={c.id} className="dark:bg-slate-900 text-slate-900 dark:text-white">
 {c.nama_kelas || c.name}
 </option>
 ))}
 </CustomSelect>
 </div>
 <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
 {students.filter((student) => (attendanceData[student.id]?.status || 'Belum Dicatat') === 'Hadir').length} / {students.length} hadir
 </span>
 <button
 type="button"
 onClick={markAllStudentsPresent}
 className="inline-flex items-center gap-1.5 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs bg-emerald-50/80 px-3 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300"
 >
 <CheckSquare className="h-3.5 w-3.5" /> Tandai Semua Hadir
 </button>
 <button
 type="button"
 onClick={handlePrintAttendanceRoster}
 disabled={!students || students.length === 0}
 className="inline-flex items-center gap-1.5 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:opacity-50 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200"
 title="Cetak Presensi Pembelajaran"
 >
 <Printer className="h-3.5 w-3.5 text-slate-500" /> Cetak
 </button>
 <button
 type="button"
 onClick={handleDownloadAttendancePdf}
 disabled={!students || students.length === 0}
 className="inline-flex items-center gap-1.5 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:opacity-50 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200"
 title="Unduh PDF Presensi"
 >
 <Download className="h-3.5 w-3.5 text-slate-500" /> Unduh PDF
 </button>
 </div>
 </div>

 <div className="flex overflow-x-auto border-b border-emerald-200/80 dark:border-emerald-800/60 text-xs font-bold dark:border-emerald-800/60">
 {[['presensi', 'Data Presensi'], ['verifikasi', 'Verifikasi Guru'], ['riwayat', 'Riwayat Sesi'], ['catatan', 'Catatan Siswa']].map(([id, label]) => (
 <button key={id} type="button" onClick={() => setAttendanceCenterTab(id)} className={`shrink-0 border-b-2 px-3 pb-2.5 transition ${attendanceCenterTab === id ? 'border-slate-600 text-emerald-700 dark:text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>{label}</button>
 ))}
 </div>

 {attendanceCenterTab === 'presensi' && <>
 <section aria-labelledby="attendance-method-title">
 <h4 id="attendance-method-title" className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Metode Absensi</h4>
 <div className="grid gap-2 sm:grid-cols-3">
 {[
 { id: 'rollcall', label: 'Roll Call Guru', description: 'Checklist manual oleh guru', icon: UserCheck },
 { id: 'qr', label: 'QR Code Kartu', description: 'Scan QR code kartu siswa', icon: QrCode },
 { id: 'rfid', label: 'RFID Tap', description: 'Tap kartu RFID siswa', icon: Radio },
 ].map((method) => {
 const Icon = method.icon
 const active = selectedMethod === method.id
 return <button key={method.id} type="button" onClick={() => { setSelectedMethod(method.id); setScanInput(''); setLastScannedResult(null); if (method.id !== 'rollcall') setTimeout(() => scanInputRef.current?.focus(), 50) }} className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${active ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/60 ring-1 ring-emerald-500 dark:bg-emerald-950/30' : 'border-emerald-200/80 hover:border-emerald-300 dark:border-emerald-700/80 dark:bg-slate-800'}`}><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700'}`}><Icon className="h-5 w-5" /></span><span><strong className="block text-xs text-slate-900 dark:text-white">{method.label}</strong><span className="text-[10px] text-slate-400">{method.description}</span></span></button>
 })}
 </div>

 {selectedMethod !== 'rollcall' && <div className={`mt-3 space-y-2.5 rounded-xl border p-3.5 ${selectedMethod === 'qr' ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 dark:border-emerald-800/60 dark:bg-emerald-950/30' : 'border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50/50 dark:border-emerald-800/60 dark:bg-sky-950/30'}`}>
 <div className="flex flex-wrap items-center justify-between gap-2">
 <div className="flex items-center gap-2">{selectedMethod === 'qr' ? <QrCode className="h-4 w-4 text-emerald-600" /> : <Wifi className="h-4 w-4 animate-pulse text-sky-600" />}<span className="text-xs font-bold text-slate-900 dark:text-white">{selectedMethod === 'qr' ? 'Pemindai QR Code Kartu Siswa' : 'Pembaca RFID Reader Standby'}</span></div>
 {selectedMethod === 'qr' ? <button type="button" onClick={openQrCamera} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white border border-emerald-200/80 dark:border-emerald-800/60 h-9 text-sm font-medium"><Camera className="h-3.5 w-3.5" /> Live Kamera</button> : <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-900 dark:text-sky-300">● Ready to Tap</span>}
 </div>
 <form onSubmit={handleCardScan} className="flex gap-2"><input ref={scanInputRef} value={scanInput} onChange={(event) => setScanInput(event.target.value)} autoFocus autoComplete="off" placeholder={selectedMethod === 'qr' ? 'Scan QR code via scanner USB atau ketik NISN...' : 'Tap kartu RFID siswa pada reader...'} className="h-9 min-w-0 flex-1 rounded-lg border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-white px-3 text-xs font-semibold outline-none focus:border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white" /><button type="submit" disabled={!scanInput.trim() || scanProcessing} className="min-w-20 rounded-lg bg-emerald-600 px-4 text-xs font-bold text-white disabled:opacity-50 border border-emerald-200/80 dark:border-emerald-800/60 h-9 text-sm font-medium">{scanProcessing ? <RefreshCw className="mx-auto h-3.5 w-3.5 animate-spin" /> : selectedMethod === 'qr' ? 'Absen' : 'Tap RFID'}</button></form>
 {lastScannedResult && <div className={`rounded-lg px-3 py-2 text-xs font-semibold ${lastScannedResult.error ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>{lastScannedResult.error ? lastScannedResult.message : `${lastScannedResult.student?.nama_lengkap || lastScannedResult.student?.full_name} berhasil dicatat.`}</div>}
 </div>}
 </section>

 {/* Filter Periode Presensi: Harian, Mingguan, Bulanan, Semester */}
 <div className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm/80 bg-emerald-50/40 p-3.5 dark:border-emerald-800/60 dark:bg-emerald-950/20">
 <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-emerald-200/80 dark:border-emerald-800/80 dark:border-emerald-800/60">
 <div className="flex items-center gap-2">
 <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
 <Filter className="h-3.5 w-3.5" />
 </span>
 <div>
 <h5 className="text-xs font-bold text-slate-900 dark:text-white">Filter Periode Presensi</h5>
 <p className="text-[10px] text-slate-500 dark:text-slate-400">Pilih rentang waktu evaluasi kehadiran kelas</p>
 </div>
 </div>

 {/* Periode Tab Buttons */}
 <div className="inline-flex rounded-xl bg-white p-1 shadow-xs border border-emerald-200/80 dark:border-emerald-800/80 dark:bg-slate-800 dark:border-emerald-700/80">
 {[
 { id: 'harian', label: 'Harian', icon: CalendarDays },
 { id: 'mingguan', label: 'Mingguan', icon: CalendarRange },
 { id: 'bulanan', label: 'Bulanan', icon: Calendar },
 { id: 'semester', label: 'Semester', icon: Clock },
 ].map((item) => {
 const Icon = item.icon
 const isActive = attendancePeriodFilter === item.id
 return (
 <button
 key={item.id}
 type="button"
 onClick={() => setAttendancePeriodFilter(item.id)}
 className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${isActive
 ? 'bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white shadow-sm'
 : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
 }`}
 >
 <Icon className="h-3.5 w-3.5" />
 {item.label}
 </button>
 )
 })}
 </div>
 </div>

 {/* Sub-Filter Kontrol Sesuai Periode yang Dipilih */}
 <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs">
 {attendancePeriodFilter === 'harian' && (
 <div className="flex flex-wrap items-center gap-2">
 <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilih Tanggal:</label>
 <DatePicker
 value={attendanceDateFilter}
 onChange={(e) => setAttendanceDateFilter(e.target.value)}
 className="w-36"
 inputClassName="h-8 text-xs font-semibold"
 />
 <button
 type="button"
 onClick={() => setAttendanceDateFilter(new Date().toLocaleDateString('en-CA'))}
 className="rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-700 shadow-xs hover:bg-emerald-50 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-emerald-300"
 >
 Hari Ini
 </button>
 <span className="rounded-md bg-emerald-100/70 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
 Presensi Sesi Aktif Tanggal: {attendanceDateFilter}
 </span>
 </div>
 )}

 {attendancePeriodFilter === 'mingguan' && (
 <div className="flex flex-wrap items-center gap-2">
 <HeroUiWorkspaceSelect
 value={attendanceWeekFilter}
 onChange={(val) => setAttendanceWeekFilter(val)}
 options={ATTENDANCE_PEKAN_OPTIONS}
 label="Pekan Efektif"
 placeholder="Pilih Pekan"
 popoverWidth="w-64"
 />
 <span className="rounded-md bg-emerald-100/70 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
 Rekap Kehadiran Mingguan Rombel {selectedClassName}
 </span>
 </div>
 )}

 {attendancePeriodFilter === 'bulanan' && (
 <div className="flex flex-wrap items-center gap-2">
 <HeroUiWorkspaceSelect
 value={attendanceMonthFilter}
 onChange={(val) => setAttendanceMonthFilter(val)}
 options={ATTENDANCE_BULAN_OPTIONS}
 label="Bulan"
 placeholder="Pilih Bulan"
 popoverWidth="w-72"
 />
 <span className="rounded-md bg-emerald-100/70 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
 Presensi Bulanan Lengkap
 </span>
 </div>
 )}

 {attendancePeriodFilter === 'semester' && (
 <div className="flex flex-wrap items-center gap-2">
 <HeroUiWorkspaceSelect
 value={attendanceSemesterFilter}
 onChange={(val) => setAttendanceSemesterFilter(val)}
 options={ATTENDANCE_SEMESTER_OPTIONS}
 label="Semester"
 placeholder="Pilih Semester"
 popoverWidth="w-72"
 />
 <span className="rounded-md bg-emerald-100/70 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
 Agregasi Kehadiran Kumulatif Semester
 </span>
 </div>
 )}
 </div>
 </div>

 {/* HeroUI KBM Session & Journal Input Card */}
 <div className="mb-4 rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm bg-white dark:bg-[#1B2433] p-4 shadow-sm dark:border-emerald-800/60 dark:bg-slate-900/60">
 <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-800/80 pb-2.5">
 <div className="flex items-center gap-2">
 <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
 <BookOpen className="h-3.5 w-3.5" />
 </div>
 <div>
 <h4 className="text-xs font-bold text-slate-900 dark:text-white">Informasi KBM & Jurnal Mengajar</h4>
 <p className="text-[10px] text-slate-500 dark:text-slate-400">Pertemuan, topik bahasan, dan catatan hasil pembelajaran untuk laporan kehadiran guru & siswa</p>
 </div>
 </div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3">
 <div className="md:col-span-2">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pertemuan Ke-</label>
 <input
 type="number"
 min="1"
 max="36"
 value={meetingNumber}
 onChange={(e) => setMeetingNumber(Number(e.target.value) || 1)}
 className="h-9 w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 shadow-xs bg-white px-3 text-xs font-bold text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white"
 />
 </div>
 <div className="md:col-span-4">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Materi / Topik Bahasan</label>
 <input
 type="text"
 value={attendanceTopic}
 onChange={(e) => setAttendanceTopic(e.target.value)}
 placeholder="Contoh: Bab 3 - Operasi Aljabar"
 className="h-9 w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 shadow-xs bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white"
 />
 </div>
 <div className="md:col-span-6">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan Jurnal KBM / Penutup Pelajaran</label>
 <input
 type="text"
 value={attendanceMeetingNotes}
 onChange={(e) => setAttendanceMeetingNotes(e.target.value)}
 placeholder="Ringkasan pemahaman siswa, evaluasi singkat, atau kendala..."
 className="h-9 w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 shadow-xs bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white"
 />
 </div>
 </div>
 </div>

 {/* HeroUI Emerald Datatable Container */}
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm bg-white shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 {/* Toolbar Header */}
 <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-800/80 bg-emerald-500/10 px-4 py-3 sm:px-5">
 <div className="flex items-center gap-2.5">
 <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl !bg-emerald-600 !text-white shadow-md border border-emerald-200/80 dark:border-emerald-800/60">
 <UserCheck className="h-5 w-5" />
 </div>
 <div>
 <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
 Data Presensi Siswa Rombel {selectedClassName}
 </h4>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Total {filteredAttendanceStudents.length} siswa • Menampilkan maksimal {attendancePerPage} data per halaman
 </p>
 </div>
 </div>

 <PageToolbarActions
   onImport={() => {
     setImportTarget('presensi')
     setImportFile(null)
     setImportError('')
     setShowImportModal(true)
   }}
   importLabel="Import Data"
   onExport={() => {
     setShowExportModal(true)
   }}
   exportLabel="Export Data"
   onPrint={() => {
     const target = (paginatedAttendanceStudents && paginatedAttendanceStudents.length > 0 ? paginatedAttendanceStudents[0] : null)
       || (students && students.length > 0 ? students[0] : null)
     handlePrintWeeklyEvaluation(target)
   }}
   printLabel="Cetak Evaluasi Pekanan"
   primaryAction={{
     label: 'Simpan Presensi',
     onClick: handleSaveAttendance,
     icon: Save,
   }}
   showLabel
 >
   <SquircleActionButton
     variant="restore"
     icon={CheckSquare}
     label="Tandai Semua Hadir"
     onClick={markAllStudentsPresent}
     title="Tandai semua siswa hadir"
     showLabel
   />
 </PageToolbarActions>
 </div>

 {/* Filter Bar */}
 <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-800/80 bg-emerald-500/10 px-4 py-2.5 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/40 sm:px-5">
 <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
 {/* Search Bar with Debounce */}
 <div className="relative flex-1 min-w-[180px] max-w-sm">
 <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="search"
 value={attendanceSearch}
 onChange={(e) => setAttendanceSearch(e.target.value)}
 placeholder="Cari nama siswa atau NIS/NISN..."
 className="h-9 w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 shadow-xs bg-white pl-8.5 pr-3 text-xs outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white"
 />
 </div>

 {/* Status Filter */}
 <CustomSelect
 value={attendanceStatusFilter}
 onChange={(e) => setAttendanceStatusFilter(e.target.value)}
 className="h-9 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200"
 >
 <option value="">Semua Status Presensi</option>
 {['Belum Dicatat', 'Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alpha'].map((status) => (
 <option key={status} value={status}>{status}</option>
 ))}
 </CustomSelect>

 {(attendanceSearch || attendanceStatusFilter) && (
 <button
 type="button"
 onClick={() => {
 setAttendanceSearch('')
 setAttendanceStatusFilter('')
 }}
 className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
 title="Reset Filter"
 >
 <X className="h-3.5 w-3.5" />
 Reset
 </button>
 )}
 </div>

 {/* Data per Halaman Terkunci Maksimal 10 Baris */}
 <div className="flex items-center gap-2">
 <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Batas Baris:</span>
 <span className="inline-flex items-center rounded-lg bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-1 text-xs font-black text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300">
 10 data / halaman
 </span>
 </div>
 </div>

 {/* Mobile Card List View (Visible on screens < md) */}
 <div className="block md:hidden divide-y divide-emerald-100/80 p-3 dark:divide-emerald-900/40">
 {paginatedAttendanceStudents.map((student, idx) => {
 const record = attendanceData[student.id] || { status: 'Belum Dicatat' }
 const rowNumber = (attendancePage - 1) * attendancePerPage + idx + 1
 const status = record.status || 'Belum Dicatat'
 const perm = pendingPermissions[String(student.id)]
 const isPending = perm && ['submitted', 'waiting_verification'].includes(perm.status)
 const isApprovingThis = approvingPermissionId !== null && String(approvingPermissionId) === String(perm?.id)

 const statusColorMap = {
 'Belum Dicatat': 'bg-slate-100 border-emerald-300 text-slate-700 dark:bg-slate-800 dark:border-emerald-700/80 dark:text-slate-300',
 Hadir: 'bg-emerald-50 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300',
 Terlambat: 'bg-amber-50 border-emerald-200/80 dark:border-emerald-800/60 text-amber-800 dark:bg-amber-950/60 dark:border-emerald-800/60 dark:text-amber-300',
 Izin: 'bg-sky-50 border-emerald-200/80 dark:border-emerald-800/60 text-sky-800 dark:bg-sky-950/60 dark:border-emerald-800/60 dark:text-sky-300',
 Sakit: 'bg-violet-50 border-emerald-200/80 dark:border-emerald-800/60 text-violet-800 dark:bg-violet-950/60 dark:border-emerald-800/60 dark:text-violet-300',
 Alpha: 'bg-rose-50 border-emerald-200/80 dark:border-emerald-800/60 text-rose-800 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-300',
 }

 return (
 <div
 key={student.id}
 className="rounded-xl border border-emerald-200/80 bg-white p-3.5 mb-2.5 shadow-xs dark:border-emerald-800/60 dark:bg-[#151F2E]"
 >
 <div className="flex items-start justify-between gap-2.5">
 <div className="flex items-center gap-2.5 min-w-0">
 <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
 {rowNumber}
 </span>
 <Avatar size="sm" className="ring-1 ring-emerald-500/30 shrink-0">
 <AvatarFallback className="bg-emerald-100 text-emerald-800 font-bold text-xs dark:bg-emerald-900 dark:text-emerald-200">
 {(student.nama_lengkap || student.full_name || 'S').slice(0, 2).toUpperCase()}
 </AvatarFallback>
 </Avatar>
 <div className="min-w-0">
 <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
 {student.nama_lengkap || student.full_name}
 </p>
 <p className="truncate text-[10px] text-slate-500">
 {student.nis || student.nisn || 'NIS -'}
 </p>
 </div>
 </div>
 <span
 className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusColorMap[status] || statusColorMap['Belum Dicatat']
 }`}
 >
 {status}
 </span>
 </div>

 <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 border-t border-emerald-200/80 pt-2 dark:border-emerald-800/80">
 <span>Waktu: <b className="text-slate-700 dark:text-slate-200 font-mono">{record.time || '-'}</b></span>
 <span>Metode: <b className="text-slate-700 dark:text-slate-200">{record.method || 'Manual'}</b></span>
 </div>

 <div className="mt-2.5 flex items-center justify-end gap-1.5 pt-1">
 {isPending && (
 <button
 type="button"
 disabled={isApprovingThis}
 onClick={() => handleApproveStudentPermission(student, perm)}
 className="inline-flex h-8 items-center justify-center gap-1 rounded-xl bg-amber-500 px-2.5 text-[10px] font-bold text-white shadow-xs hover:bg-amber-600 transition"
 >
 {isApprovingThis ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
 Setujui Izin
 </button>
 )}
 <button
 type="button"
 onClick={() => toggleStudentChecklist(student, status !== 'Hadir')}
 className={`inline-flex h-8 items-center justify-center gap-1 rounded-xl px-3 text-[10px] font-bold transition shadow-xs ${status === 'Hadir'
 ? 'bg-emerald-600 text-white hover:bg-emerald-700'
 : 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300'
 }`}
 >
 <Check className="h-3 w-3" />
 {status === 'Hadir' ? 'Hadir' : 'Set Hadir'}
 </button>
 <button
 type="button"
 onClick={() => handleOpenStudentAttendanceDetail(student, attendancePeriodFilter)}
 className="inline-flex h-8 items-center justify-center gap-1 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs bg-sky-50 px-2.5 text-[10px] font-bold text-sky-700 hover:bg-sky-100 dark:border-emerald-800/60 dark:bg-sky-950/60 dark:text-sky-300"
 >
 <Eye className="h-3 w-3" />
 Detail
 </button>
 <button
 type="button"
 onClick={() => handlePrintWeeklyEvaluation(student)}
 className="inline-flex h-8 items-center justify-center gap-1 rounded-xl border border-emerald-200/80 bg-orange-50 px-2 text-[10px] font-bold text-orange-700 hover:bg-orange-100 dark:border-emerald-800/60 dark:bg-orange-950/60 dark:text-orange-300"
 >
 <Printer className="h-3 w-3" />
 </button>
 </div>
 </div>
 )
 })}
 </div>

 {/* Datatable Body (Desktop / Tablet view >= md) */}
 <div className="hidden md:block overflow-x-auto">
 <table className="w-full min-w-[720px] text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 <th className="px-4 py-3 font-bold w-12 text-center">No.</th>
 <th
 onClick={() => {
 if (attendanceSortField === 'name') {
 setAttendanceSortOrder(attendanceSortOrder === 'asc' ? 'desc' : 'asc')
 } else {
 setAttendanceSortField('name')
 setAttendanceSortOrder('asc')
 }
 }}
 className="px-4 py-3 font-bold cursor-pointer hover:text-emerald-800 dark:hover:text-emerald-300 transition"
 title="Klik untuk mengurutkan Nama Siswa"
 >
 <div className="flex items-center gap-1.5">
 <span>Identitas Siswa</span>
 {attendanceSortField === 'name' ? (
 attendanceSortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <ArrowDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
 ) : (
 <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
 )}
 </div>
 </th>
 <th
 onClick={() => {
 if (attendanceSortField === 'status') {
 setAttendanceSortOrder(attendanceSortOrder === 'asc' ? 'desc' : 'asc')
 } else {
 setAttendanceSortField('status')
 setAttendanceSortOrder('asc')
 }
 }}
 className="px-4 py-3 font-bold cursor-pointer hover:text-emerald-800 dark:hover:text-emerald-300 transition"
 title="Klik untuk mengurutkan Status Presensi"
 >
 <div className="flex items-center gap-1.5">
 <span>Status Presensi</span>
 {attendanceSortField === 'status' ? (
 attendanceSortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <ArrowDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
 ) : (
 <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
 )}
 </div>
 </th>
 <th
 onClick={() => {
 if (attendanceSortField === 'time') {
 setAttendanceSortOrder(attendanceSortOrder === 'asc' ? 'desc' : 'asc')
 } else {
 setAttendanceSortField('time')
 setAttendanceSortOrder('asc')
 }
 }}
 className="px-4 py-3 font-bold cursor-pointer hover:text-emerald-800 dark:hover:text-emerald-300 transition"
 title="Klik untuk mengurutkan Waktu Absen"
 >
 <div className="flex items-center gap-1.5">
 <span>Waktu Absen</span>
 {attendanceSortField === 'time' ? (
 attendanceSortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <ArrowDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
 ) : (
 <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
 )}
 </div>
 </th>
 <th className="px-4 py-3 font-bold">Metode Presensi</th>
 <th className="px-4 py-3 font-bold text-center w-36">Aksi & Detail</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {paginatedAttendanceStudents.map((student, idx) => {
 const record = attendanceData[student.id] || { status: 'Belum Dicatat' }
 const rowNumber = (attendancePage - 1) * attendancePerPage + idx + 1
 const status = record.status || 'Belum Dicatat'

 // Izin Ortu
 const perm = pendingPermissions[String(student.id)]
 const isPending = perm && ['submitted', 'waiting_verification'].includes(perm.status)
 const isApproved = perm && perm.status === 'approved'
 const isApprovingThis = approvingPermissionId !== null && String(approvingPermissionId) === String(perm?.id)

 // Color configuration per status
 const statusColorMap = {
 'Belum Dicatat': 'bg-slate-100 border-emerald-300 text-slate-700 dark:bg-slate-800 dark:border-emerald-700/80 dark:text-slate-300',
 Hadir: 'bg-emerald-50 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300',
 Terlambat: 'bg-amber-50 border-emerald-200/80 dark:border-emerald-800/60 text-amber-800 dark:bg-amber-950/60 dark:border-emerald-800/60 dark:text-amber-300',
 Izin: 'bg-sky-50 border-emerald-200/80 dark:border-emerald-800/60 text-sky-800 dark:bg-sky-950/60 dark:border-emerald-800/60 dark:text-sky-300',
 Sakit: 'bg-violet-50 border-emerald-200/80 dark:border-emerald-800/60 text-violet-800 dark:bg-violet-950/60 dark:border-emerald-800/60 dark:text-violet-300',
 Alpha: 'bg-rose-50 border-emerald-200/80 dark:border-emerald-800/60 text-rose-800 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-300',
 }

 return (
 <tr
 key={student.id}
 className="transition hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20"
 >
 <td className="px-4 py-3 text-center font-bold text-slate-500">
 {rowNumber}
 </td>
 <td className="px-4 py-3">
 <div className="flex items-center gap-2.5">
 <Avatar size="sm" className="ring-1 ring-emerald-500/30">
 <AvatarFallback className="bg-emerald-100 text-emerald-800 font-bold text-xs dark:bg-emerald-900 dark:text-emerald-200">
 {(student.nama_lengkap || student.full_name || 'S').slice(0, 2).toUpperCase()}
 </AvatarFallback>
 </Avatar>
 <div>
 <p className="font-bold text-slate-900 dark:text-white">
 {student.nama_lengkap || student.full_name}
 </p>
 <p className="text-xs text-slate-400">
 NIS: {student.nis || '-'} • NISN: {student.nisn || '-'}
 </p>
 {/* Badge izin ortu */}
 {perm && (isPending || isApproved) && (
 <span className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${isPending
 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
 : 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300'
 }`}>
 {isPending ? '⏳' : '✅'}
 {isPending ? 'Izin Pending' : 'Izin Disetujui'} · {String(perm.type || '').toUpperCase()}
 </span>
 )}
 </div>
 </div>
 </td>
 <td className="px-4 py-3">
 <CustomSelect
 value={status}
 onChange={(e) => markStudentAttendance(student, 'Roll Call Guru', e.target.value)}
 className={`h-8 rounded-lg border px-2 text-xs font-bold outline-none transition focus:ring-1 focus:ring-emerald-500 ${statusColorMap[status] || statusColorMap['Belum Dicatat']
 }`}
 >
 {['Belum Dicatat', 'Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alpha'].map((st) => (
 <option key={st} value={st}>{st}</option>
 ))}
 </CustomSelect>
 </td>
 <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
 <div className="inline-flex items-center gap-1.5">
 <Clock className="h-3 w-3 text-slate-400" />
 <span>{record.check_in_time || '-'}</span>
 </div>
 </td>
 <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
 <span className="inline-flex items-center rounded-md bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
 {record.method || 'Belum dicatat'}
 </span>
 </td>
 <td className="px-4 py-3 text-center">
 <div className="flex flex-wrap items-center justify-center gap-1.5">
 {/* Tombol Setujui Izin Ortu — hanya tampil jika ada izin pending */}
 {isPending && (
 <button
 type="button"
 disabled={isApprovingThis}
 onClick={() => handleApprovePermission(perm.id, student.id, perm.type)}
 className="inline-flex h-8 items-center justify-center gap-1 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs bg-amber-50 px-2.5 text-[10px] font-bold text-amber-800 transition hover:bg-amber-100 disabled:opacity-60 dark:border-emerald-800/60 dark:bg-amber-900/60 dark:text-amber-300 cursor-pointer"
 title={`Setujui izin ${perm.type} orang tua untuk ${student.nama_lengkap || student.full_name}`}
 >
 {isApprovingThis
 ? <svg className="h-3 w-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
 : <Check className="h-3 w-3" />
 }
 Setujui
 </button>
 )}
 <button
 type="button"
 onClick={() => toggleStudentChecklist(student, status !== 'Hadir')}
 className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition ${status === 'Hadir'
 ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:text-emerald-300'
 : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-emerald-950/60 dark:text-emerald-300'
 }`}
 title={status === 'Hadir' ? 'Batalkan (Set Belum Dicatat)' : 'Tandai Hadir Cepat'}
 >
 <Check className="h-3 w-3" />
 {status === 'Hadir' ? 'Hadir' : 'Set Hadir'}
 </button>
 <button
 type="button"
 onClick={() => handleOpenStudentAttendanceDetail(student, attendancePeriodFilter)}
 className="inline-flex h-8 items-center justify-center gap-1 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs bg-sky-50 px-2.5 text-[10px] font-bold text-sky-700 transition hover:bg-sky-100 dark:border-emerald-800/60 dark:bg-sky-950/60 dark:text-sky-300 cursor-pointer"
 title={`Lihat detail data presensi ${student.nama_lengkap || student.full_name}`}
 >
 <Eye className="h-3 w-3" />
 Detail
 </button>
 <button
 type="button"
 onClick={() => handlePrintWeeklyEvaluation(student)}
 className="inline-flex h-8 items-center justify-center gap-1 rounded-xl border border-emerald-200/80 bg-orange-50 px-2 text-[10px] font-bold text-orange-700 transition hover:bg-orange-100 dark:border-emerald-800/60 dark:bg-orange-950/60 dark:text-orange-300 cursor-pointer"
 title={`Cetak Lembar Evaluasi Mingguan ${student.nama_lengkap || student.full_name}`}
 >
 <Printer className="h-3 w-3" />
 Evaluasi
 </button>
 </div>
 </td>
 </tr>
 )
 })}
 </tbody>
 </table>

 {filteredAttendanceStudents.length === 0 && (
 <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
 Tidak ada siswa yang sesuai dengan pencarian atau filter yang dipilih.
 </div>
 )}
 </div>

 {/* Pagination Footer */}
 {filteredAttendanceStudents.length > 0 && (
 <div className="flex flex-wrap items-center justify-between gap-3 border-t border-emerald-200/80 dark:border-emerald-800/80 bg-slate-50/70 px-4 py-3 dark:border-emerald-800/60 dark:bg-slate-900/50 sm:px-5">
 <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
 Menampilkan{' '}
 <strong className="text-emerald-700 dark:text-emerald-400">
 {(attendancePage - 1) * attendancePerPage + 1}
 </strong>
 {' '}-{' '}
 <strong className="text-emerald-700 dark:text-emerald-400">
 {Math.min(attendancePage * attendancePerPage, filteredAttendanceStudents.length)}
 </strong>
 {' '}dari{' '}
 <strong className="text-slate-900 dark:text-white">
 {filteredAttendanceStudents.length}
 </strong>
 {' '}siswa
 </div>

 <div className="flex items-center">
 <Pagination
 currentPage={attendancePage}
 totalPages={totalAttendancePages}
 onPageChange={setAttendancePage}
 sideLayout="full"
 variant="default"
 />
 </div>
 </div>
 )}
 </div>

 {/* Bottom Action */}
 <div className="flex items-center justify-between gap-3 pt-2">
 <div className="text-xs text-slate-500 dark:text-slate-400">
 💡 <em>Tip: Klik tombol "Simpan Presensi" untuk menyinkronkan rekapan ke jurnal mengajar dan laporan absensi wali murid.</em>
 </div>
 <button
 type="button"
 onClick={handleSaveAttendance}
 className="flex h-9 items-center gap-2 rounded-lg bg-emerald-600 dark:bg-slate-100 dark:text-slate-900 dark: px-5 text-xs font-bold shadow-sm transition hover:from-emerald-700 hover:to-teal-800 text-white border border-emerald-200/80 dark:border-emerald-800/60 text-sm font-medium"
 >
 <Save className="h-4 w-4" />
 Simpan Presensi
 </button>
 </div>
 </>}

 {attendanceCenterTab === 'verifikasi' && (
 <div className="space-y-4">
 <div className="flex items-center gap-3.5 rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm bg-emerald-50/70 p-4.5 dark:border-emerald-800/60 dark:bg-emerald-950/40">
 <div className="flex h-9 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
 <CheckCircle2 className="h-6 w-6" />
 </div>
 <div>
 <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Verifikasi Kehadiran oleh Guru Pengajar</h4>
 <p className="text-xs text-slate-600 dark:text-slate-300">
 Guru Pengampu: <strong className="text-emerald-700 dark:text-emerald-400">{teacherName}</strong> • Rombel {selectedClassName} • {getScheduleSubject(getCurrentSchedule() || {})}
 </p>
 </div>
 </div>

 <div className="grid gap-3 sm:grid-cols-5">
 <div className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm bg-white p-4 dark:border-emerald-800/60 dark:bg-slate-900/60">
 <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Total Siswa</p>
 <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{students.length}</p>
 <p className="mt-0.5 text-[10px] text-slate-400">Terdaftar di kelas</p>
 </div>
 <div className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm bg-white p-4 dark:border-emerald-800/60 dark:bg-slate-900/60">
 <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Hadir</p>
 <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
 {students.filter((st) => (attendanceData[st.id]?.status || 'Belum Dicatat') === 'Hadir').length}
 </p>
 <p className="mt-0.5 text-[10px] text-slate-400">Tercatat di kelas</p>
 </div>
 <div className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm bg-white p-4 dark:border-emerald-800/60 dark:bg-slate-900/60">
 <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Izin / Sakit</p>
 <p className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">
 {students.filter((st) => ['Izin', 'Sakit'].includes(attendanceData[st.id]?.status)).length}
 </p>
 <p className="mt-0.5 text-[10px] text-slate-400">Dengan keterangan</p>
 </div>
 <div className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm bg-white p-4 dark:border-emerald-800/60 dark:bg-slate-900/60">
 <p className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">Alpha</p>
 <p className="mt-1 text-2xl font-black text-rose-600 dark:text-rose-400">
 {students.filter((st) => attendanceData[st.id]?.status === 'Alpha').length}
 </p>
 <p className="mt-0.5 text-[10px] text-slate-400">Tanpa keterangan</p>
 </div>
 <div className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm bg-white p-4 dark:border-emerald-800/60 dark:bg-slate-900/60">
 <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Belum Dicatat</p>
 <p className="mt-1 text-2xl font-black text-slate-700 dark:text-slate-300">
 {students.filter((st) => (attendanceData[st.id]?.status || 'Belum Dicatat') === 'Belum Dicatat').length}
 </p>
 <p className="mt-0.5 text-[10px] text-slate-400">Menunggu absensi</p>
 </div>
 </div>

 <div className="flex items-center justify-between rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm bg-slate-50/70 p-3.5 text-xs text-slate-600 dark:border-emerald-800/60 dark:bg-slate-900/40 dark:text-slate-300">
 <span>Setelah presensi disimpan, data disinkronkan otomatis ke buku jurnal harian guru & laporan kurikulum.</span>
 <button
 type="button"
 onClick={handleSaveAttendance}
 className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition border border-emerald-200/80 dark:border-emerald-800/60 h-9 text-sm font-medium"
 >
 <Save className="h-4 w-4" /> Simpan & Finalisasi
 </button>
 </div>
 </div>
 )}

 {attendanceCenterTab === 'riwayat' && renderAttendanceHistorySection(false)}

 {attendanceCenterTab === 'catatan' && (
 <div className="space-y-3">
 <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-2 dark:border-emerald-800/60">
 <h4 className="text-xs font-bold text-slate-800 dark:text-white">Catatan Siswa pada Sesi Ini (Izin, Sakit, atau Catatan Khusus)</h4>
 <span className="text-xs text-slate-400">Total {students.filter((s) => attendanceData[s.id]?.notes).length} catatan</span>
 </div>
 <div className="divide-y divide-emerald-100/80 rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm bg-white dark:divide-emerald-900/40 dark:border-emerald-800/60 dark:bg-slate-900/50">
 {students.map((student) => {
 const record = attendanceData[student.id] || { status: 'Belum Dicatat', notes: '' }
 return (
 <div key={student.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
 <div className="min-w-0 sm:w-1/3">
 <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{student.nama_lengkap}</p>
 <span className="text-[10px] text-slate-400">Status: <strong>{record.status}</strong></span>
 </div>
 <input
 type="text"
 value={record.notes || ''}
 onChange={(e) => {
 const nextNotes = e.target.value
 setAttendanceData((prev) => ({
 ...prev,
 [student.id]: {
 ...(prev[student.id] || { status: 'Belum Dicatat' }),
 notes: nextNotes,
 },
 }))
 }}
 placeholder="Tulis catatan (misal: Sakit flu, Izin keperluan keluarga, dll)..."
 className="h-10 flex-1 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white px-3 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-900 dark:text-slate-100"
 />
 </div>
 )
 })}
 </div>
 </div>
 )}
 </div>
 )}

 {/* TAB 3: MATERI BELAJAR */}
 {activeTab === 'materi' && (
 <section className="space-y-4" aria-labelledby="material-heading">
 {/* ── 4 HERO UI KPI CARDS UNTUK MATERI BELAJAR ── */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <ModernWorkspaceKpiCard
 icon={BookOpen}
 title="Total Materi Belajar"
 value={materialMeta.total || materials.length}
 subtitle={`Rombel: ${selectedClassName || 'Semua'}`}
 tone="emerald"
 badge="Semua Modul"
 active={materialStatusFilter === 'semua'}
 onClick={() => setMaterialStatusFilter('semua')}
 />
 <ModernWorkspaceKpiCard
 icon={CheckCircle2}
 title="Dipublikasikan"
 value={materials.filter((m) => String(m.status).toLowerCase() === 'published').length}
 subtitle="Dapat diakses santri & ortu"
 tone="teal"
 badge="Siap Belajar"
 active={materialStatusFilter === 'published'}
 onClick={() => setMaterialStatusFilter((prev) => (prev === 'published' ? 'semua' : 'published'))}
 />
 <ModernWorkspaceKpiCard
 icon={Clock}
 title="Draft Materi"
 value={materials.filter((m) => String(m.status).toLowerCase() === 'draft').length}
 subtitle="Perlu review & dilengkapi"
 tone="amber"
 badge="Draft Modul"
 active={materialStatusFilter === 'draft'}
 onClick={() => setMaterialStatusFilter((prev) => (prev === 'draft' ? 'semua' : 'draft'))}
 />
 <ModernWorkspaceKpiCard
 icon={Layers}
 title="Mata Pelajaran"
 value={uniqueMapelOptions.length}
 subtitle="Cakupan mapel terintegrasi"
 tone="blue"
 badge="Kurikulum"
 />
 </div>

 <div className="relative z-20 rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm bg-white shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 {/* Toolbar Header */}
 <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-[20px] border-b border-emerald-200/80 dark:border-emerald-800/80 bg-emerald-500/10 px-4 py-3 sm:px-5">
 <div className="flex items-center gap-2.5">
 <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl !bg-emerald-600 !text-white shadow-md border border-emerald-200/80 dark:border-emerald-800/60">
 <BookOpen className="h-5 w-5" />
 </div>
 <div>
 <h3 id="material-heading" className="text-sm font-extrabold text-slate-900 dark:text-white">
 Pusat Konten Pembelajaran & Modul
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Kelola materi untuk rombel {selectedClassName} dari draft hingga publikasi • {filteredMaterials.length} materi
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => openMaterialForm()}
 className="inline-flex items-center gap-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white px-3.5 py-1.5 text-xs font-bold shadow-sm transition hover:from-emerald-700 hover:to-teal-700 cursor-pointer active:scale-95"
 >
 <Plus className="h-3.5 w-3.5" /> Tambah Materi
 </button>
 </div>
 </div>

 {/* Filter Bar */}
 <div className="rounded-b-[20px] bg-emerald-500/10 p-4 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/40 sm:p-5">

 {/* Baris 1: Search + Filter Utama */}
 <div className="mt-1 flex flex-col gap-3 lg:flex-row lg:items-center">
 <label className="relative flex-1">
 <span className="sr-only">Cari materi</span>
 <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="search"
 value={materialSearch}
 onChange={(event) => setMaterialSearch(event.target.value)}
 placeholder="Cari judul, ringkasan, mapel..."
 className="h-9 w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 shadow-xs bg-white pl-10 pr-4 text-xs font-semibold outline-none focus:border-emerald-700/80 focus:ring-3 focus:ring-emerald-700/15 dark:border-emerald-700/80 dark:bg-[#111827] dark:text-white"
 />
 </label>

 <div className="flex flex-wrap items-center gap-2">
 <HeroUiWorkspaceSelect
 id="material-rombel-select"
 value={selectedClass}
 onChange={(val) => {
 setSelectedClass(val)
 setMaterialMapelFilter('all')
 fetchStudentsForClass(val)
 }}
 options={[
 { value: 'all', label: 'Semua Rombel', subtext: 'Seluruh rombel yang diampu' },
 ...classes.map((c) => ({
 value: String(c.id),
 label: `Rombel ${c.nama_kelas || c.name}${c.kode_kelas ? ` · ${c.kode_kelas}` : ''}`,
 })),
 ]}
 icon={Users}
 label="Rombel"
 placeholder="Pilih Rombel"
 popoverWidth="w-64"
 searchable
 />

 <HeroUiWorkspaceSelect
 id="material-status-select"
 value={materialStatusFilter}
 onChange={(val) => setMaterialStatusFilter(val)}
 options={[
 { value: 'semua', label: 'Semua Status' },
 { value: 'published', label: 'Dipublikasikan' },
 { value: 'draft', label: 'Draft' },
 ]}
 icon={Filter}
 label="Status"
 placeholder="Pilih Status"
 popoverWidth="w-52"
 />

 <HeroUiWorkspaceSelect
 id="material-mapel-select"
 value={materialMapelFilter}
 onChange={(val) => setMaterialMapelFilter(val)}
 options={[
 { value: 'all', label: 'Semua Mapel', subtext: 'Seluruh mata pelajaran' },
 ...uniqueMapelOptions.map((subj) => ({
 value: String(subj.id),
 label: subj.name,
 })),
 ]}
 icon={BookOpen}
 label="Mapel"
 placeholder="Pilih Mapel"
 popoverWidth="w-64"
 searchable
 />

 <button
 type="button"
 onClick={fetchMaterials}
 aria-label="Muat ulang materi"
 title="Muat ulang materi"
 className="inline-flex h-9.5 items-center justify-center gap-2 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 focus-visible:ring-3 focus-visible:ring-emerald-700/20 dark:border-emerald-700/80 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer active:scale-95"
 >
 <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
 </button>
 </div>
 </div>

 {/* Baris 2: Badge filter aktif & Ringkasan */}
 <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-200/80 dark:border-emerald-800/80">
 <div className="flex flex-wrap items-center gap-1.5">
 {materialSearch.trim() && (
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
 <Search className="h-3 w-3" /> "{materialSearch.trim()}"
 <button type="button" onClick={() => setMaterialSearch('')} className="ml-0.5 rounded-full hover:text-rose-500">×</button>
 </span>
 )}
 {materialMapelFilter !== 'all' && (
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
 <BookOpen className="h-3 w-3" />
 {uniqueMapelOptions.find((s) => String(s.id) === String(materialMapelFilter))?.name || 'Mapel'}
 <button type="button" onClick={() => setMaterialMapelFilter('all')} className="ml-0.5 rounded-full hover:text-rose-500">×</button>
 </span>
 )}
 {materialStatusFilter !== 'semua' && (
 <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-bold text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
 {materialStatusFilter === 'published' ? '✅ Dipublikasikan' : '📝 Draft'}
 <button type="button" onClick={() => setMaterialStatusFilter('semua')} className="ml-0.5 rounded-full hover:text-rose-500">×</button>
 </span>
 )}
 {(materialSearch.trim() || materialMapelFilter !== 'all' || materialStatusFilter !== 'semua') && (
 <button
 type="button"
 onClick={() => { setMaterialSearch(''); setMaterialMapelFilter('all'); setMaterialStatusFilter('semua') }}
 className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-600 transition hover:bg-rose-100 dark:border-emerald-800/60 dark:bg-rose-950/30 dark:text-rose-400 cursor-pointer"
 >
 <X className="h-3 w-3" /> Reset Filter
 </button>
 )}
 </div>

 {/* Info jumlah hasil */}
 <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
 {loading ? 'Memuat materi…' : `Menampilkan ${filteredMaterials.length} dari ${materialMeta.total || materials.length} materi`}
 </span>
 </div>
 </div>
 </div>

 {materialError ? (
 <div className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm bg-rose-50 p-8 text-center dark:border-emerald-800/60 dark:bg-rose-950/20">
 <AlertTriangle className="mx-auto h-8 w-8 text-rose-500" />
 <h4 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">Materi gagal dimuat</h4>
 <p className="mt-1 text-xs text-slate-500">{materialError}</p>
 <button type="button" onClick={fetchMaterials} className="mt-4 h-9 rounded-lg bg-emerald-600 px-4 text-xs font-bold text-white cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60 text-sm font-medium">
 Coba Lagi
 </button>
 </div>
 ) : loading && materials.length === 0 ? (
 /* ── 4 SKELETON CARDS DENGAN HERO UI STYLE ── */
 <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
 {[1, 2, 3, 4].map((item) => (
 <div
 key={item}
 className="group relative flex min-h-52 flex-col justify-between overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm bg-white p-5 shadow-xs dark:border-emerald-800/60 dark:bg-[#1B2433] animate-pulse"
 >
 <div>
 <div className="flex items-start justify-between gap-3 mb-4">
 <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-100/70 dark:bg-emerald-950/60 shadow-xs" />
 <div className="h-6 w-28 rounded-full bg-slate-200 dark:bg-slate-700/80" />
 </div>
 <div className="h-3 w-1/3 rounded-md bg-emerald-100/60 dark:bg-emerald-950/40 mb-2.5" />
 <div className="h-5 w-3/4 rounded-lg bg-slate-200 dark:bg-slate-700 mb-2" />
 <div className="h-3.5 w-full rounded-md bg-slate-100 dark:bg-slate-800/80 mb-1.5" />
 <div className="h-3.5 w-2/3 rounded-md bg-slate-100 dark:bg-slate-800/80" />
 </div>
 <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-between">
 <div className="h-7 w-32 rounded-xl bg-slate-100 dark:bg-slate-800" />
 <div className="flex gap-1.5">
 <div className="size-7 rounded-xl bg-slate-100 dark:bg-slate-800" />
 <div className="size-7 rounded-xl bg-slate-100 dark:bg-slate-800" />
 </div>
 </div>
 </div>
 ))}
 </div>
 ) : filteredMaterials.length === 0 ? (
 /* ── EMPTY STATE BERGAYA HERO UI ── */
 <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-emerald-200/80 dark:border-emerald-800/60 bg-white p-10 text-center dark:bg-[#1B2433] shadow-sm">
 <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
 <BookOpen className="h-7 w-7 text-white" />
 </div>
 <h4 className="mt-4 text-sm font-black text-slate-900 dark:text-white">
 {materials.length ? 'Materi tidak ditemukan' : 'Belum ada materi belajar'}
 </h4>
 <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
 {materials.length ? 'Ubah kata kunci atau filter status untuk melihat materi lain.' : `Mulai susun konten pembelajaran pertama untuk rombel ${selectedClassName || 'ini'}.`}
 </p>
 {!materials.length && (
 <button
 type="button"
 onClick={() => openMaterialForm()}
 className="mt-5 inline-flex h-9 items-center gap-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white px-5 text-xs font-bold shadow-sm transition hover:from-emerald-700 hover:to-teal-700 cursor-pointer active:scale-95"
 >
 <Plus className="h-4 w-4" /> Buat Materi Pertama
 </button>
 )}
 </div>
 ) : (
 <>
 <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
 {filteredMaterials.map((mat) => {
 const isPublished = String(mat.status).toLowerCase() === 'published'
 return (
 <article
 key={mat.id}
 className="group relative flex min-h-52 flex-col justify-between overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:shadow-xl dark:border-emerald-800/60 dark:bg-[#1B2433]"
 >
 {/* Top Accent Gradient Stripe */}

 <div className="flex flex-1 flex-col p-5">
 <div className="flex items-start justify-between gap-3">
 <div className="flex h-9 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-md shadow-xs">
 <BookOpen className="h-5 w-5" />
 </div>
 <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${isPublished ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300' : 'border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50 text-sky-800 dark:border-emerald-800/60 dark:bg-sky-950/60 dark:text-sky-300'}`}>
 <span className={`h-1.5 w-1.5 rounded-full ${isPublished ? 'bg-emerald-500 animate-pulse' : 'bg-sky-500'}`} />
 {isPublished ? 'Dipublikasikan' : 'Draft'}
 </span>
 </div>

 <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
 <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
 {mat.subject?.name || mat.subject?.nama_mapel || 'Materi Pembelajaran'}
 </p>
 <div className="flex items-center gap-1.5">
 {(mat.tanggal_publish || mat.tanggal || mat.created_at) && (
 <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
 <Calendar className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
 {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(mat.tanggal_publish || mat.tanggal || mat.created_at))}
 </span>
 )}
 <span className="inline-flex items-center rounded-md bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:bg-slate-800 dark:text-slate-200">
 Pekan {String(mat.urutan || calculatePekanFromDate(mat.tanggal_publish || mat.tanggal || mat.created_at).pekan).padStart(2, '0')}
 </span>
 </div>
 </div>

 <h4 className="mt-1.5 line-clamp-2 text-sm font-black text-slate-900 dark:text-white">{mat.judul}</h4>
 <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{mat.ringkasan || 'Belum ada ringkasan untuk materi ini.'}</p>

 {(mat.file || mat.video || mat.link) && (
 <div className="mt-3 flex flex-wrap items-center gap-1.5">
 {mat.file && (
 <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200/80 dark:border-emerald-800/60 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:border-emerald-800/60 dark:bg-blue-950/40 dark:text-blue-300">
 <FileText className="h-3 w-3" /> PDF Modul
 </span>
 )}
 {mat.video && (
 <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:border-emerald-800/60 dark:bg-rose-950/40 dark:text-rose-300">
 <Video className="h-3 w-3" /> Video
 </span>
 )}
 {mat.link && (
 <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:border-emerald-800/60 dark:bg-amber-950/40 dark:text-amber-300">
 <ExternalLink className="h-3 w-3" /> Link
 </span>
 )}
 </div>
 )}

 <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-emerald-200/80 pt-3 dark:border-emerald-800/80">
 <div className="flex flex-wrap items-center gap-1.5">
 <button
 type="button"
 onClick={() => openMaterialDetail(mat)}
 title="Lihat Data Materi"
 className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 cursor-pointer"
 >
 <Eye className="h-3.5 w-3.5" />
 <span>Lihat Data</span>
 </button>
 <button
 type="button"
 onClick={() => openMaterialForm(mat)}
 title="Edit Data Materi"
 className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/50 cursor-pointer"
 >
 <Edit3 className="h-3.5 w-3.5" />
 <span>Edit Data</span>
 </button>
 <button
 type="button"
 onClick={() => handleCreateTaskFromMaterial(mat)}
 title="Buat Tugas Berdasarkan Materi Ini"
 className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 transition hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/50 cursor-pointer"
 >
 <FileText className="h-3.5 w-3.5" />
 <span>+ Buat Tugas</span>
 </button>
 </div>

 <div className="flex items-center gap-1">
 <button
 type="button"
 onClick={() => printMaterial(mat)}
 title="Cetak Materi"
 aria-label="Cetak Materi"
 className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-slate-700 cursor-pointer"
 >
 <Printer className="h-3.5 w-3.5" />
 </button>
 <button
 type="button"
 onClick={() => printMaterial(mat, true)}
 title="Export PDF"
 aria-label="Export PDF"
 className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-900/50 cursor-pointer"
 >
 <FileText className="h-3.5 w-3.5" />
 </button>
 <button
 type="button"
 onClick={() => confirmDeleteModal('materi', mat.id, mat.judul)}
 title="Hapus Data Materi"
 aria-label="Hapus Data Materi"
 className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/50 cursor-pointer"
 >
 <Trash2 className="h-3.5 w-3.5" />
 </button>
 </div>
 </div>
 </div>
 </article>
 )
 })}
 </div>
 {materialMeta.last_page > 1 && (
 <div className="flex flex-col items-center justify-between gap-3 rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm bg-white px-4 py-3 sm:flex-row dark:border-emerald-700/80 dark:bg-[#1B2433]">
 <p className="text-xs text-slate-500">Menampilkan {materialMeta.from || 0}–{materialMeta.to || 0} dari {materialMeta.total} materi.</p>
 <div className="flex items-center gap-1.5">
 <button
 type="button"
 disabled={materialPage <= 1 || loading}
 onClick={() => setMaterialPage((page) => Math.max(1, page - 1))}
 title="Halaman Sebelumnya"
 aria-label="Halaman Sebelumnya"
 className="flex size-8.5 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all duration-150 active:scale-95 disabled:bg-emerald-600/30 disabled:text-white/40 disabled:pointer-events-none dark:bg-emerald-600 dark:hover:bg-emerald-500 cursor-pointer"
 >
 <ChevronLeft className="size-4 shrink-0 text-emerald-600" />
 </button>
 <span className="px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-300">
 Halaman {materialMeta.current_page} / {materialMeta.last_page}
 </span>
 <button
 type="button"
 disabled={materialPage >= materialMeta.last_page || loading}
 onClick={() => setMaterialPage((page) => Math.min(materialMeta.last_page, page + 1))}
 title="Halaman Berikutnya"
 aria-label="Halaman Berikutnya"
 className="flex size-8.5 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all duration-150 active:scale-95 disabled:bg-emerald-600/30 disabled:text-white/40 disabled:pointer-events-none dark:bg-emerald-600 dark:hover:bg-emerald-500 cursor-pointer"
 >
 <ChevronRight className="size-4 shrink-0 text-emerald-600" />
 </button>
 </div>
 </div>
 )}
 </>
 )}
 </section>
 )}

 {/* TAB 4: PENUGASAN */}
 {activeTab === 'penugasan' && (
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm bg-white shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 {/* Toolbar Header */}
 <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-800/80 bg-emerald-500/10 px-4 py-3 sm:px-5">
 <div className="flex items-center gap-2.5">
 <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl !bg-emerald-600 !text-white shadow-md border border-emerald-200/80 dark:border-emerald-800/60">
 <FileText className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
 Daftar Penugasan & Evaluasi
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 {selectedClass === 'all'
 ? `Menampilkan ${filteredAssignments.length} penugasan dari seluruh rombel`
 : `Penugasan untuk ${selectedClassName.startsWith('Kelas') ? selectedClassName : ('Kelas ' + selectedClassName)} • Total ${filteredAssignments.length} tugas`}
 </p>
 </div>
 </div>

 <div className="flex flex-wrap items-center gap-2">
 <button
 type="button"
 onClick={() => {
 printCleanTable({
 title: 'Rekapitulasi Penugasan & Evaluasi Siswa',
 subtitle: `Kelas: ${selectedClassName} | Total: ${filteredAssignments.length} Tugas`,
 headers: ['No', 'Judul Tugas', 'Mata Pelajaran', 'Batas Waktu', 'Bobot', 'Pengumpulan'],
 rows: filteredAssignments.map((t, idx) => [
 idx + 1,
 t.judul || t.title || '-',
 t.subject?.nama_mapel || t.subject?.name || '-',
 t.deadline || t.due_date || '-',
 `${t.bobot || 100} Poin`,
 `${t.submissions_count || t.total_pengumpulan || 0} Siswa`,
 ]),
 user,
 unit: teacherProfile?.unit || user?.employee?.unit || user?.unit,
 })
 addToast('info', 'Dokumen Siap Dicetak', 'Pratinjau cetak daftar penugasan siswa berhasil dibuka.')
 }}
 className="inline-flex items-center gap-1.5 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs bg-emerald-50/80 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300 cursor-pointer shadow-xs active:scale-95"
 title="Cetak daftar penugasan & evaluasi siswa"
 >
 <Printer className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Cetak Tugas
 </button>
 <button
 type="button"
 onClick={handleOpenCreateQuiz}
 className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-[#1B2433] px-3.5 py-1.5 text-xs font-bold shadow-sm transition hover:from-violet-700 hover:to-indigo-700 cursor-pointer active:scale-95 border border-emerald-200/80 dark:border-emerald-800/60"
 title="Buat kuis interaktif baru dengan format soal ujian CBT"
 >
 <Zap className="h-3.5 w-3.5" /> Buat Kuis CBT
 </button>
 <button
 type="button"
 onClick={() => {
 setEditingId(null)
 const pool = schedules.length > 0 ? schedules : allTeacherSchedules
 const activeClassId = getCurrentClassId()
 const matchSch = pool.find((s) => String(s.class_id || s.kelas_id || s.kelas?.id || s.class?.id) === String(activeClassId))
 setTugasForm({
 judul: '',
 subject_id: matchSch?.subject_id || matchSch?.subject?.id || getCurrentSubjectId(),
 class_id: activeClassId,
 materi_id: '',
 materi_ids: [],
 instruksi: '',
 deskripsi: '',
 tipe_tugas: 'both',
 jenis_tugas: 'tugas',
 jenis_soal: 'essay',
 deadline: '',
 bobot: 100,
 durasi_menit: 30,
 nilai_kkm: 75,
 file_lampiran: null,
 file_lampiran_preview: null,
 existing_file_url: null,
 })
 if (materials.length === 0) fetchMaterials()
 setModalType('tugas')
 setShowModal(true)
 }}
 className="inline-flex items-center gap-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white px-3.5 py-1.5 text-xs font-bold shadow-sm transition hover:from-emerald-700 hover:to-teal-700 cursor-pointer active:scale-95"
 >
 <Plus className="h-3.5 w-3.5" /> Buat Tugas Baru
 </button>
 </div>
 </div>

 {/* Filter Bar */}
 <div className="border-b border-emerald-200/80 dark:border-emerald-800/80 bg-emerald-500/10 px-4 py-2.5 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/40 sm:px-5">
 <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto]">
 {/* Search */}
 <label className="relative min-w-[200px]">
 <span className="sr-only">Cari penugasan</span>
 <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="search"
 value={assignmentSearch}
 onChange={(e) => setAssignmentSearch(e.target.value)}
 placeholder="Cari judul tugas, instruksi, mapel..."
 className="h-9 w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 shadow-xs bg-white pl-8.5 pr-3 text-xs outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white"
 />
 </label>

 {/* Filter Rombel Kelas */}
 <CustomSelect
 value={selectedClass}
 onChange={(e) => {
 const val = e.target.value
 setSelectedClass(val)
 fetchStudentsForClass(val)
 }}
 className="h-9 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200"
 >
 {classes.map((c) => (
 <option key={c.id} value={c.id}>
 Rombel {c.nama_kelas || c.name}{c.kode_kelas ? ` · ${c.kode_kelas}` : ''}
 </option>
 ))}
 <option value="all">Semua Rombel</option>
 </CustomSelect>

 {/* Filter Format & Tipe Soal */}
 <CustomSelect
 value={assignmentJenisFilter}
 onChange={(e) => setAssignmentJenisFilter(e.target.value)}
 className="h-9 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200"
 >
 <option value="all">Semua Format & Tipe</option>
 <option value="quiz">⚡ Kuis Interaktif CBT</option>
 <option value="tugas">📄 Tugas / PR Biasa</option>
 <option value="objektif">🔘 Pilihan Ganda (PG)</option>
 <option value="essay">📝 Essay</option>
 <option value="campuran">🔀 Campuran</option>
 </CustomSelect>

 {/* Filter Status Deadline */}
 <CustomSelect
 value={assignmentStatusFilter}
 onChange={(e) => setAssignmentStatusFilter(e.target.value)}
 className="h-9 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200"
 >
 <option value="all">Semua Deadline</option>
 <option value="active">🟢 Deadline Aktif</option>
 <option value="past">🔴 Terlewat Deadline</option>
 </CustomSelect>

 {/* Refresh */}
 <button
 type="button"
 onClick={fetchAssignments}
 aria-label="Muat ulang penugasan"
 title="Muat ulang penugasan"
 className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-emerald-700/20 dark:border-emerald-700/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-slate-700"
 >
 <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
 <span className="hidden sm:inline">Refresh</span>
 </button>
 </div>
 </div>

 {/* Assignment Cards List */}
 <div className="p-4 sm:p-5 space-y-3">
 {filteredAssignments.length === 0 ? (
 <div className="text-center py-12 text-slate-400">
 <CheckSquare className="w-12 h-9 mx-auto mb-2 opacity-30 text-[#059669]" />
 <p className="font-semibold text-xs text-slate-600 dark:text-slate-300">Belum ada penugasan untuk filter ini</p>
 <p className="text-xs mt-0.5">Klik "Buat Tugas Baru" untuk menambahkan penugasan siswa.</p>
 </div>
 ) : (
 filteredAssignments.map((asg) => {
 const kelasName = asg.kelas?.nama_kelas || asg.kelas?.name || classes.find((c) => c.id === (asg.class_id || asg.kelas_id))?.nama_kelas || classes.find((c) => c.id === (asg.class_id || asg.kelas_id))?.name
 const subjectName = asg.subject?.name || asg.subject?.nama_pelajaran
 return (
 <div key={asg.id} className="p-4 rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm bg-emerald-500/10 space-y-2.5 hover:shadow-md transition">
 <div className="flex justify-between items-start flex-wrap gap-1.5">
 <div className="flex flex-wrap items-center gap-1.5">
 {kelasName && (
 <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold rounded-full">
 🏫 {kelasName}
 </span>
 )}
 {subjectName && (
 <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold rounded-full">
 📚 {subjectName}
 </span>
 )}
 {asg.jenis_tugas === 'quiz' ? (
 <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full uppercase bg-white dark:bg-[#1B2433] shadow-xs flex items-center gap-1">
 <Zap className="w-2.5 h-2.5" /> Kuis CBT
 </span>
 ) : (
 <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
 📄 Tugas PR
 </span>
 )}
 <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full uppercase">
 Deadline: {asg.deadline ? (asg.deadline.includes('T') ? asg.deadline.split('T')[0] : asg.deadline) : 'Tanpa Tenggat'}
 </span>
 {asg.durasi_menit && asg.jenis_tugas === 'quiz' && (
 <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 text-[10px] font-bold rounded-full">
 ⏱️ {asg.durasi_menit} Menit
 </span>
 )}
 {(() => {
 const jenis = asg.jenis_tugas || asg.jenis_soal || 'essay'
 const map = {
 objektif: { label: '🔘 Objektif', cls: 'bg-blue-100 text-blue-800' },
 essay: { label: '📝 Essay', cls: 'bg-violet-100 text-violet-800' },
 campuran: { label: '🔀 Campuran', cls: 'bg-orange-100 text-orange-800' },
 }
 const { label, cls } = map[jenis] ?? map.essay
 return (
 <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${cls}`}>
 {label}
 </span>
 )
 })()}
 {(() => {
 const asgMaterials = Array.isArray(asg.materials) && asg.materials.length > 0
 ? asg.materials
 : (Array.isArray(asg.materi_ids) && asg.materi_ids.length > 0
 ? asg.materi_ids.map((id) => materials.find((m) => String(m.id) === String(id))).filter(Boolean)
 : (asg.materi ? [asg.materi] : (asg.materi_id ? [materials.find((m) => String(m.id) === String(asg.materi_id))].filter(Boolean) : [])))

 if (!asgMaterials || asgMaterials.length === 0) return null

 return asgMaterials.map((mat, mIdx) => (
 <button
 key={mat.id || mIdx}
 type="button"
 onClick={() => openMaterialDetail(mat)}
 className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-[10px] font-bold rounded-full hover:bg-emerald-200 transition inline-flex items-center gap-1 cursor-pointer"
 title={`Klik untuk pratinjau materi: ${mat.judul}`}
 >
 📖 {mat.judul}
 </button>
 ))
 })()}
 </div>
 <div className="flex items-center gap-2">
 {asg.file_lampiran_url && (
 <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-bold rounded-full flex items-center gap-1">
 <Paperclip className="w-3 h-3" /> Berkas
 </span>
 )}
 <span className="text-xs text-slate-400 font-mono">Bobot: {asg.bobot || 100}</span>
 </div>
 </div>
 <h4 className="font-bold text-sm text-slate-900 dark:text-white">{asg.judul || asg.judul_tugas}</h4>
 <p className="text-xs text-slate-500 line-clamp-2">{asg.instruksi || 'Petunjuk pengerjaan tugas.'}</p>
 {(() => {
 try {
 const raw = asg.soal_json || asg.deskripsi || ''
 if (raw && raw.trim().startsWith('[')) {
 const soals = JSON.parse(raw)
 if (Array.isArray(soals) && soals.length > 0) {
 const counts = soals.reduce((acc, s) => { acc[s.tipe] = (acc[s.tipe] || 0) + 1; return acc }, {})
 const totalPoin = soals.reduce((acc, s) => acc + (parseFloat(s.poin) || 0), 0)
 return (
 <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-1.5">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">📋 {soals.length} Butir Soal</span>
 <span className="text-[10px] font-semibold text-slate-500">Total: {totalPoin.toFixed(1)} poin</span>
 </div>
 <div className="flex flex-wrap gap-1">
 {Object.entries(counts).map(([tipe, n]) => {
 const cls = { pg: 'bg-emerald-100 text-emerald-800', esai: 'bg-violet-100 text-violet-800', benar_salah: 'bg-blue-100 text-blue-800', menjodohkan: 'bg-amber-100 text-amber-800' }[tipe] || 'bg-slate-100 text-slate-700'
 const lbl = { pg: 'PG', esai: 'Essay', benar_salah: 'B/S', menjodohkan: 'Jodoh' }[tipe] || tipe
 return (
 <span key={tipe} className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${cls}`}>
 {lbl}: {n}
 </span>
 )
 })}
 </div>
 </div>
 )
 }
 }
 } catch { }
 return asg.deskripsi ? (
 <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 line-clamp-2">
 {asg.deskripsi}
 </div>
 ) : null
 })()}
 {asg.file_lampiran_url && (
 <a
 href={asg.file_lampiran_url}
 target="_blank"
 rel="noreferrer"
 className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline pt-1"
 >
 <Download className="w-3.5 h-3.5" /> Buka Lembar Berkas Soal
 </a>
 )}
 <div className="flex items-center justify-between pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60">
 <button
 type="button"
 onClick={() => openSubmissionsModal(asg)}
 className="text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
 title="Klik untuk periksa jawaban dan nilai siswa"
 >
 <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
 <span>{asg.pengumpulan_tugas?.length || 0} Siswa Mengumpulkan</span>
 <span className="text-[10px] text-emerald-600 dark:text-emerald-300 font-semibold underline ml-1">Periksa & Nilai →</span>
 </button>
 <div className="flex items-center gap-2">
 {(asg.jenis_tugas === 'quiz' || asg.soal_json || (asg.deskripsi && asg.deskripsi.trim().startsWith('['))) && (
 <button
 type="button"
 onClick={() => handleOpenCbtPreview(asg)}
 className="px-2.5 py-1 text-violet-700 bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/40 dark:text-violet-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors border border-emerald-200/80 dark:border-emerald-800/60 cursor-pointer shadow-xs active:scale-95"
 title="Pratinjau interaktif pengerjaan kuis siswa (Style CBT)"
 >
 <Play className="w-3 h-3 text-violet-600 dark:text-violet-400 fill-violet-600" /> Pratinjau Kuis CBT
 </button>
 )}
 <button
 type="button"
 onClick={() => handleEditTugas(asg)}
 className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
 >
 <Edit3 className="w-3.5 h-3.5" /> Edit
 </button>
 <button
 type="button"
 onClick={() => confirmDeleteModal('tugas', asg.id, asg.judul || asg.judul_tugas)}
 className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
 >
 <Trash2 className="w-3.5 h-3.5" /> Hapus
 </button>
 </div>
 </div>
 </div>
 )
 })
 )}
 </div>
 </div>
 )}

 {/* TAB 5: PENILAIAN */}
 {activeTab === 'penilaian' && (
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] shadow-sm">
 {/* Toolbar Header */}
 <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-500/10 border-b border-emerald-200/80 dark:border-emerald-800/60 px-5 py-4">
 <div className="flex items-center gap-3">
 <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
 <GraduationCap className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
 Form Input Nilai Rapor & Harian
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Rekapitulasi Nilai Rombel {selectedClassName} • Menampilkan maksimal {penilaianPerPage} siswa per halaman
 </p>
 </div>
 </div>

 <PageToolbarActions
   onImport={() => {
     setImportTarget('penilaian')
     setImportFile(null)
     setImportError('')
     setShowImportModal(true)
   }}
   importLabel="Import Nilai"
   onExport={() => setShowExportModal(true)}
   exportLabel="Export Nilai"
   onPrint={() => {
     printCleanTable({
       title: 'Buku Nilai Harian & Rapor Siswa',
       subtitle: `Rombel: ${selectedClassName} | Semester Ganjil 2026/2027`,
       headers: ['No', 'NIS', 'Nama Siswa', 'Nilai Tugas (20%)', 'Nilai Kuis (20%)', 'Nilai UTS (30%)', 'Nilai UAS (30%)', 'Nilai Akhir', 'Catatan Guru'],
       rows: students.map((st, idx) => {
         const row = gradesData[st.id] || {}
         const tugas = row.nilai_tugas ?? '-'
         const kuis = row.nilai_kuis ?? '-'
         const uts = row.nilai_uts ?? '-'
         const uas = row.nilai_uas ?? '-'
         const akhir = (row.nilai_tugas != null || row.nilai_kuis != null || row.nilai_uts != null || row.nilai_uas != null)
           ? Math.round(Number(row.nilai_tugas || 0) * 0.2 + Number(row.nilai_kuis || 0) * 0.2 + Number(row.nilai_uts || 0) * 0.3 + Number(row.nilai_uas || 0) * 0.3)
           : '-'
         const catatan = row.catatan || row.notes || '-'
         return [idx + 1, st.nis || st.student_id || '-', st.name || st.full_name || '-', tugas, kuis, uts, uas, akhir, catatan]
       }),
       user,
       unit: teacherProfile?.unit || user?.employee?.unit || user?.unit,
     })
     addToast('info', 'Dokumen Siap Dicetak', 'Pratinjau cetak buku nilai siswa berhasil dibuka.')
   }}
   printLabel="Cetak Nilai"
   primaryAction={{
     label: 'Simpan Nilai',
     onClick: handleSaveGradesBulk,
     icon: Save,
   }}
   showLabel
 >
   <SquircleActionButton
     variant="sync"
     icon={Sparkles}
     label="Tarik Nilai LMS"
     onClick={handleSyncGradesFromAssignments}
     title="Tarik rata-rata nilai tugas & kuis yang dikumpulkan siswa di LMS"
     showLabel
   />
 </PageToolbarActions>
 </div>

 {/* Subbar Info & Filter */}
 <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/60 dark:bg-slate-900/40 px-5 py-2.5">
 <div className="flex items-center gap-2">
 <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Batas Baris:</span>
 <span className="inline-flex items-center rounded-lg bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-1 text-xs font-black text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
 {penilaianPerPage} data / halaman
 </span>
 </div>
 <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
 Total <strong className="text-emerald-700 dark:text-emerald-300">{students.length}</strong> siswa terdaftar
 </div>
 </div>

 {/* Table Container */}
 <div className="overflow-x-auto">
 <table className="w-full min-w-[760px] text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 <th className="px-4 py-3 font-bold w-12 text-center">No.</th>
 <th
 onClick={() => {
 if (gradeSortField === 'name') {
 setGradeSortOrder(gradeSortOrder === 'asc' ? 'desc' : 'asc')
 } else {
 setGradeSortField('name')
 setGradeSortOrder('asc')
 }
 }}
 className="px-4 py-3 font-bold cursor-pointer hover:text-emerald-800 dark:hover:text-emerald-300 transition"
 title="Klik untuk mengurutkan Nama Siswa"
 >
 <div className="flex items-center gap-1.5">
 <span>Identitas Siswa</span>
 {gradeSortField === 'name' ? (
 gradeSortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <ArrowDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
 ) : (
 <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
 )}
 </div>
 </th>
 <th
 onClick={() => {
 if (gradeSortField === 'tugas') {
 setGradeSortOrder(gradeSortOrder === 'asc' ? 'desc' : 'asc')
 } else {
 setGradeSortField('tugas')
 setGradeSortOrder('desc')
 }
 }}
 className="px-3 py-3 font-bold text-center w-28 cursor-pointer hover:text-emerald-800 dark:hover:text-emerald-300 transition"
 title="Klik untuk mengurutkan Nilai Tugas"
 >
 <div className="flex items-center justify-center gap-1">
 <span>Tugas (20%)</span>
 {gradeSortField === 'tugas' ? (
 gradeSortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
 ) : (
 <ArrowUpDown className="w-3 h-3 opacity-40" />
 )}
 </div>
 </th>
 <th
 onClick={() => {
 if (gradeSortField === 'kuis') {
 setGradeSortOrder(gradeSortOrder === 'asc' ? 'desc' : 'asc')
 } else {
 setGradeSortField('kuis')
 setGradeSortOrder('desc')
 }
 }}
 className="px-3 py-3 font-bold text-center w-28 text-violet-800 dark:text-violet-300 cursor-pointer hover:text-violet-950 transition"
 title="Klik untuk mengurutkan Nilai Kuis"
 >
 <div className="flex items-center justify-center gap-1">
 <span>Kuis (20%)</span>
 {gradeSortField === 'kuis' ? (
 gradeSortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-violet-600" /> : <ArrowDown className="w-3 h-3 text-violet-600" />
 ) : (
 <ArrowUpDown className="w-3 h-3 opacity-40" />
 )}
 </div>
 </th>
 <th
 onClick={() => {
 if (gradeSortField === 'uts') {
 setGradeSortOrder(gradeSortOrder === 'asc' ? 'desc' : 'asc')
 } else {
 setGradeSortField('uts')
 setGradeSortOrder('desc')
 }
 }}
 className="px-3 py-3 font-bold text-center w-28 cursor-pointer hover:text-emerald-800 dark:hover:text-emerald-300 transition"
 title="Klik untuk mengurutkan Nilai UTS"
 >
 <div className="flex items-center justify-center gap-1">
 <span>UTS (30%)</span>
 {gradeSortField === 'uts' ? (
 gradeSortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
 ) : (
 <ArrowUpDown className="w-3 h-3 opacity-40" />
 )}
 </div>
 </th>
 <th
 onClick={() => {
 if (gradeSortField === 'uas') {
 setGradeSortOrder(gradeSortOrder === 'asc' ? 'desc' : 'asc')
 } else {
 setGradeSortField('uas')
 setGradeSortOrder('desc')
 }
 }}
 className="px-3 py-3 font-bold text-center w-28 cursor-pointer hover:text-emerald-800 dark:hover:text-emerald-300 transition"
 title="Klik untuk mengurutkan Nilai UAS"
 >
 <div className="flex items-center justify-center gap-1">
 <span>UAS (30%)</span>
 {gradeSortField === 'uas' ? (
 gradeSortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
 ) : (
 <ArrowUpDown className="w-3 h-3 opacity-40" />
 )}
 </div>
 </th>
 <th
 onClick={() => {
 if (gradeSortField === 'akhir') {
 setGradeSortOrder(gradeSortOrder === 'asc' ? 'desc' : 'asc')
 } else {
 setGradeSortField('akhir')
 setGradeSortOrder('desc')
 }
 }}
 className="px-3 py-3 font-bold text-center w-28 cursor-pointer hover:text-emerald-800 dark:hover:text-emerald-300 transition"
 title="Klik untuk mengurutkan Nilai Akhir"
 >
 <div className="flex items-center justify-center gap-1">
 <span>Nilai Akhir</span>
 {gradeSortField === 'akhir' ? (
 gradeSortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
 ) : (
 <ArrowUpDown className="w-3 h-3 opacity-40" />
 )}
 </div>
 </th>
 <th
 className="px-3 py-3 font-bold text-left min-w-[220px]"
 title="Catatan evaluasi guru / feedback rapor siswa"
 >
 <div className="flex items-center gap-1.5">
 <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
 <span>Catatan Penilaian Guru</span>
 </div>
 </th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {sortedGradeStudents
 .slice((penilaianPage - 1) * penilaianPerPage, penilaianPage * penilaianPerPage)
 .map((st, idx) => {
 const absoluteIndex = (penilaianPage - 1) * penilaianPerPage + idx + 1
 const grade = gradesData[st.id] || { nilai_tugas: '', nilai_kuis: '', nilai_uts: '', nilai_uas: '', nilai_akhir: '', catatan: '' }
 return (
 <tr key={st.id} className="hover:bg-emerald-50/40 transition-colors dark:hover:bg-emerald-950/30">
 <td className="p-3 text-slate-400 font-mono text-xs">{absoluteIndex}</td>
 <td className="p-3 font-bold text-slate-900 dark:text-white">
 {st.nama_lengkap}
 <span className="block text-[10px] font-normal text-slate-400">NIS: {st.nis || '-'}</span>
 </td>
 <td className="p-3 text-center">
 <input
 type="number"
 value={grade.nilai_tugas ?? ''}
 onChange={(e) => {
 const val = e.target.value === '' ? '' : Number(e.target.value)
 const newAkhir = calcAkhir(val, grade.nilai_kuis, grade.nilai_uts, grade.nilai_uas)
 setGradesData({ ...gradesData, [st.id]: { ...grade, nilai_tugas: val, nilai_akhir: newAkhir } })
 }}
 className="w-16 h-9 px-2 text-center border-2 border-[#b6f6d9] dark:border-emerald-700/80 rounded-xl bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
 placeholder="-"
 />
 </td>
 <td className="p-3 text-center bg-violet-50/30 dark:bg-violet-950/10">
 <input
 type="number"
 value={grade.nilai_kuis ?? ''}
 onChange={(e) => {
 const val = e.target.value === '' ? '' : Number(e.target.value)
 const newAkhir = calcAkhir(grade.nilai_tugas, val, grade.nilai_uts, grade.nilai_uas)
 setGradesData({ ...gradesData, [st.id]: { ...grade, nilai_kuis: val, nilai_akhir: newAkhir } })
 }}
 className="w-16 h-9 px-2 text-center border-2 border-[#b6f6d9] dark:border-emerald-700/80 rounded-xl bg-violet-50/50 dark:bg-slate-900 text-xs font-extrabold text-violet-900 dark:text-violet-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
 placeholder="-"
 />
 </td>
 <td className="p-3 text-center">
 <input
 type="number"
 value={grade.nilai_uts ?? ''}
 onChange={(e) => {
 const val = e.target.value === '' ? '' : Number(e.target.value)
 const newAkhir = calcAkhir(grade.nilai_tugas, grade.nilai_kuis, val, grade.nilai_uas)
 setGradesData({ ...gradesData, [st.id]: { ...grade, nilai_uts: val, nilai_akhir: newAkhir } })
 }}
 className="w-16 h-9 px-2 text-center border-2 border-[#b6f6d9] dark:border-emerald-700/80 rounded-xl bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
 placeholder="-"
 />
 </td>
 <td className="p-3 text-center">
 <input
 type="number"
 value={grade.nilai_uas ?? ''}
 onChange={(e) => {
 const val = e.target.value === '' ? '' : Number(e.target.value)
 const newAkhir = calcAkhir(grade.nilai_tugas, grade.nilai_kuis, grade.nilai_uts, val)
 setGradesData({ ...gradesData, [st.id]: { ...grade, nilai_uas: val, nilai_akhir: newAkhir } })
 }}
 className="w-16 h-9 px-2 text-center border-2 border-[#b6f6d9] dark:border-emerald-700/80 rounded-xl bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
 placeholder="-"
 />
 </td>
 <td className="p-3 text-center font-extrabold text-emerald-700 dark:text-emerald-400 text-sm tabular-nums">
 {grade.nilai_akhir !== '' && grade.nilai_akhir !== undefined && grade.nilai_akhir !== null ? grade.nilai_akhir : '-'}
 </td>
 <td className="p-3">
 <input
 type="text"
 value={grade.catatan ?? ''}
 onChange={(e) => {
 const val = e.target.value
 setGradesData({
 ...gradesData,
 [st.id]: { ...grade, catatan: val, notes: val },
 })
 }}
 className="w-full min-w-[200px] h-9 px-3 text-xs font-bold border-2 border-[#b6f6d9] dark:border-emerald-700/80 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400 transition-all"
 placeholder="Catatan capaian / evaluasi siswa..."
 />
 </td>
 </tr>
 )
 })}
 </tbody>
 </table>
 </div>

 {/* Pagination Kontrol Penilaian (Maksimal 10 Baris) */}
 {students.length > penilaianPerPage && (
 <div className="flex flex-wrap items-center justify-between gap-3 border-t border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] px-5 py-3.5">
 <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
 Menampilkan{' '}
 <strong className="text-emerald-700 dark:text-emerald-300">
 {(penilaianPage - 1) * penilaianPerPage + 1}
 </strong>{' '}
 s.d.{' '}
 <strong className="text-emerald-700 dark:text-emerald-300">
 {Math.min(penilaianPage * penilaianPerPage, students.length)}
 </strong>{' '}
 dari <strong className="text-slate-900 dark:text-white">{students.length}</strong> siswa
 </div>
 <Pagination
 currentPage={penilaianPage}
 totalPages={Math.max(1, Math.ceil(students.length / penilaianPerPage))}
 onPageChange={setPenilaianPage}
 sideLayout="full"
 variant="compact"
 />
 </div>
 )}
 </div>
 )}

 {/* TAB 6: TAHFIZH */}
 {activeTab === 'tahfizh' && canAccessTahfizh && (
 <section className="space-y-6" aria-labelledby="tahfizh-heading">
 {/* 1. HEROUI MODERN HERO CARD BANNER */}
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3 }}
 className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 !bg-[#D5F2E3] p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:!bg-[#112a22] print:hidden"
 >
 {/* Dual multi-tone ambient glow */}

 <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
 <div className="flex items-start gap-4 min-w-0">
 <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">

            <BookOpen className="size-6 sm:size-7 text-white" />
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
 <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold bg-emerald-600 text-white shadow-xs border border-emerald-500/40 dark:border-emerald-600/50">

                  <Sparkles className="size-3 sm:size-3.5 animate-pulse text-white" />
 Jurnal &amp; Monitoring Tahfizh
 </span>
 <span className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 sm:py-1 text-xs sm:text-xs font-bold border ${isGlobalTahfizhScope
 ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300/70'
 : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300'
 }`}>
 {isGlobalTahfizhScope ? (
 selectedTahfizhUnit && selectedTahfizhUnit !== 'semua' ? (
 <>• Scope: Seluruh Unit (Filter: {selectedTahfizhUnit})</>
 ) : (
 <>• Scope: Seluruh Unit Pendidikan (Yayasan &amp; Divisi Pendidikan)</>
 )
 ) : (
 <>• Scope: Unit {teacherProfile?.education_unit || user?.education_unit?.name || user?.unit_name || 'Sekolah'} {selectedClassName && selectedClass !== 'all' ? `— Kelas ${selectedClassName}` : ''}</>
 )}
 </span>
 </div>
 <h2 id="tahfizh-heading" className="mt-1.5 text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
 {isGlobalTahfizhScope
 ? (selectedTahfizhUnit && selectedTahfizhUnit !== 'semua'
 ? `Leaderboard Hafalan Tahfizh Terbanyak — Unit ${selectedTahfizhUnit}`
 : 'Leaderboard Pencapaian Hafalan Tahfizh Seluruh Unit')
 : `Jurnal & Ranking Setoran Tahfizh Al-Qur'an — ${teacherProfile?.education_unit || user?.education_unit?.name || 'Unit Sekolah'}${selectedClassName && selectedClass !== 'all' ? ` (Kelas ${selectedClassName})` : ''}`}
 </h2>
 <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 w-full leading-relaxed">
 {isGlobalTahfizhScope
 ? 'Menampilkan konsolidasi pencapaian hafalan tahfizh terbanyak dari seluruh unit pendidikan dengan kemampuan menyortir rincian teratas masing-masing unit.'
 : `Menampilkan daftar peringkat hafalan tahfizh santri khusus untuk unit ${teacherProfile?.education_unit || user?.education_unit?.name || 'pendidikan Anda'} diurutkan berdasarkan pencapaian hafalan terbanyak.`}
 </p>
 </div>
 </div>

 <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-center">
 <button
 type="button"
 onClick={() => changeTab('rekapan-tahfizh')}
 className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white/90 dark:bg-emerald-950/70 hover:bg-emerald-50 dark:hover:bg-emerald-900 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-200 shadow-xs transition-all cursor-pointer active:scale-95"
 title="Buka Halaman Laporan Rekapan & Cetak Tahfizh"
 >
 <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 <span>Laporan Rekapan</span>
 </button>
 <button
 type="button"
 onClick={() => openTahfizhForm()}
 className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
 >
 <Plus className="h-4 w-4 text-white" />
 <span>Input Setoran Baru</span>
 </button>
 </div>
 </div>
 </motion.div>

 {/* 2. TOP 5 CARDS SECTION */}
 {top5TahfizhStudents.length > 0 ? (
 <div className="space-y-3.5">
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div className="flex items-center gap-3">
 <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
 <Trophy className="size-5 text-white" />
 </span>
 <div>
 <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
 5 Terbaik Pencapaian Hafalan Tahfizh Al-Qur'an
 </h4>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Kartu profil santri dengan progres hafalan terbanyak (Rank #1 s.d. #5)
 </p>
 </div>
 </div>
 <span className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/80 px-3 py-1 text-xs font-black shadow-xs whitespace-nowrap">
 🏆 Top 5 Leaderboard
 </span>
 </div>

 <div className="grid gap-3.5 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 items-stretch">
 {top5TahfizhStudents.map(({ student, latest, totalAyat, completedSurahs, totalSetoran, unitName, className }, index) => {
 const getInitials = (name = '') => {
 return name.split(' ').map((n) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'S'
 }
 const avatarUrl = student.foto_url || student.avatar || student.foto || student.user?.avatar_url || null
 const rankLabel = index === 0 ? '🥇 Rank #1' : index === 1 ? '🥈 Rank #2' : index === 2 ? '🥉 Rank #3' : `🏅 Rank #${index + 1}`

 const rankStyle = index === 0
 ? {
 card: 'border-2 border-amber-300 dark:border-amber-700/80 bg-gradient-to-b from-amber-50/60 via-white to-white dark:from-amber-950/30 dark:via-[#1B2433] dark:to-[#1B2433] shadow-sm',
 badge: 'bg-amber-500 text-white shadow-xs',
 }
 : index === 1
 ? {
 card: 'border-2 border-emerald-300 dark:border-emerald-700/80 bg-gradient-to-b from-slate-50 via-white to-white dark:from-slate-900/50 dark:via-[#1B2433] dark:to-[#1B2433] shadow-sm',
 badge: 'bg-slate-600 text-white shadow-xs',
 }
 : index === 2
 ? {
 card: 'border-2 border-emerald-300 dark:border-emerald-700/80 bg-gradient-to-b from-orange-50/60 via-white to-white dark:from-orange-950/30 dark:via-[#1B2433] dark:to-[#1B2433] shadow-sm',
 badge: 'bg-orange-500 text-white shadow-xs',
 }
 : {
 card: 'border-2 border-emerald-300 dark:border-emerald-700/80 bg-gradient-to-b from-emerald-50/50 via-white to-white dark:from-emerald-950/30 dark:via-[#1B2433] dark:to-[#1B2433] shadow-sm',
 badge: 'bg-emerald-600 text-white shadow-xs',
 }

 const surahName = latest?.hafalan_surah_name || 'Belum setoran'
 const ayahRange = latest ? `Ayat ${latest.hafalan_ayah_start}–${latest.hafalan_ayah_end}` : '—'
 const juzNum = latest ? (latest.metadata?.juz || getQuranJuz(latest.hafalan_surah_number, latest.hafalan_ayah_start)) : '—'

 return (
 <article
 key={student.id || index}
 className={`group relative flex flex-col justify-between h-full rounded-[22px] p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${rankStyle.card}`}
 >
 <div>
 {/* Rank Badge & Unit Label */}
 <div className="flex items-center justify-between gap-1.5 mb-3">
 <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black whitespace-nowrap shrink-0 ${rankStyle.badge}`}>
 {rankLabel}
 </span>
 <span className="truncate rounded-md bg-white/90 dark:bg-slate-800/90 border border-emerald-200/80 dark:border-emerald-700/80 px-2 py-0.5 text-[9.5px] font-bold text-slate-700 dark:text-slate-300 min-w-0" title={unitName}>
 {unitName}
 </span>
 </div>

 {/* Profil & Avatar */}
 <div className="flex items-center gap-3">
 <Avatar size="lg" className="shrink-0 ring-2 ring-emerald-500/25">
 {avatarUrl && <AvatarImage src={avatarUrl} alt={student.nama_lengkap} />}
 <AvatarFallback className="bg-emerald-100 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-black text-xs">
 {getInitials(student.nama_lengkap)}
 </AvatarFallback>
 </Avatar>
 <div className="min-w-0 flex-1">
 <h5 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 min-h-[2rem] leading-4" title={student.nama_lengkap}>
 {student.nama_lengkap}
 </h5>
 <p className="mt-0.5 text-[10px] font-medium text-slate-400 truncate">
 NIS: {student.nis || student.nisn || '—'}
 </p>
 <span className="mt-1 inline-block rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 px-2 py-0.5 text-[9px] font-extrabold truncate max-w-full">
 {className}
 </span>
 </div>
 </div>
 </div>

 <div className="mt-3.5 space-y-3">
 {/* Detail Hafalan Tahfizh (Nama Surah, Ayat, Juz, Total Surah & Total Ayat) */}
 <div className="space-y-2 rounded-xl bg-white/90 dark:bg-slate-800/80 p-3 text-xs border border-emerald-200/80 dark:border-emerald-700/80">
 {/* Nama Surah */}
 <div className="flex items-center justify-between gap-1 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-1.5">
 <span className="text-[10px] font-bold text-slate-400 shrink-0">Nama Surah:</span>
 <span className="truncate font-black text-[#059669] dark:text-[#10B981] text-right" title={surahName}>
 {surahName}
 </span>
 </div>

 {/* Ayat & Juz */}
 <div className="grid grid-cols-2 gap-1 text-[10px]">
 <div>
 <span className="block font-bold text-slate-400">Ayat:</span>
 <span className="font-extrabold text-slate-800 dark:text-slate-200">{ayahRange}</span>
 </div>
 <div className="text-right">
 <span className="block font-bold text-slate-400">Juz:</span>
 <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
 Juz {juzNum}
 </span>
 </div>
 </div>

 {/* Total Surah & Total Ayat Footer Summary */}
 <div className="mt-2 border-t border-emerald-200/80 pt-2 grid grid-cols-2 gap-1.5 text-center dark:border-emerald-700/80">
 <div className="rounded-lg bg-slate-50 dark:bg-slate-900/60 p-1.5 border border-emerald-200/80 dark:border-emerald-800/60">
 <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Surah</p>
 <p className="text-xs font-black text-slate-800 dark:text-slate-100 tabular-nums">{completedSurahs} Surah</p>
 </div>
 <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/60 p-1.5 border border-emerald-200/80 dark:border-emerald-800/60">
 <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Total Ayat</p>
 <p className="text-xs font-black text-emerald-800 dark:text-emerald-200 tabular-nums">{totalAyat} Ayat</p>
 </div>
 </div>
 </div>

 {/* Action Buttons */}
 <div className="grid grid-cols-2 gap-2">
 <button
 type="button"
 onClick={() => openTahfizhDetail(student)}
 className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border-2 border-sky-200 dark:border-sky-800/60 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900 text-xs font-bold text-sky-700 dark:text-sky-300 transition-all cursor-pointer shadow-xs active:scale-95"
 >
 <Eye className="size-3.5" /> Detail
 </button>
 <button
 type="button"
 onClick={() => openTahfizhForm(student)}
 className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
 >
 <Plus className="size-3.5 text-white" /> Setor
 </button>
 </div>
 </div>
 </article>
 )
 })}
 </div>
 </div>
 ) : (
 <div className="rounded-[22px] border-2 border-dashed border-emerald-300/80 dark:border-emerald-800/60 bg-emerald-50/30 p-8 text-center dark:bg-emerald-950/10">
 <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 shadow-xs">
 <Trophy className="size-6 text-amber-600 dark:text-amber-400" />
 </div>
 <h4 className="mt-3 text-base font-black text-slate-900 dark:text-white">
 Belum Ada Data Peringkat 5 Terbaik
 </h4>
 <p className="mx-auto mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
 Papan peringkat 5 Terbaik akan otomatis dihitung dan ditampilkan setelah santri mulai menyetorkan hafalan (saat ini seluruh santri masih 0 ayat).
 </p>
 <button
 type="button"
 onClick={() => openTahfizhForm()}
 className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
 >
 <Plus className="size-4 text-white" />
 Input Setoran Tahfizh Pertama
 </button>
 </div>
 )}

 {/* 3. MULTI-UNIT SUMMARY CARDS (For Super Admin, Admin, Pengurus Yayasan & Divisi Pendidikan) */}
 {isGlobalTahfizhScope && unitStatsSummary.length > 0 && (
 <div className="grid gap-3.5 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
 {unitStatsSummary.map((unitStat) => (
 <div
 key={unitStat.unitName}
 className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] p-4.5 shadow-sm transition-all hover:shadow-md"
 >
 <div className="flex items-center justify-between">
 <span className="inline-flex size-9 items-center justify-center rounded-xl bg-slate-100 border border-emerald-200/80 text-slate-700 shadow-xs dark:bg-slate-800 dark:border-emerald-700/80 dark:text-slate-300 shadow-sm">
 <Award className="size-4.5 text-emerald-600" />
 </span>
 <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-0.5 text-[10px] font-extrabold">
 {unitStat.totalStudents} Santri
 </span>
 </div>
 <h4 className="mt-3 text-sm font-black text-slate-900 dark:text-white">
 {unitStat.unitName}
 </h4>
 <div className="mt-2.5 flex items-baseline justify-between border-t border-emerald-200/80 dark:border-emerald-800/80 dark:border-emerald-800/60 pt-2.5">
 <div>
 <p className="text-[10px] font-bold text-slate-400">Total Hafalan</p>
 <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">
 {unitStat.totalAyat} ayat
 </p>
 </div>
 <div className="text-right">
 <p className="text-[10px] font-bold text-slate-400">Top Hafiz Unit</p>
 <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[120px]" title={unitStat.topStudent?.student?.nama_lengkap}>
 🥇 {unitStat.topStudent?.student?.nama_lengkap?.split(' ')[0] || '-'}
 </p>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* 4. HEROUI EMERALD DATATABLE CONTAINER (Leaderboard Table) */}
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-sm dark:bg-[#1B2433]">
 {/* Toolbar Header */}
 <div className="bg-emerald-500/10 border-b border-emerald-200/80 dark:border-emerald-800/60 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
 <div className="flex items-center gap-3">
 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
 <Layers className="size-5 text-white" />
 </div>
 <div>
 <div className="flex items-center gap-2 flex-wrap">
 <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
 Daftar Ranking &amp; Rekapitulasi Tahfizh Santri
 </h3>
 <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-0.5 text-xs font-extrabold">
 {sortedTahfizhLeaderboard.length} Santri Terdata
 </span>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Peringkat santri diurutkan berdasarkan akumulasi ayat hafalan yang telah disetorkan
 </p>
 </div>
 </div>

 <PageToolbarActions
   onPrint={handlePrintTahfizhLeaderboard}
   printLabel="Cetak Ranking"
   onExport={handleDownloadPdfTahfizhLeaderboard}
   exportLabel="Unduh PDF"
   showLabel
 />
 </div>

 {/* ── TOOLBAR BARIS 2: Full-Width Search Input ── */}
 <div className="bg-white dark:bg-[#1B2433] dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-emerald-950/20 border-b border-emerald-200/80 dark:border-emerald-800/80 p-3 sm:px-5 sm:py-3.5">
 <div className="relative w-full">
 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-emerald-600/70 dark:text-emerald-400/70" />
 <input
 type="text"
 value={tahfizhSearch}
 onChange={(e) => setTahfizhSearch(e.target.value)}
 placeholder="Cari nama santri binaan, NIS, NISN, unit, atau kelas rombel..."
 className="w-full h-9 pl-10 pr-9 rounded-xl text-xs bg-white dark:bg-[#151D2A] border-2 border-[#b6f6d9] dark:border-emerald-800/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-900 dark:text-white placeholder:text-slate-400 shadow-2xs font-medium"
 />
 {tahfizhSearch && (
 <button
 type="button"
 onClick={() => setTahfizhSearch('')}
 className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
 title="Hapus pencarian"
 >
 <X className="size-3.5" />
 </button>
 )}
 </div>
 </div>

 {/* ── TOOLBAR BARIS 3: Filter Bar Terstruktur & Rapi (Unit, Rombel, Urutkan, Tampilkan, Reset) ── */}
 <div className="bg-white dark:bg-[#1B2433] dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/40 border-b border-emerald-200/80 dark:border-emerald-800/80 p-3 sm:px-5 sm:py-3">
 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
 {/* Left: Filter Controls Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-2.5 flex-1 min-w-0">
 {/* Unit Dropdown / Locked Unit Badge */}
 {isGlobalTahfizhScope ? (
 <div className="w-full lg:w-auto lg:min-w-[220px]">
 <HeroUiFilterSelect
 id="filter-unit-tahfizh"
 value={selectedTahfizhUnit}
 onChange={(val) => {
 setSelectedTahfizhUnit(val)
 setTahfizhPage(1)
 }}
 options={[
 { value: 'semua', label: '✨ Semua Unit Pendidikan' },
 ...educationUnits.map((u) => ({
 value: String(u.nama || u.name || u.id),
 label: u.nama || u.name,
 })),
 ]}
 placeholder="✨ Semua Unit Pendidikan"
 icon={School}
 ariaLabel="Filter Unit Pendidikan Tahfizh"
 popoverWidth="min-w-[240px]"
 searchable
 align="left"
 />
 </div>
 ) : (
 <div
 title="Unit Terkunci: Menampilkan data khusus unit wewenang Anda"
 className="inline-flex h-9 items-center justify-between gap-2 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs bg-white/90 dark:bg-emerald-950/60 dark:border-emerald-800/60 px-3.5 text-xs font-bold text-emerald-800 dark:text-emerald-200 shadow-2xs w-full lg:w-auto shrink-0"
 >
 <div className="flex items-center gap-2 min-w-0">
 <School className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
 <span className="truncate max-w-[210px] font-extrabold">
 {teacherProfile?.education_unit || user?.education_unit?.name || user?.unit_name || 'Unit Terikat'}
 </span>
 </div>
 <Lock className="size-3 text-emerald-500/80 shrink-0 ml-1" />
 </div>
 )}

 {/* Rombel Dropdown */}
 <div className="w-full lg:w-auto lg:min-w-[190px]">
 <HeroUiFilterSelect
 id="filter-rombel-tahfizh"
 value={tahfizhFilterClass}
 onChange={(val) => {
 setTahfizhFilterClass(val)
 setTahfizhPage(1)
 }}
 options={[
 { value: 'all', label: '✨ Semua Rombel' },
 ...classes.map((cls) => ({
 value: String(cls.id),
 label: `${cls.nama_kelas || cls.name}${cls.kode_kelas ? ` · ${cls.kode_kelas}` : ''}`,
 })),
 ]}
 placeholder="✨ Semua Rombel"
 icon={Layers}
 ariaLabel="Filter Rombel Tahfizh"
 popoverWidth="min-w-[210px]"
 searchable
 align="left"
 />
 </div>

 {/* Urutkan Dropdown */}
 <div className="w-full lg:w-auto lg:min-w-[230px]">
 <HeroUiFilterSelect
 id="filter-sort-tahfizh"
 value={tahfizhSortOrder}
 onChange={(val) => {
 setTahfizhSortOrder(val)
 setTahfizhPage(1)
 }}
 options={[
 { value: 'highest', label: '🏆 Hafalan Terbanyak (Rank #1)' },
 { value: 'surah', label: '📖 Total Surah Terbanyak' },
 { value: 'name_asc', label: '🔤 Nama Santri (A-Z)' },
 { value: 'name_desc', label: '🔤 Nama Santri (Z-A)' },
 { value: 'recent', label: '🕒 Setoran Terbaru' },
 ]}
 placeholder="🏆 Hafalan Terbanyak"
 icon={Trophy}
 ariaLabel="Urutkan Leaderboard Tahfizh"
 popoverWidth="min-w-[240px]"
 align="left"
 />
 </div>

 {/* Limit Per Halaman Dropdown */}
 <div className="w-full lg:w-auto lg:min-w-[190px]">
 <HeroUiFilterSelect
 id="filter-limit-tahfizh"
 value={String(tahfizhPerPage)}
 onChange={(val) => {
 setTahfizhPerPage(val === 'all' ? 'all' : Number(val))
 setTahfizhPage(1)
 }}
 options={[
 { value: '10', label: '10 data per halaman' },
 { value: '25', label: '25 data per halaman' },
 { value: '50', label: '50 data per halaman' },
 { value: 'all', label: 'Semua Data' },
 ]}
 placeholder="10 data per halaman"
 icon={Eye}
 ariaLabel="Tampilkan per halaman"
 popoverWidth="min-w-[200px]"
 align="left"
 />
 </div>
 </div>

 {/* Right: Reset Filter Button */}
 {(tahfizhSearch || (isGlobalTahfizhScope && selectedTahfizhUnit !== 'semua') || tahfizhFilterClass !== 'all' || tahfizhSortOrder !== 'highest' || tahfizhPerPage !== 10) && (
 <SquircleActionButton
   variant="delete"
   icon={RefreshCw}
   label="Reset Filter"
   onClick={() => {
     setTahfizhSearch('')
     if (isGlobalTahfizhScope) setSelectedTahfizhUnit('semua')
     setTahfizhFilterClass('all')
     setTahfizhSortOrder('highest')
     setTahfizhPerPage(10)
     setTahfizhPage(1)
   }}
   title="Reset Semua Filter"
   showLabel
 />
 )}
 </div>
 </div>

 {/* Mobile Card View */}
 <div className="divide-y divide-emerald-100/80 md:hidden dark:divide-emerald-900/40">
 {paginatedTahfizhLeaderboard.map(({ student, latest, totalAyat, completedSurahs, totalSetoran, unitName, className }, index) => {
 const currentPerPage = tahfizhPerPage === 'all' ? sortedTahfizhLeaderboard.length : (Number(tahfizhPerPage) || TAHFIZH_PER_PAGE)
 const absoluteIndex = (tahfizhPage - 1) * currentPerPage + index
 // Syarat medali Gold, Perak, Tembaga: Harus yang terbanyak hafalan dan memiliki hafalan (> 0 ayat / setoran)
 const hasHafalan = (totalAyat > 0 || totalSetoran > 0)
 const isTop1 = absoluteIndex === 0 && hasHafalan
 const isTop2 = absoluteIndex === 1 && hasHafalan
 const isTop3 = absoluteIndex === 2 && hasHafalan
 return (
 <article key={student.id} className="p-4 space-y-3">
 <div className="flex items-start justify-between gap-3">
 <div className="flex items-center gap-2.5 min-w-0">
 <span className={`inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${isTop1 ? 'bg-amber-100 text-amber-800 border border-emerald-200/80 dark:border-emerald-800/60' :
 isTop2 ? 'bg-slate-200 text-slate-800 border border-emerald-200/80 dark:border-emerald-800/60' :
 isTop3 ? 'bg-orange-100 text-orange-800 border border-emerald-200/80' :
 'bg-slate-100 text-slate-600 dark:bg-emerald-950/60 dark:text-emerald-300'
 }`}>
 {isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : `#${absoluteIndex + 1}`}
 </span>
 <div className="min-w-0">
 <h4 className=" text-sm font-black text-slate-900 dark:text-white">{student.nama_lengkap}</h4>
 <p className="text-[10px] text-slate-500">{student.nis || student.nisn || 'NIS N/A'} · {className}</p>
 </div>
 </div>
 <span className="shrink-0 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-0.5 text-xs font-black">
 {totalAyat} ayat
 </span>
 </div>
 <div className="flex items-center gap-2">
 <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-emerald-200/80 dark:border-emerald-800/60">
 {unitName}
 </span>
 </div>
 <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 border border-emerald-200/60 dark:border-emerald-700/80/60 text-xs">
 {latest ? (
 <>
 <p className="font-bold text-slate-800 dark:text-slate-100">
 Juz {latest.metadata?.juz || '-'} · <span className="text-[#059669] dark:text-[#10B981]">{latest.hafalan_surah_name}</span>
 </p>
 <p className="mt-1 text-xs text-slate-500">
 Ayat {latest.hafalan_ayah_start}–{latest.hafalan_ayah_end} · {latest.record_date}
 </p>
 </>
 ) : (
 <p className="text-slate-400">Belum ada setoran Tahfizh.</p>
 )}
 <p className="mt-2 text-[10px] text-slate-500 font-semibold">{completedSurahs} surah · {totalSetoran} setoran</p>
 </div>
 <div className="grid grid-cols-2 gap-2">
 <button
 type="button"
 onClick={() => openTahfizhDetail(student)}
 className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs bg-sky-50 text-xs font-bold text-sky-700 hover:bg-sky-100 dark:border-emerald-800/60 dark:bg-sky-950/60 dark:text-sky-300 transition-all cursor-pointer"
 >
 <Eye className="size-3.5" /> Lihat Detail
 </button>
 <button
 type="button"
 onClick={() => openTahfizhForm(student)}
 className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white text-xs font-bold hover:from-emerald-700 hover:to-teal-700 transition-all cursor-pointer shadow-xs"
 >
 <Plus className="size-3.5 text-emerald-600" /> Input Tahfizh
 </button>
 </div>
 </article>
 )
 })}
 </div>

 {/* Desktop Datatable */}
 <div className="hidden md:block overflow-x-auto">
 <table className="w-full table-fixed text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 <th className="w-16 p-3.5 text-center">Rank</th>
 <th className="p-3.5">Santri Binaan</th>
 <th className="p-3.5">Unit Sekolah</th>
 <th className="p-3.5">Kelas &amp; Rombel</th>
 <th className="p-3.5">Capaian Terakhir</th>
 <th className="p-3.5">Riwayat Setoran</th>
 <th className="p-3.5 text-center">Akumulasi Hafalan</th>
 <th className="w-32 p-3.5 text-right">Aksi</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {paginatedTahfizhLeaderboard.map(({ student, latest, totalAyat, completedSurahs, totalSetoran, unitName, className }, index) => {
 const currentPerPage = tahfizhPerPage === 'all' ? sortedTahfizhLeaderboard.length : (Number(tahfizhPerPage) || TAHFIZH_PER_PAGE)
 const absoluteIndex = (tahfizhPage - 1) * currentPerPage + index
 // Syarat medali Gold, Perak, Tembaga: Harus yang terbanyak hafalan dan memiliki hafalan (> 0 ayat / setoran)
 const hasHafalan = (totalAyat > 0 || totalSetoran > 0)
 const isTop1 = absoluteIndex === 0 && hasHafalan
 const isTop2 = absoluteIndex === 1 && hasHafalan
 const isTop3 = absoluteIndex === 2 && hasHafalan
 return (
 <tr key={student.id} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors">
 <td className="p-3.5 text-center">
 <span className={`inline-flex size-7 items-center justify-center rounded-full text-xs font-black ${isTop1 ? 'bg-amber-100 text-amber-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs' :
 isTop2 ? 'bg-slate-200 text-slate-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs' :
 isTop3 ? 'bg-orange-100 text-orange-800 border border-emerald-200/80 shadow-xs' :
 'bg-slate-100 text-slate-600 dark:bg-emerald-950/60 dark:text-emerald-300'
 }`}>
 {isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : `#${absoluteIndex + 1}`}
 </span>
 </td>
 <td className="p-3.5">
 <p className="font-extrabold text-slate-900 dark:text-white">{student.nama_lengkap}</p>
 <p className="mt-0.5 text-[10px] text-slate-500 font-medium">NIS: {student.nis || student.nisn || 'N/A'}</p>
 </td>
 <td className="p-3.5">
 <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${unitName.includes('SMA') ? 'bg-blue-50 text-blue-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-emerald-800/60' :
 unitName.includes('SMP') ? 'bg-indigo-50 text-indigo-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-emerald-800/60' :
 unitName.includes('SD') ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60' :
 'bg-amber-50 text-amber-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-emerald-800/60'
 }`}>
 {unitName}
 </span>
 </td>
 <td className="p-3.5">
 <span className="font-bold text-slate-800 dark:text-slate-200">{className}</span>
 </td>
 <td className="p-3.5">
 {latest ? (
 <div>
 <span className="inline-block rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 px-2 py-0.2 text-[9.5px] font-bold">
 Juz {latest.metadata?.juz || '-'}
 </span>
 <p className="mt-1 font-black text-[#059669] dark:text-[#10B981]">{latest.hafalan_surah_name}</p>
 </div>
 ) : (
 <span className="text-slate-400 italic">Belum ada capaian</span>
 )}
 </td>
 <td className="p-3.5">
 {latest ? (
 <div>
 <p className="font-semibold text-slate-800 dark:text-slate-200">
 Ayat {latest.hafalan_ayah_start}–{latest.hafalan_ayah_end}
 </p>
 <p className="mt-0.5 text-[10px] text-slate-500 font-medium">
 {latest.record_date} · <span className="font-semibold text-emerald-700 dark:text-emerald-400">{latest.metadata?.type || 'Ziyadah'}</span>
 </p>
 </div>
 ) : (
 <span className="text-slate-400">—</span>
 )}
 </td>
 <td className="p-3.5 text-center">
 <p className="font-black text-emerald-700 dark:text-emerald-400 text-sm">{totalAyat} ayat</p>
 <p className="text-[10px] text-slate-500 font-medium mt-0.5">{completedSurahs} surah · {totalSetoran} setoran</p>
 </td>
 <td className="p-3.5 text-right">
 <div className="inline-flex items-center gap-1.5 justify-end">
 <button
 type="button"
 onClick={() => openTahfizhDetail(student)}
 title="Lihat detail jurnal"
 aria-label={`Lihat detail jurnal ${student.nama_lengkap}`}
 className="inline-flex size-8.5 items-center justify-center rounded-xl border-2 border-sky-200 dark:border-sky-800/60 shadow-xs bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-300 transition-all cursor-pointer active:scale-95"
 >
 <Eye className="size-4" />
 </button>
 <button
 type="button"
 onClick={() => openTahfizhForm(student)}
 title="Input Tahfizh"
 aria-label={`Input Tahfizh ${student.nama_lengkap}`}
 className="inline-flex size-8.5 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer shadow-xs active:scale-95"
 >
 <Plus className="size-4 text-white" />
 </button>
 </div>
 </td>
 </tr>
 )
 })}
 </tbody>
 </table>
 </div>

 {!loading && sortedTahfizhLeaderboard.length === 0 && (
 <div className="p-12 text-center">
 <Users className="mx-auto size-9 text-slate-300 dark:text-slate-600" />
 <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
 Tidak ada data pencapaian tahfizh yang sesuai dengan filter.
 </p>
 </div>
 )}

 {/* Footer Pagination Controls */}
 <div className="w-full border-t border-emerald-200/80 dark:border-emerald-800/80 px-4 py-3.5 sm:px-6 bg-white dark:bg-[#1B2433] flex flex-col sm:flex-row items-center justify-between gap-3">
 <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
 Menampilkan <span className="font-bold text-slate-800 dark:text-slate-200">{sortedTahfizhLeaderboard.length > 0 ? (tahfizhPage - 1) * (tahfizhPerPage === 'all' ? sortedTahfizhLeaderboard.length : Number(tahfizhPerPage)) + 1 : 0}</span> s.d. <span className="font-bold text-slate-800 dark:text-slate-200">{tahfizhPerPage === 'all' ? sortedTahfizhLeaderboard.length : Math.min(tahfizhPage * Number(tahfizhPerPage), sortedTahfizhLeaderboard.length)}</span> dari <span className="font-bold text-slate-800 dark:text-slate-200">{sortedTahfizhLeaderboard.length}</span> santri binaan
 </div>
 {totalTahfizhPages > 1 && (
 <div className="w-full sm:w-auto">
 <Pagination
 currentPage={tahfizhPage}
 totalPages={totalTahfizhPages}
 onPageChange={(p) => setTahfizhPage(p)}
 sideLayout="full"
 variant="default"
 />
 </div>
 )}
 </div>
 </div>
 </section>
 )}

 {/* TAB 6B: REKAPAN TAHFIZH LENGKAP */}
 {activeTab === 'rekapan-tahfizh' && canAccessTahfizh && (
 <section className="space-y-4" aria-labelledby="rekapan-tahfizh-heading">
 <div className="flex items-center justify-between gap-3 rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm bg-emerald-500/10 p-4 dark:border-emerald-800/60 dark:bg-slate-900">
 <div className="flex items-center gap-3">
 <div className="flex h-9 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
 <FileSpreadsheet className="h-5 w-5" />
 </div>
 <div>
 <h3 id="rekapan-tahfizh-heading" className="text-base font-extrabold text-slate-900 dark:text-white">
 Laporan Rekapan Setoran Tahfizh
 </h3>
 <p className="text-xs text-slate-500">
 Rekapitulasi log hafalan santri, filter periode, statistik capaian, dan cetak laporan resmi.
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => changeTab('tahfizh')}
 className="inline-flex items-center gap-1.5 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
 >
 <ArrowRight className="h-3.5 w-3.5 rotate-180" /> Kembali ke Jurnal
 </button>
 </div>

 <TahfizhReportSummaryPage embedded={true} defaultClassId={selectedClass} initialRecords={tahfizhLogs} />
 </section>
 )}

 {/* TAB 7: MUTABAAH */}
 {activeTab === 'mutabaah' && canAccessMutabaah && (
 <TeacherMutabaahWeekly
 selectedClassId={selectedClass}
 user={user}
 teacherProfile={teacherProfile}
 />
 )}

 {/* TAB 8: CATATAN SISWA */}
 {activeTab === 'catatan' && (
 <div className="relative overflow-hidden z-10 rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-sm dark:bg-[#1B2433]">
 {/* Toolbar Header */}
 <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-500/10 px-5 py-4">
 <div className="flex items-center gap-3">
 <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
 <BookOpen className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
 Catatan Perkembangan Siswa
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Monitoring Karakter & Akademik Rombel {selectedClassName}
 </p>
 </div>
 </div>

 <div className="flex flex-wrap items-center gap-2">
 <PageToolbarActions
   onPrint={() => {
     printCleanTable({
       title: 'Rekapitulasi Catatan Perkembangan Siswa',
       subtitle: `Rombel: ${selectedClassName} | Tahun Ajaran 2026/2027`,
       headers: ['No', 'NIS', 'Nama Siswa', 'Kategori', 'Judul Catatan', 'Tanggal', 'Prioritas'],
       rows: studentNotes.map((n, idx) => [
         idx + 1,
         n.student?.nis || n.student_nis || '-',
         n.student?.nama_lengkap || n.student_name || '-',
         n.category || '-',
         n.title || '-',
         n.date || '-',
         n.priority || 'Normal',
       ]),
       user,
       unit: teacherProfile?.unit || user?.employee?.unit || user?.unit,
     })
     addToast('info', 'Dokumen Siap Dicetak', 'Pratinjau cetak rekapitulasi catatan perkembangan siswa berhasil dibuka.')
   }}
   printLabel="Cetak Catatan"
   primaryAction={{
     label: 'Penilaian Perilaku TU',
     onClick: () => openPelanggaranModal(null),
     icon: ShieldAlert,
   }}
   showLabel
 >
   <SquircleActionButton
     variant="delete"
     icon={AlertTriangle}
     label="Tata Tertib & Poin"
     onClick={() => navigate('/dashboard/tata-tertib')}
     title="Buku Tata Tertib & Poin Kedisiplinan Siswa"
     showLabel
   />
 </PageToolbarActions>
 <span className="inline-flex items-center rounded-lg bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-1 text-xs font-black text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300">
 {students.length} siswa
 </span>
 </div>
 </div>

 {/* Filter Bar */}
 <div className="border-b border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/60 dark:bg-slate-900/40 px-5 py-3">
 <div className="grid gap-3 md:grid-cols-[1fr_200px_180px]">
 <div className="relative">
 <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 value={studentNoteSearch}
 onChange={(e) => setStudentNoteSearch(e.target.value)}
 placeholder="Cari siswa, judul, atau isi catatan..."
 className="h-10 w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white pl-9 pr-3 text-xs font-bold text-slate-800 dark:bg-slate-900 dark:text-slate-100 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
 />
 </div>
 <div>
 <HeroUiFilterSelect
 value={studentNoteCategory}
 onChange={(val) => setStudentNoteCategory(val)}
 options={[
 { value: 'semua', label: 'Semua Kategori' },
 ...['Akademik', 'Perilaku', 'Kedisiplinan', 'Prestasi', 'Konseling', 'Tahfizh', 'Ibadah', 'Kesehatan'].map((cat) => ({
 value: cat,
 label: cat
 }))
 ]}
 placeholder="Semua Kategori"
 ariaLabel="Kategori catatan"
 popoverWidth="min-w-[190px]"
 />
 </div>
 <div>
 <HeroUiFilterSelect
 value={studentNotePriority}
 onChange={(val) => setStudentNotePriority(val)}
 options={[
 { value: 'semua', label: 'Semua Prioritas' },
 { value: 'low', label: 'Rendah' },
 { value: 'medium', label: 'Sedang' },
 { value: 'high', label: 'Tinggi' },
 { value: 'urgent', label: 'Mendesak' },
 ]}
 placeholder="Semua Prioritas"
 ariaLabel="Prioritas catatan"
 popoverWidth="min-w-[170px]"
 />
 </div>
 </div>
 </div>

 {/* Mobile Card View for Catatan Siswa (screens < lg) */}
 <div className="block lg:hidden divide-y divide-emerald-100/80 p-3 dark:divide-emerald-900/40">
 {catatanStudents.map((student, index) => {
 const notes = studentNotes.filter((note) => note.student_id === student.id);
 const latest = notes[0];
 const isSigned = latest?.signature_status === 'signed' || Boolean(latest?.signed_by_user_id && latest?.signed_at);
 const isStale = latest?.signature_status === 'signed_updated';

 return (
 <div
 key={student.id}
 className="rounded-xl border border-emerald-200/80 bg-white p-3.5 mb-2.5 shadow-xs dark:border-emerald-800/60 dark:bg-[#151F2E]"
 >
 <div className="flex items-start justify-between gap-2">
 <div className="flex items-center gap-2.5 min-w-0">
 <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
 {index + 1}
 </span>
 <div className="min-w-0">
 <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
 {student.nama_lengkap || student.full_name}
 </p>
 <p className="truncate text-[10px] text-slate-500">
 {student.nis || student.nisn || 'NIS -'}
 </p>
 </div>
 </div>
 <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
 {student.kelas?.nama_kelas || student.kelas?.name || selectedClassName}
 </span>
 </div>

 {/* Catatan Terakhir */}
 <div className="mt-2.5 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-900/60 border border-emerald-200/80 dark:border-emerald-800/60">
 {latest ? (
 <>
 <div className="flex items-center justify-between gap-1.5 flex-wrap">
 <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
 {latest.title}
 </p>
 {isSigned && !isStale ? (
 <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
 <CheckCircle2 className="w-2.5 h-2.5" /> Ditandatangani
 </span>
 ) : isStale ? (
 <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/40 dark:text-amber-300">
 <AlertTriangle className="w-2.5 h-2.5" /> Revisi
 </span>
 ) : (
 <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-700 dark:text-slate-300">
 <Clock className="w-2.5 h-2.5" /> Menunggu
 </span>
 )}
 </div>
 <p className="mt-1 text-[10px] text-slate-500">
 {latest.category} · {latest.date} {latest.follow_up ? ` · Respon: "${latest.follow_up}"` : ''}
 </p>
 </>
 ) : (
 <span className="text-xs text-slate-400">Belum ada catatan</span>
 )}
 </div>

 {/* Action buttons */}
 <div className="mt-3 flex items-center justify-between border-t border-emerald-200/80 pt-2 dark:border-emerald-800/60">
 <span className="text-xs font-semibold text-slate-500">
 Total: <b className="text-emerald-700 dark:text-emerald-400">{notes.length}</b> catatan
 </span>
 <div className="flex items-center gap-1.5">
 <button
 type="button"
 onClick={() => openStudentDetail(student)}
 className="inline-flex h-8 items-center justify-center gap-1 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs bg-sky-50 px-2.5 text-[10px] font-bold text-sky-700 hover:bg-sky-100 dark:border-emerald-800/60 dark:bg-sky-950/60 dark:text-sky-300"
 >
 <Eye className="h-3.5 w-3.5" /> Lihat
 </button>
 <button
 type="button"
 onClick={() => handlePrintWeeklyEvaluation(student)}
 className="inline-flex h-8 items-center justify-center gap-1 rounded-xl border border-emerald-200/80 bg-orange-50 px-2 text-[10px] font-bold text-orange-700 hover:bg-orange-100 dark:border-emerald-800/60 dark:bg-orange-950/60 dark:text-orange-300"
 >
 <Printer className="h-3.5 w-3.5" />
 </button>
 <button
 type="button"
 onClick={() => openCatatanForm(null, student)}
 className="inline-flex h-8 items-center justify-center gap-1 rounded-xl bg-[#059669] px-2.5 text-[10px] font-bold text-white hover:bg-emerald-800"
 >
 <Plus className="h-3.5 w-3.5" /> Catatan
 </button>
 <button
 type="button"
 onClick={() => openPelanggaranModal(student)}
 title="Catat Penilaian Perilaku / Pelanggaran Tata Tertib TU"
 className="inline-flex h-8 items-center justify-center gap-1 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs bg-rose-50 px-2.5 text-[10px] font-bold text-rose-700 hover:bg-rose-100 transition dark:border-emerald-800/60 dark:bg-rose-950/60 dark:text-rose-300"
 >
 <ShieldAlert className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" /> Perilaku
 </button>
 {latest?.teacher_id === teacherProfile?.id && (
 <>
 <button
 type="button"
 onClick={() => openCatatanForm(latest)}
 className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300"
 >
 <Edit3 className="h-3.5 w-3.5" />
 </button>
 <button
 type="button"
 onClick={() => confirmDeleteModal('catatan', latest.id, latest.title)}
 className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300"
 >
 <Trash2 className="h-3.5 w-3.5" />
 </button>
 </>
 )}
 </div>
 </div>
 </div>
 );
 })}
 </div>

 {/* Datatable Body (Desktop / Tablet view >= lg) */}
 <div className="hidden lg:block overflow-x-auto">
 <table className="w-full min-w-[1040px] table-fixed text-left text-xs">
 <colgroup><col className="w-14" /><col className="w-60" /><col className="w-36" /><col /><col className="w-20" /><col className="w-[430px]" /></colgroup>
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 <th className="px-4 py-3 font-bold text-center">No</th>
 <th
 onClick={() => {
 if (catatanSortField === 'name') {
 setCatatanSortOrder(catatanSortOrder === 'asc' ? 'desc' : 'asc')
 } else {
 setCatatanSortField('name')
 setCatatanSortOrder('asc')
 }
 }}
 className="px-4 py-3 font-bold cursor-pointer hover:text-emerald-800 dark:hover:text-emerald-300 transition"
 title="Klik untuk mengurutkan Data Siswa"
 >
 <div className="flex items-center gap-1.5">
 <span>Data Siswa</span>
 {catatanSortField === 'name' ? (
 catatanSortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <ArrowDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
 ) : (
 <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
 )}
 </div>
 </th>
 <th className="px-4 py-3 font-bold">Rombel</th>
 <th className="px-4 py-3 font-bold">Catatan Terakhir</th>
 <th className="px-4 py-3 font-bold text-center">Jumlah</th>
 <th className="px-4 py-3 font-bold text-right pr-6">Aksi</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {catatanStudents.map((student, index) => {
 const notes = studentNotes.filter((note) => note.student_id === student.id);
 const latest = notes[0];
 const isSigned = latest?.signature_status === 'signed' || Boolean(latest?.signed_by_user_id && latest?.signed_at);
 const isStale = latest?.signature_status === 'signed_updated';
 return (
 <tr key={student.id} className="h-[76px] hover:bg-emerald-50/40 dark:hover:bg-emerald-950/10">
 <td className="p-3 text-center font-mono text-slate-400">{index + 1}</td>
 <td className="overflow-hidden p-3">
 <p className="truncate font-bold text-slate-900 dark:text-white" title={student.nama_lengkap || student.full_name}>
 {student.nama_lengkap || student.full_name}
 </p>
 <p className="mt-0.5 truncate text-[10px] text-slate-500">
 {student.nis || student.nisn || 'NIS belum tersedia'}
 </p>
 </td>
 <td className="overflow-hidden p-3">
 <span className="block truncate rounded-full bg-emerald-50 px-2.5 py-1 text-center text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" title={student.kelas?.nama_kelas || student.kelas?.name || selectedClassName}>
 {student.kelas?.nama_kelas || student.kelas?.name || selectedClassName}
 </span>
 </td>
 <td className="overflow-hidden p-3">
 {latest ? (
 <>
 <div className="flex items-center gap-1.5 flex-wrap">
 <p className="truncate font-semibold text-slate-700 dark:text-slate-200" title={latest.title}>
 {latest.title}
 </p>
 {isSigned && !isStale ? (
 <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
 <CheckCircle2 className="w-2.5 h-2.5" /> Ditandatangani
 </span>
 ) : isStale ? (
 <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/40 dark:text-amber-300">
 <AlertTriangle className="w-2.5 h-2.5" /> Revisi
 </span>
 ) : (
 <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-700 dark:text-slate-300">
 <Clock className="w-2.5 h-2.5" /> Menunggu
 </span>
 )}
 </div>
 <p className="mt-0.5 truncate text-[10px] text-slate-500">
 {latest.category} · {latest.date}
 {latest.follow_up ? ` · Respon: "${latest.follow_up}"` : ''}
 </p>
 </>
 ) : (
 <span className="text-slate-400">Belum ada catatan</span>
 )}
 </td>
 <td className="p-3 text-center">
 <span className="font-black text-[#059669]">{notes.length}</span>
 </td>
 <td className="whitespace-nowrap p-3 text-right">
 <div className="inline-flex items-center justify-end gap-1.5">
 <button
 type="button"
 onClick={() => openStudentDetail(student)}
 className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs bg-sky-50 px-2.5 text-[10px] font-bold text-sky-700 transition hover:bg-sky-100 dark:border-emerald-800/60 dark:bg-sky-950/60 dark:text-sky-300"
 >
 <Eye className="h-3.5 w-3.5 shrink-0" /> Lihat ({notes.length})
 </button>
 <button
 type="button"
 onClick={() => handlePrintWeeklyEvaluation(student)}
 title="Cetak Lembar Evaluasi Mingguan Santri"
 className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-emerald-200/80 bg-orange-50 px-2.5 text-[10px] font-bold text-orange-700 hover:bg-orange-100 transition dark:border-emerald-800/60 dark:bg-orange-950/60 dark:text-orange-300"
 >
 <Printer className="h-3.5 w-3.5 shrink-0" /> Evaluasi
 </button>
 <button
 type="button"
 onClick={() => openCatatanForm(null, student)}
 className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#059669] px-2.5 text-[10px] font-bold text-white hover:bg-emerald-800 transition"
 >
 <Plus className="h-3.5 w-3.5 shrink-0" /> Catatan
 </button>
 <button
 type="button"
 onClick={() => openPelanggaranModal(student)}
 title="Catat Penilaian Perilaku / Pelanggaran Tata Tertib TU"
 className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs bg-rose-50 px-2.5 text-[10px] font-bold text-rose-700 hover:bg-rose-100 transition dark:border-emerald-800/60 dark:bg-rose-950/60 dark:text-rose-300"
 >
 <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-rose-600 dark:text-rose-400" /> Perilaku
 </button>
 {latest?.teacher_id === teacherProfile?.id && (
 <>
 <button
 type="button"
 onClick={() => openCatatanForm(latest)}
 title="Edit catatan terakhir"
 className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300"
 >
 <Edit3 className="h-3.5 w-3.5" />
 </button>
 <button
 type="button"
 onClick={() => confirmDeleteModal('catatan', latest.id, latest.title)}
 title="Hapus catatan terakhir"
 className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300"
 >
 <Trash2 className="h-3.5 w-3.5" />
 </button>
 </>
 )}
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 {!loading && catatanStudents.length === 0 && <div className="py-12 text-center"><Users className="mx-auto h-9 w-9 text-slate-300" /><p className="mt-2 text-xs font-semibold text-slate-500">Tidak ada siswa pada rombel atau filter ini.</p></div>}
 </div>
 </div>
 )}

 {/* TAB 9: LOG ABSENSI GURU (READ ONLY) */}
 {activeTab === 'log-absensi' && (() => {
 const logTotalCount = teacherLogAbsensi.length
 const logHadirCount = teacherLogAbsensi.filter((l) => l.status === 'Hadir').length
 const logTerlambatCount = teacherLogAbsensi.filter((l) => l.status === 'Terlambat').length
 const logIzinSakitCount = teacherLogAbsensi.filter((l) => l.status === 'Izin' || l.status === 'Sakit').length
 const logDisiplinRate = logTotalCount > 0 ? Math.round((logHadirCount / logTotalCount) * 100) : 100

 return (
 <div className="space-y-5">
 {/* ── MODERN HERO CARD BANNER LOG ABSENSI ────────────────── */}
 <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 !bg-[#D5F2E3] p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:!bg-[#112a22] print:hidden">

 <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
 <div className="flex items-start gap-4">
 <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">

            <Clock className="size-6 sm:size-7 text-white" />
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold bg-emerald-600 text-white shadow-xs border border-emerald-500/40 dark:border-emerald-600/50">

                  <Sparkles className="size-3 animate-pulse text-white" />
 Log Kehadiran Pengajar
 </span>
 <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/90 dark:bg-amber-950/80 px-3 py-1 text-xs font-bold text-amber-800 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-800/60">
 <Lock className="size-3" /> Data Presensi Resmi
 </span>
 <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 dark:bg-emerald-950/80 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
 Tahun Ajaran {selectedAcademicYear || '2026/2027'}
 </span>
 <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 dark:bg-emerald-950/80 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80">
 Semester {selectedSemester || 'Ganjil'}
 </span>
 </div>
 <h2 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
 Buku Log &amp; Riwayat Presensi Guru
 </h2>
 <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 w-full">
 Rekam jejak kehadiran kedinasan guru resmi — Pemantauan jam check-in, check-out, akumulasi jam kerja, verifikasi perangkat biometrik/QR, dan sertifikasi disiplin kerja terpadu.
 </p>
 </div>
 </div>

 {/* Summary Metric Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:min-w-[420px]">
              <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs !bg-indigo-100/90 dark:border-emerald-800/60 dark:!bg-indigo-950/60 px-3 py-2 text-center shadow-xs">
                <strong className="block text-lg sm:text-xl font-black text-indigo-800 dark:text-indigo-200">
                  {logTotalCount}
                </strong>
                <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-300">Total Hari Kerja</span>
              </div>
              <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs !bg-emerald-100/90 dark:border-emerald-800/60 dark:!bg-emerald-950/60 px-3 py-2 text-center shadow-xs">
                <strong className="block text-lg sm:text-xl font-black text-emerald-800 dark:text-emerald-200">
                  {logHadirCount}
                </strong>
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300">Tepat Waktu</span>
              </div>
              <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs !bg-amber-100/90 dark:border-emerald-800/60 dark:!bg-amber-950/60 px-3 py-2 text-center shadow-xs">
                <strong className="block text-lg sm:text-xl font-black text-amber-800 dark:text-amber-200">
                  {logTerlambatCount}
                </strong>
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300">Terlambat</span>
              </div>
              <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs !bg-sky-100/90 dark:border-emerald-800/60 dark:!bg-sky-950/60 px-3 py-2 text-center shadow-xs">
                <strong className="block text-lg sm:text-xl font-black text-sky-800 dark:text-sky-200">
                  {logIzinSakitCount}
                </strong>
                <span className="text-[10px] font-bold text-sky-800 dark:text-sky-300">Izin / Sakit</span>
              </div>
            </div>
 </div>
 </div>

 {/* ── 4 HEROUI STANDARD KPI CARDS ──────────────────────────── */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
 <KpiStatCard
 title="Total Riwayat Log"
 value={logTotalCount}
 description="Semua Data"
 badge={teacherLogMonth === 'semua' ? 'Semua Bulan' : teacherLogMonth}
 icon={Clock}
 tone="emerald"
 ctaText="Filter"
 onClick={() => setTeacherLogStatus('semua')}
 className={teacherLogStatus === 'semua' ? 'ring-2 ring-emerald-500/50 shadow-md' : ''}
 />
 <KpiStatCard
 title="Tepat Waktu"
 value={logHadirCount}
 description="Hadir On-Time"
 badge={`${logDisiplinRate}% Ketepatan`}
 icon={CheckCircle2}
 tone="teal"
 ctaText="Filter"
 onClick={() => setTeacherLogStatus('Hadir')}
 className={teacherLogStatus === 'Hadir' ? 'ring-2 ring-teal-500/50 shadow-md' : ''}
 />
 <KpiStatCard
 title="Terlambat Masuk"
 value={logTerlambatCount}
 description="Disiplin Jam"
 badge="Perlu Evaluasi"
 icon={AlertCircle}
 tone="amber"
 ctaText="Filter"
 onClick={() => setTeacherLogStatus('Terlambat')}
 className={teacherLogStatus === 'Terlambat' ? 'ring-2 ring-amber-500/50 shadow-md' : ''}
 />
 <KpiStatCard
 title="Izin & Sakit"
 value={logIzinSakitCount}
 description="Tervalidasi"
 badge="Keterangan Resmi"
 icon={FileText}
 tone="sky"
 ctaText="Filter"
 onClick={() => setTeacherLogStatus(teacherLogStatus === 'Izin' ? 'Sakit' : 'Izin')}
 className={teacherLogStatus === 'Izin' || teacherLogStatus === 'Sakit' ? 'ring-2 ring-sky-500/50 shadow-md' : ''}
 />
 </div>

            {/* ── HEROUI EMERALD DATATABLE CONTAINER ──────────────────── */}
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-sm dark:bg-[#1B2433]">
 {/* Toolbar Header */}
 <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-500/10 px-5 py-4">
 <div className="flex items-center gap-3">
 <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
 <Clock className="size-5" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">Log Presensi Guru</h3>
 <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/90 dark:bg-amber-950/70 border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800 dark:text-amber-300">
 <Lock className="size-3" /> Read Only
 </span>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Riwayat Kehadiran Resmi Pengajar: <strong className="text-slate-700 dark:text-slate-200">{teacherName}</strong>
 </p>
 </div>
 </div>

 <PageToolbarActions
   onExport={() => handleProcessExport()}
   exportLabel="Export PDF"
   showLabel
 />
 </div>

 {/* Filter Bar */}
 <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/60 dark:bg-slate-900/40 px-5 py-3">
 <div className="flex flex-wrap items-center gap-2">
 <CustomSelect
 value={teacherLogMonth}
 onChange={(e) => setTeacherLogMonth(e.target.value)}
 className="h-10 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white px-3 text-xs font-bold text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-900 dark:text-slate-100"
 >
 <option value="semua">Semua Bulan</option>
 {Array.from({ length: 6 }).map((_, i) => {
 const d = new Date()
 d.setMonth(d.getMonth() - i)
 const val = d.toISOString().slice(0, 7)
 const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
 return <option key={val} value={val}>{label}</option>
 })}
 </CustomSelect>

 <div className="flex items-center rounded-xl bg-white dark:bg-slate-900 p-1 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
 {['semua', 'Hadir', 'Terlambat', 'Izin', 'Sakit'].map((st) => (
 <button
 key={st}
 type="button"
 onClick={() => setTeacherLogStatus(st)}
 className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${teacherLogStatus === st
 ? 'bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white shadow-xs'
 : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
 }`}
 >
 {st === 'semua' ? 'Semua' : st}
 </button>
 ))}
 </div>
 </div>
 <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
 Menampilkan <strong className="text-emerald-700 dark:text-emerald-300 font-extrabold">{filteredTeacherLogs.length}</strong> catatan kehadiran
 </div>
 </div>

 {/* Datatable */}
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 <th className="px-4 py-3.5 font-extrabold">Tanggal &amp; Hari</th>
 <th className="px-4 py-3.5 font-extrabold">Jam Masuk</th>
 <th className="px-4 py-3.5 font-extrabold">Jam Pulang</th>
 <th className="px-4 py-3.5 font-extrabold">Durasi Kerja</th>
 <th className="px-4 py-3.5 font-extrabold">Status Kehadiran</th>
 <th className="px-4 py-3.5 font-extrabold">Metode &amp; Perangkat</th>
 <th className="px-4 py-3.5 font-extrabold text-center">Aksi</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {filteredTeacherLogs.map((log) => (
 <tr key={log.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition">
 <td className="p-3.5 font-bold text-slate-900 dark:text-white">
 {log.date}
 <span className="block text-[10px] text-slate-400 font-normal">{log.day}</span>
 </td>
 <td className="p-3.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">
 {log.check_in ? `${log.check_in} WIB` : '-'}
 </td>
 <td className="p-3.5 font-mono font-bold text-slate-700 dark:text-slate-300">
 {log.check_out ? `${log.check_out} WIB` : '-'}
 </td>
 <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300 font-semibold">
 {log.duration || '-'}
 </td>
 <td className="p-3.5">
 <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 font-extrabold text-[10px] rounded-full border ${log.status === 'Hadir' ? 'bg-emerald-100 text-emerald-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60' :
 log.status === 'Terlambat' ? 'bg-amber-100 text-amber-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950 dark:text-amber-300 dark:border-emerald-800/60' :
 log.status === 'Izin' ? 'bg-blue-100 text-blue-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-blue-950 dark:text-blue-300 dark:border-emerald-800/60' :
 log.status === 'Sakit' ? 'bg-purple-100 text-purple-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-purple-950 dark:text-purple-300 dark:border-emerald-800/60' :
 'bg-slate-100 text-slate-800 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/80'
 }`}>
 {log.status === 'Hadir' && <CheckCircle2 className="size-3" />}
 {log.status === 'Terlambat' && <Clock className="size-3" />}
 {log.status === 'Izin' && <Info className="size-3" />}
 {log.status === 'Sakit' && <Heart className="size-3" />}
 {log.status}
 </span>
 </td>
 <td className="p-3.5">
 <span className="font-semibold text-slate-800 dark:text-slate-200">{log.method || '-'}</span>
 <span className="block text-[10px] text-slate-400">{log.device || '-'}</span>
 </td>
 <td className="p-3.5 text-center">
 <button
 type="button"
 onClick={() => {
 setDetailData({
 title: `Log Absensi: ${log.date}`,
 category: 'Log Absensi Guru (Read-Only)',
 items: [
 { label: 'Tanggal', value: log.date },
 { label: 'Hari', value: log.day },
 { label: 'Jam Masuk', value: log.check_in || '-' },
 { label: 'Jam Pulang', value: log.check_out || '-' },
 { label: 'Durasi', value: log.duration || '-' },
 { label: 'Status', value: log.status || '-' },
 { label: 'Metode', value: log.method || '-' },
 { label: 'Lokasi', value: log.location || '-' },
 ]
 })
 setShowDetailModal(true)
 }}
 className="inline-flex items-center gap-1.5 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700 transition hover:bg-sky-100 dark:border-emerald-800/60 dark:bg-sky-950/60 dark:text-sky-300 shadow-xs cursor-pointer active:scale-95 mx-auto"
 >
 <Eye className="size-3.5" /> Detail
 </button>
 </td>
 </tr>
 ))}
 {filteredTeacherLogs.length === 0 && (
 <tr>
 <td colSpan={7} className="p-10 text-center text-slate-400">
 <Clock className="mx-auto mb-2 size-8 text-slate-300 dark:text-slate-600" />
 Tidak ada catatan absensi untuk periode atau filter yang dipilih.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>

 {/* Datatable Footer */}
 <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-emerald-200/80 dark:border-emerald-800/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/40 px-5 py-3.5">
 <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
 Total <strong className="text-emerald-700 dark:text-emerald-400">{filteredTeacherLogs.length}</strong> data terekam pada server
 </span>
 <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
 Sinkronisasi Otomatis Mesin Absensi &amp; Mobile App
 </span>
 </div>
 </div>
 </div>
 )
 })()}

 {/* TAB 10: JADWAL LENGKAP (READ ONLY) */}
 {activeTab === 'jadwal-lengkap' && (() => {
 const rawPool = (allTeacherSchedules && allTeacherSchedules.length > 0)
 ? allTeacherSchedules
 : (schedules && schedules.length > 0 ? schedules : [])

 const classFilteredPool = (selectedClass && selectedClass !== 'all')
 ? rawPool.filter((s) => {
 const cId = s.kelas_id || s.class_id || s.kelas?.id || s.class?.id
 return String(cId) === String(selectedClass)
 })
 : rawPool

 // Strict: jika rombel spesifik dipilih, gunakan classFilteredPool saja (meski kosong)
 // Jangan fallback ke semua jadwal — itu yang menyebabkan semua rombel tampil saat filter aktif
 const pool = (selectedClass && selectedClass !== 'all')
 ? classFilteredPool
 : (rawPool.length > 0 ? rawPool : (schedules && schedules.length > 0 ? schedules : []))

 const daysList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

 const dayMapping = {
 1: 'Senin', 2: 'Selasa', 3: 'Rabu', 4: 'Kamis', 5: 'Jumat', 6: 'Sabtu', 7: 'Ahad'
 }

 const getDayStr = (s) => s.day_name || s.nama_hari || dayMapping[s.day_of_week] || 'Senin'

 const sortedPool = [...pool].sort((a, b) => {
 const dayOrder = { 'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6, 'Ahad': 7 }
 const da = dayOrder[getDayStr(a)] || 99
 const db = dayOrder[getDayStr(b)] || 99
 if (da !== db) return da - db
 return (a.start_time || a.time_start || '').localeCompare(b.start_time || b.time_start || '')
 })

 const totalSesi = pool.length
 const totalMapel = new Set(pool.map(getScheduleSubject)).size
 const totalRombel = new Set(pool.map((s) => s.kelas?.name || s.kelas?.nama_kelas || s.kelas_id)).size

 return (
 <div className="space-y-5">
 {/* ── MODERN HERO CARD BANNER JADWAL LENGKAP ────────────────── */}
 <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 !bg-[#D5F2E3] p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:!bg-[#112a22] print:hidden">

 <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
 <div className="flex items-start gap-4">
 <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">

            <CalendarDays className="size-6 sm:size-7 text-white" />
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold bg-emerald-600 text-white shadow-xs border border-emerald-500/40 dark:border-emerald-600/50">

                  <Sparkles className="size-3 animate-pulse text-white" />
 Master Kalender &amp; Schedule Matrix
 </span>
 <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 dark:bg-emerald-950/80 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
 Tahun Ajaran {selectedAcademicYear || '2026/2027'}
 </span>
 <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 dark:bg-emerald-950/80 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80">
 Semester {selectedSemester || 'Ganjil'}
 </span>
 </div>
 <h2 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
 Jadwal Pelajaran Lengkap Sekolah
 </h2>
 <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 w-full">
 Tinjauan komprehensif seluruh persebaran jam KBM guru — Tampilan fleksibel filter harian, matriks mingguan, estimasi beban bulanan, dan tabel semesteran terintegrasi.
 </p>
 </div>
 </div>

 {/* Summary Metric Badges */}
            <div className="grid grid-cols-3 gap-2.5 sm:min-w-[340px]">
              <div className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm !bg-emerald-100/90 dark:border-emerald-800/60 dark:!bg-emerald-950/60 px-3.5 py-2.5 text-center shadow-xs">
                <strong className="block text-xl font-black text-emerald-800 dark:text-emerald-200">
                  {totalSesi}
                </strong>
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300">Total Sesi KBM</span>
              </div>
              <div className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm !bg-teal-100/90 dark:border-emerald-800/60 dark:!bg-teal-950/60 px-3.5 py-2.5 text-center shadow-xs">
                <strong className="block text-xl font-black text-teal-800 dark:text-teal-200">
                  {totalMapel}
                </strong>
                <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300">Mata Pelajaran</span>
              </div>
              <div className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm !bg-indigo-100/90 dark:border-emerald-800/60 dark:!bg-indigo-950/60 px-3.5 py-2.5 text-center shadow-xs">
                <strong className="block text-xl font-black text-indigo-800 dark:text-indigo-200">
                  {totalRombel || (classes.length > 0 ? classes.length : 1)}
                </strong>
                <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-300">Rombel Kelas</span>
              </div>
            </div>
 </div>
 </div>

 {/* ── DATATABLE & MATRIX CONTAINER ──────────────────────────── */}
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm bg-white shadow-sm dark:bg-[#1B2433]">
 {/* Toolbar Header */}
 <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-800/80 bg-emerald-500/10 px-4 py-3 sm:px-5">
 <div className="flex items-center gap-2.5">
 <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl !bg-emerald-600 !text-white shadow-md border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
 <CalendarDays className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Matriks &amp; Kalender Jadwal</h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">Mode Tinjauan: <span className="font-bold text-emerald-700 dark:text-emerald-400">{jadwalLengkapTab}</span></p>
 </div>
 </div>

 <div className="flex items-center gap-1.5 rounded-xl bg-emerald-100/60 dark:bg-slate-800/80 p-1 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80/80">
 {['Hari', 'Minggu', 'Bulan', 'Semester'].map((subt) => (
 <button
 key={subt}
 onClick={() => setJadwalLengkapTab(subt)}
 className={`rounded-xl px-3.5 py-1.5 text-xs font-extrabold transition-all duration-150 cursor-pointer ${jadwalLengkapTab === subt
 ? 'bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white shadow-sm ring-1 ring-emerald-300/40'
 : 'text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-400'
 }`}
 >
 {subt}
 </button>
 ))}
 </div>
 </div>

 {/* Sub Tab Views */}
 <div className="p-4 sm:p-5 space-y-4">
 {/* 1. SUB-TAB HARI */}
 {jadwalLengkapTab === 'Hari' && (
 <div className="space-y-4">
 <div className="flex flex-wrap items-center justify-between gap-2">
 <p className="text-xs text-slate-500 font-semibold">Filter Berdasarkan Hari Pelajaran:</p>
 <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
 {['Semua', ...daysList].map((d) => (
 <button
 key={d}
 type="button"
 onClick={() => setSelectedHariFilter(d)}
 className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all duration-150 cursor-pointer ${selectedHariFilter === d
 ? 'bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white shadow-sm ring-1 ring-emerald-300/40'
 : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
 }`}
 >
 {d}
 </button>
 ))}
 </div>
 </div>

 {(() => {
 const filtered = selectedHariFilter === 'Semua'
 ? sortedPool
 : sortedPool.filter((s) => getDayStr(s).toLowerCase() === selectedHariFilter.toLowerCase())

 if (filtered.length === 0) {
 return (
 <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm text-slate-400 text-xs">
 Tidak ada jadwal mengajar pada hari {selectedHariFilter}.
 </div>
 )
 }

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {filtered.map((s, i) => (
 <div key={s.id || i} className="p-4 rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm bg-white dark:bg-slate-900/60 flex justify-between items-center text-xs shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:shadow-md transition">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <span className="px-2.5 py-0.5 bg-emerald-100 text-[#059669] dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-[10px] rounded-md">
 {getDayStr(s)}
 </span>
 <span className="font-mono text-slate-600 dark:text-slate-300 font-bold">
 {(s.start_time || s.time_start || '07:00').slice(0, 5)} - {(s.end_time || s.time_end || '08:20').slice(0, 5)} WIB
 </span>
 </div>
 <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
 {s.subject?.name || s.subject_name || 'Mata Pelajaran'}
 </h4>
 <p className="text-slate-500 dark:text-slate-400 text-xs">
 Kelas: <strong className="text-slate-700 dark:text-slate-200">{s.kelas?.name || s.kelas?.nama_kelas || selectedClassName || 'Kelas'}</strong> • Ruang: {s.kelas?.ruangan || s.room_name || '-'}
 </p>
 </div>
 {(() => {
 const sStatus = getScheduleStatus(s)
 return (
 <button
 type="button"
 onClick={() => openPresensiModal(s)}
 disabled={!sStatus.isActive}
 title={sStatus.isActive ? 'Presensi Sesi KBM' : `Presensi Tidak Aktif (${sStatus.label})`}
 className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition ${sStatus.isActive
 ? 'bg-emerald-50 hover:bg-emerald-100 text-[#059669] dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/80 border-emerald-200/80 dark:border-emerald-800/60 cursor-pointer'
 : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 border-emerald-200/80 dark:border-emerald-700/80 cursor-not-allowed opacity-60'
 }`}
 >
 {sStatus.isActive ? 'Presensi Sesi' : `Presensi (${sStatus.label})`}
 </button>
 )
 })()}
 </div>
 ))}
 </div>
 )
 })()}
 </div>
 )}

 {/* 2. SUB-TAB MINGGU: WEEKLY MASTER GRID MATRIX */}
 {jadwalLengkapTab === 'Minggu' && (
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <p className="text-xs text-slate-500 font-semibold">
 Matriks Jadwal Mengajar Mingguan Resmi (Senin s.d. Sabtu)
 </p>
 <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold bg-emerald-600 text-white shadow-xs border border-emerald-500/40 dark:border-emerald-600/50">
 Total: {sortedPool.length} Sesi KBM / Minggu
 </span>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
 {daysList.map((day) => {
 const daySchedules = sortedPool.filter(
 (s) => getDayStr(s).toLowerCase() === day.toLowerCase()
 )

 return (
 <div
 key={day}
 className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm bg-slate-50/60 dark:bg-slate-900/40 p-3.5 space-y-2.5 shadow-2xs"
 >
 <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/80 dark:border-emerald-800/60 pb-2">
 <div className="flex items-center gap-1.5">
 <CalendarDays className="w-4 h-4 text-emerald-600" />
 <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">{day}</h4>
 </div>
 <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${daySchedules.length > 0
 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
 : 'bg-slate-200 text-slate-500 dark:bg-sky-950/60 dark:text-sky-300'
 }`}>
 {daySchedules.length} Sesi
 </span>
 </div>

 {daySchedules.length === 0 ? (
 <p className="text-xs text-slate-400 text-center py-4 italic">
 Libur / Tidak ada KBM
 </p>
 ) : (
 <div className="space-y-2">
 {daySchedules.map((s, idx) => (
 <div
 key={s.id || idx}
 className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-emerald-200/60 dark:border-emerald-700/80/60 shadow-2xs space-y-1"
 >
 <div className="flex items-center justify-between text-[10px]">
 <span className="font-mono font-extrabold text-emerald-700 dark:text-emerald-400">
 {(s.start_time || s.time_start || '07:00').slice(0, 5)} - {(s.end_time || s.time_end || '08:20').slice(0, 5)} WIB
 </span>
 <span className="text-slate-400 font-medium">
 {s.kelas?.ruangan || s.room_name || 'R. Kelas'}
 </span>
 </div>
 <div className="font-extrabold text-xs text-slate-800 dark:text-white">
 {s.subject?.name || s.subject_name || 'Mapel'}
 </div>
 <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
 {s.kelas?.name || s.kelas?.nama_kelas || selectedClassName}
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 )
 })}
 </div>
 </div>
 )}

 {/* 3. SUB-TAB BULAN: MONTHLY WORKLOAD & ACADEMIC AGENDA */}
 {jadwalLengkapTab === 'Bulan' && (
 <div className="space-y-5">
 {/* KPI Cards Beban Bulanan */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
 <div className="p-4 rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm bg-white dark:bg-slate-900/60 shadow-xs">
 <span className="text-[10px] uppercase font-bold text-slate-400">Sesi Mengajar / Minggu</span>
 <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
 {sortedPool.length} Sesi
 </div>
 <span className="text-[10px] text-emerald-600 font-medium">Tatap muka terjadwal</span>
 </div>

 <div className="p-4 rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm bg-white dark:bg-slate-900/60 shadow-xs">
 <span className="text-[10px] uppercase font-bold text-slate-400">Estimasi Beban / Bulan</span>
 {(() => {
 const _now = new Date()
 const _firstDay = new Date(_now.getFullYear(), _now.getMonth(), 1).getDay()
 const _days = new Date(_now.getFullYear(), _now.getMonth() + 1, 0).getDate()
 const _weeksInMonth = Math.ceil((_days + _firstDay) / 7)
 return (
 <>
 <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
 {sortedPool.length * _weeksInMonth} Jam Pelajaran
 </div>
 <span className="text-[10px] text-slate-400 font-medium">
 {_weeksInMonth} pekan bulan {_now.toLocaleDateString('id-ID', { month: 'long' })}
 </span>
 </>
 )
 })()}
 </div>

 <div className="p-4 rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm bg-white dark:bg-slate-900/60 shadow-xs">
 <span className="text-[10px] uppercase font-bold text-slate-400">Jumlah Rombel Diampu</span>
 <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
 {new Set(sortedPool.map((s) => s.kelas?.name || s.kelas_id)).size} Kelas
 </div>
 <span className="text-[10px] text-slate-400 font-medium">Distribusi mengajar</span>
 </div>

 <div className="p-4 rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm bg-white dark:bg-slate-900/60 shadow-xs">
 <span className="text-[10px] uppercase font-bold text-slate-400">Mata Pelajaran Aktif</span>
 <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
 {new Set(sortedPool.map((s) => s.subject?.name || s.subject_id)).size} Mapel
 </div>
 <span className="text-[10px] text-slate-400 font-medium">Kurikulum resmi</span>
 </div>
 </div>

 {/* Kalender Agenda Sekolah PostgreSQL */}
 <div className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm bg-white dark:bg-slate-900/60 p-4 sm:p-5 space-y-3 shadow-xs">
 <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3">
 <div>
 <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
 <CalendarRange className="w-4 h-4 text-emerald-600" /> Kalender Agenda &amp; Kegiatan Akademik Sekolah
 </h4>
 <p className="text-xs text-slate-400">Data resmi kegiatan, KBM Ramadhan 1448 H, PTS/PAS &amp; Libur Sekolah dari PostgreSQL</p>
 </div>
 <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#059669] dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold">
 {academicCalendarEvents.length} Agenda Terjadwal
 </span>
 </div>

 <div className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 max-h-96 overflow-y-auto pr-1">
 {academicCalendarEvents.length === 0 ? (
 <p className="text-xs text-slate-400 text-center py-6">
 Belum ada agenda akademik sekolah yang tercatat bulan ini.
 </p>
 ) : (
 academicCalendarEvents.map((ev, idx) => (
 <div key={ev.id || idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition">
 <div className="space-y-0.5">
 <div className="flex items-center gap-2">
 <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
 {ev.data_tambahan?.event_category || ev.data_tambahan?.kategori || 'Akademik'}
 </span>
 <h5 className="font-bold text-xs text-slate-900 dark:text-white">
 {ev.judul_pengumuman}
 </h5>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
 {ev.isi_pengumuman || ev.data_tambahan?.ringkasan || '-'}
 </p>
 </div>
 <span className="font-mono text-[10px] font-extrabold text-indigo-700 dark:text-indigo-400 whitespace-nowrap">
 {ev.mulai_tampil ? new Date(ev.mulai_tampil).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
 {ev.selesai_tampil ? ` s/d ${new Date(ev.selesai_tampil).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
 </span>
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 )}

 {/* 4. SUB-TAB SEMESTER: 100% REAL POSTGRESQL DATA TABLE */}
 {jadwalLengkapTab === 'Semester' && (
 <div className="space-y-3">
 <div className="flex items-center justify-between text-xs">
 <p className="text-slate-500 font-semibold">
 Tabel Distribusi Jam Mengajar Semester (PostgreSQL Active Schedules)
 </p>
 <span className="font-bold text-emerald-700 dark:text-emerald-400">
 {sortedPool.length} Jadwal Mengajar Terdaftar
 </span>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 <th className="px-4 py-3 font-extrabold">Hari</th>
 <th className="px-4 py-3 font-extrabold">Mata Pelajaran</th>
 <th className="px-4 py-3 font-extrabold">Jam Mengajar</th>
 <th className="px-4 py-3 font-extrabold">Kelas / Rombel</th>
 <th className="px-4 py-3 font-extrabold">Ruangan</th>
 <th className="px-4 py-3 font-extrabold text-center">Beban (JP)</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 font-medium">
 {sortedPool.length === 0 ? (
 <tr>
 <td colSpan={6} className="p-8 text-center text-slate-400">
 Belum ada jadwal semester yang terdaftar di sistem.
 </td>
 </tr>
 ) : (
 sortedPool.map((item, idx) => (
 <tr key={item.id || idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition">
 <td className="p-3 font-bold text-emerald-700 dark:text-emerald-400">
 {getDayStr(item)}
 </td>
 <td className="p-3 font-bold text-slate-900 dark:text-white">
 {item.subject?.name || item.subject_name || 'Mata Pelajaran'}
 {item.subject?.code && (
 <span className="block text-[10px] font-normal text-slate-400">
 {item.subject.code}
 </span>
 )}
 </td>
 <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">
 {(item.start_time || item.time_start || '07:00').slice(0, 5)} - {(item.end_time || item.time_end || '08:20').slice(0, 5)} WIB
 </td>
 <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
 {item.kelas?.name || item.kelas?.nama_kelas || selectedClassName}
 </td>
 <td className="p-3 text-slate-500">
 {item.kelas?.ruangan || item.room_name || '-'}
 </td>
 <td className="p-3 text-center">
 <span className="px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
 {item.subject?.jam_pelajaran ? `${item.subject.jam_pelajaran} JP` : '-'}
 </span>
 </td>
 </tr>
 ))
 )}
 </tbody>
 {sortedPool.length > 0 && (
 <tfoot className="bg-emerald-50/50 dark:bg-slate-800/60 font-bold text-xs border-t border-emerald-200/80 dark:border-emerald-800/80">
 <tr>
 <td colSpan={3} className="p-3 text-slate-700 dark:text-slate-300">
 Total Beban Mengajar Semester: {sortedPool.length} Sesi Terjadwal
 </td>
 <td colSpan={3} className="p-3 text-right text-emerald-700 dark:text-emerald-400 font-extrabold">
 {new Set(sortedPool.map((s) => s.kelas?.name || s.kelas_id)).size} Rombel Kelas Diampu
 </td>
 </tr>
 </tfoot>
 )}
 </table>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 )
 })()}

 {/* TAB CHAT: KOMUNIKASI ORANG TUA */}
 {activeTab === 'chat' && (
 <ChatGuruWorkspace mode="teacher" />
 )}
 </main>
 </div>

 {/* ── COMMAND PALETTE MODAL (CTRL + K) ───────────────────────────────── */}
 <AppModal
 isOpen={showCommandPalette}
 onClose={() => setShowCommandPalette(false)}
 zIndex={100}
 maxWidth="max-w-xl"
 bodyClassName="p-4 space-y-3"
 >
 <div className="flex items-center gap-3 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3">
 <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 autoFocus
 value={commandQuery}
 onChange={(e) => setCommandQuery(e.target.value)}
 placeholder="Cari siswa, kelas, materi, atau navigasi workspace (Ctrl + K)..."
 className="w-full text-sm font-semibold bg-transparent outline-none text-slate-900 dark:text-white"
 />
 <button type="button" onClick={() => setShowCommandPalette(false)} className="text-slate-400 hover:text-slate-600">
 <X className="w-5 h-5" />
 </button>
 </div>

 <div className="space-y-1 max-h-72 overflow-y-auto text-xs">
 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2">Navigasi Workspace</span>
 {cardModulesList.map((mod) => (
 <button
 key={mod.id}
 type="button"
 onClick={() => {
 changeTab(mod.id)
 setShowCommandPalette(false)
 }}
 className="w-full text-left flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
 >
 <span className="flex items-center gap-2 font-bold">
 <mod.icon className="w-4 h-4 text-emerald-600" />
 {mod.title}
 </span>
 <span className="text-[10px] text-slate-400 font-mono">Buka Modul →</span>
 </button>
 ))}
 </div>
 </AppModal>

 <AppModal
 isOpen={showQrCamera}
 onClose={closeQrCamera}
 zIndex={90}
 maxWidth="max-w-xl"
 title="Pemindai Kamera Web Live"
 description="Mode: KEDATANGAN"
 icon={Camera}
 bodyClassName="space-y-4 p-6"
 footer={
 <div className="flex w-full items-center justify-between gap-3">
 <button type="button" onClick={qrCameraActive ? stopQrCamera : openQrCamera} className="flex items-center gap-1.5 rounded-xl border border-slate-300/80 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 shadow-xs cursor-pointer">{qrCameraActive ? <><CameraOff className="h-3.5 w-3.5 text-rose-500" /> Matikan Kamera</> : <><Camera className="h-3.5 w-3.5 text-emerald-500" /> Nyalakan Ulang Kamera</>}</button>
 <button type="button" onClick={closeQrCamera} className="rounded-xl bg-sky-50 border border-sky-200/80 px-4 py-2 text-xs font-bold text-sky-700 hover:bg-slate-300 dark:bg-emerald-950/60 dark:text-emerald-300">Tutup Window</button>
 </div>
 }
 >
 <div className="relative aspect-video w-full overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm bg-black shadow-inner dark:border-emerald-800/60">
 <video ref={qrVideoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
 {!qrCameraActive && !qrCameraError && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900/80 text-white"><RefreshCw className="h-8 w-8 animate-spin text-emerald-400" /><p className="text-xs font-semibold">Menghubungkan ke kamera...</p></div>}

 {/* Target Viewfinder Overlay Tailored to Student ID Card QR Code Size */}
 {qrCameraActive && (
 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
 <div className="w-48 h-48 sm:w-56 sm:h-56 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
 {/* Corner Brackets */}
 <div className="absolute -top-1.5 -left-1.5 w-6 h-6 border-t-4 border-l-4 border-slate-400 rounded-tl-lg" />
 <div className="absolute -top-1.5 -right-1.5 w-6 h-6 border-t-4 border-r-4 border-slate-400 rounded-tr-lg" />
 <div className="absolute -bottom-1.5 -left-1.5 w-6 h-6 border-b-4 border-l-4 border-slate-400 rounded-bl-lg" />
 <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 border-b-4 border-r-4 border-slate-400 rounded-br-lg" />
 {/* Laser Beam */}
 <div className="w-full h-0.5 bg-white dark:bg-[#1B2433] shadow-[0_0_10px_#10b981] animate-pulse absolute top-1/2 -translate-y-1/2" />
 </div>
 </div>
 )}
 </div>

 {qrCameraErrorInfo ? (
 <div className={`rounded-xl border p-4 text-xs ${qrCameraErrorInfo.actionType === 'notice'
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/80 text-amber-900 dark:border-emerald-800/60 dark:bg-amber-950/30 dark:text-amber-200'
 : 'border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/80 text-rose-900 dark:border-emerald-800/60 dark:bg-rose-950/30 dark:text-rose-200'
 }`}>
 <div className="flex items-start gap-3">
 <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl font-bold ${qrCameraErrorInfo.actionType === 'notice'
 ? 'bg-amber-200/80 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
 : 'bg-rose-200/80 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
 }`}>
 !
 </div>
 <div className="min-w-0 flex-1 space-y-1.5">
 <p className="font-extrabold text-sm">{qrCameraErrorInfo.title}</p>
 <p className="text-xs leading-relaxed opacity-90">{qrCameraErrorInfo.message}</p>
 {qrCameraErrorInfo.instructions?.length > 0 && (
 <div className="mt-2 space-y-1 rounded-xl bg-white/70 p-2.5 text-xs font-medium dark:bg-slate-800/80 border border-emerald-200/80 dark:border-emerald-800/60">
 <p className="font-bold uppercase tracking-wider text-[10px] opacity-75">Panduan Penyelesaian:</p>
 <ol className="list-decimal pl-4 space-y-1">
 {qrCameraErrorInfo.instructions.map((step, idx) => (
 <li key={idx} className="leading-normal">{step}</li>
 ))}
 </ol>
 </div>
 )}
 {qrCameraErrorInfo.actionType !== 'notice' && (
 <div className="pt-2">
 <button
 type="button"
 onClick={openQrCamera}
 className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow transition border border-emerald-200/80 dark:border-emerald-800/60 h-9 text-sm font-medium"
 >
 <RefreshCw className="h-3 w-3" /> Coba Nyalakan Ulang Kamera
 </button>
 </div>
 )}
 </div>
 </div>
 </div>
 ) : qrCameraError ? (
 <div className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:border-emerald-800/60 dark:bg-rose-950/30 dark:text-rose-300">
 {qrCameraError}
 </div>
 ) : null}

 <form onSubmit={handleCardScan} className="space-y-3 pt-2">
 <label className="block text-xs font-semibold uppercase text-slate-500">Input / Hasil Pindai Kode Kartu</label>
 <div className="flex flex-col gap-2 sm:flex-row"><input ref={scanInputRef} value={scanInput} onChange={(event) => setScanInput(event.target.value)} autoFocus autoComplete="off" placeholder="Hasil scan QR / Ketik nomor kartu..." className="w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 shadow-xs bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:bg-white dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white" /><button type="submit" disabled={!scanInput.trim() || scanProcessing} className="whitespace-nowrap rounded-lg bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow disabled:opacity-50 border border-emerald-200/80 dark:border-emerald-800/60 h-9">{scanProcessing ? 'Proses...' : 'Proses Absen'}</button></div>
 </form>
 </AppModal>

 <AppModal
 isOpen={showAttendanceMethodModal}
 onClose={() => setShowAttendanceMethodModal(false)}
 zIndex={70}
 maxWidth="max-w-4xl"
 title={selectedMethod === 'rollcall' ? 'Checklist Kehadiran Siswa' : selectedMethod === 'qr' ? 'Scan QR Code Kartu Siswa' : 'Identifikasi RFID Kartu Siswa'}
 description={`${selectedClassName} • ${getScheduleSubject(getCurrentSchedule() || {})} • Jam Pelajaran: ${getScheduleLessonHours(getCurrentSchedule())} • Waktu Sekarang: ${formattedLiveTime}`}
 icon={selectedMethod === 'rollcall' ? UserCheck : selectedMethod === 'qr' ? QrCode : Wifi}
 bodyClassName="p-4 sm:p-5"
 footer={
 <>
 <button type="button" onClick={() => setShowAttendanceMethodModal(false)} className="h-9 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs px-4 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-emerald-700/80 dark:text-slate-300 dark:hover:bg-slate-800">Tutup</button>
 <button type="button" onClick={handleSaveAttendance} className="flex h-9 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-xs font-bold text-white transition border border-emerald-200/80 dark:border-emerald-800/60 text-sm font-medium"><Save className="h-4 w-4" /> Simpan Presensi</button>
 </>
 }
 >
 {selectedMethod === 'rollcall' ? (
 <div className="space-y-4">
 <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm bg-emerald-50/60 p-3 dark:border-emerald-800/60 dark:bg-emerald-950/20">
 <div>
 <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">{students.filter((student) => attendanceData[student.id]?.status === 'Hadir').length} dari {students.length} siswa hadir</p>
 <p className="mt-0.5 text-xs text-slate-500">Rombel: <strong>{selectedClassName}</strong> • {getScheduleSubject(getCurrentSchedule() || {})}</p>
 </div>
 <div className="flex items-center gap-2 flex-wrap">
 <div className="inline-flex items-center gap-1.5 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs bg-white px-3 py-2 text-xs font-bold text-emerald-800 shadow-xs dark:border-emerald-800/60 dark:bg-slate-800 dark:text-emerald-200">
 <Filter className="h-3.5 w-3.5 text-emerald-600" />
 <span className="text-xs text-slate-400 font-medium">Rombel:</span>
 <CustomSelect
 value={selectedClass}
 onChange={(e) => handleModalClassChange(e.target.value)}
 className="bg-transparent text-xs font-extrabold text-emerald-900 dark:text-emerald-100 outline-none cursor-pointer"
 >
 <option value="all" className="dark:bg-slate-900 text-slate-900 dark:text-white">
 Semua Rombel
 </option>
 {classes.map((c) => (
 <option key={c.id} value={c.id} className="dark:bg-slate-900 text-slate-900 dark:text-white">
 {c.nama_kelas || c.name}
 </option>
 ))}
 </CustomSelect>
 </div>
 <button type="button" onClick={markAllStudentsPresent} className="h-9 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-emerald-50 hover:bg-emerald-100 px-4 text-xs font-bold text-emerald-800 transition focus-visible:ring-3 focus-visible:ring-emerald-700/20 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-xs cursor-pointer">Centang Semua Hadir</button>
 </div>
 </div>
 {students.length === 0 ? (
 <div className="rounded-xl border border-dashed border-emerald-300 px-5 py-12 text-center dark:border-emerald-700/80"><Users className="mx-auto h-8 w-8 text-slate-300" /><h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-white">Siswa belum tersedia</h3><p className="mt-1 text-xs text-slate-500">Pilih kelas dan jadwal mengajar terlebih dahulu.</p></div>
 ) : (
 <div className="space-y-2">
 {students.map((student, index) => {
 const status = attendanceData[student.id]?.status || 'Belum Dicatat'
 return <article key={student.id} className="flex flex-col gap-3 rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm p-3 transition hover:border-emerald-300 dark:hover:border-emerald-700/80 dark:border-emerald-800/60 sm:flex-row sm:items-center">
 <div className="flex min-w-0 flex-1 items-center gap-3">
 <input type="checkbox" checked={status === 'Hadir'} onChange={(event) => toggleStudentChecklist(student, event.target.checked)} aria-label={`Tandai ${student.nama_lengkap} hadir`} className="h-5 w-5 shrink-0 cursor-pointer accent-emerald-700" />
 <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-extrabold text-slate-500 dark:bg-slate-800">{index + 1}</span>
 <div className="min-w-0"><h4 className=" text-sm font-bold text-slate-900 dark:text-white">{student.nama_lengkap}</h4><p className="truncate text-xs text-slate-500">NIS/NISN: {student.nis || student.nisn || 'Belum tersedia'}</p></div>
 </div>
 <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">{['Belum Dicatat', 'Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alpha'].map((option) => <button key={option} type="button" onClick={() => markStudentAttendance(student, 'Checklist Guru', option)} className={`h-9 shrink-0 rounded-lg px-2.5 text-[10px] font-bold transition ${status === option ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-emerald-950/60 dark:text-emerald-300'}`}>{option}</button>)}</div>
 </article>
 })}
 </div>
 )}
 </div>
 ) : (
 <div className="mx-auto max-w-xl space-y-5 py-2 sm:py-6">
 <div className={`mx-auto flex h-28 w-28 items-center justify-center rounded-xl border ${selectedMethod === 'qr' ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50 text-sky-600 dark:border-emerald-800/60 dark:bg-sky-950/30' : 'border-emerald-200/80 dark:border-emerald-800/60 bg-violet-50 text-violet-600 dark:border-emerald-800/60 dark:bg-violet-950/30'}`}>
 {selectedMethod === 'qr' ? <QrCode className="h-14 w-14" /> : <Wifi className="h-14 w-14" />}
 </div>
 <div className="text-center"><h3 className="text-base font-extrabold text-slate-900 dark:text-white">{selectedMethod === 'qr' ? 'Arahkan QR kartu ke scanner' : 'Tempelkan kartu pada reader RFID'}</h3><p className="mt-1 text-xs leading-5 text-slate-500">Kode akan diproses otomatis saat reader mengirimkan tombol Enter.</p></div>
 <form onSubmit={handleCardScan} className="space-y-3">
 <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">Kode kartu siswa</span><div className="flex gap-2"><div className="relative min-w-0 flex-1">{selectedMethod === 'qr' ? <QrCode className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /> : <Wifi className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />}<input ref={scanInputRef} value={scanInput} onChange={(event) => setScanInput(event.target.value)} disabled={scanProcessing} autoFocus autoComplete="off" placeholder={`Menunggu ${selectedMethod === 'qr' ? 'QR scanner' : 'RFID reader'}...`} className="h-9 w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 shadow-xs bg-white pl-10 pr-4 text-sm font-semibold outline-none transition focus:border-emerald-700/80 focus:ring-3 focus:ring-emerald-700/15 disabled:cursor-wait disabled:opacity-60 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white" /></div><button type="submit" disabled={!scanInput.trim() || scanProcessing} className="h-9 min-w-24 rounded-lg bg-emerald-600 px-4 text-xs font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50 border border-emerald-200/80 dark:border-emerald-800/60 text-sm font-medium">{scanProcessing ? 'Memproses...' : 'Identifikasi'}</button></div></label>
 </form>
 {lastScannedResult && <div className={`flex items-center gap-3 rounded-xl border p-4 ${lastScannedResult.error ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 dark:border-emerald-800/60 dark:bg-rose-950/30' : 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50 dark:border-emerald-800/60 dark:bg-emerald-950/30'}`} role="status">{lastScannedResult.error ? <AlertCircle className="h-6 w-6 shrink-0 text-rose-600" /> : <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />}<div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900 dark:text-white">{lastScannedResult.error ? 'Kartu tidak dikenali' : (lastScannedResult.student?.nama_lengkap || lastScannedResult.student?.full_name)}</p><p className="mt-0.5 text-xs text-slate-500">{lastScannedResult.error ? lastScannedResult.message : `${lastScannedResult.method}${lastScannedResult.time ? ` • ${lastScannedResult.time} WIB` : ''}`}</p></div></div>}
 </div>
 )}
 </AppModal>

 {/* MODAL DETAIL DATA PRESENSI PERORANGAN SISWA (STYLE LEMBAR TAHFIZH WORKSPACE) */}
 {showStudentAttendanceDetailModal && selectedStudentAttendanceDetail && (() => {
 const student = selectedStudentAttendanceDetail
 const curRecord = attendanceData[student.id] || { status: 'Belum Dicatat', method: 'Belum dicatat', check_in_time: '-' }
 const allHistory = getStudentAttendanceHistory(student)
 const todayStr = attendanceDateFilter || new Date().toISOString().split('T')[0]

 const harianList = getFilteredStudentAttendanceHistory(allHistory, 'harian', todayStr)
 const mingguanList = getFilteredStudentAttendanceHistory(allHistory, 'mingguan', todayStr)
 const bulananList = getFilteredStudentAttendanceHistory(allHistory, 'bulanan', todayStr)
 const semesterList = allHistory

 const periodCounts = {
 harian: harianList.length,
 mingguan: mingguanList.length,
 bulanan: bulananList.length,
 semester: semesterList.length,
 }

 const displayHistory = getFilteredStudentAttendanceHistory(allHistory, studentDetailPeriodFilter, todayStr)

 const hadirCount = displayHistory.filter((h) => h.status === 'Hadir').length
 const terlambatCount = displayHistory.filter((h) => h.status === 'Terlambat').length
 const izinSakitCount = displayHistory.filter((h) => ['Izin', 'Sakit'].includes(h.status)).length
 const alphaCount = displayHistory.filter((h) => h.status === 'Alpha').length
 const terlaksanaCount = displayHistory.filter((h) => h.status !== 'Belum Terlaksana').length
 const persentase = terlaksanaCount > 0 ? Math.round((hadirCount / terlaksanaCount) * 100) : 0

 const periodLabelMap = {
 harian: 'Harian (Hari Ini)',
 mingguan: 'Mingguan (Pekan Ini)',
 bulanan: 'Bulanan (Bulan Ini)',
 semester: `Semester (${semesterList.length} Sesi)`,
 }

 const periodDetailDesc = {
 harian: `Sesi KBM Hari Ini • ${todayStr}`,
 mingguan: `Pertemuan KBM Pekan Berjalan (${mingguanList.length} Sesi)`,
 bulanan: `Pertemuan KBM Bulan Berjalan (${bulananList.length} Sesi)`,
 semester: `Rekapitulasi Semester Berjalan (${semesterList.length} Sesi KBM)`,
 }

 const statusBadgeMap = {
 'Belum Dicatat': 'bg-slate-100 text-slate-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300',
 Hadir: 'bg-emerald-100 text-emerald-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950 dark:text-emerald-300',
 Terlambat: 'bg-amber-100 text-amber-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950 dark:text-amber-300',
 Izin: 'bg-sky-100 text-sky-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-sky-950 dark:text-sky-300',
 Sakit: 'bg-violet-100 text-violet-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-violet-950 dark:text-violet-300',
 Alpha: 'bg-rose-100 text-rose-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950 dark:text-rose-300',
 'Belum Terlaksana': 'bg-slate-50 text-slate-400 border-emerald-200/80 dark:bg-slate-800/40 dark:text-slate-500',
 }

 const activeSchedule = getCurrentSchedule() || presensiModalSchedule || {}
 const subjectName = activeSchedule?.subject?.name || activeSchedule?.subject?.nama_mapel || activeSchedule?.nama_mapel || 'Mata Pelajaran'

 return (
 <AppModal
 isOpen={true}
 onClose={() => {
 setShowStudentAttendanceDetailModal(false)
 setSelectedStudentAttendanceDetail(null)
 setStudentDetailSessions([])
 }}
 zIndex={70}
 maxWidth="max-w-4xl"
 title={student.nama_lengkap || student.full_name}
 badge="Lembar Presensi"
 description={`${student.nis || student.nisn || 'NIS belum tersedia'} · Rombel ${selectedClassName} · Mapel: ${subjectName}`}
 icon={UserCheck}
 subHeader={
 <div className="flex flex-wrap items-center justify-between gap-2 bg-emerald-50/90 dark:bg-emerald-950/40 border-b border-emerald-200/80 dark:border-emerald-800/60 px-5 sm:px-6 py-2.5">
 <div className="inline-flex rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white/80 p-1 dark:bg-slate-900">
 {[
 { id: 'harian', label: 'Harian', count: periodCounts.harian },
 { id: 'mingguan', label: 'Mingguan', count: periodCounts.mingguan },
 { id: 'bulanan', label: 'Bulanan', count: periodCounts.bulanan },
 { id: 'semester', label: 'Semester', count: periodCounts.semester },
 ].map((t) => {
 const isActive = studentDetailPeriodFilter === t.id
 return (
 <button
 key={t.id}
 type="button"
 onClick={() => {
 setStudentDetailPeriodFilter(t.id)
 setStudentDetailPage(1)
 }}
 className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${isActive
 ? 'bg-emerald-600 text-white shadow-sm'
 : 'text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-white'
 }`}
 >
 <span>{t.label}</span>
 <span className={`rounded-md px-1.5 py-0.2 text-[10px] font-extrabold ${isActive ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'}`}>
 {t.count}
 </span>
 </button>
 )
 })}
 </div>
 <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 truncate" title={periodDetailDesc[studentDetailPeriodFilter]}>
 {periodDetailDesc[studentDetailPeriodFilter]}
 </div>
 </div>
 }
 bodyClassName="p-4 sm:p-5"
 footer={
 <div className="flex w-full flex-wrap items-center justify-between gap-2">
 <button
 type="button"
 onClick={() => handlePrintSingleStudentAttendance(student, studentDetailPeriodFilter)}
 className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-emerald-50 px-4 text-xs font-bold text-emerald-800 shadow-sm transition hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900 cursor-pointer"
 >
 <Printer className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 <span>Cetak Lembar Presensi ({studentDetailPeriodFilter.toUpperCase()})</span>
 </button>

 <button
 type="button"
 onClick={() => {
 setShowStudentAttendanceDetailModal(false)
 setSelectedStudentAttendanceDetail(null)
 setStudentDetailSessions([])
 }}
 className="h-9 rounded-xl border border-slate-300 bg-slate-200 hover:bg-slate-300 px-5 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
 >
 Tutup Detail
 </button>
 </div>
 }
 >
 <div className="min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4">
 {loadingStudentDetailSessions && (
 <div className="flex items-center justify-center gap-2 rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-emerald-50/80 p-3 text-xs font-bold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300 animate-pulse">
 <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border border-emerald-200/80 dark:border-emerald-800/60 border-r-transparent dark:border-emerald-800/60"></span>
 <span>Memuat seluruh riwayat sesi presensi siswa...</span>
 </div>
 )}
 {/* Profil & Status Bar */}
 <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200/80 bg-slate-50/70 p-4 dark:border-emerald-700/80/80 dark:bg-slate-900/50">
 <div className="flex items-center gap-3.5">
 <Avatar size="lg" className="ring-2 ring-emerald-500/30 shrink-0">
 <AvatarFallback className="bg-emerald-100 font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs">
 {(student.nama_lengkap || student.full_name || 'S').slice(0, 2).toUpperCase()}
 </AvatarFallback>
 </Avatar>
 <div>
 <div className="flex items-center gap-2">
 <h4 className="text-sm font-black text-slate-900 dark:text-white">
 {student.nama_lengkap || student.full_name}
 </h4>
 <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
 {student.gender === 'L' || student.jenis_kelamin === 'L' ? 'Laki-laki' : (student.gender === 'P' || student.jenis_kelamin === 'P' ? 'Perempuan' : 'Santri')}
 </span>
 </div>
 <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
 NIS: <strong className="text-slate-700 dark:text-slate-200">{student.nis || '-'}</strong> · NISN: <strong className="text-slate-700 dark:text-slate-200">{student.nisn || '-'}</strong> · Rombel: <strong className="text-slate-700 dark:text-slate-200">{selectedClassName}</strong>
 </p>
 </div>
 </div>

 <div className="flex items-center gap-4 text-right">
 <div>
 <p className="text-[10px] font-bold uppercase text-slate-400">Status Sesi Hari Ini</p>
 <p className="text-xs font-bold text-slate-800 dark:text-white">
 {curRecord.check_in_time ? `${curRecord.check_in_time} WIB` : 'Belum absen'} · {curRecord.method || 'Roll Call Guru'}
 </p>
 </div>
 <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold border ${statusBadgeMap[curRecord.status] || statusBadgeMap['Belum Dicatat']}`}>
 {curRecord.status || 'Belum Dicatat'}
 </span>
 </div>
 </div>

 {/* 5 Summary KPI Cards (Tahfizh Cards Style) */}
 <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
 <div className="rounded-xl border border-emerald-200/80 bg-white p-3.5 shadow-sm dark:border-emerald-700/80/80 dark:bg-card-dark">
 <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pertemuan KBM</p>
 <p className="mt-1 text-lg font-black text-slate-800 dark:text-slate-200">{terlaksanaCount} Sesi</p>
 <p className="mt-0.5 text-[10px] text-slate-400">dari {displayHistory.length} sesi {studentDetailPeriodFilter}</p>
 </div>
 <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-emerald-50/50 p-3.5 shadow-sm dark:border-emerald-800/60 dark:bg-emerald-950/30">
 <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">Hadir</p>
 <p className="mt-1 text-lg font-black text-emerald-700 dark:text-emerald-300">{hadirCount} Kali</p>
 <p className="mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{persentase}% kehadiran</p>
 </div>
 <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-amber-50/50 p-3.5 shadow-sm dark:border-emerald-800/60 dark:bg-amber-950/30">
 <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">Terlambat</p>
 <p className="mt-1 text-lg font-black text-amber-700 dark:text-amber-300">{terlambatCount} Kali</p>
 <p className="mt-0.5 text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Tercatat masuk</p>
 </div>
 <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-sky-50/50 p-3.5 shadow-sm dark:border-emerald-800/60 dark:bg-sky-950/30">
 <p className="text-[10px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-400">Izin / Sakit</p>
 <p className="mt-1 text-lg font-black text-sky-700 dark:text-sky-300">{izinSakitCount} Kali</p>
 <p className="mt-0.5 text-[10px] text-sky-600 dark:text-sky-400 font-semibold">Dengan surat</p>
 </div>
 <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-rose-50/50 p-3.5 shadow-sm dark:border-emerald-800/60 dark:bg-rose-950/30">
 <p className="text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400">Alpha</p>
 <p className="mt-1 text-lg font-black text-rose-700 dark:text-rose-300">{alphaCount} Kali</p>
 <p className="mt-0.5 text-[10px] text-rose-600 dark:text-rose-400 font-semibold">Tanpa keterangan</p>
 </div>
 </div>

 {/* Tingkat Kehadiran Progress Bar */}
 <div className="rounded-xl border border-emerald-200/80 bg-white p-3.5 dark:border-emerald-700/80/80 dark:bg-card-dark">
 <div className="flex items-center justify-between text-xs font-bold">
 <span className="text-slate-700 dark:text-slate-300">
 Tingkat Kehadiran ({periodLabelMap[studentDetailPeriodFilter]}):
 </span>
 <span className="text-emerald-700 dark:text-emerald-400 font-black">{persentase}%</span>
 </div>
 <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
 <div
 className="h-full rounded-full bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white transition-all duration-500"
 style={{ width: `${Math.min(100, Math.max(0, persentase))}%` }}
 />
 </div>
 </div>

 {/* Mobile Cards (lg:hidden) */}
 <div className="space-y-3 lg:hidden">
 {displayHistory
 .slice((studentDetailPage - 1) * studentDetailPerPage, studentDetailPage * studentDetailPerPage)
 .map((item, index) => (
 <article key={item.meeting} className="overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 dark:border-emerald-700/80">
 <header className="flex items-center justify-between bg-emerald-50 px-4 py-3 dark:bg-emerald-950/30">
 <div>
 <p className="text-sm font-black text-slate-900 dark:text-white">
 Pertemuan #{item.meeting} · {item.date}
 </p>
 <p className="text-[10px] text-slate-500">{item.topic}</p>
 </div>
 <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold border ${statusBadgeMap[item.status] || statusBadgeMap['Belum Dicatat']}`}>
 {item.status}
 </span>
 </header>
 <div className="grid grid-cols-2 gap-px bg-slate-200 text-xs dark:bg-slate-700">
 {[
 ['Waktu Absen', item.time || '—'],
 ['Metode Absensi', item.method || '—'],
 ['Catatan Guru', item.notes || '—'],
 ['Validasi', item.status !== 'Belum Terlaksana' && item.status !== 'Belum Dicatat' ? 'Terverifikasi' : '—'],
 ].map(([label, value]) => (
 <div key={label} className="min-w-0 bg-white p-3 dark:bg-card-dark">
 <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
 <p className="mt-1 break-words font-semibold text-slate-800 dark:text-slate-100">{value}</p>
 </div>
 ))}
 </div>
 </article>
 ))}
 {displayHistory.length === 0 && (
 <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 p-8 text-center text-xs text-slate-400">
 Tidak ada data sesi presensi pada periode ini.
 </div>
 )}
 </div>

 {/* Formal Table for Desktop (Tahfizh Grid Style) */}
 <table className="hidden w-full table-fixed border-collapse text-[10px] xl:text-xs lg:table [&_td]:!p-2.5 [&_td]:break-words [&_th]:!p-2.5">
 <colgroup>
 <col className="w-[4%]" />
 <col className="w-[12%]" />
 <col className="w-[28%]" />
 <col className="w-[12%]" />
 <col className="w-[10%]" />
 <col className="w-[12%]" />
 <col className="w-[16%]" />
 <col className="w-[6%]" />
 </colgroup>
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr className="bg-emerald-100 text-slate-900 dark:bg-emerald-950/60 dark:text-emerald-100">
 <th className="border border-emerald-200/80 dark:border-emerald-800/60 p-2.5 text-center">No</th>
 <th className="border border-emerald-200/80 dark:border-emerald-800/60 p-2.5 text-left">Hari/Tanggal</th>
 <th className="border border-emerald-200/80 dark:border-emerald-800/60 p-2.5 text-left">Materi Pokok & Topik Pembelajaran</th>
 <th className="border border-emerald-200/80 dark:border-emerald-800/60 p-2.5 text-center">Status Kehadiran</th>
 <th className="border border-emerald-200/80 dark:border-emerald-800/60 p-2.5 text-center">Waktu Masuk</th>
 <th className="border border-emerald-200/80 dark:border-emerald-800/60 p-2.5 text-center">Metode Absensi</th>
 <th className="border border-emerald-200/80 dark:border-emerald-800/60 p-2.5 text-left">Catatan Guru</th>
 <th className="border border-emerald-200/80 dark:border-emerald-800/60 p-2.5 text-center">Validasi</th>
 </tr>
 </thead>
 <tbody>
 {displayHistory
 .slice((studentDetailPage - 1) * studentDetailPerPage, studentDetailPage * studentDetailPerPage)
 .map((item, index) => {
 const d = new Date(item.date)
 const dayName = !isNaN(d.getTime()) ? new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(d) : 'Hari KBM'
 const dateFormatted = !isNaN(d.getTime()) ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(d) : item.date

 return (
 <tr key={item.meeting} className="h-16 align-middle hover:bg-emerald-50/40 transition-colors dark:hover:bg-emerald-950/30">
 <td className="border border-emerald-200/80 dark:border-emerald-800/60 p-3 text-center font-bold dark:border-slate-600">
 {item.isCurrent ? (
 <span className="inline-flex rounded-full bg-emerald-700 px-2 py-0.5 text-[10px] font-black text-white">
 #{item.meeting}
 </span>
 ) : (
 `#${item.meeting}`
 )}
 </td>
 <td className="border border-emerald-200/80 dark:border-emerald-800/60 p-3 dark:border-slate-600">
 <p className="font-bold text-slate-900 dark:text-white">{dayName}</p>
 <p className="mt-0.5 text-[10px] text-slate-500">{dateFormatted}</p>
 </td>
 <td className="border border-emerald-200/80 dark:border-emerald-800/60 p-3 dark:border-slate-600">
 <p className="font-bold text-slate-900 dark:text-white">{item.topic}</p>
 <p className="mt-0.5 text-[10px] text-slate-500">Pertemuan ke-{item.meeting} · Rombel {selectedClassName}</p>
 </td>
 <td className="border border-emerald-200/80 dark:border-emerald-800/60 p-3 text-center dark:border-slate-600">
 <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold border ${statusBadgeMap[item.status] || statusBadgeMap['Belum Dicatat']}`}>
 {item.status}
 </span>
 </td>
 <td className="border border-emerald-200/80 dark:border-emerald-800/60 p-3 text-center dark:border-slate-600">
 <p className="font-semibold text-slate-800 dark:text-slate-200">{item.time}</p>
 </td>
 <td className="border border-emerald-200/80 dark:border-emerald-800/60 p-3 text-center dark:border-slate-600">
 <span className="rounded bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
 {item.method}
 </span>
 </td>
 <td className="border border-emerald-200/80 dark:border-emerald-800/60 p-3 dark:border-slate-600 text-slate-600 dark:text-slate-300">
 {item.notes}
 </td>
 <td className="border border-emerald-200/80 dark:border-emerald-800/60 p-3 text-center dark:border-slate-600">
 {item.status !== 'Belum Terlaksana' && item.status !== 'Belum Dicatat' ? (
 <CheckCircle2 className="mx-auto h-5 w-5 text-white" aria-label="Terverifikasi" />
 ) : (
 <span className="text-slate-300 dark:text-slate-600">—</span>
 )}
 </td>
 </tr>
 )
 })}
 {displayHistory.length === 0 && (
 <tr>
 <td colSpan={8} className="border border-emerald-200/80 dark:border-emerald-800/60 p-8 text-center text-xs text-slate-400 dark:border-slate-600">
 Tidak ada rekaman sesi presensi pada rentang waktu ini.
 </td>
 </tr>
 )}
 </tbody>
 <tfoot>
 <tr className="bg-slate-50 align-top dark:bg-slate-800/60">
 <td colSpan="6" className="h-16 border border-emerald-200/80 dark:border-emerald-800/60 p-3 dark:border-slate-600">
 <strong>Catatan Guru Pengampu:</strong>
 <p className="mt-1 font-normal text-slate-600 dark:text-slate-300">
 {persentase >= 85
 ? 'Alhamdulillah, kedisiplinan dan kehadiran siswa sangat memuaskan, konsisten mengikuti pembelajaran aktif.'
 : persentase >= 75
 ? 'Kehadiran siswa cukup baik, pertahankan kedisiplinan dan ketepatan waktu masuk kelas.'
 : 'Perlu peningkatan kedisiplinan kehadiran KBM dan koordinasi aktif bersama wali kelas/orang tua murid.'}
 </p>
 </td>
 <td colSpan="2" className="border border-emerald-200/80 dark:border-emerald-800/60 p-3 dark:border-slate-600">
 <strong>Guru Pengampu:</strong>
 <p className="mt-1 font-bold text-slate-900 dark:text-white">{teacherName}</p>
 <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
 <CheckCircle2 className="h-3.5 w-3.5" /> Terverifikasi Digital
 </span>
 </td>
 </tr>
 </tfoot>
 </table>

 {/* Pagination Controls in Modal (Maksimal 10 Baris) */}
 {displayHistory.length > studentDetailPerPage && (
 <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-slate-50/80 p-3 dark:border-emerald-700/80 dark:bg-slate-900/50">
 <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
 Menampilkan{' '}
 <strong className="text-emerald-700 dark:text-emerald-300">
 {(studentDetailPage - 1) * studentDetailPerPage + 1}
 </strong>{' '}
 s.d.{' '}
 <strong className="text-emerald-700 dark:text-emerald-300">
 {Math.min(studentDetailPage * studentDetailPerPage, displayHistory.length)}
 </strong>{' '}
 dari <strong className="text-slate-900 dark:text-white">{displayHistory.length}</strong> pertemuan
 </div>
 <Pagination
 currentPage={studentDetailPage}
 totalPages={Math.max(1, Math.ceil(displayHistory.length / studentDetailPerPage))}
 onPageChange={setStudentDetailPage}
 sideLayout="full"
 variant="compact"
 />
 </div>
 )}
 </div>
 </AppModal>
 )
 })()}

 {/* MODAL DETAIL KEHADIRAN SISWA PADA SESI RIWAYAT */}
 {showHistorySessionModal && selectedHistorySession && (() => {
 const session = selectedHistorySession
 const sessionDate = session.attendance_date ? new Date(session.attendance_date) : null
 const dateFormatted = sessionDate
 ? sessionDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
 : '-'
 const timeRange = session.schedule?.time_start && session.schedule?.time_end
 ? `${session.schedule.time_start.slice(0, 5)} – ${session.schedule.time_end.slice(0, 5)} WIB`
 : '07:30 – 09:00 WIB'

 const attList = session.attendances || []
 const filteredAttList = attList.filter((a) => {
 if (!historySessionStudentSearch) return true
 const q = historySessionStudentSearch.toLowerCase()
 const name = (a.siswa?.full_name || a.siswa?.nama_lengkap || a.siswa?.name || a.student_name || '').toLowerCase()
 const nisn = (a.siswa?.nisn || a.student_nisn || '').toLowerCase()
 return name.includes(q) || nisn.includes(q)
 })

 const hadir = attList.filter((a) => (a.status_hadir || a.status || '').toLowerCase() === 'hadir').length
 const terlambat = attList.filter((a) => (a.status_hadir || a.status || '').toLowerCase() === 'terlambat').length
 const izin = attList.filter((a) => (a.status_hadir || a.status || '').toLowerCase() === 'izin').length
 const sakit = attList.filter((a) => (a.status_hadir || a.status || '').toLowerCase() === 'sakit').length
 const alpa = attList.filter((a) => ['alpa', 'alpha'].includes((a.status_hadir || a.status || '').toLowerCase())).length

 const statusBadgeStyle = {
 hadir: 'bg-emerald-100 text-emerald-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950 dark:text-emerald-300',
 terlambat: 'bg-amber-100 text-amber-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950 dark:text-amber-300',
 izin: 'bg-sky-100 text-sky-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-sky-950 dark:text-sky-300',
 sakit: 'bg-violet-100 text-violet-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-violet-950 dark:text-violet-300',
 alpa: 'bg-rose-100 text-rose-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950 dark:text-rose-300',
 alpha: 'bg-rose-100 text-rose-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950 dark:text-rose-300',
 }

 return (
 <AppModal
 isOpen={true}
 onClose={() => {
 setIsEditingHistorySession(false)
 setShowHistorySessionModal(false)
 }}
 zIndex={80}
 maxWidth="max-w-4xl"
 title={`Detail Presensi • Pertemuan ke-${session.meeting_number || 1}`}
 description={`${session.schedule?.subject?.name || 'Mata Pelajaran'} • ${session.schedule?.kelas?.name || selectedClassName} • ${dateFormatted} (${timeRange})`}
 icon={UserCheck}
 headerActions={
 <div className="flex items-center gap-1.5">
 <button
 type="button"
 onClick={() => {
 if (isEditingHistorySession) {
 setIsEditingHistorySession(false)
 } else {
 handleStartEditHistorySession()
 }
 }}
 className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold shadow-xs transition cursor-pointer ${isEditingHistorySession
 ? 'border-amber-400 bg-amber-500 text-white hover:bg-amber-600'
 : 'border-white/30 bg-white/20 text-white hover:bg-white/30'
 }`}
 title={isEditingHistorySession ? 'Batalkan mode koreksi' : 'Koreksi kesalahan data presensi sesi ini'}
 >
 <Edit3 className="h-3.5 w-3.5" />
 <span>{isEditingHistorySession ? 'Batal Koreksi' : 'Koreksi Presensi'}</span>
 </button>

 <button
 type="button"
 onClick={() => handlePrintSingleHistorySession(session)}
 title="Cetak Berita Acara & Presensi Sesi Ini"
 className="inline-flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/20 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-white/30 cursor-pointer"
 >
 <Printer className="h-3.5 w-3.5" />
 <span className="hidden sm:inline">Cetak</span>
 </button>

 <button
 type="button"
 onClick={() => handleDownloadSingleHistorySessionPdf(session)}
 title="Unduh Lembar Presensi Sesi (PDF)"
 className="inline-flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/20 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-white/30 cursor-pointer"
 >
 <FileText className="h-3.5 w-3.5" />
 <span className="hidden sm:inline">PDF</span>
 </button>

 <button
 type="button"
 onClick={() => handleExportSingleHistorySessionCsv(session)}
 title="Export Presensi Sesi ke Excel (.csv)"
 className="inline-flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/20 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-white/30 cursor-pointer"
 >
 <Download className="h-3.5 w-3.5" />
 <span className="hidden sm:inline">Excel</span>
 </button>
 </div>
 }
 subHeader={
 <>
 {/* Mode Koreksi Alert Banner */}
 {isEditingHistorySession && (
 <div className="flex flex-wrap items-center justify-between gap-2 bg-amber-50/90 dark:bg-amber-950/40 border-b border-emerald-200/80 dark:border-emerald-800/80 px-4 py-2.5 text-xs text-amber-900 dark:text-amber-200">
 <div className="flex items-center gap-2">
 <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
 <span><strong>Mode Koreksi Aktif:</strong> Ubah status kehadiran atau keterangan siswa yang salah input di bawah, lalu klik Simpan Koreksi.</span>
 </div>
 <button
 type="button"
 onClick={handleSaveHistoryCorrection}
 disabled={isSavingHistoryEdit}
 className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer shrink-0 border border-emerald-200/80 dark:border-emerald-800/60 h-9"
 >
 {isSavingHistoryEdit ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
 <span>Simpan Koreksi</span>
 </button>
 </div>
 )}

 {/* Sub-header Stats & Search */}
 <div className="shrink-0 border-b border-emerald-200/80 dark:border-emerald-800/60 p-4 bg-slate-50/50 dark:bg-slate-900/40">
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div className="flex flex-wrap items-center gap-2">
 <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
 {hadir} Hadir
 </span>
 <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
 {terlambat} Terlambat
 </span>
 <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
 {izin} Izin
 </span>
 <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-800 dark:bg-violet-950 dark:text-violet-300">
 {sakit} Sakit
 </span>
 <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
 {alpa} Alpa
 </span>
 </div>

 <div className="relative min-w-[200px] max-w-xs">
 <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={historySessionStudentSearch}
 onChange={(e) => setHistorySessionStudentSearch(e.target.value)}
 placeholder="Cari nama / NISN siswa..."
 className="h-8 w-full rounded-lg border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-white pl-8 pr-3 text-xs outline-none focus:border-emerald-500 dark:bg-slate-800 dark:text-white"
 />
 </div>
 </div>
 </div>
 </>
 }
 bodyClassName="p-4"
 footer={
 <div className="flex w-full flex-wrap items-center justify-between gap-3">
 <div className="flex flex-wrap items-center gap-2">
 {isEditingHistorySession ? (
 <button
 type="button"
 onClick={handleSaveHistoryCorrection}
 disabled={isSavingHistoryEdit}
 className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 disabled:opacity-50 px-4 py-2 text-xs font-bold text-white shadow-md transition cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60 h-9"
 >
 {isSavingHistoryEdit ? (
 <>
 <RefreshCw className="h-4 w-4 animate-spin" /> Menyimpan Koreksi...
 </>
 ) : (
 <>
 <Save className="h-4 w-4" /> Simpan Koreksi Presensi
 </>
 )}
 </button>
 ) : (
 <>
 <button
 type="button"
 onClick={() => handlePrintSingleHistorySession(session)}
 className="inline-flex items-center gap-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white px-4 py-2 text-xs font-bold shadow-sm transition cursor-pointer"
 >
 <Printer className="h-4 w-4" /> Cetak Lembar Presensi Sesi
 </button>
 <button
 type="button"
 onClick={() => handleExportSingleHistorySessionCsv(session)}
 className="inline-flex items-center gap-1.5 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white px-3.5 py-2 text-xs font-bold text-emerald-700 shadow-xs hover:bg-emerald-50 dark:bg-slate-800 dark:text-emerald-300 cursor-pointer"
 >
 <Download className="h-4 w-4" /> Export Excel (.csv)
 </button>
 </>
 )}
 </div>

 <div className="flex items-center gap-2">
 {isEditingHistorySession && (
 <button
 type="button"
 onClick={() => setIsEditingHistorySession(false)}
 className="rounded-xl border border-slate-300 bg-slate-200 hover:bg-slate-300 px-4 py-2 text-xs font-bold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
 >
 Batal
 </button>
 )}
 <button
 type="button"
 onClick={() => {
 setIsEditingHistorySession(false)
 setShowHistorySessionModal(false)
 }}
 className="rounded-xl border border-slate-300 bg-slate-200 hover:bg-slate-300 px-4 py-2 text-xs font-bold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
 >
 Tutup
 </button>
 </div>
 </div>
 }
 >
 {filteredAttList.length === 0 ? (
 <div className="py-12 text-center text-xs text-slate-500">
 {attList.length === 0
 ? 'Belum ada log kehadiran siswa pada sesi ini.'
 : 'Tidak ada siswa yang cocok dengan pencarian.'}
 </div>
 ) : (
 <div className="overflow-x-auto rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 dark:border-emerald-700/80">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 <th className="py-2.5 px-3 w-12 text-center">No</th>
 <th className="py-2.5 px-3">Nama Siswa</th>
 <th className="py-2.5 px-3">NISN</th>
 <th className="py-2.5 px-3 text-center">Status Kehadiran</th>
 <th className="py-2.5 px-3">Waktu Presensi</th>
 <th className="py-2.5 px-3">Metode</th>
 <th className="py-2.5 px-3">Catatan / Keterangan</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {filteredAttList.map((item, idx) => {
 const sId = item.siswa_id || item.student_id || item.siswa?.id || item.id
 const currentEdit = editedAttendanceMap[sId]
 const activeStatus = isEditingHistorySession
 ? (currentEdit?.status || item.status_hadir || item.status || 'Hadir')
 : (item.status_hadir || item.status || 'Belum Dicatat')
 const rawStatus = String(activeStatus).toLowerCase()
 const statusClass = statusBadgeStyle[rawStatus] || 'bg-slate-100 text-slate-700 border-emerald-300'
 const studentName = item.siswa?.full_name || item.siswa?.nama_lengkap || item.siswa?.name || item.student_name || 'Siswa'
 const nisn = item.siswa?.nisn || item.student_nisn || '-'
 const waktu = item.waktu_presensi
 ? new Date(item.waktu_presensi).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
 : '-'

 return (
 <tr key={item.id || idx} className="hover:bg-emerald-50/40 transition-colors dark:hover:bg-emerald-950/30">
 <td className="py-2.5 px-3 text-center font-semibold text-slate-400">{idx + 1}</td>
 <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{studentName}</td>
 <td className="py-2.5 px-3 font-mono text-xs text-slate-500">{nisn}</td>
 <td className="py-2.5 px-3 text-center">
 {isEditingHistorySession ? (
 <CustomSelect
 value={activeStatus}
 onChange={(e) => {
 const newStatus = e.target.value
 setEditedAttendanceMap((prev) => ({
 ...prev,
 [sId]: {
 ...(prev[sId] || {}),
 status: newStatus,
 },
 }))
 }}
 className="rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-black text-emerald-950 dark:text-white outline-none cursor-pointer focus:ring-2 focus:ring-emerald-400"
 >
 <option value="Hadir">Hadir</option>
 <option value="Terlambat">Terlambat</option>
 <option value="Izin">Izin</option>
 <option value="Sakit">Sakit</option>
 <option value="Alpha">Alpha</option>
 </CustomSelect>
 ) : (
 <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold capitalize ${statusClass}`}>
 {item.status_hadir || item.status || 'Belum Dicatat'}
 </span>
 )}
 </td>
 <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{waktu}</td>
 <td className="py-2.5 px-3 text-slate-500">{item.recorded_method || 'Presensi KBM'}</td>
 <td className="py-2.5 px-3 text-slate-500">
 {isEditingHistorySession ? (
 <input
 type="text"
 value={currentEdit?.notes ?? (item.keterangan || '')}
 onChange={(e) => {
 const newNotes = e.target.value
 setEditedAttendanceMap((prev) => ({
 ...prev,
 [sId]: {
 ...(prev[sId] || {}),
 notes: newNotes,
 },
 }))
 }}
 placeholder="Catatan koreksi / alasan..."
 className="h-7 w-full min-w-[150px] rounded-lg border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-white px-2 text-xs outline-none focus:border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white"
 />
 ) : (
 item.keterangan || '-'
 )}
 </td>
 </tr>
 )
 })}
 </tbody>
 </table>
 </div>
 )}
 </AppModal>
 )
 })()}

 {/* MODAL SESI KBM AKTIF — MULAI MENGAJAR (BUG-GURU-001) */}
 <AppModal
 isOpen={showMulaiMengajarModal}
 onClose={() => setShowMulaiMengajarModal(false)}
 title="Sesi KBM Aktif — Mulai Mengajar"
 description={`Pusat kendali sesi belajar-mengajar hari ini • ${formattedLiveDate} • Jam: ${formattedLiveTime}`}
 icon={Play}
 maxWidth="max-w-xl"
 footer={
 <div className="flex justify-between items-center w-full">
 <button
 type="button"
 onClick={() => {
 setShowMulaiMengajarModal(false)
 changeTab('jadwal')
 }}
 className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1.5 cursor-pointer"
 >
 <Calendar className="h-4 w-4" /> Lihat Jadwal Lengkap
 </button>
 <button
 type="button"
 onClick={() => setShowMulaiMengajarModal(false)}
 className="group inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 text-xs font-black text-white shadow-sm hover:from-rose-600 hover:to-red-800 active:scale-95 transition-all cursor-pointer"
 >
 <span className="flex size-5 items-center justify-center rounded-lg bg-white/20">
 <X className="size-3.5" strokeWidth={2.5} />
 </span>
 <span>Tutup</span>
 </button>
 </div>
 }
 >
 <div className="space-y-4">
 {/* BANNER REALTIME: GURU PENGAMPU & WAKTU */}
 <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white dark:bg-card-dark p-4 shadow-sm dark:border-emerald-800/60 dark:bg-slate-900/80">
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div className="flex items-center gap-3">
 <div className="flex h-9 w-11 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-card-dark shadow-md border border-emerald-200/80 dark:border-emerald-800/60">
 <Play className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
 {teacherName || 'Guru Pengampu'}
 </h3>
 <p className="text-xs text-slate-600 dark:text-slate-300">
 {selectedClassName} • {teacherProfile?.niy || user?.employee?.niy || 'NIY Pendidik'}
 </p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
 <span className="relative flex h-2 w-2">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
 <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
 </span>
 Live {formattedLiveTime}
 </span>
 </div>
 </div>
 </div>

 {/* DAFTAR JADWAL / SESI */}
 {sortedSchedules.length === 0 ? (
 <div className="rounded-xl border border-dashed border-emerald-300 p-8 text-center dark:border-emerald-700/80">
                  <Calendar className="mx-auto h-9 w-10 text-emerald-600 dark:text-emerald-400 mb-2" />
 <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
 Belum Ada Jadwal Mengajar Aktif
 </h4>
 <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
 Ustadz/Ustadzah belum memiliki penugasan jam mengajar resmi untuk rombel ini. Silakan hubungi Waka Kurikulum atau Bagian Tata Usaha.
 </p>
 </div>
 ) : (
 <div className="space-y-3">
 <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
 <span>
 {selectedDaySchedules.length > 0
 ? `Sesi Mengajar Hari Ini (${selectedDateDay}): ${selectedDaySchedules.length} Sesi`
 : `Jadwal Mengajar Terdaftar (${sortedSchedules.length} Sesi Mingguan)`}
 </span>
 <span className="text-xs text-slate-400">Pilih sesi untuk membuka KBM</span>
 </div>

 {(selectedDaySchedules.length > 0 ? selectedDaySchedules : sortedSchedules).map((sch, idx) => {
 const isToday = getScheduleDay(sch).toLowerCase() === selectedDateDay.toLowerCase()
 const schSubject = getScheduleSubject(sch)
 const schHours = getScheduleLessonHours(sch)
 const schRoom = getScheduleRoom(sch)
 const schClass = sch.kelas?.nama_kelas || sch.kelas?.name || sch.class_name || selectedClassName

 return (
 <div
 key={sch.id || idx}
 className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white p-4 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700/80 transition-all dark:border-emerald-800/60 dark:bg-slate-800/90"
 >
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
 <div className="space-y-1">
 <div className="flex items-center gap-2 flex-wrap">
 <span className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${isToday
 ? 'bg-emerald-600 text-white'
 : 'bg-slate-200 text-slate-700 dark:bg-emerald-950/60 dark:text-emerald-300'
 }`}>
 {getScheduleDay(sch)}
 </span>
 <span className="font-extrabold text-sm text-slate-900 dark:text-white">
 {schSubject}
 </span>
 <span className="text-xs text-slate-500 dark:text-slate-400">
 • {schClass}
 </span>
 </div>
 <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 flex-wrap">
 <span className="flex items-center gap-1 font-mono font-semibold">
 <Clock className="h-3.5 w-3.5 text-emerald-600" /> {schHours}
 </span>
 <span>•</span>
 <span>Ruang: <strong>{schRoom}</strong></span>
 </div>
 </div>

 {/* AKSI SESI KBM */}
 {(() => {
 const schStatus = getScheduleStatus(sch)
 return (
 <div className="flex items-center gap-2 flex-wrap shrink-0">
 <button
 type="button"
 disabled={!schStatus.isActive}
 onClick={() => {
 setShowMulaiMengajarModal(false)
 openPresensiModal(sch)
 }}
 className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold shadow-sm transition ${schStatus.isActive
 ? 'bg-[#059669] hover:bg-emerald-800 text-white cursor-pointer'
 : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400 cursor-not-allowed opacity-60'
 }`}
 >
 <UserCheck className="h-4 w-4" />
 <span>{schStatus.isActive ? 'Buka Presensi Kelas' : `Presensi (${schStatus.label})`}</span>
 </button>
 <button
 type="button"
 onClick={() => {
 setShowMulaiMengajarModal(false)
 const cid = sch.class_id || sch.kelas_id || sch.kelas?.id || sch.class?.id
 if (cid) setSelectedClass(String(cid))
 changeTab('materi')
 }}
 className="inline-flex items-center gap-1.5 rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200 transition cursor-pointer"
 >
 <BookOpen className="h-4 w-4 text-emerald-600" /> Materi
 </button>
 </div>
 )
 })()}
 </div>
 </div>
 )
 })}
 </div>
 )}
 </div>
 </AppModal>

 {/* DEDICATED PRESENSI SESSION MODAL POP-UP */}
 {/* MODAL POPUP PRESENSI PEMBELAJARAN SISWA */}
 <AppModal
 isOpen={showPresensiModal}
 onClose={() => setShowPresensiModal(false)}
 title="Presensi Pembelajaran Siswa"
 description={`Rombel: ${modalActiveClassName} • Mapel: ${presensiModalSchedule?.subject?.name || presensiModalSchedule?.subject?.nama_mapel || getScheduleSubject(presensiModalSchedule || {}) || 'Mata Pelajaran'} • Jam Pelajaran: ${getScheduleLessonHours(presensiModalSchedule)} • Waktu Sekarang: ${formattedLiveTime}`}
 icon={UserCheck}
 maxWidth="max-w-4xl"
 footer={
 <div className="flex items-center justify-end gap-3 w-full">
 <button
 type="button"
 onClick={() => setShowPresensiModal(false)}
 className="group inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 text-xs font-black text-white shadow-sm hover:from-rose-600 hover:to-red-800 active:scale-95 transition-all cursor-pointer"
 >
 <span className="flex size-5 items-center justify-center rounded-lg bg-white/20">
 <X className="size-3.5" strokeWidth={2.5} />
 </span>
 <span>Batal</span>
 </button>
 {(() => {
 const modalSchStatus = presensiModalSchedule ? getScheduleStatus(presensiModalSchedule) : null
 const isModalInactive = modalSchStatus && !modalSchStatus.isActive
 return (
 <button
 type="button"
 disabled={isSavingAttendance || isModalInactive}
 onClick={handleSaveAttendance}
 title={isModalInactive ? `Presensi tidak aktif (${modalSchStatus.label})` : 'Simpan Presensi Pembelajaran'}
 className={`group inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black text-white shadow-md transition-all active:scale-95 ${isModalInactive
 ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
 : 'bg-white dark:bg-card-dark shadow-sm hover:from-emerald-600 hover:to-teal-800 cursor-pointer disabled:opacity-50'
 }`}
 >
 <span className="flex size-5 items-center justify-center rounded-lg bg-white/20">
 {isSavingAttendance ? (
 <RefreshCw className="size-3.5 animate-spin" />
 ) : isModalInactive ? (
 <Clock className="size-3.5" />
 ) : (
 <CheckCircle2 className="size-3.5" strokeWidth={2.5} />
 )}
 </span>
 <span>
 {isSavingAttendance
 ? 'Menyimpan Presensi...'
 : isModalInactive
 ? `Presensi Tidak Aktif (${modalSchStatus.label})`
 : 'Simpan Presensi Pembelajaran'}
 </span>
 </button>
 )
 })()}
 </div>
 }
 >
 <div className="space-y-4">
 {/* BANNER REALTIME: WAKTU SEKARANG, JAM PELAJARAN & FILTER ROMBEL */}
 <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white dark:bg-card-dark p-3.5 sm:p-4 shadow-sm dark:border-emerald-800/60 dark:bg-slate-900/80 space-y-3">
 <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-800/80 pb-3 dark:border-emerald-800/60">
 {/* Jam Sekarang (Realtime Live Clock) */}
 <div className="flex items-center gap-2.5">
 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-card-dark shadow-xs border border-emerald-200/80 dark:border-emerald-800/60">
 <Clock className="h-5 w-5" />
 </div>
 <div>
 <div className="flex items-center gap-1.5">
 <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Jam Sekarang:</span>
 <span className="relative flex h-2 w-2">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
 <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
 </span>
 </div>
 <div className="flex items-baseline gap-2">
 <span className="font-mono text-sm sm:text-base font-black text-emerald-950 dark:text-white tracking-tight">
 {formattedLiveTime}
 </span>
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden md:inline">
 ({formattedLiveDate})
 </span>
 </div>
 </div>
 </div>

 {/* Jam Pelajaran (Lesson Schedule Hours) */}
 <div className="flex items-center gap-2.5">
 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-card-dark shadow-xs border border-emerald-200/80 dark:border-emerald-800/60">
 <CalendarRange className="h-5 w-5" />
 </div>
 <div>
 <div className="flex items-center gap-1.5">
 <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Jam Pelajaran:</span>
 <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${getLiveLessonStatus(presensiModalSchedule).color}`}>
 {getLiveLessonStatus(presensiModalSchedule).label}
 </span>
 </div>
 <span className="font-mono text-sm sm:text-base font-black text-slate-900 dark:text-emerald-300 tracking-tight">
 {getScheduleLessonHours(presensiModalSchedule)}
 </span>
 </div>
 </div>
 </div>

 {/* Baris Kedua: Rombel & Mata Pelajaran */}
 <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
 <div className="flex items-center gap-2 flex-wrap">
 <span className="text-xs font-extrabold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
 <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 <span>Rombel:</span>
 </span>
 {presensiModalClasses.length > 1 ? (
 <div className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
 <Users className="h-3.5 w-3.5 text-emerald-600" />
 <CustomSelect
 id="presensi-modal-rombel-select"
 value={selectedClass}
 onChange={(e) => handleModalClassChange(e.target.value)}
 className="bg-transparent font-extrabold text-xs text-emerald-950 dark:text-emerald-100 outline-none cursor-pointer pr-1"
 >
 {presensiModalClasses.map((c) => (
 <option key={c.id} value={c.id} className="dark:bg-slate-900 text-slate-900 dark:text-white">
 {c.nama_kelas || c.name} {c.kode_kelas ? `· ${c.kode_kelas}` : ''}
 </option>
 ))}
 </CustomSelect>
 </div>
 ) : (
 <div className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-black border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs text-emerald-950 dark:text-emerald-100">
 <Users className="h-3.5 w-3.5 text-emerald-600" />
 <span>{modalActiveClassName}</span>
 </div>
 )}
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
 {`(${students.filter((st) => {
 const sCid = st.kelas_id || st.class_id || st.kelas?.id
 return !selectedClass || selectedClass === 'all' || (!!sCid && String(sCid) === String(selectedClass))
 }).length} Siswa Terdaftar)`}
 </span>
 </div>

 <div className="flex items-center gap-2 flex-wrap text-xs">
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Mata Pelajaran:</span>
 <span className="rounded-lg bg-white/90 dark:bg-slate-800/90 px-3 py-1 font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
 {presensiModalSchedule?.subject?.name || presensiModalSchedule?.subject?.nama_mapel || getScheduleSubject(getCurrentSchedule() || {}) || 'Mata Pelajaran Aktif'}
 </span>

 {/* Indikator Status Auto-Save Real-Time */}
 <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold shadow-2xs border transition-all ${autoSaveStatus === 'saving'
 ? 'bg-amber-50 text-amber-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-emerald-800/60'
 : autoSaveStatus === 'error'
 ? 'bg-rose-50 text-rose-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/60 dark:text-rose-300 dark:border-emerald-800/60'
 : 'bg-emerald-100/90 text-emerald-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
 }`}>
 <span className="relative flex h-2 w-2">
 <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${autoSaveStatus === 'saving' ? 'bg-amber-400' : autoSaveStatus === 'error' ? 'bg-rose-400' : 'bg-emerald-400'} opacity-75`}></span>
 <span className={`relative inline-flex rounded-full h-2 w-2 ${autoSaveStatus === 'saving' ? 'bg-amber-500' : autoSaveStatus === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
 </span>
 <span>
 {autoSaveStatus === 'saving'
 ? 'Menyimpan Otomatis...'
 : autoSaveStatus === 'error'
 ? 'Gagal Menyimpan'
 : 'Auto-Save Aktif: Tersimpan ke Server'}
 </span>
 </div>
 </div>
 </div>
 </div>

 {/* Sub Navigation Tabs */}
 <div className="flex overflow-x-auto border-b border-emerald-200/80 text-xs font-bold dark:border-emerald-800/60">
 {[
 ['presensi', 'Data Presensi'],
 ['verifikasi', 'Verifikasi Guru'],
 ['riwayat', 'Riwayat Sesi'],
 ['catatan', 'Catatan'],
 ].map(([id, label]) => (
 <button
 key={id}
 type="button"
 onClick={() => setAttendanceCenterTab(id)}
 className={`shrink-0 border-b-2 px-4 pb-2.5 font-extrabold transition ${attendanceCenterTab === id
 ? 'border-slate-600 text-emerald-700 dark:text-emerald-400'
 : 'border-transparent text-slate-400 hover:text-slate-600'
 }`}
 >
 {label}
 </button>
 ))}
 </div>

 {attendanceCenterTab === 'presensi' && (
 <>
 {/* Metode Absensi */}
 <div>
 <h4 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
 Metode Absensi
 </h4>
 <div className="grid gap-2.5 sm:grid-cols-3">
 {[
 { id: 'rollcall', label: 'Roll Call Guru', description: 'Checklist manual oleh guru', icon: UserCheck },
 { id: 'qr', label: 'QR Code Kartu', description: 'Scan QR code kartu siswa', icon: QrCode },
 { id: 'rfid', label: 'RFID Tap', description: 'Tap kartu RFID siswa', icon: Radio },
 ].map((method) => {
 const Icon = method.icon
 const active = selectedMethod === method.id
 return (
 <button
 key={method.id}
 type="button"
 onClick={() => {
 setSelectedMethod(method.id)
 setScanInput('')
 setLastScannedResult(null)
 if (method.id !== 'rollcall') setTimeout(() => scanInputRef.current?.focus(), 50)
 }}
 className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${active
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/80 ring-2 ring-emerald-500/30 dark:bg-emerald-950/40 dark:border-emerald-800/60'
 : 'border-emerald-200/80 hover:border-emerald-300 dark:border-emerald-700/80 dark:bg-slate-900/60'
 }`}
 >
 <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
 }`}>
 <Icon className="h-5 w-5" />
 </span>
 <div>
 <strong className="block text-xs font-bold text-slate-900 dark:text-white">{method.label}</strong>
 <span className="text-[10px] font-semibold text-slate-400">{method.description}</span>
 </div>
 </button>
 )
 })}
 </div>

 {selectedMethod !== 'rollcall' && (
 <div className={`mt-3 space-y-2.5 rounded-xl border p-3.5 ${selectedMethod === 'qr' ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/60 dark:border-emerald-800/60 dark:bg-emerald-950/30' : 'border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50/60 dark:border-emerald-800/60 dark:bg-sky-950/30'
 }`}>
 <div className="flex flex-wrap items-center justify-between gap-2">
 <div className="flex items-center gap-2">
 {selectedMethod === 'qr' ? <QrCode className="h-4 w-4 text-emerald-600" /> : <Wifi className="h-4 w-4 animate-pulse text-sky-600" />}
 <span className="text-xs font-bold text-slate-900 dark:text-white">
 {selectedMethod === 'qr' ? 'Pemindai QR Code Kartu Siswa' : 'Pembaca RFID Reader Standby'}
 </span>
 </div>
 {selectedMethod === 'qr' ? (
 <button
 type="button"
 onClick={openQrCamera}
 className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition border border-emerald-200/80 dark:border-emerald-800/60 h-9 text-sm font-medium"
 >
 <Camera className="h-3.5 w-3.5" /> Live Kamera
 </button>
 ) : (
 <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-900 dark:text-sky-300">
 ● Ready to Tap
 </span>
 )}
 </div>
 <form onSubmit={handleCardScan} className="flex gap-2">
 <input
 ref={scanInputRef}
 value={scanInput}
 onChange={(event) => {
 const val = event.target.value
 setScanInput(val)
 if (val.trim()) {
 const matched = findStudentByCardCode(val)
 if (matched) {
 identifyStudentCard(val, selectedMethod)
 }
 }
 }}
 onKeyDown={(event) => {
 if (event.key === 'Enter') {
 event.preventDefault()
 if (scanInput.trim()) {
 identifyStudentCard(scanInput, selectedMethod)
 }
 }
 }}
 autoFocus
 autoComplete="off"
 placeholder={selectedMethod === 'qr' ? 'Arahkan QR kartu siswa ke scanner / USB scanner (Otomatis Hadir)...' : 'Tap kartu RFID siswa pada reader (Otomatis Hadir)...'}
 className="h-9 min-w-0 flex-1 rounded-3xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white px-3.5 text-xs font-semibold outline-none focus:border-emerald-600 dark:border-emerald-700/80 dark:bg-slate-900 dark:text-white"
 />
 {scanProcessing && (
 <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl animate-pulse">
 <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Auto-Hadir...
 </div>
 )}
 </form>
 {lastScannedResult && (
 <div className={`rounded-xl px-3 py-2 text-xs font-semibold ${lastScannedResult.error ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
 {lastScannedResult.error ? lastScannedResult.message : `${lastScannedResult.student?.nama_lengkap || lastScannedResult.student?.full_name} berhasil dicatat.`}
 </div>
 )}
 </div>
 )}
 </div>

 {/* Action & Filter Bar */}
 <div className="flex flex-wrap items-center justify-between gap-3 border-t border-emerald-200/80 pt-3 dark:border-emerald-800/60">
 <div className="flex items-center gap-2 flex-wrap">
 {(() => {
 const classScopedStudents = (selectedClass && selectedClass !== 'all')
 ? students.filter((st) => {
 const sCid = st.kelas_id || st.class_id || st.kelas?.id
 return !!sCid && String(sCid) === String(selectedClass)
 })
 : students
 const presentCount = classScopedStudents.filter((st) => (attendanceData[st.id]?.status || 'Belum Dicatat') === 'Hadir').length
 return (
 <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-extrabold text-xs rounded-full">
 {presentCount} / {classScopedStudents.length} Hadir
 </span>
 )
 })()}
 <button
 type="button"
 onClick={markAllStudentsPresent}
 className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-sm transition border border-emerald-200/80 dark:border-emerald-800/60 h-9 text-sm font-medium"
 >
 Tandai Semua Hadir
 </button>
 </div>
 <div className="flex items-center gap-2 flex-wrap">
 {presensiModalClasses.length > 1 ? (
 <div className="inline-flex items-center gap-1.5 rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-200">
 <Filter className="h-3 w-3 text-emerald-600" />
 <span className="text-xs text-slate-400 font-medium">Rombel:</span>
 <CustomSelect
 value={selectedClass}
 onChange={(e) => handleModalClassChange(e.target.value)}
 className="bg-transparent text-xs font-extrabold text-emerald-900 dark:text-emerald-300 outline-none cursor-pointer"
 >
 {presensiModalClasses.map((c) => (
 <option key={c.id} value={c.id} className="dark:bg-slate-900 text-slate-900 dark:text-white">
 {c.nama_kelas || c.name}
 </option>
 ))}
 </CustomSelect>
 </div>
 ) : (
 <div className="inline-flex items-center gap-1.5 rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-emerald-50/70 px-2.5 py-1.5 text-xs font-black text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200">
 <GraduationCap className="h-3.5 w-3.5 text-emerald-600" />
 <span>{modalActiveClassName}</span>
 </div>
 )}
 <div className="relative min-w-[180px]">
 <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="search"
 value={attendanceSearch}
 onChange={(e) => setAttendanceSearch(e.target.value)}
 placeholder="Cari nama siswa / NIS..."
 className="h-9 w-full rounded-3xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white pl-8 pr-3 text-xs outline-none focus:border-emerald-600 dark:border-emerald-700/80 dark:bg-slate-900 dark:text-white"
 />
 </div>
 </div>
 </div>

 {/* Data Table Siswa */}
 <div className="border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl overflow-hidden bg-white dark:bg-card-dark">
 <div className="overflow-x-auto max-h-72">
 <table className="w-full text-left text-xs border-collapse">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-emerald-200/80 dark:border-emerald-800/60">
 <th className="p-3 w-10">No</th>
 <th className="p-3">Nama Siswa</th>
 <th className="p-3">NIS / NISN</th>
 <th className="p-3 text-center">Status Kehadiran Siswa</th>
 <th className="p-3">Waktu & Metode</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {students
 .filter((st) => {
 if (selectedClass && selectedClass !== 'all') {
 const sCid = st.kelas_id || st.class_id || st.kelas?.id
 if (!sCid || String(sCid) !== String(selectedClass)) return false
 }
 if (!attendanceSearch.trim()) return true
 const q = attendanceSearch.toLowerCase()
 return (st.nama_lengkap || '').toLowerCase().includes(q) || (st.nis || '').includes(q)
 })
 .map((st, idx) => {
 const currentStatus = attendanceData[st.id]?.status || 'Belum Dicatat'
 const currentRecord = attendanceData[st.id] || {}
 // Izin ortu
 const perm = pendingPermissions[String(st.id)]
 const isPending = perm && ['submitted', 'waiting_verification'].includes(perm.status)
 const isApprovingThis = approvingPermissionId !== null && String(approvingPermissionId) === String(perm?.id)
 return (
 <tr key={st.id} className="hover:bg-emerald-50/40 transition-colors dark:hover:bg-emerald-950/30">
 <td className="p-3 text-slate-400 font-mono text-xs">{idx + 1}</td>
 <td className="p-3 font-bold text-slate-900 dark:text-white">
 {st.nama_lengkap}
 {isPending && (
 <span className="ml-1.5 inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
 ⏳ Izin Pending · {String(perm.type || '').toUpperCase()}
 </span>
 )}
 {perm?.status === 'approved' && (
 <span className="ml-1.5 inline-flex items-center gap-0.5 rounded-full bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold text-sky-800 dark:bg-sky-900/60 dark:text-sky-300">
 ✅ Izin Disetujui
 </span>
 )}
 </td>
 <td className="p-3 text-slate-500 font-mono text-xs">
 {st.nis || st.nisn || '-'}
 </td>
 <td className="p-3 text-center">
 <div className="flex items-center justify-center gap-1">
 {[
 { id: 'Belum Dicatat', tone: 'bg-slate-500' },
 { id: 'Hadir', tone: 'bg-emerald-600 text-white' },
 { id: 'Terlambat', tone: 'bg-amber-500 text-white' },
 { id: 'Izin', tone: 'bg-blue-600 text-white' },
 { id: 'Sakit', tone: 'bg-purple-600 text-white' },
 { id: 'Alpha', tone: 'bg-rose-600 text-white' },
 ].map((option) => (
 <button
 key={option.id}
 type="button"
 onClick={() => markStudentAttendance(st, selectedMethod === 'qr' ? 'QR Code Kartu Siswa' : selectedMethod === 'rfid' ? 'RFID Kartu Siswa' : 'Roll Call Guru', option.id)}
 className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${currentStatus === option.id
 ? `${option.tone} shadow-sm ring-2 ring-emerald-500/40`
 : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
 }`}
 >
 {option.id}
 </button>
 ))}
 </div>
 </td>
 <td className="p-3 text-xs text-slate-500">
 {isPending && (
 <button
 type="button"
 disabled={isApprovingThis}
 onClick={() => handleApprovePermission(perm.id, st.id, perm.type)}
 className="mb-1 inline-flex items-center gap-1 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 transition hover:bg-amber-100 disabled:opacity-60 dark:border-emerald-800/60 dark:bg-amber-900/60 dark:text-amber-300"
 >
 {isApprovingThis
 ? <svg className="h-3 w-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
 : <>✓</>}
 Setujui
 </button>
 )}
 {currentRecord.check_in_time ? (
 <span>{currentRecord.check_in_time} • {currentRecord.method || 'Roll Call'}</span>
 ) : (
 <span className="text-slate-400 italic">Belum dicatat</span>
 )}
 </td>
 </tr>
 )
 })}
 </tbody>
 </table>
 </div>
 </div>
 </>
 )}

 {attendanceCenterTab === 'verifikasi' && (
 <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-emerald-50/50 p-5 space-y-3 dark:border-emerald-800/60 dark:bg-emerald-950/30">
 <div className="flex items-center gap-3">
 <div className="p-3 bg-emerald-600 text-white rounded-xl">
 <CheckCircle2 className="w-6 h-6" />
 </div>
 <div>
 <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Verifikasi Kehadiran oleh Guru Pengajar</h4>
 <p className="text-xs text-slate-500">Pengajar: <strong>{teacherName}</strong> • Rombel {selectedClassName}</p>
 </div>
 </div>
 <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
 Seluruh data kehadiran pada sesi pembelajaran ini telah divalidasi. Menyimpan presensi akan menyinkronkan status ke server akademik & jurnal mengajar harian.
 </p>
 </div>
 )}

 {attendanceCenterTab === 'riwayat' && renderAttendanceHistorySection(true)}

 {attendanceCenterTab === 'catatan' && (
 <div className="space-y-3 text-xs">
 <label className="font-bold block text-slate-700 dark:text-slate-200">Catatan Jurnal KBM & Hasil Pembelajaran</label>
 <textarea
 rows={3}
 value={attendanceMeetingNotes}
 onChange={(e) => setAttendanceMeetingNotes(e.target.value)}
 placeholder="Tuliskan ringkasan materi yang telah diajarkan, catatan khusus siswa, kendala, atau hasil capaian KBM..."
 className="w-full p-3 border rounded-xl dark:bg-slate-900 border-emerald-200/80 dark:border-emerald-700/80 font-semibold text-slate-800 dark:text-slate-100"
 />
 </div>
 )}
 </div>
 </AppModal>

 {/* DETAIL JURNAL TAHFIZH MINGGUAN */}
 {showTahfizhDetail && tahfizhDetailStudent && (
 <AppModal
 isOpen={true}
 onClose={() => setShowTahfizhDetail(false)}
 zIndex={70}
 maxWidth="max-w-4xl"
 title={tahfizhDetailStudent.nama_lengkap}
 badge="Lembar Kegiatan Tahfizh"
 description={`${tahfizhDetailStudent.nis || tahfizhDetailStudent.nisn || 'NIS belum tersedia'} · ${selectedClassName}`}
 icon={BookOpen}
 headerActions={
 <div className="flex items-center gap-2">
 <button type="button" onClick={() => setTahfizhWeekOffset((value) => value - 1)} aria-label="Minggu sebelumnya" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/30 bg-white/20 text-white hover:bg-white/30"><ChevronLeft className="h-4 w-4" /></button>
 <div className="min-w-36 text-center"><p className="text-[10px] font-bold uppercase text-emerald-100">Periode</p><p className="text-xs font-bold text-white">{new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(tahfizhWeekRows[0].date)} – {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(tahfizhWeekRows[6].date)}</p></div>
 <button type="button" onClick={() => setTahfizhWeekOffset((value) => Math.min(value + 1, 0))} disabled={tahfizhWeekOffset >= 0} aria-label="Minggu berikutnya" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/30 bg-white/20 text-white hover:bg-white/30 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
 </div>
 }
 bodyClassName="p-4 sm:p-5"
 footer={
 <button type="button" onClick={() => setShowTahfizhDetail(false)} className="h-9 rounded-xl border border-slate-300 bg-slate-200 hover:bg-slate-300 px-5 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">Tutup Detail</button>
 }
 >
 <div className="space-y-3 lg:hidden">
 {tahfizhWeekRows.map(({ date, dateKey, log }, index) => (
 <article key={dateKey} className="overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 dark:border-emerald-700/80">
 <header className="flex items-center justify-between bg-emerald-50 px-4 py-3 dark:bg-emerald-950/30"><div><p className="text-sm font-black text-slate-900 dark:text-white">{index + 1}. {new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(date)}</p><p className="text-[10px] text-slate-500">{new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(date)}</p></div>{log ? <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white">Terisi</span> : <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-300">Kosong</span>}</header>
 <div className="grid grid-cols-2 gap-px bg-slate-200 text-xs dark:bg-slate-700">
 {[['Tilawah', log?.tilawah_text || '—'], ['Baris Tilawah', log?.tilawah_baris || '—'], ['Hafalan Baru', log?.hafalan_surah_name ? `${log.hafalan_surah_name}, ayat ${log.hafalan_ayah_start}–${log.hafalan_ayah_end}` : '—'], ['Juz / Jumlah', log ? `Juz ${log.metadata?.juz || '-'} · ${log.hafalan_baris || 0} ayat` : '—'], ['Murajaah', log?.murajaah_text || '—'], ['Lembar', log?.murajaah_lembar || '—'], ['Catatan', log?.notes_teacher || '—'], ['Tanda tangan', log?.signature_teacher ? 'Sudah ditandatangani' : '—']].map(([label, value]) => <div key={label} className="min-w-0 bg-white p-3 dark:bg-card-dark"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 break-words font-semibold text-slate-800 dark:text-slate-100">{value}</p></div>)}
 </div>
 </article>
 ))}
 </div>
 <table className="hidden w-full table-fixed border-collapse text-[10px] xl:text-xs lg:table [&_td]:!p-2 [&_td]:break-words [&_th]:!p-2">
 <colgroup><col className="w-[3.5%]" /><col className="w-[11%]" /><col className="w-[10%]" /><col className="w-[5%]" /><col className="w-[17%]" /><col className="w-[7%]" /><col className="w-[11%]" /><col className="w-[6%]" /><col className="w-[20%]" /><col className="w-[9.5%]" /></colgroup>
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300"><tr className="bg-emerald-100 text-slate-900 dark:bg-emerald-950/60 dark:text-emerald-100"><th className="border border-emerald-200/80 dark:border-emerald-800/60 p-2.5">No</th><th className="border border-emerald-200/80 dark:border-emerald-800/60 p-2.5 text-left">Hari/Tanggal</th><th className="border border-emerald-200/80 dark:border-emerald-800/60 p-2.5">Tilawah</th><th className="border border-emerald-200/80 dark:border-emerald-800/60 p-2.5">Baris</th><th className="border border-emerald-200/80 dark:border-emerald-800/60 p-2.5">Hafalan Baru</th><th className="border border-emerald-200/80 dark:border-emerald-800/60 p-2.5">Baris/Ayat</th><th className="border border-emerald-200/80 dark:border-emerald-800/60 p-2.5">Murajaah</th><th className="border border-emerald-200/80 dark:border-emerald-800/60 p-2.5">Lembar</th><th className="border border-emerald-200/80 dark:border-emerald-800/60 p-2.5">Catatan</th><th className="border border-emerald-200/80 dark:border-emerald-800/60 p-2.5">Ttd</th></tr></thead>
 <tbody>{tahfizhWeekRows.map(({ date, dateKey, log }, index) => <tr key={dateKey} className="h-24 align-top hover:bg-emerald-50/40 transition-colors dark:hover:bg-emerald-950/30"><td className="border border-emerald-200/80 dark:border-emerald-800/60 p-3 text-center font-bold dark:border-slate-600">{index + 1}</td><td className="border border-emerald-200/80 dark:border-emerald-800/60 p-3 dark:border-slate-600"><p className="font-bold text-slate-900 dark:text-white">{new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(date)}</p><p className="mt-1 text-[10px] text-slate-500">{new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)}</p></td><td className="border border-emerald-200/80 dark:border-emerald-800/60 p-3 dark:border-slate-600">{log?.tilawah_text || '—'}</td><td className="border border-emerald-200/80 dark:border-emerald-800/60 p-3 text-center dark:border-slate-600">{log?.tilawah_baris || '—'}</td><td className="border border-emerald-200/80 dark:border-emerald-800/60 p-3 dark:border-slate-600">{log?.hafalan_surah_name ? <><p className="font-bold">{log.hafalan_surah_name}</p><p className="mt-1 text-[10px] text-slate-500">Ayat {log.hafalan_ayah_start}–{log.hafalan_ayah_end} · Juz {log.metadata?.juz || '-'}</p></> : '—'}</td><td className="border border-emerald-200/80 dark:border-emerald-800/60 p-3 text-center dark:border-slate-600">{log?.hafalan_baris || (log ? `${Number(log.hafalan_ayah_end) - Number(log.hafalan_ayah_start) + 1} ayat` : '—')}</td><td className="border border-emerald-200/80 dark:border-emerald-800/60 p-3 dark:border-slate-600">{log?.murajaah_text || '—'}</td><td className="border border-emerald-200/80 dark:border-emerald-800/60 p-3 text-center dark:border-slate-600">{log?.murajaah_lembar || '—'}</td><td className="border border-emerald-200/80 dark:border-emerald-800/60 p-3 dark:border-slate-600">{log?.notes_teacher || '—'}</td><td className="border border-emerald-200/80 dark:border-emerald-800/60 p-3 text-center dark:border-slate-600">{log?.signature_teacher ? <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-600" aria-label="Sudah ditandatangani" /> : '—'}</td></tr>)}</tbody>
 <tfoot><tr className="bg-slate-50 align-top dark:bg-slate-800/60"><td colSpan="8" className="h-20 border border-emerald-200/80 dark:border-emerald-800/60 p-3 dark:border-slate-600"><strong>Catatan Guru:</strong><p className="mt-1 font-normal text-slate-600 dark:text-slate-300">{tahfizhWeekRows.map(({ log }) => log?.notes_teacher).filter(Boolean).at(-1) || 'Belum ada catatan guru pada minggu ini.'}</p></td><td colSpan="2" className="border border-emerald-200/80 dark:border-emerald-800/60 p-3 dark:border-slate-600"><strong>Guru:</strong><p className="mt-2 font-normal">{teacherName}</p></td></tr><tr className="bg-slate-50 align-top dark:bg-slate-800/60"><td colSpan="8" className="h-20 border border-emerald-200/80 dark:border-emerald-800/60 p-3 dark:border-slate-600"><strong>Catatan Orang Tua:</strong><p className="mt-1 font-normal text-slate-600 dark:text-slate-300">{tahfizhWeekRows.map(({ log }) => log?.notes_parent).filter(Boolean).at(-1) || 'Belum ada catatan orang tua pada minggu ini.'}</p></td><td colSpan="2" className="border border-emerald-200/80 dark:border-emerald-800/60 p-3 dark:border-slate-600"><strong>Ttd Orang Tua:</strong><p className="mt-2 font-normal">{tahfizhWeekRows.some(({ log }) => log?.signature_parent) ? 'Sudah ditandatangani' : 'Belum ditandatangani'}</p></td></tr></tfoot>
 </table>
 </AppModal>
 )}

 {/* CREATE / EDIT / DELETE MODALS */}
 <AppModal
 isOpen={showModal}
 onClose={() => {
 setShowModal(false)
 setEditingId(null)
 if (modalType === 'tugas') {
 setSoalList([])
 resetSoalForm()
 }
 }}
 zIndex={50}
 variant={modalType === 'delete-confirm' ? 'danger' : 'emerald'}
 maxWidth={modalType === 'delete-confirm' ? 'max-w-md' : modalType === 'tahfizh' ? 'max-w-4xl' : 'max-w-xl'}
 title={
 modalType === 'materi'
 ? undefined
 : modalType === 'delete-confirm'
 ? 'Konfirmasi Hapus Data'
 : modalType === 'tahfizh'
 ? "Pencatatan Setoran Tahfizh Al-Qur'an"
 : `${editingId ? 'Edit' : 'Form Input'} ${modalType}`
 }
 badge={
 modalType === 'delete-confirm'
 ? 'Hapus Permanen'
 : modalType === 'tahfizh'
 ? (editingId ? 'Edit Setoran' : 'Input Setoran Baru')
 : undefined
 }
 description={
 modalType === 'tahfizh'
 ? 'Bimbingan dan evaluasi capaian hafalan santri/siswa sesuai target kurikulum'
 : undefined
 }
 icon={
 modalType === 'delete-confirm'
 ? AlertTriangle
 : modalType === 'tahfizh'
 ? BookOpen
 : modalType === 'materi'
 ? undefined
 : Plus
 }
 bodyClassName={modalType === 'materi' ? 'p-0 space-y-0 max-h-[92vh]' : 'p-5 sm:p-6 space-y-4'}
 footer={
 modalType === 'delete-confirm' ? (
 <>
 <button
 type="button"
 onClick={() => setShowModal(false)}
 className="px-4 py-2 border border-slate-300 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200"
 >
 Batal
 </button>
 <button
 type="button"
 onClick={handleExecuteDelete}
 className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md"
 >
 Ya, Hapus Data
 </button>
 </>
 ) : modalType === 'tugas' ? (
 <>
 <button type="button" onClick={() => { setShowModal(false); setEditingId(null); }} className="px-4 py-2 border border-slate-300 bg-slate-200 hover:bg-slate-300 rounded-xl text-slate-700 dark:bg-slate-800 dark:text-slate-200 font-black text-xs">
 Batal
 </button>
 <button type="submit" form="form-tugas" disabled={savingTugas} className="inline-flex min-w-32 items-center justify-center gap-2 px-4 py-2 bg-[#059669] hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md disabled:cursor-wait disabled:opacity-60">
 {savingTugas && <RefreshCw className="h-4 w-4 animate-spin" />}
 {savingTugas ? 'Menerbitkan...' : editingId ? 'Perbarui Tugas' : 'Terbitkan Tugas'}
 </button>
 </>
 ) : modalType === 'tahfizh' ? (
 <>
 <button
 type="button"
 onClick={() => setShowModal(false)}
 className="h-9 px-5 border border-slate-300 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 rounded-xl text-slate-700 font-black text-xs transition"
 >
 Batal
 </button>
 <button
 type="submit"
 form="form-tahfizh"
 disabled={savingTahfizh || loadingSurahs || !tahfizhForm.student_id || !tahfizhForm.surah_number}
 className="h-9 inline-flex min-w-40 items-center justify-center gap-2 px-6 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-black shadow-md disabled:opacity-50 active:scale-95 transition text-white text-xs"
 >
 {savingTahfizh && <RefreshCw className="h-4 w-4 animate-spin" />}
 {savingTahfizh ? 'Menyimpan...' : 'Simpan Setoran Tahfizh'}
 </button>
 </>
 ) : modalType === 'catatan' ? (
 <>
 <button type="button" onClick={() => { setShowModal(false); setEditingId(null); }} className="px-4 py-2 border border-slate-300 bg-slate-200 hover:bg-slate-300 rounded-xl text-slate-700 dark:bg-slate-800 dark:text-slate-200 font-black text-xs">
 Batal
 </button>
 <button type="submit" form="form-catatan" disabled={savingStudentNote} className="inline-flex min-w-36 items-center justify-center gap-2 rounded-xl bg-[#059669] hover:bg-emerald-700 px-4 py-2 font-bold text-xs text-white shadow-md disabled:opacity-60">
 {savingStudentNote && <RefreshCw className="h-4 w-4 animate-spin" />}{savingStudentNote ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Simpan Catatan'}
 </button>
 </>
 ) : modalType === 'pelanggaran' ? (
 <>
 <button
 type="button"
 onClick={() => setShowModal(false)}
 className="rounded-xl border border-slate-300 bg-slate-200 hover:bg-slate-300 px-4 py-2 font-black text-xs text-slate-700 transition dark:bg-slate-800 dark:text-slate-200"
 >
 Batal
 </button>
 <button
 type="submit"
 form="form-pelanggaran"
 disabled={savingPelanggaran}
 className="inline-flex min-w-36 items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 font-bold text-xs shadow-md transition disabled:opacity-60 cursor-pointer"
 >
 {savingPelanggaran && <RefreshCw className="h-4 w-4 animate-spin" />}
 {savingPelanggaran ? 'Menyimpan...' : 'Simpan Penilaian Perilaku'}
 </button>
 </>
 ) : null
 }
 >
 {modalType === 'delete-confirm' ? (
 <div role="alertdialog" aria-modal="true" aria-labelledby="delete-confirm-title" className="space-y-4 text-center py-2">
 <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
 <AlertTriangle className="w-6 h-6" />
 </div>
 <div>
 <h3 id="delete-confirm-title" className="text-base font-bold text-slate-900 dark:text-white">Konfirmasi Hapus Data</h3>
 <p className="text-xs text-slate-500 mt-1">
 Apakah Anda yakin ingin menghapus data <strong>{deleteTarget?.title}</strong>? Tindakan ini tidak dapat dibatalkan.
 </p>
 </div>
 </div>
 ) : modalType === 'materi' ? (
 <MateriModalForm
 initialData={materiForm}
 editingId={editingId}
 saving={savingMaterial}
 onSave={handleSaveMateri}
 onClose={() => { setShowModal(false); setEditingId(null); }}
 />
 ) : (
 <>
 {modalType === 'tugas' && (
 <form id="form-tugas" onSubmit={handleSaveTugas} className="space-y-3.5 text-xs">
 {/* Format Selector: Tugas PR vs Kuis CBT */}
 <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 flex items-center gap-1">
 <button
 type="button"
 onClick={() => setTugasForm({ ...tugasForm, jenis_tugas: 'tugas' })}
 className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${tugasForm.jenis_tugas !== 'quiz'
 ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
 : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
 }`}
 >
 <FileText className="w-3.5 h-3.5" />
 Penugasan / PR Harian
 </button>
 <button
 type="button"
 onClick={() => setTugasForm({ ...tugasForm, jenis_tugas: 'quiz', tipe_tugas: 'online' })}
 className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${tugasForm.jenis_tugas === 'quiz'
 ? 'bg-white dark:bg-card-dark shadow-sm font-black'
 : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
 }`}
 >
 <Zap className="w-3.5 h-3.5" />
 Kuis Interaktif (Style CBT)
 </button>
 </div>

 {/* Banner Info Kuis CBT */}
 {tugasForm.jenis_tugas === 'quiz' && (
 <div className="p-3 rounded-xl bg-white dark:bg-card-dark dark:from-violet-950/40 dark:to-indigo-950/40 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
 <div className="flex items-center gap-2 text-violet-800 dark:text-violet-300 font-bold text-xs">
 <Zap className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
 <span>Mode Kuis CBT Interaktif Terpadu</span>
 </div>
 <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
 Siswa akan mengerjakan kuis dalam antarmuka interaktif ala ujian CBT (dilengkapi timer, nomor soal, dan pilihan opsi A/B/C/D). Soal <strong>Pilihan Ganda & Benar/Salah</strong> akan dinilai <strong>otomatis oleh sistem</strong> begitu kuis dikumpulkan dan langsung terkirim ke portal/aplikasi orang tua!
 </p>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
 <div>
 <label className="block text-[10px] font-extrabold uppercase tracking-wider text-violet-900 dark:text-violet-200 mb-1">
 ⏱️ Durasi Pengerjaan Kuis (Menit)
 </label>
 <input
 type="number"
 min="5"
 max="180"
 value={tugasForm.durasi_menit || 30}
 onChange={(e) => setTugasForm({ ...tugasForm, durasi_menit: Number(e.target.value) })}
 className="h-9 w-full rounded-3xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white px-3 text-xs font-bold text-violet-900 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-violet-200 outline-none focus:ring-2 focus:ring-violet-500"
 placeholder="30"
 />
 </div>
 <div>
 <label className="block text-[10px] font-extrabold uppercase tracking-wider text-violet-900 dark:text-violet-200 mb-1">
 🎯 Nilai KKM Kuis (0-100)
 </label>
 <input
 type="number"
 min="0"
 max="100"
 value={tugasForm.nilai_kkm || 75}
 onChange={(e) => setTugasForm({ ...tugasForm, nilai_kkm: Number(e.target.value) })}
 className="h-9 w-full rounded-3xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white px-3 text-xs font-bold text-violet-900 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-violet-200 outline-none focus:ring-2 focus:ring-violet-500"
 placeholder="75"
 />
 </div>
 </div>
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 <div>
 <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">Rombel / Kelas <span className="text-rose-500">*</span></label>
 <CustomSelect
 value={tugasForm.class_id || getCurrentClassId()}
 onChange={(e) => {
 const newClassId = e.target.value
 const pool = schedules.length > 0 ? schedules : allTeacherSchedules
 const matchSch = pool.find((s) => String(s.class_id || s.kelas_id || s.kelas?.id || s.class?.id) === String(newClassId))
 setTugasForm({
 ...tugasForm,
 class_id: newClassId,
 subject_id: matchSch?.subject_id || matchSch?.subject?.id || tugasForm.subject_id || '',
 })
 }}
 className="h-9 w-full border rounded-xl bg-white px-3 dark:bg-slate-800 border-emerald-200/80 dark:border-emerald-700/80 font-semibold"
 >
 {classes.map((c) => (
 <option key={c.id} value={c.id}>
 {c.nama_kelas || c.name}
 </option>
 ))}
 </CustomSelect>
 </div>
 <div>
 <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">Mata Pelajaran <span className="text-rose-500">*</span></label>
 <CustomSelect
 value={tugasForm.subject_id || getCurrentSubjectId()}
 onChange={(e) => setTugasForm({ ...tugasForm, subject_id: e.target.value })}
 className="h-9 w-full border rounded-xl bg-white px-3 dark:bg-slate-800 border-emerald-200/80 dark:border-emerald-700/80 font-semibold"
 >
 {(() => {
 const pool = schedules.length > 0 ? schedules : allTeacherSchedules
 const activeClassId = tugasForm.class_id || getCurrentClassId()
 const filtered = pool.filter((s) =>
 !activeClassId || String(s.class_id || s.kelas_id || s.kelas?.id || s.class?.id) === String(activeClassId)
 )
 if (filtered.length > 0) {
 return filtered.map((s) => (
 <option key={s.id} value={s.subject_id || s.subject?.id}>
 {s.subject?.name || s.subject?.nama_mapel || 'Mata Pelajaran'}
 </option>
 ))
 }
 const fallbackId = getCurrentSubjectId()
 const fallbackLabel = getScheduleSubject(getCurrentSchedule() || {})
 return <option value={fallbackId}>{fallbackLabel || 'Mata Pelajaran'}</option>
 })()}
 </CustomSelect>
 </div>
 </div>

 {/* Multi-Materi Selection Section */}
 <div className="rounded-xl border border-dashed border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 dark:bg-slate-900/50 dark:from-emerald-950/25 dark:via-teal-950/15 dark:to-emerald-950/25 p-3.5 space-y-2.5">
 <div className="flex items-center justify-between flex-wrap gap-1.5">
 <label className="font-bold text-slate-800 dark:text-emerald-300 flex items-center gap-1.5 text-xs">
 <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
 Tautkan Materi Belajar <span className="text-slate-400 font-normal">(Bisa Lebih dari Satu)</span>
 {(tugasForm.materi_ids || []).length > 0 && (
 <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px]">
 {(tugasForm.materi_ids || []).length} Materi Dipilih
 </span>
 )}
 </label>
 {(tugasForm.materi_ids || []).length > 0 && (
 <button
 type="button"
 onClick={() => setTugasForm((prev) => ({ ...prev, materi_id: '', materi_ids: [] }))}
 className="text-[10px] text-rose-600 hover:text-rose-700 hover:underline font-semibold"
 >
 ✕ Hapus Semua Tautan
 </button>
 )}
 </div>

 {/* Dropdown to add another material */}
 {(() => {
 const activeClass = tugasForm.class_id || getCurrentClassId()
 const activeSubj = tugasForm.subject_id || getCurrentSubjectId()
 const currentIds = tugasForm.materi_ids || (tugasForm.materi_id ? [tugasForm.materi_id] : [])
 const availableMaterials = materials.filter((m) => {
 const mClass = m.class_id || m.kelas_id || m.modul_ajar?.kelas_id
 const mSubj = m.subject_id || m.mata_pelajaran_id || m.modul_ajar?.mata_pelajaran_id
 const matchesClass = !activeClass || !mClass || String(mClass) === String(activeClass)
 const matchesSubj = !activeSubj || !mSubj || String(mSubj) === String(activeSubj)
 const isAlreadySelected = currentIds.includes(m.id)
 return matchesClass && matchesSubj && !isAlreadySelected
 })

 return (
 <CustomSelect
 value=""
 onChange={(e) => {
 const newId = e.target.value
 if (!newId) return
 const chosen = materials.find((m) => String(m.id) === String(newId))
 setTugasForm((prev) => {
 const prevIds = Array.isArray(prev.materi_ids) ? prev.materi_ids : (prev.materi_id ? [prev.materi_id] : [])
 const updatedIds = prevIds.includes(newId) ? prevIds : [...prevIds, newId]
 return {
 ...prev,
 materi_id: updatedIds[0] || newId,
 materi_ids: updatedIds,
 judul: !prev.judul || prev.judul.startsWith('Latihan: ') || prev.judul.trim() === ''
 ? (chosen ? `Latihan: ${chosen.judul}` : prev.judul)
 : prev.judul,
 instruksi: !prev.instruksi || prev.instruksi.includes('Silakan pelajari materi') || prev.instruksi.trim() === ''
 ? (chosen
 ? (chosen.ringkasan
 ? `Silakan pelajari materi "${chosen.judul}" (${chosen.ringkasan}) lalu kerjakan penugasan ini.`
 : `Pelajari materi "${chosen.judul}" lalu selesaikan evaluasi pemahaman berikut.`)
 : prev.instruksi)
 : prev.instruksi,
 }
 })
 }}
 className="h-9 w-full border rounded-xl bg-white px-3 dark:bg-slate-800 border-emerald-200/80 dark:border-emerald-700/80 font-medium text-xs text-slate-700 dark:text-slate-200 cursor-pointer focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
 >
 <option value="">
 {availableMaterials.length === 0 && currentIds.length > 0
 ? '✓ Seluruh materi pada kelas & mapel ini telah ditautkan'
 : '+ Pilih Materi Belajar untuk Ditambahkan...'}
 </option>
 {availableMaterials.map((m) => (
 <option key={m.id} value={m.id}>
 📖 {m.urutan ? `[Pekan ${String(m.urutan).padStart(2, '0')}] ` : ''}{m.judul} ({m.status === 'published' ? 'Published' : 'Draft'})
 </option>
 ))}
 </CustomSelect>
 )
 })()}

 {/* Selected Materials List / Badges */}
 {(() => {
 const currentIds = tugasForm.materi_ids || (tugasForm.materi_id ? [tugasForm.materi_id] : [])
 const selectedList = currentIds
 .map((id) => materials.find((m) => String(m.id) === String(id)) || { id, judul: 'Materi Pembelajaran' })

 if (selectedList.length === 0) {
 return (
 <p className="text-xs text-slate-500 dark:text-slate-400 italic">
 Belum ada materi pembelajaran yang ditautkan. Tugas ini bersifat mandiri tanpa rujukan modul materi khusus.
 </p>
 )
 }

 return (
 <div className="space-y-1.5 pt-1">
 <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
 Daftar Materi Belajar Tertaut ({selectedList.length}):
 </p>
 <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
 {selectedList.map((m, idx) => (
 <div
 key={m.id || idx}
 className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs text-xs"
 >
 <div className="flex items-center gap-2 min-w-0">
 <span className="w-5 h-5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center justify-center shrink-0">
 {idx + 1}
 </span>
 <div className="min-w-0">
 <p className="font-bold text-slate-800 dark:text-slate-100 truncate text-xs">
 {m.judul}
 </p>
 {m.ringkasan && (
 <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
 {m.ringkasan}
 </p>
 )}
 </div>
 </div>
 <div className="flex items-center gap-1.5 shrink-0">
 {m.status && (
 <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${m.status === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:border-emerald-800/60' : 'bg-slate-100 text-slate-600'}`}>
 {m.status === 'published' ? 'Published' : 'Draft'}
 </span>
 )}
 <button
 type="button"
 onClick={() => {
 setTugasForm((prev) => {
 const prevIds = Array.isArray(prev.materi_ids) ? prev.materi_ids : (prev.materi_id ? [prev.materi_id] : [])
 const filtered = prevIds.filter((id) => String(id) !== String(m.id))
 return {
 ...prev,
 materi_id: filtered[0] || '',
 materi_ids: filtered,
 }
 })
 }}
 className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
 title="Lepas materi ini dari tugas"
 >
 <X className="w-4 h-4" />
 </button>
 </div>
 </div>
 ))}
 </div>
 <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
 <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
 Terhubung ke {selectedList.length} materi. Siswa akan mendapatkan tombol rujukan langsung ke seluruh materi ini di aplikasi mobile & portal.
 </p>
 </div>
 )
 })()}
 </div>

 <div>
 <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">Judul Tugas <span className="text-rose-500">*</span></label>
 <input
 type="text"
 required
 value={tugasForm.judul}
 onChange={(e) => setTugasForm({ ...tugasForm, judul: e.target.value })}
 className="h-9 w-full p-2.5 border rounded-xl dark:bg-slate-800 border-emerald-200/80 dark:border-emerald-700/80"
 placeholder="Contoh: Latihan Soal Bab 1 Mufradat Harian"
 />
 </div>

 <div>
 <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">Instruksi / Petunjuk Pengerjaan <span className="text-rose-500">*</span></label>
 <textarea
 rows={2}
 required
 value={tugasForm.instruksi}
 onChange={(e) => setTugasForm({ ...tugasForm, instruksi: e.target.value })}
 className="w-full p-2.5 border rounded-xl dark:bg-slate-800 border-emerald-200/80 dark:border-emerald-700/80"
 placeholder="Petunjuk umum pengerjaan, buku rujukan, atau arahan waktu..."
 />
 </div>

 {/* ── BANK-SOAL STYLE FORM ── */}
 <div id="soalFormSection" className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 dark:border-emerald-700/80 overflow-hidden">
 {/* Header */}
 <div className="px-4 py-3 bg-white dark:bg-card-dark dark:from-[#059669]/20 dark:to-emerald-950/20 border-b border-emerald-200/80 dark:border-emerald-700/80 flex items-center justify-between">
 <div>
 <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
 <span className="w-6 h-6 rounded-lg bg-[#059669] text-white flex items-center justify-center text-[10px] font-black">S</span>
 Form Butir Soal
 </h4>
 <p className="text-[10px] text-slate-400 mt-0.5">Tambahkan soal satu per satu. Soal tersimpan setelah terbitkan tugas.</p>
 </div>
 {editingSoalIdx !== null && (
 <button type="button" onClick={resetSoalForm}
 className="text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-1 rounded-lg hover:bg-amber-100 transition">
 ✕ Batal Edit Soal #{editingSoalIdx + 1}
 </button>
 )}
 </div>

 <div className="p-4 space-y-4">
 {/* Auto-tipe info badge */}
 {editingSoalIdx === null && (() => {
 const nextNum = soalList.length + 1
 const autoTipe = getAutoTipe(soalList.length)
 const autoLabel = { pg: '🔘 Pilihan Ganda', esai: '📝 Essay / Esai', benar_salah: '✅ Benar/Salah', menjodohkan: '🔗 Menjodohkan' }[autoTipe] || autoTipe
 const autoColor = { pg: 'bg-emerald-50 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800/60 dark:text-emerald-300', esai: 'bg-violet-50 border-emerald-200/80 dark:border-emerald-800/60 text-violet-800 dark:bg-violet-950/30 dark:border-emerald-800/60 dark:text-violet-300', benar_salah: 'bg-blue-50 border-emerald-200/80 dark:border-emerald-800/60 text-blue-800 dark:bg-blue-950/30 dark:border-emerald-800/60 dark:text-blue-300', menjodohkan: 'bg-amber-50 border-emerald-200/80 dark:border-emerald-800/60 text-amber-800 dark:bg-amber-950/30 dark:border-emerald-800/60 dark:text-amber-300' }[autoTipe] || 'bg-slate-50 border-emerald-200/80 text-slate-700'
 return (
 <div className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold ${autoColor}`}>
 <span>✨ Soal #{nextNum}: <strong>{autoLabel}</strong></span>
 </div>
 )
 })()}

 {/* Tipe Soal Selector */}
 <div>
 <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider">Tipe Soal</label>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
 {[
 { id: 'pg', label: 'Pilihan Ganda', emoji: '🔘' },
 { id: 'esai', label: 'Essay / Esai', emoji: '📝' },
 { id: 'benar_salah', label: 'Benar / Salah', emoji: '✅' },
 { id: 'menjodohkan', label: 'Menjodohkan', emoji: '🔗' },
 ].map((t) => {
 const isSelected = soalForm.tipe === t.id
 return (
 <button
 key={t.id}
 type="button"
 onClick={() => handleSoalTypeChange(t.id)}
 className={[
 'flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-semibold transition-all',
 isSelected
 ? 'border-[#059669] bg-emerald-50 dark:bg-emerald-950/60 text-[#059669] dark:text-emerald-300 ring-2 ring-[#059669]/30'
 : 'border-emerald-200/80 dark:border-emerald-700/80 bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-50',
 ].join(' ')}
 >
 <span className="text-base leading-none">{t.emoji}</span>
 <span className="leading-tight">{t.label}</span>
 </button>
 )
 })}
 </div>
 </div>

 {/* Teks Pertanyaan */}
 <div>
 <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
 Teks Pertanyaan / Soal <span className="text-rose-500">*</span>
 </label>
 <textarea
 rows={3}
 value={soalForm.pertanyaan}
 onChange={(e) => setSoalForm((p) => ({ ...p, pertanyaan: e.target.value }))}
 className="w-full p-2.5 text-xs border rounded-xl dark:bg-slate-800 border-emerald-200/80 dark:border-emerald-700/80 focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669]"
 placeholder="Tuliskan butir soal atau instruksi pertanyaan di sini..."
 />
 </div>

 {/* ── DYNAMIC SECTION BY TYPE ── */}

 {/* Pilihan Ganda */}
 {soalForm.tipe === 'pg' && (
 <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 space-y-2.5">
 <h5 className="text-[10px] font-bold text-[#059669] dark:text-emerald-300 uppercase tracking-wider">Opsi Jawaban & Kunci PG</h5>
 {['a', 'b', 'c', 'd', 'e'].map((opt) => {
 const isCorrect = soalForm.kunci_jawaban === opt.toUpperCase()
 return (
 <div key={opt} className="flex items-center gap-2">
 <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
 <input
 type="radio"
 name="kunci_pg"
 checked={isCorrect}
 onChange={() => setSoalForm((p) => ({ ...p, kunci_jawaban: opt.toUpperCase() }))}
 className="w-3.5 h-3.5 text-[#059669] focus:ring-[#059669]"
 />
 <span className={['w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center', isCorrect ? 'bg-[#059669] text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'].join(' ')}>
 {opt.toUpperCase()}
 </span>
 </label>
 <input
 type="text"
 placeholder={`Teks Opsi ${opt.toUpperCase()}`}
 value={soalForm[`opsi_${opt}`]}
 onChange={(e) => setSoalForm((p) => ({ ...p, [`opsi_${opt}`]: e.target.value }))}
 className="w-full px-2.5 py-1.5 text-xs rounded-lg border-2 border-[#b6f6d9] dark:border-emerald-800/60 dark:border-emerald-700/80 bg-white dark:bg-slate-800"
 />
 </div>
 )
 })}
 <p className="text-[10px] text-slate-400 italic">* Pilih radio di kiri untuk menandai kunci jawaban yang benar.</p>
 </div>
 )}

 {/* Essay */}
 {soalForm.tipe === 'esai' && (
 <div className="bg-violet-50/50 dark:bg-violet-950/20 p-3.5 rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 space-y-2">
 <h5 className="text-[10px] font-bold text-violet-800 dark:text-violet-300 uppercase tracking-wider">Kunci Jawaban / Pedoman Penskoran Essay</h5>
 <textarea
 rows={3}
 placeholder="Tuliskan kunci acuan, poin penting, atau kata kunci jawaban siswa..."
 value={soalForm.kunci_jawaban}
 onChange={(e) => setSoalForm((p) => ({ ...p, kunci_jawaban: e.target.value }))}
 className="w-full px-2.5 py-2 text-xs rounded-3xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 dark:border-emerald-700/80 bg-white dark:bg-slate-800"
 />
 </div>
 )}

 {/* Benar / Salah */}
 {soalForm.tipe === 'benar_salah' && (
 <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3.5 rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 space-y-2.5">
 <h5 className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Kunci Jawaban Benar / Salah</h5>
 <div className="flex gap-3">
 {['Benar', 'Salah'].map((val) => (
 <label key={val} className={['flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer font-bold text-xs transition-all', soalForm.kunci_jawaban === val ? 'bg-emerald-600 text-white border-slate-600 shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-emerald-200/80 dark:border-emerald-700/80'].join(' ')}>
 <input
 type="radio"
 name="kunci_bs"
 checked={soalForm.kunci_jawaban === val}
 onChange={() => setSoalForm((p) => ({ ...p, kunci_jawaban: val }))}
 className="hidden"
 />
 {val === 'Benar' ? '✅' : '❌'} {val}
 </label>
 ))}
 </div>
 </div>
 )}

 {/* Menjodohkan */}
 {soalForm.tipe === 'menjodohkan' && (
 <div className="bg-amber-50/50 dark:bg-amber-950/20 p-3.5 rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 space-y-2.5">
 <div className="flex items-center justify-between">
 <h5 className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Pasangan Menjodohkan</h5>
 <button type="button" onClick={() => setSoalForm((p) => ({ ...p, matchingPairs: [...p.matchingPairs, { kiri: '', kanan: '' }] }))}
 className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition">
 + Pasangan
 </button>
 </div>
 {soalForm.matchingPairs.map((pair, idx) => (
 <div key={idx} className="flex items-center gap-2">
 <span className="text-[10px] font-bold text-amber-600 w-4 text-center">{idx + 1}.</span>
 <input type="text" placeholder="Item Kiri" value={pair.kiri}
 onChange={(e) => setSoalForm((p) => ({ ...p, matchingPairs: p.matchingPairs.map((mp, i) => i === idx ? { ...mp, kiri: e.target.value } : mp) }))}
 className="w-1/2 px-2 py-1.5 text-xs rounded-lg border-2 border-[#b6f6d9] dark:border-emerald-800/60 dark:border-emerald-700/80 bg-white dark:bg-slate-800" />
 <span className="text-slate-400 text-xs">→</span>
 <input type="text" placeholder="Item Kanan" value={pair.kanan}
 onChange={(e) => setSoalForm((p) => ({ ...p, matchingPairs: p.matchingPairs.map((mp, i) => i === idx ? { ...mp, kanan: e.target.value } : mp) }))}
 className="w-1/2 px-2 py-1.5 text-xs rounded-lg border-2 border-[#b6f6d9] dark:border-emerald-800/60 dark:border-emerald-700/80 bg-white dark:bg-slate-800" />
 {soalForm.matchingPairs.length > 1 && (
 <button type="button" onClick={() => setSoalForm((p) => ({ ...p, matchingPairs: p.matchingPairs.filter((_, i) => i !== idx) }))}
 className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1 rounded-lg">✕</button>
 )}
 </div>
 ))}
 </div>
 )}

 {/* Metadata: Poin, Kesulitan, Indikator, Pembahasan */}
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Poin Soal</label>
 <input type="number" step="0.5" min="0" max="100" value={soalForm.poin}
 onChange={(e) => setSoalForm((p) => ({ ...p, poin: parseFloat(e.target.value) || 0 }))}
 className="w-full px-2.5 py-2 text-xs rounded-3xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 dark:border-emerald-700/80 bg-white dark:bg-slate-800" />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Tingkat Kesulitan</label>
 <CustomSelect value={soalForm.tingkat_kesulitan}
 onChange={(e) => setSoalForm((p) => ({ ...p, tingkat_kesulitan: e.target.value }))}
 className="w-full px-2.5 py-2 text-xs rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 dark:border-emerald-700/80 bg-white dark:bg-slate-800">
 <option value="mudah">😊 Mudah</option>
 <option value="sedang">🤔 Sedang</option>
 <option value="sulit">🔥 Sulit</option>
 </CustomSelect>
 </div>
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Indikator / Kompetensi (Opsional)</label>
 <input type="text" placeholder="Contoh: Siswa mampu mengidentifikasi tata cara shalat..." value={soalForm.indikator}
 onChange={(e) => setSoalForm((p) => ({ ...p, indikator: e.target.value }))}
 className="w-full px-2.5 py-2 text-xs rounded-3xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 dark:border-emerald-700/80 bg-white dark:bg-slate-800" />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Pembahasan / Penjelasan (Opsional)</label>
 <textarea rows={2} placeholder="Tuliskan pembahasan singkat atau alasan kunci jawaban..." value={soalForm.pembahasan}
 onChange={(e) => setSoalForm((p) => ({ ...p, pembahasan: e.target.value }))}
 className="w-full px-2.5 py-2 text-xs rounded-3xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 dark:border-emerald-700/80 bg-white dark:bg-slate-800" />
 </div>

 {/* Add/Update Soal Button */}
 <div className="flex items-center justify-between gap-3">
 <div className="text-xs text-slate-400 flex items-center gap-1.5">
 {editingSoalIdx === null ? (
 <>
 <span>Menambahkan Soal #{soalList.length + 1}</span>
 {(() => {
 const autoTipe = getAutoTipe(soalList.length)
 const badge = { pg: { cls: 'bg-emerald-100 text-emerald-800', lbl: '🔘 PG' }, esai: { cls: 'bg-violet-100 text-violet-800', lbl: '📝 Essay' }, benar_salah: { cls: 'bg-blue-100 text-blue-800', lbl: '✅ B/S' }, menjodohkan: { cls: 'bg-amber-100 text-amber-800', lbl: '🔗 Jodoh' } }[autoTipe] || { cls: 'bg-slate-100 text-slate-700', lbl: autoTipe }
 return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.cls}`}>{badge.lbl}</span>
 })()}
 </>
 ) : (
 <span className="text-amber-600 font-semibold">Mengedit Soal #{editingSoalIdx + 1}</span>
 )}
 </div>
 <button type="button" onClick={handleAddSoal}
 className={['inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-md active:scale-95 transition-all', editingSoalIdx !== null ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#059669] hover:bg-emerald-700'].join(' ')}>
 {editingSoalIdx !== null ? '✏️ Perbarui Soal #' + (editingSoalIdx + 1) : '✅ Simpan Soal #' + (soalList.length + 1)}
 </button>
 </div>
 </div>

 {/* ── Mini Datatable Soal ── */}
 <div className="border-t border-emerald-200/80 dark:border-emerald-700/80">
 <div className="px-4 py-2.5 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
 <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
 📋 Daftar Soal ({soalList.length} Soal)
 </h5>
 <div className="flex items-center gap-2">
 {soalList.length > 0 && (
 <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/60">
 Total Poin: {soalList.reduce((acc, s) => acc + (parseFloat(s.poin) || 0), 0).toFixed(1)}
 </span>
 )}
 {(() => {
 const nextNum = soalList.length + 1
 const autoTipe = getAutoTipe(soalList.length)
 const btnColor = autoTipe === 'pg'
 ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
 : autoTipe === 'esai'
 ? 'bg-violet-600 hover:bg-violet-700 text-white'
 : 'bg-[#059669] hover:bg-emerald-800 text-white'
 const tipeShort = { pg: 'PG', esai: 'Essay', benar_salah: 'B/S', menjodohkan: 'Jodoh' }[autoTipe] || autoTipe
 return (
 <SquircleActionButton
   variant="primary"
   icon={Plus}
   label={`Tambah Soal #${nextNum} (${tipeShort})`}
   onClick={handlePrepareNewSoal}
   showLabel
 />
 )
 })()}
 </div>
 </div>
 {soalList.length === 0 ? (
 <div className="py-8 px-4 text-center text-slate-400 text-xs space-y-3">
 <span className="text-3xl block">📂</span>
 <p>Belum ada soal. Gunakan tombol di bawah untuk menambah soal satu per satu.</p>
 <div className="flex items-center justify-center gap-3 flex-wrap">
 <button type="button" onClick={handlePrepareNewSoal}
 className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-sm transition-all active:scale-95 border border-emerald-200/80 dark:border-emerald-800/60 h-9 text-sm font-medium">
 ➕ Tambah Soal #1
 </button>
 <span className="text-slate-300 dark:text-slate-600">atau</span>
 <span className="text-[10px] text-slate-400">isi form di atas → klik <strong className="text-slate-600 dark:text-slate-300">"✅ Simpan Soal"</strong></span>
 </div>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 <th className="py-2.5 px-3 w-8 text-center">#</th>
 <th className="py-2.5 px-3">Pertanyaan</th>
 <th className="py-2.5 px-3 text-center">Tipe</th>
 <th className="py-2.5 px-3 text-center">Poin</th>
 <th className="py-2.5 px-3 text-right">Aksi</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 bg-white dark:bg-slate-900">
 {soalList.map((soal, idx) => {
 const tipeBadge = {
 pg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
 esai: 'bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300',
 benar_salah: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
 menjodohkan: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
 }[soal.tipe] || 'bg-slate-100 text-slate-700'
 const tipeLabel = { pg: 'Pilihan Ganda', esai: 'Essay', benar_salah: 'B/S', menjodohkan: 'Jodoh' }[soal.tipe] || soal.tipe
 const isEditing = editingSoalIdx === idx
 return (
 <tr key={idx} className={['hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors', isEditing ? 'bg-amber-50/60 dark:bg-amber-950/20' : ''].join(' ')}>
 <td className="py-2.5 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
 <td className="py-2.5 px-3 max-w-xs">
 <p className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2">{soal.pertanyaan}</p>
 {soal.indikator && <p className="text-[10px] text-slate-400 mt-0.5 truncate">Ind: {soal.indikator}</p>}
 </td>
 <td className="py-2.5 px-3 text-center">
 <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tipeBadge}`}>{tipeLabel}</span>
 </td>
 <td className="py-2.5 px-3 text-center font-semibold text-slate-700 dark:text-slate-300">{soal.poin}</td>
 <td className="py-2.5 px-3 text-right">
 <div className="flex items-center justify-end gap-1">
 <button type="button" onClick={() => handleEditSoal(idx)}
 className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 transition">
 ✏️ Edit
 </button>
 <button type="button" onClick={() => handleDeleteSoal(idx)}
 className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 transition">
 🗑 Hapus
 </button>
 </div>
 </td>
 </tr>
 )
 })}
 </tbody>
 </table>
 </div>
 )}
 </div>
 </div>

 <div>
 <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">
 Lampiran Dokumen / Lembar Soal (PDF / Gambar / Doc) <span className="text-slate-400 font-normal">(opsional)</span>
 </label>
 <input
 type="file"
 accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
 onChange={(e) => {
 const file = e.target.files?.[0] || null
 setTugasForm({ ...tugasForm, file_lampiran: file, file_lampiran_preview: file ? file.name : null })
 }}
 className="w-full text-xs text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-950/40 dark:file:text-emerald-300"
 />
 {tugasForm.file_lampiran_preview && (
 <p className="mt-1 text-xs text-emerald-600 font-semibold flex items-center gap-1">
 <Paperclip className="w-3.5 h-3.5" /> Berkas terpilih: {tugasForm.file_lampiran_preview}
 </p>
 )}
 {tugasForm.existing_file_url && !tugasForm.file_lampiran && (
 <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
 <Paperclip className="w-3.5 h-3.5" /> Berkas tersimpan saat ini: <a href={tugasForm.existing_file_url} target="_blank" rel="noreferrer" className="text-emerald-600 underline font-semibold">Lihat Lembar Soal</a>
 </p>
 )}
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
 <div>
 <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">Format Jawaban Siswa</label>
 <CustomSelect
 value={tugasForm.tipe_tugas || 'both'}
 onChange={(e) => setTugasForm({ ...tugasForm, tipe_tugas: e.target.value })}
 className="h-9 w-full border rounded-xl bg-white px-3 dark:bg-slate-800 border-emerald-200/80 dark:border-emerald-700/80 font-semibold"
 >
 <option value="both">Teks & Upload File/Foto</option>
 <option value="online_text">Hanya Teks Online</option>
 <option value="file_upload">Hanya Upload File/Foto</option>
 </CustomSelect>
 </div>
 <div>
 <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">Deadline <span className="text-rose-500">*</span></label>
 <DatePicker
 required
 value={tugasForm.deadline}
 onChange={(e) => setTugasForm({ ...tugasForm, deadline: e.target.value })}
 inputClassName="h-11"
 />
 </div>
 <div>
 <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">Bobot Penilaian</label>
 <input
 type="number"
 value={tugasForm.bobot}
 onChange={(e) => setTugasForm({ ...tugasForm, bobot: e.target.value })}
 className="h-9 w-full p-2.5 border rounded-xl dark:bg-slate-800 border-emerald-200/80 dark:border-emerald-700/80"
 placeholder="100"
 />
 </div>
 </div>
 </form>
 )}

 {modalType === 'tahfizh' && (
 <form id="form-tahfizh" onSubmit={handleSaveTahfizh} className="space-y-4 text-xs">
 {/* 1. SELEKSI SISWA & FILTER ROMBEL */}
 <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-emerald-50/50 p-3.5 sm:p-4 dark:border-emerald-800/60 dark:bg-emerald-950/20 space-y-3">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
 <label htmlFor="tahfizh-siswa" className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
 <Users className="w-4 h-4 text-white" />
 <span>Pilih Siswa / Santri Rombel</span>
 <span className="text-rose-500">*</span>
 </label>

 {classes.length > 1 && (
 <div className="flex items-center gap-2 self-start sm:self-auto">
 <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Rombel:</span>
 <HeroUiFilterSelect
 value={tahfizhModalClass}
 onChange={(newClass) => {
 setTahfizhModalClass(newClass)
 setTahfizhForm((prev) => ({ ...prev, class_id: newClass, student_id: '' }))
 if (newClass && newClass !== 'all') {
 fetchStudentsForClass(newClass)
 }
 }}
 options={[
 { value: 'all', label: `Semua Rombel (${classes.length})` },
 ...classes.map((cls) => ({
 value: String(cls.id),
 label: cls.nama_kelas || cls.name,
 })),
 ]}
 size="sm"
 placeholder="Pilih Rombel"
 popoverWidth="min-w-[190px]"
 />
 </div>
 )}
 </div>

 <div className="flex items-center gap-2">
 <div className="flex-1">
 <HeroUiFilterSelect
 id="tahfizh-siswa"
 value={tahfizhForm.student_id}
 onChange={(sid) => {
 const stu = students.find((s) => String(s.id) === String(sid))
 setTahfizhForm({
 ...tahfizhForm,
 student_id: sid,
 class_id: stu?.kelas_id || stu?.class_id || stu?.kelas?.id || tahfizhForm.class_id,
 })
 }}
 options={filteredTahfizhStudents.map((s) => ({
 value: String(s.id),
 label: `${s.nama_lengkap} (NIS: ${s.nis || s.nisn || '-'})`,
 subtext: s.kelas?.nama_kelas ? `Kelas: ${s.kelas.nama_kelas}` : undefined,
 }))}
 placeholder={`-- Pilih Siswa / Santri (${filteredTahfizhStudents.length} santri) --`}
 ariaLabel="Pilih Siswa / Santri Tahfizh"
 searchable
 popoverWidth="w-full min-w-[280px]"
 />
 </div>

 <div className="relative group">
 <button
 type="button"
 onClick={() => {
 setStudentModalSearch('')
 setShowStudentSearchModal(true)
 }}
 className="w-10 h-9 rounded-xl bg-white dark:bg-card-dark shadow-md shadow-sky-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center shrink-0 border border-emerald-200/80 dark:border-emerald-800/60"
 aria-label="Pencarian Nama Siswa Rombel"
 >
 <UserCheck className="w-5 h-5" />
 </button>
 <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-lg z-20">
 Pencarian Interaktif Siswa
 </div>
 </div>
 </div>
 </div>

 {/* 2. CARD INFO PROFILE SISWA & CAPAIAN TAHFIZH */}
 {selectedTahfizhStudent ? (
 <div className="rounded-xl border border-emerald-200/80 bg-white p-4 shadow-sm dark:border-emerald-800/60 dark:bg-slate-900/60 space-y-3">
 <div className="flex items-center justify-between gap-3">
 <div className="flex items-center gap-3 min-w-0">
 <div className="w-11 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 font-extrabold flex items-center justify-center text-sm shadow-sm shrink-0 overflow-hidden">
 {selectedTahfizhStudent.avatar ? (
 <img src={selectedTahfizhStudent.avatar} alt="" className="w-full h-full object-cover" />
 ) : (
 (selectedTahfizhStudent.nama_lengkap || 'S').slice(0, 2).toUpperCase()
 )}
 </div>
 <div className="min-w-0 flex-1">
 <h4 className="font-black text-sm text-slate-900 dark:text-white ">
 {selectedTahfizhStudent.nama_lengkap}
 </h4>
 <p className="text-xs text-slate-500 font-mono mt-0.5">
 NIS: {selectedTahfizhStudent.nis || selectedTahfizhStudent.nisn || '-'}
 </p>
 </div>
 </div>

 <div className="flex flex-col items-end gap-1 shrink-0">
 <span className="inline-flex items-center rounded-lg bg-emerald-100 px-2.5 py-1 text-[10px] font-black text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
 {selectedTahfizhStudent.kelas?.nama_kelas || selectedClassName || 'Rombel Aktif'}
 </span>
 <span className="text-[10px] text-slate-400 font-medium">
 {selectedTahfizhStudent.education_unit?.name || teacherProfile?.education_unit || 'Unit Terpadu'}
 </span>
 </div>
 </div>

 {previousTahfizhLog ? (
 <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white dark:bg-card-dark p-3 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:to-teal-950/30 text-xs space-y-1.5">
 <div className="flex items-center justify-between gap-2">
 <div className="flex items-center gap-1.5 font-black text-emerald-900 dark:text-emerald-200">
 <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
 <span>Setoran Selesai Sebelumnya:</span>
 </div>
 <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
 {previousTahfizhLog.record_date || 'Terakhir'}
 </span>
 </div>

 <div className="flex flex-wrap items-center gap-2 pt-0.5">
 <span className="font-extrabold text-xs text-emerald-950 dark:text-emerald-100">
 Surah {previousTahfizhLog.hafalan_surah_name || '-'} (Ayat {previousTahfizhLog.hafalan_ayah_start}–{previousTahfizhLog.hafalan_ayah_end})
 </span>
 <span className="inline-flex items-center rounded-md bg-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200">
 Juz {previousTahfizhLog.metadata?.juz || '-'}
 </span>
 <span className="inline-flex items-center rounded-md bg-white/80 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-emerald-200/80 dark:border-emerald-800/60">
 {previousTahfizhLog.metadata?.kelancaran || 'Lancar'}
 </span>
 </div>

 {automaticTahfizhTarget && (
 <div className="mt-2 rounded-lg bg-white/90 dark:bg-slate-900/90 p-2.5 border border-emerald-200/80 dark:border-emerald-800/60 flex items-start gap-2">
 <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
 <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-200">
 <strong>{automaticTahfizhTarget.repeated ? '🔁 Mengulang Target Hafalan: ' : '⚡ Rekomendasi Target Otomatis: '}</strong>
 Surah <strong>{automaticTahfizhTarget.surah_name}</strong> (Mulai Ayat {automaticTahfizhTarget.ayat_start}).
 <span className="text-slate-500 dark:text-slate-400 ml-1">
 {automaticTahfizhTarget.repeated
 ? 'Evaluasi sebelumnya memerlukan bimbingan, silakan setorkan kembali rentang ayat ini.'
 : 'Pilih ayat terakhir yang berhasil disetorkan hari ini.'}
 </span>
 </div>
 </div>
 )}
 </div>
 ) : (
 <div className="rounded-xl border border-dashed border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/50 p-3 dark:border-emerald-800/60 dark:bg-amber-950/20 text-xs">
 <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
 <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
 <span>Setoran Awal (Belum Ada Catatan Riwayat)</span>
 </div>
 <p className="mt-1 text-xs text-amber-700 dark:text-amber-400 font-medium">
 Santri ini belum memiliki riwayat setoran di sistem. Anda dapat menentukan Juz, Surah, dan Ayat awal secara leluasa.
 </p>
 </div>
 )}
 </div>
 ) : (
 <div className="rounded-xl border border-dashed border-emerald-300 bg-slate-50/80 p-4 text-center dark:border-emerald-700/80 dark:bg-slate-900/40">
 <UserCheck className="mx-auto h-7 w-7 text-slate-400 mb-1.5" />
 <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">Silakan Pilih Siswa Terlebih Dahulu</h4>
 <p className="text-xs text-slate-500 mt-0.5">
 Pilih nama siswa pada dropdown di atas untuk memuat riwayat hafalan dan target otomatis.
 </p>
 </div>
 )}

 {/* 3. GRID FORM INPUT SETORAN */}
 <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
 {/* Jenis Setoran */}
 <div>
 <label htmlFor="tahfizh-jenis" className="font-bold block mb-1 text-slate-700 dark:text-slate-200">
 Jenis Setoran <span className="text-rose-500">*</span>
 </label>
 <div className="flex items-center gap-2">
 <div className="flex-1">
 <HeroUiFilterSelect
 id="tahfizh-jenis"
 value={tahfizhForm.type}
 onChange={(val) => setTahfizhForm({ ...tahfizhForm, type: val })}
 options={[
 { value: 'Ziyadah', label: 'Ziyadah (Hafalan Baru)' },
 { value: 'Murajaah', label: 'Murajaah (Pengulangan)' },
 { value: 'Tasmi', label: 'Tasmi\' (Uji Simakan)' },
 { value: 'Ujian', label: 'Ujian Tahfizh' },
 ]}
 placeholder="Pilih Jenis Setoran"
 ariaLabel="Jenis Setoran Tahfizh"
 popoverWidth="w-full min-w-[220px]"
 />
 </div>
 <div className="relative group">
 <button
 type="button"
 onClick={() => setShowSetoranTypeModal(true)}
 className="w-10 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center shrink-0"
 aria-label="Pilih Cepat Jenis Setoran"
 >
 <Zap className="w-4.5 h-4.5" />
 </button>
 <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-lg z-20">
 Pilih Cepat Jenis Setoran
 </div>
 </div>
 </div>
 </div>

 {/* Juz Capaian */}
 <div>
 <label htmlFor="tahfizh-juz" className="font-bold block mb-1 text-slate-700 dark:text-slate-200">
 Juz Capaian <span className="text-rose-500">*</span>
 </label>
 <HeroUiFilterSelect
 id="tahfizh-juz"
 value={String(tahfizhForm.juz)}
 onChange={(val) => setTahfizhForm({ ...tahfizhForm, juz: Number(val) })}
 options={Array.from({ length: 30 }, (_, index) => ({
 value: String(index + 1),
 label: `Juz ${index + 1}`,
 }))}
 placeholder="Pilih Juz"
 ariaLabel="Juz Capaian Tahfizh"
 popoverWidth="w-full min-w-[180px]"
 />
 </div>
 </div>

 {/* Surah dari Master Al-Qur'an */}
 <div>
 <div className="flex items-center justify-between mb-1">
 <label htmlFor="tahfizh-surah" className="font-bold text-slate-700 dark:text-slate-200">
 Surah dari Master Al-Qur'an <span className="text-rose-500">*</span>
 </label>
 {selectedTahfizhSurah && (
 <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
 Total {selectedTahfizhSurah.jumlah_ayat} Ayat
 </span>
 )}
 </div>
 <div className="flex items-center gap-2">
 <div className="flex-1">
 <HeroUiFilterSelect
 id="tahfizh-surah"
 value={String(tahfizhForm.surah_number)}
 disabled={loadingSurahs}
 onChange={(val) => {
 const surahNumber = Number(val)
 setTahfizhForm({ ...tahfizhForm, surah_number: surahNumber, ayat_start: 1, ayat_end: 1, juz: getQuranJuz(surahNumber, 1) })
 }}
 options={quranSurahs.map((surah) => ({
 value: String(surah.nomor),
 label: `${surah.nomor}. ${surah.nama_latin}`,
 subtext: `${surah.jumlah_ayat} ayat • ${surah.arti}`,
 }))}
 placeholder={loadingSurahs ? 'Memuat Master Al-Qur’an...' : '-- Pilih Surah Master --'}
 ariaLabel="Surah Al-Qur'an"
 searchable
 popoverWidth="w-full min-w-[280px]"
 />
 </div>
 <div className="relative group">
 <button
 type="button"
 onClick={() => {
 setSurahModalSearch('')
 setShowSurahSearchModal(true)
 }}
 className="w-10 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center shrink-0"
 aria-label="Master Surah Al-Qur'an"
 >
 <BookMarked className="w-4.5 h-4.5" />
 </button>
 <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-lg z-20">
 Master Surah Al-Qur'an
 </div>
 </div>
 </div>
 </div>

 {/* Rentang Ayat Awal & Terakhir */}
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label htmlFor="tahfizh-ayat-awal" className="font-bold block mb-1 text-slate-700 dark:text-slate-200">
 Ayat Awal <span className="text-rose-500">*</span>
 </label>
 <HeroUiFilterSelect
 id="tahfizh-ayat-awal"
 disabled={!selectedTahfizhSurah}
 value={String(tahfizhForm.ayat_start)}
 onChange={(val) => {
 const value = Number(val)
 setTahfizhForm({ ...tahfizhForm, ayat_start: value, ayat_end: Math.max(value, Number(tahfizhForm.ayat_end)), juz: getQuranJuz(tahfizhForm.surah_number, value) })
 }}
 options={Array.from({ length: selectedTahfizhSurah?.jumlah_ayat || 1 }, (_, index) => ({
 value: String(index + 1),
 label: `Ayat ${index + 1}`,
 }))}
 placeholder="Ayat Awal"
 ariaLabel="Ayat Awal"
 searchable={(selectedTahfizhSurah?.jumlah_ayat || 1) > 10}
 popoverWidth="w-full min-w-[150px]"
 />
 </div>
 <div>
 <div className="flex items-center justify-between mb-1">
 <label htmlFor="tahfizh-ayat-akhir" className="font-bold text-slate-700 dark:text-slate-200">
 Ayat Terakhir <span className="text-rose-500">*</span>
 </label>
 {selectedTahfizhSurah && Number(tahfizhForm.ayat_end) >= Number(tahfizhForm.ayat_start) && (
 <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400">
 {Number(tahfizhForm.ayat_end) - Number(tahfizhForm.ayat_start) + 1} ayat
 </span>
 )}
 </div>
 <HeroUiFilterSelect
 id="tahfizh-ayat-akhir"
 disabled={!selectedTahfizhSurah}
 value={String(tahfizhForm.ayat_end)}
 onChange={(val) => setTahfizhForm({ ...tahfizhForm, ayat_end: Number(val) })}
 options={Array.from({ length: selectedTahfizhSurah?.jumlah_ayat || 1 }, (_, index) => index + 1)
 .filter((ayat) => ayat >= Number(tahfizhForm.ayat_start))
 .map((ayat) => ({
 value: String(ayat),
 label: `Ayat ${ayat}`,
 }))}
 placeholder="Ayat Terakhir"
 ariaLabel="Ayat Terakhir"
 searchable={(selectedTahfizhSurah?.jumlah_ayat || 1) > 10}
 popoverWidth="w-full min-w-[150px]"
 />
 </div>
 </div>

 {/* Evaluasi 3 Dimensi */}
 <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
 {[
 ['kelancaran', 'Kelancaran', ['Sangat Lancar', 'Lancar', 'Perlu Bimbingan']],
 ['tajwid', 'Tajwid', ['Sangat Baik', 'Baik', 'Perlu Bimbingan']],
 ['makhraj', 'Makhraj', ['Sangat Baik', 'Baik', 'Perlu Bimbingan']],
 ].map(([key, label, options]) => (
 <div key={key}>
 <label htmlFor={`tahfizh-${key}`} className="font-bold block mb-1 text-slate-700 dark:text-slate-200">{label}</label>
 <HeroUiFilterSelect
 id={`tahfizh-${key}`}
 value={tahfizhForm[key]}
 onChange={(val) => setTahfizhForm({ ...tahfizhForm, [key]: val })}
 options={options.map((opt) => ({ value: opt, label: opt }))}
 placeholder={`Pilih ${label}`}
 ariaLabel={label}
 popoverWidth="w-full min-w-[160px]"
 />
 </div>
 ))}
 </div>

 {/* Catatan Guru */}
 <div>
 <label htmlFor="tahfizh-catatan" className="font-bold block mb-1 text-slate-700 dark:text-slate-200">
 Catatan & Arahan Guru
 </label>
 <textarea
 id="tahfizh-catatan"
 rows={3}
 value={tahfizhForm.notes_teacher}
 onChange={(e) => setTahfizhForm({ ...tahfizhForm, notes_teacher: e.target.value })}
 placeholder="Tuliskan catatan bimbingan, kelemahan makhraj/tajwid, atau target setoran berikutnya..."
 className="w-full border rounded-xl p-3 dark:bg-slate-800 border-emerald-300 dark:border-emerald-700/80 font-semibold text-slate-800 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
 />
 </div>
 </form>
 )}

 {/* POPUP MODAL PENCARIAN SISWA ROMBEL */}
 <AppModal
 isOpen={showStudentSearchModal}
 onClose={() => setShowStudentSearchModal(false)}
 title="Pilih Siswa / Santri Rombel"
 description="Cari dan pilih siswa santri terdaftar untuk mencatat setoran tahfizh"
 icon={UserCheck}
 maxWidth="max-w-xl"
 >
 <div className="space-y-3.5">
 {/* Header Filter Modal */}
 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
 <div className="relative flex-1">
 <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="search"
 value={studentModalSearch}
 onChange={(e) => setStudentModalSearch(e.target.value)}
 placeholder="Cari nama santri atau NIS..."
 className="h-9 w-full rounded-3xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white pl-10 pr-4 text-xs font-semibold outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700/80 dark:bg-slate-900 dark:text-white"
 />
 </div>

 {classes.length > 1 && (
 <CustomSelect
 value={tahfizhModalClass}
 onChange={(e) => {
 const newClass = e.target.value
 setTahfizhModalClass(newClass)
 if (newClass && newClass !== 'all') {
 fetchStudentsForClass(newClass)
 }
 }}
 className="h-9 rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white px-3 text-xs font-bold text-slate-700 outline-none focus:border-emerald-600 dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-200 shrink-0"
 >
 <option value="all">Semua Rombel ({classes.length})</option>
 {classes.map((cls) => (
 <option key={cls.id} value={cls.id}>
 {cls.nama_kelas || cls.name}
 </option>
 ))}
 </CustomSelect>
 )}
 </div>

 <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
 <span>Daftar Siswa Tersedia</span>
 <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold">
 {filteredTahfizhStudents.length} Santri
 </span>
 </div>

 <div className="max-h-80 overflow-y-auto space-y-2 pr-1 divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {filteredTahfizhStudents.map((s) => {
 const isSelected = String(tahfizhForm.student_id) === String(s.id)
 return (
 <button
 key={s.id}
 type="button"
 onClick={() => {
 setTahfizhForm((prev) => ({
 ...prev,
 student_id: s.id,
 class_id: s.kelas_id || s.class_id || s.kelas?.id || prev.class_id,
 }))
 setShowStudentSearchModal(false)
 }}
 className={`flex items-center gap-3 w-full p-3 rounded-xl border text-left transition ${isSelected
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/90 ring-2 ring-emerald-500/30 dark:bg-emerald-950/40 dark:border-emerald-800/60'
 : 'border-emerald-200/80 hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-slate-50 dark:border-emerald-800/60 dark:hover:bg-slate-900/60'
 }`}
 >
 <div className="w-10 h-9 rounded-full bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 font-extrabold flex items-center justify-center text-xs shadow-sm shrink-0 overflow-hidden">
 {s.avatar ? (
 <img src={s.avatar} alt="" className="w-full h-full object-cover" />
 ) : (
 (s.nama_lengkap || 'S').slice(0, 2).toUpperCase()
 )}
 </div>
 <div className="min-w-0 flex-1">
 <h4 className="font-extrabold text-xs text-slate-900 dark:text-white ">{s.nama_lengkap}</h4>
 <p className="text-xs text-slate-500 font-mono mt-0.5">NIS: {s.nis || s.nisn || '-'}</p>
 </div>
 <div className="flex items-center gap-1.5 shrink-0">
 {s.kelas?.nama_kelas && (
 <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
 {s.kelas.nama_kelas}
 </span>
 )}
 {isSelected ? (
 <span className="px-2.5 py-1 bg-emerald-600 text-white font-black text-[10px] rounded-full">
 Dipilih
 </span>
 ) : (
 <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
 )}
 </div>
 </button>
 )
 })}

 {filteredTahfizhStudents.length === 0 && (
 <div className="p-8 text-center text-xs text-slate-500 space-y-1">
 <p className="font-bold">Tidak ditemukan siswa</p>
 <p className="text-xs">
 {studentModalSearch ? `Tidak ada santri yang cocok dengan kata kunci "${studentModalSearch}"` : 'Belum ada data santri pada rombel yang dipilih.'}
 </p>
 </div>
 )}
 </div>
 </div>
 </AppModal>

 {/* POPUP MODAL JENIS SETORAN TAHFIZH */}
 <AppModal
 isOpen={showSetoranTypeModal}
 onClose={() => setShowSetoranTypeModal(false)}
 title="Pilih Jenis Setoran Tahfizh"
 description="Pilih jenis atau kategori setoran hafalan Al-Qur'an siswa"
 icon={Zap}
 maxWidth="max-w-md"
 >
 <div className="grid grid-cols-2 gap-3">
 {[
 { id: 'Ziyadah', label: 'Ziyadah', description: 'Setoran Hafalan Baru', icon: Sparkles, color: 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40' },
 { id: 'Murajaah', label: 'Murajaah', description: 'Pengulangan Hafalan Lama', icon: RefreshCw, color: 'border-emerald-200/80 dark:border-emerald-800/60 bg-blue-50 text-blue-700 dark:bg-blue-950/40' },
 { id: 'Tasmi', label: 'Tasmi\'', description: 'Ujian Sekali Duduk', icon: BookOpen, color: 'border-emerald-200/80 dark:border-emerald-800/60 bg-purple-50 text-purple-700 dark:bg-purple-950/40' },
 { id: 'Ujian', label: 'Ujian Setoran', description: 'Ujian Capaian Juz', icon: Award, color: 'border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50 text-amber-700 dark:bg-amber-950/40' },
 ].map((item) => {
 const Icon = item.icon
 const isSelected = tahfizhForm.type === item.id
 return (
 <button
 key={item.id}
 type="button"
 onClick={() => {
 setTahfizhForm({ ...tahfizhForm, type: item.id })
 setShowSetoranTypeModal(false)
 }}
 className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${isSelected
 ? 'ring-2 ring-emerald-500 border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/90 dark:bg-emerald-950/50'
 : 'border-emerald-200/80 hover:border-emerald-300 dark:hover:border-emerald-700/80 bg-white dark:bg-slate-900'
 }`}
 >
 <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${item.color}`}>
 <Icon className="w-4 h-4" />
 </div>
 <div className="mt-3">
 <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{item.label}</h4>
 <p className="text-[10px] text-slate-500 font-medium">{item.description}</p>
 </div>
 </button>
 )
 })}
 </div>
 </AppModal>

 {/* POPUP MODAL MASTER SURAH AL-QUR'AN */}
 <AppModal
 isOpen={showSurahSearchModal}
 onClose={() => setShowSurahSearchModal(false)}
 title="Master Surah Al-Qur'an"
 description="Cari dan pilih dari 114 Surah Master Al-Qur'an"
 icon={BookMarked}
 maxWidth="max-w-xl"
 >
 <div className="space-y-3">
 <div className="relative">
 <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="search"
 value={surahModalSearch}
 onChange={(e) => setSurahModalSearch(e.target.value)}
 placeholder="Cari nama surah (contoh: An-Naba, Al-Baqarah, 30)..."
 className="h-9 w-full rounded-3xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white pl-10 pr-4 text-xs font-semibold outline-none focus:border-emerald-600 dark:border-emerald-700/80 dark:bg-slate-900 dark:text-white"
 />
 </div>

 <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
 {quranSurahs
 .filter((s) => !surahModalSearch.trim() || s.nama_latin?.toLowerCase().includes(surahModalSearch.toLowerCase()) || String(s.nomor).includes(surahModalSearch))
 .map((s) => {
 const isSelected = Number(tahfizhForm.surah_number) === Number(s.nomor)
 return (
 <button
 key={s.nomor}
 type="button"
 onClick={() => {
 const surahNumber = Number(s.nomor)
 setTahfizhForm({
 ...tahfizhForm,
 surah_number: surahNumber,
 ayat_start: 1,
 ayat_end: 1,
 juz: getQuranJuz(surahNumber, 1),
 })
 setShowSurahSearchModal(false)
 }}
 className={`flex items-center justify-between w-full p-3 rounded-xl border text-left transition ${isSelected
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/80 ring-2 ring-emerald-500/30 dark:bg-emerald-950/40 dark:border-emerald-800/60'
 : 'border-emerald-200/80 hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-slate-50 dark:border-emerald-800/60 dark:hover:bg-slate-900'
 }`}
 >
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-extrabold text-xs flex items-center justify-center border border-emerald-200/80 dark:border-emerald-800/60 shrink-0">
 {s.nomor}
 </div>
 <div>
 <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{s.nama_latin}</h4>
 <p className="text-[10px] text-slate-500">{s.arti} • {s.jumlah_ayat} Ayat</p>
 </div>
 </div>
 <div className="text-right">
 <span className="block font-serif text-sm font-bold text-slate-800 dark:text-slate-200">{s.nama}</span>
 <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Juz {getQuranJuz(s.nomor, 1)}</span>
 </div>
 </button>
 )
 })}

 {quranSurahs.filter((s) => !surahModalSearch.trim() || s.nama_latin?.toLowerCase().includes(surahModalSearch.toLowerCase()) || String(s.nomor).includes(surahModalSearch)).length === 0 && (
 <div className="p-8 text-center text-xs text-slate-500">
 Tidak ditemukan surah dengan kata kunci "{surahModalSearch}"
 </div>
 )}
 </div>
 </div>
 </AppModal>

 {modalType === 'catatan' && (
 <form id="form-catatan" onSubmit={handleSaveCatatan} className="space-y-3.5 text-xs">
 <div className="flex items-center justify-between"><div><h3 className="text-base font-extrabold text-slate-900 dark:text-white">{editingId ? 'Edit Catatan Siswa' : 'Tambah Catatan Siswa'}</h3><p className="mt-0.5 text-[10px] text-slate-500">Catat perkembangan dan rencana tindak lanjut siswa.</p></div><button type="button" onClick={() => setShowModal(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></div>
 <div>
 <label className="mb-1 block font-semibold text-slate-700 dark:text-slate-200">Siswa</label>
 <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-emerald-50 p-3 dark:border-emerald-800/60 dark:bg-emerald-950/30"><p className="font-bold text-emerald-800 dark:text-emerald-300">{students.find((student) => student.id === catatanForm.student_id)?.nama_lengkap || students.find((student) => student.id === catatanForm.student_id)?.full_name || 'Siswa tidak ditemukan'}</p><p className="mt-0.5 text-[10px] text-emerald-700">{selectedClassName} · Dipilih otomatis dari tabel</p></div>
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div><label className="mb-1 block font-semibold text-slate-700 dark:text-slate-200">Tanggal</label><DatePicker required value={catatanForm.date} onChange={(e) => setCatatanForm({ ...catatanForm, date: e.target.value })} /></div>
 <div>
 <label className="mb-1 block font-semibold text-slate-700 dark:text-slate-200">Kategori</label>
 <HeroUiFilterSelect
 size="md"
 value={catatanForm.category}
 onChange={(val) => setCatatanForm({ ...catatanForm, category: val })}
 ariaLabel="Kategori"
 options={['Akademik', 'Perilaku', 'Kedisiplinan', 'Prestasi', 'Konseling', 'Tahfizh', 'Ibadah', 'Kesehatan']}
 />
 </div>
 </div>
 {(catatanForm.category === 'Perilaku' || catatanForm.category === 'Kedisiplinan') && (
 <div className="flex items-center justify-between rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-amber-50/90 p-2.5 dark:border-emerald-800/60 dark:bg-amber-950/40">
 <div className="flex items-center gap-2">
 <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
 <p className="text-xs text-amber-800 dark:text-amber-200">
 Gunakan standar resmi <b>122 Pasal Tata Tertib & Poin Kedisiplinan TU</b>?
 </p>
 </div>
 <button
 type="button"
 onClick={() => {
 const curStudent = students.find((s) => s.id === catatanForm.student_id)
 openPelanggaranModal(curStudent)
 }}
 className="shrink-0 rounded-lg bg-amber-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-xs hover:bg-amber-700 cursor-pointer"
 >
 Pilih Pasal TU
 </button>
 </div>
 )}
 <div>
 <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">Judul Catatan</label>
 <input
 type="text"
 required
 value={catatanForm.title}
 onChange={(e) => setCatatanForm({ ...catatanForm, title: e.target.value })}
 className="w-full p-2.5 border rounded-xl dark:bg-slate-800 border-emerald-200/80 dark:border-emerald-700/80"
 placeholder="Judul catatan perkembangan..."
 />
 </div>
 <div>
 <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">Isi Catatan</label>
 <textarea
 rows={3}
 required
 value={catatanForm.content}
 onChange={(e) => setCatatanForm({ ...catatanForm, content: e.target.value })}
 className="w-full p-2.5 border rounded-xl dark:bg-slate-800 border-emerald-200/80 dark:border-emerald-700/80"
 placeholder="Perkembangan atau catatan..."
 />
 </div>
 <div><label className="mb-1 block font-semibold text-slate-700 dark:text-slate-200">Tindak Lanjut</label><textarea rows={2} value={catatanForm.follow_up} onChange={(e) => setCatatanForm({ ...catatanForm, follow_up: e.target.value })} className="w-full rounded-3xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 p-2.5 dark:border-emerald-700/80 dark:bg-slate-800" placeholder="Rencana pendampingan berikutnya (opsional)..." /></div>
 <div className="grid gap-3 sm:grid-cols-2">
 <div>
 <label className="mb-1 block font-semibold text-slate-700 dark:text-slate-200">Prioritas</label>
 <HeroUiFilterSelect
 size="md"
 value={catatanForm.priority}
 onChange={(val) => setCatatanForm({ ...catatanForm, priority: val })}
 ariaLabel="Prioritas"
 options={[
 { value: 'low', label: 'Rendah' },
 { value: 'medium', label: 'Sedang' },
 { value: 'high', label: 'Tinggi' },
 { value: 'urgent', label: 'Mendesak' },
 ]}
 />
 </div>
 <div className="flex items-end gap-4 pb-2"><label className="flex items-center gap-2"><input type="checkbox" checked={catatanForm.visible_to_parent} onChange={(e) => setCatatanForm({ ...catatanForm, visible_to_parent: e.target.checked })} /> Orang tua</label><label className="flex items-center gap-2"><input type="checkbox" checked={catatanForm.visible_to_student} onChange={(e) => setCatatanForm({ ...catatanForm, visible_to_student: e.target.checked })} /> Siswa</label></div>
 </div>
 </form>
 )}

 {modalType === 'pelanggaran' && (
 <form id="form-pelanggaran" onSubmit={handleSavePelanggaran} className="space-y-4 text-xs">
 {/* Header */}
 <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/80 pb-3 dark:border-emerald-800/60">
 <div className="flex items-center gap-2.5">
 <div className="flex h-9 w-10 items-center justify-center rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 shadow-sm">
 <ShieldAlert className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
 Catat Penilaian Perilaku Siswa
 </h3>
 <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
 Standar 122 Pasal Tata Tertib & Buku Poin Kedisiplinan TU
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setShowModal(false)}
 className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
 >
 <X className="h-4 w-4" />
 </button>
 </div>

 {/* Siswa Selector / Info */}
 <div>
 <label className="mb-1 block font-bold text-slate-700 dark:text-slate-200">
 Target Siswa / Santri
 </label>
 <div className="relative">
 <CustomSelect
 value={pelanggaranForm.student_id}
 onChange={(e) => setPelanggaranForm({ ...pelanggaranForm, student_id: e.target.value })}
 className="h-9 w-full appearance-none rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white pl-3 pr-9 text-xs font-bold text-slate-800 transition hover:border-emerald-300 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200"
 >
 <option value="" disabled>-- Pilih Siswa dari Rombel {selectedClassName} --</option>
 {students.map((st) => (
 <option key={st.id} value={st.id}>
 {st.nama_lengkap || st.full_name || st.name} ({st.nis || 'Tanpa NIS'})
 </option>
 ))}
 </CustomSelect>
 <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
 <ChevronDown className="h-4 w-4" />
 </div>
 </div>
 </div>

 {/* Tanggal & Poin */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="mb-1 block font-bold text-slate-700 dark:text-slate-200">Tanggal Kejadian</label>
 <DatePicker
 required
 value={pelanggaranForm.transaction_date}
 onChange={(e) => setPelanggaranForm({ ...pelanggaranForm, transaction_date: e.target.value })}
 />
 </div>
 <div>
 <label className="mb-1 block font-bold text-slate-700 dark:text-slate-200">Bobot Pengurangan Poin</label>
 <div className="flex h-9 items-center justify-between rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-rose-50 px-3.5 dark:border-emerald-800/60 dark:bg-rose-950/40">
 <span className="font-semibold text-rose-700 dark:text-rose-300">Poin Pelanggaran:</span>
 <span className="rounded-lg bg-rose-600 px-2 py-0.5 text-xs font-black text-white shadow-xs">
 -{Math.abs(pelanggaranForm.points || 0)} Poin
 </span>
 </div>
 </div>
 </div>

 {/* Master Pasal Tata Tertib TU (122 Pasal Dinamis) */}
 <div>
 <div className="mb-1 flex items-center justify-between">
 <label className="font-bold text-slate-700 dark:text-slate-200">
 Pasal Tata Tertib & Perilaku (Master TU)
 </label>
 {loadingDisciplineCategories && (
 <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-semibold">
 <RefreshCw className="h-3 w-3 animate-spin" /> Memuat master TU...
 </span>
 )}
 </div>

 {/* Filter / Search Pasal jika banyak */}
 <div className="relative mb-2">
 <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={pelanggaranCategorySearch}
 onChange={(e) => setPelanggaranCategorySearch(e.target.value)}
 placeholder="Cari pasal / nama pelanggaran TU (contoh: seragam, terlambat, adab)..."
 className="h-8 w-full rounded-lg border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-slate-50 pl-8.5 pr-3 text-xs outline-none transition focus:border-rose-500 focus:bg-white dark:border-emerald-700/80 dark:bg-slate-900 dark:text-white"
 />
 </div>

 <div className="relative">
 <CustomSelect
 value={pelanggaranForm.category_id}
 onChange={(e) => handlePelanggaranCategoryChange(e.target.value)}
 className="h-9 w-full appearance-none rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white pl-3 pr-9 text-xs font-bold text-slate-800 transition hover:border-emerald-300 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200"
 >
 <option value="" disabled>-- Pilih Pasal Tata Tertib Resmi TU --</option>
 {disciplineCategories
 .filter((cat) => {
 if (!pelanggaranCategorySearch.trim()) return true
 const q = pelanggaranCategorySearch.toLowerCase()
 return (
 cat.name?.toLowerCase().includes(q) ||
 cat.code?.toLowerCase().includes(q) ||
 cat.cluster?.toLowerCase().includes(q) ||
 cat.description?.toLowerCase().includes(q)
 )
 })
 .map((cat) => (
 <option key={cat.id} value={cat.id}>
 {cat.code ? `[${cat.code}] ` : ''}{cat.name} ({cat.point_weight ? `-${Math.abs(cat.point_weight)} Poin` : '0 Poin'}) {cat.cluster ? `• ${cat.cluster}` : ''}
 </option>
 ))}
 </CustomSelect>
 <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
 <ChevronDown className="h-4 w-4" />
 </div>
 </div>

 {/* Selected Category Detail Card */}
 {(() => {
 const selCat = disciplineCategories.find((c) => String(c.id) === String(pelanggaranForm.category_id))
 if (!selCat) return null
 return (
 <div className="mt-2 rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-amber-50/70 p-2.5 dark:border-emerald-800/60 dark:bg-amber-950/30">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
 Klaster: {selCat.cluster || selCat.category_type || 'Tata Tertib Santri'}
 </span>
 <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
 Resmi TU: -{Math.abs(selCat.point_weight || 5)} Poin
 </span>
 </div>
 {selCat.consequence && (
 <p className="mt-1 text-xs text-amber-900 dark:text-amber-200">
 <b>Konsekuensi TU:</b> {selCat.consequence}
 </p>
 )}
 </div>
 )
 })()}
 </div>

 {/* Kronologi / Catatan Kejadian Guru */}
 <div>
 <label className="mb-1 block font-bold text-slate-700 dark:text-slate-200">
 Catatan Kronologi Kejadian / Perilaku <span className="text-rose-500">*</span>
 </label>
 <textarea
 rows={3}
 required
 value={pelanggaranForm.description}
 onChange={(e) => setPelanggaranForm({ ...pelanggaranForm, description: e.target.value })}
 placeholder="Tuliskan catatan kejadian perilaku santri di kelas atau lingkungan madrasah..."
 className="w-full rounded-3xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 p-2.5 text-xs outline-none transition focus:border-rose-500 focus:ring-1 focus:ring-rose-500 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white"
 />
 </div>

 {/* Rujukan BK & Tindak Lanjut */}
 <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-slate-50/80 p-3 dark:border-emerald-800/60 dark:bg-slate-900/50 space-y-2.5">
 <label className="flex items-center gap-2.5 cursor-pointer">
 <input
 type="checkbox"
 checked={pelanggaranForm.refer_bk}
 onChange={(e) => setPelanggaranForm({ ...pelanggaranForm, refer_bk: e.target.checked })}
 className="h-4 w-4 rounded border-emerald-300 text-rose-600 focus:ring-rose-500"
 />
 <div>
 <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
 Rujuk ke Guru BK (Bimbingan Konseling) & Wali Kelas
 </span>
 <p className="text-[10px] text-slate-500">
 Aktifkan bila perilaku memerlukan pembinaan lanjutan atau pemanggilan orang tua oleh BK.
 </p>
 </div>
 </label>

 <div>
 <label className="mb-1 block font-semibold text-slate-700 dark:text-slate-300 text-xs">
 Tindakan Langsung Guru (Opsional)
 </label>
 <input
 type="text"
 value={pelanggaranForm.follow_up}
 onChange={(e) => setPelanggaranForm({ ...pelanggaranForm, follow_up: e.target.value })}
 placeholder="Contoh: Diberikan nasihat adab, penugasan istighfar 50x..."
 className="w-full rounded-lg border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-white p-2 text-xs outline-none focus:border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white"
 />
 </div>
 </div>
 </form>
 )}
 </>
 )}
 </AppModal>

 {/* SUBMISSIONS & GRADES MODAL */}
 <AppModal
 isOpen={showSubmissionsModal}
 onClose={() => setShowSubmissionsModal(false)}
 zIndex={50}
 maxWidth="max-w-4xl"
 title="Hasil Pengumpulan & Nilai Siswa"
 description={`${selectedAssignmentForSubmissions?.judul || selectedAssignmentForSubmissions?.judul_tugas || ''} • Rombel ${selectedAssignmentForSubmissions?.kelas?.nama_kelas || selectedAssignmentForSubmissions?.kelas?.name || selectedClassName}`}
 icon={CheckCircle2}
 bodyClassName="p-5 sm:p-6 space-y-4"
 footer={
 <div className="flex w-full items-center justify-between gap-3">
 <span className="text-xs text-slate-500">
 Nilai yang disimpan akan otomatis tersinkronisasi ke rekap rapor.
 </span>
 <button
 type="button"
 onClick={() => setShowSubmissionsModal(false)}
 className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs rounded-xl border border-slate-300 transition"
 >
 Selesai & Tutup
 </button>
 </div>
 }
 >

 {/* Quick Stats Banner */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
 <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-emerald-200/60 dark:border-emerald-700/80/60">
 <span className="text-[10px] uppercase font-bold text-slate-400">Total Mengumpulkan</span>
 <p className="text-lg font-black text-slate-800 dark:text-slate-200 mt-0.5">{submissionsList.length} <span className="text-xs font-normal text-slate-500">Siswa</span></p>
 </div>
 <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60">
 <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Sudah Dinilai</span>
 <p className="text-lg font-black text-emerald-700 dark:text-emerald-300 mt-0.5">{submissionsList.filter(s => s.nilai_guru !== null && s.nilai_guru !== '').length} <span className="text-xs font-normal text-emerald-600/70">Siswa</span></p>
 </div>
 <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-emerald-200/80 dark:border-emerald-800/60">
 <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Perlu Dinilai</span>
 <p className="text-lg font-black text-amber-700 dark:text-amber-300 mt-0.5">{submissionsList.filter(s => s.nilai_guru === null || s.nilai_guru === '').length} <span className="text-xs font-normal text-amber-600/70">Siswa</span></p>
 </div>
 <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-emerald-200/80 dark:border-emerald-800/60">
 <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">Rata-rata Nilai</span>
 <p className="text-lg font-black text-blue-700 dark:text-blue-300 mt-0.5">
 {(() => {
 const graded = submissionsList.filter(s => s.nilai_guru !== null && s.nilai_guru !== '')
 if (graded.length === 0) return '-'
 const avg = graded.reduce((a, b) => a + Number(b.nilai_guru), 0) / graded.length
 return avg.toFixed(1)
 })()}
 </p>
 </div>
 </div>

 {/* Filter & Search Bar */}
 <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
 <div className="relative flex-1">
 <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={submissionSearch}
 onChange={(e) => setSubmissionSearch(e.target.value)}
 placeholder="Cari siswa berdasarkan nama atau NIS..."
 className="h-9 w-full rounded-3xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 dark:border-emerald-700/80 bg-white dark:bg-slate-800 pl-8 pr-3 text-xs outline-none focus:border-emerald-600"
 />
 </div>
 <CustomSelect
 value={submissionStatusFilter}
 onChange={(e) => setSubmissionStatusFilter(e.target.value)}
 className="h-9 rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 dark:border-emerald-700/80 bg-white dark:bg-slate-800 px-3 text-xs font-semibold outline-none focus:border-emerald-600"
 >
 <option value="all">Semua Status</option>
 <option value="dinilai">Sudah Dinilai</option>
 <option value="belum_dinilai">Belum Dinilai</option>
 <option value="terlambat">Terlambat</option>
 </CustomSelect>
 </div>

 {/* List / Table Content */}
 <div className="flex-1 overflow-y-auto min-h-[250px] max-h-[48vh] rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {loadingSubmissions ? (
 <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-xs">
 <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mb-2" />
 Memuat data pengumpulan tugas siswa...
 </div>
 ) : submissionsList.length === 0 ? (
 <div className="py-12 text-center text-slate-400 text-xs">
 <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
 Belum ada siswa yang mengumpulkan tugas ini.
 </div>
 ) : (
 submissionsList
 .filter((sub) => {
 const studentName = sub.student?.full_name || sub.siswa?.full_name || sub.student?.nama_lengkap || sub.siswa?.nama_lengkap || ''
 const nis = sub.student?.nis || sub.siswa?.nis || ''
 const q = submissionSearch.trim().toLowerCase()
 const matchQ = !q || studentName.toLowerCase().includes(q) || nis.toLowerCase().includes(q)
 if (!matchQ) return false
 if (submissionStatusFilter === 'dinilai') return sub.nilai_guru !== null && sub.nilai_guru !== ''
 if (submissionStatusFilter === 'belum_dinilai') return sub.nilai_guru === null || sub.nilai_guru === ''
 if (submissionStatusFilter === 'terlambat') return sub.status === 'terlambat'
 return true
 })
 .map((sub, idx) => (
 <SubmissionRowItem
 key={sub.id}
 sub={sub}
 index={idx}
 onSaveGrade={handleSaveSingleSubmissionGrade}
 isSaving={savingGradeId === sub.id}
 />
 ))
 )}
 </div>
 </AppModal>

 {/* EXPORT OPTIONS MODAL */}
 <AppModal
 isOpen={showExportModal}
 onClose={() => setShowExportModal(false)}
 zIndex={50}
 maxWidth="max-w-md"
 title="Export Data Workspace"
 description="Pilih format berkas yang ingin Anda unduh untuk rekap pengajaran."
 icon={Download}
 bodyClassName="p-6 space-y-4"
 footer={
 <>
 <button
 type="button"
 onClick={() => setShowExportModal(false)}
 className="px-4 py-2 border border-slate-300 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200"
 >
 Batal
 </button>
 <button
 type="button"
 onClick={handleProcessExport}
 className="px-4 py-2 bg-[#059669] hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md"
 >
 Unduh Berkas
 </button>
 </>
 }
 >
 <div className="grid grid-cols-3 gap-3">
 {[
 { id: 'xlsx', label: 'Excel (.xlsx)', icon: FileSpreadsheet },
 { id: 'csv', label: 'CSV (.csv)', icon: FileText },
 { id: 'pdf', label: 'PDF (.pdf)', icon: FileSpreadsheet },
 ].map((fmt) => {
 const Icon = fmt.icon
 const isSel = exportFormat === fmt.id
 return (
 <button
 key={fmt.id}
 type="button"
 onClick={() => setExportFormat(fmt.id)}
 className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition ${isSel
 ? 'bg-emerald-50 dark:bg-emerald-950/40 border-[#059669] text-[#059669] dark:text-emerald-400 font-bold'
 : 'border-emerald-200/80 dark:border-emerald-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
 }`}
 >
 <Icon className="w-6 h-6" />
 <span className="text-xs">{fmt.label}</span>
 </button>
 )
 })}
 </div>
 </AppModal>

 {/* IMPORT DATA SPREADSHEET MODAL (.csv, .xls, .xlsx) */}
 <AppModal
 isOpen={showImportModal}
 onClose={() => {
 setShowImportModal(false)
 setImportFile(null)
 setImportError('')
 }}
 zIndex={50}
 maxWidth="max-w-xl"
 title={`Import Data ${importTarget === 'penilaian' ? 'Buku Nilai' : 'Presensi Siswa'}`}
 description={`Rombel: ${selectedClassName}`}
 icon={Upload}
 bodyClassName="p-6 space-y-4"
 footer={
 <>
 <button
 type="button"
 onClick={() => {
 setShowImportModal(false)
 setImportFile(null)
 setImportError('')
 }}
 className="px-4 py-2 border border-slate-300 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200"
 >
 Batal
 </button>
 <button
 type="button"
 disabled={!importFile || isImporting}
 onClick={handleProcessImport}
 className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition"
 >
 {isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
 {isImporting ? 'Memproses Import...' : 'Proses & Terapkan Data'}
 </button>
 </>
 }
 >

 <div className="space-y-3">
 <div className="flex items-center justify-between rounded-xl bg-emerald-50/70 p-3 text-xs border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:border-emerald-800/60">
 <div className="text-emerald-800 dark:text-emerald-300">
 <span className="font-bold">Unduh Format Template:</span>
 <p className="text-xs text-emerald-700/80 dark:text-emerald-400">Pastikan format baris dan nama siswa sesuai template.</p>
 </div>
 <button
 type="button"
 onClick={() => handleDownloadImportTemplate(importTarget)}
 className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-emerald-800 shadow-2xs border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100 dark:bg-slate-800 dark:text-emerald-300 dark:border-emerald-800/60"
 >
 <Download className="w-3.5 h-3.5" /> Unduh Template
 </button>
 </div>

 {/* Upload Dropzone */}
 <div
 onClick={() => importFileInputRef.current?.click()}
 className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-emerald-300 dark:border-emerald-700/80 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center"
 >
 <Upload className="w-8 h-8 text-sky-500 mb-2" />
 <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
 {importFile ? importFile.name : 'Klik untuk memilih atau drag & drop file'}
 </span>
 <span className="text-xs text-slate-400 mt-1">
 Format didukung: CSV (.csv), Excel Spreadsheet (.xlsx, .xls)
 </span>
 <input
 ref={importFileInputRef}
 type="file"
 accept=".csv, .xlsx, .xls, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
 className="hidden"
 onChange={(e) => {
 if (e.target.files?.[0]) {
 setImportFile(e.target.files[0])
 setImportError('')
 }
 }}
 />
 </div>

 {importError && (
 <div className="p-3 rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-xs text-rose-700 dark:bg-rose-950/40 dark:border-emerald-800/60 dark:text-rose-300 font-medium">
 {importError}
 </div>
 )}
 </div>
 </AppModal>

 {/* DETAIL DRAWER / MODAL */}
 {showDetailModal && detailData && (() => {
 const isSchedule = !!detailData.rawSchedule || detailData.category === 'Jadwal Mengajar'
 const schedule = detailData.rawSchedule
 const schStatus = schedule ? getScheduleStatus(schedule) : null

 if (isSchedule && schedule) {
 const filteredScheduleStudents = scheduleDetailStudents.filter((st) => {
 if (!scheduleDetailSearch.trim()) return true
 const q = scheduleDetailSearch.toLowerCase()
 const name = (st.nama_lengkap || st.full_name || st.name || '').toLowerCase()
 const nis = (st.nis || st.nisn || '').toLowerCase()
 return name.includes(q) || nis.includes(q)
 })

 const totalStudents = scheduleDetailStudents.length
 let hadirCount = 0
 let terlambatCount = 0
 let izinCount = 0
 let sakitCount = 0
 let alphaCount = 0
 let belumDicatatCount = 0

 scheduleDetailStudents.forEach((st) => {
 const rec = scheduleDetailAttendance[st.id]
 const status = (rec?.status || 'Belum Dicatat').toLowerCase()
 if (status === 'hadir') hadirCount++
 else if (status === 'terlambat') terlambatCount++
 else if (status === 'izin') izinCount++
 else if (status === 'sakit') sakitCount++
 else if (status === 'alpa' || status === 'alpha') alphaCount++
 else belumDicatatCount++
 })

 const tidakHadirCount = izinCount + sakitCount + alphaCount

 return (
 <AppModal
 isOpen={true}
 onClose={() => setShowDetailModal(false)}
 zIndex={50}
 maxWidth="max-w-4xl"
 title={getScheduleSubject(schedule)}
 badge={schStatus?.label}
 description="Detail Jadwal Mengajar KBM"
 icon={CalendarRange}
 headerActions={
 schStatus?.isActive ? (
 <button
 type="button"
 onClick={() => {
 setShowDetailModal(false)
 openPresensiModal(schedule)
 }}
 className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
 title="Buka Lembar Presensi Pembelajaran"
 >
 <UserCheck className="w-3.5 h-3.5" />
 <span>Buka Presensi</span>
 </button>
 ) : null
 }
 bodyClassName="p-0 space-y-0"
 footer={
 <div className="flex w-full flex-wrap items-center justify-between gap-3">
 <div className="text-xs text-slate-500 dark:text-slate-400">
 Menampilkan <strong className="text-emerald-700 dark:text-emerald-300">{filteredScheduleStudents.length}</strong> dari <strong>{scheduleDetailStudents.length}</strong> siswa rombel {getScheduleClass(schedule)}
 </div>

 <div className="flex items-center gap-2">
 {schStatus?.isActive && (
 <button
 type="button"
 onClick={() => {
 setShowDetailModal(false)
 openPresensiModal(schedule)
 }}
 className="px-4 py-2 bg-[#059669] hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition cursor-pointer"
 >
 <UserCheck className="w-4 h-4" /> Buka Presensi Sesi KBM
 </button>
 )}
 <button
 type="button"
 onClick={() => setShowDetailModal(false)}
 className="px-4 py-2 border border-slate-300 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-black text-slate-700 dark:text-slate-200 dark:bg-slate-800 cursor-pointer"
 >
 Tutup
 </button>
 </div>
 </div>
 }
 >

 {/* Info Bar Jadwal */}
 <div className="shrink-0 bg-slate-50/70 dark:bg-slate-900/40 border-b border-emerald-200/80 dark:border-emerald-800/60 p-3 sm:p-4">
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
 <div className="rounded-xl bg-white dark:bg-slate-800/80 p-2.5 border border-emerald-200/80 dark:border-emerald-700/80/80 shadow-2xs">
 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hari & Jam</span>
 <strong className="text-slate-900 dark:text-white mt-0.5 block truncate">
 {getScheduleDay(schedule)} • {(schedule.start_time || schedule.time_start || '00:00').slice(0, 5)} - {(schedule.end_time || schedule.time_end || '00:00').slice(0, 5)} WIB
 </strong>
 </div>

 <div className="rounded-xl bg-white dark:bg-slate-800/80 p-2.5 border border-emerald-200/80 dark:border-emerald-700/80/80 shadow-2xs">
 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rombel / Kelas</span>
 <strong className="text-emerald-700 dark:text-emerald-300 mt-0.5 block truncate">
 {getScheduleClass(schedule)}
 </strong>
 </div>

 <div className="rounded-xl bg-white dark:bg-slate-800/80 p-2.5 border border-emerald-200/80 dark:border-emerald-700/80/80 shadow-2xs">
 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ruangan</span>
 <strong className="text-slate-900 dark:text-white mt-0.5 block truncate">
 {getScheduleRoom(schedule)}
 </strong>
 </div>

 <div className="rounded-xl bg-white dark:bg-slate-800/80 p-2.5 border border-emerald-200/80 dark:border-emerald-700/80/80 shadow-2xs">
 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Guru Pengampu</span>
 <strong className="text-slate-900 dark:text-white mt-0.5 block truncate">
 {teacherName}
 </strong>
 </div>
 </div>
 </div>

 {/* Ringkasan Kehadiran Siswa & Pencarian */}
 <div className="shrink-0 border-b border-emerald-200/80 dark:border-emerald-800/60 p-4 dark:border-emerald-800/60 bg-white dark:bg-card-dark">
 <div className="flex flex-wrap items-center justify-between gap-3">
 {/* KPI Pills Kehadiran */}
 <div className="flex flex-wrap items-center gap-2">
 <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 text-xs font-black text-emerald-700 dark:bg-slate-800 dark:text-slate-200">
 <Users className="h-3.5 w-3.5 text-slate-500" />
 <span>Total: {totalStudents} Siswa</span>
 </span>
 <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
 <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
 <span>Hadir: {hadirCount}</span>
 </span>
 {terlambatCount > 0 && (
 <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-100 px-3 py-1.5 text-xs font-black text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
 <Clock className="h-3.5 w-3.5 text-amber-600" />
 <span>Terlambat: {terlambatCount}</span>
 </span>
 )}
 <span className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black ${tidakHadirCount > 0
 ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
 : 'bg-slate-100 text-slate-500 dark:bg-sky-950/60 dark:text-sky-300'
 }`}>
 <XCircle className="h-3.5 w-3.5 text-rose-600" />
 <span>Tidak Hadir: {tidakHadirCount}</span>
 {tidakHadirCount > 0 && (
 <span className="text-[10px] font-semibold opacity-90">
 ({izinCount} Izin, {sakitCount} Sakit, {alphaCount} Alpha)
 </span>
 )}
 </span>
 {belumDicatatCount > 0 && (
 <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 text-xs font-black text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
 <AlertCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
 <span>Belum Dicatat: {belumDicatatCount}</span>
 </span>
 )}
 </div>

 {/* Pencarian Siswa */}
 <div className="relative min-w-[200px] max-w-xs">
 <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={scheduleDetailSearch}
 onChange={(e) => setScheduleDetailSearch(e.target.value)}
 placeholder="Cari siswa / NISN..."
 className="h-8 w-full rounded-3xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white pl-8 pr-3 text-xs outline-none focus:border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white"
 />
 </div>
 </div>
 </div>

 {/* Tabel Siswa & Status Kehadirannya */}
 <div className="flex-1 overflow-y-auto p-4">
 {loadingScheduleDetail ? (
 <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
 <RefreshCw className="h-5 w-5 animate-spin text-emerald-600" />
 <span>Memuat data siswa dan presensi jadwal...</span>
 </div>
 ) : filteredScheduleStudents.length === 0 ? (
 <div className="py-12 text-center text-xs text-slate-500">
 {scheduleDetailStudents.length === 0
 ? 'Belum ada data siswa yang terdaftar di rombel ini.'
 : 'Tidak ada siswa yang cocok dengan kata kunci pencarian.'}
 </div>
 ) : (
 <div className="overflow-x-auto rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 dark:border-emerald-700/80">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 <th className="py-2.5 px-3 w-12 text-center">No</th>
 <th className="py-2.5 px-3">Nama Siswa</th>
 <th className="py-2.5 px-3">NIS / NISN</th>
 <th className="py-2.5 px-3 text-center">L/P</th>
 <th className="py-2.5 px-3 text-center">Status Kehadiran</th>
 <th className="py-2.5 px-3">Waktu Presensi</th>
 <th className="py-2.5 px-3">Keterangan / Catatan</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {filteredScheduleStudents.map((st, idx) => {
 const rec = scheduleDetailAttendance[st.id] || {}
 const rawStatus = (rec.status || 'Belum Dicatat').toLowerCase()
 const statusPillClass =
 rawStatus === 'hadir'
 ? 'bg-emerald-100 text-emerald-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950 dark:text-emerald-300'
 : rawStatus === 'terlambat'
 ? 'bg-amber-100 text-amber-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950 dark:text-amber-300'
 : rawStatus === 'izin'
 ? 'bg-sky-100 text-sky-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-sky-950 dark:text-sky-300'
 : rawStatus === 'sakit'
 ? 'bg-violet-100 text-violet-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-violet-950 dark:text-violet-300'
 : rawStatus === 'alpa' || rawStatus === 'alpha'
 ? 'bg-rose-100 text-rose-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950 dark:text-rose-300'
 : 'bg-slate-100 text-slate-600 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300'

 const gender = st.gender || st.jenis_kelamin || '-'
 const genderLabel = gender.toLowerCase().startsWith('l') ? 'L' : gender.toLowerCase().startsWith('p') ? 'P' : '-'

 return (
 <tr key={st.id || idx} className="hover:bg-emerald-50/40 transition-colors dark:hover:bg-emerald-950/30">
 <td className="py-2.5 px-3 text-center font-semibold text-slate-400">{idx + 1}</td>
 <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
 <div className="flex items-center gap-2">
 <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-[10px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
 {(st.nama_lengkap || st.full_name || 'S').slice(0, 2).toUpperCase()}
 </div>
 <span className="truncate">{st.nama_lengkap || st.full_name || st.name}</span>
 </div>
 </td>
 <td className="py-2.5 px-3 font-mono text-xs text-slate-500">
 {st.nis || st.nisn || '-'}
 </td>
 <td className="py-2.5 px-3 text-center font-bold text-slate-500">
 {genderLabel}
 </td>
 <td className="py-2.5 px-3 text-center">
 <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold capitalize ${statusPillClass}`}>
 {rec.status || 'Belum Dicatat'}
 </span>
 </td>
 <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-mono text-xs">
 {rec.time || rec.check_in_time || '-'}
 </td>
 <td className="py-2.5 px-3 text-slate-500 text-xs">
 {rec.notes || '-'}
 </td>
 </tr>
 )
 })}
 </tbody>
 </table>
 </div>
 )}
 </div>
 </AppModal>
 )
 }

 if (detailData.rawStudent) {
 const student = detailData.rawStudent
 const notes = detailData.studentNotes || studentNotes.filter((n) => n.student_id === student.id)
 const signedCount = notes.filter((n) => n.signature_status === 'signed' || (n.signed_by_user_id && n.signed_at)).length
 const waitingCount = notes.length - signedCount

 return (
 <AppModal
 isOpen={true}
 onClose={() => setShowDetailModal(false)}
 zIndex={50}
 maxWidth="max-w-4xl"
 title={student.nama_lengkap || student.full_name}
 badge={student.kelas?.nama_kelas || student.kelas?.name || selectedClassName}
 description={`Buku Penghubung Santri • NIS/NISN: ${student.nis || student.nisn || '-'}`}
 icon={MessageSquare}
 subHeader={
 <div className="grid grid-cols-3 gap-2 px-5 py-3 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/60 dark:bg-slate-900/40 text-center text-xs">
 <div className="rounded-xl bg-white p-2 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-800">
 <span className="text-[10px] text-slate-500 block font-medium">Total Catatan</span>
 <strong className="text-sm font-black text-slate-800 dark:text-white">{notes.length}</strong>
 </div>
 <div className="rounded-xl bg-emerald-50 p-2 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/40">
 <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block font-medium">Ditandatangani Wali</span>
 <strong className="text-sm font-black text-emerald-700 dark:text-emerald-300">{signedCount}</strong>
 </div>
 <div className="rounded-xl bg-amber-50 p-2 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/40">
 <span className="text-[10px] text-amber-700 dark:text-amber-300 block font-medium">Menunggu Respon</span>
 <strong className="text-sm font-black text-amber-700 dark:text-amber-300">{waitingCount}</strong>
 </div>
 </div>
 }
 bodyClassName="p-4 sm:p-5 space-y-3"
 footer={
 <div className="flex w-full flex-wrap items-center justify-between gap-3">
 <button
 type="button"
 onClick={() => handlePrintWeeklyEvaluation(student)}
 className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition cursor-pointer"
 >
 <Printer className="w-3.5 h-3.5" /> Cetak Evaluasi Pekanan
 </button>

 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => {
 setShowDetailModal(false)
 openCatatanForm(null, student)
 }}
 className="px-3.5 py-2 bg-[#059669] hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition cursor-pointer"
 >
 <Plus className="w-3.5 h-3.5" /> Tambah Catatan
 </button>
 <button
 type="button"
 onClick={() => setShowDetailModal(false)}
 className="px-3.5 py-2 border border-slate-300 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-black text-slate-700 dark:text-slate-200 dark:bg-slate-800 cursor-pointer"
 >
 Tutup
 </button>
 </div>
 </div>
 }
 >
 {notes.length === 0 ? (
 <div className="py-12 text-center text-slate-400">
 <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
 <p className="text-xs font-semibold">Belum ada catatan untuk santri ini.</p>
 <button
 type="button"
 onClick={() => {
 setShowDetailModal(false)
 openCatatanForm(null, student)
 }}
 className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
 >
 <Plus className="w-3.5 h-3.5" /> Tulis Catatan Pertama
 </button>
 </div>
 ) : (
 notes.map((note) => {
 const isSigned = note.signature_status === 'signed' || Boolean(note.signed_by_user_id && note.signed_at)
 const isStale = note.signature_status === 'signed_updated'
 const isAuthor = note.teacher_id === teacherProfile?.id

 return (
 <div
 key={note.id}
 className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white p-4 shadow-sm transition hover:border-emerald-300 dark:hover:border-emerald-700/80 dark:border-emerald-700/80 dark:bg-slate-800/80 space-y-2.5"
 >
 <div className="flex items-center justify-between gap-2 flex-wrap">
 <div className="flex items-center gap-1.5">
 <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/70 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
 {note.category || 'Akademik'}
 </span>
 <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${note.priority === 'urgent'
 ? 'bg-rose-100 text-rose-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950 dark:text-rose-300'
 : note.priority === 'high'
 ? 'bg-orange-100 text-orange-800 border border-emerald-200/80 dark:bg-orange-950 dark:text-orange-300'
 : 'bg-slate-100 text-slate-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-700 dark:text-slate-300'
 }`}>
 {note.priority || 'medium'}
 </span>
 <span className="text-xs text-slate-400 font-medium">
 · {note.date || note.created_at?.slice(0, 10)}
 </span>
 </div>

 {/* Status Tanda Tangan */}
 <div className="flex items-center gap-1">
 {isSigned && !isStale ? (
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
 <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Ditandatangani
 </span>
 ) : isStale ? (
 <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/40 dark:text-amber-300">
 <AlertTriangle className="w-3 h-3 text-amber-600" /> Perlu Tanda Tangan Ulang
 </span>
 ) : (
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-700 dark:text-slate-300">
 <Clock className="w-3 h-3 text-slate-500" /> Menunggu Respon
 </span>
 )}
 </div>
 </div>

 <div>
 <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
 {note.title}
 </h4>
 <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
 {note.content}
 </p>
 </div>

 {/* Tanggapan Orang Tua */}
 {note.follow_up && (
 <div className="rounded-xl border border-emerald-200/80  bg-emerald-50/70 p-3 text-xs text-emerald-700 dark:text-emerald-300  dark:border-emerald-800/60  dark:bg-emerald-50/70 dark:text-emerald-700 dark:text-emerald-300  space-y-1">
 <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-700 dark:text-emerald-400">
 <MessageSquare className="w-3.5 h-3.5" />
 <span>Tanggapan &amp; Tindak Lanjut Orang Tua:</span>
 </div>
 <p className="italic pl-5">"{note.follow_up}"</p>
 {note.signed_at && (
 <p className="text-[10px] text-emerald-600/80 dark:text-emerald-600/80 pl-5 pt-0.5">
 Ditandatangani pada: {new Date(note.signed_at).toLocaleString('id-ID')}
 </p>
 )}
 </div>
 )}

 {/* Tombol Aksi per Catatan */}
 <div className="flex items-center justify-between pt-1 border-t border-emerald-200/80 dark:border-emerald-700/80">
 <span className="text-[10px] text-slate-400">
 Pengajar: {note.teacher?.full_name || note.teacher?.name || 'Guru'}
 </span>
 {isAuthor && (
 <div className="flex items-center gap-1.5">
 <button
 type="button"
 onClick={() => {
 setShowDetailModal(false)
 openCatatanForm(note)
 }}
 className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-[10px] font-bold border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/50 dark:text-amber-300"
 >
 <Edit3 className="w-3 h-3" /> Edit
 </button>
 <button
 type="button"
 onClick={() => {
 setShowDetailModal(false)
 confirmDeleteModal('catatan', note.id, note.title)
 }}
 className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-[10px] font-bold border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/50 dark:text-rose-300"
 >
 <Trash2 className="w-3 h-3" /> Hapus
 </button>
 </div>
 )}
 </div>
 </div>
 )
 })
 )}
 </AppModal>
 )
 }

 // Default Modal for Non-Schedule items (Materi, Evaluasi, etc.)
 return (
 <AppModal
 isOpen={true}
 onClose={() => setShowDetailModal(false)}
 zIndex={50}
 maxWidth={detailData.category === 'Materi Belajar' ? 'max-w-xl' : 'max-w-md'}
 title={detailData.title}
 badge={detailData.category}
 icon={BookOpen}
 bodyClassName="p-6 space-y-4"
 footer={
 <>
 {detailData.rawStudent && (
 <button
 type="button"
 onClick={() => handlePrintWeeklyEvaluation(detailData.rawStudent)}
 className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition cursor-pointer"
 title="Cetak Lembar Evaluasi Mingguan Santri Resmi"
 >
 <Printer className="w-4 h-4" /> Cetak Evaluasi Pekanan
 </button>
 )}
 <button
 type="button"
 onClick={() => setShowDetailModal(false)}
 className="px-4 py-2 bg-[#059669] hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
 >
 Tutup Detail
 </button>
 </>
 }
 >

 {/* Video Embed */}
 {detailData.video && (
 <div className="pt-2">
 <VideoEmbedPlayer
 url={detailData.video}
 title={`Video: ${detailData.title}`}
 />
 </div>
 )}

 {/* PDF Embed */}
 {detailData.file && (
 <div className="pt-2">
 <PdfDocumentViewer
 url={detailData.file}
 title={`Dokumen: ${detailData.title}`}
 height="400px"
 />
 </div>
 )}

 {/* External Link */}
 {detailData.link && (
 <div className="pt-2">
 <a
 href={detailData.link}
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs border border-emerald-200/80 dark:border-emerald-800/60 transition-colors dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60"
 >
 <ExternalLink className="h-3.5 w-3.5" />
 Buka Tautan Materi di Tab Baru
 </a>
 </div>
 )}

 <div className="space-y-2 border-t border-b border-emerald-200/80 dark:border-emerald-800/60 py-3 text-xs">
 {detailData.items?.map((it, idx) => (
 <div key={idx} className="flex justify-between py-1 border-b border-slate-50 dark:border-emerald-800/50 last:border-0">
 <span className="text-slate-500 font-medium">{it.label}</span>
 <span className="font-bold text-slate-900 dark:text-white text-right">{it.value}</span>
 </div>
 ))}
 </div>

 </AppModal>
 )
 })()}

 {/* FACE RECOGNITION MODAL */}
 <AppModal
 isOpen={showFaceModal}
 onClose={() => setShowFaceModal(false)}
 zIndex={100}
 maxWidth="max-w-xl"
 title="Presensi AI Face Recognition"
 description="Pindai & verifikasi wajah siswa"
 icon={ScanFace}
 bodyClassName="p-5 space-y-4"
 footer={
 <>
 <button
 type="button"
 onClick={() => setShowFaceModal(false)}
 className="px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:text-slate-200 font-black text-xs"
 >
 Batal
 </button>
 <button
 type="submit"
 form="form-face-recognition"
 className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-2"
 >
 <CheckCircle2 className="w-4 h-4" /> Simpan Presensi Wajah
 </button>
 </>
 }
 >
 <form
 id="form-face-recognition"
 onSubmit={(e) => {
 e.preventDefault()
 handleFaceRecognitionSubmit()
 }}
 className="space-y-4 text-xs"
 >
 <div className="relative h-44 bg-black/80 rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 flex flex-col items-center justify-center overflow-hidden">
 <div className="w-32 h-36 border border-emerald-200/80 dark:border-emerald-800/60 rounded-full relative flex items-center justify-center shadow-2xl">
 <ScanFace className="w-14 h-14 text-purple-400 animate-pulse" />
 </div>
 <p className="text-xs text-purple-300 font-semibold mt-2 z-10 bg-black/70 px-3 py-1 rounded-full flex items-center gap-1.5">
 <Camera className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Posisikan Wajah Siswa di Frame Kamera
 </p>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Pilih Siswa / Santri
 </label>
 <CustomSelect
 value={faceStudentId}
 onChange={(e) => setFaceStudentId(e.target.value)}
 className="w-full h-9 rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-800 px-3.5 text-xs font-semibold text-slate-800 dark:text-slate-100"
 >
 <option value="">-- Pilih Siswa --</option>
 {students.map((st) => (
 <option key={st.id} value={st.id}>
 {st.nama_lengkap} ({st.nis || st.nisn || 'No NIS'})
 </option>
 ))}
 </CustomSelect>
 </div>

 </form>
 </AppModal>

 {/* ── MODAL HERO UI: PENGISIAN RANGKUMAN JURNAL TERLEWAT ── */}
 <AppModal
 isOpen={showPendingJournalModal}
 onClose={() => {
 if (!savingJournalNotes) {
 setShowPendingJournalModal(false)
 setSelectedPendingSession(null)
 }
 }}
 title="Lengkapi Rangkuman Pembelajaran KBM"
 subtitle={
 selectedPendingSession
 ? `${selectedPendingSession.schedule?.subject?.name || 'Mata Pelajaran'} • ${selectedPendingSession.schedule?.kelas?.nama_kelas || 'Kelas'} • Pertemuan #${selectedPendingSession.meeting_number || 1} (${selectedPendingSession.attendance_date})`
 : 'Isi ringkasan materi dan evaluasi KBM'
 }
 icon={BookOpen}
 maxWidth="max-w-xl"
 footer={
 <div className="flex items-center justify-end gap-3 w-full">
 <button
 type="button"
 disabled={savingJournalNotes}
 onClick={() => {
 setShowPendingJournalModal(false)
 setSelectedPendingSession(null)
 }}
 className="group inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 text-xs font-black text-white shadow-sm hover:from-rose-600 hover:to-red-800 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
 >
 <span className="flex size-5 items-center justify-center rounded-lg bg-white/20">
 <X className="size-3.5" strokeWidth={2.5} />
 </span>
 <span>Batal</span>
 </button>
 <button
 type="submit"
 form="pending-journal-form"
 disabled={savingJournalNotes}
 className="group inline-flex items-center gap-2 rounded-xl bg-white dark:bg-card-dark px-5 py-2.5 text-xs font-black shadow-sm hover:from-emerald-600 hover:to-teal-800 active:scale-95 disabled:opacity-50 transition-all cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60"
 >
 <span className="flex size-5 items-center justify-center rounded-lg bg-white/20">
 {savingJournalNotes ? (
 <RefreshCw className="size-3.5 animate-spin" />
 ) : (
 <CheckCircle2 className="size-3.5" strokeWidth={2.5} />
 )}
 </span>
 <span>{savingJournalNotes ? 'Menyimpan...' : 'Simpan Rangkuman & Selesaikan'}</span>
 </button>
 </div>
 }
 >
 {selectedPendingSession && (
 <form id="pending-journal-form" onSubmit={handleSavePendingJournal} className="space-y-4 pt-1">
 <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white dark:bg-card-dark p-3.5 dark:border-emerald-800/60 dark:bg-amber-950/20">
 <div className="flex items-center gap-2">
 <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white shadow-xs">
 <Clock className="size-4" />
 </div>
 <div>
 <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
 Penyelesaian Tanggung Jawab Jurnal Mengajar
 </h4>
 <p className="text-xs text-slate-600 dark:text-slate-300">
 Sesi mengajar tanggal <strong>{selectedPendingSession.attendance_date}</strong>. Rangkuman ini akan langsung tersinkronkan ke buku raport, wali santri, dan laporan kurikulum.
 </p>
 </div>
 </div>
 </div>

 <div>
 <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1">
 Topik / Materi Pokok Bahasan <span className="text-rose-500">*</span>
 </label>
 <input
 type="text"
 value={journalTopicInput}
 onChange={(e) => setJournalTopicInput(e.target.value)}
 placeholder="Contoh: Bab 4 - Persamaan Linier & Soal Cerita"
 className="h-9 w-full rounded-xl border-2 border-[#b6f6d9] bg-white px-3.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700/80 dark:bg-slate-900 dark:text-white"
 required
 />
 </div>

 <div>
 <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1">
 Catatan Rangkuman Pembelajaran & Capaian KBM <span className="text-rose-500">*</span>
 </label>
 <textarea
 rows={4}
 value={journalNotesInput}
 onChange={(e) => setJournalNotesInput(e.target.value)}
 placeholder="Tuliskan rangkuman materi yang telah diajarkan, pemahaman siswa, evaluasi singkat, atau tugas yang diberikan..."
 className="w-full rounded-xl border-2 border-[#b6f6d9] bg-white p-3.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-100"
 required
 />
 <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
 Minimal 3 karakter. Catatan ini juga dapat dibaca oleh orang tua di modul portal santri.
 </p>
 </div>
 </form>
 )}
 </AppModal>

 {/* CBT QUIZ RUNNER PREVIEW MODAL */}
 {cbtPreviewModal && (
 <CbtQuizRunnerModal
 quiz={cbtPreviewModal}
 onClose={() => setCbtPreviewModal(null)}
 />
 )}
 </PageContainer>
 )
}

function CbtQuizRunnerModal({ quiz, onClose }) {
 const soalList = Array.isArray(quiz?.parsedSoal) ? quiz.parsedSoal : []
 const durasiMenit = Number(quiz?.durasi_menit) > 0 ? Number(quiz.durasi_menit) : 30
 const nilaiKkm = Number(quiz?.nilai_kkm) > 0 ? Number(quiz.nilai_kkm) : 75

 const [currentIdx, setCurrentIdx] = useState(0)
 const [answers, setAnswers] = useState({})
 const [doubtful, setDoubtful] = useState({})
 const [timeLeft, setTimeLeft] = useState(durasiMenit * 60)
 const [isFinished, setIsFinished] = useState(false)
 const [showConfirmModal, setShowConfirmModal] = useState(false)
 const [resultData, setResultData] = useState(null)

 // Countdown timer
 useEffect(() => {
 if (isFinished) return
 const timer = setInterval(() => {
 setTimeLeft((prev) => {
 if (prev <= 1) {
 clearInterval(timer)
 handleFinishExam()
 return 0
 }
 return prev - 1
 })
 }, 1000)
 return () => clearInterval(timer)
 }, [isFinished])

 const formatTimer = (seconds) => {
 const m = Math.floor(seconds / 60)
 const s = seconds % 60
 return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
 }

 const currentSoal = soalList[currentIdx] || {}
 const totalQuestions = soalList.length
 const answeredCount = Object.keys(answers).filter((k) => answers[k] !== undefined && answers[k] !== '').length
 const doubtfulCount = Object.keys(doubtful).filter((k) => doubtful[k] === true).length

 const handleSelectAnswer = (ans) => {
 setAnswers((prev) => ({
 ...prev,
 [currentIdx]: ans,
 }))
 }

 const toggleDoubtful = () => {
 setDoubtful((prev) => ({
 ...prev,
 [currentIdx]: !prev[currentIdx],
 }))
 }

 const handleFinishExam = () => {
 // Auto-calculate score
 let totalPoin = 0
 let earnedPoin = 0
 let correctCount = 0
 let wrongCount = 0

 soalList.forEach((s, idx) => {
 const bobot = Number(s.poin) > 0 ? Number(s.poin) : 1
 totalPoin += bobot

 const studentAns = String(answers[idx] || '').trim().toUpperCase()
 const keyAns = String(s.kunci_jawaban || '').trim().toUpperCase()

 if (studentAns && studentAns === keyAns) {
 earnedPoin += bobot
 correctCount++
 } else if (studentAns) {
 wrongCount++
 }
 })

 const finalScore = totalPoin > 0 ? Math.round((earnedPoin / totalPoin) * 100) : 0
 const passed = finalScore >= nilaiKkm

 setResultData({
 score: finalScore,
 totalPoin,
 earnedPoin,
 correctCount,
 wrongCount,
 unansweredCount: totalQuestions - (correctCount + wrongCount),
 passed,
 kkm: nilaiKkm,
 })
 setIsFinished(true)
 setShowConfirmModal(false)
 }

 const handleRestart = () => {
 setAnswers({})
 setDoubtful({})
 setCurrentIdx(0)
 setTimeLeft(durasiMenit * 60)
 setIsFinished(false)
 setResultData(null)
 }

 return (
 <AppModal
 isOpen={true}
 onClose={onClose}
 zIndex={100}
 maxWidth="max-w-4xl"
 bodyClassName="p-0 space-y-0 flex flex-col max-h-[90vh]"
 >
 {/* TOP BAR / RUNNER HEADER */}
 <div className="bg-white dark:bg-card-dark px-5 py-3.5 flex items-center justify-between gap-4 shrink-0 shadow-md">
 <div className="flex items-center gap-3">
 <div className="w-10 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-yellow-300 shadow-inner border border-emerald-200/80 dark:border-emerald-800/60">
 <Zap className="w-5 h-5 fill-yellow-300" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider">
 CBT Quiz Runner
 </span>
 <span className="text-xs text-white/80 font-medium">
 KKM: <strong className="text-white">{nilaiKkm}</strong>
 </span>
 </div>
 <h2 className="text-sm sm:text-base font-extrabold text-white max-w-md mt-0.5">
 {quiz?.judul || quiz?.judul_tugas || 'Kuis Interaktif'}
 </h2>
 </div>
 </div>

 <div className="flex items-center gap-3">
 {/* TIMER BADGE */}
 <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border backdrop-blur-md transition-all shadow-inner ${timeLeft < 300
 ? 'bg-rose-500/30 border-emerald-200/80 dark:border-emerald-800/60 text-rose-100 animate-pulse'
 : 'bg-white/15 border-emerald-200/25'
 }`}>
 <Clock className="w-4 h-4" />
 <span className="text-xs sm:text-sm font-black font-mono tracking-wide">
 {formatTimer(timeLeft)}
 </span>
 </div>

 {/* EXIT BUTTON */}
 <button
 type="button"
 onClick={onClose}
 className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition border border-emerald-200/80 dark:border-emerald-800/60"
 title="Tutup Runner CBT"
 >
 <X className="w-5 h-5" />
 </button>
 </div>
 </div>

 {/* MAIN BODY: SPLIT VIEW (EXAM QUESTION OR RESULTS) */}
 {!isFinished ? (
 <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-emerald-100/80 dark:divide-emerald-900/40">
 {/* LEFT / MOBILE TOP: QUESTION NUMBER PALETTE */}
 <div className="w-full md:w-64 bg-slate-50/70 dark:bg-slate-900/40 p-4 flex flex-col shrink-0 overflow-y-auto">
 <div className="flex items-center justify-between mb-3">
 <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
 <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
 Daftar Soal
 </span>
 <span className="text-xs font-semibold text-slate-500">
 {answeredCount} / {totalQuestions}
 </span>
 </div>

 {/* NUMBER SQUIRCLES GRID */}
 <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-4 gap-2">
 {soalList.map((s, idx) => {
 const isAns = answers[idx] !== undefined && answers[idx] !== ''
 const isDoubt = doubtful[idx] === true
 const isCurr = currentIdx === idx

 let btnColor = 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-emerald-200/80 dark:border-emerald-700/80 hover:border-emerald-300 dark:hover:border-emerald-700/80'
 if (isDoubt) {
 btnColor = 'bg-amber-500 text-white border-amber-600 shadow-xs'
 } else if (isAns) {
 btnColor = 'bg-emerald-600 text-white border-emerald-700/80 shadow-xs'
 }

 return (
 <button
 key={idx}
 type="button"
 onClick={() => setCurrentIdx(idx)}
 className={`h-9 rounded-xl font-bold text-xs border transition-all relative flex items-center justify-center cursor-pointer ${btnColor} ${isCurr ? 'ring-2 ring-purple-600 ring-offset-2 dark:ring-offset-slate-900 scale-105 z-10' : ''
 }`}
 >
 {idx + 1}
 {isDoubt && (
 <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 border border-emerald-200/80 rounded-full"></span>
 )}
 </button>
 )
 })}
 </div>

 {/* PALETTE LEGEND */}
 <div className="mt-auto pt-4 border-t border-emerald-200/80 dark:border-emerald-800/60 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
 <div className="flex items-center gap-2">
 <div className="w-3.5 h-3.5 rounded-md bg-emerald-600 shrink-0"></div>
 <span>Sudah Dijawab ({answeredCount})</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="w-3.5 h-3.5 rounded-md bg-amber-500 shrink-0"></div>
 <span>Ragu-ragu ({doubtfulCount})</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="w-3.5 h-3.5 rounded-md bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/60 shrink-0"></div>
 <span>Belum Dijawab ({totalQuestions - answeredCount})</span>
 </div>
 </div>

 {/* FINISH BUTTON IN SIDEBAR */}
 <button
 type="button"
 onClick={() => setShowConfirmModal(true)}
 className="mt-4 w-full py-2.5 bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white hover:from-emerald-700 hover:to-teal-700 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
 >
 <CheckCircle2 className="w-4 h-4" />
 Kumpulkan Jawaban
 </button>
 </div>

 {/* RIGHT: QUESTION & ANSWER PANE */}
 <div className="flex-1 p-5 sm:p-7 overflow-y-auto flex flex-col justify-between space-y-6">
 {totalQuestions === 0 ? (
 <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 text-center">
 <HelpCircle className="w-12 h-9 text-slate-300 dark:text-emerald-600 mb-2 animate-bounce" />
 <p className="font-bold text-sm text-slate-700 dark:text-slate-300">Belum ada butir soal pada kuis ini</p>
 <p className="text-xs text-slate-400 mt-1">Tambahkan butir soal di form edit kuis untuk menjalankan runner CBT.</p>
 </div>
 ) : (
 <>
 <div className="space-y-5">
 {/* QUESTION HEADER BADGES */}
 <div className="flex items-center justify-between flex-wrap gap-2 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3">
 <div className="flex items-center gap-2">
 <span className="px-3 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-black text-xs">
 Soal No. {currentIdx + 1}
 </span>
 <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-xs uppercase">
 {currentSoal.tipe === 'tf' ? 'Benar / Salah' : currentSoal.tipe === 'essay' ? 'Essay' : 'Pilihan Ganda'}
 </span>
 </div>

 <div className="flex items-center gap-2 text-xs">
 <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-medium">
 Bobot: <strong>{currentSoal.poin || 2} Poin</strong>
 </span>
 {currentSoal.tingkat_kesulitan && (
 <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium capitalize">
 {currentSoal.tingkat_kesulitan}
 </span>
 )}
 </div>
 </div>

 {/* QUESTION TEXT */}
 <div className="p-4 sm:p-5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-emerald-200/80 dark:border-emerald-800/60">
 <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap">
 {currentSoal.pertanyaan || currentSoal.soal || 'Isi pertanyaan...'}
 </p>
 </div>

 {/* OPTIONS AREA */}
 <div className="space-y-2.5 pt-1">
 {currentSoal.tipe === 'tf' ? (
 <div className="grid grid-cols-2 gap-3">
 {[
 { label: 'Benar', val: 'BENAR', color: 'emerald' },
 { label: 'Salah', val: 'SALAH', color: 'rose' },
 ].map((opt) => {
 const isSelected = String(answers[currentIdx] || '').toUpperCase() === opt.val
 return (
 <button
 key={opt.val}
 type="button"
 onClick={() => handleSelectAnswer(opt.val)}
 className={`p-4 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${isSelected
 ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 shadow-md ring-2 ring-purple-600/30'
 : 'border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200'
 }`}
 >
 {opt.label}
 </button>
 )
 })}
 </div>
 ) : currentSoal.tipe === 'essay' ? (
 <div>
 <textarea
 rows={5}
 value={answers[currentIdx] || ''}
 onChange={(e) => handleSelectAnswer(e.target.value)}
 placeholder="Tuliskan uraian atau jawaban lengkap Anda di sini..."
 className="w-full rounded-3xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 dark:border-emerald-700/80 bg-white dark:bg-slate-900 p-4 text-xs sm:text-sm outline-none focus:border-purple-600 dark:text-white"
 />
 </div>
 ) : (
 // PILIHAN GANDA (A, B, C, D, E)
 ['a', 'b', 'c', 'd', 'e'].map((letter) => {
 const optionText = currentSoal[`opsi_${letter}`]
 if (!optionText) return null
 const upperLetter = letter.toUpperCase()
 const isSelected = String(answers[currentIdx] || '').toUpperCase() === upperLetter

 return (
 <button
 key={letter}
 type="button"
 onClick={() => handleSelectAnswer(upperLetter)}
 className={`w-full p-3.5 sm:p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3.5 cursor-pointer ${isSelected
 ? 'border-purple-600 bg-purple-50/80 dark:bg-purple-950/40 shadow-sm ring-2 ring-purple-600/30'
 : 'border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700/80 bg-white dark:bg-slate-900'
 }`}
 >
 <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 transition-all ${isSelected
 ? 'bg-emerald-600 text-white shadow-md scale-105'
 : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
 }`}>
 {upperLetter}
 </span>
 <span className={`text-xs sm:text-sm font-medium flex-1 ${isSelected
 ? 'text-purple-950 dark:text-purple-200 font-bold'
 : 'text-slate-800 dark:text-slate-200'
 }`}>
 {optionText}
 </span>
 </button>
 )
 })
 )}
 </div>
 </div>

 {/* BOTTOM ACTION BUTTONS */}
 <div className="flex items-center justify-between gap-3 pt-5 border-t border-emerald-200/80 dark:border-emerald-800/60 flex-wrap">
 <button
 type="button"
 disabled={currentIdx === 0}
 onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
 className="px-4 py-2.5 rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 dark:border-emerald-700/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed"
 >
 <ChevronLeft className="w-4 h-4" />
 Sebelumnya
 </button>

 <button
 type="button"
 onClick={toggleDoubtful}
 className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${doubtful[currentIdx]
 ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
 : 'border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 hover:bg-amber-100/60'
 }`}
 >
 <AlertTriangle className="w-4 h-4" />
 {doubtful[currentIdx] ? 'Batalkan Ragu' : 'Tandai Ragu-Ragu'}
 </button>

 {currentIdx < totalQuestions - 1 ? (
 <button
 type="button"
 onClick={() => setCurrentIdx((prev) => Math.min(totalQuestions - 1, prev + 1))}
 className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
 >
 Selanjutnya
 <ChevronRight className="w-4 h-4" />
 </button>
 ) : (
 <button
 type="button"
 onClick={() => setShowConfirmModal(true)}
 className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
 >
 <CheckCircle2 className="w-4 h-4" />
 Selesai Ujian
 </button>
 )}
 </div>
 </>
 )}
 </div>
 </div>
 ) : (
 /* CBT SCORE RESULT SUMMARY VIEW */
 <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">
 <div className="text-center max-w-xl mx-auto space-y-3">
 <div className={`w-16 h-16 mx-auto rounded-xl flex items-center justify-center shadow-lg ${resultData?.passed
 ? 'bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 ring-4 ring-emerald-500/20'
 : 'bg-white dark:bg-card-dark ring-4 ring-rose-500/20'
 }`}>
 {resultData?.passed ? <Trophy className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
 </div>

 <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${resultData?.passed
 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
 : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
 }`}>
 {resultData?.passed ? 'Tuntas / Memenuhi KKM' : 'Belum Memenuhi KKM'}
 </span>

 <div className="mt-2">
 <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
 {resultData?.score}
 </span>
 <span className="text-sm font-bold text-slate-400 ml-1">/ 100</span>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Nilai KKM Kuis: <strong>{nilaiKkm}</strong> • Total Bobot: {resultData?.earnedPoin} dari {resultData?.totalPoin} poin
 </p>
 </div>

 {/* QUICK KPI BREAKDOWN */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
 <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-center">
 <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Jawaban Benar</span>
 <p className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{resultData?.correctCount}</p>
 </div>
 <div className="p-3.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-center">
 <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">Jawaban Salah</span>
 <p className="text-xl font-black text-rose-700 dark:text-rose-300 mt-1">{resultData?.wrongCount}</p>
 </div>
 <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-emerald-200/80 dark:border-emerald-700/80 text-center">
 <span className="text-[10px] uppercase font-bold text-slate-500">Tidak Dijawab</span>
 <p className="text-xl font-black text-slate-700 dark:text-slate-300 mt-1">{resultData?.unansweredCount}</p>
 </div>
 <div className="p-3.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-center">
 <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400">Total Butir</span>
 <p className="text-xl font-black text-purple-700 dark:text-purple-300 mt-1">{totalQuestions}</p>
 </div>
 </div>

 {/* QUESTION REVIEW ACCORDION / LIST */}
 <div className="max-w-4xl mx-auto space-y-3 pt-2">
 <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
 <FileText className="w-3.5 h-3.5" /> Pembahasan & Kunci Jawaban
 </h4>

 <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {soalList.map((s, idx) => {
 const studentAns = String(answers[idx] || '').trim().toUpperCase()
 const keyAns = String(s.kunci_jawaban || '').trim().toUpperCase()
 const isCorrect = studentAns && studentAns === keyAns

 return (
 <div key={idx} className="pt-2.5 first:pt-0">
 <div className="flex items-start gap-2 justify-between">
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
 {idx + 1}. {s.pertanyaan || s.soal}
 </p>
 <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${isCorrect
 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
 : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
 }`}>
 {isCorrect ? 'Benar (+poin)' : 'Salah'}
 </span>
 </div>
 <div className="flex items-center gap-4 text-xs text-slate-500 mt-1.5 flex-wrap">
 <span>Jawaban Anda: <strong className={isCorrect ? 'text-emerald-600' : 'text-rose-600'}>{studentAns || '(Kosong)'}</strong></span>
 <span>Kunci Jawaban: <strong className="text-purple-600 dark:text-purple-400">{keyAns || '-'}</strong></span>
 </div>
 {s.pembahasan && (
 <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg italic">
 💡 Pembahasan: {s.pembahasan}
 </p>
 )}
 </div>
 )
 })}
 </div>
 </div>

 {/* RESULTS ACTION BUTTONS */}
 <div className="flex items-center justify-center gap-3 pt-4 border-t border-emerald-200/80 dark:border-emerald-800/60">
 <button
 type="button"
 onClick={handleRestart}
 className="px-5 py-2.5 rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 dark:border-emerald-700/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
 >
 <RefreshCw className="w-4 h-4" /> Ulangi Simulasi Kuis
 </button>
 <button
 type="button"
 onClick={onClose}
 className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-md transition cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60 h-9 text-sm font-medium"
 >
 <Check className="w-4 h-4" /> Tutup Pratinjau Runner
 </button>
 </div>
 </div>
 )}

 {/* CONFIRM FINISH MODAL OVERLAY */}
 {showConfirmModal && (
 <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
 <div className="bg-white dark:bg-card-dark rounded-xl p-5 sm:p-6 max-w-sm w-full shadow-2xl border border-emerald-200/80 dark:border-emerald-800/60 text-center space-y-3">
 <div className="w-12 h-9 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
 <AlertTriangle className="w-6 h-6" />
 </div>
 <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
 Kumpulkan Lembar Jawaban?
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Anda telah menjawab <strong>{answeredCount}</strong> dari {totalQuestions} soal.
 {doubtfulCount > 0 && ` Masih ada ${doubtfulCount} soal bertanda ragu-ragu.`}
 </p>
 <div className="flex justify-center gap-2 pt-2">
 <button
 type="button"
 onClick={() => setShowConfirmModal(false)}
 className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
 >
 Periksa Lagi
 </button>
 <button
 type="button"
 onClick={handleFinishExam}
 className="px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-md border border-emerald-200/80 dark:border-emerald-800/60 h-9 text-sm font-medium"
 >
 Ya, Kumpulkan
 </button>
 </div>
 </div>
 </div>
 )}
 </AppModal>
 )
}

function SubmissionRowItem({ sub, index, onSaveGrade, isSaving }) {
 const student = sub.student || sub.siswa || {}
 const [localGrade, setLocalGrade] = useState(sub.nilai_guru !== null && sub.nilai_guru !== undefined ? sub.nilai_guru : '')
 const [localNotes, setLocalNotes] = useState(sub.catatan_guru || '')
 const [showAnswerPreview, setShowAnswerPreview] = useState(false)

 const isGraded = sub.nilai_guru !== null && sub.nilai_guru !== undefined && sub.nilai_guru !== ''
 const isLate = sub.status === 'terlambat'
 const formattedDate = sub.waktu_kumpul
 ? new Date(sub.waktu_kumpul).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
 : '-'

 return (
 <div className="p-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition space-y-2.5">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
 <div className="flex items-center gap-3">
 <span className="text-xs font-mono text-slate-400 w-5">{index + 1}</span>
 <div className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 font-bold flex items-center justify-center text-xs shrink-0">
 {(student.full_name || student.nama_lengkap || 'S').charAt(0)}
 </div>
 <div>
 <h4 className="font-bold text-xs text-slate-900 dark:text-white">
 {student.full_name || student.nama_lengkap || 'Siswa'}
 </h4>
 <div className="flex items-center gap-2 mt-0.5 flex-wrap">
 <span className="text-[10px] text-slate-400 font-mono">NIS: {student.nis || '-'}</span>
 <span className="text-[10px] text-slate-400">• Dikumpulkan: {formattedDate}</span>
 {isLate ? (
 <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 text-[9px] font-bold rounded">Terlambat</span>
 ) : (
 <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 text-[9px] font-bold rounded">Tepat Waktu</span>
 )}
 </div>
 </div>
 </div>

 {/* Grade Action & Badge */}
 <div className="flex items-center gap-2 sm:self-center">
 {isGraded ? (
 <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-extrabold text-xs rounded-lg">
 Nilai: {sub.nilai_guru}
 </span>
 ) : (
 <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold text-[10px] rounded-lg">
 Belum Dinilai
 </span>
 )}
 </div>
 </div>

 {/* Answers & Attachment */}
 <div className="pl-8 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
 <div className="flex items-center gap-3 flex-wrap">
 {sub.jawaban_teks && (
 <button
 type="button"
 onClick={() => setShowAnswerPreview(!showAnswerPreview)}
 className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1"
 >
 <FileText className="w-3.5 h-3.5" />
 {showAnswerPreview ? 'Tutup Jawaban Teks' : 'Lihat Jawaban Teks'}
 </button>
 )}
 {(sub.file_url || sub.file_path) && (
 <a
 href={sub.file_url || sub.file_path}
 target="_blank"
 rel="noreferrer"
 className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
 >
 <Download className="w-3.5 h-3.5" />
 Unduh / Buka Berkas Lampiran
 </a>
 )}
 {!sub.jawaban_teks && !sub.file_url && !sub.file_path && (
 <span className="text-xs text-slate-400 italic">Tidak ada lampiran berkas</span>
 )}
 </div>

 {/* Input Nilai & Catatan Inline */}
 <div className="flex items-center gap-2">
 <input
 type="number"
 min="0"
 max="100"
 value={localGrade}
 onChange={(e) => setLocalGrade(e.target.value)}
 placeholder="0-100"
 className="w-16 h-8 text-center text-xs font-bold border rounded-lg dark:bg-slate-800 border-emerald-200/80 dark:border-emerald-700/80 outline-none focus:border-emerald-600"
 />
 <input
 type="text"
 value={localNotes}
 onChange={(e) => setLocalNotes(e.target.value)}
 placeholder="Catatan / Feedback guru..."
 className="w-40 sm:w-52 h-8 px-2.5 text-xs border rounded-lg dark:bg-slate-800 border-emerald-200/80 dark:border-emerald-700/80 outline-none focus:border-emerald-600"
 />
 <button
 type="button"
 disabled={isSaving}
 onClick={() => onSaveGrade(sub.id, localGrade, localNotes)}
 className="h-8 px-3 bg-[#059669] hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1 transition disabled:opacity-60 shrink-0"
 >
 {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
 Simpan
 </button>
 </div>
 </div>

 {/* Answer Preview Box */}
 {showAnswerPreview && sub.jawaban_teks && (
 <div className="ml-8 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80">
 <p className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-1">Isi Jawaban Siswa:</p>
 {sub.jawaban_teks}
 </div>
 )}
 </div>
 )
}
