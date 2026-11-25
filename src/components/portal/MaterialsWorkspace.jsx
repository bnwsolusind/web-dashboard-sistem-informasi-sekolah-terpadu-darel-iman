import { useMemo, useState, useEffect } from 'react'
import AppModal from '@/components/app/AppModal'
import CustomSelect from '@/components/ui/CustomSelect'
import { motion, AnimatePresence } from 'framer-motion'
import {
 Award,
 BookCheck,
 BookOpen,
 CalendarDays,
 CheckCircle2,
 Clock,
 Compass,
 Download,
 ExternalLink,
 FileCode,
 FileText,
 Filter,
 Globe,
 Info,
 Layers,
 Lightbulb,
 Loader2,
 Mail,
 Phone,
 PlayCircle,
 RefreshCw,
 School,
 Search,
 Sparkles,
 Tag,
 Target,
 User,
 Video,
 X,
} from 'lucide-react'
import { VideoEmbedPlayer, PdfDocumentViewer } from '../common/MateriMediaEmbed'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'

const typeThemes = {
 video: {
 label: 'Video Belajar',
 badge: 'bg-rose-100 text-rose-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/80 dark:text-rose-300 dark:border-emerald-800/60',
 iconBg: 'bg-white dark:bg-[#1B2433] shadow-sm',
 topBar: 'bg-white dark:bg-[#1B2433]',
 borderLeft: 'border-l-4 border-l-rose-500',
 Icon: Video,
 },
 pdf: {
 label: 'Dokumen PDF',
 badge: 'bg-amber-100 text-amber-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/80 dark:text-amber-300 dark:border-emerald-800/60',
 iconBg: 'bg-white dark:bg-[#1B2433] shadow-sm',
 topBar: 'bg-white dark:bg-[#1B2433]',
 borderLeft: 'border-l-4 border-l-amber-500',
 Icon: FileText,
 },
 dokumen: {
 label: 'Modul / Dokumen',
 badge: 'bg-sky-100 text-sky-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-sky-950/80 dark:text-sky-300 dark:border-emerald-800/60',
 iconBg: 'bg-white dark:bg-[#1B2433] shadow-sky-500/25',
 topBar: 'bg-white dark:bg-[#1B2433]',
 borderLeft: 'border-l-4 border-l-sky-500',
 Icon: BookOpen,
 },
 link: {
 label: 'Tautan Materi',
 badge: 'bg-emerald-100 text-emerald-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/60',
 iconBg: 'bg-white dark:bg-[#1B2433] shadow-sm',
 topBar: 'bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:text-white',
 borderLeft: 'border-l-4 border-l-emerald-500',
 Icon: Globe,
 },
}

const getTypeTheme = (rawType = '') => {
 const t = String(rawType).toLowerCase()
 if (t.includes('video') || t.includes('youtube') || t.includes('mp4')) return typeThemes.video
 if (t.includes('pdf')) return typeThemes.pdf
 if (t.includes('dokumen') || t.includes('modul') || t.includes('doc')) return typeThemes.dokumen
 return typeThemes.link
}

const getSubjectColor = (subjectName = '') => {
 const s = String(subjectName).toLowerCase()
 if (s.includes('agama') || s.includes('pai') || s.includes('tahfizh') || s.includes('tahsin') || s.includes('quran') || s.includes('fiqih')) {
 return {
 text: 'text-emerald-700 dark:text-emerald-300',
 pill: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/60',
 dot: 'bg-emerald-500',
 }
 }
 if (s.includes('matematika') || s.includes('ipa') || s.includes('fisika') || s.includes('kimia') || s.includes('biologi')) {
 return {
 text: 'text-cyan-700 dark:text-cyan-300',
 pill: 'bg-cyan-50 text-cyan-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-cyan-950/70 dark:text-cyan-300 dark:border-emerald-800/60',
 dot: 'bg-cyan-500',
 }
 }
 if (s.includes('bahasa') || s.includes('arab') || s.includes('inggris') || s.includes('indonesia')) {
 return {
 text: 'text-purple-700 dark:text-purple-300',
 pill: 'bg-purple-50 text-purple-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-purple-950/70 dark:text-purple-300 dark:border-emerald-800/60',
 dot: 'bg-purple-500',
 }
 }
 if (s.includes('ips') || s.includes('sejarah') || s.includes('sosiologi') || s.includes('geografi') || s.includes('ekonomi')) {
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
 if (!val) return null
 try {
 return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(val))
 } catch {
 return val
 }
}

export default function MaterialsWorkspace({ materials = [], loading = false, student = null }) {
 const [draftSearch, setDraftSearch] = useState('')
 const [search, setSearch] = useState('')
 const [selectedSubject, setSelectedSubject] = useState('')
 const [selectedType, setSelectedType] = useState('all')
 const [activeDetail, setActiveDetail] = useState(null)
 const [activeModalTab, setActiveModalTab] = useState('ringkasan') // 'ringkasan' | 'kurikulum' | 'kegiatan'

 useEffect(() => {
 const timer = setTimeout(() => setSearch(draftSearch), 350)
 return () => clearTimeout(timer)
 }, [draftSearch])

 const safeMaterials = useMemo(() => {
 if (Array.isArray(materials)) return materials
 if (materials && Array.isArray(materials.data)) return materials.data
 return []
 }, [materials])

 const subjects = useMemo(() => {
 return Array.from(
 new Set(safeMaterials.map((m) => m.subject?.name || m.subject?.nama_mapel || m.mata_pelajaran).filter(Boolean))
 )
 }, [safeMaterials])

 const typeCounts = useMemo(() => {
 const counts = { all: safeMaterials.length, pdf: 0, video: 0, dokumen: 0, link: 0 }
 safeMaterials.forEach((m) => {
 const t = String(m.tipe_materi || m.tipe || m.jenis_materi || '').toLowerCase()
 if (t.includes('video') || t.includes('youtube')) counts.video++
 else if (t.includes('pdf')) counts.pdf++
 else if (t.includes('dokumen') || t.includes('modul')) counts.dokumen++
 else counts.link++
 })
 return counts
 }, [safeMaterials])

 const filteredMaterials = useMemo(() => {
 return safeMaterials.filter((m) => {
 const title = m.judul || m.title || ''
 const content = m.konten || m.catatan || m.ringkasan || m.isi || ''
 const subject = m.subject?.name || m.subject?.nama_mapel || m.mata_pelajaran || ''
 const type = String(m.tipe_materi || m.tipe || m.jenis_materi || '').toLowerCase()
 const modul = m.modul_ajar?.judul_modul || ''

 const searchMatch =
 !search ||
 title.toLowerCase().includes(search.toLowerCase()) ||
 content.toLowerCase().includes(search.toLowerCase()) ||
 subject.toLowerCase().includes(search.toLowerCase()) ||
 modul.toLowerCase().includes(search.toLowerCase())

 const subjectMatch = !selectedSubject || subject === selectedSubject

 let typeMatch = true
 if (selectedType !== 'all') {
 if (selectedType === 'video') typeMatch = type.includes('video') || type.includes('youtube')
 else if (selectedType === 'pdf') typeMatch = type.includes('pdf')
 else if (selectedType === 'dokumen') typeMatch = type.includes('dokumen') || type.includes('modul')
 else if (selectedType === 'link') typeMatch = !type.includes('video') && !type.includes('pdf') && !type.includes('dokumen')
 }

 return searchMatch && subjectMatch && typeMatch
 })
 }, [safeMaterials, search, selectedSubject, selectedType])

 const resetFilters = () => {
 setDraftSearch('')
 setSearch('')
 setSelectedSubject('')
 setSelectedType('all')
 }

 const handleOpenDetail = (item) => {
 setActiveDetail(item)
 setActiveModalTab('ringkasan')
 }

 if (loading) {
 return (
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] p-12 text-center shadow-sm dark:border-emerald-800/60 dark:bg-slate-900">
 <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
 <Loader2 className="h-7 w-7 animate-spin" />
 </div>
 <h3 className="mt-4 text-base font-black text-slate-800 dark:text-white">Memuat Materi Pembelajaran...</h3>
 <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Sinkronisasi materi modul dan lampiran media pembelajaran ananda.</p>
 </div>
 )
 }

 return (
 <div className="space-y-5">
 {/* MODERN HERO HEADER CARD (SINKRON DENGAN STANDAR PROYEK HEROUI HERO) */}
 <header className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] p-5 sm:p-6 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
 <div className="flex items-center gap-3.5">
 <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-sm ring-4 ring-white/60 dark:ring-slate-800/80">
 <BookOpen className="h-6 w-6" />
 </span>
 <div>
 <div className="flex flex-wrap items-center gap-2">
 <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
 Materi & Modul Belajar Siswa
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
 </div>
 <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 font-medium max-w-2xl">
 Koleksi materi pelajaran terstruktur per pekan, modul kurikulum terpadu, dan media pembelajaran dari dewan guru.
 </p>
 </div>
 </div>

 {/* Quick Metrics KPI Counters */}
 <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
 <div className="flex items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white/80 px-3.5 py-1.5 shadow-xs backdrop-blur-xs dark:border-emerald-800/60 dark:bg-slate-800/80">
 <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-black text-xs dark:bg-emerald-950 dark:text-emerald-300">
 {safeMaterials.length}
 </span>
 <span className="text-xs font-black text-slate-700 dark:text-slate-200">Total Materi</span>
 </div>
 <div className="flex items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white/80 px-3.5 py-1.5 shadow-xs backdrop-blur-xs dark:border-emerald-800/60 dark:bg-slate-800/80">
 <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-100 text-teal-700 font-black text-xs dark:bg-teal-950 dark:text-teal-300">
 {subjects.length}
 </span>
 <span className="text-xs font-black text-slate-700 dark:text-slate-200">Mata Pelajaran</span>
 </div>
 </div>
 </div>
 </header>

 {/* FILTER & PENCARIAN DENGAN BORDER AKSEN MODERN */}
 <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] p-4 shadow-sm dark:border-emerald-800/60 dark:bg-slate-900" aria-label="Filter materi">
 <div className="flex flex-col gap-3 lg:flex-row">
 <label className="relative flex-1">
 <span className="sr-only">Cari materi pembelajaran</span>
 <Search className="absolute left-4 top-3.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={draftSearch}
 onChange={(e) => setDraftSearch(e.target.value)}
 placeholder="Cari judul materi, pekan, catatan guru, atau mata pelajaran..."
 className="h-11 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 pl-11 pr-4 text-xs font-medium outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/15 dark:border-emerald-800/60 dark:bg-slate-800 dark:focus:bg-slate-900"
 />
 </label>

 <CustomSelect
 aria-label="Pilih Mata Pelajaran"
 value={selectedSubject}
 onChange={(e) => setSelectedSubject(e.target.value)}
 className="h-11 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 px-3.5 text-xs font-bold text-slate-700 outline-none transition-all focus:border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200"
 >
 <option value="">Semua Mata Pelajaran ({subjects.length})</option>
 {subjects.map((sub) => (
 <option key={sub} value={sub}>
 {sub}
 </option>
 ))}
 </CustomSelect>

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

 {/* Quick Filter Media Type Pills */}
 <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-emerald-200/80 dark:border-emerald-800/60 pt-3.5 dark:border-emerald-800/60">
 {[
 { id: 'all', label: 'Semua Tipe', count: typeCounts.all, Icon: BookOpen },
 { id: 'link', label: 'Tautan Materi', count: typeCounts.link, Icon: Globe },
 { id: 'pdf', label: 'Dokumen PDF', count: typeCounts.pdf, Icon: FileText },
 { id: 'video', label: 'Video Belajar', count: typeCounts.video, Icon: Video },
 { id: 'dokumen', label: 'Modul / Doc', count: typeCounts.dokumen, Icon: Layers },
 ].map(({ id, label, count, Icon }) => {
 const isActive = selectedType === id
 return (
 <button
 key={id}
 type="button"
 onClick={() => setSelectedType(id)}
 className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
 isActive
 ? 'bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:text-white shadow-sm ring-2 ring-emerald-500/40 scale-[1.02]'
 : 'bg-slate-100/80 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 border border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/80'
 }`}
 >
 <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
 <span>{label}</span>
 <span
 className={`ml-1 flex h-4 min-w-[18px] items-center justify-center rounded-full px-1.5 text-[10px] font-black ${
 isActive ? 'bg-white/20' : 'bg-black/10 text-slate-600 dark:bg-white/10 dark:text-slate-300'
 }`}
 >
 {count}
 </span>
 </button>
 )
 })}
 </div>
 </section>

 {/* HASIL & GRID KARTU MATERI */}
 <div>
 <div className="mb-3.5 flex items-center justify-between">
 <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
 Menampilkan <span className="text-emerald-700 dark:text-emerald-400 font-black">{filteredMaterials.length}</span> materi pembelajaran
 {selectedSubject ? ` pada ${selectedSubject}` : ''}
 </p>
 </div>

 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
 {filteredMaterials.map((item, idx) => {
 const tTheme = getTypeTheme(item.tipe_materi || item.tipe || item.jenis_materi)
 const subjectName = item.subject?.name || item.subject?.nama_mapel || item.mata_pelajaran || '-'
 const sColor = getSubjectColor(subjectName)
 const TypeIcon = tTheme.Icon
 const weekNumber = item.urutan || (item.judul?.match(/pekan\s*(\d+)/i) ? item.judul.match(/pekan\s*(\d+)/i)[1] : null)
 const teacherName = item.guru?.nama_lengkap || item.teacher?.name || '-'
 const publishDate = formatDate(item.tanggal_publish || item.created_at)

 return (
 <motion.article
 key={item.id || idx}
 whileHover={{ y: -4 }}
 className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border-2 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-xl dark:bg-slate-900 ${tTheme.borderLeft} border-emerald-200/80 hover:border-emerald-300 dark:hover:border-emerald-700 dark:border-emerald-800/60 dark:hover:border-emerald-700`}
 >
 {/* Top Accent Gradient Line */}
 <div className={`absolute top-0 left-0 right-0 h-1.5 ${tTheme.topBar}`} />

 <div>
 {/* Top Bar: Icon Squircle + Type Badge + Week Badge */}
 <div className="flex items-center justify-between gap-2">
 <div className="flex items-center gap-2.5">
 <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-md ${tTheme.iconBg}`}>
 <TypeIcon className="h-5 w-5 text-emerald-600" />
 </div>
 <div>
 <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${tTheme.badge}`}>
 {item.tipe_materi || item.tipe || tTheme.label}
 </span>
 </div>
 </div>

 {weekNumber && (
 <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-700/80">
 <Clock className="h-3 w-3 text-emerald-600" />
 Pekan {String(weekNumber).padStart(2, '0')}
 </span>
 )}
 </div>

 {/* Subject Badge */}
 <div className="mt-3.5">
 <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide ${sColor.pill}`}>
 <span className={`h-2 w-2 rounded-full ${sColor.dot}`} />
 {subjectName}
 </span>
 </div>

 {/* Title */}
 <h3 className="mt-2.5 text-sm sm:text-base font-black text-slate-900 line-clamp-2 transition-colors group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400">
 {item.judul || item.title}
 </h3>

 {/* Ringkasan / Deskripsi */}
 <p className="mt-2 text-xs leading-5 text-slate-600 line-clamp-3 dark:text-slate-300">
 {item.konten || item.catatan || item.ringkasan || item.isi || '-'}
 </p>

 {/* Modul Ajar Link Tag (if linked) */}
 {item.modul_ajar?.judul_modul && (
 <div className="mt-3 flex items-center gap-1.5 rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 p-2 text-[10px] font-bold text-emerald-800 dark:border-emerald-800/60 dark:bg-slate-800/80 dark:text-emerald-300">
 <Layers className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
 <span className="truncate">{item.modul_ajar.judul_modul}</span>
 </div>
 )}
 </div>

 <div className="mt-4 pt-3.5 border-t border-emerald-200/80 dark:border-emerald-800/60">
 {/* Teacher & Date Metadata */}
 <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
 <div className="flex items-center gap-1.5 truncate max-w-[180px]">
 <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
 <User className="h-3 w-3" />
 </div>
 <span className="truncate">{teacherName}</span>
 </div>
 {publishDate && (
 <span className="shrink-0 flex items-center gap-1 text-[10px] text-slate-400">
 <CalendarDays className="h-3 w-3 text-teal-600" />
 {publishDate}
 </span>
 )}
 </div>

 {/* Media attachments preview */}
 {(item.media || []).length > 0 && (
 <div className="mt-2.5 space-y-1">
 {item.media.slice(0, 2).map((med) => (
 <a
 key={med.id}
 href={med.url_eksternal || med.path_file}
 target="_blank"
 rel="noreferrer"
 className="flex items-center justify-between rounded-lg bg-emerald-50/40 p-1.5 px-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-50 dark:bg-slate-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60"
 >
 <span className="truncate">{med.nama_file || '-'}</span>
 <ExternalLink className="h-3 w-3 shrink-0 text-emerald-600" />
 </a>
 ))}
 </div>
 )}

 {/* Action Button */}
 <div className="mt-3.5">
 <Button
 type="button"
 size="sm"
 onClick={() => handleOpenDetail(item)}
 className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:text-white hover:from-emerald-700 hover:to-teal-800 font-black text-xs rounded-xl shadow-sm py-2.5"
 >
 Buka Materi Belajar
 </Button>
 </div>
 </div>
 </motion.article>
 )
 })}

 {!filteredMaterials.length && (
 <div className="col-span-full rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50/20 px-6 py-14 text-center dark:border-emerald-800/60 dark:bg-slate-900/40">
 <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
 <BookOpen className="h-7 w-7" />
 </div>
 <h3 className="mt-4 text-base font-black text-slate-800 dark:text-slate-100">
 Belum Ada Materi Pembelajaran
 </h3>
 <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
 Tidak ada materi pembelajaran yang cocok dengan filter atau kata kunci pencarian Anda.
 </p>
 <Button
 variant="ghost"
 size="sm"
 onClick={resetFilters}
 className="mt-4 border border-emerald-200/80 dark:border-emerald-800/60 bg-white text-emerald-700 hover:bg-emerald-50 font-bold rounded-xl dark:bg-slate-800 dark:border-emerald-700/80"
 >
 Reset Filter
 </Button>
 </div>
 )}
 </div>
 </div>

 {/* DETAIL MODAL MATERI DENGAN STANDAR HEROUI HARMONIZED MODAL & DATA KURIKULUM LENGKAP */}
 <AppModal
 isOpen={Boolean(activeDetail)}
 onClose={() => setActiveDetail(null)}
 title={activeDetail?.judul || activeDetail?.title}
 badge={activeDetail ? `${activeDetail.tipe_materi || activeDetail.tipe || '-'} · ${activeDetail.subject?.name || activeDetail.subject?.nama_mapel || activeDetail.mata_pelajaran || '-'}` : ''}
 description={activeDetail?.modul_ajar?.semester ? `Semester ${activeDetail.modul_ajar.semester}${activeDetail.modul_ajar.fase ? ` · Fase ${activeDetail.modul_ajar.fase}` : ''}` : undefined}
 icon={BookOpen}
 maxWidth="max-w-4xl"
 subHeader={
 <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 w-fit">
 {[
 { id: 'ringkasan', label: 'Ringkasan & Catatan', Icon: BookCheck },
 { id: 'kurikulum', label: 'Capaian & Kurikulum', Icon: Target },
 { id: 'kegiatan', label: 'Rencana Kegiatan KBM', Icon: Compass },
 ].map(({ id, label, Icon }) => {
 const isActive = activeModalTab === id
 return (
 <button
 key={id}
 type="button"
 onClick={() => setActiveModalTab(id)}
 className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black transition-all active:scale-95 ${
 isActive
 ? 'bg-emerald-600 text-white shadow-xs'
 : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-100/60 dark:text-slate-300 dark:hover:bg-slate-800'
 }`}
 >
 <Icon className="h-3.5 w-3.5" />
 <span>{label}</span>
 </button>
 )
 })}
 </div>
 }
 footer={
 activeDetail ? (
 <div className="flex w-full flex-wrap items-center justify-between gap-2">
 <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
 {activeDetail.modul_ajar?.kode_modul ? `Modul: ${activeDetail.modul_ajar.kode_modul}` : ''}
 </div>
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => setActiveDetail(null)}
 className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
 >
 Tutup
 </button>
 {activeDetail.link && (
 <a
 href={activeDetail.link}
 target="_blank"
 rel="noreferrer"
 className="inline-flex h-9.5 items-center gap-2 rounded-xl border-2 border-emerald-600 bg-emerald-600 px-4 text-xs font-black text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
 >
 Buka Sumber Asli
 <ExternalLink className="h-3.5 w-3.5" />
 </a>
 )}
 </div>
 </div>
 ) : null
 }
 >
 {activeDetail && (
 <div className="space-y-5">
 {/* Video Embed if available */}
 {activeDetail.video && (
 <div className="overflow-hidden rounded-xl border-2 border-emerald-200/80 dark:border-emerald-800/60 shadow-md">
 <VideoEmbedPlayer
 url={activeDetail.video}
 title={`Video: ${activeDetail.judul || activeDetail.title}`}
 />
 </div>
 )}

 {/* PDF Document Viewer if available */}
 {(activeDetail.file || (activeDetail.tipe_materi === 'dokumen' && activeDetail.path_file)) && (
 <div className="overflow-hidden rounded-xl border-2 border-emerald-200/80 dark:border-emerald-800/60 shadow-md">
 <PdfDocumentViewer
 url={activeDetail.file || activeDetail.path_file}
 title={`Dokumen: ${activeDetail.judul || activeDetail.title}`}
 height="460px"
 />
 </div>
 )}

 {/* Link Eksternal Banner */}
 {activeDetail.link && (
 <div className="flex items-center justify-between rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 p-4 dark:border-emerald-800/60 dark:bg-slate-800">
 <div className="flex items-center gap-3 min-w-0">
 <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
 <Globe className="h-5 w-5" />
 </span>
 <div className="min-w-0">
 <p className="text-xs font-black text-emerald-900 dark:text-emerald-200">Tautan Sumber Materi</p>
 <p className="truncate text-xs text-emerald-700 dark:text-emerald-400">{activeDetail.link}</p>
 </div>
 </div>
 <a
 href={activeDetail.link}
 target="_blank"
 rel="noreferrer"
 className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-black text-white hover:bg-emerald-700 shadow-sm transition-all"
 >
 Buka Tautan
 <ExternalLink className="h-3.5 w-3.5" />
 </a>
 </div>
 )}

 {/* TAB 1: RINGKASAN & CATATAN */}
 {activeModalTab === 'ringkasan' && (
 <div className="space-y-4">
 {/* Tujuan Pembelajaran Utama Highlight Card */}
 {activeDetail.modul_ajar?.tujuan_pembelajaran && (
 <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 dark:bg-slate-900/50 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/20">
 <div className="flex items-start gap-3">
 <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
 <Target className="h-5 w-5" />
 </span>
 <div>
 <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
 Tujuan Pembelajaran (Target Kompetensi)
 </h4>
 <p className="mt-1 text-xs sm:text-sm leading-6 text-slate-700 dark:text-slate-300 font-semibold">
 {activeDetail.modul_ajar.tujuan_pembelajaran}
 </p>
 </div>
 </div>
 </div>
 )}

 {/* Konten Teks / Penjelasan Guru */}
 <div className="rounded-xl border border-emerald-200/80 bg-slate-50/60 p-4 dark:border-emerald-800/60 dark:bg-slate-800/60">
 <div className="flex items-center gap-2 mb-2">
 <Lightbulb className="h-4 w-4 text-amber-500" />
 <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
 Catatan & Penjelasan Guru Pengampu
 </h4>
 </div>
 <div className="whitespace-pre-wrap text-xs sm:text-sm leading-6 text-slate-700 dark:text-slate-300 font-normal">
 {activeDetail.konten || activeDetail.catatan || activeDetail.ringkasan || activeDetail.isi || 'Tidak ada catatan teks tambahan untuk materi ini.'}
 </div>
 </div>

 {/* Profil Pelajar Pancasila Badges */}
 {activeDetail.modul_ajar?.profil_pelajar_pancasila && (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-teal-50/40 p-4 dark:border-emerald-800/60 dark:bg-teal-950/20">
 <h4 className="text-xs font-black uppercase tracking-wider text-teal-900 dark:text-teal-200 mb-2.5 flex items-center gap-1.5">
 <Sparkles className="h-4 w-4 text-teal-600" />
 Dimensi Profil Pelajar Pancasila
 </h4>
 <div className="flex flex-wrap gap-2">
 {activeDetail.modul_ajar.profil_pelajar_pancasila
 .split(/[,;]/)
 .map((item, i) => item.trim())
 .filter(Boolean)
 .map((pill, idx) => (
 <span
 key={idx}
 className="inline-flex items-center gap-1 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 py-1 text-xs font-bold text-teal-800 shadow-xs dark:bg-slate-800 dark:border-emerald-800/60 dark:text-teal-300"
 >
 <CheckCircle2 className="h-3 w-3 text-teal-600" />
 {pill}
 </span>
 ))}
 </div>
 </div>
 )}

 {/* Metadata Detail Grid */}
 <dl className="grid gap-3 rounded-xl border border-emerald-200/80 bg-white p-4 text-xs sm:grid-cols-3 dark:border-emerald-800/60 dark:bg-slate-800/80 shadow-xs">
 <div>
 <dt className="text-slate-400 font-semibold">Guru Pengampu</dt>
 <dd className="mt-1 font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
 <User className="h-3.5 w-3.5 text-emerald-600" />
 {activeDetail.guru?.nama_lengkap || activeDetail.teacher?.name || '-'}
 </dd>
 </div>
 <div>
 <dt className="text-slate-400 font-semibold">Modul Terkait</dt>
 <dd className="mt-1 font-bold text-slate-800 dark:text-slate-100 truncate">
 {activeDetail.modul_ajar?.judul_modul || '-'}
 </dd>
 </div>
 <div>
 <dt className="text-slate-400 font-semibold">Tanggal Terbit</dt>
 <dd className="mt-1 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
 <CalendarDays className="h-3.5 w-3.5 text-teal-600" />
 {formatDate(activeDetail.tanggal_publish || activeDetail.created_at) || '-'}
 </dd>
 </div>
 </dl>
 </div>
 )}

 {/* TAB 2: CAPAIAN & KURIKULUM */}
 {activeModalTab === 'kurikulum' && (
 <div className="space-y-4">
 {/* Rincian Model, Metode & Alokasi Waktu */}
 <div className="grid gap-3.5 sm:grid-cols-2">
 <div className="rounded-xl border border-emerald-200/80 bg-slate-50/70 p-4 dark:border-emerald-800/60 dark:bg-slate-800/60">
 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Model & Metode Pembelajaran</span>
 <p className="mt-1.5 text-sm font-black text-slate-900 dark:text-white">
 {activeDetail.modul_ajar?.model_pembelajaran || '-'}
 </p>
 <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
 Metode: {activeDetail.modul_ajar?.metode_pembelajaran || '-'}
 </p>
 </div>

 <div className="rounded-xl border border-emerald-200/80 bg-slate-50/70 p-4 dark:border-emerald-800/60 dark:bg-slate-800/60">
 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alokasi Waktu & Jam Belajar</span>
 <p className="mt-1.5 text-sm font-black text-emerald-700 dark:text-emerald-400">
 {activeDetail.modul_ajar?.alokasi_waktu_jp ? `${activeDetail.modul_ajar.alokasi_waktu_jp} Jam Pelajaran (JP)` : '-'}
 </p>
 <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
 Kode Modul: {activeDetail.modul_ajar?.kode_modul || activeDetail.subject?.code || '-'}
 </p>
 </div>
 </div>

 {/* Rencana Penilaian / Asesmen */}
 {activeDetail.modul_ajar?.rencana_penilaian && (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/40 p-4 dark:border-emerald-800/60 dark:bg-amber-950/20">
 <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-200 mb-1.5 flex items-center gap-1.5">
 <Award className="h-4 w-4 text-amber-600" />
 Rencana Asesmen / Penilaian
 </h4>
 <p className="text-xs sm:text-sm leading-6 text-slate-700 dark:text-slate-300 font-medium">
 {activeDetail.modul_ajar.rencana_penilaian}
 </p>
 </div>
 )}

 {/* Sumber & Media Belajar */}
 <div className="grid gap-3.5 sm:grid-cols-2">
 <div className="rounded-xl border border-emerald-200/80 bg-white p-4 dark:border-emerald-800/60 dark:bg-slate-800">
 <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">Sumber Belajar</h4>
 <p className="text-xs leading-5 text-slate-700 dark:text-slate-300 font-medium">
 {activeDetail.modul_ajar?.sumber_belajar || '-'}
 </p>
 </div>

 <div className="rounded-xl border border-emerald-200/80 bg-white p-4 dark:border-emerald-800/60 dark:bg-slate-800">
 <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">Media Pembelajaran</h4>
 <p className="text-xs leading-5 text-slate-700 dark:text-slate-300 font-medium">
 {activeDetail.modul_ajar?.media_pembelajaran || '-'}
 </p>
 </div>
 </div>

 {/* Bobot Nilai & KKM Mapel */}
 {activeDetail.subject && (
 <div className="rounded-xl border border-emerald-200/80 bg-slate-50/70 p-4 dark:border-emerald-800/60 dark:bg-slate-800/60">
 <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-1.5">
 <BookOpen className="h-4 w-4 text-emerald-600" />
 Standar Penilaian Mata Pelajaran ({activeDetail.subject.name || activeDetail.subject.nama_mapel})
 </h4>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
 <div className="rounded-xl bg-white p-2.5 text-center dark:bg-slate-800 border border-emerald-200/60 dark:border-emerald-700/80">
 <span className="text-[10px] text-slate-400 font-semibold block">KKM Minimal</span>
 <span className="text-base font-black text-emerald-700 dark:text-emerald-400">{activeDetail.subject.kkm || '-'}</span>
 </div>
 <div className="rounded-xl bg-white p-2.5 text-center dark:bg-slate-800 border border-emerald-200/60 dark:border-emerald-700/80">
 <span className="text-[10px] text-slate-400 font-semibold block">Bobot Pengetahuan</span>
 <span className="text-base font-black text-blue-700 dark:text-blue-400">{activeDetail.subject.bobot_pengetahuan ? `${activeDetail.subject.bobot_pengetahuan}%` : '-'}</span>
 </div>
 <div className="rounded-xl bg-white p-2.5 text-center dark:bg-slate-800 border border-emerald-200/60 dark:border-emerald-700/80">
 <span className="text-[10px] text-slate-400 font-semibold block">Bobot Keterampilan</span>
 <span className="text-base font-black text-purple-700 dark:text-purple-400">{activeDetail.subject.bobot_keterampilan ? `${activeDetail.subject.bobot_keterampilan}%` : '-'}</span>
 </div>
 <div className="rounded-xl bg-white p-2.5 text-center dark:bg-slate-800 border border-emerald-200/60 dark:border-emerald-700/80">
 <span className="text-[10px] text-slate-400 font-semibold block">Bobot Sikap</span>
 <span className="text-base font-black text-amber-700 dark:text-amber-400">{activeDetail.subject.bobot_sikap ? `${activeDetail.subject.bobot_sikap}%` : '-'}</span>
 </div>
 </div>
 </div>
 )}
 </div>
 )}

 {/* TAB 3: RENCANA KEGIATAN KBM */}
 {activeModalTab === 'kegiatan' && (
 <div className="space-y-4">
 {/* Alur Kegiatan Timeline */}
 <div className="space-y-3.5">
 {/* Kegiatan Pendahuluan */}
 <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 bg-white p-4.5 shadow-sm dark:border-emerald-800/60 dark:bg-slate-800">
 <div className="flex items-center gap-2 mb-2">
 <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs dark:bg-emerald-950 dark:text-emerald-300">
 1
 </span>
 <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
 Kegiatan Pendahuluan
 </h4>
 </div>
 <p className="whitespace-pre-wrap text-xs sm:text-sm leading-6 text-slate-700 dark:text-slate-300 font-medium pl-8">
 {activeDetail.modul_ajar?.kegiatan_pendahuluan || 'Belum ada rincian kegiatan pendahuluan.'}
 </p>
 </div>

 {/* Kegiatan Inti */}
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] p-4.5 shadow-sm dark:border-emerald-800/60 dark:bg-slate-800">
 <div className="flex items-center gap-2 mb-2">
 <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-100 text-teal-800 font-black text-xs dark:bg-teal-950 dark:text-teal-300">
 2
 </span>
 <h4 className="text-xs font-black uppercase tracking-wider text-teal-900 dark:text-teal-200">
 Kegiatan Inti
 </h4>
 </div>
 <p className="whitespace-pre-wrap text-xs sm:text-sm leading-6 text-slate-700 dark:text-slate-300 font-medium pl-8">
 {activeDetail.modul_ajar?.kegiatan_inti || 'Belum ada rincian kegiatan inti.'}
 </p>
 </div>

 {/* Kegiatan Penutup */}
 <div className="relative overflow-hidden rounded-xl border-2 border-emerald-300 bg-white p-4.5 shadow-sm dark:border-emerald-700/80 dark:bg-slate-800">
 <div className="flex items-center gap-2 mb-2">
 <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-200 text-slate-800 font-black text-xs dark:bg-emerald-950/60 dark:text-emerald-300">
 3
 </span>
 <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-200">
 Kegiatan Penutup
 </h4>
 </div>
 <p className="whitespace-pre-wrap text-xs sm:text-sm leading-6 text-slate-700 dark:text-slate-300 font-medium pl-8">
 {activeDetail.modul_ajar?.kegiatan_penutup || 'Belum ada rincian kegiatan penutup.'}
 </p>
 </div>
 </div>
 </div>
 )}

 {/* Lampiran Media List */}
 {(activeDetail.media || []).length > 0 && (
 <div className="space-y-2 border-t border-emerald-200/80 pt-4 dark:border-emerald-800/60">
 <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
 <Download className="h-4 w-4 text-emerald-600" />
 Lampiran Media Pembelajaran ({activeDetail.media.length})
 </h4>
 <div className="space-y-2">
 {activeDetail.media.map((med) => (
 <a
 key={med.id}
 href={med.url_eksternal || med.path_file}
 target="_blank"
 rel="noreferrer"
 className="flex min-h-11 items-center justify-between rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 p-3 text-xs font-bold text-emerald-800 hover:bg-emerald-50 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-emerald-300 transition-all"
 >
 <span className="flex items-center gap-2 truncate">
 <Download className="h-4 w-4 text-emerald-600" />
 {med.nama_file || '-'}
 </span>
 <span className="shrink-0 text-[10px] text-slate-400 font-normal">
 Unduh File →
 </span>
 </a>
 ))}
 </div>
 </div>
 )}
 </div>
 )}
 </AppModal>
 </div>
 )
}
