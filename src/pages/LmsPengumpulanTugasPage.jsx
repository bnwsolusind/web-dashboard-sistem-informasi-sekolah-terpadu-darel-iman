import { HeroUiHeader } from "../components/ui/HeroUiHeader"
import React, { useState, useEffect, useMemo } from 'react'
import {
  Navigate
} from 'react-router-dom'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  UploadCloud,
  FileText,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Award,
  BookOpen,
  Eye,
  ExternalLink,
  File,
  AlertTriangle,
  FileCheck,
  Edit3,
  Trash2,
  Users
} from 'lucide-react'
import Swal from '@/components/ui/compat/swal-heroui'
import {
  lmsPengumpulanTugasService
} from '../services/lmsPengumpulanTugasService'
import {
  api
} from '../services/api'
import HeroUiFilterSelect from '../components/ui/HeroUiFilterSelect'
import {
  useAuthStore
} from '../stores/authStore'
import {
  useUnitStore
} from '../stores/unitStore'
import {
  AppPageHeader,
  KpiCard,
  AppFilterBar,
  AppSearch,
  ActionDropdown,
  AppModal,
  AppDrawer,
  PersonAvatar,
  PersonIdentityCell,
  KpiStatCard
} from '../components/app'
import InAppEmbedViewerModal from '../components/portal/InAppEmbedViewerModal'
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
  PrintOptionModal,
} from '../components/master-data'
import AppDataTable from '../components/app/AppDataTable'
import MobileDataCard from '../components/app/MobileDataCard'
import CsvImportModal from '../components/master-data/CsvImportModal'
import {
  TableRoot,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@/components/ui/table'
import {
  RotateCcw,
  Printer,
  Search
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

export default function LmsPengumpulanTugasPage({ embedded = false, hideBreadcrumb = false, hidePageHeader = false, tabNav = null }) {
 const user = useAuthStore((state) => state.user)
 const activeUnit = useUnitStore((state) => state.activeUnit)

 const userRoles = useMemo(() => {
 if (!user?.roles) return []
 return user.roles.map((r) => (typeof r === 'string' ? r : r.name || r.role_name || ''))
 }, [user])

 const isSupervisor = useMemo(() => {
 const rList = userRoles.map((r) => r.toLowerCase())
 const mainRole = String(user?.role || '').toLowerCase()
 const checkRole = (name) => rList.some((r) => r.includes(name)) || mainRole.includes(name)
 return (
 checkRole('super admin') ||
 checkRole('superadmin') ||
 checkRole('admin') ||
 checkRole('operator') ||
 checkRole('tata usaha') ||
 checkRole('tata_usaha') ||
 checkRole('tu') ||
 checkRole('kepala sekolah') ||
 checkRole('kepala_sekolah') ||
 checkRole('kepsek') ||
 checkRole('principal') ||
 checkRole('waka') ||
 checkRole('kurikulum') ||
 checkRole('divisi pendidikan') ||
 checkRole('divisi_pendidikan') ||
 checkRole('kabid') ||
 checkRole('yayasan')
 )
 }, [userRoles, user?.role])

 const isTeacherOnly = useMemo(() => {
 if (isSupervisor) return false
 const rList = userRoles.map((r) => r.toLowerCase())
 const mainRole = String(user?.role || '').toLowerCase()
 return (
 rList.some((r) => r.includes('guru') || r.includes('wali_kelas') || r.includes('wali kelas') || r.includes('musyrif') || r.includes('pembimbing')) ||
 mainRole.includes('guru')
 )
 }, [isSupervisor, userRoles, user?.role])

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
 user?.school_info?.id,
 ].filter(Boolean)
 return candidateIds.length > 0 ? String(candidateIds[0]) : null
 }, [user])

 const [dataPengumpulan, setDataPengumpulan] = useState([])
 const [embedViewer, setEmbedViewer] = useState({
 isOpen: false,
 url: '',
 title: '',
 subtitle: '',
 })

 const handleOpenEmbed = (url, title = 'Lampiran Tugas', subtitle = 'Pratinjau Dalam Aplikasi') => {
 if (!url) return
 setEmbedViewer({
 isOpen: true,
 url,
 title,
 subtitle,
 })
 }

 const [options, setOptions] = useState({
 penugasan: [],
 siswa: [],
 status: [
 { id: 'belum', label: 'Belum Kumpul' },
 { id: 'dikumpulkan', label: 'Dikumpulkan' },
 { id: 'terlambat', label: 'Terlambat' },
 { id: 'dinilai', label: 'Sudah Dinilai' },
 { id: 'revisi', label: 'Perlu Revisi' },
 ],
 })

 const [stats, setStats] = useState({
 total: 0,
 dikumpulkan: 0,
 terlambat: 0,
 dinilai: 0,
 belum_dinilai: 0,
 revisi: 0,
 })

 const [loading, setLoading] = useState(true)
 const [errorMsg, setErrorMsg] = useState('')
 const [successMsg, setSuccessMsg] = useState('')

 // Filters & Pagination
 const [search, setSearch] = useState('')
 const debouncedSearch = useDebounce(search, 350)
 const [selectedPenugasan, setSelectedPenugasan] = useState('')
 const [selectedSiswa, setSelectedSiswa] = useState('')
 const [selectedStatus, setSelectedStatus] = useState('')
 const [page, setPage] = useState(1)
 const [pagination, setPagination] = useState({
 current_page: 1,
 last_page: 1,
 total: 0,
 per_page: 15,
 })

 // Print & Import State
 const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
 const [importOpen, setImportOpen] = useState(false)

 const handleExportCSV = () => {
 if (!dataPengumpulan.length) return
 const headers = ['ID', 'Siswa', 'Penugasan', 'Tanggal Kumpul', 'Nilai', 'Status']
 const rows = dataPengumpulan.map((item) => [
 item.id,
 `"${(item.siswa?.nama || '').replace(/"/g, '""')}"`,
 `"${(item.penugasan?.judul || '').replace(/"/g, '""')}"`,
 item.tanggal_pengumpulan || '-',
 item.nilai ?? '-',
 item.status || '-',
 ])
 const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
 const encodedUri = encodeURI(csvContent)
 const link = document.createElement('a')
 link.setAttribute('href', encodedUri)
 link.setAttribute('download', `pengumpulan_tugas_${new Date().toISOString().slice(0, 10)}.csv`)
 document.body.appendChild(link)
 link.click()
 document.body.removeChild(link)
 }

 const handleImport = (file) => {
 Swal.fire({
 icon: 'success',
 title: 'Import Berhasil',
 text: `File ${file.name} telah diproses.`,
 confirmButtonColor: '#059669',
 })
 }

 // Modal Form State (Submit / Grade / Edit)
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [editId, setEditId] = useState(null)
 const [formLoading, setFormLoading] = useState(false)

 const [formData, setFormData] = useState({
 penugasan_id: '',
 siswa_id: '',
 file: '',
 link: '',
 catatan: '',
 nilai: '',
 status: 'dikumpulkan',
 })

 // Detail Drawer State
 const [selectedDetail, setSelectedDetail] = useState(null)
 const [isDetailOpen, setIsDetailOpen] = useState(false)

 // Hover & Row Detail Modal State
 const [rowDetailItem, setRowDetailItem] = useState(null)
 const [showRowDetailModal, setShowRowDetailModal] = useState(false)

 const fetchOptionsAndStats = async () => {
 try {
 let penugasanOptions = []
 let siswaOptions = []

 try {
 const optRes = await lmsPengumpulanTugasService.getOptions()
 const optData = optRes?.data || optRes
 if (optData) {
 if (Array.isArray(optData.penugasan) && optData.penugasan.length > 0) {
 penugasanOptions = optData.penugasan
 }
 if (Array.isArray(optData.siswa) && optData.siswa.length > 0) {
 siswaOptions = optData.siswa
 }
 }
 } catch (errOpt) {
 console.warn('Error from main options endpoint:', errOpt)
 }

 // Fallback for Penugasan if empty
 if (penugasanOptions.length === 0) {
 try {
 const penRes = await api.get('/lms/penugasan', { params: { per_page: 100 } })
 const penList = penRes?.data?.data || penRes?.data || []
 if (Array.isArray(penList)) {
 penugasanOptions = penList.map((p) => ({
 id: p.id,
 label: p.judul_tugas || p.judul || 'Penugasan',
 subject: p.subject?.nama_mapel || p.subject?.name || (typeof p.subject === 'string' ? p.subject : null),
 kelas: p.kelas?.nama_kelas || p.kelas?.kode_kelas || (typeof p.kelas === 'string' ? p.kelas : null),
 }))
 }
 } catch (errPen) {
 console.warn('Fallback penugasan error:', errPen)
 }
 }

 // Fallback for Siswa if empty
 if (siswaOptions.length === 0) {
 try {
 const stdRes = await api.get('/students', { params: { per_page: 100 } })
 const stdList = stdRes?.data?.data || stdRes?.data || []
 if (Array.isArray(stdList)) {
 siswaOptions = stdList.map((s) => ({
 id: s.id,
 label: s.full_name || s.name || s.nama_lengkap || 'Siswa',
 nisn: s.nisn || s.metadata?.nisn || null,
 }))
 }
 } catch (errStd) {
 console.warn('Fallback student error:', errStd)
 }
 }

 setOptions((prev) => ({
 ...prev,
 penugasan: penugasanOptions,
 siswa: siswaOptions,
 }))

 try {
 const statRes = await lmsPengumpulanTugasService.getStats()
 if (statRes && (statRes.data || statRes.total !== undefined)) {
 setStats(statRes.data || statRes)
 }
 } catch (errStat) {
 console.warn('Error fetching stats:', errStat)
 }
 } catch (err) {
 console.error('Error in fetchOptionsAndStats:', err)
 }
 }

 const fetchData = async () => {
 setLoading(true)
 setErrorMsg('')
 try {
 const params = {
 page,
 per_page: 15,
 search: debouncedSearch || undefined,
 penugasan_id: selectedPenugasan || undefined,
 siswa_id: selectedSiswa || undefined,
 status: selectedStatus || undefined,
 }
 if (userUnitId) params.unit_pendidikan_id = userUnitId
 if (activeUnit) params.jenjang = activeUnit

 const res = await lmsPengumpulanTugasService.getDaftar(params)
 if (res && res.data) {
 let rawData = Array.isArray(res.data) ? res.data : (res.data?.data || [])
 let filteredData = rawData.filter((item) => {
 if (!item) return false
 const itemUnitId = item.unit_pendidikan_id || item.unit_id || item.siswa?.unit_pendidikan_id || item.penugasan?.unit_pendidikan_id
 if (userUnitId && itemUnitId) return String(itemUnitId) === String(userUnitId)
 return true
 })
 setDataPengumpulan(filteredData)
 if (res.meta) {
 setPagination({
 current_page: res.meta.current_page || 1,
 last_page: res.meta.last_page || 1,
 total: res.meta.total || filteredData.length,
 per_page: res.meta.per_page || 15,
 })
 }
 }
 } catch (err) {
 console.error('Gagal memuat data pengumpulan tugas:', err)
 setErrorMsg('Gagal mengambil data pengumpulan tugas.')
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 fetchOptionsAndStats()
 }, [])

 useEffect(() => {
 fetchData()
 }, [page, debouncedSearch, selectedPenugasan, selectedSiswa, selectedStatus])

 const handleSearchSubmit = (e) => {
 if (e) e.preventDefault()
 setPage(1)
 fetchData()
 }

 const handleResetFilter = () => {
 setSearch('')
 setSelectedPenugasan('')
 setSelectedSiswa('')
 setSelectedStatus('')
 setPage(1)
 }

 const handleOpenCreateModal = () => {
 setEditId(null)
 setFormData({
 penugasan_id: '',
 siswa_id: '',
 file: '',
 link: '',
 catatan: '',
 nilai: '',
 status: 'dikumpulkan',
 })
 if (options.penugasan.length === 0 || options.siswa.length === 0) {
 fetchOptionsAndStats()
 }
 setIsModalOpen(true)
 }

 const handleOpenEditModal = (item) => {
 setEditId(item.id)
 setFormData({
 penugasan_id: item.penugasan_id || '',
 siswa_id: item.siswa_id || '',
 file: item.file || item.file_path || '',
 link: item.link || item.url_link || '',
 catatan: item.catatan || item.catatan_guru || item.jawaban_teks || '',
 nilai: item.nilai !== null && item.nilai !== undefined ? item.nilai : (item.nilai_guru ?? ''),
 status: item.status || 'dikumpulkan',
 })
 setIsModalOpen(true)
 }

 const handleSubmitForm = async (e) => {
 e.preventDefault()
 setFormLoading(true)
 setErrorMsg('')
 setSuccessMsg('')

 try {
 const payload = {
 penugasan_id: formData.penugasan_id,
 siswa_id: formData.siswa_id,
 file: formData.file,
 link: formData.link,
 catatan: formData.catatan,
 nilai: formData.nilai !== '' ? parseFloat(formData.nilai) : null,
 status: formData.status,
 }

 if (editId) {
 await lmsPengumpulanTugasService.update(editId, payload)
 setSuccessMsg('Pengumpulan tugas & penilaian berhasil diperbarui.')
 } else {
 await lmsPengumpulanTugasService.create(payload)
 setSuccessMsg('Submission pengumpulan tugas baru berhasil ditambahkan.')
 }

 setIsModalOpen(false)
 fetchData()
 fetchOptionsAndStats()
 } catch (err) {
 console.error(err)
 const errRes = err.response?.data?.message || 'Gagal menyimpan pengumpulan tugas.'
 setErrorMsg(errRes)
 } finally {
 setFormLoading(false)
 }
 }

 const handleDelete = async (id, namaSiswa) => {
 const result = await Swal.fire({
 title: 'Hapus Submission?',
 text: `Apakah Anda yakin ingin menghapus data pengumpulan tugas dari ${namaSiswa || 'Siswa'}?`,
 icon: 'warning',
 showCancelButton: true,
 confirmButtonColor: '#059669',
 cancelButtonColor: '#d33',
 confirmButtonText: 'Ya, Hapus!',
 cancelButtonText: 'Batal',
 customClass: {
 popup: 'rounded-xl shadow-2xl border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-white',
 },
 })

 if (result.isConfirmed) {
 try {
 await lmsPengumpulanTugasService.delete(id)
 Swal.fire({
 title: 'Berhasil!',
 text: 'Data pengumpulan tugas berhasil dihapus.',
 icon: 'success',
 timer: 2000,
 showConfirmButton: false,
 })
 fetchData()
 fetchOptionsAndStats()
 } catch (err) {
 console.error(err)
 Swal.fire('Error!', 'Gagal menghapus data pengumpulan tugas.', 'error')
 }
 }
 }

 const handleOpenDetail = (item) => {
 setSelectedDetail(item)
 setIsDetailOpen(true)
 }

 const getStatusBadge = (status) => {
 switch (status) {
 case 'dinilai':
 return (
 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60">
 <CheckCircle2 className="w-3.5 h-3.5" />
 Sudah Dinilai
 </span>
 )
 case 'dikumpulkan':
 return (
 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-emerald-800/60">
 <UploadCloud className="w-3.5 h-3.5" />
 Dikumpulkan
 </span>
 )
 case 'terlambat':
 return (
 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-emerald-800/60">
 <Clock className="w-3.5 h-3.5" />
 Terlambat
 </span>
 )
 case 'revisi':
 return (
 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-purple-950/60 dark:text-purple-300 dark:border-emerald-800/60">
 <AlertTriangle className="w-3.5 h-3.5" />
 Perlu Revisi
 </span>
 )
 default:
 return (
 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700/80">
 <Clock className="w-3.5 h-3.5" />
 Belum Kumpul
 </span>
 )
 }
 }

 const activeFilterCount =
 (selectedPenugasan ? 1 : 0) + (selectedSiswa ? 1 : 0) + (selectedStatus ? 1 : 0) + (search ? 1 : 0)

 const pageActions = (
 <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
 <SquircleActionButton
 variant="import"
 label="Import"
 onClick={() => setImportOpen(true)}
 />
 <SquircleActionButton
 variant="export"
 label="Export"
 onClick={handleExportCSV}
 />
 <SquircleActionButton
 variant="view"
 label="Cetak"
 icon={Printer}
 onClick={() => setIsPrintModalOpen(true)}
 />
 <SquircleActionButton
 variant="primary"
 label="Input / Kumpul Tugas"
 onClick={handleOpenCreateModal}
 />
 </div>
 )


  // Canonical Columns for Pengumpulan Tugas
  const pengumpulanColumns = useMemo(() => [
    {
      key: 'siswa_penugasan',
      label: 'Siswa & Penugasan',
      render: (item) => (
        <div>
          <PersonIdentityCell
            name={item?.siswa?.nama || 'Siswa'}
            subtitle={item?.siswa?.nisn ? `NISN: ${item.siswa.nisn}` : 'NISN -'}
            avatarSrc={item?.siswa?.foto || item?.siswa?.photo_url || item?.siswa?.avatar_url}
          />
          <div className="mt-1 pl-10 text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-xs">
            {item?.penugasan?.judul || item?.penugasan?.judul_tugas || 'Penugasan'}
            <span className="text-[#059669] dark:text-[#10B981] font-normal ml-1">
              • {item?.penugasan?.kelas || 'Kelas'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'file_link',
      label: 'Berkas / Tautan',
      render: (item) => (
        <div className="flex flex-col gap-1 text-xs">
          {item?.file || item?.file_path ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleOpenEmbed(item.file || item.file_path, `Berkas Siswa: ${item.siswa?.nama || 'Siswa'}`, 'Pratinjau Berkas')
              }}
              className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-900 font-semibold hover:underline dark:text-emerald-400 dark:hover:text-emerald-300 text-left cursor-pointer"
            >
              <File className="w-3.5 h-3.5" />
              <span>Berkas (In-App)</span>
            </button>
          ) : null}

          {item?.link || item?.url_link ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleOpenEmbed(item.link || item.url_link, `Tautan Siswa: ${item.siswa?.nama || 'Siswa'}`, 'Pratinjau Tautan')
              }}
              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold hover:underline dark:text-blue-400 dark:hover:text-blue-300 text-left cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Tautan (In-App)</span>
            </button>
          ) : null}

          {!item?.file && !item?.file_path && !item?.link && !item?.url_link && (
            <span className="text-slate-400 dark:text-slate-500 italic">Hanya Jawaban Teks</span>
          )}
        </div>
      ),
    },
    {
      key: 'waktu_status',
      label: 'Waktu & Status',
      render: (item) => (
        <div className="space-y-1">
          <div className="text-xs text-slate-600 dark:text-slate-300">
            {item?.waktu_kumpul || '-'}
          </div>
          {getStatusBadge(item?.status)}
        </div>
      ),
    },
    {
      key: 'nilai_catatan',
      label: 'Nilai & Catatan',
      render: (item) => (
        <div>
          {item?.nilai !== null && item?.nilai !== undefined ? (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-[#059669] font-bold text-sm dark:bg-emerald-950/80 dark:text-[#10B981]">
              {item.nilai} / 100
            </span>
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-500 italic">Belum Dinilai</span>
          )}
          {item?.catatan && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 italic">
              "{item.catatan}"
            </p>
          )}
        </div>
      ),
    },
  ], [])

 const pageContent = (
 <div className="lms-pengumpulan-page space-y-6">
 <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
 {/* Master Canonical Page Header */}
      {!embedded && !hidePageHeader && (
        <div className="mb-6">
          <HeroUiHeader
            title="Pengumpulan Tugas Siswa"
            subtitle="Monitoring dan verifikasi pengumpulan berkas tugas siswa, status ketepatan waktu, dan penilaian rubrik."
            badge="Monitoring Pengumpulan Tugas"
            icon={UploadCloud}
          />
        </div>
      )}

 {/* Alert Notifications */}
 {successMsg && (
 <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 text-sm font-medium dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300">
 <div className="flex items-center gap-3">
 <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
 <span>{successMsg}</span>
 </div>
 <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-200">
 <X className="w-4 h-4" />
 </button>
 </div>
 )}

 {errorMsg && (
 <div className="flex items-center justify-between p-4 rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-800 text-sm font-medium dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-300">
 <div className="flex items-center gap-3">
 <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
 <span>{errorMsg}</span>
 </div>
 <button onClick={() => setErrorMsg('')} className="text-rose-600 hover:text-rose-800 dark:hover:text-rose-200">
 <X className="w-4 h-4" />
 </button>
 </div>
 )}

 {/* KPI STATS CARDS */}
 <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <ModernKpiCard
 icon={UploadCloud}
 label="Total Pengumpulan"
 value={stats.total || 0}
 subtext="Seluruh submission tugas"
 tone="emerald"
 onClick={() => {
 setSelectedStatus('')
 setPage(1)
 }}
 />
 <ModernKpiCard
 icon={Award}
 label="Sudah Dinilai"
 value={stats.dinilai || 0}
 subtext="Telah diberi nilai oleh guru"
 tone="teal"
 onClick={() => {
 setSelectedStatus('dinilai')
 setPage(1)
 }}
 />
 <ModernKpiCard
 icon={Clock}
 label="Belum Dinilai"
 value={stats.dikumpulkan || stats.belum_dinilai || 0}
 subtext="Menunggu pemeriksaan guru"
 tone="blue"
 onClick={() => {
 setSelectedStatus('dikumpulkan')
 setPage(1)
 }}
 />
 <ModernKpiCard
 icon={AlertTriangle}
 label="Terlambat Kumpul"
 value={stats.terlambat || 0}
 subtext="Melewati deadline"
 tone="amber"
 onClick={() => {
 setSelectedStatus('terlambat')
 setPage(1)
 }}
 />
 </motion.div>

 {/* Tab Navigation (Pindahkan di atas card datatable) */}
 {tabNav && <div className="my-2">{typeof tabNav === 'function' ? tabNav() : tabNav}</div>}

 {/* CANONICAL EMERALD DATATABLE CONTAINER */}
 <motion.div variants={itemVariants}>
        <AppDataTable
          id="tabel-pengumpulan-tugas"
          title="Daftar Pengumpulan & Submission Tugas"
          subtitle="Pemeriksaan dan penilaian lembar kerja siswa"
          icon={FileCheck}
          countLabel={`${pagination.total || dataPengumpulan.length} Data`}
          actions={pageActions}
          search={search}
          onSearchChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          searchPlaceholder="Cari siswa, tugas, catatan, berkas..."
          filters={
            <div className="flex flex-wrap items-center justify-between gap-2.5 w-full">
              <div className="flex flex-wrap items-center gap-2">
                <HeroUiFilterSelect
                  value={selectedPenugasan}
                  onChange={(val) => {
                    setSelectedPenugasan(val)
                    setPage(1)
                  }}
                  options={[
                    { value: '', label: 'Semua Penugasan' },
                    ...options.penugasan.map((p) => ({
                      value: String(p.id),
                      label: p.label,
                    })),
                  ]}
                  placeholder="Semua Penugasan"
                  icon={BookOpen}
                  ariaLabel="Pilih Penugasan"
                  size="sm"
                  searchable
                  className="w-full sm:w-auto min-w-[160px]"
                />

                <HeroUiFilterSelect
                  value={selectedSiswa}
                  onChange={(val) => {
                    setSelectedSiswa(val)
                    setPage(1)
                  }}
                  options={[
                    { value: '', label: 'Semua Siswa' },
                    ...options.siswa.map((s) => ({
                      value: String(s.id),
                      label: s.label,
                    })),
                  ]}
                  placeholder="Semua Siswa"
                  icon={Users}
                  ariaLabel="Pilih Siswa"
                  size="sm"
                  searchable
                  className="w-full sm:w-auto min-w-[160px]"
                />

                <HeroUiFilterSelect
                  value={selectedStatus}
                  onChange={(val) => {
                    setSelectedStatus(val)
                    setPage(1)
                  }}
                  options={[
                    { value: '', label: 'Semua Status' },
                    ...options.status.map((st) => ({
                      value: String(st.id),
                      label: st.label,
                    })),
                  ]}
                  placeholder="Semua Status"
                  icon={CheckCircle2}
                  ariaLabel="Pilih Status"
                  size="sm"
                  className="w-full sm:w-auto min-w-[140px]"
                />
              </div>

              {(search || selectedPenugasan || selectedSiswa || selectedStatus) && (
                <button
                  type="button"
                  onClick={handleResetFilter}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:text-rose-400 transition-all cursor-pointer"
                >
                  <RotateCcw className="size-3" /> Reset Filter
                </button>
              )}
            </div>
          }
          columns={pengumpulanColumns}
          data={dataPengumpulan}
          isLoading={loading}
          page={pagination.current_page}
          totalPages={pagination.last_page}
          onPageChange={setPage}
          onRowClick={(item) => {
            setRowDetailItem(item)
            setShowRowDetailModal(true)
          }}
          onView={(item) => handleOpenDetail(item)}
          onEdit={(item) => handleOpenEditModal(item)}
          onDelete={(item) => handleDelete(item.id, item.siswa?.nama)}
          renderMobileCard={(item) => (
            <MobileDataCard
              key={item?.id}
              title={item?.siswa?.nama || 'Siswa'}
              subtitle={item?.penugasan?.judul || 'Penugasan'}
              badge={item?.status}
              badgeVariant={item?.status === 'dinilai' ? 'success' : item?.status === 'terlambat' ? 'error' : 'neutral'}
              fields={[
                { label: 'NISN', value: item?.siswa?.nisn || '-', icon: Users },
                { label: 'Nilai', value: item?.nilai !== null && item?.nilai !== undefined ? `${item.nilai}/100` : 'Belum dinilai', icon: FileCheck },
                { label: 'Waktu', value: item?.waktu_kumpul || '-', icon: Clock },
              ]}
              onView={() => handleOpenDetail(item)}
              onEdit={() => handleOpenEditModal(item)}
              onDelete={() => handleDelete(item.id, item.siswa?.nama)}
            />
          )}
        />
 </motion.div>

 {/* ROW DETAIL MODAL POPUP — Pengumpulan Tugas */}
 {showRowDetailModal && rowDetailItem && (
 <div
 className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
 onClick={() => setShowRowDetailModal(false)}
 >
 <div
 className="bg-white dark:bg-[#182232] rounded-3xl w-full max-w-lg shadow-2xl shadow-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-700/80 dark:border-emerald-800/60 dark:border-emerald-700/80 overflow-hidden"
 onClick={(e) => e.stopPropagation()}
 >
 {/* Header */}
 <div className="flex items-start justify-between px-6 py-4 border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50/50 dark:bg-slate-800/40">
 <div className="flex items-start gap-3">
 <div className="w-10 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
 <UploadCloud className="w-5 h-5" />
 </div>
 <div>
 <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{rowDetailItem.siswa?.nama || 'Siswa'}</h2>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 {rowDetailItem.penugasan?.judul || 'Penugasan'} · {rowDetailItem.status || '-'}
 </p>
 </div>
 </div>
 <button
 onClick={() => setShowRowDetailModal(false)}
 className="p-1.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-400 shrink-0"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Body */}
 <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
 {/* Status badge */}
 <div className="flex flex-wrap gap-2">
 {getStatusBadge(rowDetailItem.status)}
 {rowDetailItem.nilai !== null && rowDetailItem.nilai !== undefined && (
 <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60">
 <Award className="w-3 h-3" />
 Nilai: {rowDetailItem.nilai} / 100
 </span>
 )}
 </div>

 {/* Info Grid */}
 <div className="grid grid-cols-2 gap-3">
 <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 col-span-2">
 <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Penugasan</p>
 <p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">{rowDetailItem.penugasan?.judul || '-'}</p>
 </div>
 <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
 <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Kelas</p>
 <p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">{rowDetailItem.penugasan?.kelas || '-'}</p>
 </div>
 <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
 <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Waktu Kumpul</p>
 <p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">{rowDetailItem.waktu_kumpul || '-'}</p>
 </div>
 </div>

 {/* Catatan */}
 {rowDetailItem.catatan && (
 <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-3">
 <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider mb-1">Catatan Guru</p>
 <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{rowDetailItem.catatan}</p>
 </div>
 )}
 </div>

 {/* Footer Actions */}
 <div className="px-6 py-4 border-t border-emerald-200/80 dark:border-emerald-700/80 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
 <button
 onClick={() => setShowRowDetailModal(false)}
 className="px-4 py-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition-colors"
 >
 Tutup
 </button>
 <div className="flex items-center gap-2">
 <button
 onClick={() => {
 setShowRowDetailModal(false)
 handleDelete(rowDetailItem.id, rowDetailItem.siswa?.nama)
 }}
 className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
 >
 <Trash2 className="w-3.5 h-3.5" />
 Hapus
 </button>
 <button
 onClick={() => {
 setShowRowDetailModal(false)
 handleOpenEditModal(rowDetailItem)
 }}
 className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#059669] text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
 >
 <Edit3 className="w-3.5 h-3.5" />
 Edit Data
 </button>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Modal Form for Create / Edit / Grade using AppModal */}
 <AppModal
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 title={editId ? 'Koreksi & Form Penilaian' : 'Input Submission Pengumpulan Tugas'}
 description="Lengkapi catatan penilaian, status submission, dan berkas tugas siswa."
 icon={editId ? Edit3 : UploadCloud}
 maxWidth="max-w-lg"
 footer={
 <div className="flex items-center justify-end gap-3 w-full">
 <button
 type="button"
 onClick={() => setIsModalOpen(false)}
 className="group inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 text-xs font-black text-white shadow-sm hover:from-rose-600 hover:to-red-800 active:scale-95 transition-all cursor-pointer"
 >
 <span className="flex size-5 items-center justify-center rounded-lg bg-white/20">
 <X className="size-3.5" strokeWidth={2.5} />
 </span>
 <span>Batal</span>
 </button>
 <button
 type="submit"
 form="lms-submission-form"
 disabled={formLoading}
 className="group inline-flex items-center gap-2 rounded-xl bg-white dark:bg-[#1B2433] px-5 py-2.5 text-xs font-black shadow-sm hover:from-emerald-600 hover:to-teal-800 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
 >
 <span className="flex size-5 items-center justify-center rounded-lg bg-white/20">
 {formLoading ? (
 <RefreshCw className="size-3.5 animate-spin" />
 ) : (
 <CheckCircle2 className="size-3.5" strokeWidth={2.5} />
 )}
 </span>
 <span>{formLoading ? 'Menyimpan...' : (editId ? 'Simpan Koreksi' : 'Kumpulkan Tugas')}</span>
 </button>
 </div>
 }
 >
 <form id="lms-submission-form" onSubmit={handleSubmitForm} className="space-y-4 text-sm">
 <div>
 <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
 Penugasan <span className="text-rose-500">*</span>
 </label>
 <HeroUiFilterSelect
 value={formData.penugasan_id}
 onChange={(val) => setFormData({ ...formData, penugasan_id: val })}
 options={options.penugasan.map((p) => ({
 value: String(p.id),
 label: `${p.label || p.judul_tugas || p.judul} ${p.subject ? `(${p.subject})` : ''}`,
 }))}
 placeholder="-- Pilih Penugasan --"
 ariaLabel="Pilih Penugasan"
 searchable
 className="w-full"
 />
 </div>

 <div>
 <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
 Siswa <span className="text-rose-500">*</span>
 </label>
 <HeroUiFilterSelect
 value={formData.siswa_id}
 onChange={(val) => setFormData({ ...formData, siswa_id: val })}
 options={options.siswa.map((s) => ({
 value: String(s.id),
 label: `${s.label || s.full_name || s.name || s.nama_lengkap} ${s.nisn ? `(${s.nisn})` : ''}`,
 }))}
 placeholder="-- Pilih Siswa --"
 ariaLabel="Pilih Siswa"
 searchable
 className="w-full"
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
 Status Submission
 </label>
 <HeroUiFilterSelect
 value={formData.status}
 onChange={(val) => setFormData({ ...formData, status: val })}
 options={options.status.map((st) => ({
 value: String(st.id),
 label: st.label,
 }))}
 placeholder="-- Pilih Status --"
 ariaLabel="Pilih Status Submission"
 className="w-full"
 />
 </div>

 <div>
 <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
 Nilai (0 - 100)
 </label>
 <input
 type="number"
 min="0"
 max="100"
 step="0.1"
 placeholder="Contoh: 90"
 value={formData.nilai}
 onChange={(e) => setFormData({ ...formData, nilai: e.target.value })}
 className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] dark:border-emerald-800/60 dark:bg-slate-900 dark:text-white"
 />
 </div>
 </div>

 <div>
 <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
 URL / Path File Lampiran (file)
 </label>
 <input
 type="text"
 placeholder="https://drive.google.com/... atau /storage/tugas/file.pdf"
 value={formData.file}
 onChange={(e) => setFormData({ ...formData, file: e.target.value })}
 className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] dark:border-emerald-800/60 dark:bg-slate-900 dark:text-white"
 />
 </div>

 <div>
 <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
 Link Tautan Eksternal (link)
 </label>
 <input
 type="url"
 placeholder="https://github.com/... atau https://docs.google.com/..."
 value={formData.link}
 onChange={(e) => setFormData({ ...formData, link: e.target.value })}
 className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] dark:border-emerald-800/60 dark:bg-slate-900 dark:text-white"
 />
 </div>

 <div>
 <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
 Catatan / Ulasan Guru & Teks Jawaban (catatan)
 </label>
 <textarea
 rows="3"
 placeholder="Tuliskan catatan apresiasi, saran perbaikan, atau rangkuman jawaban siswa..."
 value={formData.catatan}
 onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
 className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] dark:border-emerald-800/60 dark:bg-slate-900 dark:text-white"
 ></textarea>
 </div>
 </form>
 </AppModal>

 {/* Detail Drawer using AppDrawer */}
 <AppDrawer
 isOpen={isDetailOpen}
 onClose={() => setIsDetailOpen(false)}
 title="Detail Pengumpulan Tugas"
 >
 {selectedDetail && (
 <div className="space-y-6 text-sm">
 <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl space-y-2 border border-emerald-200/80 dark:border-emerald-800/60">
 <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Identitas Siswa</p>
 <PersonIdentityCell
 name={selectedDetail.siswa?.nama || 'Siswa'}
 subtitle={`NISN: ${selectedDetail.siswa?.nisn || '-'}`}
 avatarSrc={selectedDetail.siswa?.foto || selectedDetail.siswa?.photo_url || selectedDetail.siswa?.avatar_url}
 />
 </div>

 <div className="space-y-2">
 <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Penugasan</p>
 <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedDetail.penugasan?.judul || 'Judul Penugasan'}</p>
 <p className="text-xs text-[#059669] dark:text-[#10B981] font-medium">
 {selectedDetail.penugasan?.subject} • Kelas {selectedDetail.penugasan?.kelas}
 </p>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div className="bg-emerald-50/50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Nilai Akhir</p>
 <p className="text-xl font-bold text-[#059669] dark:text-[#10B981] mt-0.5">
 {selectedDetail.nilai !== null && selectedDetail.nilai !== undefined ? `${selectedDetail.nilai} / 100` : 'Belum Dinilai'}
 </p>
 </div>
 <div className="bg-blue-50/50 dark:bg-blue-950/40 p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Status</p>
 <div className="mt-1">{getStatusBadge(selectedDetail.status)}</div>
 </div>
 </div>

 {selectedDetail.jawaban_teks && (
 <div className="space-y-1">
 <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Teks Jawaban Siswa</p>
 <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 text-slate-700 dark:text-slate-300 whitespace-pre-line">
 {selectedDetail.jawaban_teks}
 </div>
 </div>
 )}

 {selectedDetail.file || selectedDetail.file_path ? (
 <div className="space-y-1">
 <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Berkas File</p>
 <button
 type="button"
 onClick={() => handleOpenEmbed(selectedDetail.file || selectedDetail.file_path, `Berkas: ${selectedDetail.siswa?.nama || 'Siswa'}`, 'Pratinjau File')}
 className="w-full flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 font-medium hover:bg-emerald-100 transition-colors cursor-pointer text-left"
 >
 <File className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
 <span className="flex-1 truncate">{selectedDetail.file || selectedDetail.file_path}</span>
 <Eye className="w-4 h-4 shrink-0" />
 </button>
 </div>
 ) : null}

 {selectedDetail.link || selectedDetail.url_link ? (
 <div className="space-y-1">
 <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tautan Dokumen / Video</p>
 <button
 type="button"
 onClick={() => handleOpenEmbed(selectedDetail.link || selectedDetail.url_link, `Tautan: ${selectedDetail.siswa?.nama || 'Siswa'}`, 'Pratinjau Tautan Web')}
 className="w-full flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/60 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 text-blue-800 dark:text-blue-300 font-medium hover:bg-blue-100 transition-colors cursor-pointer text-left"
 >
 <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
 <span className="flex-1 truncate">{selectedDetail.link || selectedDetail.url_link}</span>
 <Eye className="w-4 h-4 shrink-0" />
 </button>
 </div>
 ) : null}

 {selectedDetail.catatan && (
 <div className="space-y-1">
 <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Catatan Guru / Penilai</p>
 <div className="p-3 bg-amber-50 dark:bg-amber-950/60 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 text-amber-900 dark:text-amber-200 italic">
 "{selectedDetail.catatan}"
 </div>
 </div>
 )}

 <div className="pt-4 border-t border-emerald-200/80 dark:border-emerald-800/60 space-y-2 text-xs text-slate-500 dark:text-slate-400">
 <div className="flex justify-between">
 <span>Waktu Kumpul:</span>
 <span className="font-medium text-slate-700 dark:text-slate-300">{selectedDetail.waktu_kumpul || '-'}</span>
 </div>
 {selectedDetail.penilai && (
 <div className="flex justify-between">
 <span>Penilai (Guru):</span>
 <span className="font-medium text-slate-700 dark:text-slate-300">{selectedDetail.penilai.nama}</span>
 </div>
 )}
 </div>

 <div className="pt-4">
 <button
 onClick={() => {
 setIsDetailOpen(false)
 handleOpenEditModal(selectedDetail)
 }}
 className="w-full py-2.5 bg-[#059669] text-white rounded-xl font-semibold hover:bg-[#1E8E5A] transition-colors flex items-center justify-center gap-2 dark:bg-[#10B981] dark:text-slate-900"
 >
 <FileCheck className="w-4 h-4" />
 Koreksi / Beri Nilai
 </button>
 </div>
 </div>
 )}
 </AppDrawer>

 {/* Print Option Modal */}
 <PrintOptionModal
 isOpen={isPrintModalOpen}
 onClose={() => setIsPrintModalOpen(false)}
 title="Opsi Cetak Data Pengumpulan"
 subtitle="Pilih metode pencetakan atau unduh dokumen pengumpulan tugas"
 onPrintClean={() => {
 printCleanTable({
 title: 'Laporan Pengumpulan & Submission Tugas',
 data: dataPengumpulan,
 columns: [
 { header: 'Siswa', accessor: (row) => row.siswa?.nama || '-' },
 { header: 'Penugasan', accessor: (row) => row.penugasan?.judul || '-' },
 { header: 'Waktu Kumpul', accessor: (row) => row.waktu_kumpul || '-' },
 { header: 'Status', accessor: (row) => row.status || '-' },
 { header: 'Nilai', accessor: (row) => row.nilai ?? '-' },
 ],
 })
 setIsPrintModalOpen(false)
 }}
 onDownloadPdf={() => {
 downloadPdfTable({
 title: 'Laporan Pengumpulan & Submission Tugas',
 data: dataPengumpulan,
 columns: [
 { header: 'Siswa', accessor: (row) => row.siswa?.nama || '-' },
 { header: 'Penugasan', accessor: (row) => row.penugasan?.judul || '-' },
 { header: 'Waktu Kumpul', accessor: (row) => row.waktu_kumpul || '-' },
 { header: 'Status', accessor: (row) => row.status || '-' },
 { header: 'Nilai', accessor: (row) => row.nilai ?? '-' },
 ],
 filename: `laporan_pengumpulan_tugas_${new Date().toISOString().slice(0, 10)}.pdf`,
 })
 setIsPrintModalOpen(false)
 }}
 />

 <CsvImportModal
 isOpen={importOpen}
 onClose={() => setImportOpen(false)}
 title="Import Data Pengumpulan"
 onImport={handleImport}
 templateFields={['siswa_id', 'penugasan_id', 'jawaban_teks', 'nilai', 'status']}
 />

 {/* In-App Embed Viewer Modal */}
 <InAppEmbedViewerModal
 isOpen={embedViewer.isOpen}
 url={embedViewer.url}
 title={embedViewer.title}
 subtitle={embedViewer.subtitle}
 onClose={() => setEmbedViewer({ isOpen: false, url: '', title: '', subtitle: '' })}
 />
 </motion.div>
 </div>
 )

 if (!embedded && isTeacherOnly) {
 return <Navigate to="/portal-guru/workspace?tab=penugasan" replace />
 }

 return (
 <PageContainer maxW="7xl">
 {!(embedded || hideBreadcrumb) && (
 <div className="mb-4">
 <AppBreadcrumb
 items={[
 { label: 'LMS & Akademik', href: '/dashboard' },
 { label: 'Pengumpulan Tugas Siswa' },
 ]}
 />
 </div>
 )}
 {pageContent}
 </PageContainer>
 )
}
