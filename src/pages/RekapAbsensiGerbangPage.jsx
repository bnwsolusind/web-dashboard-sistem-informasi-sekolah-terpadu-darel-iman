import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DatePicker } from '@/components/ui/date-picker'
import { useToast } from '../components/app/ToastProvider'
import { canSwitchEducationUnit } from '../auth/portalResolver'
import {
  AlertTriangle,
  ArrowUpDown,
  Building2,
  Calendar,
  CalendarDays,
  Camera,
  ChartPie as ChartPieIcon,
  CheckCircle2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Eye,
  Filter,
  Layers,
  Lock,
  LogIn,
  LogOut,
  Printer,
  QrCode,
  Radio,
  RefreshCcw,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  UserCheck,
  Users,
  UserX,
  Volume2,
  VolumeX,
  Wifi,
  X,
  XCircle,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { gateAttendanceService } from '../services/gateAttendanceService'
import { educationUnitService } from '../services/educationUnitService'
import { studentService } from '../services/studentService'
import { useAuthStore } from '../stores/authStore'
import { Navigate } from 'react-router-dom'
import { getUserRoleLevel, ROLE_LEVELS, isRestrictedToTeacherWorkspace } from '../auth/portalResolver'
import { cn } from '../lib/utils'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppBadge from '../components/app/AppBadge'
import AppSkeleton from '../components/app/AppSkeleton'
import AppEmptyState from '../components/app/AppEmptyState'
import AppErrorState from '../components/app/AppErrorState'
import {
  SquircleActionButton,
  MasterActionButton,
  MasterActionIconButton,
  PrintOptionModal,
} from '../components/master-data'
import { Pagination } from '@/components/ui/pagination'
import { TableBody, TableCell, TableHead, TableHeader, TableRoot, TableRow } from '@/components/ui/table'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Dialog, DialogBody, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Backdrop, OverlayWrapper } from '@/components/ui/dialog'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'


const MODAL_PAGE_SIZE = 6
const today = () => new Date().toISOString().slice(0, 10)
const formatAngka = (value) => new Intl.NumberFormat('id-ID').format(Number(value || 0))

const warnaStatus = {
  hadir: '#12a968',
  terlambat: '#8b5cf6',
  izin: '#3182f6',
  sakit: '#ff8a1f',
  alpa: '#ff4668',
  pulang: '#0284c7',
}

// ── MODERN CARD TONES (§C HeroUI_Pengaturan_Halaman — baku global) ──
const toneStyles = {
  emerald: {
    card: 'border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/30',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    title: 'text-emerald-700 dark:text-emerald-400',
    val: 'text-emerald-700 dark:text-emerald-300',
    sub: 'text-emerald-600/80 dark:text-emerald-400/80',
    cta: 'text-emerald-600/60 dark:text-emerald-500/60',
    glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
  },
  violet: {
    card: 'border-purple-300/70 bg-gradient-to-br from-purple-50 via-indigo-50/60 to-white hover:border-purple-400 dark:border-purple-700/50 dark:from-purple-950/40 dark:via-indigo-950/20 dark:to-slate-900',
    iconBg: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-sm shadow-purple-500/30',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
    title: 'text-purple-700 dark:text-purple-400',
    val: 'text-purple-700 dark:text-purple-300',
    sub: 'text-purple-600/80 dark:text-purple-400/80',
    cta: 'text-purple-600/60 dark:text-purple-500/60',
    glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
  },
  sky: {
    card: 'border-blue-300/70 bg-gradient-to-br from-blue-50 via-cyan-50/60 to-white hover:border-blue-400 dark:border-blue-700/50 dark:from-blue-950/40 dark:via-cyan-950/20 dark:to-slate-900',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-sm shadow-blue-500/30',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
    title: 'text-blue-700 dark:text-blue-400',
    val: 'text-blue-700 dark:text-blue-300',
    sub: 'text-blue-600/80 dark:text-blue-400/80',
    cta: 'text-blue-600/60 dark:text-blue-500/60',
    glow: 'bg-blue-400/20 group-hover:bg-blue-400/30',
  },
  amber: {
    card: 'border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm shadow-amber-500/30',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    title: 'text-amber-700 dark:text-amber-400',
    val: 'text-amber-700 dark:text-amber-300',
    sub: 'text-amber-600/80 dark:text-amber-400/80',
    cta: 'text-amber-600/60 dark:text-amber-500/60',
    glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
  },
  rose: {
    card: 'border-rose-300/70 bg-gradient-to-br from-rose-50 via-pink-50/60 to-white hover:border-rose-400 dark:border-rose-700/50 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-slate-900',
    iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-sm shadow-rose-500/30',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
    title: 'text-rose-700 dark:text-rose-400',
    val: 'text-rose-700 dark:text-rose-300',
    sub: 'text-rose-600/80 dark:text-rose-400/80',
    cta: 'text-rose-600/60 dark:text-rose-500/60',
    glow: 'bg-rose-400/20 group-hover:bg-rose-400/30',
  },
}

const getPeriodDateRange = (periodKey) => {
  const now = new Date()
  const iso = (d) => d.toISOString().slice(0, 10)
  const todayStr = iso(now)

  if (periodKey === 'hari') {
    return { from: todayStr, to: todayStr }
  }
  if (periodKey === 'minggu') {
    const past = new Date(now)
    past.setDate(now.getDate() - 6)
    return { from: iso(past), to: todayStr }
  }
  if (periodKey === 'bulan') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    return { from: iso(firstDay), to: todayStr }
  }
  if (periodKey === 'semester') {
    const past = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    return { from: iso(past), to: todayStr }
  }
  if (periodKey === 'tahun') {
    const firstDay = new Date(now.getFullYear(), 0, 1)
    return { from: iso(firstDay), to: todayStr }
  }
  return { from: '', to: '' }
}

const getAttendanceBadgeVariant = (status) => {
  const s = String(status || '').toUpperCase().trim()
  if (['HADIR', 'TEPAT_WAKTU', 'HADIR_DALAM_TOLERANSI'].includes(s)) return 'success'
  if (['TERLAMBAT'].includes(s)) return 'warning'
  if (['IZIN', 'SAKIT'].includes(s)) return 'info'
  if (['PULANG', 'SUDAH_PULANG'].includes(s)) return 'info'
  if (['ALPHA', 'ALPA'].includes(s)) return 'danger'
  return 'secondary'
}

function HeroUiFilterSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Pilih...',
  disabled = false,
  searchable = false,
  widthClass = 'min-w-[150px]',
  icon: Icon = null,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [openUpwards, setOpenUpwards] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = () => {
    if (disabled) return
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      // Bila ruang di bawah < 240px dan ruang di atas lebih leluasa, buka ke atas
      setOpenUpwards(spaceBelow < 240 && spaceAbove > spaceBelow)
      setSearch('')
    }
    setIsOpen((prev) => !prev)
  }

  const selectedOption = options.find((opt) => String(opt.value) === String(value))
  const filteredOptions = searchable || options.length > 5
    ? options.filter((opt) => String(opt.label).toLowerCase().includes(search.toLowerCase()))
    : options

  const hasValue = value !== '' && value !== 'semua' && value !== undefined && value !== null

  return (
    <div ref={containerRef} className={`relative ${isOpen ? 'z-[60]' : 'z-10'} ${widthClass}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs font-semibold shadow-xs transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
          isOpen
            ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 dark:border-emerald-400 dark:bg-slate-800 dark:ring-emerald-400/20 text-slate-900 dark:text-white'
            : hasValue
            ? 'border-emerald-500/80 bg-emerald-50/80 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200 font-bold'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-emerald-400'
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          {Icon && (
            <Icon
              className={`size-3.5 shrink-0 transition-colors ${
                hasValue ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
              }`}
            />
          )}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </span>
        <ChevronDown
          className={`size-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: openUpwards ? 6 : -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: openUpwards ? 6 : -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute left-0 ${
              openUpwards ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
            } z-[100] w-full min-w-[210px] overflow-hidden rounded-xl border-2 border-emerald-500/30 bg-white/95 dark:bg-[#182232]/95 backdrop-blur-md p-1.5 shadow-2xl shadow-emerald-950/20 dark:border-emerald-700/60 dark:shadow-black/60`}
          >
            {(searchable || options.length > 5) && (
              <div className="mb-1.5 px-1 pt-1 border-b border-slate-100 dark:border-slate-700/60 pb-1.5">
                <div className="relative">
                  <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari..."
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 pl-8 pr-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    autoFocus
                  />
                </div>
              </div>
            )}
            <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5">
              {filteredOptions.length === 0 ? (
                <div className="py-3 text-center text-xs text-slate-400 font-medium">Tidak ada pilihan</div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = String(opt.value) === String(value)
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => {
                        onChange(opt.value)
                        setIsOpen(false)
                        setSearch('')
                      }}
                      className={`flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-800 font-bold dark:bg-emerald-950/70 dark:text-emerald-300'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60 font-medium'
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && <Check className="size-3.5 text-emerald-600 shrink-0" />}
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

export default function RekapAbsensiGerbangPage() {
  const { user } = useAuthStore()

  const authLevel = useMemo(() => getUserRoleLevel(user), [user])
  const userRoles = useMemo(() => {
    const raw = user?.roles || user?.role || []
    const list = Array.isArray(raw) ? raw : [raw]
    return list.map((r) => (typeof r === 'string' ? r : r?.name || r?.role_name || r?.nama || ''))
  }, [user])
  const isGuru = useMemo(
    () => isRestrictedToTeacherWorkspace(user, '/dashboard/rekap-absensi-gerbang'),
    [user]
  )

  if (isGuru) {
    return <Navigate to="/portal-guru/workspace" replace />
  }

  const userUnitId = user?.unit_id || user?.education_unit_id || user?.employee?.unit_id || user?.metadata?.education_unit_id || user?.metadata?.unit_id || ''
  const isMultiUnitUser = useMemo(() => canSwitchEducationUnit(user), [user])

  const [date, setDate] = useState(today())
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Multi-unit state
  const [units, setUnits] = useState([])
  const [selectedUnit, setSelectedUnit] = useState(userUnitId || '')

  // State filter Periode Waktu (Hari, Minggu, Bulan, Semester, Tahun)
  const [period, setPeriod] = useState('hari')
  const [dateFrom, setDateFrom] = useState(today())
  const [dateTo, setDateTo] = useState(today())

  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [sortField, setSortField] = useState('check_in_time')
  const [sortDirection, setSortDirection] = useState('asc')

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [selectedDetailStudent, setSelectedDetailStudent] = useState(null)

  const unitOptions = useMemo(() => [
    { value: '', label: 'Semua Unit Pendidikan' },
    ...units.map((u) => ({ value: String(u.id), label: u.nama || u.name }))
  ], [units])

  const periodOptions = useMemo(() => [
    { value: 'semua', label: 'Semua Periode Data' },
    { value: 'hari', label: 'Hari Ini (Per Hari)' },
    { value: 'minggu', label: '7 Hari Terakhir (Per Minggu)' },
    { value: 'bulan', label: 'Bulan Ini (Per Bulan)' },
    { value: 'semester', label: '6 Bulan Terakhir (Per Semester)' },
    { value: 'tahun', label: 'Tahun Ini (Per Tahun)' },
    { value: 'custom', label: 'Rentang Tanggal Kustom' },
  ], [])

  const statusOptions = useMemo(() => [
    { value: '', label: 'Semua Status' },
    { value: 'HADIR', label: 'Hadir / Tepat Waktu' },
    { value: 'TERLAMBAT', label: 'Terlambat' },
    { value: 'IZIN', label: 'Izin' },
    { value: 'SAKIT', label: 'Sakit' },
    { value: 'ALPHA', label: 'Alpha / Belum Scan' },
  ], [])

  const perPageOptions = useMemo(() => [
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 15, label: '15' },
    { value: 25, label: '25' },
    { value: 50, label: '50' },
    { value: 100, label: '100' },
  ], [])

  // Card Modal State for Summary Cards click
  const [cardModal, setCardModal] = useState({
    isOpen: false,
    statusKey: 'semua',
    title: '',
    tone: 'emerald',
    searchQuery: '',
    page: 1,
  })

  // ── INTEGRATED SCANNER STATE ───────────────────────────────────────────────
  const [showScannerPanel, setShowScannerPanel] = useState(true)
  const [scanMode, setScanMode] = useState('checkin') // 'checkin' | 'checkout'
  const [scanMethod, setScanMethod] = useState('QRCODE') // 'QRCODE' | 'RFID' | 'MANUAL'
  const [cardInput, setCardInput] = useState('')
  const [modalCardInput, setModalCardInput] = useState('')
  const [processingScan, setProcessingScan] = useState(false)
  const [lastScanResult, setLastScanResult] = useState(null)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Webcam Scanner State & Refs
  const [showCameraModal, setShowCameraModal] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const scanTimerRef = useRef(null)
  const isScanningBusyRef = useRef(false)
  const lastScannedCodeRef = useRef('')

  // Manual TU Student Search State
  const [studentSearch, setStudentSearch] = useState('')
  const [studentsList, setStudentsList] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(false)

  // Gate Schedule Configuration State
  const [scheduleConfig, setScheduleConfig] = useState({
    jam_masuk: '07:15',
    toleransi_menit: 15,
    jam_pulang: '15:30',
    jam_cutoff_alpha: '08:00',
  })
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [savingSchedule, setSavingSchedule] = useState(false)
  const [allUnitsSchedules, setAllUnitsSchedules] = useState([])
  const [targetUnitForConfig, setTargetUnitForConfig] = useState('')

  // Global Toast Helper
  const toast = useToast()
  const pushToast = useCallback((type, title, message) => {
    const tone = type === 'error' || type === 'danger' ? 'error' : type === 'warning' ? 'warning' : 'success'
    toast(message ? `${title}: ${message}` : title, tone)
  }, [toast])

  const dismissToast = useCallback(() => {}, [])

  // Web Audio Synthetic Beep
  const playBeep = useCallback((isSuccess = true) => {
    if (!soundEnabled) return
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = isSuccess ? 'sine' : 'sawtooth'
      osc.frequency.setValueAtTime(isSuccess ? 880 : 330, ctx.currentTime)
      gain.gain.setValueAtTime(0.18, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.15)
    } catch {
      // Audio context restricted until user gesture, safely ignore
    }
  }, [soundEnabled])

  // Load backend data from gateAttendanceService
  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const [logs, summary] = await Promise.all([
        gateAttendanceService.getLogs({
          unit_id: selectedUnit || undefined,
          date: dateFrom || date,
          date_from: dateFrom,
          date_to: dateTo,
          status,
          search,
          per_page: 500
        }),
        gateAttendanceService.getStats({
          unit_id: selectedUnit || undefined,
          date: dateFrom || date,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
        }),
      ])
      const fetchedRows = logs.data?.data?.data || logs.data?.data || []
      setRows(Array.isArray(fetchedRows) ? fetchedRows : [])
      setStats(summary.data?.data || {})
    } catch (err) {
      setError(err.response?.data?.message || 'Rekap absensi gerbang gagal dimuat.')
      setRows([])
      setStats({})
    } finally {
      setLoading(false)
    }
  }, [date, dateFrom, dateTo, status, search, selectedUnit])

  useEffect(() => {
    load()
  }, [load])

  // Fetch education units for multi-unit selection
  const fetchUnits = useCallback(async () => {
    try {
      const res = await educationUnitService.getDaftar({ per_page: 100 })
      const data = res?.data?.data?.data || res?.data?.data || res?.data || []
      setUnits(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Failed fetching units:', e)
    }
  }, [])

  // Fetch gate schedule config
  const fetchScheduleConfig = useCallback(async () => {
    try {
      const res = await gateAttendanceService.getScheduleConfig({ unit_id: selectedUnit || undefined })
      if (res?.data?.data) {
        setScheduleConfig(res.data.data)
      }
    } catch (e) {
      console.error('Failed fetching schedule config:', e)
    }
  }, [selectedUnit])

  const fetchAllUnitsSchedules = useCallback(async () => {
    try {
      const res = await gateAttendanceService.getAllScheduleConfigs()
      if (res?.data?.data) {
        setAllUnitsSchedules(res.data.data.units || [])
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
  }, [targetUnitForConfig, selectedUnit])

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
    } catch (err) {
      pushToast('error', 'Gagal Menyimpan', err?.response?.data?.message || 'Gagal menyimpan pengaturan jadwal jam masuk/pulang.')
    } finally {
      setSavingSchedule(false)
    }
  }

  // Fetch students for manual TU input
  const fetchStudents = useCallback(async () => {
    setLoadingStudents(true)
    try {
      const res = await studentService.getDaftar({
        search: studentSearch,
        unit_id: selectedUnit || undefined,
        per_page: 15,
      })
      const list = res?.data?.data || res?.data || []
      setStudentsList(Array.isArray(list) ? list : [])
    } catch (e) {
      console.error('Failed fetching students:', e)
    } finally {
      setLoadingStudents(false)
    }
  }, [studentSearch, selectedUnit])

  useEffect(() => {
    fetchUnits()
    fetchScheduleConfig()
  }, [fetchUnits, fetchScheduleConfig])

  useEffect(() => {
    if (scanMethod === 'MANUAL') {
      fetchStudents()
    }
  }, [scanMethod, fetchStudents])

  useEffect(() => {
    if (showScheduleModal) {
      fetchAllUnitsSchedules()
    }
  }, [showScheduleModal, fetchAllUnitsSchedules])

  // Camera Management
  const stopCamera = useCallback(() => {
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
  }, [])

  const startCamera = useCallback(async () => {
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
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        })
      } catch {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' } },
          })
        } catch {
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
        } catch {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(() => {})
          }
        }
      }
      setCameraActive(true)

      // BarcodeDetector automatic scan loop
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
        msg = 'Izin kamera diblokir oleh browser atau sistem operasi. Silakan izinkan akses kamera pada browser.'
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'Perangkat webcam tidak terdeteksi pada laptop/komputer ini.'
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg = 'Kamera sedang digunakan oleh aplikasi lain.'
      } else {
        msg = `Kamera tidak dapat diakses: ${err.message || err.name || 'Periksa izin browser Anda'}`
      }
      setCameraError(msg)
      setCameraActive(false)
    } finally {
      setCameraLoading(false)
    }
  }, [stopCamera])

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

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  // Execute Attendance Scan (masuk / pulang)
  const executeScan = async (codeToScan, studentId = null) => {
    setProcessingScan(true)
    try {
      const payload = {
        ...(studentId
          ? { student_id: studentId }
          : scanMethod === 'QRCODE'
            ? { qr_token: codeToScan.trim() }
            : { card_number: codeToScan.trim() }),
        unit_id: selectedUnit || undefined,
        attendance_method: scanMethod,
      }

      let res
      if (scanMode === 'checkin') {
        res = await gateAttendanceService.scanCheckIn(payload)
      } else {
        res = await gateAttendanceService.scanCheckOut(payload)
      }

      const studentName = res?.data?.data?.student?.nama_lengkap || res?.data?.data?.student?.full_name || 'Siswa'
      const actionName = scanMode === 'checkin' ? 'Kedatangan' : 'Kepulangan'

      playBeep(true)
      setLastScanResult({
        success: true,
        message: res.data?.message || `Presensi ${actionName} Berhasil!`,
        data: res.data?.data,
        timestamp: new Date().toLocaleTimeString('id-ID'),
      })
      pushToast('success', `Presensi ${actionName} Berhasil!`, `${studentName} telah tercatat melakukan absensi gerbang.`)

      setCardInput('')
      setModalCardInput('')
      // Immediately refresh table and stats!
      load()
      if (scanMethod === 'MANUAL') {
        fetchStudents()
      }
    } catch (err) {
      playBeep(false)
      const msg = err?.response?.data?.message || 'Gagal memproses absensi gerbang.'
      setLastScanResult({
        success: false,
        message: msg,
        data: null,
        timestamp: new Date().toLocaleTimeString('id-ID'),
      })
      pushToast('error', 'Presensi Gagal', msg)
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

  // Time filtered rows based on dateFrom and dateTo
  const timeFilteredRows = useMemo(() => {
    let list = rows
    if (dateFrom) {
      list = list.filter((r) => !r.date && !r.tanggal && !r.created_at ? true : (r.date || r.tanggal || r.created_at?.slice(0, 10)) >= dateFrom)
    }
    if (dateTo) {
      list = list.filter((r) => !r.date && !r.tanggal && !r.created_at ? true : (r.date || r.tanggal || r.created_at?.slice(0, 10)) <= dateTo)
    }
    return list
  }, [rows, dateFrom, dateTo])

  // Summary Metrics Computation
  // Summary Metrics Computation (100% konsisten antara Datatable, Cards, & Donut Chart)
  const metrics = useMemo(() => {
    const rowCount = timeFilteredRows.length

    // Normalisasi status dari baris riil
    const rowHadir = timeFilteredRows.filter((r) => {
      const s = String(r.status || '').toUpperCase()
      return s === 'HADIR' || s === 'TEPAT_WAKTU' || s === 'HADIR_DALAM_TOLERANSI'
    }).length
    const rowTerlambat = timeFilteredRows.filter((r) => String(r.status || '').toUpperCase() === 'TERLAMBAT').length
    const rowIzinSakit = timeFilteredRows.filter((r) => ['IZIN', 'SAKIT'].includes(String(r.status || '').toUpperCase())).length
    const rowSudahPulang = timeFilteredRows.filter((r) => Boolean(r.check_out_time) || String(r.status || '').toUpperCase() === 'PULANG').length
    const rowAlpha = timeFilteredRows.filter((r) => ['ALPHA', 'ALPA'].includes(String(r.status || '').toUpperCase())).length
    const rowLainnya = timeFilteredRows.filter((r) => {
      const s = String(r.status || '').toUpperCase()
      return !['HADIR', 'TEPAT_WAKTU', 'HADIR_DALAM_TOLERANSI', 'TERLAMBAT', 'IZIN', 'SAKIT', 'ALPHA', 'ALPA'].includes(s)
    }).length

    // Gunakan baris riil jika ada, atau data teragregasi backend jika logs tabel belum dimuat
    const hasLogRows = rowCount > 0
    const totalScanned = hasLogRows ? rowCount : (stats.total_scanned || 0)

    const tepatWaktu = hasLogRows ? rowHadir : (stats.hadir ?? stats.tepat_waktu ?? 0)
    const terlambat = hasLogRows ? rowTerlambat : (stats.terlambat ?? 0)
    const izinSakit = hasLogRows ? rowIzinSakit : ((stats.izin ?? 0) + (stats.sakit ?? 0))
    const sudahPulang = hasLogRows ? rowSudahPulang : (stats.sudah_pulang ?? 0)
    const alpa = hasLogRows ? rowAlpha : (stats.alpha ?? stats.alpa ?? 0)
    const lainnya = hasLogRows ? rowLainnya : Math.max(0, totalScanned - (tepatWaktu + terlambat + izinSakit + alpa))

    // Total data absensi gerbang aktual (penyebut distribusi status gerbang):
    // PENTING: Total data absensi gerbang dihitung HANYA dari total catatan absensi gerbang riil (totalScanned).
    // DILARANG menggunakan total_siswa sebagai total absensi gerbang saat tidak ada data!
    const totalData = totalScanned
    const hasData = totalData > 0
    const totalSiswaPopulasi = stats.total_siswa || 0

    return {
      totalData,
      hasData,
      totalSiswa: totalSiswaPopulasi,
      totalScanned,
      tepatWaktu,
      terlambat,
      izinSakit,
      sudahPulang,
      alpa,
      lainnya,
    }
  }, [stats, timeFilteredRows])

  const cards = useMemo(
    () => [
      {
        label: 'Hadir / Tepat Waktu',
        statusKey: 'HADIR',
        value: metrics.tepatWaktu,
        icon: UserCheck,
        tone: 'emerald',
        percent: metrics.hasData && metrics.totalData > 0 ? (metrics.tepatWaktu / metrics.totalData) * 100 : null,
      },
      {
        label: 'Terlambat',
        statusKey: 'TERLAMBAT',
        value: metrics.terlambat,
        icon: Clock,
        tone: 'violet',
        percent: metrics.hasData && metrics.totalData > 0 ? (metrics.terlambat / metrics.totalData) * 100 : null,
      },
      {
        label: 'Izin / Sakit',
        statusKey: 'IZIN',
        value: metrics.izinSakit,
        icon: ClipboardCheck,
        tone: 'sky',
        percent: metrics.hasData && metrics.totalData > 0 ? (metrics.izinSakit / metrics.totalData) * 100 : null,
      },
      {
        label: 'Sudah Pulang',
        statusKey: 'PULANG',
        value: metrics.sudahPulang,
        icon: User,
        tone: 'amber',
        percent: metrics.hasData && metrics.totalData > 0 ? (metrics.sudahPulang / metrics.totalData) * 100 : null,
      },
      {
        label: 'Alpha / Belum Scan',
        statusKey: 'ALPHA',
        value: metrics.alpa,
        icon: UserX,
        tone: 'rose',
        percent: metrics.hasData && metrics.totalData > 0 ? (metrics.alpa / metrics.totalData) * 100 : null,
      },
    ],
    [metrics]
  )

  const distribution = useMemo(
    () => {
      const items = [
        { name: 'Hadir', value: metrics.tepatWaktu, color: warnaStatus.hadir },
        { name: 'Terlambat', value: metrics.terlambat, color: warnaStatus.terlambat },
        { name: 'Izin/Sakit', value: metrics.izinSakit, color: warnaStatus.izin },
        { name: 'Alpha', value: metrics.alpa, color: warnaStatus.alpa },
      ]
      if (metrics.lainnya > 0) {
        items.push({ name: 'Lainnya', value: metrics.lainnya, color: '#94a3b8' })
      }
      return items
    },
    [metrics]
  )

  const activeDistribution = useMemo(
    () => distribution.filter((item) => item.value > 0),
    [distribution]
  )

  const chartData = useMemo(() => {
    // Generate hourly breakdown from rows
    const hourMap = new Map()
    timeFilteredRows.forEach((r) => {
      const time = r.check_in_time || '07:00'
      const hourStr = time.slice(0, 2) + ':00'
      if (!hourMap.has(hourStr)) {
        hourMap.set(hourStr, { label: hourStr, tepat: 0, terlambat: 0 })
      }
      const item = hourMap.get(hourStr)
      const st = String(r.status || '').toUpperCase()
      if (st === 'TERLAMBAT') item.terlambat += 1
      else item.tepat += 1
    })

    return Array.from(hourMap.values()).sort((a, b) => a.label.localeCompare(b.label))
  }, [timeFilteredRows])

  // Filtered and sorted rows
  const filteredRows = useMemo(() => {
    return timeFilteredRows.filter((r) => {
      const q = search.toLowerCase().trim()
      const studentName = (r.student?.nama_lengkap || r.student?.full_name || '').toLowerCase()
      const nis = (r.student?.nis || r.student?.nisn || '').toLowerCase()
      const kelas = (r.school_class?.name || r.school_class?.nama_kelas || '').toLowerCase()
      const unit = (r.education_unit?.name || '').toLowerCase()

      const matchesSearch = !q || studentName.includes(q) || nis.includes(q) || kelas.includes(q) || unit.includes(q)
      const matchesStatus = !status || String(r.status || '').toUpperCase() === status.toUpperCase()

      return matchesSearch && matchesStatus
    })
  }, [timeFilteredRows, search, status])

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      let aVal = a[sortField] || ''
      let bVal = b[sortField] || ''

      if (sortField === 'student') {
        aVal = a.student?.nama_lengkap || a.student?.full_name || ''
        bVal = b.student?.nama_lengkap || b.student?.full_name || ''
      }

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = (bVal || '').toLowerCase()
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredRows, sortField, sortDirection])

  const totalPages = Math.ceil(sortedRows.length / perPage) || 1
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return sortedRows.slice(start, start + perPage)
  }, [sortedRows, currentPage, perPage])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const resetFilters = () => {
    setDate(today())
    setPeriod('hari')
    setDateFrom(today())
    setDateTo(today())
    setStatus('')
    setSearch('')
    setCurrentPage(1)
  }

  // Card Modal Handlers
  const openCardModal = (statusKey, label, tone) => {
    setCardModal({
      isOpen: true,
      statusKey,
      title: `Data Siswa Status ${label}`,
      tone,
      searchQuery: '',
      page: 1,
    })
  }

  const closeCardModal = () => {
    setCardModal((prev) => ({ ...prev, isOpen: false }))
  }

  const modalRows = useMemo(() => {
    if (!cardModal.isOpen) return []
    let list = timeFilteredRows
    if (cardModal.statusKey === 'PULANG') {
      list = list.filter((r) => Boolean(r.check_out_time) || String(r.status || '').toUpperCase() === 'PULANG')
    } else if (cardModal.statusKey === 'HADIR') {
      list = list.filter((r) => {
        const s = String(r.status || '').toUpperCase()
        return s === 'HADIR' || s === 'TEPAT_WAKTU' || s === 'HADIR_DALAM_TOLERANSI'
      })
    } else if (cardModal.statusKey === 'IZIN') {
      list = list.filter((r) => {
        const s = String(r.status || '').toUpperCase()
        return s === 'IZIN' || s === 'SAKIT'
      })
    } else if (cardModal.statusKey === 'ALPHA') {
      list = list.filter((r) => {
        const s = String(r.status || '').toUpperCase()
        return s === 'ALPHA' || s === 'ALPA'
      })
    } else if (cardModal.statusKey === 'LAINNYA') {
      list = list.filter((r) => {
        const s = String(r.status || '').toUpperCase()
        return !['HADIR', 'TEPAT_WAKTU', 'HADIR_DALAM_TOLERANSI', 'TERLAMBAT', 'IZIN', 'SAKIT', 'ALPHA', 'ALPA'].includes(s)
      })
    } else if (cardModal.statusKey && cardModal.statusKey !== 'semua') {
      list = list.filter((r) => String(r.status || '').toUpperCase() === cardModal.statusKey.toUpperCase())
    }
    if (cardModal.searchQuery.trim()) {
      const q = cardModal.searchQuery.toLowerCase().trim()
      list = list.filter((r) => {
        const name = (r.student?.nama_lengkap || r.student?.full_name || '').toLowerCase()
        const nis = (r.student?.nis || r.student?.nisn || '').toLowerCase()
        const kelas = (r.school_class?.name || r.school_class?.nama_kelas || '').toLowerCase()
        return name.includes(q) || nis.includes(q) || kelas.includes(q)
      })
    }
    return list
  }, [timeFilteredRows, cardModal.isOpen, cardModal.statusKey, cardModal.searchQuery])

  const modalTotalPages = Math.max(1, Math.ceil(modalRows.length / MODAL_PAGE_SIZE))
  const paginatedModalRows = useMemo(() => {
    return modalRows.slice((cardModal.page - 1) * MODAL_PAGE_SIZE, cardModal.page * MODAL_PAGE_SIZE)
  }, [modalRows, cardModal.page])

  // Export Handlers
  const handleExportCSV = () => {
    const filename = `rekap-absensi-gerbang_${dateFrom || date}.csv`
    const csvHeader = ['#', 'Nama Siswa', 'NIS/NISN', 'Unit Pendidikan', 'Kelas', 'Jam Masuk', 'Jam Pulang', 'Metode', 'Status']
    const csvRows = sortedRows.map((r, i) => [
      i + 1,
      r.student?.nama_lengkap || r.student?.full_name || '-',
      r.student?.nis || r.student?.nisn || '-',
      r.education_unit?.name || '-',
      r.school_class?.name || r.school_class?.nama_kelas || '-',
      r.check_in_time || '-',
      r.check_out_time || '-',
      r.attendance_method || '-',
      r.status || '-',
    ])

    const csvContent = [csvHeader, ...csvRows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const handlePrintClean = () => {
    setIsPrintModalOpen(false)
    printCleanTable({
      title: 'Rekap Absensi Gerbang Siswa',
      subtitle: `Periode Tanggal: ${dateFrom || date} s/d ${dateTo || date} — Total Record: ${sortedRows.length} Data`,
      headers: ['#', 'Nama Siswa', 'NIS/NISN', 'Unit', 'Kelas', 'Jam Masuk', 'Jam Pulang', 'Metode', 'Status'],
      rows: sortedRows.map((r, i) => [
        i + 1,
        r.student?.nama_lengkap || r.student?.full_name || '-',
        r.student?.nis || r.student?.nisn || '-',
        r.education_unit?.name || '-',
        r.school_class?.name || r.school_class?.nama_kelas || '-',
        r.check_in_time || '-',
        r.check_out_time || '-',
        r.attendance_method || '-',
        r.status || '-',
      ]),
    })
  }

  const handleDownloadPDF = () => {
    setIsPrintModalOpen(false)
    downloadPdfTable({
      title: 'Rekap Absensi Gerbang Siswa',
      subtitle: `Periode Tanggal: ${dateFrom || date} s/d ${dateTo || date}`,
      headers: ['#', 'Nama Siswa', 'NIS/NISN', 'Unit', 'Kelas', 'Jam Masuk', 'Jam Pulang', 'Metode', 'Status'],
      rows: sortedRows.map((r, i) => [
        i + 1,
        r.student?.nama_lengkap || r.student?.full_name || '-',
        r.student?.nis || r.student?.nisn || '-',
        r.education_unit?.name || '-',
        r.school_class?.name || r.school_class?.nama_kelas || '-',
        r.check_in_time || '-',
        r.check_out_time || '-',
        r.attendance_method || '-',
        r.status || '-',
      ]),
      filename: `Rekap_Absensi_Gerbang_${dateFrom || date}.pdf`,
    })
  }

  // Stagger Animasi Halaman (§R)
  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  }

  return (
    <PageContainer className="space-y-6 pb-12">
      {/* Navigation Breadcrumb */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="mb-2 print:hidden">
        <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Rekap Absensi Gerbang' }]} />
      </motion.div>

      {/* MODERN HERO CARD HEADER (§B / §7.7 Vivid Emerald Responsive Hero) */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <div className="relative z-20 rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-4 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden">
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[22px]">
            <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />
          </div>

          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
              <div className="flex size-11 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <Clock className="size-5 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-0.5 sm:px-3.5 sm:py-1 text-[11px] sm:text-xs font-extrabold text-white shadow-md shadow-emerald-600/25 border border-emerald-300/40">
                    <Sparkles className="size-3 sm:size-3.5 text-amber-300 animate-pulse" />
                    Rekap & Scanner Gerbang
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    <Clock className="size-3.5 text-emerald-600" /> Masuk: {scheduleConfig.jam_masuk} (Tol: {scheduleConfig.toleransi_menit}m) | Pulang: {scheduleConfig.jam_pulang}
                  </span>
                </div>
                <h1 className="mt-1.5 text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Rekapitulasi & Scanner Presensi Gerbang
                </h1>
                <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 w-full leading-relaxed">
                  Terminal pemindaian langsung (RFID / Barcode / QR Code) serta rekapitulasi data kehadiran dan kepulangan siswa secara real-time.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start lg:self-center flex-wrap">
              {/* Multi-Unit Selector (bila role multi-unit) */}
              {isMultiUnitUser && units.length > 0 && (
                <HeroUiFilterSelect
                  value={selectedUnit}
                  onChange={(val) => setSelectedUnit(val)}
                  options={unitOptions}
                  placeholder="Semua Unit Pendidikan"
                  icon={Building2}
                  widthClass="min-w-[210px]"
                />
              )}

              {/* Schedule Config Button */}
              <button
                type="button"
                onClick={() => setShowScheduleModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300/80 dark:border-emerald-700 bg-white/80 dark:bg-emerald-950/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/60 px-3 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-200 shadow-xs transition-colors cursor-pointer"
                title="Pengaturan jam masuk dan pulang per unit"
              >
                <Settings className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Jadwal Gerbang</span>
              </button>

              {/* Toggle Scanner Terminal Button */}
              <button
                type="button"
                onClick={() => setShowScannerPanel(!showScannerPanel)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer ${
                  showScannerPanel
                    ? 'border-emerald-500 bg-emerald-600 text-white shadow-emerald-600/30 hover:bg-emerald-700'
                    : 'border-emerald-300 dark:border-emerald-700 bg-white/90 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50'
                }`}
              >
                <QrCode className="size-3.5" />
                <span>{showScannerPanel ? 'Tutup Scanner' : 'Buka Scanner Gerbang'}</span>
                {showScannerPanel && <span className="size-2 rounded-full bg-emerald-300 animate-pulse ml-0.5" />}
              </button>

              {/* Refresh Data Button */}
              <button
                type="button"
                onClick={load}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white/80 dark:bg-emerald-950/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/60 px-3.5 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-200 shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                <RefreshCcw className={`h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Memuat...' : 'Segarkan Data'}</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── TERMINAL PEMINDAI GERBANG (INTEGRATED SCANNER TERMINAL) ──────────── */}
      <AnimatePresence>
        {showScannerPanel && (
          <motion.section
            id="terminal-scanner-gerbang"
            initial={{ opacity: 0, height: 0, scale: 0.98 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="overflow-hidden print:hidden"
          >
            <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433]">
              {/* Ambient Glow */}
              <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-emerald-400/15 blur-3xl dark:bg-emerald-400/20" />
              <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-teal-400/10 blur-3xl dark:bg-teal-400/15" />

              <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Main Terminal Controls (7 cols) */}
                <div className="space-y-5 lg:col-span-7">
                  {/* Terminal Header */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-emerald-200/90 dark:border-emerald-800/60">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-sm border border-emerald-300/40">
                        <QrCode className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                            Terminal Pemindai Absensi Gerbang
                          </h3>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/60">
                            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                            Live
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                          Scan kartu RFID, Barcode/QR Code, atau input manual siswa di gerbang.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        title={soundEnabled ? 'Suara aktif (klik untuk membisukan)' : 'Suara dibisukan (klik untuk mengaktifkan)'}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                          soundEnabled
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'border-slate-300 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {soundEnabled ? <Volume2 className="size-3.5 text-emerald-600" /> : <VolumeX className="size-3.5" />}
                        <span className="hidden sm:inline">{soundEnabled ? 'Audio Aktif' : 'Mute'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Scan Mode Switcher (MASUK / PULANG) */}
                  <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800" role="tablist" aria-label="Mode presensi gerbang">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={scanMode === 'checkin'}
                      onClick={() => setScanMode('checkin')}
                      className={`relative flex items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 z-10 cursor-pointer ${
                        scanMode === 'checkin'
                          ? 'text-white'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                      }`}
                    >
                      {scanMode === 'checkin' && (
                        <motion.div
                          layoutId="activeGateScanModeBg"
                          className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 shadow-md shadow-emerald-600/30 -z-10"
                          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                        />
                      )}
                      <LogIn className="size-4" /> PRESENSI KEDATANGAN
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={scanMode === 'checkout'}
                      onClick={() => setScanMode('checkout')}
                      className={`relative flex items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 z-10 cursor-pointer ${
                        scanMode === 'checkout'
                          ? 'text-white'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                      }`}
                    >
                      {scanMode === 'checkout' && (
                        <motion.div
                          layoutId="activeGateScanModeBg"
                          className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 shadow-md shadow-indigo-600/30 -z-10"
                          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                        />
                      )}
                      <LogOut className="size-4" /> PRESENSI PULANG
                    </button>
                  </div>

                  {/* Method Selector */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                      Metode Pemindaian
                    </label>
                    <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Metode pemindaian">
                      <button
                        type="button"
                        role="tab"
                        aria-selected={scanMethod === 'QRCODE'}
                        onClick={() => setScanMethod('QRCODE')}
                        className={`flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl border p-2.5 sm:p-3 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 cursor-pointer ${
                          scanMethod === 'QRCODE'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <QrCode className="size-4 text-emerald-600 dark:text-emerald-400" />
                        <span>QR Code / USB</span>
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={scanMethod === 'RFID'}
                        onClick={() => setScanMethod('RFID')}
                        className={`flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl border p-2.5 sm:p-3 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 cursor-pointer ${
                          scanMethod === 'RFID'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <Radio className="size-4 text-sky-500" />
                        <span>RFID Tap</span>
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={scanMethod === 'MANUAL'}
                        onClick={() => setScanMethod('MANUAL')}
                        className={`flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl border p-2.5 sm:p-3 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 cursor-pointer ${
                          scanMethod === 'MANUAL'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <UserCheck className="size-4 text-amber-500" />
                        <span>Input Petugas TU</span>
                      </button>
                    </div>
                  </div>

                  {/* Dynamic View: QRCODE Method */}
                  {scanMethod === 'QRCODE' && (
                    <div className="space-y-4">
                      <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-emerald-950/50 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <motion.div
                          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_8px_rgba(16,185,129,0.8)] pointer-events-none"
                          animate={{ top: ['0%', '100%', '0%'] }}
                          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                        />
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-sm border border-emerald-300/40">
                            <QrCode className="size-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                              Mode Pemindai QR Code Kartu
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              Gunakan barcode scanner USB fisik atau buka kamera live web.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={openCameraModal}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white px-4 py-2.5 text-xs font-extrabold border border-emerald-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap shrink-0 shadow-sm"
                        >
                          <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                            <Camera className="size-3.5 text-white" strokeWidth={2.2} />
                          </div>
                          <span>Buka Kamera Pemindai</span>
                        </button>
                      </div>

                      <form onSubmit={handleScanSubmit} className="space-y-2">
                        <label htmlFor="gate-qr-input" className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                          Input Hardware Scanner USB / Barcode
                        </label>
                        <div className="relative flex items-center">
                          <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                            <QrCode className="size-4" />
                          </div>
                          <input
                            id="gate-qr-input"
                            type="text"
                            autoFocus
                            value={cardInput}
                            onChange={(e) => setCardInput(e.target.value)}
                            placeholder="Scan QR Code / Barcode kartu siswa via scanner USB..."
                            className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-28 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                          />
                          <button
                            type="submit"
                            disabled={processingScan || !cardInput.trim()}
                            className="absolute right-1.5 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 px-4 py-2 text-xs font-extrabold text-white border border-emerald-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                          >
                            {processingScan ? (
                              <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : null}
                            <span>{processingScan ? 'Proses...' : 'Proses'}</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Dynamic View: RFID Method */}
                  {scanMethod === 'RFID' && (
                    <div className="space-y-4">
                      <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-950/50 dark:bg-blue-950/30 flex items-center justify-between">
                        <motion.div
                          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_8px_rgba(59,130,246,0.8)] pointer-events-none"
                          animate={{ top: ['0%', '100%', '0%'] }}
                          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                        />
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white shadow-sm border border-sky-300/40">
                            <Wifi className="size-5 animate-pulse" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-blue-950 dark:text-blue-200">
                              Perangkat RFID Reader Terhubung
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              Tempelkan (tap) kartu RFID siswa pada alat pembaca gerbang.
                            </p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-extrabold text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700">
                          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                          Standby RFID
                        </span>
                      </div>

                      <form onSubmit={handleScanSubmit} className="space-y-2">
                        <label htmlFor="gate-rfid-input" className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                          Input Kode Kartu RFID Tap
                        </label>
                        <div className="relative flex items-center">
                          <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                            <Wifi className="size-4" />
                          </div>
                          <input
                            id="gate-rfid-input"
                            type="text"
                            autoFocus
                            value={cardInput}
                            onChange={(e) => setCardInput(e.target.value)}
                            placeholder="Tap kartu RFID pada reader atau ketik nomor kartu..."
                            className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-32 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                          />
                          <button
                            type="submit"
                            disabled={processingScan || !cardInput.trim()}
                            className="absolute right-1.5 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 px-4 py-2 text-xs font-extrabold text-white border border-sky-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                          >
                            {processingScan ? (
                              <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : null}
                            <span>{processingScan ? 'Proses...' : 'Proses RFID'}</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Dynamic View: MANUAL TU Method */}
                  {scanMethod === 'MANUAL' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Pencarian & Absensi Manual Siswa/Santri</h4>
                        <span className="text-xs text-slate-500 font-medium">Petugas TU / Operator</span>
                      </div>

                      <div className="relative flex items-center">
                        <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                          <Search className="size-4" />
                        </div>
                        <input
                          type="text"
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          placeholder="Cari berdasarkan nama siswa, NIS, atau NISN..."
                          className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                        />
                      </div>

                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {loadingStudents ? (
                          <AppSkeleton variant="list" rows={3} />
                        ) : studentsList.length === 0 ? (
                          <AppEmptyState title="Siswa tidak ditemukan" description="Coba ubah kata kunci pencarian nama, NIS, atau NISN." />
                        ) : (
                          studentsList.map((st) => (
                            <div
                              key={st.id}
                              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/60 p-3 transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/40"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                  {st.nama_lengkap || st.full_name || 'Siswa'}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  NISN: <span className="font-semibold font-mono text-slate-700 dark:text-slate-300">{st.nisn || st.nis || '-'}</span> | Kelas: {st.kelas?.nama || st.school_class?.name || '-'}
                                </p>
                              </div>
                              <button
                                type="button"
                                disabled={processingScan}
                                onClick={() => executeScan('', st.id)}
                                className={`inline-flex shrink-0 items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-extrabold text-white border transition-all duration-200 hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${
                                  scanMode === 'checkin'
                                    ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 border-emerald-300/40'
                                    : 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 border-indigo-300/40'
                                }`}
                              >
                                <div className="flex size-4 items-center justify-center rounded-lg bg-white/20 text-white">
                                  {scanMode === 'checkin' ? <LogIn className="size-3 text-white" /> : <LogOut className="size-3 text-white" />}
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

                {/* Feedback & Last Scan Status (5 cols) */}
                <div className="space-y-4 lg:col-span-5 flex flex-col justify-between">
                  <div>
                    <div className="mb-4 pb-3.5 border-b border-emerald-200/90 dark:border-emerald-800/60 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                          Status Pemindaian Terakhir
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Umpan balik langsung hasil scan saat ini
                        </p>
                      </div>
                      {lastScanResult?.timestamp && (
                        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tabular-nums">
                          {lastScanResult.timestamp}
                        </span>
                      )}
                    </div>

                    {lastScanResult ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                        className={`rounded-2xl border-2 p-4 shadow-sm ${
                          lastScanResult.success
                            ? 'border-emerald-300/80 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white dark:border-emerald-800 dark:bg-emerald-950/40'
                            : 'border-rose-300/80 bg-gradient-to-br from-rose-50 via-pink-50/50 to-white dark:border-rose-800 dark:bg-rose-950/40'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-md ${
                            lastScanResult.success
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30'
                              : 'bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/30'
                          }`}>
                            {lastScanResult.success ? (
                              <CheckCircle2 className="size-6 text-white" strokeWidth={2.3} />
                            ) : (
                              <XCircle className="size-6 text-white" strokeWidth={2.3} />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase border ${
                                lastScanResult.success
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-300'
                                  : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/60 dark:text-rose-300'
                              }`}>
                                {lastScanResult.success ? 'Berhasil Terverifikasi' : 'Pindai Ditolak'}
                              </span>
                            </div>
                            <p className={`mt-1 text-sm font-black ${
                              lastScanResult.success ? 'text-emerald-950 dark:text-emerald-200' : 'text-rose-950 dark:text-rose-200'
                            }`}>
                              {lastScanResult.message}
                            </p>
                            {lastScanResult.data?.student && (
                              <div className="mt-2.5 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/60 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                                <p>
                                  <span className="text-slate-400">Nama Siswa:</span> <span className="font-bold text-slate-900 dark:text-white">{lastScanResult.data.student.nama_lengkap || lastScanResult.data.student.full_name}</span>
                                </p>
                                <p>
                                  <span className="text-slate-400">NIS / NISN:</span> <span className="font-mono font-semibold">{lastScanResult.data.student.nis || lastScanResult.data.student.nisn || '-'}</span>
                                </p>
                                {(lastScanResult.data.student.kelas || lastScanResult.data.student.school_class) && (
                                  <p>
                                    <span className="text-slate-400">Kelas:</span> <span className="font-semibold">{lastScanResult.data.student.kelas?.nama || lastScanResult.data.student.school_class?.name || '-'}</span>
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="rounded-2xl border-2 border-dashed border-emerald-200/80 p-6 text-center dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/10">
                        <div className="flex size-12 mx-auto items-center justify-center rounded-2xl bg-emerald-100/70 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 mb-2.5">
                          <QrCode className="size-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                          Siap Memindai Kartu Gerbang
                        </h4>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                          Tempelkan kartu RFID pada reader atau arahkan QR Code kartu siswa ke scanner untuk mencatat presensi secara otomatis.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Quick Tips Box */}
                  <div className="rounded-2xl border border-emerald-200/70 bg-gradient-to-r from-emerald-50/60 via-teal-50/40 to-emerald-50/60 p-3.5 dark:border-emerald-800/60 dark:bg-slate-900/50 text-[11px] text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                      <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Sinkronisasi Otomatis Real-Time</span>
                    </div>
                    <p className="leading-relaxed">
                      Setiap kali pemindaian berhasil, rekapitulasi data tabel di bawah serta grafik kehadiran akan terbarui secara instan tanpa perlu memuat ulang halaman.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Summary Cards Grid (§C ModernKpiCard + §7.3 grid adaptif) */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {cards.map(({ label, statusKey, value, icon: Icon, tone, percent }) => {
          const style = toneStyles[tone] || toneStyles.emerald
          return (
            <motion.article
              key={label}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => openCardModal(statusKey, label, tone)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), openCardModal(statusKey, label, tone))}
              className={`group relative overflow-hidden rounded-[18px] border-2 p-5 shadow-xs transition-[border-color,box-shadow] duration-150 text-left cursor-pointer hover:shadow-md ${style.card}`}
              title={`Klik untuk melihat detail data ${label}`}
            >
              {/* Ambient Glow */}
              <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all ${style.glow}`} />

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm ${style.iconBg}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className={`text-[11px] font-bold uppercase tracking-wider ${style.title}`}>{label}</p>
                  </div>
                </div>
                <span className={`rounded-lg px-2 py-0.5 text-[10px] font-extrabold ${style.badge}`}>
                  {percent !== null && percent !== undefined ? `${percent.toFixed(1)}%` : '—'}
                </span>
              </div>
              <p className={`text-4xl font-black tabular-nums ${style.val}`}>
                {formatAngka(value)}
              </p>
              <div className="flex items-center justify-between mt-3 text-[10px] font-bold">
                <span className="text-slate-500 dark:text-slate-400">
                  {metrics.hasData && metrics.totalData > 0 ? `${formatAngka(value)} dari ${formatAngka(metrics.totalData)} data` : 'Belum ada data'}
                </span>
                <span className={`inline-flex items-center gap-1 ${style.cta}`}>
                  <Eye className="h-3 w-3" /> Detail &rarr;
                </span>
              </div>
            </motion.article>
          )
        })}
      </motion.div>

      {/* 3-Column Equal Grid: Filter Laporan, Grafik Kehadiran, & Distribusi */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="relative z-30 grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {/* Col 1: Filter Laporan */}
        <article className="relative z-40 rounded-[22px] border-2 border-emerald-300 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433] space-y-4 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4 pb-3.5 border-b border-emerald-200/90 dark:border-emerald-800/60">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-sm border border-emerald-300/40">
                  <Filter className="size-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Filter Laporan Gerbang</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Periode, status & pencarian siswa</p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shrink-0 cursor-pointer"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Fitur Filter Periode Waktu (Hari, Minggu, Bulan, Semester, Tahun) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Periode Waktu
                </label>
                <HeroUiFilterSelect
                  value={period}
                  onChange={(nextPeriod) => {
                    setPeriod(nextPeriod)
                    if (nextPeriod !== 'custom' && nextPeriod !== 'semua') {
                      const { from, to } = getPeriodDateRange(nextPeriod)
                      setDateFrom(from)
                      setDateTo(to)
                    } else if (nextPeriod === 'semua') {
                      setDateFrom('')
                      setDateTo('')
                    }
                    setCurrentPage(1)
                  }}
                  options={periodOptions}
                  placeholder="Pilih Periode..."
                  icon={Calendar}
                  widthClass="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="relative z-20">
                  <label htmlFor="gerbang-from" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Tanggal Mulai</label>
                  <DatePicker
                    id="gerbang-from"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value)
                      setPeriod('custom')
                      setCurrentPage(1)
                    }}
                    placeholder="Pilih tanggal mulai..."
                    popoverClassName="z-[110]"
                  />
                </div>
                <div className="relative z-20">
                  <label htmlFor="gerbang-to" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Tanggal Selesai</label>
                  <DatePicker
                    id="gerbang-to"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value)
                      setPeriod('custom')
                      setCurrentPage(1)
                    }}
                    placeholder="Pilih tanggal selesai..."
                    popoverClassName="sm:right-0 sm:left-auto z-[110]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Status Presensi Gerbang
                </label>
                <HeroUiFilterSelect
                  value={status}
                  onChange={(val) => {
                    setStatus(val)
                    setCurrentPage(1)
                  }}
                  options={statusOptions}
                  placeholder="Semua Status"
                  icon={ClipboardCheck}
                  widthClass="w-full"
                />
              </div>

              <div>
                <label htmlFor="gerbang-search" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Pencarian Siswa
                </label>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                    <Search className="size-4" />
                  </div>
                  <input
                    id="gerbang-search"
                    type="text"
                    placeholder="Nama, NIS, atau NISN..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                  />
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Col 2: Grafik Trend Masuk Gerbang */}
        <article className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433] flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-emerald-200/90 dark:border-emerald-800/60">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-sm border border-emerald-300/40">
                  <TrendingUp className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Waktu Masuk Gerbang</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Tren ketepatan per jam</p>
                </div>
              </div>
              <AppBadge variant={loading ? 'secondary' : error ? 'danger' : chartData.length > 0 ? 'success' : 'secondary'} size="sm">
                {loading ? 'Memuat...' : error ? 'Gagal' : 'Jam Masuk'}
              </AppBadge>
            </div>
            <div className="h-64 w-full pt-2 text-slate-200 dark:text-slate-800">
              {loading ? (
                <AppSkeleton variant="card" className="h-full" />
              ) : error ? (
                <div className="flex h-full flex-col items-center justify-center text-center p-4">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mb-3 border border-rose-200/60 dark:border-rose-900/40">
                    <AlertTriangle className="size-6" />
                  </div>
                  <p className="text-xs font-bold text-rose-700 dark:text-rose-300">Gagal Memuat Tren Jam Masuk</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-[220px]">{error}</p>
                </div>
              ) : chartData.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center p-4">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mb-3 border border-emerald-200/60 dark:border-emerald-900/40">
                    <TrendingUp className="size-6 opacity-60" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Belum ada tren waktu masuk untuk periode ini
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-[220px]">
                    Data pemindaian jam masuk gerbang akan otomatis terpetakan di sini.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="hadirGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#12a968" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#12a968" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="currentColor" strokeDasharray="3 3" vertical={false} opacity={0.6} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fontSize: 10 }} className="text-slate-400 dark:text-slate-500" />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fontSize: 10 }} className="text-slate-400 dark:text-slate-500" />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null
                        return (
                          <div className="rounded-xl border border-slate-800 bg-slate-900/95 p-3 text-white shadow-xl backdrop-blur-sm">
                            <p className="text-xs font-bold text-emerald-400 mb-1">Jam {label}</p>
                            {payload.map((p) => (
                              <p key={p.dataKey} className="text-xs font-extrabold">{p.name}: {p.value} siswa</p>
                            ))}
                          </div>
                        )
                      }}
                    />
                    <Area type="monotone" dataKey="tepat" name="Tepat Waktu" stroke={warnaStatus.hadir} fill="url(#hadirGradient)" strokeWidth={2} />
                    <Area type="monotone" dataKey="terlambat" name="Terlambat" stroke={warnaStatus.terlambat} fill="transparent" strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>Distribusi ketepatan per jam masuk</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Terupdate Otomatis</span>
          </div>
        </article>

        {/* Col 3: Distribusi Status Gerbang */}
        <article className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433] flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-emerald-200/90 dark:border-emerald-800/60">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white shadow-sm border border-sky-300/40">
                  <ChartPieIcon className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Distribusi Absensi Gerbang</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Proporsi status scan siswa</p>
                </div>
              </div>
              <AppBadge variant={loading ? 'secondary' : error ? 'danger' : metrics.hasData ? 'success' : 'secondary'} size="sm">
                {loading ? 'Memuat...' : error ? 'Gagal' : `${formatAngka(metrics.totalData)} Total`}
              </AppBadge>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <AppSkeleton variant="card" className="h-full w-full" />
              </div>
            ) : error ? (
              <div className="flex h-64 flex-col items-center justify-center text-center p-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mb-3 border border-rose-200/60 dark:border-rose-900/40">
                  <AlertTriangle className="size-6" />
                </div>
                <p className="text-xs font-bold text-rose-700 dark:text-rose-300">
                  Gagal Memuat Distribusi Absensi
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-[220px]">
                  {error}
                </p>
              </div>
            ) : !metrics.hasData ? (
              <div className="flex h-64 flex-col items-center justify-center text-center p-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 mb-3 border border-sky-200/60 dark:border-sky-900/40">
                  <ChartPieIcon className="size-6 opacity-60" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Belum ada data absensi gerbang untuk periode ini
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-[240px]">
                  Tidak ada catatan pemindaian masuk atau kepulangan siswa pada filter yang dipilih.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1">
                <div className="relative w-40 h-40 mb-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={activeDistribution} dataKey="value" innerRadius="62%" outerRadius="88%" paddingAngle={2}>
                        {activeDistribution.map((item) => <Cell key={item.name} fill={item.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <strong className="text-xl font-black text-slate-900 dark:text-white">{formatAngka(metrics.totalScanned)}</strong>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Sudah Scan</span>
                  </div>
                </div>

                <div className="w-full grid grid-cols-2 gap-2 text-xs">
                  {distribution.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5 p-1.5 rounded-lg border border-emerald-100 bg-slate-50/70 dark:border-emerald-900/40 dark:bg-slate-900/40">
                      <span className="size-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                      <div className="flex items-center justify-between w-full min-w-0">
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate">{item.name}</span>
                        <div className="flex items-center gap-1 shrink-0 ml-1">
                          <span className="text-[11px] font-bold text-slate-900 dark:text-white tabular-nums">{formatAngka(item.value)}</span>
                          <span className="text-[10px] text-slate-400 tabular-nums">
                            ({metrics.totalData > 0 ? ((item.value / metrics.totalData) * 100).toFixed(0) : 0}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>Proporsi status scan gerbang</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {metrics.hasData ? `${formatAngka(metrics.totalScanned)} Sudah Scan` : '0 Sudah Scan'}
            </span>
          </div>
        </article>
      </motion.div>

      {/* Main Datatable Outer Container */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="relative z-10 overflow-hidden rounded-[22px] border-2 border-emerald-300 bg-white shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433]">
        {/* Header Baris 1: Title & Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3.5 sm:px-6 md:px-8 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-200/90 dark:border-emerald-800/60">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shrink-0 shadow-sm border border-emerald-300/40">
              <Users className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Hasil Scan & Rekap Absensi Gerbang</h2>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  {formatAngka(sortedRows.length)} Data
                </span>
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                Rekapan baca-saja dari seluruh hasil scan masuk dan pulang siswa berbasis RFID / QR / Barcode.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
            <SquircleActionButton
              variant="primary"
              icon={QrCode}
              label={showScannerPanel ? 'Fokus Scanner' : 'Buka Scanner'}
              onClick={() => {
                setShowScannerPanel(true)
                document.getElementById('terminal-scanner-gerbang')?.scrollIntoView({ behavior: 'smooth' })
              }}
            />
            <SquircleActionButton
              variant="export"
              label="Export CSV"
              onClick={handleExportCSV}
            />
            <SquircleActionButton
              variant="view"
              icon={Printer}
              label="Cetak Data"
              onClick={() => setIsPrintModalOpen(true)}
            />
          </div>
        </div>

        {/* Toolbar Baris 2: Search Input & Per-Page Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 sm:px-6 md:px-8 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-emerald-950/20">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 size-4 text-emerald-600/70 dark:text-emerald-400" />
            <input
              type="text"
              placeholder="Cari nama siswa, NIS, NISN, atau kelas..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="h-10 sm:h-11 w-full rounded-2xl border border-emerald-200/90 bg-white pl-10 sm:pl-11 pr-10 text-xs font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-emerald-800/70 dark:bg-slate-900 dark:text-slate-100"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setCurrentPage(1)
                }}
                aria-label="Bersihkan pencarian"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs font-medium text-slate-500">Per Halaman:</span>
            <HeroUiFilterSelect
              value={perPage}
              onChange={(val) => {
                setPerPage(Number(val))
                setCurrentPage(1)
              }}
              options={perPageOptions}
              widthClass="w-20"
            />
          </div>
        </div>

        {/* Viewport Tabel dengan Horizontal Padding */}
        <div className="px-4 sm:px-6 md:px-8 overflow-x-auto">
          {loading ? (
            <div className="py-6">
              <AppSkeleton rows={6} />
            </div>
          ) : error ? (
            <div className="py-6">
              <AppErrorState title="Rekap absensi gerbang gagal dimuat" description={error} onRetry={load} compact />
            </div>
          ) : paginatedRows.length === 0 ? (
            <div className="py-8">
              <AppEmptyState
                title="Tidak ada data scan gerbang"
                description="Belum ada data scan absensi gerbang yang sesuai dengan kriteria pencarian dan filter pilihan Anda."
              />
            </div>
          ) : (
            <TableRoot fullBleed={false}>
              <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
                <TableRow className="border-none">
                  <TableHead className="w-12 text-center font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">#</TableHead>

                  <TableHead
                    className="cursor-pointer select-none hover:text-emerald-800 dark:hover:text-emerald-300 font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200 transition-colors"
                    onClick={() => handleSort('student')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Siswa</span>
                      <ArrowUpDown className="size-3.5 text-emerald-700 dark:text-emerald-400" />
                    </div>
                  </TableHead>

                  <TableHead className="hidden lg:table-cell text-center font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">NIS / NISN</TableHead>
                  <TableHead className="hidden lg:table-cell text-center font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">Unit Pendidikan</TableHead>
                  <TableHead className="hidden sm:table-cell text-center font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">Kelas</TableHead>
                  <TableHead className="text-center font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">Jam Masuk</TableHead>
                  <TableHead className="hidden md:table-cell text-center font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">Jam Pulang</TableHead>
                  <TableHead className="hidden lg:table-cell text-center font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">Metode</TableHead>
                  <TableHead className="text-right font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                {paginatedRows.map((row, index) => {
                  const studentName = row.student?.nama_lengkap || row.student?.full_name || 'Siswa'
                  const studentNis = row.student?.nis || row.student?.nisn || '-'
                  const unitName = row.education_unit?.name || '-'
                  const kelasName = row.school_class?.name || row.school_class?.nama_kelas || '-'
                  const st = String(row.status || '').toUpperCase()
                  const statusVariant = getAttendanceBadgeVariant(st)

                  return (
                    <TableRow key={row.id || index} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
                      <TableCell className="text-center font-bold text-slate-400 text-xs tabular-nums">
                        {(currentPage - 1) * perPage + index + 1}
                      </TableCell>

                      {/* Cell Identitas Siswa dengan HoverCard */}
                      <TableCell className="align-top sm:align-middle">
                        <HoverCard>
                          <HoverCardTrigger
                            onClick={(e) => {
                              e.preventDefault()
                              setSelectedDetailStudent(row)
                            }}
                            className="font-extrabold text-slate-900 dark:text-white text-sm border-b border-dashed border-slate-400/60 hover:border-[#0E5C44] transition-colors cursor-pointer inline-block max-w-full truncate"
                            title={studentName}
                          >
                            {studentName}
                          </HoverCardTrigger>

                          <HoverCardContent className="w-72 p-0 overflow-hidden border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#1B2433] shadow-xl rounded-2xl z-50">
                            <div className="relative h-20 w-full bg-gradient-to-r from-emerald-800 to-teal-900 p-3.5 flex items-center justify-between text-white">
                              <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-white">
                                  {kelasName}
                                </span>
                                <h4 className="text-sm font-extrabold mt-1 text-white truncate max-w-[170px]">
                                  {studentName}
                                </h4>
                              </div>
                              <div className="size-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center font-black text-xs text-white border border-white/20 shrink-0">
                                {st || 'SCAN'}
                              </div>
                            </div>

                            <div className="p-3.5 space-y-2.5">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-slate-400 block text-[10px] font-semibold">NIS / NISN</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono truncate block">{studentNis}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[10px] font-semibold">Unit Pendidikan</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{unitName}</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-center text-[11px]">
                                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200/50">
                                  <span className="block text-[9px] font-bold text-emerald-600">Jam Masuk</span>
                                  <span className="font-extrabold text-emerald-800 dark:text-emerald-300">{row.check_in_time || '-'}</span>
                                </div>
                                <div className="bg-sky-50 dark:bg-sky-950/40 p-2 rounded-lg border border-sky-200/50">
                                  <span className="block text-[9px] font-bold text-sky-600">Jam Pulang</span>
                                  <span className="font-extrabold text-sky-800 dark:text-sky-300">{row.check_out_time || '-'}</span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => setSelectedDetailStudent(row)}
                                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-5 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white text-xs font-extrabold rounded-2xl border border-emerald-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                              >
                                Lihat Rincian Data
                              </button>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                        {/* Mobile Compact Metadata Row (§7.5) */}
                        <div className="sm:hidden mt-2 flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-emerald-100/80 dark:border-emerald-900/40">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                            {kelasName}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 tabular-nums">
                            {row.check_in_time || '-'}
                          </span>
                          <AppBadge size="sm" variant={statusVariant}>
                            {row.status || 'HADIR'}
                          </AppBadge>
                        </div>
                      </TableCell>

                      <TableCell className="hidden lg:table-cell text-center font-mono font-semibold text-slate-600 dark:text-slate-400 text-xs">
                        {studentNis}
                      </TableCell>

                      <TableCell className="hidden lg:table-cell text-center font-medium text-slate-700 dark:text-slate-300 text-xs">
                        {unitName}
                      </TableCell>

                      <TableCell className="hidden sm:table-cell text-center font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        {kelasName}
                      </TableCell>

                      <TableCell className="text-center font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums text-xs">
                        {row.check_in_time || '-'}
                      </TableCell>

                      <TableCell className="hidden md:table-cell text-center font-extrabold text-sky-700 dark:text-sky-400 tabular-nums text-xs">
                        {row.check_out_time || '-'}
                      </TableCell>

                      <TableCell className="hidden lg:table-cell text-center text-xs font-semibold text-slate-500">
                        {row.attendance_method || 'RFID'}
                      </TableCell>

                      <TableCell className="text-right align-middle">
                        <AppBadge
                          variant={statusVariant}
                          className="hover:scale-105 transition-transform cursor-pointer"
                          onClick={() => setSelectedDetailStudent(row)}
                        >
                          {row.status || 'HADIR'}
                        </AppBadge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </TableRoot>
          )}
        </div>

        {/* Footer Pagination Navigation (§7.6) */}
        <div className="border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/40 via-white to-emerald-50/40 p-3.5 sm:px-6 md:px-8 py-3 sm:py-3.5 dark:border-emerald-800/60 dark:from-emerald-950/20 dark:via-transparent dark:to-emerald-950/20 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center sm:text-left">
            Menampilkan <span className="font-semibold text-slate-700 dark:text-slate-200">{sortedRows.length ? (currentPage - 1) * perPage + 1 : 0}</span> -{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{Math.min(currentPage * perPage, sortedRows.length)}</span> dari{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{formatAngka(sortedRows.length)}</span> data
          </div>
          <div className="flex items-center justify-center gap-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
              sideLayout="icon"
            />
          </div>
        </div>
      </motion.div>

      {/* Summary Card Interactive Datatable Modal */}
      {cardModal.isOpen && (
        <Backdrop isOpen={cardModal.isOpen} onOpenChange={closeCardModal} className="z-[70] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <Dialog
            isOpen={cardModal.isOpen}
            onOpenChange={(open) => !open && closeCardModal()}
            showCloseButton={false}
            className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-[#1B2433] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-0"
          >
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
            <DialogHeader className="p-5 flex flex-row items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20 border border-emerald-300/30 shrink-0">
                  <Sparkles className="size-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <DialogTitle className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      {cardModal.title}
                    </DialogTitle>
                    <AppBadge variant={cardModal.tone === 'rose' ? 'danger' : cardModal.tone === 'amber' ? 'warning' : cardModal.tone === 'sky' || cardModal.tone === 'violet' ? 'info' : 'success'}>
                      {modalRows.length} Data Scan
                    </AppBadge>
                  </div>
                  <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Daftar rincian log scan gerbang siswa dengan status {cardModal.title} pada periode {dateFrom || date} s/d {dateTo || date}
                  </DialogDescription>
                </div>
              </div>
              <button
                type="button"
                onClick={closeCardModal}
                aria-label="Tutup modal"
                className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer shrink-0"
              >
                <X className="size-4 text-white" strokeWidth={2.25} />
              </button>
            </DialogHeader>

          <DialogBody className="flex-1 overflow-y-auto py-4 space-y-4">
            {/* Modal Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 p-3 rounded-2xl">
              <div className="relative w-full sm:w-80">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-emerald-600/70 dark:text-emerald-400" />
                <input
                  type="text"
                  placeholder="Cari nama siswa, NIS, atau kelas..."
                  value={cardModal.searchQuery}
                  onChange={(e) => setCardModal((prev) => ({ ...prev, searchQuery: e.target.value, page: 1 }))}
                  className="w-full rounded-2xl border border-emerald-200/90 bg-white pl-10 pr-8 py-2 text-xs font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-emerald-800/70 dark:bg-slate-900 dark:text-slate-100"
                />
                {cardModal.searchQuery && (
                  <button
                    type="button"
                    onClick={() => setCardModal((prev) => ({ ...prev, searchQuery: '', page: 1 }))}
                    aria-label="Bersihkan pencarian"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Modal Datatable */}
            <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
              <TableRoot className="w-full text-left text-xs">
                <TableHeader className="bg-gradient-to-r from-emerald-100/80 via-teal-50/60 to-emerald-100/80 border-b border-emerald-200/80 dark:from-emerald-950/80 dark:via-teal-950/60 dark:to-emerald-950/80 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-extrabold uppercase">
                  <TableRow>
                    <TableHead className="py-2.5 px-4 text-[11px]">No</TableHead>
                    <TableHead className="py-2.5 px-4 text-[11px]">Siswa</TableHead>
                    <TableHead className="py-2.5 px-4 text-[11px]">NIS/NISN</TableHead>
                    <TableHead className="py-2.5 px-4 text-[11px]">Kelas</TableHead>
                    <TableHead className="py-2.5 px-4 text-[11px]">Jam Masuk</TableHead>
                    <TableHead className="py-2.5 px-4 text-[11px]">Jam Pulang</TableHead>
                    <TableHead className="py-2.5 px-4 text-[11px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                  {paginatedModalRows.length > 0 ? (
                    paginatedModalRows.map((row, idx) => {
                      const studentName = row.student?.nama_lengkap || row.student?.full_name || 'Siswa'
                      const studentNis = row.student?.nis || row.student?.nisn || '-'
                      const kelasName = row.school_class?.name || row.school_class?.nama_kelas || '-'

                      return (
                        <TableRow key={row.id || idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
                          <TableCell className="py-3 px-4 font-medium text-slate-500 tabular-nums">
                            {(cardModal.page - 1) * MODAL_PAGE_SIZE + idx + 1}
                          </TableCell>
                          <TableCell className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            {studentName}
                          </TableCell>
                          <TableCell className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                            {studentNis}
                          </TableCell>
                          <TableCell className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                            {kelasName}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-emerald-700 dark:text-emerald-400 font-bold tabular-nums">
                            {row.check_in_time || '-'}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-sky-700 dark:text-sky-400 font-bold tabular-nums">
                            {row.check_out_time || '-'}
                          </TableCell>
                          <TableCell className="py-3 px-4">
                            <AppBadge variant={getAttendanceBadgeVariant(row.status)}>
                              {row.status || 'HADIR'}
                            </AppBadge>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                        {cardModal.searchQuery ? 'Tidak ada data presensi yang cocok dengan pencarian.' : 'Belum ada data pada kategori ini.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </TableRoot>
            </div>
          </DialogBody>

          <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium">
              Menampilkan {modalRows.length ? (cardModal.page - 1) * MODAL_PAGE_SIZE + 1 : 0}–{Math.min(cardModal.page * MODAL_PAGE_SIZE, modalRows.length)} dari {modalRows.length} data
            </span>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 mr-2">
                <button
                  type="button"
                  disabled={cardModal.page === 1}
                  onClick={() => setCardModal((prev) => ({ ...prev, page: prev.page - 1 }))}
                  aria-label="Halaman sebelumnya"
                  className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all duration-150 active:scale-95 disabled:bg-emerald-600/30 disabled:text-white/40 disabled:pointer-events-none dark:disabled:bg-emerald-950/40 dark:disabled:text-white/30 cursor-pointer"
                >
                  <ChevronLeft className="size-5 shrink-0" />
                </button>
                <span className="text-xs font-semibold px-2 text-slate-700 dark:text-slate-300 tabular-nums">
                  {cardModal.page} / {modalTotalPages}
                </span>
                <button
                  type="button"
                  disabled={cardModal.page === modalTotalPages}
                  onClick={() => setCardModal((prev) => ({ ...prev, page: prev.page + 1 }))}
                  aria-label="Halaman berikutnya"
                  className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all duration-150 active:scale-95 disabled:bg-emerald-600/30 disabled:text-white/40 disabled:pointer-events-none dark:disabled:bg-emerald-950/40 dark:disabled:text-white/30 cursor-pointer"
                >
                  <ChevronRight className="size-5 shrink-0" />
                </button>
              </div>
              <button
                type="button"
                onClick={closeCardModal}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
              >
                <div className="flex size-5 items-center justify-center rounded-lg bg-white/20">
                  <X className="size-3.5 text-white" strokeWidth={2.2} />
                </div>
                <span>Tutup</span>
              </button>
            </div>
          </DialogFooter>
        </Dialog>
      </Backdrop>
      )}

      {/* Modal Detail Rincian Presensi Siswa saat Klik Data */}
      <OverlayWrapper isOpen={!!selectedDetailStudent} onOpenChange={() => setSelectedDetailStudent(null)}>
        <Backdrop isOpen={!!selectedDetailStudent} onOpenChange={() => setSelectedDetailStudent(null)} className="z-[70] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <Dialog
            isOpen={!!selectedDetailStudent}
            onOpenChange={() => setSelectedDetailStudent(null)}
            showCloseButton={true}
            className="w-full max-w-lg rounded-3xl p-0 bg-white dark:bg-[#1B2433] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
          >
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
            {selectedDetailStudent && (
              <div className="p-6 space-y-4">
                <DialogHeader className="p-0">
                  <DialogTitle className="flex items-center gap-3">
                    <div className="size-11 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-md shadow-emerald-500/20 border border-emerald-300/30">
                      {(selectedDetailStudent.student?.nama_lengkap || selectedDetailStudent.student?.full_name || 'S')[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-black leading-tight text-slate-900 dark:text-white truncate">
                          {selectedDetailStudent.student?.nama_lengkap || selectedDetailStudent.student?.full_name}
                        </h3>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                          <Sparkles className="size-3" />
                          Detail Presensi
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium font-mono mt-0.5">
                        NIS: {selectedDetailStudent.student?.nis || selectedDetailStudent.student?.nisn || '-'}
                      </p>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                <DialogBody className="space-y-4 py-2">
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold">Unit Pendidikan</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {selectedDetailStudent.education_unit?.name || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold">Kelas</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {selectedDetailStudent.school_class?.name || selectedDetailStudent.school_class?.nama_kelas || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold">Metode Presensi</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {selectedDetailStudent.attendance_method || 'RFID/Scan'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold">Status Presensi</span>
                      <div className="mt-1">
                        <AppBadge variant={getAttendanceBadgeVariant(selectedDetailStudent.status)}>
                          {selectedDetailStudent.status || 'HADIR'}
                        </AppBadge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60">
                      <span className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                        Jam Scan Masuk
                      </span>
                      <span className="text-xl font-black text-emerald-900 dark:text-emerald-200">
                        {selectedDetailStudent.check_in_time || '-'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/60">
                      <span className="block text-[10px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider">
                        Jam Scan Pulang
                      </span>
                      <span className="text-xl font-black text-sky-900 dark:text-sky-200">
                        {selectedDetailStudent.check_out_time || '-'}
                      </span>
                    </div>
                  </div>
                </DialogBody>

                <DialogFooter className="pt-2 flex flex-wrap items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedDetailStudent(null)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                  >
                    <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                      <X className="size-3.5 text-white" strokeWidth={2.2} />
                    </div>
                    <span>Tutup</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDetailStudent(null)
                      setIsPrintModalOpen(true)
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white px-5 py-2.5 text-xs font-extrabold border border-indigo-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                  >
                    <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                      <Printer className="size-3.5 text-white" strokeWidth={2.2} />
                    </div>
                    <span>Cetak Data Gerbang</span>
                  </button>
                </DialogFooter>
              </div>
            )}
          </Dialog>
        </Backdrop>
      </OverlayWrapper>

      {/* Modal Opsi Cetak & Unduh PDF */}
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        onPrint={handlePrintClean}
        onDownload={handleDownloadPDF}
        title="Rekap Absensi Gerbang"
      />

      {/* Pop-Up Camera Scanner Modal */}
      <AnimatePresence>
        {showCameraModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-3 sm:p-5 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="modal-dialog font-sans my-auto relative w-full max-w-xl"
            >
              <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-500/30 bg-white shadow-2xl shadow-emerald-950/20 dark:border-emerald-600/40 dark:bg-[#182232] dark:shadow-black/60">
                <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
                <div className="pointer-events-none absolute -top-20 -right-20 h-52 w-52 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl dark:from-emerald-500/40 dark:via-teal-400/30" />

                {/* Modal Header */}
                <div className="modal-header relative z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20 border border-emerald-300/30">
                      <Camera className="h-5 w-5 text-white" strokeWidth={2.25} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="modal-title text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white">
                          Pemindai QR Code Live
                        </h3>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-0.5 text-[11px] font-extrabold text-white shadow-sm border border-emerald-300/40">
                          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                          {scanMode === 'checkin' ? 'KEDATANGAN' : 'PULANG'}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                        Arahkan QR Code kartu siswa ke dalam kotak pemindai
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeCameraModal}
                    aria-label="Tutup pemindai"
                    className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer shrink-0"
                  >
                    <X className="size-4 text-white" strokeWidth={2.25} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="relative z-10 p-6 space-y-4">
                  {/* Square QR Code Viewfinder */}
                  <div className="relative mx-auto aspect-square w-full max-w-[320px] sm:max-w-[340px] overflow-hidden rounded-[24px] border-2 border-emerald-500/40 bg-slate-950 shadow-2xl shadow-emerald-500/10 dark:border-emerald-600/50">
                    <video
                      ref={(el) => {
                        videoRef.current = el
                        if (el && streamRef.current && el.srcObject !== streamRef.current) {
                          el.srcObject = streamRef.current
                          el.muted = true
                          el.play().catch((err) => console.warn('Play error:', err))
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      className="h-full w-full object-cover"
                    />

                    {/* Darkened Mask with Center Square QR Target */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="relative z-10 h-56 w-56 sm:h-64 sm:w-64 rounded-2xl border-2 border-emerald-400/90 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.52)] overflow-hidden">
                        {/* 4 Corner Markers */}
                        <span className="absolute top-0 left-0 h-6 w-6 border-t-[3.5px] border-l-[3.5px] border-emerald-400 rounded-tl-xl shadow-[0_0_8px_#10b981]" />
                        <span className="absolute top-0 right-0 h-6 w-6 border-t-[3.5px] border-r-[3.5px] border-emerald-400 rounded-tr-xl shadow-[0_0_8px_#10b981]" />
                        <span className="absolute bottom-0 left-0 h-6 w-6 border-b-[3.5px] border-l-[3.5px] border-emerald-400 rounded-bl-xl shadow-[0_0_8px_#10b981]" />
                        <span className="absolute bottom-0 right-0 h-6 w-6 border-b-[3.5px] border-r-[3.5px] border-emerald-400 rounded-br-xl shadow-[0_0_8px_#10b981]" />

                        {cameraActive && (
                          <>
                            <motion.div
                              animate={{ top: ['-20%', '85%', '-20%'] }}
                              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                              className="absolute inset-x-0 h-16 bg-gradient-to-b from-emerald-500/20 via-teal-400/10 to-transparent pointer-events-none z-10"
                            />
                            <motion.div
                              animate={{ top: ['4%', '94%', '4%'] }}
                              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                              className="absolute inset-x-1 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_16px_#10b981,0_0_24px_#34d399] z-20 pointer-events-none"
                            />
                          </>
                        )}

                        <div className="absolute -bottom-9 inset-x-0 flex justify-center pointer-events-none">
                          <span className="bg-slate-950/90 backdrop-blur-md px-3.5 py-1 text-[10px] font-black text-emerald-300 rounded-full border border-emerald-500/40 whitespace-nowrap shadow-xl flex items-center gap-1.5">
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
                    <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs dark:border-rose-900/50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 space-y-2.5">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-extrabold text-[13px] text-rose-900 dark:text-rose-100">Kamera Tidak Dapat Diakses</p>
                          <p className="leading-relaxed">{cameraError}</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/60 flex flex-wrap items-center justify-between gap-2">
                        <div className="text-[11px] text-rose-700 dark:text-rose-300">
                          <span className="font-bold">Panduan:</span> Izinkan akses Camera pada browser lalu coba hubungkan lagi.
                        </div>
                        <button
                          type="button"
                          onClick={startCamera}
                          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 px-4 py-2 text-xs font-extrabold text-white border border-rose-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
                        >
                          <RefreshCw className="size-3.5 text-white" strokeWidth={2.2} />
                          <span>Coba Lagi</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quick Code Entry in Modal */}
                  <form onSubmit={handleModalScanSubmit} className="space-y-2 pt-1">
                    <label htmlFor="gate-modal-scan" className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                      Hasil Pindai QR / Input Manual Kartu
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex flex-1 items-center">
                        <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                          <QrCode className="size-4" />
                        </div>
                        <input
                          id="gate-modal-scan"
                          type="text"
                          value={modalCardInput}
                          onChange={(e) => setModalCardInput(e.target.value)}
                          placeholder="Hasil kode QR atau nomor kartu..."
                          className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={processingScan || !modalCardInput.trim()}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 px-5 py-2.5 text-xs font-extrabold text-white border border-emerald-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                      >
                        {processingScan ? (
                          <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <CheckCircle2 className="size-3.5" />
                        )}
                        <span>Proses</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pop-Up Schedule Configuration Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-3 sm:p-5 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="modal-dialog font-sans my-auto relative w-full max-w-2xl"
            >
              <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-500/30 bg-white shadow-2xl shadow-emerald-950/20 dark:border-emerald-600/40 dark:bg-[#182232] dark:shadow-black/60">
                <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
                <div className="modal-header relative z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md border border-emerald-300/30">
                      <Settings className="h-5 w-5 text-white" strokeWidth={2.25} />
                    </div>
                    <div>
                      <h3 className="modal-title text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white">
                        Pengaturan Jam Masuk & Pulang Gerbang
                      </h3>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                        Tentukan jam masuk, toleransi keterlambatan, dan jam kepulangan siswa.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    aria-label="Tutup pengaturan"
                    className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer shrink-0"
                  >
                    <X className="size-4 text-white" strokeWidth={2.25} />
                  </button>
                </div>

                <div className="relative z-10 p-6 space-y-5 overflow-y-auto max-h-[calc(100dvh-12rem)]">
                  <form onSubmit={handleSaveScheduleConfig} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="sched-jam-masuk" className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                          Jam Masuk Sekolah <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="sched-jam-masuk"
                          type="time"
                          required
                          value={scheduleConfig.jam_masuk}
                          onChange={(e) => setScheduleConfig({ ...scheduleConfig, jam_masuk: e.target.value })}
                          className="w-full rounded-xl border border-slate-200/90 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label htmlFor="sched-toleransi" className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                          Toleransi Keterlambatan (Menit) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="sched-toleransi"
                          type="number"
                          required
                          min="0"
                          max="120"
                          value={scheduleConfig.toleransi_menit}
                          onChange={(e) => setScheduleConfig({ ...scheduleConfig, toleransi_menit: e.target.value })}
                          className="w-full rounded-xl border border-slate-200/90 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label htmlFor="sched-jam-pulang" className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                          Jam Pulang Sekolah <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="sched-jam-pulang"
                          type="time"
                          required
                          value={scheduleConfig.jam_pulang}
                          onChange={(e) => setScheduleConfig({ ...scheduleConfig, jam_pulang: e.target.value })}
                          className="w-full rounded-xl border border-slate-200/90 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label htmlFor="sched-cutoff" className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                          Batas Jam Cutoff Alpha <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="sched-cutoff"
                          type="time"
                          required
                          value={scheduleConfig.jam_cutoff_alpha}
                          onChange={(e) => setScheduleConfig({ ...scheduleConfig, jam_cutoff_alpha: e.target.value })}
                          className="w-full rounded-xl border border-slate-200/90 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={savingSchedule}
                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white px-5 py-2.5 text-xs font-extrabold border border-emerald-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-md shadow-emerald-500/20"
                      >
                        {savingSchedule ? (
                          <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <CheckCircle2 className="size-3.5 text-white" strokeWidth={2.2} />
                        )}
                        <span>{savingSchedule ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
                      </button>
                    </div>
                  </form>

                  {/* Summary of schedules across units */}
                  {allUnitsSchedules.length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="h-4 w-4 text-emerald-600" /> Ringkasan Jam Seluruh Unit
                      </h4>
                      <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
                        <TableRoot className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                          <TableHeader className="bg-gradient-to-r from-emerald-100/80 via-teal-50/60 to-emerald-100/80 border-b border-emerald-200/80 dark:from-emerald-950/80 dark:via-teal-950/60 dark:to-emerald-950/80 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300">
                            <TableRow>
                              <TableHead className="px-3.5 py-2">Unit</TableHead>
                              <TableHead className="px-3.5 py-2">Masuk</TableHead>
                              <TableHead className="px-3.5 py-2">Toleransi</TableHead>
                              <TableHead className="px-3.5 py-2">Pulang</TableHead>
                              <TableHead className="px-3.5 py-2 text-right">Pilih</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                            {allUnitsSchedules.map((u) => (
                              <TableRow key={u.unit_id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20">
                                <TableCell className="px-3.5 py-2 font-bold text-slate-900 dark:text-white">{u.unit_name}</TableCell>
                                <TableCell className="px-3.5 py-2 font-bold text-emerald-700 dark:text-emerald-400">{u.schedule.jam_masuk}</TableCell>
                                <TableCell className="px-3.5 py-2">{u.schedule.toleransi_menit}m</TableCell>
                                <TableCell className="px-3.5 py-2 font-bold text-indigo-700 dark:text-indigo-400">{u.schedule.jam_pulang}</TableCell>
                                <TableCell className="px-3.5 py-2 text-right">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTargetUnitForConfig(u.unit_id)
                                      setScheduleConfig(u.schedule)
                                    }}
                                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 underline cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </TableRoot>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </PageContainer>
  )
}
