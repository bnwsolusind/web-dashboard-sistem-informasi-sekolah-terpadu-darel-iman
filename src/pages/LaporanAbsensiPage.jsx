import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ActionDropdown from '../components/app/ActionDropdown'
import {
  BookOpen,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Home,
  MoreVertical,
  Printer,
  RefreshCcw,
  Search,
  Stethoscope,
  Upload,
  User,
  UserCheck,
  UserX,
  X,
  Sparkles,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Download1, Upload1 } from '@tailgrids/icons'
import { PrintOptionModal } from '../components/master-data'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { cn } from '../lib/utils'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../components/tailgrids/core/hover-card'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { exportCsv } from '../components/reports/ReportKit'
import { reportService } from '../services/reportService'
import { educationUnitService } from '../services/educationUnitService'
import { kelasService } from '../services/kelasService'
import { studentService } from '../services/studentService'
import PersonIdentityCell from '../components/ui/PersonIdentityCell'
import { Avatar, AvatarFallback, AvatarImage } from '../components/tailgrids/core/avatar'
import {
  Dialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/tailgrids/core/dialog'
import { Badge } from '../components/tailgrids/core/badge'
import { Button } from '../components/tailgrids/core/button'
import { Backdrop, OverlayWrapper } from '../components/tailgrids/core/overlay'

const PAGE_SIZE = 5
const MODAL_PAGE_SIZE = 6

const formatAngka = (value) => new Intl.NumberFormat('id-ID').format(Number(value || 0))
const normalisasiStatus = (status = '') => status.toLowerCase()
const statusLabel = { hadir: 'Hadir', terlambat: 'Terlambat', izin: 'Izin', sakit: 'Sakit', alpa: 'Alpha' }
const formatTanggal = (value) => {
  if (!value) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
}

const exportDatatable = (rowsToExport, format = 'csv', filename = 'laporan-absensi') => {
  if (!rowsToExport || rowsToExport.length === 0) return

  const exportColumns = [
    { label: 'No', export: (_, idx) => idx + 1 },
    { label: 'NIS', export: (r) => r.siswa?.nis || '-' },
    { label: 'NISN', export: (r) => r.siswa?.nisn || '-' },
    { label: 'Nama Siswa', export: (r) => r.siswa?.full_name || '-' },
    { label: 'Unit Pendidikan', export: (r) => r.siswa?.educationUnit?.name || r.siswa?.kelas?.unit_pendidikan?.name || getUnitName(r) },
    { label: 'Kelas & Rombel', export: (r) => r.siswa?.kelas?.nama_kelas || getNamaKelas(r) },
    { label: 'Tanggal', export: (r) => formatTanggal(r.tanggal) },
    { label: 'Mata Pelajaran', export: (r) => r.jadwal_pelajaran?.subject?.name || '-' },
    { label: 'Status Presensi', export: (r) => statusLabel[normalisasiStatus(r.status_hadir)] || r.status_hadir || '-' },
    { label: 'Catatan', export: (r) => r.catatan || r.keterangan || '-' },
  ]

  const escape = (val) => `"${String(val ?? '').replaceAll('"', '""')}"`
  const headerLine = exportColumns.map((col) => escape(col.label)).join(',')
  const dataLines = rowsToExport.map((row, idx) => exportColumns.map((col) => escape(col.export(row, idx))).join(','))
  const fileContent = `\uFEFF${[headerLine, ...dataLines].join('\n')}`

  let mimeType = 'text/csv;charset=utf-8'
  let ext = '.csv'
  if (format === 'xlsx') {
    mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ext = '.xlsx'
  } else if (format === 'xls') {
    mimeType = 'application/vnd.ms-excel'
    ext = '.xls'
  }

  const blob = new Blob([fileContent], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}${ext}`
  link.click()
  URL.revokeObjectURL(url)
}

const parseImportedContent = (text) => {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) throw new Error('File harus memiliki header dan minimal 1 baris data.')
  const delimiter = lines[0].includes(';') && !lines[0].includes(',') ? ';' : ','
  const parseLine = (line) => {
    const values = []
    let val = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      if (c === '"' && line[i + 1] === '"' && inQuotes) { val += '"'; i++ }
      else if (c === '"') inQuotes = !inQuotes
      else if (c === delimiter && !inQuotes) { values.push(val.trim()); val = '' }
      else val += c
    }
    values.push(val.trim())
    return values
  }

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase())
  return lines.slice(1).map((line) => {
    const vals = parseLine(line)
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']))
  })
}

const getUnitName = (row) =>
  row.jadwal_pelajaran?.kelas?.unit_pendidikan?.name ||
  row.siswa?.educationUnit?.name ||
  row.siswa?.kelas?.unit_pendidikan?.name ||
  row.siswa?.educationUnit?.code ||
  '-'

const getNamaKelas = (row) =>
  row.jadwal_pelajaran?.kelas?.nama_kelas ||
  row.siswa?.kelas?.nama_kelas ||
  '-'

const columns = [
  { key: 'tanggal', label: 'Tanggal' },
  { key: 'siswa', label: 'Siswa', export: (row) => row.siswa?.full_name },
  { key: 'nis', label: 'NIS', export: (row) => row.siswa?.nis },
  { key: 'unit', label: 'Unit Pendidikan', export: (row) => getUnitName(row) },
  { key: 'kelas', label: 'Kelas', export: (row) => getNamaKelas(row) },
  { key: 'mapel', label: 'Mata Pelajaran', export: (row) => row.jadwal_pelajaran?.subject?.name },
  { key: 'status_hadir', label: 'Status' },
  { key: 'catatan', label: 'Catatan' },
]

const warnaStatus = {
  hadir: '#12a968',
  terlambat: '#8b5cf6',
  izin: '#3182f6',
  sakit: '#ff8a1f',
  alpa: '#ff4668',
}

const getBadgeColor = (status) => {
  switch (status) {
    case 'hadir': return 'success'
    case 'terlambat': return 'violet'
    case 'izin': return 'cyan'
    case 'sakit': return 'warning'
    case 'alpa': return 'error'
    default: return 'primary'
  }
}

const MODERN_CARD_TONES = {
  emerald: {
    card: 'border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
    glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
    iconBox: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/30',
    tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    title: 'text-emerald-700 dark:text-emerald-400',
    val: 'text-emerald-700 dark:text-emerald-300',
    sub: 'text-emerald-600/80 dark:text-emerald-400/80',
    cta: 'text-emerald-600 dark:text-emerald-400',
  },
  violet: {
    card: 'border-violet-300/70 bg-gradient-to-br from-violet-50 via-purple-50/60 to-white hover:border-violet-400 dark:border-violet-700/50 dark:from-violet-950/40 dark:via-purple-950/20 dark:to-slate-900',
    glow: 'bg-violet-400/20 group-hover:bg-violet-400/30',
    iconBox: 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-violet-500/30',
    tag: 'bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300',
    title: 'text-violet-700 dark:text-violet-400',
    val: 'text-violet-700 dark:text-violet-300',
    sub: 'text-violet-600/80 dark:text-violet-400/80',
    cta: 'text-violet-600 dark:text-violet-400',
  },
  sky: {
    card: 'border-sky-300/70 bg-gradient-to-br from-sky-50 via-blue-50/60 to-white hover:border-sky-400 dark:border-sky-700/50 dark:from-sky-950/40 dark:via-blue-950/20 dark:to-slate-900',
    glow: 'bg-sky-400/20 group-hover:bg-sky-400/30',
    iconBox: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sky-500/30',
    tag: 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300',
    title: 'text-sky-700 dark:text-sky-400',
    val: 'text-sky-700 dark:text-sky-300',
    sub: 'text-sky-600/80 dark:text-sky-400/80',
    cta: 'text-sky-600 dark:text-sky-400',
  },
  blue: {
    card: 'border-blue-300/70 bg-gradient-to-br from-blue-50 via-cyan-50/60 to-white hover:border-blue-400 dark:border-blue-700/50 dark:from-blue-950/40 dark:via-cyan-950/20 dark:to-slate-900',
    glow: 'bg-blue-400/20 group-hover:bg-blue-400/30',
    iconBox: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-blue-500/30',
    tag: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
    title: 'text-blue-700 dark:text-blue-400',
    val: 'text-blue-700 dark:text-blue-300',
    sub: 'text-blue-600/80 dark:text-blue-400/80',
    cta: 'text-blue-600 dark:text-blue-400',
  },
  amber: {
    card: 'border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
    glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
    iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/30',
    tag: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    title: 'text-amber-700 dark:text-amber-400',
    val: 'text-amber-700 dark:text-amber-300',
    sub: 'text-amber-600/80 dark:text-amber-400/80',
    cta: 'text-amber-600 dark:text-amber-400',
  },
  rose: {
    card: 'border-rose-300/70 bg-gradient-to-br from-rose-50 via-pink-50/60 to-white hover:border-rose-400 dark:border-rose-700/50 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-slate-900',
    glow: 'bg-rose-400/20 group-hover:bg-rose-400/30',
    iconBox: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-rose-500/30',
    tag: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
    title: 'text-rose-700 dark:text-rose-400',
    val: 'text-rose-700 dark:text-rose-300',
    sub: 'text-rose-600/80 dark:text-rose-400/80',
    cta: 'text-rose-600 dark:text-rose-400',
  },
}

function rentangPeriode(period, current) {
  if (period === 'semua') {
    return { ...current, date_from: '', date_to: '', period }
  }
  const akhir = new Date()
  const awal = new Date()
  if (period === 'minggu') awal.setDate(akhir.getDate() - 6)
  else if (period === 'bulan') awal.setDate(1)
  else awal.setMonth(akhir.getMonth() - 5, 1)
  const iso = (date) => date.toISOString().slice(0, 10)
  return { ...current, date_from: iso(awal), date_to: iso(akhir), period }
}

// Simulated rows removed: pure database report
const buildSimulatedAttendanceRows = () => []

export default function LaporanAbsensiPage() {
  const [filters, setFilters] = useState({ unit_id: '', class_id: '', date_from: '', date_to: '', status: '', subject_id: '' })
  const [draft, setDraft] = useState({ ...filters, period: 'semua' })
  const [report, setReport] = useState({ summary: {}, rows: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [selectedRow, setSelectedRow] = useState(null)
  const [notice, setNotice] = useState('')
  const [unitList, setUnitList] = useState([])
  const [classList, setClassList] = useState([])
  const [studentList, setStudentList] = useState([])
  const [selectedStudentProfile, setSelectedStudentProfile] = useState(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState('xlsx')
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [printOptionModalOpen, setPrintOptionModalOpen] = useState(false)
  const [groupByMode, setGroupByMode] = useState('siswa') // 'siswa' | 'subject'
  const [selectedSubjectGroup, setSelectedSubjectGroup] = useState(null)
  const [selectedStudentGroup, setSelectedStudentGroup] = useState(null)
  const importInputRef = useRef(null)

  // Modal State for Summary Cards
  const [cardModal, setCardModal] = useState({
    isOpen: false,
    statusKey: 'semua',
    title: '',
    tone: 'green',
    searchQuery: '',
    page: 1,
  })

  // Load Unit Pendidikan Options
  useEffect(() => {
    educationUnitService.getDaftar({ per_page: 100 })
      .then((res) => {
        const list = res?.data?.data || res?.data || res || []
        if (Array.isArray(list)) {
          setUnitList(list)
          if (list.length === 1 && !draft.unit_id) {
            updateDraftAndFilter({ ...draft, unit_id: list[0].id, class_id: '' })
          }
        }
      })
      .catch(() => {})
  }, [])

  // Load Kelas Options scoped to selected unit
  useEffect(() => {
    kelasService.getDaftar({ per_page: 100, unit_pendidikan_id: draft.unit_id || undefined, status: 'Aktif' })
      .then((res) => {
        const list = res?.data?.data || res?.data || res || []
        if (Array.isArray(list)) setClassList(list)
      })
      .catch(() => {})
  }, [draft.unit_id])

  // Load Real Active Students across units
  useEffect(() => {
    studentService.getDaftar({ per_page: 500 })
      .then((res) => {
        const list = res?.data?.data || res?.data || res || []
        if (Array.isArray(list) && list.length > 0) setStudentList(list)
        else setStudentList([])
      })
      .catch(() => setStudentList([]))
  }, [])

  const openStudentProfile = (student) => {
    if (!student) return
    setSelectedStudentProfile(student)
    setIsProfileModalOpen(true)
  }

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value))
      const data = await reportService.attendance(params)
      setReport(data || { summary: {}, rows: [] })
    } catch (err) {
      setError(err?.response?.data?.message || 'Laporan absensi gagal dimuat.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    if (!notice) return undefined
    const timeout = window.setTimeout(() => setNotice(''), 2600)
    return () => window.clearTimeout(timeout)
  }, [notice])

  const rawRows = useMemo(() => {
    return Array.isArray(report.rows) ? report.rows : []
  }, [report.rows])

  const rows = useMemo(() => {
    let result = rawRows

    // 1. Filter by Unit Pendidikan
    if (filters.unit_id) {
      const targetUnit = unitList.find((u) => String(u.id) === String(filters.unit_id))
      const targetName = targetUnit?.name || targetUnit?.nama_unit || ''

      result = result.filter((row) => {
        const studentUnitId = row.siswa?.unit_id || row.siswa?.education_unit_id || row.siswa?.educationUnit?.id || row.siswa?.kelas?.unit_pendidikan_id
        const scheduleUnitId = row.jadwal_pelajaran?.kelas?.unit_pendidikan_id || row.jadwal_pelajaran?.kelas?.unit_pendidikan?.id
        const studentUnitName = row.siswa?.educationUnit?.name || row.siswa?.kelas?.unit_pendidikan?.name

        const matchesStudentId = studentUnitId && String(studentUnitId) === String(filters.unit_id)
        const matchesScheduleId = scheduleUnitId && String(scheduleUnitId) === String(filters.unit_id)
        const matchesStudentName = targetName && studentUnitName === targetName

        return matchesStudentId || matchesScheduleId || matchesStudentName
      })
    }

    // 2. Filter by Kelas / Rombel
    if (filters.class_id) {
      const targetClassObj = classList.find((c) => String(c.id) === String(filters.class_id))
      const targetClassName = targetClassObj?.nama_kelas || targetClassObj?.name || targetClassObj?.kode_kelas || ''

      result = result.filter((row) => {
        const scheduleClassId = row.jadwal_pelajaran?.kelas_id || row.jadwal_pelajaran?.kelas?.id
        const studentClassId = row.siswa?.kelas_id || row.siswa?.kelas?.id
        const studentClassName = row.siswa?.kelas?.nama_kelas || row.siswa?.kelas?.kode_kelas
        const scheduleClassName = row.jadwal_pelajaran?.kelas?.nama_kelas

        const matchesClassId = (scheduleClassId && String(scheduleClassId) === String(filters.class_id)) || (studentClassId && String(studentClassId) === String(filters.class_id))
        const matchesClassName = targetClassName && (studentClassName === targetClassName || scheduleClassName === targetClassName)

        return matchesClassId || matchesClassName
      })
    }

    // 3. Filter by Mata Pelajaran
    if (filters.subject_id) {
      result = result.filter((row) => {
        const subjectId = row.jadwal_pelajaran?.subject?.id || row.jadwal_pelajaran?.subject_id
        const subjectName = row.jadwal_pelajaran?.subject?.name
        return String(subjectId) === String(filters.subject_id) || String(subjectName) === String(filters.subject_id)
      })
    }

    // 4. Filter by Status Presensi
    if (filters.status) {
      result = result.filter((row) => normalisasiStatus(row.status_hadir) === normalisasiStatus(filters.status))
    }

    // 5. Filter by Tanggal (date_from & date_to)
    if (filters.date_from) {
      result = result.filter((row) => !row.tanggal || row.tanggal >= filters.date_from)
    }
    if (filters.date_to) {
      result = result.filter((row) => !row.tanggal || row.tanggal <= filters.date_to)
    }

    return result
  }, [rawRows, filters, unitList, classList])

  const summary = useMemo(() => {
    return {
      total: rows.length,
      present: rows.filter((r) => normalisasiStatus(r.status_hadir) === 'hadir').length,
      late: rows.filter((r) => normalisasiStatus(r.status_hadir) === 'terlambat').length,
      permission: rows.filter((r) => normalisasiStatus(r.status_hadir) === 'izin').length,
      sick: rows.filter((r) => normalisasiStatus(r.status_hadir) === 'sakit').length,
      absent: rows.filter((r) => normalisasiStatus(r.status_hadir) === 'alpa').length,
    }
  }, [rows])

  const total = Number(summary.total || 0)

  const subjectOptions = useMemo(() => {
    const subjects = new Map()
    rawRows.forEach((row) => {
      const subject = row.jadwal_pelajaran?.subject
      if (subject?.id) subjects.set(String(subject.id), subject.name)
    })
    return [...subjects.entries()]
  }, [rawRows])

  const cards = useMemo(() => [
    { label: 'Hadir', statusKey: 'hadir', value: summary.present, icon: UserCheck, tone: 'emerald', percent: total ? (Number(summary.present || 0) / total) * 100 : 0 },
    { label: 'Terlambat', statusKey: 'terlambat', value: summary.late, icon: Clock, tone: 'violet', percent: total ? (Number(summary.late || 0) / total) * 100 : 0 },
    { label: 'Izin', statusKey: 'izin', value: summary.permission, icon: ClipboardCheck, tone: 'sky', percent: total ? (Number(summary.permission || 0) / total) * 100 : 0 },
    { label: 'Sakit', statusKey: 'sakit', value: summary.sick, icon: Stethoscope, tone: 'amber', percent: total ? (Number(summary.sick || 0) / total) * 100 : 0 },
    { label: 'Alpha', statusKey: 'alpa', value: summary.absent, icon: UserX, tone: 'rose', percent: total ? (Number(summary.absent || 0) / total) * 100 : 0 },
  ], [summary, total])

  const distribution = useMemo(() => [
    { name: 'Hadir', value: Number(summary.present || 0), color: warnaStatus.hadir },
    { name: 'Terlambat', value: Number(summary.late || 0), color: warnaStatus.terlambat },
    { name: 'Izin', value: Number(summary.permission || 0), color: warnaStatus.izin },
    { name: 'Sakit', value: Number(summary.sick || 0), color: warnaStatus.sakit },
    { name: 'Alpha', value: Number(summary.absent || 0), color: warnaStatus.alpa },
  ], [summary])

  const chartData = useMemo(() => {
    const grouped = new Map()
    rows.forEach((row) => {
      const key = row.tanggal || 'Tanpa tanggal'
      if (!grouped.has(key)) grouped.set(key, { tanggal: key, hadir: 0, terlambat: 0, izin: 0, sakit: 0, alpa: 0 })
      const item = grouped.get(key)
      const status = normalisasiStatus(row.status_hadir)
      if (Object.hasOwn(item, status)) item[status] += 1
    })
    return [...grouped.values()]
      .sort((a, b) => String(a.tanggal).localeCompare(String(b.tanggal)))
      .slice(-12)
      .map((item) => ({ ...item, label: formatTanggal(item.tanggal).replace(/\s\d{4}$/, '') }))
  }, [rows])

  const groupedByStudentRows = useMemo(() => {
    if (!Array.isArray(rows) || rows.length === 0) return []

    const map = new Map()
    rows.forEach((row) => {
      const studentName = row.siswa?.full_name || 'Tanpa Nama'
      const nis = row.siswa?.nis || '-'
      const key = `${row.siswa?.id || studentName}_${nis}`

      if (!map.has(key)) {
        map.set(key, {
          id: key,
          student: row.siswa,
          studentName,
          nis,
          unitName: getUnitName(row),
          kelasName: getNamaKelas(row),
          subjects: new Set(),
          hadir: 0,
          terlambat: 0,
          izin: 0,
          sakit: 0,
          alpa: 0,
          total: 0,
          subjectRows: [],
        })
      }

      const item = map.get(key)
      item.total += 1
      item.subjectRows.push(row)

      const mapelName = row.jadwal_pelajaran?.subject?.name || 'Mata Pelajaran Umum'
      if (mapelName) item.subjects.add(mapelName)

      const st = normalisasiStatus(row.status_hadir)
      if (st === 'hadir') item.hadir += 1
      else if (st === 'terlambat') item.terlambat += 1
      else if (st === 'izin') item.izin += 1
      else if (st === 'sakit') item.sakit += 1
      else if (st === 'alpa') item.alpa += 1
      else item.hadir += 1
    })

    return Array.from(map.values()).map((g) => {
      const percentHadir = g.total > 0 ? Math.round((g.hadir / g.total) * 100) : 0
      return {
        ...g,
        subjectListStr: Array.from(g.subjects).join(', ') || 'Semua Mata Pelajaran',
        percentHadir,
      }
    })
  }, [rows])

  const groupedBySubjectRows = useMemo(() => {
    if (!Array.isArray(rows) || rows.length === 0) return []

    const map = new Map()
    rows.forEach((row) => {
      const subjectName = row.jadwal_pelajaran?.subject?.name || 'Mata Pelajaran Umum'
      if (!map.has(subjectName)) {
        map.set(subjectName, {
          id: subjectName,
          subjectName,
          unitNames: new Set(),
          kelasNames: new Set(),
          hadir: 0,
          terlambat: 0,
          izin: 0,
          sakit: 0,
          alpa: 0,
          total: 0,
          studentRows: [],
        })
      }
      const item = map.get(subjectName)
      item.total += 1
      item.studentRows.push(row)

      const u = getUnitName(row)
      if (u && u !== '-') item.unitNames.add(u)

      const k = getNamaKelas(row)
      if (k && k !== '-') item.kelasNames.add(k)

      const st = normalisasiStatus(row.status_hadir)
      if (st === 'hadir') item.hadir += 1
      else if (st === 'terlambat') item.terlambat += 1
      else if (st === 'izin') item.izin += 1
      else if (st === 'sakit') item.sakit += 1
      else if (st === 'alpa') item.alpa += 1
      else item.hadir += 1
    })

    return Array.from(map.values()).map((g) => {
      const percentHadir = g.total > 0 ? Math.round((g.hadir / g.total) * 100) : 0
      return {
        ...g,
        unitListStr: Array.from(g.unitNames).join(', ') || 'Semua Unit',
        kelasListStr: Array.from(g.kelasNames).join(', ') || 'Semua Kelas',
        percentHadir,
      }
    })
  }, [rows])

  const activeGroupedRows = useMemo(() => {
    return groupByMode === 'siswa' ? groupedByStudentRows : groupedBySubjectRows
  }, [groupByMode, groupedByStudentRows, groupedBySubjectRows])

  const totalPages = Math.max(1, Math.ceil(activeGroupedRows.length / PAGE_SIZE))
  const paginatedRows = activeGroupedRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Card Modal Handlers
  const openCardModal = (statusKey, label, tone) => {
    setCardModal({
      isOpen: true,
      statusKey,
      title: `Data Siswa ${label}`,
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
    let list = rows
    if (cardModal.statusKey && cardModal.statusKey !== 'semua') {
      list = list.filter((r) => normalisasiStatus(r.status_hadir) === cardModal.statusKey)
    }
    if (cardModal.searchQuery.trim()) {
      const q = cardModal.searchQuery.toLowerCase().trim()
      list = list.filter((r) => {
        const name = (r.siswa?.full_name || '').toLowerCase()
        const nis = (r.siswa?.nis || '').toLowerCase()
        const kelas = getNamaKelas(r).toLowerCase()
        const unit = getUnitName(r).toLowerCase()
        const mapel = (r.jadwal_pelajaran?.subject?.name || '').toLowerCase()
        return name.includes(q) || nis.includes(q) || kelas.includes(q) || unit.includes(q) || mapel.includes(q)
      })
    }
    return list
  }, [rows, cardModal.isOpen, cardModal.statusKey, cardModal.searchQuery])

  const modalTotalPages = Math.max(1, Math.ceil(modalRows.length / MODAL_PAGE_SIZE))
  const paginatedModalRows = useMemo(() => {
    return modalRows.slice((cardModal.page - 1) * MODAL_PAGE_SIZE, cardModal.page * MODAL_PAGE_SIZE)
  }, [modalRows, cardModal.page])

  const updateDraftAndFilter = (nextDraft) => {
    setDraft(nextDraft)
    const { period: _period, ...nextFilters } = nextDraft
    setPage(1)
    setFilters(nextFilters)
  }

  const applyFilters = () => {
    updateDraftAndFilter(draft)
  }

  const resetFilters = () => {
    const empty = { unit_id: '', class_id: '', date_from: '', date_to: '', status: '', subject_id: '' }
    updateDraftAndFilter({ ...empty, period: 'semua' })
  }

  const changePeriod = (period) => {
    const nextDraft = rentangPeriode(period, draft)
    updateDraftAndFilter(nextDraft)
  }

  const downloadRows = (downloadRowsList = rows, filename = 'laporan-absensi.csv') => {
    if (!downloadRowsList.length) {
      setNotice('Belum ada data yang dapat diekspor.')
      return
    }
    exportCsv(filename, columns, downloadRowsList)
    setNotice('File laporan berhasil diunduh.')
  }

  const handlePrintClean = useCallback(() => {
    if (groupByMode === 'siswa') {
      const headers = ['No', 'Nama Siswa', 'NIS', 'Unit Pendidikan', 'Kelas & Rombel', 'Mata Pelajaran', 'Total Presensi', 'Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alpha', '% Kehadiran']
      const printRows = groupedByStudentRows.map((g, i) => [
        i + 1,
        g.studentName,
        g.nis,
        g.unitName,
        g.kelasName,
        g.subjectListStr,
        g.total,
        g.hadir,
        g.terlambat,
        g.izin,
        g.sakit,
        g.alpa,
        `${g.percentHadir}%`
      ])
      printCleanTable({
        title: 'Rekap Absensi Pembelajaran per Siswa',
        subtitle: 'Pemantauan dan rekapitulasi presensi siswa per mata pelajaran',
        headers,
        rows: printRows,
      })
    } else {
      const headers = ['No', 'Mata Pelajaran', 'Unit Pendidikan', 'Kelas & Rombel', 'Total Record', 'Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alpha', '% Kehadiran']
      const printRows = groupedBySubjectRows.map((g, i) => [
        i + 1,
        g.subjectName,
        g.unitListStr,
        g.kelasListStr,
        g.total,
        g.hadir,
        g.terlambat,
        g.izin,
        g.sakit,
        g.alpa,
        `${g.percentHadir}%`
      ])
      printCleanTable({
        title: 'Rekap Absensi Pembelajaran per Mata Pelajaran',
        subtitle: 'Pemantauan dan rekapitulasi presensi siswa per mata pelajaran',
        headers,
        rows: printRows,
      })
    }
  }, [groupByMode, groupedByStudentRows, groupedBySubjectRows])

  const handleDownloadPdfTable = useCallback(() => {
    if (groupByMode === 'siswa') {
      const headers = ['No', 'Nama Siswa', 'NIS', 'Unit Pendidikan', 'Kelas & Rombel', 'Mata Pelajaran', 'Total Presensi', 'Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alpha', '% Kehadiran']
      const printRows = groupedByStudentRows.map((g, i) => [
        i + 1,
        g.studentName,
        g.nis,
        g.unitName,
        g.kelasName,
        g.subjectListStr,
        g.total,
        g.hadir,
        g.terlambat,
        g.izin,
        g.sakit,
        g.alpa,
        `${g.percentHadir}%`
      ])
      downloadPdfTable({
        title: 'Rekap Absensi Pembelajaran per Siswa',
        subtitle: 'Pemantauan dan rekapitulasi presensi siswa per mata pelajaran',
        headers,
        rows: printRows,
        filename: `Laporan_Absensi_Siswa_${new Date().toISOString().slice(0, 10)}.pdf`
      })
    } else {
      const headers = ['No', 'Mata Pelajaran', 'Unit Pendidikan', 'Kelas & Rombel', 'Total Record', 'Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alpha', '% Kehadiran']
      const printRows = groupedBySubjectRows.map((g, i) => [
        i + 1,
        g.subjectName,
        g.unitListStr,
        g.kelasListStr,
        g.total,
        g.hadir,
        g.terlambat,
        g.izin,
        g.sakit,
        g.alpa,
        `${g.percentHadir}%`
      ])
      downloadPdfTable({
        title: 'Rekap Absensi Pembelajaran per Mata Pelajaran',
        subtitle: 'Pemantauan dan rekapitulasi presensi siswa per mata pelajaran',
        headers,
        rows: printRows,
        filename: `Laporan_Absensi_Mapel_${new Date().toISOString().slice(0, 10)}.pdf`
      })
    }
  }, [groupByMode, groupedByStudentRows, groupedBySubjectRows])

  const printReport = () => {
    setPrintOptionModalOpen(true)
  }

  return (
    <section className="attendance-report-page space-y-6">
      {/* Navigation Breadcrumb (Matching Dashboard Wali Kelas Style) */}
      <AppBreadcrumb items={[{ label: 'Absensi', href: '/absensi' }, { label: 'Laporan Absensi Pembelajaran' }]} />

      {/* MODERN HERO CARD HEADER (MATCHING PORTAL ORANG TUA / SISWA STYLE) */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
          <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <ClipboardCheck className="size-6 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                    <Sparkles className="size-3 text-amber-300 animate-pulse" />
                    Laporan Presensi Pembelajaran
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    {formatAngka(rows.length)} Data Presensi
                  </span>
                </div>
                <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Laporan Rekapitulasi Absensi Pembelajaran
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
                  Pusat analisis presensi siswa di kelas: status hadir, terlambat, izin, sakit, alpa, dan tren persentase kehadiran per rombel.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 z-10">
              <Button
                type="button"
                variant="primary"
                appearance="fill"
                size="sm"
                onClick={load}
                disabled={loading}
                prefixIcon={<RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
                className="!bg-gradient-to-r !from-emerald-600 !to-teal-600 !text-white font-bold shadow-md shadow-emerald-600/25 cursor-pointer"
              >
                Segarkan Data
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards Grid (5 Equal & Colored Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 mb-6">
        {cards.map(({ label, statusKey, value, icon: Icon, tone, percent }) => {
          const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
          return (
            <article
              key={label}
              onClick={() => openCardModal(statusKey, label, tone)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openCardModal(statusKey, label, tone)}
              className={`group relative overflow-hidden rounded-[18px] border-2 p-4 sm:p-4.5 shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between h-full ${t.card}`}
              title={`Klik untuk melihat detail data ${label}`}
            >
              {/* Ambient Glow */}
              <div className={`pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl transition-all ${t.glow}`} />

              {/* Header with 3D Gradient Icon Box & Pill Tag */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className={`size-10 sm:size-10.5 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${t.iconBox}`}>
                  <Icon className="size-5" />
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-extrabold shadow-2xs ${t.tag}`}>
                  {percent.toFixed(1)}%
                </span>
              </div>

              {/* Metric Label & Value */}
              <div>
                <span className={`text-[10.5px] font-bold uppercase tracking-wider block mb-0.5 ${t.title}`}>{label}</span>
                <strong className={`text-2xl sm:text-3xl font-black tracking-tight tabular-nums block ${t.val}`}>
                  {formatAngka(value)}
                </strong>
              </div>

              {/* Click Affordance Footer */}
              <div className="flex items-center justify-between text-[10px] font-bold pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400">dari total data</span>
                <span className={`inline-flex items-center gap-0.5 font-bold group-hover:translate-x-0.5 transition-transform ${t.cta}`}>
                  <Eye className="h-3 w-3" /> Detail &rarr;
                </span>
              </div>
            </article>
          )
        })}
      </div>

      {error && <div className="attendance-report-alert mb-6">{error} <button type="button" onClick={load}>Coba lagi</button></div>}

      {/* 3-Column Equal Grid: Filter, Grafik, & Distribusi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 items-stretch">
        {/* Col 1: Filter Laporan */}
        <article className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 flex flex-col justify-between h-full">
          <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-emerald-500/15">
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
                {unitList.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Unit Pendidikan</label>
                    <select
                      value={draft.unit_id}
                      onChange={(e) => updateDraftAndFilter({ ...draft, unit_id: e.target.value, class_id: '' })}
                      className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Semua Unit Pendidikan</option>
                      {unitList.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name || unit.nama_unit || unit.code} {unit.level ? `(${unit.level})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Kelas / Rombel</label>
                  <select
                    value={draft.class_id}
                    onChange={(e) => {
                      const selectedClassId = e.target.value
                      const selectedClassObj = classList.find((c) => String(c.id) === String(selectedClassId))
                      const targetUnitId = selectedClassObj?.unit_pendidikan_id || selectedClassObj?.unit_id || draft.unit_id
                      updateDraftAndFilter({ ...draft, class_id: selectedClassId, unit_id: draft.unit_id || targetUnitId || '' })
                    }}
                    className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Semua Kelas</option>
                    {classList.map((kelas) => {
                      const uName = kelas.unit_pendidikan?.name || kelas.unit_pendidikan?.level || kelas.jenjang || ''
                      const labelStr = uName ? `${kelas.nama_kelas || kelas.kode_kelas} (${uName})` : (kelas.nama_kelas || kelas.kode_kelas)
                      return (
                        <option key={kelas.id} value={kelas.id}>{labelStr}</option>
                      )
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Mata Pelajaran</label>
                  <select
                    value={draft.subject_id}
                    onChange={(e) => updateDraftAndFilter({ ...draft, subject_id: e.target.value })}
                    className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Semua Mata Pelajaran</option>
                    {subjectOptions.map(([id, name]) => (
                      <option key={id} value={id}>{name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Periode</label>
                  <select
                    value={draft.period}
                    onChange={(e) => changePeriod(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {draft.period === 'custom' && <option value="custom">Rentang Kustom</option>}
                    <option value="semua">Semua Data</option>
                    <option value="minggu">7 Hari Terakhir</option>
                    <option value="bulan">Bulan Ini</option>
                    <option value="semester">6 Bulan Terakhir</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Tanggal Mulai</label>
                    <input
                      type="date"
                      value={draft.date_from}
                      onChange={(e) => updateDraftAndFilter({ ...draft, date_from: e.target.value, period: 'custom' })}
                      className="w-full h-8 px-2 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Tanggal Selesai</label>
                    <input
                      type="date"
                      value={draft.date_to}
                      onChange={(e) => updateDraftAndFilter({ ...draft, date_to: e.target.value, period: 'custom' })}
                      className="w-full h-8 px-2 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Col 2: Grafik Kehadiran */}
        <article className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 flex flex-col justify-between h-full">
          <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-emerald-500/15">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Grafik Kehadiran</h2>
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
          </div>
        </article>

        {/* Col 3: Distribusi Kehadiran */}
        <article className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 flex flex-col justify-between h-full">
          <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-emerald-500/15">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Distribusi Kehadiran</h2>
              <span className="text-xs font-bold text-slate-500">{formatAngka(total)} Total</span>
            </div>
            <div className="flex flex-col items-center justify-center flex-1">
              <div className="relative w-40 h-40 mb-3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distribution} dataKey="value" innerRadius="62%" outerRadius="88%" paddingAngle={2}>
                      {distribution.map((item) => <Cell key={item.name} fill={item.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <strong className="text-xl font-black text-slate-900 dark:text-white">{formatAngka(total)}</strong>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total</span>
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-2 text-xs">
                {distribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60">
                    <span className="size-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                    <div className="flex items-center justify-between w-full min-w-0">
                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate">{item.name}</span>
                      <span className="text-[11px] font-bold text-slate-900 dark:text-white ml-1">{formatAngka(item.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>
      </div>

      {/* Table Card - TailGrids Master Data Datatable (Dual Mode: Siswa & Mata Pelajaran) */}
      <article className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
        <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-400/15" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-500/20">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Rekap Absensi Pembelajaran</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pemantauan dan rekapitulasi presensi {groupByMode === 'siswa' ? 'siswa per mata pelajaran' : 'siswa per unit pendidikan & rombel'}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Mode Sortir / Group Switcher (Berdasarkan Siswa vs Berdasarkan Mata Pelajaran) */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <button
                type="button"
                onClick={() => { setGroupByMode('siswa'); setPage(1); }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer",
                  groupByMode === 'siswa'
                    ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                )}
              >
                <User className="size-3.5" />
                <span>Berdasarkan Siswa</span>
              </button>
              <button
                type="button"
                onClick={() => { setGroupByMode('subject'); setPage(1); }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer",
                  groupByMode === 'subject'
                    ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                )}
              >
                <BookOpen className="size-3.5" />
                <span>Berdasarkan Mata Pelajaran</span>
              </button>
            </div>

            {/* Soft Pastel Squircle Action Buttons */}
            <div className="flex items-center gap-2 flex-nowrap shrink-0">
              {/* Import Button */}
              <div className="group relative inline-flex">
                <button
                  type="button"
                  title="Import Data (.csv, .xlsx, .xls)"
                  aria-label="Import Data"
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex size-10 items-center justify-center rounded-2xl bg-sky-100/90 text-sky-600 hover:bg-sky-500 hover:text-white dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-500 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-sky-500/30 cursor-pointer shadow-2xs"
                >
                  <Upload1 className="size-5 transition-colors" />
                </button>
                <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                  Import Data (.csv, .xlsx, .xls)
                </div>
              </div>

              {/* Export Button */}
              <div className="group relative inline-flex">
                <button
                  type="button"
                  title={`Export Datatable (${activeGroupedRows.length} Data)`}
                  aria-label="Export Datatable"
                  onClick={() => setIsExportModalOpen(true)}
                  className="flex size-10 items-center justify-center rounded-2xl bg-amber-100/90 text-amber-600 hover:bg-amber-500 hover:text-white dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-amber-500/30 cursor-pointer shadow-2xs"
                >
                  <Download1 className="size-5 transition-colors" />
                </button>
                <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                  Export Datatable ({activeGroupedRows.length} Data)
                </div>
              </div>

              {/* Cetak Button */}
              <div className="group relative inline-flex">
                <button
                  type="button"
                  title="Cetak Laporan"
                  aria-label="Cetak Laporan"
                  onClick={printReport}
                  className="flex size-10 items-center justify-center rounded-2xl bg-indigo-100/90 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-indigo-600/30 cursor-pointer shadow-2xs"
                >
                  <Printer className="size-5 transition-colors" />
                </button>
                <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                  Cetak Laporan
                </div>
              </div>

              {/* Refresh Button */}
              <div className="group relative inline-flex">
                <button
                  type="button"
                  title="Muat Ulang Data"
                  aria-label="Muat Ulang Data"
                  onClick={load}
                  className="flex size-10 items-center justify-center rounded-2xl bg-slate-100/90 text-slate-600 hover:bg-slate-700 hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-slate-500/30 cursor-pointer shadow-2xs"
                >
                  <RefreshCcw className="size-5 transition-colors" />
                </button>
                <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                  Muat Ulang Data
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 md:px-8 py-2 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase text-[11px]">
                <th className="py-3.5 px-3 w-12 text-center">NO</th>
                {groupByMode === 'siswa' ? (
                  <>
                    <th className="py-3.5 px-3">SISWA</th>
                    <th className="py-3.5 px-3">NIS</th>
                    <th className="py-3.5 px-3">UNIT PENDIDIKAN</th>
                    <th className="py-3.5 px-3">KELAS & ROMBEL</th>
                    <th className="py-3.5 px-3 text-center">TOTAL MAPEL</th>
                    <th className="py-3.5 px-3">REKAP STATISTIK PRESENSI</th>
                    <th className="py-3.5 px-3 text-center">% KEHADIRAN</th>
                    <th className="py-3.5 px-3 text-center w-28">AKSI</th>
                  </>
                ) : (
                  <>
                    <th className="py-3.5 px-3">MATA PELAJARAN</th>
                    <th className="py-3.5 px-3">UNIT PENDIDIKAN</th>
                    <th className="py-3.5 px-3">KELAS & ROMBEL</th>
                    <th className="py-3.5 px-3 text-center">TOTAL PRESENSI</th>
                    <th className="py-3.5 px-3">REKAP STATISTIK PRESENSI</th>
                    <th className="py-3.5 px-3 text-center">% KEHADIRAN</th>
                    <th className="py-3.5 px-3 text-center w-28">AKSI</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {!loading && paginatedRows.length ? paginatedRows.map((group, index) => {
                if (groupByMode === 'siswa') {
                  return (
                    <tr
                      key={group.id || index}
                      onClick={() => setSelectedStudentGroup(group)}
                      className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-3 text-center text-slate-400 font-semibold">{(page - 1) * PAGE_SIZE + index + 1}</td>
                      <td className="py-3.5 px-3">
                        <HoverCard>
                          <HoverCardTrigger className="cursor-pointer text-left focus:outline-none block">
                            <div
                              onClick={(e) => {
                                e.stopPropagation()
                                openStudentProfile(group.student)
                              }}
                              className="group/btn cursor-pointer"
                              title={`Arahkan kursor untuk pratinjau data atau klik untuk profil lengkap ${group.studentName}`}
                            >
                              <PersonIdentityCell
                                src={group.student?.photo_url || group.student?.photo || group.student?.photo_thumb}
                                name={group.studentName}
                                className="group-hover/btn:opacity-80 transition-opacity"
                              />
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent side="right" align="start" className="w-72 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl z-50">
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="size-11 border-2 border-emerald-500 shadow-xs">
                                  <AvatarImage src={group.student?.photo_url || group.student?.photo} />
                                  <AvatarFallback className="bg-emerald-100 text-emerald-800 font-bold">{(group.studentName).slice(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                    {group.studentName}
                                  </h4>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                    NIS: {group.nis}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Unit</span>
                                  <span className="font-semibold text-slate-700 dark:text-slate-300">{group.unitName}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Kelas</span>
                                  <span className="font-semibold text-slate-700 dark:text-slate-300">{group.kelasName}</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
                                  <span className="text-[10px] text-emerald-600 font-bold block">Hadir</span>
                                  <strong className="text-sm font-black text-emerald-700 dark:text-emerald-300">{group.hadir}</strong>
                                </div>
                                <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/50">
                                  <span className="text-[10px] text-violet-600 font-bold block">Terlambat</span>
                                  <strong className="text-sm font-black text-violet-700 dark:text-violet-300">{group.terlambat}</strong>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedStudentGroup(group)
                                }}
                                className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                              >
                                Lihat Detail Presensi Mapel ({group.total})
                              </button>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-slate-300">{group.nis}</td>
                      <td className="py-3.5 px-3">
                        <Badge color="emerald" size="sm">
                          {group.unitName}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{group.kelasName}</td>
                      <td className="py-3.5 px-3 text-center font-bold text-slate-900 dark:text-white">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs">
                          {group.subjects.size} Mapel
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300" title="Hadir">{group.hadir} H</span>
                          {group.terlambat > 0 && <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-violet-100 text-violet-800 dark:bg-violet-950/80 dark:text-violet-300" title="Terlambat">{group.terlambat} T</span>}
                          {group.izin > 0 && <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300" title="Izin">{group.izin} I</span>}
                          {group.sakit > 0 && <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300" title="Sakit">{group.sakit} S</span>}
                          {group.alpa > 0 && <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300" title="Alpha">{group.alpa} A</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <Badge color={group.percentHadir >= 80 ? 'success' : group.percentHadir >= 60 ? 'warning' : 'error'} size="sm">
                          {group.percentHadir}% Hadir
                        </Badge>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <div className="group relative inline-flex">
                            <button
                              type="button"
                              title="Cetak Rincian Siswa"
                              aria-label="Cetak Rincian Siswa"
                              onClick={() => {
                                const headers = ['No', 'Mata Pelajaran', 'Unit', 'Kelas', 'Tanggal', 'Status', 'Catatan']
                                const printRows = group.subjectRows.map((r, i) => [
                                  i + 1,
                                  r.jadwal_pelajaran?.subject?.name || '-',
                                  getUnitName(r),
                                  getNamaKelas(r),
                                  formatTanggal(r.tanggal),
                                  statusLabel[normalisasiStatus(r.status_hadir)] || r.status_hadir || '-',
                                  r.catatan || r.keterangan || '-'
                                ])
                                printCleanTable({
                                  title: `Rincian Presensi Pembelajaran — ${group.studentName}`,
                                  subtitle: `NIS: ${group.nis} | Unit: ${group.unitName} | Kelas: ${group.kelasName}`,
                                  headers,
                                  rows: printRows,
                                })
                              }}
                              className="flex size-9 items-center justify-center rounded-2xl bg-indigo-100/90 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-indigo-600/30 cursor-pointer shadow-2xs"
                            >
                              <Printer className="size-4 transition-colors" />
                            </button>
                            <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                              <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                              Cetak Rincian
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                }

                return (
                  <tr
                    key={group.subjectName || index}
                    onClick={() => setSelectedSubjectGroup(group)}
                    className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-3 text-center text-slate-400 font-semibold">{(page - 1) * PAGE_SIZE + index + 1}</td>
                    <td className="py-3.5 px-3">
                      <HoverCard>
                        <HoverCardTrigger className="cursor-pointer text-left focus:outline-none block">
                          <div className="flex items-center gap-2.5 group/mapel">
                            <div className="size-9 rounded-xl bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 group-hover/mapel:scale-105 transition-transform">
                              <BookOpen className="size-4" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white text-xs group-hover/mapel:text-emerald-600 dark:group-hover/mapel:text-emerald-400 transition-colors">
                                {group.subjectName}
                              </span>
                              <span className="text-[10px] text-slate-400 block font-normal">
                                {group.total} Catatan Presensi Siswa
                              </span>
                            </div>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent side="right" align="start" className="w-80 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl z-50">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                              <div className="size-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                                <BookOpen className="size-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{group.subjectName}</h4>
                                <p className="text-xs text-slate-500">{group.unitListStr}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
                                <span className="text-[10px] text-emerald-600 font-bold block">Hadir</span>
                                <strong className="text-sm font-black text-emerald-700 dark:text-emerald-300">{group.hadir}</strong>
                              </div>
                              <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/50">
                                <span className="text-[10px] text-violet-600 font-bold block">Terlambat</span>
                                <strong className="text-sm font-black text-violet-700 dark:text-violet-300">{group.terlambat}</strong>
                              </div>
                              <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50">
                                <span className="text-[10px] text-sky-600 font-bold block">Izin</span>
                                <strong className="text-sm font-black text-sky-700 dark:text-sky-300">{group.izin}</strong>
                              </div>
                              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50">
                                <span className="text-[10px] text-amber-600 font-bold block">Sakit</span>
                                <strong className="text-sm font-black text-amber-700 dark:text-amber-300">{group.sakit}</strong>
                              </div>
                            </div>
                            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 flex justify-between items-center text-xs">
                              <span className="text-[10px] text-rose-600 font-bold">Alpha</span>
                              <strong className="text-sm font-black text-rose-700 dark:text-rose-300">{group.alpa}</strong>
                            </div>
                            <Button
                              variant="primary"
                              appearance="fill"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedSubjectGroup(group)
                              }}
                              className="w-full rounded-xl font-bold cursor-pointer"
                            >
                              Lihat Data Siswa ({group.total})
                            </Button>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </td>
                    <td className="py-3.5 px-3">
                      <Badge color="emerald" size="sm">
                        {group.unitListStr}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{group.kelasListStr}</td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-900 dark:text-white">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs">
                        {group.total} Siswa
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300" title="Hadir">{group.hadir} H</span>
                        {group.terlambat > 0 && <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-violet-100 text-violet-800 dark:bg-violet-950/80 dark:text-violet-300" title="Terlambat">{group.terlambat} T</span>}
                        {group.izin > 0 && <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300" title="Izin">{group.izin} I</span>}
                        {group.sakit > 0 && <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300" title="Sakit">{group.sakit} S</span>}
                        {group.alpa > 0 && <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300" title="Alpha">{group.alpa} A</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <Badge color={group.percentHadir >= 80 ? 'success' : group.percentHadir >= 60 ? 'warning' : 'error'} size="sm">
                        {group.percentHadir}% Hadir
                      </Badge>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <div className="group relative inline-flex">
                          <button
                            type="button"
                            title="Cetak Rincian Mapel"
                            aria-label="Cetak Rincian Mapel"
                            onClick={() => {
                              const headers = ['No', 'Siswa', 'NIS', 'Unit', 'Kelas', 'Tanggal', 'Status', 'Catatan']
                              const printRows = group.studentRows.map((r, i) => [
                                i + 1,
                                r.siswa?.full_name || '-',
                                r.siswa?.nis || '-',
                                getUnitName(r),
                                getNamaKelas(r),
                                formatTanggal(r.tanggal),
                                statusLabel[normalisasiStatus(r.status_hadir)] || r.status_hadir || '-',
                                r.catatan || r.keterangan || '-'
                              ])
                              printCleanTable({
                                title: `Rincian Presensi Siswa — ${group.subjectName}`,
                                subtitle: `Unit: ${group.unitListStr} | Kelas: ${group.kelasListStr}`,
                                headers,
                                rows: printRows,
                              })
                            }}
                            className="flex size-9 items-center justify-center rounded-2xl bg-indigo-100/90 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-indigo-600/30 cursor-pointer shadow-2xs"
                          >
                            <Printer className="size-4 transition-colors" />
                          </button>
                          <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                            <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                            Cetak Rincian
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan={groupByMode === 'siswa' ? '9' : '8'} className="py-12 text-center text-slate-400 font-medium">
                    {loading ? 'Memuat data absensi...' : `Belum ada data ${groupByMode === 'siswa' ? 'siswa' : 'mata pelajaran'} pada filter ini.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="w-full border-t border-slate-100 dark:border-slate-800 px-4 py-3.5 sm:px-6 md:px-8 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            Menampilkan {activeGroupedRows.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, activeGroupedRows.length)} dari {activeGroupedRows.length} {groupByMode === 'siswa' ? 'siswa' : 'mata pelajaran'}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((value) => value - 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-bold px-2 text-slate-700 dark:text-slate-300">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((value) => value + 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </article>

      {/* Row Detail View Modal */}
      {selectedRow && (
        <div className="attendance-detail-modal-backdrop" role="presentation" onMouseDown={() => setSelectedRow(null)}>
          <article className="attendance-detail-modal" role="dialog" aria-modal="true" aria-labelledby="attendance-detail-title" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div><small>Detail Kehadiran</small><h2 id="attendance-detail-title">{selectedRow.siswa?.full_name || 'Siswa'}</h2></div>
              <button type="button" aria-label="Tutup detail" onClick={() => setSelectedRow(null)}><X size={19} /></button>
            </header>
            <dl>
              <div><dt>NIS</dt><dd>{selectedRow.siswa?.nis || '-'}</dd></div>
              <div><dt>Unit Pendidikan</dt><dd>{getUnitName(selectedRow)}</dd></div>
              <div><dt>Kelas</dt><dd>{getNamaKelas(selectedRow)}</dd></div>
              <div><dt>Tanggal</dt><dd>{formatTanggal(selectedRow.tanggal)}</dd></div>
              <div><dt>Mata Pelajaran</dt><dd>{selectedRow.jadwal_pelajaran?.subject?.name || '-'}</dd></div>
              <div><dt>Status</dt><dd><span className={`attendance-status status-${normalisasiStatus(selectedRow.status_hadir)}`}>{statusLabel[normalisasiStatus(selectedRow.status_hadir)] || selectedRow.status_hadir || '-'}</span></dd></div>
              <div className="full"><dt>Catatan</dt><dd>{selectedRow.catatan || 'Tidak ada catatan.'}</dd></div>
            </dl>
            <footer>
              <button type="button" onClick={() => openStudentProfile(selectedRow.siswa)} className="secondary"><Eye size={16} /> Lihat Profil Siswa</button>
              <button type="button" onClick={() => downloadRows([selectedRow], `absensi-${selectedRow.siswa?.nis || selectedRow.id || 'siswa'}.csv`)}><Download size={16} /> Unduh Data</button>
              <button type="button" className="primary" onClick={printReport}><Printer size={16} /> Cetak</button>
            </footer>
          </article>
        </div>
      )}

      {/* Modal Detail Presensi per Mata Pelajaran */}
      {selectedSubjectGroup && (
        <Dialog
          isOpen={!!selectedSubjectGroup}
          onOpenChange={(open) => !open && setSelectedSubjectGroup(null)}
          showCloseButton={true}
          className="w-full max-w-4xl rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <BookOpen className="size-5" />
              </div>
              <div>
                <span>Detail Presensi Siswa — {selectedSubjectGroup.subjectName}</span>
                <span className="block text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedSubjectGroup.unitListStr} • {selectedSubjectGroup.kelasListStr} ({selectedSubjectGroup.total} Data Siswa)
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          <DialogBody className="py-4 space-y-4 max-h-[65vh] overflow-y-auto">
            {/* Stats Header Bar inside Modal */}
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60">
                <span className="text-[10px] font-bold text-emerald-600 uppercase block">Hadir</span>
                <strong className="text-base font-black text-emerald-700 dark:text-emerald-300">{selectedSubjectGroup.hadir}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200/60 dark:border-violet-800/60">
                <span className="text-[10px] font-bold text-violet-600 uppercase block">Terlambat</span>
                <strong className="text-base font-black text-violet-700 dark:text-violet-300">{selectedSubjectGroup.terlambat}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/60">
                <span className="text-[10px] font-bold text-sky-600 uppercase block">Izin</span>
                <strong className="text-base font-black text-sky-700 dark:text-sky-300">{selectedSubjectGroup.izin}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60">
                <span className="text-[10px] font-bold text-amber-600 uppercase block">Sakit</span>
                <strong className="text-base font-black text-amber-700 dark:text-amber-300">{selectedSubjectGroup.sakit}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/60">
                <span className="text-[10px] font-bold text-rose-600 uppercase block">Alpha</span>
                <strong className="text-base font-black text-rose-700 dark:text-rose-300">{selectedSubjectGroup.alpa}</strong>
              </div>
            </div>

            {/* Table of Students inside Modal */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="py-2.5 px-3 w-10 text-center">NO</th>
                    <th className="py-2.5 px-3">SISWA</th>
                    <th className="py-2.5 px-3">NIS</th>
                    <th className="py-2.5 px-3">KELAS</th>
                    <th className="py-2.5 px-3">TANGGAL</th>
                    <th className="py-2.5 px-3 text-center">STATUS</th>
                    <th className="py-2.5 px-3">CATATAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedSubjectGroup.studentRows.map((sRow, idx) => {
                    const st = normalisasiStatus(sRow.status_hadir)
                    return (
                      <tr key={sRow.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-2.5 px-3 text-center text-slate-400 font-semibold">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                          <HoverCard>
                            <HoverCardTrigger className="cursor-pointer text-left focus:outline-none block">
                              <span
                                onClick={() => openStudentProfile(sRow.siswa)}
                                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                              >
                                {sRow.siswa?.full_name || '-'}
                              </span>
                            </HoverCardTrigger>
                            <HoverCardContent side="right" align="start" className="w-64 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl z-50">
                              <div className="space-y-2">
                                <h4 className="font-bold text-slate-900 dark:text-white text-xs">{sRow.siswa?.full_name}</h4>
                                <p className="text-[11px] text-slate-500">NIS: {sRow.siswa?.nis || '-'}</p>
                                <div className="text-[11px] text-slate-600 dark:text-slate-300">
                                  <span>Kelas: {getNamaKelas(sRow)}</span> | <span>Tanggal: {formatTanggal(sRow.tanggal)}</span>
                                </div>
                                <Button
                                  variant="primary"
                                  appearance="fill"
                                  size="xs"
                                  onClick={() => openStudentProfile(sRow.siswa)}
                                  className="w-full rounded font-bold cursor-pointer"
                                >
                                  Profil Siswa
                                </Button>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-300">{sRow.siswa?.nis || '-'}</td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{getNamaKelas(sRow)}</td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{formatTanggal(sRow.tanggal)}</td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge color={getBadgeColor(st)} size="sm">
                            {statusLabel[st] || sRow.status_hadir || '-'}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">{sRow.catatan || sRow.keterangan || '-'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </DialogBody>

          <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <Button
              variant="primary"
              appearance="fill"
              size="sm"
              onClick={() => {
                const headers = ['No', 'Siswa', 'NIS', 'Unit', 'Kelas', 'Tanggal', 'Status', 'Catatan']
                const printRows = selectedSubjectGroup.studentRows.map((r, i) => [
                  i + 1,
                  r.siswa?.full_name || '-',
                  r.siswa?.nis || '-',
                  getUnitName(r),
                  getNamaKelas(r),
                  formatTanggal(r.tanggal),
                  statusLabel[normalisasiStatus(r.status_hadir)] || r.status_hadir || '-',
                  r.catatan || r.keterangan || '-'
                ])
                printCleanTable({
                  title: `Rincian Presensi Siswa — ${selectedSubjectGroup.subjectName}`,
                  subtitle: `Unit: ${selectedSubjectGroup.unitListStr} | Kelas: ${selectedSubjectGroup.kelasListStr}`,
                  headers,
                  rows: printRows,
                })
              }}
              className="rounded-xl font-bold flex items-center gap-2"
            >
              <Printer className="size-4" /> Cetak Data Siswa Mapel Ini
            </Button>

            <Button
              variant="ghost"
              appearance="outline"
              size="sm"
              onClick={() => setSelectedSubjectGroup(null)}
              className="rounded-xl font-bold"
            >
              Tutup
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* Modal Detail Presensi Siswa per Mata Pelajaran */}
      {selectedStudentGroup && (
        <Dialog
          isOpen={!!selectedStudentGroup}
          onOpenChange={(open) => !open && setSelectedStudentGroup(null)}
          showCloseButton={true}
          className="w-full max-w-4xl rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2.5">
              <Avatar className="size-10 border-2 border-emerald-500 shadow-xs">
                <AvatarImage src={selectedStudentGroup.student?.photo_url || selectedStudentGroup.student?.photo} />
                <AvatarFallback className="bg-emerald-100 text-emerald-800 font-bold">{(selectedStudentGroup.studentName).slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <span>Detail Presensi — {selectedStudentGroup.studentName}</span>
                <span className="block text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                  NIS: {selectedStudentGroup.nis} • {selectedStudentGroup.unitName} • {selectedStudentGroup.kelasName} ({selectedStudentGroup.total} Record Presensi)
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          <DialogBody className="py-4 space-y-4 max-h-[65vh] overflow-y-auto">
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60">
                <span className="text-[10px] font-bold text-emerald-600 uppercase block">Hadir</span>
                <strong className="text-base font-black text-emerald-700 dark:text-emerald-300">{selectedStudentGroup.hadir}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200/60 dark:border-violet-800/60">
                <span className="text-[10px] font-bold text-violet-600 uppercase block">Terlambat</span>
                <strong className="text-base font-black text-violet-700 dark:text-violet-300">{selectedStudentGroup.terlambat}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/60">
                <span className="text-[10px] font-bold text-sky-600 uppercase block">Izin</span>
                <strong className="text-base font-black text-sky-700 dark:text-sky-300">{selectedStudentGroup.izin}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60">
                <span className="text-[10px] font-bold text-amber-600 uppercase block">Sakit</span>
                <strong className="text-base font-black text-amber-700 dark:text-amber-300">{selectedStudentGroup.sakit}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/60">
                <span className="text-[10px] font-bold text-rose-600 uppercase block">Alpha</span>
                <strong className="text-base font-black text-rose-700 dark:text-rose-300">{selectedStudentGroup.alpa}</strong>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="py-2.5 px-3 w-10 text-center">NO</th>
                    <th className="py-2.5 px-3">MATA PELAJARAN</th>
                    <th className="py-2.5 px-3">KELAS</th>
                    <th className="py-2.5 px-3">TANGGAL</th>
                    <th className="py-2.5 px-3 text-center">STATUS</th>
                    <th className="py-2.5 px-3">CATATAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedStudentGroup.subjectRows.map((sRow, idx) => {
                    const st = normalisasiStatus(sRow.status_hadir)
                    return (
                      <tr key={sRow.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-2.5 px-3 text-center text-slate-400 font-semibold">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                          {sRow.jadwal_pelajaran?.subject?.name || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{getNamaKelas(sRow)}</td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{formatTanggal(sRow.tanggal)}</td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge color={getBadgeColor(st)} size="sm">
                            {statusLabel[st] || sRow.status_hadir || '-'}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">{sRow.catatan || sRow.keterangan || '-'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </DialogBody>

          <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <Button
              variant="primary"
              appearance="fill"
              size="sm"
              onClick={() => {
                const headers = ['No', 'Mata Pelajaran', 'Unit', 'Kelas', 'Tanggal', 'Status', 'Catatan']
                const printRows = selectedStudentGroup.subjectRows.map((r, i) => [
                  i + 1,
                  r.jadwal_pelajaran?.subject?.name || '-',
                  getUnitName(r),
                  getNamaKelas(r),
                  formatTanggal(r.tanggal),
                  statusLabel[normalisasiStatus(r.status_hadir)] || r.status_hadir || '-',
                  r.catatan || r.keterangan || '-'
                ])
                printCleanTable({
                  title: `Rincian Presensi Pembelajaran — ${selectedStudentGroup.studentName}`,
                  subtitle: `NIS: ${selectedStudentGroup.nis} | Unit: ${selectedStudentGroup.unitName} | Kelas: ${selectedStudentGroup.kelasName}`,
                  headers,
                  rows: printRows,
                })
              }}
              className="rounded-xl font-bold flex items-center gap-2"
            >
              <Printer className="size-4" /> Cetak Presensi Siswa Ini
            </Button>

            <Button
              variant="ghost"
              appearance="outline"
              size="sm"
              onClick={() => setSelectedStudentGroup(null)}
              className="rounded-xl font-bold"
            >
              Tutup
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* Summary Card Interactive Datatable Modal */}
      {cardModal.isOpen && (
        <Dialog
          isOpen={cardModal.isOpen}
          onOpenChange={(open) => !open && closeCardModal()}
          className="w-full max-w-4xl max-h-[90vh] flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl"
        >
          <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {cardModal.title}
                </DialogTitle>
                <Badge color={getBadgeColor(cardModal.statusKey)} size="md">
                  {modalRows.length} Data
                </Badge>
              </div>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Daftar siswa dengan profil dan rincian status absensi pada unit pendidikan
              </DialogDescription>
            </div>
          </DialogHeader>

          <DialogBody className="flex-1 overflow-y-auto py-4 space-y-4">
            {/* Modal Toolbar: Search & Export */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama siswa, NIS, atau kelas..."
                  value={cardModal.searchQuery}
                  onChange={(e) => setCardModal((prev) => ({ ...prev, searchQuery: e.target.value, page: 1 }))}
                  className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadRows(modalRows, `detail-${cardModal.statusKey}-absensi.csv`)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <Download className="h-3.5 w-3.5 text-emerald-600" />
                  Unduh Excel/CSV
                </button>
              </div>
            </div>

            {/* Modal Datatable */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">No</th>
                    <th className="py-3 px-4">Siswa</th>
                    <th className="py-3 px-4">Unit Pendidikan</th>
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Mata Pelajaran</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedModalRows.length > 0 ? (
                    paginatedModalRows.map((row, idx) => {
                      const status = normalisasiStatus(row.status_hadir)
                      const studentName = row.siswa?.full_name || 'Siswa'
                      const studentNis = row.siswa?.nis || '-'
                      const studentPhoto = row.siswa?.photo_url || row.siswa?.photo || row.siswa?.photo_thumb
                      const kelasName = getNamaKelas(row)
                      const unitName = getUnitName(row)

                      return (
                        <tr key={row.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-medium text-slate-500">
                            {(cardModal.page - 1) * MODAL_PAGE_SIZE + idx + 1}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                openStudentProfile(row.siswa)
                              }}
                              className="text-left group cursor-pointer focus:outline-none"
                              title={`Klik untuk melihat profil ${studentName}`}
                            >
                              <PersonIdentityCell
                                src={studentPhoto}
                                name={studentName}
                                subtitle={studentNis ? `NIS: ${studentNis}` : null}
                                className="group-hover:opacity-80 transition-opacity"
                              />
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60">
                              {unitName}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                            {kelasName}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {formatTanggal(row.tanggal)}
                          </td>
                          <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                            {row.jadwal_pelajaran?.subject?.name || '-'}
                          </td>
                          <td className="py-3 px-4">
                            <Badge color={getBadgeColor(status)} size="sm">
                              {statusLabel[status] || row.status_hadir || '-'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                            {row.catatan || row.keterangan || '-'}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-slate-400 font-medium">
                        {cardModal.searchQuery ? 'Tidak ada data siswa yang cocok dengan pencarian.' : 'Belum ada data pada kategori ini.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </DialogBody>

          <DialogFooter className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium">
              Menampilkan {modalRows.length ? (cardModal.page - 1) * MODAL_PAGE_SIZE + 1 : 0}–{Math.min(cardModal.page * MODAL_PAGE_SIZE, modalRows.length)} dari {modalRows.length} data siswa
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 mr-4">
                <button
                  type="button"
                  disabled={cardModal.page === 1}
                  onClick={() => setCardModal((prev) => ({ ...prev, page: prev.page - 1 }))}
                  className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
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
                  className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <Button variant="ghost" onClick={closeCardModal}>
                Tutup
              </Button>
            </div>
          </DialogFooter>
        </Dialog>
      )}

      {/* Student Profile Detail Modal */}
      {isProfileModalOpen && selectedStudentProfile && (
        <Dialog
          isOpen={isProfileModalOpen}
          onOpenChange={(open) => !open && setIsProfileModalOpen(false)}
          className="w-full max-w-lg p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl"
        >
          <DialogHeader className="flex flex-col items-center text-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <Avatar size="xl" src={selectedStudentProfile.photo_thumb || selectedStudentProfile.photo_url || selectedStudentProfile.photo} alt={selectedStudentProfile.full_name} className="mb-3 size-20 shadow-md">
              <AvatarFallback className="bg-emerald-600 text-white font-black text-2xl">
                {(selectedStudentProfile.full_name || 'S')[0]}
              </AvatarFallback>
            </Avatar>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {selectedStudentProfile.full_name}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 flex items-center gap-2 mt-1">
              <span>NIS: {selectedStudentProfile.nis || '-'}</span>
              {selectedStudentProfile.nisn && <span>&bull; NISN: {selectedStudentProfile.nisn}</span>}
            </DialogDescription>
            <div className="flex items-center gap-2 mt-2">
              <Badge color="emerald" size="sm">
                {selectedStudentProfile.educationUnit?.name || selectedStudentProfile.kelas?.unit_pendidikan?.name || 'Unit Pendidikan'}
              </Badge>
              <Badge color="sky" size="sm">
                {selectedStudentProfile.kelas?.nama_kelas || selectedStudentProfile.kelas?.kode_kelas || 'Kelas'}
              </Badge>
            </div>
          </DialogHeader>

          <DialogBody className="py-4 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Jenis Kelamin</span>
                <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                  {selectedStudentProfile.gender === 'L' || selectedStudentProfile.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                </strong>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Status Keaktifan</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                  <span className="size-2 rounded-full bg-emerald-500" /> Aktif
                </span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Tempat, Tgl Lahir</span>
                <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                  {selectedStudentProfile.birth_place ? `${selectedStudentProfile.birth_place}, ` : ''}{selectedStudentProfile.birth_date || '-'}
                </strong>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-400 block mb-0.5">No. Telepon / HP</span>
                <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                  {selectedStudentProfile.phone || selectedStudentProfile.mobile_phone || '-'}
                </strong>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Alamat Tempat Tinggal</span>
                <strong className="text-slate-800 dark:text-slate-200 font-semibold block leading-relaxed">
                  {selectedStudentProfile.address || 'Alamat belum diisi.'}
                </strong>
              </div>
            </div>
          </DialogBody>

          <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button variant="ghost" onClick={() => setIsProfileModalOpen(false)}>
              Tutup Profil
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* Export Modal (.csv, .xlsx, .xls) */}
      {isExportModalOpen && (
        <Dialog
          isOpen={isExportModalOpen}
          onOpenChange={(open) => !open && setIsExportModalOpen(false)}
          className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl"
        >
          <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Download1 className="size-5 text-amber-500" /> Export Data Absensi Datatable
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Ekspor <strong>{rows.length} data</strong> yang saat ini tampil di datatable sesuai filter yang aktif.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="py-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Pilih Format File Ekspor:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'csv', label: 'CSV (.csv)', desc: 'Comma Separated' },
                  { id: 'xlsx', label: 'Excel (.xlsx)', desc: 'Office OpenXML' },
                  { id: 'xls', label: 'Excel 97-2003 (.xls)', desc: 'Binary Spreadsheet' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setExportFormat(fmt.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      exportFormat === fmt.id
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20 font-bold'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <FileSpreadsheet className="size-5 text-amber-600 mb-1" />
                    <span className="text-xs font-bold block">{fmt.label}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{fmt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold block mb-0.5 text-slate-800 dark:text-slate-200">Keterangan:</span>
              File akan mengekspor {rows.length} baris data terfilter termasuk NIS, NISN, Nama Siswa, Unit, Kelas, Tanggal, Mata Pelajaran, Status Presensi, dan Catatan.
            </div>
          </DialogBody>

          <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsExportModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => {
                exportDatatable(rows, exportFormat, `laporan-absensi-${filters.unit_id ? 'unit' : 'semua'}`)
                setIsExportModalOpen(false)
                setNotice(`Berhasil mengekspor ${rows.length} data ke format .${exportFormat}`)
              }}
            >
              <Download className="size-4 mr-1.5" /> Unduh .{exportFormat.toUpperCase()}
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* Import Modal (.csv, .xlsx, .xls) */}
      {isImportModalOpen && (
        <Dialog
          isOpen={isImportModalOpen}
          onOpenChange={(open) => !open && setIsImportModalOpen(false)}
          className="w-full max-w-lg p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl"
        >
          <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Upload1 className="size-5 text-sky-500" /> Import Data Absensi Pembelajaran
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Upload file spreadsheet (.csv, .xlsx, .xls) berisi data presensi siswa per unit & kelas.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="py-4 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/60">
              <div>
                <span className="text-xs font-bold text-sky-900 dark:text-sky-200 block">Template Format Import</span>
                <span className="text-[11px] text-sky-700 dark:text-sky-400 block">Unduh contoh template dengan header NIS, Tanggal, Status, dsb.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const templateHeaders = 'nis,nama_siswa,tanggal,status,catatan\n23001,"Ahmad Zaky",2026-08-17,hadir,"Hadir tepat waktu"\n23002,"Aisyah Humaira",2026-08-17,izin,"Izin sakit"\n'
                  const blob = new Blob([`\uFEFF${templateHeaders}`], { type: 'text/csv;charset=utf-8' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'template-import-absensi.csv'
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Download className="size-3.5" /> Template
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Pilih File (.csv, .xlsx, .xls):
              </label>
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" onClick={() => importInputRef.current?.click()}>
                <Upload className="size-8 text-sky-500 mb-2" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {importFile ? importFile.name : 'Klik untuk memilih atau drag & drop file'}
                </span>
                <span className="text-[11px] text-slate-400 mt-1">Format didukung: CSV (.csv), Excel (.xlsx, .xls)</span>
                <input
                  ref={importInputRef}
                  type="file"
                  accept=".csv, .xlsx, .xls, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setImportFile(e.target.files[0])
                      setImportError('')
                    }
                  }}
                />
              </div>
            </div>

            {importError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium">
                {importError}
              </div>
            )}
          </DialogBody>

          <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => { setIsImportModalOpen(false); setImportFile(null); setImportError('') }}>
              Batal
            </Button>
            <Button
              variant="primary"
              className="bg-sky-600 hover:bg-sky-700 text-white"
              disabled={!importFile || isImporting}
              onClick={async () => {
                if (!importFile) return
                try {
                  setIsImporting(true)
                  setImportError('')
                  const text = await importFile.text()
                  const parsed = parseImportedContent(text)
                  if (!parsed.length) throw new Error('File tidak memiliki data untuk diimport.')

                  const importedRows = parsed.map((item, idx) => ({
                    id: `imported-${Date.now()}-${idx}`,
                    tanggal: item.tanggal || new Date().toISOString().slice(0, 10),
                    siswa: {
                      id: `s-imp-${idx}`,
                      full_name: item.nama_siswa || item.nama || 'Siswa Import',
                      nis: item.nis || `IMP-${idx + 1}`,
                      unit_id: filters.unit_id || draft.unit_id || 'unit-imp',
                      kelas: { nama_kelas: item.kelas || 'Rombel Import' },
                      educationUnit: { name: getUnitName({ siswa: { unit_id: filters.unit_id } }) },
                    },
                    jadwal_pelajaran: {
                      subject: { name: item.mata_pelajaran || item.mapel || 'Pembelajaran' },
                    },
                    status_hadir: item.status || 'hadir',
                    catatan: item.catatan || 'Import data presensi',
                  }))

                  setReport((prev) => ({
                    ...prev,
                    rows: [...importedRows, ...(prev.rows || [])],
                  }))

                  setIsImportModalOpen(false)
                  setImportFile(null)
                  setNotice(`Berhasil mengimport ${importedRows.length} data presensi absensi.`)
                } catch (err) {
                  setImportError(err.message || 'Gagal memproses file import.')
                } finally {
                  setIsImporting(false)
                }
              }}
            >
              {isImporting ? 'Memproses...' : 'Import Data'}
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* TailGrids Opsi Cetak & Unduh PDF / Clean Print */}
      <PrintOptionModal
        isOpen={printOptionModalOpen}
        onClose={() => setPrintOptionModalOpen(false)}
        onPrint={handlePrintClean}
        onDownload={handleDownloadPdfTable}
        title="Rekap Absensi Pembelajaran"
      />

      {notice && <div className="attendance-report-toast" role="status">{notice}</div>}
    </section>
  )
}
