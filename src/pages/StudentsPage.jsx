import { useEffect, useMemo, useState, useRef, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaDownload,
  FaEdit,
  FaEye,
  FaFileExcel,
  FaFileImport,
  FaFilter,
  FaPlus,
  FaPrint,
  FaSearch,
  FaMale,
  FaFemale,
  FaBuilding,
  FaTimes,
  FaTrash,
  FaUpload,
  FaUser,
  FaUserGraduate,
} from 'react-icons/fa'
import { cn } from '../lib/utils'
import CetakKartuSiswaModal from '../components/siswa/CetakKartuSiswaModal'

// ── 1. TOP-LEVEL MODULE SCOPE LAZY IMPORT (ATURAN EMAS 1) ──
// Modal formulir siswa 5-langkah dipisah ke chunk terpisah dan hanya dimuat saat tombol Tambah/Edit ditekan
const StudentFormModal = lazy(() => import('../components/siswa/StudentFormModal'))

import StudentLeaderAnalyticsSection from '../components/siswa/StudentLeaderAnalyticsSection'
import ActionDropdown from '../components/app/ActionDropdown'
import { Button } from '../components/ui/button'
import { TableRoot, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table'
import { useToast } from '../components/app'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppBadge from '../components/app/AppBadge'
import AppDataTable from '../components/app/AppDataTable'
import { api } from '../services/api'
import { useDaftarKelas } from '../hooks/useReferenceData'
import { useAksiSiswa, useDaftarSiswa } from '../hooks/useStudents'
import { educationUnitService } from '../services/educationUnitService'
import { studentService } from '../services/studentService'
import { studentMutationService } from '../services/studentMutationService'
import { businessOptionService } from '../services/businessOptionService'
import { studentStatusService } from '../services/studentStatusService'
import PersonAvatar, { resolveAvatarUrl } from '../components/ui/PersonAvatar'
import PersonIdentityCell from '../components/ui/PersonIdentityCell'
import { hasAnyRole, getUserRoleLevel, ROLE_LEVELS, ROLES, isFoundationUser, isLeaderRole as checkIsLeaderRole } from '../auth/portalResolver'
import { SmartScrollFab } from '../components/common'
import { useAuthStore } from '../stores/authStore'
import { usePengaturanStore, useTerminology } from '../stores/pengaturanStore'
import PageContainer from '../components/app/PageContainer'
import { HeroUiHeader } from '../components/ui/HeroUiHeader'
import {
  Printer,
  ShieldCheck,
  Sparkles,
  MessageSquare,
  Phone,
  Send,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Trash2,
  AlertTriangle,
  X,
  Download,
  Upload,
  FileSpreadsheet,
  Info,
  GraduationCap,
  Plus,
  Pencil,
  School,
  Save,
  ArrowRightLeft,
  CreditCard,
  Building2,
  Lock,
  Clock,
  FileText,
  Check,
  ChevronDown,
  Search,
} from 'lucide-react'
import {
  Select as HeroSelect,
  SelectTrigger as HeroSelectTrigger,
  SelectValue as HeroSelectValue,
  SelectContent as HeroSelectContent,
  SelectItem as HeroSelectItem,
} from '../components/ui/select'
import {
  OverlayWrapper,
  Backdrop,
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { handleApiExport, downloadFileFromApi } from '../utils/exportUtils'
import { parseSpreadsheetFile } from '../utils/spreadsheetParser'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import {
  MasterActionButton,
  MasterDataPage,
  MasterDataSection,
  MasterFilterSelect,
  MasterPageHeader,
  MasterStatCard,
  MasterStatsGrid,
  PrintOptionModal,
} from '../components/master-data'

const initialForm = () => ({
  id: null,
  // Step 1: Data Siswa
  nis: '',
  nisn: '',
  full_name: '',
  birth_place: '',
  birth_date: '',
  gender: 'male',
  agama: 'Islam',
  foto_url: '',

  // Step 2: Ortu / Wali
  nama_ayah: '',
  pekerjaan_ayah: '',
  hp_ayah: '',
  nama_ibu: '',
  pekerjaan_ibu: '',
  hp_ibu: '',
  nama_wali: '',
  hp_wali: '',
  alamat_ortu: '',

  // Step 3: Akademik
  unit_id: '',
  kelas_id: '',
  kelas_label: '',
  rombel: '',
  tahun_ajaran: '',
  tanggal_masuk: '',
  no_induk_sebelumnya: '',
  status_siswa: 'aktif',
  kurikulum: 'Kurikulum Merdeka',
  beasiswa: 'Tidak Ada',
  catatan: '',
})

// ── HEROUI FILTER BAR SELECT DROPDOWN COMPONENT ──
function HeroUiFilterSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Pilih...',
  icon: IconComponent = null,
  className = '',
  popoverWidth = 'w-full',
  searchable = false,
  ariaLabel = '',
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const selectedOption = useMemo(() => {
    return options.find((opt) => String(opt.value) === String(value))
  }, [options, value])

  const filteredOptions = useMemo(() => {
    if (!searchable || !search.trim()) return options
    const q = search.toLowerCase()
    return options.filter((opt) =>
      (opt.label && String(opt.label).toLowerCase().includes(q)) ||
      (opt.subtext && String(opt.subtext).toLowerCase().includes(q))
    )
  }, [options, search, searchable])

  const hasValue = value !== '' && value !== 'semua' && value !== 'all' && value !== undefined && value !== null

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev)
            setSearch('')
          }
        }}
        className={`h-9 w-full flex items-center justify-between gap-2 rounded-xl border px-3 text-xs font-semibold transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
          isOpen
            ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 dark:border-emerald-400 dark:bg-slate-800 dark:ring-emerald-400/20 text-slate-900 dark:text-white shadow-xs'
            : hasValue
            ? 'border-emerald-400/80 bg-emerald-50/80 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200 font-bold'
            : 'border-slate-300 dark:border-slate-700 bg-white text-slate-700 hover:border-emerald-400 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {IconComponent && (
            <IconComponent className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`size-3.5 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute left-0 top-full mt-1.5 z-[90] ${popoverWidth} min-w-[200px] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 shadow-xl shadow-slate-900/10 dark:shadow-black/40`}
          >
            {searchable && options.length > 5 && (
              <div className="p-1.5 border-b border-slate-100 dark:border-slate-700/60 mb-1">
                <div className="relative">
                  <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari..."
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 pl-8 pr-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div className="max-h-56 overflow-y-auto space-y-0.5">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-3 text-center text-xs text-slate-400 dark:text-slate-500">
                  Tidak ada data
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = String(opt.value) === String(value)
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => {
                        onChange(opt.value)
                        setIsOpen(false)
                        setSearch('')
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors text-left cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate">{opt.label}</div>
                        {opt.subtext && (
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal truncate mt-0.5">
                            {opt.subtext}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const MODERN_CARD_TONES = {
  emerald: {
    container: 'border-2 border-emerald-300/90 bg-gradient-to-br from-emerald-100/80 via-teal-50/50 to-white hover:border-emerald-400 hover:shadow-emerald-500/20 dark:border-emerald-600/70 dark:from-emerald-950/60 dark:via-teal-950/40 dark:to-slate-900',
    topBar: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600',
    activeCard: 'ring-2 ring-emerald-500 shadow-md shadow-emerald-500/20',
    badgeBg: 'bg-emerald-100/90 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-300/70 dark:border-emerald-700',
    glow: 'bg-emerald-400/25 group-hover:bg-emerald-400/40',
    iconBox: 'from-emerald-500 via-emerald-600 to-teal-700 shadow-md shadow-emerald-500/30',
    title: 'text-emerald-800 dark:text-emerald-300',
    val: 'text-emerald-600 dark:text-emerald-400',
    sub: 'text-emerald-700/90 dark:text-emerald-300/80',
    cta: 'text-emerald-600 dark:text-emerald-400',
    footerBorder: 'border-emerald-200/80 dark:border-emerald-800/60',
  },
  blue: {
    container: 'border-2 border-blue-300/90 bg-gradient-to-br from-blue-100/80 via-sky-50/50 to-white hover:border-blue-400 hover:shadow-blue-500/20 dark:border-blue-600/70 dark:from-blue-950/60 dark:via-sky-950/40 dark:to-slate-900',
    topBar: 'bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-600',
    activeCard: 'ring-2 ring-blue-500 shadow-md shadow-blue-500/20',
    badgeBg: 'bg-blue-100/90 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border border-blue-300/70 dark:border-blue-700',
    glow: 'bg-blue-400/25 group-hover:bg-blue-400/40',
    iconBox: 'from-blue-500 via-blue-600 to-indigo-700 shadow-md shadow-blue-500/30',
    title: 'text-blue-800 dark:text-blue-300',
    val: 'text-blue-600 dark:text-blue-400',
    sub: 'text-blue-700/90 dark:text-blue-300/80',
    cta: 'text-blue-600 dark:text-blue-400',
    footerBorder: 'border-blue-200/80 dark:border-blue-800/60',
  },
  rose: {
    container: 'border-2 border-rose-300/90 bg-gradient-to-br from-rose-100/80 via-pink-50/50 to-white hover:border-rose-400 hover:shadow-rose-500/20 dark:border-rose-600/70 dark:from-rose-950/60 dark:via-pink-950/40 dark:to-slate-900',
    topBar: 'bg-gradient-to-r from-rose-500 via-pink-400 to-red-600',
    activeCard: 'ring-2 ring-rose-500 shadow-md shadow-rose-500/20',
    badgeBg: 'bg-rose-100/90 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 border border-rose-300/70 dark:border-rose-700',
    glow: 'bg-rose-400/25 group-hover:bg-rose-400/40',
    iconBox: 'from-rose-500 via-rose-600 to-red-700 shadow-md shadow-rose-500/30',
    title: 'text-rose-800 dark:text-rose-300',
    val: 'text-rose-600 dark:text-rose-400',
    sub: 'text-rose-700/90 dark:text-rose-300/80',
    cta: 'text-rose-600 dark:text-rose-400',
    footerBorder: 'border-rose-200/80 dark:border-rose-800/60',
  },
  amber: {
    container: 'border-2 border-amber-300/90 bg-gradient-to-br from-amber-100/80 via-orange-50/50 to-white hover:border-amber-400 hover:shadow-amber-500/20 dark:border-amber-600/70 dark:from-amber-950/60 dark:via-orange-950/40 dark:to-slate-900',
    topBar: 'bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600',
    activeCard: 'ring-2 ring-amber-500 shadow-md shadow-amber-500/20',
    badgeBg: 'bg-amber-100/90 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-300/70 dark:border-amber-700',
    glow: 'bg-amber-400/25 group-hover:bg-amber-400/40',
    iconBox: 'from-amber-500 via-orange-600 to-amber-700 shadow-md shadow-amber-500/30',
    title: 'text-amber-800 dark:text-amber-300',
    val: 'text-amber-600 dark:text-amber-400',
    sub: 'text-amber-700/90 dark:text-amber-300/80',
    cta: 'text-amber-600 dark:text-amber-400',
    footerBorder: 'border-amber-200/80 dark:border-amber-800/60',
  },
}

function KpiTintedCard({ icon: Icon, label, subtext, value, tag, tone = 'emerald', active, onClick, isLoading = false }) {
  const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-[20px] text-left transition-all duration-300 cursor-pointer shadow-xs hover:shadow-xl",
        t.container,
        active && t.activeCard
      )}
    >
      {/* Top Accent Gradient Line */}
      <div className={cn("h-1.5 w-full shrink-0", t.topBar)} />

      <div className="p-4.5 sm:p-5 flex flex-col justify-between flex-1 relative w-full">
        {/* Ambient Backlight Glow */}
        <div className={cn("pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all duration-500 opacity-60 group-hover:opacity-100", t.glow)} />

        <div>
          {/* Header with Tag & 3D Gradient Squircle Icon */}
          <div className="relative z-10 flex items-start justify-between gap-2.5 mb-2.5">
            <div className="min-w-0 flex-1 space-y-1">
              <span className={cn("inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider", t.badgeBg)}>
                {tag || label}
              </span>
              <p className={cn("text-xs font-bold pt-0.5 truncate uppercase tracking-wider", t.title)}>{label}</p>
            </div>

            {/* 3D Squircle Icon Badge */}
            <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-105", t.iconBox)}>
              <Icon className="size-5 text-white" strokeWidth={2.2} />
            </div>
          </div>

          {/* Metric Value & Subtitle */}
          <div className="relative z-10 mt-1">
            {isLoading ? (
              <div className="mt-2 h-9 w-24 animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-700/80" />
            ) : (
              <p className={cn("text-3xl sm:text-4xl font-black tabular-nums tracking-tight", t.val)}>
                {Number(value ?? 0).toLocaleString('id-ID')}
              </p>
            )}
            {subtext && (
              <p className={cn("mt-1 text-xs font-semibold line-clamp-1", t.sub)}>
                {subtext}
              </p>
            )}
          </div>
        </div>

        {/* Click Affordance Footer */}
        {onClick && (
          <div className={cn("relative z-10 mt-3.5 pt-2.5 border-t flex items-center justify-between text-[11px] font-bold", t.footerBorder)}>
            <span className="text-slate-400 dark:text-slate-500 font-medium text-[10px]">Klik untuk detail</span>
            <span className={cn("inline-flex items-center gap-1 transition-transform group-hover:translate-x-0.5", t.cta)}>
              Lihat Data &rarr;
            </span>
          </div>
        )}
      </div>
    </motion.button>
  )
}

export default function StudentsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useAuthStore((state) => state.user)
  const sitePengaturan = usePengaturanStore((state) => state.pengaturan)
  const terms = useTerminology()
  const permissions = user?.permissions || []
  const userRoles = useMemo(() => {
    if (!user) return []
    if (Array.isArray(user.roles)) return user.roles.map((r) => (typeof r === 'string' ? r : r.name || ''))
    if (user.role) return [typeof user.role === 'string' ? user.role : user.role.name || '']
    return []
  }, [user])
  const userLevel = useMemo(() => getUserRoleLevel(user), [user])
  const isSuperAdmin = userLevel === ROLE_LEVELS.ADMIN_SISTEM // Level 1
  const isYayasan = userLevel === ROLE_LEVELS.YAYASAN // Level 2
  const isSuperAdminOrYayasan = userLevel <= ROLE_LEVELS.YAYASAN // Level 1-2: Admin & Yayasan
  const isKepalaSekolah = useMemo(() => userLevel === ROLE_LEVELS.KEPALA_SEKOLAH, [userLevel]) // Level 4

  // Deteksi role Divisi Pendidikan (akses supervisi lintas unit)
  const isDivisiPendidikan = useMemo(() => {
    if (isSuperAdminOrYayasan) return false
    return (
      userLevel === ROLE_LEVELS.DIVISI_PENDIDIKAN ||
      hasAnyRole(userRoles, ROLES.DIVISI) ||
      userRoles.some((r) => /divisi|bidang[\s_]*pendidikan|pengawasan[\s_]*akademik/i.test(r))
    )
  }, [userLevel, userRoles, isSuperAdminOrYayasan])

  // Deteksi role pimpinan (Super Admin, Yayasan, Divisi Pendidikan, Kepala Sekolah)
  const isLeaderRole = useMemo(() => {
    return isSuperAdminOrYayasan || isKepalaSekolah || isDivisiPendidikan || checkIsLeaderRole(user)
  }, [isSuperAdminOrYayasan, isKepalaSekolah, isDivisiPendidikan, user])

  // Divisi Pendidikan, Super Admin, Admin, dan Yayasan dapat memilih seluruh unit pendidikan (Semua Unit)
  const canSelectUnit = isSuperAdminOrYayasan || isDivisiPendidikan
  const isGlobalUser = canSelectUnit
  const isFoundationRole = useMemo(() => isFoundationUser(user), [user])
  const canCreateStudent = !isFoundationRole && (isSuperAdmin || isKepalaSekolah || isDivisiPendidikan || permissions.includes('student.create'))
  const canUpdateStudent = !isFoundationRole && (isSuperAdmin || isKepalaSekolah || isDivisiPendidikan || permissions.includes('student.update'))
  const canDeleteStudent = !isFoundationRole && (isSuperAdmin || isKepalaSekolah || permissions.includes('student.delete'))
  const canExportStudent = !isFoundationRole && (isSuperAdmin || isKepalaSekolah || isDivisiPendidikan || permissions.includes('student.export'))
  const canImportStudent = !isFoundationRole && (isSuperAdmin || permissions.includes('student.import') || hasAnyRole(user, ['Admin', 'Operator', 'Tata Usaha', 'TU']))
  const canManageVaBsi = !isFoundationRole && (isSuperAdmin || isLeaderRole || hasAnyRole(user, ['Super Admin', 'Admin', 'Operator', 'Tata Usaha', 'TU', 'Admin Madrasah', 'Admin Sekolah']))
  const [showGenerateVaModal, setShowGenerateVaModal] = useState(false)
  const [isGeneratingVa, setIsGeneratingVa] = useState(false)
  const [forceOverwriteVa, setForceOverwriteVa] = useState(false)
  const [step, setStep] = useState(1)

  const userUnitId = user?.unit_id || user?.education_unit_id || user?.employee?.unit_id || user?.metadata?.education_unit_id || user?.metadata?.unit_id || ''

  // Filters: jika bukan user yang berhak pilih unit (canSelectUnit) dan memiliki userUnitId, default filter otomatis terkunci ke unit pengguna
  const [unitFilter, setUnitFilter] = useState(() => (!canSelectUnit && userUnitId ? String(userUnitId) : ''))
  const [kelasFilter, setKelasFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Dynamic Student Status Options (SSOT dari tabel student_statuses database)
  const { data: studentStatusOptionsData } = useQuery({
    queryKey: ['student-statuses-dropdown'],
    queryFn: () => studentStatusService.getDropdown(),
    staleTime: 10 * 60 * 1000,
  })

  const studentStatusOptions = useMemo(() => {
    const raw = studentStatusOptionsData?.data || studentStatusOptionsData?.items || studentStatusOptionsData || []
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((item) => ({
        value: typeof item === 'string' ? item.toLowerCase() : String(item.code || item.value || item.name || '').toLowerCase(),
        label: typeof item === 'string' ? item : (item.name || item.label || item.value || ''),
      }))
    }
    return []
  }, [studentStatusOptionsData])

  // Modal Control States
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [showCetakModal, setShowCetakModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFormat, setExportFormat] = useState('xlsx')
  const [isExporting, setIsExporting] = useState(false)
  const [statCardModal, setStatCardModal] = useState({
    isOpen: false,
    title: '',
    filterType: '',
  })
  const [statModalSearch, setStatModalSearch] = useState('')

  // Import Data States
  const [importFile, setImportFile] = useState(null)
  const [importPreviewData, setImportPreviewData] = useState([])
  const [isImporting, setIsImporting] = useState(false)
  const [overwriteExisting, setOverwriteExisting] = useState(false)
  const [duplicateModalData, setDuplicateModalData] = useState(null)

  // Selected student data
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [activeDetailTab, setActiveDetailTab] = useState('siswa')
  const [studentToPrint, setStudentToPrint] = useState(null)
  const [showPrintOptionModal, setShowPrintOptionModal] = useState(false)

  // Form State
  const [formData, setFormData] = useState(initialForm())
  const [isEdit, setIsEdit] = useState(false)

  // Toast Notification Stack (Global)
  const { pushToast } = useToast()

  // Delete Confirmation Dialog state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [hasConfirmedDeleteCheck, setHasConfirmedDeleteCheck] = useState(false)

  // Save / Update Confirmation Dialog state (Harmonized Modal)
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = useState(false)
  const [pendingSavePayload, setPendingSavePayload] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  // ── Two-Way Handshake Student Mutations (Pindah Unit) ──
  const [showAjukanMutasiModal, setShowAjukanMutasiModal] = useState(false)
  const [studentToMutate, setStudentToMutate] = useState(null)
  const [mutasiForm, setMutasiForm] = useState({
    unit_tujuan_id: '',
    alasan: '',
    catatan: '',
  })
  const [isSubmittingMutasi, setIsSubmittingMutasi] = useState(false)

  // Incoming Mutations (Siswa Pindahan Masuk yang Menunggu Persetujuan TU)
  const [showIncomingModal, setShowIncomingModal] = useState(false)
  const [incomingMutations, setIncomingMutations] = useState([])
  const [isLoadingIncoming, setIsLoadingIncoming] = useState(false)
  const [selectedIncomingForApproval, setSelectedIncomingForApproval] = useState(null)
  const [approvalKelasId, setApprovalKelasId] = useState('')
  const [approvalCatatan, setApprovalCatatan] = useState('')
  const [isProcessingApproval, setIsProcessingApproval] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  const fetchIncomingMutations = async () => {
    try {
      setIsLoadingIncoming(true)
      const data = await studentMutationService.getIncoming()
      setIncomingMutations(Array.isArray(data) ? data : (data?.data || []))
    } catch {
      // quiet fallback
    } finally {
      setIsLoadingIncoming(false)
    }
  }

  useEffect(() => {
    fetchIncomingMutations()
  }, [])

  const handleOpenAjukanMutasi = (student) => {
    setStudentToMutate(student)
    setMutasiForm({
      unit_tujuan_id: '',
      alasan: '',
      catatan: '',
    })
    setShowAjukanMutasiModal(true)
  }

  const handleSubmitAjukanMutasi = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!mutasiForm.unit_tujuan_id) {
      pushToast('Peringatan', 'Silakan pilih Unit Pendidikan Tujuan terlebih dahulu.', 'warning')
      return
    }
    try {
      setIsSubmittingMutasi(true)
      await studentMutationService.requestMutasi({
        student_id: studentToMutate.id,
        target_unit_id: mutasiForm.unit_tujuan_id,
        unit_tujuan_id: mutasiForm.unit_tujuan_id,
        jenis_mutasi: 'pindah_unit_internal',
        alasan: mutasiForm.alasan,
        catatan: mutasiForm.catatan,
      })
      pushToast('Berhasil', `Pengajuan pindah unit untuk ${studentToMutate.name || studentToMutate.full_name} berhasil dikirim ke antrean TU unit tujuan.`, 'success')
      setShowAjukanMutasiModal(false)
      setStudentToMutate(null)
      refetch()
    } catch (err) {
      pushToast('Gagal', err?.response?.data?.message || 'Gagal mengajukan mutasi siswa.', 'error')
    } finally {
      setIsSubmittingMutasi(false)
    }
  }

  const handleApproveIncoming = async () => {
    if (!approvalKelasId) {
      pushToast('Peringatan', 'TU wajib memilih kelas tujuan penempatan siswa.', 'warning')
      return
    }
    try {
      setIsProcessingApproval(true)
      await studentMutationService.approveMutasi(selectedIncomingForApproval.id, {
        kelas_id: approvalKelasId,
        kelas_tujuan_id: approvalKelasId,
        catatan: approvalCatatan,
      })
      pushToast('Berhasil', 'Siswa berhasil disetujui, ditempatkan di kelas tujuan, dan diaktifkan di unit ini!', 'success')
      setSelectedIncomingForApproval(null)
      setApprovalKelasId('')
      setApprovalCatatan('')
      fetchIncomingMutations()
      refetch()
    } catch (err) {
      pushToast('Gagal', err?.response?.data?.message || 'Gagal menyetujui mutasi siswa.', 'error')
    } finally {
      setIsProcessingApproval(false)
    }
  }

  const handleRejectIncoming = async () => {
    if (!rejectReason.trim()) {
      pushToast('Peringatan', 'Silakan isi alasan penolakan mutasi.', 'warning')
      return
    }
    try {
      setIsProcessingApproval(true)
      await studentMutationService.rejectMutasi(selectedIncomingForApproval.id, {
        catatan_penolakan: rejectReason,
        alasan_penolakan: rejectReason,
      })
      pushToast('Informasi', 'Pengajuan mutasi siswa ditolak dan dikembalikan ke unit asal.', 'info')
      setShowRejectDialog(false)
      setSelectedIncomingForApproval(null)
      setRejectReason('')
      fetchIncomingMutations()
      refetch()
    } catch (err) {
      pushToast('Gagal', err?.response?.data?.message || 'Gagal menolak mutasi siswa.', 'error')
    } finally {
      setIsProcessingApproval(false)
    }
  }

  useEffect(() => {
    if (searchParams.get('action') !== 'add') return

    if (canCreateStudent) {
      setIsEdit(false)
      setSelectedStudent(null)
      setShowFormModal(true)
    }

    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('action')
    setSearchParams(nextParams, { replace: true })
  }, [canCreateStudent, searchParams, setSearchParams])

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const extractArray = (input) => {
    if (Array.isArray(input)) return input
    if (input && Array.isArray(input.data)) return input.data
    if (input && input.data && Array.isArray(input.data.data)) return input.data.data
    return []
  }

  // Hooks data API
  const { data: daftarSiswaData, isLoading, isError, refetch } = useDaftarSiswa({
    page: currentPage,
    per_page: itemsPerPage,
    search: searchQuery || undefined,
    unit_id: unitFilter || undefined,
    kelas_id: kelasFilter || undefined,
    status: statusFilter || undefined,
  })
  const { data: daftarKelasData } = useDaftarKelas(
    { per_page: 300 },
    { staleTime: 5 * 60 * 1000 },
  )
  const { data: daftarUnitData } = useQuery({
    queryKey: ['education-units', 'student-filters-all'],
    queryFn: async () => {
      try {
        const res1 = await educationUnitService.getDaftar({ per_page: 100 })
        const list1 = extractArray(res1)
        if (list1.length > 0) return list1
      } catch (e) { /* quiet */ }

      try {
        const res2 = await api.get('/foundation/units')
        const list2 = extractArray(res2.data || res2)
        if (list2.length > 0) return list2
      } catch (e) { /* quiet */ }

      return []
    },
    staleTime: 5 * 60 * 1000,
  })
  const { data: studentDashboardData, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['students-dashboard-summary', unitFilter],
    queryFn: () => studentService.getDashboard({ unit_id: unitFilter || undefined }),
  })
  const { tambah, ubah, hapus } = useAksiSiswa()

  const rawStudents = daftarSiswaData?.data || []
  const rawClasses = extractArray(daftarKelasData)
  const rawUnitsFromApi = extractArray(daftarUnitData)

  const rawUnits = useMemo(() => {
    const combined = [...rawUnitsFromApi]

    // Fallback: extract unique units from loaded student data if any
    if (rawStudents.length > 0) {
      rawStudents.forEach((s) => {
        const uName = s.unit_name || s.unit_nama || s.unit_pendidikan || s.unit?.name || s.unit?.nama || (typeof s.unit === 'string' ? s.unit : '') || ''
        const uId = s.unit_id || s.education_unit_id || s.unit?.id || uName
        if (uName && !combined.some((u) => String(u.id || u.nama_unit || u.name) === String(uId) || (u.name || u.nama_unit || u.nama) === uName)) {
          combined.push({ id: uId, name: uName, nama_unit: uName, nama: uName })
        }
      })
    }

    return combined
  }, [rawUnitsFromApi, rawStudents])

  const selectedUnitName = useMemo(() => {
    if (!unitFilter || unitFilter === 'Semua') return ''
    const u = rawUnits.find((item) => String(item.id) === String(unitFilter))
    if (u?.name || u?.nama_unit || u?.nama) return u.name || u.nama_unit || u.nama
    if (String(unitFilter) === String(userUnitId)) {
      return user?.unit?.name || user?.unit_name || user?.employee?.unit?.name || user?.metadata?.unit_name || ''
    }
    return ''
  }, [unitFilter, rawUnits, userUnitId, user])

  // ── Dynamic Available Classes per Selected Unit ─────────────────────────
  const availableClasses = useMemo(() => {
    if (!unitFilter) return rawClasses
    const filterVal = String(unitFilter).toLowerCase().trim()
    const selectedUnitObj = rawUnits.find((u) => {
      const uName = (u.nama_unit || u.name || u.nama || u.unit_name || '').toLowerCase()
      const uCode = (u.code || u.kode || '').toLowerCase()
      const uId = String(u.id || '').toLowerCase()
      return uId === filterVal || (uName && (uName.includes(filterVal) || filterVal.includes(uName))) || (uCode && uCode === filterVal)
    })

    const targetUnitId = selectedUnitObj ? String(selectedUnitObj.id).toLowerCase() : filterVal
    const targetUnitName = selectedUnitObj
      ? (selectedUnitObj.nama_unit || selectedUnitObj.name || selectedUnitObj.nama || '').toLowerCase()
      : filterVal

    const filtered = rawClasses.filter((c) => {
      const cUnitId = String(c.unit_pendidikan_id || c.unit_id || c.unit?.id || c.education_unit_id || '').toLowerCase()
      const cUnitName = String(c.unit_name || c.unit_nama || c.unit?.name || c.unit_pendidikan || c.nama_unit || c.unit || '').toLowerCase()

      if (cUnitId && (cUnitId === targetUnitId || cUnitId === filterVal)) return true
      if (cUnitName && targetUnitName && (cUnitName.includes(targetUnitName) || targetUnitName.includes(cUnitName))) return true

      return false
    })

    // Fallback if API classes direct match is empty
    if (filtered.length === 0) {
      const studentClassesMap = new Map()
      ;(daftarSiswaData?.data || []).forEach((s) => {
        let cId = ''
        let cName = ''
        if (s.kelas && typeof s.kelas === 'object') {
          cId = s.kelas.id || s.kelas.nama_kelas || s.kelas.name || ''
          cName = s.kelas.nama_kelas || s.kelas.name || s.kelas.nama || ''
        } else if (typeof s.kelas === 'string' && s.kelas.trim()) {
          cId = s.kelas.trim()
          cName = s.kelas.trim()
        }
        if (!cName && s.class_name) {
          cName = typeof s.class_name === 'string' ? s.class_name : (s.class_name?.name || s.class_name?.nama_kelas || '')
          cId = cId || cName
        }
        if (!cName && s.nama_kelas) {
          cName = typeof s.nama_kelas === 'string' ? s.nama_kelas : (s.nama_kelas?.name || s.nama_kelas?.nama_kelas || '')
          cId = cId || cName
        }
        if (cName && !studentClassesMap.has(String(cId || cName))) {
          studentClassesMap.set(String(cId || cName), {
            id: String(cId || cName),
            nama_kelas: String(cName),
            name: String(cName),
          })
        }
      })

      const studentClasses = Array.from(studentClassesMap.values())
      if (studentClasses.length > 0) return studentClasses
    }

    return filtered
  }, [rawClasses, rawUnits, unitFilter, daftarSiswaData])

  // Auto-reset filter kelas jika unit pendidikan berganti dan kelas aktif tidak terdapat di unit baru
  useEffect(() => {
    if (kelasFilter && kelasFilter !== 'Semua' && availableClasses.length > 0) {
      const exists = availableClasses.some((c) => {
        const cId = String(c?.id ?? c?.nama_kelas ?? c?.name ?? c?.nama ?? '').toLowerCase().trim()
        const cName = String(c?.nama_kelas ?? c?.name ?? c?.nama ?? '').toLowerCase().trim()
        const target = String(kelasFilter).toLowerCase().trim()
        return cId === target || cName === target
      })
      if (!exists) {
        setKelasFilter('')
      }
    }
  }, [availableClasses, kelasFilter])

  const studentPagination = {
    total: daftarSiswaData?.total || 0,
    from: daftarSiswaData?.from || 0,
    to: daftarSiswaData?.to || 0,
    lastPage: daftarSiswaData?.last_page || 1,
  }
  const studentStats = studentDashboardData?.statistik || {}
  const genderStats = studentDashboardData?.komposisi_gender || {}

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCurrentPage(1)
      setSearchQuery(searchInput.trim())
    }, 400)

    return () => window.clearTimeout(timer)
  }, [searchInput])

  // --- Handlers Import ---
  const handleDownloadTemplateSiswa = () => {
    const headers = [
      'No Pendaftaran', 'NIK', 'No Registrasi Akta Lahir', 'No KK', 'Nama Lengkap',
      'Tanggal Lahir', 'Tempat Lahir', 'Jenis Kelamin', 'Agama', 'Email',
      'Anak Ke', 'Jumlah Saudara', 'Jumlah Saudara tiri', 'Berat Badan', 'Tinggi Badan',
      'Riwayat Penyakit', 'Kewarganegaraan', 'Alamat Siswa', 'RT', 'RW', 'Dusun', 'Kelurahan',
      'Kecamatan', 'Kode Pos', 'Kota/Kabupaten', 'Provinsi', 'Jenis Tempat Tinggal',
      'Jarak tempuh ke sekolah', 'Modal Transportasi', 'Sekolah Asal',
      'Status sekolah Asal (Formal/Tidak)', 'Kecamatan Sekolah Asal', 'Kota/Kab Sekolah Asal',
      'Nomor Hp/Wa Sekolah Asal', 'Hobi', 'Cita-cita', 'Nominal Spp', 'Nominal Ortu Asuh',
      'Penerima KPS/PKH (ya/tidak)', 'Apakah Punya KIP (ya/tidak)',
      'Apakah layak Menerima PIP (ya/tidak)', 'Alasan Menolak PIP (Sudah mampu/dilarang pemda/menerima bantuan serupa)',
      'NIK Ayah', 'Nama Ayah', 'Tempat Lahir Ayah', 'Tgl Lahir Ayah', 'Telfon Ayah', 'HP Ayah',
      'Pendidikan Terakhir Ayah', 'Pekerjaan Ayah', 'Instansi Pekerjaan Ayah', 'Jabatan Pekerjaan Ayah',
      'Alamat Instansi Ayah', 'Keahlian Ayah', 'Penghasilan Ayah', 'Alamat Ayah', 'Nomor WA Ayah',
      'Medsos Ayah', 'Nama Ibu', 'NIK Ibu', 'Tempat Lahir Ibu', 'Tgl Lahir Ibu', 'Telfon Ibu',
      'HP Ibu', 'Pendidikan Terakhir Ibu', 'Pekerjaan Ibu', 'Instansi Pekerjaan Ibu',
      'Jabatan Pekerjaan Ibu', 'Alamat Instansi Ibu', 'Keahlian Ibu', 'Penghasilan Ibu',
      'Alamat Ibu', 'Nomor WA Ibu', 'Medsos Ibu', 'Status Pernikahan', 'Tanggungan Anak',
      'NIK Wali', 'Nama Wali', 'Tempat Lahir Wali', 'Tgl Lahir Wali', 'Telfon Wali', 'HP Wali',
      'Pendidikan Terakhir Wali', 'Pekerjaan Wali', 'Instansi Pekerjaan Wali', 'Jabatan Pekerjaan Wali',
      'Alamat Instansi Wali', 'Keahlian Wali', 'Penghasilan Wali', 'Alamat Wali', 'Nomor WA Wali',
      'Medsos Wali', 'Unit Pendidikan', 'NIS (Sekolah)', 'NISN (Nasional)', 'NIP (Pembayaran)',
      'Tahun Ajaran Masuk', 'Kelas', 'Keterangan Kelas', 'Tahun Ajaran Berjalan',
      'Status Siswa (aktif atau tidak)', 'Status Orang Tua (Umum atau pegawai)',
      'NIY Ortu Jika Pegawai', 'Wali Kelas', 'NIY Wali Kelas', 'email',
    ]
    const sampleRow = [
      'PDK-2024-001', '1371012345678901', 'AK.2014.001', '1371012345678000', 'Fathir Ahmad',
      '2014-05-12', 'Padang', 'Laki-Laki', 'Islam', 'fathir@example.com',
      '1', '2', '0', '35', '130',
      '-', 'WNI', 'Jl. Khatib Sulaiman No. 10', '004', '002', 'Lolong', 'Lolong Belanti',
      'Padang Utara', '25114', 'Kota Padang', 'Sumatera Barat', 'Bersama Orang Tua',
      '2 km', 'Jalan Kaki', 'SD Negeri 01 Padang',
      'Formal', 'Padang Utara', 'Kota Padang',
      '0812-0000-0001', 'Membaca', 'Dokter', '500.000', '0',
      'tidak', 'tidak', 'tidak', '-',
      '1371010101850001', 'Rahmat Hidayat', 'Padang', '1985-03-10', '0751-000001', '081299887766',
      'S1/D4', 'Pegawai Negeri', 'Dinas Pendidikan', 'Kepala Seksi',
      'Jl. Sudirman No. 5', 'Manajemen', '7.500.000', 'Jl. Khatib Sulaiman No. 10', '081299887766',
      '@rahmat', 'Siti Aminah', '1371010101880002', 'Bukittinggi', '1988-07-22', '0751-000002',
      '081299887777', 'S1/D4', 'Ibu Rumah Tangga', '-',
      '-', '-', 'Tata Boga', '0',
      'Jl. Khatib Sulaiman No. 10', '081299887777', '@siti', 'Menikah', '2',
      '-', '-', '-', '-', '-', '-',
      '-', '-', '-', '-',
      '-', '-', '-', '-', '-',
      '-', 'SDIT 2 Dar el-Iman', '23010', '0098123456', 'PBY-23010',
      '2024/2025', '1A', 'Kelas reguler', '2026/2027',
      'aktif', 'Umum',
      '-', 'Ustadz Ahmad S.Pd', 'NIY-2024-001', 'fathir@example.com',
    ]
    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'Template_Import_Data_Lengkap_Siswa.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportFile(file)
    try {
      const pickField = (normalizedRow, candidates) => {
        for (const key of candidates) {
          const val = normalizedRow[key]
          if (val !== undefined && val !== null && String(val).trim() !== '') {
            return String(val).trim()
          }
        }
        return '-'
      }

      const rows = await parseSpreadsheetFile(file)
      const previewRows = rows.slice(0, 5).map((rawRow) => {
        const normalized = {}
        Object.entries(rawRow).forEach(([k, v]) => {
          const normKey = String(k).trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
          normalized[normKey] = v
        })

        return {
          nis: pickField(normalized, ['nis', 'nis_siswa', 'no_induk']),
          nisn: pickField(normalized, ['nisn']),
          nama: pickField(normalized, ['nama_lengkap', 'full_name', 'nama_siswa', 'nama']),
          gender: pickField(normalized, ['jenis_kelamin', 'gender', 'jk', 'l_p']),
          unit: pickField(normalized, ['unit_pendidikan', 'unit', 'nama_unit', 'unit_sekolah']),
          kelas: pickField(normalized, ['kelas', 'rombel', 'nama_kelas', 'kelas_saat_ini']),
          namaAyah: pickField(normalized, ['nama_ayah', 'orang_tua', 'nama_orang_tua', 'nama_wali', 'nama_ibu']),
          hpAyah: pickField(normalized, ['no_hp', 'hp_ayah', 'nomor_wa_ayah', 'no_wa', 'telepon', 'hp_ibu', 'hp_wali']),
          status: 'Siap Impor',
        }
      })
      setImportPreviewData(previewRows)
    } catch (err) {
      console.error('Failed to preview import file:', err)
      setImportPreviewData([])
    }
  }

  const handleProcessImport = async () => {
    if (!importFile) return
    setIsImporting(true)
    try {
      const formData = new FormData()
      formData.append('file', importFile)
      formData.append('overwrite', overwriteExisting ? '1' : '0')

      const response = await api.post('/students/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const resData = response.data
      const innerData = resData.data || {}
      const totalBerhasil = (innerData.berhasil || 0) + (innerData.diperbarui || 0)
      const { duplikat = 0, gagal = 0, errors = [] } = innerData

      if (gagal > 0 && totalBerhasil === 0) {
        pushToast('Impor Gagal', `Seluruh baris (${gagal}) gagal diimpor.${errors.length ? ' Catatan: ' + errors[0] : ''}`, 'error')
      } else if (duplikat > 0 || gagal > 0 || (innerData.diperbarui || 0) > 0) {
        pushToast('Impor Selesai', `Berhasil: ${innerData.berhasil || 0} baru, ${innerData.diperbarui || 0} ditimpa, ${duplikat} duplikat dilewati, ${gagal} gagal.`, 'success')
      } else {
        pushToast('Impor Berhasil', `Sebanyak ${totalBerhasil} data siswa berhasil diimpor ke sistem.`, 'success')
      }

      if ((innerData.duplicates && innerData.duplicates.length > 0) || (innerData.errors && innerData.errors.length > 0) || innerData.diperbarui > 0 || innerData.duplikat > 0) {
        setDuplicateModalData(innerData)
      }

      if (typeof refetch === 'function') {
        refetch()
      }
      setShowImportModal(false)
      setImportFile(null)
      setImportPreviewData([])
    } catch (err) {
      console.error('Import error:', err)
      const msg = err.response?.data?.message || err.message || 'Gagal memproses import data.'
      pushToast('Gagal Import', msg, 'error')
    } finally {
      setIsImporting(false)
    }
  }

  // Map API students to display list
  // Map API students to display list
  const formattedStudents = useMemo(() => {
    if (rawStudents.length > 0) {
      return rawStudents.map((item) => {
        const meta = item.metadata || {}
        const parentRel = item.parent || {}
        const parentsPivot = item.parents_pivot || item.parents || []

        // Extract Parent Name with fallback options
        let parentName = ''
        let relationshipLabel = ''

        if (meta.nama_ayah || meta.ayah?.nama || meta.orang_tua?.nama_ayah || item.nama_ayah) {
          parentName = meta.nama_ayah || meta.ayah?.nama || meta.orang_tua?.nama_ayah || item.nama_ayah
          relationshipLabel = 'Ayah'
        } else if (meta.nama_ibu || meta.ibu?.nama || meta.orang_tua?.nama_ibu || item.nama_ibu) {
          parentName = meta.nama_ibu || meta.ibu?.nama || meta.orang_tua?.nama_ibu || item.nama_ibu
          relationshipLabel = 'Ibu'
        } else if (meta.nama_wali || meta.wali?.nama || meta.orang_tua?.nama_wali || item.nama_wali) {
          parentName = meta.nama_wali || meta.wali?.nama || meta.orang_tua?.nama_wali || item.nama_wali
          relationshipLabel = 'Wali'
        } else if (typeof meta.orang_tua === 'string' && meta.orang_tua.trim()) {
          parentName = meta.orang_tua.trim()
        } else if (typeof item.orang_tua === 'string' && item.orang_tua.trim()) {
          parentName = item.orang_tua.trim()
        } else if (typeof meta.orang_tua === 'object' && (meta.orang_tua?.nama || meta.orang_tua?.full_name || meta.orang_tua?.name)) {
          parentName = meta.orang_tua?.nama || meta.orang_tua?.full_name || meta.orang_tua?.name
        } else if (meta.nama_ortu || meta.nama_orang_tua || meta.parent_name || meta.orang_tua_nama) {
          parentName = meta.nama_ortu || meta.nama_orang_tua || meta.parent_name || meta.orang_tua_nama
        } else if (item.nama_ortu || item.nama_orang_tua || item.parent_name) {
          parentName = item.nama_ortu || item.nama_orang_tua || item.parent_name
        } else if (parentRel.full_name || parentRel.name) {
          parentName = parentRel.full_name || parentRel.name
          relationshipLabel = 'Orang Tua'
        } else if (parentsPivot[0]?.full_name || parentsPivot[0]?.name) {
          parentName = parentsPivot[0].full_name || parentsPivot[0].name
          if (parentsPivot[0]?.pivot?.relationship_type) {
            relationshipLabel = parentsPivot[0].pivot.relationship_type
          }
        }

        const ortuObj = parentName
          ? (relationshipLabel ? `${parentName} (${relationshipLabel})` : parentName)
          : '-'

        // Extract Phone Number with fallback options
        const hpObj =
          meta.hp_ayah || meta.telfon_ayah || meta.nomor_wa_ayah || meta.nomor_hp_wa_ayah || meta.ayah?.hp ||
          meta.hp_ibu || meta.telfon_ibu || meta.nomor_wa_ibu || meta.nomor_hp_wa_ibu || meta.ibu?.hp ||
          meta.hp_wali || meta.telfon_wali || meta.nomor_wa_wali || meta.nomor_hp_wa_wali || meta.wali?.hp ||
          (typeof meta.orang_tua === 'object' ? (meta.orang_tua?.no_hp || meta.orang_tua?.hp || meta.orang_tua?.phone) : null) ||
          meta.no_hp || meta.phone ||
          parentRel.phone || parentRel.no_hp || parentRel.telepon ||
          parentsPivot[0]?.phone || parentsPivot[0]?.no_hp ||
          item.phone || item.no_hp || item.hp_ortu || '-'

        const fotoObj =
          resolveAvatarUrl(item) ||
          resolveAvatarUrl(meta) ||
          item.photo_url ||
          item.photo ||
          item.foto_url ||
          item.foto ||
          item.avatar_url ||
          item.avatar ||
          meta.photo_url ||
          meta.photo ||
          meta.foto_url ||
          meta.foto ||
          ''

        const stRaw = String(meta.akademik?.status_siswa || item.status || (item.is_active ? 'aktif' : 'nonaktif')).toLowerCase()
        const statusText =
          stRaw === 'mutasi'
            ? 'Mutasi'
            : stRaw === 'lulus'
              ? 'Lulus'
              : stRaw === 'berhenti'
                ? 'Berhenti'
                : stRaw === 'cuti'
                  ? 'Cuti'
                  : stRaw === 'aktif' || item.is_active
                    ? 'Aktif'
                    : 'Nonaktif'

        return {
          id: item.id,
          nis: item.nis || '-',
          nisn: item.nisn || meta.nisn || '-',
          nama: item.full_name || item.nama || '-',
          unit: meta.akademik?.unit_pendidikan || meta.unit_pendidikan || item.education_unit?.name || '-',
          unitId: item.unit_id || item.education_unit_id || item.education_unit?.id || '',
          kelas: (typeof item.kelas === 'object' ? (item.kelas?.nama_kelas || item.kelas?.name || item.kelas?.nama) : item.kelas) || item.class_name || item.nama_kelas || '-',
          kelasId: item.kelas_id || item.class_id || (typeof item.kelas === 'object' ? item.kelas?.id : '') || '',
          orangTua: ortuObj,
          noHp: hpObj,
          status: statusText,
          gender: item.gender === 'female' ? 'Perempuan' : 'Laki-laki',
          tempatLahir: item.birth_place || meta.birth_place || '-',
          tanggalLahir: item.birth_date ? String(item.birth_date).slice(0, 10) : (meta.birth_date ? String(meta.birth_date).slice(0, 10) : '-'),
          agama: meta.agama || '-',
          alamat: item.address || meta.alamat_siswa || '-',
          foto: fotoObj,
          raw: item,
        }
      })
    }
    return []
  }, [rawStudents])

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return formattedStudents.filter((item) => {
      const matchUnit =
        !unitFilter ||
        String(item.unitId) === String(unitFilter) ||
        item.unit.toLowerCase().includes(unitFilter.toLowerCase())
      const matchKelas =
        !kelasFilter ||
        String(item.kelasId) === String(kelasFilter) ||
        String(item.kelas || '').toLowerCase().includes(kelasFilter.toLowerCase())
      const matchStatus =
        !statusFilter ||
        item.status.toLowerCase() === statusFilter.toLowerCase()
      const matchSearch =
        !searchInput ||
        item.nama.toLowerCase().includes(searchInput.toLowerCase()) ||
        item.nis.toLowerCase().includes(searchInput.toLowerCase()) ||
        item.nisn.toLowerCase().includes(searchInput.toLowerCase())
      return matchUnit && matchKelas && matchStatus && matchSearch
    })
  }, [formattedStudents, unitFilter, kelasFilter, statusFilter, searchInput])

  // Filtered Items for Stat Card Modal Popup
  const statModalItems = useMemo(() => {
    if (!statCardModal.isOpen) return []

    const sourceList = (studentDashboardData?.daftar_siswa && studentDashboardData.daftar_siswa.length > 0)
      ? studentDashboardData.daftar_siswa.map((item) => ({
          id: item.id,
          nis: item.nis || '-',
          nisn: item.nisn || '-',
          nama: item.nama || item.full_name || '-',
          unit: item.unit || '-',
          kelas: (typeof item.kelas === 'object' ? (item.kelas?.nama_kelas || item.kelas?.name || item.kelas?.nama) : item.kelas) || item.class_name || item.nama_kelas || '-',
          gender: item.jenis_kelamin === 'female' || item.gender === 'female' ? 'Perempuan' : 'Laki-laki',
          status: item.aktif || item.is_active ? 'Aktif' : 'Nonaktif',
          foto: resolveAvatarUrl(item) || '',
        }))
      : formattedStudents

    let result = sourceList

    if (statCardModal.filterType === 'male') {
      result = result.filter((s) => s.gender === 'Laki-laki')
    } else if (statCardModal.filterType === 'female') {
      result = result.filter((s) => s.gender === 'Perempuan')
    } else if (statCardModal.filterType === 'aktif') {
      result = result.filter((s) => s.status === 'Aktif')
    }

    if (statModalSearch.trim()) {
      const q = statModalSearch.toLowerCase().trim()
      result = result.filter(
        (s) =>
          s.nama.toLowerCase().includes(q) ||
          s.nis.toLowerCase().includes(q) ||
          s.nisn.toLowerCase().includes(q) ||
          s.kelas.toLowerCase().includes(q) ||
          s.unit.toLowerCase().includes(q)
      )
    }

    return result
  }, [formattedStudents, statCardModal, statModalSearch, studentDashboardData])

  const handlePrintMainTable = () => {
    setShowPrintOptionModal(true)
  }

  const handlePrintDocument = (orientation = 'landscape') => {
    const selectedUnitObj = rawUnits?.find((u) => String(u.id) === String(unitFilter)) || (unitFilter && unitFilter !== 'Semua' ? unitFilter : 'YAYASAN')
    const headers = ['No', 'NIS / NISN', 'Nama Lengkap', 'Jenis Kelamin', 'Unit Pendidikan', 'Kelas', 'Status']
    const rows = filteredStudents.map((std, idx) => [
      idx + 1,
      `${std.nis || '-'}\n${std.nisn || '-'}`,
      std.nama,
      std.gender,
      std.unit,
      std.kelas,
      std.status,
    ])

    printCleanTable({
      title: 'LAPORAN DIREKTORI DATA SISWA',
      unit: selectedUnitObj,
      unitParam: selectedUnitObj,
      headers,
      rows,
      orientation,
    })
    setShowPrintOptionModal(false)
  }

  const handleDownloadPdf = (orientation = 'landscape') => {
    const selectedUnitObj = rawUnits?.find((u) => String(u.id) === String(unitFilter)) || (unitFilter && unitFilter !== 'Semua' ? unitFilter : 'YAYASAN')
    const headers = ['No', 'NIS / NISN', 'Nama Lengkap', 'Jenis Kelamin', 'Unit Pendidikan', 'Kelas', 'Status']
    const rows = filteredStudents.map((std, idx) => [
      idx + 1,
      `${std.nis || '-'}\n${std.nisn || '-'}`,
      std.nama,
      std.gender,
      std.unit,
      std.kelas,
      std.status,
    ])

    downloadPdfTable({
      filename: `Laporan_Data_Siswa_${new Date().toISOString().slice(0, 10)}.pdf`,
      title: 'LAPORAN DIREKTORI DATA SISWA',
      unit: selectedUnitObj,
      unitParam: selectedUnitObj,
      headers,
      rows,
      orientation,
    })
    setShowPrintOptionModal(false)
  }

  const handlePrintStatCardModal = () => {
    const selectedUnitObj = rawUnits?.find((u) => String(u.id) === String(unitFilter)) || (unitFilter && unitFilter !== 'Semua' ? unitFilter : 'YAYASAN')
    const headers = ['No', 'NIS / NISN', 'Nama Lengkap', 'Unit Kerja', 'Kelas / Rombel', 'Jenis Kelamin', 'Status']
    const rows = statModalItems.map((std, idx) => [
      idx + 1,
      `${std.nis || '-'}\n${std.nisn || '-'}`,
      std.nama,
      std.unit,
      std.kelas,
      std.gender,
      std.status,
    ])

    const orgName = (sitePengaturan?.school_name || sitePengaturan?.application_name || '').trim()
    printCleanTable({
      title: (statCardModal.title || 'LAPORAN DETAIL STATISTIK SISWA').toUpperCase(),
      subtitle: orgName || 'Laporan Statistik Siswa',
      unit: selectedUnitObj,
      headers,
      rows,
      orientation: 'landscape',
      foundationName: orgName,
      systemLogo: sitePengaturan?.logo_url,
    })
  }

  // Pagination
  const totalPages = Math.max(1, studentPagination.lastPage)
  const paginatedStudents = filteredStudents

  // Form Handlers
  const handleOpenTambah = () => {
    if (!canCreateStudent) return
    setIsEdit(false)
    setSelectedStudent(null)
    setShowFormModal(true)
  }

  const handleOpenEdit = (student) => {
    if (!canUpdateStudent) return
    setIsEdit(true)
    setSelectedStudent(student)
    setShowDetailModal(false)
    setShowFormModal(true)
  }

  const handleOpenDetail = (student) => {
    if (!student) return
    const match = formattedStudents.find(
      (s) => String(s.id) === String(student.id) || (s.nama && student.nama && s.nama.toLowerCase() === student.nama.toLowerCase())
    )
    setSelectedStudent(match || student)
    setActiveDetailTab('siswa')
    setShowDetailModal(true)
  }

  const navigate = useNavigate()
  const [chatTargetModal, setChatTargetModal] = useState(null)
  const [chatQuickMessage, setChatQuickMessage] = useState('')

  const handleOpenChatModal = (student) => {
    setChatTargetModal(student)
    setChatQuickMessage('')
  }

  const handleDirectChatPortal = (student) => {
    if (!student) return
    const sId = student.id || ''
    const pId = student.parentId || student.parent_id || ''
    const pName = encodeURIComponent(student.orangTua || student.metadata?.nama_ayah || student.metadata?.nama_ibu || 'Orang Tua')
    const sName = encodeURIComponent(student.nama || student.full_name || '')
    const msg = encodeURIComponent(chatQuickMessage.trim())
    navigate(`/dashboard/chat-pegawai?mode=teacher&student_id=${sId}&parent_id=${pId}&parent_name=${pName}&student_name=${sName}${msg ? `&initial_message=${msg}` : ''}`)
    setChatTargetModal(null)
    setChatQuickMessage('')
    setShowDetailModal(false)
  }

  const handleDirectWhatsApp = (phone, student) => {
    if (!phone) {
      pushToast('Nomor Tidak Tersedia', 'Nomor telepon/WA orang tua belum terdaftar.', 'info')
      return
    }
    let cleanPhone = String(phone).replace(/[^0-9]/g, '')
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1)
    if (!cleanPhone.startsWith('62')) cleanPhone = '62' + cleanPhone
    const msgBody = chatQuickMessage.trim()
      ? chatQuickMessage.trim()
      : 'Saya ingin berkonsultasi mengenai perkembangan ananda di sekolah.'
    const text = encodeURIComponent(
      `Assalamu'alaikum Warahmatullahi Wabarakatuh Bapak/Ibu Wali dari Ananda ${student.nama || student.full_name || ''} (${student.unit || ''} - Kelas ${student.kelas || ''}).\n\n${msgBody}`
    )
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank')
    setChatTargetModal(null)
    setChatQuickMessage('')
    setShowDetailModal(false)
  }

  const handleDelete = (student) => {
    if (!canDeleteStudent) return
    setDeleteTarget(student)
    setHasConfirmedDeleteCheck(false)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !canDeleteStudent) return
    try {
      setIsDeleting(true)
      await hapus.mutateAsync(deleteTarget.id)
      pushToast('Berhasil Dihapus', `Data siswa "${deleteTarget.nama || deleteTarget.full_name}" berhasil dihapus permanen.`, 'success')
      setDeleteTarget(null)
      setHasConfirmedDeleteCheck(false)
      setShowDetailModal(false)
    } catch (err) {
      pushToast('Gagal Menghapus', err.response?.data?.message || err.message || 'Terjadi kesalahan saat menghapus data siswa.', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleFormSubmitCallback = (payload) => {
    if ((isEdit && !canUpdateStudent) || (!isEdit && !canCreateStudent)) return
    setPendingSavePayload(payload)
    setShowSaveConfirmDialog(true)
  }

  const handleConfirmSave = async () => {
    if (!pendingSavePayload) return
    setIsSaving(true)
    try {
      if (isEdit && pendingSavePayload.id) {
        await ubah.mutateAsync({ id: pendingSavePayload.id, payload: pendingSavePayload })
        pushToast('Berhasil Diperbarui', `Data siswa "${pendingSavePayload.full_name}" berhasil diperbarui.`, 'success')
      } else {
        await tambah.mutateAsync(pendingSavePayload)
        pushToast('Berhasil Ditambahkan', `Data siswa baru "${pendingSavePayload.full_name}" berhasil ditambahkan ke sistem.`, 'success')
      }
      setShowSaveConfirmDialog(false)
      setShowFormModal(false)
      setPendingSavePayload(null)
    } catch (err) {
      pushToast('Gagal Menyimpan', err.response?.data?.message || err.message || 'Terjadi kesalahan saat menyimpan data.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  // Server-side Multi-format Export Handler (.xlsx, .xls, .csv)
  const handleOpenExportModal = () => {
    if (!canExportStudent) return
    setShowExportModal(true)
  }

  const handleProcessExport = async (format = exportFormat) => {
    if (!canExportStudent) return
    try {
      setIsExporting(true)
      const params = {}
      if (searchQuery) params.search = searchQuery
      if (unitFilter && unitFilter !== 'Semua') params.unit_id = unitFilter
      if (kelasFilter && kelasFilter !== 'Semua') params.kelas_id = kelasFilter
      if (statusFilter && statusFilter !== 'Semua') params.status = statusFilter

      const defaultFilename = `Data_Siswa_${(sitePengaturan?.school_name || 'Sekolah').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}`

      const res = await downloadFileFromApi(
        '/students/export',
        params,
        format,
        defaultFilename
      )
      if (res?.success) {
        setShowExportModal(false)
      }
    } catch (err) {
      console.error('Export error:', err)
      pushToast('Gagal Ekspor', err?.message || 'Terjadi kesalahan saat mengunduh berkas data siswa.', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  // Batch Generator VA Bank Syariah Indonesia (BSI)
  const handleGenerateVaBsi = async () => {
    try {
      setIsGeneratingVa(true)
      const res = await studentService.generateVaBsi({
        unit_id: unitFilter && unitFilter !== 'Semua' ? unitFilter : undefined,
        kelas_id: kelasFilter && kelasFilter !== 'Semua' ? kelasFilter : undefined,
        force_overwrite: forceOverwriteVa,
      })
      pushToast(
        'Berhasil Generate VA BSI',
        res.message || `Sebanyak ${res.updated_count || 0} No. VA BSI siswa berhasil diproses.`,
        'success'
      )
      setShowGenerateVaModal(false)
      refetch()
    } catch (err) {
      pushToast(
        'Gagal Generate VA BSI',
        err.response?.data?.message || err.message || 'Terjadi kesalahan saat memproses Nomor VA BSI.',
        'error'
      )
    } finally {
      setIsGeneratingVa(false)
    }
  }

  // Render Status Badge
  const renderStatusBadge = (statusStr) => {
    const st = String(statusStr || '').toLowerCase()
    if (st === 'aktif') {
      return <AppBadge variant="success" dot>Aktif</AppBadge>
    }
    if (st === 'mutasi') {
      return <AppBadge variant="warning" dot>Mutasi</AppBadge>
    }
    if (st === 'lulus') {
      return <AppBadge variant="info" dot>Lulus</AppBadge>
    }
    return <AppBadge variant="danger" dot>Nonaktif</AppBadge>
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

  return (
    <PageContainer maxW="7xl" className="space-y-6 pb-12">
      <motion.div initial="hidden" animate="visible" variants={containerVariants}>
        <MasterDataPage hideBreadcrumb>

        {/* Breadcrumb Navigation (Identik dengan Halaman Employees) */}
        <div className="print:hidden">
          <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: `Buku Induk ${terms.siswa || 'Siswa'}` }]} />
        </div>

        {/* Header Halaman Modern Hero Card HeroUI */}
        <HeroUiHeader
          variants={itemVariants}
          icon={FaUserGraduate}
          title={`Buku Induk ${terms.siswa || 'Siswa'} Terpadu`}
          tag={{ text: isDivisiPendidikan ? 'Supervisi Divisi Pendidikan' : 'Manajemen Kesiswaan', icon: ShieldCheck }}
          description={`Pengelolaan resmi buku induk dan direktori peserta didik (TK, SD, SMP, SMA, Ponpes, Ma'had), biodata lengkap orang tua, status mutasi, cetak kartu NISN, dan arsip kesiswaan.`}
          badge={{ text: `Buku Induk ${terms.siswa || 'Siswa'}`, icon: Sparkles }}
          className="mb-6"
        />

        {/* Unit Performance Scope Bar (Hero UI Component) */}
        <div className="relative overflow-visible z-20 rounded-[22px] border border-emerald-200/90 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-4 sm:p-5 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20 shrink-0 border border-emerald-300/40">
                <Building2 className="size-5" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  Cakupan Data & KPI Unit Pendidikan
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/60">
                    {isGlobalUser ? (selectedUnitName ? `Unit: ${selectedUnitName}` : 'Semua Unit') : 'Unit Terkunci'}
                  </span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isGlobalUser
                    ? `Pilih unit pendidikan untuk melihat total ${terms.siswa || 'siswa'} & KPI unit spesifik, atau pilih "Semua Unit" untuk melihat seluruh data unit${isDivisiPendidikan ? ' (Supervisi Divisi Pendidikan)' : ''}.`
                    : `Menampilkan total kesiswaan dan KPI khusus untuk unit ${selectedUnitName || user?.unit?.name || user?.unit_name || user?.employee?.unit?.name || user?.metadata?.unit_name || 'Unit Terkunci'}.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {isGlobalUser ? (
                <div className="relative min-w-[260px] sm:w-72">
                  <HeroUiFilterSelect
                    value={unitFilter || ''}
                    onChange={(val) => {
                      setUnitFilter(String(val || ''))
                      setKelasFilter('')
                      setCurrentPage(1)
                    }}
                    options={[
                      { value: '', label: 'Semua Unit Pendidikan' },
                      ...rawUnits.map((u, idx) => {
                        const val = String(u.id ?? u.unit_id ?? u.code ?? `unit-${idx}`)
                        const label = u.name ?? u.nama_unit ?? u.nama ?? val
                        return {
                          value: val,
                          label: label,
                          subtext: u.code || u.kode_unit ? `Kode: ${u.code || u.kode_unit}` : undefined,
                        }
                      }),
                    ]}
                    placeholder="Semua Unit Pendidikan"
                    icon={Building2}
                    searchable={rawUnits.length > 5}
                    ariaLabel="Filter Unit Scope"
                  />
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/80 bg-emerald-50/80 px-3.5 py-2 text-xs font-bold text-emerald-900 shadow-2xs dark:border-emerald-800/80 dark:bg-emerald-950/40 dark:text-emerald-200">
                  <Lock className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Unit: {selectedUnitName || user?.unit?.name || user?.unit_name || user?.employee?.unit?.name || user?.metadata?.unit_name || 'Unit Terkunci'}</span>
                </div>
              )}

              {isGlobalUser && unitFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setUnitFilter('')
                    setKelasFilter('')
                    setCurrentPage(1)
                  }}
                  className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-emerald-700 hover:bg-emerald-100/50 dark:text-slate-400 dark:hover:text-emerald-300 rounded-xl transition cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Summary Cards (HEROUI_CARD_COMPONENT) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <KpiTintedCard
            icon={FaUserGraduate}
            label="Total Siswa"
            tag="Semua Siswa"
            value={studentStats.total_siswa ?? 0}
            subtext="Terdaftar di sistem"
            tone="emerald"
            isLoading={isSummaryLoading}
            onClick={() => {
              setStatCardModal({ isOpen: true, title: 'Detail Data: Total Siswa', filterType: 'all' })
              setStatModalSearch('')
            }}
            active={statCardModal.isOpen && statCardModal.filterType === 'all'}
          />
          <KpiTintedCard
            icon={FaMale}
            label="Siswa Laki-laki"
            tag="Laki-Laki"
            value={genderStats.laki_laki ?? 0}
            subtext="Berdasarkan data siswa"
            tone="blue"
            isLoading={isSummaryLoading}
            onClick={() => {
              setStatCardModal({ isOpen: true, title: 'Detail Data: Siswa Laki-laki', filterType: 'male' })
              setStatModalSearch('')
            }}
            active={statCardModal.isOpen && statCardModal.filterType === 'male'}
          />
          <KpiTintedCard
            icon={FaFemale}
            label="Siswa Perempuan"
            tag="Perempuan"
            value={genderStats.perempuan ?? 0}
            subtext="Berdasarkan data siswa"
            tone="rose"
            isLoading={isSummaryLoading}
            onClick={() => {
              setStatCardModal({ isOpen: true, title: 'Detail Data: Siswa Perempuan', filterType: 'female' })
              setStatModalSearch('')
            }}
            active={statCardModal.isOpen && statCardModal.filterType === 'female'}
          />
          <KpiTintedCard
            icon={FaCheckCircle}
            label="Status Aktif"
            tag="Aktif KBM"
            value={studentStats.siswa_aktif ?? 0}
            subtext="Berstatus aktif"
            tone="amber"
            isLoading={isSummaryLoading}
            onClick={() => {
              setStatCardModal({ isOpen: true, title: 'Detail Data: Siswa Status Aktif', filterType: 'aktif' })
              setStatModalSearch('')
            }}
            active={statCardModal.isOpen && statCardModal.filterType === 'aktif'}
          />
        </div>

        {/* Analytics & Achievement Showcase Section for Kepala Sekolah & Divisi Pendidikan */}
        {isLeaderRole && (
          <StudentLeaderAnalyticsSection
            students={formattedStudents}
            dashboardStats={studentDashboardData?.laporan_siswa ? {
              siswa_baru: studentDashboardData.laporan_siswa.siswa_baru,
              mutasi_keluar: studentDashboardData.laporan_siswa.mutasi_keluar,
              siswa_nonaktif: studentStats.siswa_nonaktif,
            } : studentStats}
            selectedUnit={unitFilter}
            units={rawUnits}
            onUnitChange={(val) => { setUnitFilter(val); setKelasFilter(''); setCurrentPage(1) }}
            selectedKelas={kelasFilter}
            classes={availableClasses}
            onKelasChange={(val) => { setKelasFilter(val); setCurrentPage(1) }}
            isKepalaSekolah={isKepalaSekolah}
            isDivisiPendidikan={isDivisiPendidikan}
            onSelectStudent={handleOpenDetail}
            onOpenImport={canImportStudent ? () => setShowImportModal(true) : undefined}
            onOpenExport={handleOpenExportModal}
            onOpenAdd={canCreateStudent ? handleOpenTambah : undefined}
            canExportStudent={canExportStudent}
            canCreateStudent={canCreateStudent}
          />
        )}

        {/* Unified Master Data Section */}
        {/* Unified Master Data Container */}
        <div id="tabel-daftar-siswa" className="scroll-mt-6">
        <AppDataTable
          title={`Daftar ${terms.siswa || 'Siswa'}`}
          icon={GraduationCap}
          iconClassName="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 border border-emerald-300/40"
          actionColumnLabel=""
          description={`Data ${terms.siswa?.toLowerCase() || 'siswa'} sesuai filter dan kewenangan pengguna.`}
          countLabel={`${Number(studentPagination.total || filteredStudents.length).toLocaleString('id-ID')} ${terms.siswa?.toLowerCase() || 'siswa'}`}
          actions={
            <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
              {/* Cetak Datatable Button - Vivid Indigo / Violet Squircle */}
              <div className="group relative inline-flex">
                <Button
                  type="button"
                  iconOnly
                  variant="ghost"
                  title="Cetak Data Laporan (Print)"
                  aria-label="Cetak Data Laporan"
                  onClick={handlePrintMainTable}
                  className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white border border-indigo-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  <Printer className="size-5 text-white" strokeWidth={2.2} />
                </Button>
                <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                  Cetak Data (Print)
                </div>
              </div>

              {/* Import Button (Vivid Sky Blue / Blue Squircle) */}
              {canImportStudent && (
                <div className="group relative inline-flex">
                  <Button
                    type="button"
                    iconOnly
                    variant="ghost"
                    title="Import Data Siswa"
                    aria-label="Import Data Siswa"
                    className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white border border-sky-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                    onClick={() => setShowImportModal(true)}
                  >
                    <Upload className="size-5 text-white" strokeWidth={2.2} />
                  </Button>
                  <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                    <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                    Import Data
                  </div>
                </div>
              )}

              {/* Export Button (Vivid Amber / Orange Squircle) */}
              {canExportStudent && (
                <div className="group relative inline-flex">
                  <Button
                    type="button"
                    iconOnly
                    variant="ghost"
                    title="Export Data Siswa"
                    aria-label="Export Data Siswa"
                    className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white border border-amber-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                    onClick={handleOpenExportModal}
                  >
                    <Download className="size-5 text-white" strokeWidth={2.2} />
                  </Button>
                  <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                    <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                    Export Data
                  </div>
                </div>
              )}

              {/* Siswa Pindahan Masuk (Two-Way Handshake TU) */}
              {!isFoundationRole && (
                <div className="group relative inline-flex">
                  <Button
                    type="button"
                    iconOnly
                    variant="ghost"
                    title="Siswa Pindahan Masuk (Menunggu Verifikasi & Persetujuan TU)"
                    aria-label="Siswa Pindahan Masuk"
                    className="relative flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 via-emerald-600 to-teal-800 text-white border border-teal-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                    onClick={() => {
                      fetchIncomingMutations()
                      setShowIncomingModal(true)
                    }}
                  >
                    <ArrowRightLeft className="size-5 text-white" strokeWidth={2.2} />
                    {incomingMutations.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black text-white ring-2 ring-white animate-pulse">
                        {incomingMutations.length}
                      </span>
                    )}
                  </Button>
                  <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                    <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                    Pindahan Masuk ({incomingMutations.length})
                  </div>
                </div>
              )}

              {/* Generate VA BSI Siswa Button (Super Admin, Admin, Operator, TU) */}
              {canManageVaBsi && (
                <div className="group relative inline-flex">
                  <Button
                    type="button"
                    iconOnly
                    variant="ghost"
                    title="Generate Nomor Virtual Account (VA BSI) Siswa"
                    aria-label="Generate Nomor Virtual Account (VA BSI) Siswa"
                    className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 text-white border border-indigo-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer shadow-md shadow-indigo-500/20"
                    onClick={() => setShowGenerateVaModal(true)}
                  >
                    <CreditCard className="size-5 text-white" strokeWidth={2.2} />
                  </Button>
                  <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                    <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                    Generate VA BSI
                  </div>
                </div>
              )}

              {/* Tambah Button (Vivid Emerald / Teal Squircle) */}
              {canCreateStudent && (
                <div className="group relative inline-flex">
                  <Button
                    type="button"
                    iconOnly
                    variant="ghost"
                    title={`Tambah ${terms.siswa || 'Siswa'} Baru`}
                    aria-label={`Tambah ${terms.siswa || 'Siswa'} Baru`}
                    className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                    onClick={handleOpenTambah}
                  >
                    <Plus className="size-5 text-white" strokeWidth={2.5} />
                  </Button>
                  <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                    <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                    Tambah {terms.siswa || 'Siswa'}
                  </div>
                </div>
              )}
            </div>
          }
          search={searchInput}
          onSearchChange={(value) => setSearchInput(value)}
          searchPlaceholder="Cari NIS, NISN, atau nama siswa..."
          filters={
            <>
              <div className="w-full sm:w-60">
                <HeroUiFilterSelect
                  ariaLabel="Filter unit pendidikan"
                  value={unitFilter}
                  disabled={!isGlobalUser && Boolean(userUnitId)}
                  onChange={(val) => {
                    setUnitFilter(val)
                    setKelasFilter('')
                    setCurrentPage(1)
                  }}
                  options={[
                    ...(isGlobalUser ? [{ value: '', label: 'Semua Unit Pendidikan' }] : []),
                    ...rawUnits
                      .filter((u) => isGlobalUser || String(u.id ?? u.unit_id ?? '') === String(userUnitId))
                      .map((u, idx) => {
                        const getStr = (v) => {
                          if (v === null || v === undefined) return ''
                          if (typeof v === 'string' || typeof v === 'number') return String(v)
                          if (typeof v === 'object') return String(v.name || v.nama_unit || v.nama || v.id || '')
                          return ''
                        }
                        const rawVal = u.id ?? u.nama_unit ?? u.name ?? u.nama
                        const val = getStr(rawVal) || `unit-${idx}`
                        const rawLabel = u.name ?? u.nama_unit ?? u.nama ?? u.code ?? val
                        const label = getStr(rawLabel) || val
                        return {
                          value: val,
                          label: label,
                          subtext: u.code || u.kode_unit ? `Kode: ${u.code || u.kode_unit}` : undefined,
                        }
                      }),
                  ]}
                  placeholder="Semua Unit Pendidikan"
                  icon={Building2}
                  searchable={rawUnits.length > 5}
                />
              </div>

              <div className="w-full sm:w-52">
                <HeroUiFilterSelect
                  ariaLabel="Filter kelas"
                  value={kelasFilter}
                  onChange={(val) => {
                    setKelasFilter(val)
                    setCurrentPage(1)
                  }}
                  options={[
                    { value: '', label: 'Semua Kelas' },
                    ...availableClasses.map((c, idx) => {
                      const getStr = (v) => {
                        if (v === null || v === undefined) return ''
                        if (typeof v === 'string' || typeof v === 'number') return String(v)
                        if (typeof v === 'object') return String(v.nama_kelas || v.name || v.nama || v.id || '')
                        return ''
                      }
                      const rawVal = c?.id ?? c?.nama_kelas ?? c?.name ?? c?.nama
                      const val = getStr(rawVal) || `class-${idx}`
                      const rawLabel = c?.nama_kelas ?? c?.name ?? c?.nama ?? val
                      const label = getStr(rawLabel) || val
                      return {
                        value: val,
                        label: label,
                        subtext: c?.tingkat ? `Tingkat ${c.tingkat}` : undefined,
                      }
                    }),
                  ]}
                  placeholder="Semua Kelas"
                  icon={GraduationCap}
                  searchable={availableClasses.length > 5}
                />
              </div>

              <div className="w-full sm:w-48">
                <HeroUiFilterSelect
                  ariaLabel="Filter status"
                  value={statusFilter}
                  onChange={(val) => {
                    setStatusFilter(val)
                    setCurrentPage(1)
                  }}
                  options={[
                    { value: '', label: 'Semua Status' },
                    ...studentStatusOptions.map((opt) => ({
                      value: String(opt.value),
                      label: opt.label,
                    })),
                  ]}
                  placeholder="Semua Status"
                  icon={ShieldCheck}
                />
              </div>
            </>
          }
          onResetFilters={() => {
            setSearchInput('')
            setUnitFilter(!isGlobalUser && userUnitId ? String(userUnitId) : '')
            setKelasFilter('')
            setStatusFilter('')
            setCurrentPage(1)
          }}
          hasActiveFilters={Boolean(searchInput || unitFilter || kelasFilter || statusFilter)}
          isLoading={isLoading}
          isError={isError}
          errorTitle="Data siswa gagal dimuat"
          errorMessage="Periksa koneksi server kemudian coba kembali."
          onRetry={refetch}
          isEmpty={!isLoading && !isError && paginatedStudents.length === 0}
          emptyTitle="Siswa tidak ditemukan"
          emptyDescription="Tidak ada data siswa yang cocok dengan kriteria filter."
          page={currentPage}
          totalPages={studentPagination.lastPage || 1}
          totalItems={studentPagination.total || filteredStudents.length}
          itemsPerPage={studentPagination.perPage || 10}
          onPageChange={setCurrentPage}
          meta={{
            total: studentPagination.total || filteredStudents.length,
            from: studentPagination.from || 1,
            to: studentPagination.to || filteredStudents.length,
            last_page: studentPagination.lastPage || 1,
            current_page: currentPage,
          }}
          serverControlled
          renderTable={() => (
            <TableRoot className="w-full table-fixed text-left text-sm text-slate-600" aria-label="Daftar siswa">
              <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
                <TableRow className="border-b-2 border-emerald-200/90 dark:border-emerald-800/80 bg-transparent text-emerald-950 dark:text-emerald-200">
                  <TableHead className="w-[6%] bg-transparent px-2 py-3.5 text-center font-extrabold text-[11px] uppercase tracking-wider">No</TableHead>
                  <TableHead className="w-[34%] bg-transparent px-3 py-3.5 font-extrabold text-[11px] uppercase tracking-wider">Identitas Siswa</TableHead>
                  <TableHead className="hidden w-[29%] bg-transparent px-3 py-3.5 font-extrabold text-[11px] uppercase tracking-wider md:table-cell">Orang Tua / Wali</TableHead>
                  <TableHead className="hidden w-[11%] bg-transparent px-2 py-3.5 text-center font-extrabold text-[11px] uppercase tracking-wider sm:table-cell">Status</TableHead>
                  <TableHead className="w-[20%] bg-transparent px-2 py-3.5 text-center font-extrabold text-[11px] uppercase tracking-wider"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100 dark:divide-slate-700 font-medium text-slate-700 dark:text-slate-200">
                {paginatedStudents.map((item, idx) => (
                  <TableRow
                    key={item.id}
                    onClick={() => handleOpenDetail(item)}
                    title="Klik baris untuk melihat detail siswa"
                    className="edu-row align-middle transition-colors hover:bg-emerald-50/40 dark:hover:bg-slate-800/50 cursor-pointer"
                    style={{ animationDelay: `${Math.min(idx, 8) * 35}ms` }}
                  >
                    <TableCell className="px-2 py-3 text-center text-xs font-bold text-slate-400">
                      {(studentPagination.from || 1) + idx}
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <div className="min-w-0">
                        <PersonIdentityCell src={item.foto} name={item.nama} subtitle={`NIS ${item.nis} · NISN ${item.nisn || '-'}`} />
                        <span className="mt-1 block min-w-0 pl-11">
                          <small className="mt-0.5 block truncate text-[9px] font-semibold text-emerald-700 dark:text-emerald-300" title={`${item.unit} · Kelas ${item.kelas}`}>
                            {item.unit} · Kelas {item.kelas}
                          </small>
                          <small className="mt-0.5 block truncate text-[9px] font-medium text-slate-500 md:hidden" title={item.orangTua}>Ortu: {item.orangTua} ({item.noHp || '-'})</small>
                          <small className={`mt-0.5 text-[9px] font-bold sm:hidden ${(item.status || '').toLowerCase() === 'aktif' ? 'text-emerald-700' : 'text-amber-600'}`}>• {item.status}</small>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden px-3 py-3 md:table-cell">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">{(item.orangTua || 'W').split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span>
                        <span className="min-w-0">
                          <strong className="block truncate text-xs text-slate-800 dark:text-slate-100" title={item.orangTua}>{item.orangTua}</strong>
                          <small className="mt-1 block whitespace-nowrap text-[10px] font-semibold tabular-nums text-slate-500 dark:text-slate-400">
                            {item.noHp || '-'}
                          </small>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap px-3 py-3 text-center sm:table-cell">{renderStatusBadge(item.status)}</TableCell>
                    <TableCell className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center">
                        <ActionDropdown
                          onView={() => handleOpenDetail(item)}
                          onEdit={canUpdateStudent ? () => handleOpenEdit(item) : undefined}
                          onDelete={canDeleteStudent ? () => handleDelete(item) : undefined}
                          extraItems={[
                            {
                              label: 'Chat Orang Tua',
                              icon: <MessageSquare className="h-4 w-4 text-emerald-600" />,
                              onClick: () => handleOpenChatModal(item),
                            },
                            {
                              label: 'Cetak Kartu',
                              icon: <FaPrint className="h-4 w-4 text-emerald-600" />,
                              onClick: () => { setStudentToPrint(item); setShowCetakModal(true) },
                            },
                            ...(canUpdateStudent ? [{
                              label: 'Ajukan Pindah Unit',
                              icon: <ArrowRightLeft className="h-4 w-4 text-teal-600" />,
                              onClick: () => handleOpenAjukanMutasi(item),
                            }] : []),
                          ]}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableRoot>
          )}
        />
        </div>

        {/* POP UP MODAL 1: DETAIL SISWA */}
        <AnimatePresence>
          {showDetailModal && selectedStudent && (
            <div
              className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="student-detail-modal-title"
              tabIndex={-1}
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) setShowDetailModal(false)
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="modal-dialog font-sans my-auto w-full max-w-4xl"
              >
                <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
                  {/* Top Accent Gradient Bar */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

                  {/* Modal Header */}
                  <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white p-2.5 shadow-md shadow-emerald-500/30 border border-emerald-300/30 shrink-0">
                        <FaUserGraduate className="size-5 text-white" />
                      </div>
                      <div>
                        <h3 id="student-detail-modal-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <span>Detail Siswa</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80">
                            <Sparkles className="size-3" />
                            Data Terpadu
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Informasi lengkap profil siswa, orang tua, akademik, dan dokumen.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDetailModal(false)}
                      aria-label="Tutup detail siswa"
                      className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white border border-rose-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer shadow-md shadow-rose-500/20"
                    >
                      <X className="size-4 text-white" strokeWidth={2.25} />
                    </button>
                  </div>

              {/* Modal Content */}
              <div className="max-h-[75vh] overflow-y-auto bg-white p-5">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">

                  {/* Left: Profile Overview Card */}
                  <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 text-xs">
                    {/* Photo + Name + Status */}
                    <div className="flex items-start gap-3">
                      <PersonAvatar src={selectedStudent.foto} name={selectedStudent.nama} size="detail" className="border-2 border-emerald-600 shadow" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-extrabold text-slate-900 leading-tight">{selectedStudent.nama}</h3>
                          {renderStatusBadge(selectedStudent.status)}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-medium">NIS: {selectedStudent.nis} | NISN: {selectedStudent.nisn}</p>
                        <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">{selectedStudent.unit}</p>
                      </div>
                    </div>

                    {/* Biodata Singkat */}
                    <div className="space-y-2.5 border-t border-slate-100 pt-3">
                      {[
                        { label: 'Tempat, Tgl Lahir', value: `${selectedStudent.tempatLahir}, ${selectedStudent.tanggalLahir}` },
                        { label: 'Jenis Kelamin', value: selectedStudent.gender },
                        { label: 'Agama', value: selectedStudent.agama || 'Islam' },
                        { label: 'Kelas', value: selectedStudent.kelas },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between items-start gap-2">
                          <span className="text-slate-500 shrink-0">{item.label}:</span>
                          <span className="font-semibold text-slate-800 text-right">{item.value || '-'}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Tabbed Detail */}
                  <div className="lg:col-span-8 space-y-4">
                    {/* Tab Navigation + Content */}
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                      {/* Tabs Header */}
                      <div className="flex gap-1 p-1.5 bg-slate-100/80 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800 overflow-x-auto">
                        {[
                          { key: 'siswa', label: 'Data Siswa' },
                          { key: 'orangTua', label: 'Orang Tua / Wali' },
                          { key: 'akademik', label: 'Akademik' },
                          { key: 'riwayat', label: 'Riwayat' },
                          { key: 'dokumen', label: 'Dokumen' },
                        ].map(({ key, label }) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setActiveDetailTab(key)}
                            className={cn(
                              "px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer",
                              activeDetailTab === key
                                ? "bg-white text-emerald-800 shadow-xs dark:bg-emerald-950/80 dark:text-emerald-300 ring-1 ring-emerald-500/20"
                                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      {/* Tab Content */}
                      <div className="p-4 text-xs max-h-[48vh] overflow-y-auto space-y-4">
                        {(() => {
                          const rawMeta = selectedStudent.raw?.metadata || {}
                          const parentRel = selectedStudent.raw?.parent || {}
                          const parentsPivot = selectedStudent.raw?.parents_pivot || selectedStudent.raw?.parents || []
                          const meta = {
                            ...rawMeta,
                            nama_ayah: rawMeta.nama_ayah || rawMeta.ayah?.nama || rawMeta.orang_tua?.nama_ayah || parentRel.full_name || parentRel.name || parentsPivot[0]?.full_name,
                            nama_ibu: rawMeta.nama_ibu || rawMeta.ibu?.nama || rawMeta.orang_tua?.nama_ibu,
                            nama_wali: rawMeta.nama_wali || rawMeta.wali?.nama || rawMeta.orang_tua?.nama_wali,
                            hp_ayah: rawMeta.hp_ayah || rawMeta.ayah?.hp || rawMeta.orang_tua?.no_hp || parentRel.phone || parentRel.no_hp || parentsPivot[0]?.phone,
                            hp_ibu: rawMeta.hp_ibu || rawMeta.ibu?.hp || rawMeta.orang_tua?.no_hp,
                            hp_wali: rawMeta.hp_wali || rawMeta.wali?.hp || rawMeta.orang_tua?.no_hp,
                          }

                          const cleanVal = (val) => {
                            if (val === null || val === undefined) return '-'
                            const str = String(val).trim()
                            if (!str || str === '#N/A' || str === 'N/A' || str === 'null' || str === 'undefined' || str === '-') return '-'
                            return str
                          }

                          const DCell = ({ label, val, fullWidth = false }) => {
                            const displayVal = cleanVal(val)
                            return (
                              <div className={cn(
                                "p-2.5 rounded-xl border border-emerald-100/80 bg-slate-50/70 dark:border-emerald-900/30 dark:bg-slate-900/40 flex flex-col justify-center min-w-0",
                                fullWidth && "sm:col-span-2"
                              )}>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">{label}</span>
                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 break-words">{displayVal}</span>
                              </div>
                            )
                          }

                          if (activeDetailTab === 'siswa') return (
                            <div className="space-y-3.5">
                              {/* Sub-Card 1: Identitas & Kependudukan */}
                              <div className="rounded-2xl border border-emerald-200/70 bg-white dark:border-emerald-800/40 dark:bg-slate-900/40 p-3.5 space-y-2.5 shadow-2xs">
                                <p className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-emerald-100 dark:border-emerald-800/50 pb-2">
                                  <ShieldCheck className="size-3.5 text-emerald-600" /> Identitas & Kependudukan Siswa
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <DCell label="NIS (Sekolah)" val={selectedStudent.nis} />
                                  <DCell label="NISN (Nasional)" val={selectedStudent.nisn} />
                                  <DCell label="No Pendaftaran" val={meta.no_pendaftaran} />
                                  <DCell label="NIK Siswa" val={meta.nik} />
                                  <DCell label="No Kartu Keluarga (KK)" val={meta.no_kk} />
                                  <DCell label="No Registrasi Akta Lahir" val={meta.no_registrasi_akta_lahir} />
                                  <DCell label="Kewarganegaraan" val={meta.kewarganegaraan || 'WNI'} />
                                  <DCell label="Email Siswa" val={meta.email} />
                                </div>
                              </div>

                              {/* Sub-Card 2: Keluarga & Kondisi Fisik */}
                              <div className="rounded-2xl border border-emerald-200/70 bg-white dark:border-emerald-800/40 dark:bg-slate-900/40 p-3.5 space-y-2.5 shadow-2xs">
                                <p className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-emerald-100 dark:border-emerald-800/50 pb-2">
                                  <Info className="size-3.5 text-emerald-600" /> Data Keluarga & Kondisi Fisik
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  <DCell label="Anak Ke-" val={meta.anak_ke} />
                                  <DCell label="Jumlah Saudara" val={meta.jumlah_saudara} />
                                  <DCell label="Jumlah Saudara Tiri" val={meta.jumlah_saudara_tiri} />
                                  <DCell label="Berat Badan" val={cleanVal(meta.berat_badan) !== '-' ? `${meta.berat_badan} kg` : null} />
                                  <DCell label="Tinggi Badan" val={cleanVal(meta.tinggi_badan) !== '-' ? `${meta.tinggi_badan} cm` : null} />
                                  <DCell label="Riwayat Penyakit" val={meta.riwayat_penyakit} />
                                </div>
                              </div>

                              {/* Sub-Card 3: Alamat & Tempat Tinggal */}
                              <div className="rounded-2xl border border-emerald-200/70 bg-white dark:border-emerald-800/40 dark:bg-slate-900/40 p-3.5 space-y-2.5 shadow-2xs">
                                <p className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-emerald-100 dark:border-emerald-800/50 pb-2">
                                  <School className="size-3.5 text-emerald-600" /> Alamat Lengkap & Tempat Tinggal
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <DCell label="Alamat Lengkap" val={selectedStudent.alamat || meta.alamat_siswa} fullWidth />
                                  <DCell label="RT / RW" val={meta.rt && meta.rw && cleanVal(meta.rt) !== '-' ? `${meta.rt} / ${meta.rw}` : null} />
                                  <DCell label="Dusun / Jalan" val={meta.dusun} />
                                  <DCell label="Kelurahan" val={meta.kelurahan} />
                                  <DCell label="Kecamatan" val={meta.kecamatan} />
                                  <DCell label="Kota / Kabupaten" val={meta.kota_kabupaten} />
                                  <DCell label="Provinsi" val={meta.provinsi} />
                                  <DCell label="Kode Pos" val={meta.kode_pos} />
                                  <DCell label="Jenis Tempat Tinggal" val={meta.jenis_tempat_tinggal} />
                                </div>
                              </div>

                              {/* Sub-Card 4: Transportasi & Minat */}
                              <div className="rounded-2xl border border-emerald-200/70 bg-white dark:border-emerald-800/40 dark:bg-slate-900/40 p-3.5 space-y-2.5 shadow-2xs">
                                <p className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-emerald-100 dark:border-emerald-800/50 pb-2">
                                  <Sparkles className="size-3.5 text-emerald-600" /> Transportasi, Hobi & Cita-cita
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <DCell label="Jarak ke Sekolah" val={cleanVal(meta.jarak_tempuh_ke_sekolah) !== '-' ? `${meta.jarak_tempuh_ke_sekolah} km` : null} />
                                  <DCell label="Moda Transportasi" val={meta.moda_transportasi} />
                                  <DCell label="Hobi" val={meta.hobi} />
                                  <DCell label="Cita-cita" val={meta.cita_cita} />
                                </div>
                              </div>
                            </div>
                          )

                          if (activeDetailTab === 'orangTua') return (
                            <div className="space-y-3.5">
                              {/* Quick Contact Banner */}
                              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-emerald-50/90 border border-emerald-200/80 dark:bg-emerald-950/40 dark:border-emerald-800/60">
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                                    Hubungi Langsung Orang Tua / Wali
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleDirectChatPortal(selectedStudent)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 transition cursor-pointer shadow-xs"
                                  >
                                    <MessageSquare className="h-3.5 w-3.5" /> Chat SIMS Portal
                                  </button>
                                  {(meta.nomor_wa_ayah || meta.hp_ayah || meta.telfon_ayah || meta.nomor_wa_ibu || meta.hp_ibu || selectedStudent.noHp) && (
                                    <button
                                      type="button"
                                      onClick={() => handleDirectWhatsApp(meta.nomor_wa_ayah || meta.hp_ayah || meta.nomor_wa_ibu || selectedStudent.noHp, selectedStudent)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer shadow-xs"
                                    >
                                      <Phone className="h-3.5 w-3.5" /> WhatsApp
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Data Ayah */}
                              <div className="rounded-2xl border border-emerald-200/70 bg-white dark:border-emerald-800/40 dark:bg-slate-900/40 p-3.5 space-y-2.5 shadow-2xs">
                                <p className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-emerald-100 dark:border-emerald-800/50 pb-2">
                                  Data Ayah Kandung
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <DCell label="NIK Ayah" val={meta.nik_ayah} />
                                  <DCell label="Nama Ayah" val={meta.nama_ayah} />
                                  <DCell label="Tempat, Tgl Lahir Ayah" val={meta.tempat_lahir_ayah && meta.tgl_lahir_ayah ? `${meta.tempat_lahir_ayah}, ${meta.tgl_lahir_ayah}` : (meta.tempat_lahir_ayah || meta.tgl_lahir_ayah)} />
                                  <DCell label="Telfon / HP Ayah" val={meta.telfon_ayah || meta.hp_ayah} />
                                  <DCell label="No WA Ayah" val={meta.nomor_wa_ayah} />
                                  <DCell label="Pendidikan Terakhir Ayah" val={meta.pendidikan_terakhir_ayah} />
                                  <DCell label="Pekerjaan Ayah" val={meta.pekerjaan_ayah} />
                                  <DCell label="Instansi / Jabatan Ayah" val={meta.instansi_pekerjaan_ayah && meta.jabatan_pekerjaan_ayah ? `${meta.instansi_pekerjaan_ayah} — ${meta.jabatan_pekerjaan_ayah}` : (meta.instansi_pekerjaan_ayah || meta.jabatan_pekerjaan_ayah)} />
                                  <DCell label="Penghasilan Ayah" val={meta.penghasilan_ayah && cleanVal(meta.penghasilan_ayah) !== '-' ? `Rp ${Number(meta.penghasilan_ayah).toLocaleString('id-ID')}` : null} />
                                  <DCell label="Alamat Rumah Ayah" val={meta.alamat_ayah} />
                                </div>
                              </div>

                              {/* Data Ibu */}
                              <div className="rounded-2xl border border-blue-200/70 bg-white dark:border-blue-800/40 dark:bg-slate-900/40 p-3.5 space-y-2.5 shadow-2xs">
                                <p className="text-xs font-black text-blue-800 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-blue-100 dark:border-blue-800/50 pb-2">
                                  Data Ibu Kandung
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <DCell label="NIK Ibu" val={meta.nik_ibu} />
                                  <DCell label="Nama Ibu" val={meta.nama_ibu} />
                                  <DCell label="Tempat, Tgl Lahir Ibu" val={meta.tempat_lahir_ibu && meta.tgl_lahir_ibu ? `${meta.tempat_lahir_ibu}, ${meta.tgl_lahir_ibu}` : (meta.tempat_lahir_ibu || meta.tgl_lahir_ibu)} />
                                  <DCell label="Telfon / HP Ibu" val={meta.telfon_ibu || meta.hp_ibu} />
                                  <DCell label="No WA Ibu" val={meta.nomor_wa_ibu} />
                                  <DCell label="Pendidikan Terakhir Ibu" val={meta.pendidikan_terakhir_ibu} />
                                  <DCell label="Pekerjaan Ibu" val={meta.pekerjaan_ibu} />
                                  <DCell label="Instansi / Jabatan Ibu" val={meta.instansi_pekerjaan_ibu && meta.jabatan_pekerjaan_ibu ? `${meta.instansi_pekerjaan_ibu} — ${meta.jabatan_pekerjaan_ibu}` : (meta.instansi_pekerjaan_ibu || meta.jabatan_pekerjaan_ibu)} />
                                  <DCell label="Penghasilan Ibu" val={meta.penghasilan_ibu && cleanVal(meta.penghasilan_ibu) !== '-' ? `Rp ${Number(meta.penghasilan_ibu).toLocaleString('id-ID')}` : null} />
                                  <DCell label="Alamat Rumah Ibu" val={meta.alamat_ibu} />
                                </div>
                              </div>

                              {/* Data Wali (jika ada) */}
                              {(meta.nama_wali || meta.hp_wali) && (
                                <div className="rounded-2xl border border-slate-200/70 bg-white dark:border-slate-800/40 dark:bg-slate-900/40 p-3.5 space-y-2.5 shadow-2xs">
                                  <p className="text-xs font-black text-slate-800 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/50 pb-2">
                                    Data Wali Siswa
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <DCell label="NIK Wali" val={meta.nik_wali} />
                                    <DCell label="Nama Wali" val={meta.nama_wali} />
                                    <DCell label="HP / WA Wali" val={meta.hp_wali || meta.nomor_wa_wali} />
                                    <DCell label="Pekerjaan Wali" val={meta.pekerjaan_wali} />
                                    <DCell label="Alamat Wali" val={meta.alamat_wali} fullWidth />
                                  </div>
                                </div>
                              )}
                            </div>
                          )

                          if (activeDetailTab === 'akademik') return (
                            <div className="rounded-2xl border border-emerald-200/70 bg-white dark:border-emerald-800/40 dark:bg-slate-900/40 p-3.5 space-y-2.5 shadow-2xs">
                              <p className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-emerald-100 dark:border-emerald-800/50 pb-2">
                                <GraduationCap className="size-3.5 text-emerald-600" /> Informasi Akademik & Kesiswaan
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <DCell label="Unit Pendidikan" val={selectedStudent.unit} />
                                <DCell label="Kelas" val={selectedStudent.kelas} />
                                <DCell label="Tahun Ajaran Masuk" val={meta.tahun_ajaran_masuk} />
                                <DCell label="Tahun Ajaran Berjalan" val={meta.tahun_ajaran_berjalan} />
                                <DCell label="Status Siswa" val={selectedStudent.status} />
                                <DCell label="No. Virtual Account (VA BSI)" val={meta.no_va || meta.nis_pembayaran} />
                                <DCell label="NIS Pembayaran" val={meta.nis_pembayaran || meta.no_va} />
                                <DCell label="Wali Kelas" val={meta.wali_kelas} />
                                <DCell label="NIY Wali Kelas" val={meta.niy_wali_kelas} />
                                <DCell label="Status Orang Tua" val={meta.status_orang_tua} />
                                <DCell label="NIY Ortu (Jika Pegawai)" val={meta.niy_ortu_jika_pegawai} />
                                <DCell label="Sekolah Asal" val={meta.sekolah_asal} />
                                <DCell label="Status Sekolah Asal" val={meta.status_sekolah_asal} />
                                <DCell label="Nominal SPP" val={meta.nominal_spp && cleanVal(meta.nominal_spp) !== '-' ? `Rp ${Number(meta.nominal_spp).toLocaleString('id-ID')}` : null} />
                                <DCell label="Penerima KPS/PKH" val={meta.penerima_kps_pkh} />
                                <DCell label="Punya KIP" val={meta.apakah_punya_kip} />
                                <DCell label="Layak Menerima PIP" val={meta.apakah_layak_menerima_pip} />
                                <DCell label="Alasan Menolak PIP" val={meta.alasan_menolak_pip} />
                              </div>
                            </div>
                          )

                          if (activeDetailTab === 'riwayat') return (
                            <div className="rounded-2xl border border-emerald-200/70 bg-white dark:border-emerald-800/40 dark:bg-slate-900/40 p-3.5 space-y-2.5 shadow-2xs">
                              <p className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-emerald-100 dark:border-emerald-800/50 pb-2">
                                <Clock className="size-3.5 text-emerald-600" /> Riwayat Siswa & Catatan
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <DCell label="Tanggal Masuk" val={meta.tanggal_masuk} />
                                <DCell label="No Induk Sebelumnya" val={meta.no_induk_sebelumnya} />
                                <DCell label="Beasiswa" val={meta.beasiswa} />
                                <DCell label="Catatan" val={meta.catatan} fullWidth />
                              </div>
                              <p className="text-[11px] text-slate-400 mt-2 italic">Riwayat keaktifan harian & presensi siswa tercatat secara real-time pada modul presensi terpadu.</p>
                            </div>
                          )

                          if (activeDetailTab === 'dokumen') return (
                            <div className="rounded-2xl border border-emerald-200/70 bg-white dark:border-emerald-800/40 dark:bg-slate-900/40 p-3.5 space-y-2.5 shadow-2xs">
                              <p className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-emerald-100 dark:border-emerald-800/50 pb-2">
                                <FileText className="size-3.5 text-emerald-600" /> Dokumen & Berkas Siswa
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <DCell label="Foto Siswa (URL)" val={meta.foto_url} />
                                <DCell label="No Registrasi Akta Lahir" val={meta.no_registrasi_akta_lahir} />
                                <DCell label="No Kartu Keluarga (KK)" val={meta.no_kk} />
                              </div>
                              <p className="text-[11px] text-slate-400 mt-2 italic">Status berkas fisik dan ijazah asli dikelola secara manual dan tersimpan di ruang arsip TU unit.</p>
                            </div>
                          )

                          return null
                        })()}
                      </div>
                    </div>

                    {/* Quick Actions Card */}
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40 shadow-xs">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">AKSI CEPAT SISWA</h4>
                      <div className="flex flex-wrap gap-2.5">
                        {canUpdateStudent && (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(selectedStudent)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white px-4 py-2 text-xs font-bold border border-amber-300/40 hover:scale-[1.02] active:scale-95 transition-all shadow-xs cursor-pointer"
                          >
                            <FaEdit className="size-3.5" /> <span>Edit Data</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => { setStudentToPrint(selectedStudent); setShowCetakModal(true) }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white px-4 py-2 text-xs font-bold border border-indigo-300/40 hover:scale-[1.02] active:scale-95 transition-all shadow-xs cursor-pointer"
                        >
                          <FaPrint className="size-3.5" /> <span>Cetak Kartu Siswa</span>
                        </button>
                        {canDeleteStudent && (
                          <button
                            type="button"
                            onClick={() => handleDelete(selectedStudent)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2 text-xs font-bold border border-rose-300/40 hover:scale-[1.02] active:scale-95 transition-all shadow-xs cursor-pointer"
                          >
                            <FaTrash className="size-3.5" /> <span>Hapus Data</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer flex items-center justify-end border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/30">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-5 py-2.5 text-xs font-extrabold border border-rose-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 cursor-pointer shadow-md shadow-rose-500/20"
                >
                  <div className="flex size-4 items-center justify-center rounded-md bg-white/20 text-white">
                    <X className="size-3" strokeWidth={2.2} />
                  </div>
                  <span>Tutup</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

        {/* POP UP MODAL 2: TAMBAH / EDIT SISWA FORM (Code-split via React.lazy & Suspense) */}
        {showFormModal && (
          <Suspense
            fallback={
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="flex w-full max-w-md flex-col items-center justify-center gap-4 rounded-3xl border border-emerald-500/30 bg-white p-8 shadow-2xl dark:bg-[#1B2433]">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/60 dark:to-teal-950/40 border border-emerald-200/60 dark:border-emerald-800/60 shadow-xs">
                    <Sparkles className="size-7 text-emerald-600 dark:text-emerald-400 animate-spin" />
                  </div>
                  <div className="space-y-1.5 text-center">
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">
                      Memuat Formulir Siswa Terpadu...
                    </h4>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      Menyiapkan wizard 5-langkah, pemetaan wilayah, dan validasi data.
                    </p>
                  </div>
                </div>
              </div>
            }
          >
            <StudentFormModal
              isOpen={showFormModal}
              onClose={() => setShowFormModal(false)}
              initialData={isEdit ? selectedStudent : null}
              onSubmit={handleFormSubmitCallback}
              classes={rawClasses}
              units={rawUnits}
              userUnitId={userUnitId}
              isGlobalManager={isGlobalUser}
              isUnitManager={!isGlobalUser}
            />
          </Suspense>
        )}

        {/* POP UP MODAL 3: CETAK KARTU SISWA */}
        {showCetakModal && (
          <CetakKartuSiswaModal student={studentToPrint} onClose={() => setShowCetakModal(false)} />
        )}

        {/* POP UP MODAL: CETAK / PDF DAFTAR SISWA */}
        <PrintOptionModal
          isOpen={showPrintOptionModal}
          onClose={() => setShowPrintOptionModal(false)}
          onPrint={handlePrintDocument}
          onDownloadPdf={handleDownloadPdf}
        />

        {/* POP UP MODAL 4: DASHBOARD IMPORT DATA SISWA (HEROUI HARMONIZED BATCH MODAL) */}
        <AnimatePresence>
          {showImportModal && (
            <div
              className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              aria-labelledby="student-import-title"
              tabIndex={-1}
              onMouseDown={(e) => {
                if (e.target === e.currentTarget && !isImporting) {
                  setShowImportModal(false)
                  setImportFile(null)
                  setImportPreviewData([])
                }
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="modal-dialog font-sans my-auto w-full max-w-4xl"
              >
                <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
                  {/* Top Accent Gradient Bar */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

                  {/* Header */}
                  <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-blue-600 text-white p-2.5 shadow-md shadow-sky-500/30 border border-sky-300/30 shrink-0">
                        <Upload className="h-5 w-5 text-white" strokeWidth={2.25} />
                      </div>
                      <div>
                        <h3 id="student-import-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <span>Import Data Siswa</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60">
                            <Sparkles className="size-3" />
                            Batch Import
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Unggah file Excel atau CSV untuk mengimpor banyak siswa secara massal
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowImportModal(false)
                        setImportFile(null)
                        setImportPreviewData([])
                      }}
                      aria-label="Tutup form import"
                      className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white border border-rose-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer shadow-md shadow-rose-500/20"
                    >
                      <X className="size-4 text-white" strokeWidth={2.25} />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="modal-body min-h-0 flex-1 space-y-4.5 overflow-y-auto p-6 text-sm text-slate-700 dark:text-slate-200">
                    {/* Step 1: Download Template Card */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-sky-200/70 bg-gradient-to-r from-sky-50/50 via-teal-50/20 to-white p-4 dark:border-sky-800/50 dark:bg-slate-900/40">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 via-sky-600 to-blue-600 text-white border border-sky-300/30 shrink-0">
                          <Download className="size-4.5 text-white" strokeWidth={2.2} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Unduh Format Template Berkas</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Gunakan berkas template resmi agar kolom data terpetakan otomatis ke sistem ERP</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleDownloadTemplateSiswa}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-800 px-3.5 py-2 text-xs font-bold transition-all dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 cursor-pointer hover:scale-[1.02] active:scale-95 shrink-0 shadow-xs"
                      >
                        <div className="flex size-5 items-center justify-center rounded-md bg-emerald-600 text-white">
                          <Download className="size-3 text-white" strokeWidth={2.2} />
                        </div>
                        <span>Unduh Template (.xlsx)</span>
                      </button>
                    </div>

                    {/* Step 2: Upload Dropzone */}
                    <div>
                      <label className="group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-300/80 bg-gradient-to-b from-emerald-50/25 to-slate-50/50 p-6 text-center transition-all duration-200 hover:border-emerald-500 hover:bg-emerald-50/40 hover:shadow-xs dark:border-emerald-800/60 dark:bg-slate-900/30 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/20">
                        <div className="mb-2.5 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 text-[#0E5C44] transition-transform duration-200 group-hover:scale-110 dark:from-emerald-950/60 dark:to-teal-950/40 dark:border-emerald-800/60 dark:text-[#3FBF75]">
                          <FileSpreadsheet className="size-6" strokeWidth={2.2} />
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                          {importFile ? importFile.name : 'Pilih atau Tarik Berkas Spreadsheet Siswa ke Sini'}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-400">
                          Format disukai: .xlsx, .xls, atau .csv (Maksimal 5MB)
                        </p>
                        {importFile && (
                          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1 text-[11px] font-bold text-[#0E5C44] border border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/80">
                            <CheckCircle2 className="size-3.5" />
                            <span>{(importFile.size / 1024).toFixed(1)} KB · Berkas Siap Diunggah</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept=".csv, .xlsx, .xls"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                      {importFile && (
                        <div className="flex justify-end mt-1.5">
                          <button
                            type="button"
                            onClick={() => { setImportFile(null); setImportPreviewData([]) }}
                            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <X className="size-3" /> Ganti Berkas
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Step 3: Preview Table */}
                    {importPreviewData.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <span>Preview Data yang Siap Diimpor</span>
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {importPreviewData.length} baris
                            </span>
                          </p>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                            Format Sesuai
                          </span>
                        </div>
                        <div className="max-h-48 overflow-auto rounded-2xl border border-emerald-200/80 bg-white shadow-2xs dark:border-emerald-900/50 dark:bg-[#182232]">
                          <TableRoot className="w-full text-left text-[11px]">
                            <TableHeader className="bg-gradient-to-r from-emerald-100/80 via-teal-50/60 to-emerald-100/80 border-b border-emerald-200/80 dark:from-emerald-950/80 dark:via-teal-950/60 dark:to-emerald-950/80 dark:border-emerald-900/50 font-bold text-slate-700 dark:text-slate-200">
                              <TableRow>
                                <TableHead className="py-2 px-3">NIS</TableHead>
                                <TableHead className="py-2 px-3">NISN</TableHead>
                                <TableHead className="py-2 px-3">Nama Siswa</TableHead>
                                <TableHead className="py-2 px-3">JK</TableHead>
                                <TableHead className="py-2 px-3">Unit</TableHead>
                                <TableHead className="py-2 px-3">Kelas</TableHead>
                                <TableHead className="py-2 px-3">Orang Tua</TableHead>
                                <TableHead className="py-2 px-3">No HP</TableHead>
                                <TableHead className="py-2 px-3 text-center">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                              {importPreviewData.map((row, idx) => (
                                <TableRow key={idx} className="hover:bg-emerald-50/30 dark:hover:bg-slate-800/40 transition-colors">
                                  <TableCell className="py-2 px-3 font-mono font-medium text-slate-700 dark:text-slate-300">{row.nis}</TableCell>
                                  <TableCell className="py-2 px-3 font-mono text-slate-500 dark:text-slate-400">{row.nisn}</TableCell>
                                  <TableCell className="py-2 px-3 font-bold text-slate-900 dark:text-white">{row.nama}</TableCell>
                                  <TableCell className="py-2 px-3 text-slate-600 dark:text-slate-300">{row.gender}</TableCell>
                                  <TableCell className="py-2 px-3 text-slate-600 dark:text-slate-300">{row.unit}</TableCell>
                                  <TableCell className="py-2 px-3 font-semibold text-emerald-700 dark:text-emerald-400">{row.kelas}</TableCell>
                                  <TableCell className="py-2 px-3 text-slate-600 dark:text-slate-300">{row.namaAyah}</TableCell>
                                  <TableCell className="py-2 px-3 font-mono text-slate-600 dark:text-slate-300">{row.hpAyah}</TableCell>
                                  <TableCell className="py-2 px-3 text-center">
                                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#0E5C44] border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80">
                                      {row.status}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </TableRoot>
                        </div>
                      </div>
                    )}

                    {/* Opsi Timpa Data Jika Ada yang Sama */}
                    <div className={cn(
                      "rounded-2xl border p-4 transition-all duration-200",
                      overwriteExisting
                        ? "border-amber-300/80 bg-amber-50/70 dark:border-amber-700/60 dark:bg-amber-950/25"
                        : "border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/30"
                    )}>
                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={overwriteExisting}
                          onChange={(e) => setOverwriteExisting(e.target.checked)}
                          className="mt-0.5 h-4.5 w-4.5 rounded-lg border-slate-300 text-amber-600 focus:ring-amber-500 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                        />
                        <div className="flex-1 text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                            <span>Timpa data jika NIS atau NISN sudah terdaftar</span>
                            {overwriteExisting ? (
                              <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-extrabold text-amber-900 dark:bg-amber-900/80 dark:text-amber-200">
                                Mode Timpa Aktif
                              </span>
                            ) : (
                              <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                Lewati Duplikat
                              </span>
                            )}
                          </span>
                          <p className="mt-1 text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                            Jika dicentang, profil siswa dengan NIS atau NISN yang cocok akan diperbarui (ditimpa) dengan isi data terbaru dari berkas. Jika tidak dicentang, baris duplikat akan dilewati dengan aman.
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Guidance Banner */}
                    <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-3.5 dark:border-emerald-800/50 dark:bg-emerald-950/30 flex items-start gap-2.5">
                      <ShieldCheck className="size-4.5 text-[#0E5C44] dark:text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                        Sistem akan memvalidasi keunikan nomor induk siswa (NIS/NISN) dan secara otomatis menautkan data wali dan kelas tanpa merusak integritas database yang sudah ada.
                      </p>
                    </div>
                  </div>

                  {/* Modal Action Footer */}
                  <div className="modal-footer flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/30">
                    <button
                      type="button"
                      disabled={isImporting}
                      onClick={() => {
                        setShowImportModal(false)
                        setImportFile(null)
                        setImportPreviewData([])
                      }}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                        <X className="size-3.5 text-white" strokeWidth={2.2} />
                      </div>
                      <span>Batal</span>
                    </button>
                    <button
                      type="button"
                      disabled={!importFile || isImporting}
                      onClick={handleProcessImport}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white px-5 py-2.5 text-xs font-extrabold shadow-md shadow-emerald-700/20 hover:scale-[1.03] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isImporting ? (
                        <>
                          <Sparkles className="size-4 animate-spin" />
                          <span>Memproses Import...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="size-4" />
                          <span>Proses Import Data</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── MODAL HASIL IMPOR & PEMBERITAHUAN DATA DUPLIKAT SISWA ── */}
        <AnimatePresence>
          {duplicateModalData && (
            <div
              className="overlay modal fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              aria-labelledby="siswa-duplicate-report-title"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="modal-dialog font-sans my-auto w-full max-w-xl"
              >
                <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
                  {/* Top Accent Gradient Bar */}
                  <div className={cn(
                    "h-1.5 w-full shrink-0",
                    duplicateModalData.diperbarui > 0
                      ? "bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600"
                      : duplicateModalData.duplikat > 0
                        ? "bg-gradient-to-r from-sky-500 via-teal-400 to-emerald-500"
                        : "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"
                  )} />

                  {/* Header */}
                  <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "rounded-2xl p-2.5 text-white shadow-md shrink-0 border",
                        duplicateModalData.diperbarui > 0
                          ? "bg-gradient-to-br from-amber-500 to-orange-600 border-amber-300/30 shadow-amber-500/30"
                          : "bg-gradient-to-br from-emerald-500 to-teal-700 border-emerald-300/30 shadow-emerald-500/30"
                      )}>
                        {duplicateModalData.diperbarui > 0 ? (
                          <RefreshCcw className="h-5 w-5 text-white" strokeWidth={2.25} />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-white" strokeWidth={2.25} />
                        )}
                      </div>
                      <div>
                        <h3 id="siswa-duplicate-report-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <span>Hasil Impor & Pemberitahuan Data Siswa</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            Total {duplicateModalData.total || 0} Data
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Ringkasan sinkronisasi dan status pemrosesan data siswa/santri
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDuplicateModalData(null)}
                      aria-label="Tutup ringkasan impor"
                      className="size-9 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 transition cursor-pointer"
                    >
                      <X className="size-4" strokeWidth={2.25} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="modal-body min-h-0 flex-1 space-y-4 overflow-y-auto p-6 text-sm text-slate-700 dark:text-slate-200">
                    {/* KPI Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/30 text-center">
                        <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">Baru Ditambah</p>
                        <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{duplicateModalData.berhasil || 0}</p>
                      </div>
                      <div className="p-3 rounded-2xl border border-amber-200/80 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/30 text-center">
                        <p className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase">Ditimpa / Diupdate</p>
                        <p className="text-xl font-black text-amber-700 dark:text-amber-400 mt-0.5">{duplicateModalData.diperbarui || 0}</p>
                      </div>
                      <div className="p-3 rounded-2xl border border-sky-200/80 bg-sky-50/50 dark:border-sky-900/40 dark:bg-sky-950/30 text-center">
                        <p className="text-[10px] font-bold text-sky-800 dark:text-sky-300 uppercase">Duplikat Dilewati</p>
                        <p className="text-xl font-black text-sky-700 dark:text-sky-400 mt-0.5">{duplicateModalData.duplikat || 0}</p>
                      </div>
                      <div className="p-3 rounded-2xl border border-rose-200/80 bg-rose-50/50 dark:border-rose-900/40 dark:bg-rose-950/30 text-center">
                        <p className="text-[10px] font-bold text-rose-800 dark:text-rose-300 uppercase">Gagal Diproses</p>
                        <p className="text-xl font-black text-rose-700 dark:text-rose-400 mt-0.5">{duplicateModalData.gagal || 0}</p>
                      </div>
                    </div>

                    {/* Duplicate Detail Table if exists */}
                    {duplicateModalData.duplicates && duplicateModalData.duplicates.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-400" />
                            <span>Daftar Data yang Sama (NIS / NISN Terdaftar)</span>
                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              {duplicateModalData.duplicates.length} baris
                            </span>
                          </p>
                        </div>
                        <div className="max-h-56 overflow-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xs dark:border-slate-800 dark:bg-[#182232]">
                          <TableRoot className="w-full text-left text-[11px]">
                            <TableHeader className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
                              <TableRow>
                                <TableHead className="px-3 py-2 w-14">Baris</TableHead>
                                <TableHead className="px-3 py-2">NIS</TableHead>
                                <TableHead className="px-3 py-2">Nama Siswa</TableHead>
                                <TableHead className="px-3 py-2">Status Aksi</TableHead>
                                <TableHead className="px-3 py-2">Keterangan</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {duplicateModalData.duplicates.map((item, idx) => (
                                <TableRow key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                                  <TableCell className="px-3 py-2 font-mono text-slate-500">{item.baris}</TableCell>
                                  <TableCell className="px-3 py-2 font-mono font-bold text-slate-800 dark:text-slate-200">{item.kode || '-'}</TableCell>
                                  <TableCell className="px-3 py-2 font-semibold text-slate-900 dark:text-white">{item.nama}</TableCell>
                                  <TableCell className="px-3 py-2">
                                    <span className={cn(
                                      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
                                      item.status === 'Ditimpa'
                                        ? "bg-amber-100 text-amber-800 border border-amber-300/80 dark:bg-amber-950 dark:text-amber-300"
                                        : "bg-sky-100 text-sky-800 border border-sky-300/80 dark:bg-sky-950 dark:text-sky-300"
                                    )}>
                                      {item.status}
                                    </span>
                                  </TableCell>
                                  <TableCell className="px-3 py-2 text-slate-600 dark:text-slate-400 text-[10px]">{item.keterangan}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </TableRoot>
                        </div>
                      </div>
                    )}

                    {/* Error List if exists */}
                    {duplicateModalData.errors && duplicateModalData.errors.length > 0 && (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-3.5 dark:border-rose-900/50 dark:bg-rose-950/30 text-xs">
                        <p className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 mb-1.5">
                          <XCircle className="size-3.5" />
                          <span>Catatan Kesalahan Baris Data:</span>
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-rose-700 dark:text-rose-400 text-[11px]">
                          {duplicateModalData.errors.slice(0, 5).map((err, i) => (
                            <li key={i}>{typeof err === 'string' ? err : JSON.stringify(err)}</li>
                          ))}
                          {duplicateModalData.errors.length > 5 && (
                            <li className="font-semibold italic">...dan {duplicateModalData.errors.length - 5} kesalahan lainnya.</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="modal-footer flex items-center justify-end border-t border-slate-100 bg-slate-50/50 px-6 py-3.5 dark:border-slate-800 dark:bg-slate-900/30">
                    <button
                      type="button"
                      onClick={() => setDuplicateModalData(null)}
                      className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-bold transition shadow-sm cursor-pointer"
                    >
                      <Check className="size-3.5" strokeWidth={2.2} />
                      <span>Tutup & Mengerti</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* POP UP MODAL: DASHBOARD EXPORT DATA SISWA (HEROUI HARMONIZED BATCH MODAL) */}
        <AnimatePresence>
          {showExportModal && (
            <div
              className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              aria-labelledby="student-export-title"
              tabIndex={-1}
              onMouseDown={(e) => {
                if (e.target === e.currentTarget && !isExporting) {
                  setShowExportModal(false)
                }
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="modal-dialog font-sans my-auto w-full max-w-lg"
              >
                <div className="modal-content flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
                  {/* Top Accent Gradient Bar */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

                  {/* Header */}
                  <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white p-2.5 shadow-md shadow-amber-500/30 border border-amber-300/30 shrink-0">
                        <Download className="h-5 w-5 text-white" strokeWidth={2.25} />
                      </div>
                      <div>
                        <h3 id="student-export-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <span>Export Data {terms.siswa || 'Siswa'}</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60">
                            <Sparkles className="size-3" />
                            Unduh Data
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Pilih format berkas untuk mengekspor data master {terms.siswa?.toLowerCase() || 'siswa'} sesuai filter aktif
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isExporting}
                      onClick={() => setShowExportModal(false)}
                      aria-label="Tutup modal export"
                      className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white border border-rose-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer shadow-md shadow-rose-500/20 disabled:opacity-50"
                    >
                      <X className="size-4 text-white" strokeWidth={2.25} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="modal-body space-y-4 p-6 text-sm text-slate-700 dark:text-slate-200 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { value: 'xlsx', label: 'Excel (.xlsx)', desc: 'Format Microsoft Excel Modern (Disarankan)' },
                        { value: 'xls', label: 'Excel (.xls)', desc: 'Format Microsoft Excel Standard 97-2003' },
                        { value: 'csv', label: 'CSV (.csv)', desc: 'Format Comma Separated Values universal' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setExportFormat(opt.value)}
                          className={cn(
                            "flex flex-col text-left gap-1 rounded-2xl border p-3.5 transition-all cursor-pointer",
                            exportFormat === opt.value
                              ? "border-emerald-500 bg-emerald-50/70 shadow-sm dark:border-emerald-600 dark:bg-emerald-950/40 ring-1 ring-emerald-500"
                              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800/40"
                          )}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-xs font-black text-slate-900 dark:text-white">{opt.label}</span>
                            <div className={cn(
                              "size-4 rounded-full border flex items-center justify-center",
                              exportFormat === opt.value ? "border-emerald-600 bg-emerald-600" : "border-slate-300 dark:border-slate-600"
                            )}>
                              {exportFormat === opt.value && <div className="size-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug mt-1">{opt.desc}</p>
                        </button>
                      ))}
                    </div>

                    {/* Active Filters Summary Box */}
                    <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 dark:bg-amber-950/30 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <Sparkles className="size-3.5 text-amber-600 dark:text-amber-400" />
                        Cakupan Data Terfilter
                      </p>
                      <div className="text-[11px] text-amber-800/90 dark:text-amber-300/80 space-y-0.5">
                        <p>Total target: <span className="font-bold text-amber-900 dark:text-amber-200">{Number(studentPagination.total || filteredStudents.length).toLocaleString('id-ID')} {terms.siswa?.toLowerCase() || 'siswa'}</span></p>
                        {(unitFilter && unitFilter !== 'Semua') && (
                          <p>• Unit Pendidikan: <span className="font-semibold">{rawUnits.find(u => String(u.id) === String(unitFilter))?.name || unitFilter}</span></p>
                        )}
                        {(kelasFilter && kelasFilter !== 'Semua') && (
                          <p>• Rombel / Kelas: <span className="font-semibold">{availableClasses.find(c => String(c.id) === String(kelasFilter))?.name || kelasFilter}</span></p>
                        )}
                        {(statusFilter && statusFilter !== 'Semua') && (
                          <p>• Status: <span className="font-semibold">{statusFilter}</span></p>
                        )}
                        {searchQuery && (
                          <p>• Pencarian: &ldquo;<span className="font-semibold">{searchQuery}</span>&rdquo;</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="modal-footer flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/30 shrink-0">
                    <button
                      type="button"
                      disabled={isExporting}
                      onClick={() => setShowExportModal(false)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                        <X className="size-3.5 text-white" strokeWidth={2.2} />
                      </div>
                      <span>Batal</span>
                    </button>
                    <button
                      type="button"
                      disabled={isExporting}
                      onClick={() => handleProcessExport(exportFormat)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white px-5 py-2.5 text-xs font-extrabold border border-amber-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 cursor-pointer shadow-md shadow-amber-500/25 disabled:opacity-50"
                    >
                      <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                        <Download className="size-3.5 text-white" strokeWidth={2.25} />
                      </div>
                      <span>{isExporting ? 'Memproses...' : 'Unduh Berkas'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal Detail Data Statistik Siswa (ERP Stat Cards Popup) */}
        {statCardModal.isOpen && (
          <OverlayWrapper
            isOpen={statCardModal.isOpen}
            onOpenChange={(open) => {
              if (!open) setStatCardModal((prev) => ({ ...prev, isOpen: false }))
            }}
            isDismissable
          >
            <Backdrop isOpen={statCardModal.isOpen} />
            <Dialog className="max-w-4xl w-full p-6 space-y-5">
              <DialogHeader className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <DialogTitle className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide">
                    {statCardModal.title}
                  </DialogTitle>
                  <DialogDescription className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Daftar rinci siswa terfilter berdasarkan statistik
                  </DialogDescription>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      type="text"
                      value={statModalSearch}
                      onChange={(e) => setStatModalSearch(e.target.value)}
                      placeholder="Cari nama, NIS, NISN, atau kelas..."
                      className="w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Total: {statModalItems.length} Siswa
                  </span>
                </div>

                <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <TableRoot className="w-full text-left text-xs">
                    <TableHeader className="sticky top-0 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                      <TableRow>
                        <TableHead className="p-3">Nama Siswa & NIS/NISN</TableHead>
                        <TableHead className="p-3">Unit Kerja</TableHead>
                        <TableHead className="p-3">Kelas</TableHead>
                        <TableHead className="p-3 text-center">Jenis Kelamin</TableHead>
                        <TableHead className="p-3 text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {statModalItems.length > 0 ? (
                        statModalItems.map((std) => (
                          <TableRow key={std.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                            <TableCell className="p-3">
                              <div className="flex items-center gap-3">
                                <PersonAvatar src={std.foto} name={std.nama} size="sm" />
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-white">{std.nama}</p>
                                  <p className="font-mono text-[10px] text-slate-400">NIS: {std.nis} | NISN: {std.nisn}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="p-3 font-semibold text-emerald-700 dark:text-emerald-400">{std.unit}</TableCell>
                            <TableCell className="p-3 text-slate-600 dark:text-slate-300 font-semibold">{std.kelas}</TableCell>
                            <TableCell className="p-3 text-center text-slate-600 dark:text-slate-300">{std.gender}</TableCell>
                            <TableCell className="p-3 text-center">
                              <AppBadge variant={std.status === 'Aktif' ? 'success' : 'danger'} dot>
                                {std.status}
                              </AppBadge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="p-6 text-center text-slate-400 font-semibold">
                            Data siswa tidak ditemukan.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </TableRoot>
                </div>
              </div>

              <DialogFooter className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                <Button
                  variant="primary"
                  appearance="fill"
                  size="sm"
                  onClick={handlePrintStatCardModal}
                  className="flex items-center gap-1.5 font-bold cursor-pointer"
                >
                  <Printer className="size-4" />
                  Cetak Tabel Popup
                </Button>

                <Button
                  variant="ghost"
                  appearance="outline"
                  size="sm"
                  onClick={() => setStatCardModal((prev) => ({ ...prev, isOpen: false }))}
                  className="font-semibold"
                >
                  Tutup
                </Button>
              </DialogFooter>
            </Dialog>
          </OverlayWrapper>
        )}

        {/* MODAL PILIH OPSI CHAT KE ORANG TUA */}
        <AnimatePresence>
          {chatTargetModal && (
            <div
              className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) setChatTargetModal(null)
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="modal-dialog font-sans my-auto w-full max-w-md"
              >
                <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
                  {/* Top Accent Gradient Bar */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

                  {/* Header */}
                  <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white p-2.5 shadow-md shadow-emerald-500/30 border border-emerald-300/30 shrink-0">
                        <MessageCircle className="size-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Hubungi Orang Tua / Wali</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Siswa: <strong className="text-emerald-700 dark:text-emerald-400">{chatTargetModal.nama || chatTargetModal.full_name}</strong>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setChatTargetModal(null)}
                      className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white border border-rose-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer shadow-md shadow-rose-500/20"
                    >
                      <X className="size-4 text-white" strokeWidth={2.25} />
                    </button>
                  </div>

                  <div className="p-6 space-y-4 text-slate-700 dark:text-slate-200">
                    <div className="rounded-2xl bg-slate-50/80 p-3.5 text-xs border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800 space-y-1.5">
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-500">Nama Wali:</span>
                        <strong className="text-slate-800 dark:text-slate-200">{chatTargetModal.orangTua || '-'}</strong>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-500">Unit / Kelas:</span>
                        <strong className="text-slate-800 dark:text-slate-200">{chatTargetModal.unit} • Kelas {chatTargetModal.kelas}</strong>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-500">Nomor HP / WA:</span>
                        <strong className="text-emerald-700 dark:text-emerald-400">{chatTargetModal.noHp || '-'}</strong>
                      </div>
                    </div>

                    {/* Field Tulis Pesan untuk Orang Tua */}
                    <div className="space-y-1.5">
                      <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span>Pesan yang Ingin Dikirim:</span>
                        <span className="text-[10px] text-slate-400 font-medium">{chatQuickMessage.length}/1000 karakter</span>
                      </label>
                      <textarea
                        value={chatQuickMessage}
                        onChange={(e) => setChatQuickMessage(e.target.value)}
                        placeholder="Ketik pesan informasi atau konsultasi untuk orang tua/wali di sini..."
                        rows={3}
                        maxLength={1000}
                        className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-emerald-400 resize-none transition shadow-2xs font-medium"
                      />
                    </div>

                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilih Jalur Komunikasi:</p>

                    <div className="grid grid-cols-1 gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleDirectChatPortal(chatTargetModal)}
                        className="flex items-center gap-3 w-full p-3 rounded-2xl border border-emerald-300/80 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-white hover:border-emerald-500 text-emerald-950 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-200 transition cursor-pointer text-left shadow-2xs hover:shadow-xs group"
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black shadow-xs group-hover:scale-105 transition-transform">
                          <MessageSquare className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black">Chat Internal SIMS Terpadu</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Pesan resmi tersimpan dalam riwayat komunikasi sekolah</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDirectWhatsApp(chatTargetModal.noHp, chatTargetModal)}
                        className="flex items-center gap-3 w-full p-3 rounded-2xl border border-slate-200/80 bg-white hover:border-emerald-400 text-slate-800 dark:bg-slate-900/40 dark:border-slate-800 dark:text-slate-200 transition cursor-pointer text-left shadow-2xs hover:shadow-xs group"
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-black shadow-xs group-hover:scale-105 transition-transform">
                          <Phone className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black">Hubungi via WhatsApp</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Kirim pesan langsung ke nomor WhatsApp orang tua</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="modal-footer flex items-center justify-end border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/30">
                    <button
                      type="button"
                      onClick={() => setChatTargetModal(null)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 px-4 py-2 text-xs font-bold transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: KONFIRMASI SIMPAN / PERBARUI DATA SISWA HARMONISASI HEROUI */}
        <AnimatePresence>
          {showSaveConfirmDialog && (
            <div
              className="overlay modal fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              aria-labelledby="student-save-confirm-title"
              tabIndex={-1}
              onMouseDown={(e) => {
                if (e.target === e.currentTarget && !isSaving) setShowSaveConfirmDialog(false)
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="modal-dialog font-sans my-auto w-full max-w-md"
              >
                <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
                  {/* Top Accent Gradient Bar */}
                  <div
                    className={cn(
                      "h-1.5 w-full shrink-0",
                      isEdit
                        ? "bg-gradient-to-r from-amber-500 via-teal-400 to-emerald-600"
                        : "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"
                    )}
                  />

                  {/* Header */}
                  <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "rounded-2xl text-white p-2.5 shadow-md shrink-0 border",
                          isEdit
                            ? "bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 shadow-amber-500/30 border-amber-300/30"
                            : "bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 shadow-emerald-500/30 border-emerald-300/30"
                        )}
                      >
                        {isEdit ? (
                          <Pencil className="h-5 w-5 text-white" strokeWidth={2.25} />
                        ) : (
                          <GraduationCap className="h-5 w-5 text-white" strokeWidth={2.25} />
                        )}
                      </div>
                      <div>
                        <h3
                          id="student-save-confirm-title"
                          className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2"
                        >
                          <span>{isEdit ? 'Konfirmasi Perubahan Data' : 'Konfirmasi Penyimpanan Data'}</span>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border",
                              isEdit
                                ? "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60"
                                : "bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60"
                            )}
                          >
                            <Sparkles className="size-3" />
                            {isEdit ? 'Update Data' : 'Siswa Baru'}
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {isEdit
                            ? 'Verifikasi data siswa sebelum pembaruan diterapkan ke server.'
                            : 'Verifikasi data siswa baru sebelum disimpan ke dalam sistem.'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => setShowSaveConfirmDialog(false)}
                      aria-label="Tutup dialog konfirmasi"
                      className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer disabled:opacity-50"
                    >
                      <X className="size-4 text-white" strokeWidth={2.25} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="modal-body p-6 space-y-4 text-slate-700 dark:text-slate-200">
                    {/* Target Info Summary Card */}
                    <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3.5 dark:border-slate-800/80 dark:bg-slate-900/50 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nama Siswa</span>
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white text-right max-w-[220px] truncate">
                          {pendingSavePayload?.full_name || '-'}
                        </span>
                      </div>
                      {(pendingSavePayload?.nis || pendingSavePayload?.nisn) && (
                        <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 dark:border-slate-800/60">
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">NIS / NISN</span>
                          <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                            {pendingSavePayload?.nis || '-'} / {pendingSavePayload?.nisn || '-'}
                          </span>
                        </div>
                      )}
                      {pendingSavePayload?.metadata?.unit_pendidikan && (
                        <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 dark:border-slate-800/60">
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Unit Sekolah</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {pendingSavePayload.metadata.unit_pendidikan}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Notice Box */}
                    <div
                      className={cn(
                        "rounded-2xl border p-3.5 text-xs font-semibold leading-relaxed flex items-start gap-2.5",
                        isEdit
                          ? "border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300"
                          : "border-emerald-200 bg-emerald-50/70 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-lg text-white mt-0.5",
                          isEdit
                            ? "bg-gradient-to-br from-amber-500 to-orange-600"
                            : "bg-gradient-to-br from-emerald-500 to-teal-600"
                        )}
                      >
                        <Sparkles className="size-3 text-white" />
                      </div>
                      <div className="flex-1">
                        {isEdit
                          ? 'Data siswa yang sudah ada akan segera diperbarui di database server dengan informasi terbaru.'
                          : 'Data siswa baru akan tersimpan dan langsung aktif sesuai konfigurasi rombel dan unit sistem.'}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="modal-footer flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => setShowSaveConfirmDialog(false)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <div className="flex size-4 items-center justify-center rounded-md bg-white/20 text-white">
                        <X className="size-3" strokeWidth={2.2} />
                      </div>
                      <span>Batal</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleConfirmSave}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white px-5 py-2.5 text-xs font-extrabold border border-emerald-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-500/20"
                    >
                      {isSaving ? (
                        <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <div className="flex size-4 items-center justify-center rounded-md bg-white/20 text-white">
                          <Save className="size-3 text-white" strokeWidth={2.2} />
                        </div>
                      )}
                      <span>
                        {isSaving
                          ? isEdit ? 'Memperbarui...' : 'Menyimpan...'
                          : isEdit ? 'Ya, Perbarui Data' : 'Ya, Simpan Data'}
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: KONFIRMASI HAPUS DATA SISWA HARMONISASI HEROUI */}
        <AnimatePresence>
          {deleteTarget && (
            <div
              className="overlay modal fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              aria-labelledby="student-delete-confirm-title"
              tabIndex={-1}
              onMouseDown={(e) => {
                if (e.target === e.currentTarget && !isDeleting) setDeleteTarget(null)
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="modal-dialog font-sans my-auto w-full max-w-md"
              >
                <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-rose-200/60 bg-white shadow-2xl shadow-rose-950/20 dark:border-rose-900/50 dark:bg-[#182232] dark:shadow-black/60">
                  {/* Top Accent Gradient Bar */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-rose-600 to-red-700 shrink-0" />

                  {/* Header */}
                  <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl text-white p-2.5 shadow-md shrink-0 border bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 shadow-rose-500/30 border-rose-300/30">
                        <Trash2 className="h-5 w-5 text-white" strokeWidth={2.25} />
                      </div>
                      <div>
                        <h3
                          id="student-delete-confirm-title"
                          className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2"
                        >
                          <span>Hapus Data Siswa</span>
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800/60">
                            <AlertTriangle className="size-3" />
                            Hapus Permanen
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Tindakan ini permanen dan tidak dapat dibatalkan.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => setDeleteTarget(null)}
                      aria-label="Tutup dialog konfirmasi"
                      className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer disabled:opacity-50"
                    >
                      <X className="size-4 text-white" strokeWidth={2.25} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="modal-body p-6 space-y-4 text-slate-700 dark:text-slate-200">
                    {/* Student Identity Card */}
                    <div className="rounded-2xl border border-rose-100/90 bg-rose-50/40 p-4 dark:border-rose-900/40 dark:bg-rose-950/20 space-y-3">
                      <div className="flex items-center gap-3">
                        <PersonAvatar
                          src={deleteTarget.foto || deleteTarget.foto_url}
                          name={deleteTarget.nama || deleteTarget.full_name}
                          size="sm"
                          className="border-2 border-rose-300 shadow-sm"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                            {deleteTarget.nama || deleteTarget.full_name || '-'}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            NIS: {deleteTarget.nis || '-'} · NISN: {deleteTarget.nisn || '-'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-rose-100/80 dark:border-rose-900/30 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px] font-semibold">Unit Sekolah</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{deleteTarget.unit || '-'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-semibold">Kelas</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{deleteTarget.kelas || '-'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Danger Notice Box */}
                    <div className="rounded-2xl border border-rose-200/80 bg-rose-50/70 p-3.5 text-xs font-semibold text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300 leading-relaxed flex items-start gap-2.5">
                      <div className="flex size-5 shrink-0 items-center justify-center rounded-lg text-white bg-gradient-to-br from-rose-500 to-red-600 mt-0.5">
                        <AlertTriangle className="size-3 text-white" />
                      </div>
                      <div className="flex-1">
                        Data siswa <strong>"{deleteTarget.nama || deleteTarget.full_name}"</strong> beserta seluruh riwayat absensi, nilai, dan relasi terkait akan dihapus secara permanen dari server.
                      </div>
                    </div>

                    {/* Checkbox Konfirmasi */}
                    <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
                      <input
                        type="checkbox"
                        checked={hasConfirmedDeleteCheck}
                        onChange={(e) => setHasConfirmedDeleteCheck(e.target.checked)}
                        className="size-4 rounded-md border-rose-300 text-rose-600 focus:ring-rose-500 accent-rose-600"
                      />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Saya memahami konsekuensi penghapusan permanen ini
                      </span>
                    </label>
                  </div>

                  {/* Footer */}
                  <div className="modal-footer flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => setDeleteTarget(null)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs font-extrabold transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <div className="flex size-4 items-center justify-center rounded-md bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        <X className="size-3" strokeWidth={2.2} />
                      </div>
                      <span>Batal</span>
                    </button>

                    <button
                      type="button"
                      disabled={isDeleting || !hasConfirmedDeleteCheck}
                      onClick={handleConfirmDelete}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-5 py-2.5 text-xs font-extrabold border border-rose-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-rose-500/25"
                    >
                      {isDeleting ? (
                        <>
                          <Sparkles className="size-3.5 animate-spin" />
                          <span>Menghapus...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="size-3.5" />
                          <span>Hapus Permanen</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL AJUKAN PINDAH UNIT (TWO-WAY HANDSHAKE) */}
        <AnimatePresence>
          {showAjukanMutasiModal && studentToMutate && (
            <div
              className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="modal-dialog font-sans my-auto w-full max-w-lg"
              >
                <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
                  <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600 shrink-0" />
                  
                  {/* Header */}
                  <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-gradient-to-br from-teal-500 via-emerald-600 to-teal-700 text-white p-2.5 shadow-md shadow-emerald-500/30 border border-teal-300/30 shrink-0">
                        <ArrowRightLeft className="h-5 w-5 text-white" strokeWidth={2.25} />
                      </div>
                      <div>
                        <h3 className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <span>Ajukan Pindah Unit</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60">
                            Internal Yayasan
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Kirim permohonan mutasi ke TU Unit Pendidikan yang dituju
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAjukanMutasiModal(false)}
                      className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-4 overflow-y-auto">
                    {/* Ringkasan Siswa */}
                    <div className="flex items-center gap-3.5 rounded-2xl bg-slate-50 p-3.5 border border-slate-200/70 dark:bg-slate-900/60 dark:border-slate-800">
                      <PersonAvatar
                        name={studentToMutate.name || studentToMutate.full_name}
                        avatarUrl={resolveAvatarUrl(studentToMutate.foto_url || studentToMutate.avatar)}
                        size="md"
                        className="rounded-xl border border-white shadow-sm"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {studentToMutate.name || studentToMutate.full_name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          NIS: {studentToMutate.nis || '-'} • Unit: {studentToMutate.unit || studentToMutate.unit_name || '-'}
                        </p>
                      </div>
                    </div>

                    {/* Pilih Unit Tujuan */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Unit Pendidikan Tujuan <span className="text-rose-500">*</span>
                      </label>
                      <HeroUiFilterSelect
                        value={mutasiForm.unit_tujuan_id}
                        onChange={(val) => setMutasiForm((prev) => ({ ...prev, unit_tujuan_id: val }))}
                        options={[
                          { value: '', label: '-- Pilih Unit Pendidikan Tujuan --' },
                          ...rawUnits
                            .filter((u) => String(u.id) !== String(studentToMutate.unit_id || studentToMutate.education_unit_id))
                            .map((u) => ({
                              value: String(u.id),
                              label: u.nama_unit || u.name || u.nama,
                              subtext: u.kode_unit ? `Kode: ${u.kode_unit}` : undefined,
                            })),
                        ]}
                        placeholder="Pilih Unit Tujuan..."
                        icon={Building2}
                        searchable={rawUnits.length > 5}
                        ariaLabel="Unit Pendidikan Tujuan"
                      />
                    </div>

                    {/* Alasan Pindah */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Alasan Pindah Unit
                      </label>
                      <input
                        type="text"
                        value={mutasiForm.alasan}
                        onChange={(e) => setMutasiForm((prev) => ({ ...prev, alasan: e.target.value }))}
                        placeholder="Contoh: Lulus jenjang TK naik ke SD, mutasi tempat tinggal, dll"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>

                    {/* Catatan / Keterangan Berkas */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Catatan / Rekomendasi Berkas
                      </label>
                      <textarea
                        rows={2}
                        value={mutasiForm.catatan}
                        onChange={(e) => setMutasiForm((prev) => ({ ...prev, catatan: e.target.value }))}
                        placeholder="Catatan untuk operator/TU unit tujuan..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>

                    {/* Notice Card */}
                    <div className="rounded-2xl border border-teal-200/80 bg-teal-50/70 p-3.5 dark:border-teal-900/50 dark:bg-teal-950/30">
                      <div className="flex gap-2.5">
                        <Info className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] leading-relaxed text-teal-800 dark:text-teal-300 font-medium">
                          <strong>Alur Dua Arah (Handshake):</strong> Status siswa akan menjadi <em>Proses Mutasi</em>. Data otomatis masuk ke antrean TU Unit Tujuan untuk diverifikasi dan ditentukan kelas tujuannya.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="modal-footer flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
                    <button
                      type="button"
                      disabled={isSubmittingMutasi}
                      onClick={() => setShowAjukanMutasiModal(false)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs font-extrabold transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <X className="size-3.5" />
                      <span>Batal</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSubmittingMutasi || !mutasiForm.unit_tujuan_id}
                      onClick={handleSubmitAjukanMutasi}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-teal-500 via-emerald-600 to-teal-700 text-white px-5 py-2.5 text-xs font-extrabold border border-teal-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-emerald-500/25"
                    >
                      {isSubmittingMutasi ? (
                        <>
                          <Sparkles className="size-3.5 animate-spin" />
                          <span>Mengirim Pengajuan...</span>
                        </>
                      ) : (
                        <>
                          <Send className="size-3.5" />
                          <span>Kirim Pengajuan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL DAFTAR SISWA PINDAHAN MASUK (TU APPROVAL WORKFLOW) */}
        <AnimatePresence>
          {showIncomingModal && (
            <div
              className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="modal-dialog font-sans my-auto w-full max-w-4xl"
              >
                <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
                  <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600 shrink-0" />

                  {/* Header */}
                  <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-gradient-to-br from-teal-500 via-emerald-600 to-teal-700 text-white p-2.5 shadow-md shadow-emerald-500/30 border border-teal-300/30 shrink-0">
                        <ArrowRightLeft className="h-5 w-5 text-white" strokeWidth={2.25} />
                      </div>
                      <div>
                        <h3 className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <span>Daftar Siswa Pindahan Masuk</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60">
                            Menunggu Persetujuan TU
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Verifikasi data siswa mutasi masuk dan tetapkan kelas tujuan di unit Anda
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowIncomingModal(false)}
                      className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {isLoadingIncoming ? (
                      <div className="py-12 text-center text-xs text-slate-500">Memuat data permohonan mutasi...</div>
                    ) : incomingMutations.length === 0 ? (
                      <div className="py-12 text-center">
                        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500 mb-2 opacity-80" />
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white">Tidak Ada Permohonan Pindahan Masuk</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Semua mutasi siswa masuk telah diverifikasi dan disetujui.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden">
                        {incomingMutations.map((mutasi) => {
                          const student = mutasi.student || {}
                          return (
                            <div key={mutasi.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors">
                              <div className="flex items-start gap-3 min-w-0">
                                <PersonAvatar
                                  name={student.nama_lengkap || student.nama || student.full_name || 'Siswa'}
                                  avatarUrl={resolveAvatarUrl(student.foto_url || student.avatar)}
                                  size="md"
                                  className="rounded-xl border border-white shadow-sm shrink-0"
                                />
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                    {student.nama_lengkap || student.nama || student.full_name || '-'}
                                  </h4>
                                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                    <span>NIS: <strong className="text-slate-700 dark:text-slate-200">{student.nis || '-'}</strong></span>
                                    <span>•</span>
                                    <span>Dari: <strong className="text-teal-700 dark:text-teal-400">{mutasi.unit_asal?.nama_unit || mutasi.unit_asal?.name || '-'}</strong></span>
                                    {mutasi.kelas_asal && (
                                      <>
                                        <span>•</span>
                                        <span>Kelas: {mutasi.kelas_asal.nama_kelas || mutasi.kelas_asal.name}</span>
                                      </>
                                    )}
                                  </div>
                                  {mutasi.alasan && (
                                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 italic">
                                      &ldquo;{mutasi.alasan}&rdquo;
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedIncomingForApproval(mutasi)
                                    setApprovalKelasId('')
                                    setApprovalCatatan('')
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                                >
                                  <CheckCircle2 className="size-3.5" />
                                  <span>Verifikasi & Tetapkan Kelas</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedIncomingForApproval(mutasi)
                                    setShowRejectDialog(true)
                                    setRejectReason('')
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300 px-3 py-2 text-xs font-bold transition-all cursor-pointer"
                                >
                                  <XCircle className="size-3.5" />
                                  <span>Tolak</span>
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="modal-footer flex items-center justify-end border-t border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
                    <button
                      type="button"
                      onClick={() => setShowIncomingModal(false)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs font-extrabold transition-all cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* SUB-MODAL TU MENETAPKAN KELAS TUJUAN (APPROVE MUTASI) */}
        <AnimatePresence>
          {selectedIncomingForApproval && !showRejectDialog && (
            <div
              className="overlay modal fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="modal-dialog font-sans my-auto w-full max-w-md"
              >
                <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
                  <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white p-2.5 shadow-md shadow-emerald-500/30">
                        <CheckCircle2 className="h-5 w-5 text-white" strokeWidth={2.25} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">
                          Tetapkan Kelas Tujuan Siswa
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {selectedIncomingForApproval.student?.nama_lengkap || selectedIncomingForApproval.student?.full_name}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Pilih Kelas Penempatan di Unit Ini <span className="text-rose-500">*</span>
                      </label>
                      <HeroUiFilterSelect
                        value={approvalKelasId}
                        onChange={(val) => setApprovalKelasId(val)}
                        options={[
                          { value: '', label: '-- Pilih Kelas Tujuan --' },
                          ...rawClasses
                            .filter((c) => !unitFilter || String(c.unit_pendidikan_id || c.unit_id) === String(unitFilter))
                            .map((c) => ({
                              value: String(c.id),
                              label: c.nama_kelas || c.name || `Kelas ${c.tingkat}`,
                              subtext: c.tingkat ? `Tingkat ${c.tingkat}` : undefined,
                            })),
                        ]}
                        placeholder="Pilih Kelas Tujuan..."
                        icon={GraduationCap}
                        searchable={rawClasses.length > 5}
                        ariaLabel="Pilih Kelas Penempatan"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Catatan Persetujuan TU
                      </label>
                      <input
                        type="text"
                        value={approvalCatatan}
                        onChange={(e) => setApprovalCatatan(e.target.value)}
                        placeholder="Contoh: Berkas lengkap, ditempatkan di rombel A"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
                    <button
                      type="button"
                      disabled={isProcessingApproval}
                      onClick={() => setSelectedIncomingForApproval(null)}
                      className="rounded-2xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 text-xs font-bold cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={isProcessingApproval || !approvalKelasId}
                      onClick={handleApproveIncoming}
                      className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white px-5 py-2 text-xs font-bold shadow-md disabled:opacity-50 cursor-pointer"
                    >
                      {isProcessingApproval ? 'Memproses...' : 'Setujui & Simpan'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* SUB-MODAL TOLAK MUTASI */}
        <AnimatePresence>
          {showRejectDialog && selectedIncomingForApproval && (
            <div
              className="overlay modal fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="modal-dialog font-sans my-auto w-full max-w-md"
              >
                <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-rose-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
                  <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 shrink-0" />
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white p-2.5 shadow-md shadow-rose-500/30">
                        <XCircle className="h-5 w-5 text-white" strokeWidth={2.25} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">
                          Tolak Permohonan Mutasi
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {selectedIncomingForApproval.student?.nama_lengkap || selectedIncomingForApproval.student?.full_name}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Alasan Penolakan <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Contoh: Kuota rombel penuh, persyaratan nilai/berkas belum lengkap..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
                    <button
                      type="button"
                      disabled={isProcessingApproval}
                      onClick={() => setShowRejectDialog(false)}
                      className="rounded-2xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 text-xs font-bold cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={isProcessingApproval || !rejectReason.trim()}
                      onClick={handleRejectIncoming}
                      className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-5 py-2 text-xs font-bold shadow-md disabled:opacity-50 cursor-pointer"
                    >
                      {isProcessingApproval ? 'Memproses...' : 'Konfirmasi Tolak'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL GENERATE NOMOR VIRTUAL ACCOUNT (VA BSI) SISWA */}
        <AnimatePresence>
          {showGenerateVaModal && (
            <div
              className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="modal-dialog font-sans my-auto w-full max-w-lg"
              >
                <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-indigo-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
                  <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 shrink-0" />

                  {/* Header */}
                  <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 text-white p-2.5 shadow-md shadow-indigo-500/30 border border-indigo-300/30 shrink-0">
                        <CreditCard className="h-5 w-5 text-white" strokeWidth={2.25} />
                      </div>
                      <div>
                        <h3 className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <span>Generate VA BSI Siswa</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200/80 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60">
                            <Sparkles className="size-3" />
                            Otomatis
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Pembuatan nomor Virtual Account BSI massal untuk siswa
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowGenerateVaModal(false)}
                      className="size-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Ringkasan Konfigurasi BSI */}
                    <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/60 p-4 text-xs dark:bg-indigo-950/30 dark:border-indigo-800/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-950 dark:text-indigo-200">Mitra Bank:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Bank Syariah Indonesia (BSI)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-950 dark:text-indigo-200">Kode Biller / Institusi:</span>
                        <span className="font-mono font-extrabold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                          {sitePengaturan?.bsi_va_prefix || '9023'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-950 dark:text-indigo-200">Format Pola VA:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {sitePengaturan?.bsi_va_format === '{PREFIX}{UNIT_CODE}{NIS}' ? 'Kode Biller + Unit + NIS' : 'Kode Biller + NIS'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-indigo-200/60 dark:border-indigo-800/40">
                        <span className="font-bold text-indigo-950 dark:text-indigo-200">Cakupan Filter:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {unitFilter && unitFilter !== 'Semua' ? 'Unit Aktif Terfilter' : 'Seluruh Unit Pendidikan'}
                        </span>
                      </div>
                    </div>

                    {/* Opsi Timpa Data Lama */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={forceOverwriteVa}
                          onChange={(e) => setForceOverwriteVa(e.target.checked)}
                          className="mt-0.5 size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">
                            Timpa juga siswa yang sudah memiliki Nomor VA
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 block mt-0.5">
                            Secara default, sistem hanya mengenerate nomor VA untuk siswa yang nomor VA / NIS pembayarannya masih kosong.
                          </span>
                        </div>
                      </label>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      *Setelah digenerate, orang tua siswa akan langsung melihat Nomor Virtual Account ini di Portal Tagihan dan Aplikasi Mobile untuk pembayaran biaya pendidikan.
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
                    <button
                      type="button"
                      disabled={isGeneratingVa}
                      onClick={() => setShowGenerateVaModal(false)}
                      className="rounded-2xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 text-xs font-bold cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={isGeneratingVa}
                      onClick={handleGenerateVaBsi}
                      className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 text-white px-5 py-2 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                    >
                      {isGeneratingVa ? 'Memproses...' : 'Mulai Generate VA BSI'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        </MasterDataPage>
      </motion.div>

      {/* Smart Floating Scroll Navigator (Option A) */}
      <SmartScrollFab targetId="tabel-daftar-siswa" downTooltip="Langsung ke Tabel Siswa" />

    </PageContainer>
  )
}
