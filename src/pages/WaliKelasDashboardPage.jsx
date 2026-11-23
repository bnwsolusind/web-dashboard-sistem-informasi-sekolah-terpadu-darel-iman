import CustomSelect from "../components/ui/CustomSelect"
import React, { useState, useEffect } from 'react'
import {
  useNavigate
} from 'react-router-dom'
import {
  Users,
  CheckCircle2,
  Clock,
  FileText,
  AlertTriangle,
  FileCheck,
  Award,
  BookOpen,
  Send,
  Eye,
  PhoneCall,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Layers,
  Calendar
} from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts'
import {
  motion
} from 'framer-motion'

import {
  AppPageHeader,
  AppBreadcrumb,
  AppFilterBar,
  AppDataTable,
  AppBadge,
  AppButton,
  SectionHeader,
  PageContainer,
  KpiStatCard,
  HeroUiHeader
} from '../components/app'
import { Tooltip as UiTooltip } from '../components/ui/tooltip'

import ChartCard from '../components/dashboard/ChartCard'
import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'
import KpiQuickViewModal from '../components/KpiQuickViewModal'
import ModalErrorBoundary from '../components/common/ModalErrorBoundary'

import {
  waliKelasDashboardService
} from '../services/waliKelasDashboardService'

const COLORS = ['#059669', '#0D9488', '#10B981', '#F59E0B', '#EF4444']

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

// ── SUB-KOMPONEN MODERN KPI & SUMMARY CARDS (Spesifikasi Sesuai Dashboard Kepala Sekolah) ──
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

function ModernSummaryCard({
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

export default function WaliKelasDashboardPage() {
 const navigate = useNavigate()
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(null)
 const [data, setData] = useState(null)
 const [selectedClassId, setSelectedClassId] = useState('')
 const [activeModal, setActiveModal] = useState(null)

 const fetchDashboard = async (classId = selectedClassId) => {
 setLoading(true)
 setError(null)
 try {
 const res = await waliKelasDashboardService.getOverview({ class_id: classId })
 if (res && res.data) {
 setData(res.data)
 } else {
 setError('Format respon server tidak valid.')
 }
 } catch (err) {
 console.error('Failed to load Wali Kelas dashboard:', err)
 setError(err.response?.data?.message || 'Gagal memuat data dashboard Wali Kelas.')
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 fetchDashboard()
 }, [])

 const handleClassChange = (classId) => {
 setSelectedClassId(classId)
 fetchDashboard(classId)
 }

 if (loading && !data) return <SkeletonDashboard />
 if (error && !data) return <ErrorState message={error} onRetry={() => fetchDashboard(selectedClassId)} />

 const kpis = data?.kpis || {}
 const context = data?.context || {}
 const charts = data?.charts || {}
 const tables = data?.tables || {}
 const rombelOptions = context.rombel_options || []

 const formatNumber = (num) => (num !== undefined && num !== null ? Number(num).toLocaleString('id-ID') : '0')

 const studentColumns = [
 {
 key: 'full_name',
 label: 'Nama Siswa',
 sortable: true,
 render: (row) => (
 <span className="font-extrabold text-slate-900 dark:text-white text-xs">{row.full_name}</span>
 ),
 },
 {
 key: 'nisn',
 label: 'NISN',
 render: (row) => <span className="text-xs font-mono text-slate-600 dark:text-slate-300">{row.nisn || '-'}</span>,
 },
 {
 key: 'gender',
 label: 'Jenis Kelamin',
 render: (row) => (
 <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
 {row.gender === 'male' || row.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
 </span>
 ),
 },
 {
 key: 'is_active',
 label: 'Status',
 render: (row) => (
 <AppBadge variant={row.is_active ? 'success' : 'secondary'} dot>
 {row.is_active ? 'Aktif' : 'Non-aktif'}
 </AppBadge>
 ),
 },
 ]

 return (
 <PageContainer maxW="7xl">
 <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-12">
 {/* Breadcrumb Navigation */}
 <motion.div variants={itemVariants}>
 <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Dashboard Wali Kelas' }]} />
 </motion.div>

        {/* MODERN HERO CARD HEADER (HEROUI CANONICAL) */}
        <motion.div variants={itemVariants} className="print:hidden">
          <HeroUiHeader
            icon={Users}
            title={`Dashboard Wali Kelas — ${context.rombel?.nama || 'Rombel Binaan'}`}
            tag={{ text: 'Dashboard Wali Kelas', icon: ShieldCheck }}
            description="Monitoring presensi, akademik, tahfizh, mutabaah, dan kelengkapan catatan siswa rombel binaan."
            chips={[
              { label: `Rombel: ${context.rombel?.nama || 'Binaan'}`, icon: Layers, color: 'success' },
              { label: `TA ${context.tahun_ajaran?.nama || '2026/2027'} • Sem. ${context.semester?.nama || 'Ganjil'}`, icon: Calendar, color: 'primary' },
              { label: `${formatNumber(kpis.total_siswa_rombel?.total)} Siswa`, icon: Users, color: 'default' },
            ]}
            actions={
              <div className="flex items-center gap-2 flex-wrap">
                {rombelOptions.length > 1 && (
                  <CustomSelect
                    value={selectedClassId || context.rombel?.id || ''}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white/90 px-3.5 py-1.5 text-xs font-extrabold text-slate-800 shadow-sm focus:border-emerald-200/80 focus:outline-none dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100 cursor-pointer"
                  >
                    {rombelOptions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nama_kelas}
                      </option>
                    ))}
                  </CustomSelect>
                )}
                <UiTooltip content="Segarkan Data Rombel">
                  <button
                    type="button"
                    onClick={() => fetchDashboard(selectedClassId)}
                    disabled={loading}
                    aria-label="Segarkan Data Rombel"
                    className="size-9 flex items-center justify-center p-0 rounded-xl border-2 border-emerald-300/80 bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-2xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={loading ? 'size-4 animate-spin text-emerald-700' : 'size-4 text-emerald-700 dark:text-emerald-300'} />
                  </button>
                </UiTooltip>
              </div>
            }
          />
        </motion.div>

 {/* Primary Unit KPIs - Modern Style Cards */}
 <motion.section variants={itemVariants} className="space-y-3">
 <SectionHeader title="Kondisi Presensi & Izin Siswa Rombel" subtitle="Jumlah siswa, tingkat kehadiran hari ini, dan permohonan izin" />
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <ModernKpiCard
 title="Total Siswa Rombel"
 value={formatNumber(kpis.total_siswa_rombel?.total)}
 subtext="Terdaftar aktif di rombel"
 icon={Users}
 tone="emerald"
 tag="Binaan"
 onClick={() => setActiveModal('total_siswa_rombel')}
 />
 <ModernKpiCard
 title="Hadir Hari Ini"
 value={formatNumber(kpis.siswa_hadir_hari_ini?.total)}
 subtext="Kehadiran tepat waktu"
 icon={CheckCircle2}
 tone="blue"
 tag="Presensi"
 />
 <ModernKpiCard
 title="Terlambat Hari Ini"
 value={formatNumber(kpis.siswa_terlambat?.total)}
 subtext="Perlu pendampingan"
 icon={Clock}
 tone="amber"
 tag="Scan Gerbang"
 />
 <ModernKpiCard
 title="Permohonan Izin / Sakit"
 value={formatNumber(kpis.pending_permissions?.total)}
 subtext="Menunggu approval wali"
 icon={FileText}
 tone="rose"
 tag="Perlu Tindakan"
 onClick={() => setActiveModal('pending_permissions')}
 />
 </div>
 </motion.section>

 {/* Secondary KPI Grid - Modern Summary Cards */}
 <motion.section variants={itemVariants} className="space-y-3">
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <ModernSummaryCard
 title="Catatan Siswa Aktif"
 value={formatNumber(kpis.active_student_notes?.total)}
 subtext="Perlu pembinaan lanjutan"
 icon={AlertTriangle}
 tone="amber"
 tag="Catatan Wali"
 onClick={() => setActiveModal('active_student_notes')}
 />
 <ModernSummaryCard
 title="Tindak Lanjut Catatan"
 value={formatNumber(kpis.followup_notes?.total)}
 subtext="Telah diproses wali"
 icon={FileCheck}
 tone="emerald"
 tag="Selesai"
 />
 <ModernSummaryCard
 title="Mutabaah Belum TTD Ortu"
 value={formatNumber(kpis.unsigned_parent_notes?.total)}
 subtext="Buku kendali ibadah harian"
 icon={Award}
 tone="purple"
 tag="Buku Ibadah"
 />
 <ModernSummaryCard
 title="Izin Perlu Verifikasi"
 value={formatNumber(kpis.pending_permissions?.total)}
 subtext="Konfirmasi presensi siswa"
 icon={CheckCircle2}
 tone="indigo"
 tag="Verifikasi"
 onClick={() => setActiveModal('pending_permissions')}
 />
 </div>
 </motion.section>

 {/* Quick Action Navigation (Soft Pastel Squircle Buttons) */}
 <motion.section variants={itemVariants} className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 sm:p-6 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
 <div>
 <div className="flex items-center gap-2">
 <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#059669]/10 text-[#059669] dark:bg-[#10B981]/20 dark:text-[#10B981]">
 <Sparkles className="h-3.5 w-3.5" />
 </span>
 <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Aksi Cepat Wali Kelas</h3>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pintas manajemen presensi rombel, catatan wali, rekap mutabaah, dan tahfizh</p>
 </div>

 <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
 {/* 1. Presensi Rombel - Emerald Theme */}
 <button
 type="button"
 onClick={() => navigate('/absensi/dashboard-wali-kelas')}
 className="group flex items-center gap-3 rounded-xl border border-emerald-200/80 bg-slate-50/60 p-2.5 transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-200/80 hover:bg-emerald-50/50 hover:shadow-sm dark:border-emerald-800/60 dark:bg-slate-900/50 dark:hover:border-emerald-200/80 dark:hover:bg-emerald-950/30 text-left cursor-pointer"
 >
 <div className="flex h-9 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100/80 text-emerald-600 border border-emerald-200/80 dark:border-emerald-800/60 transition-transform duration-200 group-hover:scale-110 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
 <CheckCircle2 className="h-5 w-5" />
 </div>
 <div className="min-w-0 pr-1">
 <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300">Presensi Rombel</p>
 <p className="text-[10px] text-slate-400 truncate">Input Kehadiran</p>
 </div>
 </button>

 {/* 2. Input Catatan Wali - Amber Theme */}
 <button
 type="button"
 onClick={() => navigate('/absensi/dashboard-wali-kelas')}
 className="group flex items-center gap-3 rounded-xl border border-emerald-200/80 bg-slate-50/60 p-2.5 transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-200/80 hover:bg-amber-50/50 hover:shadow-sm dark:border-emerald-800/60 dark:bg-slate-900/50 dark:hover:border-emerald-200/80 dark:hover:bg-amber-950/30 text-left cursor-pointer"
 >
 <div className="flex h-9 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100/80 text-amber-600 border border-emerald-200/80 dark:border-emerald-800/60 transition-transform duration-200 group-hover:scale-110 dark:bg-amber-950/60 dark:text-amber-400 dark:border-emerald-800/60">
 <FileText className="h-5 w-5" />
 </div>
 <div className="min-w-0 pr-1">
 <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-amber-700 dark:group-hover:text-amber-300">Catatan Wali</p>
 <p className="text-[10px] text-slate-400 truncate">Bimbingan & Disiplin</p>
 </div>
 </button>

 {/* 3. Rekap Presensi - Sky Blue Theme */}
 <button
 type="button"
 onClick={() => navigate('/absensi/rekap-kehadiran')}
 className="group flex items-center gap-3 rounded-xl border border-emerald-200/80 bg-slate-50/60 p-2.5 transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-200/80 hover:bg-sky-50/50 hover:shadow-sm dark:border-emerald-800/60 dark:bg-slate-900/50 dark:hover:border-emerald-200/80 dark:hover:bg-sky-950/30 text-left cursor-pointer"
 >
 <div className="flex h-9 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100/80 text-sky-600 border border-emerald-200/80 dark:border-emerald-800/60 transition-transform duration-200 group-hover:scale-110 dark:bg-sky-950/60 dark:text-sky-400 dark:border-emerald-800/60">
 <FileCheck className="h-5 w-5" />
 </div>
 <div className="min-w-0 pr-1">
 <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-sky-700 dark:group-hover:text-sky-300">Rekap Presensi</p>
 <p className="text-[10px] text-slate-400 truncate">Riwayat Kehadiran</p>
 </div>
 </button>

 {/* 4. Rekap Tahfizh - Violet Theme */}
 <button
 type="button"
 onClick={() => navigate('/portal-guru/workspace?tab=tahfizh')}
 className="group flex items-center gap-3 rounded-xl border border-emerald-200/80 bg-slate-50/60 p-2.5 transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-200/80 hover:bg-violet-50/50 hover:shadow-sm dark:border-emerald-800/60 dark:bg-slate-900/50 dark:hover:border-emerald-200/80 dark:hover:bg-violet-950/30 text-left cursor-pointer"
 >
 <div className="flex h-9 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100/80 text-violet-600 border border-emerald-200/80 dark:border-emerald-800/60 transition-transform duration-200 group-hover:scale-110 dark:bg-violet-950/60 dark:text-violet-400 dark:border-emerald-800/60">
 <BookOpen className="h-5 w-5" />
 </div>
 <div className="min-w-0 pr-1">
 <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-violet-700 dark:group-hover:text-violet-300">Rekap Tahfizh</p>
 <p className="text-[10px] text-slate-400 truncate">Hafalan Al-Qur'an</p>
 </div>
 </button>
 </div>
 </div>
 </motion.section>

 {/* Attendance Chart & Students Table */}
 <motion.section variants={itemVariants} className="space-y-3">
 <SectionHeader title="Distribusi Presensi & Daftar Siswa Rombel" subtitle="Persentase kehadiran hari ini dan tabel siswa binaan" />
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
 <div className="lg:col-span-4 relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 sm:p-6 shadow-sm space-y-4 dark:border-emerald-800/60 dark:bg-[#1B2433] flex flex-col justify-between">
 <div className="space-y-3">
 <div className="p-4 sm:p-5 -mx-5 -mt-5 mb-4 sm:-mx-6 sm:-mt-6 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/50 dark:via-teal-950/20 dark:to-transparent">
 <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
 Distribusi Presensi Siswa
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Persentase kehadiran per kategori presensi rombel
 </p>
 </div>

 <div className="h-64 w-full pt-2">
 {!charts.attendance_distribution || charts.attendance_distribution.length === 0 ? (
 <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
 Belum ada data distribusi presensi
 </div>
 ) : (
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={charts.attendance_distribution || []}
 cx="50%"
 cy="50%"
 innerRadius={50}
 outerRadius={80}
 paddingAngle={5}
 dataKey="total"
 nameKey="status"
 >
 {(charts.attendance_distribution || []).map((entry, index) => (
 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
 ))}
 </Pie>
 <Tooltip />
 <Legend />
 </PieChart>
 </ResponsiveContainer>
 )}
 </div>
 </div>
 </div>

 <div className="lg:col-span-8">
 <AppDataTable
 title="Daftar Siswa Rombel"
 description="Identitas dan status siswa binaan di rombel ini"
 data={tables.students || []}
 columns={studentColumns}
 keyField="full_name"
 searchPlaceholder="Cari nama atau NISN..."
 />
 </div>
 </div>
 </motion.section>

 {/* KPI Detail Modal */}
 <ModalErrorBoundary onClose={() => setActiveModal(null)}>
 <KpiQuickViewModal
 type={activeModal}
 isOpen={Boolean(activeModal)}
 onClose={() => setActiveModal(null)}
 />
 </ModalErrorBoundary>
 </motion.div>
 </PageContainer>
 )
}
