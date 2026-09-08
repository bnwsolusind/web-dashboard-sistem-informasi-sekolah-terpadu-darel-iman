import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertCircle,
  Award,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  FileText,
  HeartPulse,
  Plus,
  Printer,
  Search,
  ShieldAlert,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { lmsPresensiService } from '../../services/lmsPresensiService'
import { kelasService } from '../../services/kelasService'
import { employeeService } from '../../services/employeeService'
import { useAuthStore } from '../../stores/authStore'
import { hasAnyRole } from '../../auth/portalResolver'
import AppBreadcrumb from '../../components/app/AppBreadcrumb'
import AppBadge from '../../components/app/AppBadge'
import AppSkeleton from '../../components/app/AppSkeleton'
import { TableBody, TableCell, TableHead, TableHeader, TableRoot, TableRow } from '@/components/tailgrids/core/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/tailgrids/core/avatar'
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

// ── Soft Pastel Color Mappings ───────────────────────────────────────────────
const UNIT_BADGE_STYLES = {
  TKIT: 'bg-emerald-100/90 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/80',
  TAUD: 'bg-emerald-100/90 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/80',
  SDIT: 'bg-sky-100/90 text-sky-800 border border-sky-200/80 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-800/80',
  SMPIT: 'bg-indigo-100/90 text-indigo-800 border border-indigo-200/80 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800/80',
  SMAIT: 'bg-violet-100/90 text-violet-800 border border-violet-200/80 dark:bg-violet-950/80 dark:text-violet-300 dark:border-violet-800/80',
  PONPES: 'bg-amber-100/90 text-amber-800 border border-amber-200/80 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800/80',
  MAHAD: 'bg-amber-100/90 text-amber-800 border border-amber-200/80 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800/80',
}

const DEFAULT_TEACHERS = []

function getUnitBadgeStyle(unitName = '') {
  const str = String(unitName).toUpperCase()
  const key = Object.keys(UNIT_BADGE_STYLES).find((k) => str.includes(k))
  return UNIT_BADGE_STYLES[key] || 'bg-emerald-100/90 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/80'
}

const SUBJECT_COLORS = [
  'bg-sky-50 text-sky-700 border border-sky-200/70 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/60',
  'bg-emerald-50 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
  'bg-indigo-50 text-indigo-700 border border-indigo-200/70 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60',
  'bg-violet-50 text-violet-700 border border-violet-200/70 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800/60',
  'bg-amber-50 text-amber-700 border border-amber-200/70 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
  'bg-rose-50 text-rose-700 border border-rose-200/70 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
  'bg-cyan-50 text-cyan-700 border border-cyan-200/70 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800/60',
]

function getSubjectBadgeStyle(subjectName = '', idx = 0) {
  let hash = 0
  const str = String(subjectName)
  for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i)
  const colorIdx = (hash + idx) % SUBJECT_COLORS.length
  return SUBJECT_COLORS[colorIdx]
}

function extractCollection(response) {
  const payload = response?.data ?? response
  if (Array.isArray(payload)) return payload
  return Array.isArray(payload?.data) ? payload.data : []
}

function formatDate(value, includeTime = false) {
  if (!value) return '-'
  const rawValue = String(value)
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(rawValue) ? `${rawValue}T00:00:00` : rawValue)
  if (Number.isNaN(date.getTime())) return rawValue

  const formatter = includeTime ? 'toLocaleString' : 'toLocaleDateString'
  return date[formatter]('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}

function formatWorkflowLabel(value) {
  return String(value || '-')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function getStudentName(item) {
  return item?.student?.full_name || item?.student?.nama_lengkap || item?.student_name || item?.siswa_nama || 'Nama Siswa'
}

function getStudentIdentifier(item) {
  return item?.student?.nis || item?.student?.nisn || item?.nis || item?.nisn || '-'
}

function getPriorityVariant(priority) {
  const normalized = String(priority || '').toLowerCase()
  if (normalized === 'urgent' || normalized === 'high') return 'danger'
  if (normalized === 'medium') return 'warning'
  if (normalized === 'low') return 'info'
  return 'secondary'
}

function getFollowUpStatusVariant(status) {
  const normalized = String(status || '').toLowerCase()
  if (normalized === 'completed') return 'success'
  if (normalized === 'closed') return 'secondary'
  if (normalized === 'waiting_parent') return 'purple'
  return 'warning'
}

export default function HomeroomAttendanceDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [pendingPermissions, setPendingPermissions] = useState([])
  const [followUps, setFollowUps] = useState([])
  const [classesList, setClassesList] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  // 1. Modal Detail Rombel & Siswa State
  const [selectedClass, setSelectedClass] = useState(null)
  const [classDetailStudents, setClassDetailStudents] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // 2. Modal Riwayat Absensi Siswa State
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentHistoryLogs, setStudentHistoryLogs] = useState([])
  const [loadingStudentHistory, setLoadingStudentHistory] = useState(false)
  const [isStudentHistoryModalOpen, setIsStudentHistoryModalOpen] = useState(false)

  // 3. Modal Pengajuan Izin Menunggu Verifikasi State
  const [loadingPermissionModal, setLoadingPermissionModal] = useState(false)
  const [permissionModalError, setPermissionModalError] = useState('')
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false)

  // 4. Modal Tindak Lanjut Absensi State
  const [loadingFollowUpModal, setLoadingFollowUpModal] = useState(false)
  const [followUpModalError, setFollowUpModalError] = useState('')
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false)

  // 5. Modal Rekap Presensi Rombel State
  const [rombelRecapData, setRombelRecapData] = useState([])
  const [loadingRombelRecap, setLoadingRombelRecap] = useState(false)
  const [isRombelRecapModalOpen, setIsRombelRecapModalOpen] = useState(false)

  // 6. Modal Tambah Jadwal Pelajaran State
  const [isAddScheduleModalOpen, setIsAddScheduleModalOpen] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({
    subjectName: '',
    customSubject: '',
    day: 'Senin',
    startTime: '07:30',
    endTime: '09:00',
    teacherName: '',
    customTeacher: '',
  })
  const [savingSchedule, setSavingSchedule] = useState(false)
  const [scheduleSuccessMessage, setScheduleSuccessMessage] = useState('')

  // 7. Modal Daftar Guru Pengampu State
  const [teachersList, setTeachersList] = useState([])
  const [isTeachersModalOpen, setIsTeachersModalOpen] = useState(false)
  const [loadingTeachers, setLoadingTeachers] = useState(false)

  const handleOpenTeachersListModal = async () => {
    setIsTeachersModalOpen(true)
    if (teachersList.length === 0) {
      setLoadingTeachers(true)
      try {
        const res = await employeeService.getDaftar({ per_page: 100 }).catch(() => null)
        const raw = res?.data || (Array.isArray(res) ? res : [])
        if (Array.isArray(raw) && raw.length > 0) {
          const mapped = raw.map((t) => ({
            id: t.id,
            name: t.nama_lengkap || t.nama || t.name || 'Guru Pengajar',
            niy: t.niy || t.nip || '-',
            subject: t.bidang_studi || t.jabatan || 'Guru Pengampu',
            status: t.status || 'Aktif',
          }))
          setTeachersList(mapped)
        } else {
          setTeachersList([])
        }
      } catch (err) {
        console.error('Failed to fetch teachers:', err)
        setTeachersList([])
      } finally {
        setLoadingTeachers(false)
      }
    }
  }

  const handleSelectTeacher = (teacher) => {
    setScheduleForm((prev) => ({
      ...prev,
      teacherName: teacher.name,
    }))
    setIsTeachersModalOpen(false)
  }

  const handleOpenAddScheduleModal = (classItem = null) => {
    const targetClass = classItem || selectedClass || (classesList.length > 0 ? classesList[0] : null)
    if (targetClass) {
      setSelectedClass(targetClass)
    }
    setScheduleForm({
      subjectName: '',
      customSubject: '',
      day: 'Senin',
      startTime: '07:30',
      endTime: '09:00',
      teacherName: '',
      customTeacher: '',
    })
    setScheduleSuccessMessage('')
    setIsAddScheduleModalOpen(true)
  }

  const handleSaveSchedule = async (e) => {
    e?.preventDefault()
    const targetSubject = scheduleForm.subjectName === 'Lainnya' ? scheduleForm.customSubject : scheduleForm.subjectName
    if (!targetSubject?.trim()) return

    const teacher = scheduleForm.teacherName === 'custom' ? (scheduleForm.customTeacher || '') : scheduleForm.teacherName
    const subjectWithTeacher = teacher?.trim() ? `${targetSubject.trim()} (${teacher.trim()})` : targetSubject.trim()

    setSavingSchedule(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))

      if (selectedClass) {
        const updatedSubjects = Array.isArray(selectedClass.mata_pelajaran)
          ? selectedClass.mata_pelajaran.includes(subjectWithTeacher)
            ? selectedClass.mata_pelajaran
            : [...selectedClass.mata_pelajaran, subjectWithTeacher]
          : [subjectWithTeacher]

        const updatedClass = { ...selectedClass, mata_pelajaran: updatedSubjects }
        setSelectedClass(updatedClass)

        setClassesList((prevList) =>
          prevList.map((c) => (c.id === selectedClass.id ? { ...c, mata_pelajaran: updatedSubjects } : c))
        )
      }

      setScheduleSuccessMessage(`Jadwal ${targetSubject} (${teacher || 'Guru Pengampu'}) berhasil ditambahkan!`)
      setTimeout(() => {
        setIsAddScheduleModalOpen(false)
        setSavingSchedule(false)
      }, 700)
    } catch (err) {
      console.error('Failed to save schedule:', err)
      setSavingSchedule(false)
    }
  }

  const userRoles = useMemo(() => user?.roles || (user?.role ? [user.role] : []), [user])
  const isKepsekOrDivisi = useMemo(
    () =>
      hasAnyRole(userRoles, [
        'Kepala Sekolah',
        'kepala_sekolah',
        'kepsek',
        'KepalaSekolah',
        'Divisi Pendidikan',
        'divisi_pendidikan',
        'DivisiPendidikan',
        'Kepala Bidang Pendidikan',
        'Super Admin',
        'super_admin',
        'Admin',
      ]),
    [userRoles]
  )

  const stats = useMemo(() => {
    return (
      dashboardData?.stats || {
        total_students: dashboardData?.total_students || 0,
        attendance_rate: dashboardData?.attendance_rate || 0,
        present_today: dashboardData?.present || 0,
        sick_today: dashboardData?.sick || 0,
        permission_today: dashboardData?.permission || 0,
        absent_today: dashboardData?.absent || 0,
      }
    )
  }, [dashboardData])

  useEffect(() => {
    let active = true
    const fetchData = async () => {
      setLoading(true)
      try {
        const [dashRes, permRes, followRes] = await Promise.all([
          lmsPresensiService.getHomeroomDashboard().catch(() => null),
          lmsPresensiService.getHomeroomPermissions({ status: 'submitted' }).catch(() => ({ data: [] })),
          lmsPresensiService.getFollowUps({ status: 'new' }).catch(() => ({ data: [] })),
        ])

        if (!active) return
        const dashData = dashRes?.data || dashRes || null
        setDashboardData(dashData)

        setPendingPermissions(extractCollection(permRes))

        setFollowUps(extractCollection(followRes))

        if (Array.isArray(dashData?.classes) && dashData.classes.length > 0) {
          setClassesList(dashData.classes)
        } else {
          const kelasRes = await kelasService.getDaftar({ per_page: 100 }).catch(() => null)
          const rawKelas = kelasRes?.data || []
          const mappedKelas = rawKelas.map((k) => ({
            id: k.id,
            nama_kelas: k.nama_kelas,
            kode_kelas: k.kode_kelas,
            unit_name: k.unit_pendidikan?.name || k.unit_pendidikan?.code || '-',
            wali_kelas: k.wali_kelas?.nama_tampil || k.wali_kelas?.nama_lengkap || 'Belum Ditentukan',
            wali_kelas_niy: k.wali_kelas?.niy || null,
            wali_kelas_photo: k.wali_kelas?.foto || null,
            mata_pelajaran: [],
            jumlah_siswa: k.jumlah_siswa || 0,
            kapasitas: k.kapasitas || 0,
          }))
          setClassesList(mappedKelas)
        }
      } catch (err) {
        console.error('Failed to load homeroom dashboard:', err)
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchData()
    return () => {
      active = false
    }
  }, [])

  const handleOpenPermissionModal = async () => {
    setIsPermissionModalOpen(true)
    setPermissionModalError('')
    setLoadingPermissionModal(true)

    try {
      const response = await lmsPresensiService.getHomeroomPermissions({ status: 'submitted', per_page: 100 })
      setPendingPermissions(extractCollection(response))
    } catch (err) {
      console.error('Failed to load permission modal data:', err)
      setPermissionModalError('Data pengajuan izin/sakit tidak dapat dimuat saat ini.')
    } finally {
      setLoadingPermissionModal(false)
    }
  }

  const handleOpenFollowUpModal = async () => {
    setIsFollowUpModalOpen(true)
    setFollowUpModalError('')
    setLoadingFollowUpModal(true)

    try {
      const response = await lmsPresensiService.getFollowUps({ status: 'new', per_page: 100 })
      setFollowUps(extractCollection(response))
    } catch (err) {
      console.error('Failed to load follow-up modal data:', err)
      setFollowUpModalError('Data tindak lanjut absensi tidak dapat dimuat saat ini.')
    } finally {
      setLoadingFollowUpModal(false)
    }
  }

  const filteredClasses = useMemo(() => {
    if (!searchQuery.trim()) return classesList
    const q = searchQuery.toLowerCase()
    return classesList.filter(
      (item) =>
        item.nama_kelas?.toLowerCase().includes(q) ||
        item.kode_kelas?.toLowerCase().includes(q) ||
        item.wali_kelas?.toLowerCase().includes(q) ||
        item.unit_name?.toLowerCase().includes(q) ||
        (Array.isArray(item.mata_pelajaran) && item.mata_pelajaran.some((m) => m.toLowerCase().includes(q)))
    )
  }, [classesList, searchQuery])

  // Open Rombel Detail Modal
  const handleViewClassDetail = async (classItem) => {
    setSelectedClass(classItem)
    setIsDetailModalOpen(true)
    setLoadingStudents(true)
    try {
      const res = await kelasService.getSiswaRombel(classItem.id)
      const list = res?.siswa || res?.data || (Array.isArray(res) ? res : [])
      setClassDetailStudents(list)
    } catch (err) {
      console.error('Failed to load class students:', err)
      setClassDetailStudents([])
    } finally {
      setLoadingStudents(false)
    }
  }

  // Open Student Attendance History Modal (Pop-up inside modal, no navigation)
  const handleOpenStudentHistory = async (siswaItem) => {
    setSelectedStudent(siswaItem)
    setIsStudentHistoryModalOpen(true)
    setLoadingStudentHistory(true)
    try {
      const res = await lmsPresensiService.getDaftar({ siswa_id: siswaItem.id }).catch(() => ({ data: [] }))
      const logs = res?.data || (Array.isArray(res) ? res : [])
      setStudentHistoryLogs(Array.isArray(logs) ? logs : [])
    } catch (err) {
      console.error('Failed to fetch student attendance history:', err)
      setStudentHistoryLogs([])
    } finally {
      setLoadingStudentHistory(false)
    }
  }

  // Helper to compute student attendance statistics dynamically (no hardcode)
  const getStudentRecapStats = (siswaItem, logs = []) => {
    const sId = String(siswaItem?.id || siswaItem?.siswa_id || '')
    const studentLogs = logs.filter((log) => String(log.siswa_id || log.student_id || log.student?.id) === sId)

    let hadir = siswaItem?.hadir_count ?? siswaItem?.hadir ?? 0
    let izin = siswaItem?.izin_count ?? siswaItem?.izin ?? 0
    let sakit = siswaItem?.sakit_count ?? siswaItem?.sakit ?? 0
    let alpa = siswaItem?.alpa_count ?? siswaItem?.alpa ?? 0

    if (studentLogs.length > 0) {
      hadir = studentLogs.filter((l) => l.status_hadir === 'hadir' || l.status_hadir === 'terlambat').length
      izin = studentLogs.filter((l) => l.status_hadir === 'izin').length
      sakit = studentLogs.filter((l) => l.status_hadir === 'sakit').length
      alpa = studentLogs.filter((l) => l.status_hadir === 'alpa' || l.status_hadir === 'tanpa_keterangan').length
    }

    const total = hadir + izin + sakit + alpa
    const pct = total > 0 ? Math.round((hadir / total) * 100) : (siswaItem?.attendance_rate ?? (total === 0 ? 100 : 0))

    return { hadir, izin, sakit, alpa, total, pct }
  }

  const rombelAttendanceRate = useMemo(() => {
    if (!rombelRecapData || rombelRecapData.length === 0) {
      return dashboardData?.attendance_rate || stats?.attendance_rate || 0
    }
    const totalLogs = rombelRecapData.length
    const presentLogs = rombelRecapData.filter(
      (l) => l.status_hadir === 'hadir' || l.status_hadir === 'terlambat'
    ).length
    return totalLogs > 0 ? Math.round((presentLogs / totalLogs) * 100) : (dashboardData?.attendance_rate || 0)
  }, [rombelRecapData, dashboardData, stats])

  // Open Rombel Recap Modal (Pop-up inside modal, no navigation)
  const handleOpenRombelRecap = async (classToRecap = null) => {
    const targetClass = classToRecap || selectedClass || (classesList.length > 0 ? classesList[0] : null)
    if (!targetClass) return

    setSelectedClass(targetClass)
    setIsRombelRecapModalOpen(true)
    setLoadingRombelRecap(true)
    try {
      const [res, siswaRes] = await Promise.all([
        lmsPresensiService.getDaftar({ class_id: targetClass.id }).catch(() => ({ data: [] })),
        kelasService.getSiswaRombel(targetClass.id).catch(() => ({ siswa: [] })),
      ])
      const logs = res?.data || (Array.isArray(res) ? res : [])
      setRombelRecapData(Array.isArray(logs) ? logs : [])

      const list = siswaRes?.siswa || siswaRes?.data || (Array.isArray(siswaRes) ? siswaRes : [])
      if (Array.isArray(list) && list.length > 0) {
        setClassDetailStudents(list)
      }
    } catch (err) {
      console.error('Failed to load rombel recap data:', err)
      setRombelRecapData([])
    } finally {
      setLoadingRombelRecap(false)
    }
  }

  // Dedicated Official Print Function via Hidden Iframe (No new tab/window opened)
  const handlePrintModalReport = (type) => {
    const currentDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    let reportTitle = ''
    let metaInfoHtml = ''
    let tableHeaderHtml = ''
    let tableRowsHtml = ''

    if (type === 'classDetail') {
      reportTitle = `LAPORAN DETAIL ROMBEL & DAFTAR SISWA - ${selectedClass?.nama_kelas || ''}`
      metaInfoHtml = `
        <div class="meta-grid">
          <div><strong>Unit Pendidikan:</strong> ${selectedClass?.unit_name || '-'}</div>
          <div><strong>Nama Rombel:</strong> ${selectedClass?.nama_kelas || '-'}</div>
          <div><strong>Wali Kelas:</strong> ${selectedClass?.wali_kelas || 'Belum Ditentukan'}</div>
          <div><strong>Total Siswa:</strong> ${classDetailStudents.length || selectedClass?.jumlah_siswa || 0} Siswa</div>
          <div><strong>Kapasitas Rombel:</strong> ${selectedClass?.kapasitas || 30} Siswa</div>
          <div><strong>Mata Pelajaran:</strong> ${Array.isArray(selectedClass?.mata_pelajaran) ? selectedClass.mata_pelajaran.join(', ') : '-'}</div>
        </div>
      `
      tableHeaderHtml = `
        <tr>
          <th style="width: 40px; text-align: center;">No</th>
          <th style="width: 130px;">NIS / NISN</th>
          <th>Nama Lengkap Siswa</th>
          <th style="width: 100px; text-align: center;">L/P</th>
          <th style="width: 100px; text-align: center;">Status</th>
        </tr>
      `
      tableRowsHtml = classDetailStudents.map((s, idx) => `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td>${s.nis || s.nisn || '-'}</td>
          <td style="font-weight: bold;">${s.full_name || s.nama || s.name || 'Nama Siswa'}</td>
          <td style="text-align: center;">${s.gender === 'L' || s.jenis_kelamin === 'L' ? 'Laki-laki' : s.gender === 'P' || s.jenis_kelamin === 'P' ? 'Perempuan' : '-'}</td>
          <td style="text-align: center;"><span class="status-badge">${s.status || 'Aktif'}</span></td>
        </tr>
      `).join('')
    } else if (type === 'studentHistory') {
      reportTitle = `LAPORAN RIWAYAT PRESENSI SISWA - ${selectedStudent?.full_name || selectedStudent?.nama || ''}`
      metaInfoHtml = `
        <div class="meta-grid">
          <div><strong>Nama Siswa:</strong> ${selectedStudent?.full_name || selectedStudent?.nama || '-'}</div>
          <div><strong>NIS / NISN:</strong> ${selectedStudent?.nis || selectedStudent?.nisn || '-'}</div>
          <div><strong>Rombel:</strong> ${selectedClass?.nama_kelas || '-'}</div>
          <div><strong>Total Log Presensi:</strong> ${studentHistoryLogs.length} Catatan</div>
        </div>
      `
      tableHeaderHtml = `
        <tr>
          <th style="width: 40px; text-align: center;">No</th>
          <th style="width: 140px;">Tanggal</th>
          <th>Mata Pelajaran / Pertemuan</th>
          <th style="width: 120px; text-align: center;">Status Kehadiran</th>
        </tr>
      `
      tableRowsHtml = studentHistoryLogs.map((log, idx) => `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td>${log.tanggal || log.attendance_date || '-'}</td>
          <td>${log.jadwal?.subject?.name || log.subject_name || `Pertemuan ke-${log.pertemuan_ke || 1}`}</td>
          <td style="text-align: center; text-transform: capitalize; font-weight: bold;">${log.status_hadir || 'hadir'}</td>
        </tr>
      `).join('')
    } else if (type === 'rombelRecap') {
      reportTitle = `LAPORAN REKAPITULASI KEHADIRAN SISWA ROMBEL - ${selectedClass?.nama_kelas || ''}`
      metaInfoHtml = `
        <div class="meta-grid">
          <div><strong>Unit Pendidikan:</strong> ${selectedClass?.unit_name || '-'}</div>
          <div><strong>Nama Rombel:</strong> ${selectedClass?.nama_kelas || '-'}</div>
          <div><strong>Wali Kelas:</strong> ${selectedClass?.wali_kelas || '-'}</div>
          <div><strong>Tingkat Kehadiran:</strong> ${rombelAttendanceRate}%</div>
          <div><strong>Total Siswa:</strong> ${classDetailStudents.length || selectedClass?.jumlah_siswa || 0} Siswa</div>
          <div><strong>Total Izin/Sakit:</strong> ${pendingPermissions.length} Pengajuan</div>
        </div>
      `
      tableHeaderHtml = `
        <tr>
          <th style="width: 40px; text-align: center;">No</th>
          <th style="width: 110px;">NIS</th>
          <th>Nama Lengkap Siswa</th>
          <th style="width: 70px; text-align: center;">Hadir</th>
          <th style="width: 70px; text-align: center;">Izin</th>
          <th style="width: 70px; text-align: center;">Sakit</th>
          <th style="width: 70px; text-align: center;">Alpa</th>
          <th style="width: 85px; text-align: center;">% Hadir</th>
        </tr>
      `
      tableRowsHtml = classDetailStudents.map((s, idx) => {
        const sStats = getStudentRecapStats(s, rombelRecapData)
        return `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td>${s.nis || s.nisn || '-'}</td>
          <td style="font-weight: bold;">${s.full_name || s.nama || s.name || 'Nama Siswa'}</td>
          <td style="text-align: center; color: #047857; font-weight: bold;">${sStats.hadir}</td>
          <td style="text-align: center; color: #0284c7;">${sStats.izin}</td>
          <td style="text-align: center; color: #d97706;">${sStats.sakit}</td>
          <td style="text-align: center; color: #dc2626;">${sStats.alpa}</td>
          <td style="text-align: center; font-weight: bold; color: #047857;">${sStats.pct}%</td>
        </tr>
      `
      }).join('')
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>${reportTitle}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          body {
            font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 10px;
            background: #ffffff;
            font-size: 10pt;
            line-height: 1.4;
          }
          .kop-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 3px double #0f172a;
            padding-bottom: 10px;
            margin-bottom: 16px;
          }
          .kop-title h1 {
            font-size: 13pt;
            font-weight: 900;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #075d45;
          }
          .kop-title h2 {
            font-size: 11pt;
            font-weight: 800;
            margin: 3px 0 0 0;
            color: #1e293b;
          }
          .kop-meta {
            text-align: right;
            font-size: 9pt;
            color: #475569;
          }
          .report-heading {
            text-align: center;
            font-size: 11pt;
            font-weight: 800;
            text-transform: uppercase;
            margin: 16px 0;
            color: #0f172a;
            text-decoration: underline;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 16px;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 10px 14px;
            margin-bottom: 16px;
            font-size: 9.5pt;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 9.5pt;
          }
          th {
            background-color: #0e5c44;
            color: #ffffff;
            font-weight: 700;
            padding: 7px 9px;
            border: 1px solid #0e5c44;
            text-transform: uppercase;
            font-size: 8.5pt;
          }
          td {
            padding: 7px 9px;
            border: 1px solid #cbd5e1;
            vertical-align: middle;
          }
          tr:nth-child(even) {
            background-color: #f8fafc;
          }
          .status-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 999px;
            background: #d1fae5;
            color: #065f46;
            font-size: 8pt;
            font-weight: 700;
          }
          .signature-section {
            margin-top: 36px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
          }
          .signature-box {
            text-align: center;
            width: 220px;
            font-size: 9.5pt;
          }
          .signature-space {
            height: 55px;
          }
        </style>
      </head>
      <body>
        <div class="kop-header">
          <div class="kop-title">
            <h1>YAYASAN DAREL IMAN</h1>
            <h2>SISTEM MANAJEMEN SEKOLAH TERPADU</h2>
            <div style="font-size: 8.5pt; color: #64748b; margin-top: 2px;">Laporan Resmi Kehadiran & Presensi Rombel</div>
          </div>
          <div class="kop-meta">
            <div><strong>TANGGAL CETAK:</strong> ${currentDate}</div>
            <div><strong>DICETAK OLEH:</strong> ${user?.name || user?.username || 'Wali Kelas / Sistem'}</div>
          </div>
        </div>

        <div class="report-heading">${reportTitle}</div>

        ${metaInfoHtml}

        <table>
          <thead>
            ${tableHeaderHtml}
          </thead>
          <tbody>
            ${tableRowsHtml.length > 0 ? tableRowsHtml : `<tr><td colspan="8" style="text-align:center; padding: 20px; color: #94a3b8;">Tidak ada data untuk ditampilkan.</td>------------------------------------------------------</tr>`}
          </tbody>
        </table>

        <div class="signature-section">
          <div class="signature-box">
            <div>Mengetahui,</div>
            <div style="font-weight: bold; margin-top: 2px;">Kepala Sekolah</div>
            <div class="signature-space"></div>
            <div style="font-weight: bold; border-bottom: 1px solid #000; display: inline-block; padding: 0 10px;">( ______________________ )</div>
          </div>
          <div class="signature-box">
            <div>Padang, ${currentDate}</div>
            <div style="font-weight: bold; margin-top: 2px;">Wali Kelas / Guru Pengampu</div>
            <div class="signature-space"></div>
            <div style="font-weight: bold; border-bottom: 1px solid #000; display: inline-block; padding: 0 10px;">( ${selectedClass?.wali_kelas || '______________________'} )</div>
          </div>
        </div>
      </body>
      </html>
    `

    // Remove existing print frame if any
    let printFrame = document.getElementById('sims-print-frame')
    if (printFrame) {
      printFrame.remove()
    }

    // Create hidden iframe in current page (No new tab/window opened!)
    printFrame = document.createElement('iframe')
    printFrame.id = 'sims-print-frame'
    printFrame.style.position = 'fixed'
    printFrame.style.right = '0'
    printFrame.style.bottom = '0'
    printFrame.style.width = '0'
    printFrame.style.height = '0'
    printFrame.style.border = '0'
    printFrame.style.visibility = 'hidden'
    document.body.appendChild(printFrame)

    const frameDoc = printFrame.contentWindow.document
    frameDoc.open()
    frameDoc.write(htmlContent)
    frameDoc.close()

    setTimeout(() => {
      printFrame.contentWindow.focus()
      printFrame.contentWindow.print()
    }, 200)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.02 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  }

  // ── SUB-KOMPONEN MODERN KPI CARDS (Spesifikasi Sesuai Dashboard Kepala Sekolah) ──
  const MODERN_CARD_TONES = {
    emerald: {
      card: 'border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
      glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
      iconBox: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/30',
      tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
      title: 'text-emerald-700 dark:text-emerald-400',
      val: 'text-emerald-700 dark:text-emerald-300',
      sub: 'text-emerald-600/80 dark:text-emerald-400/80',
      cta: 'text-emerald-600/60 dark:text-emerald-500/60',
    },
    blue: {
      card: 'border-blue-300/70 bg-gradient-to-br from-blue-50 via-cyan-50/60 to-white hover:border-blue-400 dark:border-blue-700/50 dark:from-blue-950/40 dark:via-cyan-950/20 dark:to-slate-900',
      glow: 'bg-blue-400/20 group-hover:bg-blue-400/30',
      iconBox: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-blue-500/30',
      tag: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
      title: 'text-blue-700 dark:text-blue-400',
      val: 'text-blue-700 dark:text-blue-300',
      sub: 'text-blue-600/80 dark:text-blue-400/80',
      cta: 'text-blue-600/60 dark:text-blue-500/60',
    },
    amber: {
      card: 'border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
      glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
      iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/30',
      tag: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
      title: 'text-amber-700 dark:text-amber-400',
      val: 'text-amber-700 dark:text-amber-300',
      sub: 'text-amber-600/80 dark:text-amber-400/80',
      cta: 'text-amber-600/60 dark:text-amber-500/60',
    },
    rose: {
      card: 'border-rose-300/70 bg-gradient-to-br from-rose-50 via-pink-50/60 to-white hover:border-rose-400 dark:border-rose-700/50 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-slate-900',
      glow: 'bg-rose-400/20 group-hover:bg-rose-400/30',
      iconBox: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-rose-500/30',
      tag: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
      title: 'text-rose-700 dark:text-rose-400',
      val: 'text-rose-700 dark:text-rose-300',
      sub: 'text-rose-600/80 dark:text-rose-400/80',
      cta: 'text-rose-600/60 dark:text-rose-500/60',
    },
    purple: {
      card: 'border-purple-300/70 bg-gradient-to-br from-purple-50 via-indigo-50/60 to-white hover:border-purple-400 dark:border-purple-700/50 dark:from-purple-950/40 dark:via-indigo-950/20 dark:to-slate-900',
      glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
      iconBox: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-500/30',
      tag: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
      title: 'text-purple-700 dark:text-purple-400',
      val: 'text-purple-700 dark:text-purple-300',
      sub: 'text-purple-600/80 dark:text-purple-400/80',
      cta: 'text-purple-600/60 dark:text-purple-500/60',
    },
    indigo: {
      card: 'border-indigo-300/70 bg-gradient-to-br from-indigo-50 via-sky-50/60 to-white hover:border-indigo-400 dark:border-indigo-700/50 dark:from-indigo-950/40 dark:via-sky-950/20 dark:to-slate-900',
      glow: 'bg-indigo-400/20 group-hover:bg-indigo-400/30',
      iconBox: 'bg-gradient-to-br from-indigo-500 to-sky-600 text-white shadow-indigo-500/30',
      tag: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300',
      title: 'text-indigo-700 dark:text-indigo-400',
      val: 'text-indigo-700 dark:text-indigo-300',
      sub: 'text-indigo-600/80 dark:text-indigo-400/80',
      cta: 'text-indigo-600/60 dark:text-indigo-500/60',
    },
  }

  function ModernKpiCard({ icon: Icon, title, label, value, subtext, tag, tone = 'emerald', onClick }) {
    const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
    const isClickable = typeof onClick === 'function'
    const displayTitle = title || label

    return (
      <div
        onClick={onClick}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
        className={`group relative overflow-hidden rounded-[18px] border-2 p-5 shadow-sm transition-all duration-200 text-left ${
          isClickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
        } ${t.card}`}
      >
        {/* Ambient Glow */}
        <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all ${t.glow}`} />

        {/* Header with Gradient Icon Box & Pill Tag */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm ${t.iconBox}`}>
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className={`text-[11px] font-bold uppercase tracking-wider ${t.title}`}>{displayTitle}</p>
            </div>
          </div>
          {tag && (
            <span className={`rounded-lg px-2 py-0.5 text-[10px] font-extrabold ${t.tag}`}>
              {tag}
            </span>
          )}
        </div>

        {/* Metric Value */}
        <p className={`text-4xl font-black tabular-nums ${t.val}`}>
          {value ?? '0'}
        </p>
        {subtext && (
          <p className={`mt-0.5 text-[11px] font-semibold ${t.sub}`}>
            {subtext}
          </p>
        )}

        {/* Click Affordance Footer */}
        {isClickable && (
          <p className={`mt-3 text-[10px] font-bold flex items-center gap-1 ${t.cta}`}>
            <Eye className="h-3 w-3" /> Klik untuk detail lengkap
          </p>
        )}
      </div>
    )
  }

  // Alias untuk kompatibilitas internal
  const KpiTintedCard = ModernKpiCard

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
      {/* Main Dashboard Workspace (Hidden on Print so only Modal Report prints) */}
      <motion.div variants={itemVariants} className="space-y-6 print:hidden">
        {/* BREADCRUMB NAV */}
        <AppBreadcrumb items={[{ label: 'Absensi', href: '/absensi' }, { label: 'Dashboard Wali Kelas' }]} />

        {/* MODERN HERO CARD HEADER (MATCHING PORTAL ORANG TUA / SISWA STYLE) */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
            <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                  <CalendarCheck className="size-6 sm:size-7 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                      <Sparkles className="size-3 text-amber-300 animate-pulse" />
                      Manajemen Presensi Rombel
                    </span>
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                      Wali Kelas: {user?.name || user?.username || 'Wali Kelas SIT'}
                    </span>
                  </div>
                  <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Dashboard Presensi Wali Kelas
                  </h1>
                  <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
                    Monitoring kehadiran siswa rombel binaan, verifikasi surat izin/sakit, rekapitulasi presensi, dan tindak lanjut siswa.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition-all hover:scale-[1.02] cursor-pointer"
                  onClick={() => handleOpenRombelRecap()}
                >
                  <FileText className="size-4" />
                  <span>Rekap Presensi</span>
                </button>
                <button
                  type="button"
                  className="relative inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-800 shadow-sm border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-all cursor-pointer"
                  onClick={handleOpenPermissionModal}
                >
                  <FileCheck2 className="size-4 text-emerald-600" />
                  <span>Verifikasi Izin</span>
                  {pendingPermissions.length > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-black text-white shadow-xs">
                      {pendingPermissions.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* PRIMARY KPI STATS CARDS - STYLE DASHBOARD KEPALA SEKOLAH */}
        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ModernKpiCard
            icon={Users}
            title="Total Siswa Rombel"
            value={stats.total_students || 0}
            subtext="Siswa Aktif Rombel Binaan"
            tone="emerald"
            tag="Siswa"
          />
          <ModernKpiCard
            icon={Award}
            title="% Kehadiran Bulan Ini"
            value={`${stats.attendance_rate || 100}%`}
            subtext="Tingkat Kehadiran Rombel"
            tone="blue"
            tag="Presensi"
          />
          <ModernKpiCard
            icon={AlertCircle}
            title="Verifikasi Izin Pending"
            value={pendingPermissions.length}
            subtext="Menunggu Persetujuan"
            tone="amber"
            tag="Approval"
            onClick={handleOpenPermissionModal}
          />
          <ModernKpiCard
            icon={ShieldAlert}
            title="Perlu Tindak Lanjut"
            value={followUps.length}
            subtext="Siswa Alpa / Bermasalah"
            tone="rose"
            tag="Perhatian"
            onClick={handleOpenFollowUpModal}
          />
        </motion.div>

        {/* Quick Action Navigation (Soft Pastel Squircle Buttons) */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
          <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#0E5C44]/10 text-[#0E5C44] dark:bg-[#3FBF75]/20 dark:text-[#3FBF75]">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Aksi Cepat Wali Kelas</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pintas manajemen presensi rombel, verifikasi izin, tindak lanjut, dan rekap mutabaah</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* 1. Rekap Presensi - Emerald Theme */}
              <button
                type="button"
                onClick={() => handleOpenRombelRecap()}
                className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-2.5 transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-50/50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-emerald-700/60 dark:hover:bg-emerald-950/30 text-left cursor-pointer"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100/80 text-emerald-600 border border-emerald-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 pr-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300">Rekap Presensi</p>
                  <p className="text-[10px] text-slate-400 truncate">Laporan Kehadiran</p>
                </div>
              </button>

              {/* 2. Verifikasi Izin - Sky Blue Theme */}
              <button
                type="button"
                onClick={handleOpenPermissionModal}
                className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-2.5 transition-all duration-200 hover:border-sky-300 hover:bg-sky-50/50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-sky-700/60 dark:hover:bg-sky-950/30 text-left cursor-pointer"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100/80 text-sky-600 border border-sky-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-sky-950/60 dark:text-sky-400 dark:border-sky-800/60">
                  <FileCheck2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 pr-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-sky-700 dark:group-hover:text-sky-300">Verifikasi Izin</p>
                  <p className="text-[10px] text-slate-400 truncate">{pendingPermissions.length} Menunggu</p>
                </div>
              </button>

              {/* 3. Tindak Lanjut - Rose Theme */}
              <button
                type="button"
                onClick={handleOpenFollowUpModal}
                className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-2.5 transition-all duration-200 hover:border-rose-300 hover:bg-rose-50/50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-rose-700/60 dark:hover:bg-rose-950/30 text-left cursor-pointer"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100/80 text-rose-600 border border-rose-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800/60">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <div className="min-w-0 pr-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-rose-700 dark:group-hover:text-rose-300">Tindak Lanjut</p>
                  <p className="text-[10px] text-slate-400 truncate">{followUps.length} Kasus Siswa</p>
                </div>
              </button>

              {/* 4. Rekap Tahfizh & Mutabaah - Violet Theme */}
              <button
                type="button"
                onClick={() => navigate('/portal-guru/workspace?tab=tahfizh')}
                className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-2.5 transition-all duration-200 hover:border-violet-300 hover:bg-violet-50/50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-violet-700/60 dark:hover:bg-violet-950/30 text-left cursor-pointer"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100/80 text-violet-600 border border-violet-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-violet-950/60 dark:text-violet-400 dark:border-violet-800/60">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="min-w-0 pr-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-violet-700 dark:group-hover:text-violet-300">Rekap Tahfizh</p>
                  <p className="text-[10px] text-slate-400 truncate">Hafalan Al-Qur'an</p>
                </div>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Two-Column Section: Pending Permissions & Follow-ups (Modern Style Containers) */}
        <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
          {/* Kolom 1: Pengajuan Izin Menunggu Verifikasi */}
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/5 space-y-4 dark:border-emerald-600/35 dark:bg-[#1B2433] flex flex-col justify-between h-full">
            <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/15 dark:border-emerald-800/40">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs">
                    <FileCheck2 className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Pengajuan Izin Menunggu Verifikasi
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Surat izin dan sakit siswa rombel binaan
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 cursor-pointer shrink-0 transition-all active:scale-95"
                  onClick={handleOpenPermissionModal}
                >
                  <Eye className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Kelola Semua</span>
                </button>
              </div>

              {loading ? (
                <AppSkeleton rows={3} />
              ) : pendingPermissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
                  <FileCheck2 className="h-10 w-10 stroke-1 mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Tidak ada surat izin/sakit siswa yang menunggu verifikasi saat ini
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {pendingPermissions.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 transition-all hover:bg-slate-100/70 hover:border-slate-200/80 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-900/70"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.student?.full_name || item.siswa_nama || 'Nama Siswa'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Jenis: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.permission_type || item.jenis}</span> • Tanggal: {item.start_date || item.tanggal}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100/90 px-3 py-1.5 text-xs font-bold text-emerald-700 transition-colors duration-200 hover:bg-emerald-600 hover:text-white hover:shadow-md hover:shadow-emerald-600/30 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white cursor-pointer shadow-2xs"
                        onClick={() => navigate('/absensi/rekap-kehadiran?tab=verifikasi')}
                      >
                        <FileCheck2 className="size-3.5 transition-colors" />
                        <span>Verifikasi</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Kolom 2: Tindak Lanjut Absensi Siswa */}
          <div className="relative overflow-hidden rounded-[22px] border-2 border-rose-500/25 bg-white p-5 sm:p-6 shadow-md shadow-rose-500/5 space-y-4 dark:border-rose-600/35 dark:bg-[#1B2433] flex flex-col justify-between h-full">
            <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-rose-400/10 blur-2xl dark:bg-rose-400/15" />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-rose-500/15 dark:border-rose-800/40">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-xs">
                    <HeartPulse className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Tindak Lanjut Absensi Siswa
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Catatan siswa yang membutuhkan bimbingan & pembinaan
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-rose-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 cursor-pointer shrink-0 transition-all active:scale-95"
                  onClick={handleOpenFollowUpModal}
                >
                  <Eye className="h-3.5 w-3.5 text-rose-600" />
                  <span>Lihat Detail</span>
                </button>
              </div>

              {loading ? (
                <AppSkeleton rows={3} />
              ) : followUps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
                  <HeartPulse className="h-10 w-10 stroke-1 mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Tidak ada catatan tindak lanjut presensi siswa yang aktif
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {followUps.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 transition-all hover:bg-slate-100/70 hover:border-slate-200/80 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-900/70"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.student?.full_name || item.siswa_nama || 'Siswa'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Tindakan: <span className="font-medium text-slate-700 dark:text-slate-300">{item.action_taken || 'Konseling/Panggilan'}</span>
                        </p>
                      </div>
                      <AppBadge variant="danger">Tindak Lanjut</AppBadge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

      {isKepsekOrDivisi && (
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433] p-5 space-y-4">
          <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent -mx-5 -mt-5 p-5 border-b border-emerald-500/20 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-600" /> Monitoring Seluruh Kelas & Wali Kelas
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ringkasan daftar rombel, wali kelas penanggung jawab, mata pelajaran, dan total siswa per kelas. Klik baris untuk melihat detail siswa.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari kelas, wali kelas, mapel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-emerald-500/30 bg-white pl-9 pr-3 py-1.5 text-xs font-medium text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-emerald-600/40 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          {loading ? (
            <AppSkeleton rows={4} />
          ) : filteredClasses.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Tidak ada data kelas yang sesuai dengan pencarian.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-emerald-500/20 dark:border-emerald-900/40">
              <TableRoot fullBleed={false}>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
                    <TableHead className="w-12 text-center text-xs font-bold text-slate-800 dark:text-slate-200">No</TableHead>
                    <TableHead className="text-xs font-bold text-slate-800 dark:text-slate-200">Kelas & Unit</TableHead>
                    <TableHead className="text-xs font-bold text-slate-800 dark:text-slate-200">Wali Kelas</TableHead>
                    <TableHead className="text-xs font-bold text-slate-800 dark:text-slate-200">Mata Pelajaran</TableHead>
                    <TableHead className="text-center text-xs font-bold text-slate-800 dark:text-slate-200">Jumlah Siswa / Rombel</TableHead>
                    <TableHead className="w-16 text-center text-xs font-bold text-slate-800 dark:text-slate-200">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.map((item, idx) => (
                    <TableRow
                      key={item.id || idx}
                      className="hover:bg-slate-50/90 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                      onClick={() => handleViewClassDetail(item)}
                    >
                      <TableCell className="text-center text-xs font-semibold text-slate-500">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 dark:text-white text-xs">{item.nama_kelas}</span>
                          <span className={`rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-2xs ${getUnitBadgeStyle(item.unit_name)}`}>
                            {item.unit_name}
                          </span>
                        </div>
                        {item.kode_kelas && (
                          <span className="text-[11px] text-slate-400 block font-mono mt-0.5">{item.kode_kelas}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar size="sm" className="ring-2 ring-emerald-500/20">
                            {item.wali_kelas_photo ? (
                              <AvatarImage src={item.wali_kelas_photo} alt={item.wali_kelas} />
                            ) : null}
                            <AvatarFallback className="bg-emerald-100 text-emerald-800 font-bold text-xs">
                              {item.wali_kelas?.substring(0, 2).toUpperCase() || 'WK'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{item.wali_kelas}</p>
                            {item.wali_kelas_niy && (
                              <p className="text-[11px] text-slate-400">NIY: {item.wali_kelas_niy}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {Array.isArray(item.mata_pelajaran) && item.mata_pelajaran.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {item.mata_pelajaran.map((mapel, mIdx) => (
                              <span
                                key={mIdx}
                                className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-bold shadow-2xs ${getSubjectBadgeStyle(mapel, mIdx)}`}
                              >
                                {mapel}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs italic text-amber-600 dark:text-amber-400 font-medium">Belum ada jadwal mapel</span>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 rounded-xl bg-amber-100/90 px-2.5 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-500 hover:text-white dark:bg-amber-950/80 dark:text-amber-300 transition-colors duration-200 cursor-pointer shadow-2xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenAddScheduleModal(item)
                              }}
                            >
                              <Plus className="size-3.5" />
                              <span>Tambah Jadwal</span>
                            </button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 px-3 py-1 text-xs font-extrabold text-blue-700 shadow-2xs dark:from-blue-950/60 dark:to-indigo-950/60 dark:border-blue-800/60 dark:text-blue-300">
                          <Users className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          {item.jumlah_siswa} Siswa
                        </span>
                      </TableCell>
                      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="group relative inline-flex">
                          <button
                            type="button"
                            title="Lihat Detail Siswa & Rombel"
                            aria-label="Lihat Detail Siswa & Rombel"
                            className="flex size-8 items-center justify-center rounded-xl bg-indigo-100/90 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-indigo-600/30 cursor-pointer shadow-2xs"
                            onClick={() => handleViewClassDetail(item)}
                          >
                            <Eye className="size-4 transition-colors" />
                          </button>
                          <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                            <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                            Lihat Detail Siswa & Rombel
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableRoot>
            </div>
          )}
        </motion.div>
      )}

      </motion.div>

      {/* ── 1. Pop-up Detail Modal for Class & Students ─────────────────────────────── */}
      <Backdrop isOpen={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <Dialog className="max-w-3xl w-full">
          <DialogHeader className="print:hidden">
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white text-base sm:text-lg">
              <Eye className="h-5 w-5 text-indigo-600" /> Detail Rombel & Siswa {selectedClass?.nama_kelas}
            </DialogTitle>
            <DialogDescription>
              Rincian informasi kelas, wali kelas penanggung jawab, serta daftar siswa terdaftar dalam rombel ini.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4 my-3 overflow-visible">
            {/* Printable Kop Laporan Resmi Header */}
            <div className="hidden print:block border-b-2 border-slate-900 pb-3 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    YAYASAN DAREL IMAN • SISTEM MANAJEMEN SEKOLAH TERPADU
                  </h1>
                  <h2 className="text-sm font-extrabold text-slate-900 mt-0.5">
                    LAPORAN DETAIL ROMBEL & DAFTAR SISWA {selectedClass?.nama_kelas}
                  </h2>
                  <p className="text-[11px] text-slate-700 mt-0.5">
                    Unit: {selectedClass?.unit_name} • Wali Kelas: {selectedClass?.wali_kelas} ({selectedClass?.wali_kelas_niy ? `NIY: ${selectedClass.wali_kelas_niy}` : 'NIY: -'})
                  </p>
                </div>
                <div className="text-right text-[10px] text-slate-600">
                  <p className="font-bold">TANGGAL CETAK</p>
                  <p>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="mt-1">Dicetak Oleh: {user?.name || user?.username || 'Administrator'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-sky-50/90 border border-sky-200/70 rounded-xl dark:bg-sky-950/40 dark:border-sky-800/60">
                <span className="text-[11px] font-bold uppercase text-sky-600 dark:text-sky-400 block">Unit Pendidikan</span>
                <span className="text-xs font-black text-slate-900 dark:text-white mt-0.5 block">{selectedClass?.unit_name || '-'}</span>
              </div>
              <div className="p-3.5 bg-emerald-50/90 border border-emerald-200/70 rounded-xl dark:bg-emerald-950/40 dark:border-emerald-800/60">
                <span className="text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block">Wali Kelas</span>
                <span className="text-xs font-black text-slate-900 dark:text-white mt-0.5 block">{selectedClass?.wali_kelas || 'Belum Ditentukan'}</span>
              </div>
              <div className="p-3.5 bg-violet-50/90 border border-violet-200/70 rounded-xl dark:bg-violet-950/40 dark:border-violet-800/60">
                <span className="text-[11px] font-bold uppercase text-violet-600 dark:text-violet-400 block">Jumlah Siswa</span>
                <span className="text-xs font-black text-violet-700 dark:text-violet-300 mt-0.5 block">{selectedClass?.jumlah_siswa || classDetailStudents.length || 0} Siswa</span>
              </div>
              <div className="p-3.5 bg-amber-50/90 border border-amber-200/70 rounded-xl dark:bg-amber-950/40 dark:border-amber-800/60">
                <span className="text-[11px] font-bold uppercase text-amber-600 dark:text-amber-400 block">Kapasitas</span>
                <span className="text-xs font-black text-slate-900 dark:text-white mt-0.5 block">{selectedClass?.kapasitas || 30} Siswa</span>
              </div>
            </div>

            {Array.isArray(selectedClass?.mata_pelajaran) && selectedClass.mata_pelajaran.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Mata Pelajaran & Guru Pengampu:</span>
                  <button
                    type="button"
                    title="Lihat Daftar Guru Pengampu"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-100/90 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-600 hover:text-white transition-colors duration-200 shadow-2xs dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-600 dark:hover:text-white cursor-pointer"
                    onClick={handleOpenTeachersListModal}
                  >
                    <Users className="size-3.5 transition-colors" />
                    <span>Daftar Guru Pengampu</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedClass.mata_pelajaran.map((mapel, mIdx) => (
                    <span
                      key={mIdx}
                      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold shadow-2xs ${getSubjectBadgeStyle(mapel, mIdx)}`}
                    >
                      {mapel}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3.5 bg-amber-50/90 border border-amber-200/80 rounded-xl dark:bg-amber-950/40 dark:border-amber-800/60">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">Belum ada jadwal mata pelajaran untuk rombel ini.</span>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-700 transition-colors shadow-2xs cursor-pointer shrink-0"
                  onClick={() => handleOpenAddScheduleModal(selectedClass)}
                >
                  <Plus className="size-4" />
                  <span>Tambah Jadwal</span>
                </button>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Daftar Siswa dalam Rombel</span>
                <span className="text-[11px] text-slate-500 font-normal">Total {classDetailStudents.length} Siswa</span>
              </h4>

              {loadingStudents ? (
                <AppSkeleton rows={4} />
              ) : classDetailStudents.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  Belum ada data siswa terdaftar di rombel ini.
                </div>
              ) : (
                <div className="max-h-[350px] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <TableRoot fullBleed={false}>
                    <TableHeader className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900">
                      <TableRow className="bg-slate-50 dark:bg-slate-900/60">
                        <TableHead className="w-10 text-center text-xs font-bold text-slate-700 dark:text-slate-300">No</TableHead>
                        <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">NIS / NISN</TableHead>
                        <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">Nama Siswa</TableHead>
                        <TableHead className="text-center text-xs font-bold text-slate-700 dark:text-slate-300">L/P</TableHead>
                        <TableHead className="text-center text-xs font-bold text-slate-700 dark:text-slate-300">Status</TableHead>
                        <TableHead className="w-16 text-center text-xs font-bold text-slate-700 dark:text-slate-300">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classDetailStudents.map((siswaItem, sIdx) => (
                        <TableRow key={siswaItem.id || sIdx} className="hover:bg-slate-50/90 dark:hover:bg-slate-800/60 transition-colors">
                          <TableCell className="text-center text-xs font-semibold text-slate-500">{sIdx + 1}</TableCell>
                          <TableCell className="text-xs font-mono text-slate-600 dark:text-slate-400">
                            {siswaItem.nis || siswaItem.nisn || '-'}
                          </TableCell>
                          <TableCell className="text-xs font-bold text-slate-900 dark:text-white">
                            {siswaItem.full_name || siswaItem.nama || siswaItem.name || 'Nama Siswa'}
                          </TableCell>
                          <TableCell className="text-center text-xs font-semibold">
                            {siswaItem.gender === 'L' || siswaItem.jenis_kelamin === 'L' ? (
                              <span className="inline-flex items-center rounded-md bg-blue-100/90 px-2 py-0.5 text-[10px] font-black text-blue-800 dark:bg-blue-950 dark:text-blue-300">Laki-laki</span>
                            ) : siswaItem.gender === 'P' || siswaItem.jenis_kelamin === 'P' ? (
                              <span className="inline-flex items-center rounded-md bg-pink-100/90 px-2 py-0.5 text-[10px] font-black text-pink-800 dark:bg-pink-950 dark:text-pink-300">Perempuan</span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center rounded-full bg-emerald-100/80 border border-emerald-200/80 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-800/60 dark:text-emerald-300">
                              {siswaItem.status || 'Aktif'}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="group relative inline-flex">
                              <button
                                type="button"
                                title="Lihat Riwayat Absensi Siswa (Pop-up)"
                                className="flex size-7 items-center justify-center rounded-xl bg-sky-100/90 text-sky-700 hover:bg-sky-500 hover:text-white dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-500 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-sky-500/30 cursor-pointer shadow-2xs"
                                onClick={() => handleOpenStudentHistory(siswaItem)}
                              >
                                <FileText className="size-3.5 transition-colors" />
                              </button>
                              <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                                <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                                Riwayat Absensi Siswa
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </TableRoot>
                </div>
              )}
            </div>
          </DialogBody>

          <DialogFooter className="gap-2.5 sm:justify-end print:hidden">
            {(!Array.isArray(selectedClass?.mata_pelajaran) || selectedClass.mata_pelajaran.length === 0) && (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white transition-colors duration-200 hover:bg-amber-600 hover:shadow-md hover:shadow-amber-500/30 cursor-pointer shadow-2xs"
                onClick={() => handleOpenAddScheduleModal(selectedClass)}
              >
                <Plus className="size-4 transition-colors" />
                <span>Tambah Jadwal</span>
              </button>
            )}
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-100/90 px-4 py-2.5 text-xs font-bold text-amber-700 transition-colors duration-200 hover:bg-amber-500 hover:text-white hover:shadow-md hover:shadow-amber-500/30 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white cursor-pointer shadow-2xs"
              onClick={() => handlePrintModalReport('classDetail')}
            >
              <Printer className="size-4 transition-colors" />
              <span>Cetak</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-100/90 px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors duration-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer shadow-2xs"
              onClick={() => setIsDetailModalOpen(false)}
            >
              <span>Tutup</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-100/90 px-4 py-2.5 text-xs font-bold text-emerald-700 transition-colors duration-200 hover:bg-emerald-600 hover:text-white hover:shadow-md hover:shadow-emerald-600/30 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white cursor-pointer shadow-2xs"
              onClick={handleOpenRombelRecap}
            >
              <FileText className="size-4 transition-colors" />
              <span>Rekap Kehadiran Rombel Ini</span>
            </button>
          </DialogFooter>
        </Dialog>
      </Backdrop>

      {/* ── 2. Pop-up Modal Riwayat Absensi Siswa ─────────────────────────────────── */}
      <Backdrop isOpen={isStudentHistoryModalOpen} onOpenChange={setIsStudentHistoryModalOpen}>
        <Dialog className="max-w-2xl w-full">
          <DialogHeader className="print:hidden">
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white text-base">
              <FileText className="h-5 w-5 text-sky-600" /> Riwayat Presensi - {selectedStudent?.full_name || selectedStudent?.nama}
            </DialogTitle>
            <DialogDescription>
              Catatan presensi dan absensi siswa {selectedStudent?.full_name} di Rombel {selectedClass?.nama_kelas}.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4 my-3 overflow-visible">
            {/* Printable Kop Laporan Resmi Header */}
            <div className="hidden print:block border-b-2 border-slate-900 pb-3 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    YAYASAN DAREL IMAN • SISTEM MANAJEMEN SEKOLAH TERPADU
                  </h1>
                  <h2 className="text-sm font-extrabold text-slate-900 mt-0.5">
                    LAPORAN RIWAYAT PRESENSI SISWA
                  </h2>
                  <p className="text-[11px] text-slate-700 mt-0.5">
                    Nama Siswa: {selectedStudent?.full_name || selectedStudent?.nama} • NIS/NISN: {selectedStudent?.nis || selectedStudent?.nisn || '-'} • Rombel: {selectedClass?.nama_kelas}
                  </p>
                </div>
                <div className="text-right text-[10px] text-slate-600">
                  <p className="font-bold">TANGGAL CETAK</p>
                  <p>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="mt-1">Dicetak Oleh: {user?.name || user?.username || 'Administrator'}</p>
                </div>
              </div>
            </div>

            {/* Student Info Card */}
            <div className="flex items-center justify-between p-3.5 bg-sky-50/80 border border-sky-200/70 rounded-xl dark:bg-sky-950/40 dark:border-sky-800/60">
              <div>
                <p className="text-xs font-black text-slate-900 dark:text-white">{selectedStudent?.full_name || selectedStudent?.nama}</p>
                <p className="text-[11px] text-slate-500 font-mono">NIS: {selectedStudent?.nis || selectedStudent?.nisn || '-'}</p>
              </div>
              <span className="rounded-lg bg-sky-100 px-2.5 py-1 text-xs font-black text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                {selectedClass?.nama_kelas || 'Rombel'}
              </span>
            </div>

            {loadingStudentHistory ? (
              <AppSkeleton rows={3} />
            ) : studentHistoryLogs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-xl">
                Belum ada log catatan presensi spesifik untuk siswa ini.
              </div>
            ) : (
              <div className="max-h-[320px] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <TableRoot fullBleed={false}>
                  <TableHeader className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900">
                    <TableRow className="bg-slate-50 dark:bg-slate-900/60">
                      <TableHead className="w-10 text-center text-xs font-bold text-slate-700 dark:text-slate-300">No</TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">Tanggal</TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">Mapel / Pertemuan</TableHead>
                      <TableHead className="text-center text-xs font-bold text-slate-700 dark:text-slate-300">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentHistoryLogs.map((log, lIdx) => (
                      <TableRow key={log.id || lIdx} className="hover:bg-slate-50/90 dark:hover:bg-slate-800/60">
                        <TableCell className="text-center text-xs font-semibold text-slate-500">{lIdx + 1}</TableCell>
                        <TableCell className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {log.tanggal || log.attendance_date || '-'}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {log.jadwal?.subject?.name || log.subject_name || `Pertemuan ke-${log.pertemuan_ke || 1}`}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                              log.status_hadir === 'hadir'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : log.status_hadir === 'terlambat'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : log.status_hadir === 'izin' || log.status_hadir === 'sakit'
                                ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {log.status_hadir || 'hadir'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableRoot>
              </div>
            )}
          </DialogBody>

          <DialogFooter className="gap-2.5 sm:justify-end print:hidden">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-100/90 px-4 py-2.5 text-xs font-bold text-amber-700 transition-colors duration-200 hover:bg-amber-500 hover:text-white hover:shadow-md hover:shadow-amber-500/30 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white cursor-pointer shadow-2xs"
              onClick={() => handlePrintModalReport('studentHistory')}
            >
              <Printer className="size-4 transition-colors" />
              <span>Cetak</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-100/90 px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors duration-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer shadow-2xs"
              onClick={() => setIsStudentHistoryModalOpen(false)}
            >
              <span>Tutup</span>
            </button>
          </DialogFooter>
        </Dialog>
      </Backdrop>

      {/* ── 3. Pop-up Modal Rekap Presensi Rombel ───────────────────────────────────── */}
      <Backdrop isOpen={isRombelRecapModalOpen} onOpenChange={setIsRombelRecapModalOpen}>
        <Dialog className="max-w-3xl w-full">
          <DialogHeader className="print:hidden">
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white text-base sm:text-lg">
              <FileText className="h-5 w-5 text-emerald-600" /> Rekap Presensi Rombel {selectedClass?.nama_kelas}
            </DialogTitle>
            <DialogDescription>
              Ringkasan rekapitulasi kehadiran seluruh siswa di Rombel {selectedClass?.nama_kelas}.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4 my-3 overflow-visible">
            {/* Printable Kop Laporan Resmi Header */}
            <div className="hidden print:block border-b-2 border-slate-900 pb-3 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    YAYASAN DAREL IMAN • SISTEM MANAJEMEN SEKOLAH TERPADU
                  </h1>
                  <h2 className="text-sm font-extrabold text-slate-900 mt-0.5">
                    LAPORAN REKAPITULASI KEHADIRAN SISWA ROMBEL {selectedClass?.nama_kelas}
                  </h2>
                  <p className="text-[11px] text-slate-700 mt-0.5">
                    Unit: {selectedClass?.unit_name} • Wali Kelas: {selectedClass?.wali_kelas} • Total Siswa: {classDetailStudents.length || selectedClass?.jumlah_siswa || 0} Siswa
                  </p>
                </div>
                <div className="text-right text-[10px] text-slate-600">
                  <p className="font-bold">TANGGAL CETAK</p>
                  <p>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="mt-1">Dicetak Oleh: {user?.name || user?.username || 'Administrator'}</p>
                </div>
              </div>
            </div>
            {/* Recap Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-emerald-50/90 border border-emerald-200/70 rounded-xl dark:bg-emerald-950/40 dark:border-emerald-800/60">
                <span className="text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block">Tingkat Kehadiran</span>
                <span className="text-lg font-black text-emerald-700 dark:text-emerald-300 mt-0.5 block">{rombelAttendanceRate}%</span>
              </div>
              <div className="p-3.5 bg-sky-50/90 border border-sky-200/70 rounded-xl dark:bg-sky-950/40 dark:border-sky-800/60">
                <span className="text-[11px] font-bold uppercase text-sky-600 dark:text-sky-400 block">Total Siswa</span>
                <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">{classDetailStudents.length || selectedClass?.jumlah_siswa || 0} Siswa</span>
              </div>
              <div className="p-3.5 bg-amber-50/90 border border-amber-200/70 rounded-xl dark:bg-amber-950/40 dark:border-amber-800/60">
                <span className="text-[11px] font-bold uppercase text-amber-600 dark:text-amber-400 block">Total Izin / Sakit</span>
                <span className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5 block">{pendingPermissions.length} Pengajuan</span>
              </div>
              <div className="p-3.5 bg-rose-50/90 border border-rose-200/70 rounded-xl dark:bg-rose-950/40 dark:border-rose-800/60">
                <span className="text-[11px] font-bold uppercase text-rose-600 dark:text-rose-400 block">Perlu Tindak Lanjut</span>
                <span className="text-lg font-black text-rose-600 dark:text-rose-400 mt-0.5 block">{followUps.length} Kasus</span>
              </div>
            </div>

            {/* Recap Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Rekap Kehadiran Siswa Rombel</h4>

              {loadingRombelRecap ? (
                <AppSkeleton rows={4} />
              ) : classDetailStudents.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  Tidak ada data presensi rombel untuk ditampilkan.
                </div>
              ) : (
                <div className="max-h-[350px] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <TableRoot fullBleed={false}>
                    <TableHeader className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900">
                      <TableRow className="bg-slate-50 dark:bg-slate-900/60">
                        <TableHead className="w-10 text-center text-xs font-bold text-slate-700 dark:text-slate-300">No</TableHead>
                        <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">NIS</TableHead>
                        <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">Nama Siswa</TableHead>
                        <TableHead className="text-center text-xs font-bold text-emerald-700 dark:text-emerald-400">Hadir</TableHead>
                        <TableHead className="text-center text-xs font-bold text-sky-700 dark:text-sky-400">Izin</TableHead>
                        <TableHead className="text-center text-xs font-bold text-amber-700 dark:text-amber-400">Sakit</TableHead>
                        <TableHead className="text-center text-xs font-bold text-rose-700 dark:text-rose-400">Alpa</TableHead>
                        <TableHead className="text-center text-xs font-bold text-slate-700 dark:text-slate-300">% Hadir</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classDetailStudents.map((siswaItem, sIdx) => {
                        const sStats = getStudentRecapStats(siswaItem, rombelRecapData)
                        return (
                          <TableRow key={siswaItem.id || sIdx} className="hover:bg-slate-50/90 dark:hover:bg-slate-800/60">
                            <TableCell className="text-center text-xs font-semibold text-slate-500">{sIdx + 1}</TableCell>
                            <TableCell className="text-xs font-mono text-slate-600 dark:text-slate-400">
                              {siswaItem.nis || siswaItem.nisn || '-'}
                            </TableCell>
                            <TableCell className="text-xs font-bold text-slate-900 dark:text-white">
                              {siswaItem.full_name || siswaItem.nama || siswaItem.name || 'Nama Siswa'}
                            </TableCell>
                            <TableCell className="text-center text-xs font-bold text-emerald-600">{sStats.hadir}</TableCell>
                            <TableCell className="text-center text-xs font-semibold text-sky-600">{sStats.izin}</TableCell>
                            <TableCell className="text-center text-xs font-semibold text-amber-600">{sStats.sakit}</TableCell>
                            <TableCell className="text-center text-xs font-semibold text-rose-600">{sStats.alpa}</TableCell>
                            <TableCell className="text-center">
                              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                {sStats.pct}%
                              </span>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </TableRoot>
                </div>
              )}
            </div>
          </DialogBody>

          <DialogFooter className="gap-2.5 sm:justify-end print:hidden">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-100/90 px-4 py-2.5 text-xs font-bold text-amber-700 transition-colors duration-200 hover:bg-amber-500 hover:text-white hover:shadow-md hover:shadow-amber-500/30 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white cursor-pointer shadow-2xs"
              onClick={() => handlePrintModalReport('rombelRecap')}
            >
              <Printer className="size-4 transition-colors" />
              <span>Cetak</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-100/90 px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors duration-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer shadow-2xs"
              onClick={() => setIsRombelRecapModalOpen(false)}
            >
              <span>Tutup</span>
            </button>
          </DialogFooter>
        </Dialog>
      </Backdrop>

      {/* ── 4. Pop-up Modal Pengajuan Izin Menunggu Verifikasi ──────────────────────── */}
      <Backdrop isOpen={isPermissionModalOpen} onOpenChange={setIsPermissionModalOpen}>
        <Dialog className="max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
            <DialogTitle className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white sm:text-lg">
              <FileCheck2 className="h-5 w-5 text-emerald-600" /> Pengajuan Izin Menunggu Verifikasi
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Daftar pengajuan izin/sakit siswa yang diambil langsung dari data pengajuan berstatus menunggu verifikasi.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 dark:border-emerald-900/40 dark:bg-emerald-950/30">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Total Pengajuan</p>
                <p className="mt-0.5 text-lg font-black text-emerald-800 dark:text-emerald-200">{pendingPermissions.length}</p>
              </div>
              <AppBadge variant="warning" dot>Menunggu Verifikasi</AppBadge>
            </div>

            {loadingPermissionModal ? (
              <AppSkeleton rows={5} />
            ) : permissionModalError ? (
              <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{permissionModalError}</span>
              </div>
            ) : pendingPermissions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-10 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                Tidak ada surat izin/sakit siswa yang menunggu verifikasi saat ini.
              </div>
            ) : (
              <div className="max-h-[430px] overflow-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <TableRoot fullBleed={false}>
                  <TableHeader className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900">
                    <TableRow className="bg-slate-50 dark:bg-slate-900/90">
                      <TableHead className="w-12 text-center text-xs font-bold text-slate-700 dark:text-slate-300">No</TableHead>
                      <TableHead className="min-w-[190px] text-xs font-bold text-slate-700 dark:text-slate-300">Siswa</TableHead>
                      <TableHead className="min-w-[110px] text-xs font-bold text-slate-700 dark:text-slate-300">Jenis</TableHead>
                      <TableHead className="min-w-[150px] text-xs font-bold text-slate-700 dark:text-slate-300">Periode</TableHead>
                      <TableHead className="min-w-[150px] text-xs font-bold text-slate-700 dark:text-slate-300">Alasan / Catatan</TableHead>
                      <TableHead className="min-w-[150px] text-xs font-bold text-slate-700 dark:text-slate-300">Diajukan</TableHead>
                      <TableHead className="min-w-[145px] text-center text-xs font-bold text-slate-700 dark:text-slate-300">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingPermissions.map((item, index) => (
                      <TableRow key={item.id || index} className="transition-all duration-200 hover:bg-slate-50/90 dark:hover:bg-slate-800/50">
                        <TableCell className="text-center text-xs font-semibold text-slate-500">{index + 1}</TableCell>
                        <TableCell>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{getStudentName(item)}</p>
                          <p className="mt-0.5 font-mono text-[11px] text-slate-400">NIS/NISN: {getStudentIdentifier(item)}</p>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {formatWorkflowLabel(item.type || item.permission_type || item.jenis)}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                          <p>{formatDate(item.start_date)}</p>
                          {item.end_date && item.end_date !== item.start_date && <p className="text-[11px] text-slate-400">s.d. {formatDate(item.end_date)}</p>}
                        </TableCell>
                        <TableCell className="max-w-[220px] text-xs text-slate-600 dark:text-slate-300">
                          <p className="line-clamp-2">{item.reason || item.notes || '-'}</p>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                          {formatDate(item.submitted_at || item.created_at, true)}
                        </TableCell>
                        <TableCell className="text-center">
                          <AppBadge variant="warning" dot>{formatWorkflowLabel(item.status)}</AppBadge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableRoot>
              </div>
            )}
          </DialogBody>

          <DialogFooter className="border-t border-slate-100 dark:border-slate-800">
            <DialogClose variant="ghost" appearance="outline" size="sm">Tutup</DialogClose>
          </DialogFooter>
        </Dialog>
      </Backdrop>

      {/* ── 5. Pop-up Modal Tindak Lanjut Absensi Siswa ─────────────────────────────── */}
      <Backdrop isOpen={isFollowUpModalOpen} onOpenChange={setIsFollowUpModalOpen}>
        <Dialog className="max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
            <DialogTitle className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white sm:text-lg">
              <HeartPulse className="h-5 w-5 text-rose-600" /> Tindak Lanjut Absensi Siswa
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Daftar kasus tindak lanjut absensi siswa yang masih aktif, diambil langsung dari data sistem.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50/70 px-4 py-3 dark:border-rose-900/40 dark:bg-rose-950/30">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-rose-700 dark:text-rose-300">Total Kasus Aktif</p>
                <p className="mt-0.5 text-lg font-black text-rose-800 dark:text-rose-200">{followUps.length}</p>
              </div>
              <AppBadge variant="danger" dot>Perlu Tindak Lanjut</AppBadge>
            </div>

            {loadingFollowUpModal ? (
              <AppSkeleton rows={5} />
            ) : followUpModalError ? (
              <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{followUpModalError}</span>
              </div>
            ) : followUps.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-10 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                Tidak ada catatan tindak lanjut presensi siswa yang aktif.
              </div>
            ) : (
              <div className="max-h-[430px] overflow-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <TableRoot fullBleed={false}>
                  <TableHeader className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900">
                    <TableRow className="bg-slate-50 dark:bg-slate-900/90">
                      <TableHead className="w-12 text-center text-xs font-bold text-slate-700 dark:text-slate-300">No</TableHead>
                      <TableHead className="min-w-[190px] text-xs font-bold text-slate-700 dark:text-slate-300">Siswa</TableHead>
                      <TableHead className="min-w-[160px] text-xs font-bold text-slate-700 dark:text-slate-300">Kasus</TableHead>
                      <TableHead className="min-w-[145px] text-xs font-bold text-slate-700 dark:text-slate-300">Tanggal</TableHead>
                      <TableHead className="min-w-[120px] text-xs font-bold text-slate-700 dark:text-slate-300">Prioritas</TableHead>
                      <TableHead className="min-w-[220px] text-xs font-bold text-slate-700 dark:text-slate-300">Tindakan</TableHead>
                      <TableHead className="min-w-[145px] text-center text-xs font-bold text-slate-700 dark:text-slate-300">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {followUps.map((item, index) => (
                      <TableRow key={item.id || index} className="transition-all duration-200 hover:bg-slate-50/90 dark:hover:bg-slate-800/50">
                        <TableCell className="text-center text-xs font-semibold text-slate-500">{index + 1}</TableCell>
                        <TableCell>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{getStudentName(item)}</p>
                          <p className="mt-0.5 font-mono text-[11px] text-slate-400">NIS/NISN: {getStudentIdentifier(item)}</p>
                        </TableCell>
                        <TableCell className="text-xs text-slate-700 dark:text-slate-300">
                          <p className="font-semibold">{formatWorkflowLabel(item.case_type || item.type)}</p>
                          {item.occurrence_count && <p className="mt-0.5 text-[11px] text-slate-400">{item.occurrence_count} kejadian</p>}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                          <p>{formatDate(item.case_date || item.tanggal)}</p>
                          {(item.follow_up_date || item.due_date) && (
                            <p className="mt-0.5 text-[11px] text-slate-400">
                              Jadwal: {formatDate(item.follow_up_date || item.due_date)}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <AppBadge variant={getPriorityVariant(item.priority)} dot>{formatWorkflowLabel(item.priority)}</AppBadge>
                        </TableCell>
                        <TableCell className="max-w-[260px] text-xs text-slate-600 dark:text-slate-300">
                          <p className="font-semibold">{item.action || item.action_taken || item.action_type || '-'}</p>
                          {item.notes && <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-400">{item.notes}</p>}
                        </TableCell>
                        <TableCell className="text-center">
                          <AppBadge variant={getFollowUpStatusVariant(item.status)} dot>{formatWorkflowLabel(item.status)}</AppBadge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableRoot>
              </div>
            )}
          </DialogBody>

          <DialogFooter className="border-t border-slate-100 dark:border-slate-800">
            <DialogClose variant="ghost" appearance="outline" size="sm">Tutup</DialogClose>
          </DialogFooter>
        </Dialog>
      </Backdrop>

      {/* ── 6. Pop-up Modal Tambah Jadwal Pelajaran Rombel ──────────────────────────── */}
      <Backdrop isOpen={isAddScheduleModalOpen} onOpenChange={setIsAddScheduleModalOpen}>
        <Dialog className="max-w-lg w-full">
          <DialogHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white text-base sm:text-lg font-black">
              <Plus className="h-5 w-5 text-amber-600" /> Tambah Jadwal Pelajaran - {selectedClass?.nama_kelas}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Tambahkan mata pelajaran dan jadwal untuk rombel {selectedClass?.nama_kelas} ({selectedClass?.unit_name}).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveSchedule}>
            <DialogBody className="space-y-4 my-3">
              {scheduleSuccessMessage && (
                <div role="status" className="flex items-center gap-2 rounded-xl bg-emerald-100/90 border border-emerald-200 px-4 py-3 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                  <span>{scheduleSuccessMessage}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Mata Pelajaran <span className="text-rose-500">*</span>
                </label>
                <select
                  value={scheduleForm.subjectName}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, subjectName: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="">-- Pilih Mata Pelajaran --</option>
                  <option value="Pendidikan Agama Islam">Pendidikan Agama Islam (PAI)</option>
                  <option value="Bahasa Arab">Bahasa Arab</option>
                  <option value="Tahfidz Al-Qur'an">Tahfidz Al-Qur'an</option>
                  <option value="Hadits & Aqidah">Hadits & Aqidah</option>
                  <option value="Matematika">Matematika</option>
                  <option value="IPA (Sains)">IPA (Sains)</option>
                  <option value="IPS (Sosial)">IPS (Sosial)</option>
                  <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                  <option value="Bahasa Inggris">Bahasa Inggris</option>
                  <option value="Pendidikan Pancasila">Pendidikan Pancasila</option>
                  <option value="Lainnya">-- Tulis Mapel Lainnya --</option>
                </select>
              </div>

              {scheduleForm.subjectName === 'Lainnya' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Nama Mata Pelajaran Khusus</label>
                  <input
                    type="text"
                    placeholder="Contoh: Fiqih Ibadah"
                    value={scheduleForm.customSubject}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, customSubject: e.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              )}

              {/* Row 2: Guru Pengampu (Full Width for clean spacing) */}
              <div className="space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Guru Pengampu <span className="text-slate-400 font-normal">(Opsional)</span>
                  </label>
                  <button
                    type="button"
                    title="Lihat Daftar Guru Pengampu"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-100/90 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-600 hover:text-white transition-colors duration-200 shadow-2xs dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-600 dark:hover:text-white cursor-pointer shrink-0"
                    onClick={handleOpenTeachersListModal}
                  >
                    <Users className="size-3.5 transition-colors" />
                    <span>Daftar Guru Pengampu</span>
                  </button>
                </div>
                <select
                  value={scheduleForm.teacherName}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, teacherName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="">-- Pilih Guru Pengampu --</option>
                  {selectedClass?.wali_kelas && (
                    <option value={selectedClass.wali_kelas}>
                      {selectedClass.wali_kelas} (Wali Kelas)
                    </option>
                  )}
                  {teachersList.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({t.subject})
                    </option>
                  ))}
                  <option value="custom">-- Tulis Nama Guru Lainnya --</option>
                </select>

                {scheduleForm.teacherName === 'custom' && (
                  <input
                    type="text"
                    placeholder="Tulis nama lengkap guru pengampu..."
                    value={scheduleForm.customTeacher || ''}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, customTeacher: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                )}
              </div>

              {/* Row 3: Hari & Jam Pelaksanaan (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Hari Pelaksanaan</label>
                  <select
                    value={scheduleForm.day}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, day: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="Senin">Senin</option>
                    <option value="Selasa">Selasa</option>
                    <option value="Rabu">Rabu</option>
                    <option value="Kamis">Kamis</option>
                    <option value="Jumat">Jumat</option>
                    <option value="Sabtu">Sabtu</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Waktu Pelaksanaan</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={scheduleForm.startTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-semibold text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                    <span className="text-xs text-slate-400 font-bold shrink-0">s.d</span>
                    <input
                      type="time"
                      value={scheduleForm.endTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-semibold text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </DialogBody>

            <DialogFooter className="border-t border-slate-100 dark:border-slate-800 gap-2.5 sm:justify-end">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-100/90 px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer shadow-2xs"
                onClick={() => setIsAddScheduleModalOpen(false)}
              >
                <span>Batal</span>
              </button>
              <button
                type="submit"
                disabled={savingSchedule}
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-amber-600 hover:shadow-md hover:shadow-amber-500/30 dark:bg-amber-600 dark:hover:bg-amber-500 cursor-pointer shadow-2xs disabled:opacity-50"
              >
                <Plus className="size-4" />
                <span>{savingSchedule ? 'Menyimpan...' : 'Simpan Jadwal'}</span>
              </button>
            </DialogFooter>
          </form>
        </Dialog>
      </Backdrop>

      {/* ── 7. Pop-up Modal Daftar Guru Pengampu ──────────────────────────────────── */}
      <Backdrop isOpen={isTeachersModalOpen} onOpenChange={setIsTeachersModalOpen}>
        <Dialog className="max-w-3xl w-full max-h-[85vh] overflow-y-auto">
          <DialogHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white text-base sm:text-lg font-black">
              <Users className="h-5 w-5 text-indigo-600" /> Daftar Guru Pengampu & Tenaga Pengajar
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Daftar seluruh guru pengampu mata pelajaran yang terdaftar dalam sistem.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4 my-3">
            {loadingTeachers ? (
              <AppSkeleton rows={5} />
            ) : (teachersList.length > 0 ? teachersList : DEFAULT_TEACHERS).length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-xl">
                Belum ada data guru pengampu yang terdaftar.
              </div>
            ) : (
              <div className="max-h-[380px] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <TableRoot fullBleed={false}>
                  <TableHeader className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900">
                    <TableRow className="bg-slate-50 dark:bg-slate-900/90">
                      <TableHead className="w-10 text-center text-xs font-bold text-slate-700 dark:text-slate-300">No</TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">Nama Guru Pengampu</TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">NIY / NIP</TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">Mata Pelajaran / Bidang</TableHead>
                      <TableHead className="text-center text-xs font-bold text-slate-700 dark:text-slate-300">Status</TableHead>
                      <TableHead className="w-24 text-center text-xs font-bold text-slate-700 dark:text-slate-300">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(teachersList.length > 0 ? teachersList : DEFAULT_TEACHERS).map((teacher, tIdx) => (
                      <TableRow key={teacher.id || tIdx} className="hover:bg-slate-50/90 dark:hover:bg-slate-800/60 transition-colors">
                        <TableCell className="text-center text-xs font-semibold text-slate-500">{tIdx + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar size="sm" className="ring-2 ring-indigo-500/20">
                              <AvatarFallback className="bg-indigo-100 text-indigo-800 font-bold text-xs">
                                {teacher.name?.substring(0, 2).toUpperCase() || 'GR'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{teacher.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-slate-600 dark:text-slate-400">{teacher.niy}</TableCell>
                        <TableCell className="text-xs font-medium text-slate-700 dark:text-slate-300">{teacher.subject}</TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center rounded-full bg-emerald-100/80 border border-emerald-200/80 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-800/60 dark:text-emerald-300">
                            {teacher.status || 'Aktif'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {isAddScheduleModalOpen ? (
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-2xs cursor-pointer"
                              onClick={() => handleSelectTeacher(teacher)}
                            >
                              <span>Pilih</span>
                            </button>
                          ) : (
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Tersedia</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableRoot>
              </div>
            )}
          </DialogBody>

          <DialogFooter className="border-t border-slate-100 dark:border-slate-800">
            <DialogClose variant="ghost" appearance="outline" size="sm">Tutup</DialogClose>
          </DialogFooter>
        </Dialog>
      </Backdrop>
    </motion.div>
  )
}
