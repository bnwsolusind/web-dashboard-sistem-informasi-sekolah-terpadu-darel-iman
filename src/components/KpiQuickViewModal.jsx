import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import {
 Search,
 RefreshCw,
 Building2,
 UserCheck,
 Users,
 GraduationCap,
 HeartHandshake,
 Sparkles,
 School,
 Layers,
 ArrowRight,
 AlertCircle,
 TrendingUp,
 Eye,
 Key,
 ShieldCheck,
 UserX,
 FileSpreadsheet,
 FileText,
 CheckCircle2,
 Calculator,
} from 'lucide-react'
import api from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { useDebounce } from '../hooks/useDebounce'
import { Pagination } from './ui/pagination'
import { Modal } from './ui/modal'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'
import { EmptyState } from './ui/empty-state'
import KpiDetailDrawer from './KpiDetailDrawer'
import HeroUiFilterSelect from './ui/HeroUiFilterSelect'

const MODAL_CONFIGS = {
 unit_pendidikan: {
 title: 'Data Unit Pendidikan',
 subtitle: 'Ringkasan Seluruh Unit Pendidikan Aktif Yayasan',
 icon: Building2,
 endpoint: '/foundation/units',
 linkTo: '/dashboard/master/unit-pendidikan',
 },
 guru: {
 title: 'Data Guru & Tenaga Pendidik',
 subtitle: 'Daftar Tenaga Pendidik Aktif di Seluruh Unit',
 icon: UserCheck,
 endpoint: '/foundation/teachers',
 linkTo: '/dashboard/master/guru',
 },
 total_teachers: {
 title: 'Data Guru Pengajar',
 subtitle: 'Daftar Tenaga Pendidik / Guru Aktif Mengajar di Seluruh Unit',
 icon: GraduationCap,
 endpoint: '/foundation/employees',
 defaultParams: { role_type: 'guru_pengajar' },
 linkTo: '/dashboard/master/guru',
 },
 pegawai: {
 title: 'Data Pegawai & Tendik',
 subtitle: 'Daftar Seluruh Pegawai dan Staf Kependidikan',
 icon: Users,
 endpoint: '/foundation/employees',
 linkTo: '/dashboard/master/pegawai',
 },
 tendik: {
 title: 'Data Tenaga Kependidikan (Tendik)',
 subtitle: 'Daftar Staf Administrasi, Operasional, dan Teknis Unit',
 icon: Users,
 endpoint: '/foundation/employees',
 defaultParams: { role_type: 'tendik' },
 linkTo: '/dashboard/master/pegawai',
 },
 siswa: {
 title: 'Data Siswa Aktif',
 subtitle: 'Daftar Seluruh Peserta Didik Aktif Yayasan',
 icon: GraduationCap,
 endpoint: '/foundation/students',
 linkTo: '/dashboard/master/siswa',
 },
 orang_tua: {
 title: 'Data Orang Tua / Wali',
 subtitle: 'Daftar Orang Tua dan Wali Murid Terdaftar',
 icon: HeartHandshake,
 endpoint: '/foundation/parents',
 linkTo: '/dashboard/master/orang-tua',
 },
 alumni: {
 title: 'Data Alumni',
 subtitle: 'Daftar Peserta Didik yang Telah Lulus',
 icon: Sparkles,
 endpoint: '/foundation/alumni',
 linkTo: '/dashboard/master/alumni',
 },
 kelas: {
 title: 'Data Kelas',
 subtitle: 'Daftar Ruang Kelas pada Tahun Ajaran Aktif',
 icon: School,
 endpoint: '/foundation/classes',
 linkTo: '/dashboard/akademik/kelas',
 },
 rombel: {
 title: 'Data Rombongan Belajar (Rombel)',
 subtitle: 'Daftar Rombel & Kapasitas Peserta Didik',
 icon: Layers,
 endpoint: '/foundation/rombel',
 linkTo: '/dashboard/akademik/rombel',
 },
 pengguna: {
 title: 'Data Pengguna Sistem Aktif',
 subtitle: 'Daftar Akun Aktif yang Dapat Mengakses Sistem',
 icon: ShieldCheck,
 endpoint: '/hak-akses/users',
 defaultParams: { status: 'aktif' },
 linkTo: '/dashboard/hak-akses',
 },
 role: {
 title: 'Data Role Terdaftar',
 subtitle: 'Daftar Role dan Cakupan Hak Akses Sistem',
 icon: Key,
 endpoint: '/hak-akses/roles',
 linkTo: '/dashboard/hak-akses',
 },
 pengguna_tanpa_role: {
 title: 'Data User Tanpa Role',
 subtitle: 'Daftar Akun yang Belum Memiliki Role Sistem',
 icon: UserX,
 endpoint: '/hak-akses/users',
 defaultParams: { role_status: 'without_role' },
 linkTo: '/dashboard/hak-akses',
 },
 laporan_lintas_unit: {
 title: 'Laporan Lintas Unit Pendidikan',
 subtitle: 'Rekapitulasi Data & Ekspor Laporan Lintas Unit',
 icon: FileSpreadsheet,
 endpoint: '/foundation/units',
 linkTo: '/dashboard/yayasan/laporan',
 },
 total_konseling: {
 title: 'Data Catatan Konseling BK',
 subtitle: 'Daftar Catatan & Pendampingan Konseling Siswa Terproteksi',
 icon: FileText,
 endpoint: '/teacher/student-notes',
 linkTo: '/portal-guru/workspace',
 },
 kehadiran_guru: {
 title: 'Data Kehadiran Guru Mengajar Hari Ini',
 subtitle: 'Rincian Sesi Kehadiran Guru Mengajar dan Presensi Kelas Hari Ini',
 icon: UserCheck,
 endpoint: '/foundation/teachers',
 linkTo: '/dashboard/laporan-absensi',
 formula: 'Persentase Kehadiran Guru = (Sesi Guru Hadir Mengajar / Total Sesi Terjadwal) × 100%',
 numeratorLabel: 'Sesi Guru Hadir Mengajar',
 denominatorLabel: 'Total Sesi Terjadwal Hari Ini',
 },
 kehadiran_siswa: {
 title: 'Data Kehadiran Siswa Hari Ini',
 subtitle: 'Rincian Presensi Kedatangan dan Ketidakhadiran Siswa di Seluruh Unit',
 icon: Users,
 endpoint: '/foundation/students',
 linkTo: '/dashboard/rekap-absensi-gerbang',
 formula: 'Persentase Kehadiran Siswa = (Siswa Aktif Hadir / Total Siswa Aktif Terdaftar) × 100%',
 numeratorLabel: 'Siswa Aktif Hadir Hari Ini',
 denominatorLabel: 'Total Populasi Siswa Aktif',
 },
 monitoring_ibadah: {
 title: 'Data Monitoring Ibadah Harian Santri',
 subtitle: 'Rincian Evaluasi Mutaba’ah Yaumiyyah (Shalat, Tilawah, Muraja’ah)',
 icon: HeartHandshake,
 endpoint: '/foundation/students',
 linkTo: '/dashboard/monitoring-tahfizh-ibadah-non-pesantren',
 formula: 'Tingkat Kepatuhan Ibadah = (Entri Ibadah Terlaksana / Total Target Jurnal Siswa) × 100%',
 numeratorLabel: 'Entri Ibadah Terlaksana',
 denominatorLabel: 'Total Target Jurnal Siswa',
 },
 input_nilai: {
 title: 'Data Rekap & Leger Nilai Akademik',
 subtitle: 'Rincian Entri Nilai Siswa, Leger Nilai Akhir, dan KKM per Rombel',
 icon: CheckCircle2,
 endpoint: '/foundation/classes',
 linkTo: '/dashboard/laporan-akademik',
 formula: 'Ketuntasan Leger Akademik = (Siswa Nilai Akhir ≥ KKM / Total Catatan Nilai) × 100%',
 numeratorLabel: 'Catatan Siswa Tuntas',
 denominatorLabel: 'Total Catatan Nilai di Leger',
 },
 input_tahfiz: {
 title: 'Data Setoran Tahfizh Al-Qur’an Hari Ini',
 subtitle: 'Rincian Setoran Hafalan Baru (Ziyadah), Muraja’ah, dan Ujian Juz',
 icon: Sparkles,
 endpoint: '/foundation/students',
 linkTo: '/dashboard/laporan-tahfizh',
 formula: 'Capaian Tahfizh = (Setoran Hafalan Hari Ini / Total Santri Binaan) × 100%',
 numeratorLabel: 'Setoran Hafalan Tercatat',
 denominatorLabel: 'Total Santri Terdaftar',
 },
 input_mutabaah: {
 title: 'Data Jurnal Mutaba’ah Siswa Hari Ini',
 subtitle: 'Rincian Jurnal Ibadah Harian Siswa Terverifikasi',
 icon: HeartHandshake,
 endpoint: '/foundation/students',
 linkTo: '/dashboard/monitoring-tahfizh-ibadah-non-pesantren',
 formula: 'Tingkat Partisipasi Jurnal = (Jurnal Terisi Hari Ini / Total Siswa Aktif) × 100%',
 numeratorLabel: 'Jurnal Terisi Hari Ini',
 denominatorLabel: 'Total Siswa Aktif',
 },
}

const KEY_ALIASES = {
 total_units: 'unit_pendidikan',
 total_unit: 'unit_pendidikan',
 unit: 'unit_pendidikan',
 units: 'unit_pendidikan',
 active_units: 'unit_pendidikan',
 unit_pendidikan: 'unit_pendidikan',

 total_teachers: 'total_teachers',
 total_guru: 'guru',
 teachers: 'guru',
 pegawai_guru: 'pegawai',

 total_employees: 'pegawai',
 total_pegawai: 'pegawai',
 employees: 'pegawai',
 total_tendik: 'tendik',
 tendik: 'tendik',
 total_users: 'pengguna',
 active_users: 'pengguna',
 users: 'pengguna',

 total_students: 'siswa',
 total_siswa: 'siswa',
 total_siswa_aktif: 'siswa',
 students: 'siswa',
 santri_binaan: 'siswa',
 total_siswa_binaan: 'siswa',

 total_parents: 'orang_tua',
 total_ortu: 'orang_tua',
 parents: 'orang_tua',

 total_alumni: 'alumni',

 total_classes: 'kelas',
 total_kelas: 'kelas',
 classes: 'kelas',

 total_rombel: 'rombel',
 rombel: 'rombel',

 active_roles: 'role',
 roles: 'role',

 users_without_role: 'pengguna_tanpa_role',
 laporan: 'laporan_lintas_unit',
 laporan_lintas_unit: 'laporan_lintas_unit',
 total_konseling: 'total_konseling',

 kehadiran_guru: 'kehadiran_guru',
 kehadiran_siswa: 'kehadiran_siswa',
 monitoring_ibadah: 'monitoring_ibadah',
 input_nilai: 'input_nilai',
 input_tahfiz: 'input_tahfiz',
 input_mutabaah: 'input_mutabaah',
}

const kpiDataCache = new Map()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 menit
let cachedUnits = null

export default function KpiQuickViewModal({ type, isOpen, onClose, initialUnitId }) {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const resolvedType = KEY_ALIASES[type] || type
  const config = MODAL_CONFIGS[resolvedType]

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [items, setItems] = useState([])
  const [stats, setStats] = useState(null)
  const [paginationMeta, setPaginationMeta] = useState(null)
  const [units, setUnits] = useState(cachedUnits || [])

  // Pagination & Filters
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 350)
  const [selectedUnit, setSelectedUnit] = useState(initialUnitId || 'all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    if (isOpen && initialUnitId) {
      setSelectedUnit(initialUnitId)
    }
  }, [isOpen, initialUnitId])

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, selectedUnit, selectedStatus, resolvedType, perPage])

  // Row Detail Drawer State
  const [selectedDetailId, setSelectedDetailId] = useState(null)
  const [selectedDetailType, setSelectedDetailType] = useState(null)

  // Role & Permission check for "Lihat Detail" button
  const userRoles = user?.roles || []
  const userPermissions = user?.permissions || []
  const canAccessDetail =
    userRoles.some((r) =>
      ['Super Admin', 'Ketua Yayasan', 'Kepala Sekolah', 'Administrator', 'Admin', 'Operator', 'Staf', 'Guru', 'Guru BK'].includes(r)
    ) || userPermissions.length > 0

  // Fetch Units for Filter Dropdown with cache
  useEffect(() => {
    if (isOpen) {
      if (cachedUnits && cachedUnits.length > 0) {
        setUnits(cachedUnits)
        return
      }
      api.get('/foundation/units')
        .then((res) => {
          const raw = res.data?.data || []
          const list = Array.isArray(raw) ? raw : raw.data || []
          cachedUnits = list
          setUnits(list)
        })
        .catch(() => {})
    }
  }, [isOpen])

  // Fetch Main Table & Stats Data with memory cache & server-side pagination
  const fetchData = useCallback(async () => {
    if (!config) return
    const cacheKey = `${resolvedType}_${debouncedSearch}_${selectedUnit}_${selectedStatus}_${page}_${perPage}`
    const cached = kpiDataCache.get(cacheKey)
    const isFresh = cached && Date.now() - cached.timestamp < CACHE_TTL_MS

    if (cached) {
      setItems(cached.items)
      setStats(cached.stats)
      setPaginationMeta(cached.pagination)
      setLoading(false)
      if (isFresh) return
    } else {
      setLoading(true)
    }
    setError(false)

    try {
      const defaultParams = {
        ...(config.defaultParams || {}),
        ...(resolvedType === 'active_units' ? { status: 'aktif' } : {}),
      }
      const params = {
        ...defaultParams,
        search: debouncedSearch || undefined,
        unit_id: selectedUnit !== 'all' ? selectedUnit : undefined,
        ...(selectedStatus !== 'all' ? { status: selectedStatus } : {}),
        page,
        per_page: perPage,
      }

      const res = await api.get(config.endpoint, { params })
      const resData = res.data

      let dataList = []
      let summaryData = null
      let pagination = null

      if (resData && typeof resData === 'object') {
        if (Array.isArray(resData.data) && typeof resData.total === 'number') {
          dataList = resData.data
          pagination = {
            current_page: resData.current_page || page,
            last_page: resData.last_page || 1,
            total: resData.total,
            per_page: resData.per_page || perPage,
            from: resData.from ?? ((page - 1) * perPage + 1),
            to: resData.to ?? Math.min(page * perPage, resData.total),
            isServerPaginated: true,
          }
        } else if (resData.data && typeof resData.data === 'object' && Array.isArray(resData.data.data) && typeof resData.data.total === 'number') {
          dataList = resData.data.data
          pagination = {
            current_page: resData.data.current_page || page,
            last_page: resData.data.last_page || 1,
            total: resData.data.total,
            per_page: resData.data.per_page || perPage,
            from: resData.data.from ?? ((page - 1) * perPage + 1),
            to: resData.data.to ?? Math.min(page * perPage, resData.data.total),
            isServerPaginated: true,
          }
        } else if (Array.isArray(resData.data)) {
          dataList = resData.data
        } else if (Array.isArray(resData)) {
          dataList = resData
        } else if (resData.data?.items && Array.isArray(resData.data.items)) {
          dataList = resData.data.items
        }
        summaryData = resData.summary || resData.data?.summary || resData.meta || null
      } else if (Array.isArray(resData)) {
        dataList = resData
      }

      kpiDataCache.set(cacheKey, {
        items: dataList,
        stats: summaryData,
        pagination,
        timestamp: Date.now(),
      })

      setItems(dataList)
      setStats(summaryData)
      setPaginationMeta(pagination)
    } catch (err) {
      console.error(`Failed to fetch ${resolvedType} data for modal:`, err)
      if (!cached) setError(true)
    } finally {
      setLoading(false)
    }
  }, [config, resolvedType, debouncedSearch, selectedUnit, selectedStatus, page, perPage])

  useEffect(() => {
    if (isOpen && resolvedType) {
      fetchData()
    } else {
      setItems([])
      setStats(null)
      setPaginationMeta(null)
      setSearch('')
      setSelectedUnit('all')
      setSelectedStatus('all')
      setPage(1)
      setError(false)
      setSelectedDetailId(null)
    }
  }, [isOpen, resolvedType, fetchData])

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (selectedDetailId) {
          setSelectedDetailId(null)
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedDetailId, onClose])

  if (!isOpen || !config) return null

  const IconComponent = config.icon || Building2

  // Client-side fallback filter & pagination when endpoint is unpaginated
  const filteredItems = (Array.isArray(items) ? items : []).filter((row) => {
    if (paginationMeta?.isServerPaginated) return true
    if (!debouncedSearch) return true
    const q = debouncedSearch.toLowerCase()
    const nameStr = String(row.name || row.nama || row.full_name || row.judul || '').toLowerCase()
    const codeStr = String(row.code || row.kode || row.niy || row.nisn || '').toLowerCase()
    const jenisStr = String(row.jenis_unit || row.level || row.location || row.kepala_sekolah || '').toLowerCase()
    return nameStr.includes(q) || codeStr.includes(q) || jenisStr.includes(q)
  })

  const effectivePaginationMeta = paginationMeta?.isServerPaginated
    ? paginationMeta
    : {
        current_page: page,
        last_page: Math.max(1, Math.ceil(filteredItems.length / perPage)),
        total: filteredItems.length,
        per_page: perPage,
        from: filteredItems.length > 0 ? (page - 1) * perPage + 1 : 0,
        to: Math.min(page * perPage, filteredItems.length),
        isServerPaginated: false,
      }

  const displayItems = paginationMeta?.isServerPaginated
    ? items
    : filteredItems.slice((page - 1) * perPage, page * perPage)

  const handleOpenRowDetail = (rowId) => {
    setSelectedDetailType(resolvedType)
    setSelectedDetailId(rowId)
  }

  return (
    <>
      <Modal
 isOpen={isOpen}
 onClose={onClose}
 maxWidth="max-w-6xl"
 title={
 <div className="flex items-center gap-3.5">
 <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-sm">
 <IconComponent className="size-5 text-white" />
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <h3 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
 {config.title}
 </h3>
 <span className="inline-flex items-center gap-1 rounded-full bg-white/20 text-white border border-white/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0">
 <Sparkles className="size-3" /> Data Realtime
 </span>
 </div>
 <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-0.5 truncate">
 {config.subtitle}
 </p>
 </div>
 </div>
 }
 footer={
          <div className="flex w-full flex-col gap-3">
            {/* Top row of footer: Pagination & Items per page */}
            {effectivePaginationMeta.total > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-emerald-100/80 dark:border-emerald-800/80 pb-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span>Menampilkan</span>
                  <span className="font-extrabold text-slate-800 dark:text-white">
                    {effectivePaginationMeta.from}
                  </span>
                  <span>-</span>
                  <span className="font-extrabold text-slate-800 dark:text-white">
                    {effectivePaginationMeta.to}
                  </span>
                  <span>dari</span>
                  <span className="font-extrabold text-slate-800 dark:text-white">
                    {effectivePaginationMeta.total.toLocaleString('id-ID')}
                  </span>
                  <span>data</span>
                  <span className="text-slate-300 dark:text-slate-700 mx-1">•</span>
                  <select
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(Number(e.target.value))
                      setPage(1)
                    }}
                    className="h-9 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 px-2.5 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                  >
                    <option value={10}>10 / hal</option>
                    <option value={25}>25 / hal</option>
                    <option value={50}>50 / hal</option>
                    <option value={100}>100 / hal</option>
                  </select>
                </div>

                <Pagination
                  currentPage={effectivePaginationMeta.current_page}
                  totalPages={effectivePaginationMeta.last_page}
                  onPageChange={(newPage) => setPage(newPage)}
                />
              </div>
            )}

            {/* Bottom row of footer: Action Buttons */}
            <div className="flex items-center justify-between gap-2.5">
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                Gunakan filter di atas untuk mempersempit pencarian
              </span>
              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700"
                >
                  Tutup
                </button>

                <button
                  type="button"
                  onClick={fetchData}
                  disabled={loading}
                  className="h-9.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border-2 border-sky-600 shadow-xs disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>

                {canAccessDetail && config.linkTo && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      navigate(config.linkTo)
                    }}
                    className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20"
                  >
                    <span>Lihat Detail</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        }
 >
 <div className="space-y-5">
 {/* BANNER TRANSPARANSI FORMULA KPI */}
 <RenderKpiFormulaBanner
 config={config}
 canAccessDetail={canAccessDetail}
 onGoToDetail={() => {
 onClose()
 navigate(config.linkTo)
 }}
 />

 {/* 1. TOP SUMMARY CARDS & SPARKLINE OVERVIEW */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 <RenderStatsOverview type={resolvedType} items={paginationMeta?.isServerPaginated ? items : filteredItems} stats={{ ...stats, total: effectivePaginationMeta.total ?? stats?.total }} loading={loading} />
 </div>

 {/* 2. SEARCH & FILTER BAR */}
 <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-emerald-200/80 dark:bg-[#13221f]/50 dark:border-emerald-800/60">
 <div className="relative flex-1">
 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder={`Cari data ${config.title.toLowerCase()}...`}
 className="h-10 w-full pl-10 pr-4 text-xs font-bold bg-white dark:bg-slate-900 border-2 border-[#b6f6d9] dark:border-emerald-700/80 rounded-xl placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-slate-100 shadow-xs transition-all"
 />
 </div>

 <div className="flex flex-wrap items-center gap-2">
 {!['unit_pendidikan', 'role', 'pengguna', 'pengguna_tanpa_role', 'total_konseling'].includes(resolvedType) && units.length > 0 && (
 <div className="w-44">
 <HeroUiFilterSelect
 size="sm"
 value={String(selectedUnit)}
 onChange={(val) => setSelectedUnit(val)}
 options={[
 { value: 'all', label: 'Semua Unit' },
 ...units.map((u) => ({
 value: String(u.id),
 label: u.name || u.code,
 })),
 ]}
 placeholder="Semua Unit"
 aria-label="Filter Unit Pendidikan"
 />
 </div>
 )}

 {resolvedType !== 'role' && resolvedType !== 'pengguna_tanpa_role' && (
 <div className="w-36">
 <HeroUiFilterSelect
 size="sm"
 value={selectedStatus}
 onChange={(val) => setSelectedStatus(val)}
 options={[
 { value: 'all', label: 'Semua Status' },
 { value: 'aktif', label: 'Aktif' },
 { value: 'nonaktif', label: 'Nonaktif' },
 ]}
 placeholder="Semua Status"
 aria-label="Filter Status"
 />
 </div>
 )}
 </div>
 </div>

 {/* 3. CONTENT TABLE PREVIEW (MAX 10 ITEMS) / SKELETON / ERROR / EMPTY STATE */}
 {loading ? (
 <RenderTableSkeleton />
 ) : error ? (
 <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/50 dark:border-emerald-800/60 dark:bg-rose-950/20">
 <AlertCircle className="h-10 w-10 text-rose-500 mb-2" />
 <h4 className="text-sm font-bold text-slate-800 dark:text-white">Data tidak dapat dimuat</h4>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
 Terjadi kesalahan saat mengunduh data dari server. Silakan coba beberapa saat lagi.
 </p>
 <Button variant="primary" size="sm" onClick={fetchData} className="mt-4 gap-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl">
 <RefreshCw className="h-3.5 w-3.5" />
 <span>Coba Lagi</span>
 </Button>
 </div>
 ) : items.length === 0 ? (
 <EmptyState
 title="Belum Ada Data"
 description={`Tidak ada record data ${config.title.toLowerCase()} yang sesuai dengan filter pencarian.`}
 />
 ) : (
 <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
              <RenderKpiTable type={resolvedType} items={displayItems} fromIndex={effectivePaginationMeta.from || 1} onViewDetail={handleOpenRowDetail} />

            </div>
 )}
 </div>
 </Modal>

 {/* ITEM DETAIL DRAWER (PANEL SAMPING KANAN) */}
 <KpiDetailDrawer
 type={selectedDetailType}
 id={selectedDetailId}
 isOpen={Boolean(selectedDetailId)}
 onClose={() => setSelectedDetailId(null)}
 />
 </>
 )
}

KpiQuickViewModal.propTypes = {
 type: PropTypes.string,
 isOpen: PropTypes.bool.isRequired,
 onClose: PropTypes.func.isRequired,
}

// Sub-component: KPI Formula Transparency Banner
function RenderKpiFormulaBanner({ config, canAccessDetail, onGoToDetail }) {
 if (!config || !config.formula) return null

 return (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] p-4 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900 shadow-sm">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
 <div className="space-y-1.5">
 <div className="flex items-center gap-2">
 <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
 <Calculator className="h-3.5 w-3.5" />
 </span>
 <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950 dark:text-emerald-200">
 Transparansi Formula & Sumber Data KPI
 </h4>
 </div>
 <p className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300 pl-8">
 {config.formula}
 </p>
 </div>

 <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 pl-8 md:pl-0">
 {config.numeratorLabel && (
 <span className="inline-flex items-center gap-1 rounded-lg bg-white/80 dark:bg-slate-800/80 px-2.5 py-1 border border-emerald-200/80 dark:border-emerald-800/60">
 <span className="text-slate-400">Pembilang:</span>
 <strong className="text-emerald-700 dark:text-emerald-300">{config.numeratorLabel}</strong>
 </span>
 )}
 {config.denominatorLabel && (
 <span className="inline-flex items-center gap-1 rounded-lg bg-white/80 dark:bg-slate-800/80 px-2.5 py-1 border border-emerald-200/80 dark:border-emerald-800/60">
 <span className="text-slate-400">Penyebut:</span>
 <strong className="text-slate-800 dark:text-slate-200">{config.denominatorLabel}</strong>
 </span>
 )}
 {canAccessDetail && config.linkTo && (
 <button
 type="button"
 onClick={onGoToDetail}
 className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black px-3 py-1.5 text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
 >
 <span>Telusuri Sumber</span>
 <ArrowRight className="h-3 w-3" />
 </button>
 )}
 </div>
 </div>
 </div>
 )
}

RenderKpiFormulaBanner.propTypes = {
 config: PropTypes.object,
 canAccessDetail: PropTypes.bool,
 onGoToDetail: PropTypes.func.isRequired,
}

// Sub-component: Statistics Summary Cards + Sparkline Badges
function RenderStatsOverview({ type, items, stats, loading }) {
 if (loading) {
 return [1, 2, 3, 4].map((i) => (
 <div key={i} className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-700/80 space-y-2">
 <Skeleton className="h-3 w-20" />
 <Skeleton className="h-6 w-12" />
 </div>
 ))
 }

 const statCardsMap = {
 unit_pendidikan: [
 { label: 'Total Unit', val: stats?.total ?? items.length, trend: 'Aktif', color: 'text-emerald-600' },
 { label: 'Unit Aktif', val: items.filter((u) => u.is_active).length, trend: `${items.length > 0 ? Math.round((items.filter((u) => u.is_active).length / items.length) * 100) : 100}%`, color: 'text-blue-600' },
 { label: 'Total Guru', val: items.reduce((acc, u) => acc + Number(u.guru_count || 0), 0), trend: 'SDM', color: 'text-purple-600' },
 { label: 'Total Siswa', val: items.reduce((acc, u) => acc + Number(u.siswa_aktif_count || 0), 0), trend: 'Siswa', color: 'text-amber-600' },
 ],
 guru: [
 { label: 'Total Guru', val: stats?.total || items.length, trend: 'Pendidik', color: 'text-emerald-600' },
 { label: 'Guru Aktif', val: items.filter((g) => g.status === 'aktif' || g.status === 'Active' || !g.status).length, trend: 'Aktif', color: 'text-blue-600' },
 { label: 'Guru Tetap', val: items.filter((g) => (g.status_pegawai || '').toLowerCase().includes('tetap')).length || items.length, trend: 'Tetap', color: 'text-indigo-600' },
 { label: 'Guru Honorer', val: items.filter((g) => (g.status_pegawai || '').toLowerCase().includes('honorer')).length, trend: 'Honorer', color: 'text-amber-600' },
 ],
 total_teachers: [
 { label: 'Total Guru Pengajar', val: stats?.total || items.length, trend: 'Pendidik', color: 'text-emerald-600' },
 { label: 'Guru Aktif', val: stats?.total || items.length, trend: 'Aktif', color: 'text-blue-600' },
 { label: 'Guru Tetap', val: items.filter((g) => (g.status_pegawai || '').toLowerCase().includes('tetap')).length || items.length, trend: 'Tetap', color: 'text-indigo-600' },
 { label: 'Guru Honorer', val: items.filter((g) => (g.status_pegawai || '').toLowerCase().includes('honorer')).length, trend: 'Honorer', color: 'text-amber-600' },
 ],
 tendik: [
 { label: 'Total Tendik', val: stats?.total || items.length, trend: 'Staf', color: 'text-emerald-600' },
 { label: 'Tendik Aktif', val: items.filter((p) => p.status === 'aktif' || p.status === 'Active' || !p.status).length, trend: 'Aktif', color: 'text-blue-600' },
 { label: 'Staf Administrasi', val: items.filter((p) => (p.position?.name || p.jabatan || '').toLowerCase().includes('admin') || (p.position?.name || p.jabatan || '').toLowerCase().includes('tata usaha')).length || items.length, trend: 'Operasional', color: 'text-indigo-600' },
 { label: 'Staf Penunjang', val: items.filter((p) => !(p.position?.name || p.jabatan || '').toLowerCase().includes('admin')).length, trend: 'Teknis', color: 'text-amber-600' },
 ],
 pegawai: [
 { label: 'Total Pegawai', val: stats?.total || items.length, trend: 'SDM', color: 'text-emerald-600' },
 { label: 'Pegawai Aktif', val: stats?.aktif ?? items.filter((p) => p.status === 'aktif' || p.status === 'Active' || !p.status).length, trend: 'Aktif', color: 'text-blue-600' },
 { label: 'Pegawai Cuti', val: stats?.cuti ?? items.filter((p) => (p.status || '').toLowerCase().includes('cuti')).length, trend: 'Cuti', color: 'text-amber-600' },
 { label: 'Pegawai Nonaktif', val: stats?.nonaktif ?? items.filter((p) => (p.status || '').toLowerCase().includes('nonaktif')).length, trend: 'Nonaktif', color: 'text-rose-600' },
 ],
 siswa: [
 { label: 'Total Siswa', val: stats?.total || items.length, trend: 'Peserta Didik', color: 'text-emerald-600' },
 { label: 'Laki-laki', val: stats?.male ?? items.filter((s) => s.gender === 'male' || s.gender === 'L').length, trend: 'Siswa L', color: 'text-blue-600' },
 { label: 'Perempuan', val: stats?.female ?? items.filter((s) => s.gender === 'female' || s.gender === 'P').length, trend: 'Siswi P', color: 'text-rose-600' },
 { label: 'Siswa Aktif', val: stats?.active ?? stats?.total ?? items.length, trend: 'Aktif', color: 'text-indigo-600' },
 ],
 orang_tua: [
 { label: 'Total Orang Tua', val: stats?.total || items.length, trend: 'Wali Murid', color: 'text-emerald-600' },
 { label: 'NIK Ayah Terisi', val: stats?.father ?? items.filter((p) => p.father_nik).length, trend: 'Ayah', color: 'text-blue-600' },
 { label: 'NIK Ibu Terisi', val: stats?.mother ?? items.filter((p) => p.mother_nik).length, trend: 'Ibu', color: 'text-rose-600' },
 { label: 'Wali Lainnya', val: stats?.guardian ?? items.filter((p) => !p.father_nik && !p.mother_nik).length, trend: 'Wali', color: 'text-amber-600' },
 ],
 alumni: [
 { label: 'Total Alumni', val: items.length, trend: 'Lulusan', color: 'text-emerald-600' },
 { label: 'Tahun Terakhir', val: new Date().getFullYear() - 1, trend: 'Terbaru', color: 'text-blue-600' },
 { label: 'Unit Terdaftar', val: new Set(items.map((i) => i.unit_id)).size || 1, trend: 'Unit', color: 'text-purple-600' },
 { label: 'Status Lulus', val: items.length, trend: 'Lulus', color: 'text-indigo-600' },
 ],
 kelas: [
 { label: 'Total Kelas', val: stats?.total || items.length, trend: 'Ruang', color: 'text-emerald-600' },
 { label: 'Kelas Aktif', val: stats?.aktif || items.length, trend: 'Aktif', color: 'text-blue-600' },
 { label: 'Kelas Nonaktif', val: stats?.nonaktif || 0, trend: 'Nonaktif', color: 'text-rose-600' },
 { label: 'Total Siswa', val: items.reduce((acc, k) => acc + Number(k.students_count || 0), 0), trend: 'Terisi', color: 'text-indigo-600' },
 ],
 rombel: [
 { label: 'Total Rombel', val: stats?.total || items.length, trend: 'Rombel', color: 'text-emerald-600' },
 { label: 'Rombel Aktif', val: stats?.aktif || items.length, trend: 'Aktif', color: 'text-blue-600' },
 { label: 'Kapasitas', val: stats?.kapasitas || (items.length * 30), trend: 'Siswa', color: 'text-amber-600' },
 { label: 'Terisi', val: stats?.terisi || items.reduce((acc, r) => acc + Number(r.students_count || 0), 0), trend: 'Terdaftar', color: 'text-indigo-600' },
 ],
 pengguna: [
 { label: 'Pengguna Aktif', val: stats?.total ?? items.length, trend: 'Akun', color: 'text-emerald-600' },
 { label: 'Sudah Memiliki Role', val: items.filter((u) => (u.roles || []).length > 0).length, trend: 'Role', color: 'text-blue-600' },
 { label: 'Wajib Ganti Password', val: items.filter((u) => u.must_change_password).length, trend: 'Keamanan', color: 'text-amber-600' },
 { label: 'Data Ditampilkan', val: items.length, trend: 'Baris', color: 'text-indigo-600' },
 ],
 role: [
 { label: 'Total Role', val: stats?.total ?? items.length, trend: 'Role', color: 'text-emerald-600' },
 { label: 'Total Izin', val: items.reduce((acc, role) => acc + Number(role.jumlah_izin || 0), 0), trend: 'Permission', color: 'text-blue-600' },
 { label: 'Total Pengguna', val: items.reduce((acc, role) => acc + Number(role.jumlah_pengguna || 0), 0), trend: 'User', color: 'text-indigo-600' },
 { label: 'Role Belum Dipakai', val: items.filter((role) => Number(role.jumlah_pengguna || 0) === 0).length, trend: 'Kosong', color: 'text-amber-600' },
 ],
 pengguna_tanpa_role: [
 { label: 'Tanpa Role', val: stats?.total ?? items.length, trend: 'Perlu Ditinjau', color: 'text-rose-600' },
 { label: 'Akun Aktif', val: items.filter((u) => u.is_active).length, trend: 'Aktif', color: 'text-emerald-600' },
 { label: 'Akun Nonaktif', val: items.filter((u) => !u.is_active).length, trend: 'Nonaktif', color: 'text-slate-600' },
 { label: 'Data Ditampilkan', val: items.length, trend: 'Baris', color: 'text-indigo-600' },
 ],
 total_konseling: [
 { label: 'Total Catatan', val: stats?.total ?? items.length, trend: 'Catatan', color: 'text-emerald-600' },
 { label: 'Siswa Didampingi', val: new Set(items.map((i) => i.student_id)).size, trend: 'Siswa', color: 'text-blue-600' },
 { label: 'Prioritas Tinggi', val: items.filter((i) => ['tinggi', 'high', 'urgent'].includes(String(i.priority || '').toLowerCase())).length, trend: 'Prioritas', color: 'text-rose-600' },
 { label: 'Tindak Lanjut', val: items.filter((i) => Boolean(i.follow_up)).length, trend: 'Tindak Lanjut', color: 'text-amber-600' },
 ],
 kehadiran_guru: [
 { label: 'Sesi Hadir', val: stats?.hadir ?? items.filter((g) => g.status === 'aktif').length, trend: 'Hadir', color: 'text-emerald-600' },
 { label: 'Total Sesi', val: stats?.total ?? items.length, trend: 'Sesi', color: 'text-blue-600' },
 { label: 'Izin / Sakit', val: stats?.izin ?? 0, trend: 'Izin', color: 'text-amber-600' },
 { label: 'Belum Presensi', val: stats?.alpha ?? 0, trend: 'Belum', color: 'text-rose-600' },
 ],
 kehadiran_siswa: [
 { label: 'Siswa Hadir', val: stats?.hadir ?? items.filter((s) => s.is_active).length, trend: 'Hadir', color: 'text-emerald-600' },
 { label: 'Total Siswa', val: stats?.total ?? items.length, trend: 'Populasi', color: 'text-blue-600' },
 { label: 'Izin / Sakit', val: stats?.izin ?? 0, trend: 'Izin', color: 'text-amber-600' },
 { label: 'Tanpa Keterangan', val: stats?.alpha ?? 0, trend: 'Alpha', color: 'text-rose-600' },
 ],
 monitoring_ibadah: [
 { label: 'Jurnal Terverifikasi', val: stats?.completed ?? items.length, trend: 'Selesai', color: 'text-emerald-600' },
 { label: 'Target Jurnal', val: stats?.total ?? items.length, trend: 'Target', color: 'text-blue-600' },
 { label: 'Santri Terdata', val: items.length, trend: 'Santri', color: 'text-indigo-600' },
 { label: 'Kepatuhan', val: stats?.total ? `${Math.round(((stats.completed || 0) / stats.total) * 100)}%` : '100%', trend: 'Rasio', color: 'text-purple-600' },
 ],
 input_nilai: [
 { label: 'Catatan Tuntas', val: stats?.passed ?? items.length, trend: 'Tuntas', color: 'text-emerald-600' },
 { label: 'Total Leger', val: stats?.total ?? items.length, trend: 'Catatan', color: 'text-blue-600' },
 { label: 'Perlu Remedial', val: stats?.remedial ?? 0, trend: 'Remedial', color: 'text-rose-600' },
 { label: 'Target KKM', val: '75.0', trend: 'Standar', color: 'text-amber-600' },
 ],
 input_tahfiz: [
 { label: 'Setoran Masuk', val: stats?.submitted ?? items.length, trend: 'Ziyadah', color: 'text-emerald-600' },
 { label: 'Santri Terdaftar', val: stats?.total ?? items.length, trend: 'Santri', color: 'text-blue-600' },
 { label: 'Belum Setor', val: Math.max(0, (stats?.total || items.length) - (stats?.submitted || items.length)), trend: 'Belum', color: 'text-amber-600' },
 { label: 'Status Penilaian', val: 'Aktif', trend: 'Harian', color: 'text-indigo-600' },
 ],
 input_mutabaah: [
 { label: 'Jurnal Terisi', val: stats?.completed ?? items.length, trend: 'Terisi', color: 'text-emerald-600' },
 { label: 'Total Siswa', val: stats?.total ?? items.length, trend: 'Siswa', color: 'text-blue-600' },
 { label: 'Belum Mengisi', val: Math.max(0, (stats?.total || items.length) - (stats?.completed || items.length)), trend: 'Belum', color: 'text-rose-600' },
 { label: 'Validasi Ortu', val: 'Tervalidasi', trend: 'Status', color: 'text-indigo-600' },
 ],
 }

 const normalizedType = KEY_ALIASES[type] || type
 const list = statCardsMap[normalizedType] || statCardsMap.unit_pendidikan

 return list.map((card, idx) => (
 <div key={idx} className="p-3 rounded-xl bg-white dark:bg-[#13221f] border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs space-y-1">
 <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
 <span>{card.label}</span>
 {card.trend && (
 <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
 <TrendingUp className="h-3 w-3" />
 {card.trend}
 </span>
 )}
 </div>
 <div className={`text-lg sm:text-xl font-black ${card.color} dark:text-white`}>
        {typeof card.val === "number" || (card.val !== null && card.val !== "" && !isNaN(card.val) && !isNaN(Number(card.val)))
          ? Number(card.val).toLocaleString("id-ID")
          : (card.val ?? 0)}
 </div>
 </div>
 ))
}

// Sub-component: Skeleton Table
function RenderTableSkeleton() {
 return (
 <div className="space-y-2 p-2">
 <Skeleton className="h-10 w-full rounded-xl" />
 {[1, 2, 3, 4, 5].map((i) => (
 <Skeleton key={i} className="h-12 w-full rounded-xl" />
 ))}
 </div>
 )
}

// Action Button Helper Component for Table Rows
function ActionButton({ rowId, onViewDetail }) {
  return (
    <button
      type="button"
      onClick={() => onViewDetail(rowId)}
      title="Lihat Detail"
      aria-label="Lihat Detail"
      className="flex size-8 items-center justify-center rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-400 dark:hover:bg-emerald-900/60 transition-all cursor-pointer shadow-2xs active:scale-95 mx-auto"
    >
      <Eye className="size-4 text-emerald-600 dark:text-emerald-400" />
    </button>
  )
}

ActionButton.propTypes = {
 rowId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
 onViewDetail: PropTypes.func.isRequired,
}

// Sub-component: Render specific table headers and rows according to requested KPI type with AKSI column
function RenderKpiTable({ type, items, fromIndex = 1, onViewDetail }) {
 switch (type) {
 case 'unit_pendidikan':
 return (
 <table className="w-full text-xs text-left text-slate-700 dark:text-slate-200">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-xs font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
 <tr>
 <th className="px-3.5 py-3 text-center w-12">No</th>
 <th className="px-4 py-3">Kode</th>
 <th className="px-4 py-3">Nama Unit</th>
 <th className="px-4 py-3">Jenjang</th>
 <th className="px-4 py-3">Kepala Sekolah</th>
 <th className="px-4 py-3 text-center">Guru</th>
 <th className="px-4 py-3 text-center">Pegawai</th>
 <th className="px-4 py-3 text-center">Siswa</th>
 <th className="px-4 py-3 text-center">Status</th>
 <th className="px-4 py-3 text-center">Aksi</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {items.map((row, i) => (
 <tr key={row.id || i} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30">
 <td className="px-3.5 py-3 text-center font-bold text-slate-400">{(fromIndex || 1) + i}</td>
 <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{row.code || row.kode || '-'}</td>
 <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{row.name}</td>
 <td className="px-4 py-3 font-medium">{row.jenis_unit || row.level || '-'}</td>
 <td className="px-4 py-3 font-medium">{row.kepala_sekolah || 'Belum Ditentukan'}</td>
 <td className="px-4 py-3 text-center font-bold">{row.guru_count || 0}</td>
 <td className="px-4 py-3 text-center font-bold">{row.pegawai_count || 0}</td>
 <td className="px-4 py-3 text-center font-bold">{row.siswa_aktif_count || 0}</td>
 <td className="px-4 py-3 text-center">
 <Badge variant={row.is_active ? 'success' : 'secondary'}>
 {row.is_active ? 'Aktif' : 'Nonaktif'}
 </Badge>
 </td>
 <td className="px-4 py-3 text-center">
 <ActionButton rowId={row.id || row.uuid} onViewDetail={onViewDetail} />
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 )

 case 'guru':
 case 'total_teachers':
 case 'kehadiran_guru':
 return (
 <table className="w-full text-xs text-left text-slate-700 dark:text-slate-200">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-xs font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
 <tr>
 <th className="px-3.5 py-3 text-center w-12">No</th>
 <th className="px-4 py-3">NIY</th>
 <th className="px-4 py-3">Nama Guru</th>
 <th className="px-4 py-3">Unit</th>
 <th className="px-4 py-3">Jabatan</th>
 <th className="px-4 py-3">Status Pegawai</th>
 <th className="px-4 py-3 text-center">Status</th>
 <th className="px-4 py-3 text-center">Aksi</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {items.map((row, i) => (
 <tr key={row.id || i} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30">
 <td className="px-3.5 py-3 text-center font-bold text-slate-400">{(fromIndex || 1) + i}</td>
 <td className="px-4 py-3 font-mono font-bold">{row.niy || row.nik || '-'}</td>
 <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{row.nama_lengkap}</td>
 <td className="px-4 py-3">{row.unit?.name || row.unit?.code || '-'}</td>
 <td className="px-4 py-3 font-medium">{row.position?.nama_jabatan || row.jabatan || 'Guru'}</td>
 <td className="px-4 py-3 font-medium">{row.status_pegawai || 'Tetap'}</td>
 <td className="px-4 py-3 text-center">
 <Badge variant="success">Aktif</Badge>
 </td>
 <td className="px-4 py-3 text-center">
 <ActionButton rowId={row.id || row.uuid} onViewDetail={onViewDetail} />
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 )

 case 'pegawai':
 return (
 <table className="w-full text-xs text-left text-slate-700 dark:text-slate-200">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-xs font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
 <tr>
 <th className="px-3.5 py-3 text-center w-12">No</th>
 <th className="px-4 py-3">NIY</th>
 <th className="px-4 py-3">Nama Pegawai</th>
 <th className="px-4 py-3">Jabatan</th>
 <th className="px-4 py-3">Unit</th>
 <th className="px-4 py-3 text-center">Status</th>
 <th className="px-4 py-3 text-center">Aksi</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {items.map((row, i) => (
 <tr key={row.id || i} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30">
 <td className="px-3.5 py-3 text-center font-bold text-slate-400">{(fromIndex || 1) + i}</td>
 <td className="px-4 py-3 font-mono font-bold">{row.niy || row.nik || '-'}</td>
 <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{row.nama_lengkap}</td>
 <td className="px-4 py-3 font-medium">{row.position?.nama_jabatan || row.jabatan || 'Staf'}</td>
 <td className="px-4 py-3">{row.unit?.name || row.unit?.code || '-'}</td>
 <td className="px-4 py-3 text-center">
 <Badge variant="success">{row.status || 'Aktif'}</Badge>
 </td>
 <td className="px-4 py-3 text-center">
 <ActionButton rowId={row.id || row.uuid} onViewDetail={onViewDetail} />
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 )

 case 'siswa':
 case 'kehadiran_siswa':
 case 'monitoring_ibadah':
 case 'input_tahfiz':
 case 'input_mutabaah':
 return (
 <table className="w-full text-xs text-left text-slate-700 dark:text-slate-200">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-xs font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
 <tr>
 <th className="px-3.5 py-3 text-center w-12">No</th>
 <th className="px-4 py-3">NIS</th>
 <th className="px-4 py-3">Nama Siswa</th>
 <th className="px-4 py-3">Gender</th>
 <th className="px-4 py-3">Unit</th>
 <th className="px-4 py-3">Kelas</th>
 <th className="px-4 py-3 text-center">Status</th>
 <th className="px-4 py-3 text-center">Aksi</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {items.map((row, i) => (
 <tr key={row.id || i} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30">
 <td className="px-3.5 py-3 text-center font-bold text-slate-400">{(fromIndex || 1) + i}</td>
 <td className="px-4 py-3 font-mono font-bold">{row.nis || row.nisn || '-'}</td>
 <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{row.full_name}</td>
 <td className="px-4 py-3 font-medium">{row.gender === 'male' || row.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
 <td className="px-4 py-3">{row.education_unit?.name || row.unit?.name || '-'}</td>
 <td className="px-4 py-3 font-medium">{row.kelas?.nama_kelas || row.school_class?.name || '-'}</td>
 <td className="px-4 py-3 text-center">
 <Badge variant={row.is_active ? 'success' : 'secondary'}>
 {row.is_active ? 'Aktif' : 'Nonaktif'}
 </Badge>
 </td>
 <td className="px-4 py-3 text-center">
 <ActionButton rowId={row.id || row.uuid} onViewDetail={onViewDetail} />
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 )

 case 'orang_tua':
 return (
 <table className="w-full text-xs text-left text-slate-700 dark:text-slate-200">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-xs font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
 <tr>
 <th className="px-3.5 py-3 text-center w-12">No</th>
 <th className="px-4 py-3">Nama Orang Tua / Wali</th>
 <th className="px-4 py-3">NIK</th>
 <th className="px-4 py-3">Kontak</th>
 <th className="px-4 py-3">Anak Terdaftar</th>
 <th className="px-4 py-3">Unit Sekolah</th>
 <th className="px-4 py-3 text-center">Aksi</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {items.map((row, i) => {
 const children = row.students || []
 const firstChild = children[0]
 return (
 <tr key={row.id || i} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30">
 <td className="px-3.5 py-3 text-center font-bold text-slate-400">{(fromIndex || 1) + i}</td>
 <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
 {row.full_name || 'Orang Tua / Wali'}
 </td>
 <td className="px-4 py-3 font-mono font-medium">{row.nik || '-'}</td>
 <td className="px-4 py-3 font-medium">{row.phone || row.email || '-'}</td>
 <td className="px-4 py-3 font-medium">
 {children.length > 0
 ? children.map((c) => c.full_name).join(', ')
 : 'Belum terhubung'}
 </td>
 <td className="px-4 py-3 font-medium">
 {firstChild?.education_unit?.name || '-'}
 </td>
 <td className="px-4 py-3 text-center">
 <ActionButton rowId={row.id || row.uuid} onViewDetail={onViewDetail} />
 </td>
 </tr>
 )
 })}
 </tbody>
 </table>
 )

 case 'alumni':
 return (
 <table className="w-full text-xs text-left text-slate-700 dark:text-slate-200">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-xs font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
 <tr>
 <th className="px-3.5 py-3 text-center w-12">No</th>
 <th className="px-4 py-3">NIS</th>
 <th className="px-4 py-3">Nama Alumni</th>
 <th className="px-4 py-3">Unit Terakhir</th>
 <th className="px-4 py-3">Tahun Lulus</th>
 <th className="px-4 py-3 text-center">Status</th>
 <th className="px-4 py-3 text-center">Aksi</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {items.map((row, i) => (
 <tr key={row.id || i} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30">
 <td className="px-3.5 py-3 text-center font-bold text-slate-400">{(fromIndex || 1) + i}</td>
 <td className="px-4 py-3 font-mono font-bold">{row.nis || '-'}</td>
 <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{row.full_name}</td>
 <td className="px-4 py-3">{row.education_unit?.name || row.unit?.name || '-'}</td>
 <td className="px-4 py-3 font-medium">{row.tahun_masuk ? (Number(row.tahun_masuk) + 3) : new Date().getFullYear() - 1}</td>
 <td className="px-4 py-3 text-center">
 <Badge variant="purple">Alumni</Badge>
 </td>
 <td className="px-4 py-3 text-center">
 <ActionButton rowId={row.id || row.uuid} onViewDetail={onViewDetail} />
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 )

 case 'kelas':
 case 'rombel':
 case 'input_nilai':
 return (
 <table className="w-full text-xs text-left text-slate-700 dark:text-slate-200">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-xs font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
 <tr>
 <th className="px-3.5 py-3 text-center w-12">No</th>
 <th className="px-4 py-3">Kode / Nama Kelas</th>
 <th className="px-4 py-3">Tingkat</th>
 <th className="px-4 py-3">Unit Pendidikan</th>
 <th className="px-4 py-3">Wali Kelas</th>
 <th className="px-4 py-3 text-center">Jumlah Siswa</th>
 <th className="px-4 py-3 text-center">Kapasitas</th>
 <th className="px-4 py-3 text-center">Aksi</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {items.map((row, i) => (
 <tr key={row.id || i} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30">
 <td className="px-3.5 py-3 text-center font-bold text-slate-400">{(fromIndex || 1) + i}</td>
 <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
 {row.nama_kelas || row.kode_kelas || '-'}
 </td>
 <td className="px-4 py-3 font-medium">{row.tingkat || row.jenjang || '-'}</td>
 <td className="px-4 py-3 font-medium">{row.unit_pendidikan?.name || '-'}</td>
 <td className="px-4 py-3 font-medium">{row.wali_kelas?.nama_lengkap || 'Belum Ditentukan'}</td>
 <td className="px-4 py-3 text-center font-bold">{row.students_count || 0}</td>
 <td className="px-4 py-3 text-center font-medium">{row.kapasitas || 30}</td>
 <td className="px-4 py-3 text-center">
 <ActionButton rowId={row.id || row.uuid} onViewDetail={onViewDetail} />
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 )

 case 'pengguna':
 case 'pengguna_tanpa_role':
 return (
 <table className="w-full text-xs text-left text-slate-700 dark:text-slate-200">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-xs font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
 <tr>
 <th className="px-3.5 py-3 text-center w-12">No</th>
 <th className="px-4 py-3">Nama Pengguna</th>
 <th className="px-4 py-3">Email</th>
 <th className="px-4 py-3">Role</th>
 <th className="px-4 py-3 text-center">Status</th>
 <th className="px-4 py-3">Dibuat</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {items.map((row, i) => (
 <tr key={row.id || i} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30">
 <td className="px-3.5 py-3 text-center font-bold text-slate-400">{(fromIndex || 1) + i}</td>
 <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{row.name || '-'}</td>
 <td className="px-4 py-3">{row.email || '-'}</td>
 <td className="px-4 py-3">{(row.roles || []).join(', ') || 'Belum Ada Role'}</td>
 <td className="px-4 py-3 text-center">
 <Badge variant={row.is_active ? 'success' : 'secondary'}>{row.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
 </td>
 <td className="px-4 py-3">{row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID') : '-'}</td>
 </tr>
 ))}
 </tbody>
 </table>
 )

 case 'role':
 return (
 <table className="w-full text-xs text-left text-slate-700 dark:text-slate-200">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-xs font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
 <tr>
 <th className="px-3.5 py-3 text-center w-12">No</th>
 <th className="px-4 py-3">Nama Role</th>
 <th className="px-4 py-3">Guard</th>
 <th className="px-4 py-3 text-center">Jumlah Izin</th>
 <th className="px-4 py-3 text-center">Jumlah Pengguna</th>
 <th className="px-4 py-3">Diperbarui</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {items.map((row, i) => (
 <tr key={row.id || i} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30">
 <td className="px-3.5 py-3 text-center font-bold text-slate-400">{(fromIndex || 1) + i}</td>
 <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{row.name || '-'}</td>
 <td className="px-4 py-3 font-mono">{row.guard_name || 'web'}</td>
 <td className="px-4 py-3 text-center font-bold">{row.jumlah_izin || 0}</td>
 <td className="px-4 py-3 text-center font-bold">{row.jumlah_pengguna || 0}</td>
 <td className="px-4 py-3">{row.updated_at ? new Date(row.updated_at).toLocaleDateString('id-ID') : '-'}</td>
 </tr>
 ))}
 </tbody>
 </table>
 )

 case 'total_konseling':
 return (
 <table className="w-full text-xs text-left text-slate-700 dark:text-slate-200">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-xs font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
 <tr>
 <th className="px-3.5 py-3 text-center w-12">No</th>
 <th className="px-4 py-3">Tanggal</th>
 <th className="px-4 py-3">Nama Siswa</th>
 <th className="px-4 py-3">Kategori</th>
 <th className="px-4 py-3">Judul Catatan</th>
 <th className="px-4 py-3 text-center">Prioritas</th>
 <th className="px-4 py-3">Tindak Lanjut</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {items.map((row, i) => (
 <tr key={row.id || i} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30">
 <td className="px-3.5 py-3 text-center font-bold text-slate-400">{(fromIndex || 1) + i}</td>
 <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">{row.date || '-'}</td>
 <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{row.student?.full_name || 'Siswa'}</td>
 <td className="px-4 py-3 font-medium">
 <Badge variant="info">{row.category || 'Konseling'}</Badge>
 </td>
 <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">{row.title || '-'}</td>
 <td className="px-4 py-3 text-center">
 <Badge variant={['tinggi', 'high', 'urgent'].includes(String(row.priority || '').toLowerCase()) ? 'danger' : 'warning'}>
 {row.priority || 'Normal'}
 </Badge>
 </td>
 <td className="px-4 py-3 text-slate-600 dark:text-slate-300 truncate max-w-md">{row.follow_up || '-'}</td>
 </tr>
 ))}
 </tbody>
 </table>
 )

 default:
 return null
 }
}

RenderKpiTable.propTypes = {
 type: PropTypes.string.isRequired,
 items: PropTypes.array.isRequired,
 onViewDetail: PropTypes.func.isRequired,
}
