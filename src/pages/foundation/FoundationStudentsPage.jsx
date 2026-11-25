import { HeroUiHeader } from "../../components/ui/HeroUiHeader"
import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  Button,
  Card,
} from '@heroui/react'
import { Chip } from '../../components/ui/badge'
import {
  Input as HeroInput
} from '../../components/ui/input'
import ActionDropdown from '../../components/app/ActionDropdown'
import {
  Award,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Printer,
  RefreshCcw,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserMinus,
  UserRound,
  UsersRound
} from 'lucide-react'
import {
  ArrowRightLeft as ArrowBothDirectionHorizontal2
} from 'lucide-react'
import AppBreadcrumb from '../../components/app/AppBreadcrumb'
import AppDataTable from '../../components/app/AppDataTable'
import { PageToolbarActions } from '../../components/app/PageToolbarActions'
import { AppBadge } from '../../components/app'
import HeroUiFilterSelect from '../../components/ui/HeroUiFilterSelect'
import {
  Pagination
} from '../../components/ui/pagination'
import api from '../../services/api'
import useDebounce from '../../hooks/useDebounce'
import {
  printWeeklyStudentEvaluation
} from '../../utils/printHelper'
import {
  MasterDataPage,
  MasterEmptyState,
  MasterErrorState,
  MasterStatusBadge,
  SquircleActionButton
} from '../../components/master-data'
import {
  PersonIdentityCell
} from '../../components/ui/PersonIdentityCell'
import KpiDetailDrawer from '../../components/KpiDetailDrawer'
import {
  FoundationExportModal
} from '../../components/foundation/FoundationExportModal'
import {
  FoundationUnitKpiModal
} from '../../components/foundation/FoundationUnitKpiModal'
import {
  SmartScrollFab
} from '../../components/common'

const GENDER_LABEL = {
 male: 'Laki-Laki',
 L: 'Laki-Laki',
 female: 'Perempuan',
 P: 'Perempuan',
}

const containerVariants = {
 hidden: { opacity: 0, y: 15 },
 visible: {
 opacity: 1,
 y: 0,
 transition: { duration: 0.35, staggerChildren: 0.08 },
 },
}

const itemVariants = {
 hidden: { opacity: 0, y: 12 },
 visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

export function FoundationStudentsPage() {
 const [students, setStudents] = useState([])
 const [units, setUnits] = useState([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(false)
 const [isFetching, setIsFetching] = useState(false)

 const [search, setSearch] = useState('')
 const debouncedSearch = useDebounce(search, 350)
 const [selectedUnit, setSelectedUnit] = useState('all')
 const [selectedGender, setSelectedGender] = useState('all')
 const [page, setPage] = useState(1)
 const [perPage, setPerPage] = useState(10)
 const [sortKey, setSortKey] = useState('nama')
 const [sortOrder, setSortOrder] = useState('asc')

 const [selectedStudentId, setSelectedStudentId] = useState(null)
 const [showExport, setShowExport] = useState(false)
 const [activeKpiModal, setActiveKpiModal] = useState(null)

 const [academicYears, setAcademicYears] = useState([])
 const [selectedYear, setSelectedYear] = useState('all')

 useEffect(() => {
 api.get('/foundation/units')
 .then((res) => {
 const raw = res.data?.data || res.data || []
 setUnits(Array.isArray(raw) ? raw : [])
 })
 .catch(() => {})

 api.get('/master/tahun-ajaran')
 .then((res) => {
 const raw = res.data?.data || res.data || []
 setAcademicYears(Array.isArray(raw) ? raw : [])
 })
 .catch(() => {})
 }, [])

 const fetchStudents = useCallback(async (silent = false) => {
 if (!silent) setLoading(true)
 else setIsFetching(true)
 setError(false)
 try {
 const params = {
 search: debouncedSearch || undefined,
 unit_id: selectedUnit !== 'all' ? selectedUnit : undefined,
 academic_year_id: selectedYear !== 'all' ? selectedYear : undefined,
 gender: selectedGender !== 'all' ? selectedGender : undefined,
 per_page: 100,
 }
 const res = await api.get('/foundation/students', { params })
 const resData = res.data
 let list = []
 if (Array.isArray(resData)) {
 list = resData
 } else if (resData?.data) {
 list = Array.isArray(resData.data) ? resData.data : resData.data.data || []
 }
 setStudents(list)
 } catch (err) {
 console.error('Failed to fetch foundation students:', err)
 setError(true)
 } finally {
 setLoading(false)
 setIsFetching(false)
 }
 }, [debouncedSearch, selectedUnit, selectedYear, selectedGender])

 useEffect(() => {
 fetchStudents()
 }, [fetchStudents])

 // Filter dilakukan di backend via params (search, unit_id, gender).
 // FE tidak perlu filter ulang — langsung pakai data dari API.

 const handleSort = (key) => {
 if (sortKey === key) {
 setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
 } else {
 setSortKey(key)
 setSortOrder('asc')
 }
 }

 const sortedStudents = useMemo(() => {
 return [...students].sort((a, b) => {
 let aVal = ''
 let bVal = ''
 if (sortKey === 'nama') {
 aVal = (a.full_name || a.nama || '').toString().toLowerCase()
 bVal = (b.full_name || b.nama || '').toString().toLowerCase()
 } else if (sortKey === 'nis') {
 aVal = (a.nis || a.nisn || '').toString().toLowerCase()
 bVal = (b.nis || b.nisn || '').toString().toLowerCase()
 } else if (sortKey === 'gender') {
 aVal = (a.gender || '').toString().toLowerCase()
 bVal = (b.gender || '').toString().toLowerCase()
 } else if (sortKey === 'unit') {
 aVal = (a.education_unit?.name || a.unit?.name || '').toString().toLowerCase()
 bVal = (b.education_unit?.name || b.unit?.name || '').toString().toLowerCase()
 } else if (sortKey === 'kelas') {
 aVal = (a.kelas?.nama_kelas || a.school_class?.name || '').toString().toLowerCase()
 bVal = (b.kelas?.nama_kelas || b.school_class?.name || '').toString().toLowerCase()
 } else if (sortKey === 'status') {
 aVal = a.is_active || a.status === 'aktif' ? 1 : 0
 bVal = b.is_active || b.status === 'aktif' ? 1 : 0
 }

 if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
 if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
 return 0
 })
 }, [students, sortKey, sortOrder])

 const totalItems = sortedStudents.length
 const lastPage = Math.max(1, Math.ceil(totalItems / perPage))
 const paginatedStudents = sortedStudents.slice((page - 1) * perPage, page * perPage)

 const totalStudents = students.length
 const maleCount = students.filter((s) => s.gender === 'male' || s.gender === 'L').length
 const femaleCount = students.filter((s) => s.gender === 'female' || s.gender === 'P').length
 const activeCount = students.filter((s) => s.is_active || s.status === 'aktif').length

 const handleRefresh = () => {
 setPage(1)
 fetchStudents(Boolean(students.length))
 }

 const handlePrintWeekly = (st) => {
 const eduUnit = st.education_unit || (typeof st.unit === 'object' ? st.unit : null)
 const rawUnitName = eduUnit?.name || (typeof st.unit === 'string' ? st.unit : '') || st.unit_name || ''
 const finalUnitObj = eduUnit || (rawUnitName ? { name: rawUnitName, code: rawUnitName } : null)

 printWeeklyStudentEvaluation({
 student: {
 ...st,
 name: st.full_name || st.nama || st.name,
 nis: st.nis || st.nisn || '-',
 className: st.kelas?.nama_kelas || st.school_class?.name || '-',
 unit: rawUnitName,
 unitName: rawUnitName,
 education_unit: finalUnitObj,
 },
 period: {
 title: 'Pekan Berjalan',
 academicYear: '2026/2027',
 },
 homeroomTeacher: {
 name: st.kelas?.wali_kelas_nama || 'Wali Kelas',
 },
 guruWali: {
 name: 'Guru Wali',
 },
 schoolCity: eduUnit?.metadata?.city || 'Padang',
 })
 }

 const exportRows = paginatedStudents.map((st, idx) => ({
 No: (page - 1) * perPage + idx + 1,
 'NIS / NISN': st.nis || st.nisn || '-',
 Nama: st.full_name || st.nama || '-',
 Gender: GENDER_LABEL[st.gender] || st.gender || '-',
 'Unit Pendidikan': st.education_unit?.name || st.unit?.name || '-',
 'Kelas / Rombel': st.kelas?.nama_kelas || st.school_class?.name || 'Belum Ada',
 Status: st.is_active || st.status === 'aktif' ? 'Aktif' : 'Nonaktif',
 }))

 return (
 <MasterDataPage hideBreadcrumb className="foundation-students-page">
 <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-12">
 {/* Breadcrumb Navigation */}
 <motion.div variants={itemVariants} className="print:hidden">
 <AppBreadcrumb items={[{ label: 'Yayasan', href: '/dashboard/yayasan' }, { label: 'Data Siswa' }]} />
 </motion.div>

 {/* Header Halaman Modern Hero Card */}
        <motion.div variants={itemVariants} className="print:hidden">
          <HeroUiHeader
            title="Monitoring Peserta Didik Lintas Unit"
            subtitle="Pemantauan dan rekapitulasi data induk seluruh santri dan peserta didik aktif di seluruh unit sekolah yayasan."
            badge="Siswa Yayasan"
            icon={GraduationCap}
            actions={
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-100 px-3.5 py-1.5 text-xs font-black text-emerald-900 dark:border-emerald-800/60 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Siswa Realtime</span>
              </div>
            }
          />
        </motion.div>

        {/* Stat Cards Ringkasan Siswa (HeroUI Card dengan Warna Semantik) */}
 <motion.div variants={itemVariants}>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {[
 {
 label: 'Total Siswa',
 value: totalStudents,
 description: 'Terdata di sistem',
 icon: GraduationCap,
 cardClass: 'border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] hover:border-emerald-300 dark:hover:border-emerald-200/80 hover:shadow-sm dark:border-emerald-800/60 dark:from-emerald-950/50 dark:via-teal-950/25 dark:to-[#1B2433]',
 iconClass: 'from-emerald-500 via-emerald-600 to-teal-700 shadow-sm',
 glowClass: 'bg-emerald-500/20',
 labelClass: 'text-emerald-800 dark:text-emerald-300',
 valueClass: 'text-emerald-950 dark:text-emerald-100',
 descClass: 'text-emerald-700/80 dark:text-emerald-400/80',
 },
 {
 label: 'Laki-Laki',
 value: maleCount,
 description: 'Siswa laki-laki',
 icon: UserRound,
 cardClass: 'border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] hover:border-emerald-300 dark:hover:border-emerald-200/80 hover:shadow-sky-500/15 dark:border-emerald-800/60 dark:from-sky-950/50 dark:via-blue-950/25 dark:to-[#1B2433]',
 iconClass: 'from-sky-400 via-sky-500 to-blue-600 shadow-sky-500/30',
 glowClass: 'bg-sky-500/20',
 labelClass: 'text-sky-800 dark:text-sky-300',
 valueClass: 'text-sky-950 dark:text-sky-100',
 descClass: 'text-sky-700/80 dark:text-sky-400/80',
 },
 {
 label: 'Perempuan',
 value: femaleCount,
 description: 'Siswi perempuan',
 icon: UserCheck,
 cardClass: 'border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] hover:border-emerald-300 dark:hover:border-emerald-200/80 hover:shadow-sm dark:border-emerald-800/60 dark:from-rose-950/50 dark:via-pink-950/25 dark:to-[#1B2433]',
 iconClass: 'from-rose-500 via-pink-500 to-rose-600 shadow-sm',
 glowClass: 'bg-rose-500/20',
 labelClass: 'text-rose-800 dark:text-rose-300',
 valueClass: 'text-rose-950 dark:text-rose-100',
 descClass: 'text-rose-700/80 dark:text-rose-400/80',
 },
 {
 label: 'Siswa Aktif',
 value: activeCount,
 description: 'Status aktif',
 icon: UsersRound,
 cardClass: 'border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] hover:border-emerald-300 dark:hover:border-emerald-200/80 hover:shadow-sm dark:border-emerald-800/60 dark:from-indigo-950/50 dark:via-violet-950/25 dark:to-[#1B2433]',
 iconClass: 'from-indigo-500 via-indigo-600 to-violet-700 shadow-sm',
 glowClass: 'bg-indigo-500/20',
 labelClass: 'text-indigo-800 dark:text-indigo-300',
 valueClass: 'text-indigo-950 dark:text-indigo-100',
 descClass: 'text-indigo-700/80 dark:text-indigo-400/80',
 },
 ].map((stat) => {
 const StatIcon = stat.icon
 return (
 <Card
 key={stat.label}
 className={`group relative overflow-hidden rounded-xl border-2 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${stat.cardClass}`}
 >
 <Card.Content className="relative z-10 flex flex-row items-center gap-3.5 p-4">
 <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-md border border-emerald-200/30 transition-transform duration-200 group-hover:scale-105 ${stat.iconClass}`}>
 <StatIcon className="h-5 w-5" strokeWidth={2.2} />
 </div>
 <div className="min-w-0 flex-1">
 <p className={`text-xs font-black uppercase tracking-wider truncate ${stat.labelClass}`}>{stat.label}</p>
 <p className={`text-2xl font-black tracking-tight leading-tight mt-0.5 ${stat.valueClass}`}>
 {loading ? '—' : Number(stat.value ?? 0).toLocaleString('id-ID')}
 </p>
 <p className={`text-xs font-semibold truncate mt-0.5 ${stat.descClass}`}>{stat.description}</p>
 </div>
 </Card.Content>
 </Card>
 )
 })}
 </div>
 </motion.div>

 {/* Quick Action KPI Cards (HeroUI Card dengan Warna Semantik Penuh) */}
 <motion.section variants={itemVariants} className="mb-6">
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
 {/* 1. Siswa Aktif (Tahun Ajaran) */}
 <Card
 onClick={() => setActiveKpiModal('peningkatan')}
 className="group relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 bg-white dark:bg-[#1B2433] shadow-md shadow-emerald-500/10 transition-all duration-200 hover:scale-[1.02] hover:border-emerald-500/50 hover:shadow-lg cursor-pointer"
 >
 <Card.Content className="flex flex-row items-center justify-between gap-3 p-3.5">
 <div className="flex items-center gap-3 min-w-0">
 <div className="flex h-9 w-11 shrink-0 items-center justify-center rounded-[15px] bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-xs transition-transform duration-200 group-hover:scale-110">
 <GraduationCap className="h-5 w-5" />
 </div>
 <div className="min-w-0 text-left">
 <p className="text-xs font-extrabold text-emerald-950 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300">Siswa Aktif (Tahun Ajaran)</p>
 <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 font-semibold truncate mt-0.5">{activeCount} Siswa Terdaftar</p>
 </div>
 </div>
 <Chip size="sm" color="success" variant="soft" className="font-extrabold text-[10px] shrink-0">Aktif</Chip>
 </Card.Content>
 </Card>

 {/* 2. Siswa Masuk (Baru) */}
 <Card
 onClick={() => setActiveKpiModal('siswa_mobility')}
 className="group relative overflow-hidden rounded-2xl border-2 border-sky-500/30 bg-white dark:bg-[#1B2433] shadow-md shadow-sky-500/10 transition-all duration-200 hover:scale-[1.02] hover:border-sky-500/50 hover:shadow-lg cursor-pointer"
 >
 <Card.Content className="flex flex-row items-center justify-between gap-3 p-3.5">
 <div className="flex items-center gap-3 min-w-0">
 <div className="flex h-9 w-11 shrink-0 items-center justify-center rounded-[15px] bg-white dark:bg-[#1B2433] shadow-sm shadow-sky-500/25 border border-emerald-200/80 dark:border-emerald-800/60 transition-transform duration-200 group-hover:scale-110">
 <UserCheck className="h-5 w-5" />
 </div>
 <div className="min-w-0 text-left">
 <p className="text-xs font-extrabold text-sky-950 dark:text-white truncate group-hover:text-sky-700 dark:group-hover:text-sky-300">Siswa Masuk (Baru)</p>
 <p className="text-xs text-sky-700/80 dark:text-sky-400/80 font-semibold truncate mt-0.5">Pendaftaran Siswa Baru</p>
 </div>
 </div>
 <Chip size="sm" color="accent" variant="soft" className="font-extrabold text-[10px] shrink-0">Baru</Chip>
 </Card.Content>
 </Card>

 {/* 3. Siswa Keluar (Mutasi) */}
 <Card
 onClick={() => setActiveKpiModal('siswa_mobility')}
 className="group relative overflow-hidden rounded-2xl border-2 border-amber-500/30 bg-white dark:bg-[#1B2433] shadow-md shadow-amber-500/10 transition-all duration-200 hover:scale-[1.02] hover:border-amber-500/50 hover:shadow-lg cursor-pointer"
 >
 <Card.Content className="flex flex-row items-center justify-between gap-3 p-3.5">
 <div className="flex items-center gap-3 min-w-0">
 <div className="flex h-9 w-11 shrink-0 items-center justify-center rounded-[15px] bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-xs transition-transform duration-200 group-hover:scale-110">
 <UserMinus className="h-5 w-5" />
 </div>
 <div className="min-w-0 text-left">
 <p className="text-xs font-extrabold text-amber-950 dark:text-white truncate group-hover:text-amber-700 dark:group-hover:text-amber-300">Siswa Keluar (Mutasi)</p>
 <p className="text-xs text-amber-700/80 dark:text-amber-400/80 font-semibold truncate mt-0.5">Riwayat Mutasi Siswa</p>
 </div>
 </div>
 <Chip size="sm" color="warning" variant="soft" className="font-extrabold text-[10px] shrink-0">Mutasi</Chip>
 </Card.Content>
 </Card>

 {/* 4. Kelulusan & Alumni */}
 <Card
 onClick={() => setActiveKpiModal('alumni')}
 className="group relative overflow-hidden rounded-2xl border-2 border-purple-500/30 bg-white dark:bg-[#1B2433] shadow-md shadow-purple-500/10 transition-all duration-200 hover:scale-[1.02] hover:border-purple-500/50 hover:shadow-lg cursor-pointer"
 >
 <Card.Content className="flex flex-row items-center justify-between gap-3 p-3.5">
 <div className="flex items-center gap-3 min-w-0">
 <div className="flex h-9 w-11 shrink-0 items-center justify-center rounded-[15px] bg-white dark:bg-[#1B2433] shadow-xs transition-transform duration-200 group-hover:scale-110">
 <Award className="h-5 w-5" />
 </div>
 <div className="min-w-0 text-left">
 <p className="text-xs font-extrabold text-purple-950 dark:text-white truncate group-hover:text-purple-700 dark:group-hover:text-purple-300">Kelulusan & Alumni</p>
 <p className="text-xs text-purple-700/80 dark:text-purple-400/80 font-semibold truncate mt-0.5">Data Lulusan & Alumni</p>
 </div>
 </div>
 <Chip size="sm" color="default" variant="soft" className="font-extrabold text-[10px] shrink-0 bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">Alumni</Chip>
 </Card.Content>
 </Card>
 </div>
 </motion.section>

 <motion.div variants={itemVariants}>
 {/* Emerald Datatable Container (3-Row Structured Toolbar + HeroUI Controls) */}
 <div
 id="tabel-yayasan-siswa"
 className="foundation-table scroll-mt-6 relative overflow-hidden rounded-2xl border-2 border-emerald-500/25 dark:border-emerald-600/35 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]"
 >
 {/* Baris 1: Toolbar Header */}
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-500/20 dark:border-emerald-800/40 bg-emerald-500/10 dark:bg-emerald-950/40 px-5 py-4 min-h-[72px]">
 <div className="flex items-center gap-3.5 min-w-0">
 <div className="flex size-8.5 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
 <GraduationCap className="size-4.5 text-white" strokeWidth={2.2} />
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2.5 flex-wrap">
 <h2 className="text-base font-bold text-emerald-900 dark:text-emerald-200 leading-tight">
 Daftar Siswa Aktif
 </h2>
 <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 border-2 border-emerald-300 px-2.5 py-0.5 text-xs font-bold dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-700/80">
 {totalItems} siswa
 </span>
 </div>
 <p className="mt-0.5 text-xs text-emerald-700/80 dark:text-emerald-400/80 font-medium">
 Data siswa sesuai filter dan kewenangan pengguna.
 </p>
 </div>
 </div>
 <div className="flex items-center gap-2 shrink-0">
 <button
 type="button"
 onClick={() => setShowExport(true)}
 className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50 px-3.5 py-1.5 text-xs font-bold text-sky-700 shadow-xs transition-all duration-200 hover:scale-105 hover:bg-sky-100 hover:shadow-md dark:border-emerald-800/60 dark:bg-sky-950/60 dark:text-sky-300 cursor-pointer"
 >
 <FileSpreadsheet className="h-3.5 w-3.5 text-sky-600" />
 <span>Export Data Siswa</span>
 </button>
 <button
 type="button"
 onClick={handleRefresh}
 aria-label="Muat ulang data"
 title="Muat ulang"
 className="inline-flex h-8.5 w-9 items-center justify-center rounded-xl border border-emerald-200/80 bg-white dark:bg-slate-900 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800/60 dark:text-slate-300 dark:hover:bg-emerald-950/40 shadow-2xs cursor-pointer"
 >
 <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
 </button>
 </div>
 </div>

 {/* Baris 2: Full-width Search Input */}
 <div className="border-b border-emerald-500/20 dark:border-emerald-800/40 bg-emerald-50/20 dark:bg-emerald-950/20 px-5 py-3">
 <div className="relative">
 <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600 dark:text-emerald-400 z-10" />
 <input
 type="search"
 value={search}
 onChange={(e) => { setSearch(e.target.value); setPage(1) }}
 placeholder="Cari NIS, NISN, atau nama siswa..."
 aria-label="Cari NIS, NISN, atau nama siswa"
 className="w-full h-9 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/80 bg-white dark:bg-[#1B2433] pl-10 pr-9 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
 />
 {search && (
 <button
 type="button"
 aria-label="Bersihkan pencarian"
 onClick={() => { setSearch(''); setPage(1) }}
 className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 focus-visible:outline-none"
 >
 ×
 </button>
 )}
 </div>
 </div>

 {/* Baris 3: Horizontal Filter Bar (HeroUiFilterSelect + Reset) */}
 <div className="flex flex-wrap items-center gap-2.5 border-b border-emerald-500/20 dark:border-emerald-800/40 bg-emerald-50/30 dark:bg-emerald-950/30 px-5 py-3">
 <div className="w-full sm:w-56">
 <HeroUiFilterSelect
 size="sm"
 searchable
 value={String(selectedUnit)}
 onChange={(val) => { setSelectedUnit(val); setPage(1) }}
 ariaLabel="Filter unit pendidikan"
 placeholder="Semua Unit Pendidikan"
 options={[
 { value: 'all', label: 'Semua Unit Pendidikan' },
 ...units.map((u) => ({ value: String(u.id), label: u.name || u.code })),
 ]}
 />
 </div>
 <div className="w-full sm:w-48">
 <HeroUiFilterSelect
 size="sm"
 value={String(selectedYear)}
 onChange={(val) => { setSelectedYear(val); setPage(1) }}
 ariaLabel="Filter tahun ajaran"
 placeholder="Semua Tahun Ajaran"
 options={[
 { value: 'all', label: 'Semua Tahun Ajaran' },
 ...academicYears.map((ay) => ({ value: String(ay.id), label: ay.nama || ay.name })),
 ]}
 />
 </div>
 <div className="w-full sm:w-40">
 <HeroUiFilterSelect
 size="sm"
 value={String(selectedGender)}
 onChange={(val) => { setSelectedGender(val); setPage(1) }}
 ariaLabel="Filter gender"
 placeholder="Semua Gender"
 options={[
 { value: 'all', label: 'Semua Gender' },
 { value: 'L', label: 'Laki-Laki' },
 { value: 'P', label: 'Perempuan' },
 ]}
 />
 </div>
 <div className="w-full sm:w-40">
 <HeroUiFilterSelect
 size="sm"
 value={String(perPage)}
 onChange={(val) => { setPerPage(Number(val)); setPage(1) }}
 ariaLabel="Tampilkan per halaman"
 options={[
 { value: '5', label: '5 per Halaman' },
 { value: '10', label: '10 per Halaman' },
 { value: '15', label: '15 per Halaman' },
 { value: '25', label: '25 per Halaman' },
 { value: '50', label: '50 per Halaman' },
 { value: '100', label: '100 per Halaman' },
 ]}
 />
 </div>
 {(selectedUnit !== 'all' || selectedYear !== 'all' || selectedGender !== 'all' || search !== '') && (
 <Button
 size="sm"
 variant="flat"
 color="danger"
 radius="lg"
 startContent={<RotateCcw className="h-3.5 w-3.5" />}
 onPress={() => {
 setSelectedUnit('all')
 setSelectedYear('all')
 setSelectedGender('all')
 setSearch('')
 setPage(1)
 }}
 className="font-bold text-xs"
 >
 Reset
 </Button>
 )}
 </div>

 <div className="overflow-x-auto rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
 {error ? (
 <div className="p-5"><MasterErrorState title="Data siswa gagal dimuat" description="Periksa koneksi kemudian coba muat ulang." onRetry={handleRefresh} /></div>
 ) : (
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200 font-extrabold uppercase tracking-wider text-xs">
            <tr>
              <th className="w-[30%] px-3 py-3.5 font-bold">
                <button
                  type="button"
                  onClick={() => handleSort('nama')}
                  className="inline-flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <span>IDENTITAS SISWA &amp; NIS</span>
                  <ArrowBothDirectionHorizontal2 className={`h-3 w-3 shrink-0 transition-transform duration-200 ${sortKey === 'nama' ? 'text-emerald-600 dark:text-emerald-400 rotate-180' : 'text-slate-400'}`} />
                </button>
              </th>
              <th className="w-[22%] px-3 py-3.5 font-bold">
                <button
                  type="button"
                  onClick={() => handleSort('unit')}
                  className="inline-flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <span>UNIT PENDIDIKAN</span>
                  <ArrowBothDirectionHorizontal2 className={`h-3 w-3 shrink-0 transition-transform duration-200 ${sortKey === 'unit' ? 'text-emerald-600 dark:text-emerald-400 rotate-180' : 'text-slate-400'}`} />
                </button>
              </th>
              <th className="w-[18%] px-3 py-3.5 font-bold">
                <button
                  type="button"
                  onClick={() => handleSort('kelas')}
                  className="inline-flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <span>KELAS / ROMBEL</span>
                  <ArrowBothDirectionHorizontal2 className={`h-3 w-3 shrink-0 transition-transform duration-200 ${sortKey === 'kelas' ? 'text-emerald-600 dark:text-emerald-400 rotate-180' : 'text-slate-400'}`} />
                </button>
              </th>
              <th className="w-[18%] px-2 py-3.5 text-center font-bold">
                <button
                  type="button"
                  onClick={() => handleSort('status')}
                  className="inline-flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer hover:text-slate-900 dark:hover:text-white mx-auto"
                >
                  <span>GENDER &amp; STATUS</span>
                  <ArrowBothDirectionHorizontal2 className={`h-3 w-3 shrink-0 transition-transform duration-200 ${sortKey === 'status' ? 'text-emerald-600 dark:text-emerald-400 rotate-180' : 'text-slate-400'}`} />
                </button>
              </th>
              <th className="w-[12%] px-2 py-3.5 text-right select-none"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td colSpan={5} className="px-4 py-4"><div className="h-9 rounded-xl bg-slate-100 dark:bg-slate-800" /></td>
                </tr>
              ))
            ) : paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-5"><MasterEmptyState title="Belum ada data siswa" description="Ubah filter pencarian untuk menampilkan peserta didik lain." /></td>
              </tr>
            ) : (
              paginatedStudents.map((st, idx) => {
                const gender = GENDER_LABEL[st.gender] || st.gender || '-'
                return (
                  <tr key={st.id || idx} className="transition-colors hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20">
                    <td className="px-3 py-3.5">
                      <PersonIdentityCell
                        src={st.photo}
                        name={st.full_name || st.nama}
                        subtitle={st.nis || st.nisn || '-'}
                      />
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{st.education_unit?.name || st.unit?.name || '-'}</span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="text-xs text-slate-600 dark:text-slate-300">{st.kelas?.nama_kelas || st.school_class?.name || 'Belum Ada'}</span>
                    </td>
                    <td className="px-2 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{gender}</span>
                        <AppBadge variant={st.is_active || st.status === 'aktif' ? 'success' : 'danger'} dot>
                          {st.is_active || st.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                        </AppBadge>
                      </div>
                    </td>
                    <td className="px-2 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          title="Cetak Laporan Perkembangan Pekanan"
                          onClick={() => handlePrintWeekly(st)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-indigo-200/80 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:scale-105 active:scale-95 transition-all dark:border-indigo-800/60 dark:bg-indigo-950/60 dark:text-indigo-300 shadow-2xs cursor-pointer"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                        <ActionDropdown onView={() => setSelectedStudentId(st.id)} />
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
 )}
 </div>

 {!loading && !error && totalItems > 0 && (
 <div className="w-full border-t border-emerald-500/20 dark:border-emerald-800/40 px-4 py-3.5 sm:px-6 md:px-8 bg-emerald-500/5 dark:bg-emerald-950/20 print:hidden">
 <Pagination
 currentPage={page}
 totalPages={lastPage}
 sideLayout="full"
 onPageChange={setPage}
 />
 </div>
 )}
 </div>

 <KpiDetailDrawer
 type="siswa"
 id={selectedStudentId}
 isOpen={Boolean(selectedStudentId)}
 onClose={() => setSelectedStudentId(null)}
 />

 <FoundationUnitKpiModal
 type={activeKpiModal || 'peningkatan'}
 isOpen={Boolean(activeKpiModal)}
 onClose={() => setActiveKpiModal(null)}
 units={units}
 />

 <FoundationExportModal
 isOpen={showExport}
 onClose={() => setShowExport(false)}
 title="Data Siswa Seluruh Yayasan"
 rows={exportRows}
 filename="Data_Siswa_Yayasan"
 />

 {/* Smart Floating Scroll Navigator */}
 <SmartScrollFab targetId="tabel-yayasan-siswa" downTooltip="Langsung ke Tabel Siswa" />
 </motion.div>
 </motion.div>
 </MasterDataPage>
 )
}
