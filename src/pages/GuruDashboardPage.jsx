import { SquircleActionButton } from '../components/master-data'
import ActionDropdown from '../components/app/ActionDropdown'
import { Tooltip } from '../components/ui/tooltip'
import CustomSelect from "../components/ui/CustomSelect"
import React, { useState, useEffect } from 'react'
import {
  DatePicker
} from '@/components/ui/date-picker'
import {
  useNavigate
} from 'react-router-dom'
import {
  useToast
} from '../components/app/ToastProvider'
import {
  Calendar,
  Users,
  BookOpen,
  FileCheck,
  CheckCircle2,
  Sparkles,
  Clock,
  AlertCircle,
  Plus,
  FilePlus,
  BookMarked,
  Award,
  Eye,
  CalendarDays,
  RefreshCw,
  Search,
  Check,
  Send,
  Upload,
  X,
  FileText,
  Paperclip,
  ShieldAlert
} from 'lucide-react'

import {
  AppPageHeader,
  AppBreadcrumb,
  AppFilterBar,
  KpiCard,
  KpiStatCard,
  AppDataTable,
  AppBadge,
  AppButton,
  SectionHeader,
  DetailPanel,
  PageContainer,
  HeroUiHeader
} from '../components/app'

import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'
import KpiQuickViewModal from '../components/KpiQuickViewModal'
import ModalErrorBoundary from '../components/common/ModalErrorBoundary'

import api from '../services/api'

// HeroUI Core UI Components
import {
  Button
} from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Backdrop
} from '@/components/ui/dialog'
import {
  Badge
} from '@/components/ui/badge'
import {
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert'
import {
  Input
} from '@/components/ui/input'
import {
  TextArea
} from '@/components/ui/text-area'
import {
  Checkbox
} from '@/components/ui/checkbox'
import {
  Label
} from '@/components/ui/label'

export default function GuruDashboardPage() {
 const navigate = useNavigate()
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(null)
 const [data, setData] = useState(null)
 const [activeModal, setActiveModal] = useState(null)
 const [selectedScheduleDetail, setSelectedScheduleDetail] = useState(null)

 const toast = useToast()
 // Quick Action Modal States
 const [quickModal, setQuickModal] = useState(null) // 'presensi' | 'materi' | 'penugasan' | 'pengumpulan-tugas' | 'jadwal'

 // Form States for Presensi Modal
 const [presensiJadwalId, setPresensiJadwalId] = useState('')
 const [presensiTanggal, setPresensiTanggal] = useState(new Date().toISOString().split('T')[0])
 const [presensiCatatan, setPresensiCatatan] = useState('')
 const [presensiSiswaList, setPresensiSiswaList] = useState([])

 // Form States for Materi Modal
 const [materiJudul, setMateriJudul] = useState('')
 const [materiKelasMapel, setMateriKelasMapel] = useState('')
 const [materiDeskripsi, setMateriDeskripsi] = useState('')
 const [materiAttachmentUrl, setMateriAttachmentUrl] = useState('')
 const [materiVideoUrl, setMateriVideoUrl] = useState('')
 const [materiPublishDirectly, setMateriPublishDirectly] = useState(true)

 // Form States for Penugasan Modal
 const [tugasJudul, setTugasJudul] = useState('')
 const [tugasKelasMapel, setTugasKelasMapel] = useState('')
 const [tugasDeadline, setTugasDeadline] = useState('')
 const [tugasMaxScore, setTugasMaxScore] = useState(100)
 const [tugasInstruksi, setTugasInstruksi] = useState('')
 const [tugasAllowLate, setTugasAllowLate] = useState(true)

 // Form States for Pengumpulan Tugas / Penilaian Modal
 const [selectedTugasId, setSelectedTugasId] = useState('')
 const [penilaianSiswaList, setPenilaianSiswaList] = useState([])

 // State for Schedule Modal Search
 const [scheduleSearch, setScheduleSearch] = useState('')

 // Form States for Catat Pelanggaran Modal (Tahap 1)
 const [pelanggaranJadwalId, setPelanggaranJadwalId] = useState('')
 const [pelanggaranSiswaList, setPelanggaranSiswaList] = useState([])
 const [pelanggaranStudentId, setPelanggaranStudentId] = useState('')
 const [pelanggaranKategoriId, setPelanggaranKategoriId] = useState('')
 const [pelanggaranPoin, setPelanggaranPoin] = useState(5)
 const [pelanggaranDeskripsi, setPelanggaranDeskripsi] = useState('')
 const [pelanggaranRujukBk, setPelanggaranRujukBk] = useState(false)
 const [pelanggaranSaving, setPelanggaranSaving] = useState(false)
 const [disciplineCategories, setDisciplineCategories] = useState([])

 const triggerAlert = (type, title, message) => {
 if (toast[type]) {
 toast[type](title, message)
 } else {
 toast.push(type, message, title)
 }
 }

 const fetchDashboard = async () => {
 setLoading(true)
 setError(null)
 try {
 const res = await api.get('/teacher/dashboard')
 if (res.data && res.data.data) {
 setData(res.data.data)
 } else {
 setError('Format respon server tidak valid.')
 }
 } catch (err) {
 console.error('Failed to load Teacher dashboard:', err)
 setError(err.response?.data?.message || 'Gagal memuat data dashboard Guru.')
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 fetchDashboard()
 }, [])

 const schedulesToday = data?.schedules_today || []
 const teacherClasses = useMemo(() => {
 if (!Array.isArray(schedulesToday) || schedulesToday.length === 0) return []
 const seen = new Set()
 const result = []
 schedulesToday.forEach((s) => {
 const val = `${s.mapel || s.subject_name || 'Mapel'} - ${s.kelas || s.class_name || 'Kelas'}`
 if (!seen.has(val)) {
 seen.add(val)
 result.push(val)
 }
 })
 return result
 }, [schedulesToday])

 if (loading && !data) return <SkeletonDashboard />
 if (error && !data) return <ErrorState message={error} onRetry={fetchDashboard} />

 const teacher = data?.teacher || {}
 const academicContext = data?.academic_context || {}
 const kpis = data?.kpi || {}
 const teacherAttendanceLogs = data?.teacher_attendance_logs || []
 const announcements = data?.announcements || []


 const formatNumber = (num) => (num !== undefined && num !== null ? Number(num).toLocaleString('id-ID') : '0')

 // Quick Action Handlers
 const handleSetAllPresent = () => {
 setPresensiSiswaList((prev) => prev.map((s) => ({ ...s, status: 'Hadir' })))
 }

 const handleUpdateStudentStatus = (id, newStatus) => {
 setPresensiSiswaList((prev) =>
 prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
 )
 }

 const handleSavePresensi = (e) => {
 e?.preventDefault()
 const presentCount = presensiSiswaList.filter((s) => s.status === 'Hadir').length
 triggerAlert('success', 'Presensi Berhasil Disimpan', `Presensi kelas tersimpan: ${presentCount} dari ${presensiSiswaList.length} siswa hadir.`)
 setQuickModal(null)
 }

 const handleSaveMateri = (e) => {
 e?.preventDefault()
 if (!materiJudul.trim()) {
 triggerAlert('warning', 'Judul Wajib Diisi', 'Silakan lengkapi judul materi terlebih dahulu.')
 return
 }
 triggerAlert('success', 'Materi Berhasil Ditambahkan', `Materi "${materiJudul}" telah berhasil disimpan dan dipublikasikan ke siswa.`)
 setMateriJudul('')
 setMateriDeskripsi('')
 setMateriAttachmentUrl('')
 setMateriVideoUrl('')
 setQuickModal(null)
 }

 const handleSaveTugas = (e) => {
 e?.preventDefault()
 if (!tugasJudul.trim()) {
 triggerAlert('warning', 'Judul Wajib Diisi', 'Silakan lengkapi judul tugas terlebih dahulu.')
 return
 }
 triggerAlert('success', 'Tugas Berhasil Diterbitkan', `Tugas "${tugasJudul}" untuk kelas ${tugasKelasMapel} telah diterbitkan.`)
 setTugasJudul('')
 setTugasInstruksi('')
 setQuickModal(null)
 }

 const handleSavePenilaian = (e) => {
 e?.preventDefault()
 triggerAlert('success', 'Penilaian Disimpan', `Data nilai tugas siswa telah berhasil diperbarui di sistem.`)
 setQuickModal(null)
 }

 const loadStudentsForSchedule = async (schId) => {
 if (!schId) {
 setPelanggaranSiswaList([])
 setPelanggaranStudentId('')
 return
 }
 const selectedSchedule = schedulesToday.find((s) => String(s.id) === String(schId))
 const classId = selectedSchedule?.class_id || selectedSchedule?.kelas_id || selectedSchedule?.kelas?.id
 try {
 const res = await api.get('/teacher/students', { params: { class_id: classId } })
 const list = res.data?.data?.data || res.data?.data || []
 setPelanggaranSiswaList(list)
 if (list.length > 0) {
 setPelanggaranStudentId(list[0].id)
 } else {
 setPelanggaranStudentId('')
 }
 } catch (err) {
 console.error('Failed to load students:', err)
 setPelanggaranSiswaList([])
 setPelanggaranStudentId('')
 }
 }

 const handleOpenPelanggaranModal = async () => {
 setQuickModal('pelanggaran')
 setPelanggaranDeskripsi('')
 setPelanggaranRujukBk(false)
 const initialSchId = schedulesToday.length > 0 ? String(schedulesToday[0].id) : ''
 setPelanggaranJadwalId(initialSchId)
 if (initialSchId) {
 loadStudentsForSchedule(initialSchId)
 }
 if (disciplineCategories.length === 0) {
 try {
 const res = await api.get('/teacher/discipline-categories?type=violation')
 const items = res.data?.data || []
 setDisciplineCategories(items)
 if (items.length > 0) {
 setPelanggaranKategoriId(items[0].id)
 setPelanggaranPoin(Math.abs(items[0].point_weight || 5))
 }
 } catch (err) {
 console.error('Failed to load discipline categories:', err)
 }
 }
 }

 const handlePelanggaranCategoryChange = (catId) => {
 setPelanggaranKategoriId(catId)
 const found = disciplineCategories.find((c) => String(c.id) === String(catId))
 if (found) {
 setPelanggaranPoin(Math.abs(found.point_weight || 5))
 }
 }

 const handleSavePelanggaran = async (e) => {
 e?.preventDefault()
 if (!pelanggaranStudentId) {
 triggerAlert('error', 'Santri Wajib Dipilih', 'Mohon pilih santri yang melanggar dari daftar kelas.')
 return
 }
 if (!pelanggaranDeskripsi.trim()) {
 triggerAlert('warning', 'Deskripsi Wajib Diisi', 'Mohon isi catatan atau kronologi pelanggaran santri.')
 return
 }
 setPelanggaranSaving(true)
 try {
 const selectedSchedule = schedulesToday.find((s) => String(s.id) === String(pelanggaranJadwalId))
 await api.post('/teacher/discipline-violations', {
 student_id: pelanggaranStudentId,
 category_id: pelanggaranKategoriId,
 points: -Math.abs(pelanggaranPoin),
 custom_points: pelanggaranPoin,
 description: pelanggaranDeskripsi.trim(),
 transaction_date: new Date().toISOString().split('T')[0],
 status: pelanggaranRujukBk ? 'dirujuk_bk' : 'tercatat',
 follow_up: pelanggaranRujukBk ? 'Dirujuk ke Guru BK / Wali Kelas' : null,
 class_id: selectedSchedule?.class_id || selectedSchedule?.kelas_id || null,
 schedule_id: pelanggaranJadwalId || null,
 })
 triggerAlert(
 'success',
 'Pelanggaran Berhasil Dicatat',
 `Pelanggaran santri telah dicatat (-${pelanggaranPoin} poin) dan disinkronkan ke Catatan Siswa & Portal Orang Tua.`
 )
 setQuickModal(null)
 setPelanggaranDeskripsi('')
 } catch (err) {
 console.error('Failed to save discipline violation:', err)
 triggerAlert('error', 'Gagal Menyimpan', err.response?.data?.message || 'Gagal menyimpan catatan pelanggaran santri.')
 } finally {
 setPelanggaranSaving(false)
 }
 }

 const scheduleColumns = [
 {
 key: 'time',
 label: 'Waktu Pertemuan',
 render: (row) => (
 <span className="font-extrabold text-slate-900 dark:text-white text-xs">
 {row.time_start || row.jam_mulai || '-'} - {row.time_end || row.jam_selesai || '-'}
 </span>
 ),
 },
 {
 key: 'subject',
 label: 'Mata Pelajaran',
 render: (row) => (
 <div className="min-w-0">
 <p className="font-extrabold text-[#059669] dark:text-[#10B981] text-xs truncate">
 {row.subject?.nama_mapel || row.subject?.name || 'Mata Pelajaran'}
 </p>
 <p className="text-[10px] text-slate-400 font-medium">Ruang: {row.room || row.ruangan || 'Utama'}</p>
 </div>
 ),
 },
 {
 key: 'kelas',
 label: 'Kelas / Rombel',
 render: (row) => <AppBadge variant="info">{row.kelas?.nama_kelas || row.kelas?.kode_kelas || 'Kelas'}</AppBadge>,
 },
		{
			key: 'actions',
			label: 'Aksi',
			className: 'w-[80px] text-center',
			render: (row) => (
				<ActionDropdown onView={() => setSelectedScheduleDetail(row)} />
			),
		},
 ]

 const attendanceLogColumns = [
 {
 key: 'date',
 label: 'Tanggal',
 render: (row) => <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{row.attendance_date || row.date || (row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID') : '-')}</span>,
 },
 {
 key: 'check_in',
 label: 'Waktu Masuk',
 render: (row) => <span className="font-bold text-slate-900 dark:text-white text-xs">{row.check_in_time || row.jam_masuk || (row.created_at ? new Date(row.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-')}</span>,
 },
 {
 key: 'status',
 label: 'Status',
 render: (row) => <AppBadge variant="success" dot>{row.status || 'Hadir'}</AppBadge>,
 },
 ]

 const announcementColumns = [
 {
 key: 'judul',
 label: 'Judul Pengumuman',
 render: (row) => <span className="font-extrabold text-slate-900 dark:text-white text-xs">{row.judul_pengumuman || row.judul}</span>,
 },
 {
 key: 'created_at',
 label: 'Tanggal',
 render: (row) => <span className="text-xs text-slate-500 font-medium">{row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID') : '-'}</span>,
 },
 ]

 return (
 <PageContainer maxW="7xl">
 <div className="space-y-6 pb-12">

 {/* Breadcrumb Navigation */}
 <AppBreadcrumb items={[{ label: 'Portal Guru Mata Pelajaran' }]} />

 {/* Modern Vivid Emerald HeroUI Header */}
 <HeroUiHeader
 icon={BookOpen}
 title="Dashboard Guru & Pembelajaran"
 tag={{ text: 'Portal Guru Mata Pelajaran', icon: Award }}
 description="Pantau jadwal harian, presensi santri, administrasi mengajar, dan evaluasi tugas terintegrasi."
			actions={
				<div className="flex items-center gap-2">
					<Tooltip content="Segarkan Data Pembelajaran">
						<button
							type="button"
							onClick={fetchDashboard}
							disabled={loading}
							aria-label="Segarkan Data Pembelajaran"
							className="size-9 flex items-center justify-center p-0 rounded-xl border-2 border-emerald-300 bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-2xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
						>
							<RefreshCw className={loading ? 'size-4 animate-spin text-emerald-700' : 'size-4 text-emerald-700 dark:text-emerald-300'} />
						</button>
					</Tooltip>
				</div>
			}
 />


 {/* Filter Bar */}
 <AppFilterBar label="Filter Jadwal & Pembelajaran" onReset={fetchDashboard} />

 {/* Primary KPI Grid */}
 <section className="space-y-3">
 <SectionHeader title="Ringkasan Aktivitas Mengajar" subtitle="Jadwal harian, total siswa, rombel, dan tugas pending" />
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <KpiStatCard
 title="Jadwal Hari Ini"
 value={formatNumber(kpis.schedules_today_count)}
 icon={Calendar}
 tone="emerald"
 badge="Jadwal"
 onClick={() => setActiveModal('schedules_today')}
 />
 <KpiStatCard
 title="Total Siswa Diajar"
 value={formatNumber(kpis.total_students)}
 icon={Users}
 tone="blue"
 badge="Siswa"
 onClick={() => setActiveModal('total_students')}
 />
 <KpiStatCard
 title="Total Rombel / Kelas"
 value={formatNumber(kpis.total_classes)}
 icon={BookOpen}
 tone="purple"
 badge="Rombel"
 onClick={() => setActiveModal('total_classes')}
 />
 <KpiStatCard
 title="Tugas Belum Dinilai"
 value={formatNumber(kpis.pending_grading_count)}
 icon={FileCheck}
 tone="amber"
 badge="Perlu Penilaian"
 onClick={() => setActiveModal('pending_grading')}
 />
 </div>
 </section>

 {/* Announcements Table - Moved directly below Primary KPI Grid */}
 <section className="space-y-3">
 <AppDataTable
 title="Pengumuman Sekolah Terbaru"
 description="Informasi resmi dari unit sekolah"
 data={announcements}
 columns={announcementColumns}
 keyField="judul"
 showToolbar={false}
 showPagination={false}
 />
 </section>

 {/* Quick Action Navigation */}
 <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/50 dark:via-teal-950/20 dark:to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-2xs">
              <Sparkles className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">Aksi Cepat Guru</h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Pintas cepat presensi, materi, tugas, nilai siswa, jadwal &amp; segarkan data</p>
            </div>
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <SquircleActionButton
              variant="primary"
              icon={CheckCircle2}
              label="Input Presensi"
              onClick={() => setQuickModal('presensi')}
            />
            <SquircleActionButton
              variant="create"
              icon={FilePlus}
              label="Tambah Materi"
              onClick={() => setQuickModal('materi')}
            />
            <SquircleActionButton
              variant="export"
              icon={BookMarked}
              label="Buat Tugas"
              onClick={() => setQuickModal('penugasan')}
            />
            <SquircleActionButton
              variant="import"
              icon={FileCheck}
              label="Nilai Tugas"
              onClick={() => setQuickModal('pengumpulan-tugas')}
            />
            <SquircleActionButton
              variant="refresh"
              icon={CalendarDays}
              label="Lihat Jadwal"
              onClick={() => setQuickModal('jadwal')}
            />
            <SquircleActionButton
              variant="delete"
              icon={AlertCircle}
              label="Catat Pelanggaran"
              onClick={handleOpenPelanggaranModal}
            />
          </div>
        </div>
      </section>

 {/* Teaching Schedule Table & Attendance Log */}
 <section className="space-y-3">
 <SectionHeader title="Jadwal Mengajar Hari Ini & Presensi Pengajar" subtitle="Daftar kelas diampu hari ini dan log presensi guru" />
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
 <div className="lg:col-span-8">
 <AppDataTable
 title="Jadwal Mengajar Hari Ini"
 description={academicContext.date || 'Jadwal Aktif Hari Ini'}
 data={schedulesToday}
 columns={scheduleColumns}
 keyField="id"
 searchPlaceholder="Cari jadwal..."
 />
 </div>

 <div className="lg:col-span-4">
 <AppDataTable
 title="Log Absensi Guru (View Only)"
 description="Riwayat presensi harian pengajar"
 data={teacherAttendanceLogs}
 columns={attendanceLogColumns}
 keyField="attendance_date"
 showToolbar={false}
 showPagination={false}
 />
 </div>
 </div>
 </section>

 {/* Schedule Detail Panel */}
 {selectedScheduleDetail && (
 <DetailPanel
 isOpen={Boolean(selectedScheduleDetail)}
 onClose={() => setSelectedScheduleDetail(null)}
 title="Detail Jadwal Mengajar"
 subtitle={`${selectedScheduleDetail.subject?.nama_mapel || 'Mapel'} - ${selectedScheduleDetail.kelas?.nama_kelas || 'Kelas'}`}
 fields={[
 { label: 'Mata Pelajaran', value: selectedScheduleDetail.subject?.nama_mapel || selectedScheduleDetail.subject?.name },
 { label: 'Kelas & Rombel', value: selectedScheduleDetail.kelas?.nama_kelas || 'Kelas' },
 { label: 'Waktu Pertemuan', value: `${selectedScheduleDetail.time_start || selectedScheduleDetail.jam_mulai || '-'} - ${selectedScheduleDetail.time_end || selectedScheduleDetail.jam_selesai || '-'}` },
 { label: 'Ruangan', value: selectedScheduleDetail.room || selectedScheduleDetail.ruangan || 'Ruangan Utama' },
 ]}
 actions={
 <div className="group relative inline-flex">
 <button
 type="button"
 aria-label="Input Presensi Pembelajaran"
 onClick={() => {
 const schId = String(selectedScheduleDetail.id || '')
 setSelectedScheduleDetail(null)
 if (schId) setPresensiJadwalId(schId)
 setQuickModal('presensi')
 }}
 className="flex size-10 items-center justify-center rounded-xl bg-emerald-100/90 text-emerald-700 hover:bg-emerald-600 hover:dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-500 dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
 >
 <CheckCircle2 className="size-5 transition-colors" />
 </button>
 <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
 Input Presensi Pembelajaran
 </div>
 </div>
 }
 />
 )}

 {/* KPI Detail Modal */}
 <ModalErrorBoundary onClose={() => setActiveModal(null)}>
 <KpiQuickViewModal
 type={activeModal}
 isOpen={Boolean(activeModal)}
 onClose={() => setActiveModal(null)}
 />
 </ModalErrorBoundary>

 {/* ══════════════════════════════════════════════════════════════════
 HEROUI QUICK ACTION MODALS (HEROUI UI DIALOGS)
 Neat Field & Label Structure with Animated Leaf Green Focus Line
 Soft Pastel Squircle Icon Buttons in Modal Footers
 ══════════════════════════════════════════════════════════════════ */}

 {/* 1. Modal Input Presensi Pembelajaran */}
 {quickModal === 'presensi' && (
 <Dialog
 isOpen={quickModal === 'presensi'}
 onOpenChange={(open) => !open && setQuickModal(null)}
 className="w-full max-w-xl"
 >
 <DialogHeader>
 <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-emerald-600">
 <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
 Input Presensi Pembelajaran Kelas
 </DialogTitle>
 <DialogDescription>
 Catat kehadiran siswa untuk jam pertemuan dan mata pelajaran yang diampu hari ini.
 </DialogDescription>
 </DialogHeader>

 <form onSubmit={handleSavePresensi}>
 <DialogBody className="space-y-4 py-2">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="flex flex-col gap-1.5">
 <label htmlFor="presensi-jadwal" className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
 Pilih Kelas / Jadwal Pertemuan <span className="text-rose-500">*</span>
 </label>
 <CustomSelect
 id="presensi-jadwal"
 value={presensiJadwalId}
 onChange={(e) => setPresensiJadwalId(e.target.value)}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-800/80 dark:border-emerald-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium transition-all duration-300 ease-in-out focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20 dark:focus:border-[#10B981] dark:focus:ring-[#10B981]/30 focus:outline-none"
 >
 <option value="">-- Pilih Jadwal Pembelajaran --</option>
 {schedulesToday.length > 0 ? (
 schedulesToday.map((sch) => (
 <option key={sch.id} value={sch.id}>
 {sch.subject?.nama_mapel || sch.subject?.name} - {sch.kelas?.nama_kelas || 'Kelas'} ({sch.time_start || sch.jam_mulai} - {sch.time_end || sch.jam_selesai})
 </option>
 ))
 ) : (
 <option value="" disabled>(Belum ada jadwal mengajar aktif hari ini)</option>
 )}
 </CustomSelect>
 </div>

 <div className="flex flex-col gap-1.5">
 <label htmlFor="presensi-tanggal" className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
 Tanggal Pertemuan <span className="text-rose-500">*</span>
 </label>
 <DatePicker
 id="presensi-tanggal"
 value={presensiTanggal}
 onChange={(e) => setPresensiTanggal(e.target.value)}
 placeholder="Pilih tanggal pertemuan..."
 />
 </div>
 </div>

 {/* Status Ringkasan & Quick Action Bar */}
 <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/80 dark:bg-slate-800/50 p-3">
 <div className="flex items-center gap-2 text-xs font-semibold">
 <span className="text-slate-500">Ringkasan Status:</span>
 <Badge color="success" size="sm">
 {presensiSiswaList.filter((s) => s.status === 'Hadir').length} Hadir
 </Badge>
 <Badge color="warning" size="sm">
 {presensiSiswaList.filter((s) => s.status === 'Izin').length} Izin
 </Badge>
 <Badge color="sky" size="sm">
 {presensiSiswaList.filter((s) => s.status === 'Sakit').length} Sakit
 </Badge>
 <Badge color="error" size="sm">
 {presensiSiswaList.filter((s) => s.status === 'Alpa').length} Alpa
 </Badge>
 </div>

 {/* Set Semua Hadir Squircle Button */}
 <div className="group relative inline-flex">
 <button
 type="button"
 aria-label="Set Semua Hadir"
 onClick={handleSetAllPresent}
 className="flex size-9 items-center justify-center rounded-lg bg-teal-100/90 text-teal-700 hover:text-white dark:bg-teal-950/60 dark:text-teal-300 dark: dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs border border-emerald-200/80 dark:border-emerald-800/60 h-9 px-4 text-sm font-medium"
 >
 <Check className="size-4.5 transition-colors" />
 </button>
 <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
 Set Semua Hadir
 </div>
 </div>
 </div>

 {/* Student Attendance List */}
 <div className="max-h-60 overflow-y-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {presensiSiswaList.length === 0 ? (
 <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
 Belum ada siswa terdaftar pada rombel / sesi kelas ini.
 </div>
 ) : (
 presensiSiswaList.map((siswa) => (
 <div key={siswa.id} className="flex items-center justify-between p-2.5 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30">
 <div className="flex items-center gap-3">
 <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
 {siswa.nama.charAt(0)}
 </div>
 <div>
 <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{siswa.nama}</p>
 <p className="text-[10px] text-slate-400 font-medium">NIS: {siswa.nis} | Gender: {siswa.gender}</p>
 </div>
 </div> <div className="flex items-center gap-1 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/80">
 {['Hadir', 'Izin', 'Sakit', 'Alpa'].map((st) => {
 const active = siswa.status === st
 const variantMap = {
 Hadir: active ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 dark:bg-sky-950/60 dark:text-sky-300',
 Izin: active ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-amber-50 dark:bg-sky-950/60 dark:text-sky-300',
 Sakit: active ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-sky-50 dark:bg-sky-950/60 dark:text-sky-300',
 Alpa: active ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-rose-50 dark:bg-sky-950/60 dark:text-sky-300',
 }
 return (
 <button
 key={st}
 type="button"
 onClick={() => handleUpdateStudentStatus(siswa.id, st)}
 className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all duration-200 ${variantMap[st]}`}
 >
 {st}
 </button>
 )
 })}
 </div>
 </div>
 ))
 )}
 </div>

 <div className="flex flex-col gap-1.5">
 <label htmlFor="presensi-catatan" className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
 Catatan / Keterangan Pertemuan
 </label>
 <textarea
 id="presensi-catatan"
 rows={2}
 value={presensiCatatan}
 onChange={(e) => setPresensiCatatan(e.target.value)}
 placeholder="Contoh: Pertemuan membahas bab 2. Ahmad izin mengikuti lomba sains."
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-800/80 dark:border-emerald-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium transition-all duration-300 ease-in-out focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20 dark:focus:border-[#10B981] dark:focus:ring-[#10B981]/30 focus:outline-none"
 />
 </div>
 </DialogBody>

 <DialogFooter className="mt-4 flex items-center justify-end gap-2.5">
 {/* Batal Squircle Button */}
 <div className="group relative inline-flex">
 <button
 type="button"
 aria-label="Batal"
 onClick={() => setQuickModal(null)}
 className="flex size-10 items-center justify-center rounded-xl bg-rose-100/90 text-rose-700 hover:bg-rose-600 hover:text-white dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-500 dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
 >
 <X className="size-5 transition-colors" />
 </button>
 <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
 Batal
 </div>
 </div>

 {/* Simpan Presensi Squircle Button */}
 <div className="group relative inline-flex">
 <button
 type="submit"
 aria-label="Simpan Presensi"
 className="flex size-10 items-center justify-center rounded-xl bg-emerald-100/90 text-emerald-700 hover:bg-emerald-600 hover:dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-500 dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
 >
 <CheckCircle2 className="size-5 transition-colors" />
 </button>
 <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
 Simpan Presensi
 </div>
 </div>
 </DialogFooter>
 </form>
 </Dialog>
 )}

 {/* 2. Modal Tambah Materi Pembelajaran */}
 {quickModal === 'materi' && (
 <Dialog
 isOpen={quickModal === 'materi'}
 onOpenChange={(open) => !open && setQuickModal(null)}
 className="w-full max-w-xl"
 >
 <DialogHeader>
 <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
 <FilePlus className="size-5 text-sky-600 dark:text-sky-400" />
 Tambah Materi Pembelajaran Baru
 </DialogTitle>
 <DialogDescription>
 Buat ringkasan modul, bahan ajar, atau bagikan tautan dokumen pembelajaran untuk siswa.
 </DialogDescription>
 </DialogHeader>

 <form onSubmit={handleSaveMateri}>
 <DialogBody className="space-y-4 py-2">
 <div className="flex flex-col gap-1.5">
 <label htmlFor="materi-kelas" className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
 Target Kelas & Mata Pelajaran <span className="text-rose-500">*</span>
 </label>
 <CustomSelect
 id="materi-kelas"
 value={materiKelasMapel}
 onChange={(e) => setMateriKelasMapel(e.target.value)}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-800/80 dark:border-emerald-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium transition-all duration-300 ease-in-out focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20 dark:focus:border-[#10B981] dark:focus:ring-[#10B981]/30 focus:outline-none"
 >
 <option value="">-- Pilih Target Kelas & Mapel --</option>
 {teacherClasses.length === 0 ? (
 <option value="" disabled>(Belum ada jadwal mengajar aktif)</option>
 ) : (
 teacherClasses.map((tc) => (
 <option key={tc} value={tc}>{tc}</option>
 ))
 )}
 </CustomSelect>
 </div>

 <div className="flex flex-col gap-1.5">
 <label htmlFor="materi-judul" className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
 Judul Materi Pembelajaran <span className="text-rose-500">*</span>
 </label>
 <input
 id="materi-judul"
 placeholder="Contoh: Modul 2 - Fungsi Kuadrat dan Penerapannya"
 value={materiJudul}
 onChange={(e) => setMateriJudul(e.target.value)}
 required
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-800/80 dark:border-emerald-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium transition-all duration-300 ease-in-out focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20 dark:focus:border-[#10B981] dark:focus:ring-[#10B981]/30 focus:outline-none"
 />
 </div>

 <div className="flex flex-col gap-1.5">
 <label htmlFor="materi-deskripsi" className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
 Ringkasan & Instruksi Materi
 </label>
 <textarea
 id="materi-deskripsi"
 rows={3}
 placeholder="Tuliskan pokok pembahasan, poin penting, atau petunjuk membaca modul..."
 value={materiDeskripsi}
 onChange={(e) => setMateriDeskripsi(e.target.value)}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-800/80 dark:border-emerald-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium transition-all duration-300 ease-in-out focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20 dark:focus:border-[#10B981] dark:focus:ring-[#10B981]/30 focus:outline-none"
 />
 </div>

 <div className="flex flex-col gap-1.5">
 <label htmlFor="materi-link" className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
 Tautan Dokumen / Modul PDF Lampiran
 </label>
 <input
 id="materi-link"
 placeholder="https://.../modul-pembelajaran.pdf atau link dokumen drive"
 value={materiAttachmentUrl}
 onChange={(e) => setMateriAttachmentUrl(e.target.value)}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-800/80 dark:border-emerald-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium transition-all duration-300 ease-in-out focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20 dark:focus:border-[#10B981] dark:focus:ring-[#10B981]/30 focus:outline-none"
 />
 </div>

 <div className="flex flex-col gap-1.5">
 <label htmlFor="materi-video" className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
 URL Video Pembelajaran (YouTube / Embed)
 </label>
 <input
 id="materi-video"
 placeholder="https://www.youtube.com/watch?v=... (otomatis di-embed)"
 value={materiVideoUrl}
 onChange={(e) => setMateriVideoUrl(e.target.value)}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-800/80 dark:border-emerald-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium transition-all duration-300 ease-in-out focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20 dark:focus:border-[#10B981] dark:focus:ring-[#10B981]/30 focus:outline-none"
 />
 </div>

 <div className="flex items-center gap-2 pt-1">
 <Checkbox
 id="publish-direct"
 checked={materiPublishDirectly}
 onChange={(e) => setMateriPublishDirectly(e.target.checked)}
 />
 <Label htmlFor="publish-direct" className="text-xs font-semibold cursor-pointer select-none">
 Langsung publikasikan materi ini ke dashboard siswa
 </Label>
 </div>
 </DialogBody>

 <DialogFooter className="mt-4 flex items-center justify-end gap-2.5">
 {/* Batal Squircle Button */}
 <div className="group relative inline-flex">
 <button
 type="button"
 aria-label="Batal"
 onClick={() => setQuickModal(null)}
 className="flex size-10 items-center justify-center rounded-xl bg-rose-100/90 text-rose-700 hover:bg-rose-600 hover:text-white dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-500 dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
 >
 <X className="size-5 transition-colors" />
 </button>
 <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
 Batal
 </div>
 </div>

 {/* Simpan & Bagikan Squircle Button */}
 <div className="group relative inline-flex">
 <button
 type="submit"
 aria-label="Simpan & Bagikan Materi"
 className="flex size-10 items-center justify-center rounded-xl bg-emerald-100/90 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-500 dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
 >
 <FilePlus className="size-5 transition-colors" />
 </button>
 <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
 Simpan & Bagikan Materi
 </div>
 </div>
 </DialogFooter>
 </form>
 </Dialog>
 )}

 {/* 3. Modal Buat Tugas Siswa */}
 {quickModal === 'penugasan' && (
 <Dialog
 isOpen={quickModal === 'penugasan'}
 onOpenChange={(open) => !open && setQuickModal(null)}
 className="w-full max-w-xl"
 >
 <DialogHeader>
 <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-600">
 <BookMarked className="size-5 text-purple-600 dark:text-purple-400" />
 Buat Tugas Pembelajaran Siswa
 </DialogTitle>
 <DialogDescription>
 Terbitkan penugasan baru lengkap dengan batas waktu, instruksi, dan skor maksimal.
 </DialogDescription>
 </DialogHeader>

 <form onSubmit={handleSaveTugas}>
 <DialogBody className="space-y-4 py-2">
 <div className="flex flex-col gap-1.5">
 <label htmlFor="tugas-kelas" className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
 Target Kelas & Mata Pelajaran <span className="text-rose-500">*</span>
 </label>
 <CustomSelect
 id="tugas-kelas"
 value={tugasKelasMapel}
 onChange={(e) => setTugasKelasMapel(e.target.value)}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-800/80 dark:border-emerald-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium transition-all duration-300 ease-in-out focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20 dark:focus:border-[#10B981] dark:focus:ring-[#10B981]/30 focus:outline-none"
 >
 <option value="">-- Pilih Target Kelas & Mapel --</option>
 {teacherClasses.length === 0 ? (
 <option value="" disabled>(Belum ada jadwal mengajar aktif)</option>
 ) : (
 teacherClasses.map((tc) => (
 <option key={tc} value={tc}>{tc}</option>
 ))
 )}
 </CustomSelect>
 </div>

 <div className="flex flex-col gap-1.5">
 <label htmlFor="tugas-judul" className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
 Judul Penugasan <span className="text-rose-500">*</span>
 </label>
 <input
 id="tugas-judul"
 placeholder="Contoh: Tugas Mandiri 1 - Latihan Soal Persamaan Kuadrat"
 value={tugasJudul}
 onChange={(e) => setTugasJudul(e.target.value)}
 required
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-800/80 dark:border-emerald-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium transition-all duration-300 ease-in-out focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20 dark:focus:border-[#10B981] dark:focus:ring-[#10B981]/30 focus:outline-none"
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="flex flex-col gap-1.5">
 <label htmlFor="tugas-deadline" className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
 Tenggat Waktu (Deadline)
 </label>
 <input
 id="tugas-deadline"
 type="datetime-local"
 value={tugasDeadline}
 onChange={(e) => setTugasDeadline(e.target.value)}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-800/80 dark:border-emerald-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium transition-all duration-300 ease-in-out focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20 dark:focus:border-[#10B981] dark:focus:ring-[#10B981]/30 focus:outline-none"
 />
 </div>

 <div className="flex flex-col gap-1.5">
 <label htmlFor="tugas-max-score" className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
 Nilai Maksimal
 </label>
 <input
 id="tugas-max-score"
 type="number"
 min={10}
 max={100}
 value={tugasMaxScore}
 onChange={(e) => setTugasMaxScore(Number(e.target.value))}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-800/80 dark:border-emerald-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium transition-all duration-300 ease-in-out focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20 dark:focus:border-[#10B981] dark:focus:ring-[#10B981]/30 focus:outline-none"
 />
 </div>
 </div>

 <div className="flex flex-col gap-1.5">
 <label htmlFor="tugas-instruksi" className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
 Instruksi Pengerjaan Tugas
 </label>
 <textarea
 id="tugas-instruksi"
 rows={3}
 placeholder="Kerjakan di buku latihan, foto hasilnya dan upload dalam format PDF atau gambar yang jelas..."
 value={tugasInstruksi}
 onChange={(e) => setTugasInstruksi(e.target.value)}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-800/80 dark:border-emerald-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium transition-all duration-300 ease-in-out focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20 dark:focus:border-[#10B981] dark:focus:ring-[#10B981]/30 focus:outline-none"
 />
 </div>

 <div className="flex items-center gap-2 pt-1">
 <Checkbox
 id="allow-late"
 checked={tugasAllowLate}
 onChange={(e) => setTugasAllowLate(e.target.checked)}
 />
 <Label htmlFor="allow-late" className="text-xs font-semibold cursor-pointer select-none">
 Izinkan siswa mengumpulkan tugas setelah melewati tenggat waktu
 </Label>
 </div>
 </DialogBody>

 <DialogFooter className="mt-4 flex items-center justify-end gap-2.5">
 {/* Batal Squircle Button */}
 <div className="group relative inline-flex">
 <button
 type="button"
 aria-label="Batal"
 onClick={() => setQuickModal(null)}
 className="flex size-10 items-center justify-center rounded-xl bg-rose-100/90 text-rose-700 hover:bg-rose-600 hover:text-white dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-500 dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
 >
 <X className="size-5 transition-colors" />
 </button>
 <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
 Batal
 </div>
 </div>

 {/* Terbitkan Tugas Squircle Button */}
 <div className="group relative inline-flex">
 <button
 type="submit"
 aria-label="Terbitkan Tugas"
 className="flex size-10 items-center justify-center rounded-xl bg-purple-100/90 text-purple-700 hover:bg-purple-600 hover:text-white dark:bg-purple-950/60 dark:text-purple-300 dark:hover:bg-purple-500 dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
 >
 <BookMarked className="size-5 transition-colors" />
 </button>
 <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
 Terbitkan Tugas
 </div>
 </div>
 </DialogFooter>
 </form>
 </Dialog>
 )}

 {/* 4. Modal Nilai Tugas Siswa */}
 {quickModal === 'pengumpulan-tugas' && (
 <Dialog
 isOpen={quickModal === 'pengumpulan-tugas'}
 onOpenChange={(open) => !open && setQuickModal(null)}
 className="w-full max-w-xl"
 >
 <DialogHeader>
 <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-600">
 <FileCheck className="size-5 text-amber-600 dark:text-amber-400" />
 Penilaian & Evaluasi Pengumpulan Tugas
 </DialogTitle>
 <DialogDescription>
 Periksa tugas yang telah dikumpulkan siswa dan berikan skor serta catatan perbaikan.
 </DialogDescription>
 </DialogHeader>

 <form onSubmit={handleSavePenilaian}>
 <DialogBody className="space-y-4 py-2">
 <div className="flex flex-col gap-1.5">
 <label htmlFor="pilih-tugas" className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
 Pilih Tugas yang Dinilai <span className="text-rose-500">*</span>
 </label>
 <CustomSelect
 id="pilih-tugas"
 value={selectedTugasId}
 onChange={(e) => setSelectedTugasId(e.target.value)}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-800/80 dark:border-emerald-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium transition-all duration-300 ease-in-out focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20 dark:focus:border-[#10B981] dark:focus:ring-[#10B981]/30 focus:outline-none"
 >
 <option value="">-- Pilih Tugas yang Dinilai --</option>
 <option value="" disabled>(Belum ada penugasan yang aktif)</option>
 </CustomSelect>
 </div>

 {/* Student Submissions List Table */}
 <div className="max-h-72 overflow-x-auto overflow-y-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
 <table className="w-full min-w-[500px] text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 <th className="px-3 py-2.5">Siswa</th>
 <th className="px-3 py-2.5">Status Submit</th>
 <th className="px-3 py-2.5 w-24">Skor (0-100)</th>
 <th className="px-3 py-2.5">Catatan Evaluasi Guru</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {penilaianSiswaList.length === 0 ? (
 <tr>
 <td colSpan={4} className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
 Belum ada pengumpulan tugas dari siswa.
 </td>
 </tr>
 ) : (
 penilaianSiswaList.map((item) => (
 <tr key={item.id} className="hover:bg-emerald-50/40 transition-colors dark:hover:bg-emerald-950/30">
 <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-100">
 {item.nama}
 <span className="block text-[10px] text-slate-400 font-normal">NIS: {item.nis}</span>
 </td>
 <td className="px-3 py-2">
 {item.status === 'Sudah Mengumpulkan' ? (
 <Badge color="success" size="sm">Sudah Submit</Badge>
 ) : (
 <Badge color="error" size="sm">Belum Submit</Badge>
 )}
 </td>
 <td className="px-3 py-2">
 <input
 type="number"
 min={0}
 max={100}
 value={item.nilai}
 disabled={item.status !== 'Sudah Mengumpulkan'}
 onChange={(e) => {
 const val = Number(e.target.value)
 setPenilaianSiswaList((prev) =>
 prev.map((s) => (s.id === item.id ? { ...s, nilai: val } : s))
 )
 }}
 className="w-full rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-800/80 dark:border-emerald-700/80 py-1 px-2 text-xs text-center font-extrabold transition-all duration-300 ease-in-out focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20 focus:outline-none disabled:opacity-50"
 />
 </td>
 <td className="px-3 py-2">
 <input
 placeholder="Catatan..."
 value={item.catatan}
 disabled={item.status !== 'Sudah Mengumpulkan'}
 onChange={(e) => {
 const val = e.target.value
 setPenilaianSiswaList((prev) =>
 prev.map((s) => (s.id === item.id ? { ...s, catatan: val } : s))
 )
 }}
 className="w-full rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-800/80 dark:border-emerald-700/80 py-1 px-2.5 text-xs transition-all duration-300 ease-in-out focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20 focus:outline-none disabled:opacity-50"
 />
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </DialogBody>

 <DialogFooter className="mt-4 flex items-center justify-end gap-2.5">
 {/* Batal Squircle Button */}
 <div className="group relative inline-flex">
 <button
 type="button"
 aria-label="Batal"
 onClick={() => setQuickModal(null)}
 className="flex size-10 items-center justify-center rounded-xl bg-rose-100/90 text-rose-700 hover:bg-rose-600 hover:text-white dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-500 dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
 >
 <X className="size-5 transition-colors" />
 </button>
 <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
 Batal
 </div>
 </div>

 {/* Simpan Penilaian Squircle Button */}
 <div className="group relative inline-flex">
 <button
 type="submit"
 aria-label="Simpan Penilaian"
 className="flex size-10 items-center justify-center rounded-xl bg-amber-100/90 text-amber-700 hover:bg-amber-600 hover:text-white dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
 >
 <FileCheck className="size-5 transition-colors" />
 </button>
 <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
 Simpan Penilaian
 </div>
 </div>
 </DialogFooter>
 </form>
 </Dialog>
 )}

 {/* 5. Modal Lihat Jadwal Mengajar */}
 {quickModal === 'jadwal' && (
 <Dialog
 isOpen={quickModal === 'jadwal'}
 onOpenChange={(open) => !open && setQuickModal(null)}
 className="w-full max-w-xl"
 >
 <DialogHeader>
 <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-600">
 <CalendarDays className="size-5 text-rose-600 dark:text-rose-400" />
 Jadwal Mengajar Pengajar Hari Ini
 </DialogTitle>
 <DialogDescription>
 Daftar sesi tatap muka pembelajaran, ruangan, dan kelas yang diampu hari ini.
 </DialogDescription>
 </DialogHeader>

 <DialogBody className="space-y-4 py-2">
 <div className="flex items-center gap-2">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-600 dark:text-emerald-400" />
 <input
 placeholder="Cari mata pelajaran, kelas, atau ruangan..."
 value={scheduleSearch}
 onChange={(e) => setScheduleSearch(e.target.value)}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-800/80 dark:border-emerald-700/80 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium transition-all duration-300 ease-in-out focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20 dark:focus:border-[#10B981] dark:focus:ring-[#10B981]/30 focus:outline-none"
 />
 </div>
 </div>

 {/* Schedule Cards List */}
 <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
 {schedulesToday.length === 0 ? (
 <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
 Tidak ada jadwal mengajar aktif hari ini.
 </div>
 ) : (
 schedulesToday
 .filter((sch) => {
 const mapel = sch.subject?.nama_mapel || sch.subject?.name || ''
 const kelas = sch.kelas?.nama_kelas || ''
 return mapel.toLowerCase().includes(scheduleSearch.toLowerCase()) || kelas.toLowerCase().includes(scheduleSearch.toLowerCase())
 })
 .map((sch) => (
 <div
 key={sch.id}
 className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 transition hover:border-[#059669]/40"
 >
 <div className="flex items-start gap-3">
 <div className="flex h-9 w-10 shrink-0 items-center justify-center rounded-lg bg-[#059669]/10 text-[#059669] dark:bg-[#059669]/20 dark:text-[#10B981]">
 <BookOpen className="size-5" />
 </div>
 <div>
 <h4 className="text-xs font-bold text-slate-900 dark:text-white">
 {sch.subject?.nama_mapel || sch.subject?.name || 'Mata Pelajaran'}
 </h4>
 <p className="text-xs text-slate-500 font-medium">
 Kelas: <span className="font-semibold text-slate-700 dark:text-slate-300">{sch.kelas?.nama_kelas || 'Kelas'}</span> | Ruang: {sch.room || sch.ruangan || 'Utama'}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-3 sm:justify-end">
 <Badge color="cyan" size="md">
 {sch.time_start || sch.jam_mulai || '07:30'} - {sch.time_end || sch.jam_selesai || '09:00'}
 </Badge>
 <div className="group relative inline-flex">
 <button
 type="button"
 aria-label="Input Presensi Class"
 onClick={() => {
 setPresensiJadwalId(String(sch.id))
 setQuickModal('presensi')
 }}
 className="flex size-9 items-center justify-center rounded-xl bg-emerald-100/90 text-emerald-700 hover:bg-emerald-600 hover:dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-500 dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
 >
 <CheckCircle2 className="size-4.5 transition-colors" />
 </button>
 <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
 Presensi Kelas Ini
 </div>
 </div>
 </div>
 </div>
 ))
 )}
 </div>
 </DialogBody>

 <DialogFooter className="mt-4 flex items-center justify-end">
 {/* Tutup Squircle Button */}
 <div className="group relative inline-flex">
 <button
 type="button"
 aria-label="Tutup"
 onClick={() => setQuickModal(null)}
 className="flex size-10 items-center justify-center rounded-xl bg-rose-100/90 text-rose-700 hover:bg-rose-600 hover:text-white dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-500 dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
 >
 <X className="size-5 transition-colors" />
 </button>
 <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
 Tutup
 </div>
 </div>
 </DialogFooter>
 </Dialog>
 )}

 {/* 6. Modal Catat Pelanggaran & Poin Disiplin Santri (Tahap 1) */}
 {quickModal === 'pelanggaran' && (
 <Dialog
 isOpen={quickModal === 'pelanggaran'}
 onOpenChange={(open) => !open && !pelanggaranSaving && setQuickModal(null)}
 className="w-full max-w-xl"
 >
 <DialogHeader>
 <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-emerald-600">
 <ShieldAlert className="size-5 text-rose-600 dark:text-rose-400" />
 Catat Pelanggaran & Poin Disiplin Santri
 </DialogTitle>
 <DialogDescription>
 Catatan kedisiplinan ini otomatis tercatat di Buku Poin Santri dan disinkronkan ke Catatan Siswa di Portal Orang Tua.
 </DialogDescription>
 </DialogHeader>

 <form onSubmit={handleSavePelanggaran}>
 <DialogBody className="space-y-4 py-2">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="flex flex-col gap-1.5">
 <label htmlFor="pelanggaran-jadwal" className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
 Pilih Kelas / Jadwal Pertemuan <span className="text-rose-500">*</span>
 </label>
 <CustomSelect
 id="pelanggaran-jadwal"
 disabled={pelanggaranSaving}
 value={pelanggaranJadwalId}
 onChange={(e) => {
 setPelanggaranJadwalId(e.target.value)
 loadStudentsForSchedule(e.target.value)
 }}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-800/80 dark:border-emerald-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium transition-all duration-300 ease-in-out focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 dark:focus:border-emerald-200/80 dark:border-emerald-800/60 dark:focus:ring-rose-400/30 focus:outline-none"
 >
 <option value="">-- Pilih Jadwal & Kelas --</option>
 {schedulesToday.map((sch) => (
 <option key={sch.id} value={sch.id}>
 {sch.subject?.nama_mapel || sch.subject?.name} - {sch.kelas?.nama_kelas || 'Kelas'}
 </option>
 ))}
 </CustomSelect>
 </div>

 <div className="flex flex-col gap-1.5">
 <label htmlFor="pelanggaran-student" className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
 Pilih Santri <span className="text-rose-500">*</span>
 </label>
 <CustomSelect
 id="pelanggaran-student"
 disabled={pelanggaranSaving || pelanggaranSiswaList.length === 0}
 value={pelanggaranStudentId}
 onChange={(e) => setPelanggaranStudentId(e.target.value)}
 required
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-800/80 dark:border-emerald-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium transition-all duration-300 ease-in-out focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 dark:focus:border-emerald-200/80 dark:border-emerald-800/60 dark:focus:ring-rose-400/30 focus:outline-none"
 >
 {pelanggaranSiswaList.length > 0 ? (
 pelanggaranSiswaList.map((st) => (
 <option key={st.id} value={st.id}>
 {st.full_name || st.name} ({st.nis || st.nisn || '-'})
 </option>
 ))
 ) : (
 <option value="" disabled>(Pilih jadwal kelas terlebih dahulu)</option>
 )}
 </CustomSelect>
 </div>
 </div>

 <div className="flex flex-col gap-1.5">
 <label htmlFor="pelanggaran-kategori" className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
 Kategori Pelanggaran <span className="text-rose-500">*</span>
 </label>
 <CustomSelect
 id="pelanggaran-kategori"
 disabled={pelanggaranSaving}
 value={pelanggaranKategoriId}
 onChange={(e) => handlePelanggaranCategoryChange(e.target.value)}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-800/80 dark:border-emerald-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium transition-all duration-300 ease-in-out focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 dark:focus:border-emerald-200/80 dark:border-emerald-800/60 dark:focus:ring-rose-400/30 focus:outline-none"
 >
 {disciplineCategories.map((cat) => (
 <option key={cat.id} value={cat.id}>
 [{cat.code || 'VIO'}] {cat.name} ({cat.point_weight || -5} poin) - Level {cat.level || 'ringan'}
 </option>
 ))}
 </CustomSelect>
 </div>

 <div className="flex flex-col gap-1.5">
 <div className="flex items-center justify-between">
 <label htmlFor="pelanggaran-poin" className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
 Bobot Poin Pengurangan <span className="text-rose-500">*</span>
 </label>
 <span className="text-[10px] text-rose-600 font-bold dark:text-rose-400">
 Mengurangi total poin santri
 </span>
 </div>
 <div className="relative">
 <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-rose-600">-</span>
 <input
 id="pelanggaran-poin"
 type="number"
 min={1}
 max={100}
 disabled={pelanggaranSaving}
 value={pelanggaranPoin}
 onChange={(e) => setPelanggaranPoin(Math.max(1, parseInt(e.target.value || '1', 10)))}
 className="w-full pl-7 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-800/80 dark:border-emerald-700/80 px-3.5 py-2.5 text-xs font-black text-slate-900 dark:text-slate-100 transition-all duration-300 ease-in-out focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 dark:focus:border-emerald-200/80 dark:border-emerald-800/60 dark:focus:ring-rose-400/30 focus:outline-none"
 />
 </div>
 </div>

 <div className="flex flex-col gap-1.5">
 <label htmlFor="pelanggaran-deskripsi" className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
 Kronologi / Catatan Kejadian <span className="text-rose-500">*</span>
 </label>
 <textarea
 id="pelanggaran-deskripsi"
 rows={3}
 disabled={pelanggaranSaving}
 value={pelanggaranDeskripsi}
 onChange={(e) => setPelanggaranDeskripsi(e.target.value)}
 placeholder="Tuliskan catatan detail kronologi pelanggaran saat jam pelajaran..."
 required
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-800/80 dark:border-emerald-700/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium transition-all duration-300 ease-in-out focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 dark:focus:border-emerald-200/80 dark:border-emerald-800/60 dark:focus:ring-rose-400/30 focus:outline-none resize-none"
 />
 </div>

 <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-emerald-200/80 dark:border-emerald-800/60">
 <input
 type="checkbox"
 id="pelanggaranRujukBk"
 disabled={pelanggaranSaving}
 checked={pelanggaranRujukBk}
 onChange={(e) => setPelanggaranRujukBk(e.target.checked)}
 className="size-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
 />
 <label htmlFor="pelanggaranRujukBk" className="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
 Rujuk kasus ini langsung ke Guru BK / Wali Kelas
 </label>
 </div>

 <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-emerald-800/60 flex items-start gap-2">
 <AlertCircle className="size-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
 <div>
 <p className="font-bold">Transparan ke Orang Tua</p>
 <p className="text-xs text-rose-800 dark:text-rose-300">
 Catatan pelanggaran ini akan langsung muncul di <b>Portal Orang Tua (Web & Mobile App)</b> dan riwayat pembinaan santri.
 </p>
 </div>
 </div>
 </DialogBody>

 <DialogFooter className="mt-4 flex items-center justify-end gap-2.5">
 <Button
 type="button"
 variant="ghost"
 disabled={pelanggaranSaving}
 onClick={() => setQuickModal(null)}
 className="rounded-xl px-4 py-2 text-xs font-bold"
 >
 Batal
 </Button>
 <Button
 type="submit"
 disabled={pelanggaranSaving}
 className="rounded-xl px-5 py-2 text-xs font-extrabold bg-white dark:bg-[#1B2433] hover:from-rose-700 hover:to-red-700 shadow-sm active:scale-95"
 >
 <ShieldAlert className="size-4 mr-1.5" />
 {pelanggaranSaving ? 'Menyimpan...' : 'Simpan Pelanggaran'}
 </Button>
 </DialogFooter>
 </form>
 </Dialog>
 )}
 </div>
 </PageContainer>
 )
}

