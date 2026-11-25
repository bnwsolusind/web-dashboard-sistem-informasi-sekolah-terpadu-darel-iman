import { HeroUiHeader } from "../components/ui/HeroUiHeader"
import AppModal from "../components/app/AppModal"
import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog'
import {
  Backdrop
} from '@/components/ui/dialog'
import {
  Badge
} from '@/components/ui/badge'
import {
  Avatar,
  AvatarFallback
} from '@/components/ui/avatar'
import {
  Button
} from '@/components/ui/button'
import {
  Pagination
} from '@/components/ui/pagination'
import {
  TableRoot,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@/components/ui/table'
import {
  DatePicker
} from '@/components/ui/date-picker'
import {
  useDebounce
} from '../hooks/useDebounce'
import {
  printCleanTable,
  downloadPdfTable
} from '@/utils/printHelper'
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
  ShieldAlert,
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
  Printer,
  Upload,
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
  GraduationCap,
  Building2,
  School,
  Volume2
} from 'lucide-react'
import {
  useAuthStore
} from '../stores/authStore'
import {
  worshipAttendanceService
} from '../services/worshipAttendanceService'
import {
  studentService
} from '../services/studentService'
import {
  kelasService
} from '../services/kelasService'
import {
  educationUnitService
} from '../services/educationUnitService'
import {
  SquircleActionButton,
  PrintOptionModal
} from '@/components/master-data'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import PageContainer from '../components/app/PageContainer'
import {
  useToast,
  KpiStatCard
} from '../components/app'

// ── HEROUI FILTER BAR SELECT DROPDOWN COMPONENT ──
function HeroUiFilterSelect({
 value,
 onChange,
 options = [],
 placeholder = 'Pilih...',
 icon: IconComponent = null,
 className = '',
 popoverWidth = 'min-w-[180px]',
 searchable = false,
 disabled = false,
}) {
 const [isOpen, setIsOpen] = useState(false)
 const [search, setSearch] = useState('')
 const containerRef = useRef(null)

 useEffect(() => {
 function handleClickOutside(event) {
 if (containerRef.current && !containerRef.current.contains(event.target)) {
 setIsOpen(false)
 }
 }
 if (isOpen) {
 document.addEventListener('mousedown', handleClickOutside)
 }
 return () => {
 document.removeEventListener('mousedown', handleClickOutside)
 }
 }, [isOpen])

 const selectedOption = useMemo(() => {
 return options.find((opt) => String(opt.value) === String(value))
 }, [options, value])

 const filteredOptions = useMemo(() => {
 if (!searchable || !search.trim()) return options
 const q = search.toLowerCase()
 return options.filter((opt) =>
 opt.label && String(opt.label).toLowerCase().includes(q)
 )
 }, [options, search, searchable])

 return (
 <div className={`relative ${className}`} ref={containerRef}>
 <button
 type="button"
 disabled={disabled}
 onClick={() => {
 if (!disabled) {
 setIsOpen((prev) => !prev)
 setSearch('')
 }
 }}
 className={`h-9 w-full flex items-center justify-between gap-2 rounded-xl border px-3 text-xs font-semibold transition-all duration-200 cursor-pointer ${
 disabled
 ? 'border-emerald-200/80 bg-slate-100 text-slate-400 dark:border-emerald-800/60 dark:bg-slate-800/60 cursor-not-allowed'
 : isOpen
 ? 'border-[#0E5C44] bg-white ring-2 ring-[#0E5C44]/15 dark:border-[#3FBF75] dark:bg-[#111827] dark:ring-[#3FBF75]/20 text-slate-900 dark:text-white shadow-xs'
 : value !== '' && value !== undefined && value !== null && value !== 'ALL'
 ? 'border-emerald-300 bg-emerald-50/50 text-emerald-900 dark:border-emerald-800/80 dark:bg-emerald-950/40 dark:text-emerald-200'
 : 'border-emerald-200/90 bg-white text-slate-800 hover:border-emerald-300 dark:border-emerald-700/80 dark:bg-[#111827] dark:text-slate-100 dark:hover:border-emerald-600/80'
 }`}
 >
 <div className="flex items-center gap-1.5 truncate">
 {IconComponent && (
 <IconComponent className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
 )}
 <span className="truncate">
 {selectedOption ? selectedOption.label : placeholder}
 </span>
 </div>
 <ChevronDown
 className={`size-3.5 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${
 isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
 }`}
 />
 </button>

 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ opacity: 0, scale: 0.96, y: -4 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.96, y: -4 }}
 transition={{ duration: 0.15, ease: 'easeOut' }}
 className={`absolute left-0 top-full mt-1.5 z-[90] ${popoverWidth} overflow-hidden rounded-xl border border-emerald-200/90 bg-white/95 backdrop-blur-md shadow-2xl dark:border-emerald-700/80/80 dark:bg-[#182232]/95`}
 >
 {searchable && options.length > 5 && (
 <div className="p-2 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <div className="relative">
 <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Cari..."
 className="w-full rounded-lg border-2 border-[#b6f6d9] bg-slate-50/60 pl-8 pr-2.5 py-1 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#0E5C44] focus:outline-none dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-100"
 autoFocus
 />
 </div>
 </div>
 )}

 <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
 {filteredOptions.length === 0 ? (
 <div className="px-3 py-3 text-center text-xs text-slate-400">
 Tidak ada data
 </div>
 ) : (
 filteredOptions.map((opt) => {
 const isSelected = String(opt.value) === String(value)
 return (
 <button
 key={String(opt.value)}
 type="button"
 disabled={opt.disabled}
 onClick={() => {
 onChange(opt.value)
 setIsOpen(false)
 }}
 className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold transition-colors text-left cursor-pointer ${
 isSelected
 ? 'bg-emerald-500/15 text-emerald-900 font-bold dark:bg-emerald-500/20 dark:text-emerald-300'
 : 'text-slate-700 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800/60'
 }`}
 >
 <span className="truncate">{opt.label}</span>
 {isSelected && (
 <Check className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-1.5" />
 )}
 </button>
 )
 })
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 )
}

// ── HEROUI MODAL FORM SELECT DROPDOWN COMPONENT ──
function HeroUiModalSelect({
 value,
 onChange,
 options = [],
 placeholder = 'Pilih...',
 label = null,
 required = false,
 icon: IconComponent = null,
 disabled = false,
 searchable = false,
 className = '',
}) {
 const [isOpen, setIsOpen] = useState(false)
 const [search, setSearch] = useState('')
 const containerRef = useRef(null)

 useEffect(() => {
 function handleClickOutside(event) {
 if (containerRef.current && !containerRef.current.contains(event.target)) {
 setIsOpen(false)
 }
 }
 if (isOpen) {
 document.addEventListener('mousedown', handleClickOutside)
 }
 return () => {
 document.removeEventListener('mousedown', handleClickOutside)
 }
 }, [isOpen])

 const selectedOption = useMemo(() => {
 return options.find((opt) => String(opt.value) === String(value))
 }, [options, value])

 const filteredOptions = useMemo(() => {
 if (!searchable || !search.trim()) return options
 const q = search.toLowerCase()
 return options.filter(
 (opt) =>
 (opt.label && String(opt.label).toLowerCase().includes(q)) ||
 (opt.subtext && String(opt.subtext).toLowerCase().includes(q))
 )
 }, [options, search, searchable])

 return (
 <div className={`relative w-full ${className}`} ref={containerRef}>
 {label && (
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">
 {label} {required && <span className="text-rose-500">*</span>}
 </label>
 )}

 {/* Button Trigger HeroUI */}
 <button
 type="button"
 disabled={disabled}
 onClick={() => {
 if (!disabled) {
 setIsOpen((prev) => !prev)
 setSearch('')
 }
 }}
 className={`w-full flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 text-left cursor-pointer ${
 disabled
 ? 'bg-slate-100 dark:bg-slate-800/60 border-emerald-200/80 dark:border-emerald-800/60 text-slate-400 cursor-not-allowed'
 : isOpen
 ? 'border-[#0E5C44] bg-white ring-4 ring-[#0E5C44]/12 dark:border-[#3FBF75] dark:bg-slate-900 dark:ring-[#3FBF75]/20 text-slate-800 dark:text-slate-100 shadow-sm'
 : 'border-emerald-300 bg-white hover:border-emerald-400 dark:border-emerald-700/80 dark:bg-slate-800 dark:hover:border-emerald-600/80 text-slate-800 dark:text-slate-100'
 }`}
 >
 <div className="flex items-center gap-2 truncate">
 {IconComponent && (
 <IconComponent className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
 )}
 {selectedOption ? (
 <span className="truncate">{selectedOption.label}</span>
 ) : (
 <span className="text-slate-400 dark:text-slate-500 truncate">{placeholder}</span>
 )}
 </div>
 <ChevronDown
 className={`size-4 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${
 isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
 }`}
 />
 </button>

 {/* Dropdown Popover Panel HeroUI */}
 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ opacity: 0, scale: 0.96, y: -4 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.96, y: -4 }}
 transition={{ duration: 0.15, ease: 'easeOut' }}
 className="absolute left-0 right-0 top-full mt-1.5 z-[95] overflow-hidden rounded-xl border border-emerald-200/90 bg-white/95 backdrop-blur-md shadow-2xl dark:border-emerald-700/80/80 dark:bg-[#182232]/95"
 >
 {searchable && options.length > 5 && (
 <div className="p-2 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <div className="relative">
 <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Ketik untuk mencari..."
 className="w-full rounded-lg border-2 border-[#b6f6d9] bg-slate-50/60 pl-8 pr-2.5 py-1.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#0E5C44] focus:outline-none dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-100"
 autoFocus
 />
 </div>
 </div>
 )}

 <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
 {filteredOptions.length === 0 ? (
 <div className="px-3 py-3 text-center text-xs text-slate-400">
 Tidak ada opsi yang sesuai
 </div>
 ) : (
 filteredOptions.map((opt) => {
 const isSelected = String(opt.value) === String(value)
 return (
 <button
 key={String(opt.value)}
 type="button"
 disabled={opt.disabled}
 onClick={() => {
 onChange(opt.value)
 setIsOpen(false)
 }}
 className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors text-left cursor-pointer ${
 isSelected
 ? 'bg-emerald-500/15 text-emerald-900 font-bold dark:bg-emerald-500/20 dark:text-emerald-300'
 : 'text-slate-700 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800/60'
 }`}
 >
 <div>
 <div className="truncate">{opt.label}</div>
 {opt.subtext && (
 <div className="text-[10px] text-slate-400 font-normal">
 {opt.subtext}
 </div>
 )}
 </div>
 {isSelected && (
 <Check className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-1.5" />
 )}
 </button>
 )
 })
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 )
}

export default function StudentWorshipAttendancePage() {
 const authUser = useAuthStore((s) => s.user) || (() => {
 try {
 const raw = localStorage.getItem('school_erp_user') || sessionStorage.getItem('school_erp_user')
 return raw ? JSON.parse(raw) : null
 } catch {
 return null
 }
 })()

 const userRole = authUser?.role || authUser?.roles?.[0] || 'User'
 
 // Resolve exact logged in user unit name dynamically
 const userUnitName =
 authUser?.education_unit_name ||
 authUser?.education_unit?.nama ||
 authUser?.education_unit?.name ||
 authUser?.unit_name ||
 authUser?.unit?.nama ||
 authUser?.school_info?.nama_unit ||
 'Unit Pendidikan'

 const isSuperOrYayasan = userRole === 'Superadmin' || userRole === 'Pengurus Yayasan'

 const [worshipMethod, setWorshipMethod] = useState('MANUAL') // 'MANUAL' | 'QRCODE' | 'RFID'
 const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
 const [now, setNow] = useState(new Date())

 // LIVE REAL-TIME CLOCK TIMER (1s Ticker)
 useEffect(() => {
 const timer = setInterval(() => setNow(new Date()), 1000)
 return () => clearInterval(timer)
 }, [])

 const [sessions, setSessions] = useState([])
 const [selectedSession, setSelectedSession] = useState(null)
 
 // Dynamic student list scoped to active logged in unit
 const [students, setStudents] = useState([])

 // Dynamic class options based on database rombel
 const [availableClasses, setAvailableClasses] = useState([])
 const [educationUnits, setEducationUnits] = useState([])

 useEffect(() => {
 let active = true

 educationUnitService
 .getDaftar({ per_page: 100 })
 .then((res) => {
 const raw = res?.data?.data || res?.data || []
 if (active && Array.isArray(raw)) {
 setEducationUnits(raw)
 }
 })
 .catch(() => {})

 worshipAttendanceService
 .getSessions({ date })
 .then((res) => {
 const raw = res?.data?.data || res?.data || []
 if (active && Array.isArray(raw) && raw.length > 0) {
 setSessions(raw)
 setSelectedSession((prev) => prev || raw[0])
 }
 })
 .catch(() => {})

 studentService
 .getDaftar({ per_page: 100 })
 .then((res) => {
 const raw = res?.data?.data || res?.data || []
 if (active && Array.isArray(raw) && raw.length > 0) {
 const mapped = raw.map((st) => ({
 id: st.id,
 nisn: st.nisn || st.nis || '-',
 name: st.full_name || st.name || 'Siswa',
 gender: st.gender === 'female' || st.jenis_kelamin === 'P' ? 'P' : 'L',
 class_name: st.kelas?.nama_kelas || st.kelas?.nama || 'Kelas',
 unit_name: st.educationUnit?.name || userUnitName,
 status: 'belum_verifikasi',
 time: '-',
 method: '-',
 selected: false,
 }))
 setStudents(mapped)
 }
 })
 .catch(() => {})

 kelasService
 .getDaftar()
 .then((res) => {
 const raw = res?.data?.data || res?.data || []
 if (active && Array.isArray(raw) && raw.length > 0) {
 setAvailableClasses(raw.map((c) => c.nama_kelas || c.nama).filter(Boolean))
 }
 })
 .catch(() => {})

 return () => {
 active = false
 }
 }, [date, userUnitName])

 // Filters & Search — Strictly scope filterUnit if non-superadmin
 const [searchQuery, setSearchQuery] = useState('')
 const [filterClass, setFilterClass] = useState('ALL')
 const [filterUnit, setFilterUnit] = useState(isSuperOrYayasan ? 'ALL' : userUnitName)
 const [filterStatus, setFilterStatus] = useState('ALL')
 const [perPage, setPerPage] = useState(10)

 const unitOptions = useMemo(() => {
 const opts = []
 if (isSuperOrYayasan) {
 opts.push({ value: 'ALL', label: 'Semua Unit Pendidikan' })
 }
 if (educationUnits.length > 0) {
 educationUnits.forEach((u) => {
 opts.push({ value: u.name, label: u.name })
 })
 } else {
 opts.push({ value: userUnitName, label: userUnitName })
 }
 return opts
 }, [isSuperOrYayasan, educationUnits, userUnitName])

 const classOptions = useMemo(() => {
 return [
 { value: 'ALL', label: 'Semua Kelas / Rombel' },
 ...availableClasses.map((cls) => ({ value: cls, label: cls })),
 ]
 }, [availableClasses])

 const statusOptions = [
 { value: 'ALL', label: 'Semua Status Presensi' },
 { value: 'hadir_berjamaah', label: 'Hadir Berjamaah' },
 { value: 'masbuk', label: 'Masbuk / Terlambat' },
 { value: 'uzur_sakit', label: 'Uzur / Sakit' },
 { value: 'izin', label: 'Izin' },
 { value: 'alpa', label: 'Alpa' },
 { value: 'belum_verifikasi', label: 'Belum Verifikasi' },
 ]

 const perPageOptions = [
 { value: 5, label: '5 / hal' },
 { value: 10, label: '10 / hal' },
 { value: 25, label: '25 / hal' },
 { value: 50, label: '50 / hal' },
 ]

 const editSessionStatusOptions = [
 { value: 'opened', label: 'Dibuka (Opened)' },
 { value: 'upcoming', label: 'Akan Datang (Upcoming)' },
 { value: 'closed', label: 'Ditutup (Closed)' },
 ]

 const verifyStatusOptions = [
 { value: 'hadir_berjamaah', label: 'Hadir Berjamaah' },
 { value: 'masbuk', label: 'Masbuk / Terlambat' },
 { value: 'uzur_sakit', label: "Uzur / Sakit (Halangan Syar'i)" },
 { value: 'izin', label: 'Izin UKS / Izin Khusus' },
 { value: 'alpa', label: 'Alpa / Tanpa Keterangan' },
 ]

 const templateCategoryOptions = [
 { value: 'shalat_wajib', label: 'Shalat Wajib' },
 { value: 'shalat_sunnah', label: 'Shalat Sunnah (Dhuha)' },
 { value: 'ibadah_lain', label: 'Pembiasaan Doa & Dzikir' },
 ]

 const templateObligationOptions = [
 { value: 'wajib', label: 'Wajib Sekolah' },
 { value: 'sunnah_muakkad', label: 'Sunnah Muakkad' },
 { value: 'pembiasaan', label: 'Pembiasaan Harian' },
 ]

 // Modal Data Siswa Presensi Shalat
 const [isAttendingModalOpen, setIsAttendingModalOpen] = useState(false)
 const [modalStatusFilter, setModalStatusFilter] = useState('hadir')
 const [modalSearchQuery, setModalSearchQuery] = useState('')
 const [isPrintTableModalOpen, setIsPrintTableModalOpen] = useState(false)

 const handleOpenAttendingModal = (status = 'hadir') => {
 setModalStatusFilter(status)
 setModalSearchQuery('')
 setIsAttendingModalOpen(true)
 }

 // Scanning & Camera State
 const [scanInput, setScanInput] = useState('')
 const [processingScan, setProcessingScan] = useState(false)
 const [showCameraModal, setShowCameraModal] = useState(false)
 const [cameraActive, setCameraActive] = useState(false)
 const [cameraLoading, setCameraLoading] = useState(false)
 const [cameraError, setCameraError] = useState('')
 const videoRef = useRef(null)
 const streamRef = useRef(null)

 // Modal Verification & Templates State
 const [showVerifyModal, setShowVerifyModal] = useState(false)
 const [selectedStudentForVerify, setSelectedStudentForVerify] = useState(null)
 const [verifyStatus, setVerifyStatus] = useState('hadir_berjamaah')
 const [verifyNotes, setVerifyNotes] = useState('')

 // Modal Edit Manual Jam Sesi
 const [showEditSessionModal, setShowEditSessionModal] = useState(false)
 const [editSessionForm, setEditSessionForm] = useState({
 id: '',
 nama: '',
 start_time: '12:00',
 end_time: '12:45',
 location_name: '',
 status: 'opened',
 })

 // Template Form State
 const [showTemplateModal, setShowTemplateModal] = useState(false)
 const [templateForm, setTemplateForm] = useState({
 nama: '',
 code: '',
 category: 'shalat_wajib',
 obligation_type: 'wajib',
 education_unit_name: userUnitName,
 gender_scope: 'all',
 start_time: '12:00',
 end_time: '12:45',
 location_name: 'Masjid Utama Sekolah',
 })

 const toast = useToast()
 const toastSuccess = (title, message) => toast.success(title, message)
 const toastError = (title, message) => toast.error(title, message)
 const toastWarning = (title, message) => toast.warning(title, message)
 const toastInfo = (title, message) => toast.info(title, message)

 // Format Dynamic Day & Date Display (Indonesian Locale)
 const formattedDayName = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(now)
 const formattedFullDate = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(now)
 const formattedLiveClock = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

 // ── CAMERA & WEBCAM HANDLERS FOR QR SCANNER ──────────────────────────────
 const startCamera = async () => {
 setCameraLoading(true)
 setCameraError('')
 try {
 if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
 const stream = await navigator.mediaDevices.getUserMedia({
 video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
 })
 streamRef.current = stream
 if (videoRef.current) {
 videoRef.current.srcObject = stream
 await videoRef.current.play()
 }
 setCameraActive(true)
 toastSuccess('Kamera Pemindai Aktif', 'Arahkan kamera ke QR Code Kartu Siswa.')
 } else {
 setCameraError('Kamera tidak didukung oleh peramban ini.')
 toastError('Kamera Tidak Didukung', 'Gunakan peramban modern atau input manual.')
 }
 } catch (err) {
 console.error('Camera access error:', err)
 setCameraError('Akses kamera ditolak atau perangkat kamera tidak ditemukan.')
 toastError('Gagal Mengakses Kamera', 'Pastikan izin kamera diizinkan pada peramban.')
 } finally {
 setCameraLoading(false)
 }
 }

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
 return () => stopCamera()
 }, [])

 // ── STATS CALCULATION ────────────────────────────────────────────────────
 const totalStudents = students.length
 const countHadir = students.filter((s) => s.status === 'hadir_berjamaah').length
 const countMasbuk = students.filter((s) => s.status === 'masbuk').length
 const countUzur = students.filter((s) => s.status === 'uzur_sakit').length
 const countIzin = students.filter((s) => s.status === 'izin').length
 const countAlpa = students.filter((s) => s.status === 'alpa').length
 const countBelum = students.filter((s) => s.status === 'belum_verifikasi').length
 const pctHadir = totalStudents > 0 ? ((countHadir / totalStudents) * 100).toFixed(1) : '0'

 const debouncedSearchQuery = useDebounce(searchQuery, 350)
 const [currentPage, setCurrentPage] = useState(1)

 // ── FILTERED STUDENTS ────────────────────────────────────────────────────
 const filteredStudents = students.filter((s) => {
 const matchSearch =
 !debouncedSearchQuery ||
 s.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
 s.nisn.includes(debouncedSearchQuery)
 const matchClass = filterClass === 'ALL' || s.class_name === filterClass
 const matchUnit = filterUnit === 'ALL' || s.unit_name === filterUnit || !isSuperOrYayasan
 const matchStatus = filterStatus === 'ALL' || s.status === filterStatus
 return matchSearch && matchClass && matchUnit && matchStatus
 })

 // Reset page on filter change
 useEffect(() => {
 setCurrentPage(1)
 }, [debouncedSearchQuery, filterClass, filterUnit, filterStatus, perPage])

 const totalPages = Math.max(1, Math.ceil(filteredStudents.length / perPage))
 const paginatedStudents = useMemo(() => {
 const start = (currentPage - 1) * perPage
 return filteredStudents.slice(start, start + perPage)
 }, [filteredStudents, currentPage, perPage])

 // ── MANUAL CHECKLIST HANDLERS ─────────────────────────────────────────────
 const toggleSelectStudent = (id) => {
 setStudents((prev) =>
 prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
 )
 }

 const toggleSelectAllFiltered = () => {
 const allSelected = filteredStudents.every((s) => s.selected)
 const filteredIds = new Set(filteredStudents.map((s) => s.id))
 setStudents((prev) =>
 prev.map((s) => (filteredIds.has(s.id) ? { ...s, selected: !allSelected } : s))
 )
 }

 const handleBulkStatusChange = (targetStatus) => {
 const selectedCount = students.filter((s) => s.selected).length
 if (selectedCount === 0) {
 toastWarning('Pilih Siswa', 'Silakan checklist siswa yang ingin diubah statusnya.')
 return
 }

 const nowStr = new Date().toLocaleTimeString('id-ID')
 setStudents((prev) =>
 prev.map((s) =>
 s.selected
 ? {
 ...s,
 status: targetStatus,
 method: 'Manual Checklist (Guru)',
 time: targetStatus === 'hadir_berjamaah' || targetStatus === 'masbuk' ? nowStr : '-',
 verified_by: 'Guru / Wali Kelas',
 selected: false,
 }
 : s
 )
 )

 const labelMap = {
 hadir_berjamaah: 'Hadir Berjamaah',
 masbuk: 'Masbuk / Terlambat',
 uzur_sakit: 'Uzur / Sakit',
 alpa: 'Alpa / Tidak Hadir',
 }

 toastSuccess('Presensi Simpan Manual', `${selectedCount} siswa berhasil ditandai "${labelMap[targetStatus] || targetStatus}".`)
 }

 // ── PROCESS SCAN CODE (QR CODE / RFID TAP) ────────────────────────────────
 const handleProcessScan = (code) => {
 if (!code.trim()) return
 setProcessingScan(true)

 setTimeout(() => {
 const match = students.find(
 (s) => s.nisn === code.trim() || s.id.toLowerCase() === code.trim().toLowerCase()
 )

 if (match) {
 const nowStr = new Date().toLocaleTimeString('id-ID')
 setStudents((prev) =>
 prev.map((s) =>
 s.id === match.id
 ? {
 ...s,
 status: 'hadir_berjamaah',
 time: nowStr,
 method: worshipMethod === 'QRCODE' ? 'Scan QR Code Kartu' : 'RFID Tap',
 verified_by: 'Sistem Kartu Siswa',
 }
 : s
 )
 )
 toastSuccess('Scan Presensi Berhasil!', `[NISN: ${match.nisn}] ${match.name} (${match.class_name}) - Hadir Berjamaah.`)
 if (showCameraModal) {
 setShowCameraModal(false)
 stopCamera()
 }
 } else {
 toastError('Kartu Siswa Tidak Dikenali', `NISN/Kode "${code}" tidak ditemukan pada daftar kelas.`)
 }
 setScanInput('')
 setProcessingScan(false)
 }, 350)
 }

 // ── HANDLER UBAH JADWAL SHOLAT MANUAL ─────────────────────────────────────
 const handleOpenEditSessionModal = (session) => {
 setEditSessionForm({
 id: session.id,
 nama: session.template.nama,
 start_time: session.scheduled_start_at,
 end_time: session.scheduled_end_at,
 location_name: session.location_name,
 status: session.status,
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

 toastSuccess('Jadwal Sholat Diperbarui', `Jam & lokasi ${editSessionForm.nama} berhasil disesuaikan.`)
 setShowEditSessionModal(false)
 }

 const formatStatusLabel = (st) => {
 if (st === 'hadir') return 'Hadir Berjamaah'
 if (st === 'masbuk') return 'Masbuk / Terlambat'
 if (st === 'uzur') return 'Uzur / Sakit'
 if (st === 'izin') return 'Izin'
 if (st === 'alpa') return 'Alpa'
 if (st === 'belum_verifikasi') return 'Belum Verifikasi'
 return 'Semua Status'
 }

 const filteredModalStudents = students.filter((st) => {
 const matchesSearch =
 modalSearchQuery === '' ||
 st.name.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
 st.nisn.includes(modalSearchQuery) ||
 st.class_name.toLowerCase().includes(modalSearchQuery.toLowerCase())

 let matchesStatus = true
 if (modalStatusFilter === 'hadir') matchesStatus = st.status === 'hadir'
 else if (modalStatusFilter === 'masbuk') matchesStatus = st.status === 'masbuk'
 else if (modalStatusFilter === 'uzur') matchesStatus = st.status === 'uzur'
 else if (modalStatusFilter === 'izin') matchesStatus = st.status === 'izin' || st.status === 'alpa'
 else if (modalStatusFilter === 'belum_verifikasi') matchesStatus = st.status === 'belum_verifikasi'

 return matchesSearch && matchesStatus
 })

 const handlePrintModalTable = () => {
 const columns = [
 { key: 'no', label: 'No' },
 { key: 'nisn', label: 'NISN' },
 { key: 'name', label: 'Nama Siswa' },
 { key: 'class_name', label: 'Kelas' },
 { key: 'status_label', label: 'Status Presensi Shalat' },
 { key: 'time', label: 'Waktu Presensi' },
 { key: 'method', label: 'Metode' },
 ]

 const data = filteredModalStudents.map((st, idx) => ({
 no: idx + 1,
 nisn: st.nisn,
 name: st.name,
 class_name: st.class_name,
 status_label: formatStatusLabel(st.status),
 time: st.time || '-',
 method: st.method || '-',
 }))

 printCleanTable({
 title: `DATA KEHADIRAN SISWA: ${selectedSession?.template.nama}`,
 subtitle: `Sesi: ${selectedSession?.template.nama} | Unit: ${userUnitName} | Filter: ${formatStatusLabel(modalStatusFilter)}`,
 columns,
 data,
 })
 }

 const handleDownloadPdfModalTable = () => {
 const columns = [
 { key: 'no', label: 'No' },
 { key: 'nisn', label: 'NISN' },
 { key: 'name', label: 'Nama Siswa' },
 { key: 'class_name', label: 'Kelas' },
 { key: 'status_label', label: 'Status Presensi Shalat' },
 { key: 'time', label: 'Waktu Presensi' },
 { key: 'method', label: 'Metode' },
 ]

 const data = filteredModalStudents.map((st, idx) => ({
 no: idx + 1,
 nisn: st.nisn,
 name: st.name,
 class_name: st.class_name,
 status_label: formatStatusLabel(st.status),
 time: st.time || '-',
 method: st.method || '-',
 }))

 downloadPdfTable({
 filename: `Presensi_Sholat_${selectedSession?.template.code || 'LIST'}_${date}.pdf`,
 title: `DATA KEHADIRAN SISWA: ${selectedSession?.template.nama}`,
 subtitle: `Sesi: ${selectedSession?.template.nama} | Unit: ${userUnitName} | Filter: ${formatStatusLabel(modalStatusFilter)}`,
 columns,
 data,
 })
 }

 const handlePrintCleanTableMain = () => {
 const columns = [
 { key: 'no', label: 'No' },
 { key: 'nisn', label: 'NISN' },
 { key: 'name', label: 'Nama Siswa' },
 { key: 'class_name', label: 'Kelas' },
 { key: 'status_label', label: 'Status Presensi Shalat' },
 { key: 'time', label: 'Waktu Presensi' },
 { key: 'method', label: 'Metode' },
 ]

 const data = filteredStudents.map((st, idx) => ({
 no: idx + 1,
 nisn: st.nisn,
 name: st.name,
 class_name: st.class_name,
 status_label: formatStatusLabel(st.status),
 time: st.time || '-',
 method: st.method || '-',
 }))

 printCleanTable({
 title: `DATA KEHADIRAN SISWA: ${selectedSession?.template.nama}`,
 subtitle: `Sesi: ${selectedSession?.template.nama} | Unit: ${userUnitName} | Jam: ${selectedSession?.scheduled_start_at} - ${selectedSession?.scheduled_end_at} WIB | Lokasi: ${selectedSession?.location_name}`,
 columns,
 data,
 })
 }

 const handleDownloadPdfTableMain = () => {
 const columns = [
 { key: 'no', label: 'No' },
 { key: 'nisn', label: 'NISN' },
 { key: 'name', label: 'Nama Siswa' },
 { key: 'class_name', label: 'Kelas' },
 { key: 'status_label', label: 'Status Presensi Shalat' },
 { key: 'time', label: 'Waktu Presensi' },
 { key: 'method', label: 'Metode' },
 ]

 const data = filteredStudents.map((st, idx) => ({
 no: idx + 1,
 nisn: st.nisn,
 name: st.name,
 class_name: st.class_name,
 status_label: formatStatusLabel(st.status),
 time: st.time || '-',
 method: st.method || '-',
 }))

 downloadPdfTable({
 filename: `Rekap_Presensi_Sholat_${selectedSession?.template.code || 'ROSTER'}_${date}.pdf`,
 title: `DATA KEHADIRAN SISWA: ${selectedSession?.template.nama}`,
 subtitle: `Sesi: ${selectedSession?.template.nama} | Unit: ${userUnitName} | Jam: ${selectedSession?.scheduled_start_at} - ${selectedSession?.scheduled_end_at} WIB | Lokasi: ${selectedSession?.location_name}`,
 columns,
 data,
 })
 }

 // ── SAVE SINGLE STUDENT VERIFICATION MODAL ────────────────────────────────
 const handleSaveVerify = () => {
 if (!selectedStudentForVerify) return
 const nowStr = new Date().toLocaleTimeString('id-ID')
 setStudents((prev) =>
 prev.map((s) =>
 s.id === selectedStudentForVerify.id
 ? {
 ...s,
 status: verifyStatus,
 notes: verifyNotes,
 time: verifyStatus === 'hadir_berjamaah' || verifyStatus === 'masbuk' ? nowStr : '-',
 verified_by: 'Guru / Wali Kelas',
 }
 : s
 )
 )
 toastSuccess('Status Ibadah Diperbarui', `Status ${selectedStudentForVerify.name} diperbarui menjadi "${verifyStatus}".`)
 setShowVerifyModal(false)
 setSelectedStudentForVerify(null)
 setVerifyNotes('')
 }

 // ── CREATE NEW WORSHIP TEMPLATE ───────────────────────────────────────────
 const handleCreateTemplate = (e) => {
 e.preventDefault()
 if (!templateForm.nama) {
 toastWarning('Form Belum Lengkap', 'Silakan isi nama kegiatan ibadah sekolah.')
 return
 }
 const newSession = {
 id: `school-session-${Date.now()}`,
 scheduled_start_at: templateForm.start_time,
 scheduled_end_at: templateForm.end_time,
 status: 'upcoming',
 location_name: templateForm.location_name || '-',
 template: {
 id: `tmpl-${Date.now()}`,
 nama: templateForm.nama,
 code: templateForm.code || templateForm.nama.toUpperCase().replace(/\s+/g, '_'),
 category: templateForm.category,
 obligation_type: templateForm.obligation_type,
 gender_scope: templateForm.gender_scope,
 },
 }
 setSessions((prev) => [newSession, ...prev])
 toastSuccess('Template Ibadah Berhasil Dibuat', `Jadwal "${templateForm.nama}" ditambahkan ke sesi sekolah.`)
 setShowTemplateModal(false)
 setTemplateForm({
 nama: '',
 code: '',
 category: 'shalat_wajib',
 obligation_type: 'wajib',
 education_unit_name: userUnitName,
 gender_scope: 'all',
 start_time: '12:00',
 end_time: '12:45',
 location_name: 'Masjid Utama Sekolah',
 })
 }

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

 const MODERN_CARD_TONES = {
 sky: {
 badgeBg: 'bg-sky-500/10 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 border-sky-500/20',
 iconGradient: 'from-sky-500 via-blue-600 to-indigo-700 shadow-sky-500/25',
 glow: 'bg-sky-500/15 group-hover:bg-sky-500/25',
 border: 'hover:border-sky-400/60 dark:hover:border-sky-500/40',
 },
 emerald: {
 badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-500/20',
 iconGradient: 'from-emerald-500 via-emerald-600 to-teal-700 shadow-sm',
 glow: 'bg-emerald-500/15 group-hover:bg-emerald-500/25',
 border: 'hover:border-emerald-400/60 dark:hover:border-emerald-500/40',
 },
 amber: {
 badgeBg: 'bg-amber-500/10 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border-amber-500/20',
 iconGradient: 'from-amber-500 via-orange-600 to-amber-700 shadow-sm',
 glow: 'bg-amber-500/15 group-hover:bg-amber-500/25',
 border: 'hover:border-amber-400/60 dark:hover:border-amber-500/40',
 },
 purple: {
 badgeBg: 'bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border-purple-500/20',
 iconGradient: 'from-purple-500 via-violet-600 to-indigo-700 shadow-sm',
 glow: 'bg-purple-500/15 group-hover:bg-purple-500/25',
 border: 'hover:border-purple-400/60 dark:hover:border-purple-500/40',
 },
 rose: {
 badgeBg: 'bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border-rose-500/20',
 iconGradient: 'from-rose-500 via-rose-600 to-red-700 shadow-sm',
 glow: 'bg-rose-500/15 group-hover:bg-rose-500/25',
 border: 'hover:border-rose-400/60 dark:hover:border-rose-500/40',
 },
 slate: {
 badgeBg: 'bg-slate-500/10 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300 border-slate-500/20',
 iconGradient: 'from-slate-500 via-slate-600 to-slate-700 shadow-slate-500/25',
 glow: 'bg-slate-500/15 group-hover:bg-slate-500/25',
 border: 'hover:border-slate-400/60 dark:hover:border-slate-500/40',
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

 return (
 <PageContainer maxW="7xl">
 <div className="mb-4">
 <AppBreadcrumb items={[{ label: 'Absensi & Ibadah', href: '/dashboard' }, { label: 'Absensi Ibadah Siswa' }]} />
 </div>

 <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-5">
 


 {/* ── TOP SECTION CONTAINER (HEADER HERO & CARDS LANDING AREA) ──────── */}
 <motion.header variants={itemVariants} className="space-y-5">
 
 {/* HERO CARD HEADER WITH DYNAMICALLY RESOLVED USER UNIT NAME */}
 <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
 <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 !bg-[#D5F2E3] p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:!bg-[#112a22]">

 <div className="relative z-10 flex flex-col gap-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
 <School className="size-6 sm:size-7 text-white" />
 </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
 <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 text-white shadow-xs border border-emerald-500/40 px-3.5 py-1 text-xs font-extrabold">
 <Sparkles className="size-3 text-amber-300 animate-pulse" />
 Manajemen Presensi Ibadah Siswa
 </span>
 <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
 {userUnitName}
 </span>
 </div>
 <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
 Presensi & Absensi Ibadah Siswa
 </h1>
              </div>
            </div>

            {/* Right Controls: Live Clock & Actions */}
 <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap z-10">
 <div className="hidden sm:flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-white/80 px-3.5 py-2 dark:border-emerald-600/40 dark:bg-slate-900/80 backdrop-blur-sm">
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

 {/* Date Picker Input (Field Tanggal) */}
 <DatePicker
 value={date}
 onChange={(e) => setDate(e.target.value)}
 className="w-40"
 inputClassName="py-1.5 text-xs font-semibold"
 />

 {/* Squircle Action Button Icon-Only with Floating Tooltip on Hover */}
 <SquircleActionButton
 variant="primary"
 icon={Plus}
 label="Tambah Jadwal Ibadah"
 onClick={() => setShowTemplateModal(true)}
 />
          </div>
          </div>

          <div className="w-full pt-2 border-t border-emerald-500/20 dark:border-emerald-500/30">
            <p className="w-full text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
 Pencatatan & Verifikasi Ibadah Harian Siswa (Shalat Dhuha, Zhuhur & Ashar Berjamaah di {userUnitName}).
 </p>
          </div>
        </div>
      </div>
    </motion.div>

 {/* CARD 1: KPI STATS METRIC CARDS GRID */}
 <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
 <ModernKpiCard
 icon={Users}
 label="Total Wajib Ibadah"
 value={`${totalStudents} Siswa`}
 subtext={userUnitName}
 tone="sky"
 tag="TOTAL SISWA"
 onClick={() => handleOpenAttendingModal('ALL')}
 />
 <ModernKpiCard
 icon={CheckCircle2}
 label="Hadir Berjamaah"
 value={`${countHadir} Siswa`}
 subtext={`${pctHadir}% Presensi`}
 tone="emerald"
 tag="BERJAMAAH"
 onClick={() => handleOpenAttendingModal('hadir')}
 />
 <ModernKpiCard
 icon={Clock}
 label="Masbuk / Terlambat"
 value={`${countMasbuk} Siswa`}
 subtext="Dicatat Guru"
 tone="amber"
 tag="MASBUK"
 onClick={() => handleOpenAttendingModal('masbuk')}
 />
 <ModernKpiCard
 icon={Heart}
 label="Uzur / Sakit"
 value={`${countUzur} Siswa`}
 subtext="Halangan Syar'i"
 tone="purple"
 tag="UZUR SYAR'I"
 onClick={() => handleOpenAttendingModal('uzur')}
 />
 <ModernKpiCard
 icon={ShieldAlert}
 label="Izin / Alpa"
 value={`${countIzin + countAlpa} Siswa`}
 subtext="Tercatat di BK/UKS"
 tone="rose"
 tag="IZIN / ALPA"
 onClick={() => handleOpenAttendingModal('izin')}
 />
 <ModernKpiCard
 icon={ShieldCheck}
 label="Belum Verifikasi"
 value={`${countBelum} Siswa`}
 subtext="Menunggu Input"
 tone="slate"
 tag="PENDING"
 onClick={() => handleOpenAttendingModal('belum_verifikasi')}
 />
 </section>

 {/* CARD 2: METODE PRESENSI SISWA SELECTOR CARD WITH FRAMER MOTION ANIMATIONS */}
 <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/25 bg-white p-5 sm:p-6 shadow-md shadow-sm dark:border-emerald-600/35 dark:bg-[#111827]">
 <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
 <div>
 <div className="flex items-center gap-2">
 <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
 Pilih Metode Presensi Siswa
 </h3>
 <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
 Interactive Mode
 </span>
 </div>
 <p className="text-xs font-medium text-slate-400 mt-0.5">
 Pilih metode input presensi yang digunakan oleh Guru / Wali Kelas
 </p>
 </div>

 {/* Method Switcher Buttons with Framer Motion Sliding Pill (layoutId="activeWorshipMethodBg") */}
 <div className="relative flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100/90 p-1.5 dark:bg-slate-800/90 border border-emerald-200/60 dark:border-emerald-700/80/60">
 {[
 {
 key: 'MANUAL',
 label: 'Manual Checklist',
 icon: UserCheck,
 activeColor: 'text-sky-700 dark:text-sky-300',
 iconColor: 'text-sky-600 dark:text-sky-400',
 },
 {
 key: 'QRCODE',
 label: 'Scan QR Code Kartu',
 icon: QrCode,
 activeColor: 'text-indigo-700 dark:text-indigo-300',
 iconColor: 'text-indigo-600 dark:text-indigo-400',
 },
 {
 key: 'RFID',
 label: 'Tap RFID Reader',
 icon: Radio,
 activeColor: 'text-emerald-700 dark:text-emerald-300',
 iconColor: 'text-emerald-600 dark:text-emerald-400',
 },
 ].map((m) => {
 const isActive = worshipMethod === m.key
 const IconComponent = m.icon
 return (
 <motion.button
 key={m.key}
 type="button"
 onClick={() => setWorshipMethod(m.key)}
 whileHover={{ scale: 1.03 }}
 whileTap={{ scale: 0.97 }}
 transition={{ type: 'spring', stiffness: 500, damping: 30 }}
 className={`relative z-10 flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-colors cursor-pointer ${
 isActive
 ? m.activeColor
 : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
 }`}
 >
 {isActive && (
 <motion.div
 layoutId="activeWorshipMethodBg"
 className="absolute inset-0 rounded-xl bg-white shadow-md dark:bg-slate-700"
 transition={{ type: 'spring', stiffness: 500, damping: 35 }}
 />
 )}
 <span className="relative z-10 flex items-center gap-1.5">
 <IconComponent className={`h-4 w-4 shrink-0 ${isActive ? m.iconColor : 'text-slate-400'}`} />
 <span>{m.label}</span>
 </span>
 </motion.button>
 )
 })}
 </div>
 </div>

 {/* Active Mode Banner with AnimatePresence */}
 <div className="mt-4 pt-3.5 border-t border-emerald-200/80 dark:border-emerald-800/60">
 <AnimatePresence mode="wait">
 {worshipMethod === 'MANUAL' && (
 <motion.div
 key="MANUAL"
 initial={{ opacity: 0, y: 6 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -6 }}
 transition={{ duration: 0.2 }}
 className="flex items-center justify-between rounded-xl bg-sky-50/80 p-3 text-xs dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50"
 >
 <div className="flex items-center gap-2">
 <CheckCircle className="h-4 w-4 text-sky-600 shrink-0" />
 <span className="font-semibold text-sky-900 dark:text-sky-200">
 Mode Checklist Manual Aktif — Centang nama siswa pada tabel di bawah, lalu klik "Hadir Berjamaah" / "Masbuk".
 </span>
 </div>
 </motion.div>
 )}

 {worshipMethod === 'QRCODE' && (
 <motion.div
 key="QRCODE"
 initial={{ opacity: 0, y: 6 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -6 }}
 transition={{ duration: 0.2 }}
 className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 rounded-xl bg-indigo-50/80 p-3 text-xs dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50"
 >
 <div className="flex items-center gap-2">
 <Camera className="h-4 w-4 text-indigo-600 shrink-0" />
 <span className="font-semibold text-indigo-900 dark:text-indigo-200">
 Mode Scan QR Code Kartu Siswa — Pemindaian aktif via Kamera / Scanner Kartu Pelajar.
 </span>
 </div>
 <motion.button
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 onClick={() => {
 setShowCameraModal(true)
 startCamera()
 }}
 className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-sm transition-all hover:bg-emerald-700"
 >
 <Camera className="h-4 w-4" />
 <span>Buka Layar Scanner Kamera</span>
 </motion.button>
 </motion.div>
 )}

 {worshipMethod === 'RFID' && (
 <motion.div
 key="RFID"
 initial={{ opacity: 0, y: 6 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -6 }}
 transition={{ duration: 0.2 }}
 className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 rounded-xl bg-emerald-50/80 p-3 text-xs dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50"
 >
 <div className="flex items-center gap-2">
 <Wifi className="h-4 w-4 text-emerald-600 shrink-0 animate-pulse" />
 <span className="font-semibold text-emerald-900 dark:text-emerald-200">
 Mode RFID Receiver Aktif — Tempelkan Kartu Siswa pada reader. Sinyal siap diproses.
 </span>
 </div>
 <div className="relative min-w-[200px]">
 <input
 type="text"
 autoFocus
 value={scanInput}
 onChange={(e) => setScanInput(e.target.value)}
 onKeyDown={(e) => e.key === 'Enter' && handleProcessScan(scanInput)}
 placeholder="Tap Kartu RFID..."
 className="w-full rounded-xl border-2 border-[#b6f6d9] bg-white py-1.5 pl-8 pr-3 text-xs font-mono font-bold text-emerald-800 focus:border-emerald-500 focus:outline-none dark:border-emerald-700 dark:bg-slate-800 dark:text-emerald-300 shadow-2xs"
 />
 <Radio className="absolute left-2.5 top-2 h-3.5 w-3.5 text-emerald-500 animate-bounce" />
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </motion.div>

 {/* CARD 3: DAFTAR SESI SHALAT BERJALAN HARI INI */}
 <div className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] shadow-md shadow-emerald-500/10 overflow-hidden">
 <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 py-3.5 sm:px-6 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-200/90 dark:border-emerald-800/60">
 <div className="flex items-center gap-3">
 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-xs">
 <CalendarDays className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
 Daftar Sesi Shalat &amp; Ibadah Hari Ini
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Pilih sesi ibadah aktif untuk melakukan verifikasi absensi atau input data santri/siswa
 </p>
 </div>
 </div>
 <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 dark:bg-emerald-950/80 border border-emerald-200/80 dark:border-emerald-800/80 px-3 py-1 text-xs font-extrabold text-emerald-800 dark:text-emerald-300 self-start sm:self-auto shrink-0">
 <span>Total:</span>
 <span>{sessions.length} Sesi</span>
 </div>
 </div>

 {/* SESSIONS GRID */}
 <div className="p-4 sm:p-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
 {sessions.map((sess) => {
 const isSelected = selectedSession?.id === sess.id
 const isWajib = sess.template?.obligation_type === 'wajib'
 return (
 <div
 key={sess.id}
 onClick={() => setSelectedSession(sess)}
 className={`relative cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
 isSelected
 ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white shadow-md shadow-emerald-500/10 dark:border-emerald-500/80 dark:from-emerald-950/40 dark:to-slate-900'
 : 'border-emerald-200/80 bg-white hover:border-emerald-300 dark:border-emerald-800/60 dark:bg-slate-900/50'
 }`}
 >
 <div className="flex items-start justify-between gap-2">
 <div className="flex items-center gap-2.5 min-w-0">
 <div
 className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-black text-sm shadow-xs transition-colors ${
 isSelected
 ? 'bg-emerald-600 text-white border border-emerald-500'
 : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300'
 }`}
 >
 {sess.template?.nama?.charAt(0) || 'S'}
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-1.5 flex-wrap">
 <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
 {sess.template?.nama}
 </h4>
 <span
 className={`rounded-full px-2 py-0.5 text-[9px] font-black ${
 isWajib
 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
 : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
 }`}
 >
 {isWajib ? 'Wajib' : 'Sunnah'}
 </span>
 </div>
 <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">
 <Clock className="size-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
 <span>{sess.scheduled_start_at} - {sess.scheduled_end_at} WIB</span>
 </div>
 </div>
 </div>

 <button
 type="button"
 onClick={(e) => {
 e.stopPropagation()
 handleOpenEditSessionModal(sess)
 }}
 title="Ubah Jam Sesi Manual"
 className="rounded-xl p-1.5 bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-emerald-950 transition-colors shrink-0 cursor-pointer"
 >
 <Edit className="h-3.5 w-3.5" />
 </button>
 </div>

 <div className="mt-3 space-y-1.5 border-t border-emerald-200/80 pt-2.5 dark:border-emerald-800/60 text-xs">
 <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
 <span className="flex items-center gap-1 truncate font-semibold">
 <MapPin className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
 <span className="truncate">{sess.location_name}</span>
 </span>
 </div>
 <div className="flex items-center justify-between pt-0.5">
 <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Kehadiran:</span>
 <button
 type="button"
 onClick={(e) => {
 e.stopPropagation()
 setSelectedSession(sess)
 handleOpenAttendingModal('hadir')
 }}
 className={`rounded-full px-2.5 py-0.5 text-[10px] font-black transition-all hover:scale-105 active:scale-95 cursor-pointer ${
 isSelected ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
 }`}
 >
 {countHadir}/{totalStudents} Siswa (Lihat Siswa)
 </button>
 </div>
 </div>
 </div>
 )
 })}
 </div>
 </div>

 </motion.header>

 {/* ── MAIN CONTENT LAYOUT (FULL WIDTH DATA TABLE) ───────────────── */}
 <section className="space-y-5">
 <div className="space-y-4">
 
 {/* Toolbar Outer Container */}
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
 
 {/* Row 1: Section Title + Subtext + Action Buttons */}
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-200/90 dark:border-emerald-800/60 p-4 sm:p-6">
 <div className="space-y-1">
 <div className="flex flex-wrap items-center gap-2">
 <h3 className="text-base font-bold text-slate-900 dark:text-white">
 Data Kehadiran Siswa: <span className="text-sky-700 dark:text-sky-400">{selectedSession?.template.nama}</span>
 </h3>
 <button
 onClick={() => handleOpenEditSessionModal(selectedSession)}
 className="inline-flex items-center gap-1 rounded-lg bg-sky-50 border border-sky-200/80 px-2.5 py-1 text-xs font-bold text-sky-700 shadow-2xs transition-all hover:bg-sky-100 hover:scale-105 active:scale-95 dark:bg-sky-950/50 dark:border-sky-800 dark:text-sky-300"
 >
 <Edit className="h-3.5 w-3.5 text-sky-600" />
 <span>Ubah Jam Manual</span>
 </button>
 </div>
 <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
 <span className="flex items-center gap-1 font-medium">
 <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
 <span>Lokasi: <strong className="text-slate-700 dark:text-slate-200">{selectedSession?.location_name}</strong></span>
 </span>
 <span className="text-slate-300 dark:text-slate-700">|</span>
 <span className="flex items-center gap-1 font-medium">
 <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
 <span>Jam Sesi: <strong className="text-slate-700 dark:text-slate-200">{selectedSession?.scheduled_start_at} - {selectedSession?.scheduled_end_at} WIB</strong></span>
 </span>
 </div>
 </div>

 {/* Action Buttons Row */}
 <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
 {worshipMethod === 'MANUAL' && (
 <div className="flex items-center gap-1.5 sm:gap-2">
 <button
 onClick={() => handleBulkStatusChange('hadir_berjamaah')}
 className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-sm transition-all hover:bg-emerald-700 hover:scale-105 active:scale-95"
 >
 <Check className="h-4 w-4" />
 <span>Hadir Berjamaah</span>
 </button>
 <button
 onClick={() => handleBulkStatusChange('masbuk')}
 className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-sm transition-all hover:bg-amber-600 hover:scale-105 active:scale-95"
 >
 <Clock className="h-4 w-4" />
 <span>Masbuk</span>
 </button>
 </div>
 )}

 {/* HeroUI Standard Action Buttons: Import, Export, Cetak (Printer) */}
 <SquircleActionButton
 variant="import"
 label="Import Data Presensi"
 onClick={() => toastInfo('Import Presensi', 'Membuka dialog import presensi masal...')}
 />
 <SquircleActionButton
 variant="export"
 label="Export Rekap Presensi"
 onClick={() => toastInfo('Export Presensi', 'Mengunduh rekap presensi siswa format Excel...')}
 />
 <SquircleActionButton
 variant="view"
 icon={Printer}
 label="Cetak Data Kehadiran Siswa"
 onClick={() => setIsPrintTableModalOpen(true)}
 />
 </div>
 </div>

 {/* Row 2: Search + Filter Dropdowns + PerPage Select */}
 <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2.5 sm:gap-3 p-4 sm:px-6 bg-slate-50/50 border-b border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-800/30 dark:border-emerald-800/60 w-full">
 <div className="relative min-w-[200px] flex-1">
 <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Cari Nama Siswa / NISN..."
 className="w-full rounded-xl border-2 border-[#b6f6d9] bg-white py-2 pl-9 pr-3 text-xs focus:border-sky-500 focus:outline-none dark:border-emerald-700/80 dark:bg-slate-800"
 />
 </div>

 {/* Dynamic Unit Dropdown Scoped to Active User Unit */}
 <HeroUiFilterSelect
 value={filterUnit}
 disabled={!isSuperOrYayasan}
 onChange={(val) => setFilterUnit(val)}
 options={unitOptions}
 placeholder="Unit Pendidikan"
 icon={Building2}
 className="w-full sm:w-auto min-w-[170px]"
 popoverWidth="w-64"
 searchable={unitOptions.length > 5}
 />

 {/* Dynamic Classes Selector Adapted to Active Unit Level */}
 <HeroUiFilterSelect
 value={filterClass}
 onChange={(val) => setFilterClass(val)}
 options={classOptions}
 placeholder="Semua Kelas"
 icon={GraduationCap}
 className="w-full sm:w-auto min-w-[160px]"
 popoverWidth="w-56"
 searchable={classOptions.length > 5}
 />

 <HeroUiFilterSelect
 value={filterStatus}
 onChange={(val) => setFilterStatus(val)}
 options={statusOptions}
 placeholder="Status Presensi"
 icon={CheckCircle2}
 className="w-full sm:w-auto min-w-[170px]"
 popoverWidth="w-56"
 />

 <HeroUiFilterSelect
 value={perPage}
 onChange={(val) => setPerPage(Number(val))}
 options={perPageOptions}
 placeholder="Per Halaman"
 icon={Layers}
 className="w-full sm:w-auto min-w-[110px]"
 popoverWidth="w-32"
 />
 </div>

 {/* Data Table (Full-Bleed HeroUI Standard) */}
 <div className="overflow-x-auto">
 <TableRoot fullBleed={true} className="text-xs">
 <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-black uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-200">
 <TableRow className="bg-transparent hover:bg-transparent">
 {worshipMethod === 'MANUAL' && (
 <TableHead className="w-10 px-4 py-3.5 text-center">
 <input
 type="checkbox"
 checked={filteredStudents.length > 0 && filteredStudents.every((s) => s.selected)}
 onChange={toggleSelectAllFiltered}
 className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
 />
 </TableHead>
 )}
 <TableHead className="px-4 sm:px-6 py-3.5">Siswa</TableHead>
 <TableHead className="hidden sm:table-cell px-4 py-3.5">NISN</TableHead>
 <TableHead className="hidden md:table-cell px-4 py-3.5">Kelas / Rombel</TableHead>
 <TableHead className="px-4 py-3.5">Status Ibadah</TableHead>
 <TableHead className="hidden lg:table-cell px-4 py-3.5">Metode &amp; Waktu</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {filteredStudents.length === 0 ? (
 <TableRow>
 <TableCell colSpan={worshipMethod === 'MANUAL' ? 6 : 5} className="px-4 py-12 text-center text-slate-400">
 Tidak ada data siswa yang sesuai dengan filter kelas/unit.
 </TableCell>
 </TableRow>
 ) : (
 paginatedStudents.map((student) => {
 return (
 <TableRow
 key={student.id}
 onClick={() => {
 setSelectedStudentForVerify(student)
 setVerifyStatus(student.status)
 setVerifyNotes(student.notes || '')
 setShowVerifyModal(true)
 }}
 className={`transition-all hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 cursor-pointer ${student.selected ? 'bg-emerald-50/60 dark:bg-emerald-950/30' : ''}`}
 >
 {worshipMethod === 'MANUAL' && (
 <TableCell className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
 <input
 type="checkbox"
 checked={student.selected || false}
 onChange={() => toggleSelectStudent(student.id)}
 className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
 />
 </TableCell>
 )}
 <TableCell className="px-4 sm:px-6 py-3.5 font-semibold text-slate-900 dark:text-white">
 <div className="flex items-center gap-2.5">
 <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-xs dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
 {student.name.charAt(0)}
 </div>
 <div>
 <p className="font-extrabold">{student.name}</p>
 <p className="text-[10px] text-slate-400">{student.unit_name}</p>
 </div>
 </div>
 {/* Compact Mobile Metadata Row */}
 <div className="sm:hidden mt-2 flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-emerald-200/80 dark:border-emerald-800/60 text-[10px]">
 <span className="font-mono text-slate-500">{student.nisn}</span>
 <span className="text-slate-300 dark:text-slate-600">•</span>
 <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-semibold text-slate-700 dark:text-slate-300">{student.class_name}</span>
 {student.time && student.time !== '-' && (
 <>
 <span className="text-slate-300 dark:text-slate-600">•</span>
 <span className="text-slate-500">{student.time}</span>
 </>
 )}
 </div>
 </TableCell>
 <TableCell className="hidden sm:table-cell px-4 py-3.5 text-slate-600 dark:text-slate-300 font-mono">{student.nisn}</TableCell>
 <TableCell className="hidden md:table-cell px-4 py-3.5">
 <span className="rounded-lg bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300">
 {student.class_name}
 </span>
 </TableCell>
 <TableCell className="px-4 py-3.5">
 <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
 student.status === 'hadir_berjamaah'
 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
 : student.status === 'masbuk'
 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
 : student.status === 'uzur_sakit'
 ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
 : student.status === 'izin'
 ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
 : student.status === 'alpa'
 ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
 : 'bg-slate-100 text-slate-600 dark:bg-sky-950/60 dark:text-sky-300'
 }`}>
 {student.status === 'hadir_berjamaah' && 'Hadir Berjamaah'}
 {student.status === 'masbuk' && 'Masbuk / Terlambat'}
 {student.status === 'uzur_sakit' && 'Uzur / Sakit'}
 {student.status === 'izin' && 'Izin'}
 {student.status === 'alpa' && 'Alpa'}
 {student.status === 'belum_verifikasi' && 'Belum Verifikasi'}
 </span>
 </TableCell>
 <TableCell className="hidden lg:table-cell px-4 py-3.5 text-slate-500">
 <p className="font-semibold text-slate-700 dark:text-slate-300">{student.time}</p>
 <p className="text-[10px] text-slate-400">{student.method}</p>
 </TableCell>
 </TableRow>
 )
 })
 )}
 </TableBody>
 </TableRoot>
 </div>

 {/* HeroUI Standard Pagination Row */}
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-emerald-200/80 bg-white dark:bg-[#1B2433] px-4 py-3.5 sm:px-6 dark:border-emerald-800/60">
 <p>
 Menampilkan {filteredStudents.length > 0 ? (currentPage - 1) * perPage + 1 : 0}-{Math.min(currentPage * perPage, filteredStudents.length)} dari {filteredStudents.length} Siswa
 </p>
 <div className="flex items-center gap-1.5">
 <Pagination
 currentPage={currentPage}
 totalPages={totalPages}
 onPageChange={(p) => setCurrentPage(p)}
 sideLayout="icon"
 />
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* ── MODAL UBAH MANUAL JADWAL SESI IBADAH ─────────────────────────── */}
 <AppModal
 isOpen={showEditSessionModal}
 onClose={() => setShowEditSessionModal(false)}
 badge="Sesi Ibadah"
 title="Ubah Jam & Lokasi Sesi"
 icon={Clock}
 maxWidth="max-w-md"
 zIndex="z-[70]"
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
 form="student-worship-edit-session-form"
 className="inline-flex h-9.5 items-center justify-center rounded-xl border-2 border-emerald-600 bg-emerald-600 px-5 text-xs font-black text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-95 cursor-pointer"
 >
 Simpan Perubahan
 </button>
 </div>
 }
 >
 <form id="student-worship-edit-session-form" onSubmit={handleSaveEditSession} className="space-y-4">

 <div className="space-y-3 text-xs">
 <div>
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Sesi</label>
 <p className="font-bold text-sky-700 dark:text-sky-400 text-sm">{editSessionForm.nama}</p>
 </div>

 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jam Mulai Sesi</label>
 <input
 type="time"
 required
 value={editSessionForm.start_time}
 onChange={(e) => setEditSessionForm({ ...editSessionForm, start_time: e.target.value })}
 className="w-full rounded-xl border border-emerald-300 bg-white p-2.5 font-bold focus:border-emerald-500 focus:outline-none dark:border-emerald-700/80 dark:bg-slate-800"
 />
 </div>
 <div>
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jam Selesai Sesi</label>
 <input
 type="time"
 required
 value={editSessionForm.end_time}
 onChange={(e) => setEditSessionForm({ ...editSessionForm, end_time: e.target.value })}
 className="w-full rounded-xl border border-emerald-300 bg-white p-2.5 font-bold focus:border-emerald-500 focus:outline-none dark:border-emerald-700/80 dark:bg-slate-800"
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
 className="w-full rounded-xl border-2 border-[#b6f6d9] bg-white p-2.5 font-semibold focus:border-emerald-500 focus:outline-none dark:border-emerald-700/80 dark:bg-slate-800"
 />
 </div>

 <div>
 <HeroUiModalSelect
 label="Status Sesi"
 value={editSessionForm.status}
 onChange={(val) => setEditSessionForm({ ...editSessionForm, status: val })}
 options={editSessionStatusOptions}
 placeholder="Pilih Status Sesi"
 />
 </div>
 </div>
 </form>
 </AppModal>

 {/* ── MODAL CAMERA SCANNER QR CODE ──────────────────────────────────── */}
 <AppModal
 isOpen={showCameraModal}
 onClose={() => {
 setShowCameraModal(false)
 stopCamera()
 }}
 title="Scanner QR Code Kartu Siswa"
 description="Arahkan QR Code pada kartu siswa ke area pemindai"
 icon={Camera}
 maxWidth="max-w-xl"
 zIndex={70}
 footer={
 <div className="flex w-full justify-between items-center text-xs">
 <button
 type="button"
 onClick={cameraActive ? stopCamera : startCamera}
 className="inline-flex h-9.5 items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 hover:bg-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
 >
 {cameraActive ? <><CameraOff className="h-3.5 w-3.5 text-rose-500" /> Matikan Kamera</> : <><Camera className="h-3.5 w-3.5 text-emerald-500" /> Nyalakan Kamera</>}
 </button>
 <button
 type="button"
 onClick={() => {
 setShowCameraModal(false)
 stopCamera()
 }}
 className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 hover:bg-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
 >
 Tutup Kamera
 </button>
 </div>
 }
 >

 {/* Video Camera Viewfinder Screen */}
 <div className="relative overflow-hidden rounded-xl bg-black aspect-video flex items-center justify-center border-2 border-indigo-500/50 shadow-inner">
 <video
 ref={videoRef}
 playsInline
 muted
 className="h-full w-full object-cover"
 />

 {/* Viewfinder Target Box Overlay */}
 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
 <div className="h-48 w-48 rounded-xl border-2 border-dashed border-sky-400 bg-sky-500/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] flex flex-col items-center justify-between p-3">
 <div className="w-full flex justify-between">
 <span className="h-4 w-4 border-t-2 border-l-2 border-sky-400" />
 <span className="h-4 w-4 border-t-2 border-r-2 border-sky-400" />
 </div>
 <p className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full">
 Arahkan QR Code Di Sini
 </p>
 <div className="w-full flex justify-between">
 <span className="h-4 w-4 border-b-2 border-l-2 border-sky-400" />
 <span className="h-4 w-4 border-b-2 border-r-2 border-sky-400" />
 </div>
 </div>
 </div>

 {cameraLoading && (
 <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-white gap-2">
 <RefreshCw className="h-8 w-8 animate-spin text-sky-400" />
 <p className="text-xs font-semibold">Mengaktifkan Kamera Pemindai...</p>
 </div>
 )}

 {cameraError && (
 <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 text-white p-4 text-center gap-2">
 <AlertCircle className="h-8 w-8 text-rose-500" />
 <p className="text-xs font-semibold text-rose-300">{cameraError}</p>
 </div>
 )}
 </div>

 {/* Manual QR NISN Input */}
 <div className="space-y-2 pt-2">
 <div className="flex gap-2">
 <input
 type="text"
 value={scanInput}
 onChange={(e) => setScanInput(e.target.value)}
 onKeyDown={(e) => e.key === 'Enter' && handleProcessScan(scanInput)}
 placeholder="Atau masukkan NISN hasil scan..."
 className="flex-1 rounded-xl border-2 border-[#b6f6d9] bg-slate-50 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-emerald-700/80 dark:bg-slate-800"
 />
 <button
 onClick={() => handleProcessScan(scanInput)}
 disabled={processingScan}
 className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
 >
 Proses QR
 </button>
 </div>
 </div>
 </AppModal>

 {/* ── MODAL VERIFIKASI STATUS IBADAH SISWA ──────────────────────────── */}
 <AppModal
 isOpen={Boolean(showVerifyModal && selectedStudentForVerify)}
 onClose={() => setShowVerifyModal(false)}
 badge="Verifikasi"
 title="Verifikasi Ibadah Siswa"
 icon={UserCheck}
 maxWidth="max-w-md"
 zIndex="z-[70]"
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
 type="button"
 onClick={handleSaveVerify}
 className="inline-flex h-9.5 items-center justify-center rounded-xl border-2 border-emerald-600 bg-emerald-600 px-5 text-xs font-black text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-95 cursor-pointer"
 >
 Simpan Verifikasi
 </button>
 </div>
 }
 >
 {selectedStudentForVerify && (
 <div className="space-y-4">

 <div className="space-y-3.5 text-xs">
 <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
 <p className="font-bold text-slate-900 dark:text-white">{selectedStudentForVerify.name}</p>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 NISN: {selectedStudentForVerify.nisn} • Kelas: {selectedStudentForVerify.class_name}
 </p>
 </div>

 <div>
 <HeroUiModalSelect
 label="Status Presensi Ibadah"
 value={verifyStatus}
 onChange={(val) => setVerifyStatus(val)}
 options={verifyStatusOptions}
 placeholder="Pilih Status Presensi"
 />
 </div>

 <div>
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Catatan Verifikator</label>
 <textarea
 rows={3}
 value={verifyNotes}
 onChange={(e) => setVerifyNotes(e.target.value)}
 placeholder="Catatan tambahan (misal: Masbuk 1 rakaat, izin UKS...)"
 className="w-full rounded-xl border-2 border-[#b6f6d9] bg-white p-2.5 text-xs focus:border-emerald-500 focus:outline-none dark:border-emerald-700/80 dark:bg-slate-800"
 />
 </div>
 </div>

 </div>
 )}
 </AppModal>

 {/* ── MODAL TAMBAH TEMPLATE IBADAH SEKOLAH ─────────────────────────── */}
 <AppModal
 isOpen={showTemplateModal}
 onClose={() => setShowTemplateModal(false)}
 badge="Jadwal Baru"
 title="Tambah Jadwal Ibadah Sekolah"
 icon={Plus}
 maxWidth="max-w-xl"
 zIndex="z-[70]"
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
 form="student-worship-template-form"
 className="inline-flex h-9.5 items-center justify-center rounded-xl border-2 border-emerald-600 bg-emerald-600 px-5 text-xs font-black text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-95 cursor-pointer"
 >
 Simpan Jadwal
 </button>
 </div>
 }
 >
 <form id="student-worship-template-form" onSubmit={handleCreateTemplate} className="space-y-4">

 <div className="grid grid-cols-2 gap-3 text-xs">
 <div className="col-span-2">
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Kegiatan Ibadah</label>
 <input
 type="text"
 required
 placeholder="Misal: Shalat Zhuhur Berjamaah Siswa"
 value={templateForm.nama}
 onChange={(e) => setTemplateForm({ ...templateForm, nama: e.target.value })}
 className="w-full rounded-xl border-2 border-[#b6f6d9] bg-white p-2.5 text-xs focus:border-emerald-500 focus:outline-none dark:border-emerald-700/80 dark:bg-slate-800"
 />
 </div>

 <div>
 <HeroUiModalSelect
 label="Kategori Ibadah"
 value={templateForm.category}
 onChange={(val) => setTemplateForm({ ...templateForm, category: val })}
 options={templateCategoryOptions}
 placeholder="Pilih Kategori"
 />
 </div>

 <div>
 <HeroUiModalSelect
 label="Tipe Kewajiban"
 value={templateForm.obligation_type}
 onChange={(val) => setTemplateForm({ ...templateForm, obligation_type: val })}
 options={templateObligationOptions}
 placeholder="Pilih Kewajiban"
 />
 </div>

 <div>
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jam Mulai</label>
 <input
 type="time"
 value={templateForm.start_time}
 onChange={(e) => setTemplateForm({ ...templateForm, start_time: e.target.value })}
 className="w-full rounded-xl border border-emerald-300 bg-white p-2.5 text-xs focus:border-emerald-500 focus:outline-none dark:border-emerald-700/80 dark:bg-slate-800"
 />
 </div>

 <div>
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jam Selesai</label>
 <input
 type="time"
 value={templateForm.end_time}
 onChange={(e) => setTemplateForm({ ...templateForm, end_time: e.target.value })}
 className="w-full rounded-xl border border-emerald-300 bg-white p-2.5 text-xs focus:border-emerald-500 focus:outline-none dark:border-emerald-700/80 dark:bg-slate-800"
 />
 </div>

 <div className="col-span-2">
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lokasi Pelaksanaan</label>
 <input
 type="text"
 placeholder="Misal: Musholla Utama Sekolah / Hall Serbaguna"
 value={templateForm.location_name}
 onChange={(e) => setTemplateForm({ ...templateForm, location_name: e.target.value })}
 className="w-full rounded-xl border-2 border-[#b6f6d9] bg-white p-2.5 text-xs focus:border-emerald-500 focus:outline-none dark:border-emerald-700/80 dark:bg-slate-800"
 />
 </div>
 </div>
 </form>
 </AppModal>

 {/* ── MODAL DATA SISWA PRESENSI SHOLAT ────────────────────────────── */}
 <Backdrop isOpen={isAttendingModalOpen} onOpenChange={setIsAttendingModalOpen}>
 <Dialog className="w-full max-w-4xl border border-emerald-200/90 bg-white p-6 shadow-2xl dark:border-emerald-800/60 dark:bg-slate-900 rounded-2xl">
 <div className="space-y-4">
 {/* Header */}
 <DialogHeader className="border-b border-emerald-200/80 dark:border-emerald-800/60 pb-4 dark:border-emerald-800/60">
 <div className="flex items-start justify-between gap-3">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
 Data Presensi Siswa Sholat
 </DialogTitle>
 <Badge color="emerald" size="sm">
 {selectedSession?.template.nama}
 </Badge>
 </div>
 <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
 Sesi: <span className="font-bold text-slate-700 dark:text-slate-200">{selectedSession?.template.nama}</span> | Jam: {selectedSession?.scheduled_start_at} - {selectedSession?.scheduled_end_at} WIB | Lokasi: {selectedSession?.location_name}
 </DialogDescription>
 </div>
 </div>
 </DialogHeader>

 {/* Filter Tabs & Search Bar */}
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-slate-50 p-3 rounded-xl dark:bg-slate-800/60 border border-emerald-200/60 dark:border-emerald-700/80/60">
 {/* Status Filter Buttons */}
 <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
 {[
 { key: 'hadir', label: 'Hadir Berjamaah', color: 'bg-emerald-600 text-white' },
 { key: 'masbuk', label: 'Masbuk / Terlambat', color: 'bg-amber-600 text-white' },
 { key: 'uzur', label: 'Uzur / Sakit', color: 'bg-purple-600 text-white' },
 { key: 'izin', label: 'Izin / Alpa', color: 'bg-rose-600 text-white' },
 { key: 'belum_verifikasi', label: 'Belum Verifikasi', color: 'bg-slate-700 text-white' },
 { key: 'ALL', label: 'Semua Siswa', color: 'bg-sky-600 text-white' },
 ].map((st) => (
 <button
 key={st.key}
 onClick={() => setModalStatusFilter(st.key)}
 className={`px-3 py-1.5 rounded-xl transition-all ${
 modalStatusFilter === st.key
 ? `${st.color} shadow-xs scale-105`
 : 'bg-white text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
 }`}
 >
 {st.label}
 </button>
 ))}
 </div>

 {/* Search & Print Actions */}
 <div className="flex items-center gap-2">
 <div className="relative flex-1 sm:w-48">
 <Search className="absolute left-3 top-2.5 size-3.5 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={modalSearchQuery}
 onChange={(e) => setModalSearchQuery(e.target.value)}
 placeholder="Cari nama/kelas..."
 className="w-full rounded-xl border-2 border-[#b6f6d9] bg-white py-1.5 pl-8 pr-3 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-100"
 />
 </div>
 <button
 onClick={handlePrintModalTable}
 title="Cetak Data Presensi Modal"
 className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 transition-all dark:bg-sky-950 dark:border-sky-800 dark:text-sky-300 shrink-0"
 >
 <Printer className="size-4" />
 </button>
 <button
 onClick={handleDownloadPdfModalTable}
 title="Unduh PDF Data Modal"
 className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-all dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300 shrink-0"
 >
 <Download className="size-4" />
 </button>
 </div>
 </div>

 {/* Table List */}
 <DialogBody className="py-0 max-h-[380px] overflow-y-auto">
 {filteredModalStudents.length === 0 ? (
 <div className="py-12 text-center text-slate-400">
 <AlertCircle className="size-8 mx-auto mb-2 text-slate-300" />
 <p className="font-semibold text-xs">Tidak ada data siswa ditemukan untuk status ini.</p>
 </div>
 ) : (
 <div className="overflow-x-auto rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 
 <th className="p-3">Siswa</th>
 <th className="p-3">Kelas</th>
 <th className="p-3 text-center">Status Presensi</th>
 <th className="p-3">Waktu</th>
 <th className="p-3">Metode</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {filteredModalStudents.map((st, idx) => (
 <tr key={st.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors">
 
 <td className="p-3">
 <div className="flex items-center gap-2.5">
 <Avatar size="sm" status="online">
 <AvatarFallback className="bg-emerald-100 font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
 {st.name.substring(0, 2).toUpperCase()}
 </AvatarFallback>
 </Avatar>
 <div>
 <p className="font-bold text-slate-900 dark:text-white">{st.name}</p>
 <p className="text-[10px] text-slate-400">NISN: {st.nisn}</p>
 </div>
 </div>
 </td>
 <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{st.class_name}</td>
 <td className="p-3 text-center">
 {st.status === 'hadir' && <Badge color="success" size="sm">Hadir Berjamaah</Badge>}
 {st.status === 'masbuk' && <Badge color="warning" size="sm">Masbuk / Terlambat</Badge>}
 {st.status === 'uzur' && <Badge color="purple" size="sm">Uzur / Sakit</Badge>}
 {(st.status === 'izin' || st.status === 'alpa') && <Badge color="error" size="sm">Izin / Alpa</Badge>}
 {st.status === 'belum_verifikasi' && <Badge color="gray" size="sm">Belum Verifikasi</Badge>}
 </td>
 <td className="p-3 font-medium text-slate-600 dark:text-slate-400">{st.time || '-'}</td>
 <td className="p-3 font-medium text-slate-500">{st.method || 'Manual Checklist'}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </DialogBody>

 {/* Footer */}
 <DialogFooter className="border-t border-emerald-200/80 pt-3 dark:border-emerald-800/60 flex items-center justify-between">
 <div className="text-xs font-semibold text-slate-500">
 Menampilkan <span className="font-bold text-emerald-600">{filteredModalStudents.length}</span> dari {students.length} siswa
 </div>
 <DialogClose
 onClick={() => setIsAttendingModalOpen(false)}
 variant="ghost"
 className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-emerald-950/60 dark:text-emerald-300"
 >
 Tutup
 </DialogClose>
 </DialogFooter>
 </div>
 </Dialog>
 </Backdrop>

 {/* ── HEROUI PRINT OPTION MODAL FOR MAIN DATATABLE ─────────────── */}
 <PrintOptionModal
 isOpen={isPrintTableModalOpen}
 onClose={() => setIsPrintTableModalOpen(false)}
 title={`Daftar Kehadiran Siswa — ${selectedSession?.template.nama}`}
 subtitle={`Sesi: ${selectedSession?.template.nama} | Jam: ${selectedSession?.scheduled_start_at} - ${selectedSession?.scheduled_end_at} WIB | Lokasi: ${selectedSession?.location_name} | Unit: ${userUnitName}`}
 onPrint={() => {
 handlePrintCleanTableMain()
 setIsPrintTableModalOpen(false)
 }}
 onDownload={() => {
 handleDownloadPdfTableMain()
 setIsPrintTableModalOpen(false)
 }}
 />

 </motion.div>
 </PageContainer>
 )
}
