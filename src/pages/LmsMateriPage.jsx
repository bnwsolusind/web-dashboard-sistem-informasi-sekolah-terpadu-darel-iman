import { useToast } from '../components/app/ToastProvider'
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  FileText,
  Video,
  Link as LinkIcon,
  Layers,
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  Clock,
  ShieldCheck,
  Paperclip,
  RotateCcw,
  Printer,
  Download,
  Upload,
  ArrowLeft,
  ArrowRight,
  Save,
  FileCode,
  Calendar,
  ArrowUpDown,
  Send,
  MessageSquare,
  Check,
  School,
  Lock,
} from 'lucide-react'
import { lmsMateriService } from '../services/lmsMateriService'
import useDebounce from '../hooks/useDebounce'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { useAuthStore } from '../stores/authStore'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import { PrintOptionModal } from '../components/master-data'
import {
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui/table'
import ActionDropdown from '../components/app/ActionDropdown'
import { VideoEmbedPlayer, PdfDocumentViewer, parseVideoEmbed } from '../components/common/MateriMediaEmbed'
import { downloadSpreadsheetTemplate } from '../utils/spreadsheetParser'

// ── 1. DEFINISI TONE WARNA KARTU KPI MODERN ──
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
  rose: {
    card: 'border-rose-300/70 bg-gradient-to-br from-rose-50 via-pink-50/60 to-white hover:border-rose-400 dark:border-rose-700/50 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-slate-900',
    glow: 'bg-rose-400/20 group-hover:bg-rose-400/30',
    iconBox: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-rose-500/30',
    tag: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
    title: 'text-rose-700 dark:text-rose-400',
    val: 'text-rose-700 dark:text-rose-300',
    sub: 'text-rose-600/80 dark:text-rose-400/80',
    cta: 'text-rose-600/60 dark:text-rose-500/60',
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
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
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
                  <Search className="size-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/60 pl-7 pr-2 py-1 text-[11px] font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    autoFocus
                  />
                </div>
              </div>
            )}
            <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-3 text-center text-[11px] text-slate-400">Tidak ada opsi</div>
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
                      className={`w-full flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors text-left cursor-pointer ${
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

// ── HARMONIZED BATCH EXPORT MODAL ──
function HarmonizedBatchExportModal({
  isOpen,
  onClose,
  onExport,
  isExporting,
  totalCount,
  moduleTitle = 'Materi Pembelajaran',
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
                Data yang diekspor akan mencakup seluruh entitas terfilter ({totalCount} butir {moduleTitle.toLowerCase()}).
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

// ── HARMONIZED SUPERVISI & CATATAN KOREKSI MODAL ──
function HarmonizedSupervisiModal({
  isOpen,
  onClose,
  item,
  onSubmit,
  isPending,
}) {
  const [statusSupervisi, setStatusSupervisi] = useState('disetujui')
  const [catatanKoreksi, setCatatanKoreksi] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Sync state when item changes
  React.useEffect(() => {
    if (item) {
      setStatusSupervisi(item.status_supervisi === 'perlu_revisi' ? 'perlu_revisi' : 'disetujui')
      setCatatanKoreksi(item.catatan_koreksi || '')
      setErrorMsg('')
    }
  }, [item])

  // Fetch past logs
  const { data: logsRes, isLoading: isLoadingLogs } = useQuery({
    queryKey: ['lmsMateriSupervisiLogs', item?.id],
    queryFn: () => lmsMateriService.getSupervisiLogs(item.id),
    enabled: Boolean(isOpen && item?.id),
  })

  const logs = useMemo(() => logsRes?.data || [], [logsRes])

  if (!isOpen || !item) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (statusSupervisi === 'perlu_revisi' && !catatanKoreksi.trim()) {
      setErrorMsg('Catatan arahan koreksi wajib diisi jika status perlu revisi.')
      return
    }
    setErrorMsg('')
    onSubmit({
      id: item.id,
      payload: {
        status_supervisi: statusSupervisi,
        catatan_koreksi: catatanKoreksi.trim(),
      },
    })
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose()
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="w-full max-w-2xl"
      >
        <div className="flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border border-emerald-300/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-emerald-800/60 dark:bg-[#182232]">
          <div
            className={`h-1.5 w-full shrink-0 bg-gradient-to-r ${
              statusSupervisi === 'disetujui'
                ? 'from-emerald-500 via-teal-400 to-emerald-600'
                : 'from-rose-500 via-rose-600 to-amber-500'
            }`}
          />

          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950 shrink-0">
            <div className="flex items-center gap-3">
              <div
                className={`rounded-2xl text-white p-2.5 shadow-md shrink-0 border ${
                  statusSupervisi === 'disetujui'
                    ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 shadow-emerald-500/25 border-emerald-300/40'
                    : 'bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 shadow-rose-500/25 border-rose-300/40'
                }`}
              >
                <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Supervisi Materi Pembelajaran</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                      statusSupervisi === 'disetujui'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-400'
                    }`}
                  >
                    <Sparkles className="size-3" /> Kepsek &amp; Divisi Pendidikan
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tinjau kelayakan ajar materi dan berikan arahan atau catatan revisi untuk guru pengampu.
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={onClose}
              className="size-9 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Modal Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Target Materi Info Box */}
            <div className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Target Materi Yang Ditelaah
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                  Tipe: {item.tipe} • #{item.urutan}
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                {item.judul}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Modul Ajar: <strong>{item.modul_ajar?.judul_modul || '-'}</strong>
                {item.subject?.nama_mapel ? ` • ${item.subject.nama_mapel}` : ''}
              </p>
            </div>

            {/* Decision Status Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Keputusan Hasil Telaah:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStatusSupervisi('disetujui')
                    setErrorMsg('')
                  }}
                  className={`rounded-2xl border-2 p-3.5 text-left transition-all cursor-pointer ${
                    statusSupervisi === 'disetujui'
                      ? 'border-emerald-500 bg-emerald-50/70 shadow-sm dark:border-emerald-600 dark:bg-emerald-950/40'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`size-6 rounded-lg flex items-center justify-center text-white ${
                        statusSupervisi === 'disetujui' ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <Check className="size-3.5" strokeWidth={3} />
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      Disetujui &amp; Layak Ajar
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug pl-8">
                    Materi memenuhi standar kurikulum dan otomatis berstatus publish untuk diakses siswa.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusSupervisi('perlu_revisi')}
                  className={`rounded-2xl border-2 p-3.5 text-left transition-all cursor-pointer ${
                    statusSupervisi === 'perlu_revisi'
                      ? 'border-rose-500 bg-rose-50/70 shadow-sm dark:border-rose-600 dark:bg-rose-950/40'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`size-6 rounded-lg flex items-center justify-center text-white ${
                        statusSupervisi === 'perlu_revisi' ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <AlertTriangle className="size-3.5" strokeWidth={2.5} />
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      Perlu Koreksi / Revisi
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug pl-8">
                    Materi dikembalikan ke guru pengampu dengan catatan perbaikan sebelum dipublikasikan.
                  </p>
                </button>
              </div>
            </div>

            {/* Textarea Catatan Koreksi */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>
                  Catatan &amp; Arahan Supervisi{' '}
                  {statusSupervisi === 'perlu_revisi' && <span className="text-rose-600">*</span>}
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {statusSupervisi === 'perlu_revisi' ? 'Wajib diisi' : 'Opsional'}
                </span>
              </label>
              <textarea
                rows={4}
                value={catatanKoreksi}
                onChange={(e) => {
                  setCatatanKoreksi(e.target.value)
                  if (errorMsg) setErrorMsg('')
                }}
                placeholder={
                  statusSupervisi === 'perlu_revisi'
                    ? 'Tuliskan poin-poin koreksi secara jelas (misal: perjelas instruksi latihan, sesuaikan durasi video, atau tambahkan referensi buku)...'
                    : 'Tuliskan catatan apresiasi atau catatan pengingat tambahan untuk guru (opsional)...'
                }
                className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 p-3.5 text-xs text-slate-800 transition focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
              />
              {errorMsg && (
                <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                  <AlertTriangle className="size-3" /> {errorMsg}
                </p>
              )}
            </div>

            {/* Riwayat Telaah / Supervisi Sebelumnya */}
            <div className="pt-2">
              <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2">
                <History className="size-3.5" /> Riwayat Supervisi Materi Ini ({logs.length})
              </h5>
              {isLoadingLogs ? (
                <div className="p-3 text-center text-xs text-slate-400">Memuat riwayat supervisi...</div>
              ) : logs.length === 0 ? (
                <p className="text-xs text-slate-400 italic p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  Belum ada riwayat supervisi sebelumnya untuk materi ini.
                </p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl border border-slate-200/80 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {log.supervisor?.name || 'Supervisor'} ({log.supervisor_role || 'Penelaah'})
                        </span>
                        <span className="text-slate-400 font-mono">
                          {new Date(log.created_at).toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.status_supervisi === 'disetujui'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                          }`}
                        >
                          {log.status_supervisi === 'disetujui' ? 'Disetujui' : 'Perlu Revisi'}
                        </span>
                      </div>
                      {log.catatan_koreksi && (
                        <p className="text-slate-600 dark:text-slate-300 italic text-[11px] mt-1 pl-2 border-l-2 border-slate-300 dark:border-slate-700">
                          "{log.catatan_koreksi}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isPending}
                onClick={onClose}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 transition cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className={`inline-flex items-center gap-2 rounded-2xl text-white px-5 py-2.5 text-xs font-extrabold shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 cursor-pointer border ${
                  statusSupervisi === 'disetujui'
                    ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 shadow-emerald-500/25 border-emerald-300/40'
                    : 'bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 shadow-rose-500/25 border-rose-300/40'
                }`}
              >
                {isPending ? <RefreshCw className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                <span>
                  {isPending
                    ? 'Menyimpan...'
                    : statusSupervisi === 'disetujui'
                    ? 'Setujui & Publikasikan'
                    : 'Kirim Catatan Revisi'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

// ── HARMONIZED AJUKAN TELAAH MODAL ──
function HarmonizedAjukanTelaahModal({
  isOpen,
  onClose,
  item,
  onSubmit,
  isPending,
}) {
  const [catatan, setCatatan] = useState('')

  if (!isOpen || !item) return null

  const handleAjukan = (e) => {
    e.preventDefault()
    onSubmit({
      id: item.id,
      catatan: catatan.trim(),
    })
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose()
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="w-full max-w-lg"
      >
        <div className="flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border border-sky-300/80 bg-white shadow-2xl shadow-sky-950/20 dark:border-sky-800/60 dark:bg-[#182232]">
          <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 shrink-0" />

          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950 shrink-0">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 text-white p-2.5 shadow-md shadow-sky-500/25 border border-sky-300/40 shrink-0">
                <Send className="h-5 w-5 text-white" strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Ajukan Telaah Materi</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-400">
                    <Sparkles className="size-3" /> Supervisi Guru
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Kirim materi ini kepada Kepala Sekolah / Divisi Pendidikan untuk ditinjau.
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={onClose}
              className="size-9 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={handleAjukan} className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4 space-y-1.5 dark:border-sky-900/50 dark:bg-sky-950/20">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                Materi Yang Diajukan
              </span>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                {item.judul}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Modul Ajar: {item.modul_ajar?.judul_modul || '-'} • Tipe: {item.tipe}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Pesan / Catatan Tambahan Guru (Opsional)
              </label>
              <textarea
                rows={3}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Tuliskan pesan khusus untuk Kepala Sekolah atau Penelaah (misal: materi telah disesuaikan dengan masukan rapat kurikulum)..."
                className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 p-3.5 text-xs text-slate-800 transition focus:border-sky-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-slate-900/50 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-0.5">
                <Sparkles className="size-3.5 text-sky-600 dark:text-sky-400" />
                Alur Supervisi
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Setelah diajukan, status materi akan berubah menjadi <strong>Menunggu Telaah</strong>. Kepala Sekolah atau Divisi Pendidikan akan memberikan catatan koreksi atau menyetujui materi untuk dipublikasikan.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isPending}
                onClick={onClose}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 transition cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 text-white px-5 py-2.5 text-xs font-extrabold shadow-md shadow-sky-500/25 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 cursor-pointer border border-sky-300/40"
              >
                {isPending ? <RefreshCw className="size-4 animate-spin" /> : <Send className="size-4" />}
                <span>{isPending ? 'Mengajukan...' : 'Ajukan Sekarang'}</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

// ── 3. KOMPONEN UTAMA HALAMAN MATERI PEMBELAJARAN ──
export default function LmsMateriPage({ embedded = false, hideBreadcrumb = false, hidePageHeader = false, tabNav = null }) {
  const queryClient = useQueryClient()
  const { items: toastList, push: pushToast, dismiss: dismissToast } = useNotifications()

  // User Auth & Teacher Scoping
  const user = useAuthStore((state) => state.user)
  const userRoles = useMemo(() => {
    if (!user?.roles) return []
    return user.roles.map((r) => (typeof r === 'string' ? r : r.name || r.role_name || ''))
  }, [user])

  const isGuru = useMemo(() => {
    const rList = userRoles.map((r) => r.toLowerCase())
    const mainRole = String(user?.role || '').toLowerCase()
    return (
      rList.some((r) => r.includes('guru') || r.includes('wali_kelas') || r.includes('wali kelas')) ||
      mainRole.includes('guru')
    )
  }, [userRoles, user?.role])

  const isSupervisor = useMemo(() => {
    const rList = userRoles.map((r) => r.toLowerCase())
    const mainRole = String(user?.role || '').toLowerCase()
    const checkRole = (name) => rList.some((r) => r.includes(name)) || mainRole.includes(name)
    return (
      checkRole('kepala sekolah') ||
      checkRole('kepala_sekolah') ||
      checkRole('principal') ||
      checkRole('divisi pendidikan') ||
      checkRole('divisi_pendidikan') ||
      checkRole('kabid') ||
      checkRole('kurikulum') ||
      checkRole('waka') ||
      checkRole('yayasan') ||
      checkRole('admin') ||
      checkRole('super admin') ||
      checkRole('tata usaha') ||
      checkRole('operator')
    )
  }, [userRoles, user?.role])

  const isTeacherOnly = useMemo(() => {
    return isGuru && !isSupervisor
  }, [isGuru, isSupervisor])

  // Multi-unit & Role Scoping
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

  // Filters & Pagination State
  const [selectedUnit, setSelectedUnit] = useState(canSelectUnit ? '' : (userUnitId ? String(userUnitId) : ''))
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 350)
  const [selectedModul, setSelectedModul] = useState('')
  const [selectedMapel, setSelectedMapel] = useState('')
  const [modulSearch, setModulSearch] = useState('')
  const debouncedModulSearch = useDebounce(modulSearch, 350)
  const [selectedTipe, setSelectedTipe] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedStatusSupervisi, setSelectedStatusSupervisi] = useState('')
  const [denganSampah, setDenganSampah] = useState(false)
  const [sortDateOrder, setSortDateOrder] = useState('desc') // 'desc' | 'asc'
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // Modals State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewItem, setPreviewItem] = useState(null)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

  // Supervisi & Telaah Modal State
  const [supervisiModalOpen, setSupervisiModalOpen] = useState(false)
  const [supervisiTarget, setSupervisiTarget] = useState(null)
  const [ajukanModalOpen, setAjukanModalOpen] = useState(false)
  const [ajukanTarget, setAjukanTarget] = useState(null)
  const [ajukanCatatan, setAjukanCatatan] = useState('')

  // KPI Drill-down Modal State
  const [kpiModalOpen, setKpiModalOpen] = useState(false)
  const [kpiModalCategory, setKpiModalCategory] = useState({
    title: '',
    type: '',
    items: [],
  })

  // Import State
  const [importFile, setImportFile] = useState(null)
  const [importDragging, setImportDragging] = useState(false)
  const [importPreviewData, setImportPreviewData] = useState([])
  const [importLoading, setImportLoading] = useState(false)

  // Form State
  const initialFormState = () => ({
    modul_ajar_id: '',
    judul: '',
    tipe: 'teks',
    ringkasan: '',
    isi: '',
    catatan: '',
    bobot: 45,
    file_url: '',
    video: '',
    link: '',
    urutan: 1,
    status: 'aktif',
  })

  const [formData, setFormData] = useState(initialFormState)

  // 1. React Query: Options (Modul Ajar, Tipe, Units)
  const { data: optionsRes, isLoading: isLoadingOptions } = useQuery({
    queryKey: ['lmsMateriOptions', debouncedModulSearch, isGuru, selectedUnit],
    queryFn: () =>
      lmsMateriService.getOptions({
        search: debouncedModulSearch,
        ...(selectedUnit ? { unit_pendidikan_id: selectedUnit } : {}),
        ...(isGuru ? {} : { limit: 100 }),
      }),
    staleTime: 1000 * 60 * 5,
  })

  const unitOptions = useMemo(() => {
    return optionsRes?.data?.units || []
  }, [optionsRes])

  const optionsModul = useMemo(() => {
    const list = optionsRes?.data?.modul_ajar || []
    if (editingItem?.modul_ajar && !list.some((m) => m.id === editingItem.modul_ajar.id)) {
      return [editingItem.modul_ajar, ...list]
    }
    return list
  }, [optionsRes, editingItem])

  const tipeOptions = useMemo(() => {
    return (
      optionsRes?.data?.tipe_options || [
        { id: 'teks', nama: 'Teks / Ringkasan' },
        { id: 'dokumen', nama: 'Dokumen / PDF / Office' },
        { id: 'video', nama: 'Video Pembelajaran' },
        { id: 'link', nama: 'Tautan / Link Eksternal' },
        { id: 'presentasi', nama: 'Slide Presentasi' },
      ]
    )
  }, [optionsRes])

  const subjects = useMemo(() => {
    const rawSubjects = optionsRes?.data?.subjects || []
    const uniqueMap = new Map()

    for (const s of rawSubjects) {
      const cleanName = (s.nama_mapel || s.name || s.kode_mapel || '').trim()
      if (!cleanName) continue
      const lowerKey = cleanName.toLowerCase()
      if (!uniqueMap.has(lowerKey)) {
        uniqueMap.set(lowerKey, {
          id: cleanName,
          nama_mapel: cleanName,
        })
      }
    }

    return Array.from(uniqueMap.values()).sort((a, b) =>
      a.nama_mapel.localeCompare(b.nama_mapel, 'id')
    )
  }, [optionsRes])

  // 2. React Query: Daftar Materi
  const {
    data: materiResponse,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: [
      'lmsMateriList',
      page,
      perPage,
      debouncedSearch,
      selectedUnit,
      selectedModul,
      selectedMapel,
      selectedTipe,
      selectedStatus,
      selectedStatusSupervisi,
      denganSampah,
      sortDateOrder,
    ],
    queryFn: () =>
      lmsMateriService.getDaftar({
        page,
        search: debouncedSearch,
        unit_pendidikan_id: canSelectUnit ? (selectedUnit || undefined) : (userUnitId || undefined),
        modul_ajar_id: selectedModul,
        mata_pelajaran_id: selectedMapel,
        tipe: selectedTipe,
        status: selectedStatus,
        status_supervisi: selectedStatusSupervisi || undefined,
        dengan_sampah: denganSampah ? 1 : 0,
        per_page: perPage,
        order_by: 'created_at',
        order_dir: sortDateOrder,
      }),
    placeholderData: keepPreviousData,
  })

  const dataMateri = useMemo(() => materiResponse?.data || [], [materiResponse])
  const pagination = useMemo(() => {
    return (
      materiResponse?.meta || {
        current_page: page,
        last_page: 1,
        total: 0,
        per_page: perPage,
      }
    )
  }, [materiResponse, page, perPage])
  const stats = useMemo(() => materiResponse?.statistik || {}, [materiResponse])

  // Computed Stats for KPI cards
  const computedStats = useMemo(() => {
    const total_materi = stats.total_materi ?? pagination.total ?? dataMateri.length
    const materi_dokumen = stats.materi_dokumen ?? dataMateri.filter((m) => m.tipe === 'dokumen' || m.tipe === 'pdf' || !!m.file).length
    const materi_video = stats.materi_video ?? dataMateri.filter((m) => m.tipe === 'video' || !!m.video).length
    const materi_aktif = stats.materi_aktif ?? dataMateri.filter((m) => (m.status === 'aktif' || m.status === 'published' || m.status === 'publish') && !m.deleted_at).length
    const uniqueModulIds = new Set(dataMateri.map((m) => m.modul_ajar_id || m.modul_ajar?.id).filter(Boolean))
    const total_modul_ajar = stats.total_modul_ajar ?? optionsModul.length ?? uniqueModulIds.size

    return {
      total_materi,
      materi_dokumen,
      materi_video,
      materi_aktif,
      total_modul_ajar,
    }
  }, [dataMateri, stats, pagination.total, optionsModul.length])

  // 3. Mutations
  const createMutation = useMutation({
    mutationFn: (payload) => lmsMateriService.simpan(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lmsMateriList'] })
      setIsFormModalOpen(false)
      setShowSaveConfirmModal(false)
      pushToast('Berhasil Disimpan', 'Materi Pembelajaran baru berhasil ditambahkan.', 'success')
    },
    onError: (err) => {
      setShowSaveConfirmModal(false)
      const errRes = err.response?.data
      const msg = errRes?.message || (errRes?.errors ? Object.values(errRes.errors).flat().join(' ') : 'Gagal menyimpan materi.')
      pushToast('Gagal Menyimpan', msg, 'error')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => lmsMateriService.ubah(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lmsMateriList'] })
      setIsFormModalOpen(false)
      setShowSaveConfirmModal(false)
      pushToast('Berhasil Diperbarui', 'Materi Pembelajaran berhasil diperbarui.', 'success')
    },
    onError: (err) => {
      setShowSaveConfirmModal(false)
      const errRes = err.response?.data
      const msg = errRes?.message || (errRes?.errors ? Object.values(errRes.errors).flat().join(' ') : 'Gagal memperbarui materi.')
      pushToast('Gagal Memperbarui', msg, 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => lmsMateriService.hapus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lmsMateriList'] })
      setDeleteTarget(null)
      pushToast('Berhasil Dihapus', 'Materi berhasil dipindahkan ke tempat sampah.', 'success')
    },
    onError: () => {
      setDeleteTarget(null)
      pushToast('Gagal Menghapus', 'Gagal memindahkan materi ke tempat sampah.', 'error')
    },
  })

  const restoreMutation = useMutation({
    mutationFn: (id) => lmsMateriService.pulihkan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lmsMateriList'] })
      pushToast('Berhasil Dipulihkan', 'Materi Pembelajaran berhasil dipulihkan.', 'success')
    },
    onError: () => {
      pushToast('Gagal Memulihkan', 'Gagal memulihkan materi pembelajaran.', 'error')
    },
  })

  const ajukanTelaahMutation = useMutation({
    mutationFn: ({ id, catatan }) => lmsMateriService.ajukanTelaah(id, catatan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lmsMateriList'] })
      setAjukanModalOpen(false)
      setAjukanTarget(null)
      setAjukanCatatan('')
      if (previewModalOpen && previewItem) {
        setPreviewItem((prev) => (prev ? { ...prev, status_supervisi: 'diajukan' } : null))
      }
      pushToast('Berhasil Diajukan', 'Materi telah diajukan ke Kepala Sekolah & Divisi Pendidikan untuk ditelaah.', 'success')
    },
    onError: (err) => {
      const errRes = err.response?.data
      const msg = errRes?.message || 'Gagal mengajukan materi untuk ditelaah.'
      pushToast('Gagal Mengajukan', msg, 'error')
    },
  })

  const supervisiMutation = useMutation({
    mutationFn: ({ id, payload }) => lmsMateriService.supervisi(id, payload),
    onSuccess: (res, vars) => {
      queryClient.invalidateQueries({ queryKey: ['lmsMateriList'] })
      setSupervisiModalOpen(false)
      setSupervisiTarget(null)
      if (previewModalOpen && previewItem) {
        setPreviewItem((prev) =>
          prev
            ? {
                ...prev,
                status_supervisi: vars.payload.status_supervisi,
                catatan_koreksi: vars.payload.catatan_koreksi,
                supervisor_role: user?.role || 'Supervisor',
                tanggal_supervisi: new Date().toISOString(),
              }
            : null
        )
      }
      const isApproved = vars.payload.status_supervisi === 'disetujui'
      pushToast(
        isApproved ? 'Materi Disetujui' : 'Catatan Koreksi Dikirim',
        isApproved
          ? 'Materi telah disetujui & layak ajar (dipublikasikan ke siswa).'
          : 'Catatan koreksi telah disimpan & dikembalikan ke guru pengampu untuk revisi.',
        isApproved ? 'success' : 'warning'
      )
    },
    onError: (err) => {
      const errRes = err.response?.data
      const msg =
        errRes?.message ||
        (errRes?.errors ? Object.values(errRes.errors).flat().join(' ') : 'Gagal memproses supervisi materi.')
      pushToast('Gagal Supervisi', msg, 'error')
    },
  })

  // Handlers
  const handleOpenCreateModal = () => {
    setEditingItem(null)
    setSelectedFile(null)
    setFormData({
      ...initialFormState(),
      modul_ajar_id: optionsModul[0]?.id || '',
      urutan: dataMateri.length + 1,
    })
    setIsFormModalOpen(true)
  }

  const handleOpenEditModal = (item) => {
    setEditingItem(item)
    setSelectedFile(null)
    setFormData({
      modul_ajar_id: item.modul_ajar_id || item.modul_ajar?.id || '',
      judul: item.judul || '',
      tipe: item.tipe || 'teks',
      ringkasan: item.ringkasan || '',
      isi: item.isi || '',
      catatan: item.catatan || '',
      bobot: item.bobot || 45,
      file_url: item.file_raw || '',
      video: item.video || '',
      link: item.link || '',
      urutan: item.urutan || 1,
      status: item.status || 'aktif',
    })
    setIsFormModalOpen(true)
  }

  const handleTriggerSave = (e) => {
    e?.preventDefault()
    if (!formData.modul_ajar_id) {
      pushToast('Peringatan', 'Pilih Modul Ajar terlebih dahulu.', 'warning')
      return
    }
    if (!formData.judul?.trim()) {
      pushToast('Peringatan', 'Judul Materi Pembelajaran wajib diisi.', 'warning')
      return
    }
    setShowSaveConfirmModal(true)
  }

  const handleConfirmSave = () => {
    const payload = new FormData()
    payload.append('modul_ajar_id', formData.modul_ajar_id)
    payload.append('judul', formData.judul)
    payload.append('tipe', formData.tipe)
    payload.append('ringkasan', formData.ringkasan || '')
    payload.append('isi', formData.isi || '')
    payload.append('catatan', formData.catatan || '')
    payload.append('bobot', formData.bobot || 0)
    payload.append('video', formData.video || '')
    payload.append('link', formData.link || '')
    payload.append('urutan', formData.urutan)
    payload.append('status', formData.status)

    if (selectedFile) {
      payload.append('file', selectedFile)
    } else if (formData.file_url) {
      payload.append('file_url', formData.file_url)
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleConfirmDelete = () => {
    if (deleteTarget?.id) {
      deleteMutation.mutate(deleteTarget.id)
    }
  }

  // Export Spreadsheet (xlsx, xls, csv)
  const handleExportSpreadsheet = async (format) => {
    try {
      setIsExporting(true)
      if (!dataMateri || dataMateri.length === 0) {
        pushToast('Informasi', 'Tidak ada data Materi Pembelajaran untuk diekspor.', 'warning')
        setIsExportModalOpen(false)
        return
      }

      const exportData = dataMateri.map((row, i) => ({
        'No': i + 1,
        'Urutan': row.urutan || 1,
        'Judul Materi': row.judul || '-',
        'Modul Ajar': row.modul_ajar?.judul_modul || '-',
        'Tipe': row.tipe || 'teks',
        'Ringkasan': row.ringkasan || '-',
        'Bobot (Menit)': row.bobot || 0,
        'Status': row.status || 'aktif',
      }))

      downloadSpreadsheetTemplate(
        exportData,
        `materi_pembelajaran_${new Date().toISOString().slice(0, 10)}`,
        format,
        'Materi Pembelajaran'
      )
      setIsExportModalOpen(false)
      pushToast('Export Berhasil', `Berkas Materi Pembelajaran .${format.toUpperCase()} berhasil diunduh.`, 'success')
    } catch (err) {
      pushToast('Gagal Export', err?.message || 'Terjadi kesalahan saat menyiapkan berkas ekspor.', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  // Single Item Print
  const handlePrintSingleMateri = (item) => {
    if (!item) return
    printCleanTable({
      title: `Detail Materi: ${item.judul}`,
      subtitle: `Modul Ajar: ${item.modul_ajar?.judul_modul || '-'}`,
      headers: ['PROPERTI MATERI', 'KETERANGAN / DOKUMEN'],
      rows: [
        ['Judul Materi', item.judul || '-'],
        ['Modul Ajar Induk', item.modul_ajar?.judul_modul || '-'],
        ['Tipe Materi', item.tipe || '-'],
        ['Urutan Materi', `#${item.urutan || 1}`],
        ['Estimasi Waktu Belajar', item.bobot ? `${item.bobot} Menit` : '-'],
        ['Status Publikasi', (item.status === 'aktif' || item.status === 'published') ? 'Aktif' : item.status === 'draft' ? 'Draft' : 'Nonaktif'],
        ['Ringkasan Singkat', item.ringkasan || '-'],
        ['Uraian Lengkap Materi', item.isi ? item.isi.replace(/<[^>]*>?/gm, '') : '-'],
        ['Catatan / Instruksi Guru', item.catatan || '-'],
        ['Tautan File Dokumen', item.file || '-'],
        ['Tautan Video Pembelajaran', item.video || '-'],
        ['Tautan Referensi Eksternal', item.link || '-'],
      ],
    })
  }

  // KPI Quick View Modal
  const handleOpenKpiModal = (categoryType) => {
    let filteredList = [...dataMateri]
    let title = ''

    if (categoryType === 'total') {
      title = 'Total Materi Pembelajaran'
      filteredList = dataMateri
    } else if (categoryType === 'dokumen') {
      title = 'Daftar Materi Dokumen & PDF'
      filteredList = dataMateri.filter((m) => m.tipe === 'dokumen' || m.tipe === 'pdf' || !!m.file)
    } else if (categoryType === 'video') {
      title = 'Daftar Video Pembelajaran'
      filteredList = dataMateri.filter((m) => m.tipe === 'video' || !!m.video)
    } else if (categoryType === 'aktif') {
      title = 'Daftar Materi Aktif'
      filteredList = dataMateri.filter((m) => (m.status === 'aktif' || m.status === 'published') && !m.deleted_at)
    }

    setKpiModalCategory({
      title,
      type: categoryType,
      items: filteredList,
    })
    setKpiModalOpen(true)
  }

  // Import handlers
  const handleDownloadTemplate = () => {
    const headers = ['MODUL_AJAR_ID', 'JUDUL', 'TIPE', 'RINGKASAN', 'BOBOT_MENIT', 'STATUS']
    const sample = [optionsModul[0]?.id || '1', 'Pengenalan Tajwid Al-Quran', 'teks', 'Pengenalan hukum nun mati dan tanwin', '45', 'aktif']
    const csvContent = [headers.join(','), sample.map((v) => `"${v}"`).join(',')].join('\n')
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Template_Import_Materi.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) processImportFile(file)
  }

  const processImportFile = (file) => {
    setImportFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target.result
        const lines = text.split('\n').filter((l) => l.trim().length > 0)
        if (lines.length > 1) {
          const preview = lines.slice(1, 6).map((line) => {
            const cols = line.split(',').map((c) => c.replace(/(^"|"$)/g, '').trim())
            return {
              modul: cols[0] || '-',
              judul: cols[1] || 'Materi Baru',
              tipe: cols[2] || 'teks',
              ringkasan: cols[3] || '-',
            }
          })
          setImportPreviewData(preview)
        }
      } catch (err) {
        console.error('Error parsing preview', err)
      }
    }
    reader.readAsText(file)
  }

  const handleExecuteImport = async () => {
    if (!importFile) {
      pushToast('Peringatan', 'Pilih berkas CSV terlebih dahulu.', 'warning')
      return
    }
    setImportLoading(true)
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const text = e.target.result
        const lines = text.split('\n').filter((l) => l.trim().length > 0)
        if (lines.length <= 1) {
          pushToast('Peringatan', 'Berkas CSV kosong.', 'warning')
          setImportLoading(false)
          return
        }
        let success = 0
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.replace(/(^"|"$)/g, '').trim())
          if (cols[1]) {
            const payload = new FormData()
            payload.append('modul_ajar_id', cols[0] || optionsModul[0]?.id || '')
            payload.append('judul', cols[1])
            payload.append('tipe', cols[2] || 'teks')
            payload.append('ringkasan', cols[3] || '')
            payload.append('bobot', cols[4] || 45)
            payload.append('status', cols[5] || 'aktif')
            payload.append('urutan', i)
            await lmsMateriService.simpan(payload)
            success++
          }
        }
        queryClient.invalidateQueries({ queryKey: ['lmsMateriList'] })
        setIsImportModalOpen(false)
        setImportFile(null)
        setImportPreviewData([])
        pushToast('Import Berhasil', `${success} materi pembelajaran berhasil diimpor.`, 'success')
      } catch (err) {
        pushToast('Gagal Import', err?.response?.data?.message || 'Terjadi kesalahan impor materi.', 'error')
      } finally {
        setImportLoading(false)
      }
    }
    reader.readAsText(importFile)
  }

  const hasActiveFilters = Boolean(
    (canSelectUnit && selectedUnit) ||
      search ||
      selectedModul ||
      selectedMapel ||
      selectedTipe ||
      selectedStatus ||
      selectedStatusSupervisi ||
      denganSampah ||
      sortDateOrder !== 'desc'
  )

  const handleResetFilters = () => {
    if (canSelectUnit) setSelectedUnit('')
    setSearch('')
    setSelectedModul('')
    setSelectedMapel('')
    setSelectedTipe('')
    setSelectedStatus('')
    setSelectedStatusSupervisi('')
    setDenganSampah(false)
    setSortDateOrder('desc')
    setPage(1)
    refetch()
  }

  const totalPages = pagination.last_page || 1
  const totalItems = pagination.total || dataMateri.length

  const getTipeBadge = (tipe) => {
    switch (tipe) {
      case 'video':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800">
            <Video className="size-3" /> Video
          </span>
        )
      case 'dokumen':
      case 'pdf':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-800 border border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800">
            <FileText className="size-3" /> Dokumen
          </span>
        )
      case 'link':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800">
            <LinkIcon className="size-3" /> Tautan
          </span>
        )
      case 'presentasi':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-purple-50 text-purple-800 border border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800">
            <Layers className="size-3" /> Presentasi
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800">
            <BookOpen className="size-3" /> Teks
          </span>
        )
    }
  }

  const getStatusBadge = (status, deletedAt) => {
    if (deletedAt) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800">
          Terhapus
        </span>
      )
    }
    if (status === 'draft') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800">
          Draft
        </span>
      )
    }
    if (status === 'nonaktif') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
          Nonaktif
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800">
        Aktif
      </span>
    )
  }

  const getStatusSupervisiBadge = (statusSupervisi) => {
    switch (statusSupervisi) {
      case 'diajukan':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700 shadow-2xs">
            <Clock className="size-3 text-amber-600 dark:text-amber-400" />
            Menunggu Telaah
          </span>
        )
      case 'perlu_revisi':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700 shadow-2xs">
            <AlertTriangle className="size-3 text-rose-600 dark:text-rose-400" />
            Perlu Revisi
          </span>
        )
      case 'disetujui':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700 shadow-2xs">
            <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
            Disetujui
          </span>
        )
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            Draf Guru
          </span>
        )
    }
  }

  if (!embedded && isTeacherOnly) {
    return <Navigate to="/portal-guru/workspace?tab=materi" replace />
  }

  return (
    <PageContainer maxW="7xl">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-12">
        {/* ── Breadcrumbs Navigation ── */}
        {!(embedded || hideBreadcrumb) && (
          <motion.div variants={itemVariants} className="print:hidden">
            <AppBreadcrumb
              items={[
                { label: 'LMS & Akademik', href: '/dashboard' },
                { label: 'Materi Pembelajaran' },
              ]}
            />
          </motion.div>
        )}

        {/* ── MODERN VIVID EMERALD HERO HEADER CARD ── */}
        {!hidePageHeader && (
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-4 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden"
          >
            <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
                <div className="flex size-11 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                  <BookOpen className="size-5 sm:size-7" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                      Materi Pembelajaran
                    </h1>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-0.5 sm:px-3.5 sm:py-1 text-[11px] sm:text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Modul &amp; Bahan Ajar Digital
                    </span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 w-full leading-relaxed">
                    Kelola dokumen PDF, video pembelajaran, ringkasan, dan teks bahan ajar interaktif terstruktur per Modul Ajar.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 px-3.5 py-1.5 text-xs font-black text-emerald-900 dark:border-emerald-700 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>KBM &amp; Media Interaktif</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── 4 KARTU KPI MODERN (MULTI-TONE) ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
          <ModernKpiCard
            label="Total Materi"
            value={computedStats.total_materi ?? 0}
            icon={BookOpen}
            tone="emerald"
            tag={`${computedStats.total_modul_ajar ?? 0} Modul`}
            subtext="Terdaftar di sistem sekolah"
            onClick={() => handleOpenKpiModal('total')}
          />
          <ModernKpiCard
            label="Dokumen & PDF"
            value={computedStats.materi_dokumen ?? 0}
            icon={FileText}
            tone="blue"
            tag="Unduhan"
            subtext="Bahan ajar digital PDF & Office"
            onClick={() => handleOpenKpiModal('dokumen')}
          />
          <ModernKpiCard
            label="Video Belajar"
            value={computedStats.materi_video ?? 0}
            icon={Video}
            tone="rose"
            tag="Media"
            subtext="Video tutorial & link YouTube"
            onClick={() => handleOpenKpiModal('video')}
          />
          <ModernKpiCard
            label="Materi Aktif"
            value={computedStats.materi_aktif ?? 0}
            icon={ShieldCheck}
            tone="amber"
            tag="Siap Akses"
            subtext="Aktif diakses oleh siswa"
            onClick={() => handleOpenKpiModal('aktif')}
          />
        </motion.div>

        {/* Tab Navigation Slot */}
        {tabNav && (
          <motion.div variants={itemVariants} className="print:hidden">
            {typeof tabNav === 'function' ? tabNav() : tabNav}
          </motion.div>
        )}

        {/* ── CANONICAL EMERALD DATATABLE CONTAINER ── */}
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
            {/* ── TOOLBAR BARIS 1: Header + 4 Vivid Gradient Squircle Buttons ── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-200/90 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-5 py-4 sm:px-6 md:px-8 dark:from-emerald-950/50 dark:via-teal-950/30">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-sm border border-emerald-300/40 shrink-0">
                  <BookOpen className="size-5 text-white" strokeWidth={2.2} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Data Materi Pembelajaran
                    </h2>
                    <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 dark:text-emerald-200 border border-emerald-300/60">
                      {Number(totalItems).toLocaleString('id-ID')} Materi
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                    Daftar bahan ajar terstruktur per modul ajar dan mata pelajaran.
                  </p>
                </div>
              </div>

              {/* 4 Vivid Gradient Squircle Action Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
                {/* 1. Cetak Datatable Button */}
                <div className="group relative inline-flex">
                  <button
                    type="button"
                    title="Cetak & Export PDF"
                    aria-label="Cetak & Export PDF"
                    onClick={() => setIsPrintModalOpen(true)}
                    className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white border border-indigo-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    <Printer className="size-5 text-white" strokeWidth={2.2} />
                  </button>
                  <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                    <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                    Cetak &amp; Export
                  </div>
                </div>

                {/* 2. Import Button */}
                <div className="group relative inline-flex">
                  <button
                    type="button"
                    title="Import Data Materi"
                    aria-label="Import Data Materi"
                    onClick={() => setIsImportModalOpen(true)}
                    className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white border border-sky-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    <Upload className="size-5 text-white" strokeWidth={2.2} />
                  </button>
                  <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                    <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                    Import Data
                  </div>
                </div>

                {/* 3. Export Button */}
                <div className="group relative inline-flex">
                  <button
                    type="button"
                    title="Export Data (Excel / CSV)"
                    aria-label="Export Data (Excel / CSV)"
                    onClick={() => setIsExportModalOpen(true)}
                    className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white border border-amber-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    <Download className="size-5 text-white" strokeWidth={2.2} />
                  </button>
                  <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                    <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                    Export Data (Excel / CSV)
                  </div>
                </div>

                {/* 4. Tambah Materi Button */}
                <div className="group relative inline-flex">
                  <button
                    type="button"
                    title="Tambah Materi Baru"
                    aria-label="Tambah Materi Baru"
                    onClick={handleOpenCreateModal}
                    className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    <Plus className="size-5 text-white" strokeWidth={2.5} />
                  </button>
                  <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                    <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                    Tambah Materi
                  </div>
                </div>
              </div>
            </div>

            {/* ── TOOLBAR BARIS 2: Full-Width Search Bar dengan Debounce ── */}
            <div className="px-5 pt-4 sm:px-6 md:px-8">
              <div className="relative w-full">
                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center text-slate-400 dark:text-slate-500">
                  <Search className="size-4" />
                </div>
                <input
                  type="text"
                  placeholder="Cari judul materi, ringkasan, atau modul ajar..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-10 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('')
                      setPage(1)
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            </div>

            {/* ── TOOLBAR BARIS 3: Horizontal Filter Bar ── */}
            <div className="px-4 py-3 sm:px-6 md:px-8 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-emerald-950/30 mt-3 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-2.5 w-full">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 shrink-0">
                Filter Data:
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
                    { value: '', label: `Semua Unit (${unitOptions.length || 'SIT'})` },
                    ...unitOptions.map((u) => ({ value: String(u.id), label: u.name || u.nama_unit })),
                  ]}
                  placeholder={`Semua Unit (${unitOptions.length || 'SIT'})`}
                  searchable={unitOptions.length > 5}
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

              {/* Mapel Dropdown */}
              {subjects.length > 0 && (
                <HeroUiFilterSelect
                  value={selectedMapel}
                  onChange={(val) => {
                    setSelectedMapel(val)
                    setPage(1)
                  }}
                  options={[
                    { value: '', label: `Semua Mapel (${subjects.length})` },
                    ...subjects.map((s) => ({ value: s.id, label: s.nama_mapel })),
                  ]}
                  placeholder={`Semua Mapel (${subjects.length})`}
                  searchable={subjects.length > 5}
                  icon={BookOpen}
                />
              )}

              {/* Modul Search & Dropdown */}
              <HeroUiFilterSelect
                value={selectedModul}
                onChange={(val) => {
                  setSelectedModul(val)
                  setPage(1)
                }}
                options={[
                  { value: '', label: `Semua Modul Ajar (${optionsModul.length})` },
                  ...optionsModul.map((mod) => ({
                    value: mod.id,
                    label: (mod.kode_modul ? `[${mod.kode_modul}] ` : '') + mod.judul_modul,
                  })),
                ]}
                placeholder={`Semua Modul Ajar (${optionsModul.length})`}
                searchable={optionsModul.length > 5}
                icon={Layers}
                popoverWidth="min-w-[260px]"
              />

              {/* Tipe Dropdown */}
              <HeroUiFilterSelect
                value={selectedTipe}
                onChange={(val) => {
                  setSelectedTipe(val)
                  setPage(1)
                }}
                options={[
                  { value: '', label: 'Semua Tipe' },
                  ...tipeOptions.map((t) => ({ value: t.id, label: t.nama })),
                ]}
                placeholder="Semua Tipe"
                icon={FileText}
              />

              {/* Status Dropdown */}
              <HeroUiFilterSelect
                value={selectedStatus}
                onChange={(val) => {
                  setSelectedStatus(val)
                  setPage(1)
                }}
                options={[
                  { value: '', label: 'Semua Status' },
                  { value: 'aktif', label: 'Aktif' },
                  { value: 'published', label: 'Published' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'nonaktif', label: 'Nonaktif' },
                ]}
                placeholder="Semua Status"
              />

              {/* Status Supervisi / Telaah Dropdown */}
              <HeroUiFilterSelect
                value={selectedStatusSupervisi}
                onChange={(val) => {
                  setSelectedStatusSupervisi(val)
                  setPage(1)
                }}
                options={[
                  { value: '', label: 'Semua Telaah' },
                  { value: 'diajukan', label: 'Menunggu Telaah' },
                  { value: 'perlu_revisi', label: 'Perlu Revisi' },
                  { value: 'disetujui', label: 'Disetujui Layak Ajar' },
                  { value: 'draft', label: 'Draf Guru' },
                ]}
                placeholder="Semua Telaah"
                popoverWidth="min-w-[190px]"
              />

              {/* Data Sampah Dropdown */}
              <HeroUiFilterSelect
                value={denganSampah ? '1' : ''}
                onChange={(val) => {
                  setDenganSampah(val === '1')
                  setPage(1)
                }}
                options={[
                  { value: '', label: 'Data Aktif' },
                  { value: '1', label: 'Termasuk Sampah' },
                ]}
                placeholder="Data Aktif"
              />

              {/* Sortir Tanggal Dropdown */}
              <HeroUiFilterSelect
                value={sortDateOrder}
                onChange={(val) => {
                  setSortDateOrder(val)
                  setPage(1)
                }}
                options={[
                  { value: 'desc', label: 'Tanggal: Terbaru ↓' },
                  { value: 'asc', label: 'Tanggal: Terlama ↑' },
                ]}
                placeholder="Urutan Tanggal"
                icon={Calendar}
              />

              {/* Reset Filter Button */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 h-9 w-full sm:w-auto sm:ml-auto justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                  title="Reset Filter"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>

            {/* ── LEMBAR DATA TABLE UTAMA ── */}
            <div className="overflow-x-auto">
              <TableRoot className="w-full text-left text-sm" aria-label="Daftar Materi Pembelajaran">
                <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
                  <TableRow className="border-b-2 border-emerald-200/90 dark:border-emerald-800/80 bg-transparent text-emerald-950 dark:text-emerald-200">
                    <TableHead className="w-10 sm:w-12 px-2.5 sm:px-3.5 py-3.5 text-center font-extrabold text-[11px] uppercase tracking-wider">
                      No
                    </TableHead>
                    <TableHead className="hidden sm:table-cell w-12 px-2 py-3.5 text-center font-extrabold text-[11px] uppercase tracking-wider">
                      Urut
                    </TableHead>
                    <TableHead className="w-auto sm:w-[38%] md:w-[42%] px-3.5 sm:px-6 md:px-8 py-3.5 font-extrabold text-[11px] uppercase tracking-wider">
                      Judul Materi
                    </TableHead>
                    <TableHead className="hidden md:table-cell w-[22%] px-3.5 py-3.5 font-extrabold text-[11px] uppercase tracking-wider">
                      Modul Ajar Induk
                    </TableHead>
                    <TableHead className="hidden lg:table-cell w-[12%] px-3.5 py-3.5 text-center font-extrabold text-[11px] uppercase tracking-wider">
                      Tipe
                    </TableHead>
                    <TableHead className="hidden sm:table-cell w-[10%] px-3.5 py-3.5 text-center font-extrabold text-[11px] uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead
                      onClick={() => {
                        setSortDateOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))
                        setPage(1)
                      }}
                      className="hidden md:table-cell w-[12%] px-3.5 py-3.5 text-center font-extrabold text-[11px] uppercase tracking-wider cursor-pointer hover:bg-emerald-200/50 dark:hover:bg-emerald-900/60 transition select-none"
                      title="Klik untuk mengubah urutan tanggal"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Tanggal</span>
                        <ArrowUpDown className="size-3 text-emerald-700 dark:text-emerald-300" />
                      </div>
                    </TableHead>
                    <TableHead className="w-14 sm:w-20 px-2 sm:px-3.5 py-3.5 text-center font-extrabold text-[11px] uppercase tracking-wider">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-slate-700 dark:text-slate-200">
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan="8" className="px-6 py-14 text-center text-slate-400">
                        <div className="flex flex-col justify-center items-center gap-2">
                          <RefreshCw className="h-6 w-6 animate-spin text-[#0E5C44]" />
                          <span className="text-xs font-semibold">Memuat data Materi Pembelajaran...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : dataMateri.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan="8" className="px-6 py-14 text-center text-slate-400">
                        <div className="flex flex-col justify-center items-center gap-2">
                          <BookOpen className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Belum Ada Materi Pembelajaran</p>
                          <p className="text-xs text-slate-400">Klik "Tambah Materi" untuk menambahkan bahan ajar baru.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    dataMateri.map((item, idx) => (
                      <TableRow
                        key={item.id}
                        className="group border-b border-emerald-100/90 dark:border-emerald-900/40 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all duration-150"
                      >
                        {/* No */}
                        <TableCell className="px-2.5 sm:px-3.5 py-3.5 text-center text-xs font-bold text-slate-400">
                          {(pagination.current_page - 1) * pagination.per_page + idx + 1}
                        </TableCell>

                        {/* Urutan */}
                        <TableCell className="hidden sm:table-cell px-2 py-3.5 text-center">
                          <span className="inline-flex items-center justify-center size-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                            #{item.urutan}
                          </span>
                        </TableCell>

                        {/* Judul Materi */}
                        <TableCell className="px-3.5 sm:px-6 md:px-8 py-3.5">
                          <div
                            onClick={() => {
                              setPreviewItem(item)
                              setPreviewModalOpen(true)
                            }}
                            className="cursor-pointer group/title"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover/title:text-[#0E5C44] dark:group-hover/title:text-[#3FBF75] transition-colors leading-snug">
                                {item.judul}
                              </span>
                              {item.bobot > 0 && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-[#0E5C44] dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 shrink-0">
                                  <Clock className="w-3 h-3" /> {item.bobot} mnt
                                </span>
                              )}
                            </div>
                            {item.ringkasan ? (
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 font-medium">
                                {item.ringkasan}
                              </p>
                            ) : item.isi ? (
                              <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5">
                                {item.isi.replace(/<[^>]*>?/gm, '')}
                              </p>
                            ) : null}

                            {/* Alert Callout Catatan Revisi dari Supervisor */}
                            {item.status_supervisi === 'perlu_revisi' && item.catatan_koreksi && (
                              <div className="mt-2 flex items-start gap-1.5 p-2 rounded-xl bg-rose-50/90 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800/60 text-[11px] text-rose-800 dark:text-rose-200">
                                <AlertTriangle className="size-3.5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                                <span className="line-clamp-2">
                                  <strong>Koreksi {item.supervisor_role || 'Supervisor'}:</strong> {item.catatan_koreksi}
                                </span>
                              </div>
                            )}

                            {/* Mobile compact metadata row */}
                            <div className="sm:hidden mt-2 flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-emerald-100/80 dark:border-emerald-900/40">
                              <span className="inline-flex items-center justify-center size-5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                                #{item.urutan}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                                {item.modul_ajar?.judul_modul || 'Modul Ajar'}
                              </span>
                              {getTipeBadge(item.tipe)}
                              {getStatusBadge(item.status, item.deleted_at)}
                              {getStatusSupervisiBadge(item.status_supervisi)}
                            </div>
                          </div>
                        </TableCell>

                        {/* Modul Ajar Induk */}
                        <TableCell className="hidden md:table-cell px-3.5 py-3.5">
                          <div className="text-xs">
                            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {item.modul_ajar?.judul_modul || 'Modul Ajar'}
                            </p>
                            <p className="text-slate-400 font-mono text-[11px] mt-0.5">
                              {item.modul_ajar?.kode_modul || ''} {item.subject?.nama_mapel ? `• ${item.subject.nama_mapel}` : ''}
                            </p>
                          </div>
                        </TableCell>

                        {/* Tipe */}
                        <TableCell className="hidden lg:table-cell px-3.5 py-3.5 text-center">
                          {getTipeBadge(item.tipe)}
                        </TableCell>

                        {/* Status (Publish & Supervisi) */}
                        <TableCell className="hidden sm:table-cell px-3.5 py-3.5 text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            {getStatusBadge(item.status, item.deleted_at)}
                            {getStatusSupervisiBadge(item.status_supervisi)}
                          </div>
                        </TableCell>

                        {/* Tanggal */}
                        <TableCell className="hidden md:table-cell px-3.5 py-3.5 text-center">
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {item.created_at
                              ? new Date(item.created_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '-'}
                          </span>
                        </TableCell>

                        {/* Aksi Baris */}
                        <TableCell className="px-2 sm:px-3.5 py-3.5 text-center">
                          <div className="flex items-center justify-center">
                            <ActionDropdown
                              onView={() => {
                                setPreviewItem(item)
                                setPreviewModalOpen(true)
                              }}
                              onEdit={() => handleOpenEditModal(item)}
                              onDelete={() => setDeleteTarget(item)}
                              extraItems={[
                                ...(isSupervisor
                                  ? [
                                      {
                                        label: 'Supervisi & Catatan Koreksi',
                                        icon: <ShieldCheck className="h-4 w-4 text-emerald-600" />,
                                        onClick: () => {
                                          setSupervisiTarget(item)
                                          setSupervisiModalOpen(true)
                                        },
                                      },
                                    ]
                                  : []),
                                ...(item.status_supervisi === 'draft' ||
                                item.status_supervisi === 'perlu_revisi' ||
                                !item.status_supervisi
                                  ? [
                                      {
                                        label: 'Ajukan Telaah Supervisi',
                                        icon: <Send className="h-4 w-4 text-blue-600" />,
                                        onClick: () => {
                                          setAjukanTarget(item)
                                          setAjukanCatatan('')
                                          setAjukanModalOpen(true)
                                        },
                                      },
                                    ]
                                  : []),
                                {
                                  label: 'Cetak Detail Materi',
                                  icon: <Printer className="h-4 w-4 text-indigo-600" />,
                                  onClick: () => handlePrintSingleMateri(item),
                                },
                                {
                                  label: 'Kelola Media Pembelajaran',
                                  icon: <Paperclip className="h-4 w-4 text-blue-600" />,
                                  onClick: () => {
                                    window.location.href = `/dashboard/lms/media-pembelajaran?materi_id=${item.id}`
                                  },
                                },
                                ...(item.deleted_at
                                  ? [
                                      {
                                        label: 'Pulihkan Materi',
                                        icon: <RotateCcw className="h-4 w-4 text-emerald-600" />,
                                        onClick: () => restoreMutation.mutate(item.id),
                                      },
                                    ]
                                  : []),
                              ]}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </TableRoot>
            </div>

            {/* ── PAGINATION BAR EMERALD SQUIRCLE ── */}
            <div className="px-5 py-4 sm:px-6 md:px-8 border-t border-emerald-200/90 dark:border-emerald-800/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <span>
                  Menampilkan <strong className="text-slate-900 dark:text-white">{(pagination.current_page - 1) * pagination.per_page + 1}</strong> -{' '}
                  <strong className="text-slate-900 dark:text-white">{Math.min(pagination.current_page * pagination.per_page, totalItems)}</strong> dari{' '}
                  <strong className="text-slate-900 dark:text-white">{totalItems}</strong> materi
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <HeroUiFilterSelect
                  value={perPage}
                  onChange={(val) => {
                    setPerPage(Number(val))
                    setPage(1)
                  }}
                  options={[
                    { value: 5, label: '5 baris' },
                    { value: 10, label: '10 baris' },
                    { value: 15, label: '15 baris' },
                    { value: 25, label: '25 baris' },
                    { value: 50, label: '50 baris' },
                  ]}
                  placeholder={`${perPage} baris`}
                  className="w-auto"
                  popoverWidth="min-w-[110px]"
                />
              </div>

              {/* Previous & Next Icon-Only Squircle Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  title="Halaman Sebelumnya"
                  aria-label="Halaman Sebelumnya"
                  className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-xs transition-all duration-150 active:scale-95 disabled:bg-emerald-600/30 disabled:text-white/40 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronLeft className="size-5 text-white" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1
                    if (totalPages > 5) {
                      const start = Math.max(1, Math.min(page - 2, totalPages - 4))
                      pageNum = start + i
                    }
                    const isActive = page === pageNum
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setPage(pageNum)}
                        className={`size-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  title="Halaman Selanjutnya"
                  aria-label="Halaman Selanjutnya"
                  className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-xs transition-all duration-150 active:scale-95 disabled:bg-emerald-600/30 disabled:text-white/40 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronRight className="size-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── MODAL FORM TAMBAH / EDIT MATERI (Harmonized Form Modal) ── */}
        <AnimatePresence>
          {isFormModalOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-md sm:p-4"
              role="dialog"
              aria-modal="true"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="my-auto flex max-h-[calc(100vh-2.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
              >
                {/* Top Accent Gradient Bar */}
                <div
                  className={`h-1.5 w-full shrink-0 bg-gradient-to-r ${
                    editingItem
                      ? 'from-amber-400 via-amber-500 to-orange-500'
                      : 'from-emerald-500 via-teal-400 to-emerald-600'
                  }`}
                />

                {/* Modal Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-6 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 p-2 text-emerald-700 dark:from-emerald-950/60 dark:to-teal-950/40 dark:border-emerald-800/60 dark:text-emerald-300 shrink-0">
                      <BookOpen className="size-5 text-[#0E5C44] dark:text-emerald-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                          {editingItem ? 'Edit Materi Pembelajaran' : 'Tambah Materi Baru'}
                        </h3>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                          <Sparkles className="size-3" />
                          {editingItem ? 'Update Materi' : 'Bahan Ajar KBM'}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        Tautkan materi ke Modul Ajar dan lengkapi instruksi &amp; bahan ajar digital.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {/* Form Body Scrollable */}
                <form onSubmit={handleTriggerSave} className="flex min-h-0 flex-1 flex-col">
                  <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                    {/* Modul Ajar Select */}
                    <div>
                      <HeroUiModalSelect
                        label="Modul Ajar Induk"
                        required
                        value={formData.modul_ajar_id}
                        onChange={(val) => setFormData({ ...formData, modul_ajar_id: val })}
                        options={optionsModul.map((mod) => ({
                          value: mod.id,
                          label: (mod.kode_modul ? `[${mod.kode_modul}] ` : '') + mod.judul_modul,
                        }))}
                        placeholder={`-- Pilih Modul Ajar (${optionsModul.length} tersedia) --`}
                        searchable={optionsModul.length > 5}
                        icon={Layers}
                      />
                    </div>

                    {/* Judul & Urutan */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Judul Materi Pembelajaran <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: Pengenalan Al-Qur'an dan Hukum Tajwid"
                          value={formData.judul}
                          onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                          className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Urutan Materi
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.urutan}
                          onChange={(e) => setFormData({ ...formData, urutan: parseInt(e.target.value) || 1 })}
                          className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    {/* Tipe & Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <HeroUiModalSelect
                          label="Tipe Materi"
                          value={formData.tipe}
                          onChange={(val) => setFormData({ ...formData, tipe: val })}
                          options={tipeOptions.map((t) => ({ value: t.id, label: t.nama }))}
                          placeholder="Pilih Tipe Materi"
                          icon={FileText}
                        />
                      </div>

                      <div>
                        <HeroUiModalSelect
                          label="Status Publikasi"
                          value={formData.status}
                          onChange={(val) => setFormData({ ...formData, status: val })}
                          options={[
                            { value: 'aktif', label: 'Aktif (Published)' },
                            { value: 'published', label: 'Published' },
                            { value: 'draft', label: 'Draft' },
                            { value: 'nonaktif', label: 'Nonaktif' },
                          ]}
                          placeholder="Pilih Status"
                          icon={CheckCircle2}
                        />
                      </div>
                    </div>

                    {/* Ringkasan & Estimasi Waktu */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Ringkasan Singkat
                        </label>
                        <input
                          type="text"
                          placeholder="Ringkasan poin-poin materi..."
                          value={formData.ringkasan}
                          onChange={(e) => setFormData({ ...formData, ringkasan: e.target.value })}
                          className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Estimasi Belajar (Menit)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="5"
                          value={formData.bobot}
                          onChange={(e) => setFormData({ ...formData, bobot: parseInt(e.target.value) || 0 })}
                          className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    {/* Uraian Lengkap */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Isi &amp; Uraian Materi Lengkap
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Tulis pembahasan materi lengkap atau petunjuk pengerjaan..."
                        value={formData.isi}
                        onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
                        className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100 resize-none"
                      />
                    </div>

                    {/* Catatan Guru */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Catatan Guru &amp; Instruksi Khusus
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Pesan khusus untuk peserta didik..."
                        value={formData.catatan}
                        onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                        className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100 resize-none"
                      />
                    </div>

                    {/* Dokumen PDF Attachment Box */}
                    <div className="rounded-2xl border border-sky-200/80 bg-sky-50/40 p-4 dark:border-sky-800/60 dark:bg-sky-950/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-sky-900 dark:text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="size-4 text-sky-600" />
                          Lampiran Dokumen / Modul PDF
                        </label>
                        <span className="text-[10px] font-semibold text-slate-400">PDF, DOCX, PPTX (Maks 20MB)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Pilihan 1: Unggah Berkas PDF
                          </label>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,image/*"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-700 cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Pilihan 2: Tautan PDF Online
                          </label>
                          <input
                            type="url"
                            placeholder="https://.../dokumen.pdf"
                            value={formData.file_url}
                            onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-sky-600"
                          />
                        </div>
                      </div>

                      {(editingItem?.file || formData.file_url || selectedFile) && (
                        <div className="flex items-center gap-2 text-xs text-sky-700 dark:text-sky-300 font-semibold pt-1">
                          <CheckCircle2 className="size-3.5 shrink-0" />
                          <span className="truncate">
                            {selectedFile
                              ? `Berkas: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(0)} KB)`
                              : formData.file_url
                              ? `Tautan: ${formData.file_url}`
                              : `Tersimpan: ${editingItem?.file}`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Video Embed Box */}
                    <div className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-4 dark:border-rose-800/60 dark:bg-rose-950/20 space-y-2">
                      <label className="text-xs font-bold text-rose-900 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Video className="size-4 text-rose-600" />
                        Tautan Video Pembelajaran (YouTube / Vimeo Embed)
                      </label>
                      <input
                        type="url"
                        placeholder="Contoh: https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                        value={formData.video}
                        onChange={(e) => setFormData({ ...formData, video: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-rose-600"
                      />
                    </div>

                    {/* Link Eksternal */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Link Referensi Tambahan (Opsional)
                      </label>
                      <input
                        type="url"
                        placeholder="https://pustaka.kemdikbud.go.id/..."
                        value={formData.link}
                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-slate-50/50 text-xs font-semibold focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-white px-5 py-4 sm:px-6 dark:border-slate-800 dark:bg-slate-950">
                    <button
                      type="button"
                      onClick={() => setIsFormModalOpen(false)}
                      className="h-10 rounded-xl border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white px-6 py-2.5 text-xs font-extrabold border border-emerald-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 cursor-pointer shadow-md shadow-emerald-700/20"
                    >
                      <Save className="size-3.5 text-white" strokeWidth={2.2} />
                      <span>{editingItem ? 'Simpan Perubahan' : 'Simpan Materi'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── HARMONIZED SAVE CONFIRMATION MODAL ── */}
        <AnimatePresence>
          {showSaveConfirmModal && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
              >
                <div
                  className={`h-1.5 w-full bg-gradient-to-r ${
                    editingItem
                      ? 'from-amber-400 via-amber-500 to-orange-500'
                      : 'from-emerald-500 via-teal-400 to-emerald-600'
                  }`}
                />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`flex size-11 shrink-0 items-center justify-center rounded-2xl border shadow-md ${
                        editingItem
                          ? 'bg-gradient-to-br from-amber-50 to-orange-50 text-amber-700 border-amber-200'
                          : 'bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {editingItem ? <Pencil className="size-5" /> : <BookOpen className="size-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        {editingItem ? 'Konfirmasi Perubahan Materi' : 'Konfirmasi Simpan Materi'}
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Pastikan seluruh data materi pembelajaran telah sesuai
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 space-y-1 dark:border-slate-800 dark:bg-slate-900/50">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{formData.judul}</p>
                    <p className="text-[11px] text-slate-500">
                      Tipe: {formData.tipe} • Urutan #{formData.urutan} • Estimasi: {formData.bobot} menit
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowSaveConfirmModal(false)}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      onClick={handleConfirmSave}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 px-5 py-2 text-xs font-black text-white border border-emerald-300/40 hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
                    >
                      {createMutation.isPending || updateMutation.isPending ? (
                        <RefreshCw className="size-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-3.5" />
                      )}
                      <span>Ya, Simpan Materi</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── HARMONIZED DELETE CONFIRMATION MODAL ── */}
        <AnimatePresence>
          {deleteTarget && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="w-full max-w-md overflow-hidden rounded-3xl border border-rose-200/80 bg-white shadow-2xl shadow-rose-950/20 dark:border-rose-900/60 dark:bg-slate-950"
              >
                <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-rose-600 to-red-700" />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white shadow-md shadow-rose-500/30 border border-rose-300/40">
                      <Trash2 className="size-5 text-white" strokeWidth={2.2} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        Hapus Materi Pembelajaran?
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Data akan dipindahkan ke tempat sampah (soft delete)
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-3.5 space-y-1 dark:border-rose-900/50 dark:bg-rose-950/20">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{deleteTarget.judul}</p>
                    <p className="text-[11px] text-slate-500">
                      Modul: {deleteTarget.modul_ajar?.judul_modul || '-'} • Tipe: {deleteTarget.tipe}
                    </p>
                  </div>

                  <p className="mt-3 text-xs text-rose-700/80 dark:text-rose-400 font-medium leading-relaxed">
                    Materi ini dapat dipulihkan kapan saja melalui opsi 'Termasuk Sampah'.
                  </p>

                  <div className="mt-6 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(null)}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={deleteMutation.isPending}
                      onClick={handleConfirmDelete}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 px-5 py-2 text-xs font-black text-white border border-rose-300/40 hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-rose-700/20 cursor-pointer"
                    >
                      {deleteMutation.isPending ? (
                        <RefreshCw className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                      <span>Ya, Hapus Materi</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── HARMONIZED PREVIEW DETAIL MODAL ── */}
        <AnimatePresence>
          {previewModalOpen && previewItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="my-auto flex max-h-[calc(100vh-2.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
                <div className="bg-[#0E5C44] px-6 py-4 text-white flex items-center justify-between shrink-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full font-bold">
                        Tipe: {previewItem.tipe} • Urutan #{previewItem.urutan}
                      </span>
                      {previewItem.bobot > 0 && (
                        <span className="text-[10px] bg-emerald-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Clock className="size-3" /> {previewItem.bobot} mnt
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-extrabold mt-1 leading-snug">{previewItem.judul}</h3>
                    <p className="text-xs text-emerald-100 mt-0.5">
                      Modul Induk: {previewItem.modul_ajar?.judul_modul || '-'}
                    </p>
                  </div>
                  <button
                    onClick={() => setPreviewModalOpen(false)}
                    className="rounded-xl p-1.5 text-emerald-100 hover:bg-white/10 hover:text-white cursor-pointer"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {/* Quick Action Toolbar inside Preview */}
                <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-amber-500" />
                    Opsi Materi:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Action Khusus Supervisor: Supervisi & Catatan Koreksi */}
                    {isSupervisor && (
                      <button
                        type="button"
                        onClick={() => {
                          setSupervisiTarget(previewItem)
                          setSupervisiModalOpen(true)
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white text-xs font-bold hover:scale-[1.02] active:scale-95 transition shadow-sm border border-emerald-300/40 cursor-pointer"
                      >
                        <ShieldCheck className="size-3.5" /> Beri Supervisi / Koreksi
                      </button>
                    )}

                    {/* Action Guru: Ajukan Telaah */}
                    {(previewItem.status_supervisi === 'draft' ||
                      previewItem.status_supervisi === 'perlu_revisi' ||
                      !previewItem.status_supervisi) && (
                      <button
                        type="button"
                        onClick={() => {
                          setAjukanTarget(previewItem)
                          setAjukanCatatan('')
                          setAjukanModalOpen(true)
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 text-white text-xs font-bold hover:scale-[1.02] active:scale-95 transition shadow-sm border border-sky-300/40 cursor-pointer"
                      >
                        <Send className="size-3.5" /> Ajukan Telaah
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handlePrintSingleMateri(previewItem)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition cursor-pointer"
                    >
                      <Printer className="size-3.5" /> Cetak Detail
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewModalOpen(false)
                        handleOpenEditModal(previewItem)
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900/60 transition cursor-pointer"
                    >
                      <Pencil className="size-3.5" /> Edit Materi
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = `/dashboard/lms/media-pembelajaran?materi_id=${previewItem.id}`
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition cursor-pointer"
                    >
                      <Paperclip className="size-3.5" /> Kelola Media
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewModalOpen(false)
                        setDeleteTarget(previewItem)
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition cursor-pointer"
                    >
                      <Trash2 className="size-3.5" /> Hapus
                    </button>
                  </div>
                </div>

                {/* Preview Body Scrollable */}
                <div className="p-6 space-y-4 overflow-y-auto text-xs text-slate-700 dark:text-slate-300">
                  {/* Status Banner Supervisi: Perlu Revisi */}
                  {previewItem.status_supervisi === 'perlu_revisi' && (
                    <div className="p-4 rounded-2xl border-2 border-rose-300 dark:border-rose-800 bg-gradient-to-r from-rose-50 via-pink-50/50 to-rose-50 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-rose-950/30">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-rose-500 text-white shrink-0 shadow-sm">
                          <AlertTriangle className="size-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <h4 className="font-extrabold text-xs text-rose-900 dark:text-rose-200 uppercase tracking-wider flex items-center gap-1.5">
                              Perlu Revisi dari {previewItem.supervisor_role || 'Kepala Sekolah / Divisi Pendidikan'}
                            </h4>
                            {previewItem.tanggal_supervisi && (
                              <span className="text-[11px] font-semibold text-rose-700/80 dark:text-rose-300/80">
                                {new Date(previewItem.tanggal_supervisi).toLocaleString('id-ID', {
                                  dateStyle: 'medium',
                                  timeStyle: 'short',
                                })}
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-xs text-rose-900 dark:text-rose-100 font-medium leading-relaxed bg-white/70 dark:bg-slate-900/60 p-3 rounded-xl border border-rose-200 dark:border-rose-800/60 whitespace-pre-line">
                            {previewItem.catatan_koreksi || 'Mohon perbaiki dan sesuaikan kembali materi ini.'}
                          </p>
                          {previewItem.supervisor?.name && (
                            <p className="mt-2 text-[11px] font-bold text-rose-800 dark:text-rose-300">
                              Penelaah: {previewItem.supervisor.name} ({previewItem.supervisor_role || 'Supervisor'})
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status Banner Supervisi: Disetujui */}
                  {previewItem.status_supervisi === 'disetujui' && (
                    <div className="p-3.5 rounded-2xl border border-emerald-300/80 bg-emerald-50/70 dark:bg-emerald-950/30 dark:border-emerald-800/70 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-xl bg-emerald-600 text-white shrink-0 shadow-xs">
                          <CheckCircle2 className="size-4" />
                        </div>
                        <div>
                          <p className="font-extrabold text-xs text-emerald-900 dark:text-emerald-200">
                            Materi Telah Disetujui &amp; Layak Ajar
                          </p>
                          <p className="text-[11px] text-emerald-700/90 dark:text-emerald-400">
                            Ditelaah oleh {previewItem.supervisor?.name || previewItem.supervisor_role || 'Kepala Sekolah / Divisi Pendidikan'}
                            {previewItem.tanggal_supervisi ? ` pada ${new Date(previewItem.tanggal_supervisi).toLocaleDateString('id-ID', { dateStyle: 'medium' })}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white shadow-2xs">
                        Layak KBM
                      </span>
                    </div>
                  )}

                  {/* Status Banner Supervisi: Menunggu Telaah */}
                  {previewItem.status_supervisi === 'diajukan' && (
                    <div className="p-3.5 rounded-2xl border border-amber-300/80 bg-amber-50/70 dark:bg-amber-950/30 dark:border-amber-800/70 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-xl bg-amber-500 text-white shrink-0 shadow-xs">
                          <Clock className="size-4" />
                        </div>
                        <div>
                          <p className="font-extrabold text-xs text-amber-900 dark:text-amber-200">
                            Sedang Menunggu Telaah
                          </p>
                          <p className="text-[11px] text-amber-700/90 dark:text-amber-400">
                            Materi telah diajukan ke Kepala Sekolah &amp; Divisi Pendidikan untuk ditinjau.
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white shadow-2xs">
                        Antrean Review
                      </span>
                    </div>
                  )}

                  {previewItem.ringkasan && (
                    <div className="p-3.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800/60">
                      <h4 className="font-bold text-[11px] uppercase tracking-wider text-[#0E5C44] dark:text-emerald-400 mb-1 flex items-center gap-1.5">
                        <Sparkles className="size-3.5" /> Ringkasan Singkat
                      </h4>
                      <p className="leading-relaxed">{previewItem.ringkasan}</p>
                    </div>
                  )}

                  {/* Video Pembelajaran Player */}
                  {previewItem.video && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-[11px] uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                        <Video className="size-3.5" /> Pemutar Video Pembelajaran (Embed)
                      </h4>
                      <VideoEmbedPlayer url={previewItem.video} title={`Video: ${previewItem.judul}`} />
                    </div>
                  )}

                  {/* Dokumen PDF Viewer */}
                  {previewItem.file && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-[11px] uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                        <FileText className="size-3.5" /> Pratinjau Dokumen PDF / Modul Digital
                      </h4>
                      <PdfDocumentViewer url={previewItem.file} title={`Dokumen: ${previewItem.judul}`} height="450px" />
                    </div>
                  )}

                  {/* Uraian Materi Lengkap */}
                  {previewItem.isi && (
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                      <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-500">Uraian Materi Lengkap</h4>
                      <div className="whitespace-pre-line leading-relaxed">{previewItem.isi}</div>
                    </div>
                  )}

                  {/* Catatan Guru */}
                  {previewItem.catatan && (
                    <div className="p-3.5 rounded-2xl border border-amber-200/80 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800/60">
                      <h4 className="font-bold text-[11px] uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                        <FileCode className="size-3.5" /> Catatan &amp; Instruksi Guru
                      </h4>
                      <p className="leading-relaxed">{previewItem.catatan}</p>
                    </div>
                  )}

                  {/* Link Eksternal */}
                  {previewItem.link && (
                    <div className="p-3.5 rounded-2xl border border-amber-300/80 bg-amber-50/70 dark:bg-amber-950/40 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <ExternalLink className="size-4 text-amber-700" />
                        <div>
                          <p className="font-bold text-xs text-amber-900 dark:text-amber-200">Tautan Referensi Eksternal</p>
                          <p className="text-[11px] text-amber-700 dark:text-amber-400 truncate max-w-sm">{previewItem.link}</p>
                        </div>
                      </div>
                      <a
                        href={previewItem.link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition"
                      >
                        Kunjungi Link
                      </a>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setPreviewModalOpen(false)}
                    className="px-5 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl text-xs font-bold hover:bg-slate-300 cursor-pointer"
                  >
                    Tutup Pratinjau
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── HARMONIZED BATCH IMPORT MODAL ── */}
        <AnimatePresence>
          {isImportModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#182232]"
              >
                <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600" />
                <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-blue-600 text-white p-2.5 shadow-md shadow-sky-500/30 border border-sky-300/30 shrink-0">
                      <Upload className="size-5 text-white" strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Import Materi Pembelajaran</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-300">
                          <Sparkles className="size-3" /> Batch Import
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Unggah berkas spreadsheet CSV untuk impor data materi secara massal.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4 text-xs text-slate-700 dark:text-slate-200">
                  {/* Unduh Format Berkas */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-sky-200/70 bg-gradient-to-r from-sky-50/50 via-teal-50/20 to-white p-4 dark:border-sky-800/50 dark:bg-slate-900/40">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 via-sky-600 to-blue-600 text-white border border-sky-300/30 shrink-0">
                        <Download className="size-4.5 text-white" strokeWidth={2.2} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Unduh Format Berkas</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Gunakan template resmi agar pemetaan kolom presisi</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-[#0E5C44] px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer"
                    >
                      <Download className="size-3.5" />
                      <span>Template CSV</span>
                    </button>
                  </div>

                  {/* Dropzone Upload */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      setImportDragging(true)
                    }}
                    onDragLeave={() => setImportDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setImportDragging(false)
                      const file = e.dataTransfer.files?.[0]
                      if (file) processImportFile(file)
                    }}
                    className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
                      importDragging
                        ? 'border-sky-500 bg-sky-50/40 dark:bg-sky-950/30'
                        : importFile
                        ? 'border-emerald-400 bg-emerald-50/30 dark:border-emerald-700 dark:bg-emerald-950/20'
                        : 'border-slate-300 hover:border-sky-400 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-900/50'
                    }`}
                    onClick={() => document.getElementById('materi-import-file-input')?.click()}
                  >
                    <input
                      id="materi-import-file-input"
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="flex size-12 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-600 mb-2">
                      <FileSpreadsheet className="size-6" />
                    </div>
                    {importFile ? (
                      <div>
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{importFile.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{(importFile.size / 1024).toFixed(1)} KB • Klik untuk ganti berkas</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          Tarik berkas ke sini atau <span className="text-sky-600 underline">pilih dari perangkat</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">Mendukung format .csv (Maks. 5MB)</p>
                      </div>
                    )}
                  </div>

                  {/* Mini Preview Datatable */}
                  {importPreviewData.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pratinjau Data Impor (5 baris pertama):</p>
                      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                        <TableRoot className="w-full text-left text-[11px]">
                          <TableHeader className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                            <TableRow>
                              <TableHead className="p-2">Judul Materi</TableHead>
                              <TableHead className="p-2">Tipe</TableHead>
                              <TableHead className="p-2">Ringkasan</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {importPreviewData.map((row, i) => (
                              <TableRow key={i}>
                                <TableCell className="p-2 font-semibold">{row.judul}</TableCell>
                                <TableCell className="p-2">{row.tipe}</TableCell>
                                <TableCell className="p-2 truncate max-w-xs">{row.ringkasan}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </TableRoot>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={!importFile || importLoading}
                    onClick={handleExecuteImport}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-blue-700 text-white px-5 py-2.5 text-xs font-extrabold border border-sky-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {importLoading ? <RefreshCw className="size-4 animate-spin" /> : <Upload className="size-4" />}
                    <span>{importLoading ? 'Mengimpor...' : 'Mulai Impor Berkas'}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── PRINT OPTION MODAL ── */}
        <PrintOptionModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title="Materi Pembelajaran"
          onPrint={() => {
            const rowsToPrint = Array.isArray(dataMateri) ? dataMateri : []
            printCleanTable({
              title: 'Laporan Data Materi Pembelajaran',
              subtitle: 'Daftar Materi Pembelajaran Sekolah Islam Terpadu',
              headers: ['NO', 'URUTAN', 'JUDUL MATERI', 'MODUL AJAR', 'TIPE', 'STATUS'],
              rows: rowsToPrint.map((row, i) => [
                i + 1,
                `#${row.urutan || 1}`,
                row.judul || '-',
                row.modul_ajar?.judul_modul || '-',
                row.tipe || '-',
                (row.status === 'aktif' || row.status === 'published') ? 'Aktif' : row.status === 'draft' ? 'Draft' : 'Nonaktif',
              ]),
            })
          }}
          onDownload={() => {
            const rowsToPrint = Array.isArray(dataMateri) ? dataMateri : []
            downloadPdfTable({
              title: 'Laporan Data Materi Pembelajaran',
              subtitle: 'Daftar Materi Pembelajaran Sekolah Islam Terpadu',
              headers: ['NO', 'URUTAN', 'JUDUL MATERI', 'MODUL AJAR', 'TIPE', 'STATUS'],
              rows: rowsToPrint.map((row, i) => [
                i + 1,
                `#${row.urutan || 1}`,
                row.judul || '-',
                row.modul_ajar?.judul_modul || '-',
                row.tipe || '-',
                (row.status === 'aktif' || row.status === 'published') ? 'Aktif' : row.status === 'draft' ? 'Draft' : 'Nonaktif',
              ]),
              filename: 'laporan_materi_pembelajaran.pdf',
            })
          }}
        />

        {/* ── HARMONIZED BATCH EXPORT MODAL ── */}
        <HarmonizedBatchExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onExport={handleExportSpreadsheet}
          isExporting={isExporting}
          totalCount={totalItems}
          moduleTitle="Materi Pembelajaran"
        />

        {/* ── HARMONIZED SUPERVISI & CATATAN KOREKSI MODAL ── */}
        <HarmonizedSupervisiModal
          isOpen={supervisiModalOpen}
          onClose={() => {
            setSupervisiModalOpen(false)
            setSupervisiTarget(null)
          }}
          item={supervisiTarget}
          onSubmit={supervisiMutation.mutate}
          isPending={supervisiMutation.isPending}
        />

        {/* ── HARMONIZED AJUKAN TELAAH MODAL ── */}
        <HarmonizedAjukanTelaahModal
          isOpen={ajukanModalOpen}
          onClose={() => {
            setAjukanModalOpen(false)
            setAjukanTarget(null)
          }}
          item={ajukanTarget}
          onSubmit={ajukanTelaahMutation.mutate}
          isPending={ajukanTelaahMutation.isPending}
        />

      </motion.div>
    </PageContainer>
  )
}
