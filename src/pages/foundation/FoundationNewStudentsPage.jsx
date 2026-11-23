import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'
import {
  Award,
  CalendarPlus,
  FileSpreadsheet,
  GraduationCap,
  RefreshCcw,
  ShieldAlert,
  UserCheck,
  UserMinus,
  UserRound,
  UsersRound
,
  Search} from 'lucide-react'
import {
  ArrowRightLeft as ArrowBothDirectionHorizontal2
} from 'lucide-react'
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
  MasterStatsGrid
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
  SquircleActionButton
} from '../../components/master-data'
import {
  SmartScrollFab
} from '../../components/common'

function formatDate(value) {
 if (!value) return '-'
 const date = new Date(value)
 return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('id-ID')
}

export function FoundationNewStudentsPage() {
 const [students, setStudents] = useState([])
 const [units, setUnits] = useState([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(false)
 const [isFetching, setIsFetching] = useState(false)

 const [search, setSearch] = useState('')
 const debouncedSearch = useDebounce(search, 350)
 const [selectedUnit, setSelectedUnit] = useState('all')
 const [page, setPage] = useState(1)
 const [perPage, setPerPage] = useState(10)
 const [sortKey, setSortKey] = useState('nama')
 const [sortOrder, setSortOrder] = useState('asc')

 const [selectedStudentId, setSelectedStudentId] = useState(null)
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

 const fetchNewStudents = useCallback(async (silent = false) => {
 if (!silent) setLoading(true)
 else setIsFetching(true)
 setError(false)
 try {
 const params = {
 search: debouncedSearch || undefined,
 unit_id: selectedUnit !== 'all' ? selectedUnit : undefined,
 per_page: 100,
 }
 const res = await api.get('/foundation/new-students', { params })
 const resData = res.data
 let list = []
 if (Array.isArray(resData)) {
 list = resData
 } else if (resData?.data) {
 list = Array.isArray(resData.data) ? resData.data : resData.data.data || []
 }
 setStudents(list)
 } catch (err) {
 console.error('Failed to fetch foundation new students:', err)
 setError(true)
 } finally {
 setLoading(false)
 setIsFetching(false)
 }
 }, [debouncedSearch, selectedUnit])

 useEffect(() => {
 fetchNewStudents()
 }, [fetchNewStudents])

 // Filter dilakukan di backend via params (search, unit_id).
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
 } else if (sortKey === 'unit') {
 aVal = (a.education_unit?.name || a.unit?.name || '').toString().toLowerCase()
 bVal = (b.education_unit?.name || b.unit?.name || '').toString().toLowerCase()
 } else if (sortKey === 'tahun') {
 aVal = Number(a.tahun_masuk || 0)
 bVal = Number(b.tahun_masuk || 0)
 } else if (sortKey === 'tanggal') {
 aVal = new Date(a.created_at || 0).getTime()
 bVal = new Date(b.created_at || 0).getTime()
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

 const totalNew = students.length
 const maleCount = students.filter((s) => s.gender === 'male' || s.gender === 'L').length
 const femaleCount = students.filter((s) => s.gender === 'female' || s.gender === 'P').length
 const inRombelCount = students.filter((s) => s.kelas_id || s.school_class_id).length

 const handleRefresh = () => {
 setPage(1)
 fetchNewStudents(Boolean(students.length))
 }

 const exportRows = paginatedStudents.map((st, idx) => ({
 No: (page - 1) * perPage + idx + 1,
 'NIS / NISN': st.nis || st.nisn || '-',
 Nama: st.full_name || st.nama || '-',
 'Unit Pendidikan': st.education_unit?.name || st.unit?.name || '-',
 'Tahun Masuk': st.tahun_masuk || '-',
 'Tanggal Masuk': formatDate(st.created_at),
 'Kelas / Rombel': st.kelas?.nama_kelas || st.school_class?.name || 'Belum Ada',
 }))

   const studentColumns = useMemo(() => [
    {
      key: 'no',
      label: 'NO',
      className: 'w-[5%] text-center',
      render: (_st, idx) => (
        <span className="text-xs font-bold text-slate-400">
          {(page - 1) * perPage + idx + 1}
        </span>
      ),
    },
    {
      key: 'nama',
      label: 'Nama Siswa',
      sortable: true,
      className: 'w-[24%] min-w-[200px]',
      render: (st) => (
        <PersonIdentityCell
          src={st.photo}
          name={st.full_name || st.nama}
          subtitle={`${st.nis || st.nisn || '-'}`}
        />
      ),
    },
    {
      key: 'unit',
      label: 'Unit Pendidikan',
      sortable: true,
      className: 'w-[16%] hidden md:table-cell',
      render: (st) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          {st.education_unit?.name || st.unit?.name || '-'}
        </span>
      ),
    },
    {
      key: 'tahun',
      label: 'Tahun Ajaran',
      sortable: true,
      className: 'w-[11%] hidden lg:table-cell',
      render: (st) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          {st.tahun_masuk ? `${st.tahun_masuk}/${Number(st.tahun_masuk) + 1}` : '-'}
        </span>
      ),
    },
    {
      key: 'tanggal',
      label: 'Tanggal Masuk',
      sortable: true,
      className: 'w-[12%] hidden xl:table-cell',
      render: (st) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {formatDate(st.created_at)}
        </span>
      ),
    },
    {
      key: 'kelas',
      label: 'Kelas / Rombel',
      sortable: true,
      className: 'w-[13%] hidden xl:table-cell',
      render: (st) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {st.kelas?.nama_kelas || st.school_class?.name || 'Belum Ada'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      className: 'w-[9%] text-center hidden sm:table-cell',
      render: () => (
        <AppBadge variant="success" dot>Siswa Baru</AppBadge>
      ),
    },
  ], [page, perPage])

  const renderMobileCard = ({ row: st }) => (
    <div
      onClick={() => setSelectedStudentId(st.id)}
      className="p-3.5 bg-white dark:bg-[#1B2433] rounded-xl border border-emerald-500/20 shadow-xs space-y-2 cursor-pointer hover:border-emerald-500/40 transition"
    >
      <div className="flex items-center gap-3">
        <PersonIdentityCell
          src={st.photo}
          name={st.full_name || st.nama}
          subtitle={`${st.nis || st.nisn || '-'}`}
        />
        <div className="ml-auto shrink-0">
          <AppBadge variant="success" dot>Siswa Baru</AppBadge>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-emerald-200/80 dark:border-emerald-800/60">
        <span>{st.education_unit?.name || st.unit?.name || '-'}</span>
        <span>{st.kelas?.nama_kelas || st.school_class?.name || 'Belum Ada'}</span>
      </div>
    </div>
  )

  return (
 <MasterDataPage hideBreadcrumb className="foundation-new-students-page">
 {/* Stat Cards Ringkasan Siswa Baru */}
 <MasterStatsGrid>
 <MasterStatCard icon={GraduationCap} label="Total Siswa Baru" value={totalNew} description="Tahun ajaran aktif" variant="success" delay={40} />
 <MasterStatCard icon={UserRound} label="Laki-Laki" value={maleCount} description="Siswa baru laki-laki" variant="info" delay={80} />
 <MasterStatCard icon={UserCheck} label="Perempuan" value={femaleCount} description="Siswi baru perempuan" variant="warning" delay={120} />
 <MasterStatCard icon={GraduationCap} label="Masuk Rombel" value={inRombelCount} description={`${totalNew - inRombelCount} belum masuk rombel`} variant="success" delay={160} />
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
 className="group flex items-center justify-between gap-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50/60 p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-emerald-800/60 dark:bg-sky-950/40 text-left cursor-pointer"
 >
 <div className="flex items-center gap-3 min-w-0">
 <div className="flex h-9 w-11 shrink-0 items-center justify-center rounded-xl border bg-sky-100 text-sky-700 border-emerald-200/80 transition-transform duration-200 group-hover:scale-110 dark:bg-sky-900/60 dark:text-sky-300 dark:border-emerald-800/60">
 <UserCheck className="h-5 w-5" />
 </div>
 <div className="min-w-0">
 <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-sky-700 dark:group-hover:text-sky-300">Siswa Masuk (Baru)</p>
 <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{totalNew} Siswa Baru</p>
 </div>
 </div>
 <span className="shrink-0 rounded-lg bg-sky-200/80 px-2 py-1 text-[10px] font-extrabold text-sky-800 dark:bg-sky-900 dark:text-sky-200">Baru</span>
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
 onClick={() => setActiveKpiModal('alumni')}
 className="group flex items-center justify-between gap-3 rounded-xl border border-emerald-200/80 bg-white p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-emerald-800/60 dark:bg-[#1B2433] text-left cursor-pointer"
 >
 <div className="flex items-center gap-3 min-w-0">
 <div className="flex h-9 w-11 shrink-0 items-center justify-center rounded-xl border bg-purple-50 text-purple-600 border-emerald-200/80 transition-transform duration-200 group-hover:scale-110 dark:bg-purple-950/60 dark:text-purple-400 dark:border-emerald-800/60">
 <Award className="h-5 w-5" />
 </div>
 <div className="min-w-0">
 <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-purple-700 dark:group-hover:text-purple-300">Kelulusan & Alumni</p>
 <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">Data Lulusan & Alumni</p>
 </div>
 </div>
 <span className="shrink-0 rounded-lg bg-purple-100 px-2 py-1 text-[10px] font-extrabold text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">Alumni</span>
 </div>
 </div>
 </section>

 <AppDataTable
        id="tabel-siswa-baru"
        title="Daftar Siswa Baru"
        countLabel={`${totalItems} siswa baru`}
        description="Penerimaan siswa baru sesuai filter dan kewenangan pengguna."
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
        searchPlaceholder="Cari NIS, NISN, atau nama siswa baru..."
        filters={
          <div className="flex flex-wrap items-center gap-2.5 w-full">
            <MasterFilterSelect value={selectedUnit} onChange={(e) => { setSelectedUnit(e.target.value); setPage(1) }} aria-label="Filter unit pendidikan">
              <option value="all">Semua Unit Pendidikan</option>
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
            {(search || selectedUnit !== 'all' || perPage !== 10) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
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
        hasActiveFilters={Boolean(search || selectedUnit !== 'all' || perPage !== 10)}
        onResetFilters={() => {
          setSearch('')
          setSelectedUnit('all')
          setPerPage(10)
          setPage(1)
        }}
        columns={studentColumns}
        data={paginatedStudents}
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
        errorTitle="Data siswa baru gagal dimuat"
        errorMessage="Periksa koneksi kemudian coba muat ulang."
        onRetry={handleRefresh}
        emptyTitle="Belum ada data siswa baru"
        emptyDescription="Ubah filter pencarian untuk menampilkan penerimaan siswa baru lain."
        page={page}
        totalPages={lastPage}
        totalCount={totalItems}
        onPageChange={setPage}
        onView={(st) => setSelectedStudentId(st.id)}
      />
 <KpiDetailDrawer
 type="siswa"
 id={selectedStudentId}
 isOpen={Boolean(selectedStudentId)}
 onClose={() => setSelectedStudentId(null)}
 />

 <FoundationUnitKpiModal
 type={activeKpiModal || 'siswa_mobility'}
 isOpen={Boolean(activeKpiModal)}
 onClose={() => setActiveKpiModal(null)}
 units={units}
 />

 <FoundationExportModal
 isOpen={showExport}
 onClose={() => setShowExport(false)}
 title="Penerimaan Siswa Baru Yayasan"
 rows={exportRows}
 filename="Siswa_Baru_Yayasan"
 />

 {/* Smart Floating Scroll Navigator */}
 <SmartScrollFab targetId="tabel-siswa-baru" downTooltip="Langsung ke Tabel Siswa Baru" />
 </MasterDataPage>
 )
}
