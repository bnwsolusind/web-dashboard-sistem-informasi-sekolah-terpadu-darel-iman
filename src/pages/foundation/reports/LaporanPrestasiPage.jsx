import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  Award,
  BookOpen,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  GraduationCap,
  Layers,
  Medal,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  UserCheck,
  Users
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  useAuthStore
} from '../../../stores/authStore'
import {
  reportService
} from '../../../services/reportService'
import {
  useDebounce
} from '../../../hooks/useDebounce'
import {
  SmartScrollFab
} from '../../../components/common'

// HeroUI Core Components
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge
} from '../../../components/ui/avatar'
import {
  Badge
} from '../../../components/ui/badge'
import {
  Button
} from '../../../components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '../../../components/ui/card'
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIndicator,
  AlertTitle
} from '../../../components/ui/alert'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose
} from '../../../components/ui/dialog'
import {
  Pagination
} from '../../../components/ui/pagination'
import {
  TableRoot,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '../../../components/ui/table'
import PageContainer from '../../../components/app/PageContainer'
import AppBreadcrumb from '../../../components/app/AppBreadcrumb'
import {
  MasterStatsGrid,
  MasterStatCard,
  SquircleActionButton,
  PrintOptionModal
} from '../../../components/master-data'
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

const CATEGORY_COLORS = {
 tahfizh: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60', badgeColor: 'emerald' },
 santri: { bg: 'bg-cyan-50 text-cyan-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-emerald-800/60', badgeColor: 'cyan' },
 olahraga: { bg: 'bg-amber-50 text-amber-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-emerald-800/60', badgeColor: 'warning' },
 lomba: { bg: 'bg-purple-50 text-purple-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-purple-950/40 dark:text-purple-300 dark:border-emerald-800/60', badgeColor: 'purple' },
 akademik: { bg: 'bg-rose-50 text-rose-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-emerald-800/60', badgeColor: 'pink' },
}

const TINGKAT_BADGES = {
 Nasional: { color: 'rose', label: 'Tingkat Nasional', icon: Trophy },
 Provinsi: { color: 'purple', label: 'Tingkat Provinsi', icon: Medal },
 'Kota/Kabupaten': { color: 'sky', label: 'Tingkat Kota/Kab', icon: Star },
 'Internal Sekolah': { color: 'gray', label: 'Internal Sekolah', icon: Award },
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
 const [openUpwards, setOpenUpwards] = useState(false)
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

 const handleToggle = () => {
 if (disabled) return
 if (!isOpen && containerRef.current) {
 const rect = containerRef.current.getBoundingClientRect()
 const spaceBelow = window.innerHeight - rect.bottom
 const spaceAbove = rect.top
 setOpenUpwards(spaceBelow < 240 && spaceAbove > spaceBelow)
 setSearch('')
 }
 setIsOpen((prev) => !prev)
 }

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
 <div className={`relative ${isOpen ? 'z-[60]' : 'z-10'} ${className}`} ref={containerRef}>
 <button
 type="button"
 aria-label={ariaLabel}
 disabled={disabled}
 onClick={handleToggle}
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
 initial={{ opacity: 0, scale: 0.96, y: openUpwards ? 6 : -6 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.96, y: openUpwards ? 6 : -6 }}
 transition={{ duration: 0.15, ease: 'easeOut' }}
 className={`absolute left-0 ${
 openUpwards ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
 } z-[100] ${popoverWidth} min-w-[200px] overflow-hidden rounded-xl border border-emerald-200/80 bg-white/95 dark:bg-[#182232]/95 backdrop-blur-md p-1.5 shadow-2xl shadow-sm dark:border-emerald-800/60 dark:shadow-black/60`}
 >
 {(searchable || options.length > 5) && (
 <div className="p-1.5 border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80/60 mb-1">
 <div className="relative">
 <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Cari..."
 className="w-full rounded-lg border-2 border-[#b6f6d9] dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900/60 pl-8 pr-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
 autoFocus
 />
 </div>
 </div>
 )}

 <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5">
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

export function LaporanPrestasiPage() {
 const user = useAuthStore((state) => state.user)

 const isFoundationRole = React.useMemo(() => {
 if (!user) return false
 const roles = user.roles ? (Array.isArray(user.roles) ? user.roles.map(r => typeof r === 'string' ? r : r.name) : [user.roles]) : []
 const roleNames = roles.map(r => String(r).toLowerCase())
 return roleNames.some(r =>
 r.includes('yayasan') || r.includes('pengurus') || r.includes('ketua') || r.includes('sekretaris') || r.includes('bendahara') || r.includes('admin') || r.includes('super')
 ) || Boolean(user.permissions?.includes('foundation.report.view')) || Boolean(user.permissions?.includes('dashboard.yayasan.view'))
 }, [user])

 const canAccessReport = React.useMemo(() => {
 if (!user) return false
 if (isFoundationRole) return true
 const roles = user.roles ? (Array.isArray(user.roles) ? user.roles.map(r => typeof r === 'string' ? r : r.name) : [user.roles]) : []
 const roleNames = roles.map(r => String(r).toLowerCase())
 const isUnitLeader = roleNames.some(r => r.includes('kepala') || r.includes('kepsek') || r.includes('guru') || r.includes('divisi'))
 return isUnitLeader || Boolean(
 user.permissions?.includes('dashboard.pemantauan.lihat') ||
 user.permissions?.includes('kesiswaan.rekap_prestasi') ||
 user.permissions?.includes('kesiswaan.prestasi_rekapitulasi')
 )
 }, [user, isFoundationRole])

 const [searchTerm, setSearchTerm] = useState('')
 const debouncedSearch = useDebounce(searchTerm, 350)

 const [filters, setFilters] = useState({
 period: 'year',
 unit_id: 'all',
 jenis_prestasi: 'all',
 tingkat_prestasi: 'all',
 page: 1,
 per_page: 15,
 })

 const [activeTab, setActiveTab] = useState(isFoundationRole ? 'unit' : 'details') // 'unit' | 'kepsek' | 'divisi' | 'details'
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(null)
 const [reportData, setReportData] = useState(null)

 // Modals state
 const [selectedStudentDetail, setSelectedStudentDetail] = useState(null)
 const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
 const [isExportOpen, setIsExportOpen] = useState(false)
 const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

 const fetchReport = async () => {
 setLoading(true)
 setError(null)
 try {
 const queryParams = { ...filters, search: debouncedSearch }
 const res = await reportService.getPrestasiReport(queryParams, user, isFoundationRole)
 setReportData(res)
 } catch (err) {
 console.error('Failed to fetch Prestasi report', err)
 setError(err)
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 fetchReport()
 }, [filters, debouncedSearch])

 const handleFilterChange = (key, val) => {
 setFilters((prev) => ({ ...prev, [key]: val, page: 1 }))
 }

 const handleResetFilters = () => {
 setSearchTerm('')
 setFilters({
 period: 'year',
 unit_id: 'all',
 jenis_prestasi: 'all',
 tingkat_prestasi: 'all',
 page: 1,
 per_page: 15,
 })
 }

 const periodOptions = useMemo(() => [
 { value: 'year', label: 'Tahun Ini (2026)' },
 { value: 'month', label: 'Bulan Ini' },
 { value: 'all', label: 'Semua Periode' },
 ], [])

 const jenisPrestasiOptions = useMemo(() => [
 { value: 'all', label: 'Semua Kategori' },
 { value: 'tahfizh', label: 'Tahfizh Al-Qur’an' },
 { value: 'santri', label: 'Adab & Karakter Santri' },
 { value: 'olahraga', label: 'Olahraga & Ekskul' },
 { value: 'lomba', label: 'Lomba Pembelajaran' },
 { value: 'akademik', label: 'Akademik Umum' },
 ], [])

 const tingkatPrestasiOptions = useMemo(() => [
 { value: 'all', label: 'Semua Tingkat' },
 { value: 'Nasional', label: 'Tingkat Nasional' },
 { value: 'Provinsi', label: 'Tingkat Provinsi' },
 { value: 'Kota/Kabupaten', label: 'Kota / Kabupaten' },
 { value: 'Internal Sekolah', label: 'Internal Sekolah' },
 ], [])

 const handleOpenStudentDetail = async (studentItem) => {
 try {
 const detail = await reportService.getPrestasiDetail(studentItem.id, isFoundationRole)
 setSelectedStudentDetail(detail || studentItem)
 } catch (e) {
 setSelectedStudentDetail(studentItem)
 }
 setIsDetailModalOpen(true)
 }

 const handleConfirmExport = ({ format, orientation }) => {
 if (isFoundationRole) {
 const url = reportService.exportFoundationReport('prestasi', { ...filters, format, orientation })
 window.open(url, '_blank')
 } else {
 setIsExportOpen(false)
 if (format === 'pdf') {
 handleDownloadPdf()
 } else {
 handlePrintClean()
 }
 }
 }

 const handlePrintClean = () => {
 setIsPrintModalOpen(false)
 const unitTitle = !isFoundationRole ? (reportData?.report?.unit_name || user?.unit_name || user?.unit?.name || 'Unit Pendidikan') : null
 const headers = isFoundationRole
 ? ['Siswa', 'NIS', 'Unit & Kelas', 'Nama Prestasi', 'Kategori', 'Tingkat', 'Tanggal', 'Nilai']
 : ['Siswa', 'NIS', 'Kelas', 'Nama Prestasi', 'Kategori', 'Tingkat', 'Tanggal', 'Nilai']
 const rows = (reportData?.details || []).map((d) => [
 d.student_name || '-',
 d.nis || '-',
 isFoundationRole ? `${d.unit_code || ''} ${d.class_name || ''}` : (d.class_name || '-'),
 d.nama_prestasi || '-',
 d.jenis_prestasi || '-',
 d.tingkat_prestasi || '-',
 d.tanggal_prestasi || '-',
 String(d.nilai_prestasi || 0),
 ])
 printCleanTable({
 title: isFoundationRole ? 'Laporan Rekapitulasi Prestasi Siswa Yayasan' : `Laporan Rekapitulasi Prestasi Siswa - ${unitTitle}`,
 subtitle: `Cakupan: ${unitTitle || 'Semua Unit Yayasan'} • Periode: ${reportData?.report?.period?.label || 'Tahun Ini'} • Total: ${reportData?.meta?.total || rows.length} Prestasi`,
 headers,
 rows,
 })
 }

 const handleDownloadPdf = () => {
 setIsPrintModalOpen(false)
 const unitTitle = !isFoundationRole ? (reportData?.report?.unit_name || user?.unit_name || user?.unit?.name || 'Unit Pendidikan') : null
 const headers = isFoundationRole
 ? ['Siswa', 'NIS', 'Unit & Kelas', 'Nama Prestasi', 'Kategori', 'Tingkat', 'Tanggal', 'Nilai']
 : ['Siswa', 'NIS', 'Kelas', 'Nama Prestasi', 'Kategori', 'Tingkat', 'Tanggal', 'Nilai']
 const rows = (reportData?.details || []).map((d) => [
 d.student_name || '-',
 d.nis || '-',
 isFoundationRole ? `${d.unit_code || ''} ${d.class_name || ''}` : (d.class_name || '-'),
 d.nama_prestasi || '-',
 d.jenis_prestasi || '-',
 d.tingkat_prestasi || '-',
 d.tanggal_prestasi || '-',
 String(d.nilai_prestasi || 0),
 ])
 downloadPdfTable({
 title: isFoundationRole ? 'Laporan Rekapitulasi Prestasi Siswa Yayasan' : `Laporan Rekapitulasi Prestasi Siswa - ${unitTitle}`,
 subtitle: `Cakupan: ${unitTitle || 'Semua Unit Yayasan'} • Periode: ${reportData?.report?.period?.label || 'Tahun Ini'} • Total: ${reportData?.meta?.total || rows.length} Prestasi`,
 headers,
 rows,
 })
 }

 // Access Denied guard if user has no permission to view Prestasi report
 if (!canAccessReport && !loading) {
 return (
 <PageContainer maxW="7xl" className="space-y-6 pb-12">
 <div className="mx-auto max-w-4xl px-4 py-16 text-center">
 <Alert status="error" className="shadow-lg">
 <AlertIndicator />
 <AlertContent>
 <AlertTitle>Akses Dibatasi</AlertTitle>
 <AlertDescription>
 Anda tidak memiliki izin untuk melihat modul Laporan Rekapitulasi Prestasi Siswa.
 </AlertDescription>
 </AlertContent>
 </Alert>
 </div>
 </PageContainer>
 )
 }

 if (loading && !reportData) return <ReportSkeleton />
 if (error) return <ReportErrorState onRetry={fetchReport} error={error} />
 if (!reportData || !reportData.summary) return <ReportEmptyState onReset={handleResetFilters} />

 const {
 summary,
 unit_recaps,
 unit_recaps_total,
 kepala_sekolah_recaps,
 divisi_pendidikan_recaps,
 top_students_cards,
 details,
 charts,
 insights,
 meta,
 report,
 } = reportData

 // Chart pie data
 const pieCategoryData = (divisi_pendidikan_recaps?.distribusi_kategori || []).length > 0
 ? divisi_pendidikan_recaps.distribusi_kategori
 : [
 { name: 'Tahfizh', count: summary.kategori_tahfizh || 0, color: '#10B981' },
 { name: 'Santri & Adab', count: summary.kategori_santri || 0, color: '#06B6D4' },
 { name: 'Akademik', count: summary.kategori_akademik || 0, color: '#EC4899' },
 { name: 'Lomba Belajar', count: summary.kategori_lomba || 0, color: '#8B5CF6' },
 { name: 'Olahraga & Seni', count: summary.kategori_olahraga || 0, color: '#F59E0B' },
 ]

 const unitComparisonData = charts?.unit_comparison || []

 return (
 <PageContainer maxW="7xl" className="space-y-6 pb-12">
 {/* 🧭 AppBreadcrumb Navigation */}
 <AppBreadcrumb
 className="print:hidden"
 items={
 isFoundationRole
 ? [
 { href: '/dashboard/yayasan', label: 'Yayasan' },
 { href: '/dashboard/yayasan/laporan', label: 'Laporan Eksekutif' },
 { label: 'Laporan Rekapitulasi Prestasi Siswa' },
 ]
 : [
 { href: '/dashboard', label: 'Dashboard' },
 { label: 'Laporan Rekapitulasi Prestasi Siswa' },
 ]
 }
 />

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
 
            <Trophy className="size-6 sm:size-7 text-white" />
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2.5 flex-wrap">
 <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold bg-emerald-600 text-white shadow-xs border border-emerald-500/40 dark:border-emerald-600/50">
 
                  <Sparkles className="size-3 animate-pulse text-white" />
 {isFoundationRole ? 'Laporan Prestasi Siswa Yayasan' : `Laporan Prestasi Siswa Unit`}
 </span>
 {!isFoundationRole && (
 <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-0.5 text-xs font-black text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
 <Building2 className="size-3 text-teal-600 dark:text-teal-400" />
 {report?.unit_name || user?.unit_name || user?.unit?.name || 'Unit Pendidikan'}
 </span>
 )}
 <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
 Periode: {report?.period?.label || 'Tahun Berjalan'}
 </span>
 </div>
 <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
 {report?.title || 'Laporan Rekapitulasi Prestasi Siswa'}
 </h1>
 <p className="mt-0.5 w-full text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
 {isFoundationRole
 ? (report?.description || 'Rekapitulasi capaian prestasi siswa per Unit Pendidikan, Kepala Sekolah, dan Divisi Pendidikan dengan profil avatar siswa & kartu apresiasi.')
 : `Capaian dan rekapitulasi prestasi siswa di lingkungan ${report?.unit_name || 'unit pendidikan'} terintegrasi data yayasan.`}
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

 {/* ── 2. KPI STAT CARDS GRID (5 EQUAL & COLORED MODERN CARDS) ── */}
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 print:hidden">
 {[
 {
 label: 'Total Prestasi',
 value: new Intl.NumberFormat('id-ID').format(summary.total_prestasi || 0),
 subtitle: isFoundationRole ? 'Tercatat di sistem yayasan' : `Tercatat di unit ${report?.unit_name || 'sekolah'}`,
 icon: Trophy,
 tone: 'emerald',
 percent: '100%',
 onClick: () => {
 handleFilterChange('jenis_prestasi', 'all')
 handleFilterChange('tingkat_prestasi', 'all')
 },
 isActive: filters.jenis_prestasi === 'all' && filters.tingkat_prestasi === 'all',
 },
 {
 label: 'Siswa Berprestasi',
 value: new Intl.NumberFormat('id-ID').format(summary.total_siswa_berprestasi || 0),
 subtitle: 'Penerima sertifikat/medali',
 icon: Users,
 tone: 'sky',
 percent: `${summary.total_prestasi ? Math.round((summary.total_siswa_berprestasi / summary.total_prestasi) * 100) : 0}%`,
 onClick: () => {
 if (isFoundationRole) setActiveTab('details')
 },
 isActive: activeTab === 'details',
 },
 {
 label: 'Tingkat Nasional',
 value: new Intl.NumberFormat('id-ID').format(summary.tingkat_nasional || 0),
 subtitle: 'Kejuaraan tingkat nasional',
 icon: Medal,
 tone: 'amber',
 percent: `${summary.total_prestasi ? Math.round(((summary.tingkat_nasional || 0) / summary.total_prestasi) * 100) : 0}%`,
 onClick: () => handleFilterChange('tingkat_prestasi', 'Nasional'),
 isActive: filters.tingkat_prestasi === 'Nasional',
 },
 {
 label: 'Tingkat Provinsi',
 value: new Intl.NumberFormat('id-ID').format(summary.tingkat_provinsi || 0),
 subtitle: 'Kejuaraan provinsi / daerah',
 icon: Star,
 tone: 'indigo',
 percent: `${summary.total_prestasi ? Math.round(((summary.tingkat_provinsi || 0) / summary.total_prestasi) * 100) : 0}%`,
 onClick: () => handleFilterChange('tingkat_prestasi', 'Provinsi'),
 isActive: filters.tingkat_prestasi === 'Provinsi',
 },
 {
 label: 'Tahfizh & Santri',
 value: new Intl.NumberFormat('id-ID').format((summary.kategori_tahfizh || 0) + (summary.kategori_santri || 0)),
 subtitle: "Hafalan Al-Qur'an & Adab",
 icon: BookOpen,
 tone: 'purple',
 percent: `${summary.total_prestasi ? Math.round((((summary.kategori_tahfizh || 0) + (summary.kategori_santri || 0)) / summary.total_prestasi) * 100) : 0}%`,
 onClick: () => handleFilterChange('jenis_prestasi', 'tahfizh'),
 isActive: filters.jenis_prestasi === 'tahfizh',
 },
 ].map(({ label, value, subtitle, icon: Icon, tone, percent, onClick, isActive }) => {
 const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
 return (
 <article
 key={label}
 onClick={onClick}
 role="button"
 tabIndex={0}
 onKeyDown={(e) => {
 if (e.key === 'Enter' || e.key === ' ') {
 onClick()
 }
 }}
 className={`group relative overflow-hidden rounded-[22px] border-2 p-4 sm:p-5 shadow-xs transition-all duration-200 cursor-pointer hover:shadow-md flex flex-col justify-between h-full ${t.card} ${
 isActive ? 'ring-2 ring-emerald-500 shadow-md' : ''
 }`}
 title={`Klik untuk memfilter data ${label}`}
 >
 <div>
 <div className="flex items-center justify-between gap-1.5 mb-3">
 <div className={`flex size-11 items-center justify-center rounded-full shadow-xs shrink-0 ${t.iconBox}`}>
 <Icon className="size-5 text-white" />
 </div>
 <div className="flex flex-col items-end gap-0.5">
 <span className={`text-[10px] font-extrabold uppercase tracking-wider ${t.tagHeader || t.title}`}>{label}</span>
 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold shadow-2xs ${t.tag}`}>
 {percent}
 </span>
 </div>
 </div>

 <strong className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight block my-1">
 {value}
 </strong>
 <p className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate block">
 {subtitle}
 </p>
 </div>

 <div className={`flex items-center justify-between text-xs font-bold pt-2.5 mt-3 border-t ${t.divider}`}>
 <span className={`font-bold leading-tight truncate flex-1 ${t.sub}`}>{subtitle}</span>
 <span className={`inline-flex items-center gap-1 font-extrabold group-hover:translate-x-0.5 transition-transform ${t.cta}`}>
 Filter &rarr;
 </span>
 </div>
 </article>
 )
 })}
 </div>

 {/* ── 3. 3-COLUMN EQUAL GRID: FILTER + TREND CHART + DONUT CHART ── */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch print:hidden">
 {/* Col 1: Kartu Filter Laporan + Reset */}
 <div className="relative rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433] flex flex-col justify-between">
 <div className="relative z-20">
 <div className="flex items-center justify-between mb-4 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3">
 <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
 <Filter className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 Filter Laporan Prestasi
 </h3>
 <button
 type="button"
 onClick={handleResetFilters}
 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
 >
 <RotateCcw className="h-3 w-3" />
 Reset Filter
 </button>
 </div>

 <div className="space-y-3">
 <div>
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
 Periode Waktu
 </label>
 <HeroUiFilterSelect
 value={filters.period}
 onChange={(val) => handleFilterChange('period', val)}
 options={periodOptions}
 placeholder="Pilih Periode"
 icon={Calendar}
 ariaLabel="Pilih Periode Waktu"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
 Kategori Prestasi
 </label>
 <HeroUiFilterSelect
 value={filters.jenis_prestasi}
 onChange={(val) => handleFilterChange('jenis_prestasi', val)}
 options={jenisPrestasiOptions}
 placeholder="Pilih Kategori"
 icon={Trophy}
 ariaLabel="Pilih Kategori Prestasi"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
 Tingkat Prestasi
 </label>
 <HeroUiFilterSelect
 value={filters.tingkat_prestasi}
 onChange={(val) => handleFilterChange('tingkat_prestasi', val)}
 options={tingkatPrestasiOptions}
 placeholder="Pilih Tingkat"
 icon={Medal}
 ariaLabel="Pilih Tingkat Prestasi"
 />
 </div>
 </div>
 </div>

 <div className="relative z-0 mt-4 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60">
 <button
 type="button"
 onClick={handleResetFilters}
 className="w-full flex items-center justify-center gap-1.5 rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 p-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300 cursor-pointer transition-colors"
 >
 <RotateCcw className="h-3.5 w-3.5" /> Reset Filter Laporan
 </button>
 </div>
 </div>

 {/* Col 2: Grafik Tren / Tingkat Prestasi (Jika Yayasan: Perbandingan per Unit; Jika Kepsek: Distribusi Tingkat di Unit) */}
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] p-5 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="relative z-10 h-full flex flex-col justify-between">
 <div className="flex items-center justify-between mb-3 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-2.5">
 <div>
 <h4 className="text-sm font-bold text-slate-900 dark:text-white">
 {isFoundationRole ? 'Perbandingan Prestasi per Unit' : 'Sebaran Prestasi per Tingkat'}
 </h4>
 <p className="text-xs text-slate-400">
 {isFoundationRole ? 'Total prestasi per satuan pendidikan' : `Capaian kejuaraan di ${report?.unit_name || 'unit sekolah'}`}
 </p>
 </div>
 <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
 {isFoundationRole ? 'Unit Rekap' : 'Tingkat'}
 </span>
 </div>
 <div className="h-56 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart
 data={
 isFoundationRole
 ? (unitComparisonData.length > 0 ? unitComparisonData : (unit_recaps || []).map(u => ({ unit_code: u.unit_code, total_prestasi: u.total_prestasi })))
 : [
 { tingkat: 'Nasional', total: summary.tingkat_nasional || 0 },
 { tingkat: 'Provinsi', total: summary.tingkat_provinsi || 0 },
 { tingkat: 'Kota/Kab', total: summary.tingkat_kab_kota || 0 },
 { tingkat: 'Internal', total: summary.tingkat_internal || 0 },
 ]
 }
 >
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
 <XAxis dataKey={isFoundationRole ? 'unit_code' : 'tingkat'} tick={{ fontSize: 10 }} />
 <YAxis tick={{ fontSize: 10 }} />
 <Tooltip formatter={(val) => [`${val} Prestasi`, 'Total']} />
 <Bar dataKey={isFoundationRole ? 'total_prestasi' : 'total'} fill="#059669" radius={[6, 6, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>

 {/* Col 3: Grafik Donut Komposisi Kategori Prestasi (PieChart) */}
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] p-5 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="relative z-10 h-full flex flex-col justify-between">
 <div className="flex items-center justify-between mb-3 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-2.5">
 <div>
 <h4 className="text-sm font-bold text-slate-900 dark:text-white">Komposisi Bidang Prestasi</h4>
 <p className="text-xs text-slate-400">Persentase sebaran kategori</p>
 </div>
 <span className="rounded-lg bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
 Kategori
 </span>
 </div>
 <div className="h-56 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={pieCategoryData}
 dataKey="count"
 nameKey="name"
 cx="50%"
 cy="50%"
 innerRadius={45}
 outerRadius={75}
 paddingAngle={3}
 >
 {pieCategoryData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color || ['#10B981', '#06B6D4', '#EC4899', '#8B5CF6', '#F59E0B'][index % 5]} />
 ))}
 </Pie>
 <Tooltip formatter={(val, name) => [`${val} Prestasi`, name]} />
 <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
 </PieChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>
 </div>

 {/* ── 4. SPOTLIGHT CARDS SISWA BERPRESTASI UTAMA ── */}
 {top_students_cards && top_students_cards.length > 0 && (
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] p-5 sm:p-6 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433] print:hidden space-y-4">
 <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3">
 <div>
 <h3 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
 <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
 {isFoundationRole
 ? 'Siswa Berprestasi Utama per Unit Pendidikan'
 : `Siswa Berprestasi Utama (${report?.unit_name || user?.unit_name || user?.unit?.name || 'Unit Pendidikan'})`}
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 {isFoundationRole
 ? 'Kartu apresiasi siswa penerima nilai prestasi tertinggi dari masing-masing unit pendidikan yayasan.'
 : `Kartu apresiasi siswa penerima nilai prestasi tertinggi di lingkungan ${report?.unit_name || 'unit pendidikan'}.`}
 </p>
 </div>
 <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
 {top_students_cards.length} {isFoundationRole ? 'Unit Terpilih' : 'Siswa Berprestasi'}
 </span>
 </div>

 <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
 {top_students_cards.map((card) => {
 const initials = card.full_name
 ? card.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
 : 'SW'

 return (
 <Card
 key={card.id || card.student_id}
 className="group relative overflow-hidden border border-emerald-200/80 dark:border-emerald-800/60 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:shadow-lg dark:hover:border-emerald-700/80 rounded-xl"
 >
 <CardHeader className="flex flex-row items-start justify-between pb-2">
 <div>
 {isFoundationRole ? (
 <>
 <Badge color="emerald" size="sm">
 {card.unit_code || card.unit_name}
 </Badge>
 <p className="mt-1 text-xs font-semibold text-slate-400">{card.unit_name}</p>
 </>
 ) : (
 <>
 <Badge color="emerald" size="sm" prefixIcon={<GraduationCap className="size-3.5" />}>
 {card.class_name || 'Kelas Terdaftar'}
 </Badge>
 <p className="mt-1 text-xs font-semibold text-slate-400">{report?.unit_name || card.unit_name}</p>
 </>
 )}
 </div>
 <Badge color="cyan" size="sm" prefixIcon={<Trophy className="size-3.5" />}>
 Nilai: {card.nilai_prestasi}
 </Badge>
 </CardHeader>

 <CardContent className="space-y-3 pt-1">
 <div className="flex items-center gap-3">
 <Avatar size="lg" status="online">
 {card.avatar_url && <AvatarImage src={card.avatar_url} alt={card.full_name} />}
 <AvatarFallback className="bg-emerald-100 font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
 {initials}
 </AvatarFallback>
 </Avatar>
 <div className="min-w-0 flex-1">
 <h4 className=" text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400">
 {card.full_name}
 </h4>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 NIS: <span className="font-semibold">{card.nis}</span> • {card.class_name}
 </p>
 </div>
 </div>

 <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 p-2.5 dark:border-emerald-800/60 dark:bg-slate-800/50">
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
 {card.nama_prestasi}
 </p>
 <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px]">
 <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
 {card.badge_kategori}
 </span>
 <span className="rounded-md bg-amber-100 px-2 py-0.5 font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
 {card.tingkat_prestasi}
 </span>
 </div>
 </div>
 </CardContent>

 <CardFooter className="pt-0">
 <Button
 variant="ghost"
 size="sm"
 className="w-full justify-between text-xs font-bold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50 cursor-pointer"
 onClick={() => handleOpenStudentDetail(card)}
 >
 <span>Lihat Profil Prestasi</span>
 <Eye className="h-3.5 w-3.5" />
 </Button>
 </CardFooter>
 </Card>
 )
 })}
 </div>
 </div>
 )}

 {/* ── 5. MASTER DATATABLE CONTAINER (EMERALD STANDAR BENCHMARK) ── */}
 <section id="tabel-laporan-prestasi" className="scroll-mt-6 relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-card-dark">
 {/* Toolbar Header Baris 1: Tab Switcher & Squircle Action Buttons */}
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 dark:bg-slate-900/50 p-5 dark:border-emerald-800/60">
 <div>
 <div className="flex items-center gap-2 flex-wrap">
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
 <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
 {isFoundationRole
 ? 'Rekapitulasi & Daftar Rinci Prestasi Siswa'
 : `Daftar Siswa Berprestasi (${report?.unit_name || user?.unit_name || user?.unit?.name || 'Unit Pendidikan'})`}
 </h3>
 <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
 {meta?.total || (details || []).length} Data
 </span>
 </div>
 <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
 {isFoundationRole
 ? 'Pusat data individual prestasi, perbandingan unit, dan laporan kepala sekolah terverifikasi yayasan.'
 : `Pusat data individual prestasi siswa terverifikasi di lingkungan ${report?.unit_name || 'unit pendidikan'}.`}
 </p>
 </div>

 {/* Action Buttons: Export Excel, Pratinjau, Cetak PDF */}
 <div className="flex items-center gap-2 flex-nowrap shrink-0 overflow-visible py-1">
 <SquircleActionButton
 variant="export"
 label="Export Data Excel (.xlsx)"
 onClick={() => setIsExportOpen(true)}
 />
 <SquircleActionButton
 variant="view"
 icon={Eye}
 label="Pratinjau Laporan"
 onClick={() => setIsPrintModalOpen(true)}
 />
 <SquircleActionButton
 variant="print"
 icon={Printer}
 label="Cetak Laporan (PDF)"
 onClick={() => setIsPrintModalOpen(true)}
 />
 </div>
 </div>

 {/* Toolbar Baris 2: Search Debounced + Tab Switcher */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-emerald-200/80 dark:border-emerald-800/60">
 {/* Tab View Selector: Hanya aktif untuk Yayasan. Untuk Kepala Sekolah, cangkupan eksklusif pada unitnya sendiri */}
          {isFoundationRole ? (
            <div
              role="tablist"
              aria-label="Tab View Laporan Prestasi"
              className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-700/80 overflow-x-auto no-scrollbar max-w-full shrink-0 shadow-xs"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'unit'}
                onClick={() => setActiveTab('unit')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer shrink-0 select-none ${
                  activeTab === 'unit'
                    ? 'bg-emerald-600 text-white shadow-sm font-bold opacity-100'
                    : 'text-slate-600 dark:text-slate-300 opacity-70 hover:opacity-100 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/40 hover:text-emerald-900 dark:hover:text-emerald-200'
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>Per Unit Sekolah</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'kepsek'}
                onClick={() => setActiveTab('kepsek')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer shrink-0 select-none ${
                  activeTab === 'kepsek'
                    ? 'bg-emerald-600 text-white shadow-sm font-bold opacity-100'
                    : 'text-slate-600 dark:text-slate-300 opacity-70 hover:opacity-100 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/40 hover:text-emerald-900 dark:hover:text-emerald-200'
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Per Kepala Sekolah</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'divisi'}
                onClick={() => setActiveTab('divisi')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer shrink-0 select-none ${
                  activeTab === 'divisi'
                    ? 'bg-emerald-600 text-white shadow-sm font-bold opacity-100'
                    : 'text-slate-600 dark:text-slate-300 opacity-70 hover:opacity-100 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/40 hover:text-emerald-900 dark:hover:text-emerald-200'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Per Divisi Pendidikan</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'details'}
                onClick={() => setActiveTab('details')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer shrink-0 select-none ${
                  activeTab === 'details'
                    ? 'bg-emerald-600 text-white shadow-sm font-bold opacity-100'
                    : 'text-slate-600 dark:text-slate-300 opacity-70 hover:opacity-100 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/40 hover:text-emerald-900 dark:hover:text-emerald-200'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Rinci Semua Siswa</span>
              </button>
            </div>
 ) : (
 <div className="flex items-center gap-2">
 <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100/90 dark:bg-emerald-950/80 px-3 py-1.5 text-xs font-black text-emerald-800 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
 <Building2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
 Cakupan Unit: {report?.unit_name || user?.unit_name || user?.unit?.name || 'Unit Pendidikan'}
 </span>
 </div>
 )}

 {/* Full-width Search Bar */}
 <div className="relative min-w-[240px] flex-1 max-w-md">
 <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 placeholder="Cari siswa, NIS, nama prestasi..."
 className="w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-white pl-9 pr-3 py-1.5 text-xs font-medium focus:border-emerald-600 focus:outline-none dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white"
 />
 </div>
 </div>

 {/* ── SUB-VIEW TAB 1: REKAPITULASI PER UNIT (KHUSUS YAYASAN) ── */}
 {isFoundationRole && activeTab === 'unit' && (
 <div className="overflow-x-auto">
 <TableRoot fullBleed={true}>
 <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/60 dark:text-emerald-100 font-bold text-xs uppercase tracking-wider">
 <TableRow>
 <TableHead className="py-3 px-4">Kode & Nama Unit</TableHead>
 <TableHead className="py-3 px-4">Kepala Sekolah</TableHead>
 <TableHead className="py-3 px-4 text-right">Total Prestasi</TableHead>
 <TableHead className="py-3 px-4 text-right">Siswa Berprestasi</TableHead>
 <TableHead className="py-3 px-4 text-right">Tahfizh</TableHead>
 <TableHead className="py-3 px-4 text-right">Santri</TableHead>
 <TableHead className="py-3 px-4 text-right">Olahraga</TableHead>
 <TableHead className="py-3 px-4 text-right">Lomba</TableHead>
 <TableHead className="py-3 px-4 text-right">Akademik</TableHead>
 <TableHead className="py-3 px-4">Top Student</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-xs">
 {(unit_recaps || []).map((u) => (
 <TableRow key={u.unit_id} className="transition hover:bg-emerald-50/30 dark:hover:bg-emerald-950/30">
 <TableCell className="py-3 px-4 font-extrabold text-slate-900 dark:text-emerald-600">
 <span className="mr-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
 {u.unit_code}
 </span>
 {u.unit_name}
 </TableCell>
 <TableCell className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
 {u.principal_name}
 </TableCell>
 <TableCell className="py-3 px-4 text-right font-black text-emerald-600 dark:text-emerald-400">
 {u.total_prestasi}
 </TableCell>
 <TableCell className="py-3 px-4 text-right font-bold text-slate-700 dark:text-slate-300">
 {u.siswa_berprestasi_count}
 </TableCell>
 <TableCell className="py-3 px-4 text-right text-xs">{u.tahfizh_count}</TableCell>
 <TableCell className="py-3 px-4 text-right text-xs">{u.santri_count}</TableCell>
 <TableCell className="py-3 px-4 text-right text-xs">{u.olahraga_count}</TableCell>
 <TableCell className="py-3 px-4 text-right text-xs">{u.lomba_count}</TableCell>
 <TableCell className="py-3 px-4 text-right text-xs">{u.akademik_count}</TableCell>
 <TableCell className="py-3 px-4">
 {u.top_student ? (
 <div className="flex items-center gap-2">
 <Avatar size="xs">
 {u.top_student.avatar_url && <AvatarImage src={u.top_student.avatar_url} alt={u.top_student.full_name} />}
 <AvatarFallback className="bg-emerald-100 text-[10px] text-emerald-800">
 {u.top_student.full_name[0]}
 </AvatarFallback>
 </Avatar>
 <span className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">
 {u.top_student.full_name}
 </span>
 </div>
 ) : (
 <span className="text-xs text-slate-400">-</span>
 )}
 </TableCell>
 </TableRow>
 ))}
 {unit_recaps_total && (
 <TableRow className="bg-emerald-50/80 font-black text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-200 border-t-2 border-emerald-300">
 <TableCell className="py-3 px-4" colSpan={2}>{unit_recaps_total.unit_name}</TableCell>
 <TableCell className="py-3 px-4 text-right text-sm font-black text-emerald-700 dark:text-emerald-300">{unit_recaps_total.total_prestasi}</TableCell>
 <TableCell className="py-3 px-4 text-right">{unit_recaps_total.siswa_berprestasi_count}</TableCell>
 <TableCell className="py-3 px-4 text-right">{unit_recaps_total.tahfizh_count}</TableCell>
 <TableCell className="py-3 px-4 text-right">{unit_recaps_total.santri_count}</TableCell>
 <TableCell className="py-3 px-4 text-right">{unit_recaps_total.olahraga_count}</TableCell>
 <TableCell className="py-3 px-4 text-right">{unit_recaps_total.lomba_count}</TableCell>
 <TableCell className="py-3 px-4 text-right">{unit_recaps_total.akademik_count}</TableCell>
 <TableCell className="py-3 px-4">-</TableCell>
 </TableRow>
 )}
 </TableBody>
 </TableRoot>
 </div>
 )}

 {/* ── SUB-VIEW TAB 2: REKAPITULASI PER KEPALA SEKOLAH (KHUSUS YAYASAN) ── */}
 {isFoundationRole && activeTab === 'kepsek' && (
 <div className="overflow-x-auto">
 <TableRoot fullBleed={true}>
 <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/60 dark:text-emerald-100 font-bold text-xs uppercase tracking-wider">
 <TableRow>
 <TableHead className="py-3 px-4">Pimpinan / Kepala Sekolah</TableHead>
 <TableHead className="py-3 px-4">Unit Pendidikan</TableHead>
 <TableHead className="py-3 px-4 text-right">Prestasi Terverifikasi</TableHead>
 <TableHead className="py-3 px-4 text-right">Rata-rata Skor</TableHead>
 <TableHead className="py-3 px-4">Tingkat Capaian Tertinggi</TableHead>
 <TableHead className="py-3 px-4">Status Laporan</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-xs">
 {(kepala_sekolah_recaps || []).map((k) => (
 <TableRow key={k.unit_id} className="transition hover:bg-emerald-50/30 dark:hover:bg-emerald-950/30">
 <TableCell className="py-3 px-4 font-extrabold text-slate-900 dark:text-emerald-600">
 <div className="flex items-center gap-2">
 <div className="rounded-full bg-emerald-100 p-1.5 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
 <UserCheck className="h-4 w-4" />
 </div>
 <span>{k.kepala_sekolah_name}</span>
 </div>
 </TableCell>
 <TableCell className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">{k.unit_name}</TableCell>
 <TableCell className="py-3 px-4 text-right font-black text-emerald-600 dark:text-emerald-400">
 {k.total_prestasi_diverifikasi}
 </TableCell>
 <TableCell className="py-3 px-4 text-right font-bold text-slate-700 dark:text-slate-300">
 {k.skor_rata_rata}
 </TableCell>
 <TableCell className="py-3 px-4">
 <Badge color="purple" size="sm">
 {k.tingkat_tertinggi}
 </Badge>
 </TableCell>
 <TableCell className="py-3 px-4">
 <Badge color="emerald" size="sm" prefixIcon={<CheckCircle2 className="size-3.5" />}>
 {k.status_laporan}
 </Badge>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </TableRoot>
 </div>
 )}

 {/* ── SUB-VIEW TAB 3: KONSOLIDASI DIVISI PENDIDIKAN (KHUSUS YAYASAN) ── */}
 {isFoundationRole && activeTab === 'divisi' && (
 <div className="p-6 space-y-6">
 <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
 <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 p-5 dark:border-emerald-800/60 dark:bg-slate-800/40">
 <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-3">
 Distribusi Prestasi Berdasarkan Kategori
 </h4>
 <div className="h-64 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={pieCategoryData}
 dataKey="count"
 nameKey="name"
 cx="50%"
 cy="50%"
 outerRadius={80}
 label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
 >
 {pieCategoryData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color || '#10B981'} />
 ))}
 </Pie>
 <Tooltip />
 <Legend />
 </PieChart>
 </ResponsiveContainer>
 </div>
 </div>

 <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 p-5 dark:border-emerald-800/60 dark:bg-slate-800/40">
 <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-3">
 Perbandingan Total Prestasi per Unit Pendidikan
 </h4>
 <div className="h-64 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={unitComparisonData}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
 <XAxis dataKey="unit_code" />
 <YAxis />
 <Tooltip />
 <Legend />
 <Bar dataKey="total_prestasi" name="Total Prestasi" fill="#059669" radius={[4, 4, 0, 0]} />
 <Bar dataKey="tahfizh" name="Tahfizh" fill="#10B981" radius={[4, 4, 0, 0]} />
 <Bar dataKey="akademik" name="Akademik" fill="#EC4899" radius={[4, 4, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* ── SUB-VIEW TAB 4 / DEFAULT: DAFTAR RINCI SISWA (UNTUK KEPALA SEKOLAH ATAU TAB DETAILS YAYASAN) ── */}
 {(!isFoundationRole || activeTab === 'details') && (
 <div className="border-t border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60">
 <div className="p-4 bg-emerald-50/30 dark:bg-emerald-950/20 flex items-center justify-between">
 <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
 {isFoundationRole
 ? 'Daftar Rinci Profil Prestasi Siswa Terverifikasi'
 : `Daftar Rinci Profil Prestasi Siswa (${report?.unit_name || user?.unit_name || user?.unit?.name || 'Unit Pendidikan'})`}
 </h4>
 <span className="text-xs font-bold text-slate-500">
 Halaman {meta?.current_page || 1} dari {meta?.last_page || 1}
 </span>
 </div>

 <div className="overflow-x-auto">
 <TableRoot fullBleed={true}>
              <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/60 dark:text-emerald-100 font-bold text-xs uppercase tracking-wider">
                <TableRow>
                  <TableHead className="py-3 px-4">PROFIL &amp; NAMA SISWA</TableHead>
                  <TableHead className="py-3 px-4">{isFoundationRole ? 'UNIT & KELAS' : 'KELAS'}</TableHead>
                  <TableHead className="py-3 px-4">PRESTASI &amp; KATEGORI</TableHead>
                  <TableHead className="py-3 px-4 text-right">TANGGAL &amp; SKOR</TableHead>
                  <TableHead className="py-3 px-4 text-right w-16 sm:w-20 select-none" />
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-xs">
                {(details || []).map((row) => {
                  const initials = row.student_name
                    ? row.student_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
                    : 'SW'
                  const categoryStyle = CATEGORY_COLORS[row.jenis_prestasi] || CATEGORY_COLORS.akademik
                  const levelConfig = TINGKAT_BADGES[row.tingkat_prestasi] || TINGKAT_BADGES['Internal Sekolah']

                  return (
                    <TableRow
                      key={row.id}
                      className="transition hover:bg-emerald-50/30 dark:hover:bg-slate-800/50"
                    >
                      {/* Student Profil with HeroUI Avatar */}
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar size="md" status="online">
                            {row.avatar_url && <AvatarImage src={row.avatar_url} alt={row.student_name} />}
                            <AvatarFallback className="bg-emerald-100 font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <span className="block font-extrabold text-slate-900 dark:text-white">
                              {row.student_name}
                            </span>
                            <span className="block text-xs text-slate-500 font-mono">
                              NIS: {row.nis}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 px-4">
                        {isFoundationRole ? (
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge color="emerald" size="sm">
                                {row.unit_code}
                              </Badge>
                              {row.unit_name && row.unit_name !== row.unit_code && (
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                  {row.unit_name}
                                </span>
                              )}
                            </div>
                            <span className="block mt-1 text-xs text-slate-500 font-medium">
                              {row.class_name}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                              <GraduationCap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              {row.class_name}
                            </span>
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="py-3 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {row.nama_prestasi}
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <Badge color={categoryStyle.badgeColor} size="sm">
                            {row.jenis_prestasi}
                          </Badge>
                          <Badge color={levelConfig.color} size="sm">
                            {row.tingkat_prestasi}
                          </Badge>
                          <span className="text-[10px] text-slate-400">
                            {row.tahun_ajaran}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 px-4 text-right">
                        <span className="block font-mono text-xs text-slate-500">
                          {row.tanggal_prestasi}
                        </span>
                        <span className="block font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                          Skor: {row.nilai_prestasi}
                        </span>
                      </TableCell>

                      <TableCell className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          appearance="outline"
                          size="xs"
                          onClick={() => handleViewDetail(row)}
                          className="h-7 px-2.5 text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-xl font-bold border border-sky-200 dark:border-sky-800"
                        >
                          <Eye className="size-3.5 mr-1" />
                          <span>Rincian</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
 </TableRoot>
 </div>

 {/* HeroUI Pagination */}
 {meta && meta.last_page > 1 && (
 <div className="w-full border-t border-emerald-200/80 dark:border-emerald-800/60 p-4 dark:border-emerald-800/60">
 <Pagination
 currentPage={meta.current_page}
 totalPages={meta.last_page}
 onPageChange={(page) => handleFilterChange('page', page)}
 sideLayout="full"
 />
 </div>
 )}
 </div>
 )}
 </section>

 {/* ── 6. EXECUTIVE INSIGHTS ALERTS ── */}
 <div className="space-y-3">
 {(insights || []).map((ins, idx) => (
 <Alert key={idx} status={ins.type === 'success' ? 'success' : ins.type === 'warning' ? 'warning' : 'info'}>
 <AlertIndicator />
 <AlertContent>
 <AlertTitle>{ins.title}</AlertTitle>
 <AlertDescription>{ins.description}</AlertDescription>
 </AlertContent>
 </Alert>
 ))}
 </div>

 {/* ── 7. STUDENT PROFILE DETAIL DIALOG MODAL ── */}
 {isDetailModalOpen && selectedStudentDetail && (
 <Dialog
 open={isDetailModalOpen}
 onOpenChange={setIsDetailModalOpen}
 modalClassName="z-[70] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
 className="w-full max-w-xl p-0 rounded-xl overflow-hidden bg-white dark:bg-[#1B2433] border border-emerald-200/80 shadow-2xl"
 >
 <div className="p-6">
 <DialogHeader className="pb-4 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <div className="flex items-center gap-3">
 <div className="flex h-9 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm">
 <Trophy className="h-5 w-5" />
 </div>
 <div>
 <DialogTitle className="text-base font-black text-slate-900 dark:text-emerald-600">
 Profil Prestasi Siswa
 </DialogTitle>
 <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Detail biodata dan riwayat pencapaian prestasi siswa terverifikasi di bawah Yayasan.
 </DialogDescription>
 </div>
 </div>
 </DialogHeader>

 <DialogBody className="space-y-4 py-4 text-xs">
 <div className="flex items-center gap-4 rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 p-4 dark:border-emerald-800/60 dark:bg-slate-800/60">
 <Avatar size="xl" status="online">
 {selectedStudentDetail.student?.avatar_url && (
 <AvatarImage
 src={selectedStudentDetail.student.avatar_url}
 alt={selectedStudentDetail.student.full_name}
 />
 )}
 <AvatarFallback className="bg-emerald-200 text-xl font-black text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
 {selectedStudentDetail.student?.full_name
 ? selectedStudentDetail.student.full_name.slice(0, 2).toUpperCase()
 : 'SW'}
 </AvatarFallback>
 </Avatar>
 <div className="min-w-0 flex-1">
 <h4 className="text-sm font-black text-slate-900 dark:text-white">
 {selectedStudentDetail.student?.full_name || selectedStudentDetail.student_name}
 </h4>
 <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
 NIS: {selectedStudentDetail.student?.nis || selectedStudentDetail.nis}
 </p>
 <p className="mt-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
 {selectedStudentDetail.unit_name} — {selectedStudentDetail.class_name}
 </p>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3 text-xs">
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 p-3 dark:border-emerald-800/60 dark:bg-slate-800/40">
 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nama Prestasi</span>
 <span className="mt-0.5 block font-extrabold text-slate-800 dark:text-slate-200">
 {selectedStudentDetail.nama_prestasi}
 </span>
 </div>
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 p-3 dark:border-emerald-800/60 dark:bg-slate-800/40">
 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tingkat Prestasi</span>
 <span className="mt-0.5 block font-extrabold text-slate-800 dark:text-slate-200">
 {selectedStudentDetail.tingkat_prestasi}
 </span>
 </div>
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 p-3 dark:border-emerald-800/60 dark:bg-slate-800/40">
 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kategori / Bidang</span>
 <span className="mt-0.5 block font-extrabold text-slate-800 dark:text-slate-200">
 {selectedStudentDetail.jenis_prestasi}
 </span>
 </div>
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 p-3 dark:border-emerald-800/60 dark:bg-slate-800/40">
 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tanggal Diperoleh</span>
 <span className="mt-0.5 block font-mono font-bold text-slate-800 dark:text-slate-200">
 {selectedStudentDetail.tanggal_prestasi || selectedStudentDetail.tanggal_prestasi_formatted || '-'}
 </span>
 </div>
 </div>

 <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
 <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200">Total Nilai Poin Prestasi</span>
 <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">
 {selectedStudentDetail.nilai_prestasi || 0} Poin
 </span>
 </div>

 <div className="pt-1">
 <span className="text-xs font-bold text-slate-500">Keterangan / Catatan Apresiasi</span>
 <p className="mt-1 rounded-lg bg-slate-50 p-2 text-xs text-slate-700 dark:bg-emerald-950/60 dark:text-emerald-300">
 {selectedStudentDetail.keterangan || 'Tidak ada keterangan tambahan.'}
 </p>
 </div>
 </DialogBody>

 <DialogFooter className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60">
 <DialogClose asChild>
 <Button variant="ghost" size="sm" className="rounded-xl font-bold cursor-pointer">
 Tutup Profil
 </Button>
 </DialogClose>
 </DialogFooter>
 </div>
 </Dialog>
 )}

 {/* ── 8. PRINT & EXPORT MODALS ── */}
 <PrintOptionModal
 isOpen={isPrintModalOpen}
 onClose={() => setIsPrintModalOpen(false)}
 onPrint={handlePrintClean}
 onDownloadPdf={handleDownloadPdf}
 title="Cetak Laporan Rekapitulasi Prestasi Siswa"
 />

 {isExportOpen && (
 <ReportExportModal
 isOpen={isExportOpen}
 onClose={() => setIsExportOpen(false)}
 onExport={handleConfirmExport}
 title="Export Laporan Rekapitulasi Prestasi Siswa"
 />
 )}

 {/* Smart Floating Scroll Navigator */}
 <SmartScrollFab targetId="tabel-laporan-prestasi" downTooltip="Langsung ke Tabel Prestasi" />
 </PageContainer>
 )
}
