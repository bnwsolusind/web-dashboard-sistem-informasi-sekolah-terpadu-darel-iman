import React, { useState, useMemo, useCallback } from 'react'
import CustomSelect from '@/components/ui/CustomSelect'
import {
 Award,
 BookOpen,
 Trophy,
 Activity,
 Sparkles,
 Search,
 RefreshCw,
 Eye,
 ShieldCheck,
 Download as Download1,
} from 'lucide-react'

import {
 Avatar,
 AvatarImage,
 AvatarFallback,
} from '@/components/ui/avatar'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import AppModal from '../app/AppModal'

import {
 TableRoot,
 TableHeader,
 TableBody,
 TableHead,
 TableRow,
 TableCell,
} from '@/components/ui/table'

export default function StudentAchievementRecapSection({
 achievements = [],
 title = 'Rekapitulasi Prestasi Siswa',
 subtitle = 'Daftar pencapaian Tahfizh Al-Qur’an, MTQ, Karakter, Akademik/LKTI, dan Ekstrakurikuler/Pentas PAI',
 onRefresh,
}) {
 const [searchTerm, setSearchTerm] = useState('')
 const [categoryFilter, setCategoryFilter] = useState('all')
 const [unitFilter, setUnitFilter] = useState('all')
 const [perPage, setPerPage] = useState(10)
 const [currentPage, setCurrentPage] = useState(1)
 const [selectedDetail, setSelectedDetail] = useState(null)

 // Combined data list fallback
 const dataList = useMemo(() => {
 return Array.isArray(achievements) ? achievements : []
 }, [achievements])

 // Extract unique education units from achievements data
 const availableUnits = useMemo(() => {
 const units = new Set()
 dataList.forEach((item) => {
 if (item.unit_nama) units.add(item.unit_nama)
 })
 return Array.from(units)
 }, [dataList])

 // Helper filter per category
 const getCategoryStudents = useCallback((catKey) => {
 return dataList.filter((item) => {
 const jenis = String(item.jenis_prestasi || '').toLowerCase()
 const nama = String(item.nama_prestasi || '').toLowerCase()
 const comb = `${jenis} ${nama}`

 if (catKey === 'tahfizh') {
 return comb.includes('tahfiz') || comb.includes('qur') || comb.includes('hafalan') || comb.includes('mtq') || comb.includes('tilawah') || comb.includes('kaligrafi') || comb.includes('pidato') || comb.includes('da’i') || comb.includes('dai')
 }
 if (catKey === 'karakter') {
 return comb.includes('karakter') || comb.includes('akhlak') || comb.includes('mutabaah') || comb.includes('ibadah') || comb.includes('disiplin') || comb.includes('santri') || comb.includes('asrama')
 }
 if (catKey === 'akademik') {
 return comb.includes('akademik') || comb.includes('sains') || comb.includes('matematika') || comb.includes('lkti') || comb.includes('karya ilmiah') || comb.includes('literasi') || comb.includes('cerdas cermat') || comb.includes('olimpiade')
 }
 if (catKey === 'ekstrakurikuler') {
 return comb.includes('ekstra') || comb.includes('pentas pai') || comb.includes('pencak silat') || comb.includes('panahan') || comb.includes('futsal') || comb.includes('sepak') || comb.includes('renang') || comb.includes('olahraga') || comb.includes('bela diri')
 }
 return true
 })
 }, [dataList])

 // Category counts breakdown
 const stats = useMemo(() => {
 const total = dataList.length
 const tahfizh = getCategoryStudents('tahfizh').length
 const karakter = getCategoryStudents('karakter').length
 const akademik = getCategoryStudents('akademik').length
 const ekstrakurikuler = getCategoryStudents('ekstrakurikuler').length

 return { total, tahfizh, karakter, akademik, ekstrakurikuler }
 }, [dataList, getCategoryStudents])

 // Filtered achievements
 const filteredAchievements = useMemo(() => {
 return dataList.filter((item) => {
 // 1. Search Filter
 const matchSearch =
 !searchTerm ||
 String(item.nama_siswa || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
 String(item.nis || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
 String(item.nama_prestasi || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
 String(item.kelas_nama || '').toLowerCase().includes(searchTerm.toLowerCase())

 // 2. Category Filter
 let matchCategory = true
 if (categoryFilter !== 'all') {
 const catItems = getCategoryStudents(categoryFilter)
 matchCategory = catItems.some((c) => c.id === item.id || c.nama_siswa === item.nama_siswa)
 }

 // 3. Unit Filter
 const matchUnit = unitFilter === 'all' || item.unit_nama === unitFilter

 return matchSearch && matchCategory && matchUnit
 })
 }, [dataList, searchTerm, categoryFilter, unitFilter, getCategoryStudents])

 // Pagination calculation
 const totalPages = Math.ceil(filteredAchievements.length / perPage) || 1
 const paginatedData = useMemo(() => {
 const start = (currentPage - 1) * perPage
 return filteredAchievements.slice(start, start + perPage)
 }, [filteredAchievements, currentPage, perPage])

 const getInitials = (name) => {
 if (!name) return 'S'
 const parts = String(name).trim().split(' ')
 if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
 return String(name).slice(0, 2).toUpperCase()
 }

 // Category Badge Mapper
 const renderCategoryBadge = (jenis, nama) => {
 const comb = `${jenis || ''} ${nama || ''}`.toLowerCase()

 if (comb.includes('tahfiz') || comb.includes('qur') || comb.includes('mtq') || comb.includes('kaligrafi') || comb.includes('pidato')) {
 return (
 <Badge color="emerald" size="sm" prefixIcon={<BookOpen className="h-3 w-3" />}>
 Tahfizh & MTQ
 </Badge>
 )
 }
 if (comb.includes('karakter') || comb.includes('akhlak') || comb.includes('mutabaah') || comb.includes('disiplin')) {
 return (
 <Badge color="purple" size="sm" prefixIcon={<ShieldCheck className="h-3 w-3 text-white" />}>
 Karakter & Akhlak
 </Badge>
 )
 }
 if (comb.includes('akademik') || comb.includes('sains') || comb.includes('matematika') || comb.includes('lkti') || comb.includes('cerdas cermat')) {
 return (
 <Badge color="cyan" size="sm" prefixIcon={<Sparkles className="h-3 w-3" />}>
 Akademik & LKTI
 </Badge>
 )
 }
 if (comb.includes('pentas pai') || comb.includes('silat') || comb.includes('panahan') || comb.includes('futsal') || comb.includes('renang') || comb.includes('ekstra')) {
 return (
 <Badge color="sky" size="sm" prefixIcon={<Activity className="h-3 w-3" />}>
 Pentas PAI & Olahraga
 </Badge>
 )
 }
 return (
 <Badge color="amber" size="sm" prefixIcon={<Trophy className="h-3 w-3" />}>
 Prestasi Siswa
 </Badge>
 )
 }

 const handleExportCSV = () => {
 if (!filteredAchievements.length) return
 const headers = ['Nama Siswa', 'NIS', 'Unit Pendidikan', 'Kelas', 'Kategori', 'Nama Prestasi', 'Tingkat', 'Tanggal', 'Skor/Nilai']
 const rows = filteredAchievements.map((item) => [
 `"${item.nama_siswa}"`,
 `"${item.nis}"`,
 `"${item.unit_nama}"`,
 `"${item.kelas_nama}"`,
 `"${item.jenis_prestasi}"`,
 `"${item.nama_prestasi}"`,
 `"${item.tingkat_prestasi}"`,
 `"${item.tanggal_prestasi}"`,
 `"${item.nilai_prestasi || '-'}"`,
 ])
 const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
 const encodedUri = encodeURI(csvContent)
 const link = document.createElement('a')
 link.setAttribute('href', encodedUri)
 link.setAttribute('download', `Rekap_Prestasi_Siswa_${new Date().toISOString().slice(0, 10)}.csv`)
 document.body.appendChild(link)
 link.click()
 document.body.removeChild(link)
 }

 return (
 <section className="space-y-4">
 {/* 1. Summary Cards Top (5 Columns with Embedded Student Profiles & Interactive Filter) */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
 {/* Card 1: Total Prestasi */}
 <div
 onClick={() => {
 setCategoryFilter('all')
 setCurrentPage(1)
 }}
 className={`cursor-pointer rounded-[20px] border-2 p-4 shadow-sm transition-all hover:shadow-md ${
 categoryFilter === 'all'
          ? 'border-amber-300 dark:border-amber-700/80 bg-amber-500/10 shadow-md ring-2 ring-amber-500/20 dark:bg-amber-500/15'
          : 'border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] hover:border-amber-300 dark:hover:border-amber-700/80'
 }`}
 >
 <div className="flex items-center justify-between pb-2 border-b border-emerald-100/80 dark:border-emerald-800/80">
 <div className="flex items-center gap-2.5">
 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
 <Award className="h-5 w-5" />
 </div>
 <div>
 <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Prestasi</p>
 <span className="text-[10px] text-slate-400 font-medium">Seluruh Kategori</span>
 </div>
 </div>
 <span className="rounded-xl bg-amber-500/15 px-2.5 py-0.5 text-xs font-extrabold text-amber-700 dark:bg-amber-500/25 dark:text-amber-300">
 {stats.total}
 </span>
 </div>

 <div className="mt-2.5 space-y-1.5">
 {getCategoryStudents('all').slice(0, 2).map((st, i) => (
 <div key={i} className="flex items-center gap-2 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 p-2">
 <Avatar size="xs" className="shrink-0">
 {st.avatar_url ? (
 <AvatarImage src={st.avatar_url} alt={st.nama_siswa} />
 ) : (
 <AvatarFallback className="bg-amber-600 text-amber-600 font-extrabold text-[9px]">
 {getInitials(st.nama_siswa)}
 </AvatarFallback>
 )}
 </Avatar>
 <div className="min-w-0 flex-1">
 <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{st.nama_siswa}</p>
 <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{st.kelas_nama} • NIS {st.nis}</p>
 </div>
 </div>
 ))}
 {getCategoryStudents('all').length > 2 && (
 <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 text-center pt-0.5">
 +{getCategoryStudents('all').length - 2} siswa berprestasi lainnya
 </p>
 )}
 </div>
 </div>

 {/* Card 2: Keagamaan & Tahfizh */}
 <div
 onClick={() => {
 setCategoryFilter('tahfizh')
 setCurrentPage(1)
 }}
 className={`cursor-pointer rounded-[20px] border-2 p-4 shadow-sm transition-all hover:shadow-md ${
 categoryFilter === 'tahfizh'
          ? 'border-emerald-300 dark:border-emerald-700/80 bg-emerald-500/10 shadow-md ring-2 ring-emerald-500/20 dark:bg-emerald-500/15'
          : 'border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] hover:border-emerald-300 dark:hover:border-emerald-700/80'
 }`}
 >
 <div className="flex items-center justify-between pb-2 border-b border-emerald-100/80 dark:border-emerald-800/80">
 <div className="flex items-center gap-2.5">
 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
 <BookOpen className="h-5 w-5" />
 </div>
 <div>
 <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Tahfizh & MTQ</p>
 <span className="text-[10px] text-slate-400 font-medium">Hafalan & Kaligrafi</span>
 </div>
 </div>
 <span className="rounded-xl bg-emerald-500/15 px-2.5 py-0.5 text-xs font-extrabold text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-300">
 {stats.tahfizh}
 </span>
 </div>

 <div className="mt-2.5 space-y-1.5">
 {getCategoryStudents('tahfizh').length === 0 ? (
 <p className="text-[10px] text-slate-400 py-3 text-center">Belum ada data</p>
 ) : (
 getCategoryStudents('tahfizh').slice(0, 2).map((st, i) => (
 <div key={i} className="flex items-center gap-2 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 p-2">
 <Avatar size="xs" className="shrink-0">
 {st.avatar_url ? (
 <AvatarImage src={st.avatar_url} alt={st.nama_siswa} />
 ) : (
 <AvatarFallback className="bg-emerald-700 text-emerald-600 font-extrabold text-[9px]">
 {getInitials(st.nama_siswa)}
 </AvatarFallback>
 )}
 </Avatar>
 <div className="min-w-0 flex-1">
 <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{st.nama_siswa}</p>
 <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{st.kelas_nama} • NIS {st.nis}</p>
 </div>
 </div>
 ))
 )}
 {getCategoryStudents('tahfizh').length > 2 && (
 <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 text-center pt-0.5">
 +{getCategoryStudents('tahfizh').length - 2} siswa keagamaan lainnya
 </p>
 )}
 </div>
 </div>

 {/* Card 3: Karakter & Akhlak */}
 <div
 onClick={() => {
 setCategoryFilter('karakter')
 setCurrentPage(1)
 }}
 className={`cursor-pointer rounded-[20px] border-2 p-4 shadow-sm transition-all hover:shadow-md ${
 categoryFilter === 'karakter'
          ? 'border-purple-300 dark:border-purple-700/80 bg-purple-500/10 shadow-md ring-2 ring-purple-500/20 dark:bg-purple-500/15'
          : 'border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] hover:border-purple-300 dark:hover:border-purple-700/80'
 }`}
 >
 <div className="flex items-center justify-between pb-2 border-b border-emerald-100/80 dark:border-emerald-800/80">
 <div className="flex items-center gap-2.5">
 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
 <ShieldCheck className="h-5 w-5" />
 </div>
 <div>
 <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Karakter & Akhlak</p>
 <span className="text-[10px] text-slate-400 font-medium">Ibadah & Rapor Sikap</span>
 </div>
 </div>
 <span className="rounded-xl bg-purple-500/15 px-2.5 py-0.5 text-xs font-extrabold text-purple-700 dark:bg-purple-500/25 dark:text-purple-300">
 {stats.karakter}
 </span>
 </div>

 <div className="mt-2.5 space-y-1.5">
 {getCategoryStudents('karakter').length === 0 ? (
 <p className="text-[10px] text-slate-400 py-3 text-center">Belum ada data</p>
 ) : (
 getCategoryStudents('karakter').slice(0, 2).map((st, i) => (
 <div key={i} className="flex items-center gap-2 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 p-2">
 <Avatar size="xs" className="shrink-0">
 {st.avatar_url ? (
 <AvatarImage src={st.avatar_url} alt={st.nama_siswa} />
 ) : (
 <AvatarFallback className="bg-purple-700 text-white font-extrabold text-[9px]">
 {getInitials(st.nama_siswa)}
 </AvatarFallback>
 )}
 </Avatar>
 <div className="min-w-0 flex-1">
 <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{st.nama_siswa}</p>
 <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{st.kelas_nama} • NIS {st.nis}</p>
 </div>
 </div>
 ))
 )}
 {getCategoryStudents('karakter').length > 2 && (
 <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 text-center pt-0.5">
 +{getCategoryStudents('karakter').length - 2} santri lainnya
 </p>
 )}
 </div>
 </div>

 {/* Card 4: Akademik & Sains */}
 <div
 onClick={() => {
 setCategoryFilter('akademik')
 setCurrentPage(1)
 }}
 className={`cursor-pointer rounded-[20px] border-2 p-4 shadow-sm transition-all hover:shadow-md ${
 categoryFilter === 'akademik'
          ? 'border-cyan-300 dark:border-cyan-700/80 bg-cyan-500/10 shadow-md ring-2 ring-cyan-500/20 dark:bg-cyan-500/15'
          : 'border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] hover:border-cyan-300 dark:hover:border-cyan-700/80'
 }`}
 >
 <div className="flex items-center justify-between pb-2 border-b border-emerald-100/80 dark:border-emerald-800/80">
 <div className="flex items-center gap-2.5">
 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
 <Sparkles className="h-5 w-5" />
 </div>
 <div>
 <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Akademik & Sains</p>
 <span className="text-[10px] text-slate-400 font-medium">Olimpiade, LKTI & Cerdas Cermat</span>
 </div>
 </div>
 <span className="rounded-xl bg-cyan-500/15 px-2.5 py-0.5 text-xs font-extrabold text-cyan-700 dark:bg-cyan-500/25 dark:text-cyan-300">
 {stats.akademik}
 </span>
 </div>

 <div className="mt-2.5 space-y-1.5">
 {getCategoryStudents('akademik').length === 0 ? (
 <p className="text-[10px] text-slate-400 py-3 text-center">Belum ada data</p>
 ) : (
 getCategoryStudents('akademik').slice(0, 2).map((st, i) => (
 <div key={i} className="flex items-center gap-2 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 p-2">
 <Avatar size="xs" className="shrink-0">
 {st.avatar_url ? (
 <AvatarImage src={st.avatar_url} alt={st.nama_siswa} />
 ) : (
 <AvatarFallback className="bg-cyan-700 text-white font-extrabold text-[9px]">
 {getInitials(st.nama_siswa)}
 </AvatarFallback>
 )}
 </Avatar>
 <div className="min-w-0 flex-1">
 <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{st.nama_siswa}</p>
 <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{st.kelas_nama} • NIS {st.nis}</p>
 </div>
 </div>
 ))
 )}
 {getCategoryStudents('akademik').length > 2 && (
 <p className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 text-center pt-0.5">
 +{getCategoryStudents('akademik').length - 2} siswa akademik lainnya
 </p>
 )}
 </div>
 </div>

 {/* Card 5: Olahraga, Seni & Pentas PAI */}
 <div
 onClick={() => {
 setCategoryFilter('ekstrakurikuler')
 setCurrentPage(1)
 }}
 className={`cursor-pointer rounded-[20px] border-2 p-4 shadow-sm transition-all hover:shadow-md ${
 categoryFilter === 'ekstrakurikuler'
          ? 'border-sky-300 dark:border-sky-700/80 bg-sky-500/10 shadow-md ring-2 ring-sky-500/20 dark:bg-sky-500/15'
          : 'border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] hover:border-sky-300 dark:hover:border-sky-700/80'
 }`}
 >
 <div className="flex items-center justify-between pb-2 border-b border-emerald-100/80 dark:border-emerald-800/80">
 <div className="flex items-center gap-2.5">
 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
 <Trophy className="h-5 w-5" />
 </div>
 <div>
 <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Pentas PAI & Ekstra</p>
 <span className="text-[10px] text-slate-400 font-medium">Pentas PAI, Silat, Panahan & Futsal</span>
 </div>
 </div>
 <span className="rounded-xl bg-sky-500/15 px-2.5 py-0.5 text-xs font-extrabold text-sky-700 dark:bg-sky-500/25 dark:text-sky-300">
 {stats.ekstrakurikuler}
 </span>
 </div>

 <div className="mt-2.5 space-y-1.5">
 {getCategoryStudents('ekstrakurikuler').length === 0 ? (
 <p className="text-[10px] text-slate-400 py-3 text-center">Belum ada data</p>
 ) : (
 getCategoryStudents('ekstrakurikuler').slice(0, 2).map((st, i) => (
 <div key={i} className="flex items-center gap-2 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 p-2">
 <Avatar size="xs" className="shrink-0">
 {st.avatar_url ? (
 <AvatarImage src={st.avatar_url} alt={st.nama_siswa} />
 ) : (
 <AvatarFallback className="bg-sky-700 text-white font-extrabold text-[9px]">
 {getInitials(st.nama_siswa)}
 </AvatarFallback>
 )}
 </Avatar>
 <div className="min-w-0 flex-1">
 <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{st.nama_siswa}</p>
 <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{st.kelas_nama} • NIS {st.nis}</p>
 </div>
 </div>
 ))
 )}
 {getCategoryStudents('ekstrakurikuler').length > 2 && (
 <p className="text-[10px] font-bold text-sky-600 dark:text-sky-400 text-center pt-0.5">
 +{getCategoryStudents('ekstrakurikuler').length - 2} siswa lainnya
 </p>
 )}
 </div>
 </div>
 </div>

 {/* 2. HeroUI Master Data Table Container */}
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
 {/* Toolbar Baris 1: Title + Action Buttons */}
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-4 sm:p-6">
 <div>
 <div className="flex items-center gap-2">
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{title}</h3>
 <Badge color="primary" size="sm">
 Database Riil ({filteredAchievements.length})
 </Badge>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
 </div>

 <div className="flex items-center gap-2">
 {/* Soft Pastel Squircle Button Export CSV */}
 <button
  type="button"
  onClick={handleExportCSV}
  title="Ekspor CSV"
  aria-label="Ekspor Data Rekapitulasi CSV"
  className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
  >
  <Download1 className="h-4 w-4 stroke-[2.2]" />
  </button>

 {/* Soft Pastel Squircle Button Refresh */}
 {onRefresh && (
 <button
  type="button"
  onClick={onRefresh}
  title="Segarkan Data"
  aria-label="Segarkan Data Backend"
  className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-emerald-600 shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
  >
  <RefreshCw className="h-4 w-4 stroke-[2.2]" />
  </button>
 )}
 </div>
 </div>

 	{/* Toolbar Baris 2: Search + Filter Dropdowns + perPage (Pasti 1 Baris Sejajar) */}
	<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:from-emerald-950/20 dark:to-teal-950/10 p-3.5 sm:p-4 border-b border-emerald-200/80 dark:border-emerald-800/60">
		{/* Search Input */}
		<div className="relative min-w-[200px] max-w-md flex-1">
			<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
			<input
				type="text"
				placeholder="Cari nama siswa, NIS, atau prestasi..."
				value={searchTerm}
				onChange={(e) => {
					setSearchTerm(e.target.value)
					setCurrentPage(1)
				}}
				className="w-full rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
			/>
		</div>

		{/* Filter Kategori & Tampilkan: 10 dalam 1 Baris Sejajar (flex-nowrap) */}
		<div className="flex items-center gap-2.5 shrink-0 flex-nowrap overflow-x-auto">
			{/* Filter Kategori */}
			<CustomSelect
				value={categoryFilter}
				onChange={(e) => {
					setCategoryFilter(e.target.value)
					setCurrentPage(1)
				}}
				className="rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white py-2 px-3 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none dark:bg-slate-900 dark:text-slate-200 cursor-pointer shrink-0 min-w-[155px]"
			>
				<option value="all">Semua Kategori</option>
				<option value="tahfizh">Tahfizh Al-Qur'an</option>
				<option value="santri">Santri Pesantren</option>
				<option value="olahraga">Sepakbola / Ekstrakurikuler</option>
				<option value="lomba">Lomba Pembelajaran</option>
				<option value="akademik">Akademik Umum</option>
			</CustomSelect>

			{/* Filter Unit Pendidikan */}
			{availableUnits.length > 1 && (
				<CustomSelect
					value={unitFilter}
					onChange={(e) => {
						setUnitFilter(e.target.value)
						setCurrentPage(1)
					}}
					className="rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white py-2 px-3 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none dark:bg-slate-900 dark:text-slate-200 cursor-pointer shrink-0"
				>
					<option value="all">Semua Unit</option>
					{availableUnits.map((u) => (
						<option key={u} value={u}>
							{u}
						</option>
					))}
				</CustomSelect>
			)}

			{/* perPage Select berdampingan dalam 1 baris */}
			<div className="flex items-center gap-1.5 pl-2 border-l border-emerald-200/80 dark:border-emerald-800/60 shrink-0">
				<span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap font-semibold">Tampilkan:</span>
				<CustomSelect
					value={perPage}
					onChange={(e) => {
						setPerPage(Number(e.target.value))
						setCurrentPage(1)
					}}
					className="rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white py-2 px-2 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none dark:bg-slate-900 dark:text-slate-200 cursor-pointer shrink-0 w-16"
				>
					<option value={5}>5</option>
					<option value={10}>10</option>
					<option value={15}>15</option>
					<option value={25}>25</option>
					<option value={50}>50</option>
				</CustomSelect>
			</div>
		</div>
	</div>

	{/* HeroUI Table */}
 <div className="overflow-x-auto">
 <TableRoot className="w-full text-left border-collapse text-xs min-w-[940px]">
 <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 border-b-2 border-emerald-200/90 dark:border-emerald-800/60 text-[10px] font-black uppercase tracking-[0.12em] text-slate-800 dark:text-slate-100">
 <TableRow className="hover:bg-transparent">
 <TableHead className="w-12 text-center text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100">#</TableHead>
 <TableHead className="w-16 text-center text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100">Avatar</TableHead>
 <TableHead className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100">Nama Siswa & NIS</TableHead>
 <TableHead className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100">Unit & Kelas</TableHead>
 <TableHead className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100">Kategori</TableHead>
 <TableHead className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100">Nama Prestasi & Pencapaian</TableHead>
 <TableHead className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100">Tingkat</TableHead>
 <TableHead className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100">Tanggal</TableHead>
 <TableHead className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100 text-center">Skor/Nilai</TableHead>
 <TableHead className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100 text-right pr-6">Aksi</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {paginatedData.length === 0 ? (
 <TableRow>
 <TableCell colSpan={10} className="py-12 text-center text-xs text-slate-400">
 <div className="flex flex-col items-center justify-center gap-2">
 <Award className="h-8 w-8 text-slate-300" />
 <span>Tidak ada data rekapitulasi prestasi siswa yang cocok dengan filter.</span>
 </div>
 </TableCell>
 </TableRow>
 ) : (
 paginatedData.map((item, idx) => (
 <TableRow
 key={item.id || idx}
 className="transition-all duration-150 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 border-b border-emerald-100/80 dark:border-emerald-800/60 group"
 >
 <TableCell className="text-center text-xs font-semibold text-slate-400">
 {(currentPage - 1) * perPage + idx + 1}
 </TableCell>

 {/* Kolom Avatar Siswa */}
 <TableCell className="text-center py-2">
 <Avatar size="md" className="mx-auto ring-2 ring-emerald-500/20 shadow-xs">
 {item.avatar_url ? (
 <AvatarImage src={item.avatar_url} alt={item.nama_siswa} />
 ) : (
 <AvatarFallback className={item.gender === 'female' ? "bg-teal-700 text-white font-extrabold text-xs" : "bg-emerald-700 text-white font-extrabold text-xs"}>
 {getInitials(item.nama_siswa)}
 </AvatarFallback>
 )}
 </Avatar>
 </TableCell>

 {/* Siswa & Profil */}
 <TableCell>
 <div className="space-y-0.5 py-1">
 <p className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">
 {item.nama_siswa}
 </p>
 <div className="flex items-center gap-1.5 flex-wrap">
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">NIS: {item.nis}</span>
 <span className="inline-block h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
 <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
 {item.gender === 'female' ? 'Akhwat (P)' : 'Ikhwan (L)'}
 </span>
 </div>
 </div>
 </TableCell>

 {/* Unit & Kelas */}
 <TableCell>
 <div>
 <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.unit_nama}</p>
 <p className="text-xs text-slate-500 dark:text-slate-400">{item.kelas_nama}</p>
 </div>
 </TableCell>

 {/* Kategori */}
 <TableCell>{renderCategoryBadge(item.jenis_prestasi, item.nama_prestasi)}</TableCell>

 {/* Nama Prestasi */}
 <TableCell>
 <div className="max-w-md">
 <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
 {item.nama_prestasi}
 </p>
 {item.keterangan && (
 <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
 {item.keterangan}
 </p>
 )}
 </div>
 </TableCell>

 {/* Tingkat */}
 <TableCell>
 <Badge color="gray" size="sm">
 {item.tingkat_prestasi || 'Internal'}
 </Badge>
 </TableCell>

 {/* Tanggal */}
 <TableCell className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
 {item.tanggal_prestasi
 ? new Date(item.tanggal_prestasi).toLocaleDateString('id-ID', {
 day: 'numeric',
 month: 'short',
 year: 'numeric',
 })
 : '-'}
 </TableCell>

 {/* Skor */}
 <TableCell className="text-center font-bold text-xs text-emerald-600 dark:text-emerald-400">
 {item.nilai_prestasi !== null && item.nilai_prestasi !== undefined ? item.nilai_prestasi : '—'}
 </TableCell>

 {/* Aksi */}
 <TableCell className="text-right pr-6">
 <Button
 variant="ghost"
 size="xs"
 iconOnly
 onClick={() => setSelectedDetail(item)}
 title="Lihat Detail Prestasi Siswa"
 className="text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
 >
 <Eye className="h-4 w-4" />
 </Button>
 </TableCell>
 </TableRow>
 ))
 )}
 </TableBody>
 </TableRoot>
 </div>

 {/* Footer Pagination Container */}
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-emerald-100 dark:border-emerald-900/60 p-4 bg-gradient-to-r from-emerald-50/30 via-transparent to-emerald-50/30 dark:from-emerald-950/20 dark:to-teal-950/10">
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Menampilkan {filteredAchievements.length === 0 ? 0 : (currentPage - 1) * perPage + 1} sampai{' '}
 {Math.min(currentPage * perPage, filteredAchievements.length)} dari {filteredAchievements.length} data prestasi riil
 </p>

 {totalPages > 1 && (
 <Pagination
 currentPage={currentPage}
 totalPages={totalPages}
 onPageChange={(page) => setCurrentPage(page)}
 sideLayout="full"
 variant="compact"
 />
 )}
 </div>
 </div>

 {/* 3. Detail View Modal (AppModal) */}
 <AppModal
 isOpen={Boolean(selectedDetail)}
 onClose={() => setSelectedDetail(null)}
 title="Detail Rekapitulasi Prestasi Siswa"
 description="Data Terintegrasi Database Backend"
 icon={Award}
 maxWidth="max-w-xl"
 variant="emerald"
 zIndex={60}
 footer={
 <button
 type="button"
 onClick={() => setSelectedDetail(null)}
 className="h-9.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black transition-all cursor-pointer active:scale-95"
 >
 Tutup
 </button>
 }
 >
 {selectedDetail && (
 <>
 {/* Profil Siswa */}
 <div className="flex items-center gap-3 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 p-3 border border-emerald-200/80 dark:border-emerald-800/60">
 <Avatar size="md">
 {selectedDetail.avatar_url ? (
 <AvatarImage src={selectedDetail.avatar_url} alt={selectedDetail.nama_siswa} />
 ) : (
 <AvatarFallback className="bg-emerald-600 text-amber-600 font-bold text-sm">
 {getInitials(selectedDetail.nama_siswa)}
 </AvatarFallback>
 )}
 </Avatar>
 <div>
 <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
 {selectedDetail.nama_siswa}
 </h4>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 NIS: {selectedDetail.nis} • {selectedDetail.unit_nama} ({selectedDetail.kelas_nama})
 </p>
 </div>
 </div>

 {/* Detail Prestasi Grid */}
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <span className="text-xs font-semibold text-slate-500">Kategori Prestasi</span>
 <div>{renderCategoryBadge(selectedDetail.jenis_prestasi)}</div>
 </div>

 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-3 dark:bg-slate-900">
 <p className="text-xs font-semibold text-slate-400">Judul / Nama Prestasi</p>
 <p className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5">
 {selectedDetail.nama_prestasi}
 </p>
 </div>

 <div className="grid grid-cols-2 gap-2">
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-2.5 dark:bg-slate-900">
 <p className="text-xs font-semibold text-slate-400">Tingkat Prestasi</p>
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
 {selectedDetail.tingkat_prestasi || 'Internal'}
 </p>
 </div>
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-2.5 dark:bg-slate-900">
 <p className="text-xs font-semibold text-slate-400">Tanggal Pencapaian</p>
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
 {selectedDetail.tanggal_prestasi || '-'}
 </p>
 </div>
 </div>

 {selectedDetail.nilai_prestasi !== null && selectedDetail.nilai_prestasi !== undefined && (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-2.5 dark:bg-slate-900 flex justify-between items-center">
 <span className="text-xs font-semibold text-slate-500">Skor / Nilai Prestasi</span>
 <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
 {selectedDetail.nilai_prestasi}
 </span>
 </div>
 )}

 {selectedDetail.keterangan && (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-3 dark:bg-slate-900">
 <p className="text-xs font-semibold text-slate-400">Keterangan / Catatan Detail</p>
 <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
 {selectedDetail.keterangan}
 </p>
 </div>
 )}
 </div>
 </>
 )}
 </AppModal>
 </section>
 )
}
