import { useMemo, useState, useEffect, useRef } from 'react'
import AppModal from '@/components/app/AppModal'
import { motion, AnimatePresence } from 'framer-motion'
import {
 CalendarCheck,
 Clock,
 FileText,
 AlertCircle,
 CheckCircle2,
 XCircle,
 Plus,
 X,
 Send,
 Loader2,
 Info,
 Sparkles,
 Calendar,
 Search,
 School,
 Building2,
 Paperclip,
 ExternalLink,
 HeartPulse,
 Filter,
 RotateCcw,
 BookOpen,
 CalendarRange,
 CalendarDays,
 BarChart3,
 TrendingUp,
 ChevronDown,
 Check,
} from 'lucide-react'
import {
 Card as HeroCard,
 Chip as HeroChip,
 Button as HeroButton,
} from '@heroui/react'
import { TextArea as HeroTextArea } from '../ui/text-area'
import useDebounce from '../../hooks/useDebounce'
import { DatePicker } from '@/components/ui/date-picker'
import { cn } from '../../lib/utils'

const formatDateLong = (val) => {
 if (!val) return '-'
 try {
 return new Intl.DateTimeFormat('id-ID', {
 weekday: 'long',
 day: 'numeric',
 month: 'long',
 year: 'numeric',
 }).format(new Date(val))
 } catch {
 return String(val)
 }
}

const formatDateShort = (val) => {
 if (!val) return '-'
 try {
 return new Intl.DateTimeFormat('id-ID', {
 day: 'numeric',
 month: 'short',
 year: 'numeric',
 }).format(new Date(val))
 } catch {
 return String(val)
 }
}

export const ATTENDANCE_PERIOD_OPTIONS = [
 { id: 'all', label: 'Semua Periode', shortLabel: 'Semua', icon: Calendar },
 { id: 'daily', label: 'Harian (Hari Ini)', shortLabel: 'Harian', icon: CalendarDays },
 { id: 'weekly', label: 'Mingguan (Pekan Ini)', shortLabel: 'Mingguan', icon: CalendarRange },
 { id: 'monthly', label: 'Bulanan (Bulan Ini)', shortLabel: 'Bulanan', icon: BarChart3 },
 { id: 'semester', label: 'Semester Ini', shortLabel: 'Semester', icon: TrendingUp },
]

export const getDateRangeForAttendancePeriod = (period, refDateStr = null) => {
 if (!period || period === 'all') return null

 const ref = refDateStr ? new Date(refDateStr) : new Date()
 const safeRef = isNaN(ref.getTime()) ? new Date() : ref

 let from = new Date(safeRef)
 let until = new Date(safeRef)

 if (period === 'daily') {
 from.setHours(0, 0, 0, 0)
 until.setHours(23, 59, 59, 999)
 } else if (period === 'weekly') {
 const day = safeRef.getDay() || 7 // 1 = Senin, 7 = Ahad
 from.setDate(safeRef.getDate() - (day - 1))
 from.setHours(0, 0, 0, 0)
 until = new Date(from)
 until.setDate(from.getDate() + 6)
 until.setHours(23, 59, 59, 999)
 } else if (period === 'monthly') {
 from = new Date(safeRef.getFullYear(), safeRef.getMonth(), 1, 0, 0, 0, 0)
 until = new Date(safeRef.getFullYear(), safeRef.getMonth() + 1, 0, 23, 59, 59, 999)
 } else if (period === 'semester') {
 const isOdd = safeRef.getMonth() >= 6 // Jul - Des (Semester 1 Ganjil)
 if (isOdd) {
 from = new Date(safeRef.getFullYear(), 6, 1, 0, 0, 0, 0)
 until = new Date(safeRef.getFullYear(), 11, 31, 23, 59, 59, 999)
 } else {
 from = new Date(safeRef.getFullYear(), 0, 1, 0, 0, 0, 0)
 until = new Date(safeRef.getFullYear(), 5, 30, 23, 59, 59, 999)
 }
 }

 const formatYMD = (d) => {
 const y = d.getFullYear()
 const m = String(d.getMonth() + 1).padStart(2, '0')
 const day = String(d.getDate()).padStart(2, '0')
 return `${y}-${m}-${day}`
 }

 return {
 from: formatYMD(from),
 until: formatYMD(until),
 fromFormatted: formatDateShort(from),
 untilFormatted: formatDateShort(until),
 }
}

const PERMISSION_TYPES = [
 { value: 'Sakit', label: 'Sakit (Dengan Keterangan Dokter/Ortu)' },
 { value: 'Izin', label: 'Izin Kegiatan / Keperluan' },
 { value: 'Keperluan keluarga', label: 'Keperluan Keluarga Mendesak' },
 { value: 'Lainnya', label: 'Lainnya' },
]

// ── HEROUI MODAL SELECT DROPDOWN COMPONENT ──
function HeroUiModalSelect({
 label,
 value,
 onChange,
 options = [],
 placeholder = '-- Pilih Opsi --',
 disabled = false,
 required = false,
 helperText = '',
 icon: IconComponent = null,
 searchable = false,
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
 <div className="relative w-full" ref={containerRef}>
 {label && (
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
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
 ? 'border-[#059669] bg-white ring-4 ring-[#059669]/12 dark:border-[#18A972] dark:bg-slate-900 dark:ring-[#18A972]/20 text-slate-800 dark:text-slate-100 shadow-sm'
 : 'border-emerald-200/80 bg-slate-50/50 hover:bg-white hover:border-emerald-300 dark:border-emerald-700/80/80 dark:bg-slate-900/50 dark:hover:bg-slate-900 dark:hover:border-emerald-600/80 text-slate-800 dark:text-slate-100'
 }`}
 >
 <div className="flex items-center gap-2 truncate">
 {IconComponent && (
 <IconComponent className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
 )}
 {selectedOption && selectedOption.value !== '' ? (
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
 className="absolute left-0 right-0 top-full mt-1.5 z-[90] overflow-hidden rounded-xl border border-emerald-200/80 bg-white/95 backdrop-blur-md shadow-2xl dark:border-emerald-700/80/80 dark:bg-[#182232]/95"
 >
 {/* Search Input jika searchable */}
 {searchable && options.length > 5 && (
 <div className="p-2 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <div className="relative">
 <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Ketik untuk mencari..."
 className="w-full rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/60 pl-8 pr-2.5 py-1.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#059669] focus:outline-none dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-100"
 autoFocus
 />
 </div>
 </div>
 )}

 {/* List options */}
 <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
 {filteredOptions.length === 0 ? (
 <div className="px-3 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
 Tidak ada data yang cocok
 </div>
 ) : (
 filteredOptions.map((opt) => {
 const isSelected = String(opt.value) === String(value)
 return (
 <button
 key={opt.value}
 type="button"
 disabled={opt.disabled}
 onClick={() => {
 onChange(opt.value)
 setIsOpen(false)
 }}
 className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors text-left cursor-pointer ${
 isSelected
 ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
 : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300'
 }`}
 >
 <div className="truncate pr-2">
 <div>{opt.label}</div>
 {opt.subtext && (
 <div className="text-[10px] text-slate-400 font-normal">{opt.subtext}</div>
 )}
 </div>
 {isSelected && (
 <Check className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
 )}
 </button>
 )
 })
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {helperText && (
 <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
 {helperText}
 </p>
 )}
 </div>
 )
}

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
 ariaLabel = '',
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
 aria-label={ariaLabel}
 onClick={() => {
 setIsOpen((prev) => !prev)
 setSearch('')
 }}
 className={`h-9 w-full flex items-center justify-between gap-2 rounded-xl border px-3 text-xs font-semibold transition-all duration-200 cursor-pointer ${
 isOpen
 ? 'border-[#059669] bg-white ring-2 ring-[#059669]/15 dark:border-[#18A972] dark:bg-[#111827] dark:ring-[#18A972]/20 text-slate-900 dark:text-white shadow-xs'
 : value !== '' && value !== 'all' && value !== undefined && value !== null
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200'
 : 'border-emerald-200/80 bg-white text-slate-800 hover:border-emerald-300 dark:border-emerald-700/80 dark:bg-[#111827] dark:text-slate-100 dark:hover:border-emerald-600/80'
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
 className={`absolute left-0 top-full mt-1.5 z-[90] ${popoverWidth} overflow-hidden rounded-xl border border-emerald-200/80 bg-white/95 backdrop-blur-md shadow-2xl dark:border-emerald-700/80/80 dark:bg-[#182232]/95`}
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
 className="w-full rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/60 pl-8 pr-2.5 py-1 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#059669] focus:outline-none dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-100"
 autoFocus
 />
 </div>
 </div>
 )}

 <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
 {filteredOptions.length === 0 ? (
 <div className="px-3 py-3 text-center text-xs text-slate-400 dark:text-slate-500">
 Tidak ada data
 </div>
 ) : (
 filteredOptions.map((opt) => {
 const isSelected = String(opt.value) === String(value)
 return (
 <button
 key={opt.value}
 type="button"
 onClick={() => {
 onChange(opt.value)
 setIsOpen(false)
 }}
 className={`w-full flex items-center justify-between rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors text-left cursor-pointer ${
 isSelected
 ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
 : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300'
 }`}
 >
 <span className="truncate pr-2">{opt.label}</span>
 {isSelected && (
 <Check className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
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

export default function AttendanceWorkspace({
 attendanceLogs = [],
 permissionsHistory = [],
 onSubmitPermission = null,
 canSubmitPermission = false,
 isParent = false,
 loading = false,
 student = null,
 childId = null,
 onReload = null,
}) {
 const [activeTab, setActiveTab] = useState('school') // 'school' | 'permissions'

 // Filter state periode waktu (Harian, Mingguan, Bulanan, Semester, Semua)
 const [selectedPeriod, setSelectedPeriod] = useState('all')

 // Filter state presensi pembelajaran
 const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'hadir' | 'terlambat' | 'sakit' | 'izin' | 'alpa'
 const [selectedSubject, setSelectedSubject] = useState('all')
 const [selectedMonth, setSelectedMonth] = useState('all')
 const [selectedDate, setSelectedDate] = useState('')
 const [searchQuery, setSearchQuery] = useState('')
 const debouncedSearch = useDebounce(searchQuery, 350)

 // Filter state riwayat perizinan
 const [permissionStatusFilter, setPermissionStatusFilter] = useState('all') // 'all' | 'pending' | 'approved' | 'rejected'
 const [permissionTypeFilter, setPermissionTypeFilter] = useState('all')
 const [permissionSearchQuery, setPermissionSearchQuery] = useState('')
 const debouncedPermissionSearch = useDebounce(permissionSearchQuery, 350)

 // Modal State
 const [modalOpen, setModalOpen] = useState(false)
 const [type, setType] = useState('Sakit')
 const [startDate, setStartDate] = useState(() =>
 new Intl.DateTimeFormat('en-CA').format(new Date())
 )
 const [endDate, setEndDate] = useState(() =>
 new Intl.DateTimeFormat('en-CA').format(new Date())
 )
 const [reason, setReason] = useState('')
 const [attachment, setAttachment] = useState(null)
 const [submitting, setSubmitting] = useState(false)
 const [feedback, setFeedback] = useState(null)

 const isBoarding = useMemo(() => {
 if (typeof student?.program === 'string') return student.program === 'boarding'
 if (student?.is_pesantren !== undefined) return Boolean(student.is_pesantren)
 const unit = (student?.unit_name || student?.education_unit?.name || student?.unit_code || '').toLowerCase()
 return unit.includes('pesantren') || unit.includes('ponpes') || unit.includes('asrama')
 }, [student])

 // Tahun ajaran aktif dinamis (Zero Hardcode)
 const currentAcademicYear = useMemo(() => {
 if (student?.academic_year) return student.academic_year
 if (student?.tahun_ajaran) return student.tahun_ajaran
 if (student?.kelas?.academic_year) return student.kelas.academic_year
 if (student?.academic_year_name) return student.academic_year_name
 const now = new Date()
 const year = now.getFullYear()
 const isOdd = now.getMonth() >= 6
 return isOdd ? `${year}/${year + 1}` : `${year - 1}/${year}`
 }, [student])

 // Normalisasi data presensi
 const safeAttendanceLogs = useMemo(() => {
 if (Array.isArray(attendanceLogs)) return attendanceLogs
 if (attendanceLogs && Array.isArray(attendanceLogs.data)) return attendanceLogs.data
 return []
 }, [attendanceLogs])

 // Normalisasi data perizinan
 const safePermissionsHistory = useMemo(() => {
 if (Array.isArray(permissionsHistory)) return permissionsHistory
 if (permissionsHistory && Array.isArray(permissionsHistory.data)) {
 return permissionsHistory.data
 }
 return []
 }, [permissionsHistory])

 // Rentang Tanggal Aktif dari Periode Terpilih
 const activePeriodRange = useMemo(() => {
 return getDateRangeForAttendancePeriod(selectedPeriod)
 }, [selectedPeriod])

 // Data presensi yang telah disaring berdasarkan periode waktu (Harian, Mingguan, Bulanan, Semester, Semua)
 const periodAttendanceLogs = useMemo(() => {
 if (selectedPeriod === 'all') return safeAttendanceLogs
 const range = getDateRangeForAttendancePeriod(selectedPeriod)
 if (!range) return safeAttendanceLogs

 return safeAttendanceLogs.filter((item) => {
 const itemDate = String(item.tanggal || item.date || item.created_at || '').slice(0, 10)
 if (!itemDate) return false
 return itemDate >= range.from && itemDate <= range.until
 })
 }, [safeAttendanceLogs, selectedPeriod])

 // Ekstrak daftar mata pelajaran unik dinamis dari safeAttendanceLogs (Zero Hardcode)
 const availableSubjects = useMemo(() => {
 const set = new Set()
 safeAttendanceLogs.forEach((item) => {
 const name =
 item.jadwal_pelajaran?.subject?.name ||
 item.jadwalPelajaran?.subject?.name ||
 item.session?.schedule?.subject?.name ||
 item.subject_name
 if (name && typeof name === 'string' && name.trim()) {
 set.add(name.trim())
 }
 })
 return Array.from(set).sort((a, b) => a.localeCompare(b))
 }, [safeAttendanceLogs])

 // Ekstrak daftar bulan unik dinamis dari safeAttendanceLogs (Zero Hardcode)
 const availableMonths = useMemo(() => {
 const map = new Map()
 safeAttendanceLogs.forEach((item) => {
 const d = item.tanggal || item.date || item.created_at
 if (d) {
 const key = String(d).slice(0, 7) // 'YYYY-MM'
 if (key.length === 7 && !map.has(key)) {
 try {
 const dateObj = new Date(`${key}-01T00:00:00`)
 const label = new Intl.DateTimeFormat('id-ID', {
 month: 'long',
 year: 'numeric',
 }).format(dateObj)
 map.set(key, label)
 } catch {
 map.set(key, key)
 }
 }
 }
 })
 return Array.from(map.entries())
 .sort((a, b) => b[0].localeCompare(a[0]))
 .map(([value, label]) => ({ value, label }))
 }, [safeAttendanceLogs])

 // Ekstrak jenis perizinan unik dinamis dari safePermissionsHistory (Zero Hardcode)
 const availablePermissionTypes = useMemo(() => {
 const set = new Set()
 safePermissionsHistory.forEach((item) => {
 if (item.type && typeof item.type === 'string' && item.type.trim()) {
 set.add(item.type.trim())
 }
 })
 return Array.from(set).sort((a, b) => a.localeCompare(b))
 }, [safePermissionsHistory])

 // Options for HeroUI Selects
 const subjectFilterOptions = useMemo(() => [
 { value: 'all', label: `Semua Mata Pelajaran (${availableSubjects.length})` },
 ...availableSubjects.map((s) => ({ value: s, label: s })),
 ], [availableSubjects])

 const monthFilterOptions = useMemo(() => [
 { value: 'all', label: `Semua Periode (${availableMonths.length > 0 ? `${availableMonths.length} Bulan` : 'Total'})` },
 ...availableMonths.map((m) => ({ value: m.value, label: m.label })),
 ], [availableMonths])

 const permissionStatusFilterOptions = useMemo(() => [
 { value: 'all', label: 'Semua Status Pengajuan' },
 { value: 'pending', label: 'Menunggu Verifikasi' },
 { value: 'approved', label: 'Disetujui' },
 { value: 'rejected', label: 'Ditolak' },
 ], [])

 const permissionTypeFilterOptions = useMemo(() => [
 { value: 'all', label: `Semua Kategori (${availablePermissionTypes.length})` },
 ...availablePermissionTypes.map((t) => ({ value: t, label: t })),
 ], [availablePermissionTypes])

 // Hitung Statistik Kehadiran Dinamis (Sesuai Periode Waktu Terpilih)
 const stats = useMemo(() => {
 let hadir = 0
 let terlambat = 0
 let izin = 0
 let sakit = 0
 let alpha = 0

 periodAttendanceLogs.forEach((item) => {
 const st = String(
 item.status_hadir || item.status_label || item.status || ''
 ).toLowerCase()

 if (st.includes('hadir') && !st.includes('tidak')) {
 hadir++
 } else if (st.includes('terlambat') || st === 't') {
 terlambat++
 } else if (st.includes('izin') || st === 'i') {
 izin++
 } else if (st.includes('sakit') || st === 's') {
 sakit++
 } else if (st.includes('alpha') || st.includes('alpa') || st === 'a') {
 alpha++
 }
 })

 const total = periodAttendanceLogs.length
 const presentTotal = hadir + terlambat
 const rate = total > 0 ? Math.round((presentTotal / total) * 100) : 0

 return {
 total,
 hadir,
 terlambat,
 izin,
 sakit,
 alpha,
 rate,
 }
 }, [periodAttendanceLogs])

 // Filter logs berdasarkan periode, status, mata pelajaran, bulan, tanggal spesifik, dan search query
 const filteredLogs = useMemo(() => {
 return periodAttendanceLogs.filter((item) => {
 const rawStat = String(
 item.status_hadir || item.status_label || item.status || ''
 ).toLowerCase()

 const isHadir = rawStat.includes('hadir') && !rawStat.includes('tidak')
 const isLate = rawStat.includes('terlambat') || rawStat === 't'
 const isIzin = rawStat.includes('izin') || rawStat === 'i'
 const isSakit = rawStat.includes('sakit') || rawStat === 's'
 const isAlpa = rawStat.includes('alpha') || rawStat.includes('alpa') || rawStat === 'a'

 // Filter Status Kehadiran
 if (statusFilter === 'hadir' && !isHadir) return false
 if (statusFilter === 'terlambat' && !isLate) return false
 if (statusFilter === 'sakit' && !isSakit) return false
 if (statusFilter === 'izin' && !isIzin) return false
 if (statusFilter === 'alpa' && !isAlpa) return false
 if (statusFilter === 'izin_sakit' && !isIzin && !isSakit) return false

 // Filter Mata Pelajaran
 if (selectedSubject !== 'all') {
 const subjName =
 item.jadwal_pelajaran?.subject?.name ||
 item.jadwalPelajaran?.subject?.name ||
 item.session?.schedule?.subject?.name ||
 item.subject_name ||
 ''
 if (subjName !== selectedSubject) return false
 }

 // Filter Bulan (YYYY-MM)
 if (selectedMonth !== 'all') {
 const itemDate = String(item.tanggal || item.date || item.created_at || '')
 if (!itemDate.startsWith(selectedMonth)) return false
 }

 // Filter Tanggal Spesifik (YYYY-MM-DD)
 if (selectedDate) {
 const itemDate = String(item.tanggal || item.date || item.created_at || '')
 if (!itemDate.startsWith(selectedDate)) return false
 }

 // Filter Search (Debounced)
 if (debouncedSearch.trim()) {
 const query = debouncedSearch.toLowerCase()
 const subject = String(
 item.jadwal_pelajaran?.subject?.name ||
 item.jadwalPelajaran?.subject?.name ||
 item.session?.schedule?.subject?.name ||
 item.subject_name ||
 ''
 ).toLowerCase()
 const topic = String(
 item.session?.topic || item.session?.learning_material || ''
 ).toLowerCase()
 const notes = String(item.keterangan || item.notes || item.catatan || '').toLowerCase()
 const teacher = String(
 item.jadwal_pelajaran?.teacher?.name ||
 item.jadwal_pelajaran?.employee?.name ||
 item.teacher_name ||
 ''
 ).toLowerCase()

 if (
 !subject.includes(query) &&
 !topic.includes(query) &&
 !notes.includes(query) &&
 !teacher.includes(query)
 ) {
 return false
 }
 }

 return true
 })
 }, [
 periodAttendanceLogs,
 statusFilter,
 selectedSubject,
 selectedMonth,
 selectedDate,
 debouncedSearch,
 ])

 // Filter Riwayat Perizinan (Sesuai Periode Waktu Terpilih)
 const filteredPermissions = useMemo(() => {
 return safePermissionsHistory.filter((item) => {
 // Filter Periode Waktu
 if (selectedPeriod !== 'all') {
 const range = getDateRangeForAttendancePeriod(selectedPeriod)
 if (range) {
 const itemDate = String(item.start_date || item.created_at || '').slice(0, 10)
 if (itemDate < range.from || itemDate > range.until) {
 return false
 }
 }
 }

 // Filter Status
 if (permissionStatusFilter !== 'all') {
 if (item.status !== permissionStatusFilter) return false
 }

 // Filter Tipe / Kategori
 if (permissionTypeFilter !== 'all') {
 if (item.type !== permissionTypeFilter) return false
 }

 // Filter Pencarian Alasan
 if (debouncedPermissionSearch.trim()) {
 const q = debouncedPermissionSearch.toLowerCase()
 const reason = String(item.reason || '').toLowerCase()
 const typeStr = String(item.type || '').toLowerCase()
 if (!reason.includes(q) && !typeStr.includes(q)) return false
 }

 return true
 })
 }, [
 safePermissionsHistory,
 selectedPeriod,
 permissionStatusFilter,
 permissionTypeFilter,
 debouncedPermissionSearch,
 ])

 // Handler Reset Filter Presensi
 const hasActiveSchoolFilters =
 selectedPeriod !== 'all' ||
 statusFilter !== 'all' ||
 selectedSubject !== 'all' ||
 selectedMonth !== 'all' ||
 selectedDate !== '' ||
 searchQuery.trim() !== ''

 const activeSchoolFiltersCount =
 (selectedPeriod !== 'all' ? 1 : 0) +
 (statusFilter !== 'all' ? 1 : 0) +
 (selectedSubject !== 'all' ? 1 : 0) +
 (selectedMonth !== 'all' ? 1 : 0) +
 (selectedDate !== '' ? 1 : 0) +
 (searchQuery.trim() !== '' ? 1 : 0)

 const handleResetSchoolFilters = () => {
 setSelectedPeriod('all')
 setStatusFilter('all')
 setSelectedSubject('all')
 setSelectedMonth('all')
 setSelectedDate('')
 setSearchQuery('')
 }

 // Handler Reset Filter Perizinan
 const hasActivePermissionFilters =
 selectedPeriod !== 'all' ||
 permissionStatusFilter !== 'all' ||
 permissionTypeFilter !== 'all' ||
 permissionSearchQuery.trim() !== ''

 const activePermissionFiltersCount =
 (selectedPeriod !== 'all' ? 1 : 0) +
 (permissionStatusFilter !== 'all' ? 1 : 0) +
 (permissionTypeFilter !== 'all' ? 1 : 0) +
 (permissionSearchQuery.trim() !== '' ? 1 : 0)

 const handleResetPermissionFilters = () => {
 setSelectedPeriod('all')
 setPermissionStatusFilter('all')
 setPermissionTypeFilter('all')
 setPermissionSearchQuery('')
 }

 // Submit Handler Pengajuan Izin
 const handleSubmit = async (e) => {
 e.preventDefault()
 if (!onSubmitPermission) return
 setSubmitting(true)
 setFeedback(null)

 try {
 await onSubmitPermission({
 type,
 start_date: startDate,
 end_date: endDate,
 reason,
 attachment,
 child_id: childId,
 })

 setFeedback({
 type: 'success',
 message: 'Alhamdulillah, pengajuan izin/sakit berhasil dikirim dan menunggu verifikasi sekolah.',
 })

 setTimeout(() => {
 setModalOpen(false)
 setReason('')
 setAttachment(null)
 setFeedback(null)
 }, 1500)

 onReload?.()
 } catch (err) {
 setFeedback({
 type: 'error',
 message:
 err.response?.data?.message ||
 'Gagal mengirim pengajuan izin. Pastikan semua kolom terisi dengan benar.',
 })
 } finally {
 setSubmitting(false)
 }
 }

 return (
 <div className="space-y-6">
 {/* 1. HERO HEADER CONTAINER TERPADU (HERO UI CARD) */}
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] p-5 sm:p-7 shadow-lg shadow-sky-500/10 dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div
 aria-hidden="true"
 className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white dark:bg-[#1B2433] blur-3xl"
 />
 <div
 aria-hidden="true"
 className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-white dark:bg-[#1B2433] blur-3xl"
 />
 <div
 aria-hidden="true"
 className="absolute inset-0 opacity-[.06] text-sky-600 dark:text-sky-500 [background-image:radial-gradient(circle_at_2px_2px,currentColor_1.5px,transparent_0)] [background-size:24px_24px]"
 />

 <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
 <div className="flex items-start gap-4">
 <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-xl shadow-sky-600/20">
 <CalendarCheck className="h-7 w-7" />
 </div>
 <div>
 <div className="flex flex-wrap items-center gap-2">
 <HeroChip
 size="sm"
 variant="flat"
 className="font-extrabold text-[10.5px] bg-sky-500/20 border border-emerald-200/80 dark:border-emerald-800/60 text-sky-900 dark:text-sky-300"
 >
 <Sparkles className="h-3 w-3 text-sky-600 mr-1 inline" />
 Presensi KBM & Perizinan
 </HeroChip>

 <HeroChip
 size="sm"
 variant="flat"
 className={cn(
 'font-black text-[10px]',
 isBoarding
 ? 'bg-indigo-100 text-indigo-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-indigo-950 dark:text-indigo-300 dark:border-emerald-800/60'
 : 'bg-emerald-100 text-emerald-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60'
 )}
 >
 {isBoarding ? 'Boarding / Pesantren' : 'Full Day'}
 </HeroChip>

 {stats.total > 0 && (
 <HeroChip
 size="sm"
 variant="flat"
 className="font-black text-[10px] bg-white/80 text-sky-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-sky-300 dark:border-emerald-700/80"
 >
 Tingkat Kehadiran: {stats.rate}%
 {selectedPeriod !== 'all' && (
 <span className="ml-1 text-sky-600 font-extrabold">
 ({ATTENDANCE_PERIOD_OPTIONS.find((p) => p.id === selectedPeriod)?.shortLabel})
 </span>
 )}
 </HeroChip>
 )}
 </div>

 <h1 className="mt-1.5 text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
 {student?.full_name
 ? `Presensi & Kehadiran — ${student.full_name}`
 : isBoarding
 ? 'Presensi & Kehadiran Santri'
 : 'Presensi & Kehadiran Siswa'}
 </h1>
 <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
 Pantau rekapitulasi kehadiran jam pembelajaran kelas (KBM), ketepatan waktu, serta riwayat pengajuan surat izin/sakit ananda secara transparan.
 </p>
 </div>
 </div>

 {/* Action Button: Ajukan Izin / Sakit */}
 {canSubmitPermission && (
 <div className="flex items-center gap-3 shrink-0">
 <HeroButton
 size="md"
 onPress={() => setModalOpen(true)}
 className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white px-5 py-2.5 text-xs sm:text-sm font-black shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] cursor-pointer"
 >
 <Plus className="h-4 w-4" />
 Ajukan Izin / Sakit
 </HeroButton>
 </div>
 )}
 </div>
 </HeroCard>

 {/* 2. DYNAMIC 5 KPI CARDS (HERO UI CARDS) */}
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
 {/* Card 1: Hadir */}
 <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4.5 shadow-xs transition-all hover:shadow-md dark:border-emerald-800/60 dark:bg-slate-900">
 <div
 aria-hidden="true"
 className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white dark:bg-[#1B2433] blur-xl"
 />
 <div className="relative flex items-center justify-between gap-2">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm">
 <CheckCircle2 className="h-5 w-5" />
 </div>
 <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
 {stats.hadir}
 </span>
 </div>
 <p className="relative mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">
 Hadir Tepat Waktu
 </p>
 <p className="relative mt-0.5 text-xs font-medium text-slate-400 dark:text-slate-500">
 {stats.total > 0
 ? `${Math.round((stats.hadir / stats.total) * 100)}% dari sesi KBM`
 : 'Pertemuan KBM'}
 </p>
 </HeroCard>
 </motion.div>

 {/* Card 2: Terlambat */}
 <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4.5 shadow-xs transition-all hover:shadow-md dark:border-emerald-800/60 dark:bg-slate-900">
 <div
 aria-hidden="true"
 className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white dark:bg-[#1B2433] blur-xl"
 />
 <div className="relative flex items-center justify-between gap-2">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-sm">
 <Clock className="h-5 w-5" />
 </div>
 <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
 {stats.terlambat}
 </span>
 </div>
 <p className="relative mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">
 Terlambat Masuk
 </p>
 <p className="relative mt-0.5 text-xs font-medium text-slate-400 dark:text-slate-500">
 Sesi dengan toleransi
 </p>
 </HeroCard>
 </motion.div>

 {/* Card 3: Izin */}
 <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4.5 shadow-xs transition-all hover:shadow-md dark:border-emerald-800/60 dark:bg-slate-900">
 <div
 aria-hidden="true"
 className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white dark:bg-[#1B2433] blur-xl"
 />
 <div className="relative flex items-center justify-between gap-2">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-md shadow-sky-500/20">
 <FileText className="h-5 w-5" />
 </div>
 <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
 {stats.izin}
 </span>
 </div>
 <p className="relative mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">
 Izin Terkonfirmasi
 </p>
 <p className="relative mt-0.5 text-xs font-medium text-slate-400 dark:text-slate-500">
 Disetujui sekolah
 </p>
 </HeroCard>
 </motion.div>

 {/* Card 4: Sakit */}
 <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4.5 shadow-xs transition-all hover:shadow-md dark:border-emerald-800/60 dark:bg-slate-900">
 <div
 aria-hidden="true"
 className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white dark:bg-[#1B2433] blur-xl"
 />
 <div className="relative flex items-center justify-between gap-2">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-md shadow-violet-500/20">
 <HeartPulse className="h-5 w-5" />
 </div>
 <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
 {stats.sakit}
 </span>
 </div>
 <p className="relative mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">
 Sakit
 </p>
 <p className="relative mt-0.5 text-xs font-medium text-slate-400 dark:text-slate-500">
 Keterangan medis/ortu
 </p>
 </HeroCard>
 </motion.div>

 {/* Card 5: Alpa */}
 <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18 }} className="col-span-2 sm:col-span-1">
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4.5 shadow-xs transition-all hover:shadow-md dark:border-emerald-800/60 dark:bg-slate-900">
 <div
 aria-hidden="true"
 className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white dark:bg-[#1B2433] blur-xl"
 />
 <div className="relative flex items-center justify-between gap-2">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-sm">
 <XCircle className="h-5 w-5" />
 </div>
 <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
 {stats.alpha}
 </span>
 </div>
 <p className="relative mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">
 Alpa / Tanpa Kabar
 </p>
 <p className="relative mt-0.5 text-xs font-medium text-slate-400 dark:text-slate-500">
 Perlu perhatian ortu
 </p>
 </HeroCard>
 </motion.div>
 </div>

 {/* 3. WORKSPACE CONTAINER (HERO UI CARD) */}
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 sm:p-6 shadow-xs dark:border-emerald-800/60 dark:bg-slate-900">
 {/* Navigation Tabs & Header Toolbar */}
 <div className="flex flex-col gap-4 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-5 dark:border-emerald-800/60 lg:flex-row lg:items-center lg:justify-between">
 {/* Segmented Tab Buttons */}
 <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-700/80/60">
 <button
 type="button"
 onClick={() => setActiveTab('school')}
 className={cn(
 'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition-all cursor-pointer',
 activeTab === 'school'
 ? 'bg-white dark:bg-[#1B2433] shadow-sm'
 : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
 )}
 >
 <CalendarCheck className="h-4 w-4" />
 Presensi Pembelajaran ({safeAttendanceLogs.length})
 </button>

 <button
 type="button"
 onClick={() => setActiveTab('permissions')}
 className={cn(
 'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition-all cursor-pointer',
 activeTab === 'permissions'
 ? 'bg-white dark:bg-[#1B2433] shadow-sm'
 : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
 )}
 >
 <FileText className="h-4 w-4" />
 Riwayat Izin & Sakit ({safePermissionsHistory.length})
 </button>
 </div>

 {/* Quick status indicator on the right */}
 <div className="flex items-center gap-2">
 <HeroChip
 size="sm"
 variant="flat"
 className="font-bold text-xs bg-slate-100 text-slate-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/80"
 >
 <Sparkles className="h-3 w-3 mr-1 inline text-sky-600" />
 {activeTab === 'school' ? `Tahun Ajaran ${currentAcademicYear}` : 'Verifikasi Wali Kelas & Admin'}
 </HeroChip>
 </div>
 </div>

 {/* FILTER TOOLBAR TERPADU (PRESENSI) */}
 {activeTab === 'school' && (
 <div className="mt-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50/30 p-3.5 sm:p-4 dark:border-emerald-800/60 dark:bg-slate-800/40 space-y-3.5">
 {/* Baris 0: Pilihan Periode Waktu (Semua, Harian, Mingguan, Bulanan, Semester) */}
 <div className="flex flex-col gap-2.5 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3.5 dark:border-emerald-800/60">
 {/* Header Info & Badge Rentang Tanggal (Selalu Ada & Stabil) */}
 <div className="flex flex-wrap items-center justify-between gap-2 min-h-[30px]">
 <div className="flex items-center gap-2">
 <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5 shrink-0">
 <Calendar className="h-4 w-4 text-sky-600 shrink-0" />
 Filter Periode:
 </span>
 <span
 className={cn(
 'inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold border transition-all',
 activePeriodRange
 ? 'bg-sky-100/90 dark:bg-sky-950/80 border-emerald-200/80 dark:border-emerald-800/60 text-sky-800 dark:text-sky-300 font-extrabold shadow-2xs'
 : 'bg-slate-100 dark:bg-slate-800/80 border-emerald-200/80 dark:border-emerald-700/80 text-slate-600 dark:text-slate-400'
 )}
 >
 {activePeriodRange
 ? `${activePeriodRange.fromFormatted} s/d ${activePeriodRange.untilFormatted}`
 : 'Semua Periode (Seluruh Sesi)'}
 </span>
 </div>

 {selectedPeriod !== 'all' && (
 <button
 type="button"
 onClick={() => setSelectedPeriod('all')}
 className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-rose-600 dark:text-sky-400 dark:hover:text-rose-400 transition-colors cursor-pointer shrink-0"
 >
 <RotateCcw className="h-3 w-3" />
 <span>Reset Periode</span>
 </button>
 )}
 </div>

 {/* Segmented Period Tabs Bar (Responsif, teks utuh tidak terpotong, tidak bergeser saat diklik) */}
 <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-700/80/80 shadow-xs overflow-x-auto no-scrollbar">
 {ATTENDANCE_PERIOD_OPTIONS.map(({ id, label, icon: Icon }) => {
 const isActive = selectedPeriod === id
 return (
 <button
 key={id}
 type="button"
 onClick={() => {
 setSelectedPeriod(id)
 if (id !== 'all') {
 setSelectedMonth('all')
 setSelectedDate('')
 }
 }}
 className={cn(
 'inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 xl:flex-1 text-center select-none',
 isActive
 ? 'bg-white dark:bg-[#1B2433] shadow-xs font-extrabold ring-1 ring-sky-500/30'
 : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30'
 )}
 >
 <Icon className="h-3.5 w-3.5 shrink-0" />
 <span>{label}</span>
 </button>
 )
 })}
 </div>
 </div>

 {/* Baris 1: Search, Filter Mapel, Filter Bulan, Filter Tanggal, Reset */}
 <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-12 items-center">
 {/* Search Box */}
 <div className="relative lg:col-span-4">
 <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 placeholder="Cari mapel, materi, guru, catatan..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full rounded-xl border border-emerald-200/80 bg-white py-2 pl-9 pr-8 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-none dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-200 dark:placeholder-slate-500"
 />
 {searchQuery && (
 <button
 type="button"
 onClick={() => setSearchQuery('')}
 className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
 >
 <X className="h-3.5 w-3.5" />
 </button>
 )}
 </div>

 {/* Filter Mata Pelajaran */}
 <div className="lg:col-span-3">
 <HeroUiFilterSelect
 value={selectedSubject}
 onChange={(val) => setSelectedSubject(val)}
 options={subjectFilterOptions}
 placeholder="Semua Mata Pelajaran"
 icon={BookOpen}
 popoverWidth="min-w-[220px]"
 searchable
 />
 </div>

 {/* Filter Bulan / Periode */}
 <div className="lg:col-span-3">
 <HeroUiFilterSelect
 value={selectedMonth}
 onChange={(val) => setSelectedMonth(val)}
 options={monthFilterOptions}
 placeholder="Semua Periode"
 icon={Calendar}
 popoverWidth="min-w-[180px]"
 />
 </div>

 {/* Filter Tanggal & Reset */}
 <div className="relative lg:col-span-2 flex items-center gap-1.5">
 <div className="relative flex-1">
 <DatePicker
 value={selectedDate}
 onChange={(e) => {
 setSelectedDate(e.target.value)
 if (e.target.value) setSelectedPeriod('all')
 }}
 inputClassName="py-2 text-xs font-medium"
 placeholder="Pilih tanggal..."
 />
 {selectedDate && (
 <button
 type="button"
 onClick={() => setSelectedDate('')}
 className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10"
 title="Hapus filter tanggal"
 >
 <X className="h-3 w-3" />
 </button>
 )}
 </div>

 {hasActiveSchoolFilters && (
 <button
 type="button"
 onClick={handleResetSchoolFilters}
 title="Reset semua filter"
 className="inline-flex items-center gap-1 shrink-0 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 px-2.5 py-2 text-xs font-black text-rose-700 transition-all hover:bg-rose-100 hover:border-emerald-300 dark:hover:border-emerald-700 dark:border-emerald-800/60 dark:bg-rose-950/40 dark:text-rose-300 cursor-pointer"
 >
 <RotateCcw className="h-3.5 w-3.5" />
 <span className="hidden sm:inline">Reset</span>
 <span className="rounded-full bg-rose-200/80 px-1 text-[10px] text-rose-800 dark:bg-rose-900/80 dark:text-rose-200">
 {activeSchoolFiltersCount}
 </span>
 </button>
 )}
 </div>
 </div>

 {/* Baris 2: Interactive Status Pills */}
 <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60">
 <div className="flex flex-wrap items-center gap-1.5">
 {[
 { id: 'all', label: 'Semua Status', count: periodAttendanceLogs.length, activeClass: 'bg-slate-900 dark:bg-white dark:text-slate-900' },
 { id: 'hadir', label: 'Hadir', count: stats.hadir, activeClass: 'bg-emerald-600 text-white shadow-xs' },
 { id: 'terlambat', label: 'Terlambat', count: stats.terlambat, activeClass: 'bg-amber-600 text-white shadow-xs' },
 { id: 'sakit', label: 'Sakit', count: stats.sakit, activeClass: 'bg-violet-600 text-white shadow-xs' },
 { id: 'izin', label: 'Izin', count: stats.izin, activeClass: 'bg-sky-600 text-white shadow-xs' },
 { id: 'alpa', label: 'Alpa', count: stats.alpha, activeClass: 'bg-rose-600 text-white shadow-xs' },
 ].map((item) => {
 const isActive = statusFilter === item.id
 return (
 <button
 key={item.id}
 type="button"
 onClick={() => setStatusFilter(item.id)}
 className={cn(
 'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer',
 isActive
 ? item.activeClass
 : 'border border-emerald-200/80 bg-white text-slate-600 hover:border-emerald-300 hover:text-slate-900 dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
 )}
 >
 <span>{item.label}</span>
 <span
 className={cn(
 'rounded-full px-1.5 py-0.2 text-[10px] font-extrabold',
 isActive
 ? 'bg-white/20 dark:bg-slate-900/30'
 : 'bg-slate-100 text-slate-600 dark:bg-sky-950/60 dark:text-sky-300'
 )}
 >
 {item.count}
 </span>
 </button>
 )
 })}
 </div>

 {/* Data Count Indicator */}
 <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
 Menampilkan <span className="font-extrabold text-sky-700 dark:text-sky-300">{filteredLogs.length}</span> dari {periodAttendanceLogs.length} sesi
 </div>
 </div>
 </div>
 )}

 {/* FILTER TOOLBAR TERPADU (PERIZINAN) */}
 {activeTab === 'permissions' && (
 <div className="mt-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50/30 p-3.5 sm:p-4 dark:border-emerald-800/60 dark:bg-slate-800/40 space-y-3.5">
 {/* Baris 0: Pilihan Periode Waktu (Semua, Harian, Mingguan, Bulanan, Semester) */}
 <div className="flex flex-col gap-2.5 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3.5 dark:border-emerald-800/60">
 {/* Header Info & Badge Rentang Tanggal (Selalu Ada & Stabil) */}
 <div className="flex flex-wrap items-center justify-between gap-2 min-h-[30px]">
 <div className="flex items-center gap-2">
 <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5 shrink-0">
 <Calendar className="h-4 w-4 text-sky-600 shrink-0" />
 Filter Periode:
 </span>
 <span
 className={cn(
 'inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold border transition-all',
 activePeriodRange
 ? 'bg-sky-100/90 dark:bg-sky-950/80 border-emerald-200/80 dark:border-emerald-800/60 text-sky-800 dark:text-sky-300 font-extrabold shadow-2xs'
 : 'bg-slate-100 dark:bg-slate-800/80 border-emerald-200/80 dark:border-emerald-700/80 text-slate-600 dark:text-slate-400'
 )}
 >
 {activePeriodRange
 ? `${activePeriodRange.fromFormatted} s/d ${activePeriodRange.untilFormatted}`
 : 'Semua Periode (Seluruh Izin & Sakit)'}
 </span>
 </div>

 {selectedPeriod !== 'all' && (
 <button
 type="button"
 onClick={() => setSelectedPeriod('all')}
 className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-rose-600 dark:text-sky-400 dark:hover:text-rose-400 transition-colors cursor-pointer shrink-0"
 >
 <RotateCcw className="h-3 w-3" />
 <span>Reset Periode</span>
 </button>
 )}
 </div>

 {/* Segmented Period Tabs Bar (Responsif, teks utuh tidak terpotong, tidak bergeser saat diklik) */}
 <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-700/80/80 shadow-xs overflow-x-auto no-scrollbar">
 {ATTENDANCE_PERIOD_OPTIONS.map(({ id, label, icon: Icon }) => {
 const isActive = selectedPeriod === id
 return (
 <button
 key={id}
 type="button"
 onClick={() => setSelectedPeriod(id)}
 className={cn(
 'inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 xl:flex-1 text-center select-none',
 isActive
 ? 'bg-white dark:bg-[#1B2433] shadow-xs font-extrabold ring-1 ring-sky-500/30'
 : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30'
 )}
 >
 <Icon className="h-3.5 w-3.5 shrink-0" />
 <span>{label}</span>
 </button>
 )
 })}
 </div>
 </div>

 <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-12 items-center">
 {/* Search Box */}
 <div className="relative lg:col-span-5">
 <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 placeholder="Cari alasan izin / surat sakit..."
 value={permissionSearchQuery}
 onChange={(e) => setPermissionSearchQuery(e.target.value)}
 className="w-full rounded-xl border border-emerald-200/80 bg-white py-2 pl-9 pr-8 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-none dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-200 dark:placeholder-slate-500"
 />
 {permissionSearchQuery && (
 <button
 type="button"
 onClick={() => setPermissionSearchQuery('')}
 className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
 >
 <X className="h-3.5 w-3.5" />
 </button>
 )}
 </div>

 {/* Filter Status */}
 <div className="lg:col-span-3">
 <HeroUiFilterSelect
 value={permissionStatusFilter}
 onChange={(val) => setPermissionStatusFilter(val)}
 options={permissionStatusFilterOptions}
 placeholder="Semua Status Pengajuan"
 icon={Filter}
 popoverWidth="min-w-[190px]"
 />
 </div>

 {/* Filter Kategori / Jenis */}
 <div className="lg:col-span-3">
 <HeroUiFilterSelect
 value={permissionTypeFilter}
 onChange={(val) => setPermissionTypeFilter(val)}
 options={permissionTypeFilterOptions}
 placeholder="Semua Kategori"
 icon={FileText}
 popoverWidth="min-w-[190px]"
 />
 </div>

 {/* Reset Filter Button */}
 <div className="lg:col-span-1 flex items-center justify-end">
 {hasActivePermissionFilters && (
 <button
 type="button"
 onClick={handleResetPermissionFilters}
 title="Reset filter perizinan"
 className="inline-flex items-center gap-1 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 px-2.5 py-2 text-xs font-black text-rose-700 transition-all hover:bg-rose-100 dark:border-emerald-800/60 dark:bg-rose-950/40 dark:text-rose-300 cursor-pointer"
 >
 <RotateCcw className="h-3.5 w-3.5" />
 <span>Reset</span>
 </button>
 )}
 </div>
 </div>

 {/* Data Count Indicator */}
 <div className="flex items-center justify-between pt-1 border-t border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 text-xs font-bold text-slate-500 dark:text-slate-400">
 <span>Menampilkan <span className="font-extrabold text-sky-700 dark:text-sky-300">{filteredPermissions.length}</span> dari {safePermissionsHistory.length} pengajuan perizinan</span>
 </div>
 </div>
 )}

 {/* TAB 1: DAFTAR PRESENSI PEMBELAJARAN */}
 {activeTab === 'school' && (
 <div className="mt-5 space-y-3">
 {filteredLogs.map((item, idx) => {
 const noteText = item.keterangan || item.notes || item.catatan || ''
 const rawStat = String(
 item.status_hadir || item.status_label || item.status || ''
 ).toLowerCase()
 const isHadir = rawStat.includes('hadir') && !rawStat.includes('tidak')
 const isLate = rawStat.includes('terlambat') || rawStat === 't'
 const isIzin = rawStat.includes('izin') || rawStat === 'i'
 const isSakit = rawStat.includes('sakit') || rawStat === 's'
 const isAlpa = rawStat.includes('alpha') || rawStat.includes('alpa') || rawStat === 'a'

 const subjectName =
 item.jadwal_pelajaran?.subject?.name ||
 item.jadwalPelajaran?.subject?.name ||
 item.session?.schedule?.subject?.name ||
 item.subject_name ||
 'Presensi Sesi Pembelajaran'

 const timeDisplay =
 item.arrival_time ||
 (item.jadwal_pelajaran?.time_start
 ? `${item.jadwal_pelajaran.time_start.slice(0, 5)} - ${item.jadwal_pelajaran.time_end.slice(0, 5)} WIB`
 : item.waktu_presensi
 ? new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(item.waktu_presensi))
 : null)

 return (
 <motion.div
 key={item.id || idx}
 whileHover={{ scale: 1.004 }}
 transition={{ duration: 0.15 }}
 className={cn(
 'rounded-xl border-2 p-4 sm:p-5 transition-all shadow-xs',
 isHadir
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-white hover:border-emerald-300 dark:hover:border-emerald-700 dark:border-emerald-800/60 dark:bg-slate-800/40'
 : isLate
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/20 hover:border-emerald-300 dark:hover:border-emerald-700 dark:border-emerald-800/60 dark:bg-amber-950/20'
 : isIzin || isSakit
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50/20 hover:border-emerald-300 dark:hover:border-emerald-700 dark:border-emerald-800/60 dark:bg-sky-950/20'
 : 'border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/20 hover:border-emerald-300 dark:hover:border-emerald-700 dark:border-emerald-800/60 dark:bg-rose-950/20'
 )}
 >
 <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
 <div className="space-y-1 min-w-0">
 <div className="flex flex-wrap items-center gap-2">
 <h4 className="text-sm font-extrabold text-slate-900 dark:text-white ">
 {subjectName}
 </h4>
 {item.pertemuan_ke && (
 <span className="text-[10px] font-bold text-sky-700 bg-sky-100 dark:bg-sky-950/80 dark:text-sky-300 px-2 py-0.5 rounded-md">
 Pertemuan {item.pertemuan_ke}
 </span>
 )}
 </div>

 <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
 {formatDateLong(item.tanggal || item.created_at || item.date)}
 {timeDisplay ? ` · ${timeDisplay}` : ''}
 </p>

 {/* Topik / Materi Pembelajaran jika tersedia */}
 {(item.session?.topic || item.session?.learning_material) && (
 <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
 <span className="text-slate-400 font-medium">Materi: </span>
 {item.session?.topic || item.session?.learning_material}
 </p>
 )}
 </div>

 {/* Status Badge */}
 <div className="shrink-0">
 <HeroChip
 size="sm"
 variant="flat"
 className={cn(
 'font-extrabold text-[10px] border px-2.5 py-1',
 isHadir
 ? 'bg-emerald-100 text-emerald-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60'
 : isLate
 ? 'bg-amber-100 text-amber-900 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950 dark:text-amber-300 dark:border-emerald-800/60'
 : isIzin
 ? 'bg-sky-100 text-sky-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-sky-950 dark:text-sky-300 dark:border-emerald-800/60'
 : isSakit
 ? 'bg-violet-100 text-violet-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-violet-950 dark:text-violet-300 dark:border-emerald-800/60'
 : 'bg-rose-100 text-rose-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950 dark:text-rose-300 dark:border-emerald-800/60'
 )}
 >
 {isHadir ? (
 <>
 <CheckCircle2 className="h-3 w-3 mr-1 inline text-emerald-600" /> Hadir Tepat Waktu
 </>
 ) : isLate ? (
 <>
 <Clock className="h-3 w-3 mr-1 inline text-amber-600" /> Terlambat
 </>
 ) : isIzin ? (
 <>
 <FileText className="h-3 w-3 mr-1 inline text-sky-600" /> Izin
 </>
 ) : isSakit ? (
 <>
 <HeartPulse className="h-3 w-3 mr-1 inline text-violet-600" /> Sakit
 </>
 ) : (
 <>
 <XCircle className="h-3 w-3 mr-1 inline text-rose-600" /> Alpa
 </>
 )}
 </HeroChip>
 </div>
 </div>

 {/* Catatan Guru / Homeroom Callout Box */}
 {noteText ? (
 <div
 className={cn(
 'mt-3 flex items-start gap-2.5 rounded-xl p-3 text-xs font-semibold leading-relaxed',
 isLate
 ? 'border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50 text-amber-950 dark:border-emerald-800/60 dark:bg-amber-950/40 dark:text-amber-200'
 : isAlpa
 ? 'border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 text-rose-950 dark:border-emerald-800/60 dark:bg-rose-950/40 dark:text-rose-200'
 : 'border border-emerald-200/80 bg-slate-50 text-slate-800 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200'
 )}
 >
 {isLate ? (
 <Clock className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
 ) : isAlpa ? (
 <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
 ) : (
 <Info className="h-4 w-4 shrink-0 text-slate-500 mt-0.5" />
 )}
 <div>
 <span className="font-extrabold">
 {isLate ? 'Keterangan Keterlambatan: ' : isAlpa ? 'Catatan Ketidakhadiran: ' : 'Catatan Guru: '}
 </span>
 <span className="italic font-medium">"{noteText}"</span>
 </div>
 </div>
 ) : isLate ? (
 <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/60 p-2 text-xs font-semibold text-amber-800 dark:border-emerald-800/60 dark:bg-amber-950/30 dark:text-amber-300">
 <Clock className="h-3.5 w-3.5 shrink-0 text-amber-600" />
 <span className="italic">{isBoarding ? 'Santri' : 'Siswa'} tercatat terlambat saat jam pembelajaran KBM berlangsung.</span>
 </div>
 ) : null}
 </motion.div>
 )
 })}

 {filteredLogs.length === 0 && (
 <div className="py-16 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2">
 <CalendarCheck className="mx-auto h-10 w-10 text-sky-300 dark:text-sky-700" />
 <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
 Belum Ada Data Presensi
 </p>
 <p className="text-xs text-slate-400 max-w-sm mx-auto">
 {loading
 ? 'Memuat data presensi pembelajaran...'
 : 'Tidak ada rekam presensi yang sesuai dengan kriteria filter.'}
 </p>
 </div>
 )}
 </div>
 )}

 {/* TAB 2: RIWAYAT PERIZINAN & SURAT SAKIT */}
 {activeTab === 'permissions' && (
 <div className="mt-5 space-y-3.5">
 {filteredPermissions.map((item, idx) => {
 const isApproved = item.status === 'approved'
 const isRejected = item.status === 'rejected'

 return (
 <motion.div
 key={item.id || idx}
 whileHover={{ scale: 1.004 }}
 transition={{ duration: 0.15 }}
 className="rounded-xl border-2 border-emerald-200/80 bg-white p-4.5 sm:p-5 transition-all hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-xs dark:border-emerald-800/60 dark:bg-slate-800/40 dark:hover:border-emerald-700"
 >
 <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
 <div className="space-y-1 min-w-0">
 <div className="flex flex-wrap items-center gap-2">
 <span className="text-sm font-black text-slate-900 dark:text-white">
 {item.type}
 </span>
 <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
 ({formatDateShort(item.start_date)} s/d {formatDateShort(item.end_date)})
 </span>
 </div>

 <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1">
 <span className="font-bold text-slate-400">Alasan: </span>
 {item.reason}
 </p>

 {/* File Bukti Lampiran */}
 {item.attachment_path && (
 <div className="mt-2.5">
 <a
 href={`/storage/${item.attachment_path}`}
 target="_blank"
 rel="noreferrer"
 className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-800 transition-all hover:bg-sky-100 dark:border-emerald-800/60 dark:bg-sky-950 dark:text-sky-300 cursor-pointer"
 >
 <Paperclip className="h-3.5 w-3.5" />
 Lihat Dokumen / Bukti Lampiran
 <ExternalLink className="h-3 w-3 ml-0.5" />
 </a>
 </div>
 )}
 </div>

 {/* Status Chip */}
 <div className="shrink-0">
 <HeroChip
 size="sm"
 variant="flat"
 className={cn(
 'font-extrabold text-[10px] border px-2.5 py-1',
 isApproved
 ? 'bg-emerald-100 text-emerald-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60'
 : isRejected
 ? 'bg-rose-100 text-rose-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950 dark:text-rose-300 dark:border-emerald-800/60'
 : 'bg-amber-100 text-amber-900 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950 dark:text-amber-300 dark:border-emerald-800/60'
 )}
 >
 {isApproved ? (
 <>
 <CheckCircle2 className="h-3 w-3 mr-1 inline text-emerald-600" /> Disetujui
 </>
 ) : isRejected ? (
 <>
 <XCircle className="h-3 w-3 mr-1 inline text-rose-600" /> Ditolak
 </>
 ) : (
 <>
 <Clock className="h-3 w-3 mr-1 inline text-amber-600" /> Menunggu Verifikasi
 </>
 )}
 </HeroChip>
 </div>
 </div>
 </motion.div>
 )
 })}

 {filteredPermissions.length === 0 && (
 <div className="py-16 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2">
 <FileText className="mx-auto h-10 w-10 text-sky-300 dark:text-sky-700" />
 <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
 {safePermissionsHistory.length === 0
 ? 'Belum Ada Pengajuan Izin'
 : 'Tidak Ada Pengajuan Sesuai Filter'}
 </p>
 <p className="text-xs text-slate-400 max-w-sm mx-auto">
 {safePermissionsHistory.length === 0
 ? 'Orang tua dapat mengajukan surat izin atau sakit ananda melalui tombol "Ajukan Izin / Sakit" di atas.'
 : 'Silakan sesuaikan kata kunci pencarian, status, atau kategori perizinan di atas.'}
 </p>
 </div>
 )}
 </div>
 )}
 </HeroCard>

 {/* 4. HERO UI MODAL PENGAJUAN IZIN / SAKIT */}
 <AppModal
 isOpen={modalOpen}
 onClose={() => setModalOpen(false)}
 title="Pengajuan Izin / Sakit"
 description={`Sampaikan permohonan izin ketidakhadiran ${isBoarding ? 'santri' : 'siswa'} ke sekolah`}
 icon={FileText}
 maxWidth="max-w-lg"
 footer={
 <div className="flex w-full items-center justify-end gap-2.5">
 <button
 type="button"
 onClick={() => setModalOpen(false)}
 className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
 >
 Batal
 </button>
 <button
 type="submit"
 form="attendance-izin-form"
 disabled={submitting}
 className="inline-flex h-9.5 items-center justify-center gap-2 rounded-xl border-2 border-emerald-600 bg-emerald-600 px-5 text-xs font-black text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
 >
 {submitting ? (
 <>
 <Loader2 className="h-4 w-4 animate-spin" /> Mengirim...
 </>
 ) : (
 <>
 <Send className="h-4 w-4" /> Kirim Pengajuan
 </>
 )}
 </button>
 </div>
 }
 >
 {/* Form Content */}
 <form id="attendance-izin-form" onSubmit={handleSubmit} className="space-y-4">
 {/* Feedback Notification */}
 {feedback && (
 <div
 className={cn(
 'flex items-start gap-2.5 rounded-xl p-3.5 text-xs font-semibold',
 feedback.type === 'success'
 ? 'border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50 text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/80 dark:text-emerald-200'
 : 'border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 text-rose-900 dark:border-emerald-800/60 dark:bg-rose-950/80 dark:text-rose-200'
 )}
 >
 {feedback.type === 'success' ? (
 <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
 ) : (
 <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
 )}
 <span>{feedback.message}</span>
 </div>
 )}

 {/* Jenis Pengajuan */}
 <div>
 <HeroUiModalSelect
 label="Kategori / Jenis Pengajuan"
 value={type}
 onChange={(val) => setType(val)}
 options={PERMISSION_TYPES}
 placeholder="Pilih Kategori Pengajuan"
 icon={FileText}
 required
 />
 </div>

 {/* Rentang Tanggal Mulai & Selesai */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
 Tanggal Mulai
 </label>
 <DatePicker
 required
 value={startDate}
 onChange={(e) => setStartDate(e.target.value)}
 inputClassName="h-11 text-xs font-semibold"
 placeholder="Pilih tanggal mulai..."
 />
 </div>

 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
 Tanggal Selesai
 </label>
 <DatePicker
 required
 min={startDate}
 value={endDate}
 onChange={(e) => setEndDate(e.target.value)}
 inputClassName="h-11 text-xs font-semibold"
 placeholder="Pilih tanggal selesai..."
 />
 </div>
 </div>

 {/* Alasan / Keterangan */}
 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
 Alasan / Keterangan Izin
 </label>
 <HeroTextArea
 rows={3}
 required
 value={reason}
 onChange={(e) => setReason(e.target.value)}
 placeholder="Tuliskan alasan izin atau kondisi ananda secara rinci..."
 className="rounded-xl border-2 border-emerald-200/80 bg-slate-50 p-3.5 text-xs font-medium text-slate-800 focus:border-sky-500 focus:bg-white dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200"
 />
 </div>

 {/* Upload Bukti Dokumen / Surat Dokter */}
 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
 Lampiran Bukti (Surat Dokter / Foto Surat / Pendukung)
 </label>
 <div className="relative rounded-xl border-2 border-dashed border-emerald-300/80 dark:border-emerald-700 bg-emerald-50/50 p-4 text-center transition-all hover:bg-emerald-50 dark:border-emerald-800/60 dark:bg-emerald-950/20">
 <input
 type="file"
 accept=".pdf,.jpg,.jpeg,.png"
 onChange={(e) => setAttachment(e.target.files?.[0] || null)}
 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
 />
 <div className="flex flex-col items-center justify-center gap-1.5 text-xs">
 <Paperclip className="h-5 w-5 text-sky-600 dark:text-sky-400" />
 <span className="font-bold text-slate-700 dark:text-slate-300">
 {attachment ? attachment.name : 'Pilih file bukti atau seret ke sini'}
 </span>
 <span className="text-xs text-slate-400">
 Maksimal ukuran 5MB (Format PDF, PNG, JPG)
 </span>
 </div>
 </div>
 </div>
 </form>
 </AppModal>
 </div>
 )
}
