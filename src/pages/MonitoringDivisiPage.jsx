import React, { useState, useMemo } from 'react'
import AppModal from '../components/app/AppModal'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  Layers,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCcw,
  TrendingUp,
  Award,
  Building2,
  Trash2,
  ChevronDown,
  Calendar,
  FileText,
  X,
  BookOpen,
  Zap,
  LayoutGrid,
  Lock,
  ShieldCheck,
  UserCheck,
  Check,
  Printer,
  Pencil,
  Sparkles
} from 'lucide-react'
import {
  Download as Download1,
  Upload as Upload1
} from 'lucide-react'

import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import {
  AppButton,
  IconButton,
  AppBadge,
  KpiStatCard
} from '../components/app'
import AppDataTable from '../components/app/AppDataTable'
import ActionDropdown from '../components/app/ActionDropdown'
import {
  MasterStatCard,
  MasterStatsGrid,
  PrintOptionModal
} from '../components/master-data'
import {
  printCleanTable,
  downloadPdfTable,
  resolveFoundationName
} from '../utils/printHelper'
import {
  usePengaturanStore
} from '../stores/pengaturanStore'
import {
  useToast
} from '../components/app/ToastProvider'

import {
  useDaftarPemantauanDivisi,
  useAksiPemantauanDivisi
} from '../hooks/useDashboardPemantauan'
import PemantauanDivisiFormModal from '../components/pemantauan/PemantauanDivisiFormModal'
import ImporDivisiModal from '../components/pemantauan/ImporDivisiModal'
import {
  useAuthStore
} from '../stores/authStore'
import {
  getUserRoleLevel,
  ROLE_LEVELS,
  isFoundationUser
} from '../auth/portalResolver'
import {
  SmartScrollFab
} from '../components/common'
import {
  useUnitStore
} from '../stores/unitStore'
import {
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import {
  educationUnitService
} from '../services/educationUnitService'
import {
  divisionService
} from '../services/divisionService'
import useDebounce from '../hooks/useDebounce'

import {
  AlertDialog
} from '@/components/ui/alert-dialog'
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import {
  Backdrop,
  OverlayWrapper
} from '@/components/ui/dialog'
import {
  Button
} from '@/components/ui/button'
import {
  Badge
} from '@/components/ui/badge'
import {
  Alert,
  AlertContent,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'

const STATUS_MAP = {
 proses: { label: 'Dalam Proses', color: 'sky' },
 tercapai: { label: 'Tercapai', color: 'success' },
 terlambat: { label: 'Terlambat', color: 'warning' },
 belum_tercapai: { label: 'Belum Tercapai', color: 'error' },
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

export default function MonitoringDivisiPage() {
 const [page, setPage] = useState(1)
 const [perPage, setPerPage] = useState(15)
 const [search, setSearch] = useState('')
 const debouncedSearch = useDebounce(search, 350)
 const [filterDivisi, setFilterDivisi] = useState('')
 const [filterStatus, setFilterStatus] = useState('')
 const [filterUnit, setFilterUnit] = useState('')

 // Detail & Action Modal States
 const toast = useToast()
 const queryClient = useQueryClient()
 const [isDetailOpen, setIsDetailOpen] = useState(false)
 const [selectedRecord, setSelectedRecord] = useState(null)
 const [isFormOpen, setIsFormOpen] = useState(false)
 const [isDeleteOpen, setIsDeleteOpen] = useState(false)
 const [deleteTargetId, setDeleteTargetId] = useState(null)
 const [isImportOpen, setIsImportOpen] = useState(false)
 const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
 const [isRefreshing, setIsRefreshing] = useState(false)

 // Auth & Role Context
 const user = useAuthStore((state) => state.user)
 const activeUnitFromStore = useUnitStore((state) => state.activeUnit)
 const pengaturan = usePengaturanStore((state) => state.pengaturan)
 const foundationName = resolveFoundationName(pengaturan)

 const userRoles = useMemo(() => {
 if (!user) return []
 if (Array.isArray(user.roles)) return user.roles.map((r) => (typeof r === 'string' ? r : r.name || ''))
 if (user.role) return [typeof user.role === 'string' ? user.role : user.role.name || '']
 return []
 }, [user])

 const userLevel = useMemo(() => getUserRoleLevel(user), [user])
 const isFoundation = useMemo(() => isFoundationUser(user), [user])
 const canManage = useMemo(() => {
 if (!user) return false
 if (isFoundation) return false
 if (user.is_superadmin) return true
 return (
 userLevel <= ROLE_LEVELS.ADMIN ||
 userLevel === ROLE_LEVELS.DIVISI_PENDIDIKAN ||
 userLevel === ROLE_LEVELS.KEPALA_SEKOLAH ||
 userRoles.some((r) => /divisi|bidang[\s_]*pendidikan|pengawasan[\s_]*akademik|kepala[\s_]*sekolah|kepsek/i.test(r))
 )
 }, [user, isFoundation, userLevel, userRoles])

 const isSuperAdminOrYayasan = useMemo(() => {
 if (!user) return false
 if (user.is_superadmin) return true
 return userLevel <= ROLE_LEVELS.ADMIN || userLevel === ROLE_LEVELS.PIMPINAN_YAYASAN // Level 1, 2
 }, [user, userLevel])

 const isDivisi = useMemo(() => {
 if (!user) return false
 if (isSuperAdminOrYayasan) return false
 return (
 userLevel === ROLE_LEVELS.DIVISI_PENDIDIKAN ||
 userRoles.some((r) => /divisi|bidang[\s_]*pendidikan|pengawasan[\s_]*akademik/i.test(r))
 )
 }, [user, userLevel, userRoles, isSuperAdminOrYayasan])

 const isKepalaSekolah = useMemo(() => {
 if (!user) return false
 if (isSuperAdminOrYayasan || isDivisi) return false
 return (
 userLevel === ROLE_LEVELS.KEPALA_SEKOLAH ||
 userRoles.some((r) => /kepala[\s_]*sekolah|kepsek/i.test(r))
 )
 }, [user, userLevel, userRoles, isSuperAdminOrYayasan, isDivisi])

 // Divisi Pendidikan berwenang memonitor di SEMUA UNIT (tidak terkunci pada 1 unit)
 // Hanya Kepala Sekolah yang unitnya terkunci ke unit masing-masing
 const isUnitRestricted = isKepalaSekolah

 const isYayasanTarget = (name) => {
 if (!name) return false
 return /yayasan|pengurus[\s_]*yayasan|ketua[\s_]*yayasan|sekretaris[\s_]*yayasan|bendahara[\s_]*yayasan|pembina[\s_]*yayasan|pengawas[\s_]*yayasan/i.test(name)
 }

 // React Query Hooks
 const { data: unitsData } = useQuery({
 queryKey: ['education-units-monitoring-divisi'],
 queryFn: () => educationUnitService.getDaftar({ per_page: 100 }),
 })
 const educationUnits = useMemo(() => {
 const list = unitsData?.data?.data || unitsData?.data || (Array.isArray(unitsData) ? unitsData : [])
 return Array.isArray(list) ? list : []
 }, [unitsData])

 const currentUserUnit =
 user?.education_unit ||
 user?.unit_name ||
 user?.unit ||
 activeUnitFromStore ||
 educationUnits[0]?.name ||
 educationUnits[0]?.code ||
 ''

 const { data, isLoading, isError, isFetching, refetch } = useDaftarPemantauanDivisi({
 page,
 per_page: perPage,
 search: debouncedSearch || undefined,
 unit_pendidikan: filterUnit || undefined,
 nama_divisi: filterDivisi || undefined,
 status_pemantauan: filterStatus || undefined,
 })

 const { data: rawDivisionsData } = useQuery({
 queryKey: ['divisions-dropdown-monitoring-divisi'],
 queryFn: () => divisionService.getDropdown(),
 })

 const { tambah, ubah, hapus } = useAksiPemantauanDivisi()

 const rawApiItems = data?.data || []

 const divisionOptions = useMemo(() => {
 const fromApi = Array.isArray(rawDivisionsData) ? rawDivisionsData : []
 const set = new Set()
 const list = []
 fromApi.forEach((d) => {
 const name = d.name || d.nama || d.code
 if (name && !set.has(name)) {
 if (isDivisi && isYayasanTarget(name)) {
 return // Divisi tidak berhak memonitoring pengurus yayasan
 }
 set.add(name)
 list.push({ id: d.id || name, name })
 }
 })
 rawApiItems.forEach((item) => {
 if (item.nama_divisi && !set.has(item.nama_divisi)) {
 if (isDivisi && isYayasanTarget(item.nama_divisi)) {
 return // Divisi tidak berhak memonitoring pengurus yayasan
 }
 set.add(item.nama_divisi)
 list.push({ id: item.nama_divisi, name: item.nama_divisi })
 }
 })
 return list
 }, [rawDivisionsData, rawApiItems, isDivisi])

 const combinedItems = useMemo(() => {
 return (rawApiItems || []).map((item) => ({
 unit_pendidikan: item.unit_pendidikan || item.unit?.name || 'Seluruh Unit / Umum',
 petugas_supervisi: item.petugas_supervisi || '',
 kategori_laporan: item.kategori_laporan || '',
 ...item,
 }))
 }, [rawApiItems])

 // Filter items by Unit scope, Divisi, Status, Search
 const filteredItems = useMemo(() => {
 return combinedItems.filter((item) => {
 // Divisi Pendidikan tidak berhak memonitoring pengurus yayasan
 if (isDivisi && isYayasanTarget(item.nama_divisi)) {
 return false
 }

 // Unit access filter check (filter when a specific unit filter is chosen)
 if (filterUnit) {
 const u = (item.unit_pendidikan || item.unit?.name || '').toLowerCase()
 const f = filterUnit.toLowerCase()
 if (u !== f && !u.includes(f) && !f.includes(u)) {
 return false
 }
 }

 if (filterDivisi) {
 const f = filterDivisi.toLowerCase().trim()
 const d = (item.nama_divisi || '').toLowerCase().trim()
 if (!d.includes(f) && !f.includes(d)) return false
 }
 if (filterStatus && item.status_pemantauan !== filterStatus) return false
 if (debouncedSearch) {
 const q = debouncedSearch.toLowerCase()
 const text = `${item.nama_divisi} ${item.aspek_pemantauan} ${item.catatan} ${item.petugas_supervisi} ${item.unit_pendidikan}`.toLowerCase()
 if (!text.includes(q)) return false
 }
 return true
 })
 }, [combinedItems, filterUnit, filterDivisi, filterStatus, debouncedSearch, isDivisi])

 const pagination = {
 currentPage: page,
 totalPages: Math.ceil(filteredItems.length / perPage) || 1,
 totalRecords: filteredItems.length,
 from: (page - 1) * perPage + 1,
 to: Math.min(page * perPage, filteredItems.length),
 }

 const paginatedItems = useMemo(() => {
 const start = (page - 1) * perPage
 return filteredItems.slice(start, start + perPage)
 }, [filteredItems, page, perPage])

 const hasActiveFilters = Boolean(search || filterDivisi || filterStatus || filterUnit)

 const resetFilters = () => {
 setSearch('')
 setFilterDivisi('')
 setFilterStatus('')
 setFilterUnit('')
 setPage(1)
 }

 // Export CSV Handler with UTF-8 BOM & Blob
 const handleExportCsv = () => {
 if (!filteredItems || filteredItems.length === 0) {
 toast.warning('Tidak ada data pemantauan untuk diekspor')
 return
 }

 try {
 const headers = [
 'ID',
 'Unit Pendidikan',
 'Nama Divisi',
 'Kategori Laporan',
 'Aspek Pemantauan',
 'Capaian (%)',
 'Status Pemantauan',
 'Tanggal',
 'Petugas Supervisi',
 'Catatan',
 ]
 const rows = filteredItems.map((item) => [
 item.id || '',
 `"${(item.unit_pendidikan || '').replace(/"/g, '""')}"`,
 `"${(item.nama_divisi || '').replace(/"/g, '""')}"`,
 `"${(item.kategori_laporan || '').replace(/"/g, '""')}"`,
 `"${(item.aspek_pemantauan || '').replace(/"/g, '""')}"`,
 item.persentase_capaian || 0,
 item.status_pemantauan || '',
 item.tanggal_pemantauan || '',
 `"${(item.petugas_supervisi || '').replace(/"/g, '""')}"`,
 `"${(item.catatan || '').replace(/"/g, '""')}"`,
 ])

 const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
 const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
 const url = URL.createObjectURL(blob)
 const link = document.createElement('a')
 link.setAttribute('href', url)
 link.setAttribute('download', `monitoring_divisi_sit_${new Date().toISOString().split('T')[0]}.csv`)
 document.body.appendChild(link)
 link.click()
 document.body.removeChild(link)
 URL.revokeObjectURL(url)

 toast.success(`Berhasil mengekspor ${filteredItems.length} data pemantauan (CSV)`)
 } catch (err) {
 console.error('Gagal mengekspor data CSV:', err)
 toast.error('Gagal mengekspor data laporan pemantauan ke CSV')
 }
 }

 // Refresh Real-Time Data Handler
 const handleRefresh = async () => {
 try {
 setIsRefreshing(true)
 await Promise.all([
 queryClient.invalidateQueries({ queryKey: ['dashboard-pemantauan'] }),
 queryClient.invalidateQueries({ queryKey: ['pemantauan-divisi'] }),
 queryClient.invalidateQueries({ queryKey: ['divisions-dropdown-monitoring-divisi'] }),
 refetch(),
 ])
 toast.success('Data pemantauan divisi berhasil disegarkan secara real-time')
 } catch (err) {
 console.error('Gagal menyegarkan data:', err)
 toast.error('Gagal menyegarkan data pemantauan divisi')
 } finally {
 setIsRefreshing(false)
 }
 }

 // Print Modal & Export Actions
 const handleOpenPrintModal = () => {
 if (!filteredItems || filteredItems.length === 0) {
 toast.warning('Tidak ada data pemantauan untuk dicetak')
 return
 }
 setIsPrintModalOpen(true)
 }

 const handlePrintClean = (orientation = 'landscape') => {
 if (!filteredItems || filteredItems.length === 0) {
 toast.warning('Tidak ada data pemantauan untuk dicetak')
 return
 }
 const rows = filteredItems.map((item, idx) => [
 idx + 1,
 item.unit_pendidikan || '-',
 item.nama_divisi || '-',
 item.aspek_pemantauan || '-',
 `${item.persentase_capaian || 0}%`,
 item.status_pemantauan || '-',
 item.tanggal_pemantauan || '-',
 item.petugas_supervisi || '-',
 ])
 printCleanTable({
 title: 'LAPORAN MONITORING & EVALUASI DIVISI',
 subtitle: `Agregasi Kinerja ${foundationName} (Total: ${filteredItems.length} Data)`,
 headers: ['No', 'Unit Pendidikan', 'Divisi', 'Aspek Pemantauan', 'Capaian', 'Status', 'Tanggal', 'Supervisor'],
 rows,
 orientation,
 foundationName,
 })
 setIsPrintModalOpen(false)
 }

 const handleDownloadPdf = (orientation = 'landscape') => {
 if (!filteredItems || filteredItems.length === 0) {
 toast.warning('Tidak ada data pemantauan untuk diunduh')
 return
 }
 const rows = filteredItems.map((item, idx) => [
 idx + 1,
 item.unit_pendidikan || '-',
 item.nama_divisi || '-',
 item.aspek_pemantauan || '-',
 `${item.persentase_capaian || 0}%`,
 item.status_pemantauan || '-',
 item.tanggal_pemantauan || '-',
 item.petugas_supervisi || '-',
 ])
 downloadPdfTable({
 title: 'LAPORAN MONITORING & EVALUASI DIVISI',
 subtitle: `Agregasi Kinerja ${foundationName} (Total: ${filteredItems.length} Data)`,
 headers: ['No', 'Unit Pendidikan', 'Divisi', 'Aspek Pemantauan', 'Capaian', 'Status', 'Tanggal', 'Supervisor'],
 rows,
 orientation,
 filename: `laporan_monitoring_divisi_${new Date().toISOString().split('T')[0]}.pdf`,
 foundationName,
 })
 setIsPrintModalOpen(false)
 }

 // Handle Import Success
 const handleImportSuccess = () => {
 refetch()
 }

 // KPI Statistics Calculation
 const totalCount = filteredItems.length
 const tercapaiCount = filteredItems.filter((i) => i.status_pemantauan === 'tercapai').length
 const prosesCount = filteredItems.filter((i) => i.status_pemantauan === 'proses').length
 const perluPerhatianCount = filteredItems.filter((i) =>
 ['terlambat', 'belum_tercapai'].includes(i.status_pemantauan)
 ).length
 const avgCapaian =
 filteredItems.length > 0
 ? Math.round(
 filteredItems.reduce((acc, curr) => acc + (Number(curr.persentase_capaian) || 0), 0) / filteredItems.length
 )
 : 0

 // Modal Action Handlers
 const handleOpenCreate = () => {
 if (!canManage) return
 setSelectedRecord(null)
 setIsFormOpen(true)
 }

 const handleOpenEdit = (record) => {
 if (!canManage) return
 setSelectedRecord(record)
 setIsFormOpen(true)
 }

 const handleOpenDelete = (id) => {
 if (!canManage) return
 setDeleteTargetId(id)
 setIsDeleteOpen(true)
 }

 const handleFormSubmit = async (formData) => {
 if (!canManage) return
 if (selectedRecord?.id) {
 await ubah.mutateAsync(
 { id: selectedRecord.id, payload: formData },
 {
 onSuccess: () => {
 setIsFormOpen(false)
 refetch()
 },
 }
 )
 } else {
 await tambah.mutateAsync(formData, {
 onSuccess: () => {
 setIsFormOpen(false)
 refetch()
 },
 })
 }
 }

 const handleConfirmDelete = async () => {
 if (!canManage || !deleteTargetId) return
 await hapus.mutateAsync(deleteTargetId, {
 onSuccess: () => {
 setIsDeleteOpen(false)
 setDeleteTargetId(null)
 refetch()
 },
 })
 }

 // AppDataTable Columns Definition with HeroUI HoverCard
 const columns = [
 {
 key: 'nama_divisi',
 label: 'UNIT & NAMA DIVISI',
 className: 'w-64 sm:w-72',
 render: (row) => (
 <div className="flex min-w-0 items-center gap-3">
 <div className="flex h-9 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100/90 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-extrabold shadow-xs">
 {row.nama_divisi?.includes('Al-Qur\'an') ? (
 <BookOpen className="h-5 w-5" />
 ) : row.nama_divisi?.includes('Kesiswaan') ? (
 <Zap className="h-5 w-5" />
 ) : row.nama_divisi?.includes('Kurikulum') ? (
 <LayoutGrid className="h-5 w-5" />
 ) : row.nama_divisi?.includes('Sarana') ? (
 <Building2 className="h-5 w-5" />
 ) : (
 <Layers className="h-5 w-5" />
 )}
 </div>
 <div className="min-w-0 flex-1 space-y-0.5">
 <HoverCard>
 <HoverCardTrigger
 onClick={(e) => {
 e.preventDefault()
 handleOpenEdit(row)
 }}
 className="inline-block max-w-full truncate text-sm font-extrabold text-slate-900 dark:text-white border-b border-dashed border-emerald-200/80 hover:border-emerald-300 dark:hover:border-emerald-200/80 transition-colors cursor-pointer"
 >
 {row.nama_divisi || '-'}
 </HoverCardTrigger>
 <HoverCardContent className="w-80 p-4 bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl shadow-xl space-y-2 z-50">
 <div className="flex items-center justify-between p-4 -mx-4 -mt-4 mb-3 border-b border-emerald-200/70 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/50 dark:via-teal-950/20 dark:to-transparent">
 <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
 <Building2 className="h-3.5 w-3.5 text-emerald-600" />
 {row.nama_divisi}
 </span>
 <Badge color={STATUS_MAP[row.status_pemantauan]?.color || 'gray'} size="sm">
 {STATUS_MAP[row.status_pemantauan]?.label || row.status_pemantauan}
 </Badge>
 </div>
 <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
 <p>
 <strong className="text-slate-900 dark:text-white">Unit Pendidikan:</strong>{' '}
 <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{row.unit_pendidikan || '-'}</span>
 </p>
 <p>
 <strong className="text-slate-900 dark:text-white">Aspek Pemantauan:</strong> {row.aspek_pemantauan || '-'}
 </p>
 <p>
 <strong className="text-slate-900 dark:text-white">Capaian Target:</strong> {row.persentase_capaian || 0}%
 </p>
 {row.indikator_riil && (
 <p>
 <strong className="text-slate-900 dark:text-white">Metrik Riil:</strong>{' '}
 <span className="font-bold text-blue-600 dark:text-blue-400">{row.indikator_riil}</span>
 </p>
 )}
 {row.petugas_supervisi && (
 <p>
 <strong className="text-slate-900 dark:text-white">Pengawas:</strong> {row.petugas_supervisi}
 </p>
 )}
 {row.tanggal_pemantauan && (
 <p>
 <strong className="text-slate-900 dark:text-white">Tanggal Supervisi:</strong>{' '}
 {new Date(row.tanggal_pemantauan).toLocaleDateString('id-ID', {
 day: 'numeric',
 month: 'long',
 year: 'numeric',
 })}
 </p>
 )}
 {row.catatan && (
 <div className="mt-1 pt-1.5 border-t border-emerald-200/80 dark:border-emerald-800/60 text-slate-500 italic">
 "{row.catatan}"
 </div>
 )}
 </div>
 </HoverCardContent>
 </HoverCard>
 <div className="flex items-center gap-1.5">
 <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
 {row.unit_pendidikan || '-'}
 </span>
 </div>
 </div>
 </div>
 ),
 },
 {
 key: 'aspek_pemantauan',
 label: 'ASPEK & INDIKATOR PEMANTAUAN',
 className: 'w-72 sm:w-80',
 render: (row) => (
 <div className="space-y-1">
 <p className="font-bold text-slate-900 dark:text-slate-100 text-xs leading-snug">
 {row.aspek_pemantauan || '-'}
 </p>
 <div className="flex items-center gap-1.5 flex-wrap">
 {row.kategori_laporan && (
 <span className="inline-block text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200/80 dark:border-emerald-800/60">
 {row.kategori_laporan}
 </span>
 )}
 {row.indikator_riil && (
 <span className="inline-block text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-emerald-200/80 dark:border-emerald-800/60">
 {row.indikator_riil}
 </span>
 )}
 </div>
 {row.catatan && <p className="text-xs text-slate-400 line-clamp-1 italic max-w-xs">{row.catatan}</p>}
 </div>
 ),
 },
 {
 key: 'persentase_capaian',
 label: 'CAPAIAN (%)',
 className: 'w-36',
 render: (row) => {
 const val = Number(row.persentase_capaian) || 0
 const barColor = val >= 80 ? 'bg-emerald-500' : val >= 50 ? 'bg-amber-500' : 'bg-rose-500'
 return (
 <div className="w-full max-w-[120px] space-y-1">
 <div className="flex justify-between text-xs font-extrabold text-slate-800 dark:text-slate-200">
 <span>{val}%</span>
 <span className="text-[10px] text-slate-400 font-semibold">{val >= 100 ? 'Selesai' : 'Target'}</span>
 </div>
 <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-50 dark:bg-emerald-950/40">
 <div
 className={`h-full rounded-full transition-all duration-500 ${barColor}`}
 style={{ width: `${Math.min(val, 100)}%` }}
 />
 </div>
 </div>
 )
 },
 },
 {
 key: 'status_pemantauan',
 label: 'STATUS',
 className: 'w-32',
 render: (row) => {
 const conf = STATUS_MAP[row.status_pemantauan] || {
 label: row.status_pemantauan || 'proses',
 color: 'gray',
 }
 return (
 <Badge color={conf.color} size="sm">
 {conf.label}
 </Badge>
 )
 },
 },
 {
 key: 'tanggal_pemantauan',
 label: 'TANGGAL & PENGAWAS',
 className: 'w-44',
 render: (row) => (
 <div className="space-y-0.5">
 <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">
 <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
 <span>
 {row.tanggal_pemantauan
 ? new Date(row.tanggal_pemantauan).toLocaleDateString('id-ID', {
 day: 'numeric',
 month: 'short',
 year: 'numeric',
 })
 : '-'}
 </span>
 </div>
 {row.petugas_supervisi && (
						<p className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 leading-snug">
 <UserCheck className="h-3 w-3 text-emerald-500" />
 {row.petugas_supervisi}
 </p>
 )}
 </div>
 ),
 },
  {
   key: 'aksi',
   label: '',
   headerProps: { className: 'text-right w-16' },
   cellProps: { className: 'text-right w-16' },
   render: (row) => (
    <div className="flex items-center justify-end">
     <ActionDropdown
      onView={() => {
       setSelectedRecord(row)
       setIsDetailOpen(true)
      }}
      onEdit={canManage ? () => handleOpenEdit(row) : undefined}
      onDelete={canManage ? () => handleOpenDelete(row.id) : undefined}
     />
    </div>
   ),
  },
 ]

 // Soft Pastel Squircle Action Buttons (Toolbar Row 1 Header) - Compliant with Capability Lock
 const renderActionButtons = (
 <div className="flex items-center gap-2">
 {canManage && (
 <>
 {/* Tambah Supervisi Button - Soft Pastel Emerald Squircle */}
 <div className="group relative inline-flex">
 <button
 type="button"
 title="Tambah Laporan Supervisi Divisi"
 aria-label="Tambah Laporan Supervisi Divisi"
 onClick={handleOpenCreate}
 className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-500 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm border border-emerald-500"
 >
 <Plus className="size-5" />
 </button>
 <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
 Tambah Supervisi
 </div>
 </div>

 {/* Impor CSV Button - Soft Pastel Sky Squircle */}
 <div className="group relative inline-flex">
 <button
 type="button"
 title="Impor Data Laporan Supervisi (CSV)"
 aria-label="Impor Data Laporan Supervisi (CSV)"
 onClick={() => setIsImportOpen(true)}
 className="flex size-10 items-center justify-center rounded-xl bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-600 dark:text-white dark:hover:bg-sky-500 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm border border-sky-500"
 >
 <Upload1 className="size-5" />
 </button>
 <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
 Impor CSV
 </div>
 </div>
 </>
 )}

 {/* Ekspor CSV/Excel Button - Soft Pastel Amber/Orange Squircle */}
 <div className="group relative inline-flex">
 <button
 type="button"
 title="Ekspor Data Laporan (CSV/Excel)"
 aria-label="Ekspor Data Laporan (CSV/Excel)"
 onClick={handleExportCsv}
 className="flex size-10 items-center justify-center rounded-xl bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-600 dark:text-white dark:hover:bg-amber-500 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm border border-amber-500"
 >
 <Download1 className="size-5" />
 </button>
 <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
 Ekspor CSV/Excel
 </div>
 </div>

 {/* Segarkan Data Button - Soft Pastel Violet/Purple Squircle */}
 <div className="group relative inline-flex">
 <button
 type="button"
 title="Segarkan Data Real-Time"
 aria-label="Segarkan Data Real-Time"
 onClick={handleRefresh}
 disabled={isRefreshing || isFetching}
 className="flex size-10 items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-600 dark:text-white dark:hover:bg-violet-500 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm border border-violet-500 disabled:opacity-60 disabled:cursor-not-allowed"
 >
 <RefreshCcw className={`size-5 ${isRefreshing || isFetching ? 'animate-spin' : ''}`} />
 </button>
 <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
 {isRefreshing || isFetching ? 'Menyegarkan Data...' : 'Segarkan Data Real-Time'}
 </div>
 </div>

 {/* Cetak Datatable Button - Soft Pastel Indigo Squircle */}
 <div className="group relative inline-flex">
 <button
 type="button"
 title="Cetak Data Laporan (Print/PDF)"
 aria-label="Cetak Data Laporan (Print/PDF)"
 onClick={handleOpenPrintModal}
 className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:text-white dark:hover:bg-indigo-500 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm border border-indigo-500"
 >
 <Printer className="size-5" />
 </button>
 <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
 Cetak Data (Print/PDF)
 </div>
 </div>
 </div>
 )

 // Filter Bar Controls for AppDataTable (Toolbar Row 2)
 const renderFilterControls = (
 <>
 {/* Unit Pendidikan Dropdown (Visible / Editable for Superadmin & Yayasan, locked indicator for Kepsek/Divisi) */}
 {!isUnitRestricted ? (
 <div className="relative min-w-[200px]">
 <Select
 value={filterUnit || ''}
 onChange={(val) => {
 setFilterUnit(String(val || ''))
 setPage(1)
 }}
 >
 <SelectTrigger className="h-9 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/60 px-3.5 text-xs font-bold text-emerald-900 shadow-2xs transition-all hover:border-emerald-300 dark:hover:border-emerald-200/80 focus:border-emerald-200/80 focus:ring-2 focus:ring-emerald-600/20 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200">
 <SelectValue placeholder="Semua Unit Pendidikan" />
 </SelectTrigger>
 <SelectContent className="z-50 max-h-72 overflow-y-auto bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl shadow-2xl p-1.5 animate-in fade-in zoom-in-95">
 <SelectItem id="" value="" className="text-xs font-bold py-2 text-emerald-700 dark:text-emerald-400">
 Semua Unit Pendidikan
 </SelectItem>
 {educationUnits.map((u) => (
 <SelectItem key={u.id} id={u.name || u.code} value={u.name || u.code} className="text-xs font-semibold py-2">
 {u.name}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 ) : (
 <div className="h-9 px-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/90 text-amber-900 dark:border-emerald-800/60 dark:bg-amber-950/40 dark:text-amber-200 flex items-center gap-1.5 text-xs font-extrabold">
 <Lock className="h-3.5 w-3.5 text-amber-600" />
 <span>Unit: {currentUserUnit}</span>
 </div>
 )}

 {/* Filter Divisi Dropdown (Populated Dynamically from Database) */}
 <div className="relative min-w-[190px]">
 <Select
 value={filterDivisi || ''}
 onChange={(val) => {
 setFilterDivisi(String(val || ''))
 setPage(1)
 }}
 >
 <SelectTrigger className="h-9 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-emerald-300 focus:border-emerald-200/80 focus:ring-2 focus:ring-emerald-600/20 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-200">
 <SelectValue placeholder={`Semua Divisi ${divisionOptions.length > 0 ? `(${divisionOptions.length})` : ''}`} />
 </SelectTrigger>
 <SelectContent className="z-50 max-h-72 overflow-y-auto bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl shadow-2xl p-1.5 animate-in fade-in zoom-in-95">
 <SelectItem id="" value="" className="text-xs font-semibold py-2">
 Semua Divisi {divisionOptions.length > 0 ? `(${divisionOptions.length})` : ''}
 </SelectItem>
 {divisionOptions.map((opt) => (
 <SelectItem key={opt.id || opt.name} id={opt.name} value={opt.name} className="text-xs font-semibold py-2">
 {opt.name}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 {/* Filter Status Dropdown */}
 <div className="relative min-w-[175px]">
 <Select
 value={filterStatus || ''}
 onChange={(val) => {
 setFilterStatus(String(val || ''))
 setPage(1)
 }}
 >
 <SelectTrigger className="h-9 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-emerald-300 focus:border-emerald-200/80 focus:ring-2 focus:ring-emerald-600/20 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-200">
 <SelectValue placeholder="Semua Status Supervisi" />
 </SelectTrigger>
 <SelectContent className="z-50 max-h-72 overflow-y-auto bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl shadow-2xl p-1.5 animate-in fade-in zoom-in-95">
 <SelectItem id="" value="" className="text-xs font-semibold py-2">Semua Status Supervisi</SelectItem>
 <SelectItem id="proses" value="proses" className="text-xs font-semibold py-2">Dalam Proses</SelectItem>
 <SelectItem id="tercapai" value="tercapai" className="text-xs font-semibold py-2">Tercapai</SelectItem>
 <SelectItem id="terlambat" value="terlambat" className="text-xs font-semibold py-2">Terlambat</SelectItem>
 <SelectItem id="belum_tercapai" value="belum_tercapai" className="text-xs font-semibold py-2">Belum Tercapai</SelectItem>
 </SelectContent>
 </Select>
 </div>

 {/* Select Per Halaman */}
 <div className="relative min-w-[145px]">
 <Select
 value={String(perPage)}
 onChange={(val) => {
 setPerPage(Number(val) || 10)
 setPage(1)
 }}
 >
 <SelectTrigger className="h-9 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-emerald-300 focus:border-emerald-200/80 focus:ring-2 focus:ring-emerald-600/20 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-200">
 <SelectValue placeholder="10 Per Halaman" />
 </SelectTrigger>
 <SelectContent className="z-50 max-h-72 overflow-y-auto bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl shadow-2xl p-1.5 animate-in fade-in zoom-in-95">
 <SelectItem id="5" value="5" className="text-xs font-semibold py-2">5 Per Halaman</SelectItem>
 <SelectItem id="10" value="10" className="text-xs font-semibold py-2">10 Per Halaman</SelectItem>
 <SelectItem id="15" value="15" className="text-xs font-semibold py-2">15 Per Halaman</SelectItem>
 <SelectItem id="25" value="25" className="text-xs font-semibold py-2">25 Per Halaman</SelectItem>
 <SelectItem id="50" value="50" className="text-xs font-semibold py-2">50 Per Halaman</SelectItem>
 <SelectItem id="100" value="100" className="text-xs font-semibold py-2">100 Per Halaman</SelectItem>
 </SelectContent>
 </Select>
 </div>

 {/* Reset Filter Button - Soft Pastel Rose Squircle Icon Button with Tooltip */}
 {hasActiveFilters && (
 <div className="group relative inline-flex">
 <button
 type="button"
 title="Reset Filter"
 aria-label="Reset Filter"
 onClick={resetFilters}
 className="flex size-10 items-center justify-center rounded-xl bg-[#FFE4E6] text-[#E11D48] hover:bg-[#FECDD3] dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-900/80 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
 >
 <RefreshCcw className="size-5" />
 </button>
 <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
 Reset Filter
 </div>
 </div>
 )}
 </>
 )

 // Mobile Data Card Fallback Renderer
 const renderMobileCard = ({ row }) => (
 <div className="rounded-xl border border-emerald-200/80 bg-white p-4 shadow-xs dark:border-emerald-800/60 dark:bg-slate-900 space-y-3">
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-2.5">
 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 font-bold">
 <Building2 className="h-4 w-4" />
 </div>
 <div>
 <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{row.nama_divisi || '-'}</h4>
 <div className="flex items-center gap-2 mt-0.5">
 <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
 {row.unit_pendidikan || '-'}
 </span>
 <span className="text-xs text-slate-400 line-clamp-1">{row.aspek_pemantauan || '-'}</span>
 </div>
 </div>
 </div>
 <Badge color={STATUS_MAP[row.status_pemantauan]?.color || 'gray'} size="sm">
 {STATUS_MAP[row.status_pemantauan]?.label || row.status_pemantauan}
 </Badge>
 </div>

 <div className="space-y-1">
 <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
 <span>Capaian Kinerja Target</span>
 <span>{row.persentase_capaian || 0}%</span>
 </div>
 <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-50 dark:bg-emerald-950/40">
 <div
 className={`h-full rounded-full transition-all duration-300 ${Number(row.persentase_capaian) >= 80
 ? 'bg-emerald-500'
 : Number(row.persentase_capaian) >= 50
 ? 'bg-amber-500'
 : 'bg-rose-500'
 }`}
 style={{ width: `${Math.min(Number(row.persentase_capaian) || 0, 100)}%` }}
 />
 </div>
 </div>

 {row.catatan && (
 <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl italic">
 "{row.catatan}"
 </p>
 )}

 <div className="flex items-center justify-between pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60">
 <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
 <Calendar className="h-3 w-3" />
 {row.tanggal_pemantauan
 ? new Date(row.tanggal_pemantauan).toLocaleDateString('id-ID', {
 day: 'numeric',
 month: 'short',
 year: 'numeric',
 })
 : '-'}
 </span>
 <div className="flex items-center gap-1">
 <Button
 type="button"
 variant="ghost"
 size="xs"
 onClick={() => handleOpenEdit(row)}
 className="text-xs font-bold text-slate-600 hover:text-emerald-600"
 >
 Ubah
 </Button>
 <Button
 type="button"
 variant="ghost"
 size="xs"
 onClick={() => handleOpenDelete(row.id)}
 className="text-xs font-bold text-rose-600 hover:bg-rose-50"
 >
 Hapus
 </Button>
 </div>
 </div>
 </div>
 )

 const containerVariants = {
 hidden: { opacity: 0, y: 15 },
 visible: {
 opacity: 1,
 y: 0,
 transition: { duration: 0.35, staggerChildren: 0.08 },
 },
 }

 const itemVariants = {
 hidden: { opacity: 0, y: 12 },
 visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
 }

 return (
 <PageContainer maxW="7xl">
 <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 print:space-y-1 pb-12 print:pb-0">
 {/* Breadcrumb Navigation */}
 <motion.div variants={itemVariants} className="print:hidden">
 <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Monitoring Divisi' }]} />
 </motion.div>

 {/* Header Halaman Modern Hero Card */}
 <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 !bg-[#D5F2E3] p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:!bg-[#112a22] print:hidden">

 <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div className="flex items-start gap-4 min-w-0">
 <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
 
            <Layers className="h-6 w-6 text-white" />
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2.5 flex-wrap">
 <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
 Monitoring Divisi Sekolah
 </h1>
 <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold bg-emerald-600 text-white shadow-xs border border-emerald-500/40 dark:border-emerald-600/50">
 
                  <ShieldCheck className="h-3.5 w-3.5 text-white" />
 {isKepalaSekolah
 ? (currentUserUnit || 'Unit Anda')
 : isDivisi
 ? (filterUnit || 'Semua Unit (Kepsek & Guru)')
 : (filterUnit || (educationUnits.length > 0 ? `${educationUnits.length} Unit Pendidikan` : 'Seluruh Unit'))}
 </span>
 </div>
 <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 w-full leading-relaxed">
 {isDivisi
 ? 'Supervisi dan pemantauan kinerja Kepala Sekolah serta Pegawai & Guru di seluruh unit pendidikan (SD IT, SMP IT, SMA IT, Ponpes).'
 : 'Pemantauan terpadu ketercapaian target divisi operasional di seluruh unit pendidikan.'}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
 <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-100 px-3.5 py-1.5 text-xs font-black text-emerald-900 dark:border-emerald-800/60 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs">
 <Zap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
 <span>Supervisi Divisi</span>
 </div>
 </div>
 </div>
 </motion.div>

 {/* Role Access Scope Info Alert */}
 {/* <motion.div variants={itemVariants} className="print:hidden">
 {!isUnitRestricted ? (
 // <Alert status="info" className="rounded-xl border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50/90 dark:border-emerald-800/60 dark:bg-sky-950/40">
 // <ShieldCheck className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0" />
 // <AlertContent>
 // <AlertTitle className="text-xs font-extrabold text-sky-900 dark:text-sky-200">
 // Akses Hak Akses: Superadmin / Admin / Pengurus Yayasan
 // </AlertTitle>
 // <AlertDescription className="text-xs text-sky-700 dark:text-sky-300">
 // Anda dapat melakukan manajemen data monitoring divisi di <strong>seluruh unit pendidikan</strong> (SD IT, SMP IT, SMA IT, Pondok Pesantren). Gunakan filter unit di bawah untuk memilah data secara spesifik.
 // </AlertDescription>
 // </AlertContent>
 // </Alert>
 ) : (
 <Alert status="warning" className="rounded-xl border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/90 dark:border-emerald-800/60 dark:bg-amber-950/40">
 <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
 <AlertContent>
 <AlertTitle className="text-xs font-extrabold text-amber-900 dark:text-amber-200">
 Akses Terkunci Khusus Unit: {currentUserUnit}
 </AlertTitle>
 <AlertDescription className="text-xs text-amber-700 dark:text-amber-300">
 Sebagai Kepala Sekolah / Divisi Pendidikan, halaman ini secara otomatis terkunci untuk menampilkan dan menginput data monitoring khusus <strong>{currentUserUnit}</strong>.
 </AlertDescription>
 </AlertContent>
 </Alert>
 )}
 </motion.div> */}

 {/* Quick Filter Divisi Dropdown Selector (Menggantikan deretan pill panjang agar tampilan rapi & proporsional) */}
 <motion.div
 variants={itemVariants}
 className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 dark:bg-slate-900/50 p-3.5 shadow-2xs dark:border-emerald-800/60 dark:bg-slate-900/60 print:hidden"
 >
 <div className="flex items-center gap-3">
 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs shadow-sm">
 <Layers className="size-5" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <span className="text-xs font-black uppercase tracking-wider text-emerald-950 dark:text-emerald-300">
 Filter Cepat Divisi
 </span>
 <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
 {divisionOptions.length} Divisi Tersedia
 </span>
 </div>
 <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
 {filterDivisi ? (
 <>
 Menampilkan laporan untuk: <strong className="text-emerald-700 dark:text-emerald-300">{filterDivisi}</strong> ({filteredItems.length} data)
 </>
 ) : (
 <>Menampilkan seluruh divisi dan unit operasional ({combinedItems.length} total laporan)</>
 )}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2 w-full sm:w-auto">
 <div className="relative flex-1 sm:w-80">
 <Select
 value={filterDivisi || ''}
 onChange={(val) => {
 setFilterDivisi(String(val || ''))
 setPage(1)
 }}
 >
 <SelectTrigger className="w-full h-9 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3.5 text-xs font-bold text-slate-800 shadow-2xs transition-all hover:border-emerald-300 dark:hover:border-emerald-200/80 focus:border-emerald-200/80 focus:ring-2 focus:ring-emerald-600/20 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100">
 <SelectValue placeholder={`Semua Divisi (${combinedItems.length} Laporan)`} />
 </SelectTrigger>
 <SelectContent className="z-50 max-h-72 overflow-y-auto bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl shadow-2xl p-1.5 animate-in fade-in zoom-in-95">
 <SelectItem id="" className="text-xs font-bold py-2 text-emerald-700 dark:text-emerald-400">
 Semua Divisi ({combinedItems.length} Laporan)
 </SelectItem>
 {divisionOptions.map((div) => {
 const count = combinedItems.filter((i) => i.nama_divisi === div.name).length
 return (
 <SelectItem
 key={div.id || div.name}
 id={div.name}
 className="text-xs font-semibold py-2"
 >
 {div.name} {count > 0 ? `(${count})` : ''}
 </SelectItem>
 )
 })}
 </SelectContent>
 </Select>
 </div>

 {filterDivisi && (
 <button
 type="button"
 onClick={() => {
 setFilterDivisi('')
 setPage(1)
 }}
 className="h-9 px-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-all duration-150 cursor-pointer shadow-2xs shrink-0 dark:border-emerald-800/60 dark:bg-rose-950/40 dark:text-rose-300"
 title="Reset filter divisi"
 >
 Reset
 </button>
 )}
 </div>
 </motion.div>

 {/* KPI Stats Grid Complying with HEROUI_CARD_COMPONENT */}
 <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
 <KpiTintedCard
 label="Total Laporan Monitoring"
 value={totalCount}
 subtext="Supervisi aktif SIT"
 icon={Layers}
 tone="emerald"
 />
 <KpiTintedCard
 label="Capaian Rata-Rata"
 value={`${avgCapaian}%`}
 subtext="Akumulasi target"
 icon={TrendingUp}
 tone="blue"
 />
 <KpiTintedCard
 label="Target Sesuai / Tercapai"
 value={tercapaiCount}
 subtext="Indikator tuntas SOP"
 icon={CheckCircle2}
 tone="amber"
 />
 <KpiTintedCard
 label="Perlu Perhatian / Tindak Lanjut"
 value={perluPerhatianCount}
 subtext="Evaluasi pimpinan"
 icon={AlertTriangle}
 tone="rose"
 />
 </motion.div>

 {/* AppDataTable complying with HeroUI Benchmark */}
 <motion.div id="tabel-pemantauan-divisi" className="scroll-mt-6" variants={itemVariants}>
 <AppDataTable
 printableHeader={
 <div className="flex items-end justify-between border-b border-emerald-200/80 pb-1.5 text-slate-900">
 <div>
 <h1 className="text-base font-semibold uppercase tracking-tight text-slate-900 leading-tight">
 Laporan Monitoring & Supervisi Divisi Operasional SIT
 </h1>
 <p className="text-xs text-slate-700 font-semibold mt-0.5 leading-tight">
 Sekolah Islam Terpadu — Unit: {filterUnit || 'Semua Unit Pendidikan'} {filterDivisi ? `| Divisi: ${filterDivisi}` : ''}
 </p>
 </div>
 <div className="text-right text-[9px] text-slate-600 font-medium leading-tight space-y-0.5">
 <p>Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
 <p>Total Data: {filteredItems.length} Catatan Laporan</p>
 </div>
 </div>
 }
 title="Daftar Pemantauan Divisi Sekolah Islam Terpadu"
 description="Tabel rekam data riil, evaluasi ketercapaian indikator, dan catatan supervisi operasional antar divisi."
 columns={columns}
 data={paginatedItems}
 isLoading={isLoading}
 isError={isError}
 search={search}
 onSearchChange={setSearch}
 searchPlaceholder="Cari nama divisi, aspek pemantauan, petugas pengawas, atau unit..."
 actions={renderActionButtons}
 filters={renderFilterControls}
 hasActiveFilters={hasActiveFilters}
 onResetFilters={resetFilters}
 page={page}
 totalPages={pagination.totalPages}
 totalItems={pagination.totalRecords}
 itemsPerPage={perPage}
 onPageChange={setPage}
 renderMobileCard={renderMobileCard}
 />
 </motion.div>

 {/* Detail Modal (Hero UI Specification) */}
 <AppModal
 isOpen={Boolean(isDetailOpen && selectedRecord)}
 onClose={() => setIsDetailOpen(false)}
 title="Detail Pemantauan Divisi"
 badge="Detail Kinerja"
 description={selectedRecord ? `${selectedRecord.nama_divisi} · ${selectedRecord.unit_pendidikan}` : ''}
 icon={Building2}
 maxWidth="max-w-lg"
 footer={
 selectedRecord ? (
 <div className="flex w-full items-center justify-between gap-2">
 <button
 type="button"
 onClick={() => {
 const id = selectedRecord.id
 setIsDetailOpen(false)
 handleOpenDelete(id)
 }}
 className="inline-flex h-9.5 items-center justify-center rounded-xl border-2 border-rose-600 bg-rose-600 px-4 text-xs font-black text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 active:scale-95 transition-all cursor-pointer"
 >
 Hapus
 </button>
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => setIsDetailOpen(false)}
 className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
 >
 Tutup
 </button>
 <button
 type="button"
 onClick={() => {
 const rec = selectedRecord
 setIsDetailOpen(false)
 handleOpenEdit(rec)
 }}
 className="inline-flex h-9.5 items-center gap-1.5 rounded-xl border-2 border-emerald-600 bg-emerald-600 px-5 text-xs font-black text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer"
 >
 <Pencil className="size-3.5" />
 Ubah Data
 </button>
 </div>
 </div>
 ) : null
 }
 >
 {selectedRecord && (
 <div className="space-y-4 text-sm">
 {/* Live Metric Banner Card */}
 <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 bg-white dark:bg-[#1B2433] p-4 shadow-xs dark:border-emerald-800/60 dark:bg-slate-900/60">
 <div className="flex items-center justify-between gap-2">
 <div>
 <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
 Capaian Kinerja Target
 </p>
 <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
 {selectedRecord.persentase_capaian || 0}%
 </p>
 {selectedRecord.indikator_riil && (
 <p className="text-xs font-extrabold text-blue-600 dark:text-blue-400 mt-1">
 {selectedRecord.indikator_riil}
 </p>
 )}
 </div>
 <Badge color={STATUS_MAP[selectedRecord.status_pemantauan]?.color || 'gray'} size="md">
 {STATUS_MAP[selectedRecord.status_pemantauan]?.label || selectedRecord.status_pemantauan}
 </Badge>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
 <div>
 <span className="text-slate-500 block font-medium">Unit Pendidikan</span>
 <span className="font-extrabold text-slate-800 dark:text-slate-200">{selectedRecord.unit_pendidikan || '-'}</span>
 </div>
 <div>
 <span className="text-slate-500 block font-medium">Petugas Supervisi</span>
 <span className="font-extrabold text-slate-800 dark:text-slate-200">{selectedRecord.petugas_supervisi || '-'}</span>
 </div>
 <div className="col-span-2 pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60">
 <span className="text-slate-500 block font-medium">Aspek Pemantauan</span>
 <p className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{selectedRecord.aspek_pemantauan || '-'}</p>
 </div>
 {selectedRecord.catatan && (
 <div className="col-span-2 pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60">
 <span className="text-slate-500 block font-medium">Catatan / Rekomendasi Pengawas</span>
 <p className="text-slate-700 dark:text-slate-300 italic mt-0.5 font-medium">"{selectedRecord.catatan}"</p>
 </div>
 )}
 </div>
 </div>
 )}
 </AppModal>

 {/* Form Modal (Create / Edit - Hero UI) */}
 <PemantauanDivisiFormModal
 isOpen={isFormOpen}
 onClose={() => setIsFormOpen(false)}
 onSubmit={handleFormSubmit}
 initialData={selectedRecord}
 isSubmitting={tambah.isPending || ubah.isPending}
 currentUserUnit={currentUserUnit}
 isUnitRestricted={isUnitRestricted}
 isDivisi={isDivisi}
 unitOptions={educationUnits}
 divisionOptions={divisionOptions}
 />

 {/* Impor CSV Modal */}
 <ImporDivisiModal
 isOpen={isImportOpen}
 onClose={() => setIsImportOpen(false)}
 onImportSuccess={handleImportSuccess}
 />

 {/* Cetak / Unduh PDF Option Modal */}
 <PrintOptionModal
 isOpen={isPrintModalOpen}
 onClose={() => setIsPrintModalOpen(false)}
 title="Opsi Cetak Pemantauan Divisi"
 subtitle={`Pilih metode pencetakan atau unduh PDF laporan supervisi (${filteredItems.length} data)`}
 onPrint={handlePrintClean}
 onDownloadPdf={handleDownloadPdf}
 previewHeaders={['No', 'Unit Pendidikan', 'Divisi', 'Aspek Pemantauan', 'Capaian', 'Status', 'Tanggal', 'Supervisor']}
 previewRows={filteredItems.slice(0, 5).map((item, idx) => [
 idx + 1,
 item.unit_pendidikan || '-',
 item.nama_divisi || '-',
 item.aspek_pemantauan || '-',
 `${item.persentase_capaian || 0}%`,
 item.status_pemantauan || '-',
 item.tanggal_pemantauan || '-',
 item.petugas_supervisi || '-',
 ])}
 />

 {/* Delete Confirmation Alert Dialog (HeroUI Harmonized) */}
 <AppModal
 isOpen={isDeleteOpen}
 onClose={() => {
 if (!hapus.isPending) {
 setIsDeleteOpen(false)
 setDeleteTargetId(null)
 }
 }}
 disableBackdropClose={hapus.isPending}
 hideCloseButton={hapus.isPending}
 variant="danger"
 badge="Hapus Permanen"
 title="Hapus Laporan Supervisi?"
 icon={Trash2}
 maxWidth="max-w-md"
 zIndex="z-[70]"
 footer={
 <div className="flex w-full items-center justify-end gap-2">
 <button
 type="button"
 onClick={() => {
 setIsDeleteOpen(false)
 setDeleteTargetId(null)
 }}
 disabled={hapus.isPending}
 className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
 >
 Batal
 </button>
 <button
 type="button"
 disabled={hapus.isPending}
 onClick={handleConfirmDelete}
 className="inline-flex h-9.5 items-center gap-1.5 rounded-xl border-2 border-rose-600 bg-rose-600 px-5 text-xs font-black text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
 >
 <Trash2 className="size-4" />
 {hapus.isPending ? 'Menghapus...' : 'Ya, Hapus Data'}
 </button>
 </div>
 }
 >
 <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
 Laporan supervisi divisi ini akan dihapus secara permanen dari database. Tindakan ini tidak dapat dipulihkan. Apakah Anda yakin ingin melanjutkan?
 </p>
 </AppModal>
 </motion.div>

 {/* Smart Floating Scroll Navigator */}
 <SmartScrollFab targetId="tabel-pemantauan-divisi" downTooltip="Langsung ke Tabel Supervisi" />
 </PageContainer>
 )
}
