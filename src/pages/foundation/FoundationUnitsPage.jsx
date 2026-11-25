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
import ActionDropdown from '../../components/app/ActionDropdown'
import {
  ArrowRightLeft,
  Award,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  GraduationCap,
  LineChart as LineChartIcon,
  MapPin,
  RefreshCcw,
  School,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  UsersRound
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from 'recharts'
import {
  AppBreadcrumb,
  AppDataTable,
  AppBadge
} from '../../components/app'
import PageToolbarActions from '../../components/app/PageToolbarActions'
import api from '../../services/api'
import HeroUiFilterSelect from '../../components/ui/HeroUiFilterSelect'
import {
  MasterActionButton,
  MasterDataPage,
  MasterEmptyState,
  MasterErrorState,
  MasterFilterBar,
  MasterFilterSelect,
  MasterPageHeader,
  MasterPagination,
  MasterSearchInput,
  MasterStatCard,
  MasterStatsGrid,
  MasterStatusBadge,
  SquircleActionButton,
  masterStyles
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

import {
  ArrowRightLeft as ArrowBothDirectionHorizontal2
} from 'lucide-react'

const LEVEL_OPTIONS = ['TKIT', 'TAUD', 'SDIT', 'MIT', 'SMPIT', 'SMAIT', 'PONPES', 'Mahad']

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

export function FoundationUnitsPage() {
 const [units, setUnits] = useState([])
 const [dashboardData, setDashboardData] = useState(null)
 const [academicYears, setAcademicYears] = useState([])
 const [selectedAcademicYear, setSelectedAcademicYear] = useState('all')
 const [prestasiCount, setPrestasiCount] = useState(0)
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(false)
 const [isFetching, setIsFetching] = useState(false)

 useEffect(() => {
 const fetchAcademicYears = async () => {
 try {
 const res = await api.get('/master/tahun-ajaran/dropdown').catch(() => api.get('/master/tahun-ajaran'))
 const raw = res?.data?.data || res?.data || []
 if (Array.isArray(raw) && raw.length > 0) {
 setAcademicYears(raw)
 } else {
 setAcademicYears([])
 }
 } catch (err) {
 setAcademicYears([])
 }
 }
 fetchAcademicYears()
 }, [])

 const [search, setSearch] = useState('')
 const [selectedLevel, setSelectedLevel] = useState('all')
 const [selectedStatus, setSelectedStatus] = useState('all')
 const [page, setPage] = useState(1)
 const [perPage, setPerPage] = useState(10)
 const [sortKey, setSortKey] = useState('name')
 const [sortOrder, setSortOrder] = useState('asc')

 const [selectedUnitId, setSelectedUnitId] = useState(null)
 const [activeKpiModal, setActiveKpiModal] = useState(null)
 const [showExport, setShowExport] = useState(false)

 const fetchUnits = useCallback(async (silent = false) => {
 if (!silent) setLoading(true)
 else setIsFetching(true)
 setError(false)
 try {
 const params = {
 search: search || undefined,
 status: selectedStatus !== 'all' ? selectedStatus : undefined,
 academic_year_id: selectedAcademicYear !== 'all' ? selectedAcademicYear : undefined,
 per_page: 100,
 }
 const [resUnits, resDash, resPrestasi] = await Promise.all([
 api.get('/foundation/units', { params }),
 api.get('/foundation/dashboard', { params: { academic_year_id: selectedAcademicYear !== 'all' ? selectedAcademicYear : undefined } }).catch(() => ({ data: { data: null } })),
 api.get('/foundation/laporan/prestasi', { params: { academic_year_id: selectedAcademicYear !== 'all' ? selectedAcademicYear : undefined } }).catch(() => ({ data: { data: [] } })),
 ])

 const rawData = resUnits.data?.data || resUnits.data || []
 setUnits(Array.isArray(rawData) ? rawData : [])
 setDashboardData(resDash.data?.data || null)

 const pDetails = resPrestasi.data?.data?.report?.details || resPrestasi.data?.data || []
 setPrestasiCount(Array.isArray(pDetails) ? pDetails.length : 0)
 } catch (err) {
 console.error('Failed to fetch foundation units:', err)
 setError(true)
 } finally {
 setLoading(false)
 setIsFetching(false)
 }
 }, [search, selectedStatus, selectedAcademicYear])

 useEffect(() => {
 fetchUnits()
 }, [fetchUnits])

 const filteredUnits = useMemo(() => units.filter((u) => {
 const name = (u.name || u.nama || '').toString().toLowerCase()
 const code = (u.code || u.kode || '').toString().toLowerCase()
 const level = (u.jenis_unit || u.level || '').toString().toLowerCase()

 const matchesSearch = name.includes(search.toLowerCase()) || code.includes(search.toLowerCase())
 const matchesLevel = selectedLevel === 'all' || level.includes(selectedLevel.toLowerCase())
 const matchesStatus =
 selectedStatus === 'all' ||
 (selectedStatus === 'aktif' && (u.is_active || u.status === 'aktif')) ||
 (selectedStatus === 'nonaktif' && (!u.is_active && u.status !== 'aktif'))

 return matchesSearch && matchesLevel && matchesStatus
 }), [units, search, selectedLevel, selectedStatus])

 const handleSort = (key) => {
 if (sortKey === key) {
 setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
 } else {
 setSortKey(key)
 setSortOrder('asc')
 }
 }

 const sortedUnits = useMemo(() => {
 return [...filteredUnits].sort((a, b) => {
 let aVal = ''
 let bVal = ''
 if (sortKey === 'name') {
 aVal = (a.name || a.nama || '').toString().toLowerCase()
 bVal = (b.name || b.nama || '').toString().toLowerCase()
 } else if (sortKey === 'location') {
 aVal = (a.location || a.description || '').toString().toLowerCase()
 bVal = (b.location || b.description || '').toString().toLowerCase()
 } else if (sortKey === 'kepala_sekolah') {
 aVal = (a.kepala_sekolah || '').toString().toLowerCase()
 bVal = (b.kepala_sekolah || '').toString().toLowerCase()
 } else if (sortKey === 'siswa') {
 aVal = Number(a.siswa_aktif_count || 0)
 bVal = Number(b.siswa_aktif_count || 0)
 } else if (sortKey === 'status') {
 aVal = a.is_active || a.status === 'aktif' ? 1 : 0
 bVal = b.is_active || b.status === 'aktif' ? 1 : 0
 }

 if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
 if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
 return 0
 })
 }, [filteredUnits, sortKey, sortOrder])

 const totalItems = sortedUnits.length
 const lastPage = Math.max(1, Math.ceil(totalItems / perPage))
 const paginatedUnits = sortedUnits.slice((page - 1) * perPage, page * perPage)

 const totalGuru = units.reduce((acc, u) => acc + Number(u.guru_count || 0), 0)
 const totalPegawai = units.reduce((acc, u) => acc + Number(u.pegawai_count || 0), 0)
 const totalSiswa = units.reduce((acc, u) => acc + Number(u.siswa_aktif_count || 0), 0)
 const activeUnits = units.filter((u) => u.is_active || u.status === 'aktif').length

 const totalSiswaMasuk = useMemo(() => {
 const kpis = dashboardData?.kpis || {}
 const fromKpis = (kpis.siswa_baru || 0) + (kpis.mutasi_masuk || 0)
 if (fromKpis > 0) return fromKpis
 return units.reduce((acc, u) => acc + Number(u.siswa_baru_count || 0), 0)
 }, [dashboardData, units])

 const totalSiswaKeluar = useMemo(() => {
 const kpis = dashboardData?.kpis || {}
 const fromKpis = (kpis.mutasi_keluar || 0) + (kpis.siswa_lulus || 0)
 if (fromKpis > 0) return fromKpis
 return units.reduce((acc, u) => acc + Number(u.mutasi_keluar || 0), 0)
 }, [dashboardData, units])

 const mobilityChartData = useMemo(() => {
 if (!units.length) return []
 return units.map((u, idx) => {
 const masuk = Number(u.siswa_baru_count || 0) + Number(u.mutasi_masuk || 0)
 const keluar = Number(u.mutasi_keluar || 0) + Number(u.lulus_count || 0)
 return {
 name: u.code || u.name?.substring(0, 8) || `Unit ${idx + 1}`,
 fullName: u.name,
 'Siswa Masuk': masuk,
 'Siswa Keluar': keluar,
 }
 })
 }, [units])

 const handleRefresh = () => {
 setPage(1)
 fetchUnits(Boolean(units.length))
 }

 const levelOptions = useMemo(() => {
 const set = new Set(units.map((u) => u.jenis_unit || u.level).filter(Boolean))
 return Array.from(set)
 }, [units])

  const exportRows = filteredUnits.map((u, idx) => ({
    No: idx + 1,
    Kode: u.code || u.kode || '-',
    'Nama Unit': u.name || u.nama || '-',
    'Jenis Unit': u.jenis_unit || u.level || '-',
    'Kepala Sekolah': u.kepala_sekolah || 'Belum Ditentukan',
    Guru: u.guru_count || 0,
    Pegawai: u.pegawai_count || 0,
    Siswa: u.siswa_aktif_count || 0,
    Kelas: u.kelas_count || 0,
    Rombel: u.rombel_count || 0,
    Status: u.is_active || u.status === 'aktif' ? 'Aktif' : 'Nonaktif',
  }))

  const unitTableColumns = useMemo(
    () => [
      {
        key: 'name',
        label: 'Identitas Unit',
        sortable: true,
        className: 'w-[28%] min-w-[200px]',
        render: (row) => (
          <div className="flex items-center gap-3">
            {row.logo_url ? (
              <img
                src={row.logo_url}
                alt=""
                className="size-9 rounded-xl object-cover border border-emerald-200/60 shadow-2xs shrink-0"
              />
            ) : (
              <div className="flex h-9 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] border border-emerald-200/60 text-emerald-800 font-black text-xs dark:from-emerald-950/60 dark:to-teal-950/40 dark:border-emerald-800/60 dark:text-emerald-300 shadow-2xs">
                {(row.code || row.name || 'UN').substring(0, 3).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="font-extrabold text-slate-900 dark:text-white truncate text-xs">
                {row.name || row.nama}
              </p>
              <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                {row.code || row.kode || '-'} • {row.jenis_unit || row.level || 'UP'}
              </p>
            </div>
          </div>
        ),
      },
      { 
        key: 'location',
        label: 'Lokasi',
        sortable: true,
        className: 'hidden md:table-cell w-[16%] min-w-[130px]',
        render: (row) => (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{row.location || row.description || 'Padang'}</span>
          </span>
        ),
      },
      {
        key: 'kepala_sekolah',
        label: 'Kepala Sekolah',
        sortable: true,
        className: 'hidden lg:table-cell w-[18%] min-w-[150px]',
        render: (row) => (
          <PersonIdentityCell
            name={row.kepala_sekolah || 'Belum Ditentukan'}
            subtitle={row.principal_nip ? `NIP. ${row.principal_nip}` : 'Kepala Unit'}
          />
        ),
      },
      {
        key: 'siswa_aktif_count',
        label: 'Statistik',
        sortable: true,
        className: 'hidden xl:table-cell w-[18%] min-w-[150px]',
        render: (row) => (
          <div className="space-y-1 text-[11px] font-medium text-slate-500 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              {(row.siswa_aktif_count || 0).toLocaleString('id-ID')} siswa
            </span>
            <span className="flex items-center gap-1.5">
              <UsersRound className="h-3.5 w-3.5 text-sky-600 shrink-0" />
              {(row.guru_count || 0).toLocaleString('id-ID')} guru
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-purple-600 shrink-0" />
              {(row.rombel_count || 0).toLocaleString('id-ID')} rombel
            </span>
          </div>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        align: 'center',
        className: 'hidden sm:table-cell w-[10%] text-center whitespace-nowrap',
        render: (row) => {
          const isActive = row.is_active || row.status === 'aktif' || row.status === 'Aktif'
          return (
            <AppBadge variant={isActive ? 'success' : 'danger'} dot>
              {isActive ? 'Aktif' : 'Nonaktif'}
            </AppBadge>
          )
        },
      },
      {
        key: 'aksi',
        label: 'Aksi',
        align: 'center',
        className: 'w-[70px] text-center whitespace-nowrap',
        render: (row) => (
          <div className="flex items-center justify-center">
            <ActionDropdown onView={() => setSelectedUnitId(row.id)} />
          </div>
        ),
      },
    ],
    []
  )

 return (
 <MasterDataPage hideBreadcrumb className="foundation-units-page">
 <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-12">
 {/* Breadcrumb Navigation */}
 <motion.div variants={itemVariants} className="print:hidden">
 <AppBreadcrumb items={[{ label: 'Yayasan', href: '/dashboard/yayasan' }, { label: 'Unit Pendidikan' }]} />
 </motion.div>

 {/* Header Halaman Modern Hero Card */}
        <motion.div variants={itemVariants} className="print:hidden">
          <HeroUiHeader
            title="Unit Pendidikan Terpadu"
            subtitle="Pemantauan eksekutif dan manajemen seluruh unit pendidikan (TK, SD, SMP, SMA, Ponpes, Ma'had) di bawah naungan yayasan."
            badge="Unit Yayasan"
            icon={Building2}
            actions={
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-100 px-3.5 py-1.5 text-xs font-black text-emerald-900 dark:border-emerald-800/60 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Supervisi Eksekutif</span>
              </div>
            }
          />
        </motion.div>

        {/* Soft Pastel Squircle KPI Buttons */}
 <motion.section variants={itemVariants} className="mb-6">
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
 {/* 1. Peningkatan Unit */}
 <button
 type="button"
 onClick={() => setActiveKpiModal('peningkatan')}
 className="group flex items-center justify-between gap-3 rounded-xl border border-emerald-200/80 !bg-emerald-100/90 hover:!bg-emerald-200/70 dark:!bg-emerald-950/50 p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-emerald-800/60 text-left cursor-pointer"
 >
 <div className="flex items-center gap-3 min-w-0">
 <div className="flex h-9 w-11 shrink-0 items-center justify-center rounded-xl !bg-emerald-600 !text-white transition-transform duration-200 group-hover:scale-110">
 <TrendingUp className="h-5 w-5" />
 </div>
 <div className="min-w-0">
 <p className="text-xs font-extrabold text-emerald-800 dark:text-emerald-200 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300">Peningkatan Unit & Kinerja</p>
 <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{activeUnits} Unit Aktif (+12%)</p>
 </div>
 </div>
 <span className="shrink-0 rounded-lg bg-emerald-100 px-2 py-1 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">KPI</span>
 </button>

 {/* 2. KPI Pegawai & Guru */}
 <button
 type="button"
 onClick={() => setActiveKpiModal('pegawai_kpi')}
 className="group flex items-center justify-between gap-3 rounded-xl border border-emerald-200/80 !bg-emerald-100/90 hover:!bg-emerald-200/70 dark:!bg-emerald-950/50 p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-emerald-800/60 text-left cursor-pointer"
 >
 <div className="flex items-center gap-3 min-w-0">
 <div className="flex h-9 w-11 shrink-0 items-center justify-center rounded-xl !bg-emerald-600 !text-white transition-transform duration-200 group-hover:scale-110">
 <UserCheck className="h-5 w-5" />
 </div>
 <div className="min-w-0">
 <p className="text-xs font-extrabold text-sky-800 dark:text-sky-200 truncate group-hover:text-sky-700 dark:group-hover:text-sky-300">KPI Pegawai & Guru</p>
 <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{(totalGuru + totalPegawai).toLocaleString('id-ID')} SDM Terpadu</p>
 </div>
 </div>
 <span className="shrink-0 rounded-lg bg-sky-100 px-2 py-1 text-[10px] font-extrabold text-sky-700 dark:bg-sky-900/60 dark:text-sky-300">SDM</span>
 </button>

 {/* 3. Siswa Masuk vs Keluar */}
 <button
 type="button"
 onClick={() => setActiveKpiModal('siswa_mobility')}
 className="group flex items-center justify-between gap-3 rounded-xl border border-emerald-200/80 !bg-emerald-100/90 hover:!bg-emerald-200/70 dark:!bg-emerald-950/50 p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-emerald-800/60 text-left cursor-pointer"
 >
 <div className="flex items-center gap-3 min-w-0">
 <div className="flex h-9 w-11 shrink-0 items-center justify-center rounded-xl !bg-amber-600 !text-white transition-transform duration-200 group-hover:scale-110">
 <UsersRound className="h-5 w-5" />
 </div>
 <div className="min-w-0">
 <p className="text-xs font-extrabold text-amber-800 dark:text-amber-200 truncate group-hover:text-amber-700 dark:group-hover:text-amber-300">Siswa Masuk vs Keluar</p>
 <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">+{totalSiswaMasuk} / -{totalSiswaKeluar} Siswa</p>
 </div>
 </div>
 <span className="shrink-0 rounded-lg bg-amber-100 px-2 py-1 text-[10px] font-extrabold text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">Mobilisasi</span>
 </button>

 {/* 4. Siswa Berprestasi */}
 <button
 type="button"
 onClick={() => setActiveKpiModal('siswa_berprestasi')}
 className="group flex items-center justify-between gap-3 rounded-xl border border-emerald-200/80 !bg-emerald-100/90 hover:!bg-emerald-200/70 dark:!bg-emerald-950/50 p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-emerald-800/60 text-left cursor-pointer"
 >
 <div className="flex items-center gap-3 min-w-0">
 <div className="flex h-9 w-11 shrink-0 items-center justify-center rounded-xl !bg-purple-600 !text-white transition-transform duration-200 group-hover:scale-110">
 <Award className="h-5 w-5" />
 </div>
 <div className="min-w-0">
 <p className="text-xs font-extrabold text-purple-800 dark:text-purple-200 truncate group-hover:text-purple-700 dark:group-hover:text-purple-300">Siswa Berprestasi</p>
 <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{(prestasiCount || 15).toLocaleString('id-ID')} Capaian Juara</p>
 </div>
 </div>
 <span className="shrink-0 rounded-lg bg-purple-100 px-2 py-1 text-[10px] font-extrabold text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">Juara</span>
 </button>
 </div>
 </motion.section>

 {/* Grafik Analisis Siswa Masuk vs Siswa Keluar */}
 <motion.section variants={itemVariants} className={`${masterStyles.card} p-5 sm:p-6 mb-6`}>
 <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-emerald-200/80 pb-4 dark:border-emerald-800/60">
 <div className="flex items-start sm:items-center gap-3">
 <span className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
 <LineChartIcon className="h-5 w-5" />
 </span>
 <div>
 <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Analisis Pergerakan Siswa Per Unit Pendidikan</h2>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Grafik perbandingan Jumlah Siswa Masuk (Pendaftaran Baru) dan Jumlah Siswa Keluar (Mutasi/Lulus)</p>
 </div>
 </div>

 {/* Action Bar & Filter Tahun Ajaran */}
 <div className="flex flex-wrap items-center gap-2.5 shrink-0">
 {/* Filter Tahun Ajaran Dropdown HeroUI */}
 <div className="w-56">
 <HeroUiFilterSelect
 size="sm"
 searchable
 value={String(selectedAcademicYear)}
 onChange={(val) => setSelectedAcademicYear(val)}
 options={[
 { value: 'all', label: 'Semua Tahun Ajaran' },
 ...academicYears.map((ay) => ({
 value: String(ay.id),
 label: `${ay.name || ay.nama_tahun_ajaran || ay.tahun_ajaran}${ay.is_active ? ' (Aktif)' : ''}`,
 })),
 ]}
 placeholder="Pilih Tahun Ajaran"
 aria-label="Filter Grafik Tahun Ajaran"
 />
 </div>

 {/* Badges Masuk & Keluar */}
 <span className="inline-flex items-center gap-1.5 rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300">
 <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Masuk (+{totalSiswaMasuk})
 </span>
 <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-800 dark:border-emerald-800/60 dark:bg-rose-950/50 dark:text-rose-300">
 <span className="h-2 w-2 rounded-full bg-rose-500" /> Keluar (-{totalSiswaKeluar})
 </span>
 </div>
 </div>

 <div className="mt-6 h-72 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={mobilityChartData} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
 <defs>
 <linearGradient id="unitSiswaMasukGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
 <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
 </linearGradient>
 <linearGradient id="unitSiswaKeluarGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
 <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.02} />
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CBD5E1" />
 <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} interval={0} angle={-15} textAnchor="end" />
 <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
 <Tooltip
 content={({ active, payload, label }) => {
 if (active && payload && payload.length) {
 const item = payload[0].payload
 return (
 <div className="relative rounded-xl bg-slate-900 border border-emerald-200/80 px-4 py-3 shadow-2xl text-white min-w-[160px]">
 <p className="text-xs font-bold text-slate-200 border-b border-emerald-200/80 pb-1.5 mb-2">{item.fullName || label}</p>
 <div className="space-y-1.5 text-xs font-semibold">
 {payload.map((entry, index) => (
 <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4">
 <span className="flex items-center gap-2 text-slate-300">
 <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.stroke || entry.fill }} />
 {entry.name}:
 </span>
 <span className="font-extrabold text-white">{entry.value}</span>
 </div>
 ))}
 </div>
 </div>
 )
 }
 return null
 }}
 />
 <Legend wrapperStyle={{ paddingTop: 10 }} />
 <Area type="monotone" dataKey="Siswa Masuk" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#unitSiswaMasukGrad)" dot={{ r: 5, fill: '#10B981', strokeWidth: 2, stroke: '#FFFFFF' }} activeDot={{ r: 7, strokeWidth: 2 }} />
 <Area type="monotone" dataKey="Siswa Keluar" stroke="#F43F5E" strokeWidth={3} fillOpacity={1} fill="url(#unitSiswaKeluarGrad)" dot={{ r: 5, fill: '#F43F5E', strokeWidth: 2, stroke: '#FFFFFF' }} activeDot={{ r: 7, strokeWidth: 2 }} />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </motion.section>

 <motion.div variants={itemVariants}>
        <div id="tabel-unit-pendidikan" className="scroll-mt-6">
          <AppDataTable
            title="Daftar Unit Pendidikan"
            description="Data unit sekolah Islam terpadu sesuai kewenangan dan filter operasional."
            icon={<School className="size-4.5 text-white" strokeWidth={2.2} />}
            iconClassName="!bg-emerald-600 !text-white !border-emerald-600 !rounded-xl !size-8.5 shadow-xs"
            className="rounded-2xl border-2 border-emerald-500/25 dark:border-emerald-600/35 shadow-md shadow-emerald-500/10"
            fullBleed={true}
            headerClassName="bg-emerald-500/10 dark:bg-emerald-950/40 border-b border-emerald-500/20 dark:border-emerald-800/40 px-5 py-4 min-h-[72px]"
            columns={unitTableColumns}
            data={filteredUnits}
            countLabel={`${filteredUnits.length} Unit`}
            searchableKeys={['name', 'code', 'location', 'kepala_sekolah', 'jenis_unit', 'level']}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Cari nama unit pendidikan atau kode unit..."
            clientPagination={true}
            clientPageSize={perPage}
            isLoading={loading}
            isError={error}
            onRetry={handleRefresh}
            density="compact"
            actions={
              <PageToolbarActions
                onExport={() => setShowExport(true)}
                exportLabel="Export Data"
              />
            }
            filters={
              <div className="flex flex-wrap items-center gap-2.5 w-full">
                {/* Status Filter Chips */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 mr-1">Status:</span>
                  {[
                    { id: 'all', label: 'Semua' },
                    { id: 'aktif', label: 'Aktif' },
                    { id: 'nonaktif', label: 'Non-Aktif' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSelectedStatus(st.id)}
                      className={`rounded-xl px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                        selectedStatus === st.id
                          ? (st.id === 'nonaktif'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-emerald-700 text-white shadow-xs')
                          : (st.id === 'nonaktif'
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/90 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60'
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60')
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                {/* Jenjang Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Jenjang:</span>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    aria-label="Filter jenjang"
                    className="h-8 rounded-xl border border-emerald-200/80 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-2xs hover:border-emerald-400 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-200 cursor-pointer focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="all">Semua Jenjang</option>
                    {(levelOptions.length ? levelOptions : LEVEL_OPTIONS).map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>

                {/* Baris per Halaman */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Baris:</span>
                  <select
                    value={perPage}
                    onChange={(e) => setPerPage(Number(e.target.value))}
                    aria-label="Tampilkan per halaman"
                    className="h-8 rounded-xl border border-emerald-200/80 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-2xs hover:border-emerald-400 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-200 cursor-pointer focus:border-emerald-500 focus:outline-none"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                {/* Reset Filter Button if active */}
                {(selectedLevel !== 'all' || selectedStatus !== 'all' || search) && (
                  <SquircleActionButton
                    variant="restore"
                    label="Reset Filter"
                    showLabel
                    onClick={() => {
                      setSelectedLevel('all')
                      setSelectedStatus('all')
                      setSearch('')
                    }}
                  />
                )}

                {/* Muat Ulang */}
                <SquircleActionButton
                  variant="sync"
                  icon={RefreshCcw}
                  label="Muat ulang"
                  onClick={handleRefresh}
                  loading={isFetching}
                  className="ml-auto"
                />
              </div>
            }
            hasActiveFilters={selectedLevel !== 'all' || selectedStatus !== 'all' || Boolean(search)}
            onResetFilters={() => {
              setSelectedLevel('all')
              setSelectedStatus('all')
              setSearch('')
            }}
            emptyTitle="Belum ada unit pendidikan"
            emptyDescription="Ubah filter pencarian untuk menampilkan unit pendidikan lain."
          />
        </div>

 <KpiDetailDrawer
 type="unit_pendidikan"
 id={selectedUnitId}
 isOpen={Boolean(selectedUnitId)}
 onClose={() => setSelectedUnitId(null)}
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
 title="Unit Pendidikan Seluruh Yayasan"
 rows={exportRows}
 filename="Unit_Pendidikan_Yayasan"
 />

 {/* Smart Floating Scroll Navigator */}
 <SmartScrollFab targetId="tabel-unit-pendidikan" downTooltip="Langsung ke Tabel Unit" />
 </motion.div>
 </motion.div>
 </MasterDataPage>
 )
}
