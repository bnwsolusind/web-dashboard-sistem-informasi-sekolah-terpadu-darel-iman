import React, { useState, useEffect } from 'react'
import {
  useNavigate
} from 'react-router-dom'
import {
  motion
} from 'framer-motion'
import {
  Database,
  Users,
  Settings,
  ShieldCheck,
  Building2,
  BookOpen,
  CheckCircle2,
  Activity,
  RefreshCw,
  SlidersHorizontal,
  BarChart3,
  FileText,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts'

import {
  AppBreadcrumb,
  AppDataTable,
  AppBadge,
  PageContainer,
  KpiStatCard,
  HeroUiHeader
} from '../components/app'
import { Tooltip as UiTooltip } from '../components/ui/tooltip'

import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'
import KpiQuickViewModal from '../components/KpiQuickViewModal'
import ModalErrorBoundary from '../components/common/ModalErrorBoundary'
import {
  Button
} from '@/components/ui/button'
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

export default function OperatorDashboardPage() {
 const navigate = useNavigate()
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(null)
 const [data, setData] = useState(null)
 const [activeModal, setActiveModal] = useState(null)

 const fetchDashboard = async () => {
 setLoading(true)
 setError(null)
 try {
 const res = await managementDashboardService.getOperator()
 if (res && res.data) {
 setData(res.data)
 } else {
 setError('Format respon server tidak valid.')
 }
 } catch (err) {
 console.error('Failed to load Operator dashboard:', err)
 setError(err.response?.data?.message || 'Gagal memuat data dashboard Operator.')
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 fetchDashboard()
 }, [])

 if (loading && !data) return <SkeletonDashboard />
 if (error && !data) return <ErrorState message={error} onRetry={fetchDashboard} />

 const kpis = data?.kpis || {}
 const context = data?.context || {}
 const charts = data?.charts || {}
 const tables = data?.tables || {}

 const formatNumber = (num) => (num !== undefined && num !== null ? Number(num).toLocaleString('id-ID') : '0')

 const auditColumns = [
 {
 key: 'action',
 label: 'Aktivitas System Audit',
 render: (row) => <span className="font-extrabold text-slate-900 dark:text-white text-xs">{row.action}</span>,
 },
 {
 key: 'module',
 label: 'Modul',
 render: (row) => <AppBadge variant="info">{row.module || 'System'}</AppBadge>,
 },
 {
 key: 'user',
 label: 'Pengguna',
 render: (row) => <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">{row.user || 'Admin'}</span>,
 },
 {
 key: 'timestamp',
 label: 'Waktu',
 render: (row) => <span className="text-xs text-slate-500 font-medium font-mono">{row.timestamp}</span>,
 },
 ]

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
 <AppBreadcrumb items={[{ label: 'Dashboard Admin Operations' }]} />
 </motion.div>

        {/* ── Modern Hero Card HeroUI ── */}
        <motion.div variants={itemVariants} className="print:hidden">
          <HeroUiHeader
            icon={SlidersHorizontal}
            title="Dashboard Admin / Operator Sistem"
            tag={{ text: 'Administrator Platform', icon: ShieldCheck }}
            description="Manajemen data terpadu, pemeliharaan master data sekolah, audit log aktivitas operator, dan monitoring operasional harian."
            chips={[
              context.tahun_ajaran?.nama ? { label: `TA ${context.tahun_ajaran.nama}`, color: 'success' } : null,
              context.semester?.nama ? { label: `Semester ${context.semester.nama}`, color: 'primary' } : null,
            ].filter(Boolean)}
            actions={
              <div className="flex items-center gap-2 flex-wrap">
                <UiTooltip content="Kelola Master Data Siswa">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/master/siswa')}
                    aria-label="Kelola Master Data Siswa"
                    className="size-9 flex items-center justify-center p-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <Database className="size-4 text-white" />
                  </button>
                </UiTooltip>
                <UiTooltip content="Segarkan Data Operasional">
                  <button
                    type="button"
                    onClick={fetchDashboard}
                    disabled={loading}
                    aria-label="Segarkan Data Operasional"
                    className="size-9 flex items-center justify-center p-0 rounded-xl border-2 border-emerald-300 bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-2xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={loading ? 'size-4 animate-spin text-emerald-700' : 'size-4 text-emerald-700 dark:text-emerald-300'} />
                  </button>
                </UiTooltip>
              </div>
            }
          />
        </motion.div>

 {/* ── Section 1: KPI Summary Cards ── */}
 <motion.div variants={itemVariants}>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <ModernKpiCard
 icon={Users}
 label="Total Pengguna Terdaftar"
 subtext="Akun pengguna dalam sistem"
 value={formatNumber(kpis.total_users?.total)}
 tag="Akun Sistem"
 tone="emerald"
 onClick={() => setActiveModal('total_users')}
 />
 <ModernKpiCard
 icon={BookOpen}
 label="Data Siswa Aktif"
 subtext="Santri & murid terdaftar"
 value={formatNumber(kpis.total_students?.total)}
 tag="Siswa"
 tone="blue"
 onClick={() => setActiveModal('total_students')}
 />
 <ModernKpiCard
 icon={Building2}
 label="Data Pegawai & Guru"
 subtext="Pendidik & staf kependidikan"
 value={formatNumber(kpis.total_employees?.total)}
 tag="SDM"
 tone="teal"
 onClick={() => setActiveModal('total_employees')}
 />
 <ModernKpiCard
 icon={CheckCircle2}
 label="Kelas Aktif Terkelola"
 subtext="Rombel aktif beroperasi"
 value={formatNumber(kpis.active_classes?.total)}
 tag="Kelas"
 tone="amber"
 />
 </div>
 </motion.div>

 {/* ── Section 2: Quick Action Bar ── */}
 <motion.div
 variants={itemVariants}
 className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 sm:p-6 shadow-sm dark:bg-[#1B2433]"
 >
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div className="flex items-center gap-3">
 <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 shadow-xs dark:bg-emerald-950/40 dark:border-emerald-700/80 dark:text-emerald-300 shadow-sm">
 <Sparkles className="size-5 text-emerald-600" />
 </div>
 <div>
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
 Aksi Pintas Admin Operations
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
 Akses cepat pemeliharaan master data dan otorisasi aplikasi
 </p>
 </div>
 </div>

 <div className="flex flex-wrap items-center gap-2">
 <button
 type="button"
 onClick={() => navigate('/dashboard/master/siswa')}
 className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-emerald-950/40 dark:text-slate-200 dark:hover:bg-slate-700 transition cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80"
 >
 <Database className="size-3.5 text-emerald-600" />
 <span>Master Siswa</span>
 </button>
 <button
 type="button"
 onClick={() => navigate('/dashboard/pengaturan')}
 className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-emerald-950/40 dark:text-slate-200 dark:hover:bg-slate-700 transition cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80"
 >
 <Settings className="size-3.5 text-emerald-600" />
 <span>Pengaturan Sistem</span>
 </button>
 <button
 type="button"
 onClick={() => navigate('/dashboard/master/hak-akses')}
 className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-emerald-950/40 dark:text-slate-200 dark:hover:bg-slate-700 transition cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80"
 >
 <ShieldCheck className="size-3.5 text-emerald-600" />
 <span>Hak Akses & Role</span>
 </button>
 <button
 type="button"
 onClick={() => navigate('/dashboard/notifications')}
 className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-50 dark:text-slate-900 dark:hover:bg-white hover:from-emerald-700 hover:to-teal-700 shadow-sm transition cursor-pointer"
 >
 <Activity className="size-3.5" />
 <span>Audit Notifikasi</span>
 </button>
 </div>
 </div>
 </motion.div>

 {/* ── Section 3: Data Density Chart & Audit Log Table ── */}
 <motion.div variants={itemVariants} className="space-y-4">
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
 {/* Visual Analytics Chart */}
 <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 sm:p-6 shadow-sm dark:bg-[#1B2433] flex flex-col justify-between">
 <div>
 <div className="flex items-center justify-between p-4 sm:p-5 -mx-5 -mt-5 mb-4 sm:-mx-6 sm:-mt-6 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/50 dark:via-teal-950/20 dark:to-transparent">
 <div className="flex items-center gap-2.5">
 <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 shadow-xs dark:bg-emerald-950/40 dark:border-emerald-700/80 dark:text-emerald-300 shadow-sm">
 <BarChart3 className="size-4 text-emerald-600" />
 </div>
 <div>
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
 Volume Master Data
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
 Kepadatan record dalam database
 </p>
 </div>
 </div>
 </div>

 <div className="h-64 w-full pt-2">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={charts.data_density || []}>
 <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
 <XAxis dataKey="name" stroke="#888888" fontSize={11} />
 <YAxis stroke="#888888" fontSize={11} />
 <Tooltip />
 <Bar dataKey="total" fill="#10B981" radius={[6, 6, 0, 0]} name="Jumlah Record" />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>

 {/* Audit Log Table Container */}
 <div className="lg:col-span-2 relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-card-dark">
 <div className="p-4 sm:p-5 flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/50 dark:via-teal-950/20 dark:to-transparent">
 <div className="flex items-center gap-2.5">
 <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border-2 border-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-700/80 dark:text-emerald-300 shadow-sm">
 <FileText className="size-4 text-emerald-700 dark:text-emerald-300" />
 </div>
 <div>
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
 Log Aktivitas & Audit Operator
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
 Catatan riwayat pengubahan data dan otorisasi sistem
 </p>
 </div>
 </div>
 </div>

 <div className="p-4 sm:p-5">
 <AppDataTable
 data={tables.recent_activities || []}
 columns={auditColumns}
 keyField="timestamp"
 searchPlaceholder="Cari riwayat aktivitas operator..."
 />
 </div>
 </div>
 </div>
 </motion.div>

 {/* ── KPI Detail Modal ── */}
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
