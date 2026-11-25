import React, { useState, useEffect, useMemo } from 'react'
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
  BookOpen,
  Printer,
  CheckCircle2,
  XCircle,
  Tag,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Trash2,
  X,
  ChevronDown,
  RefreshCcw,
  Building2,
  Calendar,
  Download,
  Upload,
  Plus,
  FileSpreadsheet,
  FileText,
  Layers,
  GraduationCap
} from 'lucide-react'
import HeroUiFilterSelect from '../components/ui/HeroUiFilterSelect'
import HeroUiHeader from '../components/ui/HeroUiHeader'
import {
  api
} from '../services/api'
import {
  masterKurikulumService
} from '../services/masterKurikulumService'
import {
  tahunAjaranService
} from '../services/tahunAjaranService'
import KurikulumTable from '../components/kurikulum/KurikulumTable'
import KurikulumFormModal from '../components/kurikulum/KurikulumFormModal'
import KurikulumDetailModal from '../components/kurikulum/KurikulumDetailModal'
import KurikulumImportModal from '../components/kurikulum/KurikulumImportModal'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppModal from '../components/app/AppModal'
import AppDataTable from '../components/app/AppDataTable'
import {
  useToast,
  KpiStatCard,
  PageToolbarActions
} from '../components/app'
import {
  printCleanTable,
  downloadPdfTable
} from '../utils/printHelper'
import {
  handleApiExport
} from '../utils/exportUtils'
import {
  useAuthStore
} from '../stores/authStore'
import {
  getUserRoleLevel,
  ROLE_LEVELS
} from '../auth/portalResolver'
import {
  PrintOptionModal
} from '../components/master-data'
import {
  useDebounce
} from '../hooks/useDebounce'
import {
  cn
} from '../lib/utils'

const JENIS_LIST = ['SIT', 'Merdeka', 'Nasional', 'Pesantren', 'Lokal', 'Lainnya']
const JENJANG_LIST = ['TK', 'PAUD', 'SD', 'MI', 'SMP', 'MTs', 'SMA', 'MA', 'Pesantren']

const containerVariants = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: { staggerChildren: 0.08, delayChildren: 0.05 },
 },
}

const itemVariants = {
 hidden: { opacity: 0, y: 16 },
 visible: {
 opacity: 1,
 y: 0,
 transition: { type: 'spring', stiffness: 350, damping: 26 },
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


function getJenjangFromUnit(unit) {
 if (!unit) return ''
 const str = `${unit.code || ''} ${unit.level || ''} ${unit.name || ''} ${unit.nama || ''} ${unit.tingkat || ''}`.toUpperCase()

 if (str.includes('TAUD') || str.includes('PAUD')) return 'PAUD'
 if (str.includes('TK')) return 'TK'
 if (str.includes('MIT') || str.includes(' MI ') || str.endsWith(' MI') || str.startsWith('MI ')) return 'MI'
 if (str.includes('SD')) return 'SD'
 if (str.includes('MTS')) return 'MTs'
 if (str.includes('SMP')) return 'SMP'
 if (str.includes('MA') && !str.includes('SMA') && !str.includes('MAHAD')) return 'MA'
 if (str.includes('SMA')) return 'SMA'
 if (str.includes('PESANTREN') || str.includes('PONPES') || str.includes('MAHAD')) return 'Pesantren'

 return ''
}

export default function MasterKurikulumPage({ embedded = false, hidePageHeader = false, hideBreadcrumb = false }) {
 const queryClient = useQueryClient()

 // User Auth & Role Scoping
 const user = useAuthStore((state) => state.user)
 const userRoles = useMemo(() => {
 if (!user) return []
 const rawRoles = user.roles || (user.role ? [user.role] : []) || user.role_names || []
 const list = Array.isArray(rawRoles) ? rawRoles : [rawRoles]
 return list.map((r) => (typeof r === 'string' ? r : r?.name || r?.role_name || r?.nama || ''))
 }, [user])

 const userLevel = useMemo(() => getUserRoleLevel(user), [user])

 const canViewAllUnits = useMemo(() => {
 if (!user || userRoles.length === 0) return false
 return userLevel <= ROLE_LEVELS.YAYASAN // Level 1-2: Admin Sistem & Yayasan
 }, [user, userRoles, userLevel])

 const userPermissions = useMemo(
 () => (Array.isArray(user?.permissions) ? user.permissions : []),
 [user]
 )

 const canCreate = useMemo(() => {
 if (!user) return false
 return (
 userLevel <= ROLE_LEVELS.ADMIN ||
 userPermissions.includes('academic.curriculum.create') ||
 userPermissions.includes('sistem.master_data')
 )
 }, [user, userLevel, userPermissions])

 const canUpdate = useMemo(() => {
 if (!user) return false
 return (
 userLevel <= ROLE_LEVELS.ADMIN ||
 userPermissions.includes('academic.curriculum.update') ||
 userPermissions.includes('sistem.master_data')
 )
 }, [user, userLevel, userPermissions])

 const canDelete = useMemo(() => {
 if (!user) return false
 return (
 userLevel <= ROLE_LEVELS.ADMIN ||
 userPermissions.includes('academic.curriculum.delete') ||
 userPermissions.includes('sistem.master_data')
 )
 }, [user, userLevel, userPermissions])

 const canExport = useMemo(() => {
 if (!user) return false
 return (
 userLevel <= ROLE_LEVELS.ADMIN ||
 userPermissions.includes('academic.curriculum.view') ||
 userPermissions.includes('report.export') ||
 userPermissions.includes('sistem.master_data')
 )
 }, [user, userLevel, userPermissions])

 const canImport = canCreate || canUpdate

 // Fetch Education Units
 const { data: unitsData = [] } = useQuery({
 queryKey: ['education-units-list-kurikulum'],
 queryFn: async () => {
 const res = await api.get('/education-units')
 return res.data?.data || res.data || []
 },
 staleTime: 60000,
 })
 const educationUnits = Array.isArray(unitsData) ? unitsData : unitsData?.items || []

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
 user?.employee?.unit?.id,
 user?.employee?.education_unit?.id,
 user?.school_info?.id,
 ].filter(Boolean)

 return candidateIds.length > 0 ? String(candidateIds[0]) : null
 }, [user])

 const userUnitName = useMemo(() => {
 const candidateNames = [
 typeof user?.education_unit === 'string' ? user.education_unit : null,
 typeof user?.unit === 'string' ? user.unit : null,
 user?.unit_name,
 user?.education_unit_name,
 user?.unit_pendidikan_name,
 user?.unit?.name || user?.unit?.nama,
 user?.education_unit?.name || user?.education_unit?.nama,
 user?.employee?.unit?.name || user?.employee?.education_unit?.name,
 user?.school_info?.nama || user?.school_info?.name,
 ]
 .filter(Boolean)
 .map((s) => String(s).toLowerCase().trim())

 return candidateNames.length > 0 ? candidateNames[0] : ''
 }, [user])

 const availableUnitOptions = useMemo(() => {
 const allUnits = educationUnits || []
 if (canViewAllUnits) {
 return allUnits
 }

 if (userUnitId) {
 const filtered = allUnits.filter((u) => String(u.id) === String(userUnitId))
 if (filtered.length > 0) return filtered
 }

 if (userUnitName) {
 const matched = allUnits.filter((u) => {
 const uName = String(u.name || u.nama || '').toLowerCase().trim()
 const uCode = String(u.code || u.kode || '').toLowerCase().trim()
 return (
 uName === userUnitName ||
 uCode === userUnitName ||
 userUnitName.includes(uName) ||
 uName.includes(userUnitName)
 )
 })
 if (matched.length > 0) return matched
 }

 return allUnits.length > 0 ? [allUnits[0]] : []
 }, [educationUnits, canViewAllUnits, userUnitId, userUnitName])

 const effectiveUserUnitId = useMemo(() => {
 if (canViewAllUnits) return ''
 if (userUnitId) return String(userUnitId)
 if (availableUnitOptions.length > 0) return String(availableUnitOptions[0].id)
 return ''
 }, [canViewAllUnits, userUnitId, availableUnitOptions])

 // Filter & Pagination States
 const [search, setSearch] = useState('')
 const debouncedSearch = useDebounce(search, 350)
 const [selectedUnitFilter, setSelectedUnitFilter] = useState('')
 const [selectedTahunFilter, setSelectedTahunFilter] = useState('')
 const [selectedStatusFilter, setSelectedStatusFilter] = useState('')
 const [selectedJenisFilter, setSelectedJenisFilter] = useState('')
 const [selectedJenjangFilter, setSelectedJenjangFilter] = useState('')
 const [denganSampahFilter, setDenganSampahFilter] = useState('')
 const [page, setPage] = useState(1)
 const perPage = 15

 // Fetch Academic Years options from database
 const { data: tahunAjaranOptions = [] } = useQuery({
 queryKey: ['master-kurikulum-tahun-ajaran-options'],
 queryFn: () => tahunAjaranService.getDropdown(),
 staleTime: 5 * 60 * 1000,
 })

 // Toast Notifications
 const toast = useToast()
 const pushToast = (title, message, type = 'success') => {
 toast(title, message, type)
 }

 // Delete & Restore Confirmation state
 const [deleteTarget, setDeleteTarget] = useState(null)
 const [restoreTarget, setRestoreTarget] = useState(null)

 const activeUnitObj = useMemo(() => {
 const targetId = selectedUnitFilter || effectiveUserUnitId
 if (!targetId) return null
 return (educationUnits || []).find((u) => String(u.id) === String(targetId)) || null
 }, [selectedUnitFilter, effectiveUserUnitId, educationUnits])

 const activeUnitJenjang = useMemo(() => {
 if (activeUnitObj) {
 const fromUnit = getJenjangFromUnit(activeUnitObj)
 if (fromUnit) return fromUnit
 }
 const candidateStr = [
 typeof user?.education_unit === 'string' ? user.education_unit : null,
 typeof user?.unit === 'string' ? user.unit : null,
 user?.unit_name,
 user?.education_unit_name,
 user?.unit_pendidikan_name,
 user?.unit?.name || user?.unit?.nama || user?.unit?.code,
 user?.education_unit?.name || user?.education_unit?.nama || user?.education_unit?.code,
 user?.employee?.unit?.name || user?.employee?.education_unit?.name,
 user?.school_info?.nama || user?.school_info?.name,
 ].filter(Boolean).join(' ')
 return getJenjangFromUnit({ name: candidateStr, code: candidateStr })
 }, [activeUnitObj, user])

 const availableJenjangOptions = useMemo(() => {
 // Jika filter Unit dipilih secara spesifik
 if (selectedUnitFilter) {
 const selectedUnit = availableUnitOptions.find((u) => String(u.id) === String(selectedUnitFilter))
 const jenjangFromSelected = selectedUnit ? getJenjangFromUnit(selectedUnit) : ''
 if (jenjangFromSelected) {
 const matched = JENJANG_LIST.filter((j) => j.toLowerCase() === jenjangFromSelected.toLowerCase())
 if (matched.length > 0) return matched
 }
 } else if (!canViewAllUnits && activeUnitJenjang) {
 const matched = JENJANG_LIST.filter((j) => j.toLowerCase() === activeUnitJenjang.toLowerCase())
 if (matched.length > 0) return matched
 }
 // Jika sedang memilih "Semua Unit" atau tidak terkunci, tampilkan seluruh jenjang yang valid
 return JENJANG_LIST
 }, [selectedUnitFilter, availableUnitOptions, canViewAllUnits, activeUnitJenjang])

 const availableJenisOptions = useMemo(() => {
 if (!selectedUnitFilter) return JENIS_LIST
 const selectedUnit = availableUnitOptions.find((u) => String(u.id) === String(selectedUnitFilter))
 if (!selectedUnit) return JENIS_LIST
 const str = `${selectedUnit.code || ''} ${selectedUnit.name || ''}`.toUpperCase()
 if (str.includes('PESANTREN') || str.includes('PONPES') || str.includes('MAHAD')) {
 return ['Pesantren', 'SIT', 'Merdeka', 'Nasional', 'Lokal', 'Lainnya']
 }
 return JENIS_LIST
 }, [selectedUnitFilter, availableUnitOptions])

 useEffect(() => {
 if (!canViewAllUnits && effectiveUserUnitId && selectedUnitFilter !== effectiveUserUnitId) {
 setSelectedUnitFilter(effectiveUserUnitId)
 }
 }, [canViewAllUnits, effectiveUserUnitId, selectedUnitFilter])

 // Modal States
 const [isFormModalOpen, setIsFormModalOpen] = useState(false)
 const [selectedForEdit, setSelectedForEdit] = useState(null)

 const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
 const [selectedForDetail, setSelectedForDetail] = useState(null)

 const [isImportModalOpen, setIsImportModalOpen] = useState(false)
 const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
 const [showExportModal, setShowExportModal] = useState(false)
 const [exportFormat, setExportFormat] = useState('xlsx')
 const [isExporting, setIsExporting] = useState(false)

 // Query Data List
 const {
 data: responseData = {},
 isLoading,
 isFetching,
 isError,
 refetch,
 } = useQuery({
 queryKey: [
 'master-kurikulum-list',
 page,
 perPage,
 debouncedSearch,
 selectedUnitFilter,
 selectedTahunFilter,
 selectedStatusFilter,
 selectedJenisFilter,
 selectedJenjangFilter,
 denganSampahFilter,
 canViewAllUnits,
 effectiveUserUnitId,
 ],
 queryFn: () => {
 const targetUnitId = !canViewAllUnits ? (effectiveUserUnitId || selectedUnitFilter) : selectedUnitFilter
 const targetJenjang = selectedJenjangFilter || undefined

 return masterKurikulumService.getDaftar({
 page,
 per_page: perPage,
 search: debouncedSearch,
 unit_pendidikan_id: targetUnitId || undefined,
 tahun_ajaran_id: selectedTahunFilter || undefined,
 status: selectedStatusFilter,
 jenis_kurikulum: selectedJenisFilter,
 jenjang: targetJenjang || undefined,
 dengan_sampah: denganSampahFilter,
 order_by: 'created_at',
 order_dir: 'desc',
 })
 },
 })

 const listData = responseData?.data || []
 const meta = responseData?.meta || {}
 const stats = responseData?.statistik || {}
 const statsValue = (value) => (isError ? '—' : value)

 // Mutations with Zero-SweetAlert2 (ToastStack)
 const simpanMutation = useMutation({
 mutationFn: (payload) => masterKurikulumService.tambah(payload),
 onSuccess: (res) => {
 queryClient.invalidateQueries({ queryKey: ['master-kurikulum-list'] })
 queryClient.invalidateQueries({ queryKey: ['master-kurikulum-stats'] })
 setIsFormModalOpen(false)
 pushToast('Berhasil Ditambahkan', res?.message || 'Data master kurikulum baru berhasil disimpan.', 'success')
 },
 onError: (err) => {
 const msg = err.response?.data?.message || 'Gagal menyimpan data master kurikulum.'
 pushToast('Gagal Menyimpan', msg, 'error')
 },
 })

 const ubahMutation = useMutation({
 mutationFn: ({ id, payload }) => masterKurikulumService.ubah({ id, payload }),
 onSuccess: (res) => {
 queryClient.invalidateQueries({ queryKey: ['master-kurikulum-list'] })
 queryClient.invalidateQueries({ queryKey: ['master-kurikulum-stats'] })
 setIsFormModalOpen(false)
 setSelectedForEdit(null)
 pushToast('Berhasil Diperbarui', res?.message || 'Perubahan data master kurikulum berhasil disimpan.', 'success')
 },
 onError: (err) => {
 const msg = err.response?.data?.message || 'Gagal memperbarui data master kurikulum.'
 pushToast('Gagal Memperbarui', msg, 'error')
 },
 })

 const hapusMutation = useMutation({
 mutationFn: (id) => masterKurikulumService.hapus(id),
 onSuccess: (res) => {
 queryClient.invalidateQueries({ queryKey: ['master-kurikulum-list'] })
 queryClient.invalidateQueries({ queryKey: ['master-kurikulum-stats'] })
 setDeleteTarget(null)
 pushToast('Berhasil Dihapus', res?.message || 'Data kurikulum berhasil dipindahkan ke arsip sampah.', 'success')
 },
 onError: (err) => {
 const msg = err.response?.data?.message || 'Gagal menghapus data kurikulum.'
 pushToast('Gagal Menghapus', msg, 'error')
 },
 })

 const pulihkanMutation = useMutation({
 mutationFn: (id) => masterKurikulumService.pulihkan(id),
 onSuccess: (res) => {
 queryClient.invalidateQueries({ queryKey: ['master-kurikulum-list'] })
 queryClient.invalidateQueries({ queryKey: ['master-kurikulum-stats'] })
 setRestoreTarget(null)
 pushToast('Berhasil Dipulihkan', res?.message || 'Data kurikulum berhasil diaktifkan kembali.', 'success')
 },
 onError: (err) => {
 const msg = err.response?.data?.message || 'Gagal memulihkan data kurikulum.'
 pushToast('Gagal Memulihkan', msg, 'error')
 },
 })

 const importMutation = useMutation({
 mutationFn: (rows) => masterKurikulumService.prosesImport(rows),
 onSuccess: (res) => {
 queryClient.invalidateQueries({ queryKey: ['master-kurikulum-list'] })
 queryClient.invalidateQueries({ queryKey: ['master-kurikulum-stats'] })

 const payload = res?.data || {}
 const berhasil = payload.berhasil ?? 0
 const gagal = payload.gagal ?? 0
 const errors = payload.errors || []

 if (gagal > 0 && berhasil === 0) {
 pushToast('Impor Gagal', errors[0] || 'Semua baris data gagal diproses.', 'error')
 } else if (gagal > 0 && berhasil > 0) {
 setIsImportModalOpen(false)
 pushToast('Impor Sebagian', `Berhasil: ${berhasil}, Gagal: ${gagal}. ${errors.slice(0, 2).join('; ')}`, 'warning')
 } else {
 setIsImportModalOpen(false)
 pushToast('Impor Selesai', res?.message || `Semua data (${berhasil}) berhasil diimpor ke sistem.`, 'success')
 }
 },
 onError: (err) => {
 const msg = err.response?.data?.message || 'Gagal memproses impor data.'
 pushToast('Error Impor', msg, 'error')
 },
 })

 // Handlers
 const handleOpenFormTambah = () => {
 setSelectedForEdit(null)
 setIsFormModalOpen(true)
 }

 const handleOpenFormEdit = (item) => {
 setSelectedForEdit(item)
 setIsFormModalOpen(true)
 }

 const handleOpenDetail = (item) => {
 setSelectedForDetail(item)
 setIsDetailModalOpen(true)
 }

 const handleConfirmDelete = (item) => {
 setDeleteTarget(item)
 }

 const handleConfirmRestore = (item) => {
 setRestoreTarget(item)
 }

 const handleFormSubmit = (payload) => {
 if (selectedForEdit) {
 ubahMutation.mutate({ id: selectedForEdit.id, payload })
 } else {
 simpanMutation.mutate(payload)
 }
 }

 const handleResetFilters = () => {
 setSearch('')
 setSelectedUnitFilter(canViewAllUnits ? '' : effectiveUserUnitId)
 setSelectedTahunFilter('')
 setSelectedStatusFilter('')
 setSelectedJenisFilter('')
 setSelectedJenjangFilter('')
 setDenganSampahFilter('')
 setPage(1)
 }

 const handleProcessExport = async () => {
 try {
 setIsExporting(true)
 await handleApiExport({
 endpoint: '/master/kurikulum/export',
 params: {
 search: debouncedSearch,
 unit_pendidikan_id: selectedUnitFilter || (!canViewAllUnits ? effectiveUserUnitId : undefined),
 tahun_ajaran_id: selectedTahunFilter || undefined,
 status: selectedStatusFilter,
 jenis_kurikulum: selectedJenisFilter,
 jenjang: selectedJenjangFilter,
 format: exportFormat,
 },
 title: 'Ekspor Data Master Kurikulum',
 defaultFilename: `data_master_kurikulum_${exportFormat}`,
 })
 setShowExportModal(false)
 pushToast('Export Berhasil', `Data kurikulum berhasil diekspor (.${exportFormat}).`, 'success')
 } catch (err) {
 pushToast(
 'Gagal Export',
 err?.response?.data?.message || err?.message || 'Terjadi kesalahan saat mengekspor data.',
 'error'
 )
 } finally {
 setIsExporting(false)
 }
 }

 const shouldHideBreadcrumb = embedded || hideBreadcrumb
 const shouldHideHeader = embedded || hidePageHeader

 const pageActions = (
 <PageToolbarActions
 onPrint={canExport ? () => setIsPrintModalOpen(true) : undefined}
 onImport={canImport ? () => setIsImportModalOpen(true) : undefined}
 onExport={canExport ? () => setShowExportModal(true) : undefined}
 primaryAction={canCreate ? {
 label: 'Tambah Kurikulum',
 onClick: handleOpenFormTambah,
 } : null}
 />
 )

 const hasActiveFilters = Boolean(
 debouncedSearch ||
 (selectedUnitFilter && selectedUnitFilter !== (canViewAllUnits ? '' : effectiveUserUnitId)) ||
 selectedTahunFilter ||
 selectedJenisFilter ||
 selectedJenjangFilter ||
 selectedStatusFilter ||
 denganSampahFilter
 )

 return (
 <PageContainer maxW="7xl">
 {/* ── Print / PDF Report Modal ── */}
 <PrintOptionModal
 isOpen={isPrintModalOpen}
 onClose={() => setIsPrintModalOpen(false)}
 title="Kurikulum"
 onPrint={() => {
 printCleanTable({
 title: 'Laporan Master Data Kurikulum',
 subtitle: 'Daftar Kurikulum Pendidikan Sekolah Islam Terpadu',
 headers: ['NO', 'KODE', 'NAMA KURIKULUM', 'JENIS', 'JENJANG', 'UNIT PENDIDIKAN', 'TAHUN AJARAN', 'STATUS'],
 rows: listData.map((row, i) => [
 i + 1,
 row.kode_kurikulum || '-',
 row.nama_kurikulum || '-',
 row.jenis_kurikulum || '-',
 row.jenjang || '-',
 row.unit_pendidikan?.name || row.unit_pendidikan || '-',
 row.tahun_ajaran?.nama || row.tahun_ajaran || '-',
 row.status ? 'Aktif' : 'Nonaktif',
 ]),
 })
 }}
 onDownload={() => {
 downloadPdfTable({
 title: 'Laporan Master Data Kurikulum',
 subtitle: 'Daftar Kurikulum Pendidikan Sekolah Islam Terpadu',
 headers: ['NO', 'KODE', 'NAMA KURIKULUM', 'JENIS', 'JENJANG', 'UNIT PENDIDIKAN', 'TAHUN AJARAN', 'STATUS'],
 rows: listData.map((row, i) => [
 i + 1,
 row.kode_kurikulum || row.code || row.kode || '-',
 row.nama_kurikulum || row.name || row.nama || '-',
 row.jenis_kurikulum || row.jenis || '-',
 row.jenjang || '-',
 row.unit_pendidikan?.name || row.unit_pendidikan?.nama || row.unit_name || '-',
 row.tahun_ajaran?.nama || row.tahun_ajaran?.name || '-',
 row.status ? 'Aktif' : 'Nonaktif',
 ]),
 filename: 'laporan_master_kurikulum.pdf',
 })
 }}
 />

 <motion.div
 variants={containerVariants}
 initial="hidden"
 animate="visible"
 className="space-y-6"
 >
 {/* Breadcrumb */}
 {!shouldHideBreadcrumb && (
 <motion.div variants={itemVariants}>
 <AppBreadcrumb items={[{ label: 'Master Data', to: '/dashboard/master-kurikulum' }, { label: 'Data Kurikulum' }]} />
 </motion.div>
 )}

 {/* ── HeroUI Modern Hero Header Card ─────────────────────────── */}
      {!shouldHideHeader && (
        <div className="mb-6">
          <HeroUiHeader
            title="Master Data Kurikulum SIT"
            subtitle="Kelola seluruh kurikulum pendidikan, integrasi standar SIT & Nasional, serta pengaturan jenjang setiap unit pendidikan."
            badge="Kurikulum Terpadu"
            roleTag="Manajemen Kurikulum"
            icon={BookOpen}
          />
        </div>
      )}

      {/* ── 4-Kartu Ringkasan KPI Multi-Tone ──────────────────────────── */}
 <motion.div variants={itemVariants}>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <ModernKpiCard
 icon={BookOpen}
 label="Total Kurikulum"
 value={isLoading ? '...' : Number(statsValue(stats.total ?? meta.total ?? listData.length)).toLocaleString('id-ID')}
 tag={`${stats.total ?? listData.length} Terdaftar`}
 subtext="Seluruh kurikulum SIT"
 tone="emerald"
 />
 <ModernKpiCard
 icon={CheckCircle2}
 label="Kurikulum Aktif"
 value={isLoading ? '...' : Number(statsValue(stats.aktif ?? 0)).toLocaleString('id-ID')}
 tag={`${stats.aktif ?? 0} Aktif`}
 subtext="Sedang diberlakukan"
 tone="teal"
 />
 <ModernKpiCard
 icon={XCircle}
 label="Nonaktif / Arsip"
 value={isLoading ? '...' : Number(statsValue(stats.tidak_aktif ?? 0)).toLocaleString('id-ID')}
 tag={`${stats.tidak_aktif ?? 0} Arsip`}
 subtext="Tidak aktif di unit"
 tone="amber"
 />
 <ModernKpiCard
 icon={Tag}
 label="Jenjang Pendidikan"
 value={isLoading ? '...' : `${availableJenjangOptions.length}`}
 tag={`${availableJenjangOptions.length} Jenjang`}
 subtext="Cakupan jenjang sekolah"
 tone="indigo"
 />
 </div>
 </motion.div>

 {/* ── AppDataTable Container Identik Benchmark StudentsPage ── */}
 <motion.div variants={itemVariants}>
 <AppDataTable
 title="Daftar Kurikulum"
 icon={BookOpen}
 iconClassName="bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm"
 actionColumnLabel=""
 description="Data kurikulum pendidikan sesuai filter dan kewenangan pengguna."
 countLabel={`${Number(meta.total ?? listData.length).toLocaleString('id-ID')} Kurikulum`}
 actions={pageActions}
 search={search}
 onSearchChange={(value) => {
 setSearch(value)
 setPage(1)
 }}
 filters={
 <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-2.5 w-full">
 {/* Filter Unit Pendidikan */}
 <HeroUiFilterSelect
 value={selectedUnitFilter}
 onChange={(val) => {
 setSelectedUnitFilter(val)
 setPage(1)
 }}
 options={[
 ...(canViewAllUnits ? [{ value: '', label: 'Semua Unit Pendidikan' }] : []),
 ...availableUnitOptions.map((unit) => ({
 value: String(unit.id),
 label: unit.name || unit.nama,
 })),
 ]}
 disabled={!canViewAllUnits && availableUnitOptions.length <= 1}
 placeholder="Semua Unit Pendidikan"
 icon={Building2}
 ariaLabel="Filter unit pendidikan"
 size="sm"
 searchable
 className="w-full sm:w-auto min-w-[150px]"
 />

 {/* Filter Tahun Ajaran */}
 <HeroUiFilterSelect
 value={selectedTahunFilter}
 onChange={(val) => {
 setSelectedTahunFilter(val)
 setPage(1)
 }}
 options={[
 { value: '', label: 'Semua Tahun Ajaran' },
 ...tahunAjaranOptions.map((tahun) => ({
 value: String(tahun.id),
 label: `${tahun.name || tahun.nama}${tahun.is_active ? ' (Aktif)' : ''}`,
 })),
 ]}
 placeholder="Semua Tahun Ajaran"
 icon={Calendar}
 ariaLabel="Filter tahun ajaran"
 size="sm"
 searchable
 className="w-full sm:w-auto min-w-[150px]"
 />

 {/* Filter Jenjang Kurikulum */}
 <HeroUiFilterSelect
 value={selectedJenjangFilter}
 onChange={(val) => {
 setSelectedJenjangFilter(val)
 setPage(1)
 }}
 options={[
 { value: '', label: 'Semua Jenjang' },
 ...availableJenjangOptions.map((j) => ({ value: j, label: j })),
 ]}
 placeholder="Semua Jenjang"
 icon={GraduationCap}
 ariaLabel="Filter jenjang kurikulum"
 size="sm"
 searchable
 className="w-full sm:w-auto min-w-[140px]"
 />

 {/* Filter Jenis Kurikulum */}
 <HeroUiFilterSelect
 value={selectedJenisFilter}
 onChange={(val) => {
 setSelectedJenisFilter(val)
 setPage(1)
 }}
 options={[
 { value: '', label: 'Semua Jenis' },
 ...availableJenisOptions.map((j) => ({ value: j, label: j })),
 ]}
 placeholder="Semua Jenis"
 icon={Layers}
 ariaLabel="Filter jenis kurikulum"
 size="sm"
 searchable
 className="w-full sm:w-auto min-w-[140px]"
 />

 {/* Filter Status */}
 <HeroUiFilterSelect
 value={selectedStatusFilter}
 onChange={(val) => {
 setSelectedStatusFilter(val)
 setPage(1)
 }}
 options={[
 { value: '', label: 'Semua Status' },
 { value: 'aktif', label: 'Aktif' },
 { value: 'tidak_aktif', label: 'Nonaktif' },
 ]}
 placeholder="Semua Status"
 icon={CheckCircle2}
 ariaLabel="Filter status kurikulum"
 size="sm"
 className="w-full sm:w-auto min-w-[130px]"
 />

 {/* Filter Data Terhapus */}
 <HeroUiFilterSelect
 value={denganSampahFilter}
 onChange={(val) => {
 setDenganSampahFilter(val)
 setPage(1)
 }}
 options={[
 { value: '', label: 'Data Aktif' },
 { value: 'true', label: 'Termasuk Terhapus' },
 ]}
 placeholder="Status Data"
 icon={Trash2}
 ariaLabel="Filter data terhapus"
 size="sm"
 className="w-full sm:w-auto min-w-[140px]"
 />

 {/* Reset Filter Button */}
 {hasActiveFilters && (
 <button
 type="button"
 onClick={handleResetFilters}
 className="h-9 w-full sm:w-auto sm:ml-auto justify-center px-3 inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 transition cursor-pointer"
 >
 <RefreshCcw className="size-3.5" />
 <span>Reset</span>
 </button>
 )}
 </div>
 }
 onResetFilters={handleResetFilters}
 hasActiveFilters={hasActiveFilters}
 isLoading={isLoading || isFetching}
 isError={isError}
 errorTitle="Data kurikulum gagal dimuat"
 errorMessage="Periksa koneksi server kemudian coba kembali."
 onRetry={refetch}
 isEmpty={!isLoading && !isFetching && !isError && listData.length === 0}
 emptyTitle="Kurikulum tidak ditemukan"
 emptyDescription="Tidak ada data kurikulum yang cocok dengan kriteria filter."
 page={page}
 totalPages={meta.last_page || 1}
 totalItems={meta.total || listData.length}
 itemsPerPage={perPage}
 onPageChange={setPage}
 meta={{
 total: meta.total ?? listData.length,
 from: meta.from ?? (listData.length ? (page - 1) * perPage + 1 : 0),
 to: meta.to ?? ((page - 1) * perPage + listData.length),
 last_page: meta.last_page ?? 1,
 current_page: meta.current_page ?? page,
 per_page: meta.per_page ?? perPage,
 }}
 serverControlled
 renderTable={() => (
 <KurikulumTable
 data={listData}
 page={page}
 perPage={perPage}
 onDetail={handleOpenDetail}
 onEdit={canUpdate ? handleOpenFormEdit : undefined}
 onDelete={canDelete ? handleConfirmDelete : undefined}
 onRestore={canDelete ? handleConfirmRestore : undefined}
 />
 )}
 />
 </motion.div>
 </motion.div>

 {/* ── Form Modal Tambah / Edit ──────────────────────────────────── */}
 <KurikulumFormModal
 isOpen={isFormModalOpen}
 onClose={() => setIsFormModalOpen(false)}
 onSubmit={handleFormSubmit}
 initialData={selectedForEdit}
 isSubmitting={simpanMutation.isPending || ubahMutation.isPending}
 availableUnitOptions={availableUnitOptions}
 canViewAllUnits={canViewAllUnits}
 />

 {/* ── Detail Modal ──────────────────────────────────────────────── */}
 <KurikulumDetailModal
 isOpen={isDetailModalOpen}
 onClose={() => setIsDetailModalOpen(false)}
 data={selectedForDetail}
 />

 {/* ── Import Modal (Harmonized Batch Modal) ─────────────────────── */}
 <KurikulumImportModal
 isOpen={isImportModalOpen}
 onClose={() => setIsImportModalOpen(false)}
 onImport={(rows) => importMutation.mutate(rows)}
 isSubmitting={importMutation.isPending}
 defaultUnitId={selectedUnitFilter || (!canViewAllUnits ? effectiveUserUnitId : '')}
 defaultTahunAjaranId={selectedTahunFilter || ''}
 />

 {/* ══════════════════════════════════════════════════════════════════
 HARMONIZED DELETE CONFIRMATION MODAL (z-[70])
 ══════════════════════════════════════════════════════════════════ */}
      <AppModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => !hapusMutation.isPending && setDeleteTarget(null)}
        title="Hapus Kurikulum"
        badge="Hapus Data"
        description="Konfirmasi pemindahan data kurikulum ke tempat sampah."
        icon={Trash2}
        variant="danger"
        maxWidth="max-w-md"
        zIndex={70}
        disableBackdropClose={hapusMutation.isPending}
        hideCloseButton={hapusMutation.isPending}
        bodyClassName="space-y-4 text-slate-700 dark:text-slate-200"
        footer={
          <>
            <button
              type="button"
              disabled={hapusMutation.isPending}
              onClick={() => setDeleteTarget(null)}
              className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700 disabled:opacity-50"
            >
              <X className="size-4" strokeWidth={2} />
              <span>Batal</span>
            </button>
            <button
              type="button"
              disabled={hapusMutation.isPending}
              onClick={() => hapusMutation.mutate(deleteTarget.id)}
              className="h-9.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black inline-flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border-2 border-rose-600 shadow-md shadow-rose-600/20 disabled:opacity-50"
            >
              {hapusMutation.isPending ? (
                <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Trash2 className="size-4" />
              )}
              <span>{hapusMutation.isPending ? 'Menghapus...' : 'Ya, Hapus Data'}</span>
            </button>
          </>
        }
      >
        {deleteTarget && (
          <>
 {/* Summary Card */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/50 p-4 dark:border-emerald-800/60 dark:bg-rose-950/30">
 <p className="text-xs font-black text-rose-900 dark:text-rose-200">
 {deleteTarget.nama_kurikulum || deleteTarget.name}
 </p>
 <p className="text-xs font-bold text-rose-700 dark:text-rose-400 mt-0.5">
 Kode: {deleteTarget.kode_kurikulum || '-'} · Jenjang: {deleteTarget.jenjang || '-'}
 </p>
 </div>

 {/* Danger Callout */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/80 p-3.5 text-xs text-rose-900 dark:border-emerald-800/60 dark:bg-rose-950/40 dark:text-rose-200 leading-relaxed">
 <p className="font-bold flex items-center gap-1.5 mb-1 text-rose-700 dark:text-rose-400">
 <AlertTriangle className="size-3.5 text-rose-600" />
 Peringatan Penghapusan
 </p>
 <p className="text-xs text-rose-800 dark:text-rose-300">
 Kurikulum ini akan dipindahkan ke arsip sampah (Soft Delete) dan tidak dapat digunakan dalam penyusunan silabus baru sampai dipulihkan kembali.
 </p>
 </div>
          </>
        )}
      </AppModal>

      <AppModal
        isOpen={Boolean(restoreTarget)}
        onClose={() => !pulihkanMutation.isPending && setRestoreTarget(null)}
        title="Pulihkan Kurikulum"
        badge="Restore Data"
        description="Konfirmasi pemulihan kurikulum dari arsip sampah."
        icon={RotateCcw}
        maxWidth="max-w-md"
        zIndex={70}
        disableBackdropClose={pulihkanMutation.isPending}
        hideCloseButton={pulihkanMutation.isPending}
        bodyClassName="space-y-4 text-slate-700 dark:text-slate-200"
        footer={
          <>
            <button
              type="button"
              disabled={pulihkanMutation.isPending}
              onClick={() => setRestoreTarget(null)}
              className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700 disabled:opacity-50"
            >
              <X className="size-4" strokeWidth={2} />
              <span>Batal</span>
            </button>
            <button
              type="button"
              disabled={pulihkanMutation.isPending}
              onClick={() => pulihkanMutation.mutate(restoreTarget.id)}
              className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              {pulihkanMutation.isPending ? (
                <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <RotateCcw className="size-4" />
              )}
              <span>{pulihkanMutation.isPending ? 'Memulihkan...' : 'Ya, Pulihkan Data'}</span>
            </button>
          </>
        }
      >
        {restoreTarget && (
          <>
 {/* Summary Card */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/30">
 <p className="text-xs font-black text-emerald-900 dark:text-emerald-200">
 {restoreTarget.nama_kurikulum || restoreTarget.name}
 </p>
 <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
 Kode: {restoreTarget.kode_kurikulum || '-'} · Jenjang: {restoreTarget.jenjang || '-'}
 </p>
 </div>

 {/* Notice Callout */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/80 p-3.5 text-xs text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200 leading-relaxed">
 <p className="font-bold flex items-center gap-1.5 mb-1">
 <Sparkles className="size-3.5 text-emerald-600" />
 Informasi Pemulihan
 </p>
 <p className="text-xs text-emerald-800 dark:text-emerald-300">
 Kurikulum ini akan dipulihkan dari arsip sampah dan kembali aktif untuk digunakan oleh unit pendidikan terkait.
 </p>
 </div>
          </>
        )}
      </AppModal>

      <AppModal
        isOpen={showExportModal}
        onClose={() => !isExporting && setShowExportModal(false)}
        title="Export Data Kurikulum"
        badge="Unduh Data"
        description="Pilih format berkas untuk mengekspor data sesuai filter aktif."
        icon={Download}
        maxWidth="max-w-lg"
        disableBackdropClose={isExporting}
        hideCloseButton={isExporting}
        bodyClassName="space-y-4"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowExportModal(false)}
              className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700"
            >
              <X className="size-4" strokeWidth={2} />
              <span>Batal</span>
            </button>
            <button
              type="button"
              disabled={isExporting}
              onClick={handleProcessExport}
              className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              <Download className="size-4" />
              <span>{isExporting ? 'Menyiapkan...' : 'Unduh Berkas'}</span>
            </button>
          </>
        }
      >
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
 Data yang diekspor akan mencakup seluruh entitas terfilter ({meta.total ?? listData.length} record kurikulum).
 </p>
 </div>
      </AppModal>


 </PageContainer>
 )
}
