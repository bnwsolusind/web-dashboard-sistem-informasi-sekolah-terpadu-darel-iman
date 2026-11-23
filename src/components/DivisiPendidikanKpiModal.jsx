import React, { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import HeroUiFilterSelect from './ui/HeroUiFilterSelect'
import {
 Building2,
 Users,
 GraduationCap,
 FileCheck,
 AlertCircle,
 Award,
 BookOpen,
 Zap,
 LayoutGrid,
 FileSpreadsheet,
 Search,
 RefreshCw,
 X,
 ChevronLeft,
 ChevronRight,
} from 'lucide-react'

import {
 Avatar,
 AvatarImage,
 AvatarFallback,
} from '@/components/ui/avatar'

import {
 HoverCard,
 HoverCardTrigger,
 HoverCardContent,
} from '@/components/ui/hover-card'

import { Modal } from './ui/modal'
import { Skeleton } from './ui/skeleton'
import { EmptyState } from './ui/empty-state'
import { managementDashboardService } from '../services/managementDashboardService'

// Helper to generate uppercase initials from names
function getInitials(name = '') {
 const parts = String(name).trim().split(' ')
 if (parts.length === 0 || !parts[0]) return '?'
 if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
 return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const MODAL_CONFIG = {
 unit_monitored: {
 title: 'Unit Dipantau',
 subtitle: 'Daftar unit sekolah yang dipantau oleh Divisi Pendidikan',
 icon: Building2,
 summaryKeys: ['total'],
 summaryLabels: { total: 'Total Unit' },
 columns: [
 { key: 'nama', label: 'Nama Unit', width: 'w-[35%]' },
 { key: 'kode', label: 'Kode / NPSN', width: 'w-[18%]' },
 { key: 'total_siswa', label: 'Total Siswa', width: 'w-[16%]' },
 { key: 'total_pegawai', label: 'Total Pegawai', width: 'w-[16%]' },
 { key: 'status', label: 'Status', width: 'w-[15%]' },
 ],
 },
 total_siswa: {
 title: 'Total Siswa Dipantau',
 subtitle: 'Daftar seluruh siswa aktif yang berada dalam pengawasan Divisi Pendidikan',
 icon: Users,
 summaryKeys: ['total', 'laki_laki', 'perempuan'],
 summaryLabels: { total: 'Total Siswa', laki_laki: 'Laki-laki', perempuan: 'Perempuan' },
 columns: [
 { key: 'nama', label: 'Nama Siswa', width: 'w-[32%]' },
 { key: 'nis', label: 'NIS / NISN', width: 'w-[18%]' },
 { key: 'jenis_kelamin', label: 'Jenis Kelamin', width: 'w-[15%]' },
 { key: 'kelas', label: 'Kelas', width: 'w-[15%]' },
 { key: 'unit', label: 'Unit', width: 'w-[20%]' },
 ],
 },
 total_guru: {
 title: 'Total Guru Pengajar',
 subtitle: 'Daftar guru pengajar dan pendidik seluruh unit dipantau',
 icon: GraduationCap,
 summaryKeys: ['total', 'laki_laki', 'perempuan'],
 summaryLabels: { total: 'Total Guru', laki_laki: 'Laki-laki', perempuan: 'Perempuan' },
 columns: [
 { key: 'nama', label: 'Nama Guru', width: 'w-[32%]' },
 { key: 'niy', label: 'NIY / NIK', width: 'w-[18%]' },
 { key: 'jenis_kelamin', label: 'Jenis Kelamin', width: 'w-[15%]' },
 { key: 'jabatan', label: 'Jabatan', width: 'w-[18%]' },
 { key: 'unit', label: 'Unit', width: 'w-[17%]' },
 ],
 },
 laporan_bulanan_masuk: {
 title: 'Laporan Bulanan Masuk',
 subtitle: 'Daftar laporan bulanan unit yang telah disetujui / masuk lengkap',
 icon: FileCheck,
 summaryKeys: ['total'],
 summaryLabels: { total: 'Total Laporan Lengkap' },
 columns: [
 { key: 'judul', label: 'Judul Laporan', width: 'w-[34%]' },
 { key: 'penginput', label: 'Penginput / Pengawas', width: 'w-[26%]' },
 { key: 'unit', label: 'Unit Sekolah', width: 'w-[18%]' },
 { key: 'bulan_tahun', label: 'Periode', width: 'w-[12%]' },
 { key: 'status', label: 'Status', width: 'w-[10%]' },
 ],
 },
 laporan_bulanan_belum: {
 title: 'Laporan Belum Masuk',
 subtitle: 'Daftar laporan bulanan unit yang masih belum disetujui / pending',
 icon: AlertCircle,
 summaryKeys: ['total'],
 summaryLabels: { total: 'Total Laporan Pending' },
 columns: [
 { key: 'judul', label: 'Judul Laporan', width: 'w-[34%]' },
 { key: 'penginput', label: 'Penginput / Pengawas', width: 'w-[26%]' },
 { key: 'unit', label: 'Unit Sekolah', width: 'w-[18%]' },
 { key: 'bulan_tahun', label: 'Periode', width: 'w-[12%]' },
 { key: 'status', label: 'Status', width: 'w-[10%]' },
 ],
 },
 total_prestasi: {
 title: 'Prestasi Siswa Terverifikasi',
 subtitle: 'Daftar pencapaian & prestasi siswa terverifikasi lintas unit',
 icon: Award,
 summaryKeys: ['total'],
 summaryLabels: { total: 'Total Prestasi' },
 columns: [
 { key: 'nama_siswa', label: 'Nama Siswa', width: 'w-[28%]' },
 { key: 'nis', label: 'NIS', width: 'w-[12%]' },
 { key: 'unit', label: 'Unit', width: 'w-[14%]' },
 { key: 'kelas', label: 'Kelas', width: 'w-[12%]' },
 { key: 'jenis_prestasi', label: 'Jenis Prestasi', width: 'w-[17%]' },
 { key: 'nama_prestasi', label: 'Nama Prestasi', width: 'w-[17%]' },
 ],
 },
 monitoring_non_pesantren: {
 title: 'Monitoring Non-Pesantren',
 subtitle: 'Daftar pemantauan harian tahfizh & ibadah siswa non-pesantren',
 icon: BookOpen,
 summaryKeys: ['total', 'laki_laki', 'perempuan'],
 summaryLabels: { total: 'Total Siswa', laki_laki: 'Laki-laki', perempuan: 'Perempuan' },
 columns: [
 { key: 'nama', label: 'Nama Siswa', width: 'w-[32%]' },
 { key: 'nis', label: 'NIS / NISN', width: 'w-[18%]' },
 { key: 'jenis_kelamin', label: 'Jenis Kelamin', width: 'w-[15%]' },
 { key: 'kelas', label: 'Kelas', width: 'w-[15%]' },
 { key: 'unit', label: 'Unit', width: 'w-[20%]' },
 ],
 },
 monitoring_divisi: {
 title: 'Input Monitoring Divisi',
 subtitle: 'Catatan supervisi & hasil pengawasan akademik Divisi Pendidikan',
 icon: Zap,
 summaryKeys: ['total'],
 summaryLabels: { total: 'Total Monitoring' },
 columns: [
 { key: 'judul', label: 'Judul Catatan', width: 'w-[34%]' },
 { key: 'penginput', label: 'Penginput / Pengawas', width: 'w-[26%]' },
 { key: 'unit', label: 'Unit Sekolah', width: 'w-[18%]' },
 { key: 'bulan_tahun', label: 'Periode', width: 'w-[12%]' },
 { key: 'status', label: 'Status', width: 'w-[10%]' },
 ],
 },
 master_kurikulum: {
 title: 'Master Kurikulum',
 subtitle: 'Daftar unit sekolah & struktur kurikulum dipantau',
 icon: LayoutGrid,
 summaryKeys: ['total'],
 summaryLabels: { total: 'Total Unit' },
 columns: [
 { key: 'nama', label: 'Nama Unit', width: 'w-[35%]' },
 { key: 'kode', label: 'Kode / NPSN', width: 'w-[18%]' },
 { key: 'total_siswa', label: 'Total Siswa', width: 'w-[16%]' },
 { key: 'total_pegawai', label: 'Total Pegawai', width: 'w-[16%]' },
 { key: 'status', label: 'Status', width: 'w-[15%]' },
 ],
 },
 verifikasi_prestasi: {
 title: 'Verifikasi Prestasi',
 subtitle: 'Daftar pengajuan & verifikasi prestasi siswa terverifikasi',
 icon: Award,
 summaryKeys: ['total'],
 summaryLabels: { total: 'Total Prestasi' },
 columns: [
 { key: 'nama_siswa', label: 'Nama Siswa', width: 'w-[28%]' },
 { key: 'nis', label: 'NIS', width: 'w-[12%]' },
 { key: 'unit', label: 'Unit', width: 'w-[14%]' },
 { key: 'kelas', label: 'Kelas', width: 'w-[12%]' },
 { key: 'jenis_prestasi', label: 'Jenis Prestasi', width: 'w-[17%]' },
 { key: 'nama_prestasi', label: 'Nama Prestasi', width: 'w-[17%]' },
 ],
 },
 laporan_lintas_unit: {
 title: 'Laporan Lintas Unit',
 subtitle: 'Rekapitulasi dan pelaporan kinerja akademik antar unit sekolah',
 icon: FileSpreadsheet,
 summaryKeys: ['total'],
 summaryLabels: { total: 'Total Laporan' },
 columns: [
 { key: 'judul', label: 'Judul Laporan', width: 'w-[34%]' },
 { key: 'penginput', label: 'Penginput / Pengawas', width: 'w-[26%]' },
 { key: 'unit', label: 'Unit Sekolah', width: 'w-[18%]' },
 { key: 'bulan_tahun', label: 'Periode', width: 'w-[12%]' },
 { key: 'status', label: 'Status', width: 'w-[10%]' },
 ],
 },
 laporan_akademik: {
 title: 'Laporan Akademik',
 subtitle: 'Laporan rekapitulasi nilai dan capaian pembelajaran siswa',
 icon: GraduationCap,
 summaryKeys: ['total'],
 summaryLabels: { total: 'Total Laporan' },
 columns: [
 { key: 'judul', label: 'Judul Laporan', width: 'w-[34%]' },
 { key: 'penginput', label: 'Penginput / Pengawas', width: 'w-[26%]' },
 { key: 'unit', label: 'Unit Sekolah', width: 'w-[18%]' },
 { key: 'bulan_tahun', label: 'Periode', width: 'w-[12%]' },
 { key: 'status', label: 'Status', width: 'w-[10%]' },
 ],
 },
}

function SummaryPills({ summary, keys, labels }) {
 if (!summary) return null

 const colors = {
 total: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-800/60',
 laki_laki: 'bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-200 border border-emerald-200/80 dark:border-emerald-800/60',
 perempuan: 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200 border border-emerald-200/80 dark:border-emerald-800/60',
 }

 return (
 <div className="flex flex-wrap items-center gap-2">
 {keys.map((key) => (
 <div
 key={key}
 className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold shadow-2xs ${colors[key] || colors.total}`}
 >
 <span className="font-semibold opacity-80">{labels[key]}:</span>
 <span className="text-xs font-black">{Number(summary[key] ?? 0).toLocaleString('id-ID')}</span>
 </div>
 ))}
 </div>
 )
}

export default function DivisiPendidikanKpiModal({ type, isOpen, onClose, unitId = '' }) {
 const config = MODAL_CONFIG[type]

 const [loading, setLoading] = useState(false)
 const [error, setError] = useState(null)
 const [search, setSearch] = useState('')
 const [page, setPage] = useState(1)
 const [perPage, setPerPage] = useState(10)

 const [summary, setSummary] = useState(null)
 const [items, setItems] = useState([])
 const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 })

 const fetchData = useCallback(
 async (targetPage = 1, searchQuery = '', targetPerPage = perPage) => {
 if (!type || !config) return

 setLoading(true)
 setError(null)
 try {
 const params = {
 search: searchQuery,
 page: targetPage,
 per_page: targetPerPage,
 }
 if (unitId && unitId !== 'all') {
 params.unit_id = unitId
 }

 const res = await managementDashboardService.getDivisiPendidikanKpiDetail(type, params)
 if (res && res.data) {
 setSummary(res.data.summary || null)
 setItems(res.data.items || [])
 setMeta(res.data.meta || { current_page: 1, last_page: 1, per_page: targetPerPage, total: 0 })
 } else {
 setError('Format respon server tidak valid.')
 }
 } catch (err) {
 console.error('Failed to fetch Divisi Pendidikan KPI detail:', err)
 setError(err.response?.data?.message || 'Gagal memuat detail data dari server.')
 } finally {
 setLoading(false)
 }
 },
 [type, config, perPage, unitId]
 )

 useEffect(() => {
 if (isOpen && type && config) {
 setSearch('')
 setPage(1)
 fetchData(1, '', perPage)
 }
 }, [isOpen, type, config, fetchData, perPage])

 const handleSearchChange = (e) => {
 const val = e.target.value
 setSearch(val)
 setPage(1)
 fetchData(1, val, perPage)
 }

 const handlePageChange = (newPage) => {
 if (newPage < 1 || newPage > meta.last_page) return
 setPage(newPage)
 fetchData(newPage, search, perPage)
 }

 const handlePerPageChange = (e) => {
 const newPerPage = Number(e.target.value)
 setPerPage(newPerPage)
 setPage(1)
 fetchData(1, search, newPerPage)
 }

 if (!config) return null

 const IconComponent = config.icon || Building2
 const columns = config.columns || []

 // Helper cell renderer with Avatar & HoverCard profile preview
 const renderCellContent = (row, col) => {
 const value = row[col.key]

 if (col.key === 'nama' || col.key === 'nama_siswa' || col.key === 'penginput') {
 const isGuru = type === 'total_guru' || String(col.label).toLowerCase().includes('guru')
 const initials = getInitials(value)
 const subDetail = row.nis && row.nis !== '-'
 ? `NIS ${row.nis}`
 : row.niy && row.niy !== '-'
 ? `NIY ${row.niy}`
 : row.nik && row.nik !== '-'
 ? `NIK ${row.nik}`
 : row.kode && row.kode !== '-'
 ? `Kode ${row.kode}`
 : ''

 return (
 <HoverCard>
 <HoverCardTrigger className="inline-flex items-center gap-3 cursor-pointer group text-left max-w-full">
 <Avatar size="sm" className="ring-2 ring-emerald-500/20 group-hover:ring-emerald-500 transition-all shrink-0">
 {row.avatar_url ? (
 <AvatarImage src={row.avatar_url} alt={value} />
 ) : null}
 <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
 {initials}
 </AvatarFallback>
 </Avatar>
 <div className="min-w-0 flex-1 overflow-hidden">
 <p className="font-extrabold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
 {value ?? '-'}
 </p>
 {subDetail && (
 <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 truncate">
 {row.kelas ? `${row.kelas} • ` : ''}{subDetail}
 </p>
 )}
 </div>
 </HoverCardTrigger>
 <HoverCardContent className="w-80 p-4 rounded-xl bg-white dark:bg-[#111827] border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xl z-50">
 <div className="flex items-start gap-3.5">
 <Avatar size="xl" className="ring-2 ring-emerald-500/30 shrink-0">
 {row.avatar_url ? (
 <AvatarImage src={row.avatar_url} alt={value} />
 ) : null}
 <AvatarFallback className="bg-emerald-600 text-white font-extrabold text-base">
 {initials}
 </AvatarFallback>
 </Avatar>
 <div className="flex-1 min-w-0 space-y-1">
 <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
 {isGuru ? 'Guru Pengajar' : type === 'unit_monitored' ? 'Unit Sekolah' : 'Profil Siswa'}
 </span>
 <h4 className="text-sm font-extrabold text-slate-900 dark:text-white ">
 {value ?? '-'}
 </h4>
 {subDetail && (
 <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
 {subDetail}
 </p>
 )}
 {row.kelas && (
 <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
 Kelas: <span className="font-bold">{row.kelas}</span>
 </p>
 )}
 {row.unit && (
 <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
 Unit: <span className="font-bold">{row.unit}</span>
 </p>
 )}
 {row.jabatan && (
 <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
 Jabatan: <span className="font-bold">{row.jabatan}</span>
 </p>
 )}
 </div>
 </div>
 </HoverCardContent>
 </HoverCard>
 )
 }

 if (col.key === 'status') {
 const statusStr = String(value || '').toLowerCase()
 const isSuccess = statusStr.includes('lengkap') || statusStr.includes('disetujui') || statusStr.includes('aktif')
 return (
 <span
 className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-bold ${
 isSuccess
 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
 : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
 }`}
 >
 {value ?? '-'}
 </span>
 )
 }

 if (col.key === 'nis') {
 const displayNis = row.nis && row.nis !== '-' ? row.nis : row.nisn && row.nisn !== '-' ? row.nisn : '-'
 return <span className="font-bold text-slate-700 dark:text-slate-300 truncate block">{displayNis}</span>
 }

 if (col.key === 'niy') {
 const displayNiy = row.niy && row.niy !== '-' ? row.niy : row.nik && row.nik !== '-' ? row.nik : '-'
 return <span className="font-bold text-slate-700 dark:text-slate-300 truncate block">{displayNiy}</span>
 }

 return <span className="truncate block font-medium">{value ?? '-'}</span>
 }

const MODAL_TONES = {
 unit_monitored: {
 iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
 topBorder: 'bg-white dark:bg-card-dark',
 },
 total_siswa: {
 iconBg: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
 topBorder: 'bg-white dark:bg-card-dark',
 },
 total_guru: {
 iconBg: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
 topBorder: 'bg-white dark:bg-card-dark',
 },
 laporan_bulanan_masuk: {
 iconBg: 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300',
 topBorder: 'bg-white dark:bg-card-dark',
 },
 laporan_bulanan_belum: {
 iconBg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
 topBorder: 'bg-white dark:bg-card-dark',
 },
 total_prestasi: {
 iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
 topBorder: 'bg-white dark:bg-card-dark',
 },
 monitoring_non_pesantren: {
 iconBg: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
 topBorder: 'bg-white dark:bg-card-dark',
 },
 monitoring_divisi: {
 iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
 topBorder: 'bg-white dark:bg-card-dark',
 },
 master_kurikulum: {
 iconBg: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
 topBorder: 'bg-white dark:bg-card-dark',
 },
 verifikasi_prestasi: {
 iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
 topBorder: 'bg-white dark:bg-card-dark',
 },
 laporan_lintas_unit: {
 iconBg: 'bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300',
 topBorder: 'bg-white dark:bg-card-dark',
 },
 laporan_akademik: {
 iconBg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
 topBorder: 'bg-white dark:bg-card-dark',
 },
}

 return (
 <Modal isOpen={isOpen} onClose={onClose} size="xl">
		<div className="flex flex-col max-h-[85vh] bg-white dark:bg-card-dark rounded-modal shadow-2xl shadow-emerald-950/20 overflow-hidden border border-emerald-500/30 dark:border-emerald-700/60">
			{/* Harmonized Top Accent Gradient Line */}
			<div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

 {/* Header */}
 <div className="flex items-start justify-between gap-4 border-b border-emerald-200/80 p-5 dark:border-emerald-800/60 bg-slate-50/50 dark:bg-slate-900/40">
 <div className="flex items-center gap-3.5">
 <div className={`flex size-11 items-center justify-center rounded-xl ${MODAL_TONES[type]?.iconBg || 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'} shadow-2xs`}>
 <IconComponent className="size-6 shrink-0" />
 </div>
 <div>
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{config.title}</h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">{config.subtitle}</p>
 </div>
 </div>
 <button
 type="button"
 onClick={onClose}
 className="rounded-xl p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
 >
 <X className="size-5" />
 </button>
 </div>

 {/* Rapi Toolbar (Baris 1: Summary Pills & Segarkan Data; Baris 2: Search Bar & PerPage Selector) */}
 <div className="flex flex-col gap-3.5 border-b border-emerald-200/80 bg-slate-50/50 p-4 dark:border-emerald-800/60 dark:bg-slate-900/40">
 {/* Baris 1: Summary Badges + Soft Pastel Squircle Refresh Button */}
 <div className="flex flex-wrap items-center justify-between gap-3">
 <SummaryPills summary={summary} keys={config.summaryKeys} labels={config.summaryLabels} />
 <button
 type="button"
 onClick={() => fetchData(page, search, perPage)}
 className="inline-flex h-9 items-center gap-2 rounded-xl bg-emerald-100/90 px-3.5 text-xs font-extrabold text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white transition-all duration-200 hover:shadow-md hover:shadow-sm cursor-pointer shadow-2xs shrink-0"
 title="Segarkan Data"
 >
 <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
 <span>Segarkan Data</span>
 </button>
 </div>

 {/* Baris 2: Search Input & PerPage Selector */}
 <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
 <div className="relative flex-1 max-w-md">
 <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={search}
 onChange={handleSearchChange}
 placeholder="Cari nama, NIS, NIK, unit..."
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white py-2 pl-10 pr-3.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 dark:border-emerald-700/80 dark:bg-[#111827] dark:text-slate-200"
 />
 </div>

 <div className="flex items-center gap-2 shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400">
 <span>Tampilkan:</span>
 <HeroUiFilterSelect
 value={String(perPage)}
 onChange={(val) => handlePerPageChange({ target: { value: val } })}
 options={[
 { value: '5', label: '5 baris' },
 { value: '10', label: '10 baris' },
 { value: '25', label: '25 baris' },
 { value: '50', label: '50 baris' },
 ]}
 ariaLabel="Jumlah baris per halaman"
 size="sm"
 className="w-28"
 />
 </div>
 </div>
 </div>

 {/* Content Body with Fixed Table Layout to Prevent Layout Shifting */}
 <div className="flex-1 overflow-y-auto overflow-x-auto p-5">
 {loading && items.length === 0 ? (
 <div className="space-y-3">
 <Skeleton className="h-10 w-full rounded-xl" />
 <Skeleton className="h-14 w-full rounded-xl" />
 <Skeleton className="h-14 w-full rounded-xl" />
 <Skeleton className="h-14 w-full rounded-xl" />
 </div>
 ) : error ? (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 p-6 text-center text-xs text-rose-700 dark:border-emerald-800/60 dark:bg-rose-950/40 dark:text-rose-300">
 <p className="font-bold">{error}</p>
 <button
 type="button"
 onClick={() => fetchData(page, search, perPage)}
 className="mt-3 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition-colors"
 >
 Coba Lagi
 </button>
 </div>
 ) : items.length === 0 ? (
 <EmptyState
 title="Tidak ada data ditemukan"
 description={search ? `Pencarian "${search}" tidak cocok dengan data apapun.` : 'Belum ada data tersedia di database.'}
 />
 ) : (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 overflow-hidden shadow-2xs">
 <table className="table-fixed w-full text-left text-xs min-w-[720px]">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 <th className="w-12 px-3.5 py-3.5 text-center">No</th>
 {columns.map((col) => (
 <th key={col.key} className={`${col.width || ''} px-3.5 py-3.5`}>
 {col.label}
 </th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-200/80/70 text-slate-700 dark:divide-emerald-900/40/70 dark:text-slate-300 font-medium bg-white dark:bg-card-dark">
 {items.map((row, idx) => (
 <tr
 key={row.id || idx}
 className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors"
 >
 <td className="w-12 px-3.5 py-3.5 text-center text-slate-400 font-semibold">
 {(meta.current_page - 1) * meta.per_page + idx + 1}
 </td>
 {columns.map((col) => (
 <td key={col.key} className={`${col.width || ''} px-3.5 py-3.5 align-middle overflow-hidden`}>
 {renderCellContent(row, col)}
 </td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>

 {/* Footer (Pagination & Items Count) */}
 {meta.total > 0 && (
 <div className="flex flex-col gap-3 border-t border-emerald-200/80 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-emerald-800/60 bg-slate-50/50 dark:bg-slate-900/40">
 <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
 Menampilkan <strong className="text-slate-900 dark:text-white font-extrabold">{items.length}</strong> dari total <strong className="text-slate-900 dark:text-white font-extrabold">{meta.total}</strong> data
 </div>

 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => handlePageChange(meta.current_page - 1)}
 disabled={meta.current_page <= 1 || loading}
 className="inline-flex items-center gap-1 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3.5 py-1.5 text-xs font-extrabold text-slate-700 hover:bg-slate-100 disabled:opacity-40 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
 >
 <ChevronLeft className="size-4" />
 <span>Prev</span>
 </button>
 <span className="text-xs font-extrabold text-slate-600 dark:text-slate-400 px-2">
 {meta.current_page} / {meta.last_page}
 </span>
 <button
 type="button"
 onClick={() => handlePageChange(meta.current_page + 1)}
 disabled={meta.current_page >= meta.last_page || loading}
 className="inline-flex items-center gap-1 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3.5 py-1.5 text-xs font-extrabold text-slate-700 hover:bg-slate-100 disabled:opacity-40 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
 >
 <span>Next</span>
 <ChevronRight className="size-4" />
 </button>
 </div>
 </div>
 )}
 </div>
 </Modal>
 )
}

DivisiPendidikanKpiModal.propTypes = {
 type: PropTypes.string,
 isOpen: PropTypes.bool.isRequired,
 onClose: PropTypes.func.isRequired,
}
