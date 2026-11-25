import { HeroUiHeader } from "../components/ui/HeroUiHeader"
import AppModal from '../components/app/AppModal'
import {
  KpiStatCard
} from '../components/app'
import {
  useToast
} from '../components/app/ToastProvider'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  useNavigate,
  Navigate
} from 'react-router-dom'
import {
  getUserRoleLevel,
  ROLE_LEVELS,
  isRestrictedToTeacherWorkspace,
  canSwitchEducationUnit
} from '../auth/portalResolver'
import {
  useDebounce
} from '../hooks/useDebounce'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  QrCode,
  Radio,
  UserCheck,
  UserX,
  Clock,
  AlertTriangle,
  LogOut,
  LogIn,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Building2,
  Users,
  Camera,
  CameraOff,
  Check,
  X,
  Wifi,
  ChevronDown,
  Settings,
  Sparkles,
  Lock,
  Layers,
  Eye,
  Hash
} from 'lucide-react'
import {
  gateAttendanceService
} from '../services/gateAttendanceService'
import {
  educationUnitService
} from '../services/educationUnitService'
import {
  studentService
} from '../services/studentService'
import {
  useAuthStore
} from '../stores/authStore'
import {
  cn
} from '../lib/utils'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import PageContainer from '../components/app/PageContainer'
import AppBadge from '../components/app/AppBadge'
import AppSkeleton from '../components/app/AppSkeleton'
import AppEmptyState from '../components/app/AppEmptyState'
import {
  SquircleActionButton,
  MasterActionButton,
  MasterActionIconButton
} from '../components/master-data'
import HeroUiFilterSelect from '../components/ui/HeroUiFilterSelect'
import {
  Input as HeroInput
} from '../components/ui/input'
import AppTabs from '../components/app/AppTabs'
import {
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '../components/ui/table'


// ── SUB-KOMPONEN MODERN KPI CARDS (§C HeroUI_Pengaturan_Halaman) ──
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

function GateKpiCard({
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


export default function GateAttendancePage() {
 const navigate = useNavigate()
 const storeUser = useAuthStore((state) => state.user)
 const localUser = (() => {
 try {
 return JSON.parse(localStorage.getItem('school_erp_user') || '{}')
 } catch {
 return {}
 }
 })()
 const currentUser = storeUser || localUser

 const authLevel = useMemo(() => getUserRoleLevel(currentUser), [currentUser])
 const userRoles = useMemo(() => {
 const raw = currentUser?.roles || currentUser?.role || []
 const list = Array.isArray(raw) ? raw : [raw]
 return list.map((r) => (typeof r === 'string' ? r : r?.name || r?.role_name || r?.nama || ''))
 }, [currentUser])
 const isGuru = useMemo(
 () => isRestrictedToTeacherWorkspace(currentUser, '/dashboard/absensi-gerbang'),
 [currentUser]
 )

 const userUnitId =
 currentUser?.education_unit_id ||
 currentUser?.unit_id ||
 currentUser?.employee?.unit_id ||
 currentUser?.unit_pendidikan_id ||
 currentUser?.metadata?.unit_id ||
 currentUser?.metadata?.education_unit_id ||
 ''

 const isMultiUnitUser = useMemo(() => canSwitchEducationUnit(currentUser), [currentUser])

 const [activeTab, setActiveTab] = useState('scan') // 'scan' | 'logs'
 const [scanMode, setScanMode] = useState('checkin') // 'checkin' | 'checkout'
 const [method, setMethod] = useState('QRCODE') // 'QRCODE' | 'RFID' | 'MANUAL'

 const [cardInput, setCardInput] = useState('')
 const [modalCardInput, setModalCardInput] = useState('')
 const [selectedUnit, setSelectedUnit] = useState(isMultiUnitUser ? '' : String(userUnitId || ''))
 const [units, setUnits] = useState([])

 // Student search list for Manual TU Input mode
 const [studentSearch, setStudentSearch] = useState('')
 const debouncedStudentSearch = useDebounce(studentSearch, 350)
 const [studentsList, setStudentsList] = useState([])
 const [loadingStudents, setLoadingStudents] = useState(false)

 // Global toast integration
 const toast = useToast()
 const pushToast = (type, title, message = '') => {
 const tone = type === 'error' || type === 'danger' ? 'error' : type === 'warning' ? 'warning' : 'success'
 toast(message ? `${title}: ${message}` : title, tone)
 }

 // Schedule Config State
 const [targetUnitForConfig, setTargetUnitForConfig] = useState(isMultiUnitUser ? '' : String(userUnitId || ''))
 const [scheduleConfig, setScheduleConfig] = useState({
 jam_masuk: '07:15',
 toleransi_menit: 10,
 jam_pulang: '14:15',
 jam_cutoff_alpha: '12:00',
 })
 const [allUnitsSchedules, setAllUnitsSchedules] = useState([])
 const [showScheduleModal, setShowScheduleModal] = useState(false)
 const [savingSchedule, setSavingSchedule] = useState(false)

 const unitFilterOptions = useMemo(() => {
 if (!isMultiUnitUser) {
 return units.map((u) => ({ value: String(u.id), label: u.nama || u.name }))
 }
 return [
 { value: '', label: 'Semua Unit Pendidikan' },
 ...units.map((u) => ({ value: String(u.id), label: u.nama || u.name }))
 ]
 }, [isMultiUnitUser, units])

 const targetUnitConfigOptions = useMemo(() => {
 const mapped = units.map((u) => ({ value: String(u.id), label: u.nama || u.name }))
 if (!isMultiUnitUser) {
 return mapped
 }
 return [
 { value: '', label: '-- Default Global (Seluruh Unit) --' },
 ...mapped,
 ]
 }, [isMultiUnitUser, units])

 const [stats, setStats] = useState({
 total_siswa: 0,
 total_scanned: 0,
 hadir: 0,
 terlambat: 0,
 izin: 0,
 sakit: 0,
 belum_hadir: 0,
 alpha: 0,
 sudah_pulang: 0,
 })

 const [logs, setLogs] = useState([])
 const [loadingLogs, setLoadingLogs] = useState(false)
 const [processingScan, setProcessingScan] = useState(false)
 const [lastScanResult, setLastScanResult] = useState(null)

 // Camera Pop-up Modal State
 const [showCameraModal, setShowCameraModal] = useState(false)
 const [cameraActive, setCameraActive] = useState(false)
 const [cameraLoading, setCameraLoading] = useState(false)
 const [cameraError, setCameraError] = useState('')
 const videoRef = useRef(null)
 const streamRef = useRef(null)
 const scanTimerRef = useRef(null)
 const isScanningBusyRef = useRef(false)
 const lastScannedCodeRef = useRef('')

 // Synthetic beep sound via Web Audio API
 const playBeep = () => {
 try {
 const AudioCtx = window.AudioContext || window.webkitAudioContext
 if (!AudioCtx) return
 const ctx = new AudioCtx()
 const osc = ctx.createOscillator()
 const gain = ctx.createGain()
 osc.type = 'sine'
 osc.frequency.setValueAtTime(880, ctx.currentTime)
 gain.gain.setValueAtTime(0.18, ctx.currentTime)
 gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
 osc.connect(gain)
 gain.connect(ctx.destination)
 osc.start()
 osc.stop(ctx.currentTime + 0.15)
 } catch {
 // Audio context restricted until user gesture, safely ignore
 }
 }

 // KPI Detail Modal State
 const [kpiModal, setKpiModal] = useState({
 isOpen: false,
 type: '',
 title: '',
 data: [],
 loading: false,
 search: '',
 })

 const openKpiModal = async (type) => {
 const titleMap = {
 total_siswa: 'Detail Data Total Siswa Terdaftar',
 hadir: 'Detail Data Siswa Hadir Tepat Waktu',
 terlambat: 'Detail Data Siswa Terlambat',
 izin_sakit: 'Detail Data Siswa Izin / Sakit',
 belum_hadir: 'Detail Data Siswa Belum Hadir',
 alpha: 'Detail Data Siswa Alpha / Tanpa Keterangan',
 sudah_pulang: 'Detail Data Siswa Sudah Pulang',
 }

 setKpiModal({
 isOpen: true,
 type,
 title: titleMap[type] || 'Detail Data Siswa',
 data: [],
 loading: true,
 search: '',
 })

 try {
 const [logsRes, studentsRes] = await Promise.all([
 gateAttendanceService.getLogs({ unit_id: selectedUnit, per_page: 500 }),
 studentService.getDaftar({ unit_id: selectedUnit, per_page: 500 }),
 ])

 const rawLogs = logsRes?.data?.data?.data || logsRes?.data?.data || []
 const rawStudents = studentsRes?.data?.data?.data || studentsRes?.data?.data || studentsRes?.data || []

 const logsByStudentId = {}
 if (Array.isArray(rawLogs)) {
 rawLogs.forEach((log) => {
 const sId = log.student_id || log.student?.id
 if (sId) {
 logsByStudentId[sId] = log
 }
 })
 }

 const combinedList = Array.isArray(rawStudents) && rawStudents.length > 0
 ? rawStudents.map((st) => {
 const log = logsByStudentId[st.id] || {}
 return {
 student_id: st.id,
 nama_lengkap: st.nama_lengkap || st.full_name || st.name || 'Siswa',
 nis: st.nis || st.nisn || '-',
 nisn: st.nisn || '-',
 kelas_name: st.kelas?.nama_kelas || st.kelas?.name || st.school_class?.name || '-',
 unit_name: st.education_unit?.name || st.unit_name || '-',
 check_in_time: log.check_in_time || null,
 check_out_time: log.check_out_time || null,
 status: log.status || 'BELUM_HADIR',
 }
 })
 : rawLogs.map((log) => ({
 student_id: log.student_id || log.student?.id,
 nama_lengkap: log.student?.nama_lengkap || log.student?.full_name || 'Siswa',
 nis: log.student?.nis || log.student?.nisn || '-',
 nisn: log.student?.nisn || '-',
 kelas_name: log.school_class?.name || log.school_class?.nama_kelas || '-',
 unit_name: log.education_unit?.name || '-',
 check_in_time: log.check_in_time || null,
 check_out_time: log.check_out_time || null,
 status: log.status || 'BELUM_HADIR',
 }))

 let filtered = combinedList
 if (type === 'hadir') {
 filtered = combinedList.filter((item) => item.status === 'HADIR' || item.status === 'HADIR_DALAM_TOLERANSI')
 } else if (type === 'terlambat') {
 filtered = combinedList.filter((item) => item.status === 'TERLAMBAT')
 } else if (type === 'izin_sakit') {
 filtered = combinedList.filter((item) => item.status === 'IZIN' || item.status === 'SAKIT')
 } else if (type === 'alpha') {
 filtered = combinedList.filter((item) => item.status === 'ALPHA')
 } else if (type === 'belum_hadir') {
 filtered = combinedList.filter((item) => item.status === 'BELUM_HADIR' || !item.check_in_time)
 } else if (type === 'sudah_pulang') {
 filtered = combinedList.filter((item) => Boolean(item.check_out_time))
 }

 setKpiModal((prev) => ({
 ...prev,
 data: filtered,
 loading: false,
 }))
 } catch (err) {
 console.error('Failed fetching KPI detail data:', err)
 setKpiModal((prev) => ({ ...prev, loading: false }))
 }
 }

 const closeKpiModal = () => {
 setKpiModal({
 isOpen: false,
 type: '',
 title: '',
 data: [],
 loading: false,
 search: '',
 })
 }

 const filteredKpiData = useMemo(() => {
 if (!kpiModal.search.trim()) return kpiModal.data
 const s = kpiModal.search.toLowerCase()
 return kpiModal.data.filter((item) =>
 String(item.nama_lengkap || '').toLowerCase().includes(s) ||
 String(item.nis || '').toLowerCase().includes(s) ||
 String(item.nisn || '').toLowerCase().includes(s) ||
 String(item.kelas_name || '').toLowerCase().includes(s)
 )
 }, [kpiModal.data, kpiModal.search])

 // Status Badge (§T.2 — AppBadge semantik)
 const renderStatusBadge = (status, checkOutTime) => {
 const st = String(status || '').toUpperCase()
 if (st === 'HADIR' || st === 'HADIR_DALAM_TOLERANSI') {
 return <AppBadge variant="success" dot><span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Hadir</span></AppBadge>
 }
 if (st === 'TERLAMBAT') {
 return <AppBadge variant="warning" dot><span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> Terlambat</span></AppBadge>
 }
 if (st === 'IZIN' || st === 'SAKIT') {
 return <AppBadge variant="info" dot><span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-white" /> {st === 'IZIN' ? 'Izin' : 'Sakit'}</span></AppBadge>
 }
 if (st === 'ALPHA') {
 return <AppBadge variant="danger" dot><span className="inline-flex items-center gap-1"><XCircle className="h-3 w-3" /> Alpha</span></AppBadge>
 }
 if (checkOutTime) {
 return <AppBadge variant="purple" dot><span className="inline-flex items-center gap-1"><LogOut className="h-3 w-3" /> Sudah Pulang</span></AppBadge>
 }
 return <AppBadge variant="warning" dot><span className="inline-flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Belum Hadir</span></AppBadge>
 }

 useEffect(() => {
 fetchUnits()
 fetchStats()
 fetchLogs()
 fetchScheduleConfig()

 return () => {
 stopCamera()
 }
 }, [selectedUnit])

 useEffect(() => {
 const resolvedUnit = userUnitId || (!isMultiUnitUser && units.length === 1 ? String(units[0].id) : '')
 if (!isMultiUnitUser && resolvedUnit && String(selectedUnit) !== String(resolvedUnit)) {
 setSelectedUnit(String(resolvedUnit))
 }
 if (!isMultiUnitUser && resolvedUnit && !targetUnitForConfig) {
 setTargetUnitForConfig(String(resolvedUnit))
 }
 }, [userUnitId, isMultiUnitUser, units, selectedUnit, targetUnitForConfig])

 useEffect(() => {
 if (method === 'MANUAL') {
 fetchStudents()
 }
 }, [method, debouncedStudentSearch, selectedUnit])

 useEffect(() => {
 if (showScheduleModal) {
 fetchAllUnitsSchedules()
 }
 }, [showScheduleModal, targetUnitForConfig])

 const fetchScheduleConfig = async () => {
 try {
 const res = await gateAttendanceService.getScheduleConfig({ unit_id: selectedUnit })
 if (res?.data?.data) {
 setScheduleConfig(res.data.data)
 }
 } catch (e) {
 console.error('Failed fetching schedule config:', e)
 }
 }

 const fetchAllUnitsSchedules = async () => {
 try {
 const res = await gateAttendanceService.getAllScheduleConfigs()
 if (res?.data?.data) {
 setAllUnitsSchedules(res.data.data.units || [])
 // Load target config
 const targetId = targetUnitForConfig || selectedUnit
 if (targetId) {
 const found = res.data.data.units?.find((u) => u.unit_id === targetId)
 if (found) {
 setScheduleConfig(found.schedule)
 }
 } else if (res.data.data.global) {
 setScheduleConfig(res.data.data.global)
 }
 }
 } catch (e) {
 console.error('Failed fetching all schedule configs:', e)
 }
 }

 const handleSaveScheduleConfig = async (e) => {
 e?.preventDefault()
 setSavingSchedule(true)
 const unitToSave = targetUnitForConfig || selectedUnit || null
 try {
 const res = await gateAttendanceService.saveScheduleConfig({
 unit_id: unitToSave,
 ...scheduleConfig,
 })
 pushToast('success', 'Pengaturan Disimpan!', res.data?.message || 'Pengaturan jam masuk dan jam pulang berhasil diperbarui.')
 setShowScheduleModal(false)
 fetchScheduleConfig()
 fetchAllUnitsSchedules()
 } catch (err) {
 pushToast('error', 'Gagal Menyimpan', err?.response?.data?.message || 'Gagal menyimpan pengaturan jadwal jam masuk/pulang.')
 } finally {
 setSavingSchedule(false)
 }
 }

 const fetchStudents = async () => {
 setLoadingStudents(true)
 try {
 const res = await studentService.getDaftar({
 search: debouncedStudentSearch,
 unit_id: selectedUnit,
 per_page: 15,
 })
 const list = res?.data?.data || res?.data || []
 setStudentsList(list)
 } catch (e) {
 console.error('Failed fetching students:', e)
 } finally {
 setLoadingStudents(false)
 }
 }

 // Start webcam with fallback for laptop / mobile front/back camera
 const startCamera = async () => {
 setCameraLoading(true)
 setCameraError('')
 stopCamera()

 if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
 setCameraError('Browser Anda tidak mendukung WebRTC Camera atau context tidak aman. Pastikan menggunakan http://localhost atau HTTPS.')
 setCameraLoading(false)
 setCameraActive(false)
 return
 }

 try {
 let mediaStream = null

 // Strategy 1: Default laptop user-facing camera (Mac FaceTime HD Camera)
 try {
 mediaStream = await navigator.mediaDevices.getUserMedia({
 video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
 })
 } catch (err1) {
 // Strategy 2: Environment camera (Back camera for phone/tablet)
 try {
 mediaStream = await navigator.mediaDevices.getUserMedia({
 video: { facingMode: { ideal: 'environment' } },
 })
 } catch (err2) {
 // Strategy 3: Standard unconstrained video
 mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
 }
 }

 streamRef.current = mediaStream

 if (videoRef.current) {
 videoRef.current.srcObject = mediaStream
 videoRef.current.setAttribute('playsinline', 'true')
 videoRef.current.muted = true
 try {
 await videoRef.current.play()
 } catch (playErr) {
 console.warn('Initial play error, attaching onloadedmetadata:', playErr)
 videoRef.current.onloadedmetadata = () => {
 videoRef.current?.play().catch(() => {})
 }
 }
 }
 setCameraActive(true)

 // Start automatic QR Code scanning loop using native BarcodeDetector if available
 if ('BarcodeDetector' in window) {
 try {
 const detector = new window.BarcodeDetector({ formats: ['qr_code'] })
 scanTimerRef.current = window.setInterval(async () => {
 if (!videoRef.current || videoRef.current.readyState < 2 || isScanningBusyRef.current) return
 try {
 const barcodes = await detector.detect(videoRef.current)
 if (barcodes && barcodes.length > 0) {
 const rawValue = barcodes[0].rawValue?.trim()
 if (rawValue && rawValue !== lastScannedCodeRef.current) {
 isScanningBusyRef.current = true
 lastScannedCodeRef.current = rawValue
 playBeep()
 setModalCardInput(rawValue)
 await executeScan(rawValue)
 setTimeout(() => {
 isScanningBusyRef.current = false
 lastScannedCodeRef.current = ''
 }, 2500)
 }
 }
 } catch {
 // Frame without barcode, safely ignore
 }
 }, 250)
 } catch (detectorErr) {
 console.warn('BarcodeDetector error:', detectorErr)
 }
 }
 } catch (err) {
 console.error('Camera Access Error:', err)
 let msg = 'Kamera tidak dapat diakses.'
 if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
 msg = 'Izin kamera diblokir oleh browser atau sistem operasi macOS. Silakan klik ikon gembok / slider di samping URL (localhost:5173), ubah "Camera" menjadi "Allow/Izinkan", dan pastikan izin kamera di macOS System Settings > Privacy & Security > Camera aktif untuk Google Chrome.'
 } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
 msg = 'Perangkat webcam tidak terdeteksi pada laptop/komputer ini. Pastikan kamera terpasang dengan baik atau gunakan scanner kartu manual/barcode reader USB.'
 } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
 msg = 'Kamera sedang digunakan oleh aplikasi lain (seperti Zoom, FaceTime, atau tab lain). Tutup aplikasi tersebut lalu klik Coba Hubungkan Lagi.'
 } else if (err.name === 'OverconstrainedError') {
 msg = 'Pengaturan resolusi kamera tidak didukung oleh perangkat ini.'
 } else {
 msg = `Kamera tidak dapat diakses: ${err.message || err.name || 'Periksa izin browser Anda'}`
 }
 setCameraError(msg)
 setCameraActive(false)
 } finally {
 setCameraLoading(false)
 }
 }

 const stopCamera = () => {
 if (scanTimerRef.current) {
 clearInterval(scanTimerRef.current)
 scanTimerRef.current = null
 }
 isScanningBusyRef.current = false
 lastScannedCodeRef.current = ''
 if (streamRef.current) {
 streamRef.current.getTracks().forEach((track) => track.stop())
 streamRef.current = null
 }
 if (videoRef.current) {
 videoRef.current.srcObject = null
 }
 setCameraActive(false)
 }

 const openCameraModal = () => {
 setShowCameraModal(true)
 setTimeout(() => {
 startCamera()
 }, 200)
 }

 const closeCameraModal = () => {
 stopCamera()
 setShowCameraModal(false)
 }

 const fetchUnits = async () => {
 try {
 const res = await educationUnitService.getDaftar({ per_page: 100 })
 const data = res?.data?.data?.data || res?.data?.data || res?.data || []
 setUnits(Array.isArray(data) ? data : [])
 } catch (e) {
 console.error('Failed fetching units:', e)
 }
 }

 const fetchStats = async () => {
 try {
 const res = await gateAttendanceService.getStats({ unit_id: selectedUnit })
 if (res?.data?.data) {
 setStats(res.data.data)
 }
 } catch (e) {
 console.error('Failed fetching stats:', e)
 }
 }

 const fetchLogs = async () => {
 setLoadingLogs(true)
 try {
 const res = await gateAttendanceService.getLogs({ unit_id: selectedUnit, per_page: 25 })
 const list = res?.data?.data?.data || res?.data?.data || []
 setLogs(list)
 } catch (e) {
 console.error('Failed fetching logs:', e)
 } finally {
 setLoadingLogs(false)
 }
 }

 const executeScan = async (codeToScan, studentId = null) => {
 setProcessingScan(true)
 try {
 const payload = {
 ...(studentId
 ? { student_id: studentId }
 : method === 'QRCODE'
 ? { qr_token: codeToScan.trim() }
 : { card_number: codeToScan.trim() }),
 unit_id: selectedUnit || undefined,
 attendance_method: method,
 }

 if (scanMode === 'checkin') {
 const res = await gateAttendanceService.scanCheckIn(payload)
 const studentName = res?.data?.data?.student?.nama_lengkap || res?.data?.data?.student?.full_name || 'Siswa'
 setLastScanResult({
 success: true,
 message: res.data.message,
 data: res.data.data,
 })
 pushToast('success', 'Presensi Masuk Berhasil!', `${studentName} telah tercatat melakukan absensi masuk gerbang.`)
 } else {
 const res = await gateAttendanceService.scanCheckOut(payload)
 const studentName = res?.data?.data?.student?.nama_lengkap || res?.data?.data?.student?.full_name || 'Siswa'
 setLastScanResult({
 success: true,
 message: res.data.message,
 data: res.data.data,
 })
 pushToast('success', 'Presensi Pulang Berhasil!', `${studentName} telah tercatat keluar dari sekolah.`)
 }

 setCardInput('')
 setModalCardInput('')
 fetchStats()
 fetchLogs()
 if (method === 'MANUAL') fetchStudents()
 } catch (err) {
 const msg = err?.response?.data?.message || 'Gagal memproses absensi.'
 setLastScanResult({
 success: false,
 message: msg,
 })
 pushToast('error', 'Absensi Gagal', msg)
 } finally {
 setProcessingScan(false)
 }
 }

 const handleScanSubmit = (e) => {
 e?.preventDefault()
 if (!cardInput.trim()) return
 executeScan(cardInput)
 }

 const handleModalScanSubmit = (e) => {
 e?.preventDefault()
 if (!modalCardInput.trim()) return
 executeScan(modalCardInput)
 }

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
 visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
 }

 if (isGuru) {
 return <Navigate to="/portal-guru/workspace" replace />
 }

 return (
 <PageContainer>
 <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-12">
 {/* Navigation Breadcrumb */}
 <motion.div variants={itemVariants} className="print:hidden">
 <AppBreadcrumb
 items={[
 { label: 'Dashboard', href: '/dashboard' },
 { label: 'Presensi & Kehadiran' },
 { label: 'Absensi Digital Gerbang' },
 ]}
 />
       </motion.div>

      <HeroUiHeader
        title="Absensi Gerbang Kedatangan & Pulang Sekolah"
        subtitle="Terminal pemindaian real-time kartu siswa, QR Code, RFID, dan verifikasi kepulangan santri/siswa."
        badge="Terminal Absensi Gerbang"
        icon={QrCode}
        className="mb-6"
      />

 {/* Modern KPI Cards Grid (§C + §7.3 flex-wrap isi-penuh: 4 sebaris, sisa melebar) */}
 <motion.div variants={containerVariants} className="flex flex-wrap gap-3.5">
 <GateKpiCard
 icon={Users}
 title="Total Siswa"
 value={stats.total_siswa}
 subtext="Terdaftar Aktif"
 tag="Siswa"
 tone="emerald"
 onClick={() => openKpiModal('total_siswa')}
 />
 <GateKpiCard
 icon={UserCheck}
 title="Hadir Tepat Waktu"
 value={stats.hadir}
 subtext="Tepat Waktu"
 tag="Hadir"
 tone="emerald"
 onClick={() => openKpiModal('hadir')}
 />
 <GateKpiCard
 icon={Clock}
 title="Terlambat"
 value={stats.terlambat}
 subtext="Scan Gerbang"
 tag="Terlambat"
 tone="amber"
 onClick={() => openKpiModal('terlambat')}
 />
 <GateKpiCard
 icon={ShieldCheck}
 title="Izin / Sakit"
 value={stats.izin + stats.sakit}
 subtext="Disetujui TU"
 tag="Izin/Sakit"
 tone="blue"
 onClick={() => openKpiModal('izin_sakit')}
 />
 <GateKpiCard
 icon={AlertTriangle}
 title="Belum Hadir"
 value={stats.belum_hadir}
 subtext="Menunggu Scan"
 tag="Belum"
 tone="indigo"
 onClick={() => openKpiModal('belum_hadir')}
 />
 <GateKpiCard
 icon={UserX}
 title="Alpha"
 value={stats.alpha}
 subtext="Tanpa Berita"
 tag="Alpha"
 tone="rose"
 onClick={() => openKpiModal('alpha')}
 />
 <GateKpiCard
 icon={LogOut}
 title="Sudah Pulang"
 value={stats.sudah_pulang}
 subtext="Check-out Gate"
 tag="Pulang"
 tone="purple"
 onClick={() => openKpiModal('sudah_pulang')}
 />
 </motion.div>

 {/* Tabs */}
 <motion.div variants={itemVariants}>
 <AppTabs
 tabs={[
 { id: 'scan', label: 'Terminal Pemindaian', icon: QrCode },
 { id: 'logs', label: 'Log Real-Time Kedatangan & Pulang', icon: Clock },
 ]}
 activeTab={activeTab}
 onChange={setActiveTab}
 variant="pill"
 ariaLabel="Mode terminal absensi"
 />
 </motion.div>

 <AnimatePresence mode="wait">
 {activeTab === 'scan' && (
 <motion.div
 key="scan-tab"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.2 }}
 className="grid grid-cols-1 gap-6 lg:grid-cols-12"
 >
 {/* Main Terminal Panel */}
 <div className="space-y-6 lg:col-span-7">
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] p-5 sm:p-6 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 {/* Scan Mode Switcher */}
 <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-emerald-50/70 p-1.5 dark:bg-emerald-950/30 border-2 border-emerald-200/80 dark:border-emerald-800/60" role="tablist" aria-label="Mode presensi">
 <button
 type="button"
 role="tab"
 aria-selected={scanMode === 'checkin'}
 onClick={() => setScanMode('checkin')}
 className={`relative flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 z-10 cursor-pointer ${
 scanMode === 'checkin'
 ? 'text-white'
 : 'text-emerald-900/80 hover:text-emerald-950 dark:text-emerald-200/80 dark:hover:text-white'
 }`}
 >
 {scanMode === 'checkin' && (
 <motion.div
 layoutId="activeScanModeBg"
									className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md shadow-emerald-600/25 -z-10"
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 />
 )}
 <LogIn className="h-4 w-4" /> PRESENSI KEDATANGAN
 </button>
 <button
 type="button"
 role="tab"
 aria-selected={scanMode === 'checkout'}
 onClick={() => setScanMode('checkout')}
 className={`relative flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 z-10 cursor-pointer ${
 scanMode === 'checkout'
 ? 'text-white'
 : 'text-emerald-900/80 hover:text-emerald-950 dark:text-emerald-200/80 dark:hover:text-white'
 }`}
 >
 {scanMode === 'checkout' && (
 <motion.div
 layoutId="activeScanModeBg"
									className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-800 shadow-md shadow-teal-700/25 -z-10"
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 />
 )}
 <LogOut className="h-4 w-4" /> PRESENSI PULANG
 </button>
 </div>

 {/* Method Selector */}
 <div className="mb-6">
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
 Metode Scan
 </label>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="tablist" aria-label="Metode pemindaian">
 <button
 type="button"
 role="tab"
 aria-selected={method === 'QRCODE'}
 onClick={() => setMethod('QRCODE')}
 className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 cursor-pointer ${
 method === 'QRCODE'
								? 'border-2 border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-200 shadow-xs font-bold'
								: 'border-2 border-emerald-100 hover:border-emerald-300 bg-white text-slate-700 hover:bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-card-dark dark:text-slate-200 dark:hover:border-emerald-700 font-semibold'
 }`}
 >
 <QrCode className="h-4 w-4" /> QR Code Kartu
 </button>
 <button
 type="button"
 role="tab"
 aria-selected={method === 'RFID'}
 onClick={() => setMethod('RFID')}
 className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 cursor-pointer ${
 method === 'RFID'
								? 'border-2 border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-200 shadow-xs font-bold'
								: 'border-2 border-emerald-100 hover:border-emerald-300 bg-white text-slate-700 hover:bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-card-dark dark:text-slate-200 dark:hover:border-emerald-700 font-semibold'
 }`}
 >
 <Radio className="h-4 w-4" /> RFID Tap
 </button>
 <button
 type="button"
 role="tab"
 aria-selected={method === 'MANUAL'}
 onClick={() => setMethod('MANUAL')}
 className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 cursor-pointer ${
 method === 'MANUAL'
								? 'border-2 border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-200 shadow-xs font-bold'
								: 'border-2 border-emerald-100 hover:border-emerald-300 bg-white text-slate-700 hover:bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-card-dark dark:text-slate-200 dark:hover:border-emerald-700 font-semibold'
 }`}
 >
 <UserCheck className="h-4 w-4" /> Input TU
 </button>
 </div>
 </div>

 {/* DYNAMIC ACTION VIEW 1: QR CODE METHOD */}
 {method === 'QRCODE' && (
 <div className="space-y-4">
 <div className="relative overflow-hidden rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/20 flex flex-wrap items-center justify-between gap-3">
 {/* Animated Laser Line */}
 <motion.div
 className="absolute left-0 right-0 h-0.5 bg-white dark:bg-[#1B2433] shadow-[0_0_8px_rgba(16,185,129,0.8)] pointer-events-none"
 animate={{ top: ['0%', '100%', '0%'] }}
 transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
 />
 <div className="flex items-center gap-3 min-w-0 flex-1">
 <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">

            <QrCode className="size-6 sm:size-7 h-5 w-5 text-white" />
 </div>
 <div className="min-w-0">
 <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Mode Pemindai QR Code Kartu</h4>
 <p className="text-xs text-slate-600 dark:text-slate-400">Gunakan scanner USB atau buka kamera live browser.</p>
 </div>
 </div>
 <button
 type="button"
 onClick={openCameraModal}
 className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 px-4 py-2.5 text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 hover:scale-[1.03] transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
 >
 <div className="flex size-5 items-center justify-center rounded-lg bg-white/20">
 <Camera className="size-3.5 text-emerald-600" strokeWidth={2.2} />
 </div>
 <span>Buka Kamera Pemindai</span>
 </button>
 </div>

 <form onSubmit={handleScanSubmit} className="space-y-2">
 <label htmlFor="gate-qr-input" className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Input Hardware Scanner USB</label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 z-10 flex items-center text-slate-400 dark:text-slate-500">
 <QrCode className="size-4" />
 </div>
 <HeroInput
 id="gate-qr-input"
 type="text"
 autoFocus
 value={cardInput}
 onChange={(e) => setCardInput(e.target.value)}
 placeholder="Scan QR Code via scanner USB..."
 className="h-9 rounded-xl border-emerald-200/80 bg-slate-50/50 pl-10 pr-28 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 dark:border-emerald-800/80 dark:bg-slate-900/50 dark:text-white"
 />
 <button
 type="submit"
 disabled={processingScan}
 className="absolute right-1.5 z-10 inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 px-4 py-2 text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
 >
 {processingScan ? (
 <span className="size-3.5 animate-spin rounded-full border-2 border-emerald-200/80 border-t-transparent" />
 ) : null}
 <span>{processingScan ? 'Proses...' : 'Proses'}</span>
 </button>
 </div>
 </form>
 </div>
 )}

 {/* DYNAMIC ACTION VIEW 2: RFID TAP METHOD */}
 {method === 'RFID' && (
 <div className="space-y-4">
 <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-blue-50/60 p-4 dark:border-emerald-800/60 dark:bg-blue-950/30 flex flex-wrap items-center justify-between gap-3">
 {/* Animated Pulse Beam */}
 <motion.div
 className="absolute left-0 right-0 h-0.5 bg-white dark:bg-[#1B2433] shadow-[0_0_8px_rgba(59,130,246,0.8)] pointer-events-none"
 animate={{ top: ['0%', '100%', '0%'] }}
 transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
 />
 <div className="flex items-center gap-3 min-w-0 flex-1">
 <div className="flex h-9 w-10 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-xs shrink-0">
 <Wifi className="h-5 w-5 animate-pulse" />
 </div>
 <div className="min-w-0">
 <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200">Perangkat RFID Reader Terhubung</h4>
 <p className="text-xs text-slate-600 dark:text-slate-400">Silakan tap kartu RFID siswa pada alat pembaca.</p>
 </div>
 </div>
 <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-extrabold text-emerald-800 border-2 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60 shadow-2xs shrink-0">
 <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
 Standby RFID
 </span>
 </div>

 <form onSubmit={handleScanSubmit} className="space-y-2">
 <label htmlFor="gate-rfid-input" className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Input RFID Card Tap Code</label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 z-10 flex items-center text-slate-400 dark:text-slate-500">
 <Wifi className="size-4" />
 </div>
 <HeroInput
 id="gate-rfid-input"
 type="text"
 autoFocus
 value={cardInput}
 onChange={(e) => setCardInput(e.target.value)}
 placeholder="Tap kartu RFID pada alat pembaca..."
 className="h-9 rounded-xl border-emerald-200/80 bg-slate-50/50 pl-10 pr-32 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 dark:border-emerald-800/80 dark:bg-slate-900/50"
 />
 <button
 type="submit"
 disabled={processingScan}
 className="absolute right-1.5 z-10 inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-[#1B2433] px-4 py-2 text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
 >
 {processingScan ? (
 <span className="size-3.5 animate-spin rounded-full border-2 border-emerald-200/80 border-t-transparent" />
 ) : null}
 <span>{processingScan ? 'Proses...' : 'Proses RFID'}</span>
 </button>
 </div>
 </form>
 </div>
 )}

 {/* DYNAMIC ACTION VIEW 3: MANUAL INPUT TU METHOD (LIST + SEARCH SISWA) */}
 {method === 'MANUAL' && (
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <h4 className="text-sm font-bold text-slate-900 dark:text-white">Pencarian &amp; Absensi Manual Siswa/Santri</h4>
 <span className="text-xs text-slate-500 font-medium">Petugas TU</span>
 </div>

 {/* Search Input */}
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 z-10 flex items-center text-slate-400 dark:text-slate-500">
 <Search className="size-4" />
 </div>
 <HeroInput
 type="text"
 value={studentSearch}
 onChange={(e) => setStudentSearch(e.target.value)}
 placeholder="Cari berdasarkan nama siswa, NIS, atau NISN..."
 aria-label="Cari siswa untuk absensi manual"
 className="h-9 rounded-xl border-emerald-200/80 bg-slate-50/50 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 dark:border-emerald-800/80 dark:bg-slate-900/50"
 />
 </div>

 {/* Student List View */}
 <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
 {loadingStudents ? (
 <AppSkeleton variant="list" rows={3} />
 ) : studentsList.length === 0 ? (
 <AppEmptyState title="Siswa tidak ditemukan" description="Coba ubah kata kunci pencarian nama, NIS, atau NISN." />
 ) : (
 studentsList.map((st) => (
 <div
 key={st.id}
 className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200/80 bg-slate-50/60 p-3 transition hover:border-emerald-300 dark:border-emerald-800/60 dark:bg-slate-900/40"
 >
 <div className="min-w-0">
 <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
 {st.nama_lengkap || st.full_name || 'Siswa'}
 </p>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 NISN: <span className="font-semibold font-mono text-slate-700 dark:text-slate-300">{st.nisn || '-'}</span> | Kelas: {st.kelas?.nama || '-'}
 </p>
 </div>
 <button
 type="button"
 disabled={processingScan}
 onClick={() => executeScan('', st.id)}
 className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold text-white border transition-all duration-200 hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${
 scanMode === 'checkin'
 ? 'bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 border-emerald-300/40'
 : 'bg-white dark:bg-[#1B2433] border-emerald-200/80 dark:border-emerald-800/60'
 }`}
 >
 <div className="flex size-5 items-center justify-center rounded-lg bg-white/20">
 {scanMode === 'checkin' ? (
 <LogIn className="size-3.5 text-emerald-600" strokeWidth={2.2} />
 ) : (
 <LogOut className="size-3.5 text-slate-600" strokeWidth={2.2} />
 )}
 </div>
 <span>{scanMode === 'checkin' ? 'Absen Masuk' : 'Absen Pulang'}</span>
 </button>
 </div>
 ))
 )}
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Last Scan Result Feedback Card */}
 <div className="space-y-6 lg:col-span-5">
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] p-5 sm:p-6 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="mb-4 pb-3.5 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Status Pemindaian Terakhir</h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Umpan balik hasil scan sesi ini</p>
 </div>
 {lastScanResult ? (
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className={`rounded-xl border p-4 ${
 lastScanResult.success
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 dark:border-emerald-800/60 dark:bg-emerald-950/30'
 : 'border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/50 dark:border-emerald-800/60 dark:bg-rose-950/30'
 }`}
 >
 <div className="flex items-center gap-3">
 {lastScanResult.success ? (
 <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
 ) : (
 <XCircle className="h-8 w-8 text-rose-600 dark:text-rose-400" />
 )}
 <div>
 <p
 className={`text-base font-extrabold ${
 lastScanResult.success
 ? 'text-emerald-900 dark:text-emerald-200'
 : 'text-rose-900 dark:text-rose-200'
 }`}
 >
 {lastScanResult.message}
 </p>
 {lastScanResult.data?.student && (
 <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">
 Nama: <span className="font-bold">{lastScanResult.data.student.nama_lengkap}</span> (
 {lastScanResult.data.student.nisn || 'NISN'})
 </p>
 )}
 </div>
 </div>
 </motion.div>
 ) : (
 <div className="rounded-xl border border-dashed border-emerald-200/80 p-8 text-center dark:border-emerald-800/60">
 <QrCode className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
 <p className="mt-2 text-xs font-semibold text-slate-400">Belum ada pemindaian yang dilakukan pada sesi ini.</p>
 </div>
 )}
 </div>
 </div>
 </motion.div>
 )}

 {activeTab === 'logs' && (
 <motion.div
 key="logs-tab"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.2 }}
 className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-sm dark:bg-[#1B2433]"
 >
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3.5 sm:px-6 md:px-8 bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <div className="flex items-center gap-3">
 <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shrink-0 shadow-xs">
 <Clock className="size-5" />
 </div>
 <div>
 <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
 Daftar Kehadiran Kedatangan & Pulang Hari Ini
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Log aktivitas pemindaian presensi siswa di gerbang secara langsung.
 </p>
 </div>
 </div>
 <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
 <MasterActionButton variant="secondary" icon={RefreshCw} onClick={fetchLogs} disabled={loadingLogs}>
 Refresh Log
 </MasterActionButton>
 </div>
 </div>

 <div className="px-4 sm:px-6 md:px-8 py-4 overflow-x-auto">
 {loadingLogs ? (
 <AppSkeleton variant="table" rows={5} cols={4} />
 ) : logs.length === 0 ? (
 <AppEmptyState title="Belum ada data presensi gerbang" description="Log pemindaian akan tampil di sini setelah ada aktivitas scan masuk atau pulang." />
 ) : (
 <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/80">
 <TableRoot className="w-full text-left text-xs font-semibold text-slate-600 dark:text-slate-300">
 <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:from-emerald-950/80 dark:via-teal-950/60 dark:to-emerald-950/80 dark:border-emerald-800/60 text-xs uppercase font-black text-emerald-950 dark:text-emerald-200">
 <TableRow>
 <TableHead className="px-4 py-2.5 text-xs">Siswa</TableHead>
 <TableHead className="hidden sm:table-cell px-4 py-2.5 text-xs">Unit / Kelas</TableHead>
 <TableHead className="px-4 py-2.5 text-xs">Jam Masuk</TableHead>
 <TableHead className="hidden md:table-cell px-4 py-2.5 text-xs">Status Masuk</TableHead>
 <TableHead className="hidden md:table-cell px-4 py-2.5 text-xs">Jam Pulang</TableHead>
 <TableHead className="hidden lg:table-cell px-4 py-2.5 text-xs">Status Pulang</TableHead>
 <TableHead className="hidden lg:table-cell px-4 py-2.5 text-xs">Metode</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {logs.map((log) => (
 <TableRow key={log.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
 <TableCell className="px-4 py-3.5 align-top sm:align-middle">
 <p className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">{log.student?.nama_lengkap || 'Siswa'}</p>
 <p className="text-xs text-slate-400 font-mono line-clamp-1 mt-0.5">{log.student?.nisn || '-'}</p>
 <div className="sm:hidden mt-2 flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60">
 <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
 {log.education_unit?.nama || '-'}
 </span>
 <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
 {log.status || '-'}
 </span>
 </div>
 </TableCell>
 <TableCell className="hidden sm:table-cell px-4 py-3.5 align-middle text-xs font-medium text-slate-700 dark:text-slate-300">{log.education_unit?.nama || '-'}</TableCell>
 <TableCell className="px-4 py-3.5 align-middle text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums">
 {log.check_in_time ? new Date(log.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
 </TableCell>
 <TableCell className="hidden md:table-cell px-4 py-3.5 align-middle">
 <AppBadge variant={log.status === 'HADIR' ? 'success' : log.status === 'TERLAMBAT' ? 'warning' : 'danger'}>
 {log.status || '-'}
 </AppBadge>
 </TableCell>
 <TableCell className="hidden md:table-cell px-4 py-3.5 align-middle text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums">
 {log.check_out_time
 ? new Date(log.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
 : '-'}
 </TableCell>
 <TableCell className="hidden lg:table-cell px-4 py-3.5 align-middle text-xs font-semibold text-slate-500">{log.check_out_status || '-'}</TableCell>
 <TableCell className="hidden lg:table-cell px-4 py-3.5 align-middle text-xs font-semibold text-slate-500">{log.attendance_method || '-'}</TableCell>
 </TableRow>
 ))}
 </TableBody>
 </TableRoot>
 </div>
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Per-Unit Schedule Config Modal */}
 <AppModal
 isOpen={showScheduleModal}
 onClose={() => setShowScheduleModal(false)}
 badge="Jadwal Unit"
 title="Pengaturan Jam Masuk & Pulang Per Unit"
 description="Konfigurasi jadwal jam absensi spesifik masing-masing unit pendidikan."
 icon={Settings}
 maxWidth="max-w-2xl"
 zIndex="z-[70]"
 footer={
 <div className="flex w-full items-center justify-end">
 <button
 type="button"
 onClick={() => setShowScheduleModal(false)}
 className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
 >
 Tutup Form
 </button>
 </div>
 }
 >
 <div className="space-y-6">
 {/* Unit Target Selector */}
 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
 Pilih Unit Pendidikan Target
 </label>
 <HeroUiFilterSelect
 disabled={!isMultiUnitUser}
 value={targetUnitForConfig}
 onChange={(val) => setTargetUnitForConfig(val)}
 options={targetUnitConfigOptions}
 placeholder={isMultiUnitUser ? '-- Default Global (Seluruh Unit) --' : 'Unit Sekolah Aktif'}
 icon={Building2}
 searchable={true}
 className="w-full"
 />
 </div>

 {/* Form Input for Selected Unit */}
 <form onSubmit={handleSaveScheduleConfig} className="space-y-4 rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/20">
 <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-2 dark:border-emerald-800/60">
 <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
 <Clock className="h-4 w-4 text-emerald-600" /> Jam Absensi: {targetUnitForConfig ? units.find((u) => u.id === targetUnitForConfig)?.nama || 'Unit Tertentu' : 'Default Global'}
 </h4>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label htmlFor="gate-jam-masuk" className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
 Jam Masuk Sekolah <span className="text-rose-500">*</span>
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 z-10 flex items-center text-slate-400 dark:text-slate-500">
 <Clock className="size-4" />
 </div>
 <HeroInput
 id="gate-jam-masuk"
 type="time"
 useNative
 required
 value={scheduleConfig.jam_masuk}
 onChange={(e) => setScheduleConfig({ ...scheduleConfig, jam_masuk: e.target.value })}
 className="pl-10 text-xs font-semibold"
 />
 </div>
 </div>

 <div>
 <label htmlFor="gate-toleransi" className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
 Toleransi Terlambat (Menit) <span className="text-rose-500">*</span>
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 z-10 flex items-center text-slate-400 dark:text-slate-500">
 <Hash className="size-4" />
 </div>
 <HeroInput
 id="gate-toleransi"
 type="number"
 required
 min="0"
 max="120"
 value={scheduleConfig.toleransi_menit}
 onChange={(e) => setScheduleConfig({ ...scheduleConfig, toleransi_menit: e.target.value })}
 className="pl-10 text-xs font-semibold"
 />
 </div>
 </div>

 <div>
 <label htmlFor="gate-jam-pulang" className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
 Jam Pulang Sekolah <span className="text-rose-500">*</span>
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 z-10 flex items-center text-slate-400 dark:text-slate-500">
 <Clock className="size-4" />
 </div>
 <HeroInput
 id="gate-jam-pulang"
 type="time"
 useNative
 required
 value={scheduleConfig.jam_pulang}
 onChange={(e) => setScheduleConfig({ ...scheduleConfig, jam_pulang: e.target.value })}
 className="pl-10 text-xs font-semibold"
 />
 </div>
 </div>

 <div>
 <label htmlFor="gate-cutoff" className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
 Batas Jam Cutoff Alpha <span className="text-rose-500">*</span>
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 z-10 flex items-center text-slate-400 dark:text-slate-500">
 <Clock className="size-4" />
 </div>
 <HeroInput
 id="gate-cutoff"
 type="time"
 useNative
 required
 value={scheduleConfig.jam_cutoff_alpha}
 onChange={(e) => setScheduleConfig({ ...scheduleConfig, jam_cutoff_alpha: e.target.value })}
 className="pl-10 text-xs font-semibold"
 />
 </div>
 </div>
 </div>

 <div className="flex justify-end pt-2">
 <button
 type="submit"
 disabled={savingSchedule}
 className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 px-5 py-2.5 text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-sm"
 >
 {savingSchedule ? (
 <span className="size-3.5 animate-spin rounded-full border-2 border-emerald-200/80 border-t-transparent" />
 ) : (
 <div className="flex size-5 items-center justify-center rounded-lg bg-white/20">
 <CheckCircle2 className="size-3.5 text-emerald-600" strokeWidth={2.2} />
 </div>
 )}
 <span>{savingSchedule ? 'Menyimpan...' : 'Simpan Pengaturan Unit Ini'}</span>
 </button>
 </div>
 </form>

 {/* Matriks Ringkasan Jam Seluruh Unit */}
 <div className="space-y-3">
 <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
 <Layers className="h-4 w-4 text-emerald-600" /> Ringkasan Jam Absensi Seluruh Unit
 </h4>
 <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/80">
 <TableRoot className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200">
                  <TableHead className="px-4 py-2.5 font-bold">Unit Pendidikan</TableHead>
                  <TableHead className="px-4 py-2.5 font-bold">Jam Masuk & Toleransi</TableHead>
                  <TableHead className="px-4 py-2.5 font-bold">Jam Pulang</TableHead>
                  <TableHead className="px-4 py-2.5 font-bold">Cutoff Alpha</TableHead>
                  <TableHead className="px-4 py-2.5 text-right select-none w-20" />
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                {allUnitsSchedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="px-4 py-8 text-center">
                      <AppEmptyState title="Belum ada data unit" description="Konfigurasi jadwal per unit akan tampil di sini." />
                    </TableCell>
                  </TableRow>
                ) : (
                  allUnitsSchedules.map((u) => (
                    <TableRow key={u.unit_id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
                      <TableCell className="px-4 py-3 font-bold text-slate-900 dark:text-emerald-400">
                        {u.unit_name}
                        {u.has_custom_schedule && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
                            Kustom
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{u.schedule.jam_masuk}</div>
                        <div className="text-xs text-slate-400 tabular-nums mt-0.5">Tol: {u.schedule.toleransi_menit} Menit</div>
                      </TableCell>
                      <TableCell className="px-4 py-3 font-bold text-indigo-700 dark:text-indigo-400 tabular-nums">{u.schedule.jam_pulang}</TableCell>
                      <TableCell className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300 tabular-nums">{u.schedule.jam_cutoff_alpha}</TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <MasterActionIconButton
                          variant="edit"
                          label="Edit Unit Ini"
                          onClick={() => {
                            setTargetUnitForConfig(u.unit_id)
                            setScheduleConfig(u.schedule)
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
 </TableRoot>
 </div>
 </div>
 </div>
 </AppModal>

 {/* Pop-Up Camera Scanner Modal with HeroUI Prompt Style & Framer Motion Scan Animation */}
 <AppModal
 isOpen={showCameraModal}
 onClose={closeCameraModal}
 badge={scanMode === 'checkin' ? 'KEDATANGAN' : 'PULANG'}
 title="Pemindai QR Code Live"
 description="Arahkan QR Code kartu siswa ke dalam kotak pemindai"
 icon={Camera}
 maxWidth="max-w-xl"
 zIndex="z-[70]"
 footer={
 <div className="flex w-full flex-wrap items-center justify-between gap-2.5">
 <button
 type="button"
 onClick={cameraActive ? stopCamera : startCamera}
 className="inline-flex h-9.5 items-center gap-2 rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 hover:bg-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 active:scale-95 cursor-pointer"
 >
 {cameraActive ? (
 <CameraOff className="h-3.5 w-3.5 text-rose-500" />
 ) : (
 <Camera className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
 )}
 <span>{cameraActive ? 'Matikan Kamera' : 'Nyalakan Ulang Kamera'}</span>
 </button>
 <button
 type="button"
 onClick={closeCameraModal}
 className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
 >
 Tutup Window
 </button>
 </div>
 }
 >
 <div className="space-y-4">
 {/* Dedicated Square QR Code Scanner Viewfinder */}
 <div className="relative mx-auto aspect-square w-full max-w-[320px] sm:max-w-[340px] overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-950 shadow-2xl shadow-sm dark:border-emerald-800/60">
 <video
 ref={(el) => {
 videoRef.current = el
 if (el && streamRef.current && el.srcObject !== streamRef.current) {
 el.srcObject = streamRef.current
 el.muted = true
 el.play().catch((err) => console.warn('Callback play error:', err))
 }
 }}
 autoPlay
 playsInline
 muted
 className="h-full w-full object-cover"
 />

 {/* Darkened Vignette Mask with Center Square QR Target Cutout */}
 <div className="absolute inset-0 pointer-events-none flex items-center justify-center">

 {/* Dedicated Square QR Reticle (220x220px mobile, 250x250px desktop) */}
 <div className="relative z-10 h-56 w-56 sm:h-64 sm:w-64 rounded-xl border border-emerald-200/90 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.52)] overflow-hidden">
 {/* 4 Precision L-Shaped Corner Target Markers */}
 <span className="absolute top-0 left-0 h-6 w-6 border-t-[3.5px] border-l-[3.5px] border-emerald-200/80 rounded-tl-xl shadow-[0_0_8px_#10b981]" />
 <span className="absolute top-0 right-0 h-6 w-6 border-t-[3.5px] border-r-[3.5px] border-emerald-200/80 rounded-tr-xl shadow-[0_0_8px_#10b981]" />
 <span className="absolute bottom-0 left-0 h-6 w-6 border-b-[3.5px] border-l-[3.5px] border-emerald-200/80 rounded-bl-xl shadow-[0_0_8px_#10b981]" />
 <span className="absolute bottom-0 right-0 h-6 w-6 border-b-[3.5px] border-r-[3.5px] border-emerald-200/80 rounded-br-xl shadow-[0_0_8px_#10b981]" />

 {/* Animated Laser Scanning Beam (from FRAMER_MOTION_ANIMATIONS.md Section 4) */}
 {cameraActive && (
 <>
 {/* Sweeping Soft Glow Beam */}
 <motion.div
 animate={{ top: ['-20%', '85%', '-20%'] }}
 transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
 className="absolute inset-x-0 h-16 bg-white dark:bg-[#1B2433] pointer-events-none z-10"
 />

 {/* Sharp Laser Line Beam */}
 <motion.div
 animate={{ top: ['4%', '94%', '4%'] }}
 transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
 className="absolute inset-x-1 h-1 bg-white dark:bg-[#1B2433] shadow-[0_0_16px_#10b981,0_0_24px_#34d399] z-20 pointer-events-none"
 />
 </>
 )}

 {/* Helper Badge inside viewfinder */}
 <div className="absolute -bottom-9 inset-x-0 flex justify-center pointer-events-none">
 <span className="bg-slate-950/90 backdrop-blur-md px-3.5 py-1 text-[10px] font-black text-emerald-300 rounded-full border border-emerald-200/80 dark:border-emerald-800/60 whitespace-nowrap shadow-xl flex items-center gap-1.5">
 <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
 Posisikan QR Code di Dalam Kotak
 </span>
 </div>
 </div>
 </div>

 {cameraLoading && (
 <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/85 text-white gap-2.5">
 <RefreshCw className="h-8 w-8 animate-spin text-emerald-400" />
 <p className="text-xs font-bold text-slate-200">Menghubungkan ke kamera...</p>
 </div>
 )}
 </div>

 {cameraError && (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/90 p-4 text-xs dark:border-emerald-800/60 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 space-y-2.5">
 <div className="flex items-start gap-2.5">
 <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
 <div className="space-y-1">
 <p className="font-extrabold text-sm text-rose-900 dark:text-rose-100">Kamera Tidak Dapat Diakses</p>
 <p className="leading-relaxed">{cameraError}</p>
 </div>
 </div>

 <div className="pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 flex flex-wrap items-center justify-between gap-2">
 <div className="text-xs text-rose-700 dark:text-rose-300">
 <span className="font-bold">Panduan Mac/Chrome:</span> Klik ikon 🔒 / <span className="font-mono bg-rose-100 dark:bg-rose-900/50 px-1 py-0.5 rounded">tune</span> di address bar &gt; set Camera ke <span className="font-bold">Allow</span> &gt; Refresh.
 </div>
 <button
 type="button"
 onClick={startCamera}
 className="inline-flex items-center gap-2 rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 px-4 py-2.5 text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 hover:scale-[1.03] transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
 >
 <div className="flex size-5 items-center justify-center rounded-lg bg-white/20">
 <RefreshCw className="size-3.5 text-slate-600" strokeWidth={2.2} />
 </div>
 <span>Coba Hubungkan Lagi</span>
 </button>
 </div>
 </div>
 )}

 {/* Quick Code Entry in Modal */}
 <form onSubmit={handleModalScanSubmit} className="space-y-2 pt-1">
 <label htmlFor="gate-modal-scan" className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
 Hasil Pindai QR / Input Manual Kartu
 </label>
 <div className="flex flex-col sm:flex-row gap-2">
 <div className="relative flex flex-1 items-center">
 <div className="pointer-events-none absolute left-3.5 z-10 flex items-center text-slate-400 dark:text-slate-500">
 <QrCode className="size-4" />
 </div>
 <HeroInput
 id="gate-modal-scan"
 type="text"
 autoFocus
 value={modalCardInput}
 onChange={(e) => setModalCardInput(e.target.value)}
 placeholder="Hasil deteksi QR otomatis / Ketik NISN..."
 className="h-9 rounded-xl border-emerald-200/80 bg-slate-50/50 pl-10 pr-4 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400/80 dark:border-emerald-800/80 dark:bg-slate-900/50 dark:text-white dark:placeholder:text-slate-500"
 />
 </div>
 <button
 type="submit"
 disabled={processingScan}
 className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 px-5 py-2.5 text-xs sm:text-sm font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer whitespace-nowrap shadow-sm"
 >
 {processingScan ? (
 <span className="size-3.5 animate-spin rounded-full border-2 border-emerald-200/80 border-t-transparent" />
 ) : (
 <div className="flex size-5 items-center justify-center rounded-lg bg-white/20">
 <QrCode className="size-3.5 text-slate-600" strokeWidth={2.2} />
 </div>
 )}
 <span>{processingScan ? 'Proses...' : 'Proses Scan'}</span>
 </button>
 </div>
 </form>
 </div>
 </AppModal>

 {/* Modal Detail Data KPI Siswa */}
 <AppModal
 isOpen={kpiModal.isOpen}
 onClose={closeKpiModal}
 badge={`${filteredKpiData.length} Siswa`}
 title={kpiModal.title}
 description="Daftar detail siswa berdasarkan status presensi gerbang hari ini."
 icon={Users}
 maxWidth="max-w-3xl"
 zIndex="z-[70]"
 footer={
 <div className="flex w-full items-center justify-between gap-2.5">
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
 Menampilkan {filteredKpiData.length} data siswa Dareliman Edu
 </span>
 <button
 type="button"
 onClick={closeKpiModal}
 className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
 >
 Tutup Rincian
 </button>
 </div>
 }
 >
 <div className="space-y-4">
 {/* Toolbar Filter / Search dalam Modal */}
 <div className="flex items-center justify-between gap-3">
 <div className="relative flex-1 max-w-sm flex items-center">
 <div className="pointer-events-none absolute left-3.5 z-10 flex items-center text-emerald-600/70 dark:text-emerald-400">
 <Search className="size-4" />
 </div>
 <HeroInput
 type="text"
 value={kpiModal.search}
 onChange={(e) => setKpiModal((prev) => ({ ...prev, search: e.target.value }))}
 placeholder="Cari nama siswa, NIS, atau NISN..."
 aria-label="Cari siswa dalam modal"
 className="h-9 rounded-xl border-emerald-200/80 dark:border-emerald-800/60 bg-white pl-10 pr-4 text-xs font-semibold text-slate-800 dark:border-emerald-800/60 dark:bg-slate-900"
 />
 </div>
 {kpiModal.search && (
 <button
 type="button"
 onClick={() => setKpiModal((prev) => ({ ...prev, search: '' }))}
 className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 shrink-0 cursor-pointer"
 >
 Reset Cari
 </button>
 )}
 </div>

 {/* Content Table Body */}
 <div className="modal-body min-h-0 flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
 {kpiModal.loading ? (
 <AppSkeleton variant="table" rows={4} cols={4} />
 ) : filteredKpiData.length === 0 ? (
 <AppEmptyState
 title="Tidak ada data siswa"
 description={kpiModal.search ? 'Tidak ditemukan siswa dengan kriteria pencarian ini.' : 'Tidak ditemukan siswa dengan kriteria filter ini.'}
 actionLabel={kpiModal.search ? 'Reset Cari' : undefined}
 onAction={kpiModal.search ? () => setKpiModal((prev) => ({ ...prev, search: '' })) : undefined}
 />
 ) : (
 <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/80">
 <TableRoot className="w-full text-left text-xs">
 <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:from-emerald-950/80 dark:via-teal-950/60 dark:to-emerald-950/80 dark:border-emerald-800/60 uppercase text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300">
 <TableRow>
 <TableHead className="px-4 py-2.5">NO</TableHead>
 <TableHead className="px-4 py-2.5">SISWA</TableHead>
 <TableHead className="px-4 py-2.5">KELAS / UNIT</TableHead>
 <TableHead className="px-4 py-2.5">JAM MASUK</TableHead>
 <TableHead className="px-4 py-2.5">JAM PULANG</TableHead>
 <TableHead className="px-4 py-2.5 text-center">STATUS PRESENSI</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody className="divide-y divide-emerald-100/80 font-medium text-slate-700 dark:divide-emerald-900/40 dark:text-slate-300">
 {filteredKpiData.map((item, idx) => (
 <TableRow key={item.student_id || item.id || idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
 <TableCell className="px-4 py-3 font-bold text-slate-400 tabular-nums">{idx + 1}</TableCell>
 <TableCell className="px-4 py-3">
 <p className="font-bold text-slate-900 dark:text-white line-clamp-2">{item.nama_lengkap || item.full_name || item.student?.nama_lengkap || 'Siswa'}</p>
 <p className="text-xs text-slate-400 font-mono line-clamp-1 mt-0.5">NIS: {item.nis || item.nisn || item.student?.nis || '-'}</p>
 </TableCell>
 <TableCell className="px-4 py-3">
 <p className="font-semibold text-slate-800 dark:text-slate-200">{item.kelas_name || item.school_class?.name || item.school_class?.nama_kelas || '-'}</p>
 <p className="text-[10px] text-slate-400 line-clamp-1">{item.unit_name || item.education_unit?.name || '-'}</p>
 </TableCell>
 <TableCell className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
 {item.check_in_time ? item.check_in_time.slice(0, 5) : '-'}
 </TableCell>
 <TableCell className="px-4 py-3 font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
 {item.check_out_time ? item.check_out_time.slice(0, 5) : '-'}
 </TableCell>
 <TableCell className="px-4 py-3 text-center">
 {renderStatusBadge(item.status, item.check_out_time)}
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </TableRoot>
 </div>
 )}
 </div>
 </div>
 </AppModal>

 </motion.div>
 </PageContainer>
 )
}
