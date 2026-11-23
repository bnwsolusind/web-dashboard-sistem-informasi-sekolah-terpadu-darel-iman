import { HeroUiHeader } from "../components/ui/HeroUiHeader"
import { useToast } from '../components/app/ToastProvider'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
 BookOpen,
 Search,
 Plus,
 RefreshCw,
 Edit2,
 Trash2,
 Volume2,
 Sparkles,
 CheckCircle,
 FileText,
 MapPin,
 X,
 Loader2,
 Layers,
 ChevronRight,
 ChevronDown,
 Play,
 Pause,
 Eye,
 AlertTriangle,
 Check,
 CheckCircle2,
 Printer,
 Download,
 RotateCcw,
} from 'lucide-react'
import ActionDropdown from '../components/app/ActionDropdown'
import AppDataTable from '../components/app/AppDataTable'
import MobileDataCard from '../components/app/MobileDataCard'
import { equranService } from '../services/equranService'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { useDebounce } from '../hooks/useDebounce'
import { Pagination } from '../components/ui/pagination'
import { printCleanTable, resolveFoundationName } from '../utils/printHelper'
import { usePengaturanStore } from '../stores/pengaturanStore'
import { useAuthStore } from '../stores/authStore'
import { getUserRoleLevel, ROLE_LEVELS } from '../auth/portalResolver'
import {
 MasterActionButton,
 MasterDataPage,
 MasterStatsGrid,
 MasterStatCard,
 SquircleActionButton,
 PrintOptionModal,
} from '../components/master-data'

// ── HEROUI FILTER BAR SELECT DROPDOWN COMPONENT ──
function HeroUiFilterSelect({
 value,
 onChange,
 options = [],
 placeholder = 'Pilih...',
 icon: IconComponent = null,
 className = '',
 popoverWidth = 'min-w-[180px]',
 searchable = false,
 disabled = false,
}) {
 const [isOpen, setIsOpen] = useState(false)
 const [search, setSearch] = useState('')
 const containerRef = React.useRef(null)

 useEffect(() => {
 function handleClickOutside(event) {
 if (containerRef.current && !containerRef.current.contains(event.target)) {
 setIsOpen(false)
 }
 }
 if (isOpen) {
 document.addEventListener('mousedown', handleClickOutside)
 }
 return () => {
 document.removeEventListener('mousedown', handleClickOutside)
 }
 }, [isOpen])

 const selectedOption = useMemo(() => {
 return options.find((opt) => String(opt.value) === String(value))
 }, [options, value])

 const filteredOptions = useMemo(() => {
 if (!searchable || !search.trim()) return options
 const q = search.toLowerCase()
 return options.filter((opt) =>
 opt.label && String(opt.label).toLowerCase().includes(q)
 )
 }, [options, search, searchable])

 return (
 <div className={`relative ${className}`} ref={containerRef}>
 <button
 type="button"
 disabled={disabled}
 onClick={() => {
 if (!disabled) {
 setIsOpen((prev) => !prev)
 setSearch('')
 }
 }}
 className={`h-9 w-full flex items-center justify-between gap-2 rounded-xl border px-3 text-xs font-semibold transition-all duration-200 cursor-pointer ${disabled
 ? 'border-emerald-200/80 bg-slate-100 text-slate-400 dark:border-emerald-800/60 dark:bg-slate-800/60 cursor-not-allowed'
 : isOpen
 ? 'border-[#0E5C44] bg-white ring-2 ring-[#0E5C44]/15 dark:border-[#3FBF75] dark:bg-[#111827] dark:ring-[#3FBF75]/20 text-slate-900 dark:text-white shadow-xs'
 : value !== '' && value !== undefined && value !== null && value !== 'all'
 ? 'border-emerald-300 bg-emerald-50/50 text-emerald-900 dark:border-emerald-800/80 dark:bg-emerald-950/40 dark:text-emerald-200'
 : 'border-emerald-200/90 bg-white text-slate-800 hover:border-emerald-300 dark:border-emerald-700/80 dark:bg-[#111827] dark:text-slate-100 dark:hover:border-emerald-600/80'
 }`}
 >
 <div className="flex items-center gap-1.5 truncate">
 {IconComponent && (
 <IconComponent className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
 )}
 <span className="truncate">
 {selectedOption ? selectedOption.label : placeholder}
 </span>
 </div>
 <ChevronDown
 className={`size-3.5 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
 }`}
 />
 </button>

 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ opacity: 0, scale: 0.96, y: -4 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.96, y: -4 }}
 transition={{ duration: 0.15, ease: 'easeOut' }}
 className={`absolute left-0 top-full mt-1.5 z-[90] ${popoverWidth} overflow-hidden rounded-xl border border-emerald-200/90 bg-white/95 backdrop-blur-md shadow-2xl dark:border-emerald-700/80/80 dark:bg-[#182232]/95`}
 >
 {searchable && options.length > 5 && (
 <div className="p-2 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <div className="relative">
 <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Cari..."
 className="w-full rounded-lg border border-emerald-200/80 bg-slate-50/60 pl-8 pr-2.5 py-1 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#0E5C44] focus:outline-none dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-100"
 autoFocus
 />
 </div>
 </div>
 )}

 <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
 {filteredOptions.length === 0 ? (
 <div className="px-3 py-3 text-center text-xs text-slate-400">
 Tidak ada data
 </div>
 ) : (
 filteredOptions.map((opt) => {
 const isSelected = String(opt.value) === String(value)
 return (
 <button
 key={String(opt.value)}
 type="button"
 disabled={opt.disabled}
 onClick={() => {
 onChange(opt.value)
 setIsOpen(false)
 }}
 className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold transition-colors text-left cursor-pointer ${isSelected
 ? 'bg-emerald-500/15 text-emerald-900 font-bold dark:bg-emerald-500/20 dark:text-emerald-300'
 : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300'
 }`}
 >
 <span className="truncate">{opt.label}</span>
 {isSelected && (
 <Check className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-1.5" />
 )}
 </button>
 )
 })
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 )
}

// ── HEROUI MODAL FORM SELECT DROPDOWN COMPONENT ──
function HeroUiModalSelect({
 value,
 onChange,
 options = [],
 placeholder = 'Pilih...',
 label = null,
 required = false,
 icon: IconComponent = null,
 disabled = false,
 searchable = false,
 className = '',
}) {
 const [isOpen, setIsOpen] = useState(false)
 const [search, setSearch] = useState('')
 const containerRef = React.useRef(null)

 useEffect(() => {
 function handleClickOutside(event) {
 if (containerRef.current && !containerRef.current.contains(event.target)) {
 setIsOpen(false)
 }
 }
 if (isOpen) {
 document.addEventListener('mousedown', handleClickOutside)
 }
 return () => {
 document.removeEventListener('mousedown', handleClickOutside)
 }
 }, [isOpen])

 const selectedOption = useMemo(() => {
 return options.find((opt) => String(opt.value) === String(value))
 }, [options, value])

 const filteredOptions = useMemo(() => {
 if (!searchable || !search.trim()) return options
 const q = search.toLowerCase()
 return options.filter(
 (opt) =>
 (opt.label && String(opt.label).toLowerCase().includes(q)) ||
 (opt.subtext && String(opt.subtext).toLowerCase().includes(q))
 )
 }, [options, search, searchable])

 return (
 <div className={`relative w-full ${className}`} ref={containerRef}>
 {label && (
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 {label} {required && <span className="text-rose-500">*</span>}
 </label>
 )}

 {/* Button Trigger HeroUI */}
 <button
 type="button"
 disabled={disabled}
 onClick={() => {
 if (!disabled) {
 setIsOpen((prev) => !prev)
 setSearch('')
 }
 }}
 className={`w-full flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200 text-left cursor-pointer ${disabled
 ? 'bg-slate-100 dark:bg-slate-800/60 border-emerald-200/80 dark:border-emerald-800/60 text-slate-400 cursor-not-allowed'
 : isOpen
 ? 'border-[#0E5C44] bg-white ring-2 ring-[#0E5C44]/15 dark:border-[#3FBF75] dark:bg-slate-900 dark:ring-[#3FBF75]/20 text-slate-800 dark:text-slate-100 shadow-xs'
 : 'border-emerald-200/80 bg-white hover:border-emerald-300 dark:border-emerald-700/80 dark:bg-slate-900 dark:hover:border-emerald-600/80 text-slate-800 dark:text-slate-100'
 }`}
 >
 <div className="flex items-center gap-2 truncate">
 {IconComponent && (
 <IconComponent className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
 )}
 {selectedOption ? (
 <span className="truncate">{selectedOption.label}</span>
 ) : (
 <span className="text-slate-400 dark:text-slate-500 truncate">{placeholder}</span>
 )}
 </div>
 <ChevronDown
 className={`size-3.5 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
 }`}
 />
 </button>

 {/* Dropdown Popover Panel HeroUI */}
 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ opacity: 0, scale: 0.96, y: -4 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.96, y: -4 }}
 transition={{ duration: 0.15, ease: 'easeOut' }}
 className="absolute left-0 right-0 top-full mt-1.5 z-[95] overflow-hidden rounded-xl border border-emerald-200/90 bg-white/95 backdrop-blur-md shadow-2xl dark:border-emerald-700/80/80 dark:bg-[#182232]/95"
 >
 {searchable && options.length > 5 && (
 <div className="p-2 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <div className="relative">
 <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Ketik untuk mencari..."
 className="w-full rounded-lg border border-emerald-200/80 bg-slate-50/60 pl-8 pr-2.5 py-1.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#0E5C44] focus:outline-none dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-100"
 autoFocus
 />
 </div>
 </div>
 )}

 <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
 {filteredOptions.length === 0 ? (
 <div className="px-3 py-3 text-center text-xs text-slate-400">
 Tidak ada opsi yang sesuai
 </div>
 ) : (
 filteredOptions.map((opt) => {
 const isSelected = String(opt.value) === String(value)
 return (
 <button
 key={String(opt.value)}
 type="button"
 disabled={opt.disabled}
 onClick={() => {
 onChange(opt.value)
 setIsOpen(false)
 }}
 className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors text-left cursor-pointer ${isSelected
 ? 'bg-emerald-500/15 text-emerald-900 font-bold dark:bg-emerald-500/20 dark:text-emerald-300'
 : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300'
 }`}
 >
 <span className="truncate">{opt.label}</span>
 {isSelected && (
 <Check className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-1.5" />
 )}
 </button>
 )
 })
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 )
}

// ── DEFINISI TONE WARNA KARTU KPI MODERN (HEROUI SPEC) ──
const MODERN_CARD_TONES = {
 emerald: {
 card: 'border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
 glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
 iconBox: 'bg-slate-100 border border-emerald-200/70 text-slate-700 shadow-xs dark:bg-slate-800 dark:border-emerald-700/80 dark:text-slate-300 shadow-sm',
 tag: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
 title: 'text-emerald-700 dark:text-emerald-400',
 val: 'text-slate-900 dark:text-white',
 sub: 'text-slate-600 dark:text-slate-400',
 cta: 'text-emerald-700 dark:text-emerald-400',
 },
 blue: {
 card: 'border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] hover:border-sky-400 dark:border-sky-700/50 dark:from-sky-950/40 dark:via-blue-950/20 dark:to-slate-900',
 glow: 'bg-sky-400/20 group-hover:bg-sky-400/30',
 iconBox: 'bg-white dark:bg-[#1B2433] shadow-sm shadow-sky-500/30',
 tag: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300',
 title: 'text-sky-700 dark:text-sky-400',
 val: 'text-slate-900 dark:text-white',
 sub: 'text-slate-600 dark:text-slate-400',
 cta: 'text-sky-700 dark:text-sky-400',
 },
 purple: {
 card: 'border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] hover:border-purple-400 dark:border-purple-700/50 dark:from-purple-950/40 dark:via-indigo-950/20 dark:to-slate-900',
 glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
 iconBox: 'bg-slate-100 border border-emerald-200/70 text-slate-700 dark:bg-slate-800 dark:border-emerald-700/80 dark:text-slate-300 shadow-sm shadow-sm',
 tag: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300',
 title: 'text-purple-700 dark:text-purple-400',
 val: 'text-slate-900 dark:text-white',
 sub: 'text-slate-600 dark:text-slate-400',
 cta: 'text-purple-700 dark:text-purple-400',
 },
 amber: {
 card: 'border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
 glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
 iconBox: 'bg-white dark:bg-[#1B2433] shadow-sm shadow-sm',
 tag: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
 title: 'text-amber-700 dark:text-amber-400',
 val: 'text-slate-900 dark:text-white',
 sub: 'text-slate-600 dark:text-slate-400',
 cta: 'text-amber-700 dark:text-amber-400',
 },
}

function ModernKpiCard({ icon: Icon, label, subtext, value, tag, ctaText = 'Lihat Detail', tone = 'emerald', onClick }) {
 const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
 const isClickable = typeof onClick === 'function'

 return (
 <motion.article
 whileHover={{ scale: 1.02, y: -2 }}
 whileTap={{ scale: 0.98 }}
 transition={{ type: 'spring', stiffness: 400, damping: 25 }}
 onClick={onClick}
 role={isClickable ? 'button' : undefined}
 tabIndex={isClickable ? 0 : undefined}
 className={`group relative overflow-hidden rounded-2xl border-2 p-5 shadow-xs transition-[border-color,box-shadow] duration-150 text-left flex flex-col justify-between h-full ${isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
 } ${t.card}`}
 >
 {/* Ambient Glow */}

 {/* Header dengan Icon Box & Tag */}
 <div>
 <div className="flex items-center justify-between mb-3">
 <div className="flex items-center gap-2.5">
 <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-emerald-600 ${t.iconBox}`}>
 {Icon && <Icon className="h-5 w-5" />}
 </div>
 <div>
 <p className={`text-xs font-bold uppercase tracking-wider ${t.title}`}>{label}</p>
 </div>
 </div>
 {tag && (
 <span className={`rounded-lg px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${t.tag}`}>
 {tag}
 </span>
 )}
 </div>

 {/* Nilai Utama */}
 <p className={`text-3xl sm:text-4xl font-black tabular-nums tracking-tight ${t.val}`}>
 {value ?? '0'}
 </p>
 {subtext && (
 <p className={`mt-1 text-xs font-semibold ${t.sub}`}>
 {subtext}
 </p>
 )}
 </div>

 {/* CTA Footer */}
 {isClickable && (
 <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
 <span className={`text-xs font-bold ${t.cta}`}>{ctaText}</span>
 <ChevronRight className={`h-3.5 w-3.5 ${t.cta} transition-transform group-hover:translate-x-1`} />
 </div>
 )}
 </motion.article>
 )
}

function HarmonizedDeleteModal({ isOpen, onClose, onConfirm, item, isSubmitting }) {
 if (!isOpen || !item) return null

 return (
 <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
 <motion.div
 initial={{ opacity: 0, scale: 0.94 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.94 }}
 className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-2xl shadow-emerald-950/20 dark:bg-[#182232] shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]"
 >
 <div className="p-6">
 <div className="flex items-center gap-3.5 mb-4">
 <div className="flex h-9 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/60 dark:border-rose-800/60 dark:text-rose-400 shadow-md shadow-sm">
 <Trash2 className="h-6 w-6" />
 </div>
 <div>
 <span className="inline-block rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
 Hapus Permanen
 </span>
 <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
 Hapus Data Surah?
 </h3>
 </div>
 </div>

 <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
 Apakah Anda yakin ingin menghapus data surah ini dari database? Tindakan ini tidak dapat dibatalkan.
 </p>

 <div className="rounded-xl border border-rose-200/80 bg-rose-50/50 p-3.5 dark:border-rose-800/60 dark:bg-rose-950/20 mb-5">
 <div className="flex items-center justify-between">
 <p className="text-xs font-black text-rose-950 dark:text-rose-100">
 #{item?.nomor} • Surah {item?.nama_latin}
 </p>
 <span className="font-serif text-sm font-bold text-rose-800 dark:text-rose-300">
 {item?.nama}
 </span>
 </div>
 <p className="text-xs text-rose-800/80 dark:text-rose-300/80 mt-1">
 Tempat Turun: {item?.tempat_turun} • Jumlah: {item?.jumlah_ayat} Ayat
 </p>
 </div>

 <div className="flex items-center justify-end gap-3">
 <button
 type="button"
 onClick={onClose}
 disabled={isSubmitting}
 className="rounded-xl border border-emerald-200/80 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-700/80 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition-all cursor-pointer"
 >
 Batal
 </button>
 <button
 type="button"
 onClick={onConfirm}
 disabled={isSubmitting}
 className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 text-xs font-bold text-white shadow-md shadow-sm hover:brightness-105 disabled:opacity-50 transition-all cursor-pointer"
 >
 {isSubmitting && <RefreshCw className="h-4 w-4 animate-spin" />}
 Hapus Surah
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )
}

const emptySurah = {
 nomor: '',
 nama: '',
 nama_latin: '',
 jumlah_ayat: '',
 tempat_turun: 'Mekah',
 arti: '',
 deskripsi: '',
 audio_full: '',
}

export default function MasterQuranSurahPage() {
 const user = useAuthStore((state) => state.user)
 const canManageMaster = useMemo(() => {
 if (!user) return false
 const level = getUserRoleLevel(user)
 const perms = Array.isArray(user?.permissions) ? user.permissions : []
 return level <= ROLE_LEVELS.ADMIN || perms.includes('sistem.master_data')
 }, [user])

 const [surahs, setSurahs] = useState([])
 const pengaturan = usePengaturanStore((state) => state.pengaturan)
 const foundationName = resolveFoundationName(pengaturan)
 const [loading, setLoading] = useState(true)
 const [syncing, setSyncing] = useState(false)
 const [search, setSearch] = useState('')
 const [tempatFilter, setTempatFilter] = useState('all')
 const [currentPage, setCurrentPage] = useState(1)
 const [perPage, setPerPage] = useState(10)

 const tempatOptions = useMemo(() => [
 { value: 'all', label: 'Semua Tempat Turun' },
 { value: 'mekah', label: 'Mekah (Makkiyah)' },
 { value: 'madinah', label: 'Madinah (Madaniyah)' },
 ], [])

 const perPageOptions = useMemo(() => [
 { value: 10, label: '10 Baris' },
 { value: 25, label: '25 Baris' },
 { value: 50, label: '50 Baris' },
 { value: 114, label: 'Semua (114)' },
 ], [])

 const modalTempatOptions = useMemo(() => [
 { value: 'Mekah', label: 'Mekah (Makkiyah)' },
 { value: 'Madinah', label: 'Madinah (Madaniyah)' },
 ], [])

 // Toast notifications state
 const toast = useToast()
 const pushToast = (type, title, message = '') => {
 const tone = type === 'error' || type === 'danger' ? 'error' : type === 'warning' ? 'warning' : 'success'
 toast(message ? `${title}: ${message}` : title, tone)
 }

 // Delete modal state
 const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
 const [deleteItem, setDeleteItem] = useState(null)
 const [isDeleting, setIsDeleting] = useState(false)

 // State untuk Modal Form (Tambah/Edit)
 const [showModal, setShowModal] = useState(false)
 const [editingItem, setEditingItem] = useState(null)
 const [formData, setFormData] = useState(emptySurah)
 const [saving, setSaving] = useState(false)

 // State untuk Modal Detail Surah & Rincian Ayat (Ayah Reader)
 const [showAyatModal, setShowAyatModal] = useState(false)
 const [selectedSurahDetail, setSelectedSurahDetail] = useState(null)
 const [ayats, setAyats] = useState([])
 const [loadingAyat, setLoadingAyat] = useState(false)
 const [ayatSearch, setAyatSearch] = useState('')
 const [playingAudioUrl, setPlayingAudioUrl] = useState(null)
 const [audioRef, setAudioRef] = useState(null)

 // Fetch Surah list from Backend Database
 const fetchSurahs = async () => {
 setLoading(true)
 try {
 const data = await equranService.getSurahs()
 setSurahs(data || [])
 } catch (e) {
 console.error('Failed loading surah data', e)
 pushToast('error', 'Gagal Memuat Data', 'Gagal memuat data surah dari database')
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 fetchSurahs()
 }, [])

 // Auto Sync 114 Surah from EQuran.id API
 const handleSync = async () => {
 setSyncing(true)
 try {
 const res = await equranService.syncSurah()
 await fetchSurahs()
 pushToast('success', 'Sync Berhasil', res?.message || '114 Surah berhasil disinkronkan ke database!')
 } catch (e) {
 console.error('EQuran Sync Error:', e)
 const errorMsg =
 e?.response?.data?.message ||
 e?.message ||
 'Gagal melakukan sinkronisasi data dengan EQuran.id. Silakan periksa koneksi internet atau hak akses Anda.'
 pushToast('error', 'Gagal Melakukan Sync', errorMsg)
 } finally {
 setSyncing(false)
 }
 }

 // Open Ayah Reader Modal when clicking a Surah Name
 const handleOpenAyatDetail = async (surah) => {
 setSelectedSurahDetail(surah)
 setAyats([])
 setAyatSearch('')
 setShowAyatModal(true)
 setLoadingAyat(true)

 try {
 const detail = await equranService.getSurahDetail(surah.nomor || surah.id)
 if (detail) {
 setSelectedSurahDetail(detail.surah || surah)
 setAyats(detail.ayat || [])
 }
 } catch (e) {
 console.error('Failed loading ayats:', e)
 pushToast('error', 'Gagal Memuat Ayat', 'Gagal memuat rincian ayat untuk surah ini.')
 } finally {
 setLoadingAyat(false)
 }
 }

 // Play / Pause Audio
 const handlePlayAudio = (url) => {
 if (!url) return
 if (playingAudioUrl === url && audioRef) {
 audioRef.pause()
 setPlayingAudioUrl(null)
 return
 }

 if (audioRef) {
 audioRef.pause()
 }

 const newAudio = new Audio(url)
 newAudio.play()
 setAudioRef(newAudio)
 setPlayingAudioUrl(url)

 newAudio.onended = () => {
 setPlayingAudioUrl(null)
 }
 }

 // Close Ayah Modal & Stop Audio
 const handleCloseAyatModal = () => {
 if (audioRef) {
 audioRef.pause()
 }
 setPlayingAudioUrl(null)
 setShowAyatModal(false)
 }

 // Open Create Modal
 const handleOpenAdd = () => {
 setEditingItem(null)
 setFormData({
 ...emptySurah,
 nomor: surahs.length > 0 ? Math.max(...surahs.map((s) => Number(s.nomor) || 0)) + 1 : 1,
 })
 setShowModal(true)
 }

 // Open Edit Modal
 const handleOpenEdit = (surah, e) => {
 e.stopPropagation()
 setEditingItem(surah)
 setFormData({
 nomor: surah.nomor || '',
 nama: surah.nama || '',
 nama_latin: surah.nama_latin || '',
 jumlah_ayat: surah.jumlah_ayat || '',
 tempat_turun: surah.tempat_turun || 'Mekah',
 arti: surah.arti || '',
 deskripsi: surah.deskripsi || '',
 audio_full: surah.audio_full || '',
 })
 setShowModal(true)
 }

 // Save (Create or Update)
 const handleSubmit = async (e) => {
 e.preventDefault()
 setSaving(true)
 try {
 const payload = {
 ...formData,
 nomor: Number(formData.nomor),
 jumlah_ayat: Number(formData.jumlah_ayat),
 }

 if (editingItem) {
 await equranService.updateSurah(editingItem.id, payload)
 pushToast('success', 'Berhasil Diperbarui', 'Data surah berhasil diperbarui')
 } else {
 await equranService.createSurah(payload)
 pushToast('success', 'Surah Ditambahkan', 'Surah baru berhasil ditambahkan ke database')
 }

 setShowModal(false)
 fetchSurahs()
 } catch (e) {
 console.error(e)
 const errMessage = e.response?.data?.message || 'Gagal menyimpan data surah. Periksa kembali form input.'
 pushToast('error', 'Gagal Menyimpan', errMessage)
 } finally {
 setSaving(false)
 }
 }

 // Delete Surah modal trigger
 const handleDelete = (surah, e) => {
 e?.stopPropagation()
 setDeleteItem(surah)
 setIsDeleteModalOpen(true)
 }

 // Confirm Delete Surah
 const handleConfirmHapus = async () => {
 if (!deleteItem) return
 setIsDeleting(true)
 try {
 await equranService.deleteSurah(deleteItem.id)
 pushToast('success', 'Terhapus', `Surah ${deleteItem.nama_latin} berhasil dihapus dari database`)
 setIsDeleteModalOpen(false)
 setDeleteItem(null)
 fetchSurahs()
 } catch (e) {
 console.error(e)
 pushToast('error', 'Gagal Menghapus', 'Gagal menghapus data surah dari database')
 } finally {
 setIsDeleting(false)
 }
 }

 // Debounced search for smooth typing without jitter
 const debouncedSearch = useDebounce(search, 350)

 // Filtered List Surahs
 const filteredSurahs = useMemo(() => {
 return surahs.filter((s) => {
 const matchSearch =
 debouncedSearch === '' ||
 s.nama_latin?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
 s.nama?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
 s.arti?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
 String(s.nomor).includes(debouncedSearch)

 const matchTempat =
 tempatFilter === 'all' || s.tempat_turun?.toLowerCase() === tempatFilter.toLowerCase()

 return matchSearch && matchTempat
 })
 }, [surahs, debouncedSearch, tempatFilter])

 // Pagination calculation
 const totalPages = Math.max(1, Math.ceil(filteredSurahs.length / perPage))
 const paginatedSurahs = useMemo(() => {
 const start = (currentPage - 1) * perPage
 return filteredSurahs.slice(start, start + perPage)
 }, [filteredSurahs, currentPage, perPage])

 const handleResetFilter = () => {
 setSearch('')
 setTempatFilter('all')
 setCurrentPage(1)
 }

 // Filtered List Ayats in Reader Modal
 const filteredAyats = useMemo(() => {
 if (!ayatSearch) return ayats
 return ayats.filter(
 (a) =>
 String(a.nomor_ayat).includes(ayatSearch) ||
 a.teks_latin?.toLowerCase().includes(ayatSearch.toLowerCase()) ||
 a.teks_indonesia?.toLowerCase().includes(ayatSearch.toLowerCase())
 )
 }, [ayats, ayatSearch])

 // Stats Calculation (Robust for all variants of field names)
 const stats = useMemo(() => {
 let totalAyat = 0
 let makkiyah = 0
 let madaniyah = 0

 surahs.forEach((s) => {
 const ayatCount = Number(s.jumlah_ayat || s.jumlahAyat || 0)
 totalAyat += ayatCount

 const tempat = String(s.tempat_turun || s.tempatTurun || '').toLowerCase()
 if (tempat.includes('mekah') || tempat.includes('mecca') || tempat.includes('makkiyah')) {
 makkiyah++
 } else if (tempat.includes('madinah') || tempat.includes('medina') || tempat.includes('madaniyah')) {
 madaniyah++
 } else {
 makkiyah++
 }
 })

 return { count: surahs.length, totalAyat, makkiyah, madaniyah }
 }, [surahs])

  const quranColumns = useMemo(
    () => [
      {
        key: 'nomor',
        label: 'No',
        className: 'w-16 px-4 py-3.5 text-center font-black text-emerald-700 dark:text-emerald-400',
        render: (s) => `#${s.nomor}`
      },
      {
        key: 'nama_latin',
        label: 'Nama Surah (Klik Rincian Ayat)',
        className: 'min-w-[200px]',
        render: (s) => (
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 flex items-center gap-1.5 text-sm">
              <span>{s.nama_latin}</span>
              <Eye className="w-3.5 h-3.5 text-emerald-600 opacity-60 group-hover:opacity-100 transition-opacity" />
            </span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Surah ke-{s.nomor} • {s.tempat_turun === 'madinah' ? 'Madaniyah' : 'Makkiyah'}
            </span>
          </div>
        )
      },
      {
        key: 'nama',
        label: 'Nama Arab',
        className: 'hidden sm:table-cell px-4 py-3.5 text-right font-serif text-lg font-bold text-slate-900 dark:text-slate-100',
        render: (s) => s.nama
      },
      {
        key: 'arti',
        label: 'Arti',
        className: 'hidden md:table-cell px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400 italic',
        render: (s) => `"${s.arti}"`
      },
      {
        key: 'jumlah_ayat',
        label: 'Ayat',
        className: 'hidden sm:table-cell px-4 py-3.5 text-center font-bold text-xs',
        render: (s) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
            {s.jumlah_ayat} Ayat
          </span>
        )
      }
    ],
    []
  )

  const renderMobileCard = useCallback(
    (s) => (
      <MobileDataCard
        key={s.id || s.nomor}
        title={`${s.nomor}. ${s.nama_latin} (${s.nama})`}
        subtitle={s.arti ? `"${s.arti}"` : undefined}
        statusBadge={
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
            {s.jumlah_ayat} Ayat
          </span>
        }
        fields={[
          { label: 'Tempat Turun', value: s.tempat_turun === 'madinah' ? 'Madaniyah' : 'Makkiyah' },
          { label: 'Urutan Pewahyuan', value: s.urutan_pewahyuan ? `Ke-${s.urutan_pewahyuan}` : '-' }
        ]}
        onView={() => handleOpenAyatDetail(s)}
        onEdit={canManageMaster ? () => handleOpenEdit(s) : undefined}
        onDelete={canManageMaster ? () => handleDelete(s) : undefined}
      />
    ),
    [canManageMaster, handleOpenAyatDetail, handleOpenEdit, handleDelete]
  )

  const quranPageActions = useMemo(
    () => (
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
        {canManageMaster && (
          <SquircleActionButton
            variant="secondary"
            icon={RefreshCw}
            label="Sync EQuran.id"
            disabled={syncing}
            onClick={handleSync}
          />
        )}
        <SquircleActionButton
          variant="print"
          icon={Printer}
          label="Cetak Katalog"
          onClick={() => {
            const rows = (filteredSurahs || []).map((s, idx) => [
              s.nomor || idx + 1,
              s.nama_latin || '-',
              s.nama || '-',
              s.arti || '-',
              s.tempat_turun || '-',
              `${s.jumlah_ayat || 0} Ayat`,
            ])
            printCleanTable({
              title: 'KATALOG SURAH AL-QURAN',
              subtitle: `Data Master Al-Quran Terpadu ${foundationName}`,
              headers: ['No', 'Nama Surah', 'Nama Arab', 'Arti', 'Tempat Turun', 'Jumlah Ayat'],
              rows,
              orientation: 'portrait',
            })
          }}
        />
        <SquircleActionButton
          variant="export"
          icon={Download}
          label="Export JSON"
          onClick={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(surahs, null, 2))
            const downloadAnchor = document.createElement('a')
            downloadAnchor.setAttribute("href", dataStr)
            downloadAnchor.setAttribute("download", `master_surah_quran_${new Date().toISOString().slice(0, 10)}.json`)
            document.body.appendChild(downloadAnchor)
            downloadAnchor.click()
            downloadAnchor.remove()
            pushToast('success', 'Export Berhasil', "Data surah Al-Qur'an berhasil diexport")
          }}
        />
        {canManageMaster && (
          <SquircleActionButton
            variant="create"
            icon={Plus}
            label="Tambah Surah"
            onClick={handleOpenAdd}
          />
        )}
      </div>
    ),
    [canManageMaster, syncing, handleSync, filteredSurahs, foundationName, surahs, pushToast, handleOpenAdd]
  )

 return (
 <PageContainer maxW="7xl">
 <AppBreadcrumb className="mb-6" items={[{ label: 'Master Data', href: '/dashboard' }, { label: 'Surah Al-Qur\'an' }]} />

 <div className="mb-6">
        <HeroUiHeader
          title="Master Surah Al-Qur'an"
          subtitle="Pengelolaan data 114 surah Al-Qur'an, jumlah ayat, tempat turun (Makkiyah/Madaniyah), serta sinkronisasi audio & teks."
          badge="114 Surah"
          icon={BookOpen}
        />
      </div>

 <MasterDataPage className="quran-master-page space-y-6" hideBreadcrumb>
 {/* Summary Cards Grid (ModernKpiCard with MODERN_CARD_TONES & Ambient Glow) */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
 <ModernKpiCard
 label="Total Surah Terdata"
 value={stats.count}
 subtext="Surah tersimpan di database"
 tag="Database"
 icon={Layers}
 tone="emerald"
 ctaText="Semua Surah"
 onClick={() => { setTempatFilter('all'); setCurrentPage(1) }}
 />
 <ModernKpiCard
 label="Total Ayat Al-Qur'an"
 value={stats.totalAyat.toLocaleString('id-ID')}
 subtext="Akumulasi seluruh ayat mushaf"
 tag="Mushaf 30 Juz"
 icon={FileText}
 tone="blue"
 ctaText="Mushaf Lengkap"
 />
 <ModernKpiCard
 label="Surah Makkiyah"
 value={stats.makkiyah}
 subtext="Surah diturunkan di Mekah"
 tag="Mekah"
 icon={MapPin}
 tone="purple"
 ctaText="Filter Makkiyah"
 onClick={() => { setTempatFilter('mekah'); setCurrentPage(1) }}
 />
 <ModernKpiCard
 label="Surah Madaniyah"
 value={stats.madaniyah}
 subtext="Surah diturunkan di Madinah"
 tag="Madinah"
 icon={CheckCircle}
 tone="amber"
 ctaText="Filter Madaniyah"
 onClick={() => { setTempatFilter('madinah'); setCurrentPage(1) }}
 />
 </div>

        {/* ── Master Datatable Panel (AppDataTable) ── */}
        <AppDataTable
          id="tabel-katalog-surah"
          title="Katalog 114 Surah Al-Qur'an"
          icon={BookOpen}
          iconClassName="bg-emerald-50 border border-emerald-200/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm"
          countLabel={`${Number(filteredSurahs.length).toLocaleString('id-ID')} Surah`}
          description="Katalog surah Al-Qur'an lengkap dengan teks Arab, transliterasi Latin, arti, tafsir, dan audio qari."
          actions={quranPageActions}
          search={search}
          onSearchChange={(value) => {
            setSearch(value)
            setCurrentPage(1)
          }}
          searchPlaceholder="Cari nomor surah, nama latin (contoh: Al-Baqarah), nama Arab, atau arti..."
          filters={
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-1 w-full">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="text-emerald-700 dark:text-emerald-400">Filter:</span>
                </span>

                <HeroUiFilterSelect
                  value={tempatFilter}
                  onChange={(val) => { setTempatFilter(val); setCurrentPage(1) }}
                  options={tempatOptions}
                  placeholder="Tempat Turun"
                  icon={MapPin}
                  className="w-full sm:w-auto min-w-[170px]"
                  popoverWidth="w-56"
                />

                <HeroUiFilterSelect
                  value={perPage}
                  onChange={(val) => { setPerPage(Number(val)); setCurrentPage(1) }}
                  options={perPageOptions}
                  placeholder="Per Halaman"
                  icon={Layers}
                  className="w-full sm:w-auto min-w-[130px]"
                  popoverWidth="w-36"
                />
              </div>

              {(search || tempatFilter !== 'all') && (
                <button
                  type="button"
                  onClick={handleResetFilter}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/70 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300 cursor-pointer transition-all self-start sm:self-auto"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>
          }
          columns={quranColumns}
          data={paginatedSurahs}
          renderMobileCard={renderMobileCard}
          page={currentPage}
          totalPages={totalPages}
          totalItems={filteredSurahs.length}
          itemsPerPage={perPage}
          onPageChange={setCurrentPage}
          isLoading={loading}
          onRowClick={(s) => handleOpenAyatDetail(s)}
          onView={(s) => handleOpenAyatDetail(s)}
          onEdit={canManageMaster ? (s) => handleOpenEdit(s) : undefined}
          onDelete={canManageMaster ? (s) => handleDelete(s) : undefined}
          actionColumnLabel="AKSI"
        />

 {/* MODAL DETAIL SURAH & RINCIAN AYAT (Harmonized Ayah Reader Modal - z-[70]) */}
 {showAyatModal && selectedSurahDetail && (
 <div className="fixed inset-0 z-[70] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
 <motion.div
 initial={{ opacity: 0, scale: 0.94 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.94 }}
 className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-2xl shadow-emerald-950/20 dark:bg-[#182232] shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433] flex flex-col"
 >
 {/* Top Emerald Accent Line */}

 {/* Modal Header dengan Squircle 3D Icon Badge */}
 <div className="p-5 sm:p-6 border-b border-emerald-100/80 dark:border-emerald-900/40 bg-slate-50/50 dark:bg-slate-900/50 flex items-start justify-between gap-4 shrink-0">
 <div className="flex items-start gap-4">
 <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-700/80 dark:text-emerald-300 shadow-md shadow-sm border-2 border-emerald-300">
 <BookOpen className="size-6 text-emerald-600" />
 </div>
 <div>
 <div className="flex items-center gap-2 flex-wrap">
 <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
 Surah Ke-{selectedSurahDetail.nomor} • {selectedSurahDetail.tempat_turun}
 </span>
 <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
 {selectedSurahDetail.jumlah_ayat} Ayat
 </span>
 </div>
 <div className="flex items-baseline gap-3 mt-1 flex-wrap">
 <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
 {selectedSurahDetail.nama_latin}
 </h2>
 <span className="text-xl font-serif font-bold text-emerald-700 dark:text-emerald-400">
 {selectedSurahDetail.nama}
 </span>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-0.5">
 "{selectedSurahDetail.arti}"
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2">
 {selectedSurahDetail.audio_full && (
 <button
 onClick={() => handlePlayAudio(selectedSurahDetail.audio_full)}
 className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${playingAudioUrl === selectedSurahDetail.audio_full
 ? 'bg-emerald-600 text-white shadow-md animate-pulse'
 : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300'
 }`}
 >
 {playingAudioUrl === selectedSurahDetail.audio_full ? (
 <>
 <Pause className="w-3.5 h-3.5" /> Pause
 </>
 ) : (
 <>
 <Play className="w-3.5 h-3.5" /> Murottal Full
 </>
 )}
 </button>
 )}

 <button
 onClick={handleCloseAyatModal}
 className="rounded-xl p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 hover:text-slate-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 dark:hover:text-slate-200 transition-colors cursor-pointer"
 >
 <X className="w-5 h-5" />
 </button>
 </div>
 </div>

 {/* Ayah Search Bar */}
 <div className="bg-slate-50 dark:bg-slate-900/60 border-b border-emerald-200/80 dark:border-emerald-800/60 px-5 py-2.5 flex items-center justify-between gap-4 shrink-0">
 <div className="relative flex-1 max-w-sm">
 <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
 <input
 type="text"
 value={ayatSearch}
 onChange={(e) => setAyatSearch(e.target.value)}
 placeholder="Cari nomor ayat atau teks terjemahan..."
 className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-700/80 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
 />
 </div>

 <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold hidden sm:inline">
 Menampilkan {filteredAyats.length} dari {ayats.length} Ayat
 </span>
 </div>

 {/* Ayah List Content */}
 <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/50 dark:bg-slate-900/30">
 {loadingAyat ? (
 <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-3">
 <Loader2 className="w-10 h-9 animate-spin text-emerald-600" />
 <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Memuat rincian ayat Al-Qur'an...</span>
 </div>
 ) : filteredAyats.length === 0 ? (
 <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-2">
 <BookOpen className="w-10 h-9 text-slate-300" />
 <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Ayat tidak ditemukan</span>
 </div>
 ) : (
 filteredAyats.map((ayat) => (
 <div
 key={ayat.nomor_ayat}
 className="bg-white dark:bg-[#1C2637] p-4 sm:p-5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs hover:shadow-md transition-shadow space-y-3 relative group"
 >
 {/* Header Item Ayat: Nomor & Action */}
 <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-2.5">
 <div className="flex items-center gap-2">
 <span className="size-8 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-700/80 dark:text-emerald-300 font-black text-xs flex items-center justify-center shadow-xs">
 {ayat.nomor_ayat}
 </span>
 <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
 {selectedSurahDetail.nama_latin} : Ayat {ayat.nomor_ayat}
 </span>
 </div>

 {ayat.audio && (
 <button
 onClick={() => handlePlayAudio(ayat.audio)}
 className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${playingAudioUrl === ayat.audio
 ? 'bg-emerald-600 text-white shadow-md animate-pulse'
 : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
 }`}
 title="Dengar Audio Ayat"
 >
 {playingAudioUrl === ayat.audio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
 <span>Audio</span>
 </button>
 )}
 </div>

 {/* Teks Arab (Right Aligned, Large Font) */}
 <div className="text-right text-2xl sm:text-3xl font-serif leading-loose text-slate-900 dark:text-white tracking-wide font-medium py-2">
 {ayat.teks_arab}
 </div>

 {/* Transliterasi Latin (Highlighted Text) */}
 <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border-l-4 border-emerald-500 p-3 rounded-r-xl text-emerald-900 dark:text-emerald-200 text-sm font-semibold italic">
 "{ayat.teks_latin}"
 </div>

 {/* Terjemahan Indonesia */}
 <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-normal pl-1">
 <span className="font-semibold text-slate-400 text-xs mr-2">Artinya:</span>
 {ayat.teks_indonesia}
 </div>
 </div>
 ))
 )}
 </div>

 {/* Modal Footer */}
 <div className="bg-white dark:bg-[#1B2433] border-t border-emerald-200/80 dark:border-emerald-800/60 px-6 py-4 flex items-center justify-between shrink-0">
 <span className="text-xs text-slate-500 dark:text-slate-400">
 Data resmi Kementerian Agama RI via EQuran.id API
 </span>
 <button
 onClick={handleCloseAyatModal}
 className="px-5 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg transition-all cursor-pointer border border-emerald-600 h-9 text-sm font-medium"
 >
 Tutup Pembaca Ayat
 </button>
 </div>
 </motion.div>
 </div>
 )}

 {/* MODAL FORM ADD / EDIT (Harmonized Add/Edit Modal - z-[70]) */}
 {showModal && (
 <div className="fixed inset-0 z-[70] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
 <motion.div
 initial={{ opacity: 0, scale: 0.94 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.94 }}
 className="relative w-full max-w-lg overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-2xl shadow-emerald-950/20 dark:bg-[#182232] shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]"
 >
 {/* Top Accent Line (Amber for edit, Emerald for new) */}

 <div className="p-6">
 {/* Dialog Header dengan Squircle 3D Icon Badge */}
 <div className="flex items-center gap-3.5 mb-5">
 <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-600 shadow-sm">
 <BookOpen className="size-6 text-emerald-600" />
 </div>
 <div>
 <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${editingItem ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'}`}>
 {editingItem ? 'Perbarui Data' : 'Surah Baru'}
 </span>
 <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
 {editingItem ? `Edit Surah: ${editingItem.nama_latin}` : 'Tambah Surah Baru Manual'}
 </h3>
 </div>
 </div>

 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor Surah</label>
 <input
 type="number"
 required
 min="1"
 value={formData.nomor}
 onChange={(e) => setFormData({ ...formData, nomor: e.target.value })}
 className="w-full px-3 py-2 border border-emerald-200/80 dark:border-emerald-700/80 dark:bg-slate-900 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Jumlah Ayat</label>
 <input
 type="number"
 required
 min="1"
 value={formData.jumlah_ayat}
 onChange={(e) => setFormData({ ...formData, jumlah_ayat: e.target.value })}
 className="w-full px-3 py-2 border border-emerald-200/80 dark:border-emerald-700/80 dark:bg-slate-900 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Latin (Al-Fatihah)</label>
 <input
 type="text"
 required
 value={formData.nama_latin}
 onChange={(e) => setFormData({ ...formData, nama_latin: e.target.value })}
 className="w-full px-3 py-2 border border-emerald-200/80 dark:border-emerald-700/80 dark:bg-slate-900 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Arab</label>
 <input
 type="text"
 required
 dir="rtl"
 value={formData.nama}
 onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
 className="w-full px-3 py-2 border border-emerald-200/80 dark:border-emerald-700/80 dark:bg-slate-900 rounded-xl text-xs font-serif font-bold text-right focus:ring-2 focus:ring-emerald-500 focus:outline-none"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Arti Surah</label>
 <input
 type="text"
 required
 value={formData.arti}
 onChange={(e) => setFormData({ ...formData, arti: e.target.value })}
 className="w-full px-3 py-2 border border-emerald-200/80 dark:border-emerald-700/80 dark:bg-slate-900 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
 />
 </div>
 <div>
 <HeroUiModalSelect
 label="Tempat Turun"
 value={formData.tempat_turun}
 onChange={(val) => setFormData({ ...formData, tempat_turun: val })}
 options={modalTempatOptions}
 placeholder="Pilih Tempat Turun"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">URL Audio MP3 (Opsional)</label>
 <input
 type="url"
 value={formData.audio_full}
 onChange={(e) => setFormData({ ...formData, audio_full: e.target.value })}
 placeholder="https://..."
 className="w-full px-3 py-2 border border-emerald-200/80 dark:border-emerald-700/80 dark:bg-slate-900 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
 />
 </div>

 <div className="flex items-center justify-end gap-3 pt-4 border-t border-emerald-200/80 dark:border-emerald-800/60">
 <button
 type="button"
 onClick={() => setShowModal(false)}
 className="rounded-xl border border-emerald-200/80 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-emerald-700/80 dark:text-slate-300 dark:hover:bg-slate-800 transition-all cursor-pointer"
 >
 Batal
 </button>
 <button
 type="submit"
 disabled={saving}
 className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 dark:bg-slate-100 dark:text-slate-900 dark: px-5 py-2 text-xs font-bold shadow-md shadow-sm hover:brightness-105 disabled:opacity-50 transition-all cursor-pointer text-white border border-emerald-600 h-9 text-sm font-medium"
 >
 {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
 <span>{editingItem ? 'Simpan Perubahan' : 'Tambah Surah'}</span>
 </button>
 </div>
 </form>
 </div>
 </motion.div>
 </div>
 )}

 {/* Harmonized Delete Modal */}
 <HarmonizedDeleteModal
 isOpen={isDeleteModalOpen}
 onClose={() => {
 setIsDeleteModalOpen(false)
 setDeleteItem(null)
 }}
 onConfirm={handleConfirmHapus}
 item={deleteItem}
 isSubmitting={isDeleting}
 />


 </MasterDataPage>
 </PageContainer>
 )
}
