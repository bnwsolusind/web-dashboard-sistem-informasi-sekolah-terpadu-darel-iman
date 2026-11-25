import { useMemo, useState, useEffect } from 'react'
import AppModal from '@/components/app/AppModal'
import KpiStatCard from '@/components/app/KpiStatCard'
import CustomSelect from '@/components/ui/CustomSelect'
import { motion, AnimatePresence } from 'framer-motion'
import {
 MessageSquare,
 User,
 Calendar,
 Tag,
 Search,
 CheckCircle2,
 AlertTriangle,
 Clock,
 Send,
 Loader2,
 School,
 Layers,
 Sparkles,
 FileCheck2,
 Check,
 X,
 ChevronRight,
 BookOpenCheck,
 RotateCw,
 Info,
} from 'lucide-react'
import {
 Card as HeroCard,
 Chip as HeroChip,
 Button as HeroButton,
 Modal as HeroModal,
 Tooltip as HeroTooltip,
 Checkbox as HeroCheckbox,
 Input as HeroInput,
} from '@heroui/react'
import { cn } from '../../lib/utils'
import api from '../../services/api'

// Dynamic category color themes (auto-matched by category name)
const getCategoryTheme = (rawCategory = '') => {
 const c = String(rawCategory).toLowerCase().trim()
 if (c.includes('tahfizh') || c.includes('quran')) {
 return {
 label: 'Tahfizh',
 badge: 'bg-emerald-100 text-emerald-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60',
 dot: 'bg-emerald-500',
 borderLeft: 'border-l-4 border-l-emerald-500',
 topBar: 'bg-white dark:bg-[#1B2433]',
 iconBg: 'bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300',
 heroChipColor: 'success',
 }
 }
 if (c.includes('akademik') || c.includes('belajar') || c.includes('pelajaran')) {
 return {
 label: 'Akademik',
 badge: 'bg-blue-100 text-blue-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-blue-950 dark:text-blue-300 dark:border-emerald-800/60',
 dot: 'bg-blue-500',
 borderLeft: 'border-l-4 border-l-blue-500',
 topBar: 'bg-white dark:bg-[#1B2433]',
 iconBg: 'bg-white dark:bg-[#1B2433]',
 heroChipColor: 'primary',
 }
 }
 if (c.includes('ibadah') || c.includes('sholat') || c.includes('adab')) {
 return {
 label: 'Ibadah',
 badge: 'bg-amber-100 text-amber-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950 dark:text-amber-300 dark:border-emerald-800/60',
 dot: 'bg-amber-500',
 borderLeft: 'border-l-4 border-l-amber-500',
 topBar: 'bg-white dark:bg-[#1B2433]',
 iconBg: 'bg-white dark:bg-[#1B2433]',
 heroChipColor: 'warning',
 }
 }
 if (c.includes('kedisiplinan') || c.includes('tata tertib') || c.includes('kehadiran')) {
 return {
 label: 'Kedisiplinan',
 badge: 'bg-sky-100 text-sky-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-sky-950 dark:text-sky-300 dark:border-emerald-800/60',
 dot: 'bg-sky-500',
 borderLeft: 'border-l-4 border-l-sky-500',
 topBar: 'bg-white dark:bg-[#1B2433]',
 iconBg: 'bg-white dark:bg-[#1B2433]',
 heroChipColor: 'primary',
 }
 }
 if (c.includes('konseling') || c.includes('bk') || c.includes('bimbingan')) {
 return {
 label: 'Konseling',
 badge: 'bg-violet-100 text-violet-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-violet-950 dark:text-violet-300 dark:border-emerald-800/60',
 dot: 'bg-violet-500',
 borderLeft: 'border-l-4 border-l-violet-500',
 topBar: 'bg-white dark:bg-[#1B2433]',
 iconBg: 'bg-white dark:bg-[#1B2433]',
 heroChipColor: 'secondary',
 }
 }
 if (c.includes('perilaku') || c.includes('karakter') || c.includes('akhlak')) {
 return {
 label: 'Perilaku',
 badge: 'bg-purple-100 text-purple-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-purple-950 dark:text-purple-300 dark:border-emerald-800/60',
 dot: 'bg-purple-500',
 borderLeft: 'border-l-4 border-l-purple-500',
 topBar: 'bg-white dark:bg-[#1B2433]',
 iconBg: 'bg-white dark:bg-[#1B2433]',
 heroChipColor: 'secondary',
 }
 }
 if (c.includes('prestasi') || c.includes('lomba') || c.includes('juara')) {
 return {
 label: 'Prestasi',
 badge: 'bg-rose-100 text-rose-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950 dark:text-rose-300 dark:border-emerald-800/60',
 dot: 'bg-rose-500',
 borderLeft: 'border-l-4 border-l-rose-500',
 topBar: 'bg-white dark:bg-[#1B2433]',
 iconBg: 'bg-white dark:bg-[#1B2433]',
 heroChipColor: 'danger',
 }
 }
 if (c.includes('kesehatan') || c.includes('uks')) {
 return {
 label: 'Kesehatan',
 badge: 'bg-indigo-100 text-indigo-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-indigo-950 dark:text-indigo-300 dark:border-emerald-800/60',
 dot: 'bg-indigo-500',
 borderLeft: 'border-l-4 border-l-indigo-500',
 topBar: 'bg-white dark:bg-[#1B2433]',
 iconBg: 'bg-white dark:bg-[#1B2433]',
 heroChipColor: 'primary',
 }
 }
 return {
 label: rawCategory || '-',
 badge: 'bg-teal-100 text-teal-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-teal-950 dark:text-teal-300 dark:border-emerald-800/60',
 dot: 'bg-teal-500',
 borderLeft: 'border-l-4 border-l-teal-500',
 topBar: 'bg-white dark:bg-[#1B2433]',
 iconBg: 'bg-white dark:bg-[#1B2433]',
 heroChipColor: 'success',
 }
}

const formatDate = (val) => {
 if (!val) return '-'
 try {
 return new Intl.DateTimeFormat('id-ID', {
 dateStyle: 'medium',
 timeStyle: 'short',
 }).format(new Date(val))
 } catch {
 return val
 }
}

export default function TeacherCommentsWorkspace({
 comments = [],
 loading = false,
 childId,
 isParent = false,
 onSigned,
 student = null,
}) {
 const [draftSearch, setDraftSearch] = useState('')
 const [search, setSearch] = useState('')
 const [selectedCategory, setSelectedCategory] = useState('all')
 const [selectedStatus, setSelectedStatus] = useState('all') // 'all' | 'unsigned' | 'signed'
 const [activeModalItem, setActiveModalItem] = useState(null)
 const [followUp, setFollowUp] = useState('')
 const [submitting, setSubmitting] = useState(false)
 const [submitError, setSubmitError] = useState('')
 const [agreedSignature, setAgreedSignature] = useState(false)

 // Debounced search (350ms)
 useEffect(() => {
 const timer = setTimeout(() => setSearch(draftSearch), 350)
 return () => clearTimeout(timer)
 }, [draftSearch])

 const safeComments = useMemo(() => {
 if (Array.isArray(comments)) return comments
 if (comments && Array.isArray(comments.data)) return comments.data
 if (comments && Array.isArray(comments.data?.data)) return comments.data.data
 return []
 }, [comments])

 // Extract distinct categories dynamically from database records (zero hardcoding)
 const availableCategories = useMemo(() => {
 const set = new Set()
 safeComments.forEach((item) => {
 const cat = (item.category || item.kategori || '').trim()
 if (cat) set.add(cat)
 })
 return Array.from(set).sort()
 }, [safeComments])

 // Real-time statistics from data
 const stats = useMemo(() => {
 let signedCount = 0
 let unsignedCount = 0

 safeComments.forEach((item) => {
 const isSigned = item.signature_status === 'signed' || (item.signed_by_user_id && item.signed_at)
 if (isSigned) signedCount++
 else unsignedCount++
 })

 return {
 total: safeComments.length,
 signedCount,
 unsignedCount,
 categoryCount: availableCategories.length,
 }
 }, [safeComments, availableCategories])

 // Dynamic filter tabs
 const filterTabs = useMemo(() => {
 const tabs = [
 { id: 'all', label: 'Semua Catatan', count: safeComments.length },
 { id: 'unsigned', label: 'Menunggu Tanggapan', count: stats.unsignedCount },
 { id: 'signed', label: 'Sudah Ditandatangani', count: stats.signedCount },
 ]

 availableCategories.forEach((cat) => {
 const count = safeComments.filter((item) => {
 const itemCat = (item.category || item.kategori || '').toLowerCase()
 return itemCat === cat.toLowerCase()
 }).length
 tabs.push({ id: `cat_${cat}`, label: cat, count })
 })

 return tabs
 }, [safeComments, stats, availableCategories])

 // Filtered comments
 const filteredComments = useMemo(() => {
 return safeComments.filter((item) => {
 const note = (item.content || item.note || item.notes || item.catatan || '').toLowerCase()
 const title = (item.title || item.judul || '').toLowerCase()
 const teacher = (item.teacher?.full_name || item.teacher?.nama_lengkap || item.teacher?.name || '').toLowerCase()
 const category = (item.category || item.kategori || '').toLowerCase()
 const followUpText = (item.follow_up || '').toLowerCase()
 const isSigned = item.signature_status === 'signed' || Boolean(item.signed_by_user_id && item.signed_at)

 // Tab filter
 if (selectedStatus === 'unsigned' && isSigned) return false
 if (selectedStatus === 'signed' && !isSigned) return false
 if (selectedStatus.startsWith('cat_')) {
 const targetCat = selectedStatus.replace('cat_', '').toLowerCase()
 if (category !== targetCat) return false
 }

 // Dropdown category filter
 if (selectedCategory !== 'all' && category !== selectedCategory.toLowerCase()) {
 return false
 }

 // Search query
 if (search.trim()) {
 const q = search.toLowerCase()
 if (
 !note.includes(q) &&
 !title.includes(q) &&
 !teacher.includes(q) &&
 !category.includes(q) &&
 !followUpText.includes(q)
 ) {
 return false
 }
 }

 return true
 })
 }, [safeComments, selectedStatus, selectedCategory, search])

 const resetFilters = () => {
 setDraftSearch('')
 setSearch('')
 setSelectedStatus('all')
 setSelectedCategory('all')
 }

 const handleOpenModal = (item) => {
 setActiveModalItem(item)
 setFollowUp(item.follow_up || '')
 setAgreedSignature(Boolean(item.signature_status === 'signed'))
 setSubmitError('')
 }

 const signNote = async (item) => {
 if (!childId || submitting) return
 setSubmitting(true)
 setSubmitError('')
 try {
 await api.post(`/portal/student-notes/${item.id}/sign`, {
 child_id: childId,
 ...(followUp.trim() ? { follow_up: followUp.trim() } : {}),
 })
 setActiveModalItem(null)
 setFollowUp('')
 await onSigned?.()
 } catch (error) {
 setSubmitError(error?.response?.data?.message || 'Catatan belum berhasil ditandatangani.')
 } finally {
 setSubmitting(false)
 }
 }

 if (loading) {
 return (
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-12 text-center shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
 <div className="flex flex-col items-center justify-center p-0">
 <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
 <Loader2 className="h-7 w-7 animate-spin" />
 </div>
 <h3 className="mt-4 text-base font-black text-slate-800 dark:text-white">Memuat Buku Penghubung...</h3>
 <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
 Sinkronisasi catatan pembinaan guru, perkembangan karakter, dan tanda tangan buku penghubung.
 </p>
 </div>
 </div>
 )
 }

 return (
 <div className="space-y-5">
 {/* 1. HERO UI MODERN HERO HEADER CARD */}
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-gradient-to-br from-[#E6F8F3] via-white to-[#F0FDF9] dark:from-emerald-950/40 dark:via-[#1B2433] dark:to-teal-950/30 p-5 sm:p-6 shadow-md shadow-emerald-500/10">
 <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-center p-0 bg-transparent">
 <div className="flex items-center gap-3.5">
 <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 border border-emerald-500/30">
 <BookOpenCheck className="h-6 w-6" />
 </span>
 <div>
 <div className="flex flex-wrap items-center gap-2">
 <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
 Buku Penghubung & Catatan Guru
 </h2>
 {student?.unit_name && (
 <span
 className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold text-xs inline-flex items-center gap-1 bg-emerald-500/15 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300"
 >
 <School className="h-3 w-3 text-emerald-600 dark:text-emerald-400 mr-1 inline" />
 {student.unit_name}
 </span>
 )}
 {(student?.kelas?.nama_kelas || student?.kelas?.name) && (
 <span
 className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold text-xs inline-flex items-center gap-1 bg-teal-500/15 border border-emerald-200/80 dark:border-emerald-800/60 text-teal-800 dark:text-teal-300"
 >
 <Layers className="h-3 w-3 text-teal-600 mr-1 inline" />
 {student?.kelas?.nama_kelas || student?.kelas?.name}
 </span>
 )}
 <span
 className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold text-[10px] inline-flex items-center gap-1 bg-blue-500/15 border border-emerald-200/80 dark:border-emerald-800/60 text-blue-800 dark:text-blue-300"
 >
 <Sparkles className="h-3 w-3 text-blue-600 mr-1 inline" />
 {isParent ? 'Portal Wali Murid' : 'Portal Siswa'}
 </span>
 </div>
 <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 font-medium max-w-xl">
 Media resmi komunikasi pembinaan perkembangan siswa antara dewan guru, wali kelas, musyrif, dan orang tua santri.
 </p>
 </div>
 </div>

 {/* Quick Metrics KPI Counters using HeroChip */}
 <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
 <span
 className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold text-xs bg-white/85 dark:bg-slate-800/85 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs"
 >
 <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 font-black text-xs mr-1.5 dark:bg-emerald-950 dark:text-emerald-300">
 {stats.total}
 </span>
 <span className="text-slate-700 dark:text-slate-200">Total Catatan</span>
 </span>
 <span
 className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold text-xs bg-white/85 dark:bg-slate-800/85 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs"
 >
 <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-teal-100 text-teal-700 font-black text-xs mr-1.5 dark:bg-teal-950 dark:text-teal-300">
 {stats.signedCount}
 </span>
 <span className="text-slate-700 dark:text-slate-200">Ditandatangani</span>
 </span>
 {stats.unsignedCount > 0 && (
 <span
 className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold text-xs bg-amber-50/90 dark:bg-amber-950/40 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs text-amber-800 dark:text-amber-300"
 >
 <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-amber-100 text-amber-800 font-black text-xs mr-1.5 dark:bg-amber-900/60 dark:text-amber-300">
 {stats.unsignedCount}
 </span>
 Perlu Respon
 </span>
 )}
 </div>
 </div>
 </div>

 {/* 2. MASTER KPI STATS GRID */}
 <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
 <KpiStatCard
 icon={MessageSquare}
 title="Total Catatan"
 value={stats.total}
 description="Komunikasi & pembinaan"
 tone="emerald"
 />
 <KpiStatCard
 icon={CheckCircle2}
 title="Telah Disetujui"
 value={stats.signedCount}
 description="Ditandatangani orang tua"
 tone="teal"
 />
 <KpiStatCard
 icon={Clock}
 title="Menunggu Respon"
 value={stats.unsignedCount}
 description="Perlu tanggapan orang tua"
 tone="amber"
 />
 <KpiStatCard
 icon={Tag}
 title="Bidang Pembinaan"
 value={stats.categoryCount}
 description="Ragam kategori catatan guru"
 tone="blue"
 />
 </div>

 {/* 3. FILTER, SEARCH & STATUS TABS CONTAINER (GOLD STANDARD) */}
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-4 sm:p-5 shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]" aria-label="Filter dan Pencarian Catatan">
 <div className="p-0 bg-transparent space-y-4">
 <div className="flex flex-col gap-3 lg:flex-row">
 {/* Search Bar with Debounce */}
 <div className="relative flex-1">
 <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-emerald-600 dark:text-emerald-400 z-10 pointer-events-none" />
 <input
 type="text"
 value={draftSearch}
 onChange={(e) => setDraftSearch(e.target.value)}
 placeholder="Cari isi catatan, judul, nama guru, atau tindak lanjut..."
 className="h-11 w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-slate-50/70 pl-10 pr-4 text-xs font-medium outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/15 dark:border-emerald-800/60 dark:bg-slate-800 dark:focus:bg-slate-900 text-slate-800 dark:text-white"
 />
 </div>

 {/* Kategori Dropdown */}
 <CustomSelect
 aria-label="Pilih Kategori"
 value={selectedCategory}
 onChange={(e) => setSelectedCategory(e.target.value)}
 className="h-11 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 px-3.5 text-xs font-bold text-slate-700 outline-none transition-all focus:border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
 >
 <option value="all">Semua Kategori ({availableCategories.length})</option>
 {availableCategories.map((cat) => (
 <option key={cat} value={cat}>
 {cat}
 </option>
 ))}
 </CustomSelect>

 {/* Reset Button using HeroButton */}
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

 {/* Dynamic Category & Status Filter Tab Pills (100% data-driven with HeroButton & HeroChip) */}
 <div className="flex flex-wrap items-center gap-2 border-t border-emerald-200/80 dark:border-emerald-800/60 pt-3.5 dark:border-emerald-800/60">
 {filterTabs.map(({ id, label, count }) => {
 const isActive = selectedStatus === id
 return (
 <HeroButton
 key={id}
 size="sm"
 onPress={() => setSelectedStatus(id)}
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
 </div>
 </div>

 {/* 4. COMMENTS LIST CARDS USING HERO UI CARDS */}
 <div className="space-y-4">
 {filteredComments.map((item, idx) => {
 const theme = getCategoryTheme(item.category || item.kategori)
 const teacherName = item.teacher?.full_name || item.teacher?.nama_lengkap || item.teacher?.name || '-'
 const teacherSubject = item.teacher?.subject?.name || item.subject?.name || '-'
 const noteTitle = item.title || item.judul || '-'
 const noteContent = item.content || item.note || item.notes || item.catatan || 'Tidak ada isi catatan.'
 const isSigned = item.signature_status === 'signed' || Boolean(item.signed_by_user_id && item.signed_at)
 const isStale = item.signature_status === 'signed_updated' || Boolean(item.signature_stale)

 return (
 <motion.div key={item.id || idx} whileHover={{ y: -2 }}>
 <div
 className={cn(
 'relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 transition-all hover:border-emerald-400 dark:hover:border-emerald-600 dark:bg-[#1B2433]',
 theme.borderLeft
 )}
 >
 {/* Top Accent Gradient Bar */}
 <div className={cn('h-1.5 w-full shrink-0', theme.topBar)} />

 {/* Card Header: Teacher Profile, Category & Signature Status */}
 <div className="flex flex-wrap items-start justify-between gap-3 border-b border-emerald-500/20 p-5 pb-3.5 bg-emerald-500/10 dark:border-emerald-800/60 dark:bg-emerald-950/20">
 <div className="flex items-center gap-3">
 <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-xs ring-2 ring-white/80 dark:ring-slate-800', theme.iconBg)}>
 <User className="h-5 w-5" />
 </span>
 <div>
 <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
 {teacherName}
 </h4>
 <p className="text-xs font-semibold text-slate-400 mt-0.5">
 {teacherSubject}
 </p>
 </div>
 </div>

 <div className="flex flex-wrap items-center gap-2">
 <span
 className={cn('font-black text-xs inline-flex items-center gap-1.5 border', theme.badge)}
  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold bg-emerald-100/90 text-emerald-800 border border-emerald-300/80 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700/80">
 <span className={cn('h-1.5 w-1.5 rounded-full inline-block mr-1', theme.dot)} />
 {item.category || item.kategori || '-'}
 </span>

 <span
 color={isSigned ? 'success' : isStale ? 'warning' : 'danger'}
 className={cn(
 'font-black text-[10px] inline-flex items-center gap-1 border',
 isSigned
 ? 'bg-emerald-100 text-emerald-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60'
 : isStale
 ? 'bg-amber-100 text-amber-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950 dark:text-amber-300 dark:border-emerald-800/60'
 : 'bg-rose-100 text-rose-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950 dark:text-rose-300 dark:border-emerald-800/60'
 )}
 >
 {isSigned ? (
 <>
 <CheckCircle2 className="h-3 w-3 text-emerald-600 inline mr-1" />
 Disetujui
 </>
 ) : isStale ? (
 <>
 <RotateCw className="h-3 w-3 text-amber-600 inline mr-1" />
 Perlu Tanda Tangan Ulang
 </>
 ) : (
 <>
 <Clock className="h-3 w-3 text-rose-600 inline mr-1" />
 Menunggu Tanggapan
 </>
 )}
 </span>

 <span className="text-xs font-bold text-slate-400">
 {formatDate(item.date || item.created_at)}
 </span>
 </div>
 </div>

 {/* Card Content: Title & Note Body */}
 <div className="p-5 space-y-3 bg-white dark:bg-slate-900">
 <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
 {noteTitle}
 </h3>
 <div className="rounded-xl border border-emerald-200/80 bg-slate-50/70 p-4 text-xs font-medium leading-relaxed text-slate-700 dark:border-emerald-800/60 dark:bg-slate-800/40 dark:text-slate-200 whitespace-pre-wrap">
 {noteContent}
 </div>

 {/* Follow-up / Parent Response (if available) */}
 {item.follow_up && (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] p-4 text-xs dark:border-emerald-800/60 dark:bg-emerald-950/20">
 <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold mb-1">
 <FileCheck2 className="h-4 w-4 text-emerald-600" />
 <span>Tindak Lanjut & Tanggapan Orang Tua:</span>
 </div>
 <p className="text-emerald-800 dark:text-emerald-300 italic whitespace-pre-wrap leading-relaxed">
 "{item.follow_up}"
 </p>
 </div>
 )}
 </div>

 {/* Card Footer: Action Bar */}
 <div className="flex flex-wrap items-center justify-between gap-3 border-t border-emerald-200/80 bg-slate-50/60 p-5 py-3.5 dark:border-emerald-800/60 dark:bg-slate-900/60">
 <div className="text-xs text-slate-400">
 {isSigned ? (
 <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
 <Check className="h-3.5 w-3.5" /> Telah ditandatangani oleh Wali Murid
 </span>
 ) : (
 <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold">
 <Clock className="h-3.5 w-3.5" /> Menunggu konfirmasi tanda tangan orang tua
 </span>
 )}
 </div>

 <HeroTooltip>
 <HeroTooltip.Trigger>
 <HeroButton
 size="sm"
 onPress={() => handleOpenModal(item)}
 className={cn(
 'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95',
 !isSigned && isParent
 ? 'bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:text-white shadow-sm hover:from-emerald-700 hover:to-teal-700'
 : 'border border-emerald-200/80 dark:border-emerald-800/60 bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700 dark:border-emerald-700/80 dark:bg-emerald-950/60 dark:text-emerald-300'
 )}
 >
 {!isSigned && isParent ? (
 <>
 <Send className="h-3.5 w-3.5" /> Tanggapi & Tanda Tangan
 </>
 ) : (
 <>
 <FileCheck2 className="h-3.5 w-3.5 text-emerald-600" /> Rincian Lembar Tanda Tangan
 </>
 )}
 </HeroButton>
 </HeroTooltip.Trigger>
 <HeroTooltip.Content className="z-50 rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 {!isSigned && isParent ? 'Isi tanggapan dan tanda tangani catatan guru' : 'Lihat detail dan histori tanda tangan'}
 </HeroTooltip.Content>
 </HeroTooltip>
 </div>
 </div>
 </motion.div>
 )
 })}

 {/* Empty State when no notes found */}
 {!filteredComments.length && (
 <div className="py-16 text-center rounded-[22px] border-2 border-dashed border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/30 p-8 dark:bg-slate-900/40">
 <div className="flex flex-col items-center justify-center p-0">
 <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
 <MessageSquare className="h-7 w-7" />
 </div>
 <h4 className="mt-3 text-sm font-black text-slate-800 dark:text-white">Tidak Ada Catatan Buku Penghubung</h4>
 <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
 Belum ada catatan buku penghubung guru yang sesuai dengan kriteria filter atau kata kunci pencarian.
 </p>
 <HeroButton
 size="sm"
 onPress={resetFilters}
 className="mt-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 font-bold text-emerald-700 hover:bg-emerald-50 bg-white dark:bg-slate-800 dark:border-emerald-800/60 dark:text-emerald-300 cursor-pointer"
 >
 Reset Filter
 </HeroButton>
 </div>
 </div>
 )}
 </div>

 {/* 5. HERO UI MODAL FOR TANGGAPI & DETAIL MODAL */}
 {activeModalItem && (() => {
 const modalTheme = getCategoryTheme(activeModalItem.category || activeModalItem.kategori)
 const modalTeacher = activeModalItem.teacher?.full_name || activeModalItem.teacher?.nama_lengkap || activeModalItem.teacher?.name || '-'
 const isModalSigned = activeModalItem.signature_status === 'signed' || Boolean(activeModalItem.signed_by_user_id && activeModalItem.signed_at)

 return (
 <AppModal
 isOpen={Boolean(activeModalItem)}
 onClose={() => { if (!submitting) setActiveModalItem(null) }}
 disableBackdropClose={submitting}
 hideCloseButton={submitting}
 title={activeModalItem?.title || activeModalItem?.judul || '-'}
 description={`Guru: ${modalTeacher} · Tanggal: ${formatDate(activeModalItem?.date || activeModalItem?.created_at)}`}
 badge={`${activeModalItem?.category || activeModalItem?.kategori || '-'} · ${isModalSigned ? 'Disetujui Orang Tua' : 'Menunggu Tanggapan'}`}
 icon={BookOpenCheck}
 maxWidth="max-w-xl"
 zIndex="z-[70]"
 footer={
 <div className="flex w-full items-center justify-between gap-2.5">
 <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
 Dareliman Edu {student?.unit_name ? `· ${student.unit_name}` : ''}
 </span>
 <button
 type="button"
 onClick={() => setActiveModalItem(null)}
 className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
 >
 Tutup
 </button>
 </div>
 }
 >
 {activeModalItem && (
 <div className="space-y-4 text-slate-700 dark:text-slate-200">
 {/* Error Banner if any */}
 {submitError && (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 p-3 text-xs font-bold text-rose-700 dark:border-emerald-800/60 dark:bg-rose-950/50 dark:text-rose-300">
 {submitError}
 </div>
 )}

 {/* Catatan Guru */}
 <div className="rounded-xl border border-emerald-200/80 bg-slate-50/70 p-4.5 dark:border-emerald-800/60 dark:bg-slate-800/40">
 <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
 Uraian Catatan Pembinaan Guru:
 </p>
 <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
 {activeModalItem.content || activeModalItem.note || activeModalItem.notes || activeModalItem.catatan || 'Tidak ada uraian.'}
 </p>
 </div>

 {/* Section Tanggapan / Tindak Lanjut */}
 {isModalSigned ? (
 <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 p-4.5 dark:border-emerald-800/60 dark:bg-emerald-950/20">
 <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs mb-1.5">
 <CheckCircle2 className="h-4 w-4 text-emerald-600" />
 <span>Tanggapan & Tanda Tangan Telah Diberikan:</span>
 </div>
 <p className="text-xs text-emerald-900 dark:text-emerald-200 italic leading-relaxed whitespace-pre-wrap">
 {activeModalItem.follow_up ? `"${activeModalItem.follow_up}"` : 'Telah dikonfirmasi dan disetujui oleh wali murid.'}
 </p>
 <p className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
 Ditandatangani pada: {formatDate(activeModalItem.signed_at)}
 </p>
 </div>
 ) : isParent ? (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 bg-emerald-50/20 p-4.5 dark:border-emerald-800/60 dark:bg-slate-900/40 space-y-3">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
 Tindak Lanjut & Tanggapan Orang Tua (Opsional):
 </label>
 <textarea
 rows={3}
 value={followUp}
 onChange={(e) => setFollowUp(e.target.value)}
 placeholder="Tuliskan respon, apresiasi, atau komitmen tindak lanjut pembinaan di rumah..."
 className="w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-white p-3 text-xs font-medium text-slate-800 outline-none transition-all focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-white"
 />

 {/* Digital Agreement with HeroCheckbox */}
 <div className="pt-1">
 <HeroCheckbox
 isSelected={agreedSignature}
 onChange={(e) => setAgreedSignature(e.target.checked)}
 className="text-xs font-bold text-slate-700 dark:text-slate-300"
 >
 Saya sebagai orang tua/wali murid telah membaca, memahami, dan menyetujui lembar catatan buku penghubung ananda.
 </HeroCheckbox>
 </div>

 {/* Action Submit with HeroButton */}
 <div className="flex items-center justify-end gap-2 pt-2">
 <HeroButton
 size="sm"
 onPress={() => setActiveModalItem(null)}
 disabled={submitting}
 className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 cursor-pointer"
 >
 Batal
 </HeroButton>
 <HeroButton
 size="sm"
 onPress={() => signNote(activeModalItem)}
 disabled={submitting || !agreedSignature}
 className={cn(
 'inline-flex items-center gap-2 rounded-xl px-4.5 py-2 text-xs font-black text-white shadow-md transition-all cursor-pointer',
 agreedSignature && !submitting
 ? 'bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:text-white shadow-sm hover:scale-[1.02]'
 : 'bg-slate-400 opacity-60 cursor-not-allowed'
 )}
 >
 {submitting ? (
 <>
 <Loader2 className="h-3.5 w-3.5 animate-spin" /> Menyimpan Tanda Tangan...
 </>
 ) : (
 <>
 <Send className="h-3.5 w-3.5" /> Setujui & Tanda Tangani
 </>
 )}
 </HeroButton>
 </div>
 </div>
 ) : (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50 p-3 text-xs font-medium text-amber-800 dark:border-emerald-800/60 dark:bg-amber-950/40 dark:text-amber-300">
 Catatan ini menunggu tanggapan dan persetujuan dari akun orang tua/wali murid ananda.
 </div>
 )}
 </div>
 )}
 </AppModal>
 )
 })()}
 </div>
 )
}
