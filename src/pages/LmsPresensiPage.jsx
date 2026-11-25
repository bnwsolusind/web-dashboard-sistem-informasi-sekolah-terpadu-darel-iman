import { HeroUiHeader } from "../components/ui/HeroUiHeader"
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
 CalendarCheck,
 CheckCircle2,
 XCircle,
 AlertCircle,
 Clock,
 UserCheck,
 Search,
 Plus,
 Edit3,
 Trash2,
 RefreshCw,
 X,
 ChevronLeft,
 ChevronRight,
 BookOpen,
 Save,
 Users,
 Eye,
 Award,
 Sparkles,
 RotateCcw,
 Printer,
 Download,
} from 'lucide-react'
import Swal from '@/components/ui/compat/swal-heroui'
import AppTabs from '../components/app/AppTabs'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import HeroUiFilterSelect from '../components/ui/HeroUiFilterSelect'
import { useDebounce } from '../hooks/useDebounce'
import { DatePicker } from '@/components/ui/date-picker'
import {
 TableRoot,
 TableHeader,
 TableHead,
 TableBody,
 TableRow,
 TableCell,
} from '@/components/ui/table'
import { SquircleActionButton, PrintOptionModal } from '../components/master-data'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import { lmsPresensiService } from '../services/lmsPresensiService'
import AppModal from '../components/app/AppModal'

// ── PALET WARNA RESMI MODERN KPI CARDS ──
const MODERN_CARD_TONES = {
 emerald: {
 card: 'border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
 glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
 iconBox: 'bg-slate-100 border border-emerald-200/70 text-slate-700 shadow-xs dark:bg-slate-800 dark:border-emerald-700/80 dark:text-slate-300',
 tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
 title: 'text-emerald-700 dark:text-emerald-400',
 val: 'text-emerald-700 dark:text-emerald-300',
 sub: 'text-emerald-600/80 dark:text-emerald-400/80',
 },
 blue: {
 card: 'border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] hover:border-blue-400 dark:border-blue-700/50 dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-slate-900',
 glow: 'bg-blue-400/20 group-hover:bg-blue-400/30',
 iconBox: 'bg-slate-100 border border-emerald-200/70 text-slate-700 dark:bg-slate-800 dark:border-emerald-700/80 dark:text-slate-300 shadow-sm',
 tag: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
 title: 'text-blue-700 dark:text-blue-400',
 val: 'text-blue-700 dark:text-blue-300',
 sub: 'text-sky-600/80 dark:text-sky-400/80',
 },
 purple: {
 card: 'border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] hover:border-purple-400 dark:border-purple-700/50 dark:from-purple-950/40 dark:via-fuchsia-950/20 dark:to-slate-900',
 glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
 iconBox: 'bg-white dark:bg-[#1B2433] shadow-sm',
 tag: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
 title: 'text-purple-700 dark:text-purple-400',
 val: 'text-purple-700 dark:text-purple-300',
 sub: 'text-purple-600/80 dark:text-purple-400/80',
 },
 rose: {
 card: 'border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] hover:border-rose-400 dark:border-rose-700/50 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-slate-900',
 glow: 'bg-rose-400/20 group-hover:bg-rose-400/30',
 iconBox: 'bg-white dark:bg-[#1B2433] shadow-sm',
 tag: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
 title: 'text-rose-700 dark:text-rose-400',
 val: 'text-rose-700 dark:text-rose-300',
 sub: 'text-rose-600/80 dark:text-rose-400/80',
 },
 amber: {
 card: 'border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
 glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
 iconBox: 'bg-white dark:bg-[#1B2433] shadow-sm',
 tag: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
 title: 'text-amber-700 dark:text-amber-400',
 val: 'text-amber-700 dark:text-amber-300',
 sub: 'text-amber-600/80 dark:text-amber-400/80',
 },
}

function ModernKpiCard({ icon: Icon, label, subtext, value, tag, tone = 'emerald', onClick }) {
 const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
 const isClickable = typeof onClick === 'function'

 return (
 <motion.div
 whileHover={{ scale: 1.02, y: -2 }}
 whileTap={{ scale: 0.98 }}
 transition={{ type: 'spring', stiffness: 400, damping: 25 }}
 onClick={onClick}
 role={isClickable ? 'button' : undefined}
 tabIndex={isClickable ? 0 : undefined}
 className={`group relative overflow-hidden rounded-2xl border-2 p-4 sm:p-5 shadow-xs transition-[border-color,box-shadow] duration-150 text-left ${
 isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
 } ${t.card}`}
 >
 <div className="flex items-center justify-between mb-3">
 <div className="flex items-center gap-2.5">
 <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-emerald-600 shadow-sm ${t.iconBox}`}>
 <Icon className="h-4.5 w-4.5" />
 </div>
 <div>
 <p className={`text-xs font-bold ${t.title}`}>{label}</p>
 {tag && (
 <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-extrabold ${t.tag}`}>
 {tag}
 </span>
 )}
 </div>
 </div>
 </div>
 <p className={`text-2xl font-black tabular-nums tracking-tight ${t.val}`}>{value ?? 0}</p>
 {subtext && (
 <p className={`mt-1.5 text-xs font-semibold ${t.sub} truncate`}>
 {subtext}
 </p>
 )}
 </motion.div>
 )
}

export default function LmsPresensiPage() {
 const [activeTab, setActiveTab] = useState('list') // 'list' | 'bulk'
 const [loading, setLoading] = useState(false)
 const [saving, setSaving] = useState(false)
 const [dataPresensi, setDataPresensi] = useState([])
 const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
 const [pagination, setPagination] = useState({
 current_page: 1,
 last_page: 1,
 per_page: 15,
 total: 0,
 })

 const [options, setOptions] = useState({
 schedules: [],
 students: [],
 statuses: [
 { value: 'hadir', label: 'Hadir', color: 'emerald' },
 { value: 'izin', label: 'Izin', color: 'indigo' },
 { value: 'sakit', label: 'Sakit', color: 'sky' },
 { value: 'alpa', label: 'Alpa', color: 'rose' },
 { value: 'terlambat', label: 'Terlambat', color: 'amber' },
 ],
 })

 const [stats, setStats] = useState({
 total: 0,
 hadir: 0,
 izin: 0,
 sakit: 0,
 alpa: 0,
 terlambat: 0,
 persentase_hadir: 0,
 })

 // Filter state for list view
 const [filters, setFilters] = useState({
 search: '',
 jadwal_pelajaran_id: '',
 status_hadir: '',
 tanggal: '',
 })

 // Debounced search for API prevention
 const debouncedSearch = useDebounce(filters.search, 350)

 // Bulk input mode state
 const [bulkState, setBulkState] = useState({
 jadwal_pelajaran_id: '',
 tanggal: new Date().toISOString().split('T')[0],
 pertemuan_ke: 1,
 students: [],
 })

 // Single Modal State (Create / Edit)
 const [modalOpen, setModalOpen] = useState(false)
 const [modalType, setModalType] = useState('create') // 'create' | 'edit'
 const [formData, setFormData] = useState({
 id: null,
 jadwal_pelajaran_id: '',
 siswa_id: '',
 tanggal: new Date().toISOString().split('T')[0],
 status_hadir: 'hadir',
 keterangan: '',
 pertemuan_ke: 1,
 })

 // Detail Drawer state
 const [detailItem, setDetailItem] = useState(null)

 // Fetch Options & Stats
 const loadInitialOptions = async () => {
 try {
 const resOptions = await lmsPresensiService.getOptions()
 const dataPayload = resOptions?.data?.data || resOptions?.data || resOptions || {}
 setOptions((prev) => ({
 ...prev,
 schedules: Array.isArray(dataPayload.schedules) ? dataPayload.schedules : [],
 students: Array.isArray(dataPayload.students) ? dataPayload.students : [],
 statuses: Array.isArray(dataPayload.statuses) && dataPayload.statuses.length > 0
 ? dataPayload.statuses
 : prev.statuses,
 }))
 } catch (err) {
 console.error('Gagal memuat opsi:', err)
 }
 }

 const loadStats = async () => {
 try {
 const resStats = await lmsPresensiService.getStats({
 jadwal_pelajaran_id: filters.jadwal_pelajaran_id,
 tanggal: filters.tanggal,
 })
 if (resStats.success) {
 setStats(resStats.data)
 }
 } catch (err) {
 console.error('Gagal memuat statistik:', err)
 }
 }

 // Fetch Paginated List
 const fetchPresensiList = async (page = 1) => {
 setLoading(true)
 try {
 const params = {
 page,
 per_page: pagination.per_page,
 search: debouncedSearch,
 jadwal_pelajaran_id: filters.jadwal_pelajaran_id,
 status_hadir: filters.status_hadir,
 tanggal: filters.tanggal,
 }
 const response = await lmsPresensiService.getDaftar(params)
 setDataPresensi(response.data || [])
 setPagination({
 current_page: response.meta?.current_page || 1,
 last_page: response.meta?.last_page || 1,
 per_page: response.meta?.per_page || 15,
 total: response.meta?.total || 0,
 })
 } catch (err) {
 console.error('Gagal memuat data presensi:', err)
 Swal.fire({
 icon: 'error',
 title: 'Gagal Memuat Data',
 text: 'Terjadi kesalahan saat mengunduh data presensi pembelajaran.',
 confirmColor: '#0E5C44',
 })
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 loadInitialOptions()
 }, [])

 useEffect(() => {
 if (activeTab === 'list') {
 fetchPresensiList(1)
 loadStats()
 }
 }, [debouncedSearch, filters.jadwal_pelajaran_id, filters.status_hadir, filters.tanggal, activeTab])

 // Bulk mode: populate student list when schedule is selected
 useEffect(() => {
 if (!bulkState.jadwal_pelajaran_id) {
 setBulkState((prev) => ({ ...prev, students: [] }))
 return
 }

 const selectedSchedule = options.schedules.find(
 (s) => s.id === bulkState.jadwal_pelajaran_id
 )

 // Filter students by class_id of schedule if available, else show all active students
 let classStudents = options.students
 if (selectedSchedule?.kelas_id || selectedSchedule?.class_id) {
 const classId = selectedSchedule.kelas_id || selectedSchedule.class_id
 classStudents = options.students.filter(
 (st) => st.class_id === classId || !st.class_id
 )
 if (classStudents.length === 0) classStudents = options.students
 }

 const studentPresensiList = classStudents.map((st) => ({
 siswa_id: st.id,
 full_name: st.full_name,
 nis: st.nis,
 nisn: st.nisn,
 status_hadir: 'hadir',
 keterangan: '',
 }))

 setBulkState((prev) => ({
 ...prev,
 students: studentPresensiList,
 }))
 }, [bulkState.jadwal_pelajaran_id, options.schedules, options.students])

 // Bulk Actions
 const handleSetAllStatus = (status) => {
 setBulkState((prev) => ({
 ...prev,
 students: prev.students.map((st) => ({
 ...st,
 status_hadir: status,
 })),
 }))
 }

 const handleUpdateStudentStatus = (siswaId, status) => {
 setBulkState((prev) => ({
 ...prev,
 students: prev.students.map((st) =>
 st.siswa_id === siswaId ? { ...st, status_hadir: status } : st
 ),
 }))
 }

 const handleUpdateStudentKeterangan = (siswaId, keterangan) => {
 setBulkState((prev) => ({
 ...prev,
 students: prev.students.map((st) =>
 st.siswa_id === siswaId ? { ...st, keterangan } : st
 ),
 }))
 }

 const handleSaveBulk = async () => {
 if (!bulkState.jadwal_pelajaran_id) {
 Swal.fire({
 icon: 'warning',
 title: 'Pilih Jadwal',
 text: 'Silakan pilih jadwal pelajaran terlebih dahulu.',
 confirmColor: '#0E5C44',
 })
 return
 }

 if (!bulkState.tanggal) {
 Swal.fire({
 icon: 'warning',
 title: 'Pilih Tanggal',
 text: 'Silakan tentukan tanggal presensi.',
 confirmColor: '#0E5C44',
 })
 return
 }

 if (bulkState.students.length === 0) {
 Swal.fire({
 icon: 'warning',
 title: 'Tidak Ada Siswa',
 text: 'Tidak ada daftar siswa untuk jadwal ini.',
 confirmColor: '#0E5C44',
 })
 return
 }

 setSaving(true)
 try {
 const payload = {
 jadwal_pelajaran_id: bulkState.jadwal_pelajaran_id,
 tanggal: bulkState.tanggal,
 pertemuan_ke: parseInt(bulkState.pertemuan_ke) || 1,
 items: bulkState.students.map((s) => ({
 siswa_id: s.siswa_id,
 status_hadir: s.status_hadir,
 keterangan: s.keterangan || null,
 })),
 }

 const res = await lmsPresensiService.createBulk(payload)
 if (res.success) {
 Swal.fire({
 icon: 'success',
 title: 'Presensi Tersimpan!',
 text: res.message || 'Presensi siswa berhasil dicatat.',
 confirmColor: '#0E5C44',
 })
 setActiveTab('list')
 }
 } catch (err) {
 console.error('Gagal menyimpan presensi bulk:', err)
 Swal.fire({
 icon: 'error',
 title: 'Gagal Menyimpan',
 text: err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data presensi.',
 confirmColor: '#0E5C44',
 })
 } finally {
 setSaving(false)
 }
 }

 // Single Modal Actions
 const handleOpenCreateModal = () => {
 setModalType('create')
 setFormData({
 id: null,
 jadwal_pelajaran_id: options.schedules[0]?.id || '',
 siswa_id: options.students[0]?.id || '',
 tanggal: new Date().toISOString().split('T')[0],
 status_hadir: 'hadir',
 keterangan: '',
 pertemuan_ke: 1,
 })
 setModalOpen(true)
 }

 const handleOpenEditModal = (item) => {
 setModalType('edit')
 setFormData({
 id: item.id,
 jadwal_pelajaran_id: item.jadwal_pelajaran_id,
 siswa_id: item.siswa_id,
 tanggal: item.tanggal,
 status_hadir: item.status_hadir,
 keterangan: item.keterangan || '',
 pertemuan_ke: item.pertemuan_ke || 1,
 })
 setModalOpen(true)
 }

 const handleSubmitSingleModal = async (e) => {
 e.preventDefault()
 setSaving(true)
 try {
 if (modalType === 'create') {
 const res = await lmsPresensiService.create(formData)
 if (res.success) {
 Swal.fire({
 icon: 'success',
 title: 'Presensi Ditambahkan!',
 text: 'Data presensi berhasil disimpan.',
 confirmColor: '#0E5C44',
 })
 setModalOpen(false)
 fetchPresensiList(pagination.current_page)
 loadStats()
 }
 } else {
 const res = await lmsPresensiService.update(formData.id, formData)
 if (res.success) {
 Swal.fire({
 icon: 'success',
 title: 'Presensi Diperbarui!',
 text: 'Data presensi berhasil diperbarui.',
 confirmColor: '#0E5C44',
 })
 setModalOpen(false)
 fetchPresensiList(pagination.current_page)
 loadStats()
 }
 }
 } catch (err) {
 console.error('Gagal menyimpan single presensi:', err)
 Swal.fire({
 icon: 'error',
 title: 'Gagal Menyimpan',
 text: err.response?.data?.message || 'Gagal menyimpan data presensi.',
 confirmColor: '#0E5C44',
 })
 } finally {
 setSaving(false)
 }
 }

 const handleDelete = async (item) => {
 const confirm = await Swal.fire({
 title: 'Hapus Data Presensi?',
 text: `Presensi ${item.siswa?.full_name || 'siswa'} pada tanggal ${item.tanggal} akan dihapus.`,
 icon: 'warning',
 showCancelButton: true,
 confirmButtonText: 'Ya, Hapus!',
 cancelButtonText: 'Batal',
 confirmColor: '#e11d48',
 cancelColor: '#64748b',
 })

 if (confirm.isConfirmed) {
 try {
 const res = await lmsPresensiService.delete(item.id)
 if (res.success) {
 Swal.fire({
 icon: 'success',
 title: 'Berhasil Dihapus!',
 text: 'Data presensi berhasil dihapus.',
 confirmColor: '#0E5C44',
 })
 fetchPresensiList(pagination.current_page)
 loadStats()
 }
 } catch (err) {
 console.error('Gagal menghapus presensi:', err)
 Swal.fire({
 icon: 'error',
 title: 'Gagal Hapus',
 text: 'Terjadi kesalahan saat menghapus data.',
 confirmColor: '#0E5C44',
 })
 }
 }
 }

 const resetFilters = () => {
 setFilters({
 search: '',
 jadwal_pelajaran_id: '',
 status_hadir: '',
 tanggal: '',
 })
 }

 const hasActiveFilter = Boolean(
 filters.search || filters.jadwal_pelajaran_id || filters.status_hadir || filters.tanggal
 )

 // Render Status Badge Component
 const renderBadge = (status, label) => {
 switch (status?.toLowerCase()) {
 case 'hadir':
 return (
 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
 <CheckCircle2 className="w-3.5 h-3.5" />
 {label || 'Hadir'}
 </span>
 )
 case 'izin':
 return (
 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
 <Clock className="w-3.5 h-3.5" />
 {label || 'Izin'}
 </span>
 )
 case 'sakit':
 return (
 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
 <AlertCircle className="w-3.5 h-3.5" />
 {label || 'Sakit'}
 </span>
 )
 case 'alpa':
 return (
 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
 <XCircle className="w-3.5 h-3.5" />
 {label || 'Alpa'}
 </span>
 )
 case 'terlambat':
 return (
 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
 <Clock className="w-3.5 h-3.5" />
 {label || 'Terlambat'}
 </span>
 )
 default:
 return (
 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-emerald-950/60 dark:text-emerald-300">
 {label || status || 'N/A'}
 </span>
 )
 }
 }

 const dropdownCls =
 'h-9 rounded-xl border border-emerald-200/80 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#0E5C44] focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-emerald-800/70 dark:bg-slate-900 dark:text-slate-200'

 return (
 <PageContainer maxW="7xl">
 <div className="space-y-6 pb-12">
 {/* ── Breadcrumb Navigation ── */}
 <AppBreadcrumb
 items={[
 { label: 'LMS & Akademik', href: '/dashboard' },
 { label: 'Presensi Pembelajaran' },
 ]}
 />

 {/* ── Modern Hero Card ── */}
      <HeroUiHeader
        title="Presensi Pembelajaran"
        subtitle="Pencatatan dan pemantauan kehadiran siswa terintegrasi secara langsung dengan Jadwal Pelajaran dan Rapor Digital."
        badge="Modul LMS Terpadu"
        icon={CalendarCheck}
        className="mb-4"
      />
      <div className="flex justify-end mb-4">
        <AppTabs
 tabs={[
 { id: 'list', label: 'Rekap Log Presensi', icon: CalendarCheck },
 { id: 'bulk', label: 'Input Per Jadwal', icon: Users },
 ]}
 activeTab={activeTab}
 onChange={setActiveTab}
 ariaLabel="Navigasi Presensi Pembelajaran"
 />
      </div>

 {/* ── Modern KPI Cards ── */}
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
 <ModernKpiCard
 icon={UserCheck}
 label="Total Log"
 subtext="Catatan terdata"
 value={stats.total}
 tone="emerald"
 />
 <ModernKpiCard
 icon={CheckCircle2}
 label="Hadir"
 subtext="Tepat waktu"
 value={stats.hadir}
 tag="Hadir"
 tone="emerald"
 />
 <ModernKpiCard
 icon={Clock}
 label="Izin"
 subtext="Pemberitahuan resmi"
 value={stats.izin}
 tag="Izin"
 tone="blue"
 />
 <ModernKpiCard
 icon={AlertCircle}
 label="Sakit"
 subtext="Surat keterangan"
 value={stats.sakit}
 tag="Sakit"
 tone="purple"
 />
 <ModernKpiCard
 icon={XCircle}
 label="Alpa"
 subtext="Tanpa keterangan"
 value={stats.alpa}
 tag="Alpa"
 tone="rose"
 />
 <ModernKpiCard
 icon={Award}
 label="Kehadiran"
 subtext="Rasio rata-rata"
 value={`${stats.persentase_hadir}%`}
 tag="Rasio"
 tone="amber"
 />
 </div>

 {/* Print Option Modal */}
 <PrintOptionModal
 isOpen={isPrintModalOpen}
 onClose={() => setIsPrintModalOpen(false)}
 title="Rekap Log Presensi Siswa"
 onPrint={() => {
 const rowsToPrint = Array.isArray(dataPresensi) ? dataPresensi : []
 printCleanTable({
 title: 'Laporan Presensi Pembelajaran Siswa',
 subtitle: 'Data Rekap Kehadiran Terintegrasi Jadwal Pelajaran',
 headers: ['NO', 'TANGGAL', 'PERTEMUAN', 'NAMA SISWA', 'NIS', 'MAPEL & JADWAL', 'STATUS', 'KETERANGAN'],
 rows: rowsToPrint.map((row, i) => [
 i + 1,
 row.tanggal || '-',
 `Ke-${row.pertemuan_ke || 1}`,
 row.siswa?.full_name || '-',
 row.siswa?.nis || '-',
 `${row.jadwal?.subject?.name || '-'} (${row.jadwal?.kelas?.nama_kelas || '-'})`,
 row.status_label || row.status_hadir || '-',
 row.keterangan || '-',
 ]),
 })
 }}
 onDownload={() => {
 const rowsToPrint = Array.isArray(dataPresensi) ? dataPresensi : []
 downloadPdfTable({
 title: 'Laporan Presensi Pembelajaran Siswa',
 subtitle: 'Data Rekap Kehadiran Terintegrasi Jadwal Pelajaran',
 headers: ['NO', 'TANGGAL', 'PERTEMUAN', 'NAMA SISWA', 'NIS', 'MAPEL & JADWAL', 'STATUS', 'KETERANGAN'],
 rows: rowsToPrint.map((row, i) => [
 i + 1,
 row.tanggal || '-',
 `Ke-${row.pertemuan_ke || 1}`,
 row.siswa?.full_name || '-',
 row.siswa?.nis || '-',
 `${row.jadwal?.subject?.name || '-'} (${row.jadwal?.kelas?.nama_kelas || '-'})`,
 row.status_label || row.status_hadir || '-',
 row.keterangan || '-',
 ]),
 })
 }}
 />

 {/* ── Main Content Areas ── */}
 {activeTab === 'list' ? (
 /* TAB 1: REKAP / LOG LIST VIEW (Integrated Emerald Datatable Container) */
 <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-sm dark:bg-[#1B2433]">
 {/* Toolbar Baris 1: Header Judul & Soft Pastel Squircle Action Buttons */}
 <div className="p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-900/50 border-b border-emerald-200/90 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div>
 <div className="flex items-center gap-2">
 <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
 Daftar Log Presensi Siswa
 </h2>
 <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-2 border-emerald-300">
 {pagination.total} Data
 </span>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
 Riwayat presensi belajar harian siswa per pertemuan jadwal.
 </p>
 </div>

 <div className="flex items-center gap-2 flex-wrap">
 <SquircleActionButton
 variant="view"
 icon={Printer}
 label="Cetak"
 onClick={() => setIsPrintModalOpen(true)}
 />
 <SquircleActionButton
 variant="import"
 icon={RefreshCw}
 label="Segarkan"
 disabled={loading}
 onClick={() => fetchPresensiList(pagination.current_page)}
 />
 <SquircleActionButton
 variant="primary"
 icon={Plus}
 label="Tambah Manual"
 onClick={handleOpenCreateModal}
 />
 </div>
 </div>

 {/* Toolbar Baris 2: Full-Width Search Input dengan Debounce */}
 <div className="p-3 sm:p-4 bg-slate-50/50 dark:bg-slate-900/50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-emerald-950/30 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <div className="relative">
 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 placeholder="Cari nama siswa, NIS, mata pelajaran, atau keterangan..."
 value={filters.search}
 onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
 className="h-9 h-9 w-full rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#151D2A] pl-10 pr-10 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 focus:border-[#0E5C44] transition-all shadow-xs"
 />
 {filters.search && (
 <button
 type="button"
 onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
 className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
 >
 <X className="size-3.5" />
 </button>
 )}
 </div>
 </div>

 {/* Toolbar Baris 3: Horizontal Filters & Reset Button */}
 <div className="px-3 sm:px-4 py-2.5 border-b border-emerald-200/80 bg-slate-50/50 dark:bg-slate-900/50 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/40 flex flex-wrap items-center gap-2">
 <HeroUiFilterSelect
 value={filters.jadwal_pelajaran_id}
 onChange={(val) => setFilters((prev) => ({ ...prev, jadwal_pelajaran_id: val }))}
 options={[
 { value: '', label: 'Semua Jadwal Pelajaran' },
 ...options.schedules.map((s) => ({
 value: String(s.id),
 label: s.nama_jadwal || s.label || s.name || 'Jadwal',
 })),
 ]}
 placeholder="Semua Jadwal Pelajaran"
 icon={BookOpen}
 ariaLabel="Pilih Jadwal Pelajaran"
 size="sm"
 searchable
 className="w-full sm:w-auto min-w-[170px]"
 />

 <HeroUiFilterSelect
 value={filters.status_hadir}
 onChange={(val) => setFilters((prev) => ({ ...prev, status_hadir: val }))}
 options={[
 { value: '', label: 'Semua Status Kehadiran' },
 ...options.statuses.map((st) => ({
 value: String(st.value),
 label: st.label,
 })),
 ]}
 placeholder="Semua Status Kehadiran"
 icon={UserCheck}
 ariaLabel="Pilih Status Kehadiran"
 size="sm"
 className="w-full sm:w-auto min-w-[160px]"
 />

 <div className="w-44">
 <DatePicker
 value={filters.tanggal}
 onChange={(e) => setFilters((prev) => ({ ...prev, tanggal: e.target.value }))}
 inputClassName="h-9 px-3 text-xs rounded-xl border border-emerald-200/80 bg-white dark:bg-slate-900"
 />
 </div>

 {hasActiveFilter && (
 <button
 type="button"
 onClick={resetFilters}
 className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-emerald-200/80 dark:border-emerald-700/80 bg-white dark:bg-emerald-600 px-3 text-xs font-bold text-slate-600 dark:text-slate-300 dark: transition-colors ml-auto cursor-pointer font-medium"
 >
 <RotateCcw className="h-3.5 w-3.5" />
 <span>Reset Filter</span>
 </button>
 )}
 </div>

 {/* Table Data */}
 <div className="overflow-x-auto min-h-[340px]">
 <TableRoot className="w-full text-left text-sm">
              <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200 font-extrabold uppercase tracking-wider text-xs">
                <TableRow>
                  <TableHead className="px-5 py-3.5">SISWA & IDENTITAS</TableHead>
                  <TableHead className="px-5 py-3.5">MATA PELAJARAN & KELAS</TableHead>
                  <TableHead className="px-5 py-3.5">TANGGAL & PERTEMUAN</TableHead>
                  <TableHead className="px-5 py-3.5">STATUS & KETERANGAN</TableHead>
                  <TableHead className="w-16 sm:w-20 text-right select-none" />
                </TableRow>
              </TableHeader>
 <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-sm">
 {loading ? (
 <TableRow>
 <TableCell colSpan={5} className="text-center py-14 text-emerald-600">
 <div className="flex flex-col items-center gap-2">
 <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
 <span className="text-xs">Memuat data presensi...</span>
 </div>
 </TableCell>
 </TableRow>
 ) : dataPresensi.length === 0 ? (
 <TableRow>
 <TableCell colSpan={5} className="text-center py-14 text-slate-400">
 <div className="flex flex-col items-center gap-2">
 <CalendarCheck className="w-10 h-9 text-slate-200 dark:text-slate-700" />
 <span className="text-xs font-medium">Belum ada riwayat presensi ditemukan.</span>
 </div>
 </TableCell>
 </TableRow>
 ) : (
 dataPresensi.map((item) => (
                <TableRow
                  key={item.id}
                  className="group hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors"
                >
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {(item.siswa?.full_name || 'S').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-white">
                          {item.siswa?.full_name || 'Siswa N/A'}
                        </div>
                        <div className="text-xs text-slate-400">
                          NIS: {item.siswa?.nis || '-'}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {item.jadwal?.subject?.name || 'Mata Pelajaran'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {item.jadwal?.kelas?.nama_kelas} • {item.jadwal?.day_name} ({item.jadwal?.time_start}-{item.jadwal?.time_end})
                    </div>
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    <div className="font-semibold text-slate-800 dark:text-white">
                      {item.tanggal}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Pertemuan Ke-{item.pertemuan_ke || 1}
                    </div>
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    <div className="space-y-1">
                      {renderBadge(item.status_hadir, item.status_label)}
                      {item.keterangan && (
                        <div className="text-[11px] text-slate-500 max-w-xs truncate">
                          {item.keterangan}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setDetailItem(item)}
                        className="p-1.5 rounded-xl border border-sky-200 bg-sky-50 text-sky-600 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300 transition-colors cursor-pointer"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300 transition-colors cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
 )}
 </TableBody>
 </TableRoot>
 </div>

 {/* Pagination Bar (Modern HeroUI Emerald Squircle) */}
 {pagination.total > 0 && (
 <div className="px-6 py-4 border-t border-emerald-100/80 dark:border-emerald-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 bg-emerald-50/20 dark:bg-emerald-950/10">
 <div>
 Menampilkan Data Halaman <span className="font-bold text-slate-800 dark:text-white">{pagination.current_page}</span> dari <span className="font-bold text-slate-800 dark:text-white">{pagination.last_page}</span> (Total {pagination.total} Data)
 </div>
 <div className="flex items-center gap-2">
 <button
 disabled={pagination.current_page <= 1}
 onClick={() => fetchPresensiList(pagination.current_page - 1)}
 className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
 title="Halaman Sebelumnya"
 >
 <ChevronLeft className="size-5" />
 </button>
 <span className="px-3 py-1 font-bold text-slate-700 dark:text-slate-300">
 {pagination.current_page} / {pagination.last_page}
 </span>
 <button
 disabled={pagination.current_page >= pagination.last_page}
 onClick={() => fetchPresensiList(pagination.current_page + 1)}
 className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
 title="Halaman Berikutnya"
 >
 <ChevronRight className="size-5" />
 </button>
 </div>
 </div>
 )}
 </div>
 ) : (
 /* TAB 2: INPUT PRESENSI PER JADWAL (BULK MODE) */
 <div className="space-y-6">
 {/* Header Card Selection */}
 <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-6 shadow-md shadow-sm dark:bg-[#1B2433] space-y-4">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3">
 <div>
 <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
 <Users className="w-5 h-5 text-emerald-600" />
 Form Presensi Per Jadwal Pelajaran
 </h2>
 <p className="text-xs text-slate-500 mt-0.5">
 Pilih Jadwal Pelajaran dan tanggal untuk mencatat presensi seluruh siswa di kelas tersebut.
 </p>
 </div>
 {bulkState.students.length > 0 && (
 <button
 onClick={handleSaveBulk}
 disabled={saving}
 className="px-5 py-2.5 bg-emerald-600 dark:bg-slate-100 dark:text-slate-900 dark: hover:from-emerald-700 hover:to-teal-700 font-bold text-xs rounded-lg transition-all shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer text-white border border-emerald-600 h-9 text-sm font-medium"
 >
 <Save className="w-4 h-4" />
 {saving ? 'Menyimpan...' : `Simpan Presensi (${bulkState.students.length} Siswa)`}
 </button>
 )}
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Pilih Jadwal Pelajaran <span className="text-rose-500">*</span>
 </label>
 <HeroUiFilterSelect
 value={bulkState.jadwal_pelajaran_id}
 onChange={(val) => setBulkState((prev) => ({ ...prev, jadwal_pelajaran_id: val }))}
 options={options.schedules.map((s) => ({
 value: String(s.id),
 label: s.nama_jadwal || s.label || s.name || 'Jadwal',
 }))}
 placeholder="-- Pilih Jadwal Pelajaran --"
 ariaLabel="Pilih Jadwal Pelajaran"
 searchable
 className="w-full"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Tanggal Presensi <span className="text-rose-500">*</span>
 </label>
 <DatePicker
 value={bulkState.tanggal}
 onChange={(e) => setBulkState((prev) => ({ ...prev, tanggal: e.target.value }))}
 inputClassName="h-10 px-3.5 text-xs rounded-xl"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Pertemuan Ke-
 </label>
 <input
 type="number"
 min="1"
 value={bulkState.pertemuan_ke}
 onChange={(e) => setBulkState((prev) => ({ ...prev, pertemuan_ke: e.target.value }))}
 className="w-full h-9 px-3.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-700/80 focus:ring-emerald-500 focus:border-emerald-500 font-semibold"
 />
 </div>
 </div>

 {/* Quick Bulk Action Buttons */}
 {bulkState.students.length > 0 && (
 <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-emerald-100 dark:border-emerald-900/40">
 <div className="text-xs font-bold text-slate-500">
 Set Status Cepat Semua Siswa:
 </div>
 <div className="flex flex-wrap items-center gap-2">
 <button
 type="button"
 onClick={() => handleSetAllStatus('hadir')}
 className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer"
 >
 <CheckCircle2 className="w-3.5 h-3.5" />
 Set Semua HADIR
 </button>
 <button
 type="button"
 onClick={() => handleSetAllStatus('izin')}
 className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 transition-colors flex items-center gap-1.5 cursor-pointer"
 >
 <Clock className="w-3.5 h-3.5" />
 Set Semua IZIN
 </button>
 <button
 type="button"
 onClick={() => handleSetAllStatus('sakit')}
 className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-100 text-sky-800 hover:bg-sky-200 dark:bg-sky-900/40 dark:text-sky-300 transition-colors flex items-center gap-1.5 cursor-pointer"
 >
 <AlertCircle className="w-3.5 h-3.5" />
 Set Semua SAKIT
 </button>
 </div>
 </div>
 )}
 </div>

 {/* Student List Grid / Table */}
 {bulkState.students.length > 0 ? (
 <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-sm dark:bg-[#1B2433]">
 <div className="overflow-x-auto">
 <TableRoot className="w-full text-left text-sm">
                  <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200 font-extrabold uppercase tracking-wider text-xs">
                    <TableRow>
                      <TableHead className="px-5 py-3.5">SISWA & IDENTITAS</TableHead>
                      <TableHead className="px-5 py-3.5">NIS / NISN</TableHead>
                      <TableHead className="px-5 py-3.5 text-center">STATUS KEHADIRAN</TableHead>
                      <TableHead className="px-5 py-3.5">CATATAN / KETERANGAN</TableHead>
                      <TableHead className="w-16 sm:w-20 text-right select-none" />
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                    {bulkState.students.map((st) => (
                      <TableRow key={st.siswa_id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20">
                        <TableCell className="px-5 py-4 font-semibold text-slate-800 dark:text-emerald-600">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                              {(st.full_name || 'S').slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{st.full_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-xs text-slate-500">
                          {st.nis || '-'} / {st.nisn || '-'}
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {[
                              { val: 'hadir', label: 'Hadir', activeClass: 'bg-emerald-600 text-white shadow-sm' },
                              { val: 'izin', label: 'Izin', activeClass: 'bg-teal-600 text-white shadow-sm shadow-teal-600/20' },
                              { val: 'sakit', label: 'Sakit', activeClass: 'bg-sky-600 text-white shadow-sm' },
                              { val: 'alpa', label: 'Alpa', activeClass: 'bg-rose-600 text-white shadow-sm' },
                              { val: 'terlambat', label: 'Terlambat', activeClass: 'bg-amber-600 text-white shadow-sm' },
                            ].map((btn) => (
                              <button
                                key={btn.val}
                                type="button"
                                onClick={() => handleUpdateStudentStatus(st.siswa_id, btn.val)}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${st.status === btn.val ? btn.activeClass : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-emerald-950/60 dark:text-emerald-300"}`}
                              >
                                {btn.label}
                              </button>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <input
                            type="text"
                            placeholder="Tambah keterangan..."
                            value={st.keterangan || ''}
                            onChange={(e) => handleUpdateStudentKeterangan(st.siswa_id, e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-700/80"
                          />
                        </TableCell>
                        <TableCell className="px-5 py-4 text-right">
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                            {st.status_hadir ? st.status_hadir.toUpperCase() : '-'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
 </TableRoot>
 </div>
 </div>
 ) : (
 <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-xl border border-dashed border-emerald-200 dark:border-emerald-700/80 text-slate-400">
 <Users className="w-12 h-9 mx-auto text-emerald-300 dark:text-emerald-800 mb-3" />
 <p className="font-semibold text-slate-700 dark:text-slate-300">Pilih Jadwal Pelajaran</p>
 <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
 Daftar seluruh siswa di rombel kelas akan otomatis ditampilkan di sini untuk input cepat sekaligus.
 </p>
 </div>
 )}
 </div>
 )}

 {/* ── SINGLE CREATE / EDIT MODAL ── */}
 <AppModal
 isOpen={modalOpen}
 onClose={() => setModalOpen(false)}
 title={modalType === 'create' ? 'Tambah Data Presensi Manual' : 'Ubah Data Presensi'}
 icon={Sparkles}
 maxWidth="max-w-lg"
 zIndex={50}
 footer={
 <>
 <button
 type="button"
 onClick={() => setModalOpen(false)}
 className="px-4 py-2 rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 cursor-pointer"
 >
 Batal
 </button>
 <button
 type="submit"
 form="lms-presensi-single-form"
 disabled={saving}
 className="px-5 py-2 bg-emerald-600 dark:bg-slate-100 dark:text-slate-900 dark: hover:from-emerald-700 hover:to-teal-700 font-bold text-xs rounded-lg transition-all shadow-md disabled:opacity-50 cursor-pointer text-white border border-emerald-600 h-9 text-sm font-medium"
 >
 {saving ? 'Simpan...' : 'Simpan Data'}
 </button>
 </>
 }
 >
 <form id="lms-presensi-single-form" onSubmit={handleSubmitSingleModal} className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Jadwal Pelajaran <span className="text-rose-500">*</span>
 </label>
 <HeroUiFilterSelect
 value={formData.jadwal_pelajaran_id}
 onChange={(val) => setFormData((prev) => ({ ...prev, jadwal_pelajaran_id: val }))}
 options={options.schedules.map((s) => ({
 value: String(s.id),
 label: s.nama_jadwal || s.label || s.name || 'Jadwal',
 }))}
 placeholder="-- Pilih Jadwal --"
 ariaLabel="Pilih Jadwal Pelajaran"
 searchable
 className="w-full"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Siswa <span className="text-rose-500">*</span>
 </label>
 <HeroUiFilterSelect
 value={formData.siswa_id}
 onChange={(val) => setFormData((prev) => ({ ...prev, siswa_id: val }))}
 options={options.students.map((st) => ({
 value: String(st.id),
 label: `${st.full_name} (${st.nis || 'No NIS'})`,
 }))}
 placeholder="-- Pilih Siswa --"
 ariaLabel="Pilih Siswa"
 searchable
 className="w-full"
 />
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Tanggal <span className="text-rose-500">*</span>
 </label>
 <DatePicker
 value={formData.tanggal}
 onChange={(e) => setFormData((prev) => ({ ...prev, tanggal: e.target.value }))}
 inputClassName="h-10 px-3.5 text-xs rounded-xl"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Pertemuan Ke-
 </label>
 <input
 type="number"
 min="1"
 value={formData.pertemuan_ke}
 onChange={(e) => setFormData((prev) => ({ ...prev, pertemuan_ke: e.target.value }))}
 className="w-full h-9 px-3.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-700/80 font-semibold"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Status Kehadiran <span className="text-rose-500">*</span>
 </label>
 <HeroUiFilterSelect
 value={formData.status_hadir}
 onChange={(val) => setFormData((prev) => ({ ...prev, status_hadir: val }))}
 options={options.statuses.map((st) => ({
 value: String(st.value),
 label: st.label,
 }))}
 placeholder="-- Pilih Status Kehadiran --"
 ariaLabel="Pilih Status Kehadiran"
 className="w-full"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Catatan / Keterangan
 </label>
 <textarea
 rows="2"
 value={formData.keterangan}
 onChange={(e) => setFormData((prev) => ({ ...prev, keterangan: e.target.value }))}
 placeholder="Contoh: Sakit demam berdarah, ada surat dokter..."
 className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-700/80"
 />
 </div>
 </form>
 </AppModal>

 {/* ── DETAIL MODAL ── */}
 <AppModal
 isOpen={Boolean(detailItem)}
 onClose={() => setDetailItem(null)}
 title="Detail Presensi Pembelajaran"
 icon={CalendarCheck}
 maxWidth="max-w-md"
 zIndex={50}
 footer={
 <button
 type="button"
 onClick={() => setDetailItem(null)}
 className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
 >
 Tutup
 </button>
 }
 >
 {detailItem && (
 <div className="space-y-4 text-xs font-medium">
 <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60">
 <div className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Status Kehadiran</div>
 {renderBadge(detailItem.status_hadir, detailItem.status_label)}
 </div>

 <div>
 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Siswa</label>
 <p className="font-bold text-slate-800 dark:text-white text-sm mt-0.5">
 {detailItem.siswa?.full_name || 'N/A'}
 </p>
 <p className="text-slate-500 mt-0.5">NIS: {detailItem.siswa?.nis || '-'}</p>
 </div>

 <div>
 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mata Pelajaran &amp; Jadwal</label>
 <p className="font-bold text-slate-800 dark:text-white text-sm mt-0.5">
 {detailItem.jadwal?.subject?.name || '-'}
 </p>
 <p className="text-slate-500 mt-0.5">
 {detailItem.jadwal?.kelas?.nama_kelas} • {detailItem.jadwal?.day_name} ({detailItem.jadwal?.time_start}-{detailItem.jadwal?.time_end})
 </p>
 <p className="text-emerald-700 dark:text-emerald-400 font-semibold mt-1">Guru: {detailItem.jadwal?.teacher?.full_name || '-'}</p>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal</label>
 <p className="font-bold text-slate-800 dark:text-white text-sm mt-0.5">{detailItem.tanggal}</p>
 </div>
 <div>
 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pertemuan Ke-</label>
 <p className="font-bold text-slate-800 dark:text-white text-sm mt-0.5">{detailItem.pertemuan_ke || 1}</p>
 </div>
 </div>

 <div>
 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Catatan / Keterangan</label>
 <p className="text-slate-700 dark:text-slate-300 mt-1 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-700/80">
 {detailItem.keterangan || 'Tidak ada catatan khusus.'}
 </p>
 </div>
 </div>
 )}
 </AppModal>
 </div>
 </PageContainer>
 )
}
