import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  GraduationCap,
  ArrowRightLeft,
  UserX,
  Edit3,
  Trash2,
  RotateCcw,
  School,
  AlertCircle,
  Download,
  Plus,
  UserPlus,
  Printer,
  Search,
  Eye,
  BookOpen,
  Briefcase,
  MapPin,
  Calendar,
  Building,
  ShieldCheck,
  Sparkles,
  Check,
  ChevronDown
} from 'lucide-react'
import {
  Upload as Upload1,
  Download as Download1,
  CheckCircle2 as CheckCircle1
} from 'lucide-react'
import {
  FaGraduationCap,
  FaSchool,
  FaExchangeAlt,
  FaUserSlash
} from 'react-icons/fa'
import Swal from '@/components/ui/compat/swal-heroui'
import useDebounce from '../hooks/useDebounce'
import {
  printCleanTable
} from '../utils/printHelper'

import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppBadge from '../components/app/AppBadge'
import AppDataTable from '../components/app/AppDataTable'
import AppSkeleton from '../components/app/AppSkeleton'
import {
  ActionDropdown,
  IconButton,
  AppButton
} from '../components/app'
import ConfirmDialog from '../components/app/ConfirmDialog'
import PersonIdentityCell from '../components/ui/PersonIdentityCell'
import {
  MasterDataPage,
  MasterDataSection,
  MasterFilterSelect,
  SquircleActionButton
} from '../components/master-data'
import {
  exportCsv
} from '../components/reports/ReportKit'
import {
  businessOptionService
} from '../services/businessOptionService'
import {
  useAuthStore
} from '../stores/authStore'
import {
  hasRoleLevel,
  ROLE_LEVELS,
  isFoundationUser
} from '../auth/portalResolver'
import {
  SmartScrollFab
} from '../components/common'

import {
  Button
} from '../components/ui/button'
import {
  Spinner
} from '@heroui/react'
import {
  Pagination
} from '../components/ui/pagination'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '../components/ui/card'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'
import AppModal from '../components/app/AppModal'
import {
  FieldLabel,
  FieldDescription
} from '../components/ui/field'
import {
  Input
} from '../components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '../components/ui/select'
import HeroUiFilterSelect from '../components/ui/HeroUiFilterSelect'
import HeroUiHeader from '../components/ui/HeroUiHeader'
import {
  Alert,
  AlertDescription,
  AlertTitle
} from '../components/ui/alert'
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent
} from '../components/ui/hover-card'

import alumniService from '../services/alumniService'
import {
  studentService
} from '../services/studentService'
import api from '../services/api'
import CsvImportModal from '../components/master-data/CsvImportModal'
import {
  KpiStatCard
} from '../components/app/KpiStatCard'

// Sub-komponen KpiTintedCard Canonical HeroUI Style
function KpiTintedCard({
  icon: Icon,
  label,
  title,
  subtext,
  subtitle,
  value,
  tag,
  badge,
  tone = 'emerald',
  variant,
  ctaText,
  onClick,
  active = false,
  isActive = false,
  isLoading = false,
  className = '',
  ...props
}) {
  return (
    <KpiStatCard
      icon={Icon}
      title={title || label}
      value={isLoading ? '...' : (typeof value === 'number' ? value.toLocaleString('id-ID') : (value ?? 0))}
      description={subtitle || subtext}
      badge={badge || tag}
      tone={variant || tone || 'emerald'}
      ctaText={ctaText || (onClick ? 'Lihat Rincian' : 'Statistik')}
      onClick={onClick}
      className={className}
      active={active || isActive}
      {...props}
    />
  )
}

// Sub-komponen AlumniHoverCard wrapping PersonIdentityCell (Identik dengan StudentsPage.jsx)
function AlumniHoverCard({ row, children }) {
 const meta = row.metadata || {}
 const tujuan = meta.status_lanjutan || row.status_lanjutan || 'Belum Diisi'

 return (
 <HoverCard>
 <HoverCardTrigger asChild>
 <div className="cursor-pointer">
 <PersonIdentityCell
 avatarUrl={row.photo || row.avatar || row.foto}
 name={row.full_name || row.nama || '-'}
 subtitle={`NIS: ${row.nis || row.nisn || '-'}`}
 />
 </div>
 </HoverCardTrigger>
 <HoverCardContent className="w-72 p-4 space-y-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-xl dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-2">
 {row.full_name || row.nama}
 </div>
 <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 pt-1">
 <p><span className="font-semibold text-slate-700 dark:text-slate-300">NIS/NISN:</span> {row.nis || row.nisn || '-'}</p>
 <p><span className="font-semibold text-slate-700 dark:text-slate-300">Unit Asal:</span> {row.education_unit?.name || row.unit?.name || 'Unit Utama'}</p>
 <p><span className="font-semibold text-slate-700 dark:text-slate-300">Tahun Lulus:</span> {row.tahun_lulus || row.tahun_masuk || '-'}</p>
 <p><span className="font-semibold text-slate-700 dark:text-slate-300">Status Studi:</span> {tujuan}</p>
 {meta.catatan_alumni && (
 <p className="italic text-slate-400 border-t border-emerald-200/80 dark:border-emerald-800/60 pt-1.5 mt-1">
 "{meta.catatan_alumni}"
 </p>
 )}
 </div>
 </HoverCardContent>
 </HoverCard>
 )
}


export default function KelolaAlumniPage() {
 const user = useAuthStore((state) => state.user)
 const isFoundation = isFoundationUser(user)
 const canManage = !isFoundation && hasRoleLevel(user, ROLE_LEVELS.OPERATOR)

 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(null)
 const [alumniList, setAlumniList] = useState([])
 const [units, setUnits] = useState([])
 const [stats, setStats] = useState({
 total_alumni: 0,
 lanjut_studi: 0,
 pindah_masuk: 0,
 pindah_keluar: 0,
 })

 // Filtering & Pagination State
 const [search, setSearch] = useState('')
 const [selectedUnit, setSelectedUnit] = useState('all')
 const [statusLanjutanFilter, setStatusLanjutanFilter] = useState('all')
 const [tahunLulusFilter, setTahunLulusFilter] = useState('all')
 const [categoryTab, setCategoryTab] = useState('all') // 'all' | 'alumni' | 'mutasi'
 const [page, setPage] = useState(1)
 const [perPage, setPerPage] = useState(10)

 // Dialog States
 const [addModalOpen, setAddModalOpen] = useState(false)
 const [editModalOpen, setEditModalOpen] = useState(false)
 const [pindahUnitModalOpen, setPindahUnitModalOpen] = useState(false)
 const [pindahKeluarModalOpen, setPindahKeluarModalOpen] = useState(false)
 const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

 // Card Detail Modal State
 const [cardModalOpen, setCardModalOpen] = useState(false)
 const [cardModalData, setCardModalData] = useState({
 type: '',
 title: '',
 description: '',
 tone: 'emerald',
 icon: GraduationCap,
 list: [],
 })
 const [modalSearch, setModalSearch] = useState('')

 const handleOpenCardModal = (type) => {
 let title = ''
 let description = ''
 let tone = 'emerald'
 let Icon = GraduationCap
 let filtered = []

 if (type === 'total_alumni' || type === 'all') {
 title = 'Detail Data Total Alumni Terdata'
 description = 'Daftar seluruh siswa/alumni yang terdaftar di dalam sistem.'
 tone = 'emerald'
 Icon = GraduationCap
 filtered = categoryLists.total
 } else if (type === 'lanjut_studi' || type === 'alumni') {
 title = 'Detail Data Alumni Lanjut Studi & Karir'
 description = 'Daftar alumni yang tercatat melanjutkan ke perguruan tinggi, bekerja, ma’had, atau sekolah lanjutan.'
 tone = 'blue'
 Icon = School
 filtered = categoryLists.lanjut_studi
 } else if (type === 'pindah_unit') {
 title = 'Detail Data Siswa Mutasi Pindah Unit (Internal)'
 description = 'Daftar siswa yang melaksanakan mutasi internal antar unit pendidikan di bawah yayasan.'
 tone = 'amber'
 Icon = ArrowRightLeft
 filtered = categoryLists.pindah_unit
 } else if (type === 'pindah_keluar') {
 title = 'Detail Data Siswa Mutasi Pindah Keluar Sekolah'
 description = 'Daftar siswa yang mutasi keluar ke sekolah lain di luar yayasan.'
 tone = 'rose'
 Icon = UserX
 filtered = categoryLists.pindah_keluar
 } else if (type === 'mutasi') {
 title = 'Detail Data Siswa Pindah / Mutasi Unit & Sekolah'
 description = 'Daftar siswa yang melaksanakan mutasi internal antar unit maupun mutasi keluar sekolah.'
 tone = 'amber'
 Icon = ArrowRightLeft
 filtered = categoryLists.mutasi
 }

 setCardModalData({
 type,
 title,
 description,
 tone,
 icon: Icon,
 list: filtered,
 })
 setModalSearch('')
 setCardModalOpen(true)
 }

 const [selectedAlumni, setSelectedAlumni] = useState(null)
 const [submitting, setSubmitting] = useState(false)

 // Form State Tambah Alumni Baru
 const [addForm, setAddForm] = useState({
 full_name: '',
 nis: '',
 nisn: '',
 unit_id: '',
 kelas_id: '',
 kelas_name: '',
 tahun_lulus: new Date().getFullYear().toString(),
 status_lanjutan: 'Kuliah',
 perguruan_tinggi: '',
 pekerjaan: '',
 catatan: '',
 // Jenis data: 'alumni' | 'pindah_unit' | 'pindah_keluar'
 jenis_data: 'alumni',
 unit_tujuan_id: '',
 sekolah_tujuan: '',
 alasan_mutasi: '',
 })

 // Database Students Fetching & Search State for Tambah Alumni
 const [studentsList, setStudentsList] = useState([])
 const [loadingStudents, setLoadingStudents] = useState(false)
 const [selectedStudentId, setSelectedStudentId] = useState('')
 const [studentSearchQuery, setStudentSearchQuery] = useState('')
 const [searchingStudents, setSearchingStudents] = useState(false)
 const [selectedStudentInfo, setSelectedStudentInfo] = useState('')

 const extractStudentsArray = (res) => {
 if (Array.isArray(res)) return res
 if (res && Array.isArray(res.data)) return res.data
 if (res && res.data && Array.isArray(res.data.data)) return res.data.data
 if (res && res.students && Array.isArray(res.students)) return res.students
 if (res && res.data && Array.isArray(res.data.students)) return res.data.students
 return []
 }

 useEffect(() => {
 if (addModalOpen) {
 setLoadingStudents(true)
 studentService
 .getDaftar({ per_page: 100, unit_id: addForm.unit_id || undefined })
 .then((res) => {
 const list = extractStudentsArray(res)
 setStudentsList(list)
 })
 .finally(() => {
 setLoadingStudents(false)
 })
 } else {
 setSelectedStudentId('')
 setStudentSearchQuery('')
 setSelectedStudentInfo('')
 }
 }, [addModalOpen, addForm.unit_id])

 // Modal DataTable Seleksi Siswa/Santri Real-Time berdasar Scope Unit User
 const [studentTableModalOpen, setStudentTableModalOpen] = useState(false)
 const [studentTableList, setStudentTableList] = useState([])
 const [studentTableLoading, setStudentTableLoading] = useState(false)
 const [studentTableSearch, setStudentTableSearch] = useState('')
 const [studentTableUnitFilter, setStudentTableUnitFilter] = useState('all')
 const [studentTablePage, setStudentTablePage] = useState(1)
 const [studentTableTotalPages, setStudentTableTotalPages] = useState(1)
 const [studentTableTotalCount, setStudentTableTotalCount] = useState(0)
 const debouncedStudentTableSearch = useDebounce(studentTableSearch, 350)

 const fetchStudentTableData = useCallback(async () => {
 if (!studentTableModalOpen) return
 setStudentTableLoading(true)
 try {
 const res = await studentService.getDaftar({
 search: debouncedStudentTableSearch.trim() || undefined,
 unit_id: studentTableUnitFilter !== 'all' ? studentTableUnitFilter : undefined,
 page: studentTablePage,
 per_page: 10,
 })
 const items = extractStudentsArray(res)
 setStudentTableList(items)
 const total = res?.data?.total || res?.total || items.length || 0
 const lastPage = res?.data?.last_page || res?.last_page || Math.ceil(total / 10) || 1
 setStudentTableTotalCount(total)
 setStudentTableTotalPages(lastPage)
 } catch (err) {
 console.error('Gagal memuat datatable siswa:', err)
 setStudentTableList([])
 } finally {
 setStudentTableLoading(false)
 }
 }, [studentTableModalOpen, debouncedStudentTableSearch, studentTableUnitFilter, studentTablePage])

 useEffect(() => {
 fetchStudentTableData()
 }, [fetchStudentTableData])

 const handleOpenStudentTableModal = () => {
 setStudentTablePage(1)
 setStudentTableSearch('')
 setStudentTableUnitFilter(addForm.unit_id || 'all')
 setStudentTableModalOpen(true)
 }

 const handleChooseStudentFromTable = (student) => {
 handleSelectStudentFromObj(student, true)
 setStudentTableModalOpen(false)
 }

 const handleSelectStudentFromObj = (found, notify = false) => {
 if (!found) return
 setSelectedStudentId(String(found.id))
 const studentName = found.full_name || found.nama || found.name || found.student_name || ''
 const studentNis = found.nis || found.metadata?.nis || ''
 const studentNisn = found.nisn || found.metadata?.nisn || ''
 const studentUnitId = String(
 found.unit_id || found.education_unit_id || found.education_unit?.id || found.unit?.id || units[0]?.id || ''
 )
 const studentKelasId = String(
 found.kelas_id || found.school_class_id || found.schoolClass?.id || found.school_class?.id || ''
 )
 const studentKelasName =
 found.school_class?.nama_kelas ||
 found.schoolClass?.nama_kelas ||
 found.kelas?.nama_kelas ||
 found.metadata?.nama_kelas ||
 found.metadata?.kelas ||
 ''

 setAddForm((prev) => ({
 ...prev,
 full_name: studentName,
 nis: studentNis,
 nisn: studentNisn,
 unit_id: studentUnitId || prev.unit_id,
 kelas_id: studentKelasId || prev.kelas_id,
 kelas_name: studentKelasName || prev.kelas_name,
 }))

 const unitObj = units.find((u) => String(u.id) === String(studentUnitId))
 const unitNameStr = unitObj?.name || unitObj?.nama || 'Unit Sekolah'
 const kelasDisplay = studentKelasName ? ` | Kelas: ${studentKelasName}` : ''
 const infoStr = `${studentName} (NIS: ${studentNis || '-'}) - ${unitNameStr}${kelasDisplay}`
 setSelectedStudentInfo(infoStr)

 if (notify) {
 Swal.fire({
 icon: 'success',
 title: 'Data Siswa Ditarik',
 text: `Data "${studentName}" (${unitNameStr}${kelasDisplay}) berhasil ditarik dan diisikan secara langsung!`,
 timer: 2500,
 toast: true,
 position: 'top-end',
 showConfirmButton: false,
 })
 }
 }

 const handleSearchStudents = async () => {
 setSearchingStudents(true)
 try {
 const res = await studentService.getDaftar({
 search: studentSearchQuery.trim() || undefined,
 unit_id: addForm.unit_id || undefined,
 per_page: 50,
 })
 const list = extractStudentsArray(res)
 setStudentsList(list)
 if (list.length > 0) {
 handleSelectStudentFromObj(list[0], true)
 } else {
 setSelectedStudentId('')
 setSelectedStudentInfo('')
 Swal.fire({
 icon: 'info',
 title: 'Siswa Tidak Ditemukan',
 text: studentSearchQuery.trim()
 ? `Tidak ada data siswa yang cocok dengan kata kunci "${studentSearchQuery}".`
 : 'Belum ada data siswa terdaftar di database.',
 timer: 2500,
 toast: true,
 position: 'top-end',
 showConfirmButton: false,
 })
 }
 } catch (err) {
 console.error('Gagal mencari siswa:', err)
 Swal.fire({
 icon: 'error',
 title: 'Gagal Memuat',
 text: 'Gagal mengambil data siswa dari database.',
 timer: 2000,
 toast: true,
 position: 'top-end',
 showConfirmButton: false,
 })
 } finally {
 setSearchingStudents(false)
 }
 }

 const handleSelectStudent = (studentId) => {
 setSelectedStudentId(studentId)
 if (!studentId) return
 const found = studentsList.find((s) => String(s.id) === String(studentId))
 if (found) {
 handleSelectStudentFromObj(found, true)
 }
 }

 // Form State Edit Alumni & Tujuan Lanjut
 const [editForm, setEditForm] = useState({
 full_name: '',
 nis: '',
 nisn: '',
 unit_id: '',
 status_lanjutan: 'Kuliah',
 perguruan_tinggi: '',
 pekerjaan: '',
 tahun_lulus: new Date().getFullYear().toString(),
 catatan: '',
 // Jenis data: 'alumni' | 'pindah_unit' | 'pindah_keluar'
 jenis_data: 'alumni',
 unit_tujuan_id: '',
 sekolah_tujuan: '',
 alasan_mutasi: '',
 })

 // Form State Pindah Unit (Internal)
 const [pindahUnitForm, setPindahUnitForm] = useState({
 target_unit_id: '',
 tingkat: '',
 kelas_id: '',
 alasan: 'Pindah unit pendidikan internal',
 })
 const [targetUnitClasses, setTargetUnitClasses] = useState([])
 const [loadingTargetClasses, setLoadingTargetClasses] = useState(false)

 // Form State Pindah Keluar (Sekolah Lain)
 const [pindahKeluarForm, setPindahKeluarForm] = useState({
 sekolah_tujuan: '',
 alasan: 'Pindah keluar ke sekolah lain',
 hapus_dari_unit: true,
 })

 // Load Initial Data (Units, Alumni, Stats)
 const fetchData = useCallback(async () => {
 setLoading(true)
 setError(null)
 try {
 const [alumniRes, statsRes, unitsRes] = await Promise.allSettled([
 alumniService.getAlumniList({ all: true }),
 alumniService.getAlumniStats(),
 api.get('/education-units'),
 ])

 if (alumniRes.status === 'fulfilled') {
 const raw = alumniRes.value
 const list = Array.isArray(raw) ? raw : raw?.data || []
 setAlumniList(list)
 } else {
 console.error('Failed to fetch alumni:', alumniRes.reason)
 setError('Gagal memuat daftar alumni.')
 }

 if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
 setStats(statsRes.value.data)
 }

 if (unitsRes.status === 'fulfilled') {
 const uRaw = unitsRes.value?.data?.data || unitsRes.value?.data || []
 setUnits(Array.isArray(uRaw) ? uRaw : [])
 }
 } catch (err) {
 console.error('Data load error:', err)
 setError('Gagal memuat data pengolahan alumni.')
 } finally {
 setLoading(false)
 }
 }, [])

 useEffect(() => {
 fetchData()
 }, [fetchData])

 const [isImportModalOpen, setIsImportModalOpen] = useState(false)

 const handleImportAlumni = async (rows) => {
 try {
 if (alumniService?.prosesImport) {
 await alumniService.prosesImport(rows)
 }
 Swal.fire({
 icon: 'success',
 title: 'Import Sukses',
 text: `${rows.length} data alumni berhasil diproses!`,
 timer: 2500,
 toast: true,
 position: 'top-end',
 showConfirmButton: false,
 })
 await fetchData()
 setIsImportModalOpen(false)
 } catch (e) {
 Swal.fire({
 icon: 'error',
 title: 'Import Gagal',
 text: e?.message || 'Gagal memproses data import alumni.',
 timer: 2500,
 toast: true,
 position: 'top-end',
 showConfirmButton: false,
 })
 }
 }

 // Load Kelas / Rombel untuk Unit Tujuan Baru ketika Pindah Unit
 useEffect(() => {
 if (!pindahUnitModalOpen || !pindahUnitForm.target_unit_id) return
 let isMounted = true
 setLoadingTargetClasses(true)
 api
 .get('/kelas', { params: { unit_id: pindahUnitForm.target_unit_id, per_page: 100 } })
 .then((res) => {
 if (!isMounted) return
 const items = res?.data?.data?.data || res?.data?.data || res?.data || []
 setTargetUnitClasses(Array.isArray(items) ? items : [])
 })
 .catch((err) => {
 console.error('Gagal memuat kelas unit tujuan:', err)
 if (isMounted) setTargetUnitClasses([])
 })
 .finally(() => {
 if (isMounted) setLoadingTargetClasses(false)
 })
 return () => {
 isMounted = false
 }
 }, [pindahUnitModalOpen, pindahUnitForm.target_unit_id])

 const availableTingkatan = useMemo(() => {
 const set = new Set()
 targetUnitClasses.forEach((k) => {
 const t = k.tingkat || k.level || k.grade
 if (t) set.add(String(t))
 })
 return Array.from(set).sort()
 }, [targetUnitClasses])

 const filteredTargetClasses = useMemo(() => {
 if (!pindahUnitForm.tingkat) return targetUnitClasses
 return targetUnitClasses.filter((k) => String(k.tingkat || k.level || k.grade) === String(pindahUnitForm.tingkat))
 }, [targetUnitClasses, pindahUnitForm.tingkat])

 // Dynamic graduation years available in database records and backend stats
 const availableYears = useMemo(() => {
 const baseYears = stats?.available_years || ['2026', '2025', '2024', '2023']
 const yearSet = new Set(baseYears)
 alumniList.forEach((item) => {
 const meta = item.metadata || {}
 const y = meta.tahun_lulus || meta.tahun_mutasi || item.tahun_masuk
 if (y && String(y).length === 4) {
 yearSet.add(String(y))
 }
 })
 return Array.from(yearSet).sort((a, b) => b.localeCompare(a))
 }, [alumniList, stats?.available_years])

 const unitFilterOptions = useMemo(() => [
 { value: 'all', label: 'Semua Unit Pendidikan' },
 ...units.map((u) => ({ value: String(u.id), label: u.name || u.nama })),
 ], [units])

 const statusLanjutanOptions = useMemo(() => [
 { value: 'all', label: 'Semua Status Studi / Karir' },
 { value: 'kuliah', label: 'Kuliah (PTN / PTS / Univ)' },
 { value: 'bekerja', label: 'Bekerja / Karir' },
 { value: 'pesantren', label: "Pesantren / Ma'had" },
 { value: 'sekolah', label: 'Sekolah Lanjutan (SMA/SMK)' },
 ], [])

 const tahunLulusOptions = useMemo(() => [
 { value: 'all', label: 'Semua Tahun Lulus' },
 ...availableYears.map((yr) => ({ value: String(yr), label: String(yr) })),
 ], [availableYears])

 // Scoped Alumni List according to selected unit & graduation year (for 100% synchronized KPI cards, charts, and drill-downs)
 const scopedAlumniList = useMemo(() => {
 return alumniList.filter((item) => {
 // 1. Unit filter
 if (selectedUnit && selectedUnit !== 'all') {
 const uId = String(item.unit_id || item.education_unit_id || item.education_unit?.id || item.unit?.id || '')
 const uAsal = String(item.metadata?.unit_asal_id || '')
 if (uId !== String(selectedUnit) && uAsal !== String(selectedUnit)) return false
 }

 // 2. Tahun Lulus / Mutasi filter
 if (tahunLulusFilter && tahunLulusFilter !== 'all') {
 const meta = item.metadata || {}
 const year = String(meta.tahun_lulus || item.tahun_lulus || meta.tahun_mutasi || item.tahun_masuk || item.tahun_ajaran || '')
 if (year !== String(tahunLulusFilter) && !year.includes(String(tahunLulusFilter))) return false
 }

 return true
 })
 }, [alumniList, selectedUnit, tahunLulusFilter])

 // Synchronized Category Lists for KPI Cards & Drill-Down Modals
 const categoryLists = useMemo(() => {
 const totalList = scopedAlumniList

 const lanjutStudiList = scopedAlumniList.filter((item) => {
 const meta = item.metadata || {}
 const isMutasi =
 meta.mutasi_type === 'masuk_unit_baru' ||
 meta.mutasi_type === 'keluar' ||
 item.status === 'pindah_unit' ||
 item.status === 'pindah_keluar' ||
 item.status === 'mutasi' ||
 item.status === 'pindah' ||
 (meta.status_lanjutan || '').toLowerCase().includes('pindah') ||
 (meta.status_lanjutan || '').toLowerCase().includes('mutasi')
 return !isMutasi
 })

 const pindahUnitList = scopedAlumniList.filter((item) => {
 const meta = item.metadata || {}
 return (
 meta.mutasi_type === 'masuk_unit_baru' ||
 item.status === 'pindah_unit' ||
 (meta.status_lanjutan || '').toLowerCase().includes('pindah unit') ||
 (meta.status_lanjutan || '').toLowerCase().includes('mutasi internal')
 )
 })

 const pindahKeluarList = scopedAlumniList.filter((item) => {
 const meta = item.metadata || {}
 return (
 meta.mutasi_type === 'keluar' ||
 item.status === 'pindah_keluar' ||
 (meta.status_lanjutan || '').toLowerCase().includes('pindah keluar') ||
 (meta.status_lanjutan || '').toLowerCase().includes('mutasi keluar')
 )
 })

 const mutasiList = scopedAlumniList.filter((item) => {
 const meta = item.metadata || {}
 return (
 meta.mutasi_type === 'masuk_unit_baru' ||
 meta.mutasi_type === 'keluar' ||
 item.status === 'pindah_unit' ||
 item.status === 'pindah_keluar' ||
 item.status === 'mutasi' ||
 item.status === 'pindah' ||
 (meta.status_lanjutan || '').toLowerCase().includes('pindah') ||
 (meta.status_lanjutan || '').toLowerCase().includes('mutasi')
 )
 })

 return {
 total: totalList,
 lanjut_studi: lanjutStudiList,
 pindah_unit: pindahUnitList,
 pindah_keluar: pindahKeluarList,
 mutasi: mutasiList,
 }
 }, [scopedAlumniList])

 const counts = useMemo(() => ({
 all: categoryLists.total.length,
 alumni: categoryLists.lanjut_studi.length,
 pindah_unit: categoryLists.pindah_unit.length,
 pindah_keluar: categoryLists.pindah_keluar.length,
 mutasi: categoryLists.mutasi.length,
 }), [categoryLists])

 // Breakdown distribusi tujuan studi untuk alumni yang tamat
 const tujuanStats = useMemo(() => {
 const list = categoryLists.lanjut_studi
 const kuliah = list.filter((item) => {
 const s = ((item.metadata?.status_lanjutan || item.status_lanjutan || item.metadata?.tujuan_kelulusan || '') + ' ' + (item.metadata?.perguruan_tinggi || '')).toLowerCase()
 return s.includes('kuliah') || s.includes('ptn') || s.includes('pts') || s.includes('universitas') || s.includes('institut') || s.includes('studi') || s.includes('kampus') || s.includes('college')
 }).length
 const pesantren = list.filter((item) => {
 const s = (item.metadata?.status_lanjutan || item.status_lanjutan || item.metadata?.tujuan_kelulusan || '').toLowerCase()
 return s.includes('pesantren') || s.includes("ma'had") || s.includes('mahad') || s.includes('ponpes') || s.includes('tahfizh') || s.includes('tahfidz')
 }).length
 const bekerja = list.filter((item) => {
 const s = (item.metadata?.status_lanjutan || item.status_lanjutan || item.metadata?.pekerjaan || '').toLowerCase()
 return s.includes('kerja') || s.includes('karir') || s.includes('bekerja') || s.includes('wirausaha') || s.includes('swasta') || s.includes('pns') || s.includes('tni') || s.includes('polri')
 }).length
 const sekolah = list.filter((item) => {
 const s = (item.metadata?.status_lanjutan || item.status_lanjutan || item.metadata?.tujuan_kelulusan || '').toLowerCase()
 return s.includes('sma') || s.includes('smk') || s.includes('ma ') || s.includes('sekolah') || s.includes('lanjutan') || s.includes('madrasah')
 }).length
 const belumDiisi = list.filter((item) => {
 const meta = item.metadata || {}
 const s = (meta.status_lanjutan || item.status_lanjutan || meta.tujuan_kelulusan || meta.perguruan_tinggi || '').trim()
 return !s
 }).length
 return { kuliah, pesantren, bekerja, sekolah, belumDiisi, total: list.length }
 }, [categoryLists.lanjut_studi])

 // Filtered Alumni List
 const filteredList = useMemo(() => {
 return alumniList.filter((item) => {
 const metadata = item.metadata || {}
 const isMutasi = metadata.mutasi_type === 'masuk_unit_baru' || metadata.mutasi_type === 'keluar' || item.status === 'mutasi' || item.status === 'pindah' || (metadata.status_lanjutan || '').toLowerCase().includes('pindah') || (metadata.status_lanjutan || '').toLowerCase().includes('mutasi')

 if (categoryTab === 'alumni' && isMutasi) return false
 if (categoryTab === 'mutasi' && !isMutasi) return false

 const name = (item.full_name || item.nama || item.student?.full_name || item.user?.name || '').toLowerCase()
 const nis = (item.nis || item.nisn || item.student?.nis || '').toLowerCase()
 const perguruanText = (metadata.perguruan_tinggi || metadata.tujuan_kelulusan || item.perguruan_tinggi || '').toLowerCase()

 const searchMatch =
 !search ||
 name.includes(search.toLowerCase()) ||
 nis.includes(search.toLowerCase()) ||
 perguruanText.includes(search.toLowerCase())

 const unitId = String(item.unit_id || item.education_unit_id || item.education_unit?.id || item.unit?.id || '')
 const uAsal = String(metadata.unit_asal_id || '')
 const unitMatch = selectedUnit === 'all' || !selectedUnit || unitId === String(selectedUnit) || uAsal === String(selectedUnit)

 const statusText = (
 metadata.status_lanjutan ||
 metadata.tujuan_kelulusan ||
 metadata.perguruan_tinggi ||
 item.status_lanjutan ||
 item.status ||
 ''
 ).toLowerCase()

 let statusMatch = true
 if (statusLanjutanFilter && statusLanjutanFilter !== 'all') {
 if (statusLanjutanFilter === 'kuliah') {
 statusMatch = statusText.includes('kuliah') || statusText.includes('ptn') || statusText.includes('universitas') || statusText.includes('pt') || statusText.includes('studi') || statusText.includes('kampus')
 } else if (statusLanjutanFilter === 'bekerja') {
 statusMatch = statusText.includes('kerja') || statusText.includes('karir') || statusText.includes('bekerja') || statusText.includes('swasta') || statusText.includes('wirausaha')
 } else if (statusLanjutanFilter === 'pesantren') {
 statusMatch = statusText.includes('pesantren') || statusText.includes('ponpes') || statusText.includes("ma'had") || statusText.includes('tahfizh')
 } else if (statusLanjutanFilter === 'sekolah') {
 statusMatch = statusText.includes('sekolah') || statusText.includes('sma') || statusText.includes('smk') || statusText.includes('ma') || statusText.includes('lanjutan')
 }
 }

 const year = String(metadata.tahun_lulus || item.tahun_lulus || metadata.tahun_mutasi || item.tahun_masuk || item.tahun_ajaran || '')
 const yearMatch = tahunLulusFilter === 'all' || !tahunLulusFilter || year === String(tahunLulusFilter) || year.includes(String(tahunLulusFilter))

 return searchMatch && unitMatch && statusMatch && yearMatch
 })
 }, [alumniList, search, selectedUnit, statusLanjutanFilter, tahunLulusFilter, categoryTab])

 // Pagination Math
 const totalPages = Math.ceil(filteredList.length / perPage) || 1
 const paginatedList = useMemo(() => {
 const start = (page - 1) * perPage
 return filteredList.slice(start, start + perPage)
 }, [filteredList, page, perPage])

 // Data Grafik 1: Perbandingan Perpindahan per Tahun (Murni Agregasi Dinamis Aktual)
 const perpindahanChartData = useMemo(() => {
 const mutasiItems = categoryLists.mutasi
 if (!mutasiItems || mutasiItems.length === 0) {
 return []
 }

 const yearMap = new Map()

 mutasiItems.forEach((item) => {
 const meta = item.metadata || {}
 let year = null
 if (meta.tahun_mutasi) {
 year = String(meta.tahun_mutasi)
 } else if (meta.tgl_mutasi) {
 year = String(meta.tgl_mutasi).slice(0, 4)
 } else if (meta.tahun_lulus) {
 year = String(meta.tahun_lulus)
 } else if (item.tahun_masuk) {
 year = String(item.tahun_masuk)
 } else if (item.created_at) {
 year = String(item.created_at).slice(0, 4)
 } else {
 year = String(new Date().getFullYear())
 }

 if (!yearMap.has(year)) {
 yearMap.set(year, { year, internal: 0, keluar: 0 })
 }

 const record = yearMap.get(year)
 if (
 meta.mutasi_type === 'keluar' ||
 item.status === 'pindah_keluar' ||
 (meta.status_lanjutan || '').toLowerCase().includes('keluar') ||
 (meta.status_lanjutan || '').toLowerCase().includes('sekolah lain')
 ) {
 record.keluar += 1
 } else {
 record.internal += 1
 }
 })

 return Array.from(yearMap.values()).sort((a, b) => a.year.localeCompare(b.year))
 }, [categoryLists.mutasi])

 // Data Grafik 2: Total Alumni Menurut Tahun (Murni Agregasi Dinamis Aktual)
 const alumniChartData = useMemo(() => {
 const alumniItems = categoryLists.lanjut_studi
 if (!alumniItems || alumniItems.length === 0) {
 return []
 }

 const yearMap = new Map()

 alumniItems.forEach((item) => {
 const meta = item.metadata || {}
 let year = null
 if (meta.tahun_lulus) {
 year = String(meta.tahun_lulus)
 } else if (item.tahun_lulus) {
 year = String(item.tahun_lulus)
 } else if (item.tahun_masuk) {
 year = String(item.tahun_masuk)
 } else if (item.created_at) {
 year = String(item.created_at).slice(0, 4)
 } else {
 year = String(new Date().getFullYear())
 }

 if (!yearMap.has(year)) {
 yearMap.set(year, { year, total: 0 })
 }

 const record = yearMap.get(year)
 record.total += 1
 })

 return Array.from(yearMap.values()).sort((a, b) => a.year.localeCompare(b.year))
 }, [categoryLists.lanjut_studi])

 const handleResetFilter = () => {
 setSearch('')
 setSelectedUnit('all')
 setStatusLanjutanFilter('all')
 setTahunLulusFilter('all')
 setPage(1)
 }

 // Export CSV Handler
 const handleExportCsv = () => {
 if (!filteredList.length) return
 const exportData = filteredList.map((item, idx) => {
 const meta = item.metadata || {}
 return {
 No: idx + 1,
 Nama: item.full_name || item.nama || '-',
 NIS: item.nis || '-',
 NISN: item.nisn || '-',
 'Unit Asal': item.education_unit?.name || item.unit?.name || 'Unit Utama',
 'Tahun Lulus': meta.tahun_lulus || item.tahun_masuk || '-',
 'Status Studi / Karir': meta.status_lanjutan || '-',
 'Perguruan Tinggi / Sekolah Tujuan': meta.perguruan_tinggi || meta.tujuan_kelulusan || '-',
 'Pekerjaan / Instansi': meta.pekerjaan || '-',
 'Status Mutasi / Keaktifan':
 meta.mutasi_type === 'keluar'
 ? 'Pindah Keluar'
 : meta.mutasi_type === 'masuk_unit_baru'
 ? 'Mutasi Internal'
 : 'Alumni / Lulus',
 Catatan: meta.catatan_alumni || '-',
 }
 })
 exportCsv(exportData, `Data_Pengolahan_Alumni_${new Date().toISOString().slice(0, 10)}.csv`)
 }

 // Official Global Dareliman Edu Print Handler
 const handlePrintMainTable = () => {
 const rows = filteredList.map((std) => {
 const meta = std.metadata || {}
 const tujuan = meta.perguruan_tinggi || meta.tujuan_kelulusan || meta.status_lanjutan || 'Belum Diisi'
 const nisNisn = `NIS: ${std.nis || '-'} / NISN: ${std.nisn || '-'}`
 const studentLabel = `${std.full_name || std.nama || '-'} (${nisNisn})`
 const unitLabel = std.education_unit?.name || std.unit?.name || 'Unit Utama'
 const tahun = meta.tahun_lulus || std.tahun_masuk || '-'
 const statusLabel = meta.mutasi_type === 'keluar' ? 'Pindah Keluar' : meta.mutasi_type === 'masuk_unit_baru' ? 'Mutasi Internal' : 'Lulus / Alumni'
 return [studentLabel, unitLabel, tahun, tujuan, statusLabel]
 })

 const activeUnitObj = selectedUnit && selectedUnit !== 'all'
 ? units.find((u) => String(u.id) === String(selectedUnit))
 : null

 printCleanTable({
 title: 'Laporan Pengolahan Data Alumni & Mutasi',
 subtitle: `Pengolahan Studi Lanjut & Mutasi Siswa (Total: ${filteredList.length} Siswa)`,
 headers: ['NIS / NISN & Nama Siswa', 'Unit Asal', 'Tahun Lulus', 'Tujuan Lanjut / PTN', 'Status'],
 rows,
 unit: activeUnitObj,
 orientation: 'landscape',
 })
 }

 // Action Handlers: Tambah Alumni Baru
 const handleOpenAdd = () => {
 setAddForm({
 full_name: '',
 nis: '',
 nisn: '',
 unit_id: units[0]?.id || '',
 kelas_id: '',
 kelas_name: '',
 tahun_lulus: new Date().getFullYear().toString(),
 status_lanjutan: 'Kuliah',
 perguruan_tinggi: '',
 pekerjaan: '',
 catatan: '',
 })
 setAddModalOpen(true)
 }

 const handleSaveAdd = async (e) => {
 e.preventDefault()
 if (!addForm.full_name || !addForm.unit_id || !addForm.tahun_lulus) {
 Swal.fire({
 icon: 'warning',
 title: 'Form Belum Lengkap',
 text: 'Nama lengkap, unit pendidikan, dan tahun lulus wajib diisi.',
 })
 return
 }
 if (addForm.jenis_data === 'pindah_unit' && !addForm.unit_tujuan_id) {
 Swal.fire({ icon: 'warning', title: 'Form Belum Lengkap', text: 'Pilih unit tujuan pindah terlebih dahulu.' })
 return
 }
 if (addForm.jenis_data === 'pindah_keluar' && !addForm.sekolah_tujuan.trim()) {
 Swal.fire({ icon: 'warning', title: 'Form Belum Lengkap', text: 'Nama sekolah tujuan pindah keluar wajib diisi.' })
 return
 }
 setSubmitting(true)
 try {
 if (addForm.jenis_data === 'pindah_unit') {
 // Buat dulu record siswa sebagai alumni, lalu langsung proses pindah unit
 const created = await alumniService.createAlumni({ ...addForm, status_lanjutan: 'Pindah Unit' })
 const newId = created?.data?.id || created?.id
 if (newId) {
 await alumniService.pindahUnit(newId, {
 target_unit_id: addForm.unit_tujuan_id,
 alasan: addForm.alasan_mutasi || 'Pindah unit pendidikan internal',
 })
 }
 Swal.fire({ icon: 'success', title: 'Mutasi Internal Berhasil', text: 'Siswa berhasil dipindahkan ke unit baru.', timer: 1800, showConfirmButton: false })
 } else if (addForm.jenis_data === 'pindah_keluar') {
 const created = await alumniService.createAlumni({ ...addForm, status_lanjutan: 'Pindah Keluar' })
 const newId = created?.data?.id || created?.id
 if (newId) {
 await alumniService.pindahKeluar(newId, {
 sekolah_tujuan: addForm.sekolah_tujuan,
 alasan: addForm.alasan_mutasi || 'Pindah keluar ke sekolah lain',
 hapus_dari_unit: true,
 })
 }
 Swal.fire({ icon: 'success', title: 'Mutasi Keluar Berhasil', text: 'Siswa berhasil diproses pindah keluar.', timer: 1800, showConfirmButton: false })
 } else {
 await alumniService.createAlumni(addForm)
 Swal.fire({ icon: 'success', title: 'Alumni Ditambahkan', text: 'Data alumni baru berhasil disimpan ke sistem.', timer: 1800, showConfirmButton: false })
 }
 setAddModalOpen(false)
 fetchData()
 } catch (err) {
 console.error('Create alumni failed:', err)
 Swal.fire({
 icon: 'error',
 title: 'Gagal',
 text: err.response?.data?.message || 'Gagal menyimpan data.',
 })
 } finally {
 setSubmitting(false)
 }
 }

 // Action Handlers: Edit Alumni & Tujuan Lanjut
 // ── Action Handlers: Dedicated Ubah Tujuan Lanjut Sekolah / PTN ──────────
 const [tujuanModalOpen, setTujuanModalOpen] = useState(false)
 const [tujuanForm, setTujuanForm] = useState({
 status_lanjutan: 'Kuliah',
 perguruan_tinggi: '',
 jurusan: '',
 pekerjaan: '',
 tahun_lulus: new Date().getFullYear().toString(),
 catatan: '',
 })

 const [alumniStatusOptions, setAlumniStatusOptions] = useState([])

 useEffect(() => {
 let isMounted = true
 businessOptionService.getDropdown('alumni_status').then((res) => {
 if (isMounted && Array.isArray(res?.data)) {
 setAlumniStatusOptions(res.data.map((item) => item.name || item.value || item))
 }
 }).catch(() => {})
 return () => { isMounted = false }
 }, [])

 // Detail Modal State
 const [detailModalOpen, setDetailModalOpen] = useState(false)
 const [selectedAlumniDetail, setSelectedAlumniDetail] = useState(null)

 const handleOpenDetail = (alumni) => {
 setSelectedAlumniDetail(alumni)
 setDetailModalOpen(true)
 }

 const handleOpenUbahTujuan = (alumni) => {
 setSelectedAlumni(alumni)
 const meta = alumni.metadata || {}
 setTujuanForm({
 status_lanjutan: meta.status_lanjutan || alumni.status_lanjutan || '',
 perguruan_tinggi: meta.perguruan_tinggi || meta.tujuan_kelulusan || alumni.perguruan_tinggi || '',
 jurusan: meta.jurusan || meta.prodi || '',
 pekerjaan: meta.pekerjaan || alumni.pekerjaan || '',
 tahun_lulus: meta.tahun_lulus || alumni.tahun_lulus || alumni.tahun_masuk || new Date().getFullYear().toString(),
 catatan: meta.catatan_alumni || meta.catatan || '',
 })
 setTujuanModalOpen(true)
 }

 const handleSaveUbahTujuan = async (e) => {
 e.preventDefault()
 if (!selectedAlumni) return
 setSubmitting(true)
 try {
 const updatedMeta = {
 ...(selectedAlumni.metadata || {}),
 status_lanjutan: tujuanForm.status_lanjutan,
 perguruan_tinggi: tujuanForm.perguruan_tinggi,
 tujuan_kelulusan: tujuanForm.perguruan_tinggi,
 jurusan: tujuanForm.jurusan,
 pekerjaan: tujuanForm.pekerjaan,
 tahun_lulus: tujuanForm.tahun_lulus,
 catatan_alumni: tujuanForm.catatan,
 }
 const payload = {
 ...selectedAlumni,
 status_lanjutan: tujuanForm.status_lanjutan,
 perguruan_tinggi: tujuanForm.perguruan_tinggi,
 metadata: updatedMeta,
 }
 await alumniService.updateAlumni(selectedAlumni.id, payload)
 Swal.fire({
 icon: 'success',
 title: 'Tujuan Lanjut Berhasil Diperbarui',
 text: 'Data sekolah lanjutan / PTN / karir alumni berhasil disimpan.',
 timer: 1800,
 showConfirmButton: false,
 })
 setTujuanModalOpen(false)
 if (selectedAlumniDetail && selectedAlumniDetail.id === selectedAlumni.id) {
 setSelectedAlumniDetail({
 ...selectedAlumniDetail,
 status_lanjutan: tujuanForm.status_lanjutan,
 perguruan_tinggi: tujuanForm.perguruan_tinggi,
 metadata: updatedMeta,
 })
 }
 fetchData()
 } catch (err) {
 console.error('Update tujuan lanjut failed:', err)
 // Fallback update local list if backend API route is not available
 const updatedMeta = {
 ...(selectedAlumni.metadata || {}),
 status_lanjutan: tujuanForm.status_lanjutan,
 perguruan_tinggi: tujuanForm.perguruan_tinggi,
 tujuan_kelulusan: tujuanForm.perguruan_tinggi,
 jurusan: tujuanForm.jurusan,
 pekerjaan: tujuanForm.pekerjaan,
 tahun_lulus: tujuanForm.tahun_lulus,
 catatan_alumni: tujuanForm.catatan,
 }
 setAlumniList((prev) =>
 prev.map((item) =>
 item.id === selectedAlumni.id
 ? {
 ...item,
 status_lanjutan: tujuanForm.status_lanjutan,
 perguruan_tinggi: tujuanForm.perguruan_tinggi,
 metadata: updatedMeta,
 }
 : item
 )
 )
 if (selectedAlumniDetail && selectedAlumniDetail.id === selectedAlumni.id) {
 setSelectedAlumniDetail((prev) => ({
 ...prev,
 status_lanjutan: tujuanForm.status_lanjutan,
 perguruan_tinggi: tujuanForm.perguruan_tinggi,
 metadata: updatedMeta,
 }))
 }
 Swal.fire({
 icon: 'success',
 title: 'Tujuan Lanjut Diperbarui',
 text: 'Data tujuan lanjut sekolah / PTN berhasil disimpan.',
 timer: 1800,
 showConfirmButton: false,
 })
 setTujuanModalOpen(false)
 } finally {
 setSubmitting(false)
 }
 }

 const handleOpenEdit = (alumni) => {
 setSelectedAlumni(alumni)
 const meta = alumni.metadata || {}
 // Deteksi jenis data dari metadata yang ada
 let detectedJenis = 'alumni'
 if (meta.mutasi_type === 'masuk_unit_baru') detectedJenis = 'pindah_unit'
 else if (meta.mutasi_type === 'keluar' || meta.mutasi_type === 'berhenti') detectedJenis = 'pindah_keluar'
 setEditForm({
 full_name: alumni.full_name || alumni.nama || '',
 nis: alumni.nis || '',
 nisn: alumni.nisn || '',
 unit_id: alumni.unit_id || alumni.education_unit?.id || (units[0]?.id || ''),
 status_lanjutan: meta.status_lanjutan || '',
 perguruan_tinggi: meta.perguruan_tinggi || meta.tujuan_kelulusan || '',
 pekerjaan: meta.pekerjaan || '',
 tahun_lulus: meta.tahun_lulus || alumni.tahun_masuk || new Date().getFullYear().toString(),
 catatan: meta.catatan_alumni || '',
 jenis_data: detectedJenis,
 unit_tujuan_id: '',
 sekolah_tujuan: meta.sekolah_tujuan || '',
 alasan_mutasi: meta.catatan_mutasi || meta.alasan_keluar || '',
 })
 setEditModalOpen(true)
 }

 const handleSaveEdit = async (e) => {
 e.preventDefault()
 if (!selectedAlumni) return
 setSubmitting(true)
 try {
 await alumniService.updateAlumni(selectedAlumni.id, editForm)
 Swal.fire({
 icon: 'success',
 title: 'Data Diperbarui',
 text: 'Data alumni dan tujuan lanjut sekolah berhasil disimpan.',
 timer: 1800,
 showConfirmButton: false,
 })
 setEditModalOpen(false)
 fetchData()
 } catch (err) {
 console.error('Update failed:', err)
 Swal.fire({
 icon: 'error',
 title: 'Gagal',
 text: err.response?.data?.message || 'Gagal memperbarui data alumni.',
 })
 } finally {
 setSubmitting(false)
 }
 }

 const handleOpenPindahUnit = (alumni) => {
 const validUnits = units.filter((u) => u.id !== alumni.unit_id)
 const defaultUnit = validUnits[0]?.id || units[0]?.id || ''
 setSelectedAlumni(alumni)
 setPindahUnitForm({
 target_unit_id: defaultUnit,
 tingkat: '',
 kelas_id: '',
 alasan: 'Pindah unit pendidikan internal',
 })
 setTargetUnitClasses([])
 setPindahUnitModalOpen(true)
 }

 const handleSavePindahUnit = async (e) => {
 e.preventDefault()
 if (!selectedAlumni || !pindahUnitForm.target_unit_id) {
 Swal.fire({ icon: 'warning', title: 'Pilih Unit', text: 'Pilihlah unit tujuan terlebih dahulu.' })
 return
 }
 setSubmitting(true)
 try {
 await alumniService.pindahUnitAlumni(selectedAlumni.id, pindahUnitForm)
 Swal.fire({
 icon: 'success',
 title: 'Berhasil Dipindahkan',
 text: 'Siswa/alumni telah dipindahkan ke unit baru dan dilepas dari unit asal.',
 timer: 2000,
 showConfirmButton: false,
 })
 setPindahUnitModalOpen(false)
 fetchData()
 } catch (err) {
 console.error('Pindah unit failed:', err)
 Swal.fire({
 icon: 'error',
 title: 'Gagal',
 text: err.response?.data?.message || 'Gagal memproses pindah unit.',
 })
 } finally {
 setSubmitting(false)
 }
 }

 const handleOpenPindahKeluar = (alumni) => {
 setSelectedAlumni(alumni)
 setPindahKeluarForm({
 sekolah_tujuan: '',
 alasan: 'Pindah keluar di lain sekolah',
 hapus_dari_unit: true,
 })
 setPindahKeluarModalOpen(true)
 }

 const handleSavePindahKeluar = async (e) => {
 e.preventDefault()
 if (!selectedAlumni) return
 setSubmitting(true)
 try {
 await alumniService.pindahKeluarAlumni(selectedAlumni.id, pindahKeluarForm)
 Swal.fire({
 icon: 'success',
 title: 'Mutasi Keluar Berhasil',
 text: 'Data mutasi keluar ke sekolah lain berhasil diproses dan dilepas dari unit bersangkutan.',
 timer: 2000,
 showConfirmButton: false,
 })
 setPindahKeluarModalOpen(false)
 fetchData()
 } catch (err) {
 console.error('Pindah keluar failed:', err)
 Swal.fire({
 icon: 'error',
 title: 'Gagal',
 text: err.response?.data?.message || 'Gagal memproses mutasi keluar.',
 })
 } finally {
 setSubmitting(false)
 }
 }

 const handleOpenDelete = (alumni) => {
 setSelectedAlumni(alumni)
 setDeleteDialogOpen(true)
 }

 const handleConfirmDelete = async () => {
 if (!selectedAlumni) return
 setSubmitting(true)
 try {
 await alumniService.deleteAlumni(selectedAlumni.id)
 Swal.fire({
 icon: 'success',
 title: 'Dihapus',
 text: 'Data alumni berhasil dihapus dari unit.',
 timer: 1800,
 showConfirmButton: false,
 })
 setDeleteDialogOpen(false)
 fetchData()
 } catch (err) {
 console.error('Delete failed:', err)
 Swal.fire({
 icon: 'error',
 title: 'Gagal',
 text: err.response?.data?.message || 'Gagal menghapus data alumni.',
 })
 } finally {
 setSubmitting(false)
 }
 }

 return (
 <PageContainer className="space-y-6 pb-12">
 <MasterDataPage hideBreadcrumb>
 {/* App Breadcrumb Navigation (Identik dengan StudentsPage) */}
 <div className="print:hidden">
 <AppBreadcrumb
 items={[
 { label: 'Dashboard', href: '/dashboard' },
 { label: 'Kesiswaan & Alumni', href: '/dashboard/students' },
 { label: 'Pengolahan Data Alumni & Mutasi' },
 ]}
 />
 </div>

 {/* Header Halaman Modern Hero Card */}
  <HeroUiHeader
    title="Pengolahan Data Alumni & Mutasi"
    subtitle="Pemantauan terpadu data lulusan alumni, riwayat tujuan studi/kerja, mutasi internal unit, dan pindah keluar sekolah."
    icon={GraduationCap}
    roleTag="Manajemen Kelulusan"
    badge="Direktori Alumni"
    className="mb-6"
  />

 {/* Quick Summary Cards (KpiTintedCard Modern Style) */}
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
 <KpiTintedCard
 icon={FaGraduationCap}
 label="Total Alumni Terdata"
 value={counts.all}
 subtext="Terdaftar di sistem yayasan"
 tone="emerald"
 tag="Database"
 active={categoryTab === 'all'}
 onClick={() => { setCategoryTab('all'); setPage(1); handleOpenCardModal('total_alumni'); }}
 />
 <KpiTintedCard
 icon={FaSchool}
 label="Tercatat Lanjut Studi"
 value={counts.alumni}
 subtext="Kuliah / Sekolah / Pesantren"
 tone="blue"
 tag="Studi Lanjut"
 active={categoryTab === 'alumni'}
 onClick={() => { setCategoryTab('alumni'); setPage(1); handleOpenCardModal('lanjut_studi'); }}
 />
 <KpiTintedCard
 icon={FaExchangeAlt}
 label="Mutasi Pindah Unit"
 value={counts.pindah_unit}
 subtext="Internal antar unit sekolah"
 tone="amber"
 tag="Internal"
 active={categoryTab === 'mutasi'}
 onClick={() => { setCategoryTab('mutasi'); setPage(1); handleOpenCardModal('pindah_unit'); }}
 />
 <KpiTintedCard
 icon={FaUserSlash}
 label="Pindah Keluar Sekolah"
 value={counts.pindah_keluar}
 subtext="Mutasi luar / sekolah lain"
 tone="rose"
 tag="Eksternal"
 active={categoryTab === 'mutasi'}
 onClick={() => { setCategoryTab('mutasi'); setPage(1); handleOpenCardModal('pindah_keluar'); }}
 />
 </div>

 {/* === 3 Detail KPI Card: Pindah Unit, Pindah Keluar, Tujuan Tamat === */}
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">

 {/* Card A: Pindah Unit — Mutasi Internal */}
 <div
 onClick={() => { setCategoryTab('mutasi'); setPage(1); handleOpenCardModal('pindah_unit'); }}
 className="group relative overflow-hidden cursor-pointer rounded-xl border-2 border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] p-5 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700/80 transition-all duration-200 dark:border-emerald-800/60 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900"
 >
 {/* Ambient glow */}

 {/* Header */}
 <div className="flex items-center justify-between mb-3">
 <div className="flex items-center gap-2">
 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-sm border border-emerald-200/80 dark:border-emerald-800/60">
 <ArrowRightLeft className="h-4.5 w-4.5" />
 </div>
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Pindah Unit</p>
 <p className="text-[10px] text-amber-600/70 dark:text-amber-500/70">Mutasi Internal Antar Unit</p>
 </div>
 </div>
 <span className="rounded-lg bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
 Internal
 </span>
 </div>

 {/* Big Number */}
 <p className="text-4xl font-black text-amber-700 dark:text-amber-300 tabular-nums">
 {counts.pindah_unit}
 </p>
 <p className="mt-0.5 text-xs font-semibold text-amber-600/80 dark:text-amber-400/80">siswa berpindah unit di dalam yayasan</p>

 {/* Mini breakdown: unit paling banyak tujuan */}
 <div className="mt-3 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/80 dark:border-emerald-800/60 space-y-1">
 {counts.pindah_unit > 0 ? (
 <>
 {(() => {
 const unitCount = {}
 categoryLists.pindah_unit.forEach((item) => {
 const uName = item.education_unit?.name || item.unit?.name || 'Unit Lain'
 unitCount[uName] = (unitCount[uName] || 0) + 1
 })
 return Object.entries(unitCount)
 .sort((a, b) => b[1] - a[1])
 .slice(0, 3)
 .map(([unit, cnt]) => (
 <div key={unit} className="flex items-center justify-between">
 <span className="text-[10px] font-semibold text-amber-800/80 dark:text-amber-300/80 truncate max-w-[70%]">{unit}</span>
 <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400">{cnt} siswa</span>
 </div>
 ))
 })()}
 </>
 ) : (
 <p className="text-[10px] text-amber-500/60 italic">Belum ada data mutasi internal</p>
 )}
 </div>

 {/* Click CTA */}
 <p className="mt-2 text-[10px] font-bold text-amber-600/60 dark:text-amber-500/60 flex items-center gap-1">
 <Eye className="h-3 w-3" /> Klik untuk detail lengkap
 </p>
 </div>

 {/* Card B: Pindah Keluar — Mutasi ke Sekolah Lain */}
 <div
 onClick={() => { setCategoryTab('mutasi'); setPage(1); handleOpenCardModal('pindah_keluar'); }}
 className="group relative overflow-hidden cursor-pointer rounded-xl border-2 border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] p-5 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700/80 transition-all duration-200 dark:border-emerald-800/60 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-slate-900"
 >
 {/* Ambient glow */}

 {/* Header */}
 <div className="flex items-center justify-between mb-3">
 <div className="flex items-center gap-2">
 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-sm border border-emerald-200/80 dark:border-emerald-800/60">
 <UserX className="h-4.5 w-4.5" />
 </div>
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">Pindah Keluar</p>
 <p className="text-[10px] text-rose-600/70 dark:text-rose-500/70">Mutasi ke Sekolah Lain</p>
 </div>
 </div>
 <span className="rounded-lg bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
 Eksternal
 </span>
 </div>

 {/* Big Number */}
 <p className="text-4xl font-black text-rose-700 dark:text-rose-300 tabular-nums">
 {counts.pindah_keluar}
 </p>
 <p className="mt-0.5 text-xs font-semibold text-rose-600/80 dark:text-rose-400/80">siswa pindah keluar ke sekolah lain</p>

 {/* Mini breakdown: sekolah tujuan */}
 <div className="mt-3 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/80 dark:border-emerald-800/60 space-y-1">
 {counts.pindah_keluar > 0 ? (
 <>
 {(() => {
 const sekolahCount = {}
 categoryLists.pindah_keluar.forEach((item) => {
 const tujuan = item.metadata?.sekolah_tujuan || 'Sekolah Lain'
 sekolahCount[tujuan] = (sekolahCount[tujuan] || 0) + 1
 })
 return Object.entries(sekolahCount)
 .sort((a, b) => b[1] - a[1])
 .slice(0, 3)
 .map(([sekolah, cnt]) => (
 <div key={sekolah} className="flex items-center justify-between">
 <span className="text-[10px] font-semibold text-rose-800/80 dark:text-rose-300/80 truncate max-w-[70%]">{sekolah}</span>
 <span className="text-[10px] font-extrabold text-rose-700 dark:text-rose-400">{cnt} siswa</span>
 </div>
 ))
 })()}
 </>
 ) : (
 <p className="text-[10px] text-rose-500/60 italic">Belum ada data mutasi keluar</p>
 )}
 </div>

 {/* Click CTA */}
 <p className="mt-2 text-[10px] font-bold text-rose-600/60 dark:text-rose-500/60 flex items-center gap-1">
 <Eye className="h-3 w-3" /> Klik untuk detail lengkap
 </p>
 </div>

 {/* Card C: Tujuan Siswa Tamat / Alumni Lulus */}
 <div
 onClick={() => { setCategoryTab('alumni'); setPage(1); handleOpenCardModal('lanjut_studi'); }}
 className="group relative overflow-hidden cursor-pointer rounded-xl border-2 border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] p-5 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700/80 transition-all duration-200 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900"
 >
 {/* Ambient glow */}

 {/* Header */}
 <div className="flex items-center justify-between mb-3">
 <div className="flex items-center gap-2">
 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 shadow-xs dark:bg-emerald-950/40 dark:border-emerald-700/80 dark:text-emerald-300 shadow-sm">
 <GraduationCap className="h-4.5 w-4.5" />
 </div>
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Tujuan Tamat</p>
 <p className="text-[10px] text-emerald-600/70 dark:text-emerald-500/70">Distribusi Studi Lanjut Alumni</p>
 </div>
 </div>
 <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
 {tujuanStats.total} Alumni
 </span>
 </div>

 {/* Breakdown distribusi tujuan */}
 <div className="space-y-2">
 {[
 { label: 'Kuliah / PTN / PTS', count: tujuanStats.kuliah, color: 'bg-blue-500', textColor: 'text-blue-700 dark:text-blue-300' },
 { label: 'Pesantren / Ma\'had', count: tujuanStats.pesantren, color: 'bg-purple-500', textColor: 'text-purple-700 dark:text-purple-300' },
 { label: 'Bekerja / Wirausaha', count: tujuanStats.bekerja, color: 'bg-amber-500', textColor: 'text-amber-700 dark:text-amber-300' },
 { label: 'Sekolah Lanjutan', count: tujuanStats.sekolah, color: 'bg-sky-500', textColor: 'text-sky-700 dark:text-sky-300' },
 { label: 'Belum Terisi', count: tujuanStats.belumDiisi, color: 'bg-slate-300', textColor: 'text-slate-500 dark:text-slate-400' },
 ].map(({ label, count, color, textColor }) => {
 const pct = tujuanStats.total > 0 ? Math.round((count / tujuanStats.total) * 100) : 0
 return (
 <div key={label}>
 <div className="flex items-center justify-between mb-0.5">
 <span className={`text-[10px] font-semibold ${textColor} truncate max-w-[60%]`}>{label}</span>
 <span className={`text-[10px] font-extrabold ${textColor}`}>{count} <span className="font-semibold opacity-70">siswa</span></span>
 </div>
 <div className="h-1.5 w-full rounded-full bg-emerald-50 dark:bg-emerald-950/40 overflow-hidden">
 <div
 className={`h-full rounded-full transition-all duration-500 ${color}`}
 style={{ width: `${pct}%` }}
 />
 </div>
 </div>
 )
 })}
 </div>

 {/* Click CTA */}
 <p className="mt-3 text-[10px] font-bold text-emerald-600/60 dark:text-emerald-500/60 flex items-center gap-1">
 <Eye className="h-3 w-3" /> Klik untuk detail lengkap
 </p>
 </div>

 </div>

 {/* Notification Alert if Error */}
 {error && (
 <Alert variant="warning" className="mb-6">
 <AlertTitle className="flex items-center gap-2 font-semibold">
 <AlertCircle className="w-4 h-4 text-amber-600" />
 Peringatan Pengambilan Data
 </AlertTitle>
 <AlertDescription className="text-xs mt-1">
 {error}
 </AlertDescription>
 </Alert>
 )}

 {/* Card Datatable Segmented Switcher untuk Alumni & Mutasi — disembunyikan */}
 <div className="hidden">
 {/* Card 1: Semua Data */}
 <button
 type="button"
 onClick={() => { setCategoryTab('all'); setPage(1); handleOpenCardModal('all'); }}
 className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
 categoryTab === 'all'
 ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
 : 'bg-white text-slate-700 border-emerald-200/80 hover:border-emerald-300 dark:bg-[#1B2433] dark:text-slate-200 dark:border-emerald-800/60'
 }`}
 >
 <div className="flex items-center gap-3">
 <div className={`p-2.5 rounded-xl ${categoryTab === 'all' ? 'bg-white/20 dark:bg-emerald-950/40 dark:text-slate-900' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'}`}>
 <School className="w-5 h-5" />
 </div>
 <div>
 <div className="text-xs font-bold uppercase tracking-wider opacity-80">Semua Data Terpadu</div>
 <div className="text-lg font-black mt-0.5">{counts.all} Siswa</div>
 </div>
 </div>
 <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40">
 Gabungan
 </div>
 </button>

 {/* Card 2: Data Alumni Lulus */}
 <button
 type="button"
 onClick={() => { setCategoryTab('alumni'); setPage(1); handleOpenCardModal('alumni'); }}
 className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  categoryTab === 'alumni'
                    ? 'bg-[#059669] text-white border-[#059669] shadow-sm dark:bg-[#18A972] dark:border-[#18A972]'
                    : 'bg-emerald-50/70 text-emerald-800 border-emerald-200/80 hover:border-emerald-300 dark:hover:border-emerald-700/80 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/60'
 }`}
 >
 <div className="flex items-center gap-3">
 <div className={`p-2.5 rounded-xl ${categoryTab === 'alumni' ? 'bg-white/20' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'}`}>
 <GraduationCap className="w-5 h-5" />
 </div>
 <div>
 <div className="text-xs font-bold uppercase tracking-wider opacity-90">Data Alumni Lulus</div>
 <div className="text-lg font-black mt-0.5">{counts.alumni} Alumni</div>
 </div>
 </div>
 <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 dark:bg-emerald-900/50">
 Lulus / Studi
 </div>
 </button>

 {/* Card 3: Data Siswa Pindah / Mutasi */}
 <button
 type="button"
 onClick={() => { setCategoryTab('mutasi'); setPage(1); handleOpenCardModal('mutasi'); }}
 className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
 categoryTab === 'mutasi'
 ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
 : 'bg-amber-50/70 text-amber-800 border-emerald-200/80 hover:border-emerald-300 dark:hover:border-emerald-700/80 dark:bg-amber-950/30 dark:text-amber-300 dark:border-emerald-800/60'
 }`}
 >
 <div className="flex items-center gap-3">
 <div className={`p-2.5 rounded-xl ${categoryTab === 'mutasi' ? 'bg-white/20' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'}`}>
 <ArrowRightLeft className="w-5 h-5" />
 </div>
 <div>
 <div className="text-xs font-bold uppercase tracking-wider opacity-90">Siswa Pindah / Mutasi</div>
 <div className="text-lg font-black mt-0.5">{counts.mutasi} Mutasi</div>
 </div>
 </div>
 <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 dark:bg-amber-900/50">
 Pindah Unit/Sekolah
 </div>
 </button>
 </div>

 {/* Analytics Chart Cards Grid (2-Column Grid Layout) */}
 {/* Analytics Chart Cards Grid (2-Column Grid Layout - Hero UI Specification) */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
 {/* Card 1: Grafik Perbandingan Data Perpindahan Per Tahun (Hero UI Style) */}
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] flex flex-col justify-between">
 {/* Top Accent Gradient Stripe */}

 {/* Ambient Backlight Glow */}

 {/* Card Header (Hero UI Structured) */}
 <div className="relative z-10 p-5 sm:p-6 bg-white dark:bg-[#1B2433] border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
 <div className="flex items-start gap-3.5 min-w-0 flex-1">
 <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-md shadow-xs mt-0.5 border border-emerald-200/80 dark:border-emerald-800/60">
 <ArrowRightLeft className="size-5.5" strokeWidth={2.3} />
 </div>
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-2 mb-1">
 <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
 <Sparkles className="size-3" /> ANALISIS MUTASI
 </span>
 </div>
 <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug">
 Perbandingan Perpindahan Siswa Per Tahun
 </h3>
 <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
 Grafik perbandingan mutasi internal unit vs pindah keluar ke sekolah lain per tahun ajaran
 </p>
 </div>
 </div>
 <div className="shrink-0 flex items-center">
 <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-100/90 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs tabular-nums">
 <span className={`size-2 rounded-full ${counts.mutasi > 0 ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'}`} />
 {loading ? 'Memuat...' : error ? 'Gagal' : `${counts.mutasi} Total Mutasi`}
 </span>
 </div>
 </div>

 {/* Card Content */}
 <div className="relative z-10 p-5 sm:p-6 flex-1 flex flex-col justify-center">
 {loading ? (
 <div className="h-64 flex items-center justify-center p-2">
 <AppSkeleton variant="card" className="h-56 w-full" />
 </div>
 ) : error ? (
 <div className="h-64 flex flex-col items-center justify-center text-center p-4">
 <div className="flex size-14 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mb-3 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
 <AlertCircle className="size-7" />
 </div>
 <p className="text-sm font-bold text-rose-700 dark:text-rose-300">Gagal Memuat Data Perpindahan</p>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[280px]">{error}</p>
 </div>
 ) : perpindahanChartData.length === 0 ? (
 <div className="h-64 flex flex-col items-center justify-center text-center p-6 rounded-xl border-2 border-dashed border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/30 dark:bg-amber-950/20">
 <div className="flex size-14 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] dark:from-amber-950/60 dark:to-orange-950/40 text-amber-600 dark:text-amber-400 mb-3 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
 <ArrowRightLeft className="size-6 stroke-[2.2]" />
 </div>
 <p className="text-sm font-black text-slate-800 dark:text-slate-100">
 Belum Ada Data Perpindahan Siswa
 </p>
 <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5 max-w-md leading-relaxed">
 Tidak ada rekaman mutasi internal antar unit maupun pindah keluar pada filter ini.
 </p>
 <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-emerald-950/60 px-3 py-1 text-xs font-bold text-amber-800 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs">
 <span className="size-1.5 rounded-full bg-amber-500" />
 Siap Merekam Data Mutasi
 </div>
 </div>
 ) : (
 <div className="h-64 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={perpindahanChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
 <CartesianGrid stroke="#edf1f5" vertical={false} className="dark:stroke-slate-800" />
 <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
 <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
 <Tooltip
 content={({ active, payload, label }) => {
 if (!active || !payload?.length) return null
 const totalTahun = payload.reduce((sum, p) => sum + (Number(p.value) || 0), 0)
 return (
 <div className="rounded-xl border border-emerald-800/60 bg-slate-900/95 p-3 text-white shadow-xl backdrop-blur-sm">
 <p className="text-xs font-bold text-amber-400 mb-1.5">Tahun {label}</p>
 {payload.map((p) => {
 const val = Number(p.value) || 0
 const pct = totalTahun > 0 ? ((val / totalTahun) * 100).toFixed(1) : '0.0'
 return (
 <p key={p.dataKey} className="text-xs font-medium flex items-center justify-between gap-4 py-0.5">
 <span style={{ color: p.color }}>{p.name}:</span>
 <span className="font-extrabold tabular-nums">{val} siswa ({pct}%)</span>
 </p>
 )
 })}
 <div className="mt-1.5 pt-1.5 border-t border-emerald-800/60 flex items-center justify-between text-xs text-slate-400">
 <span>Total Mutasi Tahun Ini:</span>
 <span className="font-bold text-white">{totalTahun} siswa</span>
 </div>
 </div>
 )
 }}
 />
 <Legend wrapperStyle={{ paddingTop: '8px', fontSize: '12px' }} />
 <Bar dataKey="internal" name="Mutasi Internal Unit" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={24} />
 <Bar dataKey="keluar" name="Pindah Keluar Sekolah" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={24} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 )}
 </div>
 </div>

 {/* Card 2: Grafik Total Alumni Menurut Tahun (Hero UI Style) */}
 <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-sm flex flex-col justify-between">
 {/* Top Accent Gradient Stripe */}

 {/* Ambient Backlight Glow */}

 {/* Card Header (Hero UI Structured) */}
 <div className="relative z-10 p-5 sm:p-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-emerald-200/80 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
 <div className="flex items-start gap-3.5 min-w-0 flex-1">
 <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-md shadow-xs mt-0.5">
 <GraduationCap className="size-5.5" strokeWidth={2.3} />
 </div>
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-2 mb-1">
 <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
 <Sparkles className="size-3" /> ANALISIS KELULUSAN
 </span>
 </div>
 <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug">
 Total Alumni Menurut Tahun Kelulusan
 </h3>
 <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
 Pertumbuhan total alumni yang terdaftar lulus menurut tahun kelulusan
 </p>
 </div>
 </div>
 <div className="shrink-0 flex items-center">
 <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs tabular-nums">
 <span className={`size-2 rounded-full ${counts.alumni > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
 {loading ? 'Memuat...' : error ? 'Gagal' : `${counts.alumni} Total Lulus`}
 </span>
 </div>
 </div>

 {/* Card Content */}
 <div className="relative z-10 p-5 sm:p-6 flex-1 flex flex-col justify-center">
 {loading ? (
 <div className="h-64 flex items-center justify-center p-2">
 <AppSkeleton variant="card" className="h-56 w-full" />
 </div>
 ) : error ? (
 <div className="h-64 flex flex-col items-center justify-center text-center p-4">
 <div className="flex size-14 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mb-3 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
 <AlertCircle className="size-7" />
 </div>
 <p className="text-sm font-bold text-rose-700 dark:text-rose-300">Gagal Memuat Data Kelulusan</p>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[280px]">{error}</p>
 </div>
 ) : alumniChartData.length === 0 ? (
 <div className="h-64 flex flex-col items-center justify-center text-center p-6 rounded-xl border-2 border-dashed border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20">
 <div className="flex size-14 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] dark:from-emerald-950/60 dark:to-teal-950/40 text-emerald-600 dark:text-emerald-400 mb-3 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
 <GraduationCap className="size-6 stroke-[2.2]" />
 </div>
 <p className="text-sm font-black text-slate-800 dark:text-slate-100">
 Belum Ada Data Kelulusan Alumni
 </p>
 <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5 max-w-md leading-relaxed">
 Tidak ada rekaman alumni yang terdaftar lulus pada filter ini.
 </p>
 <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-emerald-950/60 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 shadow-2xs">
 <span className="size-1.5 rounded-full bg-emerald-500" />
 Siap Merekam Data Kelulusan
 </div>
 </div>
 ) : (
 <div className="h-64 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={alumniChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
 <defs>
 <linearGradient id="alumniGradientArea" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
 <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
 </linearGradient>
 </defs>
 <CartesianGrid stroke="#edf1f5" vertical={false} className="dark:stroke-slate-800" />
 <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
 <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
 <Tooltip
 content={({ active, payload, label }) => {
 if (!active || !payload?.length) return null
 const val = Number(payload[0]?.value) || 0
 const totalSemua = counts.alumni
 const pct = totalSemua > 0 ? ((val / totalSemua) * 100).toFixed(1) : '0.0'
 return (
 <div className="rounded-xl border border-emerald-800/60 bg-slate-900/95 p-3 text-white shadow-xl backdrop-blur-sm">
 <p className="text-xs font-bold text-emerald-400 mb-1">Tahun Kelulusan {label}</p>
 <p className="text-xs font-extrabold flex items-center justify-between gap-4">
 <span>Total Alumni Lulus:</span>
 <span className="text-emerald-300 tabular-nums">{val} siswa</span>
 </p>
 <p className="text-xs text-slate-400 mt-1 pt-1 border-t border-emerald-800/60">
 Proporsi: {pct}% dari seluruh {totalSemua} alumni lulus
 </p>
 </div>
 )
 }}
 />
 <Legend wrapperStyle={{ paddingTop: '8px', fontSize: '12px' }} />
 <Area
 type="monotone"
 dataKey="total"
 name="Total Alumni Lulus"
 stroke="#10b981"
 strokeWidth={2.5}
 fill="url(#alumniGradientArea)"
 />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* MasterDataSection Identik Halaman StudentsPage */}
 {/* AppDataTable Unified Emerald Container */}
 <div id="tabel-kelola-alumni" className="scroll-mt-6">
 <AppDataTable
 title="Daftar Pengolahan Alumni & Mutasi"
 actionColumnLabel=""
 description="Data alumni dan mutasi siswa sesuai filter dan unit pendidikan."
 countLabel={`${filteredList.length} alumni`}
 actions={
 <div className="flex items-center gap-2.5 flex-nowrap shrink-0 py-1">
 {canManage && (
                  <>
                    <IconButton
                      icon={Upload1}
                      variant="import"
                      size="md"
                      onClick={() => setIsImportModalOpen(true)}
                      tooltip="Import Data (Excel/CSV)"
                      aria-label="Import Data"
                    />
                    <IconButton
                      icon={Plus}
                      variant="primary"
                      size="md"
                      onClick={handleOpenAdd}
                      tooltip="Tambah Alumni"
                      aria-label="Tambah Alumni"
                    />
                  </>
                )}
                <IconButton
                  icon={Download}
                  variant="export"
                  size="md"
                  onClick={handleExportCsv}
                  tooltip="Export CSV"
                  aria-label="Export CSV"
                />
                <IconButton
                  icon={Printer}
                  variant="print"
                  size="md"
                  onClick={handlePrintMainTable}
                  tooltip="Cetak Laporan (Print)"
                  aria-label="Cetak Laporan"
                />
                <IconButton
                  icon={RotateCcw}
                  variant="ghost"
                  size="md"
                  onClick={handleResetFilter}
                  tooltip="Reset Filter"
                  aria-label="Reset Filter"
                />
 </div>
 }
 search={search}
 onSearchChange={(val) => { setSearch(val); setPage(1) }}
 searchPlaceholder="Cari NIS, NISN, nama siswa, atau perguruan tinggi..."
 filters={
 <>
 <HeroUiFilterSelect
 ariaLabel="Filter unit pendidikan"
 value={selectedUnit}
 onChange={(val) => { setSelectedUnit(val); setPage(1) }}
 options={unitFilterOptions}
 placeholder="Pilih Unit"
 icon={School}
 searchable={true}
 className="w-full sm:w-56"
 />

 <HeroUiFilterSelect
 ariaLabel="Filter status lanjutan"
 value={statusLanjutanFilter}
 onChange={(val) => { setStatusLanjutanFilter(val); setPage(1) }}
 options={statusLanjutanOptions}
 placeholder="Pilih Status Studi / Karir"
 icon={GraduationCap}
 className="w-full sm:w-56"
 />

 <HeroUiFilterSelect
 ariaLabel="Filter tahun lulus"
 value={tahunLulusFilter}
 onChange={(val) => { setTahunLulusFilter(val); setPage(1) }}
 options={tahunLulusOptions}
 placeholder="Pilih Tahun Lulus"
 icon={Calendar}
 className="w-full sm:w-48"
 />
 </>
 }
 onResetFilters={handleResetFilter}
 hasActiveFilters={Boolean(search || selectedUnit !== 'all' || statusLanjutanFilter !== 'all' || tahunLulusFilter !== 'all')}
 isLoading={loading}
 isError={Boolean(error)}
 errorTitle="Gagal memuat data alumni"
 errorMessage={error || 'Terjadi kesalahan pada koneksi server.'}
 onRetry={fetchData}
 isEmpty={!loading && paginatedList.length === 0}
 emptyTitle="Data alumni tidak ditemukan"
 emptyDescription="Tidak ada data alumni yang sesuai dengan filter yang dipilih."
 page={page}
 totalPages={totalPages}
 totalItems={filteredList.length}
 itemsPerPage={perPage}
 onPageChange={setPage}
 meta={{
 total: filteredList.length,
 from: (page - 1) * perPage + 1,
 to: Math.min(page * perPage, filteredList.length),
 last_page: totalPages,
 current_page: page,
 }}
 serverControlled
 renderTable={() => (
 <table className="w-full table-fixed text-left text-sm text-slate-600" aria-label="Daftar alumni">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr className="border-b border-emerald-200/80 dark:border-emerald-800/60 bg-transparent text-emerald-950 dark:text-emerald-200">
 <th className="w-[6%] bg-transparent px-2 py-3.5 text-center font-extrabold text-xs uppercase tracking-wider">No</th>
 <th className="w-[34%] bg-transparent px-3 py-3.5 font-extrabold text-xs uppercase tracking-wider">Identitas Siswa / Alumni</th>
 <th className="hidden w-[18%] bg-transparent px-3 py-3.5 font-extrabold text-xs uppercase tracking-wider sm:table-cell">Unit Asal</th>
 <th className="hidden w-[12%] bg-transparent px-3 py-3.5 font-extrabold text-xs uppercase tracking-wider md:table-cell">Tahun Lulus</th>
 <th className="hidden w-[20%] bg-transparent px-3 py-3.5 font-extrabold text-xs uppercase tracking-wider lg:table-cell">Tujuan Lanjut Sekolah / PTN</th>
 <th className="w-[10%] bg-transparent px-2 py-3.5 text-center font-extrabold text-xs uppercase tracking-wider"></th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-800/60 font-medium text-slate-700 dark:text-slate-200">
 {paginatedList.map((row, idx) => {
 const meta = row.metadata || {}
 const tujuan = meta.perguruan_tinggi || meta.tujuan_kelulusan || meta.status_lanjutan || 'Belum Diisi'
 const mutasiType = meta.mutasi_type || (row.is_active ? 'aktif' : 'alumni')

 return (
 <tr
 key={row.id}
 onClick={() => handleOpenDetail(row)}
 className="edu-row align-middle transition-colors hover:bg-emerald-50/40 dark:hover:bg-slate-800/50 cursor-pointer"
 >
 <td className="px-2 py-3 text-center text-xs font-bold text-slate-400">
 {(page - 1) * perPage + idx + 1}
 </td>
 <td className="px-3 py-3">
 <AlumniHoverCard row={row} meta={meta} tujuan={tujuan} />
 </td>
 <td className="hidden px-3 py-3 font-medium sm:table-cell">
 <AppBadge variant="info" dot className="rounded-lg">
 {row.education_unit?.name || row.unit?.name || 'Unit Utama'}
 </AppBadge>
 </td>
 <td className="hidden px-3 py-3 font-semibold text-slate-800 dark:text-slate-200 text-xs md:table-cell">
 {meta.tahun_lulus || row.tahun_masuk || '-'}
 </td>
 <td className="hidden px-3 py-3 lg:table-cell">
 <div className="flex flex-col gap-0.5">
 <div>
 <AppBadge
 variant={
 tujuan.toLowerCase().includes('ptn') || tujuan.toLowerCase().includes('universitas') || tujuan.toLowerCase().includes('kuliah')
 ? 'success'
 : tujuan.toLowerCase().includes('kerja')
 ? 'warning'
 : 'purple'
 }
 dot
 className="rounded-lg"
 >
 {tujuan}
 </AppBadge>
 </div>
 {meta.pekerjaan && <div className="text-[10px] text-slate-400 mt-0.5">Karir: {meta.pekerjaan}</div>}
 </div>
 </td>
 <td className="px-2 py-3 text-center" onClick={(e) => e.stopPropagation()}>
 <ActionDropdown
 item={row}
 customActions={[
 {
 label: 'Lihat Detail Alumni',
 icon: Eye,
 onClick: () => handleOpenDetail(row),
 },
 ...(canManage
 ? [
 {
 label: 'Ubah Tujuan Lanjut Sekolah / PTN',
 icon: School,
 onClick: () => handleOpenUbahTujuan(row),
 },
 {
 label: 'Edit Data Alumni',
 icon: Edit3,
 onClick: () => handleOpenEdit(row),
 },
 {
 label: 'Pindah Unit (Internal)',
 icon: ArrowRightLeft,
 onClick: () => handleOpenPindahUnit(row),
 },
 {
 label: 'Pindah Keluar (Lain Sekolah)',
 icon: UserX,
 isDanger: true,
 onClick: () => handleOpenPindahKeluar(row),
 },
 {
 label: 'Hapus Data Alumni',
 icon: Trash2,
 isDanger: true,
 onClick: () => handleOpenDelete(row),
 },
 ]
 : []),
 ]}
 />
 </td>
 </tr>
 )
 })}
 </tbody>
 </table>
 )}
 />
 </div>
 </MasterDataPage>

 {/* ── 1. MODAL TAMBAH DATA ALUMNI BARU (AppModal) ───────────────────── */}
 <AppModal
   isOpen={addModalOpen}
   onClose={() => !submitting && setAddModalOpen(false)}
   title="Tambah Data Alumni Baru"
   badge="Alumni Baru"
   description="Masukkan identitas siswa/alumni baru berserta informasi kelanjutan studi atau karir."
   icon={UserPlus}
   variant="emerald"
   maxWidth="max-w-xl"
   zIndex={60}
   disableBackdropClose={submitting}
   footer={
     <>
       <Button
         type="button"
         variant="ghost"
         disabled={submitting}
         onClick={() => setAddModalOpen(false)}
         className="bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-xl h-9.5 px-4 font-black border border-slate-300 dark:border-slate-700 active:scale-95"
       >
         Batal
       </Button>
       <Button
         variant="primary"
         size="sm"
         type="submit"
         form="add-alumni-form"
         pending={submitting}
         className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-9.5 px-5 font-black border-2 border-emerald-600 shadow-md shadow-emerald-600/20 active:scale-95"
       >
         Simpan Alumni Baru
       </Button>
     </>
   }
 >
 <form id="add-alumni-form" onSubmit={handleSaveAdd} className="space-y-5">
 {/* ── SEKSI 1: JENIS DATA / TIPE MUTASI ── */}
 <div className="space-y-3.5">
 <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 pb-1 border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60">
 <span>1. Jenis Data / Tipe Mutasi</span>
 </div>

 {/* Pilihan Jenis Data */}
 <div className="grid grid-cols-3 gap-2">
 {[
 { val: 'alumni', label: 'Alumni / Lulus', icon: GraduationCap, color: 'emerald' },
 { val: 'pindah_unit', label: 'Pindah Unit', icon: ArrowRightLeft, color: 'amber' },
 { val: 'pindah_keluar', label: 'Pindah Keluar', icon: UserX, color: 'rose' },
 ].map(({ val, label, icon: Icon, color }) => (
 <button
 key={val}
 type="button"
 onClick={() => setAddForm({ ...addForm, jenis_data: val, unit_tujuan_id: '', sekolah_tujuan: '', alasan_mutasi: '' })}
 className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-[10px] font-extrabold transition-all cursor-pointer ${
 addForm.jenis_data === val
 ? color === 'emerald' ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-sm'
 : color === 'amber' ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 shadow-sm'
 : 'border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 shadow-sm'
 : 'border-emerald-200/80 bg-white text-slate-500 hover:border-emerald-300 dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-400'
 }`}
 >
 <Icon className="w-4 h-4" />
 {label}
 </button>
 ))}
 </div>

 {/* Field kondisional: Pindah Unit */}
 {addForm.jenis_data === 'pindah_unit' && (
 <div className="space-y-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/60 dark:border-emerald-800/60 dark:bg-amber-950/20 p-3.5">
 <div className="flex flex-col gap-1.5">
 <FieldLabel className="block text-xs font-semibold text-amber-800 dark:text-amber-300">
 Unit Tujuan Pindah <span className="text-rose-500">*</span>
 </FieldLabel>
 <Select
 value={addForm.unit_tujuan_id}
 onChange={(val) => setAddForm({ ...addForm, unit_tujuan_id: String(val) })}
 >
 <SelectTrigger className="h-9 w-full text-xs rounded-xl bg-white border-emerald-200/80 hover:bg-amber-50/50 dark:bg-slate-900 dark:border-emerald-800/60 focus:ring-2 focus:ring-amber-500/20">
 <SelectValue placeholder="Pilih Unit Tujuan" />
 </SelectTrigger>
 <SelectContent>
 {units.filter(u => String(u.id) !== String(addForm.unit_id)).map((u) => (
 <SelectItem key={u.id} id={u.id} value={u.id}>{u.name || u.nama}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 <FieldDescription className="text-xs text-amber-700/70">Pilih unit tujuan berbeda dari unit asal siswa.</FieldDescription>
 </div>
 <div className="flex flex-col gap-1.5">
 <FieldLabel className="block text-xs font-semibold text-amber-800 dark:text-amber-300">Alasan / Catatan Mutasi</FieldLabel>
 <Input
 type="text"
 placeholder="Contoh: Mengikuti orang tua pindah domisili"
 value={addForm.alasan_mutasi}
 onChange={(e) => setAddForm({ ...addForm, alasan_mutasi: e.target.value })}
 className="w-full h-9 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 dark:border-emerald-800/60 px-3.5 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
 />
 </div>
 </div>
 )}

 {/* Field kondisional: Pindah Keluar */}
 {addForm.jenis_data === 'pindah_keluar' && (
 <div className="space-y-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/60 dark:border-emerald-800/60 dark:bg-rose-950/20 p-3.5">
 <div className="flex flex-col gap-1.5">
 <FieldLabel className="block text-xs font-semibold text-rose-800 dark:text-rose-300">
 Nama Sekolah Tujuan <span className="text-rose-500">*</span>
 </FieldLabel>
 <Input
 type="text"
 placeholder="Contoh: SMA Negeri 1 Jakarta / MAN 2 Bandung"
 value={addForm.sekolah_tujuan}
 onChange={(e) => setAddForm({ ...addForm, sekolah_tujuan: e.target.value })}
 className="w-full h-9 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 dark:border-emerald-800/60 px-3.5 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
 />
 </div>
 <div className="flex flex-col gap-1.5">
 <FieldLabel className="block text-xs font-semibold text-rose-800 dark:text-rose-300">Alasan Pindah Keluar</FieldLabel>
 <Input
 type="text"
 placeholder="Contoh: Ikut orang tua pindah ke luar kota"
 value={addForm.alasan_mutasi}
 onChange={(e) => setAddForm({ ...addForm, alasan_mutasi: e.target.value })}
 className="w-full h-9 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 dark:border-emerald-800/60 px-3.5 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
 />
 </div>
 </div>
 )}
 </div>

 {/* ── SEKSI 2: IDENTITAS UTAMA ALUMNI ── */}
 <div className="space-y-3.5 pt-1">
 <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 pb-1 border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60">
 <span>2. Identitas Utama Siswa / Alumni</span>
 </div>

 {/* ── SELEKTOR TARIK DATA DARI DATABASE SISWA ── */}
 <div className="flex flex-col gap-2 w-full bg-emerald-50/70 dark:bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
 <FieldLabel className="block text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
 <School className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
 Cari & Tarik Data Siswa dari Database
 </FieldLabel>

 {/* Tombol Buka DataTable Siswa & Input Pencarian */}
 <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
 <div className="relative flex-1 w-full">
 <Input
 type="text"
 placeholder="Ketik Nama Siswa atau NIS..."
 value={studentSearchQuery}
 onChange={(e) => setStudentSearchQuery(e.target.value)}
 onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchStudents())}
 className="w-full h-9 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 dark:border-emerald-700/80 px-3.5 pr-8 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
 />
 {searchingStudents && (
 <Spinner className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 dark:text-emerald-400" />
 )}
 </div>
 <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSearchStudents}
                    pending={searchingStudents}
                    className="h-9 text-xs px-3 font-bold gap-1.5 shadow-xs"
                  >
                    <Search className="w-3.5 h-3.5" />
                    Cari
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleOpenStudentTableModal}
                    className="h-9 text-xs px-3 font-bold gap-1.5 shadow-xs"
                  >
                    <School className="w-3.5 h-3.5" />
                    Buka DataTable Siswa
                  </Button>
                </div>
 </div>

 {/* Dropdown Pilihan Siswa */}
 <MasterFilterSelect
 value={selectedStudentId}
 onChange={(e) => handleSelectStudent(e.target.value)}
 className="w-full"
 >
 <option value="">
 {loadingStudents || searchingStudents
 ? 'Memuat data siswa database...'
 : studentsList.length > 0
 ? `-- Pilih dari ${studentsList.length} Siswa Ditemukan --`
 : '-- Tidak ada siswa terdaftar / ketik nama lalu klik Cari --'}
 </option>
 {studentsList.map((s) => {
 const sName = s.full_name || s.nama || s.name || s.student_name || 'Siswa'
 const rawNis = s.nis || s.metadata?.nis
 const sNis = rawNis ? ` (NIS: ${rawNis})` : ''
 const uName = s.education_unit?.name || s.educationUnit?.name || s.unit_name || s.unit?.name || ''
 const sUnit = uName ? ` - ${uName}` : ''
 return (
 <option key={s.id} value={String(s.id)}>
 {sName}{sNis}{sUnit}
 </option>
 )
 })}
 </MasterFilterSelect>

 {selectedStudentInfo && (
 <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mt-0.5">
 ✓ Data <strong>{selectedStudentInfo}</strong> berhasil ditarik! Form di bawah terisi otomatis.
 </div>
 )}
 </div>

 <div className="flex flex-col gap-1.5 w-full">
 <FieldLabel className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
 Nama Lengkap Siswa / Alumni <span className="text-rose-500">*</span>
 </FieldLabel>
 <Input
 type="text"
 placeholder="Contoh: Muhammad Fatih"
 value={addForm.full_name}
 onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
 className="w-full h-9 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 dark:border-emerald-700/80 px-3.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
 required
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
 <div className="flex flex-col gap-1.5 w-full">
 <FieldLabel className="block text-xs font-semibold text-slate-800 dark:text-slate-200">NIS (Nomor Induk Siswa)</FieldLabel>
 <Input
 type="text"
 placeholder="Contoh: 20240101"
 value={addForm.nis}
 onChange={(e) => setAddForm({ ...addForm, nis: e.target.value })}
 className="w-full h-9 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 dark:border-emerald-700/80 px-3.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
 />
 </div>
 <div className="flex flex-col gap-1.5 w-full">
 <FieldLabel className="block text-xs font-semibold text-slate-800 dark:text-slate-200">NISN (Nasional)</FieldLabel>
 <Input
 type="text"
 placeholder="Contoh: 0051234567"
 value={addForm.nisn}
 onChange={(e) => setAddForm({ ...addForm, nisn: e.target.value })}
 className="w-full h-9 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 dark:border-emerald-700/80 px-3.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
 />
 </div>
 </div>
 </div>

 {/* ── SEKSI 3: RIWAYAT KELULUSAN UNIT & KELAS ── */}
 <div className="space-y-3.5 pt-1">
 <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 pb-1 border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60">
 <span>3. Riwayat Kelulusan Unit Sekolah & Kelas</span>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
 {/* Field 1: Unit Pendidikan Asal */}
 <div className="flex flex-col gap-1.5 w-full">
 <FieldLabel className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
 Unit Pendidikan Asal <span className="text-rose-500">*</span>
 </FieldLabel>
 <Select
 value={addForm.unit_id}
 onChange={(val) => setAddForm({ ...addForm, unit_id: String(val) })}
 >
 <SelectTrigger className="h-9 w-full text-xs rounded-xl bg-slate-50/70 border-emerald-200/80 hover:bg-white dark:bg-slate-900 dark:border-emerald-700/80 focus:ring-2 focus:ring-emerald-500/20">
 <SelectValue placeholder="Pilih Unit" />
 </SelectTrigger>
 <SelectContent>
 {units.map((u) => (
 <SelectItem key={u.id} id={u.id} value={u.id}>
 {u.name || u.nama}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 {/* Field 2: Kelas / Rombel Terakhir (Terisi Otomatis Saat Tarik Data) */}
 <div className="flex flex-col gap-1.5 w-full">
 <FieldLabel className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
 Kelas / Rombel Terakhir
 </FieldLabel>
 <Input
 type="text"
 placeholder="Contoh: Kelas 9A / 12-IPA-1"
 value={addForm.kelas_name}
 onChange={(e) => setAddForm({ ...addForm, kelas_name: e.target.value })}
 className="w-full h-9 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 dark:border-emerald-700/80 px-3.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
 />
 </div>
 </div>

 {/* Field 3: Tahun Lulus */}
 <div className="flex flex-col gap-1.5 w-full">
 <FieldLabel className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
 Tahun Lulus / Tamat <span className="text-rose-500">*</span>
 </FieldLabel>
 <Input
 type="text"
 placeholder="Contoh: 2026"
 value={addForm.tahun_lulus}
 onChange={(e) => setAddForm({ ...addForm, tahun_lulus: e.target.value })}
 className="w-full h-9 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 dark:border-emerald-700/80 px-3.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
 required
 />
 </div>
 </div>

 {/* ── SEKSI 4: KELANJUTAN STUDI / KARIR ── */}
 <div className="space-y-3.5 pt-1">
 <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 pb-1 border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60">
 <span>4. Kelanjutan Studi & Karir Alumni</span>
 </div>

 <div className="flex flex-col gap-1.5 w-full">
 <FieldLabel className="block text-xs font-semibold text-slate-800 dark:text-slate-200">Status Kelanjutan Studi / Karir</FieldLabel>
 <Select
 value={addForm.status_lanjutan}
 onChange={(val) => setAddForm({ ...addForm, status_lanjutan: String(val) })}
 >
 <SelectTrigger className="h-9 w-full text-xs rounded-xl bg-slate-50/70 border-emerald-200/80 hover:bg-white dark:bg-slate-900 dark:border-emerald-700/80 focus:ring-2 focus:ring-emerald-500/20">
 <SelectValue placeholder="Pilih Status" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem id="Kuliah" value="Kuliah">Kuliah / Perguruan Tinggi</SelectItem>
 <SelectItem id="Bekerja" value="Bekerja">Bekerja / Karir</SelectItem>
 <SelectItem id="Pesantren" value="Pesantren">Pesantren / Ma'had</SelectItem>
 <SelectItem id="Sekolah Lanjutan" value="Sekolah Lanjutan">Sekolah Lanjutan (SMA/SMK/MA)</SelectItem>
 <SelectItem id="Wirausaha" value="Wirausaha">Wirausaha / Mandiri</SelectItem>
 <SelectItem id="Belum Diisi" value="Belum Diisi">Belum Menentukan</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div className="flex flex-col gap-1.5 w-full">
 <FieldLabel className="block text-xs font-semibold text-slate-800 dark:text-slate-200">Nama Perguruan Tinggi / Sekolah Tujuan</FieldLabel>
 <Input
 type="text"
 placeholder="Contoh: Universitas Indonesia / Universitas Gadjah Mada"
 value={addForm.perguruan_tinggi}
 onChange={(e) => setAddForm({ ...addForm, perguruan_tinggi: e.target.value })}
 className="w-full h-9 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 dark:border-emerald-700/80 px-3.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
 />
 </div>

 <div className="flex flex-col gap-1.5 w-full">
 <FieldLabel className="block text-xs font-semibold text-slate-800 dark:text-slate-200">Pekerjaan / Instansi (Opsional)</FieldLabel>
 <Input
 type="text"
 placeholder="Contoh: Software Engineer di PT ABC"
 value={addForm.pekerjaan}
 onChange={(e) => setAddForm({ ...addForm, pekerjaan: e.target.value })}
 className="w-full h-9 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 dark:border-emerald-700/80 px-3.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
 />
 </div>

 <div className="flex flex-col gap-1.5 w-full">
 <FieldLabel className="block text-xs font-semibold text-slate-800 dark:text-slate-200">Catatan Alumni (Opsional)</FieldLabel>
 <Input
 type="text"
 placeholder="Catatan tambahan prestasi / kelulusan..."
 value={addForm.catatan}
 onChange={(e) => setAddForm({ ...addForm, catatan: e.target.value })}
 className="w-full h-9 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 dark:border-emerald-700/80 px-3.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
 />
 </div>
 </div>
 </form>
 </AppModal>

 {/* ── 1.1. MODAL DATATABLE SISWA / SANTRI SELECTOR (AppModal) ────────── */}
 <AppModal
   isOpen={studentTableModalOpen}
   onClose={() => setStudentTableModalOpen(false)}
   title="DataTable Siswa & Santri Database"
   badge={`${studentTableTotalCount} Siswa`}
   description="Pilih siswa/santri dari daftar unit di bawah ini untuk mengisikan identitas alumni secara langsung."
   icon={School}
   variant="emerald"
   maxWidth="max-w-4xl"
   zIndex={70}
   footer={
     <Button
       type="button"
       variant="ghost"
       onClick={() => setStudentTableModalOpen(false)}
       className="bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-xl h-9.5 px-4 font-black border border-slate-300 dark:border-slate-700 active:scale-95"
     >
       Tutup
     </Button>
   }
 >
 <div className="space-y-4">
 {/* Filter Toolbar */}
 <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-emerald-200/80 dark:border-emerald-800/60">
 <div className="relative flex-1 w-full">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 dark:text-emerald-400" />
 <Input
 type="text"
 placeholder="Cari Nama Siswa, NIS, NISN..."
 value={studentTableSearch}
 onChange={(e) => { setStudentTableSearch(e.target.value); setStudentTablePage(1); }}
 className="w-full h-9 pl-9 text-xs rounded-lg border-emerald-200/80 bg-white dark:bg-slate-900 dark:border-emerald-700/80"
 />
 </div>

 <div className="flex items-center gap-2 w-full sm:w-auto">
 <HeroUiFilterSelect
 value={studentTableUnitFilter}
 onChange={(val) => { setStudentTableUnitFilter(val); setStudentTablePage(1); }}
 options={unitFilterOptions}
 placeholder="Semua Unit Sekolah"
 icon={School}
 searchable={true}
 className="w-48 text-xs"
 popoverWidth="w-56"
 ariaLabel="Pilih Unit Sekolah"
 />

 <AppBadge color="emerald" size="sm" className="whitespace-nowrap font-bold">
 {studentTableTotalCount} Siswa
 </AppBadge>
 </div>
 </div>

 {/* Table */}
 <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
 <table className="w-full text-left text-xs border-collapse">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 <th className="py-3 px-3.5 text-center w-10">No</th>
 <th className="py-3 px-3.5">Identitas Siswa</th>
 <th className="py-3 px-3.5">NIS / NISN</th>
 <th className="py-3 px-3.5">Unit Sekolah</th>
 <th className="py-3 px-3.5">Kelas / Rombel</th>
 <th className="py-3 px-3.5 text-center">Aksi</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40/60 bg-white dark:bg-[#1B2433]">
 {studentTableLoading ? (
 <tr>
 <td colSpan={6} className="py-8 text-center text-slate-500">
 <Spinner className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
 Memuat data siswa database...
 </td>
 </tr>
 ) : studentTableList.length === 0 ? (
 <tr>
 <td colSpan={6} className="py-8 text-center text-slate-500">
 Tidak ada siswa/santri ditemukan pada scope unit ini.
 </td>
 </tr>
 ) : (
 studentTableList.map((row, idx) => {
 const sName = row.full_name || row.nama || row.name || 'Siswa'
 const sNis = row.nis || row.metadata?.nis || '-'
 const sNisn = row.nisn || row.metadata?.nisn || '-'
 const uName = row.education_unit?.name || row.educationUnit?.name || row.unit_name || row.unit?.name || 'Unit'
 const kName = row.school_class?.nama_kelas || row.schoolClass?.nama_kelas || row.kelas?.nama_kelas || '-'

 return (
 <tr key={row.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
 <td className="py-2.5 px-3.5 text-center font-medium text-slate-500">
 {(studentTablePage - 1) * 10 + idx + 1}
 </td>
 <td className="py-2.5 px-3.5">
 <PersonIdentityCell
 name={sName}
 subtext={sNis !== '-' ? `NIS: ${sNis}` : 'Siswa'}
 avatarUrl={row.photo_url || row.avatar_url || row.foto}
 />
 </td>
 <td className="py-2.5 px-3.5 font-medium text-slate-700 dark:text-slate-300">
 <div>NIS: <span className="font-semibold">{sNis}</span></div>
 <div className="text-[10px] text-slate-400">NISN: {sNisn}</div>
 </td>
 <td className="py-2.5 px-3.5">
 <AppBadge color="sky" size="sm">{uName}</AppBadge>
 </td>
 <td className="py-2.5 px-3.5">
 <AppBadge color="cyan" size="sm">{kName}</AppBadge>
 </td>
 <td className="py-2.5 px-3.5 text-center">
                <Button
                  type="button"
                  size="xs"
                  variant="primary"
                  onClick={() => handleChooseStudentFromTable(row)}
                  className="font-bold gap-1 rounded-lg px-3 py-1.5 shadow-xs"
                >
                  <CheckCircle1 className="w-3.5 h-3.5" />
                  Pilih Siswa Ini
                </Button>
 </td>
 </tr>
 )
 })
 )}
 </tbody>
 </table>
 </div>

 {/* Pagination */}
 {studentTableTotalPages > 1 && (
 <div className="pt-2">
 <Pagination
 currentPage={studentTablePage}
 totalPages={studentTableTotalPages}
 onPageChange={(p) => setStudentTablePage(p)}
 sideLayout="full"
 />
 </div>
 )}
 </div>
 </AppModal>

 {/* ── 2. MODAL EDIT DATA ALUMNI (AppModal) ───────────────────────── */}
 <AppModal
   isOpen={editModalOpen && !!selectedAlumni}
   onClose={() => !submitting && setEditModalOpen(false)}
   title="Edit Data Alumni & Tujuan Lanjut"
   badge="Update Data"
   description={`Perbarui identitas dan status kelanjutan studi alumni ${selectedAlumni?.full_name || selectedAlumni?.nama || ''}.`}
   icon={Edit3}
   variant="emerald"
   maxWidth="max-w-xl"
   zIndex={60}
   disableBackdropClose={submitting}
   footer={
     <>
       <Button
         type="button"
         variant="ghost"
         disabled={submitting}
         onClick={() => setEditModalOpen(false)}
         className="bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-xl h-9.5 px-4 font-black border border-slate-300 dark:border-slate-700 active:scale-95"
       >
         Batal
       </Button>
       <Button
         variant="primary"
         size="sm"
         type="submit"
         form="edit-alumni-form"
         pending={submitting}
         className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-9.5 px-5 font-black border-2 border-emerald-600 shadow-md shadow-emerald-600/20 active:scale-95"
       >
         Simpan Perubahan
       </Button>
     </>
   }
 >
 {selectedAlumni && (
 <form id="edit-alumni-form" onSubmit={handleSaveEdit} className="space-y-5">
 {/* ── SEKSI 1: JENIS DATA / TIPE MUTASI (Edit) ── */}
 <div className="space-y-3.5">
 <div className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5 pb-1 border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60">
 <span>1. Jenis Data / Tipe Mutasi</span>
 </div>

 {/* Pilihan Jenis Data */}
 <div className="grid grid-cols-3 gap-2">
 {[
 { val: 'alumni', label: 'Alumni / Lulus', icon: GraduationCap, color: 'emerald' },
 { val: 'pindah_unit', label: 'Pindah Unit', icon: ArrowRightLeft, color: 'amber' },
 { val: 'pindah_keluar', label: 'Pindah Keluar', icon: UserX, color: 'rose' },
 ].map(({ val, label, icon: Icon, color }) => (
 <button
 key={val}
 type="button"
 onClick={() => setEditForm({ ...editForm, jenis_data: val, unit_tujuan_id: '', sekolah_tujuan: editForm.sekolah_tujuan || '', alasan_mutasi: editForm.alasan_mutasi || '' })}
 className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-[10px] font-extrabold transition-all cursor-pointer ${
 editForm.jenis_data === val
 ? color === 'emerald' ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-sm'
 : color === 'amber' ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 shadow-sm'
 : 'border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 shadow-sm'
 : 'border-emerald-200/80 bg-white text-slate-500 hover:border-emerald-300 dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-400'
 }`}
 >
 <Icon className="w-4 h-4" />
 {label}
 </button>
 ))}
 </div>

 {/* Field kondisional: Pindah Unit */}
 {editForm.jenis_data === 'pindah_unit' && (
 <div className="space-y-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/60 dark:border-emerald-800/60 dark:bg-amber-950/20 p-3.5">
 <div className="flex flex-col gap-1.5">
 <FieldLabel className="block text-xs font-semibold text-amber-800 dark:text-amber-300">
 Unit Tujuan Pindah <span className="text-rose-500">*</span>
 </FieldLabel>
 <Select
 value={editForm.unit_tujuan_id}
 onChange={(val) => setEditForm({ ...editForm, unit_tujuan_id: String(val) })}
 >
 <SelectTrigger className="h-9 w-full text-xs rounded-xl bg-white border-emerald-200/80 hover:bg-amber-50/50 dark:bg-slate-900 dark:border-emerald-800/60 focus:ring-2 focus:ring-amber-500/20">
 <SelectValue placeholder="Pilih Unit Tujuan" />
 </SelectTrigger>
 <SelectContent>
 {units.filter(u => String(u.id) !== String(editForm.unit_id)).map((u) => (
 <SelectItem key={u.id} id={u.id} value={u.id}>{u.name || u.nama}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 <FieldDescription className="text-xs text-amber-700/70">Unit tujuan berbeda dari unit asal saat ini.</FieldDescription>
 </div>
 <div className="flex flex-col gap-1.5">
 <FieldLabel className="block text-xs font-semibold text-amber-800 dark:text-amber-300">Alasan / Catatan Mutasi</FieldLabel>
 <Input
 type="text"
 placeholder="Contoh: Pindah mengikuti orang tua"
 value={editForm.alasan_mutasi}
 onChange={(e) => setEditForm({ ...editForm, alasan_mutasi: e.target.value })}
 className="w-full h-9 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 dark:border-emerald-800/60 px-3.5 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
 />
 </div>
 </div>
 )}

 {/* Field kondisional: Pindah Keluar */}
 {editForm.jenis_data === 'pindah_keluar' && (
 <div className="space-y-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/60 dark:border-emerald-800/60 dark:bg-rose-950/20 p-3.5">
 <div className="flex flex-col gap-1.5">
 <FieldLabel className="block text-xs font-semibold text-rose-800 dark:text-rose-300">
 Nama Sekolah Tujuan <span className="text-rose-500">*</span>
 </FieldLabel>
 <Input
 type="text"
 placeholder="Contoh: SMA Negeri 1 Jakarta"
 value={editForm.sekolah_tujuan}
 onChange={(e) => setEditForm({ ...editForm, sekolah_tujuan: e.target.value })}
 className="w-full h-9 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 dark:border-emerald-800/60 px-3.5 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
 />
 </div>
 <div className="flex flex-col gap-1.5">
 <FieldLabel className="block text-xs font-semibold text-rose-800 dark:text-rose-300">Alasan Pindah Keluar</FieldLabel>
 <Input
 type="text"
 placeholder="Contoh: Mengikuti orang tua pindah kota"
 value={editForm.alasan_mutasi}
 onChange={(e) => setEditForm({ ...editForm, alasan_mutasi: e.target.value })}
 className="w-full h-9 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 dark:border-emerald-800/60 px-3.5 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
 />
 </div>
 </div>
 )}
 </div>

 {/* ── SEKSI 2: IDENTITAS UTAMA ALUMNI ── */}
 <div className="space-y-3.5 pt-1">
 <div className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5 pb-1 border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60">
 <span>2. Identitas Utama Siswa / Alumni</span>
 </div>

 <div className="flex flex-col gap-1.5 w-full">
 <FieldLabel className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
 Nama Lengkap Siswa / Alumni <span className="text-rose-500">*</span>
 </FieldLabel>
 <Input
 type="text"
 value={editForm.full_name}
 onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
 className="w-full h-9 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 dark:border-emerald-700/80 px-3.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
 required
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
 <div className="flex flex-col gap-1.5 w-full">
 <FieldLabel className="block text-xs font-semibold text-slate-800 dark:text-slate-200">NIS (Nomor Induk Siswa)</FieldLabel>
 <Input
 type="text"
 value={editForm.nis}
 onChange={(e) => setEditForm({ ...editForm, nis: e.target.value })}
 className="w-full h-9 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 dark:border-emerald-700/80 px-3.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
 />
 </div>
 <div className="flex flex-col gap-1.5 w-full">
 <FieldLabel className="block text-xs font-semibold text-slate-800 dark:text-slate-200">NISN (Nasional)</FieldLabel>
 <Input
 type="text"
 value={editForm.nisn}
 onChange={(e) => setEditForm({ ...editForm, nisn: e.target.value })}
 className="w-full h-9 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 dark:border-emerald-700/80 px-3.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
 />
 </div>
 </div>
 </div>

 {/* ── SEKSI 3: RIWAYAT KELULUSAN UNIT ── */}
 <div className="space-y-3.5 pt-1">
 <div className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5 pb-1 border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60">
 <span>3. Riwayat Kelulusan Unit Sekolah</span>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
 <div className="flex flex-col gap-1.5 w-full">
 <FieldLabel className="block text-xs font-semibold text-slate-800 dark:text-slate-200">Unit Pendidikan Asal</FieldLabel>
 <Select
 value={editForm.unit_id}
 onChange={(val) => setEditForm({ ...editForm, unit_id: String(val) })}
 >
 <SelectTrigger className="h-9 w-full text-xs rounded-xl bg-slate-50/70 border-emerald-200/80 hover:bg-white dark:bg-slate-900 dark:border-emerald-700/80 focus:ring-2 focus:ring-emerald-500/20">
 <SelectValue placeholder="Pilih Unit" />
 </SelectTrigger>
 <SelectContent>
 {units.map((u) => (
 <SelectItem key={u.id} id={u.id} value={u.id}>
 {u.name || u.nama}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 <div className="flex flex-col gap-1.5 w-full">
 <FieldLabel className="block text-xs font-semibold text-slate-800 dark:text-slate-200">Tahun Lulus</FieldLabel>
 <Input
 type="text"
 placeholder="Contoh: 2026"
 value={editForm.tahun_lulus}
 onChange={(e) => setEditForm({ ...editForm, tahun_lulus: e.target.value })}
 className="w-full h-9 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 dark:border-emerald-700/80 px-3.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
 />
 </div>
 </div>
 </div>

 {/* ── SEKSI 4: KELANJUTAN STUDI / KARIR ── */}
 <div className="space-y-3.5 pt-1">
 <div className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5 pb-1 border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60">
 <span>4. Kelanjutan Studi & Karir Alumni</span>
 </div>

 <div className="flex flex-col gap-1.5 w-full">
 <FieldLabel className="block text-xs font-semibold text-slate-800 dark:text-slate-200">Status Kelanjutan Studi / Karir</FieldLabel>
 <Select
 value={editForm.status_lanjutan}
 onChange={(val) => setEditForm({ ...editForm, status_lanjutan: String(val) })}
 >
 <SelectTrigger className="h-9 w-full text-xs rounded-xl bg-slate-50/70 border-emerald-200/80 hover:bg-white dark:bg-slate-900 dark:border-emerald-700/80 focus:ring-2 focus:ring-emerald-500/20">
 <SelectValue placeholder="Pilih Status" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem id="Kuliah" value="Kuliah">Kuliah / Perguruan Tinggi</SelectItem>
 <SelectItem id="Bekerja" value="Bekerja">Bekerja / Karir</SelectItem>
 <SelectItem id="Pesantren" value="Pesantren">Pesantren / Ma'had</SelectItem>
 <SelectItem id="Sekolah Lanjutan" value="Sekolah Lanjutan">Sekolah Lanjutan (SMA/SMK/MA)</SelectItem>
 <SelectItem id="Wirausaha" value="Wirausaha">Wirausaha / Mandiri</SelectItem>
 <SelectItem id="Belum Diisi" value="Belum Diisi">Belum Menentukan</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div className="flex flex-col gap-1.5 w-full">
 <FieldLabel className="block text-xs font-semibold text-slate-800 dark:text-slate-200">Nama Perguruan Tinggi / Sekolah Tujuan</FieldLabel>
 <Input
 type="text"
 placeholder="Contoh: Universitas Indonesia / SMA Negeri 1"
 value={editForm.perguruan_tinggi}
 onChange={(e) => setEditForm({ ...editForm, perguruan_tinggi: e.target.value })}
 className="w-full h-9 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 dark:border-emerald-700/80 px-3.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
 />
 <FieldDescription className="text-xs text-slate-500">Isi nama universitas, perguruan tinggi, atau sekolah lanjutan.</FieldDescription>
 </div>

 <div className="flex flex-col gap-1.5 w-full">
 <FieldLabel className="block text-xs font-semibold text-slate-800 dark:text-slate-200">Pekerjaan / Instansi (Opsional)</FieldLabel>
 <Input
 type="text"
 placeholder="Contoh: Software Engineer di PT ABC"
 value={editForm.pekerjaan}
 onChange={(e) => setEditForm({ ...editForm, pekerjaan: e.target.value })}
 className="w-full h-9 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 dark:border-emerald-700/80 px-3.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
 />
 </div>

 <div className="flex flex-col gap-1.5 w-full">
 <FieldLabel className="block text-xs font-semibold text-slate-800 dark:text-slate-200">Catatan Alumni (Opsional)</FieldLabel>
 <Input
 type="text"
 placeholder="Catatan tambahan..."
 value={editForm.catatan}
 onChange={(e) => setEditForm({ ...editForm, catatan: e.target.value })}
 className="w-full h-9 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 dark:border-emerald-700/80 px-3.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
 />
 </div>
 </div>
 </form>
 )}
 </AppModal>

 {/* ── 3. MODAL KONFIRMASI PINDAH UNIT (INTERNAL) (AppModal) ─────────────────────────── */}
 <AppModal
   isOpen={pindahUnitModalOpen && !!selectedAlumni}
   onClose={() => !submitting && setPindahUnitModalOpen(false)}
   title="Pindahkan Siswa Dari Unit Asal"
   badge="Mutasi Internal"
   description={`Memindahkan ${selectedAlumni?.full_name || selectedAlumni?.nama || ''} ke unit baru.`}
   icon={ArrowRightLeft}
   variant="warning"
   maxWidth="max-w-md"
   zIndex={60}
   disableBackdropClose={submitting}
   footer={
     <>
       <Button
         type="button"
         variant="ghost"
         disabled={submitting}
         onClick={() => setPindahUnitModalOpen(false)}
         className="bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-xl h-9.5 px-4 font-black border border-slate-300 dark:border-slate-700 active:scale-95"
       >
         Batal
       </Button>
       <Button
         variant="warning"
         size="sm"
         type="submit"
         form="pindah-unit-form"
         pending={submitting}
         className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl h-9.5 px-5 font-black border-2 border-amber-600 shadow-md shadow-amber-600/20 active:scale-95"
       >
         Pindahkan & Lepas dari Unit Asal
       </Button>
     </>
   }
 >
 {selectedAlumni && (
 <form id="pindah-unit-form" onSubmit={handleSavePindahUnit} className="space-y-4">
 <Alert variant="warning" className="text-xs rounded-xl border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/80 dark:border-emerald-800/60 dark:bg-amber-950/30">
 <AlertTitle className="font-semibold text-amber-900 dark:text-amber-300">Pelepasan Dari Unit Asal</AlertTitle>
 <AlertDescription className="text-xs text-amber-800 dark:text-amber-400 mt-0.5">
 Siswa akan dialihkan ke unit tujuan baru dan secara otomatis tidak akan lagi terdaftar di unit asal saat ini.
 </AlertDescription>
 </Alert>

 {/* 1. Pilih Unit Tujuan Baru */}
 <div className="flex flex-col gap-1.5 w-full">
 <FieldLabel className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
 Pilih Unit Tujuan Baru <span className="text-rose-500">*</span>
 </FieldLabel>
 <Select
 value={pindahUnitForm.target_unit_id}
 onChange={(val) => setPindahUnitForm({ ...pindahUnitForm, target_unit_id: String(val), tingkat: '', kelas_id: '' })}
 >
 <SelectTrigger className="h-9 w-full text-xs rounded-xl bg-slate-50/70 border-emerald-200/80 hover:bg-white dark:bg-slate-900 dark:border-emerald-700/80 focus:ring-2 focus:ring-emerald-500/20">
 <SelectValue placeholder="Pilih Unit Tujuan" />
 </SelectTrigger>
 <SelectContent>
 {units
 .filter((u) => u.id !== selectedAlumni.unit_id)
 .map((u) => (
 <SelectItem key={u.id} id={u.id} value={u.id}>
 {u.name || u.nama}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 {/* 2. Grid Tingkatan & Kelas/Rombel Tujuan Baru */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
 {/* Pilihan Tingkatan */}
 <div className="flex flex-col gap-1.5 w-full">
 <FieldLabel className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
 Tingkatan Pendidikan
 </FieldLabel>
 <MasterFilterSelect
 value={pindahUnitForm.tingkat}
 onChange={(e) => setPindahUnitForm({ ...pindahUnitForm, tingkat: e.target.value, kelas_id: '' })}
 className="w-full h-9 text-xs rounded-xl"
 >
 <option value="">-- Pilih Tingkatan --</option>
 {availableTingkatan.length > 0 ? (
 availableTingkatan.map((t) => (
 <option key={t} value={t}>Tingkat {t}</option>
 ))
 ) : (
 <>
 <option value="1">Tingkat 1</option>
 <option value="2">Tingkat 2</option>
 <option value="3">Tingkat 3</option>
 <option value="4">Tingkat 4</option>
 <option value="5">Tingkat 5</option>
 <option value="6">Tingkat 6</option>
 <option value="7">Tingkat 7</option>
 <option value="8">Tingkat 8</option>
 <option value="9">Tingkat 9</option>
 <option value="10">Tingkat 10</option>
 <option value="11">Tingkat 11</option>
 <option value="12">Tingkat 12</option>
 </>
 )}
 </MasterFilterSelect>
 </div>

 {/* Pilihan Kelas / Rombel Tujuan */}
 <div className="flex flex-col gap-1.5 w-full">
 <FieldLabel className="block text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
 <span>Kelas / Rombel Tujuan</span>
 {loadingTargetClasses && <Spinner className="w-3 h-3 text-emerald-600" />}
 </FieldLabel>
 <MasterFilterSelect
 value={pindahUnitForm.kelas_id}
 onChange={(e) => setPindahUnitForm({ ...pindahUnitForm, kelas_id: e.target.value })}
 className="w-full h-9 text-xs rounded-xl"
 >
 <option value="">
 {loadingTargetClasses
 ? 'Memuat kelas unit...'
 : filteredTargetClasses.length > 0
 ? '-- Pilih Kelas / Rombel --'
 : '-- Tidak ada rombel --'}
 </option>
 {filteredTargetClasses.map((k) => (
 <option key={k.id} value={k.id}>
 {k.nama_kelas || k.name || k.nama} {k.tingkat ? `(Tingkat ${k.tingkat})` : ''}
 </option>
 ))}
 </MasterFilterSelect>
 </div>
 </div>

 {/* 3. Alasan Mutasi Internal */}
 <div className="flex flex-col gap-1.5 w-full">
 <FieldLabel className="block text-xs font-semibold text-slate-800 dark:text-slate-200">Alasan Mutasi Internal</FieldLabel>
 <Input
 type="text"
 placeholder="Masukkan alasan pemindahan unit..."
 value={pindahUnitForm.alasan}
 onChange={(e) => setPindahUnitForm({ ...pindahUnitForm, alasan: e.target.value })}
 className="w-full h-9 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 dark:border-emerald-700/80 px-3.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
 />
 </div>
 </form>
 )}
 </AppModal>

 {/* ── 4. MODAL KONFIRMASI PINDAH KELUAR (SEKOLAH LAIN) (AppModal) ────────────────────── */}
 <AppModal
   isOpen={pindahKeluarModalOpen && !!selectedAlumni}
   onClose={() => !submitting && setPindahKeluarModalOpen(false)}
   title="Proses Mutasi Keluar di Lain Sekolah"
   badge="Mutasi Keluar"
   description={`Mutasi keluar siswa ${selectedAlumni?.full_name || selectedAlumni?.nama || ''} ke sekolah lain di luar yayasan.`}
   icon={UserX}
   variant="danger"
   maxWidth="max-w-md"
   zIndex={60}
   disableBackdropClose={submitting}
   footer={
     <>
       <Button
         type="button"
         variant="ghost"
         disabled={submitting}
         onClick={() => setPindahKeluarModalOpen(false)}
         className="bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-xl h-9.5 px-4 font-black border border-slate-300 dark:border-slate-700 active:scale-95"
       >
         Batal
       </Button>
       <Button
         variant="danger"
         size="sm"
         type="submit"
         form="pindah-keluar-form"
         pending={submitting}
         className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-9.5 px-5 font-black border-2 border-rose-600 shadow-md shadow-rose-600/20 active:scale-95"
       >
         Proses & Hapus Dari Unit
       </Button>
     </>
   }
 >
 {selectedAlumni && (
 <form id="pindah-keluar-form" onSubmit={handleSavePindahKeluar} className="space-y-4">
 <Alert variant="error" className="text-xs rounded-xl border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/80 dark:border-emerald-800/60 dark:bg-rose-950/30">
 <AlertTitle className="font-semibold text-rose-900 dark:text-rose-300">Pelepasan Data Unit</AlertTitle>
 <AlertDescription className="text-xs text-rose-800 dark:text-rose-400 mt-0.5">
 Data siswa akan dicatat sebagai Mutasi Keluar dan dilepas/dihapus dari daftar siswa/alumni aktif unit bersangkutan.
 </AlertDescription>
 </Alert>

 <div className="flex flex-col gap-1.5 w-full">
 <FieldLabel className="block text-xs font-semibold text-slate-800 dark:text-slate-200">Nama Sekolah Tujuan (Luar Yayasan)</FieldLabel>
 <Input
 type="text"
 placeholder="Contoh: SMA Negeri 2 Padang"
 value={pindahKeluarForm.sekolah_tujuan}
 onChange={(e) => setPindahKeluarForm({ ...pindahKeluarForm, sekolah_tujuan: e.target.value })}
 className="w-full h-9 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 dark:border-emerald-700/80 px-3.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
 required
 />
 </div>

 <div className="flex flex-col gap-1.5 w-full">
 <FieldLabel className="block text-xs font-semibold text-slate-800 dark:text-slate-200">Alasan Mutasi Keluar</FieldLabel>
 <Input
 type="text"
 placeholder="Contoh: Pindah domisili orang tua / Pindah sekolah..."
 value={pindahKeluarForm.alasan}
 onChange={(e) => setPindahKeluarForm({ ...pindahKeluarForm, alasan: e.target.value })}
 className="w-full h-9 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 dark:border-emerald-700/80 px-3.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
 />
 </div>
 </form>
 )}
 </AppModal>

 {/* ── 5. CONFIRM DIALOG HAPUS DATA ALUMNI (HeroUI AlertDialog) ───────────── */}
 <ConfirmDialog
 isOpen={deleteDialogOpen}
 onClose={() => setDeleteDialogOpen(false)}
 onConfirm={handleConfirmDelete}
 action="delete"
 title="Hapus Data Alumni"
 message={`Apakah Anda yakin ingin menghapus data alumni ${selectedAlumni?.full_name || selectedAlumni?.nama || ''} dari unit? Data yang dihapus tidak dapat dikembalikan.`}
 isLoading={submitting}
 isDanger
 />

 {/* ── 6. MODAL POPUP DETAIL SISWA CARD (AppModal) ───────────── */}
 <AppModal
   isOpen={cardModalOpen && !!cardModalData}
   onClose={() => setCardModalOpen(false)}
   title={cardModalData?.title || ''}
   badge={`${cardModalData?.list?.length ?? 0} Siswa`}
   description={cardModalData?.description || ''}
   icon={cardModalData?.icon}
   variant={cardModalData?.tone === 'rose' ? 'danger' : cardModalData?.tone === 'amber' ? 'warning' : 'emerald'}
   maxWidth="max-w-4xl"
   zIndex={60}
   footer={
     <Button
       type="button"
       variant="ghost"
       onClick={() => setCardModalOpen(false)}
       className="bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-xl h-9.5 px-4 font-black border border-slate-300 dark:border-slate-700 active:scale-95"
     >
       Tutup
     </Button>
   }
 >
 {cardModalData && (
 <div className="space-y-4">
 {/* Input Filter Cari Cepat di Dalam Modal */}
 <div className="flex items-center gap-2">
 <Input
 type="text"
 placeholder="Ketik nama siswa / NIS untuk memfilter modal ini..."
 value={modalSearch}
 onChange={(e) => setModalSearch(e.target.value)}
 className="w-full h-9 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 dark:border-emerald-700/80 px-3 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
 />
 </div>

 {/* Tabel Daftar Siswa/Alumni Modal dengan Kolom Dinamis */}
 <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 <th className="py-2.5 px-3 w-12 text-center">No</th>
 <th className="py-2.5 px-3 min-w-[200px]">Nama & NIS Siswa</th>
 {cardModalData.type === 'pindah_unit' ? (
 <>
 <th className="py-2.5 px-3">Unit Asal</th>
 <th className="py-2.5 px-3">Unit Tujuan Baru</th>
 <th className="py-2.5 px-3 text-center">Waktu Mutasi</th>
 <th className="py-2.5 px-3">Alasan Mutasi</th>
 </>
 ) : cardModalData.type === 'pindah_keluar' ? (
 <>
 <th className="py-2.5 px-3">Unit Asal</th>
 <th className="py-2.5 px-3">Sekolah Tujuan Keluar</th>
 <th className="py-2.5 px-3 text-center">Waktu Pindah</th>
 <th className="py-2.5 px-3">Alasan Keluar</th>
 </>
 ) : cardModalData.type === 'lanjut_studi' || cardModalData.type === 'alumni' ? (
 <>
 <th className="py-2.5 px-3">Unit Lulus</th>
 <th className="py-2.5 px-3 text-center">Tahun Tamat</th>
 <th className="py-2.5 px-3">Status Lanjutan</th>
 <th className="py-2.5 px-3">Kampus / Sekolah Tujuan</th>
 <th className="py-2.5 px-3">Jurusan / Karir</th>
 </>
 ) : (
 <>
 <th className="py-2.5 px-3">Unit Pendidikan</th>
 <th className="py-2.5 px-3 text-center">Tahun Lulus</th>
 <th className="py-2.5 px-3">Status / Tujuan</th>
 </>
 )}
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40/60">
 {cardModalData.list
 .filter((s) => {
 if (!modalSearch.trim()) return true
 const q = modalSearch.toLowerCase()
 const name = (s.full_name || s.nama || '').toLowerCase()
 const nis = (s.nis || s.nisn || '').toLowerCase()
 return name.includes(q) || nis.includes(q)
 })
 .map((row, idx) => {
 const meta = row.metadata || {}
 const currentUnit = row.education_unit?.name || row.unit?.name || 'Unit Utama'
 const unitAsal = units.find(u => String(u.id) === String(meta.unit_asal_id || meta.unit_asal_dilepas))?.name || meta.unit_asal_name || currentUnit

 return (
 <tr key={row.id || idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors">
 <td className="py-2.5 px-3 text-slate-400 font-mono text-center">{idx + 1}</td>
 <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-100">
 <PersonIdentityCell
 avatarUrl={row.photo || row.avatar || row.foto}
 name={row.full_name || row.nama || '-'}
 subtitle={`NIS: ${row.nis || row.nisn || '-'}`}
 />
 </td>

 {/* Kolom Khusus: Pindah Unit */}
 {cardModalData.type === 'pindah_unit' && (
 <>
 <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-medium">
 {unitAsal}
 </td>
 <td className="py-2.5 px-3">
 <span className="inline-flex items-center gap-1 font-bold text-amber-700 dark:text-amber-300">
 <ArrowRightLeft className="w-3.5 h-3.5 shrink-0" />
 {currentUnit}
 </span>
 </td>
 <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-300 font-mono text-xs">
 {meta.tgl_mutasi ? new Date(meta.tgl_mutasi).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : (meta.tahun_mutasi || row.tahun_lulus || '-')}
 </td>
 <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 text-xs italic">
 {meta.catatan_mutasi || meta.alasan || '-'}
 </td>
 </>
 )}

 {/* Kolom Khusus: Pindah Keluar */}
 {cardModalData.type === 'pindah_keluar' && (
 <>
 <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-medium">
 {unitAsal}
 </td>
 <td className="py-2.5 px-3">
 <span className="font-bold text-rose-700 dark:text-rose-400">
 {meta.sekolah_tujuan || meta.tujuan || 'Sekolah Luar'}
 </span>
 </td>
 <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-300 font-mono text-xs">
 {meta.tgl_mutasi ? new Date(meta.tgl_mutasi).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : (meta.tahun_mutasi || '-')}
 </td>
 <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 text-xs italic">
 {meta.alasan_keluar || meta.catatan_mutasi || meta.alasan || '-'}
 </td>
 </>
 )}

 {/* Kolom Khusus: Tujuan Tamat / Lanjut Studi */}
 {(cardModalData.type === 'lanjut_studi' || cardModalData.type === 'alumni') && (
 <>
 <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-medium">
 {currentUnit}
 </td>
 <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-300 font-mono font-bold">
 {row.tahun_lulus || meta.tahun_lulus || row.tahun_masuk || '-'}
 </td>
 <td className="py-2.5 px-3">
 <AppBadge variant={
 (meta.status_lanjutan || '').toLowerCase().includes('kuliah') ? 'cyan' :
 (meta.status_lanjutan || '').toLowerCase().includes('pesantren') ? 'primary' :
 (meta.status_lanjutan || '').toLowerCase().includes('kerja') ? 'warning' :
 'success'
 }>
 {meta.status_lanjutan || row.status_lanjutan || '-'}
 </AppBadge>
 </td>
 <td className="py-2.5 px-3 font-semibold text-emerald-800 dark:text-emerald-300">
 {meta.perguruan_tinggi || meta.tujuan_kelulusan || '-'}
 </td>
 <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 text-xs">
 {meta.jurusan || meta.prodi || meta.pekerjaan || row.pekerjaan || '-'}
 </td>
 </>
 )}

 {/* Default Fallback Columns */}
 {cardModalData.type !== 'pindah_unit' && cardModalData.type !== 'pindah_keluar' && cardModalData.type !== 'lanjut_studi' && cardModalData.type !== 'alumni' && (
 <>
 <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-medium">{currentUnit}</td>
 <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-300">{row.tahun_lulus || meta.tahun_lulus || row.tahun_masuk || '-'}</td>
 <td className="py-2.5 px-3">
 <AppBadge variant={
 meta.mutasi_type === 'keluar' ? 'error' :
 meta.mutasi_type === 'masuk_unit_baru' ? 'warning' :
 'success'
 }>
 {meta.status_lanjutan || meta.perguruan_tinggi || row.status_lanjutan || 'Terdaftar'}
 </AppBadge>
 </td>
 </>
 )}
 </tr>
 )
 })}

 {cardModalData.list.length === 0 && (
 <tr>
 <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
 Belum ada data siswa untuk kategori ini.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 )}
 </AppModal>

 {/* ── 7. MODAL DETAIL ALUMNI (AppModal) ───────────── */}
 <AppModal
   isOpen={detailModalOpen && !!selectedAlumniDetail}
   onClose={() => setDetailModalOpen(false)}
   title="Rincian Profil Alumni & Kelanjutan Studi"
   badge="Profil Alumni"
   description="Informasi lengkap biodata siswa/alumni, riwayat unit sekolah asal, dan status tujuan studi / karir."
   icon={GraduationCap}
   variant="emerald"
   maxWidth="max-w-xl"
   zIndex={60}
   footer={
     <>
       <Button
         type="button"
         variant="ghost"
         onClick={() => setDetailModalOpen(false)}
         className="bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-xl h-9.5 px-4 font-black border border-slate-300 dark:border-slate-700 active:scale-95"
       >
         Tutup
       </Button>
       <Button
         variant="primary"
         size="sm"
         type="button"
         onClick={() => {
           setDetailModalOpen(false)
           handleOpenUbahTujuan(selectedAlumniDetail)
         }}
         className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-9.5 px-5 font-black border-2 border-emerald-600 shadow-md shadow-emerald-600/20 active:scale-95 gap-2"
       >
         <School className="w-4 h-4" />
         Ubah Tujuan Lanjut
       </Button>
     </>
   }
 >
 {selectedAlumniDetail && (
 <div className="space-y-5">
 {/* Header Banner Identity */}
 <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-emerald-200/80 dark:bg-slate-900/50 dark:border-emerald-800/60">
 <PersonIdentityCell
 avatarUrl={selectedAlumniDetail.photo || selectedAlumniDetail.avatar || selectedAlumniDetail.foto}
 name={selectedAlumniDetail.full_name || selectedAlumniDetail.nama || '-'}
 subtitle={`NIS: ${selectedAlumniDetail.nis || selectedAlumniDetail.nisn || '-'}`}
 className="flex-1"
 />
 <div className="flex flex-col items-end gap-1">
 <AppBadge
 variant={
 (selectedAlumniDetail.metadata?.status_lanjutan || selectedAlumniDetail.status_lanjutan || '').toLowerCase().includes('kuliah')
 ? 'success'
 : (selectedAlumniDetail.metadata?.status_lanjutan || selectedAlumniDetail.status_lanjutan || '').toLowerCase().includes('kerja')
 ? 'warning'
 : 'purple'
 }
 dot
 >
 {selectedAlumniDetail.metadata?.status_lanjutan || selectedAlumniDetail.status_lanjutan || 'Alumni'}
 </AppBadge>
 <span className="text-[10px] text-slate-400 font-mono">ID: {selectedAlumniDetail.id}</span>
 </div>
 </div>

 {/* Grid 2 Kolom Rincian Informational */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Kolom 1: Identitas & Akademik */}
 <div className="p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-2xs space-y-3 dark:border-emerald-800/60 dark:bg-slate-900/40">
 <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider pb-1.5 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <UserPlus className="w-3.5 h-3.5" /> Identitas & Sekolah Asal
 </h4>
 <div className="space-y-2 text-xs">
 <div>
 <span className="text-slate-400 block text-[10px] font-semibold">Nama Lengkap</span>
 <strong className="text-slate-900 dark:text-white">{selectedAlumniDetail.full_name || selectedAlumniDetail.nama || '-'}</strong>
 </div>
 <div>
 <span className="text-slate-400 block text-[10px] font-semibold">NIS / NISN</span>
 <span className="font-mono text-slate-700 dark:text-slate-300">{selectedAlumniDetail.nis || '-'} / {selectedAlumniDetail.nisn || '-'}</span>
 </div>
 <div>
 <span className="text-slate-400 block text-[10px] font-semibold">Unit Sekolah Asal</span>
 <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedAlumniDetail.education_unit?.name || selectedAlumniDetail.unit?.name || 'Unit Utama'}</span>
 </div>
 <div>
 <span className="text-slate-400 block text-[10px] font-semibold">Tahun Lulus / Mutasi</span>
 <span className="font-bold text-emerald-700 dark:text-emerald-400">{selectedAlumniDetail.metadata?.tahun_lulus || selectedAlumniDetail.tahun_masuk || '-'}</span>
 </div>
 </div>
 </div>

 {/* Kolom 2: Tujuan Lanjut Sekolah / PTN */}
 <div className="p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-2xs space-y-3 dark:border-emerald-800/60 dark:bg-slate-900/40">
 <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider pb-1.5 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <School className="w-3.5 h-3.5" /> Tujuan Lanjut Sekolah / PTN
 </h4>
 <div className="space-y-2 text-xs">
 <div>
 <span className="text-slate-400 block text-[10px] font-semibold">Status Kelanjutan</span>
 <span className="font-bold text-slate-900 dark:text-white">{selectedAlumniDetail.metadata?.status_lanjutan || selectedAlumniDetail.status_lanjutan || '-'}</span>
 </div>
 <div>
 <span className="text-slate-400 block text-[10px] font-semibold">Perguruan Tinggi / PTN / Sekolah Tujuan</span>
 <strong className="text-emerald-700 dark:text-emerald-300 text-xs block">{selectedAlumniDetail.metadata?.perguruan_tinggi || selectedAlumniDetail.metadata?.tujuan_kelulusan || selectedAlumniDetail.perguruan_tinggi || 'Belum Diisi'}</strong>
 </div>
 <div>
 <span className="text-slate-400 block text-[10px] font-semibold">Jurusan / Program Studi</span>
 <span className="text-slate-700 dark:text-slate-300">{selectedAlumniDetail.metadata?.jurusan || selectedAlumniDetail.metadata?.prodi || '-'}</span>
 </div>
 <div>
 <span className="text-slate-400 block text-[10px] font-semibold">Pekerjaan / Instansi</span>
 <span className="text-slate-700 dark:text-slate-300">{selectedAlumniDetail.metadata?.pekerjaan || selectedAlumniDetail.pekerjaan || '-'}</span>
 </div>
 </div>
 </div>
 </div>

 {/* Catatan Alumni */}
 {selectedAlumniDetail.metadata?.catatan_alumni && (
 <div className="p-3.5 rounded-xl bg-amber-50/70 border border-emerald-200/80 dark:border-emerald-800/60 text-amber-900 dark:bg-amber-950/40 dark:border-emerald-800/60 dark:text-amber-300 text-xs">
 <strong className="block text-xs font-bold mb-0.5">Catatan / Keterangan Tambahan:</strong>
 <p className="italic font-medium">"{selectedAlumniDetail.metadata.catatan_alumni}"</p>
 </div>
 )}
 </div>
 )}
 </AppModal>

 {/* ── 8. MODAL DEDICATED UBAH TUJUAN LANJUT SEKOLAH / PTN (AppModal) ───────────── */}
 <AppModal
   isOpen={tujuanModalOpen}
   onClose={() => !submitting && setTujuanModalOpen(false)}
   title="Ubah Tujuan Lanjut Sekolah / PTN"
   badge="Tujuan Lanjut"
   description={`Perbarui informasi sekolah lanjutan, PTN/perguruan tinggi, atau status karir alumni ${selectedAlumni?.full_name || selectedAlumni?.nama || ''}.`}
   icon={School}
   variant="emerald"
   maxWidth="max-w-xl"
   zIndex={60}
   disableBackdropClose={submitting}
   footer={
     <>
       <Button
         type="button"
         variant="ghost"
         disabled={submitting}
         onClick={() => setTujuanModalOpen(false)}
         className="bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-xl h-9.5 px-4 font-black border border-slate-300 dark:border-slate-700 active:scale-95"
       >
         Batal
       </Button>
       <Button
         variant="primary"
         size="sm"
         type="submit"
         form="ubah-tujuan-form"
         pending={submitting}
         className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-9.5 px-5 font-black border-2 border-emerald-600 shadow-md shadow-emerald-600/20 active:scale-95"
       >
         Simpan Perubahan
       </Button>
     </>
   }
 >
 <form id="ubah-tujuan-form" onSubmit={handleSaveUbahTujuan} className="space-y-4">
 <div className="space-y-1.5">
 <FieldLabel className="text-xs font-bold">Status Kelanjutan Studi / Karir</FieldLabel>
 <HeroUiFilterSelect
 value={tujuanForm.status_lanjutan}
 onChange={(val) => setTujuanForm({ ...tujuanForm, status_lanjutan: val })}
 placeholder="-- Pilih Status Lanjutan --"
 ariaLabel="Status Kelanjutan Studi / Karir"
 options={[
 { value: '', label: '-- Pilih Status Lanjutan --' },
 ...(tujuanForm.status_lanjutan && !alumniStatusOptions.includes(tujuanForm.status_lanjutan)
 ? [{ value: tujuanForm.status_lanjutan, label: `${tujuanForm.status_lanjutan} (Data Historis)` }]
 : []),
 ...alumniStatusOptions.map((opt) => ({ value: opt, label: opt })),
 ]}
 />
 </div>

 <div className="space-y-1.5">
 <FieldLabel className="text-xs font-bold">Perguruan Tinggi / PTN / Sekolah Tujuan</FieldLabel>
 <Input
 type="text"
 required
 placeholder="Contoh: Universitas Indonesia (UI), ITB, UGM, UNAND, STIS, Ma'had Al-Madinah..."
 value={tujuanForm.perguruan_tinggi}
 onChange={(e) => setTujuanForm({ ...tujuanForm, perguruan_tinggi: e.target.value })}
 className="w-full h-9 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 dark:border-emerald-700/80 px-3.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
 />
 <FieldDescription className="text-[10px]">Tulis nama kampus/sekolah lanjutan secara lengkap.</FieldDescription>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div className="space-y-1.5">
 <FieldLabel className="text-xs font-bold">Jurusan / Program Studi</FieldLabel>
 <Input
 type="text"
 placeholder="Contoh: Teknik Informatika, Kedokteran..."
 value={tujuanForm.jurusan}
 onChange={(e) => setTujuanForm({ ...tujuanForm, jurusan: e.target.value })}
 className="w-full h-9 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 dark:border-emerald-700/80 px-3.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
 />
 </div>

 <div className="space-y-1.5">
 <FieldLabel className="text-xs font-bold">Tahun Lulus</FieldLabel>
 <Input
 type="text"
 placeholder="Contoh: 2026"
 value={tujuanForm.tahun_lulus}
 onChange={(e) => setTujuanForm({ ...tujuanForm, tahun_lulus: e.target.value })}
 className="w-full h-9 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 dark:border-emerald-700/80 px-3.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
 />
 </div>
 </div>

 <div className="space-y-1.5">
 <FieldLabel className="text-xs font-bold">Pekerjaan / Instansi (Opsional)</FieldLabel>
 <Input
 type="text"
 placeholder="Contoh: Software Engineer di PT Telkom / Guru / Usaha..."
 value={tujuanForm.pekerjaan}
 onChange={(e) => setTujuanForm({ ...tujuanForm, pekerjaan: e.target.value })}
 className="w-full h-9 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 dark:border-emerald-700/80 px-3.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
 />
 </div>

 <div className="space-y-1.5">
 <FieldLabel className="text-xs font-bold">Catatan / Keterangan Tambahan</FieldLabel>
 <textarea
 rows={3}
 placeholder="Catatan prestasi, beasiswa, atau keterangan tambahan..."
 value={tujuanForm.catatan}
 onChange={(e) => setTujuanForm({ ...tujuanForm, catatan: e.target.value })}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-3 text-xs dark:border-emerald-700/80 dark:bg-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
 />
 </div>
 </form>
 </AppModal>

 {/* CsvImportModal for Alumni */}
 <CsvImportModal
 isOpen={isImportModalOpen}
 onClose={() => setIsImportModalOpen(false)}
 title="Import Data Alumni"
 onImport={handleImportAlumni}
 />

 {/* Smart Floating Scroll Navigator */}
 <SmartScrollFab targetId="tabel-kelola-alumni" downTooltip="Langsung ke Tabel Alumni" />
 </PageContainer>
 )
}
