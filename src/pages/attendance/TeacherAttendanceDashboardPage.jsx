import { HeroUiHeader } from "../../components/ui/HeroUiHeader"
import {
  KpiStatCard
} from '../../components/app'
import React, { useEffect, useState } from 'react'
import {
  Link,
  useNavigate
} from 'react-router-dom'
import {
  motion
} from 'framer-motion'
import {
  BookOpen,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Clock3,
  FileText,
  PlayCircle,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Users,
  Layers,
  ArrowRight
} from 'lucide-react'

import {
  lmsPresensiService
} from '../../services/lmsPresensiService'
import {
  useAuthStore
} from '../../stores/authStore'
import ActiveScheduleNotice from '../../components/attendance/ActiveScheduleNotice'
import PageContainer from '../../components/app/PageContainer'
import AppBreadcrumb from '../../components/app/AppBreadcrumb'
import AppBadge from '../../components/app/AppBadge'
import AppEmptyState from '../../components/app/AppEmptyState'
import AppSkeleton from '../../components/app/AppSkeleton'
import {
  Button
} from '@/components/ui/button'

const todayStr = new Date().toLocaleDateString('id-ID', {
 weekday: 'long',
 day: 'numeric',
 month: 'long',
 year: 'numeric',
})

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

export default function TeacherAttendanceDashboardPage() {
 const navigate = useNavigate()
 const user = useAuthStore((state) => state.user)
 const [loading, setLoading] = useState(true)
 const [schedules, setSchedules] = useState([])
 const [activeSchedules, setActiveSchedules] = useState([])
 const [recentSessions, setRecentSessions] = useState([])

 const fetchData = async () => {
 setLoading(true)
 try {
 const todayDate = new Date().toLocaleDateString('en-CA')
 const [mySchedRes, activeSchedRes, sessionsRes] = await Promise.all([
 lmsPresensiService.getMySchedules(todayDate).catch(() => ({ data: [] })),
 lmsPresensiService.getActiveSchedules().catch(() => ({ data: { schedules: [] } })),
 lmsPresensiService.getSessions({ per_page: 5 }).catch(() => ({ data: { data: [] } })),
 ])

 setSchedules(Array.isArray(mySchedRes.data) ? mySchedRes.data : [])
 setActiveSchedules(activeSchedRes.data?.schedules || [])
 const rawSessions = sessionsRes.data?.data || sessionsRes.data || []
 setRecentSessions(Array.isArray(rawSessions) ? rawSessions : [])
 } catch (err) {
 console.error('Failed to load teacher attendance dashboard:', err)
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 fetchData()
 }, [])

 const finalizedCount = recentSessions.filter((s) => s.status === 'finalized').length
 const draftCount = recentSessions.filter((s) => s.status === 'draft').length
 const [sessionFilter, setSessionFilter] = useState('all') // 'all' | 'finalized' | 'draft'

 const filteredSessions = sessionFilter === 'all'
 ? recentSessions
 : recentSessions.filter((s) => s.status === sessionFilter)

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
 <AppBreadcrumb
 items={[
 { label: 'Presensi KBM', href: '/absensi' },
 { label: 'Dashboard Presensi Guru' },
 ]}
 />
 </motion.div>

 {/* ── Modern Hero Card ── */}
 <HeroUiHeader
          title="Dashboard Presensi Guru (KBM)"
          subtitle="Pencatatan kehadiran mengajar mandiri di kelas, monitoring jadwal aktif harian, dan evaluasi kepatuhan mengajar."
          badge="Presensi Mengajar Guru"
          icon={CalendarCheck}
          className="mb-6"
        />

 {/* ── Active Schedule Notification ── */}
 <motion.div variants={itemVariants}>
 <ActiveScheduleNotice />
 </motion.div>

 {/* ── KPI Summary Cards ── */}
 <motion.div variants={itemVariants}>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <ModernKpiCard
 icon={BookOpen}
 label="Jadwal Hari Ini"
 subtext="Jam pelajaran terdaftar"
 value={schedules.length}
 tag={`${schedules.length} Jam`}
 tone="emerald"
 />
 <ModernKpiCard
 icon={Clock}
 label="Sesi Berlangsung"
 subtext="KBM sedang aktif berjalan"
 value={activeSchedules.length}
 tag={`${activeSchedules.length} Aktif`}
 tone="blue"
 />
 <ModernKpiCard
 icon={ShieldCheck}
 label="Sesi Difinalisasi"
 subtext={recentSessions.length > 0 ? `${finalizedCount} dari ${recentSessions.length} sesi (${Math.round((finalizedCount / recentSessions.length) * 100)}%)` : (schedules.length > 0 ? `${finalizedCount} dari ${schedules.length} sesi` : 'Presensi tersimpan permanen')}
 value={finalizedCount}
 tag={`${finalizedCount} Selesai`}
 tone="teal"
 onClick={() => setSessionFilter(sessionFilter === 'finalized' ? 'all' : 'finalized')}
 />
 <ModernKpiCard
 icon={FileText}
 label="Presensi Draft"
 subtext={recentSessions.length > 0 ? `${draftCount} dari ${recentSessions.length} sesi perlu finalisasi` : (schedules.length > 0 ? `${draftCount} dari ${schedules.length} sesi` : 'Perlu verifikasi guru')}
 value={draftCount}
 tag={`${draftCount} Draft`}
 tone="amber"
 onClick={() => setSessionFilter(sessionFilter === 'draft' ? 'all' : 'draft')}
 />
 </div>
 </motion.div>

 {/* KPI Definition & Drilldown Transparency Banner */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] p-4 text-xs dark:border-emerald-800/60 dark:bg-[#13221f] dark:from-[#13221f] dark:to-[#1B2433]">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <span className="rounded-lg bg-teal-600 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
 Formula KPI Sesi Mengajar
 </span>
 <span className="font-bold text-slate-800 dark:text-slate-100">
 Tingkat Finalisasi: {recentSessions.length > 0 ? `${Math.round((finalizedCount / recentSessions.length) * 100)}%` : '—'}
 </span>
 </div>
 <p className="text-xs text-slate-600 dark:text-slate-400">
 <strong className="text-slate-700 dark:text-slate-200">Rumus:</strong> (Sesi Berstatus Final / Total Sesi Terdata) &times; 100% • <strong className="text-slate-700 dark:text-slate-200">Pembilang:</strong> {finalizedCount} sesi final • <strong className="text-slate-700 dark:text-slate-200">Penyebut:</strong> {recentSessions.length || schedules.length} sesi total • <strong className="text-slate-700 dark:text-slate-200">Periode:</strong> Hari ini ({todayStr}).
 </p>
 </div>
 {sessionFilter !== 'all' && (
 <div className="flex items-center gap-2 shrink-0">
 <span className="rounded-lg bg-amber-100 dark:bg-amber-950/80 px-2.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-800/60">
 Filter Sesi: {sessionFilter === 'finalized' ? 'Final' : 'Draft'}
 </span>
 <button
 type="button"
 onClick={() => setSessionFilter('all')}
 className="rounded-lg bg-emerald-50 border border-emerald-200/80 dark:bg-emerald-950/60 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition cursor-pointer"
 >
 Reset Filter
 </button>
 </div>
 )}
 </div>
 </div>

 {/* ── Main Content Grid ── */}
 <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-3">
 {/* Today's Teaching Schedule List (Col 1 & 2) */}
 <div className="lg:col-span-2 space-y-4">
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
 <div className="p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-900/50 border-b border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-between">
 <div className="flex items-center gap-2.5">
 <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 shadow-xs dark:bg-emerald-950/40 dark:border-emerald-700/80 dark:text-emerald-300 shadow-sm">
 <BookOpen className="size-4 text-emerald-600" />
 </div>
 <div>
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
 Jadwal Mengajar Hari Ini
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
 Rombel dan jam pelajaran yang terjadwal
 </p>
 </div>
 </div>

 <Link
 to="/absensi/jadwal-mengajar"
 className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
 >
 Lihat Selengkapnya <ArrowRight className="size-3.5" />
 </Link>
 </div>

 <div className="p-4 sm:p-5">
 {loading ? (
 <AppSkeleton rows={4} />
 ) : schedules.length === 0 ? (
 <AppEmptyState
 title="Tidak ada jadwal mengajar hari ini"
 description="Anda tidak memiliki jam pelajaran mengajar pada hari ini."
 />
 ) : (
 <div className="grid gap-3.5 sm:grid-cols-2">
 {schedules.map((item) => (
 <div
 key={item.id}
 className="group relative flex flex-col justify-between rounded-xl border-2 border-emerald-200/80 bg-slate-50/50 p-4 sm:p-5 transition hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-white hover:shadow-md dark:border-emerald-800/60 dark:bg-slate-900/40 dark:hover:border-emerald-700/80 dark:hover:bg-[#1B2433]"
 >
 <div>
 <div className="flex items-center justify-between mb-2.5">
 <span className="rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 px-2.5 py-1 text-xs font-bold font-mono">
 {item.time || item.jam_ke || 'Jam Mengajar'}
 </span>
 <AppBadge variant={item.is_active ? 'success' : 'gray'}>
 {item.is_active ? 'Sedang Berlangsung' : 'Jadwal Hari Ini'}
 </AppBadge>
 </div>
 <h4 className="text-base font-black text-slate-900 group-hover:text-emerald-600 dark:text-white transition-colors">
 {item.subject_name || item.nama_matpel || 'Mata Pelajaran'}
 </h4>
 <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">
 Kelas: <span className="font-bold text-slate-800 dark:text-slate-200">{item.class_name || item.rombel_nama || '-'}</span>
 </p>
 </div>

 <div className="mt-4 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
 <span className="text-xs text-slate-500 font-medium">
 {item.total_students ? `${item.total_students} Siswa` : 'Presensi Kelas'}
 </span>
 <Button
 variant="primary"
 appearance="fill"
 size="xs"
 onClick={() => navigate(`/absensi/presensi?schedule_id=${item.id}&date=${new Date().toLocaleDateString('en-CA')}`)}
 className="bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white hover:from-emerald-700 hover:to-teal-700 shadow-xs cursor-pointer"
 >
 <PlayCircle className="mr-1 h-3.5 w-3.5" /> Presensi
 </Button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Recent Sessions Sidebar (Col 3) */}
 <div className="space-y-4">
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
 <div className="p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-900/50 border-b border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-between">
 <div className="flex items-center gap-2.5">
 <div className="flex size-9 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-sm">
 <Clock3 className="size-4 text-slate-600" />
 </div>
 <div>
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
 Sesi Presensi Terbaru
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
 Riwayat rekaman KBM
 </p>
 </div>
 </div>

 <Link
 to="/absensi/riwayat-guru"
 className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
 >
 Riwayat &rarr;
 </Link>
 </div>

 <div className="p-4 sm:p-5">
 {loading ? (
 <AppSkeleton rows={3} />
 ) : recentSessions.length === 0 ? (
 <p className="py-8 text-center text-xs text-slate-400 font-medium">
 Belum ada sesi presensi tersimpan.
 </p>
 ) : (
 <div className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {filteredSessions.map((session) => (
 <div key={session.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
 <div className="min-w-0">
 <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
 {session.schedule?.subject_name || session.subject || 'Mata Pelajaran'}
 </p>
 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
 {session.attendance_date || session.tanggal} • Pertemuan #{session.meeting_number || 1}
 </p>
 </div>
 <AppBadge variant={session.status === 'finalized' ? 'success' : 'warning'}>
 {session.status === 'finalized' ? 'Final' : 'Draft'}
 </AppBadge>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>
 </motion.div>
 </motion.div>
 </PageContainer>
 )
}
