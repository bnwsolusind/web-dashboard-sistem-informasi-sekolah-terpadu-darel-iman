import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  useNavigate
} from 'react-router-dom'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  Users,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  CalendarCheck,
  FileSpreadsheet,
  RefreshCw,
  CalendarDays,
  BookOpen,
  Building2,
  Sparkles,
  ShieldCheck,
  FileText,
  GraduationCap,
  QrCode,
  Filter,
  RotateCcw,
  ChevronDown,
  Check,
  Search
} from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts'

import {
  AppBreadcrumb,
  AppFilterBar,
  KpiCard,
  SectionHeader,
  PageContainer,
  KpiStatCard
} from '../components/app'

import {
  SquircleActionButton
} from '../components/master-data'
import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'
import TataUsahaKpiModal from '../components/TataUsahaKpiModal'
import HeroUiFilterSelect from '../components/ui/HeroUiFilterSelect'
import ModalErrorBoundary from '../components/common/ModalErrorBoundary'

import {
  managementDashboardService
} from '../services/managementDashboardService'
import {
  educationUnitService
} from '../services/educationUnitService'
import {
  useAuthStore
} from '../stores/authStore'

const MODERN_KPI_TONES = {
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

function ModernTuKpiCard({
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


const tooltipStyle = {
  backgroundColor: "#0F172A",
  border: 'none',
  borderRadius: '12px',
  color: '#FFF',
  fontSize: '12px',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
}

const CHART_CARD_TONES = {
  emerald: {
    border: 'border-2 border-emerald-300/90 dark:border-emerald-700/80',
    topBar: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600',
    headerBg: 'bg-emerald-500/10 dark:bg-emerald-950/40 border-b border-emerald-500/20',
    iconBox: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 shadow-md text-white',
    glow: 'bg-emerald-400/20 dark:bg-emerald-400/25',
    badge: 'bg-emerald-100/90 text-emerald-800 border-emerald-300/70 dark:bg-emerald-950/80 dark:text-emerald-300',
  },
  blue: {
    border: 'border-2 border-blue-300/90 dark:border-blue-700/80',
    topBar: 'bg-gradient-to-r from-blue-500 via-sky-400 to-blue-600',
    headerBg: 'bg-blue-500/10 dark:bg-blue-950/40 border-b border-blue-500/20',
    iconBox: 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 shadow-md text-white',
    glow: 'bg-blue-400/20 dark:bg-blue-400/25',
    badge: 'bg-blue-100/90 text-blue-800 border-blue-300/70 dark:bg-blue-950/80 dark:text-blue-300',
  },
  teal: {
    border: 'border-2 border-teal-300/90 dark:border-teal-700/80',
    topBar: 'bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600',
    headerBg: 'bg-teal-500/10 dark:bg-teal-950/40 border-b border-teal-500/20',
    iconBox: 'bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700 shadow-md text-white',
    glow: 'bg-teal-400/20 dark:bg-teal-400/25',
    badge: 'bg-teal-100/90 text-teal-800 border-teal-300/70 dark:bg-teal-950/80 dark:text-teal-300',
  },
  amber: {
    border: 'border-2 border-amber-300/90 dark:border-amber-700/80',
    topBar: 'bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600',
    headerBg: 'bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-500/20',
    iconBox: 'bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 shadow-md text-white',
    glow: 'bg-amber-400/20 dark:bg-amber-400/25',
    badge: 'bg-amber-100/90 text-amber-800 border-amber-300/70 dark:bg-amber-950/80 dark:text-amber-300',
  },
  rose: {
    border: 'border-2 border-rose-300/90 dark:border-rose-700/80',
    topBar: 'bg-gradient-to-r from-rose-500 via-red-400 to-rose-600',
    headerBg: 'bg-rose-500/10 dark:bg-rose-950/40 border-b border-rose-500/20',
    iconBox: 'bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 shadow-md text-white',
    glow: 'bg-rose-400/20 dark:bg-rose-400/25',
    badge: 'bg-rose-100/90 text-rose-800 border-rose-300/70 dark:bg-rose-950/80 dark:text-rose-300',
  },
}

function ModernTuChartCard({
  title,
  subtitle,
  icon: Icon,
  tone = 'emerald',
  badge,
  action,
  empty = false,
  emptyMessage = 'Belum ada data grafik untuk periode ini.',
  children,
}) {
  const t = CHART_CARD_TONES[tone] || CHART_CARD_TONES.emerald
  return (
    <div className={`relative overflow-hidden rounded-container border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-card-dark flex flex-col justify-between h-full ${t.border}`}>
      {/* Top Accent Gradient Stripe */}
      <div className={`h-1.5 w-full ${t.topBar} shrink-0`} />

      {/* Ambient Backlight Glow */}

      {/* Card Header */}
      <div className={`relative z-10 p-4 sm:p-5 flex items-center justify-between gap-3 ${t.headerBg}`}>
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${t.iconBox}`}>
              <Icon className="size-5" strokeWidth={2.2} />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                {title}
              </h3>
              {badge && (
                <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${t.badge}`}>
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* Card Body */}
      <div className="relative z-10 p-4 sm:p-5 flex-1 flex flex-col justify-center">
        {empty ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="size-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-slate-400 mb-2">
              <FileSpreadsheet className="size-6" />
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

function GenderDonutChart({ data }) {
  const hasData = data && data.some((item) => Number(item.value) > 0)
  if (!hasData) return null
  const total = data.reduce((acc, curr) => acc + Number(curr.value || 0), 0)

  return (
    <div className="flex flex-col items-center justify-between w-full h-full">
      <div className="relative w-44 h-44 my-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={82}
              paddingAngle={4}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <strong className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
            {Number(total).toLocaleString('id-ID')}
          </strong>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Total
          </span>
        </div>
      </div>

      {/* Pill Legend with counts and percentages */}
      <div className="w-full grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60">
        {data.map((item) => {
          const val = Number(item.value || 0)
          const pct = total > 0 ? ((val / total) * 100).toFixed(0) : '0'
          return (
            <div
              key={item.name}
              className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60"
            >
              <span
                className="size-2.5 rounded-full shrink-0 shadow-xs"
                style={{ background: item.color }}
              />
              <div className="flex items-center justify-between w-full min-w-0">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
                  {item.name}
                </span>
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums">
                    {val.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    ({pct}%)
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EnhancedComparisonBarChart({ data }) {
  const hasData = data && data.some((item) => Number(item.value) > 0)
  if (!hasData) return null

  return (
    <div className="flex flex-col justify-between h-full w-full">
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
            <XAxis dataKey="name" fontSize={10} interval={0} tickLine={false} axisLine={false} tick={{ fill: '#64748b' }} />
            <YAxis fontSize={10} allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#64748b' }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Stat Pills */}
      <div className="w-full grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60">
        {data.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-2 p-1.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60"
          >
            <span
              className="size-2.5 rounded-full shrink-0 shadow-xs"
              style={{ background: item.color }}
            />
            <div className="flex items-center justify-between w-full min-w-0">
              <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 truncate">
                {item.name}
              </span>
              <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums ml-1">
                {Number(item.value || 0).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function KelengkapanDonutChart({ data }) {
  const hasData = data && data.some((item) => Number(item.value) > 0)
  if (!hasData) return null
  const total = data.reduce((acc, curr) => acc + Number(curr.value || 0), 0)

  return (
    <div className="flex flex-col items-center justify-between w-full h-full">
      <div className="relative w-44 h-44 my-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={82}
              paddingAngle={4}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <strong className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
            {Number(total).toLocaleString('id-ID')}
          </strong>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Total
          </span>
        </div>
      </div>

      {/* Pill Legend with counts and percentages */}
      <div className="w-full grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60">
        {data.map((item) => {
          const val = Number(item.value || 0)
          const pct = total > 0 ? ((val / total) * 100).toFixed(0) : '0'
          return (
            <div
              key={item.name}
              className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60"
            >
              <span
                className="size-2.5 rounded-full shrink-0 shadow-xs"
                style={{ background: item.color }}
              />
              <div className="flex items-center justify-between w-full min-w-0">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
                  {item.name}
                </span>
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums">
                    {val.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    ({pct}%)
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function TataUsahaDashboardPage() {
  const navigate = useNavigate()
  const authUser = useAuthStore((s) => s.user)
  const canAccessPath = (targetPath, fallbackPerms = []) => {
    const roles = Array.isArray(authUser?.roles) ? authUser.roles : (authUser?.role ? [authUser.role] : [])
    if (roles.some((r) => String(typeof r === 'string' ? r : r?.name || '').toLowerCase() === 'super admin')) {
      return true
    }
    const paths = Array.isArray(authUser?.accessible_paths) ? authUser.accessible_paths : []
    if (paths.length > 0) {
      return paths.includes(targetPath)
    }
    const perms = Array.isArray(authUser?.permissions) ? authUser.permissions : []
    return fallbackPerms.length === 0 || perms.some((p) => fallbackPerms.includes(p))
  }
  const canViewStudentReport = useMemo(
    () => canAccessPath('/dashboard/laporan-siswa', ['report.student.view', 'report.view']),
    [authUser]
  )
  const canManageStudents = useMemo(
    () => canAccessPath('/dashboard/students', ['student.view', 'students.view', 'siswa.view']),
    [authUser]
  )
  const canManageEmployees = useMemo(
    () => canAccessPath('/dashboard/employees', ['employee.view', 'employees.view', 'pegawai.view']),
    [authUser]
  )
  const canManageAlumni = useMemo(
    () => canAccessPath('/dashboard/master/alumni', ['alumni.view', 'student.view']),
    [authUser]
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [activeModal, setActiveModal] = useState(null)
  const [activeModalTab, setActiveModalTab] = useState(null)
  const [selectedUnitId, setSelectedUnitId] = useState('all')
  const [availableUnits, setAvailableUnits] = useState([])

  const openKpiModal = (type, tab = null) => {
    setActiveModal(type)
    setActiveModalTab(tab)
  }

  const fetchDashboard = async (unitId = selectedUnitId) => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (unitId && unitId !== 'all') {
        params.unit_id = unitId
      }
      const res = await managementDashboardService.getTataUsaha(params)
      if (res && res.data) {
        setData(res.data)
      } else {
        setError('Format respon server tidak valid.')
      }
    } catch (err) {
      console.error('Failed to load Tata Usaha dashboard:', err)
      setError(err.response?.data?.message || 'Gagal memuat data dashboard Tata Usaha.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard(selectedUnitId)
  }, [selectedUnitId])

  useEffect(() => {
    educationUnitService
      .getDaftar({ per_page: 100 })
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        setAvailableUnits(list)
      })
      .catch(() => { })
  }, [])

  if (loading && !data) return <SkeletonDashboard />
  if (error && !data) return <ErrorState message={error} onRetry={fetchDashboard} />

  const kpis = data?.kpis || {}
  const charts = data?.charts || {}
  const context = data?.context || {}

  const formatNumber = (num) => (num !== undefined && num !== null ? Number(num).toLocaleString('id-ID') : '0')

  const tahunAjaranLabel = context.tahun_ajaran?.nama
    ? `Tahun Ajaran ${context.tahun_ajaran.nama}`
    : 'Tahun Ajaran Aktif'
  const semesterLabel = context.semester?.nama
    ? `Semester ${context.semester.nama}`
    : 'Semester Berjalan'

  const chartHasData = (items = []) => items.some((item) => Number(item.value) > 0)

  return (
    <PageContainer maxW="7xl">
      <div className="space-y-6 pb-12">
        <AppBreadcrumb items={[{ label: 'Dashboard Tata Usaha' }]} />

        {/* MODERN HERO CARD HEADER (MATCHING MONITORING, KEPALA SEKOLAH, & YAYASAN DASHBOARD STYLE) */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900"
        >
          {/* Ambient Glow Background Accent (Vibrant Dual Emerald-Teal Blobs) */}

          <div className="relative z-10 flex flex-col gap-3">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-4 min-w-0">
              <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
                <Building2 className="size-6 sm:size-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 text-white shadow-xs border border-emerald-500/40 px-3.5 py-1 text-xs font-extrabold">
                    <Sparkles className="h-3.5 w-3.5 text-white animate-pulse" />
                    Pusat Administrasi &amp; Tata Usaha
                  </span>
                  {context.unit?.nama && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700/80 px-3.5 py-1 text-xs font-black text-white shadow-sm border border-emerald-400/40">
                      <Building2 className="h-3.5 w-3.5 text-emerald-200" /> Unit: {context.unit.nama}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    <CalendarDays className="h-3.5 w-3.5 text-emerald-600" /> {tahunAjaranLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-0.5 text-xs font-extrabold text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60">
                    <BookOpen className="h-3.5 w-3.5 text-teal-600" /> {semesterLabel}
                  </span>
                </div>
                <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  Dashboard Tata Usaha &amp; Administrasi Sekolah
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 z-10 self-start lg:self-center">
              <SquircleActionButton
                variant="restore"
                icon={RefreshCw}
                label="Segarkan Data"
                onClick={fetchDashboard}
              />
            </div>
          </div>

          <div className="w-full pt-2 border-t border-emerald-500/20 dark:border-emerald-500/30">
            <p className="w-full text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
              Pusat pengelolaan master data siswa, SDM pegawai &amp; guru, rekap presensi gerbang, dan pelaporan administrasi terpadu.
            </p>
          </div>
        </div>
        </motion.div>

        {/* QUICK ACTION CONTAINER */}
        <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-500/20 bg-emerald-500/10 dark:border-emerald-800/60">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                <ShieldCheck className="size-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                  Aksi Cepat Tata Usaha
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  Pintas administrasi data siswa, pegawai, dan pelaporan
                </p>
              </div>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 sm:overflow-x-auto py-1">
              {canManageStudents && (
                <SquircleActionButton
                  variant="view"
                  icon={Users}
                  label="Kelola Master Siswa"
                  onClick={() => navigate('/dashboard/students')}
                />
              )}
              {canManageEmployees && (
                <SquircleActionButton
                  variant="import"
                  icon={UserCheck}
                  label="Kelola Master Pegawai"
                  onClick={() => navigate('/dashboard/employees')}
                />
              )}
              <SquircleActionButton
                variant="primary"
                icon={CalendarCheck}
                label="Presensi KBM & Kelas"
                onClick={() => navigate('/dashboard/absensi-pembelajaran')}
              />
              <SquircleActionButton
                variant="import"
                icon={QrCode}
                label="Absensi Gerbang (Scan)"
                onClick={() => navigate('/dashboard/absensi-gerbang')}
              />
              <SquircleActionButton
                variant="primary"
                icon={CheckCircle2}
                label="Rekap Absensi Gerbang"
                onClick={() => navigate('/dashboard/rekap-absensi-gerbang')}
              />
              {canViewStudentReport && (
                <SquircleActionButton
                  variant="export"
                  icon={FileSpreadsheet}
                  label="Cetak Laporan Siswa"
                  onClick={() => navigate('/dashboard/laporan-siswa')}
                />
              )}
              {canManageAlumni && (
                <SquircleActionButton
                  variant="secondary"
                  icon={GraduationCap}
                  label="Kelola Alumni & Mutasi"
                  onClick={() => navigate('/dashboard/master/alumni')}
                />
              )}
            </div>
          </div>
        </section>

        {/* FILTER BAR DROPDOWN HERO UI */}
        {availableUnits.length > 0 && (
          <div className="relative overflow-hidden rounded-xl border-2 border-emerald-500/25 bg-white shadow-md shadow-sm dark:border-emerald-600/35 dark:bg-[#1B2433]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/50 dark:via-teal-950/20 dark:to-transparent">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-xs">
                  <Filter className="size-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Filter Unit Administrasi</h4>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Pilih unit pendidikan untuk memfilter metrik KPI dan data</p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="w-full sm:w-64">
                  <HeroUiFilterSelect
                    value={selectedUnitId}
                    onChange={(val) => setSelectedUnitId(val)}
                    options={[
                      { value: 'all', label: 'Semua Unit Pendidikan' },
                      ...availableUnits.map((u) => ({
                        value: String(u.id),
                        label: u.nama_unit || u.name,
                        subtext: u.kode_unit ? `Kode: ${u.kode_unit}` : undefined,
                      })),
                    ]}
                    placeholder="Pilih Unit..."
                    icon={Building2}
                    searchable={availableUnits.length > 5}
                    ariaLabel="Filter Unit Pendidikan"
                  />
                </div>
                {selectedUnitId !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedUnitId('all')}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 cursor-pointer"
                  >
                    <RotateCcw className="size-3.5" />
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* METRIK KPI UTAMA TATA USAHA */}
        <section className="space-y-3">
          <SectionHeader
            title="Metrik Administrasi & Presensi Unit Tata Usaha"
            subtitle={`Ringkasan data siswa, pegawai, dan presensi gerbang${context.unit?.nama ? ` untuk unit ${context.unit.nama}` : ''}`}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <ModernTuKpiCard
              title="Total Siswa Aktif"
              value={formatNumber(kpis.total_siswa?.total)}
              subtitle={`♂ ${formatNumber(kpis.total_siswa?.laki_laki)} L · ♀ ${formatNumber(kpis.total_siswa?.perempuan)} P`}
              icon={Users}
              tone="emerald"
              badge="Siswa Aktif"
              onClick={() => openKpiModal('total_siswa')}
            />
            <ModernTuKpiCard
              title="Total Pegawai & Guru"
              value={formatNumber(kpis.total_pegawai?.total)}
              subtitle={`♂ ${formatNumber(kpis.total_pegawai?.laki_laki)} L · ♀ ${formatNumber(kpis.total_pegawai?.perempuan)} P`}
              icon={UserCheck}
              tone="blue"
              badge="SDM Pegawai"
              onClick={() => openKpiModal('total_pegawai')}
            />
            <ModernTuKpiCard
              title="Siswa Hadir Hari Ini"
              value={formatNumber(kpis.absensi_hari_ini?.siswa_hadir)}
              subtitle={`Dari ${formatNumber(kpis.total_siswa?.total)} siswa unit`}
              icon={CheckCircle2}
              tone="teal"
              badge="Hadir Hari Ini"
              onClick={() => openKpiModal('absensi_hari_ini', 'siswa_hadir')}
            />
            <ModernTuKpiCard
              title="Siswa Belum Absen"
              value={formatNumber(kpis.absensi_hari_ini?.siswa_belum_absen)}
              subtitle="Belum tercatat presensi gerbang"
              icon={AlertTriangle}
              tone="amber"
              badge="Belum Presensi"
              onClick={() => openKpiModal('absensi_hari_ini', 'siswa_belum_absen')}
            />
            <ModernTuKpiCard
              title="Guru & Tendik Hadir"
              value={formatNumber(kpis.absensi_hari_ini?.guru_hadir ?? kpis.absensi_hari_ini?.pegawai_hadir)}
              subtitle={`Dari ${formatNumber(kpis.total_pegawai?.total)} pegawai & guru`}
              icon={UserCheck}
              tone="indigo"
              badge="Guru & Tendik"
              onClick={() => openKpiModal('absensi_hari_ini', 'pegawai')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <ModernTuKpiCard
              title="Data Siswa Perlu Dilengkapi"
              value={formatNumber(kpis.siswa_incomplete?.total)}
              subtitle="NISN, Tanggal Lahir, atau Orang Tua/Wali"
              icon={AlertTriangle}
              tone="amber"
              badge="Perlu Dilengkapi"
              onClick={() => openKpiModal('siswa_incomplete')}
            />
            <ModernTuKpiCard
              title="Data Pegawai Perlu Dilengkapi"
              value={formatNumber(kpis.pegawai_incomplete?.total)}
              subtitle="Nomor Induk Yayasan (NIY) atau NIK"
              icon={AlertTriangle}
              tone="rose"
              badge="Perlu Dilengkapi"
              onClick={() => openKpiModal('pegawai_incomplete')}
            />
          </div>
        </section>

        {/* Grafik per metrik */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-300 shadow-md shadow-sm">
                <FileSpreadsheet className="size-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Visualisasi Data Administrasi & Presensi
                </h2>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Grafik analitik perbandingan gender, presensi gerbang, dan kelengkapan profil data
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <ModernTuChartCard
              title="Distribusi Siswa Aktif"
              subtitle="Perbandingan jenis kelamin siswa"
              icon={Users}
              tone="emerald"
              badge="Siswa"
              empty={!chartHasData(charts.siswa_gender)}
              action={
                <SquircleActionButton
                  variant="view"
                  icon={Users}
                  label="Lihat Detail Siswa"
                  onClick={() => openKpiModal('total_siswa')}
                />
              }
            >
              <GenderDonutChart data={charts.siswa_gender || []} />
            </ModernTuChartCard>

            <ModernTuChartCard
              title="Distribusi Pegawai & Guru"
              subtitle="Perbandingan jenis kelamin SDM"
              icon={UserCheck}
              tone="blue"
              badge="Pegawai"
              empty={!chartHasData(charts.pegawai_gender)}
              action={
                <SquircleActionButton
                  variant="import"
                  icon={UserCheck}
                  label="Lihat Detail Pegawai"
                  onClick={() => openKpiModal('total_pegawai')}
                />
              }
            >
              <GenderDonutChart data={charts.pegawai_gender || []} />
            </ModernTuChartCard>

            <ModernTuChartCard
              title="Absensi Gerbang Hari Ini"
              subtitle="Siswa hadir, belum absen, dan pegawai"
              icon={CheckCircle2}
              tone="teal"
              badge="Presensi"
              empty={!chartHasData(charts.absensi_hari_ini)}
              action={
                <SquircleActionButton
                  variant="primary"
                  icon={CheckCircle2}
                  label="Lihat Detail Absensi"
                  onClick={() => openKpiModal('absensi_hari_ini', 'siswa_hadir')}
                />
              }
            >
              <EnhancedComparisonBarChart data={charts.absensi_hari_ini || []} />
            </ModernTuChartCard>

            <ModernTuChartCard
              title="Kelengkapan Data Siswa"
              subtitle="Profil lengkap vs belum lengkap"
              icon={AlertTriangle}
              tone="amber"
              badge="Kelengkapan"
              empty={!chartHasData(charts.siswa_kelengkapan)}
              action={
                <SquircleActionButton
                  variant="edit"
                  icon={AlertTriangle}
                  label="Lihat Siswa Belum Lengkap"
                  onClick={() => openKpiModal('siswa_incomplete')}
                />
              }
            >
              <KelengkapanDonutChart data={charts.siswa_kelengkapan || []} />
            </ModernTuChartCard>

            <ModernTuChartCard
              title="Kelengkapan Data Pegawai"
              subtitle="NIY/NIK lengkap vs belum lengkap"
              icon={AlertTriangle}
              tone="rose"
              badge="Kelengkapan"
              empty={!chartHasData(charts.pegawai_kelengkapan)}
              action={
                <SquircleActionButton
                  variant="delete"
                  icon={AlertTriangle}
                  label="Lihat Pegawai Belum Lengkap"
                  onClick={() => openKpiModal('pegawai_incomplete')}
                />
              }
            >
              <KelengkapanDonutChart data={charts.pegawai_kelengkapan || []} />
            </ModernTuChartCard>
          </div>
        </section>

        <ModalErrorBoundary onClose={() => { setActiveModal(null); setActiveModalTab(null) }}>
          <TataUsahaKpiModal
            type={activeModal}
            isOpen={Boolean(activeModal)}
            initialTab={activeModalTab}
            unitName={context.unit?.nama}
            onClose={() => { setActiveModal(null); setActiveModalTab(null) }}
          />
        </ModalErrorBoundary>
      </div>
    </PageContainer>
  )
}
