import React, { useEffect, useState, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import ActionDropdown from '../components/app/ActionDropdown'
import { AppModal } from '../components/app'
import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Award,
  BarChart3,
  BookMarked,
  BookOpen,
  Calendar,
  CalendarDays,
  CalendarRange,
  Camera,
  CameraOff,
  Check,
  CheckCircle,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Command,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileInput,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  Heart,
  HeartHandshake,
  History,
  Layers,
  Lock,
  MessageSquare,
  MoreVertical,
  PieChart as PieChartIcon,
  Paperclip,
  Play,
  Plus,
  Printer,
  QrCode,
  Radio,
  RefreshCw,
  Save,
  Scan,
  ScanFace,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  Trophy,
  UserCheck,
  User,
  Users,
  Upload,
  Video,
  Wifi,
  X,
  XCircle,
  Zap
} from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { usePengaturanStore } from '../stores/pengaturanStore'
import { ROLES, hasAnyRole } from '../auth/portalResolver'
import useDebounce from '../hooks/useDebounce'
import { Avatar, AvatarFallback, AvatarImage } from '../components/tailgrids/core/avatar'
import { Pagination } from '../components/tailgrids/core/pagination'
import { Button } from '../components/tailgrids/core/button'
import api from '../services/api'
import { equranService } from '../services/equranService'
import {
  MasterDataPage,
  MasterPageHeader,
  MasterActionButton,
  MasterStatCard,
  MasterStatsGrid,
} from '../components/master-data'
import TeacherMutabaahWeekly from '../components/TeacherMutabaahWeekly'
import TeacherTeachingSessionPanel from '../components/attendance/TeacherTeachingSessionPanel'
import ActiveScheduleNotice from '../components/attendance/ActiveScheduleNotice'
import ChatGuruWorkspace from '../components/portal/ChatGuruWorkspace'
import TahfizhReportSummaryPage from './tahfizh/TahfizhReportSummaryPage'
import { VideoEmbedPlayer, PdfDocumentViewer } from '../components/common/MateriMediaEmbed'
import { printCleanTable, downloadPdfTable, printWeeklyStudentEvaluation } from '../utils/printHelper'
import { requestCameraStream, parseCameraError, isBarcodeDetectorSupported } from '../utils/cameraHelper'

function calculatePekanFromDate(dateStr) {
  if (!dateStr) return { pekan: 1, semester: 1, label: 'Pekan 01 (Semester Ganjil)' }
  const target = new Date(dateStr)
  if (isNaN(target.getTime())) return { pekan: 1, semester: 1, label: 'Pekan 01 (Semester Ganjil)' }

  const startGanjil = new Date('2026-07-13T00:00:00')
  const startGenap = new Date('2027-01-04T00:00:00')

  if (target < startGenap) {
    const diffDays = Math.max(0, Math.floor((target.getTime() - startGanjil.getTime()) / (1000 * 60 * 60 * 24)))
    const pekan = Math.max(1, Math.min(16, Math.floor(diffDays / 7) + 1))
    return {
      pekan,
      semester: 1,
      label: `Pekan ${String(pekan).padStart(2, '0')} (Semester Ganjil)`,
    }
  } else {
    const diffDays = Math.max(0, Math.floor((target.getTime() - startGenap.getTime()) / (1000 * 60 * 60 * 24)))
    const pekan = Math.min(32, 16 + Math.max(1, Math.floor(diffDays / 7) + 1))
    const pekanGenap = pekan - 16
    return {
      pekan,
      semester: 2,
      label: `Pekan ${String(pekan).padStart(2, '0')} (Semester Genap - Pekan ${pekanGenap})`,
    }
  }
}

const MateriModalForm = React.memo(function MateriModalForm({
  initialData,
  editingId,
  saving,
  onSave,
  onClose,
}) {
  const [form, setForm] = useState(initialData)

  const handleDateChange = (newDate) => {
    const calc = calculatePekanFromDate(newDate)
    setForm((prev) => {
      let updatedJudul = prev.judul || ''
      const pekanPrefixMatch = updatedJudul.match(/^Pekan\s+\d+:\s*(.*)$/i)
      if (pekanPrefixMatch) {
        updatedJudul = `Pekan ${String(calc.pekan).padStart(2, '0')}: ${pekanPrefixMatch[1]}`
      } else if (!updatedJudul.trim()) {
        updatedJudul = `Pekan ${String(calc.pekan).padStart(2, '0')}: `
      }

      return {
        ...prev,
        tanggal: newDate,
        tanggal_publish: newDate,
        urutan: calc.pekan,
        judul: updatedJudul,
      }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  const pekanInfo = calculatePekanFromDate(form.tanggal)

  return (
    <div className="flex flex-col h-full max-h-[92vh]">
      {/* Top Accent Line */}
      <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-emerald-700 via-emerald-500 to-amber-400" />

      {/* Modal Header */}
      <div className="flex items-center justify-between px-6 py-4.5 border-b border-emerald-500/15 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-transparent shrink-0">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-500/25 border border-emerald-300/30 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
            {editingId ? <Edit3 className="size-5" /> : <BookOpen className="size-5" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100/90 dark:bg-emerald-950/80 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                <Sparkles className="size-2.5 text-amber-500" /> LMS · Materi Pembelajaran
              </span>
              <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${form.status === 'published' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                <span className={`size-1.5 rounded-full ${form.status === 'published' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                {form.status === 'published' ? 'Dipublikasikan' : 'Draft'}
              </span>
            </div>
            <h2 className="mt-1 text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white truncate">
              {editingId ? 'Edit Materi Pembelajaran' : 'Tambah Materi Pembelajaran Baru'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
              Lengkapi bahan ajar, materi, dan jadwal pembelajaran kelas.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-xl p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 ml-2"
          title="Tutup (Esc)"
        >
          <X className="size-5" />
          <span className="sr-only">Tutup</span>
        </button>
      </div>

      {/* Modal Form Body */}
      <form id="form-materi" onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1 custom-scrollbar">
        {/* Tanggal & Otomatis Pekan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-emerald-50/80 border border-emerald-200/90 dark:bg-gradient-to-r dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/40 dark:border-emerald-900/60 shadow-xs">
          <div>
            <label htmlFor="materi-tanggal" className="font-bold block mb-1 text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Tanggal Pembelajaran <span className="text-rose-500">*</span>
            </label>
            <input
              id="materi-tanggal"
              type="date"
              required
              value={form.tanggal || ''}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full p-2.5 border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition"
            />
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
              Tahun Ajaran 2026/2027 Aktif
            </span>
          </div>
          <div>
            <label htmlFor="materi-urutan" className="font-bold block mb-1 text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Pekan Ke- (Otomatis) <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="materi-urutan"
                type="number"
                min={1}
                max={32}
                required
                value={form.urutan || 1}
                onChange={(e) => setForm({ ...form, urutan: parseInt(e.target.value, 10) || 1 })}
                className="w-16 p-2.5 border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-black text-center text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition"
              />
              <span className="flex-1 inline-flex items-center justify-center px-2.5 py-2 rounded-xl bg-emerald-100/90 dark:bg-emerald-900/60 text-[11px] font-bold text-emerald-900 dark:text-emerald-200 text-center truncate border border-emerald-200/80 dark:border-emerald-800/60">
                {pekanInfo.label}
              </span>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
              Diselaraskan otomatis dari tanggal
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="materi-judul" className="font-bold block mb-1.5 text-slate-800 dark:text-slate-200">
            Judul Materi Pembelajaran <span className="text-rose-500">*</span>
          </label>
          <input
            id="materi-judul"
            type="text"
            required
            value={form.judul || ''}
            onChange={(e) => setForm({ ...form, judul: e.target.value })}
            className="w-full p-2.5 border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition placeholder:text-slate-400"
            placeholder="Contoh: Pekan 09: Konsep Dasar Pecahan Senilai"
          />
        </div>

        <div>
          <label htmlFor="materi-ringkasan" className="font-bold block mb-1.5 text-slate-800 dark:text-slate-200">
            Ringkasan Materi
          </label>
          <textarea
            id="materi-ringkasan"
            rows={2}
            value={form.ringkasan || ''}
            onChange={(e) => setForm({ ...form, ringkasan: e.target.value })}
            className="w-full p-2.5 border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition placeholder:text-slate-400"
            placeholder="Ringkasan singkat materi atau pokok bahasan yang akan dipelajari..."
          />
        </div>

        <div>
          <label htmlFor="materi-isi" className="font-bold block mb-1.5 text-slate-800 dark:text-slate-200">
            Isi atau Catatan Materi Lengkap
          </label>
          <textarea
            id="materi-isi"
            rows={4}
            value={form.isi || ''}
            onChange={(e) => setForm({ ...form, isi: e.target.value })}
            className="w-full resize-y p-2.5 border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition placeholder:text-slate-400"
            placeholder="Tuliskan uraian materi, penjelasan materi, atau panduan belajar..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label htmlFor="materi-file" className="font-bold block mb-1.5 text-slate-800 dark:text-slate-200">
              Tautan Dokumen / Modul PDF
            </label>
            <input
              id="materi-file"
              type="url"
              value={form.file || form.link || ''}
              onChange={(e) => setForm({ ...form, file: e.target.value, link: e.target.value })}
              className="w-full p-2.5 border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition placeholder:text-slate-400"
              placeholder="https://.../modul.pdf"
            />
          </div>
          <div>
            <label htmlFor="materi-video" className="font-bold block mb-1.5 text-slate-800 dark:text-slate-200">
              URL Video (YouTube Embed)
            </label>
            <input
              id="materi-video"
              type="url"
              value={form.video || ''}
              onChange={(e) => setForm({ ...form, video: e.target.value })}
              className="w-full p-2.5 border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition placeholder:text-slate-400"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        </div>

        <div>
          <label htmlFor="materi-status" className="font-bold block mb-1.5 text-slate-800 dark:text-slate-200">
            Status Publikasi <span className="text-rose-500">*</span>
          </label>
          <select
            id="materi-status"
            value={form.status || 'published'}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="h-10 w-full border rounded-xl bg-white px-3 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition cursor-pointer"
          >
            <option value="draft">📝 Simpan Sebagai Draft</option>
            <option value="published">✅ Publikasikan Langsung ke Siswa</option>
          </select>
        </div>
      </form>

      {/* Modal Footer */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/60 rounded-b-[24px] shrink-0">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 w-full sm:w-auto justify-center sm:justify-start">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
            <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            Pekan {String(form.urutan || 1).padStart(2, '0')} Terjadwal
          </span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-xs active:scale-[0.98]"
          >
            Batal
          </button>
          <button
            type="submit"
            form="form-materi"
            disabled={saving}
            className="flex-1 sm:flex-initial inline-flex min-w-36 items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:to-teal-900 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
          >
            {saving ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : editingId ? (
              <>
                <Edit3 className="size-4" />
                <span>Perbarui Materi</span>
              </>
            ) : (
              <>
                <Plus className="size-4" />
                <span>Simpan Materi</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
})

export default function TeacherTeachingWorkspacePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const activeTab = searchParams.get('tab') || 'jadwal'

  // Teacher Profile state (Guru Logged In)
  const [teacherProfile, setTeacherProfile] = useState(null)

  // Auth Store & Role Evaluation
  const user = useAuthStore((state) => state.user)
  const userRoles = React.useMemo(() => user?.roles || [], [user])

  // Site Settings Store (Database Logo Yayasan & Identitas Resmi)
  const sitePengaturan = usePengaturanStore((state) => state.pengaturan)
  const muatPengaturan = usePengaturanStore((state) => state.muatPengaturan)
  useEffect(() => {
    muatPengaturan()
  }, [muatPengaturan])

  const isPengurusYayasan = React.useMemo(() => hasAnyRole(userRoles, [
    'Yayasan', 'Ketua Yayasan', 'Pengurus Yayasan', 'Sekretaris Yayasan', 'Bendahara Yayasan',
    'ketua_yayasan', 'pengurus_yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'Super Admin', 'SuperAdmin', 'Admin'
  ]), [userRoles])

  const isKepalaSekolahOrDivisiPendidikan = React.useMemo(() => !isPengurusYayasan && hasAnyRole(userRoles, [
    'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek',
    'Divisi Pendidikan', 'divisi_pendidikan', 'Kepala Bidang Pendidikan', 'Divisi Kurikulum'
  ]), [isPengurusYayasan, userRoles])

  const isGuru = !isPengurusYayasan && !isKepalaSekolahOrDivisiPendidikan

  // Multi-unit Tahfizh Leaderboard state
  const [educationUnits, setEducationUnits] = useState([])
  const [selectedTahfizhUnit, setSelectedTahfizhUnit] = useState('semua')
  const [tahfizhSearch, setTahfizhSearch] = useState('')
  const debouncedTahfizhSearch = useDebounce(tahfizhSearch, 350)
  const [tahfizhPage, setTahfizhPage] = useState(1)
  const TAHFIZH_PER_PAGE = 10

  // Primary data states
  const [classes, setClasses] = useState([])
  const [academicYears, setAcademicYears] = useState([])
  const [schedules, setSchedules] = useState([])
  const [allTeacherSchedules, setAllTeacherSchedules] = useState([])
  const [students, setStudents] = useState([])
  const [materials, setMaterials] = useState([])
  const [assignments, setAssignments] = useState([])
  const [assignmentSearch, setAssignmentSearch] = useState("")
  const [assignmentJenisFilter, setAssignmentJenisFilter] = useState("all")
  const [assignmentStatusFilter, setAssignmentStatusFilter] = useState("all")
  const [studentNotes, setStudentNotes] = useState([])
  const [studentNoteSearch, setStudentNoteSearch] = useState('')
  const [studentNoteCategory, setStudentNoteCategory] = useState('semua')
  const [studentNotePriority, setStudentNotePriority] = useState('semua')
  const [savingStudentNote, setSavingStudentNote] = useState(false)
  const [tahfizhLogs, setTahfizhLogs] = useState([])
  const [quranSurahs, setQuranSurahs] = useState([])
  const [loadingSurahs, setLoadingSurahs] = useState(false)
  const [savingTahfizh, setSavingTahfizh] = useState(false)
  const [loading, setLoading] = useState(false)

  // Teacher Log Absensi Read-Only State
  const [teacherLogAbsensi, setTeacherLogAbsensi] = useState([])

  // Selection & UI states
  const [selectedClass, setSelectedClass] = useState('')
  const [timelineFilter, setTimelineFilter] = useState('auto')
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2026/2027')
  const [selectedSemester, setSelectedSemester] = useState('Ganjil')
  const [selectedDate, setSelectedDate] = useState(() => new Date().toLocaleDateString('en-CA'))

  const isAdminOrSuperAdmin = React.useMemo(() => hasAnyRole(userRoles, [
    ...ROLES.SUPER_ADMIN, ...ROLES.ADMIN
  ]), [userRoles])

  const isTataUsaha = React.useMemo(() => hasAnyRole(userRoles, ROLES.TATA_USAHA), [userRoles])

  const isWaliKelas = React.useMemo(() => {
    const hasWkRole = hasAnyRole(userRoles, ['Wali Kelas', 'walas', 'wali_kelas', 'WaliKelas', 'homeroom_teacher'])
    const isAssignedWaliKelas = classes.some((c) => {
      const matchesClass = !selectedClass || selectedClass === 'all' || String(c.id) === String(selectedClass)
      const wkId = c.wali_kelas_id || c.wali_kelas?.id
      return matchesClass && (wkId && String(wkId) === String(teacherProfile?.id))
    })
    return Boolean(hasWkRole || isAssignedWaliKelas || teacherProfile?.is_wali_kelas)
  }, [userRoles, classes, selectedClass, teacherProfile])

  // Kewenangan mencetak seluruh mata pelajaran: Wali Kelas, TU, Kepala Sekolah, Divisi Pendidikan, Admin, Super Admin, dan Pengurus Yayasan
  const canViewAllSubjects = React.useMemo(() => Boolean(
    isPengurusYayasan ||
    isAdminOrSuperAdmin ||
    isKepalaSekolahOrDivisiPendidikan ||
    isTataUsaha ||
    isWaliKelas
  ), [isPengurusYayasan, isAdminOrSuperAdmin, isKepalaSekolahOrDivisiPendidikan, isTataUsaha, isWaliKelas])

  // Live Realtime Clock for Attendance & Schedule tracking
  const [currentLiveTime, setCurrentLiveTime] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setCurrentLiveTime(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const formattedLiveTime = useMemo(() => {
    return currentLiveTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB'
  }, [currentLiveTime])

  const formattedLiveDate = useMemo(() => {
    return currentLiveTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }, [currentLiveTime])

  // Modals state
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('') // 'materi', 'tugas', 'tahfizh', 'catatan', 'delete-confirm'
  const [editingId, setEditingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Dedicated Buka Presensi Session Modal Popup state
  const [showPresensiModal, setShowPresensiModal] = useState(false)
  const [presensiModalSchedule, setPresensiModalSchedule] = useState(null)
  const [showMulaiMengajarModal, setShowMulaiMengajarModal] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle') // 'idle' | 'saving' | 'saved' | 'error'

  // Tahfizh Form Interactive Search Popup Modals
  const [showStudentSearchModal, setShowStudentSearchModal] = useState(false)
  const [showSetoranTypeModal, setShowSetoranTypeModal] = useState(false)
  const [showSurahSearchModal, setShowSurahSearchModal] = useState(false)
  const [studentModalSearch, setStudentModalSearch] = useState('')
  const [surahModalSearch, setSurahModalSearch] = useState('')

  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFormat, setExportFormat] = useState('xlsx')

  // Import Modal & Parser State
  const [showImportModal, setShowImportModal] = useState(false)
  const [importTarget, setImportTarget] = useState('presensi') // 'presensi' or 'penilaian'
  const [importFile, setImportFile] = useState(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [importSuccessCount, setImportSuccessCount] = useState(0)
  const importFileInputRef = useRef(null)

  const [showDetailModal, setShowDetailModal] = useState(false)
  // Submissions Modal State (Periksa Jawaban & Nilai Tugas)
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false)
  const [selectedAssignmentForSubmissions, setSelectedAssignmentForSubmissions] = useState(null)
  const [submissionsList, setSubmissionsList] = useState([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)
  const [savingGradeId, setSavingGradeId] = useState(null)
  const [submissionSearch, setSubmissionSearch] = useState('')
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState('all')
  const [detailData, setDetailData] = useState(null)
  const [showTahfizhDetail, setShowTahfizhDetail] = useState(false)
  const [tahfizhDetailStudent, setTahfizhDetailStudent] = useState(null)
  const [tahfizhWeekOffset, setTahfizhWeekOffset] = useState(0)

  const [showAktivitasModal, setShowAktivitasModal] = useState(false)
  const [showQuickMenu, setShowQuickMenu] = useState(false)

  // Command Palette State (Ctrl + K / Cmd + K)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [commandQuery, setCommandQuery] = useState('')

  // Face Recognition Modal Pop-Up state
  const [showFaceModal, setShowFaceModal] = useState(false)
  const [faceStudentId, setFaceStudentId] = useState('')
  const [faceStatus, setFaceStatus] = useState('Hadir')
  const [faceNotes, setFaceNotes] = useState('')

  // Search & Filter state inside workspace
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('semua')
  const [kelompokFilter, setKelompokFilter] = useState('semua')
  const [materialSearch, setMaterialSearch] = useState('')
  const [materialStatusFilter, setMaterialStatusFilter] = useState('semua')
  const [materialMapelFilter, setMaterialMapelFilter] = useState('all')
  const [materialPage, setMaterialPage] = useState(1)
  const [materialMeta, setMaterialMeta] = useState({ current_page: 1, last_page: 1, total: 0, from: null, to: null })
  const [materialError, setMaterialError] = useState('')
  const [savingMaterial, setSavingMaterial] = useState(false)
  const [savingTugas, setSavingTugas] = useState(false)
  const debouncedMaterialSearch = useDebounce(materialSearch, 350)

  // Attendance state & Scanner methods
  const [attendanceData, setAttendanceData] = useState({})
  const [attendanceTopic, setAttendanceTopic] = useState('Pembelajaran Tatap Muka')
  const [meetingNumber, setMeetingNumber] = useState(1)
  const [selectedMethod, setSelectedMethod] = useState('rollcall') // 'rollcall', 'qr', 'rfid', 'face'
  const [showAttendanceMethodModal, setShowAttendanceMethodModal] = useState(false)
  const [attendanceCenterTab, setAttendanceCenterTab] = useState('presensi')
  const [attendanceSearch, setAttendanceSearch] = useState('')
  const debouncedAttendanceSearch = useDebounce(attendanceSearch, 350)
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('')
  const [attendancePeriodFilter, setAttendancePeriodFilter] = useState('harian') // 'harian', 'mingguan', 'bulanan', 'semester'
  const [attendanceDateFilter, setAttendanceDateFilter] = useState(new Date().toLocaleDateString('en-CA'))
  const [attendanceWeekFilter, setAttendanceWeekFilter] = useState('pekan_ini')
  const [attendanceMonthFilter, setAttendanceMonthFilter] = useState('09')
  const [attendanceSemesterFilter, setAttendanceSemesterFilter] = useState('1')
  const [attendancePage, setAttendancePage] = useState(1)
  const [attendancePerPage, setAttendancePerPage] = useState(10)
  const [selectedStudentAttendanceDetail, setSelectedStudentAttendanceDetail] = useState(null)
  const [showStudentAttendanceDetailModal, setShowStudentAttendanceDetailModal] = useState(false)
  const [studentDetailPeriodFilter, setStudentDetailPeriodFilter] = useState('bulanan') // 'harian', 'mingguan', 'bulanan', 'semester'
  const [studentDetailPage, setStudentDetailPage] = useState(1)
  const studentDetailPerPage = 10
  const [studentDetailSessions, setStudentDetailSessions] = useState([])
  const [loadingStudentDetailSessions, setLoadingStudentDetailSessions] = useState(false)
  const [historySessions, setHistorySessions] = useState([])
  const [historySessionsPage, setHistorySessionsPage] = useState(1)
  const historySessionsPerPage = 10
  const [loadingHistorySessions, setLoadingHistorySessions] = useState(false)
  const [selectedHistorySession, setSelectedHistorySession] = useState(null)
  const [showHistorySessionModal, setShowHistorySessionModal] = useState(false)
  const [historySessionStudentSearch, setHistorySessionStudentSearch] = useState('')
  const [penilaianPage, setPenilaianPage] = useState(1)
  const penilaianPerPage = 10

  // Datatable Interactive Sorting states
  const [attendanceSortField, setAttendanceSortField] = useState('name') // 'name', 'nis', 'status', 'time'
  const [attendanceSortOrder, setAttendanceSortOrder] = useState('asc') // 'asc', 'desc'
  const [gradeSortField, setGradeSortField] = useState('name') // 'name', 'nis', 'tugas', 'kuis', 'uts', 'uas', 'akhir'
  const [gradeSortOrder, setGradeSortOrder] = useState('asc') // 'asc', 'desc'
  const [catatanSortField, setCatatanSortField] = useState('name') // 'name', 'nis', 'count', 'date'
  const [catatanSortOrder, setCatatanSortOrder] = useState('asc') // 'asc', 'desc'

  // Scanner interactive states
  const [scanInput, setScanInput] = useState('')
  const [lastScannedResult, setLastScannedResult] = useState(null)
  const [scanProcessing, setScanProcessing] = useState(false)
  const scanInputRef = useRef(null)
  const [showQrCamera, setShowQrCamera] = useState(false)
  const [qrCameraActive, setQrCameraActive] = useState(false)
  const [qrCameraError, setQrCameraError] = useState('')
  const [qrCameraErrorInfo, setQrCameraErrorInfo] = useState(null)
  const qrVideoRef = useRef(null)
  const qrStreamRef = useRef(null)
  const qrDetectorTimerRef = useRef(null)
  const materialRequestRef = useRef(0)

  // Grade state
  const [gradesData, setGradesData] = useState({})

  // Form states
  const [materiForm, setMateriForm] = useState({ judul: '', subject_id: '', class_id: '', ringkasan: '', isi: '', status: 'published' })
  const [tugasForm, setTugasForm] = useState({ judul: '', subject_id: '', class_id: '', materi_id: '', materi_ids: [], instruksi: '', deskripsi: '', tipe_tugas: 'both', jenis_tugas: 'tugas', jenis_soal: 'essay', deadline: '', bobot: 100, durasi_menit: 30, nilai_kkm: 75, file_lampiran: null, file_lampiran_preview: null, existing_file_url: null })
  // CBT Quiz Interactive Runner Preview State
  const [cbtPreviewModal, setCbtPreviewModal] = useState(null)
  const [cbtCurrentIdx, setCbtCurrentIdx] = useState(0)
  const [cbtAnswers, setCbtAnswers] = useState({})
  const [cbtDoubtful, setCbtDoubtful] = useState({})
  const [cbtFinishedScore, setCbtFinishedScore] = useState(null)
  // Bank-Soal style: soal list within the tugas modal
  const defaultSoalForm = { tipe: 'pg', pertanyaan: '', opsi_a: '', opsi_b: '', opsi_c: '', opsi_d: '', opsi_e: '', kunci_jawaban: 'A', poin: 2, tingkat_kesulitan: 'sedang', indikator: '', pembahasan: '', matchingPairs: [{ kiri: '', kanan: '' }, { kiri: '', kanan: '' }] }
  const [soalList, setSoalList] = useState([])
  const [soalForm, setSoalForm] = useState(defaultSoalForm)
  const [editingSoalIdx, setEditingSoalIdx] = useState(null)
  const emptyCatatanForm = { student_id: '', date: new Date().toLocaleDateString('en-CA'), category: 'Akademik', title: '', content: '', priority: 'medium', follow_up: '', visible_to_parent: true, visible_to_student: true }
  const [catatanForm, setCatatanForm] = useState(emptyCatatanForm)
  const [tahfizhForm, setTahfizhForm] = useState({ student_id: '', class_id: '', type: 'Ziyadah', juz: 30, surah_number: '', ayat_start: 1, ayat_end: 1, kelancaran: 'Sangat Lancar', tajwid: 'Baik', makhraj: 'Baik', notes_teacher: '' })

  // Weekly Schedule & Filters State
  const [weeklySelectedDay, setWeeklySelectedDay] = useState('Jum')
  const [teacherLogMonth, setTeacherLogMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const [teacherLogStatus, setTeacherLogStatus] = useState('semua')
  const [jadwalLengkapTab, setJadwalLengkapTab] = useState('Hari')
  const [academicCalendarEvents, setAcademicCalendarEvents] = useState([])
  const [selectedHariFilter, setSelectedHariFilter] = useState('Semua')
  const [jadwalLengkapSemester, setJadwalLengkapSemester] = useState('Semester Ganjil')

  const filteredTeacherLogs = useMemo(() => {
    return teacherLogAbsensi.filter((log) => {
      if (teacherLogStatus !== 'semua' && log.status?.toLowerCase() !== teacherLogStatus.toLowerCase()) {
        return false
      }
      if (teacherLogMonth !== 'semua' && log.date && !log.date.startsWith(teacherLogMonth)) {
        return false
      }
      return true
    })
  }, [teacherLogAbsensi, teacherLogStatus, teacherLogMonth])

  // Toast Notification State
  const [toasts, setToasts] = useState([])

  const addToast = (type, title, message) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, type, title, message }])
    setTimeout(() => {
      removeToast(id)
    }, 5000)
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  // Global Keyboard Listener (Escape closes modals, Ctrl+K opens Command Palette)
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setShowCommandPalette((prev) => !prev)
        return
      }

      if (event.key !== 'Escape') return

      if (showCommandPalette) {
        setShowCommandPalette(false)
      } else if (showAttendanceMethodModal) {
        setShowAttendanceMethodModal(false)
      } else if (showPresensiModal) {
        setShowPresensiModal(false)
      } else if (showFaceModal) {
        setShowFaceModal(false)
      } else if (showModal) {
        setShowModal(false)
      } else if (showSubmissionsModal) {
        setShowSubmissionsModal(false)
      } else if (showDetailModal) {
        setShowDetailModal(false)
      } else if (showTahfizhDetail) {
        setShowTahfizhDetail(false)
      } else if (showExportModal) {
        setShowExportModal(false)
      } else if (showAktivitasModal) {
        setShowAktivitasModal(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showCommandPalette, showAttendanceMethodModal, showPresensiModal, showFaceModal, showModal, showDetailModal, showTahfizhDetail, showExportModal, showAktivitasModal])

  useEffect(() => {
    if (activeTab === 'jadwal') fetchSchedules()
    if (activeTab === 'presensi') fetchStudentsForClass()
    if (activeTab === 'penugasan') {
      fetchAssignments()
      if (materials.length === 0) fetchMaterials()
    }
    if (activeTab === 'penilaian') { fetchStudentsForClass(); fetchGrades(); }
    if (activeTab === 'tahfizh' || activeTab === 'rekapan-tahfizh') {
      fetchEducationUnits()
      fetchStudentsForClass()
      fetchTahfizh()
      fetchQuranSurahs()
    }
    if (activeTab === 'mutabaah') {
      fetchStudentsForClass()
    }
    if (activeTab === 'catatan') {
      fetchStudentsForClass()
      fetchStudentNotes()
    }
    if (activeTab === 'log-absensi') {
      fetchTeacherAttendanceLogs(teacherLogMonth)
    }
  }, [activeTab, selectedClass])

  useEffect(() => {
    if (activeTab !== 'materi') return
    fetchMaterials()
  }, [activeTab, selectedClass, materialStatusFilter, materialMapelFilter, debouncedMaterialSearch, materialPage])

  useEffect(() => {
    setMaterialPage(1)
  }, [selectedClass, materialStatusFilter, materialMapelFilter, debouncedMaterialSearch])

  useEffect(() => {
    setTahfizhPage(1)
  }, [selectedClass, selectedTahfizhUnit, debouncedTahfizhSearch, activeTab])

  useEffect(() => {
    if (activeTab !== 'catatan') return undefined
    const timer = window.setTimeout(fetchStudentNotes, 300)
    return () => window.clearTimeout(timer)
  }, [studentNoteSearch, studentNoteCategory, studentNotePriority])

  useEffect(() => {
    setLastScannedResult(null)
  }, [selectedClass])

  useEffect(() => () => {
    if (qrDetectorTimerRef.current) window.clearInterval(qrDetectorTimerRef.current)
    qrStreamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      const resDash = await api.get('/teacher/dashboard').catch(() => null)
      const resCal = await api.get('/teacher/academic-calendar').catch(() => null)
      if (resCal?.data?.data) {
        setAcademicCalendarEvents(resCal.data.data)
      } else if (resDash?.data?.data?.announcements) {
        setAcademicCalendarEvents(resDash.data.data.announcements)
      }
      if (resDash?.data?.data?.teacher) {
        setTeacherProfile({
          ...resDash.data.data.teacher,
          education_unit_data: resDash.data.data.teacher.education_unit_data || resDash.data.data.teacher.education_unit,
        })
      }
      if (resDash?.data?.data?.academic_context) {
        if (resDash.data.data.academic_context.academic_year) {
          setSelectedAcademicYear(resDash.data.data.academic_context.academic_year)
        }
        if (resDash.data.data.academic_context.semester) {
          setSelectedSemester(resDash.data.data.academic_context.semester)
        }
      }
      if (resDash?.data?.data?.teacher_attendance_logs && Array.isArray(resDash.data.data.teacher_attendance_logs)) {
        setTeacherLogAbsensi(resDash.data.data.teacher_attendance_logs)
      } else {
        const resProf = await api.get('/teacher/profile').catch(() => null)
        if (resProf?.data?.data?.user) {
          const teacherObj = resProf.data.data.teacher
          const unitObj = teacherObj?.education_unit || teacherObj?.educationUnit || resProf.data.data.unit
          setTeacherProfile({
            id: teacherObj?.id,
            name: resProf.data.data.user?.name || resProf.data.data.user?.email || 'Guru',
            nip_niy: teacherObj?.employee_number || resProf.data.data.user?.nip_niy || resProf.data.data.user?.email || '-',
            education_unit: unitObj?.name || (typeof teacherObj?.education_unit === 'string' ? teacherObj.education_unit : '-'),
            education_unit_data: unitObj || null,
          })
        }
      }

      const resClasses = await api.get('/teacher/classes')
      if (resClasses?.data?.data) {
        setClasses(resClasses.data.data)
        if (resClasses.data.data.length > 0 && (!selectedClass || selectedClass === 'all')) {
          setSelectedClass(String(resClasses.data.data[0].id))
        }
      }
      const resAllSch = await api.get('/teacher/schedules').catch(() => null)
      if (resAllSch?.data?.data) {
        setAllTeacherSchedules(resAllSch.data.data)
        setSchedules(resAllSch.data.data)
      }

      // Eagerly fetch core operational dataset so Master KPI cards show real database counts immediately
      await Promise.allSettled([
        fetchStudentsForClass(),
        fetchMaterials(),
        fetchAssignments(),
        fetchTahfizh(),
        fetchStudentNotes(),
      ])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentsForClass = async (overrideClassId = null) => {
    setLoading(true)
    try {
      const classIdToUse = overrideClassId !== null ? overrideClassId : selectedClass
      const params = {
        per_page: (isPengurusYayasan || isKepalaSekolahOrDivisiPendidikan) ? 500 : 100,
      }
      if (classIdToUse && classIdToUse !== 'all') {
        params.class_id = classIdToUse
        params.kelas_id = classIdToUse
      }

      let res = await api.get('/teacher/students', { params }).catch(() => null)
      if (!res?.data?.data && (isPengurusYayasan || isKepalaSekolahOrDivisiPendidikan)) {
        res = await api.get('/students', { params }).catch(() => null)
      }

      if (res?.data?.data) {
        const responseData = res.data.data
        const rawStudents = Array.isArray(responseData) ? responseData : responseData.data || []

        // Deduplikasi ketat berdasarkan ID siswa unik agar tidak pernah terjadi data ganda di tabel
        const uniqueStudentsMap = new Map()
        rawStudents.forEach((student) => {
          if (student?.id && !uniqueStudentsMap.has(String(student.id))) {
            uniqueStudentsMap.set(String(student.id), student)
          }
        })
        const deduplicatedRawStudents = Array.from(uniqueStudentsMap.values())

        const filteredRawStudents = (classIdToUse && classIdToUse !== 'all')
          ? deduplicatedRawStudents.filter((student) => {
              const sClassId = student.kelas_id || student.class_id || student.kelas?.id
              // Strict: hanya siswa dengan kelas_id yang cocok yang lolos
              return !!sClassId && String(sClassId) === String(classIdToUse)
            })
          : deduplicatedRawStudents

        const stdList = (filteredRawStudents || []).map((student) => {
          const studentUnit = student.education_unit || student.kelas?.unit_pendidikan || (typeof student.unit === 'object' ? student.unit : null)
          const targetClassObj = classes.find((c) => String(c.id) === String(student.kelas_id || student.class_id || classIdToUse))
          const resolvedClassName = student.kelas?.nama_kelas || student.kelas?.name || targetClassObj?.nama_kelas || targetClassObj?.name || student.class_name || 'Kelas -'

          return {
            ...student,
            id: student.id,
            nama_lengkap: student.nama_lengkap || student.full_name || student.name || 'Siswa',
            nis: student.nis || student.nisn || '',
            education_unit: studentUnit,
            unit_name: studentUnit?.name || student.unit_name || 'Unit Sekolah',
            unit_logo: studentUnit?.logo_url || studentUnit?.metadata?.logo_url || '',
            class_name: resolvedClassName,
            education_unit_id: student.education_unit_id || student.unit_id || student.kelas?.unit_pendidikan_id || studentUnit?.id || '',
          }
        })
        setStudents(stdList)

        // Initialize default attendance & grade states
        const initialAtt = {}
        const initialGrade = {}
        stdList.forEach((s) => {
          initialAtt[s.id] = { status: 'Belum Dicatat', notes: '', check_in_time: '', method: '' }
          initialGrade[s.id] = { nilai_tugas: '', nilai_kuis: '', nilai_uts: '', nilai_uas: '', nilai_akhir: '' }
        })
        setAttendanceData(initialAtt)
        setGradesData(initialGrade)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchGrades = async () => {
    try {
      const cid = getCurrentClassId()
      const sid = getCurrentSubjectId()
      if (!cid) return
      const url = sid ? `/teacher/grades?class_id=${cid}&subject_id=${sid}` : `/teacher/grades?class_id=${cid}`
      const res = await api.get(url)
      if (res?.data?.data && Array.isArray(res.data.data)) {
        const loadedGrades = {}
        res.data.data.forEach((item) => {
          if (item.student_id) {
            loadedGrades[item.student_id] = {
              nilai_tugas: item.nilai_tugas ?? item.score_assignment ?? '',
              nilai_kuis: item.nilai_kuis ?? item.score_quiz ?? '',
              nilai_uts: item.nilai_uts ?? item.score_midterm ?? '',
              nilai_uas: item.nilai_uas ?? item.score_final ?? '',
              nilai_akhir: item.nilai_akhir ?? item.final_score ?? '',
            }
          }
        })
        setGradesData((prev) => ({ ...prev, ...loadedGrades }))
      }
    } catch (e) {
      console.error('Failed to load grades from DB:', e)
    }
  }

  const fetchSchedules = async () => {
    setLoading(true)
    try {
      const params = {}
      if (selectedClass && selectedClass !== 'all') {
        params.class_id = selectedClass
        params.kelas_id = selectedClass
      }
      const res = await api.get('/teacher/schedules', { params })
      if (res?.data?.data) {
        setSchedules(res.data.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistorySessions = async () => {
    setLoadingHistorySessions(true)
    try {
      const params = {
        per_page: 50,
      }
      if (selectedClass && selectedClass !== 'all') {
        params.class_id = selectedClass
        params.kelas_id = selectedClass
      }

      // Hitung rentang tanggal berdasarkan attendancePeriodFilter
      if (attendancePeriodFilter === 'harian') {
        const targetDate = attendanceDateFilter || '2026-09-10'
        params.date_from = targetDate
        params.date_to = targetDate
      } else if (attendancePeriodFilter === 'mingguan') {
        let refDate = new Date(attendanceDateFilter || '2026-09-10')
        if (attendanceWeekFilter && attendanceWeekFilter.startsWith('pekan_') && attendanceWeekFilter !== 'pekan_ini') {
          const weekNum = parseInt(attendanceWeekFilter.replace('pekan_', ''), 10) || 1
          const baseMonday = new Date('2026-07-06T00:00:00')
          baseMonday.setDate(baseMonday.getDate() + (weekNum - 1) * 7)
          refDate = baseMonday
        }
        const day = refDate.getDay()
        const diffToMon = refDate.getDate() - day + (day === 0 ? -6 : 1)
        const monday = new Date(refDate)
        monday.setDate(diffToMon)
        const sunday = new Date(monday)
        sunday.setDate(monday.getDate() + 6)
        params.date_from = monday.toISOString().split('T')[0]
        params.date_to = sunday.toISOString().split('T')[0]
      } else if (attendancePeriodFilter === 'bulanan') {
        const mStr = attendanceMonthFilter || '09'
        const mNum = parseInt(mStr, 10)
        const yNum = mNum >= 7 ? 2026 : 2027
        const startDate = `${yNum}-${String(mNum).padStart(2, '0')}-01`
        const lastDay = new Date(yNum, mNum, 0).getDate()
        const endDate = `${yNum}-${String(mNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
        params.date_from = startDate
        params.date_to = endDate
      } else if (attendancePeriodFilter === 'semester') {
        if (attendanceSemesterFilter === '2') {
          params.date_from = '2027-01-01'
          params.date_to = '2027-06-30'
        } else {
          params.date_from = '2026-07-01'
          params.date_to = '2026-12-31'
        }
      }

      const res = await api.get('/lesson-attendance/sessions', { params })
      const list = res?.data?.data?.data || res?.data?.data || []
      setHistorySessions(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error('Failed to load history sessions:', err)
      setHistorySessions([])
    } finally {
      setLoadingHistorySessions(false)
    }
  }

  const fetchMaterials = async () => {
    const requestId = ++materialRequestRef.current
    setLoading(true)
    setMaterialError('')
    try {
      const params = { per_page: 24, page: materialPage }
      if (selectedClass && selectedClass !== 'all') {
        params.class_id = selectedClass
      }
      if (debouncedMaterialSearch.trim()) params.search = debouncedMaterialSearch.trim()
      if (materialStatusFilter !== 'semua') params.status = materialStatusFilter
      if (materialMapelFilter && materialMapelFilter !== 'all') params.subject_id = materialMapelFilter
      const res = await api.get('/teacher/materials', { params })
      const raw = res?.data?.data
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : [])
      if (requestId !== materialRequestRef.current) return
      setMaterials(list)
      setMaterialMeta({
        current_page: Number(raw?.current_page) || materialPage,
        last_page: Number(raw?.last_page) || 1,
        total: Number(raw?.total) || list.length,
        from: raw?.from ?? null,
        to: raw?.to ?? null,
      })
    } catch (e) {
      if (requestId !== materialRequestRef.current) return
      console.error(e)
      setMaterialError(e?.response?.data?.message || 'Materi belajar gagal dimuat.')
    } finally {
      if (requestId === materialRequestRef.current) setLoading(false)
    }
  }

  const fetchAssignments = async () => {
    setLoading(true)
    try {
      const params = { per_page: 100 }
      if (selectedClass && selectedClass !== 'all') {
        params.class_id = selectedClass
      }
      const res = await api.get('/teacher/assignments', { params })
      const raw = res?.data?.data
      // Handle both paginated (raw.data) and plain array responses
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : [])
      setAssignments(list)
    } catch (e) {
      console.error(e)
      setAssignments([])
    } finally {
      setLoading(false)
    }
  }

  const fetchEducationUnits = async () => {
    try {
      const res = await api.get('/education-units').catch(() => null)
      if (res?.data?.data) {
        const list = Array.isArray(res.data.data) ? res.data.data : res.data.data.data || []
        setEducationUnits(list)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchTahfizh = async () => {
    setLoading(true)
    try {
      const params = {
        per_page: (isPengurusYayasan || isKepalaSekolahOrDivisiPendidikan) ? 500 : 200,
      }
      if (selectedClass && selectedClass !== 'all') {
        params.class_id = selectedClass
        params.kelas_id = selectedClass
      }

      let res = await api.get('/teacher/tahfizh', { params }).catch(() => null)
      if (!res?.data?.data?.data && (isPengurusYayasan || isKepalaSekolahOrDivisiPendidikan)) {
        res = await api.get('/tahfizh/report', { params }).catch(() => null)
      }
      if (res?.data?.data?.data) {
        setTahfizhLogs(res.data.data.data)
      } else if (Array.isArray(res?.data?.data)) {
        setTahfizhLogs(res.data.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuranSurahs = async () => {
    if (quranSurahs.length) return
    setLoadingSurahs(true)
    try {
      setQuranSurahs(await equranService.getSurahs())
    } catch (error) {
      console.error(error)
      addToast('error', 'Master Al-Qur’an Gagal Dimuat', 'Daftar surah belum dapat dimuat. Silakan coba lagi.')
    } finally {
      setLoadingSurahs(false)
    }
  }

  const fetchStudentNotes = async () => {
    setLoading(true)
    try {
      const params = {
        class_id: selectedClass || undefined,
        search: studentNoteSearch || undefined,
        category: studentNoteCategory === 'semua' ? undefined : studentNoteCategory,
        priority: studentNotePriority === 'semua' ? undefined : studentNotePriority,
        per_page: 50,
      }
      const res = await api.get('/teacher/student-notes', { params })
      if (res?.data?.data?.data) setStudentNotes(res.data.data.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchTeacherAttendanceLogs = async (month = teacherLogMonth) => {
    try {
      const params = {}
      if (month && month !== 'semua') {
        params.month = month
      }
      const res = await api.get('/teacher/attendance-logs', { params }).catch(() => null)
      if (res?.data?.data) {
        setTeacherLogAbsensi(res.data.data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (activeTab === 'log-absensi') {
      fetchTeacherAttendanceLogs(teacherLogMonth)
    }
  }, [teacherLogMonth])

  const openCatatanForm = (note = null, student = null) => {
    setEditingId(note?.id || null)
    setCatatanForm(note ? {
      student_id: note.student_id,
      date: note.date || new Date().toLocaleDateString('en-CA'),
      category: note.category || 'Akademik',
      title: note.title || '',
      content: note.content || '',
      priority: note.priority || 'medium',
      follow_up: note.follow_up || '',
      visible_to_parent: Boolean(note.visible_to_parent),
      visible_to_student: Boolean(note.visible_to_student),
    } : { ...emptyCatatanForm, student_id: student?.id || '' })
    setModalType('catatan')
    setShowModal(true)
  }

  const openCatatanDetail = (note) => {
    setDetailData({
      title: note.title,
      category: `Catatan ${note.category}`,
      items: [
        { label: 'Siswa', value: note.student?.nama_lengkap || note.student?.full_name || '-' },
        { label: 'Tanggal', value: note.date || '-' },
        { label: 'Prioritas', value: note.priority || 'medium' },
        { label: 'Isi catatan', value: note.content },
        { label: 'Tindak lanjut', value: note.follow_up || 'Belum ditentukan' },
        { label: 'Akses', value: `${note.visible_to_parent ? 'Orang tua' : ''}${note.visible_to_parent && note.visible_to_student ? ' & ' : ''}${note.visible_to_student ? 'Siswa' : ''}` || 'Internal guru' },
      ],
    })
    setShowDetailModal(true)
  }

  const handlePrintWeeklyEvaluation = (student) => {
    try {
      const targetStudent = student
        || (paginatedAttendanceStudents && paginatedAttendanceStudents.length > 0 ? paginatedAttendanceStudents[0] : null)
        || (students && students.length > 0 ? students[0] : null)
        || {
          nama_lengkap: 'Santri Darel Iman',
          nis: '2026001',
          kelas: { nama_kelas: selectedClassName || 'Kelas X SMA Terpadu' }
        }

      const studentDisplayName = targetStudent.nama_lengkap || targetStudent.full_name || targetStudent.name || 'Santri'
      addToast('info', 'Mencetak Evaluasi Pekanan', `Menyiapkan dialog cetak lembar evaluasi mingguan untuk ${studentDisplayName}...`)

      const studentTahfizh = (tahfizhLogs || []).find((t) => t.id === targetStudent?.id || t.student_id === targetStudent?.id)
      const lastSurah = studentTahfizh?.hafalan_surah_name || studentTahfizh?.last_surah || "Ali 'Imran ayat 135-137"
      const lastDepositDate = studentTahfizh?.record_date || 'Jumat, 14 Agustus 2026'
      const totalLines = studentTahfizh?.total_lines != null ? studentTahfizh.total_lines : 34
      const targetLines = studentTahfizh?.target_lines != null ? studentTahfizh.target_lines : 15

      const notes = (studentNotes || []).filter((n) => n.student_id === targetStudent?.id)
      const teacherNotesText = notes.length > 0
        ? notes.map((n) => `${n.title ? n.title + ': ' : ''}${n.content || ''}`).join(' · ')
        : "Alhamdulillah ananda menunjukkan kedisiplinan belajar yang sangat baik dan capaian hafalan Al-Qur'an melampaui target pekanan (34 dari target 15 baris). Mohon Ayah/Bunda senantiasa memantau dan mendampingi muraja'ah di rumah."

      const weeklyAttendance = [
        { dayDate: 'Senin, 10 Agustus 2026', time: '07:30 - 08:50', subject: 'Ekonomi', status: 'Hadir' },
        { dayDate: 'Senin, 10 Agustus 2026', time: '09:05 - 10:25', subject: 'Kimia', status: 'Hadir' },
        { dayDate: 'Senin, 10 Agustus 2026', time: '10:40 - 12:00', subject: 'PKN', status: 'Hadir' },
        { dayDate: 'Senin, 10 Agustus 2026', time: '13:00 - 14:30', subject: 'Tahsin dan Tahfidz', status: 'Hadir' },

        { dayDate: 'Selasa, 11 Agustus 2026', time: '07:30 - 08:50', subject: 'Informatika', status: 'Hadir' },
        { dayDate: 'Selasa, 11 Agustus 2026', time: '09:05 - 10:25', subject: 'Matematika', status: 'Hadir' },
        { dayDate: 'Selasa, 11 Agustus 2026', time: '10:40 - 12:00', subject: 'Pendidikan Agama Islam', status: 'Hadir' },
        { dayDate: 'Selasa, 11 Agustus 2026', time: '13:00 - 14:30', subject: 'Tahsin dan Tahfidz', status: 'Hadir' },

        { dayDate: 'Rabu, 12 Agustus 2026', time: '07:30 - 08:30', subject: 'Biologi', status: 'Hadir' },
        { dayDate: 'Rabu, 12 Agustus 2026', time: '08:30 - 09:30', subject: 'Fisika', status: 'Hadir' },
        { dayDate: 'Rabu, 12 Agustus 2026', time: '09:45 - 10:45', subject: 'PJOK', status: 'Hadir' },
        { dayDate: 'Rabu, 12 Agustus 2026', time: '11:00 - 12:00', subject: 'Sosiologi', status: 'Hadir' },
        { dayDate: 'Rabu, 12 Agustus 2026', time: '13:00 - 14:30', subject: 'Tahsin dan Tahfidz', status: 'Hadir' },

        { dayDate: 'Kamis, 13 Agustus 2026', time: '07:30 - 08:50', subject: 'Bahasa Indonesia', status: 'Hadir' },
        { dayDate: 'Kamis, 13 Agustus 2026', time: '09:05 - 10:25', subject: 'Bahasa Inggris', status: 'Hadir' },
        { dayDate: 'Kamis, 13 Agustus 2026', time: '10:40 - 12:00', subject: 'Sejarah', status: 'Hadir' },
        { dayDate: 'Kamis, 13 Agustus 2026', time: '13:00 - 14:30', subject: 'Tahsin dan Tahfidz', status: 'Hadir' },

        { dayDate: 'Jumat, 14 Agustus 2026', time: '07:30 - 08:50', subject: 'Bahasa Arab (Fiqh)', status: 'Hadir' },
        { dayDate: 'Jumat, 14 Agustus 2026', time: '09:05 - 10:25', subject: 'Geografi', status: 'Hadir' },
        { dayDate: 'Jumat, 14 Agustus 2026', time: '10:40 - 11:45', subject: 'Tahsin dan Tahfidz', status: 'Hadir' },
      ]

      // Identifikasi wewenang mata pelajaran yang diampu guru yang login
      const mySubjectNames = []
      const currentClassId = (selectedClass && selectedClass !== 'all') ? selectedClass : null

      allTeacherSchedules.forEach((sch) => {
        const schClassId = sch.class_id || sch.kelas_id || sch.kelas?.id || sch.class?.id
        const matchesClass = !currentClassId || String(schClassId) === String(currentClassId)
        const name = sch.subject?.name || sch.subject?.nama_mapel || sch.mata_pelajaran?.nama || sch.subject_name
        if (matchesClass && name && !mySubjectNames.includes(name)) {
          mySubjectNames.push(name)
        }
      })

      const curScheduleSubj = getCurrentSchedule()?.subject?.name || getCurrentSchedule()?.mata_pelajaran?.nama
      if (curScheduleSubj && !mySubjectNames.includes(curScheduleSubj)) {
        mySubjectNames.push(curScheduleSubj)
      }

      if (Array.isArray(teacherProfile?.subjects)) {
        teacherProfile.subjects.forEach((s) => {
          const n = typeof s === 'string' ? s : s.name || s.nama_mapel
          if (n && !mySubjectNames.includes(n)) mySubjectNames.push(n)
        })
      }

      // Jika role memiliki hak akses penuh (Wali Kelas, TU, Kepala Sekolah, Divisi Pendidikan, Admin, Super Admin, Pengurus Yayasan),
      // maka seluruh 19 sesi mata pelajaran sepekan akan ditampilkan.
      // Sebaliknya jika Guru Mapel murni, hanya sesi mata pelajaran yang diampunya yang tampil.
      let finalAttendance = weeklyAttendance
      let activeSubjectScope = ''
      let signerDesignation = 'Wali Kelas / Guru Pengampu'

      if (!canViewAllSubjects) {
        const primarySubject = mySubjectNames[0] || 'Kimia'
        activeSubjectScope = primarySubject
        signerDesignation = `Guru Pengampu Mata Pelajaran ${primarySubject}`

        // Filter kehadiran hanya untuk mata pelajaran yang diampu guru
        const scoped = weeklyAttendance.filter((item) =>
          mySubjectNames.some((subj) =>
            String(subj).trim().toLowerCase() === String(item.subject).trim().toLowerCase() ||
            String(item.subject).trim().toLowerCase().includes(String(subj).trim().toLowerCase()) ||
            String(subj).trim().toLowerCase().includes(String(item.subject).trim().toLowerCase())
          )
        )

        if (scoped.length > 0) {
          finalAttendance = scoped
        } else {
          // Fallback sesi terjadwal untuk mata pelajaran guru pengampu
          finalAttendance = [
            { dayDate: 'Senin, 10 Agustus 2026', time: '09:05 - 10:25', subject: primarySubject, status: 'Hadir' },
            { dayDate: 'Kamis, 13 Agustus 2026', time: '10:40 - 12:00', subject: primarySubject, status: 'Hadir' },
          ]
        }
      }

      // Ambil unit pendidikan aktif secara bertingkat:
      // 1. Dari kelas aktif yang dipilih guru di workspace
      // 2. Dari relasi kelas siswa target
      // 3. Dari objek profil unit guru / database teacher
      const selectedClassObj = classes.find((c) => String(c.id) === String(selectedClass))
      const rawTargetUnit = targetStudent?.education_unit || targetStudent?.kelas?.unit_pendidikan || selectedClassObj?.unit_pendidikan || teacherProfile?.education_unit_data || (typeof targetStudent?.unit === 'object' ? targetStudent.unit : null)
      const eduUnit = (rawTargetUnit && typeof rawTargetUnit === 'object') ? rawTargetUnit : null

      const dynamicUnitName = eduUnit?.name || targetStudent?.unit_name || (typeof teacherProfile?.education_unit === 'string' && teacherProfile.education_unit !== '-' ? teacherProfile.education_unit : '') || sitePengaturan?.school_name || 'Unit Pendidikan Dar el-Iman'
      const yayasanLogoUrl = sitePengaturan?.logo_url || sitePengaturan?.logo_path || '/assets/logos/yayasan.svg'
      const unitLogoUrl = eduUnit?.logo_url || eduUnit?.metadata?.logo_url || targetStudent?.unit_logo || ''

      printWeeklyStudentEvaluation({
        student: {
          ...targetStudent,
          name: targetStudent?.nama_lengkap || targetStudent?.full_name || targetStudent?.name || 'Santri Darel Iman',
          nis: targetStudent?.nis || targetStudent?.nisn || targetStudent?.student_id || '-',
          className: targetStudent?.kelas?.nama_kelas || targetStudent?.kelas?.name || selectedClassName || 'Kelas Siswa',
          unitName: dynamicUnitName,
          education_unit: eduUnit,
          unitLogo: unitLogoUrl,
        },
        yayasanLogo: yayasanLogoUrl,
        unitLogo: unitLogoUrl,
        period: {
          title: 'Pekan ke-6',
          dateRange: '10 - 14 Agustus 2026',
          academicYear: selectedAcademicYear || '2026/2027',
        },
        tahfizh: {
          lastSurah,
          lastDepositDate,
          totalLines,
          targetLines,
          status: totalLines >= targetLines ? 'TERCAPAI' : 'BELUM TERCAPAI',
        },
        attendance: finalAttendance,
        teacherNotes: teacherNotesText,
        homeroomTeacher: {
          name: teacherProfile?.nama_lengkap || teacherProfile?.name || teacherName || 'Ustadz Pembina, S.Pd.',
          nip: teacherProfile?.nip_niy || teacherProfile?.nip || teacherProfile?.employee_number || '-',
        },
        schoolCity: eduUnit?.metadata?.city || 'Padang',
        subjectScope: activeSubjectScope,
        signerRole: signerDesignation,
      })
    } catch (err) {
      console.error('Gagal mencetak evaluasi pekanan:', err)
    }
  }

  const openStudentDetail = (student) => {
    const notes = studentNotes.filter((note) => note.student_id === student.id)
    setDetailData({
      rawStudent: student,
      title: student.nama_lengkap || student.full_name || 'Data Siswa',
      category: `Data Siswa · ${selectedClassName}`,
      items: [
        { label: 'NIS/NISN', value: student.nis || student.nisn || '-' },
        { label: 'Rombel', value: student.kelas?.nama_kelas || student.kelas?.name || selectedClassName },
        { label: 'Jumlah catatan', value: `${notes.length} catatan` },
        { label: 'Catatan terbaru', value: notes[0]?.title || 'Belum ada catatan' },
        { label: 'Isi terbaru', value: notes[0]?.content || 'Belum ada riwayat pembinaan siswa.' },
      ],
    })
    setShowDetailModal(true)
  }

  const changeTab = (tabName) => {
    setSearchParams({ tab: tabName })
  }

  const getCurrentClassId = () => (selectedClass && selectedClass !== 'all') ? selectedClass : (classes[0]?.id || '')

  const getCurrentSchedule = () => {
    const classId = getCurrentClassId()
    const pool = allTeacherSchedules.length > 0 ? allTeacherSchedules : schedules
    if (!classId) return pool[0] || null

    const matchingSchedule = pool.find((schedule) => {
      const scheduleClassId = schedule.class_id || schedule.kelas_id || schedule.kelas?.id || schedule.class?.id
      return scheduleClassId && (String(scheduleClassId) === String(classId) || String(schedule.kelas?.id) === String(classId) || String(schedule.class?.id) === String(classId))
    })

    return matchingSchedule || schedules[0] || pool[0] || null
  }

  const getCurrentSubjectId = () => {
    const schedule = getCurrentSchedule()
    return schedule?.subject_id || schedule?.subject?.id || ''
  }

  const selectedClassName = useMemo(() => {
    if (!selectedClass || selectedClass === 'all') return 'Semua Rombel'
    const found = classes.find((c) => String(c.id) === String(selectedClass))
    return found?.nama_kelas || found?.name || 'Rombel Terpilih'
  }, [classes, selectedClass])

  const getScheduleLessonHours = (scheduleObj) => {
    const sch = scheduleObj || presensiModalSchedule || getCurrentSchedule() || schedules[0] || null
    if (!sch) return '07:30 - 08:50 WIB'
    const start = (sch.start_time || sch.time_start || '07:30').slice(0, 5)
    const end = (sch.end_time || sch.time_end || '08:50').slice(0, 5)
    return `${start} - ${end} WIB`
  }

  const getLiveLessonStatus = (scheduleObj) => {
    const sch = scheduleObj || presensiModalSchedule || getCurrentSchedule() || null
    if (!sch) return { label: 'Sesi Terjadwal', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' }
    const now = currentLiveTime
    const nowMinutes = now.getHours() * 60 + now.getMinutes()
    const [startH, startM] = (sch.start_time || sch.time_start || '07:30').split(':').map(Number)
    const [endH, endM] = (sch.end_time || sch.time_end || '08:50').split(':').map(Number)
    const startMinutes = (startH || 0) * 60 + (startM || 0)
    const endMinutes = (endH || 0) * 60 + (endM || 0)

    if (nowMinutes >= startMinutes && nowMinutes <= endMinutes) {
      return { label: 'Sedang Berlangsung', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700' }
    } else if (nowMinutes < startMinutes) {
      return { label: 'Akan Datang', color: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300 dark:border-sky-700' }
    } else {
      return { label: 'Sesi Selesai', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700' }
    }
  }

  // All 10 Horizontal Module Card Config Objects
    const gradedStudentCount = students.filter((s) => {
    const g = gradesData[s.id]
    return g && (g.nilai_tugas !== '' || g.nilai_akhir !== '' || g.nilai_uts !== '' || g.nilai_uas !== '')
  }).length

  const cardModulesList = [
    {
      id: 'jadwal',
      title: 'Jadwal Mengajar',
      icon: Calendar,
      tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60',
      count: schedules.length,
      badge: `${schedules.length} Sesi`,
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      sub: 'Pertemuan Terjadwal',
      progress: schedules.length > 0 ? 100 : 0,
      quickText: 'Lihat Jadwal',
    },
    {
      id: 'mulai-mengajar',
      title: 'Mulai Mengajar',
      icon: Play,
      tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60',
      count: 'Sesi',
      badge: 'Sesi Aktif',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      sub: 'Mulai Sesi Kelas',
      progress: 100,
      quickText: 'Mulai Mengajar',
    },
    {
      id: 'presensi',
      title: 'Presensi Siswa',
      icon: UserCheck,
      tone: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200/60',
      count: students.length,
      badge: `${students.length} Siswa`,
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
      sub: selectedClassName ? `Kelas ${selectedClassName}` : 'Rombel Aktif',
      progress: students.length > 0 ? 100 : 0,
      quickText: 'Input Presensi',
    },
    {
      id: 'materi',
      title: 'Materi Belajar',
      icon: BookOpen,
      tone: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200/60',
      count: materials.length,
      badge: `${materials.length} Modul`,
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
      sub: 'Materi Pembelajaran',
      progress: materials.length > 0 ? 100 : 0,
      quickText: 'Buat Materi',
    },
    {
      id: 'penugasan',
      title: 'Penugasan',
      icon: FileText,
      tone: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/60',
      count: assignments.length,
      badge: `${assignments.length} Tugas`,
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      sub: 'Evaluasi & Tugas',
      progress: assignments.length > 0 ? 100 : 0,
      quickText: 'Buat Tugas',
    },
    {
      id: 'penilaian',
      title: 'Penilaian',
      icon: BarChart3,
      tone: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/60',
      count: `${gradedStudentCount}/${students.length}`,
      badge: students.length > 0 && gradedStudentCount === students.length ? 'Lengkap' : `${gradedStudentCount} Dinilai`,
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
      sub: 'Nilai Rapor & Harian',
      progress: students.length > 0 ? Math.round((gradedStudentCount / students.length) * 100) : 0,
      quickText: 'Input Nilai',
    },
    {
      id: 'tahfizh',
      title: 'Tahfizh Al-Qur\'an',
      icon: GraduationCap,
      tone: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200/60',
      count: tahfizhLogs.length,
      badge: `${tahfizhLogs.length} Setoran`,
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      sub: 'Progress Hafalan',
      progress: tahfizhLogs.length > 0 ? 100 : 0,
      quickText: 'Input Tahfizh',
    },
    {
      id: 'rekapan-tahfizh',
      title: 'Rekapan Tahfizh',
      icon: FileSpreadsheet,
      tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60',
      count: 'Laporan',
      badge: 'Rekap & Cetak',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      sub: 'Rekapitulasi Hafalan',
      progress: 100,
      quickText: 'Buka Rekapan',
    },
    {
      id: 'mutabaah',
      title: 'Mutabaah Yaumiyyah',
      icon: Heart,
      tone: 'bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300 border-pink-200/60',
      count: 'Dinamis',
      badge: 'Sesuai Template',
      badgeColor: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300',
      sub: 'Worship Checklist',
      progress: 0,
      quickText: 'Input Mutabaah',
    },
    {
      id: 'catatan',
      title: 'Catatan Siswa',
      icon: MessageSquare,
      tone: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200/60',
      count: studentNotes.length,
      badge: `${studentNotes.length} Catatan`,
      badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
      sub: 'Perkembangan Siswa',
      progress: studentNotes.length > 0 ? 100 : 0,
      quickText: 'Tambah Catatan',
    },
    {
      id: 'chat',
      title: 'Komunikasi Orang Tua',
      icon: MessageSquare,
      tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60',
      count: 'Pesan',
      badge: 'Chat Guru',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      sub: 'Pesan Masuk & Diskusi',
      progress: 100,
      quickText: 'Buka Chat',
    },
    {
      id: 'log-absensi',
      title: 'Log Absensi Guru',
      icon: Clock,
      tone: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200/60',
      count: `${teacherLogAbsensi.length} Hari`,
      badge: teacherLogAbsensi.length > 0 ? 'Tercatat' : 'Belum Ada',
      badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
      sub: 'Log Kehadiran Saya',
      progress: teacherLogAbsensi.length > 0 ? 100 : 0,
      quickText: 'Lihat Log Absen',
    },
    {
      id: 'jadwal-lengkap',
      title: 'Jadwal Lengkap',
      icon: CalendarDays,
      tone: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200/60',
      count: selectedSemester || 'Semester',
      badge: 'Resmi',
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
      sub: selectedAcademicYear || 'Tahun Ajaran',
      progress: 100,
      quickText: 'Lihat Detail',
    },
  ]

  const handleCardClick = (cardItem) => {
    if (!cardItem) return
    if (cardItem.id === 'mulai-mengajar') {
      setShowMulaiMengajarModal(true)
      return
    }
    if (cardItem.id === 'presensi') {
      openPresensiModal(getCurrentSchedule() || schedules[0] || null)
      changeTab('presensi')
      return
    }
    changeTab(cardItem.id)
  }

  // Open Dedicated Presensi Pop-up Modal for Schedule
  const openPresensiModal = (scheduleObj) => {
    const targetSchedule = scheduleObj || getCurrentSchedule() || schedules[0] || null
    setPresensiModalSchedule(targetSchedule)
    if (targetSchedule) {
      const schClassId = targetSchedule.kelas_id || targetSchedule.class_id || targetSchedule.kelas?.id || targetSchedule.class?.id
      if (schClassId && String(schClassId) !== String(selectedClass)) {
        setSelectedClass(String(schClassId))
        fetchStudentsForClass(String(schClassId))
      } else {
        fetchStudentsForClass(schClassId || selectedClass)
      }
    } else {
      fetchStudentsForClass(selectedClass)
    }
    setShowAktivitasModal(false)
    setShowPresensiModal(true)
  }

  const handleModalClassChange = (newClassId) => {
    setSelectedClass(newClassId)
    if (newClassId !== 'all') {
      const match = (schedules || []).find((s) => {
        const sCid = s.kelas_id || s.class_id || s.kelas?.id || s.class?.id
        return String(sCid) === String(newClassId)
      }) || (allTeacherSchedules || []).find((s) => {
        const sCid = s.kelas_id || s.class_id || s.kelas?.id || s.class?.id
        return String(sCid) === String(newClassId)
      })
      if (match) {
        setPresensiModalSchedule(match)
      }
    }
    fetchStudentsForClass(newClassId)
  }

  const getTodayDateString = () => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const autoSaveAttendanceRecord = async (studentToSave, status = 'Hadir', method = 'QR Code Kartu Siswa', notes = '') => {
    if (!studentToSave?.id) return
    const activeSchedule = presensiModalSchedule || getCurrentSchedule()
    if (!activeSchedule?.id) return

    try {
      setAutoSaveStatus('saving')
      const payload = {
        class_schedule_id: activeSchedule.id,
        date: getTodayDateString(),
        meeting_number: meetingNumber || 1,
        topic: attendanceTopic || 'Presensi Pembelajaran Harian',
        method: method.toLowerCase().includes('qr') ? 'qr' : method.toLowerCase().includes('rfid') ? 'rfid' : 'rollcall',
        students: [
          {
            student_id: studentToSave.id,
            status: status === 'Belum Dicatat' ? 'Belum Dicatat' : status,
            notes: notes || `Tercatat via ${method} (Auto-Save Real-time)`,
          },
        ],
      }
      await api.post('/teacher/attendance', payload)
      setAutoSaveStatus('saved')
    } catch (err) {
      console.warn('Auto-save single attendance error:', err)
      setAutoSaveStatus('error')
    }
  }

  const markStudentAttendance = (student, method = 'Checklist Guru', status = 'Hadir') => {
    if (!student) return
    const checkInTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    setAttendanceData((previous) => ({
      ...previous,
      [student.id]: {
        ...(previous[student.id] || {}),
        status,
        method,
        check_in_time: status === 'Hadir' || status === 'Terlambat' ? checkInTime : '',
        notes: `Dicatat melalui ${method}`,
      },
    }))
    // Auto-save langsung ke server secara real-time
    autoSaveAttendanceRecord(student, status, method, `Dicatat melalui ${method}`)
  }

  const toggleStudentChecklist = (student, checked) => {
    markStudentAttendance(student, 'Checklist Guru', checked ? 'Hadir' : 'Belum Dicatat')
  }

  const markAllStudentsPresent = async () => {
    const checkInTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    const newAttendance = {}
    students.forEach((student) => {
      newAttendance[student.id] = {
        status: 'Hadir',
        method: 'Checklist Guru',
        check_in_time: checkInTime,
        notes: 'Dicatat melalui Checklist Guru',
      }
    })
    setAttendanceData((previous) => ({
      ...previous,
      ...newAttendance,
    }))
    addToast('success', 'Semua Siswa Dicentang & Disimpan', `${students.length} siswa ditandai hadir dan tersimpan ke server.`)

    const activeSchedule = presensiModalSchedule || getCurrentSchedule()
    if (activeSchedule?.id && students.length > 0) {
      try {
        setAutoSaveStatus('saving')
        await api.post('/teacher/attendance', {
          class_schedule_id: activeSchedule.id,
          date: getTodayDateString(),
          meeting_number: meetingNumber || 1,
          topic: attendanceTopic || 'Presensi Pembelajaran Harian',
          method: 'rollcall',
          students: students.map((st) => ({
            student_id: st.id,
            status: 'Hadir',
            notes: 'Dicatat melalui Checklist Guru (Auto-Save)',
          })),
        })
        setAutoSaveStatus('saved')
      } catch (err) {
        console.warn('Auto-save mass attendance error:', err)
        setAutoSaveStatus('error')
      }
    }
  }

  const findStudentByCardCode = (rawCode) => {
    const cardCode = String(rawCode || '').trim().toLowerCase()
    if (!cardCode) return null
    return students.find((student) => [
      student.id,
      student.nis,
      student.nisn,
      student.student_code,
      student.card_number,
      student.qr_code,
      student.rfid_uid,
      student.metadata?.card_number,
      student.metadata?.qr_code,
      student.metadata?.rfid_uid,
      student.nama_lengkap,
    ].some((value) => value != null && String(value).trim().toLowerCase() === cardCode)) || 
    students.find((s) => cardCode.length > 2 && (String(s.nis || '').includes(cardCode) || String(s.nisn || '').includes(cardCode))) || null
  }

  const identifyStudentCard = async (rawIdentifier, method = selectedMethod) => {
    const methodLabel = method === 'rfid' ? 'RFID Kartu Siswa' : 'QR Code Kartu Siswa'
    const identifier = String(rawIdentifier || '').trim()
    if (!identifier) return false

    setScanProcessing(true)

    // Instant local identification & status update to Hadir (with real-time Auto-Save to server)
    const matchedStudent = findStudentByCardCode(identifier)
    if (matchedStudent) {
      markStudentAttendance(matchedStudent, methodLabel, 'Hadir')
      setLastScannedResult({
        student: matchedStudent,
        method: methodLabel,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      })
      addToast('success', 'Presensi Berhasil Disimpan!', `${matchedStudent.nama_lengkap} langsung tersimpan HADIR pada jam pelajaran ini.`)
    }

    try {
      let activeSchedule = presensiModalSchedule || getCurrentSchedule()
      if (!activeSchedule?.id) {
        const classId = getCurrentClassId()
        const scheduleResponse = await api.get('/teacher/schedules', { params: { class_id: classId || undefined } })
        const availableSchedules = scheduleResponse?.data?.data || []
        if (availableSchedules.length) {
          setSchedules(availableSchedules)
          activeSchedule = availableSchedules.find((schedule) => {
            const scheduleClassId = schedule.class_id || schedule.kelas_id || schedule.kelas?.id || schedule.class?.id
            return !classId || scheduleClassId === classId
          }) || availableSchedules[0]
        }
      }

      if (activeSchedule?.id) {
        const response = await api.post(`/lesson-attendance/identify-card/${method === 'rfid' ? 'rfid' : 'qr'}`, {
          schedule_id: activeSchedule.id,
          identifier,
        })
        const result = response?.data?.data
        if (result?.student) {
          const student = students.find((item) => item.id === result.student.id) || {
            ...result.student,
            nama_lengkap: result.student.nama_lengkap || result.student.full_name || 'Siswa',
          }
          if (!matchedStudent) {
            markStudentAttendance(student, methodLabel, 'Hadir')
            setLastScannedResult({
              student,
              method: methodLabel,
              time: new Date(result.identified_at || Date.now()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
            })
            addToast('success', 'Presensi Server Berhasil Disimpan!', `${student.nama_lengkap} langsung tersimpan HADIR pada jam pelajaran ini.`)
          }
        }
      }
      return true
    } catch (error) {
      if (matchedStudent) {
        return true
      }
      const message = error?.response?.data?.message || error?.message || 'QR Code kartu siswa tidak berhasil diidentifikasi.'
      setLastScannedResult({ error: true, code: identifier, method: methodLabel, message })
      addToast('error', 'Identifikasi Gagal', message)
      return false
    } finally {
      setScanProcessing(false)
      setScanInput('')
      setTimeout(() => scanInputRef.current?.focus(), 50)
    }
  }

  const handleCardScan = async (event) => {
    event?.preventDefault()
    await identifyStudentCard(scanInput, selectedMethod)
  }

  const stopQrCamera = () => {
    if (qrDetectorTimerRef.current) window.clearInterval(qrDetectorTimerRef.current)
    qrDetectorTimerRef.current = null
    qrStreamRef.current?.getTracks().forEach((track) => track.stop())
    qrStreamRef.current = null
    if (qrVideoRef.current) qrVideoRef.current.srcObject = null
    setQrCameraActive(false)
  }

  const closeQrCamera = () => {
    stopQrCamera()
    setQrCameraErrorInfo(null)
    setQrCameraError('')
    setShowQrCamera(false)
  }

  const openQrCamera = async () => {
    setShowQrCamera(true)
    setQrCameraError('')
    setQrCameraErrorInfo(null)
    try {
      const stream = await requestCameraStream({ preferredFacingMode: 'environment' })
      qrStreamRef.current = stream
      await new Promise((resolve) => window.setTimeout(resolve, 50))
      if (qrVideoRef.current) {
        qrVideoRef.current.srcObject = stream
        await qrVideoRef.current.play()
      }
      setQrCameraActive(true)

      if (!isBarcodeDetectorSupported()) {
        setQrCameraErrorInfo({
          title: 'Pemindaian Otomatis QR Belum Aktif',
          message: 'Browser ini belum mendukung fitur pendeteksi barcode otomatis langsung (BarcodeDetector API). Stream kamera tetap aktif.',
          actionType: 'notice',
          isPermissionDenied: false,
          instructions: [
            'Untuk pemindaian QR otomatis secara instan, disarankan menggunakan Google Chrome atau Microsoft Edge terbaru.',
            'Anda juga dapat mengetikkan nomor kartu siswa atau menempelkan barcode scanner fisik (USB/Bluetooth) pada input di bawah.',
          ],
        })
        return
      }

      const detector = new window.BarcodeDetector({ formats: ['qr_code'] })
      qrDetectorTimerRef.current = window.setInterval(async () => {
        const video = qrVideoRef.current
        if (!video || video.readyState < 2 || scanProcessing) return
        try {
          const codes = await detector.detect(video)
          const value = codes[0]?.rawValue
          if (value) {
            stopQrCamera()
            setScanInput(value)
            const matched = await identifyStudentCard(value, 'qr')
            if (matched) setShowQrCamera(false)
          }
        } catch {
          // Frame tanpa QR valid diabaikan sampai pemindaian berikutnya.
        }
      }, 500)
    } catch (error) {
      stopQrCamera()
      const parsed = parseCameraError(error)
      setQrCameraErrorInfo(parsed)
      setQrCameraError(parsed.message)
    }
  }

  const handleFaceRecognitionSubmit = () => {
    const targetStudent = students.find((s) => s.id === faceStudentId) || students[0]
    if (!targetStudent) {
      addToast('warning', 'Pilih Siswa', 'Silakan pilih siswa yang akan diproses.')
      return
    }

    setAttendanceData((prev) => ({
      ...prev,
      [targetStudent.id]: {
        ...(prev[targetStudent.id] || {}),
        status: faceStatus,
        method: 'Face Recognition AI',
        notes: faceNotes || 'Verifikasi Wajah AI Instant',
        check_in_time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
      }
    }))

    setLastScannedResult({
      student: targetStudent,
      method: 'Face Recognition AI',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    })

    addToast('success', 'Presensi Wajah Berhasil', `Presensi Wajah AI untuk ${targetStudent.nama_lengkap} berhasil disimpan (${faceStatus}).`)
    setShowFaceModal(false)
    setFaceStudentId('')
    setFaceNotes('')
  }

  const handleSaveAttendance = async () => {
    const activeSchedule = presensiModalSchedule || getCurrentSchedule()

    if (!activeSchedule) {
      addToast('warning', 'Jadwal Kosong', 'Pilih jadwal mengajar terlebih dahulu.')
      return
    }

    try {
      const payload = {
        class_schedule_id: activeSchedule.id,
        date: new Date().toISOString().split('T')[0],
        meeting_number: meetingNumber,
        topic: attendanceTopic,
        students: Object.keys(attendanceData).map((stId) => ({
          student_id: stId,
          status: attendanceData[stId].status,
          notes: attendanceData[stId].notes,
        })),
      }
      const response = await api.post('/teacher/attendance', payload)
      setShowPresensiModal(false)
      setShowAttendanceMethodModal(false)
      addToast('success', 'Presensi Disimpan', response?.data?.message || 'Presensi siswa berhasil difinalisasi dan disimpan ke sistem!')
    } catch (err) {
      const message = err?.response?.data?.message || 'Terjadi kesalahan saat menyimpan presensi siswa.'
      addToast('error', 'Gagal Simpan', message)
    }
  }

  const handlePrintAttendanceRoster = () => {
    if (!students || students.length === 0) {
      addToast('warning', 'Daftar Siswa Kosong', 'Tidak ada siswa pada rombel yang dipilih untuk dicetak.')
      return
    }

    const activeSchedule = getCurrentSchedule() || presensiModalSchedule || {}
    const subjectName = activeSchedule?.subject?.name || activeSchedule?.subject?.nama_mapel || activeSchedule?.nama_mapel || 'Mata Pelajaran'
    const curClassName = selectedClassName || 'Rombel'
    const todayFormatted = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

    const headers = [
      'No',
      'NIS / NISN',
      'Nama Siswa',
      'Jenis Kelamin',
      'Status Presensi',
      'Waktu Hadir',
      'Metode',
      'Catatan'
    ]

    const rows = students.map((st, idx) => {
      const record = attendanceData[st.id] || { status: 'Belum Dicatat' }
      return [
        idx + 1,
        st.nis || st.nisn || '-',
        st.nama_lengkap || st.full_name || '-',
        st.gender === 'L' || st.jenis_kelamin === 'L' ? 'Laki-laki' : (st.gender === 'P' || st.jenis_kelamin === 'P' ? 'Perempuan' : '-'),
        record.status || 'Belum Dicatat',
        record.check_in_time || '-',
        record.method || '-',
        record.notes || '-'
      ]
    })

    const presentCount = students.filter((s) => (attendanceData[s.id]?.status || 'Belum Dicatat') === 'Hadir').length
    const subtitleInfo = `Pengajar: ${teacherName} | Rombel: ${curClassName} | Mapel: ${subjectName} | Tanggal: ${todayFormatted} | Hadir: ${presentCount}/${students.length} Siswa`

    printCleanTable({
      title: 'DAFTAR PRESENSI PEMBELAJARAN SISWA',
      subtitle: subtitleInfo,
      headers,
      rows,
    })
    addToast('info', 'Dokumen Siap Dicetak', 'Pratinjau cetak daftar presensi pembelajaran berhasil dibuka.')
  }

  const handleDownloadAttendancePdf = () => {
    if (!students || students.length === 0) {
      addToast('warning', 'Daftar Siswa Kosong', 'Tidak ada siswa pada rombel yang dipilih untuk diunduh.')
      return
    }

    const activeSchedule = getCurrentSchedule() || presensiModalSchedule || {}
    const subjectName = activeSchedule?.subject?.name || activeSchedule?.subject?.nama_mapel || activeSchedule?.nama_mapel || 'Mata Pelajaran'
    const curClassName = selectedClassName || 'Rombel'
    const todayFormatted = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    const todayIso = new Date().toISOString().split('T')[0]

    const headers = [
      'No',
      'NIS / NISN',
      'Nama Siswa',
      'L/P',
      'Status Presensi',
      'Waktu Hadir',
      'Metode',
      'Catatan'
    ]

    const rows = students.map((st, idx) => {
      const record = attendanceData[st.id] || { status: 'Belum Dicatat' }
      return [
        idx + 1,
        st.nis || st.nisn || '-',
        st.nama_lengkap || st.full_name || '-',
        st.gender || st.jenis_kelamin || '-',
        record.status || 'Belum Dicatat',
        record.check_in_time || '-',
        record.method || '-',
        record.notes || '-'
      ]
    })

    const presentCount = students.filter((s) => (attendanceData[s.id]?.status || 'Belum Dicatat') === 'Hadir').length
    const subtitleInfo = `Pengajar: ${teacherName} | Rombel: ${curClassName} | Mapel: ${subjectName} | Tanggal: ${todayFormatted} | Hadir: ${presentCount}/${students.length} Siswa`

    downloadPdfTable({
      title: 'DAFTAR PRESENSI PEMBELAJARAN SISWA',
      subtitle: subtitleInfo,
      headers,
      rows,
      filename: `Presensi_${curClassName.replace(/\s+/g, '_')}_${todayIso}.pdf`,
    })
  }

  const handlePrintSingleHistorySession = (session) => {
    if (!session) return
    const attList = session.attendances || []
    if (attList.length === 0) {
      addToast('warning', 'Data Presensi Kosong', 'Tidak ada data kehadiran siswa pada sesi ini untuk dicetak.')
      return
    }

    const sessionDate = session.attendance_date ? new Date(session.attendance_date) : new Date()
    const dateFormatted = sessionDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const timeRange = session.schedule?.time_start && session.schedule?.time_end
      ? `${session.schedule.time_start.slice(0, 5)} – ${session.schedule.time_end.slice(0, 5)} WIB`
      : '07:30 – 09:00 WIB'
    const subjectName = session.schedule?.subject?.name || 'Mata Pelajaran'
    const clsName = session.schedule?.kelas?.name || selectedClassName || 'Rombel'
    const hadir = attList.filter((a) => (a.status_hadir || a.status || '').toLowerCase() === 'hadir').length
    const total = attList.length
    const rate = total > 0 ? Math.round((hadir / total) * 100) : 0

    const headers = ['No', 'NISN', 'Nama Siswa', 'Status Presensi', 'Waktu Presensi', 'Metode', 'Keterangan']
    const rows = attList.map((item, idx) => [
      idx + 1,
      item.siswa?.nisn || item.student_nisn || '-',
      item.siswa?.full_name || item.siswa?.nama_lengkap || item.student_name || 'Siswa',
      item.status_hadir || item.status || 'Belum Dicatat',
      item.waktu_presensi ? new Date(item.waktu_presensi).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : '-',
      item.recorded_method || 'Presensi KBM',
      item.keterangan || '-'
    ])

    printCleanTable({
      title: 'BERITA ACARA & PRESENSI PEMBELAJARAN KBM',
      subtitle: `Pertemuan ke-${session.meeting_number || 1} | Mapel: ${subjectName} | Rombel: ${clsName} | Tanggal: ${dateFormatted} (${timeRange}) | Guru: ${teacherName} | Topik: ${session.topic || 'KBM Reguler'} | Hadir: ${hadir}/${total} Siswa (${rate}%)`,
      headers,
      rows,
    })
    addToast('info', 'Dokumen Siap Dicetak', `Pratinjau cetak sesi pertemuan ke-${session.meeting_number || 1} berhasil dibuka.`)
  }

  const handleDownloadSingleHistorySessionPdf = (session) => {
    if (!session) return
    const attList = session.attendances || []
    if (attList.length === 0) {
      addToast('warning', 'Data Presensi Kosong', 'Tidak ada data kehadiran siswa pada sesi ini untuk diunduh.')
      return
    }

    const sessionDate = session.attendance_date ? new Date(session.attendance_date) : new Date()
    const dateFormatted = sessionDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const timeRange = session.schedule?.time_start && session.schedule?.time_end
      ? `${session.schedule.time_start.slice(0, 5)} – ${session.schedule.time_end.slice(0, 5)} WIB`
      : '07:30 – 09:00 WIB'
    const subjectName = session.schedule?.subject?.name || 'Mata Pelajaran'
    const clsName = session.schedule?.kelas?.name || selectedClassName || 'Rombel'
    const hadir = attList.filter((a) => (a.status_hadir || a.status || '').toLowerCase() === 'hadir').length
    const total = attList.length
    const rate = total > 0 ? Math.round((hadir / total) * 100) : 0

    const headers = ['No', 'NISN', 'Nama Siswa', 'Status Presensi', 'Waktu Presensi', 'Metode', 'Keterangan']
    const rows = attList.map((item, idx) => [
      idx + 1,
      item.siswa?.nisn || item.student_nisn || '-',
      item.siswa?.full_name || item.siswa?.nama_lengkap || item.student_name || 'Siswa',
      item.status_hadir || item.status || 'Belum Dicatat',
      item.waktu_presensi ? new Date(item.waktu_presensi).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : '-',
      item.recorded_method || 'Presensi KBM',
      item.keterangan || '-'
    ])

    const dateIso = session.attendance_date ? String(session.attendance_date).slice(0, 10) : new Date().toISOString().slice(0, 10)
    downloadPdfTable({
      title: 'BERITA ACARA & PRESENSI PEMBELAJARAN KBM',
      subtitle: `Pertemuan ke-${session.meeting_number || 1} | Mapel: ${subjectName} | Rombel: ${clsName} | Tanggal: ${dateFormatted} (${timeRange}) | Guru: ${teacherName} | Topik: ${session.topic || 'KBM Reguler'} | Hadir: ${hadir}/${total} Siswa (${rate}%)`,
      headers,
      rows,
      filename: `Presensi_Pertemuan_${session.meeting_number || 1}_${clsName.replace(/\s+/g, '_')}_${dateIso}.pdf`,
    })
    addToast('info', 'Unduh PDF', 'File PDF presensi sesi berhasil disiapkan.')
  }

  const handleExportSingleHistorySessionCsv = (session) => {
    if (!session) return
    const attList = session.attendances || []
    if (attList.length === 0) {
      addToast('warning', 'Data Presensi Kosong', 'Tidak ada data kehadiran siswa pada sesi ini untuk diekspor.')
      return
    }

    const headers = ['No', 'NISN', 'Nama Siswa', 'Status Presensi', 'Waktu Presensi', 'Metode', 'Keterangan']
    const rows = attList.map((item, idx) => [
      idx + 1,
      item.siswa?.nisn || item.student_nisn || '-',
      item.siswa?.full_name || item.siswa?.nama_lengkap || item.student_name || 'Siswa',
      item.status_hadir || item.status || 'Belum Dicatat',
      item.waktu_presensi ? new Date(item.waktu_presensi).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : '-',
      item.recorded_method || 'Presensi KBM',
      item.keterangan || '-'
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\n')

    const dateIso = session.attendance_date ? String(session.attendance_date).slice(0, 10) : new Date().toISOString().slice(0, 10)
    const filename = `Presensi_Pertemuan_${session.meeting_number || 1}_${(selectedClassName || 'Rombel').replace(/\s+/g, '_')}_${dateIso}.csv`
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)
    addToast('success', 'Export Berhasil', `Data presensi pertemuan ke-${session.meeting_number || 1} berhasil diekspor ke format Excel (.csv).`)
  }

  const handleExportHistorySessionsSummary = () => {
    if (!historySessions || historySessions.length === 0) {
      addToast('warning', 'Data Sesi Kosong', 'Tidak ada sesi pembelajaran pada periode ini untuk diekspor.')
      return
    }

    const headers = [
      'No',
      'Pertemuan Ke',
      'Tanggal',
      'Jam Pelajaran',
      'Mata Pelajaran',
      'Rombel / Kelas',
      'Topik Pembelajaran',
      'Total Siswa',
      'Hadir',
      'Terlambat',
      'Izin',
      'Sakit',
      'Alpa',
      'Tingkat Kehadiran (%)'
    ]

    const rows = historySessions.map((session, idx) => {
      const attList = session.attendances || []
      const hadir = attList.filter((a) => (a.status_hadir || a.status || '').toLowerCase() === 'hadir').length
      const terlambat = attList.filter((a) => (a.status_hadir || a.status || '').toLowerCase() === 'terlambat').length
      const izin = attList.filter((a) => (a.status_hadir || a.status || '').toLowerCase() === 'izin').length
      const sakit = attList.filter((a) => (a.status_hadir || a.status || '').toLowerCase() === 'sakit').length
      const alpa = attList.filter((a) => ['alpa', 'alpha'].includes((a.status_hadir || a.status || '').toLowerCase())).length
      const totalAtt = attList.length
      const rate = totalAtt > 0 ? Math.round(((hadir + terlambat) / totalAtt) * 100) : 0
      const sessionDate = session.attendance_date ? String(session.attendance_date).slice(0, 10) : '-'
      const timeRange = session.schedule?.time_start && session.schedule?.time_end
        ? `${session.schedule.time_start.slice(0, 5)} - ${session.schedule.time_end.slice(0, 5)}`
        : '-'

      return [
        idx + 1,
        session.meeting_number || idx + 1,
        sessionDate,
        timeRange,
        session.schedule?.subject?.name || 'Mata Pelajaran',
        session.schedule?.kelas?.name || selectedClassName || 'Rombel',
        session.topic || session.learning_material || 'Materi KBM Reguler',
        totalAtt,
        hadir,
        terlambat,
        izin,
        sakit,
        alpa,
        `${rate}%`
      ]
    })

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\n')

    const filename = `Rekapitulasi_Presensi_KBM_${attendancePeriodFilter}_${(selectedClassName || 'Rombel').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)
    addToast('success', 'Export Berhasil', `Rekapitulasi ${historySessions.length} sesi KBM berhasil diekspor ke format Excel (.csv).`)
  }

  const fetchStudentDetailHistory = async (student) => {
    if (!student) return
    setLoadingStudentDetailSessions(true)
    try {
      const activeSchedule = getCurrentSchedule() || presensiModalSchedule || {}
      const targetClassId = (selectedClass && selectedClass !== 'all')
        ? selectedClass
        : (student.kelas_id || student.class_id || activeSchedule?.kelas_id || activeSchedule?.class_id)

      const params = {
        per_page: 200,
      }
      if (activeSchedule?.id) {
        params.schedule_id = activeSchedule.id
      } else if (targetClassId) {
        params.kelas_id = targetClassId
        params.class_id = targetClassId
      }

      const isSem2 = attendanceSemesterFilter === '2' || activeSchedule?.semester?.sequence === 2
      params.date_from = isSem2 ? '2027-01-01' : '2026-07-01'
      params.date_to = isSem2 ? '2027-06-30' : '2026-12-31'

      let res = await api.get('/lesson-attendance/sessions', { params })
      let list = res?.data?.data?.data || res?.data?.data || []

      // Fallback jika schedule_id belum ada sesi terdaftar, coba dengan kelas_id
      if ((!Array.isArray(list) || list.length === 0) && params.schedule_id && targetClassId) {
        const fallbackParams = { ...params }
        delete fallbackParams.schedule_id
        fallbackParams.kelas_id = targetClassId
        fallbackParams.class_id = targetClassId
        const fallbackRes = await api.get('/lesson-attendance/sessions', { params: fallbackParams })
        list = fallbackRes?.data?.data?.data || fallbackRes?.data?.data || []
      }

      setStudentDetailSessions(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error('Failed to fetch student detail history sessions:', err)
      setStudentDetailSessions([])
    } finally {
      setLoadingStudentDetailSessions(false)
    }
  }

  const handleOpenStudentAttendanceDetail = (student, initialPeriod) => {
    setSelectedStudentAttendanceDetail(student)
    setStudentDetailPeriodFilter(initialPeriod || 'bulanan')
    setShowStudentAttendanceDetailModal(true)
    fetchStudentDetailHistory(student)
  }

  const getStudentAttendanceHistory = (student) => {
    if (!student) return []
    const curRecord = attendanceData[student.id] || { status: 'Belum Dicatat', method: 'Belum dicatat', check_in_time: '-' }
    const todayStr = attendanceDateFilter || new Date().toISOString().split('T')[0]

    // Sesi KBM aktif saat ini
    const currentSession = {
      id: 'current_active_session',
      meeting: meetingNumber || 1,
      date: todayStr,
      topic: attendanceTopic || `Materi KBM Pertemuan ke-${meetingNumber || 1}`,
      status: curRecord.status || 'Belum Dicatat',
      time: curRecord.check_in_time || (curRecord.status === 'Hadir' ? '07:15 WIB' : '-'),
      method: curRecord.method || (curRecord.status === 'Hadir' ? 'Roll Call Guru' : 'Belum dicatat'),
      notes: curRecord.notes || (curRecord.status === 'Hadir' ? 'Hadir tepat waktu' : '-'),
      isCurrent: true,
    }

    const sourceSessions = studentDetailSessions.length > 0 ? studentDetailSessions : historySessions

    const pastLogs = (sourceSessions || []).map((session) => {
      const sDateStr = session.attendance_date ? String(session.attendance_date).slice(0, 10) : ''
      const att = (session.attendances || []).find((a) => a.siswa_id === student.id || a.student_id === student.id)

      const rawStatus = (att?.status_hadir || att?.status || (sDateStr === todayStr ? curRecord.status : 'Belum Dicatat') || 'Belum Dicatat').toLowerCase()
      const titleStatus = rawStatus === 'hadir' ? 'Hadir'
        : rawStatus === 'terlambat' ? 'Terlambat'
        : rawStatus === 'izin' ? 'Izin'
        : rawStatus === 'sakit' ? 'Sakit'
        : rawStatus === 'alpa' || rawStatus === 'alpha' ? 'Alpha'
        : 'Belum Dicatat'

      const timeStr = att?.waktu_presensi
        ? new Date(att.waktu_presensi).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
        : (titleStatus === 'Hadir' ? '07:15 WIB' : '-')

      return {
        id: session.id,
        meeting: session.meeting_number || 1,
        date: sDateStr || todayStr,
        topic: session.topic || session.learning_material || (session.schedule?.subject?.name ? `Materi ${session.schedule.subject.name}` : `Pertemuan ke-${session.meeting_number || 1}`),
        status: titleStatus,
        time: timeStr,
        method: att?.recorded_method || (att ? 'Presensi KBM' : 'Belum dicatat'),
        notes: att?.keterangan || (titleStatus === 'Hadir' ? 'Hadir tepat waktu' : '-'),
        isCurrent: sDateStr === todayStr,
      }
    })

    const hasTodayInPastLogs = pastLogs.some((p) => p.date === todayStr)
    const combined = hasTodayInPastLogs ? pastLogs : [currentSession, ...pastLogs]

    return combined.sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0))
  }

  const getFilteredStudentAttendanceHistory = (history, period, refDateStr) => {
    if (!Array.isArray(history) || history.length === 0) return []
    const todayStr = refDateStr || attendanceDateFilter || new Date().toISOString().split('T')[0]

    if (period === 'harian') {
      return history.filter((h) => h.isCurrent || h.date === todayStr)
    }

    if (period === 'mingguan') {
      const curr = new Date(todayStr + 'T12:00:00')
      const day = curr.getDay()
      const diffToMon = curr.getDate() - day + (day === 0 ? -6 : 1)
      const monday = new Date(curr)
      monday.setDate(diffToMon)
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      const pad = (n) => String(n).padStart(2, '0')
      const monStr = `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`
      const sunStr = `${sunday.getFullYear()}-${pad(sunday.getMonth() + 1)}-${pad(sunday.getDate())}`
      return history.filter((h) => h.date >= monStr && h.date <= sunStr)
    }

    if (period === 'bulanan') {
      const curMonthPrefix = todayStr.slice(0, 7)
      return history.filter((h) => h.date && h.date.startsWith(curMonthPrefix))
    }

    // semester (semua sesi di semester ini)
    return history
  }

  const handlePrintSingleStudentAttendance = (student, period = 'semester') => {
    if (!student) return
    const activeSchedule = getCurrentSchedule() || presensiModalSchedule || {}
    const subjectName = activeSchedule?.subject?.name || activeSchedule?.subject?.nama_mapel || activeSchedule?.nama_mapel || 'Mata Pelajaran'
    const curClassName = selectedClassName || 'Rombel'
    const allHistory = getStudentAttendanceHistory(student)
    const todayStr = attendanceDateFilter || new Date().toISOString().split('T')[0]
    const history = getFilteredStudentAttendanceHistory(allHistory, period, todayStr)

    const periodLabelMap = {
      harian: 'HARIAN (HARI INI)',
      mingguan: 'MINGGUAN (PEKAN INI)',
      bulanan: 'BULANAN (BULAN INI)',
      semester: 'SEMESTER LENGKAP (16 SESI)',
    }
    const periodLabel = periodLabelMap[period] || 'SEMESTER'

    const headers = [
      'Pertemuan',
      'Tanggal',
      'Materi / Topik',
      'Status Kehadiran',
      'Waktu Absen',
      'Metode',
      'Catatan'
    ]

    const rows = history.map((item) => [
      `Pertemuan ${item.meeting}`,
      item.date,
      item.topic,
      item.status,
      item.time,
      item.method,
      item.notes
    ])

    const hadirCount = history.filter((h) => h.status === 'Hadir').length
    const terlaksanaCount = history.filter((h) => h.status !== 'Belum Terlaksana').length
    const pct = terlaksanaCount > 0 ? Math.round((hadirCount / terlaksanaCount) * 100) : 0

    printCleanTable({
      title: `REKAPITULASI PRESENSI ${periodLabel} SISWA - ${String(student.nama_lengkap || student.full_name || 'SISWA').toUpperCase()}`,
      subtitle: `NIS: ${student.nis || '-'} | NISN: ${student.nisn || '-'} | Rombel: ${curClassName} | Mapel: ${subjectName} | Guru: ${teacherName} | Filter: ${periodLabel} | Kehadiran: ${hadirCount}/${terlaksanaCount} Sesi (${pct}%)`,
      headers,
      rows,
    })
  }

  const openSubmissionsModal = async (asg) => {
    setSelectedAssignmentForSubmissions(asg)
    setShowSubmissionsModal(true)
    setLoadingSubmissions(true)
    setSubmissionSearch('')
    setSubmissionStatusFilter('all')
    try {
      const res = await api.get(`/teacher/submissions?assignment_id=${asg.id}&per_page=100`)
      const raw = res?.data?.data
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : [])
      setSubmissionsList(list)
    } catch (err) {
      console.error('Failed to load submissions:', err)
      addToast('error', 'Gagal Memuat Pengumpulan', err?.response?.data?.message || 'Gagal mengambil data pengumpulan tugas.')
      setSubmissionsList([])
    } finally {
      setLoadingSubmissions(false)
    }
  }

  const handleSaveSingleSubmissionGrade = async (submissionId, nilai, catatan) => {
    if (nilai === '' || isNaN(Number(nilai)) || Number(nilai) < 0 || Number(nilai) > 100) {
      addToast('warning', 'Nilai Tidak Valid', 'Masukkan nilai valid antara 0 sampai 100.')
      return
    }
    setSavingGradeId(submissionId)
    try {
      await api.post(`/teacher/submissions/${submissionId}/grade`, {
        nilai: Number(nilai),
        catatan_guru: catatan || '',
      })
      addToast('success', 'Nilai Disimpan', 'Nilai tugas siswa berhasil disimpan!')
      setSubmissionsList((prev) =>
        prev.map((sub) =>
          sub.id === submissionId
            ? { ...sub, nilai_guru: Number(nilai), catatan_guru: catatan, status: 'dinilai', waktu_dinilai: new Date().toISOString() }
            : sub
        )
      )
      // Also refresh assignments list to keep pengumpulan stats updated
      fetchAssignments()
    } catch (err) {
      addToast('error', 'Gagal Simpan Nilai', err?.response?.data?.message || 'Gagal menyimpan nilai pengumpulan.')
    } finally {
      setSavingGradeId(null)
    }
  }

  const calcAkhir = (tugas, kuis, uts, uas) => {
    const t = tugas !== '' && tugas !== null && tugas !== undefined && !isNaN(Number(tugas)) ? Number(tugas) : null
    const k = kuis !== '' && kuis !== null && kuis !== undefined && !isNaN(Number(kuis)) ? Number(kuis) : null
    const u = uts !== '' && uts !== null && uts !== undefined && !isNaN(Number(uts)) ? Number(uts) : null
    const a = uas !== '' && uas !== null && uas !== undefined && !isNaN(Number(uas)) ? Number(uas) : null
    if (t === null && k === null && u === null && a === null) return ''
    // Bobot resmi: Tugas 20%, Kuis 20%, UTS 30%, UAS 30%
    const total = (t ?? 0) * 0.2 + (k ?? 0) * 0.2 + (u ?? 0) * 0.3 + (a ?? 0) * 0.3
    return Math.round(total)
  }

  const handleSyncGradesFromAssignments = async () => {
    const cid = getCurrentClassId()
    if (!cid) {
      addToast('warning', 'Pilih Rombel', 'Pilih kelas terlebih dahulu.')
      return
    }
    setLoading(true)
    try {
      const sid = getCurrentSubjectId()
      const url = sid ? `/teacher/submissions?class_id=${cid}&subject_id=${sid}&per_page=500` : `/teacher/submissions?class_id=${cid}&per_page=500`
      const res = await api.get(url)
      const raw = res?.data?.data
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : [])
      
      const studentTugasMap = {}
      const studentKuisMap = {}
      list.forEach((sub) => {
        const sid = sub.siswa_id || sub.student_id || sub.student?.id || sub.siswa?.id
        if (sid && sub.nilai_guru !== null && sub.nilai_guru !== undefined && sub.nilai_guru !== '') {
          const isQuiz = sub.penugasan?.jenis_tugas === 'quiz' || sub.jenis_tugas === 'quiz' || sub.penugasan?.jenis_soal === 'quiz'
          if (isQuiz) {
            if (!studentKuisMap[sid]) studentKuisMap[sid] = []
            studentKuisMap[sid].push(Number(sub.nilai_guru))
          } else {
            if (!studentTugasMap[sid]) studentTugasMap[sid] = []
            studentTugasMap[sid].push(Number(sub.nilai_guru))
          }
        }
      })

      let countUpdated = 0
      const newGradesData = { ...gradesData }

      students.forEach((st) => {
        const tScores = studentTugasMap[st.id]
        const kScores = studentKuisMap[st.id]
        if ((tScores && tScores.length > 0) || (kScores && kScores.length > 0)) {
          const avgTugas = tScores && tScores.length > 0 ? Math.round(tScores.reduce((a, b) => a + b, 0) / tScores.length) : ''
          const avgKuis = kScores && kScores.length > 0 ? Math.round(kScores.reduce((a, b) => a + b, 0) / kScores.length) : ''
          const curr = newGradesData[st.id] || { nilai_tugas: '', nilai_kuis: '', nilai_uts: '', nilai_uas: '', nilai_akhir: '' }
          
          const finalTugas = avgTugas !== '' ? avgTugas : curr.nilai_tugas
          const finalKuis = avgKuis !== '' ? avgKuis : curr.nilai_kuis
          const newAkhir = calcAkhir(finalTugas, finalKuis, curr.nilai_uts, curr.nilai_uas)

          newGradesData[st.id] = {
            ...curr,
            nilai_tugas: finalTugas,
            nilai_kuis: finalKuis,
            nilai_akhir: newAkhir,
          }
          countUpdated++
        }
      })

      setGradesData(newGradesData)
      if (countUpdated > 0) {
        addToast('success', 'Nilai Ditarik', `Berhasil menarik nilai tugas & kuis CBT untuk ${countUpdated} siswa dari hasil LMS! Klik "Simpan Nilai Bulk" untuk menyimpan ke rapor.`)
      } else {
        addToast('info', 'Belum Ada Nilai', 'Belum ada data pengumpulan tugas atau kuis yang sudah dinilai pada rombel ini.')
      }
    } catch (err) {
      console.error('Failed to sync grades:', err)
      addToast('error', 'Gagal Menarik Nilai', err?.response?.data?.message || 'Terjadi kesalahan saat menarik data nilai tugas.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveGradesBulk = async () => {
    const classId = getCurrentClassId()
    const subjectId = getCurrentSubjectId()

    if (!classId || !subjectId) {
      addToast('warning', 'Pilih Rombel', 'Pilih kelas & jadwal mengajar terlebih dahulu.')
      return
    }

    try {
      const payload = {
        class_id: classId,
        subject_id: subjectId,
        grades: students.map((st) => {
          const g = gradesData[st.id] || {}
          return {
            student_id: st.id,
            nilai_tugas: g.nilai_tugas !== '' && g.nilai_tugas !== undefined && g.nilai_tugas !== null ? Number(g.nilai_tugas) : null,
            nilai_kuis: g.nilai_kuis !== '' && g.nilai_kuis !== undefined && g.nilai_kuis !== null ? Number(g.nilai_kuis) : null,
            score_quiz: g.nilai_kuis !== '' && g.nilai_kuis !== undefined && g.nilai_kuis !== null ? Number(g.nilai_kuis) : null,
            nilai_uts: g.nilai_uts !== '' && g.nilai_uts !== undefined && g.nilai_uts !== null ? Number(g.nilai_uts) : null,
            nilai_uas: g.nilai_uas !== '' && g.nilai_uas !== undefined && g.nilai_uas !== null ? Number(g.nilai_uas) : null,
            nilai_akhir: g.nilai_akhir !== '' && g.nilai_akhir !== undefined && g.nilai_akhir !== null ? Number(g.nilai_akhir) : null,
          }
        }),
      }
      const response = await api.post('/teacher/grades', payload)
      addToast('success', 'Nilai Disimpan', response?.data?.message || 'Seluruh daftar nilai berhasil disimpan ke rapor!')
      await fetchGrades()
    } catch (err) {
      const message = err?.response?.data?.message || 'Gagal menyimpan daftar nilai.'
      addToast('error', 'Gagal Simpan', message)
    }
  }

  const handleSaveMateri = async (customFormData = null) => {
    const data = (customFormData && typeof customFormData === 'object' && !customFormData.preventDefault)
      ? customFormData
      : materiForm
    const classId = data.class_id || getCurrentClassId()
    const subjectId = data.subject_id || getCurrentSubjectId()

    if (!classId || !subjectId) {
      addToast('warning', 'Pilih Kelas', 'Pilih rombel dan jadwal mengajar yang tersedia sebelum menyimpan materi.')
      return
    }

    setSavingMaterial(true)
    try {
      const payload = {
        ...data,
        class_id: classId,
        subject_id: subjectId,
        tanggal_publish: data.tanggal || data.tanggal_publish,
        tanggal: data.tanggal || data.tanggal_publish,
        urutan: data.urutan,
      }
      const res = editingId
        ? await api.put(`/teacher/materials/${editingId}`, payload)
        : await api.post('/teacher/materials', payload)

      const savedItem = res?.data?.data
      setShowModal(false)
      setEditingId(null)
      addToast('success', editingId ? 'Materi Diperbarui' : 'Materi Tersimpan', res?.data?.message || 'Materi pembelajaran berhasil disimpan.')

      // Optimistic instant UI update
      if (savedItem) {
        setMaterials((prev) => {
          if (editingId) {
            return prev.map((m) => (m.id === editingId ? { ...m, ...savedItem } : m))
          }
          return [savedItem, ...prev.filter((m) => m.id !== savedItem.id)]
        })
      }

      // Background re-fetch to sync pagination count without blocking user
      fetchMaterials()
    } catch (err) {
      addToast('error', 'Gagal Simpan', err?.response?.data?.message || 'Gagal menyimpan materi pembelajaran.')
    } finally {
      setSavingMaterial(false)
    }
  }

  // ── Bank-Soal Helpers ─────────────────────────────────────────────────────
  const resetSoalForm = () => {
    setEditingSoalIdx(null)
    setSoalForm({ tipe: 'pg', pertanyaan: '', opsi_a: '', opsi_b: '', opsi_c: '', opsi_d: '', opsi_e: '', kunci_jawaban: 'A', poin: 2, tingkat_kesulitan: 'sedang', indikator: '', pembahasan: '', matchingPairs: [{ kiri: '', kanan: '' }, { kiri: '', kanan: '' }] })
  }

  const handleSoalTypeChange = (tipe) => {
    let defaultKunci = ''
    if (tipe === 'pg') defaultKunci = 'A'
    if (tipe === 'benar_salah') defaultKunci = 'Benar'
    setSoalForm((prev) => ({ ...prev, tipe, kunci_jawaban: defaultKunci }))
  }

  const handleAddSoal = () => {
    if (!soalForm.pertanyaan.trim()) {
      addToast('warning', 'Teks Soal Kosong', 'Isi teks pertanyaan terlebih dahulu sebelum menambahkan soal.')
      return
    }
    if (soalForm.tipe === 'pg' && (!soalForm.opsi_a.trim() || !soalForm.opsi_b.trim())) {
      addToast('warning', 'Opsi Tidak Lengkap', 'Pilihan Ganda membutuhkan minimal opsi A dan B.')
      return
    }
    const newSoal = {
      ...soalForm,
      matchingPairs: soalForm.tipe === 'menjodohkan' ? soalForm.matchingPairs.filter(p => p.kiri.trim() && p.kanan.trim()) : undefined,
    }
    if (editingSoalIdx !== null) {
      setSoalList((prev) => prev.map((s, i) => i === editingSoalIdx ? newSoal : s))
      addToast('success', 'Soal Diperbarui', `Soal #${editingSoalIdx + 1} berhasil diperbarui.`)
    } else {
      setSoalList((prev) => [...prev, newSoal])
      addToast('success', 'Soal Ditambahkan', `Soal #${soalList.length + 1} berhasil ditambahkan.`)
    }
    resetSoalForm()
  }

  const handleEditSoal = (idx) => {
    const s = soalList[idx]
    setEditingSoalIdx(idx)
    setSoalForm({ ...s, matchingPairs: s.matchingPairs || [{ kiri: '', kanan: '' }, { kiri: '', kanan: '' }] })
    const el = document.getElementById('soalFormSection')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleDeleteSoal = (idx) => {
    setSoalList((prev) => prev.filter((_, i) => i !== idx))
    if (editingSoalIdx === idx) resetSoalForm()
  }

  // Auto-tipe berdasarkan nomor soal: #1-10 = PG, #11-20 = Essay, dst.
  const getAutoTipe = (nextSoalCount) => {
    const mod = nextSoalCount % 20
    if (mod < 10) return 'pg'       // soal ke-1..10, 21..30, dst.
    return 'esai'                    // soal ke-11..20, 31..40, dst.
  }

  const handlePrepareNewSoal = () => {
    const nextIdx = soalList.length
    const autoTipe = getAutoTipe(nextIdx)
    const autoKunci = autoTipe === 'pg' ? 'A' : autoTipe === 'benar_salah' ? 'Benar' : ''
    setEditingSoalIdx(null)
    setSoalForm({
      tipe: autoTipe,
      pertanyaan: '',
      opsi_a: '', opsi_b: '', opsi_c: '', opsi_d: '', opsi_e: '',
      kunci_jawaban: autoKunci,
      poin: autoTipe === 'esai' ? 5 : 2,
      tingkat_kesulitan: 'sedang',
      indikator: '',
      pembahasan: '',
      matchingPairs: [{ kiri: '', kanan: '' }, { kiri: '', kanan: '' }],
    })
    const el = document.getElementById('soalFormSection')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

    const handleCreateTaskFromMaterial = (material) => {
    setEditingId(null)
    const activeClassId = material.class_id || material.kelas_id || material.modul_ajar?.kelas_id || (selectedClass !== 'all' ? selectedClass : '')
    const activeSubjectId = material.subject_id || material.mata_pelajaran_id || material.modul_ajar?.mata_pelajaran_id || getCurrentSubjectId()

    // Default deadline 7 days from today
    const d = new Date()
    d.setDate(d.getDate() + 7)
    const defaultDeadline = d.toISOString().split('T')[0]

    setTugasForm({
      judul: `Latihan: ${material.judul}`,
      subject_id: activeSubjectId,
      class_id: activeClassId,
      materi_id: material.id,
      materi_ids: [material.id],
      instruksi: material.ringkasan
        ? `Silakan pelajari materi "${material.judul}" lalu selesaikan penugasan evaluasi berikut.`
        : `Kerjakan penugasan evaluasi pemahaman untuk materi "${material.judul}".`,
      deskripsi: '',
      tipe_tugas: 'both',
      jenis_soal: 'essay',
      deadline: defaultDeadline,
      bobot: 100,
      file_lampiran: null,
      file_lampiran_preview: null,
      existing_file_url: null,
    })
    setSoalList([])
    resetSoalForm()
    setModalType('tugas')
    setShowModal(true)
  }

  const handleEditTugas = (asg) => {
    setEditingId(asg.id)
    const d = asg.deadline ? (asg.deadline.includes('T') ? asg.deadline.split('T')[0] : asg.deadline) : ''
    let initialMateriIds = []
    if (Array.isArray(asg.materi_ids) && asg.materi_ids.length > 0) {
      initialMateriIds = asg.materi_ids
    } else if (Array.isArray(asg.materials) && asg.materials.length > 0) {
      initialMateriIds = asg.materials.map((m) => m.id)
    } else if (asg.materi_id || asg.materi?.id) {
      initialMateriIds = [asg.materi_id || asg.materi?.id]
    }

    setTugasForm({
      judul: asg.judul || asg.judul_tugas || '',
      subject_id: asg.mata_pelajaran_id || asg.subject_id || getCurrentSubjectId(),
      class_id: asg.kelas_id || asg.class_id || getCurrentClassId(),
      materi_id: initialMateriIds[0] || '',
      materi_ids: initialMateriIds,
      instruksi: asg.instruksi || '',
      deskripsi: '',
      tipe_tugas: asg.tipe_tugas || 'both',
      jenis_tugas: asg.jenis_tugas || (asg.jenis_soal === 'quiz' ? 'quiz' : 'tugas'),
      jenis_soal: asg.jenis_tugas || asg.jenis_soal || 'essay',
      deadline: d,
      bobot: asg.bobot || asg.bobot_persen || 100,
      durasi_menit: asg.durasi_menit || 30,
      nilai_kkm: asg.nilai_kkm || 75,
      file_lampiran: null,
      file_lampiran_preview: null,
      existing_file_url: asg.file_lampiran_url || null,
    })
    // Parse soal_json back into soalList
    try {
      const raw = asg.soal_json || asg.deskripsi || asg.soal_manual || ''
      if (raw && raw.trim().startsWith('[')) {
        const parsed = JSON.parse(raw)
        setSoalList(Array.isArray(parsed) ? parsed : [])
      } else {
        setSoalList([])
      }
    } catch {
      setSoalList([])
    }
    resetSoalForm()
    setModalType('tugas')
    setShowModal(true)
  }

  const handleOpenCreateQuiz = () => {
    setEditingId(null)
    const pool = schedules.length > 0 ? schedules : allTeacherSchedules
    const activeClassId = getCurrentClassId()
    const matchSch = pool.find((s) => String(s.class_id || s.kelas_id || s.kelas?.id || s.class?.id) === String(activeClassId))
    const defDl = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
    setTugasForm({
      judul: 'Kuis CBT: Evaluasi Harian',
      subject_id: matchSch?.subject_id || matchSch?.subject?.id || getCurrentSubjectId(),
      class_id: activeClassId,
      materi_id: '',
      materi_ids: [],
      instruksi: 'Kerjakan kuis interaktif berikut secara mandiri dalam batas durasi yang ditentukan.',
      deskripsi: '',
      tipe_tugas: 'online',
      jenis_tugas: 'quiz',
      jenis_soal: 'objektif',
      deadline: defDl,
      bobot: 100,
      durasi_menit: 30,
      nilai_kkm: 75,
      file_lampiran: null,
      file_lampiran_preview: null,
      existing_file_url: null,
    })
    setSoalList([])
    resetSoalForm()
    setModalType('tugas')
    setShowModal(true)
  }

  const handleOpenCbtPreview = (asg) => {
    let parsedSoal = []
    try {
      const raw = asg.soal_json || asg.deskripsi || ''
      if (raw && raw.trim().startsWith('[')) {
        parsedSoal = JSON.parse(raw)
      }
    } catch {
      parsedSoal = []
    }

    if (!Array.isArray(parsedSoal) || parsedSoal.length === 0) {
      addToast('warning', 'Belum Ada Soal', 'Kuis ini belum memiliki butir soal interaktif untuk dipratinjau.')
      return
    }

    setCbtPreviewModal({
      ...asg,
      parsedSoal,
    })
    setCbtCurrentIdx(0)
    setCbtAnswers({})
    setCbtDoubtful({})
    setCbtFinishedScore(null)
  }

  const handleSaveTugas = async (e) => {
    e.preventDefault()
    const classId = tugasForm.class_id || getCurrentClassId()
    const subjectId = tugasForm.subject_id || getCurrentSubjectId()

    if (!classId || !subjectId) {
      addToast('warning', 'Pilih Kelas', 'Pilih rombel dan jadwal mengajar sebelum membuat tugas baru.')
      return
    }

    setSavingTugas(true)
    try {
      const formData = new FormData()
      formData.append('class_id', classId)
      formData.append('subject_id', subjectId)
      formData.append('judul', tugasForm.judul)
      if (tugasForm.materi_id) {
        formData.append('materi_id', tugasForm.materi_id)
      }
      if (Array.isArray(tugasForm.materi_ids) && tugasForm.materi_ids.length > 0) {
        tugasForm.materi_ids.forEach((id) => formData.append('materi_ids[]', id))
        formData.append('materi_ids_json', JSON.stringify(tugasForm.materi_ids))
      }
      formData.append('instruksi', tugasForm.instruksi || 'Kerjakan tugas sesuai arahan guru.')
      formData.append('deskripsi', soalList.length > 0 ? JSON.stringify(soalList) : (tugasForm.deskripsi || ''))
      formData.append('soal_json', soalList.length > 0 ? JSON.stringify(soalList) : '')
      formData.append('tipe_tugas', tugasForm.tipe_tugas || 'both')
      formData.append('jenis_tugas', tugasForm.jenis_tugas || 'tugas')
      formData.append('durasi_menit', String(tugasForm.durasi_menit || 30))
      formData.append('nilai_kkm', String(tugasForm.nilai_kkm || 75))
      const derivedJenis = soalList.length > 0
        ? (soalList.some((s) => s.tipe === 'pg') && soalList.some((s) => s.tipe === 'esai')
            ? 'campuran'
            : soalList.some((s) => s.tipe === 'pg')
            ? 'objektif'
            : 'essay')
        : (tugasForm.jenis_soal || 'essay')
      formData.append('jenis_soal', derivedJenis)
      formData.append('deadline', tugasForm.deadline)
      formData.append('bobot', String(tugasForm.bobot || 100))
      if (tugasForm.file_lampiran) {
        formData.append('file_lampiran', tugasForm.file_lampiran)
      }

      const res = editingId
        ? await api.post(`/teacher/assignments/${editingId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        : await api.post('/teacher/assignments', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })

      setShowModal(false)
      setEditingId(null)
      setSoalList([])
      resetSoalForm()
      await fetchAssignments()
      addToast('success', editingId ? 'Tugas Diperbarui' : (tugasForm.jenis_tugas === 'quiz' ? 'Kuis CBT Diterbitkan' : 'Tugas Diterbitkan'), res?.data?.message || (editingId ? 'Penugasan berhasil diperbarui.' : 'Penugasan baru berhasil diterbitkan untuk siswa!'))
    } catch (err) {
      addToast('error', 'Gagal Simpan', err?.response?.data?.message || (editingId ? 'Gagal memperbarui penugasan.' : 'Gagal membuat penugasan baru.'))
    } finally {
      setSavingTugas(false)
    }
  }

  const handleSaveTahfizh = async (e) => {
    e.preventDefault()
    if (!tahfizhForm.student_id) {
      addToast('warning', 'Pilih Siswa', 'Silakan pilih siswa terlebih dahulu.')
      return
    }

    if (!tahfizhForm.surah_number) {
      addToast('warning', 'Pilih Surah', 'Pilih surah dari Master Al-Qur’an terlebih dahulu.')
      return
    }

    setSavingTahfizh(true)
    try {
      const res = await api.post('/teacher/tahfizh', { ...tahfizhForm, class_id: getCurrentClassId() })
      setShowModal(false)
      await fetchTahfizh()
      addToast('success', 'Setoran Tahfizh Disimpan', res?.data?.message || 'Catatan setoran hafalan siswa berhasil disimpan!')
    } catch (err) {
      addToast('error', 'Gagal Simpan', err?.response?.data?.message || 'Gagal menyimpan setoran tahfizh.')
    } finally {
      setSavingTahfizh(false)
    }
  }

  const handleSaveCatatan = async (e) => {
    e.preventDefault()
    if (!catatanForm.student_id) {
      addToast('warning', 'Pilih Siswa', 'Silakan pilih siswa terlebih dahulu.')
      return
    }

    setSavingStudentNote(true)
    try {
      const res = editingId
        ? await api.put(`/teacher/student-notes/${editingId}`, catatanForm)
        : await api.post('/teacher/student-notes', catatanForm)
      setShowModal(false)
      setEditingId(null)
      setCatatanForm({ ...emptyCatatanForm })
      await fetchStudentNotes()
      addToast('success', editingId ? 'Catatan Diperbarui' : 'Catatan Disimpan', res?.data?.message || 'Catatan perkembangan siswa berhasil disimpan.')
    } catch (err) {
      addToast('error', 'Gagal Simpan', err?.response?.data?.message || 'Gagal menyimpan catatan siswa.')
    } finally {
      setSavingStudentNote(false)
    }
  }

  const confirmDeleteModal = (type, id, title) => {
    setModalType('delete-confirm')
    setDeleteTarget({ type, id, title })
    setShowModal(true)
  }

  const handleExecuteDelete = async () => {
    if (!deleteTarget) return
    const { type, id } = deleteTarget
    try {
      if (type === 'materi') {
        await api.delete(`/teacher/materials/${id}`)
        await fetchMaterials()
      } else if (type === 'tugas') {
        await api.delete(`/teacher/assignments/${id}`)
        await fetchAssignments()
      } else if (type === 'catatan') {
        await api.delete(`/teacher/student-notes/${id}`)
        await fetchStudentNotes()
      }
      setShowModal(false)
      setDeleteTarget(null)
      addToast('success', 'Data Dihapus', `Data ${deleteTarget.title} berhasil dihapus dari sistem.`)
    } catch (e) {
      addToast('error', 'Gagal Menghapus', 'Terjadi kesalahan saat menghapus data.')
    }
  }

  const exportToSpreadsheet = (columns, rows, filename, format) => {
    const escape = (val) => `"${String(val ?? '').replaceAll('"', '""')}"`
    const headerLine = columns.map((col) => escape(col.label || col.header)).join(',')
    const dataLines = rows.map((row, idx) =>
      columns.map((col) => escape(typeof col.accessor === 'function' ? col.accessor(row, idx) : (row[col.key] ?? ''))).join(',')
    )
    const fileContent = `\uFEFF${[headerLine, ...dataLines].join('\r\n')}`

    let mimeType = 'text/csv;charset=utf-8;'
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
    link.download = `${filename}_${new Date().toISOString().slice(0, 10)}${ext}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleProcessExport = () => {
    setShowExportModal(false)

    if (activeTab === 'log-absensi') {
      if (filteredTeacherLogs.length === 0) {
        addToast('warning', 'Tidak Ada Data', 'Tidak ada data log absensi untuk diekspor.')
        return
      }
      if (exportFormat === 'pdf') {
        downloadPdfTable({
          title: `Log Kehadiran Guru - ${teacherName}`,
          subtitle: `Periode: ${teacherLogMonth === 'semua' ? 'Semua Riwayat' : teacherLogMonth} | Total: ${filteredTeacherLogs.length} Hari`,
          data: filteredTeacherLogs,
          columns: [
            { header: 'Tanggal', accessor: (r) => `${r.date} (${r.day || '-'})` },
            { header: 'Masuk', accessor: (r) => (r.check_in ? `${r.check_in} WIB` : '-') },
            { header: 'Pulang', accessor: (r) => (r.check_out ? `${r.check_out} WIB` : '-') },
            { header: 'Durasi', accessor: (r) => r.duration || '-' },
            { header: 'Status', accessor: (r) => r.status || '-' },
            { header: 'Metode', accessor: (r) => `${r.method || '-'} (${r.device || '-'})` },
          ],
          filename: `log_absensi_guru_${teacherLogMonth}_${new Date().toISOString().slice(0, 10)}.pdf`,
        })
      } else {
        exportToSpreadsheet(
          [
            { label: 'Tanggal', accessor: (r) => r.date },
            { label: 'Hari', accessor: (r) => r.day || '-' },
            { label: 'Waktu Masuk', accessor: (r) => (r.check_in ? `${r.check_in} WIB` : '-') },
            { label: 'Waktu Pulang', accessor: (r) => (r.check_out ? `${r.check_out} WIB` : '-') },
            { label: 'Durasi Kerja', accessor: (r) => r.duration || '-' },
            { label: 'Status', accessor: (r) => r.status || '-' },
            { label: 'Metode Absensi', accessor: (r) => r.method || '-' },
            { label: 'Perangkat', accessor: (r) => r.device || '-' },
          ],
          filteredTeacherLogs,
          `rekap_log_kehadiran_guru_${teacherLogMonth}`,
          exportFormat
        )
      }
      addToast('success', 'Export Selesai', `File log absensi guru (${exportFormat.toUpperCase()}) berhasil diunduh.`)
      return
    }

    if (activeTab === 'penilaian') {
      if (students.length === 0) {
        addToast('warning', 'Tidak Ada Data', 'Tidak ada data siswa rombel untuk diekspor.')
        return
      }
      const gradeCols = [
        { label: 'No', accessor: (_, idx) => idx + 1 },
        { label: 'NIS', accessor: (s) => s.nis || '-' },
        { label: 'NISN', accessor: (s) => s.nisn || '-' },
        { label: 'Nama Lengkap Siswa', accessor: (s) => s.nama_lengkap || s.full_name },
        { label: 'Rombel', accessor: () => selectedClassName },
        { label: 'Nilai Tugas (20%)', accessor: (s) => gradesData[s.id]?.nilai_tugas ?? '' },
        { label: 'Nilai Kuis (20%)', accessor: (s) => gradesData[s.id]?.nilai_kuis ?? '' },
        { label: 'Nilai UTS (30%)', accessor: (s) => gradesData[s.id]?.nilai_uts ?? '' },
        { label: 'Nilai UAS (30%)', accessor: (s) => gradesData[s.id]?.nilai_uas ?? '' },
        { label: 'Nilai Akhir', accessor: (s) => gradesData[s.id]?.nilai_akhir ?? '' },
      ]

      if (exportFormat === 'pdf') {
        downloadPdfTable({
          title: `Buku Rekapitulasi Nilai Siswa - ${selectedClassName}`,
          subtitle: `Mata Pelajaran: ${getCurrentSchedule()?.subject?.name || 'KBM'} | Guru Pengampu: ${teacherName}`,
          data: students,
          columns: gradeCols.map((c) => ({ header: c.label, accessor: c.accessor })),
          filename: `rekap_nilai_${selectedClassName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`,
        })
      } else {
        exportToSpreadsheet(gradeCols, students, `rekap_nilai_${selectedClassName.replace(/\s+/g, '_')}`, exportFormat)
      }
      addToast('success', 'Export Selesai', `Buku nilai siswa rombel ${selectedClassName} (${exportFormat.toUpperCase()}) berhasil diunduh.`)
      return
    }

    // Default: Export Presensi KBM Harian / Rekapitulasi
    const exportStudents = filteredAttendanceStudents.length > 0 ? filteredAttendanceStudents : students
    if (exportStudents.length === 0) {
      addToast('warning', 'Tidak Ada Data', 'Tidak ada data presensi siswa untuk diekspor.')
      return
    }

    const attendanceCols = [
      { label: 'No', accessor: (_, idx) => idx + 1 },
      { label: 'NIS', accessor: (s) => s.nis || '-' },
      { label: 'NISN', accessor: (s) => s.nisn || '-' },
      { label: 'Nama Siswa', accessor: (s) => s.nama_lengkap || s.full_name },
      { label: 'Rombel', accessor: () => selectedClassName },
      { label: 'Tanggal', accessor: () => attendanceDateFilter },
      { label: 'Status Kehadiran', accessor: (s) => attendanceData[s.id]?.status || 'Belum Dicatat' },
      { label: 'Waktu Absen', accessor: (s) => (attendanceData[s.id]?.check_in_time ? `${attendanceData[s.id].check_in_time} WIB` : '-') },
      { label: 'Metode Presensi', accessor: (s) => attendanceData[s.id]?.method || 'Roll Call Guru' },
      { label: 'Catatan Khusus', accessor: (s) => attendanceData[s.id]?.notes || '-' },
    ]

    if (exportFormat === 'pdf') {
      downloadPdfTable({
        title: `Lembar Presensi KBM - ${selectedClassName}`,
        subtitle: `Tanggal: ${attendanceDateFilter} | Topik: ${attendanceTopic} | Guru: ${teacherName}`,
        data: exportStudents,
        columns: attendanceCols.map((c) => ({ header: c.label, accessor: c.accessor })),
        filename: `rekap_presensi_${selectedClassName.replace(/\s+/g, '_')}_${attendanceDateFilter}.pdf`,
      })
    } else {
      exportToSpreadsheet(attendanceCols, exportStudents, `rekap_presensi_${selectedClassName.replace(/\s+/g, '_')}_${attendanceDateFilter}`, exportFormat)
    }

    addToast('success', 'Export Selesai', `Rekap presensi siswa rombel ${selectedClassName} (${exportFormat.toUpperCase()}) berhasil diunduh.`)
  }

  const handleDownloadImportTemplate = (targetType) => {
    if (targetType === 'penilaian') {
      const templateCols = [
        { label: 'NIS', key: 'nis' },
        { label: 'NISN', key: 'nisn' },
        { label: 'Nama Lengkap Siswa', key: 'nama_lengkap' },
        { label: 'Nilai Tugas (0-100)', key: 'nilai_tugas' },
        { label: 'Nilai Kuis (0-100)', key: 'nilai_kuis' },
        { label: 'Nilai UTS (0-100)', key: 'nilai_uts' },
        { label: 'Nilai UAS (0-100)', key: 'nilai_uas' },
      ]
      const sampleRows = students.map((s) => ({
        nis: s.nis || '',
        nisn: s.nisn || '',
        nama_lengkap: s.nama_lengkap || s.full_name || '',
        nilai_tugas: gradesData[s.id]?.nilai_tugas ?? 85,
        nilai_kuis: gradesData[s.id]?.nilai_kuis ?? 90,
        nilai_uts: gradesData[s.id]?.nilai_uts ?? 80,
        nilai_uas: gradesData[s.id]?.nilai_uas ?? 88,
      }))
      exportToSpreadsheet(templateCols, sampleRows, `template_import_nilai_${selectedClassName.replace(/\s+/g, '_')}`, 'xlsx')
    } else {
      const templateCols = [
        { label: 'NIS', key: 'nis' },
        { label: 'NISN', key: 'nisn' },
        { label: 'Nama Lengkap Siswa', key: 'nama_lengkap' },
        { label: 'Status Kehadiran (Hadir/Izin/Sakit/Alpha/Terlambat)', key: 'status' },
        { label: 'Catatan Guru', key: 'notes' },
      ]
      const sampleRows = students.map((s) => ({
        nis: s.nis || '',
        nisn: s.nisn || '',
        nama_lengkap: s.nama_lengkap || s.full_name || '',
        status: attendanceData[s.id]?.status || 'Hadir',
        notes: attendanceData[s.id]?.notes || '',
      }))
      exportToSpreadsheet(templateCols, sampleRows, `template_import_presensi_${selectedClassName.replace(/\s+/g, '_')}`, 'xlsx')
    }
    addToast('success', 'Template Diunduh', 'Gunakan template ini untuk mengisi data offline lalu upload kembali.')
  }

  const handleProcessImport = async () => {
    if (!importFile) {
      setImportError('Silakan pilih berkas spreadsheet (.csv, .xls, .xlsx) terlebih dahulu.')
      return
    }

    try {
      setIsImporting(true)
      setImportError('')
      const text = await importFile.text()
      const lines = text.split(/\r\n|\n|\r/).map((l) => l.trim()).filter(Boolean)

      if (lines.length <= 1) {
        throw new Error('Berkas tidak memiliki data baris untuk diimpor.')
      }

      let parsedCount = 0
      if (importTarget === 'penilaian') {
        const nextGrades = { ...gradesData }
        // Format baris: NIS, NISN, Nama, Nilai Tugas, [Nilai Kuis], Nilai UTS, Nilai UAS
        lines.slice(1).forEach((line) => {
          const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim())
          if (cols.length >= 4) {
            const rawNis = cols[0]
            const rawNisn = cols[1]
            const rawName = cols[2].toLowerCase()

            const matchStudent = students.find((s) => {
              if (rawNis && s.nis && String(s.nis) === String(rawNis)) return true
              if (rawNisn && s.nisn && String(s.nisn) === String(rawNisn)) return true
              return (s.nama_lengkap || s.full_name || '').toLowerCase() === rawName
            })

            if (matchStudent) {
              let tugas = ''
              let kuis = ''
              let uts = ''
              let uas = ''

              if (cols.length >= 7) {
                // New format with kuis
                tugas = cols[3] !== '' && !isNaN(Number(cols[3])) ? Number(cols[3]) : ''
                kuis = cols[4] !== '' && !isNaN(Number(cols[4])) ? Number(cols[4]) : ''
                uts = cols[5] !== '' && !isNaN(Number(cols[5])) ? Number(cols[5]) : ''
                uas = cols[6] !== '' && !isNaN(Number(cols[6])) ? Number(cols[6]) : ''
              } else {
                // Backward compatible format without kuis
                tugas = cols[3] !== '' && !isNaN(Number(cols[3])) ? Number(cols[3]) : ''
                uts = cols[4] !== '' && !isNaN(Number(cols[4])) ? Number(cols[4]) : ''
                uas = cols[5] !== '' && !isNaN(Number(cols[5])) ? Number(cols[5]) : ''
              }

              const t = tugas !== '' ? Number(tugas) : null
              const q = kuis !== '' ? Number(kuis) : null
              const m = uts !== '' ? Number(uts) : null
              const a = uas !== '' ? Number(uas) : null

              let akhir = ''
              if (t !== null || q !== null || m !== null || a !== null) {
                akhir = Math.round((t ?? 0) * 0.2 + (q ?? 0) * 0.2 + (m ?? 0) * 0.3 + (a ?? 0) * 0.3)
              }

              nextGrades[matchStudent.id] = {
                ...(nextGrades[matchStudent.id] || {}),
                nilai_tugas: tugas,
                nilai_kuis: kuis,
                nilai_uts: uts,
                nilai_uas: uas,
                nilai_akhir: akhir,
              }
              parsedCount++
            }
          }
        })
        setGradesData(nextGrades)
        addToast('success', 'Import Nilai Berhasil', `Berhasil memproses nilai untuk ${parsedCount} siswa rombel ${selectedClassName}.`)
      } else {
        // Import Presensi
        const nextAtt = { ...attendanceData }
        const validStatuses = ['hadir', 'izin', 'sakit', 'alpha', 'terlambat']
        lines.slice(1).forEach((line) => {
          const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim())
          if (cols.length >= 3) {
            const rawNis = cols[0]
            const rawNisn = cols[1]
            const rawName = cols[2].toLowerCase()
            const rawStatus = (cols[3] || 'Hadir').trim()
            const rawNotes = cols[4] || ''

            const matchStudent = students.find((s) => {
              if (rawNis && s.nis && String(s.nis) === String(rawNis)) return true
              if (rawNisn && s.nisn && String(s.nisn) === String(rawNisn)) return true
              return (s.nama_lengkap || s.full_name || '').toLowerCase() === rawName
            })

            if (matchStudent) {
              const matchedStatus = validStatuses.includes(rawStatus.toLowerCase())
                ? rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase()
                : 'Hadir'

              nextAtt[matchStudent.id] = {
                ...(nextAtt[matchStudent.id] || {}),
                status: matchedStatus,
                method: 'Import File',
                check_in_time: matchedStatus === 'Hadir' ? '07:15' : '-',
                notes: rawNotes,
              }
              parsedCount++
            }
          }
        })
        setAttendanceData(nextAtt)
        addToast('success', 'Import Presensi Berhasil', `Berhasil memproses presensi untuk ${parsedCount} siswa rombel ${selectedClassName}.`)
      }

      setShowImportModal(false)
      setImportFile(null)
      setImportError('')
    } catch (err) {
      setImportError(err.message || 'Gagal memproses berkas import. Pastikan format kolom sesuai dengan template.')
    } finally {
      setIsImporting(false)
    }
  }

  const sortedCatatanStudents = useMemo(() => {
    const list = students.filter((student) => {
      if (selectedClass && selectedClass !== 'all') {
        const sClassId = student.kelas_id || student.class_id || student.kelas?.id
        if (!sClassId || String(sClassId) !== String(selectedClass)) return false
      }
      const query = studentNoteSearch.trim().toLowerCase()
      const matchesSearch = !query || [student.nama_lengkap, student.full_name, student.nis, student.nisn]
        .some((value) => String(value || '').toLowerCase().includes(query))
      const notes = studentNotes.filter((note) => note.student_id === student.id)
      const matchesCategory = studentNoteCategory === 'semua' || notes.some((note) => note.category === studentNoteCategory)
      const matchesPriority = studentNotePriority === 'semua' || notes.some((note) => note.priority === studentNotePriority)
      return matchesSearch && matchesCategory && matchesPriority
    })

    return list.sort((a, b) => {
      let valA = ''
      let valB = ''
      const notesA = studentNotes.filter((note) => note.student_id === a.id)
      const notesB = studentNotes.filter((note) => note.student_id === b.id)
      if (catatanSortField === 'name') {
        valA = (a.nama_lengkap || a.full_name || '').toLowerCase()
        valB = (b.nama_lengkap || b.full_name || '').toLowerCase()
      } else if (catatanSortField === 'count') {
        const diff = notesA.length - notesB.length
        return catatanSortOrder === 'asc' ? diff : -diff
      } else if (catatanSortField === 'date') {
        valA = notesA[0]?.date || ''
        valB = notesB[0]?.date || ''
      }
      const cmp = String(valA).localeCompare(String(valB), 'id', { numeric: true })
      return catatanSortOrder === 'asc' ? cmp : -cmp
    })
  }, [students, selectedClass, studentNoteSearch, studentNotes, studentNoteCategory, studentNotePriority, catatanSortField, catatanSortOrder])
  const catatanStudents = sortedCatatanStudents

  const filteredAttendanceStudents = useMemo(() => {
    const list = students.filter((student) => {
      if (selectedClass && selectedClass !== 'all') {
        const sClassId = student.kelas_id || student.class_id || student.kelas?.id
        // Strict: tolak jika kelas_id tidak ada atau tidak cocok
        if (!sClassId || String(sClassId) !== String(selectedClass)) return false
      }
      const query = (debouncedAttendanceSearch || '').trim().toLowerCase()
      const studentStatus = attendanceData[student.id]?.status || 'Belum Dicatat'
      const matchesSearch = !query || [student.nama_lengkap, student.full_name, student.nis, student.nisn]
        .some((value) => String(value || '').toLowerCase().includes(query))
      const matchesStatus = !attendanceStatusFilter || studentStatus === attendanceStatusFilter
      return matchesSearch && matchesStatus
    })

    return list.sort((a, b) => {
      let valA = ''
      let valB = ''
      if (attendanceSortField === 'name') {
        valA = (a.nama_lengkap || a.full_name || '').toLowerCase()
        valB = (b.nama_lengkap || b.full_name || '').toLowerCase()
      } else if (attendanceSortField === 'nis') {
        valA = a.nis || a.nisn || ''
        valB = b.nis || b.nisn || ''
      } else if (attendanceSortField === 'status') {
        valA = attendanceData[a.id]?.status || 'Belum Dicatat'
        valB = attendanceData[b.id]?.status || 'Belum Dicatat'
      } else if (attendanceSortField === 'time') {
        valA = attendanceData[a.id]?.waktu || ''
        valB = attendanceData[b.id]?.waktu || ''
      }
      const cmp = String(valA).localeCompare(String(valB), 'id', { numeric: true })
      return attendanceSortOrder === 'asc' ? cmp : -cmp
    })
  }, [students, selectedClass, debouncedAttendanceSearch, attendanceStatusFilter, attendanceData, attendanceSortField, attendanceSortOrder])

  const totalAttendancePages = Math.max(1, Math.ceil(filteredAttendanceStudents.length / attendancePerPage))
  const paginatedAttendanceStudents = useMemo(() => {
    const start = (attendancePage - 1) * attendancePerPage
    return filteredAttendanceStudents.slice(start, start + attendancePerPage)
  }, [filteredAttendanceStudents, attendancePage, attendancePerPage])

  const sortedGradeStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      const gradeA = gradesData[a.id] || {}
      const gradeB = gradesData[b.id] || {}
      if (gradeSortField === 'name') {
        const valA = (a.nama_lengkap || a.full_name || '').toLowerCase()
        const valB = (b.nama_lengkap || b.full_name || '').toLowerCase()
        const cmp = valA.localeCompare(valB, 'id')
        return gradeSortOrder === 'asc' ? cmp : -cmp
      } else if (['tugas', 'kuis', 'uts', 'uas', 'akhir'].includes(gradeSortField)) {
        const key = `nilai_${gradeSortField}`
        const numA = Number(gradeA[key] ?? -1)
        const numB = Number(gradeB[key] ?? -1)
        const diff = numA - numB
        return gradeSortOrder === 'asc' ? diff : -diff
      }
      return 0
    })
  }, [students, gradesData, gradeSortField, gradeSortOrder])

  useEffect(() => {
    setAttendancePage(1)
  }, [debouncedAttendanceSearch, attendanceStatusFilter, attendancePeriodFilter, attendanceDateFilter, attendanceWeekFilter, attendanceMonthFilter, attendanceSemesterFilter, selectedClass])

  const historySummary = useMemo(() => {
    let totalSessions = historySessions.length
    let totalHadir = 0
    let totalTerlambat = 0
    let totalIzin = 0
    let totalSakit = 0
    let totalAlpa = 0

    historySessions.forEach((session) => {
      const records = session.attendances || []
      records.forEach((rec) => {
        const st = (rec.status_hadir || rec.status || '').toLowerCase()
        if (st === 'hadir') totalHadir++
        else if (st === 'terlambat') totalTerlambat++
        else if (st === 'izin') totalIzin++
        else if (st === 'sakit') totalSakit++
        else if (st === 'alpa' || st === 'alpha') totalAlpa++
      })
    })

    const totalLogs = totalHadir + totalTerlambat + totalIzin + totalSakit + totalAlpa
    const attendanceRate = totalLogs > 0 ? Math.round(((totalHadir + totalTerlambat) / totalLogs) * 100) : 0

    return {
      totalSessions,
      totalLogs,
      totalHadir,
      totalTerlambat,
      totalIzin,
      totalSakit,
      totalAlpa,
      attendanceRate,
    }
  }, [historySessions])

  useEffect(() => {
    if (attendanceCenterTab === 'riwayat' || showPresensiModal) {
      fetchHistorySessions()
    }
  }, [
    attendanceCenterTab,
    showPresensiModal,
    attendancePeriodFilter,
    attendanceDateFilter,
    attendanceWeekFilter,
    attendanceMonthFilter,
    attendanceSemesterFilter,
    selectedClass,
  ])

  const renderAttendanceHistorySection = (isModal = false) => {
    return (
      <div className="space-y-4">
        {/* Header & Filter Rentang Periode */}
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
                <History className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  Riwayat Presensi KBM • Rombel {selectedClassName}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Evaluasi log kehadiran KBM berdasarkan rentang hari, minggu, bulan, dan semester
                </p>
              </div>
            </div>

            {/* Periode Tab Buttons (Hari, Minggu, Bulan, Semester) */}
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-xl bg-white p-1 shadow-xs border border-emerald-500/20 dark:bg-slate-800 dark:border-slate-700">
                {[
                  { id: 'harian', label: 'Hari', icon: CalendarDays },
                  { id: 'mingguan', label: 'Minggu', icon: CalendarRange },
                  { id: 'bulanan', label: 'Bulan', icon: Calendar },
                  { id: 'semester', label: 'Semester', icon: Clock },
                ].map((item) => {
                  const Icon = item.icon
                  const isActive = attendancePeriodFilter === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAttendancePeriodFilter(item.id)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {item.label}
                    </button>
                  )
                })}
              </div>

              {/* Export Summary Button */}
              <button
                type="button"
                onClick={handleExportHistorySessionsSummary}
                disabled={loadingHistorySessions || historySessions.length === 0}
                title="Export Rekap Sesi KBM Periode Ini ke Excel (.csv)"
                className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-emerald-500/30 bg-white text-xs font-bold text-emerald-700 shadow-xs hover:bg-emerald-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-400 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export Rekap</span>
              </button>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={fetchHistorySessions}
                disabled={loadingHistorySessions}
                title="Muat Ulang Riwayat"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/30 bg-white text-emerald-700 shadow-xs hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-400"
              >
                <RefreshCw className={`h-4 w-4 ${loadingHistorySessions ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Sub-Filter Kontrol Sesuai Rentang Waktu yang Dipilih */}
          <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs border-t border-emerald-500/15 pt-3">
            {attendancePeriodFilter === 'harian' && (
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Pilih Tanggal:</label>
                <input
                  type="date"
                  value={attendanceDateFilter}
                  onChange={(e) => setAttendanceDateFilter(e.target.value)}
                  className="h-8 rounded-lg border border-emerald-500/30 bg-white px-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setAttendanceDateFilter(new Date().toLocaleDateString('en-CA'))}
                  className="rounded-lg border border-emerald-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-700 shadow-xs hover:bg-emerald-50 dark:border-emerald-800 dark:bg-slate-800 dark:text-emerald-300"
                >
                  Hari Ini
                </button>
                <span className="rounded-md bg-emerald-100/70 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Tanggal Aktif: {new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${attendanceDateFilter}T12:00:00`))}
                </span>
              </div>
            )}

            {attendancePeriodFilter === 'mingguan' && (
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Pilih Pekan Efektif:</label>
                <select
                  value={attendanceWeekFilter}
                  onChange={(e) => setAttendanceWeekFilter(e.target.value)}
                  className="h-8 rounded-lg border border-emerald-500/30 bg-white px-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="pekan_ini">Pekan Berjalan (Saat Ini)</option>
                  {Array.from({ length: 16 }, (_, i) => (
                    <option key={i + 1} value={`pekan_${i + 1}`}>
                      Pekan ke-{i + 1} (KBM Pekan {i + 1})
                    </option>
                  ))}
                </select>
                <span className="rounded-md bg-emerald-100/70 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Rentang 7 Hari KBM Rombel {selectedClassName}
                </span>
              </div>
            )}

            {attendancePeriodFilter === 'bulanan' && (
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Pilih Bulan TA 2026/2027:</label>
                <select
                  value={attendanceMonthFilter}
                  onChange={(e) => setAttendanceMonthFilter(e.target.value)}
                  className="h-8 rounded-lg border border-emerald-500/30 bg-white px-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="07">Juli 2026 (Awal Tahun Ajaran 2026/2027)</option>
                  <option value="08">Agustus 2026</option>
                  <option value="09">September 2026 (Bulan Berjalan)</option>
                  <option value="10">Oktober 2026</option>
                  <option value="11">November 2026</option>
                  <option value="12">Desember 2026 (Penilaian Akhir Semester 1)</option>
                  <option value="01">Januari 2027 (Awal Semester 2)</option>
                  <option value="02">Februari 2027 🌙 (Bulan Ramadhan 1448 H)</option>
                  <option value="03">Maret 2027 🕌 (Hari Raya Idul Fitri 1448 H)</option>
                  <option value="04">April 2027</option>
                  <option value="05">Mei 2027</option>
                  <option value="06">Juni 2027 (PAT & Rapor Kenaikan Kelas)</option>
                </select>
                <span className="rounded-md bg-emerald-100/70 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Presensi Bulanan Lengkap
                </span>
              </div>
            )}

            {attendancePeriodFilter === 'semester' && (
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Pilih Semester:</label>
                <select
                  value={attendanceSemesterFilter}
                  onChange={(e) => setAttendanceSemesterFilter(e.target.value)}
                  className="h-8 rounded-lg border border-emerald-500/30 bg-white px-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="1">Semester 1 (Ganjil) - Juli s/d Desember 2026</option>
                  <option value="2">Semester 2 (Genap) - Januari s/d Juni 2027</option>
                </select>
                <span className="rounded-md bg-emerald-100/70 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Agregasi Kumulatif 1 Semester
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 6 Master KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Sesi</span>
            <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">{historySummary.totalSessions} Sesi</p>
            <span className="text-[10px] text-slate-500">Rentang {attendancePeriodFilter}</span>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 shadow-xs dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Kehadiran</span>
            <p className="mt-1 text-lg font-black text-emerald-700 dark:text-emerald-300">{historySummary.attendanceRate}%</p>
            <span className="text-[10px] text-emerald-600/80">Rata-rata Kelas</span>
          </div>
          <div className="rounded-xl border border-green-200 bg-green-50/50 p-3 shadow-xs dark:border-green-900/50 dark:bg-green-950/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 dark:text-green-300">Hadir</span>
            <p className="mt-1 text-lg font-black text-green-700 dark:text-green-300">{historySummary.totalHadir}</p>
            <span className="text-[10px] text-green-600/80">Log Kehadiran</span>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 shadow-xs dark:border-amber-900/50 dark:bg-amber-950/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">Terlambat</span>
            <p className="mt-1 text-lg font-black text-amber-700 dark:text-amber-300">{historySummary.totalTerlambat}</p>
            <span className="text-[10px] text-amber-600/80">Masuk Sesi</span>
          </div>
          <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-3 shadow-xs dark:border-sky-900/50 dark:bg-sky-950/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">Izin / Sakit</span>
            <p className="mt-1 text-lg font-black text-sky-700 dark:text-sky-300">{historySummary.totalIzin + historySummary.totalSakit}</p>
            <span className="text-[10px] text-sky-600/80">{historySummary.totalIzin} Izin • {historySummary.totalSakit} Sakit</span>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 shadow-xs dark:border-rose-900/50 dark:bg-rose-950/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">Alpa</span>
            <p className="mt-1 text-lg font-black text-rose-700 dark:text-rose-300">{historySummary.totalAlpa}</p>
            <span className="text-[10px] text-rose-600/80">Tanpa Keterangan</span>
          </div>
        </div>

        {/* Daftar Sesi Pertemuan */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Daftar Sesi Pembelajaran ({historySessions.length} Sesi Terdata)
            </h5>
            <span className="text-[11px] text-slate-400">
              Menampilkan riwayat rentang {attendancePeriodFilter}
            </span>
          </div>

          {loadingHistorySessions ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900/50">
              <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
              <p className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                Memuat riwayat sesi presensi...
              </p>
            </div>
          ) : historySessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <Calendar className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-bold text-slate-800 dark:text-white">
                Tidak Ada Riwayat Sesi pada Rentang Waktu Ini
              </p>
              <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
                Belum ada sesi pembelajaran yang tercatat untuk rombel {selectedClassName} pada periode {attendancePeriodFilter} ini. Anda dapat mengganti rentang tanggal, pekan, atau bulan di atas.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {historySessions
                .slice((historySessionsPage - 1) * historySessionsPerPage, historySessionsPage * historySessionsPerPage)
                .map((session, sIdx) => {
                const sessionDate = session.attendance_date ? new Date(session.attendance_date) : null
                const dateFormatted = sessionDate
                  ? sessionDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                  : '-'
                const timeRange = session.schedule?.time_start && session.schedule?.time_end
                  ? `${session.schedule.time_start.slice(0, 5)} – ${session.schedule.time_end.slice(0, 5)} WIB`
                  : '07:30 – 09:00 WIB'

                const attList = session.attendances || []
                const hadir = attList.filter((a) => (a.status_hadir || a.status || '').toLowerCase() === 'hadir').length
                const terlambat = attList.filter((a) => (a.status_hadir || a.status || '').toLowerCase() === 'terlambat').length
                const izin = attList.filter((a) => (a.status_hadir || a.status || '').toLowerCase() === 'izin').length
                const sakit = attList.filter((a) => (a.status_hadir || a.status || '').toLowerCase() === 'sakit').length
                const alpa = attList.filter((a) => ['alpa', 'alpha'].includes((a.status_hadir || a.status || '').toLowerCase())).length
                const totalAtt = attList.length
                const rate = totalAtt > 0 ? Math.round(((hadir + terlambat) / totalAtt) * 100) : 0

                return (
                  <div
                    key={session.id || sIdx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-emerald-500/40 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Pertemuan ke-{session.meeting_number || sIdx + 1}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {timeRange}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          {dateFormatted}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {session.schedule?.subject?.name || 'Mata Pelajaran'} • {session.schedule?.kelas?.name || selectedClassName}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        Topik: {session.topic || session.learning_material || 'Materi KBM Reguler'}
                      </p>

                      {/* Status Badges Breakdown */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40">
                          {hadir} Hadir
                        </span>
                        {terlambat > 0 && (
                          <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40">
                            {terlambat} Terlambat
                          </span>
                        )}
                        {izin > 0 && (
                          <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-200/60 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/40">
                            {izin} Izin
                          </span>
                        )}
                        {sakit > 0 && (
                          <span className="rounded-md bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700 border border-violet-200/60 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/40">
                            {sakit} Sakit
                          </span>
                        )}
                        {alpa > 0 && (
                          <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40">
                            {alpa} Alpa
                          </span>
                        )}
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          Tingkat: {rate}% ({totalAtt} Siswa)
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedHistorySession(session)
                          setHistorySessionStudentSearch('')
                          setShowHistorySessionModal(true)
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-xs transition hover:bg-emerald-50 hover:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-300 dark:hover:bg-slate-700 cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" /> Lihat Detail Siswa
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination Kontrol Riwayat Sesi (Maksimal 10 Baris) */}
          {historySessions.length > historySessionsPerPage && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/15 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-[#1B2433]">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Menampilkan{' '}
                <strong className="text-emerald-700 dark:text-emerald-300">
                  {(historySessionsPage - 1) * historySessionsPerPage + 1}
                </strong>{' '}
                s.d.{' '}
                <strong className="text-emerald-700 dark:text-emerald-300">
                  {Math.min(historySessionsPage * historySessionsPerPage, historySessions.length)}
                </strong>{' '}
                dari <strong className="text-slate-900 dark:text-white">{historySessions.length}</strong> sesi pertemuan
              </div>
              <Pagination
                currentPage={historySessionsPage}
                totalPages={Math.max(1, Math.ceil(historySessions.length / historySessionsPerPage))}
                onPageChange={setHistorySessionsPage}
                sideLayout="full"
                variant="compact"
              />
            </div>
          )}
        </div>
      </div>
    )
  }
  const teacherName = teacherProfile?.name || 'Ustadz Ahmad Fauzi, S.Pd.I'
  const scheduleDays = [
    { short: 'Sen', name: 'Senin' },
    { short: 'Sel', name: 'Selasa' },
    { short: 'Rab', name: 'Rabu' },
    { short: 'Kam', name: 'Kamis' },
    { short: 'Jum', name: 'Jumat' },
  ]
  const selectedDateDay = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date(`${selectedDate}T12:00:00`))
  const dayMapping = {
    1: 'Senin', 2: 'Selasa', 3: 'Rabu', 4: 'Kamis', 5: 'Jumat', 6: 'Sabtu', 7: 'Ahad'
  }
  const getScheduleDay = (schedule) => schedule.day_name || schedule.nama_hari || dayMapping[schedule.day_of_week] || schedule.day || schedule.hari || selectedDateDay
  const getScheduleSubject = (schedule) => schedule.subject?.name || schedule.subject_name || schedule.mata_pelajaran || 'Mata Pelajaran'
  const getScheduleClass = (schedule) => schedule.class?.name || schedule.kelas?.nama_kelas || schedule.kelas?.name || schedule.class_name || selectedClassName
  const getScheduleRoom = (schedule) => schedule.room_name || schedule.room?.name || schedule.ruangan || schedule.kelas?.ruangan || 'Ruang belum ditentukan'
  const dayOrderMap = { 'senin': 1, 'selasa': 2, 'rabu': 3, 'kamis': 4, 'jumat': 5, 'sabtu': 6, 'ahad': 7, 'minggu': 7 }
  const sortedSchedules = useMemo(() => {
    const seen = new Set()
    const unique = []
    for (const s of schedules) {
      const d = getScheduleDay(s)
      const tStart = (s.start_time || s.time_start || s.jam_mulai || '00:00').slice(0, 5)
      const tEnd = (s.end_time || s.time_end || s.jam_selesai || '00:00').slice(0, 5)
      const sub = getScheduleSubject(s)
      const cls = getScheduleClass(s)
      const key = `${d}-${tStart}-${tEnd}-${sub}-${cls}`
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(s)
      }
    }
    return unique.sort((first, second) => {
      const dayA = dayOrderMap[getScheduleDay(first).toLowerCase()] || 99
      const dayB = dayOrderMap[getScheduleDay(second).toLowerCase()] || 99
      if (dayA !== dayB) return dayA - dayB
      const timeA = first.start_time || first.time_start || first.jam_mulai || '00:00'
      const timeB = second.start_time || second.time_start || second.jam_mulai || '00:00'
      return timeA.localeCompare(timeB)
    })
  }, [schedules, selectedDateDay])
  const selectedDaySchedules = useMemo(() => {
    return sortedSchedules.filter((schedule) => getScheduleDay(schedule).toLowerCase() === selectedDateDay.toLowerCase())
  }, [sortedSchedules, selectedDateDay])

  const activeScheduleDays = useMemo(() => {
    const daysSet = new Set()
    sortedSchedules.forEach((s) => {
      const d = getScheduleDay(s)
      if (d) daysSet.add(d)
    })
    return Array.from(daysSet)
  }, [sortedSchedules])

  const timelineSchedules = useMemo(() => {
    if (timelineFilter === 'hari_ini') {
      return selectedDaySchedules
    }
    if (timelineFilter === 'semua') {
      return sortedSchedules
    }
    if (timelineFilter !== 'auto') {
      return sortedSchedules.filter((schedule) => getScheduleDay(schedule).toLowerCase() === timelineFilter.toLowerCase())
    }
    // 'auto' mode: if today has sessions, show today; otherwise show all sessions so it's not an empty dead-end
    if (selectedDaySchedules.length > 0) {
      return selectedDaySchedules
    }
    return sortedSchedules
  }, [timelineFilter, selectedDaySchedules, sortedSchedules])

  useEffect(() => {
    if (sortedSchedules.length === 0) return
    const todayShort = scheduleDays.find((d) => d.name.toLowerCase() === selectedDateDay.toLowerCase())?.short
    const todayHasSessions = todayShort && sortedSchedules.some((s) => getScheduleDay(s).toLowerCase() === selectedDateDay.toLowerCase())
    if (todayHasSessions) {
      setWeeklySelectedDay(todayShort)
    } else {
      const firstActiveDay = scheduleDays.find((d) => sortedSchedules.some((s) => getScheduleDay(s).toLowerCase() === d.name.toLowerCase()))
      if (firstActiveDay) {
        setWeeklySelectedDay(firstActiveDay.short)
      }
    }
  }, [sortedSchedules, selectedDateDay])

  const visibleWeeklyDay = scheduleDays.find((day) => day.short === weeklySelectedDay)?.name || 'Senin'
  const weeklySchedules = sortedSchedules.filter((schedule) => getScheduleDay(schedule).toLowerCase() === visibleWeeklyDay.toLowerCase())
  const publishedMaterials = materials.filter((material) => ['published', 'aktif', 'active'].includes(String(material.status || '').toLowerCase())).length
  // Daftar mapel unik: bersumber dari jadwal pengajaran guru (allTeacherSchedules / schedules)
  // yang disaring sesuai selectedClass (atau semua jika 'all'), ditambah mapel dari materials
  const uniqueMapelOptions = useMemo(() => {
    const seen = new Map()
    const pool = (allTeacherSchedules && allTeacherSchedules.length > 0) ? allTeacherSchedules : schedules
    pool.forEach((s) => {
      const sClassId = s.class_id || s.kelas_id || s.kelas?.id || s.class?.id
      if (!selectedClass || selectedClass === 'all' || String(sClassId) === String(selectedClass)) {
        const id = s.subject_id || s.subject?.id
        const name = s.subject?.nama_mapel || s.subject?.name
        if (id && name && !seen.has(String(id))) {
          seen.set(String(id), name)
        }
      }
    })
    // Fallback/tambahan dari materials yang ter-load
    materials.forEach((m) => {
      const id = m.subject?.id || m.mata_pelajaran_id
      const name = m.subject?.name || m.subject?.nama_mapel
      if (id && name && !seen.has(String(id))) {
        seen.set(String(id), name)
      }
    })
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name))
  }, [allTeacherSchedules, schedules, selectedClass, materials])

  // Filter client-side tambahan: hanya secondary check (backend sudah filter utama)
  const filteredMaterials = useMemo(() => materials.filter((material) => {
    // Secondary class check (jika kelas_id ada di response dan berbeda → tolak)
    if (selectedClass && selectedClass !== 'all') {
      const matClassId = material.modul_ajar?.kelas_id || material.modul_ajar?.rombel_id || material.class_id || material.kelas_id
      if (matClassId && String(matClassId) !== String(selectedClass)) return false
    }
    // Secondary mapel check (jika subject_id ada dan berbeda → tolak)
    if (materialMapelFilter && materialMapelFilter !== 'all') {
      const matSubjectId = material.subject?.id || material.mata_pelajaran_id || material.subject_id
      if (matSubjectId && String(matSubjectId) !== String(materialMapelFilter)) return false
    }
    return true
  }), [materials, selectedClass, materialMapelFilter])


  const handleMaterialDateChange = (newDate) => {
    const calc = calculatePekanFromDate(newDate)
    setMateriForm((prev) => {
      let updatedJudul = prev.judul
      const pekanPrefixMatch = updatedJudul.match(/^Pekan\s+\d+:\s*(.*)$/i)
      if (pekanPrefixMatch) {
        updatedJudul = `Pekan ${String(calc.pekan).padStart(2, '0')}: ${pekanPrefixMatch[1]}`
      } else if (!updatedJudul.trim()) {
        updatedJudul = `Pekan ${String(calc.pekan).padStart(2, '0')}: `
      }

      return {
        ...prev,
        tanggal: newDate,
        tanggal_publish: newDate,
        urutan: calc.pekan,
        judul: updatedJudul,
      }
    })
  }

  const openMaterialForm = (material = null) => {
    setEditingId(material?.id || null)
    const rawDate = material?.tanggal_publish || material?.tanggal || material?.created_at || '2026-09-09'
    const parsedDate = typeof rawDate === 'string' ? rawDate.split('T')[0].split(' ')[0] : '2026-09-09'
    const calc = calculatePekanFromDate(parsedDate)

    setMateriForm({
      judul: material?.judul || (material ? '' : `Pekan ${String(calc.pekan).padStart(2, '0')}: `),
      subject_id: material?.subject_id || '',
      class_id: selectedClass,
      ringkasan: material?.ringkasan || '',
      isi: material?.isi || '',
      file: material?.file || material?.file_raw || material?.link || '',
      video: material?.video || '',
      link: material?.link || material?.file || material?.file_raw || '',
      status: material?.status || 'published',
      tanggal: parsedDate,
      tanggal_publish: parsedDate,
      urutan: material?.urutan || calc.pekan,
    })
    setModalType('materi')
    setShowModal(true)
  }

  const openMaterialDetail = (material) => {
    const rawLink = material.link || material.file || material.file_raw || ''
    const rawDate = material.tanggal_publish || material.created_at
    const calc = calculatePekanFromDate(rawDate)
    setDetailData({
      category: 'Materi Belajar',
      title: material.judul,
      video: material.video || '',
      file: material.file || material.file_raw || '',
      link: rawLink,
      items: [
        { label: 'Mata pelajaran', value: material.subject?.name || material.subject?.nama_mapel || 'Belum ditentukan' },
        { label: 'Status', value: material.status === 'published' ? 'Dipublikasikan' : 'Draft' },
        { label: 'Tanggal Pembelajaran', value: rawDate ? new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(rawDate)) : '-' },
        { label: 'Pekan Ke-', value: `Pekan ${String(material.urutan || calc.pekan).padStart(2, '0')} (${calc.label})` },
        { label: 'Ringkasan', value: material.ringkasan || 'Tidak ada ringkasan' },
        { label: 'Isi materi', value: material.isi || 'Belum ada isi materi' },
        ...(rawLink ? [{ label: 'Tautan Dokumen / Link', value: rawLink }] : []),
        ...(material.video ? [{ label: 'Tautan Video', value: material.video }] : []),
      ],
    })
    setShowDetailModal(true)
  }

  const printMaterial = (material, saveAsPdf = false) => {
    const printWindow = window.open('', '_blank', 'width=900,height=720')
    if (!printWindow) {
      addToast('warning', 'Popup Diblokir', 'Izinkan popup browser untuk mencetak atau menyimpan materi sebagai PDF.')
      return
    }

    printWindow.opener = null
    const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;',
    }[character]))
    const content = escapeHtml(material.isi || 'Belum ada isi materi.').replace(/\n/g, '<br>')
    const summary = escapeHtml(material.ringkasan || 'Tidak ada ringkasan.')
    const publishedAt = material.tanggal_publish || material.updated_at || material.created_at
    const formattedDate = publishedAt
      ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(publishedAt))
      : new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date())

    printWindow.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(material.judul)} — Materi Belajar</title><style>
      @page{size:A4;margin:18mm}*{box-sizing:border-box}body{margin:0;color:#172033;font:12pt/1.65 Arial,sans-serif}.header{border-bottom:3px solid #0e5c44;padding-bottom:18px}.brand{color:#0e5c44;font-size:10pt;font-weight:700;letter-spacing:.14em;text-transform:uppercase}.title{margin:8px 0 5px;font-size:24pt;line-height:1.2;color:#0f172a}.meta{color:#64748b;font-size:9.5pt}.summary{margin:24px 0;padding:16px 18px;border:1px solid #cce5da;border-radius:10px;background:#f0f9f5}.summary strong{display:block;margin-bottom:5px;color:#0e5c44}.content{white-space:normal}.footer{margin-top:36px;padding-top:12px;border-top:1px solid #dbe3ea;color:#64748b;font-size:8.5pt;display:flex;justify-content:space-between}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.no-print{display:none}}@media screen{body{max-width:794px;margin:32px auto;padding:32px;box-shadow:0 8px 30px #0f172a20}.no-print{position:fixed;right:24px;top:24px;border:0;border-radius:10px;background:#0e5c44;color:white;padding:11px 16px;font-weight:700;cursor:pointer}}
    </style></head><body><button class="no-print" onclick="window.print()">${saveAsPdf ? 'Simpan sebagai PDF' : 'Cetak Materi'}</button><header class="header"><div class="brand">SIMSIT · Materi Belajar</div><h1 class="title">${escapeHtml(material.judul)}</h1><div class="meta">${escapeHtml(material.subject?.name || 'Mata Pelajaran')} · ${escapeHtml(selectedClassName)} · ${formattedDate}</div></header><section class="summary"><strong>Ringkasan Materi</strong>${summary}</section><main class="content">${content}</main><footer class="footer"><span>${escapeHtml(teacherName)}</span><span>Workspace Pengajaran Guru</span></footer><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),250))</script></body></html>`)
    printWindow.document.close()
    if (saveAsPdf) addToast('info', 'Export PDF Dibuka', 'Pada dialog cetak, pilih “Save as PDF” atau “Simpan sebagai PDF”.')
  }
  const activeAssignments = assignments.filter((assignment) => !['selesai', 'closed', 'archived'].includes(String(assignment.status || '').toLowerCase())).length

  const filteredAssignments = useMemo(() => {
    return assignments.filter((asg) => {
      // 1. Filter by Rombel / Class
      if (selectedClass && selectedClass !== "all") {
        const asgClassId = asg.kelas_id || asg.class_id || asg.kelas?.id
        // Strict: tolak jika class ID tidak ada atau tidak cocok dengan rombel yang dipilih
        if (!asgClassId || String(asgClassId) !== String(selectedClass)) {
          return false
        }
      }

      // 2. Search query (judul, instruksi, mapel, kelas)
      const q = assignmentSearch.trim().toLowerCase()
      if (q) {
        const matchTitle = (asg.judul || asg.judul_tugas || "").toLowerCase().includes(q)
        const matchInstruksi = (asg.instruksi || "").toLowerCase().includes(q)
        const matchSubject = (asg.subject?.name || asg.subject?.nama_pelajaran || "").toLowerCase().includes(q)
        const matchKelas = (asg.kelas?.nama_kelas || asg.kelas?.name || "").toLowerCase().includes(q)
        if (!matchTitle && !matchInstruksi && !matchSubject && !matchKelas) {
          return false
        }
      }

      // 3. Jenis Soal / Format filter
      if (assignmentJenisFilter !== "all") {
        const isQuiz = asg.jenis_tugas === 'quiz' || asg.jenis_soal === 'quiz'
        const jenis = String(asg.jenis_tugas || asg.jenis_soal || "essay").toLowerCase()
        if (assignmentJenisFilter === 'quiz') {
          if (!isQuiz) return false
        } else if (assignmentJenisFilter === 'tugas') {
          if (isQuiz) return false
        } else {
          if (jenis !== assignmentJenisFilter) return false
        }
      }

      // 4. Status filter
      if (assignmentStatusFilter === "active") {
        if (asg.deadline) {
          const dl = new Date(asg.deadline).getTime()
          if (!isNaN(dl) && dl < Date.now()) return false
        }
      } else if (assignmentStatusFilter === "past") {
        if (asg.deadline) {
          const dl = new Date(asg.deadline).getTime()
          if (!isNaN(dl) && dl >= Date.now()) return false
        } else {
          return false
        }
      }

      return true
    })
  }, [assignments, selectedClass, assignmentSearch, assignmentJenisFilter, assignmentStatusFilter])
  const selectedTahfizhSurah = quranSurahs.find((surah) => Number(surah.nomor) === Number(tahfizhForm.surah_number))
  const selectedTahfizhStudent = students.find((student) => student.id === tahfizhForm.student_id) || null
  const selectedStudentTahfizhLogs = tahfizhLogs
    .filter((log) => log.student_id === tahfizhForm.student_id)
    .sort((first, second) => String(second.record_date || '').localeCompare(String(first.record_date || '')))
  const previousTahfizhLog = selectedStudentTahfizhLogs[0] || null

  const getQuranJuz = (surahNumber, ayahNumber) => {
    const juzStarts = [[1, 1], [2, 142], [2, 253], [3, 93], [4, 24], [4, 148], [5, 82], [6, 111], [7, 88], [8, 41], [9, 93], [11, 6], [12, 53], [15, 1], [17, 1], [18, 75], [21, 1], [23, 1], [25, 21], [27, 56], [29, 46], [33, 31], [36, 28], [39, 32], [41, 47], [46, 1], [51, 31], [58, 1], [67, 1], [78, 1]]
    let juz = 1
    juzStarts.forEach(([surah, ayah], index) => {
      if (Number(surahNumber) > surah || (Number(surahNumber) === surah && Number(ayahNumber) >= ayah)) juz = index + 1
    })
    return juz
  }

  const getAutomaticTahfizhTarget = (latestLog) => {
    if (!latestLog || !quranSurahs.length) return null
    const needsRepeat = ['kelancaran', 'tajwid', 'makhraj'].some((key) => String(latestLog.metadata?.[key] || '').toLowerCase() === 'perlu bimbingan')
    if (needsRepeat) return { surahNumber: Number(latestLog.hafalan_surah_number), ayatStart: Number(latestLog.hafalan_ayah_start), ayatEnd: Number(latestLog.hafalan_ayah_end), repeated: true }

    const currentSurah = quranSurahs.find((surah) => Number(surah.nomor) === Number(latestLog.hafalan_surah_number))
    const previousRangeSize = Math.max(Number(latestLog.hafalan_ayah_end) - Number(latestLog.hafalan_ayah_start) + 1, 1)
    const nextAyah = Number(latestLog.hafalan_ayah_end) + 1
    if (currentSurah && nextAyah <= Number(currentSurah.jumlah_ayat)) return { surahNumber: Number(currentSurah.nomor), ayatStart: nextAyah, ayatEnd: Math.min(nextAyah + previousRangeSize - 1, Number(currentSurah.jumlah_ayat)), repeated: false }

    const nextSurah = quranSurahs.find((surah) => Number(surah.nomor) === Number(latestLog.hafalan_surah_number) + 1)
    return nextSurah ? { surahNumber: Number(nextSurah.nomor), ayatStart: 1, ayatEnd: Math.min(previousRangeSize, Number(nextSurah.jumlah_ayat)), repeated: false } : { surahNumber: Number(latestLog.hafalan_surah_number), ayatStart: Number(latestLog.hafalan_ayah_start), ayatEnd: Number(latestLog.hafalan_ayah_end), repeated: true }
  }
  const automaticTahfizhTarget = getAutomaticTahfizhTarget(previousTahfizhLog)
  const sortedTahfizhLeaderboard = React.useMemo(() => {
    // Merge students from API students state and from tahfizhLogs database records
    const studentMap = new Map()

    students.forEach((s) => {
      if (s?.id) {
        studentMap.set(s.id, {
          ...s,
          nama_lengkap: s.nama_lengkap || s.full_name || s.name || 'Siswa',
          nis: s.nis || s.nisn || '',
          unit_name: s.education_unit?.name || s.unit?.name || s.kelas?.unit_pendidikan?.name || s.unit_name || 'Unit Sekolah',
          class_name: s.kelas?.nama_kelas || s.class_name || selectedClassName || 'Kelas -',
        })
      }
    })

    tahfizhLogs.forEach((log) => {
      if (log.student?.id && !studentMap.has(log.student.id)) {
        const s = log.student
        studentMap.set(s.id, {
          ...s,
          id: s.id,
          nama_lengkap: s.nama_lengkap || s.full_name || s.name || 'Siswa',
          nis: s.nis || s.nisn || '',
          unit_name: s.education_unit?.name || s.unit?.name || log.class_model?.unit_pendidikan?.name || s.unit_name || 'Unit Sekolah',
          class_name: log.class_model?.nama_kelas || s.kelas?.nama_kelas || s.class_name || 'Kelas -',
        })
      }
    })

    const allStudentsList = Array.from(studentMap.values())

    let list = allStudentsList.map((student) => {
      const studentLogs = tahfizhLogs
        .filter((log) => log.student_id === student.id || log.student?.id === student.id)
        .sort((first, second) => String(second.record_date || '').localeCompare(String(first.record_date || '')))
      const latest = studentLogs[0] || null
      const totalAyat = studentLogs.reduce((total, log) => total + Math.max(Number(log.hafalan_ayah_end || 0) - Number(log.hafalan_ayah_start || 0) + 1, 0), 0)
      const completedSurahs = new Set(studentLogs.map((log) => log.hafalan_surah_number).filter(Boolean)).size
      const unitName = student.unit_name || student.education_unit?.name || student.unit?.name || student.kelas?.unit_pendidikan?.name || 'Unit Sekolah'
      const className = student.class_name || student.kelas?.nama_kelas || selectedClassName || 'Kelas -'

      return { student, latest, totalAyat, completedSurahs, totalSetoran: studentLogs.length, unitName, className }
    })

    // Filter by selectedClass if specific rombel chosen (strict: only students matching the selected rombel)
    if (selectedClass && selectedClass !== 'all') {
      list = list.filter((item) => {
        const sClassId = item.student?.kelas_id || item.student?.class_id || item.student?.kelas?.id
        return !!sClassId && String(sClassId) === String(selectedClass)
      })
    }

    // Filter out students without setoran when viewing broad foundation/unit leaderboard
    if ((isPengurusYayasan || isKepalaSekolahOrDivisiPendidikan) && list.some((item) => item.totalSetoran > 0)) {
      list = list.filter((item) => item.totalSetoran > 0 || item.totalAyat > 0)
    }

    // Role-Based Scope Filtering
    if (isPengurusYayasan) {
      if (selectedTahfizhUnit && selectedTahfizhUnit !== 'semua') {
        list = list.filter((item) =>
          item.unitName.toLowerCase().includes(selectedTahfizhUnit.toLowerCase()) ||
          item.student.education_unit_id === selectedTahfizhUnit ||
          item.student.unit_id === selectedTahfizhUnit
        )
      }
    } else if (isKepalaSekolahOrDivisiPendidikan) {
      const userUnit = teacherProfile?.education_unit || user?.education_unit?.name || user?.unit_name || ''
      if (selectedTahfizhUnit && selectedTahfizhUnit !== 'semua') {
        list = list.filter((item) =>
          item.unitName.toLowerCase().includes(selectedTahfizhUnit.toLowerCase()) ||
          item.student.education_unit_id === selectedTahfizhUnit ||
          item.student.unit_id === selectedTahfizhUnit
        )
      } else if (userUnit) {
        list = list.filter((item) => item.unitName.toLowerCase().includes(userUnit.toLowerCase()))
      }
    }

    // Search Query Filtering
    if (debouncedTahfizhSearch) {
      const q = debouncedTahfizhSearch.toLowerCase()
      list = list.filter((item) =>
        (item.student.nama_lengkap || '').toLowerCase().includes(q) ||
        (item.student.nis || item.student.nisn || '').toLowerCase().includes(q) ||
        (item.unitName || '').toLowerCase().includes(q) ||
        (item.className || '').toLowerCase().includes(q)
      )
    }

    // Sort descending by highest Tahfizh hafalan ("hafalan tahfizh terbanyak")
    return list.sort((a, b) => {
      if (b.totalAyat !== a.totalAyat) return b.totalAyat - a.totalAyat
      if (b.completedSurahs !== a.completedSurahs) return b.completedSurahs - a.completedSurahs
      return b.totalSetoran - a.totalSetoran
    })
  }, [students, tahfizhLogs, selectedTahfizhUnit, debouncedTahfizhSearch, isPengurusYayasan, isKepalaSekolahOrDivisiPendidikan, teacherProfile, user, selectedClassName])

  const top5TahfizhStudents = React.useMemo(() => {
    return sortedTahfizhLeaderboard.slice(0, 5)
  }, [sortedTahfizhLeaderboard])

  const unitStatsSummary = React.useMemo(() => {
    const map = {}
    sortedTahfizhLeaderboard.forEach((item) => {
      const uName = item.unitName
      if (!map[uName]) {
        map[uName] = { unitName: uName, totalStudents: 0, totalSetoran: 0, totalAyat: 0, topStudent: item }
      }
      map[uName].totalStudents += 1
      map[uName].totalSetoran += item.totalSetoran
      map[uName].totalAyat += item.totalAyat
    })
    return Object.values(map)
  }, [sortedTahfizhLeaderboard])

  const totalTahfizhPages = Math.max(1, Math.ceil(sortedTahfizhLeaderboard.length / TAHFIZH_PER_PAGE))

  const paginatedTahfizhLeaderboard = React.useMemo(() => {
    const start = (tahfizhPage - 1) * TAHFIZH_PER_PAGE
    return sortedTahfizhLeaderboard.slice(start, start + TAHFIZH_PER_PAGE)
  }, [sortedTahfizhLeaderboard, tahfizhPage])

  const tahfizhByStudent = paginatedTahfizhLeaderboard

  const openTahfizhForm = (student = null) => {
    setTahfizhForm({ student_id: student?.id || '', class_id: getCurrentClassId(), type: 'Ziyadah', juz: 30, surah_number: '', ayat_start: 1, ayat_end: 1, kelancaran: 'Sangat Lancar', tajwid: 'Baik', makhraj: 'Baik', notes_teacher: '' })
    setModalType('tahfizh')
    setShowModal(true)
  }

  useEffect(() => {
    if (!tahfizhForm.student_id || !automaticTahfizhTarget) return
    setTahfizhForm((current) => ({
      ...current,
      surah_number: automaticTahfizhTarget.surahNumber,
      ayat_start: automaticTahfizhTarget.ayatStart,
      ayat_end: automaticTahfizhTarget.ayatEnd,
      juz: getQuranJuz(automaticTahfizhTarget.surahNumber, automaticTahfizhTarget.ayatStart),
    }))
  }, [tahfizhForm.student_id, previousTahfizhLog?.id, quranSurahs.length])

  const openTahfizhDetail = (student) => {
    setTahfizhDetailStudent(student)
    setTahfizhWeekOffset(0)
    setShowTahfizhDetail(true)
  }

  const tahfizhWeekStart = (() => {
    const date = new Date()
    const day = date.getDay() || 7
    date.setHours(12, 0, 0, 0)
    date.setDate(date.getDate() - day + 1 + (tahfizhWeekOffset * 7))
    return date
  })()
  const tahfizhWeekRows = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(tahfizhWeekStart)
    date.setDate(date.getDate() + index)
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const log = tahfizhLogs.find((item) => item.student_id === tahfizhDetailStudent?.id && item.record_date === dateKey)
    return { date, dateKey, log }
  })

  const getScheduleStatus = (schedule) => {
    const today = new Date()
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const todayDayName = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(today)
    const scheduleDay = getScheduleDay(schedule)
    const isToday = scheduleDay.toLowerCase() === todayDayName.toLowerCase()

    if (selectedDate < todayKey) {
      return { label: 'Selesai', isActive: false, className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' }
    }
    if (selectedDate > todayKey) {
      return { label: 'Akan Datang', isActive: false, className: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' }
    }

    // Jika jadwal bukan hari ini (misal melihat filter semua hari atau hari lain)
    if (!isToday) {
      return { label: `Hari ${scheduleDay}`, isActive: false, className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' }
    }

    const currentMinutes = today.getHours() * 60 + today.getMinutes()
    const toMinutes = (value = '00:00') => {
      const [hours, minutes] = String(value || '00:00').slice(0, 5).split(':').map(Number)
      return (hours || 0) * 60 + (minutes || 0)
    }
    const startTimeStr = schedule.start_time || schedule.time_start || schedule.jam_mulai || '00:00'
    const endTimeStr = schedule.end_time || schedule.time_end || schedule.jam_selesai || '00:00'
    const startMinutes = toMinutes(startTimeStr)
    const endMinutes = toMinutes(endTimeStr)

    if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
      return {
        label: 'Berlangsung',
        isActive: true,
        className: 'bg-emerald-100 text-emerald-800 font-extrabold ring-1 ring-emerald-500/60 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-400'
      }
    }
    if (currentMinutes > endMinutes) {
      return { label: 'Selesai', isActive: false, className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' }
    }
    return { label: 'Berikutnya', isActive: false, className: 'bg-amber-100 text-amber-700 font-bold dark:bg-amber-950 dark:text-amber-300' }
  }

  return (
    <PageContainer className="teacher-workspace-page space-y-6 pb-12">
      {/* ── BREADCRUMB NAV ────────────────────────────────────────── */}
      <AppBreadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Portal Guru', href: '/portal-guru/workspace' },
          { label: 'Workspace Pembelajaran Guru' },
        ]}
      />

      {/* ── MODERN HERO CARD HEADER ───────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
          <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <GraduationCap className="size-6 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                    <Sparkles className="size-3 text-amber-300 animate-pulse" />
                    Portal Guru Terpadu
                  </span>
                  {classes.length > 0 ? (
                    <div className="inline-flex items-center gap-1.5 rounded-xl bg-white/95 dark:bg-slate-800/95 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-700/80 shadow-xs backdrop-blur-md">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Rombel:</span>
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="bg-transparent font-extrabold text-xs text-emerald-900 dark:text-emerald-200 outline-none cursor-pointer pr-1"
                      >
                        <option value="all" className="dark:bg-slate-900 text-slate-900 dark:text-white">
                          Semua Rombel
                        </option>
                        {classes.map((c) => (
                          <option key={c.id} value={c.id} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                            {c.nama_kelas || c.name}{c.kode_kelas ? ` · ${c.kode_kelas}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    selectedClassName && (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                        Rombel {selectedClassName}
                      </span>
                    )
                  )}
                  {getCurrentSchedule() && (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100/90 dark:bg-emerald-950/80 px-3 py-1 text-xs font-extrabold text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                      <BookOpen className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                      Mapel: {getScheduleSubject(getCurrentSchedule() || {})}
                    </span>
                  )}
                </div>
                <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Workspace Pembelajaran Guru
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
                  Pusat kendali aktivitas mengajar Ustadz/Ustadzah — Kelola jadwal, presensi, materi, tugas, nilai, &amp; jurnal tahfizh terpadu.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <span className="hidden md:inline-flex items-center gap-2 rounded-xl bg-white/80 dark:bg-slate-800/80 px-4 py-2.5 text-xs font-extrabold text-slate-700 dark:text-slate-200 border border-emerald-500/20 shadow-xs backdrop-blur-md">
                <User className="size-4 text-emerald-600 dark:text-emerald-400" />
                {teacherProfile?.name || user?.name || 'Ustadz / Ustadzah'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── BANNER JAM PELAJARAN SEDANG AKTIF (DI BAWAH CARD HERO WORKSPACE) ── */}
      <ActiveScheduleNotice />

      {/* ── TOAST NOTIFICATION LAYER ────────────────────────────────────── */}
      <div className="fixed bottom-5 right-5 z-[9999] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2.5 pointer-events-none" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-[18px] shadow-[var(--shadow-soft-xl)] border backdrop-blur-md transition-all animate-in slide-in-from-bottom duration-300 ${
              toast.type === 'success'
                ? 'bg-emerald-900/90 text-emerald-100 border-emerald-700/80'
                : toast.type === 'error'
                ? 'bg-rose-900/90 text-rose-100 border-rose-700/80'
                : toast.type === 'warning'
                ? 'bg-amber-900/90 text-amber-100 border-amber-700/80'
                : 'bg-slate-900/90 text-slate-100 border-slate-700/80'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm leading-tight">{toast.title}</h4>
              <p className="text-xs mt-0.5 opacity-90 leading-relaxed">{toast.message}</p>
            </div>
            <button onClick={() => removeToast(toast.id)} aria-label="Tutup notifikasi" className="rounded-lg p-1 transition hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/70">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>



      <MasterStatsGrid className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MasterStatCard icon={CalendarDays} label="Jadwal Mengajar" value={schedules.length} description={`${new Set(schedules.map(getScheduleSubject)).size} mata pelajaran`} variant="success" delay={40} />
        <MasterStatCard icon={Users} label="Siswa Terdaftar" value={students.length} description={`Rombel ${selectedClassName}`} variant="info" delay={80} />
        <MasterStatCard icon={BookOpen} label="Materi Terbit" value={publishedMaterials} description={`${materials.length} total materi`} variant="warning" delay={120} />
        <MasterStatCard icon={FileText} label="Penugasan Aktif" value={activeAssignments} description={`${assignments.length} total penugasan`} variant="primary" delay={160} />
        <MasterStatCard icon={GraduationCap} label="Catatan & Tahfizh" value={tahfizhLogs.length + studentNotes.length} description="Total pendampingan" variant="danger" delay={200} />
      </MasterStatsGrid>



      {/* ── CARD AKSI CEPAT & NAVIGASI MODUL ────────────────────────────────────────── */}
      <section className="rounded-[20px] border border-slate-200/80 bg-white p-5 shadow-[var(--shadow-soft-xl)] dark:border-slate-800 dark:bg-[#1B2433]" aria-label="Aksi Cepat Workspace Guru">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Aksi Cepat & Navigasi Modul</h3>
              <p className="text-xs text-slate-500">Klik modul di bawah untuk berpindah antar fitur pengajaran guru secara langsung.</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            {cardModulesList.length} Modul Aksi
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3" role="tablist" aria-label="Modul pengajaran">
          {cardModulesList.map((mod) => {
            const Icon = mod.icon
            const isActive = activeTab === mod.id
            return (
              <motion.button
                type="button"
                key={mod.id}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={() => handleCardClick(mod)}
                role="tab"
                aria-selected={isActive}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all text-center group cursor-pointer ${
                  isActive
                    ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/60 shadow-md ring-2 ring-emerald-600/30'
                    : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-md'
                }`}
              >
                <div className={`p-2.5 rounded-xl border ${mod.tone || 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60'} mb-2 shrink-0 group-hover:scale-110 transition ${isActive ? 'ring-2 ring-emerald-500/40' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`font-bold text-[11px] leading-tight transition-colors ${
                  isActive ? 'text-emerald-900 dark:text-emerald-200 font-black' : 'text-slate-700 dark:text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400'
                }`}>
                  {mod.title}
                </span>
                {mod.badge && (
                  <span className={`mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-extrabold ${mod.badgeColor || 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'}`}>
                    {mod.badge}
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      </section>

      {/* ── MAIN WORKSPACE CONTENT PIPELINE ──────────────────────────────────────── */}
      <div className="w-full">
        {/* Konten utama workspace */}
        <main className="space-y-6 w-full">
          {/* TAB 1: JADWAL MENGAJAR */}
          {activeTab === 'jadwal' && (
            <div className="space-y-5">
              <div className="overflow-hidden rounded-[22px] border border-emerald-200/70 bg-gradient-to-br from-emerald-700 via-emerald-700 to-teal-800 p-5 text-white shadow-[var(--shadow-soft-xl)] sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl border border-white/20 bg-white/15 p-3 backdrop-blur-sm"><CalendarDays className="h-6 w-6" /></div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">Agenda Mengajar</p>
                      <h2 className="mt-1 text-xl font-extrabold sm:text-2xl">{selectedDateDay}, {selectedDate}</h2>
                      <p className="mt-1 text-sm text-emerald-100">{selectedClassName} • {teacherName}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:min-w-[330px]">
                    {[
                      { value: selectedDaySchedules.length, label: `Sesi ${selectedDateDay}` },
                      { value: sortedSchedules.length, label: 'Total Sesi Mingguan' },
                      { value: new Set(sortedSchedules.map(getScheduleSubject)).size, label: 'Mata Pelajaran' },
                    ].map((summary) => (
                      <div key={summary.label} className="rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-center backdrop-blur-sm">
                        <strong className="block text-xl">{summary.value}</strong>
                        <span className="text-[10px] font-semibold text-emerald-100">{summary.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-12 xl:items-start">
                <section className="rounded-[20px] border border-slate-200/80 bg-white p-4 shadow-[var(--shadow-soft-xl)] dark:border-slate-700/80 dark:bg-[#1B2433] sm:p-5 xl:col-span-7">
                  <div className="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-900 dark:text-white">
                          <Clock className="h-4 w-4 text-emerald-600" />
                          Timeline {timelineFilter === 'semua' ? 'Semua Hari' : (timelineFilter === 'auto' ? (selectedDaySchedules.length > 0 ? selectedDateDay : (sortedSchedules.length > 0 ? 'Seluruh Jadwal' : selectedDateDay)) : timelineFilter)}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {selectedDaySchedules.length === 0 && sortedSchedules.length > 0 && (timelineFilter === 'auto' || timelineFilter === 'semua')
                            ? `Menampilkan seluruh jadwal mengajar aktif untuk ${selectedClassName}.`
                            : 'Urutan sesi mengajar berdasarkan jam mulai.'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => {
                            printCleanTable({
                              title: `Jadwal Mengajar Guru - ${teacherName || 'Guru'}`,
                              subtitle: `Unit / Kelas: ${selectedClassName} | Tahun Ajaran 2026/2027`,
                              headers: ['No', 'Hari', 'Jam Sesi', 'Mata Pelajaran', 'Kelas', 'Ruangan'],
                              rows: sortedSchedules.map((s, idx) => [
                                idx + 1,
                                getScheduleDay(s) || '-',
                                `${s.jam_mulai || s.time_start || '-'} - ${s.jam_selesai || s.time_end || '-'}`,
                                getScheduleSubject(s) || '-',
                                s.kelas?.nama_kelas || selectedClassName || '-',
                                s.ruangan || s.room || 'Ruang Kelas',
                              ]),
                            })
                          }}
                          className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                          title="Cetak matriks jadwal mengajar mingguan"
                        >
                          <Printer className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          Cetak Jadwal
                        </Button>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          {timelineSchedules.length} sesi ditampilkan
                        </span>
                      </div>
                    </div>

                    {/* Quick Timeline Day Filter Pills */}
                    {sortedSchedules.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setTimelineFilter('hari_ini')}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                            timelineFilter === 'hari_ini'
                              ? 'bg-[#0E5C44] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          Hari Ini ({selectedDateDay}: {selectedDaySchedules.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setTimelineFilter('semua')}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                            timelineFilter === 'semua' || (timelineFilter === 'auto' && selectedDaySchedules.length === 0)
                              ? 'bg-[#0E5C44] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          Semua Hari ({sortedSchedules.length})
                        </button>
                        {scheduleDays.map((d) => {
                          const count = sortedSchedules.filter((s) => getScheduleDay(s).toLowerCase() === d.name.toLowerCase()).length
                          if (count === 0) return null
                          return (
                            <button
                              key={d.name}
                              type="button"
                              onClick={() => {
                                setTimelineFilter(d.name)
                                setWeeklySelectedDay(d.short)
                              }}
                              className={`rounded-lg px-2 py-1 text-[11px] font-bold transition ${
                                timelineFilter === d.name
                                  ? 'bg-[#0E5C44] text-white shadow-xs'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                              }`}
                            >
                              {d.name} ({count})
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Banner if no schedule TODAY for selected class */}
                  {selectedDaySchedules.length === 0 && sortedSchedules.length > 0 && timelineFilter === 'hari_ini' && (
                    <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div className="text-xs space-y-1.5 flex-1">
                          <p className="font-extrabold text-slate-900 dark:text-white">
                            Tidak ada jam mengajar pada hari {selectedDateDay} untuk {selectedClassName}.
                          </p>
                          <p className="text-slate-600 dark:text-slate-400">
                            Jadwal mengajar kelas ini tersedia pada hari: <strong className="text-emerald-700 dark:text-emerald-300">{activeScheduleDays.join(', ')}</strong> (Total {sortedSchedules.length} sesi mingguan).
                          </p>
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => setTimelineFilter('semua')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition"
                            >
                              Tampilkan Semua Sesi ({sortedSchedules.length})
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {loading ? (
                    <div className="space-y-3" aria-label="Memuat jadwal">
                      {[1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />)}
                    </div>
                  ) : timelineSchedules.length === 0 ? (
                    <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center dark:border-slate-700 dark:bg-slate-900/40">
                      <Calendar className="mb-3 h-9 w-9 text-slate-300" />
                      <h4 className="font-bold text-slate-800 dark:text-white">Belum ada jadwal mengajar</h4>
                      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                        Jadwal untuk {selectedClassName} belum tersedia pada sistem. Silakan hubungi waka kurikulum atau pilih rombel lain.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {timelineSchedules.map((schedule, index) => {
                        const status = getScheduleStatus(schedule)
                        const scheduleDay = getScheduleDay(schedule)
                        return (
                          <article
                            key={schedule.id || index}
                            className={`group relative overflow-hidden rounded-2xl border transition hover:-translate-y-0.5 hover:shadow-md ${
                              status.isActive
                                ? 'border-2 border-emerald-500/80 bg-emerald-50/50 shadow-md shadow-emerald-500/10 dark:border-emerald-500/70 dark:bg-emerald-950/25'
                                : 'border-slate-200 bg-slate-50/70 hover:border-emerald-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-emerald-700 dark:hover:bg-slate-900'
                            } p-4`}
                          >
                            <div className={`absolute inset-y-0 left-0 ${status.isActive ? 'w-1.5 bg-emerald-500' : 'w-1 bg-emerald-600'}`} />
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                              <div className="flex min-w-[115px] items-center gap-2 text-emerald-700 dark:text-emerald-300 sm:block">
                                <span className="inline-block rounded-md bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-black text-emerald-800 dark:text-emerald-300 mb-1">
                                  {scheduleDay}
                                </span>
                                <strong className="text-base font-extrabold sm:block">{(schedule.start_time || schedule.time_start || '00:00').slice(0, 5)}</strong>
                                <span className="text-xs font-semibold text-slate-400 sm:block">s.d. {(schedule.end_time || schedule.time_end || '00:00').slice(0, 5)} WIB</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="truncate font-extrabold text-slate-900 dark:text-white">{getScheduleSubject(schedule)}</h4>
                                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${status.className}`}>{status.label}</span>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                  <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{getScheduleClass(schedule)}</span>
                                  <span className="flex items-center gap-1.5"><Layers className="h-3.5 w-3.5" />{getScheduleRoom(schedule)}</span>
                                </div>
                              </div>
                              <div className="flex shrink-0 gap-2 sm:flex-col">
                                <button onClick={() => openPresensiModal(schedule)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#0E5C44] px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-800 sm:flex-none"><UserCheck className="h-3.5 w-3.5" /> Presensi</button>
                                <button onClick={() => {
                                  setDetailData({ title: `Jadwal: ${getScheduleSubject(schedule)}`, category: 'Jadwal Mengajar', items: [
                                    { label: 'Hari', value: getScheduleDay(schedule) },
                                    { label: 'Rombel', value: getScheduleClass(schedule) },
                                    { label: 'Jam', value: `${(schedule.start_time || schedule.time_start || '00:00').slice(0, 5)} - ${(schedule.end_time || schedule.time_end || '00:00').slice(0, 5)} WIB` },
                                    { label: 'Ruangan', value: getScheduleRoom(schedule) },
                                  ] })
                                  setShowDetailModal(true)
                                }} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-emerald-950/40 sm:flex-none"><Eye className="h-3.5 w-3.5" /> Detail</button>
                              </div>
                            </div>
                          </article>
                        )
                      })}
                    </div>
                  )}
                </section>

                <section className="rounded-[20px] border border-slate-200/80 bg-white p-4 shadow-[var(--shadow-soft-xl)] dark:border-slate-700/80 dark:bg-[#1B2433] sm:p-5 xl:col-span-5">
                  <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
                    <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-900 dark:text-white"><CalendarRange className="h-4 w-4 text-emerald-600" /> Jadwal Mingguan</h3>
                    <p className="mt-1 text-xs text-slate-500">Pilih hari untuk melihat agenda secara cepat.</p>
                  </div>
                  <div className="mt-4 grid grid-cols-5 gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-slate-900" role="tablist" aria-label="Hari jadwal mingguan">
                    {scheduleDays.map((day) => {
                      const dayCount = sortedSchedules.filter((s) => getScheduleDay(s).toLowerCase() === day.name.toLowerCase()).length
                      return (
                        <button
                          key={day.short}
                          onClick={() => {
                            setWeeklySelectedDay(day.short)
                            setTimelineFilter(day.name)
                          }}
                          role="tab"
                          aria-selected={weeklySelectedDay === day.short}
                          className={`rounded-xl px-2 py-1.5 text-[11px] font-bold transition flex flex-col items-center justify-center ${
                            weeklySelectedDay === day.short
                              ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-800 dark:text-emerald-300'
                              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          <span>{day.short}</span>
                          <span className={`mt-0.5 text-[9px] font-extrabold px-1 rounded-full ${
                            dayCount > 0
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'text-slate-400 dark:text-slate-600'
                          }`}>
                            {dayCount}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hari Terpilih</p>
                      <h4 className="font-extrabold text-slate-900 dark:text-white">{visibleWeeklyDay}</h4>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {weeklySchedules.length} sesi
                    </span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {weeklySchedules.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center dark:border-slate-700">
                        <CheckCircle2 className="mx-auto mb-2 h-7 w-7 text-emerald-400" />
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Tidak ada sesi di hari {visibleWeeklyDay}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {activeScheduleDays.length > 0
                            ? `Jadwal rombel ini tersedia di hari: ${activeScheduleDays.join(', ')}`
                            : 'Agenda mengajar kosong pada hari ini.'}
                        </p>
                        {activeScheduleDays.length > 0 && (
                          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                            {activeScheduleDays.map((dName) => {
                              const dObj = scheduleDays.find((d) => d.name.toLowerCase() === dName.toLowerCase())
                              return (
                                <button
                                  key={dName}
                                  type="button"
                                  onClick={() => {
                                    if (dObj) setWeeklySelectedDay(dObj.short)
                                    setTimelineFilter(dName)
                                  }}
                                  className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#0E5C44] dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-[10px] border border-emerald-200 dark:border-emerald-800 transition"
                                >
                                  Pindah ke {dName}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    ) : weeklySchedules.map((schedule, index) => (
                      <button key={schedule.id || index} onClick={() => {
                        setDetailData({ title: `Jadwal: ${getScheduleSubject(schedule)}`, category: visibleWeeklyDay, items: [
                          { label: 'Waktu', value: `${(schedule.start_time || schedule.time_start || '00:00').slice(0, 5)} - ${(schedule.end_time || schedule.time_end || '00:00').slice(0, 5)} WIB` },
                          { label: 'Rombel', value: getScheduleClass(schedule) },
                          { label: 'Ruangan', value: getScheduleRoom(schedule) },
                        ] })
                        setShowDetailModal(true)
                      }} className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 p-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50/60 dark:border-slate-800 dark:hover:bg-emerald-950/20">
                        <div className="rounded-xl bg-emerald-100 px-2.5 py-2 text-center text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><Clock className="mx-auto h-3.5 w-3.5" /><span className="mt-0.5 block text-[10px] font-extrabold">{(schedule.start_time || schedule.time_start || '00:00').slice(0, 5)}</span></div>
                        <div className="min-w-0 flex-1"><strong className="block truncate text-sm text-slate-900 dark:text-white">{getScheduleSubject(schedule)}</strong><span className="mt-0.5 block truncate text-xs text-slate-500">{getScheduleClass(schedule)} • {getScheduleRoom(schedule)}</span></div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* TAB 2: PRESENSI SISWA */}
          {activeTab === 'presensi' && (
            <div className="space-y-5 rounded-[20px] border border-slate-200/80 bg-white p-5 shadow-[var(--shadow-soft-xl)] dark:border-slate-700/80 dark:bg-[#1B2433]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Presensi Pembelajaran Siswa</h3>
                  <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>Rombel {selectedClassName}</span>
                    <span>•</span>
                    <span>{getScheduleSubject(getCurrentSchedule() || {})}</span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                      Jam Pelajaran: {getScheduleLessonHours(getCurrentSchedule())}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      {formattedLiveTime}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300/80 bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-xs dark:border-emerald-700 dark:bg-slate-800 dark:text-emerald-200">
                    <Filter className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-[11px] text-slate-400 font-medium">Rombel:</span>
                    <select
                      value={selectedClass}
                      onChange={(e) => handleModalClassChange(e.target.value)}
                      className="bg-transparent text-xs font-extrabold text-emerald-900 dark:text-emerald-100 outline-none cursor-pointer"
                    >
                      <option value="all" className="dark:bg-slate-900 text-slate-900 dark:text-white">
                        Semua Rombel
                      </option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                          {c.nama_kelas || c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {students.filter((student) => (attendanceData[student.id]?.status || 'Belum Dicatat') === 'Hadir').length} / {students.length} hadir
                  </span>
                  <button
                    type="button"
                    onClick={markAllStudentsPresent}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50/80 px-3 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                  >
                    <CheckSquare className="h-3.5 w-3.5" /> Tandai Semua Hadir
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintAttendanceRoster}
                    disabled={!students || students.length === 0}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    title="Cetak Presensi Pembelajaran"
                  >
                    <Printer className="h-3.5 w-3.5 text-slate-500" /> Cetak
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadAttendancePdf}
                    disabled={!students || students.length === 0}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    title="Unduh PDF Presensi"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-500" /> Unduh PDF
                  </button>
                </div>
              </div>

              <div className="flex overflow-x-auto border-b border-slate-100 text-xs font-bold dark:border-slate-800">
                {[['presensi', 'Data Presensi'], ['verifikasi', 'Verifikasi Guru'], ['riwayat', 'Riwayat Sesi'], ['catatan', 'Catatan Siswa']].map(([id, label]) => (
                  <button key={id} type="button" onClick={() => setAttendanceCenterTab(id)} className={`shrink-0 border-b-2 px-3 pb-2.5 transition ${attendanceCenterTab === id ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>{label}</button>
                ))}
              </div>

              {attendanceCenterTab === 'presensi' && <>
                <section aria-labelledby="attendance-method-title">
                  <h4 id="attendance-method-title" className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Metode Absensi</h4>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {[
                      { id: 'rollcall', label: 'Roll Call Guru', description: 'Checklist manual oleh guru', icon: UserCheck },
                      { id: 'qr', label: 'QR Code Kartu', description: 'Scan QR code kartu siswa', icon: QrCode },
                      { id: 'rfid', label: 'RFID Tap', description: 'Tap kartu RFID siswa', icon: Radio },
                    ].map((method) => {
                      const Icon = method.icon
                      const active = selectedMethod === method.id
                      return <button key={method.id} type="button" onClick={() => { setSelectedMethod(method.id); setScanInput(''); setLastScannedResult(null); if (method.id !== 'rollcall') setTimeout(() => scanInputRef.current?.focus(), 50) }} className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${active ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500 dark:bg-emerald-950/30' : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800'}`}><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700'}`}><Icon className="h-5 w-5" /></span><span><strong className="block text-xs text-slate-900 dark:text-white">{method.label}</strong><span className="text-[10px] text-slate-400">{method.description}</span></span></button>
                    })}
                  </div>

                  {selectedMethod !== 'rollcall' && <div className={`mt-3 space-y-2.5 rounded-xl border p-3.5 ${selectedMethod === 'qr' ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/30' : 'border-sky-200 bg-sky-50/50 dark:border-sky-900/50 dark:bg-sky-950/30'}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">{selectedMethod === 'qr' ? <QrCode className="h-4 w-4 text-emerald-600" /> : <Wifi className="h-4 w-4 animate-pulse text-sky-600" />}<span className="text-xs font-bold text-slate-900 dark:text-white">{selectedMethod === 'qr' ? 'Pemindai QR Code Kartu Siswa' : 'Pembaca RFID Reader Standby'}</span></div>
                      {selectedMethod === 'qr' ? <button type="button" onClick={openQrCamera} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"><Camera className="h-3.5 w-3.5" /> Live Kamera</button> : <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-900 dark:text-sky-300">● Ready to Tap</span>}
                    </div>
                    <form onSubmit={handleCardScan} className="flex gap-2"><input ref={scanInputRef} value={scanInput} onChange={(event) => setScanInput(event.target.value)} autoFocus autoComplete="off" placeholder={selectedMethod === 'qr' ? 'Scan QR code via scanner USB atau ketik NISN...' : 'Tap kartu RFID siswa pada reader...'} className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" /><button type="submit" disabled={!scanInput.trim() || scanProcessing} className="min-w-20 rounded-lg bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50">{scanProcessing ? <RefreshCw className="mx-auto h-3.5 w-3.5 animate-spin" /> : selectedMethod === 'qr' ? 'Absen' : 'Tap RFID'}</button></form>
                    {lastScannedResult && <div className={`rounded-lg px-3 py-2 text-xs font-semibold ${lastScannedResult.error ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>{lastScannedResult.error ? lastScannedResult.message : `${lastScannedResult.student?.nama_lengkap || lastScannedResult.student?.full_name} berhasil dicatat.`}</div>}
                  </div>}
                </section>

                {/* Filter Periode Presensi: Harian, Mingguan, Bulanan, Semester */}
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/40 p-3.5 dark:border-emerald-800/50 dark:bg-emerald-950/20">
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-emerald-500/15 dark:border-emerald-800/40">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                        <Filter className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">Filter Periode Presensi</h5>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Pilih rentang waktu evaluasi kehadiran kelas</p>
                      </div>
                    </div>

                    {/* Periode Tab Buttons */}
                    <div className="inline-flex rounded-xl bg-white p-1 shadow-xs border border-emerald-500/20 dark:bg-slate-800 dark:border-slate-700">
                      {[
                        { id: 'harian', label: 'Harian', icon: CalendarDays },
                        { id: 'mingguan', label: 'Mingguan', icon: CalendarRange },
                        { id: 'bulanan', label: 'Bulanan', icon: Calendar },
                        { id: 'semester', label: 'Semester', icon: Clock },
                      ].map((item) => {
                        const Icon = item.icon
                        const isActive = attendancePeriodFilter === item.id
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setAttendancePeriodFilter(item.id)}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                              isActive
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {item.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Sub-Filter Kontrol Sesuai Periode yang Dipilih */}
                  <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs">
                    {attendancePeriodFilter === 'harian' && (
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Pilih Tanggal:</label>
                        <input
                          type="date"
                          value={attendanceDateFilter}
                          onChange={(e) => setAttendanceDateFilter(e.target.value)}
                          className="h-8 rounded-lg border border-emerald-500/30 bg-white px-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setAttendanceDateFilter(new Date().toLocaleDateString('en-CA'))}
                          className="rounded-lg border border-emerald-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-700 shadow-xs hover:bg-emerald-50 dark:border-emerald-800 dark:bg-slate-800 dark:text-emerald-300"
                        >
                          Hari Ini
                        </button>
                        <span className="rounded-md bg-emerald-100/70 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          Presensi Sesi Aktif Tanggal: {attendanceDateFilter}
                        </span>
                      </div>
                    )}

                    {attendancePeriodFilter === 'mingguan' && (
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Pilih Pekan Efektif:</label>
                        <select
                          value={attendanceWeekFilter}
                          onChange={(e) => setAttendanceWeekFilter(e.target.value)}
                          className="h-8 rounded-lg border border-emerald-500/30 bg-white px-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          <option value="pekan_ini">Pekan Berjalan (Saat Ini)</option>
                          {Array.from({ length: 16 }, (_, i) => (
                            <option key={i + 1} value={`pekan_${i + 1}`}>
                              Pekan ke-{i + 1} (KBM Pekan {i + 1})
                            </option>
                          ))}
                        </select>
                        <span className="rounded-md bg-emerald-100/70 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          Rekap Kehadiran Mingguan Rombel {selectedClassName}
                        </span>
                      </div>
                    )}

                    {attendancePeriodFilter === 'bulanan' && (
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Pilih Bulan TA 2026/2027:</label>
                        <select
                          value={attendanceMonthFilter}
                          onChange={(e) => setAttendanceMonthFilter(e.target.value)}
                          className="h-8 rounded-lg border border-emerald-500/30 bg-white px-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          <option value="07">Juli 2026 (Awal Tahun Ajaran 2026/2027)</option>
                          <option value="08">Agustus 2026</option>
                          <option value="09">September 2026 (Bulan Berjalan)</option>
                          <option value="10">Oktober 2026</option>
                          <option value="11">November 2026</option>
                          <option value="12">Desember 2026 (Penilaian Akhir Semester 1)</option>
                          <option value="01">Januari 2027 (Awal Semester 2)</option>
                          <option value="02">Februari 2027 🌙 (Bulan Ramadhan 1448 H)</option>
                          <option value="03">Maret 2027 🕌 (Hari Raya Idul Fitri 1448 H)</option>
                          <option value="04">April 2027</option>
                          <option value="05">Mei 2027</option>
                          <option value="06">Juni 2027 (PAT & Rapor Kenaikan Kelas)</option>
                        </select>
                        <span className="rounded-md bg-emerald-100/70 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          Presensi Bulanan Lengkap
                        </span>
                      </div>
                    )}

                    {attendancePeriodFilter === 'semester' && (
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Pilih Semester:</label>
                        <select
                          value={attendanceSemesterFilter}
                          onChange={(e) => setAttendanceSemesterFilter(e.target.value)}
                          className="h-8 rounded-lg border border-emerald-500/30 bg-white px-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          <option value="1">Semester 1 (Ganjil) - Juli s/d Desember 2026</option>
                          <option value="2">Semester 2 (Genap) - Januari s/d Juni 2027</option>
                        </select>
                        <span className="rounded-md bg-emerald-100/70 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          Agregasi Kehadiran Kumulatif Semester
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* TailGrids Emerald Datatable Container */}
                <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
                  {/* Toolbar Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-sm">
                        <UserCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          Data Presensi Siswa Rombel {selectedClassName}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Total {filteredAttendanceStudents.length} siswa • Menampilkan maksimal {attendancePerPage} data per halaman
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setImportTarget('presensi')
                          setImportFile(null)
                          setImportError('')
                          setShowImportModal(true)
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50/80 px-3 py-1.5 text-xs font-bold text-sky-700 transition hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300"
                        title="Import presensi dari file spreadsheet"
                      >
                        <Upload className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                        Import Data
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowExportModal(true)
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50/80 px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                        title="Export presensi ke spreadsheet atau PDF"
                      >
                        <Download className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                        Export Data
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const target = (paginatedAttendanceStudents && paginatedAttendanceStudents.length > 0 ? paginatedAttendanceStudents[0] : null)
                            || (students && students.length > 0 ? students[0] : null)
                          handlePrintWeeklyEvaluation(target)
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-orange-300 bg-orange-50/80 px-3 py-1.5 text-xs font-bold text-orange-700 transition hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300 cursor-pointer shadow-sm active:scale-95"
                        title="Cetak Lembar Evaluasi Mingguan Santri"
                      >
                        <Printer className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                        Cetak Evaluasi Pekanan
                      </button>
                      <button
                        type="button"
                        onClick={markAllStudentsPresent}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50/80 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                        title="Tandai semua siswa hadir"
                      >
                        <CheckSquare className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        Tandai Semua Hadir
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveAttendance}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:from-emerald-700 hover:to-teal-700"
                      >
                        <Save className="h-3.5 w-3.5" />
                        Simpan Presensi
                      </button>
                    </div>
                  </div>

                  {/* Filter Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/15 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 px-4 py-2.5 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/40 sm:px-5">
                    <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
                      {/* Search Bar with Debounce */}
                      <div className="relative flex-1 min-w-[180px] max-w-sm">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                          type="search"
                          value={attendanceSearch}
                          onChange={(e) => setAttendanceSearch(e.target.value)}
                          placeholder="Cari nama siswa atau NIS/NISN..."
                          className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-8.5 pr-3 text-xs outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>

                      {/* Status Filter */}
                      <select
                        value={attendanceStatusFilter}
                        onChange={(e) => setAttendanceStatusFilter(e.target.value)}
                        className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        <option value="">Semua Status Presensi</option>
                        {['Belum Dicatat', 'Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alpha'].map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>

                      {(attendanceSearch || attendanceStatusFilter) && (
                        <button
                          type="button"
                          onClick={() => {
                            setAttendanceSearch('')
                            setAttendanceStatusFilter('')
                          }}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                          title="Reset Filter"
                        >
                          <X className="h-3.5 w-3.5" />
                          Reset
                        </button>
                      )}
                    </div>

                    {/* Data per Halaman Terkunci Maksimal 10 Baris */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Batas Baris:</span>
                      <span className="inline-flex items-center rounded-lg bg-emerald-50 border border-emerald-300 px-2.5 py-1 text-xs font-black text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-700 dark:text-emerald-300">
                        10 data / halaman
                      </span>
                    </div>
                  </div>

                  {/* Datatable Body */}
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-xs">
                      <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-slate-700 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:text-slate-300 select-none">
                        <tr>
                          <th className="px-4 py-3 font-bold w-12 text-center">No.</th>
                          <th
                            onClick={() => {
                              if (attendanceSortField === 'name') {
                                setAttendanceSortOrder(attendanceSortOrder === 'asc' ? 'desc' : 'asc')
                              } else {
                                setAttendanceSortField('name')
                                setAttendanceSortOrder('asc')
                              }
                            }}
                            className="px-4 py-3 font-bold cursor-pointer hover:text-emerald-800 dark:hover:text-emerald-300 transition"
                            title="Klik untuk mengurutkan Nama Siswa"
                          >
                            <div className="flex items-center gap-1.5">
                              <span>Identitas Siswa</span>
                              {attendanceSortField === 'name' ? (
                                attendanceSortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <ArrowDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                              )}
                            </div>
                          </th>
                          <th
                            onClick={() => {
                              if (attendanceSortField === 'status') {
                                setAttendanceSortOrder(attendanceSortOrder === 'asc' ? 'desc' : 'asc')
                              } else {
                                setAttendanceSortField('status')
                                setAttendanceSortOrder('asc')
                              }
                            }}
                            className="px-4 py-3 font-bold cursor-pointer hover:text-emerald-800 dark:hover:text-emerald-300 transition"
                            title="Klik untuk mengurutkan Status Presensi"
                          >
                            <div className="flex items-center gap-1.5">
                              <span>Status Presensi</span>
                              {attendanceSortField === 'status' ? (
                                attendanceSortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <ArrowDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                              )}
                            </div>
                          </th>
                          <th
                            onClick={() => {
                              if (attendanceSortField === 'time') {
                                setAttendanceSortOrder(attendanceSortOrder === 'asc' ? 'desc' : 'asc')
                              } else {
                                setAttendanceSortField('time')
                                setAttendanceSortOrder('asc')
                              }
                            }}
                            className="px-4 py-3 font-bold cursor-pointer hover:text-emerald-800 dark:hover:text-emerald-300 transition"
                            title="Klik untuk mengurutkan Waktu Absen"
                          >
                            <div className="flex items-center gap-1.5">
                              <span>Waktu Absen</span>
                              {attendanceSortField === 'time' ? (
                                attendanceSortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <ArrowDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                              )}
                            </div>
                          </th>
                          <th className="px-4 py-3 font-bold">Metode Presensi</th>
                          <th className="px-4 py-3 font-bold text-center w-36">Aksi & Detail</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {paginatedAttendanceStudents.map((student, idx) => {
                          const record = attendanceData[student.id] || { status: 'Belum Dicatat' }
                          const rowNumber = (attendancePage - 1) * attendancePerPage + idx + 1
                          const status = record.status || 'Belum Dicatat'

                          // Color configuration per status
                          const statusColorMap = {
                            'Belum Dicatat': 'bg-slate-100 border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300',
                            Hadir: 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300',
                            Terlambat: 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-300',
                            Izin: 'bg-sky-50 border-sky-300 text-sky-800 dark:bg-sky-950/60 dark:border-sky-800 dark:text-sky-300',
                            Sakit: 'bg-violet-50 border-violet-300 text-violet-800 dark:bg-violet-950/60 dark:border-violet-800 dark:text-violet-300',
                            Alpha: 'bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300',
                          }

                          return (
                            <tr
                              key={student.id}
                              className="transition hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20"
                            >
                              <td className="px-4 py-3 text-center font-bold text-slate-500">
                                {rowNumber}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <Avatar size="sm" className="ring-1 ring-emerald-500/30">
                                    <AvatarFallback className="bg-emerald-100 text-emerald-800 font-bold text-[11px] dark:bg-emerald-900 dark:text-emerald-200">
                                      {(student.nama_lengkap || student.full_name || 'S').slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-bold text-slate-900 dark:text-white">
                                      {student.nama_lengkap || student.full_name}
                                    </p>
                                    <p className="text-[11px] text-slate-400">
                                      NIS: {student.nis || '-'} • NISN: {student.nisn || '-'}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <select
                                  value={status}
                                  onChange={(e) => markStudentAttendance(student, 'Roll Call Guru', e.target.value)}
                                  className={`h-8 rounded-lg border px-2 text-[11px] font-bold outline-none transition focus:ring-1 focus:ring-emerald-500 ${
                                    statusColorMap[status] || statusColorMap['Belum Dicatat']
                                  }`}
                                >
                                  {['Belum Dicatat', 'Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alpha'].map((st) => (
                                    <option key={st} value={st}>{st}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                <div className="inline-flex items-center gap-1.5">
                                  <Clock className="h-3 w-3 text-slate-400" />
                                  <span>{record.check_in_time || '-'}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                  {record.method || 'Belum dicatat'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => toggleStudentChecklist(student, status !== 'Hadir')}
                                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                                      status === 'Hadir'
                                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:text-emerald-300'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                    }`}
                                    title={status === 'Hadir' ? 'Batalkan (Set Belum Dicatat)' : 'Tandai Hadir Cepat'}
                                  >
                                    <Check className="h-3 w-3" />
                                    {status === 'Hadir' ? 'Hadir' : 'Set Hadir'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenStudentAttendanceDetail(student, attendancePeriodFilter)}
                                    className="inline-flex h-8 items-center justify-center gap-1 rounded-xl border border-sky-200 bg-sky-50 px-2.5 text-[10px] font-bold text-sky-700 transition hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300 cursor-pointer"
                                    title={`Lihat detail data presensi ${student.nama_lengkap || student.full_name}`}
                                  >
                                    <Eye className="h-3 w-3" />
                                    Detail
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handlePrintWeeklyEvaluation(student)}
                                    className="inline-flex h-8 items-center justify-center gap-1 rounded-xl border border-orange-200 bg-orange-50 px-2 text-[10px] font-bold text-orange-700 transition hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950/60 dark:text-orange-300 cursor-pointer"
                                    title={`Cetak Lembar Evaluasi Mingguan ${student.nama_lengkap || student.full_name}`}
                                  >
                                    <Printer className="h-3 w-3" />
                                    Evaluasi
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>

                    {filteredAttendanceStudents.length === 0 && (
                      <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                        Tidak ada siswa yang sesuai dengan pencarian atau filter yang dipilih.
                      </div>
                    )}
                  </div>

                  {/* Pagination Footer */}
                  {filteredAttendanceStudents.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-emerald-500/15 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50 sm:px-5">
                      <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        Menampilkan{' '}
                        <strong className="text-emerald-700 dark:text-emerald-400">
                          {(attendancePage - 1) * attendancePerPage + 1}
                        </strong>
                        {' '}-{' '}
                        <strong className="text-emerald-700 dark:text-emerald-400">
                          {Math.min(attendancePage * attendancePerPage, filteredAttendanceStudents.length)}
                        </strong>
                        {' '}dari{' '}
                        <strong className="text-slate-900 dark:text-white">
                          {filteredAttendanceStudents.length}
                        </strong>
                        {' '}siswa
                      </div>

                      <div className="flex items-center">
                        <Pagination
                          currentPage={attendancePage}
                          totalPages={totalAttendancePages}
                          onPageChange={setAttendancePage}
                          sideLayout="full"
                          variant="default"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    💡 <em>Tip: Klik tombol "Simpan Presensi" untuk menyinkronkan rekapan ke jurnal mengajar dan laporan absensi wali murid.</em>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveAttendance}
                    className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-5 text-xs font-bold text-white shadow-sm transition hover:from-emerald-700 hover:to-teal-800"
                  >
                    <Save className="h-4 w-4" />
                    Simpan Presensi
                  </button>
                </div>
              </>}

              {attendanceCenterTab === 'verifikasi' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4.5 dark:border-emerald-800/80 dark:bg-emerald-950/40">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Verifikasi Kehadiran oleh Guru Pengajar</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Guru Pengampu: <strong className="text-emerald-700 dark:text-emerald-400">{teacherName}</strong> • Rombel {selectedClassName} • {getScheduleSubject(getCurrentSchedule() || {})}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-5">
                    <div className="rounded-2xl border border-emerald-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Total Siswa</p>
                      <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{students.length}</p>
                      <p className="mt-0.5 text-[10px] text-slate-400">Terdaftar di kelas</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Hadir</p>
                      <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {students.filter((st) => (attendanceData[st.id]?.status || 'Belum Dicatat') === 'Hadir').length}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400">Tercatat di kelas</p>
                    </div>
                    <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Izin / Sakit</p>
                      <p className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">
                        {students.filter((st) => ['Izin', 'Sakit'].includes(attendanceData[st.id]?.status)).length}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400">Dengan keterangan</p>
                    </div>
                    <div className="rounded-2xl border border-rose-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">Alpha</p>
                      <p className="mt-1 text-2xl font-black text-rose-600 dark:text-rose-400">
                        {students.filter((st) => attendanceData[st.id]?.status === 'Alpha').length}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400">Tanpa keterangan</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Belum Dicatat</p>
                      <p className="mt-1 text-2xl font-black text-slate-700 dark:text-slate-300">
                        {students.filter((st) => (attendanceData[st.id]?.status || 'Belum Dicatat') === 'Belum Dicatat').length}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400">Menunggu absensi</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
                    <span>Setelah presensi disimpan, data disinkronkan otomatis ke buku jurnal harian guru & laporan kurikulum.</span>
                    <button
                      type="button"
                      onClick={handleSaveAttendance}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800"
                    >
                      <Save className="h-4 w-4" /> Simpan & Finalisasi
                    </button>
                  </div>
                </div>
              )}

              {attendanceCenterTab === 'riwayat' && renderAttendanceHistorySection(false)}

              {attendanceCenterTab === 'catatan' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">Catatan Siswa pada Sesi Ini (Izin, Sakit, atau Catatan Khusus)</h4>
                    <span className="text-[11px] text-slate-400">Total {students.filter((s) => attendanceData[s.id]?.notes).length} catatan</span>
                  </div>
                  <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/50">
                    {students.map((student) => {
                      const record = attendanceData[student.id] || { status: 'Belum Dicatat', notes: '' }
                      return (
                        <div key={student.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0 sm:w-1/3">
                            <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{student.nama_lengkap}</p>
                            <span className="text-[10px] text-slate-400">Status: <strong>{record.status}</strong></span>
                          </div>
                          <input
                            type="text"
                            value={record.notes || ''}
                            onChange={(e) => {
                              const nextNotes = e.target.value
                              setAttendanceData((prev) => ({
                                ...prev,
                                [student.id]: {
                                  ...(prev[student.id] || { status: 'Belum Dicatat' }),
                                  notes: nextNotes,
                                },
                              }))
                            }}
                            placeholder="Tulis catatan (misal: Sakit flu, Izin keperluan keluarga, dll)..."
                            className="h-9 flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs outline-none focus:border-emerald-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MATERI BELAJAR */}
          {activeTab === 'materi' && (
            <section className="space-y-4" aria-labelledby="material-heading">
              <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
                {/* Toolbar Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-sm">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 id="material-heading" className="text-sm font-extrabold text-slate-900 dark:text-white">
                        Pusat Konten Pembelajaran & Modul
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Kelola materi untuk rombel {selectedClassName} dari draft hingga publikasi • {filteredMaterials.length} materi
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openMaterialForm()}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:from-emerald-700 hover:to-teal-700"
                    >
                      <Plus className="h-3.5 w-3.5" /> Tambah Materi
                    </button>
                  </div>
                </div>

                {/* Filter Bar */}
                <div className="border-b border-emerald-500/15 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 p-4 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/40 sm:p-5">

                {/* Baris 1: Search + Filter Utama */}
                <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-[minmax(0,1fr)_180px_160px_auto] dark:border-slate-800">
                  <label className="relative">
                    <span className="sr-only">Cari materi</span>
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      value={materialSearch}
                      onChange={(event) => setMaterialSearch(event.target.value)}
                      placeholder="Cari judul, ringkasan, mapel..."
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-semibold outline-none focus:border-emerald-700 focus:ring-3 focus:ring-emerald-700/15 dark:border-slate-700 dark:bg-[#111827] dark:text-white"
                    />
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value)
                      setMaterialMapelFilter('all')
                    }}
                    aria-label="Filter rombel materi"
                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold outline-none focus:border-emerald-700 focus:ring-3 focus:ring-emerald-700/15 dark:border-slate-700 dark:bg-[#111827] dark:text-white"
                  >
                    <option value="all">Semua Rombel</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        Rombel {c.nama_kelas || c.name}{c.kode_kelas ? ` · ${c.kode_kelas}` : ''}
                      </option>
                    ))}
                  </select>
                  <select
                    value={materialStatusFilter}
                    onChange={(event) => setMaterialStatusFilter(event.target.value)}
                    aria-label="Filter status materi"
                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold outline-none focus:border-emerald-700 focus:ring-3 focus:ring-emerald-700/15 dark:border-slate-700 dark:bg-[#111827] dark:text-white"
                  >
                    <option value="semua">Semua Status</option>
                    <option value="published">Dipublikasikan</option>
                    <option value="draft">Draft</option>
                  </select>
                  <button
                    type="button"
                    onClick={fetchMaterials}
                    aria-label="Muat ulang materi"
                    title="Muat ulang materi"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 focus-visible:ring-3 focus-visible:ring-emerald-700/20 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    <span className="sr-only">Muat ulang</span>
                  </button>
                </div>

                {/* Baris 2: Filter Mapel + Badge Aktif + Reset */}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 min-w-[180px] max-w-xs">
                    <BookOpen className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
                    <select
                      value={materialMapelFilter}
                      onChange={(e) => setMaterialMapelFilter(e.target.value)}
                      aria-label="Filter mata pelajaran"
                      className="h-9 w-full rounded-xl border border-emerald-200 bg-emerald-50/60 pl-8 pr-3 text-xs font-semibold text-emerald-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-100"
                    >
                      <option value="all">📚 Semua Mata Pelajaran</option>
                      {uniqueMapelOptions.map((subj) => (
                        <option key={subj.id} value={subj.id}>{subj.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Badge filter aktif */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {materialSearch.trim() && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        <Search className="h-3 w-3" /> "{materialSearch.trim()}"
                        <button type="button" onClick={() => setMaterialSearch('')} className="ml-0.5 rounded-full hover:text-rose-500">×</button>
                      </span>
                    )}
                    {materialMapelFilter !== 'all' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                        <BookOpen className="h-3 w-3" />
                        {uniqueMapelOptions.find((s) => s.id === materialMapelFilter)?.name || 'Mapel'}
                        <button type="button" onClick={() => setMaterialMapelFilter('all')} className="ml-0.5 rounded-full hover:text-rose-500">×</button>
                      </span>
                    )}
                    {materialStatusFilter !== 'semua' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-bold text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
                        {materialStatusFilter === 'published' ? '✅ Dipublikasikan' : '📝 Draft'}
                        <button type="button" onClick={() => setMaterialStatusFilter('semua')} className="ml-0.5 rounded-full hover:text-rose-500">×</button>
                      </span>
                    )}
                    {(materialSearch.trim() || materialMapelFilter !== 'all' || materialStatusFilter !== 'semua') && (
                      <button
                        type="button"
                        onClick={() => { setMaterialSearch(''); setMaterialMapelFilter('all'); setMaterialStatusFilter('semua') }}
                        className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-600 transition hover:bg-rose-100 dark:border-rose-800/60 dark:bg-rose-950/30 dark:text-rose-400"
                      >
                        <X className="h-3 w-3" /> Reset Filter
                      </button>
                    )}
                  </div>

                  {/* Info jumlah hasil */}
                  <span className="ml-auto text-[10px] font-semibold text-slate-400">
                    {loading ? '…' : `${filteredMaterials.length} dari ${materialMeta.total || materials.length} materi`}
                  </span>
                </div>
              </div>
            </div>


              {materialError ? (
                <div className="rounded-[18px] border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-900/60 dark:bg-rose-950/20"><AlertTriangle className="mx-auto h-8 w-8 text-rose-500" /><h4 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">Materi gagal dimuat</h4><p className="mt-1 text-xs text-slate-500">{materialError}</p><button type="button" onClick={fetchMaterials} className="mt-4 h-10 rounded-xl bg-emerald-800 px-4 text-xs font-bold text-white">Coba Lagi</button></div>
              ) : loading && materials.length === 0 ? (
                <div className="grid gap-4 md:grid-cols-2">{[1, 2, 3, 4].map((item) => <div key={item} className="h-48 animate-pulse rounded-[18px] border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800" />)}</div>
              ) : filteredMaterials.length === 0 ? (
                <div className="rounded-[18px] border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-[#1B2433]"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"><BookOpen className="h-7 w-7" /></div><h4 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">{materials.length ? 'Materi tidak ditemukan' : 'Belum ada materi belajar'}</h4><p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">{materials.length ? 'Ubah kata kunci atau filter status untuk melihat materi lain.' : 'Mulai susun konten pembelajaran pertama untuk rombel ini.'}</p>{!materials.length && <button type="button" onClick={() => openMaterialForm()} className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-800 px-4 text-xs font-bold text-white"><Plus className="h-4 w-4" /> Buat Materi Pertama</button>}</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {filteredMaterials.map((mat) => {
                    const isPublished = String(mat.status).toLowerCase() === 'published'
                    return <article key={mat.id} className="group flex min-h-52 flex-col overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[var(--shadow-soft-xl)] dark:border-slate-700/80 dark:bg-[#1B2433]">
                      <div className="h-1 bg-gradient-to-r from-emerald-800 via-emerald-500 to-amber-400" />
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-start justify-between gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"><BookOpen className="h-5 w-5" /></div><span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${isPublished ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300'}`}><span className={`h-1.5 w-1.5 rounded-full ${isPublished ? 'bg-emerald-500' : 'bg-sky-500'}`} />{isPublished ? 'Dipublikasikan' : 'Draft'}</span></div>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                            {mat.subject?.name || mat.subject?.nama_mapel || 'Materi Pembelajaran'}
                          </p>
                          <div className="flex items-center gap-1.5">
                            {(mat.tanggal_publish || mat.tanggal || mat.created_at) && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                <Calendar className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(mat.tanggal_publish || mat.tanggal || mat.created_at))}
                              </span>
                            )}
                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                              Pekan {String(mat.urutan || calculatePekanFromDate(mat.tanggal_publish || mat.tanggal || mat.created_at).pekan).padStart(2, '0')}
                            </span>
                          </div>
                        </div>
                        <h4 className="mt-1 line-clamp-2 text-sm font-black text-slate-900 dark:text-white">{mat.judul}</h4>
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">{mat.ringkasan || 'Belum ada ringkasan untuk materi ini.'}</p>

                        {(mat.file || mat.video || mat.link) && (
                          <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            {mat.file && (
                              <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
                                <FileText className="h-3 w-3" /> PDF Modul
                              </span>
                            )}
                            {mat.video && (
                              <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                                <Video className="h-3 w-3" /> Video
                              </span>
                            )}
                            {mat.link && (
                              <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                                <ExternalLink className="h-3 w-3" /> Link
                              </span>
                            )}
                          </div>
                        )}

                        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openMaterialDetail(mat)}
                              title="Lihat Data Materi"
                              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>Lihat Data</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => openMaterialForm(mat)}
                              title="Edit Data Materi"
                              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/50"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              <span>Edit Data</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCreateTaskFromMaterial(mat)}
                              title="Buat Tugas Berdasarkan Materi Ini"
                              className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 transition hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/50"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>+ Buat Tugas</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => printMaterial(mat)}
                              title="Cetak Materi"
                              aria-label="Cetak Materi"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => printMaterial(mat, true)}
                              title="Export PDF"
                              aria-label="Export PDF"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-900/50"
                            >
                              <FileText className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => confirmDeleteModal('materi', mat.id, mat.judul)}
                              title="Hapus Data Materi"
                              aria-label="Hapus Data Materi"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                    </div>
                    </article>
                  })}
                  </div>
                  {materialMeta.last_page > 1 && (
                  <div className="flex flex-col items-center justify-between gap-3 rounded-[18px] border border-slate-200 bg-white px-4 py-3 sm:flex-row dark:border-slate-700 dark:bg-[#1B2433]">
                    <p className="text-xs text-slate-500">Menampilkan {materialMeta.from || 0}–{materialMeta.to || 0} dari {materialMeta.total} materi.</p>
                    <div className="flex items-center gap-2">
                      <button type="button" disabled={materialPage <= 1 || loading} onClick={() => setMaterialPage((page) => Math.max(1, page - 1))} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700">Sebelumnya</button>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Halaman {materialMeta.current_page} / {materialMeta.last_page}</span>
                      <button type="button" disabled={materialPage >= materialMeta.last_page || loading} onClick={() => setMaterialPage((page) => Math.min(materialMeta.last_page, page + 1))} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700">Berikutnya</button>
                    </div>
                  </div>
                  )}
                </>
              )}
            </section>
          )}

          {/* TAB 4: PENUGASAN */}
          {activeTab === 'penugasan' && (
            <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
              {/* Toolbar Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-sm">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Daftar Penugasan & Evaluasi
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {selectedClass === 'all'
                        ? `Menampilkan ${filteredAssignments.length} penugasan dari seluruh rombel`
                        : `Penugasan untuk ${selectedClassName.startsWith('Kelas') ? selectedClassName : ('Kelas ' + selectedClassName)} • Total ${filteredAssignments.length} tugas`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      printCleanTable({
                        title: 'Rekapitulasi Penugasan & Evaluasi Siswa',
                        subtitle: `Kelas: ${selectedClassName} | Total: ${filteredAssignments.length} Tugas`,
                        headers: ['No', 'Judul Tugas', 'Mata Pelajaran', 'Batas Waktu', 'Bobot', 'Pengumpulan'],
                        rows: filteredAssignments.map((t, idx) => [
                          idx + 1,
                          t.judul || t.title || '-',
                          t.subject?.nama_mapel || t.subject?.name || '-',
                          t.deadline || t.due_date || '-',
                          `${t.bobot || 100} Poin`,
                          `${t.submissions_count || t.total_pengumpulan || 0} Siswa`,
                        ]),
                      })
                      addToast('info', 'Dokumen Siap Dicetak', 'Pratinjau cetak daftar penugasan siswa berhasil dibuka.')
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50/80 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 cursor-pointer shadow-xs active:scale-95"
                    title="Cetak daftar penugasan & evaluasi siswa"
                  >
                    <Printer className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Cetak Tugas
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenCreateQuiz}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:from-violet-700 hover:to-indigo-700 cursor-pointer active:scale-95"
                    title="Buat kuis interaktif baru dengan format soal ujian CBT"
                  >
                    <Zap className="h-3.5 w-3.5" /> Buat Kuis CBT
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null)
                      const pool = schedules.length > 0 ? schedules : allTeacherSchedules
                      const activeClassId = getCurrentClassId()
                      const matchSch = pool.find((s) => String(s.class_id || s.kelas_id || s.kelas?.id || s.class?.id) === String(activeClassId))
                      setTugasForm({
                        judul: '',
                        subject_id: matchSch?.subject_id || matchSch?.subject?.id || getCurrentSubjectId(),
                        class_id: activeClassId,
                        materi_id: '',
                        materi_ids: [],
                        instruksi: '',
                        deskripsi: '',
                        tipe_tugas: 'both',
                        jenis_tugas: 'tugas',
                        jenis_soal: 'essay',
                        deadline: '',
                        bobot: 100,
                        durasi_menit: 30,
                        nilai_kkm: 75,
                        file_lampiran: null,
                        file_lampiran_preview: null,
                        existing_file_url: null,
                      })
                      if (materials.length === 0) fetchMaterials()
                      setModalType('tugas')
                      setShowModal(true)
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:from-emerald-700 hover:to-teal-700 cursor-pointer active:scale-95"
                  >
                    <Plus className="h-3.5 w-3.5" /> Buat Tugas Baru
                  </button>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="border-b border-emerald-500/15 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 px-4 py-2.5 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/40 sm:px-5">
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto]">
                  {/* Search */}
                  <label className="relative min-w-[200px]">
                    <span className="sr-only">Cari penugasan</span>
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      value={assignmentSearch}
                      onChange={(e) => setAssignmentSearch(e.target.value)}
                      placeholder="Cari judul tugas, instruksi, mapel..."
                      className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-8.5 pr-3 text-xs outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </label>

                  {/* Filter Rombel Kelas */}
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        Rombel {c.nama_kelas || c.name}{c.kode_kelas ? ` · ${c.kode_kelas}` : ''}
                      </option>
                    ))}
                    <option value="all">Semua Rombel</option>
                  </select>

                  {/* Filter Format & Tipe Soal */}
                  <select
                    value={assignmentJenisFilter}
                    onChange={(e) => setAssignmentJenisFilter(e.target.value)}
                    className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="all">Semua Format & Tipe</option>
                    <option value="quiz">⚡ Kuis Interaktif CBT</option>
                    <option value="tugas">📄 Tugas / PR Biasa</option>
                    <option value="objektif">🔘 Pilihan Ganda (PG)</option>
                    <option value="essay">📝 Essay</option>
                    <option value="campuran">🔀 Campuran</option>
                  </select>

                  {/* Filter Status Deadline */}
                  <select
                    value={assignmentStatusFilter}
                    onChange={(e) => setAssignmentStatusFilter(e.target.value)}
                    className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="all">Semua Deadline</option>
                    <option value="active">🟢 Deadline Aktif</option>
                    <option value="past">🔴 Terlewat Deadline</option>
                  </select>

                  {/* Refresh */}
                  <button
                    type="button"
                    onClick={fetchAssignments}
                    aria-label="Muat ulang penugasan"
                    title="Muat ulang penugasan"
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-emerald-700/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                </div>
              </div>

              {/* Assignment Cards List */}
              <div className="p-4 sm:p-5 space-y-3">
                {filteredAssignments.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <CheckSquare className="w-12 h-12 mx-auto mb-2 opacity-30 text-[#0E5C44]" />
                    <p className="font-semibold text-xs text-slate-600 dark:text-slate-300">Belum ada penugasan untuk filter ini</p>
                    <p className="text-[11px] mt-0.5">Klik "Buat Tugas Baru" untuk menambahkan penugasan siswa.</p>
                  </div>
                ) : (
                  filteredAssignments.map((asg) => {
                    const kelasName = asg.kelas?.nama_kelas || asg.kelas?.name || classes.find((c) => c.id === (asg.class_id || asg.kelas_id))?.nama_kelas || classes.find((c) => c.id === (asg.class_id || asg.kelas_id))?.name
                    const subjectName = asg.subject?.name || asg.subject?.nama_pelajaran
                    return (
                      <div key={asg.id} className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2.5 hover:shadow-md transition">
                        <div className="flex justify-between items-start flex-wrap gap-1.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {kelasName && (
                              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold rounded-full">
                                🏫 {kelasName}
                              </span>
                            )}
                            {subjectName && (
                              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[10px] font-bold rounded-full">
                                📚 {subjectName}
                              </span>
                            )}
                            {asg.jenis_tugas === 'quiz' ? (
                              <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full uppercase bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs flex items-center gap-1">
                                <Zap className="w-2.5 h-2.5" /> Kuis CBT
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                📄 Tugas PR
                              </span>
                            )}
                            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full uppercase">
                              Deadline: {asg.deadline ? (asg.deadline.includes('T') ? asg.deadline.split('T')[0] : asg.deadline) : 'Tanpa Tenggat'}
                            </span>
                            {asg.durasi_menit && asg.jenis_tugas === 'quiz' && (
                              <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 text-[10px] font-bold rounded-full">
                                ⏱️ {asg.durasi_menit} Menit
                              </span>
                            )}
                            {(() => {
                              const jenis = asg.jenis_tugas || asg.jenis_soal || 'essay'
                              const map = {
                                objektif: { label: '🔘 Objektif', cls: 'bg-blue-100 text-blue-800' },
                                essay:    { label: '📝 Essay',    cls: 'bg-violet-100 text-violet-800' },
                                campuran: { label: '🔀 Campuran', cls: 'bg-orange-100 text-orange-800' },
                              }
                              const { label, cls } = map[jenis] ?? map.essay
                              return (
                                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${cls}`}>
                                  {label}
                                </span>
                              )
                            })()}
                            {(() => {
                              const asgMaterials = Array.isArray(asg.materials) && asg.materials.length > 0
                                ? asg.materials
                                : (Array.isArray(asg.materi_ids) && asg.materi_ids.length > 0
                                    ? asg.materi_ids.map((id) => materials.find((m) => String(m.id) === String(id))).filter(Boolean)
                                    : (asg.materi ? [asg.materi] : (asg.materi_id ? [materials.find((m) => String(m.id) === String(asg.materi_id))].filter(Boolean) : [])))

                              if (!asgMaterials || asgMaterials.length === 0) return null

                              return asgMaterials.map((mat, mIdx) => (
                                <button
                                  key={mat.id || mIdx}
                                  type="button"
                                  onClick={() => openMaterialDetail(mat)}
                                  className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-[10px] font-bold rounded-full hover:bg-emerald-200 transition inline-flex items-center gap-1 cursor-pointer"
                                  title={`Klik untuk pratinjau materi: ${mat.judul}`}
                                >
                                  📖 {mat.judul}
                                </button>
                              ))
                            })()}
                          </div>
                          <div className="flex items-center gap-2">
                            {asg.file_lampiran_url && (
                              <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-bold rounded-full flex items-center gap-1">
                                <Paperclip className="w-3 h-3" /> Berkas
                              </span>
                            )}
                            <span className="text-[11px] text-slate-400 font-mono">Bobot: {asg.bobot || 100}</span>
                          </div>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{asg.judul || asg.judul_tugas}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2">{asg.instruksi || 'Petunjuk pengerjaan tugas.'}</p>
                        {(() => {
                          try {
                            const raw = asg.soal_json || asg.deskripsi || ''
                            if (raw && raw.trim().startsWith('[')) {
                              const soals = JSON.parse(raw)
                              if (Array.isArray(soals) && soals.length > 0) {
                                const counts = soals.reduce((acc, s) => { acc[s.tipe] = (acc[s.tipe] || 0) + 1; return acc }, {})
                                const totalPoin = soals.reduce((acc, s) => acc + (parseFloat(s.poin) || 0), 0)
                                return (
                                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">📋 {soals.length} Butir Soal</span>
                                      <span className="text-[10px] font-semibold text-slate-500">Total: {totalPoin.toFixed(1)} poin</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {Object.entries(counts).map(([tipe, n]) => {
                                        const cls = { pg: 'bg-emerald-100 text-emerald-800', esai: 'bg-violet-100 text-violet-800', benar_salah: 'bg-blue-100 text-blue-800', menjodohkan: 'bg-amber-100 text-amber-800' }[tipe] || 'bg-slate-100 text-slate-700'
                                        const lbl = { pg: 'PG', esai: 'Essay', benar_salah: 'B/S', menjodohkan: 'Jodoh' }[tipe] || tipe
                                        return (
                                          <span key={tipe} className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${cls}`}>
                                            {lbl}: {n}
                                          </span>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )
                              }
                            }
                          } catch {}
                          return asg.deskripsi ? (
                            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 line-clamp-2">
                              {asg.deskripsi}
                            </div>
                          ) : null
                        })()}
                        {asg.file_lampiran_url && (
                          <a
                            href={asg.file_lampiran_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline pt-1"
                          >
                            <Download className="w-3.5 h-3.5" /> Buka Lembar Berkas Soal
                          </a>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                          <button
                            type="button"
                            onClick={() => openSubmissionsModal(asg)}
                            className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                            title="Klik untuk periksa jawaban dan nilai siswa"
                          >
                            <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>{asg.pengumpulan_tugas?.length || 0} Siswa Mengumpulkan</span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-300 font-semibold underline ml-1">Periksa & Nilai →</span>
                          </button>
                          <div className="flex items-center gap-2">
                            {(asg.jenis_tugas === 'quiz' || asg.soal_json || (asg.deskripsi && asg.deskripsi.trim().startsWith('['))) && (
                              <button
                                type="button"
                                onClick={() => handleOpenCbtPreview(asg)}
                                className="px-2.5 py-1 text-violet-700 bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/40 dark:text-violet-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors border border-violet-200 dark:border-violet-800 cursor-pointer shadow-xs active:scale-95"
                                title="Pratinjau interaktif pengerjaan kuis siswa (Style CBT)"
                              >
                                <Play className="w-3 h-3 text-violet-600 dark:text-violet-400 fill-violet-600" /> Pratinjau Kuis CBT
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleEditTugas(asg)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => confirmDeleteModal('tugas', asg.id, asg.judul || asg.judul_tugas)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 5: PENILAIAN */}
          {activeTab === 'penilaian' && (
            <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
              {/* Toolbar Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-sm">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Form Input Nilai Rapor & Harian
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Rekapitulasi Nilai Rombel {selectedClassName} • Menampilkan maksimal {penilaianPerPage} siswa per halaman
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setImportTarget('penilaian')
                      setImportFile(null)
                      setImportError('')
                      setShowImportModal(true)
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50/80 px-3 py-1.5 text-xs font-bold text-sky-700 transition hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300"
                    title="Import nilai dari spreadsheet (.csv, .xls, .xlsx)"
                  >
                    <Upload className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" /> Import Nilai
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowExportModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50/80 px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                    title="Export nilai ke format Excel atau CSV"
                  >
                    <Download className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" /> Export Nilai
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      printCleanTable({
                        title: 'Buku Nilai Harian & Rapor Siswa',
                        subtitle: `Rombel: ${selectedClassName} | Semester Ganjil 2026/2027`,
                        headers: ['No', 'NIS', 'Nama Siswa', 'Nilai Tugas (20%)', 'Nilai Kuis (20%)', 'Nilai UTS (30%)', 'Nilai UAS (30%)', 'Nilai Akhir'],
                        rows: students.map((st, idx) => {
                          const row = gradesData[st.id] || {}
                          const tugas = row.nilai_tugas ?? '-'
                          const kuis = row.nilai_kuis ?? '-'
                          const uts = row.nilai_uts ?? '-'
                          const uas = row.nilai_uas ?? '-'
                          const akhir = (row.nilai_tugas != null || row.nilai_kuis != null || row.nilai_uts != null || row.nilai_uas != null)
                            ? Math.round(Number(row.nilai_tugas || 0) * 0.2 + Number(row.nilai_kuis || 0) * 0.2 + Number(row.nilai_uts || 0) * 0.3 + Number(row.nilai_uas || 0) * 0.3)
                            : '-'
                          return [idx + 1, st.nis || st.student_id || '-', st.name || st.full_name || '-', tugas, kuis, uts, uas, akhir]
                        }),
                      })
                      addToast('info', 'Dokumen Siap Dicetak', 'Pratinjau cetak buku nilai siswa berhasil dibuka.')
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50/80 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 cursor-pointer shadow-xs active:scale-95"
                    title="Cetak Buku Nilai Harian & Rapor Fisik"
                  >
                    <Printer className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Cetak Nilai
                  </button>
                  <button
                    type="button"
                    onClick={handleSyncGradesFromAssignments}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-teal-300 bg-teal-50/80 px-3 py-1.5 text-xs font-bold text-teal-700 transition hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-300"
                    title="Tarik rata-rata nilai tugas & kuis yang dikumpulkan siswa di LMS"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" /> Tarik Nilai LMS
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveGradesBulk}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:from-emerald-700 hover:to-teal-700"
                  >
                    <Save className="h-3.5 w-3.5" /> Simpan Nilai
                  </button>
                </div>
              </div>

              {/* Subbar Info & Filter */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/15 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 px-4 py-2.5 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/40 sm:px-5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Batas Baris:</span>
                  <span className="inline-flex items-center rounded-lg bg-emerald-50 border border-emerald-300 px-2.5 py-1 text-xs font-black text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-700 dark:text-emerald-300">
                    {penilaianPerPage} data / halaman
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Total <strong className="text-emerald-700 dark:text-emerald-300">{students.length}</strong> siswa terdaftar
                </div>
              </div>

              {/* Table Container */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-xs">
                  <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-slate-700 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:text-slate-300 select-none">
                    <tr>
                      <th className="px-4 py-3 font-bold w-12 text-center">No.</th>
                      <th
                        onClick={() => {
                          if (gradeSortField === 'name') {
                            setGradeSortOrder(gradeSortOrder === 'asc' ? 'desc' : 'asc')
                          } else {
                            setGradeSortField('name')
                            setGradeSortOrder('asc')
                          }
                        }}
                        className="px-4 py-3 font-bold cursor-pointer hover:text-emerald-800 dark:hover:text-emerald-300 transition"
                        title="Klik untuk mengurutkan Nama Siswa"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Identitas Siswa</span>
                          {gradeSortField === 'name' ? (
                            gradeSortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <ArrowDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => {
                          if (gradeSortField === 'tugas') {
                            setGradeSortOrder(gradeSortOrder === 'asc' ? 'desc' : 'asc')
                          } else {
                            setGradeSortField('tugas')
                            setGradeSortOrder('desc')
                          }
                        }}
                        className="px-3 py-3 font-bold text-center w-28 cursor-pointer hover:text-emerald-800 dark:hover:text-emerald-300 transition"
                        title="Klik untuk mengurutkan Nilai Tugas"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Tugas (20%)</span>
                          {gradeSortField === 'tugas' ? (
                            gradeSortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-40" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => {
                          if (gradeSortField === 'kuis') {
                            setGradeSortOrder(gradeSortOrder === 'asc' ? 'desc' : 'asc')
                          } else {
                            setGradeSortField('kuis')
                            setGradeSortOrder('desc')
                          }
                        }}
                        className="px-3 py-3 font-bold text-center w-28 text-violet-800 dark:text-violet-300 cursor-pointer hover:text-violet-950 transition"
                        title="Klik untuk mengurutkan Nilai Kuis"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Kuis (20%)</span>
                          {gradeSortField === 'kuis' ? (
                            gradeSortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-violet-600" /> : <ArrowDown className="w-3 h-3 text-violet-600" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-40" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => {
                          if (gradeSortField === 'uts') {
                            setGradeSortOrder(gradeSortOrder === 'asc' ? 'desc' : 'asc')
                          } else {
                            setGradeSortField('uts')
                            setGradeSortOrder('desc')
                          }
                        }}
                        className="px-3 py-3 font-bold text-center w-28 cursor-pointer hover:text-emerald-800 dark:hover:text-emerald-300 transition"
                        title="Klik untuk mengurutkan Nilai UTS"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>UTS (30%)</span>
                          {gradeSortField === 'uts' ? (
                            gradeSortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-40" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => {
                          if (gradeSortField === 'uas') {
                            setGradeSortOrder(gradeSortOrder === 'asc' ? 'desc' : 'asc')
                          } else {
                            setGradeSortField('uas')
                            setGradeSortOrder('desc')
                          }
                        }}
                        className="px-3 py-3 font-bold text-center w-28 cursor-pointer hover:text-emerald-800 dark:hover:text-emerald-300 transition"
                        title="Klik untuk mengurutkan Nilai UAS"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>UAS (30%)</span>
                          {gradeSortField === 'uas' ? (
                            gradeSortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-40" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => {
                          if (gradeSortField === 'akhir') {
                            setGradeSortOrder(gradeSortOrder === 'asc' ? 'desc' : 'asc')
                          } else {
                            setGradeSortField('akhir')
                            setGradeSortOrder('desc')
                          }
                        }}
                        className="px-3 py-3 font-bold text-center w-28 cursor-pointer hover:text-emerald-800 dark:hover:text-emerald-300 transition"
                        title="Klik untuk mengurutkan Nilai Akhir"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Nilai Akhir</span>
                          {gradeSortField === 'akhir' ? (
                            gradeSortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-40" />
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {sortedGradeStudents
                      .slice((penilaianPage - 1) * penilaianPerPage, penilaianPage * penilaianPerPage)
                      .map((st, idx) => {
                      const absoluteIndex = (penilaianPage - 1) * penilaianPerPage + idx + 1
                      const grade = gradesData[st.id] || { nilai_tugas: '', nilai_kuis: '', nilai_uts: '', nilai_uas: '', nilai_akhir: '' }
                      return (
                        <tr key={st.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                          <td className="p-3 text-slate-400 font-mono text-[11px]">{absoluteIndex}</td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white">
                            {st.nama_lengkap}
                            <span className="block text-[10px] font-normal text-slate-400">NIS: {st.nis || '-'}</span>
                          </td>
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              value={grade.nilai_tugas ?? ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? '' : Number(e.target.value)
                                const newAkhir = calcAkhir(val, grade.nilai_kuis, grade.nilai_uts, grade.nilai_uas)
                                setGradesData({ ...gradesData, [st.id]: { ...grade, nilai_tugas: val, nilai_akhir: newAkhir } })
                              }}
                              className="w-16 p-1 text-center border rounded-lg dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-bold"
                              placeholder="-"
                            />
                          </td>
                          <td className="p-3 text-center bg-violet-50/30 dark:bg-violet-950/10">
                            <input
                              type="number"
                              value={grade.nilai_kuis ?? ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? '' : Number(e.target.value)
                                const newAkhir = calcAkhir(grade.nilai_tugas, val, grade.nilai_uts, grade.nilai_uas)
                                setGradesData({ ...gradesData, [st.id]: { ...grade, nilai_kuis: val, nilai_akhir: newAkhir } })
                              }}
                              className="w-16 p-1 text-center border rounded-lg bg-violet-50/50 dark:bg-slate-800 border-violet-300 dark:border-violet-700 font-extrabold text-violet-900 dark:text-violet-200"
                              placeholder="-"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              value={grade.nilai_uts ?? ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? '' : Number(e.target.value)
                                const newAkhir = calcAkhir(grade.nilai_tugas, grade.nilai_kuis, val, grade.nilai_uas)
                                setGradesData({ ...gradesData, [st.id]: { ...grade, nilai_uts: val, nilai_akhir: newAkhir } })
                              }}
                              className="w-16 p-1 text-center border rounded-lg dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-bold"
                              placeholder="-"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              value={grade.nilai_uas ?? ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? '' : Number(e.target.value)
                                const newAkhir = calcAkhir(grade.nilai_tugas, grade.nilai_kuis, grade.nilai_uts, val)
                                setGradesData({ ...gradesData, [st.id]: { ...grade, nilai_uas: val, nilai_akhir: newAkhir } })
                              }}
                              className="w-16 p-1 text-center border rounded-lg dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-bold"
                              placeholder="-"
                            />
                          </td>
                          <td className="p-3 text-center font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">
                            {grade.nilai_akhir !== '' && grade.nilai_akhir !== undefined && grade.nilai_akhir !== null ? grade.nilai_akhir : '-'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Kontrol Penilaian (Maksimal 10 Baris) */}
              {students.length > penilaianPerPage && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-[#1B2433]">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Menampilkan{' '}
                    <strong className="text-emerald-700 dark:text-emerald-300">
                      {(penilaianPage - 1) * penilaianPerPage + 1}
                    </strong>{' '}
                    s.d.{' '}
                    <strong className="text-emerald-700 dark:text-emerald-300">
                      {Math.min(penilaianPage * penilaianPerPage, students.length)}
                    </strong>{' '}
                    dari <strong className="text-slate-900 dark:text-white">{students.length}</strong> siswa
                  </div>
                  <Pagination
                    currentPage={penilaianPage}
                    totalPages={Math.max(1, Math.ceil(students.length / penilaianPerPage))}
                    onPageChange={setPenilaianPage}
                    sideLayout="full"
                    variant="compact"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 6: TAHFIZH */}
          {activeTab === 'tahfizh' && (
            <section className="space-y-5" aria-labelledby="tahfizh-heading">
              {/* Header Card & Scope Banner */}
              <div className="rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-[var(--shadow-soft-xl)] dark:border-slate-700/80 dark:bg-[#1B2433]">
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
                        {isPengurusYayasan ? 'Monitoring Konsolidasi Yayasan' : isKepalaSekolahOrDivisiPendidikan ? 'Monitoring Unit Pimpinan' : 'Monitoring Rombel Binaan'}
                      </p>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        isPengurusYayasan
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                          : isKepalaSekolahOrDivisiPendidikan
                          ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}>
                        {isPengurusYayasan ? (
                          <>• Scope: Seluruh Unit (Yayasan)</>
                        ) : isKepalaSekolahOrDivisiPendidikan ? (
                          <>• Scope: Unit Pimpinan ({teacherProfile?.education_unit || user?.education_unit?.name || 'Kepala Sekolah / Divisi'})</>
                        ) : (
                          <>• Scope: Kelas {selectedClassName}</>
                        )}
                      </span>
                    </div>
                    <h3 id="tahfizh-heading" className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                      {isPengurusYayasan
                        ? 'Leaderboard Pencapaian Hafalan Tahfizh Seluruh Unit'
                        : isKepalaSekolahOrDivisiPendidikan
                        ? `Leaderboard Hafalan Tahfizh Terbanyak — ${teacherProfile?.education_unit || user?.education_unit?.name || 'Unit Pimpinan'}`
                        : `Jurnal & Ranking Setoran Tahfizh Al-Qur'an — Kelas ${selectedClassName}`}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {isPengurusYayasan
                        ? 'Menampilkan konsolidasi pencapaian hafalan tahfizh terbanyak dari seluruh unit pendidikan di bawah naungan yayasan.'
                        : isKepalaSekolahOrDivisiPendidikan
                        ? 'Menampilkan peringkat pencapaian hafalan tahfizh terbanyak siswa dari masing-masing unit yang Anda pimpin.'
                        : `Daftar siswa yang diajar pada rombel ${selectedClassName} diurutkan berdasarkan pencapaian hafalan terbanyak.`}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => changeTab('rekapan-tahfizh')}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 text-xs font-bold text-emerald-800 shadow-sm transition hover:bg-emerald-100 hover:border-emerald-400 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900 cursor-pointer"
                      title="Buka Halaman Laporan Rekapan & Cetak Tahfizh"
                    >
                      <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Laporan Rekapan Tahfizh</span>
                    </button>
                    <button
                      type="button" onClick={() => openTahfizhForm()}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 text-xs font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Input Setoran
                    </button>
                  </div>
                </div>

                {/* Filter Toolbar */}
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={tahfizhSearch}
                      onChange={(e) => setTahfizhSearch(e.target.value)}
                      placeholder="Cari nama siswa, NIS, unit, atau kelas..."
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>

                  {(isPengurusYayasan || isKepalaSekolahOrDivisiPendidikan) && (
                    <div className="flex items-center gap-2">
                      <label htmlFor="filter-unit-tahfizh" className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
                        Filter Unit:
                      </label>
                      <select
                        id="filter-unit-tahfizh"
                        value={selectedTahfizhUnit}
                        onChange={(e) => setSelectedTahfizhUnit(e.target.value)}
                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      >
                        <option value="semua">✨ Semua Unit Pendidikan</option>
                        {educationUnits.map((u) => (
                          <option key={u.id || u.nama || u.name} value={u.nama || u.name || u.id}>
                            {u.nama || u.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* TOP 5 CARDS ("5 Terbaik di 5 Card") */}
              {top5TahfizhStudents.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800 shadow-sm dark:bg-amber-950/60 dark:text-amber-300">
                        <Trophy className="h-4 w-4" />
                      </span>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                          5 Terbaik Pencapaian Hafalan Tahfizh Al-Qur'an
                        </h4>
                        <p className="text-[10px] text-slate-500">
                          Kartu profil santri dengan pencapaian hafalan terbanyak (Rank #1 s.d. #5)
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                      🏆 Top 5 Leaderboard
                    </span>
                  </div>

                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    {top5TahfizhStudents.map(({ student, latest, totalAyat, completedSurahs, totalSetoran, unitName, className }, index) => {
                      const getInitials = (name = '') => {
                        return name.split(' ').map((n) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'S'
                      }
                      const avatarUrl = student.foto_url || student.avatar || student.foto || student.user?.avatar_url || null
                      const rankLabel = index === 0 ? '🥇 Rank #1' : index === 1 ? '🥈 Rank #2' : index === 2 ? '🥉 Rank #3' : `🏅 Rank #${index + 1}`
                      const rankBadgeStyle = index === 0 ? 'bg-amber-500 text-white shadow-amber-500/20'
                        : index === 1 ? 'bg-slate-500 text-white shadow-slate-500/20'
                        : index === 2 ? 'bg-orange-500 text-white shadow-orange-500/20'
                        : 'bg-emerald-700 text-white shadow-emerald-700/20'
                      const borderGlow = index === 0 ? 'border-amber-300/90 shadow-amber-100/60 dark:border-amber-500/50'
                        : index === 1 ? 'border-slate-300/90 shadow-slate-100/60 dark:border-slate-600/50'
                        : index === 2 ? 'border-orange-300/90 shadow-orange-100/60 dark:border-orange-500/50'
                        : 'border-slate-200/80 dark:border-slate-700/80'

                      const surahName = latest?.hafalan_surah_name || 'Belum setoran'
                      const ayahRange = latest ? `Ayat ${latest.hafalan_ayah_start}–${latest.hafalan_ayah_end}` : '—'
                      const juzNum = latest ? (latest.metadata?.juz || getQuranJuz(latest.hafalan_surah_number, latest.hafalan_ayah_start)) : '—'

                      return (
                        <article
                          key={student.id || index}
                          className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl dark:bg-[#1B2433] ${borderGlow}`}
                        >
                          {/* Rank Badge & Unit Label */}
                          <div className="flex items-center justify-between gap-1.5">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black shadow-sm ${rankBadgeStyle}`}>
                              {rankLabel}
                            </span>
                            <span className="truncate rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300 max-w-[90px]" title={unitName}>
                              {unitName}
                            </span>
                          </div>

                          {/* Profil & Avatar */}
                          <div className="mt-3 flex items-center gap-3">
                            <Avatar size="lg" className="shrink-0 ring-2 ring-emerald-500/20">
                              {avatarUrl && <AvatarImage src={avatarUrl} alt={student.nama_lengkap} />}
                              <AvatarFallback className="bg-emerald-100 font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs">
                                {getInitials(student.nama_lengkap)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <h5 className="truncate text-xs font-black text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors" title={student.nama_lengkap}>
                                {student.nama_lengkap}
                              </h5>
                              <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                                NIS: {student.nis || student.nisn || '—'}
                              </p>
                              <span className="mt-1 inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                {className}
                              </span>
                            </div>
                          </div>

                          {/* Detail Hafalan Tahfizh (Nama Surah, Ayat, Juz, Total Surah & Total Ayat) */}
                          <div className="mt-3.5 space-y-2 rounded-xl bg-slate-50 p-3 text-[11px] dark:bg-slate-800/60">
                            {/* Nama Surah */}
                            <div className="flex items-center justify-between gap-1 border-b border-slate-200/60 pb-1.5 dark:border-slate-700/60">
                              <span className="text-[10px] font-bold text-slate-400 shrink-0">Nama Surah:</span>
                              <span className="truncate font-extrabold text-slate-900 dark:text-white text-right" title={surahName}>
                                {surahName}
                              </span>
                            </div>

                            {/* Ayat & Juz */}
                            <div className="grid grid-cols-2 gap-1 text-[10px]">
                              <div>
                                <span className="block font-bold text-slate-400">Ayat:</span>
                                <span className="font-extrabold text-emerald-700 dark:text-emerald-400">{ayahRange}</span>
                              </div>
                              <div className="text-right">
                                <span className="block font-bold text-slate-400">Juz:</span>
                                <span className="inline-flex rounded bg-emerald-100 px-1.5 py-0.5 font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                  Juz {juzNum}
                                </span>
                              </div>
                            </div>

                            {/* Total Surah & Total Ayat Footer Summary */}
                            <div className="mt-2 border-t border-slate-200/80 pt-2 grid grid-cols-2 gap-1.5 text-center dark:border-slate-700/80">
                              <div className="rounded-lg bg-white p-1.5 shadow-2xs dark:bg-slate-900/60">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Surah</p>
                                <p className="text-xs font-black text-slate-800 dark:text-slate-100">{completedSurahs} Surah</p>
                              </div>
                              <div className="rounded-lg bg-emerald-100/70 p-1.5 shadow-2xs dark:bg-emerald-950/60">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Total Ayat</p>
                                <p className="text-xs font-black text-emerald-900 dark:text-emerald-200">{totalAyat} Ayat</p>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-3 grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => openTahfizhDetail(student)}
                              className="inline-flex h-8 items-center justify-center gap-1 rounded-xl border border-sky-200 bg-sky-50 text-[10px] font-bold text-sky-700 transition hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
                            >
                              <Eye className="h-3 w-3" /> Detail
                            </button>
                            <button
                              type="button"
                              onClick={() => openTahfizhForm(student)}
                              className="inline-flex h-8 items-center justify-center gap-1 rounded-xl bg-emerald-800 text-[10px] font-bold text-white transition hover:bg-emerald-900"
                            >
                              <Plus className="h-3 w-3" /> Setor
                            </button>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Multi-Unit Summary Cards (For Pengurus Yayasan & Kepala Sekolah) */}
              {(isPengurusYayasan || isKepalaSekolahOrDivisiPendidikan) && unitStatsSummary.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {unitStatsSummary.map((unitStat) => (
                    <div key={unitStat.unitName} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-700/80 dark:bg-[#1B2433]">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                          <Award className="h-4 w-4" />
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {unitStat.totalStudents} Santri
                        </span>
                      </div>
                      <h4 className="mt-3 truncate text-sm font-black text-slate-900 dark:text-white">{unitStat.unitName}</h4>
                      <div className="mt-2 flex items-baseline justify-between border-t border-slate-100 pt-2 dark:border-slate-800">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400">Total Hafalan</p>
                          <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">{unitStat.totalAyat} ayat</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400">Top Hafiz Unit</p>
                          <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[110px]" title={unitStat.topStudent?.student?.nama_lengkap}>
                            🥇 {unitStat.topStudent?.student?.nama_lengkap?.split(' ')[0] || '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Leaderboard Table (Ranked from Most/Top Tahfizh Hafalan) */}
              <div className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-[var(--shadow-soft-xl)] dark:border-slate-700/80 dark:bg-[#1B2433]">
                <div className="divide-y divide-slate-100 md:hidden dark:divide-slate-800">
                  {paginatedTahfizhLeaderboard.map(({ student, latest, totalAyat, completedSurahs, totalSetoran, unitName, className }, index) => {
                    const absoluteIndex = (tahfizhPage - 1) * TAHFIZH_PER_PAGE + index
                    const isTop1 = absoluteIndex === 0
                    const isTop2 = absoluteIndex === 1
                    const isTop3 = absoluteIndex === 2
                    return (
                      <article key={student.id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                              isTop1 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                              isTop2 ? 'bg-slate-200 text-slate-800 border border-slate-300' :
                              isTop3 ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                              'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : `#${absoluteIndex + 1}`}
                            </span>
                            <div className="min-w-0">
                              <h4 className="truncate text-sm font-black text-slate-900 dark:text-white">{student.nama_lengkap}</h4>
                              <p className="text-[10px] text-slate-500">{student.nis || student.nisn || 'NIS N/A'} · {className}</p>
                            </div>
                          </div>
                          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                            {totalAyat} ayat
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                            {unitName}
                          </span>
                        </div>
                        <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                          {latest ? (
                            <>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                Juz {latest.metadata?.juz || '-'} · {latest.hafalan_surah_name}
                              </p>
                              <p className="mt-1 text-[10px] text-slate-500">
                                Ayat {latest.hafalan_ayah_start}–{latest.hafalan_ayah_end} · {latest.record_date}
                              </p>
                            </>
                          ) : (
                            <p className="text-xs text-slate-400">Belum ada setoran Tahfizh.</p>
                          )}
                          <p className="mt-2 text-[10px] text-slate-500">{completedSurahs} surah · {totalSetoran} setoran</p>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <button type="button" onClick={() => openTahfizhDetail(student)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 text-[11px] font-bold text-sky-700 transition hover:bg-sky-100">
                            <Eye className="h-3.5 w-3.5" /> Lihat Detail
                          </button>
                          <button type="button" onClick={() => openTahfizhForm(student)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-800 text-[11px] font-bold text-white transition hover:bg-emerald-900">
                            <Plus className="h-3.5 w-3.5" /> Input Tahfizh
                          </button>
                        </div>
                      </article>
                    )
                  })}
                </div>

                <table className="hidden w-full table-fixed text-left text-[11px] md:table">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/70">
                    <tr>
                      <th className="w-16 p-3 text-center">Rank</th>
                      <th className="p-3">Siswa / Santri</th>
                      <th className="p-3">Unit Sekolah</th>
                      <th className="p-3">Kelas & Rombel</th>
                      <th className="p-3">Pencapaian Tahfizh</th>
                      <th className="p-3">Setoran Terakhir</th>
                      <th className="p-3 text-center">Total (Terbanyak)</th>
                      <th className="w-28 p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paginatedTahfizhLeaderboard.map(({ student, latest, totalAyat, completedSurahs, totalSetoran, unitName, className }, index) => {
                      const absoluteIndex = (tahfizhPage - 1) * TAHFIZH_PER_PAGE + index
                      const isTop1 = absoluteIndex === 0
                      const isTop2 = absoluteIndex === 1
                      const isTop3 = absoluteIndex === 2
                      return (
                        <tr key={student.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/10 transition">
                          <td className="p-3 text-center">
                            <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
                              isTop1 ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-sm' :
                              isTop2 ? 'bg-slate-200 text-slate-800 border border-slate-300' :
                              isTop3 ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                              'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : `#${absoluteIndex + 1}`}
                            </span>
                          </td>
                          <td className="p-3">
                            <p className="font-extrabold text-slate-900 dark:text-white">{student.nama_lengkap}</p>
                            <p className="mt-0.5 text-[10px] text-slate-500">{student.nis || student.nisn || 'NIS N/A'}</p>
                          </td>
                          <td className="p-3">
                            <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${
                              unitName.includes('SMA') ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' :
                              unitName.includes('SMP') ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' :
                              unitName.includes('SD') ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' :
                              'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                            }`}>
                              {unitName}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{className}</span>
                          </td>
                          <td className="p-3">
                            {latest ? (
                              <>
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                  Juz {latest.metadata?.juz || '-'}
                                </span>
                                <p className="mt-1 font-bold text-slate-800 dark:text-slate-100">{latest.hafalan_surah_name}</p>
                              </>
                            ) : (
                              <span className="text-slate-400">Belum ada capaian</span>
                            )}
                          </td>
                          <td className="p-3">
                            {latest ? (
                              <>
                                <p className="font-semibold text-slate-700 dark:text-slate-200">Ayat {latest.hafalan_ayah_start}–{latest.hafalan_ayah_end}</p>
                                <p className="mt-0.5 text-[10px] text-slate-500">{latest.record_date} · {latest.metadata?.type || 'Ziyadah'}</p>
                              </>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <p className="font-black text-emerald-700 dark:text-emerald-400 text-xs">{totalAyat} ayat</p>
                            <p className="text-[10px] text-slate-500">{completedSurahs} surah · {totalSetoran} setoran</p>
                          </td>
                          <td className="p-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openTahfizhDetail(student)}
                                title="Lihat detail jurnal"
                                aria-label={`Lihat detail jurnal ${student.nama_lengkap}`}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-700 transition hover:bg-sky-100 focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openTahfizhForm(student)}
                                title="Input Tahfizh"
                                aria-label={`Input Tahfizh ${student.nama_lengkap}`}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800 text-white transition hover:bg-emerald-900 focus-visible:ring-2 focus-visible:ring-emerald-600 cursor-pointer"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {!loading && sortedTahfizhLeaderboard.length === 0 && (
                  <div className="p-10 text-center">
                    <Users className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-xs font-semibold text-slate-500">Tidak ada data pencapaian tahfizh yang sesuai dengan filter.</p>
                  </div>
                )}

                {/* Footer Pagination Controls */}
                <div className="w-full border-t border-slate-100 px-4 py-3.5 sm:px-6 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 font-medium">
                    Menampilkan <span className="font-bold text-slate-700 dark:text-slate-200">{sortedTahfizhLeaderboard.length > 0 ? (tahfizhPage - 1) * TAHFIZH_PER_PAGE + 1 : 0}</span> s.d. <span className="font-bold text-slate-700 dark:text-slate-200">{Math.min(tahfizhPage * TAHFIZH_PER_PAGE, sortedTahfizhLeaderboard.length)}</span> dari <span className="font-bold text-slate-700 dark:text-slate-200">{sortedTahfizhLeaderboard.length}</span> santri
                  </div>
                  {totalTahfizhPages > 1 && (
                    <div className="w-full sm:w-auto">
                      <Pagination
                        currentPage={tahfizhPage}
                        totalPages={totalTahfizhPages}
                        onPageChange={(p) => setTahfizhPage(p)}
                        sideLayout="full"
                        variant="default"
                      />
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* TAB 6B: REKAPAN TAHFIZH LENGKAP */}
          {activeTab === 'rekapan-tahfizh' && (
            <section className="space-y-4" aria-labelledby="rekapan-tahfizh-heading">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-4 dark:border-emerald-800/80 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 id="rekapan-tahfizh-heading" className="text-base font-extrabold text-slate-900 dark:text-white">
                      Laporan Rekapan Setoran Tahfizh
                    </h3>
                    <p className="text-xs text-slate-500">
                      Rekapitulasi log hafalan santri, filter periode, statistik capaian, dan cetak laporan resmi.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => changeTab('tahfizh')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <ArrowRight className="h-3.5 w-3.5 rotate-180" /> Kembali ke Jurnal
                </button>
              </div>

              <TahfizhReportSummaryPage embedded={true} defaultClassId={selectedClass} initialRecords={tahfizhLogs} />
            </section>
          )}

          {/* TAB 7: MUTABAAH */}
          {activeTab === 'mutabaah' && (
            <TeacherMutabaahWeekly selectedClassId={selectedClass} />
          )}

          {/* TAB 8: CATATAN SISWA */}
          {activeTab === 'catatan' && (
            <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
              {/* Toolbar Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-sm">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Catatan Perkembangan Siswa
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Monitoring Karakter & Akademik Rombel {selectedClassName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      printCleanTable({
                        title: 'Rekapitulasi Catatan Perkembangan Siswa',
                        subtitle: `Rombel: ${selectedClassName} | Tahun Ajaran 2026/2027`,
                        headers: ['No', 'NIS', 'Nama Siswa', 'Kategori', 'Judul Catatan', 'Tanggal', 'Prioritas'],
                        rows: studentNotes.map((n, idx) => [
                          idx + 1,
                          n.student?.nis || n.student_nis || '-',
                          n.student?.nama_lengkap || n.student_name || '-',
                          n.category || '-',
                          n.title || '-',
                          n.date || '-',
                          n.priority || 'Normal',
                        ]),
                      })
                      addToast('info', 'Dokumen Siap Dicetak', 'Pratinjau cetak rekapitulasi catatan perkembangan siswa berhasil dibuka.')
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50/80 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 cursor-pointer shadow-xs active:scale-95"
                    title="Cetak rekapitulasi catatan perkembangan siswa"
                  >
                    <Printer className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Cetak Catatan
                  </button>
                  <span className="inline-flex items-center rounded-lg bg-emerald-50 border border-emerald-300 px-2.5 py-1 text-xs font-black text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-700 dark:text-emerald-300">
                    {students.length} siswa
                  </span>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="border-b border-emerald-500/15 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 px-4 py-2.5 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/40 sm:px-5">
                <div className="grid gap-3 md:grid-cols-[1fr_180px_160px]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      value={studentNoteSearch}
                      onChange={(e) => setStudentNoteSearch(e.target.value)}
                      placeholder="Cari siswa, judul, atau isi catatan..."
                      className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-8.5 pr-3 text-xs outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <select
                    value={studentNoteCategory}
                    onChange={(e) => setStudentNoteCategory(e.target.value)}
                    className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="semua">Semua kategori</option>
                    {['Akademik', 'Perilaku', 'Kedisiplinan', 'Prestasi', 'Konseling', 'Tahfizh', 'Ibadah', 'Kesehatan'].map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                  <select
                    value={studentNotePriority}
                    onChange={(e) => setStudentNotePriority(e.target.value)}
                    className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="semua">Semua prioritas</option>
                    <option value="low">Rendah</option>
                    <option value="medium">Sedang</option>
                    <option value="high">Tinggi</option>
                    <option value="urgent">Mendesak</option>
                  </select>
                </div>
              </div>

              {/* Datatable */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1040px] table-fixed text-left text-xs">
                  <colgroup><col className="w-14" /><col className="w-60" /><col className="w-36" /><col /><col className="w-20" /><col className="w-[430px]" /></colgroup>
                  <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-slate-700 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:text-slate-300 select-none">
                    <tr>
                      <th className="px-4 py-3 font-bold text-center">No</th>
                      <th
                        onClick={() => {
                          if (catatanSortField === 'name') {
                            setCatatanSortOrder(catatanSortOrder === 'asc' ? 'desc' : 'asc')
                          } else {
                            setCatatanSortField('name')
                            setCatatanSortOrder('asc')
                          }
                        }}
                        className="px-4 py-3 font-bold cursor-pointer hover:text-emerald-800 dark:hover:text-emerald-300 transition"
                        title="Klik untuk mengurutkan Data Siswa"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Data Siswa</span>
                          {catatanSortField === 'name' ? (
                            catatanSortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <ArrowDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3 font-bold">Rombel</th>
                      <th className="px-4 py-3 font-bold">Catatan Terakhir</th>
                      <th className="px-4 py-3 font-bold text-center">Jumlah</th>
                      <th className="px-4 py-3 font-bold text-right pr-6">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {catatanStudents.map((student, index) => { const notes = studentNotes.filter((note) => note.student_id === student.id); const latest = notes[0]; return <tr key={student.id} className="h-[76px] hover:bg-emerald-50/40 dark:hover:bg-emerald-950/10"><td className="p-3 text-center font-mono text-slate-400">{index + 1}</td><td className="overflow-hidden p-3"><p className="truncate font-bold text-slate-900 dark:text-white" title={student.nama_lengkap || student.full_name}>{student.nama_lengkap || student.full_name}</p><p className="mt-0.5 truncate text-[10px] text-slate-500">{student.nis || student.nisn || 'NIS belum tersedia'}</p></td><td className="overflow-hidden p-3"><span className="block truncate rounded-full bg-emerald-50 px-2.5 py-1 text-center text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" title={student.kelas?.nama_kelas || student.kelas?.name || selectedClassName}>{student.kelas?.nama_kelas || student.kelas?.name || selectedClassName}</span></td><td className="overflow-hidden p-3">{latest ? <><p className="truncate font-semibold text-slate-700 dark:text-slate-200" title={latest.title}>{latest.title}</p><p className="mt-0.5 truncate text-[10px] text-slate-500">{latest.category} · {latest.date}</p></> : <span className="text-slate-400">Belum ada catatan</span>}</td><td className="p-3 text-center"><span className="font-black text-[#0E5C44]">{notes.length}</span></td><td className="whitespace-nowrap p-3 text-right"><div className="inline-flex items-center justify-end gap-1.5"><button type="button" onClick={() => openStudentDetail(student)} className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-2.5 text-[10px] font-bold text-sky-700 transition hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300"><Eye className="h-3.5 w-3.5 shrink-0" /> Lihat</button><button type="button" onClick={() => handlePrintWeeklyEvaluation(student)} title="Cetak Lembar Evaluasi Mingguan Santri" className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-2.5 text-[10px] font-bold text-orange-700 hover:bg-orange-100 transition dark:border-orange-800 dark:bg-orange-950/60 dark:text-orange-300"><Printer className="h-3.5 w-3.5 shrink-0" /> Evaluasi</button><button type="button" onClick={() => openCatatanForm(null, student)} className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#0E5C44] px-2.5 text-[10px] font-bold text-white hover:bg-emerald-800 transition"><Plus className="h-3.5 w-3.5 shrink-0" /> Catatan</button>{latest?.teacher_id === teacherProfile?.id && <><button type="button" onClick={() => openCatatanForm(latest)} title="Edit catatan terakhir" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300"><Edit3 className="h-3.5 w-3.5" /></button><button type="button" onClick={() => confirmDeleteModal('catatan', latest.id, latest.title)} title="Hapus catatan terakhir" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300"><Trash2 className="h-3.5 w-3.5" /></button></>}</div></td></tr> })}
                  </tbody>
                </table>
                {!loading && catatanStudents.length === 0 && <div className="py-12 text-center"><Users className="mx-auto h-9 w-9 text-slate-300" /><p className="mt-2 text-xs font-semibold text-slate-500">Tidak ada siswa pada rombel atau filter ini.</p></div>}
              </div>
            </div>
          )}

          {/* TAB 9: LOG ABSENSI GURU (READ ONLY) */}
          {activeTab === 'log-absensi' && (
            <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
              {/* Toolbar Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-sm">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Log Absensi Guru</h3>
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        <Lock className="h-3 w-3" /> Read Only
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Riwayat Kehadiran Resmi Pengajar: <strong className="text-slate-700 dark:text-slate-200">{teacherName}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleProcessExport()}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50/80 px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300 shadow-xs cursor-pointer active:scale-95"
                  >
                    <Download className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" /> Export PDF
                  </button>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/15 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 px-4 py-2.5 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/40 sm:px-5">
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={teacherLogMonth}
                    onChange={(e) => setTeacherLogMonth(e.target.value)}
                    className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="semua">Semua Bulan</option>
                    {Array.from({ length: 6 }).map((_, i) => {
                      const d = new Date()
                      d.setMonth(d.getMonth() - i)
                      const val = d.toISOString().slice(0, 7)
                      const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
                      return <option key={val} value={val}>{label}</option>
                    })}
                  </select>
                  <select
                    value={teacherLogStatus}
                    onChange={(e) => setTeacherLogStatus(e.target.value)}
                    className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="semua">Semua Status</option>
                    <option value="Hadir">Hadir</option>
                    <option value="Terlambat">Terlambat</option>
                    <option value="Izin">Izin</option>
                    <option value="Sakit">Sakit</option>
                  </select>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Total <strong className="text-emerald-700 dark:text-emerald-300">{filteredTeacherLogs.length}</strong> catatan kehadiran
                </div>
              </div>

              {/* Datatable */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-slate-700 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-bold">Tanggal & Hari</th>
                      <th className="px-4 py-3 font-bold">Jam Masuk</th>
                      <th className="px-4 py-3 font-bold">Jam Pulang</th>
                      <th className="px-4 py-3 font-bold">Durasi Working</th>
                      <th className="px-4 py-3 font-bold">Status</th>
                      <th className="px-4 py-3 font-bold">Metode & Perangkat</th>
                      <th className="px-4 py-3 font-bold text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredTeacherLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-slate-900 dark:text-white">
                          {log.date}
                          <span className="block text-[10px] text-slate-400 font-normal">{log.day}</span>
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">{log.check_in ? `${log.check_in} WIB` : '-'}</td>
                        <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">{log.check_out ? `${log.check_out} WIB` : '-'}</td>
                        <td className="p-3 font-mono">{log.duration || '-'}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 font-bold text-[10px] rounded-full ${
                            log.status === 'Hadir' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                            log.status === 'Terlambat' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                            log.status === 'Izin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                            log.status === 'Sakit' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                            'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3">
                          {log.method || '-'}
                          <span className="block text-[10px] text-slate-400">{log.device || '-'}</span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              setDetailData({
                                title: `Log Absensi: ${log.date}`,
                                category: 'Log Absensi Guru (Read-Only)',
                                items: [
                                  { label: 'Tanggal', value: log.date },
                                  { label: 'Hari', value: log.day },
                                  { label: 'Jam Masuk', value: log.check_in || '-' },
                                  { label: 'Jam Pulang', value: log.check_out || '-' },
                                  { label: 'Durasi', value: log.duration || '-' },
                                  { label: 'Status', value: log.status || '-' },
                                  { label: 'Metode', value: log.method || '-' },
                                  { label: 'Lokasi', value: log.location || '-' },
                                ]
                              })
                              setShowDetailModal(true)
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold flex items-center justify-center gap-1 mx-auto"
                          >
                            <Eye className="w-3.5 h-3.5" /> Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredTeacherLogs.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          Tidak ada catatan absensi untuk periode atau filter yang dipilih.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 10: JADWAL LENGKAP (READ ONLY) */}
          {activeTab === 'jadwal-lengkap' && (
            <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
              {/* Toolbar Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-sm">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Jadwal Pelajaran Lengkap Sekolah</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Master Kalender & Schedule Matrix Sekolah</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                  {['Hari', 'Minggu', 'Bulan', 'Semester'].map((subt) => (
                    <button
                      key={subt}
                      onClick={() => setJadwalLengkapTab(subt)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                        jadwalLengkapTab === subt
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      {subt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub Tab Views */}
              <div className="p-4 sm:p-5 space-y-4">
              {(() => {
                const rawPool = (allTeacherSchedules && allTeacherSchedules.length > 0)
                  ? allTeacherSchedules
                  : (schedules && schedules.length > 0 ? schedules : [])

                const classFilteredPool = (selectedClass && selectedClass !== 'all')
                  ? rawPool.filter((s) => {
                      const cId = s.kelas_id || s.class_id || s.kelas?.id || s.class?.id
                      return String(cId) === String(selectedClass)
                    })
                  : rawPool

                // Strict: jika rombel spesifik dipilih, gunakan classFilteredPool saja (meski kosong)
                // Jangan fallback ke semua jadwal — itu yang menyebabkan semua rombel tampil saat filter aktif
                const pool = (selectedClass && selectedClass !== 'all')
                  ? classFilteredPool
                  : (rawPool.length > 0 ? rawPool : (schedules && schedules.length > 0 ? schedules : []))

                const daysList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

                const dayMapping = {
                  1: 'Senin', 2: 'Selasa', 3: 'Rabu', 4: 'Kamis', 5: 'Jumat', 6: 'Sabtu', 7: 'Ahad'
                }

                const getDayStr = (s) => s.day_name || s.nama_hari || dayMapping[s.day_of_week] || 'Senin'

                const sortedPool = [...pool].sort((a, b) => {
                  const dayOrder = { 'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6, 'Ahad': 7 }
                  const da = dayOrder[getDayStr(a)] || 99
                  const db = dayOrder[getDayStr(b)] || 99
                  if (da !== db) return da - db
                  return (a.start_time || a.time_start || '').localeCompare(b.start_time || b.time_start || '')
                })

                return (
                  <>
                    {/* 1. SUB-TAB HARI */}
                    {jadwalLengkapTab === 'Hari' && (
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs text-slate-500 font-semibold">Filter Berdasarkan Hari Pelajaran:</p>
                          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                            {['Semua', ...daysList].map((d) => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => setSelectedHariFilter(d)}
                                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                                  selectedHariFilter === d
                                    ? 'bg-[#0E5C44] text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                              >
                                {d}
                              </button>
                            ))}
                          </div>
                        </div>

                        {(() => {
                          const filtered = selectedHariFilter === 'Semua'
                            ? sortedPool
                            : sortedPool.filter((s) => getDayStr(s).toLowerCase() === selectedHariFilter.toLowerCase())

                          if (filtered.length === 0) {
                            return (
                              <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                                Tidak ada jadwal mengajar pada hari {selectedHariFilter}.
                              </div>
                            )
                          }

                          return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {filtered.map((s, i) => (
                                <div key={s.id || i} className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex justify-between items-center text-xs shadow-sm hover:border-emerald-300 transition">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="px-2.5 py-0.5 bg-emerald-100 text-[#0E5C44] dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-[10px] rounded-md">
                                        {getDayStr(s)}
                                      </span>
                                      <span className="font-mono text-slate-600 dark:text-slate-300 font-bold">
                                        {(s.start_time || s.time_start || '07:00').slice(0, 5)} - {(s.end_time || s.time_end || '08:20').slice(0, 5)} WIB
                                      </span>
                                    </div>
                                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                                      {s.subject?.name || s.subject_name || 'Mata Pelajaran'}
                                    </h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                                      Kelas: <strong className="text-slate-700 dark:text-slate-200">{s.kelas?.name || s.kelas?.nama_kelas || selectedClassName || 'Kelas'}</strong> • Ruang: {s.kelas?.ruangan || s.room_name || '-'}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => openPresensiModal(s)}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#0E5C44] dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/80 font-bold text-[11px] border border-emerald-200 dark:border-emerald-800 transition"
                                  >
                                    Presensi Sesi
                                  </button>
                                </div>
                              ))}
                            </div>
                          )
                        })()}
                      </div>
                    )}

                    {/* 2. SUB-TAB MINGGU: WEEKLY MASTER GRID MATRIX */}
                    {jadwalLengkapTab === 'Minggu' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-slate-500 font-semibold">
                            Matriks Jadwal Mengajar Mingguan Resmi (Senin s.d. Sabtu)
                          </p>
                          <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 text-[11px] font-bold">
                            Total: {sortedPool.length} Sesi KBM / Minggu
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                          {daysList.map((day) => {
                            const daySchedules = sortedPool.filter(
                              (s) => getDayStr(s).toLowerCase() === day.toLowerCase()
                            )

                            return (
                              <div
                                key={day}
                                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-3.5 space-y-2.5"
                              >
                                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2">
                                  <div className="flex items-center gap-1.5">
                                    <CalendarDays className="w-4 h-4 text-emerald-600" />
                                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">{day}</h4>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    daySchedules.length > 0
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                      : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                  }`}>
                                    {daySchedules.length} Sesi
                                  </span>
                                </div>

                                {daySchedules.length === 0 ? (
                                  <p className="text-[11px] text-slate-400 text-center py-4 italic">
                                    Libur / Tidak ada KBM
                                  </p>
                                ) : (
                                  <div className="space-y-2">
                                    {daySchedules.map((s, idx) => (
                                      <div
                                        key={s.id || idx}
                                        className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs space-y-1"
                                      >
                                        <div className="flex items-center justify-between text-[10px]">
                                          <span className="font-mono font-extrabold text-emerald-700 dark:text-emerald-400">
                                            {(s.start_time || s.time_start || '07:00').slice(0, 5)} - {(s.end_time || s.time_end || '08:20').slice(0, 5)} WIB
                                          </span>
                                          <span className="text-slate-400 font-medium">
                                            {s.kelas?.ruangan || s.room_name || 'R. Kelas'}
                                          </span>
                                        </div>
                                        <div className="font-extrabold text-xs text-slate-800 dark:text-white">
                                          {s.subject?.name || s.subject_name || 'Mapel'}
                                        </div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                                          {s.kelas?.name || s.kelas?.nama_kelas || selectedClassName}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* 3. SUB-TAB BULAN: MONTHLY WORKLOAD & ACADEMIC AGENDA */}
                    {jadwalLengkapTab === 'Bulan' && (
                      <div className="space-y-5">
                        {/* KPI Cards Beban Bulanan */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Sesi Mengajar / Minggu</span>
                            <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                              {sortedPool.length} Sesi
                            </div>
                            <span className="text-[10px] text-emerald-600 font-medium">Tatap muka terjadwal</span>
                          </div>

                          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Estimasi Beban / Bulan</span>
                            {(() => {
                              const _now = new Date()
                              const _firstDay = new Date(_now.getFullYear(), _now.getMonth(), 1).getDay()
                              const _days = new Date(_now.getFullYear(), _now.getMonth() + 1, 0).getDate()
                              const _weeksInMonth = Math.ceil((_days + _firstDay) / 7)
                              return (
                                <>
                                  <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                                    {sortedPool.length * _weeksInMonth} Jam Pelajaran
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {_weeksInMonth} pekan bulan {_now.toLocaleDateString('id-ID', { month: 'long' })}
                                  </span>
                                </>
                              )
                            })()}
                          </div>

                          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Jumlah Rombel Diampu</span>
                            <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
                              {new Set(sortedPool.map((s) => s.kelas?.name || s.kelas_id)).size} Kelas
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">Distribusi mengajar</span>
                          </div>

                          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Mata Pelajaran Aktif</span>
                            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                              {new Set(sortedPool.map((s) => s.subject?.name || s.subject_id)).size} Mapel
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">Kurikulum resmi</span>
                          </div>
                        </div>

                        {/* Kalender Agenda Sekolah PostgreSQL */}
                        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5 space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div>
                              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                <CalendarRange className="w-4 h-4 text-emerald-600" /> Kalender Agenda & Kegiatan Akademik Sekolah
                              </h4>
                              <p className="text-[11px] text-slate-400">Data resmi kegiatan, KBM Ramadhan 1448 H, PTS/PAS & Libur Sekolah dari PostgreSQL</p>
                            </div>
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#0E5C44] dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold">
                              {academicCalendarEvents.length} Agenda Terjadwal
                            </span>
                          </div>

                          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto pr-1">
                            {academicCalendarEvents.length === 0 ? (
                              <p className="text-xs text-slate-400 text-center py-6">
                                Belum ada agenda akademik sekolah yang tercatat bulan ini.
                              </p>
                            ) : (
                              academicCalendarEvents.map((ev, idx) => (
                                <div key={ev.id || idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition">
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                        {ev.data_tambahan?.event_category || ev.data_tambahan?.kategori || 'Akademik'}
                                      </span>
                                      <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                                        {ev.judul_pengumuman}
                                      </h5>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                      {ev.isi_pengumuman || ev.data_tambahan?.ringkasan || '-'}
                                    </p>
                                  </div>
                                  <span className="font-mono text-[10px] font-extrabold text-indigo-700 dark:text-indigo-400 whitespace-nowrap">
                                    {ev.mulai_tampil ? new Date(ev.mulai_tampil).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                    {ev.selesai_tampil ? ` s/d ${new Date(ev.selesai_tampil).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 4. SUB-TAB SEMESTER: 100% REAL POSTGRESQL DATA TABLE */}
                    {jadwalLengkapTab === 'Semester' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <p className="text-slate-500 font-semibold">
                            Tabel Distribusi Jam Mengajar Semester (PostgreSQL Active Schedules)
                          </p>
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">
                            {sortedPool.length} Jadwal Mengajar Terdaftar
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-slate-700 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:text-slate-300">
                              <tr>
                                <th className="px-4 py-3 font-bold">Hari</th>
                                <th className="px-4 py-3 font-bold">Mata Pelajaran</th>
                                <th className="px-4 py-3 font-bold">Jam Mengajar</th>
                                <th className="px-4 py-3 font-bold">Kelas / Rombel</th>
                                <th className="px-4 py-3 font-bold">Ruangan</th>
                                <th className="px-4 py-3 font-bold text-center">Beban (JP)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                              {sortedPool.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="p-8 text-center text-slate-400">
                                    Belum ada jadwal semester yang terdaftar di sistem.
                                  </td>
                                </tr>
                              ) : (
                                sortedPool.map((item, idx) => (
                                  <tr key={item.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                                    <td className="p-3 font-bold text-emerald-700 dark:text-emerald-400">
                                      {getDayStr(item)}
                                    </td>
                                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                                      {item.subject?.name || item.subject_name || 'Mata Pelajaran'}
                                      {item.subject?.code && (
                                        <span className="block text-[10px] font-normal text-slate-400">
                                          {item.subject.code}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                                      {(item.start_time || item.time_start || '07:00').slice(0, 5)} - {(item.end_time || item.time_end || '08:20').slice(0, 5)} WIB
                                    </td>
                                    <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
                                      {item.kelas?.name || item.kelas?.nama_kelas || selectedClassName}
                                    </td>
                                    <td className="p-3 text-slate-500">
                                      {item.kelas?.ruangan || item.room_name || '-'}
                                    </td>
                                    <td className="p-3 text-center">
                                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-bold text-[10px]">
                                        {item.subject?.jam_pelajaran ? `${item.subject.jam_pelajaran} JP` : '-'}
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                            {sortedPool.length > 0 && (
                              <tfoot className="bg-slate-50/80 dark:bg-slate-800/60 font-bold text-xs border-t border-slate-200 dark:border-slate-700">
                                <tr>
                                  <td colSpan={3} className="p-3 text-slate-700 dark:text-slate-300">
                                    Total Beban Mengajar Semester: {sortedPool.length} Sesi Terjadwal
                                  </td>
                                  <td colSpan={3} className="p-3 text-right text-emerald-700 dark:text-emerald-400 font-extrabold">
                                    {new Set(sortedPool.map((s) => s.kelas?.name || s.kelas_id)).size} Rombel Kelas Diampu
                                  </td>
                                </tr>
                              </tfoot>
                            )}
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                )
              })()}
              </div>
            </div>
          )}

          {/* TAB CHAT: KOMUNIKASI ORANG TUA */}
          {activeTab === 'chat' && (
            <ChatGuruWorkspace mode="teacher" />
          )}
        </main>
      </div>

      {/* ── COMMAND PALETTE MODAL (CTRL + K) ───────────────────────────────── */}
      {showCommandPalette && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-start justify-center pt-20 p-4"
          onClick={() => setShowCommandPalette(false)}
        >
          <div
            className="bg-white dark:bg-[#1B2433] w-full max-w-xl rounded-[22px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative animate-in fade-in zoom-in duration-150 space-y-3 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                placeholder="Cari siswa, kelas, materi, atau navigasi workspace (Ctrl + K)..."
                className="w-full text-sm font-semibold bg-transparent outline-none text-slate-900 dark:text-white"
              />
              <button onClick={() => setShowCommandPalette(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1 max-h-72 overflow-y-auto text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2">Navigasi Workspace</span>
              {cardModulesList.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => {
                    changeTab(mod.id)
                    setShowCommandPalette(false)
                  }}
                  className="w-full text-left flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <span className="flex items-center gap-2 font-bold">
                    <mod.icon className="w-4 h-4 text-emerald-600" />
                    {mod.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Buka Modul →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showQrCamera && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md" onClick={closeQrCamera} role="presentation">
          <section className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="qr-camera-title">
            <header className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
              <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"><Camera className="h-5 w-5" /></span><div><h2 id="qr-camera-title" className="text-base font-bold text-slate-900 dark:text-white">Pemindai Kamera Web Live</h2><p className="text-xs text-slate-500">Mode: KEDATANGAN</p></div></div>
              <button type="button" onClick={closeQrCamera} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800" aria-label="Tutup kamera"><X className="h-5 w-5" /></button>
            </header>

            <div className="space-y-4 p-6">
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-inner dark:border-slate-800">
                <video ref={qrVideoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
                {!qrCameraActive && !qrCameraError && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900/80 text-white"><RefreshCw className="h-8 w-8 animate-spin text-emerald-400" /><p className="text-xs font-semibold">Menghubungkan ke kamera...</p></div>}
                
                {/* Target Viewfinder Overlay Tailored to Student ID Card QR Code Size */}
                {qrCameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-emerald-500 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                      {/* Corner Brackets */}
                      <div className="absolute -top-1.5 -left-1.5 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                      <div className="absolute -top-1.5 -right-1.5 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                      <div className="absolute -bottom-1.5 -left-1.5 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                      <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                      {/* Laser Beam */}
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_10px_#10b981] animate-pulse absolute top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                )}
              </div>

              {qrCameraErrorInfo ? (
                <div className={`rounded-2xl border p-4 text-xs ${
                  qrCameraErrorInfo.actionType === 'notice'
                    ? 'border-amber-200 bg-amber-50/80 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200'
                    : 'border-rose-200 bg-rose-50/80 text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl font-bold ${
                      qrCameraErrorInfo.actionType === 'notice'
                        ? 'bg-amber-200/80 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                        : 'bg-rose-200/80 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                    }`}>
                      !
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <p className="font-extrabold text-sm">{qrCameraErrorInfo.title}</p>
                      <p className="text-xs leading-relaxed opacity-90">{qrCameraErrorInfo.message}</p>
                      {qrCameraErrorInfo.instructions?.length > 0 && (
                        <div className="mt-2 space-y-1 rounded-xl bg-white/70 p-2.5 text-[11px] font-medium dark:bg-black/20">
                          <p className="font-bold uppercase tracking-wider text-[10px] opacity-75">Panduan Penyelesaian:</p>
                          <ol className="list-decimal pl-4 space-y-1">
                            {qrCameraErrorInfo.instructions.map((step, idx) => (
                              <li key={idx} className="leading-normal">{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                      {qrCameraErrorInfo.actionType !== 'notice' && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={openQrCamera}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
                          >
                            <RefreshCw className="h-3 w-3" /> Coba Nyalakan Ulang Kamera
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : qrCameraError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                  {qrCameraError}
                </div>
              ) : null}

              <form onSubmit={handleCardScan} className="space-y-3 pt-2">
                <label className="block text-xs font-semibold uppercase text-slate-500">Input / Hasil Pindai Kode Kartu</label>
                <div className="flex flex-col gap-2 sm:flex-row"><input ref={scanInputRef} value={scanInput} onChange={(event) => setScanInput(event.target.value)} autoFocus autoComplete="off" placeholder="Hasil scan QR / Ketik nomor kartu..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white" /><button type="submit" disabled={!scanInput.trim() || scanProcessing} className="whitespace-nowrap rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow hover:bg-emerald-700 disabled:opacity-50">{scanProcessing ? 'Proses...' : 'Proses Absen'}</button></div>
              </form>
            </div>

            <footer className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <button type="button" onClick={qrCameraActive ? stopQrCamera : openQrCamera} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">{qrCameraActive ? <><CameraOff className="h-3.5 w-3.5 text-rose-500" /> Matikan Kamera</> : <><Camera className="h-3.5 w-3.5 text-emerald-500" /> Nyalakan Ulang Kamera</>}</button>
              <button type="button" onClick={closeQrCamera} className="rounded-xl bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200">Tutup Window</button>
            </footer>
          </section>
        </div>
      )}

      {showAttendanceMethodModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-sm sm:p-5" onClick={() => setShowAttendanceMethodModal(false)} role="presentation">
          <section className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#1B2433]" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="attendance-modal-title">
            <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-800">
              <div className="flex min-w-0 items-center gap-3">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${selectedMethod === 'rollcall' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : selectedMethod === 'qr' ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' : 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300'}`}>
                  {selectedMethod === 'rollcall' ? <UserCheck className="h-5 w-5" /> : selectedMethod === 'qr' ? <QrCode className="h-5 w-5" /> : <Wifi className="h-5 w-5" />}
                </span>
                <div className="min-w-0">
                  <h2 id="attendance-modal-title" className="truncate text-lg font-extrabold text-slate-900 dark:text-white">{selectedMethod === 'rollcall' ? 'Checklist Kehadiran Siswa' : selectedMethod === 'qr' ? 'Scan QR Code Kartu Siswa' : 'Identifikasi RFID Kartu Siswa'}</h2>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{selectedClassName} • {getScheduleSubject(getCurrentSchedule() || {})} • Jam Pelajaran: {getScheduleLessonHours(getCurrentSchedule())} • Waktu Sekarang: {formattedLiveTime}</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowAttendanceMethodModal(false)} aria-label="Tutup popup presensi" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-3 focus-visible:ring-emerald-700/20 dark:hover:bg-slate-800 dark:hover:text-slate-200"><X className="h-5 w-5" /></button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
              {selectedMethod === 'rollcall' ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/20">
                    <div>
                      <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">{students.filter((student) => attendanceData[student.id]?.status === 'Hadir').length} dari {students.length} siswa hadir</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">Rombel: <strong>{selectedClassName}</strong> • {getScheduleSubject(getCurrentSchedule() || {})}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300/80 bg-white px-3 py-2 text-xs font-bold text-emerald-800 shadow-xs dark:border-emerald-700 dark:bg-slate-800 dark:text-emerald-200">
                        <Filter className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-[11px] text-slate-400 font-medium">Rombel:</span>
                        <select
                          value={selectedClass}
                          onChange={(e) => handleModalClassChange(e.target.value)}
                          className="bg-transparent text-xs font-extrabold text-emerald-900 dark:text-emerald-100 outline-none cursor-pointer"
                        >
                          <option value="all" className="dark:bg-slate-900 text-slate-900 dark:text-white">
                            Semua Rombel
                          </option>
                          {classes.map((c) => (
                            <option key={c.id} value={c.id} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                              {c.nama_kelas || c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button type="button" onClick={markAllStudentsPresent} className="h-11 rounded-xl border border-emerald-200 bg-white px-4 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 focus-visible:ring-3 focus-visible:ring-emerald-700/20 dark:border-emerald-800 dark:bg-slate-800 dark:text-emerald-300">Centang Semua Hadir</button>
                    </div>
                  </div>
                  {students.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-12 text-center dark:border-slate-700"><Users className="mx-auto h-8 w-8 text-slate-300" /><h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-white">Siswa belum tersedia</h3><p className="mt-1 text-xs text-slate-500">Pilih kelas dan jadwal mengajar terlebih dahulu.</p></div>
                  ) : (
                    <div className="space-y-2">
                      {students.map((student, index) => {
                        const status = attendanceData[student.id]?.status || 'Belum Dicatat'
                        return <article key={student.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-3 transition hover:border-emerald-300 dark:border-slate-800 sm:flex-row sm:items-center">
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <input type="checkbox" checked={status === 'Hadir'} onChange={(event) => toggleStudentChecklist(student, event.target.checked)} aria-label={`Tandai ${student.nama_lengkap} hadir`} className="h-5 w-5 shrink-0 cursor-pointer accent-emerald-700" />
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-extrabold text-slate-500 dark:bg-slate-800">{index + 1}</span>
                            <div className="min-w-0"><h4 className="truncate text-sm font-bold text-slate-900 dark:text-white">{student.nama_lengkap}</h4><p className="truncate text-[11px] text-slate-500">NIS/NISN: {student.nis || student.nisn || 'Belum tersedia'}</p></div>
                          </div>
                          <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">{['Belum Dicatat', 'Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alpha'].map((option) => <button key={option} type="button" onClick={() => markStudentAttendance(student, 'Checklist Guru', option)} className={`h-9 shrink-0 rounded-lg px-2.5 text-[10px] font-bold transition ${status === option ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}>{option}</button>)}</div>
                        </article>
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mx-auto max-w-xl space-y-5 py-2 sm:py-6">
                  <div className={`mx-auto flex h-28 w-28 items-center justify-center rounded-[28px] border ${selectedMethod === 'qr' ? 'border-sky-200 bg-sky-50 text-sky-600 dark:border-sky-900 dark:bg-sky-950/30' : 'border-violet-200 bg-violet-50 text-violet-600 dark:border-violet-900 dark:bg-violet-950/30'}`}>
                    {selectedMethod === 'qr' ? <QrCode className="h-14 w-14" /> : <Wifi className="h-14 w-14" />}
                  </div>
                  <div className="text-center"><h3 className="text-base font-extrabold text-slate-900 dark:text-white">{selectedMethod === 'qr' ? 'Arahkan QR kartu ke scanner' : 'Tempelkan kartu pada reader RFID'}</h3><p className="mt-1 text-xs leading-5 text-slate-500">Kode akan diproses otomatis saat reader mengirimkan tombol Enter.</p></div>
                  <form onSubmit={handleCardScan} className="space-y-3">
                    <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">Kode kartu siswa</span><div className="flex gap-2"><div className="relative min-w-0 flex-1">{selectedMethod === 'qr' ? <QrCode className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /> : <Wifi className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />}<input ref={scanInputRef} value={scanInput} onChange={(event) => setScanInput(event.target.value)} disabled={scanProcessing} autoFocus autoComplete="off" placeholder={`Menunggu ${selectedMethod === 'qr' ? 'QR scanner' : 'RFID reader'}...`} className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-semibold outline-none transition focus:border-emerald-700 focus:ring-3 focus:ring-emerald-700/15 disabled:cursor-wait disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white" /></div><button type="submit" disabled={!scanInput.trim() || scanProcessing} className="h-12 min-w-24 rounded-xl bg-emerald-700 px-4 text-xs font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">{scanProcessing ? 'Memproses...' : 'Identifikasi'}</button></div></label>
                  </form>
                  {lastScannedResult && <div className={`flex items-center gap-3 rounded-2xl border p-4 ${lastScannedResult.error ? 'border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30' : 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30'}`} role="status">{lastScannedResult.error ? <AlertCircle className="h-6 w-6 shrink-0 text-rose-600" /> : <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />}<div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900 dark:text-white">{lastScannedResult.error ? 'Kartu tidak dikenali' : (lastScannedResult.student?.nama_lengkap || lastScannedResult.student?.full_name)}</p><p className="mt-0.5 text-xs text-slate-500">{lastScannedResult.error ? lastScannedResult.message : `${lastScannedResult.method}${lastScannedResult.time ? ` • ${lastScannedResult.time} WIB` : ''}`}</p></div></div>}
                </div>
              )}
            </div>

            <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-[#1B2433] sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setShowAttendanceMethodModal(false)} className="h-11 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Tutup</button>
              <button type="button" onClick={handleSaveAttendance} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-xs font-bold text-white transition hover:bg-emerald-800"><Save className="h-4 w-4" /> Simpan Presensi</button>
            </footer>
          </section>
        </div>
      )}

      {/* MODAL DETAIL DATA PRESENSI PERORANGAN SISWA (STYLE LEMBAR TAHFIZH WORKSPACE) */}
      {showStudentAttendanceDetailModal && selectedStudentAttendanceDetail && (() => {
        const student = selectedStudentAttendanceDetail
        const curRecord = attendanceData[student.id] || { status: 'Belum Dicatat', method: 'Belum dicatat', check_in_time: '-' }
        const allHistory = getStudentAttendanceHistory(student)
        const todayStr = attendanceDateFilter || new Date().toISOString().split('T')[0]

        const harianList = getFilteredStudentAttendanceHistory(allHistory, 'harian', todayStr)
        const mingguanList = getFilteredStudentAttendanceHistory(allHistory, 'mingguan', todayStr)
        const bulananList = getFilteredStudentAttendanceHistory(allHistory, 'bulanan', todayStr)
        const semesterList = allHistory

        const periodCounts = {
          harian: harianList.length,
          mingguan: mingguanList.length,
          bulanan: bulananList.length,
          semester: semesterList.length,
        }

        const displayHistory = getFilteredStudentAttendanceHistory(allHistory, studentDetailPeriodFilter, todayStr)

        const hadirCount = displayHistory.filter((h) => h.status === 'Hadir').length
        const terlambatCount = displayHistory.filter((h) => h.status === 'Terlambat').length
        const izinSakitCount = displayHistory.filter((h) => ['Izin', 'Sakit'].includes(h.status)).length
        const alphaCount = displayHistory.filter((h) => h.status === 'Alpha').length
        const terlaksanaCount = displayHistory.filter((h) => h.status !== 'Belum Terlaksana').length
        const persentase = terlaksanaCount > 0 ? Math.round((hadirCount / terlaksanaCount) * 100) : 0

        const periodLabelMap = {
          harian: 'Harian (Hari Ini)',
          mingguan: 'Mingguan (Pekan Ini)',
          bulanan: 'Bulanan (Bulan Ini)',
          semester: `Semester (${semesterList.length} Sesi)`,
        }

        const periodDetailDesc = {
          harian: `Sesi KBM Hari Ini • ${todayStr}`,
          mingguan: `Pertemuan KBM Pekan Berjalan (${mingguanList.length} Sesi)`,
          bulanan: `Pertemuan KBM Bulan Berjalan (${bulananList.length} Sesi)`,
          semester: `Rekapitulasi Semester Berjalan (${semesterList.length} Sesi KBM)`,
        }

        const statusBadgeMap = {
          'Belum Dicatat': 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300',
          Hadir: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300',
          Terlambat: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300',
          Izin: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300',
          Sakit: 'bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-950 dark:text-violet-300',
          Alpha: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300',
          'Belum Terlaksana': 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-800/40 dark:text-slate-500',
        }

        const activeSchedule = getCurrentSchedule() || presensiModalSchedule || {}
        const subjectName = activeSchedule?.subject?.name || activeSchedule?.subject?.nama_mapel || activeSchedule?.nama_mapel || 'Mata Pelajaran'

        return (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-sm sm:p-5" role="dialog" aria-modal="true" aria-labelledby="attendance-detail-title">
            <div className="flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#1B2433]">
              
              {/* Header Style Tahfizh */}
              <header className="flex shrink-0 flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Lembar Presensi & Rekapitulasi Kehadiran Siswa
                    </p>
                    <h2 id="attendance-detail-title" className="truncate text-lg font-black text-slate-900 dark:text-white">
                      {student.nama_lengkap || student.full_name}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {student.nis || student.nisn || 'NIS belum tersedia'} · Rombel {selectedClassName} · Mapel: {subjectName}
                    </p>
                  </div>
                </div>

                {/* Filter Periode Tab Buttons & Close */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-900">
                    {[
                      { id: 'harian', label: 'Harian', count: periodCounts.harian },
                      { id: 'mingguan', label: 'Mingguan', count: periodCounts.mingguan },
                      { id: 'bulanan', label: 'Bulanan', count: periodCounts.bulanan },
                      { id: 'semester', label: 'Semester', count: periodCounts.semester },
                    ].map((t) => {
                      const isActive = studentDetailPeriodFilter === t.id
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setStudentDetailPeriodFilter(t.id)
                            setStudentDetailPage(1)
                          }}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                            isActive
                              ? 'bg-emerald-700 text-white shadow-sm'
                              : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                          }`}
                        >
                          <span>{t.label}</span>
                          <span className={`rounded-full px-1.5 py-0.2 text-[9px] font-extrabold ${isActive ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                            {t.count}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  <div className="hidden sm:block min-w-36 text-center border-l border-slate-200 pl-3 dark:border-slate-700">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Periode</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[160px]" title={periodDetailDesc[studentDetailPeriodFilter]}>
                      {periodDetailDesc[studentDetailPeriodFilter]}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowStudentAttendanceDetailModal(false)
                      setSelectedStudentAttendanceDetail(null)
                      setStudentDetailSessions([])
                    }}
                    aria-label="Tutup detail"
                    className="ml-1 inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </header>

              {/* Body Content */}
              <div className="min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4">
                {loadingStudentDetailSessions && (
                  <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 animate-pulse">
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-700 border-r-transparent dark:border-emerald-300"></span>
                    <span>Memuat seluruh riwayat sesi presensi siswa...</span>
                  </div>
                )}
                {/* Profil & Status Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-700/80 dark:bg-slate-900/50">
                  <div className="flex items-center gap-3.5">
                    <Avatar size="lg" className="ring-2 ring-emerald-500/30 shrink-0">
                      <AvatarFallback className="bg-emerald-100 font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs">
                        {(student.nama_lengkap || student.full_name || 'S').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                          {student.nama_lengkap || student.full_name}
                        </h4>
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {student.gender === 'L' || student.jenis_kelamin === 'L' ? 'Laki-laki' : (student.gender === 'P' || student.jenis_kelamin === 'P' ? 'Perempuan' : 'Santri')}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        NIS: <strong className="text-slate-700 dark:text-slate-200">{student.nis || '-'}</strong> · NISN: <strong className="text-slate-700 dark:text-slate-200">{student.nisn || '-'}</strong> · Rombel: <strong className="text-slate-700 dark:text-slate-200">{selectedClassName}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400">Status Sesi Hari Ini</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">
                        {curRecord.check_in_time ? `${curRecord.check_in_time} WIB` : 'Belum absen'} · {curRecord.method || 'Roll Call Guru'}
                      </p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold border ${statusBadgeMap[curRecord.status] || statusBadgeMap['Belum Dicatat']}`}>
                      {curRecord.status || 'Belum Dicatat'}
                    </span>
                  </div>
                </div>

                {/* 5 Summary KPI Cards (Tahfizh Cards Style) */}
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-slate-700/80 dark:bg-[#1B2433]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pertemuan KBM</p>
                    <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">{terlaksanaCount} Sesi</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">dari {displayHistory.length} sesi {studentDetailPeriodFilter}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-300/80 bg-emerald-50/50 p-3.5 shadow-sm dark:border-emerald-800/80 dark:bg-emerald-950/30">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">Hadir</p>
                    <p className="mt-1 text-lg font-black text-emerald-700 dark:text-emerald-300">{hadirCount} Kali</p>
                    <p className="mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{persentase}% kehadiran</p>
                  </div>
                  <div className="rounded-2xl border border-amber-300/80 bg-amber-50/50 p-3.5 shadow-sm dark:border-amber-800/80 dark:bg-amber-950/30">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">Terlambat</p>
                    <p className="mt-1 text-lg font-black text-amber-700 dark:text-amber-300">{terlambatCount} Kali</p>
                    <p className="mt-0.5 text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Tercatat masuk</p>
                  </div>
                  <div className="rounded-2xl border border-sky-300/80 bg-sky-50/50 p-3.5 shadow-sm dark:border-sky-800/80 dark:bg-sky-950/30">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-400">Izin / Sakit</p>
                    <p className="mt-1 text-lg font-black text-sky-700 dark:text-sky-300">{izinSakitCount} Kali</p>
                    <p className="mt-0.5 text-[10px] text-sky-600 dark:text-sky-400 font-semibold">Dengan surat</p>
                  </div>
                  <div className="rounded-2xl border border-rose-300/80 bg-rose-50/50 p-3.5 shadow-sm dark:border-rose-800/80 dark:bg-rose-950/30">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400">Alpha</p>
                    <p className="mt-1 text-lg font-black text-rose-700 dark:text-rose-300">{alphaCount} Kali</p>
                    <p className="mt-0.5 text-[10px] text-rose-600 dark:text-rose-400 font-semibold">Tanpa keterangan</p>
                  </div>
                </div>

                {/* Tingkat Kehadiran Progress Bar */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 dark:border-slate-700/80 dark:bg-[#1B2433]">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300">
                      Tingkat Kehadiran ({periodLabelMap[studentDetailPeriodFilter]}):
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-black">{persentase}%</span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, persentase))}%` }}
                    />
                  </div>
                </div>

                {/* Mobile Cards (lg:hidden) */}
                <div className="space-y-3 lg:hidden">
                  {displayHistory
                    .slice((studentDetailPage - 1) * studentDetailPerPage, studentDetailPage * studentDetailPerPage)
                    .map((item, index) => (
                    <article key={item.meeting} className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                      <header className="flex items-center justify-between bg-emerald-50 px-4 py-3 dark:bg-emerald-950/30">
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white">
                            Pertemuan #{item.meeting} · {item.date}
                          </p>
                          <p className="text-[10px] text-slate-500">{item.topic}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold border ${statusBadgeMap[item.status] || statusBadgeMap['Belum Dicatat']}`}>
                          {item.status}
                        </span>
                      </header>
                      <div className="grid grid-cols-2 gap-px bg-slate-200 text-xs dark:bg-slate-700">
                        {[
                          ['Waktu Absen', item.time || '—'],
                          ['Metode Absensi', item.method || '—'],
                          ['Catatan Guru', item.notes || '—'],
                          ['Validasi', item.status !== 'Belum Terlaksana' && item.status !== 'Belum Dicatat' ? 'Terverifikasi' : '—'],
                        ].map(([label, value]) => (
                          <div key={label} className="min-w-0 bg-white p-3 dark:bg-[#1B2433]">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                            <p className="mt-1 break-words font-semibold text-slate-800 dark:text-slate-100">{value}</p>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                  {displayHistory.length === 0 && (
                    <div className="rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
                      Tidak ada data sesi presensi pada periode ini.
                    </div>
                  )}
                </div>

                {/* Formal Table for Desktop (Tahfizh Grid Style) */}
                <table className="hidden w-full table-fixed border-collapse text-[10px] xl:text-[11px] lg:table [&_td]:!p-2.5 [&_td]:break-words [&_th]:!p-2.5">
                  <colgroup>
                    <col className="w-[4%]" />
                    <col className="w-[12%]" />
                    <col className="w-[28%]" />
                    <col className="w-[12%]" />
                    <col className="w-[10%]" />
                    <col className="w-[12%]" />
                    <col className="w-[16%]" />
                    <col className="w-[6%]" />
                  </colgroup>
                  <thead>
                    <tr className="bg-emerald-100 text-slate-900 dark:bg-emerald-950/60 dark:text-emerald-100">
                      <th className="border border-slate-400 p-2.5 text-center">No</th>
                      <th className="border border-slate-400 p-2.5 text-left">Hari/Tanggal</th>
                      <th className="border border-slate-400 p-2.5 text-left">Materi Pokok & Topik Pembelajaran</th>
                      <th className="border border-slate-400 p-2.5 text-center">Status Kehadiran</th>
                      <th className="border border-slate-400 p-2.5 text-center">Waktu Masuk</th>
                      <th className="border border-slate-400 p-2.5 text-center">Metode Absensi</th>
                      <th className="border border-slate-400 p-2.5 text-left">Catatan Guru</th>
                      <th className="border border-slate-400 p-2.5 text-center">Validasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayHistory
                      .slice((studentDetailPage - 1) * studentDetailPerPage, studentDetailPage * studentDetailPerPage)
                      .map((item, index) => {
                      const d = new Date(item.date)
                      const dayName = !isNaN(d.getTime()) ? new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(d) : 'Hari KBM'
                      const dateFormatted = !isNaN(d.getTime()) ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(d) : item.date

                      return (
                        <tr key={item.meeting} className="h-16 align-middle hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="border border-slate-300 p-3 text-center font-bold dark:border-slate-600">
                            {item.isCurrent ? (
                              <span className="inline-flex rounded-full bg-emerald-700 px-2 py-0.5 text-[10px] font-black text-white">
                                #{item.meeting}
                              </span>
                            ) : (
                              `#${item.meeting}`
                            )}
                          </td>
                          <td className="border border-slate-300 p-3 dark:border-slate-600">
                            <p className="font-bold text-slate-900 dark:text-white">{dayName}</p>
                            <p className="mt-0.5 text-[10px] text-slate-500">{dateFormatted}</p>
                          </td>
                          <td className="border border-slate-300 p-3 dark:border-slate-600">
                            <p className="font-bold text-slate-900 dark:text-white">{item.topic}</p>
                            <p className="mt-0.5 text-[10px] text-slate-500">Pertemuan ke-{item.meeting} · Rombel {selectedClassName}</p>
                          </td>
                          <td className="border border-slate-300 p-3 text-center dark:border-slate-600">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold border ${statusBadgeMap[item.status] || statusBadgeMap['Belum Dicatat']}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="border border-slate-300 p-3 text-center dark:border-slate-600">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{item.time}</p>
                          </td>
                          <td className="border border-slate-300 p-3 text-center dark:border-slate-600">
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {item.method}
                            </span>
                          </td>
                          <td className="border border-slate-300 p-3 dark:border-slate-600 text-slate-600 dark:text-slate-300">
                            {item.notes}
                          </td>
                          <td className="border border-slate-300 p-3 text-center dark:border-slate-600">
                            {item.status !== 'Belum Terlaksana' && item.status !== 'Belum Dicatat' ? (
                              <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-600" aria-label="Terverifikasi" />
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                    {displayHistory.length === 0 && (
                      <tr>
                        <td colSpan={8} className="border border-slate-300 p-8 text-center text-xs text-slate-400 dark:border-slate-600">
                          Tidak ada rekaman sesi presensi pada rentang waktu ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 align-top dark:bg-slate-800/60">
                      <td colSpan="6" className="h-16 border border-slate-300 p-3 dark:border-slate-600">
                        <strong>Catatan Guru Pengampu:</strong>
                        <p className="mt-1 font-normal text-slate-600 dark:text-slate-300">
                          {persentase >= 85
                            ? 'Alhamdulillah, kedisiplinan dan kehadiran siswa sangat memuaskan, konsisten mengikuti pembelajaran aktif.'
                            : persentase >= 75
                            ? 'Kehadiran siswa cukup baik, pertahankan kedisiplinan dan ketepatan waktu masuk kelas.'
                            : 'Perlu peningkatan kedisiplinan kehadiran KBM dan koordinasi aktif bersama wali kelas/orang tua murid.'}
                        </p>
                      </td>
                      <td colSpan="2" className="border border-slate-300 p-3 dark:border-slate-600">
                        <strong>Guru Pengampu:</strong>
                        <p className="mt-1 font-bold text-slate-900 dark:text-white">{teacherName}</p>
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Terverifikasi Digital
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* Pagination Controls in Modal (Maksimal 10 Baris) */}
                {displayHistory.length > studentDetailPerPage && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-900/50">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Menampilkan{' '}
                      <strong className="text-emerald-700 dark:text-emerald-300">
                        {(studentDetailPage - 1) * studentDetailPerPage + 1}
                      </strong>{' '}
                      s.d.{' '}
                      <strong className="text-emerald-700 dark:text-emerald-300">
                        {Math.min(studentDetailPage * studentDetailPerPage, displayHistory.length)}
                      </strong>{' '}
                      dari <strong className="text-slate-900 dark:text-white">{displayHistory.length}</strong> pertemuan
                    </div>
                    <Pagination
                      currentPage={studentDetailPage}
                      totalPages={Math.max(1, Math.ceil(displayHistory.length / studentDetailPerPage))}
                      onPageChange={setStudentDetailPage}
                      sideLayout="full"
                      variant="compact"
                    />
                  </div>
                )}
              </div>

              {/* Footer Modal Style Tahfizh */}
              <footer className="flex shrink-0 flex-wrap items-center justify-between border-t border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#1B2433]">
                <button
                  type="button"
                  onClick={() => handlePrintSingleStudentAttendance(student, studentDetailPeriodFilter)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 text-xs font-bold text-emerald-800 shadow-sm transition hover:bg-emerald-100 hover:border-emerald-400 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900 cursor-pointer"
                >
                  <Printer className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Cetak Lembar Presensi ({studentDetailPeriodFilter.toUpperCase()})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowStudentAttendanceDetailModal(false)
                    setSelectedStudentAttendanceDetail(null)
                    setStudentDetailSessions([])
                  }}
                  className="h-11 rounded-xl border border-slate-200 px-5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Tutup Detail
                </button>
              </footer>
            </div>
          </div>
        )
      })()}

      {/* MODAL DETAIL KEHADIRAN SISWA PADA SESI RIWAYAT */}
      {showHistorySessionModal && selectedHistorySession && (() => {
        const session = selectedHistorySession
        const sessionDate = session.attendance_date ? new Date(session.attendance_date) : null
        const dateFormatted = sessionDate
          ? sessionDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
          : '-'
        const timeRange = session.schedule?.time_start && session.schedule?.time_end
          ? `${session.schedule.time_start.slice(0, 5)} – ${session.schedule.time_end.slice(0, 5)} WIB`
          : '07:30 – 09:00 WIB'

        const attList = session.attendances || []
        const filteredAttList = attList.filter((a) => {
          if (!historySessionStudentSearch) return true
          const q = historySessionStudentSearch.toLowerCase()
          const name = (a.siswa?.full_name || a.siswa?.nama_lengkap || a.siswa?.name || a.student_name || '').toLowerCase()
          const nisn = (a.siswa?.nisn || a.student_nisn || '').toLowerCase()
          return name.includes(q) || nisn.includes(q)
        })

        const hadir = attList.filter((a) => (a.status_hadir || a.status || '').toLowerCase() === 'hadir').length
        const terlambat = attList.filter((a) => (a.status_hadir || a.status || '').toLowerCase() === 'terlambat').length
        const izin = attList.filter((a) => (a.status_hadir || a.status || '').toLowerCase() === 'izin').length
        const sakit = attList.filter((a) => (a.status_hadir || a.status || '').toLowerCase() === 'sakit').length
        const alpa = attList.filter((a) => ['alpa', 'alpha'].includes((a.status_hadir || a.status || '').toLowerCase())).length

        const statusBadgeStyle = {
          hadir: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300',
          terlambat: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300',
          izin: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300',
          sakit: 'bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-950 dark:text-violet-300',
          alpa: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300',
          alpha: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300',
        }

        return (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-sm sm:p-5" role="dialog" aria-modal="true">
            <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#1B2433]">
              {/* Header Modal */}
              <div className="flex shrink-0 items-center justify-between border-b border-slate-200 p-4 sm:p-5 dark:border-slate-700 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      Detail Presensi • Pertemuan ke-{session.meeting_number || 1}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {session.schedule?.subject?.name || 'Mata Pelajaran'} • {session.schedule?.kelas?.name || selectedClassName} • {dateFormatted} ({timeRange})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePrintSingleHistorySession(session)}
                    title="Cetak Berita Acara & Presensi Sesi Ini"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-xs transition hover:bg-emerald-50 hover:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-300 cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Cetak</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadSingleHistorySessionPdf(session)}
                    title="Unduh Lembar Presensi Sesi (PDF)"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-xs transition hover:bg-emerald-50 hover:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-300 cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportSingleHistorySessionCsv(session)}
                    title="Export Presensi Sesi ke Excel (.csv)"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-xs transition hover:bg-emerald-50 hover:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-300 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowHistorySessionModal(false)}
                    className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Sub-header Stats & Search */}
              <div className="shrink-0 border-b border-slate-100 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {hadir} Hadir
                    </span>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {terlambat} Terlambat
                    </span>
                    <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                      {izin} Izin
                    </span>
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-800 dark:bg-violet-950 dark:text-violet-300">
                      {sakit} Sakit
                    </span>
                    <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      {alpa} Alpa
                    </span>
                  </div>

                  <div className="relative min-w-[200px] max-w-xs">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={historySessionStudentSearch}
                      onChange={(e) => setHistorySessionStudentSearch(e.target.value)}
                      placeholder="Cari nama / NISN siswa..."
                      className="h-8 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Table of Students */}
              <div className="flex-1 overflow-y-auto p-4">
                {filteredAttList.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500">
                    {attList.length === 0
                      ? 'Belum ada log kehadiran siswa pada sesi ini.'
                      : 'Tidak ada siswa yang cocok dengan pencarian.'}
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-200 bg-slate-50 font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        <tr>
                          <th className="py-2.5 px-3 w-12 text-center">No</th>
                          <th className="py-2.5 px-3">Nama Siswa</th>
                          <th className="py-2.5 px-3">NISN</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                          <th className="py-2.5 px-3">Waktu Presensi</th>
                          <th className="py-2.5 px-3">Metode</th>
                          <th className="py-2.5 px-3">Catatan / Keterangan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredAttList.map((item, idx) => {
                          const rawStatus = (item.status_hadir || item.status || 'Belum Dicatat').toLowerCase()
                          const statusClass = statusBadgeStyle[rawStatus] || 'bg-slate-100 text-slate-700 border-slate-300'
                          const studentName = item.siswa?.full_name || item.siswa?.nama_lengkap || item.siswa?.name || item.student_name || 'Siswa'
                          const nisn = item.siswa?.nisn || item.student_nisn || '-'
                          const waktu = item.waktu_presensi
                            ? new Date(item.waktu_presensi).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
                            : (rawStatus === 'hadir' ? '07:15 WIB' : '-')

                          return (
                            <tr key={item.id || idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                              <td className="py-2.5 px-3 text-center font-semibold text-slate-400">{idx + 1}</td>
                              <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{studentName}</td>
                              <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{nisn}</td>
                              <td className="py-2.5 px-3 text-center">
                                <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold capitalize ${statusClass}`}>
                                  {item.status_hadir || item.status || 'Belum Dicatat'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{waktu}</td>
                              <td className="py-2.5 px-3 text-slate-500">{item.recorded_method || 'Presensi KBM'}</td>
                              <td className="py-2.5 px-3 text-slate-500">{item.keterangan || '-'}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Footer Modal */}
              <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-200 p-4 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePrintSingleHistorySession(session)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:from-emerald-700 hover:to-teal-700 cursor-pointer"
                  >
                    <Printer className="h-4 w-4" /> Cetak Lembar Presensi Sesi
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportSingleHistorySessionCsv(session)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-white px-3.5 py-2 text-xs font-bold text-emerald-700 shadow-xs hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-300 cursor-pointer"
                  >
                    <Download className="h-4 w-4" /> Export Excel (.csv)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowHistorySessionModal(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* DEDICATED PRESENSI SESSION MODAL POP-UP */}
      {/* MODAL POPUP PRESENSI PEMBELAJARAN SISWA */}
      <AppModal
        isOpen={showPresensiModal}
        onClose={() => setShowPresensiModal(false)}
        title="Presensi Pembelajaran Siswa"
        description={`${selectedClassName?.startsWith('Semua') ? selectedClassName : `Rombel ${selectedClassName}`} • Mapel: ${presensiModalSchedule?.subject?.name || presensiModalSchedule?.subject?.nama_mapel || getScheduleSubject(getCurrentSchedule() || {}) || 'Mata Pelajaran'} • Jam Pelajaran: ${getScheduleLessonHours(presensiModalSchedule)} • Waktu Sekarang: ${formattedLiveTime}`}
        icon={UserCheck}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          {/* BANNER REALTIME: WAKTU SEKARANG, JAM PELAJARAN & FILTER ROMBEL */}
          <div className="rounded-2xl border-2 border-emerald-500/25 bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-emerald-50/80 p-3.5 sm:p-4 shadow-sm dark:border-emerald-800/60 dark:bg-slate-900/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/15 pb-3 dark:border-emerald-800/40">
              {/* Jam Sekarang (Realtime Live Clock) */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xs">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Jam Sekarang:</span>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-sm sm:text-base font-black text-emerald-950 dark:text-white tracking-tight">
                      {formattedLiveTime}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hidden md:inline">
                      ({formattedLiveDate})
                    </span>
                  </div>
                </div>
              </div>

              {/* Jam Pelajaran (Lesson Schedule Hours) */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white shadow-xs">
                  <CalendarRange className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Jam Pelajaran:</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${getLiveLessonStatus(presensiModalSchedule).color}`}>
                      {getLiveLessonStatus(presensiModalSchedule).label}
                    </span>
                  </div>
                  <span className="font-mono text-sm sm:text-base font-black text-slate-900 dark:text-emerald-300 tracking-tight">
                    {getScheduleLessonHours(presensiModalSchedule)}
                  </span>
                </div>
              </div>
            </div>

            {/* Baris Kedua: Filter Rombel & Mata Pelajaran */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <label htmlFor="presensi-modal-rombel-select" className="text-xs font-extrabold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Filter Rombel:</span>
                </label>
                <div className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold border border-emerald-300/80 dark:border-emerald-700 shadow-xs">
                  <Users className="h-3.5 w-3.5 text-emerald-600" />
                  <select
                    id="presensi-modal-rombel-select"
                    value={selectedClass}
                    onChange={(e) => handleModalClassChange(e.target.value)}
                    className="bg-transparent font-extrabold text-xs text-emerald-950 dark:text-emerald-100 outline-none cursor-pointer pr-1"
                  >
                    <option value="all" className="dark:bg-slate-900 text-slate-900 dark:text-white">
                      Semua Rombel
                    </option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                        {c.nama_kelas || c.name} {c.kode_kelas ? `· ${c.kode_kelas}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {(() => {
                    const count = (selectedClass && selectedClass !== 'all')
                      ? students.filter((st) => {
                          const sCid = st.kelas_id || st.class_id || st.kelas?.id
                          return !!sCid && String(sCid) === String(selectedClass)
                        }).length
                      : students.length
                    return `(${count} Siswa Terdaftar)`
                  })()}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Mata Pelajaran:</span>
                <span className="rounded-lg bg-white/90 dark:bg-slate-800/90 px-3 py-1 font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-700 shadow-xs">
                  {presensiModalSchedule?.subject?.name || presensiModalSchedule?.subject?.nama_mapel || getScheduleSubject(getCurrentSchedule() || {}) || 'Mata Pelajaran Aktif'}
                </span>

                {/* Indikator Status Auto-Save Real-Time */}
                <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold shadow-2xs border transition-all ${
                  autoSaveStatus === 'saving'
                    ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700'
                    : autoSaveStatus === 'error'
                    ? 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700'
                    : 'bg-emerald-100/90 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700'
                }`}>
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${autoSaveStatus === 'saving' ? 'bg-amber-400' : autoSaveStatus === 'error' ? 'bg-rose-400' : 'bg-emerald-400'} opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${autoSaveStatus === 'saving' ? 'bg-amber-500' : autoSaveStatus === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                  </span>
                  <span>
                    {autoSaveStatus === 'saving'
                      ? 'Menyimpan Otomatis...'
                      : autoSaveStatus === 'error'
                      ? 'Gagal Menyimpan'
                      : 'Auto-Save Aktif: Tersimpan ke Server'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex overflow-x-auto border-b border-slate-200 text-xs font-bold dark:border-slate-800">
            {[
              ['presensi', 'Data Presensi'],
              ['verifikasi', 'Verifikasi Guru'],
              ['riwayat', 'Riwayat Sesi'],
              ['catatan', 'Catatan'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setAttendanceCenterTab(id)}
                className={`shrink-0 border-b-2 px-4 pb-2.5 font-extrabold transition ${
                  attendanceCenterTab === id
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {attendanceCenterTab === 'presensi' && (
            <>
              {/* Metode Absensi */}
              <div>
                <h4 className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Metode Absensi
                </h4>
                <div className="grid gap-2.5 sm:grid-cols-3">
                  {[
                    { id: 'rollcall', label: 'Roll Call Guru', description: 'Checklist manual oleh guru', icon: UserCheck },
                    { id: 'qr', label: 'QR Code Kartu', description: 'Scan QR code kartu siswa', icon: QrCode },
                    { id: 'rfid', label: 'RFID Tap', description: 'Tap kartu RFID siswa', icon: Radio },
                  ].map((method) => {
                    const Icon = method.icon
                    const active = selectedMethod === method.id
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => {
                          setSelectedMethod(method.id)
                          setScanInput('')
                          setLastScannedResult(null)
                          if (method.id !== 'rollcall') setTimeout(() => scanInputRef.current?.focus(), 50)
                        }}
                        className={`flex items-start gap-3 rounded-2xl border p-3 text-left transition ${
                          active
                            ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/30 dark:bg-emerald-950/40 dark:border-emerald-700'
                            : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/60'
                        }`}
                      >
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          active ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <strong className="block text-xs font-bold text-slate-900 dark:text-white">{method.label}</strong>
                          <span className="text-[10px] font-semibold text-slate-400">{method.description}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {selectedMethod !== 'rollcall' && (
                  <div className={`mt-3 space-y-2.5 rounded-2xl border p-3.5 ${
                    selectedMethod === 'qr' ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-950/30' : 'border-sky-200 bg-sky-50/60 dark:border-sky-900/60 dark:bg-sky-950/30'
                  }`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {selectedMethod === 'qr' ? <QrCode className="h-4 w-4 text-emerald-600" /> : <Wifi className="h-4 w-4 animate-pulse text-sky-600" />}
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {selectedMethod === 'qr' ? 'Pemindai QR Code Kartu Siswa' : 'Pembaca RFID Reader Standby'}
                        </span>
                      </div>
                      {selectedMethod === 'qr' ? (
                        <button
                          type="button"
                          onClick={openQrCamera}
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 shadow-sm transition"
                        >
                          <Camera className="h-3.5 w-3.5" /> Live Kamera
                        </button>
                      ) : (
                        <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-900 dark:text-sky-300">
                          ● Ready to Tap
                        </span>
                      )}
                    </div>
                    <form onSubmit={handleCardScan} className="flex gap-2">
                      <input
                        ref={scanInputRef}
                        value={scanInput}
                        onChange={(event) => {
                          const val = event.target.value
                          setScanInput(val)
                          if (val.trim()) {
                            const matched = findStudentByCardCode(val)
                            if (matched) {
                              identifyStudentCard(val, selectedMethod)
                            }
                          }
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault()
                            if (scanInput.trim()) {
                              identifyStudentCard(scanInput, selectedMethod)
                            }
                          }
                        }}
                        autoFocus
                        autoComplete="off"
                        placeholder={selectedMethod === 'qr' ? 'Arahkan QR kartu siswa ke scanner / USB scanner (Otomatis Hadir)...' : 'Tap kartu RFID siswa pada reader (Otomatis Hadir)...'}
                        className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                      {scanProcessing && (
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl animate-pulse">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Auto-Hadir...
                        </div>
                      )}
                    </form>
                    {lastScannedResult && (
                      <div className={`rounded-xl px-3 py-2 text-xs font-semibold ${lastScannedResult.error ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {lastScannedResult.error ? lastScannedResult.message : `${lastScannedResult.student?.nama_lengkap || lastScannedResult.student?.full_name} berhasil dicatat.`}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action & Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                <div className="flex items-center gap-2 flex-wrap">
                  {(() => {
                    const classScopedStudents = (selectedClass && selectedClass !== 'all')
                      ? students.filter((st) => {
                          const sCid = st.kelas_id || st.class_id || st.kelas?.id
                          return !!sCid && String(sCid) === String(selectedClass)
                        })
                      : students
                    const presentCount = classScopedStudents.filter((st) => (attendanceData[st.id]?.status || 'Belum Dicatat') === 'Hadir').length
                    return (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-extrabold text-xs rounded-full">
                        {presentCount} / {classScopedStudents.length} Hadir
                      </span>
                    )
                  })()}
                  <button
                    type="button"
                    onClick={markAllStudentsPresent}
                    className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition"
                  >
                    Tandai Semua Hadir
                  </button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    <Filter className="h-3 w-3 text-emerald-600" />
                    <span className="text-[11px] text-slate-400 font-medium">Rombel:</span>
                    <select
                      value={selectedClass}
                      onChange={(e) => handleModalClassChange(e.target.value)}
                      className="bg-transparent text-xs font-extrabold text-emerald-900 dark:text-emerald-300 outline-none cursor-pointer"
                    >
                      <option value="all" className="dark:bg-slate-900 text-slate-900 dark:text-white">
                        Semua Rombel
                      </option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                          {c.nama_kelas || c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="relative min-w-[180px]">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      value={attendanceSearch}
                      onChange={(e) => setAttendanceSearch(e.target.value)}
                      placeholder="Cari nama siswa / NIS..."
                      className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Data Table Siswa */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-[#1B2433]">
                <div className="overflow-x-auto max-h-72">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                        <th className="p-3 w-10">No</th>
                        <th className="p-3">Nama Siswa</th>
                        <th className="p-3">NIS / NISN</th>
                        <th className="p-3 text-center">Status Kehadiran Siswa</th>
                        <th className="p-3">Waktu & Metode</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {students
                        .filter((st) => {
                          if (selectedClass && selectedClass !== 'all') {
                            const sCid = st.kelas_id || st.class_id || st.kelas?.id
                            if (!sCid || String(sCid) !== String(selectedClass)) return false
                          }
                          if (!attendanceSearch.trim()) return true
                          const q = attendanceSearch.toLowerCase()
                          return (st.nama_lengkap || '').toLowerCase().includes(q) || (st.nis || '').includes(q)
                        })
                        .map((st, idx) => {
                          const currentStatus = attendanceData[st.id]?.status || 'Belum Dicatat'
                          const currentRecord = attendanceData[st.id] || {}
                          return (
                            <tr key={st.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                              <td className="p-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                              <td className="p-3 font-bold text-slate-900 dark:text-white">
                                {st.nama_lengkap}
                              </td>
                              <td className="p-3 text-slate-500 font-mono text-[11px]">
                                {st.nis || st.nisn || '-'}
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  {[
                                    { id: 'Belum Dicatat', tone: 'bg-slate-500 text-white' },
                                    { id: 'Hadir', tone: 'bg-emerald-600 text-white' },
                                    { id: 'Terlambat', tone: 'bg-amber-500 text-white' },
                                    { id: 'Izin', tone: 'bg-blue-600 text-white' },
                                    { id: 'Sakit', tone: 'bg-purple-600 text-white' },
                                    { id: 'Alpha', tone: 'bg-rose-600 text-white' },
                                  ].map((option) => (
                                    <button
                                      key={option.id}
                                      type="button"
                                      onClick={() => markStudentAttendance(st, selectedMethod === 'qr' ? 'QR Code Kartu Siswa' : selectedMethod === 'rfid' ? 'RFID Kartu Siswa' : 'Roll Call Guru', option.id)}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                                        currentStatus === option.id
                                          ? `${option.tone} shadow-sm ring-2 ring-emerald-500/40`
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                      }`}
                                    >
                                      {option.id}
                                    </button>
                                  ))}
                                </div>
                              </td>
                              <td className="p-3 text-[11px] text-slate-500">
                                {currentRecord.check_in_time ? (
                                  <span>{currentRecord.check_in_time} • {currentRecord.method || 'Roll Call'}</span>
                                ) : (
                                  <span className="text-slate-400 italic">Belum dicatat</span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {attendanceCenterTab === 'verifikasi' && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-3 dark:border-emerald-800 dark:bg-emerald-950/30">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-600 text-white rounded-xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Verifikasi Kehadiran oleh Guru Pengajar</h4>
                  <p className="text-xs text-slate-500">Pengajar: <strong>{teacherName}</strong> • Rombel {selectedClassName}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Seluruh data kehadiran pada sesi pembelajaran ini telah divalidasi. Menyimpan presensi akan menyinkronkan status ke server akademik & jurnal mengajar harian.
              </p>
            </div>
          )}

          {attendanceCenterTab === 'riwayat' && renderAttendanceHistorySection(true)}

          {attendanceCenterTab === 'catatan' && (
            <div className="space-y-3 text-xs">
              <label className="font-bold block text-slate-700 dark:text-slate-200">Catatan Khusus Presensi Pembelajaran</label>
              <textarea
                rows={3}
                placeholder="Tambahkan catatan khusus seperti izin kegiatan sekolah, dispensasi, dsb..."
                className="w-full p-3 border rounded-xl dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-100"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowPresensiModal(false)}
              className="px-4 py-2.5 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                handleSaveAttendance()
                setShowPresensiModal(false)
              }}
              className="px-5 py-2.5 bg-[#0E5C44] hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition"
            >
              <CheckCircle2 className="w-4 h-4" /> Simpan Presensi Pembelajaran
            </button>
          </div>
        </div>
      </AppModal>

      {/* DETAIL JURNAL TAHFIZH MINGGUAN */}
      {showTahfizhDetail && tahfizhDetailStudent && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-sm sm:p-5" role="dialog" aria-modal="true" aria-labelledby="tahfizh-detail-title">
          <div className="flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#1B2433]">
            <header className="flex shrink-0 flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
              <div className="flex min-w-0 items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"><BookOpen className="h-5 w-5" /></div><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Lembar Kegiatan Tahfizh</p><h2 id="tahfizh-detail-title" className="truncate text-lg font-black text-slate-900 dark:text-white">{tahfizhDetailStudent.nama_lengkap}</h2><p className="text-xs text-slate-500">{tahfizhDetailStudent.nis || tahfizhDetailStudent.nisn || 'NIS belum tersedia'} · {selectedClassName}</p></div></div>
              <div className="flex items-center gap-2"><button type="button" onClick={() => setTahfizhWeekOffset((value) => value - 1)} aria-label="Minggu sebelumnya" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"><ChevronLeft className="h-4 w-4" /></button><div className="min-w-44 text-center"><p className="text-[10px] font-bold uppercase text-slate-400">Periode</p><p className="text-xs font-bold text-slate-800 dark:text-white">{new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(tahfizhWeekRows[0].date)} – {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(tahfizhWeekRows[6].date)}</p></div><button type="button" onClick={() => setTahfizhWeekOffset((value) => Math.min(value + 1, 0))} disabled={tahfizhWeekOffset >= 0} aria-label="Minggu berikutnya" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"><ChevronRight className="h-4 w-4" /></button><button type="button" onClick={() => setShowTahfizhDetail(false)} aria-label="Tutup detail" className="ml-1 inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-5 w-5" /></button></div>
            </header>
            <div className="min-h-0 overflow-y-auto p-4 sm:p-5">
              <div className="space-y-3 lg:hidden">
                {tahfizhWeekRows.map(({ date, dateKey, log }, index) => (
                  <article key={dateKey} className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                    <header className="flex items-center justify-between bg-emerald-50 px-4 py-3 dark:bg-emerald-950/30"><div><p className="text-sm font-black text-slate-900 dark:text-white">{index + 1}. {new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(date)}</p><p className="text-[10px] text-slate-500">{new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(date)}</p></div>{log ? <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white">Terisi</span> : <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-300">Kosong</span>}</header>
                    <div className="grid grid-cols-2 gap-px bg-slate-200 text-xs dark:bg-slate-700">
                      {[['Tilawah', log?.tilawah_text || '—'], ['Baris Tilawah', log?.tilawah_baris || '—'], ['Hafalan Baru', log?.hafalan_surah_name ? `${log.hafalan_surah_name}, ayat ${log.hafalan_ayah_start}–${log.hafalan_ayah_end}` : '—'], ['Juz / Jumlah', log ? `Juz ${log.metadata?.juz || '-'} · ${log.hafalan_baris || 0} ayat` : '—'], ['Murajaah', log?.murajaah_text || '—'], ['Lembar', log?.murajaah_lembar || '—'], ['Catatan', log?.notes_teacher || '—'], ['Tanda tangan', log?.signature_teacher ? 'Sudah ditandatangani' : '—']].map(([label, value]) => <div key={label} className="min-w-0 bg-white p-3 dark:bg-[#1B2433]"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 break-words font-semibold text-slate-800 dark:text-slate-100">{value}</p></div>)}
                    </div>
                  </article>
                ))}
              </div>
              <table className="hidden w-full table-fixed border-collapse text-[10px] xl:text-[11px] lg:table [&_td]:!p-2 [&_td]:break-words [&_th]:!p-2">
                <colgroup><col className="w-[3.5%]" /><col className="w-[11%]" /><col className="w-[10%]" /><col className="w-[5%]" /><col className="w-[17%]" /><col className="w-[7%]" /><col className="w-[11%]" /><col className="w-[6%]" /><col className="w-[20%]" /><col className="w-[9.5%]" /></colgroup>
                <thead><tr className="bg-emerald-100 text-slate-900 dark:bg-emerald-950/60 dark:text-emerald-100"><th className="border border-slate-400 p-2.5">No</th><th className="border border-slate-400 p-2.5 text-left">Hari/Tanggal</th><th className="border border-slate-400 p-2.5">Tilawah</th><th className="border border-slate-400 p-2.5">Baris</th><th className="border border-slate-400 p-2.5">Hafalan Baru</th><th className="border border-slate-400 p-2.5">Baris/Ayat</th><th className="border border-slate-400 p-2.5">Murajaah</th><th className="border border-slate-400 p-2.5">Lembar</th><th className="border border-slate-400 p-2.5">Catatan</th><th className="border border-slate-400 p-2.5">Ttd</th></tr></thead>
                <tbody>{tahfizhWeekRows.map(({ date, dateKey, log }, index) => <tr key={dateKey} className="h-24 align-top hover:bg-slate-50 dark:hover:bg-slate-800/40"><td className="border border-slate-300 p-3 text-center font-bold dark:border-slate-600">{index + 1}</td><td className="border border-slate-300 p-3 dark:border-slate-600"><p className="font-bold text-slate-900 dark:text-white">{new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(date)}</p><p className="mt-1 text-[10px] text-slate-500">{new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)}</p></td><td className="border border-slate-300 p-3 dark:border-slate-600">{log?.tilawah_text || '—'}</td><td className="border border-slate-300 p-3 text-center dark:border-slate-600">{log?.tilawah_baris || '—'}</td><td className="border border-slate-300 p-3 dark:border-slate-600">{log?.hafalan_surah_name ? <><p className="font-bold">{log.hafalan_surah_name}</p><p className="mt-1 text-[10px] text-slate-500">Ayat {log.hafalan_ayah_start}–{log.hafalan_ayah_end} · Juz {log.metadata?.juz || '-'}</p></> : '—'}</td><td className="border border-slate-300 p-3 text-center dark:border-slate-600">{log?.hafalan_baris || (log ? `${Number(log.hafalan_ayah_end) - Number(log.hafalan_ayah_start) + 1} ayat` : '—')}</td><td className="border border-slate-300 p-3 dark:border-slate-600">{log?.murajaah_text || '—'}</td><td className="border border-slate-300 p-3 text-center dark:border-slate-600">{log?.murajaah_lembar || '—'}</td><td className="border border-slate-300 p-3 dark:border-slate-600">{log?.notes_teacher || '—'}</td><td className="border border-slate-300 p-3 text-center dark:border-slate-600">{log?.signature_teacher ? <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-600" aria-label="Sudah ditandatangani" /> : '—'}</td></tr>)}</tbody>
                <tfoot><tr className="bg-slate-50 align-top dark:bg-slate-800/60"><td colSpan="8" className="h-20 border border-slate-300 p-3 dark:border-slate-600"><strong>Catatan Guru:</strong><p className="mt-1 font-normal text-slate-600 dark:text-slate-300">{tahfizhWeekRows.map(({ log }) => log?.notes_teacher).filter(Boolean).at(-1) || 'Belum ada catatan guru pada minggu ini.'}</p></td><td colSpan="2" className="border border-slate-300 p-3 dark:border-slate-600"><strong>Guru:</strong><p className="mt-2 font-normal">{teacherName}</p></td></tr><tr className="bg-slate-50 align-top dark:bg-slate-800/60"><td colSpan="8" className="h-20 border border-slate-300 p-3 dark:border-slate-600"><strong>Catatan Orang Tua:</strong><p className="mt-1 font-normal text-slate-600 dark:text-slate-300">{tahfizhWeekRows.map(({ log }) => log?.notes_parent).filter(Boolean).at(-1) || 'Belum ada catatan orang tua pada minggu ini.'}</p></td><td colSpan="2" className="border border-slate-300 p-3 dark:border-slate-600"><strong>Ttd Orang Tua:</strong><p className="mt-2 font-normal">{tahfizhWeekRows.some(({ log }) => log?.signature_parent) ? 'Sudah ditandatangani' : 'Belum ditandatangani'}</p></td></tr></tfoot>
              </table>
            </div>
            <footer className="flex shrink-0 justify-end border-t border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#1B2433]"><button type="button" onClick={() => setShowTahfizhDetail(false)} className="h-11 rounded-xl border border-slate-200 px-5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Tutup Detail</button></footer>
          </div>
        </div>
      )}

      {/* CREATE / EDIT / DELETE MODALS */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
          <div className={
            modalType === 'materi'
              ? 'bg-white dark:bg-[#1B2433] w-full max-w-2xl rounded-[24px] shadow-2xl border border-slate-200/90 dark:border-slate-800 relative my-auto max-h-[92vh] overflow-hidden p-0 flex flex-col'
              : [
                  'bg-white dark:bg-[#1B2433] w-full rounded-[22px] p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative my-auto max-h-[92vh] overflow-y-auto space-y-4',
                  modalType === 'tugas' ? 'max-w-3xl' : 'max-w-lg',
                ].join(' ')
          }>
            {modalType !== 'materi' && (
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                  if (modalType === 'tugas') {
                    setSoalList([]);
                    resetSoalForm();
                  }
                }}
                className="sticky top-0 float-right z-20 -mr-1 -mt-1 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition bg-white/80 dark:bg-[#1B2433]/80 backdrop-blur-sm shadow-sm"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {modalType === 'delete-confirm' ? (
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Konfirmasi Hapus Data</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Apakah Anda yakin ingin menghapus data <strong>{deleteTarget?.title}</strong>? Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleExecuteDelete}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md"
                  >
                    Ya, Hapus Data
                  </button>
                </div>
              </div>
            ) : modalType === 'materi' ? (
              <MateriModalForm
                initialData={materiForm}
                editingId={editingId}
                saving={savingMaterial}
                onSave={handleSaveMateri}
                onClose={() => { setShowModal(false); setEditingId(null); }}
              />
            ) : (
              <>
                <h3 className="text-base font-bold uppercase tracking-wider text-[#0E5C44] dark:text-emerald-400 flex items-center gap-2">
                  <Plus className="w-5 h-5" /> {editingId ? 'Edit' : 'Form Input'} {modalType}
                </h3>

                {modalType === 'tugas' && (
                  <form onSubmit={handleSaveTugas} className="space-y-3.5 text-xs">
                    {/* Format Selector: Tugas PR vs Kuis CBT */}
                    <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setTugasForm({ ...tugasForm, jenis_tugas: 'tugas' })}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          tugasForm.jenis_tugas !== 'quiz'
                            ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm border border-emerald-200 dark:border-emerald-800'
                            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Penugasan / PR Harian
                      </button>
                      <button
                        type="button"
                        onClick={() => setTugasForm({ ...tugasForm, jenis_tugas: 'quiz', tipe_tugas: 'online' })}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          tugasForm.jenis_tugas === 'quiz'
                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm font-black'
                            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        Kuis Interaktif (Style CBT)
                      </button>
                    </div>

                    {/* Banner Info Kuis CBT */}
                    {tugasForm.jenis_tugas === 'quiz' && (
                      <div className="p-3 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/40 dark:to-indigo-950/40 border border-violet-200 dark:border-violet-800/60 space-y-2">
                        <div className="flex items-center gap-2 text-violet-800 dark:text-violet-300 font-bold text-xs">
                          <Zap className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                          <span>Mode Kuis CBT Interaktif Terpadu</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                          Siswa akan mengerjakan kuis dalam antarmuka interaktif ala ujian CBT (dilengkapi timer, nomor soal, dan pilihan opsi A/B/C/D). Soal <strong>Pilihan Ganda & Benar/Salah</strong> akan dinilai <strong>otomatis oleh sistem</strong> begitu kuis dikumpulkan dan langsung terkirim ke portal/aplikasi orang tua!
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-violet-900 dark:text-violet-200 mb-1">
                              ⏱️ Durasi Pengerjaan Kuis (Menit)
                            </label>
                            <input
                              type="number"
                              min="5"
                              max="180"
                              value={tugasForm.durasi_menit || 30}
                              onChange={(e) => setTugasForm({ ...tugasForm, durasi_menit: Number(e.target.value) })}
                              className="h-9 w-full rounded-xl border border-violet-300 bg-white px-3 text-xs font-bold text-violet-900 dark:border-violet-700 dark:bg-slate-800 dark:text-violet-200 outline-none focus:ring-2 focus:ring-violet-500"
                              placeholder="30"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-violet-900 dark:text-violet-200 mb-1">
                              🎯 Nilai KKM Kuis (0-100)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={tugasForm.nilai_kkm || 75}
                              onChange={(e) => setTugasForm({ ...tugasForm, nilai_kkm: Number(e.target.value) })}
                              className="h-9 w-full rounded-xl border border-violet-300 bg-white px-3 text-xs font-bold text-violet-900 dark:border-violet-700 dark:bg-slate-800 dark:text-violet-200 outline-none focus:ring-2 focus:ring-violet-500"
                              placeholder="75"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">Rombel / Kelas <span className="text-rose-500">*</span></label>
                        <select
                          value={tugasForm.class_id || getCurrentClassId()}
                          onChange={(e) => {
                            const newClassId = e.target.value
                            const pool = schedules.length > 0 ? schedules : allTeacherSchedules
                            const matchSch = pool.find((s) => String(s.class_id || s.kelas_id || s.kelas?.id || s.class?.id) === String(newClassId))
                            setTugasForm({
                              ...tugasForm,
                              class_id: newClassId,
                              subject_id: matchSch?.subject_id || matchSch?.subject?.id || tugasForm.subject_id || '',
                            })
                          }}
                          className="h-11 w-full border rounded-xl bg-white px-3 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-semibold"
                        >
                          {classes.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nama_kelas || c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">Mata Pelajaran <span className="text-rose-500">*</span></label>
                        <select
                          value={tugasForm.subject_id || getCurrentSubjectId()}
                          onChange={(e) => setTugasForm({ ...tugasForm, subject_id: e.target.value })}
                          className="h-11 w-full border rounded-xl bg-white px-3 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-semibold"
                        >
                          {(() => {
                            const pool = schedules.length > 0 ? schedules : allTeacherSchedules
                            const activeClassId = tugasForm.class_id || getCurrentClassId()
                            const filtered = pool.filter((s) =>
                              !activeClassId || String(s.class_id || s.kelas_id || s.kelas?.id || s.class?.id) === String(activeClassId)
                            )
                            if (filtered.length > 0) {
                              return filtered.map((s) => (
                                <option key={s.id} value={s.subject_id || s.subject?.id}>
                                  {s.subject?.name || s.subject?.nama_mapel || 'Mata Pelajaran'}
                                </option>
                              ))
                            }
                            const fallbackId = getCurrentSubjectId()
                            const fallbackLabel = getScheduleSubject(getCurrentSchedule() || {})
                            return <option value={fallbackId}>{fallbackLabel || 'Mata Pelajaran'}</option>
                          })()}
                        </select>
                      </div>
                    </div>

                    {/* Multi-Materi Selection Section */}
                    <div className="rounded-2xl border border-dashed border-emerald-300 dark:border-emerald-800/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:from-emerald-950/25 dark:via-teal-950/15 dark:to-emerald-950/25 p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between flex-wrap gap-1.5">
                        <label className="font-bold text-slate-800 dark:text-emerald-300 flex items-center gap-1.5 text-xs">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                          Tautkan Materi Belajar <span className="text-slate-400 font-normal">(Bisa Lebih dari Satu)</span>
                          {(tugasForm.materi_ids || []).length > 0 && (
                            <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px]">
                              {(tugasForm.materi_ids || []).length} Materi Dipilih
                            </span>
                          )}
                        </label>
                        {(tugasForm.materi_ids || []).length > 0 && (
                          <button
                            type="button"
                            onClick={() => setTugasForm((prev) => ({ ...prev, materi_id: '', materi_ids: [] }))}
                            className="text-[10px] text-rose-600 hover:text-rose-700 hover:underline font-semibold"
                          >
                            ✕ Hapus Semua Tautan
                          </button>
                        )}
                      </div>

                      {/* Dropdown to add another material */}
                      {(() => {
                        const activeClass = tugasForm.class_id || getCurrentClassId()
                        const activeSubj = tugasForm.subject_id || getCurrentSubjectId()
                        const currentIds = tugasForm.materi_ids || (tugasForm.materi_id ? [tugasForm.materi_id] : [])
                        const availableMaterials = materials.filter((m) => {
                          const mClass = m.class_id || m.kelas_id || m.modul_ajar?.kelas_id
                          const mSubj = m.subject_id || m.mata_pelajaran_id || m.modul_ajar?.mata_pelajaran_id
                          const matchesClass = !activeClass || !mClass || String(mClass) === String(activeClass)
                          const matchesSubj = !activeSubj || !mSubj || String(mSubj) === String(activeSubj)
                          const isAlreadySelected = currentIds.includes(m.id)
                          return matchesClass && matchesSubj && !isAlreadySelected
                        })

                        return (
                          <select
                            value=""
                            onChange={(e) => {
                              const newId = e.target.value
                              if (!newId) return
                              const chosen = materials.find((m) => String(m.id) === String(newId))
                              setTugasForm((prev) => {
                                const prevIds = Array.isArray(prev.materi_ids) ? prev.materi_ids : (prev.materi_id ? [prev.materi_id] : [])
                                const updatedIds = prevIds.includes(newId) ? prevIds : [...prevIds, newId]
                                return {
                                  ...prev,
                                  materi_id: updatedIds[0] || newId,
                                  materi_ids: updatedIds,
                                  judul: !prev.judul || prev.judul.startsWith('Latihan: ') || prev.judul.trim() === ''
                                    ? (chosen ? `Latihan: ${chosen.judul}` : prev.judul)
                                    : prev.judul,
                                  instruksi: !prev.instruksi || prev.instruksi.includes('Silakan pelajari materi') || prev.instruksi.trim() === ''
                                    ? (chosen
                                        ? (chosen.ringkasan
                                            ? `Silakan pelajari materi "${chosen.judul}" (${chosen.ringkasan}) lalu kerjakan penugasan ini.`
                                            : `Pelajari materi "${chosen.judul}" lalu selesaikan evaluasi pemahaman berikut.`)
                                        : prev.instruksi)
                                    : prev.instruksi,
                                }
                              })
                            }}
                            className="h-10 w-full border rounded-xl bg-white px-3 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-medium text-xs text-slate-700 dark:text-slate-200 cursor-pointer focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                          >
                            <option value="">
                              {availableMaterials.length === 0 && currentIds.length > 0
                                ? '✓ Seluruh materi pada kelas & mapel ini telah ditautkan'
                                : '+ Pilih Materi Belajar untuk Ditambahkan...'}
                            </option>
                            {availableMaterials.map((m) => (
                              <option key={m.id} value={m.id}>
                                📖 {m.urutan ? `[Pekan ${String(m.urutan).padStart(2, '0')}] ` : ''}{m.judul} ({m.status === 'published' ? 'Published' : 'Draft'})
                              </option>
                            ))}
                          </select>
                        )
                      })()}

                      {/* Selected Materials List / Badges */}
                      {(() => {
                        const currentIds = tugasForm.materi_ids || (tugasForm.materi_id ? [tugasForm.materi_id] : [])
                        const selectedList = currentIds
                          .map((id) => materials.find((m) => String(m.id) === String(id)) || { id, judul: 'Materi Pembelajaran' })

                        if (selectedList.length === 0) {
                          return (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                              Belum ada materi pembelajaran yang ditautkan. Tugas ini bersifat mandiri tanpa rujukan modul materi khusus.
                            </p>
                          )
                        }

                        return (
                          <div className="space-y-1.5 pt-1">
                            <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                              Daftar Materi Belajar Tertaut ({selectedList.length}):
                            </p>
                            <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                              {selectedList.map((m, idx) => (
                                <div
                                  key={m.id || idx}
                                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-900/60 shadow-xs text-xs"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-5 h-5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                                      {idx + 1}
                                    </span>
                                    <div className="min-w-0">
                                      <p className="font-bold text-slate-800 dark:text-slate-100 truncate text-xs">
                                        {m.judul}
                                      </p>
                                      {m.ringkasan && (
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                          {m.ringkasan}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {m.status && (
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${m.status === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                                        {m.status === 'published' ? 'Published' : 'Draft'}
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setTugasForm((prev) => {
                                          const prevIds = Array.isArray(prev.materi_ids) ? prev.materi_ids : (prev.materi_id ? [prev.materi_id] : [])
                                          const filtered = prevIds.filter((id) => String(id) !== String(m.id))
                                          return {
                                            ...prev,
                                            materi_id: filtered[0] || '',
                                            materi_ids: filtered,
                                          }
                                        })
                                      }}
                                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                                      title="Lepas materi ini dari tugas"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <p className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              Terhubung ke {selectedList.length} materi. Siswa akan mendapatkan tombol rujukan langsung ke seluruh materi ini di aplikasi mobile & portal.
                            </p>
                          </div>
                        )
                      })()}
                    </div>

                    <div>
                      <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">Judul Tugas <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={tugasForm.judul}
                        onChange={(e) => setTugasForm({ ...tugasForm, judul: e.target.value })}
                        className="h-11 w-full p-2.5 border rounded-xl dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        placeholder="Contoh: Latihan Soal Bab 1 Mufradat Harian"
                      />
                    </div>

                    <div>
                      <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">Instruksi / Petunjuk Pengerjaan <span className="text-rose-500">*</span></label>
                      <textarea
                        rows={2}
                        required
                        value={tugasForm.instruksi}
                        onChange={(e) => setTugasForm({ ...tugasForm, instruksi: e.target.value })}
                        className="w-full p-2.5 border rounded-xl dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        placeholder="Petunjuk umum pengerjaan, buku rujukan, atau arahan waktu..."
                      />
                    </div>

                    {/* ── BANK-SOAL STYLE FORM ── */}
                    <div id="soalFormSection" className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                      {/* Header */}
                      <div className="px-4 py-3 bg-gradient-to-r from-[#0E5C44]/10 to-emerald-50 dark:from-[#0E5C44]/20 dark:to-emerald-950/20 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-[#0E5C44] text-white flex items-center justify-center text-[10px] font-black">S</span>
                            Form Butir Soal
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">Tambahkan soal satu per satu. Soal tersimpan setelah terbitkan tugas.</p>
                        </div>
                        {editingSoalIdx !== null && (
                          <button type="button" onClick={resetSoalForm}
                            className="text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-lg hover:bg-amber-100 transition">
                            ✕ Batal Edit Soal #{editingSoalIdx + 1}
                          </button>
                        )}
                      </div>

                      <div className="p-4 space-y-4">
                        {/* Auto-tipe info badge */}
                        {editingSoalIdx === null && (() => {
                          const nextNum = soalList.length + 1
                          const autoTipe = getAutoTipe(soalList.length)
                          const autoLabel = { pg: '🔘 Pilihan Ganda', esai: '📝 Essay / Esai', benar_salah: '✅ Benar/Salah', menjodohkan: '🔗 Menjodohkan' }[autoTipe] || autoTipe
                          const autoColor = { pg: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300', esai: 'bg-violet-50 border-violet-200 text-violet-800 dark:bg-violet-950/30 dark:border-violet-800 dark:text-violet-300', benar_salah: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300', menjodohkan: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300' }[autoTipe] || 'bg-slate-50 border-slate-200 text-slate-700'
                          return (
                            <div className={`flex items-center justify-between px-3 py-2 rounded-xl border text-[11px] font-semibold ${autoColor}`}>
                              <span>✨ Soal #{nextNum}: <strong>{autoLabel}</strong></span>
                            </div>
                          )
                        })()}

                        {/* Tipe Soal Selector */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider">Tipe Soal</label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {[
                              { id: 'pg', label: 'Pilihan Ganda', emoji: '🔘' },
                              { id: 'esai', label: 'Essay / Esai', emoji: '📝' },
                              { id: 'benar_salah', label: 'Benar / Salah', emoji: '✅' },
                              { id: 'menjodohkan', label: 'Menjodohkan', emoji: '🔗' },
                            ].map((t) => {
                              const isSelected = soalForm.tipe === t.id
                              return (
                                <button
                                  key={t.id}
                                  type="button"
                                  onClick={() => handleSoalTypeChange(t.id)}
                                  className={[
                                    'flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-semibold transition-all',
                                    isSelected
                                      ? 'border-[#0E5C44] bg-emerald-50 dark:bg-emerald-950/60 text-[#0E5C44] dark:text-emerald-300 ring-2 ring-[#0E5C44]/30'
                                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-50',
                                  ].join(' ')}
                                >
                                  <span className="text-base leading-none">{t.emoji}</span>
                                  <span className="leading-tight">{t.label}</span>
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Teks Pertanyaan */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                            Teks Pertanyaan / Soal <span className="text-rose-500">*</span>
                          </label>
                          <textarea
                            rows={3}
                            value={soalForm.pertanyaan}
                            onChange={(e) => setSoalForm((p) => ({ ...p, pertanyaan: e.target.value }))}
                            className="w-full p-2.5 text-xs border rounded-xl dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#0E5C44]/30 focus:border-[#0E5C44]"
                            placeholder="Tuliskan butir soal atau instruksi pertanyaan di sini..."
                          />
                        </div>

                        {/* ── DYNAMIC SECTION BY TYPE ── */}

                        {/* Pilihan Ganda */}
                        {soalForm.tipe === 'pg' && (
                          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/50 space-y-2.5">
                            <h5 className="text-[10px] font-bold text-[#0E5C44] dark:text-emerald-300 uppercase tracking-wider">Opsi Jawaban & Kunci PG</h5>
                            {['a', 'b', 'c', 'd', 'e'].map((opt) => {
                              const isCorrect = soalForm.kunci_jawaban === opt.toUpperCase()
                              return (
                                <div key={opt} className="flex items-center gap-2">
                                  <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                                    <input
                                      type="radio"
                                      name="kunci_pg"
                                      checked={isCorrect}
                                      onChange={() => setSoalForm((p) => ({ ...p, kunci_jawaban: opt.toUpperCase() }))}
                                      className="w-3.5 h-3.5 text-[#0E5C44] focus:ring-[#0E5C44]"
                                    />
                                    <span className={['w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center', isCorrect ? 'bg-[#0E5C44] text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'].join(' ')}>
                                      {opt.toUpperCase()}
                                    </span>
                                  </label>
                                  <input
                                    type="text"
                                    placeholder={`Teks Opsi ${opt.toUpperCase()}`}
                                    value={soalForm[`opsi_${opt}`]}
                                    onChange={(e) => setSoalForm((p) => ({ ...p, [`opsi_${opt}`]: e.target.value }))}
                                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                  />
                                </div>
                              )
                            })}
                            <p className="text-[10px] text-slate-400 italic">* Pilih radio di kiri untuk menandai kunci jawaban yang benar.</p>
                          </div>
                        )}

                        {/* Essay */}
                        {soalForm.tipe === 'esai' && (
                          <div className="bg-violet-50/50 dark:bg-violet-950/20 p-3.5 rounded-xl border border-violet-100 dark:border-violet-900/50 space-y-2">
                            <h5 className="text-[10px] font-bold text-violet-800 dark:text-violet-300 uppercase tracking-wider">Kunci Jawaban / Pedoman Penskoran Essay</h5>
                            <textarea
                              rows={3}
                              placeholder="Tuliskan kunci acuan, poin penting, atau kata kunci jawaban siswa..."
                              value={soalForm.kunci_jawaban}
                              onChange={(e) => setSoalForm((p) => ({ ...p, kunci_jawaban: e.target.value }))}
                              className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            />
                          </div>
                        )}

                        {/* Benar / Salah */}
                        {soalForm.tipe === 'benar_salah' && (
                          <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/50 space-y-2.5">
                            <h5 className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Kunci Jawaban Benar / Salah</h5>
                            <div className="flex gap-3">
                              {['Benar', 'Salah'].map((val) => (
                                <label key={val} className={['flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer font-bold text-xs transition-all', soalForm.kunci_jawaban === val ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'].join(' ')}>
                                  <input
                                    type="radio"
                                    name="kunci_bs"
                                    checked={soalForm.kunci_jawaban === val}
                                    onChange={() => setSoalForm((p) => ({ ...p, kunci_jawaban: val }))}
                                    className="hidden"
                                  />
                                  {val === 'Benar' ? '✅' : '❌'} {val}
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Menjodohkan */}
                        {soalForm.tipe === 'menjodohkan' && (
                          <div className="bg-amber-50/50 dark:bg-amber-950/20 p-3.5 rounded-xl border border-amber-100 dark:border-amber-900/50 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <h5 className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Pasangan Menjodohkan</h5>
                              <button type="button" onClick={() => setSoalForm((p) => ({ ...p, matchingPairs: [...p.matchingPairs, { kiri: '', kanan: '' }] }))}
                                className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition">
                                + Pasangan
                              </button>
                            </div>
                            {soalForm.matchingPairs.map((pair, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-amber-600 w-4 text-center">{idx + 1}.</span>
                                <input type="text" placeholder="Item Kiri" value={pair.kiri}
                                  onChange={(e) => setSoalForm((p) => ({ ...p, matchingPairs: p.matchingPairs.map((mp, i) => i === idx ? { ...mp, kiri: e.target.value } : mp) }))}
                                  className="w-1/2 px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
                                <span className="text-slate-400 text-xs">→</span>
                                <input type="text" placeholder="Item Kanan" value={pair.kanan}
                                  onChange={(e) => setSoalForm((p) => ({ ...p, matchingPairs: p.matchingPairs.map((mp, i) => i === idx ? { ...mp, kanan: e.target.value } : mp) }))}
                                  className="w-1/2 px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
                                {soalForm.matchingPairs.length > 1 && (
                                  <button type="button" onClick={() => setSoalForm((p) => ({ ...p, matchingPairs: p.matchingPairs.filter((_, i) => i !== idx) }))}
                                    className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1 rounded-lg">✕</button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Metadata: Poin, Kesulitan, Indikator, Pembahasan */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Poin Soal</label>
                            <input type="number" step="0.5" min="0" max="100" value={soalForm.poin}
                              onChange={(e) => setSoalForm((p) => ({ ...p, poin: parseFloat(e.target.value) || 0 }))}
                              className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Tingkat Kesulitan</label>
                            <select value={soalForm.tingkat_kesulitan}
                              onChange={(e) => setSoalForm((p) => ({ ...p, tingkat_kesulitan: e.target.value }))}
                              className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                              <option value="mudah">😊 Mudah</option>
                              <option value="sedang">🤔 Sedang</option>
                              <option value="sulit">🔥 Sulit</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Indikator / Kompetensi (Opsional)</label>
                          <input type="text" placeholder="Contoh: Siswa mampu mengidentifikasi tata cara shalat..." value={soalForm.indikator}
                            onChange={(e) => setSoalForm((p) => ({ ...p, indikator: e.target.value }))}
                            className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Pembahasan / Penjelasan (Opsional)</label>
                          <textarea rows={2} placeholder="Tuliskan pembahasan singkat atau alasan kunci jawaban..." value={soalForm.pembahasan}
                            onChange={(e) => setSoalForm((p) => ({ ...p, pembahasan: e.target.value }))}
                            className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
                        </div>

                        {/* Add/Update Soal Button */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                            {editingSoalIdx === null ? (
                              <>
                                <span>Menambahkan Soal #{soalList.length + 1}</span>
                                {(() => {
                                  const autoTipe = getAutoTipe(soalList.length)
                                  const badge = { pg: { cls: 'bg-emerald-100 text-emerald-800', lbl: '🔘 PG' }, esai: { cls: 'bg-violet-100 text-violet-800', lbl: '📝 Essay' }, benar_salah: { cls: 'bg-blue-100 text-blue-800', lbl: '✅ B/S' }, menjodohkan: { cls: 'bg-amber-100 text-amber-800', lbl: '🔗 Jodoh' } }[autoTipe] || { cls: 'bg-slate-100 text-slate-700', lbl: autoTipe }
                                  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.cls}`}>{badge.lbl}</span>
                                })()}
                              </>
                            ) : (
                              <span className="text-amber-600 font-semibold">Mengedit Soal #{editingSoalIdx + 1}</span>
                            )}
                          </div>
                          <button type="button" onClick={handleAddSoal}
                            className={['inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-md active:scale-95 transition-all', editingSoalIdx !== null ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#0E5C44] hover:bg-emerald-700'].join(' ')}>
                            {editingSoalIdx !== null ? '✏️ Perbarui Soal #' + (editingSoalIdx + 1) : '✅ Simpan Soal #' + (soalList.length + 1)}
                          </button>
                        </div>
                      </div>

                      {/* ── Mini Datatable Soal ── */}
                      <div className="border-t border-slate-200 dark:border-slate-700">
                        <div className="px-4 py-2.5 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
                          <h5 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            📋 Daftar Soal ({soalList.length} Soal)
                          </h5>
                          <div className="flex items-center gap-2">
                            {soalList.length > 0 && (
                              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                Total Poin: {soalList.reduce((acc, s) => acc + (parseFloat(s.poin) || 0), 0).toFixed(1)}
                              </span>
                            )}
                            {(() => {
                              const nextNum = soalList.length + 1
                              const autoTipe = getAutoTipe(soalList.length)
                              const btnColor = autoTipe === 'pg'
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : autoTipe === 'esai'
                                ? 'bg-violet-600 hover:bg-violet-700 text-white'
                                : 'bg-[#0E5C44] hover:bg-emerald-800 text-white'
                              const tipeShort = { pg: 'PG', esai: 'Essay', benar_salah: 'B/S', menjodohkan: 'Jodoh' }[autoTipe] || autoTipe
                              return (
                                <button
                                  type="button"
                                  onClick={handlePrepareNewSoal}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm transition-all active:scale-95 ${btnColor}`}
                                >
                                  <span className="text-sm leading-none">+</span>
                                  Tambah Soal #{nextNum} ({tipeShort})
                                </button>
                              )
                            })()}
                          </div>
                        </div>
                        {soalList.length === 0 ? (
                          <div className="py-8 px-4 text-center text-slate-400 text-xs space-y-3">
                            <span className="text-3xl block">📂</span>
                            <p>Belum ada soal. Gunakan tombol di bawah untuk menambah soal satu per satu.</p>
                            <div className="flex items-center justify-center gap-3 flex-wrap">
                              <button type="button" onClick={handlePrepareNewSoal}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95">
                                ➕ Tambah Soal #1
                              </button>
                              <span className="text-slate-300 dark:text-slate-600">atau</span>
                              <span className="text-[10px] text-slate-400">isi form di atas → klik <strong className="text-slate-600 dark:text-slate-300">"+ Tambahkan Soal Ini"</strong></span>
                            </div>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                  <th className="py-2.5 px-3 w-8 text-center">#</th>
                                  <th className="py-2.5 px-3">Pertanyaan</th>
                                  <th className="py-2.5 px-3 text-center">Tipe</th>
                                  <th className="py-2.5 px-3 text-center">Poin</th>
                                  <th className="py-2.5 px-3 text-right">Aksi</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                                {soalList.map((soal, idx) => {
                                  const tipeBadge = {
                                    pg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
                                    esai: 'bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300',
                                    benar_salah: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
                                    menjodohkan: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
                                  }[soal.tipe] || 'bg-slate-100 text-slate-700'
                                  const tipeLabel = { pg: 'Pilihan Ganda', esai: 'Essay', benar_salah: 'B/S', menjodohkan: 'Jodoh' }[soal.tipe] || soal.tipe
                                  const isEditing = editingSoalIdx === idx
                                  return (
                                    <tr key={idx} className={['hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors', isEditing ? 'bg-amber-50/60 dark:bg-amber-950/20' : ''].join(' ')}>
                                      <td className="py-2.5 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                                      <td className="py-2.5 px-3 max-w-xs">
                                        <p className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2">{soal.pertanyaan}</p>
                                        {soal.indikator && <p className="text-[10px] text-slate-400 mt-0.5 truncate">Ind: {soal.indikator}</p>}
                                      </td>
                                      <td className="py-2.5 px-3 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tipeBadge}`}>{tipeLabel}</span>
                                      </td>
                                      <td className="py-2.5 px-3 text-center font-semibold text-slate-700 dark:text-slate-300">{soal.poin}</td>
                                      <td className="py-2.5 px-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                          <button type="button" onClick={() => handleEditSoal(idx)}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 transition">
                                            ✏️ Edit
                                          </button>
                                          <button type="button" onClick={() => handleDeleteSoal(idx)}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 transition">
                                            🗑 Hapus
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">
                        Lampiran Dokumen / Lembar Soal (PDF / Gambar / Doc) <span className="text-slate-400 font-normal">(opsional)</span>
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null
                          setTugasForm({ ...tugasForm, file_lampiran: file, file_lampiran_preview: file ? file.name : null })
                        }}
                        className="w-full text-xs text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-950/40 dark:file:text-emerald-300"
                      />
                      {tugasForm.file_lampiran_preview && (
                        <p className="mt-1 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                          <Paperclip className="w-3.5 h-3.5" /> Berkas terpilih: {tugasForm.file_lampiran_preview}
                        </p>
                      )}
                      {tugasForm.existing_file_url && !tugasForm.file_lampiran && (
                        <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
                          <Paperclip className="w-3.5 h-3.5" /> Berkas tersimpan saat ini: <a href={tugasForm.existing_file_url} target="_blank" rel="noreferrer" className="text-emerald-600 underline font-semibold">Lihat Lembar Soal</a>
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">Format Jawaban Siswa</label>
                        <select
                          value={tugasForm.tipe_tugas || 'both'}
                          onChange={(e) => setTugasForm({ ...tugasForm, tipe_tugas: e.target.value })}
                          className="h-11 w-full border rounded-xl bg-white px-3 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-semibold"
                        >
                          <option value="both">Teks & Upload File/Foto</option>
                          <option value="online_text">Hanya Teks Online</option>
                          <option value="file_upload">Hanya Upload File/Foto</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">Deadline <span className="text-rose-500">*</span></label>
                        <input
                          type="date"
                          required
                          value={tugasForm.deadline}
                          onChange={(e) => setTugasForm({ ...tugasForm, deadline: e.target.value })}
                          className="h-11 w-full p-2.5 border rounded-xl dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">Bobot Penilaian</label>
                        <input
                          type="number"
                          value={tugasForm.bobot}
                          onChange={(e) => setTugasForm({ ...tugasForm, bobot: e.target.value })}
                          className="h-11 w-full p-2.5 border rounded-xl dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                          placeholder="100"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-3">
                      <button type="button" onClick={() => { setShowModal(false); setEditingId(null); }} className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 font-semibold">
                        Batal
                      </button>
                      <button type="submit" disabled={savingTugas} className="inline-flex min-w-32 items-center justify-center gap-2 px-4 py-2 bg-[#0E5C44] text-white rounded-xl font-bold shadow-md disabled:cursor-wait disabled:opacity-60">
                        {savingTugas && <RefreshCw className="h-4 w-4 animate-spin" />}
                        {savingTugas ? 'Menerbitkan...' : editingId ? 'Perbarui Tugas' : 'Terbitkan Tugas'}
                      </button>
                    </div>
                  </form>
                )}

                {modalType === 'tahfizh' && (
                  <form onSubmit={handleSaveTahfizh} className="space-y-3.5 text-xs">
                    {/* Field Siswa Rombel dengan Soft Pastel Squircle Button */}
                    <div>
                      <label htmlFor="tahfizh-siswa" className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">
                        Siswa Rombel <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          id="tahfizh-siswa"
                          required
                          value={tahfizhForm.student_id}
                          onChange={(e) => setTahfizhForm({ ...tahfizhForm, student_id: e.target.value })}
                          className="h-11 flex-1 border rounded-xl dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-semibold px-3"
                        >
                          <option value="">-- Pilih Siswa Rombel --</option>
                          {students.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.nama_lengkap} (NIS: {s.nis || s.nisn || '-'})
                            </option>
                          ))}
                        </select>
                        <div className="relative group">
                          <button
                            type="button"
                            onClick={() => {
                              setStudentModalSearch('')
                              setShowStudentSearchModal(true)
                            }}
                            className="w-11 h-11 rounded-[14px] bg-sky-100/90 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800 shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center shrink-0"
                            aria-label="Pencarian Nama Siswa Rombel"
                          >
                            <UserCheck className="w-5 h-5" />
                          </button>
                          <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-lg z-20">
                            Pencarian Nama Siswa Rombel
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Info Profile Siswa & Data Tahfizh Terakhir / Selesai */}
                    {selectedTahfizhStudent && (
                      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-900/60 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold flex items-center justify-center text-sm border border-emerald-200/80 shrink-0">
                            {selectedTahfizhStudent.avatar ? (
                              <img src={selectedTahfizhStudent.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              (selectedTahfizhStudent.nama_lengkap || 'S').slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                              {selectedTahfizhStudent.nama_lengkap}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-mono">
                              NIS: {selectedTahfizhStudent.nis || selectedTahfizhStudent.nisn || '-'} • Rombel {selectedClassName}
                            </p>
                          </div>
                        </div>

                        {previousTahfizhLog ? (
                          <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-2.5 dark:border-emerald-800 dark:bg-emerald-950/40 text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>Hafalan Selesai Sebelumnya:</span>
                            </div>
                            <p className="mt-0.5 text-[11px] font-bold text-emerald-900 dark:text-emerald-200">
                              Juz {previousTahfizhLog.metadata?.juz || '-'} • Surah {previousTahfizhLog.hafalan_surah_name || '-'} (Ayat {previousTahfizhLog.hafalan_ayah_start}–{previousTahfizhLog.hafalan_ayah_end})
                            </p>
                            {automaticTahfizhTarget && (
                              <p className="mt-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold leading-relaxed">
                                ⚡ Lanjutan Otomatis: <strong>Surah {automaticTahfizhTarget.surah_name} (Mulai Ayat {automaticTahfizhTarget.ayat_start})</strong>. Silakan pilih <strong>Ayat Terakhir</strong> untuk setoran baru.
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-900 text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                              <span>Data Tahfizh Siswa Belum Ada (Kosong)</span>
                            </div>
                            <p className="mt-0.5 text-[10px] text-slate-500 font-medium">
                              Belum ada setoran sebelumnya. Anda dapat mengisi Juz, Surah, Ayat Awal, dan Ayat Terakhir secara manual.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {/* Jenis Setoran dengan Soft Pastel Squircle Button */}
                      <div>
                        <label htmlFor="tahfizh-jenis" className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">Jenis Setoran</label>
                        <div className="flex items-center gap-2">
                          <select
                            id="tahfizh-jenis"
                            value={tahfizhForm.type}
                            onChange={(e) => setTahfizhForm({ ...tahfizhForm, type: e.target.value })}
                            className="h-11 flex-1 border rounded-xl bg-white px-3 font-semibold dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                          >
                            {['Ziyadah', 'Murajaah', 'Tasmi', 'Ujian'].map((type) => (
                              <option key={type}>{type}</option>
                            ))}
                          </select>
                          <div className="relative group">
                            <button
                              type="button"
                              onClick={() => setShowSetoranTypeModal(true)}
                              className="w-11 h-11 rounded-[14px] bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center shrink-0"
                              aria-label="Jenis Setoran Cepat"
                            >
                              <Zap className="w-5 h-5" />
                            </button>
                            <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-lg z-20">
                              Jenis Setoran Cepat
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Juz Capaian */}
                      <div>
                        <label htmlFor="tahfizh-juz" className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">
                          Juz Capaian <span className="text-rose-500">*</span>
                        </label>
                        <select
                          id="tahfizh-juz"
                          disabled={Boolean(previousTahfizhLog)}
                          value={tahfizhForm.juz}
                          onChange={(e) => setTahfizhForm({ ...tahfizhForm, juz: Number(e.target.value) })}
                          className="h-11 w-full border rounded-xl bg-white px-3 font-semibold dark:bg-slate-800 border-slate-200 dark:border-slate-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:disabled:bg-slate-900"
                        >
                          {Array.from({ length: 30 }, (_, index) => index + 1).map((juz) => (
                            <option key={juz} value={juz}>Juz {juz}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Surah dari Master Al-Qur'an dengan Soft Pastel Squircle Button */}
                    <div>
                      <label htmlFor="tahfizh-surah" className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">
                        Surah dari Master Al-Qur'an <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          id="tahfizh-surah"
                          required
                          disabled={loadingSurahs || Boolean(previousTahfizhLog)}
                          value={tahfizhForm.surah_number}
                          onChange={(e) => {
                            const surahNumber = Number(e.target.value)
                            setTahfizhForm({ ...tahfizhForm, surah_number: surahNumber, ayat_start: 1, ayat_end: 1, juz: getQuranJuz(surahNumber, 1) })
                          }}
                          className="h-11 flex-1 border rounded-xl bg-white px-3 font-semibold dark:bg-slate-800 border-slate-200 dark:border-slate-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:disabled:bg-slate-900"
                        >
                          <option value="">{loadingSurahs ? 'Memuat Master Al-Qur’an...' : '-- Pilih Surah Master --'}</option>
                          {quranSurahs.map((surah) => (
                            <option key={surah.nomor} value={surah.nomor}>
                              {surah.nomor}. {surah.nama_latin} ({surah.jumlah_ayat} ayat)
                            </option>
                          ))}
                        </select>
                        <div className="relative group">
                          <button
                            type="button"
                            onClick={() => {
                              setSurahModalSearch('')
                              setShowSurahSearchModal(true)
                            }}
                            className="w-11 h-11 rounded-[14px] bg-purple-100/90 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800 shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center shrink-0"
                            aria-label="Master Surah Al-Qur'an"
                          >
                            <BookMarked className="w-5 h-5" />
                          </button>
                          <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-lg z-20">
                            Master Surah Al-Qur'an
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ayat Awal & Ayat Terakhir */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="tahfizh-ayat-awal" className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">
                          Ayat Awal
                        </label>
                        <select
                          id="tahfizh-ayat-awal"
                          disabled={!selectedTahfizhSurah || Boolean(previousTahfizhLog)}
                          value={tahfizhForm.ayat_start}
                          onChange={(e) => {
                            const value = Number(e.target.value)
                            setTahfizhForm({ ...tahfizhForm, ayat_start: value, ayat_end: Math.max(value, Number(tahfizhForm.ayat_end)), juz: getQuranJuz(tahfizhForm.surah_number, value) })
                          }}
                          className="h-11 w-full border rounded-xl bg-white px-3 font-semibold dark:bg-slate-800 border-slate-200 dark:border-slate-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:disabled:bg-slate-900"
                        >
                          {Array.from({ length: selectedTahfizhSurah?.jumlah_ayat || 1 }, (_, index) => index + 1).map((ayat) => (
                            <option key={ayat}>{ayat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="tahfizh-ayat-akhir" className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">
                          Ayat Terakhir (Aktif)
                        </label>
                        <select
                          id="tahfizh-ayat-akhir"
                          disabled={!selectedTahfizhSurah}
                          value={tahfizhForm.ayat_end}
                          onChange={(e) => setTahfizhForm({ ...tahfizhForm, ayat_end: Number(e.target.value) })}
                          className="h-11 w-full border rounded-xl bg-white px-3 font-bold text-emerald-700 dark:text-emerald-400 dark:bg-slate-800 border-emerald-300 dark:border-emerald-700 focus:ring-2 focus:ring-emerald-500/30"
                        >
                          {Array.from({ length: selectedTahfizhSurah?.jumlah_ayat || 1 }, (_, index) => index + 1)
                            .filter((ayat) => ayat >= Number(tahfizhForm.ayat_start))
                            .map((ayat) => (
                              <option key={ayat}>{ayat}</option>
                            ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {[
                        ['kelancaran', 'Kelancaran', ['Sangat Lancar', 'Lancar', 'Perlu Bimbingan']],
                        ['tajwid', 'Tajwid', ['Sangat Baik', 'Baik', 'Perlu Bimbingan']],
                        ['makhraj', 'Makhraj', ['Sangat Baik', 'Baik', 'Perlu Bimbingan']],
                      ].map(([key, label, options]) => (
                        <div key={key}>
                          <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">{label}</label>
                          <select
                            value={tahfizhForm[key]}
                            onChange={(e) => setTahfizhForm({ ...tahfizhForm, [key]: e.target.value })}
                            className="h-11 w-full border rounded-xl bg-white px-2 font-semibold dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                          >
                            {options.map((option) => (
                              <option key={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>

                    <div>
                      <label htmlFor="tahfizh-catatan" className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">Catatan Guru</label>
                      <textarea
                        id="tahfizh-catatan"
                        rows={3}
                        value={tahfizhForm.notes_teacher}
                        onChange={(e) => setTahfizhForm({ ...tahfizhForm, notes_teacher: e.target.value })}
                        placeholder="Catatan evaluasi atau target setoran berikutnya..."
                        className="w-full border rounded-xl p-2.5 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-3">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={savingTahfizh || loadingSurahs}
                        className="inline-flex min-w-32 items-center justify-center gap-2 px-4 py-2 bg-[#0E5C44] text-white rounded-xl font-bold shadow-md disabled:opacity-60 hover:bg-emerald-800 transition"
                      >
                        {savingTahfizh && <RefreshCw className="h-4 w-4 animate-spin" />}
                        {savingTahfizh ? 'Menyimpan...' : 'Simpan Setoran'}
                      </button>
                    </div>
                  </form>
                )}

                {/* POPUP MODAL PENCARIAN SISWA ROMBEL */}
                <AppModal
                  isOpen={showStudentSearchModal}
                  onClose={() => setShowStudentSearchModal(false)}
                  title="Pilih Siswa Rombel"
                  description={`Cari dan pilih siswa pada rombel ${selectedClassName} untuk setoran tahfizh`}
                  icon={UserCheck}
                  maxWidth="max-w-xl"
                >
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="search"
                        value={studentModalSearch}
                        onChange={(e) => setStudentModalSearch(e.target.value)}
                        placeholder="Cari nama siswa atau NIS..."
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-semibold outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                      {students
                        .filter((s) => !studentModalSearch.trim() || s.nama_lengkap?.toLowerCase().includes(studentModalSearch.toLowerCase()) || s.nis?.includes(studentModalSearch))
                        .map((s) => {
                          const isSelected = tahfizhForm.student_id === s.id
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setTahfizhForm({ ...tahfizhForm, student_id: s.id })
                                setShowStudentSearchModal(false)
                              }}
                              className={`flex items-center gap-3 w-full p-3 rounded-2xl border text-left transition ${
                                isSelected
                                  ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/30 dark:bg-emerald-950/40 dark:border-emerald-700'
                                  : 'border-slate-200/80 hover:border-emerald-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900'
                              }`}
                            >
                              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold flex items-center justify-center text-xs border border-emerald-200 shrink-0">
                                {s.avatar ? (
                                  <img src={s.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  (s.nama_lengkap || 'S').slice(0, 2).toUpperCase()
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">{s.nama_lengkap}</h4>
                                <p className="text-[11px] text-slate-500 font-mono">NIS: {s.nis || s.nisn || '-'}</p>
                              </div>
                              {isSelected ? (
                                <span className="px-2.5 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded-full">Dipilih</span>
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                          )
                        })}

                      {students.filter((s) => !studentModalSearch.trim() || s.nama_lengkap?.toLowerCase().includes(studentModalSearch.toLowerCase()) || s.nis?.includes(studentModalSearch)).length === 0 && (
                        <div className="p-8 text-center text-xs text-slate-500">
                          Tidak ditemukan siswa dengan kata kunci "{studentModalSearch}"
                        </div>
                      )}
                    </div>
                  </div>
                </AppModal>

                {/* POPUP MODAL JENIS SETORAN TAHFIZH */}
                <AppModal
                  isOpen={showSetoranTypeModal}
                  onClose={() => setShowSetoranTypeModal(false)}
                  title="Pilih Jenis Setoran Tahfizh"
                  description="Pilih jenis atau kategori setoran hafalan Al-Qur'an siswa"
                  icon={Zap}
                  maxWidth="max-w-md"
                >
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'Ziyadah', label: 'Ziyadah', description: 'Setoran Hafalan Baru', icon: Sparkles, color: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40' },
                      { id: 'Murajaah', label: 'Murajaah', description: 'Pengulangan Hafalan Lama', icon: RefreshCw, color: 'border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/40' },
                      { id: 'Tasmi', label: 'Tasmi\'', description: 'Ujian Sekali Duduk', icon: BookOpen, color: 'border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-950/40' },
                      { id: 'Ujian', label: 'Ujian Setoran', description: 'Ujian Capaian Juz', icon: Award, color: 'border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/40' },
                    ].map((item) => {
                      const Icon = item.icon
                      const isSelected = tahfizhForm.type === item.id
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setTahfizhForm({ ...tahfizhForm, type: item.id })
                            setShowSetoranTypeModal(false)
                          }}
                          className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                            isSelected
                              ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/50'
                              : 'border-slate-200/80 hover:border-emerald-300 bg-white dark:bg-slate-900'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${item.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="mt-3">
                            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{item.label}</h4>
                            <p className="text-[10px] text-slate-500 font-medium">{item.description}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </AppModal>

                {/* POPUP MODAL MASTER SURAH AL-QUR'AN */}
                <AppModal
                  isOpen={showSurahSearchModal}
                  onClose={() => setShowSurahSearchModal(false)}
                  title="Master Surah Al-Qur'an"
                  description="Cari dan pilih dari 114 Surah Master Al-Qur'an"
                  icon={BookMarked}
                  maxWidth="max-w-2xl"
                >
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="search"
                        value={surahModalSearch}
                        onChange={(e) => setSurahModalSearch(e.target.value)}
                        placeholder="Cari nama surah (contoh: An-Naba, Al-Baqarah, 30)..."
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-semibold outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
                      {quranSurahs
                        .filter((s) => !surahModalSearch.trim() || s.nama_latin?.toLowerCase().includes(surahModalSearch.toLowerCase()) || String(s.nomor).includes(surahModalSearch))
                        .map((s) => {
                          const isSelected = Number(tahfizhForm.surah_number) === Number(s.nomor)
                          return (
                            <button
                              key={s.nomor}
                              type="button"
                              onClick={() => {
                                const surahNumber = Number(s.nomor)
                                setTahfizhForm({
                                  ...tahfizhForm,
                                  surah_number: surahNumber,
                                  ayat_start: 1,
                                  ayat_end: 1,
                                  juz: getQuranJuz(surahNumber, 1),
                                })
                                setShowSurahSearchModal(false)
                              }}
                              className={`flex items-center justify-between w-full p-3 rounded-2xl border text-left transition ${
                                isSelected
                                  ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/30 dark:bg-emerald-950/40 dark:border-emerald-700'
                                  : 'border-slate-200/80 hover:border-emerald-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-extrabold text-xs flex items-center justify-center border border-purple-200 shrink-0">
                                  {s.nomor}
                                </div>
                                <div>
                                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{s.nama_latin}</h4>
                                  <p className="text-[10px] text-slate-500">{s.arti} • {s.jumlah_ayat} Ayat</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="block font-serif text-sm font-bold text-slate-800 dark:text-slate-200">{s.nama}</span>
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Juz {getQuranJuz(s.nomor, 1)}</span>
                              </div>
                            </button>
                          )
                        })}

                      {quranSurahs.filter((s) => !surahModalSearch.trim() || s.nama_latin?.toLowerCase().includes(surahModalSearch.toLowerCase()) || String(s.nomor).includes(surahModalSearch)).length === 0 && (
                        <div className="p-8 text-center text-xs text-slate-500">
                          Tidak ditemukan surah dengan kata kunci "{surahModalSearch}"
                        </div>
                      )}
                    </div>
                  </div>
                </AppModal>

                {modalType === 'catatan' && (
                  <form onSubmit={handleSaveCatatan} className="space-y-3.5 text-xs">
                    <div className="flex items-center justify-between"><div><h3 className="text-base font-extrabold text-slate-900 dark:text-white">{editingId ? 'Edit Catatan Siswa' : 'Tambah Catatan Siswa'}</h3><p className="mt-0.5 text-[10px] text-slate-500">Catat perkembangan dan rencana tindak lanjut siswa.</p></div><button type="button" onClick={() => setShowModal(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></div>
                    <div>
                      <label className="mb-1 block font-semibold text-slate-700 dark:text-slate-200">Siswa</label>
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30"><p className="font-bold text-emerald-800 dark:text-emerald-300">{students.find((student) => student.id === catatanForm.student_id)?.nama_lengkap || students.find((student) => student.id === catatanForm.student_id)?.full_name || 'Siswa tidak ditemukan'}</p><p className="mt-0.5 text-[10px] text-emerald-700">{selectedClassName} · Dipilih otomatis dari tabel</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="mb-1 block font-semibold text-slate-700 dark:text-slate-200">Tanggal</label><input type="date" required value={catatanForm.date} onChange={(e) => setCatatanForm({ ...catatanForm, date: e.target.value })} className="h-10 w-full rounded-xl border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-800" /></div>
                      <div><label className="mb-1 block font-semibold text-slate-700 dark:text-slate-200">Kategori</label><select value={catatanForm.category} onChange={(e) => setCatatanForm({ ...catatanForm, category: e.target.value })} className="h-10 w-full rounded-xl border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-800">{['Akademik', 'Perilaku', 'Kedisiplinan', 'Prestasi', 'Konseling', 'Tahfizh', 'Ibadah', 'Kesehatan'].map((category) => <option key={category}>{category}</option>)}</select></div>
                    </div>
                    <div>
                      <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">Judul Catatan</label>
                      <input
                        type="text"
                        required
                        value={catatanForm.title}
                        onChange={(e) => setCatatanForm({ ...catatanForm, title: e.target.value })}
                        className="w-full p-2.5 border rounded-xl dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        placeholder="Judul catatan perkembangan..."
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">Isi Catatan</label>
                      <textarea
                        rows={3}
                        required
                        value={catatanForm.content}
                        onChange={(e) => setCatatanForm({ ...catatanForm, content: e.target.value })}
                        className="w-full p-2.5 border rounded-xl dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        placeholder="Perkembangan atau catatan..."
                      />
                    </div>
                    <div><label className="mb-1 block font-semibold text-slate-700 dark:text-slate-200">Tindak Lanjut</label><textarea rows={2} value={catatanForm.follow_up} onChange={(e) => setCatatanForm({ ...catatanForm, follow_up: e.target.value })} className="w-full rounded-xl border border-slate-200 p-2.5 dark:border-slate-700 dark:bg-slate-800" placeholder="Rencana pendampingan berikutnya (opsional)..." /></div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div><label className="mb-1 block font-semibold text-slate-700 dark:text-slate-200">Prioritas</label><select value={catatanForm.priority} onChange={(e) => setCatatanForm({ ...catatanForm, priority: e.target.value })} className="h-10 w-full rounded-xl border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-800"><option value="low">Rendah</option><option value="medium">Sedang</option><option value="high">Tinggi</option><option value="urgent">Mendesak</option></select></div>
                      <div className="flex items-end gap-4 pb-2"><label className="flex items-center gap-2"><input type="checkbox" checked={catatanForm.visible_to_parent} onChange={(e) => setCatatanForm({ ...catatanForm, visible_to_parent: e.target.checked })} /> Orang tua</label><label className="flex items-center gap-2"><input type="checkbox" checked={catatanForm.visible_to_student} onChange={(e) => setCatatanForm({ ...catatanForm, visible_to_student: e.target.checked })} /> Siswa</label></div>
                    </div>
                    <div className="flex justify-end gap-2 pt-3">
                      <button type="button" onClick={() => { setShowModal(false); setEditingId(null); }} className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 font-semibold">
                        Batal
                      </button>
                      <button type="submit" disabled={savingStudentNote} className="inline-flex min-w-36 items-center justify-center gap-2 rounded-xl bg-[#0E5C44] px-4 py-2 font-bold text-white shadow-md disabled:opacity-60">
                        {savingStudentNote && <RefreshCw className="h-4 w-4 animate-spin" />}{savingStudentNote ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Simpan Catatan'}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* SUBMISSIONS & GRADES MODAL */}
      {showSubmissionsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-[#1B2433] w-full max-w-4xl rounded-[22px] p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative my-auto max-h-[92vh] flex flex-col space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Hasil Pengumpulan & Nilai Siswa
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedAssignmentForSubmissions?.judul || selectedAssignmentForSubmissions?.judul_tugas} • Rombel {selectedAssignmentForSubmissions?.kelas?.nama_kelas || selectedAssignmentForSubmissions?.kelas?.name || selectedClassName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSubmissionsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Mengumpulkan</span>
                <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{submissionsList.length} <span className="text-xs font-normal text-slate-500">Siswa</span></p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/50">
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Sudah Dinilai</span>
                <p className="text-lg font-black text-emerald-700 dark:text-emerald-300 mt-0.5">{submissionsList.filter(s => s.nilai_guru !== null && s.nilai_guru !== '').length} <span className="text-xs font-normal text-emerald-600/70">Siswa</span></p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/50">
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Perlu Dinilai</span>
                <p className="text-lg font-black text-amber-700 dark:text-amber-300 mt-0.5">{submissionsList.filter(s => s.nilai_guru === null || s.nilai_guru === '').length} <span className="text-xs font-normal text-amber-600/70">Siswa</span></p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/50">
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">Rata-rata Nilai</span>
                <p className="text-lg font-black text-blue-700 dark:text-blue-300 mt-0.5">
                  {(() => {
                    const graded = submissionsList.filter(s => s.nilai_guru !== null && s.nilai_guru !== '')
                    if (graded.length === 0) return '-'
                    const avg = graded.reduce((a, b) => a + Number(b.nilai_guru), 0) / graded.length
                    return avg.toFixed(1)
                  })()}
                </p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={submissionSearch}
                  onChange={(e) => setSubmissionSearch(e.target.value)}
                  placeholder="Cari siswa berdasarkan nama atau NIS..."
                  className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-8 pr-3 text-xs outline-none focus:border-emerald-600"
                />
              </div>
              <select
                value={submissionStatusFilter}
                onChange={(e) => setSubmissionStatusFilter(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-semibold outline-none focus:border-emerald-600"
              >
                <option value="all">Semua Status</option>
                <option value="dinilai">Sudah Dinilai</option>
                <option value="belum_dinilai">Belum Dinilai</option>
                <option value="terlambat">Terlambat</option>
              </select>
            </div>

            {/* List / Table Content */}
            <div className="flex-1 overflow-y-auto min-h-[250px] max-h-[48vh] rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
              {loadingSubmissions ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mb-2" />
                  Memuat data pengumpulan tugas siswa...
                </div>
              ) : submissionsList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  Belum ada siswa yang mengumpulkan tugas ini.
                </div>
              ) : (
                submissionsList
                  .filter((sub) => {
                    const studentName = sub.student?.full_name || sub.siswa?.full_name || sub.student?.nama_lengkap || sub.siswa?.nama_lengkap || ''
                    const nis = sub.student?.nis || sub.siswa?.nis || ''
                    const q = submissionSearch.trim().toLowerCase()
                    const matchQ = !q || studentName.toLowerCase().includes(q) || nis.toLowerCase().includes(q)
                    if (!matchQ) return false
                    if (submissionStatusFilter === 'dinilai') return sub.nilai_guru !== null && sub.nilai_guru !== ''
                    if (submissionStatusFilter === 'belum_dinilai') return sub.nilai_guru === null || sub.nilai_guru === ''
                    if (submissionStatusFilter === 'terlambat') return sub.status === 'terlambat'
                    return true
                  })
                  .map((sub, idx) => (
                    <SubmissionRowItem
                      key={sub.id}
                      sub={sub}
                      index={idx}
                      onSaveGrade={handleSaveSingleSubmissionGrade}
                      isSaving={savingGradeId === sub.id}
                    />
                  ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-500">
                Nilai yang disimpan akan otomatis tersinkronisasi ke rekap rapor.
              </span>
              <button
                type="button"
                onClick={() => setShowSubmissionsModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT OPTIONS MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1B2433] w-full max-w-md rounded-[22px] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-[#0E5C44]" /> Export Data Workspace
            </h3>
            <p className="text-xs text-slate-500">Pilih format berkas yang ingin Anda unduh untuk rekap pengajaran.</p>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'xlsx', label: 'Excel (.xlsx)', icon: FileSpreadsheet },
                { id: 'csv', label: 'CSV (.csv)', icon: FileText },
                { id: 'pdf', label: 'PDF (.pdf)', icon: FileSpreadsheet },
              ].map((fmt) => {
                const Icon = fmt.icon
                const isSel = exportFormat === fmt.id
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setExportFormat(fmt.id)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition ${
                      isSel
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-[#0E5C44] text-[#0E5C44] dark:text-emerald-400 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs">{fmt.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleProcessExport}
                className="px-4 py-2 bg-[#0E5C44] text-white text-xs font-bold rounded-xl shadow-md"
              >
                Unduh Berkas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT DATA SPREADSHEET MODAL (.csv, .xls, .xlsx) */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-[#1B2433] w-full max-w-lg rounded-[22px] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Import Data {importTarget === 'penilaian' ? 'Buku Nilai' : 'Presensi Siswa'}
                  </h3>
                  <p className="text-xs text-slate-400">Rombel: {selectedClassName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false)
                  setImportFile(null)
                  setImportError('')
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-emerald-50/70 p-3 text-xs border border-emerald-200/70 dark:bg-emerald-950/30 dark:border-emerald-800/40">
                <div className="text-emerald-800 dark:text-emerald-300">
                  <span className="font-bold">Unduh Format Template:</span>
                  <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400">Pastikan format baris dan nama siswa sesuai template.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadImportTemplate(importTarget)}
                  className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-emerald-800 shadow-2xs border border-emerald-300 hover:bg-emerald-100 dark:bg-slate-800 dark:text-emerald-300 dark:border-emerald-700"
                >
                  <Download className="w-3.5 h-3.5" /> Unduh Template
                </button>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => importFileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center"
              >
                <Upload className="w-8 h-8 text-sky-500 mb-2" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {importFile ? importFile.name : 'Klik untuk memilih atau drag & drop file'}
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Format didukung: CSV (.csv), Excel Spreadsheet (.xlsx, .xls)
                </span>
                <input
                  ref={importFileInputRef}
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

              {importError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 font-medium">
                  {importError}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false)
                  setImportFile(null)
                  setImportError('')
                }}
                className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!importFile || isImporting}
                onClick={handleProcessImport}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                {isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {isImporting ? 'Memproses Import...' : 'Proses & Terapkan Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL DRAWER / MODAL */}
      {showDetailModal && detailData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`bg-white dark:bg-[#1B2433] w-full ${detailData.category === 'Materi Belajar' ? 'max-w-2xl max-h-[85vh] overflow-y-auto' : 'max-w-md'} rounded-[22px] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 relative animate-in fade-in zoom-in duration-200`}>
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute right-5 top-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-[#0E5C44] dark:text-emerald-300 rounded-xl">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  {detailData.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {detailData.title}
                </h3>
              </div>
            </div>

            {/* Video Embed */}
            {detailData.video && (
              <div className="pt-2">
                <VideoEmbedPlayer
                  url={detailData.video}
                  title={`Video: ${detailData.title}`}
                />
              </div>
            )}

            {/* PDF Embed */}
            {detailData.file && (
              <div className="pt-2">
                <PdfDocumentViewer
                  url={detailData.file}
                  title={`Dokumen: ${detailData.title}`}
                  height="400px"
                />
              </div>
            )}

            {/* External Link */}
            {detailData.link && (
              <div className="pt-2">
                <a
                  href={detailData.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs border border-emerald-200 transition-colors dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Buka Tautan Materi di Tab Baru
                </a>
              </div>
            )}

            <div className="space-y-2 border-t border-b border-slate-100 dark:border-slate-800 py-3 text-xs">
              {detailData.items.map((it, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                  <span className="text-slate-500 font-medium">{it.label}</span>
                  <span className="font-bold text-slate-900 dark:text-white text-right">{it.value}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end items-center gap-2 pt-1">
              {detailData.rawStudent && (
                <button
                  type="button"
                  onClick={() => handlePrintWeeklyEvaluation(detailData.rawStudent)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition cursor-pointer"
                  title="Cetak Lembar Evaluasi Mingguan Santri Resmi"
                >
                  <Printer className="w-4 h-4" /> Cetak Evaluasi Pekanan
                </button>
              )}
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-[#0E5C44] hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FACE RECOGNITION MODAL */}
      {showFaceModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#1B2433] border border-purple-500/30">
            <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800 bg-purple-950/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
                  <ScanFace className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Presensi AI Face Recognition</h3>
                  <p className="text-xs text-slate-400">Pindai & verifikasi wajah siswa</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFaceModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleFaceRecognitionSubmit()
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div className="relative h-44 bg-black/80 rounded-xl border-2 border-purple-500/50 flex flex-col items-center justify-center overflow-hidden">
                <div className="w-32 h-36 border-2 border-purple-400 rounded-full relative flex items-center justify-center shadow-2xl">
                  <ScanFace className="w-14 h-14 text-purple-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-purple-300 font-semibold mt-2 z-10 bg-black/70 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Posisikan Wajah Siswa di Frame Kamera
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Siswa / Santri
                </label>
                <select
                  value={faceStudentId}
                  onChange={(e) => setFaceStudentId(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 text-xs font-semibold text-slate-800 dark:text-slate-100"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.nama_lengkap} ({st.nis || st.nisn || 'No NIS'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowFaceModal(false)}
                  className="px-4 py-2.5 rounded-xl border text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Simpan Presensi Wajah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CBT QUIZ RUNNER PREVIEW MODAL */}
      {cbtPreviewModal && (
        <CbtQuizRunnerModal
          quiz={cbtPreviewModal}
          onClose={() => setCbtPreviewModal(null)}
        />
      )}
    </PageContainer>
  )
}

function CbtQuizRunnerModal({ quiz, onClose }) {
  const soalList = Array.isArray(quiz?.parsedSoal) ? quiz.parsedSoal : []
  const durasiMenit = Number(quiz?.durasi_menit) > 0 ? Number(quiz.durasi_menit) : 30
  const nilaiKkm = Number(quiz?.nilai_kkm) > 0 ? Number(quiz.nilai_kkm) : 75

  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [doubtful, setDoubtful] = useState({})
  const [timeLeft, setTimeLeft] = useState(durasiMenit * 60)
  const [isFinished, setIsFinished] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [resultData, setResultData] = useState(null)

  // Countdown timer
  useEffect(() => {
    if (isFinished) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleFinishExam()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isFinished])

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const currentSoal = soalList[currentIdx] || {}
  const totalQuestions = soalList.length
  const answeredCount = Object.keys(answers).filter((k) => answers[k] !== undefined && answers[k] !== '').length
  const doubtfulCount = Object.keys(doubtful).filter((k) => doubtful[k] === true).length

  const handleSelectAnswer = (ans) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIdx]: ans,
    }))
  }

  const toggleDoubtful = () => {
    setDoubtful((prev) => ({
      ...prev,
      [currentIdx]: !prev[currentIdx],
    }))
  }

  const handleFinishExam = () => {
    // Auto-calculate score
    let totalPoin = 0
    let earnedPoin = 0
    let correctCount = 0
    let wrongCount = 0

    soalList.forEach((s, idx) => {
      const bobot = Number(s.poin) > 0 ? Number(s.poin) : 1
      totalPoin += bobot

      const studentAns = String(answers[idx] || '').trim().toUpperCase()
      const keyAns = String(s.kunci_jawaban || '').trim().toUpperCase()

      if (studentAns && studentAns === keyAns) {
        earnedPoin += bobot
        correctCount++
      } else if (studentAns) {
        wrongCount++
      }
    })

    const finalScore = totalPoin > 0 ? Math.round((earnedPoin / totalPoin) * 100) : 0
    const passed = finalScore >= nilaiKkm

    setResultData({
      score: finalScore,
      totalPoin,
      earnedPoin,
      correctCount,
      wrongCount,
      unansweredCount: totalQuestions - (correctCount + wrongCount),
      passed,
      kkm: nilaiKkm,
    })
    setIsFinished(true)
    setShowConfirmModal(false)
  }

  const handleRestart = () => {
    setAnswers({})
    setDoubtful({})
    setCurrentIdx(0)
    setTimeLeft(durasiMenit * 60)
    setIsFinished(false)
    setResultData(null)
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#121926] w-full max-w-5xl rounded-[26px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[95vh] relative">
        {/* TOP BAR / RUNNER HEADER */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-emerald-700 text-white px-5 py-3.5 flex items-center justify-between gap-4 shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-yellow-300 shadow-inner">
              <Zap className="w-5 h-5 fill-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider">
                  CBT Quiz Runner
                </span>
                <span className="text-xs text-white/80 font-medium">
                  KKM: <strong className="text-white">{nilaiKkm}</strong>
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-white truncate max-w-md mt-0.5">
                {quiz?.judul || quiz?.judul_tugas || 'Kuis Interaktif'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* TIMER BADGE */}
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border backdrop-blur-md transition-all shadow-inner ${
              timeLeft < 300
                ? 'bg-rose-500/30 border-rose-400 text-rose-100 animate-pulse'
                : 'bg-white/15 border-white/25 text-white'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-black font-mono tracking-wide">
                {formatTimer(timeLeft)}
              </span>
            </div>

            {/* EXIT BUTTON */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              title="Tutup Runner CBT"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MAIN BODY: SPLIT VIEW (EXAM QUESTION OR RESULTS) */}
        {!isFinished ? (
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
            {/* LEFT / MOBILE TOP: QUESTION NUMBER PALETTE */}
            <div className="w-full md:w-64 bg-slate-50/70 dark:bg-slate-900/40 p-4 flex flex-col shrink-0 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  Daftar Soal
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {answeredCount} / {totalQuestions}
                </span>
              </div>

              {/* NUMBER SQUIRCLES GRID */}
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-4 gap-2">
                {soalList.map((s, idx) => {
                  const isAns = answers[idx] !== undefined && answers[idx] !== ''
                  const isDoubt = doubtful[idx] === true
                  const isCurr = currentIdx === idx

                  let btnColor = 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-400'
                  if (isDoubt) {
                    btnColor = 'bg-amber-500 text-white border-amber-600 shadow-xs'
                  } else if (isAns) {
                    btnColor = 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-9 rounded-xl font-bold text-xs border transition-all relative flex items-center justify-center cursor-pointer ${btnColor} ${
                        isCurr ? 'ring-2 ring-purple-600 ring-offset-2 dark:ring-offset-slate-900 scale-105 z-10' : ''
                      }`}
                    >
                      {idx + 1}
                      {isDoubt && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 border border-white rounded-full"></span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* PALETTE LEGEND */}
              <div className="mt-auto pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-md bg-emerald-600 shrink-0"></div>
                  <span>Sudah Dijawab ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-md bg-amber-500 shrink-0"></div>
                  <span>Ragu-ragu ({doubtfulCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-md bg-white dark:bg-slate-800 border border-slate-300 shrink-0"></div>
                  <span>Belum Dijawab ({totalQuestions - answeredCount})</span>
                </div>
              </div>

              {/* FINISH BUTTON IN SIDEBAR */}
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="mt-4 w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Kumpulkan Jawaban
              </button>
            </div>

            {/* RIGHT: QUESTION & ANSWER PANE */}
            <div className="flex-1 p-5 sm:p-7 overflow-y-auto flex flex-col justify-between space-y-6">
              {totalQuestions === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 text-center">
                  <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-2 animate-bounce" />
                  <p className="font-bold text-sm text-slate-700 dark:text-slate-300">Belum ada butir soal pada kuis ini</p>
                  <p className="text-xs text-slate-400 mt-1">Tambahkan butir soal di form edit kuis untuk menjalankan runner CBT.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-5">
                    {/* QUESTION HEADER BADGES */}
                    <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-black text-xs">
                          Soal No. {currentIdx + 1}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-[11px] uppercase">
                          {currentSoal.tipe === 'tf' ? 'Benar / Salah' : currentSoal.tipe === 'essay' ? 'Essay' : 'Pilihan Ganda'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-medium">
                          Bobot: <strong>{currentSoal.poin || 2} Poin</strong>
                        </span>
                        {currentSoal.tingkat_kesulitan && (
                          <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium capitalize">
                            {currentSoal.tingkat_kesulitan}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* QUESTION TEXT */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                      <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap">
                        {currentSoal.pertanyaan || currentSoal.soal || 'Isi pertanyaan...'}
                      </p>
                    </div>

                    {/* OPTIONS AREA */}
                    <div className="space-y-2.5 pt-1">
                      {currentSoal.tipe === 'tf' ? (
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: 'Benar', val: 'BENAR', color: 'emerald' },
                            { label: 'Salah', val: 'SALAH', color: 'rose' },
                          ].map((opt) => {
                            const isSelected = String(answers[currentIdx] || '').toUpperCase() === opt.val
                            return (
                              <button
                                key={opt.val}
                                type="button"
                                onClick={() => handleSelectAnswer(opt.val)}
                                className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                  isSelected
                                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 shadow-md ring-2 ring-purple-600/30'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200'
                                }`}
                              >
                                {opt.label}
                              </button>
                            )
                          })}
                        </div>
                      ) : currentSoal.tipe === 'essay' ? (
                        <div>
                          <textarea
                            rows={5}
                            value={answers[currentIdx] || ''}
                            onChange={(e) => handleSelectAnswer(e.target.value)}
                            placeholder="Tuliskan uraian atau jawaban lengkap Anda di sini..."
                            className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-xs sm:text-sm outline-none focus:border-purple-600 dark:text-white"
                          />
                        </div>
                      ) : (
                        // PILIHAN GANDA (A, B, C, D, E)
                        ['a', 'b', 'c', 'd', 'e'].map((letter) => {
                          const optionText = currentSoal[`opsi_${letter}`]
                          if (!optionText) return null
                          const upperLetter = letter.toUpperCase()
                          const isSelected = String(answers[currentIdx] || '').toUpperCase() === upperLetter

                          return (
                            <button
                              key={letter}
                              type="button"
                              onClick={() => handleSelectAnswer(upperLetter)}
                              className={`w-full p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3.5 cursor-pointer ${
                                isSelected
                                  ? 'border-purple-600 bg-purple-50/80 dark:bg-purple-950/40 shadow-sm ring-2 ring-purple-600/30'
                                  : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                              }`}
                            >
                              <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 transition-all ${
                                isSelected
                                  ? 'bg-purple-600 text-white shadow-md scale-105'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}>
                                {upperLetter}
                              </span>
                              <span className={`text-xs sm:text-sm font-medium flex-1 ${
                                isSelected
                                  ? 'text-purple-950 dark:text-purple-200 font-bold'
                                  : 'text-slate-800 dark:text-slate-200'
                              }`}>
                                {optionText}
                              </span>
                            </button>
                          )
                        })
                      )}
                    </div>
                  </div>

                  {/* BOTTOM ACTION BUTTONS */}
                  <div className="flex items-center justify-between gap-3 pt-5 border-t border-slate-100 dark:border-slate-800 flex-wrap">
                    <button
                      type="button"
                      disabled={currentIdx === 0}
                      onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Sebelumnya
                    </button>

                    <button
                      type="button"
                      onClick={toggleDoubtful}
                      className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                        doubtful[currentIdx]
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          : 'border-amber-300 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 hover:bg-amber-100/60'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                      {doubtful[currentIdx] ? 'Batalkan Ragu' : 'Tandai Ragu-Ragu'}
                    </button>

                    {currentIdx < totalQuestions - 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentIdx((prev) => Math.min(totalQuestions - 1, prev + 1))}
                        className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
                      >
                        Selanjutnya
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowConfirmModal(true)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Selesai Ujian
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          /* CBT SCORE RESULT SUMMARY VIEW */
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">
            <div className="text-center max-w-lg mx-auto space-y-3">
              <div className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center shadow-lg ${
                resultData?.passed
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white ring-4 ring-emerald-500/20'
                  : 'bg-gradient-to-br from-rose-500 to-amber-600 text-white ring-4 ring-rose-500/20'
              }`}>
                {resultData?.passed ? <Trophy className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
              </div>

              <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                resultData?.passed
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
              }`}>
                {resultData?.passed ? 'Tuntas / Memenuhi KKM' : 'Belum Memenuhi KKM'}
              </span>

              <div className="mt-2">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                  {resultData?.score}
                </span>
                <span className="text-sm font-bold text-slate-400 ml-1">/ 100</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nilai KKM Kuis: <strong>{nilaiKkm}</strong> • Total Bobot: {resultData?.earnedPoin} dari {resultData?.totalPoin} poin
              </p>
            </div>

            {/* QUICK KPI BREAKDOWN */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Jawaban Benar</span>
                <p className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{resultData?.correctCount}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/50 text-center">
                <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">Jawaban Salah</span>
                <p className="text-xl font-black text-rose-700 dark:text-rose-300 mt-1">{resultData?.wrongCount}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500">Tidak Dijawab</span>
                <p className="text-xl font-black text-slate-700 dark:text-slate-300 mt-1">{resultData?.unansweredCount}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/50 text-center">
                <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400">Total Butir</span>
                <p className="text-xl font-black text-purple-700 dark:text-purple-300 mt-1">{totalQuestions}</p>
              </div>
            </div>

            {/* QUESTION REVIEW ACCORDION / LIST */}
            <div className="max-w-3xl mx-auto space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Pembahasan & Kunci Jawaban
              </h4>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 divide-y divide-slate-100 dark:divide-slate-800">
                {soalList.map((s, idx) => {
                  const studentAns = String(answers[idx] || '').trim().toUpperCase()
                  const keyAns = String(s.kunci_jawaban || '').trim().toUpperCase()
                  const isCorrect = studentAns && studentAns === keyAns

                  return (
                    <div key={idx} className="pt-2.5 first:pt-0">
                      <div className="flex items-start gap-2 justify-between">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {idx + 1}. {s.pertanyaan || s.soal}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                          isCorrect
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}>
                          {isCorrect ? 'Benar (+poin)' : 'Salah'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-1.5 flex-wrap">
                        <span>Jawaban Anda: <strong className={isCorrect ? 'text-emerald-600' : 'text-rose-600'}>{studentAns || '(Kosong)'}</strong></span>
                        <span>Kunci Jawaban: <strong className="text-purple-600 dark:text-purple-400">{keyAns || '-'}</strong></span>
                      </div>
                      {s.pembahasan && (
                        <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg italic">
                          💡 Pembahasan: {s.pembahasan}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* RESULTS ACTION BUTTONS */}
            <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleRestart}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Ulangi Simulasi Kuis
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
              >
                <Check className="w-4 h-4" /> Tutup Pratinjau Runner
              </button>
            </div>
          </div>
        )}

        {/* CONFIRM FINISH MODAL OVERLAY */}
        {showConfirmModal && (
          <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1B2433] rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Kumpulkan Lembar Jawaban?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Anda telah menjawab <strong>{answeredCount}</strong> dari {totalQuestions} soal.
                {doubtfulCount > 0 && ` Masih ada ${doubtfulCount} soal bertanda ragu-ragu.`}
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Periksa Lagi
                </button>
                <button
                  type="button"
                  onClick={handleFinishExam}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Ya, Kumpulkan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SubmissionRowItem({ sub, index, onSaveGrade, isSaving }) {
  const student = sub.student || sub.siswa || {}
  const [localGrade, setLocalGrade] = useState(sub.nilai_guru !== null && sub.nilai_guru !== undefined ? sub.nilai_guru : '')
  const [localNotes, setLocalNotes] = useState(sub.catatan_guru || '')
  const [showAnswerPreview, setShowAnswerPreview] = useState(false)

  const isGraded = sub.nilai_guru !== null && sub.nilai_guru !== undefined && sub.nilai_guru !== ''
  const isLate = sub.status === 'terlambat'
  const formattedDate = sub.waktu_kumpul
    ? new Date(sub.waktu_kumpul).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
    : '-'

  return (
    <div className="p-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition space-y-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-400 w-5">{index + 1}</span>
          <div className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 font-bold flex items-center justify-center text-xs shrink-0">
            {(student.full_name || student.nama_lengkap || 'S').charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">
              {student.full_name || student.nama_lengkap || 'Siswa'}
            </h4>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[10px] text-slate-400 font-mono">NIS: {student.nis || '-'}</span>
              <span className="text-[10px] text-slate-400">• Dikumpulkan: {formattedDate}</span>
              {isLate ? (
                <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 text-[9px] font-bold rounded">Terlambat</span>
              ) : (
                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 text-[9px] font-bold rounded">Tepat Waktu</span>
              )}
            </div>
          </div>
        </div>

        {/* Grade Action & Badge */}
        <div className="flex items-center gap-2 sm:self-center">
          {isGraded ? (
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-extrabold text-xs rounded-lg">
              Nilai: {sub.nilai_guru}
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold text-[10px] rounded-lg">
              Belum Dinilai
            </span>
          )}
        </div>
      </div>

      {/* Answers & Attachment */}
      <div className="pl-8 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          {sub.jawaban_teks && (
            <button
              type="button"
              onClick={() => setShowAnswerPreview(!showAnswerPreview)}
              className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              {showAnswerPreview ? 'Tutup Jawaban Teks' : 'Lihat Jawaban Teks'}
            </button>
          )}
          {(sub.file_url || sub.file_path) && (
            <a
              href={sub.file_url || sub.file_path}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh / Buka Berkas Lampiran
            </a>
          )}
          {!sub.jawaban_teks && !sub.file_url && !sub.file_path && (
            <span className="text-[11px] text-slate-400 italic">Tidak ada lampiran berkas</span>
          )}
        </div>

        {/* Input Nilai & Catatan Inline */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="100"
            value={localGrade}
            onChange={(e) => setLocalGrade(e.target.value)}
            placeholder="0-100"
            className="w-16 h-8 text-center text-xs font-bold border rounded-lg dark:bg-slate-800 border-slate-200 dark:border-slate-700 outline-none focus:border-emerald-600"
          />
          <input
            type="text"
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            placeholder="Catatan / Feedback guru..."
            className="w-40 sm:w-52 h-8 px-2.5 text-xs border rounded-lg dark:bg-slate-800 border-slate-200 dark:border-slate-700 outline-none focus:border-emerald-600"
          />
          <button
            type="button"
            disabled={isSaving}
            onClick={() => onSaveGrade(sub.id, localGrade, localNotes)}
            className="h-8 px-3 bg-[#0E5C44] hover:bg-emerald-800 text-white font-bold text-[11px] rounded-lg shadow-xs flex items-center gap-1 transition disabled:opacity-60 shrink-0"
          >
            {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Simpan
          </button>
        </div>
      </div>

      {/* Answer Preview Box */}
      {showAnswerPreview && sub.jawaban_teks && (
        <div className="ml-8 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap border border-slate-200 dark:border-slate-700">
          <p className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-1">Isi Jawaban Siswa:</p>
          {sub.jawaban_teks}
        </div>
      )}
    </div>
  )
}
