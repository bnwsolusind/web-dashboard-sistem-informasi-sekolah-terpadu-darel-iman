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
  ArrowRightLeft,
  Award,
  FileSpreadsheet,
  GraduationCap,
  RefreshCcw,
  ShieldAlert,
  UserCheck,
  UserMinus,
  UserPlus,
  UserRound,
  UsersRound
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

const MUTATION_VARIANTS = {
 masuk: { label: 'Pindah Masuk', variant: 'success' },
 antar: { label: 'Pindah Antarunit', variant: 'info' },
 keluar: { label: 'Pindah Keluar', variant: 'danger' },
}

function mutationInfo(m) {
 const raw = (m.metadata?.mutasi_type || m.mutasi_type || '').toString().toLowerCase()
 if (raw.includes('antar')) return MUTATION_VARIANTS.antar
 if (raw.includes('keluar')) return MUTATION_VARIANTS.keluar
 if (raw.includes('masuk')) return MUTATION_VARIANTS.masuk
 return { label: raw ? raw.toUpperCase() : 'Mutasi', variant: 'neutral' }
}

export function FoundationMutationsPage() {
 const [mutations, setMutations] = useState([])
 const [units, setUnits] = useState([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(false)
 const [isFetching, setIsFetching] = useState(false)

 const [jenis, setJenis] = useState('all') // 'all' | 'masuk' | 'antarunit' | 'keluar'
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

 const fetchMutations = useCallback(async (silent = false) => {
 if (!silent) setLoading(true)
 else setIsFetching(true)
 setError(false)
 try {
 const params = {
 search: debouncedSearch || undefined,
 unit_id: selectedUnit !== 'all' ? selectedUnit : undefined,
 type: jenis !== 'all' ? jenis : undefined,
 per_page: 100,
 }
 const res = await api.get('/foundation/student-mutations', { params })
 const resData = res.data
 let list = []
 if (Array.isArray(resData)) {
 list = resData
 } else if (resData?.data) {
 list = Array.isArray(resData.data) ? resData.data : resData.data.data || []
 }
 setMutations(list)
 } catch (err) {
 console.error('Failed to fetch foundation mutations:', err)
 setError(true)
 } finally {
 setLoading(false)
 setIsFetching(false)
 }
 }, [debouncedSearch, selectedUnit, jenis])

 useEffect(() => {
 fetchMutations()
 }, [fetchMutations])

 // Filter dilakukan di backend via params (search, unit_id, type/jenis).
 // FE tidak perlu filter ulang — langsung pakai data dari API.

 const handleSort = (key) => {
 if (sortKey === key) {
 setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
 } else {
 setSortKey(key)
 setSortOrder('asc')
 }
 }

 const sortedMutations = useMemo(() => {
 return [...mutations].sort((a, b) => {
 let aVal = ''
 let bVal = ''
 if (sortKey === 'nama') {
 aVal = (a.full_name || a.nama || '').toString().toLowerCase()
 bVal = (b.full_name || b.nama || '').toString().toLowerCase()
 } else if (sortKey === 'jenis') {
 aVal = mutationInfo(a).label
 bVal = mutationInfo(b).label
 } else if (sortKey === 'unit') {
 aVal = (a.education_unit?.name || a.unit?.name || '').toString().toLowerCase()
 bVal = (b.education_unit?.name || b.unit?.name || '').toString().toLowerCase()
 } else if (sortKey === 'tanggal') {
 aVal = new Date(a.updated_at || 0).getTime()
 bVal = new Date(b.updated_at || 0).getTime()
 }

 if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
 if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
 return 0
 })
 }, [mutations, sortKey, sortOrder])

 const totalItems = sortedMutations.length
 const lastPage = Math.max(1, Math.ceil(totalItems / perPage))
 const paginatedMutations = sortedMutations.slice((page - 1) * perPage, page * perPage)

 const totalMutasi = mutations.length
 const pindahMasuk = mutations.filter((m) => (m.metadata?.mutasi_type || '').includes('masuk')).length
 const pindahAntarunit = mutations.filter((m) => (m.metadata?.mutasi_type || '').includes('antar')).length
 const pindahKeluar = mutations.filter((m) => (m.metadata?.mutasi_type || '').includes('keluar')).length

 const handleRefresh = () => {
 setPage(1)
 fetchMutations(Boolean(mutations.length))
 }

 const exportRows = paginatedMutations.map((m, idx) => ({
 No: (page - 1) * perPage + idx + 1,
 'NIS / NISN': m.nis || m.nisn || '-',
 Nama: m.full_name || m.nama || '-',
 'Jenis Mutasi': mutationInfo(m).label,
 'Unit Sekolah': m.education_unit?.name || m.unit?.name || '-',
 'Tanggal Pengajuan': m.updated_at ? new Date(m.updated_at).toLocaleDateString('id-ID') : '-',
 Status: 'Selesai',
 }))

  const mutationColumns = useMemo(() => [
    {
      key: 'no',
      label: 'NO',
      className: 'w-[5%] text-center',
      render: (_m, idx) => (
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
      render: (m) => (
        <PersonIdentityCell
          src={m.student?.photo || m.photo}
          name={m.student?.full_name || m.nama}
          subtitle={`${m.student?.nis || m.nis || '-'}`}
        />
      ),
    },
    {
      key: 'jenis',
      label: 'Jenis Mutasi',
      sortable: true,
      className: 'w-[16%] hidden md:table-cell',
      render: (m) => {
        const info = mutationInfo(m)
        return <AppBadge variant={info.variant} dot>{info.label}</AppBadge>
      },
    },
    {
      key: 'unit',
      label: 'Unit Sekolah',
      sortable: true,
      className: 'w-[20%] hidden lg:table-cell',
      render: (m) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          {m.education_unit?.name || m.unit?.name || '-'}
        </span>
      ),
    },
    {
      key: 'tanggal',
      label: 'Tanggal Pengajuan',
      sortable: true,
      className: 'w-[14%] hidden xl:table-cell',
      render: (m) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {m.updated_at ? new Date(m.updated_at).toLocaleDateString('id-ID') : '-'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      className: 'w-[9%] text-center hidden sm:table-cell',
      render: () => (
        <AppBadge variant="neutral" dot>Selesai</AppBadge>
      ),
    },
  ], [page, perPage])

  const renderMobileCard = ({ row: m }) => {
    const info = mutationInfo(m)
    return (
      <div
        onClick={() => setSelectedStudentId(m.student_id || m.id)}
        className="p-3.5 bg-white dark:bg-[#1B2433] rounded-xl border border-emerald-500/20 shadow-xs space-y-2 cursor-pointer hover:border-emerald-500/40 transition"
      >
        <div className="flex items-center gap-3">
          <PersonIdentityCell
            src={m.student?.photo || m.photo}
            name={m.student?.full_name || m.nama}
            subtitle={`${m.student?.nis || m.nis || '-'}`}
          />
          <div className="ml-auto shrink-0">
            <AppBadge variant={info.variant} dot>{info.label}</AppBadge>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-emerald-200/80 dark:border-emerald-800/60">
          <span>{m.education_unit?.name || m.unit?.name || '-'}</span>
          <span>{m.updated_at ? new Date(m.updated_at).toLocaleDateString('id-ID') : '-'}</span>
        </div>
      </div>
    )
  }

 return (
 <MasterDataPage hideBreadcrumb className="foundation-mutations-page">
 {/* Stat Cards Ringkasan Mutasi */}
 <MasterStatsGrid>
 <MasterStatCard icon={UserMinus} label="Total Mutasi" value={totalMutasi} description="Seluruh riwayat mutasi" variant="success" delay={40} />
 <MasterStatCard icon={UserPlus} label="Pindah Masuk" value={pindahMasuk} description="Masuk ke sekolah" variant="info" delay={80} />
 <MasterStatCard icon={ArrowRightLeft} label="Pindah Antarunit" value={pindahAntarunit} description="Mutasi internal unit" variant="warning" delay={120} />
 <MasterStatCard icon={UserMinus} label="Pindah Keluar" value={pindahKeluar} description="Keluar dari sekolah" variant="success" delay={160} />
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
 className="group flex items-center justify-between gap-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/60 p-3.5 shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-emerald-800/60 dark:bg-amber-950/40 text-left cursor-pointer"
 >
 <div className="flex items-center gap-3 min-w-0">
 <div className="flex h-9 w-11 shrink-0 items-center justify-center rounded-xl border bg-amber-100 text-amber-700 border-emerald-200/80 transition-transform duration-200 group-hover:scale-110 dark:bg-amber-900/60 dark:text-amber-300 dark:border-emerald-800/60">
 <UserMinus className="h-5 w-5" />
 </div>
 <div className="min-w-0">
 <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-amber-700 dark:group-hover:text-amber-300">Siswa Keluar (Mutasi)</p>
 <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{totalMutasi} Mutasi Siswa</p>
 </div>
 </div>
 <span className="shrink-0 rounded-lg bg-amber-200/80 px-2 py-1 text-[10px] font-extrabold text-amber-800 dark:bg-amber-900 dark:text-amber-200">Mutasi</span>
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
        id="tabel-mutasi-siswa"
        title="Daftar Mutasi Siswa"
        countLabel={`${totalItems} mutasi`}
        description="Riwayat mutasi siswa sesuai filter dan kewenangan pengguna."
        icon={<ArrowRightLeft className="size-4.5 text-white" strokeWidth={2.2} />}
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
        searchPlaceholder="Cari NIS, NISN, atau nama siswa..."
        filters={
          <div className="flex flex-wrap items-center gap-2.5 w-full">
            <MasterFilterSelect value={jenis} onChange={(e) => { setJenis(e.target.value); setPage(1) }} aria-label="Filter jenis mutasi">
              <option value="all">Semua Jenis Mutasi</option>
              <option value="masuk">Pindah Masuk</option>
              <option value="antarunit">Pindah Antarunit</option>
              <option value="keluar">Pindah Keluar</option>
            </MasterFilterSelect>
            <MasterFilterSelect value={selectedUnit} onChange={(e) => { setSelectedUnit(e.target.value); setPage(1) }} aria-label="Filter unit sekolah">
              <option value="all">Semua Unit Sekolah</option>
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
            {(search || jenis !== 'all' || selectedUnit !== 'all' || perPage !== 10) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setJenis('all')
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
        hasActiveFilters={Boolean(search || jenis !== 'all' || selectedUnit !== 'all' || perPage !== 10)}
        onResetFilters={() => {
          setSearch('')
          setJenis('all')
          setSelectedUnit('all')
          setPerPage(10)
          setPage(1)
        }}
        columns={mutationColumns}
        data={paginatedMutations}
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
        errorTitle="Data mutasi siswa gagal dimuat"
        errorMessage="Periksa koneksi kemudian coba muat ulang."
        onRetry={handleRefresh}
        emptyTitle="Belum ada mutasi siswa"
        emptyDescription="Ubah filter pencarian untuk menampilkan pengajuan mutasi lain."
        page={page}
        totalPages={lastPage}
        totalCount={totalItems}
        onPageChange={setPage}
        onView={(m) => setSelectedStudentId(m.student_id || m.id)}
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
 title="Riwayat Mutasi Siswa Yayasan"
 rows={exportRows}
 filename="Mutasi_Siswa_Yayasan"
 />

 {/* Smart Floating Scroll Navigator */}
 <SmartScrollFab targetId="tabel-mutasi-siswa" downTooltip="Langsung ke Tabel Mutasi" />
 </MasterDataPage>
 )
}
