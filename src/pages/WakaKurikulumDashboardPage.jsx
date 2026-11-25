import { HeroUiHeader } from "../components/ui/HeroUiHeader"
import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  useNavigate
} from 'react-router-dom'
import {
  motion
} from 'framer-motion'
import {
  BookOpen,
  Calendar,
  Target,
  Award,
  FileSpreadsheet,
  CheckSquare,
  RefreshCw,
  Sparkles,
  Layers,
  GraduationCap,
  ArrowRight,
  Zap,
  ExternalLink
} from 'lucide-react'

import {
  AppBreadcrumb,
  PageContainer,
  AppDataTable,
  KpiStatCard
} from '../components/app'
import PageToolbarActions from '../components/app/PageToolbarActions'
import { SquircleActionButton } from '../components/master-data'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'
import {
  managementDashboardService
} from '../services/managementDashboardService'

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

export default function WakaKurikulumDashboardPage() {
 const navigate = useNavigate()
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(null)
 const [data, setData] = useState(null)
 const [activeTab, setActiveTab] = useState('subjects')
 const [tableSearch, setTableSearch] = useState('')
 const workspaceRef = useRef(null)

 const selectCurriculumTab = (tabKey) => {
   setActiveTab(tabKey)
   setTableSearch('')
   if (workspaceRef.current) {
     workspaceRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
   }
 }

 const fetchDashboard = async () => {
 setLoading(true)
 setError(null)
 try {
 const res = await managementDashboardService.getWakaKurikulum()
 if (res && res.data) {
 setData(res.data)
 } else {
 setError('Format respon server tidak valid.')
 }
 } catch (err) {
 console.error('Failed to load Waka Kurikulum dashboard:', err)
 setError(err.response?.data?.message || 'Gagal memuat data dashboard Waka Kurikulum.')
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 fetchDashboard()
 }, [])

 const kpis = data?.kpis || {}
 const tables = data?.tables || {}

 const formatNumber = (num) => (num !== undefined && num !== null ? Number(num).toLocaleString('id-ID') : '0')

 const TAB_CONFIGS = useMemo(() => ({
   subjects: {
     key: 'subjects',
     label: 'Mata Pelajaran',
     title: 'Daftar Mata Pelajaran Kurikulum',
     subtitle: 'Distribusi mata pelajaran aktif, jenjang, guru pengampu, KKM, dan beban JP.',
     icon: BookOpen,
     count: kpis.total_subjects?.total ?? (tables.subjects?.length || 0),
     route: '/dashboard/master/mata-pelajaran',
     columns: [
       { key: 'kode', label: 'Kode', render: (r) => <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">{r.kode}</span> },
       { key: 'nama', label: 'Nama Mata Pelajaran', render: (r) => <span className="font-bold text-slate-900 dark:text-white">{r.nama}</span> },
       { key: 'kategori', label: 'Kategori' },
       { key: 'jenjang', label: 'Jenjang / Unit' },
       { key: 'guru', label: 'Guru Pengampu' },
       { key: 'kkm', label: 'KKM', render: (r) => <Badge color="success" size="sm">{r.kkm}</Badge> },
       { key: 'jp', label: 'JP' },
     ],
   },
   schedules: {
     key: 'schedules',
     label: 'Jadwal KBM',
     title: 'Jadwal Pembelajaran (KBM)',
     subtitle: 'Jadwal tatap muka aktif per hari, kelas, mata pelajaran, dan guru pengampu.',
     icon: Calendar,
     count: kpis.total_schedules?.total ?? (tables.schedules?.length || 0),
     route: '/dashboard/master-jadwal',
     columns: [
       { key: 'hari', label: 'Hari', render: (r) => <Badge color="blue" size="sm">{r.hari}</Badge> },
       { key: 'waktu', label: 'Waktu', render: (r) => <span className="font-mono text-xs font-semibold">{r.waktu}</span> },
       { key: 'mapel', label: 'Mata Pelajaran', render: (r) => <span className="font-bold text-slate-900 dark:text-white">{r.mapel}</span> },
       { key: 'kelas', label: 'Kelas' },
       { key: 'guru', label: 'Guru' },
       { key: 'status', label: 'Status', render: (r) => <Badge color={r.status === 'Aktif' ? 'success' : 'gray'} size="sm">{r.status}</Badge> },
     ],
   },
   cp: {
     key: 'cp',
     label: 'Capaian Pembelajaran',
     title: 'Capaian Pembelajaran (CP)',
     subtitle: 'Standar capaian kompetensi kurikulum berdasarkan fase dan mata pelajaran.',
     icon: Target,
     count: kpis.total_cp?.total ?? (tables.cp?.length || 0),
     route: '/dashboard/akademik/capaian-pembelajaran',
     columns: [
       { key: 'kode', label: 'Kode CP', render: (r) => <span className="font-mono font-bold text-purple-700 dark:text-purple-300">{r.kode}</span> },
       { key: 'nama', label: 'Nama Capaian Pembelajaran', render: (r) => <span className="font-bold text-slate-900 dark:text-white">{r.nama}</span> },
       { key: 'mapel', label: 'Mata Pelajaran' },
       { key: 'fase', label: 'Fase' },
       { key: 'unit', label: 'Unit' },
       { key: 'status', label: 'Status', render: (r) => <Badge color={r.status === 'Aktif' ? 'success' : 'gray'} size="sm">{r.status}</Badge> },
     ],
   },
   tp: {
     key: 'tp',
     label: 'Tujuan Pembelajaran',
     title: 'Tujuan Pembelajaran (TP)',
     subtitle: 'Rincian alur tujuan pembelajaran dan alokasi jam pelajaran.',
     icon: Award,
     count: kpis.total_tp?.total ?? (tables.tp?.length || 0),
     route: '/dashboard/akademik/tujuan-pembelajaran',
     columns: [
       { key: 'kode', label: 'Kode TP', render: (r) => <span className="font-mono font-bold text-amber-700 dark:text-amber-300">{r.kode}</span> },
       { key: 'nama', label: 'Tujuan Pembelajaran', render: (r) => <span className="font-bold text-slate-900 dark:text-white">{r.nama}</span> },
       { key: 'cp', label: 'Capaian Pembelajaran' },
       { key: 'jp', label: 'Alokasi JP' },
       { key: 'status', label: 'Status', render: (r) => <Badge color={r.status === 'Aktif' ? 'success' : 'gray'} size="sm">{r.status}</Badge> },
     ],
   },
   modul_ajar: {
     key: 'modul_ajar',
     label: 'Modul Ajar',
     title: 'Perangkat & Modul Ajar Guru',
     subtitle: 'Daftar modul ajar yang disusun oleh guru pengampu per kelas dan mata pelajaran.',
     icon: FileSpreadsheet,
     count: kpis.total_modul_ajar?.total ?? (tables.modul_ajar?.length || 0),
     route: '/dashboard/lms/modul-ajar',
     columns: [
       { key: 'kode', label: 'Kode', render: (r) => <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">{r.kode}</span> },
       { key: 'judul', label: 'Judul Modul Ajar', render: (r) => <span className="font-bold text-slate-900 dark:text-white">{r.judul}</span> },
       { key: 'mapel', label: 'Mata Pelajaran' },
       { key: 'kelas', label: 'Kelas' },
       { key: 'guru', label: 'Penyusun' },
       { key: 'jp', label: 'JP' },
       { key: 'status', label: 'Status', render: (r) => <Badge color={String(r.status).toLowerCase() === 'published' || String(r.status).toLowerCase() === 'aktif' ? 'success' : 'warning'} size="sm">{r.status}</Badge> },
     ],
   },
   kisi_kisi: {
     key: 'kisi_kisi',
     label: 'Kisi-kisi',
     title: 'Kisi-kisi Instrumen Evaluasi',
     subtitle: 'Daftar kisi-kisi penilaian ujian terstandar beserta jumlah butir soal.',
     icon: CheckSquare,
     count: kpis.total_kisi_kisi?.total ?? (tables.kisi_kisi?.length || 0),
     route: '/dashboard/lms/kisi-kisi',
     columns: [
       { key: 'judul', label: 'Judul Kisi-kisi', render: (r) => <span className="font-bold text-slate-900 dark:text-white">{r.judul}</span> },
       { key: 'jenis_ujian', label: 'Jenis Ujian', render: (r) => <Badge color="amber" size="sm">{r.jenis_ujian}</Badge> },
       { key: 'mapel', label: 'Mata Pelajaran' },
       { key: 'kelas', label: 'Kelas' },
       { key: 'jumlah_soal', label: 'Jumlah Soal' },
       { key: 'status', label: 'Status', render: (r) => <Badge color={String(r.status).toLowerCase() === 'published' || String(r.status).toLowerCase() === 'aktif' ? 'success' : 'warning'} size="sm">{r.status}</Badge> },
     ],
   },
   bank_soal: {
     key: 'bank_soal',
     label: 'Bank Soal',
     title: 'Koleksi Bank Soal Terdaftar',
     subtitle: 'Butir soal terstandar berdasarkan mata pelajaran, tipe soal, dan tingkat kesulitan.',
     icon: Layers,
     count: kpis.total_bank_soal?.total ?? (tables.bank_soal?.length || 0),
     route: '/dashboard/lms/bank-soal',
     columns: [
       { key: 'kode', label: 'Kode', render: (r) => <span className="font-mono font-bold text-sky-700 dark:text-sky-300">{r.kode}</span> },
       { key: 'pertanyaan', label: 'Cuplikan Pertanyaan', render: (r) => <span className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2 max-w-md">{r.pertanyaan}</span> },
       { key: 'mapel', label: 'Mata Pelajaran' },
       { key: 'tipe', label: 'Tipe', render: (r) => <Badge color="blue" size="sm">{r.tipe}</Badge> },
       { key: 'kesulitan', label: 'Kesulitan' },
       { key: 'poin', label: 'Poin' },
     ],
   },
   ujian_cbt: {
     key: 'ujian_cbt',
     label: 'Ujian CBT',
     title: 'Jadwal & Sesi Ujian CBT',
     subtitle: 'Monitoring ujian berbasis komputer terjadwal beserta durasi dan KKM.',
     icon: GraduationCap,
     count: kpis.total_ujian_cbt?.total ?? (tables.ujian_cbt?.length || 0),
     route: '/dashboard/lms/cbt',
     columns: [
       { key: 'judul', label: 'Judul Ujian', render: (r) => <span className="font-bold text-slate-900 dark:text-white">{r.judul}</span> },
       { key: 'kelas', label: 'Kelas' },
       { key: 'guru', label: 'Pengampu' },
       { key: 'durasi', label: 'Durasi' },
       { key: 'kkm', label: 'KKM', render: (r) => <Badge color="success" size="sm">{r.kkm}</Badge> },
       { key: 'status', label: 'Status', render: (r) => <Badge color={String(r.status).toLowerCase() === 'aktif' || String(r.status).toLowerCase() === 'published' ? 'success' : 'warning'} size="sm">{r.status}</Badge> },
     ],
   },
 }), [kpis, tables])

 const currentTabConfig = TAB_CONFIGS[activeTab] || TAB_CONFIGS.subjects
 const filteredTabRows = useMemo(() => {
   const rawRows = Array.isArray(tables[activeTab]) ? tables[activeTab] : []
   const q = tableSearch.trim().toLowerCase()
   if (!q) return rawRows
   return rawRows.filter((row) =>
     Object.values(row).some((val) => String(val ?? '').toLowerCase().includes(q))
   )
 }, [tables, activeTab, tableSearch])

 if (loading && !data) return <SkeletonDashboard />
 if (error && !data) return <ErrorState message={error} onRetry={fetchDashboard} />

 return (
 <PageContainer maxW="7xl">
 <motion.div
 variants={containerVariants}
 initial="hidden"
 animate="visible"
 className="space-y-6 pb-12"
 >
 {/* ── Breadcrumb ── */}
 <motion.div variants={itemVariants}>
 <AppBreadcrumb items={[{ label: 'Dashboard Waka Kurikulum' }]} />
 </motion.div>

 {/* ── Modern Hero Card ── */}
        <HeroUiHeader
          title="Dashboard Waka Kurikulum"
          subtitle="Monitoring ketercapaian kurikulum, distribusi guru & mapel, jadwal pembelajaran, dan analisis beban ajar."
          badge="Waka Kurikulum"
          icon={BookOpen}
          className="mb-6"
        />

 {/* ── Section 1: Metrik Mata Pelajaran & Perangkat Ajar ── */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/50 dark:via-teal-950/20 dark:to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-2xs">
                <BookOpen className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                  Metrik Mata Pelajaran &amp; Perangkat Ajar
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  Distribusi mata pelajaran, jadwal KBM, Capaian Pembelajaran (CP), dan Tujuan Pembelajaran (TP)
                </p>
              </div>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              <ModernKpiCard
                icon={BookOpen}
                title="Total Mata Pelajaran"
                value={formatNumber(kpis.total_subjects?.total)}
                badge="Mapel Aktif"
                tone="emerald"
                subtitle="Kurikulum SIT Terpadu"
                ctaText="Lihat Mapel"
                active={activeTab === 'subjects'}
                onClick={() => selectCurriculumTab('subjects')}
              />
              <ModernKpiCard
                icon={Calendar}
                title="Jadwal Pembelajaran"
                value={formatNumber(kpis.total_schedules?.total)}
                badge="Jadwal KBM"
                tone="blue"
                subtitle="Sesi Jam Pelajaran Aktif"
                ctaText="Lihat Jadwal"
                active={activeTab === 'schedules'}
                onClick={() => selectCurriculumTab('schedules')}
              />
              <ModernKpiCard
                icon={Target}
                title="Capaian Pembelajaran (CP)"
                value={formatNumber(kpis.total_cp?.total)}
                badge="Fase & Elemen"
                tone="purple"
                subtitle="Standar Capaian Kurikulum"
                ctaText="Lihat CP"
                active={activeTab === 'cp'}
                onClick={() => selectCurriculumTab('cp')}
              />
              <ModernKpiCard
                icon={Award}
                title="Tujuan Pembelajaran (TP)"
                value={formatNumber(kpis.total_tp?.total)}
                badge="Tujuan Ajar"
                tone="amber"
                subtitle="Alur Tujuan Pembelajaran (ATP)"
                ctaText="Lihat TP"
                active={activeTab === 'tp'}
                onClick={() => selectCurriculumTab('tp')}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Section 2: Kesiapan LMS & Evaluasi Pembelajaran ── */}
      <motion.div variants={itemVariants} className="pt-2">
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/50 dark:via-teal-950/20 dark:to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-2xs">
                <Layers className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                  Kesiapan LMS &amp; Evaluasi Pembelajaran
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  Penyusunan modul ajar, bank soal terstandar, kisi-kisi instrumen, dan jadwal CBT
                </p>
              </div>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              <ModernKpiCard
                icon={FileSpreadsheet}
                title="Modul Ajar Guru"
                value={formatNumber(kpis.total_modul_ajar?.total)}
                badge="Perangkat Ajar"
                tone="emerald"
                subtitle="Modul Pembelajaran Aktif"
                ctaText="Lihat Modul"
                active={activeTab === 'modul_ajar'}
                onClick={() => selectCurriculumTab('modul_ajar')}
              />
              <ModernKpiCard
                icon={CheckSquare}
                title="Kisi-kisi Evaluasi"
                value={formatNumber(kpis.total_kisi_kisi?.total)}
                badge="Kisi-kisi"
                tone="amber"
                subtitle="Instrumen Penilaian Terstandar"
                ctaText="Lihat Kisi-kisi"
                active={activeTab === 'kisi_kisi'}
                onClick={() => selectCurriculumTab('kisi_kisi')}
              />
              <ModernKpiCard
                icon={Layers}
                title="Bank Soal Terdaftar"
                value={formatNumber(kpis.total_bank_soal?.total)}
                badge="Bank Soal"
                tone="blue"
                subtitle="Koleksi Butir Soal Teruji"
                ctaText="Lihat Soal"
                active={activeTab === 'bank_soal'}
                onClick={() => selectCurriculumTab('bank_soal')}
              />
              <ModernKpiCard
                icon={GraduationCap}
                title="Ujian CBT Terjadwal"
                value={formatNumber(kpis.total_ujian_cbt?.total)}
                badge="Ujian CBT"
                tone="teal"
                subtitle="Sesi Asesmen Online"
                ctaText="Lihat CBT"
                active={activeTab === 'ujian_cbt'}
                onClick={() => selectCurriculumTab('ujian_cbt')}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Section 3: Aksi Cepat Manajemen Kurikulum (HeroUI Bar) ── */}
      <motion.div variants={itemVariants} className="pt-2">
        <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                <Zap className="size-5 text-white" strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-emerald-950 dark:text-emerald-200 leading-tight">
                  Aksi Cepat Manajemen Kurikulum
                </h3>
                <p className="text-xs font-semibold text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                  Pilih sub-tab data di bawah atau buka modul pengelolaan kurikulum secara langsung
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap shrink-0 py-1">
              <Button
                type="button"
                variant="primary"
                onClick={() => selectCurriculumTab('subjects')}
                className="inline-flex h-9.5 items-center gap-2 rounded-xl px-4 text-xs font-black text-white shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <BookOpen className="size-4 shrink-0 text-white" />
                <span>Mata Pelajaran</span>
              </Button>
              <Button
                type="button"
                variant="print"
                onClick={() => selectCurriculumTab('schedules')}
                className="inline-flex h-9.5 items-center gap-2 rounded-xl px-4 text-xs font-black text-white shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Calendar className="size-4 shrink-0 text-white" />
                <span>Jadwal KBM</span>
              </Button>
              <Button
                type="button"
                variant="export"
                onClick={() => selectCurriculumTab('modul_ajar')}
                className="inline-flex h-9.5 items-center gap-2 rounded-xl px-4 text-xs font-black text-white shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <FileSpreadsheet className="size-4 shrink-0 text-white" />
                <span>Modul Ajar</span>
              </Button>
              <Button
                type="button"
                variant="import"
                onClick={() => selectCurriculumTab('bank_soal')}
                className="inline-flex h-9.5 items-center gap-2 rounded-xl px-4 text-xs font-black text-white shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Layers className="size-4 shrink-0 text-white" />
                <span>Bank Soal &amp; Kisi-kisi</span>
              </Button>
            </div>
          </div>
        </section>
      </motion.div>

      {/* ── Section 4: Sub-Tab Data Kurikulum Inline (Langsung di Halaman Ini) ── */}
      <motion.div variants={itemVariants} ref={workspaceRef} className="pt-2 space-y-4">
        {/* HeroUI Segmented Sub-Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border-2 border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs overflow-x-auto">
          {Object.values(TAB_CONFIGS).map((tab) => {
            const TabIcon = tab.icon
            const isTabActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key)
                  setTableSearch('')
                }}
                className={`rounded-xl px-3 py-2 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0 ${
                  isTabActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-100/70 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <TabIcon className="size-3.5 shrink-0" />
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-black tabular-nums ${
                    isTabActive
                      ? 'bg-white text-emerald-800'
                      : 'bg-emerald-200/80 text-emerald-900 dark:bg-emerald-900/80 dark:text-emerald-200'
                  }`}
                >
                  {formatNumber(tab.count)}
                </span>
              </button>
            )
          })}
        </div>

        {/* DataTable Data Sub-Tab Aktif */}
        <AppDataTable
          title={currentTabConfig.title}
          subtitle={currentTabConfig.subtitle}
          icon={currentTabConfig.icon}
          countLabel={`${formatNumber(filteredTabRows.length)} Ditampilkan`}
          columns={currentTabConfig.columns}
          data={filteredTabRows}
          keyField="id"
          isLoading={loading}
          search={tableSearch}
          onSearchChange={setTableSearch}
          searchPlaceholder={`Cari data ${currentTabConfig.label.toLowerCase()}...`}
          emptyTitle={`Belum ada data ${currentTabConfig.label}`}
          emptyMessage={`Data ${currentTabConfig.label.toLowerCase()} belum tersedia atau tidak cocok dengan pencarian.`}
          actions={
            <PageToolbarActions
              onRefresh={fetchDashboard}
              refreshLabel="Segarkan Data Kurikulum"
              refreshing={loading}
            >
              <SquircleActionButton
                variant="primary"
                icon={ExternalLink}
                label="Buka Halaman Penuh"
                title={`Buka modul ${currentTabConfig.label}`}
                onClick={() => navigate(currentTabConfig.route)}
                showLabel
              />
            </PageToolbarActions>
          }
        />
      </motion.div>
    </motion.div>
    </PageContainer>
  )
}
