import {
 KpiStatCard
} from '../components/app'
import AppModal from '../components/app/AppModal'
import CustomSelect from "../components/ui/CustomSelect"
import React, { useState, useEffect, useMemo } from 'react'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  Megaphone,
  Plus,
  RefreshCw,
  Search,
  Building2,
  Calendar,
  BookOpen,
  Award,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Globe,
  Trash2
} from 'lucide-react'
import {
  Download as Download1,
  Upload as Upload1,
  ArrowRightLeft as ArrowBothDirectionHorizontal2
} from 'lucide-react'
import {
  useAuthStore
} from '../stores/authStore'
import {
  usePengaturanStore
} from '../stores/pengaturanStore'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import ActionDropdown from '../components/app/ActionDropdown'
import PageToolbarActions from '../components/app/PageToolbarActions'
import { SquircleActionButton } from '../components/master-data'
import CsvImportModal from '../components/master-data/CsvImportModal'
import {
  educationUnitService
} from '../services/educationUnitService'
import {
  dashboardPemantauanService
} from '../services/dashboardPemantauanService'

import {
  Button
} from '../components/ui/button'
import {
  Badge
} from '@/components/ui/badge'
import {
  Breadcrumbs
} from '@/components/ui/breadcrumbs'
import {
  DatePicker
} from '@/components/ui/date-picker'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog'
import {
  Pagination
} from '@/components/ui/pagination'
import {
  TableRoot,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card'
import {
  MasterStatsGrid,
  MasterStatCard
} from '../components/master-data'
import {
  SmartScrollFab
} from '../components/common'

const STORAGE_KEY = 'school_news_announcements_db'

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

const DEFAULT_BASE_UNITS = [
 { id: 'all', name: 'Seluruh Unit (Yayasan)', code: 'YAYASAN' },
]

const CATEGORY_OPTIONS = [
 { id: 'PPDB', label: 'PPDB & Pendaftaran', color: 'amber', icon: Megaphone },
 { id: 'Akademik', label: 'Pengumuman Akademik', color: 'sky', icon: BookOpen },
 { id: 'Prestasi', label: 'Capaian Prestasi', color: 'purple', icon: Award },
 { id: 'Kegiatan', label: 'Kegiatan Sekolah', color: 'emerald', icon: Calendar },
 { id: 'Umum', label: 'Informasi Umum', color: 'cyan', icon: FileText },
]

export default function NewsManagementPage() {
 const user = useAuthStore((state) => state.user)
 const pengaturan = usePengaturanStore((state) => state.pengaturan)

 // 1. Dynamic Units State (Fetched from Database)
 const [unitOptions, setUnitOptions] = useState(DEFAULT_BASE_UNITS)

 useEffect(() => {
 let cancelled = false
 educationUnitService.getDaftar()
 .then((res) => {
 if (cancelled) return
 const list = res?.data?.data || res?.data || res || []
 if (Array.isArray(list) && list.length > 0) {
 const mappedUnits = [
 { id: 'all', name: 'Seluruh Unit (Yayasan)', code: 'YAYASAN' },
 ...list.map((u) => ({
 id: String(u.id || u.code || u.name),
 name: u.name || u.nama || 'Unit Sekolah',
 code: u.code || u.level || 'UNIT',
 })),
 ]
 setUnitOptions(mappedUnits)
 }
 })
 .catch((err) => {
 console.warn('Load units from database failed, using fallback:', err)
 })

 return () => {
 cancelled = true
 }
 }, [])

 // 2. Role Scope Calculation
 const roleAnalysis = useMemo(() => {
 if (!user) return { isGlobalAdmin: true, assignedUnitId: 'all', assignedUnitName: 'Seluruh Unit (Yayasan)' }

 const roles = user.roles ? (Array.isArray(user.roles) ? user.roles.map(r => typeof r === 'string' ? r : r.name) : [user.roles]) : []
 const roleNames = roles.map(r => String(r).toLowerCase())

 const isGlobal = roleNames.some(r =>
 r.includes('super') || r.includes('yayasan') || r.includes('pengurus') || r.includes('ketua') || r.includes('admin')
 )

 const uCode = user.unit_code || user.unit_name || user.unit || ''
 const defaultUnit = unitOptions.find((u) => u.id !== 'all')
 let assignedId = defaultUnit?.id || ''
 let assignedName = defaultUnit?.name || (uCode ? String(uCode) : 'Unit Sekolah')

 const matchedFromDb = unitOptions.find(u =>
 u.id !== 'all' && (
 String(u.name).toLowerCase().includes(String(uCode).toLowerCase()) ||
 String(u.code).toLowerCase().includes(String(uCode).toLowerCase())
 )
 )

 if (matchedFromDb) {
 assignedId = matchedFromDb.id
 assignedName = matchedFromDb.name
 }

 return {
 isGlobalAdmin: isGlobal,
 assignedUnitId: isGlobal ? 'all' : assignedId,
 assignedUnitName: isGlobal ? 'Seluruh Unit (Yayasan)' : assignedName,
 }
 }, [user, unitOptions])

 // State List Berita
 const [newsList, setNewsList] = useState([])
 const [loading, setLoading] = useState(true)

 // Filters State
 const [filters, setFilters] = useState({
 search: '',
 unit_id: 'all',
 kategori: 'all',
 status: 'all',
 page: 1,
 per_page: 10,
 })

 // Modals State
 const [isFormOpen, setIsFormOpen] = useState(false)
 const [editingItem, setEditingItem] = useState(null)
 const [isDetailOpen, setIsDetailOpen] = useState(false)
 const [detailItem, setDetailItem] = useState(null)
 const [isDeleteOpen, setIsDeleteOpen] = useState(false)
 const [deletingItem, setDeletingItem] = useState(null)

 // KPI Cards Drill-Down Modal State
 const [activeKpiModal, setActiveKpiModal] = useState(null) // null | 'total' | 'published' | 'draft' | 'global'
 const [kpiModalSearch, setKpiModalSearch] = useState('')

 // Form State
 const [form, setForm] = useState({
 judul: '',
 kategori: 'PPDB',
 target_unit: 'all',
 target_unit_name: 'Seluruh Unit (Yayasan)',
 ringkasan: '',
 isi: '',
 tanggal_publikasi: new Date().toISOString().slice(0, 10),
 status: 'Dipublikasikan',
 gambar_url: '',
 })

 // Load News from Database API & LocalStorage Cache
 const loadNews = async () => {
 setLoading(true)
 try {
 // 1. Try DB API Endpoint
 const res = await dashboardPemantauanService.getDaftarPengumumanSekolah({ per_page: 100 }).catch(() => null)
 const rawApiList = res?.data?.data || res?.data || res || []

 if (Array.isArray(rawApiList) && rawApiList.length > 0) {
 const normalized = rawApiList.map((item) => {
 const extra = item.data_tambahan || {}
 return {
 id: item.id,
 judul: item.judul_pengumuman || item.judul || 'Pengumuman Sekolah',
 isi: item.isi_pengumuman || item.isi || '',
 kategori: extra.kategori || 'PPDB',
 target_unit: extra.unit_id || 'all',
 target_unit_name: extra.unit_name || 'Seluruh Unit (Yayasan)',
 ringkasan: extra.ringkasan || (item.isi_pengumuman || '').slice(0, 120),
 tanggal_publikasi: item.mulai_tampil ? String(item.mulai_tampil).slice(0, 10) : new Date().toISOString().slice(0, 10),
 status: item.status_aktif ? 'Dipublikasikan' : 'Draf',
 penerbit: item.penerbit || 'Pengelola Sekolah',
 penerbit_role: item.penerbit_role || 'Pengurus',
 gambar_url: extra.gambar_url || '',
 }
 })

 setNewsList(normalized)
 localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
 } else {
 const stored = localStorage.getItem(STORAGE_KEY)
 const parsed = stored ? JSON.parse(stored) : []
 setNewsList(Array.isArray(parsed) ? parsed : [])
 }
 } catch {
 const stored = localStorage.getItem(STORAGE_KEY)
 const parsed = stored ? JSON.parse(stored) : []
 setNewsList(Array.isArray(parsed) ? parsed : [])
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 loadNews()
 }, [])

 const saveNewsListToCache = (updated) => {
 setNewsList(updated)
 try {
 localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
 } catch (e) {
 console.warn('LocalStorage save error:', e)
 }
 }

 const [isImportModalOpen, setIsImportModalOpen] = useState(false)

 const handleExportNews = () => {
 try {
 const headers = ['ID', 'Judul', 'Kategori', 'Target Unit', 'Status', 'Tanggal Publikasi', 'Penulis']
 const rows = filteredList.map((item) => [
 `"${item.id || ''}"`,
 `"${(item.judul || '').replace(/"/g, '""')}"`,
 `"${(item.kategori || '').replace(/"/g, '""')}"`,
 `"${(item.target_unit_name || item.target_unit || 'Seluruh Unit').replace(/"/g, '""')}"`,
 `"${item.status || 'draft'}"`,
 `"${item.tanggal_publikasi || item.created_at || '-'}"`,
 `"${(item.penulis || '-').replace(/"/g, '""')}"`,
 ])
 const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
 const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
 const url = URL.createObjectURL(blob)
 const link = document.createElement('a')
 link.setAttribute('href', url)
 link.setAttribute('download', `Daftar_Berita_Informasi_${new Date().toISOString().slice(0, 10)}.csv`)
 document.body.appendChild(link)
 link.click()
 document.body.removeChild(link)
 URL.revokeObjectURL(url)
 } catch (e) {
 console.error('Export news error:', e)
 }
 }

 const handleImportNews = (rows) => {
 if (!Array.isArray(rows) || rows.length === 0) return
 const importedItems = rows.map((r, idx) => ({
 id: 'news-imp-' + Date.now() + '-' + idx,
 judul: r.judul || r.title || 'Informasi Baru',
 kategori: r.kategori || r.category || 'Umum',
 target_unit: r.target_unit || 'all',
 target_unit_name: r.target_unit_name || 'Seluruh Unit',
 status: r.status || 'published',
 tanggal_publikasi: r.tanggal_publikasi || new Date().toISOString().slice(0, 10),
 ringkasan: r.ringkasan || r.summary || (r.isi || '').slice(0, 100),
 isi: r.isi || r.content || r.ringkasan || '',
 penulis: r.penulis || user?.name || 'Administrator',
 }))
 const updated = [...importedItems, ...newsList]
 saveNewsListToCache(updated)
 setIsImportModalOpen(false)
 }

 // Filtered List based on Search & Role Scoping
 const filteredList = useMemo(() => {
 return newsList.filter((item) => {
 if (!roleAnalysis.isGlobalAdmin) {
 const itemUnit = (item.target_unit || '').toLowerCase()
 const assignedUnit = roleAnalysis.assignedUnitId.toLowerCase()
 if (itemUnit !== 'all' && itemUnit !== assignedUnit) {
 return false
 }
 }

 if (filters.unit_id !== 'all' && item.target_unit !== filters.unit_id) {
 return false
 }

 if (filters.kategori !== 'all' && item.kategori !== filters.kategori) {
 return false
 }

 if (filters.status !== 'all' && item.status !== filters.status) {
 return false
 }

 if (filters.search.trim()) {
 const q = filters.search.toLowerCase()
 const j = (item.judul || '').toLowerCase()
 const r = (item.ringkasan || '').toLowerCase()
 const i = (item.isi || '').toLowerCase()
 if (!j.includes(q) && !r.includes(q) && !i.includes(q)) return false
 }

 return true
 })
 }, [newsList, filters, roleAnalysis])

 // Filtered List for KPI Cards Drill-Down Modal
 const filteredKpiNewsItems = useMemo(() => {
 if (!activeKpiModal) return []
 let base = filteredList
 if (activeKpiModal === 'published') {
 base = base.filter((item) => item.status === 'Dipublikasikan')
 } else if (activeKpiModal === 'draft') {
 base = base.filter((item) => item.status === 'Draf')
 } else if (activeKpiModal === 'global') {
 base = base.filter((item) => item.target_unit === 'all')
 }

 if (kpiModalSearch.trim()) {
 const q = kpiModalSearch.toLowerCase()
 base = base.filter(
 (item) =>
 (item.judul || '').toLowerCase().includes(q) ||
 (item.ringkasan || '').toLowerCase().includes(q) ||
 (item.kategori || '').toLowerCase().includes(q) ||
 (item.target_unit_name || '').toLowerCase().includes(q)
 )
 }

 return base
 }, [activeKpiModal, filteredList, kpiModalSearch])

 // Pagination Slice
 const totalPages = Math.ceil(filteredList.length / filters.per_page) || 1
 const paginatedList = useMemo(() => {
 const start = (filters.page - 1) * filters.per_page
 return filteredList.slice(start, start + filters.per_page)
 }, [filteredList, filters.page, filters.per_page])

 // Stats Calculation
 const stats = useMemo(() => {
 const total = filteredList.length
 const published = filteredList.filter(i => i.status === 'Dipublikasikan').length
 const draft = filteredList.filter(i => i.status === 'Draf').length
 const globalUnit = filteredList.filter(i => i.target_unit === 'all').length

 return { total, published, draft, globalUnit }
 }, [filteredList])

 // Form Handlers
 const handleOpenAdd = () => {
 setEditingItem(null)
 setForm({
 judul: '',
 kategori: 'PPDB',
 target_unit: roleAnalysis.isGlobalAdmin ? 'all' : roleAnalysis.assignedUnitId,
 target_unit_name: roleAnalysis.isGlobalAdmin ? 'Seluruh Unit (Yayasan)' : roleAnalysis.assignedUnitName,
 ringkasan: '',
 isi: '',
 tanggal_publikasi: new Date().toISOString().slice(0, 10),
 status: 'Dipublikasikan',
 gambar_url: '',
 })
 setIsFormOpen(true)
 }

 const handleOpenEdit = (item) => {
 setEditingItem(item)
 setForm({
 judul: item.judul || '',
 kategori: item.kategori || 'PPDB',
 target_unit: item.target_unit || 'all',
 target_unit_name: item.target_unit_name || 'Seluruh Unit (Yayasan)',
 ringkasan: item.ringkasan || '',
 isi: item.isi || '',
 tanggal_publikasi: item.tanggal_publikasi || new Date().toISOString().slice(0, 10),
 status: item.status || 'Dipublikasikan',
 gambar_url: item.gambar_url || '',
 })
 setIsFormOpen(true)
 }

 const handleSaveForm = async (e) => {
 e.preventDefault()
 const trimmedJudul = form.judul.trim().replace(/\s+/g, ' ')
 const trimmedRingkasan = form.ringkasan.trim().replace(/\s+/g, ' ')
 const trimmedIsi = form.isi.trim()

 if (!trimmedJudul || !trimmedRingkasan) return

 const selectedU = unitOptions.find((u) => u.id === form.target_unit) || unitOptions[0]

 const payload = {
 judul_pengumuman: trimmedJudul,
 isi_pengumuman: trimmedIsi || trimmedRingkasan,
 target_peran: ['Orang Tua', 'Siswa'],
 status_aktif: form.status === 'Dipublikasikan',
 mulai_tampil: form.tanggal_publikasi,
 data_tambahan: {
 unit_id: form.target_unit,
 unit_name: selectedU.name,
 unit_code: selectedU.code,
 kategori: form.kategori,
 ringkasan: trimmedRingkasan,
 gambar_url: form.gambar_url,
 },
 }

 if (editingItem) {
 // 1. Send DB Update
 await dashboardPemantauanService.ubahPengumumanSekolah({ id: editingItem.id, payload }).catch(() => null)

 // 2. Update State & Local Cache
 const updated = newsList.map((item) =>
 item.id === editingItem.id
 ? {
 ...item,
 ...form,
 target_unit_name: selectedU.name,
 updated_at: new Date().toISOString(),
 }
 : item
 )
 saveNewsListToCache(updated)
 } else {
 // 1. Send DB Post
 const dbRes = await dashboardPemantauanService.tambahPengumumanSekolah(payload).catch(() => null)
 const newId = dbRes?.data?.id || 'news-' + Date.now()

 // 2. Insert to State & Local Cache
 const newItem = {
 id: newId,
 ...form,
 target_unit_name: selectedU.name,
 penerbit: user?.name || user?.nama || 'Pengelola Berita',
 penerbit_role: roleAnalysis.isGlobalAdmin ? 'Pengurus Yayasan' : 'Pengelola Unit',
 created_at: new Date().toISOString(),
 }
 saveNewsListToCache([newItem, ...newsList])
 }

 setIsFormOpen(false)
 }

 const handleDeleteConfirm = async () => {
 if (!deletingItem) return
 await dashboardPemantauanService.hapusPengumumanSekolah(deletingItem.id).catch(() => null)

 const updated = newsList.filter((item) => item.id !== deletingItem.id)
 saveNewsListToCache(updated)
 setIsDeleteOpen(false)
 setDeletingItem(null)
 }

 const containerVariants = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: { staggerChildren: 0.05, delayChildren: 0.02 },
 },
 }

 const itemVariants = {
 hidden: { opacity: 0, y: 12 },
 visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
 }

 return (
 <PageContainer maxW="7xl">
 <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-12">
 {/* 0. BREADCRUMB NAV (Kanonikal AppBreadcrumb) */}
 <motion.div variants={itemVariants} className="print:hidden">
 <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Berita & Pengumuman' }]} />
 </motion.div>

 {/* Header Halaman Modern Hero Card */}
 <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 !bg-[#D5F2E3] p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:!bg-[#112a22] print:hidden">

 <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div className="flex items-start gap-4 min-w-0">
 <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
 
            <Megaphone className="h-6 w-6 text-white" />
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2.5 flex-wrap">
 <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
 Berita & Pengumuman Sekolah
 </h1>
 <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold bg-emerald-600 text-white shadow-xs border border-emerald-500/40 dark:border-emerald-600/50">
 
                  <ShieldCheck className="h-3.5 w-3.5 text-white" />
 {roleAnalysis.isGlobalAdmin ? 'Lintas Unit Yayasan' : `Unit: ${roleAnalysis.assignedUnitName}`}
 </span>
 </div>
 <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 w-full leading-relaxed">
 {roleAnalysis.isGlobalAdmin
 ? 'Pusat pengumuman dan publikasi berita resmi terpadu seluruh unit sekolah dan lembaga yayasan.'
 : `Pusat pengumuman dan berita resmi khusus untuk unit ${roleAnalysis.assignedUnitName}.`}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
 <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-100 px-3.5 py-1.5 text-xs font-black text-emerald-900 dark:border-emerald-800/60 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs">
 <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
 <span>Publikasi Resmi</span>
 </div>
 </div>
 </div>
 </motion.div>

 {/* KPI STATS CARDS (HEROUI_CARD_COMPONENT) */}
 <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
 <KpiTintedCard
 icon={Megaphone}
 label="Total Berita"
 value={stats.total}
 subtext="Total publikasi di database (Klik detail)"
 tone="emerald"
 onClick={() => { setKpiModalSearch(''); setActiveKpiModal('total'); }}
 />
 <KpiTintedCard
 icon={CheckCircle2}
 label="Dipublikasikan"
 value={stats.published}
 subtext="Aktif di portal ortu & siswa (Klik detail)"
 tone="blue"
 onClick={() => { setKpiModalSearch(''); setActiveKpiModal('published'); }}
 />
 <KpiTintedCard
 icon={AlertCircle}
 label="Draf Internal"
 value={stats.draft}
 subtext="Belum dipublikasikan (Klik detail)"
 tone="amber"
 onClick={() => { setKpiModalSearch(''); setActiveKpiModal('draft'); }}
 />
 <KpiTintedCard
 icon={Globe}
 label="Lintas Unit"
 value={stats.globalUnit}
 subtext="Target seluruh yayasan (Klik detail)"
 tone="purple"
 onClick={() => { setKpiModalSearch(''); setActiveKpiModal('global'); }}
 />
 </motion.div>

 {/* 1. SINGLE UNIFIED DATATABLE CARD CONTAINER (FILTER BAR & DATATABLE DIGABUNGKAN DENGAN GRADASI ZAMRUD) */}
 <motion.div variants={itemVariants} id="tabel-berita-informasi" className="scroll-mt-6 relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-sm dark:bg-[#1B2433]">
 {/* BARIS 1: HEADER CARD TITLE + SOFT PASTEL SQUIRCLE ACTION BUTTONS */}
 <div className="flex flex-col gap-4 border-b border-emerald-200/80 dark:border-emerald-800/80 bg-slate-50/50 dark:bg-slate-900/50 p-5 sm:p-6 dark:border-emerald-800/60 dark:bg-[#1B2433] sm:flex-row sm:items-center sm:justify-between">
 <div className="space-y-1">
 <div className="flex flex-wrap items-center gap-2">
 <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
 Daftar Publikasi Berita
 </h2>
 <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
 {filteredList.length} Berita
 </span>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Riwayat publikasi berita dan pengumuman yang dapat difilter berdasarkan target unit sekolah.
 </p>
 </div>

 {/* Canonical PageToolbarActions Baris 1 */}
 <PageToolbarActions
 className="shrink-0"
 onImport={() => setIsImportModalOpen(true)}
 importLabel="Impor Data Berita (Excel/CSV)"
 onExport={handleExportNews}
 exportLabel="Ekspor Laporan Berita"
 primaryAction={{
 label: 'Buat Berita Baru',
 onClick: handleOpenAdd,
 }}
 />
 </div>

 {/* BARIS 2: CARD FILTER (DILENGKAPI DENGAN SEARCH, DROPDOWN UNIT DARI DATABASE & PERPAGE SELECTOR) */}
 <div className="flex flex-col gap-3 bg-slate-50/50 dark:bg-slate-900/50 p-4 dark:bg-emerald-950/20 lg:flex-row lg:items-center lg:justify-between border-b border-emerald-200/80 dark:border-emerald-800/80 dark:border-emerald-800/60">
 {/* Search Input */}
 <div className="relative min-w-[240px] flex-1 sm:w-72">
 <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={filters.search}
 onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
 placeholder="Cari judul, ringkasan, atau isi berita..."
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white pl-9 pr-3.5 py-2 text-xs font-semibold focus:border-emerald-500 focus:outline-none dark:border-emerald-700/80 dark:bg-slate-900 dark:text-white"
 />
 </div>

 {/* Filters & perPage Selector */}
 <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
 {roleAnalysis.isGlobalAdmin && (
 <CustomSelect
 value={filters.unit_id}
 onChange={(e) => setFilters({ ...filters, unit_id: e.target.value, page: 1 })}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-200"
 >
 <option value="all">Semua Unit</option>
 {unitOptions.map((u) => (
 <option key={u.id} value={u.id}>
 {u.name}
 </option>
 ))}
 </CustomSelect>
 )}

 <CustomSelect
 value={filters.kategori}
 onChange={(e) => setFilters({ ...filters, kategori: e.target.value, page: 1 })}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-200"
 >
 <option value="all">Semua Kategori</option>
 {CATEGORY_OPTIONS.map((c) => (
 <option key={c.id} value={c.id}>
 {c.label}
 </option>
 ))}
 </CustomSelect>

 <CustomSelect
 value={filters.status}
 onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-200"
 >
 <option value="all">Semua Status</option>
 <option value="Dipublikasikan">Dipublikasikan</option>
 <option value="Draf">Draf</option>
 </CustomSelect>

 {/* perPage Selector */}
 <CustomSelect
 value={filters.per_page}
 onChange={(e) => setFilters({ ...filters, per_page: Number(e.target.value), page: 1 })}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-200"
 >
 <option value={5}>5 / hal</option>
 <option value={10}>10 / hal</option>
 <option value={15}>15 / hal</option>
 <option value={25}>25 / hal</option>
 <option value={50}>50 / hal</option>
 <option value={100}>100 / hal</option>
 </CustomSelect>

 {/* Tombol Muat Ulang (Canonical SquircleActionButton) */}
 <SquircleActionButton
 variant="sync"
 icon={RefreshCw}
 label="Muat Ulang Data dari Database"
 loading={loading}
 onClick={loadNews}
 />
 </div>
 </div>

 {/* HEROUI TABLE ROOT & ROWS WITH RICH COLOR STYLING */}
 <div className="overflow-x-auto">
 <TableRoot fullBleed={false}>
          <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
            <TableRow className="border-b border-emerald-200/80 dark:border-emerald-800/60 bg-transparent hover:bg-transparent">
              <TableHead className="w-[36%] bg-transparent font-extrabold text-xs uppercase tracking-wider text-emerald-950 dark:text-emerald-200 py-3.5 px-4">
                <div className="flex items-center gap-1.5 cursor-pointer">
                  <span className="font-extrabold text-xs uppercase tracking-wider text-emerald-950 dark:text-emerald-200">Judul Berita & Kategori</span>
                  <ArrowBothDirectionHorizontal2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </TableHead>
              <TableHead className="w-[22%] bg-transparent font-extrabold text-xs uppercase tracking-wider text-emerald-950 dark:text-emerald-200 py-3.5 px-4">Target Unit Sekolah</TableHead>
              <TableHead className="w-[24%] bg-transparent font-extrabold text-xs uppercase tracking-wider text-emerald-950 dark:text-emerald-200 py-3.5 px-4">Penerbit & Tanggal</TableHead>
              <TableHead className="w-[12%] bg-transparent font-extrabold text-xs uppercase tracking-wider text-emerald-950 dark:text-emerald-200 py-3.5 px-4">Status</TableHead>
              <TableHead className="w-16 bg-transparent text-right py-3.5 px-4 select-none"></TableHead>
            </TableRow>
          </TableHeader>

 <TableBody>
 {paginatedList.length === 0 ? (
 <TableRow>
 <TableCell colSpan={5} className="text-center py-12 text-xs font-semibold text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
 Belum ada berita atau pengumuman yang sesuai dengan filter pencarian.
 </TableCell>
 </TableRow>
 ) : (
 paginatedList.map((row, idx) => {
 const cat = CATEGORY_OPTIONS.find((c) => c.id === row.kategori) || CATEGORY_OPTIONS[0]
 const IconComp = cat.icon

 const catStyles = {
 PPDB: 'bg-amber-100/90 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 ring-1 ring-amber-300/60 dark:ring-amber-800',
 Akademik: 'bg-sky-100/90 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 ring-1 ring-sky-300/60 dark:ring-sky-800',
 Prestasi: 'bg-purple-100/90 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 ring-1 ring-purple-300/60 dark:ring-purple-800',
 Kegiatan: 'bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 ring-1 ring-emerald-300/60 dark:ring-emerald-800',
 Umum: 'bg-cyan-100/90 text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-300 ring-1 ring-cyan-300/60 dark:ring-cyan-800',
 }
 const iconStyle = catStyles[cat.id] || catStyles.Umum

 return (
 <TableRow
 key={row.id || idx}
 onClick={() => {
 setDetailItem(row)
 setIsDetailOpen(true)
 }}
 className="transition-all duration-200 even:bg-slate-50/50 dark:even:bg-slate-900/30 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 hover:shadow-xs cursor-pointer group border-b border-emerald-200/80 dark:border-emerald-800/80"
 >
 {/* Judul & Kategori */}
 <TableCell className="max-w-md py-3.5">
 <div className="flex items-start gap-3">
 <div className={`rounded-xl p-2.5 shrink-0 mt-0.5 shadow-xs transition-transform group-hover:scale-110 ${iconStyle}`}>
 <IconComp className="h-4 w-4" />
 </div>
 <div>
 <p className="font-extrabold text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
 {row.judul}
 </p>
 <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{row.ringkasan}</p>
 <div className="mt-1.5">
 <Badge color={cat.color} size="sm" className="font-bold text-[10px] shadow-xs">
 {cat.label}
 </Badge>
 </div>
 </div>
 </div>
 </TableCell>

 {/* Target Unit Sekolah */}
 <TableCell className="py-3.5">
 <div className="inline-flex">
 <Badge
 color={row.target_unit === 'all' ? 'amber' : 'cyan'}
 size="sm"
 prefixIcon={row.target_unit === 'all' ? Globe : Building2}
 className="font-bold shadow-2xs px-2.5 py-1"
 >
 {row.target_unit_name || 'Seluruh Unit (Yayasan)'}
 </Badge>
 </div>
 </TableCell>

                  {/* Penerbit & Tanggal */}
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-200/80 dark:border-emerald-800/60">
                        {(row.penerbit || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{row.penerbit}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                          <span>{row.penerbit_role}</span>
                          <span>•</span>
                          <span>{row.tanggal_publikasi}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
 {/* Status */}
 <TableCell className="py-3.5">
 <Badge
 color={row.status === 'Dipublikasikan' ? 'success' : 'warning'}
 size="sm"
 prefixIcon={row.status === 'Dipublikasikan' ? CheckCircle2 : AlertCircle}
 className="font-extrabold shadow-2xs px-2.5 py-1"
 >
 {row.status}
 </Badge>
 </TableCell>

 {/* KOLOM AKSI: ACTION DROPDOWN */}
 <TableCell className="text-center py-3.5" onClick={(e) => e.stopPropagation()}>
 <div className="flex items-center justify-center">
 <ActionDropdown
 onView={() => {
 setDetailItem(row)
 setIsDetailOpen(true)
 }}
 onEdit={() => handleOpenEdit(row)}
 onDelete={() => {
 setDeletingItem(row)
 setIsDeleteOpen(true)
 }}
 />
 </div>
 </TableCell>
 </TableRow>
 )
 })
 )}
 </TableBody>
 </TableRoot>
 </div>

 {/* CONTAINER PAGINATION DI BAGIAN BAWAH CARD */}
 {totalPages > 1 && (
 <div className="w-full border-t border-emerald-200/80 p-4 dark:border-emerald-800/60">
 <Pagination
 currentPage={filters.page}
 totalPages={totalPages}
 onPageChange={(page) => setFilters({ ...filters, page })}
 sideLayout="full"
 />
 </div>
 )}
 </motion.div>

 {/* MODAL FORM TAMBAH / EDIT BERITA */}
 <Dialog isOpen={isFormOpen} onOpenChange={setIsFormOpen}>
 <DialogHeader>
 <DialogTitle>{editingItem ? 'Edit Berita & Pengumuman' : 'Buat Berita / Pengumuman Baru'}</DialogTitle>
 <DialogDescription>
 {roleAnalysis.isGlobalAdmin
 ? 'Isi formulir untuk mempublikasikan berita/pengumuman ke seluruh unit yayasan atau unit tertentu.'
 : `Formulir pembuatan berita resmi khusus untuk ${roleAnalysis.assignedUnitName}.`}
 </DialogDescription>
 </DialogHeader>

 <form onSubmit={handleSaveForm}>
 <DialogBody className="space-y-4">
 <div>
 <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
 Judul Berita / Pengumuman *
 </label>
 <input
 type="text"
 value={form.judul}
 onChange={(e) => setForm({ ...form, judul: e.target.value })}
 required
 placeholder="Contoh: Penerimaan Siswa Baru T.A. 2026/2027 Resmi Dibuka"
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 px-3.5 py-2 text-xs font-semibold focus:border-emerald-500 focus:outline-none dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white"
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
 Kategori Berita *
 </label>
 <CustomSelect
 value={form.kategori}
 onChange={(e) => setForm({ ...form, kategori: e.target.value })}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 px-3.5 py-2 text-xs font-semibold focus:border-emerald-500 focus:outline-none dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white"
 >
 {CATEGORY_OPTIONS.map((c) => (
 <option key={c.id} value={c.id}>
 {c.label}
 </option>
 ))}
 </CustomSelect>
 </div>

 <div>
 <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
 Target Unit Sekolah *
 </label>
 {roleAnalysis.isGlobalAdmin ? (
 <CustomSelect
 value={form.target_unit}
 onChange={(e) => {
 const u = unitOptions.find((opt) => opt.id === e.target.value)
 setForm({
 ...form,
 target_unit: e.target.value,
 target_unit_name: u?.name || 'Seluruh Unit (Yayasan)',
 })
 }}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 px-3.5 py-2 text-xs font-semibold focus:border-emerald-500 focus:outline-none dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white"
 >
 {unitOptions.map((u) => (
 <option key={u.id} value={u.id}>
 {u.name}
 </option>
 ))}
 </CustomSelect>
 ) : (
 <input
 type="text"
 disabled
 value={roleAnalysis.assignedUnitName}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:border-emerald-700/80 dark:bg-emerald-950/40 dark:text-emerald-300"
 />
 )}
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
 Tanggal Publikasi *
 </label>
 <DatePicker
 value={form.tanggal_publikasi}
 onChange={(e) => setForm({ ...form, tanggal_publikasi: e.target.value })}
 required
 inputClassName="py-2 text-xs font-semibold"
 />
 </div>

 <div>
 <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
 Status Publikasi *
 </label>
 <CustomSelect
 value={form.status}
 onChange={(e) => setForm({ ...form, status: e.target.value })}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 px-3.5 py-2 text-xs font-semibold focus:border-emerald-500 focus:outline-none dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white"
 >
 <option value="Dipublikasikan">Dipublikasikan (Tampil di Portal)</option>
 <option value="Draf">Draf (Disimpan Internal)</option>
 </CustomSelect>
 </div>
 </div>

 <div>
 <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
 Ringkasan Singkat *
 </label>
 <textarea
 rows={2}
 value={form.ringkasan}
 onChange={(e) => setForm({ ...form, ringkasan: e.target.value })}
 required
 placeholder="Ringkasan 1-2 kalimat yang akan tampil di kartu preview berita..."
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 px-3.5 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white"
 />
 </div>

 <div>
 <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
 Isi Lengkap Berita / Pengumuman *
 </label>
 <textarea
 rows={4}
 value={form.isi}
 onChange={(e) => setForm({ ...form, isi: e.target.value })}
 required
 placeholder="Tuliskan isi berita, ketentuan, pengumuman lengkap untuk wali murid & siswa..."
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 px-3.5 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white"
 />
 </div>

 <div>
 <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
 URL Gambar / Banner (Opsional)
 </label>
 <input
 type="url"
 value={form.gambar_url}
 onChange={(e) => setForm({ ...form, gambar_url: e.target.value })}
 placeholder="https://images.unsplash.com/..."
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 px-3.5 py-2 text-xs font-semibold focus:border-emerald-500 focus:outline-none dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white"
 />
 </div>
 </DialogBody>

 <DialogFooter className="gap-2.5 pt-4 border-t border-emerald-200/80 dark:border-emerald-800/80">
 <DialogClose appearance="outline" size="sm" type="button">
 Batal
 </DialogClose>
 <Button variant="primary" appearance="fill" size="sm" type="submit" className="font-bold px-5">
 {editingItem ? 'Simpan Perubahan' : 'Publikasi'}
 </Button>
 </DialogFooter>
 </form>
 </Dialog>

 {/* MODAL DETAIL PRATINJAU BERITA */}
 <Dialog isOpen={isDetailOpen} onOpenChange={setIsDetailOpen}>
 {detailItem && (
 <>
 <DialogHeader>
 <div className="flex items-center gap-2">
 <Badge color="amber" size="sm">
 {detailItem.kategori}
 </Badge>
 <Badge color="emerald" size="sm">
 {detailItem.target_unit_name}
 </Badge>
 </div>
 <DialogTitle className="mt-2 text-lg font-black">{detailItem.judul}</DialogTitle>
 <DialogDescription className="text-xs">
 Dipublikasikan oleh {detailItem.penerbit} ({detailItem.penerbit_role}) pada {detailItem.tanggal_publikasi}
 </DialogDescription>
 </DialogHeader>

 <DialogBody className="space-y-4">
 {detailItem.gambar_url && (
 <img
 src={detailItem.gambar_url}
 alt={detailItem.judul}
 className="w-full h-48 object-cover rounded-xl border border-emerald-200/80 dark:border-emerald-800/60"
 />
 )}

 <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 border border-emerald-200/80 dark:border-emerald-800/60">
 <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Ringkasan:</p>
 <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{detailItem.ringkasan}</p>
 </div>

 <div>
 <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1">Isi Lengkap Berita:</p>
 <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
 {detailItem.isi}
 </p>
 </div>
 </DialogBody>

 <DialogFooter className="gap-2.5 pt-4 border-t border-emerald-200/80 dark:border-emerald-800/80">
 <DialogClose appearance="outline" size="sm" type="button">
 Tutup Pratinjau
 </DialogClose>
 </DialogFooter>
 </>
 )}
 </Dialog>

 {/* ══════════════════════════════════════════════════════════════════
 KPI CARDS DRILL-DOWN MODAL — Interactive News Analytics Breakdown
 ══════════════════════════════════════════════════════════════════ */}
 <AppModal
 isOpen={Boolean(activeKpiModal)}
 onClose={() => setActiveKpiModal(null)}
 title={
 activeKpiModal === 'total'
 ? 'Analisis Total Publikasi Berita & Pengumuman'
 : activeKpiModal === 'published'
 ? 'Rincian Berita Dipublikasikan (Aktif Portal)'
 : activeKpiModal === 'draft'
 ? 'Rincian Berita Draf Internal (Belum Rilis)'
 : 'Rincian Berita Lintas Unit (Target Yayasan)'
 }
 description={`Menampilkan ${filteredKpiNewsItems.length} data berita terfilter`}
 icon={activeKpiModal === 'published' ? CheckCircle2 : activeKpiModal === 'draft' ? AlertCircle : activeKpiModal === 'global' ? Globe : Megaphone}
 maxWidth="max-w-4xl"
 footer={
 <div className="flex w-full items-center justify-between gap-2">
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
 Menampilkan total {filteredKpiNewsItems.length} baris
 </span>
 <button
 type="button"
 onClick={() => setActiveKpiModal(null)}
 className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
 >
 Tutup
 </button>
 </div>
 }
 >
 <div className="space-y-4">
 {/* Toolbar Search inside Modal */}
 <div className="flex items-center gap-3">
 <div className="relative flex-1">
 <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={kpiModalSearch}
 onChange={(e) => setKpiModalSearch(e.target.value)}
 placeholder="Cari judul berita, ringkasan, atau kategori..."
 className="h-10 w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white pl-9 pr-4 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-900 dark:text-slate-100"
 />
 </div>
 <Badge color="emerald" size="md">
 {filteredKpiNewsItems.length} Publikasi
 </Badge>
 </div>

 {/* Table Body inside Modal */}
 <div>
 {filteredKpiNewsItems.length === 0 ? (
 <div className="py-12 text-center">
 <p className="text-sm font-bold text-slate-500">Tidak ada berita yang cocok dengan kriteria filter ini.</p>
 </div>
 ) : (
 <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 
 <th className="px-4 py-3">Judul Berita & Kategori</th>
 <th className="px-4 py-3">Target Unit</th>
 <th className="px-4 py-3 text-center">Tanggal Publikasi</th>
 <th className="px-4 py-3 text-center">Status</th>
 <th className="px-4 py-3 text-right"></th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 font-medium text-slate-700 dark:divide-emerald-900/40 dark:text-slate-300">
 {filteredKpiNewsItems.map((item, idx) => {
 const cat = CATEGORY_OPTIONS.find((c) => c.id === item.kategori) || CATEGORY_OPTIONS[0]
 const IconComp = cat.icon
 return (
 <tr key={item.id || idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors">
 
 <td className="px-4 py-3">
 <div className="flex items-center gap-2">
 <div className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 shrink-0">
 <IconComp className="h-3.5 w-3.5" />
 </div>
 <div>
 <span className="block font-bold text-slate-900 dark:text-white line-clamp-1">{item.judul}</span>
 <Badge color={cat.color} size="sm" className="mt-0.5 text-[9px]">
 {cat.label}
 </Badge>
 </div>
 </div>
 </td>
 <td className="px-4 py-3">
 <Badge color={item.target_unit === 'all' ? 'amber' : 'cyan'} size="sm" prefixIcon={item.target_unit === 'all' ? Globe : Building2}>
 {item.target_unit_name || 'Seluruh Unit (Yayasan)'}
 </Badge>
 </td>
 <td className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-300">
 {item.tanggal_publikasi}
 </td>
 <td className="px-4 py-3 text-center">
 <Badge color={item.status === 'Dipublikasikan' ? 'success' : 'warning'} size="sm">
 {item.status}
 </Badge>
 </td>
 <td className="px-4 py-3 text-right">
 <Button
 type="button"
 size="xs"
 variant="primary"
 onClick={() => {
 setActiveKpiModal(null)
 setDetailItem(item)
 setIsDetailOpen(true)
 }}
 className="font-bold cursor-pointer"
 >
 Lihat Rincian
 </Button>
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
 </AppModal>

 {/* MODAL KONFIRMASI HAPUS (APP MODAL DANGER) */}
 <AppModal
 isOpen={isDeleteOpen}
 onClose={() => setIsDeleteOpen(false)}
 variant="danger"
 zIndex={70}
 maxWidth="max-w-md"
 icon={Trash2}
 title="Hapus Berita Ini dari Database?"
 badge="Hapus Permanen"
 description={deletingItem?.judul ? `Target: ${deletingItem.judul}` : 'Konfirmasi penghapusan berita permanen'}
 footer={
 <>
 <button
 type="button"
 onClick={() => setIsDeleteOpen(false)}
 className="inline-flex items-center gap-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 h-9.5 px-4 text-xs font-black border border-slate-300 dark:border-slate-700 transition-all active:scale-95 cursor-pointer"
 >
 Batal
 </button>
 <button
 type="button"
 onClick={handleDeleteConfirm}
 className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white h-9.5 px-5 text-xs font-black border-2 border-rose-600 shadow-md shadow-rose-600/20 transition-all active:scale-95 cursor-pointer"
 >
 <Trash2 className="size-3.5" strokeWidth={2.2} />
 <span>Hapus Permanen dari Database</span>
 </button>
 </>
 }
 >
 {deletingItem && (
 <div className="rounded-2xl border-2 border-rose-200 dark:border-rose-800/60 bg-rose-50/70 dark:bg-rose-950/30 p-4 text-xs text-rose-900 dark:text-rose-200 leading-relaxed">
 Apakah Anda yakin ingin menghapus berita <strong>&quot;{deletingItem?.judul}&quot;</strong> dari database? Berita yang dihapus tidak akan tampil lagi di portal orang tua dan siswa.
 </div>
 )}
 </AppModal>

 <CsvImportModal
 isOpen={isImportModalOpen}
 onClose={() => setIsImportModalOpen(false)}
 title="Impor Data Berita & Informasi"
 templateColumns={[
 { key: 'judul', label: 'Judul Berita', example: 'Penerimaan Santri Baru Gelombang 1' },
 { key: 'kategori', label: 'Kategori (PPDB/Akademik/Prestasi/Kegiatan/Umum)', example: 'PPDB' },
 { key: 'status', label: 'Status (published/draft)', example: 'published' },
 { key: 'ringkasan', label: 'Ringkasan', example: 'Pendaftaran gelombang pertama resmi dibuka' },
 { key: 'isi', label: 'Isi Berita', example: 'Pendaftaran dibuka secara daring maupun luring' },
 ]}
 onImport={handleImportNews}
 />

 {/* Smart Floating Scroll Navigator */}
 <SmartScrollFab targetId="tabel-berita-informasi" downTooltip="Langsung ke Tabel Berita" />
 </motion.div>
 </PageContainer>
 )
}
