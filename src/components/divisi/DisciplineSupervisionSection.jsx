import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
 ShieldAlert,
 ShieldCheck,
 AlertTriangle,
 FileText,
 Building2,
 School,
 Scale,
 Sparkles,
 RefreshCw,
 AlertCircle,
 Award,
 ArrowUpDown,
 Printer,
 Search,
 CheckCircle2,
 User,
 ExternalLink,
 ChevronRight,
 BookOpen,
 Calendar,
 X,
} from 'lucide-react'
import {
 Chip as HeroChip,
 Button as HeroButton,
 Spinner as HeroSpinner,
 Input as HeroInput,
} from '@heroui/react'
import api from '../../services/api'
import { disciplineService } from '../../services/disciplineService'
import HeroUiFilterSelect from '../ui/HeroUiFilterSelect'
import { useDebounce } from '../../hooks/useDebounce'

export default function DisciplineSupervisionSection() {
 const [loading, setLoading] = useState(true)
 const [data, setData] = useState(null)
 const [error, setError] = useState(null)

 // Filter & Sorting state
 const [selectedUnitId, setSelectedUnitId] = useState('all')
 const [selectedClassId, setSelectedClassId] = useState('all')
 const [classesList, setClassesList] = useState([])
 const [classesLoading, setClassesLoading] = useState(false)
 const [sortBy, setSortBy] = useState('points_desc')
 const [studentSearch, setStudentSearch] = useState('')
 const debouncedStudentSearch = useDebounce(studentSearch, 300)

 // Executive Report Modal state
 const [isReportModalOpen, setIsReportModalOpen] = useState(false)

 // Dynamic Fetch Classes when Unit changes (Cascading Filter)
 useEffect(() => {
 if (selectedUnitId === 'all') {
 setClassesList([])
 setSelectedClassId('all')
 return
 }

 setClassesLoading(true)
 api
 .get('/kelas', { params: { unit_id: selectedUnitId, per_page: 100 } })
 .then((res) => {
 const list = res?.data?.data || res?.data || []
 setClassesList(Array.isArray(list) ? list : [])
 setSelectedClassId('all')
 })
 .catch((err) => {
 console.error('Failed to fetch classes for unit:', err)
 setClassesList([])
 setSelectedClassId('all')
 })
 .finally(() => {
 setClassesLoading(false)
 })
 }, [selectedUnitId])

 const fetchOverview = async (unitId = selectedUnitId, classId = selectedClassId, sort = sortBy) => {
 setLoading(true)
 setError(null)
 try {
 const params = {
 unit_id: unitId !== 'all' ? unitId : undefined,
 class_id: classId !== 'all' ? classId : undefined,
 sort_by: sort,
 }
 const res = await disciplineService.getDivisiOverview(params)
 if (res.success && res.data) {
 setData(res.data)
 } else {
 setError(res.message || 'Gagal memuat supervisi kedisiplinan divisi.')
 }
 } catch (err) {
 console.error('Failed to fetch divisi discipline overview:', err)
 setError(err?.response?.data?.message || 'Gagal memuat supervisi kedisiplinan divisi.')
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 fetchOverview(selectedUnitId, selectedClassId, sortBy)
 }, [selectedUnitId, selectedClassId, sortBy])

 // Unit Options for HeroUiFilterSelect
 const unitFilterOptions = useMemo(() => {
 if (!data?.unit_benchmarks) return [{ value: 'all', label: 'Semua Satuan Pendidikan' }]
 return [
 { value: 'all', label: 'Semua Satuan Pendidikan' },
 ...data.unit_benchmarks.map((u) => ({
 value: String(u.unit_id),
 label: u.unit_name,
 badge: u.program_type === 'boarding' ? 'Boarding' : 'Fullday',
 badgeColor: u.program_type === 'boarding' ? 'warning' : 'primary',
 })),
 ]
 }, [data?.unit_benchmarks])

 // Cascading Class / Rombel Options
 const classFilterOptions = useMemo(() => {
 if (!classesList || classesList.length === 0) {
 return [{ value: 'all', label: selectedUnitId === 'all' ? 'Pilih Unit Dahulu' : 'Semua Kelas / Rombel' }]
 }
 return [
 { value: 'all', label: 'Semua Kelas / Rombel' },
 ...classesList.map((c) => ({
 value: String(c.id),
 label: c.nama_kelas || c.kode_kelas || `Kelas #${c.id}`,
 badge: c.tingkat ? `Tingkat ${c.tingkat}` : undefined,
 })),
 ]
 }, [classesList, selectedUnitId])

 // Filtered Student Rankings for search
 const filteredRankings = useMemo(() => {
 if (!data?.student_rankings) return []
 if (!debouncedStudentSearch.trim()) return data.student_rankings
 const s = debouncedStudentSearch.toLowerCase().trim()
 return data.student_rankings.filter(
 (st) =>
 (st.full_name || '').toLowerCase().includes(s) ||
 (st.nis || '').toLowerCase().includes(s) ||
 (st.unit_name || '').toLowerCase().includes(s) ||
 (st.kelas_name || '').toLowerCase().includes(s)
 )
 }, [data?.student_rankings, debouncedStudentSearch])

 if (loading && !data) {
 return (
 <div className="flex flex-col items-center justify-center p-12 rounded-xl bg-white border border-emerald-200/80 shadow-xs dark:bg-[#182232] dark:border-emerald-800/60">
 <HeroSpinner color="primary" label="Menghubungkan ke Supervisi Tata Tertib Lintas Unit..." />
 </div>
 )
 }

 if (error && !data) {
 return (
 <div className="p-6 rounded-xl bg-rose-50/50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-800 dark:bg-rose-950/20 dark:border-emerald-800/60 dark:text-rose-300 text-center">
 <AlertCircle className="w-8 h-8 mx-auto text-rose-600 mb-2" />
 <p className="font-bold text-sm">{error || 'Data supervisi tidak tersedia.'}</p>
 <HeroButton size="sm" color="danger" variant="flat" className="mt-3 font-bold" onPress={() => fetchOverview()}>
 Coba Lagi
 </HeroButton>
 </div>
 )
 }

 const { macro_kpi, unit_benchmarks, compliance_audit, executive_summary } = data || {}

 return (
 <div className="space-y-6">
 {/* ── 1. HERO SUPERVISI DIVISI PENDIDIKAN ── */}
 <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] p-5 sm:p-6 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">

 <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
 <div className="flex items-start gap-4">
 <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm">
 <Building2 className="h-7 w-7 text-slate-600" />
 </div>
 <div>
 <div className="flex flex-wrap items-center gap-2">
 <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#059669] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
 <Sparkles className="h-3 w-3" /> Supervisi Penjaminan Mutu & Adab
 </span>
 <span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/80 dark:border-emerald-800/60 dark:text-emerald-300">
 {macro_kpi?.total_units || 0} Satuan Pendidikan
 </span>
 </div>
 <h2 className="mt-1.5 text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
 Benchmarking Kedisiplinan Lintas Unit Sekolah & Pondok
 </h2>
 <p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
 Audit kepatuhan SOP tata tertib, pemantauan poin tertinggi & terendah santri, serta laporan eksekutif untuk Pengurus Yayasan.
 </p>
 </div>
 </div>

 <div className="flex flex-wrap items-center gap-2">
 <HeroButton
 size="sm"
 color="primary"
 variant="solid"
 className="inline-flex items-center gap-1.5 font-bold rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-indigo-50 text-indigo-700 hover:bg-indigo-100/90 dark:border-emerald-800/60 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 shadow-xs cursor-pointer"
 onPress={() => setIsReportModalOpen(true)}
 >
 <Printer className="h-4 w-4 shrink-0" />
 <span>Laporan Yayasan</span>
 </HeroButton>

 <HeroButton
 size="sm"
 variant="flat"
 color="default"
 className="inline-flex items-center gap-1.5 font-black rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-xs"
 onPress={() => fetchOverview(selectedUnitId, selectedClassId, sortBy)}
 >
 <RefreshCw className={`h-3.5 w-3.5 shrink-0 ${loading ? 'animate-spin' : ''}`} />
 <span>Segarkan</span>
 </HeroButton>
 </div>
 </div>
 </div>

 {/* ── 2. MACRO SCORECARD GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-emerald-100/90 hover:!bg-emerald-200/70 p-4 shadow-sm transition-all duration-300 dark:border-emerald-800/60 dark:!bg-emerald-950/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Rata-Rata Kepatuhan
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl !bg-emerald-600 !text-white shadow-sm dark:!bg-emerald-600 dark:!text-white">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-2xl font-black text-emerald-800 dark:text-emerald-200">
              {macro_kpi?.overall_compliance_rate ?? 100}%
            </p>
            <span className="text-xs font-bold text-emerald-700/80 dark:text-emerald-400/80">Santri Tertib</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-emerald-200/80 dark:border-emerald-800/80 pt-2 dark:border-emerald-800/60">
            <span className="text-[10px] text-emerald-800/80 dark:text-emerald-300/80 font-medium">
              {macro_kpi?.clean_students ?? 0} dari {macro_kpi?.total_students ?? 0} Santri
            </span>
            <span className="inline-flex items-center rounded-md bg-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
              {selectedUnitId !== 'all' ? 'Unit Terpilih' : 'Se-Yayasan'}
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-rose-100/90 hover:!bg-rose-200/70 p-4 shadow-sm transition-all duration-300 dark:border-emerald-800/60 dark:!bg-rose-950/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-rose-800 dark:text-rose-300">
              Siswa Rawan (≥100 Poin)
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl !bg-rose-600 !text-white shadow-sm dark:!bg-rose-600 dark:!text-white">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <p className="text-2xl font-black text-rose-800 dark:text-rose-200">
              {macro_kpi?.total_high_risk_students ?? 0}
            </p>
            <span className="text-xs font-bold text-rose-700/80 dark:text-rose-400/80">Santri Terpantau</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-emerald-200/80 dark:border-emerald-800/80 pt-2 dark:border-emerald-800/60">
            <span className="text-[10px] text-rose-800/80 dark:text-rose-300/80 font-medium">Batas Sanksi ST/SP</span>
            <span className="inline-flex items-center rounded-md bg-rose-200/80 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-900/60 dark:text-rose-200">
              Perlu Intervensi
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-amber-100/90 hover:!bg-amber-200/70 p-4 shadow-sm transition-all duration-300 dark:border-emerald-800/60 dark:!bg-amber-950/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Surat Peringatan Terbit
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl !bg-amber-600 !text-white shadow-sm dark:!bg-amber-600 dark:text-white">
              <FileText className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <p className="text-2xl font-black text-amber-800 dark:text-amber-200">
              {macro_kpi?.total_warning_letters ?? 0}
            </p>
            <span className="text-xs font-bold text-amber-700/80 dark:text-amber-400/80">Surat Resmi</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-emerald-200/80 dark:border-emerald-800/80 pt-2 dark:border-emerald-800/60">
            <span className="text-[10px] text-amber-800/80 dark:text-amber-300/80 font-medium">Monitoring Divisi</span>
            <span className="inline-flex items-center rounded-md bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
              ST / SP1 / SP2
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-indigo-100/90 hover:!bg-indigo-200/70 p-4 shadow-sm transition-all duration-300 dark:border-emerald-800/60 dark:!bg-indigo-950/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
              Audit Pending Sanksi
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl !bg-indigo-600 !text-white shadow-sm dark:!bg-indigo-600 dark:!text-white">
              <Scale className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <p className="text-2xl font-black text-indigo-800 dark:text-indigo-200">
              {macro_kpi?.unissued_sp_count ?? 0}
            </p>
            <span className="text-xs font-bold text-indigo-700/80 dark:text-indigo-400/80">Belum Ada SP</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-emerald-200/80 dark:border-emerald-800/80 pt-2 dark:border-emerald-800/60">
            <span className="text-[10px] text-indigo-800/80 dark:text-indigo-300/80 font-medium">Poin ≥100 tanpa surat</span>
            <span className="inline-flex items-center rounded-md bg-indigo-200/80 px-2 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200">
              Audit SOP
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. FILTER & SORTING TOOLBAR (HERO UI) ── */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
 <div className="flex flex-wrap items-center gap-2.5 flex-1">
 <div className="w-full sm:w-60">
 <HeroUiFilterSelect
 value={selectedUnitId}
 onChange={(val) => setSelectedUnitId(val || 'all')}
 options={unitFilterOptions}
 placeholder="Pilih Satuan Pendidikan"
 icon={Building2}
 searchable={true}
 size="sm"
 className="w-full"
 />
 </div>

 <div className="w-full sm:w-56">
 <HeroUiFilterSelect
 value={selectedClassId}
 onChange={(val) => setSelectedClassId(val || 'all')}
 options={classFilterOptions}
 placeholder={classesLoading ? 'Memuat kelas...' : 'Pilih Kelas / Rombel'}
 icon={School}
 searchable={true}
 disabled={selectedUnitId === 'all' || classesLoading}
 size="sm"
 className="w-full"
 />
 </div>

 <div className="w-full sm:w-52">
 <HeroUiFilterSelect
 value={sortBy}
 onChange={(val) => setSortBy(val || 'points_desc')}
 options={[
 { value: 'points_desc', label: 'Poin Tertinggi (Terberat)' },
 { value: 'points_asc', label: 'Poin Terendah (Teringan)' },
 ]}
 placeholder="Urutan Poin"
 icon={ArrowUpDown}
 size="sm"
 className="w-full"
 />
 </div>

 {(selectedUnitId !== 'all' || selectedClassId !== 'all' || sortBy !== 'points_desc') && (
 <HeroButton
 size="sm"
 variant="flat"
 color="default"
 onPress={() => {
 setSelectedUnitId('all')
 setSelectedClassId('all')
 setSortBy('points_desc')
 }}
 >
 Reset Filter
 </HeroButton>
 )}
 </div>

 <div className="relative w-full md:w-64">
 <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 <HeroInput
 placeholder="Cari santri/NIS/kelas..."
 value={studentSearch}
 onChange={(e) => setStudentSearch(e.target.value)}
 className="w-full pl-9 h-9 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-xs font-medium"
 />
 </div>
 </div>
 </div>

 {/* ── 4. TABEL RINCIAN SANTRI & RANKING POIN (HERO UI) ── */}
 <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-sm dark:bg-[#1B2433]">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-emerald-200/80 dark:border-emerald-800/80 bg-slate-50/50 dark:bg-slate-900/50 gap-2">
 <div className="flex items-center gap-2.5">
 <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
 <Scale className="h-4 w-4" />
 </div>
 <div>
 <h3 className="text-sm font-black text-slate-900 dark:text-white">
 Rincian Catatan Poin Santri per Unit ({filteredRankings.length} Santri)
 </h3>
 <p className="text-xs text-slate-500">
 Peringkat {sortBy === 'points_desc' ? 'Poin Tertinggi (Kasus Terberat)' : 'Poin Terendah (Paling Disiplin)'} • Data Real-Time Database
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <span className="text-xs font-bold text-slate-500">
 Unit: <strong className="text-emerald-700 dark:text-emerald-400">{executive_summary?.selected_unit || 'Semua Unit'}</strong>
 </span>
 </div>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 <th className="py-3 px-4">Santri / Siswa</th>
 <th className="py-3 px-4">Satuan Pendidikan</th>
 <th className="py-3 px-4">Kelas / Rombel</th>
 <th className="py-3 px-4 text-center">Akumulasi Poin</th>
 <th className="py-3 px-4 text-center">Status Sanksi</th>
 <th className="py-3 px-4 text-center">Surat SP</th>
 <th className="py-3 px-4">Kasus Terakhir</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {filteredRankings.length === 0 ? (
 <tr>
 <td colSpan={7} className="py-10 text-center text-slate-400">
 Tidak ada santri yang sesuai kriteria filter/pencarian.
 </td>
 </tr>
 ) : (
 filteredRankings.map((st) => (
 <tr key={st.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition">
 <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
 <div className="flex items-center gap-2.5">
 <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-black text-xs">
 {st.full_name?.charAt(0) || 'S'}
 </div>
 <div>
 <p className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[180px]">
 {st.full_name}
 </p>
 <p className="text-[10px] text-slate-400">NIS: {st.nis}</p>
 </div>
 </div>
 </td>
 <td className="py-3.5 px-4">
 <div>
 <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{st.unit_name}</p>
 <HeroChip
 size="sm"
 variant="flat"
 color={st.program_type === 'boarding' ? 'warning' : 'primary'}
 className="text-[9px] font-black h-4 mt-0.5"
 >
 {st.program_type === 'boarding' ? 'Boarding' : 'Fullday'}
 </HeroChip>
 </div>
 </td>
 <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
 {st.kelas_name}
 </td>
 <td className="py-3.5 px-4 text-center min-w-[130px]">
 <div className="inline-flex flex-col items-center">
 <span className={`text-sm font-black tabular-nums ${
 st.total_points >= 100
 ? 'text-rose-600 dark:text-rose-400'
 : st.total_points >= 31
 ? 'text-amber-600 dark:text-amber-400'
 : st.total_points > 0
 ? 'text-blue-600 dark:text-blue-400'
 : 'text-emerald-600 dark:text-emerald-400'
 }`}>
 {st.total_points} Poin
 </span>
 <div className="w-16 h-1.5 rounded-full bg-emerald-50 dark:bg-slate-700 overflow-hidden mt-1">
 <div
 className={`h-full rounded-full ${
 st.total_points >= 100
 ? 'bg-rose-500'
 : st.total_points >= 31
 ? 'bg-amber-500'
 : st.total_points > 0
 ? 'bg-blue-500'
 : 'bg-emerald-500'
 }`}
 style={{ width: `${Math.min(100, (st.total_points / 250) * 100)}%` }}
 />
 </div>
 </div>
 </td>
 <td className="py-3.5 px-4 text-center">
 <HeroChip
 size="sm"
 variant="flat"
 color={st.risk_badge_color || 'default'}
 className="text-[10px] font-black"
 >
 {st.risk_status}
 </HeroChip>
 </td>
 <td className="py-3.5 px-4 text-center">
 {st.has_sp ? (
 <HeroChip size="sm" color="danger" variant="solid" className="font-black text-[10px] h-5">
 {st.latest_sp_type}
 </HeroChip>
 ) : (
 <span className="text-[10px] font-semibold text-slate-400">Belum Ada SP</span>
 )}
 </td>
 <td className="py-3.5 px-4 text-slate-500 text-xs">
 {st.violations_count > 0 ? (
 <span>
 {st.violations_count} Pelanggaran
 {st.last_violation_date && ` (${st.last_violation_date})`}
 </span>
 ) : (
 <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
 <CheckCircle2 className="h-3 w-3" /> Bersih / Disiplin
 </span>
 )}
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>

 {/* ── 5. TABEL BENCHMARKING KOMPARATIF LINTAS UNIT PENDIDIKAN ── */}
 <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-sm dark:bg-[#1B2433]">
 <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-200/80 dark:border-emerald-800/80 bg-slate-50/50 dark:bg-slate-900/50">
 <div className="flex items-center gap-2.5">
 <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
 <Award className="h-4 w-4" />
 </div>
 <div>
 <h3 className="text-sm font-black text-slate-900 dark:text-white">
 Tabel Komparasi & Kepatuhan Tata Tertib Antar-Unit
 </h3>
 <p className="text-xs text-slate-500">
 Perbandingan rasio kepatuhan adab santri dari jenjang TK s.d. SMA & Ponpes
 </p>
 </div>
 </div>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 <th className="py-3 px-4">Nama Unit Pendidikan</th>
 <th className="py-3 px-4">Program</th>
 <th className="py-3 px-4 text-center">Total Santri</th>
 <th className="py-3 px-4 text-center">Santri Tertib (0 Poin)</th>
 <th className="py-3 px-4">Indeks Kepatuhan</th>
 <th className="py-3 px-4 text-center">Rawan (≥100)</th>
 <th className="py-3 px-4 text-center">SP Terbit</th>
 <th className="py-3 px-4 text-right">Total Poin Unit</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {unit_benchmarks?.map((u) => (
 <tr
 key={u.unit_id}
 className={`transition ${
 u.is_selected
 ? 'bg-emerald-100/40 dark:bg-emerald-950/40 font-bold'
 : 'hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20'
 }`}
 >
 <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
 {u.unit_name}
 {u.is_selected && (
 <HeroChip size="sm" color="success" variant="solid" className="text-[9px] h-4">
 Aktif
 </HeroChip>
 )}
 </td>
 <td className="py-3.5 px-4">
 <HeroChip
 size="sm"
 variant="flat"
 color={u.program_type === 'boarding' ? 'warning' : 'default'}
 className="text-[10px] font-black h-5"
 >
 {u.program_type === 'boarding' ? 'Boarding' : 'Fullday'}
 </HeroChip>
 </td>
 <td className="py-3.5 px-4 text-center font-black tabular-nums">
 {u.total_students}
 </td>
 <td className="py-3.5 px-4 text-center font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
 {u.clean_students}
 </td>
 <td className="py-3.5 px-4 min-w-[140px]">
 <div className="flex items-center gap-2">
 <div className="w-full h-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 overflow-hidden">
 <div
 className="h-full rounded-full bg-white dark:bg-[#1B2433]"
 style={{ width: `${u.compliance_rate}%` }}
 />
 </div>
 <span className="font-black text-xs tabular-nums text-emerald-700 dark:text-emerald-400 shrink-0">
 {u.compliance_rate}%
 </span>
 </div>
 </td>
 <td className="py-3.5 px-4 text-center">
 <span className={`font-black tabular-nums ${u.high_risk_count > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
 {u.high_risk_count}
 </span>
 </td>
 <td className="py-3.5 px-4 text-center font-bold text-amber-700 dark:text-amber-400 tabular-nums">
 {u.sp_count}
 </td>
 <td className="py-3.5 px-4 text-right font-black tabular-nums text-slate-900 dark:text-white">
 {u.total_points} Poin
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 {/* ── 6. AUDIT KEPATUHAN PENANGANAN (SISWA ≥100 POIN TANPA SP) ── */}
 {compliance_audit?.length > 0 && (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/20 p-5 shadow-sm dark:border-emerald-800/60 dark:bg-rose-950/20">
 <div className="flex items-center gap-3 mb-3">
 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
 <AlertCircle className="h-5 w-5" />
 </div>
 <div>
 <h4 className="text-sm font-black text-rose-900 dark:text-rose-200">
 Audit Supervisi: {compliance_audit.length} Santri Melebihi Ambang Sanksi Namun Belum Menerima SP
 </h4>
 <p className="text-xs text-rose-700/80 dark:text-rose-300/80">
 Divisi Pendidikan merekomendasikan Kepala Sekolah dan TU segera menerbitkan Surat Teguran/SP dan memanggil orang tua siswa terkait.
 </p>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
 {compliance_audit.map((st) => (
 <div key={st.id} className="p-3 rounded-xl bg-white border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs dark:bg-[#1B2433] dark:border-emerald-800/60">
 <div className="flex items-start justify-between">
 <h5 className="font-black text-xs text-slate-900 dark:text-white ">{st.full_name}</h5>
 <HeroChip size="sm" color="danger" variant="flat" className="font-black text-[9px] h-5">
 {st.total_points} Poin
 </HeroChip>
 </div>
 <p className="text-xs text-slate-500 mt-1">
 NIS: {st.nis} • {st.unit_name} • {st.kelas}
 </p>
 <div className="mt-2 pt-2 border-t border-emerald-100/80 dark:border-emerald-800/60 flex items-center justify-between text-[10px]">
 <span className="text-rose-600 font-bold">{st.audit_status}</span>
 <span className="text-slate-400">Level 3 Sanksi TU</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* ── 7. MODAL LAPORAN EKSEKUTIF UNTUK PENGURUS YAYASAN (HERO UI) ── */}
 <AnimatePresence>
 {isReportModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 15 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 15 }}
 className="relative w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 flex flex-col max-h-[90vh]"
 >
 {/* Header Modal */}
 <div className="p-5 sm:p-6 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#059669] text-white shadow-md">
 <FileText className="h-6 w-6" />
 </div>
 <div>
 <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
 {executive_summary?.report_title || 'Laporan Eksekutif Supervisi Ketertiban'}
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Format Ditujukan Kepada: <strong>{executive_summary?.audience || 'Pengurus Yayasan'}</strong>
 </p>
 </div>
 </div>

 <button
 type="button"
 onClick={() => setIsReportModalOpen(false)}
 className="rounded-xl p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 hover:text-slate-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition"
 >
 <X className="h-5 w-5" />
 </button>
 </div>

 {/* Body Modal / Print Document */}
 <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300">
 {/* Meta Laporan */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-emerald-200/80 dark:border-emerald-700/80">
 <div>
 <span className="text-[10px] font-bold text-slate-400 uppercase">Periode</span>
 <p className="font-black text-slate-900 dark:text-white">{executive_summary?.period}</p>
 </div>
 <div>
 <span className="text-[10px] font-bold text-slate-400 uppercase">Diterbitkan</span>
 <p className="font-black text-slate-900 dark:text-white">{executive_summary?.generated_at}</p>
 </div>
 <div>
 <span className="text-[10px] font-bold text-slate-400 uppercase">Cakupan Unit</span>
 <p className="font-black text-slate-900 dark:text-white">{executive_summary?.selected_unit}</p>
 </div>
 <div>
 <span className="text-[10px] font-bold text-slate-400 uppercase">Indeks Kepatuhan</span>
 <p className="font-black text-emerald-600 dark:text-emerald-400">
 {executive_summary?.overall_compliance_rate}%
 </p>
 </div>
 </div>

 {/* Ringkasan Eksekutif */}
 <div>
 <h4 className="font-black text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
 <Sparkles className="h-4 w-4 text-emerald-600" /> Ringkasan Analisis Tata Tertib & Poin
 </h4>
 <p className="leading-relaxed text-slate-600 dark:text-slate-300">
 Berdasarkan rekapitulasi data poin pelanggaran tahun ajaran aktif, total santri terpantau adalah{' '}
 <strong>{executive_summary?.total_students_monitored} santri</strong>, dengan{' '}
 <strong>{executive_summary?.clean_students} santri ( {executive_summary?.overall_compliance_rate}% )</strong> berstatus tertib tanpa catatan pelanggaran.
 Tercatat <strong>{executive_summary?.high_risk_students_count} santri</strong> berada dalam zona risiko tinggi (akumulasi poin ≥ 100), dan{' '}
 <strong>{executive_summary?.total_sp_issued} berkas Surat Peringatan (SP)</strong> telah diterbitkan secara resmi.
 </p>
 </div>

 {/* Unit Rawan Tertinggi */}
 {executive_summary?.highest_risk_unit && (
 <div className="p-4 rounded-xl bg-amber-50/50 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/20 dark:border-emerald-800/60">
 <h5 className="font-black text-amber-900 dark:text-amber-300 flex items-center gap-1.5 mb-1">
 <AlertTriangle className="h-4 w-4 text-amber-600" /> Catatan Khusus Unit Berisiko Tertinggi
 </h5>
 <p className="text-amber-800 dark:text-amber-200/90 leading-relaxed text-xs">
 Satuan pendidikan <strong>{executive_summary.highest_risk_unit.unit_name}</strong> mengakumulasikan total{' '}
 <strong>{executive_summary.highest_risk_unit.total_points} poin pelanggaran</strong> dengan indeks kepatuhan{' '}
 <strong>{executive_summary.highest_risk_unit.compliance_rate}%</strong>. Diperlukan penguatan pembinaan adab asrama/kelas dan sinergi bersama wali santri.
 </p>
 </div>
 )}

 {/* Rekomendasi Divisi Pendidikan */}
 <div>
 <h4 className="font-black text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
 <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Rekomendasi Tindakan untuk Pengurus Yayasan
 </h4>
 <ul className="space-y-2 list-disc list-inside text-slate-600 dark:text-slate-300">
 {executive_summary?.recommendations?.map((rec, idx) => (
 <li key={idx} className="leading-relaxed">
 {rec}
 </li>
 ))}
 </ul>
 </div>
 </div>

 {/* Footer Modal */}
 <div className="p-4 sm:p-5 border-t border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
 <span className="text-xs text-slate-400">
 Dokumen resmi Supervisi Divisi Pendidikan Yayasan
 </span>
 <div className="flex items-center gap-2">
 <HeroButton
 size="sm"
 variant="flat"
 color="default"
 onPress={() => setIsReportModalOpen(false)}
 >
 Tutup
 </HeroButton>
 <HeroButton
 size="sm"
 color="primary"
 variant="solid"
 className="inline-flex items-center gap-1.5 font-bold rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-indigo-50 text-indigo-700 hover:bg-indigo-100/90 dark:border-emerald-800/60 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 shadow-xs cursor-pointer"
 onPress={() => window.print()}
 >
 <Printer className="h-4 w-4 shrink-0" />
 <span>Cetak Dokumen</span>
 </HeroButton>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 </div>
 )
}
