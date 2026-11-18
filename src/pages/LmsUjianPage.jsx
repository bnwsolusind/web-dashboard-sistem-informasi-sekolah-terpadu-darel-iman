import { useToast } from '../components/app/ToastProvider'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  FileText,
  Award,
  Layers,
  Sparkles,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Copy,
  Eye,
  RefreshCw,
  X,
  Shuffle,
  BarChart2,
  Users,
  CheckSquare,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Send,
  Calendar,
  Lock,
  Printer,
  Upload,
  Download,
  HelpCircle,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  FileSpreadsheet,
  ChevronDown,
  School,
} from 'lucide-react'
import { lmsUjianService } from '../services/lmsUjianService'
import { useAuthStore } from '../stores/authStore'
import { useUnitStore } from '../stores/unitStore'
import useDebounce from '../hooks/useDebounce'
import ActionDropdown from '../components/app/ActionDropdown'
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
import { downloadSpreadsheetTemplate } from '../utils/spreadsheetParser'

// ── PALET WARNA RESMI MODERN KPI CARDS (HEROUI STANDARDS) ──
const MODERN_CARD_TONES = {
  emerald: {
    card: 'border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
    glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
    iconBox: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/30',
    tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    title: 'text-emerald-700 dark:text-emerald-400',
    val: 'text-emerald-700 dark:text-emerald-300',
    sub: 'text-emerald-600/80 dark:text-emerald-400/80',
  },
  amber: {
    card: 'border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
    glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
    iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/30',
    tag: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    title: 'text-amber-700 dark:text-amber-400',
    val: 'text-amber-700 dark:text-amber-300',
    sub: 'text-amber-600/80 dark:text-amber-400/80',
  },
  purple: {
    card: 'border-purple-300/70 bg-gradient-to-br from-purple-50 via-fuchsia-50/60 to-white hover:border-purple-400 dark:border-purple-700/50 dark:from-purple-950/40 dark:via-fuchsia-950/20 dark:to-slate-900',
    glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
    iconBox: 'bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-purple-500/30',
    tag: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
    title: 'text-purple-700 dark:text-purple-400',
    val: 'text-purple-700 dark:text-purple-300',
    sub: 'text-purple-600/80 dark:text-purple-400/80',
  },
  blue: {
    card: 'border-blue-300/70 bg-gradient-to-br from-blue-50 via-indigo-50/60 to-white hover:border-blue-400 dark:border-blue-700/50 dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-slate-900',
    glow: 'bg-blue-400/20 group-hover:bg-blue-400/30',
    iconBox: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/30',
    tag: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
    title: 'text-blue-700 dark:text-blue-400',
    val: 'text-blue-700 dark:text-blue-300',
    sub: 'text-blue-600/80 dark:text-blue-400/80',
  },
}

function ModernKpiCard({ icon: Icon, label, subtext, value, tag, tone = 'emerald', onClick, active = false }) {
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
      className={`group relative overflow-hidden rounded-[22px] border-2 p-4 sm:p-5 shadow-xs transition-all duration-150 text-left ${
        isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
      } ${t.card} ${active ? '!ring-2 !ring-emerald-500 !border-emerald-500 shadow-md shadow-emerald-500/20' : ''}`}
    >
      <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all ${t.glow}`} />
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-sm ${t.iconBox}`}>
            <Icon className="h-5 w-5" />
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

      <p className={`text-2xl sm:text-3xl font-black tabular-nums tracking-tight ${t.val}`}>
        {value ?? '0'}
      </p>
      {subtext && (
        <p className={`mt-1 text-[11px] font-semibold ${t.sub} flex items-center gap-1 truncate`}>
          <span>{subtext}</span>
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

// ── HARMONIZED BATCH IMPORT MODAL ──
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
            nama_ujian: (parts[0] || '').replace(/["\r]/g, '').trim(),
            mapel: (parts[1] || '').replace(/["\r]/g, '').trim(),
            kelas: (parts[2] || '').replace(/["\r]/g, '').trim(),
            durasi: (parts[3] || '60').replace(/["\r]/g, '').trim(),
            status: (parts[4] || 'published').replace(/["\r]/g, '').trim(),
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
    const headers = ['NAMA_UJIAN', 'MATA_PELAJARAN', 'KELAS', 'DURASI_MENIT', 'STATUS']
    const sampleRows = [
      ['"Penilaian Akhir Semester CBT Matematika X"', '"Matematika"', '"Kelas 10-A"', '"90"', '"published"'],
      ['"Kuis Harian 01 Biologi Sel"', '"Biologi"', '"Kelas 11-IPA 1"', '"45"', '"draft"'],
    ]
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...sampleRows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'template_import_jadwal_ujian_cbt.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    notify('Unduh Template', 'Template berkas CSV Jadwal Ujian CBT berhasil diunduh.', 'success')
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
      const res = await lmsUjianService.import(formData)
      notify('Impor Berhasil', res?.message || `Berkas ${selectedFile.name} berhasil diimpor ke jadwal Ujian CBT.`, 'success')
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
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-emerald-500/20 bg-white shadow-2xl shadow-emerald-950/20 dark:border-emerald-500/30 dark:bg-[#1B2433]"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-600/30">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Impor Berkas Jadwal CBT</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Unggah berkas spreadsheet jadwal ujian online</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200">Unduh Format Spreadsheet Resmi</p>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400/80">Gunakan template kolom yang sudah distandardisasi</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm border border-emerald-200 hover:bg-emerald-50 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-700 transition-all shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Template</span>
            </button>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
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

          {previewRows.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Pratinjau Data Ujian (5 Baris Pertama)
              </p>
              <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
                <TableRoot className="w-full text-left text-xs">
                  <TableHeader className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold border-b border-emerald-200/80">
                    <TableRow>
                      <TableHead className="py-2 px-3">No</TableHead>
                      <TableHead className="py-2 px-3">Judul Ujian</TableHead>
                      <TableHead className="py-2 px-3">Mapel</TableHead>
                      <TableHead className="py-2 px-3">Kelas</TableHead>
                      <TableHead className="py-2 px-3">Durasi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-emerald-100/70 dark:divide-emerald-900/40">
                    {previewRows.map((r, i) => (
                      <TableRow key={i} className="hover:bg-emerald-50/30">
                        <TableCell className="py-2 px-3 font-semibold text-slate-500">{i + 1}</TableCell>
                        <TableCell className="py-2 px-3 font-medium text-slate-800 dark:text-slate-100 truncate max-w-[180px]">{r.nama_ujian || '-'}</TableCell>
                        <TableCell className="py-2 px-3 text-slate-600 dark:text-slate-300">{r.mapel || '-'}</TableCell>
                        <TableCell className="py-2 px-3 text-slate-600 dark:text-slate-300">{r.kelas || '-'}</TableCell>
                        <TableCell className="py-2 px-3 font-bold text-emerald-700">{r.durasi} Menit</TableCell>
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
            <span>{isSubmitting ? 'Memproses Berkas...' : 'Proses Impor Jadwal'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── HARMONIZED SAVE CONFIRMATION MODAL ──
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
              {isEdit ? <Edit3 className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </div>
            <div>
              <span
                className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                  isEdit
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                }`}
              >
                {isEdit ? 'Perbarui Jadwal CBT' : 'Jadwal CBT Baru'}
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                Konfirmasi Terbitkan Ujian
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            Apakah Anda yakin ingin {isEdit ? 'memperbarui pengaturan' : 'mempublikasikan'} sesi ujian CBT:
          </p>

          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3.5 dark:border-emerald-800/60 dark:bg-emerald-950/20 mb-5">
            <p className="text-xs font-black text-emerald-950 dark:text-emerald-100 line-clamp-2">{title || 'Sesi Ujian CBT'}</p>
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

// ── HARMONIZED BATCH EXPORT MODAL ──
function HarmonizedBatchExportModal({
  isOpen,
  onClose,
  onExport,
  isExporting,
  totalCount,
  moduleTitle = 'CBT Ujian',
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
        animate={{ opacity: 1, scale: 1, y: 0 }}
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
                Data yang diekspor akan mencakup seluruh entitas terfilter ({totalCount} sesi {moduleTitle.toLowerCase()}).
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

// ── HARMONIZED DELETE CONFIRMATION MODAL ──
function HarmonizedDeleteModal({ isOpen, onClose, onConfirm, item, isSubmitting }) {
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
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">Hapus Sesi CBT Ujian?</h3>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            Apakah Anda yakin ingin menghapus sesi ujian{' '}
            <strong className="text-slate-900 dark:text-white font-bold">"{item.judul_ujian || item.nama_ujian}"</strong>?
            Semua riwayat hasil penilaian dan sesi pengerjaan siswa yang terkait akan terhapus.
          </p>

          <div className="rounded-xl border border-rose-200/80 bg-rose-50/50 p-3 dark:border-rose-900/40 dark:bg-rose-950/20 mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-rose-800 dark:text-rose-300">
                Tindakan ini tidak dapat dibatalkan. Pastikan data tidak sedang dikerjakan secara aktif oleh siswa.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
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
              onClick={() => onConfirm(item.id)}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-red-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-600/30 hover:brightness-105 disabled:opacity-50 transition-all"
            >
              {isSubmitting && <RefreshCw className="h-4 w-4 animate-spin" />}
              <span>{isSubmitting ? 'Menghapus...' : 'Ya, Hapus Sesi'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ── MAIN PAGE COMPONENT ──
export default function LmsUjianPage({
  embedded = false,
  hideBreadcrumb = false,
  hidePageHeader = false,
  tabNav = null,
}) {
  const user = useAuthStore((state) => state.user)
  const activeUnit = useUnitStore((state) => state.activeUnit)

  const userUnitId = useMemo(() => {
    const candidateIds = [
      user?.unit_id,
      user?.unit_pendidikan_id,
      user?.education_unit_id,
      user?.unit?.id,
      user?.education_unit?.id,
      user?.unit_pendidikan?.id,
      user?.employee?.unit_id,
      user?.employee?.unit_pendidikan_id,
      user?.employee?.education_unit_id,
      user?.school_info?.id,
    ].filter(Boolean)
    return candidateIds.length > 0 ? String(candidateIds[0]) : null
  }, [user])

  const isSuperAdminOrYayasan = useMemo(() => {
    const roles = (user?.roles || []).map((r) => (typeof r === 'string' ? r : r.name || ''))
    return roles.some((r) => ['super_admin', 'Super Admin', 'super-admin', 'yayasan', 'Yayasan', 'pengurus_yayasan', 'ketua_yayasan'].includes(r))
  }, [user])

  const isDivisiPendidikan = useMemo(() => {
    const roles = (user?.roles || []).map((r) => (typeof r === 'string' ? r : r.name || ''))
    return roles.some((r) => ['Divisi Pendidikan', 'divisi_pendidikan', 'divisi-pendidikan', 'Kepala Bidang Pendidikan', 'kepala_bidang_pendidikan', 'Divisi Kurikulum', 'Divisi Kesiswaan'].includes(r))
  }, [user])

  const canSelectUnit = isSuperAdminOrYayasan || isDivisiPendidikan
  const userUnitName = user?.unit_name || user?.employee?.unit?.nama_unit || user?.employee?.unit?.name || 'Unit Anda'
  const [selectedUnit, setSelectedUnit] = useState(canSelectUnit ? '' : (userUnitId ? String(userUnitId) : ''))

  // Data & State
  const [dataList, setDataList] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0, perPage: 10 })
  const [stats, setStats] = useState({
    total_ujian: 0,
    total_published: 0,
    total_berlangsung: 0,
    total_selesai: 0,
    total_peserta: 0,
    rata_nilai: 0,
  })
  const [options, setOptions] = useState({
    units: [],
    kisi_kisi: [],
    kelas: [],
    semesters: [],
    guru: [],
    status_options: [],
  })

  // Filters with Debounce
  const [filters, setFilters] = useState({
    search: '',
    kelas_id: '',
    status: '',
  })
  const debouncedSearch = useDebounce(filters.search, 350)

  // Notifications Stack
  const { items: toastItems, push: notify, dismiss: dismissToast } = useNotifications()
  const addToast = (message, type = 'success', title = '') => {
    notify(title || (type === 'error' ? 'Gagal' : 'Informasi'), message, type)
  }

  // Modals & Action States
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [showResultsModal, setShowResultsModal] = useState(false)
  const [showCbtEngineModal, setShowCbtEngineModal] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [resultsData, setResultsData] = useState(null)
  const [rowDetailItem, setRowDetailItem] = useState(null)
  const [showRowDetailModal, setShowRowDetailModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    kisi_kisi_id: '',
    kelas_id: '',
    semester_id: '',
    guru_id: '',
    judul_ujian: '',
    instruksi: '',
    waktu_mulai: '',
    waktu_selesai: '',
    durasi_menit: 60,
    acak_soal: true,
    acak_jawaban: true,
    tampilkan_nilai_langsung: true,
    nilai_kkm: 75.0,
    max_attempt: 1,
    status: 'published',
  })

  // CBT Live Engine Simulator State
  const [cbtSession, setCbtSession] = useState(null)
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [cbtSubmitting, setCbtSubmitting] = useState(false)
  const [examResultSummary, setExamResultSummary] = useState(null)
  const [showFinishConfirmModal, setShowFinishConfirmModal] = useState(false)
  const timerIntervalRef = useRef(null)

  // Fetch Stats & Options on Load
  useEffect(() => {
    fetchStats()
    fetchOptions()
  }, [userUnitId, activeUnit, selectedUnit])

  // Fetch Data when Filters / Pagination / Debounced Search change
  useEffect(() => {
    fetchData(1)
  }, [debouncedSearch, filters.kelas_id, filters.status, userUnitId, activeUnit, selectedUnit])

  // Timer Countdown Effect
  useEffect(() => {
    if (showCbtEngineModal && timerSeconds > 0 && !examResultSummary) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current)
            handleAutoSubmitCbt()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [showCbtEngineModal, timerSeconds, examResultSummary])

  // Data Fetching
  const fetchData = async (page = 1) => {
    setLoading(true)
    try {
      const params = {
        page,
        per_page: pagination.perPage || 10,
        search: debouncedSearch,
        kelas_id: filters.kelas_id,
        status: filters.status,
      }
      const effectiveUnit = canSelectUnit ? (selectedUnit || undefined) : (userUnitId || undefined)
      if (effectiveUnit) params.unit_pendidikan_id = effectiveUnit
      if (activeUnit) params.jenjang = activeUnit

      const response = await lmsUjianService.getDaftar(params)
      if (response && response.data) {
        let rawData = Array.isArray(response.data) ? response.data : response.data?.data || []
        let filteredData = rawData.filter((item) => {
          if (!item) return false
          const itemUnitId =
            item.unit_pendidikan_id ||
            item.unit_id ||
            item.kisi_kisi?.unit_pendidikan_id ||
            item.kisi_kisi?.mata_pelajaran?.unit_pendidikan_id
          if (!canSelectUnit && userUnitId && itemUnitId) return String(itemUnitId) === String(userUnitId)
          if (canSelectUnit && selectedUnit && itemUnitId) return String(itemUnitId) === String(selectedUnit)
          return true
        })
        setDataList(filteredData)
        setPagination((prev) => ({
          ...prev,
          currentPage: response.meta?.current_page || page,
          lastPage: response.meta?.last_page || 1,
          total: response.meta?.total ?? filteredData.length,
        }))
      }
    } catch (error) {
      console.error('Error loading CBT Ujian data:', error)
      notify('Gagal Memuat Data', 'Tidak dapat mengambil daftar sesi CBT Ujian', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const params = {}
      const effectiveUnit = canSelectUnit ? (selectedUnit || undefined) : (userUnitId || undefined)
      if (effectiveUnit) params.unit_pendidikan_id = effectiveUnit
      if (activeUnit) params.jenjang = activeUnit
      const response = await lmsUjianService.getStats(params)
      if (response && response.data) setStats(response.data)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const fetchOptions = async () => {
    try {
      const params = {}
      const effectiveUnit = canSelectUnit ? (selectedUnit || undefined) : (userUnitId || undefined)
      if (effectiveUnit) params.unit_pendidikan_id = effectiveUnit
      if (activeUnit) params.jenjang = activeUnit

      const response = await lmsUjianService.getOptions(params)
      if (response && response.data) {
        const optData = response.data
        const filteredKisi = (optData.kisi_kisi || []).filter((k) => {
          if (!k) return false
          const kUnitId = k.unit_pendidikan_id || k.unit_id || k.mata_pelajaran?.unit_pendidikan_id
          if (!canSelectUnit && userUnitId && kUnitId) return String(kUnitId) === String(userUnitId)
          if (canSelectUnit && selectedUnit && kUnitId) return String(kUnitId) === String(selectedUnit)
          return true
        })
        setOptions({
          ...optData,
          kisi_kisi: filteredKisi,
        })
      }
    } catch (error) {
      console.error('Error loading options:', error)
    }
  }

  // Form CRUD Handling
  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        kisi_kisi_id: item.kisi_kisi_id || '',
        kelas_id: item.kelas_id || '',
        semester_id: item.semester_id || '',
        guru_id: item.guru_id || '',
        judul_ujian: item.judul_ujian || '',
        instruksi: item.instruksi || '',
        waktu_mulai: item.waktu_mulai ? item.waktu_mulai.substring(0, 16) : '',
        waktu_selesai: item.waktu_selesai ? item.waktu_selesai.substring(0, 16) : '',
        durasi_menit: item.durasi_menit || 60,
        acak_soal: item.acak_soal !== undefined ? item.acak_soal : true,
        acak_jawaban: item.acak_jawaban !== undefined ? item.acak_jawaban : true,
        tampilkan_nilai_langsung: item.tampilkan_nilai_langsung !== undefined ? item.tampilkan_nilai_langsung : true,
        nilai_kkm: item.nilai_kkm || 75.0,
        max_attempt: item.max_attempt || 1,
        status: item.status || 'published',
      })
    } else {
      setEditingItem(null)
      const defaultKisi = options.kisi_kisi.length > 0 ? options.kisi_kisi[0].id : ''
      const defaultKelas = options.kelas.length > 0 ? options.kelas[0].id : ''
      const defaultSemester = options.semesters.length > 0 ? options.semesters[0].id : ''

      setFormData({
        kisi_kisi_id: defaultKisi,
        kelas_id: defaultKelas,
        semester_id: defaultSemester,
        guru_id: '',
        judul_ujian: '',
        instruksi: 'Kerjakan ujian ini dengan jujur dan teliti. Selamat mengerjakan!',
        waktu_mulai: '',
        waktu_selesai: '',
        durasi_menit: 60,
        acak_soal: true,
        acak_jawaban: true,
        tampilkan_nilai_langsung: true,
        nilai_kkm: 75.0,
        max_attempt: 1,
        status: 'published',
      })
    }
    setShowModal(true)
  }

  const handleTriggerSave = (e) => {
    e.preventDefault()
    if (!formData.judul_ujian.trim()) {
      notify('Judul Ujian Diperlukan', 'Judul Ujian wajib diisi sebelum menyimpan.', 'warning')
      return
    }
    setIsSaveModalOpen(true)
  }

  const handleConfirmSave = async () => {
    setIsSubmittingForm(true)
    try {
      if (editingItem) {
        await lmsUjianService.update(editingItem.id, formData)
        notify('Berhasil Diperbarui', 'Sesi CBT Ujian berhasil disimpan.', 'success')
      } else {
        await lmsUjianService.create(formData)
        notify('Berhasil Diterbitkan', 'Sesi CBT Ujian baru telah aktif untuk siswa.', 'success')
      }
      setIsSaveModalOpen(false)
      setShowModal(false)
      fetchData(pagination.currentPage)
      fetchStats()
    } catch (error) {
      console.error('Error saving CBT Ujian:', error)
      const errorMsg = error.response?.data?.message || 'Gagal menyimpan sesi CBT Ujian.'
      notify('Gagal Menyimpan', errorMsg, 'error')
    } finally {
      setIsSubmittingForm(false)
    }
  }

  const handleDeleteConfirm = async (id) => {
    setIsDeleting(true)
    try {
      await lmsUjianService.delete(id)
      notify('Berhasil Dihapus', 'Sesi CBT Ujian telah dihapus dari sistem.')
      setDeleteTarget(null)
      fetchData(pagination.currentPage)
      fetchStats()
    } catch (error) {
      console.error('Error deleting item:', error)
      notify('Gagal Menghapus', 'Terjadi kesalahan saat menghapus sesi CBT Ujian.', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDuplicate = async (id) => {
    try {
      await lmsUjianService.duplicate(id)
      notify('Berhasil Diduplikasi', 'Salinan sesi CBT Ujian berhasil dibuat.')
      fetchData(pagination.currentPage)
      fetchStats()
    } catch (error) {
      console.error('Error duplicating item:', error)
      notify('Gagal Duplikasi', 'Terjadi kendala saat menduplikasi sesi CBT.', 'error')
    }
  }

  const handleTogglePublish = async (id, newStatus) => {
    try {
      await lmsUjianService.togglePublish(id, newStatus)
      notify('Status Diperbarui', `Status ujian dialihkan menjadi ${newStatus}`)
      fetchData(pagination.currentPage)
      fetchStats()
    } catch (error) {
      console.error('Error updating status:', error)
      notify('Gagal Mengubah Status', 'Terjadi kesalahan saat memperbarui status.', 'error')
    }
  }

  // Export Process Helper
  const handleProcessExport = async (format = 'xlsx') => {
    if (!dataList.length) {
      notify('Data Kosong', 'Tidak ada jadwal ujian untuk diekspor.', 'warning')
      return
    }
    setIsExporting(true)
    try {
      const exportData = dataList.map((item, i) => ({
        'No': i + 1,
        'Judul Ujian': item.judul_ujian || item.nama_ujian || '-',
        'Mata Pelajaran': item.kisi_kisi?.mata_pelajaran || item.subject || '-',
        'Kelas': item.kelas?.nama_kelas || 'Semua Kelas',
        'Durasi (Menit)': item.durasi_menit || 0,
        'Nilai KKM': item.nilai_kkm || 75,
        'Status Sesi': (item.status || 'draft').toUpperCase(),
        'Tipe CBT': item.cbt_type || 'Standar CBT',
      }))

      downloadSpreadsheetTemplate(
        exportData,
        `jadwal_cbt_ujian_${new Date().toISOString().slice(0, 10)}`,
        format,
        'Jadwal Ujian CBT'
      )
      setIsExportModalOpen(false)
      notify('Ekspor Berhasil', `Berkas Jadwal CBT Ujian .${format.toUpperCase()} berhasil diunduh.`, 'success')
    } catch (err) {
      notify('Gagal Ekspor', err?.message || 'Terjadi kesalahan saat menyiapkan berkas ekspor.', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  // Open Results Analytics
  const handleOpenResults = async (ujianId) => {
    try {
      const response = await lmsUjianService.getResults(ujianId)
      if (response && response.data) {
        setResultsData(response.data)
        setShowResultsModal(true)
      }
    } catch (error) {
      console.error('Error fetching CBT results:', error)
      notify('Gagal Memuat Hasil', 'Tidak dapat mengambil rekapitulasi nilai peserta CBT.', 'error')
    }
  }

  // Launch CBT Student Simulation
  const handleLaunchCbtEngine = async (ujianItem) => {
    try {
      const response = await lmsUjianService.startSession(ujianItem.id, { is_simulation: true })
      if (response && response.data) {
        const sess = response.data
        if (!sess.soal || sess.soal.length === 0) {
          notify('Soal Belum Siap', 'Ujian ini belum memiliki butir soal aktif di bank soal.', 'warning')
          return
        }
        setCbtSession(sess)
        setCurrentQuestionIdx(0)
        setUserAnswers({})
        setExamResultSummary(null)
        setTimerSeconds(sess.ujian.sisa_waktu_detik || sess.ujian.durasi_menit * 60)
        setShowCbtEngineModal(true)
      }
    } catch (error) {
      console.error('Error launching CBT Engine:', error)
      const errorMsg = error?.response?.data?.message || 'Tidak dapat memulai simulasi engine CBT.'
      notify('Simulasi Gagal', errorMsg, 'error')
    }
  }

  const handleSelectAnswer = (soalId, value, tipe) => {
    setUserAnswers((prev) => ({
      ...prev,
      [soalId]: {
        soal_id: soalId,
        jawaban_dipilih: tipe === 'pg' || tipe === 'benar_salah' ? value : null,
        jawaban_esai: tipe === 'esai' || tipe === 'menjodohkan' ? value : null,
      },
    }))
  }

  const handleFinishCbt = () => {
    if (!cbtSession) return
    setShowFinishConfirmModal(true)
  }

  const confirmSubmitCbt = async () => {
    if (!cbtSession) return
    setCbtSubmitting(true)
    try {
      const formattedAnswers = Object.values(userAnswers)
      const response = await lmsUjianService.finishSession(cbtSession.sesi_id, formattedAnswers)
      if (response && response.data) {
        setExamResultSummary(response.data)
        notify('Ujian Selesai', 'Ujian CBT berhasil diselesaikan dan dinilai otomatis!')
        fetchStats()
        fetchData(pagination.currentPage)
      }
    } catch (error) {
      console.error('Error finishing CBT session:', error)
      notify('Pengumpulan Gagal', 'Terjadi kesalahan saat mengumpulkan lembar jawaban.', 'error')
    } finally {
      setCbtSubmitting(false)
      setShowFinishConfirmModal(false)
    }
  }

  const handleAutoSubmitCbt = async () => {
    if (!cbtSession || examResultSummary) return
    setCbtSubmitting(true)
    try {
      const formattedAnswers = Object.values(userAnswers)
      const response = await lmsUjianService.finishSession(cbtSession.sesi_id, formattedAnswers)
      if (response && response.data) {
        setExamResultSummary(response.data)
        notify('Waktu Habis!', 'Ujian otomatis dikumpulkan dan dinilai oleh sistem.', 'warning')
      }
    } catch (error) {
      console.error('Auto submit error:', error)
    } finally {
      setCbtSubmitting(false)
    }
  }

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Dipublikasikan
          </span>
        )
      case 'berlangsung':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800 animate-pulse">
            <Play className="w-3.5 h-3.5 fill-current" /> Berlangsung
          </span>
        )
      case 'selesai':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-300/80 dark:border-purple-800">
            <Award className="w-3.5 h-3.5" /> Selesai
          </span>
        )
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300/70 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5" /> Draft
          </span>
        )
    }
  }

  // Main Page Render
  const pageContent = (
    <div className="lms-ujian-page space-y-6 pb-12">

      {/* ── HERO BANNER HEADER CARD (Vivid Emerald Spec) ── */}
      {!embedded && !hidePageHeader && (
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-4 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-teal-500/30 via-emerald-400/20 to-transparent blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
              <div className="flex size-11 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <Play className="size-5 sm:size-7 text-white fill-white/20" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-0.5 sm:px-3.5 sm:py-1 text-[11px] sm:text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                    <Sparkles className="size-3 text-amber-300 animate-pulse" />
                    Layer 3: Evaluasi CBT &amp; Penilaian Online
                  </span>
                </div>
                <h1 className="mt-1.5 text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Ujian Online (CBT) &amp; Evaluasi Siswa
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 w-full leading-relaxed">
                  Penyelenggaraan ujian berbasis komputer terintegrasi Bank Soal dengan Timer real-time, pengacakan butir soal &amp; opsi, auto scoring, dan rekapitulasi analisis nilai instan.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300/80 bg-emerald-50/80 px-3 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-extrabold text-emerald-800 shadow-xs dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
                Sesi Ujian CBT Aktif
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── 4 MODERN KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ModernKpiCard
          icon={Layers}
          label="Total Ujian CBT"
          value={stats.total_ujian}
          subtext={`${stats.total_published || 0} Dipublikasikan`}
          tag="Semua"
          tone="emerald"
          active={filters.status === ''}
          onClick={() => setFilters((prev) => ({ ...prev, status: '' }))}
        />
        <ModernKpiCard
          icon={Play}
          label="Sedang Berlangsung"
          value={stats.total_berlangsung}
          subtext="Sesi Ujian Aktif"
          tag="Live"
          tone="amber"
          active={filters.status === 'berlangsung'}
          onClick={() => setFilters((prev) => ({ ...prev, status: 'berlangsung' }))}
        />
        <ModernKpiCard
          icon={Users}
          label="Total Peserta"
          value={stats.total_peserta}
          subtext="Siswa Mengikuti"
          tag="Peserta"
          tone="purple"
          active={filters.status === 'published'}
          onClick={() => setFilters((prev) => ({ ...prev, status: 'published' }))}
        />
        <ModernKpiCard
          icon={Award}
          label="Rata-rata Nilai"
          value={stats.rata_nilai}
          subtext="Skor Auto Scoring"
          tag="Selesai"
          tone="blue"
          active={filters.status === 'selesai'}
          onClick={() => setFilters((prev) => ({ ...prev, status: 'selesai' }))}
        />
      </div>

      {/* Tab Navigation Slot if supplied */}
      {tabNav && <div className="my-2">{typeof tabNav === 'function' ? tabNav() : tabNav}</div>}

      {/* ── MASTER DATATABLE CONTAINER (HEROUI EMERALD STANDARD) ── */}
      <section
        className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]"
        aria-labelledby="ujian-table-title"
      >
        {/* ROW 1: TOOLBAR HEADER & 4 SQUIRCLE ACTION BUTTONS */}
        <div className="border-b border-emerald-200/90 bg-gradient-to-r from-emerald-50/10 via-teal-500/5 to-transparent px-4 py-3.5 sm:px-6 md:px-8 dark:border-emerald-800/60">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                <h2 id="ujian-table-title" className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  Daftar Ujian Online (Evaluasi CBT)
                </h2>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  {pagination.total} Sesi
                </span>
              </div>
              <p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                Sesi ujian terjadwal, timer countdown, auto scoring, dan rekap peserta.
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
                label="Terbitkan Ujian"
                onClick={() => handleOpenModal()}
                className="!size-10 !rounded-2xl !bg-gradient-to-br !from-emerald-500 !via-emerald-600 !to-teal-700 !text-white !border-0 hover:!brightness-110 !shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* ROW 2: FULL-WIDTH DEBOUNCED SEARCH INPUT */}
        <div className="border-b border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 px-4 py-3 sm:px-6 md:px-8 dark:border-emerald-800/60 dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-emerald-950/20">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600/70 dark:text-emerald-400" />
            <input
              type="text"
              placeholder="Cari judul ujian CBT, kisi-kisi, mata pelajaran, atau instruksi..."
              value={filters.search}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }}
              className="h-10 sm:h-11 w-full rounded-2xl border border-emerald-200/90 bg-white pl-10 sm:pl-11 pr-10 text-xs font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-emerald-800/70 dark:bg-slate-900 dark:text-slate-100"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => {
                  setFilters((prev) => ({ ...prev, search: '' }))
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* ROW 3: HORIZONTAL FILTER DROPDOWNS & RESET BUTTON */}
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
                }}
                placeholder={`Semua Unit (${options.units?.length || 'SIT'})`}
                icon={School}
                popoverWidth="min-w-[220px]"
                searchable={(options.units?.length || 0) > 5}
                options={[
                  { value: '', label: `Semua Unit (${options.units?.length || 'SIT'})` },
                  ...(options.units || []).map((u) => ({ value: String(u.id), label: u.name || u.nama_unit })),
                ]}
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

            {/* Select Kelas */}
            <HeroUiFilterSelect
              value={filters.kelas_id}
              onChange={(val) => {
                setFilters((prev) => ({ ...prev, kelas_id: val }))
              }}
              placeholder="Semua Kelas Sasaran"
              icon={Layers}
              popoverWidth="min-w-[170px]"
              options={[
                { value: '', label: 'Semua Kelas Sasaran' },
                ...options.kelas.map((k) => ({
                  value: k.id,
                  label: k.nama_kelas,
                })),
              ]}
            />

            {/* Select Status */}
            <HeroUiFilterSelect
              value={filters.status}
              onChange={(val) => {
                setFilters((prev) => ({ ...prev, status: val }))
              }}
              placeholder="Semua Status Ujian"
              popoverWidth="min-w-[170px]"
              options={[
                { value: '', label: 'Semua Status Ujian' },
                { value: 'draft', label: 'Draft' },
                { value: 'published', label: 'Dipublikasikan' },
                { value: 'berlangsung', label: 'Sedang Berlangsung' },
                { value: 'selesai', label: 'Selesai' },
              ]}
            />

            {/* Reset Button */}
            {((canSelectUnit && selectedUnit) || filters.search || filters.kelas_id || filters.status) && (
              <button
                type="button"
                onClick={() => {
                  if (canSelectUnit) setSelectedUnit('')
                  setFilters({ search: '', kelas_id: '', status: '' })
                }}
                className="w-full sm:w-auto sm:ml-auto inline-flex items-center justify-center gap-1.5 h-9.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                title="Reset Semua Filter"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* ── DATATABLE CONTENT ── */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Memuat data CBT Ujian Online...</p>
          </div>
        ) : dataList.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 mb-3">
              <Play className="h-7 w-7 fill-emerald-600/20" />
            </div>
            <div className="max-w-sm mx-auto">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Belum Ada Sesi Ujian CBT</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Belum ada jadwal sesi ujian online yang sesuai filter. Silakan buat sesi CBT baru untuk kelas sasaran.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:brightness-105 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Terbitkan Ujian Sekarang</span>
            </button>
          </div>
        ) : (
          <MasterDataTable className="!rounded-none !border-0 !shadow-none">
            <TableRoot className="w-full text-left text-sm border-collapse">
              <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
                <TableRow className="border-b-2 border-emerald-200/90 dark:border-emerald-800/80 bg-transparent text-emerald-950 dark:text-emerald-200 text-[11px] font-black uppercase tracking-wider">
                  <TableHead className="w-auto sm:w-[32%] md:w-[30%] bg-transparent px-3.5 sm:px-6 md:px-8 py-3.5 font-black text-[11px] uppercase tracking-wider">
                    Judul &amp; Kisi-kisi Ujian
                  </TableHead>
                  <TableHead className="hidden sm:table-cell w-[20%] bg-transparent px-3 py-3.5 font-black text-[11px] uppercase tracking-wider">
                    Kelas &amp; Pengampu
                  </TableHead>
                  <TableHead className="hidden md:table-cell w-[14%] bg-transparent px-3 py-3.5 text-center font-black text-[11px] uppercase tracking-wider">
                    Durasi &amp; KKM
                  </TableHead>
                  <TableHead className="hidden lg:table-cell w-[14%] bg-transparent px-3 py-3.5 text-center font-black text-[11px] uppercase tracking-wider">
                    Pengaturan CBT
                  </TableHead>
                  <TableHead className="hidden sm:table-cell w-[10%] bg-transparent px-3 py-3.5 text-center font-black text-[11px] uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="w-14 sm:w-[10%] bg-transparent px-2 sm:px-3.5 py-3.5 text-center font-black text-[11px] uppercase tracking-wider">
                    Aksi CBT
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-sm">
                {dataList.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors cursor-pointer group"
                    onClick={(e) => {
                      if (e.target.closest('button, a, [data-no-rowclick]')) return
                      setRowDetailItem(item)
                      setShowRowDetailModal(true)
                    }}
                  >
                    {/* Kolom 1: Judul Ujian & Kisi-kisi dengan HoverCard */}
                    <TableCell className="py-3.5 px-3.5 sm:px-6 md:px-8 align-middle max-w-sm relative">
                      {/* HoverCard Preview */}
                      <div className="pointer-events-none absolute left-5 top-full mt-1 z-50 w-72 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out">
                        <div className="bg-white dark:bg-[#1B2433] rounded-2xl border border-emerald-300/80 dark:border-emerald-700 shadow-xl p-3.5 space-y-2">
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                            <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                            <p className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1">
                              {item.judul_ujian || item.nama_ujian}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <p className="text-[10px] text-slate-400 font-semibold uppercase">Durasi</p>
                              <p className="font-bold text-slate-700 dark:text-slate-200">{item.durasi_menit || 0} Menit</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 font-semibold uppercase">KKM</p>
                              <p className="font-bold text-emerald-600 dark:text-emerald-400">{item.nilai_kkm || 75}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 font-semibold uppercase">Kelas</p>
                              <p className="font-semibold text-slate-700 dark:text-slate-200 truncate">{item.kelas?.nama_kelas || 'Semua'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 font-semibold uppercase">Status</p>
                              <p className="font-semibold text-slate-700 dark:text-slate-200 capitalize">{item.status || 'draft'}</p>
                            </div>
                          </div>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 pt-1.5 border-t border-slate-100 dark:border-slate-800 font-semibold">
                            Klik baris untuk pratinjau rincian lengkap
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/30 text-emerald-700 dark:text-emerald-300 font-black border border-emerald-300/60 dark:border-emerald-700">
                          <Play className="h-4 w-4 fill-current" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-slate-900 dark:text-white leading-tight mb-1 line-clamp-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                            {item.judul_ujian || item.nama_ujian}
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                              <BookOpen className="w-3 h-3" />
                              {item.kisi_kisi?.judul_kisi || 'Kisi-kisi Ujian'}
                            </span>
                            {item.kisi_kisi?.mata_pelajaran && (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                · {item.kisi_kisi.mata_pelajaran}
                              </span>
                            )}
                          </div>

                          {/* Mobile-only compact metadata row */}
                          <div className="sm:hidden mt-2 flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-emerald-100/80 dark:border-emerald-900/40">
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                              {item.kelas?.nama_kelas || 'Semua Kelas'}
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">·</span>
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                              {item.durasi_menit || 60}m
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">·</span>
                            {getStatusBadge(item.status)}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Kolom 2: Kelas & Guru */}
                    <TableCell className="hidden sm:table-cell py-3.5 px-3 align-middle">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {item.kelas?.nama_kelas || 'Semua Kelas'}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                        <span>Pengampu:</span>
                        <strong className="font-semibold text-slate-700 dark:text-slate-300">
                          {item.guru?.nama_lengkap || 'Guru Pengampu'}
                        </strong>
                      </div>
                    </TableCell>

                    {/* Kolom 3: Durasi & KKM */}
                    <TableCell className="hidden md:table-cell py-3.5 px-3 align-middle text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200 text-xs">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{item.durasi_menit || 60} Menit</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        KKM: <span className="font-black text-emerald-600 dark:text-emerald-400">{item.nilai_kkm || 75}</span>
                      </div>
                    </TableCell>

                    {/* Kolom 4: Pengaturan CBT */}
                    <TableCell className="hidden lg:table-cell py-3.5 px-3 align-middle text-center">
                      <div className="flex flex-wrap items-center justify-center gap-1.5">
                        {item.acak_soal && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800">
                            <Shuffle className="w-3 h-3" /> Acak Soal
                          </span>
                        )}
                        {item.tampilkan_nilai_langsung && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800">
                            <Award className="w-3 h-3" /> Auto Scoring
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Kolom 5: Status */}
                    <TableCell className="hidden sm:table-cell py-3.5 px-3 align-middle text-center">
                      {getStatusBadge(item.status)}
                    </TableCell>

                    {/* Kolom 6: ActionDropdown */}
                    <TableCell className="py-3.5 px-2 sm:px-3.5 align-middle text-center" data-no-rowclick>
                      <ActionDropdown
                        onView={() => {
                          setRowDetailItem(item)
                          setShowRowDetailModal(true)
                        }}
                        onEdit={() => handleOpenModal(item)}
                        onDelete={() => setDeleteTarget(item)}
                        extraItems={[
                          {
                            label: 'Simulasi Tes CBT',
                            icon: <Play className="size-4 text-emerald-600" />,
                            onClick: () => handleLaunchCbtEngine(item),
                          },
                          {
                            label: 'Hasil Ujian & Rekap Nilai',
                            icon: <BarChart2 className="size-4 text-purple-600" />,
                            onClick: () => handleOpenResults(item.id),
                          },
                          {
                            label: 'Duplikasi Sesi CBT',
                            icon: <Copy className="size-4 text-indigo-600" />,
                            onClick: () => handleDuplicate(item.id),
                          },
                          {
                            label: item.status === 'published' ? 'Kembalikan ke Draft' : 'Terbitkan Sesi Ujian',
                            icon: <RefreshCw className="size-4 text-amber-600" />,
                            onClick: () =>
                              handleTogglePublish(item.id, item.status === 'published' ? 'draft' : 'published'),
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableRoot>
          </MasterDataTable>
        )}

        {/* ── PAGINATION FOOTER (SQUIRCLE ICON-ONLY PREV/NEXT) ── */}
        {!loading && pagination.total > 0 && (
          <div className="border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/40 via-white to-emerald-50/40 p-3.5 sm:px-6 md:px-8 py-3 sm:py-3.5 dark:border-emerald-800/60 dark:bg-[#1B2433] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>Menampilkan Halaman</span>
              <strong className="font-extrabold text-slate-800 dark:text-slate-200">{pagination.currentPage}</strong>
              <span>dari</span>
              <strong className="font-extrabold text-slate-800 dark:text-slate-200">{pagination.lastPage || 1}</strong>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span>Total</span>
              <strong className="font-extrabold text-emerald-700 dark:text-emerald-400">{pagination.total} Sesi CBT</strong>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 w-full sm:w-auto">
              <HeroUiFilterSelect
                value={pagination.perPage || 10}
                onChange={(val) => {
                  const newPerPage = Number(val)
                  setPagination((prev) => ({ ...prev, perPage: newPerPage }))
                  fetchData(1)
                }}
                className="w-auto"
                popoverWidth="min-w-[120px]"
                options={[
                  { value: 10, label: '10 Baris' },
                  { value: 25, label: '25 Baris' },
                  { value: 50, label: '50 Baris' },
                ]}
              />

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={pagination.currentPage <= 1}
                  onClick={() => fetchData(pagination.currentPage - 1)}
                  className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 transition-all"
                  aria-label="Halaman Sebelumnya"
                >
                  <ChevronLeft className="size-5 text-white" />
                </button>
                <button
                  type="button"
                  disabled={pagination.currentPage >= pagination.lastPage}
                  onClick={() => fetchData(pagination.currentPage + 1)}
                  className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 transition-all"
                  aria-label="Halaman Selanjutnya"
                >
                  <ChevronRight className="size-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── ROW DETAIL QUICK PREVIEW MODAL ── */}
      {showRowDetailModal && rowDetailItem && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowRowDetailModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-[#1B2433] rounded-3xl w-full max-w-lg shadow-2xl border border-emerald-200/80 dark:border-emerald-800/80 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
            <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 shrink-0">
                  <Play className="w-5 h-5 fill-white/20" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {rowDetailItem.judul_ujian || rowDetailItem.nama_ujian}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {rowDetailItem.kelas?.nama_kelas || 'Semua Kelas'} · {rowDetailItem.guru?.nama_lengkap || 'Pengampu'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRowDetailModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(rowDetailItem.status)}
                {rowDetailItem.acak_soal && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    <Shuffle className="w-3 h-3" /> Acak Soal
                  </span>
                )}
                {rowDetailItem.tampilkan_nilai_langsung && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    <Award className="w-3 h-3" /> Auto Scoring
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-3.5 border border-emerald-100 dark:border-emerald-900/40">
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Durasi Pengerjaan</p>
                  <p className="text-base font-black text-emerald-800 dark:text-emerald-200 mt-0.5">{rowDetailItem.durasi_menit || 60} Menit</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nilai Standar KKM</p>
                  <p className="text-base font-black text-slate-800 dark:text-white mt-0.5">{rowDetailItem.nilai_kkm || 75}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 col-span-2 border border-slate-200/80 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sumber Kisi-kisi Bank Soal</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-white mt-1">
                    {rowDetailItem.kisi_kisi?.judul_kisi || '-'} ({rowDetailItem.kisi_kisi?.mata_pelajaran || '-'})
                  </p>
                </div>
              </div>

              {rowDetailItem.instruksi && (
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Instruksi & Tata Tertib</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{rowDetailItem.instruksi}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/40">
              <button
                type="button"
                onClick={() => setShowRowDetailModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Tutup
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRowDetailModal(false)
                    handleLaunchCbtEngine(rowDetailItem)
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 text-xs font-bold hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Simulasi CBT
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRowDetailModal(false)
                    handleOpenModal(rowDetailItem)
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hover:brightness-105 shadow-md shadow-emerald-700/30 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Sesi
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── CRUD FORM MODAL (CREATE / EDIT CBT EXAM SESSION) ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-[#1B2433] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-emerald-500/20 dark:border-emerald-500/30 flex flex-col"
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#1B2433] shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-600/30">
                  {editingItem ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {editingItem ? 'Edit Sesi CBT Ujian' : 'Terbitkan Ujian CBT Baru'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Konfigurasi parameter ujian, bank soal rujukan, durasi dan penilaian otomatis
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTriggerSave} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Judul Ujian */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Judul Sesi Ujian CBT <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Penilaian Akhir Semester (PAS) CBT Matematika Kelas X"
                  value={formData.judul_ujian}
                  onChange={(e) => setFormData((prev) => ({ ...prev, judul_ujian: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  required
                />
              </div>

              {/* Grid: Kisi-kisi & Kelas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <HeroUiModalSelect
                    label="Kisi-kisi Ujian (Sumber Bank Soal)"
                    required
                    value={formData.kisi_kisi_id}
                    onChange={(val) => setFormData((prev) => ({ ...prev, kisi_kisi_id: val }))}
                    placeholder="-- Pilih Kisi-kisi Bank Soal --"
                    icon={FileText}
                    searchable
                    options={options.kisi_kisi.map((k) => ({
                      value: k.id,
                      label: `${k.judul_kisi} (${k.subject_name || k.mata_pelajaran})`,
                    }))}
                  />
                </div>

                <div>
                  <HeroUiModalSelect
                    label="Kelas Sasaran"
                    required
                    value={formData.kelas_id}
                    onChange={(val) => setFormData((prev) => ({ ...prev, kelas_id: val }))}
                    placeholder="-- Pilih Kelas --"
                    icon={Layers}
                    options={options.kelas.map((k) => ({
                      value: k.id,
                      label: k.nama_kelas,
                    }))}
                  />
                </div>
              </div>

              {/* Grid: Durasi, Nilai KKM, Status Publish */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Durasi (Menit) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="360"
                    value={formData.durasi_menit}
                    onChange={(e) => setFormData((prev) => ({ ...prev, durasi_menit: parseInt(e.target.value) || 60 }))}
                    className="w-full px-3.5 py-2 text-xs font-semibold rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nilai Standar KKM
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.nilai_kkm}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nilai_kkm: parseFloat(e.target.value) || 75.0 }))}
                    className="w-full px-3.5 py-2 text-xs font-semibold rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <HeroUiModalSelect
                    label="Status Ujian"
                    value={formData.status}
                    onChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
                    placeholder="Pilih Status"
                    options={[
                      { value: 'draft', label: 'Draft' },
                      { value: 'published', label: 'Dipublikasikan' },
                      { value: 'berlangsung', label: 'Sedang Berlangsung' },
                      { value: 'selesai', label: 'Selesai' },
                    ]}
                  />
                </div>
              </div>

              {/* Pengaturan Engine CBT */}
              <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="text-xs font-extrabold text-emerald-950 dark:text-emerald-200 uppercase tracking-wider">
                    Pengaturan Engine CBT Otomatis
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={formData.acak_soal}
                      onChange={(e) => setFormData((prev) => ({ ...prev, acak_soal: e.target.checked }))}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>Acak Urutan Soal</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={formData.acak_jawaban}
                      onChange={(e) => setFormData((prev) => ({ ...prev, acak_jawaban: e.target.checked }))}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>Acak Opsi Pilihan</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={formData.tampilkan_nilai_langsung}
                      onChange={(e) => setFormData((prev) => ({ ...prev, tampilkan_nilai_langsung: e.target.checked }))}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>Auto Scoring Langsung</span>
                  </label>
                </div>
              </div>

              {/* Instruksi & Peraturan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Instruksi & Tata Tertib Pengerjaan
                </label>
                <textarea
                  rows={3}
                  value={formData.instruksi}
                  onChange={(e) => setFormData((prev) => ({ ...prev, instruksi: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs font-medium rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all leading-relaxed"
                />
              </div>

              {/* Form Actions - Fixed at bottom without sticky wobble */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmittingForm}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingForm}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-extrabold shadow-md shadow-emerald-700/30 hover:brightness-105 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingForm && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{editingItem ? 'Simpan Perubahan' : 'Terbitkan Sesi Ujian'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ── LIVE INTERACTIVE CBT STUDENT ENGINE SIMULATION MODAL ── */}
      {showCbtEngineModal && cbtSession && (
        <div className="fixed inset-0 z-50 bg-[#0F172A] text-white flex flex-col overflow-hidden animate-fadeIn">
          {/* CBT Header with Countdown Timer */}
          <div className="bg-[#1E293B] px-6 py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs shadow-md">
                CBT ENGINE
              </div>
              <div>
                <h3 className="font-bold text-sm text-white leading-tight">{cbtSession.ujian.judul_ujian}</h3>
                <p className="text-xs text-emerald-400 font-semibold">Simulasi Lingkungan Ujian Siswa</p>
              </div>
            </div>

            {/* Countdown Timer Banner */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-mono text-sm font-black shadow-inner ${
                timerSeconds < 300
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-700 animate-pulse'
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Sisa Waktu: {formatTimer(timerSeconds)}</span>
            </div>

            <button
              type="button"
              onClick={() => setShowCbtEngineModal(false)}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* CBT Main Engine Body */}
          {!examResultSummary ? (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Question Navigator Sidebar */}
              <div className="w-full md:w-64 bg-[#1E293B]/70 p-4 border-r border-slate-800 overflow-y-auto shrink-0 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                    Navigasi Soal ({cbtSession.soal.length})
                  </h4>
                  <span className="text-[11px] font-bold text-emerald-400">
                    {Object.keys(userAnswers).length} / {cbtSession.soal.length}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {cbtSession.soal.map((soal, idx) => {
                    const isCurrent = currentQuestionIdx === idx
                    const isAnswered = !!userAnswers[soal.id]?.jawaban_dipilih || !!userAnswers[soal.id]?.jawaban_esai
                    return (
                      <button
                        key={soal.id}
                        type="button"
                        onClick={() => setCurrentQuestionIdx(idx)}
                        className={`h-9 rounded-xl font-black text-xs flex items-center justify-center transition-all ${
                          isCurrent
                            ? 'ring-2 ring-emerald-400 bg-emerald-600 text-white shadow-md'
                            : isAnswered
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    )
                  })}
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-600 ring-2 ring-emerald-400" />
                    <span>Sedang Dikerjakan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-950 border border-emerald-700" />
                    <span>Sudah Dijawab</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-800" />
                    <span>Belum Dijawab</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFinishCbt}
                  disabled={cbtSubmitting}
                  className="w-full mt-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-105 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{cbtSubmitting ? 'Mengumpulkan...' : 'Kumpulkan Lembar Ujian'}</span>
                </button>
              </div>

              {/* Active Question Content View */}
              {cbtSession.soal[currentQuestionIdx] && (
                <div className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col justify-between space-y-6">
                  <div className="space-y-4 max-w-3xl">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                      <span>Soal Nomor {currentQuestionIdx + 1} dari {cbtSession.soal.length}</span>
                      <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-extrabold">
                        Bobot: {cbtSession.soal[currentQuestionIdx].poin} Poin
                      </span>
                    </div>

                    <div className="bg-[#1E293B] p-6 rounded-3xl border border-slate-800 text-base leading-relaxed font-semibold text-slate-100 shadow-lg">
                      {cbtSession.soal[currentQuestionIdx].pertanyaan}
                    </div>

                    {/* Question Type: PG */}
                    {cbtSession.soal[currentQuestionIdx].tipe_soal === 'pg' && (
                      <div className="space-y-3 pt-2">
                        {cbtSession.soal[currentQuestionIdx].opsi.map((opt) => {
                          const activeKey = userAnswers[cbtSession.soal[currentQuestionIdx].id]?.jawaban_dipilih
                          const isSelected = activeKey === opt.key
                          return (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() => handleSelectAnswer(cbtSession.soal[currentQuestionIdx].id, opt.key, 'pg')}
                              className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left text-sm font-semibold transition-all ${
                                isSelected
                                  ? 'bg-emerald-950/70 border-emerald-400 text-white ring-2 ring-emerald-400 shadow-md'
                                  : 'bg-[#1E293B] border-slate-800 text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <span
                                className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                                  isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {opt.key}
                              </span>
                              <span>{opt.text}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Question Type: Benar / Salah */}
                    {cbtSession.soal[currentQuestionIdx].tipe_soal === 'benar_salah' && (
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        {['Benar', 'Salah'].map((val) => {
                          const isSelected = userAnswers[cbtSession.soal[currentQuestionIdx].id]?.jawaban_dipilih === val
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleSelectAnswer(cbtSession.soal[currentQuestionIdx].id, val, 'benar_salah')}
                              className={`p-6 rounded-3xl border font-bold text-base flex items-center justify-center gap-3 transition-all ${
                                isSelected
                                  ? 'bg-emerald-950/70 border-emerald-400 text-white ring-2 ring-emerald-400 shadow-md'
                                  : 'bg-[#1E293B] border-slate-800 text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              {val === 'Benar' ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              ) : (
                                <XCircle className="w-5 h-5 text-rose-400" />
                              )}
                              <span>{val}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Question Type: Esai */}
                    {cbtSession.soal[currentQuestionIdx].tipe_soal === 'esai' && (
                      <div className="pt-2">
                        <textarea
                          rows={6}
                          placeholder="Ketikkan jawaban uraian/esai lengkap Anda pada kolom ini..."
                          value={userAnswers[cbtSession.soal[currentQuestionIdx].id]?.jawaban_esai || ''}
                          onChange={(e) => handleSelectAnswer(cbtSession.soal[currentQuestionIdx].id, e.target.value, 'esai')}
                          className="w-full p-4 rounded-2xl border border-slate-800 bg-[#1E293B] text-white text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 outline-none leading-relaxed font-medium"
                        />
                      </div>
                    )}
                  </div>

                  {/* Previous / Next Controls */}
                  <div className="flex items-center justify-between border-t border-slate-800 pt-5 max-w-3xl">
                    <button
                      type="button"
                      disabled={currentQuestionIdx === 0}
                      onClick={() => setCurrentQuestionIdx((prev) => prev - 1)}
                      className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold flex items-center gap-2 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Soal Sebelumnya</span>
                    </button>
                    <button
                      type="button"
                      disabled={currentQuestionIdx >= cbtSession.soal.length - 1}
                      onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                      className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-105 disabled:opacity-40 text-xs font-extrabold flex items-center gap-2 shadow-md transition-all"
                    >
                      <span>Soal Selanjutnya</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* EXAM RESULT SUMMARY CARD */
            <div className="flex-1 p-8 overflow-y-auto flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#1E293B] rounded-3xl p-8 max-w-lg w-full text-center border border-slate-800 space-y-6 shadow-2xl"
              >
                <div className="w-20 h-20 rounded-3xl bg-emerald-950/80 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
                  <Award className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Ujian Telah Selesai!</h3>
                  <p className="text-xs text-slate-400 mt-1 font-medium">Hasil Auto Scoring CBT secara Real-time</p>
                </div>

                <div className="bg-[#0F172A] p-6 rounded-3xl border border-slate-800 space-y-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
                    Skor Final CBT
                  </span>
                  <div className="text-6xl font-black text-emerald-400 tracking-tight">
                    {examResultSummary.nilai_final}
                  </div>
                  <span
                    className={`inline-block px-4 py-1.5 rounded-full text-xs font-black ${
                      examResultSummary.nilai_final >= (cbtSession.ujian.nilai_kkm || 75)
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {examResultSummary.nilai_final >= (cbtSession.ujian.nilai_kkm || 75) ? 'LULUS KKM' : 'BELUM LULUS KKM'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="bg-[#0F172A] p-3.5 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block font-semibold text-[11px]">Jawaban Benar</span>
                    <span className="text-lg font-black text-emerald-400 mt-0.5">{examResultSummary.jumlah_benar}</span>
                  </div>
                  <div className="bg-[#0F172A] p-3.5 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block font-semibold text-[11px]">Jawaban Salah</span>
                    <span className="text-lg font-black text-rose-400 mt-0.5">{examResultSummary.jumlah_salah}</span>
                  </div>
                  <div className="bg-[#0F172A] p-3.5 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block font-semibold text-[11px]">Tidak Dijawab</span>
                    <span className="text-lg font-black text-amber-400 mt-0.5">{examResultSummary.jumlah_kosong}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCbtEngineModal(false)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-105 text-white font-extrabold text-sm shadow-lg transition-all"
                >
                  Tutup Simulasi CBT
                </button>
              </motion.div>
            </div>
          )}

          {/* CBT Submit Confirmation Modal */}
          {showFinishConfirmModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-700 bg-[#1E293B] shadow-2xl text-white"
              >
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
                <div className="p-6">
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/30">
                      <Send className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="inline-block rounded-md bg-emerald-950/80 border border-emerald-700 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
                        Konfirmasi Selesai
                      </span>
                      <h3 className="text-base font-bold text-white mt-0.5">Kumpulkan Lembar Ujian?</h3>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    Apakah Anda yakin ingin menyelesaikan dan mengumpulkan ujian ini sekarang? Setelah dikumpulkan, lembar jawaban akan langsung dinilai secara otomatis.
                  </p>
                  <div className="rounded-xl border border-emerald-800/60 bg-emerald-950/30 p-3 mb-6">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-emerald-300">
                        Pastikan seluruh soal telah Anda jawab dengan cermat sebelum mengumpulkan.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowFinishConfirmModal(false)}
                      disabled={cbtSubmitting}
                      className="h-10 px-4 rounded-xl border border-slate-700 bg-slate-800 text-xs font-bold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
                    >
                      Periksa Kembali
                    </button>
                    <button
                      type="button"
                      onClick={confirmSubmitCbt}
                      disabled={cbtSubmitting}
                      className="h-10 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30 transition cursor-pointer disabled:opacity-50"
                    >
                      {cbtSubmitting ? 'Mengumpulkan...' : 'Ya, Kumpulkan Ujian'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      )}

      {/* ── RESULTS & SCORE ANALYTICS MODAL ── */}
      {showResultsModal && resultsData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-[#1B2433] rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-emerald-500/20 dark:border-emerald-500/30 flex flex-col"
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#1B2433] shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-600/30">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    Hasil & Analisis Nilai CBT
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {resultsData.ujian?.judul_ujian} — {resultsData.ujian?.kelas}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowResultsModal(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Ringkasan Analitik Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50">
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-300 block font-bold uppercase">Total Peserta</span>
                  <span className="text-xl font-black text-emerald-900 dark:text-emerald-200 mt-1 block">
                    {resultsData.ringkasan?.total_peserta} Siswa
                  </span>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/40 p-3.5 rounded-2xl border border-blue-200/80 dark:border-blue-900/50">
                  <span className="text-[10px] text-blue-800 dark:text-blue-300 block font-bold uppercase">Kelulusan KKM</span>
                  <span className="text-xl font-black text-blue-900 dark:text-blue-200 mt-1 block">
                    {resultsData.ringkasan?.total_peserta > 0 && resultsData.ringkasan?.persentase_kelulusan != null ? `${resultsData.ringkasan?.persentase_kelulusan}%` : '—'}
                  </span>
                  {resultsData.ringkasan?.total_peserta > 0 && (
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold block mt-0.5">
                      {resultsData.ringkasan?.lulus_kkm ?? resultsData.ringkasan?.total_lulus ?? Math.round((Number(resultsData.ringkasan?.persentase_kelulusan || 0) / 100) * Number(resultsData.ringkasan?.total_peserta || 0))} dari {resultsData.ringkasan?.total_peserta} siswa
                    </span>
                  )}
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/40 p-3.5 rounded-2xl border border-purple-200/80 dark:border-purple-900/50">
                  <span className="text-[10px] text-purple-800 dark:text-purple-300 block font-bold uppercase">Rata-rata Nilai</span>
                  <span className="text-xl font-black text-purple-900 dark:text-purple-200 mt-1 block">
                    {resultsData.ringkasan?.rata_nilai}
                  </span>
                </div>
                <div className="bg-teal-50 dark:bg-teal-950/40 p-3.5 rounded-2xl border border-teal-200/80 dark:border-teal-900/50">
                  <span className="text-[10px] text-teal-800 dark:text-teal-300 block font-bold uppercase">Nilai Tertinggi</span>
                  <span className="text-xl font-black text-teal-900 dark:text-teal-200 mt-1 block">
                    {resultsData.ringkasan?.nilai_tertinggi}
                  </span>
                </div>
                <div className="bg-rose-50 dark:bg-rose-950/40 p-3.5 rounded-2xl border border-rose-200/80 dark:border-rose-900/50 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-rose-800 dark:text-rose-300 block font-bold uppercase">Nilai Terendah</span>
                  <span className="text-xl font-black text-rose-900 dark:text-rose-200 mt-1 block">
                    {resultsData.ringkasan?.nilai_terendah}
                  </span>
                </div>
              </div>

              {/* Student Score Table */}
              <div className="border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl overflow-hidden">
                <TableRoot className="w-full text-left text-xs">
                  <TableHeader className="bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-100 font-bold border-b border-emerald-200/80 dark:border-emerald-800/60">
                    <TableRow>
                      <TableHead className="p-3.5">Nama Siswa</TableHead>
                      <TableHead className="p-3.5 text-center">Durasi (m)</TableHead>
                      <TableHead className="p-3.5 text-center">Benar</TableHead>
                      <TableHead className="p-3.5 text-center">Salah</TableHead>
                      <TableHead className="p-3.5 text-center">Kosong</TableHead>
                      <TableHead className="p-3.5 text-center font-black">Nilai Final</TableHead>
                      <TableHead className="p-3.5 text-center">Status KKM</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-emerald-100/70 dark:divide-emerald-900/40">
                    {(resultsData.peserta || []).map((p) => (
                      <TableRow key={p.sesi_id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20">
                        <TableCell className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{p.nama_siswa}</TableCell>
                        <TableCell className="p-3.5 text-center font-semibold text-slate-600 dark:text-slate-400">{p.durasi_menit}m</TableCell>
                        <TableCell className="p-3.5 text-center text-emerald-600 dark:text-emerald-400 font-black">{p.jumlah_benar}</TableCell>
                        <TableCell className="p-3.5 text-center text-rose-600 dark:text-rose-400 font-black">{p.jumlah_salah}</TableCell>
                        <TableCell className="p-3.5 text-center text-amber-600 dark:text-amber-400 font-bold">{p.jumlah_kosong}</TableCell>
                        <TableCell className="p-3.5 text-center text-sm font-black text-emerald-700 dark:text-emerald-300">{p.nilai_final}</TableCell>
                        <TableCell className="p-3.5 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black ${
                              p.is_lulus
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/80'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300/80'
                            }`}
                          >
                            {p.is_lulus ? 'LULUS' : 'TIDAK LULUS'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableRoot>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-900/40 shrink-0">
              <button
                type="button"
                onClick={() => setShowResultsModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Tutup Rekap Nilai
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── PRINT & PDF EXPORT MODAL ── */}
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Opsi Cetak Data Ujian Online (CBT)"
        subtitle="Pilih metode pencetakan langsung atau unduh rekap berkas PDF jadwal CBT"
        onPrintClean={() => {
          printCleanTable({
            title: 'Laporan Jadwal Ujian Online (CBT)',
            data: dataList,
            columns: [
              { header: 'Nama Ujian', accessor: (row) => row.judul_ujian || row.nama_ujian || '-' },
              { header: 'Mata Pelajaran', accessor: (row) => row.kisi_kisi?.mata_pelajaran || row.subject || '-' },
              { header: 'Kelas', accessor: (row) => row.kelas?.nama_kelas || 'Semua' },
              { header: 'Durasi', accessor: (row) => `${row.durasi_menit || 0} Menit` },
              { header: 'KKM', accessor: (row) => row.nilai_kkm || 75 },
              { header: 'Status', accessor: (row) => row.status || 'Draft' },
            ],
          })
          setIsPrintModalOpen(false)
        }}
        onDownloadPdf={() => {
          downloadPdfTable({
            title: 'Laporan Jadwal Ujian Online (CBT)',
            data: dataList,
            columns: [
              { header: 'Nama Ujian', accessor: (row) => row.judul_ujian || row.nama_ujian || '-' },
              { header: 'Mata Pelajaran', accessor: (row) => row.kisi_kisi?.mata_pelajaran || row.subject || '-' },
              { header: 'Kelas', accessor: (row) => row.kelas?.nama_kelas || 'Semua' },
              { header: 'Durasi', accessor: (row) => `${row.durasi_menit || 0} Menit` },
              { header: 'KKM', accessor: (row) => row.nilai_kkm || 75 },
              { header: 'Status', accessor: (row) => row.status || 'Draft' },
            ],
            filename: `laporan_jadwal_ujian_cbt_${new Date().toISOString().slice(0, 10)}.pdf`,
          })
          setIsPrintModalOpen(false)
        }}
      />

      {/* ── BATCH CSV IMPORT MODAL ── */}
      <HarmonizedBatchImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onImportSuccess={() => {
          fetchData(1)
          fetchStats()
        }}
        notify={notify}
      />

      {/* ── HARMONIZED SAVE CONFIRMATION MODAL ── */}
      <HarmonizedSaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onConfirm={handleConfirmSave}
        isEdit={Boolean(editingItem)}
        title={formData.judul_ujian}
        isSubmitting={isSubmittingForm}
      />

      {/* ── HARMONIZED DELETE MODAL ── */}
      <HarmonizedDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        item={deleteTarget}
        isSubmitting={isDeleting}
      />

      {/* ── HARMONIZED BATCH EXPORT MODAL ── */}
      <HarmonizedBatchExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleProcessExport}
        isExporting={isExporting}
        totalCount={pagination.total || dataList.length}
        moduleTitle="CBT Ujian"
      />
    </div>
  )

  return (
    <PageContainer maxW="7xl">
      {!(embedded || hideBreadcrumb) && (
        <div className="mb-4">
          <AppBreadcrumb
            items={[
              { label: 'LMS & Akademik', href: '/dashboard' },
              { label: 'Ujian Online (CBT)' },
            ]}
          />
        </div>
      )}
      {pageContent}
    </PageContainer>
  )
}
