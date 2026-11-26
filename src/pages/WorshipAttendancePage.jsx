import { HeroUiHeader } from "../components/ui/HeroUiHeader"
import AppModal from "../components/app/AppModal"
import CustomSelect from "../components/ui/CustomSelect"
import { getSimNow, useSimulationClockStore } from "../stores/simulationClockStore"
import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  Moon,
  Sun,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Filter,
  Users,
  ShieldCheck,
  Calendar,
  Sparkles,
  Lock,
  Eye,
  QrCode,
  Radio,
  UserCheck,
  Camera,
  CameraOff,
  X,
  RefreshCw,
  Wifi,
  XCircle,
  Heart,
  BookOpen,
  MapPin,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  Download,
  FileSpreadsheet,
  FileText,
  Search,
  Activity,
  TrendingUp,
  Star,
  Bell,
  Layers,
  ChevronLeft,
  Info,
  MoreVertical,
  Edit,
  Trash2,
  ArrowRight,
  PlayCircle,
  StopCircle,
  User,
  SlidersHorizontal,
  RotateCcw,
  Check,
  CalendarDays,
  School
} from 'lucide-react'
import {
  Link
} from 'react-router-dom'
import {
  worshipAttendanceService
} from '../services/worshipAttendanceService'
import {
  useAuthStore
} from '../stores/authStore'
import {
  MasterDataPage,
  MasterPageHeader,
  MasterActionButton,
  MasterStatCard,
  MasterStatsGrid,
  SquircleActionButton
} from '../components/master-data'
import {
  Button
} from '@/components/ui/button'
import {
  DatePicker
} from '@/components/ui/date-picker'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppTabs from '../components/app/AppTabs'
import {
  useToast,
  KpiStatCard
} from '../components/app'



// ─── Status Pill Helper ───────────────────────────────────────────────────
function getAttendancePill(status) {
 switch (status) {
 case 'hadir_berjamaah':
 return <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Berjamaah</span>
 case 'hadir_sendiri':
 return <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300">Munfarid</span>
 case 'terlambat':
 return <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">Terlambat</span>
 case 'tidak_hadir':
 return <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">Tidak Hadir</span>
 case 'haid':
 case 'uzur_syarii':
 return <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800 dark:bg-purple-950 dark:text-purple-300">Haid / Uzur</span>
 default:
 return <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200/80 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-sky-950/60 dark:text-sky-300">Belum Verifikasi</span>
 }
}

// ─── KPI TINTED CARD COMPONENT (DECLARED OUTSIDE TO PREVENT RE-ANIMATION ON 1S CLOCK TICK) ───
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

// ─── MAIN PAGE COMPONENT ──────────────────────────────────────────────────
export default function WorshipAttendancePage() {
 const authUser = useAuthStore((s) => s.user) || (() => {
 try {
 const raw = localStorage.getItem('school_erp_user') || sessionStorage.getItem('school_erp_user')
 return raw ? JSON.parse(raw) : null
 } catch {
 return null
 }
 })()

 const userRole = authUser?.role || authUser?.roles?.[0]?.name || authUser?.roles?.[0] || ''
 const userUnitName =
 authUser?.unit?.name ||
 authUser?.unit?.nama ||
 authUser?.education_unit?.name ||
 authUser?.education_unit?.nama ||
 authUser?.employee?.unit?.name ||
 authUser?.education_unit_name ||
 authUser?.unit_name ||
 authUser?.metadata?.unit_name ||
 ''
 const userUnitId =
 authUser?.unit_id ||
 authUser?.unit?.id ||
 authUser?.education_unit_id ||
 authUser?.employee?.unit_id ||
 null

 const unitProgramType = String(
 authUser?.unit?.program_type ||
 authUser?.education_unit?.program_type ||
 authUser?.employee?.unit?.program_type ||
 ''
 ).toLowerCase()
 const unitNameLower = String(userUnitName || '').toLowerCase()
 const roleLower = String(userRole || '').toLowerCase()

 // Determine if logged in user manages a Pesantren Pondok / Boarding unit or Regular School
 const isPesantrenUnit = Boolean(
 authUser?.is_pesantren ||
 unitProgramType === 'boarding' ||
 unitNameLower.includes('pesantren') ||
 unitNameLower.includes('pondok') ||
 unitNameLower.includes('ponpes') ||
 unitNameLower.includes('mahad') ||
 unitNameLower.includes("ma'had") ||
 roleLower.includes('musyrif') ||
 roleLower.includes('super') ||
 roleLower.includes('yayasan') ||
 roleLower.includes('divisi') ||
 roleLower.includes('kabid')
 )

 // ── State (preserved API logic) ──────────────────────────────────────────
 const [activeTab, setActiveTab] = useState('sessions') // 'sessions' | 'templates'
 const [worshipMethod, setWorshipMethod] = useState('MANUAL') // 'MANUAL' | 'QRCODE' | 'RFID'
 const simLastIso = useSimulationClockStore((s) => (s.enabled && s.lastIso ? s.lastIso.slice(0, 10) : ''))
 const [date, setDate] = useState(() => getSimNow().toLocaleDateString('en-CA'))
 const [now, setNow] = useState(() => getSimNow())

 useEffect(() => {
   if (!simLastIso) return
   const sim = getSimNow()
   setDate(sim.toLocaleDateString('en-CA'))
   setNow(sim)
 }, [simLastIso])

 // LIVE CLOCK TIMER (1s Ticker synced to Simulation Clock when active)
 useEffect(() => {
 const timer = setInterval(() => setNow(getSimNow()), 1000)
 return () => clearInterval(timer)
 }, [])

 const [showEditSessionModal, setShowEditSessionModal] = useState(false)
 const [editSessionForm, setEditSessionForm] = useState({
 id: '',
 nama: '',
 start_time: '04:45',
 end_time: '05:30',
 location_name: '',
 status: 'opened',
 })

 // Format Dynamic Day & Date Display (Indonesian Locale)
 const formattedDayName = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(now)
 const formattedFullDate = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(now)
 const formattedLiveClock = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
 const [templates, setTemplates] = useState([])
 const [sessions, setSessions] = useState([])
 const [selectedSession, setSelectedSession] = useState(null)
 const [sessionDetail, setSessionDetail] = useState(null)
 const [loading, setLoading] = useState(false)

 const [scanInput, setScanInput] = useState('')
 const [processingScan, setProcessingScan] = useState(false)
 const [scanResult, setScanResult] = useState(null)

 const [showCameraModal, setShowCameraModal] = useState(false)
 const [cameraActive, setCameraActive] = useState(false)
 const [cameraLoading, setCameraLoading] = useState(false)
 const [cameraError, setCameraError] = useState('')
 const [modalInput, setModalInput] = useState('')
 const videoRef = useRef(null)
 const streamRef = useRef(null)

 const [showVerifyModal, setShowVerifyModal] = useState(false)
 const [verifyStudentId, setVerifyStudentId] = useState('')
 const [verifyStatus, setVerifyStatus] = useState('hadir_berjamaah')
 const [verifyNotes, setVerifyNotes] = useState('')

 const [showTemplateModal, setShowTemplateModal] = useState(false)
 const [templateForm, setTemplateForm] = useState({
 nama: '',
 code: '',
 category: 'shalat_wajib',
 obligation_type: 'wajib',
 gender_scope: 'all',
 time_source: 'prayer_schedule',
 prayer_name: 'subuh',
 start_time: '04:45',
 end_time: '05:30',
 location_name: 'Masjid Utama Pesantren',
 })

 // ── UI States ───────────────────────────────────────────────────────────
 const [centerTab, setCenterTab] = useState('presensi')
 const [showStudentDrawer, setShowStudentDrawer] = useState(false)
 const [selectedStudent, setSelectedStudent] = useState(null)
 const [drawerTab, setDrawerTab] = useState('riwayat')
 const [templateStep, setTemplateStep] = useState(1)
 const [searchSantri, setSearchSantri] = useState('')
 const [filterStatus, setFilterStatus] = useState('')
 const [filterKamar, setFilterKamar] = useState('')
 const [filterKelompok, setFilterKelompok] = useState('')

 const toast = useToast()
 const toastSuccess = (title, message) => toast.success(title, message)
 const toastError = (title, message) => toast.error(title, message)
 const toastWarning = (title, message) => toast.warning(title, message)
 const toastInfo = (title, message) => toast.info(title, message)

 const handleOpenEditSessionModal = (session) => {
 setEditSessionForm({
 id: session.id,
 nama: session.template?.nama || 'Sesi Ibadah',
 start_time: session.scheduled_start_at || '04:45',
 end_time: session.scheduled_end_at || '05:30',
 location_name: session.location_name || 'Masjid Utama Pesantren',
 status: session.status || 'opened',
 })
 setShowEditSessionModal(true)
 }

 const handleSaveEditSession = (e) => {
 e.preventDefault()
 setSessions((prev) =>
 prev.map((s) =>
 s.id === editSessionForm.id
 ? {
 ...s,
 scheduled_start_at: editSessionForm.start_time,
 scheduled_end_at: editSessionForm.end_time,
 location_name: editSessionForm.location_name,
 status: editSessionForm.status,
 }
 : s
 )
 )

 if (selectedSession?.id === editSessionForm.id) {
 setSelectedSession((prev) => ({
 ...prev,
 scheduled_start_at: editSessionForm.start_time,
 scheduled_end_at: editSessionForm.end_time,
 location_name: editSessionForm.location_name,
 status: editSessionForm.status,
 }))
 }
 if (sessionDetail?.id === editSessionForm.id) {
 setSessionDetail((prev) => ({
 ...prev,
 scheduled_start_at: editSessionForm.start_time,
 scheduled_end_at: editSessionForm.end_time,
 location_name: editSessionForm.location_name,
 status: editSessionForm.status,
 }))
 }

 toastSuccess('Jadwal Sholat Santri Diperbarui', `Jam & lokasi ${editSessionForm.nama} berhasil disesuaikan.`)
 setShowEditSessionModal(false)
 }

 // ── Handlers ─────────────────────────────────────────────────────────────
 const stopCamera = () => {
 if (streamRef.current) {
 streamRef.current.getTracks().forEach((track) => track.stop())
 streamRef.current = null
 }
 if (videoRef.current) {
 videoRef.current.srcObject = null
 }
 setCameraActive(false)
 }

 useEffect(() => {
 fetchTemplates()
 fetchSessions()
 return () => { stopCamera() }
 }, [date])

 const fetchTemplates = async () => {
 try {
 const res = await worshipAttendanceService.getTemplates()
 setTemplates(res?.data?.data || res?.data || [])
 } catch (e) {
 console.error('Failed fetching templates:', e)
 }
 }

 const fetchSessions = async () => {
 setLoading(true)
 try {
 const res = await worshipAttendanceService.getSessions({ date })
 const data = res?.data?.data || res?.data || []
 if (Array.isArray(data) && data.length > 0) {
 setSessions(data)
 if (!selectedSession) {
 setSelectedSession(data[0])
 setSessionDetail(data[0])
 }
 } else {
 setSessions([])
 setSelectedSession(null)
 setSessionDetail(null)
 }
 } catch (e) {
 console.error('Failed fetching sessions:', e)
 setSessions([])
 setSelectedSession(null)
 setSessionDetail(null)
 } finally {
 setLoading(false)
 }
 }

 const handleOpenSession = async (session) => {
 setSelectedSession(session)
 setCenterTab('presensi')
 if (!session?.id) return
 try {
 const res = await worshipAttendanceService.getSessionDetail(session.id)
 setSessionDetail(res?.data?.data || session)
 } catch (e) {
 console.error('Failed fetching session detail:', e)
 setSessionDetail(session)
 }
 }

 const startCamera = async () => {
 setCameraLoading(true)
 setCameraError('')
 stopCamera()
 try {
 let mediaStream = null
 try {
 mediaStream = await navigator.mediaDevices.getUserMedia({
 video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
 })
 } catch (e) {
 mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
 }
 streamRef.current = mediaStream
 if (videoRef.current) {
 videoRef.current.srcObject = mediaStream
 await videoRef.current.play()
 }
 setCameraActive(true)
 } catch (err) {
 console.error('Camera Access Error:', err)
 setCameraError('Kamera tidak dapat diakses. Pastikan izin kamera telah diberikan.')
 setCameraActive(false)
 } finally {
 setCameraLoading(false)
 }
 }

 const openCameraModal = () => {
 setShowCameraModal(true)
 setTimeout(() => { startCamera() }, 200)
 }

 const closeCameraModal = () => {
 stopCamera()
 setShowCameraModal(false)
 }

 const handleProcessWorshipScan = async (codeToScan) => {
 const cleanCode = String(codeToScan || '').trim()
 if (!cleanCode || !selectedSession) return
 setProcessingScan(true)
 try {
 const res = await worshipAttendanceService.scanWorship(selectedSession.id, {
 card_number: cleanCode,
 scan_method: worshipMethod.toLowerCase(),
 })
 setScanResult({ success: true, message: res?.data?.message || 'Presensi ibadah santri berhasil.' })
 toastSuccess('Presensi Berhasil', res?.data?.message || 'Santri tercatat hadir berjamaah.')
 handleOpenSession(selectedSession)
 setScanInput('')
 setModalInput('')
 } catch (e) {
 const msg = e?.response?.data?.message || 'Gagal memproses absensi ibadah.'
 setScanResult({ success: false, message: msg })
 toastError('Gagal Scan', msg)
 } finally {
 setProcessingScan(false)
 }
 }

 const handleQuickStatusChange = async (studentId, statusVal) => {
 if (!selectedSession) return
 if (sessionDetail && sessionDetail.details) {
 setSessionDetail({
 ...sessionDetail,
 details: sessionDetail.details.map((d) =>
 d.student_id === studentId || d.id === studentId
 ? { ...d, attendance_status: statusVal, check_in_time: statusVal !== 'tidak_hadir' && statusVal !== 'haid' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' WIB' : '-' }
 : d
 ),
 })
 }
 toastSuccess('Status Diperbarui', `Status santri berhasil diperbarui.`)
 try {
 await worshipAttendanceService.verifyStudent(selectedSession.id, { student_id: studentId, attendance_status: statusVal })
 } catch (e) {
 console.error('Failed verifying student worship status:', e)
 }
 }

 const handleCreateTemplate = async (e) => {
 e.preventDefault()
 try {
 await worshipAttendanceService.createTemplate(templateForm)
 toastSuccess('Template Berhasil Dibuat', 'Template presensi ibadah berhasil ditambahkan.')
 setShowTemplateModal(false)
 setTemplateStep(1)
 fetchTemplates()
 } catch (e) {
 toastError('Gagal Menyimpan', e?.response?.data?.message || 'Gagal menyimpan template.')
 }
 }

 const handleVerifySubmit = async (e) => {
 e.preventDefault()
 if (!selectedSession || !verifyStudentId) return
 await handleQuickStatusChange(verifyStudentId, verifyStatus)
 setShowVerifyModal(false)
 }

 const [currentPage, setCurrentPage] = useState(1)
 const [perPage, setPerPage] = useState(10)

 // ── Filtered student list for active session ──────────────────────────────
 const activeDetails = sessionDetail?.details || []
 const filteredDetails = useMemo(() => {
 return activeDetails.filter((d) => {
 const matchSearch = !searchSantri || d.student?.nama_lengkap?.toLowerCase().includes(searchSantri.toLowerCase()) || d.student?.nisn?.includes(searchSantri)
 const matchStatus = !filterStatus || d.attendance_status === filterStatus
 const matchKamar = !filterKamar || d.room === filterKamar
 const matchKelompok = !filterKelompok || d.group === filterKelompok
 return matchSearch && matchStatus && matchKamar && matchKelompok
 })
 }, [activeDetails, searchSantri, filterStatus, filterKamar, filterKelompok])

 const totalPages = Math.max(1, Math.ceil(filteredDetails.length / perPage))
 const paginatedDetails = useMemo(() => {
 const start = (currentPage - 1) * perPage
 return filteredDetails.slice(start, start + perPage)
 }, [filteredDetails, currentPage, perPage])

 // ── Stats calculation ────────────────────────────────────────────────────
 const totalSantriCount = activeDetails.length
 const countBerjamaah = activeDetails.filter((d) => d.attendance_status === 'hadir_berjamaah').length
 const countMunfarid = activeDetails.filter((d) => d.attendance_status === 'hadir_sendiri').length
 const countTerlambat = activeDetails.filter((d) => d.attendance_status === 'terlambat').length
 const countTidakHadir = activeDetails.filter((d) => d.attendance_status === 'tidak_hadir').length
 const countHaid = activeDetails.filter((d) => ['haid', 'uzur_syarii'].includes(d.attendance_status)).length
 const countBelumVerifikasi = Math.max(0, totalSantriCount - (countBerjamaah + countMunfarid + countTerlambat + countTidakHadir + countHaid))

 const pctBerjamaah = totalSantriCount > 0 ? ((countBerjamaah / totalSantriCount) * 100).toFixed(1) : '0.0'
 const pctMunfarid = totalSantriCount > 0 ? ((countMunfarid / totalSantriCount) * 100).toFixed(1) : '0.0'
 const pctTerlambat = totalSantriCount > 0 ? ((countTerlambat / totalSantriCount) * 100).toFixed(1) : '0.0'
 const pctTidakHadir = totalSantriCount > 0 ? ((countTidakHadir / totalSantriCount) * 100).toFixed(1) : '0.0'
 const pctHaid = totalSantriCount > 0 ? ((countHaid / totalSantriCount) * 100).toFixed(1) : '0.0'

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
 <MasterDataPage className="space-y-6" hideBreadcrumb>
 <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">

 {/* BREADCRUMB NAV */}
 <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Presensi & Absensi Ibadah Santri' }]} />

 {/* MODERN HERO CARD HEADER (MATCHING PORTAL ORANG TUA / SISWA STYLE) */}
 <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
 <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 !bg-[#D5F2E3] p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:!bg-[#112a22] print:hidden">

 <div className="relative z-10 flex flex-col gap-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
 
            <Moon className="size-6 sm:size-7 text-white" />
 </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
 <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold bg-emerald-600 text-white shadow-xs border border-emerald-500/40 dark:border-emerald-600/50">
 
                  <Sparkles className="size-3 animate-pulse text-white" />
 Ibadah Santri Pesantren
 </span>
 <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
 Pondok Pesantren
 </span>
 </div>
 <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
 Presensi & Absensi Ibadah Santri Pesantren
 </h1>
              </div>
            </div>

            {/* Live Clock & Date Controls */}
 <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap z-10">
 <div className="hidden sm:flex items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white/80 px-3 py-1.5 dark:border-emerald-800/60 dark:bg-slate-900/80 backdrop-blur-sm">
 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
 <div className="text-right">
 <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 leading-none">
 {formattedDayName}, {formattedFullDate}
 </p>
 <p className="text-xs font-black font-mono text-emerald-900 dark:text-emerald-200 leading-tight mt-0.5">
 {formattedLiveClock} WIB
 </p>
 </div>
 </div>

 <DatePicker
 value={date}
 onChange={(e) => setDate(e.target.value)}
 className="w-40"
 inputClassName="h-9 text-xs font-semibold"
 />

 <SquircleActionButton
 variant="primary"
 label="Template Baru"
 onClick={() => { setShowTemplateModal(true); setTemplateStep(1) }}
 />
          </div>
          </div>

          <div className="w-full pt-2 border-t border-emerald-500/20 dark:border-emerald-500/30">
            <p className="w-full text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
 Monitoring presensi shalat 5 waktu berjamaah di masjid pesantren, tahajud, dzikir, dan program asrama santri mukim.
 </p>
          </div>
        </div>
      </div>
    </motion.div>

 {/* ── SCOPED ALERT NOTICE UNTUK KEPALA SEKOLAH REGULER (NON-PESANTREN) ── */}
 {!isPesantrenUnit && userRole !== 'Superadmin' && userRole !== 'Pengurus Yayasan' && (
 <div className="mb-6 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/90 p-5 shadow-sm dark:border-emerald-800/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 space-y-3.5">
 <div className="flex items-start gap-3.5">
 <div className="flex h-9 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
 <AlertCircle className="h-6 w-6" />
 </div>
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <h3 className="text-base font-bold text-amber-950 dark:text-amber-100">
 Akses Terbatasi — Unit Sekolah {userUnitName}
 </h3>
 <span className="rounded-full bg-amber-200/80 px-2.5 py-0.5 text-[10px] font-bold text-amber-900">
 Sekolah Reguler
 </span>
 </div>
 <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
 Halaman <strong>Absensi Ibadah Santri Pesantren</strong> ini dikhususkan untuk unit Pondok Pesantren yang mengelola program santri mukim/asrama. Unit yang Anda pimpin (<strong>{userUnitName}</strong>) merupakan Sekolah Reguler dan tidak memiliki data santri. Data antar-unit diisolasi secara ketat demi keamanan dan privasi data sekolah.
 </p>
 </div>
 </div>

 <div className="flex flex-wrap items-center gap-3 pt-2.5 border-t border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60">
 <Link
 to="/dashboard/absensi-ibadah-siswa"
 className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-emerald-600 shadow-sm transition-all hover:bg-amber-700 hover:scale-105 active:scale-95"
 >
 <School className="h-4 w-4" />
 <span>Kelola Absensi Ibadah Siswa Sekolah ({userUnitName})</span>
 </Link>
 </div>
 </div>
 )}

 {/* ── MASTER TAB SWITCHER (Rapi & Sejajar) ─────────────────────────── */}
 <div className="my-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-emerald-200/80 bg-white p-2 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <AppTabs
 tabs={[
 { id: 'sessions', label: `Sesi Harian Ibadah (${date})`, icon: CalendarDays },
 { id: 'templates', label: 'Template & Konfigurasi Jadwal', icon: Sparkles },
 ]}
 activeTab={activeTab}
 onChange={setActiveTab}
 ariaLabel="Navigasi presensi ibadah"
 />
 </div>

 {activeTab === 'sessions' && (
 <>
 {/* ── KPI CARDS ROW (Exact match with HeroUI reference) ──────────── */}
 <motion.section variants={itemVariants} className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
 <KpiTintedCard
 icon={Users}
 label="Total Santri"
 value={totalSantriCount}
 subtext="Periode aktif"
 tone="blue"
 />
 <KpiTintedCard
 icon={CheckCircle2}
 label="Hadir Berjamaah"
 value={countBerjamaah}
 subtext={`${pctBerjamaah}%`}
 tone="emerald"
 />
 <KpiTintedCard
 icon={User}
 label="Munfarid"
 value={countMunfarid}
 subtext={`${pctMunfarid}%`}
 tone="sky"
 />
 <KpiTintedCard
 icon={Clock}
 label="Terlambat"
 value={countTerlambat}
 subtext={`${pctTerlambat}%`}
 tone="amber"
 />
 <KpiTintedCard
 icon={XCircle}
 label="Tidak Hadir"
 value={countTidakHadir}
 subtext={`${pctTidakHadir}%`}
 tone="rose"
 />
 <KpiTintedCard
 icon={Heart}
 label="Haid / Uzur"
 value={countHaid}
 subtext={`${pctHaid}%`}
 tone="purple"
 />
 <KpiTintedCard
 icon={ShieldCheck}
 label="Belum Verifikasi"
 value={countBelumVerifikasi}
 subtext="6.3%"
 tone="teal"
 />
 </motion.section>

 {/* ── 3-COLUMN DASHBOARD LAYOUT ───────────────────────────────────── */}
 <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">

 {/* ── LEFT COLUMN: DAFTAR SESI IBADAH (col-span-3) ──────────────── */}
 <div className="space-y-3 lg:col-span-3">
 <div className="rounded-xl border border-emerald-200/80 bg-white p-4 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
 Daftar Sesi Ibadah
 </h3>

 <div className="space-y-2.5">
 {sessions.map((s) => {
 const isSel = selectedSession?.id === s.id
 const isOpened = s.status === 'opened'
 const countText = isOpened ? `${countBerjamaah} / ${totalSantriCount}` : `- / ${totalSantriCount}`
 const isSun = s.template?.category !== 'shalat_wajib' || ['DZUHUR_BERJAMAAH', 'ASHAR_BERJAMAAH'].includes(s.template?.code)

 return (
 <button
 key={s.id}
 type="button"
 onClick={() => handleOpenSession(s)}
 className={`w-full text-left rounded-xl border p-3.5 transition-all ${
 isSel
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 shadow-sm dark:border-emerald-800/60 dark:bg-emerald-950/30'
 : 'border-emerald-100/80 bg-white hover:border-emerald-200/80 dark:border-emerald-800/60 dark:bg-[#111827]'
 }`}
 >
 <div className="flex items-start justify-between gap-2">
 <div className="flex items-center gap-2">
 <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isSel ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'}`}>
 {isSun ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
 </div>
 <div>
 <p className={`text-xs font-bold ${isSel ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-200'}`}>
 {s.template?.nama}
 </p>
 <p className="text-[10px] text-slate-400">
 {s.scheduled_start_at} - {s.scheduled_end_at}
 </p>
 </div>
 </div>
 <div className="flex items-center gap-1">
 <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
 isOpened
 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
 : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
 }`}>
 {isOpened ? 'Opened' : 'Upcoming'}
 </span>
 <MoreVertical className="h-3.5 w-3.5 text-slate-300" />
 </div>
 </div>

 <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
 <span className="truncate max-w-[140px]">{s.location_name}</span>
 <span className="font-bold text-slate-600 dark:text-slate-300">{countText}</span>
 </div>
 </button>
 )
 })}
 </div>

 <button
 onClick={() => toastInfo('Semua Sesi', 'Menampilkan seluruh sesi harian.')}
 className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 py-2 text-xs font-bold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-800/60 dark:bg-slate-800/50 dark:text-slate-300"
 >
 Lihat Semua Sesi <ArrowRight className="h-3.5 w-3.5" />
 </button>
 </div>
 </div>

 {/* ── MIDDLE COLUMN: SESSION DETAIL & TABLE (col-span-6) ─────────── */}
 <div className="space-y-4 lg:col-span-6">
 {sessionDetail ? (
 <div className="rounded-xl border border-emerald-200/80 bg-white p-5 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433] space-y-4">

 {/* Header Row */}
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-4 dark:border-emerald-800/60">
 <div>
 <div className="flex flex-wrap items-center gap-2">
 <h2 className="text-base font-bold text-slate-900 dark:text-white">
 {sessionDetail.template?.nama}
 </h2>
 <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
 Opened
 </span>
 <SquircleActionButton
 variant="edit"
 icon={Edit}
 label="Ubah Jam Manual"
 onClick={() => handleOpenEditSessionModal(sessionDetail)}
 />
 </div>
 <div className="mt-1 flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
 <span className="flex items-center gap-1 font-medium">
 <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
 <span>Lokasi: <strong className="text-slate-700 dark:text-slate-200">{sessionDetail.location_name}</strong></span>
 </span>
 <span className="text-slate-300 dark:text-slate-700">|</span>
 <span className="flex items-center gap-1 font-medium">
 <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
 <span>Jam Sesi: <strong className="text-slate-700 dark:text-slate-200">{sessionDetail.scheduled_start_at} - {sessionDetail.scheduled_end_at} WIB</strong></span>
 </span>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <SquircleActionButton
 variant="neutral"
 icon={ChevronDown}
 label="Aksi Cepat"
 onClick={() => toastInfo('Aksi Cepat', 'Pilihan aksi cepat sesi.')}
 />
 <SquircleActionButton
 variant="primary"
 icon={Lock}
 label="Tutup Sesi"
 onClick={() => toastWarning('Tutup Sesi', 'Sesi telah ditutup.')}
 />
 </div>
 </div>

 {/* Sub Tabs */}
 <div className="flex border-b border-emerald-200/80 dark:border-emerald-800/60 text-xs font-bold dark:border-emerald-800/60">
 <button
 onClick={() => setCenterTab('presensi')}
 className={`pb-2.5 px-3 transition border-b-2 ${
 centerTab === 'presensi'
 ? 'border-emerald-200/80 text-emerald-700 dark:border-emerald-800/60 dark:text-emerald-400'
 : 'border-transparent text-slate-400 hover:text-slate-600'
 }`}
 >
 Data Presensi
 </button>
 <button
 onClick={() => setCenterTab('musyrif')}
 className={`pb-2.5 px-3 transition border-b-2 ${
 centerTab === 'musyrif'
 ? 'border-emerald-200/80 text-emerald-700 dark:border-emerald-800/60 dark:text-emerald-400'
 : 'border-transparent text-slate-400 hover:text-slate-600'
 }`}
 >
 Verifikasi Musyrif
 </button>
 <button
 onClick={() => setCenterTab('riwayat')}
 className={`pb-2.5 px-3 transition border-b-2 ${
 centerTab === 'riwayat'
 ? 'border-emerald-200/80 text-emerald-700 dark:border-emerald-800/60 dark:text-emerald-400'
 : 'border-transparent text-slate-400 hover:text-slate-600'
 }`}
 >
 Riwayat Sesi
 </button>
 <button
 onClick={() => setCenterTab('catatan')}
 className={`pb-2.5 px-3 transition border-b-2 ${
 centerTab === 'catatan'
 ? 'border-emerald-200/80 text-emerald-700 dark:border-emerald-800/60 dark:text-emerald-400'
 : 'border-transparent text-slate-400 hover:text-slate-600'
 }`}
 >
 Catatan
 </button>
 </div>

 {/* ── METODE ABSENSI SECTION ──────────────────────────── */}
 <div>
 <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
 Metode Absensi
 </p>
 <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
 {/* Method 1: Roll Call Musyrif */}
 <button
 type="button"
 onClick={() => setWorshipMethod('MANUAL')}
 className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
 worshipMethod === 'MANUAL'
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 dark:border-emerald-800/60 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
 : 'border-emerald-200/80 bg-white hover:border-emerald-300 dark:border-emerald-800/60 dark:bg-slate-800'
 }`}
 >
 <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${worshipMethod === 'MANUAL' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>
 <UserCheck className="h-5 w-5" />
 </div>
 <div>
 <p className="text-xs font-bold text-slate-900 dark:text-white">Roll Call Musyrif</p>
 <p className="text-[10px] text-slate-400">Checklist manual oleh musyrif</p>
 </div>
 </button>

 {/* Method 2: QR Code Kartu */}
 <button
 type="button"
 onClick={() => setWorshipMethod('QRCODE')}
 className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
 worshipMethod === 'QRCODE'
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 dark:border-emerald-800/60 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
 : 'border-emerald-200/80 bg-white hover:border-emerald-300 dark:border-emerald-800/60 dark:bg-slate-800'
 }`}
 >
 <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${worshipMethod === 'QRCODE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>
 <QrCode className="h-5 w-5" />
 </div>
 <div>
 <p className="text-xs font-bold text-slate-900 dark:text-white">QR Code Kartu</p>
 <p className="text-[10px] text-slate-400">Scan Qr code kartu santri</p>
 </div>
 </button>

 {/* Method 3: RFID Tap */}
 <button
 type="button"
 onClick={() => setWorshipMethod('RFID')}
 className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
 worshipMethod === 'RFID'
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 dark:border-emerald-800/60 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
 : 'border-emerald-200/80 bg-white hover:border-emerald-300 dark:border-emerald-800/60 dark:bg-slate-800'
 }`}
 >
 <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${worshipMethod === 'RFID' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>
 <Radio className="h-5 w-5" />
 </div>
 <div>
 <p className="text-xs font-bold text-slate-900 dark:text-white">RFID Tap</p>
 <p className="text-[10px] text-slate-400">Tap kartu RFID santri</p>
 </div>
 </button>
 </div>

 {/* ── INTERACTIVE METHOD PANELS ───────────────────────── */}
 {worshipMethod === 'QRCODE' && (
 <div className="mt-3 space-y-2.5 rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 p-3.5 dark:border-emerald-800/60 dark:bg-emerald-950/30 animate-in fade-in duration-200">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <QrCode className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Pemindai QR Code Kartu Santri</span>
 </div>
 <button
 type="button"
 onClick={openCameraModal}
 className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition active:scale-95 border border-emerald-200/80 dark:border-emerald-800/60 h-9 text-sm font-medium"
 >
 <Camera className="h-3.5 w-3.5" /> Live Kamera
 </button>
 </div>
 <form
 onSubmit={(e) => { e.preventDefault(); handleProcessWorshipScan(scanInput) }}
 className="flex gap-2"
 >
 <input
 type="text"
 autoFocus
 value={scanInput}
 onChange={(e) => setScanInput(e.target.value)}
 placeholder="Scan QR code via scanner USB atau ketik NISN..."
 className="h-9 flex-1 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-emerald-200/80 focus:outline-none dark:border-emerald-800/60 dark:bg-slate-800 dark:text-white"
 />
 <button
 type="submit"
 disabled={processingScan}
 className="rounded-lg bg-emerald-600 px-4 text-xs font-bold text-white shadow-sm disabled:opacity-50 transition active:scale-95 border border-emerald-200/80 dark:border-emerald-800/60 h-9 text-sm font-medium"
 >
 {processingScan ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : 'Absen'}
 </button>
 </form>
 </div>
 )}

 {worshipMethod === 'RFID' && (
 <div className="mt-3 space-y-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50/50 p-3.5 dark:border-emerald-800/60 dark:bg-sky-950/30 animate-in fade-in duration-200">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Wifi className="h-4 w-4 text-sky-600 dark:text-sky-400 animate-pulse" />
 <span className="text-xs font-bold text-sky-900 dark:text-sky-200">Pembaca RFID Reader Standby</span>
 </div>
 <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-900 dark:text-sky-300">
 🔴 Ready to Tap
 </span>
 </div>
 <form
 onSubmit={(e) => { e.preventDefault(); handleProcessWorshipScan(scanInput) }}
 className="flex gap-2"
 >
 <input
 type="text"
 autoFocus
 value={scanInput}
 onChange={(e) => setScanInput(e.target.value)}
 placeholder="Tap kartu RFID santri pada reader..."
 className="h-9 flex-1 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-sky-500 focus:outline-none dark:border-emerald-800/60 dark:bg-slate-800 dark:text-white"
 />
 <button
 type="submit"
 disabled={processingScan}
 className="rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition active:scale-95"
 >
 {processingScan ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : 'Tap RFID'}
 </button>
 </form>
 </div>
 )}
 </div>

 {/* ── FILTER ROW ─────────────────────────────────────── */}
 <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-2.5 w-full pt-2">
 <div className="relative flex-1 min-w-[140px]">
 <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="search"
 placeholder="Cari santri..."
 value={searchSantri}
 onChange={(e) => setSearchSantri(e.target.value)}
 className="h-9 w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-white pl-8 pr-3 text-xs font-medium focus:border-emerald-200/80 focus:outline-none dark:border-emerald-800/60 dark:bg-slate-800 dark:text-white"
 />
 </div>

 <CustomSelect
 value={filterStatus}
 onChange={(e) => setFilterStatus(e.target.value)}
 className="h-9 w-full sm:w-auto min-w-[130px] rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-2.5 text-xs font-medium text-slate-700 focus:border-emerald-200/80 focus:outline-none dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200"
 >
 <option value="">Semua Status</option>
 <option value="hadir_berjamaah">Berjamaah</option>
 <option value="hadir_sendiri">Munfarid</option>
 <option value="terlambat">Terlambat</option>
 <option value="tidak_hadir">Tidak Hadir</option>
 <option value="haid">Haid / Uzur</option>
 </CustomSelect>

 <CustomSelect
 value={filterKamar}
 onChange={(e) => setFilterKamar(e.target.value)}
 className="h-9 w-full sm:w-auto min-w-[130px] rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-2.5 text-xs font-medium text-slate-700 focus:border-emerald-200/80 focus:outline-none dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200"
 >
 <option value="">Semua Kamar</option>
 <option value="Kamar 01">Kamar 01</option>
 <option value="Kamar 02">Kamar 02</option>
 <option value="Kamar 03">Kamar 03</option>
 </CustomSelect>

 <CustomSelect
 value={filterKelompok}
 onChange={(e) => setFilterKelompok(e.target.value)}
 className="h-9 w-full sm:w-auto min-w-[130px] rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-2.5 text-xs font-medium text-slate-700 focus:border-emerald-200/80 focus:outline-none dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200"
 >
 <option value="">Semua Kelompok</option>
 <option value="Kelompok A">Kelompok A</option>
 <option value="Kelompok B">Kelompok B</option>
 <option value="Kelompok C">Kelompok C</option>
 </CustomSelect>

 {(filterStatus || filterKamar || filterKelompok || searchSantri) && (
 <SquircleActionButton
 variant="restore"
 icon={RotateCcw}
 label="Reset Filter"
 onClick={() => {
 setFilterStatus('')
 setFilterKamar('')
 setFilterKelompok('')
 setSearchSantri('')
 setCurrentPage(1)
 }}
 />
 )}
 </div>

 {/* ── ENTERPRISE DATA TABLE ───────────────────────────── */}
 <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr className="border-b border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/80 font-bold text-slate-500 uppercase tracking-wider dark:border-emerald-800/60 dark:bg-slate-800/50 dark:text-slate-400">
 <th className="w-8 px-3 py-3 text-center">
 <input type="checkbox" className="rounded border-emerald-300" />
 </th>
 <th className="px-3 py-3">Santri</th>
 <th className="hidden sm:table-cell px-3 py-3">Kamar / Kelompok</th>
 <th className="px-3 py-3">Status Presensi</th>
 <th className="hidden md:table-cell px-3 py-3">Waktu</th>
 <th className="px-3 py-3 text-center"></th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-slate-800">
 {paginatedDetails.map((d) => (
 <tr key={d.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition">
 <td className="px-3 py-3 text-center">
 <input type="checkbox" className="rounded border-emerald-300" />
 </td>
 <td className="px-3 py-3">
 <button
 type="button"
 onClick={() => { setSelectedStudent(d); setShowStudentDrawer(true) }}
 className="flex items-center gap-2.5 text-left"
 >
 <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-slate-200">
 {(d.student?.nama_lengkap || 'S')[0]}
 </div>
 <div>
 <p className="font-bold text-slate-900 dark:text-white">{d.student?.nama_lengkap}</p>
 <p className="text-[10px] text-slate-400">{d.student?.nisn}</p>
 </div>
 </button>
 {/* Compact Mobile Metadata Row */}
 <div className="sm:hidden mt-1.5 flex flex-wrap items-center gap-1.5 pt-1 border-t border-emerald-200/80 dark:border-emerald-800/60 text-[10px]">
 <span className="font-semibold text-slate-600 dark:text-slate-300">{d.room || 'Kamar 01'}</span>
 <span className="text-slate-400">•</span>
 <span className="text-slate-500">{d.group || 'Kelompok A'}</span>
 {d.check_in_time && (
 <>
 <span className="text-slate-400">•</span>
 <span className="text-slate-500">{d.check_in_time}</span>
 </>
 )}
 </div>
 </td>
 <td className="hidden sm:table-cell px-3 py-3">
 <p className="font-semibold text-slate-700 dark:text-slate-300">{d.room || 'Kamar 01'}</p>
 <p className="text-[10px] text-slate-400">{d.group || 'Kelompok A'}</p>
 </td>
 <td className="px-3 py-3">
 {getAttendancePill(d.attendance_status)}
 </td>
 <td className="hidden md:table-cell px-3 py-3 font-semibold text-slate-600 dark:text-slate-300">
 {d.check_in_time || '04:50 WIB'}
 </td>
 <td className="px-3 py-3">
 <div className="flex items-center justify-center gap-1">
 <button
 onClick={() => handleQuickStatusChange(d.student_id || d.id, 'hadir_berjamaah')}
 title="Verifikasi Berjamaah"
 className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950 dark:text-emerald-400"
 >
 <Check className="h-3.5 w-3.5" />
 </button>
 <button
 onClick={() => { setVerifyStudentId(d.student_id || d.id); setShowVerifyModal(true) }}
 title="Edit Status"
 className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950 dark:text-amber-400"
 >
 <Edit className="h-3.5 w-3.5" />
 </button>
 <button
 onClick={() => { setSelectedStudent(d); setShowStudentDrawer(true) }}
 title="Detail Santri"
 className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300"
 >
 <Search className="h-3.5 w-3.5" />
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 {/* ── PAGINATION FOOTER ───────────────────────────────── */}
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 pt-1">
 <p>
 Menampilkan {filteredDetails.length > 0 ? (currentPage - 1) * perPage + 1 : 0} - {Math.min(currentPage * perPage, filteredDetails.length)} dari {filteredDetails.length} santri
 </p>
 <div className="flex items-center gap-1">
 <button
 type="button"
 onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
 disabled={currentPage <= 1}
 className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-slate-50 dark:border-emerald-800/60 transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
 >
 <ChevronLeft className="h-4 w-4" />
 </button>
 {Array.from({ length: totalPages }, (_, i) => i + 1)
 .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
 .map((p, idx, arr) => (
 <React.Fragment key={p}>
 {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-slate-400">...</span>}
 <button
 type="button"
 onClick={() => setCurrentPage(p)}
 className={`flex h-8 w-8 items-center justify-center rounded-xl font-bold transition-colors cursor-pointer ${
 currentPage === p
 ? 'bg-emerald-600 text-white shadow-sm'
 : 'border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-slate-50 dark:border-emerald-800/60 text-slate-700 dark:text-slate-200'
 }`}
 >
 {p}
 </button>
 </React.Fragment>
 ))}
 <button
 type="button"
 onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
 disabled={currentPage >= totalPages}
 className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-slate-50 dark:border-emerald-800/60 transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
 >
 <ChevronRight className="h-4 w-4" />
 </button>
 </div>
 <CustomSelect
 value={perPage}
 onChange={(e) => {
 const val = parseInt(e.target.value) || 10
 setPerPage(val)
 setCurrentPage(1)
 }}
 className="h-8 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-2.5 text-xs font-semibold text-slate-700 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
 >
 <option value={5}>5 / halaman</option>
 <option value={10}>10 / halaman</option>
 <option value={25}>25 / halaman</option>
 <option value={50}>50 / halaman</option>
 </CustomSelect>
 </div>

 </div>
 ) : (
 <div className="rounded-xl border border-dashed border-emerald-200/80 bg-white p-12 text-center text-slate-400 dark:border-emerald-800/60 dark:bg-[#1B2433]">
 Pilih sesi di kolom kiri untuk melihat detail presensi.
 </div>
 )}
 </div>

 {/* ── RIGHT COLUMN: SUMMARY & ACTIVITY (col-span-3) ──────────────── */}
 <div className="space-y-4 lg:col-span-3">

 {/* CARD 1: RINGKASAN SESI */}
 <div className="rounded-xl border border-emerald-200/80 bg-white p-4 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
 Ringkasan Sesi
 </h4>

 <div className="flex items-center gap-3">
 {/* Donut chart SVG */}
 <div className="relative shrink-0">
 <svg width="84" height="84" viewBox="0 0 100 100" className="-rotate-90">
 <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="14" />
 {/* Berjamaah slice (emerald) */}
 <circle cx="50" cy="50" r="38" fill="none" stroke="#10b981" strokeWidth="14" strokeDasharray="238" strokeDashoffset="56" />
 {/* Munfarid slice (sky) */}
 <circle cx="50" cy="50" r="38" fill="none" stroke="#0284c7" strokeWidth="14" strokeDasharray="238" strokeDashoffset="215" />
 {/* Terlambat slice (amber) */}
 <circle cx="50" cy="50" r="38" fill="none" stroke="#f59e0b" strokeWidth="14" strokeDasharray="238" strokeDashoffset="190" />
 {/* Tidak Hadir slice (rose) */}
 <circle cx="50" cy="50" r="38" fill="none" stroke="#f43f5e" strokeWidth="14" strokeDasharray="238" strokeDashoffset="180" />
 </svg>
 </div>

 {/* Legend list */}
 <div className="space-y-1 text-xs">
 <div className="flex items-center gap-1.5">
 <span className="h-2 w-2 rounded-full bg-emerald-500" />
 <span className="text-slate-600 dark:text-slate-300">Berjamaah</span>
 <span className="font-bold text-slate-800 dark:text-white">{countBerjamaah} ({pctBerjamaah}%)</span>
 </div>
 <div className="flex items-center gap-1.5">
 <span className="h-2 w-2 rounded-full bg-sky-500" />
 <span className="text-slate-600 dark:text-slate-300">Munfarid</span>
 <span className="font-bold text-slate-800 dark:text-white">{countMunfarid} ({pctMunfarid}%)</span>
 </div>
 <div className="flex items-center gap-1.5">
 <span className="h-2 w-2 rounded-full bg-amber-500" />
 <span className="text-slate-600 dark:text-slate-300">Terlambat</span>
 <span className="font-bold text-slate-800 dark:text-white">{countTerlambat} ({pctTerlambat}%)</span>
 </div>
 <div className="flex items-center gap-1.5">
 <span className="h-2 w-2 rounded-full bg-rose-500" />
 <span className="text-slate-600 dark:text-slate-300">Tidak Hadir</span>
 <span className="font-bold text-slate-800 dark:text-white">{countTidakHadir} ({pctTidakHadir}%)</span>
 </div>
 <div className="flex items-center gap-1.5">
 <span className="h-2 w-2 rounded-full bg-purple-500" />
 <span className="text-slate-600 dark:text-slate-300">Haid / Uzur</span>
 <span className="font-bold text-slate-800 dark:text-white">{countHaid} ({pctHaid}%)</span>
 </div>
 </div>
 </div>

 <div className="mt-4 grid grid-cols-2 gap-2 border-t border-emerald-200/80 pt-3 dark:border-emerald-800/60 text-center">
 <div>
 <p className="text-[10px] text-slate-400">Total Santri</p>
 <p className="text-base font-black text-slate-900 dark:text-white">{totalSantriCount}</p>
 </div>
 <div>
 <p className="text-[10px] text-slate-400">Belum Verifikasi</p>
 <p className="text-base font-black text-amber-600">{countBelumVerifikasi}</p>
 </div>
 </div>
 </div>

 {/* CARD 2: AKTIVITAS SESI */}
 <div className="rounded-xl border border-emerald-200/80 bg-white p-4 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
 Aktivitas Sesi
 </h4>

 <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
 <div className="flex items-start gap-3 relative z-10">
 <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
 <Check className="h-3.5 w-3.5" />
 </div>
 <div>
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Sesi {sessionDetail?.template?.nama || 'Ibadah'}</p>
 <p className="text-[10px] text-slate-400">
 {sessionDetail?.scheduled_start_at ? `${sessionDetail.scheduled_start_at} WIB` : 'Sesi aktif'} {sessionDetail?.location_name ? `| ${sessionDetail.location_name}` : ''}
 </p>
 </div>
 </div>

 {activeDetails.filter((d) => d.attendance_status && d.attendance_status !== 'belum_verifikasi').slice(0, 3).map((item, idx) => (
 <div key={item.id || idx} className="flex items-start gap-3 relative z-10">
 <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
 item.attendance_status === 'hadir_berjamaah' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
 item.attendance_status === 'terlambat' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
 }`}>
 <User className="h-3.5 w-3.5" />
 </div>
 <div>
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
 {item.student?.nama_lengkap || item.student_name || 'Santri'}
 </p>
 <p className="text-[10px] text-slate-400">
 {item.verified_at ? `${item.verified_at.slice(11, 16)} WIB | ` : ''}Status: {statusConfig[item.attendance_status]?.label || item.attendance_status}
 </p>
 </div>
 </div>
 ))}

 {activeDetails.filter((d) => d.attendance_status && d.attendance_status !== 'belum_verifikasi').length === 0 && (
 <div className="py-2 text-center text-xs text-slate-400">
 Belum ada verifikasi presensi santri pada sesi ini.
 </div>
 )}

 {(sessionDetail?.status === 'selesai' || sessionDetail?.status === 'ditutup') && (
 <div className="flex items-start gap-3 relative z-10">
 <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-sky-950/60 dark:text-sky-300">
 <Lock className="h-3.5 w-3.5" />
 </div>
 <div>
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Sesi ditutup</p>
 <p className="text-[10px] text-slate-400">Status sesi: {sessionDetail?.status}</p>
 </div>
 </div>
 )}
 </div>

 <button
 onClick={() => toastInfo('Riwayat Sesi', 'Menampilkan riwayat aktivitas lengkap.')}
 className="mt-3 flex w-full items-center justify-center gap-1 text-xs font-bold text-slate-600 transition hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
 >
 Lihat Riwayat Lengkap <ArrowRight className="h-3.5 w-3.5" />
 </button>
 </div>

 </div>

 </div>
 </>
 )}

 {/* ── TEMPLATES TAB CONTENT ─────────────────────────────────────────── */}
 {activeTab === 'templates' && (
 <div className="space-y-4">
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
 {templates.map((t) => (
 <div key={t.id} className="rounded-xl border border-emerald-200/80 bg-white p-5 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="flex items-center justify-between mb-2">
 <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
 {t.category}
 </span>
 <span className="text-xs font-mono text-slate-400">{t.code}</span>
 </div>
 <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{t.nama}</h3>
 <p className="text-xs text-slate-500">Kewajiban: {t.obligation_type} | Gender: {t.gender_scope}</p>
 <p className="text-xs text-slate-500 mt-1">Lokasi: {t.location_name || '-'}</p>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* ── VERIFY MODAL ──────────────────────────────────────────────────── */}
 <AppModal
 isOpen={showVerifyModal}
 onClose={() => setShowVerifyModal(false)}
 title="Verifikasi Status Presensi Santri"
 icon={UserCheck}
 maxWidth="max-w-md"
 footer={
 <div className="flex w-full justify-end gap-2.5">
 <button
 type="button"
 onClick={() => setShowVerifyModal(false)}
 className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
 >
 Batal
 </button>
 <button
 type="submit"
 form="worship-verify-form"
 className="inline-flex h-9.5 items-center justify-center rounded-xl border-2 border-emerald-600 bg-emerald-600 px-5 text-xs font-black text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-95 cursor-pointer"
 >
 Simpan Status
 </button>
 </div>
 }
 >
 <form id="worship-verify-form" onSubmit={handleVerifySubmit} className="space-y-4">
 <div>
 <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Status Kehadiran</label>
 <CustomSelect
 value={verifyStatus}
 onChange={(e) => setVerifyStatus(e.target.value)}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-2.5 text-xs font-semibold text-slate-800 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-white"
 >
 <option value="hadir_berjamaah">Hadir Berjamaah</option>
 <option value="hadir_sendiri">Hadir Sendiri (Munfarid)</option>
 <option value="terlambat">Terlambat</option>
 <option value="tidak_hadir">Tidak Hadir</option>
 <option value="haid">Haid / Uzur Syar'i</option>
 </CustomSelect>
 </div>
 <div>
 <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Catatan Musyrif</label>
 <textarea
 value={verifyNotes}
 onChange={(e) => setVerifyNotes(e.target.value)}
 className="w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-white p-2.5 text-xs text-slate-800 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-white"
 rows="2"
 placeholder="Catatan opsional..."
 />
 </div>
 </form>
 </AppModal>

 {/* ── CAMERA MODAL ──────────────────────────────────────────────────── */}
 <AppModal
 isOpen={showCameraModal}
 onClose={closeCameraModal}
 title="Scanner QR Code Kartu Santri"
 description="Arahkan QR Code pada kartu santri ke area pemindai"
 icon={Camera}
 maxWidth="max-w-lg"
 footer={
 <div className="flex w-full items-center justify-between text-xs">
 <button
 type="button"
 onClick={cameraActive ? stopCamera : startCamera}
 className="inline-flex h-9.5 items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 hover:bg-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
 >
 {cameraActive ? <><CameraOff className="h-3.5 w-3.5 text-rose-500" /> Matikan Kamera</> : <><Camera className="h-3.5 w-3.5 text-emerald-500" /> Nyalakan Kamera</>}
 </button>
 <button
 type="button"
 onClick={closeCameraModal}
 className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 hover:bg-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
 >
 Tutup Kamera
 </button>
 </div>
 }
 >
 <div className="space-y-4">

 {/* Video Camera Viewfinder Screen */}
 <div className="relative overflow-hidden rounded-xl bg-black aspect-video flex items-center justify-center border border-emerald-200/80 dark:border-emerald-800/60 shadow-inner">
 <video
 ref={videoRef}
 autoPlay
 playsInline
 muted
 className="h-full w-full object-cover"
 />

 {/* Viewfinder Target Box Overlay */}
 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
 <div className="h-48 w-48 rounded-xl border-2 border-dashed border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-500/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] flex flex-col items-center justify-between p-3">
 <div className="w-full flex justify-between">
 <span className="h-4 w-4 border-t-2 border-l-2 border-emerald-200/80" />
 <span className="h-4 w-4 border-t-2 border-r-2 border-emerald-200/80" />
 </div>
 <p className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full">
 Arahkan QR Code Di Sini
 </p>
 <div className="w-full flex justify-between">
 <span className="h-4 w-4 border-b-2 border-l-2 border-emerald-200/80" />
 <span className="h-4 w-4 border-b-2 border-r-2 border-emerald-200/80" />
 </div>
 </div>
 </div>

 {cameraLoading && (
 <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-white gap-2">
 <RefreshCw className="h-8 w-8 animate-spin text-emerald-400" />
 <p className="text-xs font-semibold">Mengaktifkan Kamera Pemindai...</p>
 </div>
 )}
 </div>

 {/* Manual QR NISN Input & Action Footer */}
 <div className="space-y-2 pt-2">
 <form onSubmit={(e) => { e.preventDefault(); if (!modalInput.trim()) return; handleProcessWorshipScan(modalInput) }} className="flex gap-2">
 <input
 type="text"
 autoFocus
 value={modalInput}
 onChange={(e) => setModalInput(e.target.value)}
 placeholder="Atau masukkan NISN hasil scan..."
 className="flex-1 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-slate-50 px-3 py-2 text-xs focus:border-emerald-200/80 focus:outline-none dark:border-emerald-800/60 dark:bg-slate-800"
 />
 <button
 type="submit"
 disabled={processingScan}
 className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50 border border-emerald-200/80 dark:border-emerald-800/60 h-9 text-sm font-medium"
 >
 {processingScan ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Proses QR'}
 </button>
 </form>
 </div>
 </div>
 </AppModal>

 {/* ── MODAL UBAH MANUAL JADWAL SESI IBADAH SANTRI ──────────────────── */}
 <AppModal
 isOpen={showEditSessionModal}
 onClose={() => setShowEditSessionModal(false)}
 title="Ubah Manual Jam & Lokasi Sesi Santri"
 icon={Clock}
 maxWidth="max-w-md"
 footer={
 <div className="flex w-full justify-end gap-2.5">
 <button
 type="button"
 onClick={() => setShowEditSessionModal(false)}
 className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
 >
 Batal
 </button>
 <button
 type="submit"
 form="worship-edit-session-form"
 className="inline-flex h-9.5 items-center justify-center rounded-xl border-2 border-emerald-600 bg-emerald-600 px-5 text-xs font-black text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-95 cursor-pointer"
 >
 Simpan Perubahan
 </button>
 </div>
 }
 >
 <form id="worship-edit-session-form" onSubmit={handleSaveEditSession} className="space-y-4">

 <div className="space-y-3 text-xs">
 <div>
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Sesi Sholat</label>
 <p className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">{editSessionForm.nama}</p>
 </div>

 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jam Mulai Sesi</label>
 <input
 type="time"
 required
 value={editSessionForm.start_time}
 onChange={(e) => setEditSessionForm({ ...editSessionForm, start_time: e.target.value })}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 p-2.5 font-bold focus:border-emerald-200/80 focus:outline-none dark:border-emerald-800/60 dark:bg-slate-800"
 />
 </div>
 <div>
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jam Selesai Sesi</label>
 <input
 type="time"
 required
 value={editSessionForm.end_time}
 onChange={(e) => setEditSessionForm({ ...editSessionForm, end_time: e.target.value })}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 p-2.5 font-bold focus:border-emerald-200/80 focus:outline-none dark:border-emerald-800/60 dark:bg-slate-800"
 />
 </div>
 </div>

 <div>
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lokasi Ibadah</label>
 <input
 type="text"
 required
 value={editSessionForm.location_name}
 onChange={(e) => setEditSessionForm({ ...editSessionForm, location_name: e.target.value })}
 className="w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-slate-50 p-2.5 font-semibold focus:border-emerald-200/80 focus:outline-none dark:border-emerald-800/60 dark:bg-slate-800"
 />
 </div>

 <div>
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Status Sesi</label>
 <CustomSelect
 value={editSessionForm.status}
 onChange={(e) => setEditSessionForm({ ...editSessionForm, status: e.target.value })}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 p-2.5 font-semibold focus:border-emerald-200/80 focus:outline-none dark:border-emerald-800/60 dark:bg-slate-800"
 >
 <option value="opened">Dibuka (Opened)</option>
 <option value="upcoming">Akan Datang (Upcoming)</option>
 <option value="closed">Ditutup (Closed)</option>
 </CustomSelect>
 </div>
 </div>

 </form>
 </AppModal>

 {/* ── TEMPLATE MODAL ────────────────────────────────────────────────── */}
 <AppModal
 isOpen={showTemplateModal}
 onClose={() => setShowTemplateModal(false)}
 title="Tambah Template Ibadah Baru"
 icon={Plus}
 maxWidth="max-w-lg"
 footer={
 <div className="flex w-full justify-end gap-2.5">
 <button
 type="button"
 onClick={() => setShowTemplateModal(false)}
 className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
 >
 Batal
 </button>
 <button
 type="submit"
 form="worship-template-form"
 className="inline-flex h-9.5 items-center justify-center rounded-xl border-2 border-emerald-600 bg-emerald-600 px-5 text-xs font-black text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-95 cursor-pointer"
 >
 Simpan Template
 </button>
 </div>
 }
 >
 <form id="worship-template-form" onSubmit={handleCreateTemplate} className="space-y-3 text-xs">
 <div>
 <label className="block font-bold text-slate-500 uppercase mb-1">Nama Kegiatan Ibadah</label>
 <input
 type="text"
 required
 value={templateForm.nama}
 onChange={(e) => setTemplateForm({ ...templateForm, nama: e.target.value })}
 placeholder="Misal: Shalat Subuh Berjamaah"
 className="w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-white p-2.5 font-semibold text-slate-800 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-white"
 />
 </div>

 <div>
 <label className="block font-bold text-slate-500 uppercase mb-1">Kode Unik Template</label>
 <input
 type="text"
 required
 value={templateForm.code}
 onChange={(e) => setTemplateForm({ ...templateForm, code: e.target.value })}
 placeholder="Misal: SUBUH_BERJAMAAH"
 className="w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-white p-2.5 font-semibold text-slate-800 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-white"
 />
 </div>

 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="block font-bold text-slate-500 uppercase mb-1">Jam Mulai</label>
 <input
 type="time"
 required
 value={templateForm.start_time}
 onChange={(e) => setTemplateForm({ ...templateForm, start_time: e.target.value })}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-2.5 font-semibold text-slate-800 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-white"
 />
 </div>
 <div>
 <label className="block font-bold text-slate-500 uppercase mb-1">Jam Selesai</label>
 <input
 type="time"
 required
 value={templateForm.end_time}
 onChange={(e) => setTemplateForm({ ...templateForm, end_time: e.target.value })}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-2.5 font-semibold text-slate-800 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-white"
 />
 </div>
 </div>

 <div>
 <label className="block font-bold text-slate-500 uppercase mb-1">Lokasi Ibadah</label>
 <input
 type="text"
 value={templateForm.location_name}
 onChange={(e) => setTemplateForm({ ...templateForm, location_name: e.target.value })}
 placeholder="Misal: Masjid Utama Pesantren"
 className="w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-white p-2.5 font-semibold text-slate-800 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-white"
 />
 </div>

 </form>
 </AppModal>

 {/* ── STUDENT DETAIL MODAL ─────────────────────────────────────────── */}
 <AppModal
 isOpen={Boolean(showStudentDrawer && selectedStudent)}
 onClose={() => setShowStudentDrawer(false)}
 title={selectedStudent?.student?.nama_lengkap || 'Detail Santri'}
 description={selectedStudent?.student?.nisn ? `NISN: ${selectedStudent.student.nisn}` : ''}
 icon={Users}
 maxWidth="max-w-sm"
 footer={
 <div className="flex w-full justify-end">
 <button
 type="button"
 onClick={() => setShowStudentDrawer(false)}
 className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
 >
 Tutup
 </button>
 </div>
 }
 >
 {selectedStudent && (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 p-3 text-xs dark:bg-slate-800/40 space-y-1">
 <p><span className="text-slate-400">Kamar:</span> <strong className="text-slate-800 dark:text-slate-200">{selectedStudent.room || 'Kamar 01'}</strong></p>
 <p><span className="text-slate-400">Kelompok:</span> <strong className="text-slate-800 dark:text-slate-200">{selectedStudent.group || 'Kelompok A'}</strong></p>
 <p><span className="text-slate-400">Status Presensi:</span> {getAttendancePill(selectedStudent.attendance_status)}</p>
 <p><span className="text-slate-400">Waktu Absen:</span> <strong className="text-slate-800 dark:text-slate-200">{selectedStudent.check_in_time || '04:50 WIB'}</strong></p>
 </div>
 )}
 </AppModal>

 </motion.div>
 </MasterDataPage>
 )
}
