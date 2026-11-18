import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Video,
  Music,
  Presentation,
  FileCode,
  Image as ImageIcon,
  Link as LinkIcon,
  Plus,
  Search,
  Edit3,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Eye,
  FileUp,
  Clock,
  Layers,
  BookOpen,
  Download,
  PlayCircle,
  Info,
} from 'lucide-react'
import Swal from '@/components/ui/compat/swal-heroui'
import { lmsMediaService } from '../services/lmsMediaService'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { useDebounce } from '../hooks/useDebounce'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import {
  MasterDataTable,
  SquircleActionButton,
  PrintOptionModal,
} from '../components/master-data'
import CsvImportModal from '../components/master-data/CsvImportModal'
import {
  TableRoot,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import ActionDropdown from '../components/app/ActionDropdown'
import { RotateCcw, Printer } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
}

function KpiTintedCard({ icon: Icon, label, subtext, value, tone = 'emerald', onClick }) {
  const tones = {
    emerald: {
      card: 'border-emerald-100 bg-emerald-50/50 hover:border-emerald-200 dark:border-emerald-950/50 dark:bg-emerald-950/20',
      title: 'text-emerald-700 dark:text-emerald-400',
      icon: 'text-emerald-500',
      val: 'text-emerald-600 dark:text-emerald-300',
      sub: 'text-emerald-600/70 dark:text-emerald-400/70',
    },
    red: {
      card: 'border-red-100 bg-red-50/50 hover:border-red-200 dark:border-red-950/50 dark:bg-red-950/20',
      title: 'text-red-700 dark:text-red-400',
      icon: 'text-red-500',
      val: 'text-red-600 dark:text-red-300',
      sub: 'text-red-600/70 dark:text-red-400/70',
    },
    blue: {
      card: 'border-blue-100 bg-blue-50/50 hover:border-blue-200 dark:border-blue-950/50 dark:bg-blue-950/20',
      title: 'text-blue-700 dark:text-blue-400',
      icon: 'text-blue-500',
      val: 'text-blue-600 dark:text-blue-300',
      sub: 'text-blue-600/70 dark:text-blue-400/70',
    },
    purple: {
      card: 'border-purple-100 bg-purple-50/50 hover:border-purple-200 dark:border-purple-950/50 dark:bg-purple-950/20',
      title: 'text-purple-700 dark:text-purple-400',
      icon: 'text-purple-500',
      val: 'text-purple-600 dark:text-purple-300',
      sub: 'text-purple-600/70 dark:text-purple-400/70',
    },
    amber: {
      card: 'border-amber-100 bg-amber-50/50 hover:border-amber-200 dark:border-amber-950/50 dark:bg-amber-950/20',
      title: 'text-amber-700 dark:text-amber-400',
      icon: 'text-amber-500',
      val: 'text-amber-600 dark:text-amber-300',
      sub: 'text-amber-600/70 dark:text-amber-400/70',
    },
    teal: {
      card: 'border-teal-100 bg-teal-50/50 hover:border-teal-200 dark:border-teal-950/50 dark:bg-teal-950/20',
      title: 'text-teal-700 dark:text-teal-400',
      icon: 'text-teal-500',
      val: 'text-teal-600 dark:text-teal-300',
      sub: 'text-teal-600/70 dark:text-teal-400/70',
    },
  }
  const t = tones[tone] || tones.emerald
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={`text-left rounded-2xl border ${t.card} p-4 shadow-xs transition-all hover:shadow-md ${onClick ? 'cursor-pointer' : 'cursor-default'} group`}
    >
      <div className="flex items-center justify-between">
        <p className={`text-xs font-semibold ${t.title}`}>{label}</p>
        <Icon className={`h-4 w-4 ${t.icon} opacity-0 group-hover:opacity-100 transition-opacity`} />
      </div>
      <p className={`mt-2 text-2xl font-extrabold ${t.val}`}>{value ?? 0}</p>
      {subtext && (
        <p className={`mt-1 text-[10px] font-bold ${t.sub} flex items-center gap-0.5 truncate`}>
          {subtext}
        </p>
      )}
    </motion.div>
  )
}

function HarmonizedDeleteMediaModal({ isOpen, onClose, onConfirm, item, isSubmitting }) {
  if (!isOpen || !item) return null
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-rose-950/20 dark:border-slate-800 dark:bg-[#1B2433]"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-rose-600 to-red-700" />
        <div className="p-6">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white shadow-md shadow-rose-500/30">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <span className="inline-block rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                Hapus Permanen
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                Hapus Media Pembelajaran?
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            Apakah Anda yakin ingin menghapus media <strong className="text-slate-900 dark:text-white">"{item.nama_file}"</strong>?
          </p>
          <div className="rounded-xl border border-rose-200/80 bg-rose-50/50 p-3 dark:border-rose-900/40 dark:bg-rose-950/20 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-rose-800 dark:text-rose-300">
                File media ini tidak akan dapat diakses oleh siswa atau guru yang terhubung ke materi terkait.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="h-10 px-5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-xs font-extrabold text-white shadow-md shadow-rose-600/30 transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Menghapus...' : 'Ya, Hapus Media'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ── HEROUI MODAL FORM SELECT DROPDOWN COMPONENT ──
function HeroUiModalSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = '-- Pilih Opsi --',
  disabled = false,
  required = false,
  helperText = '',
  icon: IconComponent = null,
  searchable = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef(null)

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
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
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
        className={`w-full flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 text-left cursor-pointer ${
          disabled
            ? 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed'
            : isOpen
            ? 'border-[#0E5C44] bg-white ring-4 ring-[#0E5C44]/12 dark:border-[#3FBF75] dark:bg-slate-900 dark:ring-[#3FBF75]/20 text-slate-800 dark:text-slate-100 shadow-sm'
            : 'border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-slate-300 dark:border-slate-700/80 dark:bg-slate-900/50 dark:hover:bg-slate-900 dark:hover:border-slate-600 text-slate-800 dark:text-slate-100'
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
          className={`size-4 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
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
            className="absolute left-0 right-0 top-full mt-1.5 z-[90] overflow-hidden rounded-xl border border-slate-200/90 bg-white/95 backdrop-blur-md shadow-2xl dark:border-slate-700/80 dark:bg-[#182232]/95"
          >
            {/* Search Input jika searchable */}
            {searchable && options.length > 5 && (
              <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                <div className="relative">
                  <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Ketik untuk mencari..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/60 pl-8 pr-2.5 py-1.5 text-[11px] font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* List options */}
            <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
                  Tidak ada data yang cocok
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = String(opt.value) === String(value)
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => {
                        onChange(opt.value)
                        setIsOpen(false)
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors text-left cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
                          : 'text-slate-700 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div>{opt.label}</div>
                        {opt.subtext && (
                          <div className="text-[10px] text-slate-400 font-normal">{opt.subtext}</div>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {helperText && (
        <p className="mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          {helperText}
        </p>
      )}
    </div>
  )
}

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
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef(null)

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
        onClick={() => {
          setIsOpen((prev) => !prev)
          setSearch('')
        }}
        className={`h-9 w-full sm:w-auto min-w-[140px] flex items-center justify-between gap-2 rounded-xl border px-3 text-xs font-semibold transition-all duration-200 cursor-pointer ${
          isOpen
            ? 'border-[#0E5C44] bg-white ring-2 ring-[#0E5C44]/15 dark:border-[#3FBF75] dark:bg-[#111827] dark:ring-[#3FBF75]/20 text-slate-900 dark:text-white shadow-xs'
            : value !== '' && value !== undefined && value !== null
            ? 'border-emerald-300/80 bg-emerald-50/50 text-emerald-900 dark:border-emerald-800/80 dark:bg-emerald-950/40 dark:text-emerald-200'
            : 'border-slate-200/90 bg-white text-slate-800 hover:border-slate-300 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100 dark:hover:border-slate-600'
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
          className={`size-3.5 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
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
            className={`absolute left-0 top-full mt-1.5 z-[90] ${popoverWidth} overflow-hidden rounded-xl border border-slate-200/90 bg-white/95 backdrop-blur-md shadow-2xl dark:border-slate-700/80 dark:bg-[#182232]/95`}
          >
            {searchable && options.length > 5 && (
              <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                <div className="relative">
                  <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/60 pl-8 pr-2.5 py-1 text-[11px] font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-3 text-center text-xs text-slate-400 dark:text-slate-500">
                  Tidak ada data
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = String(opt.value) === String(value)
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value)
                        setIsOpen(false)
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors text-left cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
                          : 'text-slate-700 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      <span className="truncate pr-2">{opt.label}</span>
                      {isSelected && (
                        <Check className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
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

export default function LmsMediaPage({ embedded = false, hideBreadcrumb = false, hidePageHeader = false, tabNav = null }) {
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null, isSubmitting: false })
  const [dataMedia, setDataMedia] = useState([])
  const [optionsMateri, setOptionsMateri] = useState([])
  const [tipeOptions, setTipeOptions] = useState([
    { id: 'pdf', nama: 'Dokumen PDF', icon: FileText, color: 'text-red-500 bg-red-50 dark:bg-red-950/40 border-red-200' },
    { id: 'video', nama: 'Video Pembelajaran', icon: Video, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200' },
    { id: 'audio', nama: 'Audio / Podcast', icon: Music, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200' },
    { id: 'ppt', nama: 'Presentation / PPT', icon: Presentation, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200' },
    { id: 'word', nama: 'Dokumen Word / Doc', icon: FileCode, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200' },
    { id: 'image', nama: 'Gambar / Infografis', icon: ImageIcon, color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/40 border-pink-200' },
    { id: 'link', nama: 'Tautan / Link URL', icon: LinkIcon, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/40 border-teal-200' },
  ])

  const [stats, setStats] = useState({
    total_media: 0,
    total_pdf: 0,
    total_video: 0,
    total_audio: 0,
    total_ppt: 0,
    total_word: 0,
    total_image: 0,
    total_link: 0,
    total_materi: 0,
  })

  // KPI Modal State
  const [kpiModalOpen, setKpiModalOpen] = useState(false)
  const [kpiModalCategory, setKpiModalCategory] = useState({
    title: '',
    items: [],
  })

  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Filters & Pagination
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 350)
  const [selectedMateri, setSelectedMateri] = useState('')
  const [selectedTipe, setSelectedTipe] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  })

  const filterMateriOptions = useMemo(() => [
    { value: '', label: 'Semua Materi Pembelajaran' },
    ...optionsMateri.map((mat) => ({
      value: String(mat.id),
      label: mat.modul_ajar?.judul_modul ? `${mat.judul} (${mat.modul_ajar.judul_modul})` : mat.judul,
    })),
  ], [optionsMateri])

  const filterTipeOptions = useMemo(() => [
    { value: '', label: 'Semua Tipe Media' },
    ...tipeOptions.map((opt) => ({
      value: opt.id,
      label: opt.nama,
    })),
  ], [tipeOptions])

  const modalMateriOptions = useMemo(() => [
    ...optionsMateri.map((mat) => ({
      value: String(mat.id),
      label: mat.modul_ajar?.judul_modul ? `${mat.judul} (${mat.modul_ajar.judul_modul})` : mat.judul,
    })),
  ], [optionsMateri])

  const modalTipeOptions = useMemo(() => [
    ...tipeOptions.map((opt) => ({
      value: opt.id,
      label: opt.nama,
    })),
  ], [tipeOptions])

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [previewItem, setPreviewItem] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  const handleExportCSV = () => {
    const headers = ['NO', 'NAMA MEDIA', 'TIPE', 'MATERI', 'URL/BERKAS', 'DESKRIPSI', 'URUTAN']
    const rows = (dataMedia || []).map((m, i) => [
      i + 1,
      `"${(m.nama_file || '').replace(/"/g, '""')}"`,
      m.tipe_file || '',
      `"${(m.materi?.judul || '').replace(/"/g, '""')}"`,
      `"${(m.url_eksternal || m.file_url || '').replace(/"/g, '""')}"`,
      `"${(m.deskripsi || '').replace(/"/g, '""')}"`,
      m.urutan || 1,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `export_media_pembelajaran_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImport = async (parsedData) => {
    setSuccessMsg(`Berhasil mengimpor ${parsedData.length} data media pembelajaran.`)
    fetchDaftarMedia()
  }

  const pageActions = (
    <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
      <SquircleActionButton variant="import" label="Import Data" onClick={() => setImportOpen(true)} />
      <SquircleActionButton variant="export" label="Export Data" onClick={handleExportCSV} />
      <SquircleActionButton variant="view" icon={Printer} label="Cetak Data" onClick={() => setIsPrintModalOpen(true)} />
      <SquircleActionButton variant="primary" label="Tambah Media" onClick={() => handleOpenCreateModal()} />
    </div>
  )

  const [formData, setFormData] = useState({
    materi_id: '',
    nama_file: '',
    tipe_file: 'pdf',
    url_eksternal: '',
    ukuran_bytes: '',
    durasi_detik: '',
    deskripsi: '',
    urutan: 1,
  })

  const loadInitialOptionsAndStats = async () => {
    try {
      const [optRes, statsRes] = await Promise.all([
        lmsMediaService.getOptions(),
        lmsMediaService.getStats(),
      ])
      if (optRes?.data?.materi_options) {
        setOptionsMateri(optRes.data.materi_options)
      }
      if (statsRes?.data) {
        setStats(statsRes.data)
      }
    } catch (err) {
      console.error('Failed to load initial options and stats:', err)
    }
  }

  const computedStats = useMemo(() => {
    return {
      total_media: dataMedia.length,
      total_pdf: dataMedia.filter((m) => m.tipe_file === 'pdf').length,
      total_video: dataMedia.filter((m) => m.tipe_file === 'video').length,
      total_audio: dataMedia.filter((m) => m.tipe_file === 'audio').length,
      total_ppt: dataMedia.filter((m) => m.tipe_file === 'ppt').length,
      total_word: dataMedia.filter((m) => m.tipe_file === 'word' || m.tipe_file === 'doc').length,
      total_link: dataMedia.filter((m) => m.tipe_file === 'link' || !!m.url_eksternal).length,
    }
  }, [dataMedia])

  const handleOpenKpiModal = (type) => {
    let title = ''
    let items = []

    if (type === 'total') {
      title = 'Total Media Pembelajaran'
      items = dataMedia
    } else if (type === 'pdf') {
      title = 'Daftar Media Dokumen PDF'
      items = dataMedia.filter((m) => m.tipe_file === 'pdf')
    } else if (type === 'video') {
      title = 'Daftar Video Pembelajaran'
      items = dataMedia.filter((m) => m.tipe_file === 'video')
    } else if (type === 'audio') {
      title = 'Daftar Audio / Podcast'
      items = dataMedia.filter((m) => m.tipe_file === 'audio')
    } else if (type === 'ppt') {
      title = 'Daftar Slide Presentasi PPT'
      items = dataMedia.filter((m) => m.tipe_file === 'ppt')
    } else if (type === 'word') {
      title = 'Daftar Dokumen Office / Word'
      items = dataMedia.filter((m) => m.tipe_file === 'word' || m.tipe_file === 'doc')
    } else if (type === 'link') {
      title = 'Daftar Tautan URL / Link'
      items = dataMedia.filter((m) => m.tipe_file === 'link' || !!m.url_eksternal)
    }

    setKpiModalCategory({ title, items })
    setKpiModalOpen(true)
  }

  const fetchDaftarMedia = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const response = await lmsMediaService.getDaftar({
        page,
        search: debouncedSearch,
        materi_id: selectedMateri,
        tipe_file: selectedTipe,
        per_page: 15,
      })
      if (response?.data) {
        setDataMedia(response.data)
        if (response.meta) {
          setPagination({
            current_page: response.meta.current_page || 1,
            last_page: response.meta.last_page || 1,
            total: response.meta.total || 0,
            per_page: response.meta.per_page || 15,
          })
        }
        if (response.statistik) {
          setStats(response.statistik)
        }
      }
    } catch (err) {
      setErrorMsg('Gagal memuat daftar Media Pembelajaran. Silakan coba lagi.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInitialOptionsAndStats()
  }, [])

  useEffect(() => {
    fetchDaftarMedia()
  }, [page, debouncedSearch, selectedMateri, selectedTipe])

  const handleOpenCreateModal = () => {
    setEditingItem(null)
    setSelectedFile(null)
    setFormData({
      materi_id: optionsMateri[0]?.id || '',
      nama_file: '',
      tipe_file: 'pdf',
      url_eksternal: '',
      ukuran_bytes: '',
      durasi_detik: '',
      deskripsi: '',
      urutan: 1,
    })
    setModalOpen(true)
  }

  const handleOpenEditModal = (item) => {
    setEditingItem(item)
    setSelectedFile(null)
    setFormData({
      materi_id: item.materi_id || '',
      nama_file: item.nama_file || '',
      tipe_file: item.tipe_file || 'pdf',
      url_eksternal: item.url_eksternal || '',
      ukuran_bytes: item.ukuran_bytes || '',
      durasi_detik: item.durasi_detik || '',
      deskripsi: item.deskripsi || '',
      urutan: item.urutan || 1,
    })
    setModalOpen(true)
  }

  const handleOpenPreview = (item) => {
    setPreviewItem(item)
    setPreviewModalOpen(true)
  }

  const handleSubmitForm = async (e) => {
    e.preventDefault()
    if (!formData.materi_id) {
      setErrorMsg('Silakan pilih Materi Pembelajaran terlebih dahulu.')
      return
    }
    if (!formData.nama_file.trim()) {
      setErrorMsg('Nama file/media tidak boleh kosong.')
      return
    }

    setFormSubmitting(true)
    setErrorMsg('')
    try {
      const payload = new FormData()
      payload.append('materi_id', formData.materi_id)
      payload.append('nama_file', formData.nama_file)
      payload.append('tipe_file', formData.tipe_file)
      if (formData.url_eksternal) payload.append('url_eksternal', formData.url_eksternal)
      if (formData.durasi_detik) payload.append('durasi_detik', formData.durasi_detik)
      if (formData.deskripsi) payload.append('deskripsi', formData.deskripsi)
      if (formData.urutan) payload.append('urutan', formData.urutan)
      if (selectedFile) payload.append('file', selectedFile)

      if (editingItem) {
        await lmsMediaService.update(editingItem.id, payload)
        setSuccessMsg('Media Pembelajaran berhasil diperbarui.')
      } else {
        await lmsMediaService.create(payload)
        setSuccessMsg('Media Pembelajaran berhasil ditambahkan.')
      }

      setModalOpen(false)
      fetchDaftarMedia()
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      const respData = err.response?.data
      if (respData?.errors) {
        const firstErr = Object.values(respData.errors)[0]?.[0]
        setErrorMsg(firstErr || 'Terjadi kesalahan pada validasi data.')
      } else {
        setErrorMsg(respData?.message || 'Gagal menyimpan Media Pembelajaran.')
      }
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleDeleteItem = async (item) => {
    const confirmResult = await Swal.fire({
      title: 'Hapus Media Pembelajaran?',
      text: `Apakah Anda yakin ingin menghapus media "${item.nama_file}"? Berkas yang dihapus tidak dapat dipulihkan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus Media',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#e11d48',
    })
    if (!confirmResult.isConfirmed) {
      return
    }
    try {
      await lmsMediaService.delete(item.id)
      setSuccessMsg('Media Pembelajaran berhasil dihapus.')
      fetchDaftarMedia()
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      setErrorMsg('Gagal menghapus Media Pembelajaran.')
    }
  }

  const getTipeBadge = (tipe) => {
    switch (tipe?.toLowerCase()) {
      case 'pdf':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200/60">
            <FileText className="w-3.5 h-3.5" /> PDF
          </span>
        )
      case 'video':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60">
            <Video className="w-3.5 h-3.5" /> Video
          </span>
        )
      case 'audio':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/60">
            <Music className="w-3.5 h-3.5" /> Audio
          </span>
        )
      case 'ppt':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60">
            <Presentation className="w-3.5 h-3.5" /> PPT Slide
          </span>
        )
      case 'word':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60">
            <FileCode className="w-3.5 h-3.5" /> Word Doc
          </span>
        )
      case 'image':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300 border border-pink-200/60">
            <ImageIcon className="w-3.5 h-3.5" /> Gambar
          </span>
        )
      case 'link':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200/60">
            <LinkIcon className="w-3.5 h-3.5" /> Link URL
          </span>
        )
    }
  }

  return (
    <PageContainer maxW="7xl">
      {!(embedded || hideBreadcrumb) && (
        <AppBreadcrumb items={[{ label: 'LMS & Akademik', href: '/dashboard' }, { label: 'Media Pembelajaran' }]} />
      )}
      <div className="lms-media-page space-y-6">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <PrintOptionModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title="Media Pembelajaran"
          onPrint={() => {
            const rowsToPrint = Array.isArray(dataMedia) ? dataMedia : []
            printCleanTable({
              title: 'Laporan Data Media Pembelajaran',
              subtitle: 'Daftar Media Pembelajaran Sekolah Islam Terpadu',
              headers: ['NO', 'URUTAN', 'NAMA MEDIA', 'TIPE', 'MATERI PEMBELAJARAN', 'TAUTAN / BERKAS'],
              rows: rowsToPrint.map((row, i) => [
                i + 1,
                `#${row.urutan || 1}`,
                row.nama_file || '-',
                row.tipe_file || '-',
                row.materi?.judul || '-',
                row.url_eksternal || row.file_url || '-',
              ]),
            })
          }}
          onDownload={() => {
            const rowsToPrint = Array.isArray(dataMedia) ? dataMedia : []
            downloadPdfTable({
              title: 'Laporan Data Media Pembelajaran',
              subtitle: 'Daftar Media Pembelajaran Sekolah Islam Terpadu',
              headers: ['NO', 'URUTAN', 'NAMA MEDIA', 'TIPE', 'MATERI PEMBELAJARAN', 'TAUTAN / BERKAS'],
              rows: rowsToPrint.map((row, i) => [
                i + 1,
                `#${row.urutan || 1}`,
                row.nama_file || '-',
                row.tipe_file || '-',
                row.materi?.judul || '-',
                row.url_eksternal || row.file_url || '-',
              ]),
              filename: 'laporan_media_pembelajaran.pdf',
            })
          }}
        />

        <CsvImportModal
          open={importOpen}
          onClose={() => setImportOpen(false)}
          title="Media Pembelajaran"
          onImport={handleImport}
          columns={[
            { key: 'materi_id' },
            { key: 'nama_file', required: true, example: 'Video Tajwid Dasar' },
            { key: 'tipe_file', example: 'video' },
            { key: 'url_eksternal', example: 'https://youtube.com/...' },
            { key: 'deskripsi', example: 'Panduan tayangan...' },
            { key: 'urutan', example: '1' },
          ]}
        />
      {/* Hero Banner */}
      {!hidePageHeader && (
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 mb-6">
            <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                  <Video className="size-6 sm:size-7 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                      <Sparkles className="size-3 text-amber-300 animate-pulse" />
                      Modul LMS Terpadu
                    </span>
                  </div>
                  <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Media Pembelajaran (Multi-Format)
                  </h1>
                  <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 w-full">
                    Kelola seluruh berkas dan sumber media pembelajaran terpadu (PDF, Video, Audio, Presentasi PPT, Dokumen Word, Gambar, &amp; Link Eksternal).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <SquircleActionButton
                  variant="primary"
                  icon={Plus}
                  label="Tambah Media Baru"
                  onClick={handleOpenCreateModal}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Alert Messages */}
      {successMsg && (
        <div className="flex items-center justify-between p-4 rounded-[14px] bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-200 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-sm font-medium">{successMsg}</p>
          </div>
          <button onClick={() => setSuccessMsg('')} className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center justify-between p-4 rounded-[14px] bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/50 dark:border-red-800 dark:text-red-200 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
          <button onClick={() => setErrorMsg('')} className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        <KpiTintedCard
          icon={Layers}
          label="Total"
          value={computedStats.total_media}
          subtext="Media Pembelajaran"
          tone="emerald"
          onClick={() => handleOpenKpiModal('total')}
        />
        <KpiTintedCard
          icon={FileText}
          label="PDF"
          value={computedStats.total_pdf}
          subtext="Dokumen PDF"
          tone="red"
          onClick={() => handleOpenKpiModal('pdf')}
        />
        <KpiTintedCard
          icon={Video}
          label="Video"
          value={computedStats.total_video}
          subtext="Video Pembelajaran"
          tone="blue"
          onClick={() => handleOpenKpiModal('video')}
        />
        <KpiTintedCard
          icon={Music}
          label="Audio"
          value={computedStats.total_audio}
          subtext="Podcast / Audio"
          tone="purple"
          onClick={() => handleOpenKpiModal('audio')}
        />
        <KpiTintedCard
          icon={Presentation}
          label="PPT"
          value={computedStats.total_ppt}
          subtext="Slide Presentasi"
          tone="amber"
          onClick={() => handleOpenKpiModal('ppt')}
        />
        <KpiTintedCard
          icon={FileCode}
          label="Word"
          value={computedStats.total_word}
          subtext="Dokumen Office"
          tone="emerald"
          onClick={() => handleOpenKpiModal('word')}
        />
        <KpiTintedCard
          icon={LinkIcon}
          label="Link"
          value={computedStats.total_link}
          subtext="Tautan Eksternal"
          tone="teal"
          onClick={() => handleOpenKpiModal('link')}
        />
      </motion.div>

      {/* Tab Navigation Card (below KPI grid) */}
      {tabNav && (
        <motion.div variants={itemVariants}>
          {typeof tabNav === 'function' ? tabNav() : tabNav}
        </motion.div>
      )}

      {/* DATA TABLE CONTAINER (Integrated 3-Baris Emerald Datatable) */}
      <motion.div variants={itemVariants}>
      <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]" aria-labelledby="media-table-title">
        {/* Baris 1: Header Judul & Soft Pastel Squircle Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-200/90 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-5 py-4 sm:px-6 md:px-8 dark:border-emerald-800/60 dark:bg-gradient-to-r dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-transparent">
          <div>
            <div className="flex items-center gap-2">
              <h2 id="media-table-title" className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">Data Media Pembelajaran</h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/60">
                {pagination.total} Data
              </span>
            </div>
            <p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">Daftar berkas dan sumber media pembelajaran terpadu.</p>
          </div>
          {pageActions}
        </div>

        {/* Baris 2: Full-Width Search Bar dengan Debounce */}
        <div className="p-3 sm:p-4 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-emerald-950/30 border-b border-emerald-200/80 dark:border-emerald-800/60">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-emerald-600 dark:text-emerald-400" />
            <input
              type="text"
              placeholder="Cari nama media, deskripsi, atau materi..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="h-10 sm:h-11 w-full rounded-2xl border border-emerald-200/90 dark:border-emerald-800/60 bg-white dark:bg-[#151D2A] pl-10 pr-10 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 focus:border-[#0E5C44] transition-all shadow-xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setPage(1)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Baris 3: Dropdown Filter & Reset Button */}
        <div className="px-3 sm:px-4 py-2.5 border-b border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/40 flex flex-wrap items-center gap-2">
          <HeroUiFilterSelect
            value={selectedMateri}
            onChange={(val) => {
              setSelectedMateri(val)
              setPage(1)
            }}
            options={filterMateriOptions}
            placeholder="Semua Materi Pembelajaran"
            icon={BookOpen}
            searchable={true}
            popoverWidth="min-w-[260px]"
          />

          <HeroUiFilterSelect
            value={selectedTipe}
            onChange={(val) => {
              setSelectedTipe(val)
              setPage(1)
            }}
            options={filterTipeOptions}
            placeholder="Semua Tipe Media"
            icon={Layers}
            popoverWidth="min-w-[180px]"
          />

          {(search || selectedMateri || selectedTipe) && (
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setSelectedMateri('')
                setSelectedTipe('')
                setPage(1)
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ml-auto cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        <MasterDataTable className="!rounded-none !border-0 !shadow-none">
          <TableRoot className="w-full text-left text-sm border-collapse">
            <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
              <TableRow className="border-b-2 border-emerald-200/90 dark:border-emerald-800/80 bg-transparent text-emerald-950 dark:text-emerald-200">
                <TableHead className="w-[6%] bg-transparent px-5 sm:px-6 md:px-8 py-3.5 text-center font-extrabold text-[11px] uppercase tracking-wider">No</TableHead>
                <TableHead className="w-[8%] bg-transparent px-3 py-3.5 text-center font-extrabold text-[11px] uppercase tracking-wider">Urutan</TableHead>
                <TableHead className="w-[30%] bg-transparent px-3 py-3.5 font-extrabold text-[11px] uppercase tracking-wider">Nama Media / Lampiran</TableHead>
                <TableHead className="hidden w-[14%] bg-transparent px-3 py-3.5 text-center font-extrabold text-[11px] uppercase tracking-wider sm:table-cell">Tipe Media</TableHead>
                <TableHead className="hidden w-[22%] bg-transparent px-3 py-3.5 font-extrabold text-[11px] uppercase tracking-wider md:table-cell">Materi Pembelajaran</TableHead>
                <TableHead className="hidden w-[12%] bg-transparent px-3 py-3.5 text-center font-extrabold text-[11px] uppercase tracking-wider lg:table-cell">Ukuran / Durasi</TableHead>
                <TableHead className="w-[12%] bg-transparent px-3 py-3.5 text-center font-extrabold text-[11px] uppercase tracking-wider">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx} className="animate-pulse">
                    <TableCell className="px-6 py-4 text-center">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-6 mx-auto" />
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-6 mx-auto" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-24" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-36" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-20 mx-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : dataMedia.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Layers className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                      <p className="font-semibold text-slate-600 dark:text-slate-300">Belum ada Media Pembelajaran</p>
                      <p className="text-xs text-slate-400">Silakan tambahkan berkas media baru untuk materi pembelajaran.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                dataMedia.map((item, idx) => (
                  <TableRow
                    key={item.id}
                    onClick={() => handleOpenPreview(item)}
                    className="hover:bg-slate-50/90 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                  >
                    <TableCell className="py-3.5 px-5 sm:px-6 md:px-8 text-center font-medium text-slate-400">
                      {(pagination.current_page - 1) * pagination.per_page + idx + 1}
                    </TableCell>
                    <TableCell className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                        #{item.urutan || 1}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#0E5C44] dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 shrink-0">
                          {item.tipe_file === 'pdf' && <FileText className="w-5 h-5 text-red-500" />}
                          {item.tipe_file === 'video' && <Video className="w-5 h-5 text-blue-500" />}
                          {item.tipe_file === 'audio' && <Music className="w-5 h-5 text-purple-500" />}
                          {item.tipe_file === 'ppt' && <Presentation className="w-5 h-5 text-amber-500" />}
                          {item.tipe_file === 'word' && <FileCode className="w-5 h-5 text-emerald-500" />}
                          {item.tipe_file === 'image' && <ImageIcon className="w-5 h-5 text-pink-500" />}
                          {item.tipe_file === 'link' && <LinkIcon className="w-5 h-5 text-teal-500" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{item.nama_file}</p>
                          {item.url_eksternal && (
                            <a
                              href={item.url_eksternal}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 mt-0.5"
                            >
                              <ExternalLink className="w-3 h-3" /> Link Eksternal
                            </a>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden py-3.5 px-3 text-center sm:table-cell">{getTipeBadge(item.tipe_file)}</TableCell>
                    <TableCell className="hidden py-3.5 px-3 md:table-cell">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium line-clamp-1">
                          {item.materi?.judul || 'Tanpa Judul Materi'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden py-3.5 px-3 text-xs font-medium text-slate-500 dark:text-slate-400 lg:table-cell">
                      {item.ukuran_formatted ? (
                        <span className="block">{item.ukuran_formatted}</span>
                      ) : null}
                      {item.durasi_formatted ? (
                        <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                          <Clock className="w-3 h-3" /> {item.durasi_formatted}
                        </span>
                      ) : null}
                      {!item.ukuran_formatted && !item.durasi_formatted && '-'}
                    </TableCell>
                    <TableCell className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <ActionDropdown
                        onView={() => handleOpenPreview(item)}
                        onEdit={() => handleOpenEditModal(item)}
                        onDelete={() => handleDeleteItem(item)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </TableRoot>
        </MasterDataTable>

        {/* Pagination Footer (Modern HeroUI Emerald Squircle) */}
        <div className="px-6 py-4 bg-emerald-50/20 dark:bg-emerald-950/10 border-t border-emerald-100/80 dark:border-emerald-900/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Menampilkan <span className="font-bold text-slate-800 dark:text-white">{dataMedia.length}</span> dari{' '}
            <span className="font-bold text-slate-800 dark:text-white">{pagination.total}</span> data
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="size-5" />
            </button>
            <span className="px-3 py-1 font-bold text-slate-700 dark:text-slate-300">
              {pagination.current_page} / {pagination.last_page}
            </span>
            <button
              disabled={page >= pagination.last_page}
              onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
              className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Halaman Berikutnya"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </section>
      </motion.div>

      {/* KPI DETAIL MODAL */}
      {kpiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#1B2433] w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-gradient-to-r from-[#0E5C44] to-[#1E8E5A] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                  <Layers className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{kpiModalCategory.title}</h3>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    Menampilkan {kpiModalCategory.items.length} file media terdaftar
                  </p>
                </div>
              </div>
              <button
                onClick={() => setKpiModalOpen(false)}
                className="text-emerald-100 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {kpiModalCategory.items.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-semibold text-sm">Tidak ada data media dalam kategori ini.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <TableRoot className="w-full text-left border-collapse">
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <TableHead className="py-3 px-4 text-center w-12">No</TableHead>
                        <TableHead className="py-3 px-4">Nama File / Judul</TableHead>
                        <TableHead className="py-3 px-4">Tipe File</TableHead>
                        <TableHead className="py-3 px-4">Materi Pembelajaran</TableHead>
                        <TableHead className="py-3 px-4 text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                      {kpiModalCategory.items.map((item, idx) => (
                        <TableRow key={item.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                          <TableCell className="py-3 px-4 text-center text-slate-400 text-xs font-medium">{idx + 1}</TableCell>
                          <TableCell className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">{item.nama_file}</TableCell>
                          <TableCell className="py-3 px-4">{getTipeBadge(item.tipe_file)}</TableCell>
                          <TableCell className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                            {item.materi?.judul || 'Tanpa Judul Materi'}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setKpiModalOpen(false)
                                handleOpenPreviewModal(item)
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-50 text-[#0E5C44] dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold text-xs hover:bg-emerald-100 transition-colors"
                            >
                              Detail
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </TableRoot>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-900/40">
              <button
                onClick={() => setKpiModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Create / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-[22px] bg-white dark:bg-[#1B2433] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#0E5C44] text-white">
                  <FileUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingItem ? 'Edit Media Pembelajaran' : 'Tambah Media Pembelajaran Baru'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Lengkapi detail media atau unggah file pendukung
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto space-y-5 flex-1">
              <div>
                <HeroUiModalSelect
                  label="Materi Pembelajaran"
                  required
                  icon={BookOpen}
                  searchable={true}
                  placeholder="-- Pilih Materi Pembelajaran --"
                  value={formData.materi_id}
                  onChange={(val) => setFormData({ ...formData, materi_id: val })}
                  options={modalMateriOptions}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Nama File / Media <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Modul Panduan PDF Bab 1"
                    value={formData.nama_file}
                    onChange={(e) => setFormData({ ...formData, nama_file: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-[12px] bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
                  />
                </div>

                <div>
                  <HeroUiModalSelect
                    label="Tipe Media"
                    required
                    icon={Layers}
                    placeholder="-- Pilih Tipe Media --"
                    value={formData.tipe_file}
                    onChange={(val) => setFormData({ ...formData, tipe_file: val })}
                    options={modalTipeOptions}
                  />
                </div>
              </div>

              {/* Upload File Input */}
              <div className="p-4 rounded-[14px] bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-700">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Unggah Berkas File (Opsional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#0E5C44] file:text-white hover:file:bg-[#1E8E5A] cursor-pointer"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Mendukung PDF, Video (MP4/WebM), Audio (MP3), PPTX, DOCX, PNG/JPG (Maks 50MB)
                </span>
              </div>

              {/* External Link */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Tautan Eksternal / URL (YouTube, Drive, Web, dll)
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.url_eksternal}
                    onChange={(e) => setFormData({ ...formData, url_eksternal: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-[12px] bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Durasi (Detik) - Untuk Audio/Video
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Contoh: 300 (5 menit)"
                    value={formData.durasi_detik}
                    onChange={(e) => setFormData({ ...formData, durasi_detik: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-[12px] bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Urutan Tampil
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.urutan}
                    onChange={(e) => setFormData({ ...formData, urutan: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-[12px] bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Catatan / Deskripsi Penjelas
                </label>
                <textarea
                  rows={3}
                  placeholder="Keterangan isi file media atau instruksi pengajuan..."
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-[12px] bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-[12px] border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0E5C44] hover:bg-[#1E8E5A] text-white font-bold text-sm rounded-[12px] shadow-md transition-all disabled:opacity-50"
                >
                  {formSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  <span>{editingItem ? 'Simpan Perubahan' : 'Tambah Media'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Preview Media */}
      {previewModalOpen && previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-3xl rounded-[22px] bg-white dark:bg-[#1B2433] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getTipeBadge(previewItem.tipe_file)}
                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate max-w-md">
                  {previewItem.nama_file}
                </h3>
              </div>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Media Player / Embed Preview based on type */}
              {previewItem.tipe_file === 'image' && (previewItem.file_url || previewItem.url_eksternal) && (
                <div className="flex justify-center bg-slate-900/80 rounded-xl p-4">
                  <img
                    src={previewItem.file_url || previewItem.url_eksternal}
                    alt={previewItem.nama_file}
                    className="max-h-[400px] object-contain rounded-lg shadow-lg"
                  />
                </div>
              )}

              {previewItem.tipe_file === 'video' && (
                <div className="aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center">
                  {previewItem.url_eksternal?.includes('youtube.com') || previewItem.url_eksternal?.includes('youtu.be') ? (
                    <iframe
                      src={previewItem.url_eksternal.replace('watch?v=', 'embed/')}
                      title={previewItem.nama_file}
                      className="w-full h-full border-0"
                      allowFullScreen
                    />
                  ) : previewItem.file_url ? (
                    <video controls className="w-full h-full">
                      <source src={previewItem.file_url} />
                      Browser Anda tidak mendukung tag video.
                    </video>
                  ) : (
                    <div className="text-center p-6 text-slate-400">
                      <PlayCircle className="w-12 h-12 mx-auto text-blue-500 mb-2" />
                      <p className="text-sm font-medium">Video Eksternal</p>
                      <a
                        href={previewItem.url_eksternal}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-400 underline mt-2 block"
                      >
                        Buka Video di Tab Baru
                      </a>
                    </div>
                  )}
                </div>
              )}

              {previewItem.tipe_file === 'audio' && (
                <div className="p-6 rounded-xl bg-slate-900 text-white flex flex-col items-center gap-4">
                  <Music className="w-12 h-12 text-purple-400" />
                  <p className="text-sm font-semibold">{previewItem.nama_file}</p>
                  <audio controls className="w-full max-w-md">
                    <source src={previewItem.file_url || previewItem.url_eksternal} />
                    Browser Anda tidak mendukung elemen audio.
                  </audio>
                </div>
              )}

              {previewItem.tipe_file === 'pdf' && (previewItem.file_url || previewItem.url_eksternal) && (
                <div className="w-full h-[400px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100">
                  <iframe
                    src={previewItem.file_url || previewItem.url_eksternal}
                    title={previewItem.nama_file}
                    className="w-full h-full border-0"
                  />
                </div>
              )}

              {/* General Info Card */}
              <div className="p-4 rounded-[14px] bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-sm">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Materi Pembelajaran:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {previewItem.materi?.judul || '-'}
                  </span>
                </div>
                {previewItem.deskripsi && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-400 uppercase">Deskripsi / Catatan:</p>
                    <p className="text-slate-700 dark:text-slate-300 mt-1">{previewItem.deskripsi}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              {(previewItem.file_url || previewItem.url_eksternal) && (
                <a
                  href={previewItem.file_url || previewItem.url_eksternal}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0E5C44] text-white text-xs font-bold hover:bg-[#1E8E5A]"
                >
                  <Download className="w-4 h-4" /> Buka / Unduh Berkas
                </a>
              )}
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      </motion.div>
      </div>
    </PageContainer>
  )
}
