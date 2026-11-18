import { useToast } from '../components/app/ToastProvider'
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'
import {
  Award,
  BookOpen,
  Calculator,
  Sliders,
  Sparkles,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  X,
  Layers,
  Users,
  FileSpreadsheet,
  Settings,
  ChevronDown,
  Info,
  Check,
  Printer,
  Download,
  Upload,
  FileText,
  BarChart2,
  GraduationCap,
  AlertTriangle,
  RotateCcw,
  School,
  Lock,
} from 'lucide-react'
import { Download as Download1, Upload as Upload1 } from 'lucide-react'
import { lmsPenilaianService } from '../services/lmsPenilaianService'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import ActionDropdown from '../components/app/ActionDropdown'
import { MasterFilterSelect, PrintOptionModal } from '../components/master-data'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import { downloadSpreadsheetTemplate } from '../utils/spreadsheetParser'
import { useDebounce } from '../hooks/useDebounce'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../components/ui/hover-card'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Pagination } from '../components/ui/pagination'
import { TableRoot, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

// ── TOAST NOTIFICATION STACK HOOK ──
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
            ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 dark:border-emerald-400 dark:bg-slate-800 dark:ring-emerald-400/20 text-slate-900 dark:text-white shadow-xs'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-400 dark:hover:border-slate-600 text-slate-800 dark:text-slate-100'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {IconComponent && (
            <IconComponent className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          )}
          {selectedOption && selectedOption.value !== '' ? (
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
            className="absolute left-0 right-0 top-full mt-1.5 z-[90] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 shadow-xl shadow-slate-900/10 dark:shadow-black/40"
          >
            {/* Search Input jika searchable */}
            {searchable && options.length > 5 && (
              <div className="p-1.5 border-b border-slate-100 dark:border-slate-700/60 mb-1">
                <div className="relative">
                  <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Ketik untuk mencari..."
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 pl-8 pr-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* List options */}
            <div className="max-h-56 overflow-y-auto space-y-0.5">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-3 text-center text-xs text-slate-400 dark:text-slate-500">
                  Tidak ada data yang cocok
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
                        setSearch('')
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors text-left cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60'
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
  popoverWidth = 'min-w-[200px]',
  searchable = false,
  ariaLabel = '',
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

  const hasValue = value !== '' && value !== undefined && value !== null

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => {
          setIsOpen((prev) => !prev)
          setSearch('')
        }}
        className={`h-9 sm:h-10 w-full sm:w-auto min-w-[140px] flex items-center justify-between gap-2 rounded-xl border px-3 text-xs font-semibold transition-all duration-200 cursor-pointer ${
          isOpen
            ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 dark:border-emerald-400 dark:bg-slate-800 dark:ring-emerald-400/20 text-slate-900 dark:text-white shadow-xs'
            : hasValue
            ? 'border-emerald-400/80 bg-emerald-50/80 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200 font-bold'
            : 'border-slate-300 dark:border-slate-700 bg-white text-slate-700 hover:border-emerald-400 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600'
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
            className={`absolute left-0 top-full mt-1.5 z-[90] ${popoverWidth} overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 shadow-xl shadow-slate-900/10 dark:shadow-black/40`}
          >
            {searchable && options.length > 5 && (
              <div className="p-1.5 border-b border-slate-100 dark:border-slate-700/60 mb-1">
                <div className="relative">
                  <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari..."
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 pl-8 pr-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div className="max-h-56 overflow-y-auto space-y-0.5">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-3 text-center text-xs text-slate-400 dark:text-slate-500">
                  Tidak ada data
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = String(opt.value) === String(value)
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => {
                        onChange(opt.value)
                        setIsOpen(false)
                        setSearch('')
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors text-left cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60'
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

// ── HARMONIZED BATCH EXPORT MODAL ──
function HarmonizedBatchExportModal({
  isOpen,
  onClose,
  onExport,
  isExporting,
  totalCount,
  moduleTitle = 'Rekap Nilai Akademik',
}) {
  const [exportFormat, setExportFormat] = useState('xlsx')

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-fadeIn"
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
                Data yang diekspor akan mencakup seluruh entitas terfilter ({totalCount} rekap nilai {moduleTitle.toLowerCase()}).
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

// ── HARMONIZED DELETE MODAL ──
function HarmonizedDeleteModal({ isOpen, onClose, onConfirm, item, isSubmitting }) {
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
                Konfirmasi Hapus Rekap Nilai
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            Apakah Anda yakin ingin menghapus data rekap penilaian siswa ini? Tindakan ini tidak dapat dibatalkan.
          </p>

          <div className="rounded-xl border border-rose-200/80 bg-rose-50/50 p-3.5 dark:border-rose-800/60 dark:bg-rose-950/20 mb-5">
            <p className="text-xs font-black text-rose-950 dark:text-rose-100">
              {item?.student?.full_name || 'Siswa'}
            </p>
            <p className="text-[11px] text-rose-800/80 dark:text-rose-300/80 mt-0.5">
              NIS: {item?.student?.nis || '-'} • Mapel: {item?.subject?.name || '-'} • Kelas: {item?.kelas?.nama_kelas || '-'}
            </p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-red-700 px-5 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/30 hover:brightness-105 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting && <RefreshCw className="h-4 w-4 animate-spin" />}
              <span>{isSubmitting ? 'Menghapus...' : 'Ya, Hapus Nilai'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
}

// ── MODERN KPI CARD TONES (Standard across EducationUnitsPage, LmsPenugasanPage, dll) ──
const MODERN_CARD_TONES = {
  emerald: {
    card: 'border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
    glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
    iconBox: 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm shadow-emerald-500/30',
    tag: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
    title: 'text-emerald-700 dark:text-emerald-400',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-slate-600 dark:text-slate-400',
    cta: 'text-emerald-700 dark:text-emerald-400',
  },
  sky: {
    card: 'border-sky-300/70 bg-gradient-to-br from-sky-50 via-blue-50/60 to-white hover:border-sky-400 dark:border-sky-700/50 dark:from-sky-950/40 dark:via-blue-950/20 dark:to-slate-900',
    glow: 'bg-sky-400/20 group-hover:bg-sky-400/30',
    iconBox: 'bg-gradient-to-br from-sky-500 to-blue-600 shadow-sm shadow-sky-500/30',
    tag: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300',
    title: 'text-sky-700 dark:text-sky-400',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-slate-600 dark:text-slate-400',
    cta: 'text-sky-700 dark:text-sky-400',
  },
  rose: {
    card: 'border-rose-300/70 bg-gradient-to-br from-rose-50 via-pink-50/60 to-white hover:border-rose-400 dark:border-rose-700/50 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-slate-900',
    glow: 'bg-rose-400/20 group-hover:bg-rose-400/30',
    iconBox: 'bg-gradient-to-br from-rose-500 to-red-600 shadow-sm shadow-rose-500/30',
    tag: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300',
    title: 'text-rose-700 dark:text-rose-400',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-slate-600 dark:text-slate-400',
    cta: 'text-rose-700 dark:text-rose-400',
  },
  purple: {
    card: 'border-purple-300/70 bg-gradient-to-br from-purple-50 via-violet-50/60 to-white hover:border-purple-400 dark:border-purple-700/50 dark:from-purple-950/40 dark:via-violet-950/20 dark:to-slate-900',
    glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
    iconBox: 'bg-gradient-to-br from-purple-500 to-violet-600 shadow-sm shadow-purple-500/30',
    tag: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300',
    title: 'text-purple-700 dark:text-purple-400',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-slate-600 dark:text-slate-400',
    cta: 'text-purple-700 dark:text-purple-400',
  },
  amber: {
    card: 'border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
    glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
    iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-sm shadow-amber-500/30',
    tag: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
    title: 'text-amber-700 dark:text-amber-400',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-slate-600 dark:text-slate-400',
    cta: 'text-amber-700 dark:text-amber-400',
  },
}

// ── MODERN KPI CARD COMPONENT ──
function ModernKpiCard({ icon: Icon, label, subtext, value, tag, ctaText = 'Rincian Data', tone = 'emerald', onClick }) {
  const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
  const isClickable = typeof onClick === 'function'

  return (
    <motion.article
      whileHover={isClickable ? { scale: 1.02, y: -2 } : undefined}
      whileTap={isClickable ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={`group relative overflow-hidden rounded-[18px] border-2 p-4 sm:p-5 shadow-xs transition-[border-color,box-shadow] duration-150 text-left flex flex-col justify-between h-full ${
        isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
      } ${t.card}`}
    >
      <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all ${t.glow}`} />

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${t.iconBox}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className={`text-[11px] font-bold uppercase tracking-wider ${t.title}`}>{label}</p>
            </div>
          </div>
          {tag && (
            <span className={`rounded-lg px-2.5 py-0.5 text-[10px] font-extrabold ${t.tag}`}>
              {tag}
            </span>
          )}
        </div>

        <p className={`text-3xl sm:text-4xl font-black tabular-nums tracking-tight ${t.val}`}>
          {value ?? '0'}
        </p>
        {subtext && (
          <p className={`mt-1 text-[11px] font-semibold ${t.sub}`}>
            {subtext}
          </p>
        )}
      </div>

      {isClickable && (
        <div className={`mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-bold ${t.cta}`}>
          <span>{ctaText}</span>
          <span className="inline-flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
            Detail &rarr;
          </span>
        </div>
      )}
    </motion.article>
  )
}

export default function LmsPenilaianPage({ embedded = false, hideBreadcrumb = false, hidePageHeader = false, tabNav = null }) {
  // User Auth & Teacher Scoping
  const user = useAuthStore((state) => state.user)
  const userRoles = useMemo(() => {
    if (!user?.roles) return []
    return user.roles.map((r) => (typeof r === 'string' ? r : r.name || r.role_name || ''))
  }, [user])

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
  const [selectedUnit, setSelectedUnit] = useState(canSelectUnit ? '' : (userUnitId ? String(userUnitId) : ''))

  const isTeacherOnly = useMemo(() => {
    if (isSupervisor) return false
    const rList = userRoles.map((r) => r.toLowerCase())
    const mainRole = String(user?.role || '').toLowerCase()
    return (
      rList.some((r) => r.includes('guru') || r.includes('wali_kelas') || r.includes('wali kelas')) ||
      mainRole.includes('guru')
    )
  }, [isSupervisor, userRoles, user?.role])

  const [dataList, setDataList] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })
  const [stats, setStats] = useState({
    total_siswa: 0,
    total_lulus: 0,
    total_remedial: 0,
    persentase_kelulusan: 0,
    rata_nilai_akhir: 0,
    rata_assignment: 0,
    rata_cbt: 0,
    grade_distribution: { A: 0, B: 0, C: 0, D: 0 },
  })
  const [options, setOptions] = useState({
    units: [],
    kelas: [],
    subjects: [],
    semesters: [],
    default_formula: {
      bobot_tugas: 20.0,
      bobot_uh: 25.0,
      bobot_uts: 25.0,
      bobot_uas: 30.0,
      nilai_kkm: 75.0,
    },
  })

  // Full-width Search with Debounce
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 350)

  const [filters, setFilters] = useState({
    kelas_id: '',
    subject_id: '',
    semester_id: '',
    is_passed: '',
  })

  // Options for HeroUI Selects
  const filterUnitOptions = useMemo(() => [
    { value: '', label: `Semua Unit (${(options.units || []).length || 'SIT'})` },
    ...(options.units || []).map((u) => ({
      value: String(u.id),
      label: u.name || u.nama_unit,
    })),
  ], [options.units])

  const filterKelasOptions = useMemo(() => [
    { value: '', label: 'Semua Kelas' },
    ...(options.kelas || []).map((k) => ({
      value: String(k.id),
      label: k.nama_kelas,
    })),
  ], [options.kelas])

  const filterSubjectOptions = useMemo(() => [
    { value: '', label: 'Semua Mata Pelajaran' },
    ...(options.subjects || []).map((s) => ({
      value: String(s.id),
      label: s.name,
    })),
  ], [options.subjects])

  const filterSemesterOptions = useMemo(() => [
    { value: '', label: 'Semua Semester' },
    ...(options.semesters || []).map((s) => ({
      value: String(s.id),
      label: s.nama_semester,
    })),
  ], [options.semesters])

  const filterIsPassedOptions = useMemo(() => [
    { value: '', label: 'Semua Status KKM' },
    { value: '1', label: 'Tuntas KKM' },
    { value: '0', label: 'Perlu Remedial' },
  ], [])

  const modalSubjectOptions = useMemo(() => [
    { value: '', label: 'Pilih Mata Pelajaran' },
    ...(options.subjects || []).map((s) => ({
      value: String(s.id),
      label: s.name,
    })),
  ], [options.subjects])

  const modalKelasOptions = useMemo(() => [
    { value: '', label: 'Pilih Kelas' },
    ...(options.kelas || []).map((k) => ({
      value: String(k.id),
      label: k.nama_kelas,
    })),
  ], [options.kelas])

  const modalSemesterOptions = useMemo(() => [
    { value: '', label: 'Pilih Semester' },
    ...(options.semesters || []).map((s) => ({
      value: String(s.id),
      label: s.nama_semester,
    })),
  ], [options.semesters])

  // Configurable Weights Engine State
  const [weights, setWeights] = useState({
    bobot_tugas: 20.0,
    bobot_uh: 25.0,
    bobot_uts: 25.0,
    bobot_uas: 30.0,
    nilai_kkm: 75.0,
  })
  const [showConfigPanel, setShowConfigPanel] = useState(false)
  const [calculating, setCalculating] = useState(false)

  // Modals State
  const [showModal, setShowModal] = useState(false)
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [viewingItem, setViewingItem] = useState(null)
  const { items: toastList, push: pushToast, dismiss: dismissToast } = useNotifications()
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Card Drill-Down Modal State
  const [cardModal, setCardModal] = useState({
    isOpen: false,
    statusKey: 'semua',
    title: '',
    tone: 'emerald',
    searchQuery: '',
    page: 1,
  })

  // Print Filter & Student Selection Modal State
  const [isPrintFilterModalOpen, setIsPrintFilterModalOpen] = useState(false)
  const [selectedStudentIds, setSelectedStudentIds] = useState([])
  const [selectedScoreFields, setSelectedScoreFields] = useState({
    assignment: true,
    uh: true,
    uts: true,
    uas: true,
    final: true,
    grade: true,
    status: true,
  })
  const [printSearchQuery, setPrintSearchQuery] = useState('')

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const importInputRef = useRef(null)

  const getRowId = useCallback((r, idx) => r.id ?? r.student_id ?? r.student?.id ?? `row-${idx}`, [])

  const openPrintFilterModal = () => {
    setSelectedStudentIds(dataList.map((r, idx) => getRowId(r, idx)))
    setPrintSearchQuery('')
    setIsPrintFilterModalOpen(true)
  }

  const filteredPrintStudents = useMemo(() => {
    if (!printSearchQuery.trim()) return dataList
    const q = printSearchQuery.toLowerCase().trim()
    return dataList.filter((r) => {
      const name = (r.student?.full_name || '').toLowerCase()
      const nis = (r.student?.nis || '').toLowerCase()
      const mapel = (r.subject?.name || '').toLowerCase()
      const kelas = (r.kelas?.nama_kelas || '').toLowerCase()
      return name.includes(q) || nis.includes(q) || mapel.includes(q) || kelas.includes(q)
    })
  }, [dataList, printSearchQuery])

  const handleSelectAllStudents = () => {
    if (printSearchQuery.trim()) {
      const idsToAdd = filteredPrintStudents.map((r, idx) => getRowId(r, idx))
      setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...idsToAdd])))
    } else {
      setSelectedStudentIds(dataList.map((r, idx) => getRowId(r, idx)))
    }
  }

  const handleDeselectAllStudents = () => {
    if (printSearchQuery.trim()) {
      const idsToRemove = new Set(filteredPrintStudents.map((r, idx) => getRowId(r, idx)))
      setSelectedStudentIds((prev) => prev.filter((id) => !idsToRemove.has(id)))
    } else {
      setSelectedStudentIds([])
    }
  }

  const handleTogglePrintStudent = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleToggleScoreField = (field) => {
    setSelectedScoreFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handleExecutePrint = (format = 'print') => {
    let targetList = dataList.filter((r, idx) => selectedStudentIds.includes(getRowId(r, idx)))
    if (targetList.length === 0) {
      targetList = dataList
    }

    const columns = [
      { title: 'No', render: (_, idx) => idx + 1 },
      { title: 'NIS', render: (r) => r.student?.nis || '-' },
      { title: 'Nama Siswa', render: (r) => r.student?.full_name || '-' },
      { title: 'Mapel', render: (r) => r.subject?.name || '-' },
      { title: 'Kelas', render: (r) => r.kelas?.nama_kelas || '-' },
    ]

    if (selectedScoreFields.assignment) {
      columns.push({ title: 'N. Tugas', render: (r) => r.score_assignment ?? 0 })
    }
    if (selectedScoreFields.uh) {
      columns.push({ title: 'CBT UH', render: (r) => r.score_quiz ?? 0 })
    }
    if (selectedScoreFields.uts) {
      columns.push({ title: 'CBT UTS', render: (r) => r.score_midterm ?? 0 })
    }
    if (selectedScoreFields.uas) {
      columns.push({ title: 'CBT UAS', render: (r) => r.score_final ?? 0 })
    }
    if (selectedScoreFields.final) {
      columns.push({ title: 'Nilai Akhir', render: (r) => r.final_score ?? 0 })
    }
    if (selectedScoreFields.grade) {
      columns.push({ title: 'Grade', render: (r) => r.grade_letter || '-' })
    }
    if (selectedScoreFields.status) {
      columns.push({ title: 'Status KKM', render: (r) => (r.is_passed ? 'TUNTAS' : 'REMEDIAL') })
    }

    if (format === 'print') {
      printCleanTable({
        title: 'Laporan Rekap Buku Nilai Akademik',
        subtitle: `Dicetak ${targetList.length} Siswa | Dareliman Edu`,
        columns,
        data: targetList,
      })
    } else if (format === 'pdf') {
      downloadPdfTable({
        filename: 'rekap-buku-nilai-terpilih.pdf',
        title: 'Laporan Rekap Buku Nilai Akademik',
        subtitle: `Dicetak ${targetList.length} Siswa | Dareliman Edu`,
        columns,
        data: targetList,
      })
    } else if (format === 'csv') {
      exportDatatable(targetList, 'csv')
    }

    setIsPrintFilterModalOpen(false)
  }

  const openCardModal = (statusKey, label, tone) => {
    setCardModal({
      isOpen: true,
      statusKey,
      title: `Rincian Data Siswa — ${label}`,
      tone,
      searchQuery: '',
      page: 1,
    })
  }

  const closeCardModal = () => {
    setCardModal((prev) => ({ ...prev, isOpen: false }))
  }

  const modalRows = useMemo(() => {
    if (!cardModal.isOpen) return []
    let list = [...dataList]

    if (cardModal.statusKey === '1') {
      list = list.filter((r) => r.is_passed)
    } else if (cardModal.statusKey === '0') {
      list = list.filter((r) => !r.is_passed)
    }

    if (cardModal.searchQuery.trim()) {
      const q = cardModal.searchQuery.toLowerCase().trim()
      list = list.filter((r) => {
        const name = (r.student?.full_name || '').toLowerCase()
        const nis = (r.student?.nis || '').toLowerCase()
        const mapel = (r.subject?.name || '').toLowerCase()
        const kelas = (r.kelas?.nama_kelas || '').toLowerCase()
        return name.includes(q) || nis.includes(q) || mapel.includes(q) || kelas.includes(q)
      })
    }
    return list
  }, [dataList, cardModal.isOpen, cardModal.statusKey, cardModal.searchQuery])

  const MODAL_PAGE_SIZE = 5
  const modalTotalPages = Math.max(1, Math.ceil(modalRows.length / MODAL_PAGE_SIZE))
  const paginatedModalRows = useMemo(() => {
    return modalRows.slice((cardModal.page - 1) * MODAL_PAGE_SIZE, cardModal.page * MODAL_PAGE_SIZE)
  }, [modalRows, cardModal.page])

  // Form Data
  const [formData, setFormData] = useState({
    student_id: '',
    subject_id: '',
    semester_id: '',
    kelas_id: '',
    score_assignment: 0,
    score_quiz: 0,
    score_midterm: 0,
    score_final: 0,
    bobot_tugas: 20,
    bobot_uh: 25,
    bobot_uts: 25,
    bobot_uas: 30,
    nilai_kkm: 75,
    notes: '',
  })

  useEffect(() => {
    fetchStats()
    fetchOptions()
  }, [])

  useEffect(() => {
    fetchData(1)
  }, [debouncedSearch, filters, selectedUnit, userUnitId])

  const fetchData = async (page = 1) => {
    setLoading(true)
    try {
      const effectiveUnit = canSelectUnit ? (selectedUnit || undefined) : (userUnitId || undefined)
      const params = {
        page,
        per_page: 10,
        search: debouncedSearch || undefined,
        unit_pendidikan_id: effectiveUnit,
        kelas_id: filters.kelas_id || undefined,
        subject_id: filters.subject_id || undefined,
        semester_id: filters.semester_id || undefined,
        is_passed: filters.is_passed !== '' ? filters.is_passed : undefined,
      }
      const response = await lmsPenilaianService.getDaftar(params)
      if (response && response.data) {
        setDataList(response.data)
        setPagination({
          currentPage: response.meta?.current_page || 1,
          lastPage: response.meta?.last_page || 1,
          total: response.meta?.total || response.data.length,
        })
      }
    } catch (error) {
      console.error('Error loading Penilaian data:', error)
      pushToast('Pemberitahuan', 'Gagal memuat data Penilaian', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const effectiveUnit = canSelectUnit ? (selectedUnit || undefined) : (userUnitId || undefined)
      const params = {
        search: debouncedSearch || undefined,
        unit_pendidikan_id: effectiveUnit,
        kelas_id: filters.kelas_id || undefined,
        subject_id: filters.subject_id || undefined,
        semester_id: filters.semester_id || undefined,
        is_passed: filters.is_passed !== '' ? filters.is_passed : undefined,
      }
      const response = await lmsPenilaianService.getStats(params)
      if (response && response.data) setStats(response.data)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const fetchOptions = async () => {
    try {
      const response = await lmsPenilaianService.getOptions()
      if (response && response.data) {
        setOptions(response.data)
        if (response.data.default_formula) {
          setWeights(response.data.default_formula)
        }
      }
    } catch (error) {
      console.error('Error loading options:', error)
    }
  }

  const handleRunAutoCalculation = async () => {
    if (!filters.kelas_id || !filters.subject_id || !filters.semester_id) {
      pushToast('Filter Diperlukan', 'Silakan pilih Kelas, Mata Pelajaran, dan Semester terlebih dahulu pada filter.', 'warning')
      return
    }

    setCalculating(true)
    try {
      const payload = {
        kelas_id: filters.kelas_id,
        subject_id: filters.subject_id,
        semester_id: filters.semester_id,
        ...weights,
      }
      const response = await lmsPenilaianService.calculateAuto(payload)
      if (response && response.data) {
        pushToast('Kalkulasi Berhasil', response.message || 'Auto-kalkulasi nilai CBT + Penugasan berhasil!')
        fetchData(1)
        fetchStats()
      }
    } catch (error) {
      console.error('Auto calculation error:', error)
      const errorMsg = error.response?.data?.message || 'Gagal melakukan kalkulasi nilai otomatis.'
      pushToast('Kalkulasi Gagal', errorMsg, 'error')
    } finally {
      setCalculating(false)
    }
  }

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        student_id: item.student_id || '',
        subject_id: item.subject_id || '',
        semester_id: item.semester_id || '',
        kelas_id: item.kelas_id || '',
        score_assignment: item.score_assignment || 0,
        score_quiz: item.score_quiz || 0,
        score_midterm: item.score_midterm || 0,
        score_final: item.score_final || 0,
        bobot_tugas: item.weights_config?.bobot_tugas || 20,
        bobot_uh: item.weights_config?.bobot_uh || 25,
        bobot_uts: item.weights_config?.bobot_uts || 25,
        bobot_uas: item.weights_config?.bobot_uas || 30,
        nilai_kkm: item.weights_config?.nilai_kkm || 75,
        notes: item.notes || '',
      })
    } else {
      setEditingItem(null)
      setFormData({
        student_id: '',
        subject_id: options.subjects.length > 0 ? options.subjects[0].id : '',
        semester_id: options.semesters.length > 0 ? options.semesters[0].id : '',
        kelas_id: options.kelas.length > 0 ? options.kelas[0].id : '',
        score_assignment: 80,
        score_quiz: 85,
        score_midterm: 85,
        score_final: 90,
        bobot_tugas: weights.bobot_tugas,
        bobot_uh: weights.bobot_uh,
        bobot_uts: weights.bobot_uts,
        bobot_uas: weights.bobot_uas,
        nilai_kkm: weights.nilai_kkm,
        notes: '',
      })
    }
    setShowModal(true)
  }

  // Submit form trigger confirmation dialog
  const handleFormSubmit = (e) => {
    e.preventDefault()
    setShowSaveConfirmDialog(true)
  }

  const executeSave = async () => {
    setIsSaving(true)
    try {
      if (editingItem) {
        await lmsPenilaianService.update(editingItem.id, formData)
        pushToast('Berhasil', 'Manual override nilai siswa berhasil diperbarui!')
      } else {
        await lmsPenilaianService.create(formData)
        pushToast('Berhasil', 'Rekap penilaian siswa baru berhasil disimpan!')
      }
      setShowSaveConfirmDialog(false)
      setShowModal(false)
      fetchData(pagination.currentPage)
      fetchStats()
    } catch (error) {
      console.error('Error saving grade:', error)
      const errorMsg = error.response?.data?.message || 'Gagal menyimpan nilai.'
      pushToast('Gagal Menyimpan', errorMsg, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRequestDelete = (item) => {
    setDeleteTarget(item)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await lmsPenilaianService.delete(deleteTarget.id)
      pushToast('Nilai Dihapus', 'Rekap nilai siswa berhasil dihapus!', 'success')
      setDeleteTarget(null)
      fetchData(pagination.currentPage)
      fetchStats()
    } catch (error) {
      console.error('Error deleting item:', error)
      pushToast('Gagal Menghapus', 'Gagal menghapus rekap nilai.', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExportSpreadsheet = async (format) => {
    setIsExporting(true)
    try {
      const exportColumns = [
        { header: 'No', key: 'no', width: 6 },
        { header: 'NIS', key: 'nis', width: 15 },
        { header: 'Nama Siswa', key: 'nama', width: 30 },
        { header: 'Kelas', key: 'kelas', width: 16 },
        { header: 'Mata Pelajaran', key: 'mapel', width: 25 },
        { header: 'Semester', key: 'semester', width: 16 },
        { header: 'N. Tugas', key: 'tugas', width: 12 },
        { header: 'CBT UH', key: 'uh', width: 12 },
        { header: 'CBT UTS', key: 'uts', width: 12 },
        { header: 'CBT UAS', key: 'uas', width: 12 },
        { header: 'Nilai Akhir', key: 'final', width: 14 },
        { header: 'Predikat', key: 'grade', width: 12 },
        { header: 'Status Kelulusan', key: 'status', width: 18 },
      ]

      const rows = dataList.map((r, idx) => ({
        no: idx + 1,
        nis: r.student?.nis || '-',
        nama: r.student?.full_name || '-',
        kelas: r.kelas?.nama_kelas || '-',
        mapel: r.subject?.name || '-',
        semester: r.semester?.nama_semester || '-',
        tugas: r.score_assignment ?? 0,
        uh: r.score_quiz ?? 0,
        uts: r.score_midterm ?? 0,
        uas: r.score_final ?? 0,
        final: r.final_score ?? 0,
        grade: r.grade_letter || '-',
        status: r.is_passed ? 'Tuntas KKM' : 'Perlu Remedial',
      }))

      await downloadSpreadsheetTemplate({
        format,
        filename: `Rekap_Nilai_Akademik_${new Date().toISOString().slice(0, 10)}`,
        sheetName: 'Rekap Nilai',
        columns: exportColumns,
        data: rows,
      })

      pushToast('Export Berhasil', `Data nilai berhasil diekspor dalam format .${format}`, 'success')
      setIsExportModalOpen(false)
    } catch (err) {
      console.error('Export error:', err)
      pushToast('Export Gagal', 'Terjadi kesalahan saat mengekspor data.', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const totalWeightSum = weights.bobot_tugas + weights.bobot_uh + weights.bobot_uts + weights.bobot_uas

  const getGradeBadge = (letter) => {
    switch (letter) {
      case 'A':
        return <Badge color="success" size="sm">Predikat A</Badge>
      case 'B':
        return <Badge color="blue" size="sm">Predikat B</Badge>
      case 'C':
        return <Badge color="warning" size="sm">Predikat C</Badge>
      case 'D':
      case 'E':
        return <Badge color="error" size="sm">Predikat D</Badge>
      default:
        return <Badge color="gray" size="sm">{letter}</Badge>
    }
  }

  // Export helpers
  const exportDatatable = (rowsToExport, format = 'csv', filename = 'rekap-buku-nilai') => {
    if (!rowsToExport || rowsToExport.length === 0) return

    const exportColumns = [
      { label: 'No', export: (_, idx) => idx + 1 },
      { label: 'NIS', export: (r) => r.student?.nis || '-' },
      { label: 'Nama Siswa', export: (r) => r.student?.full_name || '-' },
      { label: 'Mata Pelajaran', export: (r) => r.subject?.name || '-' },
      { label: 'Kelas', export: (r) => r.kelas?.nama_kelas || '-' },
      { label: 'Semester', export: (r) => r.semester?.nama_semester || '-' },
      { label: 'Nilai Penugasan', export: (r) => r.score_assignment ?? 0 },
      { label: 'CBT UH', export: (r) => r.score_quiz ?? 0 },
      { label: 'CBT UTS', export: (r) => r.score_midterm ?? 0 },
      { label: 'CBT UAS', export: (r) => r.score_final ?? 0 },
      { label: 'Nilai Akhir', export: (r) => r.final_score ?? 0 },
      { label: 'Grade', export: (r) => r.grade_letter || '-' },
      { label: 'Status KKM', export: (r) => (r.is_passed ? 'TUNTAS KKM' : 'REMEDIAL') },
      { label: 'Catatan Guru', export: (r) => r.notes || '-' },
    ]

    const escape = (val) => `"${String(val ?? '').replaceAll('"', '""')}"`
    const headerLine = exportColumns.map((col) => escape(col.label)).join(',')
    const dataLines = rowsToExport.map((row, idx) => exportColumns.map((col) => escape(col.export(row, idx))).join(','))
    const fileContent = `\uFEFF${[headerLine, ...dataLines].join('\n')}`

    let mimeType = 'text/csv;charset=utf-8'
    let ext = '.csv'
    if (format === 'xlsx') {
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ext = '.xlsx'
    } else if (format === 'xls') {
      mimeType = 'application/vnd.ms-excel'
      ext = '.xls'
    }

    const blob = new Blob([fileContent], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}${ext}`
    link.click()
    URL.revokeObjectURL(url)
  }

  // 5 KPI Cards calculation
  const cards = useMemo(() => {
    const totalSiswa = stats.total_siswa || pagination.total || dataList.length || 0
    const passPercent = stats.persentase_kelulusan ?? (totalSiswa > 0 ? ((stats.total_lulus || 0) / totalSiswa) * 100 : 0)
    const remedPercent = totalSiswa > 0 ? ((stats.total_remedial || 0) / totalSiswa) * 100 : 0

    return [
      {
        label: 'Rata-rata Nilai',
        statusKey: 'semua',
        value: stats.rata_nilai_akhir || 0,
        icon: Award,
        tone: 'emerald',
        percent: 100,
        subText: 'Skor Akhir Terkalkulasi',
      },
      {
        label: 'Tingkat Lulus KKM',
        statusKey: '1',
        value: stats.total_lulus || 0,
        icon: CheckCircle2,
        tone: 'sky',
        percent: Number(passPercent),
        subText: `${stats.total_lulus || 0} Siswa Tuntas`,
      },
      {
        label: 'Perlu Remedial',
        statusKey: '0',
        value: stats.total_remedial || 0,
        icon: XCircle,
        tone: 'rose',
        percent: Number(remedPercent),
        subText: 'Di Bawah KKM',
      },
      {
        label: 'Rata-rata CBT',
        statusKey: 'semua',
        value: stats.rata_cbt || 0,
        icon: Layers,
        tone: 'purple',
        percent: 100,
        subText: 'Ujian CBT Online',
      },
      {
        label: 'Rata-rata Tugas',
        statusKey: 'semua',
        value: stats.rata_assignment || 0,
        icon: FileSpreadsheet,
        tone: 'amber',
        percent: 100,
        subText: 'Tugas LMS',
      },
    ]
  }, [stats, pagination.total, dataList.length])

  // Recharts Bar Data
  const trendChartData = useMemo(() => [
    { name: 'Tugas LMS', nilai: Number(stats.rata_assignment || 0), fill: '#059669' },
    { name: 'CBT UH', nilai: Number(stats.rata_cbt || 0), fill: '#2563eb' },
    { name: 'CBT UTS', nilai: Number(stats.rata_midterm != null ? stats.rata_midterm : stats.rata_cbt || 0).toFixed(1), fill: '#7c3aed' },
    { name: 'CBT UAS', nilai: Number(stats.rata_final != null ? stats.rata_final : stats.rata_cbt || 0).toFixed(1), fill: '#d97706' },
    { name: 'Rata Akhir', nilai: Number(stats.rata_nilai_akhir || 0), fill: '#059669' },
  ], [stats])

  // Recharts Pie Data
  const pieChartData = useMemo(() => {
    const gradeDist = stats.grade_distribution || { A: 0, B: 0, C: 0, D: 0 }
    const list = [
      { name: 'Predikat A', value: gradeDist.A || 0, color: '#059669' },
      { name: 'Predikat B', value: gradeDist.B || 0, color: '#2563eb' },
      { name: 'Predikat C', value: gradeDist.C || 0, color: '#d97706' },
      { name: 'Predikat D/E', value: gradeDist.D || 0, color: '#e11d48' },
    ]
    const filtered = list.filter((i) => i.value > 0)
    if (filtered.length === 0) {
      return [
        { name: 'Tuntas KKM', value: stats.total_lulus || 0, color: '#059669' },
        { name: 'Remedial', value: stats.total_remedial || 0, color: '#e11d48' },
      ]
    }
    return filtered
  }, [stats])

  const hasActiveFilters = Boolean(
    (canSelectUnit && selectedUnit) || search || filters.kelas_id || filters.subject_id || filters.semester_id || filters.is_passed !== ''
  )

  const handleResetFilters = () => {
    if (canSelectUnit) setSelectedUnit('')
    setSearch('')
    setFilters({
      kelas_id: '',
      subject_id: '',
      semester_id: '',
      is_passed: '',
    })
  }

  if (!embedded && isTeacherOnly) {
    return <Navigate to="/portal-guru/workspace?tab=penilaian" replace />
  }

  return (
    <PageContainer maxW="7xl">
      {!(embedded || hideBreadcrumb) && (
        <div className="mb-4">
          <AppBreadcrumb
            items={[
              { label: 'LMS & Akademik', href: '/dashboard' },
              { label: 'Penilaian Pembelajaran & Nilai Akhir' },
            ]}
          />
        </div>
      )}
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-12">
        {/* ── MODERN VIVID EMERALD HERO HEADER CARD ── */}
        {!embedded && !hidePageHeader && (
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden"
          >
            {/* Dual Multi-Tone Ambient Glow Blobs */}
            <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4 min-w-0">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                  <Award className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                      Penilaian &amp; Rekap Buku Nilai
                    </h1>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                      <Sparkles className="h-3.5 w-3.5" />
                      LMS &amp; Nilai Rapor
                    </span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 w-full leading-relaxed">
                    Kalkulasi nilai akhir terpadu dari Penugasan dan Ujian CBT dengan bobot formula adaptif, cetak transkrip, dan analisis KKM.
                  </p>
                </div>
              </div>

              {/* Right Feature Indicator Badge */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 px-3.5 py-1.5 text-xs font-black text-emerald-900 dark:border-emerald-700 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs">
                  <Calculator className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Auto-Kalkulasi Nilai</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── 5-Card KPI Summary Grid (ModernKpiCard Standard) ── */}
        <motion.div variants={itemVariants}>
          {/* Mobile: 2 kolom, tablet: 3 kolom, desktop: 5 kolom */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {cards.map(({ label, statusKey, value, icon, tone, percent, subText }) => (
              <ModernKpiCard
                key={label}
                icon={icon}
                label={label}
                value={typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(1) : String(value)}
                tag={`${percent.toFixed(1)}%`}
                subtext={subText}
                ctaText="Lihat Rincian"
                tone={tone}
                onClick={() => openCardModal(statusKey, label, tone)}
              />
            ))}
          </div>
        </motion.div>

        {/* ── Optional External Tab Nav ── */}
        {tabNav && (
          <motion.div variants={itemVariants}>
            {typeof tabNav === 'function' ? tabNav(null) : tabNav}
          </motion.div>
        )}

        {/* ── Configurable Formula & Weights Control Panel ── */}
        <AnimatePresence>
          {showConfigPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-900/50 pb-3">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25">
                      <Settings className="w-4 h-4" />
                    </div>
                    Pengaturan Bobot Rumus Penilaian (Nilai Akhir)
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      totalWeightSum === 100
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    Total Bobot: {totalWeightSum}% {totalWeightSum === 100 ? '✓ (Ideal 100%)' : '(Disarankan 100%)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Bobot Penugasan (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={weights.bobot_tugas}
                      onChange={(e) => setWeights((prev) => ({ ...prev, bobot_tugas: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Bobot CBT UH (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={weights.bobot_uh}
                      onChange={(e) => setWeights((prev) => ({ ...prev, bobot_uh: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Bobot CBT UTS (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={weights.bobot_uts}
                      onChange={(e) => setWeights((prev) => ({ ...prev, bobot_uts: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Bobot CBT UAS (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={weights.bobot_uas}
                      onChange={(e) => setWeights((prev) => ({ ...prev, bobot_uas: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Batas KKM Lulus</label>
                    <input
                      type="number"
                      step="0.5"
                      value={weights.nilai_kkm}
                      onChange={(e) => setWeights((prev) => ({ ...prev, nilai_kkm: parseFloat(e.target.value) || 75.0 }))}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono italic">
                    Rumus: Nilai Akhir = ({weights.bobot_tugas}% * Tugas) + ({weights.bobot_uh}% * UH) + ({weights.bobot_uts}% * UTS) + ({weights.bobot_uas}% * UAS)
                  </p>
                  <button
                    type="button"
                    onClick={handleRunAutoCalculation}
                    disabled={calculating}
                    className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
                  >
                    {calculating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                    Jalankan Auto-Kalkulasi CBT + Penugasan
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 2-Column Equal Grid Visual Analytics Section (Identical with EducationUnitsPage) ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
          {/* Grafik 1: Analisis Skor Rata-rata Komponen */}
          <article className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-emerald-200/90 dark:border-emerald-800/60">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20 shrink-0">
                    <BarChart2 className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Analisis Skor Rata-rata
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Perbandingan rata-rata capaian Tugas LMS, CBT UH, UTS, dan UAS
                    </p>
                  </div>
                </div>
                <Badge color="success" size="sm">
                  Rata-rata: {stats.rata_nilai_akhir || 0}
                </Badge>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700 }} stroke="#94A3B8" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fontWeight: 700 }} stroke="#94A3B8" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="rounded-xl border border-slate-800 bg-slate-900/95 p-3 text-white shadow-xl backdrop-blur-sm">
                              <p className="text-xs font-bold text-emerald-400 mb-0.5">{data.name}</p>
                              <p className="text-xs font-extrabold">Skor Rata-rata: {data.nilai}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey="nilai" name="Skor Rata-rata" radius={[6, 6, 0, 0]} maxBarSize={44}>
                      {trendChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>Distribusi skor per instrumen penilaian</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Terupdate Otomatis</span>
            </div>
          </article>

          {/* Grafik 2: Distribusi Predikat Nilai Siswa */}
          <article className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-emerald-200/90 dark:border-emerald-800/60">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 text-white shadow-md shadow-amber-500/20 shrink-0">
                    <Award className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Distribusi Predikat &amp; KKM
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Proporsi siswa tuntas KKM dan sebaran grade akhir
                    </p>
                  </div>
                </div>
                <Badge color="blue" size="sm">
                  {pagination.total || dataList.length} Rekap Siswa
                </Badge>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`pie-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="rounded-xl border border-slate-800 bg-slate-900/95 p-3 text-white shadow-xl backdrop-blur-sm">
                              <p className="text-xs font-bold text-amber-400 mb-0.5">{data.name}</p>
                              <p className="text-xs font-extrabold">Jumlah: {data.value} Siswa</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend
                      formatter={(value, entry) => (
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {value} ({entry.payload.value})
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>Status KKM &amp; Grade Terstandar</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Terverifikasi</span>
            </div>
          </article>
        </motion.div>

        {/* ── CANONICAL EMERALD DATATABLE CONTAINER WITH 3-ROW TOOLBAR ── */}
        <motion.div variants={itemVariants}>
          <section
            className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]"
            aria-labelledby="penilaian-table-title"
          >
            {/* Datatable 3-Row Toolbar */}
            <div className="flex flex-col gap-3.5 border-b border-emerald-200/90 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-5 py-4 sm:px-6 md:px-8 dark:border-emerald-800/60 dark:bg-gradient-to-r dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-transparent print:hidden">
              {/* Row 1: Title di kiri, action buttons di kanan — responsive stack mobile */}
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-100/80 dark:border-emerald-900/50 pb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20 border border-emerald-300/30">
                    <Award className="size-5 text-white" strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 id="penilaian-table-title" className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                        Daftar Rekap Buku Nilai Siswa
                      </h3>
                      <span className="inline-flex items-center rounded-full bg-emerald-100/90 px-2 py-0.5 text-[11px] font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                        {pagination.total || dataList.length} Rekap
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 leading-snug">
                      Ringkasan nilai akhir, predikat KKM, dan rincian komponen tugas &amp; CBT.
                    </p>
                  </div>
                </div>

                {/* Vivid Gradient Action Buttons — fixed single row, no scroll, no wrap */}
                <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">

                  {/* Konfigurasi Bobot & Rumus (Amber/Orange — toggle aktif) */}
                  <div className="group relative inline-flex">
                    <button
                      type="button"
                      title="Konfigurasi Bobot & Rumus"
                      aria-label="Konfigurasi Bobot & Rumus"
                      onClick={() => setShowConfigPanel(!showConfigPanel)}
                      className={`flex size-10 items-center justify-center rounded-2xl border transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                        showConfigPanel
                          ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white border-amber-300/40 shadow-md shadow-amber-500/25'
                          : 'bg-gradient-to-br from-slate-100 via-slate-50 to-white text-slate-500 border-slate-200/80 hover:from-amber-100 hover:to-orange-100 hover:text-amber-700 hover:border-amber-300/60 dark:from-slate-800 dark:to-slate-900 dark:text-slate-400 dark:border-slate-700'
                      }`}
                    >
                      <Sliders className="size-5" strokeWidth={2.2} />
                    </button>
                    <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                      <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                      Konfigurasi Rumus
                    </div>
                  </div>

                  {/* Cetak & Filter Laporan (Vivid Indigo/Violet Squircle) */}
                  <div className="group relative inline-flex">
                    <button
                      type="button"
                      title="Cetak & Filter Laporan"
                      aria-label="Cetak & Filter Laporan"
                      onClick={openPrintFilterModal}
                      className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white border border-indigo-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer shadow-sm shadow-indigo-500/25"
                    >
                      <Printer className="size-5 text-white" strokeWidth={2.2} />
                    </button>
                    <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                      <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                      Cetak & Export
                    </div>
                  </div>

                  {/* Import Data (Vivid Sky Blue Squircle) */}
                  <div className="group relative inline-flex">
                    <button
                      type="button"
                      title="Import Data Nilai"
                      aria-label="Import Data Nilai"
                      onClick={() => setIsImportModalOpen(true)}
                      className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white border border-sky-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer shadow-sm shadow-sky-500/25"
                    >
                      <Upload1 className="size-5 text-white" strokeWidth={2.2} />
                    </button>
                    <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                      <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                      Import Data
                    </div>
                  </div>

                  {/* Export Data (Vivid Amber/Orange Squircle) */}
                  <div className="group relative inline-flex">
                    <button
                      type="button"
                      title="Export Data Nilai"
                      aria-label="Export Data Nilai"
                      onClick={() => setIsExportModalOpen(true)}
                      className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white border border-amber-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer shadow-sm shadow-amber-500/25"
                    >
                      <Download1 className="size-5 text-white" strokeWidth={2.2} />
                    </button>
                    <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                      <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                      Export Data
                    </div>
                  </div>

                  {/* Tambah / Input Nilai Manual (Vivid Emerald/Teal Squircle) */}
                  <div className="group relative inline-flex">
                    <button
                      type="button"
                      title="Tambah / Override Nilai"
                      aria-label="Tambah / Override Nilai"
                      onClick={() => handleOpenModal()}
                      className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer shadow-sm shadow-emerald-500/25"
                    >
                      <Plus className="size-5 text-white" strokeWidth={2.5} />
                    </button>
                    <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                      <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                      Tambah Nilai
                    </div>
                  </div>

                </div>
              </div>

              {/* Row 2: Full-width Search Bar with debounce */}
              <div className="w-full min-w-0">
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                    <Search className="size-4.5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari nama siswa, NIS, mata pelajaran, atau kelas..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl sm:rounded-2xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 sm:py-3 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-2xs focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Row 3: Horizontal Filters */}
              <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
                {/* Unit Dropdown (Divisi Pendidikan / Global) atau Locked Unit Badge */}
                {canSelectUnit ? (
                  <HeroUiFilterSelect
                    value={selectedUnit}
                    onChange={(val) => {
                      setSelectedUnit(val)
                    }}
                    options={filterUnitOptions}
                    placeholder={`Semua Unit (${(options.units || []).length || 'SIT'})`}
                    icon={School}
                    ariaLabel="Filter Unit Pendidikan"
                    popoverWidth="min-w-[220px]"
                    searchable={(options.units || []).length > 5}
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

                {/* Filter Kelas */}
                <HeroUiFilterSelect
                  value={filters.kelas_id}
                  onChange={(val) => setFilters((p) => ({ ...p, kelas_id: val }))}
                  options={filterKelasOptions}
                  placeholder="Semua Kelas"
                  icon={GraduationCap}
                  ariaLabel="Filter Kelas"
                  popoverWidth="min-w-[180px]"
                  searchable
                />

                {/* Filter Mata Pelajaran */}
                <HeroUiFilterSelect
                  value={filters.subject_id}
                  onChange={(val) => setFilters((p) => ({ ...p, subject_id: val }))}
                  options={filterSubjectOptions}
                  placeholder="Semua Mata Pelajaran"
                  icon={BookOpen}
                  ariaLabel="Filter Mata Pelajaran"
                  popoverWidth="min-w-[260px] sm:w-80"
                  searchable
                />

                {/* Filter Semester */}
                <HeroUiFilterSelect
                  value={filters.semester_id}
                  onChange={(val) => setFilters((p) => ({ ...p, semester_id: val }))}
                  options={filterSemesterOptions}
                  placeholder="Semua Semester"
                  icon={Layers}
                  ariaLabel="Filter Semester"
                  popoverWidth="min-w-[180px]"
                />

                {/* Filter Status Kelulusan KKM */}
                <HeroUiFilterSelect
                  value={filters.is_passed}
                  onChange={(val) => setFilters((p) => ({ ...p, is_passed: val }))}
                  options={filterIsPassedOptions}
                  placeholder="Semua Status KKM"
                  ariaLabel="Filter Status Kelulusan KKM"
                  popoverWidth="min-w-[180px]"
                />

                {/* Reset Filter Button */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-emerald-300/80 bg-emerald-50/70 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/60 transition cursor-pointer"
                  >
                    <RotateCcw className="size-3.5 text-emerald-700 dark:text-emerald-400" />
                    <span>Reset Filter</span>
                  </button>
                )}
              </div>
            </div>

            {/* Datatable Body */}
            {loading ? (
              <div className="p-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-[#0E5C44] animate-spin mx-auto" />
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Memuat data rekap penilaian...</p>
              </div>
            ) : dataList.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Award className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Belum Ada Data Penilaian</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {hasActiveFilters
                    ? 'Tidak ada data rekap yang sesuai dengan filter atau kata kunci pencarian aktif.'
                    : 'Pilih filter Kelas & Mata Pelajaran lalu klik tombol Konfigurasi Rumus untuk kalkulasi otomatis dari CBT & Penugasan.'}
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl bg-emerald-600 hover:bg-emerald-700 transition cursor-pointer"
                  >
                    <RotateCcw className="size-3.5" /> Reset Filter
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Mobile Card List View (< md) */}
                <div className="block md:hidden space-y-3 p-3.5 print:hidden">
                  {dataList.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[18px] border border-emerald-200/80 bg-white p-4 shadow-xs dark:border-emerald-900/40 dark:bg-[#1B2433]"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar size="md">
                          <AvatarFallback className="bg-emerald-100 text-emerald-800 font-bold">
                            {(item.student?.full_name || 'S').charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-[13px] font-extrabold text-slate-900 dark:text-white">
                                {item.student?.full_name || 'Siswa'}
                              </p>
                              <p className="text-[11px] font-mono text-slate-400">
                                NIS: {item.student?.nis || '-'}
                              </p>
                            </div>
                            {item.is_passed ? (
                              <Badge color="success" size="sm">TUNTAS KKM</Badge>
                            ) : (
                              <Badge color="error" size="sm">REMEDIAL</Badge>
                            )}
                          </div>

                          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                              {item.subject?.name || '-'}
                            </span>
                            <span>•</span>
                            <span className="font-medium text-slate-500">
                              {item.kelas?.nama_kelas || '-'}
                            </span>
                          </div>

                          <div className="mt-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Rincian Komponen</span>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                Tugas: {item.score_assignment} | UH: {item.score_quiz} | UTS: {item.score_midterm} | UAS: {item.score_final}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Nilai Akhir</span>
                              <span className="text-sm font-black text-[#0E5C44] dark:text-emerald-400">
                                {item.final_score} <span className="text-[10px]">({item.grade_letter})</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                        <ActionDropdown
                          onView={() => {
                            setViewingItem(item)
                            setShowDetailModal(true)
                          }}
                          onEdit={() => handleOpenModal(item)}
                          onDelete={() => handleRequestDelete(item)}
                          extraItems={[
                            {
                              label: 'Cetak Transkrip',
                              icon: <Printer className="size-4 text-indigo-500" />,
                              onClick: () => {
                                printCleanTable({
                                  title: `Transkrip Nilai Siswa — ${item.student?.full_name || 'Siswa'}`,
                                  subtitle: `NIS: ${item.student?.nis || '-'} | Mapel: ${item.subject?.name || '-'} | Kelas: ${item.kelas?.nama_kelas || '-'}`,
                                  columns: [
                                    { title: 'Komponen / Parameter', render: (row) => row.label },
                                    { title: 'Skor / Nilai', render: (row) => row.val },
                                  ],
                                  data: [
                                    { label: 'Penugasan LMS', val: item.score_assignment },
                                    { label: 'CBT UH', val: item.score_quiz },
                                    { label: 'CBT UTS', val: item.score_midterm },
                                    { label: 'CBT UAS', val: item.score_final },
                                    { label: 'Nilai Akhir Terkalkulasi', val: item.final_score },
                                    { label: 'Predikat / Grade', val: item.grade_letter },
                                    { label: 'Status KKM', val: item.is_passed ? 'TUNTAS KKM' : 'REMEDIAL' },
                                  ],
                                })
                              },
                            },
                          ]}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Datatable View (>= md) */}
                <div className="hidden md:block overflow-x-auto">
                  <TableRoot className="w-full min-w-[680px] text-left text-sm border-collapse">
                    <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
                      <TableRow className="border-b-2 border-emerald-200/90 dark:border-emerald-800/80 bg-transparent text-emerald-950 dark:text-emerald-200 text-[11px] font-extrabold uppercase tracking-wider">
                        <TableHead className="py-3 px-4 sm:px-5">Siswa &amp; Konteks Nilai</TableHead>
                        <TableHead className="py-3 px-3">Mapel &amp; Kelas</TableHead>
                        <TableHead className="hidden xl:table-cell py-3 px-3 text-center">N. Tugas</TableHead>
                        <TableHead className="hidden xl:table-cell py-3 px-3 text-center">CBT UH</TableHead>
                        <TableHead className="hidden xl:table-cell py-3 px-3 text-center">CBT UTS</TableHead>
                        <TableHead className="hidden xl:table-cell py-3 px-3 text-center">CBT UAS</TableHead>
                        <TableHead className="py-3 px-3 text-center">Nilai Akhir</TableHead>
                        <TableHead className="py-3 px-3 text-center">Grade &amp; Status</TableHead>
                        <TableHead className="py-3 px-4 sm:px-5 text-center" aria-label="Aksi baris">
                          <span className="sr-only">Aksi</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                      {dataList.map((item) => (
                        <TableRow
                          key={item.id}
                          className="border-b border-emerald-100/90 dark:border-emerald-900/40 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all duration-200 hover:shadow-xs"
                        >
                          {/* Student Info with HoverCard */}
                          <TableCell className="py-3 px-4 sm:px-5 align-top">
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <div className="cursor-pointer group flex items-center gap-3">
                                  <Avatar size="sm">
                                    <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xs font-bold">
                                      {(item.student?.full_name || 'S').charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-extrabold text-[13px] text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors border-b border-dashed border-transparent group-hover:border-emerald-600">
                                      {item.student?.full_name || 'Siswa'}
                                    </div>
                                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">NIS: {item.student?.nis || '-'}</div>
                                  </div>
                                </div>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-64 p-3.5 bg-white dark:bg-[#1B2433] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl z-50">
                                <div className="flex items-center gap-3">
                                  <Avatar size="md">
                                    <AvatarFallback className="bg-emerald-100 text-emerald-800 font-bold">
                                      {(item.student?.full_name || 'S').charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.student?.full_name}</h4>
                                    <p className="text-xs text-slate-500">NIS: {item.student?.nis || '-'}</p>
                                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold dark:bg-emerald-950/50 dark:text-emerald-300">
                                      {item.kelas?.nama_kelas || 'Kelas'}
                                    </span>
                                  </div>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          </TableCell>

                          {/* Subject & Class */}
                          <TableCell className="py-3 px-3 align-top">
                            <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">{item.subject?.name || '-'}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{item.kelas?.nama_kelas || '-'}</div>
                          </TableCell>

                          {/* Scores */}
                          <TableCell className="hidden xl:table-cell py-3 px-3 text-center font-bold text-xs tabular-nums text-slate-700 dark:text-slate-300">{item.score_assignment}</TableCell>
                          <TableCell className="hidden xl:table-cell py-3 px-3 text-center font-bold text-xs tabular-nums text-slate-700 dark:text-slate-300">{item.score_quiz}</TableCell>
                          <TableCell className="hidden xl:table-cell py-3 px-3 text-center font-bold text-xs tabular-nums text-slate-700 dark:text-slate-300">{item.score_midterm}</TableCell>
                          <TableCell className="hidden xl:table-cell py-3 px-3 text-center font-bold text-xs tabular-nums text-slate-700 dark:text-slate-300">{item.score_final}</TableCell>

                          {/* Final Score */}
                          <TableCell className="py-3 px-3 text-center font-black text-base text-[#0E5C44] dark:text-emerald-400 tabular-nums">
                            {item.final_score}
                          </TableCell>

                          {/* Grade & Status */}
                          <TableCell className="py-3 px-3 text-center align-top space-y-1">
                            <div>{getGradeBadge(item.grade_letter)}</div>
                            <div>
                              {item.is_passed ? (
                                <Badge color="success" size="sm">TUNTAS KKM</Badge>
                              ) : (
                                <Badge color="error" size="sm">REMEDIAL</Badge>
                              )}
                            </div>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="py-3 px-4 sm:px-5 text-center align-top">
                            <div className="inline-flex items-center justify-center">
                              <ActionDropdown
                                onView={() => {
                                  setViewingItem(item)
                                  setShowDetailModal(true)
                                }}
                                onEdit={() => handleOpenModal(item)}
                                onDelete={() => handleRequestDelete(item)}
                                extraItems={[
                                  {
                                    label: 'Cetak Transkrip',
                                    icon: <Printer className="size-4 text-indigo-500" />,
                                    onClick: () => {
                                      printCleanTable({
                                        title: `Transkrip Nilai Siswa — ${item.student?.full_name || 'Siswa'}`,
                                        subtitle: `NIS: ${item.student?.nis || '-'} | Mapel: ${item.subject?.name || '-'} | Kelas: ${item.kelas?.nama_kelas || '-'}`,
                                        columns: [
                                          { title: 'Komponen / Parameter', render: (row) => row.label },
                                          { title: 'Skor / Nilai', render: (row) => row.val },
                                        ],
                                        data: [
                                          { label: 'Penugasan LMS', val: item.score_assignment },
                                          { label: 'CBT UH', val: item.score_quiz },
                                          { label: 'CBT UTS', val: item.score_midterm },
                                          { label: 'CBT UAS', val: item.score_final },
                                          { label: 'Nilai Akhir Terkalkulasi', val: item.final_score },
                                          { label: 'Predikat / Grade', val: item.grade_letter },
                                          { label: 'Status KKM', val: item.is_passed ? 'TUNTAS KKM' : 'REMEDIAL' },
                                        ],
                                      })
                                    },
                                  },
                                ]}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </TableRoot>
                </div>
              </>
            )}

            {/* Pagination Footer with Record Information */}
            {!loading && dataList.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-emerald-100/90 bg-gradient-to-r from-emerald-50/40 via-teal-50/20 to-emerald-50/40 px-5 py-4 sm:px-6 md:px-8 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Menampilkan <span className="font-bold text-slate-800 dark:text-slate-200">{(pagination.currentPage - 1) * 10 + 1}</span> - <span className="font-bold text-slate-800 dark:text-slate-200">{Math.min(pagination.currentPage * 10, pagination.total || dataList.length)}</span> dari <span className="font-bold text-slate-900 dark:text-white">{pagination.total || dataList.length}</span> rekap nilai
                </div>
                {pagination.lastPage > 1 && (
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.lastPage}
                    onPageChange={(page) => fetchData(page)}
                    sideLayout="full"
                  />
                )}
              </div>
            )}
          </section>
        </motion.div>
      </motion.div>

      {/* ── Print Option Modal ── */}
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        onSelectOption={(format) => {
          if (format === 'csv') exportDatatable(dataList, 'csv')
          else if (format === 'excel') exportDatatable(dataList, 'xlsx')
          else handlePrint(format)
        }}
      />

      {/* ── Manual Input / Edit Modal ── */}
      {showModal && (
        <Dialog
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          modalClassName="z-[70] bg-slate-950/70 backdrop-blur-md"
          className="max-w-lg w-full rounded-3xl bg-white dark:bg-[#1B2433] shadow-2xl overflow-hidden p-0 border border-slate-200 dark:border-slate-800"
        >
          <div className={`h-1.5 w-full bg-gradient-to-r ${editingItem ? 'from-amber-500 via-amber-400 to-orange-500' : 'from-emerald-500 via-teal-400 to-emerald-600'} shrink-0`} />
          <div className="p-5 sm:p-6">
            <DialogHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-md ${
                  editingItem
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20'
                    : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20'
                }`}>
                  {editingItem ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <DialogTitle className="text-base font-black text-slate-900 dark:text-white">
                    {editingItem ? 'Edit / Override Manual Nilai Siswa' : 'Input Nilai Siswa Baru'}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-400">
                    Sesuaikan nilai tugas LMS, CBT UH, UTS, UAS, dan catatan evaluasi akademik siswa.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleFormSubmit}>
              <DialogBody className="space-y-4 py-4">
                {/* Siswa Identifier info if editing, selector if adding new */}
                {editingItem ? (
                  <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-extrabold text-slate-900 dark:text-white block">
                        {editingItem.student?.full_name}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        NIS: {editingItem.student?.nis || '-'} • Kelas: {editingItem.kelas?.nama_kelas || '-'}
                      </span>
                    </div>
                    <Badge color="cyan" size="sm">
                      {editingItem.subject?.name || 'Mapel'}
                    </Badge>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <HeroUiModalSelect
                        label="Mata Pelajaran"
                        value={formData.subject_id}
                        onChange={(val) => setFormData((prev) => ({ ...prev, subject_id: val }))}
                        options={modalSubjectOptions}
                        placeholder="Pilih Mata Pelajaran"
                        icon={BookOpen}
                        required
                        searchable
                      />
                    </div>
                    <div>
                      <HeroUiModalSelect
                        label="Kelas"
                        value={formData.kelas_id}
                        onChange={(val) => setFormData((prev) => ({ ...prev, kelas_id: val }))}
                        options={modalKelasOptions}
                        placeholder="Pilih Kelas"
                        icon={GraduationCap}
                        required
                        searchable
                      />
                    </div>
                    <div>
                      <HeroUiModalSelect
                        label="Semester"
                        value={formData.semester_id}
                        onChange={(val) => setFormData((prev) => ({ ...prev, semester_id: val }))}
                        options={modalSemesterOptions}
                        placeholder="Pilih Semester"
                        icon={Layers}
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">NIS Siswa</label>
                      <input
                        type="text"
                        value={formData.student_id}
                        onChange={(e) => setFormData((prev) => ({ ...prev, student_id: e.target.value }))}
                        placeholder="Masukkan NIS atau ID siswa..."
                        required
                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 border-t border-slate-200/80 dark:border-slate-700/60" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Komponen Nilai</span>
                  <div className="flex-1 border-t border-slate-200/80 dark:border-slate-700/60" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nilai Penugasan LMS</label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formData.score_assignment}
                        onChange={(e) => setFormData((prev) => ({ ...prev, score_assignment: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nilai CBT UH</label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formData.score_quiz}
                        onChange={(e) => setFormData((prev) => ({ ...prev, score_quiz: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nilai CBT UTS</label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formData.score_midterm}
                        onChange={(e) => setFormData((prev) => ({ ...prev, score_midterm: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nilai CBT UAS</label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formData.score_final}
                        onChange={(e) => setFormData((prev) => ({ ...prev, score_final: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Live calculation preview */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50/80 to-teal-50/60 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200/70 dark:border-emerald-800/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60">
                      <Calculator className="size-3.5 text-emerald-700 dark:text-emerald-300" />
                    </div>
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Perkiraan Nilai Akhir (Auto-hitung):</span>
                  </div>
                  <span className="text-base font-black text-emerald-700 dark:text-emerald-300 tabular-nums">
                    {Number(
                      (formData.score_assignment * (weights.bobot_tugas / 100)) +
                      (formData.score_quiz * (weights.bobot_uh / 100)) +
                      (formData.score_midterm * (weights.bobot_uts / 100)) +
                      (formData.score_final * (weights.bobot_uas / 100))
                    ).toFixed(1)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan Evaluasi Guru <span className="font-medium text-slate-400">(opsional)</span></label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 resize-none"
                    placeholder="Catatan kemajuan akademik siswa atau catatan remedial..."
                  />
                </div>
              </DialogBody>

              <DialogFooter className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <Button
                  appearance="outline"
                  variant="ghost"
                  type="button"
                  onClick={() => setShowModal(false)}
                >
                  Batal
                </Button>
                <Button variant="primary" type="submit">
                  Lanjut Simpan
                </Button>
              </DialogFooter>
            </form>
          </div>
        </Dialog>
      )}

      {/* ── Harmonized Save / Update Confirmation Modal (Elevation z-[80]) ── */}
      {showSaveConfirmDialog && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#1B2433]"
          >
            <div className={`h-1.5 w-full bg-gradient-to-r ${editingItem ? 'from-amber-400 via-amber-500 to-orange-600' : 'from-emerald-500 via-teal-400 to-emerald-600'}`} />
            <div className="p-6">
              <div className="flex items-center gap-3.5 mb-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-md ${
                  editingItem
                    ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 shadow-amber-500/30'
                    : 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 shadow-emerald-500/30'
                }`}>
                  {editingItem ? <Edit3 className="h-6 w-6" /> : <Award className="h-6 w-6" />}
                </div>
                <div>
                  <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                    editingItem
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  }`}>
                    {editingItem ? 'Update Nilai Siswa' : 'Input Nilai Baru'}
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                    Konfirmasi Simpan Nilai
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Apakah Anda yakin ingin {editingItem ? 'memperbarui' : 'menyimpan'} data rekap penilaian siswa ini ke dalam buku nilai akademik?
              </p>

              <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3.5 dark:border-emerald-800/60 dark:bg-emerald-950/20 mb-5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-emerald-950 dark:text-emerald-100">
                    {editingItem?.student?.full_name || 'Data Rekap Siswa'}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    N. Akhir Terkalkulasi
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                  Tugas: {formData.score_assignment} • UH: {formData.score_quiz} • UTS: {formData.score_midterm} • UAS: {formData.score_final}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSaveConfirmDialog(false)}
                  disabled={isSaving}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={executeSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:brightness-105 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSaving && <RefreshCw className="h-4 w-4 animate-spin" />}
                  <span>{isSaving ? 'Menyimpan...' : 'Ya, Simpan Nilai'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Grade Breakdown Detail Modal ── */}
      {showDetailModal && viewingItem && (
        <Dialog
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          modalClassName="z-[70] bg-slate-950/70 backdrop-blur-md"
          className="max-w-md w-full rounded-3xl bg-white dark:bg-[#1B2433] shadow-2xl overflow-hidden p-0 border border-slate-200 dark:border-slate-800"
        >
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
          <div className="p-5 sm:p-6">
            <DialogHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                    {viewingItem.subject?.name} — {viewingItem.kelas?.nama_kelas}
                  </span>
                  <DialogTitle className="text-base font-black text-slate-900 dark:text-white">
                    {viewingItem.student?.full_name}
                  </DialogTitle>
                </div>
              </div>
            </DialogHeader>

            <DialogBody className="space-y-4 py-4">
              <div className="bg-emerald-50/60 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Nilai Akhir Terkalkulasi</span>
                  <span className="text-3xl font-black text-[#0E5C44] dark:text-emerald-400">{viewingItem.final_score}</span>
                </div>
                <div className="text-right space-y-1">
                  {getGradeBadge(viewingItem.grade_letter)}
                  <div>
                    {viewingItem.is_passed ? (
                      <Badge color="success" size="sm">TUNTAS KKM</Badge>
                    ) : (
                      <Badge color="error" size="sm">REMEDIAL</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Formula Component Breakdown */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Rincian Komponen &amp; Bobot:</h4>
                <div className="bg-slate-50 dark:bg-[#111827] p-3 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <span>Tugas LMS ({viewingItem.weights_config?.bobot_tugas}%):</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{viewingItem.score_assignment}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>CBT UH ({viewingItem.weights_config?.bobot_uh}%):</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{viewingItem.score_quiz}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>CBT UTS ({viewingItem.weights_config?.bobot_uts}%):</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{viewingItem.score_midterm}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>CBT UAS ({viewingItem.weights_config?.bobot_uas}%):</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{viewingItem.score_final}</span>
                  </div>
                </div>
              </div>

              {viewingItem.notes && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900 text-xs">
                  <span className="font-bold text-amber-800 dark:text-amber-300 block mb-0.5">Catatan Guru:</span>
                  <p className="text-slate-700 dark:text-slate-300">{viewingItem.notes}</p>
                </div>
              )}
            </DialogBody>

            <DialogFooter className="flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
              <Button
                appearance="outline"
                variant="ghost"
                onClick={() => setShowDetailModal(false)}
              >
                Tutup Detail
              </Button>
            </DialogFooter>
          </div>
        </Dialog>
      )}

      {/* ── KPI Card Drill-Down Detail Modal ── */}
      {cardModal.isOpen && (
        <Dialog
          isOpen={cardModal.isOpen}
          onClose={closeCardModal}
          modalClassName="z-[70] bg-slate-950/70 backdrop-blur-md"
          className="max-w-xl w-full rounded-3xl bg-white dark:bg-[#1B2433] shadow-2xl overflow-hidden p-0 border border-slate-200 dark:border-slate-800"
        >
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
          <div className="p-5 sm:p-6">
            <DialogHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-black text-slate-900 dark:text-white">
                      {cardModal.title}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-400">
                      Rincian nilai dan status KKM siswa untuk kategori ini.
                    </DialogDescription>
                  </div>
                </div>
                <Badge color={cardModal.tone === 'rose' ? 'error' : cardModal.tone === 'sky' ? 'blue' : 'success'} size="sm">
                  {modalRows.length} Siswa
                </Badge>
              </div>
            </DialogHeader>

            <DialogBody className="space-y-4 py-4">
              {/* Modal Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama, NIS, mapel..."
                  value={cardModal.searchQuery}
                  onChange={(e) => setCardModal((prev) => ({ ...prev, searchQuery: e.target.value, page: 1 }))}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Modal Table */}
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
                <TableRoot className="w-full text-left text-xs border-collapse">
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:text-emerald-200 font-extrabold border-b border-emerald-200/90 dark:border-emerald-800/80 uppercase tracking-wider text-[10px]">
                      <TableHead className="py-2.5 px-3">Siswa &amp; NIS</TableHead>
                      <TableHead className="py-2.5 px-3">Mapel &amp; Kelas</TableHead>
                      <TableHead className="py-2.5 px-3 text-center">N. Akhir</TableHead>
                      <TableHead className="py-2.5 px-3 text-center">Grade</TableHead>
                      <TableHead className="py-2.5 px-3 text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                    {paginatedModalRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-slate-400">
                          Belum ada data siswa untuk kategori ini.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedModalRows.map((row) => (
                        <TableRow key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <TableCell className="py-2.5 px-3">
                            <div className="font-bold text-slate-900 dark:text-white">{row.student?.full_name || 'Siswa'}</div>
                            <div className="text-[10px] text-slate-400 font-mono">NIS: {row.student?.nis || '-'}</div>
                          </TableCell>
                          <TableCell className="py-2.5 px-3">
                            <div className="font-medium text-slate-800 dark:text-slate-200">{row.subject?.name || '-'}</div>
                            <div className="text-[10px] text-slate-400">{row.kelas?.nama_kelas || '-'}</div>
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-center font-bold text-[#0E5C44] dark:text-emerald-400">
                            {row.final_score}
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-center">
                            {getGradeBadge(row.grade_letter)}
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-center">
                            {row.is_passed ? (
                              <Badge color="success" size="sm">TUNTAS</Badge>
                            ) : (
                              <Badge color="error" size="sm">REMEDIAL</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </TableRoot>
              </div>

              {/* Modal Pagination */}
              {modalTotalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Menampilkan <span className="font-bold text-slate-700 dark:text-slate-200">{(cardModal.page - 1) * MODAL_PAGE_SIZE + 1}</span>–<span className="font-bold text-slate-700 dark:text-slate-200">{Math.min(cardModal.page * MODAL_PAGE_SIZE, modalRows.length)}</span> dari <span className="font-bold text-slate-900 dark:text-white">{modalRows.length}</span> siswa
                  </span>
                  <Pagination
                    currentPage={cardModal.page}
                    totalPages={modalTotalPages}
                    onPageChange={(page) => setCardModal((prev) => ({ ...prev, page }))}
                    sideLayout="icon"
                    variant="compact"
                  />
                </div>
              )}
            </DialogBody>

            <DialogFooter className="flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
              <Button variant="ghost" appearance="outline" size="sm" onClick={closeCardModal}>
                Tutup
              </Button>
            </DialogFooter>
          </div>
        </Dialog>
      )}

      {/* ── Print Filter & Student Selection Modal ── */}
      {isPrintFilterModalOpen && (
        <Dialog
          isOpen={isPrintFilterModalOpen}
          onClose={() => setIsPrintFilterModalOpen(false)}
          modalClassName="z-[70] bg-slate-950/70 backdrop-blur-md"
          className="max-w-xl w-full rounded-3xl bg-white dark:bg-[#1B2433] shadow-2xl overflow-hidden p-0 border border-slate-200 dark:border-slate-800"
        >
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-400 to-emerald-500 shrink-0" />
          <div className="p-5 sm:p-6">
            <DialogHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20">
                    <Printer className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-black text-slate-900 dark:text-white">
                      Pilih Data Nilai &amp; Siswa Untuk Dicetak
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-400">
                      Tentukan komponen nilai dan daftar siswa yang akan dimasukkan ke laporan.
                    </DialogDescription>
                  </div>
                </div>
                <Badge color="cyan" size="sm">
                  {selectedStudentIds.length} dari {dataList.length} Siswa
                </Badge>
              </div>
            </DialogHeader>

            <DialogBody className="space-y-5 py-4">
              {/* Opsi 1: Komponen Nilai */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  1. Pilih Komponen Nilai Yang Dicetak
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={selectedScoreFields.assignment}
                      onChange={() => handleToggleScoreField('assignment')}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    Tugas LMS
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={selectedScoreFields.uh}
                      onChange={() => handleToggleScoreField('uh')}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    CBT UH
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={selectedScoreFields.uts}
                      onChange={() => handleToggleScoreField('uts')}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    CBT UTS
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={selectedScoreFields.uas}
                      onChange={() => handleToggleScoreField('uas')}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    CBT UAS
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={selectedScoreFields.final}
                      onChange={() => handleToggleScoreField('final')}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    Nilai Akhir
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={selectedScoreFields.grade}
                      onChange={() => handleToggleScoreField('grade')}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    Grade / Huruf
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300 col-span-2">
                    <input
                      type="checkbox"
                      checked={selectedScoreFields.is_passed}
                      onChange={() => handleToggleScoreField('is_passed')}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    Status KKM (Tuntas/Remedial)
                  </label>
                </div>
              </div>

              {/* Opsi 2: Daftar Siswa */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    2. Pilih Siswa Yang Dicetak
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllStudents}
                      className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Pilih Semua
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={handleDeselectAllStudents}
                      className="text-[11px] font-bold text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
                    >
                      Hapus Pilihan
                    </button>
                  </div>
                </div>

                {/* Filter Search inside Modal */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari siswa untuk dicetak..."
                    value={printSearchQuery}
                    onChange={(e) => setPrintSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/60 text-xs bg-white dark:bg-slate-900/40">
                  {filteredPrintStudents.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">Tidak ada data siswa untuk dipilih</div>
                  ) : (
                    filteredPrintStudents.map((item, idx) => {
                      const rowId = getRowId(item, idx)
                      const isChecked = selectedStudentIds.includes(rowId)
                      return (
                        <label
                          key={rowId}
                          className={`flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer ${
                            isChecked ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleTogglePrintStudent(rowId)}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <div>
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                                {item.student?.full_name}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                NIS: {item.student?.nis || '-'} • Kelas: {item.kelas?.nama_kelas || '-'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                              {item.final_score}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-1">({item.grade_letter})</span>
                          </div>
                        </label>
                      )
                    })
                  )}
                </div>
              </div>
            </DialogBody>

            <DialogFooter className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              {/* Batal */}
              <button
                type="button"
                onClick={() => setIsPrintFilterModalOpen(false)}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 transition cursor-pointer"
              >
                Batal
              </button>
              <div className="flex items-center gap-2">
                {/* Export CSV — Vivid Amber/Orange */}
                <button
                  type="button"
                  onClick={() => handleExecutePrint('csv')}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white px-4 py-2.5 text-xs font-extrabold shadow-md shadow-amber-500/25 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer border border-amber-300/40"
                >
                  <Download1 className="w-4 h-4" />
                  Export CSV
                </button>
                {/* Unduh PDF — Vivid Sky/Blue */}
                <button
                  type="button"
                  onClick={() => handleExecutePrint('pdf')}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white px-4 py-2.5 text-xs font-extrabold shadow-md shadow-sky-500/25 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer border border-sky-300/40"
                >
                  <FileText className="w-4 h-4" />
                  Unduh PDF
                </button>
                {/* Cetak Sekarang — Vivid Indigo/Violet */}
                <button
                  type="button"
                  onClick={() => handleExecutePrint('print')}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white px-4 py-2.5 text-xs font-extrabold shadow-md shadow-indigo-500/25 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer border border-indigo-300/40"
                >
                  <Printer className="w-4 h-4" />
                  Cetak Sekarang
                </button>
              </div>
            </DialogFooter>
          </div>
        </Dialog>
      )}

      {/* ── Harmonized Batch Import Modal (Emerald Accent Theme) ── */}
      {isImportModalOpen && (
        <Dialog
          isOpen={isImportModalOpen}
          onClose={() => { setIsImportModalOpen(false); setImportFile(null); setImportError(''); }}
          modalClassName="z-[70] bg-slate-950/70 backdrop-blur-md"
          className="max-w-lg w-full rounded-3xl bg-white dark:bg-[#1B2433] shadow-2xl overflow-hidden p-0 border border-slate-200 dark:border-slate-800"
        >
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
          <div className="p-5 sm:p-6">
            <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/25 border border-emerald-300/40">
                  <Upload1 className="size-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-base font-black text-slate-900 dark:text-white">
                    Import Data Buku Nilai Siswa
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-400">
                    Unggah berkas spreadsheet (.xlsx, .csv) berisi data nilai tugas, CBT UH, UTS, dan UAS.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <DialogBody className="py-4 space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
                <div>
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">Template Format Import</span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block">Unduh contoh format CSV siap pakai.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const templateHeaders = 'nis,nama_siswa,mapel,kelas,score_assignment,score_quiz,score_midterm,score_final\n23001,"Ahmad Zaky","Bahasa Indonesia","7A",80,85,85,90\n23002,"Aisyah Humaira","Bahasa Indonesia","7A",85,90,88,92\n'
                    const blob = new Blob([`\uFEFF${templateHeaders}`], { type: 'text/csv;charset=utf-8' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'template-import-buku-nilai.csv'
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <Download className="size-3.5" /> Template
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Pilih Berkas Spreadsheet:
                </label>
                <div
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-emerald-300/80 dark:border-emerald-700/60 rounded-2xl bg-emerald-50/30 dark:bg-emerald-950/20 hover:bg-emerald-50/60 transition-colors cursor-pointer"
                  onClick={() => importInputRef.current?.click()}
                >
                  <Upload1 className="size-8 text-emerald-600 dark:text-emerald-400 mb-2" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {importFile ? importFile.name : 'Klik untuk memilih atau seret & jatuhkan berkas di sini'}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">Format didukung: CSV (.csv), Excel (.xlsx, .xls)</span>
                  <input
                    ref={importInputRef}
                    type="file"
                    accept=".csv, .xlsx, .xls, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setImportFile(e.target.files[0])
                        setImportError('')
                      }
                    }}
                  />
                </div>
              </div>

              {importError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium">
                  {importError}
                </div>
              )}
            </DialogBody>

            <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <Button
                variant="ghost"
                appearance="outline"
                type="button"
                onClick={() => { setIsImportModalOpen(false); setImportFile(null); setImportError(''); }}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                type="button"
                disabled={!importFile || isImporting}
                onClick={async () => {
                  if (!importFile) return
                  try {
                    setIsImporting(true)
                    setImportError('')
                    const formData = new FormData()
                    formData.append('file', importFile)
                    if (selectedClass) formData.append('kelas_id', selectedClass)
                    if (selectedSubject) formData.append('subject_id', selectedSubject)
                    if (selectedSemester) formData.append('semester_id', selectedSemester)

                    const res = await lmsPenilaianService.import(formData)
                    setIsImportModalOpen(false)
                    setImportFile(null)
                    pushToast('Import Berhasil', res?.message || 'Data buku nilai berhasil diimpor!', 'success')
                    await fetchData(1)
                  } catch (err) {
                    setImportError(err?.response?.data?.message || err?.message || 'Gagal memproses berkas import.')
                  } finally {
                    setIsImporting(false)
                  }
                }}
              >
                {isImporting ? 'Memproses...' : 'Import Data'}
              </Button>
            </DialogFooter>
          </div>
        </Dialog>
      )}

      {/* ── Harmonized Batch Export Modal ── */}
      <HarmonizedBatchExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExportSpreadsheet}
        isExporting={isExporting}
        totalCount={pagination.total || dataList.length}
        moduleTitle="Rekap Buku Nilai Siswa"
      />

      {/* ── Harmonized Delete Confirmation Modal ── */}
      <HarmonizedDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        item={deleteTarget}
        isSubmitting={isDeleting}
      />
    </PageContainer>
  )
}
