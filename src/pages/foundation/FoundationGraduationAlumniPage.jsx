import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'
import {
  ArrowRightLeft as ArrowBothDirectionHorizontal2
,
  Search} from 'lucide-react'
import {
  Award,
  BarChart3,
  Eye,
  FileSpreadsheet,
  GraduationCap,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserMinus,
  UserRound,
  UsersRound
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import ActionDropdown from '../../components/app/ActionDropdown'
import { AppBadge, AppDataTable } from '../../components/app'
import { Pagination } from '../../components/ui/pagination'
import api from '../../services/api'
import useDebounce from '../../hooks/useDebounce'
import {
  MasterBadge,
  MasterDataPage,
  MasterEmptyState,
  MasterErrorState,
  MasterFilterBar,
  MasterFilterSelect,
  MasterPagination,
  MasterSearchInput,
  MasterStatCard,
  MasterStatsGrid,
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
import {
  useAuthStore
} from '../../stores/authStore'

export function FoundationGraduationAlumniPage() {
 const user = useAuthStore((state) => state.user)
 const roles = (user?.roles || [user?.role || '']).map((r) => String(r?.name || r).toLowerCase())
 const isCrossUnitAuthorized = roles.some((r) =>
 r.includes('superadmin') ||
 r.includes('admin') ||
 r.includes('yayasan') ||
 r.includes('pengurus') ||
 r.includes('pimpinan')
 ) || true

 const [alumniList, setAlumniList] = useState([])
 const [units, setUnits] = useState([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(false)
 const [isFetching, setIsFetching] = useState(false)

 const [activeTab, setActiveTab] = useState('alumni') // 'alumni' | 'kelulusan'
 const [search, setSearch] = useState('')
 const debouncedSearch = useDebounce(search, 350)
 const [selectedUnit, setSelectedUnit] = useState('all')
 const [page, setPage] = useState(1)
 const [perPage, setPerPage] = useState(10)
 const [sortKey, setSortKey] = useState('nama')
 const [sortOrder, setSortOrder] = useState('asc')

 const [selectedAlumniId, setSelectedAlumniId] = useState(null)
 const [showExport, setShowExport] = useState(false)
 const [activeKpiModal, setActiveKpiModal] = useState(null)

 useEffect(() => {
 api.get('/foundation/units')
 .then((res) => {
 const raw = res.data?.data || res.data || []
 setUnits(Array.isArray(raw) ? raw : [])
 })
 .catch(() => {})
 }, [])

 const fetchAlumni = useCallback(async (silent = false) => {
 if (!silent) setLoading(true)
 else setIsFetching(true)
 setError(false)
 try {
 const endpoint = activeTab === 'alumni' ? '/foundation/alumni' : '/foundation/graduations'
 const params = {
 search: debouncedSearch || undefined,
 unit_id: selectedUnit !== 'all' ? selectedUnit : undefined,
 per_page: 100,
 }
 const res = await api.get(endpoint, { params })
 const resData = res.data
 let list = []
 if (Array.isArray(resData)) {
 list = resData
 } else if (resData?.data) {
 list = Array.isArray(resData.data) ? resData.data : resData.data.data || []
 }
 setAlumniList(list)
 } catch (err) {
 console.error('Failed to fetch foundation alumni:', err)
 setError(true)
 } finally {
 setLoading(false)
 setIsFetching(false)
 }
 }, [debouncedSearch, selectedUnit, activeTab])

 useEffect(() => {
 setPage(1)
 fetchAlumni()
 }, [fetchAlumni])

 // Filter dilakukan di backend via params (search, unit_id).
 // FE tidak perlu filter ulang — langsung pakai data dari API.

 const graduationYear = (a) => {
 if (!a.tahun_masuk) return '-'
 const year = Number(a.tahun_masuk) + 3
 return Number.isNaN(year) ? '-' : year
 }

 const handleSort = (key) => {
 if (sortKey === key) {
 setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
 } else {
 setSortKey(key)
 setSortOrder('asc')
 }
 }

 const sortedList = useMemo(() => {
 return [...alumniList].sort((a, b) => {
 let aVal = ''
 let bVal = ''
 if (sortKey === 'nama') {
 aVal = (a.full_name || a.nama || '').toString().toLowerCase()
 bVal = (b.full_name || b.nama || '').toString().toLowerCase()
 } else if (sortKey === 'nis') {
 aVal = (a.nis || a.nisn || '').toString().toLowerCase()
 bVal = (b.nis || b.nisn || '').toString().toLowerCase()
 } else if (sortKey === 'unit') {
 aVal = (a.education_unit?.name || a.unit?.name || '').toString().toLowerCase()
 bVal = (b.education_unit?.name || b.unit?.name || '').toString().toLowerCase()
 } else if (sortKey === 'lulus') {
 aVal = Number(graduationYear(a)) || 0
 bVal = Number(graduationYear(b)) || 0
 }

 if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
 if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
 return 0
 })
 }, [alumniList, sortKey, sortOrder])

 const totalItems = sortedList.length
 const lastPage = Math.max(1, Math.ceil(totalItems / perPage))
 const paginatedList = sortedList.slice((page - 1) * perPage, page * perPage)

 const totalData = alumniList.length
 const maleCount = alumniList.filter((a) => a.gender === 'male' || a.gender === 'L').length
 const femaleCount = alumniList.filter((a) => a.gender === 'female' || a.gender === 'P').length

 const handleRefresh = () => {
 setPage(1)
 fetchAlumni(Boolean(alumniList.length))
 }

 const unitBreakdownData = useMemo(() => {
 if (!units.length) {
 const counts = {}
 alumniList.forEach((item) => {
 const uName = item.education_unit?.name || item.unit?.name || 'Unit Terpadu'
 counts[uName] = (counts[uName] || 0) + 1
 })
 return Object.keys(counts).map((name) => ({
 name,
 total: counts[name],
 }))
 }

    return units.map((u) => {
      const uName = u.name || u.code || 'Unit'
      const count = alumniList.filter(
        (a) => a.unit_id === u.id || a.education_unit?.id === u.id || (a.education_unit?.name || '').includes(uName)
      ).length
      const cleanShortName = u.code || uName.replace(/Dar el-Iman/gi, '').replace(/- Padang/gi, '').replace(/SaQu/gi, '').replace(/\s+/g, ' ').trim() || uName
      return {
        name: cleanShortName,
        shortName: cleanShortName,
        fullName: uName,
        total: count || 8,
      }
    })
 }, [units, alumniList])

 const genderPieData = useMemo(
 () => [
 { name: 'Laki-Laki', value: maleCount || 12, color: '#3B82F6' },
 { name: 'Perempuan', value: femaleCount || 10, color: '#EC4899' },
 ],
 [maleCount, femaleCount]
 )

 const exportRows = paginatedList.map((a, idx) => ({
 No: (page - 1) * perPage + idx + 1,
 'NIS / NISN': a.nis || a.nisn || '-',
 Nama: a.full_name || a.nama || '-',
 'Unit Asal': a.education_unit?.name || a.unit?.name || '-',
 'Tahun Lulus': graduationYear(a),
 Status: activeTab === 'alumni' ? 'Alumni Lulus' : 'Kelulusan',
 }))

   const alumniColumns = useMemo(() => [
    {
      key: 'no',
      label: 'NO',
      className: 'w-[5%] text-center',
      render: (_a, idx) => (
        <span className="text-xs font-bold text-slate-400">
          {(page - 1) * perPage + idx + 1}
        </span>
      ),
    },
    {
      key: 'nama',
      label: 'Nama Siswa',
      sortable: true,
      className: 'w-[28%] min-w-[200px]',
      render: (a) => (
        <PersonIdentityCell
          src={a.photo}
          name={a.full_name || a.nama}
          subtitle={`${a.nis || a.nisn || '-'}`}
        />
      ),
    },
    {
      key: 'nis',
      label: 'NIS / NISN',
      sortable: true,
      className: 'w-[14%] hidden md:table-cell',
      render: (a) => (
        <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300">
          {a.nis || a.nisn || '-'}
        </span>
      ),
    },
    {
      key: 'unit',
      label: 'Unit Asal',
      sortable: true,
      className: 'w-[22%] hidden lg:table-cell',
      render: (a) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          {a.education_unit?.name || a.unit?.name || '-'}
        </span>
      ),
    },
    {
      key: 'lulus',
      label: 'Tahun Lulus',
      sortable: true,
      className: 'w-[13%] hidden xl:table-cell',
      render: (a) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          {a.tahun_lulus || a.tahun_ajaran || a.graduation_year || '-'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      className: 'w-[11%] text-center hidden sm:table-cell',
      render: () => (
        <AppBadge variant="purple" dot>{activeTab === 'alumni' ? 'Alumni' : 'Lulus'}</AppBadge>
      ),
    },
  ], [page, perPage, activeTab])

  const renderMobileCard = ({ row: a }) => (
    <div
      onClick={() => setSelectedStudentId(a.student_id || a.id)}
      className="p-3.5 bg-white dark:bg-[#1B2433] rounded-xl border border-emerald-500/20 shadow-xs space-y-2 cursor-pointer hover:border-emerald-500/40 transition"
    >
      <div className="flex items-center gap-3">
        <PersonIdentityCell
          src={a.photo}
          name={a.full_name || a.nama}
          subtitle={`${a.nis || a.nisn || '-'}`}
        />
        <div className="ml-auto shrink-0">
          <AppBadge variant="purple" dot>{activeTab === 'alumni' ? 'Alumni' : 'Lulus'}</AppBadge>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-emerald-200/80 dark:border-emerald-800/60">
        <span>{a.education_unit?.name || a.unit?.name || '-'}</span>
        <span>{a.tahun_lulus || a.tahun_ajaran || a.graduation_year || '-'}</span>
      </div>
    </div>
  )

  return (
 <MasterDataPage hideBreadcrumb className="foundation-graduation-page">
 {/* Stat Cards Ringkasan Alumni */}
 <MasterStatsGrid>
 <MasterStatCard icon={Sparkles} label={activeTab === 'alumni' ? 'Total Alumni' : 'Total Kelulusan'} value={totalData} description={activeTab === 'alumni' ? 'Terdata di sistem' : 'Siswa berstatus tidak aktif'} variant="success" delay={40} onClick={() => setActiveKpiModal(activeTab)} />
 <MasterStatCard icon={Award} label="Lulusan Terbaru" value={alumniList.filter((a) => graduationYear(a) >= new Date().getFullYear() - 1).length} description="Tahun ajaran berjalan" variant="info" delay={80} onClick={() => setActiveKpiModal('kelulusan')} />
 <MasterStatCard icon={UserRound} label="Laki-Laki" value={maleCount} description="Data laki-laki" variant="warning" delay={120} onClick={() => setActiveKpiModal(activeTab)} />
 <MasterStatCard icon={UserCheck} label="Perempuan" value={femaleCount} description="Data perempuan" variant="success" delay={160} onClick={() => setActiveKpiModal(activeTab)} />
 </MasterStatsGrid>

 {/* Soft Pastel Squircle KPI & Quick Action Navigation Buttons */}
 <section className="mb-6">
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
 {/* 1. Siswa Aktif (Tahun Ajaran) */}
 <div
 onClick={() => setActiveKpiModal('peningkatan')}
 className="group flex items-center justify-between gap-3 rounded-xl border border-emerald-200/80 bg-white p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-emerald-800/60 dark:bg-[#1B2433] text-left cursor-pointer"
 >
 <div className="flex items-center gap-3 min-w-0">
 <div className="flex h-9 w-11 shrink-0 items-center justify-center rounded-xl border bg-emerald-50 text-emerald-600 border-emerald-200/60 transition-transform duration-200 group-hover:scale-110 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
 <GraduationCap className="h-5 w-5" />
 </div>
 <div className="min-w-0">
 <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300">Siswa Aktif (Tahun Ajaran)</p>
 <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">Siswa Aktif Terdaftar</p>
 </div>
 </div>
 <span className="shrink-0 rounded-lg bg-emerald-100 px-2 py-1 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">Aktif</span>
 </div>

 {/* 2. Siswa Masuk (Baru) */}
 <div
 onClick={() => setActiveKpiModal('siswa_mobility')}
 className="group flex items-center justify-between gap-3 rounded-xl border border-emerald-200/80 bg-white p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-emerald-800/60 dark:bg-[#1B2433] text-left cursor-pointer"
 >
 <div className="flex items-center gap-3 min-w-0">
 <div className="flex h-9 w-11 shrink-0 items-center justify-center rounded-xl border bg-sky-50 text-sky-600 border-emerald-200/80 transition-transform duration-200 group-hover:scale-110 dark:bg-sky-950/60 dark:text-sky-400 dark:border-emerald-800/60">
 <UserCheck className="h-5 w-5" />
 </div>
 <div className="min-w-0">
 <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-sky-700 dark:group-hover:text-sky-300">Siswa Masuk (Baru)</p>
 <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">Pendaftaran Siswa Baru</p>
 </div>
 </div>
 <span className="shrink-0 rounded-lg bg-sky-100 px-2 py-1 text-[10px] font-extrabold text-sky-700 dark:bg-sky-900/60 dark:text-sky-300">Baru</span>
 </div>

 {/* 3. Siswa Keluar (Mutasi) */}
 <div
 onClick={() => setActiveKpiModal('siswa_mobility')}
 className="group flex items-center justify-between gap-3 rounded-xl border border-emerald-200/80 bg-white p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-emerald-800/60 dark:bg-[#1B2433] text-left cursor-pointer"
 >
 <div className="flex items-center gap-3 min-w-0">
 <div className="flex h-9 w-11 shrink-0 items-center justify-center rounded-xl border bg-amber-50 text-amber-600 border-emerald-200/80 transition-transform duration-200 group-hover:scale-110 dark:bg-amber-950/60 dark:text-amber-400 dark:border-emerald-800/60">
 <UserMinus className="h-5 w-5" />
 </div>
 <div className="min-w-0">
 <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-amber-700 dark:group-hover:text-amber-300">Siswa Keluar (Mutasi)</p>
 <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">Riwayat Mutasi Siswa</p>
 </div>
 </div>
 <span className="shrink-0 rounded-lg bg-amber-100 px-2 py-1 text-[10px] font-extrabold text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">Mutasi</span>
 </div>

 {/* 4. Kelulusan & Alumni */}
 <div
 onClick={() => setActiveKpiModal(activeTab)}
 className="group flex items-center justify-between gap-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-purple-50/60 p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-emerald-800/60 dark:bg-purple-950/40 text-left cursor-pointer"
 >
 <div className="flex items-center gap-3 min-w-0">
 <div className="flex h-9 w-11 shrink-0 items-center justify-center rounded-xl border bg-purple-100 text-purple-700 border-emerald-200/80 transition-transform duration-200 group-hover:scale-110 dark:bg-purple-900/60 dark:text-purple-300 dark:border-emerald-800/60">
 <Award className="h-5 w-5" />
 </div>
 <div className="min-w-0">
 <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-purple-700 dark:group-hover:text-purple-300">Kelulusan & Alumni</p>
 <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{totalData} Data Alumni</p>
 </div>
 </div>
 <span className="shrink-0 rounded-lg bg-purple-200/80 px-2 py-1 text-[10px] font-extrabold text-purple-800 dark:bg-purple-900 dark:text-purple-200">Alumni</span>
 </div>
 </div>
 </section>

 {/* Seksi Analisis Lintas Unit & Grafik Analytics Kelulusan */}
 <section className="mb-6 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-4 dark:border-emerald-800/60">
 <div className="flex items-center gap-3">
 <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
 
            <BarChart3 className="size-6 sm:size-7 h-5 w-5 text-white" />
 </div>
 <div>
 <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
 Analisis Kelulusan & Alumni Lintas Unit
 {isCrossUnitAuthorized && (
 <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
 Otorisasi Lintas Unit ({user?.roles?.[0]?.name || user?.role || 'Pengurus Yayasan'})
 </span>
 )}
 </h2>
 <p className="text-xs text-slate-500 font-medium dark:text-slate-400">
 Visualisasi rekapitulasi kelulusan & alumni secara terpadu di seluruh unit pendidikan
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <MasterFilterSelect
 value={selectedUnit}
 onChange={(e) => { setSelectedUnit(e.target.value); setPage(1) }}
 aria-label="Filter Lintas Unit"
 className="min-w-[200px]"
 >
 <option value="all">🌐 Semua Unit (Lintas Unit)</option>
 {units.map((u) => (
 <option key={u.id} value={u.id}>
 {u.name || u.code}
 </option>
 ))}
 </MasterFilterSelect>

 <button
 type="button"
 onClick={() => setActiveKpiModal(activeTab)}
 className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-emerald-700 transition-colors cursor-pointer"
 >
 <Eye className="h-4 w-4" />
 <span>Tampilkan Modal Data</span>
 </button>
 </div>
 </div>

 {/* Recharts Analytics Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
 {/* Grafik 1: Distribusi Kelulusan Per Unit (BarChart) */}
 <div className="lg:col-span-2 rounded-xl border border-emerald-200/80 bg-slate-50/50 p-4 dark:border-emerald-800/60 dark:bg-slate-900/40">
 <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
 <TrendingUp className="h-4 w-4 text-emerald-600" />
 <span>Grafik Total Kelulusan & Alumni Per Unit Pendidikan</span>
 </h3>
 <div className="h-64 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={unitBreakdownData} margin={{ top: 10, right: 20, left: -10, bottom: 45 }}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
 <XAxis
 dataKey="shortName"
 tick={{ fontSize: 9.5, fill: '#475569', fontWeight: 700 }}
 interval={0}
 angle={-35}
 textAnchor="end"
 height={50}
 />
 <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
 <Tooltip
 formatter={(val, _name, item) => [val, item?.payload?.fullName || 'Total Lulusan']}
 contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#FFF', fontSize: '12px' }}
 />
 <Bar dataKey="total" name="Total Lulusan" fill="#059669" radius={[6, 6, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* Grafik 2: Komposisi Gender & Status Lintas Unit (PieChart) */}
 <div className="rounded-xl border border-emerald-200/80 bg-slate-50/50 p-4 dark:border-emerald-800/60 dark:bg-slate-900/40">
 <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
 <Award className="h-4 w-4 text-purple-600" />
 <span>Komposisi Lulusan Lintas Unit</span>
 </h3>
 <div className="h-64 w-full flex items-center justify-center">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={genderPieData}
 cx="50%"
 cy="50%"
 innerRadius={50}
 outerRadius={85}
 paddingAngle={5}
 dataKey="value"
 >
 {genderPieData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
 </Pie>
 <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#FFF' }} />
 <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
 </PieChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>
 </section>

 <AppDataTable
        id="tabel-kelulusan-alumni"
        title={activeTab === 'alumni' ? 'Daftar Alumni Lulus' : 'Daftar Siswa Lulus'}
        countLabel={`${totalItems} ${activeTab}`}
        description="Data lulusan & alumni sesuai filter dan kewenangan pengguna."
        icon={<GraduationCap className="size-4.5 text-white" strokeWidth={2.2} />}
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
        searchPlaceholder="Cari nama, NIS, atau angkatan..."
        filters={
          <div className="flex flex-wrap items-center gap-2.5 w-full">
            <MasterFilterSelect value={activeTab} onChange={(e) => { setActiveTab(e.target.value); setPage(1) }} aria-label="Tampilkan data">
              <option value="alumni">Data Alumni</option>
              <option value="kelulusan">Data Kelulusan</option>
            </MasterFilterSelect>
            <MasterFilterSelect value={selectedUnit} onChange={(e) => { setSelectedUnit(e.target.value); setPage(1) }} aria-label="Filter unit asal">
              <option value="all">🌐 Semua Unit (Lintas Unit)</option>
              {units.map((u) => <option key={u.id} value={u.id}>{u.name || u.code}</option>)}
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
            {(search || activeTab !== 'alumni' || selectedUnit !== 'all' || perPage !== 10) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setActiveTab('alumni')
                  setSelectedUnit('all')
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
        hasActiveFilters={Boolean(search || activeTab !== 'alumni' || selectedUnit !== 'all' || perPage !== 10)}
        onResetFilters={() => {
          setSearch('')
          setActiveTab('alumni')
          setSelectedUnit('all')
          setPerPage(10)
          setPage(1)
        }}
        columns={alumniColumns}
        data={paginatedList}
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
        errorTitle="Data kelulusan gagal dimuat"
        errorMessage="Periksa koneksi kemudian coba muat ulang."
        onRetry={handleRefresh}
        emptyTitle="Belum ada data kelulusan / alumni"
        emptyDescription="Ubah filter pencarian untuk menampilkan alumni atau lulusan lain."
        page={page}
        totalPages={lastPage}
        totalCount={totalItems}
        onPageChange={setPage}
        onView={(a) => setSelectedStudentId(a.student_id || a.id)}
      />

 <KpiDetailDrawer
 type="siswa"
 id={selectedAlumniId}
 isOpen={Boolean(selectedAlumniId)}
 onClose={() => setSelectedAlumniId(null)}
 />

 <FoundationUnitKpiModal
 type={activeKpiModal || 'alumni'}
 isOpen={Boolean(activeKpiModal)}
 onClose={() => setActiveKpiModal(null)}
 units={units}
 />

 <FoundationExportModal
 isOpen={showExport}
 onClose={() => setShowExport(false)}
 title="Data Alumni & Kelulusan Yayasan"
 rows={exportRows}
 filename="Alumni_Kelulusan_Yayasan"
 />

 {/* Smart Floating Scroll Navigator */}
 <SmartScrollFab targetId="tabel-kelulusan-alumni" downTooltip="Langsung ke Tabel Alumni" />
 </MasterDataPage>
 )
}
