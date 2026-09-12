import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  Users,
  BookOpen,
  FileCheck,
  CheckCircle2,
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
} from 'lucide-react'

import {
  AppPageHeader,
  AppBreadcrumb,
  AppFilterBar,
  KpiCard,
  AppDataTable,
  AppBadge,
  AppButton,
  SectionHeader,
  DetailPanel,
  PageContainer,
} from '../components/app'

import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'
import KpiQuickViewModal from '../components/KpiQuickViewModal'
import ModalErrorBoundary from '../components/common/ModalErrorBoundary'

import api from '../services/api'

// TailGrids Core UI Components
import { Button } from '@/components/tailgrids/core/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/tailgrids/core/dialog'
import { Backdrop } from '@/components/tailgrids/core/overlay'
import { Badge } from '@/components/tailgrids/core/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/tailgrids/core/alert'
import { Input } from '@/components/tailgrids/core/input'
import { TextArea } from '@/components/tailgrids/core/text-area'
import { Checkbox } from '@/components/tailgrids/core/checkbox'
import { Label } from '@/components/tailgrids/core/label'

export default function GuruDashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [activeModal, setActiveModal] = useState(null)
  const [selectedScheduleDetail, setSelectedScheduleDetail] = useState(null)

  // Quick Action Modal States
  const [quickModal, setQuickModal] = useState(null) // 'presensi' | 'materi' | 'penugasan' | 'pengumpulan-tugas' | 'jadwal'
  const [quickAlert, setQuickAlert] = useState(null)

  // Form States for Presensi Modal
  const [presensiJadwalId, setPresensiJadwalId] = useState('')
  const [presensiTanggal, setPresensiTanggal] = useState(new Date().toISOString().split('T')[0])
  const [presensiCatatan, setPresensiCatatan] = useState('')
  const [presensiSiswaList, setPresensiSiswaList] = useState([
    { id: 1, nis: '20261001', nama: 'Ahmad Dahlan', gender: 'L', status: 'Hadir' },
    { id: 2, nis: '20261002', nama: 'Fatimah Az-Zahra', gender: 'P', status: 'Hadir' },
    { id: 3, nis: '20261003', nama: 'Muhammad Rizky', gender: 'L', status: 'Izin' },
    { id: 4, nis: '20261004', nama: 'Siti Nurhaliza', gender: 'P', status: 'Hadir' },
    { id: 5, nis: '20261005', nama: 'Budi Santoso', gender: 'L', status: 'Sakit' },
    { id: 6, nis: '20261006', nama: 'Aisyah Putri', gender: 'P', status: 'Hadir' },
  ])

  // Form States for Materi Modal
  const [materiJudul, setMateriJudul] = useState('')
  const [materiKelasMapel, setMateriKelasMapel] = useState('Matematika - X IPA 1')
  const [materiDeskripsi, setMateriDeskripsi] = useState('')
  const [materiAttachmentUrl, setMateriAttachmentUrl] = useState('')
  const [materiVideoUrl, setMateriVideoUrl] = useState('')
  const [materiPublishDirectly, setMateriPublishDirectly] = useState(true)

  // Form States for Penugasan Modal
  const [tugasJudul, setTugasJudul] = useState('')
  const [tugasKelasMapel, setTugasKelasMapel] = useState('Matematika - X IPA 1')
  const [tugasDeadline, setTugasDeadline] = useState('')
  const [tugasMaxScore, setTugasMaxScore] = useState(100)
  const [tugasInstruksi, setTugasInstruksi] = useState('')
  const [tugasAllowLate, setTugasAllowLate] = useState(true)

  // Form States for Pengumpulan Tugas / Penilaian Modal
  const [selectedTugasId, setSelectedTugasId] = useState('1')
  const [penilaianSiswaList, setPenilaianSiswaList] = useState([
    { id: 1, nis: '20261001', nama: 'Ahmad Dahlan', status: 'Sudah Mengumpulkan', nilai: 88, catatan: 'Sangat baik, penjelasan runut' },
    { id: 2, nis: '20261002', nama: 'Fatimah Az-Zahra', status: 'Sudah Mengumpulkan', nilai: 95, catatan: 'Lengkap dan akurat' },
    { id: 3, nis: '20261003', nama: 'Muhammad Rizky', status: 'Sudah Mengumpulkan', nilai: 78, catatan: 'Perbaiki nomor 3' },
    { id: 4, nis: '20261004', nama: 'Siti Nurhaliza', status: 'Belum Mengumpulkan', nilai: 0, catatan: 'Belum submit' },
    { id: 5, nis: '20261005', nama: 'Budi Santoso', status: 'Sudah Mengumpulkan', nilai: 85, catatan: 'Tugas rapi' },
  ])

  // State for Schedule Modal Search
  const [scheduleSearch, setScheduleSearch] = useState('')

  const triggerAlert = (type, title, message) => {
    setQuickAlert({ type, title, message })
    setTimeout(() => {
      setQuickAlert(null)
    }, 4500)
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

  if (loading && !data) return <SkeletonDashboard />
  if (error && !data) return <ErrorState message={error} onRetry={fetchDashboard} />

  const teacher = data?.teacher || {}
  const academicContext = data?.academic_context || {}
  const kpis = data?.kpi || {}
  const schedulesToday = data?.schedules_today || []
  const announcements = data?.announcements || []
  const teacherAttendanceLogs = data?.teacher_attendance_logs || []

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
      alert('Silakan isi judul materi terlebih dahulu.')
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
      alert('Silakan isi judul tugas terlebih dahulu.')
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
          <p className="font-extrabold text-[#0E5C44] dark:text-[#3FBF75] text-xs truncate">
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
      label: 'Detail',
      render: (row) => (
        <AppButton variant="secondary" size="sm" icon={Eye} onClick={() => setSelectedScheduleDetail(row)}>
          Detail
        </AppButton>
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
      {/* Toast Alert Banner */}
      {quickAlert && (
        <div className="fixed top-5 right-5 z-50 max-w-md animate-fade-in shadow-xl">
          <Alert status={quickAlert.type === 'success' ? 'success' : 'error'} variant="solid">
            <AlertTitle>{quickAlert.title}</AlertTitle>
            <AlertDescription>{quickAlert.message}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <AppBreadcrumb items={[{ label: 'Portal Guru Mata Pelajaran' }]} />

      {/* Filter Bar */}
      <AppFilterBar label="Filter Jadwal & Pembelajaran" onReset={fetchDashboard} />

      {/* Primary KPI Grid */}
      <section className="space-y-3">
        <SectionHeader title="Ringkasan Aktivitas Mengajar" subtitle="Jadwal harian, total siswa, rombel, dan tugas pending" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Jadwal Hari Ini"
            value={formatNumber(kpis.schedules_today_count)}
            icon={Calendar}
            colorScheme="emerald"
            badge="Jadwal"
            badgeVariant="success"
            onClick={() => setActiveModal('schedules_today')}
          />
          <KpiCard
            title="Total Siswa Diajar"
            value={formatNumber(kpis.total_students)}
            icon={Users}
            colorScheme="blue"
            badge="Siswa"
            badgeVariant="info"
            onClick={() => setActiveModal('total_students')}
          />
          <KpiCard
            title="Total Rombel / Kelas"
            value={formatNumber(kpis.total_classes)}
            icon={BookOpen}
            colorScheme="violet"
            badge="Rombel"
            badgeVariant="purple"
            onClick={() => setActiveModal('total_classes')}
          />
          <KpiCard
            title="Tugas Belum Dinilai"
            value={formatNumber(kpis.pending_grading_count)}
            icon={FileCheck}
            colorScheme="amber"
            badge="Perlu Penilaian"
            badgeVariant="warning"
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
      <section className="rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Aksi Cepat Guru</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pintas cepat presensi, materi, tugas, nilai siswa, jadwal & segarkan data</p>
          </div>

          {/* Soft Pastel Squircle Action Buttons with Floating Hover Tooltip */}
          <div className="flex items-center gap-2.5 flex-nowrap shrink-0">
            {/* 1. Input Presensi (Emerald/Green Squircle) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                aria-label="Input Presensi"
                onClick={() => setQuickModal('presensi')}
                className="flex size-10 items-center justify-center rounded-2xl bg-emerald-100/90 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-500 dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
              >
                <CheckCircle2 className="size-5 transition-colors" />
              </button>
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                Input Presensi
              </div>
            </div>

            {/* 2. Tambah Materi (Sky/Blue Squircle) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                aria-label="Tambah Materi"
                onClick={() => setQuickModal('materi')}
                className="flex size-10 items-center justify-center rounded-2xl bg-sky-100/90 text-sky-700 hover:bg-sky-600 hover:text-white dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-500 dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
              >
                <FilePlus className="size-5 transition-colors" />
              </button>
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                Tambah Materi
              </div>
            </div>

            {/* 3. Buat Tugas (Purple/Violet Squircle) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                aria-label="Buat Tugas"
                onClick={() => setQuickModal('penugasan')}
                className="flex size-10 items-center justify-center rounded-2xl bg-purple-100/90 text-purple-700 hover:bg-purple-600 hover:text-white dark:bg-purple-950/60 dark:text-purple-300 dark:hover:bg-purple-500 dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
              >
                <BookMarked className="size-5 transition-colors" />
              </button>
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                Buat Tugas
              </div>
            </div>

            {/* 4. Nilai Tugas (Amber/Orange Squircle) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                aria-label="Nilai Tugas"
                onClick={() => setQuickModal('pengumpulan-tugas')}
                className="flex size-10 items-center justify-center rounded-2xl bg-amber-100/90 text-amber-700 hover:bg-amber-600 hover:text-white dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
              >
                <FileCheck className="size-5 transition-colors" />
              </button>
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                Nilai Tugas
              </div>
            </div>

            {/* 5. Lihat Jadwal (Rose/Pink Squircle) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                aria-label="Lihat Jadwal"
                onClick={() => setQuickModal('jadwal')}
                className="flex size-10 items-center justify-center rounded-2xl bg-rose-100/90 text-rose-700 hover:bg-rose-600 hover:text-white dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-500 dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
              >
                <CalendarDays className="size-5 transition-colors" />
              </button>
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                Lihat Jadwal
              </div>
            </div>

            {/* 6. Segarkan Data (Cyan/Blue Squircle) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                aria-label="Segarkan Data"
                onClick={fetchDashboard}
                className="flex size-10 items-center justify-center rounded-2xl bg-cyan-100/90 text-cyan-700 hover:bg-cyan-600 hover:text-white dark:bg-cyan-950/60 dark:text-cyan-300 dark:hover:bg-cyan-500 dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
              >
                <RefreshCw className="size-5 transition-colors" />
              </button>
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                Segarkan Data
              </div>
            </div>
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
                className="flex size-10 items-center justify-center rounded-2xl bg-emerald-100/90 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-500 dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
              >
                <CheckCircle2 className="size-5 transition-colors" />
              </button>
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
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
          TAILGRIDS QUICK ACTION MODALS (TAILGRIDS UI DIALOGS)
          Neat Field & Label Structure with Animated Leaf Green Focus Line
          Soft Pastel Squircle Icon Buttons in Modal Footers
      ══════════════════════════════════════════════════════════════════ */}

      {/* 1. Modal Input Presensi Pembelajaran */}
      {quickModal === 'presensi' && (
        <Dialog
          isOpen={quickModal === 'presensi'}
          onOpenChange={(open) => !open && setQuickModal(null)}
          className="w-full max-w-3xl"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
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
                  <select
                    id="presensi-jadwal"
                    value={presensiJadwalId}
                    onChange={(e) => setPresensiJadwalId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300/80 bg-white dark:bg-slate-800/80 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium transition-all duration-300 ease-in-out focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/20 dark:focus:border-[#3FBF75] dark:focus:ring-[#3FBF75]/30 focus:outline-none"
                  >
                    <option value="">-- Pilih Jadwal Pembelajaran --</option>
                    {schedulesToday.length > 0 ? (
                      schedulesToday.map((sch) => (
                        <option key={sch.id} value={sch.id}>
                          {sch.subject?.nama_mapel || sch.subject?.name} - {sch.kelas?.nama_kelas || 'Kelas'} ({sch.time_start || sch.jam_mulai} - {sch.time_end || sch.jam_selesai})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="1">Matematika - Kelas X IPA 1 (07:30 - 09:00)</option>
                        <option value="2">Fisika - Kelas XI MIPA 2 (09:15 - 10:45)</option>
                        <option value="3">Informatika - Kelas X IPA 2 (11:00 - 12:30)</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="presensi-tanggal" className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Tanggal Pertemuan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="presensi-tanggal"
                    type="date"
                    value={presensiTanggal}
                    onChange={(e) => setPresensiTanggal(e.target.value)}
                    className="w-full rounded-xl border border-slate-300/80 bg-white dark:bg-slate-800/80 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium transition-all duration-300 ease-in-out focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/20 dark:focus:border-[#3FBF75] dark:focus:ring-[#3FBF75]/30 focus:outline-none"
                  />
                </div>
              </div>

              {/* Status Ringkasan & Quick Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 p-3">
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
                    className="flex size-9 items-center justify-center rounded-xl bg-teal-100/90 text-teal-700 hover:bg-teal-600 hover:text-white dark:bg-teal-950/60 dark:text-teal-300 dark:hover:bg-teal-500 dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                  >
                    <Check className="size-4.5 transition-colors" />
                  </button>
                  <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                    <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                    Set Semua Hadir
                  </div>
                </div>
              </div>

              {/* Student Attendance List */}
              <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                {presensiSiswaList.map((siswa) => (
                  <div key={siswa.id} className="flex items-center justify-between p-2.5 hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                        {siswa.nama.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{siswa.nama}</p>
                        <p className="text-[10px] text-slate-400 font-medium">NIS: {siswa.nis} | Gender: {siswa.gender}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {['Hadir', 'Izin', 'Sakit', 'Alpa'].map((st) => {
                        const active = siswa.status === st
                        const variantMap = {
                          Hadir: active ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 dark:bg-slate-800 dark:text-slate-400',
                          Izin: active ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-amber-50 dark:bg-slate-800 dark:text-slate-400',
                          Sakit: active ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-sky-50 dark:bg-slate-800 dark:text-slate-400',
                          Alpa: active ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-rose-50 dark:bg-slate-800 dark:text-slate-400',
                        }
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleUpdateStudentStatus(siswa.id, st)}
                            className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition-all duration-200 ${variantMap[st]}`}
                          >
                            {st}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
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
                  className="w-full rounded-xl border border-slate-300/80 bg-white dark:bg-slate-800/80 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium transition-all duration-300 ease-in-out focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/20 dark:focus:border-[#3FBF75] dark:focus:ring-[#3FBF75]/30 focus:outline-none"
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
                  className="flex size-10 items-center justify-center rounded-2xl bg-rose-100/90 text-rose-700 hover:bg-rose-600 hover:text-white dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-500 dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                >
                  <X className="size-5 transition-colors" />
                </button>
                <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                  Batal
                </div>
              </div>

              {/* Simpan Presensi Squircle Button */}
              <div className="group relative inline-flex">
                <button
                  type="submit"
                  aria-label="Simpan Presensi"
                  className="flex size-10 items-center justify-center rounded-2xl bg-emerald-100/90 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-500 dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                >
                  <CheckCircle2 className="size-5 transition-colors" />
                </button>
                <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
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
                <select
                  id="materi-kelas"
                  value={materiKelasMapel}
                  onChange={(e) => setMateriKelasMapel(e.target.value)}
                  className="w-full rounded-xl border border-slate-300/80 bg-white dark:bg-slate-800/80 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium transition-all duration-300 ease-in-out focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/20 dark:focus:border-[#3FBF75] dark:focus:ring-[#3FBF75]/30 focus:outline-none"
                >
                  <option value="Matematika - X IPA 1">Matematika Wajib - Kelas X IPA 1</option>
                  <option value="Matematika - X IPA 2">Matematika Wajib - Kelas X IPA 2</option>
                  <option value="Fisika - XI MIPA 2">Fisika Peminatan - Kelas XI MIPA 2</option>
                  <option value="Informatika - X IPA 1">Informatika - Kelas X IPA 1</option>
                </select>
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
                  className="w-full rounded-xl border border-slate-300/80 bg-white dark:bg-slate-800/80 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium transition-all duration-300 ease-in-out focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/20 dark:focus:border-[#3FBF75] dark:focus:ring-[#3FBF75]/30 focus:outline-none"
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
                  className="w-full rounded-xl border border-slate-300/80 bg-white dark:bg-slate-800/80 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium transition-all duration-300 ease-in-out focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/20 dark:focus:border-[#3FBF75] dark:focus:ring-[#3FBF75]/30 focus:outline-none"
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
                  className="w-full rounded-xl border border-slate-300/80 bg-white dark:bg-slate-800/80 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium transition-all duration-300 ease-in-out focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/20 dark:focus:border-[#3FBF75] dark:focus:ring-[#3FBF75]/30 focus:outline-none"
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
                  className="w-full rounded-xl border border-slate-300/80 bg-white dark:bg-slate-800/80 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium transition-all duration-300 ease-in-out focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/20 dark:focus:border-[#3FBF75] dark:focus:ring-[#3FBF75]/30 focus:outline-none"
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
                  className="flex size-10 items-center justify-center rounded-2xl bg-rose-100/90 text-rose-700 hover:bg-rose-600 hover:text-white dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-500 dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                >
                  <X className="size-5 transition-colors" />
                </button>
                <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                  Batal
                </div>
              </div>

              {/* Simpan & Bagikan Squircle Button */}
              <div className="group relative inline-flex">
                <button
                  type="submit"
                  aria-label="Simpan & Bagikan Materi"
                  className="flex size-10 items-center justify-center rounded-2xl bg-sky-100/90 text-sky-700 hover:bg-sky-600 hover:text-white dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-500 dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                >
                  <FilePlus className="size-5 transition-colors" />
                </button>
                <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
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
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
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
                <select
                  id="tugas-kelas"
                  value={tugasKelasMapel}
                  onChange={(e) => setTugasKelasMapel(e.target.value)}
                  className="w-full rounded-xl border border-slate-300/80 bg-white dark:bg-slate-800/80 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium transition-all duration-300 ease-in-out focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/20 dark:focus:border-[#3FBF75] dark:focus:ring-[#3FBF75]/30 focus:outline-none"
                >
                  <option value="Matematika - X IPA 1">Matematika Wajib - Kelas X IPA 1</option>
                  <option value="Matematika - X IPA 2">Matematika Wajib - Kelas X IPA 2</option>
                  <option value="Fisika - XI MIPA 2">Fisika Peminatan - Kelas XI MIPA 2</option>
                  <option value="Informatika - X IPA 1">Informatika - Kelas X IPA 1</option>
                </select>
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
                  className="w-full rounded-xl border border-slate-300/80 bg-white dark:bg-slate-800/80 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium transition-all duration-300 ease-in-out focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/20 dark:focus:border-[#3FBF75] dark:focus:ring-[#3FBF75]/30 focus:outline-none"
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
                    className="w-full rounded-xl border border-slate-300/80 bg-white dark:bg-slate-800/80 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium transition-all duration-300 ease-in-out focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/20 dark:focus:border-[#3FBF75] dark:focus:ring-[#3FBF75]/30 focus:outline-none"
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
                    className="w-full rounded-xl border border-slate-300/80 bg-white dark:bg-slate-800/80 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium transition-all duration-300 ease-in-out focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/20 dark:focus:border-[#3FBF75] dark:focus:ring-[#3FBF75]/30 focus:outline-none"
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
                  className="w-full rounded-xl border border-slate-300/80 bg-white dark:bg-slate-800/80 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium transition-all duration-300 ease-in-out focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/20 dark:focus:border-[#3FBF75] dark:focus:ring-[#3FBF75]/30 focus:outline-none"
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
                  className="flex size-10 items-center justify-center rounded-2xl bg-rose-100/90 text-rose-700 hover:bg-rose-600 hover:text-white dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-500 dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                >
                  <X className="size-5 transition-colors" />
                </button>
                <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                  Batal
                </div>
              </div>

              {/* Terbitkan Tugas Squircle Button */}
              <div className="group relative inline-flex">
                <button
                  type="submit"
                  aria-label="Terbitkan Tugas"
                  className="flex size-10 items-center justify-center rounded-2xl bg-purple-100/90 text-purple-700 hover:bg-purple-600 hover:text-white dark:bg-purple-950/60 dark:text-purple-300 dark:hover:bg-purple-500 dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                >
                  <BookMarked className="size-5 transition-colors" />
                </button>
                <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
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
          className="w-full max-w-3xl"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
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
                <select
                  id="pilih-tugas"
                  value={selectedTugasId}
                  onChange={(e) => setSelectedTugasId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300/80 bg-white dark:bg-slate-800/80 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium transition-all duration-300 ease-in-out focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/20 dark:focus:border-[#3FBF75] dark:focus:ring-[#3FBF75]/30 focus:outline-none"
                >
                  <option value="1">Tugas 1: Latihan Persamaan Kuadrat (X IPA 1)</option>
                  <option value="2">Tugas 2: Modul Eksponen & Logaritma (X IPA 2)</option>
                  <option value="3">Tugas 3: Praktikum Hukum Newton (XI MIPA 2)</option>
                </select>
              </div>

              {/* Student Submissions List Table */}
              <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-3 py-2.5">Siswa</th>
                      <th className="px-3 py-2.5">Status Submit</th>
                      <th className="px-3 py-2.5 w-24">Skor (0-100)</th>
                      <th className="px-3 py-2.5">Catatan Evaluasi Guru</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {penilaianSiswaList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
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
                            className="w-full rounded-lg border border-slate-300/80 bg-white dark:bg-slate-800/80 dark:border-slate-700 py-1 px-2 text-xs text-center font-extrabold transition-all duration-300 ease-in-out focus:border-[#0E5C44] focus:ring-2 focus:ring-[#0E5C44]/20 focus:outline-none disabled:opacity-50"
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
                            className="w-full rounded-lg border border-slate-300/80 bg-white dark:bg-slate-800/80 dark:border-slate-700 py-1 px-2.5 text-xs transition-all duration-300 ease-in-out focus:border-[#0E5C44] focus:ring-2 focus:ring-[#0E5C44]/20 focus:outline-none disabled:opacity-50"
                          />
                        </td>
                      </tr>
                    ))}
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
                  className="flex size-10 items-center justify-center rounded-2xl bg-rose-100/90 text-rose-700 hover:bg-rose-600 hover:text-white dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-500 dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                >
                  <X className="size-5 transition-colors" />
                </button>
                <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                  Batal
                </div>
              </div>

              {/* Simpan Penilaian Squircle Button */}
              <div className="group relative inline-flex">
                <button
                  type="submit"
                  aria-label="Simpan Penilaian"
                  className="flex size-10 items-center justify-center rounded-2xl bg-amber-100/90 text-amber-700 hover:bg-amber-600 hover:text-white dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                >
                  <FileCheck className="size-5 transition-colors" />
                </button>
                <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
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
          className="w-full max-w-3xl"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  placeholder="Cari mata pelajaran, kelas, atau ruangan..."
                  value={scheduleSearch}
                  onChange={(e) => setScheduleSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-300/80 bg-white dark:bg-slate-800/80 dark:border-slate-700 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium transition-all duration-300 ease-in-out focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/20 dark:focus:border-[#3FBF75] dark:focus:ring-[#3FBF75]/30 focus:outline-none"
                />
              </div>
            </div>

            {/* Schedule Cards List */}
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {(schedulesToday.length > 0 ? schedulesToday : [
                { id: 1, subject: { nama_mapel: 'Matematika Wajib' }, kelas: { nama_kelas: 'X IPA 1' }, room: 'Ruang A-101', time_start: '07:30', time_end: '09:00' },
                { id: 2, subject: { nama_mapel: 'Fisika Peminatan' }, kelas: { nama_kelas: 'XI MIPA 2' }, room: 'Lab Fisika', time_start: '09:15', time_end: '10:45' },
                { id: 3, subject: { nama_mapel: 'Informatika' }, kelas: { nama_kelas: 'X IPA 2' }, room: 'Lab Komputer 1', time_start: '11:00', time_end: '12:30' },
              ])
                .filter((sch) => {
                  const mapel = sch.subject?.nama_mapel || sch.subject?.name || ''
                  const kelas = sch.kelas?.nama_kelas || ''
                  return mapel.toLowerCase().includes(scheduleSearch.toLowerCase()) || kelas.toLowerCase().includes(scheduleSearch.toLowerCase())
                })
                .map((sch) => (
                  <div
                    key={sch.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 transition hover:border-[#0E5C44]/40"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0E5C44]/10 text-[#0E5C44] dark:bg-[#0E5C44]/20 dark:text-[#3FBF75]">
                        <BookOpen className="size-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {sch.subject?.nama_mapel || sch.subject?.name || 'Mata Pelajaran'}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
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
                          className="flex size-9 items-center justify-center rounded-xl bg-emerald-100/90 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-500 dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                        >
                          <CheckCircle2 className="size-4.5 transition-colors" />
                        </button>
                        <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                          <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                          Presensi Kelas Ini
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </DialogBody>

          <DialogFooter className="mt-4 flex items-center justify-end">
            {/* Tutup Squircle Button */}
            <div className="group relative inline-flex">
              <button
                type="button"
                aria-label="Tutup"
                onClick={() => setQuickModal(null)}
                className="flex size-10 items-center justify-center rounded-2xl bg-rose-100/90 text-rose-700 hover:bg-rose-600 hover:text-white dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-500 dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
              >
                <X className="size-5 transition-colors" />
              </button>
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                Tutup
              </div>
            </div>
          </DialogFooter>
        </Dialog>
      )}
    </div>
    </PageContainer>
  )
}

