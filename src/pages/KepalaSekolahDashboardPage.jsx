import { Tooltip as HeroTooltip } from '@heroui/react'
import { Chip as HeroChip } from '../components/ui/badge'
import CustomSelect from "../components/ui/CustomSelect"
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { kepalaSekolahDashboardService } from '../services/kepalaSekolahDashboardService'
import { educationUnitService } from '../services/educationUnitService'
import HeroUiFilterSelect from '../components/ui/HeroUiFilterSelect'
import {
 Users,
 User,
 UserCheck,
 GraduationCap,
 School,
 Layers,
 CheckCircle2,
 Clock,
 AlertCircle,
 FileText,
 BookOpen,
 BookOpenCheck,
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
 FileSpreadsheet,
 Search,
 Filter,
 ChevronDown,
 ChevronUp,
 Briefcase,
 TrendingUp,
 Scale,
 X,
} from 'lucide-react'
import PrincipalDisciplineOverviewSection from '../components/discipline/PrincipalDisciplineOverviewSection'
import InputLaporanBulananModal from '../components/pemantauan/InputLaporanBulananModal'
import { printWeeklyStudentEvaluation, resolveFoundationName } from '../utils/printHelper'
import { useAuthStore } from '../stores/authStore'
import { usePengaturanStore } from '../stores/pengaturanStore'
import { familyPortalService } from '../services/familyPortalService'
import {
 Avatar,
 AvatarImage,
 AvatarFallback,
 AvatarBadge,
 AvatarGroup,
} from '@/components/ui/avatar'
import {
 HoverCard,
 HoverCardContent,
 HoverCardTrigger,
} from '@/components/ui/hover-card'
import {
 OverlayWrapper,
 Backdrop,
} from '@/components/ui/dialog'
import {
 Dialog,
 DialogHeader,
 DialogTitle,
 DialogDescription,
 DialogBody,
 DialogFooter,
 DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { List } from '@/components/ui/list'
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
import { QuickAccessCard } from '../components/master-data'

import ChartCard from '../components/dashboard/ChartCard'
import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'
import StudentAchievementRecapSection from '../components/dashboard/StudentAchievementRecapSection'
import KpiQuickViewModal from '../components/KpiQuickViewModal'
import ModalErrorBoundary from '../components/common/ModalErrorBoundary'
import { motion, AnimatePresence } from 'framer-motion'

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

// ── SUB-KOMPONEN MODERN KPI & SUMMARY CARDS (Spesifikasi HEROUI_ALUMNI_MUTASI_CARDS) ──
const MODERN_CARD_TONES = {
  emerald: {
    card: 'rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-gradient-to-b from-[#E6F8F3] via-[#E6F8F3]/30 to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-emerald-400',
    topBar: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600',
    glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
    iconBox: '!bg-emerald-600 !text-white shadow-xs rounded-xl',
    tag: 'bg-[#D1FAE5] text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    title: 'text-emerald-800 dark:text-emerald-300',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-emerald-700 dark:text-emerald-400 font-bold',
    cta: 'text-emerald-700 dark:text-emerald-400 font-bold',
  },
  blue: {
    card: 'rounded-[22px] border-2 border-sky-300 dark:border-sky-700/80 bg-gradient-to-b from-[#E0F2FE]/70 via-[#E0F2FE]/20 to-white dark:from-sky-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-sky-400',
    topBar: 'bg-gradient-to-r from-sky-500 via-blue-400 to-indigo-600',
    glow: 'bg-sky-400/20 group-hover:bg-sky-400/30',
    iconBox: '!bg-sky-600 !text-white shadow-xs rounded-xl',
    tag: 'bg-[#E0F2FE] text-sky-900 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    title: 'text-sky-800 dark:text-sky-300',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-sky-700 dark:text-sky-400 font-bold',
    cta: 'text-sky-700 dark:text-sky-400 font-bold',
  },
  amber: {
    card: 'rounded-[22px] border-2 border-amber-300 dark:border-amber-700/80 bg-gradient-to-b from-[#FEF3C7]/70 via-[#FEF3C7]/20 to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-amber-400',
    topBar: 'bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600',
    glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
    iconBox: '!bg-amber-600 !text-white shadow-xs rounded-xl',
    tag: 'bg-[#FEF3C7] text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    title: 'text-amber-800 dark:text-amber-300',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-amber-700 dark:text-amber-400 font-bold',
    cta: 'text-amber-700 dark:text-amber-400 font-bold',
  },
  rose: {
    card: 'rounded-[22px] border-2 border-rose-300 dark:border-rose-700/80 bg-gradient-to-b from-[#FFE4E6]/70 via-[#FFE4E6]/20 to-white dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-rose-400',
    topBar: 'bg-gradient-to-r from-rose-500 via-red-400 to-rose-600',
    glow: 'bg-rose-400/20 group-hover:bg-rose-400/30',
    iconBox: '!bg-rose-600 !text-white shadow-xs rounded-xl',
    tag: 'bg-[#FFE4E6] text-rose-900 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    title: 'text-rose-800 dark:text-rose-300',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-rose-700 dark:text-rose-400 font-bold',
    cta: 'text-rose-700 dark:text-rose-400 font-bold',
  },
  purple: {
    card: 'rounded-[22px] border-2 border-purple-300 dark:border-purple-700/80 bg-gradient-to-b from-[#F3E8FF]/70 via-[#F3E8FF]/20 to-white dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-purple-400',
    topBar: 'bg-gradient-to-r from-purple-500 via-violet-400 to-indigo-600',
    glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
    iconBox: '!bg-purple-600 !text-white shadow-xs rounded-xl',
    tag: 'bg-[#F3E8FF] text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    title: 'text-purple-800 dark:text-purple-300',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-purple-700 dark:text-purple-400 font-bold',
    cta: 'text-purple-700 dark:text-purple-400 font-bold',
  },
  indigo: {
    card: 'rounded-[22px] border-2 border-indigo-300 dark:border-indigo-700/80 bg-gradient-to-b from-[#E0E7FF]/70 via-[#E0E7FF]/20 to-white dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-indigo-400',
    topBar: 'bg-gradient-to-r from-indigo-500 via-blue-400 to-indigo-600',
    glow: 'bg-indigo-400/20 group-hover:bg-indigo-400/30',
    iconBox: '!bg-indigo-600 !text-white shadow-xs rounded-xl',
    tag: 'bg-[#E0E7FF] text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    title: 'text-indigo-800 dark:text-indigo-300',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-indigo-700 dark:text-indigo-400 font-bold',
    cta: 'text-indigo-700 dark:text-indigo-400 font-bold',
  },
}

function ModernKpiCard({ icon: Icon, title, value, subtext, tag, tone = 'emerald', active = false, onClick }) {
 const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
 const isClickable = typeof onClick === 'function'

 return (
 <div
 onClick={onClick}
 role={isClickable ? 'button' : undefined}
 tabIndex={isClickable ? 0 : undefined}
 onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
 className={`group relative overflow-hidden rounded-[22px] shadow-sm transition-all duration-200 flex flex-col justify-between ${
 active ? 'ring-2 ring-emerald-500/70 border-emerald-500 shadow-md' : ''
 } ${
 isClickable ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : ''
 } ${t.card}`}
 >
 {/* Top Accent Gradient Stripe */}
 <div className={`h-1.5 w-full ${t.topBar} shrink-0`} />

 <div className="p-5 flex-1 flex flex-col justify-between relative">
 {/* Ambient Glow */}

 {/* Content Container */}
 <div>
 {/* Row 1: Squircle Icon Badge on left & Pill Tag on right */}
 <div className="flex items-center justify-between gap-2 mb-3">
 <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-emerald-600 shadow-md shadow-sm ${t.iconBox}`}>
 <Icon className="size-5.5" strokeWidth={2.2} />
 </div>
 {tag && (
 <span className={`rounded-xl px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shrink-0 ${t.tag}`}>
 {tag}
 </span>
 )}
 </div>

 {/* Row 2: Title */}
 <p className={`text-xs font-black uppercase tracking-wider ${t.title}`}>{title}</p>

 {/* Row 3: Metric Value */}
 <p className={`mt-1 text-3xl sm:text-4xl font-black tabular-nums tracking-tight ${t.val}`}>
 {value ?? '0'}
 </p>

 {/* Row 4: Subtext */}
 {subtext && (
 <p className={`mt-1.5 text-xs font-bold leading-relaxed ${t.sub}`}>
 {subtext}
 </p>
 )}
 </div>

 {/* Click Affordance Footer */}
 {isClickable && (
 <div className={`mt-3.5 pt-2.5 border-t border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between text-[10.5px] font-black ${t.cta}`}>
 <span className="flex items-center gap-1.5">
 <Eye className="size-3.5" />
 {active ? 'Sedang Dipilih' : 'Tampilkan Monitoring'}
 </span>
 <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
 </div>
 )}
 </div>
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
 className={`group relative overflow-hidden rounded-2xl border-2 p-4.5 shadow-sm transition-all duration-200 ${
 isClickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
 } ${t.card}`}
 >

 <div className="flex items-center justify-between mb-2.5">
 <div className={`flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl text-emerald-600 shadow-xs ${t.iconBox}`}>
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
 const currentAuthUser = useAuthStore((state) => state.user)
 const pengaturan = usePengaturanStore((state) => state.pengaturan)
 const foundationName = resolveFoundationName(pengaturan)
 const defaultUserUnit = currentAuthUser?.unit_id || currentAuthUser?.education_unit_id || currentAuthUser?.employee?.unit_id || currentAuthUser?.metadata?.education_unit_id || currentAuthUser?.metadata?.unit_id || ''
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(null)
 const [data, setData] = useState(null)
 const [selectedUnitId, setSelectedUnitId] = useState(() => defaultUserUnit ? String(defaultUserUnit) : '')
 const [activeModal, setActiveModal] = useState(null)
 const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false)
 const [attendanceFilterUnit, setAttendanceFilterUnit] = useState('all')
 const [attendanceSearchTerm, setAttendanceSearchTerm] = useState('')
 const [onlineFilter, setOnlineFilter] = useState('all')
 const [trendScheduleMode, setTrendScheduleMode] = useState('auto')
 const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)
 const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('all')
 const [selectedAttendanceDate, setSelectedAttendanceDate] = useState('')
 const [isReportModalOpen, setIsReportModalOpen] = useState(false)
 const [activityPeriodFilter, setActivityPeriodFilter] = useState('all')
 const [kbmSessionFilter, setKbmSessionFilter] = useState('all')
 const [kbmDayFilter, setKbmDayFilter] = useState('today')
 const [selectedKbmSession, setSelectedKbmSession] = useState(null)
 const [monitoringPillar, setMonitoringPillar] = useState('guru') // 'guru' | 'tendik' | 'siswa'
 const [monitoringSearch, setMonitoringSearch] = useState('')
 const [guruSubFilter, setGuruSubFilter] = useState('all') // 'all' | 'teaching' | 'online' | 'offline'
 const [tendikSubFilter, setTendikSubFilter] = useState('all') // 'all' | 'online' | 'offline'
 const [guruViewMode, setGuruViewMode] = useState('cards') // 'cards' | 'sessions'
 const [showYayasanProfile, setShowYayasanProfile] = useState(false)

 const handlePrintWeekly = (st) => {
 const sName = st?.nama || st?.name || st?.full_name || 'Shezakia Mufidah Alfirdausi'
 const sNisn = st?.nisn || st?.nis || '-'
 const sKelas = st?.kelas || st?.rombel || st?.school_class?.name || '10 Madinah 1'
 const sUnit = st?.unit_name || st?.unit || schoolInfo?.nama || 'Unit Sekolah'
 const sWali = st?.nama_ortu || st?.wali || 'Wali Santri'
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
 unit: sUnit,
 unitName: sUnit,
 education_unit: eduUnit,
 },
 period: {
 title: 'Pekan Berjalan',
 academicYear: schoolInfo?.tahun_ajaran || '2026/2027',
 },
 homeroomTeacher: {
 name: sWali || 'Wali Kelas',
 },
 guruWali: {
 name: sWali,
 },
 schoolCity: eduUnit?.metadata?.city || 'Padang',
 })
 }

 // State Modal Chat Direct Real-Time
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
 if (!selectedUnitId && payload?.context?.unit?.id) {
 setSelectedUnitId(String(payload.context.unit.id))
 }
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
 const cleaned = String(name).replace(/^\[[^\]]+\]\s*/, '').replace(/^\([^)]+\)\s*/, '').trim()
 const parts = cleaned.split(/\s+/).filter(Boolean)
 if (parts.length >= 2) {
 const c1 = parts[0].replace(/[^a-zA-Z0-9]/g, '')[0] || 'U'
 const c2 = parts[1].replace(/[^a-zA-Z0-9]/g, '')[0] || ''
 return `${c1}${c2}`.toUpperCase()
 }
 const cleanChars = cleaned.replace(/[^a-zA-Z0-9]/g, '')
 return (cleanChars.slice(0, 2) || 'U').toUpperCase()
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

 const hadirCount = studentAttendanceList.filter((s) => s?.status === 'Hadir').length
 const terlambatCount = studentAttendanceList.filter((s) => s?.status === 'Terlambat').length
 const izinCount = studentAttendanceList.filter((s) => s?.status === 'Izin').length
 const sakitCount = studentAttendanceList.filter((s) => s?.status === 'Sakit').length
 const alphaCount = studentAttendanceList.filter((s) => s?.status === 'Alpha').length
 const noActivityCount = studentAttendanceList.filter((s) => {
 const st = String(s?.status || '')
 return st.includes('Libur') || st.includes('Belum')
 }).length

 const filteredCardStudentList = attendanceStatusFilter === 'all'
 ? studentAttendanceList
 : attendanceStatusFilter === 'inactive'
 ? studentAttendanceList.filter((s) => {
 const st = String(s?.status || '')
 return st.includes('Libur') || st.includes('Belum')
 })
 : studentAttendanceList.filter((s) => s?.status === attendanceStatusFilter)

 const filteredModalAttendanceList = studentAttendanceList.filter((st) => {
 const sName = String(st?.nama || st?.name || '').toLowerCase()
 const sNisn = String(st?.nisn || st?.nis || '').toLowerCase()
 const sKelas = String(st?.kelas?.nama_kelas || (typeof st?.kelas === 'string' ? st?.kelas : st?.rombel) || '').toLowerCase()
 const sUnit = String(st?.unit_name || (typeof st?.unit === 'string' ? st?.unit : st?.unit?.name) || '').toLowerCase()
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

 const activeTrendMode = unitScheduleType
 const attendanceTrendChartData = activeTrendMode === 'pesantren' ? pesantrenTrend : fulldayTrend

 const announcementRaw = tables?.announcements || data?.announcements || data?.recent_announcements
 const announcementList = Array.isArray(announcementRaw) ? announcementRaw : DEFAULT_ANNOUNCEMENTS

 const todaySessions = Array.isArray(data?.today_sessions)
 ? data.today_sessions
 : (Array.isArray(data?.teaching_sessions) ? data.teaching_sessions : (Array.isArray(data?.kbm?.sessions) ? data.kbm.sessions : []))

 const todayDayOfWeek = React.useMemo(() => {
 const d = new Date().getDay()
 return d === 0 ? 7 : d
 }, [])

 const dayNamesMap = React.useMemo(() => ({
 1: 'Senin',
 2: 'Selasa',
 3: 'Rabu',
 4: 'Kamis',
 5: 'Jumat',
 6: 'Sabtu',
 7: 'Minggu',
 }), [])

 const todayDayName = dayNamesMap[todayDayOfWeek] || 'Hari Ini'

 const filteredActivityLogs = React.useMemo(() => {
  if (!onlineLogs || !Array.isArray(onlineLogs)) return []
  if (activityPeriodFilter === 'all') return onlineLogs
  const now = new Date()
  return onlineLogs.filter((log) => {
   let d = null
   if (log.timestamp) {
     d = new Date(Number(log.timestamp))
   } else if (log.created_at) {
     d = new Date(log.created_at)
   } else if (log.time || log.date) {
     const str = String(log.time || log.date).toLowerCase()
     if (str.includes('menit') || str.includes('detik') || str.includes('jam') || str.includes('baru saja')) {
       return true
     }
     const daysMatch = str.match(/(\d+)\s*hari/)
     if (daysMatch) {
       const days = parseInt(daysMatch[1], 10)
       if (activityPeriodFilter === 'today') return days < 1
       if (activityPeriodFilter === 'week') return days <= 7
       if (activityPeriodFilter === 'month') return days <= 30
       if (activityPeriodFilter === 'semester') return days <= 180
       return true
     }
     d = new Date(str)
   }
   if (!d || isNaN(d.getTime())) return true
   const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
   if (activityPeriodFilter === 'today') return diffDays <= 1
   if (activityPeriodFilter === 'week') return diffDays <= 7
   if (activityPeriodFilter === 'month') return diffDays <= 30
   if (activityPeriodFilter === 'semester') return diffDays <= 180
   return true
  })
 }, [onlineLogs, activityPeriodFilter])

 const filteredByDaySessions = React.useMemo(() => {
 if (kbmDayFilter === 'all') return todaySessions
 const targetDay = kbmDayFilter === 'today' ? todayDayOfWeek : Number(kbmDayFilter)
 return todaySessions.filter((sess) => {
 if (sess.day_of_week === undefined || sess.day_of_week === null) return true
 return Number(sess.day_of_week) === targetDay
 })
 }, [todaySessions, kbmDayFilter, todayDayOfWeek])

 const filteredSessions = React.useMemo(() => {
 return filteredByDaySessions.filter((sess) => {
 if (kbmSessionFilter === 'all') return true
 if (kbmSessionFilter === 'ongoing') return sess.is_ongoing
 if (kbmSessionFilter === 'completed') return sess.status === 'completed'
 if (kbmSessionFilter === 'scheduled') return sess.status === 'scheduled' && !sess.is_ongoing
 return true
 })
 }, [filteredByDaySessions, kbmSessionFilter])

 const isUserGuru = React.useCallback((u) => {
 const role = String(u.role || u.jabatan || u.position || '').toLowerCase()
 return (
 role.includes('guru') ||
 role.includes('pendidik') ||
 role.includes('pengajar') ||
 role.includes('wali') ||
 role.includes('ustadz') ||
 role.includes('musyrif') ||
 role.includes('tahfizh')
 )
 }, [])

 const guruList = React.useMemo(() => {
 return onlineUsers.filter(isUserGuru)
 }, [onlineUsers, isUserGuru])

 const tendikList = React.useMemo(() => {
 return onlineUsers.filter((u) => !isUserGuru(u))
 }, [onlineUsers, isUserGuru])

 const teachingNowMap = React.useMemo(() => {
 const map = new Map()
 todaySessions.forEach((sess) => {
 const tName = String(sess.teacher_name || sess.guru || '').trim().toLowerCase()
 if (tName) {
 map.set(tName, sess)
 }
 })
 return map
 }, [todaySessions])

 const guruMengajarCount = React.useMemo(() => {
 return todaySessions.filter((s) => s.is_ongoing).length
 }, [todaySessions])

 const guruOnlineCount = React.useMemo(() => {
 return guruList.filter((u) => u.is_online).length
 }, [guruList])

 const guruOfflineCount = React.useMemo(() => {
 return guruList.filter((u) => !u.is_online).length
 }, [guruList])

 const tendikOnlineCount = React.useMemo(() => {
 return tendikList.filter((u) => u.is_online).length
 }, [tendikList])

 const tendikOfflineCount = React.useMemo(() => {
 return tendikList.filter((u) => !u.is_online).length
 }, [tendikList])

 const filteredGuruList = React.useMemo(() => {
 let list = guruList
 const q = monitoringSearch.trim().toLowerCase()
 if (q) {
 list = list.filter((u) => {
 const name = String(u.nama || u.name || '').toLowerCase()
 const nip = String(u.nip || '').toLowerCase()
 const role = String(u.role || '').toLowerCase()
 return name.includes(q) || nip.includes(q) || role.includes(q)
 })
 }
 if (guruSubFilter === 'teaching') {
 list = list.filter((u) => {
 const sess = teachingNowMap.get(String(u.nama || u.name || '').trim().toLowerCase())
 return sess && sess.is_ongoing
 })
 } else if (guruSubFilter === 'online') {
 list = list.filter((u) => u.is_online)
 } else if (guruSubFilter === 'offline') {
 list = list.filter((u) => !u.is_online)
 }
 return list
 }, [guruList, monitoringSearch, guruSubFilter, teachingNowMap])

 const filteredTendikList = React.useMemo(() => {
 let list = tendikList
 const q = monitoringSearch.trim().toLowerCase()
 if (q) {
 list = list.filter((u) => {
 const name = String(u.nama || u.name || '').toLowerCase()
 const nip = String(u.nip || '').toLowerCase()
 const role = String(u.role || '').toLowerCase()
 return name.includes(q) || nip.includes(q) || role.includes(q)
 })
 }
 if (tendikSubFilter === 'online') {
 list = list.filter((u) => u.is_online)
 } else if (tendikSubFilter === 'offline') {
 list = list.filter((u) => !u.is_online)
 }
 return list
 }, [tendikList, monitoringSearch, tendikSubFilter])

 const filteredMonitoringStudents = React.useMemo(() => {
 let list = studentAttendanceList
 const q = monitoringSearch.trim().toLowerCase()
 if (q) {
 list = list.filter((s) => {
 const name = String(s.nama || s.name || '').toLowerCase()
 const nisn = String(s.nisn || s.nis || '').toLowerCase()
 const kelas = String(s.kelas || s.rombel || '').toLowerCase()
 return name.includes(q) || nisn.includes(q) || kelas.includes(q)
 })
 }
 if (attendanceStatusFilter !== 'all') {
 if (attendanceStatusFilter === 'inactive') {
 list = list.filter((s) => {
 const st = String(s?.status || '')
 return st.includes('Libur') || st.includes('Belum')
 })
 } else {
 list = list.filter((s) => s.status === attendanceStatusFilter)
 }
 }
 return list
 }, [studentAttendanceList, monitoringSearch, attendanceStatusFilter])

 if (loading && !data) return <SkeletonDashboard />
 if (error && !data) return <ErrorState message={error} onRetry={fetchDashboard} />

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

 {/* Row Utama Header: Identitas Judul & Filter Unit */}
 <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 pb-5 border-b border-emerald-500/20 dark:border-emerald-800/40">
 {/* Sisi Kiri: Icon Badge, Judul, Pill Peran, dan Subtitle */}
 <div className="flex items-start sm:items-center gap-4 min-w-0">
              <div className="flex size-13 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20 border-0">
                <School className="size-6 sm:size-7 text-white" strokeWidth={2.2} />
 </div>
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-2.5 flex-wrap">
 <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
 Dashboard Kepala Sekolah
 </h1>
 <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3.5 py-1 text-xs font-extrabold shadow-xs border-0">
 <ShieldCheck className="h-3.5 w-3.5" />
 Pusat Kendali Satuan Pendidikan
 </span>
 <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1 text-xs font-black text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60">
 <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
 {schoolInfo.status || 'Operasional Aktif'}
 </span>
 </div>
 <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-xl leading-relaxed">
 Pusat kendali dan supervisi terpadu {schoolInfo.nama ? <span className="font-bold text-slate-900 dark:text-white">{schoolInfo.nama}</span> : 'satuan pendidikan'}: monitoring harian KBM guru, kehadiran presensi santri &amp; tendik, serta evaluasi capaian kurikulum unit.
 </p>

 {/* Sub-baris: Pill Identitas NPSN, Kode Unit, Akreditasi */}
 <div className="mt-2.5 flex items-center gap-2 flex-wrap text-xs">
 <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/80 dark:bg-emerald-950/60 px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 border border-emerald-500/25 dark:border-emerald-800/40 shadow-2xs">
 <Building2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
 <span>Unit: <strong className="text-slate-900 dark:text-white font-extrabold">{schoolInfo.nama || 'Unit Pendidikan'}</strong></span>
 </span>
 <span className="inline-flex items-center gap-1 rounded-lg bg-white/80 dark:bg-emerald-950/60 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs">
 NPSN: <strong className="text-slate-900 dark:text-white font-extrabold">{schoolInfo.npsn || '—'}</strong>
 </span>
 <span className="inline-flex items-center gap-1 rounded-lg bg-white/80 dark:bg-emerald-950/60 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs">
 Kode: <strong className="text-slate-900 dark:text-white font-extrabold">{schoolInfo.kode || '—'}</strong>
 </span>
 <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50/90 dark:bg-amber-950/70 px-2.5 py-1 text-xs font-bold text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-800/60 shadow-2xs">
 <Award className="size-3 text-amber-600 dark:text-amber-400" />
 <span>Akreditasi: <strong className="font-extrabold">{schoolInfo.akreditasi || '—'}</strong></span>
 </span>
 </div>
 </div>
 </div>

 {/* Sisi Kanan: Tahun Ajaran, Semester & Pilihan Unit */}
 <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2.5 shrink-0 z-10">
 <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-white dark:bg-card-dark px-3.5 py-1.5 text-xs font-black text-emerald-950 dark:border-emerald-700 dark:bg-card-dark dark:text-emerald-200 shadow-2xs">
 <Calendar className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
 <span>T.A. {schoolInfo.tahun_ajaran || '2026/2027'} • {schoolInfo.semester || 'Semester Ganjil'}</span>
 </div>
 {unitsList.length > 0 && (
 <div className="w-full sm:w-[240px]">
 <HeroUiFilterSelect
 size="sm"
 value={String(selectedUnitId || context.unit?.id || '')}
 onChange={(val) => {
 setSelectedUnitId(val)
 fetchDashboard(val)
 }}
 placeholder="-- Ganti Unit Sekolah --"
 ariaLabel="Pilih Unit Sekolah"
 options={[
 { value: '', label: '-- Pilih Unit Sekolah --' },
 ...unitsList.map((u) => ({
 value: String(u.id),
 label: `${u.code} - ${u.name}`,
 })),
 ]}
 />
 </div>
 )}
 </div>
 </div>

 {/* Baris Informasi Alamat, Pimpinan, dan Kontak Resepsionis */}
 <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 text-xs text-slate-700 dark:text-slate-300">
 <div className="flex items-center gap-3 p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-emerald-500/20 dark:border-emerald-800/40 shadow-2xs backdrop-blur-sm">
 <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40">
 <MapPin className="size-4" />
 </div>
 <div className="min-w-0 flex-1">
 <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 dark:text-slate-400 block">
 Lokasi &amp; Alamat Unit
 </span>
 <span className="font-bold text-slate-900 dark:text-slate-100 truncate block text-xs" title={schoolInfo.alamat}>
 {schoolInfo.alamat && schoolInfo.alamat !== '—' ? schoolInfo.alamat : 'Padang, Sumatera Barat'}
 </span>
 </div>
 </div>

 <div className="flex items-center gap-3 p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-emerald-500/20 dark:border-emerald-800/40 shadow-2xs backdrop-blur-sm">
 <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-300/40">
 <UserCheck className="size-4" />
 </div>
 <div className="min-w-0 flex-1">
 <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 dark:text-slate-400 block">
 Kepala Sekolah Unit
 </span>
 <span className="font-bold text-slate-900 dark:text-slate-100 truncate block text-xs" title={schoolInfo.kepala_sekolah}>
 {schoolInfo.kepala_sekolah && schoolInfo.kepala_sekolah !== '—' ? schoolInfo.kepala_sekolah : 'Pimpinan Satuan Pendidikan'}
 </span>
 </div>
 </div>

 <div className="flex items-center gap-3 p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-emerald-500/20 dark:border-emerald-800/40 shadow-2xs backdrop-blur-sm">
 <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300/40">
 <Phone className="size-4" />
 </div>
 <div className="min-w-0 flex-1">
 <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 dark:text-slate-400 block">
 Kontak Resepsionis / Admin
 </span>
 <span className="font-bold text-slate-900 dark:text-slate-100 truncate block text-xs" title={schoolInfo.kontak}>
 {schoolInfo.kontak && schoolInfo.kontak !== '—' && schoolInfo.kontak !== '-' ? schoolInfo.kontak : 'Hubungi Bagian Tata Usaha'}
 </span>
 </div>
 </div>
 </div>
 </motion.div>

 {/* ── 1. MASTER UNIT KPIS (HERO UI 4-CARD SPECIFICATION) ── */}
 <section className="space-y-3">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
 <div>
 <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
 <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
 <Sparkles className="h-3.5 w-3.5" />
 </span>
 Metrik & Indikator Utama Unit Sekolah
 </h2>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Statistik real-time siswa, guru, tenaga kependidikan, dan rombongan belajar aktif
 </p>
 </div>
 <span className="text-xs font-bold text-slate-400">
 Klik kartu untuk memfilter monitoring di bawah
 </span>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <ModernKpiCard
 title="Total Siswa Aktif"
 value={formatNumber(kpis.total_siswa?.total)}
 subtext={
 studentAttendanceList.length > 0
 ? `Kehadiran: ${hadirCount} Hadir (${Math.round((hadirCount / Math.max(1, studentAttendanceList.length)) * 100)}%) • ${izinCount + sakitCount} Izin/Sakit`
 : 'Data kesiswaan unit terdaftar aktif'
 }
 icon={Users}
 tone="emerald"
 tag="Siswa Unit"
 active={monitoringPillar === 'siswa'}
 onClick={() => setMonitoringPillar('siswa')}
 />
 <ModernKpiCard
 title="Guru & Pendidik"
 value={formatNumber(kpis.total_guru?.total)}
 subtext={`${guruMengajarCount} Guru Sedang KBM • ${todaySessions.length} Sesi Terjadwal`}
 icon={GraduationCap}
 tone="blue"
 tag="Tenaga Pendidik"
 active={monitoringPillar === 'guru'}
 onClick={() => setMonitoringPillar('guru')}
 />
 <ModernKpiCard
 title="Tendik & Staf"
 value={formatNumber(kpis.total_tendik?.total ?? Math.max(0, (kpis.total_pegawai?.total || 0) - (kpis.total_guru?.total || 0)))}
 subtext={`${tendikOnlineCount} Staf Online • Administrasi, TU & Operasional`}
 icon={UserCheck}
 tone="purple"
 tag="Tenaga Kependidikan"
 active={monitoringPillar === 'tendik'}
 onClick={() => setMonitoringPillar('tendik')}
 />
 <ModernKpiCard
 title="Rombel & Quranic Tahfizh"
 value={formatNumber(kpis.total_rombel?.total || kpis.total_kelas?.total)}
 subtext={`${formatNumber(kpis.setoran_tahfizh_hari_ini?.total)} Setoran Hafalan Qur'an Hari Ini`}
 icon={BookOpen}
 tone="amber"
 tag="Akademik & Quran"
 onClick={() => setActiveModal('total_kelas')}
 />
 </div>
 </section>

 {/* ── 2. PUSAT KENDALI & MONITORING TERPADU (GURU, TENDIK, SISWA) ── */}
 <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 space-y-5 dark:bg-card-dark">
 {/* Ambient Glows */}

 {/* Header Toolbar & Segmented Tabs */}
 <div className="relative z-10 flex flex-col gap-3 pb-4 border-b border-emerald-500/20 dark:border-emerald-800/40">
 <div className="flex items-center gap-3">
 <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border-2 border-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-700/80 dark:text-emerald-300 shadow-sm">
 <Activity className="h-5 w-5 animate-pulse" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                Pusat Monitoring Terpadu Unit
              </h3>
 <span className="relative flex h-2.5 w-2.5">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
 <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
 </span>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Pantau langsung aktivitas Guru di kelas, kehadiran Tenaga Kependidikan (Tendik), dan presensi kesiswaan secara terpadu.
 </p>
 </div>
 </div>

 {/* Segmented 4-Pillar Switcher - Pindah ke Bawah Tulisan */}
 <div className="flex items-center p-1.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 self-start shrink-0 shadow-2xs overflow-x-auto max-w-full">
 <button
 type="button"
 onClick={() => {
 setMonitoringPillar('guru')
 setMonitoringSearch('')
 }}
 className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
 monitoringPillar === 'guru'
 ? 'bg-white dark:bg-card-dark shadow-md shadow-sm'
 : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
 }`}
 >
 <GraduationCap className="h-4 w-4" />
 <span>Monitoring Guru</span>
 <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-extrabold ${monitoringPillar === 'guru' ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
 {guruList.length}
 </span>
 </button>

 <button
 type="button"
 onClick={() => {
 setMonitoringPillar('tendik')
 setMonitoringSearch('')
 }}
 className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
 monitoringPillar === 'tendik'
 ? 'bg-white dark:bg-card-dark shadow-md shadow-sm'
 : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
 }`}
 >
 <UserCheck className="h-4 w-4" />
 <span>Monitoring Tendik</span>
 <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-extrabold ${monitoringPillar === 'tendik' ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
 {tendikList.length}
 </span>
 </button>

 <button
 type="button"
 onClick={() => {
 setMonitoringPillar('siswa')
 setMonitoringSearch('')
 }}
 className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
 monitoringPillar === 'siswa'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40'
 }`}
 >
 <Users className="h-4 w-4" />
 <span>Monitoring Siswa</span>
 <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-extrabold ${monitoringPillar === 'siswa' ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
 {studentAttendanceList.length}
 </span>
 </button>

 <button
 type="button"
 onClick={() => {
 setMonitoringPillar('kedisiplinan')
 setMonitoringSearch('')
 }}
 className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
 monitoringPillar === 'kedisiplinan'
 ? 'bg-white dark:bg-card-dark shadow-md shadow-sm'
 : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
 }`}
 >
 <Scale className="h-4 w-4" />
 <span>Radar Disiplin & SP</span>
 </button>
 </div>
 </div>

 {/* Sub-Toolbar: Search Bar & Contextual Filter Pills */}
 <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
 {/* Universal Search Input */}
 <div className="relative flex-1 min-w-[240px] max-w-md">
 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
 <input
 type="text"
 value={monitoringSearch}
 onChange={(e) => setMonitoringSearch(e.target.value)}
 placeholder={
 monitoringPillar === 'guru'
 ? 'Cari nama guru, NIP/NIY, mata pelajaran...'
 : monitoringPillar === 'tendik'
 ? 'Cari nama staf, jabatan, bagian...'
 : 'Cari nama siswa, NISN, rombel/kelas...'
 }
 className="h-9 w-full rounded-xl border-2 border-[#b6f6d9] bg-emerald-50/30 pl-9.5 pr-4 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800/60 dark:bg-card-dark dark:text-slate-100 transition-all"
 />
 {monitoringSearch && (
 <button
 type="button"
 onClick={() => setMonitoringSearch('')}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
 >
 ✕
 </button>
 )}
 </div>

 {/* Sub-Filters specific to Active Pillar */}
 {monitoringPillar === 'guru' && (
 <div className="flex flex-wrap items-center gap-1.5 text-xs">
 <div className="flex items-center gap-1 bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 p-1 rounded-xl text-xs font-extrabold">
 <button
 type="button"
 onClick={() => setGuruSubFilter('all')}
 className={`px-2.5 py-1 rounded-lg transition-all ${guruSubFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-black' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}
 >
 Semua ({guruList.length})
 </button>
 <button
 type="button"
 onClick={() => setGuruSubFilter('teaching')}
 className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${guruSubFilter === 'teaching' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'}`}
 >
 <BookOpen className="h-3 w-3" />
 Sedang Mengajar ({guruMengajarCount})
 </button>
 <button
 type="button"
 onClick={() => setGuruSubFilter('online')}
 className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${guruSubFilter === 'online' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'}`}
 >
 <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
 Online ({guruOnlineCount})
 </button>
 <button
 type="button"
 onClick={() => setGuruSubFilter('offline')}
 className={`px-2.5 py-1 rounded-lg transition-all ${guruSubFilter === 'offline' ? 'bg-slate-600 text-white shadow-xs font-black' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}
 >
 Offline ({guruOfflineCount})
 </button>
 </div>

 {/* View Switcher: Cards vs KBM Sessions */}
 <div className="flex items-center gap-1 bg-blue-50/70 dark:bg-blue-950/40 p-1 rounded-xl text-xs font-extrabold border border-blue-200/60 dark:border-blue-900/60">
 <button
 type="button"
 onClick={() => setGuruViewMode('cards')}
 className={`px-2.5 py-1 rounded-lg transition-all ${guruViewMode === 'cards' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-emerald-700 dark:text-emerald-300'}`}
 >
 Profil Guru
 </button>
 <button
 type="button"
 onClick={() => setGuruViewMode('sessions')}
 className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${guruViewMode === 'sessions' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-emerald-700 dark:text-emerald-300'}`}
 >
 <Clock className="h-3 w-3" />
 Sesi KBM ({todaySessions.length})
 </button>
 </div>
 </div>
 )}

 {monitoringPillar === 'tendik' && (
 <div className="flex items-center gap-1 bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 p-1 rounded-xl text-xs font-extrabold">
 <button
 type="button"
 onClick={() => setTendikSubFilter('all')}
 className={`px-2.5 py-1 rounded-lg transition-all ${tendikSubFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-black' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}
 >
 Semua ({tendikList.length})
 </button>
 <button
 type="button"
 onClick={() => setTendikSubFilter('online')}
 className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${tendikSubFilter === 'online' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'}`}
 >
 <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
 Online / Bertugas ({tendikOnlineCount})
 </button>
 <button
 type="button"
 onClick={() => setTendikSubFilter('offline')}
 className={`px-2.5 py-1 rounded-lg transition-all ${tendikSubFilter === 'offline' ? 'bg-slate-600 text-white shadow-xs font-black' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}
 >
 Offline ({tendikOfflineCount})
 </button>
 </div>
 )}

 {monitoringPillar === 'siswa' && (
 <div className="flex flex-wrap items-center gap-1.5 text-xs">
 <div className="flex flex-wrap items-center gap-1 bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 p-1 rounded-xl text-xs font-extrabold">
 <button
 type="button"
 onClick={() => setAttendanceStatusFilter('all')}
 className={`px-2 py-0.5 rounded-lg transition-all ${attendanceStatusFilter === 'all' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'}`}
 >
 Semua ({studentAttendanceList.length})
 </button>
 <button
 type="button"
 onClick={() => setAttendanceStatusFilter('Hadir')}
 className={`px-2 py-0.5 rounded-lg transition-all ${attendanceStatusFilter === 'Hadir' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-emerald-700 dark:text-emerald-400'}`}
 >
 Hadir ({hadirCount})
 </button>
 <button
 type="button"
 onClick={() => setAttendanceStatusFilter('Terlambat')}
 className={`px-2 py-0.5 rounded-lg transition-all ${attendanceStatusFilter === 'Terlambat' ? 'bg-amber-500 text-white shadow-xs font-black' : 'text-amber-700 dark:text-amber-400'}`}
 >
 Terlambat ({terlambatCount})
 </button>
 <button
 type="button"
 onClick={() => setAttendanceStatusFilter('Izin')}
 className={`px-2 py-0.5 rounded-lg transition-all ${attendanceStatusFilter === 'Izin' ? 'bg-sky-600 text-white shadow-xs font-black' : 'text-sky-700 dark:text-sky-400'}`}
 >
 Izin ({izinCount})
 </button>
 <button
 type="button"
 onClick={() => setAttendanceStatusFilter('Sakit')}
 className={`px-2 py-0.5 rounded-lg transition-all ${attendanceStatusFilter === 'Sakit' ? 'bg-rose-600 text-white shadow-xs font-black' : 'text-rose-700 dark:text-rose-400'}`}
 >
 Sakit ({sakitCount})
 </button>
 <button
 type="button"
 onClick={() => setAttendanceStatusFilter('Alpha')}
 className={`px-2 py-0.5 rounded-lg transition-all ${attendanceStatusFilter === 'Alpha' ? 'bg-rose-700 text-white shadow-xs font-black' : 'text-rose-800 dark:text-rose-300'}`}
 >
 Alpha ({alphaCount})
 </button>
 <button
 type="button"
 onClick={() => setAttendanceStatusFilter('inactive')}
 className={`px-2 py-0.5 rounded-lg transition-all ${attendanceStatusFilter === 'inactive' ? 'bg-slate-700 text-white shadow-xs font-black' : 'text-slate-600 dark:text-slate-400'}`}
 >
 Belum Presensi ({noActivityCount})
 </button>
 </div>

 <button
 type="button"
 onClick={() => setIsAttendanceModalOpen(true)}
 className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300/80 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 cursor-pointer shrink-0 transition-all active:scale-95 shadow-xs"
 >
 <Eye className="h-3.5 w-3.5 text-emerald-600" />
 <span>Buka Tabel Presensi Lengkap</span>
 </button>
 </div>
 )}
 </div>

 {/* ── PILLAR BODY CONTENT ── */}
 <div className="relative z-10 min-h-[380px]">
 {/* TAB 1: GURU MONITORING */}
 {monitoringPillar === 'guru' && (
 guruViewMode === 'sessions' ? (
 /* KBM Sessions View inside Tab */
 <div className="space-y-3.5">
 <div className="flex items-center justify-between pb-2 border-b border-emerald-100/80 dark:border-emerald-900/40 text-xs">
 <span className="font-bold text-slate-500">
 Menampilkan <strong className="text-slate-800 dark:text-white">{filteredSessions.length}</strong> sesi KBM terjadwal hari ini
 </span>
 <div className="flex items-center gap-1">
 {['all', 'ongoing', 'completed', 'scheduled'].map((f) => (
 <button
 key={f}
 type="button"
 onClick={() => setKbmSessionFilter(f)}
 className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
 kbmSessionFilter === f
 ? 'bg-emerald-600 text-white'
 : 'bg-slate-100 text-slate-600 dark:bg-sky-950/60 dark:text-sky-300'
 }`}
 >
 {f === 'all' ? 'Semua' : f === 'ongoing' ? 'Berlangsung' : f === 'completed' ? 'Selesai' : 'Terjadwal'}
 </button>
 ))}
 </div>
 </div>

 {filteredSessions.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
 <BookOpen className="h-9 w-10 stroke-1 mb-2 text-slate-300 dark:text-slate-600" />
 <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Tidak ada sesi KBM pada kategori ini.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[460px] overflow-y-auto pr-1.5 scrollbar-thin">
 {filteredSessions.map((sess, idx) => {
 const isCompleted = sess.status === 'completed'
 const isOngoing = sess.is_ongoing
 const hasJournal = Boolean(sess.meeting_notes && sess.meeting_notes.trim())

 return (
 <div
 key={sess.id || idx}
 className={`rounded-xl border p-4 transition-all hover:shadow-md flex flex-col justify-between ${
 isCompleted
 ? 'border-emerald-500/30 bg-emerald-50/20 dark:border-emerald-600/30 dark:bg-emerald-950/10'
 : isOngoing
 ? 'border-sky-500/40 bg-sky-50/25 dark:border-sky-600/30 dark:bg-sky-950/15'
 : 'border-emerald-200/90 bg-white dark:border-emerald-800/80 dark:bg-card-dark'
 }`}
 >
 <div className="space-y-2.5">
 <div className="flex items-center justify-between gap-2">
 <span className="inline-flex items-center gap-1 text-xs font-extrabold text-slate-600 dark:text-slate-300">
 <Clock className="h-3.5 w-3.5 text-blue-600" />
 {sess.start_time || sess.jam_mulai} - {sess.end_time || sess.jam_selesai} WIB
 </span>
 {isCompleted ? (
 <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
 Selesai
 </span>
 ) : isOngoing ? (
 <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-100 text-sky-800 border border-sky-300 animate-pulse">
 Sedang KBM
 </span>
 ) : (
 <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
 Terjadwal
 </span>
 )}
 </div>

 <div>
 <h4 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">
 {sess.subject_name || sess.mata_pelajaran}
 </h4>
 <p className="text-xs font-bold text-slate-500">
 {sess.class_name || sess.kelas} • {sess.room || 'Ruang Kelas'}
 </p>
 </div>

 <div className="flex items-center gap-2 pt-2 border-t border-emerald-100/80 dark:border-emerald-900/40">
 <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-black text-[10px]">
 {getInitials(sess.teacher_name || sess.guru)}
 </div>
 <div className="min-w-0 flex-1">
 <p className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">
 {sess.teacher_name || sess.guru}
 </p>
 <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold truncate">
 {isCompleted ? 'Presensi Terekam' : isOngoing ? 'Hadir di Kelas' : 'Belum Presensi'}
 </p>
 </div>
 </div>
 </div>

 <div className="mt-3 pt-2.5 border-t border-emerald-100/80 dark:border-emerald-900/40/80 flex items-center justify-between">
 <span className="text-[10px] font-semibold text-slate-400">
 {hasJournal ? 'Jurnal terisi' : 'Belum ada catatan jurnal'}
 </span>
 <button
 type="button"
 onClick={() => setSelectedKbmSession(sess)}
 className="text-xs font-black text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
 >
 <span>Detail KBM</span>
 <ChevronRight className="h-3 w-3" />
 </button>
 </div>
 </div>
 )
 })}
 </div>
 )}
 </div>
 ) : (
 /* Guru Profile Cards View */
 <div>
 {filteredGuruList.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
 <GraduationCap className="h-9 w-12 stroke-1 mb-2 text-slate-300 dark:text-slate-600" />
 <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
 Tidak ada tenaga pendidik (guru) yang cocok dengan pencarian atau filter.
 </p>
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 max-h-[520px] overflow-y-auto pr-1.5 scrollbar-thin">
 {filteredGuruList.map((guru) => {
 const photo = guru.avatar_url || guru.photo_url || guru.foto || guru.avatar
 const userName = guru.nama || guru.name || 'Guru'
 const userRole = guru.role || guru.jabatan || 'Tenaga Pendidik'
 const userNip = guru.nip || guru.niy || guru.nik || '—'
 const activeKbm = teachingNowMap.get(String(userName).trim().toLowerCase())
 const isTeaching = activeKbm && activeKbm.is_ongoing

 return (
 <div
 key={guru.id || userName}
 className={`group relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
 isTeaching
 ? 'border-blue-400/80 bg-white dark:bg-card-dark dark:border-blue-700/60 dark:from-blue-950/40 dark:to-slate-900'
 : guru.is_online
 ? 'border-emerald-300/80 bg-white dark:bg-card-dark dark:border-emerald-700/60 dark:from-emerald-950/30 dark:to-slate-900'
 : 'border-emerald-200/90 bg-white dark:border-emerald-800/80 dark:bg-card-dark'
 }`}
 >
 <div className="space-y-3">
 <div className="flex items-start justify-between gap-2">
 <div className="relative">
 <Avatar size="lg" className="ring-2 ring-blue-500/40 border-2 border-blue-400/50 dark:border-blue-500/40 shadow-xs">
 {photo && <AvatarImage src={photo} alt={userName} />}
 <AvatarFallback className="h-full w-full rounded-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 dark:from-blue-950 dark:to-slate-900 text-blue-700 dark:text-blue-300 font-black text-xs border border-blue-200/60 dark:border-blue-800/60">
 <User className="size-5" />
 </AvatarFallback>
 <AvatarBadge status={guru.is_online ? 'online' : 'offline'} size="lg" />
 </Avatar>
 </div>

 <div className="flex flex-col items-end gap-1">
 {isTeaching ? (
 <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 text-[10px] font-black border border-blue-300/70 animate-pulse">
 <BookOpen className="h-3 w-3" />
 Sedang KBM
 </span>
 ) : guru.is_online ? (
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-black border border-emerald-300/80 dark:border-emerald-700/80">
 <span className="size-2 rounded-full bg-emerald-500 animate-pulse ring-2 ring-emerald-200 dark:ring-emerald-800" />
 Online
 </span>
 ) : (
 <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 px-2 py-0.5 text-[10px] font-black border border-rose-300/80 dark:border-rose-800/80">
 <span className="size-2 rounded-full bg-rose-500 ring-2 ring-rose-200 dark:ring-rose-800" />
 Offline
 </span>
 )}
 </div>
 </div>

 <div>
 <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug line-clamp-1 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
 {userName}
 </h4>
 <p className="font-mono text-[10px] text-slate-400 font-semibold mt-0.5 truncate">
 {userNip}
 </p>
 <p className="text-xs font-extrabold text-blue-700 dark:text-blue-300 line-clamp-1 mt-0.5">
 {userRole}
 </p>
 </div>

 {/* Active Teaching or Session Banner */}
 {activeKbm ? (
 <div className="rounded-xl border border-blue-200/80 bg-blue-50/70 dark:border-blue-900/60 dark:bg-blue-950/40 p-2 space-y-0.5 text-[10.5px]">
 <span className="font-extrabold text-blue-800 dark:text-blue-200 block truncate">
 {activeKbm.subject_name || 'Mata Pelajaran'} ({activeKbm.class_name || 'Kelas'})
 </span>
 <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold">
 <Clock className="h-3 w-3 text-blue-600" />
 {activeKbm.start_time}-{activeKbm.end_time} WIB • {activeKbm.room || 'Ruang KBM'}
 </span>
 </div>
 ) : (
 <div className="rounded-xl border border-emerald-100/80 dark:border-emerald-900/40 bg-slate-50/70 dark:border-emerald-800/60 dark:bg-slate-900/40 p-2 text-[10.5px] text-slate-500 font-semibold truncate">
 {guru.activity || 'Tidak ada jadwal KBM aktif saat ini'}
 </div>
 )}
 </div>

 {/* Action Buttons: Chat */}
 <div className="mt-3 pt-2.5 border-t border-emerald-100/80 dark:border-emerald-900/40/80 flex items-center gap-2">
 <button
 type="button"
 onClick={() => setActiveChatUser(guru)}
 className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95"
 >
 <MessageSquare className="h-3 w-3" />
 <span>Chat</span>
 </button>

 {activeKbm && (
 <button
 type="button"
 title="Lihat Detail Sesi KBM"
 onClick={() => setSelectedKbmSession(activeKbm)}
 className="inline-flex items-center justify-center rounded-xl border border-emerald-200/80 bg-white text-slate-700 hover:bg-slate-100 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 px-2 py-1.5 text-xs font-black transition-all cursor-pointer"
 >
 <Eye className="h-3 w-3" />
 </button>
 )}
 </div>
 </div>
 )
 })}
 </div>
 )}
 </div>
 )
 )}

 {/* TAB 2: TENDIK & STAF MONITORING */}
 {monitoringPillar === 'tendik' && (
 <div>
 {filteredTendikList.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
 <UserCheck className="h-9 w-12 stroke-1 mb-2 text-slate-300 dark:text-slate-600" />
 <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
 Tidak ada tenaga kependidikan (tendik) yang cocok dengan filter atau pencarian.
 </p>
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 max-h-[520px] overflow-y-auto pr-1.5 scrollbar-thin">
 {filteredTendikList.map((tendik) => {
 const photo = tendik.avatar_url || tendik.photo_url || tendik.foto || tendik.avatar
 const userName = tendik.nama || tendik.name || 'Tendik'
 const userRole = tendik.role || tendik.jabatan || 'Tenaga Kependidikan'
 const userNip = tendik.nip || tendik.niy || tendik.nik || '—'

 return (
 <div
 key={tendik.id || userName}
 className={`group relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
 tendik.is_online
 ? 'border-purple-300/80 bg-white dark:bg-card-dark dark:border-purple-700/60 dark:from-purple-950/30 dark:to-slate-900'
 : 'border-emerald-200/90 bg-white dark:border-emerald-800/80 dark:bg-card-dark'
 }`}
 >
 <div className="space-y-3">
 <div className="flex items-start justify-between gap-2">
 <div className="relative">
 <Avatar size="lg" className="ring-2 ring-purple-500/40 border-2 border-purple-400/50 dark:border-purple-500/40 shadow-xs">
 {photo && <AvatarImage src={photo} alt={userName} />}
 <AvatarFallback className="h-full w-full rounded-full flex items-center justify-center bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-100 dark:from-purple-950 dark:to-slate-900 text-purple-700 dark:text-purple-300 font-black text-xs border border-purple-200/60 dark:border-purple-800/60">
 <User className="size-5" />
 </AvatarFallback>
 <AvatarBadge status={tendik.is_online ? 'online' : 'offline'} size="lg" />
 </Avatar>
 </div>

 <div className="flex flex-col items-end gap-1">
 {tendik.is_online ? (
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-black border border-emerald-300/80 dark:border-emerald-700/80">
 <span className="size-2 rounded-full bg-emerald-500 animate-pulse ring-2 ring-emerald-200 dark:ring-emerald-800" />
 Online / Bertugas
 </span>
 ) : (
 <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 px-2 py-0.5 text-[10px] font-black border border-rose-300/80 dark:border-rose-800/80">
 <span className="size-2 rounded-full bg-rose-500 ring-2 ring-rose-200 dark:ring-rose-800" />
 Offline
 </span>
 )}
 </div>
 </div>

 <div>
 <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug line-clamp-1 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
 {userName}
 </h4>
 <p className="font-mono text-[10px] text-slate-400 font-semibold mt-0.5 truncate">
 {userNip}
 </p>
 <p className="text-xs font-extrabold text-purple-700 dark:text-purple-300 line-clamp-1 mt-0.5">
 {userRole}
 </p>
 </div>

 <div className="rounded-xl border border-emerald-100/80 dark:border-emerald-900/40 bg-slate-50/70 dark:border-emerald-800/60 dark:bg-slate-900/40 p-2 space-y-1 text-[10.5px]">
 <div className="flex items-center justify-between text-slate-500">
 <span className="font-bold">Status Layanan:</span>
 <span className="font-extrabold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
 {tendik.activity || 'Pelayanan administrasi'}
 </span>
 </div>
 <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-emerald-200/80/50 dark:border-emerald-800/60">
 <span>Keaktifan:</span>
 <span className="font-semibold">{tendik.lastSeen || '—'}</span>
 </div>
 </div>
 </div>

 {/* Action Buttons: Chat */}
 <div className="mt-3 pt-2.5 border-t border-emerald-100/80 dark:border-emerald-900/40/80 flex items-center gap-2">
 <button
 type="button"
 onClick={() => setActiveChatUser(tendik)}
 className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95"
 >
 <MessageSquare className="h-3 w-3" />
 <span>Chat Staf</span>
 </button>
 </div>
 </div>
 )
 })}
 </div>
 )}
 </div>
 )}

 {/* TAB 3: SISWA & SANTRI MONITORING */}
 {monitoringPillar === 'siswa' && (
 <div>
 {filteredMonitoringStudents.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
 <Users className="h-9 w-12 stroke-1 mb-2 text-slate-300 dark:text-slate-600" />
 <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
 Tidak ada siswa yang cocok dengan filter atau kata kunci pencarian.
 </p>
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 max-h-[520px] overflow-y-auto pr-1.5 scrollbar-thin">
 {filteredMonitoringStudents.map((student, idx) => {
 const photo = student.avatar_url || student.photo_url || student.foto || student.avatar
 const sName = student.nama || student.name || 'Siswa'
 const sNisn = student.nisn || student.nis || '—'
 const sKelas = student.kelas || student.rombel || '—'
 const sStatus = student.status || 'Belum Presensi'
 const sTime = student.waktu && student.waktu !== '—' ? student.waktu : '—'
 const sPhone = student.no_hp_ortu || student.kontak_ortu || '—'
 const sKet = student.keterangan || (sStatus === 'Hadir' ? 'Hadir Tepat Waktu' : '—')

 const badgeMap = {
 Hadir: { variant: 'success', status: 'online' },
 Terlambat: { variant: 'warning', status: 'busy' },
 Izin: { variant: 'info', status: 'busy' },
 Sakit: { variant: 'danger', status: 'offline' },
 Alpha: { variant: 'danger', status: 'offline' },
 }
 const bInfo = badgeMap[sStatus] || { variant: 'neutral', status: 'offline' }

 return (
 <HoverCard key={student.id || idx}>
 <HoverCardTrigger asChild>
 <div className="group relative h-full overflow-hidden rounded-2xl border border-emerald-200/80 bg-white dark:bg-card-dark dark:border-emerald-800/60 dark:from-[#151D2A] dark:to-emerald-950/20 p-3.5 transition-all duration-200 hover:border-emerald-400 hover:shadow-md hover:shadow-sm flex flex-col justify-between cursor-pointer">
 <div className="space-y-2.5">
 <div className="flex items-start justify-between gap-2">
 <Avatar size="md" className="ring-2 ring-emerald-500/40 border-2 border-emerald-400/50 dark:border-emerald-500/40 shrink-0 shadow-xs">
 {photo && <AvatarImage src={photo} alt={sName} />}
 <AvatarFallback className="h-full w-full rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 dark:from-emerald-950 dark:to-slate-900 text-emerald-700 dark:text-emerald-300 font-black text-xs border border-emerald-200/60 dark:border-emerald-800/60">
 <User className="size-4" />
 </AvatarFallback>
 <AvatarBadge status={bInfo.status} size="md" />
 </Avatar>

 <AppBadge variant={bInfo.variant} size="xs">{sStatus}</AppBadge>
 </div>

 <div>
 <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
 {sName}
 </h4>
 <p className="font-mono text-[10px] text-slate-400 mt-0.5">
 NISN: {sNisn} • Kelas {sKelas}
 </p>
 </div>

 <div className="rounded-xl border border-emerald-100/80 dark:border-emerald-900/40 bg-white dark:border-emerald-800/60 dark:bg-slate-900/60 p-2 text-[10.5px] space-y-0.5">
 <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
 <span className="flex items-center gap-1 font-bold">
 <Clock className="h-3 w-3 text-emerald-600" /> Waktu:
 </span>
 <span className="font-extrabold">{sTime}</span>
 </div>
 {sKet && sKet !== '—' && (
 <p className="text-[10px] text-slate-400 truncate pt-0.5 border-t border-emerald-100/80 dark:border-emerald-900/40">
 Ket: {sKet}
 </p>
 )}
 </div>
 </div>

 {/* Action Button: Cetak Evaluasi */}
 <div className="mt-3 pt-2.5 border-t border-emerald-100/80 dark:border-emerald-900/40/80 flex items-center gap-1.5">
 <button
 type="button"
 title="Cetak Evaluasi Pekanan"
 onClick={(e) => {
 e.stopPropagation()
 handlePrintWeekly(student)
 }}
 className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-2.5 text-[10.5px] font-black transition-all cursor-pointer shadow-2xs border border-emerald-500"
 >
 <Printer className="h-3 w-3" />
 <span>Cetak Rapor Pekanan</span>
 </button>
 </div>
 </div>
 </HoverCardTrigger>

 {/* HoverCard Preview */}
 <HoverCardContent
 side="top"
 align="center"
 className="w-80 p-4 border-2 border-emerald-200/90 bg-white dark:border-emerald-800/80 dark:bg-card-dark rounded-xl shadow-xl space-y-3 z-50"
 >
 <div className="flex items-start gap-3">
 <Avatar size="xxl" className="ring-4 ring-emerald-500/30 border-2 border-emerald-400/70 dark:border-emerald-500/70 shrink-0 shadow-md">
 {photo && <AvatarImage src={photo} alt={sName} />}
 <AvatarFallback className="h-full w-full rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 dark:from-emerald-950 dark:to-slate-900 text-emerald-800 dark:text-emerald-200 font-extrabold text-lg border border-emerald-300/60 dark:border-emerald-800/60">
 <User className="size-10" />
 </AvatarFallback>
 <AvatarBadge status={bInfo.status} size="xxl" />
 </Avatar>

 <div className="min-w-0 flex-1 space-y-1">
 <div className="flex items-center justify-between gap-1">
 <AppBadge variant={bInfo.variant} dot>{sStatus}</AppBadge>
 <span className="text-[10px] text-slate-400 font-bold">{sTime}</span>
 </div>
 <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug">
 {sName}
 </h4>
 <p className="font-mono text-[10px] text-slate-400">NISN. {sNisn} • Kelas {sKelas}</p>
 </div>
 </div>

 <div className="rounded-xl border border-emerald-100/80 dark:border-emerald-900/40 bg-slate-50/80 p-2.5 dark:border-emerald-800/60 dark:bg-slate-900/50 space-y-1.5 text-xs">
 <div className="flex items-center justify-between">
 <span className="text-slate-400 font-bold">Catatan:</span>
 <span className="font-extrabold text-slate-800 dark:text-slate-200">{sKet}</span>
 </div>
 <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60 dark:border-emerald-800/60">
 <span className="text-slate-400 font-bold">Wali Murid:</span>
 <span className="font-bold text-slate-700 dark:text-slate-300">{student.nama_ortu || student.wali || '—'}</span>
 </div>
 </div>

 <button
 type="button"
 onClick={() => handlePrintWeekly(student)}
 className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 text-xs font-bold shadow-xs cursor-pointer border border-emerald-500"
 >
 <Printer className="h-3.5 w-3.5" />
 <span>Cetak Evaluasi Pekanan Santri</span>
 </button>
 </HoverCardContent>
 </HoverCard>
 )
 })}
 </div>
 )}
 </div>
 )}

 {/* TAB 4: RADAR KEDISIPLINAN & OTORISASI SP */}
 {monitoringPillar === 'kedisiplinan' && (
 <PrincipalDisciplineOverviewSection
 unitId={selectedUnitId || data?.context?.unit?.id || data?.unit_id || data?.unit?.id}
 onOpenStudentSummary={() => navigate('/dashboard/master/tata-tertib')}
 />
 )}
 </div>
 </section>

 {/* 2-Column Grid: Supervisi KBM Hari Ini + Log Keaktifan & Activity Feed Real-Time */}
 <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
 {/* Kolom 1: Supervisi KBM & Presensi Guru Real-Time (Pantauan Kepala Sekolah) */}
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 flex flex-col justify-between dark:bg-card-dark">
 
 <div className="space-y-4">
 {/* Header Section */}
 <div className="border-b border-emerald-500/20 dark:border-emerald-800/40 bg-emerald-500/10 dark:bg-emerald-950/40 -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 px-5 sm:px-6 py-4 mb-4 space-y-3">
 <div className="flex items-center gap-3">
 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border-2 border-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-700/80 dark:text-emerald-300 shadow-sm">
 <BookOpenCheck className="size-5" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200 leading-tight">
 Supervisi KBM {kbmDayFilter === 'all' ? 'Seluruh Hari' : kbmDayFilter === 'today' ? 'Hari Ini' : `Hari ${dayNamesMap[kbmDayFilter] || ''}`}
 </h3>
 <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1.5 shrink-0">
 <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
 Live
 </span>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
 Monitoring sesi KBM aktif, pengampu, materi &amp; jurnal kelas
 </p>
 </div>
 </div>

 {/* Filter Status Tabs (Semua, KBM, Selesai, Jadwal) */}
 <div className="flex items-center gap-1.5 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 p-1 rounded-xl text-[10.5px] font-extrabold overflow-x-auto max-w-full shadow-2xs">
 <button
 type="button"
 onClick={() => setKbmSessionFilter('all')}
 className={`px-3 py-1.5 rounded-lg transition-all ${kbmSessionFilter === 'all' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-white'}`}
 >
 Semua ({filteredByDaySessions.length})
 </button>
 <button
 type="button"
 onClick={() => setKbmSessionFilter('ongoing')}
 className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${kbmSessionFilter === 'ongoing' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-slate-600 hover:text-sky-700 dark:text-slate-300 dark:hover:text-white'}`}
 >
 <span className={`h-1.5 w-1.5 rounded-full ${kbmSessionFilter === 'ongoing' ? 'bg-white animate-pulse' : 'bg-sky-500'}`} />
 KBM ({filteredByDaySessions.filter((s) => s.is_ongoing).length})
 </button>
 <button
 type="button"
 onClick={() => setKbmSessionFilter('completed')}
 className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${kbmSessionFilter === 'completed' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-white'}`}
 >
 <CheckCircle2 className={`h-3 w-3 ${kbmSessionFilter === 'completed' ? 'text-white' : 'text-emerald-600'}`} />
 Selesai ({filteredByDaySessions.filter((s) => s.status === 'completed').length})
 </button>
 <button
 type="button"
 onClick={() => setKbmSessionFilter('scheduled')}
 className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${kbmSessionFilter === 'scheduled' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'}`}
 >
 Jadwal ({filteredByDaySessions.filter((s) => s.status === 'scheduled' && !s.is_ongoing).length})
 </button>
 </div>

 {/* Filter Hari Dropdown - Pindah ke Bawah Tab */}
 <div className="flex items-center gap-2 pt-1">
 <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
 <Calendar className="size-3.5 text-emerald-600 dark:text-emerald-400" />
 Filter Hari:
 </span>
 <HeroUiFilterSelect
 value={kbmDayFilter}
 onChange={setKbmDayFilter}
 options={[
 { value: 'today', label: `Hari Ini (${todayDayName})` },
 { value: 'all', label: 'Semua Hari' },
 { value: '1', label: 'Senin' },
 { value: '2', label: 'Selasa' },
 { value: '3', label: 'Rabu' },
 { value: '4', label: 'Kamis' },
 { value: '5', label: 'Jumat' },
 { value: '6', label: 'Sabtu' },
 ]}
 icon={Calendar}
 ariaLabel="Filter Hari KBM"
 size="sm"
 className="min-w-[160px]"
 />
 </div>
 </div>

 {/* Content List */}
 {filteredSessions.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
 <div className="flex h-9 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mb-2 border border-emerald-200/60 dark:border-emerald-800/60">
 <BookOpenCheck className="h-6 w-6" />
 </div>
 <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">Tidak ada sesi KBM pada kategori ini</p>
 <p className="text-xs text-slate-400 mt-0.5">
 Sesi KBM akan tercatat otomatis saat jam pelajaran dimulai.
 </p>
 </div>
 ) : (
 <div className="max-h-[380px] overflow-y-auto pr-1.5 space-y-2.5 scrollbar-thin">
 {filteredSessions.map((sess, idx) => {
 const isCompleted = sess.status === 'completed'
 const isOngoing = sess.is_ongoing
 const hasJournal = Boolean(sess.meeting_notes && sess.meeting_notes.trim())

 return (
 <div
 key={sess.id || idx}
 className={`group relative overflow-hidden rounded-xl border p-3.5 transition-all duration-200 hover:shadow-md ${
 isCompleted
 ? 'border-emerald-500/30 bg-emerald-50/20 dark:border-emerald-600/30 dark:bg-emerald-950/10'
 : isOngoing
 ? 'border-sky-500/40 bg-sky-50/25 dark:border-sky-600/30 dark:bg-sky-950/15'
 : 'border-emerald-200/90 bg-white dark:border-emerald-800/80 dark:bg-card-dark'
 }`}
 >
 <div className="flex items-start justify-between gap-2">
 <div className="space-y-1 min-w-0 flex-1">
 <div className="flex items-center gap-2 flex-wrap">
 {sess.hari && (
 <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/40">
 {sess.hari}
 </span>
 )}
 <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold text-slate-600 dark:text-slate-300">
 <Clock className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
 {sess.start_time || sess.jam_mulai} - {sess.end_time || sess.jam_selesai}
 </span>
 <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
 {sess.class_name || sess.kelas || 'Kelas'}
 </span>
 </div>
 <h4 className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
 {sess.subject_name || sess.mata_pelajaran || 'Mata Pelajaran'}
 </h4>
 <p className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">
 👨‍🏫 {sess.teacher_name || sess.guru || 'Guru Pengampu'} • <span className="font-mono text-slate-400">{sess.room || sess.ruangan || 'Ruang Kelas'}</span>
 </p>
 {sess.topic && (
 <p className="text-[10.5px] text-slate-500 dark:text-slate-400 line-clamp-1 italic pt-0.5">
 "{sess.topic}"
 </p>
 )}
 </div>

 <div className="flex flex-col items-end gap-2 shrink-0">
 {isCompleted ? (
 hasJournal ? (
 <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-200">
 <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" /> Selesai
 </span>
 ) : (
 <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-black bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-900/60 dark:text-amber-200">
 <AlertCircle className="h-2.5 w-2.5 text-amber-600" /> Cek Jurnal
 </span>
 )
 ) : isOngoing ? (
 <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-black bg-sky-100 text-sky-800 border border-sky-300 dark:bg-sky-900/60 dark:text-sky-200">
 <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" /> Sedang KBM
 </span>
 ) : (
 <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-slate-100 text-slate-600 border border-emerald-200/80 dark:bg-sky-950/60 dark:text-sky-300">
 Terjadwal
 </span>
 )}

 <button
 type="button"
 onClick={() => setSelectedKbmSession(sess)}
 className="inline-flex items-center gap-0.5 text-[10.5px] font-black text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 cursor-pointer pt-1"
 >
 <span>Detail</span>
 <ChevronRight className="h-3 w-3" />
 </button>
 </div>
 </div>
 </div>
 )
 })}
 </div>
 )}
 </div>

 <div className="pt-3 border-t border-emerald-100/80 dark:border-emerald-900/40/80 flex items-center justify-between text-xs text-slate-400">
 <span>Total: <strong className="text-slate-700 dark:text-slate-200 font-bold">{filteredByDaySessions.length}</strong> sesi mengajar {kbmDayFilter === 'all' ? 'seluruh hari' : kbmDayFilter === 'today' ? 'hari ini' : `hari ${dayNamesMap[kbmDayFilter] || ''}`}</span>
 <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-[10.5px]">Sinkron Otomatis</span>
 </div>
 </div>

 {/* Kolom 2: Log Keaktifan & Activity Feed Real-Time */}
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 flex flex-col justify-between dark:bg-card-dark">
 
 <div className="space-y-4">
 <div className="flex flex-col gap-3 border-b border-emerald-500/20 dark:border-emerald-800/40 bg-emerald-500/10 dark:bg-emerald-950/40 -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 px-5 sm:px-6 py-4 mb-4">
 <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border-2 border-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-700/80 dark:text-emerald-300 shadow-sm">
 <Radio className="size-5 animate-pulse" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
 Log Keaktifan &amp; Activity Feed
 </h3>
 <span className="rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-300 inline-flex items-center gap-1.5 shrink-0">
 <span className="size-1.5 rounded-full bg-teal-500 animate-pulse" />
 Real-Time
 </span>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
 Log transaksi login, presensi, dan aktivitas sistem
 </p>
 </div>
 </div>

 {/* Filter Periode Tab: Semua, Hari Ini, Pekan Ini, Bulan Ini, Semester Ini */}
 <div className="flex items-center gap-1 bg-white/70 dark:bg-slate-900/60 border border-emerald-200/80 dark:border-emerald-800/60 p-1 rounded-xl text-[10.5px] font-extrabold overflow-x-auto max-w-full shadow-2xs">
 <button
 type="button"
 onClick={() => setActivityPeriodFilter('all')}
 className={`px-2.5 py-1 rounded-lg transition-all ${activityPeriodFilter === 'all' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-white'}`}
 >
 Semua
 </button>
 <button
 type="button"
 onClick={() => setActivityPeriodFilter('today')}
 className={`px-2.5 py-1 rounded-lg transition-all ${activityPeriodFilter === 'today' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-white'}`}
 >
 Hari Ini
 </button>
 <button
 type="button"
 onClick={() => setActivityPeriodFilter('week')}
 className={`px-2.5 py-1 rounded-lg transition-all ${activityPeriodFilter === 'week' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-white'}`}
 >
 Pekan Ini
 </button>
 <button
 type="button"
 onClick={() => setActivityPeriodFilter('month')}
 className={`px-2.5 py-1 rounded-lg transition-all ${activityPeriodFilter === 'month' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-white'}`}
 >
 Bulan Ini
 </button>
 <button
 type="button"
 onClick={() => setActivityPeriodFilter('semester')}
 className={`px-2.5 py-1 rounded-lg transition-all ${activityPeriodFilter === 'semester' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-white'}`}
 >
 Semester Ini
 </button>
 </div>
 </div>

 <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1.5 scrollbar-thin">
 {filteredActivityLogs.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
 <Activity className="h-9 w-10 stroke-1 mb-2 text-slate-300 dark:text-slate-600" />
 <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
 Belum ada log keaktifan transaksi tercatat hari ini
 </p>
 </div>
 ) : (
 filteredActivityLogs.map((log, idx) => {
 const isLogin = log.type === 'login'
 return (
 <div
 key={log.id || idx}
 className={`flex items-start gap-3 rounded-xl border p-2.5 transition-all hover:shadow-xs ${
 isLogin
 ? 'border-emerald-200/80 bg-white dark:bg-card-dark dark:border-emerald-800/60 dark:from-emerald-950/30 dark:to-slate-900'
 : 'border-sky-200/80 bg-white dark:bg-card-dark dark:border-sky-800/60 dark:from-sky-950/30 dark:to-slate-900'
 }`}
 >
 <Avatar size="sm" className="relative ring-2 ring-emerald-200/90 dark:ring-emerald-700/80 border border-emerald-300/80 shadow-xs shrink-0 mt-0.5">
 <AvatarFallback className="h-full w-full rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-100 dark:from-emerald-950 dark:to-slate-900 text-emerald-700 dark:text-emerald-300 font-black text-xs">
 <User className="size-3.5" />
 </AvatarFallback>
 <AvatarBadge status={isLogin || log.is_online ? 'online' : 'offline'} size="sm" />
 </Avatar>
 <div className="min-w-0 flex-1 space-y-0.5">
 <div className="flex items-center justify-between gap-2">
 <p className="text-xs font-black text-slate-900 dark:text-white truncate">
 {log.user || log.nama || log.username || 'Pengguna'}
 </p>
 <span className="shrink-0 text-[9.5px] font-bold text-slate-500 bg-white/80 dark:bg-slate-800/80 px-1.5 py-0.2 rounded border border-emerald-200/60 dark:border-emerald-800/60">
 {log.time || log.created_at || log.created_at_relative || 'Baru saja'}
 </span>
 </div>
 <p className="text-[10.5px] text-slate-600 dark:text-slate-300 font-medium leading-snug break-words">
 {log.role && (
 <span className="inline-block font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/80 px-1 py-0.2 rounded text-[9.5px] mr-1 border border-emerald-300/60 dark:border-emerald-800/60">
 {log.role}
 </span>
 )}
 {log.action || log.description || log.pesan || log.title}
 </p>
 </div>
 </div>
 )
 })
 )}
 </div>
 </div>

 <div className="pt-3 border-t border-emerald-100/80 dark:border-emerald-900/40/80 flex items-center justify-between text-xs">
 <span className="text-slate-400 font-medium">
 Total Log: <strong className="text-slate-700 dark:text-slate-200 font-bold">{filteredActivityLogs.length}</strong> aktivitas
 </span>
 <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10.5px]">
 <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
 Live Stream
 </span>
 </div>
 </div>
 </section>

 {/* Quick Action Navigation (Soft Pastel Squircle Buttons) */}
 <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:bg-card-dark">
 <div className="space-y-4">
 <div>
 <div className="flex items-center gap-2">
 <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#0E5C44]/10 text-[#0E5C44] dark:bg-[#3FBF75]/20 dark:text-[#3FBF75]">
 <Sparkles className="h-3.5 w-3.5" />
 </span>
 <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200">Akses Cepat Kepala Sekolah</h3>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Navigasi langsung ke pemantauan presensi, tahfizh, dan kesiswaan</p>
 </div>

 {/* Baris Tombol Akses Cepat: 1 Baris Penuh di Layar Desktop */}
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
 {/* 1. Input Laporan Bulanan - Teal Theme */}
 <QuickAccessCard
 layout="vertical"
 tone="teal"
 icon={FileSpreadsheet}
 title="Input Laporan Bulanan"
 subtitle="Kinerja & Evaluasi"
 onClick={() => setIsReportModalOpen(true)}
 className="w-full"
 />

 {/* 2. Monitoring Divisi - Sky Blue Theme */}
 <QuickAccessCard
 layout="vertical"
 tone="sky"
 icon={FileText}
 title="Monitoring Divisi"
 subtitle="Divisi & Unit"
 onClick={() => navigate('/dashboard/monitoring-divisi')}
 className="w-full"
 />

 {/* 3. Rekap Kehadiran - Emerald Green Theme */}
 <QuickAccessCard
 layout="vertical"
 tone="emerald"
 icon={CheckCircle2}
 title="Rekap Kehadiran"
 subtitle="Presensi Guru & Siswa"
 onClick={() => navigate('/absensi/rekap-kehadiran')}
 className="w-full"
 />

 {/* 4. Monitoring Tahfizh - Purple Theme */}
 <QuickAccessCard
 layout="vertical"
 tone="purple"
 icon={BookOpen}
 title="Tahfizh & Mutabaah Non-Pesantren"
 subtitle="Hafalan & Ibadah Harian"
 onClick={() => navigate('/dashboard/monitoring-tahfizh-ibadah-non-pesantren')}
 className="w-full"
 />

 {/* 5. Verifikasi Prestasi - Amber Theme */}
 <QuickAccessCard
 layout="vertical"
 tone="amber"
 icon={Award}
 title="Verifikasi Prestasi"
 subtitle="Capaian & Penghargaan"
 onClick={() => navigate('/dashboard/laporan-prestasi')}
 className="w-full"
 />

 {/* 6. Segarkan Data - Slate Theme */}
 <QuickAccessCard
 layout="vertical"
 tone="slate"
 icon={RefreshCw}
 title="Segarkan Data"
 subtitle="Update Real-Time"
 onClick={fetchDashboard}
 loading={loading}
 className="w-full"
 />
 </div>
 </div>
 </section>

 {/* 2-Column Grid: Tren Kehadiran Siswa (Recharts) + Pengumuman Sekolah Resmi */}
 <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
 {/* Kolom 1: Card Tren Kehadiran Siswa */}
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 flex flex-col justify-between dark:bg-card-dark">
 
 <div className="space-y-4">
 {/* Header: Title & Automatic Operational Schedule Badge */}
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-emerald-500/20 dark:border-emerald-800/40 bg-emerald-500/10 dark:bg-emerald-950/40 -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 px-5 sm:px-6 py-4 mb-4 min-h-[72px] h-[72px]">
 <div className="flex items-center gap-3">
                <div className="flex size-8.5 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                  <TrendingUp className="size-4.5 text-white" strokeWidth={2.2} />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200 leading-tight">
                    Tren Kehadiran Siswa
                  </h3>
 <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1.5 shrink-0">
 <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
 {unitScheduleType === 'pesantren' ? 'Pondok Pesantren' : 'Fullday School'}
 </span>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
 Visualisasi perbandingan kehadiran harian ({unitScheduleType === 'pesantren' ? 'Senin – Sabtu' : 'Senin – Jumat'})
 </p>
 </div>
 </div>

 {/* Operational Calendar Info Badge */}
 <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 self-start sm:self-auto shrink-0 shadow-xs">
 <Calendar className="size-3.5 text-emerald-600 dark:text-emerald-400" />
 <span>{unitScheduleLabel}</span>
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
 <span className="text-xs font-semibold text-slate-400">
 {(() => {
 const validDays = attendanceTrendChartData.filter((c) => c.rate !== null && c.rate !== undefined && ((c.total || 0) > 0 || (c.hadir || 0) > 0))
 if (validDays.length === 0) return 'Rata-rata: —'
 const totalHadir = validDays.reduce((acc, curr) => acc + (curr.hadir || 0), 0)
 const totalPop = validDays.reduce((acc, curr) => acc + (curr.total || 0), 0)
 const avg = totalPop > 0
 ? Math.round((totalHadir / totalPop) * 100)
 : Math.round(validDays.reduce((acc, curr) => acc + Number(curr.rate), 0) / validDays.length)
 return `Rata-rata: ${avg}% kehadiran`
 })()}
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
 <div className="rounded-xl border border-emerald-200/80/90 bg-white/95 backdrop-blur-sm p-3 shadow-xl dark:border-emerald-800/60 dark:bg-card-dark/95 text-xs space-y-1.5">
 <p className="font-extrabold text-slate-900 dark:text-white border-b border-emerald-100/80 dark:border-emerald-900/40 pb-1">
 {item.day_name || label} ({item.date})
 </p>
 <div className="space-y-1 text-xs">
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

 <div className="pt-3 border-t border-emerald-100/80 dark:border-emerald-900/40/80 flex items-center justify-between text-xs text-slate-400">
 <span>Pemantauan Kehadiran Mingguan</span>
 <span className="font-bold text-emerald-600 dark:text-emerald-400">Presensi Kesiswaan</span>
 </div>
 </div>

 {/* Kolom 2: Card Pengumuman Sekolah Terbaru */}
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 flex flex-col justify-between dark:bg-card-dark">
 
 <div className="space-y-3">
 <div className="flex items-center justify-between border-b border-emerald-500/20 dark:border-emerald-800/40 bg-emerald-500/10 dark:bg-emerald-950/40 -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 px-5 sm:px-6 py-4 mb-4 min-h-[72px] h-[72px]">
 <div className="flex items-center gap-2">
 <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
 <FileText className="h-4 w-4" />
 </span>
 <div>
 <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200 leading-tight">Pengumuman Sekolah Terbaru</h3>
 <p className="text-xs font-semibold text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">Klik pengumuman untuk melihat edaran resmi</p>
 </div>
 </div>
 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-sm border border-emerald-400 bg-emerald-600 text-white dark:bg-emerald-500">
                  <span className="size-2 rounded-full bg-white animate-pulse" />
                  {announcementList.length} Pengumuman
                </span>
 </div>

 <List direction="vertical" hideDividers={false} className="w-full max-w-full divide-y divide-emerald-100/80 dark:divide-emerald-900/40 border-none bg-transparent">
 {announcementList.slice(0, 5).map((ann, idx) => (
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

 <div className="pt-3 border-t border-emerald-100/80 dark:border-emerald-900/40/80 flex items-center justify-between text-xs text-slate-400">
 <span>Edaran Resmi Lembaga</span>
 <span className="font-bold text-amber-600 dark:text-amber-400">Informasi Terpadu</span>
 </div>
 </div>
 </section>

 {/* Collapsible Accordion: Profil Pengurus Yayasan & Pembina Lembaga */}
 <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-card-dark p-4 sm:p-5 shadow-md shadow-emerald-500/10">
 <div
 role="button"
 tabIndex={0}
 onClick={() => setShowYayasanProfile((prev) => !prev)}
 onKeyDown={(e) => {
 if (e.key === 'Enter' || e.key === ' ') {
 e.preventDefault()
 setShowYayasanProfile((prev) => !prev)
 }
 }}
 className="flex items-center justify-between cursor-pointer select-none group"
 >
 <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm group-hover:scale-105 transition-transform">
 <ShieldCheck className="h-4.5 w-4.5" />
 </span>
 <div className="min-w-0">
 <div className="flex items-center gap-2">
 <h4 className="text-base font-bold text-emerald-900 dark:text-emerald-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                    Profil Pengurus Yayasan & Pembina Lembaga
                  </h4>
 <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
 {pengurusYayasanList.length} Pengurus
 </span>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Struktur kepengurusan dan kontak amanah pimpinan yayasan
 </p>
 </div>
 </div>

 <button
 type="button"
 className="flex h-8 w-8 items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-emerald-200/80 dark:border-emerald-800/60 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/60 group-hover:text-emerald-700 transition-all shadow-2xs"
 aria-label={showYayasanProfile ? 'Tutup profil pengurus yayasan' : 'Buka profil pengurus yayasan'}
 >
 {showYayasanProfile ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
 </button>
 </div>

 {/* Collapsible Content */}
 <AnimatePresence>
 {showYayasanProfile && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 exit={{ opacity: 0, height: 0 }}
 transition={{ duration: 0.25 }}
 className="overflow-hidden pt-4 mt-4 border-t border-emerald-500/15 dark:border-emerald-800/40"
 >
 {pengurusYayasanList.length === 0 ? (
 <div className="py-8 text-center text-slate-400">
 <ShieldCheck className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
 <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
 Data profil pengurus yayasan belum dikonfigurasi pada portal yayasan.
 </p>
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
 {pengurusYayasanList.map((pengurus, pIdx) => {
 const pName = pengurus.nama || pengurus.name || 'Pengurus'
 const pRole = pengurus.jabatan || pengurus.role || 'Pengurus Yayasan'
 const pPhoto = pengurus.avatar_url || pengurus.photo_url || pengurus.foto
 const pPhone = pengurus.phone || pengurus.telepon || pengurus.no_hp
 const pEmail = pengurus.email

 return (
 <div
 key={pengurus.id || pIdx}
 className="h-full rounded-2xl border border-emerald-200/80 bg-white dark:bg-card-dark dark:border-emerald-800/60 dark:from-[#151D2A] dark:to-emerald-950/20 p-3.5 space-y-2.5 shadow-xs hover:border-emerald-400 hover:shadow-md hover:shadow-sm transition-all flex flex-col justify-between"
 >
 <div className="flex items-center gap-3">
 <Avatar size="md" className="ring-2 ring-emerald-500/40 border-2 border-emerald-400/50 dark:border-emerald-500/40 shrink-0 shadow-xs">
 {pPhoto && <AvatarImage src={pPhoto} alt={pName} />}
 <AvatarFallback className="h-full w-full rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 dark:from-emerald-950 dark:to-slate-900 text-emerald-700 dark:text-emerald-300 font-black text-xs border border-emerald-200/60 dark:border-emerald-800/60">
 <User className="size-4" />
 </AvatarFallback>
 </Avatar>
 <div className="min-w-0 flex-1">
 <h5 className="text-xs font-black text-slate-900 dark:text-white truncate">
 {pName}
 </h5>
 <p className="text-[10.5px] font-bold text-emerald-700 dark:text-emerald-400 truncate">
 {pRole}
 </p>
 </div>
 </div>

 {(pPhone || pEmail) && (
 <div className="pt-2 border-t border-emerald-100/80 dark:border-emerald-900/40/80 flex items-center justify-between text-[10.5px]">
 {pEmail && <span className="text-slate-400 truncate max-w-[130px]">{pEmail}</span>}
 {pPhone && <span className="text-slate-500 dark:text-slate-400 font-semibold truncate">{pPhone}</span>}
 </div>
 )}
 </div>
 )
 })}
 </div>
 )}
 </motion.div>
 )}
 </AnimatePresence>
 </section>

 {/* HeroUI Dialog Modal Detail Pengumuman Sekolah */}
 <Dialog
 isOpen={Boolean(selectedAnnouncement)}
 onOpenChange={(open) => {
 if (!open) setSelectedAnnouncement(null)
 }}
 className="max-w-xl w-full p-6 border border-emerald-200/80/80 bg-white dark:border-emerald-800/60 dark:bg-card-dark rounded-2xl shadow-2xl"
 >
 <DialogHeader className="pb-4 border-b border-emerald-100/80 dark:border-emerald-900/40">
 <div className="flex items-start gap-3">
 <span className="flex h-9 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
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
 <DialogTitle className="text-base font-black text-slate-900 dark:text-emerald-600 leading-snug">
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
 <div className="rounded-xl border border-emerald-200/70 bg-slate-50/70 p-4 dark:border-emerald-800/60/80 dark:bg-slate-900/50">
 <h5 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
 Isi Edaran / Pengumuman
 </h5>
 <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line font-medium">
 {selectedAnnouncement?.isi || 'Tidak ada isi edaran tertulis.'}
 </p>
 </div>

 <div className="grid grid-cols-2 gap-3 text-xs">
 <div className="rounded-xl border border-emerald-100/80 dark:border-emerald-900/40 bg-white p-3 dark:border-emerald-800/60 dark:bg-card-dark space-y-1">
 <span className="text-[10px] font-bold text-slate-400">Target Audiens:</span>
 <p className="font-extrabold text-slate-800 dark:text-white truncate">
 {selectedAnnouncement?.target || 'Semua Unit'}
 </p>
 </div>
 <div className="rounded-xl border border-emerald-100/80 dark:border-emerald-900/40 bg-white p-3 dark:border-emerald-800/60 dark:bg-card-dark space-y-1">
 <span className="text-[10px] font-bold text-slate-400">Status Edaran:</span>
 <p className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
 <CheckCircle2 className="h-3.5 w-3.5" />
 Aktif & Berlaku
 </p>
 </div>
 </div>
 </DialogBody>

 <DialogFooter className="pt-4 border-t border-emerald-100/80 dark:border-emerald-900/40 flex justify-end">
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

 {/* HeroUI Dialog Modal Pop Up untuk Monitoring Kehadiran Siswa */}
 <Dialog
 isOpen={isAttendanceModalOpen}
 onOpenChange={setIsAttendanceModalOpen}
 className="max-w-4xl w-full p-6 border border-emerald-200/80/80 bg-white dark:border-emerald-800/60 dark:bg-card-dark rounded-2xl shadow-2xl"
 >
 <DialogHeader className="pb-4 border-b border-emerald-100/80 dark:border-emerald-900/40">
 <div className="flex items-center gap-2">
 <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
 <CheckCircle2 className="h-4.5 w-4.5" />
 </span>
 <div>
 <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-emerald-600">
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
 className="w-full h-9.5 rounded-xl border-2 border-[#b6f6d9] bg-slate-50/50 pl-3 pr-8 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-emerald-500"
 />
 </div>

 <div className="flex items-center gap-2 w-full sm:w-auto">
 <span className="text-xs font-bold text-slate-400 shrink-0">Unit:</span>
 <CustomSelect
 value={attendanceFilterUnit}
 onChange={(e) => setAttendanceFilterUnit(e.target.value)}
 className="h-9.5 rounded-xl border border-emerald-200/80 bg-white px-3 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-200"
 >
 <option value="all">Semua Unit Pendidikan</option>
 {unitsList.map((u) => (
 <option key={u.id} value={u.name || u.nama}>
 {u.name || u.nama}
 </option>
 ))}
 </CustomSelect>
 </div>
 </div>

 {/* Data Table Presensi Siswa */}
 <div className="overflow-x-auto rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-card-dark">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-extrabold uppercase tracking-wider dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200">
 <tr>
 <th className="px-4 py-3.5 text-center w-16 text-emerald-900 dark:text-emerald-200 font-extrabold">Avatar</th>
 <th className="px-4 py-3.5 text-emerald-900 dark:text-emerald-200 font-extrabold">Siswa & NISN</th>
 <th className="px-4 py-3.5 text-emerald-900 dark:text-emerald-200 font-extrabold">Unit Pendidikan</th>
 <th className="px-4 py-3.5 text-emerald-900 dark:text-emerald-200 font-extrabold">Kelas / Rombel</th>
 <th className="px-4 py-3.5 text-emerald-900 dark:text-emerald-200 font-extrabold">Waktu Presensi</th>
 <th className="px-4 py-3.5 text-emerald-900 dark:text-emerald-200 font-extrabold">Status</th>
 <th className="px-4 py-3.5 text-emerald-900 dark:text-emerald-200 font-extrabold">Keterangan</th>
 <th className="px-4 py-3.5 text-center text-emerald-900 dark:text-emerald-200 font-extrabold">Aksi</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
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
 <Avatar size="sm" className="mx-auto ring-2 ring-emerald-500/30 border border-emerald-400/50 shadow-2xs">
 {photo && <AvatarImage src={photo} alt={sName} />}
 <AvatarFallback className={st.gender === 'female' ? "h-full w-full rounded-full flex items-center justify-center bg-teal-100 text-teal-800 text-[10px] font-extrabold border border-teal-300/50" : "h-full w-full rounded-full flex items-center justify-center bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-300/50"}>
 <User className="size-3" />
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

 <DialogFooter className="pt-3 border-t border-emerald-100/80 dark:border-emerald-900/40">
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
 initialUnitId={selectedUnitId || data?.context?.unit?.id || currentAuthUser?.unit_id || currentAuthUser?.education_unit_id}
 />
 </ModalErrorBoundary>

 {/* Modal Input Laporan Bulanan Kepala Sekolah (Modul 1 - Poin 3) */}
 <InputLaporanBulananModal
 isOpen={isReportModalOpen}
 onClose={() => setIsReportModalOpen(false)}
 unitName={schoolInfo?.nama || 'Unit Sekolah'}
 onSuccess={fetchDashboard}
 />

 {/* Dialog Modal Detail Supervisi KBM & Jurnal Pembelajaran Guru */}
 <Dialog
 isOpen={Boolean(selectedKbmSession)}
 onOpenChange={(open) => {
 if (!open) setSelectedKbmSession(null)
 }}
 className="max-w-xl w-full p-0 overflow-hidden border-2 border-emerald-500/30 bg-white dark:border-emerald-600/40 dark:bg-card-dark rounded-2xl shadow-2xl"
 >
 {/* Header Modal */}
 <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-md">
 <div className="flex items-center gap-3 min-w-0">
 <div className="flex size-10 items-center justify-center rounded-xl bg-white/20 shadow-inner border border-emerald-200/80 dark:border-emerald-800/60">
 <BookOpen className="size-5" />
 </div>
 <div>
 <h3 className="text-sm font-black text-white">Detail Supervisi KBM & Jurnal Guru</h3>
 <p className="text-xs text-emerald-100 font-medium">
 {selectedKbmSession?.subject_name || selectedKbmSession?.mata_pelajaran || 'Mata Pelajaran'} • {selectedKbmSession?.class_name || selectedKbmSession?.kelas || 'Kelas'}
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setSelectedKbmSession(null)}
 className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 transition-all cursor-pointer font-black text-xs border border-emerald-200/80 dark:border-emerald-800/60"
 >
 ✕
 </button>
 </div>

 {/* Modal Body */}
 <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
 {/* Identity & Status Card */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-emerald-200/70 dark:border-emerald-800/60">
 <div>
 <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Guru Pengampu</p>
 <p className="text-xs font-black text-slate-800 dark:text-slate-100 mt-0.5">
 {selectedKbmSession?.teacher_name || selectedKbmSession?.guru || '—'}
 </p>
 </div>
 <div>
 <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Jadwal & Ruangan</p>
 <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
 {selectedKbmSession?.start_time || selectedKbmSession?.jam_mulai} - {selectedKbmSession?.end_time || selectedKbmSession?.jam_selesai} • {selectedKbmSession?.room || selectedKbmSession?.ruangan || 'Ruang Kelas'}
 </p>
 </div>
 <div>
 <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status Sesi</p>
 <div className="mt-1">
 {selectedKbmSession?.status === 'completed' ? (
 <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300">
 <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Selesai & Ditutup
 </span>
 ) : selectedKbmSession?.is_ongoing ? (
 <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-sky-100 text-sky-800 border border-sky-300 dark:bg-sky-950/60 dark:text-sky-300">
 <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" /> Sedang Berlangsung
 </span>
 ) : (
 <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-emerald-200/80 dark:bg-sky-950/60 dark:text-sky-300">
 Terjadwal
 </span>
 )}
 </div>
 </div>
 <div>
 <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pertemuan & Materi</p>
 <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
 Pertemuan Ke-{selectedKbmSession?.meeting_number || '1'}
 </p>
 </div>
 </div>

 {/* Topik / Pokok Bahasan */}
 <div className="h-full p-3.5 rounded-xl bg-white dark:bg-card-dark dark:from-slate-900 dark:to-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 space-y-1">
 <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Topik / Materi Pembelajaran</p>
 <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
 {selectedKbmSession?.topic || 'Topik materi KBM terpadu'}
 </p>
 </div>

 {/* Catatan Jurnal KBM / Penutupan Kelas */}
 <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border-2 border-emerald-500/25 space-y-1.5">
 <div className="flex items-center gap-2">
 <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 <p className="text-xs font-black text-emerald-800 dark:text-emerald-300">
 Catatan Jurnal Pembelajaran Guru
 </p>
 </div>
 {selectedKbmSession?.meeting_notes && selectedKbmSession.meeting_notes.trim() ? (
 <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium whitespace-pre-wrap bg-white/70 dark:bg-slate-900/60 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60">
 {selectedKbmSession.meeting_notes}
 </p>
 ) : (
 <p className="text-xs text-slate-400 dark:text-slate-500 italic">
 Guru belum mengisi catatan jurnal / evaluasi penutupan sesi KBM ini.
 </p>
 )}
 </div>

 {/* Rekap Kehadiran Siswa di Kelas */}
 {selectedKbmSession?.stats && (
 <div className="space-y-2">
 <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Rekap Presensi Siswa Sesi Ini</p>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
 <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
 <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">Hadir</p>
 <p className="text-base font-black text-emerald-800 dark:text-emerald-200">{selectedKbmSession.stats.present_count ?? 0}</p>
 </div>
 <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
 <p className="text-[10px] font-bold text-sky-700 dark:text-sky-300">Sakit</p>
 <p className="text-base font-black text-sky-800 dark:text-sky-200">{selectedKbmSession.stats.sick_count ?? 0}</p>
 </div>
 <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
 <p className="text-[10px] font-bold text-amber-700 dark:text-amber-300">Izin</p>
 <p className="text-base font-black text-amber-800 dark:text-amber-200">{selectedKbmSession.stats.permit_count ?? 0}</p>
 </div>
 <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
 <p className="text-[10px] font-bold text-rose-700 dark:text-rose-300">Alpa</p>
 <p className="text-base font-black text-rose-800 dark:text-rose-200">{selectedKbmSession.stats.absent_count ?? 0}</p>
 </div>
 </div>
 </div>
 )}
 </div>

 {/* Modal Footer */}
 <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-emerald-200/80 dark:border-emerald-800/60 flex justify-end">
 <button
 type="button"
 onClick={() => setSelectedKbmSession(null)}
 className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
 >
 Tutup
 </button>
 </div>
 </Dialog>

 {/* HeroUI Dialog Modal Chat Direct Pegawai / Guru */}
 <Dialog
 isOpen={Boolean(activeChatUser)}
 onOpenChange={(open) => {
 if (!open) setActiveChatUser(null)
 }}
 showCloseButton={false}
 className="max-w-xl w-full p-0 overflow-hidden border-2 border-emerald-500/30 bg-white dark:border-emerald-600/40 dark:bg-card-dark rounded-2xl shadow-2xl"
 >
 {/* Header Chat */}
 <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-md">
 <div className="flex items-center gap-3 min-w-0">
 <div className="relative shrink-0">
 <Avatar size="lg" className="ring-2 ring-white/80 shadow-md bg-white border-0 shrink-0">
 {(activeChatUser?.avatar_url || activeChatUser?.photo_url || activeChatUser?.foto || activeChatUser?.avatar) && (
 <AvatarImage src={activeChatUser?.avatar_url || activeChatUser?.photo_url || activeChatUser?.foto || activeChatUser?.avatar} alt={activeChatUser?.nama} />
 )}
 <AvatarFallback className="h-full w-full rounded-full flex items-center justify-center bg-gradient-to-br from-white via-emerald-50 to-teal-100 text-emerald-800 font-black text-sm tracking-wide">
 {getInitials(activeChatUser?.nama || activeChatUser?.name || 'User')}
 </AvatarFallback>
 <AvatarBadge status={activeChatUser?.is_online ? 'online' : 'offline'} size="lg" />
 </Avatar>
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2">
 <h3 className="text-sm font-black truncate text-white leading-snug">
 {activeChatUser?.nama || activeChatUser?.name || 'Pegawai'}
 </h3>
 <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${activeChatUser?.is_online ? 'bg-emerald-400/25 text-emerald-100 border border-emerald-300/40' : 'bg-rose-500/30 text-rose-100 border border-rose-300/40'}`}>
 {activeChatUser?.is_online ? 'Online' : 'Offline'}
 </span>
 </div>
 <p className="text-xs text-emerald-100/90 truncate">
 {activeChatUser?.role || activeChatUser?.jabatan || 'Pegawai / Guru'} • {activeChatUser?.dept || activeChatUser?.departemen || 'Unit Sekolah'}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-1.5">
 <button
 type="button"
 onClick={() => setActiveChatUser(null)}
 aria-label="Tutup dialog"
 title="Tutup Obrolan"
 className="flex size-8 items-center justify-center rounded-xl bg-white/20 hover:bg-rose-500 hover:text-white text-white transition-all cursor-pointer border border-white/25 shadow-xs active:scale-95"
 >
 <X className="size-4" strokeWidth={2.5} />
 </button>
 </div>
 </div>

 {/* Body Pesan */}
 <div className="p-4 h-80 overflow-y-auto bg-slate-50/60 dark:bg-card-dark space-y-3 scrollbar-thin">
 {chatLoading ? (
 <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
 <RefreshCw className="h-5 w-5 animate-spin text-emerald-600" />
 <span className="text-xs font-bold">Memuat obrolan...</span>
 </div>
 ) : chatMessages.length === 0 ? (
 <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 p-4">
 <div className="flex h-9 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 mb-2">
 <MessageSquare className="h-6 w-6" />
 </div>
 <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">Mulai Obrolan Langsung</p>
 <p className="text-xs text-slate-400 mt-0.5 max-w-md">
 Kirimkan pesan koordinasi, instruksi, atau tanya jawab terkait aktivitas kesiswaan dan pengajaran.
 </p>
 </div>
 ) : (
 chatMessages.map((msg, mIdx) => {
 const isMe = msg.is_sender || msg.sender_id === currentAuthUser?.id
 const senderDisplayName = isMe ? 'Anda' : (activeChatUser?.name || 'Pegawai')
 return (
 <div key={msg.id || mIdx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-2`}>
 <div
 className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-xs font-medium leading-relaxed shadow-2xs ${
 isMe
 ? 'bg-emerald-600 dark:bg-emerald-600 border border-emerald-500/80 text-white rounded-tr-xs'
 : 'bg-blue-50/95 dark:bg-blue-950/70 border border-blue-200/90 dark:border-blue-800/80 text-slate-900 dark:text-blue-50 rounded-tl-xs'
 }`}
 >
 {/* Header Label Nama pada Isi Chat */}
 <div
 className={`flex items-center gap-1.5 mb-1.5 pb-1 border-b ${
 isMe
 ? 'border-emerald-500/60 justify-end'
 : 'border-blue-200/60 dark:border-blue-800/60 justify-start'
 }`}
 >
 {!isMe && (
 <span className="text-xs font-extrabold tracking-tight text-blue-700 dark:text-blue-300">
 {senderDisplayName}
 </span>
 )}
 <span
 className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
 isMe
 ? 'bg-emerald-700/80 text-emerald-100 border border-emerald-500/40'
 : 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60'
 }`}
 >
 {isMe ? 'Balasan' : 'Pesan Masuk'}
 </span>
 {isMe && (
 <span className="text-xs font-extrabold tracking-tight text-emerald-100">
 {senderDisplayName}
 </span>
 )}
 </div>
 <p className="whitespace-pre-wrap break-words">{msg.message || msg.text || msg.body}</p>
 <span className={`block text-[9px] mt-1 font-bold ${isMe ? 'text-emerald-100/90 text-right' : 'text-blue-600/75 dark:text-blue-300/80'}`}>
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
 <div className="px-4 py-2 bg-white dark:bg-card-dark border-t border-emerald-100/80 dark:border-emerald-900/40/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
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
 <form onSubmit={handleSendChatMessage} className="p-3 bg-white dark:bg-card-dark border-t border-emerald-100/80 dark:border-emerald-900/40 flex items-center gap-2">
 <input
 type="text"
 value={chatInputText}
 onChange={(e) => setChatInputText(e.target.value)}
 placeholder={`Ketik pesan ke ${activeChatUser?.nama || 'rekan kerja'}...`}
 className="flex-1 h-9 rounded-xl border-2 border-[#b6f6d9] bg-slate-50/70 px-3.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100 transition-all"
 autoFocus
 />
 <button
 type="submit"
 disabled={!chatInputText.trim() || chatSending}
 className="flex h-9 px-4 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 dark:bg-slate-100 dark:text-slate-900 dark: hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-xs font-black shadow-sm shadow-sm transition-all cursor-pointer active:scale-95 shrink-0 text-white border border-emerald-600 text-sm font-medium"
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
