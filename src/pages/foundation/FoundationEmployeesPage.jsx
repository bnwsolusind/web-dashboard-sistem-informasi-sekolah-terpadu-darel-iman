import { HeroUiHeader } from "../../components/ui/HeroUiHeader"
import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'
import {
  useNavigate
} from 'react-router-dom'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  BadgeCheck,
  BarChart3,
  Calendar,
  Clock,
  Eye,
  FileSpreadsheet,
  LineChart as LineChartIcon,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  UsersRound,
  Search
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
  ArrowRightLeft as ArrowBothDirectionHorizontal2
} from 'lucide-react'
import AppBreadcrumb from '../../components/app/AppBreadcrumb'
import { AppBadge, AppDataTable } from '../../components/app'
import { Pagination } from '../../components/ui/pagination'
import ActionDropdown from '../../components/app/ActionDropdown'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '../../components/ui/hover-card'
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '../../components/ui/avatar'
import api from '../../services/api'
import HeroUiFilterSelect from '../../components/ui/HeroUiFilterSelect'
import {
  MasterActionButton,
  MasterActionIconButton,
  MasterBadge,
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

export function FoundationEmployeesPage() {
 const navigate = useNavigate()
 const [employees, setEmployees] = useState([])
 const [units, setUnits] = useState([])
 const [academicYears, setAcademicYears] = useState([])
 const [selectedAcademicYear, setSelectedAcademicYear] = useState('all')

 useEffect(() => {
 const fetchAcademicYears = async () => {
 try {
 const res = await api.get('/master/tahun-ajaran/dropdown').catch(() => api.get('/master/tahun-ajaran'))
 const raw = res?.data?.data || res?.data || []
 setAcademicYears(Array.isArray(raw) ? raw : [])
 } catch (err) {
 setAcademicYears([])
 }
 }
 fetchAcademicYears()
 }, [])
 const [dashboardData, setDashboardData] = useState(null)
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(false)
 const [isFetching, setIsFetching] = useState(false)

 const [jenis, setJenis] = useState('all') // 'all' | 'guru' | 'pegawai'
 const [search, setSearch] = useState('')
 const [selectedUnit, setSelectedUnit] = useState('all')
 const [selectedStatus, setSelectedStatus] = useState('all')
 const [page, setPage] = useState(1)
 const [perPage, setPerPage] = useState(10)
 const [sortKey, setSortKey] = useState('nama')
 const [sortOrder, setSortOrder] = useState('asc')

 const [selectedEmployeeId, setSelectedEmployeeId] = useState(null)
 const [selectedDetailType, setSelectedDetailType] = useState('pegawai')
 const [activeKpiModal, setActiveKpiModal] = useState(null)
 const [showExport, setShowExport] = useState(false)

 useEffect(() => {
 api.get('/foundation/units')
 .then((res) => {
 const raw = res.data?.data || res.data || []
 setUnits(Array.isArray(raw) ? raw : [])
 })
 .catch(() => {})
 }, [])

 const fetchEmployees = useCallback(async (silent = false) => {
 if (!silent) setLoading(true)
 else setIsFetching(true)
 setError(false)
 try {
 const params = {
 search: search || undefined,
 unit_id: selectedUnit !== 'all' ? selectedUnit : undefined,
 status: selectedStatus !== 'all' ? selectedStatus : undefined,
 per_page: 100,
 }
 const [resEmp, resDash] = await Promise.all([
 api.get('/foundation/employees', { params }),
 api.get('/foundation/dashboard').catch(() => ({ data: { data: null } })),
 ])

 const resData = resEmp.data
 let list = []
 if (Array.isArray(resData)) {
 list = resData
 } else if (resData?.data) {
 list = Array.isArray(resData.data) ? resData.data : resData.data.data || []
 }
 setEmployees(list)
 setDashboardData(resDash.data?.data || null)
 } catch (err) {
 console.error('Failed to fetch foundation employees:', err)
 setError(true)
 } finally {
 setLoading(false)
 setIsFetching(false)
 }
 }, [search, selectedUnit, selectedStatus])

 useEffect(() => {
 fetchEmployees()
 }, [fetchEmployees])

 const isGuru = (emp) => {
 const j = (emp.position?.nama_jabatan || emp.jabatan || '').toLowerCase()
 return j.includes('guru') || j.includes('pendidik')
 }

 const isEmpActive = (emp) => {
 const statusStr = (emp?.status || '').toString().trim().toLowerCase()
 if (statusStr === 'aktif' || statusStr === 'active' || statusStr === '1' || emp?.status === true || emp?.is_active === true || emp?.is_active === 1 || emp?.is_active === '1') {
 return true
 }
 if (statusStr === 'nonaktif' || statusStr === 'tidak aktif' || statusStr === 'inactive' || statusStr === '0' || emp?.status === false || emp?.is_active === false || emp?.is_active === 0) {
 return false
 }
 return true
 }

  const getSolidStatusPegawaiBadge = (statusPegawai) => {
    const label = statusPegawai || 'Tetap'
    const val = label.toString().toLowerCase()
    let variant = 'success'
    if (val.includes('kontrak')) variant = 'warning'
    else if (val.includes('honorer') || val.includes('magang')) variant = 'info'
    else if (!val.includes('tetap')) variant = 'neutral'

    return (
      <AppBadge variant={variant}>
        {label}
      </AppBadge>
    )
  }

  const getSolidStatusBadge = (active) => {
    return active ? (
      <AppBadge variant="success">Aktif</AppBadge>
    ) : (
      <AppBadge variant="danger">Nonaktif</AppBadge>
    )
  }

  const employeeColumns = useMemo(() => [
    {
      key: 'no',
      label: 'NO',
      className: 'w-[5%] text-center',
      render: (_emp, idx) => (
        <span className="text-xs font-bold text-slate-400">
          {(page - 1) * perPage + idx + 1}
        </span>
      ),
    },
    {
      key: 'nama',
      label: 'Nama SDM',
      sortable: true,
      className: 'w-[25%] min-w-[200px]',
      render: (emp) => {
        const guru = isGuru(emp)
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <HoverCard>
              <HoverCardTrigger asChild>
                <div
                  onClick={() => handleOpenDetail(emp)}
                  className="inline-block cursor-pointer transition-transform duration-150 active:scale-95"
                >
                  <PersonIdentityCell
                    src={emp.foto || emp.photo}
                    name={emp.nama_lengkap || emp.nama}
                    subtitle={`${emp.niy || emp.nik || 'NIY tidak tersedia'}`}
                  />
                </div>
              </HoverCardTrigger>
              <HoverCardContent side="right" align="start" className="w-72 p-4 bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xl rounded-xl z-50">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-12 border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm">
                      <AvatarImage src={emp.foto || emp.photo} />
                      <AvatarFallback className="bg-emerald-600 text-white font-black">
                        {(emp.nama_lengkap || emp.nama || 'SDM').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white ">
                        {emp.nama_lengkap || emp.nama}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        NIY/NIK: {emp.niy || emp.nik || '-'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Jenis SDM</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{guru ? 'Guru' : 'Tendik'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Unit Kerja</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200 truncate block">{emp.unit?.name || emp.unit?.code || '-'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Jabatan</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200 truncate block">{emp.position?.nama_jabatan || emp.jabatan || 'Staf'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Status Pegawai</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{emp.status_pegawai || 'Tetap'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Status Keaktifan</span>
                    {getSolidStatusBadge(isEmpActive(emp))}
                  </div>

                  <div className="pt-1.5 border-t border-emerald-200/80 dark:border-emerald-800/80 text-center">
                    <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">💡 Klik baris data untuk detail lengkap</span>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        )
      },
    },
    {
      key: 'jenis',
      label: 'Jenis',
      sortable: true,
      className: 'w-[10%] hidden md:table-cell',
      render: (emp) => (
        <MasterBadge variant={isGuru(emp) ? 'success' : 'info'}>
          {isGuru(emp) ? 'Guru' : 'Tendik'}
        </MasterBadge>
      ),
    },
    {
      key: 'unit',
      label: 'Unit Kerja',
      sortable: true,
      className: 'w-[18%] hidden lg:table-cell',
      render: (emp) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          {emp.unit?.name || emp.unit?.code || '-'}
        </span>
      ),
    },
    {
      key: 'jabatan',
      label: 'Jabatan',
      sortable: true,
      className: 'w-[18%] hidden xl:table-cell',
      render: (emp) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {emp.position?.nama_jabatan || emp.jabatan || 'Staf'}
        </span>
      ),
    },
    {
      key: 'status_pegawai',
      label: 'Status Pegawai',
      sortable: true,
      className: 'w-[12%] hidden lg:table-cell',
      render: (emp) => getSolidStatusPegawaiBadge(emp.status_pegawai),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      className: 'w-[10%] text-center hidden sm:table-cell',
      render: (emp) => getSolidStatusBadge(isEmpActive(emp)),
    },
  ], [page, perPage, units])

  const renderMobileCard = ({ row: emp }) => {
    const guru = isGuru(emp)
    return (
      <div
        onClick={() => handleOpenDetail(emp)}
        className="p-3.5 bg-white dark:bg-[#1B2433] rounded-xl border border-emerald-500/20 shadow-xs space-y-2 cursor-pointer hover:border-emerald-500/40 transition"
      >
        <div className="flex items-center gap-3">
          <Avatar className="size-10 border border-emerald-200/60 shadow-xs">
            <AvatarImage src={emp.foto || emp.photo} />
            <AvatarFallback className="bg-emerald-600 text-white font-bold text-xs">
              {(emp.nama_lengkap || emp.nama || 'SDM').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
              {emp.nama_lengkap || emp.nama}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              NIY: {emp.niy || emp.nik || '-'}
            </p>
          </div>
          <div className="shrink-0">
            {getSolidStatusBadge(isEmpActive(emp))}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-emerald-200/80 dark:border-emerald-800/60">
          <span>{emp.unit?.name || emp.unit?.code || '-'}</span>
          <MasterBadge variant={guru ? 'success' : 'info'}>{guru ? 'Guru' : 'Tendik'}</MasterBadge>
        </div>
      </div>
    )
  }


 const filteredEmployees = useMemo(() => employees.filter((emp) => {
 const name = (emp.nama_lengkap || emp.nama || '').toString().toLowerCase()
 const niy = (emp.niy || emp.nik || '').toString().toLowerCase()
 const unitName = (emp.unit?.name || emp.unit?.code || '').toString().toLowerCase()

 const matchesJenis = jenis === 'all' || (jenis === 'guru' ? isGuru(emp) : !isGuru(emp))
 const matchesSearch = name.includes(search.toLowerCase()) || niy.includes(search.toLowerCase())
 const matchesUnit = selectedUnit === 'all' || emp.unit_id === selectedUnit || unitName.includes(selectedUnit.toLowerCase())
 const matchesStatus = selectedStatus === 'all' || (selectedStatus === 'aktif' ? isEmpActive(emp) : !isEmpActive(emp))

 return matchesJenis && matchesSearch && matchesUnit && matchesStatus
 }), [employees, jenis, search, selectedUnit, selectedStatus])

 const handleSort = (key) => {
 if (sortKey === key) {
 setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
 } else {
 setSortKey(key)
 setSortOrder('asc')
 }
 }

 const sortedEmployees = useMemo(() => {
 return [...filteredEmployees].sort((a, b) => {
 let aVal = ''
 let bVal = ''
 if (sortKey === 'nama') {
 aVal = (a.nama_lengkap || a.nama || '').toString().toLowerCase()
 bVal = (b.nama_lengkap || b.nama || '').toString().toLowerCase()
 } else if (sortKey === 'jenis') {
 aVal = isGuru(a) ? 'guru' : 'pegawai'
 bVal = isGuru(b) ? 'guru' : 'pegawai'
 } else if (sortKey === 'unit') {
 aVal = (a.unit?.name || a.unit?.code || '').toString().toLowerCase()
 bVal = (b.unit?.name || b.unit?.code || '').toString().toLowerCase()
 } else if (sortKey === 'jabatan') {
 aVal = (a.position?.nama_jabatan || a.jabatan || '').toString().toLowerCase()
 bVal = (b.position?.nama_jabatan || b.jabatan || '').toString().toLowerCase()
 } else if (sortKey === 'status_pegawai') {
 aVal = (a.status_pegawai || '').toString().toLowerCase()
 bVal = (b.status_pegawai || '').toString().toLowerCase()
 } else if (sortKey === 'status') {
 aVal = isEmpActive(a) ? 1 : 0
 bVal = isEmpActive(b) ? 1 : 0
 }

 if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
 if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
 return 0
 })
 }, [filteredEmployees, sortKey, sortOrder])

 const totalItems = sortedEmployees.length
 const lastPage = Math.max(1, Math.ceil(totalItems / perPage))
 const paginatedEmployees = sortedEmployees.slice((page - 1) * perPage, page * perPage)

 const totalGuru = employees.filter((e) => isGuru(e)).length
 const totalSDM = employees.length
 const totalTendik = Math.max(0, totalSDM - totalGuru)
 const guruTetap = employees.filter((e) => (e.status_pegawai || '').toLowerCase().includes('tetap')).length

 const sdmChartData = useMemo(() => {
 if (!units.length) return []
 return units.map((u) => {
 const unitEmps = employees.filter((e) => e.unit_id === u.id || (e.unit?.id && e.unit.id === u.id))
 const gCount = Number(u.guru_count || unitEmps.filter((e) => isGuru(e)).length)
 const pCount = Number(u.pegawai_count || Math.max(0, unitEmps.length - gCount))
 return {
 name: u.code || u.name?.substring(0, 8) || 'Unit',
 fullName: u.name,
 'Guru': gCount,
 'Tendik': pCount,
 }
 })
 }, [units, employees])

 const handleOpenDetail = (emp) => {
 setSelectedDetailType(isGuru(emp) ? 'guru' : 'pegawai')
 setSelectedEmployeeId(emp.id)
 }

 const handleRefresh = () => {
 setPage(1)
 fetchEmployees(Boolean(employees.length))
 }

 const exportRows = paginatedEmployees.map((emp, idx) => ({
 No: (page - 1) * perPage + idx + 1,
 'NIY / NIK': emp.niy || emp.nik || '-',
 Nama: emp.nama_lengkap || emp.nama || '-',
 Jenis: isGuru(emp) ? 'Guru' : 'Pegawai',
 'Unit Kerja': emp.unit?.name || emp.unit?.code || '-',
 Jabatan: emp.position?.nama_jabatan || emp.jabatan || 'Staf',
 'Status Pegawai': emp.status_pegawai || 'Tetap',
 Status: isEmpActive(emp) ? 'Aktif' : 'Nonaktif',
 }))

 return (
 <MasterDataPage hideBreadcrumb className="foundation-employees-page">
 <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-12">
 {/* Breadcrumb Navigation */}
 <motion.div variants={itemVariants} className="print:hidden">
 <AppBreadcrumb items={[{ label: 'Yayasan', href: '/dashboard/yayasan' }, { label: 'Pegawai & Guru' }]} />
 </motion.div>

 {/* Header Halaman Modern Hero Card */}
        <motion.div variants={itemVariants} className="print:hidden">
          <HeroUiHeader
            title="Pegawai & Guru Lintas Unit"
            subtitle="Rekapitulasi dan pemantauan terpadu data pegawai, guru pendidik, dan tenaga kependidikan (Tendik) di seluruh unit sekolah yayasan."
            badge="SDM Yayasan"
            icon={UserCheck}
            actions={
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-100 px-3.5 py-1.5 text-xs font-black text-emerald-900 dark:border-emerald-800/60 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>SDM Realtime</span>
              </div>
            }
          />
        </motion.div>

        {/* Soft Pastel Squircle KPI Buttons */}
 <motion.section variants={itemVariants} className="mb-6">
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
 {/* 1. Total SDM */}
 <button
 type="button"
 onClick={() => setActiveKpiModal('pegawai_kpi')}
 className="group flex items-center justify-between gap-3 rounded-xl border border-emerald-200/80 !bg-emerald-100/90 hover:!bg-emerald-200/70 dark:!bg-emerald-950/50 p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-emerald-800/60 text-left cursor-pointer"
 >
 <div className="flex items-center gap-3 min-w-0">
 <div className="flex h-9 w-11 shrink-0 items-center justify-center rounded-xl !bg-emerald-600 !text-white transition-transform duration-200 group-hover:scale-110">
 <Users className="h-5 w-5" />
 </div>
 <div className="min-w-0">
 <p className="text-xs font-extrabold text-emerald-800 dark:text-emerald-200 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300">Total SDM Terpadu</p>
 <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{totalSDM.toLocaleString('id-ID')} SDM Seluruh Unit</p>
 </div>
 </div>
 <span className="shrink-0 rounded-lg bg-emerald-100 px-2 py-1 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">SDM</span>
 </button>

 {/* 2. Guru */}
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
 <p className="text-xs font-extrabold text-sky-800 dark:text-sky-200 truncate group-hover:text-sky-700 dark:group-hover:text-sky-300">Guru</p>
 <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{totalGuru.toLocaleString('id-ID')} Guru Mengajar</p>
 </div>
 </div>
 <span className="shrink-0 rounded-lg bg-sky-100 px-2 py-1 text-[10px] font-extrabold text-sky-700 dark:bg-sky-900/60 dark:text-sky-300">Guru</span>
 </button>

 {/* 3. Tendik */}
 <button
 type="button"
 onClick={() => setActiveKpiModal('pegawai_kpi')}
 className="group flex items-center justify-between gap-3 rounded-xl border border-emerald-200/80 !bg-emerald-100/90 hover:!bg-emerald-200/70 dark:!bg-emerald-950/50 p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-emerald-800/60 text-left cursor-pointer"
 >
 <div className="flex items-center gap-3 min-w-0">
 <div className="flex h-9 w-11 shrink-0 items-center justify-center rounded-xl !bg-amber-600 !text-white transition-transform duration-200 group-hover:scale-110">
 <UsersRound className="h-5 w-5" />
 </div>
 <div className="min-w-0">
 <p className="text-xs font-extrabold text-amber-800 dark:text-amber-200 truncate group-hover:text-amber-700 dark:group-hover:text-amber-300">Tendik</p>
 <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{totalTendik.toLocaleString('id-ID')} Staf Kependidikan</p>
 </div>
 </div>
 <span className="shrink-0 rounded-lg bg-amber-100 px-2 py-1 text-[10px] font-extrabold text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">Tendik</span>
 </button>

 {/* 4. Guru & Pegawai Tetap */}
 <button
 type="button"
 onClick={() => setActiveKpiModal('pegawai_kpi')}
 className="group flex items-center justify-between gap-3 rounded-xl border border-emerald-200/80 !bg-emerald-100/90 hover:!bg-emerald-200/70 dark:!bg-emerald-950/50 p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-emerald-800/60 text-left cursor-pointer"
 >
 <div className="flex items-center gap-3 min-w-0">
 <div className="flex h-9 w-11 shrink-0 items-center justify-center rounded-xl !bg-purple-600 !text-white transition-transform duration-200 group-hover:scale-110">
 <BadgeCheck className="h-5 w-5" />
 </div>
 <div className="min-w-0">
 <p className="text-xs font-extrabold text-purple-800 dark:text-purple-200 truncate group-hover:text-purple-700 dark:group-hover:text-purple-300">Guru & Pegawai Tetap</p>
 <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{guruTetap.toLocaleString('id-ID')} Status Tetap</p>
 </div>
 </div>
 <span className="shrink-0 rounded-lg bg-purple-100 px-2 py-1 text-[10px] font-extrabold text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">Tetap</span>
 </button>
 </div>
 </motion.section>

 {/* Grafik Distribusi Guru vs Pegawai Per Unit */}
 <motion.section variants={itemVariants} className={`${masterStyles.card} p-5 sm:p-6 mb-6`}>
 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-emerald-200/80 pb-4 dark:border-emerald-800/60">
 <div className="flex items-center gap-3">
 <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
 <LineChartIcon className="h-5 w-5" />
 </span>
 <div>
 <h2 className="text-base font-bold text-slate-900 dark:text-white">Analisis & Rekapitulasi KPI SDM Per Unit Pendidikan</h2>
 <p className="text-xs text-slate-500 dark:text-slate-400">Grafik komparasi jumlah Guru vs Tendik pada tiap Unit Kerja</p>
 </div>
 </div>

 {/* Filter Tahun Ajaran & Status Badges */}
 <div className="flex flex-wrap items-center gap-2.5">
 {/* Filter Tahun Ajaran Button Dropdown HeroUI */}
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
 aria-label="Filter Grafik SDM Tahun Ajaran"
 />
 </div>

 {/* Badges */}
 <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
 <span className="h-2 w-2 rounded-full bg-emerald-600" /> Guru ({totalGuru})
 </span>
 <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
 <span className="h-2 w-2 rounded-full bg-amber-500" /> Tendik ({totalTendik})
 </span>
 </div>
 </div>

 <div className="mt-6 h-72 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={sdmChartData} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
 <defs>
 <linearGradient id="sdmGuruGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
 <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
 </linearGradient>
 <linearGradient id="sdmPegawaiGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
 <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.02} />
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
 <Area type="monotone" dataKey="Guru" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#sdmGuruGrad)" dot={{ r: 5, fill: '#059669', strokeWidth: 2, stroke: '#FFFFFF' }} activeDot={{ r: 7, strokeWidth: 2 }} />
 <Area type="monotone" dataKey="Tendik" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#sdmPegawaiGrad)" dot={{ r: 5, fill: '#F59E0B', strokeWidth: 2, stroke: '#FFFFFF' }} activeDot={{ r: 7, strokeWidth: 2 }} />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </motion.section>

 <motion.div variants={itemVariants}>
 <AppDataTable
            id="tabel-pegawai-guru"
            title="Daftar Pegawai & Guru"
            countLabel={`${totalItems} SDM`}
            description="Data SDM sesuai filter dan kewenangan pengguna."
            icon={<UsersRound className="size-4.5 text-white" strokeWidth={2.2} />}
            iconClassName="!bg-emerald-600 !text-white !border-emerald-600 !rounded-xl !size-8.5 shadow-xs"
            className="foundation-table scroll-mt-6 rounded-2xl border-2 border-emerald-500/25 dark:border-emerald-600/35 shadow-md shadow-emerald-500/10"
            fullBleed={true}
            headerClassName="bg-emerald-500/10 dark:bg-emerald-950/40 border-b border-emerald-500/20 dark:border-emerald-800/40 px-5 py-4 min-h-[72px]"
            actions={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowExport(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50 px-3.5 py-1.5 text-xs font-bold text-sky-700 shadow-xs transition-all duration-200 hover:scale-105 hover:bg-sky-100 hover:shadow-md dark:border-emerald-800/60 dark:bg-sky-950/60 dark:text-sky-300 cursor-pointer"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-sky-600" />
                  <span>Export Data</span>
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
            }
            search={search}
            onSearchChange={(val) => { setSearch(val); setPage(1) }}
            searchPlaceholder="Cari nama, NIY, NIK, atau jabatan..."
            filters={
              <div className="flex flex-wrap items-center gap-2.5 w-full">
                <MasterFilterSelect value={jenis} onChange={(e) => { setJenis(e.target.value); setPage(1) }} aria-label="Filter jenis SDM">
                  <option value="all">Semua SDM</option>
                  <option value="guru">Guru</option>
                  <option value="pegawai">Tendik</option>
                </MasterFilterSelect>
                <MasterFilterSelect value={selectedUnit} onChange={(e) => { setSelectedUnit(e.target.value); setPage(1) }} aria-label="Filter unit kerja">
                  <option value="all">Semua Unit</option>
                  {units.map((u) => <option key={u.id} value={u.id}>{u.name || u.code}</option>)}
                </MasterFilterSelect>
                <MasterFilterSelect value={selectedStatus} onChange={(e) => { setSelectedStatus(e.target.value); setPage(1) }} aria-label="Filter status">
                  <option value="all">Semua Status</option>
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </MasterFilterSelect>
                <MasterFilterSelect
                  value={perPage}
                  onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1) }}
                  aria-label="Tampilkan per halaman"
                >
                  <option value={5}>5 per Halaman</option>
                  <option value={10}>10 per Halaman</option>
                  <option value={15}>15 per Halaman</option>
                  <option value={25}>25 per Halaman</option>
                  <option value={50}>50 per Halaman</option>
                  <option value={100}>100 per Halaman</option>
                </MasterFilterSelect>
                {(search || jenis !== 'all' || selectedUnit !== 'all' || selectedStatus !== 'all' || perPage !== 10) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('')
                      setJenis('all')
                      setSelectedUnit('all')
                      setSelectedStatus('all')
                      setPerPage(10)
                      setPage(1)
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-emerald-800/60 dark:bg-rose-950/40 dark:text-rose-300 transition cursor-pointer"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            }
            hasActiveFilters={Boolean(search || jenis !== 'all' || selectedUnit !== 'all' || selectedStatus !== 'all' || perPage !== 10)}
            onResetFilters={() => {
              setSearch('')
              setJenis('all')
              setSelectedUnit('all')
              setSelectedStatus('all')
              setPerPage(10)
              setPage(1)
            }}
            columns={employeeColumns}
            data={paginatedEmployees}
            renderMobileCard={renderMobileCard}
            serverControlled={true}
            sortKey={sortKey}
            sortDir={sortOrder}
            onSortChange={(key, dir) => {
              setSortKey(key)
              setSortOrder(dir)
            }}
            isLoading={loading}
            isError={Boolean(error)}
            errorTitle="Data SDM gagal dimuat"
            errorMessage="Periksa koneksi kemudian coba muat ulang."
            onRetry={handleRefresh}
            emptyTitle="Belum ada data SDM"
            emptyDescription="Ubah filter pencarian untuk menampilkan pegawai atau guru lain."
            page={page}
            totalPages={lastPage}
            totalCount={totalItems}
            onPageChange={setPage}
            onRowClick={handleOpenDetail}
          />
 <KpiDetailDrawer
 type={selectedDetailType}
 id={selectedEmployeeId}
 isOpen={Boolean(selectedEmployeeId)}
 onClose={() => setSelectedEmployeeId(null)}
 />

 <FoundationUnitKpiModal
 type={activeKpiModal || 'pegawai_kpi'}
 isOpen={Boolean(activeKpiModal)}
 onClose={() => setActiveKpiModal(null)}
 units={units}
 />

 <FoundationExportModal
 isOpen={showExport}
 onClose={() => setShowExport(false)}
 title="Pegawai & Guru Seluruh Yayasan"
 rows={exportRows}
 filename="Pegawai_Guru_Yayasan"
 />

 {/* Smart Floating Scroll Navigator */}
 <SmartScrollFab targetId="tabel-pegawai-guru" downTooltip="Langsung ke Tabel Pegawai" />
 </motion.div>
 </motion.div>
 </MasterDataPage>
 )
}
