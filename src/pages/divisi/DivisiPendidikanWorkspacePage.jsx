import React, { useState, useEffect } from 'react'
import {
  useSearchParams,
  useNavigate
} from 'react-router-dom'
import {
  motion
} from 'framer-motion'
import {
  GraduationCap,
  BookOpen,
  Award,
  Languages,
  Sparkles,
  FileCheck,
  ShieldCheck,
  ArrowLeft,
  LayoutGrid,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText
} from 'lucide-react'

import {
  PageContainer,
  AppBreadcrumb,
  KpiStatCard
} from '../../components/app'
import {
  Button
} from '../../components/ui/button'
import {
  Card,
  CardContent
} from '../../components/ui/card'
import SupervisiKbmSection from '../../components/divisi/SupervisiKbmSection'
import KurasiBankSoalSection from '../../components/divisi/KurasiBankSoalSection'
import MunaqasyahTahfizhSection from '../../components/divisi/MunaqasyahTahfizhSection'
import PembiasaanBahasaSection from '../../components/divisi/PembiasaanBahasaSection'
import PelatihanGuruSection from '../../components/divisi/PelatihanGuruSection'
import ReviewLaporanBulananSection from '../../components/divisi/ReviewLaporanBulananSection'
import RadarAkreditasiSection from '../../components/divisi/RadarAkreditasiSection'
import {
  divisiPendidikanWorkspaceService
} from '../../services/divisiPendidikanWorkspaceService'

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

const TABS = [
 { key: 'supervisi-kbm', label: 'Supervisi KBM', icon: GraduationCap, tone: 'emerald' },
 { key: 'kurasi-soal', label: 'Kurasi Soal', icon: BookOpen, tone: 'purple' },
 { key: 'tahfizh-munaqasyah', label: 'Munaqasyah', icon: Award, tone: 'amber' },
 { key: 'bahasa-mufradat', label: 'Program Bahasa', icon: Languages, tone: 'sky' },
 { key: 'pelatihan-guru', label: 'Pelatihan Guru', icon: Sparkles, tone: 'teal' },
 { key: 'revisi-laporan', label: 'Review Laporan', icon: FileCheck, tone: 'rose' },
 { key: 'radar-akreditasi', label: 'Radar Akreditasi', icon: ShieldCheck, tone: 'indigo' },
]

function ModernWorkspaceKpiCard({
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

export default function DivisiPendidikanWorkspacePage() {
 const [searchParams, setSearchParams] = useSearchParams()
 const navigate = useNavigate()

 const activeTabParam = searchParams.get('tab') || 'supervisi-kbm'
 const [selectedTab, setSelectedTab] = useState(activeTabParam)
 const [stats, setStats] = useState(null)
 const [loadingStats, setLoadingStats] = useState(true)

 const loadOverviewStats = async () => {
 try {
 const data = await divisiPendidikanWorkspaceService.getWorkspaceOverviewStats()
 setStats(data)
 } catch (e) {
 console.error(e)
 } finally {
 setLoadingStats(false)
 }
 }

 useEffect(() => {
 loadOverviewStats()
 }, [])

 useEffect(() => {
 if (activeTabParam !== selectedTab) {
 setSelectedTab(activeTabParam)
 }
 }, [activeTabParam])

 const handleTabChange = (key) => {
 setSelectedTab(key)
 setSearchParams({ tab: key })
 }

 return (
 <PageContainer maxWidth="max-w-[1560px]">
 <div className="mb-4 flex items-center justify-between print:hidden">
 <AppBreadcrumb
 items={[
 { label: 'Dashboard', href: '/dashboard' },
 { label: 'Divisi Pendidikan', href: '/dashboard/divisi-pendidikan' },
 { label: 'Modul Kerja Divisi' },
 ]}
 />
 <Button
 size="sm"
 variant="outline"
 className="text-xs font-bold rounded-xl border-slate-500/30 hover:bg-emerald-50 dark:hover:bg-slate-800"
 onClick={() => navigate('/dashboard/divisi-pendidikan')}
 >
 <ArrowLeft className="w-3.5 h-3.5 mr-1 text-emerald-600" />
 Dashboard Utama
 </Button>
 </div>

 <div className="space-y-6 pb-12">
 {/* Hero Card Header with Ambient Glow */}
 <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 !bg-[#D5F2E3] p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:!bg-[#112a22] print:hidden">

 <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div className="flex items-start gap-4">
 <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
 
            <LayoutGrid className="h-6 w-6 text-white" />
 </div>
 <div>
 <div className="flex items-center gap-2 flex-wrap">
 <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
 Workspace Modul Kerja Divisi Pendidikan
 </h1>
 <span className="rounded-full bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white px-3 py-0.5 text-xs font-black shadow-xs border border-emerald-200/80 dark:border-emerald-800/60">
 Direktorat Pendidikan SIT
 </span>
 </div>
 <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 w-full font-medium">
 Instrumen operasional penjaminan mutu: supervisi mengajar, kurasi ujian bersama, sertifikasi tahfizh, pembiasaan bahasa, pelatihan guru, evaluasi laporan, dan radar akreditasi.
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-1.5">
 <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
 Live Dynamic Sync
 </span>
 </div>
 </div>
 </div>

 {/* Dynamic Master KPI Cards Grid (MasterStatsGrid) */}
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7 gap-3.5 items-stretch">
 <ModernWorkspaceKpiCard
 tag="KBM"
 title="Supervisi Kelas"
 value={stats?.supervisi?.avgSkor ? `${stats.supervisi.avgSkor}/100` : '-'}
 subtext={`${stats?.supervisi?.selesai ?? 0} guru dinilai selesai`}
 icon={GraduationCap}
 tone="emerald"
 isActive={selectedTab === 'supervisi-kbm'}
 onClick={() => handleTabChange('supervisi-kbm')}
 />
 <ModernWorkspaceKpiCard
 tag="UJIAN"
 title="Kurasi Soal"
 value={`${stats?.soal?.approved ?? 0} Naskah`}
 subtext={`${stats?.soal?.pending ?? 0} antrean kurasi`}
 icon={BookOpen}
 tone="purple"
 isActive={selectedTab === 'kurasi-soal'}
 onClick={() => handleTabChange('kurasi-soal')}
 />
 <ModernWorkspaceKpiCard
 tag="TAHFIZH"
 title="Munaqasyah"
 value={`${stats?.tahfizh?.lulus ?? 0} Santri`}
 subtext="Lulus tasmi' bersyahadah"
 icon={Award}
 tone="amber"
 isActive={selectedTab === 'tahfizh-munaqasyah'}
 onClick={() => handleTabChange('tahfizh-munaqasyah')}
 />
 <ModernWorkspaceKpiCard
 tag="BILINGUAL"
 title="Program Bahasa"
 value={`${stats?.bahasa?.totalPekan ?? 0} Kosakata`}
 subtext="Mufradat Arab & Inggris"
 icon={Languages}
 tone="sky"
 isActive={selectedTab === 'bahasa-mufradat'}
 onClick={() => handleTabChange('bahasa-mufradat')}
 />
 <ModernWorkspaceKpiCard
 tag="UPGRADING"
 title="Pelatihan Guru"
 value={`${stats?.pelatihan?.totalJP ?? 0} JP`}
 subtext={`${stats?.pelatihan?.totalAgenda ?? 0} agenda terlaksana`}
 icon={Sparkles}
 tone="teal"
 isActive={selectedTab === 'pelatihan-guru'}
 onClick={() => handleTabChange('pelatihan-guru')}
 />
 <ModernWorkspaceKpiCard
 tag="AUDIT"
 title="Laporan Kepsek"
 value={`${stats?.laporan?.disetujui ?? 0} Disetujui`}
 subtext={`${stats?.laporan?.revisi ?? 0} butuh perbaikan`}
 icon={FileCheck}
 tone="rose"
 isActive={selectedTab === 'revisi-laporan'}
 onClick={() => handleTabChange('revisi-laporan')}
 />
 <ModernWorkspaceKpiCard
 tag="STANDAR"
 title="Radar Akreditasi"
 value={stats?.akreditasi?.avgKesiapan ? `${stats.akreditasi.avgKesiapan}%` : '-'}
 subtext={`${stats?.akreditasi?.totalUnit ?? 0} unit terakreditasi`}
 icon={ShieldCheck}
 tone="indigo"
 isActive={selectedTab === 'radar-akreditasi'}
 onClick={() => handleTabChange('radar-akreditasi')}
 />
 </div>

 {/* Tab Navigation Pill Bar with Dynamic Tone Styling */}
 <Card className="border border-emerald-200/80 dark:border-emerald-800/60 shadow-md p-2 bg-white/95 dark:bg-[#1B2433] rounded-xl">
 <CardContent className="p-0">
 <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
 {TABS.map((tab) => {
 const Icon = tab.icon
 const isActive = selectedTab === tab.key
 const t = MODERN_CARD_TONES[tab.tone] || MODERN_CARD_TONES.emerald
 return (
 <button
 key={tab.key}
 type="button"
 onClick={() => handleTabChange(tab.key)}
 className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all duration-200 cursor-pointer ${
 isActive
 ? t.activeTab + ' scale-[1.02]'
 : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 border border-emerald-200/80 dark:border-emerald-700/80'
 }`}
 >
 <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'opacity-80'}`} />
 <span className="truncate">{tab.label}</span>
 </button>
 )
 })}
 </div>
 </CardContent>
 </Card>

 {/* Tab Content Rendering with Animated Transition */}
 <motion.div
 key={selectedTab}
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.2 }}
 >
 {selectedTab === 'supervisi-kbm' && <SupervisiKbmSection onDataMutate={loadOverviewStats} />}
 {selectedTab === 'kurasi-soal' && <KurasiBankSoalSection onDataMutate={loadOverviewStats} />}
 {selectedTab === 'tahfizh-munaqasyah' && <MunaqasyahTahfizhSection onDataMutate={loadOverviewStats} />}
 {selectedTab === 'bahasa-mufradat' && <PembiasaanBahasaSection onDataMutate={loadOverviewStats} />}
 {selectedTab === 'pelatihan-guru' && <PelatihanGuruSection onDataMutate={loadOverviewStats} />}
 {selectedTab === 'revisi-laporan' && <ReviewLaporanBulananSection onDataMutate={loadOverviewStats} />}
 {selectedTab === 'radar-akreditasi' && <RadarAkreditasiSection onDataMutate={loadOverviewStats} />}
 </motion.div>
 </div>
 </PageContainer>
 )
}

