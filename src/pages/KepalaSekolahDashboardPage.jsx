import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { kepalaSekolahDashboardService } from '../services/kepalaSekolahDashboardService'
import { educationUnitService } from '../services/educationUnitService'
import {
  Users,
  UserCheck,
  GraduationCap,
  School,
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  BookOpen,
  Award,
  Plus,
  RefreshCw,
  Calendar,
  Sparkles,
  Building2,
  MapPin,
  Phone,
  Mail,
  Activity,
  Radio,
  Eye,
  Crown,
  ShieldCheck,
  Wallet,
  ChevronRight,
  MessageSquare,
  MessageCircle,
  Send,
  Printer,
} from 'lucide-react'
import { printWeeklyStudentEvaluation } from '../utils/printHelper'
import { useAuthStore } from '../stores/authStore'
import { familyPortalService } from '../services/familyPortalService'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
} from '@/components/tailgrids/core/avatar'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/tailgrids/core/hover-card'
import {
  OverlayWrapper,
  Backdrop,
} from '@/components/tailgrids/core/overlay'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from '@/components/tailgrids/core/dialog'
import { Button } from '@/components/tailgrids/core/button'
import { List } from '@/components/tailgrids/core/list'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

import {
  AppPageHeader,
  AppBreadcrumb,
  AppFilterBar,
  KpiCard,
  SummaryCard,
  AppDataTable,
  AppBadge,
  AppButton,
  SectionHeader,
  PageContainer,
} from '../components/app'

import ChartCard from '../components/dashboard/ChartCard'
import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'
import StudentAchievementRecapSection from '../components/dashboard/StudentAchievementRecapSection'
import KpiQuickViewModal from '../components/KpiQuickViewModal'
import ModalErrorBoundary from '../components/common/ModalErrorBoundary'
import { motion } from 'framer-motion'

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

const DEFAULT_ONLINE_USERS = []
const DEFAULT_ONLINE_LOGS = []
const DEFAULT_STUDENT_ATTENDANCE = []
const DEFAULT_ATTENDANCE_TREND = []
const DEFAULT_ANNOUNCEMENTS = []

const DEFAULT_PENGURUS_YAYASAN = []

const DEFAULT_FALLBACK_DATA = {
  kpis: {},
  context: {},
  school_info: {},
  online_users: [],
  online_logs: [],
  student_attendance: [],
  pengurus_yayasan: DEFAULT_PENGURUS_YAYASAN,
  charts: {
    attendance_trend: [],
  },
  tables: {
    announcements: [],
    rekap_prestasi: [],
  },
}

// ── SUB-KOMPONEN MODERN KPI & SUMMARY CARDS (Spesifikasi TAILGRIDS_ALUMNI_MUTASI_CARDS) ──
const MODERN_CARD_TONES = {
  emerald: {
    card: 'border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
    glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
    iconBox: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/30',
    tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    title: 'text-emerald-700 dark:text-emerald-400',
    val: 'text-emerald-700 dark:text-emerald-300',
    sub: 'text-emerald-600/80 dark:text-emerald-400/80',
    cta: 'text-emerald-600/60 dark:text-emerald-500/60',
  },
  blue: {
    card: 'border-blue-300/70 bg-gradient-to-br from-blue-50 via-cyan-50/60 to-white hover:border-blue-400 dark:border-blue-700/50 dark:from-blue-950/40 dark:via-cyan-950/20 dark:to-slate-900',
    glow: 'bg-blue-400/20 group-hover:bg-blue-400/30',
    iconBox: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-blue-500/30',
    tag: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
    title: 'text-blue-700 dark:text-blue-400',
    val: 'text-blue-700 dark:text-blue-300',
    sub: 'text-blue-600/80 dark:text-blue-400/80',
    cta: 'text-blue-600/60 dark:text-blue-500/60',
  },
  amber: {
    card: 'border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
    glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
    iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/30',
    tag: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    title: 'text-amber-700 dark:text-amber-400',
    val: 'text-amber-700 dark:text-amber-300',
    sub: 'text-amber-600/80 dark:text-amber-400/80',
    cta: 'text-amber-600/60 dark:text-amber-500/60',
  },
  rose: {
    card: 'border-rose-300/70 bg-gradient-to-br from-rose-50 via-pink-50/60 to-white hover:border-rose-400 dark:border-rose-700/50 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-slate-900',
    glow: 'bg-rose-400/20 group-hover:bg-rose-400/30',
    iconBox: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-rose-500/30',
    tag: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
    title: 'text-rose-700 dark:text-rose-400',
    val: 'text-rose-700 dark:text-rose-300',
    sub: 'text-rose-600/80 dark:text-rose-400/80',
    cta: 'text-rose-600/60 dark:text-rose-500/60',
  },
  purple: {
    card: 'border-purple-300/70 bg-gradient-to-br from-purple-50 via-indigo-50/60 to-white hover:border-purple-400 dark:border-purple-700/50 dark:from-purple-950/40 dark:via-indigo-950/20 dark:to-slate-900',
    glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
    iconBox: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-500/30',
    tag: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
    title: 'text-purple-700 dark:text-purple-400',
    val: 'text-purple-700 dark:text-purple-300',
    sub: 'text-purple-600/80 dark:text-purple-400/80',
    cta: 'text-purple-600/60 dark:text-purple-500/60',
  },
  indigo: {
    card: 'border-indigo-300/70 bg-gradient-to-br from-indigo-50 via-sky-50/60 to-white hover:border-indigo-400 dark:border-indigo-700/50 dark:from-indigo-950/40 dark:via-sky-950/20 dark:to-slate-900',
    glow: 'bg-indigo-400/20 group-hover:bg-indigo-400/30',
    iconBox: 'bg-gradient-to-br from-indigo-500 to-sky-600 text-white shadow-indigo-500/30',
    tag: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300',
    title: 'text-indigo-700 dark:text-indigo-400',
    val: 'text-indigo-700 dark:text-indigo-300',
    sub: 'text-indigo-600/80 dark:text-indigo-400/80',
    cta: 'text-indigo-600/60 dark:text-indigo-500/60',
  },
}

function ModernKpiCard({ icon: Icon, title, value, subtext, tag, tone = 'emerald', onClick }) {
  const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
  const isClickable = typeof onClick === 'function'

  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      className={`group relative overflow-hidden rounded-[18px] border-2 p-5 shadow-sm transition-all duration-200 ${
        isClickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      } ${t.card}`}
    >
      {/* Ambient Glow */}
      <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all ${t.glow}`} />

      {/* Header with Gradient Icon Box & Pill Tag */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm ${t.iconBox}`}>
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-wider ${t.title}`}>{title}</p>
          </div>
        </div>
        {tag && (
          <span className={`rounded-lg px-2 py-0.5 text-[10px] font-extrabold ${t.tag}`}>
            {tag}
          </span>
        )}
      </div>

      {/* Metric Value */}
      <p className={`text-4xl font-black tabular-nums ${t.val}`}>
        {value ?? '0'}
      </p>
      {subtext && (
        <p className={`mt-0.5 text-[11px] font-semibold ${t.sub}`}>
          {subtext}
        </p>
      )}

      {/* Click Affordance Footer */}
      {isClickable && (
        <p className={`mt-3 text-[10px] font-bold flex items-center gap-1 ${t.cta}`}>
          <Eye className="h-3 w-3" /> Klik untuk detail lengkap
        </p>
      )}
    </div>
  )
}

function ModernSummaryCard({ icon: Icon, title, value, subtext, tag, tone = 'emerald', onClick }) {
  const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
  const isClickable = typeof onClick === 'function'

  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      className={`group relative overflow-hidden rounded-[18px] border-2 p-4.5 shadow-sm transition-all duration-200 ${
        isClickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      } ${t.card}`}
    >
      <div className={`pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full blur-xl transition-all ${t.glow}`} />

      <div className="flex items-center justify-between mb-2.5">
        <div className={`flex h-8.5 w-8.5 items-center justify-center rounded-xl text-white shadow-xs ${t.iconBox}`}>
          <Icon className="h-4 w-4" />
        </div>
        {tag && (
          <span className={`rounded-lg px-2 py-0.5 text-[9px] font-extrabold ${t.tag}`}>
            {tag}
          </span>
        )}
      </div>

      <p className={`text-[10.5px] font-bold uppercase tracking-wider ${t.title}`}>{title}</p>
      <p className={`text-3xl font-black tabular-nums ${t.val}`}>
        {value ?? '0'}
      </p>
      {subtext && (
        <p className={`mt-0.5 text-[10.5px] font-semibold ${t.sub}`}>
          {subtext}
        </p>
      )}

      {isClickable && (
        <p className={`mt-2.5 text-[9.5px] font-bold flex items-center gap-1 ${t.cta}`}>
          <Eye className="h-2.5 w-2.5" /> Rekap harian
        </p>
      )}
    </div>
  )
}

export default function KepalaSekolahDashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [selectedUnitId, setSelectedUnitId] = useState('')
  const [activeModal, setActiveModal] = useState(null)
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false)
  const [attendanceFilterUnit, setAttendanceFilterUnit] = useState('all')
  const [attendanceSearchTerm, setAttendanceSearchTerm] = useState('')
  const [onlineFilter, setOnlineFilter] = useState('all')
  const [trendScheduleMode, setTrendScheduleMode] = useState('auto')
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('all')
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState('')

  const handlePrintWeekly = (st) => {
    const sName = st?.nama || st?.name || st?.full_name || 'Shezakia Mufidah Alfirdausi'
    const sNisn = st?.nisn || st?.nis || '-'
    const sKelas = st?.kelas || st?.rombel || st?.school_class?.name || '10 Madinah 1'
    const sUnit = st?.unit_name || st?.unit || schoolInfo?.nama || 'Sekolah Menengah Atas Islam Terpadu'
    const sWali = st?.nama_ortu || st?.wali || 'Ilma Emilia Widyastuti'
    const eduUnit = st?.education_unit || (typeof st?.unit === 'object' ? st?.unit : null) || {
      name: schoolInfo?.nama || sUnit,
      code: schoolInfo?.kode,
      metadata: {
        npsn: schoolInfo?.npsn,
        address: schoolInfo?.alamat,
        phone: schoolInfo?.kontak,
        accreditation: schoolInfo?.akreditasi,
        principal_name: schoolInfo?.kepala_sekolah,
      },
    }

    printWeeklyStudentEvaluation({
      student: {
        ...st,
        name: sName,
        nis: sNisn,
        className: sKelas,
        unitName: sUnit,
        education_unit: eduUnit,
      },
      period: {
        title: 'Senin, 10 Agustus 2026 s.d. Jumat, 14 Agustus 2026',
        academicYear: schoolInfo?.tahun_ajaran || '2026/2027',
      },
      homeroomTeacher: {
        name: 'Ustadzah Elsa Putri Utami',
      },
      guruWali: {
        name: sWali,
      },
      schoolCity: eduUnit?.metadata?.city || 'Padang',
    })
  }

  // State Modal Chat Direct Real-Time
  const currentAuthUser = useAuthStore((state) => state.user)
  const [activeChatUser, setActiveChatUser] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [chatLoading, setChatLoading] = useState(false)
  const [chatSending, setChatSending] = useState(false)
  const [chatInputText, setChatInputText] = useState('')
  const chatMessagesEndRef = React.useRef(null)

  // Memuat riwayat pesan saat modal chat terbuka
  useEffect(() => {
    if (!activeChatUser) {
      setChatMessages([])
      setChatInputText('')
      return
    }

    let isMounted = true
    const recipientId = activeChatUser.id || activeChatUser.user_id

    const loadMessages = async () => {
      setChatLoading(true)
      try {
        const res = await familyPortalService.employeeMessages(recipientId).catch(() => null)
        const msgs = res?.data?.messages || res?.data || res?.messages || []
        if (isMounted) {
          setChatMessages(Array.isArray(msgs) ? msgs : [])
        }
      } catch (err) {
        console.warn('Gagal memuat pesan riil, inisialisasi sesi obrolan baru:', err)
        if (isMounted) setChatMessages([])
      } finally {
        if (isMounted) setChatLoading(false)
      }
    }

    loadMessages()
    return () => {
      isMounted = false
    }
  }, [activeChatUser])

  // Scroll otomatis ke bagian bawah obrolan
  useEffect(() => {
    if (activeChatUser && chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, activeChatUser])

  // Handler kirim pesan chat
  const handleSendChatMessage = async (e) => {
    if (e) e.preventDefault()
    const text = chatInputText.trim()
    if (!text || !activeChatUser || chatSending) return

    const recipientId = activeChatUser.id || activeChatUser.user_id
    const tempMsg = {
      id: `temp-${Date.now()}`,
      sender_id: currentAuthUser?.id,
      recipient_id: recipientId,
      message: text,
      created_at: new Date().toISOString(),
      is_sender: true,
    }

    setChatMessages((prev) => [...prev, tempMsg])
    setChatInputText('')
    setChatSending(true)

    try {
      await familyPortalService.sendEmployeeMessage(recipientId, text).catch(() => null)
    } catch (err) {
      console.warn('Pesan terkirim secara lokal:', err)
    } finally {
      setChatSending(false)
    }
  }

  const { data: daftarUnitData } = useQuery({
    queryKey: ['education-units-ks-filter'],
    queryFn: () => educationUnitService.getDaftar({ per_page: 100 }),
    staleTime: 5 * 60 * 1000,
  })

  const unitsList = Array.isArray(daftarUnitData?.data)
    ? daftarUnitData.data
    : Array.isArray(daftarUnitData)
      ? daftarUnitData
      : []

  const fetchDashboard = async (unitId, date) => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      const activeUnit = unitId !== undefined ? unitId : selectedUnitId
      if (activeUnit && activeUnit !== 'all') {
        params.unit_id = activeUnit
      }
      const activeDate = date !== undefined ? date : selectedAttendanceDate
      if (activeDate) {
        params.date = activeDate
      }
      const res = await kepalaSekolahDashboardService.getOverview(params)
      const payload = res?.data || res
      if (payload) {
        setData(payload)
      } else {
        setData(DEFAULT_FALLBACK_DATA)
      }
    } catch (err) {
      console.warn('Failed to load Kepala Sekolah API, falling back to local dashboard data:', err)
      setData(DEFAULT_FALLBACK_DATA)
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

  const getStatVal = (val) => {
    if (val === undefined || val === null) return 0
    if (typeof val === 'object' && val !== null) {
      if (val.total !== undefined) return Number(val.total) || 0
      if (val.count !== undefined) return Number(val.count) || 0
    }
    return typeof val === 'number' ? val : Number(val) || 0
  }

  const formatNumber = (num) => getStatVal(num).toLocaleString('id-ID')

  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = String(name).trim().split(' ')
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return String(name).slice(0, 2).toUpperCase()
  }

  const schoolInfo = {
    nama: data?.school_info?.nama || context.unit?.nama || '',
    npsn: data?.school_info?.npsn || context.unit?.npsn || '—',
    kode: data?.school_info?.kode || context.unit?.code || context.unit?.kode || '—',
    akreditasi: data?.school_info?.akreditasi || context.unit?.akreditasi || '—',
    alamat: data?.school_info?.alamat || context.unit?.alamat || '—',
    kepala_sekolah: data?.school_info?.kepala_sekolah || context.unit?.kepala_sekolah || '—',
    kontak: data?.school_info?.kontak || context.unit?.kontak || '—',
    status: data?.school_info?.status || 'Operasional',
    tahun_ajaran: context.tahun_ajaran?.nama || '—',
    semester: context.semester?.nama || '—',
  }

  const onlineUsers = data && Array.isArray(data.online_users) ? data.online_users : DEFAULT_ONLINE_USERS
  const onlineCount = onlineUsers.filter((u) => u.is_online).length
  const offlineCount = onlineUsers.filter((u) => !u.is_online).length

  const filteredOnlineUsers = onlineFilter === 'online'
    ? onlineUsers.filter((u) => u.is_online)
    : onlineFilter === 'offline'
      ? onlineUsers.filter((u) => !u.is_online)
      : onlineUsers
  const onlineLogs = data && Array.isArray(data.online_logs) ? data.online_logs : DEFAULT_ONLINE_LOGS
  const studentAttendanceList = data && Array.isArray(data.student_attendance) ? data.student_attendance : DEFAULT_STUDENT_ATTENDANCE
  const attendanceMeta = data?.attendance_meta

  const hadirCount = studentAttendanceList.filter((s) => s.status === 'Hadir').length
  const terlambatCount = studentAttendanceList.filter((s) => s.status === 'Terlambat').length
  const izinCount = studentAttendanceList.filter((s) => s.status === 'Izin').length
  const sakitCount = studentAttendanceList.filter((s) => s.status === 'Sakit').length
  const alphaCount = studentAttendanceList.filter((s) => s.status === 'Alpha').length
  const noActivityCount = studentAttendanceList.filter((s) => s.status.includes('Libur') || s.status.includes('Belum')).length

  const filteredCardStudentList = attendanceStatusFilter === 'all'
    ? studentAttendanceList
    : attendanceStatusFilter === 'inactive'
      ? studentAttendanceList.filter((s) => s.status.includes('Libur') || s.status.includes('Belum'))
      : studentAttendanceList.filter((s) => s.status === attendanceStatusFilter)

  const filteredModalAttendanceList = studentAttendanceList.filter((st) => {
    const sName = (st.nama || st.name || '').toLowerCase()
    const sNisn = (st.nisn || st.nis || '').toLowerCase()
    const sKelas = (st.kelas || st.rombel || '').toLowerCase()
    const sUnit = (st.unit_name || st.unit || '').toLowerCase()
    const search = attendanceSearchTerm.trim().toLowerCase()

    const matchesSearch = !search || sName.includes(search) || sNisn.includes(search) || sKelas.includes(search)
    const matchesUnit = attendanceFilterUnit === 'all' || sUnit.includes(attendanceFilterUnit.toLowerCase())

    return matchesSearch && matchesUnit
  })

  const rawPengurus = data?.pengurus_yayasan || data?.tables?.pengurus_yayasan
  const pengurusYayasanList = Array.isArray(rawPengurus) && rawPengurus.length > 0 ? rawPengurus : DEFAULT_PENGURUS_YAYASAN

  const unitScheduleType = charts?.unit_schedule_type || 'fullday'
  const unitScheduleLabel = charts?.schedule_label || (unitScheduleType === 'pesantren' ? 'Pondok Pesantren (Senin - Sabtu)' : 'Fullday School (Senin - Jumat)')
  const fulldayTrend = Array.isArray(charts?.fullday_trend) && charts.fullday_trend.length > 0 ? charts.fullday_trend : DEFAULT_ATTENDANCE_TREND
  const pesantrenTrend = Array.isArray(charts?.pesantren_trend) && charts.pesantren_trend.length > 0 ? charts.pesantren_trend : DEFAULT_ATTENDANCE_TREND

  const activeTrendMode = trendScheduleMode === 'auto' ? unitScheduleType : trendScheduleMode
  const attendanceTrendChartData = activeTrendMode === 'pesantren' ? pesantrenTrend : fulldayTrend

  const announcementRaw = tables?.announcements || data?.announcements || data?.recent_announcements
  const announcementList = Array.isArray(announcementRaw) ? announcementRaw : DEFAULT_ANNOUNCEMENTS


  return (
    <PageContainer maxW="7xl">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-12">
        {/* Breadcrumb Navigation */}
        <motion.div variants={itemVariants} className="print:hidden">
          <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Dashboard Kepala Sekolah' }]} />
        </motion.div>

        {/* MODERN HERO CARD HEADER (MATCHING MONITORING & DIVISI PENDIDIKAN STYLE) */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden">
          {/* Ambient Glow Background Accent (Vibrant Dual Emerald-Teal Blobs) */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-emerald-500/20 dark:border-emerald-800/40">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <Building2 className="size-6 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Dashboard Kepala Sekolah
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    {schoolInfo.status}
                  </span>
                </div>
                <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {schoolInfo.nama}
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  NPSN: <span className="font-bold text-slate-900 dark:text-white">{schoolInfo.npsn}</span> • Kode Unit: <span className="font-bold text-slate-900 dark:text-white">{schoolInfo.kode}</span> • Akreditasi: <span className="font-bold text-slate-900 dark:text-white">{schoolInfo.akreditasi}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 z-10">
              <AppBadge variant="info" className="font-extrabold">TA {schoolInfo.tahun_ajaran}</AppBadge>
              <AppBadge variant="purple" className="font-extrabold">{schoolInfo.semester}</AppBadge>
              {unitsList.length > 0 && (
                <select
                  value={selectedUnitId || context.unit?.id || ''}
                  onChange={(e) => {
                    const val = e.target.value
                    setSelectedUnitId(val)
                    fetchDashboard(val)
                  }}
                  className="rounded-xl border border-emerald-500/30 bg-white/90 px-3.5 py-2 text-xs font-extrabold text-slate-800 shadow-sm focus:border-emerald-600 focus:outline-none dark:border-emerald-800 dark:bg-slate-900 dark:text-slate-100 cursor-pointer"
                >
                  <option value="">-- Pilih Unit Sekolah --</option>
                  {unitsList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.code} - {u.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/60 dark:bg-slate-900/50 border border-emerald-500/20 dark:border-emerald-800/40">
              <MapPin className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 dark:text-white block">Lokasi & Alamat Unit</span>
                <span className="text-slate-600 dark:text-slate-400 font-medium">{schoolInfo.alamat}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/60 dark:bg-slate-900/50 border border-emerald-500/20 dark:border-emerald-800/40">
              <UserCheck className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 dark:text-white block">Kepala Sekolah Unit</span>
                <span className="text-slate-600 dark:text-slate-400 font-medium">{schoolInfo.kepala_sekolah}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/60 dark:bg-slate-900/50 border border-emerald-500/20 dark:border-emerald-800/40">
              <Phone className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 dark:text-white block">Kontak Resepsionis / Admin</span>
                <span className="text-slate-600 dark:text-slate-400 font-medium">{schoolInfo.kontak}</span>
              </div>
            </div>
          </div>
        </motion.div>

      {/* Profil Pengurus Yayasan (Ketua, Sekretaris, Bendahara) */}
      <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/5 space-y-4 dark:border-emerald-600/35 dark:bg-[#1B2433]">
        {/* Ambient Glow */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-gradient-to-br from-emerald-500/10 to-teal-500/5 blur-2xl dark:from-emerald-500/15" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-emerald-500/15 dark:border-emerald-800/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm shadow-amber-500/20">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                Profil Pengurus Yayasan
                <AppBadge variant="purple" size="xs">Yayasan Dar el-Iman</AppBadge>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Struktur pimpinan eksekutif yayasan: Ketua, Sekretaris, dan Bendahara
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Periode 2021 - 2026
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pengurusYayasanList.map((officer) => {
            const photo = officer.avatar_url || officer.photo || officer.foto
            const name = officer.nama || officer.nama_lengkap || officer.name
            const jabatan = officer.jabatan || officer.title || 'Pengurus'
            const nip = officer.nip || officer.niy || '—'
            const email = officer.email || '—'
            const phone = officer.phone || officer.no_hp || '—'
            const status = officer.status || 'Aktif'
            const isOnline = Boolean(officer.is_online)
            const lastSeen = officer.last_seen || (isOnline ? 'Aktif sekarang' : 'Offline')
            const roleCode = officer.role_code || (jabatan.includes('Ketua') ? 'KETUA' : jabatan.includes('Sekretaris') ? 'SEKRETARIS' : 'BENDAHARA')

            const roleTheme = roleCode === 'KETUA'
              ? {
                  badgeVariant: 'success',
                  border: 'border-emerald-300/70 hover:border-emerald-400 dark:border-emerald-700/50',
                  bgGradient: 'bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white dark:from-emerald-950/30 dark:via-teal-950/15 dark:to-slate-900',
                  glow: 'bg-emerald-400/20',
                  bgIcon: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/20',
                  ring: 'ring-emerald-500/30'
                }
              : roleCode === 'SEKRETARIS'
              ? {
                  badgeVariant: 'info',
                  border: 'border-sky-300/70 hover:border-sky-400 dark:border-sky-700/50',
                  bgGradient: 'bg-gradient-to-br from-sky-50/70 via-cyan-50/40 to-white dark:from-sky-950/30 dark:via-cyan-950/15 dark:to-slate-900',
                  glow: 'bg-sky-400/20',
                  bgIcon: 'bg-gradient-to-br from-sky-500 to-cyan-600 text-white shadow-sky-500/20',
                  ring: 'ring-sky-500/30'
                }
              : {
                  badgeVariant: 'purple',
                  border: 'border-purple-300/70 hover:border-purple-400 dark:border-purple-700/50',
                  bgGradient: 'bg-gradient-to-br from-purple-50/70 via-indigo-50/40 to-white dark:from-purple-950/30 dark:via-indigo-950/15 dark:to-slate-900',
                  glow: 'bg-purple-400/20',
                  bgIcon: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-500/20',
                  ring: 'ring-purple-500/30'
                }

            return (
              <HoverCard key={officer.id || jabatan}>
                <HoverCardTrigger asChild>
                  <div className={`group relative overflow-hidden flex flex-col justify-between rounded-[18px] border-2 ${roleTheme.border} ${roleTheme.bgGradient} p-4.5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer`}>
                    <div className={`pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl transition-all ${roleTheme.glow}`} />
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="relative">
                            <Avatar size="xl" className={`ring-2 ${roleTheme.ring}`}>
                            {photo && <AvatarImage src={photo} alt={name} />}
                            <AvatarFallback className={`${roleTheme.bgIcon} font-black text-xs`}>
                              {getInitials(name)}
                            </AvatarFallback>
                            <AvatarBadge status={isOnline ? 'online' : 'offline'} size="xl" ping={isOnline} live={isOnline} />
                          </Avatar>
                        </div>
                        <AppBadge variant={roleTheme.badgeVariant} size="sm">
                          {jabatan}
                        </AppBadge>
                      </div>

                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                          {name}
                        </h4>
                        <p className="font-mono text-[10px] text-slate-400 font-semibold mt-0.5">
                          {nip}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-[10px]">
                      <span className="font-bold text-slate-400">Status Keaktifan</span>
                      {isOnline ? (
                        <span className="inline-flex items-center gap-1 font-extrabold text-emerald-600 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-slate-500 dark:text-slate-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          {lastSeen}
                        </span>
                      )}
                    </div>
                  </div>
                </HoverCardTrigger>

                {/* TailGrids HoverCard Content (Detail Preview Popover) */}
                <HoverCardContent
                  side="top"
                  align="center"
                  className="w-80 p-4 border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-[#1B2433] rounded-2xl shadow-xl space-y-3 z-50"
                >
                  <div className="flex items-start gap-3">
                    <Avatar size="xxl" className={`ring-2 ${roleTheme.ring} shrink-0`}>
                      {photo && <AvatarImage src={photo} alt={name} />}
                      <AvatarFallback className={`${roleTheme.bgIcon} font-extrabold text-lg`}>
                        {getInitials(name)}
                      </AvatarFallback>
                      <AvatarBadge status={isOnline ? 'online' : 'offline'} size="xxl" ping={isOnline} live={isOnline} />
                    </Avatar>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <AppBadge variant={roleTheme.badgeVariant} dot>{jabatan}</AppBadge>
                        <span className={`text-[10px] font-bold ${isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                          {lastSeen}
                        </span>
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug">
                        {name}
                      </h4>
                      <p className="font-mono text-[10px] text-slate-400">{nip}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-900/50 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold">Lembaga:</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200">Yayasan Dar el-Iman</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800">
                      <span className="text-slate-400 font-bold">Masa Khidmat:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Periode 2021 - 2026</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{phone}</span>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            )
          })}
        </div>
      </section>

      {/* 2-Column Grid: Pegawai & Guru Online Real-Time + Log Keaktifan Feed */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Kolom 1: Pegawai & Guru Online Real-Time (dengan TailGrids Avatar & HoverCard) */}
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/5 space-y-4 dark:border-emerald-600/35 dark:bg-[#1B2433]">
          <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Pegawai & Guru Online Real-Time</h3>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>

            {/* Filter Tabs: Semua / Online / Offline */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-[11px] font-extrabold">
              <button
                type="button"
                onClick={() => setOnlineFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${onlineFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-black' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}
              >
                Semua ({onlineUsers.length})
              </button>
              <button
                type="button"
                onClick={() => setOnlineFilter('online')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${onlineFilter === 'online' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online ({onlineCount})
              </button>
              <button
                type="button"
                onClick={() => setOnlineFilter('offline')}
                className={`px-2.5 py-1 rounded-lg transition-all ${onlineFilter === 'offline' ? 'bg-slate-600 text-white shadow-xs font-black' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}
              >
                Offline ({offlineCount})
              </button>
            </div>
          </div>

          {filteredOnlineUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
              <Users className="h-10 w-10 stroke-1 mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {onlineFilter === 'online'
                  ? 'Tidak ada pegawai atau guru yang sedang online saat ini'
                  : onlineFilter === 'offline'
                  ? 'Semua pegawai sedang online'
                  : 'Belum ada pegawai atau guru terdata pada unit ini'}
              </p>
            </div>
          ) : (
            <div className="max-h-[380px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
                {filteredOnlineUsers.map((user, idx) => {
                  const photo = user.avatar_url || user.photo_url || user.foto || user.avatar
                  const userName = user.nama || user.name || user.full_name || 'Pegawai'
                  const userRole = user.role || user.jabatan || user.jabatan_name || 'Pegawai / Guru'
                  const userNip = user.nip || user.niy || user.nik || '—'
                  const userDept = user.dept || user.departemen || user.unit || '—'
                  const userActivity = user.activity || user.aktivitas || user.title || 'Aktif di portal'
                  const lastSeen = user.lastSeen || user.last_active || (user.is_online ? 'Aktif sekarang' : 'Offline')
                  const userEmail = user.email || '—'
                  const userPhone = user.phone || user.no_hp || user.telepon || '—'
                  const isOnline = Boolean(user.is_online)

                  return (
                    <HoverCard key={user.id || idx}>
                      <HoverCardTrigger asChild>
                        <div className="group relative flex flex-col items-center text-center rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all duration-200 hover:border-emerald-400 hover:bg-emerald-50/30 hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433] dark:hover:border-emerald-600 dark:hover:bg-emerald-950/20 cursor-pointer">
                          {/* Quick Chat Shortcut Icon Button on Hover (Membuka Modal Chat) */}
                          <button
                            type="button"
                            title={`Chat langsung dengan ${userName}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveChatUser(user)
                            }}
                            className="absolute top-2.5 right-2.5 flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-emerald-100/90 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-600 transition-all opacity-0 group-hover:opacity-100 shadow-2xs z-10 cursor-pointer active:scale-90"
                          >
                            <MessageSquare className="h-3 w-3" />
                          </button>

                          {/* TailGrids Avatar with Live Online Badge */}
                          <div className="relative mb-2">
                            <Avatar size="lg" className={`ring-2 ${isOnline ? 'ring-emerald-500/30' : 'ring-slate-300 dark:ring-slate-700'}`}>
                              {photo && <AvatarImage src={photo} alt={userName} />}
                              <AvatarFallback className={`${isOnline ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'} font-black text-xs`}>
                                {getInitials(userName)}
                              </AvatarFallback>
                              <AvatarBadge status={isOnline ? 'online' : 'offline'} size="lg" ping={isOnline} live={isOnline} />
                            </Avatar>
                          </div>

                          <p className="text-[11px] font-extrabold text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                            {userName}
                          </p>
                          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {userRole}
                          </p>
                          
                          {isOnline ? (
                            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Online
                            </span>
                          ) : (
                            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 text-[9px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                              {lastSeen}
                            </span>
                          )}
                        </div>
                      </HoverCardTrigger>

                      {/* TailGrids HoverCard Content (Profile Preview Popover with Chat Actions) */}
                      <HoverCardContent
                        side="top"
                        align="center"
                        className="w-80 p-4 border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-[#1B2433] rounded-2xl shadow-xl space-y-3 z-50"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar size="xxl" className={`ring-2 ${isOnline ? 'ring-emerald-500/40' : 'ring-slate-300 dark:ring-slate-700'} shrink-0`}>
                            {photo && <AvatarImage src={photo} alt={userName} />}
                            <AvatarFallback className={`${isOnline ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'} font-extrabold text-lg`}>
                              {getInitials(userName)}
                            </AvatarFallback>
                            <AvatarBadge status={isOnline ? 'online' : 'offline'} size="xxl" ping={isOnline} live={isOnline} />
                          </Avatar>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <AppBadge variant={isOnline ? 'success' : 'neutral'} dot>
                                {isOnline ? 'Online' : 'Offline'}
                              </AppBadge>
                              <span className="text-[10px] text-slate-400 font-bold">{lastSeen}</span>
                            </div>
                            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug">
                              {userName}
                            </h4>
                            <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                              {userRole}
                            </p>
                            <p className="font-mono text-[10px] text-slate-400">{userNip}</p>
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-900/50 space-y-1.5 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-bold">Departemen:</span>
                            <span className="font-extrabold text-slate-800 dark:text-slate-200">{userDept}</span>
                          </div>
                          <div className="flex items-start gap-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                            <Activity className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />
                            <span className="text-slate-600 dark:text-slate-300 font-medium line-clamp-2">
                              <strong className="text-slate-800 dark:text-white">Aktivitas Sesi:</strong> {userActivity}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{userEmail}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>{userPhone}</span>
                          </div>
                        </div>

                        {/* Chat & Komunikasi Action Buttons */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveChatUser(user)
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-3 py-2 text-xs font-black shadow-sm shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>Mulai Chat Internal</span>
                          </button>

                          {userPhone && userPhone !== '—' && (
                            <a
                              href={`https://wa.me/${userPhone.replace(/\D/g, '').replace(/^0/, '62')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title="Chat via WhatsApp"
                              className="inline-flex items-center justify-center gap-1 rounded-xl border border-emerald-300/70 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2.5 py-2 text-xs font-black transition-all cursor-pointer active:scale-95"
                            >
                              <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>WA</span>
                            </a>
                          )}
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Kolom 2: Log Keaktifan & Activity Feed Real-Time */}
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/5 space-y-4 dark:border-emerald-600/35 dark:bg-[#1B2433] flex flex-col justify-between h-full">
          <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
          
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <Radio className="h-4 w-4 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Log Keaktifan & Activity Feed Real-Time
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Log transaksi login, presensi, dan aktivitas sistem
                </p>
              </div>
            </div>
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>

          <div className="flex-1 space-y-2.5 min-h-[340px] max-h-[380px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
            {onlineLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <Activity className="h-10 w-10 stroke-1 mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Belum ada log keaktifan transaksi tercatat hari ini
                </p>
              </div>
            ) : (
              onlineLogs.map((log, idx) => (
                <div
                  key={log.id || idx}
                  className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 transition-all hover:bg-slate-100/70 hover:border-slate-200/80 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-900/70"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold mt-0.5 shadow-2xs">
                    {log.type === 'login' ? <UserCheck className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {log.user || log.nama || log.username || 'Pengguna'}
                      </p>
                      <span className="shrink-0 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md">
                        {log.time || log.created_at || log.created_at_relative || 'Baru saja'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed break-words">
                      {log.role && (
                        <span className="inline-block font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded text-[10px] mr-1.5 border border-emerald-200/60 dark:border-emerald-800/60">
                          {log.role}
                        </span>
                      )}
                      {log.action || log.description || log.pesan || log.title}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Status Log Sejajar */}
          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">
              Total Log: <strong className="text-slate-700 dark:text-slate-200 font-bold">{onlineLogs.length}</strong> aktivitas
            </span>
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Stream
            </span>
          </div>
        </div>
      </section>



      {/* Primary Unit KPIs - Modern Style Cards */}
      <section className="space-y-3">
        <SectionHeader title="Metrik Utama Unit Sekolah" subtitle="Jumlah siswa, guru, pegawai, dan rombel aktif" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ModernKpiCard
            title="Total Siswa Aktif"
            value={formatNumber(kpis.total_siswa?.total)}
            subtext="Terdaftar aktif di unit sekolah"
            icon={Users}
            tone="emerald"
            tag="Siswa Unit"
            onClick={() => setActiveModal('total_siswa')}
          />
          <ModernKpiCard
            title="Total Guru Pengajar"
            value={formatNumber(kpis.total_guru?.total)}
            subtext="Tenaga pendidik aktif"
            icon={GraduationCap}
            tone="blue"
            tag="Guru"
            onClick={() => setActiveModal('total_guru')}
          />
          <ModernKpiCard
            title="Total Pegawai & Staf"
            value={formatNumber(kpis.total_pegawai?.total)}
            subtext="Tenaga kependidikan unit"
            icon={UserCheck}
            tone="purple"
            tag="Tendik"
            onClick={() => setActiveModal('total_pegawai')}
          />
          <ModernKpiCard
            title="Total Rombel / Kelas"
            value={formatNumber(kpis.total_rombel?.total || kpis.total_kelas?.total)}
            subtext="Rombongan belajar aktif"
            icon={Layers}
            tone="indigo"
            tag="Rombel"
            onClick={() => setActiveModal('total_kelas')}
          />
        </div>
      </section>

      {/* Daily Attendance & Tahfizh Metrics - Modern Style Cards */}
      <section className="space-y-3">
        <SectionHeader title="Kondisi Presensi & Setoran Tahfizh Hari Ini" subtitle="Monitoring kehadiran harian dan setoran hafalan Al-Qur'an" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <ModernSummaryCard
            title="Hadir Hari Ini"
            value={formatNumber(kpis.siswa_hadir_hari_ini?.total)}
            subtext="Tepat waktu"
            icon={CheckCircle2}
            tone="emerald"
            tag="Presensi"
            onClick={() => setIsAttendanceModalOpen(true)}
          />
          <ModernSummaryCard
            title="Terlambat"
            value={formatNumber(kpis.siswa_terlambat?.total)}
            subtext="Perlu pembinaan"
            icon={Clock}
            tone="amber"
            tag="Perhatian"
            onClick={() => setIsAttendanceModalOpen(true)}
          />
          <ModernSummaryCard
            title="Izin"
            value={formatNumber(kpis.siswa_izin?.total)}
            subtext="Konfirmasi tertulis"
            icon={FileText}
            tone="blue"
            tag="Disetujui"
            onClick={() => setIsAttendanceModalOpen(true)}
          />
          <ModernSummaryCard
            title="Sakit"
            value={formatNumber(kpis.siswa_sakit?.total)}
            subtext="Istirahat medis"
            icon={AlertCircle}
            tone="rose"
            tag="Kesehatan"
            onClick={() => setIsAttendanceModalOpen(true)}
          />
          <ModernSummaryCard
            title="Setoran Tahfizh"
            value={formatNumber(kpis.setoran_tahfizh_hari_ini?.total)}
            subtext="Hafalan harian"
            icon={BookOpen}
            tone="purple"
            tag="Tahfizh"
          />
        </div>
      </section>

      {/* Quick Action Navigation (Soft Pastel Squircle Buttons) */}
      <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#0E5C44]/10 text-[#0E5C44] dark:bg-[#3FBF75]/20 dark:text-[#3FBF75]">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Akses Cepat Kepala Sekolah</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Navigasi langsung ke pemantauan presensi, tahfizh, dan kesiswaan</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {/* 1. Monitoring Divisi - Sky Blue Theme */}
            <button
              type="button"
              onClick={() => navigate('/dashboard/monitoring-divisi')}
              className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-2.5 transition-all duration-200 hover:border-sky-300 hover:bg-sky-50/50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-sky-700/60 dark:hover:bg-sky-950/30 text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100/80 text-sky-600 border border-sky-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-sky-950/60 dark:text-sky-400 dark:border-sky-800/60">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 pr-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-sky-700 dark:group-hover:text-sky-300">Monitoring Divisi</p>
                <p className="text-[10px] text-slate-400 truncate">Divisi & Unit</p>
              </div>
            </button>

            {/* 2. Rekap Kehadiran - Emerald Green Theme */}
            <button
              type="button"
              onClick={() => navigate('/absensi/rekap-kehadiran')}
              className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-2.5 transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-50/50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-emerald-700/60 dark:hover:bg-emerald-950/30 text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100/80 text-emerald-600 border border-emerald-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 pr-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300">Rekap Kehadiran</p>
                <p className="text-[10px] text-slate-400 truncate">Presensi Guru & Siswa</p>
              </div>
            </button>

            {/* 3. Monitoring Tahfizh - Violet Theme */}
            <button
              type="button"
              onClick={() => navigate('/dashboard/monitoring-tahfizh-ibadah-non-pesantren')}
              className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-2.5 transition-all duration-200 hover:border-violet-300 hover:bg-violet-50/50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-violet-700/60 dark:hover:bg-violet-950/30 text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100/80 text-violet-600 border border-violet-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-violet-950/60 dark:text-violet-400 dark:border-violet-800/60">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0 pr-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-violet-700 dark:group-hover:text-violet-300">Tahfizh & Mutabaah Non-Pesantren</p>
                <p className="text-[10px] text-slate-400 truncate">Hafalan & Ibadah Harian</p>
              </div>
            </button>

            {/* 4. Verifikasi Prestasi - Amber Theme */}
            <button
              type="button"
              onClick={() => navigate('/dashboard/pemantauan')}
              className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-2.5 transition-all duration-200 hover:border-amber-300 hover:bg-amber-50/50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-amber-700/60 dark:hover:bg-amber-950/30 text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100/80 text-amber-600 border border-amber-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60">
                <Award className="h-5 w-5" />
              </div>
              <div className="min-w-0 pr-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-amber-700 dark:group-hover:text-amber-300">Verifikasi Prestasi</p>
                <p className="text-[10px] text-slate-400 truncate">Capaian & Penghargaan</p>
              </div>
            </button>

            {/* 5. Segarkan Data - Cyan Theme */}
            <button
              type="button"
              onClick={fetchDashboard}
              className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-2.5 transition-all duration-200 hover:border-cyan-300 hover:bg-cyan-50/50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-cyan-700/60 dark:hover:bg-cyan-950/30 text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-100/80 text-cyan-600 border border-cyan-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-cyan-950/60 dark:text-cyan-400 dark:border-cyan-800/60">
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </div>
              <div className="min-w-0 pr-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-cyan-700 dark:group-hover:text-cyan-300">Segarkan Data</p>
                <p className="text-[10px] text-slate-400 truncate">Update Real-Time</p>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* 2-Column Grid: Monitoring Kehadiran Siswa + Tren Kehadiran & Pengumuman Sekolah */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Kolom 1: Monitoring Kehadiran Siswa */}
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/5 space-y-4 dark:border-emerald-600/35 dark:bg-[#1B2433] flex flex-col justify-between h-full">
          <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
          
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-emerald-500/15 dark:border-emerald-800/40">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Monitoring Kehadiran Siswa</h3>
                  {attendanceMeta?.is_today ? (
                    attendanceMeta?.has_activity ? (
                      <AppBadge variant="success" size="xs">Hari Ini ({attendanceMeta.date_label})</AppBadge>
                    ) : (
                      <AppBadge variant="neutral" size="xs">
                        {attendanceMeta?.is_weekend ? `Hari Libur (${attendanceMeta.date_label})` : `Hari Ini (${attendanceMeta.date_label})`}
                      </AppBadge>
                    )
                  ) : (
                    <AppBadge variant="purple" size="xs">Sesi {attendanceMeta?.date_label}</AppBadge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Presensi kesiswaan unit {schoolInfo.nama}
                  </p>
                  {attendanceMeta?.is_today && !attendanceMeta?.has_activity && attendanceMeta?.latest_active_date && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAttendanceDate(attendanceMeta.latest_active_date)
                        fetchDashboard(selectedUnitId, attendanceMeta.latest_active_date)
                      }}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-2 dark:text-emerald-400 cursor-pointer"
                    >
                      • Sesi Terakhir ({attendanceMeta.latest_active_date_label})
                    </button>
                  )}
                  {!attendanceMeta?.is_today && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAttendanceDate('')
                        fetchDashboard(selectedUnitId, '')
                      }}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-700 underline underline-offset-2 dark:text-slate-400 cursor-pointer"
                    >
                      • Kembali ke Hari Ini
                    </button>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAttendanceModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 cursor-pointer shrink-0 transition-all active:scale-95"
              >
                <Eye className="h-3.5 w-3.5 text-emerald-600" />
                <span>Detail & Filter</span>
              </button>
            </div>

            {/* Quick Filter Tabs for Student Attendance Status */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setAttendanceStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  attendanceStatusFilter === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                Semua ({studentAttendanceList.length})
              </button>
              <button
                type="button"
                onClick={() => setAttendanceStatusFilter('Hadir')}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  attendanceStatusFilter === 'Hadir'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300'
                }`}
              >
                Hadir ({hadirCount})
              </button>
              <button
                type="button"
                onClick={() => setAttendanceStatusFilter('Terlambat')}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  attendanceStatusFilter === 'Terlambat'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300'
                }`}
              >
                Terlambat ({terlambatCount})
              </button>
              <button
                type="button"
                onClick={() => setAttendanceStatusFilter('Izin')}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  attendanceStatusFilter === 'Izin'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-950/60 dark:text-sky-300'
                }`}
              >
                Izin ({izinCount})
              </button>
              <button
                type="button"
                onClick={() => setAttendanceStatusFilter('Sakit')}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  attendanceStatusFilter === 'Sakit'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300'
                }`}
              >
                Sakit ({sakitCount})
              </button>
              <button
                type="button"
                onClick={() => setAttendanceStatusFilter('Alpha')}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  attendanceStatusFilter === 'Alpha'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-200'
                }`}
              >
                Alpha ({alphaCount})
              </button>
              {noActivityCount > 0 && (
                <button
                  type="button"
                  onClick={() => setAttendanceStatusFilter('inactive')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    attendanceStatusFilter === 'inactive'
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {attendanceMeta?.is_weekend ? 'Libur' : 'Belum Presensi'} ({noActivityCount})
                </button>
              )}
            </div>
          </div>

          {/* Student Attendance Cards Grid with Extended & Balanced Height */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-[440px] max-h-[580px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 my-1">
            {filteredCardStudentList.length > 0 ? (
              filteredCardStudentList.map((student, idx) => {
              const photo = student.avatar_url || student.photo_url || student.foto || student.avatar
              const sName = student.nama || student.name || 'Siswa'
              const sNisn = student.nisn || student.nis || '—'
              const sUnit = student.unit_name || student.unit || schoolInfo.nama
              const sKelas = student.kelas || student.rombel || '—'
              const sStatus = student.status || 'Belum Presensi'
              const sTime = student.waktu && student.waktu !== '—' ? student.waktu : '—'
              const sWali = student.nama_ortu || student.wali || '—'
              const sPhone = student.no_hp_ortu || student.kontak_ortu || '—'
              const sKet = student.keterangan || (sStatus === 'Hadir' ? 'Hadir Tepat Waktu' : '—')

              const badgeStatusMap = {
                Hadir: { status: 'online', variant: 'success', border: 'hover:border-emerald-400 dark:hover:border-emerald-600' },
                Terlambat: { status: 'busy', variant: 'warning', border: 'hover:border-amber-400 dark:hover:border-amber-600' },
                Izin: { status: 'busy', variant: 'info', border: 'hover:border-sky-400 dark:hover:border-sky-600' },
                Sakit: { status: 'offline', variant: 'danger', border: 'hover:border-rose-400 dark:hover:border-rose-600' },
                Alpha: { status: 'offline', variant: 'danger', border: 'hover:border-rose-400 dark:hover:border-rose-600' },
                'Belum Presensi': { status: 'offline', variant: 'neutral', border: 'hover:border-slate-300 dark:hover:border-slate-700' },
                'Libur (Akhir Pekan)': { status: 'offline', variant: 'neutral', border: 'hover:border-slate-300 dark:hover:border-slate-700' },
              }
              const currentBadge = badgeStatusMap[sStatus] || badgeStatusMap['Belum Presensi']

              return (
                <HoverCard key={student.id || idx}>
                  <HoverCardTrigger asChild>
                    <div className={`group relative flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3.5 transition-all duration-200 ${currentBadge.border} hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-[#1B2433] cursor-pointer`}>
                      <Avatar size="md" className="shrink-0 mt-0.5 ring-2 ring-slate-200/60 dark:ring-slate-700">
                        {photo && <AvatarImage src={photo} alt={sName} />}
                        <AvatarFallback className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-xs">
                          {getInitials(sName)}
                        </AvatarFallback>
                        <AvatarBadge status={currentBadge.status} size="md" ping={sStatus === 'Hadir'} live={sStatus === 'Hadir'} />
                      </Avatar>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[10.5px] font-bold text-slate-400 truncate">{sKelas}</span>
                          <AppBadge variant={currentBadge.variant} size="xs">{sStatus}</AppBadge>
                        </div>
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                          {sName}
                        </p>
                        
                        {/* Waktu & Keterangan Rapi Tanpa Terpotong */}
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 pt-0.5">
                          <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300">
                            <Clock className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            {sTime}
                          </span>
                          {sKet && sKet !== '—' && (
                            <>
                              <span className="text-slate-300 dark:text-slate-600">•</span>
                              <span className="text-emerald-700 dark:text-emerald-400 font-semibold truncate" title={sKet}>
                                {sKet}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </HoverCardTrigger>

                  <HoverCardContent
                    side="top"
                    align="center"
                    className="w-80 p-4 border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-[#1B2433] rounded-2xl shadow-xl space-y-3 z-50"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar size="xxl" className="ring-2 ring-emerald-500/40 shrink-0">
                        {photo && <AvatarImage src={photo} alt={sName} />}
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-lg">
                          {getInitials(sName)}
                        </AvatarFallback>
                        <AvatarBadge status={currentBadge.status} size="xxl" ping={sStatus === 'Hadir'} live={true} />
                      </Avatar>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <AppBadge variant={currentBadge.variant} dot>{sStatus}</AppBadge>
                          <span className="text-[10px] text-slate-400 font-bold">{sTime}</span>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug">
                          {sName}
                        </h4>
                        <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                          {sUnit}
                        </p>
                        <p className="font-mono text-[10px] text-slate-400">NISN. {sNisn} • Kelas {sKelas}</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-900/50 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-bold">Catatan Presensi:</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">{sKet}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800">
                        <span className="text-slate-400 font-bold">Wali Murid:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{sWali}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-bold">Kontak Wali:</span>
                        <span className="font-mono text-slate-600 dark:text-slate-400">{sPhone}</span>
                      </div>
                    </div>

                    {/* Quick WhatsApp Contact for Parent */}
                    {sPhone && sPhone !== '—' && (
                      <div className="pt-1">
                        <a
                          href={`https://wa.me/${String(sPhone).replace(/\D/g, '').replace(/^0/, '62')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300/80 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 py-2 px-3 text-xs font-bold transition-all cursor-pointer"
                        >
                          <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Hubungi Wali Murid (WhatsApp)</span>
                        </a>
                      </div>
                    )}

                    {/* Cetak Evaluasi Pekanan */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePrintWeekly(student)
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 py-2 px-3 text-xs font-bold transition-all cursor-pointer shadow-xs mt-1.5"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>Cetak Perkembangan Pekanan</span>
                    </button>
                  </HoverCardContent>
                </HoverCard>
              )
            })
          ) : (
            <div className="col-span-1 sm:col-span-2 flex flex-col items-center justify-center py-16 text-center text-xs text-slate-400 dark:text-slate-500">
              <Users className="h-10 w-10 stroke-1 mb-2 text-slate-300 dark:text-slate-600" />
              <p>Tidak ada data siswa dengan filter <strong className="text-slate-700 dark:text-slate-300">"{attendanceStatusFilter}"</strong></p>
            </div>
          )}
          </div>

          {/* Footer Ringkasan Presensi */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <span>
              Menampilkan <strong className="text-slate-700 dark:text-slate-200 font-bold">{filteredCardStudentList.length}</strong> dari {studentAttendanceList.length} siswa
            </span>
            <button
              type="button"
              onClick={() => setIsAttendanceModalOpen(true)}
              className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline font-extrabold cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Buka Rekap Presensi Lengkap</span>
            </button>
          </div>
        </div>

        {/* Kolom 2: Tren Kehadiran Siswa & Pengumuman Sekolah */}
        <div className="space-y-5">
          {/* Card Tren Kehadiran Siswa */}
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/5 space-y-4 dark:border-emerald-600/35 dark:bg-[#1B2433]">
            <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
            {/* Header: Title & Schedule Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-emerald-500/15 dark:border-emerald-800/40">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Tren Kehadiran Siswa</h3>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                    {unitScheduleLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Visualisasi grafik perbandingan kehadiran harian ({activeTrendMode === 'pesantren' ? 'Senin - Sabtu / Pesantren' : 'Senin - Jumat / Fullday'})
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-[11px] font-extrabold shrink-0">
                <button
                  type="button"
                  onClick={() => setTrendScheduleMode('fullday')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${activeTrendMode === 'fullday' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-black' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}
                >
                  Senin - Jumat (Fullday)
                </button>
                <button
                  type="button"
                  onClick={() => setTrendScheduleMode('pesantren')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${activeTrendMode === 'pesantren' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}
                >
                  Senin - Sabtu (Pesantren)
                </button>
              </div>
            </div>

            {/* Legend Indicators & Average Stat */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                  Hadir
                </span>
                <span className="inline-flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  Terlambat
                </span>
                <span className="inline-flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  Alpha
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                Rata-rata: {Math.round(attendanceTrendChartData.reduce((acc, curr) => acc + (curr.rate || 0), 0) / (attendanceTrendChartData.length || 1))}% kehadiran
              </span>
            </div>

            {/* Chart Area */}
            <div className="h-56 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={attendanceTrendChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="hadirGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" opacity={0.15} vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E2E8F0', opacity: 0.5 }}
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 'auto']}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload
                        return (
                          <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-sm p-3 shadow-xl dark:border-slate-800 dark:bg-[#1B2433]/95 text-xs space-y-1.5">
                            <p className="font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1">
                              {item.day_name || label} ({item.date})
                            </p>
                            <div className="space-y-1 text-[11px]">
                              <div className="flex items-center justify-between gap-4">
                                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-extrabold">
                                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                  Hadir:
                                </span>
                                <span className="font-extrabold text-slate-900 dark:text-white">
                                  {item.hadir} siswa {item.rate !== undefined ? `(${item.rate}%)` : ''}
                                </span>
                              </div>
                              {item.terlambat > 0 && (
                                <div className="flex items-center justify-between gap-4">
                                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                                    Terlambat:
                                  </span>
                                  <span className="font-bold text-slate-700 dark:text-slate-300">
                                    {item.terlambat} siswa
                                  </span>
                                </div>
                              )}
                              {item.alpha > 0 && (
                                <div className="flex items-center justify-between gap-4">
                                  <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
                                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                                    Alpha:
                                  </span>
                                  <span className="font-bold text-slate-700 dark:text-slate-300">
                                    {item.alpha} siswa
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hadir"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#hadirGradient)"
                    name="Hadir"
                    activeDot={{ r: 5, fill: '#10B981', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="terlambat"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#F59E0B' }}
                    name="Terlambat"
                  />
                  <Line
                    type="monotone"
                    dataKey="alpha"
                    stroke="#EF4444"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#EF4444' }}
                    name="Alpha"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card Pengumuman Sekolah Terbaru dengan TailGrids List */}
          <div className="relative overflow-hidden rounded-[22px] border-2 border-amber-500/25 bg-white p-5 sm:p-6 shadow-md shadow-amber-500/5 space-y-3 dark:border-amber-600/35 dark:bg-[#1B2433]">
            <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-amber-400/10 blur-2xl dark:bg-amber-400/15" />
            <div className="flex items-center justify-between pb-2 border-b border-amber-500/15 dark:border-amber-800/40">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                  <FileText className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Pengumuman Sekolah Terbaru</h4>
                  <p className="text-[10px] text-slate-400">Klik pengumuman untuk melihat isi edaran lengkap</p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-800/60">
                {announcementList.length} Pengumuman
              </span>
            </div>

            <List direction="vertical" hideDividers={false} className="w-full max-w-full divide-y divide-slate-100 dark:divide-slate-800 border-none bg-transparent">
              {announcementList.map((ann, idx) => (
                <li
                  key={ann.id || idx}
                  onClick={() => setSelectedAnnouncement(ann)}
                  className="group py-2.5 px-2 hover:bg-amber-50/70 dark:hover:bg-amber-950/30 rounded-xl transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3 w-full">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <span className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-amber-500 group-hover:scale-125 transition-transform" />
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-1 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                          {ann.judul}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                          <span className="font-semibold text-slate-400">Target:</span>
                          <AppBadge variant="info" size="xs">{ann.target || 'Semua Unit'}</AppBadge>
                          {ann.prioritas && (
                            <span className={`px-1.5 py-0.2 rounded font-extrabold text-[9px] ${
                              ann.prioritas === 'tinggi'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              Prioritas: {ann.prioritas}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span data-type="count" className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                        {ann.created_at ? new Date(ann.created_at).toLocaleDateString('id-ID') : '—'}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </li>
              ))}
            </List>
          </div>
        </div>
      </section>

      {/* TailGrids Dialog Modal Detail Pengumuman Sekolah */}
      <Dialog
        isOpen={Boolean(selectedAnnouncement)}
        onOpenChange={(open) => {
          if (!open) setSelectedAnnouncement(null)
        }}
        className="max-w-xl w-full p-6 border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#1B2433] rounded-2xl shadow-2xl"
      >
        <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <FileText className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                  Edaran Resmi Unit
                </span>
                {selectedAnnouncement?.prioritas && (
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                    selectedAnnouncement.prioritas === 'tinggi'
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60'
                  }`}>
                    Prioritas {selectedAnnouncement.prioritas}
                  </span>
                )}
              </div>
              <DialogTitle className="text-base font-black text-slate-900 dark:text-white leading-snug">
                {selectedAnnouncement?.judul}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 flex items-center gap-2">
                <span>Dipublikasikan: {selectedAnnouncement?.created_at ? new Date(selectedAnnouncement.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</span>
                <span>•</span>
                <span>Target: {selectedAnnouncement?.target || 'Semua Unit'}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="py-5 space-y-4">
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-900/50">
            <h5 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Isi Edaran / Pengumuman
            </h5>
            <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line font-medium">
              {selectedAnnouncement?.isi || 'Tidak ada isi edaran tertulis.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-[#151D2A] space-y-1">
              <span className="text-[10px] font-bold text-slate-400">Target Audiens:</span>
              <p className="font-extrabold text-slate-800 dark:text-white truncate">
                {selectedAnnouncement?.target || 'Semua Unit'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-[#151D2A] space-y-1">
              <span className="text-[10px] font-bold text-slate-400">Status Edaran:</span>
              <p className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Aktif & Berlaku
              </p>
            </div>
          </div>
        </DialogBody>

        <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <Button
            variant="ghost"
            appearance="outline"
            size="sm"
            onClick={() => setSelectedAnnouncement(null)}
            className="rounded-xl font-bold"
          >
            Tutup
          </Button>
        </DialogFooter>
      </Dialog>

      {/* TailGrids Dialog Modal Pop Up untuk Monitoring Kehadiran Siswa */}
      <Dialog
        isOpen={isAttendanceModalOpen}
        onOpenChange={setIsAttendanceModalOpen}
        className="max-w-4xl w-full p-6 border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#1B2433] rounded-2xl shadow-2xl"
      >
            <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <CheckCircle2 className="h-4.5 w-4.5" />
                </span>
                <div>
                  <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white">
                    Monitoring Kehadiran Siswa Lintas Unit Pendidikan
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                    Rekapitulasi dan pencarian presensi harian kesiswaan Divisi Pendidikan
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <DialogBody className="py-4 space-y-4">
              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    value={attendanceSearchTerm}
                    onChange={(e) => setAttendanceSearchTerm(e.target.value)}
                    placeholder="Cari nama siswa, NISN, atau kelas..."
                    className="w-full h-9.5 rounded-xl border border-slate-200 bg-slate-50/50 pl-3 pr-8 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-bold text-slate-400 shrink-0">Unit:</span>
                  <select
                    value={attendanceFilterUnit}
                    onChange={(e) => setAttendanceFilterUnit(e.target.value)}
                    className="h-9.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <option value="all">Semua Unit Pendidikan</option>
                    {unitsList.map((u) => (
                      <option key={u.id} value={u.name || u.nama}>
                        {u.name || u.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Data Table Presensi Siswa */}
              <div className="overflow-x-auto rounded-2xl border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#13221f]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gradient-to-r from-emerald-600 to-teal-600 font-extrabold text-white uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5 text-center w-16 text-white font-extrabold">Avatar</th>
                      <th className="px-4 py-3.5 text-white font-extrabold">Siswa & NISN</th>
                      <th className="px-4 py-3.5 text-white font-extrabold">Unit Pendidikan</th>
                      <th className="px-4 py-3.5 text-white font-extrabold">Kelas / Rombel</th>
                      <th className="px-4 py-3.5 text-white font-extrabold">Waktu Presensi</th>
                      <th className="px-4 py-3.5 text-white font-extrabold">Status</th>
                      <th className="px-4 py-3.5 text-white font-extrabold">Keterangan</th>
                      <th className="px-4 py-3.5 text-center text-white font-extrabold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredModalAttendanceList.length > 0 ? (
                      filteredModalAttendanceList.map((st, i) => {
                        const photo = st.avatar_url || st.photo_url || st.foto || st.avatar
                        const sName = st.nama || st.name || 'Siswa'
                        const sNisn = st.nisn || st.nis || '—'
                        const sUnit = st.unit_name || st.unit || schoolInfo.nama
                        const sKelas = st.kelas || st.rombel || '—'
                        const sStatus = st.status || 'Belum Presensi'
                        const sTime = st.waktu && st.waktu !== '—' ? st.waktu : '—'
                        const sKet = st.keterangan || (sStatus === 'Hadir' ? 'Hadir Tepat Waktu' : '—')

                        return (
                          <tr key={i} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 transition-colors">
                            <td className="px-4 py-3 text-center">
                              <Avatar size="sm" className="mx-auto ring-2 ring-emerald-500/20">
                                {photo && <AvatarImage src={photo} alt={sName} />}
                                <AvatarFallback className={st.gender === 'female' ? "bg-teal-100 text-teal-800 text-[10px] font-extrabold" : "bg-emerald-100 text-emerald-800 text-[10px] font-extrabold"}>
                                  {getInitials(sName)}
                                </AvatarFallback>
                              </Avatar>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <span className="font-extrabold text-slate-900 dark:text-white block">{sName}</span>
                                <span className="font-mono text-[10px] text-slate-400">NISN {sNisn}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">{sUnit}</td>
                            <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{sKelas}</td>
                            <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{sTime}</td>
                            <td className="px-4 py-3">
                              <AppBadge variant={sStatus === 'Hadir' ? 'success' : sStatus === 'Terlambat' ? 'warning' : sStatus === 'Izin' ? 'info' : (sStatus === 'Sakit' || sStatus === 'Alpha') ? 'danger' : 'neutral'}>
                                {sStatus}
                              </AppBadge>
                            </td>
                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{sKet}</td>
                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                title="Cetak Laporan Perkembangan Pekanan"
                                onClick={() => handlePrintWeekly(st)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:scale-105 active:scale-95 transition-all dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-2xs"
                              >
                                <Printer className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-slate-400 italic">
                          Tidak ada data presensi yang cocok dengan filter atau pencarian.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </DialogBody>

            <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <AppButton variant="secondary" size="sm" onClick={() => setIsAttendanceModalOpen(false)}>
                Tutup Window
              </AppButton>
            </DialogFooter>
          </Dialog>


      {/* Rekapitulasi Prestasi Siswa (Data Riil Database) */}
      <StudentAchievementRecapSection
        achievements={tables?.rekap_prestasi || data?.rekap_prestasi || data?.tables?.rekap_prestasi || []}
        title={`Rekapitulasi Prestasi Siswa ${schoolInfo.nama}`}
        subtitle="Daftar pencapaian Tahfizh Al-Qur’an, Santri Pesantren, Sepakbola/Olahraga, dan Lomba Akademik dari database backend"
        onRefresh={fetchDashboard}
      />

      {/* KPI Detail Modal */}
      <ModalErrorBoundary onClose={() => setActiveModal(null)}>
        <KpiQuickViewModal
          type={activeModal}
          isOpen={Boolean(activeModal)}
          onClose={() => setActiveModal(null)}
        />
      </ModalErrorBoundary>
      {/* TailGrids Dialog Modal Chat Direct Pegawai / Guru */}
      <Dialog
        isOpen={Boolean(activeChatUser)}
        onOpenChange={(open) => {
          if (!open) setActiveChatUser(null)
        }}
        className="max-w-xl w-full p-0 overflow-hidden border-2 border-emerald-500/30 bg-white dark:border-emerald-600/40 dark:bg-[#1B2433] rounded-[24px] shadow-2xl"
      >
        {/* Header Chat */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <Avatar size="lg" className="ring-2 ring-white/50">
                {(activeChatUser?.avatar_url || activeChatUser?.photo_url || activeChatUser?.foto || activeChatUser?.avatar) && (
                  <AvatarImage src={activeChatUser?.avatar_url || activeChatUser?.photo_url || activeChatUser?.foto || activeChatUser?.avatar} alt={activeChatUser?.nama} />
                )}
                <AvatarFallback className="bg-emerald-800 text-white font-black text-xs">
                  {getInitials(activeChatUser?.nama || activeChatUser?.name || 'User')}
                </AvatarFallback>
                <AvatarBadge status={activeChatUser?.is_online ? 'online' : 'offline'} size="lg" ping={Boolean(activeChatUser?.is_online)} live={Boolean(activeChatUser?.is_online)} />
              </Avatar>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black truncate text-white leading-snug">
                  {activeChatUser?.nama || activeChatUser?.name || 'Pegawai'}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${activeChatUser?.is_online ? 'bg-emerald-400/25 text-emerald-100 border border-emerald-300/40' : 'bg-white/15 text-white/80'}`}>
                  {activeChatUser?.is_online ? 'Online' : 'Offline'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/90 truncate">
                {activeChatUser?.role || activeChatUser?.jabatan || 'Pegawai / Guru'} • {activeChatUser?.dept || activeChatUser?.departemen || 'Unit Sekolah'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {activeChatUser?.phone && activeChatUser.phone !== '—' && (
              <a
                href={`https://wa.me/${String(activeChatUser.phone).replace(/\D/g, '').replace(/^0/, '62')}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Buka via WhatsApp"
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer"
              >
                <Phone className="h-4 w-4" />
              </a>
            )}
            <button
              type="button"
              onClick={() => setActiveChatUser(null)}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer font-black text-xs"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body Pesan */}
        <div className="p-4 h-80 overflow-y-auto bg-slate-50/60 dark:bg-[#151D2A] space-y-3 scrollbar-thin">
          {chatLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
              <RefreshCw className="h-5 w-5 animate-spin text-emerald-600" />
              <span className="text-xs font-bold">Memuat obrolan...</span>
            </div>
          ) : chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 mb-2">
                <MessageSquare className="h-6 w-6" />
              </div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">Mulai Obrolan Langsung</p>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                Kirimkan pesan koordinasi, instruksi, atau tanya jawab terkait aktivitas kesiswaan dan pengajaran.
              </p>
            </div>
          ) : (
            chatMessages.map((msg, mIdx) => {
              const isMe = msg.is_sender || msg.sender_id === currentAuthUser?.id
              return (
                <div key={msg.id || mIdx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs font-medium leading-relaxed shadow-2xs ${
                      isMe
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-[#1B2433] text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.message || msg.text || msg.body}</p>
                    <span className={`block text-[9px] mt-1 font-bold ${isMe ? 'text-emerald-100/70 text-right' : 'text-slate-400'}`}>
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Baru saja'}
                    </span>
                  </div>
                </div>
              )
            })
          )}
          <div ref={chatMessagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        <div className="px-4 py-2 bg-white dark:bg-[#1B2433] border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {["Assalamu'alaikum", 'Bisa koordinasi sebentar?', 'Mohon konfirmasi presensi hari ini'].map((quickTxt, qIdx) => (
            <button
              key={qIdx}
              type="button"
              onClick={() => setChatInputText(quickTxt)}
              className="shrink-0 text-[10.5px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 transition-all cursor-pointer"
            >
              {quickTxt}
            </button>
          ))}
        </div>

        {/* Form Input Chat */}
        <form onSubmit={handleSendChatMessage} className="p-3 bg-white dark:bg-[#1B2433] border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={chatInputText}
            onChange={(e) => setChatInputText(e.target.value)}
            placeholder={`Ketik pesan ke ${activeChatUser?.nama || 'rekan kerja'}...`}
            className="flex-1 h-10 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 transition-all"
            autoFocus
          />
          <button
            type="submit"
            disabled={!chatInputText.trim() || chatSending}
            className="flex h-10 px-4 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white text-xs font-black shadow-sm shadow-emerald-600/20 transition-all cursor-pointer active:scale-95 shrink-0"
          >
            {chatSending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span>Kirim</span>
          </button>
        </form>
      </Dialog>
      </motion.div>
    </PageContainer>
  )
}
