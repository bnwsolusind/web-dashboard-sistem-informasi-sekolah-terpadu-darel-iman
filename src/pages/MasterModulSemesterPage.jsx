import { useEffect, useMemo, useState, useCallback } from 'react'
import CustomSelect from '@/components/ui/CustomSelect'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
 BookOpen,
 Book,
 CheckCircle2,
 Layers,
 GraduationCap,
 Plus,
 FileSpreadsheet,
 Upload,
 Pencil,
 Trash2,
 Copy,
 Save,
 AlertTriangle,
 Search,
 Users,
 UserCheck,
 X,
 Filter,
 Check,
 BookOpenCheck,
 Building2,
 Printer,
 RefreshCw,
 Eye,
} from 'lucide-react'
import { modulSemesterService } from '../services/modulSemesterService'
import { codeGeneratorService } from '../services/codeGeneratorService'
import { useToast } from '../components/app'
import { useDebounce } from '../hooks/useDebounce'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import { ActionDropdown, AppBadge, AppDrawer, AppModal, PersonIdentityCell,
  AppDataTable,
  MobileDataCard
} from '../components/app'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppTabs from '../components/app/AppTabs'
import { DatePicker } from '@/components/ui/date-picker'
import CsvImportModal from '../components/master-data/CsvImportModal'
import { useAuthStore } from '../stores/authStore'
import { getUserRoleLevel, ROLE_LEVELS } from '../auth/portalResolver'
import {
 MasterActionButton,
 MasterDataSection,
 MasterDataPage,
 MasterPageHeader,
 MasterStatsGrid,
 MasterStatCard,
 MasterFilterSelect,
 SquircleActionButton,
 PrintOptionModal,
} from '../components/master-data'

const UNIT_BADGES = {
 TK: { bg: 'bg-emerald-700', text: 'text-white', border: 'border-emerald-600' },
 TAUD: { bg: 'bg-emerald-700', text: 'text-white', border: 'border-emerald-600' },
 SD: { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-500' },
 SDIT: { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-500' },
 MIT: { bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-400' },
 SMP: { bg: 'bg-cyan-600', text: 'text-white', border: 'border-cyan-500' },
 SMPIT: { bg: 'bg-cyan-600', text: 'text-white', border: 'border-cyan-500' },
 SMA: { bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-500' },
 SMAIT: { bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-500' },
 MA: { bg: 'bg-purple-700', text: 'text-white', border: 'border-purple-600' },
 PONPES: { bg: 'bg-emerald-900', text: 'text-white', border: 'border-emerald-800' },
 MAHAD: { bg: 'bg-amber-800', text: 'text-white', border: 'border-amber-700' },
}

function getUnitBadgeStyle(code) {
 const upper = code?.toUpperCase() || 'SDIT'
 const foundKey = Object.keys(UNIT_BADGES).find((k) => upper.includes(k))
 return (
 UNIT_BADGES[foundKey] || {
 bg: 'bg-slate-700',
 text: 'text-white',
 border: 'border-slate-600',
 }
 )
}

function initialDetailItem(minggu = 1) {
 return {
 minggu: minggu,
 materi: '',
 atp: '',
 cp: '',
 jp: 2,
 keterangan: '',
 }
}

function initialFormState() {
 return {
 id: null,
 tahun_ajaran_id: '',
 semester_id: '',
 unit_pendidikan_id: '',
 kelas_id: '',
 mata_pelajaran_id: '',
 guru_id: '',
 kode_modul: '',
 nama_modul: '',
 jenjang: '',
 kurikulum: 'Kurikulum Merdeka',
 status: 'Aktif',

 // Pembelajaran
 atp: '',
 cp: '',
 tujuan_pembelajaran: '',
 alokasi_jam: 36,
 jumlah_pertemuan: 18,
 metode_pembelajaran: 'Problem Based Learning, Ceramah & Diskusi',
 model_pembelajaran: 'Problem Based Learning (PBL)',
 media_pembelajaran: 'Modul Cetak, Slide PPT, Video Pembelajaran',
 sumber_belajar: 'Buku Pegangan Utama & LKS Terpadu',

 // Target
 target_nilai_minimum: 75,
 target_kehadiran: 90,
 target_hafalan: '',
 target_proyek: '',

 // Pengaturan
 berlaku_mulai: '',
 berlaku_sampai: '',
 ditampilkan_di_portal_ortu: true,
 ditampilkan_di_aplikasi_siswa: true,
 arsip_otomatis: false,

 // Bobot Penilaian (%)
 bobot_tugas: 20,
 bobot_quiz: 15,
 bobot_projek: 25,
 bobot_uts: 20,
 bobot_uas: 20,

 // Detail Materi
 details: [
 initialDetailItem(1),
 initialDetailItem(2),
 initialDetailItem(3),
 ],
 }
}

function HarmonizedDeleteModal({ isOpen, onClose, onConfirm, item, isSubmitting }) {
  return (
    <AppModal
      isOpen={Boolean(isOpen && item)}
      onClose={() => !isSubmitting && onClose()}
      title="Hapus Modul Semester?"
      badge="Hapus Permanen"
      description="Apakah Anda yakin ingin menghapus modul ini? Data akan dipindahkan ke arsip."
      icon={Trash2}
      variant="danger"
      maxWidth="max-w-md"
      zIndex={70}
      disableBackdropClose={isSubmitting}
      hideCloseButton={isSubmitting}
      bodyClassName="space-y-4"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700 disabled:opacity-50"
          >
            <X className="size-4" strokeWidth={2} />
            <span>Batal</span>
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="h-9.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border-2 border-rose-600 shadow-md shadow-rose-600/20 disabled:opacity-50"
          >
            {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            <span>Hapus Modul</span>
          </button>
        </>
      }
    >
      {item && (
        <>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Apakah Anda yakin ingin menghapus modul ini? Data akan dipindahkan ke arsip.
          </p>
          <div className="rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-rose-50/50 p-3.5 dark:bg-rose-950/20">
            <p className="text-xs font-black text-rose-950 dark:text-rose-100">
              [{item?.kode_modul}] {item?.nama_modul}
            </p>
            <p className="text-xs text-rose-800/80 dark:text-rose-300/80 mt-0.5">
              Kelas: {item?.kelas?.nama_kelas || '-'} • Mapel: {item?.mata_pelajaran?.name || item?.mata_pelajaran?.nama_mapel || '-'}
            </p>
          </div>
        </>
      )}
    </AppModal>
  )
}

function HarmonizedDuplicateModal({ isOpen, onClose, onConfirm, item, isSubmitting }) {
  return (
    <AppModal
      isOpen={Boolean(isOpen && item)}
      onClose={() => !isSubmitting && onClose()}
      title="Duplikasi Modul Semester?"
      badge="Salin Modul"
      description="Sistem akan membuat salinan baru dari modul ini dengan kode modul baru dan seluruh rincian mingguannya."
      icon={Copy}
      maxWidth="max-w-md"
      zIndex={70}
      disableBackdropClose={isSubmitting}
      hideCloseButton={isSubmitting}
      bodyClassName="space-y-4"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700 disabled:opacity-50"
          >
            <X className="size-4" strokeWidth={2} />
            <span>Batal</span>
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
            <span>Duplikasi Modul</span>
          </button>
        </>
      }
    >
      {item && (
        <>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Sistem akan membuat salinan baru dari modul ini dengan kode modul baru dan seluruh rincian mingguannya.
          </p>
          <div className="rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-emerald-50/50 p-3.5 dark:bg-emerald-950/20">
            <p className="text-xs font-black text-emerald-950 dark:text-emerald-100">
              [{item?.kode_modul}] {item?.nama_modul}
            </p>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
              Kelas: {item?.kelas?.nama_kelas || '-'} • Mapel: {item?.mata_pelajaran?.name || item?.mata_pelajaran?.nama_mapel || '-'}
            </p>
          </div>
        </>
      )}
    </AppModal>
  )
}



export default function MasterModulSemesterPage({ embedded = false, hidePageHeader = false, hideBreadcrumb = false }) {
 const queryClient = useQueryClient()

 // State Filters
 const [search, setSearch] = useState('')
 const debouncedSearch = useDebounce(search, 350)
 const [filterTahun, setFilterTahun] = useState('')
 const [filterUnit, setFilterUnit] = useState('')
 const [filterSemester, setFilterSemester] = useState('')
 const [filterKelas, setFilterKelas] = useState('')
 const [filterGuru, setFilterGuru] = useState('')
 const [filterStatus, setFilterStatus] = useState('')
 const [page, setPage] = useState(1)
 const [perPage, setPerPage] = useState(15)

 // Form Modal & Drawer
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [importOpen, setImportOpen] = useState(false)
 const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
 const [isEditMode, setIsEditMode] = useState(false)
 const [activeTab, setActiveTab] = useState('umum') // 'umum' | 'pembelajaran' | 'target' | 'materi' | 'bobot'
 const [formData, setFormData] = useState(initialFormState())
 const [formErrors, setFormErrors] = useState({})

 // Global Toast
 const { pushToast } = useToast()

 // Drawer Detail
 const [detailModul, setDetailModul] = useState(null)
 const [isDrawerOpen, setIsDrawerOpen] = useState(false)

 // Harmonized Modals
 const [isDeleteOpen, setIsDeleteOpen] = useState(false)
 const [deleteItem, setDeleteItem] = useState(null)
 const [isDuplicateOpen, setIsDuplicateOpen] = useState(false)
 const [duplicateItem, setDuplicateItem] = useState(null)

 // Query Data List
 const { data: responseData, isLoading, isError, refetch } = useQuery({
 queryKey: [
 'modul-semester',
 page,
 perPage,
 debouncedSearch,
 filterTahun,
 filterUnit,
 filterSemester,
 filterKelas,
 filterGuru,
 filterStatus,
 ],
 queryFn: () =>
 modulSemesterService.getDaftar({
 page,
 per_page: perPage,
 search: debouncedSearch,
 tahun_ajaran_id: filterTahun,
 unit_pendidikan_id: filterUnit,
 semester_id: filterSemester,
 kelas_id: filterKelas,
 guru_id: filterGuru,
 status: filterStatus,
 }),
 keepPreviousData: true,
 })

 // Query Master Dropdown Options
 const { data: optionsData } = useQuery({
 queryKey: ['modul-semester-options'],
 queryFn: () => modulSemesterService.getOptions(),
 })

 // Query Stats
 const { data: statsData, isLoading: isStatsLoading } = useQuery({
 queryKey: ['modul-semester-stats'],
 queryFn: () => modulSemesterService.getStats(),
 })

 const modulList = responseData?.data || []
 const meta = responseData?.meta || {}
 const stats = statsData || responseData?.statistik || {}
 const options = optionsData || {}

 // User Auth & Role Scoping
 const user = useAuthStore((state) => state.user)
 const userRoles = useMemo(() => {
 if (!user) return []
 const rawRoles = user.roles || (user.role ? [user.role] : []) || user.role_names || []
 const list = Array.isArray(rawRoles) ? rawRoles : [rawRoles]
 return list.map((r) => (typeof r === 'string' ? r : r?.name || r?.role_name || r?.nama || ''))
 }, [user])

 const userLevel = useMemo(() => getUserRoleLevel(user), [user])

 // Broad access check: Superadmin, Admin, Pengurus Yayasan (Level 1-2) see all units.
 // Kepala Sekolah, Guru, TU, etc. are restricted to their own unit.
 const canViewAllUnits = useMemo(() => {
 if (!user || userRoles.length === 0) return false
 return userLevel <= ROLE_LEVELS.YAYASAN // Level 1-2: Admin Sistem & Yayasan
 }, [user, userRoles, userLevel])

 const userUnitId = useMemo(() => {
 const candidateIds = [
 user?.unit_id,
 user?.unit_pendidikan_id,
 user?.education_unit_id,
 user?.unit?.id,
 user?.education_unit?.id,
 user?.unit_pendidikan?.id,
 user?.employee?.unit_id,
 user?.employee?.unit_pendidikan_id,
 user?.employee?.education_unit_id,
 user?.employee?.unit?.id,
 user?.employee?.education_unit?.id,
 user?.school_info?.id,
 ].filter(Boolean)

 return candidateIds.length > 0 ? String(candidateIds[0]) : null
 }, [user])

 const userUnitName = useMemo(() => {
 const candidateNames = [
 typeof user?.education_unit === 'string' ? user.education_unit : null,
 typeof user?.unit === 'string' ? user.unit : null,
 user?.unit_name,
 user?.education_unit_name,
 user?.unit_pendidikan_name,
 user?.unit?.name || user?.unit?.nama,
 user?.education_unit?.name || user?.education_unit?.nama,
 user?.employee?.unit?.name || user?.employee?.education_unit?.name,
 user?.school_info?.nama || user?.school_info?.name,
 ]
 .filter(Boolean)
 .map((s) => String(s).toLowerCase().trim())

 return candidateNames.length > 0 ? candidateNames[0] : ''
 }, [user])

 const availableUnitOptions = useMemo(() => {
 const allUnits = options.unit_pendidikan || []
 if (canViewAllUnits) {
 return allUnits
 }

 // 1. Match by candidate unit ID
 if (userUnitId) {
 const filtered = allUnits.filter((u) => String(u.id) === String(userUnitId))
 if (filtered.length > 0) return filtered
 }

 // 2. Match by candidate unit name/code
 if (userUnitName) {
 const matched = allUnits.filter((u) => {
 const uName = String(u.name || u.nama || '').toLowerCase().trim()
 const uCode = String(u.code || u.kode || '').toLowerCase().trim()
 return (
 uName === userUnitName ||
 uCode === userUnitName ||
 userUnitName.includes(uName) ||
 uName.includes(userUnitName)
 )
 })
 if (matched.length > 0) return matched
 }

 // Fallback: Return first unit or empty array, NEVER all units for restricted roles
 return allUnits.length > 0 ? [allUnits[0]] : []
 }, [options.unit_pendidikan, canViewAllUnits, userUnitId, userUnitName])

 const effectiveUserUnitId = useMemo(() => {
 if (canViewAllUnits) return ''
 if (userUnitId) return String(userUnitId)
 if (availableUnitOptions.length > 0) return String(availableUnitOptions[0].id)
 return ''
 }, [canViewAllUnits, userUnitId, availableUnitOptions])

 useEffect(() => {
 if (!canViewAllUnits && effectiveUserUnitId && filterUnit !== effectiveUserUnitId) {
 setFilterUnit(effectiveUserUnitId)
 }
 }, [canViewAllUnits, effectiveUserUnitId, filterUnit])

 const isScopedUnitRole = useMemo(() => {
 return !canViewAllUnits
 }, [canViewAllUnits])

 // Search & Filter state for Kelas, Mapel & Guru Modal
 const [kelasSearch, setKelasSearch] = useState('')
 const [subjectSearch, setSubjectSearch] = useState('')

 const [isKelasModalOpen, setIsKelasModalOpen] = useState(false)
 const [kelasSearchModal, setKelasSearchModal] = useState('')

 const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false)
 const [subjectSearchModal, setSubjectSearchModal] = useState('')

 const [isGuruModalOpen, setIsGuruModalOpen] = useState(false)
 const [guruSearchModal, setGuruSearchModal] = useState('')
 const [guruUnitModalFilter, setGuruUnitModalFilter] = useState('')
 const [guruStatusModalFilter, setGuruStatusModalFilter] = useState('')

 const activeUnitIdForForm = useMemo(() => {
 return formData.unit_pendidikan_id || (isScopedUnitRole ? userUnitId : '')
 }, [formData.unit_pendidikan_id, isScopedUnitRole, userUnitId])

 // Filtered dropdown lists based on selection & scoping
 const filteredKelasList = useMemo(() => {
 if (!options.kelas) return []
 let list = options.kelas
 const targetUnit = activeUnitIdForForm
 if (targetUnit) {
 list = list.filter((k) => k.unit_pendidikan_id === targetUnit || k.unit_id === targetUnit)
 }
 if (formData.tahun_ajaran_id) {
 list = list.filter((k) => k.tahun_ajaran_id === formData.tahun_ajaran_id)
 }
 if (kelasSearch.trim()) {
 const q = kelasSearch.toLowerCase()
 list = list.filter(
 (k) =>
 (k.nama_kelas && k.nama_kelas.toLowerCase().includes(q)) ||
 (k.kode_kelas && k.kode_kelas.toLowerCase().includes(q))
 )
 }
 return list
 }, [options.kelas, activeUnitIdForForm, formData.tahun_ajaran_id, kelasSearch])

 const filteredKelasModalList = useMemo(() => {
 if (!options.kelas) return []
 let list = options.kelas
 const targetUnit = activeUnitIdForForm
 if (targetUnit) {
 list = list.filter((k) => k.unit_pendidikan_id === targetUnit || k.unit_id === targetUnit)
 }
 if (formData.tahun_ajaran_id) {
 list = list.filter((k) => k.tahun_ajaran_id === formData.tahun_ajaran_id)
 }
 if (kelasSearchModal.trim()) {
 const q = kelasSearchModal.toLowerCase()
 list = list.filter(
 (k) =>
 (k.nama_kelas && k.nama_kelas.toLowerCase().includes(q)) ||
 (k.kode_kelas && k.kode_kelas.toLowerCase().includes(q)) ||
 (k.jenjang && k.jenjang.toLowerCase().includes(q))
 )
 }
 return list
 }, [options.kelas, activeUnitIdForForm, formData.tahun_ajaran_id, kelasSearchModal])

 const filteredSubjectList = useMemo(() => {
 if (!options.mata_pelajaran) return []
 let list = options.mata_pelajaran
 const targetUnit = activeUnitIdForForm
 if (targetUnit) {
 list = list.filter((m) => !m.unit_pendidikan_id || m.unit_pendidikan_id === targetUnit)
 }
 if (subjectSearch.trim()) {
 const q = subjectSearch.toLowerCase()
 list = list.filter(
 (m) =>
 (m.name && m.name.toLowerCase().includes(q)) ||
 (m.code && m.code.toLowerCase().includes(q)) ||
 (m.kode_mapel && m.kode_mapel.toLowerCase().includes(q))
 )
 }
 return list
 }, [options.mata_pelajaran, activeUnitIdForForm, subjectSearch])

 const filteredSubjectModalList = useMemo(() => {
 if (!options.mata_pelajaran) return []
 let list = options.mata_pelajaran
 const targetUnit = activeUnitIdForForm
 if (targetUnit) {
 list = list.filter((m) => !m.unit_pendidikan_id || m.unit_pendidikan_id === targetUnit)
 }
 if (subjectSearchModal.trim()) {
 const q = subjectSearchModal.toLowerCase()
 list = list.filter(
 (m) =>
 (m.name && m.name.toLowerCase().includes(q)) ||
 (m.code && m.code.toLowerCase().includes(q)) ||
 (m.kode_mapel && m.kode_mapel.toLowerCase().includes(q)) ||
 (m.kelompok_mapel && m.kelompok_mapel.toLowerCase().includes(q))
 )
 }
 return list
 }, [options.mata_pelajaran, activeUnitIdForForm, subjectSearchModal])

 const filteredGuruList = useMemo(() => {
 if (!options.guru) return []
 let list = options.guru
 const targetUnit = formData.unit_pendidikan_id || (isScopedUnitRole ? userUnitId : guruUnitModalFilter)
 if (targetUnit) {
 list = list.filter(
 (g) =>
 g.unit_id === targetUnit ||
 g.unit_pendidikan_id === targetUnit ||
 g.unit?.id === targetUnit
 )
 }
 if (guruStatusModalFilter) {
 list = list.filter((g) => g.status_pegawai === guruStatusModalFilter || g.status === guruStatusModalFilter)
 }
 if (guruSearchModal.trim()) {
 const q = guruSearchModal.toLowerCase()
 list = list.filter(
 (g) =>
 (g.nama_lengkap && g.nama_lengkap.toLowerCase().includes(q)) ||
 (g.niy && g.niy.toLowerCase().includes(q)) ||
 (g.nik && g.nik.toLowerCase().includes(q)) ||
 (g.email && g.email.toLowerCase().includes(q)) ||
 (g.position?.name && g.position.name.toLowerCase().includes(q)) ||
 (g.unit?.name && g.unit.name.toLowerCase().includes(q))
 )
 }
 return list
 }, [options.guru, formData.unit_pendidikan_id, isScopedUnitRole, userUnitId, guruUnitModalFilter, guruStatusModalFilter, guruSearchModal])

 const selectedGuruObj = useMemo(() => {
 if (!formData.guru_id || !options.guru) return null
 return options.guru.find((g) => g.id === formData.guru_id) || null
 }, [formData.guru_id, options.guru])

 const filteredSemesterList = useMemo(() => {
 if (!options.semesters) return []
 if (formData.tahun_ajaran_id) {
 return options.semesters.filter((s) => s.academic_year_id === formData.tahun_ajaran_id)
 }
 return options.semesters
 }, [options.semesters, formData.tahun_ajaran_id])

 // Total Bobot Penilaian Live Calculation
 const totalBobotPenilaian = useMemo(() => {
 const t = parseFloat(formData.bobot_tugas || 0)
 const q = parseFloat(formData.bobot_quiz || 0)
 const p = parseFloat(formData.bobot_projek || 0)
 const uts = parseFloat(formData.bobot_uts || 0)
 const uas = parseFloat(formData.bobot_uas || 0)
 return Math.round((t + q + p + uts + uas) * 100) / 100
 }, [formData.bobot_tugas, formData.bobot_quiz, formData.bobot_projek, formData.bobot_uts, formData.bobot_uas])

 // Mutations
 const simpanMutation = useMutation({
 mutationFn: (payload) =>
 isEditMode
 ? modulSemesterService.ubah({ id: formData.id, payload })
 : modulSemesterService.tambah(payload),
 onSuccess: (res) => {
 queryClient.invalidateQueries(['modul-semester'])
 queryClient.invalidateQueries(['modul-semester-stats'])
 setIsModalOpen(false)
 pushToast(res.message || 'Master Modul Semester berhasil disimpan.', 'success')
 },
 onError: (err) => {
 const respData = err.response?.data
 if (respData?.errors) {
 setFormErrors(respData.errors)
 } else {
 pushToast(respData?.message || 'Terjadi kesalahan saat menyimpan data modul semester.', 'error')
 }
 },
 })

 const hapusMutation = useMutation({
 mutationFn: (id) => modulSemesterService.hapus(id),
 onSuccess: () => {
 queryClient.invalidateQueries(['modul-semester'])
 queryClient.invalidateQueries(['modul-semester-stats'])
 setIsDeleteOpen(false)
 setDeleteItem(null)
 pushToast('Data Modul Semester berhasil dihapus.', 'success')
 },
 onError: (err) => {
 pushToast(err.response?.data?.message || 'Gagal menghapus data modul semester.', 'error')
 },
 })

 const duplikasiMutation = useMutation({
 mutationFn: (id) => modulSemesterService.duplikasi(id),
 onSuccess: (res) => {
 queryClient.invalidateQueries(['modul-semester'])
 queryClient.invalidateQueries(['modul-semester-stats'])
 setIsDuplicateOpen(false)
 setDuplicateItem(null)
 pushToast(res.message || 'Modul Semester berhasil diduplikasi.', 'success')
 },
 onError: (err) => {
 pushToast(err.response?.data?.message || 'Gagal menduplikasi modul semester.', 'error')
 },
 })

 // Handlers
 const handleOpenTambahModal = () => {
 setIsEditMode(false)
 const initial = initialFormState()
 if (isScopedUnitRole && userUnitId) {
 initial.unit_pendidikan_id = userUnitId
 }
 setFormData(initial)
 setFormErrors({})
 setKelasSearch('')
 setKelasSearchModal('')
 setSubjectSearch('')
 setSubjectSearchModal('')
 setGuruSearchModal('')
 setActiveTab('umum')
 setIsModalOpen(true)
 }

 const handleOpenEditModal = (item) => {
 setIsEditMode(true)
 setFormErrors({})
 setKelasSearch('')
 setKelasSearchModal('')
 setSubjectSearch('')
 setSubjectSearchModal('')
 setGuruSearchModal('')
 setActiveTab('umum')
 setFormData({
 id: item.id,
 tahun_ajaran_id: item.tahun_ajaran_id || '',
 semester_id: item.semester_id || '',
 unit_pendidikan_id: item.unit_pendidikan_id || '',
 kelas_id: item.kelas_id || '',
 mata_pelajaran_id: item.mata_pelajaran_id || '',
 guru_id: item.guru_id || '',
 kode_modul: item.kode_modul || '',
 nama_modul: item.nama_modul || '',
 jenjang: item.jenjang || 'SDIT',
 kurikulum: item.kurikulum || 'Kurikulum Merdeka',
 status: item.status || 'Aktif',
 atp: item.atp || '',
 cp: item.cp || '',
 tujuan_pembelajaran: item.tujuan_pembelajaran || '',
 alokasi_jam: item.alokasi_jam || 36,
 jumlah_pertemuan: item.jumlah_pertemuan || 18,
 metode_pembelajaran: item.metode_pembelajaran || '',
 model_pembelajaran: item.model_pembelajaran || '',
 media_pembelajaran: item.media_pembelajaran || '',
 sumber_belajar: item.sumber_belajar || '',
 target_nilai_minimum: item.target_nilai_minimum || 75,
 target_kehadiran: item.target_kehadiran || 90,
 target_hafalan: item.target_hafalan || '',
 target_proyek: item.target_proyek || '',
 berlaku_mulai: item.berlaku_mulai || '',
 berlaku_sampai: item.berlaku_sampai || '',
 ditampilkan_di_portal_ortu: item.ditampilkan_di_portal_ortu ?? true,
 ditampilkan_di_aplikasi_siswa: item.ditampilkan_di_aplikasi_siswa ?? true,
 arsip_otomatis: item.arsip_otomatis ?? false,
 bobot_tugas: item.bobot_tugas ?? 20,
 bobot_quiz: item.bobot_quiz ?? 15,
 bobot_projek: item.bobot_projek ?? 25,
 bobot_uts: item.bobot_uts ?? 20,
 bobot_uas: item.bobot_uas ?? 20,
 details: item.details && item.details.length > 0 ? item.details : [initialDetailItem(1)],
 })
 setIsModalOpen(true)
 }

 const handleOpenDetailDrawer = (item) => {
 setDetailModul(item)
 setIsDrawerOpen(true)
 }

 const handleTambahDetailMateri = () => {
 const nextMinggu = (formData.details?.length || 0) + 1
 setFormData((prev) => ({
 ...prev,
 details: [...(prev.details || []), initialDetailItem(nextMinggu)],
 }))
 }

 const handleUbahDetailMateri = (index, field, value) => {
 setFormData((prev) => {
 const newDetails = [...(prev.details || [])]
 newDetails[index] = { ...newDetails[index], [field]: value }
 return { ...prev, details: newDetails }
 })
 }

 const handleHapusDetailMateri = (index) => {
 setFormData((prev) => ({
 ...prev,
 details: prev.details.filter((_, i) => i !== index),
 }))
 }

 const handleGenerateKode = async () => {
 try {
 const res = await codeGeneratorService.preview('modul_code', {
 unit_id: formData.unit_pendidikan_id || null,
 academic_year_id: formData.tahun_ajaran_id || null,
 })
 if (res?.preview_code) {
 setFormData((prev) => ({ ...prev, kode_modul: res.preview_code }))
 }
 } catch (err) {
 console.warn('Gagal memuat preview kode modul:', err)
 }
 }

 const handleSubmitForm = (e) => {
 e.preventDefault()
 setFormErrors({})

 const errors = {}
 if (!formData.tahun_ajaran_id) errors.tahun_ajaran_id = ['Tahun Ajaran wajib dipilih.']
 if (!formData.semester_id) errors.semester_id = ['Semester wajib dipilih.']
 if (!formData.kelas_id) errors.kelas_id = ['Kelas wajib dipilih.']
 if (!formData.mata_pelajaran_id) errors.mata_pelajaran_id = ['Mata Pelajaran wajib dipilih.']
 if (!formData.guru_id) errors.guru_id = ['Guru Pengampu wajib dipilih.']
 if (!formData.nama_modul) errors.nama_modul = ['Nama Modul wajib diisi.']

 if (totalBobotPenilaian !== 100) {
 errors.bobot = [`Total bobot penilaian harus 100%. Saat ini: ${totalBobotPenilaian}%.`]
 }

 if (Object.keys(errors).length > 0) {
 setFormErrors(errors)
 pushToast(errors.bobot ? errors.bobot[0] : 'Harap lengkapi semua kolom wajib di formulir.', 'warning')
 return
 }

 simpanMutation.mutate(formData)
 }

 const handleConfirmHapus = (item) => {
 setDeleteItem(item)
 setIsDeleteOpen(true)
 }

 const handleConfirmDuplikasi = (item) => {
 setDuplicateItem(item)
 setIsDuplicateOpen(true)
 }

 const handleExportCSV = () => {
 if (!modulList || modulList.length === 0) {
 pushToast('Tidak ada data untuk diekspor.', 'warning')
 return
 }

 const headers = [
 'NO',
 'KODE MODUL',
 'NAMA MODUL SEMESTER',
 'TAHUN AJARAN',
 'SEMESTER',
 'UNIT',
 'KELAS',
 'MATA PELAJARAN',
 'GURU PENGAMPU',
 'JUMLAH PERTEMUAN',
 'ALOKASI JAM',
 'STATUS',
 ]

 let csvStr = headers.join(',') + '\n'

 modulList.forEach((m, idx) => {
 const row = [
 idx + 1,
 `"${m.kode_modul || ''}"`,
 `"${m.nama_modul || ''}"`,
 `"${m.tahun_ajaran?.name || ''}"`,
 `"${m.semester?.name || ''}"`,
 `"${m.unit_pendidikan?.name || m.jenjang || ''}"`,
 `"${m.kelas?.nama_kelas || ''}"`,
 `"${m.mata_pelajaran?.name || ''}"`,
 `"${m.guru?.nama_lengkap || ''}"`,
 m.jumlah_pertemuan || 0,
 m.alokasi_jam || 0,
 `"${m.status || 'Aktif'}"`,
 ]
 csvStr += row.join(',') + '\n'
 })

 const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' })
 const url = URL.createObjectURL(blob)
 const link = document.createElement('a')
 link.href = url
 link.setAttribute('download', `Master_Modul_Semester_${new Date().toISOString().slice(0, 10)}.csv`)
 document.body.appendChild(link)
 link.click()
 document.body.removeChild(link)
 }

 const handleImportRows = async (rows) => {
 let success = 0
 const failures = []
 for (let index = 0; index < rows.length; index += 1) {
 const row = rows[index]
 try {
 await modulSemesterService.tambah({
 ...initialFormState(), ...row,
 alokasi_jam: Number(row.alokasi_jam || 36), jumlah_pertemuan: Number(row.jumlah_pertemuan || 18),
 details: [],
 })
 success += 1
 } catch (error) { failures.push(`baris ${index + 2}: ${error.response?.data?.message || 'gagal'}`) }
 }
 queryClient.invalidateQueries({ queryKey: ['modul-semester'] })
 pushToast(`${success} modul berhasil, ${failures.length} gagal.${failures.length ? ` ${failures.slice(0, 3).join('; ')}` : ''}`, failures.length ? 'warning' : 'success')
 }

 const resetFilters = () => {
 setSearch('')
 setFilterTahun('')
 setFilterUnit(canViewAllUnits ? '' : effectiveUserUnitId)
 setFilterSemester('')
 setFilterKelas('')
 setFilterGuru('')
 setFilterStatus('')
 setPerPage(15)
 setPage(1)
 }

 const pageActions = (
 <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
 <SquircleActionButton variant="import" label="Import Data" onClick={() => setImportOpen(true)} />
 <SquircleActionButton variant="export" label="Export Data" onClick={handleExportCSV} />
 <SquircleActionButton variant="print" label="Cetak Data" onClick={() => setIsPrintModalOpen(true)} />
 <SquircleActionButton variant="primary" label="Tambah Modul Semester" onClick={handleOpenTambahModal} />
 </div>
 )

 const shouldHideBreadcrumb = embedded || hideBreadcrumb
 const shouldHideHeader = embedded || hidePageHeader

  const modulColumns = useMemo(
    () => [
      {
        key: 'no',
        label: 'NO',
        className: 'py-4 px-4 text-center w-12 hidden sm:table-cell font-bold text-slate-500 dark:text-slate-400',
        render: (_, idx) => ((meta.current_page || 1) - 1) * (meta.per_page || 15) + idx + 1
      },
      {
        key: 'logo',
        label: 'LOGO',
        className: 'py-4 px-4 w-14 text-center hidden md:table-cell',
        render: (item) => {
          const badgeStyle = getUnitBadgeStyle(item.unit_pendidikan?.code || item.jenjang)
          return (
            <div className={`w-9 h-9 rounded-xl ${badgeStyle.bg} flex items-center justify-center font-bold text-xs ${badgeStyle.text} border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs mx-auto`}>
              {item.unit_pendidikan?.code || item.jenjang || 'MOD'}
            </div>
          )
        }
      },
      {
        key: 'nama_modul',
        label: 'NAMA MODUL SEMESTER',
        className: 'py-4 px-4 min-w-[220px]',
        render: (item) => (
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-xs font-bold">
              <span>{item.nama_modul}</span>
              <Eye className="w-3.5 h-3.5 text-emerald-600 opacity-60 group-hover:opacity-100 transition-opacity" />
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                {item.kode_modul || '-'}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                {item.kurikulum || 'Kurikulum Merdeka'}
              </span>
            </div>
          </div>
        )
      },
      {
        key: 'unit_kelas',
        label: 'UNIT / KELAS',
        className: 'py-4 px-4 hidden lg:table-cell min-w-[160px]',
        render: (item) => (
          <div>
            <div className="font-bold text-slate-900 dark:text-white">
              {item.unit_pendidikan?.name || item.jenjang || '-'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Kelas: {item.kelas?.nama_kelas || item.kelas?.name || '-'}
            </div>
          </div>
        )
      },
      {
        key: 'mapel_guru',
        label: 'MAPEL & GURU',
        className: 'py-4 px-4 hidden md:table-cell min-w-[160px]',
        render: (item) => (
          <div>
            <div className="font-bold text-slate-900 dark:text-white">
              {item.mata_pelajaran?.nama_mapel || item.mata_pelajaran?.name || '-'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Guru: {item.guru?.nama_lengkap || item.guru?.name || '-'}
            </div>
          </div>
        )
      },
      {
        key: 'pertemuan_jp',
        label: 'PERTEMUAN / JP',
        className: 'py-4 px-4 text-center hidden xl:table-cell w-36',
        render: (item) => (
          <div>
            <span className="font-bold text-slate-900 dark:text-white">
              {item.jumlah_pertemuan || 0} Pertemuan
            </span>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {item.alokasi_jam || 0} JP
            </div>
          </div>
        )
      },
      {
        key: 'status',
        label: 'STATUS',
        className: 'py-4 px-4 text-center hidden sm:table-cell w-28',
        render: (item) => (
          <AppBadge variant={item.status === 'Aktif' ? 'success' : item.status === 'Arsip' ? 'warning' : 'neutral'} dot>
            {item.status || 'Nonaktif'}
          </AppBadge>
        )
      }
    ],
    [meta.current_page, meta.per_page]
  )

  const renderMobileCard = useCallback(
    (item) => (
      <MobileDataCard
        key={item.id}
        title={item.nama_modul}
        subtitle={item.mata_pelajaran?.nama_mapel || item.mata_pelajaran?.name || '-'}
        statusBadge={
          <AppBadge variant={item.status === 'Aktif' ? 'success' : item.status === 'Arsip' ? 'warning' : 'neutral'} dot>
            {item.status || 'Nonaktif'}
          </AppBadge>
        }
        fields={[
          { label: 'Kode', value: item.kode_modul || '-' },
          { label: 'Unit / Kelas', value: `${item.unit_pendidikan?.name || '-'} (${item.kelas?.nama_kelas || '-'})` },
          { label: 'Guru', value: item.guru?.nama_lengkap || '-' },
          { label: 'Pertemuan', value: `${item.jumlah_pertemuan || 0} Pertemuan (${item.alokasi_jam || 0} JP)` }
        ]}
        onView={() => handleOpenDetailDrawer(item)}
        onEdit={() => handleOpenEditModal(item)}
        onDelete={() => handleConfirmHapus(item)}
        extraItems={[{
          label: 'Duplikasi Modul',
          icon: <Copy className="w-4 h-4 text-slate-500" />,
          onClick: () => handleConfirmDuplikasi(item),
        }]}
      />
    ),
    [handleOpenDetailDrawer, handleOpenEditModal, handleConfirmHapus, handleConfirmDuplikasi]
  )

 return (
 <PageContainer maxW="7xl">
 <PrintOptionModal
 isOpen={isPrintModalOpen}
 onClose={() => setIsPrintModalOpen(false)}
 title="Modul Semester"
 onPrint={() => {
 const rowsToPrint = Array.isArray(modulList) ? modulList : []
 printCleanTable({
 title: 'Laporan Data Modul Semester',
 subtitle: 'Daftar Pembelajaran Modul Semester Sekolah Islam Terpadu',
 headers: ['NO', 'KODE MODUL', 'NAMA MODUL', 'UNIT PENDIDIKAN', 'TAHUN AJARAN', 'KELAS', 'MATA PELAJARAN', 'GURU', 'STATUS'],
 rows: rowsToPrint.map((row, i) => [
 i + 1,
 row.kode_modul || row.code || '-',
 row.nama_modul || row.name || row.nama || '-',
 row.unit_pendidikan?.name || row.unit_pendidikan?.nama || row.jenjang || '-',
 row.tahun_ajaran?.name || row.tahun_ajaran?.nama || row.tahun_ajaran_name || '-',
 row.kelas?.nama_kelas || row.kelas?.name || row.kelas_name || '-',
 row.mata_pelajaran?.name || row.mata_pelajaran?.nama_mapel || row.mapel_name || '-',
 row.guru?.nama_lengkap || row.guru?.name || row.guru_name || '-',
 row.status || 'Aktif',
 ]),
 })
 }}
 onDownload={() => {
 const rowsToPrint = Array.isArray(modulList) ? modulList : []
 downloadPdfTable({
 title: 'Laporan Data Modul Semester',
 subtitle: 'Daftar Pembelajaran Modul Semester Sekolah Islam Terpadu',
 headers: ['NO', 'KODE MODUL', 'NAMA MODUL', 'UNIT PENDIDIKAN', 'TAHUN AJARAN', 'KELAS', 'MATA PELAJARAN', 'GURU', 'STATUS'],
 rows: rowsToPrint.map((row, i) => [
 i + 1,
 row.kode_modul || row.code || '-',
 row.nama_modul || row.name || row.nama || '-',
 row.unit_pendidikan?.name || row.unit_pendidikan?.nama || row.jenjang || '-',
 row.tahun_ajaran?.name || row.tahun_ajaran?.nama || row.tahun_ajaran_name || '-',
 row.kelas?.nama_kelas || row.kelas?.name || row.kelas_name || '-',
 row.mata_pelajaran?.name || row.mata_pelajaran?.nama_mapel || row.mapel_name || '-',
 row.guru?.nama_lengkap || row.guru?.name || row.guru_name || '-',
 row.status || 'Aktif',
 ]),
 filename: 'laporan_modul_semester.pdf',
 })
 }}
 />
 {!shouldHideBreadcrumb && <AppBreadcrumb items={[{ label: 'Master Data', href: '/dashboard' }, { label: 'Modul Semester' }]} />}
 <MasterDataPage hideBreadcrumb>
 {!shouldHideHeader && (
        <HeroUiHeader
          title="Data Modul Semester"
          subtitle="Kelola seluruh modul semester di lingkungan Yayasan sebagai acuan pembelajaran terpadu."
          icon={BookOpen}
          roleTag="Manajemen Modul Semester"
          badge="Modul Pembelajaran"
          className="mb-6"
        />
      )}

 <CsvImportModal open={importOpen} onClose={() => setImportOpen(false)} title="Modul Semester" onImport={handleImportRows} columns={[
 { key: 'tahun_ajaran_id', required: true }, { key: 'semester_id', required: true }, { key: 'unit_pendidikan_id' }, { key: 'kelas_id', required: true }, { key: 'mata_pelajaran_id', required: true }, { key: 'guru_id', required: true },
 { key: 'kode_modul', example: 'MOD-MTK-01' }, { key: 'nama_modul', required: true, example: 'Matematika Semester 1' }, { key: 'kurikulum', example: 'Kurikulum Merdeka' }, { key: 'status', example: 'Aktif' }, { key: 'alokasi_jam', example: '36' }, { key: 'jumlah_pertemuan', example: '18' },
 ]} />

 <MasterStatsGrid className="education-unit-kpis">
 <MasterStatCard icon={Book} label="TOTAL MODUL SEMESTER" value={stats.total_modul ?? 0} description="Terdaftar di sistem" variant="success" loading={isStatsLoading} />
 <MasterStatCard icon={CheckCircle2} label="MODUL AKTIF" value={stats.total_aktif ?? 0} description="Beroperasi secara penuh" variant="info" loading={isStatsLoading} />
 <MasterStatCard icon={Layers} label="TOTAL ALOKASI JAM" value={`${stats.total_jam ?? 0} JP`} description="Dari semua unit" variant="warning" loading={isStatsLoading} />
 <MasterStatCard icon={GraduationCap} label="TOTAL RINCIAN MATERI" value={stats.total_materi ?? 0} description="Materi mingguan terpadu" variant="neutral" loading={isStatsLoading} />
 </MasterStatsGrid>

        <AppDataTable
          id="tabel-modul-semester"
          title="Daftar Modul Semester"
          icon={Book}
          iconClassName="bg-emerald-50 border border-emerald-200/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm"
          countLabel={`${Number(meta.total ?? 0).toLocaleString('id-ID')} modul`}
          description="Modul sesuai periode, unit, kelas, guru, dan status yang dipilih."
          actions={pageActions}
          search={search}
          onSearchChange={(value) => { setSearch(value); setPage(1) }}
          searchPlaceholder="Cari kode modul, nama modul, mapel, atau guru..."
          filters={
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-2.5 w-full">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0 hidden sm:inline-block">
                Filter:
              </span>

              <MasterFilterSelect
                aria-label="Filter tahun ajaran"
                value={filterTahun}
                onChange={(event) => {
                  setFilterTahun(event.target.value)
                  setFilterSemester('')
                  setFilterKelas('')
                  setPage(1)
                }}
              >
                <option value="">Semua Tahun Ajaran</option>
                {(options.tahun_ajaran || []).map((tahun) => <option key={tahun.id} value={tahun.id}>{tahun.name}</option>)}
              </MasterFilterSelect>

              <MasterFilterSelect
                aria-label="Filter unit pendidikan"
                value={filterUnit}
                onChange={(event) => {
                  setFilterUnit(event.target.value)
                  setFilterKelas('')
                  setFilterGuru('')
                  setPage(1)
                }}
                disabled={!canViewAllUnits && availableUnitOptions.length <= 1}
              >
                {canViewAllUnits && <option value="">Semua Unit</option>}
                {(availableUnitOptions || []).map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
              </MasterFilterSelect>

              <MasterFilterSelect aria-label="Filter semester" value={filterSemester} onChange={(event) => { setFilterSemester(event.target.value); setPage(1) }}>
                <option value="">Semua Semester</option>
                {(options.semesters || [])
                  .filter((semester) => !filterTahun || semester.academic_year_id === filterTahun)
                  .map((semester) => <option key={semester.id} value={semester.id}>{semester.name}</option>)}
              </MasterFilterSelect>

              <MasterFilterSelect aria-label="Filter kelas" value={filterKelas} onChange={(event) => { setFilterKelas(event.target.value); setPage(1) }}>
                <option value="">Semua Kelas</option>
                {(options.kelas || [])
                  .filter((kelas) => !filterTahun || kelas.tahun_ajaran_id === filterTahun)
                  .filter((kelas) => !filterUnit || kelas.unit_pendidikan_id === filterUnit)
                  .map((kelas) => <option key={kelas.id} value={kelas.id}>{kelas.nama_kelas}</option>)}
              </MasterFilterSelect>

              <MasterFilterSelect aria-label="Filter guru" value={filterGuru} onChange={(event) => { setFilterGuru(event.target.value); setPage(1) }}>
                <option value="">Semua Guru</option>
                {(options.guru || [])
                  .filter((guru) => !filterUnit || guru.unit_id === filterUnit)
                  .map((guru) => <option key={guru.id} value={guru.id}>{guru.nama_lengkap}</option>)}
              </MasterFilterSelect>

              <MasterFilterSelect aria-label="Filter status" value={filterStatus} onChange={(event) => { setFilterStatus(event.target.value); setPage(1) }}>
                <option value="">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
                <option value="Arsip">Arsip</option>
              </MasterFilterSelect>

              <MasterFilterSelect
                aria-label="Tampilkan per halaman"
                value={perPage}
                onChange={(event) => {
                  setPerPage(Number(event.target.value))
                  setPage(1)
                }}
              >
                <option value={5}>5 per hal</option>
                <option value={10}>10 per hal</option>
                <option value={15}>15 per hal</option>
                <option value={25}>25 per hal</option>
                <option value={50}>50 per hal</option>
                <option value={100}>100 per hal</option>
              </MasterFilterSelect>

              <button
                type="button"
                onClick={resetFilters}
                disabled={!search && !filterTahun && filterUnit === (canViewAllUnits ? '' : effectiveUserUnitId) && !filterSemester && !filterKelas && !filterGuru && !filterStatus && perPage === 15}
                className="inline-flex items-center justify-center gap-1.5 px-4 h-9 w-full sm:w-auto sm:ml-auto rounded-[14px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition cursor-pointer disabled:opacity-40"
                title="Reset Filter"
              >
                <RefreshCw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Reset</span>
              </button>
            </div>
          }
          columns={modulColumns}
          data={modulList}
          renderMobileCard={renderMobileCard}
          page={page}
          totalPages={meta.last_page || 1}
          totalItems={meta.total || modulList.length}
          itemsPerPage={perPage}
          onPageChange={setPage}
          isLoading={isLoading}
          onView={(item) => handleOpenDetailDrawer(item)}
          onEdit={(item) => handleOpenEditModal(item)}
          onDelete={(item) => handleConfirmHapus(item)}
          extraItems={(item) => [{
            label: 'Duplikasi Modul',
            icon: <Copy className="w-4 h-4 text-slate-500" />,
            onClick: () => handleConfirmDuplikasi(item),
          }]}
          actionColumnLabel="AKSI"
        />

 {/* CRUD MODAL FORM */}
 <AppModal
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 icon={BookOpen}
 title={isEditMode ? 'Edit Master Modul Semester' : 'Tambah Master Modul Semester'}
 description="Isi formulir lengkap sesuai standar kurikulum dan bobot penilaian semester."
 maxWidth="max-w-4xl"
 footer={
 <div className="flex items-center justify-between w-full">
 <div>
 {activeTab !== 'umum' ? (
 <button
 type="button"
 onClick={() => {
 const tabs = ['umum', 'pembelajaran', 'target', 'materi', 'bobot']
 const currIdx = tabs.indexOf(activeTab)
 if (currIdx > 0) setActiveTab(tabs[currIdx - 1])
 }}
 className="group inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/90 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-slate-900 dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
 >
 &larr; Kembali
 </button>
 ) : null}
 </div>

 <div className="flex items-center gap-2.5">
 <button
 type="button"
 onClick={() => setIsModalOpen(false)}
 className="group inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 text-xs font-black text-white shadow-md shadow-sm hover:from-rose-600 hover:to-red-800 active:scale-95 transition-all cursor-pointer"
 >
 <span className="flex size-5 items-center justify-center rounded-lg bg-white/20">
 <X className="size-3.5" strokeWidth={2.5} />
 </span>
 <span>Batal</span>
 </button>

 {activeTab !== 'bobot' ? (
 <button
 type="button"
 onClick={() => {
 const tabs = ['umum', 'pembelajaran', 'target', 'materi', 'bobot']
 const currIdx = tabs.indexOf(activeTab)
 if (currIdx < tabs.length - 1) setActiveTab(tabs[currIdx + 1])
 }}
 className="group inline-flex items-center gap-2 rounded-xl bg-white dark:bg-[#1B2433] px-4.5 py-2.5 text-xs font-black shadow-md shadow-sm hover:from-emerald-600 hover:to-teal-800 active:scale-95 transition-all cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60"
 >
 <span>Lanjut</span>
 &rarr;
 </button>
 ) : (
 <button
 type="submit"
 form="master-modul-semester-form"
 disabled={simpanMutation.isPending || totalBobotPenilaian !== 100}
 className="group inline-flex items-center gap-2 rounded-xl bg-white dark:bg-[#1B2433] px-5 py-2.5 text-xs font-black shadow-md shadow-sm hover:from-emerald-600 hover:to-teal-800 active:scale-95 disabled:opacity-50 transition-all cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60"
 >
 <span className="flex size-5 items-center justify-center rounded-lg bg-white/20">
 {simpanMutation.isPending ? (
 <RefreshCw className="size-3.5 animate-spin" />
 ) : (
 <CheckCircle2 className="size-3.5" strokeWidth={2.5} />
 )}
 </span>
 <span>{simpanMutation.isPending ? 'Memproses...' : 'Simpan Modul'}</span>
 </button>
 )}
 </div>
 </div>
 }
 >
 <div className="-m-6">
 {/* Navigation Tabs */}
 <div className="border-b border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/30 px-6">
 <AppTabs
 variant="pill"
 tabs={[
 { id: 'umum', label: '1. Informasi Umum' },
 { id: 'pembelajaran', label: '2. Pembelajaran' },
 { id: 'target', label: '3. Target & Pengaturan' },
 { id: 'materi', label: '4. Detail Materi' },
 { id: 'bobot', label: '5. Bobot Penilaian' },
 ]}
 activeTab={activeTab}
 onChange={setActiveTab}
 ariaLabel="Langkah Formulir Modul Semester"
 />
 </div>

 {/* Modal Body */}
 <form id="master-modul-semester-form" onSubmit={handleSubmitForm} className="p-6 overflow-y-auto flex-1 text-xs">
 {/* TAB 1: INFORMASI UMUM */}
 {activeTab === 'umum' && (
 <div className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
 Tahun Ajaran <span className="text-rose-500">*</span>
 </label>
 <CustomSelect
 value={formData.tahun_ajaran_id}
 onChange={(e) => setFormData({ ...formData, tahun_ajaran_id: e.target.value })}
 className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
 >
 <option value="">-- Pilih Tahun Ajaran --</option>
 {options.tahun_ajaran?.map((t) => (
 <option key={t.id} value={t.id}>
 {t.name}
 </option>
 ))}
 </CustomSelect>
 {formErrors.tahun_ajaran_id && (
 <p className="text-xs text-rose-500 mt-1">{formErrors.tahun_ajaran_id[0]}</p>
 )}
 </div>

 <div>
 <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
 Unit Pendidikan <span className="text-rose-500">*</span>
 </label>
 <CustomSelect
 value={formData.unit_pendidikan_id}
 onChange={(e) => setFormData({ ...formData, unit_pendidikan_id: e.target.value })}
 className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
 >
 <option value="">-- Pilih Unit Pendidikan --</option>
 {availableUnitOptions?.map((u) => (
 <option key={u.id} value={u.id}>
 {u.name} ({u.code})
 </option>
 ))}
 </CustomSelect>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div>
 <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
 Semester <span className="text-rose-500">*</span>
 </label>
 <CustomSelect
 value={formData.semester_id}
 onChange={(e) => setFormData({ ...formData, semester_id: e.target.value })}
 className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
 >
 <option value="">-- Pilih Semester --</option>
 {filteredSemesterList.map((s) => (
 <option key={s.id} value={s.id}>
 {s.name}
 </option>
 ))}
 </CustomSelect>
 {formErrors.semester_id && (
 <p className="text-xs text-rose-500 mt-1">{formErrors.semester_id[0]}</p>
 )}
 </div>

 <div>
 <div className="flex items-center justify-between mb-1">
 <label className="block text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm">
 Kelas / Rombel <span className="text-rose-500">*</span>
 </label>
 {isScopedUnitRole && (
 <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-semibold border border-emerald-200 dark:border-emerald-800">
 Unit Scoped
 </span>
 )}
 </div>
 <div className="flex items-center gap-2">
 <CustomSelect
 value={formData.kelas_id}
 onChange={(e) => setFormData({ ...formData, kelas_id: e.target.value })}
 className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs sm:text-sm"
 >
 <option value="">-- Pilih Kelas ({filteredKelasList.length}) --</option>
 {filteredKelasList.map((k) => (
 <option key={k.id} value={k.id}>
 {k.nama_kelas} ({k.kode_kelas})
 </option>
 ))}
 </CustomSelect>

 <div className="group relative inline-flex shrink-0">
 <button
 type="button"
 title="Cari & Pilih Kelas / Rombel"
 aria-label="Cari & Pilih Kelas / Rombel"
 onClick={() => {
 setKelasSearchModal('')
 setIsKelasModalOpen(true)
 }}
 className="flex size-10 items-center justify-center rounded-xl bg-amber-100/90 text-amber-600 hover:bg-amber-500 hover:text-white dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-sm cursor-pointer shadow-2xs shrink-0"
 >
 <Layers className="size-5 transition-colors" />
 </button>
 <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
 Cari &amp; Pilih Kelas / Rombel
 </div>
 </div>
 </div>
 {formErrors.kelas_id && (
 <p className="text-xs text-rose-500 mt-1">{formErrors.kelas_id[0]}</p>
 )}
 </div>

 <div>
 <div className="flex items-center justify-between mb-1">
 <label className="block text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm">
 Mata Pelajaran <span className="text-rose-500">*</span>
 </label>
 {isScopedUnitRole && (
 <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-semibold border border-emerald-200 dark:border-emerald-800">
 Unit Scoped
 </span>
 )}
 </div>
 <div className="flex items-center gap-2">
 <CustomSelect
 value={formData.mata_pelajaran_id}
 onChange={(e) => setFormData({ ...formData, mata_pelajaran_id: e.target.value })}
 className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs sm:text-sm"
 >
 <option value="">-- Pilih Mata Pelajaran ({filteredSubjectList.length}) --</option>
 {filteredSubjectList.map((m) => (
 <option key={m.id} value={m.id}>
 {m.name} ({m.code || m.kode_mapel || '-'})
 </option>
 ))}
 </CustomSelect>

 <div className="group relative inline-flex shrink-0">
 <button
 type="button"
 title="Cari & Pilih Mata Pelajaran"
 aria-label="Cari & Pilih Mata Pelajaran"
 onClick={() => {
 setSubjectSearchModal('')
 setIsSubjectModalOpen(true)
 }}
 className="flex size-10 items-center justify-center rounded-xl bg-indigo-100/90 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-sm cursor-pointer shadow-2xs shrink-0"
 >
 <BookOpenCheck className="size-5 transition-colors" />
 </button>
 <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
 Cari &amp; Pilih Mata Pelajaran
 </div>
 </div>
 </div>
 {formErrors.mata_pelajaran_id && (
 <p className="text-xs text-rose-500 mt-1">{formErrors.mata_pelajaran_id[0]}</p>
 )}
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <div className="flex items-center justify-between mb-1">
 <label className="block text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm">
 Guru Pengampu <span className="text-rose-500">*</span>
 </label>
 {isScopedUnitRole && (
 <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-semibold border border-emerald-200 dark:border-emerald-800">
 Unit Scoped
 </span>
 )}
 </div>

 {selectedGuruObj ? (
 <div className="flex items-center justify-between gap-3 p-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-xs">
 <PersonIdentityCell
 src={selectedGuruObj.foto || selectedGuruObj.photo_url || selectedGuruObj.avatar_url}
 name={selectedGuruObj.nama_lengkap}
 subtitle={`NIY: ${selectedGuruObj.niy || '-'} • ${selectedGuruObj.position?.name || selectedGuruObj.unit?.name || 'Guru'}`}
 size="md"
 />
 <div className="flex items-center gap-2 shrink-0">
 <div className="group relative inline-flex shrink-0">
 <button
 type="button"
 title="Cari & Pilih Guru / Pegawai"
 aria-label="Cari & Pilih Guru / Pegawai"
 onClick={() => {
 setGuruSearchModal('')
 setIsGuruModalOpen(true)
 }}
 className="flex size-9 items-center justify-center rounded-xl bg-emerald-100/90 text-emerald-600 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-sm cursor-pointer shadow-2xs shrink-0"
 >
 <Users className="size-4 transition-colors" />
 </button>
 <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
 Cari &amp; Pilih Guru / Pegawai
 </div>
 </div>
 <button
 type="button"
 onClick={() => setFormData({ ...formData, guru_id: '' })}
 className="px-2.5 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-xs font-semibold flex items-center gap-1 transition"
 >
 <X className="w-3.5 h-3.5" /> Hapus
 </button>
 </div>
 </div>
 ) : (
 <div className="flex items-center gap-2">
 <CustomSelect
 value={formData.guru_id}
 onChange={(e) => setFormData({ ...formData, guru_id: e.target.value })}
 className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs sm:text-sm"
 >
 <option value="">-- Pilih Guru Pengampu ({filteredGuruList.length}) --</option>
 {filteredGuruList.map((g) => (
 <option key={g.id} value={g.id}>
 {g.nama_lengkap} (NIY: {g.niy || '-'}) {g.position?.name ? `• ${g.position.name}` : ''}
 </option>
 ))}
 </CustomSelect>
 <div className="group relative inline-flex shrink-0">
 <button
 type="button"
 title="Cari & Pilih Guru / Pegawai"
 aria-label="Cari & Pilih Guru / Pegawai"
 onClick={() => {
 setGuruSearchModal('')
 setIsGuruModalOpen(true)
 }}
 className="flex size-10 items-center justify-center rounded-xl bg-emerald-100/90 text-emerald-600 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-sm cursor-pointer shadow-2xs shrink-0"
 >
 <Users className="size-5 transition-colors" />
 </button>
 <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
 Cari &amp; Pilih Guru / Pegawai
 </div>
 </div>
 </div>
 )}
 {formErrors.guru_id && (
 <p className="text-xs text-rose-500 mt-1">{formErrors.guru_id[0]}</p>
 )}
 </div>

 <div>
 <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
 Kurikulum
 </label>
 <CustomSelect
 value={formData.kurikulum}
 onChange={(e) => setFormData({ ...formData, kurikulum: e.target.value })}
 className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
 >
 {options.kurikulum?.map((k, idx) => (
 <option key={idx} value={k}>
 {k}
 </option>
 ))}
 </CustomSelect>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="sm:col-span-2">
 <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
 Kode Modul (Auto Generate)
 </label>
 <div className="flex gap-2">
 <input
 type="text"
 placeholder="Kode unik modul semester"
 value={formData.kode_modul}
 onChange={(e) => setFormData({ ...formData, kode_modul: e.target.value })}
 className="w-full p-2.5 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold"
 />
 <button
 type="button"
 onClick={handleGenerateKode}
 className="px-3 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-300 transition"
 >
 Generate
 </button>
 </div>
 </div>

 <div>
 <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
 Status Modul
 </label>
 <CustomSelect
 value={formData.status}
 onChange={(e) => setFormData({ ...formData, status: e.target.value })}
 className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
 >
 <option value="Aktif">Aktif</option>
 <option value="Nonaktif">Nonaktif</option>
 <option value="Arsip">Arsip</option>
 </CustomSelect>
 </div>
 </div>

 <div>
 <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
 Nama Modul Semester <span className="text-rose-500">*</span>
 </label>
 <input
 type="text"
 placeholder="Contoh: Modul Semester 1 Matematika Terpadu Kelas VII"
 value={formData.nama_modul}
 onChange={(e) => setFormData({ ...formData, nama_modul: e.target.value })}
 className="w-full p-2.5 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
 />
 {formErrors.nama_modul && (
 <p className="text-xs text-rose-500 mt-1">{formErrors.nama_modul[0]}</p>
 )}
 </div>
 </div>
 )}

 {/* TAB 2: PEMBELAJARAN */}
 {activeTab === 'pembelajaran' && (
 <div className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
 ATP (Alur Tujuan Pembelajaran)
 </label>
 <textarea
 rows={3}
 placeholder="Tuliskan alur tujuan pembelajaran..."
 value={formData.atp}
 onChange={(e) => setFormData({ ...formData, atp: e.target.value })}
 className="w-full p-2.5 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
 ></textarea>
 </div>

 <div>
 <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
 CP (Capaian Pembelajaran)
 </label>
 <textarea
 rows={3}
 placeholder="Tuliskan capaian pembelajaran semester..."
 value={formData.cp}
 onChange={(e) => setFormData({ ...formData, cp: e.target.value })}
 className="w-full p-2.5 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
 ></textarea>
 </div>
 </div>

 <div>
 <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
 Tujuan Pembelajaran Spesifik
 </label>
 <textarea
 rows={2}
 placeholder="Detail tujuan spesifik yang ingin dicapai..."
 value={formData.tujuan_pembelajaran}
 onChange={(e) => setFormData({ ...formData, tujuan_pembelajaran: e.target.value })}
 className="w-full p-2.5 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
 ></textarea>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
 Alokasi Jam Pelajaran (JP)
 </label>
 <input
 type="number"
 min={1}
 value={formData.alokasi_jam}
 onChange={(e) => setFormData({ ...formData, alokasi_jam: parseInt(e.target.value) || 0 })}
 className="w-full p-2.5 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
 />
 </div>

 <div>
 <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
 Jumlah Pertemuan
 </label>
 <input
 type="number"
 min={1}
 value={formData.jumlah_pertemuan}
 onChange={(e) => setFormData({ ...formData, jumlah_pertemuan: parseInt(e.target.value) || 0 })}
 className="w-full p-2.5 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
 Metode Pembelajaran
 </label>
 <input
 type="text"
 placeholder="Contoh: Problem Based Learning, Ceramah, Diskusi"
 value={formData.metode_pembelajaran}
 onChange={(e) => setFormData({ ...formData, metode_pembelajaran: e.target.value })}
 className="w-full p-2.5 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
 />
 </div>

 <div>
 <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
 Model Pembelajaran
 </label>
 <CustomSelect
 value={formData.model_pembelajaran}
 onChange={(e) => setFormData({ ...formData, model_pembelajaran: e.target.value })}
 className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
 >
 {options.model_pembelajaran?.map((m, idx) => (
 <option key={idx} value={m}>
 {m}
 </option>
 ))}
 </CustomSelect>
 </div>
 </div>
 </div>
 )}

 {/* TAB 3: TARGET & PENGATURAN */}
 {activeTab === 'target' && (
 <div className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
 Target Nilai Minimum (KKM)
 </label>
 <input
 type="number"
 min={0}
 max={100}
 value={formData.target_nilai_minimum}
 onChange={(e) =>
 setFormData({ ...formData, target_nilai_minimum: parseFloat(e.target.value) || 0 })
 }
 className="w-full p-2.5 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
 />
 </div>

 <div>
 <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
 Target Kehadiran (%)
 </label>
 <input
 type="number"
 min={0}
 max={100}
 value={formData.target_kehadiran}
 onChange={(e) =>
 setFormData({ ...formData, target_kehadiran: parseFloat(e.target.value) || 0 })
 }
 className="w-full p-2.5 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
 Target Hafalan (Integrasi Tahfizh)
 </label>
 <textarea
 rows={2}
 placeholder="Contoh: Surah Al-Mulk ayat 1-30..."
 value={formData.target_hafalan}
 onChange={(e) => setFormData({ ...formData, target_hafalan: e.target.value })}
 className="w-full p-2.5 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
 ></textarea>
 </div>

 <div>
 <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
 Target Proyek Pembelajaran
 </label>
 <textarea
 rows={2}
 placeholder="Contoh: Pembuatan Miniatur Rumah Ramah Lingkungan..."
 value={formData.target_proyek}
 onChange={(e) => setFormData({ ...formData, target_proyek: e.target.value })}
 className="w-full p-2.5 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
 ></textarea>
 </div>
 </div>

 <div className="border-t border-emerald-200/80 dark:border-emerald-800/60 pt-4">
 <h4 className="font-bold text-slate-900 dark:text-white mb-3">Pengaturan Akses Portal</h4>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
 Berlaku Mulai
 </label>
 <DatePicker
 value={formData.berlaku_mulai}
 onChange={(e) => setFormData({ ...formData, berlaku_mulai: e.target.value })}
 inputClassName="p-2.5"
 />
 </div>

 <div>
 <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
 Berlaku Sampai
 </label>
 <DatePicker
 value={formData.berlaku_sampai}
 onChange={(e) => setFormData({ ...formData, berlaku_sampai: e.target.value })}
 inputClassName="p-2.5"
 />
 </div>
 </div>

 <div className="mt-4 space-y-2 font-medium">
 <label className="flex items-center gap-2 cursor-pointer text-slate-800 dark:text-slate-200">
 <input
 type="checkbox"
 checked={formData.ditampilkan_di_portal_ortu}
 onChange={(e) => setFormData({ ...formData, ditampilkan_di_portal_ortu: e.target.checked })}
 className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
 />
 <span>Ditampilkan di Portal Orang Tua</span>
 </label>

 <label className="flex items-center gap-2 cursor-pointer text-slate-800 dark:text-slate-200">
 <input
 type="checkbox"
 checked={formData.ditampilkan_di_aplikasi_siswa}
 onChange={(e) => setFormData({ ...formData, ditampilkan_di_aplikasi_siswa: e.target.checked })}
 className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
 />
 <span>Ditampilkan di Aplikasi Siswa</span>
 </label>
 </div>
 </div>
 </div>
 )}

 {/* TAB 4: DETAIL MATERI */}
 {activeTab === 'materi' && (
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <div>
 <h4 className="font-bold text-slate-900 dark:text-white">Detail Rincian Materi Per Minggu</h4>
 <p className="text-xs text-slate-500">Tentukan susunan materi, JP, ATP, dan CP mingguan.</p>
 </div>
 <button
 type="button"
 onClick={handleTambahDetailMateri}
 className="px-3 py-1.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-xl hover:bg-emerald-200 transition font-bold flex items-center gap-1.5"
 >
 <Plus className="h-4 w-4" /> Tambah Minggu
 </button>
 </div>

 <div className="overflow-x-auto border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200 font-extrabold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="p-2.5 w-16 text-center">MINGGU</th>
                    <th className="p-2.5">MATERI PEMBELAJARAN</th>
                    <th className="p-2.5">ATP / CATATAN</th>
                    <th className="p-2.5">JP &amp; KETERANGAN</th>
                    <th className="p-2.5 w-16 text-right select-none"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                  {formData.details?.map((detail, idx) => (
                    <tr key={idx} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20">
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          min={1}
                          value={detail.minggu}
                          onChange={(e) => handleUbahDetailMateri(idx, 'minggu', parseInt(e.target.value) || 1)}
                          className="w-12 text-center p-1 rounded border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 font-bold"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          placeholder="Nama Materi minggu ini..."
                          value={detail.materi}
                          onChange={(e) => handleUbahDetailMateri(idx, 'materi', e.target.value)}
                          className="w-full p-1.5 rounded border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 font-medium"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          placeholder="Target ATP minggu ini..."
                          value={detail.atp}
                          onChange={(e) => handleUbahDetailMateri(idx, 'atp', e.target.value)}
                          className="w-full p-1.5 rounded border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900"
                        />
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={1}
                            placeholder="JP"
                            value={detail.jp}
                            onChange={(e) => handleUbahDetailMateri(idx, 'jp', parseInt(e.target.value) || 2)}
                            className="w-14 text-center p-1 rounded border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 font-bold"
                          />
                          <input
                            type="text"
                            placeholder="Ket / Kuis"
                            value={detail.keterangan}
                            onChange={(e) => handleUbahDetailMateri(idx, 'keterangan', e.target.value)}
                            className="w-full p-1.5 rounded border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900"
                          />
                        </div>
                      </td>
                      <td className="p-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleHapusDetailMateri(idx)}
                          className="p-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300 transition-colors cursor-pointer"
                          title="Hapus Baris"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
 </div>
 </div>
 )}

 {/* TAB 5: BOBOT PENILAIAN */}
 {activeTab === 'bobot' && (
 <div className="space-y-4">
 <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
 <div>
 <h4 className="font-bold text-slate-900 dark:text-white">Pengaturan Bobot Penilaian (%)</h4>
 <p className="text-xs text-slate-500">Total akumulasi seluruh komponen bobot penilaian WAJIB 100%.</p>
 </div>
 <div className="text-right">
 <p className="text-[10px] uppercase font-bold text-slate-500">Total Bobot saat ini</p>
 <span
 className={`text-xl font-black ${
 totalBobotPenilaian === 100
 ? 'text-emerald-600 dark:text-emerald-400'
 : 'text-rose-600 dark:text-rose-400 animate-pulse'
 }`}
 >
 {totalBobotPenilaian}%
 </span>
 </div>
 </div>

 {totalBobotPenilaian !== 100 && (
 <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-rose-700 dark:text-rose-300 flex items-center gap-2 text-xs">
 <AlertTriangle className="text-rose-500 shrink-0 h-4 w-4" />
 <span>
 Peringatan: Total bobot penilaian saat ini adalah <b>{totalBobotPenilaian}%</b>. Sesuaikan angka di bawah hingga total pas 100%.
 </span>
 </div>
 )}

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div>
 <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
 Bobot Tugas (%)
 </label>
 <input
 type="number"
 min={0}
 max={100}
 value={formData.bobot_tugas}
 onChange={(e) => setFormData({ ...formData, bobot_tugas: parseFloat(e.target.value) || 0 })}
 className="w-full p-2.5 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
 />
 </div>

 <div>
 <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
 Bobot Kuis (%)
 </label>
 <input
 type="number"
 min={0}
 max={100}
 value={formData.bobot_quiz}
 onChange={(e) => setFormData({ ...formData, bobot_quiz: parseFloat(e.target.value) || 0 })}
 className="w-full p-2.5 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
 />
 </div>

 <div>
 <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
 Bobot Projek (%)
 </label>
 <input
 type="number"
 min={0}
 max={100}
 value={formData.bobot_projek}
 onChange={(e) => setFormData({ ...formData, bobot_projek: parseFloat(e.target.value) || 0 })}
 className="w-full p-2.5 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
 />
 </div>

 <div>
 <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
 Bobot UTS (%)
 </label>
 <input
 type="number"
 min={0}
 max={100}
 value={formData.bobot_uts}
 onChange={(e) => setFormData({ ...formData, bobot_uts: parseFloat(e.target.value) || 0 })}
 className="w-full p-2.5 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
 />
 </div>

 <div>
 <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
 Bobot UAS (%)
 </label>
 <input
 type="number"
 min={0}
 max={100}
 value={formData.bobot_uas}
 onChange={(e) => setFormData({ ...formData, bobot_uas: parseFloat(e.target.value) || 0 })}
 className="w-full p-2.5 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
 />
 </div>
 </div>
 </div>
 )}

 </form>
 </div>
 </AppModal>

 {/* DETAIL DRAWER */}
 {detailModul && (
 <AppDrawer
 isOpen={isDrawerOpen}
 onClose={() => setIsDrawerOpen(false)}
 icon={BookOpen}
 title={detailModul.nama_modul}
 description={`${detailModul.kode_modul || '-'} · ${detailModul.kurikulum || '-'}`}
 footer={(
 <div className="flex items-center justify-between gap-3 text-xs">
 <button
 type="button"
 onClick={() => setIsDrawerOpen(false)}
 className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
 >
 Tutup
 </button>
 <button
 type="button"
 onClick={() => {
 setIsDrawerOpen(false)
 handleOpenEditModal(detailModul)
 }}
 className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl flex items-center gap-1.5 shadow"
 >
 <Pencil className="h-4 w-4" /> Edit Modul Ini
 </button>
 </div>
 )}
 >
 <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl mb-6 text-xs">
 <div>
 <p className="text-slate-400 font-medium">Mata Pelajaran</p>
 <p className="font-bold text-slate-900 dark:text-white">{detailModul.mata_pelajaran?.name || '-'}</p>
 </div>
 <div>
 <p className="text-slate-400 font-medium">Guru Pengampu</p>
 <p className="font-bold text-slate-900 dark:text-white">{detailModul.guru?.nama_lengkap || '-'}</p>
 </div>
 <div>
 <p className="text-slate-400 font-medium">Jumlah Pertemuan / Jam</p>
 <p className="font-bold text-slate-900 dark:text-white">{detailModul.jumlah_pertemuan} Pertemuan ({detailModul.alokasi_jam} JP)</p>
 </div>
 <div>
 <p className="text-slate-400 font-medium">Target KKM / Kehadiran</p>
 <p className="font-bold text-slate-900 dark:text-white">KKM: {detailModul.target_nilai_minimum} &bull; Kehadiran: {detailModul.target_kehadiran}%</p>
 </div>
 </div>

 {/* Rincian Materi Table */}
 <div className="mb-6">
 <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase mb-2">Rincian Materi Mingguan ({detailModul.details?.length || 0})</h4>
 <div className="overflow-x-auto border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl text-xs">
 <table className="w-full text-left border-collapse">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold">
 <th className="p-2 text-center">Minggu</th>
 <th className="p-2">Materi</th>
 <th className="p-2 text-center">JP</th>
 <th className="p-2">Ket</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {detailModul.details?.map((dt, idx) => (
 <tr key={idx}>
 <td className="p-2 text-center font-bold">{dt.minggu}</td>
 <td className="p-2 font-medium">{dt.materi}</td>
 <td className="p-2 text-center">{dt.jp}</td>
 <td className="p-2 text-slate-500">{dt.keterangan || '-'}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </AppDrawer>
 )}

 {/* MODAL PILIH KELAS / ROMBEL */}
 <AppModal
 isOpen={isKelasModalOpen}
 onClose={() => setIsKelasModalOpen(false)}
 title="Pilih Kelas / Rombel"
 description="Pilih rombongan belajar / kelas terdaftar."
 icon={Layers}
 maxWidth="max-w-xl"
 >
 <div className="space-y-4">
 {(isScopedUnitRole || formData.unit_pendidikan_id) && (
 <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-semibold border border-amber-200/80 dark:border-amber-800/60">
 <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
 <span>
 Daftar kelas difilter sesuai unit:{' '}
 <strong>
 {options.unit_pendidikan?.find((u) => u.id === activeUnitIdForForm)?.name || 'Unit Terkait'}
 </strong>
 </span>
 </div>
 )}

 <div className="relative">
 <Search className="w-4 h-4 absolute left-3 top-3 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 placeholder="Cari nama kelas, kode kelas, jenjang..."
 value={kelasSearchModal}
 onChange={(e) => setKelasSearchModal(e.target.value)}
 className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
 />
 </div>

 <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 font-medium">
 <span>Ditemukan {filteredKelasModalList.length} kelas</span>
 {kelasSearchModal && (
 <button
 type="button"
 onClick={() => setKelasSearchModal('')}
 className="text-rose-500 hover:underline flex items-center gap-1 font-semibold"
 >
 <X className="w-3 h-3" /> Reset
 </button>
 )}
 </div>

 <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1 divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {filteredKelasModalList.length > 0 ? (
 filteredKelasModalList.map((k) => {
 const isSelected = formData.kelas_id === k.id
 return (
 <div
 key={k.id}
 className={`flex items-center justify-between p-3 rounded-xl transition-all ${
 isSelected
 ? 'bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800'
 : 'hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 border border-transparent transition-colors'
 }`}
 >
 <div>
 <h4 className="font-bold text-slate-900 dark:text-white text-sm">
 {k.nama_kelas}{' '}
 <span className="font-mono text-xs text-amber-700 dark:text-amber-400">
 ({k.kode_kelas})
 </span>
 </h4>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 {k.jenjang || 'SDIT'} {k.tahun_ajaran ? `• ${k.tahun_ajaran.name}` : ''}
 </p>
 </div>
 <button
 type="button"
 onClick={() => {
 setFormData((prev) => ({
 ...prev,
 kelas_id: k.id,
 unit_pendidikan_id: prev.unit_pendidikan_id || k.unit_pendidikan_id || '',
 }))
 setIsKelasModalOpen(false)
 }}
 className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs ${
 isSelected
 ? 'bg-amber-600 text-white cursor-default'
 : 'bg-amber-500 hover:bg-amber-600 text-white'
 }`}
 >
 {isSelected ? (
 <>
 <Check className="w-3.5 h-3.5" /> Terpilih
 </>
 ) : (
 'Pilih Kelas'
 )}
 </button>
 </div>
 )
 })
 ) : (
 <div className="py-10 text-center text-slate-400">
 <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
 <p className="font-semibold text-xs text-slate-600 dark:text-slate-300">
 Tidak ada kelas ditemukan
 </p>
 </div>
 )}
 </div>
 </div>
 </AppModal>

 {/* MODAL PILIH MATA PELAJARAN */}
 <AppModal
 isOpen={isSubjectModalOpen}
 onClose={() => setIsSubjectModalOpen(false)}
 title="Pilih Mata Pelajaran"
 description="Pilih mata pelajaran yang akan diampu pada modul semester ini."
 icon={BookOpenCheck}
 maxWidth="max-w-xl"
 >
 <div className="space-y-4">
 {(isScopedUnitRole || formData.unit_pendidikan_id) && (
 <div className="flex items-center gap-2.5 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 text-xs font-semibold border border-indigo-200/80 dark:border-indigo-800/60">
 <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
 <span>
 Daftar mata pelajaran difilter sesuai unit:{' '}
 <strong>
 {options.unit_pendidikan?.find((u) => u.id === activeUnitIdForForm)?.name || 'Unit Terkait'}
 </strong>
 </span>
 </div>
 )}

 <div className="relative">
 <Search className="w-4 h-4 absolute left-3 top-3 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 placeholder="Cari nama mapel, kode mapel, kelompok..."
 value={subjectSearchModal}
 onChange={(e) => setSubjectSearchModal(e.target.value)}
 className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
 />
 </div>

 <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 font-medium">
 <span>Ditemukan {filteredSubjectModalList.length} mata pelajaran</span>
 {subjectSearchModal && (
 <button
 type="button"
 onClick={() => setSubjectSearchModal('')}
 className="text-rose-500 hover:underline flex items-center gap-1 font-semibold"
 >
 <X className="w-3 h-3" /> Reset
 </button>
 )}
 </div>

 <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1 divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {filteredSubjectModalList.length > 0 ? (
 filteredSubjectModalList.map((m) => {
 const isSelected = formData.mata_pelajaran_id === m.id
 return (
 <div
 key={m.id}
 className={`flex items-center justify-between p-3 rounded-xl transition-all ${
 isSelected
 ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-800'
 : 'hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 border border-transparent transition-colors'
 }`}
 >
 <div>
 <h4 className="font-bold text-slate-900 dark:text-white text-sm">
 {m.name}{' '}
 <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
 ({m.code || m.kode_mapel || '-'})
 </span>
 </h4>
 {m.kelompok_mapel && (
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Kelompok: {m.kelompok_mapel}
 </p>
 )}
 </div>
 <button
 type="button"
 onClick={() => {
 setFormData((prev) => ({
 ...prev,
 mata_pelajaran_id: m.id,
 unit_pendidikan_id: prev.unit_pendidikan_id || m.unit_pendidikan_id || '',
 }))
 setIsSubjectModalOpen(false)
 }}
 className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs ${
 isSelected
 ? 'bg-indigo-600 text-white cursor-default'
 : 'bg-indigo-500 hover:bg-indigo-600 text-white'
 }`}
 >
 {isSelected ? (
 <>
 <Check className="w-3.5 h-3.5" /> Terpilih
 </>
 ) : (
 'Pilih Mapel'
 )}
 </button>
 </div>
 )
 })
 ) : (
 <div className="py-10 text-center text-slate-400">
 <BookOpenCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
 <p className="font-semibold text-xs text-slate-600 dark:text-slate-300">
 Tidak ada mata pelajaran ditemukan
 </p>
 </div>
 )}
 </div>
 </div>
 </AppModal>

 {/* MODAL PILIH GURU & PEGAWAI */}
 <AppModal
 isOpen={isGuruModalOpen}
 onClose={() => setIsGuruModalOpen(false)}
 title="Pilih Guru & Pegawai Pengampu"
 description="Tampilkan list pegawai dan guru terdaftar. Gunakan pencarian nama, NIY, NIK, atau jabatan."
 icon={Users}
 maxWidth="max-w-3xl"
 >
 <div className="space-y-4">
 {/* Unit Scope Banner */}
 {(isScopedUnitRole || formData.unit_pendidikan_id) && (
 <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200/80 dark:border-emerald-800/60">
 <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
 <span>
 Data pegawai & guru difilter secara otomatis sesuai unit pendidikan:{' '}
 <strong>
 {options.unit_pendidikan?.find((u) => u.id === activeUnitIdForForm)?.name || 'Unit Terkait'}
 </strong>
 </span>
 </div>
 )}

 {/* Search & Filter Bar */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div className="sm:col-span-2 relative">
 <Search className="w-4 h-4 absolute left-3 top-3 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 placeholder="Cari nama lengkap, NIY, NIK, email, jabatan..."
 value={guruSearchModal}
 onChange={(e) => setGuruSearchModal(e.target.value)}
 className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
 />
 </div>
 <div>
 <CustomSelect
 value={guruStatusModalFilter}
 onChange={(e) => setGuruStatusModalFilter(e.target.value)}
 className="w-full py-2.5 px-3 rounded-xl border border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium"
 >
 <option value="">Semua Status Pegawai</option>
 <option value="Aktif">Aktif</option>
 <option value="Tetap">Tetap</option>
 <option value="Kontrak">Kontrak</option>
 <option value="Honorer">Honorer</option>
 </CustomSelect>
 </div>
 </div>

 <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 font-medium">
 <span>Ditemukan {filteredGuruList.length} guru / pegawai</span>
 {guruSearchModal && (
 <button
 type="button"
 onClick={() => setGuruSearchModal('')}
 className="text-rose-500 hover:underline flex items-center gap-1 font-semibold"
 >
 <X className="w-3 h-3" /> Reset Cari
 </button>
 )}
 </div>

 {/* Employee List Grid */}
 <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1 divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {filteredGuruList.length > 0 ? (
 filteredGuruList.map((g) => {
 const isSelected = formData.guru_id === g.id
 return (
 <div
 key={g.id}
 className={`flex items-center justify-between p-3 rounded-xl transition-all ${
 isSelected
 ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800'
 : 'hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 border border-transparent transition-colors'
 }`}
 >
 <div className="flex items-center gap-3 min-w-0">
 <PersonIdentityCell
 src={g.foto || g.photo_url || g.avatar_url}
 name={g.nama_lengkap}
 subtitle={
 <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
 <span>NIY: {g.niy || '-'}</span>
 {g.nik && <span>• NIK: {g.nik}</span>}
 {g.position?.name && (
 <span className="font-semibold text-slate-700 dark:text-slate-300">
 • {g.position.name}
 </span>
 )}
 </span>
 }
 size="md"
 />
 </div>

 <div className="flex items-center gap-2 shrink-0 ml-3">
 {g.unit?.name && (
 <span className="hidden sm:inline-block px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
 {g.unit.name}
 </span>
 )}
 <button
 type="button"
 onClick={() => {
 setFormData((prev) => ({
 ...prev,
 guru_id: g.id,
 unit_pendidikan_id: prev.unit_pendidikan_id || g.unit_id || g.unit_pendidikan_id || '',
 }))
 setIsGuruModalOpen(false)
 }}
 className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs ${
 isSelected
 ? 'bg-emerald-700 text-white cursor-default'
 : 'bg-[#0E5C44] hover:bg-[#094130] text-white'
 }`}
 >
 {isSelected ? (
 <>
 <Check className="w-3.5 h-3.5" /> Terpilih
 </>
 ) : (
 'Pilih Guru'
 )}
 </button>
 </div>
 </div>
 )
 })
 ) : (
 <div className="py-12 text-center text-slate-400 dark:text-slate-500">
 <Users className="w-10 h-9 mx-auto mb-2 opacity-40" />
 <p className="font-semibold text-sm text-slate-600 dark:text-slate-300">
 Tidak ada pegawai / guru ditemukan
 </p>
 <p className="text-xs">Coba sesuaikan kata kunci pencarian atau filter status.</p>
 </div>
 )}
 </div>
 </div>
 </AppModal>

 <HarmonizedDeleteModal
 isOpen={isDeleteOpen}
 onClose={() => {
 setIsDeleteOpen(false)
 setDeleteItem(null)
 }}
 onConfirm={() => deleteItem && hapusMutation.mutate(deleteItem.id)}
 item={deleteItem}
 isSubmitting={hapusMutation.isLoading}
 />

 <HarmonizedDuplicateModal
 isOpen={isDuplicateOpen}
 onClose={() => {
 setIsDuplicateOpen(false)
 setDuplicateItem(null)
 }}
 onConfirm={() => duplicateItem && duplikasiMutation.mutate(duplicateItem.id)}
 item={duplicateItem}
 isSubmitting={duplikasiMutation.isLoading}
 />

 </MasterDataPage>
 </PageContainer>
 )
}
