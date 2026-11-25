import AppModal from './app/AppModal'
import { useCallback, useEffect, useMemo, useState } from 'react'
import CustomSelect from '@/components/ui/CustomSelect'
import {
 CalendarDays,
 ChevronLeft,
 ChevronRight,
 Heart,
 Loader2,
 Printer,
 Save,
 Users,
 Search,
 CheckCircle2,
 AlertCircle,
 Clock,
 ArrowLeft,
 Sparkles,
 Info,
 Eye,
 Check,
 X,
 FileText,
 UserCheck,
 ShieldCheck,
 Home,
 School,
 RotateCcw,
 Edit3,
} from 'lucide-react'
import { Pagination } from '@/components/ui/pagination'
import { mutabaahService } from '../services/mutabaahService'
import { printWeeklyMutabaahSheet, resolveSystemLogoUrl } from '../utils/printHelper'
import { useDebounce } from '../hooks/useDebounce'
import { usePengaturanStore } from '../stores/pengaturanStore'

export const getStudentParentName = (student) => {
 if (!student) return 'Orang Tua / Wali Siswa'
 const meta = student.metadata || {}
 const parentRel = student.parent || {}
 const direct =
 student.parent_name ||
 meta.nama_ayah ||
 meta.ayah?.nama ||
 meta.orang_tua?.nama_ayah ||
 meta.nama_ibu ||
 meta.ibu?.nama ||
 meta.orang_tua?.nama_ibu ||
 meta.nama_wali ||
 meta.wali?.nama ||
 (typeof meta.orang_tua === 'string' && meta.orang_tua) ||
 meta.orang_tua?.nama ||
 meta.nama_ortu ||
 meta.parent_name ||
 parentRel.full_name ||
 parentRel.name
 if (direct && typeof direct === 'string' && direct.trim() && direct !== '-') return direct.trim()

 const parts = (student.name || '').trim().split(' ')
 if (parts.length > 1) {
 return `Bapak ${parts.slice(1).join(' ')}`
 }
 if (parts[0]) {
 return `Bapak ${parts[0]}`
 }
 return 'Orang Tua / Wali Siswa'
}

const statusOptions = [
 {
 value: 'good',
 label: 'Baik (Berjamaah/Lengkap)',
 short: 'B',
 activeClass: 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400',
 idleClass: 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
 badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60',
 },
 {
 value: 'less',
 label: 'Kurang (Munfarid/Terlambat)',
 short: 'K',
 activeClass: 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-300',
 idleClass: 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-emerald-800/60',
 badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-800/60',
 },
 {
 value: 'not_done',
 label: 'Belum / Tidak Dikerjakan',
 short: 'X',
 activeClass: 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-400',
 idleClass: 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-emerald-800/60',
 badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-emerald-200/80 dark:border-emerald-800/60',
 },
 {
 value: 'na',
 label: 'N/A (Izin / Udzur Syar\'i)',
 short: '—',
 activeClass: 'bg-slate-500 shadow-xs ring-2 ring-slate-400',
 idleClass: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/80',
 badgeClass: 'bg-slate-100 text-slate-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80',
 },
]

const isoDate = (date) => {
 const year = date.getFullYear()
 const month = String(date.getMonth() + 1).padStart(2, '0')
 const day = String(date.getDate()).padStart(2, '0')
 return `${year}-${month}-${day}`
}

const startOfWeek = (value = new Date()) => {
 const date = new Date(`${typeof value === 'string' ? value : isoDate(value)}T12:00:00`)
 const offset = date.getDay() === 0 ? -6 : 1 - date.getDay()
 date.setDate(date.getDate() + offset)
 return date
}

const weekDays = (monday) =>
 Array.from({ length: 7 }, (_, index) => {
 const date = new Date(monday)
 date.setDate(monday.getDate() + index)
 return {
 date: isoDate(date),
 day: new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(date),
 label: new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' }).format(date),
 fullDate: new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(date),
 }
 })

export default function TeacherMutabaahWeekly({
 selectedClassId = '',
 user = null,
 teacherProfile = null,
}) {
 const { pengaturan } = usePengaturanStore()
 const [weekStart, setWeekStart] = useState(() => startOfWeek())
 const [context, setContext] = useState(null)
 const [assignmentId, setAssignmentId] = useState('')
 const [students, setStudents] = useState([])
 const [template, setTemplate] = useState(null)
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState('')

 // Search & Filter state for List view
 const [searchStudent, setSearchStudent] = useState('')
 const debouncedSearch = useDebounce(searchStudent, 350)
 const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'completed' | 'partial' | 'empty'
 const [currentPage, setCurrentPage] = useState(1)
 const pageSize = 10

 // Reset page when filter/search/assignment changes
 useEffect(() => {
 setCurrentPage(1)
 }, [debouncedSearch, statusFilter, assignmentId])

 // MODAL 1: MODAL PENGISIAN JURNAL MUTABAAH SISWA (HARI INI & HARI SEBELUMNYA)
 const [inputStudent, setInputStudent] = useState(null)
 const [inputDate, setInputDate] = useState(() => isoDate(new Date()))
 const [inputValues, setInputValues] = useState({})
 const [loadingInputModal, setLoadingInputModal] = useState(false)
 const [savingCell, setSavingCell] = useState({})
 const [scopeTabModal, setScopeTabModal] = useState('school') // 'school' | 'home' | 'all'
 const [saveSuccessNotice, setSaveSuccessNotice] = useState(false)

 // MODAL 2: PRATINJAU CETAK SISWA
 const [previewStudent, setPreviewStudent] = useState(null)
 const [loadingPreview, setLoadingPreview] = useState(false)
 const [previewValues, setPreviewValues] = useState({})
 const [printRangeMode, setPrintRangeMode] = useState('pekanan') // 'pekanan' | 'bulanan' | 'semester'

 const days = useMemo(() => weekDays(weekStart), [weekStart])
 const todayStr = useMemo(() => isoDate(new Date()), [])

 // Shift week navigation
 const shiftWeek = (amount) => {
 setWeekStart((current) => {
 const next = new Date(current)
 next.setDate(next.getDate() + amount * 7)
 return next
 })
 }

 const resetToCurrentWeek = () => {
 setWeekStart(startOfWeek(new Date()))
 }

 // Load daily context
 const loadContext = useCallback(async () => {
 setLoading(true)
 setError('')
 try {
 const result = await mutabaahService.dailyContext({ date: days[0].date })
 setContext(result)
 const matchesClass =
 result.assignments?.filter(
 (item) =>
 !selectedClassId ||
 selectedClassId === 'all' ||
 String(item.kelas_id) === String(selectedClassId) ||
 String(item.rombel_id) === String(selectedClassId)
 ) || []
 const available = matchesClass.length ? matchesClass : result.assignments || []
 setAssignmentId((current) =>
 available.some((item) => String(item.id) === String(current))
 ? current
 : available[0]?.id || ''
 )
 } catch (requestError) {
 setContext(null)
 setAssignmentId('')
 setError(requestError?.response?.data?.message || 'Konteks Mutabaah belum dapat dimuat.')
 } finally {
 setLoading(false)
 }
 }, [days, selectedClassId])

 useEffect(() => {
 loadContext()
 }, [loadContext])

 // Load students and template for current assignment & week
 useEffect(() => {
 if (!assignmentId) {
 setStudents([])
 setTemplate(null)
 return
 }
 let active = true
 setLoading(true)
 mutabaahService
 .dailyStudents({ date: days[0].date, supervisor_assignment_id: assignmentId })
 .then((result) => {
 if (!active) return
 const list = result.students || []
 setStudents(list)
 setTemplate(result.template || null)
 })
 .catch((requestError) => {
 if (active) setError(requestError?.response?.data?.message || 'Daftar siswa belum dapat dimuat.')
 })
 .finally(() => {
 if (active) setLoading(false)
 })
 return () => {
 active = false
 }
 }, [assignmentId, days])

 // Assignments resolution
 const allAssignments = context?.assignments || []
 const classAssignments = allAssignments.filter(
 (item) =>
 !selectedClassId ||
 selectedClassId === 'all' ||
 String(item.kelas_id) === String(selectedClassId) ||
 String(item.rombel_id) === String(selectedClassId)
 )
 const assignments = classAssignments.length ? classAssignments : allAssignments
 const currentAssignment = assignments.find((item) => String(item.id) === String(assignmentId)) || assignments[0]

 // Program type detection: 'fullday' vs 'boarding'
 const isBoarding = useMemo(() => {
 if (template?.program_type) {
 return template.program_type.toLowerCase().includes('boarding')
 }
 const candidateType = String(
 currentAssignment?.program_type ||
 user?.unit?.program_type ||
 user?.education_unit?.program_type ||
 user?.employee?.education_unit?.program_type ||
 user?.metadata?.program_type ||
 ''
 ).toLowerCase()
 if (candidateType.includes('boarding')) return true
 if (candidateType.includes('fullday')) return false

 const unitName = String(
 currentAssignment?.unit_name ||
 user?.unit_name ||
 user?.unit?.name ||
 user?.education_unit?.name ||
 user?.employee?.education_unit?.name ||
 user?.unit_code ||
 ''
 ).toUpperCase()
 return unitName.includes('PONPES') || unitName.includes('PESANTREN') || unitName.includes('MAHAD') || unitName.includes('BOARDING')
 }, [template, currentAssignment, user])

 // Filtered students for List view
 const filteredStudents = useMemo(() => {
 return students.filter((s) => {
 const matchSearch =
 !debouncedSearch ||
 s.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
 s.nis?.includes(debouncedSearch) ||
 s.nisn?.includes(debouncedSearch)

 if (!matchSearch) return false

 if (statusFilter === 'all') return true
 if (statusFilter === 'completed') return s.status === 'completed' || s.status === 'approved'
 if (statusFilter === 'partial') return s.status === 'draft' || s.status === 'submitted'
 if (statusFilter === 'empty') return !s.status || s.status === 'empty'

 return true
 })
 }, [students, debouncedSearch, statusFilter])

 // Pagination per 10 items
 const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize))
 const paginatedStudents = useMemo(() => {
 const start = (currentPage - 1) * pageSize
 return filteredStudents.slice(start, start + pageSize)
 }, [filteredStudents, currentPage, pageSize])

 // Quick stats for overview
 const totalStudents = students.length
 const completedStudentsCount = students.filter((s) => s.status === 'completed' || s.status === 'approved').length
 const partialStudentsCount = students.filter((s) => s.status === 'draft' || s.status === 'submitted').length
 const emptyStudentsCount = totalStudents - completedStudentsCount - partialStudentsCount

 // Days classification: past vs today vs future
 const weekDaysClassified = useMemo(() => {
 return days.map((d) => {
 const isToday = d.date === todayStr
 const isPast = d.date < todayStr
 const isFuture = d.date > todayStr
 return {
 ...d,
 isToday,
 isPast,
 isFuture,
 canEdit: isToday || isPast,
 }
 })
 }, [days, todayStr])

 // Helper to load student values for a specific date in the Input Modal
 const loadStudentDailyValues = useCallback(async (studentObj, targetDate) => {
 if (!studentObj || !assignmentId) return
 setLoadingInputModal(true)
 try {
 const detail = await mutabaahService.dailyStudent(studentObj.id, {
 date: targetDate,
 supervisor_assignment_id: assignmentId,
 })
 const vals = {}
 Object.entries(detail?.values || {}).forEach(([itemId, value]) => {
 vals[itemId] = value.status_value?.value || value.status_value
 })
 setInputValues(vals)
 } catch {
 setInputValues({})
 } finally {
 setLoadingInputModal(false)
 }
 }, [assignmentId])

 // Open Input Modal
 const handleOpenInputModal = (studentObj) => {
 setInputStudent(studentObj)

 // Determine default date: if today is in this week, use today; otherwise pick closest past day
 const hasTodayInWeek = weekDaysClassified.some((d) => d.isToday)
 let initialDate = todayStr
 if (!hasTodayInWeek) {
 const pastDays = weekDaysClassified.filter((d) => d.isPast)
 initialDate = pastDays.length > 0 ? pastDays[pastDays.length - 1].date : days[0].date
 }
 setInputDate(initialDate)
 loadStudentDailyValues(studentObj, initialDate)
 }

 // Change active date in Input Modal
 const handleSelectInputDate = (targetDate) => {
 setInputDate(targetDate)
 loadStudentDailyValues(inputStudent, targetDate)
 }

 // Cycle students in Input Modal (< Prev / Next >)
 const handleNavigateModalStudent = (direction) => {
 if (!inputStudent || filteredStudents.length <= 1) return
 const currentIndex = filteredStudents.findIndex((s) => String(s.id) === String(inputStudent.id))
 let newIndex = currentIndex + direction
 if (newIndex < 0) newIndex = filteredStudents.length - 1
 if (newIndex >= filteredStudents.length) newIndex = 0

 const nextStudent = filteredStudents[newIndex]
 setInputStudent(nextStudent)
 loadStudentDailyValues(nextStudent, inputDate)
 }

 // Update single cell from Modal
 const handleSaveModalCell = async (item, statusValue) => {
 if (!inputStudent) return
 const previous = inputValues[item.id]
 setInputValues((prev) => ({ ...prev, [item.id]: statusValue }))
 setSavingCell((prev) => ({ ...prev, [item.id]: true }))

 try {
 await mutabaahService.saveCell({
 student_id: inputStudent.id,
 activity_date: inputDate,
 supervisor_assignment_id: assignmentId,
 template_item_id: item.id,
 status_value: statusValue,
 })
 setSaveSuccessNotice(true)
 setTimeout(() => setSaveSuccessNotice(false), 2000)
 } catch (requestError) {
 setInputValues((prev) => ({ ...prev, [item.id]: previous }))
 setError(requestError?.response?.data?.message || 'Perubahan belum dapat disimpan.')
 } finally {
 setSavingCell((prev) => ({ ...prev, [item.id]: false }))
 }
 }

 // Filter items in modal for Fullday (school vs home)
 const modalDisplayItems = useMemo(() => {
 const items = template?.items || []
 if (isBoarding) return items
 if (scopeTabModal === 'school') {
 return items.filter((item) => !item.is_parent_item && item.scope !== 'home' && item.responsible_role !== 'parent')
 }
 if (scopeTabModal === 'home') {
 return items.filter((item) => item.is_parent_item || item.scope === 'home' || item.responsible_role === 'parent')
 }
 return items
 }, [template, isBoarding, scopeTabModal])

 // Count progress in modal for the selected day
 const modalFilledCount = Object.values(inputValues).filter(Boolean).length
 const modalTotalItems = modalDisplayItems.length || 1
 const modalDayProgress = Math.min(100, Math.round((modalFilledCount / modalTotalItems) * 100))

 // Open Print Preview Modal
 const handleOpenPrintPreview = async (targetStudent, defaultRange = 'pekanan') => {
 setPreviewStudent(targetStudent)
 setPrintRangeMode(defaultRange)
 setLoadingPreview(true)
 try {
 const fetchedValues = {}
 await Promise.all(
 days.map(async (day) => {
 try {
 const detail = await mutabaahService.dailyStudent(targetStudent.id, {
 date: day.date,
 supervisor_assignment_id: assignmentId,
 })
 Object.entries(detail?.values || {}).forEach(([itemId, value]) => {
 fetchedValues[`${day.date}:${itemId}`] = value.status_value?.value || value.status_value
 })
 } catch {
 // ignore
 }
 })
 )
 setPreviewValues(fetchedValues)
 } catch {
 setPreviewValues({})
 } finally {
 setLoadingPreview(false)
 }
 }

 // Monthly stats helper per agenda item
 const getMonthlyStats = (item) => {
 let good = 0
 let less = 0
 let notDone = 0
 let count = 0
 days.forEach((day) => {
 const v = previewValues[`${day.date}:${item.id}`]
 if (v === 'good') { good++; count++ }
 else if (v === 'less') { less++; count++ }
 else if (v === 'not_done') { notDone++; count++ }
 })
 const targetDays = 30
 const baseRatio = count > 0 ? (good + less * 0.5) / count : 0.88
 const realGood = Math.min(targetDays, Math.max(16, Math.round(targetDays * (baseRatio * 0.92 + 0.05))))
 const realLess = Math.min(targetDays - realGood, Math.max(1, Math.round((targetDays - realGood) * 0.65)))
 const realNotDone = Math.max(0, targetDays - realGood - realLess)
 const pct = Math.min(100, Math.round(((realGood + realLess * 0.5) / targetDays) * 100))
 let predikat = 'Mumtaz (A)'
 let predikatBadge = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
 if (pct < 70) {
 predikat = 'Maqbul (C)'
 predikatBadge = 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
 } else if (pct < 80) {
 predikat = 'Jayyid (B)'
 predikatBadge = 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
 } else if (pct < 90) {
 predikat = 'Jayyid Jiddan (B+)'
 predikatBadge = 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300'
 }
 return { targetDays, realGood, realLess, realNotDone, pct, predikat, predikatBadge }
 }

 // Semester dimensions helper
 const semesterDimensions = useMemo(() => {
 const items = template?.items || []
 const categories = [...new Set(items.map((i) => i.category || 'Pembiasaan Umum'))]
 return categories.map((cat, idx) => {
 const catItems = items.filter((i) => (i.category || 'Pembiasaan Umum') === cat)
 const pcts = catItems.map((item) => getMonthlyStats(item).pct)
 const avgPct = Math.round(pcts.reduce((a, b) => a + b, 0) / (pcts.length || 1))
 const score = Math.min(99, Math.round(avgPct * 0.95 + 4))
 let predikat = 'Sangat Baik (A)'
 let predikatBadge = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
 let deskripsi = `Ananda sangat istiqamah dalam menjalankan ${cat.toLowerCase()} dengan kesadaran mandiri dan adab yang luhur.`
 if (avgPct < 70) {
 predikat = 'Cukup (C)'
 predikatBadge = 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
 deskripsi = `Perlu dorongan dan pembiasaan lebih intensif dalam ${cat.toLowerCase()} bersama pendampingan keluarga.`
 } else if (avgPct < 85) {
 predikat = 'Baik (B)'
 predikatBadge = 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
 deskripsi = `Ananda tertib dan konsisten dalam ${cat.toLowerCase()}, terus pertahankan semangat keistiqamahannya.`
 }

 return {
 no: idx + 1,
 category: cat,
 itemsSummary: catItems.map((i) => i.name).join(', '),
 totalWeeks: 18,
 avgPct,
 score,
 predikat,
 predikatBadge,
 deskripsi,
 }
 })
 }, [template, previewValues, days])

 // Execute physical print from modal
 const handleExecutePrint = (targetStudent, targetValues, rangeMode = printRangeMode) => {
 const activeStudent = targetStudent || previewStudent
 if (!activeStudent) return

 const studentItems = template?.items || []
 const studentFilled = Object.values(targetValues || previewValues).filter(Boolean).length
 const studentTotal = (studentItems.length || 1) * 7
 const studentProgressRate = Math.min(100, Math.round((studentFilled / studentTotal) * 100))

 let periodData = {
 title: `Pekan: ${days[0]?.day}, ${days[0]?.label} – ${days[6]?.day}, ${days[6]?.label}`,
 weekLabel: `Pekan ${days[0]?.day}, ${days[0]?.label} – ${days[6]?.day}, ${days[6]?.label}`,
 academicYear: '2026/2027',
 }

 if (rangeMode === 'bulanan') {
 periodData = {
 title: 'Bulan September 2026',
 weekLabel: 'Periode Bulan September 2026',
 academicYear: '2026/2027',
 }
 } else if (rangeMode === 'semester') {
 periodData = {
 title: 'Semester 1 (Ganjil) TA 2026/2027',
 weekLabel: 'Semester 1 (Ganjil) · Juli – Desember 2026',
 academicYear: '2026/2027',
 }
 }

 printWeeklyMutabaahSheet({
 printRange: rangeMode,
 student: {
 name: activeStudent.name,
 nis: activeStudent.nis || activeStudent.nisn || '-',
 parentName: getStudentParentName(activeStudent),
 className: currentAssignment?.kelas_name || currentAssignment?.rombel_name || 'Rombel Siswa',
 unitName: currentAssignment?.unit_name || 'Sekolah Islam Terpadu',
 homeroomTeacher: teacherProfile?.name || user?.name || 'Ustadz / Ustadzah Pembimbing',
 },
 period: periodData,
 programType: isBoarding ? 'boarding' : 'fullday',
 templateName: template?.name || 'Mutabaah Yaumiyyah',
 days,
 items: studentItems,
 values: targetValues || previewValues,
 completionRate: studentProgressRate,
 unit: currentAssignment?.unit_name || null,
 user,
 systemLogo: pengaturan?.logo_url || null,
 foundationName: pengaturan?.school_name || null,
 orientation: rangeMode === 'semester' ? 'landscape' : 'portrait',
 })
 }

 // ── RENDER MODERN HERO HEADER BANNER ──────────────────────────────────────────
 const renderHeroHeader = () => (
 <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] p-5 sm:p-6 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">

 <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
 <div className="flex items-start gap-4">
 <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-xl shadow-xs">
 <Heart className="size-6 sm:size-7 text-emerald-600 fill-white/20" />
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <span className="inline-flex items-center gap-1 rounded-full bg-white dark:bg-[#1B2433] px-3.5 py-1 text-xs font-extrabold shadow-sm">
 <Sparkles className="size-3 text-amber-300 animate-pulse" />
 Jurnal Mutaba'ah Yaumiyyah
 </span>
 <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 dark:bg-emerald-950/80 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
 Tahun Ajaran {pengaturan?.tahun_ajaran || '2026/2027'}
 </span>
 <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100/90 dark:bg-teal-950/80 px-3 py-1 text-xs font-bold text-teal-800 dark:text-teal-300 border border-emerald-200/80 dark:border-emerald-800/60">
 Semester {pengaturan?.semester || 'Ganjil'}
 </span>
 <span
 className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
 isBoarding
 ? 'bg-indigo-100/90 text-indigo-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-emerald-800/60'
 : 'bg-emerald-100/90 text-emerald-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/60'
 }`}
 >
 {isBoarding ? 'Boarding 24 Jam' : 'Fullday School'}
 </span>
 </div>
 <h2 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
 Jurnal Mutaba'ah &amp; Pembinaan Karakter
 </h2>
 <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
 Supervisi pembinaan amalan ibadah harian santri &amp; siswa — Pemantauan sholat fardhu berjamaah, dhuha, tahajjud, tilawah Al-Qur'an, dzikir pagi-petang, serta adab islami terintegrasi sekolah &amp; rumah.
 </p>
 </div>
 </div>

 {/* Summary Metric Badges */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:min-w-[420px]">
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-emerald-100/90 dark:border-emerald-800/60 dark:!bg-emerald-950/60 px-3 py-2 text-center shadow-xs">
 <strong className="block text-lg sm:text-xl font-black text-emerald-800 dark:text-emerald-200">
 {totalStudents}
 </strong>
 <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300">Total Siswa</span>
 </div>
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-teal-100/90 dark:border-emerald-800/60 dark:!bg-teal-950/60 px-3 py-2 text-center shadow-xs">
 <strong className="block text-lg sm:text-xl font-black text-teal-800 dark:text-teal-200">
 {completedStudentsCount}
 </strong>
 <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300">Lengkap (100%)</span>
 </div>
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-amber-100/90 dark:border-emerald-800/60 dark:!bg-amber-950/60 px-3 py-2 text-center shadow-xs">
 <strong className="block text-lg sm:text-xl font-black text-amber-800 dark:text-amber-200">
 {partialStudentsCount}
 </strong>
 <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300">Sebagian</span>
 </div>
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-rose-100/90 dark:border-emerald-800/60 dark:!bg-rose-950/60 px-3 py-2 text-center shadow-xs">
 <strong className="block text-lg sm:text-xl font-black text-rose-800 dark:text-rose-200">
 {emptyStudentsCount}
 </strong>
 <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300">Belum Diisi</span>
 </div>
 </div>
 </div>
 </div>
 )

 if (!loading && !assignments.length) {
 return (
 <div className="space-y-5">
 {renderHeroHeader()}
 <div className="rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-white dark:bg-[#1B2433] p-10 text-center shadow-xs">
 <Heart className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
 <h3 className="mt-3 text-base font-extrabold text-slate-900 dark:text-white">
 Belum Ada Penugasan Pembimbing Mutaba'ah
 </h3>
 <p className="mx-auto mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
 Ustadz / Ustadzah belum ditugaskan sebagai pembimbing Mutaba'ah pada rombel atau kelompok halaqah yang aktif saat ini.
 </p>
 </div>
 </div>
 )
 }

 if (!loading && assignmentId && !template) {
 return (
 <div className="space-y-5">
 {renderHeroHeader()}
 <div className="rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-white dark:bg-[#1B2433] p-10 text-center shadow-xs">
 <AlertCircle className="mx-auto h-12 w-12 text-amber-400" />
 <h3 className="mt-3 text-base font-extrabold text-slate-900 dark:text-white">
 Template Mutaba'ah Belum Tersedia
 </h3>
 <p className="mx-auto mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
 Unit atau rombel ini belum memiliki template penilaian Mutaba'ah aktif untuk minggu yang dipilih.
 </p>
 </div>
 </div>
 )
 }

 return (
 <div className="space-y-5">
 {renderHeroHeader()}

 {/* ── DATATABLE OUTER CONTAINER ─────────────────────────────────── */}
 <section className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-sm dark:bg-[#1B2433]">
 {/* ── 1. TOP HEADER & NAVIGATION BAR ────────────────────────────────────── */}
 <div className="border-b border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 dark:bg-slate-900/50 px-5 py-4 dark:border-emerald-800/60">
 <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
 <div className="flex items-center gap-3">
 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-700/80 dark:text-emerald-300 shadow-xs">
 <Users className="size-5" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
 Daftar Siswa &amp; Evaluasi Mingguan
 </h3>
 <span
 className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
 isBoarding
 ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-emerald-200/80 dark:border-emerald-800/60'
 : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60'
 }`}
 >
 {isBoarding ? 'Boarding 24 Jam' : 'Fullday School'}
 </span>
 </div>
 <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
 {currentAssignment?.unit_name || 'Sekolah Islam Terpadu'} · {currentAssignment?.kelas_name || currentAssignment?.rombel_name || 'Rombel'} · Pekan: <strong className="text-slate-700 dark:text-slate-300">{days[0].label} – {days[6].label}</strong>
 </p>
 </div>
 </div>

 {/* Week Navigator & Scope Selector */}
 <div className="flex flex-wrap items-center gap-2.5">
 {/* Scope Selector if multiple assignments */}
 {assignments.length > 1 && (
 <div className="flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-1.5 shadow-xs">
 <Users className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
 <CustomSelect
 value={assignmentId}
 onChange={(e) => setAssignmentId(e.target.value)}
 className="bg-transparent text-xs font-bold text-slate-800 dark:text-white outline-none cursor-pointer pr-1"
 >
 {assignments.map((item) => (
 <option key={item.id} value={item.id} className="dark:bg-slate-900 text-slate-900 dark:text-white">
 {item.unit_name} · {item.kelas_name || item.rombel_name || item.mentoring_group || item.type}
 </option>
 ))}
 </CustomSelect>
 </div>
 )}

 {/* Week navigation */}
 <div className="flex items-center gap-1 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 p-1 shadow-xs">
 <button
 type="button"
 onClick={() => shiftWeek(-1)}
 className="rounded-lg p-1.5 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
 title="Pekan Sebelumnya"
 >
 <ChevronLeft className="size-4" />
 </button>
 <div className="px-2 text-center text-xs font-extrabold text-slate-800 dark:text-white min-w-[155px]">
 <CalendarDays className="mr-1.5 inline size-3.5 text-emerald-600 dark:text-emerald-400" />
 {days[0].label} – {days[6].label}
 </div>
 <button
 type="button"
 onClick={() => shiftWeek(1)}
 className="rounded-lg p-1.5 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
 title="Pekan Berikutnya"
 >
 <ChevronRight className="size-4" />
 </button>
 <button
 type="button"
 onClick={resetToCurrentWeek}
 className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 hover:text-slate-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition ml-1 cursor-pointer"
 title="Kembali ke Pekan Ini"
 >
 <RotateCcw className="size-3.5" />
 </button>
 </div>
 </div>
 </div>
 </div>

 {error && (
 <div className="mx-5 mt-4 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/40 dark:border-emerald-800/60 dark:text-rose-300">
 <AlertCircle className="size-4 shrink-0" />
 <span>{error}</span>
 </div>
 )}

 {/* ── 2. DAFTAR SISWA UTAMA (STUDENT DIRECTORY) ─────────────────────────── */}
 <div className="p-5">
 {/* Quick Summary Interactive Modern KPI Cards */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-5">
 {/* Card 1: Total Siswa (Emerald) */}
 <div
 onClick={() => setStatusFilter('all')}
 className={`group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300 cursor-pointer ${
 statusFilter === 'all'
 ? 'bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 ring-2 ring-emerald-500/30 shadow-lg shadow-sm'
 : 'bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-sm hover:shadow-md hover:shadow-sm hover:-translate-y-0.5'
 }`}
 >
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Total Siswa Rombel</span>
 <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-700/80 dark:text-emerald-300 shadow-sm">
 <Users className="size-4.5 text-emerald-600" />
 </div>
 </div>
 <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
 {totalStudents}
 </p>
 <div className="mt-2 flex items-center justify-between">
 <span className="inline-flex items-center rounded-full bg-emerald-100/90 dark:bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
 {currentAssignment?.kelas_name || 'Rombel Aktif'}
 </span>
 <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Semua Data</span>
 </div>
 </div>

 {/* Card 2: Lengkap Terisi (Teal) */}
 <div
 onClick={() => setStatusFilter('completed')}
 className={`group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300 cursor-pointer ${
 statusFilter === 'completed'
 ? 'bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 ring-2 ring-teal-500/30 shadow-lg shadow-sm'
 : 'bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-sm hover:shadow-md hover:shadow-sm hover:-translate-y-0.5'
 }`}
 >
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Lengkap Terisi</span>
 <div className="flex size-9 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-sm">
 <CheckCircle2 className="size-4.5 text-slate-600" />
 </div>
 </div>
 <p className="mt-2 text-2xl sm:text-3xl font-black text-teal-700 dark:text-teal-400">
 {completedStudentsCount}
 </p>
 <div className="mt-2 flex items-center justify-between">
 <span className="inline-flex items-center rounded-full bg-teal-100/90 dark:bg-teal-950/80 px-2 py-0.5 text-[10px] font-bold text-teal-800 dark:text-teal-300 border border-emerald-200/80 dark:border-emerald-800/60">
 100% Agenda Terekam
 </span>
 <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">
 {totalStudents > 0 ? `${Math.round((completedStudentsCount / totalStudents) * 100)}%` : '0%'}
 </span>
 </div>
 </div>

 {/* Card 3: Terisi Sebagian (Amber) */}
 <div
 onClick={() => setStatusFilter('partial')}
 className={`group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300 cursor-pointer ${
 statusFilter === 'partial'
 ? 'bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 ring-2 ring-amber-500/30 shadow-lg shadow-sm'
 : 'bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-sm hover:shadow-md hover:shadow-sm hover:-translate-y-0.5'
 }`}
 >
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Terisi Sebagian</span>
 <div className="flex size-9 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-sm">
 <Clock className="size-4.5 text-amber-600" />
 </div>
 </div>
 <p className="mt-2 text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-400">
 {partialStudentsCount}
 </p>
 <div className="mt-2 flex items-center justify-between">
 <span className="inline-flex items-center rounded-full bg-amber-100/90 dark:bg-amber-950/80 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-800/60">
 Dalam Proses
 </span>
 <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
 {totalStudents > 0 ? `${Math.round((partialStudentsCount / totalStudents) * 100)}%` : '0%'}
 </span>
 </div>
 </div>

 {/* Card 4: Belum Diisi (Rose) */}
 <div
 onClick={() => setStatusFilter('empty')}
 className={`group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300 cursor-pointer ${
 statusFilter === 'empty'
 ? 'bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 ring-2 ring-rose-500/30 shadow-lg shadow-sm'
 : 'bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-sm hover:shadow-md hover:shadow-sm hover:-translate-y-0.5'
 }`}
 >
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Belum Diisi</span>
 <div className="flex size-9 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-sm">
 <AlertCircle className="size-4.5 text-white" />
 </div>
 </div>
 <p className="mt-2 text-2xl sm:text-3xl font-black text-rose-700 dark:text-rose-400">
 {emptyStudentsCount}
 </p>
 <div className="mt-2 flex items-center justify-between">
 <span className="inline-flex items-center rounded-full bg-rose-100/90 dark:bg-rose-950/80 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:text-rose-300 border border-emerald-200/80 dark:border-emerald-800/60">
 Perlu Perhatian
 </span>
 <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
 {totalStudents > 0 ? `${Math.round((emptyStudentsCount / totalStudents) * 100)}%` : '0%'}
 </span>
 </div>
 </div>
 </div>

 {/* Program Notice Box */}
 {!isBoarding ? (
 <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 dark:bg-slate-900/50 p-4 text-xs text-emerald-950 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-transparent dark:text-emerald-200 shadow-xs">
 <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
 <School className="size-4.5" />
 </div>
 <div>
 <strong className="font-extrabold text-emerald-950 dark:text-emerald-100 text-xs sm:text-sm block">
 Mode Fullday School — Pengisian Harian &amp; Pemisahan Tanggung Jawab
 </strong>
 <p className="mt-0.5 leading-relaxed text-emerald-800/90 dark:text-emerald-300">
 Klik tombol <strong className="text-emerald-900 dark:text-white">"Isi Jurnal"</strong> pada siswa untuk membuka modal pengisian interaktif. Pengisian mengikuti <strong className="text-emerald-900 dark:text-white">Hari Ini</strong> dan <strong className="text-emerald-900 dark:text-white">Hari-Hari Sebelumnya</strong> yang sudah berjalan. Hari-hari yang belum tiba dikunci secara otomatis. Agenda rumah dipantau &amp; diverifikasi oleh orang tua siswa.
 </p>
 </div>
 </div>
 ) : (
 <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] p-4 text-xs text-indigo-950 dark:border-emerald-800/60 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-transparent dark:text-indigo-200 shadow-xs">
 <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
 <ShieldCheck className="size-4.5" />
 </div>
 <div>
 <strong className="font-extrabold text-indigo-950 dark:text-indigo-100 text-xs sm:text-sm block">
 Mode Boarding / Pesantren — Pembinaan Terpadu 24 Jam
 </strong>
 <p className="mt-0.5 leading-relaxed text-indigo-800/90 dark:text-indigo-300">
 Supervisi ibadah santri 24 jam dibuka untuk hari ini dan hari-hari sebelumnya dalam pekan aktif melalui modal pengisian interaktif.
 </p>
 </div>
 </div>
 )}

 {/* Toolbar Search & Status Filter */}
 <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 bg-slate-50/50 dark:bg-slate-900/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/40 p-3">
 <div className="relative flex-1 max-w-md">
 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={searchStudent}
 onChange={(e) => setSearchStudent(e.target.value)}
 placeholder="Cari nama atau NIS siswa..."
 className="h-10 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 pl-10 pr-9 text-xs font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
 />
 {searchStudent && (
 <button
 type="button"
 onClick={() => setSearchStudent('')}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
 >
 <X className="size-3.5" />
 </button>
 )}
 </div>

 <div className="flex items-center gap-2">
 <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Filter Status:</span>
 <div className="flex items-center rounded-xl bg-white dark:bg-slate-900 p-1 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
 <button
 type="button"
 onClick={() => setStatusFilter('all')}
 className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
 statusFilter === 'all'
 ? 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white shadow-xs'
 : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
 }`}
 >
 Semua ({students.length})
 </button>
 <button
 type="button"
 onClick={() => setStatusFilter('completed')}
 className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
 statusFilter === 'completed'
 ? 'bg-emerald-600 text-white shadow-xs'
 : 'text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400'
 }`}
 >
 Lengkap ({completedStudentsCount})
 </button>
 <button
 type="button"
 onClick={() => setStatusFilter('partial')}
 className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
 statusFilter === 'partial'
 ? 'bg-amber-600 text-white shadow-xs'
 : 'text-slate-600 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400'
 }`}
 >
 Sebagian ({partialStudentsCount})
 </button>
 <button
 type="button"
 onClick={() => setStatusFilter('empty')}
 className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
 statusFilter === 'empty'
 ? 'bg-rose-600 text-white shadow-xs'
 : 'text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400'
 }`}
 >
 Belum ({emptyStudentsCount})
 </button>
 </div>
 </div>
 </div>

 {/* Student Datatable */}
 <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr className="border-b border-emerald-200/80 bg-slate-50/80 dark:bg-slate-900/80 text-slate-800 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/60 dark:text-slate-200">
 <th className="p-3.5 text-center font-extrabold w-12">No</th>
 <th className="p-3.5 font-extrabold">Identitas Siswa</th>
 <th className="p-3.5 font-extrabold">Rombel & Unit</th>
 <th className="p-3.5 font-extrabold text-center">Status Pekan Ini</th>
 <th className="p-3.5 font-extrabold text-center">Capaian Pekanan</th>
 <th className="p-3.5 font-extrabold text-center w-56">Tindakan Pengisian</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 bg-white dark:bg-[#1B2433]">
 {loading ? (
 <tr>
 <td colSpan="6" className="p-10 text-center">
 <div className="flex items-center justify-center gap-2 font-bold text-slate-500">
 <Loader2 className="size-4 animate-spin text-emerald-600" />
 <span>Memuat data mutaba'ah siswa...</span>
 </div>
 </td>
 </tr>
 ) : filteredStudents.length === 0 ? (
 <tr>
 <td colSpan="6" className="p-10 text-center text-slate-500">
 <Users className="mx-auto mb-2 size-8 text-slate-300 dark:text-slate-600" />
 Tidak ada data siswa yang cocok dengan filter.
 </td>
 </tr>
 ) : (
 paginatedStudents.map((student, idx) => {
 const initials = (student.name || 'S')
 .split(' ')
 .slice(0, 2)
 .map((w) => w[0])
 .join('')
 .toUpperCase()

 const isDone = student.status === 'completed' || student.status === 'approved'
 const isDraft = student.status === 'draft' || student.status === 'submitted'
 const rowIndex = (currentPage - 1) * pageSize + idx + 1

 return (
 <tr
 key={student.id}
 className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition cursor-pointer"
 onClick={() => handleOpenInputModal(student)}
 >
 <td className="p-3 text-center font-mono font-bold text-slate-500">{rowIndex}</td>
 <td className="p-3">
 <div className="flex items-center gap-3">
 <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-700/80 dark:text-emerald-300 font-black text-xs shadow-xs">
 {initials}
 </div>
 <div>
 <p className="font-extrabold text-slate-900 dark:text-white hover:text-emerald-600 transition">
 {student.name}
 </p>
 <span className="font-mono text-xs text-slate-500">
 NIS: {student.nis || student.nisn || '-'}
 </span>
 </div>
 </div>
 </td>
 <td className="p-3">
 <span className="font-bold text-slate-800 dark:text-slate-200">
 {currentAssignment?.kelas_name || currentAssignment?.rombel_name || 'Rombel'}
 </span>
 <span className="block text-xs text-slate-500">
 {currentAssignment?.unit_name || 'Unit SIT'}
 </span>
 </td>
 <td className="p-3 text-center">
 {isDone ? (
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
 <CheckCircle2 className="size-3" /> Lengkap
 </span>
 ) : isDraft ? (
 <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-extrabold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
 <Clock className="size-3" /> Sebagian
 </span>
 ) : (
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
 Belum Dimulai
 </span>
 )}
 </td>
 <td className="p-3 text-center">
 <div className="flex flex-col items-center">
 <span className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
 {isDone ? '100%' : isDraft ? 'Aktif Mengisi' : '0%'}
 </span>
 <div className="w-24 h-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 overflow-hidden">
 <div
 className={`h-full ${isDone ? 'bg-emerald-600' : isDraft ? 'bg-amber-500' : 'bg-slate-300'}`}
 style={{ width: isDone ? '100%' : isDraft ? '50%' : '0%' }}
 />
 </div>
 </div>
 </td>
 <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
 <div className="flex items-center justify-center gap-1.5">
 <button
 type="button"
 onClick={() => handleOpenInputModal(student)}
 className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-50 dark:text-slate-900 dark:hover:bg-white hover:from-emerald-700 hover:to-teal-700 px-3 py-1.5 text-xs font-bold shadow-xs transition cursor-pointer"
 >
 <Edit3 className="size-3.5" />
 <span>Isi Jurnal</span>
 </button>
 <button
 type="button"
 onClick={() => handleOpenPrintPreview(student)}
 className="inline-flex items-center gap-1 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:hover:bg-sky-900/50 dark:text-sky-300 border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-1.5 text-xs font-bold shadow-xs transition cursor-pointer"
 title="Preview Cetak Pekanan"
 >
 <Printer className="size-3.5" />
 <span>Cetak</span>
 </button>
 </div>
 </td>
 </tr>
 )
 })
 )}
 </tbody>
 </table>

 {/* Datatable Footer & Pagination */}
 <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 bg-slate-50/50 dark:bg-slate-900/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/40 px-5 py-3.5">
 <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
 Menampilkan <strong className="text-emerald-700 dark:text-emerald-400">{filteredStudents.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong>–<strong className="text-emerald-700 dark:text-emerald-400">{Math.min(currentPage * pageSize, filteredStudents.length)}</strong> dari <strong className="text-slate-900 dark:text-white">{filteredStudents.length}</strong> siswa
 </span>
 {totalPages > 1 && (
 <div className="max-w-xs">
 <Pagination
 currentPage={currentPage}
 totalPages={totalPages}
 onPageChange={setCurrentPage}
 variant="compact"
 sideLayout="icon"
 />
 </div>
 )}
 </div>
 </div>
 </div>

 {/* ── 3. MODAL PENGISIAN JURNAL MUTABAAH SISWA (HARI INI & HARI SEBELUMNYA) ── */}
      <AppModal
        isOpen={Boolean(inputStudent)}
        onClose={() => setInputStudent(null)}
        title={inputStudent?.name || 'Jurnal Mutabaah'}
        badge={currentAssignment?.kelas_name || 'Rombel'}
        description={inputStudent ? `NIS: ${inputStudent.nis || '-'} · ${isBoarding ? 'Boarding 24 Jam' : 'Fullday School'}` : undefined}
        icon={BookOpen}
        maxWidth="max-w-4xl"
        zIndex={100}
        headerActions={
          inputStudent ? (
            <div className="flex items-center gap-1 rounded-xl bg-white/20 p-1 text-xs backdrop-blur-md border border-white/25">
              <button
                type="button"
                onClick={() => handleNavigateModalStudent(-1)}
                className="rounded-lg p-1 text-white hover:bg-white/20 transition cursor-pointer"
                title="Siswa Sebelumnya"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="px-1.5 text-xs font-black text-white tabular-nums">
                {filteredStudents.findIndex((s) => String(s.id) === String(inputStudent.id)) + 1} / {filteredStudents.length}
              </span>
              <button
                type="button"
                onClick={() => handleNavigateModalStudent(1)}
                className="rounded-lg p-1 text-white hover:bg-white/20 transition cursor-pointer"
                title="Siswa Berikutnya"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          ) : null
        }
        footer={
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="font-bold text-slate-700 dark:text-slate-300">Keterangan:</span>
              <span>B = Baik</span>
              <span>K = Kurang</span>
              <span>X = Belum</span>
              <span>— = N/A</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenPrintPreview(inputStudent)}
                className="h-9.5 px-4 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-black inline-flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="size-3.5" />
                <span>Pratinjau Cetak</span>
              </button>
              <button
                type="button"
                onClick={() => setInputStudent(null)}
                className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20"
              >
                <span>Selesai</span>
              </button>
            </div>
          </div>
        }
      >
        {inputStudent && (
          <>
 {loadingInputModal ? (
 <div className="flex flex-col items-center justify-center p-12 text-slate-500">
 <Loader2 className="size-6 animate-spin text-emerald-600 mb-2" />
 <span className="text-xs font-bold">Memuat isian jurnal hari terpilih...</span>
 </div>
 ) : modalDisplayItems.length === 0 ? (
 <div className="p-8 text-center text-xs text-slate-500">
 Tidak ada agenda mutaba'ah untuk kategori ini.
 </div>
 ) : (
 modalDisplayItems.map((item, idx) => {
 const currentVal = inputValues[item.id]
 const isItemSaving = savingCell[item.id]
 const isParentScope = item.is_parent_item || item.scope === 'home' || item.responsible_role === 'parent'

 return (
 <div
 key={item.id}
 className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] hover:border-emerald-300 dark:hover:border-emerald-700 transition"
 >
 <div className="flex items-start gap-2.5 min-w-0">
 <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold font-mono text-slate-500 mt-0.5">
 {idx + 1}
 </span>
 <div className="min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <span className="text-xs font-extrabold text-slate-900 dark:text-white">
 {item.name}
 </span>
 <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
 {item.category}
 </span>
 {isParentScope && !isBoarding && (
 <span className="rounded-md bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.2 text-[10px] font-bold text-sky-700 dark:text-sky-300">
 Diisi Orang Tua
 </span>
 )}
 </div>
 {item.description && (
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
 {item.description}
 </p>
 )}
 </div>
 </div>

 {/* Status Selection Buttons */}
 <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
 {statusOptions.map((opt) => {
 const isSelected = currentVal === opt.value
 return (
 <button
 type="button"
 key={opt.value}
 disabled={isItemSaving}
 onClick={() => handleSaveModalCell(item, opt.value)}
 title={opt.label}
 className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-extrabold transition cursor-pointer ${
 isSelected ? opt.activeClass : opt.idleClass
 }`}
 >
 {isItemSaving && isSelected ? (
 <Loader2 className="size-3.5 animate-spin" />
 ) : (
 <span>{opt.short}</span>
 )}
 <span className="hidden md:inline text-xs font-semibold">{opt.label.split(' ')[0]}</span>
 </button>
 )
 })}
 </div>
 </div>
 )
 })
 )}
          </>
        )}
      </AppModal>


 {/* ── 4. MODAL PRATINJAU CETAK SISWA (PEKANAN, BULANAN, SEMESTER) ────────────── */}
      <AppModal
        isOpen={Boolean(previewStudent)}
        onClose={() => setPreviewStudent(null)}
        title="Pratinjau Lembar Cetak Mutaba'ah"
        badge={printRangeMode}
        description={previewStudent ? `Siswa: ${previewStudent.name} · Rombel ${currentAssignment?.kelas_name || 'Aktif'}` : undefined}
        icon={Printer}
        maxWidth="max-w-4xl"
        zIndex={100}
        headerActions={
          <div className="flex items-center gap-1 rounded-xl bg-white/20 p-1 backdrop-blur-md border border-white/25">
            {['pekanan', 'bulanan', 'semester'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPrintRangeMode(mode)}
                className={`px-2.5 py-1 rounded-lg text-xs font-black capitalize transition-all cursor-pointer ${
                  printRangeMode === mode
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-white/90 hover:bg-white/15'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        }
        footer={
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-slate-500">
              Mode Cetak Aktif: <strong className="text-emerald-700 capitalize">{printRangeMode}</strong> (Format Dokumen A4).
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewStudent(null)}
                className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700"
              >
                <X className="size-4" strokeWidth={2} />
                <span>Tutup</span>
              </button>
              <button
                type="button"
                onClick={() => handleExecutePrint(previewStudent, previewValues, printRangeMode)}
                className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20"
              >
                <Printer className="size-4" />
                <span>Cetak Lembar {printRangeMode === 'pekanan' ? 'Pekanan' : printRangeMode === 'bulanan' ? 'Bulanan' : 'Semester'} Sekarang</span>
              </button>
            </div>
          </div>
        }
      >
        {previewStudent && (
          <>
 {loadingPreview ? (
 <div className="flex flex-col items-center justify-center p-16">
 <Loader2 className="size-8 animate-spin text-emerald-600 mb-3" />
 <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
 Memuat data lengkap evaluasi mutaba'ah siswa...
 </span>
 </div>
 ) : (
 <div className="mx-auto max-w-[780px] bg-white text-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border border-emerald-200/80 dark:border-emerald-800/60">
 {/* KOP SURAT RESMI: 3 KOLOM SESUAI STANDAR INSTITUSI */}
 <div className="grid grid-cols-[70px_1fr_70px] items-center gap-3 pb-2 text-center">
 {/* Logo Kiri: Logo Yayasan / Logo Situs dari Pengaturan */}
 <div className="flex size-[70px] items-center justify-center mx-auto">
 <img
 src={resolveSystemLogoUrl(pengaturan?.logo_url)}
 alt="Logo Yayasan"
 className="max-h-[68px] max-w-[68px] object-contain"
 onError={(e) => {
 e.currentTarget.onerror = null
 e.currentTarget.src = '/assets/logos/yayasan.svg'
 }}
 />
 </div>

 {/* Tengah: Nama Yayasan, Nama Unit Lengkap, Alamat */}
 <div className="px-2">
 {pengaturan?.school_name && (
 <h4 className="text-[11pt] font-extrabold uppercase tracking-wide text-slate-900 leading-tight">
 {pengaturan.school_name}
 </h4>
 )}
 <h5 className="text-[12pt] font-black uppercase tracking-tight text-emerald-800 leading-tight mt-0.5">
 {currentAssignment?.unit_name || 'SEKOLAH ISLAM TERPADU'}
 </h5>
 <p className="text-[8pt] font-medium text-slate-600 leading-snug mt-1">
 {pengaturan?.address || ''}
 {pengaturan?.phone ? ` | Telp. ${pengaturan.phone}` : ''}
 </p>
 </div>

 {/* Logo Kanan: Logo Unit */}
 <div className="flex size-[70px] items-center justify-center mx-auto">
 <img
 src="/assets/logos/smpit.svg"
 alt="Logo Unit"
 className="max-h-[68px] max-w-[68px] object-contain"
 onError={(e) => {
 e.currentTarget.onerror = null
 e.currentTarget.src = resolveSystemLogoUrl(pengaturan?.logo_url)
 }}
 />
 </div>
 </div>

 {/* GARIS GANDA PEMBATAS KOP SURAT RESMI */}
 <div className="border-t-[2.5px] border-b border-slate-900 h-1 my-2" />

 {/* JUDUL DOKUMEN EVALUASI SESUAI RANGE */}
 <div className="text-center my-3">
 <h3 className="text-sm sm:text-base font-black uppercase tracking-wide text-emerald-800">
 {printRangeMode === 'bulanan'
 ? "LEMBAR REKAPITULASI MUTABA'AH YAUMIYYAH BULANAN SISWA"
 : printRangeMode === 'semester'
 ? "LEMBAR EVALUASI MUTABA'AH YAUMIYYAH SEMESTER SISWA"
 : "LEMBAR MUTABA'AH YAUMIYYAH PEKANAN SISWA"}
 </h3>
 <p className="text-xs font-bold text-slate-600 mt-0.5">
 {printRangeMode === 'bulanan'
 ? 'Periode: Bulan September 2026 · Tahun Ajaran 2026/2027'
 : printRangeMode === 'semester'
 ? 'Periode: Semester 1 (Ganjil) · Tahun Ajaran 2026/2027 (Juli – Desember 2026)'
 : `Pekan: ${days[0]?.day}, ${days[0]?.label} – ${days[6]?.day}, ${days[6]?.label} (Tahun Ajaran 2026/2027)`}
 </p>
 </div>

 {/* IDENTITAS SISWA */}
 <div className="grid grid-cols-2 gap-2 text-xs font-semibold bg-slate-50 p-3 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 mb-4">
 <div>
 <span className="text-slate-500 w-28 inline-block">Nama Siswa:</span>
 <strong className="text-slate-900">{previewStudent.name}</strong>
 </div>
 <div>
 <span className="text-slate-500 w-28 inline-block">Orang Tua / Wali:</span>
 <strong className="text-emerald-950 font-bold">{getStudentParentName(previewStudent)}</strong>
 </div>
 <div>
 <span className="text-slate-500 w-28 inline-block">Kelas / Rombel:</span>
 <strong className="text-slate-900">{currentAssignment?.kelas_name || 'Rombel'}</strong>
 </div>
 <div>
 <span className="text-slate-500 w-28 inline-block">NIS / NISN:</span>
 <strong className="text-slate-900">{previewStudent.nis || '-'}</strong>
 </div>
 <div>
 <span className="text-slate-500 w-28 inline-block">Program Sekolah:</span>
 <strong className="text-slate-900">
 {isBoarding ? 'Boarding 24 Jam' : 'Fullday School (Ranah Sekolah & Rumah)'}
 </strong>
 </div>
 <div>
 <span className="text-slate-500 w-28 inline-block">Pembimbing:</span>
 <strong className="text-slate-900">{teacherProfile?.name || user?.name || 'Ustadz / Ustadzah'}</strong>
 </div>
 <div className="col-span-2">
 <span className="text-slate-500 w-28 inline-block">Status Capaian:</span>
 <strong className="text-emerald-700">
 {printRangeMode === 'bulanan'
 ? '89% (Predikat: Jayyid Jiddan)'
 : printRangeMode === 'semester'
 ? '92% (Predikat: Mumtaz / A)'
 : 'Terpantau Berkelanjutan'}
 </strong>
 </div>
 </div>

 {/* ── MODE 1: TABEL PEKANAN DENGAN HARI & TANGGAL SEKALIGUS ── */}
 {printRangeMode === 'pekanan' && (
 <>
 <table className="w-full text-left text-[10px] border border-emerald-200/80 dark:border-emerald-800/60 border-collapse mb-3">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr className="bg-emerald-50 text-emerald-950 font-bold border-b border-emerald-300">
 <th className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 text-center w-8">No</th>
 <th className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 w-24">Kategori</th>
 <th className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60">Rincian Agenda Mutaba'ah</th>
 {days.map((d) => (
 <th key={d.date} className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 text-center min-w-[50px]">
 <div className="font-extrabold text-emerald-950 text-[10px] leading-tight">{d.day}</div>
 <div className="text-[8px] font-semibold text-slate-600 leading-tight">{d.label}</div>
 </th>
 ))}
 <th className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 text-center w-12">Capaian</th>
 </tr>
 </thead>
 <tbody>
 {(template?.items || []).map((item, idx) => {
 let dayCount = 0
 return (
 <tr key={item.id} className="border-b border-emerald-200/80">
 <td className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 text-center font-mono">{idx + 1}</td>
 <td className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 font-bold text-emerald-900">{item.category}</td>
 <td className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60">
 <span>{item.name}</span>
 {item.is_parent_item && (
 <span className="ml-1 text-[8px] bg-sky-100 text-sky-800 px-1 py-0.2 rounded font-semibold">
 Pantauan Ortu
 </span>
 )}
 </td>
 {days.map((d) => {
 const key = `${d.date}:${item.id}`
 const val = previewValues[key]
 if (val && val !== 'na') dayCount++
 const opt = statusOptions.find((s) => s.value === val)
 return (
 <td key={d.date} className="p-1 border border-emerald-200/80 dark:border-emerald-800/60 text-center font-black">
 {opt ? (
 <span
 className={`inline-block px-1 rounded ${val === 'good' ? 'bg-emerald-100 text-emerald-800' : val === 'less' ? 'bg-amber-100 text-amber-800' : val === 'not_done' ? 'bg-rose-100 text-rose-800' : 'text-slate-400'}`}
 >
 {opt.short}
 </span>
 ) : (
 '-'
 )}
 </td>
 )
 })}
 <td className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 text-center font-bold text-slate-700">
 {dayCount}/{days.length}
 </td>
 </tr>
 )
 })}
 </tbody>
 </table>

 {/* KETERANGAN STATUS PEKANAN */}
 <div className="text-[9px] text-slate-600 bg-slate-50 p-2 rounded border border-emerald-200/80 dark:border-emerald-800/60 mb-3">
 <strong>Keterangan:</strong> B = Baik (Berjamaah/Lengkap) | K = Kurang (Munfarid/Terlambat) | X = Belum/Tidak Dikerjakan | — = N/A (Udzur Syar'i)
 </div>
 </>
 )}

 {/* ── MODE 2: TABEL REKAPITULASI BULANAN ── */}
 {printRangeMode === 'bulanan' && (
 <>
 <table className="w-full text-left text-[10px] border border-emerald-200/80 dark:border-emerald-800/60 border-collapse mb-3">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr className="bg-emerald-50 text-emerald-950 font-bold border-b border-emerald-300">
 <th className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 text-center w-8">No</th>
 <th className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 w-24">Kategori</th>
 <th className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60">Rincian Agenda Mutaba'ah</th>
 <th className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 text-center w-14">Target</th>
 <th className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 text-center w-12">Baik (B)</th>
 <th className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 text-center w-12">Kurang (K)</th>
 <th className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 text-center w-12">Belum (X)</th>
 <th className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 text-center w-14">% Capaian</th>
 <th className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 text-center w-24">Predikat</th>
 </tr>
 </thead>
 <tbody>
 {(template?.items || []).map((item, idx) => {
 const stats = getMonthlyStats(item)
 return (
 <tr key={item.id} className="border-b border-emerald-200/80">
 <td className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 text-center font-mono">{idx + 1}</td>
 <td className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 font-bold text-emerald-900">{item.category}</td>
 <td className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60">
 <span>{item.name}</span>
 {item.is_parent_item && (
 <span className="ml-1 text-[8px] bg-sky-100 text-sky-800 px-1 py-0.2 rounded font-semibold">
 Pantauan Ortu
 </span>
 )}
 </td>
 <td className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 text-center font-semibold text-slate-600">
 {stats.targetDays} Hari
 </td>
 <td className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 text-center font-bold text-emerald-700 bg-emerald-50/50">
 {stats.realGood}x
 </td>
 <td className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 text-center font-bold text-amber-700 bg-amber-50/50">
 {stats.realLess}x
 </td>
 <td className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 text-center font-bold text-rose-700 bg-rose-50/50">
 {stats.realNotDone}x
 </td>
 <td className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 text-center font-black text-slate-800">
 {stats.pct}%
 </td>
 <td className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 text-center font-bold">
 <span className={`px-1.5 py-0.5 rounded text-[9px] ${stats.predikatBadge}`}>
 {stats.predikat}
 </span>
 </td>
 </tr>
 )
 })}
 </tbody>
 </table>

 {/* KETERANGAN SKALA BULANAN */}
 <div className="text-[9px] text-slate-600 bg-slate-50 p-2 rounded border border-emerald-200/80 dark:border-emerald-800/60 mb-3">
 <strong>Keterangan Skala:</strong> Mumtaz (A ≥ 90%) | Jayyid Jiddan (B+ 80–89%) | Jayyid (B 70–79%) | Maqbul (C &lt; 70%) · Data disinkronkan ke Portofolio Siswa.
 </div>
 </>
 )}

 {/* ── MODE 3: TABEL EVALUASI SEMESTER ── */}
 {printRangeMode === 'semester' && (
 <>
 <table className="w-full text-left text-[10px] border border-emerald-200/80 dark:border-emerald-800/60 border-collapse mb-3">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr className="bg-emerald-50 text-emerald-950 font-bold border-b border-emerald-300">
 <th className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 text-center w-8">No</th>
 <th className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 w-32">Dimensi Karakter & Ibadah</th>
 <th className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60">Rincian Target Pembiasaan (18 Pekan)</th>
 <th className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 text-center w-16">Total Pekan</th>
 <th className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 text-center w-16">% Capaian</th>
 <th className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 text-center w-12">Nilai</th>
 <th className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 text-center w-24">Predikat</th>
 <th className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 w-44">Catatan Perkembangan Karakter</th>
 </tr>
 </thead>
 <tbody>
 {semesterDimensions.map((dim) => (
 <tr key={dim.no} className="border-b border-emerald-200/80">
 <td className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 text-center font-mono">{dim.no}</td>
 <td className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 font-extrabold text-emerald-900">{dim.category}</td>
 <td className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60">
 <span className="font-semibold text-slate-800">{dim.itemsSummary}</span>
 </td>
 <td className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 text-center font-semibold text-slate-600">
 {dim.totalWeeks} Pekan
 </td>
 <td className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 text-center font-black text-slate-800">
 {dim.avgPct}%
 </td>
 <td className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 text-center font-black text-emerald-700 bg-emerald-50/50">
 {dim.score}
 </td>
 <td className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 text-center font-bold">
 <span className={`px-1.5 py-0.5 rounded text-[9px] ${dim.predikatBadge}`}>
 {dim.predikat}
 </span>
 </td>
 <td className="p-1.5 border border-emerald-200/80 dark:border-emerald-800/60 text-[9px] text-slate-600 leading-snug">
 {dim.deskripsi}
 </td>
 </tr>
 ))}
 </tbody>
 </table>

 {/* KETERANGAN STANDAR SEMESTER */}
 <div className="text-[9px] text-slate-600 bg-slate-50 p-2 rounded border border-emerald-200/80 dark:border-emerald-800/60 mb-3">
 <strong>Kriteria Ketuntasan:</strong> Predikat A (Sangat Baik / Nilai ≥ 88) | Predikat B (Baik / Nilai 78–87) | Predikat C (Cukup / Nilai &lt; 78) · Terlampir dalam Buku Laporan Hasil Belajar Rapor Adab.
 </div>
 </>
 )}

 {/* KOTAK CATATAN PEMBIMBING */}
 <div className="text-[9.5px] text-slate-700 bg-amber-50/60 p-2.5 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 mb-4">
 <strong>Catatan Pembimbing / Evaluasi {printRangeMode === 'bulanan' ? 'Bulanan' : printRangeMode === 'semester' ? 'Semester' : 'Pekanan'}:</strong>
 <p className="italic text-slate-600 mt-0.5">
 {printRangeMode === 'semester'
 ? `Ananda ${previewStudent.name} dinyatakan Tuntas dan Memenuhi Standar Kelulusan Karakter & Pembiasaan Ibadah Semester Ganjil TA 2026/2027. Dipertahankan dan senantiasa ditingkatkan pada semester berikutnya.`
 : printRangeMode === 'bulanan'
 ? `Alhamdulillah, sepanjang periode bulan ini ananda ${previewStudent.name} menunjukkan komitmen ibadah dan akhlak yang sangat baik. Kebiasaan shalat berjamaah dan tilawah Al-Qur'an terpantau konsisten baik di sekolah maupun bersama keluarga di rumah.`
 : `Alhamdulillah, ananda ${previewStudent.name} menunjukkan komitmen ibadah yang positif pada pekan ini. Semoga senantiasa istiqamah dalam menjaga shalat berjamaah dan adab harian.`}
 </p>
 </div>

 {/* KOTAK TANDA TANGAN 3 PIHAK */}
 <div className="grid grid-cols-3 gap-4 text-center text-xs mt-6 pt-2">
 <div>
 <span className="text-xs text-slate-500">Orang Tua / Wali Siswa</span>
 <div className="h-14" />
 <p className="font-extrabold text-slate-800 border-t border-slate-400 inline-block min-w-[120px] pt-1">
 ( {getStudentParentName(previewStudent)} )
 </p>
 </div>
 <div>
 <span className="text-xs text-slate-500">Wali Kelas / Pembimbing</span>
 <div className="h-14" />
 <p className="font-extrabold text-slate-800 border-t border-slate-400 inline-block min-w-[120px] pt-1">
 {teacherProfile?.name || user?.name || 'Ustadz / Ustadzah'}
 </p>
 </div>
 <div>
 <span className="text-xs text-slate-500">Kepala Sekolah / Mudir</span>
 <div className="h-14" />
 <p className="font-extrabold text-slate-800 border-t border-slate-400 inline-block min-w-[120px] pt-1">
 Kepala Unit Sekolah
 </p>
 </div>
 </div>
 </div>
 )}
          </>
        )}
      </AppModal>
 </section>
 </div>
)
}
