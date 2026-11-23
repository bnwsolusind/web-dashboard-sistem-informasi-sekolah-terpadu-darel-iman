import { useMemo, useState, useEffect } from 'react'
import CustomSelect from '@/components/ui/CustomSelect'
import { motion, AnimatePresence } from 'framer-motion'
import {
 BookOpenCheck,
 Clock,
 FileText,
 Loader2,
 Search,
 X,
 School,
 Layers,
 Sparkles,
 User,
 Tag,
 BookOpen,
 RotateCw,
 Award,
 ChevronRight,
 Info,
 Calendar,
 FileSpreadsheet,
 CheckCircle2,
 Gauge,
 Percent,
} from 'lucide-react'
import {
 Card as HeroCard,
 Chip as HeroChip,
 Button as HeroButton,
 Modal as HeroModal,
 Tooltip as HeroTooltip,
} from '@heroui/react'
import { cn } from '../../lib/utils'

// Dynamic theme mapper based on Subject or Exam Type
const getGridTheme = (subjectName = '', examType = '') => {
 const s = String(subjectName).toLowerCase().trim()
 const e = String(examType).toLowerCase().trim()

 if (s.includes('tahfizh') || s.includes('quran') || s.includes('tajwid')) {
 return {
 label: 'Tahfizh',
 badge: 'bg-emerald-100 text-emerald-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60',
 dot: 'bg-emerald-500',
 borderLeft: 'border-l-4 border-l-emerald-500',
 topBar: 'bg-white dark:bg-[#1B2433]',
 iconBg: 'bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300',
 chipColor: 'success',
 }
 }
 if (s.includes('matematika') || s.includes('mtk') || s.includes('kalkulus') || s.includes('hitung')) {
 return {
 label: 'Matematika',
 badge: 'bg-blue-100 text-blue-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-blue-950 dark:text-blue-300 dark:border-emerald-800/60',
 dot: 'bg-blue-500',
 borderLeft: 'border-l-4 border-l-blue-500',
 topBar: 'bg-white dark:bg-[#1B2433]',
 iconBg: 'bg-white dark:bg-[#1B2433]',
 chipColor: 'primary',
 }
 }
 if (s.includes('fisika') || s.includes('kimia') || s.includes('ipa') || s.includes('sains')) {
 return {
 label: 'Sains Eksakta',
 badge: 'bg-cyan-100 text-cyan-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-cyan-950 dark:text-cyan-300 dark:border-emerald-800/60',
 dot: 'bg-cyan-500',
 borderLeft: 'border-l-4 border-l-cyan-500',
 topBar: 'bg-white dark:bg-[#1B2433]',
 iconBg: 'bg-white dark:bg-[#1B2433]',
 chipColor: 'primary',
 }
 }
 if (s.includes('biologi') || s.includes('alam')) {
 return {
 label: 'Biologi',
 badge: 'bg-teal-100 text-teal-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-teal-950 dark:text-teal-300 dark:border-emerald-800/60',
 dot: 'bg-teal-500',
 borderLeft: 'border-l-4 border-l-teal-500',
 topBar: 'bg-white dark:bg-[#1B2433]',
 iconBg: 'bg-white dark:bg-[#1B2433]',
 chipColor: 'success',
 }
 }
 if (s.includes('agama') || s.includes('pai') || s.includes('arab') || s.includes('fiqih') || s.includes('akidah')) {
 return {
 label: 'Diniyah & Bahasa Arab',
 badge: 'bg-amber-100 text-amber-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950 dark:text-amber-300 dark:border-emerald-800/60',
 dot: 'bg-amber-500',
 borderLeft: 'border-l-4 border-l-amber-500',
 topBar: 'bg-white dark:bg-[#1B2433]',
 iconBg: 'bg-white dark:bg-[#1B2433]',
 chipColor: 'warning',
 }
 }
 if (s.includes('indonesia') || s.includes('inggris') || s.includes('bahasa')) {
 return {
 label: 'Bahasa & Literasi',
 badge: 'bg-violet-100 text-violet-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-violet-950 dark:text-violet-300 dark:border-emerald-800/60',
 dot: 'bg-violet-500',
 borderLeft: 'border-l-4 border-l-violet-500',
 topBar: 'bg-white dark:bg-[#1B2433]',
 iconBg: 'bg-white dark:bg-[#1B2433]',
 chipColor: 'secondary',
 }
 }
 if (s.includes('sejarah') || s.includes('pkn') || s.includes('sosial') || s.includes('ips') || s.includes('ekonomi')) {
 return {
 label: 'Sosial Humaniora',
 badge: 'bg-rose-100 text-rose-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950 dark:text-rose-300 dark:border-emerald-800/60',
 dot: 'bg-rose-500',
 borderLeft: 'border-l-4 border-l-rose-500',
 topBar: 'bg-white dark:bg-[#1B2433]',
 iconBg: 'bg-white dark:bg-[#1B2433]',
 chipColor: 'danger',
 }
 }

 // Fallback based on exam type
 if (e.includes('pts') || e.includes('tengah')) {
 return {
 label: examType || '-',
 badge: 'bg-indigo-100 text-indigo-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-indigo-950 dark:text-indigo-300 dark:border-emerald-800/60',
 dot: 'bg-indigo-500',
 borderLeft: 'border-l-4 border-l-indigo-500',
 topBar: 'bg-white dark:bg-[#1B2433]',
 iconBg: 'bg-white dark:bg-[#1B2433]',
 chipColor: 'primary',
 }
 }

 return {
 label: examType || '-',
 badge: 'bg-teal-100 text-teal-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-teal-950 dark:text-teal-300 dark:border-emerald-800/60',
 dot: 'bg-teal-500',
 borderLeft: 'border-l-4 border-l-teal-500',
 topBar: 'bg-white dark:bg-[#1B2433]',
 iconBg: 'bg-white dark:bg-[#1B2433]',
 chipColor: 'success',
 }
}

export default function ExamGridsWorkspace({
 grids = [],
 loading = false,
 student = null,
 isParent = true,
}) {
 const [draftSearch, setDraftSearch] = useState('')
 const [search, setSearch] = useState('')
 const [selectedSubject, setSelectedSubject] = useState('all')
 const [selectedExamType, setSelectedExamType] = useState('all')
 const [activeModal, setActiveModal] = useState(null)

 // Debounced search (350ms)
 useEffect(() => {
 const timer = setTimeout(() => setSearch(draftSearch), 350)
 return () => clearTimeout(timer)
 }, [draftSearch])

 const safeGrids = useMemo(() => {
 if (Array.isArray(grids)) return grids
 if (grids && Array.isArray(grids.data)) return grids.data
 if (grids && Array.isArray(grids.data?.data)) return grids.data.data
 return []
 }, [grids])

 // Extract distinct subjects dynamically from database records (zero hardcoding)
 const availableSubjects = useMemo(() => {
 const set = new Set()
 safeGrids.forEach((item) => {
 const name = item.subject?.name || item.subject?.nama_mapel || item.mata_pelajaran
 if (name && String(name).trim()) set.add(String(name).trim())
 })
 return Array.from(set).sort()
 }, [safeGrids])

 // Extract distinct exam types dynamically from database records (zero hardcoding)
 const availableExamTypes = useMemo(() => {
 const set = new Set()
 safeGrids.forEach((item) => {
 const type = item.jenis_ujian || item.tipe || item.category
 if (type && String(type).trim()) set.add(String(type).trim())
 })
 return Array.from(set).sort()
 }, [safeGrids])

 // Real-time statistics from active data
 const stats = useMemo(() => {
 let totalQuestions = 0
 let totalDurationMinutes = 0
 let durationCount = 0

 safeGrids.forEach((item) => {
 const q = Number(item.jumlah_soal || item.total_questions || 0)
 if (q > 0) totalQuestions += q

 const d = Number(item.alokasi_waktu_menit || item.durasi || 0)
 if (d > 0) {
 totalDurationMinutes += d
 durationCount++
 }
 })

 const avgDuration = durationCount > 0 ? Math.round(totalDurationMinutes / durationCount) : 0

 return {
 totalGrids: safeGrids.length,
 subjectCount: availableSubjects.length,
 totalQuestions,
 avgDuration,
 }
 }, [safeGrids, availableSubjects])

 // Dynamic filter tabs based on exam types and subjects
 const filterTabs = useMemo(() => {
 const tabs = [
 { id: 'all', label: 'Semua Kisi-Kisi', count: safeGrids.length },
 ]

 availableExamTypes.forEach((type) => {
 const count = safeGrids.filter((item) => {
 const itemType = (item.jenis_ujian || item.tipe || '').toLowerCase()
 return itemType === type.toLowerCase()
 }).length
 tabs.push({ id: `type_${type}`, label: type, count })
 })

 return tabs
 }, [safeGrids, availableExamTypes])

 // Filtered grids
 const filteredGrids = useMemo(() => {
 return safeGrids.filter((item) => {
 const title = (item.judul_kisi || item.judul || item.title || '').toLowerCase()
 const subject = (item.subject?.name || item.subject?.nama_mapel || item.mata_pelajaran || '').toLowerCase()
 const teacher = (item.guru?.nama_lengkap || item.guru?.name || item.teacher?.name || '').toLowerCase()
 const examType = (item.jenis_ujian || item.tipe || '').toLowerCase()
 const kd = (item.kompetensi_dasar || item.deskripsi || '').toLowerCase()

 // Tab filter (by exam type)
 if (selectedExamType.startsWith('type_')) {
 const targetType = selectedExamType.replace('type_', '').toLowerCase()
 if (examType !== targetType) return false
 }

 // Dropdown subject filter
 if (selectedSubject !== 'all' && subject !== selectedSubject.toLowerCase()) {
 return false
 }

 // Search query
 if (search.trim()) {
 const q = search.toLowerCase()
 if (
 !title.includes(q) &&
 !subject.includes(q) &&
 !teacher.includes(q) &&
 !examType.includes(q) &&
 !kd.includes(q)
 ) {
 return false
 }
 }

 return true
 })
 }, [safeGrids, selectedExamType, selectedSubject, search])

 const resetFilters = () => {
 setDraftSearch('')
 setSearch('')
 setSelectedSubject('all')
 setSelectedExamType('all')
 }

 if (loading) {
 return (
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-12 text-center shadow-sm dark:border-emerald-800/60 dark:bg-slate-900">
 <HeroCard.Content className="flex flex-col items-center justify-center p-0">
 <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
 <Loader2 className="h-7 w-7 animate-spin" />
 </div>
 <h3 className="mt-4 text-base font-black text-slate-800 dark:text-white">Memuat Kisi-Kisi Ujian...</h3>
 <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
 Sinkronisasi silabus, cakupan materi ujian, dan indikator soal dari dewan guru.
 </p>
 </HeroCard.Content>
 </HeroCard>
 )
 }

 return (
 <div className="space-y-5">
 {/* 1. HERO UI MODERN HERO HEADER CARD */}
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] p-5 sm:p-6 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <HeroCard.Content className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-center p-0 bg-transparent">
 <div className="flex items-center gap-3.5">
 <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-sm ring-4 ring-white/60 dark:ring-slate-800/80">
 <FileSpreadsheet className="h-6 w-6" />
 </span>
 <div>
 <div className="flex flex-wrap items-center gap-2">
 <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
 Kisi-Kisi Ujian & Panduan Asesmen
 </h2>
 {student?.unit_name && (
 <HeroChip
 size="sm"
 variant="soft"
 color="success"
 className="font-bold text-xs inline-flex items-center gap-1 bg-emerald-500/15 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300"
 >
 <School className="h-3 w-3 text-emerald-600 dark:text-emerald-400 mr-1 inline" />
 <HeroChip.Label>{student.unit_name}</HeroChip.Label>
 </HeroChip>
 )}
 {(student?.kelas?.nama_kelas || student?.kelas?.name) && (
 <HeroChip
 size="sm"
 variant="soft"
 color="success"
 className="font-bold text-xs inline-flex items-center gap-1 bg-teal-500/15 border border-emerald-200/80 dark:border-emerald-800/60 text-teal-800 dark:text-teal-300"
 >
 <Layers className="h-3 w-3 text-teal-600 mr-1 inline" />
 <HeroChip.Label>{student?.kelas?.nama_kelas || student?.kelas?.name}</HeroChip.Label>
 </HeroChip>
 )}
 <HeroChip
 size="sm"
 variant="soft"
 color="primary"
 className="font-bold text-[10px] inline-flex items-center gap-1 bg-blue-500/15 border border-emerald-200/80 dark:border-emerald-800/60 text-blue-800 dark:text-blue-300"
 >
 <Sparkles className="h-3 w-3 text-blue-600 mr-1 inline" />
 <HeroChip.Label>{isParent ? 'Portal Wali Murid' : 'Portal Siswa'}</HeroChip.Label>
 </HeroChip>
 </div>
 <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 font-medium max-w-xl">
 Panduan resmi kisi-kisi asesmen, capaian kompetensi dasar, dan distribusi bobot soal ujian yang dipublikasikan oleh dewan guru pengampu.
 </p>
 </div>
 </div>

 {/* Quick Metrics KPI Counters using HeroChip */}
 <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
 <HeroChip
 size="md"
 variant="flat"
 className="font-bold text-xs bg-white/85 dark:bg-slate-800/85 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs"
 >
 <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 font-black text-xs mr-1.5 dark:bg-emerald-950 dark:text-emerald-300">
 {stats.totalGrids}
 </span>
 <HeroChip.Label className="text-slate-700 dark:text-slate-200">Total Kisi-Kisi</HeroChip.Label>
 </HeroChip>
 <HeroChip
 size="md"
 variant="flat"
 className="font-bold text-xs bg-white/85 dark:bg-slate-800/85 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs"
 >
 <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-teal-100 text-teal-700 font-black text-xs mr-1.5 dark:bg-teal-950 dark:text-teal-300">
 {stats.subjectCount}
 </span>
 <HeroChip.Label className="text-slate-700 dark:text-slate-200">Mata Pelajaran</HeroChip.Label>
 </HeroChip>
 {stats.totalQuestions > 0 && (
 <HeroChip
 size="md"
 variant="flat"
 className="font-bold text-xs bg-blue-50/90 dark:bg-blue-950/40 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs text-blue-800 dark:text-blue-300"
 >
 <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-blue-100 text-blue-800 font-black text-xs mr-1.5 dark:bg-blue-900/60 dark:text-blue-300">
 {stats.totalQuestions}
 </span>
 <HeroChip.Label>Butir Soal</HeroChip.Label>
 </HeroChip>
 )}
 </div>
 </HeroCard.Content>
 </HeroCard>

 {/* 2. MASTER KPI STATS GRID (4 HERO UI CARDS) */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {/* Card 1: Total Kisi-Kisi */}
        <motion.div whileHover={{ y: -3 }}>
          <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-emerald-100/90 hover:!bg-emerald-200/70 p-4 sm:p-5 shadow-sm transition-all duration-300 dark:border-emerald-800/60 dark:!bg-emerald-950/50">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl !bg-emerald-600 !text-white shadow-sm dark:!bg-emerald-600 dark:!text-white">
                <FileSpreadsheet className="h-5 w-5 text-white" />
              </span>
              <span className="text-2xl font-black text-emerald-800 dark:text-emerald-200">{stats.totalGrids}</span>
            </div>
            <p className="mt-3 text-xs font-black text-emerald-800 dark:text-emerald-300">Total Kisi-Kisi</p>
            <p className="mt-0.5 text-xs font-medium text-emerald-700/80 dark:text-emerald-400/80">Dokumen asesmen ujian</p>
          </div>
        </motion.div>

        {/* Card 2: Ragam Mata Pelajaran */}
        <motion.div whileHover={{ y: -3 }}>
          <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-teal-100/90 hover:!bg-teal-200/70 p-4 sm:p-5 shadow-sm transition-all duration-300 dark:border-emerald-800/60 dark:!bg-teal-950/50">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl !bg-teal-600 !text-white shadow-sm dark:!bg-teal-600 dark:!text-white">
                <BookOpen className="h-5 w-5 text-white" />
              </span>
              <span className="text-2xl font-black text-teal-800 dark:text-teal-200">{stats.subjectCount}</span>
            </div>
            <p className="mt-3 text-xs font-black text-teal-800 dark:text-teal-300">Mata Pelajaran</p>
            <p className="mt-0.5 text-xs font-medium text-teal-700/80 dark:text-teal-400/80">Bidang studi terakreditasi</p>
          </div>
        </motion.div>

        {/* Card 3: Total Butir Soal */}
        <motion.div whileHover={{ y: -3 }}>
          <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-blue-100/90 hover:!bg-blue-200/70 p-4 sm:p-5 shadow-sm transition-all duration-300 dark:border-emerald-800/60 dark:!bg-blue-950/50">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl !bg-blue-600 !text-white shadow-sm dark:!bg-blue-600 dark:!text-white">
                <FileText className="h-5 w-5 text-white" />
              </span>
              <span className="text-2xl font-black text-blue-800 dark:text-blue-200">{stats.totalQuestions}</span>
            </div>
            <p className="mt-3 text-xs font-black text-blue-800 dark:text-blue-300">Total Butir Soal</p>
            <p className="mt-0.5 text-xs font-medium text-blue-700/80 dark:text-blue-400/80">Akumulasi estimasi soal</p>
          </div>
        </motion.div>

        {/* Card 4: Rata-Rata Durasi Ujian */}
        <motion.div whileHover={{ y: -3 }}>
          <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-amber-100/90 hover:!bg-amber-200/70 p-4 sm:p-5 shadow-sm transition-all duration-300 dark:border-emerald-800/60 dark:!bg-amber-950/50">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl !bg-amber-600 !text-white shadow-sm dark:!bg-amber-600 dark:!text-white">
                <Clock className="h-5 w-5 text-white" />
              </span>
              <span className="text-2xl font-black text-amber-800 dark:text-amber-200">
                {stats.avgDuration ? `${stats.avgDuration}'` : '-'}
              </span>
            </div>
            <p className="mt-3 text-xs font-black text-amber-800 dark:text-amber-300">Rata-Rata Waktu</p>
            <p className="mt-0.5 text-xs font-medium text-amber-700/80 dark:text-amber-400/80">Alokasi waktu per ujian</p>
          </div>
        </motion.div>
      </div>

      {/* 3. FILTER, SEARCH & TAB PILLS CONTAINER (HERO UI CARD) */}
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4 sm:p-5 shadow-xs dark:border-emerald-800/60 dark:bg-slate-900" aria-label="Filter dan Pencarian Kisi-Kisi">
 <HeroCard.Content className="p-0 bg-transparent space-y-4">
 <div className="flex flex-col gap-3 lg:flex-row">
 {/* Search Bar with Debounce */}
 <div className="relative flex-1">
 <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-emerald-600 dark:text-emerald-400 z-10 pointer-events-none" />
 <input
 type="text"
 value={draftSearch}
 onChange={(e) => setDraftSearch(e.target.value)}
 placeholder="Cari judul kisi-kisi, mata pelajaran, materi, atau kompetensi dasar..."
 className="h-11 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 pl-10 pr-4 text-xs font-medium outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/15 dark:border-emerald-800/60 dark:bg-slate-800 dark:focus:bg-slate-900 text-slate-800 dark:text-white"
 />
 </div>

 {/* Mata Pelajaran Dropdown Filter */}
 <CustomSelect
 aria-label="Filter Mata Pelajaran"
 value={selectedSubject}
 onChange={(e) => setSelectedSubject(e.target.value)}
 className="h-11 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 px-3.5 text-xs font-bold text-slate-700 outline-none transition-all focus:border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
 >
 <option value="all">Semua Mapel ({availableSubjects.length})</option>
 {availableSubjects.map((sub) => (
 <option key={sub} value={sub}>
 {sub}
 </option>
 ))}
 </CustomSelect>

 {/* Reset Filter Button using HeroButton */}
 <HeroButton
 size="sm"
 variant="outline"
 onPress={resetFilters}
 className="h-11 px-4 border border-emerald-200/80 dark:border-emerald-800/60 bg-white text-slate-700 hover:text-rose-600 hover:bg-rose-50 font-bold rounded-xl dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-all active:scale-95 inline-flex items-center gap-1.5 shrink-0 shadow-xs"
 >
 <RotateCw className="size-3.5 text-slate-500" />
 <span>Reset</span>
 </HeroButton>
 </div>

 {/* Dynamic Filter Pills (by Exam Type) */}
 <div className="flex flex-wrap items-center gap-2 border-t border-emerald-200/80 dark:border-emerald-800/60 pt-3.5 dark:border-emerald-800/60">
 {filterTabs.map(({ id, label, count }) => {
 const isActive = selectedExamType === id
 return (
 <HeroButton
 key={id}
 size="sm"
 onPress={() => setSelectedExamType(id)}
 className={cn(
 'inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95',
 isActive
 ? 'bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:text-white shadow-sm ring-2 ring-emerald-500/40 scale-[1.02]'
 : 'bg-slate-100/80 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 border border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/80'
 )}
 >
 <span>{label}</span>
 <span
 className={cn(
 'flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-black',
 isActive ? 'bg-white/20' : 'bg-black/10 text-slate-700 dark:bg-white/10 dark:text-slate-200'
 )}
 >
 {count}
 </span>
 </HeroButton>
 )
 })}
 </div>
 </HeroCard.Content>
 </HeroCard>

 {/* 4. KISI-KISI CARDS GRID (HERO UI CARDS) */}
 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
 {filteredGrids.map((item, idx) => {
 const subjectName = item.subject?.name || item.subject?.nama_mapel || item.mata_pelajaran || '-'
 const examType = item.jenis_ujian || item.tipe || '-'
 const theme = getGridTheme(subjectName, examType)
 const title = item.judul_kisi || item.judul || item.title || '-'
 const teacherName = item.guru?.nama_lengkap || item.guru?.name || item.teacher?.name || '-'
 const duration = item.alokasi_waktu_menit || item.durasi || 0
 const questionsCount = item.jumlah_soal || item.total_questions || 0
 const kd = item.kompetensi_dasar || item.deskripsi || ''
 const cognitiveLevel = item.level_kognitif || item.level || null

 return (
 <motion.div key={item.id || idx} whileHover={{ y: -3 }}>
 <HeroCard
 className={cn(
 'flex flex-col justify-between h-full relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-xs transition-all hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg hover:shadow-sm dark:border-emerald-800/60 dark:bg-slate-900',
 theme.borderLeft
 )}
 >
 {/* Top Accent Gradient Bar */}
 <div className={cn('h-1.5 w-full shrink-0', theme.topBar)} />

 {/* Header */}
 <HeroCard.Header className="flex flex-col gap-3 p-5 pb-3 bg-white dark:bg-slate-900 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <div className="flex items-center justify-between w-full">
 <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-xs ring-2 ring-white/80 dark:ring-slate-800', theme.iconBg)}>
 <BookOpenCheck className="h-5 w-5" />
 </span>
 <HeroChip
 size="sm"
 variant="soft"
 className={cn('font-black text-[10px] inline-flex items-center gap-1 border', theme.badge)}
 >
 <HeroChip.Label>{examType}</HeroChip.Label>
 </HeroChip>
 </div>

 <div>
 <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
 {subjectName}
 </span>
 <h3 className="mt-0.5 text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug line-clamp-2">
 {title}
 </h3>
 </div>
 </HeroCard.Header>

 {/* Content */}
 <HeroCard.Content className="p-5 py-4 space-y-3 bg-white dark:bg-slate-900 flex-1">
 {/* KD Preview if available */}
 {kd ? (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 p-3 text-xs text-slate-600 dark:border-emerald-800/60 dark:bg-slate-800/40 dark:text-slate-300 line-clamp-3 leading-relaxed">
 <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Kompetensi / Materi:</span>
 {kd}
 </div>
 ) : null}

 {/* Metadata Spec Pills */}
 <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
 {duration > 0 && (
 <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
 <Clock className="mr-1 h-3 w-3 text-emerald-600" />
 {duration} Menit
 </span>
 )}
 {questionsCount > 0 && (
 <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
 <FileText className="mr-1 h-3 w-3 text-blue-600" />
 {questionsCount} Butir Soal
 </span>
 )}
 {cognitiveLevel && (
 <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
 <Sparkles className="mr-1 h-3 w-3 text-amber-600" />
 {cognitiveLevel}
 </span>
 )}
 </div>

 {/* Teacher info */}
 <div className="flex items-center gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
 <User className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
 <span className="truncate font-semibold">{teacherName}</span>
 </div>
 </HeroCard.Content>

 {/* Footer Action */}
 <HeroCard.Footer className="flex items-center justify-between border-t border-emerald-200/80 bg-slate-50/60 p-4 dark:border-emerald-800/60 dark:bg-slate-900/60">
 <span className="text-[10px] font-bold text-slate-400">
 {item.created_at ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(item.created_at)) : '-'}
 </span>

 <HeroButton
 size="sm"
 onPress={() => setActiveModal(item)}
 className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 py-1.5 text-xs font-black text-emerald-700 shadow-xs hover:bg-emerald-50 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-emerald-300 dark:hover:bg-slate-700 cursor-pointer active:scale-95 transition-all"
 >
 <span>Rincian Kisi-Kisi</span>
 <ChevronRight className="h-3.5 w-3.5" />
 </HeroButton>
 </HeroCard.Footer>
 </HeroCard>
 </motion.div>
 )
 })}

 {/* Empty State */}
 {!filteredGrids.length && (
 <HeroCard className="col-span-full py-16 text-center rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50/30 p-8 dark:border-emerald-800/60 dark:bg-slate-900/40">
 <HeroCard.Content className="flex flex-col items-center justify-center p-0">
 <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
 <FileSpreadsheet className="h-7 w-7" />
 </div>
 <h4 className="mt-3 text-sm font-black text-slate-800 dark:text-white">Tidak Ada Kisi-Kisi Ujian</h4>
 <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
 Belum ada kisi-kisi ujian yang sesuai dengan kriteria filter atau kata kunci pencarian.
 </p>
 <HeroButton
 size="sm"
 onPress={resetFilters}
 className="mt-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 font-bold text-emerald-700 hover:bg-emerald-50 bg-white dark:bg-slate-800 dark:border-emerald-800/60 dark:text-emerald-300 cursor-pointer"
 >
 Reset Filter
 </HeroButton>
 </HeroCard.Content>
 </HeroCard>
 )}
 </div>

 {/* 5. HERO UI MODAL FOR KISI-KISI DETAIL */}
 <HeroModal
 isOpen={Boolean(activeModal)}
 onOpenChange={(open) => {
 if (!open) setActiveModal(null)
 }}
 >
 <HeroModal.Backdrop className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md">
 <HeroModal.Container placement="center" className="w-full max-w-xl">
 {activeModal && (() => {
 const modalSubject = activeModal.subject?.name || activeModal.subject?.nama_mapel || activeModal.mata_pelajaran || '-'
 const modalExamType = activeModal.jenis_ujian || activeModal.tipe || '-'
 const modalTheme = getGridTheme(modalSubject, modalExamType)
 const modalTeacher = activeModal.guru?.nama_lengkap || activeModal.guru?.name || activeModal.teacher?.name || '-'
 const modalBobot = activeModal.distribusi_bobot || null

 return (
 <HeroModal.Dialog className="modal-dialog font-sans my-auto w-full max-w-xl flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-[#182232] dark:shadow-black/60 outline-hidden">
 {/* Top Accent Gradient Bar */}
 <div className={cn('h-1.5 w-full shrink-0', modalTheme.topBar)} />

 {/* Header */}
 <HeroModal.Header className="modal-header flex !flex-row items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-[#182232] dark:bg-slate-950">
 <div className="flex items-center gap-3">
 <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-md text-white', modalTheme.iconBg)}>
 <FileSpreadsheet className="h-5 w-5" />
 </div>
 <div>
 <div className="flex flex-wrap items-center gap-2">
 <HeroChip
 size="sm"
 variant="soft"
 className={cn('font-bold text-[10px] inline-flex items-center gap-1 border', modalTheme.badge)}
 >
 <HeroChip.Label>{modalSubject}</HeroChip.Label>
 </HeroChip>
 <HeroChip
 size="sm"
 variant="soft"
 className="font-bold text-[10px] inline-flex items-center gap-1 border bg-emerald-50 text-slate-800 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300"
 >
 <HeroChip.Label>{modalExamType}</HeroChip.Label>
 </HeroChip>
 </div>
 <h3 className="modal-title mt-1 text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
 {activeModal.judul_kisi || activeModal.judul || activeModal.title || '-'}
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Guru: <span className="font-bold text-slate-700 dark:text-slate-300">{modalTeacher}</span>
 {activeModal.kelas?.nama_kelas ? ` · Rombel: ${activeModal.kelas.nama_kelas}` : ''}
 </p>
 </div>
 </div>

 <HeroButton
 isIconOnly
 size="sm"
 onPress={() => setActiveModal(null)}
 className="size-8 flex items-center justify-center rounded-xl bg-emerald-50 hover:bg-slate-200 text-emerald-700 hover:text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-slate-700 dark:text-emerald-300 cursor-pointer transition-all active:scale-95 shrink-0"
 >
 <X className="size-4" strokeWidth={2.2} />
 </HeroButton>
 </HeroModal.Header>

 {/* Body */}
 <HeroModal.Body className="modal-body p-6 space-y-4 text-slate-700 dark:text-slate-200 overflow-y-auto">
 {/* 4 Quick Spec Badges */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
 <div className="rounded-xl border border-emerald-200/80 bg-slate-50/70 p-3 text-center dark:border-emerald-800/60 dark:bg-slate-800/40">
 <span className="text-[10px] font-bold text-slate-400 uppercase block">Jenis Asesmen</span>
 <span className="text-xs font-black text-slate-800 dark:text-white mt-0.5 block">{modalExamType}</span>
 </div>
 <div className="rounded-xl border border-emerald-200/80 bg-slate-50/70 p-3 text-center dark:border-emerald-800/60 dark:bg-slate-800/40">
 <span className="text-[10px] font-bold text-slate-400 uppercase block">Durasi Ujian</span>
 <span className="text-xs font-black text-slate-800 dark:text-white mt-0.5 block">
 {activeModal.alokasi_waktu_menit || activeModal.durasi ? `${activeModal.alokasi_waktu_menit || activeModal.durasi} Menit` : '-'}
 </span>
 </div>
 <div className="rounded-xl border border-emerald-200/80 bg-slate-50/70 p-3 text-center dark:border-emerald-800/60 dark:bg-slate-800/40">
 <span className="text-[10px] font-bold text-slate-400 uppercase block">Jumlah Soal</span>
 <span className="text-xs font-black text-slate-800 dark:text-white mt-0.5 block">
 {activeModal.jumlah_soal || activeModal.total_questions ? `${activeModal.jumlah_soal || activeModal.total_questions} Butir` : '-'}
 </span>
 </div>
 <div className="rounded-xl border border-emerald-200/80 bg-slate-50/70 p-3 text-center dark:border-emerald-800/60 dark:bg-slate-800/40">
 <span className="text-[10px] font-bold text-slate-400 uppercase block">Level Kognitif</span>
 <span className="text-xs font-black text-slate-800 dark:text-white mt-0.5 block">
 {activeModal.level_kognitif || '-'}
 </span>
 </div>
 </div>

 {/* Distribusi Bobot Kesulitan Soal */}
 {modalBobot && typeof modalBobot === 'object' && (
 <div className="rounded-xl border border-emerald-200/80 bg-slate-50/70 p-4 dark:border-emerald-800/60 dark:bg-slate-800/40">
 <div className="flex items-center justify-between mb-2">
 <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
 <Gauge className="size-4 text-emerald-600" />
 Distribusi Tingkat Kesulitan Soal:
 </span>
 </div>
 <div className="grid grid-cols-3 gap-2 text-center pt-1">
 <div className="rounded-lg bg-emerald-100/70 p-2 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200">
 <span className="text-[10px] font-bold block uppercase">Mudah</span>
 <span className="text-sm font-black">{modalBobot.mudah || 0}%</span>
 </div>
 <div className="rounded-lg bg-blue-100/70 p-2 text-blue-900 dark:bg-blue-950/70 dark:text-blue-200">
 <span className="text-[10px] font-bold block uppercase">Sedang</span>
 <span className="text-sm font-black">{modalBobot.sedang || 0}%</span>
 </div>
 <div className="rounded-lg bg-amber-100/70 p-2 text-amber-900 dark:bg-amber-950/70 dark:text-amber-200">
 <span className="text-[10px] font-bold block uppercase">Sukar (HOTS)</span>
 <span className="text-sm font-black">{modalBobot.sukar || 0}%</span>
 </div>
 </div>
 </div>
 )}

 {/* Kompetensi Dasar / Capaian Pembelajaran */}
 <div className="rounded-xl border border-emerald-200/80 bg-slate-50/70 p-4.5 dark:border-emerald-800/60 dark:bg-slate-800/40">
 <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
 <BookOpen className="size-4 text-emerald-600" />
 Kompetensi Dasar & Ruang Lingkup Materi:
 </p>
 <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
 {activeModal.kompetensi_dasar || activeModal.deskripsi || '-'}
 </p>
 </div>

 {/* Catatan / Panduan Belajar */}
 {(activeModal.catatan || activeModal.saran_guru || activeModal.panduan) && (
 <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 p-3.5 text-xs text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/20 dark:text-emerald-300 leading-relaxed">
 <span className="font-bold block mb-0.5">Catatan / Panduan Belajar:</span>
 {activeModal.catatan || activeModal.saran_guru || activeModal.panduan}
 </div>
 )}
 </HeroModal.Body>

 {/* Footer */}
 <HeroModal.Footer className="modal-footer flex items-center justify-between border-t border-emerald-200/80 bg-white px-6 py-4 dark:border-emerald-800/60 dark:bg-slate-950">
 <span className="text-xs font-medium text-slate-400">
 Dareliman Edu {student?.unit_name ? `· ${student.unit_name}` : ''}
 </span>
 <HeroButton
 size="sm"
 onPress={() => setActiveModal(null)}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50/40 dark:border-emerald-700/80 dark:bg-emerald-950/60 dark:text-emerald-300 cursor-pointer"
 >
 Tutup
 </HeroButton>
 </HeroModal.Footer>
 </HeroModal.Dialog>
 )
 })()}
 </HeroModal.Container>
 </HeroModal.Backdrop>
 </HeroModal>
 </div>
 )
}
