import { HeroUiHeader } from "../components/ui/HeroUiHeader"
import React, { useState, useEffect } from 'react'
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
  ArrowRight
} from 'lucide-react'

import {
  AppBreadcrumb,
  PageContainer,
  KpiStatCard
} from '../components/app'
import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'
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

 if (loading && !data) return <SkeletonDashboard />
 if (error && !data) return <ErrorState message={error} onRetry={fetchDashboard} />

 const kpis = data?.kpis || {}
 const context = data?.context || {}

 const formatNumber = (num) => (num !== undefined && num !== null ? Number(num).toLocaleString('id-ID') : '0')

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
                ctaText="Kelola Mapel"
                onClick={() => navigate('/dashboard/master/mata-pelajaran')}
              />
              <ModernKpiCard
                icon={Calendar}
                title="Jadwal Pembelajaran"
                value={formatNumber(kpis.total_schedules?.total)}
                badge="Jadwal KBM"
                tone="blue"
                subtitle="Sesi Jam Pelajaran Aktif"
                ctaText="Kelola Jadwal"
                onClick={() => navigate('/dashboard/master-jadwal')}
              />
              <ModernKpiCard
                icon={Target}
                title="Capaian Pembelajaran (CP)"
                value={formatNumber(kpis.total_cp?.total)}
                badge="Fase & Elemen"
                tone="purple"
                subtitle="Standar Capaian Kurikulum"
                ctaText="Kelola CP"
                onClick={() => navigate('/dashboard/akademik/capaian-pembelajaran')}
              />
              <ModernKpiCard
                icon={Award}
                title="Tujuan Pembelajaran (TP)"
                value={formatNumber(kpis.total_tp?.total)}
                badge="Tujuan Ajar"
                tone="amber"
                subtitle="Alur Tujuan Pembelajaran (ATP)"
                ctaText="Kelola TP"
                onClick={() => navigate('/dashboard/akademik/tujuan-pembelajaran')}
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
                ctaText="Buka Modul Ajar"
                onClick={() => navigate('/dashboard/lms/modul-ajar')}
              />
              <ModernKpiCard
                icon={CheckSquare}
                title="Kisi-kisi Evaluasi"
                value={formatNumber(kpis.total_kisi_kisi?.total)}
                badge="Kisi-kisi"
                tone="amber"
                subtitle="Instrumen Penilaian Terstandar"
                ctaText="Buka Kisi-kisi"
                onClick={() => navigate('/dashboard/lms/kisi-kisi')}
              />
              <ModernKpiCard
                icon={Layers}
                title="Bank Soal Terdaftar"
                value={formatNumber(kpis.total_bank_soal?.total)}
                badge="Bank Soal"
                tone="blue"
                subtitle="Koleksi Butir Soal Teruji"
                ctaText="Kelola Soal"
                onClick={() => navigate('/dashboard/lms/bank-soal')}
              />
              <ModernKpiCard
                icon={GraduationCap}
                title="Ujian CBT Terjadwal"
                value={formatNumber(kpis.total_ujian_cbt?.total)}
                badge="Ujian CBT"
                tone="teal"
                subtitle="Sesi Asesmen Online"
                ctaText="Jadwal CBT"
                onClick={() => navigate('/dashboard/lms/cbt')}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Section 3: Quick Action Navigasi Kurikulum ── */}
      <motion.div variants={itemVariants} className="pt-2">
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-3">
            Aksi Cepat Manajemen Kurikulum
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              variant="ghost"
              appearance="outline"
              size="md"
              onClick={() => navigate('/dashboard/master/mata-pelajaran')}
              className="flex items-center justify-between gap-2 p-3.5 h-auto text-left font-bold text-xs rounded-xl border border-emerald-200/80 hover:bg-emerald-50/70 hover:border-emerald-300 dark:border-emerald-800/60 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <span className="flex items-center gap-2.5 truncate">
                <BookOpen className="size-4 text-emerald-600 shrink-0" />
                <span className="truncate">Kelola Mata Pelajaran</span>
              </span>
              <ArrowRight className="size-3.5 text-slate-400 shrink-0" />
            </Button>
            <Button
              variant="ghost"
              appearance="outline"
              size="md"
              onClick={() => navigate('/dashboard/master-jadwal')}
              className="flex items-center justify-between gap-2 p-3.5 h-auto text-left font-bold text-xs rounded-xl border border-emerald-200/80 hover:bg-emerald-50/70 hover:border-emerald-300 dark:border-emerald-800/60 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <span className="flex items-center gap-2.5 truncate">
                <Calendar className="size-4 text-sky-600 shrink-0" />
                <span className="truncate">Kelola Jadwal KBM</span>
              </span>
              <ArrowRight className="size-3.5 text-slate-400 shrink-0" />
            </Button>
            <Button
              variant="ghost"
              appearance="outline"
              size="md"
              onClick={() => navigate('/dashboard/lms/modul-ajar')}
              className="flex items-center justify-between gap-2 p-3.5 h-auto text-left font-bold text-xs rounded-xl border border-emerald-200/80 hover:bg-emerald-50/70 hover:border-emerald-300 dark:border-emerald-800/60 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <span className="flex items-center gap-2.5 truncate">
                <FileSpreadsheet className="size-4 text-teal-600 shrink-0" />
                <span className="truncate">Perangkat &amp; Modul Ajar</span>
              </span>
              <ArrowRight className="size-3.5 text-slate-400 shrink-0" />
            </Button>
            <Button
              variant="ghost"
              appearance="outline"
              size="md"
              onClick={() => navigate('/dashboard/lms/bank-soal')}
              className="flex items-center justify-between gap-2 p-3.5 h-auto text-left font-bold text-xs rounded-xl border border-emerald-200/80 hover:bg-emerald-50/70 hover:border-emerald-300 dark:border-emerald-800/60 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <span className="flex items-center gap-2.5 truncate">
                <Layers className="size-4 text-purple-600 shrink-0" />
                <span className="truncate">Bank Soal &amp; Kisi-kisi</span>
              </span>
              <ArrowRight className="size-3.5 text-slate-400 shrink-0" />
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
    </PageContainer>
  )
}
