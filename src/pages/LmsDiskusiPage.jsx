import { useToast } from '../components/app/ToastProvider'
import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  BookOpen,
  Plus,
  Search,
  Edit3,
  Trash2,
  RefreshCw,
  X,
  Pin,
  Lock,
  Unlock,
  Send,
  GraduationCap,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Tag,
  Clock,
  RotateCcw,
  Printer,
  Eye,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  Layers,
  FileSpreadsheet,
  CornerDownRight,
  User,
  ShieldCheck,
  FileText,
  ChevronDown,
  Check,
  School,
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { lmsDiskusiService } from '../services/lmsDiskusiService'
import { lmsModulAjarService } from '../services/lmsModulAjarService'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import {
  MasterDataTable,
  SquircleActionButton,
  PrintOptionModal,
} from '../components/master-data'
import {
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui/table'
import ActionDropdown from '../components/app/ActionDropdown'
import { useDebounce } from '../hooks/useDebounce'
import { downloadSpreadsheetTemplate } from '../utils/spreadsheetParser'

// ── 1. PALET WARNA RESMI MODERN KPI CARDS ──
const MODERN_CARD_TONES = {
  emerald: {
    card: 'border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
    glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
    iconBox: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/30',
    tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    title: 'text-emerald-700 dark:text-emerald-400',
    val: 'text-emerald-700 dark:text-emerald-300',
    sub: 'text-emerald-600/80 dark:text-emerald-400/80',
    cta: 'text-emerald-600/60 dark:text-emerald-500/60',
  },
  blue: {
    card: 'border-blue-300/70 bg-gradient-to-br from-blue-50 via-cyan-50/60 to-white hover:border-blue-400 dark:border-blue-700/50 dark:from-blue-950/40 dark:via-cyan-950/20 dark:to-slate-900',
    glow: 'bg-blue-400/20 group-hover:bg-blue-400/30',
    iconBox: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-blue-500/30',
    tag: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
    title: 'text-blue-700 dark:text-blue-400',
    val: 'text-blue-700 dark:text-blue-300',
    sub: 'text-blue-600/80 dark:text-blue-400/80',
    cta: 'text-blue-600/60 dark:text-blue-500/60',
  },
  purple: {
    card: 'border-purple-300/70 bg-gradient-to-br from-purple-50 via-fuchsia-50/60 to-white hover:border-purple-400 dark:border-purple-700/50 dark:from-purple-950/40 dark:via-fuchsia-950/20 dark:to-slate-900',
    glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
    iconBox: 'bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-purple-500/30',
    tag: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
    title: 'text-purple-700 dark:text-purple-400',
    val: 'text-purple-700 dark:text-purple-300',
    sub: 'text-purple-600/80 dark:text-purple-400/80',
    cta: 'text-purple-600/60 dark:text-purple-500/60',
  },
  amber: {
    card: 'border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
    glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
    iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/30',
    tag: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    title: 'text-amber-700 dark:text-amber-400',
    val: 'text-amber-700 dark:text-amber-300',
    sub: 'text-amber-600/80 dark:text-amber-400/80',
    cta: 'text-amber-600/60 dark:text-amber-500/60',
  },
}

function ModernKpiCard({ icon: Icon, label, subtext, value, tag, tone = 'emerald', onClick }) {
  const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
  const isClickable = typeof onClick === 'function'

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={`group relative overflow-hidden rounded-[18px] border-2 p-5 shadow-xs transition-[border-color,box-shadow] duration-150 text-left ${
        isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
      } ${t.card}`}
    >
      <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all ${t.glow}`} />
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm ${t.iconBox}`}>
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-wider ${t.title}`}>{label}</p>
          </div>
        </div>
        {tag && (
          <span className={`rounded-lg px-2 py-0.5 text-[10px] font-extrabold ${t.tag}`}>
            {tag}
          </span>
        )}
      </div>

      <p className={`text-3xl font-black tabular-nums ${t.val}`}>
        {value ?? '0'}
      </p>
      {subtext && (
        <p className={`mt-0.5 text-[11px] font-semibold ${t.sub}`}>
          {subtext}
        </p>
      )}

      {isClickable && (
        <p className={`mt-3 text-[10px] font-bold flex items-center gap-1 ${t.cta}`}>
          <Eye className="h-3 w-3" /> Klik untuk rincian
        </p>
      )}
    </motion.div>
  )
}

// ── 2. TOAST NOTIFICATION STACK HOOK ──
function useNotifications() {
  const toast = useToast()
  const push = (title, message, tone = 'success') => {
    toast(title, message, tone)
  }
  const dismiss = () => {}
  return { items: [], push, dismiss }
}

// ── HEROUI MODAL SELECT DROPDOWN COMPONENT ──
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

// ── 3. HARMONIZED BATCH IMPORT MODAL ──
function HarmonizedBatchImportModal({ isOpen, onClose, onImportSuccess, notify }) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewRows, setPreviewRows] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  if (!isOpen) return null

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0])
    }
  }

  const handleProcessFile = (file) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      notify('Format Berkas Tidak Valid', 'Unggah berkas berformat .csv atau .xlsx', 'error')
      return
    }
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const lines = text.split('\n').filter((l) => l.trim().length > 0)
      if (lines.length > 1) {
        const rows = lines.slice(1, 6).map((line, idx) => {
          const parts = line.split(',')
          return {
            id: idx + 1,
            judul: (parts[0] || '').replace(/["\r]/g, '').trim(),
            kategori: (parts[1] || 'Umum').replace(/["\r]/g, '').trim(),
            deskripsi: (parts[2] || '').replace(/["\r]/g, '').trim(),
            status: (parts[3] || 'aktif').replace(/["\r]/g, '').trim(),
          }
        })
        setPreviewRows(rows)
      } else {
        setPreviewRows([])
      }
    }
    reader.readAsText(file)
  }

  const handleDownloadTemplate = () => {
    const headers = ['JUDUL_DISKUSI', 'KATEGORI', 'DESKRIPSI', 'STATUS']
    const sampleRows = [
      ['"Diskusi Pemahaman Hukum Fiqih Thaharah"', '"Tanya Jawab"', '"Diskusikan syarat dan rukun thaharah bersama teman sekelas."', '"aktif"'],
      ['"Tanya Jawab Projek P5 Gaya Hidup Berkelanjutan"', '"Proyek"', '"Pertanyaan seputar pengelolaan limbah organik sekolah."', '"aktif"'],
    ]
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...sampleRows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'template_import_forum_diskusi.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    notify('Unduh Template', 'Template berkas CSV berhasil diunduh.', 'success')
  }

  const handleSubmit = async () => {
    if (!selectedFile) {
      notify('Pilih Berkas', 'Harap pilih berkas CSV atau XLSX terlebih dahulu.', 'warning')
      return
    }
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      const res = await lmsDiskusiService.import(formData)
      notify('Impor Berhasil', res?.message || `Berkas ${selectedFile.name} berhasil diimpor ke sistem.`, 'success')
      onImportSuccess?.()
      onClose()
    } catch (err) {
      notify('Impor Gagal', err?.response?.data?.message || err?.message || 'Terjadi kendala saat memproses berkas impor.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#1B2433]"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
        <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Impor Data Forum Diskusi</h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Unggah berkas CSV atau XLSX berisi topik diskusi kelas.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Download Template Card */}
          <div className="flex items-center justify-between rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200">Template Berkas Data Diskusi</p>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400/80">Gunakan format tabel resmi agar sistem memetakan kolom secara otomatis.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300/80 bg-white px-3.5 py-2 text-xs font-bold text-emerald-700 shadow-xs hover:bg-emerald-50 dark:border-emerald-700 dark:bg-slate-900 dark:text-emerald-300 dark:hover:bg-slate-800 transition-all"
            >
              <Download className="h-3.5 w-3.5" /> Unduh Format
            </button>
          </div>

          {/* Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-7 text-center transition-all ${
              dragActive
                ? 'border-emerald-500 bg-emerald-50/60 dark:border-emerald-400 dark:bg-emerald-950/30'
                : 'border-emerald-300/80 bg-slate-50/50 hover:bg-emerald-50/30 dark:border-emerald-800/70 dark:bg-slate-900/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => e.target.files?.[0] && handleProcessFile(e.target.files[0])}
              className="hidden"
            />
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 mb-3">
              <Upload className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {selectedFile ? selectedFile.name : 'Tarik & lepas berkas ke sini, atau klik untuk memilih'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Mendukung file .CSV, .XLSX (Maks. 5MB)</p>
          </div>

          {/* Mini Preview Datatable */}
          {previewRows.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Pratinjau Data (5 Baris Pertama)
              </p>
              <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
                <TableRoot className="w-full text-left text-xs">
                  <TableHeader className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold border-b border-emerald-200/80">
                    <TableRow>
                      <TableHead className="py-2 px-3">No</TableHead>
                      <TableHead className="py-2 px-3">Judul Topik</TableHead>
                      <TableHead className="py-2 px-3">Kategori</TableHead>
                      <TableHead className="py-2 px-3">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-emerald-100/70 dark:divide-emerald-900/40">
                    {previewRows.map((r, i) => (
                      <TableRow key={i} className="hover:bg-emerald-50/30">
                        <TableCell className="py-2 px-3 font-semibold text-slate-500">{i + 1}</TableCell>
                        <TableCell className="py-2 px-3 font-bold text-slate-800 dark:text-slate-100 truncate max-w-[200px]">{r.judul || '-'}</TableCell>
                        <TableCell className="py-2 px-3 text-slate-600 dark:text-slate-300">{r.kategori}</TableCell>
                        <TableCell className="py-2 px-3 font-semibold text-emerald-700 dark:text-emerald-400">{r.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableRoot>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-all"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedFile}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-600/30 hover:brightness-105 disabled:opacity-50 transition-all"
          >
            {isSubmitting && <RefreshCw className="h-4 w-4 animate-spin" />}
            <span>{isSubmitting ? 'Memproses Berkas...' : 'Proses Impor Topik'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── 4. HARMONIZED SAVE CONFIRMATION MODAL ──
function HarmonizedSaveModal({ isOpen, onClose, onConfirm, isEdit, title, isSubmitting }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#1B2433]"
      >
        <div
          className={`h-1.5 w-full bg-gradient-to-r ${
            isEdit ? 'from-amber-400 via-amber-500 to-orange-600' : 'from-emerald-500 via-teal-400 to-emerald-600'
          }`}
        />
        <div className="p-6">
          <div className="flex items-center gap-3.5 mb-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-md ${
                isEdit
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30'
                  : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30'
              }`}
            >
              {isEdit ? <Edit3 className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
            </div>
            <div>
              <span
                className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                  isEdit
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                }`}
              >
                {isEdit ? 'Perbarui Diskusi' : 'Diskusi Baru'}
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                Konfirmasi Penyimpanan
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            Apakah Anda yakin ingin {isEdit ? 'memperbarui informasi' : 'mempublikasikan'} topik diskusi:
          </p>

          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3.5 dark:border-emerald-800/60 dark:bg-emerald-950/20 mb-5">
            <p className="text-xs font-black text-emerald-950 dark:text-emerald-100 line-clamp-2">{title || 'Topik Forum Diskusi'}</p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-all"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-md transition-all ${
                isEdit
                  ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 shadow-amber-600/30 hover:brightness-105'
                  : 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-700 shadow-emerald-600/30 hover:brightness-105'
              } disabled:opacity-50`}
            >
              {isSubmitting && <RefreshCw className="h-4 w-4 animate-spin" />}
              <span>{isSubmitting ? 'Menyimpan...' : 'Ya, Konfirmasi & Simpan'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ── 5. HARMONIZED BATCH EXPORT MODAL ──
function HarmonizedBatchExportModal({
  isOpen,
  onClose,
  onExport,
  isExporting,
  totalCount,
  moduleTitle = 'Forum Diskusi',
}) {
  const [exportFormat, setExportFormat] = useState('xlsx')

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isExporting) onClose()
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="w-full max-w-lg"
      >
        <div className="flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border border-amber-200/80 bg-white shadow-2xl shadow-amber-950/20 dark:border-amber-900/50 dark:bg-[#182232]">
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-600 shrink-0" />

          <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950 shrink-0">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white p-2.5 shadow-md shadow-amber-500/25 border border-amber-300/40 shrink-0">
                <Download className="h-5 w-5 text-white" strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Export Data {moduleTitle}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60">
                    <Sparkles className="size-3" /> Unduh Data
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pilih format berkas untuk mengekspor data sesuai filter aktif.
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={isExporting}
              onClick={onClose}
              className="size-9 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                ['xlsx', 'Excel (.xlsx)', FileSpreadsheet, 'Format spreadsheet modern Microsoft Excel.'],
                ['xls', 'Excel (.xls)', FileSpreadsheet, 'Format kompatibilitas Excel 97-2003.'],
                ['csv', 'CSV (.csv)', FileText, 'Format teks koma terpisah universal.'],
              ].map(([value, label, Icon, desc]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setExportFormat(value)}
                  className={`rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer ${
                    exportFormat === value
                      ? 'border-emerald-500 bg-emerald-50/70 shadow-sm dark:border-emerald-700 dark:bg-emerald-950/40'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon
                      className={`size-4 ${
                        exportFormat === value ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'
                      }`}
                    />
                    <span className="text-xs font-black text-slate-900 dark:text-white">{label}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-snug">{desc}</p>
                </button>
              ))}
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 dark:bg-amber-950/30 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
              <p className="font-bold flex items-center gap-1.5 mb-0.5">
                <Sparkles className="size-3.5 text-amber-600 dark:text-amber-400" />
                Filter Ekspor Aktif
              </p>
              <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80">
                Data yang diekspor akan mencakup seluruh entitas terfilter ({totalCount} topik {moduleTitle.toLowerCase()}).
              </p>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5 bg-slate-50/50 dark:bg-slate-900/40 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isExporting}
              onClick={() => onExport(exportFormat)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white px-5 py-2.5 text-xs font-extrabold shadow-md shadow-amber-500/25 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 cursor-pointer border border-amber-300/40"
            >
              <Download className="size-4" />
              {isExporting ? 'Menyiapkan...' : 'Unduh Berkas'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ── 6. HARMONIZED DELETE CONFIRMATION MODAL ──
function HarmonizedDeleteModal({ isOpen, onClose, onConfirm, title, isSubmitting }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
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
              <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                Konfirmasi Hapus Diskusi
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            Apakah Anda yakin ingin menghapus topik diskusi berikut beserta seluruh komentar yang ada di dalamnya? Tindakan ini tidak dapat dibatalkan.
          </p>

          <div className="rounded-xl border border-rose-200/80 bg-rose-50/50 p-3.5 dark:border-rose-800/60 dark:bg-rose-950/20 mb-5">
            <p className="text-xs font-black text-rose-950 dark:text-rose-100 line-clamp-2">{title || 'Topik Forum Diskusi'}</p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-all"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-red-700 px-5 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/30 hover:brightness-105 disabled:opacity-50 transition-all"
            >
              {isSubmitting && <RefreshCw className="h-4 w-4 animate-spin" />}
              <span>{isSubmitting ? 'Menghapus...' : 'Ya, Hapus Diskusi'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ── 6. KOMPONEN UTAMA HALAMAN ──
export default function LmsDiskusiPage({ embedded = false, hideBreadcrumb = false, hidePageHeader = false, tabNav = null }) {
  const { items: toastItems, push: notify, dismiss: dismissToast } = useNotifications()

  const [dataDiskusi, setDataDiskusi] = useState([])
  const [optionsModulAjar, setOptionsModulAjar] = useState([])
  const [optionsKategori, setOptionsKategori] = useState([
    'Umum',
    'Tanya Jawab',
    'Tugas',
    'Materi',
    'Proyek',
    'Refleksi',
  ])
  const [stats, setStats] = useState({
    total_diskusi: 0,
    diskusi_aktif: 0,
    diskusi_ditutup: 0,
    diskusi_pinned: 0,
    total_komentar: 0,
  })

  const [loading, setLoading] = useState(true)

  // User Auth & Multi-unit Scoping
  const user = useAuthStore((state) => state.user)
  const isSuperAdminOrYayasan = useMemo(() => {
    const roles = (user?.roles || []).map((r) => (typeof r === 'string' ? r : r.name || ''))
    return roles.some((r) => ['super_admin', 'Super Admin', 'super-admin', 'yayasan', 'Yayasan', 'pengurus_yayasan', 'ketua_yayasan'].includes(r))
  }, [user])
  const isDivisiPendidikan = useMemo(() => {
    const roles = (user?.roles || []).map((r) => (typeof r === 'string' ? r : r.name || ''))
    return roles.some((r) => ['Divisi Pendidikan', 'divisi_pendidikan', 'divisi-pendidikan', 'Kepala Bidang Pendidikan', 'kepala_bidang_pendidikan', 'Divisi Kurikulum', 'Divisi Kesiswaan'].includes(r))
  }, [user])
  const canSelectUnit = isSuperAdminOrYayasan || isDivisiPendidikan
  const userUnitId = user?.unit_id || user?.employee?.unit_id || user?.unit_pendidikan_id || ''
  const userUnitName = user?.unit_name || user?.employee?.unit?.nama_unit || user?.employee?.unit?.name || 'Unit Anda'

  // Filters & Pagination
  const [selectedUnit, setSelectedUnit] = useState(canSelectUnit ? '' : (userUnitId ? String(userUnitId) : ''))
  const [optionsUnits, setOptionsUnits] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 350)
  const [selectedModulAjar, setSelectedModulAjar] = useState('')
  const [selectedKategori, setSelectedKategori] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  })

  // Options for HeroUI Selects
  const filterModulAjarOptions = useMemo(() => [
    { value: '', label: 'Semua Modul Ajar' },
    ...optionsModulAjar.map((opt) => ({
      value: String(opt.value || opt.id),
      label: opt.label || opt.judul_modul || opt.judul,
    })),
  ], [optionsModulAjar])

  const filterKategoriOptions = useMemo(() => [
    { value: '', label: 'Semua Kategori' },
    ...optionsKategori.map((kat) => ({
      value: kat,
      label: kat,
    })),
  ], [optionsKategori])

  const filterStatusOptions = useMemo(() => [
    { value: '', label: 'Semua Status' },
    { value: 'aktif', label: 'Aktif' },
    { value: 'draft', label: 'Draft' },
    { value: 'ditutup', label: 'Ditutup' },
  ], [])

  const modalModulAjarOptions = useMemo(() => [
    { value: '', label: '-- Tanpa Modul (Diskusi Umum) --' },
    ...optionsModulAjar.map((opt) => ({
      value: String(opt.value || opt.id),
      label: opt.label || opt.judul_modul || opt.judul,
    })),
  ], [optionsModulAjar])

  const modalKategoriOptions = useMemo(() => [
    ...optionsKategori.map((kat) => ({
      value: kat,
      label: kat,
    })),
  ], [optionsKategori])

  const modalStatusOptions = useMemo(() => [
    { value: 'aktif', label: 'Aktif (Terbuka untuk Komentar)' },
    { value: 'draft', label: 'Draft (Disimpan Sementara)' },
    { value: 'ditutup', label: 'Ditutup (Hanya Baca)' },
  ], [])

  const perPageOptions = useMemo(() => [
    { value: '10', label: '10 Baris' },
    { value: '25', label: '25 Baris' },
    { value: '50', label: '50 Baris' },
  ], [])

  const peranPengirimOptions = useMemo(() => [
    { value: 'Guru', label: 'Guru (Pengajar)' },
    { value: 'Siswa', label: 'Siswa (Peserta)' },
    { value: 'Admin', label: 'Admin' },
  ], [])

  // Modal Form State (Create / Edit Diskusi)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Save and Delete Confirmation Modals
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    id: null,
    title: '',
    isSubmitting: false,
  })

  // KPI Modal State
  const [kpiModalOpen, setKpiModalOpen] = useState(false)
  const [kpiModalCategory, setKpiModalCategory] = useState({
    title: '',
    items: [],
  })

  // Thread Drawer State
  const [isThreadOpen, setIsThreadOpen] = useState(false)
  const [selectedDiskusi, setSelectedDiskusi] = useState(null)
  const [threadLoading, setThreadLoading] = useState(false)
  const [replyParentId, setReplyParentId] = useState(null)
  const [komentarForm, setKomentarForm] = useState({
    konten: '',
    peran_pengirim: 'Guru',
  })
  const [submittingKomentar, setSubmittingKomentar] = useState(false)

  const [formData, setFormData] = useState({
    modul_ajar_id: '',
    judul: '',
    deskripsi: '',
    kategori: 'Umum',
    tanggal_mulai: '',
    tanggal_tutup: '',
    status: 'aktif',
  })

  useEffect(() => {
    fetchOptions()
  }, [selectedUnit])

  useEffect(() => {
    fetchData()
    fetchStats()
  }, [page, perPage, debouncedSearch, selectedUnit, selectedModulAjar, selectedKategori, selectedStatus])

  const fetchStats = async () => {
    try {
      const res = await lmsDiskusiService.getStats()
      if (res.success) {
        setStats(res.data)
      }
    } catch (err) {
      console.error('Gagal mengambil statistik diskusi:', err)
    }
  }

  const computedStats = useMemo(() => {
    const total_diskusi = dataDiskusi.length
    const diskusi_aktif = dataDiskusi.filter((d) => d.status === 'aktif').length
    const diskusi_pinned = dataDiskusi.filter((d) => d.is_pinned).length
    const diskusi_ditutup = dataDiskusi.filter((d) => d.status === 'ditutup' || d.is_closed).length
    const total_komentar = dataDiskusi.reduce((acc, d) => acc + (d.komentar_count || d.komentars_count || (d.komentar ? d.komentar.length : 0)), 0)

    return {
      total_diskusi: stats.total_diskusi || total_diskusi,
      diskusi_aktif: stats.diskusi_aktif || diskusi_aktif,
      diskusi_pinned: stats.diskusi_pinned || diskusi_pinned,
      diskusi_ditutup: stats.diskusi_ditutup || diskusi_ditutup,
      total_komentar: stats.total_komentar || total_komentar,
    }
  }, [dataDiskusi, stats])

  const handleOpenKpiModal = (type) => {
    let title = ''
    let items = []

    if (type === 'total') {
      title = 'Total Topik Forum Diskusi Kelas'
      items = dataDiskusi
    } else if (type === 'aktif') {
      title = 'Daftar Diskusi Berstatus Aktif'
      items = dataDiskusi.filter((d) => d.status === 'aktif')
    } else if (type === 'pinned') {
      title = 'Topik Diskusi Disematkan (Pin)'
      items = dataDiskusi.filter((d) => d.is_pinned)
    } else if (type === 'komentar') {
      title = 'Daftar Diskusi Berinteraksi Tinggi'
      items = dataDiskusi.filter((d) => (d.komentar_count || d.komentar?.length || 0) > 0)
    }

    setKpiModalCategory({ title, items })
    setKpiModalOpen(true)
  }

  const fetchOptions = async () => {
    try {
      const res = await lmsDiskusiService.getOptions(selectedUnit ? { unit_pendidikan_id: selectedUnit } : {})
      if (res?.data?.units) {
        setOptionsUnits(res.data.units)
      }
      let modulList = []

      const rawModul = res?.data?.modul_ajar || res?.data?.modul_ajar_options || res?.modul_ajar
      if (Array.isArray(rawModul) && rawModul.length > 0) {
        modulList = rawModul.map((opt) => ({
          value: opt.value || opt.id,
          id: opt.value || opt.id,
          label: opt.label || (opt.kode_modul ? `[${opt.kode_modul}] ${opt.judul_modul || opt.judul}` : (opt.judul_modul || opt.judul)),
          judul: opt.judul_modul || opt.judul,
        }))
      } else {
        try {
          const maRes = await lmsModulAjarService.getAll({ per_page: 100 })
          const rawList = maRes?.data || maRes || []
          if (Array.isArray(rawList) && rawList.length > 0) {
            modulList = rawList.map((opt) => ({
              value: opt.id,
              id: opt.id,
              label: opt.kode_modul ? `[${opt.kode_modul}] ${opt.judul_modul || opt.judul}` : (opt.judul_modul || opt.judul),
              judul: opt.judul_modul || opt.judul,
            }))
          }
        } catch (maErr) {
          console.error('Fallback fetch modul ajar failed:', maErr)
        }
      }

      setOptionsModulAjar(modulList)
      if (res?.data?.kategori) setOptionsKategori(res.data.kategori)
    } catch (err) {
      console.error('Gagal mengambil opsi data diskusi:', err)
      try {
        const maRes = await lmsModulAjarService.getAll({ per_page: 100 })
        const rawList = maRes?.data || maRes || []
        if (Array.isArray(rawList) && rawList.length > 0) {
          const modulList = rawList.map((opt) => ({
            value: opt.id,
            id: opt.id,
            label: opt.kode_modul ? `[${opt.kode_modul}] ${opt.judul_modul || opt.judul}` : (opt.judul_modul || opt.judul),
            judul: opt.judul_modul || opt.judul,
          }))
          setOptionsModulAjar(modulList)
        }
      } catch (fallbackErr) {
        console.error('Fallback fetch modul ajar failed:', fallbackErr)
      }
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = {
        page,
        per_page: perPage,
        search: debouncedSearch,
        unit_pendidikan_id: canSelectUnit ? (selectedUnit || undefined) : (userUnitId || undefined),
        modul_ajar_id: selectedModulAjar,
        kategori: selectedKategori,
        status: selectedStatus,
      }
      const res = await lmsDiskusiService.getDaftar(params)
      setDataDiskusi(res.data || [])
      if (res.meta) {
        setPagination({
          current_page: res.meta.current_page,
          last_page: res.meta.last_page,
          total: res.meta.total,
          per_page: res.meta.per_page,
        })
      } else {
        setPagination({
          current_page: 1,
          last_page: 1,
          total: res.data?.length || 0,
          per_page: perPage,
        })
      }
    } catch (err) {
      console.error('Error fetching data diskusi:', err)
      notify('Gagal Memuat Data', 'Tidak dapat mengambil daftar topik forum diskusi.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreateModal = () => {
    setEditId(null)
    setFormData({
      modul_ajar_id: '',
      judul: '',
      deskripsi: '',
      kategori: 'Umum',
      tanggal_mulai: '',
      tanggal_tutup: '',
      status: 'aktif',
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (item) => {
    setEditId(item.id)
    setFormData({
      modul_ajar_id: item.modul_ajar_id || '',
      judul: item.judul_diskusi || item.judul || '',
      deskripsi: item.deskripsi || '',
      kategori: item.kategori || 'Umum',
      tanggal_mulai: item.tanggal_mulai ? item.tanggal_mulai.replace(' ', 'T') : '',
      tanggal_tutup: item.tanggal_tutup ? item.tanggal_tutup.replace(' ', 'T') : '',
      status: item.status || 'aktif',
    })
    setIsModalOpen(true)
  }

  const handleTriggerSave = (e) => {
    e.preventDefault()
    if (!formData.judul.trim()) {
      notify('Judul Diperlukan', 'Harap isi judul topik diskusi sebelum menyimpan.', 'warning')
      return
    }
    setIsSaveModalOpen(true)
  }

  const handleConfirmSave = async () => {
    setFormSubmitting(true)
    try {
      let res
      if (editId) {
        res = await lmsDiskusiService.update(editId, formData)
      } else {
        res = await lmsDiskusiService.create(formData)
      }

      if (res.success) {
        notify('Berhasil Disimpan', res.message || 'Data forum diskusi berhasil diperbarui.', 'success')
        setIsSaveModalOpen(false)
        setIsModalOpen(false)
        fetchData()
        fetchStats()
      } else {
        notify('Gagal Menyimpan', res.message || 'Terjadi kendala saat menyimpan topik diskusi.', 'error')
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan data diskusi.'
      notify('Gagal Menyimpan', msg, 'error')
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleDeletePrompt = (item) => {
    setDeleteModalState({
      isOpen: true,
      id: item.id,
      title: item.judul_diskusi || item.judul,
      isSubmitting: false,
    })
  }

  const handleConfirmDelete = async () => {
    setDeleteModalState((prev) => ({ ...prev, isSubmitting: true }))
    try {
      const res = await lmsDiskusiService.delete(deleteModalState.id)
      if (res.success) {
        notify('Diskusi Dihapus', res.message || 'Topik diskusi berhasil dihapus.', 'success')
        setDeleteModalState({ isOpen: false, id: null, title: '', isSubmitting: false })
        fetchData()
        fetchStats()
      } else {
        notify('Gagal Menghapus', res.message || 'Topik diskusi tidak dapat dihapus.', 'error')
        setDeleteModalState((prev) => ({ ...prev, isSubmitting: false }))
      }
    } catch (err) {
      notify('Gagal Menghapus', err.response?.data?.message || 'Terjadi kesalahan sistem saat menghapus diskusi.', 'error')
      setDeleteModalState((prev) => ({ ...prev, isSubmitting: false }))
    }
  }

  const handleTogglePin = async (id) => {
    try {
      const res = await lmsDiskusiService.togglePin(id)
      if (res.success) {
        notify('Status Sematan', res.message || 'Status sematan topik berhasil diperbarui.', 'success')
        fetchData()
        fetchStats()
      }
    } catch (err) {
      console.error('Error toggling pin:', err)
      notify('Gagal Menyematkan', 'Tidak dapat mengubah status sematan topik.', 'error')
    }
  }

  const handleToggleClose = async (id) => {
    try {
      const res = await lmsDiskusiService.toggleClose(id)
      if (res.success) {
        notify('Status Kunci', res.message || 'Status kunci komentar topik berhasil diperbarui.', 'success')
        fetchData()
        fetchStats()
        if (selectedDiskusi && selectedDiskusi.id === id) {
          fetchThreadDetail(id)
        }
      }
    } catch (err) {
      console.error('Error toggling close:', err)
      notify('Gagal Mengubah Kunci', 'Tidak dapat memperbarui status akses diskusi.', 'error')
    }
  }

  // Comment Thread Drawer Detail
  const handleOpenThread = async (diskusiId) => {
    setIsThreadOpen(true)
    setReplyParentId(null)
    setKomentarForm({ konten: '', peran_pengirim: 'Guru' })
    await fetchThreadDetail(diskusiId)
  }

  const fetchThreadDetail = async (diskusiId) => {
    setThreadLoading(true)
    try {
      const res = await lmsDiskusiService.getById(diskusiId)
      if (res.success) {
        setSelectedDiskusi(res.data)
      }
    } catch (err) {
      console.error('Error fetching thread detail:', err)
      notify('Gagal Mengambil Utasan', 'Tidak dapat memuat detail komentar diskusi.', 'error')
    } finally {
      setThreadLoading(false)
    }
  }

  const handlePostKomentar = async (e) => {
    e.preventDefault()
    if (!komentarForm.konten.trim()) return

    setSubmittingKomentar(true)
    try {
      const payload = {
        konten: komentarForm.konten,
        peran_pengirim: komentarForm.peran_pengirim,
        parent_id: replyParentId,
      }
      const res = await lmsDiskusiService.tambahKomentar(selectedDiskusi.id, payload)
      if (res.success) {
        notify('Komentar Terkirim', 'Tanggapan berhasil dipublikasikan ke forum.', 'success')
        setKomentarForm({ ...komentarForm, konten: '' })
        setReplyParentId(null)
        await fetchThreadDetail(selectedDiskusi.id)
        fetchStats()
      } else {
        notify('Gagal Mengirim', res.message || 'Komentar tidak dapat dikirim.', 'error')
      }
    } catch (err) {
      notify('Gagal Mengirim', err.response?.data?.message || 'Terjadi kendala saat mengirim komentar.', 'error')
    } finally {
      setSubmittingKomentar(false)
    }
  }

  const handleDeleteKomentar = async (komentarId) => {
    try {
      const res = await lmsDiskusiService.hapusKomentar(selectedDiskusi.id, komentarId)
      if (res.success) {
        notify('Komentar Dihapus', 'Tanggapan berhasil dihapus dari utasan.', 'success')
        await fetchThreadDetail(selectedDiskusi.id)
        fetchStats()
      }
    } catch (err) {
      notify('Gagal Menghapus', 'Tidak dapat menghapus komentar.', 'error')
    }
  }

  const handleProcessExport = async (format = 'xlsx') => {
    if (!dataDiskusi?.length) {
      notify('Data Kosong', 'Tidak ada data diskusi untuk diekspor.', 'warning')
      return
    }
    setIsExporting(true)
    try {
      const exportData = (dataDiskusi || []).map((d, i) => ({
        'No': i + 1,
        'Judul Diskusi': (d.judul_diskusi || d.judul || '').trim(),
        'Kategori': d.kategori || 'Umum',
        'Modul Ajar': d.modul_ajar?.judul_modul || d.modul_ajar?.judul || 'Umum',
        'Total Komentar': d.total_komentar || d.komentar_count || 0,
        'Status': d.status === 'tertutup' || d.is_closed ? 'Tertutup' : 'Aktif',
        'Disematkan': d.is_pinned ? 'Ya' : 'Tidak',
      }))

      downloadSpreadsheetTemplate(
        exportData,
        `forum_diskusi_${new Date().toISOString().slice(0, 10)}`,
        format,
        'Forum Diskusi'
      )
      setIsExportModalOpen(false)
      notify('Export Berhasil', `Berkas Forum Diskusi .${format.toUpperCase()} berhasil diunduh.`, 'success')
    } catch (err) {
      notify('Gagal Export', err?.message || 'Terjadi kesalahan saat menyiapkan berkas ekspor.', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <PageContainer maxW="7xl">

      {!(embedded || hideBreadcrumb) && (
        <div className="mb-4">
          <AppBreadcrumb items={[{ label: 'LMS & Akademik', href: '/dashboard' }, { label: 'Forum Diskusi Kelas' }]} />
        </div>
      )}

      <div className="lms-diskusi-page space-y-6 pb-12">
        {/* Modern Hero Header Card (Vivid Emerald Spec) */}
        {!hidePageHeader && (
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-4 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
            <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-transparent blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-teal-500/30 via-emerald-400/20 to-transparent blur-3xl" />

            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
                <div className="flex size-11 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                  <MessageSquare className="size-5 sm:size-7 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-0.5 sm:px-3.5 sm:py-1 text-[11px] sm:text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                      <Sparkles className="size-3 text-amber-300 animate-pulse" />
                      Kurikulum Merdeka &amp; KBM Interaktif
                    </span>
                  </div>
                  <h1 className="mt-1.5 text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Forum Diskusi &amp; Kolaborasi Kelas
                  </h1>
                  <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 w-full leading-relaxed">
                    Ruang tanya jawab, pemantik diskusi, dan kolaborasi aktif antara guru dan siswa per modul ajar.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300/80 bg-emerald-50/80 px-3 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-extrabold text-emerald-800 shadow-xs dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
                  Forum Diskusi Terpadu
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Modern Multi-Tone KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ModernKpiCard
            icon={MessageSquare}
            label="Total Diskusi"
            value={computedStats.total_diskusi}
            tag={`${computedStats.total_diskusi} Topik`}
            subtext="Terdaftar di forum KBM"
            tone="emerald"
            onClick={() => handleOpenKpiModal('total')}
          />
          <ModernKpiCard
            icon={BookOpen}
            label="Diskusi Aktif"
            value={computedStats.diskusi_aktif}
            tag="Aktif Terbuka"
            subtext="Siap menerima tanggapan"
            tone="blue"
            onClick={() => handleOpenKpiModal('aktif')}
          />
          <ModernKpiCard
            icon={Pin}
            label="Disematkan (Pin)"
            value={computedStats.diskusi_pinned}
            tag="Topik Utama"
            subtext="Diprioritaskan di atas"
            tone="amber"
            onClick={() => handleOpenKpiModal('pinned')}
          />
          <ModernKpiCard
            icon={MessageCircle}
            label="Total Interaksi"
            value={computedStats.total_komentar}
            tag="Interaksi"
            subtext="Komentar guru &amp; siswa"
            tone="purple"
            onClick={() => handleOpenKpiModal('komentar')}
          />
        </div>

        {/* Tab Navigation Card (if provided) */}
        {tabNav && (
          <div>
            {typeof tabNav === 'function' ? tabNav() : tabNav}
          </div>
        )}

        {/* Master Datatable Panel (Canonical Emerald Datatable Container) */}
        <section
          className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]"
          aria-labelledby="diskusi-table-title"
        >
          {/* Toolbar Baris 1: Header Judul & 4 Tombol Soft Squircle Action */}
          <div className="border-b border-emerald-200/90 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-4 py-3.5 sm:px-6 md:px-8 dark:border-emerald-800/60">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                  <h2 id="diskusi-table-title" className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    Daftar Topik Forum Diskusi
                  </h2>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                    {pagination.total} Data
                  </span>
                </div>
                <p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                  Ruang kolaborasi aktif, tanya jawab modul ajar, dan refleksi pembelajaran.
                </p>
              </div>

              {/* 4 Soft Squircle Action Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
                <SquircleActionButton
                  variant="view"
                  icon={Printer}
                  label="Cetak &amp; PDF"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="!size-10 !rounded-2xl !bg-gradient-to-br !from-indigo-500 !via-indigo-600 !to-violet-700 !text-white !border-0 hover:!brightness-110 !shadow-sm"
                />
                <SquircleActionButton
                  variant="import"
                  icon={Upload}
                  label="Import Data"
                  onClick={() => setImportOpen(true)}
                  className="!size-10 !rounded-2xl !bg-gradient-to-br !from-sky-400 !via-sky-500 !to-blue-600 !text-white !border-0 hover:!brightness-110 !shadow-sm"
                />
                <SquircleActionButton
                  variant="export"
                  icon={Download}
                  label="Export Data"
                  onClick={() => setIsExportModalOpen(true)}
                  className="!size-10 !rounded-2xl !bg-gradient-to-br !from-amber-400 !via-amber-500 !to-orange-600 !text-white !border-0 hover:!brightness-110 !shadow-sm"
                />
                <SquircleActionButton
                  variant="primary"
                  icon={Plus}
                  label="Buat Diskusi"
                  onClick={handleOpenCreateModal}
                  className="!size-10 !rounded-2xl !bg-gradient-to-br !from-emerald-500 !via-emerald-600 !to-teal-700 !text-white !border-0 hover:!brightness-110 !shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Toolbar Baris 2: Field Pencarian Full-Width Debounced */}
          <div className="border-b border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 px-4 py-3 sm:px-6 md:px-8 dark:border-emerald-800/60 dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-emerald-950/20">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600/70 dark:text-emerald-400" />
              <input
                type="text"
                placeholder="Cari judul diskusi, deskripsi pemantik, atau kategori..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value)
                  setPage(1)
                }}
                className="h-10 sm:h-11 w-full rounded-2xl border border-emerald-200/90 bg-white pl-10 sm:pl-11 pr-10 text-xs font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-emerald-800/70 dark:bg-slate-900 dark:text-slate-100"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('')
                    setPage(1)
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Toolbar Baris 3: Dropdown Filter Horizontal & Reset */}
          <div className="border-b border-emerald-200/80 bg-white px-4 py-3 sm:px-6 md:px-8 dark:border-emerald-800/60 dark:bg-[#1B2433]">
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-2.5 w-full">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">
                Filter:
              </span>

              {/* Unit Dropdown (Divisi Pendidikan / Global) atau Locked Unit Badge */}
              {canSelectUnit ? (
                <HeroUiFilterSelect
                  value={selectedUnit}
                  onChange={(val) => {
                    setSelectedUnit(val)
                    setPage(1)
                  }}
                  options={[
                    { value: '', label: `Semua Unit (${optionsUnits.length || 'SIT'})` },
                    ...optionsUnits.map((u) => ({ value: String(u.id), label: u.name || u.nama_unit })),
                  ]}
                  placeholder={`Semua Unit (${optionsUnits.length || 'SIT'})`}
                  searchable={optionsUnits.length > 5}
                  icon={School}
                  popoverWidth="min-w-[220px]"
                />
              ) : (
                <div
                  title="Terkunci: Menampilkan data khusus unit wewenang Anda"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300/80 bg-emerald-50 text-[11px] font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"
                >
                  <School className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{userUnitName}</span>
                  <Lock className="size-3 text-emerald-500 ml-0.5 opacity-80" />
                </div>
              )}

              {/* Filter Modul Ajar */}
              <HeroUiFilterSelect
                value={selectedModulAjar}
                onChange={(val) => {
                  setSelectedModulAjar(val)
                  setPage(1)
                }}
                options={filterModulAjarOptions}
                placeholder="Semua Modul Ajar"
                icon={BookOpen}
                popoverWidth="min-w-[240px]"
                searchable
              />

              {/* Filter Kategori */}
              <HeroUiFilterSelect
                value={selectedKategori}
                onChange={(val) => {
                  setSelectedKategori(val)
                  setPage(1)
                }}
                options={filterKategoriOptions}
                placeholder="Semua Kategori"
                icon={Tag}
                popoverWidth="min-w-[180px]"
              />

              {/* Filter Status */}
              <HeroUiFilterSelect
                value={selectedStatus}
                onChange={(val) => {
                  setSelectedStatus(val)
                  setPage(1)
                }}
                options={filterStatusOptions}
                placeholder="Semua Status"
                popoverWidth="min-w-[160px]"
              />

              {/* Reset Filter Button */}
              <button
                type="button"
                onClick={() => {
                  if (canSelectUnit) setSelectedUnit('')
                  setSearchInput('')
                  setSelectedModulAjar('')
                  setSelectedKategori('')
                  setSelectedStatus('')
                  setPage(1)
                }}
                className="w-full sm:w-auto sm:ml-auto inline-flex items-center justify-center gap-1.5 h-9.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                title="Reset Semua Filter"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Master Datatable Body */}
          <MasterDataTable className="!rounded-none !border-0 !shadow-none">
            <TableRoot className="w-full text-left text-sm border-collapse">
              <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
                <TableRow className="border-b-2 border-emerald-200/90 dark:border-emerald-800/80 bg-transparent text-emerald-950 dark:text-emerald-200">
                  <TableHead className="w-auto sm:w-[38%] bg-transparent px-3.5 sm:px-6 md:px-8 py-3.5 font-black text-[11px] uppercase tracking-wider">
                    Topik &amp; Modul Ajar
                  </TableHead>
                  <TableHead className="hidden w-[16%] bg-transparent px-3 py-3.5 text-center font-black text-[11px] uppercase tracking-wider sm:table-cell">
                    Kategori
                  </TableHead>
                  <TableHead className="hidden w-[16%] bg-transparent px-3 py-3.5 text-center font-black text-[11px] uppercase tracking-wider md:table-cell">
                    Status &amp; Akses
                  </TableHead>
                  <TableHead className="hidden w-[16%] bg-transparent px-3 py-3.5 text-center font-black text-[11px] uppercase tracking-wider sm:table-cell">
                    Tanggapan
                  </TableHead>
                  <TableHead className="w-14 sm:w-[14%] bg-transparent px-2 sm:px-3.5 py-3.5 text-center font-black text-[11px] uppercase tracking-wider">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-sm">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-14 text-center text-slate-400">
                      <RefreshCw className="h-7 w-7 animate-spin mx-auto mb-2 text-[#0E5C44]" />
                      <p className="text-xs font-semibold">Memuat data forum diskusi...</p>
                    </TableCell>
                  </TableRow>
                ) : dataDiskusi.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-16 text-center text-slate-400">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 mb-3">
                        <MessageSquare className="h-7 w-7" />
                      </div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Belum Ada Topik Diskusi</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Tidak ditemukan data diskusi kelas sesuai filter pencarian yang dipilih.
                      </p>
                      <button
                        type="button"
                        onClick={handleOpenCreateModal}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:brightness-105 transition-all"
                      >
                        <Plus className="h-4 w-4" /> Buat Topik Pertama
                      </button>
                    </TableCell>
                  </TableRow>
                ) : (
                  dataDiskusi.map((item) => (
                    <TableRow
                      key={item.id}
                      onClick={() => handleOpenThread(item.id)}
                      className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors cursor-pointer group"
                    >
                      {/* Topik & Modul Ajar */}
                      <TableCell className="py-3.5 px-3.5 sm:px-6 md:px-8">
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleTogglePin(item.id)
                            }}
                            className={`mt-0.5 p-1.5 rounded-xl transition-all ${
                              item.is_pinned
                                ? 'text-amber-500 bg-amber-50 shadow-xs dark:bg-amber-950/50'
                                : 'text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400'
                            }`}
                            title={item.is_pinned ? 'Lepas Sematan (Pin)' : 'Sematkan di Atas'}
                          >
                            <Pin className="h-4 w-4 fill-current" />
                          </button>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-extrabold text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                                {item.judul_diskusi || item.judul}
                              </h4>
                              {item.is_closed && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                  <Lock className="w-3 h-3" /> Ditutup
                                </span>
                              )}
                            </div>
                            {item.modul_ajar ? (
                              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5 flex items-center gap-1 truncate">
                                <BookOpen className="w-3 h-3 inline shrink-0" />
                                <span>{item.modul_ajar.judul_modul || item.modul_ajar.judul}</span>
                              </p>
                            ) : (
                              <p className="text-xs text-slate-400 mt-0.5 font-medium">Umum (Tanpa Modul)</p>
                            )}
                            {item.deskripsi && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 max-w-xl leading-relaxed">
                                {item.deskripsi}
                              </p>
                            )}

                            {/* Mobile-only compact metadata row */}
                            <div className="sm:hidden mt-2 flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-emerald-100/80 dark:border-emerald-900/40">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0E5C44] dark:text-emerald-300">
                                <Tag className="w-2.5 h-2.5" />
                                {item.kategori || 'Umum'}
                              </span>
                              <span className="text-slate-300 dark:text-slate-600">·</span>
                              <span className="text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300">
                                {item.status === 'aktif' ? 'Aktif' : item.status === 'draft' ? 'Draft' : 'Ditutup'}
                              </span>
                              <span className="text-slate-300 dark:text-slate-600">·</span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                <MessageCircle className="w-2.5 h-2.5 text-emerald-600" />
                                {item.total_komentar || item.komentar_count || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Kategori */}
                      <TableCell className="hidden py-3.5 px-3 text-center sm:table-cell">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-[#0E5C44] dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 shadow-2xs">
                          <Tag className="w-3 h-3" /> {item.kategori || 'Umum'}
                        </span>
                      </TableCell>

                      {/* Status & Akses */}
                      <TableCell className="hidden py-3.5 px-3 text-center md:table-cell">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                              item.status === 'aktif'
                                ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                                : item.status === 'draft'
                                ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {item.status === 'aktif' ? 'Aktif' : item.status === 'draft' ? 'Draft' : 'Ditutup'}
                          </span>
                          {item.created_at_formatted && (
                            <p className="text-[11px] font-medium text-slate-400 flex items-center justify-center gap-1">
                              <Clock className="w-3 h-3" /> {item.created_at_formatted}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Tanggapan Komentar */}
                      <TableCell className="hidden py-3.5 px-3 text-center sm:table-cell">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenThread(item.id)
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100/70 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-200 hover:text-[#0E5C44] dark:hover:text-emerald-300 text-xs font-bold transition-all shadow-2xs"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>{item.total_komentar || item.komentar_count || 0} Tanggapan</span>
                        </button>
                      </TableCell>

                      {/* Aksi Dropdown */}
                      <TableCell className="py-3.5 px-2 sm:px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <ActionDropdown
                          onView={() => handleOpenThread(item.id)}
                          onEdit={() => handleOpenEditModal(item)}
                          onDelete={() => handleDeletePrompt(item)}
                          customActions={[
                            {
                              label: item.is_pinned ? 'Lepas Sematan' : 'Sematkan di Atas',
                              icon: Pin,
                              onClick: () => handleTogglePin(item.id),
                            },
                            {
                              label: item.is_closed ? 'Buka Kunci Diskusi' : 'Kunci Diskusi',
                              icon: item.is_closed ? Unlock : Lock,
                              onClick: () => handleToggleClose(item.id),
                            },
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </TableRoot>
          </MasterDataTable>

          {/* Pagination Toolbar Squircle Icon-Only */}
          <div className="border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/40 via-white to-emerald-50/40 p-3.5 sm:px-6 md:px-8 py-3 sm:py-3.5 dark:border-emerald-800/60 dark:bg-[#1B2433] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>Menampilkan Halaman</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200">{pagination.current_page}</span>
              <span>dari</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200">{pagination.last_page || 1}</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span>Total</span>
              <span className="font-extrabold text-emerald-700 dark:text-emerald-400">{pagination.total} Diskusi</span>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 w-full sm:w-auto">
              <HeroUiFilterSelect
                value={String(perPage)}
                onChange={(val) => {
                  setPerPage(Number(val))
                  setPage(1)
                }}
                options={perPageOptions}
                placeholder="10 Baris"
                className="w-auto"
                popoverWidth="min-w-[130px]"
              />

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 transition-all"
                  aria-label="Halaman Sebelumnya"
                >
                  <ChevronLeft className="size-5 text-white" />
                </button>
                <button
                  type="button"
                  disabled={page >= pagination.last_page}
                  onClick={() => setPage((prev) => Math.min(prev + 1, pagination.last_page))}
                  className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 transition-all"
                  aria-label="Halaman Berikutnya"
                >
                  <ChevronRight className="size-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Print & PDF Modal */}
        <PrintOptionModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title="Forum Diskusi Kelas"
          onPrint={() => {
            const rowsToPrint = Array.isArray(dataDiskusi) ? dataDiskusi : []
            printCleanTable({
              title: 'Laporan Data Forum Diskusi Kelas',
              subtitle: 'Daftar Topik Forum Diskusi Pembelajaran Sekolah Islam Terpadu',
              headers: ['NO', 'TOPIK / JUDUL DISKUSI', 'KATEGORI', 'MODUL AJAR TERKAIT', 'KOMENTAR', 'STATUS'],
              rows: rowsToPrint.map((row, i) => [
                i + 1,
                row.judul_diskusi || row.judul || '-',
                row.kategori || 'Umum',
                row.modul_ajar?.judul_modul || row.modul_ajar?.judul || '-',
                row.total_komentar || row.komentar_count || 0,
                row.status === 'tertutup' || row.is_closed ? 'Tertutup' : 'Aktif',
              ]),
            })
          }}
          onDownload={() => {
            const rowsToPrint = Array.isArray(dataDiskusi) ? dataDiskusi : []
            downloadPdfTable({
              title: 'Laporan Data Forum Diskusi Kelas',
              subtitle: 'Daftar Topik Forum Diskusi Pembelajaran Sekolah Islam Terpadu',
              headers: ['NO', 'TOPIK / JUDUL DISKUSI', 'KATEGORI', 'MODUL AJAR TERKAIT', 'KOMENTAR', 'STATUS'],
              rows: rowsToPrint.map((row, i) => [
                i + 1,
                row.judul_diskusi || row.judul || '-',
                row.kategori || 'Umum',
                row.modul_ajar?.judul_modul || row.modul_ajar?.judul || '-',
                row.total_komentar || row.komentar_count || 0,
                row.status === 'tertutup' || row.is_closed ? 'Tertutup' : 'Aktif',
              ]),
              filename: 'laporan_forum_diskusi_kelas.pdf',
            })
          }}
        />

        {/* Harmonized Batch Import Modal */}
        <HarmonizedBatchImportModal
          isOpen={importOpen}
          onClose={() => setImportOpen(false)}
          onImportSuccess={() => {
            fetchData()
            fetchStats()
          }}
          notify={notify}
        />

        {/* Harmonized KPI Detail Modal */}
        {kpiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
            <div className="bg-white dark:bg-[#1B2433] w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
              <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 p-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                    <MessageSquare className="w-5 h-5 text-emerald-200" />
                  </div>
                  <div>
                    <h3 className="text-base font-black">{kpiModalCategory.title}</h3>
                    <p className="text-xs text-emerald-100 mt-0.5">
                      Menampilkan {kpiModalCategory.items.length} topik diskusi terdaftar
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setKpiModalOpen(false)}
                  className="text-emerald-100 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                {kpiModalCategory.items.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-600" />
                    <p className="font-bold text-sm text-slate-700 dark:text-slate-300">Tidak ada data diskusi dalam kategori ini.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                    <TableRoot className="w-full text-left border-collapse text-xs">
                      <TableHeader>
                        <TableRow className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200/80 dark:border-emerald-800 text-[11px] font-black text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
                          <TableHead className="py-3 px-4 text-center w-12">No</TableHead>
                          <TableHead className="py-3 px-4">Judul Diskusi</TableHead>
                          <TableHead className="py-3 px-4">Kategori</TableHead>
                          <TableHead className="py-3 px-4">Modul Ajar</TableHead>
                          <TableHead className="py-3 px-4 text-center">Status</TableHead>
                          <TableHead className="py-3 px-4 text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {kpiModalCategory.items.map((item, idx) => (
                          <TableRow key={item.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <TableCell className="py-3 px-4 text-center text-slate-400 font-semibold">{idx + 1}</TableCell>
                            <TableCell className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{item.judul_diskusi || item.judul}</TableCell>
                            <TableCell className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">
                              {item.kategori || 'Umum'}
                            </TableCell>
                            <TableCell className="py-3 px-4 text-slate-600 dark:text-slate-300">
                              {item.modul_ajar?.judul_modul || item.modul_ajar?.judul || '-'}
                            </TableCell>
                            <TableCell className="py-3 px-4 text-center">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  item.status === 'aktif'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                              >
                                {item.status || 'aktif'}
                              </span>
                            </TableCell>
                            <TableCell className="py-3 px-4 text-right">
                              <button
                                onClick={() => {
                                  setKpiModalOpen(false)
                                  handleOpenThread(item.id)
                                }}
                                className="px-3 py-1.5 rounded-xl bg-emerald-50 text-[#0E5C44] dark:bg-emerald-950/40 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 transition-colors"
                              >
                                Buka Thread
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

        {/* Modal Form Tambah / Edit Diskusi */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#1B2433]"
            >
              <div
                className={`h-1.5 w-full bg-gradient-to-r ${
                  editId ? 'from-amber-400 via-amber-500 to-orange-600' : 'from-emerald-500 via-teal-400 to-emerald-600'
                }`}
              />
              <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-md ${
                      editId
                        ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30'
                        : 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 shadow-emerald-500/30'
                    }`}
                  >
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {editId ? 'Edit Topik Diskusi Kelas' : 'Buat Topik Diskusi Kelas Baru'}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Publikasikan bahan diskusi atau pertanyaan pemantik modul ajar.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleTriggerSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Modul Ajar Relasi */}
                <div>
                  <HeroUiModalSelect
                    label="Modul Ajar Terkait"
                    value={formData.modul_ajar_id}
                    onChange={(val) => setFormData({ ...formData, modul_ajar_id: val })}
                    options={modalModulAjarOptions}
                    placeholder="-- Tanpa Modul (Diskusi Umum) --"
                    icon={BookOpen}
                    searchable
                  />
                </div>

                {/* Judul Diskusi */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Judul Topik Diskusi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pemahaman Kasus Hukum Newton II Pada Kehidupan..."
                    value={formData.judul}
                    onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/12 outline-none"
                  />
                </div>

                {/* Kategori Diskusi */}
                <div>
                  <HeroUiModalSelect
                    label="Kategori Diskusi"
                    value={formData.kategori}
                    onChange={(val) => setFormData({ ...formData, kategori: val })}
                    options={modalKategoriOptions}
                    placeholder="Pilih Kategori Diskusi"
                    icon={Tag}
                  />
                </div>

                {/* Deskripsi / Pertanyaan Pemicu */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Deskripsi / Pertanyaan Pemantik
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tuliskan petunjuk diskusi, topik pemantik, atau studi kasus bagi santri/siswa..."
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/12 outline-none leading-relaxed"
                  />
                </div>

                {/* Tanggal Mulai & Tutup */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Tanggal &amp; Jam Mulai
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.tanggal_mulai}
                      onChange={(e) => setFormData({ ...formData, tanggal_mulai: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/12 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Tanggal &amp; Jam Tutup
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.tanggal_tutup}
                      onChange={(e) => setFormData({ ...formData, tanggal_tutup: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/12 outline-none"
                    />
                  </div>
                </div>

                {/* Status Diskusi */}
                <div>
                  <HeroUiModalSelect
                    label="Status Topik Diskusi"
                    value={formData.status}
                    onChange={(val) => setFormData({ ...formData, status: val })}
                    options={modalStatusOptions}
                    placeholder="Pilih Status"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all ${
                      editId
                        ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 shadow-amber-600/30 hover:brightness-105'
                        : 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-700 shadow-emerald-600/30 hover:brightness-105'
                    }`}
                  >
                    <span>{editId ? 'Perbarui Topik' : 'Publikasikan Diskusi'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Harmonized Save Confirmation Modal */}
        <HarmonizedSaveModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          onConfirm={handleConfirmSave}
          isEdit={Boolean(editId)}
          title={formData.judul}
          isSubmitting={formSubmitting}
        />

        {/* Harmonized Delete Confirmation Modal */}
        <HarmonizedDeleteModal
          isOpen={deleteModalState.isOpen}
          onClose={() => setDeleteModalState({ isOpen: false, id: null, title: '', isSubmitting: false })}
          onConfirm={handleConfirmDelete}
          title={deleteModalState.title}
          isSubmitting={deleteModalState.isSubmitting}
        />

        {/* Interactive Comments & Thread Drawer */}
        {isThreadOpen && selectedDiskusi && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-[#1B2433] w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800"
            >
              {/* Drawer Header */}
              <div className="p-6 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Utasan Komentar Diskusi
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-white line-clamp-1">
                      {selectedDiskusi.judul_diskusi || selectedDiskusi.judul}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setIsThreadOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Main Thread Body */}
              <div className="p-6 flex-1 overflow-y-auto space-y-5">
                {/* Discussion Prompt Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/60 via-teal-50/30 to-white dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-[#0E5C44] dark:text-emerald-300">
                      {selectedDiskusi.kategori}
                    </span>
                    {selectedDiskusi.modul_ajar && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold truncate max-w-xs flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5 text-emerald-600 inline" />
                        {selectedDiskusi.modul_ajar.judul_modul || selectedDiskusi.modul_ajar.judul}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line font-medium">
                    {selectedDiskusi.deskripsi || 'Tidak ada catatan deskripsi rinci.'}
                  </p>
                  {selectedDiskusi.is_closed && (
                    <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-semibold flex items-center gap-2">
                      <Lock className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>Diskusi telah dikunci. Komentar baru tidak dapat ditambahkan.</span>
                    </div>
                  )}
                </div>

                {/* Comments List */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center justify-between">
                    <span>Tanggapan &amp; Jawaban ({selectedDiskusi.komentar?.length || selectedDiskusi.total_komentar || 0})</span>
                    {threadLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0E5C44]" />}
                  </h4>

                  {selectedDiskusi.komentar && selectedDiskusi.komentar.length > 0 ? (
                    <div className="space-y-3.5">
                      {selectedDiskusi.komentar.map((kom) => (
                        <div
                          key={kom.id}
                          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 shadow-xs"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                                  kom.peran_pengirim === 'Guru'
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-[#0E5C44] dark:text-emerald-300'
                                    : kom.peran_pengirim === 'Admin'
                                    ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                                    : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                }`}
                              >
                                {kom.peran_pengirim}
                              </span>
                              <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                                {kom.nama_pengirim}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              <span>{kom.created_at_formatted}</span>
                              <button
                                onClick={() => handleDeleteKomentar(kom.id)}
                                className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                                title="Hapus Komentar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            {kom.konten}
                          </p>

                          {/* Reply Action */}
                          {!selectedDiskusi.is_closed && (
                            <button
                              onClick={() => setReplyParentId(replyParentId === kom.id ? null : kom.id)}
                              className="mt-2 text-[11px] font-bold text-[#0E5C44] dark:text-emerald-400 hover:underline flex items-center gap-1"
                            >
                              <CornerDownRight className="w-3.5 h-3.5" /> Balas Tanggapan
                            </button>
                          )}

                          {/* Nested Replies */}
                          {kom.replies && kom.replies.length > 0 && (
                            <div className="mt-3 pl-3.5 border-l-2 border-emerald-500/40 space-y-2.5">
                              {kom.replies.map((reply) => (
                                <div key={reply.id} className="pt-1.5">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                          reply.peran_pengirim === 'Guru'
                                            ? 'bg-emerald-100 dark:bg-emerald-950 text-[#0E5C44] dark:text-emerald-300'
                                            : reply.peran_pengirim === 'Admin'
                                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                                            : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                        }`}
                                      >
                                        {reply.peran_pengirim}
                                      </span>
                                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        {reply.nama_pengirim}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteKomentar(reply.id)}
                                      className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {reply.konten}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-xs text-slate-400 font-medium">
                        Belum ada komentar pada topik ini. Jadilah yang pertama memberikan tanggapan!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer / Reply Composer */}
              {!selectedDiskusi.is_closed && (
                <div className="p-4.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800">
                  {replyParentId && (
                    <div className="mb-2 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                      <span className="font-semibold">Membalas tanggapan terpilih...</span>
                      <button
                        onClick={() => setReplyParentId(null)}
                        className="text-emerald-600 font-bold hover:underline"
                      >
                        Batal
                      </button>
                    </div>
                  )}

                  <form onSubmit={handlePostKomentar} className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                          Kirim Sebagai:
                        </span>
                        <div className="w-48">
                          <HeroUiFilterSelect
                            value={komentarForm.peran_pengirim}
                            onChange={(val) =>
                              setKomentarForm({ ...komentarForm, peran_pengirim: val })
                            }
                            options={peranPengirimOptions}
                            placeholder="Kirim Sebagai"
                            popoverWidth="min-w-[170px]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Tuliskan komentar atau tanggapan diskusi..."
                        value={komentarForm.konten}
                        onChange={(e) =>
                          setKomentarForm({ ...komentarForm, konten: e.target.value })
                        }
                        className="flex-1 px-4 py-2.5 rounded-xl border border-emerald-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/20 outline-none"
                      />
                      <button
                        type="submit"
                        disabled={submittingKomentar || !komentarForm.konten.trim()}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-700 hover:brightness-105 text-white font-bold text-xs shadow-md disabled:opacity-50 flex items-center gap-1.5 shrink-0 transition-all"
                      >
                        {submittingKomentar ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        <span>Kirim</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Harmonized Batch Export Modal */}
        <HarmonizedBatchExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onExport={handleProcessExport}
          isExporting={isExporting}
          totalCount={pagination.total || dataDiskusi.length}
          moduleTitle="Forum Diskusi"
        />
      </div>
    </PageContainer>
  )
}
