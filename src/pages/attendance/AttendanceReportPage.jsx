import { HeroUiHeader } from "../../components/ui/HeroUiHeader"
import { motion, AnimatePresence } from 'framer-motion'
import CustomSelect from "../../components/ui/CustomSelect"
import AppModal from "../../components/app/AppModal"
import {
  useEffect,
  useMemo,
  useState
} from 'react'
import {
  DatePicker
} from '@/components/ui/date-picker'
import {
  AlertTriangle,
  ArrowUpDown,
  Award,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  MoreVertical,
  Printer,
  RefreshCcw,
  Search,
  Stethoscope,
  TrendingUp,
  User,
  UserCheck,
  Users,
  UserX,
  X,
  CheckCircle2,
  RefreshCw
, CalendarCheck, Sparkles} from 'lucide-react'
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
  YAxis
} from 'recharts'
import {
  lmsPresensiService
} from '../../services/lmsPresensiService'
import {
  kelasService
} from '../../services/kelasService'
import PageContainer from '../../components/app/PageContainer'
import AppBreadcrumb from '../../components/app/AppBreadcrumb'
import AppBadge from '../../components/app/AppBadge'
import AppSkeleton from '../../components/app/AppSkeleton'
import AppEmptyState from '../../components/app/AppEmptyState'
import {
  MasterStatsGrid,
  MasterStatCard,
  SquircleActionButton,
  PrintOptionModal
} from '../../components/master-data'
import {
  Input
} from '@/components/ui/input'
import {
  Button
} from '@/components/ui/button'
import {
  Pagination
} from '@/components/ui/pagination'
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow
} from '@/components/ui/table'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card'
import {
  Dialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Backdrop,
  OverlayWrapper
} from '@/components/ui/dialog'
import {
  printCleanTable,
  downloadPdfTable
} from '../../utils/printHelper'
import {
  cn
} from '../../lib/utils'

const MODAL_PAGE_SIZE = 6

const formatAngka = (value) => new Intl.NumberFormat('id-ID').format(Number(value || 0))

const warnaStatus = {
 hadir: '#12a968',
 terlambat: '#8b5cf6',
 izin: '#3182f6',
 sakit: '#ff8a1f',
 alpa: '#ff4668',
}

const toneStyles = {
  emerald: {
    cardBg: '!bg-emerald-100/90 hover:!bg-emerald-200/70 dark:!bg-emerald-950/50 dark:hover:!bg-emerald-950/70 border-emerald-300 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700/80',
    card: '!bg-emerald-100/90 hover:!bg-emerald-200/70 dark:!bg-emerald-950/50 dark:hover:!bg-emerald-950/70 border-emerald-300 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700/80',
    iconBg: '!bg-emerald-600 !text-white shadow-sm dark:!bg-emerald-600 dark:!text-white',
    iconColor: '!text-white',
    badge: 'bg-white/90 text-emerald-800 border-2 border-emerald-300 dark:border-emerald-800 shadow-2xs dark:bg-emerald-900/80 dark:text-emerald-200',
    tag: 'bg-white/90 text-emerald-800 border-2 border-emerald-300 dark:border-emerald-800 shadow-2xs dark:bg-emerald-900/80 dark:text-emerald-200',
    title: 'text-emerald-800 dark:text-emerald-300',
    val: 'text-emerald-800 dark:text-emerald-200',
    sub: 'text-emerald-700/90 dark:text-emerald-300/80',
    cta: 'text-emerald-700 dark:text-emerald-400',
  },
  violet: {
    cardBg: '!bg-purple-100/90 hover:!bg-purple-200/70 dark:!bg-purple-950/50 dark:hover:!bg-purple-950/70 border-purple-300 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700/80',
    card: '!bg-purple-100/90 hover:!bg-purple-200/70 dark:!bg-purple-950/50 dark:hover:!bg-purple-950/70 border-purple-300 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700/80',
    iconBg: '!bg-purple-600 !text-white shadow-sm dark:!bg-purple-600 dark:!text-white',
    iconColor: '!text-white',
    badge: 'bg-white/90 text-purple-800 border border-purple-300 dark:border-purple-800 shadow-2xs dark:bg-purple-900/80 dark:text-purple-200',
    tag: 'bg-white/90 text-purple-800 border border-purple-300 dark:border-purple-800 shadow-2xs dark:bg-purple-900/80 dark:text-purple-200',
    title: 'text-purple-800 dark:text-purple-300',
    val: 'text-purple-800 dark:text-purple-200',
    sub: 'text-purple-700/90 dark:text-purple-300/80',
    cta: 'text-purple-700 dark:text-purple-400',
  },
  purple: {
    cardBg: '!bg-purple-100/90 hover:!bg-purple-200/70 dark:!bg-purple-950/50 dark:hover:!bg-purple-950/70 border-purple-300 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700/80',
    card: '!bg-purple-100/90 hover:!bg-purple-200/70 dark:!bg-purple-950/50 dark:hover:!bg-purple-950/70 border-purple-300 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700/80',
    iconBg: '!bg-purple-600 !text-white shadow-sm dark:!bg-purple-600 dark:!text-white',
    iconColor: '!text-white',
    badge: 'bg-white/90 text-purple-800 border border-purple-300 dark:border-purple-800 shadow-2xs dark:bg-purple-900/80 dark:text-purple-200',
    tag: 'bg-white/90 text-purple-800 border border-purple-300 dark:border-purple-800 shadow-2xs dark:bg-purple-900/80 dark:text-purple-200',
    title: 'text-purple-800 dark:text-purple-300',
    val: 'text-purple-800 dark:text-purple-200',
    sub: 'text-purple-700/90 dark:text-purple-300/80',
    cta: 'text-purple-700 dark:text-purple-400',
  },
  sky: {
    cardBg: '!bg-sky-100/90 hover:!bg-sky-200/70 dark:!bg-sky-950/50 dark:hover:!bg-sky-950/70 border-sky-300 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700/80',
    card: '!bg-sky-100/90 hover:!bg-sky-200/70 dark:!bg-sky-950/50 dark:hover:!bg-sky-950/70 border-sky-300 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700/80',
    iconBg: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20 rounded-2xl',
    iconColor: '!text-white',
    badge: 'bg-white/90 text-sky-800 border border-sky-300 dark:border-sky-800 shadow-2xs dark:bg-sky-900/80 dark:text-sky-200',
    tag: 'bg-white/90 text-sky-800 border border-sky-300 dark:border-sky-800 shadow-2xs dark:bg-sky-900/80 dark:text-sky-200',
    title: 'text-sky-800 dark:text-sky-300',
    val: 'text-sky-800 dark:text-sky-200',
    sub: 'text-sky-700/90 dark:text-sky-300/80',
    cta: 'text-sky-700 dark:text-sky-400',
  },
  blue: {
    cardBg: '!bg-sky-100/90 hover:!bg-sky-200/70 dark:!bg-sky-950/50 dark:hover:!bg-sky-950/70 border-sky-300 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700/80',
    card: '!bg-sky-100/90 hover:!bg-sky-200/70 dark:!bg-sky-950/50 dark:hover:!bg-sky-950/70 border-sky-300 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700/80',
    iconBg: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20 rounded-2xl',
    iconColor: '!text-white',
    badge: 'bg-white/90 text-sky-800 border border-sky-300 dark:border-sky-800 shadow-2xs dark:bg-sky-900/80 dark:text-sky-200',
    tag: 'bg-white/90 text-sky-800 border border-sky-300 dark:border-sky-800 shadow-2xs dark:bg-sky-900/80 dark:text-sky-200',
    title: 'text-sky-800 dark:text-sky-300',
    val: 'text-sky-800 dark:text-sky-200',
    sub: 'text-sky-700/90 dark:text-sky-300/80',
    cta: 'text-sky-700 dark:text-sky-400',
  },
  amber: {
    cardBg: '!bg-amber-100/90 hover:!bg-amber-200/70 dark:!bg-amber-950/50 dark:hover:!bg-amber-950/70 border-amber-300 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700/80',
    card: '!bg-amber-100/90 hover:!bg-amber-200/70 dark:!bg-amber-950/50 dark:hover:!bg-amber-950/70 border-amber-300 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700/80',
    iconBg: '!bg-amber-600 !text-white shadow-sm dark:!bg-amber-600 dark:!text-white',
    iconColor: '!text-white',
    badge: 'bg-white/90 text-amber-800 border border-amber-300 dark:border-amber-800 shadow-2xs dark:bg-amber-900/80 dark:text-amber-200',
    tag: 'bg-white/90 text-amber-800 border border-amber-300 dark:border-amber-800 shadow-2xs dark:bg-amber-900/80 dark:text-amber-200',
    title: 'text-amber-800 dark:text-amber-300',
    val: 'text-amber-800 dark:text-amber-200',
    sub: 'text-amber-700/90 dark:text-amber-300/80',
    cta: 'text-amber-700 dark:text-amber-400',
  },
  rose: {
    cardBg: '!bg-rose-100/90 hover:!bg-rose-200/70 dark:!bg-rose-950/50 dark:hover:!bg-rose-950/70 border-rose-300 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700/80',
    card: '!bg-rose-100/90 hover:!bg-rose-200/70 dark:!bg-rose-950/50 dark:hover:!bg-rose-950/70 border-rose-300 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700/80',
    iconBg: '!bg-rose-600 !text-white shadow-sm dark:!bg-rose-600 dark:!text-white',
    iconColor: '!text-white',
    badge: 'bg-white/90 text-rose-800 border border-rose-300 dark:border-rose-800 shadow-2xs dark:bg-rose-900/80 dark:text-rose-200',
    tag: 'bg-white/90 text-rose-800 border border-rose-300 dark:border-rose-800 shadow-2xs dark:bg-rose-900/80 dark:text-rose-200',
    title: 'text-rose-800 dark:text-rose-300',
    val: 'text-rose-800 dark:text-rose-200',
    sub: 'text-rose-700/90 dark:text-rose-300/80',
    cta: 'text-rose-700 dark:text-rose-400',
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

export default function AttendanceReportPage() {
 const [loading, setLoading] = useState(true)
 const [presensiRows, setPresensiRows] = useState([])
 const [masterClasses, setMasterClasses] = useState([])
 const [unitOptions, setUnitOptions] = useState([])

 const [search, setSearch] = useState('')
 const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
 const [selectedUnitId, setSelectedUnitId] = useState('')
 const [selectedClassId, setSelectedClassId] = useState('')
 const [selectedStatusFilter, setSelectedStatusFilter] = useState('all')

 // State untuk filter Periode (Hari, Minggu, Bulan, Semester, Tahun)
 const [period, setPeriod] = useState('semua')
 const [dateFrom, setDateFrom] = useState('')
 const [dateTo, setDateTo] = useState('')

 const [currentPage, setCurrentPage] = useState(1)
 const [perPage, setPerPage] = useState(10)
 const [sortField, setSortField] = useState('rombel_name')
 const [sortDirection, setSortDirection] = useState('asc')
 const [viewMode, setViewMode] = useState('rombel') // 'rombel' | 'evaluasi'

 const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
 const [selectedDetailRombel, setSelectedDetailRombel] = useState(null)

 // Card Modal State (Summary Card Interactive Datatable Modal)
 const [cardModal, setCardModal] = useState({
 isOpen: false,
 statusKey: 'semua',
 title: '',
 tone: 'emerald',
 searchQuery: '',
 page: 1,
 })

 // ── 1. Fetch Master Options ─────────────────────────────────────────────
 useEffect(() => {
 let active = true
 const fetchOptions = async () => {
 try {
 const opts = await kelasService.getOptions()
 if (!active) return
 const unitsList = opts.units || opts.unit_pendidikan || opts.education_units || []
 setUnitOptions(Array.isArray(unitsList) ? unitsList : [])
 } catch (err) {
 console.error('Failed to load unit options:', err)
 }
 }
 fetchOptions()
 return () => {
 active = false
 }
 }, [])

 // ── 2. Fetch Master Classes & Presensi Data ──────────────────────────────
 useEffect(() => {
 let active = true
 const fetchData = async () => {
 setLoading(true)
 try {
 const [kelasRes, presensiRes] = await Promise.allSettled([
 kelasService.getDaftar({ per_page: 200, unit_pendidikan_id: selectedUnitId || undefined }),
 lmsPresensiService.getReport({
 month: selectedMonth,
 unit_id: selectedUnitId || undefined,
 class_id: selectedClassId || undefined,
 }),
 ])

 if (!active) return

 if (kelasRes.status === 'fulfilled') {
 const rawKelas = kelasRes.value?.data?.data || kelasRes.value?.data || kelasRes.value || []
 setMasterClasses(Array.isArray(rawKelas) ? rawKelas : [])
 } else {
 setMasterClasses([])
 }

 if (presensiRes.status === 'fulfilled') {
 const payload = presensiRes.value?.data
 const rows = payload?.rows || payload?.data?.rows || (Array.isArray(payload) ? payload : [])
 setPresensiRows(Array.isArray(rows) ? rows : [])
 } else {
 setPresensiRows([])
 }
 } catch (err) {
 console.error('Failed to load attendance report data:', err)
 if (active) {
 setMasterClasses([])
 setPresensiRows([])
 }
 } finally {
 if (active) setLoading(false)
 }
 }
 fetchData()
 return () => {
 active = false
 }
 }, [selectedMonth, selectedUnitId, selectedClassId])

 // Filter Presensi Rows Berdasarkan Periode Waktu (Hari, Minggu, Bulan, Semester, Tahun)
 const timeFilteredRows = useMemo(() => {
 let filtered = presensiRows
 if (dateFrom) {
 filtered = filtered.filter((r) => !r.tanggal ? true : r.tanggal >= dateFrom)
 }
 if (dateTo) {
 filtered = filtered.filter((r) => !r.tanggal ? true : r.tanggal <= dateTo)
 }
 return filtered
 }, [presensiRows, dateFrom, dateTo])

 // ── 3. Aggregate Presensi Data per Rombel ────────────────────────────────
 const aggregatedReports = useMemo(() => {
 const classMap = new Map()

 // Populate with Master Classes first
 masterClasses.forEach((cls) => {
 const classId = String(cls.id)
 classMap.set(classId, {
 id: classId,
 rombel_name: cls.nama_kelas || cls.kode_kelas || 'Rombel ' + classId,
 kode_kelas: cls.kode_kelas || '',
 unit_name: cls.unitPendidikan?.name || cls.unit_pendidikan?.name || 'Unit Pendidikan',
 unit_id: cls.unit_pendidikan_id || cls.unit_id || '',
 total_students: Number(cls.jumlah_siswa || cls.total_siswa || cls.siswa_count || 0),
 hadir: 0,
 terlambat: 0,
 sakit: 0,
 izin: 0,
 alpa: 0,
 total_logs: 0,
 student_set: new Set(),
 })
 })

 // Process time-filtered presensi logs
 timeFilteredRows.forEach((row) => {
 const classId = String(
 row.jadwal_pelajaran?.kelas_id || row.siswa?.kelas_id || row.siswa?.kelas?.id || row.kelas_id || 'unassigned'
 )
 const className =
 row.jadwal_pelajaran?.kelas?.nama_kelas || row.siswa?.kelas?.nama_kelas || row.rombel_name || 'Rombel ' + classId
 const unitName =
 row.siswa?.kelas?.unitPendidikan?.name ||
 row.siswa?.educationUnit?.name ||
 row.jadwal_pelajaran?.kelas?.unitPendidikan?.name ||
 'Unit Pendidikan'
 const unitId = row.siswa?.unit_id || row.siswa?.kelas?.unit_pendidikan_id || ''

 if (!classMap.has(classId)) {
 classMap.set(classId, {
 id: classId,
 rombel_name: className,
 kode_kelas: row.jadwal_pelajaran?.kelas?.kode_kelas || '',
 unit_name: unitName,
 unit_id: unitId,
 total_students: 0,
 hadir: 0,
 terlambat: 0,
 sakit: 0,
 izin: 0,
 alpa: 0,
 total_logs: 0,
 student_set: new Set(),
 })
 }

 const item = classMap.get(classId)
 if (row.siswa_id || row.siswa?.id) {
 item.student_set.add(row.siswa_id || row.siswa?.id)
 }

 const status = String(row.status_hadir || '').toLowerCase()
 if (status === 'hadir') item.hadir += 1
 else if (status === 'terlambat') item.terlambat += 1
 else if (status === 'sakit') item.sakit += 1
 else if (status === 'izin') item.izin += 1
 else if (status === 'alpa') item.alpa += 1

 item.total_logs += 1
 })

 // Convert map to list and compute attendance rates
 return Array.from(classMap.values()).map((item) => {
 const studentCount = item.student_set.size > 0 ? item.student_set.size : item.total_students
 const totalAttended = item.hadir + item.terlambat
 const totalLogged = item.total_logs

 let rate = 100
 if (totalLogged > 0) {
 rate = Math.round((totalAttended / totalLogged) * 100)
 } else if (studentCount > 0 && item.alpa > 0) {
 rate = Math.max(0, 100 - Math.round((item.alpa / studentCount) * 100))
 }

 let evalStatus = 'Optimal'
 if (rate < 75) evalStatus = 'Perlu Evaluasi'
 else if (rate < 90) evalStatus = 'Cukup'

 return {
 ...item,
 total_students: studentCount,
 attendance_rate: rate,
 evaluation_status: evalStatus,
 }
 })
 }, [masterClasses, timeFilteredRows])

 // ── 4. Filtering & Sorting ────────────────────────────────────────────────
 const filteredReports = useMemo(() => {
 return aggregatedReports.filter((item) => {
 const term = search.toLowerCase()
 const matchesSearch =
 !term ||
 item.rombel_name.toLowerCase().includes(term) ||
 item.unit_name.toLowerCase().includes(term) ||
 item.kode_kelas.toLowerCase().includes(term)

 const matchesUnit = !selectedUnitId || String(item.unit_id) === String(selectedUnitId)
 const matchesClass = !selectedClassId || String(item.id) === String(selectedClassId)

 let matchesStatus = true
 if (selectedStatusFilter === 'optimal') matchesStatus = item.attendance_rate >= 90
 else if (selectedStatusFilter === 'cukup') matchesStatus = item.attendance_rate >= 75 && item.attendance_rate < 90
 else if (selectedStatusFilter === 'evaluasi') matchesStatus = item.attendance_rate < 75

 return matchesSearch && matchesUnit && matchesClass && matchesStatus
 })
 }, [aggregatedReports, search, selectedUnitId, selectedClassId, selectedStatusFilter])

 // ── 5. Summary Overall Metrics & 5 Colored Cards ────────────────────────
 const overallSummary = useMemo(() => {
 const isFiltered = Boolean(search) || selectedStatusFilter !== 'all' || Boolean(selectedUnitId) || Boolean(selectedClassId)
 let present = 0, late = 0, permission = 0, sick = 0, absent = 0

 if (isFiltered) {
 filteredReports.forEach((r) => {
 present += r.hadir
 late += r.terlambat
 permission += r.izin
 sick += r.sakit
 absent += r.alpa
 })
 } else {
 timeFilteredRows.forEach((r) => {
 const st = String(r.status_hadir || '').toLowerCase()
 if (st === 'hadir') present += 1
 else if (st === 'terlambat') late += 1
 else if (st === 'izin') permission += 1
 else if (st === 'sakit') sick += 1
 else if (st === 'alpa') absent += 1
 })

 // Fallback compute from aggregated rombel if logs count is 0
 if (present + late + permission + sick + absent === 0 && aggregatedReports.length > 0) {
 aggregatedReports.forEach((r) => {
 present += r.hadir
 late += r.terlambat
 permission += r.izin
 sick += r.sakit
 absent += r.alpa
 })
 }
 }

 const total = present + late + permission + sick + absent

 return { present, late, permission, sick, absent, total }
 }, [timeFilteredRows, aggregatedReports, filteredReports, search, selectedStatusFilter, selectedUnitId, selectedClassId])

 const cards = useMemo(
 () => [
 {
 label: 'Hadir',
 statusKey: 'hadir',
 value: overallSummary.present,
 icon: UserCheck,
 tone: 'emerald',
 percent: overallSummary.total > 0 ? (overallSummary.present / overallSummary.total) * 100 : null,
 },
 {
 label: 'Terlambat',
 statusKey: 'terlambat',
 value: overallSummary.late,
 icon: Clock,
 tone: 'violet',
 percent: overallSummary.total > 0 ? (overallSummary.late / overallSummary.total) * 100 : null,
 },
 {
 label: 'Izin',
 statusKey: 'izin',
 value: overallSummary.permission,
 icon: ClipboardCheck,
 tone: 'sky',
 percent: overallSummary.total > 0 ? (overallSummary.permission / overallSummary.total) * 100 : null,
 },
 {
 label: 'Sakit',
 statusKey: 'sakit',
 value: overallSummary.sick,
 icon: Stethoscope,
 tone: 'amber',
 percent: overallSummary.total > 0 ? (overallSummary.sick / overallSummary.total) * 100 : null,
 },
 {
 label: 'Alpha',
 statusKey: 'alpa',
 value: overallSummary.absent,
 icon: UserX,
 tone: 'rose',
 percent: overallSummary.total > 0 ? (overallSummary.absent / overallSummary.total) * 100 : null,
 },
 ],
 [overallSummary]
 )

 const distribution = useMemo(
 () => [
 { name: 'Hadir', value: overallSummary.present, color: warnaStatus.hadir },
 { name: 'Terlambat', value: overallSummary.late, color: warnaStatus.terlambat },
 { name: 'Izin', value: overallSummary.permission, color: warnaStatus.izin },
 { name: 'Sakit', value: overallSummary.sick, color: warnaStatus.sakit },
 { name: 'Alpha', value: overallSummary.absent, color: warnaStatus.alpa },
 ],
 [overallSummary]
 )

 const chartData = useMemo(() => {
 return aggregatedReports.slice(0, 10).map((item) => ({
 label: item.rombel_name.length > 12 ? item.rombel_name.slice(0, 12) + '...' : item.rombel_name,
 hadir: item.hadir + item.terlambat,
 terlambat: item.terlambat,
 izin: item.izin,
 sakit: item.sakit,
 alpa: item.alpa,
 }))
 }, [aggregatedReports])

 const sortedReports = useMemo(() => {
 return [...filteredReports].sort((a, b) => {
 let aVal = a[sortField]
 let bVal = b[sortField]

 if (typeof aVal === 'string') {
 aVal = aVal.toLowerCase()
 bVal = (bVal || '').toLowerCase()
 }

 if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
 if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
 return 0
 })
 }, [filteredReports, sortField, sortDirection])

 const totalPages = Math.ceil(sortedReports.length / perPage) || 1
 const paginatedReports = useMemo(() => {
 const start = (currentPage - 1) * perPage
 return sortedReports.slice(start, start + perPage)
 }, [sortedReports, currentPage, perPage])

 const handleSort = (field) => {
 if (sortField === field) {
 setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
 } else {
 setSortField(field)
 setSortDirection('asc')
 }
 }

 const resetFilters = () => {
 setSearch('')
 setSelectedUnitId('')
 setSelectedClassId('')
 setSelectedStatusFilter('all')
 setPeriod('semua')
 setDateFrom('')
 setDateTo('')
 setCurrentPage(1)
 }

 // Card Modal Handlers
 const openCardModal = (statusKey, label, tone) => {
 setCardModal({
 isOpen: true,
 statusKey,
 title: `Data Presensi Status ${label}`,
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
 if (selectedUnitId) {
 list = list.filter((r) => String(r.jadwal_pelajaran?.kelas?.unit_pendidikan_id || r.siswa?.unit_pendidikan_id || r.unit_id || '') === String(selectedUnitId))
 }
 if (selectedClassId) {
 list = list.filter((r) => String(r.jadwal_pelajaran?.class_id || r.siswa?.kelas_id || r.class_id || '') === String(selectedClassId))
 }
 if (cardModal.statusKey && cardModal.statusKey !== 'semua') {
 list = list.filter((r) => String(r.status_hadir || '').toLowerCase() === cardModal.statusKey)
 }
 if (cardModal.searchQuery.trim()) {
 const q = cardModal.searchQuery.toLowerCase().trim()
 list = list.filter((r) => {
 const name = (r.siswa?.full_name || '').toLowerCase()
 const nis = (r.siswa?.nis || '').toLowerCase()
 const kelas = (r.jadwal_pelajaran?.kelas?.nama_kelas || r.siswa?.kelas?.nama_kelas || '').toLowerCase()
 return name.includes(q) || nis.includes(q) || kelas.includes(q)
 })
 }
 return list
 }, [timeFilteredRows, cardModal.isOpen, cardModal.statusKey, cardModal.searchQuery, selectedUnitId, selectedClassId])

 const modalTotalPages = Math.max(1, Math.ceil(modalRows.length / MODAL_PAGE_SIZE))
 const paginatedModalRows = useMemo(() => {
 return modalRows.slice((cardModal.page - 1) * MODAL_PAGE_SIZE, cardModal.page * MODAL_PAGE_SIZE)
 }, [modalRows, cardModal.page])

 // ── 6. Export Handlers ───────────────────────────────────────────────────
 const handleExportCSV = () => {
 const filename = `Laporan_Presensi_Rombel_${selectedMonth}_${new Date().toISOString().slice(0, 10)}.csv`
 const csvHeader = ['#', 'Rombel/Kelas', 'Unit Pendidikan', 'Total Siswa', 'Hadir (H)', 'Sakit (S)', 'Izin (I)', 'Alpa (A)', 'Persentase (%)', 'Status Evaluasi']
 const csvRows = sortedReports.map((r, i) => [
 i + 1,
 r.rombel_name,
 r.unit_name,
 r.total_students,
 r.hadir + r.terlambat,
 r.sakit,
 r.izin,
 r.alpa,
 `${r.attendance_rate}%`,
 r.evaluation_status,
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
 title: 'Laporan Presensi Rombongan Belajar',
 subtitle: `Periode Bulan: ${selectedMonth} — Unit: ${selectedUnitId ? unitOptions.find((u) => String(u.id) === String(selectedUnitId))?.name || 'Semua Unit' : 'Semua Unit'}`,
 headers: ['#', 'Rombel / Kelas', 'Unit Pendidikan', 'Total Siswa', 'Hadir', 'Sakit', 'Izin', 'Alpa', '% Kehadiran', 'Status Evaluasi'],
 rows: sortedReports.map((r, i) => [
 i + 1,
 r.rombel_name,
 r.unit_name,
 r.total_students,
 r.hadir + r.terlambat,
 r.sakit,
 r.izin,
 r.alpa,
 `${r.attendance_rate}%`,
 r.evaluation_status,
 ]),
 })
 }

 const handleDownloadPDF = () => {
 setIsPrintModalOpen(false)
 downloadPdfTable({
 title: 'Laporan Presensi Rombongan Belajar',
 subtitle: `Periode Bulan: ${selectedMonth}`,
 headers: ['#', 'Rombel / Kelas', 'Unit Pendidikan', 'Total Siswa', 'Hadir', 'Sakit', 'Izin', 'Alpa', '% Kehadiran', 'Status Evaluasi'],
 rows: sortedReports.map((r, i) => [
 i + 1,
 r.rombel_name,
 r.unit_name,
 r.total_students,
 r.hadir + r.terlambat,
 r.sakit,
 r.izin,
 r.alpa,
 `${r.attendance_rate}%`,
 r.evaluation_status,
 ]),
 filename: `Laporan_Presensi_Rombel_${selectedMonth}.pdf`,
 })
 }

 return (
 <PageContainer className="space-y-6 pb-12">
      {/* Navigation Breadcrumb */}
      <div className="mb-2">
        <AppBreadcrumb items={[{ label: 'Absensi', href: '/absensi' }, { label: 'Laporan Absensi Rombel' }]} />
      </div>

      {/* ── Modern Hero Header Card ── */}
      <HeroUiHeader
        title="Laporan Presensi Rombongan Belajar"
        subtitle="Rekapitulasi dan evaluasi kehadiran siswa per rombel, analisis tingkat kehadiran bulanan/semester, dan pencetakan leger absensi resmi."
        badge="Presensi & Kehadiran"
        icon={ClipboardCheck}
        className="mb-6"
      />

 {/* Summary Cards Grid (5 Equal & Colored Cards - Style from LaporanAbsensiPage) */}
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
 {cards.map(({ label, statusKey, value, icon: Icon, tone, percent }) => {
 const style = toneStyles[tone] || toneStyles.emerald
 return (
 <article
                  key={label}
                  onClick={() => openCardModal(statusKey, label, tone)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openCardModal(statusKey, label, tone)}
                  className={`group relative overflow-hidden rounded-xl border p-3.5 sm:p-4 md:p-5 shadow-xs transition-all duration-200 cursor-pointer hover:shadow-md flex flex-col justify-between h-full border-emerald-200/80 dark:border-emerald-800/60 ${style.card || style.cardBg}`}
                  title={`Klik untuk melihat detail data ${label}`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1.5 mb-2.5 sm:mb-3">
                      <div className={`flex size-9 sm:size-10 items-center justify-center rounded-xl shadow-md shrink-0 ${style.iconBox}`}>
                        <Icon className="size-4 sm:size-5" />
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-black shrink-0 ${style.tag || style.badge}`}>
                        {percent !== null && percent !== undefined ? `${percent.toFixed(1)}%` : '—'}
                      </span>
                    </div>

                    <span
                      title={label}
                      className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider block mb-1 line-clamp-2 min-h-[2.4em] leading-snug ${style.title}`}
                    >
                      {label}
                    </span>

                    <strong className={`text-xl sm:text-2xl md:text-3xl font-black tabular-nums tracking-tight block ${style.val}`}>
                      {formatAngka(value)}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold pt-2.5 sm:pt-3 mt-2.5 sm:mt-3 border-t border-emerald-200/80 dark:border-emerald-800/80">
                    <span className={`truncate font-bold ${style.sub}`}>
                      {overallSummary.total > 0 ? `${formatAngka(value)} dari ${formatAngka(overallSummary.total)} data` : 'Belum ada data'}
                    </span>
                    <span className={`inline-flex items-center gap-0.5 font-extrabold group-hover:translate-x-0.5 transition-transform shrink-0 ${style.cta}`}>
                      Detail &rarr;
                    </span>
                  </div>
                </article>
 )
 })}
 </div>

 {/* 3-Column Equal Grid: Filter Laporan, Grafik Kehadiran, & Distribusi (Style from LaporanAbsensiPage) */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
 {/* Col 1: Filter Laporan */}
 <article className="overflow-hidden rounded-xl border border-emerald-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
 <div>
 <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <h2 className="text-base font-bold text-slate-900 dark:text-white">Filter Laporan</h2>
 <button
 type="button"
 onClick={resetFilters}
 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
 >
 Reset Filter
 </button>
 </div>

 <div className="space-y-3">
 <div>
 <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
 Unit Pendidikan
 </label>
 <CustomSelect
 value={selectedUnitId}
 onChange={(e) => {
 setSelectedUnitId(e.target.value)
 setSelectedClassId('')
 setCurrentPage(1)
 }}
 className="w-full h-9 px-3 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
 >
 <option value="">Semua Unit Pendidikan</option>
 {unitOptions.map((unit) => (
 <option key={unit.id} value={unit.id}>
 {unit.name || unit.code} {unit.level ? `(${unit.level})` : ''}
 </option>
 ))}
 </CustomSelect>
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
 Kelas / Rombel
 </label>
 <CustomSelect
 value={selectedClassId}
 onChange={(e) => {
 setSelectedClassId(e.target.value)
 setCurrentPage(1)
 }}
 className="w-full h-9 px-3 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
 >
 <option value="">Semua Kelas</option>
 {masterClasses.map((kelas) => (
 <option key={kelas.id} value={kelas.id}>
 {kelas.nama_kelas || kelas.kode_kelas}
 </option>
 ))}
 </CustomSelect>
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
 Status Evaluasi
 </label>
 <CustomSelect
 value={selectedStatusFilter}
 onChange={(e) => {
 setSelectedStatusFilter(e.target.value)
 setCurrentPage(1)
 }}
 className="w-full h-9 px-3 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
 >
 <option value="all">Semua Status Evaluasi</option>
 <option value="optimal">Optimal (≥ 90%)</option>
 <option value="cukup">Cukup (75% - 89%)</option>
 <option value="evaluasi">Perlu Evaluasi (&lt; 75%)</option>
 </CustomSelect>
 </div>

 {/* Fitur Filter Periode Waktu (Hari, Minggu, Bulan, Semester, Tahun) */}
 <div>
 <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
 Periode Waktu
 </label>
 <CustomSelect
 value={period}
 onChange={(e) => {
 const nextPeriod = e.target.value
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
 className="w-full h-9 px-3 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
 >
 <option value="semua">Semua Periode Data</option>
 <option value="hari">Hari Ini (Per Hari)</option>
 <option value="minggu">7 Hari Terakhir (Per Minggu)</option>
 <option value="bulan">Bulan Ini (Per Bulan)</option>
 <option value="semester">6 Bulan Terakhir (Per Semester)</option>
 <option value="tahun">Tahun Ini (Per Tahun)</option>
 <option value="custom">Rentang Tanggal Kustom</option>
 </CustomSelect>
 </div>

 <div className="grid grid-cols-2 gap-2 pt-1">
 <div>
 <label className="block text-xs font-medium text-slate-500 mb-0.5">Tanggal Mulai</label>
 <DatePicker
 value={dateFrom}
 onChange={(e) => {
 setDateFrom(e.target.value)
 setPeriod('custom')
 setCurrentPage(1)
 }}
 placeholder="Mulai..."
 inputClassName="h-8 text-xs"
 />
 </div>
 <div>
 <label className="block text-xs font-medium text-slate-500 mb-0.5">Tanggal Selesai</label>
 <DatePicker
 value={dateTo}
 onChange={(e) => {
 setDateTo(e.target.value)
 setPeriod('custom')
 setCurrentPage(1)
 }}
 placeholder="Selesai..."
 inputClassName="h-8 text-xs"
 />
 </div>
 </div>
 </div>
 </div>
 </article>

 {/* Col 2: Grafik Kehadiran */}
 <article className="overflow-hidden rounded-xl border border-emerald-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
 <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <h2 className="text-base font-bold text-slate-900 dark:text-white">Grafik Kehadiran Rombel</h2>
 <span className="text-xs font-semibold text-slate-400">Trend Data</span>
 </div>
 <div className="h-64 w-full">
 {loading ? (
 <div className="h-full flex items-center justify-center text-xs text-slate-400">Memuat grafik...</div>
 ) : (
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
 <defs>
 <linearGradient id="hadirGradient" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#12a968" stopOpacity={0.3} />
 <stop offset="100%" stopColor="#12a968" stopOpacity={0} />
 </linearGradient>
 </defs>
 <CartesianGrid stroke="#edf1f5" vertical={false} />
 <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#718096', fontSize: 10 }} />
 <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#718096', fontSize: 10 }} />
 <Tooltip />
 <Area type="monotone" dataKey="hadir" name="Hadir" stroke={warnaStatus.hadir} fill="url(#hadirGradient)" strokeWidth={2} />
 <Area type="monotone" dataKey="terlambat" name="Terlambat" stroke={warnaStatus.terlambat} fill="transparent" strokeWidth={1.5} />
 <Area type="monotone" dataKey="izin" name="Izin" stroke={warnaStatus.izin} fill="transparent" strokeWidth={1.5} />
 <Area type="monotone" dataKey="sakit" name="Sakit" stroke={warnaStatus.sakit} fill="transparent" strokeWidth={1.5} />
 <Area type="monotone" dataKey="alpa" name="Alpha" stroke={warnaStatus.alpa} fill="transparent" strokeWidth={1.5} />
 </AreaChart>
 </ResponsiveContainer>
 )}
 </div>
 </article>

 {/* Col 3: Distribusi Kehadiran */}
 <article className="overflow-hidden rounded-xl border border-emerald-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
 <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <h2 className="text-base font-bold text-slate-900 dark:text-white">Distribusi Kehadiran</h2>
 <span className="text-xs font-bold text-slate-500">{formatAngka(overallSummary.total)} Total</span>
 </div>
 <div className="flex flex-col items-center justify-center flex-1">
 <div className="relative w-48 h-48 sm:w-52 sm:h-52 mb-3 flex items-center justify-center">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie data={distribution} dataKey="value" innerRadius="62%" outerRadius="88%" paddingAngle={2}>
 {distribution.map((item) => <Cell key={item.name} fill={item.color} />)}
 </Pie>
 </PieChart>
 </ResponsiveContainer>
 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
 <strong className="text-xl font-black text-slate-900 dark:text-white">{formatAngka(overallSummary.total)}</strong>
 <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total</span>
 </div>
 </div>

 <div className="w-full flex flex-col gap-2 text-xs">
										{distribution.map((item) => (
											<div key={item.name} className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-emerald-200/80 dark:border-emerald-800/60">
												<div className="flex items-center gap-2 min-w-0">
													<span className="size-2.5 rounded-full shrink-0" style={{ background: item.color }} />
													<span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{item.name}</span>
												</div>
												<span className="text-xs font-black text-slate-900 dark:text-white tabular-nums ml-1 shrink-0">{formatAngka(item.value)}</span>
											</div>
 ))}
 </div>
 </div>
 </article>
 </div>

 {/* ── Datatable Outer Container (HeroUI Emerald Datatable - 5 Columns Standard) ── */}
      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
        {/* Toolbar Baris 1: Judul, Subtitle, Pill Count, Mode Switcher, & Action Buttons */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-200/90 dark:border-emerald-800/60">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Rekap Absensi Rombongan Belajar
                </h2>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-black text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  Total {sortedReports.length} Rombel
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                Pemantauan dan rekapitulasi presensi siswa per rombongan belajar & unit pendidikan
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Group By Selector Pill */}
              <div className="flex items-center gap-1 p-1 bg-emerald-50/70 dark:bg-slate-900/60 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
                <button
                  type="button"
                  onClick={() => { setViewMode('rombel'); setCurrentPage(1); }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                    viewMode === 'rombel'
                      ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  )}
                >
                  <BookOpen className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Berdasarkan Rombel</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setViewMode('evaluasi'); setCurrentPage(1); }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                    viewMode === 'evaluasi'
                      ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  )}
                >
                  <Award className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Berdasarkan Status Evaluasi</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-nowrap shrink-0">
                <SquircleActionButton
                  variant="export"
                  label="Export CSV"
                  onClick={handleExportCSV}
                />
                <SquircleActionButton
                  variant="print"
                  label="Cetak Data"
                  onClick={() => setIsPrintModalOpen(true)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar Baris 2: Search Input & Per-Page Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-emerald-50/20 dark:bg-slate-900/40 border-b border-emerald-200/80 dark:border-emerald-800/60">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-600 dark:text-emerald-400" />
            <Input
              type="text"
              placeholder="Cari nama rombel / kelas / unit..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 text-xs font-semibold rounded-xl border border-emerald-200/90 bg-emerald-50/20 text-slate-800 placeholder:text-emerald-700/50 dark:border-emerald-800/60 dark:bg-emerald-950/20 dark:text-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Per Halaman:</span>
            <div className="relative">
              <CustomSelect
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="h-9 cursor-pointer appearance-none rounded-xl border border-emerald-200/90 bg-emerald-50/20 pl-3 pr-8 text-xs font-semibold text-slate-800 shadow-2xs dark:border-emerald-800/60 dark:bg-emerald-950/20 dark:text-slate-200"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </CustomSelect>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Viewport Tabel Edge-to-Edge */}
        <div className="w-full overflow-x-auto">
          {loading ? (
            <div className="py-6">
              <AppSkeleton rows={6} />
            </div>
          ) : paginatedReports.length === 0 ? (
            <div className="py-8">
              <AppEmptyState
                title="Tidak ada data presensi rombel"
                description="Belum ada data rekapitulasi kehadiran rombel yang sesuai dengan filter pilihan Anda."
              />
            </div>
          ) : (
            <TableRoot className="w-full text-left border-collapse text-xs">
              <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
                <TableRow>
                  {/* Kolom 1: Rombongan Belajar (Nama & Unit) */}
                  <TableHead
                    className="py-3 px-4 font-extrabold text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200 cursor-pointer select-none"
                    onClick={() => handleSort('rombel_name')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Rombongan Belajar</span>
                      <ArrowUpDown className="size-3.5 text-emerald-700 dark:text-emerald-400" />
                    </div>
                  </TableHead>

                  {/* Kolom 2: Total Siswa */}
                  <TableHead
                    className="py-3 px-4 text-center font-extrabold text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200 cursor-pointer select-none"
                    onClick={() => handleSort('total_students')}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Total Siswa</span>
                      <ArrowUpDown className="size-3.5 text-emerald-700 dark:text-emerald-400" />
                    </div>
                  </TableHead>

                  {/* Kolom 3: Rekap Kehadiran (H / S / I / A) */}
                  <TableHead className="py-3 px-4 text-center font-extrabold text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">
                    Rekap Presensi (H • S • I • A)
                  </TableHead>

                  {/* Kolom 4: Tingkat Kehadiran & Status Evaluasi */}
                  <TableHead
                    className="py-3 px-4 text-center font-extrabold text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200 cursor-pointer select-none"
                    onClick={() => handleSort('attendance_rate')}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Tingkat Presensi</span>
                      <ArrowUpDown className="size-3.5 text-emerald-700 dark:text-emerald-400" />
                    </div>
                  </TableHead>

                  {/* Kolom 5: Aksi (Tanpa Label Header) */}
                  <TableHead className="py-3 px-4 w-24 text-right select-none" />
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                {paginatedReports.map((item) => {
                  const rate = item.attendance_rate
                  const evalVariant = rate >= 90 ? 'success' : rate >= 75 ? 'warning' : 'danger'

                  return (
                    <TableRow key={item.id} className="hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 transition-colors">
                      {/* Kolom 1: Rombel & Unit */}
                      <TableCell className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => setSelectedDetailRombel(item)}
                          className="font-extrabold text-slate-900 dark:text-white text-xs border-b border-dashed border-slate-400/60 hover:border-emerald-600 transition-colors cursor-pointer text-left block"
                        >
                          {item.rombel_name}
                        </button>
                        <div className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 mt-0.5">
                          {item.unit_name}
                        </div>
                      </TableCell>

                      {/* Kolom 2: Total Siswa */}
                      <TableCell className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-300 text-xs">
                        <span className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {item.total_students} Siswa
                        </span>
                      </TableCell>

                      {/* Kolom 3: Rekap Presensi */}
                      <TableCell className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold">
                          <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60" title="Hadir">
                            H: {item.hadir + item.terlambat}
                          </span>
                          <span className="rounded-md bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60" title="Sakit">
                            S: {item.sakit}
                          </span>
                          <span className="rounded-md bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60" title="Izin">
                            I: {item.izin}
                          </span>
                          <span className="rounded-md bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60" title="Alpa">
                            A: {item.alpa}
                          </span>
                        </div>
                      </TableCell>

                      {/* Kolom 4: Tingkat Presensi & Evaluasi */}
                      <TableCell className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <span className="font-black text-slate-900 dark:text-white text-sm">
                            {rate}%
                          </span>
                          <AppBadge
                            variant={evalVariant}
                            className="hover:scale-105 transition-transform cursor-pointer"
                            onClick={() => setSelectedDetailRombel(item)}
                          >
                            {item.evaluation_status}
                          </AppBadge>
                        </div>
                      </TableCell>

                      {/* Kolom 5: Aksi (Tanpa Label Header) */}
                      <TableCell className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedDetailRombel(item)}
                            className="inline-flex items-center gap-1 rounded-lg border border-sky-300 bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700 hover:bg-sky-100 dark:border-sky-700 dark:bg-sky-950/60 dark:text-sky-300 transition-all cursor-pointer shadow-2xs"
                            title="Lihat Detail Rombel"
                          >
                            <Eye className="size-3.5 text-sky-600 dark:text-sky-400" />
                            <span>Detail</span>
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </TableRoot>
          )}
        </div>

        {/* Footer Pagination */}
        <div className="w-full border-t border-emerald-200/80 bg-emerald-50/30 px-4 py-3 sm:px-6 dark:border-emerald-800/60 dark:bg-emerald-950/20">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            sideLayout="full"
          />
        </div>
      </div>

      {/* ── Summary Card Interactive Datatable Modal (HeroUI Harmonized Modal) ── */}
      <AppModal
        isOpen={cardModal.isOpen}
        onClose={closeCardModal}
        icon={ClipboardCheck}
        title={cardModal.title}
        badge="Log Presensi"
        maxWidth="max-w-4xl"
        zIndex={50}
        headerActions={
          <AppBadge variant={cardModal.tone === 'rose' ? 'danger' : cardModal.tone === 'amber' ? 'warning' : 'success'}>
            {modalRows.length} Data Log
          </AppBadge>
        }
        footer={
          <div className="flex items-center justify-between w-full gap-2">
            <span className="text-xs text-slate-500 font-medium">
              Menampilkan {modalRows.length ? (cardModal.page - 1) * MODAL_PAGE_SIZE + 1 : 0}–{Math.min(cardModal.page * MODAL_PAGE_SIZE, modalRows.length)} dari {modalRows.length} data
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 mr-4">
                <button
                  type="button"
                  disabled={cardModal.page === 1}
                  onClick={() => setCardModal((prev) => ({ ...prev, page: prev.page - 1 }))}
                  className="p-1 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-semibold px-2 text-slate-700 dark:text-slate-300">
                  {cardModal.page} / {modalTotalPages}
                </span>
                <button
                  type="button"
                  disabled={cardModal.page === modalTotalPages}
                  onClick={() => setCardModal((prev) => ({ ...prev, page: prev.page + 1 }))}
                  className="p-1 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={closeCardModal}
                className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black border border-slate-300 dark:border-slate-700 transition-all active:scale-95 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        }
      >
        {/* Modal Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-emerald-200/70 dark:border-emerald-800/60">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <input
              type="text"
              placeholder="Cari nama siswa, NIS, atau kelas..."
              value={cardModal.searchQuery}
              onChange={(e) => setCardModal((prev) => ({ ...prev, searchQuery: e.target.value, page: 1 }))}
              className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {cardModal.searchQuery && (
              <button
                type="button"
                onClick={() => setCardModal((prev) => ({ ...prev, searchQuery: '', page: 1 }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Modal Datatable */}
        <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
              <tr>
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Siswa</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Mata Pelajaran</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
              {paginatedModalRows.length > 0 ? (
                paginatedModalRows.map((row, idx) => {
                  const studentName = row.siswa?.full_name || row.siswa_name || 'Siswa'
                  const studentNis = row.siswa?.nis || '-'
                  const kelasName = row.jadwal_pelajaran?.kelas?.nama_kelas || row.siswa?.kelas?.nama_kelas || 'Rombel'
                  const status = String(row.status_hadir || '').toLowerCase()

                  return (
                    <tr key={row.id || idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-500">
                        {(cardModal.page - 1) * MODAL_PAGE_SIZE + idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{studentName}</div>
                        <div className="text-[10px] text-slate-400">NIS: {studentNis}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {kelasName}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {row.tanggal || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        {row.jadwal_pelajaran?.subject?.name || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <AppBadge variant={status === 'hadir' ? 'success' : status === 'alpa' ? 'danger' : 'warning'}>
                          {status.toUpperCase()}
                        </AppBadge>
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-md truncate">
                        {row.catatan || row.keterangan || '-'}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 font-medium">
                    {cardModal.searchQuery ? 'Tidak ada data presensi yang cocok dengan pencarian.' : 'Belum ada data pada kategori ini.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AppModal>

      {/* ── Modal Detail Rincian Rombel (HeroUI Harmonized Modal) ── */}
      <AppModal
        isOpen={Boolean(selectedDetailRombel)}
        onClose={() => setSelectedDetailRombel(null)}
        icon={
          <span className="font-extrabold text-base text-white">
            {selectedDetailRombel?.kode_kelas || 'R'}
          </span>
        }
        badge="Rincian Kelas"
        title={selectedDetailRombel?.rombel_name || ''}
        description={selectedDetailRombel ? `${selectedDetailRombel.unit_name} — Periode: ${selectedMonth}` : ''}
        maxWidth="max-w-xl"
        zIndex={50}
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <button
              type="button"
              onClick={() => setSelectedDetailRombel(null)}
              className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black border border-slate-300 dark:border-slate-700 transition-all active:scale-95 cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedDetailRombel(null)
                setIsPrintModalOpen(true)
              }}
              className="inline-flex items-center gap-2 h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-black text-white shadow-md shadow-emerald-600/20 border-2 border-emerald-600 transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="size-3.5" />
              <span>Cetak Laporan Rombel</span>
            </button>
          </div>
        }
      >
        {selectedDetailRombel && (
          <>
            {/* Progress Bar Persentase Kehadiran */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">Tingkat Kehadiran Rombel</span>
                <span className="text-[#059669] dark:text-[#10B981] text-sm font-black">
                  {selectedDetailRombel.attendance_rate}% ({selectedDetailRombel.evaluation_status})
                </span>
              </div>
              <div className="h-3.5 w-full rounded-full bg-emerald-50 dark:bg-emerald-950/40 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    selectedDetailRombel.attendance_rate >= 90
                      ? 'bg-emerald-500'
                      : selectedDetailRombel.attendance_rate >= 75
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${selectedDetailRombel.attendance_rate}%` }}
                />
              </div>
            </div>

            {/* Grid Metric Cards Detail */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
                <span className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Total Hadir (H)
                </span>
                <span className="text-xl font-black text-emerald-900 dark:text-emerald-200">
                  {selectedDetailRombel.hadir + selectedDetailRombel.terlambat}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
                <span className="block text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                  Sakit (S)
                </span>
                <span className="text-xl font-black text-blue-900 dark:text-blue-200">
                  {selectedDetailRombel.sakit}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
                <span className="block text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  Izin (I)
                </span>
                <span className="text-xl font-black text-amber-900 dark:text-amber-200">
                  {selectedDetailRombel.izin}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
                <span className="block text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                  Alpa (A)
                </span>
                <span className="text-xl font-black text-rose-900 dark:text-rose-200">
                  {selectedDetailRombel.alpa}
                </span>
              </div>
            </div>

            {/* Summary / Rekomendasi Evaluasi */}
            <div className="p-3.5 rounded-xl border border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-slate-900 space-y-1 text-xs">
              <h5 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600" /> Rekomendasi Evaluasi Kehadiran:
              </h5>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {selectedDetailRombel.attendance_rate >= 90
                  ? 'Tingkat kehadiran rombel ini sangat baik dan optimal. Pertahankan konsistensi presensi kelas.'
                  : selectedDetailRombel.attendance_rate >= 75
                  ? 'Tingkat kehadiran rombel cukup memadai, tetapi disarankan wali kelas memantau siswa yang berulang kali izin/sakit.'
                  : 'Tingkat kehadiran rombel rendah (perlu perhatian khusus). Diperlukan koordinasi wali kelas dan bimbingan konseling untuk penanganan presensi.'}
              </p>
            </div>
          </>
        )}
      </AppModal>

      {/* Modal Opsi Cetak & Unduh PDF */}
 <PrintOptionModal
 isOpen={isPrintModalOpen}
 onClose={() => setIsPrintModalOpen(false)}
 onPrint={handlePrintClean}
 onDownload={handleDownloadPDF}
 title="Laporan Presensi Rombel"
 />
 </PageContainer>
 )
}
