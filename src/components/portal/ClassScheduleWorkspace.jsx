import { useMemo, useState, useEffect, useCallback } from 'react'
import AppModal from '@/components/app/AppModal'
import {
 CalendarDays,
 Clock,
 User,
 MapPin,
 BookOpen,
 Search,
 Filter,
 Calendar,
 CheckCircle2,
 Sparkles,
 FileCheck2,
 CalendarCheck,
 ChevronRight,
 BookMarked,
 RotateCcw,
 X,
 Radio,
 LayoutGrid,
 Printer,
} from 'lucide-react'
import { Card, CardHeader, CardContent } from '../ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Button as HeroButton, Chip as HeroChip } from '@heroui/react'
import api from '../../services/api'
import { scheduleService } from '../../services/scheduleService'
import { printMatrixSchedule } from '../../utils/printHelper'

const DAYS = [
 { id: 1, name: 'Senin', short: 'Sen' },
 { id: 2, name: 'Selasa', short: 'Sel' },
 { id: 3, name: 'Rabu', short: 'Rab' },
 { id: 4, name: 'Kamis', short: 'Kam' },
 { id: 5, name: 'Jumat', short: 'Jum' },
 { id: 6, name: 'Sabtu', short: 'Sab' },
 { id: 0, name: 'Ahad / Minggu', short: 'Ahad' },
]

const MONTH_NAMES = [
 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

// Helper: Evaluasi status waktu sesi jadwal (past, current/LIVE, upcoming)
const getSessionTimelineStatus = (timeStartStr, timeEndStr, selectedDate = new Date()) => {
 const now = new Date()
 const isToday =
 now.getFullYear() === selectedDate.getFullYear() &&
 now.getMonth() === selectedDate.getMonth() &&
 now.getDate() === selectedDate.getDate()

 if (!isToday) {
 const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
 const selMidnight = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).getTime()
 if (selMidnight < todayMidnight) return 'past'
 return 'upcoming'
 }

 if (!timeStartStr || !timeEndStr) return 'upcoming'

 const parseToMinutes = (t) => {
 const clean = String(t).replace(/\./g, ':').trim()
 const parts = clean.split(':')
 const h = parseInt(parts[0] || '0', 10)
 const m = parseInt(parts[1] || '0', 10)
 return h * 60 + m
 }

 const currentMinutes = now.getHours() * 60 + now.getMinutes()
 const startMinutes = parseToMinutes(timeStartStr)
 const endMinutes = parseToMinutes(timeEndStr)

 if (currentMinutes < startMinutes) return 'upcoming'
 if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) return 'current'
 return 'past'
}

// Helper: Kategori & Gaya Semantik Mata Pelajaran ala Mobile App
const getSubjectStyleMeta = (subjectName = '', index = 0) => {
 const n = String(subjectName).toLowerCase()

 if (n.includes('tahfizh') || n.includes('quran') || n.includes('tajwid') || n.includes('tahsin') || n.includes('hadits')) {
 return {
 category: "Al-Qur'an & Tahfizh",
 color: 'success',
 badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
 pillColor: 'text-emerald-700 dark:text-emerald-300',
 accentColor: '#059669',
 borderLeft: 'border-l-emerald-600',
 }
 }
 if (n.includes('bahasa') || n.includes('arab') || n.includes('inggris') || n.includes('indonesia') || n.includes('literasi')) {
 return {
 category: 'Bahasa & Sastra',
 color: 'danger',
 badgeBg: 'bg-rose-50 text-rose-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/60 dark:text-rose-300 dark:border-emerald-800/60',
 pillColor: 'text-rose-700 dark:text-rose-300',
 accentColor: '#E11D48',
 borderLeft: 'border-l-rose-600',
 }
 }
 if (n.includes('matematika') || n.includes('ipa') || n.includes('fisika') || n.includes('biologi') || n.includes('kimia') || n.includes('sains') || n.includes('hitung')) {
 return {
 category: 'Sains & Matematika',
 color: 'primary',
 badgeBg: 'bg-sky-50 text-sky-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-sky-950/60 dark:text-sky-300 dark:border-emerald-800/60',
 pillColor: 'text-sky-700 dark:text-sky-300',
 accentColor: '#0284C7',
 borderLeft: 'border-l-sky-600',
 }
 }
 if (n.includes('agama') || n.includes('pai') || n.includes('fiqih') || n.includes('akidah') || n.includes('tarikh') || n.includes('ski') || n.includes('ips') || n.includes('sosial')) {
 return {
 category: 'Dirasah Islamiyah & Sosial',
 color: 'secondary',
 badgeBg: 'bg-indigo-50 text-indigo-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-emerald-800/60',
 pillColor: 'text-indigo-700 dark:text-indigo-300',
 accentColor: '#4F46E5',
 borderLeft: 'border-l-indigo-600',
 }
 }
 if (n.includes('istirahat') || n.includes('ishoma') || n.includes('makan') || n.includes('snack') || n.includes('apel') || n.includes('senam')) {
 return {
 category: 'Kegiatan & Istirahat',
 color: 'warning',
 badgeBg: 'bg-amber-50 text-amber-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-emerald-800/60',
 pillColor: 'text-amber-700 dark:text-amber-300',
 accentColor: '#D97706',
 borderLeft: 'border-l-amber-500',
 }
 }

 const defaultPalettes = [
 { category: 'Umum', color: 'success', badgeBg: 'bg-teal-50 text-teal-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-teal-950/60 dark:text-teal-300 dark:border-emerald-800/60', accentColor: '#0D9488', borderLeft: 'border-l-teal-600' },
 { category: 'Akademik', color: 'primary', badgeBg: 'bg-blue-50 text-blue-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-emerald-800/60', accentColor: '#2563EB', borderLeft: 'border-l-blue-600' },
 { category: 'Pengembangan', color: 'secondary', badgeBg: 'bg-purple-50 text-purple-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-purple-950/60 dark:text-purple-300 dark:border-emerald-800/60', accentColor: '#7C3AED', borderLeft: 'border-l-purple-600' },
 ]
 return defaultPalettes[index % defaultPalettes.length]
}

export default function ClassScheduleWorkspace({ schedules = [], loading = false, activeChild = null }) {
 // Mode Navigasi Utama Terpadu ala Mobile App
 const [activeWorkspaceMode, setActiveWorkspaceMode] = useState('kbm') // 'kbm' | 'exam' | 'rekap'

 // Sub-tab periode (Hari Ini vs Mingguan)
 const [kbmViewMode, setKbmViewMode] = useState('today') // 'today' | 'weekly'
 const [rekapPeriodTab, setRekapPeriodTab] = useState('monthly') // 'monthly' | 'semester' | 'academic_year'

 // State Hari & Tanggal
 const [selectedDate, setSelectedDate] = useState(() => new Date())
 const todayDayIndex = new Date().getDay()
 const [selectedDay, setSelectedDay] = useState(todayDayIndex)

 // State Filter Mata Pelajaran & Pencarian Teks
 const [selectedSubject, setSelectedSubject] = useState('all')
 const [search, setSearch] = useState('')

 // State Modal Detail Sesi Jadwal (HeroUI Pop-up Dialog)
 const [selectedSessionDetail, setSelectedSessionDetail] = useState(null)
 const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

 // State Jadwal Ujian Terpadu (PTS/PAS/PAT)
 const [examSchedules, setExamSchedules] = useState([])
 const [loadingExams, setLoadingExams] = useState(false)
 const [selectedExamCategory, setSelectedExamCategory] = useState('all')

 const safeSchedules = useMemo(() => {
 if (Array.isArray(schedules)) return schedules
 if (Array.isArray(schedules?.data)) return schedules.data
 if (Array.isArray(schedules?.all_schedules)) return schedules.all_schedules
 if (Array.isArray(schedules?.weekly_schedules)) return schedules.weekly_schedules
 if (Array.isArray(schedules?.data?.all_schedules)) return schedules.data.all_schedules
 if (Array.isArray(schedules?.data?.weekly_schedules)) return schedules.data.weekly_schedules
 return []
 }, [schedules])

 const serverKpi = useMemo(() => {
 return schedules?.kpi || schedules?.data?.kpi || null
 }, [schedules])

 const semesterLabel = useMemo(() => {
 return schedules?.semester_name || schedules?.data?.semester_name || activeChild?.semester?.name || 'Semester Aktif'
 }, [schedules, activeChild])

 // Ambil daftar unik mata pelajaran & pengajar
 const uniqueSubjects = useMemo(() => {
 return Array.from(
 new Set(
 safeSchedules
 .map((s) => s.subject?.name || s.mata_pelajaran || s.subject_name || s.activity_name)
 .filter(Boolean)
 )
 )
 }, [safeSchedules])

 const uniqueTeachers = useMemo(() => {
 return Array.from(
 new Set(
 safeSchedules
 .map((s) => s.employee?.nama_lengkap || s.teacher?.name || s.guru_pengampu)
 .filter(Boolean)
 )
 )
 }, [safeSchedules])

 // Jadwal Hari Ini
 const todaySchedules = useMemo(() => {
 let list = safeSchedules.filter((s) => {
 const dayNum = Number(s.day_of_week ?? s.hari_index)
 return dayNum === todayDayIndex || (todayDayIndex === 0 && dayNum === 7) || (todayDayIndex === 7 && dayNum === 0)
 })
 if (selectedSubject !== 'all') {
 list = list.filter((s) => (s.subject?.name || s.mata_pelajaran || s.subject_name || s.activity_name) === selectedSubject)
 }
 if (search.trim()) {
 const q = search.toLowerCase()
 list = list.filter((s) => {
 const sub = (s.subject?.name || s.mata_pelajaran || s.subject_name || s.activity_name || '').toLowerCase()
 const tea = (s.employee?.nama_lengkap || s.teacher?.name || s.guru_pengampu || '').toLowerCase()
 const room = (s.room || s.ruangan || '').toLowerCase()
 return sub.includes(q) || tea.includes(q) || room.includes(q)
 })
 }
 return list
 }, [safeSchedules, todayDayIndex, selectedSubject, search])

 // Jadwal per Hari Terpilih
 const daySchedules = useMemo(() => {
 return safeSchedules.filter((s) => {
 const dayNum = Number(s.day_of_week ?? s.hari_index)
 const selNum = Number(selectedDay)
 const dayMatch = dayNum === selNum || (selNum === 0 && dayNum === 7) || (selNum === 7 && dayNum === 0)
 const subjectName = s.subject?.name || s.mata_pelajaran || s.subject_name || s.activity_name || ''
 const teacherName = s.employee?.nama_lengkap || s.teacher?.name || s.guru_pengampu || ''
 const roomName = s.room || s.ruangan || ''

 const searchMatch =
 !search ||
 subjectName.toLowerCase().includes(search.toLowerCase()) ||
 teacherName.toLowerCase().includes(search.toLowerCase()) ||
 roomName.toLowerCase().includes(search.toLowerCase())

 const subjectMatch = selectedSubject === 'all' || subjectName === selectedSubject
 return dayMatch && searchMatch && subjectMatch
 })
 }, [safeSchedules, selectedDay, search, selectedSubject])

 // Fetch Jadwal Ujian Terpadu (PTS/PAS/PAT) ala Mobile App
 const loadExamSchedules = useCallback(async () => {
 setLoadingExams(true)
 try {
 const res = await api.get('/exam-schedules').catch(() => ({ data: { data: [] } }))
 const list = res.data?.data?.data || res.data?.data || []
 setExamSchedules(Array.isArray(list) ? list : [])
 } catch {
 setExamSchedules([])
 } finally {
 setLoadingExams(false)
 }
 }, [])

 useEffect(() => {
 if (activeWorkspaceMode === 'exam') {
 loadExamSchedules()
 }
 }, [activeWorkspaceMode, loadExamSchedules])

 // Kategori Ujian Unik
 const examCategories = useMemo(() => {
 const set = new Set()
 examSchedules.forEach((item) => {
 const cat = item.exam_category?.name || item.exam_category || item.category
 if (cat) set.add(cat)
 })
 return Array.from(set)
 }, [examSchedules])

 const filteredExamSchedules = useMemo(() => {
 if (selectedExamCategory === 'all') return examSchedules
 return examSchedules.filter((item) => {
 const cat = item.exam_category?.name || item.exam_category || item.category
 return cat === selectedExamCategory
 })
 }, [examSchedules, selectedExamCategory])

 // Distribusi Jam Pelajaran (JP) untuk Tab Rekap
 const subjectDistribution = useMemo(() => {
 const counts = {}
 safeSchedules.forEach((s) => {
 const name = s.subject?.name || s.mata_pelajaran || s.subject_name || '-'
 counts[name] = (counts[name] || 0) + 1
 })
 const effectiveWeeksSemester = activeChild?.semester?.effective_weeks || activeChild?.effective_weeks || 18
 const effectiveWeeksYear = activeChild?.academic_year?.effective_weeks || (effectiveWeeksSemester * 2)

 const list = Object.entries(counts).map(([name, count]) => ({
 name,
 weekly: count,
 monthly: Math.round(count * (effectiveWeeksSemester / 4)),
 semester: count * effectiveWeeksSemester,
 year: count * effectiveWeeksYear,
 }))
 if (selectedSubject !== 'all') {
 return list.filter((item) => item.name === selectedSubject)
 }
 return list
 }, [safeSchedules, selectedSubject, activeChild])

 // ── 5. DATA MATRIKS SEMUA JADWAL (SENIN S/D AHAD) ──
 const [matrixSearch, setMatrixSearch] = useState('')
 const [isPrintingMatrix, setIsPrintingMatrix] = useState(false)

 // Ekstrak slot waktu unik dari data jadwal secara dinamis
 const matrixTimeSlots = useMemo(() => {
 const slotsMap = new Map()
 safeSchedules.forEach((s) => {
 const start = (s.time_start || s.jam_mulai || '').slice(0, 5)
 const end = (s.time_end || s.jam_selesai || '').slice(0, 5)
 if (start && end) {
 const key = `${start}-${end}`
 if (!slotsMap.has(key)) {
 slotsMap.set(key, { key, start, end, label: `${start} - ${end}` })
 }
 }
 })

 return Array.from(slotsMap.values()).sort((a, b) => a.start.localeCompare(b.start))
 }, [safeSchedules])

 // Handler Cetak Semua Jadwal Resmi (A4 Landscape Matriks)
 const handlePrintAllSchedule = async () => {
 setIsPrintingMatrix(true)
 try {
 const kelasId = activeChild?.kelas_id || activeChild?.class_id
 const unitId = activeChild?.unit_id || activeChild?.education_unit_id
 let matrixData = null

 if (kelasId) {
 matrixData = await scheduleService.getMatrix({ kelas_id: kelasId, unit_id: unitId }).catch(() => null)
 }

 if (!matrixData || !matrixData.matrix_rows || !matrixData.kop) {
 const matrix_rows = matrixTimeSlots.map((slot, index) => {
 const daysObj = {}
 DAYS.forEach((d) => {
 const match = safeSchedules.find((s) => {
 const dayMatch =
 Number(s.day_of_week ?? s.hari_index) === d.id ||
 (d.id === 0 && Number(s.day_of_week ?? s.hari_index) === 7) ||
 (d.id === 7 && Number(s.day_of_week ?? s.hari_index) === 0)
 const start = (s.time_start || s.jam_mulai || '').slice(0, 5)
 return dayMatch && start === slot.start
 })
 if (match) {
 const subj = match.subject?.name || match.mata_pelajaran || match.subject_name || match.activity_name
 const teacher = match.employee?.nama_lengkap || match.teacher?.name || match.guru_pengampu
 daysObj[d.id] = {
 subject_name: subj,
 teacher_name: teacher,
 room: match.room || match.ruangan,
 activity_type: match.activity_type || 'kbm',
 }
 }
 })
 return {
 no: index + 1,
 time: { start: slot.start, end: slot.end, label: slot.label },
 days: daysObj,
 }
 })

 matrixData = {
 kop: {
 school_name: activeChild?.unit_name || activeChild?.unit?.nama || activeChild?.educationUnit?.nama || 'Unit Pendidikan',
 address: activeChild?.unit_address || activeChild?.unit?.alamat || activeChild?.educationUnit?.alamat || activeChild?.education_unit?.alamat || '',
 is_boarding: Boolean(activeChild?.is_pesantren || (activeChild?.unit_name || '').toLowerCase().includes('pesantren')),
 },
 kelas: {
 nama_kelas: activeChild?.kelas?.nama_kelas || activeChild?.class_name || 'Kelas',
 },
 matrix_rows,
 }
 }

 printMatrixSchedule(matrixData)
 } catch {
 window.print()
 } finally {
 setIsPrintingMatrix(false)
 }
 }

 const openSessionDetail = (item) => {
 setSelectedSessionDetail(item)
 setIsDetailModalOpen(true)
 }

 const closeSessionDetail = () => {
 setIsDetailModalOpen(false)
 setSelectedSessionDetail(null)
 }

 // Format Tanggal Terpilih
 const formattedSelectedDateText = useMemo(() => {
 const days = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
 const dayName = days[selectedDate.getDay()]
 const dNum = selectedDate.getDate()
 const mName = MONTH_NAMES[selectedDate.getMonth()]
 const yNum = selectedDate.getFullYear()
 return `${dayName}, ${dNum} ${mName} ${yNum}`
 }, [selectedDate])

 const isSelectedDateToday = useMemo(() => {
 const now = new Date()
 return (
 now.getFullYear() === selectedDate.getFullYear() &&
 now.getMonth() === selectedDate.getMonth() &&
 now.getDate() === selectedDate.getDate()
 )
 }, [selectedDate])

 return (
 <div className="space-y-6">
 {/* ─────────────────────────────────────────────────────────────────────────────
 1. HEADER WORKSPACE DENGAN TABS HEROUI STYLE (HARIAN vs SEMUA JADWAL vs UJIAN vs REKAP)
 ───────────────────────────────────────────────────────────────────────────── */}
 <Card className="border border-emerald-200/80 dark:border-emerald-800/60 bg-white/95 dark:bg-[#1B2433] shadow-sm rounded-xl overflow-hidden">
 <CardContent className="p-4 sm:p-5">
 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
 <div className="flex items-center gap-3">
 <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm">
 <CalendarDays className="h-5 w-5" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
 Pusat Jadwal Pelajaran & KBM
 </h2>
 <HeroChip
 size="sm"
 color="success"
 variant="flat"
 className="font-extrabold text-[10px]"
 >
 {activeChild?.academic_year?.name || activeChild?.tahun_ajaran || 'Tahun Ajaran Aktif'}
 </HeroChip>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 {activeChild
 ? `Jadwal operasional ananda ${activeChild.name || activeChild.full_name || 'Santri'} (${activeChild.unit_name || 'Unit'})`
 : 'Pemantauan jadwal pembelajaran harian, pekanan, dan ujian'}
 </p>
 </div>
 </div>

 {/* 4 Tombol Segmentasi HeroUI Style */}
 <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-700/80/70 overflow-x-auto no-scrollbar">
 {[
 { id: 'kbm', label: 'Jadwal Harian', icon: CalendarDays, desc: 'Per Hari & Realtime' },
 { id: 'semua', label: 'Semua Jadwal', icon: LayoutGrid, desc: 'Tabel Matriks Mingguan' },
 { id: 'exam', label: 'Jadwal Ujian (PTS/PAS)', icon: FileCheck2, desc: 'Jadwal Evaluasi' },
 { id: 'rekap', label: 'Rekap Jam Belajar (JP)', icon: Clock, desc: 'Alokasi Semester' },
 ].map((tab) => {
 const isSel = activeWorkspaceMode === tab.id
 const IconComponent = tab.icon
 return (
 <button
 key={tab.id}
 type="button"
 onClick={() => setActiveWorkspaceMode(tab.id)}
 className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
 isSel
 ? 'bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:text-white shadow-sm ring-2 ring-emerald-500/25 scale-[1.01]'
 : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700/60 font-bold'
 }`}
 >
 <IconComponent className="h-4 w-4" />
 <span>{tab.label}</span>
 </button>
 )
 })}
 </div>
 </div>
 </CardContent>
 </Card>

 {/* ─────────────────────────────────────────────────────────────────────────────
 2. KPI SUMMARY CARDS (HEROUI CARDS)
  ───────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-emerald-100/90 hover:!bg-emerald-200/70 p-4 shadow-sm transition-all duration-300 dark:border-emerald-800/60 dark:!bg-emerald-950/50">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl !bg-emerald-600 !text-white shadow-sm dark:!bg-emerald-600 dark:!text-white">
              <CalendarCheck className="h-5 w-5 text-white" />
            </span>
            <span className="inline-flex items-center rounded-lg bg-emerald-200/80 px-2 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
              Hari Ini
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-800 dark:text-emerald-200">
              {todaySchedules.length}
            </span>
            <span className="text-xs font-bold text-emerald-700/80 dark:text-emerald-400/80 ml-1.5">Sesi</span>
          </div>
          <p className="mt-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">Pelajaran Hari Ini</p>
          <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80">{formattedSelectedDateText}</p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-sky-100/90 hover:!bg-sky-200/70 p-4 shadow-sm transition-all duration-300 dark:border-emerald-800/60 dark:!bg-sky-950/50">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl !bg-emerald-600 !text-white shadow-sm dark:!bg-sky-600 dark:!text-white">
              <Clock className="h-5 w-5 text-white" />
            </span>
            <span className="inline-flex items-center rounded-lg bg-sky-200/80 px-2 py-0.5 text-[10px] font-black text-sky-800 dark:bg-sky-900/60 dark:text-sky-200">
              Pekanan
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-sky-800 dark:text-sky-200">
              {serverKpi?.weekly_count ?? safeSchedules.length}
            </span>
            <span className="text-xs font-bold text-sky-700/80 dark:text-sky-400/80 ml-1.5">JP / Pekan</span>
          </div>
          <p className="mt-1 text-xs font-bold text-sky-800 dark:text-sky-300">Total Sesi Mingguan</p>
          <p className="text-xs text-sky-700/80 dark:text-sky-400/80">Alokasi jam pelajaran</p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-amber-100/90 hover:!bg-amber-200/70 p-4 shadow-sm transition-all duration-300 dark:border-emerald-800/60 dark:!bg-amber-950/50">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl !bg-amber-600 !text-white shadow-sm dark:!bg-amber-600 dark:!text-white">
              <BookOpen className="h-5 w-5 text-white" />
            </span>
            <span className="inline-flex items-center rounded-lg bg-amber-200/80 px-2 py-0.5 text-[10px] font-black text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
              {semesterLabel}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-800 dark:text-amber-200">
              {serverKpi?.subject_count ?? uniqueSubjects.length}
            </span>
            <span className="text-xs font-bold text-amber-700/80 dark:text-amber-400/80 ml-1.5">Mapel</span>
          </div>
          <p className="mt-1 text-xs font-bold text-amber-800 dark:text-amber-300">Mata Pelajaran Aktif</p>
          <p className="text-xs text-amber-700/80 dark:text-amber-400/80">Kurikulum terintegrasi</p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-purple-100/90 hover:!bg-purple-200/70 p-4 shadow-sm transition-all duration-300 dark:border-emerald-800/60 dark:!bg-purple-950/50">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl !bg-purple-600 !text-white shadow-sm dark:!bg-purple-600 dark:!text-white">
              <User className="h-5 w-5 text-white" />
            </span>
            <span className="inline-flex items-center rounded-lg bg-purple-200/80 px-2 py-0.5 text-[10px] font-black text-purple-800 dark:bg-purple-900/60 dark:text-purple-200">
              Pengajar
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-purple-800 dark:text-purple-200">
              {serverKpi?.teacher_count ?? uniqueTeachers.length}
            </span>
            <span className="text-xs font-bold text-purple-700/80 dark:text-purple-400/80 ml-1.5">Ustadz/ah</span>
          </div>
          <p className="mt-1 text-xs font-bold text-purple-800 dark:text-purple-300">Guru Pengampu</p>
          <p className="text-xs text-purple-700/80 dark:text-purple-400/80">
            {activeChild?.kelas?.nama_kelas || activeChild?.class_name ? `Kelas ${activeChild?.kelas?.nama_kelas || activeChild?.class_name}` : 'Pengajar aktif'}
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
  3. KONTEN MODE 1: JADWAL KBM & KEGIATAN HARIAN/PEKANAN
 ───────────────────────────────────────────────────────────────────────────── */}
 {activeWorkspaceMode === 'kbm' && (
 <div className="space-y-5 animate-[fadeIn_0.2s_ease-out]">
 {/* CONTROL BAR: PEMILIH HARI 7-DAY STRIP & FILTER MATA PELAJARAN */}
 <Card className="border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] rounded-xl shadow-xs overflow-hidden">
 <CardContent className="p-5 space-y-4">
 {/* Row 1: Sub-mode (Hari Ini vs Mingguan) + Quick Today Button */}
 <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-4">
 <div className="flex items-center gap-2">
 <div className="flex items-center gap-1 p-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-700/80">
 <button
 type="button"
 onClick={() => {
 setKbmViewMode('today')
 setSelectedDay(todayDayIndex)
 setSelectedDate(new Date())
 }}
 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
 kbmViewMode === 'today'
 ? 'bg-emerald-600 text-white shadow-xs'
 : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
 }`}
 >
 <Sparkles className="h-3.5 w-3.5" />
 <span>Hari Ini</span>
 </button>
 <button
 type="button"
 onClick={() => setKbmViewMode('weekly')}
 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
 kbmViewMode === 'weekly'
 ? 'bg-emerald-600 text-white shadow-xs'
 : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
 }`}
 >
 <CalendarDays className="h-3.5 w-3.5" />
 <span>Jadwal Mingguan</span>
 </button>
 </div>

 {!isSelectedDateToday && (
 <HeroButton
 size="sm"
 color="success"
 variant="flat"
 onPress={() => {
 setSelectedDate(new Date())
 setSelectedDay(todayDayIndex)
 }}
 className="inline-flex items-center gap-1.5 font-bold text-xs"
 >
 <RotateCcw className="h-3.5 w-3.5 shrink-0" />
 <span>Kembali ke Hari Ini</span>
 </HeroButton>
 )}
 </div>

 {/* Input Tanggal Riil Kalender */}
 <div className="flex items-center gap-2">
 <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Tanggal:</span>
 <DatePicker
 aria-label="Pilih Tanggal Jadwal"
 value={selectedDate.toISOString().slice(0, 10)}
 onChange={(e) => {
 if (e.target.value) {
 const newD = new Date(e.target.value)
 setSelectedDate(newD)
 setSelectedDay(newD.getDay())
 }
 }}
 className="w-40"
 inputClassName="h-8 text-xs font-black text-emerald-950 dark:text-emerald-200"
 />
 </div>
 </div>

 {/* Row 2: 7-Day Pill Strip (Senin s/d Ahad) */}
 <div>
 <p className="text-xs font-black uppercase text-slate-400 mb-2">Pilih Hari Belajar:</p>
 <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
 {DAYS.map((day) => {
 const isSel = Number(selectedDay) === Number(day.id)
 const isToday = Number(day.id) === Number(todayDayIndex)
 return (
 <button
 key={day.id}
 type="button"
 onClick={() => {
 setSelectedDay(day.id)
 // Ubah selectedDate ke hari terdekat yang sesuai
 const d = new Date()
 const curDay = d.getDay()
 const diff = (day.id - curDay + 7) % 7
 d.setDate(d.getDate() + diff)
 setSelectedDate(d)
 }}
 className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer relative ${
 isSel
 ? 'bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:text-white border-emerald-200/80 dark:border-emerald-800/60 shadow-sm scale-[1.02]'
 : isToday
 ? 'bg-emerald-50/80 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-300'
 : 'bg-slate-50 border-emerald-200/80 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800 dark:border-emerald-700/80 dark:text-slate-300'
 }`}
 >
 {isToday && (
 <span className={`text-[9px] font-black uppercase mb-0.5 ${isSel ? 'text-emerald-100' : 'text-emerald-600 dark:text-emerald-400'}`}>
 • Hari Ini
 </span>
 )}
 <span className="font-black text-sm">{day.short}</span>
 <span className={`text-[10px] font-medium ${isSel ? 'text-emerald-100' : 'text-slate-400'}`}>
 {day.name.split(' ')[0]}
 </span>
 </button>
 )
 })}
 </div>
 </div>

 {/* Row 3: Filter Kategori & Search Input */}
 <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
 <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto no-scrollbar">
 <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
 <Filter className="h-3.5 w-3.5" />
 <span>Mapel:</span>
 </span>

 <HeroChip
 size="sm"
 variant={selectedSubject === 'all' ? 'solid' : 'flat'}
 color="success"
 className="cursor-pointer font-bold"
 onClick={() => setSelectedSubject('all')}
 >
 Semua ({uniqueSubjects.length})
 </HeroChip>

 {uniqueSubjects.slice(0, 8).map((sub, idx) => {
 const isSel = selectedSubject === sub
 const styleMeta = getSubjectStyleMeta(sub, idx)
 return (
 <HeroChip
 key={sub}
 size="sm"
 variant={isSel ? 'solid' : 'flat'}
 color={styleMeta.color}
 className="cursor-pointer font-bold"
 onClick={() => setSelectedSubject(sub)}
 >
 {sub}
 </HeroChip>
 )
 })}

 {selectedSubject !== 'all' && (
 <HeroButton
 size="sm"
 color="danger"
 variant="light"
 onPress={() => setSelectedSubject('all')}
 className="font-bold text-xs h-7"
 >
 Reset Mapel
 </HeroButton>
 )}
 </div>

 <div className="relative min-w-[240px]">
 <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Cari pelajaran, guru, atau ruang..."
 className="h-9 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 pl-8 pr-3 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200"
 />
 {search && (
 <button
 type="button"
 onClick={() => setSearch('')}
 className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
 >
 <X className="h-3.5 w-3.5" />
 </button>
 )}
 </div>
 </div>
 </CardContent>
 </Card>

 {/* ─────────────────────────────────────────────────────────────────────────────
 MILESTONE TIMELINE KBM (JALUR PEMBELAJARAN SESI)
 ───────────────────────────────────────────────────────────────────────────── */}
 <Card className="border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] rounded-xl shadow-sm overflow-hidden">
 <CardHeader className="bg-white dark:bg-[#1B2433] border-b border-emerald-200/80 dark:border-emerald-800/60 p-5 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-teal-950/20">
 <div className="flex items-center justify-between w-full">
 <div className="flex items-center gap-2.5">
 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
 <CalendarCheck className="h-4 w-4" />
 </div>
 <div>
 <h3 className="text-sm font-black text-slate-900 dark:text-white">
 {kbmViewMode === 'today' ? 'Jadwal Pembelajaran Hari Ini' : `Jadwal Pelajaran Hari ${DAYS.find((d) => d.id === selectedDay)?.name}`}
 </h3>
 <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
 {formattedSelectedDateText} · {(kbmViewMode === 'today' ? todaySchedules : daySchedules).length} Sesi Terjadwal
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <HeroChip size="sm" color="success" variant="dot" className="font-black text-xs">
 Realtime Monitoring
 </HeroChip>
 </div>
 </div>
 </CardHeader>

 <CardContent className="p-5 sm:p-6">
 {loading ? (
 <div className="py-16 text-center space-y-3">
 <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-500 border-r-transparent" />
 <p className="text-xs font-bold text-slate-500">Memuat jadwal pembelajaran dari server...</p>
 </div>
 ) : (kbmViewMode === 'today' ? todaySchedules : daySchedules).length > 0 ? (
 <div className="relative border-l-2 border-slate-500/30 pl-6 space-y-6">
 {(kbmViewMode === 'today' ? todaySchedules : daySchedules).map((item, idx) => {
 const timeStart = (item.time_start || item.jam_mulai || '').slice(0, 5)
 const timeEnd = (item.time_end || item.jam_selesai || '').slice(0, 5)
 const status = getSessionTimelineStatus(timeStart, timeEnd, selectedDate)
 const isCurrent = status === 'current'
 const isPast = status === 'past'

 const subjectName = item.subject?.name || item.mata_pelajaran || item.subject_name || item.activity_name || '-'
 const styleMeta = getSubjectStyleMeta(subjectName, idx)
 const teacherName = item.employee?.nama_lengkap || item.teacher?.name || item.guru_pengampu || '-'
 const roomName = item.room || item.ruangan || '-'

 // Data presensi anak pada sesi ini (jika ada)
 const att = item.attendance || item.presensi

 // Data jurnal KBM
 const journal = item.journal || item.learning

 return (
 <div key={item.id || idx} className="relative group">
 {/* Node Timeline */}
 <span
 className={`absolute -left-[31px] top-4 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-4 transition-all ${
 isCurrent
 ? 'bg-emerald-500 ring-emerald-300 animate-pulse'
 : isPast
 ? 'bg-slate-400 ring-slate-100 dark:ring-slate-800'
 : 'bg-emerald-600 ring-emerald-100 dark:ring-emerald-950'
 }`}
 />

 {/* Kartu Sesi HeroUI Style */}
 <Card
 isPressable
 onPress={() => openSessionDetail(item)}
 className={`w-full border-2 transition-all duration-200 rounded-xl overflow-hidden text-left ${
 isCurrent
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] dark:border-emerald-800/60 dark:from-emerald-950/60 dark:to-slate-900 shadow-sm ring-2 ring-emerald-500/20'
 : isPast
 ? 'border-emerald-200/80 bg-slate-50/60 hover:border-emerald-300 dark:hover:border-emerald-700 dark:border-emerald-800/60 dark:bg-slate-800/40'
 : 'border-emerald-200/80 bg-white hover:border-emerald-300 dark:hover:border-emerald-700 dark:border-emerald-800/60 dark:bg-slate-900 shadow-2xs'
 }`}
 >
 <CardContent className="p-4 sm:p-5">
 <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
 <div className="min-w-0 space-y-1">
 {/* Waktu & Status Badge */}
 <div className="flex flex-wrap items-center gap-2">
 <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-xs font-black text-emerald-700 dark:text-slate-200 border border-emerald-200/80 dark:border-emerald-700/80">
 <Clock className="h-3 w-3 text-emerald-600" />
 <span>{timeStart} - {timeEnd} WIB</span>
 </span>

 {isCurrent && (
 <HeroChip size="sm" color="success" variant="solid" className="font-black text-[10px] animate-pulse">
 <span className="flex items-center gap-1">
 <Radio className="h-3 w-3" />
 <span>SEDANG BERLANGSUNG (LIVE)</span>
 </span>
 </HeroChip>
 )}
 {isPast && (
 <HeroChip size="sm" color="default" variant="flat" className="font-bold text-[10px]">
 Selesai
 </HeroChip>
 )}
 {!isCurrent && !isPast && (
 <HeroChip size="sm" color="primary" variant="flat" className="font-bold text-[10px]">
 Akan Datang
 </HeroChip>
 )}

 <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${styleMeta.badgeBg}`}>
 {styleMeta.category}
 </span>
 </div>

 {/* Judul Mata Pelajaran */}
 <h4 className="text-base font-black text-slate-900 dark:text-white pt-1">
 {subjectName}
 </h4>

 {/* Pengajar & Ruangan */}
 <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300 pt-0.5">
 <span className="flex items-center gap-1.5 font-bold">
 <User className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
 <span>Guru: {teacherName}</span>
 </span>
 <span className="flex items-center gap-1.5 font-semibold text-slate-500">
 <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
 <span>Ruang: {roomName}</span>
 </span>
 </div>
 </div>

 <HeroButton
 size="sm"
 color="success"
 variant="light"
 endContent={<ChevronRight className="h-3.5 w-3.5" />}
 className="font-bold text-xs shrink-0 self-end sm:self-center"
 >
 Rincian
 </HeroButton>
 </div>

 {/* Section Presensi Siswa per Sesi */}
 <div className="mt-3.5 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
 <span className="text-slate-500 font-bold flex items-center gap-1.5">
 <CalendarCheck className="h-3.5 w-3.5 text-emerald-600" />
 <span>Status Presensi Sesi:</span>
 </span>

 {att ? (
 <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg font-black text-xs ${
 att.status === 'hadir'
 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
 : att.status === 'sakit'
 ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
 : att.status === 'izin'
 ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
 : att.status === 'terlambat'
 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
 : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
 }`}>
 <CheckCircle2 className="h-3.5 w-3.5" />
 <span>{att.status_label || att.status?.toUpperCase()}</span>
 {att.arrival_time ? ` (${att.arrival_time} WIB)` : ''}
 </span>
 ) : (
 <span className="text-slate-400 font-semibold text-xs bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
 Belum Dicatat Guru
 </span>
 )}
 </div>

 {/* Section Catatan Jurnal Pembelajaran Guru */}
 {journal && (journal.topic || journal.learning_material || journal.meeting_notes) && (
 <div className="mt-2.5 rounded-xl bg-teal-50/70 p-3 text-xs border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-teal-950/30 dark:border-emerald-800/60">
 <div className="flex items-center justify-between gap-2 mb-1">
 <span className="text-[10px] font-black uppercase text-teal-800 dark:text-teal-300 flex items-center gap-1">
 <BookMarked className="h-3 w-3" />
 <span>Jurnal Pembelajaran {journal.meeting_number ? `· Pertemuan #${journal.meeting_number}` : ''}</span>
 </span>
 {journal.finalized_at && (
 <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
 Disinkronkan {journal.finalized_at} WIB
 </span>
 )}
 </div>
 <p className="font-bold text-slate-800 dark:text-slate-200">
 {journal.topic || journal.learning_material || '-'}
 </p>
 {journal.meeting_notes && (
 <p className="mt-1 text-xs text-teal-950/80 dark:text-teal-200/80 italic">
 "{journal.meeting_notes}"
 </p>
 )}
 </div>
 )}
 </CardContent>
 </Card>
 </div>
 )
 })}
 </div>
 ) : (
 <div className="py-14 px-4 text-center max-w-lg mx-auto space-y-4">
 {(kbmViewMode === 'today' ? (todayDayIndex === 0 || todayDayIndex === 6) : (Number(selectedDay) === 0 || Number(selectedDay) === 6)) && !search && selectedSubject === 'all' ? (
 <>
 <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-emerald-200/80 dark:border-emerald-800/60">
 <CalendarDays className="h-7 w-7" />
 </div>
 <div className="space-y-1">
 <h3 className="text-base font-black text-slate-900 dark:text-white">
 {(kbmViewMode === 'today' ? todayDayIndex : Number(selectedDay)) === 0 ? 'Libur Akhir Pekan (Hari Ahad)' : 'Libur Akhir Pekan (Hari Sabtu)'}
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Tidak ada kegiatan belajar mengajar pada hari akhir pekan. Anda dapat memeriksa jadwal aktif untuk hari Senin mendatang atau meninjau seluruh matriks jadwal sepekan.
 </p>
 </div>
 <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
 <HeroButton
 size="sm"
 color="success"
 variant="solid"
 className="font-bold text-xs bg-[#059669] hover:bg-[#047857] text-white"
 onPress={() => {
 setKbmViewMode('weekly')
 setSelectedDay(1)
 const d = new Date()
 const curDay = d.getDay()
 const diff = (1 - curDay + 7) % 7 || 7
 d.setDate(d.getDate() + diff)
 setSelectedDate(d)
 }}
 >
 Lihat Jadwal Hari Senin
 </HeroButton>
 <HeroButton
 size="sm"
 color="primary"
 variant="flat"
 className="font-bold text-xs"
 onPress={() => setActiveWorkspaceMode('semua')}
 >
 Buka Semua Jadwal (Matriks)
 </HeroButton>
 </div>
 </>
 ) : (
 <>
 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-slate-400 dark:bg-emerald-950/40">
 <CalendarDays className="h-6 w-6" />
 </div>
 <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
 {selectedSubject !== 'all' || search
 ? 'Tidak ada jadwal yang sesuai dengan filter pencarian.'
 : 'Tidak ada sesi pelajaran aktif untuk hari ini.'}
 </p>
 <p className="text-xs text-slate-400 max-w-md mx-auto">
 {selectedSubject !== 'all' || search
 ? 'Silakan reset filter mata pelajaran atau ubah kata kunci pencarian.'
 : 'Silakan pilih hari lainnya pada panel strip jadwal di atas.'}
 </p>
 {(selectedSubject !== 'all' || search) && (
 <HeroButton
 size="sm"
 color="success"
 onPress={() => {
 setSelectedSubject('all')
 setSearch('')
 }}
 className="font-bold text-xs"
 >
 Tampilkan Semua Sesi
 </HeroButton>
 )}
 </>
 )}
 </div>
 )}
 </CardContent>
 </Card>
 </div>
 )}

 {/* ─────────────────────────────────────────────────────────────────────────────
 3. KONTEN MODE MATRIKS SEMUA JADWAL (SENIN S/D AHAD) - HEROUI STYLE
 ───────────────────────────────────────────────────────────────────────────── */}
 {activeWorkspaceMode === 'semua' && (
 <div className="space-y-5 animate-[fadeIn_0.2s_ease-out]">
 <Card className="border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] rounded-xl shadow-sm overflow-hidden">
 {/* Card Header Toolbar Matriks */}
 <CardHeader className="bg-white dark:bg-[#1B2433] border-b border-emerald-200/80 dark:border-emerald-800/60 p-5 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-teal-950/20">
 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
 <div className="flex items-center gap-3">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-xs">
 <LayoutGrid className="h-5 w-5" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
 Matriks Semua Jadwal Pelajaran
 </h3>
 <HeroChip size="sm" color="success" variant="flat" className="font-extrabold text-[10px]">
 Senin – Ahad
 </HeroChip>
 </div>
 <p className="text-xs text-emerald-800 dark:text-emerald-400 font-medium">
 Tabel terpadu seluruh sesi pembelajaran kelas {activeChild?.kelas?.nama_kelas || activeChild?.class_name || 'ananda'}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2.5">
 <div className="relative w-48 sm:w-64">
 <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 placeholder="Cari mapel / guru..."
 value={matrixSearch}
 onChange={(e) => setMatrixSearch(e.target.value)}
 className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
 />
 {matrixSearch && (
 <button
 type="button"
 onClick={() => setMatrixSearch('')}
 className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
 >
 <X className="h-3.5 w-3.5" />
 </button>
 )}
 </div>

 <HeroButton
          size="sm"
          variant="outline"
          onClick={handlePrintAllSchedule}
          isPending={isPrintingMatrix}
          className="inline-flex items-center gap-1.5 font-bold text-xs border border-emerald-200/80 dark:border-emerald-800/60 bg-indigo-50 text-indigo-700 hover:bg-indigo-100/90 dark:border-emerald-800/60 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 shadow-xs shrink-0 cursor-pointer"
 >
 <Printer className="h-4 w-4 shrink-0" />
 <span>Cetak Semua Jadwal</span>
 </HeroButton>
 </div>
 </div>
 </CardHeader>

 {/* Table Container dengan Horizontal Scroll */}
 <CardContent className="p-4 sm:p-5">
 <div className="relative overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs bg-slate-50/30 dark:bg-slate-900/40">
 <table className="w-full text-left border-collapse min-w-[950px]">
 {/* Table Header */}
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 border-b-2 border-emerald-200/90">
 <th className="sticky left-0 z-20 bg-emerald-100/95 dark:bg-emerald-950/95 px-3 py-3 text-center text-xs font-black text-emerald-950 dark:text-emerald-200 w-28 border-r border-emerald-200/80 dark:border-emerald-800/80">
 Waktu Sesi
 </th>
 {DAYS.map((day) => (
 <th
 key={day.id}
 className="px-3 py-3 text-center text-xs font-black text-emerald-950 dark:text-emerald-200 border-r border-emerald-200/80 dark:border-emerald-800/60 last:border-r-0 min-w-[140px]"
 >
 <div className="flex flex-col items-center justify-center">
 <span className="text-xs uppercase tracking-wider">{day.name}</span>
 <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
 {safeSchedules.filter((s) => Number(s.day_of_week ?? s.hari_index) === day.id).length} Sesi
 </span>
 </div>
 </th>
 ))}
 </tr>
 </thead>

 {/* Table Body */}
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-xs bg-white dark:bg-[#1B2433]">
 {matrixTimeSlots.length === 0 ? (
 <tr>
 <td colSpan={DAYS.length + 1} className="py-12 text-center text-slate-400 font-medium">
 Belum ada slot waktu jadwal pembelajaran untuk kelas ini.
 </td>
 </tr>
 ) : (
 matrixTimeSlots.map((slot, sIdx) => {
 const isBreakSlot = slot.isBreak || slot.start === '09:30' || slot.start === '11:30'

 return (
 <tr
 key={slot.key || sIdx}
 className={`transition-colors ${
 isBreakSlot
 ? 'bg-amber-50/40 dark:bg-amber-950/20'
 : sIdx % 2 === 0
 ? 'bg-white dark:bg-[#1B2433]'
 : 'bg-emerald-50/20 dark:bg-slate-800/30'
 } hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30`}
 >
 {/* Kolom Slot Waktu (Sticky Left) */}
 <td className="sticky left-0 z-10 px-3 py-3 text-center border-r border-emerald-200/80 dark:border-emerald-800/80 bg-inherit font-mono">
 <div className="flex flex-col items-center">
 <span className="text-[10px] font-bold text-slate-400">
 {isBreakSlot ? 'JEDA' : `JAM ${sIdx + 1}`}
 </span>
 <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
 {slot.start}
 </span>
 <span className="text-[10px] text-slate-400">s/d {slot.end}</span>
 </div>
 </td>

 {/* Kolom Tiap Hari (Senin s/d Ahad) */}
 {DAYS.map((day) => {
 const session = safeSchedules.find((s) => {
 const dayMatch =
 Number(s.day_of_week ?? s.hari_index) === day.id ||
 (day.id === 0 && Number(s.day_of_week ?? s.hari_index) === 7) ||
 (day.id === 7 && Number(s.day_of_week ?? s.hari_index) === 0)
 const start = (s.time_start || s.jam_mulai || '').slice(0, 5)
 return dayMatch && start === slot.start
 })

 if (!session) {
 if (isBreakSlot) {
 return (
 <td
 key={day.id}
 className="px-2 py-2 text-center border-r border-emerald-100/70 dark:border-emerald-800/60 last:border-r-0"
 >
 <span className="inline-block px-2 py-0.5 rounded-md bg-amber-100/70 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-[10px] font-black">
 {slot.start === '11:30' ? 'Ishoma' : 'Istirahat'}
 </span>
 </td>
 )
 }
 return (
 <td
 key={day.id}
 className="px-2 py-2 text-center text-slate-300 dark:text-slate-700 font-bold border-r border-emerald-100/70 dark:border-emerald-800/60 last:border-r-0"
 >
 -
 </td>
 )
 }

 const subj = session.subject?.name || session.mata_pelajaran || session.subject_name || session.activity_name || '-'
 const teacher = session.employee?.nama_lengkap || session.teacher?.name || session.guru_pengampu || '-'
 const room = session.room || session.ruangan || '-'
 const style = getSubjectStyleMeta(subj, day.id)

 const isMatchHighlight =
 matrixSearch.trim() &&
 (subj.toLowerCase().includes(matrixSearch.toLowerCase()) ||
 teacher.toLowerCase().includes(matrixSearch.toLowerCase()) ||
 room.toLowerCase().includes(matrixSearch.toLowerCase()))

 return (
 <td
 key={day.id}
 className="p-1.5 border-r border-emerald-100/70 dark:border-emerald-800/60 last:border-r-0 align-top"
 >
 <button
 type="button"
 onClick={() => openSessionDetail(session)}
 className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-sm ${
 isMatchHighlight
 ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 border-slate-400'
 : `${style.bg} ${style.border}`
 }`}
 >
 <div className="flex items-center justify-between gap-1 mb-1">
 <span className={`text-[10px] font-black ${style.accent} truncate uppercase tracking-tight`}>
 {session.activity_type === 'activity' ? 'Kegiatan' : 'KBM'}
 </span>
 <span className="text-[9px] font-mono font-bold text-slate-400">
 {room}
 </span>
 </div>
 <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
 {subj}
 </h4>
 <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate mt-1">
 {teacher}
 </p>
 </button>
 </td>
 )
 })}
 </tr>
 )
 })
 )}
 </tbody>
 </table>
 </div>

 {/* Legend & Tips Matriks Semua Jadwal */}
 <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-emerald-200/80 dark:border-emerald-700/80/60 text-xs">
 <div className="flex flex-wrap items-center gap-3">
 <span className="font-black text-slate-700 dark:text-slate-300">Kategori Warna:</span>
 <div className="flex items-center gap-1.5">
 <span className="h-3 w-3 rounded-md bg-emerald-500" />
 <span className="text-xs text-slate-600 dark:text-slate-400">Al-Qur'an / Agama</span>
 </div>
 <div className="flex items-center gap-1.5">
 <span className="h-3 w-3 rounded-md bg-sky-500" />
 <span className="text-xs text-slate-600 dark:text-slate-400">Eksak / Sains</span>
 </div>
 <div className="flex items-center gap-1.5">
 <span className="h-3 w-3 rounded-md bg-rose-500" />
 <span className="text-xs text-slate-600 dark:text-slate-400">Bahasa / Sosial</span>
 </div>
 <div className="flex items-center gap-1.5">
 <span className="h-3 w-3 rounded-md bg-amber-500" />
 <span className="text-xs text-slate-600 dark:text-slate-400">Istirahat / Sholat</span>
 </div>
 </div>

 <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
 <Sparkles className="h-3.5 w-3.5" />
 <span>Klik pada kartu sesi di tabel untuk melihat presensi santri & materi jurnal</span>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>
 )}

 {/* ─────────────────────────────────────────────────────────────────────────────
 4. KONTEN MODE 2: JADWAL UJIAN TERPADU (PTS / PAS / PAT)
 ───────────────────────────────────────────────────────────────────────────── */}
 {activeWorkspaceMode === 'exam' && (
 <div className="space-y-5 animate-[fadeIn_0.2s_ease-out]">
 <Card className="border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] rounded-xl shadow-xs overflow-hidden">
 <CardContent className="p-5 space-y-4">
 <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-4">
 <div>
 <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
 <FileCheck2 className="h-4 w-4 text-emerald-600" />
 <span>Jadwal Ujian Penilaian Hasil Belajar (PTS / PAS / PAT)</span>
 </h3>
 <p className="text-xs text-slate-500">
 Pemantauan kalender sesi ujian tertulis dan ujian CBT daring
 </p>
 </div>

 <div className="flex items-center gap-1.5">
 <HeroChip
 size="sm"
 variant={selectedExamCategory === 'all' ? 'solid' : 'flat'}
 color="success"
 className="cursor-pointer font-bold"
 onClick={() => setSelectedExamCategory('all')}
 >
 Semua Kategori
 </HeroChip>
 {examCategories.map((cat) => (
 <HeroChip
 key={cat}
 size="sm"
 variant={selectedExamCategory === cat ? 'solid' : 'flat'}
 color="primary"
 className="cursor-pointer font-bold"
 onClick={() => setSelectedExamCategory(cat)}
 >
 {cat}
 </HeroChip>
 ))}
 </div>
 </div>

 {loadingExams ? (
 <div className="py-16 text-center space-y-3">
 <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-500 border-r-transparent" />
 <p className="text-xs font-bold text-slate-500">Memuat jadwal ujian santri...</p>
 </div>
 ) : filteredExamSchedules.length > 0 ? (
 <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
 {filteredExamSchedules.map((exam, idx) => (
 <Card
 key={exam.id || idx}
 className="border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl p-4 shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
 >
 <div className="flex items-center justify-between gap-2">
 <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black uppercase">
 {exam.exam_category?.name || exam.category || '-'}
 </span>
 <span className="text-xs font-bold text-slate-500">
 {exam.date || exam.tanggal || '-'}
 </span>
 </div>
 <h4 className="mt-2 text-sm font-black text-slate-900 dark:text-white">
 {exam.subject?.name || exam.mata_pelajaran || '-'}
 </h4>
 <div className="mt-2 text-xs text-slate-500 space-y-1">
 <p className="flex items-center gap-1.5">
 <Clock className="h-3 w-3 text-slate-400" />
 <span>Waktu: <b>{exam.time_start ? `${exam.time_start.slice(0, 5)} - ${(exam.time_end || '').slice(0, 5)} WIB` : '-'}</b></span>
 </p>
 <p className="flex items-center gap-1.5">
 <MapPin className="h-3 w-3 text-slate-400" />
 <span>Ruang: <b>{exam.room || exam.ruangan || '-'}</b></span>
 </p>
 <p className="flex items-center gap-1.5">
 <User className="h-3 w-3 text-slate-400" />
 <span>Pengawas: <b>{exam.proctor_name || exam.pengawas || '-'}</b></span>
 </p>
 </div>
 </Card>
 ))}
 </div>
 ) : (
 <div className="py-14 text-center space-y-2">
 <FileCheck2 className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
 <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
 Belum ada agenda ujian semester aktif pada periode ini.
 </p>
 <p className="text-xs text-slate-400">
 Jadwal Penilaian Tengah Semester (PTS) dan Akhir Semester (PAS) akan dipublikasikan secara resmi oleh panitia ujian.
 </p>
 </div>
 )}
 </CardContent>
 </Card>
 </div>
 )}

 {/* ─────────────────────────────────────────────────────────────────────────────
 5. KONTEN MODE 3: REKAP ALOKASI JAM BELAJAR (BULANAN, SEMESTER, TAHUNAN)
 ───────────────────────────────────────────────────────────────────────────── */}
 {activeWorkspaceMode === 'rekap' && (
 <div className="space-y-5 animate-[fadeIn_0.2s_ease-out]">
 <Card className="border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] rounded-xl shadow-xs overflow-hidden">
 <CardContent className="p-5 space-y-4">
 <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-4">
 <div className="flex items-center gap-2">
 <span className="p-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 inline-flex">
 {[
 { id: 'monthly', label: 'Bulanan (4 Pekan)' },
 { id: 'semester', label: 'Semester (20 Pekan)' },
 { id: 'academic_year', label: 'Tahun Ajaran Penuh' },
 ].map((tab) => (
 <button
 key={tab.id}
 type="button"
 onClick={() => setRekapPeriodTab(tab.id)}
 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
 rekapPeriodTab === tab.id
 ? 'bg-emerald-600 text-white shadow-xs'
 : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
 }`}
 >
 {tab.label}
 </button>
 ))}
 </span>
 </div>

 <p className="text-xs font-semibold text-slate-500">
 Estimasi beban jam pembelajaran (JP) kurikulum terintegrasi
 </p>
 </div>

 {/* Tabel Distribusi JP */}
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:text-emerald-200">
 <tr>
 <th className="py-3 px-4">Mata Pelajaran</th>
 <th className="py-3 px-4 text-center">Beban Mingguan</th>
 <th className="py-3 px-4 text-center">Beban Bulanan</th>
 <th className="py-3 px-4 text-center">Beban Semester</th>
 <th className="py-3 px-4 text-center">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {subjectDistribution.map((item, idx) => (
 <tr key={idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30">
 <td className="py-3 px-4 font-black text-slate-800 dark:text-slate-200">{item.name}</td>
 <td className="py-3 px-4 text-center font-bold text-slate-600 dark:text-slate-400">{item.weekly} JP / Pekan</td>
 <td className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-300">{item.monthly} JP</td>
 <td className="py-3 px-4 text-center font-black text-emerald-600 dark:text-emerald-400">{item.semester} JP</td>
 <td className="py-3 px-4 text-center">
 <HeroChip size="sm" color="success" variant="flat" className="font-extrabold text-[10px]">
 Aktif
 </HeroChip>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>
 </div>
 )}

 {/* ─────────────────────────────────────────────────────────────────────────────
 6. MODAL DETAIL POP-UP SESI JADWAL (HEROUI POP-UP MODAL ALA MOBILE APP)
 ───────────────────────────────────────────────────────────────────────────── */}
 <AppModal
 isOpen={Boolean(isDetailModalOpen && selectedSessionDetail)}
 onClose={closeSessionDetail}
 title={selectedSessionDetail?.subject?.name || selectedSessionDetail?.mata_pelajaran || selectedSessionDetail?.activity_name || '-'}
 description={selectedSessionDetail?.time_start ? `Pukul ${selectedSessionDetail.time_start.slice(0, 5)} - ${(selectedSessionDetail.time_end || '').slice(0, 5)} WIB` : 'Detail Sesi Jadwal Pembelajaran'}
 icon={CalendarDays}
 maxWidth="max-w-lg"
 zIndex="z-[100]"
 footer={
 <div className="flex w-full items-center justify-end">
 <button
 type="button"
 onClick={closeSessionDetail}
 className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-5 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
 >
 Tutup
 </button>
 </div>
 }
 >
 {selectedSessionDetail && (
 <div className="space-y-4 text-xs">
 {/* Box Info Identitas Guru & Ruangan */}
 <div className="grid grid-cols-2 gap-3">
 <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-emerald-200/80 dark:border-emerald-700/80">
 <span className="text-[10px] font-bold text-slate-400 uppercase">Guru Pengampu</span>
 <p className="font-black text-slate-900 dark:text-white mt-0.5">
 {selectedSessionDetail.employee?.nama_lengkap || selectedSessionDetail.teacher?.name || selectedSessionDetail.guru_pengampu || '-'}
 </p>
 </div>
 <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-emerald-200/80 dark:border-emerald-700/80">
 <span className="text-[10px] font-bold text-slate-400 uppercase">Ruangan Kelas</span>
 <p className="font-black text-slate-900 dark:text-white mt-0.5">
 {selectedSessionDetail.room || selectedSessionDetail.ruangan || '-'}
 </p>
 </div>
 </div>

 {/* Section Presensi Siswa */}
 <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
 <div className="flex items-center justify-between">
 <span className="font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
 <CheckCircle2 className="h-4 w-4 text-emerald-600" />
 <span>Presensi Ananda Pada Sesi Ini</span>
 </span>
 {selectedSessionDetail.attendance?.arrival_time && (
 <span className="text-[10px] text-emerald-700 font-bold">
 Tiba: {selectedSessionDetail.attendance.arrival_time} WIB
 </span>
 )}
 </div>
 <p className="text-slate-600 dark:text-slate-300 text-xs">
 Status Kehadiran:{' '}
 <b className="text-emerald-700 dark:text-emerald-400 uppercase">
 {selectedSessionDetail.attendance?.status_label || selectedSessionDetail.attendance?.status || '-'}
 </b>
 </p>
 {selectedSessionDetail.attendance?.notes && (
 <p className="text-xs text-slate-500 italic">
 Catatan: "{selectedSessionDetail.attendance.notes}"
 </p>
 )}
 </div>

 {/* Section Jurnal KBM Guru */}
 <div className="p-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
 <div className="flex items-center justify-between">
 <span className="font-black text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
 <BookMarked className="h-4 w-4 text-teal-600" />
 <span>Jurnal Pembelajaran KBM Guru</span>
 </span>
 {selectedSessionDetail.journal?.finalized_at && (
 <span className="text-[10px] text-teal-700 font-bold">
 Sinkron: {selectedSessionDetail.journal.finalized_at} WIB
 </span>
 )}
 </div>
 <p className="font-bold text-slate-800 dark:text-slate-200">
 {selectedSessionDetail.journal?.topic || selectedSessionDetail.journal?.learning_material || '-'}
 </p>
 {selectedSessionDetail.journal?.meeting_notes && (
 <p className="text-xs text-teal-950/80 dark:text-teal-200/80 italic">
 Catatan Pembina: "{selectedSessionDetail.journal.meeting_notes}"
 </p>
 )}
 </div>
 </div>
 )}
 </AppModal>
 </div>
 )
}
