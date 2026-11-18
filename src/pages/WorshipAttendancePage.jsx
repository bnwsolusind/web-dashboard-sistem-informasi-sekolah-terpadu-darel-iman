import React, { useState, useEffect, useRef, useMemo } from 'react'
import CustomSelect from '@/components/ui/CustomSelect'
import { motion, AnimatePresence } from 'framer-motion'
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
  School,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { worshipAttendanceService } from '../services/worshipAttendanceService'
import { useAuthStore } from '../stores/authStore'
import {
  MasterDataPage,
  MasterPageHeader,
  MasterActionButton,
  MasterStatCard,
  MasterStatsGrid,
} from '../components/master-data'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppTabs from '../components/app/AppTabs'
import { useToast } from '../components/app'



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
      return <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">Belum Verifikasi</span>
  }
}

// ─── KPI TINTED CARD COMPONENT (DECLARED OUTSIDE TO PREVENT RE-ANIMATION ON 1S CLOCK TICK) ───
function KpiTintedCard({ icon: Icon, label, subtext, value, tone = 'emerald', onClick }) {
  const tones = {
    blue: {
      card: 'border-blue-200/80 bg-blue-50/60 hover:border-blue-300 dark:border-blue-900/50 dark:bg-blue-950/30',
      title: 'text-blue-700 dark:text-blue-400',
      icon: 'text-blue-500',
      val: 'text-blue-600 dark:text-blue-300',
      sub: 'text-blue-600/70 dark:text-blue-400/70',
    },
    emerald: {
      card: 'border-emerald-200/80 bg-emerald-50/60 hover:border-emerald-300 dark:border-emerald-900/50 dark:bg-emerald-950/30',
      title: 'text-emerald-700 dark:text-emerald-400',
      icon: 'text-emerald-500',
      val: 'text-emerald-600 dark:text-emerald-300',
      sub: 'text-emerald-600/70 dark:text-emerald-400/70',
    },
    sky: {
      card: 'border-sky-200/80 bg-sky-50/60 hover:border-sky-300 dark:border-sky-900/50 dark:bg-sky-950/30',
      title: 'text-sky-700 dark:text-sky-400',
      icon: 'text-sky-500',
      val: 'text-sky-600 dark:text-sky-300',
      sub: 'text-sky-600/70 dark:text-sky-400/70',
    },
    amber: {
      card: 'border-amber-200/80 bg-amber-50/60 hover:border-amber-300 dark:border-amber-900/50 dark:bg-amber-950/30',
      title: 'text-amber-700 dark:text-amber-400',
      icon: 'text-amber-500',
      val: 'text-amber-600 dark:text-amber-300',
      sub: 'text-amber-600/70 dark:text-amber-400/70',
    },
    rose: {
      card: 'border-rose-200/80 bg-rose-50/60 hover:border-rose-300 dark:border-rose-900/50 dark:bg-rose-950/30',
      title: 'text-rose-700 dark:text-rose-400',
      icon: 'text-rose-500',
      val: 'text-rose-600 dark:text-rose-300',
      sub: 'text-rose-600/70 dark:text-rose-400/70',
    },
    purple: {
      card: 'border-purple-200/80 bg-purple-50/60 hover:border-purple-300 dark:border-purple-900/50 dark:bg-purple-950/30',
      title: 'text-purple-700 dark:text-purple-400',
      icon: 'text-purple-500',
      val: 'text-purple-600 dark:text-purple-300',
      sub: 'text-purple-600/70 dark:text-purple-400/70',
    },
    teal: {
      card: 'border-teal-200/80 bg-teal-50/60 hover:border-teal-300 dark:border-teal-900/50 dark:bg-teal-950/30',
      title: 'text-teal-700 dark:text-teal-400',
      icon: 'text-teal-500',
      val: 'text-teal-600 dark:text-teal-300',
      sub: 'text-teal-600/70 dark:text-teal-400/70',
    },
  }
  const t = tones[tone] || tones.emerald
  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={`text-left rounded-2xl border ${t.card} p-3.5 shadow-xs transition-all hover:shadow-md ${onClick ? 'cursor-pointer' : 'cursor-default'} group min-w-0`}
    >
      <div className="flex items-center justify-between gap-1 min-w-0">
        <p className={`text-[11px] font-semibold ${t.title} truncate`}>{label}</p>
        <Icon className={`h-4 w-4 shrink-0 ${t.icon} opacity-0 group-hover:opacity-100 transition-opacity`} />
      </div>
      <p className={`mt-1.5 text-xl font-black ${t.val}`}>{value ?? 0}</p>
      {subtext && (
        <p className={`mt-0.5 text-[10px] font-bold ${t.sub} flex items-center gap-0.5 truncate`}>
          {subtext}
        </p>
      )}
    </motion.div>
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
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [now, setNow] = useState(new Date())

  // LIVE REAL-TIME CLOCK TIMER (1s Ticker)
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
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
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
          <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <Moon className="size-6 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                    <Sparkles className="size-3 text-amber-300 animate-pulse" />
                    Ibadah Santri Pesantren
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    Pondok Pesantren
                  </span>
                </div>
                <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Presensi & Absensi Ibadah Santri Pesantren
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 w-full">
                  Monitoring presensi shalat 5 waktu berjamaah di masjid pesantren, tahajud, dzikir, dan program asrama santri mukim.
                </p>
              </div>
            </div>

            {/* Live Clock & Date Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap z-10">
              <div className="hidden sm:flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-white/80 px-3 py-1.5 dark:border-emerald-600/40 dark:bg-slate-900/80 backdrop-blur-sm">
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

              <Button
                type="button"
                variant="primary"
                appearance="fill"
                size="sm"
                onClick={() => { setShowTemplateModal(true); setTemplateStep(1) }}
                prefixIcon={<Plus className="h-4 w-4" />}
                className="!bg-gradient-to-r !from-emerald-600 !to-teal-600 !text-white font-bold shadow-md shadow-emerald-600/25 cursor-pointer"
              >
                Template Baru
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── SCOPED ALERT NOTICE UNTUK KEPALA SEKOLAH REGULER (NON-PESANTREN) ── */}
      {!isPesantrenUnit && userRole !== 'Superadmin' && userRole !== 'Pengurus Yayasan' && (
        <div className="mb-6 rounded-[18px] border border-amber-200/90 bg-amber-50/90 p-5 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 space-y-3.5">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
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

          <div className="flex flex-wrap items-center gap-3 pt-2.5 border-t border-amber-200/80 dark:border-amber-900/50">
            <Link
              to="/dashboard/absensi-ibadah-siswa"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-600/20 transition-all hover:bg-amber-700 hover:scale-105 active:scale-95"
            >
              <School className="h-4 w-4" />
              <span>Kelola Absensi Ibadah Siswa Sekolah ({userUnitName})</span>
            </Link>
          </div>
        </div>
      )}

      {/* ── MASTER TAB SWITCHER (Rapi & Sejajar) ─────────────────────────── */}
      <div className="my-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-[#1B2433]">
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
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
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
                            ? 'border-emerald-500 bg-emerald-50/50 shadow-sm dark:border-emerald-600 dark:bg-emerald-950/30'
                            : 'border-slate-100 bg-white hover:border-slate-200 dark:border-slate-800 dark:bg-[#111827]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isSel ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
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
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300"
                >
                  Lihat Semua Sesi <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* ── MIDDLE COLUMN: SESSION DETAIL & TABLE (col-span-6) ─────────── */}
            <div className="space-y-4 lg:col-span-6">
              {sessionDetail ? (
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433] space-y-4">

                  {/* Header Row */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                          {sessionDetail.template?.nama}
                        </h2>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Opened
                        </span>
                        <button
                          onClick={() => handleOpenEditSessionModal(sessionDetail)}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-[11px] font-bold text-emerald-700 shadow-2xs transition-all hover:bg-emerald-100 hover:scale-105 active:scale-95 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300"
                        >
                          <Edit className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Ubah Jam Manual</span>
                        </button>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span>Lokasi: <strong className="text-slate-700 dark:text-slate-200">{sessionDetail.location_name}</strong></span>
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">|</span>
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>Jam Sesi: <strong className="text-slate-700 dark:text-slate-200">{sessionDetail.scheduled_start_at} - {sessionDetail.scheduled_end_at} WIB</strong></span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toastInfo('Aksi Cepat', 'Pilihan aksi cepat sesi.')}
                        className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        Aksi Cepat <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => toastWarning('Tutup Sesi', 'Sesi telah ditutup.')}
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow transition hover:bg-emerald-700"
                      >
                        Tutup Sesi
                      </button>
                    </div>
                  </div>

                  {/* Sub Tabs */}
                  <div className="flex border-b border-slate-100 text-xs font-bold dark:border-slate-800">
                    <button
                      onClick={() => setCenterTab('presensi')}
                      className={`pb-2.5 px-3 transition border-b-2 ${
                        centerTab === 'presensi'
                          ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Data Presensi
                    </button>
                    <button
                      onClick={() => setCenterTab('musyrif')}
                      className={`pb-2.5 px-3 transition border-b-2 ${
                        centerTab === 'musyrif'
                          ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Verifikasi Musyrif
                    </button>
                    <button
                      onClick={() => setCenterTab('riwayat')}
                      className={`pb-2.5 px-3 transition border-b-2 ${
                        centerTab === 'riwayat'
                          ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Riwayat Sesi
                    </button>
                    <button
                      onClick={() => setCenterTab('catatan')}
                      className={`pb-2.5 px-3 transition border-b-2 ${
                        centerTab === 'catatan'
                          ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
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
                            ? 'border-emerald-500 bg-emerald-50/50 dark:border-emerald-600 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                            : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800'
                        }`}
                      >
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${worshipMethod === 'MANUAL' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'}`}>
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
                            ? 'border-emerald-500 bg-emerald-50/50 dark:border-emerald-600 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                            : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800'
                        }`}
                      >
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${worshipMethod === 'QRCODE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'}`}>
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
                            ? 'border-emerald-500 bg-emerald-50/50 dark:border-emerald-600 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                            : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800'
                        }`}
                      >
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${worshipMethod === 'RFID' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'}`}>
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
                      <div className="mt-3 space-y-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 dark:border-emerald-900/50 dark:bg-emerald-950/30 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <QrCode className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Pemindai QR Code Kartu Santri</span>
                          </div>
                          <button
                            type="button"
                            onClick={openCameraModal}
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition active:scale-95"
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
                            className="h-9 flex-1 rounded-xl border border-emerald-200 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                          <button
                            type="submit"
                            disabled={processingScan}
                            className="rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition active:scale-95"
                          >
                            {processingScan ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : 'Absen'}
                          </button>
                        </form>
                      </div>
                    )}

                    {worshipMethod === 'RFID' && (
                      <div className="mt-3 space-y-2.5 rounded-xl border border-sky-200 bg-sky-50/50 p-3.5 dark:border-sky-900/50 dark:bg-sky-950/30 animate-in fade-in duration-200">
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
                            className="h-9 flex-1 rounded-xl border border-sky-200 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                          <button
                            type="submit"
                            disabled={processingScan}
                            className="rounded-xl bg-sky-600 px-4 text-xs font-bold text-white shadow-sm hover:bg-sky-700 disabled:opacity-50 transition active:scale-95"
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
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="search"
                        placeholder="Cari santri..."
                        value={searchSantri}
                        onChange={(e) => setSearchSantri(e.target.value)}
                        className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <CustomSelect
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="h-9 w-full sm:w-auto min-w-[130px] rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
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
                      className="h-9 w-full sm:w-auto min-w-[130px] rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <option value="">Semua Kamar</option>
                      <option value="Kamar 01">Kamar 01</option>
                      <option value="Kamar 02">Kamar 02</option>
                      <option value="Kamar 03">Kamar 03</option>
                    </CustomSelect>

                    <CustomSelect
                      value={filterKelompok}
                      onChange={(e) => setFilterKelompok(e.target.value)}
                      className="h-9 w-full sm:w-auto min-w-[130px] rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <option value="">Semua Kelompok</option>
                      <option value="Kelompok A">Kelompok A</option>
                      <option value="Kelompok B">Kelompok B</option>
                      <option value="Kelompok C">Kelompok C</option>
                    </CustomSelect>

                    {(filterStatus || filterKamar || filterKelompok || searchSantri) && (
                      <button
                        type="button"
                        onClick={() => {
                          setFilterStatus('')
                          setFilterKamar('')
                          setFilterKelompok('')
                          setSearchSantri('')
                          setCurrentPage(1)
                        }}
                        className="flex h-9 w-full sm:w-auto items-center justify-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 text-xs font-bold transition cursor-pointer dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        Reset Filter
                      </button>
                    )}
                  </div>

                  {/* ── ENTERPRISE DATA TABLE ───────────────────────────── */}
                  <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/80 font-bold text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                          <th className="w-8 px-3 py-3 text-center">
                            <input type="checkbox" className="rounded border-slate-300" />
                          </th>
                          <th className="px-3 py-3">Santri</th>
                          <th className="hidden sm:table-cell px-3 py-3">Kamar / Kelompok</th>
                          <th className="px-3 py-3">Status Presensi</th>
                          <th className="hidden md:table-cell px-3 py-3">Waktu</th>
                          <th className="px-3 py-3 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {paginatedDetails.map((d) => (
                          <tr key={d.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                            <td className="px-3 py-3 text-center">
                              <input type="checkbox" className="rounded border-slate-300" />
                            </td>
                            <td className="px-3 py-3">
                              <button
                                type="button"
                                onClick={() => { setSelectedStudent(d); setShowStudentDrawer(true) }}
                                className="flex items-center gap-2.5 text-left"
                              >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                                  {(d.student?.nama_lengkap || 'S')[0]}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-white">{d.student?.nama_lengkap}</p>
                                  <p className="text-[10px] text-slate-400">{d.student?.nisn}</p>
                                </div>
                              </button>
                              {/* Compact Mobile Metadata Row */}
                              <div className="sm:hidden mt-1.5 flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px]">
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
                                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => { setVerifyStudentId(d.student_id || d.id); setShowVerifyModal(true) }}
                                  title="Edit Status"
                                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 dark:bg-amber-950 dark:text-amber-400"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => { setSelectedStudent(d); setShowStudentDrawer(true) }}
                                  title="Detail Santri"
                                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:text-slate-300"
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
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-700 transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
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
                                  : 'border border-slate-200 hover:bg-slate-50 dark:border-slate-700 text-slate-700 dark:text-slate-200'
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
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-700 transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
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
                      className="h-8 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                    >
                      <option value={5}>5 / halaman</option>
                      <option value={10}>10 / halaman</option>
                      <option value={25}>25 / halaman</option>
                      <option value={50}>50 / halaman</option>
                    </CustomSelect>
                  </div>

                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400 dark:border-slate-800 dark:bg-[#1B2433]">
                  Pilih sesi di kolom kiri untuk melihat detail presensi.
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN: SUMMARY & ACTIVITY (col-span-3) ──────────────── */}
            <div className="space-y-4 lg:col-span-3">

              {/* CARD 1: RINGKASAN SESI */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
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
                  <div className="space-y-1 text-[11px]">
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

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 dark:border-slate-800 text-center">
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
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
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
                    <div className="py-2 text-center text-[11px] text-slate-400">
                      Belum ada verifikasi presensi santri pada sesi ini.
                    </div>
                  )}

                  {(sessionDetail?.status === 'selesai' || sessionDetail?.status === 'ditutup') && (
                    <div className="flex items-start gap-3 relative z-10">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
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
              <div key={t.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
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
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-[#1B2433]">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Verifikasi Status Presensi Santri</h3>
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Status Kehadiran</label>
                <CustomSelect
                  value={verifyStatus}
                  onChange={(e) => setVerifyStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  rows="2"
                  placeholder="Catatan opsional..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow"
                >
                  Simpan Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CAMERA MODAL ──────────────────────────────────────────────────── */}
      {showCameraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#111827] space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <Camera className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Scanner QR Code Kartu Santri
                  </h3>
                  <p className="text-[11px] text-slate-400">Arahkan QR Code pada kartu santri ke area pemindai</p>
                </div>
              </div>
              <button onClick={closeCameraModal} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Video Camera Viewfinder Screen */}
            <div className="relative overflow-hidden rounded-2xl bg-black aspect-video flex items-center justify-center border-2 border-emerald-500/50 shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />

              {/* Viewfinder Target Box Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-48 w-48 rounded-2xl border-2 border-dashed border-emerald-400 bg-emerald-500/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] flex flex-col items-center justify-between p-3">
                  <div className="w-full flex justify-between">
                    <span className="h-4 w-4 border-t-2 border-l-2 border-emerald-400" />
                    <span className="h-4 w-4 border-t-2 border-r-2 border-emerald-400" />
                  </div>
                  <p className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full">
                    Arahkan QR Code Di Sini
                  </p>
                  <div className="w-full flex justify-between">
                    <span className="h-4 w-4 border-b-2 border-l-2 border-emerald-400" />
                    <span className="h-4 w-4 border-b-2 border-r-2 border-emerald-400" />
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
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                />
                <button
                  type="submit"
                  disabled={processingScan}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {processingScan ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Proses QR'}
                </button>
              </form>

              <div className="flex justify-between items-center pt-2 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={cameraActive ? stopCamera : startCamera}
                  className="flex items-center gap-1.5 font-bold text-slate-600 hover:text-slate-800 dark:text-slate-300"
                >
                  {cameraActive ? <><CameraOff className="h-3.5 w-3.5 text-rose-500" /> Matikan Kamera</> : <><Camera className="h-3.5 w-3.5 text-emerald-500" /> Nyalakan Kamera</>}
                </button>
                <button
                  type="button"
                  onClick={closeCameraModal}
                  className="text-slate-500 hover:text-slate-700 font-semibold"
                >
                  Tutup Kamera
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL UBAH MANUAL JADWAL SESI IBADAH SANTRI ──────────────────── */}
      {showEditSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <form onSubmit={handleSaveEditSession} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-[#111827] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Ubah Manual Jam & Lokasi Sesi Santri
              </h3>
              <button type="button" onClick={() => setShowEditSessionModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jam Selesai Sesi</label>
                  <input
                    type="time"
                    required
                    value={editSessionForm.end_time}
                    onChange={(e) => setEditSessionForm({ ...editSessionForm, end_time: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Status Sesi</label>
                <CustomSelect
                  value={editSessionForm.status}
                  onChange={(e) => setEditSessionForm({ ...editSessionForm, status: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="opened">Dibuka (Opened)</option>
                  <option value="upcoming">Akan Datang (Upcoming)</option>
                  <option value="closed">Ditutup (Closed)</option>
                </CustomSelect>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowEditSessionModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── TEMPLATE MODAL ────────────────────────────────────────────────── */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-[#1B2433]">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Tambah Template Ibadah Baru</h3>
            <form onSubmit={handleCreateTemplate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1">Nama Kegiatan Ibadah</label>
                <input
                  type="text"
                  required
                  value={templateForm.nama}
                  onChange={(e) => setTemplateForm({ ...templateForm, nama: e.target.value })}
                  placeholder="Misal: Shalat Subuh Berjamaah"
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    required
                    value={templateForm.end_time}
                    onChange={(e) => setTemplateForm({ ...templateForm, end_time: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow"
                >
                  Simpan Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── STUDENT DRAWER ────────────────────────────────────────────────── */}
      {showStudentDrawer && selectedStudent && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm" onClick={() => setShowStudentDrawer(false)} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl dark:bg-[#1B2433] border-l border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {(selectedStudent.student?.nama_lengkap || 'S')[0]}
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedStudent.student?.nama_lengkap}</p>
                  <p className="text-xs text-slate-400">NISN: {selectedStudent.student?.nisn}</p>
                </div>
              </div>
              <button onClick={() => setShowStudentDrawer(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40 space-y-1">
                <p><span className="text-slate-400">Kamar:</span> <strong className="text-slate-800 dark:text-slate-200">{selectedStudent.room || 'Kamar 01'}</strong></p>
                <p><span className="text-slate-400">Kelompok:</span> <strong className="text-slate-800 dark:text-slate-200">{selectedStudent.group || 'Kelompok A'}</strong></p>
                <p><span className="text-slate-400">Status Presensi:</span> {getAttendancePill(selectedStudent.attendance_status)}</p>
                <p><span className="text-slate-400">Waktu Absen:</span> <strong className="text-slate-800 dark:text-slate-200">{selectedStudent.check_in_time || '04:50 WIB'}</strong></p>
              </div>
            </div>
          </div>
        </>
      )}

      </motion.div>
    </MasterDataPage>
  )
}
