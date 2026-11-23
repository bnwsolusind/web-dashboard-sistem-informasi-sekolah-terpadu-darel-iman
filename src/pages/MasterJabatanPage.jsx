import React, { useState, useMemo } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  Briefcase as FaBriefcase,
  CircleCheck as FaCheckCircle,
  Network as FaSitemap,
  LockOpen as FaLockOpen,
  Lock as FaLock,
  RotateCcw as FaRedo,
  ChevronDown,
  RefreshCcw,
  Printer,
  BarChart2,
  PieChart as PieIcon,
  X,
  Search,
  Eye,
  ShieldCheck,
  Sparkles,
  Pencil,
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText
} from 'lucide-react'
import {
  Download as Download1,
  Upload as Upload1,
  Plus
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import {
  jabatanService
} from '../services/jabatanService'
import JabatanFormModal from '../components/jabatan/JabatanFormModal'
import JabatanDetailModal from '../components/jabatan/JabatanDetailModal'
import JabatanImportModal from '../components/jabatan/JabatanImportModal'
import PageContainer from '../components/app/PageContainer'
import {
  HeroUiHeader,
  useToast,
  AppButton,
  IconButton,
  AppInput,
  KpiStatCard
} from '../components/app'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppDataTable from '../components/app/AppDataTable'
import ActionDropdown from '../components/app/ActionDropdown'
import AppBadge from '../components/app/AppBadge'
import {
  MasterStatusBadge,
  PrintOptionModal
} from '../components/master-data'
import HeroUiFilterSelect from '../components/ui/HeroUiFilterSelect'
import {
  printCleanTable,
  downloadPdfTable
} from '../utils/printHelper'
import {
  downloadFileFromApi
} from '../utils/exportUtils'
import {
  Button
} from '@/components/ui/button'
import {
  Checkbox
} from '@/components/ui/checkbox'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card'
import {
  useAuthStore
} from '../stores/authStore'
import {
  usePengaturanStore
} from '../stores/pengaturanStore'
import {
  hasAnyRole,
  getUserRoleLevel,
  ROLE_LEVELS,
  isFoundationUser
} from '../auth/portalResolver'
import {
  SmartScrollFab
} from '../components/common'
import {
  useDebounce
} from '../hooks/useDebounce'
import {
  cn
} from '../lib/utils'

// ── MODERN KPI CARD TONE DEFINITIONS ──────────────────────────────────────────
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

const containerVariants = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: { staggerChildren: 0.08, delayChildren: 0.05 },
 },
}

const itemVariants = {
 hidden: { opacity: 0, y: 15 },
 visible: {
 opacity: 1,
 y: 0,
 transition: { type: 'spring', stiffness: 350, damping: 25 },
 },
}

export default function MasterJabatanPage() {
 const queryClient = useQueryClient()
 const user = useAuthStore((state) => state.user)
 const sitePengaturan = usePengaturanStore((state) => state.pengaturan)
 const roles = user?.roles || (user?.role ? [user.role] : [])
 const userLevel = getUserRoleLevel(user)
 const isFoundation = isFoundationUser(user)
 const isKepalaSekolah = userLevel === ROLE_LEVELS.KEPALA_SEKOLAH // Level 4
 const canManageGlobalPositions = !isFoundation && userLevel <= ROLE_LEVELS.YAYASAN // Level 1-2: Admin Sistem Murni (Bukan Yayasan)
 const canManageUnitPositions = !isFoundation && (userLevel === ROLE_LEVELS.OPERATOR || userLevel === ROLE_LEVELS.KEPALA_SEKOLAH) // Level 3-4: Operator & Kepsek/Divisi
 const canEditPosition = !isFoundation && userLevel <= ROLE_LEVELS.KEPALA_SEKOLAH // Level 1 s/d 4 (Bukan Yayasan)

 const isPengurusYayasanRow = (row) => {
 if (!row) return false
 if (Number(row.level_jabatan) === 1) return true
 if (row.satuan_kerja === 'Pengurus') return true
 const name = String(row.nama_jabatan || row.name || '').toLowerCase()
 if (name.includes('pengurus yayasan') || name.includes('yayasan')) return true
 const levelLabel = String(row.level_label || '').toLowerCase()
 if (levelLabel.includes('pengurus yayasan') || levelLabel.includes('yayasan')) return true
 return false
 }

 const isRowRestrictedForUser = (row) => {
 const isGlobalPosition =
 Number(row?.level_jabatan) <= 2 ||
 ['semua_unit', 'bidang_pendidikan'].includes(row?.scope_akses) ||
 row?.satuan_kerja !== 'Unit Pendidikan'
 return !canManageGlobalPositions && (isPengurusYayasanRow(row) || !row?.unit_sekolah_id || isGlobalPosition)
 }

 // Filter & Pagination States
 const [search, setSearch] = useState('')
 const debouncedSearch = useDebounce(search, 350)
 const [selectedUnitFilter, setSelectedUnitFilter] = useState('')
 const [selectedSatuanKerjaFilter, setSelectedSatuanKerjaFilter] = useState('')
 const [selectedLevelFilter, setSelectedLevelFilter] = useState('')
 const [selectedStatusFilter, setSelectedStatusFilter] = useState('')
 const [denganSampahFilter, setDenganSampahFilter] = useState('')
 const [page, setPage] = useState(1)
 const [perPage, setPerPage] = useState(10)

 // Modals States
 const [isFormModalOpen, setIsFormModalOpen] = useState(false)
 const [selectedJabatanForEdit, setSelectedJabatanForEdit] = useState(null)
 const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
 const [selectedJabatanForDetail, setSelectedJabatanForDetail] = useState(null)
 const [isImportModalOpen, setIsImportModalOpen] = useState(false)
 const [duplicateModalData, setDuplicateModalData] = useState(null)
 const [deleteTarget, setDeleteTarget] = useState(null)
 const [restoreTarget, setRestoreTarget] = useState(null)
 const [pendingSaveData, setPendingSaveData] = useState(null)
 const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false)
 const [printOptionModalOpen, setPrintOptionModalOpen] = useState(false)
 const [activeKpiModal, setActiveKpiModal] = useState(null)
 const [kpiModalSearch, setKpiModalSearch] = useState('')
 const [showExportModal, setShowExportModal] = useState(false)
 const [exportFormat, setExportFormat] = useState('xlsx')
 const [isExporting, setIsExporting] = useState(false)
 const [selectedJabatanIds, setSelectedJabatanIds] = useState([])
 const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false)

 // Global Toast
 const { pushToast } = useToast()

 // Query Options Dropdown
 const { data: options = {} } = useQuery({
 queryKey: ['jabatan-options'],
 queryFn: () => jabatanService.getOptions(),
 })

 // Query Daftar Jabatan
 const {
 data: jabatanData = {},
 isLoading,
 isFetching,
 isError,
 refetch,
 } = useQuery({
 queryKey: [
 'jabatan-list',
 page,
 perPage,
 debouncedSearch,
 selectedUnitFilter,
 selectedSatuanKerjaFilter,
 selectedLevelFilter,
 selectedStatusFilter,
 denganSampahFilter,
 ],
 queryFn: () =>
 jabatanService.getDaftar({
 page,
 per_page: perPage,
 search: debouncedSearch,
 unit_sekolah_id: selectedUnitFilter,
 satuan_kerja: selectedSatuanKerjaFilter,
 level_jabatan: selectedLevelFilter,
 status: selectedStatusFilter,
 dengan_sampah: denganSampahFilter,
 order_by: 'urutan',
 order_dir: 'asc',
 }),
 })

 const daftarJabatan = jabatanData?.data || []
 const meta = jabatanData?.meta || {}
 const statistik = jabatanData?.statistik || {}

 // Dedicated query for KPI Cards drill-down modal to ensure full dataset
 const { data: allJabatanResponse = {} } = useQuery({
 queryKey: ['all-jabatan-for-kpi'],
 queryFn: () => jabatanService.getDaftar({ per_page: 200, dengan_sampah: 'ya' }),
 })
 const allJabatanData = allJabatanResponse?.data || daftarJabatan

 const totalCount = statistik.total_jabatan ?? daftarJabatan.length ?? 0
 const activeCount = statistik.aktif ?? 0
 const sitemapCount = statistik.tampil_struktur ?? 0
 const loginCount = statistik.boleh_login ?? 0

 // ── KPI Modal Drill-down Data ──────────────────────────────────────────
 const filteredKpiItems = useMemo(() => {
 if (!activeKpiModal) return []
 let base = allJabatanData.length ? allJabatanData : daftarJabatan
 if (activeKpiModal === 'aktif') {
 base = base.filter((j) => (j.status === 'Aktif' || j.status === true || j.is_active) && !j.terhapus)
 } else if (activeKpiModal === 'struktur') {
 base = base.filter((j) => j.tampil_struktur && !j.terhapus)
 } else if (activeKpiModal === 'login') {
 base = base.filter((j) => j.boleh_login && !j.terhapus)
 }
 if (kpiModalSearch.trim()) {
 const q = kpiModalSearch.toLowerCase()
 base = base.filter(
 (j) =>
 (j.nama_jabatan || j.name || '').toLowerCase().includes(q) ||
 (j.kode_jabatan || '').toLowerCase().includes(q) ||
 (j.satuan_kerja || '').toLowerCase().includes(q)
 )
 }
 return base
 }, [activeKpiModal, allJabatanData, daftarJabatan, kpiModalSearch])

 // ── Chart Data Calculations ────────────────────────────────────────────
 const levelChartData = useMemo(() => {
 const counts = { 'L1 (Pengurus)': 0, 'L2 (Direksi)': 0, 'L3 (Manager)': 0, 'L4 (Kepsek/Kasi)': 0, 'L5 (Staf/Guru)': 0 }
 daftarJabatan.forEach((item) => {
 const lvl = Number(item.level_jabatan)
 if (lvl === 1) counts['L1 (Pengurus)'] += 1
 else if (lvl === 2) counts['L2 (Direksi)'] += 1
 else if (lvl === 3) counts['L3 (Manager)'] += 1
 else if (lvl === 4) counts['L4 (Kepsek/Kasi)'] += 1
 else counts['L5 (Staf/Guru)'] += 1
 })
 return Object.keys(counts).map((k) => ({ name: k, jumlah: counts[k] })).filter((d) => d.jumlah > 0)
 }, [daftarJabatan])

 const satuanKerjaChartData = useMemo(() => {
 const counts = {}
 daftarJabatan.forEach((item) => {
 const sk = item.satuan_kerja || 'Unit Pendidikan'
 counts[sk] = (counts[sk] || 0) + 1
 })
 const COLORS = ['#059669', '#0D9488', '#0D9488', '#10B981', '#14B8A6', '#34D399', '#F59E0B']
 return Object.keys(counts).map((k, i) => ({
 name: k,
 value: counts[k],
 color: COLORS[i % COLORS.length],
 }))
 }, [daftarJabatan])

 // ── Print & Export Handlers ────────────────────────────────────────────
 const handlePrintClean = () => {
 const orgName = (sitePengaturan?.school_name || sitePengaturan?.application_name || '').trim()
 printCleanTable({
 title: 'REKAPITULASI MASTER DATA JABATAN & POSISI PEGAWAI',
 subtitle: `${orgName ? orgName + ' · ' : ''}Total Terdaftar: ${totalCount} Jabatan`,
 headers: ['NO', 'KODE JABATAN', 'NAMA JABATAN', 'SATUAN KERJA', 'LEVEL', 'STRUKTUR', 'LOGIN', 'STATUS'],
 rows: daftarJabatan.map((item, index) => [
 index + 1,
 item.kode_jabatan || '-',
 item.nama_jabatan || item.name || '-',
 item.satuan_kerja || '-',
 `Level ${item.level_jabatan || '-'}`,
 item.tampil_struktur ? 'Ya' : 'Tidak',
 item.boleh_login ? 'Ya' : 'Tidak',
 item.terhapus ? 'Terhapus' : item.status === 'Aktif' || item.status === true ? 'Aktif' : 'Nonaktif',
 ]),
 foundationName: orgName,
 systemLogo: sitePengaturan?.logo_url,
 })
 }

 const handleDownloadPdfTable = () => {
 const orgName = (sitePengaturan?.school_name || sitePengaturan?.application_name || '').trim()
 downloadPdfTable({
 title: 'REKAPITULASI MASTER DATA JABATAN & POSISI PEGAWAI',
 filename: `rekap-master-jabatan-${new Date().toISOString().slice(0, 10)}.pdf`,
 subtitle: `${orgName ? orgName + ' · ' : ''}Total Terdaftar: ${totalCount} Jabatan`,
 headers: ['NO', 'KODE JABATAN', 'NAMA JABATAN', 'SATUAN KERJA', 'LEVEL', 'STRUKTUR', 'LOGIN', 'STATUS'],
 rows: daftarJabatan.map((item, index) => [
 index + 1,
 item.kode_jabatan || '-',
 item.nama_jabatan || item.name || '-',
 item.satuan_kerja || '-',
 `Level ${item.level_jabatan || '-'}`,
 item.tampil_struktur ? 'Ya' : 'Tidak',
 item.boleh_login ? 'Ya' : 'Tidak',
 item.terhapus ? 'Terhapus' : item.status === 'Aktif' || item.status === true ? 'Aktif' : 'Nonaktif',
 ]),
 foundationName: orgName,
 systemLogo: sitePengaturan?.logo_url,
 })
 }

 const handleProcessExport = async () => {
 setIsExporting(true)
 setShowExportModal(false)
 try {
 await downloadFileFromApi(
 '/jabatan/export',
 {
 search: debouncedSearch,
 unit_sekolah_id: selectedUnitFilter,
 satuan_kerja: selectedSatuanKerjaFilter,
 level_jabatan: selectedLevelFilter,
 status: selectedStatusFilter,
 },
 exportFormat,
 'data_master_jabatan'
 )
 pushToast('Export Berhasil', 'Berkas data jabatan sedang diunduh.', 'success')
 } catch {
 pushToast('Gagal Export', 'Terjadi kendala saat menyiapkan berkas ekspor.', 'error')
 } finally {
 setIsExporting(false)
 }
 }

 const tableIsLoading = isLoading || isFetching
 const filtersAreClear =
 !search &&
 !selectedUnitFilter &&
 !selectedSatuanKerjaFilter &&
 !selectedLevelFilter &&
 !selectedStatusFilter &&
 !denganSampahFilter

 const paginationInfo = {
 total: meta.total ?? daftarJabatan.length,
 from: meta.from ?? (daftarJabatan.length ? (page - 1) * perPage + 1 : 0),
 to: meta.to ?? ((page - 1) * perPage + daftarJabatan.length),
 last_page: meta.last_page ?? 1,
 current_page: meta.current_page ?? page,
 per_page: meta.per_page ?? perPage,
 }

 // ── Mutations (Zero SweetAlert2) ─────────────────────────────────────────
 const simpanMutation = useMutation({
 mutationFn: (payload) => jabatanService.tambah(payload),
 onSuccess: (res) => {
 queryClient.invalidateQueries({ queryKey: ['jabatan-list'] })
 queryClient.invalidateQueries({ queryKey: ['jabatan-options'] })
 queryClient.invalidateQueries({ queryKey: ['all-jabatan-for-kpi'] })
 setIsFormModalOpen(false)
 setShowSaveConfirmModal(false)
 setPendingSaveData(null)
 pushToast('Berhasil Disimpan', res?.message || 'Data jabatan baru berhasil ditambahkan.', 'success')
 },
 onError: (err) => {
 setShowSaveConfirmModal(false)
 pushToast('Gagal Menyimpan', err.response?.data?.message || 'Gagal menyimpan data jabatan.', 'error')
 },
 })

 const ubahMutation = useMutation({
 mutationFn: ({ id, payload }) => jabatanService.ubah({ id, payload }),
 onSuccess: (res) => {
 queryClient.invalidateQueries({ queryKey: ['jabatan-list'] })
 queryClient.invalidateQueries({ queryKey: ['jabatan-options'] })
 queryClient.invalidateQueries({ queryKey: ['all-jabatan-for-kpi'] })
 setIsFormModalOpen(false)
 setSelectedJabatanForEdit(null)
 setShowSaveConfirmModal(false)
 setPendingSaveData(null)
 pushToast('Berhasil Diperbarui', res?.message || 'Perubahan data jabatan berhasil disimpan.', 'success')
 },
 onError: (err) => {
 setShowSaveConfirmModal(false)
 pushToast('Gagal Memperbarui', err.response?.data?.message || 'Gagal memperbarui data jabatan.', 'error')
 },
 })

 const hapusMutation = useMutation({
 mutationFn: (id) => jabatanService.hapus(id),
 onSuccess: (res) => {
 queryClient.invalidateQueries({ queryKey: ['jabatan-list'] })
 queryClient.invalidateQueries({ queryKey: ['all-jabatan-for-kpi'] })
 setDeleteTarget(null)
 pushToast('Berhasil Dihapus', res?.message || 'Data jabatan berhasil dihapus.', 'success')
 },
 onError: (err) => {
 setDeleteTarget(null)
 pushToast('Gagal Menghapus', err.response?.data?.message || 'Terjadi kesalahan saat menghapus.', 'error')
 },
 })

 const pulihkanMutation = useMutation({
 mutationFn: (id) => jabatanService.pulihkan(id),
 onSuccess: (res) => {
 queryClient.invalidateQueries({ queryKey: ['jabatan-list'] })
 queryClient.invalidateQueries({ queryKey: ['all-jabatan-for-kpi'] })
 setRestoreTarget(null)
 pushToast('Berhasil Dipulihkan', res?.message || 'Data jabatan berhasil dipulihkan.', 'success')
 },
 onError: (err) => {
 setRestoreTarget(null)
 pushToast('Gagal Memulihkan', err.response?.data?.message || 'Terjadi kesalahan saat memulihkan.', 'error')
 },
 })

 const importMutation = useMutation({
 mutationFn: (param) => {
 if (param && (param.file || param.rows || param.overwrite !== undefined)) {
 const form = new FormData()
 if (param.file) form.append('file', param.file)
 if (param.rows) form.append('data', JSON.stringify(param.rows))
 form.append('overwrite', param.overwrite ? '1' : '0')
 return jabatanService.prosesImport(form)
 }
 return jabatanService.prosesImport(param)
 },
 onSuccess: (res, vars) => {
 queryClient.invalidateQueries({ queryKey: ['jabatan-list'] })
 queryClient.invalidateQueries({ queryKey: ['jabatan-options'] })
 queryClient.invalidateQueries({ queryKey: ['all-jabatan-for-kpi'] })
 const resData = res?.data || {}
 const duplikatCount = resData.duplikat || 0
 const diperbaruiCount = resData.diperbarui || 0
 const berhasilCount = resData.berhasil || 0
 const totalCount = resData.total || 0
 const overwrite = vars?.overwrite || false

 if (duplikatCount > 0 || (diperbaruiCount > 0 && overwrite)) {
 const titleMsg = overwrite ? 'Impor Selesai (Data Ditimpa)' : 'Pemberitahuan Data Duplikat'
 const detailMsg = overwrite
 ? `${berhasilCount} baru, ${diperbaruiCount} berhasil ditimpa dari total ${totalCount} data.`
 : `${berhasilCount} berhasil, ${duplikatCount} data dilewati karena sudah ada.`
 pushToast(titleMsg, detailMsg, overwrite ? 'info' : 'warning')
 } else {
 pushToast('Import Data Berhasil', res?.message || `${berhasilCount} data jabatan berhasil diimpor.`, 'success')
 }

 if (Array.isArray(resData.duplicates) && resData.duplicates.length > 0) {
 setDuplicateModalData(resData)
 }
 setIsImportModalOpen(false)
 },
 onError: (err) => {
 pushToast('Gagal Mengimpor', err.response?.data?.message || 'Format data impor bermasalah.', 'error')
 },
 })

 const batchDeleteMutation = useMutation({
 mutationFn: (ids) => jabatanService.hapusBanyak(ids),
 onSuccess: (res) => {
 queryClient.invalidateQueries({ queryKey: ['jabatan-list'] })
 queryClient.invalidateQueries({ queryKey: ['jabatan-options'] })
 queryClient.invalidateQueries({ queryKey: ['all-jabatan-for-kpi'] })
 setSelectedJabatanIds([])
 setShowBatchDeleteModal(false)
 pushToast('Hapus Massal Berhasil', res?.message || 'Data jabatan terpilih berhasil dihapus.', 'success')
 },
 onError: (err) => {
 setShowBatchDeleteModal(false)
 pushToast('Gagal Menghapus', err.response?.data?.message || 'Terjadi kesalahan saat menghapus data massal.', 'error')
 },
 })

 const isRowSelectableForBatchDelete = (row) => {
 if (!row || row.terhapus) return false
 if (!canManageGlobalPositions) return false
 return !isRowRestrictedForUser(row)
 }

 const selectedJabatanObjects = useMemo(() => {
 return daftarJabatan.filter((item) => selectedJabatanIds.includes(item.id))
 }, [daftarJabatan, selectedJabatanIds])

 const bulkActions = canManageGlobalPositions ? (
 <div className="flex items-center gap-2">
					<AppButton variant="danger" size="xs" icon={Trash2} onClick={() => setShowBatchDeleteModal(true)}>Hapus ({selectedJabatanIds.length}) Jabatan</AppButton>
					<AppButton variant="ghost" size="xs" icon={X} onClick={() => setSelectedJabatanIds([])}>Batal</AppButton>
 </div>
 ) : null

 // ── Handlers ──────────────────────────────────────────────────────────────
 const handleOpenCreate = () => {
 if (!canManageGlobalPositions) return
 setSelectedJabatanForEdit(null)
 setIsFormModalOpen(true)
 }

 const handleOpenEdit = (item) => {
 if (!canManageGlobalPositions || isRowRestrictedForUser(item)) {
 pushToast('Akses Dibatasi', 'Anda tidak diizinkan untuk mengubah data jabatan ini.', 'error')
 return
 }
 setSelectedJabatanForEdit(item)
 setIsFormModalOpen(true)
 }

 const handleOpenDetail = (item) => {
 setSelectedJabatanForDetail(item)
 setIsDetailModalOpen(true)
 }

 const handleDelete = (item) => {
 if (!canManageGlobalPositions || isRowRestrictedForUser(item)) {
 pushToast('Akses Dibatasi', 'Anda tidak diizinkan untuk menghapus data jabatan ini.', 'error')
 return
 }
 setDeleteTarget(item)
 }

 const handleRestore = (item) => {
 if (!canManageGlobalPositions || isRowRestrictedForUser(item)) return
 setRestoreTarget(item)
 }

 const handleFormSubmit = (data) => {
 setPendingSaveData(data)
 setShowSaveConfirmModal(true)
 }

 const handleConfirmSaveForm = () => {
 if (!pendingSaveData) return
 if (selectedJabatanForEdit) {
 ubahMutation.mutate({ id: selectedJabatanForEdit.id, payload: pendingSaveData })
 } else {
 simpanMutation.mutate(pendingSaveData)
 }
 }

 const handleResetFilters = () => {
 setSearch('')
 setSelectedUnitFilter('')
 setSelectedSatuanKerjaFilter('')
 setSelectedLevelFilter('')
 setSelectedStatusFilter('')
 setDenganSampahFilter('')
 setPage(1)
 }

 // Column Specification following HEROUI_TABLE_COMPONENT Gold Standard Benchmark
  // Column Specification (Canonical 5-Column Benchmark: 4 Content + 1 Aksi Tanpa Label)
  const columns = [
    {
      key: 'nama_jabatan',
      label: 'Identitas Jabatan',
      className: 'w-[32%]',
      render: (row) => {
        const isTrashed = row.terhapus
        return (
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
              <FaSitemap className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <HoverCard>
                <HoverCardTrigger
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleOpenDetail(row)
                  }}
                  className="inline-block max-w-full truncate text-xs font-bold leading-5 text-slate-900 dark:text-white border-b border-dashed border-emerald-200/80 hover:border-[#059669] transition-colors cursor-pointer"
                  title={row.nama_jabatan || row.name}
                >
                  {row.nama_jabatan || row.name}
                </HoverCardTrigger>
                <HoverCardContent className="w-64 p-3.5 border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:border-emerald-800/60 dark:bg-card-dark shadow-xl rounded-xl">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                      <FaSitemap className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white ">{row.nama_jabatan || row.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">{row.kode_jabatan || row.code}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    <p><strong className="text-slate-400 font-normal">Level:</strong> Level {row.level_jabatan} ({row.level_label || '-'})</p>
                    <p><strong className="text-slate-400 font-normal">Satuan Kerja:</strong> {row.satuan_kerja || '-'}</p>
                    <p><strong className="text-slate-400 font-normal">Atasan:</strong> {row.atasan_langsung?.nama_jabatan || 'Pimpinan Tertinggi'}</p>
                    <p><strong className="text-slate-400 font-normal">Jumlah Pegawai:</strong> {row.jumlah_pegawai ?? 0} pegawai</p>
                  </div>
                  <AppButton variant="primary" size="xs" className="w-full mt-2.5" onClick={() => handleOpenDetail(row)}>Lihat Rincian Data</AppButton>
                </HoverCardContent>
              </HoverCard>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-[10px] text-slate-400">{row.kode_jabatan || row.code}</span>
                {isTrashed && (
                  <span className="rounded bg-rose-100 px-1 py-0.2 text-[9px] font-bold text-rose-700">Terhapus</span>
                )}
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                  • {row.jumlah_pegawai ?? 0} pegawai
                </span>
              </div>
            </span>
          </div>
        )
      },
    },
    {
      key: 'level_jabatan',
      label: 'Unit & Level',
      className: 'w-[26%]',
      render: (row) => (
        <div className="space-y-1">
          <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60">
            Level {row.level_jabatan}: {row.level_label}
          </span>
          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400 truncate">{row.satuan_kerja || 'Belum ditentukan'}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {row.unit_sekolah ? (
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {row.unit_sekolah.nama} ({row.unit_sekolah.kode})
              </span>
            ) : (
              <span className="italic text-slate-400">{row.scope_akses_label || 'Cakupan belum ditentukan'}</span>
            )}
          </p>
        </div>
      ),
    },
    {
      key: 'atasan_langsung',
      label: 'Atasan Langsung',
      className: 'w-[22%]',
      render: (row) =>
        row.atasan_langsung ? (
          <div className="font-medium text-slate-800 dark:text-slate-200 text-xs">
            {row.atasan_langsung.nama_jabatan}
            <span className="block text-[10px] text-slate-400 font-mono">({row.atasan_langsung.kode_jabatan})</span>
          </div>
        ) : (
          <span className="text-slate-400 italic text-xs">Pimpinan Tertinggi</span>
        ),
    },
    {
      key: 'status',
      label: 'Akses & Status',
      className: 'w-[14%] text-center',
      render: (row) => (
        <div className="flex flex-col items-center gap-1.5">
          {row.terhapus ? (
            <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
              Terhapus
            </span>
          ) : (
            <MasterStatusBadge active={row.status === 'Aktif' || row.is_active} inactiveLabel="Nonaktif" />
          )}
          <span
            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold border ${
              row.boleh_login
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                : 'border-emerald-200/80 bg-slate-100 text-slate-500 dark:border-emerald-800/60 dark:bg-sky-950/60 dark:text-sky-300'
            }`}
          >
            {row.boleh_login ? <FaLockOpen className="h-2.5 w-2.5 shrink-0" /> : <FaLock className="h-2.5 w-2.5 shrink-0" />}
            <span>{row.boleh_login ? 'Bisa Login' : 'Non-Login'}</span>
          </span>
        </div>
      ),
    },
  ]
 // Extra action for restoring soft deleted rows
 const extraActions = ({ row }) => {
 if (row.terhapus) {
 return (
 <IconButton icon={RotateCcw} tooltip="Pulihkan Data Jabatan" variant="restore" onClick={(e) => { e.stopPropagation(); handleRestore(row); }} />
 )
 }
 return null
 }

 // Mobile card view fallback
 const renderMobileCard = ({ row, selected, onToggleSelect, onView, onEdit, onDelete }) => {
 const isRestricted = isRowRestrictedForUser(row)
 const canSelect = isRowSelectableForBatchDelete(row)
 return (
 <div className={`rounded-xl border bg-white p-4 shadow-2xs dark:bg-card-dark ${selected ? 'ring-2 ring-emerald-500 bg-emerald-50/20' : ''} ${row.terhapus ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/20' : 'border-emerald-200/80 dark:border-emerald-800/60'}`}>
 <div className="flex items-start gap-3">
 {canSelect && onToggleSelect && (
 <div className="pt-2">
 <Checkbox
 size="sm"
 checked={selected}
 onChange={onToggleSelect}
 />
 </div>
 )}
 <span className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
 <FaSitemap className="h-5 w-5" />
 </span>
 <div className="min-w-0 flex-1">
 <div className="flex items-start justify-between gap-2">
 <div>
 <p className="text-sm font-extrabold text-slate-900 dark:text-white">{row.nama_jabatan || row.name}</p>
 <p className="font-mono text-[10px] text-slate-400">{row.kode_jabatan || row.code}</p>
 </div>
 {row.terhapus ? (
 <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">Terhapus</span>
 ) : isRestricted ? (
 <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">Dibatasi</span>
 ) : (
 <MasterStatusBadge active={row.status === 'Aktif' || row.is_active} inactiveLabel="Nonaktif" />
 )}
 </div>
 <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
 <span>Level {row.level_jabatan}</span>
 <span>{row.satuan_kerja || 'Satuan Kerja -'}</span>
 <span className="font-bold text-emerald-700">{row.jumlah_pegawai ?? 0} pegawai</span>
 </div>
 </div>
 </div>
 <div className="mt-3 flex items-center justify-end gap-2 border-t border-emerald-200/80 pt-2.5 dark:border-emerald-800/60">
 {row.terhapus && (
 <AppButton variant="outline" size="xs" icon={RotateCcw} onClick={() => handleRestore(row)}>Pulihkan</AppButton>
 )}
 <ActionDropdown
 onView={onView}
 onEdit={canEditPosition && !row.terhapus && !isRestricted ? onEdit : undefined}
 onDelete={canEditPosition && !row.terhapus && !isRestricted ? onDelete : undefined}
 />
 </div>
 </div>
 )
 }

 return (
 <PageContainer maxW="7xl">
 <motion.div
 initial="hidden"
 animate="visible"
 variants={containerVariants}
 className="space-y-6 pb-12"
 >
 {/* AppBreadcrumb */}
 <motion.div variants={itemVariants}>
 <AppBreadcrumb items={[{ label: 'Master Data', to: '/dashboard/master-jabatan' }, { label: 'Master Jabatan' }]} />
 </motion.div>

 {/* Header Halaman Modern Hero Card */}
  <HeroUiHeader
    title="Master Posisi & Jabatan SDM"
    subtitle="Struktur jabatan struktural & fungsional pegawai, hierarki kedudukan, hak akses sistem, dan distribusi SDM di seluruh unit."
    icon={FaBriefcase}
    roleTag="Manajemen Jabatan"
    badge="Struktur Jabatan"
  />

 {/* Modern KPI Summary Cards */}
 <motion.div variants={itemVariants}>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <ModernKpiCard
 icon={FaBriefcase}
 label="Total Jabatan"
 value={isLoading ? '...' : Number(totalCount).toLocaleString('id-ID')}
 tag={`${totalCount} Posisi`}
 subtext="Terdaftar di sistem"
 tone="emerald"
 onClick={() => { setKpiModalSearch(''); setActiveKpiModal('total') }}
 />
 <ModernKpiCard
 icon={FaCheckCircle}
 label="Jabatan Aktif"
 value={isLoading ? '...' : Number(activeCount).toLocaleString('id-ID')}
 tag={`${activeCount} Aktif`}
 subtext="Beroperasi saat ini"
 tone="teal"
 onClick={() => { setKpiModalSearch(''); setActiveKpiModal('aktif') }}
 />
 <ModernKpiCard
 icon={FaSitemap}
 label="Bagan Struktur"
 value={isLoading ? '...' : Number(sitemapCount).toLocaleString('id-ID')}
 tag={`${sitemapCount} Tampil`}
 subtext="Tampil di organisasi"
 tone="amber"
 onClick={() => { setKpiModalSearch(''); setActiveKpiModal('struktur') }}
 />
 <ModernKpiCard
 icon={FaLockOpen}
 label="Akses Login"
 value={isLoading ? '...' : Number(loginCount).toLocaleString('id-ID')}
 tag={`${loginCount} Login`}
 subtext="Dapat memakai sistem"
 tone="sky"
 onClick={() => { setKpiModalSearch(''); setActiveKpiModal('login') }}
 />
 </div>
 </motion.div>

 {/* Visual Analytics Charts Section */}
 <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
 {/* Grafik 1: Distribusi Level Jabatan */}
 <article className="overflow-hidden rounded-2xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 sm:p-6 shadow-xs dark:bg-card-dark flex flex-col justify-between h-full">
 <div>
 <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <div className="flex items-center gap-2">
 <BarChart2 className="size-5 text-emerald-600 dark:text-emerald-400" />
 <div>
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
 Distribusi Level Jabatan
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Hirarki dan tingkatan posisi dalam struktur organisasi
 </p>
 </div>
 </div>
 <AppBadge variant="success" size="sm">
 {levelChartData.length} Level
 </AppBadge>
 </div>
 <div className="h-64 w-full pt-2">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={levelChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
 <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} stroke="#94A3B8" />
 <YAxis tick={{ fontSize: 11, fontWeight: 700 }} stroke="#94A3B8" />
 <Tooltip
 content={({ active, payload }) => {
 if (active && payload && payload.length) {
 const data = payload[0].payload
 return (
 <div className="rounded-xl border border-emerald-200/80 bg-slate-900/95 p-3 text-white shadow-xl backdrop-blur-sm">
 <p className="text-xs font-bold text-emerald-400 mb-0.5">{data.name}</p>
 <p className="text-xs font-extrabold">Total Jabatan: {data.jumlah}</p>
 </div>
 )
 }
 return null
 }}
 />
 <Bar dataKey="jumlah" name="Jumlah Jabatan" fill="#10B981" radius={[6, 6, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-between text-xs font-semibold text-slate-500">
 <span>Struktur Organisasi Terpadu</span>
 <span className="text-emerald-600 dark:text-emerald-400 font-bold">Resmi</span>
 </div>
 </article>

 {/* Grafik 2: Komposisi Satuan Kerja */}
 <article className="overflow-hidden rounded-2xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 sm:p-6 shadow-xs dark:bg-card-dark flex flex-col justify-between h-full">
 <div>
 <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <div className="flex items-center gap-2">
 <PieIcon className="size-5 text-[#0284C7] dark:text-sky-400" />
 <div>
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
 Komposisi Satuan Kerja
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Penyebaran posisi jabatan per divisi/satuan kerja
 </p>
 </div>
 </div>
 <AppBadge variant="info" size="sm">
 100% Terstruktur
 </AppBadge>
 </div>
 <div className="h-64 w-full flex items-center justify-center">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={satuanKerjaChartData}
 cx="50%"
 cy="50%"
 innerRadius={55}
 outerRadius={85}
 paddingAngle={3}
 dataKey="value"
 >
 {satuanKerjaChartData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
 </Pie>
 <Tooltip
 content={({ active, payload }) => {
 if (active && payload && payload.length) {
 const data = payload[0].payload
 return (
 <div className="rounded-xl border border-emerald-200/80 bg-slate-900/95 p-3 text-white shadow-xl backdrop-blur-sm">
 <p className="text-xs font-bold text-sky-400 mb-0.5">{data.name}</p>
 <p className="text-xs font-extrabold">Total Jabatan: {data.value}</p>
 </div>
 )
 }
 return null
 }}
 />
 <Legend
 formatter={(value, entry) => (
 <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
 {entry.payload.name} ({entry.payload.value})
 </span>
 )}
 />
 </PieChart>
 </ResponsiveContainer>
 </div>
 </div>
 <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-between text-xs font-semibold text-slate-500">
 <span>Alokasi Satuan Kerja</span>
 <span className="text-[#0284C7] dark:text-sky-400 font-bold">Terdaftar</span>
 </div>
 </article>
 </motion.div>

 {/* ── Canonical Emerald Datatable Container ─────────────────────────── */}
 <motion.div variants={itemVariants} id="tabel-master-jabatan" className="scroll-mt-6">
 <AppDataTable
 title="Data Jabatan"
 description="Daftar jabatan sesuai pencarian, cakupan unit, dan filter yang dipilih."
 icon={FaSitemap}
 iconClassName="bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 border-2 border-emerald-300 dark:border-emerald-800 shadow-sm"
 countLabel={`${Number(paginationInfo?.total || daftarJabatan.length).toLocaleString('id-ID')} Jabatan`}
 actions={
 <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
						<IconButton icon={Printer} tooltip="Cetak & Export Data Jabatan" variant="print" onClick={() => setPrintOptionModalOpen(true)} />
						{canEditPosition && (
							<IconButton icon={Upload1} tooltip="Import Data Jabatan (.csv, .xlsx)" variant="import" onClick={() => setIsImportModalOpen(true)} />
						)}
						{canEditPosition && (
							<IconButton icon={Download1} tooltip="Export Data Jabatan (.xlsx, .csv)" variant="export" onClick={() => setShowExportModal(true)} />
						)}

 {/* Tambah Jabatan Button (Vivid Emerald Squircle + Floating Tooltip) */}
 {canManageGlobalPositions && (
 <IconButton icon={Plus} tooltip="Tambah Jabatan Baru" variant="primary" onClick={handleOpenCreate} />
 )}
 </div>
 }
 columns={columns}
 data={daftarJabatan}
 keyField="id"
 isLoading={tableIsLoading}
 isError={isError}
 errorTitle="Data jabatan gagal dimuat"
 errorMessage="Periksa koneksi atau coba muat ulang data."
 onRetry={refetch}
 serverControlled
 search={search}
 onSearchChange={(val) => { setSearch(val); setPage(1) }}
 searchPlaceholder="Cari nama atau kode jabatan..."
 filters={
 <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-2.5 w-full">
 {/* Satuan Kerja filter */}
 <HeroUiFilterSelect
 value={selectedSatuanKerjaFilter}
 onChange={(val) => { setSelectedSatuanKerjaFilter(val); setPage(1) }}
 options={[
 { value: '', label: 'Semua Satuan Kerja' },
 ...(options.satuan_kerja || []).map((item) => {
 const val = typeof item === 'object' ? (item.value ?? item.id ?? item.nama) : item
 const lbl = typeof item === 'object' ? (item.label ?? item.nama ?? item.value) : item
 return { value: String(val), label: String(lbl) }
 }),
 ]}
 placeholder="Semua Satuan Kerja"
 icon={FaSitemap}
 ariaLabel="Filter satuan kerja"
 size="sm"
 className="w-full sm:w-auto min-w-[150px]"
 />

 {/* Level Jabatan filter */}
 <HeroUiFilterSelect
 value={selectedLevelFilter}
 onChange={(val) => { setSelectedLevelFilter(val); setPage(1) }}
 options={[
 { value: '', label: 'Semua Level' },
 ...(options.level_jabatan || []).map((level) => {
 const val = typeof level === 'object' ? (level.value ?? level.id ?? level.level) : level
 const lbl = typeof level === 'object' ? (level.label ?? level.nama ?? `Level ${level}`) : `Level ${level}`
 return { value: String(val), label: String(lbl) }
 }),
 ]}
 placeholder="Semua Level"
 icon={ShieldCheck}
 ariaLabel="Filter level jabatan"
 size="sm"
 className="w-full sm:w-auto min-w-[140px]"
 />

 {/* Unit Sekolah filter */}
 <HeroUiFilterSelect
 value={selectedUnitFilter}
 onChange={(val) => { setSelectedUnitFilter(val); setPage(1) }}
 options={[
 { value: '', label: 'Semua Unit Sekolah' },
 ...(options.unit_sekolah || []).map((unit) => {
 const val = typeof unit === 'object' ? (unit.id ?? unit.value) : unit
 const lbl = typeof unit === 'object' ? (unit.nama ?? unit.name ?? unit.label) : unit
 return { value: String(val), label: String(lbl) }
 }),
 ]}
 placeholder="Semua Unit Sekolah"
 icon={FaBriefcase}
 ariaLabel="Filter unit sekolah"
 size="sm"
 searchable
 className="w-full sm:w-auto min-w-[160px]"
 />

 {/* Status filter */}
 <HeroUiFilterSelect
 value={selectedStatusFilter}
 onChange={(val) => { setSelectedStatusFilter(val); setPage(1) }}
 options={[
 { value: '', label: 'Semua Status' },
 { value: 'Aktif', label: 'Aktif' },
 { value: 'Nonaktif', label: 'Nonaktif' },
 ]}
 placeholder="Semua Status"
 icon={CheckCircle2}
 ariaLabel="Filter status jabatan"
 size="sm"
 className="w-full sm:w-auto min-w-[130px]"
 />

 {/* Cakupan Terhapus filter */}
 <HeroUiFilterSelect
 value={denganSampahFilter}
 onChange={(val) => { setDenganSampahFilter(val); setPage(1) }}
 options={[
 { value: '', label: 'Data Aktif' },
 { value: 'ya', label: 'Termasuk Terhapus' },
 ]}
 placeholder="Data Aktif"
 icon={Trash2}
 ariaLabel="Filter data terhapus"
 size="sm"
 className="w-full sm:w-auto min-w-[140px]"
 />

 {/* Per Page filter */}
 <HeroUiFilterSelect
 value={perPage}
 onChange={(val) => { setPerPage(Number(val)); setPage(1) }}
 options={[
 { value: '5', label: '5 per halaman' },
 { value: '10', label: '10 per halaman' },
 { value: '15', label: '15 per halaman' },
 { value: '25', label: '25 per halaman' },
 { value: '50', label: '50 per halaman' },
 { value: '100', label: '100 per halaman' },
 ]}
 placeholder="10 per halaman"
 ariaLabel="Tampilkan per halaman"
 size="sm"
 className="w-full sm:w-auto min-w-[125px]"
 />

 {/* Reset button */}
 {!filtersAreClear && (
 <Button
 variant="ghost"
 appearance="outline"
 size="xs"
 onClick={handleResetFilters}
 className="w-full sm:w-auto sm:ml-auto justify-center h-9 px-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-1.5 cursor-pointer"
 >
 <RefreshCcw className="size-3.5" />
 <span>Reset</span>
 </Button>
 )}
 </div>
 }
 actionColumnLabel=""
 onView={(row) => handleOpenDetail(row)}
 canEdit={(row) => canManageGlobalPositions && !row.terhapus && !isRowRestrictedForUser(row)}
 canDelete={(row) => canManageGlobalPositions && !row.terhapus && !isRowRestrictedForUser(row)}
 onEdit={canManageGlobalPositions ? (row) => handleOpenEdit(row) : undefined}
 onDelete={canManageGlobalPositions ? (row) => handleDelete(row) : undefined}
 extraActions={extraActions}
 renderMobileCard={renderMobileCard}
 showPagination
 page={paginationInfo.current_page}
 totalPages={paginationInfo.last_page}
 totalItems={paginationInfo.total}
 itemsPerPage={paginationInfo.per_page}
 onPageChange={(p) => setPage(p)}
 meta={paginationInfo}
 emptyTitle="Jabatan tidak ditemukan"
 emptyDescription="Coba sesuaikan kata kunci pencarian atau filter yang diterapkan."
 hasActiveFilters={!filtersAreClear}
 onResetFilters={handleResetFilters}
 />
 </motion.div>
 </motion.div>

 {/* ── Modals ─────────────────────────────────────────────────────────── */}
 <JabatanFormModal
 isOpen={isFormModalOpen}
 onClose={() => {
 setIsFormModalOpen(false)
 setSelectedJabatanForEdit(null)
 }}
 onSubmit={handleFormSubmit}
 initialData={selectedJabatanForEdit}
 options={options}
 isSubmitting={simpanMutation.isPending || ubahMutation.isPending}
 isKepalaSekolah={isKepalaSekolah || canManageUnitPositions}
 isUnitScopedManager={canManageUnitPositions && !canManageGlobalPositions}
 />

 <JabatanDetailModal
 isOpen={isDetailModalOpen}
 onClose={() => {
 setIsDetailModalOpen(false)
 setSelectedJabatanForDetail(null)
 }}
 jabatan={selectedJabatanForDetail}
 onEdit={() => {
 setIsDetailModalOpen(false)
 if (selectedJabatanForDetail) handleOpenEdit(selectedJabatanForDetail)
 }}
 />

 <JabatanImportModal
 isOpen={isImportModalOpen}
 onClose={() => setIsImportModalOpen(false)}
 onImport={(param) => importMutation.mutate(param)}
 isSubmitting={importMutation.isPending}
 />

 {/* ── MODAL HASIL IMPOR & PEMBERITAHUAN DATA DUPLIKAT ── */}
 <AnimatePresence>
 {duplicateModalData && (
 <div
 className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md"
 role="dialog"
 aria-modal="true"
 aria-labelledby="jabatan-duplicate-report-title"
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="my-auto w-full max-w-2xl font-sans"
 >
 <div className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-2xl shadow-emerald-950/20 dark:bg-[#182232] shadow-sm dark:border-emerald-800/60 dark:bg-[#182232] dark:shadow-black/60">
 {/* Top Accent Gradient Bar */}
 <div className={cn(
 "h-1.5 w-full shrink-0",
 duplicateModalData.diperbarui > 0
 ? "bg-white dark:bg-card-dark"
 : duplicateModalData.duplikat > 0
 ? "bg-white dark:bg-card-dark"
 : "bg-white dark:bg-card-dark"
 )} />

 {/* Header */}
 <div className="flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-[#182232]">
 <div className="flex items-center gap-3">
 <div className={cn(
 "rounded-xl p-2.5 text-white shadow-md shrink-0 border",
 duplicateModalData.diperbarui > 0
 ? "bg-white dark:bg-card-dark border-emerald-200/80 dark:border-emerald-800/60 shadow-sm"
 : "bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 shadow-sm"
 )}>
 {duplicateModalData.diperbarui > 0 ? (
 <RefreshCcw className="h-5 w-5 text-slate-600" strokeWidth={2.25} />
 ) : (
 <CheckCircle2 className="h-5 w-5 text-amber-600" strokeWidth={2.25} />
 )}
 </div>
 <div>
 <h3 id="jabatan-duplicate-report-title" className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>Hasil Impor & Pemberitahuan Data</span>
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
 Total {duplicateModalData.total} Data
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Ringkasan sinkronisasi dan status pemrosesan data jabatan
 </p>
 </div>
 </div>
 <IconButton icon={X} variant="ghost" size="sm" onClick={() => setDuplicateModalData(null)} />
 </div>

 {/* Body */}
 <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6 text-sm text-slate-700 dark:text-slate-200">
 {/* KPI Cards */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
 <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 p-3 text-center dark:border-emerald-800/60 dark:bg-emerald-950/30">
 <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Baru</p>
 <p className="text-lg font-black text-emerald-700 dark:text-emerald-300 mt-0.5">{duplicateModalData.berhasil || 0}</p>
 </div>
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/50 p-3 text-center dark:border-emerald-800/60 dark:bg-amber-950/30">
 <p className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Ditimpa</p>
 <p className="text-lg font-black text-amber-700 dark:text-amber-300 mt-0.5">{duplicateModalData.diperbarui || 0}</p>
 </div>
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50/50 p-3 text-center dark:border-emerald-800/60 dark:bg-sky-950/30">
 <p className="text-[10px] font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider">Dilewati</p>
 <p className="text-lg font-black text-sky-700 dark:text-sky-300 mt-0.5">{duplicateModalData.duplikat || 0}</p>
 </div>
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/50 p-3 text-center dark:border-emerald-800/60 dark:bg-rose-950/30">
 <p className="text-[10px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">Gagal</p>
 <p className="text-lg font-black text-rose-700 dark:text-rose-300 mt-0.5">{duplicateModalData.gagal || 0}</p>
 </div>
 </div>

 {/* Duplicate / Updated Rows List */}
 {Array.isArray(duplicateModalData.duplicates) && duplicateModalData.duplicates.length > 0 && (
 <div className="space-y-2">
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
 <span>Rincian Data Yang Sesuai / Terdeteksi Duplikat</span>
 <span className="text-xs text-slate-500 font-normal">
 {duplicateModalData.duplicates.length} item
 </span>
 </p>
 <div className="max-h-56 overflow-auto rounded-xl border border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-slate-900/60">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-100 font-bold text-xs uppercase tracking-wider">
 <tr>
 <th className="px-3.5 py-2.5">Baris</th>
 <th className="px-3.5 py-2.5">Kode Jabatan</th>
 <th className="px-3.5 py-2.5">Nama Jabatan</th>
 <th className="px-3.5 py-2.5">Status</th>
 <th className="px-3.5 py-2.5">Keterangan</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-slate-800 text-xs">
 {duplicateModalData.duplicates.map((dup, idx) => (
 <tr key={idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30">
 <td className="px-3.5 py-2 font-mono text-slate-500">#{dup.baris || idx + 1}</td>
 <td className="px-3.5 py-2 font-mono font-semibold text-slate-900 dark:text-white">{dup.kode || '-'}</td>
 <td className="px-3.5 py-2 font-medium text-slate-700 dark:text-slate-200">{dup.nama || '-'}</td>
 <td className="px-3.5 py-2">
 <span className={cn(
 "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
 dup.status === 'Ditimpa'
 ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
 : "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300"
 )}>
 {dup.status}
 </span>
 </td>
 <td className="px-3.5 py-2 text-slate-500 dark:text-slate-400">{dup.keterangan || '-'}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}
 </div>

 {/* Footer */}
 <div className="flex items-center justify-end border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:border-emerald-800/60 dark:bg-emerald-950/20 px-6 py-3.5 dark:border-emerald-800/60 dark:bg-slate-900/30">
 <AppButton variant="primary" size="md" icon={CheckCircle2} onClick={() => setDuplicateModalData(null)}>Mengerti</AppButton>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* Print Option Modal */}
 <PrintOptionModal
 isOpen={printOptionModalOpen}
 onClose={() => setPrintOptionModalOpen(false)}
 onPrint={handlePrintClean}
 onDownload={handleDownloadPdfTable}
 title="Master Data Jabatan & Posisi Pegawai"
 />

 {/* ══════════════════════════════════════════════════════════════════
 KPI CARDS DRILL-DOWN MODAL — Interactive Analytics Breakdown
 ══════════════════════════════════════════════════════════════════ */}
 <AnimatePresence>
 {activeKpiModal && (
 <div
 role="dialog"
 tabIndex={-1}
 aria-modal="true"
 className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
 onMouseDown={(e) => { if (e.target === e.currentTarget) setActiveKpiModal(null) }}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="modal-dialog font-sans my-auto w-full max-w-4xl"
 >
 <div className="modal-content flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white shadow-2xl dark:border-emerald-800/60 dark:bg-slate-950">
 <div className="modal-header flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-[#182232]">
 <div className="flex items-center gap-3">
 <div className="rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 p-2.5 shadow-md shadow-xs shrink-0">
 {activeKpiModal === 'total' && <FaBriefcase className="h-5 w-5" />}
 {activeKpiModal === 'aktif' && <FaCheckCircle className="h-5 w-5" />}
 {activeKpiModal === 'struktur' && <FaSitemap className="h-5 w-5" />}
 {activeKpiModal === 'login' && <FaLockOpen className="h-5 w-5" />}
 </div>
 <div>
 <h3 className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>
 {activeKpiModal === 'total' && 'Analisis Total Jabatan Terdaftar'}
 {activeKpiModal === 'aktif' && 'Rincian Jabatan Berstatus Aktif'}
 {activeKpiModal === 'struktur' && 'Rincian Jabatan Tampil di Bagan Struktur Organisasi'}
 {activeKpiModal === 'login' && 'Rincian Jabatan Berhak Akses Login Sistem'}
 </span>
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#059669] border-2 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
 <Sparkles className="size-3" /> Drill-down
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Menampilkan {filteredKpiItems.length} data posisi jabatan terfilter
 </p>
 </div>
 </div>
 <IconButton icon={X} variant="ghost" size="sm" onClick={() => setActiveKpiModal(null)} />
 </div>

 <div className="flex items-center gap-3 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/60 px-6 py-3 dark:border-emerald-800/60 dark:bg-slate-900/40">
 <div className="relative flex-1">
 <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <AppInput
                    type="text"
                    value={kpiModalSearch}
                    onChange={(e) => setKpiModalSearch(e.target.value)}
                    placeholder="Cari kode, nama jabatan, atau satuan kerja..."
                    className="h-9 w-full pl-10 pr-4"
                  />
 </div>
 <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#059669] border-2 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
 {filteredKpiItems.length} Jabatan
 </span>
 </div>

 <div className="modal-body flex-1 overflow-y-auto p-6">
 {filteredKpiItems.length === 0 ? (
 <div className="py-12 text-center">
 <p className="text-sm font-bold text-slate-500">Tidak ada data jabatan yang cocok dengan kriteria ini.</p>
 </div>
 ) : (
                  <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200 font-extrabold uppercase tracking-wider text-xs">
                        <tr>
                          <th className="px-4 py-3">IDENTITAS JABATAN & KODE</th>
                          <th className="px-4 py-3">SATUAN KERJA & UNIT</th>
                          <th className="px-4 py-3 text-center">STRUKTUR & AKSES</th>
                          <th className="px-4 py-3 text-center">STATUS</th>
                          <th className="px-4 py-3 text-right w-16 sm:w-20 select-none"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 font-medium text-slate-700 dark:text-slate-300">
                        {filteredKpiItems.map((item, idx) => (
                          <tr key={item.id || item.uuid || idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
                            <td className="px-4 py-3">
                              <span className="block font-bold text-slate-900 dark:text-white">{item.nama_jabatan || item.name}</span>
                              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">{item.kode_jabatan || '-'} · Level {item.level_jabatan}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="space-y-0.5">
                                <span className="inline-flex rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold dark:bg-slate-800">
                                  {item.satuan_kerja || '-'}
                                </span>
                                <p className="text-[10px] text-slate-500">{item.unit_sekolah?.nama || item.unit_sekolah?.name || 'Semua Unit'}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="inline-flex items-center gap-2 justify-center">
                                {item.tampil_struktur ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[10px]"><FaSitemap className="size-3" /> Bagan</span>
                                ) : (
                                  <span className="text-slate-400 text-[10px]">-</span>
                                )}
                                {item.boleh_login ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[10px]"><FaLockOpen className="size-3" /> Login</span>
                                ) : (
                                  <span className="text-slate-400 text-[10px]">Non-login</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <MasterStatusBadge active={item.status === 'Aktif' || item.status === true} inactiveLabel="Nonaktif" />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button
                                variant="ghost"
                                appearance="outline"
                                size="xs"
                                onClick={() => {
                                  setActiveKpiModal(null)
                                  handleOpenDetail(item)
                                }}
                                className="h-7 px-2.5 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg font-bold cursor-pointer"
                              >
                                <Eye className="size-3.5" />
                                <span>Rincian</span>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
 )}
 </div>

 <div className="modal-footer flex items-center justify-between border-t border-emerald-200/80 bg-white px-6 py-4 dark:border-emerald-800/60 dark:bg-slate-950">
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
 Menampilkan total {filteredKpiItems.length} baris
 </span>
 <AppButton variant="outline" size="sm" icon={X} onClick={() => setActiveKpiModal(null)}>Tutup</AppButton>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* ══════════════════════════════════════════════════════════════════
 HARMONIZED BATCH EXPORT MODAL
 ══════════════════════════════════════════════════════════════════ */}
 <AnimatePresence>
 {showExportModal && (
 <div
 className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
 role="dialog"
 aria-modal="true"
 tabIndex={-1}
 onMouseDown={(e) => {
 if (e.target === e.currentTarget && !isExporting) setShowExportModal(false)
 }}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="modal-dialog font-sans my-auto w-full max-w-lg"
 >
 <div className="modal-content flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 dark:border-emerald-800/60 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-[#182232]">

 <div className="modal-header flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-[#182232]">
 <div className="flex items-center gap-3">
 <div className="rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 p-2.5 shadow-md shadow-xs shrink-0">
 <Download className="h-5 w-5 text-emerald-600" strokeWidth={2.2} />
 </div>
 <div>
 <h3 className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 Export Data Jabatan
 <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/60 dark:text-amber-400 dark:border-emerald-800/60">
 <Sparkles className="size-3" /> Unduh Data
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Pilih format berkas untuk mengekspor data sesuai filter aktif.
 </p>
 </div>
 </div>
 <IconButton icon={X} variant="ghost" size="sm" onClick={() => setShowExportModal(false)} />
 </div>

 <div className="modal-body p-6 space-y-4">
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
 ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 shadow-sm dark:border-emerald-800/60 dark:bg-emerald-950/40'
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
 Data yang diekspor akan mencakup seluruh entitas terfilter ({totalCount} record jabatan).
 </p>
 </div>
 </div>

 <div className="modal-footer px-6 py-4 border-t border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-end gap-2.5 bg-slate-50/50 dark:bg-slate-900/40">
 <AppButton variant="ghost" size="md" onClick={() => setShowExportModal(false)}>Batal</AppButton>
 <AppButton variant="primary" size="md" icon={Download} loading={isExporting} onClick={handleProcessExport}>{isExporting ? "Menyiapkan..." : "Unduh Berkas"}</AppButton>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* ══════════════════════════════════════════════════════════════════
 HARMONIZED SAVE/UPDATE CONFIRMATION MODAL (z-[70])
 ══════════════════════════════════════════════════════════════════ */}
 <AnimatePresence>
 {showSaveConfirmModal && pendingSaveData && (
 <div
 className="overlay modal fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
 role="dialog"
 aria-modal="true"
 tabIndex={-1}
 onMouseDown={(e) => {
 if (e.target === e.currentTarget && !simpanMutation.isPending && !ubahMutation.isPending) {
 setShowSaveConfirmModal(false)
 }
 }}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="modal-dialog font-sans my-auto w-full max-w-md"
 >
 <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-[#182232]">
 <div
 className={`h-1.5 w-full shrink-0 ${
 selectedJabatanForEdit
 ? 'bg-white dark:bg-card-dark'
 : 'bg-white dark:bg-card-dark'
 }`}
 />
 <div className="modal-header flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-[#182232]">
 <div className="flex items-center gap-3">
 <div
 className={`rounded-xl text-white p-2.5 shadow-md shrink-0 border ${
 selectedJabatanForEdit
 ? 'bg-white dark:bg-card-dark shadow-sm border-emerald-200/80 dark:border-emerald-800/60'
 : 'bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm border-emerald-300/30'
 }`}
 >
 {selectedJabatanForEdit ? (
 <Pencil className="h-5 w-5 text-emerald-600" strokeWidth={2.25} />
 ) : (
 <FaBriefcase className="h-5 w-5 text-slate-600" strokeWidth={2.25} />
 )}
 </div>
 <div>
 <h3 className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>{selectedJabatanForEdit ? 'Konfirmasi Perubahan Data' : 'Konfirmasi Penyimpanan Data'}</span>
 <span
 className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
 selectedJabatanForEdit
 ? 'bg-amber-50 text-amber-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/60 dark:text-amber-400 dark:border-emerald-800/60'
 : 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60'
 }`}
 >
 <Sparkles className="size-3" />
 {selectedJabatanForEdit ? 'Update Data' : 'Jabatan Baru'}
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 {selectedJabatanForEdit
 ? 'Pastikan rincian data sudah sesuai sebelum diperbarui di sistem.'
 : 'Pastikan rincian data jabatan baru sudah sesuai sebelum disimpan.'}
 </p>
 </div>
 </div>
 <IconButton icon={X} variant="ghost" size="sm" disabled={simpanMutation.isPending || ubahMutation.isPending} onClick={() => setShowSaveConfirmModal(false)} />
 </div>

 <div className="modal-body p-6 space-y-4 text-slate-700 dark:text-slate-200">
 {/* Summary Card */}
 <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/30">
 <div className="flex items-center gap-3">
 <div className="flex size-10 items-center justify-center rounded-xl bg-white dark:bg-slate-900 shadow-xs border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400">
 <FaBriefcase className="size-5" />
 </div>
 <div className="min-w-0 flex-1">
 <p className="text-xs font-black text-slate-900 dark:text-white truncate">
 {pendingSaveData.nama_jabatan || pendingSaveData.name || '—'}
 </p>
 <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
 {pendingSaveData.kode_jabatan || pendingSaveData.kode || '—'} · Level {pendingSaveData.level_jabatan || '—'}
 </p>
 </div>
 </div>
 </div>

 {/* Notice Box */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 p-3.5 dark:border-emerald-800/60 dark:bg-slate-900/40 text-xs text-slate-600 dark:text-slate-300">
 <p className="font-bold flex items-center gap-1.5 mb-1 text-slate-800 dark:text-slate-200">
 <Sparkles className="size-3.5 text-emerald-600" />
 Satuan Kerja: {pendingSaveData.satuan_kerja || '—'}
 </p>
 <p className="text-xs text-slate-500 leading-snug">
 Data jabatan ini akan langsung disinkronkan ke master data jabatan yayasan.
 </p>
 </div>
 </div>

 <div className="modal-footer px-6 py-4 border-t border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-end gap-2.5 bg-slate-50/50 dark:bg-slate-900/40">
 <AppButton variant="ghost" size="md" disabled={simpanMutation.isPending || ubahMutation.isPending} onClick={() => setShowSaveConfirmModal(false)}>Batal</AppButton>
					<AppButton variant="primary" size="md" icon={Save} loading={simpanMutation.isPending || ubahMutation.isPending} onClick={handleConfirmSaveForm}>{simpanMutation.isPending || ubahMutation.isPending ? "Menyimpan..." : selectedJabatanForEdit ? "Ya, Perbarui Data" : "Ya, Simpan Jabatan"}</AppButton>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* ══════════════════════════════════════════════════════════════════
 HARMONIZED DELETE CONFIRMATION MODAL (z-[70])
 ══════════════════════════════════════════════════════════════════ */}
 <AnimatePresence>
 {deleteTarget && (
 <div
 className="overlay modal fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
 role="dialog"
 aria-modal="true"
 tabIndex={-1}
 onMouseDown={(e) => {
 if (e.target === e.currentTarget && !hapusMutation.isPending) setDeleteTarget(null)
 }}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="modal-dialog font-sans my-auto w-full max-w-md"
 >
 <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 dark:border-emerald-800/60 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-[#182232]">

 <div className="modal-header flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-[#182232]">
 <div className="flex items-center gap-3">
 <div className="rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 p-2.5 shadow-md shadow-xs shrink-0">
 <Trash2 className="h-5 w-5 text-rose-600" strokeWidth={2.25} />
 </div>
 <div>
 <h3 className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>Hapus Data Jabatan</span>
 <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border bg-rose-50 text-rose-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/60 dark:text-rose-400 dark:border-emerald-800/60">
 <AlertTriangle className="size-3" />
 Hapus Permanen
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Konfirmasi penghapusan data posisi jabatan ini.
 </p>
 </div>
 </div>
 <IconButton icon={X} variant="ghost" size="sm" disabled={hapusMutation.isPending} onClick={() => setDeleteTarget(null)} />
 </div>

 <div className="modal-body p-6 space-y-4 text-slate-700 dark:text-slate-200">
 {/* Summary Card */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/50 p-4 dark:border-emerald-800/60 dark:bg-rose-950/30">
 <p className="text-xs font-black text-rose-900 dark:text-rose-200">
 {deleteTarget.nama_jabatan || deleteTarget.name}
 </p>
 <p className="text-xs font-bold text-rose-700 dark:text-rose-400 mt-0.5">
 Kode: {deleteTarget.kode_jabatan || '-'} · Level {deleteTarget.level_jabatan || '-'}
 </p>
 {deleteTarget.jumlah_pegawai > 0 && (
 <p className="text-xs font-semibold text-rose-600 mt-1">
 ⚠ Jabatan ini masih memiliki {deleteTarget.jumlah_pegawai} pegawai aktif.
 </p>
 )}
 </div>

 {/* Danger Callout */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/80 p-3.5 text-xs text-rose-900 dark:border-emerald-800/60 dark:bg-rose-950/40 dark:text-rose-200 leading-relaxed">
 <p className="font-bold flex items-center gap-1.5 mb-1">
 <AlertTriangle className="size-3.5 text-rose-600" />
 Perhatian
 </p>
 <p className="text-xs text-rose-800 dark:text-rose-300">
 Data jabatan yang sedang digunakan oleh pegawai aktif tidak dapat dihapus permanen. Data akan dipindahkan ke arsip (soft delete).
 </p>
 </div>
 </div>

 <div className="modal-footer px-6 py-4 border-t border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-end gap-2.5 bg-slate-50/50 dark:bg-slate-900/40">
 <AppButton variant="ghost" size="md" disabled={hapusMutation.isPending} onClick={() => setDeleteTarget(null)}>Batal</AppButton>
 <AppButton variant="danger" size="md" icon={Trash2} loading={hapusMutation.isPending} onClick={() => hapusMutation.mutate(deleteTarget.id)}>Hapus Permanen</AppButton>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* ══════════════════════════════════════════════════════════════════
 HARMONIZED BATCH DELETE CONFIRMATION MODAL (z-[70])
 ══════════════════════════════════════════════════════════════════ */}
 <AnimatePresence>
 {showBatchDeleteModal && (
 <div
 className="overlay modal fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
 role="dialog"
 aria-modal="true"
 tabIndex={-1}
 onMouseDown={(e) => {
 if (e.target === e.currentTarget && !batchDeleteMutation.isPending) setShowBatchDeleteModal(false)
 }}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="modal-dialog font-sans my-auto w-full max-w-lg"
 >
 <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 dark:border-emerald-800/60 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-[#182232]">

 <div className="modal-header flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-[#182232]">
 <div className="flex items-center gap-3">
 <div className="rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 p-2.5 shadow-md shadow-xs shrink-0">
 <Trash2 className="h-5 w-5 text-rose-600" strokeWidth={2.25} />
 </div>
 <div>
 <h3 className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>Hapus Massal Jabatan</span>
 <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border bg-rose-50 text-rose-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/60 dark:text-rose-400 dark:border-emerald-800/60">
 <AlertTriangle className="size-3" />
 {selectedJabatanIds.length} Data Dipilih
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Konfirmasi penghapusan serentak data jabatan terpilih.
 </p>
 </div>
 </div>
 <IconButton icon={X} variant="ghost" size="sm" disabled={batchDeleteMutation.isPending} onClick={() => setShowBatchDeleteModal(false)} />
 </div>

 <div className="modal-body p-6 space-y-4 text-slate-700 dark:text-slate-200 overflow-y-auto max-h-[50vh]">
 {/* Summary Card with List */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/50 p-4 dark:border-emerald-800/60 dark:bg-rose-950/30">
 <p className="text-xs font-bold text-rose-950 dark:text-rose-200 mb-2">
 Daftar jabatan yang akan dihapus:
 </p>
 <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
 {selectedJabatanObjects.slice(0, 5).map((item) => (
 <div key={item.id} className="flex items-center justify-between text-xs bg-white/70 dark:bg-slate-800/70 p-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
 <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[240px]">
 {item.nama_jabatan || item.name}
 </span>
 <span className="font-mono text-[10px] text-slate-500">
 {item.kode_jabatan || item.code} · Level {item.level_jabatan}
 </span>
 </div>
 ))}
 {selectedJabatanIds.length > 5 && (
 <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 italic text-center pt-1">
 ... dan {selectedJabatanIds.length - 5} jabatan lainnya
 </p>
 )}
 </div>
 </div>

 {/* Danger Callout */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/80 p-3.5 text-xs text-rose-900 dark:border-emerald-800/60 dark:bg-rose-950/40 dark:text-rose-200 leading-relaxed">
 <p className="font-bold flex items-center gap-1.5 mb-1">
 <AlertTriangle className="size-3.5 text-rose-600" />
 Perhatian Hapus Massal
 </p>
 <p className="text-xs text-rose-800 dark:text-rose-300">
 Sebanyak <strong>{selectedJabatanIds.length} jabatan</strong> akan dipindahkan ke arsip (soft delete). Riwayat assignment pegawai tidak akan hilang permanen dan dapat dipulihkan kapan saja bila diperlukan.
 </p>
 </div>
 </div>

 <div className="modal-footer px-6 py-4 border-t border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-end gap-2.5 bg-slate-50/50 dark:bg-slate-900/40">
 <AppButton variant="ghost" size="md" disabled={batchDeleteMutation.isPending} onClick={() => setShowBatchDeleteModal(false)}>Batal</AppButton>
 <AppButton variant="danger" size="md" icon={Trash2} loading={batchDeleteMutation.isPending} onClick={() => batchDeleteMutation.mutate(selectedJabatanIds)}>Hapus ({selectedJabatanIds.length}) Jabatan</AppButton>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* ══════════════════════════════════════════════════════════════════
 HARMONIZED RESTORE CONFIRMATION MODAL (z-[70])
 ══════════════════════════════════════════════════════════════════ */}
 <AnimatePresence>
 {restoreTarget && (
 <div
 className="overlay modal fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
 role="dialog"
 aria-modal="true"
 tabIndex={-1}
 onMouseDown={(e) => {
 if (e.target === e.currentTarget && !pulihkanMutation.isPending) setRestoreTarget(null)
 }}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="modal-dialog font-sans my-auto w-full max-w-md"
 >
 <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 dark:border-emerald-800/60 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-[#182232]">

 <div className="modal-header flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-[#182232]">
 <div className="flex items-center gap-3">
 <div className="rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 p-2.5 shadow-md shadow-xs shrink-0">
 <FaRedo className="h-5 w-5 text-slate-600" strokeWidth={2.25} />
 </div>
 <div>
 <h3 className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>Pulihkan Data Jabatan</span>
 <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
 <FaRedo className="size-3" />
 Restore Data
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Konfirmasi pemulihan data posisi jabatan dari arsip.
 </p>
 </div>
 </div>
 <IconButton icon={X} variant="ghost" size="sm" disabled={pulihkanMutation.isPending} onClick={() => setRestoreTarget(null)} />
 </div>

 <div className="modal-body p-6 space-y-4 text-slate-700 dark:text-slate-200">
 {/* Summary Card */}
 <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/30">
 <p className="text-xs font-black text-emerald-900 dark:text-emerald-200">
 {restoreTarget.nama_jabatan || restoreTarget.name}
 </p>
 <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
 Kode: {restoreTarget.kode_jabatan || '-'} · Level {restoreTarget.level_jabatan || '-'}
 </p>
 </div>

 {/* Notice Callout */}
 <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/80 p-3.5 text-xs text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200 leading-relaxed">
 <p className="font-bold flex items-center gap-1.5 mb-1">
 <Sparkles className="size-3.5 text-emerald-600" />
 Informasi Pemulihan
 </p>
 <p className="text-xs text-emerald-800 dark:text-emerald-300">
 Jabatan ini akan dipulihkan dari arsip dan kembali tersedia di sistem manajemen pegawai.
 </p>
 </div>
 </div>

 <div className="modal-footer px-6 py-4 border-t border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-end gap-2.5 bg-slate-50/50 dark:bg-slate-900/40">
 <AppButton variant="ghost" size="md" disabled={pulihkanMutation.isPending} onClick={() => setRestoreTarget(null)}>Batal</AppButton>
 <AppButton variant="primary" size="md" icon={RotateCcw} loading={pulihkanMutation.isPending} onClick={() => pulihkanMutation.mutate(restoreTarget.id)}>Pulihkan Data</AppButton>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* Smart Floating Scroll Navigator (Opsi A) */}
 <SmartScrollFab targetId="tabel-master-jabatan" downTooltip="Langsung ke Tabel Jabatan" />
 </PageContainer>
 )
}
