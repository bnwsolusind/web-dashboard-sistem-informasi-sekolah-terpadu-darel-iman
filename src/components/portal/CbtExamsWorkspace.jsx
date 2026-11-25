import { useMemo, useState, useEffect } from 'react'
import AppModal from '@/components/app/AppModal'
import CustomSelect from '@/components/ui/CustomSelect'
import { motion, AnimatePresence } from 'framer-motion'
import {
 Laptop,
 FileCheck2,
 Clock,
 CircleHelp,
 ShieldCheck,
 Play,
 LockKeyhole,
 Loader2,
 Info,
 X,
 Search,
 RotateCcw,
 Sparkles,
 BookOpen,
 Award,
 CheckCircle2,
 CalendarClock,
 AlertCircle,
 Calendar,
 Layers,
 GraduationCap,
 RefreshCw,
 UserCheck,
} from 'lucide-react'
import {
 Card as HeroCard,
 Chip as HeroChip,
 Button as HeroButton,
} from '@heroui/react'
import useDebounce from '../../hooks/useDebounce'
import { cn } from '../../lib/utils'

const formatDate = (val) => {
 if (!val) return 'Tanpa batas waktu'
 try {
 return new Intl.DateTimeFormat('id-ID', {
 day: 'numeric',
 month: 'short',
 year: 'numeric',
 hour: '2-digit',
 minute: '2-digit',
 }).format(new Date(val))
 } catch {
 return String(val)
 }
}

export default function CbtExamsWorkspace({
 lmsData = null,
 onStartExam = null,
 isParent = false,
 startingId = null,
 loading = false,
 student = null,
}) {
 const [instructionModal, setInstructionModal] = useState(null)

 // Filter State
 const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'available' | 'upcoming' | 'completed' | 'ended'
 const [selectedSubject, setSelectedSubject] = useState('all')
 const [searchQuery, setSearchQuery] = useState('')
 const debouncedSearch = useDebounce(searchQuery, 350)

 // Resolusi data siswa aktif dinamis (Zero Hardcode)
 const activeStudent = student || lmsData?.student || null

 const isBoarding = useMemo(() => {
 if (typeof activeStudent?.program === 'string') return activeStudent.program === 'boarding'
 if (activeStudent?.is_pesantren !== undefined) return Boolean(activeStudent.is_pesantren)
 const unit = (
 activeStudent?.unit_name ||
 activeStudent?.education_unit?.name ||
 activeStudent?.unit_code ||
 ''
 ).toLowerCase()
 return unit.includes('pesantren') || unit.includes('ponpes') || unit.includes('asrama')
 }, [activeStudent])

 const currentAcademicYear = useMemo(() => {
 if (activeStudent?.academic_year) return activeStudent.academic_year
 if (activeStudent?.tahun_ajaran) return activeStudent.tahun_ajaran
 if (activeStudent?.kelas?.academic_year) return activeStudent.kelas.academic_year
 if (activeStudent?.academic_year_name) return activeStudent.academic_year_name
 const now = new Date()
 const year = now.getFullYear()
 const isOdd = now.getMonth() >= 6
 return isOdd ? `${year}/${year + 1}` : `${year - 1}/${year}`
 }, [activeStudent])

 // Normalisasi data ujian
 const exams = useMemo(() => {
 if (Array.isArray(lmsData?.exams)) return lmsData.exams
 if (Array.isArray(lmsData)) return lmsData
 return []
 }, [lmsData])

 // Ekstrak daftar mata pelajaran unik dinamis dari official_subjects (Jadwal Pelajaran) atau exams
 const availableSubjects = useMemo(() => {
 if (Array.isArray(lmsData?.official_subjects) && lmsData.official_subjects.length > 0) {
 return lmsData.official_subjects
 }
 const set = new Set()
 exams.forEach((e) => {
 const subject = e.mata_pelajaran || e.kisi_kisi?.subject?.name
 if (subject && typeof subject === 'string' && subject.trim()) {
 set.add(subject.trim())
 }
 })
 return Array.from(set).sort((a, b) => a.localeCompare(b))
 }, [exams, lmsData])

 // Reset selectedSubject jika mapel yang dipilih tidak lagi ada di availableSubjects
 useEffect(() => {
 if (selectedSubject !== 'all' && availableSubjects.length > 0 && !availableSubjects.includes(selectedSubject)) {
 setSelectedSubject('all')
 }
 }, [availableSubjects, selectedSubject])

 // Hitung metrik KPI secara dinamis
 const stats = useMemo(() => {
 const total = exams.length
 const available = exams.filter((e) => ['available', 'resume'].includes(e.availability)).length
 const upcoming = exams.filter((e) => e.availability === 'upcoming').length
 const completed = exams.filter((e) => e.latest_result || e.availability === 'completed').length
 const ended = exams.filter((e) => e.availability === 'ended' && !e.latest_result).length

 const validKkms = exams.filter((e) => typeof e.nilai_kkm === 'number' && e.nilai_kkm > 0)
 const avgKkm = validKkms.length
 ? Math.round(validKkms.reduce((sum, item) => sum + item.nilai_kkm, 0) / validKkms.length)
 : '-'

 return { total, available, upcoming, completed, ended, avgKkm }
 }, [exams])

 // Filter data ujian secara dinamis
 const filteredExams = useMemo(() => {
 return exams.filter((exam) => {
 // 1. Status Filter
 if (statusFilter !== 'all') {
 if (statusFilter === 'available') {
 if (!['available', 'resume'].includes(exam.availability)) return false
 } else if (statusFilter === 'upcoming') {
 if (exam.availability !== 'upcoming') return false
 } else if (statusFilter === 'completed') {
 if (!exam.latest_result && exam.availability !== 'completed') return false
 } else if (statusFilter === 'ended') {
 if (exam.availability !== 'ended') return false
 }
 }

 // 2. Subject Filter
 if (selectedSubject !== 'all') {
 const itemSubj = (exam.mata_pelajaran || exam.kisi_kisi?.subject?.name || '').trim().toLowerCase()
 const targetSubj = selectedSubject.trim().toLowerCase()
 if (
 itemSubj !== targetSubj &&
 !itemSubj.includes(targetSubj) &&
 !targetSubj.includes(itemSubj) &&
 !exam.judul_ujian?.toLowerCase().includes(targetSubj)
 ) {
 return false
 }
 }

 // 3. Search Query Debounced
 if (debouncedSearch.trim()) {
 const query = debouncedSearch.toLowerCase().trim()
 const title = String(exam.judul_ujian || '').toLowerCase()
 const subject = String(exam.mata_pelajaran || exam.kisi_kisi?.subject?.name || '').toLowerCase()
 const teacher = String(exam.guru || '').toLowerCase()
 const className = String(exam.kelas || '').toLowerCase()

 if (
 !title.includes(query) &&
 !subject.includes(query) &&
 !teacher.includes(query) &&
 !className.includes(query)
 ) {
 return false
 }
 }

 return true
 })
 }, [exams, statusFilter, selectedSubject, debouncedSearch])

 const hasActiveFilters = statusFilter !== 'all' || selectedSubject !== 'all' || searchQuery.trim() !== ''

 const handleResetFilters = () => {
 setStatusFilter('all')
 setSelectedSubject('all')
 setSearchQuery('')
 }

 const handleConfirmStart = (exam) => {
 setInstructionModal(null)
 if (onStartExam) {
 onStartExam(exam)
 }
 }

 if (loading) {
 return (
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-12 shadow-sm dark:border-emerald-800/60 dark:bg-slate-900">
 <div className="flex flex-col items-center justify-center space-y-4">
 <Loader2 className="h-10 w-10 animate-spin text-emerald-600 dark:text-emerald-400" />
 <p className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
 Memuat Data Ujian CBT Online...
 </p>
 </div>
 </HeroCard>
 )
 }

 return (
 <div className="space-y-6">
 {/* 1. HERO HEADER CONTAINER TERPADU (HERO UI CARD) */}
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] p-5 sm:p-7 shadow-lg shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 {/* Dual Multi-tone Ambient Glow */}
 <div
 aria-hidden="true"
 className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white dark:bg-[#1B2433] blur-3xl"
 />
 <div
 aria-hidden="true"
 className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-white dark:bg-[#1B2433] blur-3xl"
 />
 <div
 aria-hidden="true"
 className="absolute inset-0 opacity-[.06] text-emerald-600 dark:text-emerald-500 [background-image:radial-gradient(circle_at_2px_2px,currentColor_1.5px,transparent_0)] [background-size:24px_24px]"
 />

 <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
 <div className="flex items-start gap-4">
 <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-xl shadow-sm">
 <Laptop className="h-7 w-7" />
 </div>
 <div>
 <div className="flex flex-wrap items-center gap-2">
 <HeroChip
 size="sm"
 variant="flat"
 className="font-extrabold text-[10.5px] bg-emerald-500/20 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300"
 >
 <Sparkles className="h-3 w-3 text-emerald-600 mr-1 inline" />
 CBT Ujian Online Terpadu
 </HeroChip>

 <HeroChip
 size="sm"
 variant="flat"
 className={cn(
 'font-black text-[10px]',
 isBoarding
 ? 'bg-indigo-100 text-indigo-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-indigo-950 dark:text-indigo-300 dark:border-emerald-800/60'
 : 'bg-emerald-100 text-emerald-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60'
 )}
 >
 {isBoarding ? 'Boarding / Pesantren' : 'Full Day'}
 </HeroChip>

 <HeroChip
 size="sm"
 variant="flat"
 className="font-bold text-[10.5px] bg-white/80 text-slate-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/80"
 >
 <Calendar className="h-3 w-3 text-teal-600 mr-1 inline" />
 Tahun Ajaran {currentAcademicYear}
 </HeroChip>
 </div>

 <h1 className="mt-1.5 text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
 {activeStudent?.full_name
 ? `Ujian Online CBT — ${activeStudent.full_name}`
 : isBoarding
 ? 'Ujian Online CBT Santri'
 : 'Ujian Online CBT Siswa'}
 </h1>
 <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
 {isParent
 ? 'Monitoring pelaksanaan jadwal ujian CBT ananda, kesiapan sesi pengerjaan, alokasi waktu, serta petunjuk teknis ujian komputer secara transparan.'
 : 'Pilih paket ujian CBT yang siap dikerjakan. Pastikan koneksi internet stabil sebelum menekan tombol mulai.'}
 </p>
 </div>
 </div>

 {/* Callout Info Mode Orang Tua */}
 <div className="flex items-center gap-3 shrink-0">
 {isParent ? (
 <div className="flex items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/90 px-4 py-2.5 text-xs font-bold text-amber-900 shadow-xs dark:border-emerald-800/60 dark:bg-amber-950/40 dark:text-amber-300">
 <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
 <span>Mode Pemantauan Orang Tua (Monitoring Only)</span>
 </div>
 ) : (
 <div className="flex items-center gap-2 rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/90 px-4 py-2.5 text-xs font-bold text-emerald-900 shadow-xs dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
 <UserCheck className="h-4 w-4 text-emerald-600 shrink-0" />
 <span>Sesi Ujian Siswa Aktif</span>
 </div>
 )}
 </div>
 </div>
 </HeroCard>

 {/* 2. DYNAMIC 5 KPI STATS CARDS (HERO UI CARDS) */}
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
 {/* Card 1: Total Ujian */}
 <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4.5 shadow-xs transition-all hover:shadow-md dark:border-emerald-800/60 dark:bg-slate-900">
 <div
 aria-hidden="true"
 className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white dark:bg-[#1B2433] blur-xl"
 />
 <div className="relative flex items-center justify-between gap-2">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm">
 <FileCheck2 className="h-5 w-5" />
 </div>
 <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
 {stats.total}
 </span>
 </div>
 <p className="relative mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">
 Total Paket Ujian
 </p>
 <p className="relative mt-0.5 text-xs font-medium text-slate-400 dark:text-slate-500">
 Asesmen terdaftar semester ini
 </p>
 </HeroCard>
 </motion.div>

 {/* Card 2: Siap Dikerjakan / Berlangsung */}
 <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4.5 shadow-xs transition-all hover:shadow-md dark:border-emerald-800/60 dark:bg-slate-900">
 <div
 aria-hidden="true"
 className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white dark:bg-[#1B2433] blur-xl"
 />
 <div className="relative flex items-center justify-between gap-2">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-md shadow-sky-500/20">
 <Play className="h-5 w-5" />
 </div>
 <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
 {stats.available}
 </span>
 </div>
 <p className="relative mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">
 Siap Dikerjakan
 </p>
 <p className="relative mt-0.5 text-xs font-medium text-slate-400 dark:text-slate-500">
 Ujian aktif & dapat dimulai
 </p>
 </HeroCard>
 </motion.div>

 {/* Card 3: Akan Datang */}
 <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4.5 shadow-xs transition-all hover:shadow-md dark:border-emerald-800/60 dark:bg-slate-900">
 <div
 aria-hidden="true"
 className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white dark:bg-[#1B2433] blur-xl"
 />
 <div className="relative flex items-center justify-between gap-2">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-sm">
 <CalendarClock className="h-5 w-5" />
 </div>
 <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
 {stats.upcoming}
 </span>
 </div>
 <p className="relative mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">
 Jadwal Mendatang
 </p>
 <p className="relative mt-0.5 text-xs font-medium text-slate-400 dark:text-slate-500">
 Belum memasuki waktu mulai
 </p>
 </HeroCard>
 </motion.div>

 {/* Card 4: Telah Selesai */}
 <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4.5 shadow-xs transition-all hover:shadow-md dark:border-emerald-800/60 dark:bg-slate-900">
 <div
 aria-hidden="true"
 className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white dark:bg-[#1B2433] blur-xl"
 />
 <div className="relative flex items-center justify-between gap-2">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-sm">
 <CheckCircle2 className="h-5 w-5" />
 </div>
 <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
 {stats.completed}
 </span>
 </div>
 <p className="relative mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">
 Telah Selesai
 </p>
 <p className="relative mt-0.5 text-xs font-medium text-slate-400 dark:text-slate-500">
 Jawaban telah dikirimkan
 </p>
 </HeroCard>
 </motion.div>

 {/* Card 5: Target KKM Rata-rata */}
 <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18 }} className="col-span-2 sm:col-span-1">
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4.5 shadow-xs transition-all hover:shadow-md dark:border-emerald-800/60 dark:bg-slate-900">
 <div
 aria-hidden="true"
 className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white dark:bg-[#1B2433] blur-xl"
 />
 <div className="relative flex items-center justify-between gap-2">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-sm">
 <Award className="h-5 w-5" />
 </div>
 <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
 {stats.avgKkm}
 </span>
 </div>
 <p className="relative mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">
 Target KKM Rata-rata
 </p>
 <p className="relative mt-0.5 text-xs font-medium text-slate-400 dark:text-slate-500">
 Standar ketuntasan minimal
 </p>
 </HeroCard>
 </motion.div>
 </div>

 {/* 3. WORKSPACE CONTAINER (HERO UI CARD) */}
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 sm:p-6 shadow-xs dark:border-emerald-800/60 dark:bg-slate-900">
 {/* Navigation / Filter Toolbar Terpadu */}
 <div className="flex flex-col gap-4 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-5 dark:border-emerald-800/60">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
 <div className="flex items-center gap-2.5">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
 <Layers className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-base font-black text-slate-900 dark:text-white">
 Daftar Paket Ujian Komputer (CBT)
 </h3>
 <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
 {isParent
 ? 'Monitoring status pengerjaan, alokasi waktu, dan petunjuk teknis ujian CBT ananda.'
 : 'Pilih paket ujian CBT yang siap dikerjakan. Pastikan koneksi internet stabil.'}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <HeroChip
 size="sm"
 variant="flat"
 className="font-bold text-xs bg-slate-100 text-slate-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/80"
 >
 <GraduationCap className="h-3 w-3 mr-1 inline text-emerald-600" />
 {activeStudent?.kelas?.nama_kelas || activeStudent?.class_name || 'Seluruh Kelas CBT'}
 </HeroChip>
 </div>
 </div>

 {/* FILTER TOOLBAR TERPADU (STATUS & SEARCH) */}
 <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 p-3.5 sm:p-4 dark:border-emerald-800/60 dark:bg-slate-800/40 space-y-3.5">
 {/* Baris 1: Segmented Status Filter Tabs */}
 <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3 dark:border-emerald-800/60">
 <div className="flex items-center gap-2">
 <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5 shrink-0">
 <Laptop className="h-4 w-4 text-emerald-600 shrink-0" />
 Status Ujian:
 </span>
 <span className="inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-bold border bg-white dark:bg-slate-900 border-emerald-200/80 dark:border-emerald-700/80 text-slate-700 dark:text-slate-300">
 {statusFilter === 'all'
 ? 'Semua Status'
 : statusFilter === 'available'
 ? 'Siap Dikerjakan'
 : statusFilter === 'upcoming'
 ? 'Jadwal Mendatang'
 : statusFilter === 'completed'
 ? 'Telah Selesai'
 : 'Ditutup'}
 </span>
 </div>

 {/* Status Filter Buttons */}
 <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-700/80/80 shadow-xs overflow-x-auto no-scrollbar">
 {[
 { id: 'all', label: 'Semua Status', count: stats.total },
 { id: 'available', label: 'Siap Dikerjakan', count: stats.available },
 { id: 'upcoming', label: 'Akan Datang', count: stats.upcoming },
 { id: 'completed', label: 'Telah Selesai', count: stats.completed },
 ].map(({ id, label, count }) => {
 const isActive = statusFilter === id
 return (
 <button
 key={id}
 type="button"
 onClick={() => setStatusFilter(id)}
 className={cn(
 'inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 text-center select-none',
 isActive
 ? 'bg-white dark:bg-[#1B2433] shadow-xs font-extrabold ring-1 ring-emerald-500/30'
 : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30'
 )}
 >
 <span>{label}</span>
 <span
 className={cn(
 'rounded-full px-1.5 py-0.2 text-[10px] font-extrabold',
 isActive
 ? 'bg-white/20'
 : 'bg-slate-100 text-slate-600 dark:bg-sky-950/60 dark:text-sky-300'
 )}
 >
 {count}
 </span>
 </button>
 )
 })}
 </div>
 </div>

 {/* Baris 2: Search Box & Mata Pelajaran Dropdown */}
 <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-12 items-center">
 {/* Search Box */}
 <div className="relative lg:col-span-5">
 <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 placeholder="Cari judul ujian, mata pelajaran, guru pengampu..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full rounded-xl border border-emerald-200/80 bg-white py-2 pl-9 pr-8 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-200 dark:placeholder-slate-500"
 />
 {searchQuery && (
 <button
 type="button"
 onClick={() => setSearchQuery('')}
 className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
 >
 <X className="h-3.5 w-3.5" />
 </button>
 )}
 </div>

 {/* Filter Mata Pelajaran Dinamis */}
 <div className="relative lg:col-span-4">
 <BookOpen className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
 <CustomSelect
 value={selectedSubject}
 onChange={(e) => setSelectedSubject(e.target.value)}
 className="w-full appearance-none rounded-xl border border-emerald-200/80 bg-white py-2 pl-9 pr-8 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-200 cursor-pointer"
 >
 <option value="all">Semua Mata Pelajaran ({availableSubjects.length})</option>
 {availableSubjects.map((subject) => (
 <option key={subject} value={subject}>
 {subject}
 </option>
 ))}
 </CustomSelect>
 </div>

 {/* Reset Filter Button */}
 {hasActiveFilters && (
 <div className="lg:col-span-3 flex items-center justify-end">
 <button
 type="button"
 onClick={handleResetFilters}
 className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition-all hover:bg-rose-100 dark:border-emerald-800/60 dark:bg-rose-950/60 dark:text-rose-300 cursor-pointer"
 >
 <RotateCcw className="h-3.5 w-3.5" />
 Reset Filter
 </button>
 </div>
 )}
 </div>

 {/* Indikator Jumlah Data Terpilih */}
 <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
 Menampilkan <span className="font-extrabold text-emerald-700 dark:text-emerald-300">{filteredExams.length}</span> dari {exams.length} paket ujian CBT
 </div>
 </div>
 </div>

 {/* 4. LIST CARDS UJIAN CBT ONLINE */}
 <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
 {filteredExams.map((exam) => {
 const canStart = !isParent && ['available', 'resume'].includes(exam.availability)
 const busy = startingId === exam.id
 const subjectName = exam.mata_pelajaran || exam.kisi_kisi?.subject?.name || 'Mata Pelajaran'
 const isCompleted = exam.latest_result || exam.availability === 'completed'
 const isAvailable = ['available', 'resume'].includes(exam.availability)
 const isUpcoming = exam.availability === 'upcoming'

 return (
 <motion.article
 key={exam.id}
 whileHover={{ y: -3 }}
 transition={{ duration: 0.18 }}
 className={cn(
 'relative flex flex-col justify-between overflow-hidden rounded-xl border-2 p-5 shadow-xs transition-all hover:shadow-md bg-white dark:bg-slate-900',
 isAvailable
 ? 'border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700'
 : isUpcoming
 ? 'border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700'
 : isCompleted
 ? 'border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700'
 : 'border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300'
 )}
 >
 {/* Top Status Gradient Stripe */}
 <div
 className={cn(
 'absolute left-0 right-0 top-0 h-1.5',
 isAvailable
 ? 'bg-white dark:bg-[#1B2433]'
 : isUpcoming
 ? 'bg-white dark:bg-[#1B2433]'
 : isCompleted
 ? 'bg-white dark:bg-[#1B2433]'
 : 'bg-white dark:bg-[#1B2433]'
 )}
 />

 <div>
 {/* Top Bar: Subject Badge & Status Chip */}
 <div className="flex items-start justify-between gap-2">
 <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-black uppercase tracking-wide text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 truncate max-w-[190px]">
 <BookOpen className="h-3 w-3 shrink-0" />
 <span className="truncate">{subjectName}</span>
 </span>

 <HeroChip
 size="sm"
 variant="flat"
 className={cn(
 'font-black text-[10px] border px-2 py-0.5',
 isAvailable
 ? 'bg-emerald-100 text-emerald-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60'
 : isUpcoming
 ? 'bg-amber-100 text-amber-900 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950 dark:text-amber-300 dark:border-emerald-800/60'
 : isCompleted
 ? 'bg-indigo-100 text-indigo-900 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-indigo-950 dark:text-indigo-300 dark:border-emerald-800/60'
 : 'bg-slate-100 text-slate-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/80'
 )}
 >
 {exam.availability === 'available'
 ? 'Tersedia'
 : exam.availability === 'resume'
 ? 'Lanjutkan'
 : exam.availability === 'upcoming'
 ? 'Akan Datang'
 : isCompleted
 ? 'Telah Selesai'
 : 'Ditutup'}
 </HeroChip>
 </div>

 {/* Judul Ujian */}
 <h4 className="mt-3 text-base font-black text-slate-900 dark:text-white leading-snug line-clamp-2">
 {exam.judul_ujian}
 </h4>

 {/* Info Kelas & Guru Pengampu */}
 <p className="mt-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
 <span>{exam.kelas || activeStudent?.kelas?.nama_kelas || 'Kelas Siswa'}</span>
 <span className="mx-1.5">·</span>
 <span>{exam.guru || 'Guru Pengampu'}</span>
 </p>

 {/* Meta Specs Grid: Durasi, Soal, KKM, Attempt */}
 <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
 <div className="flex items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/80 p-2.5 dark:border-emerald-800/60 dark:bg-slate-800/60">
 <Clock className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
 <div>
 <div className="text-[10px] text-slate-400 font-medium">Durasi Waktu</div>
 <div>{exam.durasi_menit} Menit</div>
 </div>
 </div>

 <div className="flex items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/80 p-2.5 dark:border-emerald-800/60 dark:bg-slate-800/60">
 <CircleHelp className="h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />
 <div>
 <div className="text-[10px] text-slate-400 font-medium">Jumlah Soal</div>
 <div>{exam.kisi_kisi?.jumlah_soal || '-'} Soal</div>
 </div>
 </div>

 <div className="flex items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/80 p-2.5 dark:border-emerald-800/60 dark:bg-slate-800/60">
 <Award className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
 <div>
 <div className="text-[10px] text-slate-400 font-medium">Standar KKM</div>
 <div>Nilai {exam.nilai_kkm ?? '-'}</div>
 </div>
 </div>

 <div className="flex items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/80 p-2.5 dark:border-emerald-800/60 dark:bg-slate-800/60">
 <RefreshCw className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
 <div>
 <div className="text-[10px] text-slate-400 font-medium">Batas Sesi</div>
 <div>{exam.attempts_used || 0}/{exam.max_attempt || 1} Kali</div>
 </div>
 </div>
 </div>

 {/* Hasil Nilai Jika Telah Selesai */}
 {exam.latest_result && exam.latest_result.nilai_final !== null && (
 <div className="mt-3.5 flex items-center justify-between rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 p-3 dark:border-emerald-800/60 dark:bg-emerald-950/40">
 <div className="flex items-center gap-2">
 <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 <div>
 <div className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
 Nilai Ujian Final
 </div>
 <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
 Benar: {exam.latest_result.jumlah_benar ?? '-'} · Salah: {exam.latest_result.jumlah_salah ?? '-'}
 </div>
 </div>
 </div>
 <div className="text-xl font-black text-emerald-700 dark:text-emerald-300">
 {exam.latest_result.nilai_final}
 </div>
 </div>
 )}

 {/* Jadwal Mulai & Selesai */}
 <div className="mt-3.5 space-y-1 rounded-xl bg-slate-50 p-2.5 text-xs font-semibold text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
 <div className="flex items-center justify-between">
 <span className="text-slate-400">Jadwal Mulai:</span>
 <span className="text-slate-700 dark:text-slate-300">{formatDate(exam.waktu_mulai)}</span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-slate-400">Batas Selesai:</span>
 <span className="text-slate-700 dark:text-slate-300">{formatDate(exam.waktu_selesai)}</span>
 </div>
 </div>
 </div>

 {/* Action Button Section */}
 <div className="mt-5 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60">
 {isParent ? (
 <HeroButton
 size="md"
 onPress={() => setInstructionModal(exam)}
 className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-[#1B2433] px-4 py-2.5 text-xs font-black shadow-xs transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer"
 >
 <Info className="h-4 w-4 shrink-0 text-emerald-600" />
 <span className="font-extrabold">Detail Ujian</span>
 </HeroButton>
 ) : (
 <HeroButton
 size="md"
 isDisabled={!canStart || busy}
 onPress={() => setInstructionModal(exam)}
 className={cn(
 'w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black text-white shadow-xs transition-all cursor-pointer',
 canStart
 ? 'bg-white dark:bg-[#1B2433] shadow-sm hover:scale-[1.01] hover:shadow-md'
 : 'bg-slate-300 text-slate-500 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
 )}
 >
 {busy ? (
 <>
 <Loader2 className="h-4 w-4 animate-spin" /> Memulai Sesi...
 </>
 ) : canStart ? (
 <>
 <Play className="h-4 w-4" />
 {exam.availability === 'resume' ? 'Lanjutkan Ujian' : 'Mulai Ujian Sekarang'}
 </>
 ) : (
 <>
 <LockKeyhole className="h-4 w-4" />
 {isCompleted ? 'Ujian Telah Selesai' : 'Belum Dapat Dikerjakan'}
 </>
 )}
 </HeroButton>
 )}
 </div>
 </motion.article>
 )
 })}

 {filteredExams.length === 0 && (
 <div className="col-span-full py-16 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2">
 <FileCheck2 className="mx-auto h-12 w-12 text-emerald-300 dark:text-emerald-700" />
 <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
 Belum Ada Jadwal Ujian CBT
 </p>
 <p className="text-xs text-slate-400 max-w-sm mx-auto">
 {hasActiveFilters
 ? 'Tidak ada paket ujian CBT yang cocok dengan kata kunci atau filter status terpilih.'
 : `Belum ada paket ujian online aktif untuk ${activeStudent?.full_name ? `ananda ${activeStudent.full_name}` : 'kelas Anda'}.`}
 </p>
 {hasActiveFilters && (
 <button
 type="button"
 onClick={handleResetFilters}
 className="mt-2 inline-flex items-center gap-1.5 rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950 dark:text-emerald-300 cursor-pointer"
 >
 <RotateCcw className="h-3.5 w-3.5" />
 Reset Filter Pencarian
 </button>
 )}
 </div>
 )}
 </div>
 </HeroCard>

 {/* 5. HERO UI MODAL DETAIL & PETUNJUK CBT */}
 <AppModal
 isOpen={Boolean(instructionModal)}
 onClose={() => setInstructionModal(null)}
 title="Detail & Petunjuk Ujian CBT"
 description="Informasi spesifikasi teknis dan tata tertib ujian komputer"
 icon={Laptop}
 maxWidth="max-w-lg"
 footer={
 <div className="flex w-full items-center justify-end gap-2.5">
 <button
 type="button"
 onClick={() => setInstructionModal(null)}
 className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
 >
 {isParent ? 'Tutup' : 'Batal'}
 </button>
 {!isParent && instructionModal && (
 <button
 type="button"
 onClick={() => handleConfirmStart(instructionModal)}
 className="inline-flex h-9.5 items-center justify-center gap-2 rounded-xl border-2 border-emerald-600 bg-emerald-600 px-5 text-xs font-black text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-95 cursor-pointer"
 >
 <Play className="h-4 w-4" />
 Mulai Ujian Sekarang
 </button>
 )}
 </div>
 }
 >
 {instructionModal && (
 <div className="space-y-4 text-xs">
 {/* Rangkuman Judul & Mapel */}
 <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/20 space-y-2">
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold text-slate-400">Mata Pelajaran:</span>
 <span className="font-black text-emerald-800 dark:text-emerald-300">
 {instructionModal.mata_pelajaran || instructionModal.kisi_kisi?.subject?.name || '-'}
 </span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold text-slate-400">Judul Paket:</span>
 <span className="font-extrabold text-slate-800 dark:text-slate-200">
 {instructionModal.judul_ujian}
 </span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold text-slate-400">Guru Pengampu:</span>
 <span className="font-semibold text-slate-700 dark:text-slate-300">
 {instructionModal.guru || 'Guru Pengampu'}
 </span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold text-slate-400">Kelas Peserta:</span>
 <span className="font-semibold text-slate-700 dark:text-slate-300">
 {instructionModal.kelas || activeStudent?.kelas?.nama_kelas || '-'}
 </span>
 </div>
 </div>

 {/* 4 Parameter Kotak Spek */}
 <div className="grid grid-cols-2 gap-2.5">
 <div className="rounded-xl border border-emerald-200/80 bg-slate-50 p-3 dark:border-emerald-800/60 dark:bg-slate-800/50">
 <span className="text-[10.5px] font-medium text-slate-400">Durasi Pengerjaan</span>
 <p className="mt-0.5 text-sm font-black text-slate-800 dark:text-slate-200">
 {instructionModal.durasi_menit} Menit
 </p>
 </div>
 <div className="rounded-xl border border-emerald-200/80 bg-slate-50 p-3 dark:border-emerald-800/60 dark:bg-slate-800/50">
 <span className="text-[10.5px] font-medium text-slate-400">Total Soal</span>
 <p className="mt-0.5 text-sm font-black text-slate-800 dark:text-slate-200">
 {instructionModal.kisi_kisi?.jumlah_soal || '-'} Butir
 </p>
 </div>
 <div className="rounded-xl border border-emerald-200/80 bg-slate-50 p-3 dark:border-emerald-800/60 dark:bg-slate-800/50">
 <span className="text-[10.5px] font-medium text-slate-400">Standar KKM</span>
 <p className="mt-0.5 text-sm font-black text-amber-700 dark:text-amber-400">
 {instructionModal.nilai_kkm ?? '-'}
 </p>
 </div>
 <div className="rounded-xl border border-emerald-200/80 bg-slate-50 p-3 dark:border-emerald-800/60 dark:bg-slate-800/50">
 <span className="text-[10.5px] font-medium text-slate-400">Batas Percobaan</span>
 <p className="mt-0.5 text-sm font-black text-teal-700 dark:text-teal-400">
 {instructionModal.attempts_used || 0} / {instructionModal.max_attempt || 1} Sesi
 </p>
 </div>
 </div>

 {/* Instruksi Khusus dari Guru */}
 {instructionModal.instruksi ? (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 p-3.5 dark:border-emerald-700/80 dark:bg-slate-800/60 leading-relaxed">
 <div className="font-extrabold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
 <Info className="h-4 w-4 text-emerald-600" />
 Instruksi Pengerjaan:
 </div>
 <p className="text-slate-600 dark:text-slate-300 font-medium">
 {instructionModal.instruksi}
 </p>
 </div>
 ) : null}

 {/* Callout Peringatan Tata Tertib */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50 p-3.5 text-amber-950 dark:border-emerald-800/60 dark:bg-amber-950/40 dark:text-amber-200 leading-relaxed font-medium">
 <div className="flex items-center gap-2 font-extrabold text-amber-900 dark:text-amber-300 mb-1">
 <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
 Pemberitahuan Sistem CBT:
 </div>
 {isParent ? (
 <p>
 Halaman ini diperuntukkan bagi orang tua untuk memantau kesiapan dan jadwal asesmen ananda. Sesi pengerjaan hanya dapat dibuka melalui akun siswa.
 </p>
 ) : (
 <p>
 Setelah menekan tombol 'Mulai Ujian', penghitung waktu mundur akan berjalan langsung dan jawaban tersimpan secara otomatis di server sekolah.
 </p>
 )}
 </div>
 </div>
 )}
 </AppModal>
 </div>
 )
}
