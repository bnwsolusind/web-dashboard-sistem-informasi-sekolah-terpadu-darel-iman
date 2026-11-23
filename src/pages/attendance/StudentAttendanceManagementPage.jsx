import CustomSelect from "../../components/ui/CustomSelect"
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
 AlertCircle,
 AlertTriangle,
 ArrowRight,
 Award,
 BookOpen,
 Calendar,
 CalendarCheck,
 Clock,
 ExternalLink,
 Eye,
 FileCheck2,
 FileEdit,
 FileSpreadsheet,
 FileText,
 Filter,
 GraduationCap,
 HeartPulse,
 Info,
 Printer,
 RefreshCcw,
 Search,
 ShieldAlert,
 Sparkles,
 UserCheck,
 UserMinus,
 UserPlus,
 UserRound,
 Users,
 UsersRound,
} from 'lucide-react'
import {
 ArrowRightLeft as ArrowBothDirectionHorizontal2,
 CheckCircle2 as CheckCircle1,
 ChevronDown,
 Download as Download1,
 Info as InfoCircle,
 Plus,
 Upload as Upload1,
 X as Xmark2x,
} from 'lucide-react'
import { lmsPresensiService } from '../../services/lmsPresensiService'
import { studentService } from '../../services/studentService'
import { subjectService } from '../../services/subjectService'
import { employeeService } from '../../services/employeeService'
import { kelasService } from '../../services/kelasService'
import AppBreadcrumb from '../../components/app/AppBreadcrumb'
import AppSkeleton from '../../components/app/AppSkeleton'
import AppEmptyState from '../../components/app/AppEmptyState'
import { useToast } from '../../components/app'
import ActionDropdown from '../../components/app/ActionDropdown'
import { SquircleActionButton, PrintOptionModal } from '../../components/master-data'
import { downloadPdfTable, printCleanTable } from '../../utils/printHelper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DatePicker } from '@/components/ui/date-picker'
import { Pagination } from '@/components/ui/pagination'
import { TableBody, TableCell, TableHead, TableHeader, TableRoot, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
 Card,
 CardAction,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from '@/components/ui/card'
import {
 Dialog,
 DialogBody,
 DialogClose,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
} from '@/components/ui/dialog'
import { Backdrop } from '@/components/ui/dialog'



export default function StudentAttendanceManagementPage({ initialTab = 'rekap' }) {
 const [searchParams, setSearchParams] = useSearchParams()
 const activeTab = searchParams.get('tab') || initialTab
 const toast = useToast()
 const toastSuccess = (title, message) => toast.success(title, message)
 const toastError = (title, message) => toast.error(title, message)
 const toastWarning = (title, message) => toast.warning(title, message)
 const toastInfo = (title, message) => toast.info(title, message)

 const handleTabChange = (tabKey) => {
 setSearchParams({ tab: tabKey })
 if (tabKey === 'verifikasi') setPermStatusFilter('pending')
 if (tabKey === 'koreksi') setCorrStatusFilter('submitted')
 if (tabKey === 'tindak-lanjut') setFollowUpStatusFilter('all')
 }

 // ── States ──────────────────────────────────────────────────────────────────
 const [loading, setLoading] = useState(true)
 const [search, setSearch] = useState('')
 const [perPage, setPerPage] = useState(10)
 const [currentPage, setCurrentPage] = useState(1)

 // Data Collections from Real Database APIs
 const [recapData, setRecapData] = useState([])
 const [lessonSessions, setLessonSessions] = useState([])
 const [permissions, setPermissions] = useState([])
 const [corrections, setCorrections] = useState([])
 const [followUps, setFollowUps] = useState([])

 // Options loaded live from Database
 const [studentOptions, setStudentOptions] = useState([])
 const [subjectOptions, setSubjectOptions] = useState([])
 const [teacherOptions, setTeacherOptions] = useState([])
 const [classOptions, setClassOptions] = useState([])

 // Specific Filters
 const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
 const [selectedSubjectId, setSelectedSubjectId] = useState('')
 const [selectedTeacherId, setSelectedTeacherId] = useState('')
 const [selectedClassId, setSelectedClassId] = useState('')
 const [selectedSessionDate, setSelectedSessionDate] = useState('')
 const [permStatusFilter, setPermStatusFilter] = useState('pending')
 const [corrStatusFilter, setCorrStatusFilter] = useState('submitted')
 const [followUpStatusFilter, setFollowUpStatusFilter] = useState('all')

 // Modals & Action States
 const [busy, setBusy] = useState(false)
 const [selectedItem, setSelectedItem] = useState(null)
 const [reviewAction, setReviewAction] = useState('approved')
 const [reviewNote, setReviewNote] = useState('')

 // Modals Open States
 const [permReviewModalOpen, setPermReviewModalOpen] = useState(false)
 const [corrReviewModalOpen, setCorrReviewModalOpen] = useState(false)
 const [followUpCreateModalOpen, setFollowUpCreateModalOpen] = useState(false)
 const [sessionDetailModalOpen, setSessionDetailModalOpen] = useState(false)
 const [printOptionModalOpen, setPrintOptionModalOpen] = useState(false)

 // Form Data for FollowUp Create
 const [followUpForm, setFollowUpForm] = useState({
 student_id: '',
 action_type: 'panggilan_orang_tua',
 follow_up_date: new Date().toISOString().slice(0, 10),
 notes: '',
 })

 // ── Load Real Options from Database ──────────────────────────────────────────
 useEffect(() => {
 studentService.getDaftar({ per_page: 300 })
 .then((res) => {
 const list = res?.data?.data || res?.data || res || []
 if (Array.isArray(list)) setStudentOptions(list)
 })
 .catch(() => {})

 subjectService.getDaftar({ per_page: 300 })
 .then((res) => {
 const list = res?.data?.data || res?.data || res || []
 if (Array.isArray(list)) setSubjectOptions(list)
 })
 .catch(() => {})

 employeeService.getDaftar({ per_page: 300 })
 .then((res) => {
 const list = res?.data?.data || res?.data || res || []
 if (Array.isArray(list)) setTeacherOptions(list)
 })
 .catch(() => {})

 kelasService.getDaftar({ per_page: 300 })
 .then((res) => {
 const list = res?.data?.data || res?.data || res || []
 if (Array.isArray(list)) setClassOptions(list)
 })
 .catch(() => {})
 }, [])

 // ── Data Loaders per Tab (Database Driven) ──────────────────────────────────
 const loadData = useCallback(async () => {
 setLoading(true)
 try {
 const [recapRes, sessionRes, permRes, corrRes, followUpRes] = await Promise.allSettled([
 lmsPresensiService.getReport({ month: selectedMonth, per_page: 200 }),
 lmsPresensiService.getSessions({
 subject_id: selectedSubjectId || undefined,
 employee_id: selectedTeacherId || undefined,
 class_id: selectedClassId || undefined,
 date_from: selectedSessionDate || undefined,
 date_to: selectedSessionDate || undefined,
 per_page: 200,
 }),
 lmsPresensiService.getHomeroomPermissions({
 status: activeTab === 'verifikasi' && permStatusFilter !== 'all' ? permStatusFilter : undefined,
 }),
 lmsPresensiService.getCorrections({
 status: activeTab === 'koreksi' && corrStatusFilter !== 'all' ? corrStatusFilter : undefined,
 }),
 lmsPresensiService.getFollowUps({
 status: activeTab === 'tindak-lanjut' && followUpStatusFilter !== 'all' ? followUpStatusFilter : undefined,
 }),
 ])

 if (recapRes.status === 'fulfilled') {
 const raw = recapRes.value?.data?.data || recapRes.value?.data?.students || recapRes.value?.data || []
 setRecapData(Array.isArray(raw) ? raw : [])
 }
 if (sessionRes.status === 'fulfilled') {
 const payload = sessionRes.value?.data?.data || sessionRes.value?.data || sessionRes.value || []
 const sessionsList = Array.isArray(payload.data) ? payload.data : Array.isArray(payload) ? payload : []
 setLessonSessions(sessionsList)
 }
 if (permRes.status === 'fulfilled') {
 const raw = permRes.value?.data?.data || permRes.value?.data || []
 setPermissions(Array.isArray(raw) ? raw : [])
 }
 if (corrRes.status === 'fulfilled') {
 const raw = corrRes.value?.data?.data || corrRes.value?.data || []
 setCorrections(Array.isArray(raw) ? raw : [])
 }
 if (followUpRes.status === 'fulfilled') {
 const raw = followUpRes.value?.data?.data || followUpRes.value?.data || []
 setFollowUps(Array.isArray(raw) ? raw : [])
 }
 } catch (err) {
 console.error(`Failed to load authentic DB data:`, err)
 } finally {
 setLoading(false)
 }
 }, [activeTab, selectedMonth, selectedSubjectId, selectedTeacherId, selectedClassId, selectedSessionDate, permStatusFilter, corrStatusFilter, followUpStatusFilter])

 useEffect(() => {
 loadData()
 }, [loadData])

 useEffect(() => {
 setCurrentPage(1)
 setSearch('')
 }, [activeTab, permStatusFilter, corrStatusFilter, followUpStatusFilter, selectedMonth, selectedSubjectId, selectedTeacherId, selectedClassId, selectedSessionDate])

 // ── Metrics Calculation ──────────────────────────────────────────────────────
 const metrics = useMemo(() => {
 return {
 recapTotal: recapData.length,
 sessionTotal: lessonSessions.length,
 permPending: permissions.filter((p) => p.status === 'submitted' || p.status === 'reviewing' || p.status === 'pending').length,
 corrPending: corrections.filter((c) => c.status === 'submitted' || c.status === 'reviewing' || c.status === 'pending').length,
 followUpOpen: followUps.filter((f) => f.status === 'open' || f.status === 'in_progress' || f.status === 'submitted').length,
 }
 }, [recapData, lessonSessions, permissions, corrections, followUps])

 // ── Filtered & Paginated Lists ───────────────────────────────────────────────
 const filteredList = useMemo(() => {
 const term = search.toLowerCase()
 if (activeTab === 'rekap') {
 return recapData.filter((item) => {
 const name = (item.student_name || item.nama || item.name || '').toLowerCase()
 const nisn = (item.nisn || '').toLowerCase()
 return !term || name.includes(term) || nisn.includes(term)
 })
 }
 if (activeTab === 'sesi-pelajaran') {
 return lessonSessions.filter((item) => {
 const subjectName = (item.schedule?.subject?.name || item.subject_name || '').toLowerCase()
 const teacherName = (item.schedule?.employee?.nama_lengkap || item.teacher_name || '').toLowerCase()
 const className = (item.schedule?.kelas?.nama_kelas || item.class_name || '').toLowerCase()
 return !term || subjectName.includes(term) || teacherName.includes(term) || className.includes(term)
 })
 }
 if (activeTab === 'verifikasi') {
 return permissions.filter((item) => {
 const studentName = (item.student?.full_name || item.student_name || item.siswa_nama || '').toLowerCase()
 const type = (item.permission_type || item.jenis || '').toLowerCase()
 return !term || studentName.includes(term) || type.includes(term)
 })
 }
 if (activeTab === 'koreksi') {
 return corrections.filter((item) => {
 const studentName = (item.student?.full_name || item.student_name || item.siswa_nama || '').toLowerCase()
 const subject = (item.subject || item.nama_matpel || '').toLowerCase()
 return !term || studentName.includes(term) || subject.includes(term)
 })
 }
 if (activeTab === 'tindak-lanjut') {
 return followUps.filter((item) => {
 const studentName = (item.student?.full_name || item.student_name || item.siswa_nama || '').toLowerCase()
 const action = (item.action_taken || item.action_type || '').toLowerCase()
 return !term || studentName.includes(term) || action.includes(term)
 })
 }
 return []
 }, [activeTab, search, recapData, lessonSessions, permissions, corrections, followUps])

 const totalPages = Math.ceil(filteredList.length / perPage) || 1
 const paginatedList = useMemo(() => {
 const start = (currentPage - 1) * perPage
 return filteredList.slice(start, start + perPage)
 }, [filteredList, currentPage, perPage])

 // ── Actions & Modals ────────────────────────────────────────────────────────
 const handleOpenPermReview = (item, action) => {
 setSelectedItem(item)
 setReviewAction(action)
 setReviewNote('')
 setPermReviewModalOpen(true)
 }

 const handleConfirmPermReview = async () => {
 if (!selectedItem) return
 setBusy(true)
 try {
 await lmsPresensiService.reviewPermission(selectedItem.id, {
 status: reviewAction,
 review_notes: reviewNote,
 review_note: reviewNote,
 })
 toastSuccess(
 reviewAction === 'approved' ? 'Izin Disetujui' : 'Izin Ditolak',
 `Pengajuan izin siswa berhasil di-${reviewAction === 'approved' ? 'setujui' : 'tolak'}.`
 )
 setPermReviewModalOpen(false)
 loadData()
 } catch (err) {
 toastError(
 'Gagal memproses verifikasi',
 err.response?.data?.message || 'Terjadi kesalahan saat memproses izin.'
 )
 } finally {
 setBusy(false)
 }
 }

 const handleOpenCorrReview = (item, action) => {
 setSelectedItem(item)
 setReviewAction(action)
 setReviewNote('')
 setCorrReviewModalOpen(true)
 }

 const handleConfirmCorrReview = async () => {
 if (!selectedItem) return
 setBusy(true)
 try {
 await lmsPresensiService.reviewCorrection(selectedItem.id, {
 status: reviewAction,
 review_note: reviewNote,
 })
 toastSuccess(
 reviewAction === 'approved' ? 'Koreksi Disetujui' : 'Koreksi Ditolak',
 `Pengajuan koreksi presensi berhasil di-${reviewAction === 'approved' ? 'setujui' : 'tolak'}.`
 )
 setCorrReviewModalOpen(false)
 loadData()
 } catch (err) {
 toastError(
 'Gagal memproses koreksi',
 err.response?.data?.message || 'Terjadi kesalahan saat memproses koreksi presensi.'
 )
 } finally {
 setBusy(false)
 }
 }

 const handleCreateFollowUp = async (e) => {
 e.preventDefault()
 setBusy(true)
 try {
 await lmsPresensiService.createFollowUp(followUpForm)
 toastSuccess('Tindak Lanjut Berhasil Ditambahkan', 'Catatan penanganan siswa telah disimpan.')
 setFollowUpCreateModalOpen(false)
 setFollowUpForm({
 student_id: '',
 action_type: 'panggilan_orang_tua',
 follow_up_date: new Date().toISOString().slice(0, 10),
 notes: '',
 })
 loadData()
 } catch (err) {
 toastError(
 'Gagal menyimpan tindak lanjut',
 err.response?.data?.message || 'Terjadi kesalahan saat menambahkan catatan tindak lanjut.'
 )
 } finally {
 setBusy(false)
 }
 }

 const handleExport = () => {
 setPrintOptionModalOpen(true)
 }

 // ── Handlers for Print Clean & Download PDF ────────────────────────────────
 const handlePrintClean = () => {
 let headers = []
 let rows = []
 let title = 'Laporan Presensi Siswa'

 if (activeTab === 'rekap') {
 title = 'Laporan Rekapitulasi Presensi Siswa'
 headers = ['#', 'Nama Siswa', 'NISN', 'Kelas', 'Hadir', 'Sakit', 'Izin', 'Alpa', 'Terlambat', 'Kehadiran (%)']
 rows = filteredList.map((item, idx) => {
 const hadir = item.hadir || item.present || 0
 const sakit = item.sakit || item.sick || 0
 const izin = item.izin || item.permission || 0
 const alpa = item.alpa || item.absent || 0
 const terlambat = item.terlambat || item.late || 0
 const totalDays = hadir + sakit + izin + alpa + terlambat || 1
 const pct = Math.round(((hadir + terlambat) / totalDays) * 100)
 return [
 idx + 1,
 item.student_name || item.nama || item.name || 'Siswa',
 item.nisn || '-',
 item.kelas || item.class_name || '-',
 hadir, sakit, izin, alpa, terlambat,
 `${pct}%`
 ]
 })
 } else if (activeTab === 'sesi-pelajaran') {
 title = 'Laporan Presensi Sesi Pelajaran'
 headers = ['#', 'Mata Pelajaran', 'Guru Pengajar', 'Kelas', 'Tanggal', 'Pertemuan', 'Kehadiran', 'Status']
 rows = filteredList.map((item, idx) => [
 idx + 1,
 item.schedule?.subject?.name || item.subject_name || '-',
 item.schedule?.employee?.nama_lengkap || item.teacher_name || '-',
 item.schedule?.kelas?.nama_kelas || item.class_name || '-',
 item.attendance_date || item.tanggal || '-',
 `Pertemuan ${item.meeting_number || 1}`,
 `${(item.attendances || []).filter(a => a.status === 'HADIR' || a.status_hadir === 'hadir').length} / ${(item.attendances || []).length} Siswa`,
 item.status || 'Final'
 ])
 } else if (activeTab === 'verifikasi') {
 title = 'Laporan Verifikasi Izin / Sakit Siswa'
 headers = ['#', 'Nama Siswa', 'Kelas', 'Jenis Izin', 'Tanggal Mulai', 'Tanggal Selesai', 'Alasan', 'Status']
 rows = filteredList.map((item, idx) => [
 idx + 1,
 item.student?.full_name || item.student_name || item.siswa_nama || '-',
 item.student?.kelas?.nama_kelas || item.class_name || '-',
 (item.permission_type || item.jenis || 'Izin').toUpperCase(),
 item.start_date || '-',
 item.end_date || '-',
 item.reason || item.alasan || '-',
 item.status || 'Submitted'
 ])
 } else if (activeTab === 'koreksi') {
 title = 'Laporan Permohonan Koreksi Presensi'
 headers = ['#', 'Nama Siswa', 'Pelajaran', 'Tanggal', 'Status Awal', 'Usulan Koreksi', 'Alasan', 'Status']
 rows = filteredList.map((item, idx) => [
 idx + 1,
 item.student?.full_name || item.student_name || item.siswa_nama || '-',
 item.subject || item.nama_matpel || '-',
 item.attendance_date || item.tanggal || '-',
 item.original_status || 'ALPHA',
 item.requested_status || 'HADIR',
 item.reason || item.alasan || '-',
 item.status || 'Submitted'
 ])
 } else if (activeTab === 'tindak-lanjut') {
 title = 'Laporan Tindak Lanjut Siswa'
 headers = ['#', 'Nama Siswa', 'Kelas', 'Bentuk Tindakan', 'Tanggal Penanganan', 'Catatan / Rekomendasi', 'Status']
 rows = filteredList.map((item, idx) => [
 idx + 1,
 item.student?.full_name || item.student_name || item.siswa_nama || '-',
 item.student?.kelas?.nama_kelas || item.class_name || '-',
 (item.action_taken || item.action_type || '-').replace(/_/g, ' ').toUpperCase(),
 item.follow_up_date || item.tanggal || '-',
 item.notes || item.catatan || '-',
 item.status || 'Open'
 ])
 }

 printCleanTable({
 title,
 subtitle: `Daftar ${rows.length} Data Kehadiran`,
 headers,
 rows,
 })
 }

 const handleDownloadPdfTable = () => {
 let headers = []
 let rows = []
 let title = 'Laporan Presensi Siswa'

 if (activeTab === 'rekap') {
 title = 'Laporan Rekapitulasi Presensi Siswa'
 headers = ['#', 'Nama Siswa', 'NISN', 'Kelas', 'Hadir', 'Sakit', 'Izin', 'Alpa', 'Terlambat', 'Kehadiran (%)']
 rows = filteredList.map((item, idx) => {
 const hadir = item.hadir || item.present || 0
 const sakit = item.sakit || item.sick || 0
 const izin = item.izin || item.permission || 0
 const alpa = item.alpa || item.absent || 0
 const terlambat = item.terlambat || item.late || 0
 const totalDays = hadir + sakit + izin + alpa + terlambat || 1
 const pct = Math.round(((hadir + terlambat) / totalDays) * 100)
 return [
 idx + 1,
 item.student_name || item.nama || item.name || 'Siswa',
 item.nisn || '-',
 item.kelas || item.class_name || '-',
 hadir, sakit, izin, alpa, terlambat,
 `${pct}%`
 ]
 })
 } else if (activeTab === 'sesi-pelajaran') {
 title = 'Laporan Presensi Sesi Pelajaran'
 headers = ['#', 'Mata Pelajaran', 'Guru Pengajar', 'Kelas', 'Tanggal', 'Pertemuan', 'Kehadiran', 'Status']
 rows = filteredList.map((item, idx) => [
 idx + 1,
 item.schedule?.subject?.name || item.subject_name || '-',
 item.schedule?.employee?.nama_lengkap || item.teacher_name || '-',
 item.schedule?.kelas?.nama_kelas || item.class_name || '-',
 item.attendance_date || item.tanggal || '-',
 `Pertemuan ${item.meeting_number || 1}`,
 `${(item.attendances || []).filter(a => a.status === 'HADIR' || a.status_hadir === 'hadir').length} / ${(item.attendances || []).length} Siswa`,
 item.status || 'Final'
 ])
 } else if (activeTab === 'verifikasi') {
 title = 'Laporan Verifikasi Izin / Sakit Siswa'
 headers = ['#', 'Nama Siswa', 'Kelas', 'Jenis Izin', 'Tanggal Mulai', 'Tanggal Selesai', 'Alasan', 'Status']
 rows = filteredList.map((item, idx) => [
 idx + 1,
 item.student?.full_name || item.student_name || item.siswa_nama || '-',
 item.student?.kelas?.nama_kelas || item.class_name || '-',
 (item.permission_type || item.jenis || 'Izin').toUpperCase(),
 item.start_date || '-',
 item.end_date || '-',
 item.reason || item.alasan || '-',
 item.status || 'Submitted'
 ])
 } else if (activeTab === 'koreksi') {
 title = 'Laporan Permohonan Koreksi Presensi'
 headers = ['#', 'Nama Siswa', 'Pelajaran', 'Tanggal', 'Status Awal', 'Usulan Koreksi', 'Alasan', 'Status']
 rows = filteredList.map((item, idx) => [
 idx + 1,
 item.student?.full_name || item.student_name || item.siswa_nama || '-',
 item.subject || item.nama_matpel || '-',
 item.attendance_date || item.tanggal || '-',
 item.original_status || 'ALPHA',
 item.requested_status || 'HADIR',
 item.reason || item.alasan || '-',
 item.status || 'Submitted'
 ])
 } else if (activeTab === 'tindak-lanjut') {
 title = 'Laporan Tindak Lanjut Siswa'
 headers = ['#', 'Nama Siswa', 'Kelas', 'Bentuk Tindakan', 'Tanggal Penanganan', 'Catatan / Rekomendasi', 'Status']
 rows = filteredList.map((item, idx) => [
 idx + 1,
 item.student?.full_name || item.student_name || item.siswa_nama || '-',
 item.student?.kelas?.nama_kelas || item.class_name || '-',
 (item.action_taken || item.action_type || '-').replace(/_/g, ' ').toUpperCase(),
 item.follow_up_date || item.tanggal || '-',
 item.notes || item.catatan || '-',
 item.status || 'Open'
 ])
 }

 downloadPdfTable({
 title,
 subtitle: `Daftar ${rows.length} Data Kehadiran`,
 headers,
 rows,
 })
 }

 // ── Render Badges (HeroUI Badge Prompt Rules) ───────────────────────────
 const getStatusBadge = (status) => {
 const s = (status || '').toLowerCase()
 if (s === 'approved' || s === 'completed' || s === 'verified' || s === 'final') {
 return <Badge color="success" size="sm" prefixIcon={<CheckCircle1 className="size-3.5" />}>{status}</Badge>
 }
 if (s === 'rejected' || s === 'closed' || s === 'cancelled') {
 return <Badge color="error" size="sm" prefixIcon={<Xmark2x className="size-3.5" />}>{status}</Badge>
 }
 if (s === 'in_progress' || s === 'reviewing' || s === 'draft') {
 return <Badge color="sky" size="sm" prefixIcon={<Clock size={12} />}>{status}</Badge>
 }
 return <Badge color="warning" size="sm" prefixIcon={<InfoCircle className="size-3.5" />}>{status || 'Submitted'}</Badge>
 }

 const containerVariants = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: { staggerChildren: 0.04, delayChildren: 0.02 },
 },
 }

 const itemVariants = {
 hidden: { opacity: 0, y: 12 },
 visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
 }

 // ── SUB-KOMPONEN MODERN KPI CARDS (Spesifikasi Sesuai Dashboard Kepala Sekolah) ──
 const MODERN_CARD_TONES = {
 emerald: {
 card: 'border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
 glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
 iconBox: 'bg-slate-100 border border-emerald-200/70 text-slate-700 shadow-xs dark:bg-slate-800 dark:border-emerald-700/80 dark:text-slate-300',
 tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
 title: 'text-emerald-700 dark:text-emerald-400',
 val: 'text-emerald-700 dark:text-emerald-300',
 sub: 'text-emerald-600/80 dark:text-emerald-400/80',
 cta: 'text-emerald-600/60 dark:text-emerald-500/60',
 },
 blue: {
 card: 'border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] hover:border-blue-400 dark:border-blue-700/50 dark:from-blue-950/40 dark:via-cyan-950/20 dark:to-slate-900',
 glow: 'bg-blue-400/20 group-hover:bg-blue-400/30',
 iconBox: 'bg-white dark:bg-[#1B2433] shadow-sm',
 tag: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
 title: 'text-blue-700 dark:text-blue-400',
 val: 'text-blue-700 dark:text-blue-300',
 sub: 'text-blue-600/80 dark:text-blue-400/80',
 cta: 'text-blue-600/60 dark:text-blue-500/60',
 },
 amber: {
 card: 'border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
 glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
 iconBox: 'bg-white dark:bg-[#1B2433] shadow-sm',
 tag: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
 title: 'text-amber-700 dark:text-amber-400',
 val: 'text-amber-700 dark:text-amber-300',
 sub: 'text-amber-600/80 dark:text-amber-400/80',
 cta: 'text-amber-600/60 dark:text-amber-500/60',
 },
 rose: {
 card: 'border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] hover:border-rose-400 dark:border-rose-700/50 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-slate-900',
 glow: 'bg-rose-400/20 group-hover:bg-rose-400/30',
 iconBox: 'bg-white dark:bg-[#1B2433] shadow-sm',
 tag: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
 title: 'text-rose-700 dark:text-rose-400',
 val: 'text-rose-700 dark:text-rose-300',
 sub: 'text-rose-600/80 dark:text-rose-400/80',
 cta: 'text-rose-600/60 dark:text-rose-500/60',
 },
 purple: {
 card: 'border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] hover:border-purple-400 dark:border-purple-700/50 dark:from-purple-950/40 dark:via-indigo-950/20 dark:to-slate-900',
 glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
 iconBox: 'bg-slate-100 border border-emerald-200/70 text-slate-700 dark:bg-slate-800 dark:border-emerald-700/80 dark:text-slate-300 shadow-sm',
 tag: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
 title: 'text-purple-700 dark:text-purple-400',
 val: 'text-purple-700 dark:text-purple-300',
 sub: 'text-purple-600/80 dark:text-purple-400/80',
 cta: 'text-purple-600/60 dark:text-purple-500/60',
 },
 }

 function ModernKpiCard({ icon: Icon, label, subtext, value, tag, tone = 'emerald', onClick, active }) {
 const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
 const isClickable = typeof onClick === 'function'

 return (
 <motion.div
 variants={itemVariants}
 whileHover={{ scale: 1.02, y: -2 }}
 whileTap={{ scale: 0.98 }}
 transition={{ type: 'spring', stiffness: 400, damping: 25 }}
 onClick={onClick}
 role={isClickable ? 'button' : undefined}
 tabIndex={isClickable ? 0 : undefined}
 onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
 className={`group relative overflow-hidden rounded-2xl border-2 p-4.5 sm:p-5 shadow-sm transition-all duration-200 text-left ${
 isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
 } ${
 active
 ? 'ring-2 ring-emerald-500/60 border-emerald-500/90 shadow-md shadow-sm dark:ring-emerald-400/60 dark:border-emerald-400/90'
 : ''
 } ${t.card}`}
 >
 {/* Ambient Glow */}

 {/* Header with Gradient Icon Box & Pill Tag */}
 <div className="flex items-center justify-between mb-3">
 <div className="flex items-center gap-2.5">
 <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-emerald-600 shadow-sm ${t.iconBox}`}>
 <Icon className="h-4.5 w-4.5" />
 </div>
 <div>
 <p className={`text-xs font-bold uppercase tracking-wider ${t.title}`}>{label}</p>
 </div>
 </div>
 {tag && (
 <span className={`rounded-lg px-2 py-0.5 text-[10px] font-extrabold ${t.tag}`}>
 {tag}
 </span>
 )}
 </div>

 {/* Metric Value */}
 <p className={`text-3xl sm:text-4xl font-black tabular-nums ${t.val}`}>
 {value ?? '0'}
 </p>
 {subtext && (
 <p className={`mt-0.5 text-xs font-semibold ${t.sub}`}>
 {subtext}
 </p>
 )}

 {/* Click Affordance Footer */}
 {isClickable && (
 <p className={`mt-3 text-[10px] font-bold flex items-center gap-1 ${t.cta}`}>
 <Eye className="h-3 w-3" /> {active ? 'Tab Sedang Dipilih' : 'Klik untuk Buka Tab'}
 </p>
 )}
 </motion.div>
 )
 }

 return (
 <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">


 {/* BREADCRUMB NAV */}
 <AppBreadcrumb items={[{ label: 'Absensi', href: '/absensi/rekap-kehadiran' }, { label: 'Manajemen Kehadiran Siswa' }]} />

 {/* MODERN HERO CARD HEADER (MATCHING PORTAL ORANG TUA / SISWA STYLE) */}
 <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
 <div className="relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] p-5 sm:p-6 shadow-md shadow-sm dark:border-emerald-600/40 dark:bg-[#1B2433]">

 <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div className="flex items-center gap-4">
 <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-emerald-200/70 text-slate-700 dark:bg-slate-800 dark:border-emerald-700/80 dark:text-slate-300 shadow-xl shadow-sm border border-emerald-300 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
 <CalendarCheck className="size-6 sm:size-7 text-slate-600" />
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2.5 flex-wrap">
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1 text-xs font-extrabold shadow-md shadow-sm">
 <Sparkles className="size-3 text-amber-300 animate-pulse" />
 Manajemen Presensi Terpadu
 </span>
 <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
 Rekapitulasi Kehadiran Siswa
 </span>
 </div>
 <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
 Rekapitulasi & Manajemen Kehadiran Siswa
 </h1>
 <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 w-full">
 Kelola matriks rekapitulasi presensi bulanan, absensi per mata pelajaran & guru, verifikasi surat izin/sakit, koreksi presensi, serta tindak lanjut siswa.
 </p>
 </div>
 </div>

 {/* Quick Action Buttons */}
 <div className="flex items-center gap-2.5 shrink-0">
 <button
 type="button"
 className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 dark:bg-slate-100 dark:text-slate-900 dark: px-4 py-2.5 text-xs font-bold shadow-md shadow-sm transition-all hover:scale-[1.02] cursor-pointer text-white border border-emerald-600 h-9 text-sm font-medium"
 onClick={() => setPrintOptionModalOpen(true)}
 >
 <Printer className="size-4" />
 <span>Cetak / PDF</span>
 </button>
 <button
 type="button"
 className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-800 shadow-sm border border-emerald-200/80 hover:bg-slate-50 dark:bg-slate-800 dark:border-emerald-700/80 dark:text-white transition-all cursor-pointer"
 onClick={loadData}
 >
 <RefreshCcw className="size-4 text-emerald-600" />
 <span>Segarkan Data</span>
 </button>
 </div>
 </div>
 </div>
 </motion.div>

 {/* Modern KPI Metric Grid (Style Kepala Sekolah Dashboard) */}
 <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4">
 <ModernKpiCard
 icon={Users}
 label="Rekapitulasi Siswa"
 value={metrics.recapTotal}
 subtext="Periode Bulan Ini"
 tag="Rekap Matriks"
 tone="blue"
 active={activeTab === 'rekap'}
 onClick={() => handleTabChange('rekap')}
 />
 <ModernKpiCard
 icon={BookOpen}
 label="Sesi Pelajaran"
 value={metrics.sessionTotal}
 subtext="Matpel & Guru"
 tag="Sesi Mapel"
 tone="emerald"
 active={activeTab === 'sesi-pelajaran'}
 onClick={() => handleTabChange('sesi-pelajaran')}
 />
 <ModernKpiCard
 icon={FileCheck2}
 label="Verifikasi Izin"
 value={metrics.permPending}
 subtext="Menunggu Persetujuan"
 tag="Perlu Approval"
 tone="amber"
 active={activeTab === 'verifikasi'}
 onClick={() => handleTabChange('verifikasi')}
 />
 <ModernKpiCard
 icon={FileEdit}
 label="Koreksi Presensi"
 value={metrics.corrPending}
 subtext="Pengajuan Siswa"
 tag="Koreksi Data"
 tone="purple"
 active={activeTab === 'koreksi'}
 onClick={() => handleTabChange('koreksi')}
 />
 <ModernKpiCard
 icon={ShieldAlert}
 label="Tindak Lanjut"
 value={metrics.followUpOpen}
 subtext="Penanganan Siswa Alpa"
 tag="Perlu Tindakan"
 tone="rose"
 active={activeTab === 'tindak-lanjut'}
 onClick={() => handleTabChange('tindak-lanjut')}
 />
 </motion.div>

 {/* Main Master Datatable Container Card (Gold Standard Architecture) */}
 <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/25 bg-white shadow-md shadow-sm dark:border-emerald-600/35 dark:bg-[#1B2433]">
 {/* Workspace Navigation Tabs Toolbar Header */}
 <div className="relative z-30 bg-slate-50/50 dark:bg-slate-900/50 border-b border-emerald-500/20 px-4 py-3 sm:px-6 md:px-8">
 <nav role="tablist" className="flex items-center gap-2.5 flex-wrap py-1" aria-label="Modul Presensi Siswa">
 {/* Tab 1: Rekapitulasi Kehadiran */}
 <div className="group relative inline-flex">
 <button
 type="button"
                role="tab"
                aria-selected={activeTab === 'rekap'}
                title="Rekapitulasi Kehadiran"
                aria-label="Rekapitulasi Kehadiran"
                onClick={() => handleTabChange('rekap')}
                className={`flex size-10 items-center justify-center rounded-xl cursor-pointer shadow-2xs transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 select-none ${
                  activeTab === 'rekap'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 dark:bg-emerald-600 dark:text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white hover:shadow-md hover:shadow-sm'
                }`}
 >
 <Users className="size-5 transition-colors" />
 </button>
 <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-[9999] whitespace-nowrap rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold shadow-2xl dark:bg-slate-100 dark:text-slate-900 border border-emerald-700/80/50 dark:border-emerald-300">
 <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
 Rekapitulasi Kehadiran
 </div>
 </div>

 {/* Tab 2: Sesi Pelajaran */}
 <div className="group relative inline-flex">
 <button
 type="button"
 role="tab"
 aria-selected={activeTab === 'sesi-pelajaran'}
 title="Absensi Per Mata Pelajaran & Guru"
 aria-label="Absensi Per Mata Pelajaran & Guru"
 onClick={() => handleTabChange('sesi-pelajaran')}
 className={`flex size-10 items-center justify-center rounded-xl cursor-pointer shadow-2xs transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 select-none ${
 activeTab === 'sesi-pelajaran'
 ? 'bg-emerald-600 shadow-md shadow-sm dark:bg-emerald-500 dark:text-white'
 : 'bg-emerald-100/90 text-emerald-600 hover:bg-emerald-500 hover:dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-500 dark:hover:text-white hover:shadow-md hover:shadow-sm'
 }`}
 >
 <BookOpen className="size-5 transition-colors" />
 </button>
 <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-[9999] whitespace-nowrap rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold shadow-2xl dark:bg-slate-100 dark:text-slate-900 border border-emerald-700/80/50 dark:border-emerald-300">
 <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
 Absensi Per Mata Pelajaran & Guru
 </div>
 </div>

 {/* Tab 3: Verifikasi Izin / Sakit */}
 <div className="group relative inline-flex">
 <button
 type="button"
 role="tab"
 aria-selected={activeTab === 'verifikasi'}
 title="Verifikasi Izin / Sakit"
 aria-label="Verifikasi Izin / Sakit"
 onClick={() => handleTabChange('verifikasi')}
 className={`flex size-10 items-center justify-center rounded-xl cursor-pointer shadow-2xs transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 select-none ${
 activeTab === 'verifikasi'
 ? 'bg-amber-600 text-white shadow-md shadow-sm dark:bg-amber-500 dark:text-white'
 : 'bg-amber-100/90 text-amber-600 hover:bg-amber-500 hover:text-white dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white hover:shadow-md hover:shadow-sm'
 }`}
 >
 <FileCheck2 className="size-5 transition-colors" />
 </button>
 <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-[9999] whitespace-nowrap rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold shadow-2xl dark:bg-slate-100 dark:text-slate-900 border border-emerald-700/80/50 dark:border-emerald-300">
 <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
 Verifikasi Izin / Sakit
 </div>
 </div>

 {/* Tab 4: Koreksi Presensi */}
 <div className="group relative inline-flex">
 <button
 type="button"
 role="tab"
 aria-selected={activeTab === 'koreksi'}
 title="Koreksi Presensi"
 aria-label="Koreksi Presensi"
 onClick={() => handleTabChange('koreksi')}
 className={`flex size-10 items-center justify-center rounded-xl cursor-pointer shadow-2xs transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40 select-none ${
 activeTab === 'koreksi'
 ? 'bg-purple-600 text-white shadow-md shadow-sm dark:bg-purple-500 dark:text-white'
 : 'bg-purple-100/90 text-purple-600 hover:bg-purple-500 hover:text-white dark:bg-purple-950/60 dark:text-purple-300 dark:hover:bg-purple-500 dark:hover:text-white hover:shadow-md hover:shadow-sm'
 }`}
 >
 <FileEdit className="size-5 transition-colors" />
 </button>
 <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-[9999] whitespace-nowrap rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold shadow-2xl dark:bg-slate-100 dark:text-slate-900 border border-emerald-700/80/50 dark:border-emerald-300">
 <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
 Koreksi Presensi
 </div>
 </div>

 {/* Tab 5: Tindak Lanjut Siswa */}
 <div className="group relative inline-flex">
 <button
 type="button"
 role="tab"
 aria-selected={activeTab === 'tindak-lanjut'}
 title="Tindak Lanjut Siswa"
 aria-label="Tindak Lanjut Siswa"
 onClick={() => handleTabChange('tindak-lanjut')}
 className={`flex size-10 items-center justify-center rounded-xl cursor-pointer shadow-2xs transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40 select-none ${
 activeTab === 'tindak-lanjut'
 ? 'bg-rose-600 text-white shadow-md shadow-sm dark:bg-rose-500 dark:text-white'
 : 'bg-rose-100/90 text-rose-600 hover:bg-rose-500 hover:text-white dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-500 dark:hover:text-white hover:shadow-md hover:shadow-sm'
 }`}
 >
 <ShieldAlert className="size-5 transition-colors" />
 </button>
 <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-[9999] whitespace-nowrap rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold shadow-2xl dark:bg-slate-100 dark:text-slate-900 border border-emerald-700/80/50 dark:border-emerald-300">
 <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
 Tindak Lanjut Siswa
 </div>
 </div>
 </nav>
 </div>

 {/* Standard Toolbar Structure (2-Baris Gold Standard) */}
 <div className="space-y-3.5 p-4 sm:p-6 md:p-8 bg-slate-50/50 dark:bg-slate-900/50 border-b border-emerald-500/15 dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-emerald-950/20">
 {/* Baris 1: Tab Title + Soft Pastel Squircle Action Buttons with Floating Tooltips */}
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
 <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
 {activeTab === 'rekap' && <><Users size={18} className="text-blue-600" /> Matriks Rekapitulasi Presensi Siswa</>}
 {activeTab === 'sesi-pelajaran' && <><BookOpen size={18} className="text-emerald-600" /> Presensi Sesi Kelas Per Mata Pelajaran & Guru</>}
 {activeTab === 'verifikasi' && <><FileCheck2 size={18} className="text-amber-600" /> Daftar Pengajuan Izin & Sakit Siswa</>}
 {activeTab === 'koreksi' && <><FileEdit size={18} className="text-purple-600" /> Permohonan Koreksi Presensi Guru</>}
 {activeTab === 'tindak-lanjut' && <><ShieldAlert size={18} className="text-rose-600" /> Catatan Penanganan & Tindak Lanjut Siswa</>}
 </h2>

 <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
 {/* Import Button (.csv, .xlsx, .xls) */}
 <SquircleActionButton
 variant="import"
 label="Import Data (.csv, .xlsx, .xls)"
 onClick={() => toastInfo('Import Data Presensi', 'Membuka dialog pengunggahan berkas masal...')}
 />

 {/* Export Button */}
 <SquircleActionButton
 variant="export"
 label="Ekspor Data (Excel/CSV)"
 onClick={handleExport}
 />

 {/* Cetak Laporan Button */}
 <SquircleActionButton
 variant="view"
 icon={Printer}
 label="Cetak Laporan"
 onClick={() => setPrintOptionModalOpen(true)}
 />

 {/* Refresh Segarkan Data Button */}
 <SquircleActionButton
 variant="ghost"
 icon={RefreshCcw}
 label="Segarkan Data (Real DB)"
 onClick={loadData}
 />

 {/* Action Plus Button */}
 {activeTab === 'tindak-lanjut' && (
 <SquircleActionButton
 variant="primary"
 icon={Plus}
 label="Tambah Catatan Tindak Lanjut"
 onClick={() => setFollowUpCreateModalOpen(true)}
 />
 )}
 </div>
 </div>

 {/* Baris 2: Search Input + Dynamic Dropdown Filters (Database Driven) + perPage Selector */}
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
 <div className="relative flex-1 max-w-md">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
 <Input
 type="text"
 placeholder={
 activeTab === 'rekap'
 ? 'Cari NISN atau nama siswa...'
 : activeTab === 'sesi-pelajaran'
 ? 'Cari mata pelajaran, guru, atau rombel...'
 : activeTab === 'verifikasi'
 ? 'Cari nama siswa atau jenis izin...'
 : activeTab === 'koreksi'
 ? 'Cari nama siswa atau matpel...'
 : 'Cari nama siswa atau bentuk tindakan...'
 }
 value={search}
 onChange={(e) => {
 setSearch(e.target.value)
 setCurrentPage(1)
 }}
 className="pl-9 text-xs"
 />
 </div>

 <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
 {/* Filter Tab 1: Month */}
 {activeTab === 'rekap' && (
 <div className="flex items-center gap-2 w-full sm:w-auto">
 <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
 <Calendar size={14} /> Periode:
 </label>
 <input
 type="month"
 value={selectedMonth}
 onChange={(e) => setSelectedMonth(e.target.value)}
 className="w-full sm:w-auto min-w-[140px] rounded-2xl border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-200"
 />
 </div>
 )}

 {/* Filter Tab 2: Sesi Pelajaran (Mata Pelajaran, Guru, Rombel, Tanggal) */}
 {activeTab === 'sesi-pelajaran' && (
 <>
 {/* Dropdown Mata Pelajaran dari Database */}
 <CustomSelect
 value={selectedSubjectId}
 onChange={(e) => setSelectedSubjectId(e.target.value)}
 className="w-full sm:w-auto min-w-[140px] rounded-2xl border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-200 truncate"
 >
 <option value="">Semua Mata Pelajaran</option>
 {subjectOptions.map((subj) => (
 <option key={subj.id} value={subj.id}>
 {subj.name || subj.nama_matpel || subj.code}
 </option>
 ))}
 </CustomSelect>

 {/* Dropdown Guru Pengajar dari Database */}
 <CustomSelect
 value={selectedTeacherId}
 onChange={(e) => setSelectedTeacherId(e.target.value)}
 className="w-full sm:w-auto min-w-[140px] rounded-2xl border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-200 truncate"
 >
 <option value="">Semua Guru Pengajar</option>
 {teacherOptions.map((t) => (
 <option key={t.id} value={t.id}>
 {t.nama_lengkap || t.full_name || t.name} ({t.nip || 'NIP'})
 </option>
 ))}
 </CustomSelect>

 {/* Dropdown Rombel / Kelas */}
 <CustomSelect
 value={selectedClassId}
 onChange={(e) => setSelectedClassId(e.target.value)}
 className="w-full sm:w-auto min-w-[140px] rounded-2xl border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-200"
 >
 <option value="">Semua Rombel</option>
 {classOptions.map((c) => (
 <option key={c.id} value={c.id}>
 {c.nama_kelas || c.name}
 </option>
 ))}
 </CustomSelect>

 {/* Date Filter */}
 <DatePicker
 value={selectedSessionDate}
 onChange={(e) => setSelectedSessionDate(e.target.value)}
 className="w-full sm:w-auto min-w-[140px]"
 inputClassName="h-8 text-xs font-semibold"
 />
 </>
 )}

 {/* Filter Tab 3: Status Izin */}
 {activeTab === 'verifikasi' && (
 <CustomSelect
 value={permStatusFilter}
 onChange={(e) => setPermStatusFilter(e.target.value)}
 className="w-full sm:w-auto min-w-[140px] rounded-2xl border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-200"
 >
 <option value="pending">Menunggu Verifikasi (Pending)</option>
 <option value="submitted">Submitted (Legacy)</option>
 <option value="approved">Disetujui (Approved)</option>
 <option value="rejected">Ditolak (Rejected)</option>
 <option value="all">Semua Status</option>
 </CustomSelect>
 )}

 {/* Filter Tab 4: Status Koreksi */}
 {activeTab === 'koreksi' && (
 <CustomSelect
 value={corrStatusFilter}
 onChange={(e) => setCorrStatusFilter(e.target.value)}
 className="w-full sm:w-auto min-w-[140px] rounded-2xl border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-200"
 >
 <option value="submitted">Menunggu Persetujuan</option>
 <option value="approved">Disetujui (Approved)</option>
 <option value="rejected">Ditolak (Rejected)</option>
 <option value="all">Semua Status</option>
 </CustomSelect>
 )}

 {/* Filter Tab 5: Status Tindak Lanjut */}
 {activeTab === 'tindak-lanjut' && (
 <CustomSelect
 value={followUpStatusFilter}
 onChange={(e) => setFollowUpStatusFilter(e.target.value)}
 className="w-full sm:w-auto min-w-[140px] rounded-2xl border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-200"
 >
 <option value="all">Semua Status Tindakan</option>
 <option value="new">Belum Ditangani (New)</option>
 <option value="in_progress">Dalam Proses</option>
 <option value="resolved">Selesai (Resolved)</option>
 <option value="closed">Closed (Ditutup)</option>
 </CustomSelect>
 )}

 <span className="text-xs font-medium text-slate-500">Tampilkan:</span>
 <CustomSelect
 value={perPage}
 onChange={(e) => {
 setPerPage(Number(e.target.value))
 setCurrentPage(1)
 }}
 className="rounded-2xl border border-emerald-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-200"
 >
 <option value={5}>5</option>
 <option value={10}>10</option>
 <option value={15}>15</option>
 <option value={25}>25</option>
 <option value={50}>50</option>
 <option value={100}>100</option>
 </CustomSelect>
 </div>
 </div>
 </div>

 {/* Content Table Body (px-4 sm:px-6 md:px-8) */}
 {loading ? (
 <div className="p-8">
 <AppSkeleton rows={6} />
 </div>
 ) : paginatedList.length === 0 ? (
 <div className="p-12">
 <AppEmptyState
 title="Tidak Ada Data Presensi Siswa"
 description="Belum ada catatan presensi dari database yang sesuai dengan kriteria pencarian dan filter yang dipilih."
 />
 </div>
 ) : (
 <div className="overflow-x-auto px-4 sm:px-6 md:px-8 py-2">
 {/* Tab 1: Rekapitulasi Presensi */}
 {activeTab === 'rekap' && (
 <TableRoot fullBleed={false}>
 <TableHeader>
 <TableRow className="bg-slate-50/80 border-b border-emerald-200/80 dark:bg-slate-900/80 dark:border-emerald-800/60">
 <TableHead className="w-12 text-center">#</TableHead>
 <TableHead>
 <div className="flex items-center gap-1">Siswa <ArrowBothDirectionHorizontal2 className="size-3.5" /></div>
 </TableHead>
 <TableHead className="text-center">Hadir (H)</TableHead>
 <TableHead className="text-center">Sakit (S)</TableHead>
 <TableHead className="text-center">Izin (I)</TableHead>
 <TableHead className="text-center">Alpa (A)</TableHead>
 <TableHead className="text-center">Terlambat (T)</TableHead>
 <TableHead className="text-center">Persentase Kehadiran</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {paginatedList.map((item, idx) => {
 const rowNum = (currentPage - 1) * perPage + idx + 1
 const hadir = item.hadir || item.present || 0
 const sakit = item.sakit || item.sick || 0
 const izin = item.izin || item.permission || 0
 const alpa = item.alpa || item.absent || 0
 const terlambat = item.terlambat || item.late || 0
 const totalDays = hadir + sakit + izin + alpa + terlambat || 1
 const percentage = Math.round(((hadir + terlambat) / totalDays) * 100)

 return (
 <TableRow key={item.student_id || item.id || idx} className="hover:scale-[1.001] transition-all hover:bg-slate-50/90 dark:hover:bg-slate-800/60">
 <TableCell className="text-center font-medium text-slate-500">{rowNum}</TableCell>
 <TableCell>
 <div className="flex items-center gap-3">
 <Avatar size="sm">
 <AvatarFallback className="bg-blue-100 text-blue-700 font-bold dark:bg-blue-900 dark:text-blue-300">
 {(item.student_name || item.nama || item.name || 'S')[0]}
 </AvatarFallback>
 </Avatar>
 <div>
 <div className="font-extrabold text-slate-900 dark:text-white">
 {item.student_name || item.nama || item.name || 'Siswa'}
 </div>
 <div className="text-xs font-medium text-slate-500">
 NISN: {item.nisn || '-'} | Kelas: {item.kelas || item.class_name || '-'}
 </div>
 </div>
 </div>
 </TableCell>
 <TableCell className="text-center font-bold text-emerald-600 dark:text-emerald-400">{hadir}</TableCell>
 <TableCell className="text-center font-bold text-blue-600 dark:text-blue-400">{sakit}</TableCell>
 <TableCell className="text-center font-bold text-amber-600 dark:text-amber-400">{izin}</TableCell>
 <TableCell className="text-center font-bold text-rose-600 dark:text-rose-400">{alpa}</TableCell>
 <TableCell className="text-center font-bold text-purple-600 dark:text-purple-400">{terlambat}</TableCell>
 <TableCell className="text-center">
 <div className="inline-flex items-center gap-2">
 <div className="h-2 w-20 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
 <div
 className={`h-full rounded-full ${
 percentage >= 90 ? 'bg-emerald-500' : percentage >= 75 ? 'bg-amber-500' : 'bg-rose-500'
 }`}
 style={{ width: `${Math.min(100, percentage)}%` }}
 />
 </div>
 <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{percentage}%</span>
 </div>
 </TableCell>
 </TableRow>
 )
 })}
 </TableBody>
 </TableRoot>
 )}

 {/* Tab 2: Sesi Pelajaran (Presensi Per Matpel & Guru) */}
 {activeTab === 'sesi-pelajaran' && (
 <TableRoot fullBleed={false}>
 <TableHeader>
 <TableRow className="bg-slate-50/80 border-b border-emerald-200/80 dark:bg-slate-900/80 dark:border-emerald-800/60">
 <TableHead className="w-12 text-center">#</TableHead>
 <TableHead>Mata Pelajaran</TableHead>
 <TableHead>Guru Pengajar</TableHead>
 <TableHead>Rombel / Kelas</TableHead>
 <TableHead className="text-center">Tanggal & Pertemuan</TableHead>
 <TableHead className="text-center">Ringkasan Kehadiran</TableHead>
 <TableHead className="text-center">Status Sesi</TableHead>
 <TableHead className="text-right w-24">Aksi</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {paginatedList.map((item, idx) => {
 const rowNum = (currentPage - 1) * perPage + idx + 1
 const subjectName = item.schedule?.subject?.name || item.subject_name || 'Mata Pelajaran'
 const teacherName = item.schedule?.employee?.nama_lengkap || item.teacher_name || '-'
 const className = item.schedule?.kelas?.nama_kelas || item.class_name || '-'
 const attendances = item.attendances || []
 const hadirCount = attendances.filter((a) => a.status === 'HADIR' || a.status_hadir === 'hadir').length
 const totalCount = attendances.length || 0

 return (
 <TableRow
 key={item.id || idx}
 onClick={() => {
 setSelectedItem(item)
 setSessionDetailModalOpen(true)
 }}
 className="cursor-pointer hover:scale-[1.001] transition-all hover:bg-slate-50/90 dark:hover:bg-slate-800/60"
 >
 <TableCell className="text-center font-medium text-slate-500">{rowNum}</TableCell>
 <TableCell>
 <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
 <BookOpen size={14} className="text-emerald-600" /> {subjectName}
 </div>
 <div className="text-xs font-medium text-slate-500">
 Kode: {item.schedule?.subject?.code || '-'}
 </div>
 </TableCell>
 <TableCell>
 <div className="font-semibold text-slate-800 dark:text-slate-200">{teacherName}</div>
 <div className="text-xs text-slate-500">NIP: {item.schedule?.employee?.nip || '-'}</div>
 </TableCell>
 <TableCell>
 <Badge color="cyan" size="sm">{className}</Badge>
 </TableCell>
 <TableCell className="text-center text-xs font-semibold text-slate-700 dark:text-slate-300">
 <div>{item.attendance_date || item.tanggal}</div>
 <div className="text-xs text-slate-400">Pertemuan Ke-{item.meeting_number || item.pertemuan_ke || 1}</div>
 </TableCell>
 <TableCell className="text-center">
 <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
 {hadirCount} / {totalCount} Siswa Hadir
 </span>
 </TableCell>
 <TableCell className="text-center">
 {getStatusBadge(item.status)}
 </TableCell>
 <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
 <div className="flex items-center justify-end">
 <div className="group relative inline-flex">
 <button
 type="button"
 title="Lihat Detail Absen Sesi"
 aria-label="Lihat Detail Absen Sesi"
 className="flex size-8 items-center justify-center rounded-lg bg-indigo-100/90 text-indigo-600 hover:text-white dark:bg-indigo-950/60 dark:text-indigo-300 dark: dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-sm cursor-pointer border border-emerald-600 h-9 px-4 text-sm font-medium"
 onClick={(e) => {
 e.stopPropagation()
 setSelectedItem(item)
 setSessionDetailModalOpen(true)
 }}
 >
 <BookOpen className="size-4 transition-colors" />
 </button>
 <div className="pointer-events-none absolute bottom-full right-0 mb-2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-[9999] whitespace-nowrap rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold shadow-2xl dark:bg-slate-100 dark:text-slate-900 border border-emerald-700/80/50 dark:border-emerald-300">
 <div className="absolute top-full right-3 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
 Lihat Detail Absen Sesi
 </div>
 </div>
 </div>
 </TableCell>
 </TableRow>
 )
 })}
 </TableBody>
 </TableRoot>
 )}

 {/* Tab 3: Verifikasi Izin / Sakit */}
 {activeTab === 'verifikasi' && (
 <TableRoot fullBleed={false}>
 <TableHeader>
 <TableRow className="bg-slate-50/80 border-b border-emerald-200/80 dark:bg-slate-900/80 dark:border-emerald-800/60">
 <TableHead className="w-12 text-center">#</TableHead>
 <TableHead>Siswa & Kelas</TableHead>
 <TableHead>Jenis Izin</TableHead>
 <TableHead>Tanggal Mulai - Selesai</TableHead>
 <TableHead>Alasan / Keterangan</TableHead>
 <TableHead className="text-center">Status Verifikasi</TableHead>
 <TableHead className="text-right w-24">Aksi</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {paginatedList.map((item, idx) => {
 const rowNum = (currentPage - 1) * perPage + idx + 1
 const studentName = item.student?.full_name || item.student_name || item.siswa_nama || 'Siswa'
 const className = item.student?.kelas?.nama_kelas || item.class_name || '-'

 return (
 <TableRow
 key={item.id || idx}
 onClick={() => handleOpenPermReview(item, 'approved')}
 className="cursor-pointer hover:scale-[1.001] transition-all hover:bg-slate-50/90 dark:hover:bg-slate-800/60"
 >
 <TableCell className="text-center font-medium text-slate-500">{rowNum}</TableCell>
 <TableCell>
 <div className="font-extrabold text-slate-900 dark:text-white">{studentName}</div>
 <div className="text-xs font-medium text-slate-500">Kelas: {className}</div>
 </TableCell>
 <TableCell>
 <Badge color={item.permission_type === 'sakit' ? 'blue' : 'cyan'} size="sm">
 {(item.permission_type || item.jenis || 'Izin').toUpperCase()}
 </Badge>
 </TableCell>
 <TableCell className="text-xs font-semibold text-slate-700 dark:text-slate-300">
 {item.start_date || item.tanggal} s/d {item.end_date || item.tanggal}
 </TableCell>
 <TableCell className="max-w-md truncate text-xs text-slate-600 dark:text-slate-400">
 {item.reason || item.alasan || '-'}
 </TableCell>
 <TableCell className="text-center">
 {getStatusBadge(item.status)}
 </TableCell>
 <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
 <div className="flex items-center justify-end gap-2">
 {/* Setujui Button */}
 <div className="group relative inline-flex">
 <button
 type="button"
 title="Setujui Izin"
 aria-label="Setujui Izin"
 className="flex size-8 items-center justify-center rounded-xl bg-emerald-100/90 text-emerald-600 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-sm cursor-pointer"
 onClick={(e) => {
 e.stopPropagation()
 handleOpenPermReview(item, 'approved')
 }}
 >
 <CheckCircle1 className="size-4 transition-colors" />
 </button>
 <div className="pointer-events-none absolute bottom-full right-0 mb-2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-[9999] whitespace-nowrap rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold shadow-2xl dark:bg-slate-100 dark:text-slate-900 border border-emerald-700/80/50 dark:border-emerald-300">
 <div className="absolute top-full right-3 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
 Setujui Izin
 </div>
 </div>

 {/* Tolak Button */}
 <div className="group relative inline-flex">
 <button
 type="button"
 title="Tolak Izin"
 aria-label="Tolak Izin"
 className="flex size-8 items-center justify-center rounded-xl bg-rose-100/90 text-rose-600 hover:bg-rose-600 hover:text-white dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-sm cursor-pointer"
 onClick={(e) => {
 e.stopPropagation()
 handleOpenPermReview(item, 'rejected')
 }}
 >
 <Xmark2x className="size-4 transition-colors" />
 </button>
 <div className="pointer-events-none absolute bottom-full right-0 mb-2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-[9999] whitespace-nowrap rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold shadow-2xl dark:bg-slate-100 dark:text-slate-900 border border-emerald-700/80/50 dark:border-emerald-300">
 <div className="absolute top-full right-3 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
 Tolak Izin
 </div>
 </div>
 </div>
 </TableCell>
 </TableRow>
 )
 })}
 </TableBody>
 </TableRoot>
 )}

 {/* Tab 4: Koreksi Presensi */}
 {activeTab === 'koreksi' && (
 <TableRoot fullBleed={false}>
 <TableHeader>
 <TableRow className="bg-slate-50/80 border-b border-emerald-200/80 dark:bg-slate-900/80 dark:border-emerald-800/60">
 <TableHead className="w-12 text-center">#</TableHead>
 <TableHead>Siswa</TableHead>
 <TableHead>Mata Pelajaran & Tanggal</TableHead>
 <TableHead>Status Awal</TableHead>
 <TableHead>Usulan Koreksi</TableHead>
 <TableHead>Alasan Koreksi</TableHead>
 <TableHead className="text-center">Status Koreksi</TableHead>
 <TableHead className="text-right w-24">Aksi</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {paginatedList.map((item, idx) => {
 const rowNum = (currentPage - 1) * perPage + idx + 1
 const studentName = item.student?.full_name || item.student_name || item.siswa_nama || 'Siswa'

 return (
 <TableRow
 key={item.id || idx}
 onClick={() => handleOpenCorrReview(item, 'approved')}
 className="cursor-pointer hover:scale-[1.001] transition-all hover:bg-slate-50/90 dark:hover:bg-slate-800/60"
 >
 <TableCell className="text-center font-medium text-white">{rowNum}</TableCell>
 <TableCell>
 <div className="font-extrabold text-slate-900 dark:text-white">{studentName}</div>
 <div className="text-xs font-medium text-slate-500">Guru: {item.requested_by_name || '-'}</div>
 </TableCell>
 <TableCell className="text-xs font-semibold text-slate-700 dark:text-slate-300">
 <div>{item.subject || item.nama_matpel || 'Pelajaran'}</div>
 <div className="text-xs text-slate-400">{item.attendance_date || item.tanggal}</div>
 </TableCell>
 <TableCell>
 <Badge color="gray" size="sm">{item.original_status || 'ALPHA'}</Badge>
 </TableCell>
 <TableCell>
 <Badge color="success" size="sm">{item.requested_status || 'HADIR'}</Badge>
 </TableCell>
 <TableCell className="max-w-md truncate text-xs text-slate-600 dark:text-slate-400">
 {item.reason || item.alasan || '-'}
 </TableCell>
 <TableCell className="text-center">
 {getStatusBadge(item.status)}
 </TableCell>
 <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
 <div className="flex items-center justify-end gap-2">
 {/* Setujui Koreksi Button */}
 <div className="group relative inline-flex">
 <button
 type="button"
 title="Setujui Koreksi"
 aria-label="Setujui Koreksi"
 className="flex size-8 items-center justify-center rounded-xl bg-emerald-100/90 text-emerald-600 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-sm cursor-pointer"
 onClick={(e) => {
 e.stopPropagation()
 handleOpenCorrReview(item, 'approved')
 }}
 >
 <CheckCircle1 className="size-4 transition-colors" />
 </button>
 <div className="pointer-events-none absolute bottom-full right-0 mb-2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-[9999] whitespace-nowrap rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold shadow-2xl dark:bg-slate-100 dark:text-slate-900 border border-emerald-700/80/50 dark:border-emerald-300">
 <div className="absolute top-full right-3 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
 Setujui Koreksi
 </div>
 </div>

 {/* Tolak Koreksi Button */}
 <div className="group relative inline-flex">
 <button
 type="button"
 title="Tolak Koreksi"
 aria-label="Tolak Koreksi"
 className="flex size-8 items-center justify-center rounded-xl bg-rose-100/90 text-rose-600 hover:bg-rose-600 hover:text-white dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-sm cursor-pointer"
 onClick={(e) => {
 e.stopPropagation()
 handleOpenCorrReview(item, 'rejected')
 }}
 >
 <Xmark2x className="size-4 transition-colors" />
 </button>
 <div className="pointer-events-none absolute bottom-full right-0 mb-2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-[9999] whitespace-nowrap rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold shadow-2xl dark:bg-slate-100 dark:text-slate-900 border border-emerald-700/80/50 dark:border-emerald-300">
 <div className="absolute top-full right-3 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
 Tolak Koreksi
 </div>
 </div>
 </div>
 </TableCell>
 </TableRow>
 )
 })}
 </TableBody>
 </TableRoot>
 )}

 {/* Tab 5: Tindak Lanjut Siswa */}
 {activeTab === 'tindak-lanjut' && (
 <TableRoot fullBleed={false}>
 <TableHeader>
 <TableRow className="bg-slate-50/80 border-b border-emerald-200/80 dark:bg-slate-900/80 dark:border-emerald-800/60">
 <TableHead className="w-12 text-center">#</TableHead>
 <TableHead>Siswa & Rombel</TableHead>
 <TableHead>Bentuk Tindak Lanjut</TableHead>
 <TableHead>Tanggal Penanganan</TableHead>
 <TableHead>Catatan / Rekomendasi</TableHead>
 <TableHead className="text-center">Status Penanganan</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {paginatedList.map((item, idx) => {
 const rowNum = (currentPage - 1) * perPage + idx + 1
 const studentName = item.student?.full_name || item.student_name || item.siswa_nama || 'Siswa'
 const className = item.student?.kelas?.nama_kelas || item.class_name || '-'

 return (
 <TableRow key={item.id || idx} className="hover:scale-[1.001] transition-all hover:bg-slate-50/90 dark:hover:bg-slate-800/60">
 <TableCell className="text-center font-medium text-white">{rowNum}</TableCell>
 <TableCell>
 <div className="font-extrabold text-slate-900 dark:text-white">{studentName}</div>
 <div className="text-xs font-medium text-slate-500">Kelas: {className}</div>
 </TableCell>
 <TableCell>
 <Badge color="purple" size="sm">
 {(item.action_taken || item.action_type || 'Panggilan Ortu').replace(/_/g, ' ').toUpperCase()}
 </Badge>
 </TableCell>
 <TableCell className="text-xs font-semibold text-slate-700 dark:text-slate-300">
 {item.follow_up_date || item.tanggal || '-'}
 </TableCell>
 <TableCell className="max-w-md truncate text-xs text-slate-600 dark:text-slate-400">
 {item.notes || item.catatan || '-'}
 </TableCell>
 <TableCell className="text-center">
 {getStatusBadge(item.status)}
 </TableCell>
 </TableRow>
 )
 })}
 </TableBody>
 </TableRoot>
 )}
 </div>
 )}

 {/* Footer Pagination */}
 <div className="w-full border-t border-emerald-200/80 px-4 py-3.5 sm:px-6 md:px-8 dark:border-emerald-800/60">
 <Pagination
 currentPage={currentPage}
 totalPages={totalPages}
 onPageChange={(page) => setCurrentPage(page)}
 sideLayout="full"
 variant="default"
 />
 </div>
 </motion.div>

 {/* ── HeroUI Dialog Modals ──────────────────────────────────────────── */}

 {/* Modal 1: Detail Sesi Absensi Pelajaran */}
 <Backdrop isOpen={sessionDetailModalOpen} onOpenChange={setSessionDetailModalOpen}>
 <Dialog isOpen={sessionDetailModalOpen} onOpenChange={setSessionDetailModalOpen} className="max-w-xl">
 <DialogHeader>
 <DialogTitle className="flex items-center gap-2">
 <BookOpen className="text-emerald-600" size={18} /> Detail Presensi Sesi Pelajaran
 </DialogTitle>
 <DialogDescription>
 Mata Pelajaran: <strong>{selectedItem?.schedule?.subject?.name || selectedItem?.subject_name}</strong> | Guru: <strong>{selectedItem?.schedule?.employee?.nama_lengkap || selectedItem?.teacher_name}</strong>
 </DialogDescription>
 </DialogHeader>

 <DialogBody className="space-y-4">
 <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl dark:bg-slate-900/60">
 <div>
 <span className="text-slate-500 font-medium">Tanggal Sesi:</span>
 <div className="font-bold text-slate-800 dark:text-slate-200">{selectedItem?.attendance_date || selectedItem?.tanggal}</div>
 </div>
 <div>
 <span className="text-slate-500 font-medium">Rombel:</span>
 <div className="font-bold text-slate-800 dark:text-slate-200">{selectedItem?.schedule?.kelas?.nama_kelas || selectedItem?.class_name}</div>
 </div>
 </div>

 <div className="max-h-60 overflow-y-auto space-y-1.5 divide-y divide-emerald-100/80 dark:divide-emerald-900/40 pr-1">
 <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Daftar Kehadiran Siswa Sesi Ini:</h4>
 {(selectedItem?.attendances || []).map((att, i) => (
 <div key={att.id || i} className="flex items-center justify-between pt-2">
 <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
 {att.siswa?.nama_lengkap || att.student_name || `Siswa #${i+1}`}
 </div>
 <Badge color={att.status === 'HADIR' || att.status_hadir === 'hadir' ? 'success' : 'warning'} size="sm">
 {att.status || att.status_hadir || 'HADIR'}
 </Badge>
 </div>
 ))}
 </div>
 </DialogBody>

 <DialogFooter className="flex items-center justify-end gap-2">
 <div className="group relative inline-flex">
 <DialogClose asChild>
 <Button variant="ghost" appearance="outline" size="sm" iconOnly className="rounded-xl" aria-label="Tutup">
 <Xmark2x className="size-5 transition-colors" />
 </Button>
 </DialogClose>
 <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
 Tutup
 </div>
 </div>
 </DialogFooter>
 </Dialog>
 </Backdrop>

 {/* Modal 2: Verifikasi Izin / Sakit */}
 <Backdrop isOpen={permReviewModalOpen} onOpenChange={setPermReviewModalOpen}>
 <Dialog isOpen={permReviewModalOpen} onOpenChange={setPermReviewModalOpen} className="max-w-md">
 <DialogHeader>
 <DialogTitle>
 {reviewAction === 'approved' ? 'Setujui Pengajuan Izin' : 'Tolak Pengajuan Izin'}
 </DialogTitle>
 <DialogDescription>
 Konfirmasi status pengajuan izin/sakit siswa <strong>{selectedItem?.student?.full_name || selectedItem?.student_name}</strong>.
 </DialogDescription>
 </DialogHeader>

 <DialogBody className="space-y-4">
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
 Catatan Verifikasi (Opsional)
 </label>
 <textarea
 rows={3}
 placeholder="Tuliskan alasan persetujuan atau penolakan..."
 value={reviewNote}
 onChange={(e) => setReviewNote(e.target.value)}
 className="w-full rounded-2xl border border-emerald-300 bg-white p-3 text-xs text-slate-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-emerald-700/80 dark:bg-slate-900 dark:text-white"
 />
 </div>
 </DialogBody>

 <DialogFooter className="flex items-center justify-end gap-2">
 <div className="group relative inline-flex">
 <DialogClose asChild>
 <Button variant="ghost" appearance="outline" size="sm" iconOnly className="rounded-xl" disabled={busy} aria-label="Batal">
 <Xmark2x className="size-5 transition-colors" />
 </Button>
 </DialogClose>
 <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
 Batal
 </div>
 </div>

 <div className="group relative inline-flex">
 <Button
 variant={reviewAction === 'approved' ? 'success' : 'danger'}
 appearance="fill"
 size="sm"
 iconOnly
 className="rounded-xl"
 pending={busy}
 onClick={handleConfirmPermReview}
 aria-label={reviewAction === 'approved' ? 'Setujui Izin' : 'Tolak Izin'}
 >
 {reviewAction === 'approved' ? <CheckCircle1 className="size-5 transition-colors" /> : <Xmark2x className="size-5 transition-colors" />}
 </Button>
 <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
 {reviewAction === 'approved' ? 'Setujui Izin' : 'Tolak Izin'}
 </div>
 </div>
 </DialogFooter>
 </Dialog>
 </Backdrop>

 {/* Modal 3: Koreksi Presensi */}
 <Backdrop isOpen={corrReviewModalOpen} onOpenChange={setCorrReviewModalOpen}>
 <Dialog isOpen={corrReviewModalOpen} onOpenChange={setCorrReviewModalOpen} className="max-w-md">
 <DialogHeader>
 <DialogTitle>
 {reviewAction === 'approved' ? 'Setujui Koreksi Presensi' : 'Tolak Koreksi Presensi'}
 </DialogTitle>
 <DialogDescription>
 Konfirmasi perubahan presensi siswa <strong>{selectedItem?.student?.full_name || selectedItem?.student_name}</strong>.
 </DialogDescription>
 </DialogHeader>

 <DialogBody className="space-y-4">
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
 Catatan Persetujuan / Penolakan
 </label>
 <textarea
 rows={3}
 placeholder="Tuliskan catatan verifikasi..."
 value={reviewNote}
 onChange={(e) => setReviewNote(e.target.value)}
 className="w-full rounded-2xl border border-emerald-300 bg-white p-3 text-xs text-slate-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-emerald-700/80 dark:bg-slate-900 dark:text-white"
 />
 </div>
 </DialogBody>

 <DialogFooter className="flex items-center justify-end gap-2">
 <div className="group relative inline-flex">
 <DialogClose asChild>
 <Button variant="ghost" appearance="outline" size="sm" iconOnly className="rounded-xl" disabled={busy} aria-label="Batal">
 <Xmark2x className="size-5 transition-colors" />
 </Button>
 </DialogClose>
 <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
 Batal
 </div>
 </div>

 <div className="group relative inline-flex">
 <Button
 variant={reviewAction === 'approved' ? 'success' : 'danger'}
 appearance="fill"
 size="sm"
 iconOnly
 className="rounded-xl"
 pending={busy}
 onClick={handleConfirmCorrReview}
 aria-label={reviewAction === 'approved' ? 'Setujui Koreksi' : 'Tolak Koreksi'}
 >
 {reviewAction === 'approved' ? <CheckCircle1 className="size-5 transition-colors" /> : <Xmark2x className="size-5 transition-colors" />}
 </Button>
 <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
 {reviewAction === 'approved' ? 'Setujui Koreksi' : 'Tolak Koreksi'}
 </div>
 </div>
 </DialogFooter>
 </Dialog>
 </Backdrop>

 {/* Modal 4: Tambah Catatan Tindak Lanjut Siswa */}
 <Backdrop isOpen={followUpCreateModalOpen} onOpenChange={setFollowUpCreateModalOpen}>
 <Dialog isOpen={followUpCreateModalOpen} onOpenChange={setFollowUpCreateModalOpen} className="max-w-xl">
 <form onSubmit={handleCreateFollowUp}>
 <DialogHeader>
 <DialogTitle>Tambah Catatan Tindak Lanjut Siswa</DialogTitle>
 <DialogDescription>
 Buat tindakan penanganan (Panggilan Orang Tua, Konseling BK, atau Surat Peringatan) bagi siswa.
 </DialogDescription>
 </DialogHeader>

 <DialogBody className="space-y-4">
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
 Pilih Siswa <span className="text-rose-500">*</span>
 </label>
 <CustomSelect
 required
 value={followUpForm.student_id}
 onChange={(e) => setFollowUpForm({ ...followUpForm, student_id: e.target.value })}
 className="w-full rounded-2xl border border-emerald-300 bg-white p-2.5 text-xs text-slate-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-emerald-700/80 dark:bg-slate-900 dark:text-white"
 >
 <option value="">-- Pilih Siswa --</option>
 {studentOptions.map((s) => (
 <option key={s.id} value={s.id}>
 {s.nama_lengkap || s.full_name} ({s.nisn || s.nis || 'NISN'}) - {s.kelas?.nama_kelas || 'Rombel'}
 </option>
 ))}
 </CustomSelect>
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
 Bentuk Tindakan / Penanganan <span className="text-rose-500">*</span>
 </label>
 <CustomSelect
 value={followUpForm.action_type}
 onChange={(e) => setFollowUpForm({ ...followUpForm, action_type: e.target.value })}
 className="w-full rounded-2xl border border-emerald-300 bg-white p-2.5 text-xs text-slate-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-emerald-700/80 dark:bg-slate-900 dark:text-white"
 >
 <option value="panggilan_orang_tua">Panggilan Orang Tua / Wali</option>
 <option value="konseling_bk">Konseling Bimbingan Konseling (BK)</option>
 <option value="surat_peringatan">Surat Peringatan (SP)</option>
 <option value="home_visit">Kunjungan Rumah (Home Visit)</option>
 <option value="pembinaan_khusus">Pembinaan Khusus Rombel</option>
 </CustomSelect>
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
 Tanggal Pelaksanaan <span className="text-rose-500">*</span>
 </label>
 <DatePicker
 required
 value={followUpForm.follow_up_date}
 onChange={(e) => setFollowUpForm({ ...followUpForm, follow_up_date: e.target.value })}
 inputClassName="p-2.5 text-xs"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
 Catatan & Rekomendasi Penanganan
 </label>
 <textarea
 rows={3}
 placeholder="Detail hasil penanganan atau kesepakatan dengan orang tua..."
 value={followUpForm.notes}
 onChange={(e) => setFollowUpForm({ ...followUpForm, notes: e.target.value })}
 className="w-full rounded-2xl border border-emerald-300 bg-white p-3 text-xs text-slate-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-emerald-700/80 dark:bg-slate-900 dark:text-white"
 />
 </div>
 </DialogBody>

 <DialogFooter className="flex items-center justify-end gap-2">
 <div className="group relative inline-flex">
 <DialogClose asChild>
 <Button variant="ghost" appearance="outline" size="sm" iconOnly className="rounded-xl" disabled={busy} aria-label="Batal">
 <Xmark2x className="size-5 transition-colors" />
 </Button>
 </DialogClose>
 <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
 Batal
 </div>
 </div>

 <div className="group relative inline-flex">
 <Button variant="primary" appearance="fill" size="sm" iconOnly className="rounded-xl" pending={busy} type="submit" aria-label="Simpan Catatan">
 <CheckCircle1 className="size-5 transition-colors" />
 </Button>
 <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
 Simpan Catatan
 </div>
 </div>
 </DialogFooter>
 </form>
 </Dialog>
 </Backdrop>

 {/* Modal 5: HeroUI Opsi Cetak & Unduh PDF / Clean Print */}
 <PrintOptionModal
 isOpen={printOptionModalOpen}
 onClose={() => setPrintOptionModalOpen(false)}
 onPrint={handlePrintClean}
 onDownload={handleDownloadPdfTable}
 title="Data Presensi Siswa"
 />
 </motion.div>
 )
}
