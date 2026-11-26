import { HeroUiHeader } from "../components/ui/HeroUiHeader"
import AppModal from "../components/app/AppModal"
import {
  KpiStatCard
} from '../components/app'
import React, { useState, useEffect, useMemo } from 'react'
import {
  Navigate
} from 'react-router-dom'
import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query'
import {
  Input
} from '@/components/ui/input'
import {
  TextArea
} from '@/components/ui/text-area'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  CalendarDays,
  Clock,
  BookOpen,
  GraduationCap,
  Users,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Printer,
  Sparkles,
  Layers,
  Award,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  FileText,
  DoorOpen,
  Palette,
  Tag,
  UserCheck,
  MessageSquare,
  Phone,
  ExternalLink,
  ShieldAlert,
  CheckCircle,
  Info,
  X,
  Send,
  ChevronRight,
  ShieldCheck
} from 'lucide-react'
import {
  useAuthStore
} from '../stores/authStore'
import {
  getUserRoleLevel,
  ROLE_LEVELS,
  ROLES,
  hasAnyRole,
  isRestrictedToTeacherWorkspace,
  isReadOnlyUser
} from '../auth/portalResolver'
import {
  useToast
} from '../components/app/ToastProvider'
import useDebounce from '../hooks/useDebounce'
import {
  examScheduleService
} from '../services/examScheduleService'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppDataTable from '../components/app/AppDataTable'
import MobileDataCard from '../components/app/MobileDataCard'
import {
  SquircleActionButton,
  MasterFormModal,
  MasterDeleteDialog
} from '../components/master-data'
import HeroUiFilterSelect from '../components/ui/HeroUiFilterSelect'
import {
  printCleanTable,
  downloadPdfTable
} from '../utils/printHelper'
import {
  DatePicker
} from '@/components/ui/date-picker'
import {
  cn
} from '../lib/utils'

// Palet warna KPI Cards Hero UI dengan Top Bar Gradient
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

// Hero UI Modern KPI Card Component
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

const CATEGORY_COLORS = {
 amber: 'bg-amber-100 text-amber-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-emerald-800/60',
 blue: 'bg-blue-100 text-blue-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-emerald-800/60',
 emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
 purple: 'bg-purple-100 text-purple-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-purple-950/60 dark:text-purple-300 dark:border-emerald-800/60',
 rose: 'bg-rose-100 text-rose-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/60 dark:text-rose-300 dark:border-emerald-800/60',
}

export default function ExamSchedulePage() {
 const { user } = useAuthStore()
 const toast = useToast()
 const notify = (title, message, type = 'info') => {
   const fn = toast?.[type] || toast?.info
   if (typeof fn === 'function') fn(message, { title })
 }
 const queryClient = useQueryClient()

 const userRoles = useMemo(() => {
 if (!user) return []
 const raw = user.roles || (user.role ? [user.role] : []) || user.role_names || []
 const list = Array.isArray(raw) ? raw : [raw]
 return list.map((r) => (typeof r === 'string' ? r : r?.name || r?.role_name || r?.nama || ''))
 }, [user])

 const authLevel = useMemo(() => getUserRoleLevel(user), [user])
 const isSuperAdminOrYayasan = authLevel <= ROLE_LEVELS.YAYASAN // Level 1-2
 const isDivisiPendidikan = useMemo(() => {
 if (isSuperAdminOrYayasan) return false
 return (
 authLevel === ROLE_LEVELS.DIVISI_PENDIDIKAN ||
 hasAnyRole(userRoles, ROLES.DIVISI) ||
 userRoles.some((r) => /divisi|bidang[\s_]*pendidikan|pengawasan[\s_]*akademik/i.test(r))
 )
 }, [authLevel, userRoles, isSuperAdminOrYayasan])

 // Multi-unit supervision: Super Admin, Yayasan, and Divisi Pendidikan
 const canSelectUnit = isSuperAdminOrYayasan || isDivisiPendidikan
 const userUnitId = user?.unit_id || user?.education_unit_id || user?.employee?.unit_id || user?.metadata?.education_unit_id || user?.metadata?.unit_id || ''

 const isKepsek = useMemo(() => {
 if (canSelectUnit) return false
 return authLevel === ROLE_LEVELS.KEPALA_SEKOLAH || userRoles.some((r) => /kepala[\s_]*sekolah|kepsek/i.test(r))
 }, [authLevel, userRoles, canSelectUnit])

 const isGuru = useMemo(
 () => isRestrictedToTeacherWorkspace(user, '/dashboard/jadwal-ujian'),
 [user]
 )
 const isTu = useMemo(() => authLevel === ROLE_LEVELS.OPERATOR || authLevel === ROLE_LEVELS.TATA_USAHA || userRoles.some(r => /tata[\s_]*usaha|tu|staf[\s_]*tu|admin[\s_]*tu/i.test(r)), [authLevel, userRoles])
 const canManage = useMemo(() => !isReadOnlyUser(user) && !isGuru && (authLevel <= ROLE_LEVELS.KEPALA_SEKOLAH || isTu), [user, isGuru, authLevel, isTu])

 // Guru dilarang mengakses halaman master jadwal ujian dan dialihkan ke Portal Guru
 // Segmented Monitoring Pillar Switcher: 'schedules' | 'invigilators' | 'classes' | 'categories'
 const [activeTab, setActiveTab] = useState('schedules')

 // Filter States: Locked for Kepala Sekolah/TU, selectable for Divisi Pendidikan/Yayasan/Super Admin
 const [selectedUnit, setSelectedUnit] = useState(() => (!canSelectUnit && userUnitId ? String(userUnitId) : ''))

 useEffect(() => {
 if (!canSelectUnit && userUnitId && selectedUnit !== String(userUnitId)) {
 setSelectedUnit(String(userUnitId))
 }
 }, [canSelectUnit, userUnitId])
 const [selectedYear, setSelectedYear] = useState('')
 const [selectedSemester, setSelectedSemester] = useState('')
 const [selectedCategory, setSelectedCategory] = useState('')
 const [selectedInvigilator, setSelectedInvigilator] = useState('')
 const [selectedKelas, setSelectedKelas] = useState('')
 const [selectedStatus, setSelectedStatus] = useState('all') // 'all' | 'ongoing' | 'upcoming' | 'finished' | 'unassigned'
 const [selectedDate, setSelectedDate] = useState('')
 const [searchInput, setSearchInput] = useState('')
 const debouncedSearch = useDebounce(searchInput, 350)
 const [page, setPage] = useState(1)

 // Direct Chat Modal State
 const [activeChatUser, setActiveChatUser] = useState(null)
 const [chatMessage, setChatMessage] = useState('')

 // Form Modal States (Jadwal Ujian)
 const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
 const [editingSchedule, setEditingSchedule] = useState(null)
 const [scheduleForm, setScheduleForm] = useState({
 academic_year_id: '',
 semester_id: '',
 exam_category_id: '',
 kelas_id: '',
 subject_id: '',
 exam_date: '',
 time_start: '07:30',
 time_end: '09:00',
 duration_minutes: 90,
 room: '',
 invigilator_id: '',
 notes: '',
 })
 const [formErrors, setFormErrors] = useState({})

 // Form Modal States (Kategori Ujian)
 const [categoryModalOpen, setCategoryModalOpen] = useState(false)
 const [editingCategory, setEditingCategory] = useState(null)
 const [categoryForm, setCategoryForm] = useState({
 name: '',
 code: '',
 color: 'amber',
 description: '',
 is_active: true,
 })

 // Delete Dialog State
 const [deleteDialog, setDeleteDialog] = useState({
 isOpen: false,
 type: '', // 'schedule' | 'category'
 id: null,
 title: '',
 })

 // Hitung durasi otomatis dari time_start dan time_end
 useEffect(() => {
 if (scheduleForm.time_start && scheduleForm.time_end) {
 const [h1, m1] = scheduleForm.time_start.split(':').map(Number)
 const [h2, m2] = scheduleForm.time_end.split(':').map(Number)
 const diff = (h2 * 60 + m2) - (h1 * 60 + m1)
 if (diff > 0) {
 setScheduleForm((prev) => ({ ...prev, duration_minutes: diff }))
 }
 }
 }, [scheduleForm.time_start, scheduleForm.time_end])

 // Query Options
 const { data: optionsData } = useQuery({
 queryKey: ['exam-schedules-options', selectedUnit],
 queryFn: () => examScheduleService.getOptions({ unit_pendidikan_id: selectedUnit }),
 })

 // Set default tahun ajaran dan semester aktif saat optionsData dimuat
 useEffect(() => {
 if (optionsData?.academic_years && !selectedYear) {
 const activeYear = optionsData.academic_years.find((y) => y.is_active) || optionsData.academic_years[0]
 if (activeYear) setSelectedYear(activeYear.id)
 }
 if (optionsData?.semesters && !selectedSemester) {
 const activeSem = optionsData.semesters.find((s) => s.is_active) || optionsData.semesters[0]
 if (activeSem) setSelectedSemester(activeSem.id)
 }
 }, [optionsData, selectedYear, selectedSemester])

 // Query Jadwal Ujian (support invigilator_id dan kelas_id)
 const { data: schedulesData, isLoading: schedulesLoading, refetch: refetchSchedules } = useQuery({
 queryKey: [
 'exam-schedules',
 selectedUnit,
 selectedYear,
 selectedSemester,
 selectedCategory,
 selectedDate,
 selectedInvigilator,
 selectedKelas,
 debouncedSearch,
 page,
 ],
 queryFn: () =>
 examScheduleService.getSchedules({
 unit_pendidikan_id: selectedUnit,
 academic_year_id: selectedYear,
 semester_id: selectedSemester,
 exam_category_id: selectedCategory,
 exam_date: selectedDate,
 invigilator_id: selectedInvigilator === 'unassigned' ? '' : selectedInvigilator,
 kelas_id: selectedKelas,
 search: debouncedSearch,
 page,
 per_page: 50,
 }),
 })

 // Query Kategori Ujian
 const { data: categoriesData, isLoading: categoriesLoading, refetch: refetchCategories } = useQuery({
 queryKey: ['exam-categories'],
 queryFn: examScheduleService.getCategories,
 })

 // Memoized Filter Options for HeroUiFilterSelect
 const unitFilterOptions = useMemo(() => [
 { value: '', label: 'Semua Unit Sekolah' },
 ...(optionsData?.units || []).map((u) => ({ value: String(u.id), label: u.name || u.nama })),
 ], [optionsData?.units])

 const categoryFilterOptions = useMemo(() => [
 { value: '', label: 'Semua Kategori Ujian' },
 ...(categoriesData || []).map((c) => ({ value: String(c.id), label: `${c.name} (${c.code || 'UJIAN'})` })),
 ], [categoriesData])

 const invigilatorFilterOptions = useMemo(() => [
 { value: '', label: 'Semua Pengawas (Guru & Tendik)' },
 { value: 'unassigned', label: '⚠️ Belum Ada Pengawas (Unassigned)' },
 ...(optionsData?.invigilators || []).map((inv) => ({
 value: String(inv.id),
 label: `${inv.nama_lengkap} ${inv.niy ? `(NIY ${inv.niy})` : ''}`,
 })),
 ], [optionsData?.invigilators])

 const kelasFilterOptions = useMemo(() => [
 { value: '', label: 'Semua Rombel / Kelas' },
 ...(optionsData?.classes || []).map((k) => ({
 value: String(k.id),
 label: `${k.nama_kelas} ${k.unitPendidikan?.name ? `(${k.unitPendidikan.name})` : ''}`,
 })),
 ], [optionsData?.classes])

 const statusFilterOptions = [
 { value: 'all', label: 'Semua Status Pelaksanaan' },
 { value: 'ongoing', label: '🟢 Sedang Berlangsung' },
 { value: 'upcoming', label: '🔵 Akan Datang' },
 { value: 'finished', label: '⚪ Sudah Selesai' },
 { value: 'unassigned', label: '⚠️ Belum Ada Pengawas' },
 ]

 // Memoized Options for Form Modals
 const formCategoryOptions = useMemo(() => (categoriesData || []).map((c) => ({
 value: String(c.id),
 label: `${c.name} (${c.code || 'UJIAN'})`,
 })), [categoriesData])

 const formSubjectOptions = useMemo(() => (optionsData?.subjects || []).map((s) => ({
 value: String(s.id),
 label: `${s.name || s.nama_mapel} (${s.code || s.kode_mapel || '-'})`,
 })), [optionsData?.subjects])

 const formKelasOptions = useMemo(() => (optionsData?.classes || []).map((k) => ({
 value: String(k.id),
 label: `${k.nama_kelas} ${k.unitPendidikan?.name ? `(${k.unitPendidikan.name})` : ''}`,
 })), [optionsData?.classes])

 const formInvigilatorOptions = useMemo(() => [
 { value: '', label: '-- Belum Ditentukan (Tanpa Pengawas) --' },
 ...(optionsData?.invigilators || []).map((inv) => ({
 value: String(inv.id),
 label: `${inv.nama_lengkap} ${inv.niy ? `(NIY ${inv.niy})` : ''}`,
 })),
 ], [optionsData?.invigilators])

 const categoryColorOptions = [
 { value: 'emerald', label: 'Emerald (Hijau Zamrud)' },
 { value: 'amber', label: 'Amber (Oranye Keemasan)' },
 { value: 'blue', label: 'Blue (Biru Samudra)' },
 { value: 'purple', label: 'Purple (Ungu Mewah)' },
 { value: 'rose', label: 'Rose (Merah Muda Elegan)' },
 ]

 // Status Helper for Exam Schedule
 const getScheduleStatus = (schedule) => {
 if (!schedule?.exam_date) return { label: 'Terjadwal', color: 'blue' }
 try {
 const now = new Date()
 const todayStr = now.toISOString().split('T')[0]
 const examDateStr = schedule.exam_date.substring(0, 10)

 if (examDateStr < todayStr) {
 return { label: 'Selesai', color: 'slate', isFinished: true }
 }
 if (examDateStr > todayStr) {
 return { label: 'Akan Datang', color: 'blue', isUpcoming: true }
 }
 // Today: check hours
 const [startH, startM] = (schedule.time_start || '00:00').split(':').map(Number)
 const [endH, endM] = (schedule.time_end || '23:59').split(':').map(Number)
 const currentMinutes = now.getHours() * 60 + now.getMinutes()
 const startMinutes = startH * 60 + startM
 const endMinutes = endH * 60 + endM

 if (currentMinutes < startMinutes) {
 return { label: 'Hari Ini (Menunggu)', color: 'amber', isTodayUpcoming: true }
 } else if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
 return { label: 'Sedang Berlangsung', color: 'emerald', isOngoing: true }
 } else {
 return { label: 'Selesai Hari Ini', color: 'slate', isFinished: true }
 }
 } catch (e) {
 return { label: 'Terjadwal', color: 'blue' }
 }
 }

 const allSchedules = schedulesData?.data || []

 // Filtered schedules berdasarkan selectedStatus
 const filteredSchedules = useMemo(() => {
 return allSchedules.filter((s) => {
 if (selectedInvigilator === 'unassigned' && s.invigilator_id) return false
 if (selectedStatus === 'unassigned') {
 return !s.invigilator_id && !s.invigilator?.nama_lengkap
 }
 const st = getScheduleStatus(s)
 if (selectedStatus === 'ongoing') return st.isOngoing
 if (selectedStatus === 'upcoming') return st.isUpcoming || st.isTodayUpcoming
 if (selectedStatus === 'finished') return st.isFinished
 return true
 })
 }, [allSchedules, selectedStatus, selectedInvigilator])

 // Unassigned schedules (tanpa pengawas)
 const unassignedSchedules = useMemo(() => {
 return allSchedules.filter((s) => !s.invigilator_id && !s.invigilator?.nama_lengkap)
 }, [allSchedules])

 // Processed Invigilator Groups (Guru & Tendik)
 const invigilatorGroups = useMemo(() => {
 const map = {}
 ;(optionsData?.invigilators || []).forEach((inv) => {
 map[inv.id] = {
 id: inv.id,
 nama_lengkap: inv.nama_lengkap,
 niy: inv.niy,
 unit_id: inv.unit_id,
 sessions: [],
 }
 })

 allSchedules.forEach((sch) => {
 const invId = sch.invigilator_id || sch.invigilator?.id
 if (invId) {
 if (!map[invId]) {
 map[invId] = {
 id: invId,
 nama_lengkap: sch.invigilator?.nama_lengkap || 'Pengawas',
 niy: sch.invigilator?.niy || '',
 sessions: [],
 }
 }
 map[invId].sessions.push(sch)
 }
 })

 return Object.values(map).sort((a, b) => b.sessions.length - a.sessions.length)
 }, [optionsData?.invigilators, allSchedules])

 // Processed Class Groups (Siswa / Rombel Peserta)
 const classGroups = useMemo(() => {
 const map = {}
 ;(optionsData?.classes || []).forEach((k) => {
 map[k.id] = {
 id: k.id,
 nama_kelas: k.nama_kelas,
 unit_name: k.unitPendidikan?.name || '',
 sessions: [],
 }
 })

 allSchedules.forEach((sch) => {
 const kId = sch.kelas_id || sch.kelas?.id
 if (kId) {
 if (!map[kId]) {
 map[kId] = {
 id: kId,
 nama_kelas: sch.kelas?.nama_kelas || 'Kelas',
 unit_name: sch.kelas?.unitPendidikan?.name || '',
 sessions: [],
 }
 }
 map[kId].sessions.push(sch)
 }
 })

 return Object.values(map).sort((a, b) => b.sessions.length - a.sessions.length)
 }, [optionsData?.classes, allSchedules])

 // Mutations
 const saveScheduleMutation = useMutation({
 mutationFn: (payload) =>
 editingSchedule
 ? examScheduleService.updateSchedule(editingSchedule.id, payload)
 : examScheduleService.createSchedule(payload),
 onSuccess: () => {
 notify('Berhasil', editingSchedule ? 'Jadwal ujian berhasil diperbarui.' : 'Jadwal ujian berhasil ditambahkan.', 'success')
 setScheduleModalOpen(false)
 setEditingSchedule(null)
 queryClient.invalidateQueries(['exam-schedules'])
 },
 onError: (err) => {
 const msg = err?.response?.data?.message || err?.message || 'Gagal menyimpan jadwal ujian.'
 notify('Terjadi Kesalahan', msg, 'error')
 if (err?.response?.data?.errors) {
 setFormErrors(err.response.data.errors)
 }
 },
 })

 const saveCategoryMutation = useMutation({
 mutationFn: (payload) =>
 editingCategory
 ? examScheduleService.updateCategory(editingCategory.id, payload)
 : examScheduleService.createCategory(payload),
 onSuccess: () => {
 notify('Berhasil', editingCategory ? 'Kategori ujian berhasil diperbarui.' : 'Kategori ujian berhasil ditambahkan.', 'success')
 setCategoryModalOpen(false)
 setEditingCategory(null)
 queryClient.invalidateQueries(['exam-categories'])
 queryClient.invalidateQueries(['exam-schedules-options'])
 },
 onError: (err) => {
 const msg = err?.response?.data?.message || err?.message || 'Gagal menyimpan kategori ujian.'
 notify('Terjadi Kesalahan', msg, 'error')
 },
 })

 const deleteMutation = useMutation({
 mutationFn: ({ type, id }) =>
 type === 'schedule'
 ? examScheduleService.deleteSchedule(id)
 : examScheduleService.deleteCategory(id),
 onSuccess: () => {
 notify('Dihapus', 'Data berhasil dihapus.', 'success')
 setDeleteDialog({ isOpen: false, type: '', id: null, title: '' })
 queryClient.invalidateQueries(['exam-schedules'])
 queryClient.invalidateQueries(['exam-categories'])
 },
 onError: (err) => {
 const msg = err?.response?.data?.message || err?.message || 'Gagal menghapus data.'
 notify('Gagal Hapus', msg, 'error')
 },
 })

 // Handlers
 const openAddScheduleModal = () => {
 setEditingSchedule(null)
 setScheduleForm({
 academic_year_id: selectedYear || optionsData?.academic_years?.[0]?.id || '',
 semester_id: selectedSemester || optionsData?.semesters?.[0]?.id || '',
 exam_category_id: selectedCategory || optionsData?.categories?.[0]?.id || '',
 kelas_id: optionsData?.classes?.[0]?.id || '',
 subject_id: optionsData?.subjects?.[0]?.id || '',
 exam_date: new Date().toISOString().split('T')[0],
 time_start: '07:30',
 time_end: '09:00',
 duration_minutes: 90,
 room: 'Ruang Kelas',
 invigilator_id: '',
 notes: '',
 })
 setFormErrors({})
 setScheduleModalOpen(true)
 }

 const openEditScheduleModal = (item) => {
 setEditingSchedule(item)
 setScheduleForm({
 academic_year_id: item.academic_year_id || '',
 semester_id: item.semester_id || '',
 exam_category_id: item.exam_category_id || '',
 kelas_id: item.kelas_id || '',
 subject_id: item.subject_id || '',
 exam_date: item.exam_date ? item.exam_date.substring(0, 10) : '',
 time_start: item.time_start ? item.time_start.substring(0, 5) : '07:30',
 time_end: item.time_end ? item.time_end.substring(0, 5) : '09:00',
 duration_minutes: item.duration_minutes || 90,
 room: item.room || '',
 invigilator_id: item.invigilator_id || '',
 notes: item.notes || '',
 })
 setFormErrors({})
 setScheduleModalOpen(true)
 }

 const handleSaveSchedule = (e) => {
 e.preventDefault()
 saveScheduleMutation.mutate(scheduleForm)
 }

 const openAddCategoryModal = () => {
 setEditingCategory(null)
 setCategoryForm({
 name: '',
 code: '',
 color: 'amber',
 description: '',
 is_active: true,
 })
 setCategoryModalOpen(true)
 }

 const openEditCategoryModal = (cat) => {
 setEditingCategory(cat)
 setCategoryForm({
 name: cat.name || '',
 code: cat.code || '',
 color: cat.color || 'amber',
 description: cat.description || '',
 is_active: cat.is_active ?? true,
 })
 setCategoryModalOpen(true)
 }

 const handleSaveCategory = (e) => {
 e.preventDefault()
 saveCategoryMutation.mutate(categoryForm)
 }

 const handlePrintSchedules = () => {
 const list = schedulesData?.data || []
 if (list.length === 0) {
 notify('Peringatan', 'Tidak ada data jadwal ujian untuk dicetak.', 'warning')
 return
 }

 const columns = [
 { header: 'No', accessor: (_, idx) => idx + 1 },
 { header: 'Tanggal', accessor: (row) => row.exam_date ? new Date(row.exam_date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '-' },
 { header: 'Waktu', accessor: (row) => `${row.time_start?.substring(0, 5)} - ${row.time_end?.substring(0, 5)} (${row.duration_minutes}m)` },
 { header: 'Kategori Ujian', accessor: (row) => row.exam_category?.name || '-' },
 { header: 'Kelas / Rombel', accessor: (row) => row.kelas?.nama_kelas || '-' },
 { header: 'Mata Pelajaran', accessor: (row) => row.subject?.name || row.subject?.nama_mapel || '-' },
 { header: 'Ruang', accessor: (row) => row.room || '-' },
 { header: 'Pengawas Ujian', accessor: (row) => row.invigilator?.nama_lengkap || '-' },
 ]

 printCleanTable({
 title: 'JADWAL PELAKSANAAN UJIAN PERIODIK',
 subtitle: `Tahun Ajaran: ${optionsData?.academic_years?.find((y) => y.id === selectedYear)?.name || 'Semua'} • Semester: ${optionsData?.semesters?.find((s) => s.id === selectedSemester)?.name || 'Semua'}`,
 data: list,
 columns,
 })
 }

 const stats = schedulesData?.statistik || {
 total_jadwal: 0,
 total_kelas: 0,
 total_pengawas: 0,
 total_mapel: 0,
 }

  // ── Canonical Columns for Exam Schedules ──
  const scheduleColumns = useMemo(() => [
    {
      key: 'no',
      label: 'No',
      width: 'w-12',
      align: 'center',
      render: (_, idx) => (
        <span className="font-bold text-slate-500">
          {(page - 1) * 15 + idx + 1}
        </span>
      ),
    },
    {
      key: 'exam_date',
      label: 'Tanggal & Waktu',
      render: (row) => {
        const status = getScheduleStatus(row)
        return (
          <div>
            <span className="font-bold text-slate-900 dark:text-white block">
              {row.exam_date
                ? new Date(row.exam_date).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : '-'}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <Clock className="h-3 w-3" />
                {row.time_start?.substring(0, 5)} - {row.time_end?.substring(0, 5)} ({row.duration_minutes}m)
              </span>
              {status.isOngoing && (
                <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                  Berlangsung
                </span>
              )}
              {status.isTodayUpcoming && (
                <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-800/60">
                  Hari Ini
                </span>
              )}
            </div>
          </div>
        )
      },
    },
    {
      key: 'category',
      label: 'Kategori Ujian',
      render: (row) => {
        const colorClass = CATEGORY_COLORS[row.exam_category?.color] || CATEGORY_COLORS.amber
        return (
          <span className={cn('inline-block px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider', colorClass)}>
            {row.exam_category?.name || 'Ujian'}
          </span>
        )
      },
    },
    {
      key: 'subject',
      label: 'Mata Pelajaran',
      render: (row) => (
        <div>
          <span className="font-extrabold text-slate-900 dark:text-white block text-xs">
            {row.subject?.name || row.subject?.nama_mapel || '-'}
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Kode: {row.subject?.code || row.subject?.kode_mapel || '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'kelas',
      label: 'Kelas / Rombel',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-800 dark:text-slate-100 block">
            {row.kelas?.nama_kelas || '-'}
          </span>
          <span className="text-[10px] text-slate-500">
            {row.kelas?.unitPendidikan?.name || ''}
          </span>
        </div>
      ),
    },
    {
      key: 'room',
      label: 'Ruang & Pengawas',
      render: (row) => {
        const hasInvigilator = Boolean(row.invigilator?.nama_lengkap || row.invigilator_id)
        return (
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200 block flex items-center gap-1">
              <DoorOpen className="h-3.5 w-3.5 text-emerald-600" />
              {row.room || 'Ruang Standar'}
            </span>
            {hasInvigilator ? (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <UserCheck className="h-3 w-3 text-emerald-600" />
                  {row.invigilator?.nama_lengkap}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveChatUser(row.invigilator)}
                  className="p-0.5 text-slate-400 hover:text-emerald-700 transition-colors cursor-pointer"
                  title="Kirim pesan koordinasi"
                >
                  <MessageSquare className="h-3 w-3" />
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Assalamu\'alaikum, mengingatkan jadwal pengawasan ujian: ${row.subject?.name || ''} di ${row.room || ''} jam ${row.time_start?.substring(0, 5)}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-0.5 text-slate-400 hover:text-emerald-600 transition-colors"
                  title="Chat WhatsApp"
                >
                  <Phone className="h-3 w-3" />
                </a>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/60 dark:text-rose-300 dark:border-emerald-800/60 mt-0.5">
                <AlertTriangle className="h-3 w-3" />
                ⚠️ Belum Ada Pengawas
              </span>
            )}
          </div>
        )
      },
    },
  ], [page])

 if (isGuru) {
 return <Navigate to="/portal-guru/workspace?tab=jadwal" replace />
 }

 return (
 <PageContainer>
 {/* ── BREADCRUMB ── */}
 <AppBreadcrumb
 items={[
 { label: 'Dashboard', href: '/dashboard' },
 { label: 'Akademik', href: '/dashboard/master/jadwal-pelajaran' },
 { label: 'Jadwal Ujian', href: '/dashboard/jadwal-ujian' },
 ]}
 />

 <div className="space-y-6">
 {/* ── MODERN HERO BANNER CARD ── */}
        <HeroUiHeader
          title="Jadwal Ujian & Monitoring Pengawas Terpadu"
          subtitle="Kelola matriks jadwal ujian periodik, monitoring alokasi pengawas (guru & tendik), supervisi rombel peserta, serta cegah bentrok ruang secara realtime."
          icon={CalendarDays}
          roleTag="Supervisi Ujian"
          badge="PTS • PAS • PAT"
          className="mb-4"
        />
        <div className="flex justify-end mb-4">
          <div className="w-full lg:w-auto grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-wrap items-center gap-1.5 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/40 p-1.5 shadow-sm dark:bg-emerald-950/20 shrink-0">
 <button
 type="button"
 onClick={() => setActiveTab('schedules')}
 className={cn(
 'flex items-center justify-center gap-2 rounded-xl px-3 sm:px-3.5 py-2 text-xs font-black transition-all cursor-pointer text-center',
 activeTab === 'schedules'
 ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold opacity-100 shadow-sm'
 : 'text-slate-700 dark:text-slate-300 opacity-70 hover:opacity-100 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 font-semibold'
 )}
 >
 <Calendar className="h-4 w-4 shrink-0" />
 <span className="truncate">Matriks Jadwal</span>
 <span className={cn('px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0', activeTab === 'schedules' ? 'bg-white/20' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300')}>
 {stats.total_jadwal}
 </span>
 </button>

 <button
 type="button"
 onClick={() => setActiveTab('invigilators')}
 className={cn(
 'flex items-center justify-center gap-2 rounded-xl px-3 sm:px-3.5 py-2 text-xs font-black transition-all cursor-pointer text-center',
 activeTab === 'invigilators'
 ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold opacity-100 shadow-sm'
 : 'text-slate-700 dark:text-slate-300 opacity-70 hover:opacity-100 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 font-semibold'
 )}
 >
 <UserCheck className="h-4 w-4 shrink-0" />
 <span className="truncate">Pengawas</span>
 {unassignedSchedules.length > 0 && (
 <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse shrink-0">
 !
 </span>
 )}
 </button>

 <button
 type="button"
 onClick={() => setActiveTab('classes')}
 className={cn(
 'flex items-center justify-center gap-2 rounded-xl px-3 sm:px-3.5 py-2 text-xs font-black transition-all cursor-pointer text-center',
 activeTab === 'classes'
 ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold opacity-100 shadow-sm'
 : 'text-slate-700 dark:text-slate-300 opacity-70 hover:opacity-100 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 font-semibold'
 )}
 >
 <GraduationCap className="h-4 w-4 shrink-0" />
 <span className="truncate">Rombel</span>
 <span className={cn('px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0', activeTab === 'classes' ? 'bg-white/20' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300')}>
 {stats.total_kelas}
 </span>
 </button>

 <button
 type="button"
 onClick={() => setActiveTab('categories')}
 className={cn(
 'flex items-center justify-center gap-2 rounded-xl px-3 sm:px-3.5 py-2 text-xs font-black transition-all cursor-pointer text-center',
 activeTab === 'categories'
 ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold opacity-100 shadow-sm'
 : 'text-slate-700 dark:text-slate-300 opacity-70 hover:opacity-100 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 font-semibold'
 )}
 >
 <Tag className="h-4 w-4 shrink-0" />
 <span className="truncate">Kategori</span>
 </button>
 </div>
 </div>

 {/* ── 4 MASTER KPI CARDS HERO UI (INTERAKTIF) ── */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <ModernKpiCard
 tone="emerald"
 label="Total Sesi Ujian"
 value={stats.total_jadwal}
 subtext={`${filteredSchedules.length} Sesi Terfilter`}
 icon={CalendarDays}
 active={activeTab === 'schedules' && selectedStatus === 'all'}
 onClick={() => {
 setActiveTab('schedules')
 setSelectedStatus('all')
 }}
 />

 <ModernKpiCard
 tone="purple"
 label="Pengawas Bertugas (Guru & Tendik)"
 value={stats.total_pengawas}
 subtext={
 unassignedSchedules.length > 0
 ? `⚠️ ${unassignedSchedules.length} Sesi Belum Ada Pengawas`
 : 'Semua Sesi Memiliki Pengawas'
 }
 icon={Users}
 active={activeTab === 'invigilators'}
 onClick={() => setActiveTab('invigilators')}
 />

 <ModernKpiCard
 tone="amber"
 label="Rombel & Santri Peserta"
 value={stats.total_kelas}
 subtext="Kelas / Rombel Terdaftar"
 icon={GraduationCap}
 active={activeTab === 'classes'}
 onClick={() => setActiveTab('classes')}
 />

 <ModernKpiCard
 tone="blue"
 label="Mata Pelajaran Diujikan"
 value={stats.total_mapel}
 subtext="Mata Pelajaran Terjadwal"
 icon={BookOpen}
 active={activeTab === 'schedules' && selectedStatus !== 'all'}
 onClick={() => {
 setActiveTab('schedules')
 }}
 />
 </div>

 {/* ── PILAR 1: MATRIKS JADWAL UJIAN ── */}
      {/* ── PILAR 1: MATRIKS JADWAL UJIAN ── */}
      {activeTab === 'schedules' && (
        <AppDataTable
          id="tabel-matriks-jadwal-ujian"
          title="Matriks Pelaksanaan Jadwal Ujian"
          subtitle="Daftar sesi ujian periodik dengan status pelaksanaan realtime, ruang, dan guru/tendik pengawas."
          icon={Calendar}
          countLabel="jadwal"
          actions={
            <>
              <SquircleActionButton
                variant="print"
                icon={Printer}
                label="Cetak Jadwal Ujian"
                onClick={handlePrintSchedules}
              />
              {canManage && (
                <SquircleActionButton
                  variant="create"
                  icon={Plus}
                  label="Tambah Jadwal Ujian"
                  onClick={openAddScheduleModal}
                />
              )}
            </>
          }
          search={searchInput}
          onSearchChange={(e) => {
            setSearchInput(e.target.value)
            setPage(1)
          }}
          searchPlaceholder="Cari mapel, kelas, pengawas, ruang..."
          filters={
            <div className="flex flex-wrap items-center gap-2.5 w-full">
              {/* Unit Filter */}
              <div className="min-w-[170px] flex-1 sm:flex-none">
                {!canSelectUnit ? (
                  <div
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/60 px-3 py-2 text-xs font-bold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300 shrink-0"
                    title={isKepsek ? 'Unit Pendidikan Kepala Sekolah' : (isTu ? 'Unit Kerja Tata Usaha' : 'Unit Sekolah Anda')}
                  >
                    <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      {optionsData?.units?.find((u) => String(u.id) === String(selectedUnit))?.name ||
                        user?.unit?.name ||
                        user?.unit_name ||
                        user?.employee?.unit?.name ||
                        user?.metadata?.unit_name ||
                        'Unit Terkunci'}
                    </span>
                  </div>
                ) : (
                  <HeroUiFilterSelect
                    ariaLabel="Unit Sekolah"
                    value={selectedUnit}
                    onChange={(val) => {
                      setSelectedUnit(val)
                      setPage(1)
                    }}
                    options={unitFilterOptions}
                    placeholder="Semua Unit"
                    icon={Building2}
                    searchable
                    className="w-full"
                    size="md"
                  />
                )}
              </div>

              {/* Kategori Ujian Filter */}
              <div className="min-w-[180px] flex-1 sm:flex-none">
                <HeroUiFilterSelect
                  ariaLabel="Kategori Ujian"
                  value={selectedCategory}
                  onChange={(val) => {
                    setSelectedCategory(val)
                    setPage(1)
                  }}
                  options={categoryFilterOptions}
                  placeholder="Semua Kategori"
                  icon={Tag}
                  searchable
                  className="w-full"
                  size="md"
                />
              </div>

              {/* Pengawas Filter */}
              <div className="min-w-[210px] flex-1 sm:flex-none">
                <HeroUiFilterSelect
                  ariaLabel="Pengawas (Guru & Tendik)"
                  value={selectedInvigilator}
                  onChange={(val) => {
                    setSelectedInvigilator(val)
                    setPage(1)
                  }}
                  options={invigilatorFilterOptions}
                  placeholder="Semua Pengawas"
                  icon={UserCheck}
                  searchable
                  className="w-full"
                  size="md"
                />
              </div>

              {/* Kelas Filter */}
              <div className="min-w-[170px] flex-1 sm:flex-none">
                <HeroUiFilterSelect
                  ariaLabel="Kelas / Rombel"
                  value={selectedKelas}
                  onChange={(val) => {
                    setSelectedKelas(val)
                    setPage(1)
                  }}
                  options={kelasFilterOptions}
                  placeholder="Semua Rombel"
                  icon={GraduationCap}
                  searchable
                  className="w-full"
                  size="md"
                />
              </div>

              {/* Status Pelaksanaan Filter */}
              <div className="min-w-[180px] flex-1 sm:flex-none">
                <HeroUiFilterSelect
                  ariaLabel="Status Pelaksanaan"
                  value={selectedStatus}
                  onChange={(val) => {
                    setSelectedStatus(val)
                    setPage(1)
                  }}
                  options={statusFilterOptions}
                  placeholder="Status Pelaksanaan"
                  icon={Clock}
                  className="w-full"
                  size="md"
                />
              </div>

              {/* Tanggal Filter */}
              <div className="w-auto">
                <DatePicker
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value)
                    setPage(1)
                  }}
                  className="w-40"
                  inputClassName="h-9 text-xs font-bold font-mono"
                  placeholder="Pilih Tanggal..."
                />
              </div>

              {/* Reset Filter Button */}
              {(selectedUnit || selectedCategory || selectedInvigilator || selectedKelas || selectedStatus !== 'all' || selectedDate || searchInput) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUnit(!canSelectUnit && userUnitId ? String(userUnitId) : '')
                    setSelectedCategory('')
                    setSelectedInvigilator('')
                    setSelectedKelas('')
                    setSelectedStatus('all')
                    setSelectedDate('')
                    setSearchInput('')
                    setPage(1)
                  }}
                  className="h-9 px-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-800/60 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>
          }
          columns={scheduleColumns}
          data={filteredSchedules}
          isLoading={schedulesLoading}
          emptyTitle="Belum Ada Jadwal Ujian"
          emptyDescription="Belum ada jadwal ujian yang cocok dengan filter atau kata kunci."
          onEdit={canManage ? (row) => openEditScheduleModal(row) : undefined}
          onDelete={
            canManage
              ? (row) =>
                  setDeleteDialog({
                    isOpen: true,
                    type: 'schedule',
                    id: row.id,
                    title: `Hapus Jadwal Ujian ${row.subject?.name || ''} (${row.kelas?.nama_kelas || ''})?`,
                  })
              : undefined
          }
          renderMobileCard={(row) => {
            const status = getScheduleStatus(row)
            return (
              <MobileDataCard
                key={row.id}
                title={row.subject?.name || row.subject?.nama_mapel || 'Ujian'}
                subtitle={`${row.kelas?.nama_kelas || ''} · ${row.exam_category?.name || 'Ujian'}`}
                badge={status.isOngoing ? 'Berlangsung' : status.isTodayUpcoming ? 'Hari Ini' : (row.room || 'Ruang Standar')}
                badgeVariant={status.isOngoing ? 'success' : status.isTodayUpcoming ? 'warning' : 'neutral'}
                fields={[
                  {
                    label: 'Waktu',
                    value: `${row.exam_date || ''} (${row.time_start?.substring(0, 5)} - ${row.time_end?.substring(0, 5)})`,
                    icon: Clock,
                  },
                  {
                    label: 'Ruang',
                    value: row.room || 'Ruang Standar',
                    icon: DoorOpen,
                  },
                  {
                    label: 'Pengawas',
                    value: row.invigilator?.nama_lengkap || 'Belum Ada Pengawas',
                    icon: UserCheck,
                  },
                ]}
                onEdit={canManage ? () => openEditScheduleModal(row) : undefined}
                onDelete={
                  canManage
                    ? () =>
                        setDeleteDialog({
                          isOpen: true,
                          type: 'schedule',
                          id: row.id,
                          title: `Hapus Jadwal Ujian ${row.subject?.name || ''}?`,
                        })
                    : undefined
                }
              />
            )
          }}
        />
      )}
 {activeTab === 'invigilators' && (
 <div className="space-y-4">
 {/* Warning Alert Banner jika ada sesi tanpa pengawas */}
 {unassignedSchedules.length > 0 && (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/90 p-4 dark:border-emerald-800/60 dark:bg-rose-950/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div className="flex items-center gap-3">
 <div className="flex h-9 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm">
 <ShieldAlert className="h-5 w-5" />
 </div>
 <div>
 <h4 className="text-xs font-black text-rose-900 dark:text-rose-200">
 Perhatian: {unassignedSchedules.length} Sesi Ujian Belum Memiliki Pengawas!
 </h4>
 <p className="text-xs font-medium text-rose-700 dark:text-rose-300">
 Segera alokasikan guru atau tendik piket sebagai pengawas ruang untuk kelancaran asesmen.
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => {
 setSelectedStatus('unassigned')
 setActiveTab('schedules')
 }}
 className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-sm transition-all cursor-pointer"
 >
 <span>Lihat Sesi Tanpa Pengawas</span>
 <ChevronRight className="h-3.5 w-3.5" />
 </button>
 </div>
 )}

 {/* Grid Pengawas (Guru & Tendik) */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {invigilatorGroups.length === 0 ? (
 <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-900 dark:border-emerald-800/60">
 <Users className="h-9 w-10 text-slate-300 mx-auto mb-2" />
 <span className="block font-bold">Tidak ada data pegawai / pengawas</span>
 </div>
 ) : (
 invigilatorGroups.map((inv) => {
 const hasSessions = inv.sessions.length > 0
 const isOngoingNow = inv.sessions.some(s => getScheduleStatus(s).isOngoing)

 return (
 <div
 key={inv.id}
 className={cn(
 'rounded-xl border p-4.5 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between transition-all hover:shadow-md',
 isOngoingNow
 ? 'border-emerald-200/80 ring-2 ring-emerald-500/20'
 : hasSessions
 ? 'border-emerald-200/80 dark:border-emerald-800/60'
 : 'border-emerald-200/80 dark:border-emerald-800/60 opacity-80'
 )}
 >
 <div>
 {/* Header Personel */}
 <div className="flex items-start justify-between gap-3">
 <div className="flex items-center gap-3">
 <div className="flex h-9 w-11 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] font-black text-sm shadow-sm">
 {inv.nama_lengkap.substring(0, 2).toUpperCase()}
 </div>
 <div className="min-w-0">
 <h4 className="text-sm font-black text-slate-900 dark:text-white ">
 {inv.nama_lengkap}
 </h4>
 <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 block truncate">
 {inv.niy ? `NIY: ${inv.niy}` : 'Staf Pegawai'}
 </span>
 </div>
 </div>

 {/* Status Pill */}
 {isOngoingNow ? (
 <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
 <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
 Sedang Mengawas
 </span>
 ) : hasSessions ? (
 <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-emerald-200/80 dark:border-emerald-800/60">
 {inv.sessions.length} Sesi
 </span>
 ) : (
 <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
 Bebas Tugas
 </span>
 )}
 </div>

 {/* List Sesi Ujian Personel */}
 <div className="mt-4 space-y-2">
 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
 Jadwal Pengawasan:
 </span>
 {inv.sessions.length === 0 ? (
 <p className="text-xs text-slate-400 italic">
 Belum memiliki penugasan jadwal pengawasan.
 </p>
 ) : (
 inv.sessions.slice(0, 3).map((sess) => {
 const st = getScheduleStatus(sess)
 return (
 <div
 key={sess.id}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 p-2.5 dark:border-emerald-800/60 dark:bg-slate-800/50 text-xs"
 >
 <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
 <span className="truncate">{sess.subject?.name || sess.subject?.nama_mapel}</span>
 <span className="font-mono text-emerald-700 dark:text-emerald-400 shrink-0">
 {sess.time_start?.substring(0, 5)} - {sess.time_end?.substring(0, 5)}
 </span>
 </div>
 <div className="flex items-center justify-between text-slate-500 mt-1">
 <span>{sess.kelas?.nama_kelas} • {sess.room || 'Ruang Standar'}</span>
 {st.isOngoing && (
 <span className="text-[9px] font-bold text-emerald-600 uppercase">Live</span>
 )}
 </div>
 </div>
 )
 })
 )}
 {inv.sessions.length > 3 && (
 <span className="text-[10px] font-semibold text-slate-400 block text-center">
 +{inv.sessions.length - 3} sesi lainnya
 </span>
 )}
 </div>
 </div>

 {/* Footer Actions */}
 <div className="mt-4 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between gap-2">
 <button
 type="button"
 onClick={() => setActiveChatUser(inv)}
 className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold transition-all cursor-pointer"
 >
 <MessageSquare className="h-3.5 w-3.5" />
 <span>Direct Chat</span>
 </button>
 <a
 href={`https://wa.me/?text=${encodeURIComponent(`Assalamu'alaikum ${inv.nama_lengkap}, koordinasi terkait pengawasan ujian periodik sekolah.`)}`}
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center justify-center p-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 transition-all"
 title="WhatsApp"
 >
 <Phone className="h-3.5 w-3.5" />
 </a>
 </div>
 </div>
 )
 })
 )}
 </div>
 </div>
 )}

 {/* ── PILAR 3: MONITORING ROMBEL PESERTA (SISWA) ── */}
 {activeTab === 'classes' && (
 <div className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {classGroups.length === 0 ? (
 <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-900 dark:border-emerald-800/60">
 <GraduationCap className="h-9 w-10 text-slate-300 mx-auto mb-2" />
 <span className="block font-bold">Tidak ada rombel kelas yang terdaftar</span>
 </div>
 ) : (
 classGroups.map((cls) => (
 <div
 key={cls.id}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4.5 dark:border-emerald-800/60 dark:bg-slate-900 shadow-xs flex flex-col justify-between"
 >
 <div>
 <div className="flex items-center justify-between gap-2">
 <div className="flex items-center gap-2.5">
 <div className="flex h-9 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
 <GraduationCap className="h-5 w-5" />
 </div>
 <div>
 <h4 className="text-sm font-black text-slate-900 dark:text-white">
 {cls.nama_kelas}
 </h4>
 <span className="text-[10px] font-semibold text-slate-500">
 {cls.unit_name || 'Unit Sekolah'}
 </span>
 </div>
 </div>
 <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-800/60">
 {cls.sessions.length} Mapel
 </span>
 </div>

 {/* Timeline Sesi Rombel */}
 <div className="mt-4 space-y-2">
 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
 Agenda Ujian Rombel:
 </span>
 {cls.sessions.length === 0 ? (
 <p className="text-xs text-slate-400 italic">
 Belum ada jadwal ujian untuk kelas ini.
 </p>
 ) : (
 cls.sessions.slice(0, 4).map((sess) => (
 <div
 key={sess.id}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 p-2.5 dark:border-emerald-800/60 dark:bg-slate-800/50 text-xs"
 >
 <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
 <span>{sess.subject?.name || sess.subject?.nama_mapel}</span>
 <span className="font-mono text-emerald-700 dark:text-emerald-400">
 {sess.time_start?.substring(0, 5)} - {sess.time_end?.substring(0, 5)}
 </span>
 </div>
 <div className="flex items-center justify-between text-slate-500 mt-1">
 <span>Ruang: {sess.room || 'Kelas'}</span>
 <span className="font-medium">
 {sess.invigilator?.nama_lengkap ? `Pengawas: ${sess.invigilator.nama_lengkap}` : '⚠️ Tanpa Pengawas'}
 </span>
 </div>
 </div>
 ))
 )}
 </div>
 </div>

 <div className="mt-4 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60">
 <button
 type="button"
 onClick={() => {
 setSelectedKelas(String(cls.id))
 setActiveTab('schedules')
 }}
 className="w-full py-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:border-emerald-200/80 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
 >
 <span>Lihat Semua Jadwal Kelas</span>
 <ChevronRight className="h-3.5 w-3.5" />
 </button>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 )}

 {/* ── PILAR 4: PENGATURAN KATEGORI UJIAN (DINAMIS) ── */}
 {activeTab === 'categories' && (
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-sm dark:bg-[#1B2433]">
 {/* Header Kategori */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <div>
 <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <Tag className="h-5 w-5 text-emerald-600" />
 <span>Kategori &amp; Jenis Evaluasi Ujian</span>
 <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
 {categoriesData?.length || 0} Kategori
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Tambahkan dan kelola kategori ujian secara bebas (UTS, PAS, PAT Kenaikan Kelas, dsb).
 </p>
 </div>

 {canManage && (
 <button
 type="button"
 onClick={openAddCategoryModal}
 className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 dark:bg-emerald-50 dark:text-slate-900 dark: px-4 py-2.5 text-xs font-black shadow-sm hover:from-emerald-700 hover:to-teal-800 cursor-pointer transition-all active:scale-95 text-white border border-emerald-200/80 dark:border-emerald-800/60 h-9 text-sm font-medium"
 >
 <Plus className="h-4 w-4" />
 <span>Tambah Kategori Ujian</span>
 </button>
 )}
 </div>

 {/* Grid List Kategori */}
 <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {categoriesLoading ? (
 <div className="col-span-full py-12 text-center text-slate-500">
 <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-600 dark:text-emerald-400 mb-2" />
 <span>Memuat kategori ujian...</span>
 </div>
 ) : (categoriesData || []).map((cat) => {
 const colorClass = CATEGORY_COLORS[cat.color] || CATEGORY_COLORS.amber
 return (
 <div
 key={cat.id}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4.5 dark:border-emerald-800/60 dark:bg-slate-900 shadow-xs space-y-3 flex flex-col justify-between"
 >
 <div>
 <div className="flex items-center justify-between gap-2">
 <span className={cn('px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider', colorClass)}>
 {cat.code || 'UJIAN'}
 </span>
 {canManage && (
 <div className="flex items-center gap-1">
 <button
 type="button"
 onClick={() => openEditCategoryModal(cat)}
 className="p-1 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
 >
 <Pencil className="h-3.5 w-3.5" />
 </button>
 <button
 type="button"
 onClick={() =>
 setDeleteDialog({
 isOpen: true,
 type: 'category',
 id: cat.id,
 title: `Hapus Kategori ${cat.name}?`,
 })
 }
 className="p-1 rounded-md text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
 >
 <Trash2 className="h-3.5 w-3.5" />
 </button>
 </div>
 )}
 </div>

 <h4 className="text-sm font-black text-slate-900 dark:text-white mt-2">
 {cat.name}
 </h4>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
 {cat.description || 'Tidak ada deskripsi tambahan.'}
 </p>
 </div>

 <div className="pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-xs text-slate-500">
 <span>Total Terjadwal:</span>
 <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
 {cat.exam_schedules_count || 0} Sesi
 </strong>
 </div>
 </div>
 )
 })}
 </div>
 </div>
 )}
 </div>

 {/* ── MODAL FORM JADWAL UJIAN ── */}
 <MasterFormModal
 isOpen={scheduleModalOpen}
 onClose={() => setScheduleModalOpen(false)}
 icon={CalendarDays}
 title={editingSchedule ? 'Edit Jadwal Ujian' : 'Tambah Jadwal Ujian Baru'}
 description="Tentukan tanggal, alokasi jam mandiri, mapel, rombel kelas, serta pengawas ujian."
 maxWidth="max-w-3xl"
 footer={
 <div className="flex items-center justify-end gap-2 w-full">
 <button
 type="button"
 onClick={() => setScheduleModalOpen(false)}
 className="h-9 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50 px-4 text-xs font-bold text-emerald-700 hover:bg-slate-200 transition-all cursor-pointer"
 >
 Batal
 </button>
 <button
 type="submit"
 form="exam-schedule-form"
 disabled={saveScheduleMutation.isPending}
 className="h-9 rounded-lg bg-emerald-600 dark:bg-slate-100 dark:text-slate-900 dark: px-5 text-xs font-bold shadow-sm hover:from-emerald-700 transition-all cursor-pointer disabled:opacity-50 text-white border border-emerald-200/80 dark:border-emerald-800/60 text-sm font-medium"
 >
 {saveScheduleMutation.isPending ? 'Menyimpan...' : 'Simpan Jadwal Ujian'}
 </button>
 </div>
 }
 >
 <form id="exam-schedule-form" onSubmit={handleSaveSchedule} className="space-y-4 text-xs font-semibold">
 {/* Baris 1: Kategori Ujian & Tanggal Ujian */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
 <Tag className="h-3.5 w-3.5 text-emerald-600" />
 <span>Kategori Ujian *</span>
 </label>
 <HeroUiFilterSelect
 ariaLabel="Kategori Ujian"
 value={scheduleForm.exam_category_id}
 onChange={(val) => setScheduleForm({ ...scheduleForm, exam_category_id: val })}
 options={formCategoryOptions}
 placeholder="Pilih Kategori Ujian"
 icon={Tag}
 searchable
 className="w-full"
 size="md"
 />
 </div>

 <div>
 <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
 <Calendar className="h-3.5 w-3.5 text-emerald-600" />
 <span>Tanggal Pelaksanaan *</span>
 </label>
 <DatePicker
 required
 value={scheduleForm.exam_date}
 onChange={(e) => setScheduleForm({ ...scheduleForm, exam_date: e.target.value })}
 inputClassName="h-11 font-mono"
 />
 </div>
 </div>

 {/* Baris 2: Waktu Mulai, Selesai, & Durasi Menit */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 bg-emerald-50/30 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/20 space-y-3">
 <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
 <Clock className="h-4 w-4 text-emerald-600" />
 <span>Pengaturan Waktu &amp; Jam Pelaksanaan Ujian</span>
 </h4>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div>
 <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-200">
 Jam Mulai (HH:mm) *
 </label>
 <Input
 required
 type="time"
 size="sm"
 value={scheduleForm.time_start}
 onChange={(e) => setScheduleForm({ ...scheduleForm, time_start: e.target.value })}
 className="font-mono"
 />
 </div>

 <div>
 <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-200">
 Jam Selesai (HH:mm) *
 </label>
 <Input
 required
 type="time"
 size="sm"
 value={scheduleForm.time_end}
 onChange={(e) => setScheduleForm({ ...scheduleForm, time_end: e.target.value })}
 className="font-mono"
 />
 </div>

 <div>
 <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-200">
 Durasi Ujian (Menit)
 </label>
 <div className="h-9 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3.5 flex items-center font-mono font-bold text-emerald-800 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-emerald-300">
 {scheduleForm.duration_minutes} Menit
 </div>
 </div>
 </div>
 </div>

 {/* Baris 3: Mata Pelajaran & Kelas / Rombel */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
 <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
 <span>Mata Pelajaran yang Diujikan *</span>
 </label>
 <HeroUiFilterSelect
 ariaLabel="Mata Pelajaran yang Diujikan"
 value={scheduleForm.subject_id}
 onChange={(val) => setScheduleForm({ ...scheduleForm, subject_id: val })}
 options={formSubjectOptions}
 placeholder="Pilih Mata Pelajaran"
 icon={BookOpen}
 searchable
 className="w-full"
 size="md"
 />
 </div>

 <div>
 <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
 <GraduationCap className="h-3.5 w-3.5 text-emerald-600" />
 <span>Kelas / Rombel Peserta *</span>
 </label>
 <HeroUiFilterSelect
 ariaLabel="Kelas / Rombel Peserta"
 value={scheduleForm.kelas_id}
 onChange={(val) => setScheduleForm({ ...scheduleForm, kelas_id: val })}
 options={formKelasOptions}
 placeholder="Pilih Kelas / Rombel"
 icon={GraduationCap}
 searchable
 className="w-full"
 size="md"
 />
 </div>
 </div>

 {/* Baris 4: Ruang Ujian & Guru/Tendik Pengawas */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
 <DoorOpen className="h-3.5 w-3.5 text-emerald-600" />
 <span>Ruang Ujian</span>
 </label>
 <input
 type="text"
 value={scheduleForm.room}
 onChange={(e) => setScheduleForm({ ...scheduleForm, room: e.target.value })}
 placeholder="Contoh: Lab Komputer 1 / Ruang 10-A"
 className="h-9 w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-white px-3.5 outline-none focus:border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-white"
 />
 </div>

 <div>
 <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
 <Users className="h-3.5 w-3.5 text-emerald-600" />
 <span>Guru / Tendik Pengawas Ujian</span>
 </label>
 <HeroUiFilterSelect
 ariaLabel="Pengawas Ujian"
 value={scheduleForm.invigilator_id}
 onChange={(val) => setScheduleForm({ ...scheduleForm, invigilator_id: val })}
 options={formInvigilatorOptions}
 placeholder="Pilih Guru/Tendik Pengawas"
 icon={UserCheck}
 searchable
 className="w-full"
 size="md"
 />
 </div>
 </div>

 {/* Catatan Tambahan */}
 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-800 dark:text-slate-100">
 Catatan Khusus (Petunjuk Peserta / Pengawas)
 </label>
 <input
 type="text"
 value={scheduleForm.notes}
 onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
 placeholder="Contoh: Membawa pensil 2B, kalkulator dilarang..."
 className="h-9 w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-white px-3.5 outline-none focus:border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-white"
 />
 </div>
 </form>
 </MasterFormModal>

 {/* ── MODAL FORM KATEGORI UJIAN (DINAMIS) ── */}
 <MasterFormModal
 isOpen={categoryModalOpen}
 onClose={() => setCategoryModalOpen(false)}
 icon={Tag}
 title={editingCategory ? 'Edit Kategori Ujian' : 'Tambah Kategori Ujian Baru'}
 description="Kelola kategori evaluasi seperti PTS, PAS, PAT Kenaikan Kelas, dan Ujian Praktik."
 maxWidth="max-w-xl"
 footer={
 <div className="flex items-center justify-end gap-2 w-full">
 <button
 type="button"
 onClick={() => setCategoryModalOpen(false)}
 className="h-9 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50 px-4 text-xs font-bold text-emerald-700 hover:bg-slate-200 transition-all cursor-pointer"
 >
 Batal
 </button>
 <button
 type="submit"
 form="exam-category-form"
 disabled={saveCategoryMutation.isPending}
 className="h-9 rounded-lg bg-emerald-600 dark:bg-slate-100 dark:text-slate-900 dark: px-5 text-xs font-bold shadow-sm hover:from-emerald-700 transition-all cursor-pointer disabled:opacity-50 text-white border border-emerald-200/80 dark:border-emerald-800/60 text-sm font-medium"
 >
 {saveCategoryMutation.isPending ? 'Menyimpan...' : 'Simpan Kategori'}
 </button>
 </div>
 }
 >
 <form id="exam-category-form" onSubmit={handleSaveCategory} className="space-y-4 text-xs font-semibold">
 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-800 dark:text-slate-100">
 Nama Kategori Ujian *
 </label>
 <input
 required
 type="text"
 value={categoryForm.name}
 onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
 placeholder="Contoh: Penilaian Akhir Tahun (PAT Kenaikan Kelas)"
 className="h-9 w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-white px-3.5 outline-none focus:border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-white"
 />
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-800 dark:text-slate-100">
 Kode Singkatan (Label)
 </label>
 <input
 type="text"
 value={categoryForm.code}
 onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value })}
 placeholder="Contoh: PAT / PTS"
 className="h-9 w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-white px-3.5 uppercase font-mono outline-none focus:border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-white"
 />
 </div>

 <div>
 <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
 <Palette className="h-3.5 w-3.5 text-emerald-600" />
 <span>Warna Lencana Badge</span>
 </label>
 <HeroUiFilterSelect
 ariaLabel="Warna Lencana Badge"
 value={categoryForm.color}
 onChange={(val) => setCategoryForm({ ...categoryForm, color: val })}
 options={categoryColorOptions}
 placeholder="Pilih Warna"
 icon={Palette}
 className="w-full"
 size="md"
 />
 </div>
 </div>

 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-800 dark:text-slate-100">
 Keterangan / Deskripsi
 </label>
 <TextArea
 rows={3}
 value={categoryForm.description}
 onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
 placeholder="Deskripsi tujuan atau ketentuan kategori ujian..."
 />
 </div>
 </form>
 </MasterFormModal>

 {/* ── DIALOG KONFIRMASI HAPUS ── */}
 <MasterDeleteDialog
 isOpen={deleteDialog.isOpen}
 onClose={() => setDeleteDialog({ isOpen: false, type: '', id: null, title: '' })}
 onConfirm={() => deleteMutation.mutate({ type: deleteDialog.type, id: deleteDialog.id })}
 title={deleteDialog.title}
 description="Data yang dihapus akan dipindahkan ke tempat sampah dan tidak akan tampil di jadwal aktif."
 isLoading={deleteMutation.isPending}
 />

 {/* ── DIRECT CHAT / KOORDINASI PENGAWAS MODAL ── */}
 <AppModal
 isOpen={Boolean(activeChatUser)}
 onClose={() => setActiveChatUser(null)}
 title={activeChatUser?.nama_lengkap || 'Koordinasi Pengawas'}
 description={activeChatUser ? `Pengawas Ujian • ${activeChatUser.niy ? `NIY ${activeChatUser.niy}` : 'Personel Sekolah'}` : ''}
 icon={UserCheck}
 maxWidth="max-w-lg"
 footer={
 activeChatUser ? (
 <div className="flex w-full items-center justify-end gap-2">
 <a
 href={`https://wa.me/?text=${encodeURIComponent(`Assalamu'alaikum ${activeChatUser.nama_lengkap}, ${chatMessage || 'koordinasi terkait pengawasan ujian periodik.'}`)}`}
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex h-9.5 items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 hover:bg-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-all"
 >
 <Phone className="h-4 w-4 text-emerald-600" />
 <span>Kirim via WhatsApp</span>
 </a>
 <button
 type="button"
 onClick={() => {
 if (!chatMessage.trim()) {
 notify('Peringatan', 'Tulis pesan sebelum mengirim.', 'warning')
 return
 }
 notify('Terkirim', `Pesan berhasil dikirimkan ke ${activeChatUser.nama_lengkap}.`, 'success')
 setActiveChatUser(null)
 setChatMessage('')
 }}
 className="inline-flex h-9.5 items-center gap-1.5 rounded-xl border-2 border-emerald-600 bg-emerald-600 px-5 text-xs font-black text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer"
 >
 <Send className="h-4 w-4" />
 <span>Kirim Pesan Internal</span>
 </button>
 </div>
 ) : null
 }
 >
 {activeChatUser && (
 <div className="space-y-4">
 {/* Quick Templates */}
 <div>
 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
 Template Cepat Koordinasi:
 </label>
 <div className="flex flex-wrap gap-1.5">
 {[
 "Mengingatkan jadwal pengawasan ujian hari ini.",
 "Mohon hadir 15 menit sebelum ujian dimulai.",
 "Harap laporkan absensi peserta ujian setelah selesai.",
 ].map((tpl, i) => (
 <button
 key={i}
 type="button"
 onClick={() => setChatMessage(tpl)}
 className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-800 transition-all text-left cursor-pointer"
 >
 {tpl}
 </button>
 ))}
 </div>
 </div>

 {/* Input Pesan */}
 <div className="mt-4">
 <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">
 Pesan Koordinasi:
 </label>
 <TextArea
 rows={3}
 value={chatMessage}
 onChange={(e) => setChatMessage(e.target.value)}
 placeholder="Tulis pesan pengingat, instruksi khusus ruang ujian, dsb..."
 />
 </div>
 </div>
 )}
 </AppModal>
 </PageContainer>
 )
}
