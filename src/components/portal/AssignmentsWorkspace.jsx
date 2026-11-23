import { useMemo, useState, useEffect } from 'react'
import CustomSelect from '@/components/ui/CustomSelect'
import { motion, AnimatePresence } from 'framer-motion'
import {
 ClipboardList,
 Clock,
 CheckCircle2,
 AlertTriangle,
 FileUp,
 Send,
 Loader2,
 Award,
 User,
 BookOpen,
 ExternalLink,
 Paperclip,
 FileText,
 X,
 Link as LinkIcon,
 Eye,
 Sparkles,
 Check,
 Globe,
 Video,
 Music,
 School,
 Layers,
 Search,
 RotateCw,
 MessageSquare,
 CalendarDays,
 Tag,
 Star,
 Users,
 Info,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import InAppEmbedViewerModal from './InAppEmbedViewerModal'

// Task type visual configurations (100% dynamic, rich colorful palette)
const taskTypeThemes = {
 tahfizh: {
 label: "Setoran Tahfizh Al-Qur'an",
 badge: 'bg-emerald-100 text-emerald-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/60',
 iconBg: 'bg-white dark:bg-[#1B2433] shadow-sm',
 topBar: 'bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:text-white',
 borderLeft: 'border-l-4 border-l-emerald-500',
 Icon: BookOpen,
 desc: 'Setoran langsung di hadapan guru/ustadz, rekaman audio, atau tautan video.',
 },
 quiz: {
 label: 'Kuis Online CBT',
 badge: 'bg-purple-100 text-purple-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-purple-950/80 dark:text-purple-300 dark:border-emerald-800/60',
 iconBg: 'bg-white dark:bg-[#1B2433] shadow-sm',
 topBar: 'bg-white dark:bg-[#1B2433]',
 borderLeft: 'border-l-4 border-l-purple-500',
 Icon: Sparkles,
 desc: 'Pengerjaan butir soal interaktif atau evaluasi pemahaman materi.',
 },
 kuis: {
 label: 'Kuis Online CBT',
 badge: 'bg-purple-100 text-purple-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-purple-950/80 dark:text-purple-300 dark:border-emerald-800/60',
 iconBg: 'bg-white dark:bg-[#1B2433] shadow-sm',
 topBar: 'bg-white dark:bg-[#1B2433]',
 borderLeft: 'border-l-4 border-l-purple-500',
 Icon: Sparkles,
 desc: 'Pengerjaan butir soal interaktif atau evaluasi pemahaman materi.',
 },
 esai: {
 label: 'Tugas Esai Mendalam',
 badge: 'bg-blue-100 text-blue-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-blue-950/80 dark:text-blue-300 dark:border-emerald-800/60',
 iconBg: 'bg-white dark:bg-[#1B2433] shadow-sm',
 topBar: 'bg-white dark:bg-[#1B2433]',
 borderLeft: 'border-l-4 border-l-blue-500',
 Icon: FileText,
 desc: 'Tuliskan esai teks panjang sesuai instruksi dan topik pembelajaran.',
 },
 dokumen: {
 label: 'Unggah Dokumen',
 badge: 'bg-rose-100 text-rose-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/80 dark:text-rose-300 dark:border-emerald-800/60',
 iconBg: 'bg-white dark:bg-[#1B2433] shadow-sm',
 topBar: 'bg-white dark:bg-[#1B2433]',
 borderLeft: 'border-l-4 border-l-rose-500',
 Icon: FileUp,
 desc: 'Unggah berkas PDF/DOCX atau lampirkan link Google Drive/Docs.',
 },
 praktik: {
 label: 'Tugas Praktik',
 badge: 'bg-amber-100 text-amber-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/80 dark:text-amber-300 dark:border-emerald-800/60',
 iconBg: 'bg-white dark:bg-[#1B2433] shadow-sm',
 topBar: 'bg-white dark:bg-[#1B2433]',
 borderLeft: 'border-l-4 border-l-amber-500',
 Icon: Award,
 desc: 'Praktik langsung, unjuk keterampilan, foto eksperimen, atau video demonstrasi.',
 },
 literasi: {
 label: 'Literasi & Resensi',
 badge: 'bg-teal-100 text-teal-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-teal-950/80 dark:text-teal-300 dark:border-emerald-800/60',
 iconBg: 'bg-white dark:bg-[#1B2433] shadow-sm',
 topBar: 'bg-white dark:bg-[#1B2433]',
 borderLeft: 'border-l-4 border-l-teal-500',
 Icon: BookOpen,
 desc: 'Membaca referensi terpilih, ringkasan materi, atau ulasan literasi buku.',
 },
 proyek: {
 label: 'Proyek Kelompok',
 badge: 'bg-indigo-100 text-indigo-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-emerald-800/60',
 iconBg: 'bg-white dark:bg-[#1B2433] shadow-sm',
 topBar: 'bg-white dark:bg-[#1B2433]',
 borderLeft: 'border-l-4 border-l-indigo-500',
 Icon: Users,
 desc: 'Penyusunan proyek kolaboratif terstruktur bersama anggota kelompok.',
 },
 tertulis: {
 label: 'Tugas Tertulis',
 badge: 'bg-sky-100 text-sky-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-sky-950/80 dark:text-sky-300 dark:border-emerald-800/60',
 iconBg: 'bg-white dark:bg-[#1B2433] shadow-sky-500/25',
 topBar: 'bg-white dark:bg-[#1B2433]',
 borderLeft: 'border-l-4 border-l-sky-500',
 Icon: ClipboardList,
 desc: 'Latihan soal tertulis, lembar kerja siswa, atau pengerjaan soal di buku tugas.',
 },
}

const getTaskTheme = (rawType = '') => {
 const t = String(rawType).toLowerCase().trim()
 return taskTypeThemes[t] || taskTypeThemes.tertulis
}

const getSubjectColor = (subjectName = '') => {
 const s = String(subjectName).toLowerCase()
 if (
 s.includes('agama') ||
 s.includes('pai') ||
 s.includes('tahfizh') ||
 s.includes('tahsin') ||
 s.includes('quran') ||
 s.includes('fiqih') ||
 s.includes('aqidah') ||
 s.includes('akhlak')
 ) {
 return {
 text: 'text-emerald-700 dark:text-emerald-300',
 pill: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/60',
 dot: 'bg-emerald-500',
 }
 }
 if (
 s.includes('matematika') ||
 s.includes('ipa') ||
 s.includes('fisika') ||
 s.includes('kimia') ||
 s.includes('biologi') ||
 s.includes('sains')
 ) {
 return {
 text: 'text-cyan-700 dark:text-cyan-300',
 pill: 'bg-cyan-50 text-cyan-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-cyan-950/70 dark:text-cyan-300 dark:border-emerald-800/60',
 dot: 'bg-cyan-500',
 }
 }
 if (
 s.includes('bahasa') ||
 s.includes('arab') ||
 s.includes('inggris') ||
 s.includes('indonesia')
 ) {
 return {
 text: 'text-purple-700 dark:text-purple-300',
 pill: 'bg-purple-50 text-purple-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-purple-950/70 dark:text-purple-300 dark:border-emerald-800/60',
 dot: 'bg-purple-500',
 }
 }
 if (
 s.includes('ips') ||
 s.includes('sejarah') ||
 s.includes('sosiologi') ||
 s.includes('geografi') ||
 s.includes('ekonomi')
 ) {
 return {
 text: 'text-amber-700 dark:text-amber-300',
 pill: 'bg-amber-50 text-amber-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/70 dark:text-amber-300 dark:border-emerald-800/60',
 dot: 'bg-amber-500',
 }
 }
 return {
 text: 'text-teal-700 dark:text-teal-300',
 pill: 'bg-teal-50 text-teal-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-teal-950/70 dark:text-teal-300 dark:border-emerald-800/60',
 dot: 'bg-teal-500',
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

export default function AssignmentsWorkspace({
 assignments = [],
 onSubmitAssignment,
 isParent = false,
 canSubmit = true,
 loading = false,
 student = null,
}) {
 const [draftSearch, setDraftSearch] = useState('')
 const [search, setSearch] = useState('')
 const [selectedSubject, setSelectedSubject] = useState('')
 const [selectedType, setSelectedType] = useState('all')
 const [activeTab, setActiveTab] = useState('all') // 'all' | 'pending' | 'submitted' | 'late' | 'graded'

 const [activeModal, setActiveModal] = useState(null)
 const [modalTab, setModalTab] = useState('instruksi') // 'instruksi' | 'jawaban' | 'kumpul'
 const [textAnswer, setTextAnswer] = useState('')
 const [selectedFile, setSelectedFile] = useState(null)
 const [submissionLink, setSubmissionLink] = useState('')
 const [submissionTahfizhMode, setSubmissionTahfizhMode] = useState('langsung')
 const [submissionGroupMembers, setSubmissionGroupMembers] = useState('')
 const [submitting, setSubmitting] = useState(false)
 const [message, setMessage] = useState('')

 // In-App Embed Viewer State
 const [embedModal, setEmbedModal] = useState({ isOpen: false, url: '', title: '' })

 const now = useMemo(() => new Date(), [])

 // Debounced search input (350ms) to prevent UI jitter
 useEffect(() => {
 const timer = setTimeout(() => setSearch(draftSearch), 350)
 return () => clearTimeout(timer)
 }, [draftSearch])

 const safeAssignments = useMemo(() => {
 if (Array.isArray(assignments)) return assignments
 if (assignments && Array.isArray(assignments.data)) return assignments.data
 if (assignments && Array.isArray(assignments.data?.data)) return assignments.data.data
 return []
 }, [assignments])

 // Extract distinct subjects and task types dynamically from data
 const subjects = useMemo(() => {
 const list = safeAssignments
 .map((item) => item.subject?.name || item.subject?.nama_mapel || item.mata_pelajaran)
 .filter(Boolean)
 return Array.from(new Set(list))
 }, [safeAssignments])

 const taskTypesInUse = useMemo(() => {
 const setTypes = new Set(
 safeAssignments.map((item) => item.jenis_tugas).filter(Boolean)
 )
 return Array.from(setTypes)
 }, [safeAssignments])

 // Comprehensive Real-time KPI Statistics
 const stats = useMemo(() => {
 let activeCount = 0
 let pendingCount = 0
 let lateCount = 0
 let gradedCount = 0
 let submittedCount = 0
 let totalScore = 0
 let gradedWithScoreCount = 0

 safeAssignments.forEach((item) => {
 const submission = item.pengumpulan_tugas?.[0]
 const isPastDeadline = item.deadline && new Date(item.deadline) < now

 if (!submission) {
 activeCount++
 if (isPastDeadline) lateCount++
 else pendingCount++
 } else {
 submittedCount++
 if (submission.nilai_guru != null) {
 gradedCount++
 const numericGrade = parseFloat(submission.nilai_guru)
 if (!isNaN(numericGrade)) {
 totalScore += numericGrade
 gradedWithScoreCount++
 }
 }
 if (submission.status === 'terlambat' || (!submission.nilai_guru && isPastDeadline)) {
 lateCount++
 }
 }
 })

 const averageGrade = gradedWithScoreCount > 0 ? (totalScore / gradedWithScoreCount).toFixed(1) : null

 return {
 total: safeAssignments.length,
 activeCount,
 pendingCount,
 lateCount,
 gradedCount,
 submittedCount,
 averageGrade,
 }
 }, [safeAssignments, now])

 // Filtered Assignments List
 const filteredAssignments = useMemo(() => {
 return safeAssignments.filter((item) => {
 const submission = item.pengumpulan_tugas?.[0]
 const isPastDeadline = item.deadline && new Date(item.deadline) < now

 // 1. Status Tab Filter
 if (activeTab === 'pending') {
 if (submission || isPastDeadline) return false
 } else if (activeTab === 'submitted') {
 if (!submission || submission.nilai_guru != null) return false
 } else if (activeTab === 'late') {
 const isLate = (submission && submission.status === 'terlambat') || (!submission && isPastDeadline)
 if (!isLate) return false
 } else if (activeTab === 'graded') {
 if (!submission || submission.nilai_guru == null) return false
 }

 // 2. Subject Filter
 if (selectedSubject) {
 const subName = item.subject?.name || item.subject?.nama_mapel || item.mata_pelajaran || ''
 if (subName !== selectedSubject) return false
 }

 // 3. Task Type Filter
 if (selectedType !== 'all') {
 const itemType = (item.jenis_tugas || '').toLowerCase()
 if (itemType !== selectedType.toLowerCase()) return false
 }

 // 4. Text Search Filter
 if (search.trim()) {
 const q = search.toLowerCase()
 const judul = (item.judul || '').toLowerCase()
 const deskripsi = (item.deskripsi || item.instruksi || '').toLowerCase()
 const guru = (item.teacher?.nama_lengkap || item.teacher?.name || '').toLowerCase()
 const subName = (item.subject?.name || item.subject?.nama_mapel || '').toLowerCase()
 const materiJudul = (item.materi?.judul || '').toLowerCase()

 if (
 !judul.includes(q) &&
 !deskripsi.includes(q) &&
 !guru.includes(q) &&
 !subName.includes(q) &&
 !materiJudul.includes(q)
 ) {
 return false
 }
 }

 return true
 })
 }, [safeAssignments, activeTab, selectedSubject, selectedType, search, now])

 const resetFilters = () => {
 setDraftSearch('')
 setSearch('')
 setSelectedSubject('')
 setSelectedType('all')
 setActiveTab('all')
 }

 const handleOpenModal = (item) => {
 setActiveModal(item)
 const hasSubmission = item.pengumpulan_tugas?.[0]
 if (hasSubmission) {
 setModalTab('jawaban')
 } else if (!isParent || canSubmit) {
 setModalTab('kumpul')
 } else {
 setModalTab('instruksi')
 }
 setTextAnswer('')
 setSelectedFile(null)
 setSubmissionLink('')
 setSubmissionGroupMembers('')
 setSubmissionTahfizhMode('langsung')
 setMessage('')
 }

 const handleSubmit = async (e) => {
 e.preventDefault()
 if (!activeModal) return
 setSubmitting(true)
 setMessage('')
 try {
 if (onSubmitAssignment) {
 await onSubmitAssignment(activeModal.id, {
 jawaban_teks: textAnswer,
 file_lampiran: selectedFile,
 url_link: submissionLink.trim() || undefined,
 link: submissionLink.trim() || undefined,
 metadata: {
 tahfizh_mode: activeModal.jenis_tugas === 'tahfizh' ? submissionTahfizhMode : undefined,
 group_members: submissionGroupMembers.trim() || undefined,
 jenis_tugas: activeModal.jenis_tugas,
 },
 })
 }
 setMessage('Tugas berhasil dikumpulkan!')
 setTimeout(() => {
 setActiveModal(null)
 setTextAnswer('')
 setSelectedFile(null)
 setSubmissionLink('')
 setSubmissionGroupMembers('')
 setSubmissionTahfizhMode('langsung')
 setMessage('')
 }, 1200)
 } catch (err) {
 setMessage(err.response?.data?.message || 'Pengumpulan tugas gagal.')
 } finally {
 setSubmitting(false)
 }
 }

 if (loading) {
 return (
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] p-12 text-center shadow-sm dark:border-emerald-800/60 dark:bg-slate-900">
 <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
 <Loader2 className="h-7 w-7 animate-spin" />
 </div>
 <h3 className="mt-4 text-base font-black text-slate-800 dark:text-white">Memuat Penugasan Pembelajaran...</h3>
 <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
 Sinkronisasi lembar soal, tenggat pengumpulan, dan nilai dari guru.
 </p>
 </div>
 )
 }

 return (
 <div className="space-y-5">
 {/* 1. HEROUI MODERN HERO HEADER CARD */}
 <header className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] p-5 sm:p-6 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
 <div className="flex items-center gap-3.5">
 <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-sm ring-4 ring-white/60 dark:ring-slate-800/80">
 <ClipboardList className="h-6 w-6" />
 </span>
 <div>
 <div className="flex flex-wrap items-center gap-2">
 <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
 Tugas & Penugasan Siswa
 </h2>
 {student?.unit_name && (
 <span className="inline-flex items-center gap-1 rounded-full border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-black text-emerald-800 dark:text-emerald-300">
 <School className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
 {student.unit_name}
 </span>
 )}
 {(student?.kelas?.nama_kelas || student?.kelas?.name) && (
 <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 dark:border-emerald-800/60 bg-teal-500/15 px-2.5 py-0.5 text-xs font-black text-teal-800 dark:text-teal-300">
 <Layers className="h-3 w-3 text-teal-600" />
 {student?.kelas?.nama_kelas || student?.kelas?.name}
 </span>
 )}
 {isParent && (
 <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-black text-amber-800 dark:text-amber-300">
 <Sparkles className="h-3 w-3 text-amber-600" />
 {canSubmit ? 'Mode Orang Tua (SD — Kirim Jawaban Aktif)' : 'Mode Monitoring Orang Tua (SMP/SMA)'}
 </span>
 )}
 </div>
 <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 font-medium max-w-xl">
 Pantau daftar penugasan aktif, tenggat waktu pengumpulan, lembar soal guru, serta evaluasi nilai dan catatan umpan balik ananda.
 </p>
 </div>
 </div>

 {/* Real-time KPI Summary Pill */}
 <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
 <div className="flex items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white/85 px-3.5 py-1.5 shadow-xs backdrop-blur-xs dark:border-emerald-800/60 dark:bg-slate-800/85">
 <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-black text-xs dark:bg-emerald-950 dark:text-emerald-300">
 {stats.total}
 </span>
 <span className="text-xs font-black text-slate-700 dark:text-slate-200">Total Tugas</span>
 </div>
 <div className="flex items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white/85 px-3.5 py-1.5 shadow-xs backdrop-blur-xs dark:border-emerald-800/60 dark:bg-slate-800/85">
 <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-100 text-teal-700 font-black text-xs dark:bg-teal-950 dark:text-teal-300">
 {stats.gradedCount}
 </span>
 <span className="text-xs font-black text-slate-700 dark:text-slate-200">Dinilai</span>
 </div>
 {stats.averageGrade && (
 <div className="flex items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white/85 px-3.5 py-1.5 shadow-xs backdrop-blur-xs dark:border-emerald-800/60 dark:bg-slate-800/85">
 <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
 <span className="text-xs font-black text-slate-800 dark:text-slate-200">
 Rata-rata: <span className="text-emerald-600 dark:text-emerald-400 font-black">{stats.averageGrade}</span>
 </span>
 </div>
 )}
 </div>
 </div>
 </header>

 {/* 2. MASTER KPI STATS GRID (4 COLORFUL CARDS) */}
 <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
 {/* Card 1: Total Tugas Diterbitkan */}
 <motion.div
 whileHover={{ y: -3 }}
 className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4 sm:p-5 shadow-sm transition-all hover:shadow-md dark:border-emerald-800/60 dark:bg-slate-900"
 >
 <div className="flex items-center justify-between">
 <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] text-emerald-700 dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-300 ring-1 ring-emerald-500/30">
 <ClipboardList className="h-5 w-5" />
 </span>
 <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</span>
 </div>
 <p className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">Tugas Diterbitkan</p>
 <p className="mt-0.5 text-xs text-slate-400">Total penugasan kurikulum</p>
 </motion.div>

 {/* Card 2: Menunggu Dikerjakan */}
 <motion.div
 whileHover={{ y: -3 }}
 className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4 sm:p-5 shadow-sm transition-all hover:shadow-md dark:border-emerald-800/60 dark:bg-slate-900"
 >
 <div className="flex items-center justify-between">
 <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] text-blue-700 dark:from-blue-950 dark:to-sky-950 dark:text-blue-300 ring-1 ring-blue-500/30">
 <Clock className="h-5 w-5" />
 </span>
 <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.pendingCount}</span>
 </div>
 <p className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">Belum Dikerjakan</p>
 <p className="mt-0.5 text-xs text-slate-400">Menunggu pengerjaan siswa</p>
 </motion.div>

 {/* Card 3: Terlambat / Lewat Waktu */}
 <motion.div
 whileHover={{ y: -3 }}
 className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4 sm:p-5 shadow-sm transition-all hover:shadow-md dark:border-emerald-800/60 dark:bg-slate-900"
 >
 <div className="flex items-center justify-between">
 <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] text-rose-700 dark:from-rose-950 dark:to-red-950 dark:text-rose-300 ring-1 ring-rose-500/30">
 <AlertTriangle className="h-5 w-5" />
 </span>
 <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.lateCount}</span>
 </div>
 <p className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">Melewati Tenggat</p>
 <p className="mt-0.5 text-xs text-slate-400">Melebihi batas deadline</p>
 </motion.div>

 {/* Card 4: Sudah Dinilai Guru */}
 <motion.div
 whileHover={{ y: -3 }}
 className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4 sm:p-5 shadow-sm transition-all hover:shadow-md dark:border-emerald-800/60 dark:bg-slate-900"
 >
 <div className="flex items-center justify-between">
 <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] text-teal-700 dark:from-teal-950 dark:to-emerald-950 dark:text-teal-300 ring-1 ring-teal-500/30">
 <CheckCircle2 className="h-5 w-5" />
 </span>
 <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.gradedCount}</span>
 </div>
 <p className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">Sudah Dinilai Guru</p>
 <p className="mt-0.5 text-xs text-slate-400">
 {stats.averageGrade ? `Rata-rata: ${stats.averageGrade}` : 'Dilengkapi umpan balik guru'}
 </p>
 </motion.div>
 </div>

 {/* 3. FILTER, SEARCH & STATUS TABS CONTAINER */}
 <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] p-4 sm:p-5 shadow-sm dark:border-emerald-800/60 dark:bg-slate-900" aria-label="Filter dan Pencarian Tugas">
 <div className="flex flex-col gap-3 lg:flex-row">
 {/* Full-width Search Bar with Debounce */}
 <label className="relative flex-1">
 <span className="sr-only">Cari tugas pembelajaran</span>
 <Search className="absolute left-4 top-3.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={draftSearch}
 onChange={(e) => setDraftSearch(e.target.value)}
 placeholder="Cari judul tugas, instruksi guru, mata pelajaran, atau materi..."
 className="h-11 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 pl-11 pr-4 text-xs font-medium outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/15 dark:border-emerald-800/60 dark:bg-slate-800 dark:focus:bg-slate-900"
 />
 </label>

 {/* Mata Pelajaran Dropdown */}
 <CustomSelect
 aria-label="Pilih Mata Pelajaran"
 value={selectedSubject}
 onChange={(e) => setSelectedSubject(e.target.value)}
 className="h-11 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 px-3.5 text-xs font-bold text-slate-700 outline-none transition-all focus:border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200"
 >
 <option value="">Semua Mapel ({subjects.length})</option>
 {subjects.map((sub) => (
 <option key={sub} value={sub}>
 {sub}
 </option>
 ))}
 </CustomSelect>

 {/* Jenis Tugas Dropdown */}
 <CustomSelect
 aria-label="Pilih Jenis Tugas"
 value={selectedType}
 onChange={(e) => setSelectedType(e.target.value)}
 className="h-11 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 px-3.5 text-xs font-bold text-slate-700 outline-none transition-all focus:border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200"
 >
 <option value="all">Semua Jenis Tugas ({taskTypesInUse.length})</option>
 {taskTypesInUse.map((t) => {
 const cfg = getTaskTheme(t)
 return (
 <option key={t} value={t}>
 {cfg.label}
 </option>
 )
 })}
 </CustomSelect>

 {/* Reset Button */}
 <Button
 variant="ghost"
 appearance="outline"
 size="sm"
 onClick={resetFilters}
 className="h-11 border border-emerald-200/80 dark:border-emerald-800/60 text-slate-500 hover:text-rose-600 hover:bg-rose-50 font-bold rounded-xl dark:border-emerald-700/80"
 >
 Reset
 </Button>
 </div>

 {/* Status Filter Tab Pills */}
 <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-emerald-200/80 dark:border-emerald-800/60 pt-3.5 dark:border-emerald-800/60">
 {[
 { id: 'all', label: 'Semua Tugas', count: safeAssignments.length, color: 'emerald' },
 { id: 'pending', label: 'Belum Dikerjakan', count: stats.pendingCount, color: 'blue' },
 { id: 'submitted', label: 'Sudah Dikumpulkan', count: stats.submittedCount - stats.gradedCount, color: 'sky' },
 { id: 'late', label: 'Terlambat', count: stats.lateCount, color: 'rose' },
 { id: 'graded', label: 'Sudah Dinilai', count: stats.gradedCount, color: 'teal' },
 ].map(({ id, label, count }) => {
 const isActive = activeTab === id
 return (
 <button
 key={id}
 type="button"
 onClick={() => setActiveTab(id)}
 className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
 isActive
 ? 'bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:text-white shadow-sm ring-2 ring-emerald-500/40 scale-[1.02]'
 : 'bg-slate-100/80 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 border border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/80'
 }`}
 >
 <span>{label}</span>
 <span
 className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-black ${
 isActive ? 'bg-white/20' : 'bg-black/10 text-slate-700 dark:bg-white/10 dark:text-slate-200'
 }`}
 >
 {count}
 </span>
 </button>
 )
 })}
 </div>
 </section>

 {/* 4. ASSIGNMENT CARDS GRID */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
 {filteredAssignments.map((item) => {
 const submission = item.pengumpulan_tugas?.[0]
 const isLate = item.deadline && new Date(item.deadline) < now
 const subjectColor = getSubjectColor(item.subject?.name || item.subject?.nama_mapel)
 const theme = getTaskTheme(item.jenis_tugas)
 const ThemeIcon = theme.Icon

 return (
 <motion.div
 key={item.id}
 whileHover={{ y: -3 }}
 className={`relative flex flex-col justify-between overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 shadow-sm transition-all hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg hover:shadow-sm dark:border-emerald-800/60 dark:bg-slate-900 ${theme.borderLeft}`}
 >
 {/* Top Accent Gradient Bar */}
 <div className={`absolute inset-x-0 top-0 h-1.5 ${theme.topBar}`} />

 <div>
 {/* Header Row: Subject, Task Type & Status Pill */}
 <div className="flex flex-wrap items-center justify-between gap-2">
 <div className="flex flex-wrap items-center gap-1.5">
 <span
 className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 text-xs font-bold ${subjectColor.pill}`}
 >
 <span className={`h-1.5 w-1.5 rounded-full ${subjectColor.dot}`} />
 {item.subject?.name || item.subject?.nama_mapel || '-'}
 </span>
 <span
 className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-bold ${theme.badge}`}
 >
 <ThemeIcon className="h-3 w-3" />
 {theme.label}
 </span>
 </div>

 {/* Submission Status Badge */}
 <span
 className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black border ${
 submission?.nilai_guru != null
 ? 'bg-emerald-100 text-emerald-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60'
 : submission
 ? 'bg-blue-100 text-blue-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-blue-950 dark:text-blue-300 dark:border-emerald-800/60'
 : isLate
 ? 'bg-rose-100 text-rose-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950 dark:text-rose-300 dark:border-emerald-800/60'
 : 'bg-amber-100 text-amber-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950 dark:text-amber-300 dark:border-emerald-800/60'
 }`}
 >
 {submission?.nilai_guru != null ? (
 <>
 <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Dinilai
 </>
 ) : submission ? (
 <>
 <Send className="h-3 w-3 text-blue-600" /> Dikumpulkan
 </>
 ) : isLate ? (
 <>
 <AlertTriangle className="h-3 w-3 text-rose-600" /> Terlambat
 </>
 ) : (
 <>
 <Clock className="h-3 w-3 text-amber-600" /> Aktif
 </>
 )}
 </span>
 </div>

 {/* Assignment Title */}
 <h3 className="mt-3 text-sm sm:text-base font-black text-slate-900 dark:text-white line-clamp-2 leading-snug">
 {item.judul}
 </h3>

 {/* Description snippet */}
 {(item.deskripsi || item.instruksi) ? (
 <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
 {item.deskripsi || item.instruksi}
 </p>
 ) : null}

 {/* Linked Materi Card (if exists) */}
 {item.materi && (
 <div className="mt-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] p-2.5 dark:border-emerald-800/60 dark:bg-emerald-950/20">
 <div className="flex items-center justify-between gap-2">
 <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300">
 <BookOpen className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
 <span className="line-clamp-1">{item.materi.judul}</span>
 </span>
 {item.materi.link && (
 <button
 type="button"
 onClick={() =>
 setEmbedModal({
 isOpen: true,
 url: item.materi.link,
 title: `Materi: ${item.materi.judul}`,
 })
 }
 className="inline-flex flex-shrink-0 items-center gap-1 text-xs font-black text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 hover:underline"
 >
 <Eye className="h-3 w-3" /> Buka
 </button>
 )}
 </div>
 {item.materi.ringkasan && (
 <p className="mt-1 line-clamp-1 text-xs text-emerald-800/80 dark:text-emerald-400/80">
 {item.materi.ringkasan}
 </p>
 )}
 </div>
 )}

 {/* Question attachment file preview pill */}
 {item.file_lampiran_url && (
 <div className="mt-2.5">
 <button
 type="button"
 onClick={() =>
 setEmbedModal({
 isOpen: true,
 url: item.file_lampiran_url,
 title: `Berkas Lembar Soal: ${item.judul}`,
 })
 }
 className="inline-flex items-center gap-1.5 rounded-lg border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300"
 >
 <FileUp className="h-3.5 w-3.5 text-emerald-600" />
 <span>Lembar Berkas Soal Guru</span>
 <Eye className="h-3 w-3 ml-1 text-emerald-500" />
 </button>
 </div>
 )}

 {/* Meta details: Deadline & Teacher */}
 <div className="mt-3 space-y-1.5 border-t border-emerald-200/80 pt-3 text-xs text-slate-600 dark:border-emerald-800/60 dark:text-slate-300">
 <div className="flex items-center gap-2">
 <Clock className={`h-3.5 w-3.5 ${isLate ? 'text-rose-500' : 'text-slate-400'}`} />
 <span className="text-xs">
 Tenggat:{' '}
 <b className={isLate ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}>
 {formatDate(item.deadline)}
 </b>
 </span>
 </div>
 <div className="flex items-center gap-2">
 <User className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
 <span className="text-xs">
 Guru: <b className="text-slate-800 dark:text-slate-200">{item.teacher?.nama_lengkap || item.teacher?.name || '-'}</b>
 </span>
 </div>
 </div>

 {/* Graded Box (when score available) */}
 {submission?.nilai_guru != null && (
 <div className="mt-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] p-3 text-xs dark:border-emerald-800/60 dark:bg-emerald-950/30">
 <div className="flex items-center justify-between font-bold text-emerald-900 dark:text-emerald-300">
 <span className="flex items-center gap-1.5">
 <Award className="h-4 w-4 text-emerald-600" /> Nilai Akhir
 </span>
 <span className="rounded-lg bg-emerald-600 px-2.5 py-0.5 text-sm font-black text-white shadow-xs">
 {submission.nilai_guru}
 </span>
 </div>
 {submission.catatan_guru && (
 <p className="mt-1.5 text-xs text-emerald-800 dark:text-emerald-300 line-clamp-2 italic">
 "{submission.catatan_guru}"
 </p>
 )}
 </div>
 )}
 </div>

 {/* Action Button at bottom */}
 <div className="mt-4 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60">
 {submission ? (
 <button
 type="button"
 onClick={() => handleOpenModal(item)}
 className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50 px-4 py-2.5 text-xs font-black text-emerald-800 hover:bg-emerald-100 transition-all shadow-xs dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300"
 >
 <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 <span>Lihat Rincian Tugas & Jawaban</span>
 </button>
 ) : (!isParent || canSubmit) ? (
 <button
 type="button"
 onClick={() => handleOpenModal(item)}
 className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:text-white px-4 py-2.5 text-xs font-black shadow-sm hover:from-emerald-700 hover:to-teal-700 transition-all"
 >
 <Send className="h-4 w-4" />
 <span>{isParent ? 'Kumpulkan Tugas (Ananda)' : 'Kumpulkan Tugas'}</span>
 </button>
 ) : (
 <button
 type="button"
 onClick={() => handleOpenModal(item)}
 className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 px-4 py-2.5 text-xs font-black text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all dark:border-emerald-700/80 dark:bg-emerald-950/60 dark:text-emerald-300"
 >
 <FileText className="h-4 w-4 text-emerald-600" />
 <span>Lihat Lembar Soal & Instruksi</span>
 </button>
 )}
 </div>
 </motion.div>
 )
 })}

 {/* Empty State when no assignments match filter */}
 {!filteredAssignments.length && (
 <div className="col-span-full py-16 text-center rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50/30 p-8 dark:border-emerald-800/60 dark:bg-slate-900/40">
 <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
 <ClipboardList className="h-7 w-7" />
 </div>
 <h4 className="mt-3 text-sm font-black text-slate-800 dark:text-white">Tidak Ada Tugas Ditemukan</h4>
 <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
 Tidak ada tugas yang sesuai dengan kriteria pencarian atau filter yang dipilih. Coba reset filter untuk melihat seluruh tugas.
 </p>
 <Button
 variant="ghost"
 appearance="outline"
 size="sm"
 onClick={resetFilters}
 className="mt-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 font-bold text-emerald-700 hover:bg-emerald-50"
 >
 Reset Filter
 </Button>
 </div>
 )}
 </div>

 {/* 5. HEROUI HARMONIZED DETAIL & SUBMISSION MODAL */}
 <AnimatePresence>
 {activeModal && (() => {
 const modalSubmission = activeModal.pengumpulan_tugas?.[0]
 const modalTheme = getTaskTheme(activeModal.jenis_tugas)
 const ModalIcon = modalTheme.Icon
 const modalSubject = getSubjectColor(activeModal.subject?.name || activeModal.subject?.nama_mapel)

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-md">
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 15 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 15 }}
 transition={{ type: 'spring', damping: 25, stiffness: 300 }}
 className="relative w-full max-w-xl overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-slate-900"
 >
 {/* Top Accent Gradient Bar */}

 {/* Modal Header */}
 <div className="flex items-start justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 p-5 dark:border-emerald-800/60">
 <div className="flex items-start gap-3.5">
 <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm">
 <ModalIcon className="h-5 w-5" />
 </div>
 <div>
 <div className="flex flex-wrap items-center gap-2">
 <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-bold ${modalSubject.pill}`}>
 {activeModal.subject?.name || activeModal.subject?.nama_mapel || '-'}
 </span>
 <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-bold ${modalTheme.badge}`}>
 {modalTheme.label}
 </span>
 {modalSubmission && (
 <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
 Sudah Dikumpulkan
 </span>
 )}
 </div>
 <h3 className="mt-1 text-base font-black text-slate-900 dark:text-white leading-snug">
 {activeModal.judul}
 </h3>
 <p className="text-xs text-slate-500 mt-0.5">
 Guru: <b className="text-slate-700 dark:text-slate-300">{activeModal.teacher?.nama_lengkap || activeModal.teacher?.name || '-'}</b> · Tenggat: <b>{formatDate(activeModal.deadline)}</b>
 </p>
 </div>
 </div>

 <button
 type="button"
 onClick={() => setActiveModal(null)}
 aria-label="Tutup modal"
 className="rounded-xl p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 hover:text-slate-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 dark:hover:text-slate-200 transition"
 >
 <X className="h-5 w-5" />
 </button>
 </div>

 {/* Modal Internal Navigation Tabs */}
 <div className="flex border-b border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/60 px-5 dark:border-emerald-800/60 dark:bg-slate-800/40">
 <button
 type="button"
 onClick={() => setModalTab('instruksi')}
 className={`flex items-center gap-1.5 border-b-2 py-3 px-3 text-xs font-bold transition-all ${
 modalTab === 'instruksi'
 ? 'border-slate-600 text-emerald-700 dark:border-emerald-800/60 dark:text-emerald-300'
 : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
 }`}
 >
 <ClipboardList className="h-4 w-4" />
 <span>Lembar Soal & Instruksi</span>
 </button>

 {modalSubmission && (
 <button
 type="button"
 onClick={() => setModalTab('jawaban')}
 className={`flex items-center gap-1.5 border-b-2 py-3 px-3 text-xs font-bold transition-all ${
 modalTab === 'jawaban'
 ? 'border-slate-600 text-emerald-700 dark:border-emerald-800/60 dark:text-emerald-300'
 : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
 }`}
 >
 <CheckCircle2 className="h-4 w-4" />
 <span>Jawaban & Nilai Siswa</span>
 </button>
 )}

 {!modalSubmission && (!isParent || canSubmit) && (
 <button
 type="button"
 onClick={() => setModalTab('kumpul')}
 className={`flex items-center gap-1.5 border-b-2 py-3 px-3 text-xs font-bold transition-all ${
 modalTab === 'kumpul'
 ? 'border-slate-600 text-emerald-700 dark:border-emerald-800/60 dark:text-emerald-300'
 : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
 }`}
 >
 <Send className="h-4 w-4" />
 <span>Form Kumpul Tugas</span>
 </button>
 )}
 </div>

 {/* Modal Content Body */}
 <div className="max-h-[68vh] overflow-y-auto p-5 space-y-4">
 {message && (
 <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950 dark:text-emerald-300">
 {message}
 </div>
 )}

 {/* TAB 1: INSTRUKSI & LEMBAR SOAL */}
 {modalTab === 'instruksi' && (
 <div className="space-y-4">
 {/* Description / Instructions */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 p-4 dark:border-emerald-800/60 dark:bg-slate-800/40">
 <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
 <ClipboardList className="h-4 w-4 text-emerald-600" />
 <span>Lembar Soal / Instruksi dari Guru:</span>
 </div>
 <div className="whitespace-pre-line text-xs font-sans text-slate-700 dark:text-slate-300 leading-relaxed">
 {activeModal.deskripsi || activeModal.instruksi || 'Tidak ada deskripsi rincian tambahan dari guru.'}
 </div>
 </div>

 {/* Linked Module */}
 {activeModal.materi && (
 <div className="flex items-center justify-between rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] p-3.5 dark:border-emerald-800/60 dark:bg-emerald-950/30">
 <div className="flex items-center gap-3 text-xs font-semibold text-emerald-900 dark:text-emerald-300">
 <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
 <BookOpen className="h-4 w-4" />
 </span>
 <div>
 <span className="font-bold">Materi Belajar:</span> {activeModal.materi.judul}
 {activeModal.materi.ringkasan && (
 <p className="mt-0.5 line-clamp-1 text-xs font-normal text-emerald-800/80 dark:text-emerald-400/80">
 {activeModal.materi.ringkasan}
 </p>
 )}
 </div>
 </div>
 {activeModal.materi.link && (
 <button
 type="button"
 onClick={() =>
 setEmbedModal({
 isOpen: true,
 url: activeModal.materi.link,
 title: `Materi Belajar: ${activeModal.materi.judul}`,
 })
 }
 className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700 shadow-sm"
 >
 <Eye className="h-3.5 w-3.5" /> Buka Materi (In-App)
 </button>
 )}
 </div>
 )}

 {/* Question Sheet Attachment */}
 {activeModal.file_lampiran_url && (
 <div className="flex items-center justify-between rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 p-3.5 dark:border-emerald-800/60 dark:bg-emerald-950/30">
 <div className="flex items-center gap-2.5 text-xs font-semibold text-emerald-900 dark:text-emerald-300">
 <FileUp className="h-4 w-4 text-emerald-600" />
 <span>Berkas Lembar Soal Lampiran Guru</span>
 </div>
 <button
 type="button"
 onClick={() =>
 setEmbedModal({
 isOpen: true,
 url: activeModal.file_lampiran_url,
 title: `Berkas Soal: ${activeModal.judul}`,
 })
 }
 className="inline-flex items-center gap-1.5 rounded-xl bg-[#059669] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#047857] shadow-sm"
 >
 <Eye className="h-3.5 w-3.5" /> Pratinjau Soal (In-App)
 </button>
 </div>
 )}

 {/* Parent Note when monitoring */}
 {isParent && !canSubmit && !modalSubmission && (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50 p-3.5 text-xs font-medium text-amber-900 dark:border-emerald-800/60 dark:bg-amber-950/30 dark:text-amber-300">
 <span className="font-bold">Mode Monitoring Orang Tua:</span> Tugas pada jenjang SMP/SMA dikerjakan langsung oleh siswa melalui portal mandiri ananda. Orang tua dapat memantau lembar instruksi, materi pengantar, dan evaluasi hasil nilai di sini.
 </div>
 )}
 </div>
 )}

 {/* TAB 2: JAWABAN & NILAI SISWA */}
 {modalTab === 'jawaban' && modalSubmission && (
 <div className="space-y-4">
 {/* Evaluation & Grade Summary */}
 {modalSubmission.nilai_guru != null ? (
 <div className="rounded-xl border border-emerald-200/80 bg-white dark:bg-[#1B2433] p-4 dark:border-emerald-800/60 dark:bg-emerald-950/30 space-y-2">
 <div className="flex items-center justify-between">
 <span className="flex items-center gap-2 text-xs font-black text-emerald-900 dark:text-emerald-300">
 <Award className="h-5 w-5 text-emerald-600" />
 Hasil Evaluasi & Nilai Akhir
 </span>
 <span className="rounded-xl bg-emerald-600 px-3.5 py-1 text-lg font-black text-white shadow-md">
 {modalSubmission.nilai_guru}
 </span>
 </div>
 {modalSubmission.catatan_guru && (
 <div className="rounded-xl bg-white/80 p-3 text-xs text-emerald-900 dark:bg-slate-800 dark:text-emerald-200">
 <span className="font-bold">Catatan Umpan Balik Guru:</span>
 <p className="mt-1 italic">{modalSubmission.catatan_guru}</p>
 </div>
 )}
 </div>
 ) : (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-blue-50/70 p-4 text-xs font-medium text-blue-900 dark:border-emerald-800/60 dark:bg-blue-950/30 dark:text-blue-300">
 Tugas telah berhasil dikumpulkan dan saat ini sedang dalam proses evaluasi oleh guru pengampu.
 </div>
 )}

 {/* Submitted Answer Record */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 bg-white p-4 shadow-xs dark:border-emerald-800/60 dark:bg-slate-900 space-y-3">
 <div className="flex items-center justify-between text-xs border-b border-emerald-200/80 dark:border-emerald-800/60 pb-2 dark:border-emerald-800/60">
 <span className="font-black text-slate-800 dark:text-slate-200">
 Lembar Jawaban yang Dikumpulkan:
 </span>
 <span className="text-xs text-slate-500 font-semibold">
 Waktu:{' '}
 <b>{formatDate(modalSubmission.submitted_at || modalSubmission.created_at)}</b>
 </span>
 </div>

 {/* Submission Metadata */}
 {(modalSubmission.metadata?.tahfizh_mode || modalSubmission.metadata?.group_members) && (
 <div className="flex flex-wrap gap-2 text-xs">
 {modalSubmission.metadata?.tahfizh_mode && (
 <span className="rounded-lg bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
 Metode Setoran:{' '}
 {modalSubmission.metadata.tahfizh_mode === 'langsung'
 ? 'Tatap Muka di Kelas'
 : modalSubmission.metadata.tahfizh_mode === 'audio'
 ? 'Rekaman Audio Suara'
 : 'Tautan Video'}
 </span>
 )}
 {modalSubmission.metadata?.group_members && (
 <span className="rounded-lg bg-indigo-100 dark:bg-indigo-900/60 px-2.5 py-1 font-bold text-indigo-800 dark:text-indigo-300 border border-emerald-200/80 dark:border-emerald-800/60">
 Anggota: {modalSubmission.metadata.group_members}
 </span>
 )}
 </div>
 )}

 {modalSubmission.jawaban_teks && (
 <div className="text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 whitespace-pre-wrap leading-relaxed">
 {modalSubmission.jawaban_teks}
 </div>
 )}

 {/* Attachments Viewer Buttons */}
 <div className="flex flex-wrap gap-2 pt-1">
 {modalSubmission.file_lampiran_url && (
 <button
 type="button"
 onClick={() =>
 setEmbedModal({
 isOpen: true,
 url: modalSubmission.file_lampiran_url,
 title: 'Berkas Lampiran Jawaban Anda',
 })
 }
 className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 px-3.5 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 transition"
 >
 <FileUp className="h-4 w-4" /> Buka Berkas Lampiran (In-App)
 </button>
 )}
 {modalSubmission.url_link && (
 <button
 type="button"
 onClick={() =>
 setEmbedModal({
 isOpen: true,
 url: modalSubmission.url_link,
 title: 'Tautan Jawaban Anda',
 })
 }
 className="inline-flex items-center gap-1.5 rounded-xl bg-blue-100 dark:bg-blue-900/50 px-3.5 py-2 text-xs font-bold text-blue-800 dark:text-blue-300 hover:bg-blue-200 transition"
 >
 <LinkIcon className="h-4 w-4" /> Buka Tautan Jawaban (In-App)
 </button>
 )}
 </div>
 </div>
 </div>
 )}

 {/* TAB 3: FORM PENGUMPULAN TUGAS */}
 {modalTab === 'kumpul' && !modalSubmission && (!isParent || canSubmit) && (
 <form onSubmit={handleSubmit} className="space-y-4">
 {/* Dynamic Assignment Helper Banner */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 dark:bg-slate-900/50 p-3.5 flex items-start gap-3">
 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm">
 <Sparkles className="h-4 w-4" />
 </div>
 <div>
 <span className="text-xs font-black text-emerald-900 dark:text-emerald-300">
 {modalTheme.label}
 </span>
 <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
 {modalTheme.desc}
 </p>
 </div>
 </div>

 {/* Tahfizh Method Selector */}
 {activeModal.jenis_tugas === 'tahfizh' && (
 <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 p-3.5 dark:border-emerald-800/60 dark:bg-emerald-950/30 space-y-2">
 <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-300">
 Pilih Metode Setoran Tahfizh:
 </label>
 <div className="grid grid-cols-3 gap-2">
 {[
 { key: 'langsung', label: 'Tatap Muka di Kelas' },
 { key: 'audio', label: 'Rekaman Suara' },
 { key: 'video', label: 'Video / Tautan' },
 ].map((m) => (
 <button
 key={m.key}
 type="button"
 onClick={() => setSubmissionTahfizhMode(m.key)}
 className={`rounded-xl px-2 py-2 text-xs font-bold border transition ${
 submissionTahfizhMode === m.key
 ? 'bg-[#059669] text-white border-[#059669] shadow-sm'
 : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-emerald-200/80 dark:border-emerald-700/80 hover:bg-emerald-50'
 }`}
 >
 {m.label}
 </button>
 ))}
 </div>
 {submissionTahfizhMode === 'langsung' && (
 <p className="text-xs text-emerald-800 dark:text-emerald-400 italic">
 * Setoran dilakukan langsung di hadapan Ustadz/Guru di kelas. Nilai tajwid & kelancaran akan langsung dimasukkan oleh guru.
 </p>
 )}
 </div>
 )}

 {/* Group members for Proyek */}
 {activeModal.jenis_tugas === 'proyek' && (
 <div>
 <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
 Nama Anggota Kelompok
 </label>
 <input
 type="text"
 value={submissionGroupMembers}
 onChange={(e) => setSubmissionGroupMembers(e.target.value)}
 placeholder="Contoh: Ahmad Fauzan (Ketua), Budi, Citra..."
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 p-3 text-xs outline-none focus:border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 dark:bg-slate-800"
 />
 </div>
 )}

 {/* Text Answer with Live Word Counter for Esai */}
 <div>
 <div className="flex items-center justify-between mb-1">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
 {activeModal.jenis_tugas === 'esai' ? 'Lembar Jawaban Esai' : 'Jawaban Teks / Keterangan'}
 </label>
 {activeModal.jenis_tugas === 'esai' && (
 <span className="rounded-full bg-blue-100 dark:bg-blue-950 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
 {textAnswer.trim().split(/\s+/).filter(Boolean).length} Kata
 </span>
 )}
 </div>
 <textarea
 rows={activeModal.jenis_tugas === 'esai' ? 6 : 4}
 value={textAnswer}
 onChange={(e) => setTextAnswer(e.target.value)}
 placeholder={
 activeModal.jenis_tugas === 'esai'
 ? 'Tuliskan esai lengkap Anda di sini...'
 : 'Tuliskan jawaban atau keterangan pengerjaan tugas Anda...'
 }
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 p-3 text-xs outline-none focus:border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 dark:bg-slate-800"
 />
 </div>

 {/* File Upload Dropzone */}
 <div>
 <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
 Upload Berkas Lampiran (PDF / Gambar / Doc)
 </label>
 <input
 type="file"
 onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
 className="w-full text-xs text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-emerald-700 hover:file:bg-emerald-100"
 />
 </div>

 {/* Link Input with Live In-App Preview */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80/80 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 space-y-2">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
 Tautan File, Video, atau Dokumen (Google Drive, YouTube, Docs, Canva)
 </label>
 <div className="flex gap-2">
 <div className="relative flex-1">
 <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
 <input
 type="url"
 value={submissionLink}
 onChange={(e) => setSubmissionLink(e.target.value)}
 placeholder="https://drive.google.com/... atau https://youtu.be/..."
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white pl-9 pr-3 py-2 text-xs outline-none focus:border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 dark:bg-slate-900"
 />
 </div>
 {submissionLink.trim() && (
 <button
 type="button"
 onClick={() =>
 setEmbedModal({
 isOpen: true,
 url: submissionLink.trim(),
 title: 'Pratinjau Tautan Tugas Anda',
 })
 }
 className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 px-3 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-200 transition"
 >
 <Eye className="h-3.5 w-3.5" /> Uji Pratinjau
 </button>
 )}
 </div>
 <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
 * Tautan akan ditampilkan di dalam dashboard tanpa membuka tab browser baru.
 </p>
 </div>

 {/* Submit action */}
 <div className="flex justify-end gap-2 pt-2">
 <button
 type="submit"
 disabled={submitting}
 className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 dark:bg-slate-100 dark:text-slate-900 dark: px-5 py-2.5 text-xs font-black shadow-sm hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50 text-white border border-emerald-200/80 dark:border-emerald-800/60 h-9 text-sm font-medium"
 >
 {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
 <span>Kirim Tugas Sekarang</span>
 </button>
 </div>
 </form>
 )}
 </div>

 {/* Modal Footer */}
 <div className="flex items-center justify-between border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:border-emerald-800/60 dark:bg-emerald-950/20 px-5 py-3.5 dark:border-emerald-800/60 dark:bg-slate-800/60">
 <span className="text-xs text-slate-500">
 Sistem Pembelajaran Terpadu{student?.unit_name ? ` · ${student.unit_name}` : ''}
 </span>
 <Button
 type="button"
 variant="ghost"
 appearance="outline"
 size="sm"
 onClick={() => setActiveModal(null)}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-700/80 dark:text-slate-300"
 >
 Tutup
 </Button>
 </div>
 </motion.div>
 </div>
 )
 })()}
 </AnimatePresence>

 {/* 6. IN-APP EMBED VIEWER MODAL */}
 <InAppEmbedViewerModal
 isOpen={embedModal.isOpen}
 url={embedModal.url}
 title={embedModal.title}
 onClose={() => setEmbedModal({ isOpen: false, url: '', title: '' })}
 />
 </div>
 )
}
