import React, { useState, useEffect, useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import {
 Award,
 GraduationCap,
 RefreshCw,
 Search,
 TrendingUp,
 UserCheck,
 UsersRound,
} from 'lucide-react'
import api from '../../services/api'
import { Input as HeroInput } from '@heroui/react'
import { Modal } from '../ui/modal'
import { Button } from '../ui/button'
import HeroUiFilterSelect from '../ui/HeroUiFilterSelect'
import { MasterBadge, PrintOptionModal, SquircleActionButton } from '../master-data'
import { PersonIdentityCell } from '../ui/PersonIdentityCell'
import { printCleanTable, downloadPdfTable } from '../../utils/printHelper'
import { FoundationExportModal } from './FoundationExportModal'

const CONFIGS = {
 peningkatan: {
 title: 'Detail Peningkatan & Kinerja Unit Pendidikan',
 subtitle: 'Analisis pertumbuhan jumlah siswa, pegawai, dan rombel per unit',
 icon: TrendingUp,
 badgeColor: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
 },
 pegawai_kpi: {
 title: 'Detail KPI & Kinerja Pegawai/Guru',
 subtitle: 'Rekapitulasi SDM, rasio pendidik, dan status kepegawaian seluruh unit',
 icon: UserCheck,
 badgeColor: 'bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
 },
 siswa_mobility: {
 title: 'Detail Pergerakan Siswa (Masuk vs Keluar)',
 subtitle: 'Rekapitulasi pendaftaran baru, mutasi masuk, mutasi keluar, dan kelulusan',
 icon: UsersRound,
 badgeColor: 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
 },
 siswa_berprestasi: {
 title: 'Detail & Rekapitulasi Siswa Berprestasi',
 subtitle: 'Daftar capaian prestasi akademik, tahfizh, olahraga, dan seni peserta didik',
 icon: Award,
 badgeColor: 'bg-purple-50 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300',
 },
 alumni: {
 title: 'Detail & Rekapitulasi Data Alumni',
 subtitle: 'Rekapitulasi lulusan, status alumni, dan rekam jejak lulusan lintas unit',
 icon: Award,
 badgeColor: 'bg-purple-50 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300',
 },
 kelulusan: {
 title: 'Detail & Rekapitulasi Kelulusan Siswa',
 subtitle: 'Daftar kelulusan siswa lintas unit pendidikan terpadu',
 icon: GraduationCap,
 badgeColor: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
 },
}

function getMobilityStatus(item) {
 const typeVal = String(
 item.metadata?.mutasi_type ||
 item.mutasi_type ||
 item.type ||
 ''
 ).toLowerCase()

 const statusVal = String(
 item.metadata?.status ||
 item.status ||
 item.status_proses ||
 ''
 ).toLowerCase()

 const reasonVal = String(
 item.metadata?.keterangan ||
 item.reason ||
 ''
 ).toLowerCase()

 if (
 typeVal.includes('proses') ||
 typeVal.includes('pending') ||
 statusVal.includes('proses') ||
 statusVal.includes('pending') ||
 reasonVal.includes('proses') ||
 reasonVal.includes('pending')
 ) {
 return {
 key: 'proses',
 label: 'Diproses',
 badgeClass: 'inline-flex items-center justify-center rounded-full bg-amber-500 text-white font-extrabold text-xs px-3 py-1 shadow-xs tracking-wide',
 }
 }

 if (
 typeVal.includes('keluar') ||
 typeVal.includes('exit') ||
 typeVal.includes('drop') ||
 typeVal.includes('berhenti') ||
 statusVal.includes('keluar')
 ) {
 return {
 key: 'keluar',
 label: 'Siswa Keluar',
 badgeClass: 'inline-flex items-center justify-center rounded-full bg-red-600 text-white font-extrabold text-xs px-3 py-1 shadow-xs tracking-wide',
 }
 }

 return {
 key: 'masuk',
 label: 'Siswa Masuk',
 badgeClass: 'inline-flex items-center justify-center rounded-full bg-emerald-600 text-white font-extrabold text-xs px-3 py-1 shadow-xs tracking-wide',
 }
}

export function FoundationUnitKpiModal({ type, isOpen, onClose, units = [] }) {
 const config = CONFIGS[type] || CONFIGS.peningkatan
 const IconComponent = config.icon

 const [loading, setLoading] = useState(false)
 const [error, setError] = useState(false)
 const [dataList, setDataList] = useState([])
 const [search, setSearch] = useState('')
 const [selectedUnit, setSelectedUnit] = useState('all')
 const [mobilityFilter, setMobilityFilter] = useState('all') // 'all' | 'masuk' | 'keluar' | 'proses'
 const [showExport, setShowExport] = useState(false)
 const [showPrintModal, setShowPrintModal] = useState(false)

 const fetchData = useCallback(async () => {
 if (!type || !isOpen) return
 setLoading(true)
 setError(false)

 try {
 let endpoint = '/foundation/units'
 let params = {
 unit_id: selectedUnit !== 'all' ? selectedUnit : undefined,
 search: search || undefined,
 per_page: 100,
 }

 if (type === 'pegawai_kpi') {
 endpoint = '/foundation/employees'
 } else if (type === 'siswa_mobility') {
 endpoint = '/foundation/student-mutations'
 } else if (type === 'siswa_berprestasi') {
 endpoint = '/foundation/laporan/prestasi'
 } else if (type === 'alumni') {
 endpoint = '/foundation/alumni'
 } else if (type === 'kelulusan') {
 endpoint = '/foundation/graduations'
 }

 const res = await api.get(endpoint, { params })
 const resData = res.data
 let list = []

 if (Array.isArray(resData)) {
 list = resData
 } else if (resData?.data) {
 if (Array.isArray(resData.data)) {
 list = resData.data
 } else if (resData.data.data && Array.isArray(resData.data.data)) {
 list = resData.data.data
 } else if (resData.data.report?.details) {
 list = resData.data.report.details
 }
 }

 setDataList(list)
 } catch (err) {
 console.error(`Failed to fetch KPI modal data (${type}):`, err)
 setError(true)
 } finally {
 setLoading(false)
 }
 }, [type, isOpen, selectedUnit, search])

 useEffect(() => {
 if (isOpen) {
 fetchData()
 } else {
 setDataList([])
 setSearch('')
 setSelectedUnit('all')
 setMobilityFilter('all')
 setError(false)
 setShowPrintModal(false)
 setShowExport(false)
 }
 }, [isOpen, fetchData])

 const filteredItems = useMemo(() => {
 return dataList.filter((item) => {
 // 1. Filter by Tipe Pergerakan for siswa_mobility
 if (type === 'siswa_mobility' && mobilityFilter !== 'all') {
 const mob = getMobilityStatus(item)
 if (mob.key !== mobilityFilter) {
 return false
 }
 }

 // 2. Filter by search query
 if (search.trim()) {
 const q = search.toLowerCase()
 const name = String(item.name || item.nama || item.nama_lengkap || item.full_name || item.siswa_nama || '').toLowerCase()
 const code = String(item.code || item.kode || item.niy || item.nis || item.nisn || item.judul_prestasi || '').toLowerCase()
 const unit = String(item.unit?.name || item.education_unit?.name || item.unit_nama || '').toLowerCase()
 const reason = String(item.metadata?.keterangan || item.reason || '').toLowerCase()
 if (!name.includes(q) && !code.includes(q) && !unit.includes(q) && !reason.includes(q)) {
 return false
 }
 }

 return true
 })
 }, [dataList, search, type, mobilityFilter])

 const exportRows = useMemo(() => {
 return filteredItems.map((item, idx) => {
 if (type === 'peningkatan') {
 return {
 No: idx + 1,
 Kode: item.code || item.kode || '-',
 Unit: item.name || item.nama || '-',
 Level: item.jenis_unit || item.level || '-',
 'Total Siswa': item.siswa_aktif_count || 0,
 'Siswa Baru': item.siswa_baru_count || 0,
 Guru: item.guru_count || 0,
 Pegawai: item.pegawai_count || 0,
 Rombel: item.rombel_count || 0,
 Status: item.is_active ? 'Aktif' : 'Nonaktif',
 }
 } else if (type === 'pegawai_kpi') {
 return {
 No: idx + 1,
 'NIY / NIK': item.niy || item.nik || '-',
 Nama: item.nama_lengkap || item.nama || '-',
 Jabatan: item.position?.nama_jabatan || item.jabatan || 'Staf',
 'Unit Kerja': item.unit?.name || item.unit?.code || '-',
 'Status Pegawai': item.status_pegawai || 'Tetap',
 Status: item.status || 'Aktif',
 }
 } else if (type === 'siswa_mobility') {
 const mob = getMobilityStatus(item)
 return {
 No: idx + 1,
 'NIS / NISN': item.nis || item.nisn || '-',
 Nama: item.full_name || item.nama || '-',
 'Unit Pendidikan': item.education_unit?.name || item.unit?.name || '-',
 'Tipe Pergerakan': mob.label,
 Keterangan: item.metadata?.keterangan || item.reason || 'Pergerakan Siswa',
 }
 } else {
 return {
 No: idx + 1,
 'Nama Siswa': item.siswa_nama || item.student?.full_name || item.full_name || '-',
 Unit: item.unit_nama || item.education_unit?.name || '-',
 'Judul Prestasi': item.judul_prestasi || item.title || '-',
 Bidang: item.jenis_prestasi || item.category || 'Akademik',
 Tingkat: item.tingkat || 'Kota',
 Peringkat: item.peringkat || item.rank || 'Juara 1',
 }
 }
 })
 }, [filteredItems, type])

 const handlePrintClean = () => {
 let headers = []
 let rows = []

 if (type === 'peningkatan') {
 headers = ['NO', 'UNIT PENDIDIKAN', 'JENJANG', 'TOTAL SISWA', 'SISWA BARU', 'PEGAWAI', 'GURU', 'ROMBEL', 'STATUS']
 rows = filteredItems.map((item, idx) => [
 idx + 1,
 item.name || item.nama || '-',
 item.jenis_unit || item.level || '-',
 item.siswa_aktif_count || 0,
 item.siswa_baru_count || 0,
 item.pegawai_count || 0,
 item.guru_count || 0,
 item.rombel_count || 0,
 item.is_active ? 'Aktif' : 'Nonaktif',
 ])
 } else if (type === 'pegawai_kpi') {
 headers = ['NO', 'NAMA SDM', 'NIY / NIK', 'UNIT KERJA', 'JABATAN', 'STATUS PEGAWAI', 'KEAKTIFAN']
 rows = filteredItems.map((item, idx) => [
 idx + 1,
 item.nama_lengkap || item.nama || '-',
 item.niy || item.nik || '-',
 item.unit?.name || item.unit?.code || '-',
 item.position?.nama_jabatan || item.jabatan || 'Staf',
 item.status_pegawai || 'Tetap',
 item.status || 'Aktif',
 ])
 } else if (type === 'siswa_mobility') {
 headers = ['NO', 'NAMA SISWA', 'NIS / NISN', 'UNIT PENDIDIKAN', 'TIPE PERGERAKAN', 'KETERANGAN']
 rows = filteredItems.map((item, idx) => {
 const mob = getMobilityStatus(item)
 return [
 idx + 1,
 item.full_name || item.nama || '-',
 item.nis || item.nisn || '-',
 item.education_unit?.name || item.unit?.name || '-',
 mob.label,
 item.metadata?.keterangan || item.reason || 'Proses Administrasi',
 ]
 })
 } else {
 headers = ['NO', 'NAMA SISWA', 'UNIT PENDIDIKAN', 'JUDUL PRESTASI', 'BIDANG', 'TINGKAT', 'CAPAIAN']
 rows = filteredItems.map((item, idx) => [
 idx + 1,
 item.siswa_nama || item.student?.full_name || item.full_name || '-',
 item.unit_nama || item.education_unit?.name || '-',
 item.judul_prestasi || item.title || '-',
 item.jenis_prestasi || item.category || 'Akademik',
 item.tingkat || 'Kota',
 item.peringkat || item.rank || 'Juara 1',
 ])
 }

 printCleanTable({
 title: config.title.toUpperCase(),
 subtitle: `${config.subtitle} · Total: ${filteredItems.length} Record`,
 headers,
 rows,
 })
 }

 const handleDownloadPdfTable = () => {
 let headers = []
 let rows = []

 if (type === 'peningkatan') {
 headers = ['NO', 'UNIT PENDIDIKAN', 'JENJANG', 'TOTAL SISWA', 'SISWA BARU', 'PEGAWAI', 'GURU', 'ROMBEL', 'STATUS']
 rows = filteredItems.map((item, idx) => [
 idx + 1,
 item.name || item.nama || '-',
 item.jenis_unit || item.level || '-',
 item.siswa_aktif_count || 0,
 item.siswa_baru_count || 0,
 item.pegawai_count || 0,
 item.guru_count || 0,
 item.rombel_count || 0,
 item.is_active ? 'Aktif' : 'Nonaktif',
 ])
 } else if (type === 'pegawai_kpi') {
 headers = ['NO', 'NAMA SDM', 'NIY / NIK', 'UNIT KERJA', 'JABATAN', 'STATUS PEGAWAI', 'KEAKTIFAN']
 rows = filteredItems.map((item, idx) => [
 idx + 1,
 item.nama_lengkap || item.nama || '-',
 item.niy || item.nik || '-',
 item.unit?.name || item.unit?.code || '-',
 item.position?.nama_jabatan || item.jabatan || 'Staf',
 item.status_pegawai || 'Tetap',
 item.status || 'Aktif',
 ])
 } else if (type === 'siswa_mobility') {
 headers = ['NO', 'NAMA SISWA', 'NIS / NISN', 'UNIT PENDIDIKAN', 'TIPE PERGERAKAN', 'KETERANGAN']
 rows = filteredItems.map((item, idx) => {
 const mob = getMobilityStatus(item)
 return [
 idx + 1,
 item.full_name || item.nama || '-',
 item.nis || item.nisn || '-',
 item.education_unit?.name || item.unit?.name || '-',
 mob.label,
 item.metadata?.keterangan || item.reason || 'Proses Administrasi',
 ]
 })
 } else {
 headers = ['NO', 'NAMA SISWA', 'UNIT PENDIDIKAN', 'JUDUL PRESTASI', 'BIDANG', 'TINGKAT', 'CAPAIAN']
 rows = filteredItems.map((item, idx) => [
 idx + 1,
 item.siswa_nama || item.student?.full_name || item.full_name || '-',
 item.unit_nama || item.education_unit?.name || '-',
 item.judul_prestasi || item.title || '-',
 item.jenis_prestasi || item.category || 'Akademik',
 item.tingkat || 'Kota',
 item.peringkat || item.rank || 'Juara 1',
 ])
 }

 downloadPdfTable({
 title: config.title.toUpperCase(),
 filename: `Laporan_${type}_Yayasan.pdf`,
 headers,
 rows,
 })
 }

 if (!isOpen) return null

 return (
 <>
 <Modal
 isOpen={isOpen}
 onClose={onClose}
 maxWidth="max-w-4xl"
 title={
 <div className="flex items-center gap-3">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
 <IconComponent className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
 {config.title}
 </h3>
 <p className="text-xs text-slate-500 font-medium dark:text-slate-400">
 {config.subtitle}
 </p>
 </div>
 </div>
 }
 footer={
 <div className="flex w-full items-center justify-between gap-3">
 <span className="text-xs text-slate-500 font-medium">
 Total <strong className="text-slate-800 dark:text-white">{filteredItems.length}</strong> record terdata
 </span>
 <div className="flex items-center gap-2.5">
 <SquircleActionButton
 variant="export"
 label="Export Excel"
 onClick={() => setShowExport(true)}
 />

 <SquircleActionButton
 variant="print"
 label="Cetak Laporan"
 onClick={() => setShowPrintModal(true)}
 />

 <Button
 variant="ghost"
 appearance="fill"
 size="sm"
 onClick={onClose}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 px-4 transition-colors duration-200 cursor-pointer ml-1"
 >
 Tutup
 </Button>
 </div>
 </div>
 }
 >
 <div className="space-y-4">
 {/* Search & Filter Bar */}
 <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3 dark:border-emerald-800/60 dark:bg-emerald-950/30">
 <div className="relative flex-1">
 <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600 dark:text-emerald-400 z-10" />
 <HeroInput
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Cari kata kunci data..."
 className="h-9 w-full pl-10 pr-4 text-xs font-medium bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
 aria-label="Cari kata kunci data"
 />
 </div>

 {type === 'siswa_mobility' && (
 <div className="w-full sm:w-52">
 <HeroUiFilterSelect
 size="sm"
 value={mobilityFilter}
 onChange={setMobilityFilter}
 ariaLabel="Filter Tipe Pergerakan"
 options={[
 { value: 'all', label: 'Semua Tipe Pergerakan' },
 { value: 'masuk', label: '🟢 Siswa Masuk' },
 { value: 'keluar', label: '🔴 Siswa Keluar' },
 { value: 'proses', label: '🟡 Diproses' },
 ]}
 />
 </div>
 )}

 {units.length > 0 && (
 <div className="w-full sm:w-52">
 <HeroUiFilterSelect
 size="sm"
 value={String(selectedUnit)}
 onChange={setSelectedUnit}
 ariaLabel="Filter Unit Pendidikan"
 options={[
 { value: 'all', label: 'Semua Unit Pendidikan' },
 ...units.map((u) => ({
 value: String(u.id),
 label: u.name || u.code,
 })),
 ]}
 />
 </div>
 )}

 <button
 type="button"
 onClick={fetchData}
 title="Refresh"
 className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white text-emerald-800 transition hover:bg-emerald-50 hover:text-emerald-700 dark:bg-card-dark dark:text-emerald-300 cursor-pointer"
 >
 <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
 </button>
 </div>

 {/* Quick Filter Badges for siswa_mobility */}
 {type === 'siswa_mobility' && (
 <div className="flex items-center gap-2 flex-wrap px-1 text-xs font-bold">
 <span className="text-slate-500 dark:text-slate-400 font-semibold text-xs mr-1">Filter Pergerakan:</span>
 <button
 type="button"
 onClick={() => setMobilityFilter('all')}
 className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
 mobilityFilter === 'all'
 ? 'bg-slate-900 dark:bg-slate-100 dark:text-slate-900 shadow-xs'
 : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-emerald-950/60 dark:text-emerald-300'
 }`}
 >
 Semua ({dataList.length})
 </button>
 <button
 type="button"
 onClick={() => setMobilityFilter('masuk')}
 className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
 mobilityFilter === 'masuk'
 ? 'bg-emerald-600 text-white shadow-xs'
 : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300'
 }`}
 >
 🟢 Siswa Masuk ({dataList.filter((i) => getMobilityStatus(i).key === 'masuk').length})
 </button>
 <button
 type="button"
 onClick={() => setMobilityFilter('keluar')}
 className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
 mobilityFilter === 'keluar'
 ? 'bg-red-600 text-white shadow-xs'
 : 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/60 dark:text-red-300'
 }`}
 >
 🔴 Siswa Keluar ({dataList.filter((i) => getMobilityStatus(i).key === 'keluar').length})
 </button>
 <button
 type="button"
 onClick={() => setMobilityFilter('proses')}
 className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
 mobilityFilter === 'proses'
 ? 'bg-amber-500 text-white shadow-xs'
 : 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300'
 }`}
 >
 🟡 Diproses ({dataList.filter((i) => getMobilityStatus(i).key === 'proses').length})
 </button>
 </div>
 )}

 {/* Data Content Table */}
 <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
 {loading ? (
 <div className="p-8 text-center text-xs text-slate-400 animate-pulse">Memuat data KPI...</div>
 ) : error ? (
 <div className="p-8 text-center text-xs text-rose-500 font-bold">Gagal mengambil data. Silakan muat ulang.</div>
 ) : filteredItems.length === 0 ? (
 <div className="p-8 text-center text-xs text-slate-400 italic">Belum ada data sesuai filter pencarian.</div>
 ) : (
 <table className="w-full text-xs text-left text-slate-700 dark:text-slate-200">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-xs font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
 {type === 'peningkatan' && (
 <tr>
 <th className="px-3 py-3 text-center w-10">No</th>
 <th className="px-4 py-3">Unit Pendidikan</th>
 <th className="px-4 py-3">Jenjang</th>
 <th className="px-4 py-3 text-center">Total Siswa</th>
 <th className="px-4 py-3 text-center">Siswa Baru</th>
 <th className="px-4 py-3 text-center">Pegawai</th>
 <th className="px-4 py-3 text-center">Guru</th>
 <th className="px-4 py-3 text-center">Rombel</th>
 <th className="px-4 py-3 text-center">Status</th>
 </tr>
 )}
 {type === 'pegawai_kpi' && (
 <tr>
 <th className="px-3 py-3 text-center w-10">No</th>
 <th className="px-4 py-3">Nama SDM</th>
 <th className="px-4 py-3">NIY / NIK</th>
 <th className="px-4 py-3">Unit Kerja</th>
 <th className="px-4 py-3">Jabatan</th>
 <th className="px-4 py-3 text-center">Status Pegawai</th>
 <th className="px-4 py-3 text-center">Keaktifan</th>
 </tr>
 )}
 {type === 'siswa_mobility' && (
 <tr>
 <th className="px-3 py-3 text-center w-10">No</th>
 <th className="px-4 py-3">Nama Siswa</th>
 <th className="px-4 py-3">NIS / NISN</th>
 <th className="px-4 py-3">Unit Pendidikan</th>
 <th className="px-4 py-3 text-center">Tipe Pergerakan</th>
 <th className="px-4 py-3">Keterangan</th>
 </tr>
 )}
 {type === 'siswa_berprestasi' && (
 <tr>
 <th className="px-3 py-3 text-center w-10">No</th>
 <th className="px-4 py-3">Nama Siswa</th>
 <th className="px-4 py-3">Unit Pendidikan</th>
 <th className="px-4 py-3">Judul Prestasi</th>
 <th className="px-4 py-3 text-center">Bidang</th>
 <th className="px-4 py-3 text-center">Tingkat</th>
 <th className="px-4 py-3 text-center">Capaian</th>
 </tr>
 )}
 {(type === 'alumni' || type === 'kelulusan') && (
 <tr>
 <th className="px-3 py-3 text-center w-10">No</th>
 <th className="px-4 py-3">Nama Siswa</th>
 <th className="px-4 py-3">NIS / NISN</th>
 <th className="px-4 py-3">Unit Asal</th>
 <th className="px-4 py-3 text-center">Tahun Lulus</th>
 <th className="px-4 py-3 text-center">Status</th>
 </tr>
 )}
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {filteredItems.map((item, idx) => {
 const mob = type === 'siswa_mobility' ? getMobilityStatus(item) : null
 const isKeluar = mob?.key === 'keluar'

 return (
 <tr
 key={item.id || idx}
 className={
 isKeluar
 ? 'bg-red-50/50 hover:bg-red-100/60 dark:bg-red-950/30 dark:hover:bg-red-950/50 transition-colors'
 : 'hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors'
 }
 >
 <td className={`px-3 py-3 text-center font-bold ${isKeluar ? 'text-red-600 dark:text-red-400' : 'text-slate-400'}`}>
 {idx + 1}
 </td>

 {type === 'peningkatan' && (
 <>
 <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
 {item.name || item.nama}
 <div className="text-[10px] text-slate-400 font-normal">{item.code || item.kode}</div>
 </td>
 <td className="px-4 py-3 font-medium">{item.jenis_unit || item.level || '-'}</td>
 <td className="px-4 py-3 text-center font-bold text-emerald-700 dark:text-emerald-400">
 {(item.siswa_aktif_count || 0).toLocaleString('id-ID')}
 </td>
 <td className="px-4 py-3 text-center font-bold text-blue-600">
 +{(item.siswa_baru_count || 0).toLocaleString('id-ID')}
 </td>
 <td className="px-4 py-3 text-center font-medium">{item.pegawai_count || 0}</td>
 <td className="px-4 py-3 text-center font-medium">{item.guru_count || 0}</td>
 <td className="px-4 py-3 text-center font-medium">{item.rombel_count || 0}</td>
 <td className="px-4 py-3 text-center">
 <MasterBadge variant={item.is_active ? 'success' : 'neutral'}>
 {item.is_active ? 'Aktif' : 'Nonaktif'}
 </MasterBadge>
 </td>
 </>
 )}

 {type === 'pegawai_kpi' && (
 <>
 <td className="px-4 py-3">
 <PersonIdentityCell
 src={item.foto || item.photo}
 name={item.nama_lengkap || item.nama}
 subtitle={item.email || item.no_hp || '-'}
 />
 </td>
 <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{item.niy || item.nik || '-'}</td>
 <td className="px-4 py-3 font-semibold">{item.unit?.name || item.unit?.code || '-'}</td>
 <td className="px-4 py-3 font-medium">{item.position?.nama_jabatan || item.jabatan || 'Staf'}</td>
 <td className="px-4 py-3 text-center font-semibold">{item.status_pegawai || 'Tetap'}</td>
 <td className="px-4 py-3 text-center">
 <MasterBadge variant={item.status === 'aktif' || !item.status ? 'success' : 'neutral'}>
 {item.status || 'Aktif'}
 </MasterBadge>
 </td>
 </>
 )}

 {type === 'siswa_mobility' && (
 <>
 <td className={`px-4 py-3 font-bold ${isKeluar ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
 {item.full_name || item.nama || '-'}
 </td>
 <td className={`px-4 py-3 font-mono font-bold ${isKeluar ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
 {item.nis || item.nisn || '-'}
 </td>
 <td className={`px-4 py-3 font-medium ${isKeluar ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
 {item.education_unit?.name || item.unit?.name || '-'}
 </td>
 <td className="px-4 py-3 text-center">
 <span className={mob.badgeClass}>
 {mob.label}
 </span>
 </td>
 <td className={`px-4 py-3 ${isKeluar ? 'text-red-600 dark:text-red-400 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
 {item.metadata?.keterangan || item.reason || 'Proses Administrasi'}
 </td>
 </>
 )}

 {type === 'siswa_berprestasi' && (
 <>
 <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
 {item.siswa_nama || item.student?.full_name || item.full_name || '-'}
 </td>
 <td className="px-4 py-3 font-medium">{item.unit_nama || item.education_unit?.name || '-'}</td>
 <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">{item.judul_prestasi || item.title || '-'}</td>
 <td className="px-4 py-3 text-center">
 <MasterBadge variant="info">{item.jenis_prestasi || item.category || 'Akademik'}</MasterBadge>
 </td>
 <td className="px-4 py-3 text-center font-bold text-slate-700 dark:text-slate-200">{item.tingkat || 'Kota'}</td>
 <td className="px-4 py-3 text-center">
 <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
 {item.peringkat || item.rank || 'Juara 1'}
 </span>
 </td>
 </>
 )}

 {(type === 'alumni' || type === 'kelulusan') && (
 <>
 <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
 <PersonIdentityCell
 src={item.photo}
 name={item.full_name || item.nama}
 subtitle={item.nis || item.nisn || '-'}
 />
 </td>
 <td className="px-4 py-3 font-mono font-bold text-slate-700 dark:text-slate-200">{item.nis || item.nisn || '-'}</td>
 <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">{item.education_unit?.name || item.unit?.name || '-'}</td>
 <td className="px-4 py-3 text-center font-bold text-purple-600 dark:text-purple-400">
 {item.tahun_masuk ? Number(item.tahun_masuk) + 3 : new Date().getFullYear()}
 </td>
 <td className="px-4 py-3 text-center">
 <MasterBadge variant={type === 'alumni' ? 'success' : 'info'}>
 {type === 'alumni' ? 'Alumni Lulus' : 'Kelulusan'}
 </MasterBadge>
 </td>
 </>
 )}
 </tr>
 )
 })}
 </tbody>
 </table>
 )}
 </div>
 </div>
 </Modal>

 <PrintOptionModal
 isOpen={showPrintModal}
 onClose={() => setShowPrintModal(false)}
 onPrint={handlePrintClean}
 onDownload={handleDownloadPdfTable}
 title={config.title}
 />

 <FoundationExportModal
 isOpen={showExport}
 onClose={() => setShowExport(false)}
 title={config.title}
 rows={exportRows}
 filename={`KPI_${type}_Yayasan`}
 />
 </>
 )
}

FoundationUnitKpiModal.propTypes = {
 type: PropTypes.string.isRequired,
 isOpen: PropTypes.bool.isRequired,
 onClose: PropTypes.func.isRequired,
 units: PropTypes.array,
}
