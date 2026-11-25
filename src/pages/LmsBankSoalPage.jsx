import { HeroUiHeader } from "../components/ui/HeroUiHeader"
import { useToast } from '../components/app/ToastProvider'
import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileQuestion,
  HelpCircle,
  CheckSquare,
  FileText,
  ToggleLeft,
  GitCommit,
  Plus,
  Search,
  Edit3,
  Trash2,
  Copy,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  X,
  Layers,
  Sparkles,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  List,
  RotateCcw,
  Printer,
  Upload,
  Download,
  AlertTriangle,
  FileSpreadsheet,
  Check,
  Folder,
  Table,
  ChevronDown,
  ChevronUp,
  School,
  Lock,
} from 'lucide-react'
import { lmsBankSoalService } from '../services/lmsBankSoalService'
import { subjectService } from '../services/subjectService'
import { useAuthStore } from '../stores/authStore'
import { useUnitStore } from '../stores/unitStore'
import ActionDropdown from '../components/app/ActionDropdown'
import AppModal from '../components/app/AppModal'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import {
  SquircleActionButton,
  PrintOptionModal,
} from '../components/master-data'
import AppDataTable from '../components/app/AppDataTable'
import MobileDataCard from '../components/app/MobileDataCard'
import {
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui/table'
import { useDebounce } from '../hooks/useDebounce'
import LmsKpiDetailModal from '../components/lms/LmsKpiDetailModal'
import { downloadSpreadsheetTemplate } from '../utils/spreadsheetParser'

// ── 1. PALET WARNA RESMI MODERN KPI CARDS ──
const MODERN_CARD_TONES = {
  emerald: {
    card: 'border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
    glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
    iconBox: 'bg-slate-100 border border-emerald-200/70 text-slate-700 shadow-xs dark:bg-slate-800 dark:border-emerald-800/60 dark:text-slate-300',
    tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    title: 'text-emerald-700 dark:text-emerald-400',
    val: 'text-emerald-700 dark:text-emerald-300',
    sub: 'text-emerald-600/80 dark:text-emerald-400/80',
    cta: 'text-emerald-600/60 dark:text-emerald-500/60',
  },
  sky: {
    card: 'border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] hover:border-sky-400 dark:border-sky-700/50 dark:from-sky-950/40 dark:via-cyan-950/20 dark:to-slate-900',
    glow: 'bg-sky-400/20 group-hover:bg-sky-400/30',
    iconBox: 'bg-white dark:bg-[#1B2433] shadow-sky-500/30',
    tag: 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300',
    title: 'text-sky-700 dark:text-sky-400',
    val: 'text-sky-700 dark:text-sky-300',
    sub: 'text-sky-600/80 dark:text-sky-400/80',
    cta: 'text-sky-600/60 dark:text-sky-500/60',
  },
  blue: {
    card: 'border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] hover:border-blue-400 dark:border-blue-700/50 dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-slate-900',
    glow: 'bg-blue-400/20 group-hover:bg-blue-400/30',
    iconBox: 'bg-slate-100 border border-emerald-200/70 text-slate-700 dark:bg-slate-800 dark:border-emerald-800/60 dark:text-slate-300 shadow-sm',
    tag: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
    title: 'text-blue-700 dark:text-blue-400',
    val: 'text-blue-700 dark:text-blue-300',
    sub: 'text-blue-600/80 dark:text-blue-400/80',
    cta: 'text-blue-600/60 dark:text-blue-500/60',
  },
  purple: {
    card: 'border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] hover:border-purple-400 dark:border-purple-700/50 dark:from-purple-950/40 dark:via-fuchsia-950/20 dark:to-slate-900',
    glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
    iconBox: 'bg-white dark:bg-[#1B2433] shadow-sm',
    tag: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
    title: 'text-purple-700 dark:text-purple-400',
    val: 'text-purple-700 dark:text-purple-300',
    sub: 'text-purple-600/80 dark:text-purple-400/80',
    cta: 'text-purple-600/60 dark:text-purple-500/60',
  },
  amber: {
    card: 'border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
    glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
    iconBox: 'bg-white dark:bg-[#1B2433] shadow-sm',
    tag: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    title: 'text-amber-700 dark:text-amber-400',
    val: 'text-amber-700 dark:text-amber-300',
    sub: 'text-amber-600/80 dark:text-amber-400/80',
    cta: 'text-amber-600/60 dark:text-amber-500/60',
  },
}

import { KpiStatCard, PageToolbarActions } from '../components/app'

function ModernKpiCard({ icon: Icon, label, subtext, value, tag, tone = 'emerald', onClick, active = false }) {
  const resolvedTone = tone === 'blue' || tone === 'sky' ? 'sky' : tone === 'purple' || tone === 'indigo' ? 'indigo' : tone === 'amber' ? 'amber' : tone === 'rose' ? 'rose' : 'emerald'

  return (
    <KpiStatCard
      title={label}
      value={value ?? 0}
      subtitle={subtext}
      badge={tag}
      icon={Icon}
      tone={resolvedTone}
      onClick={onClick}
      className={active ? 'ring-2 ring-emerald-500 shadow-md' : ''}
    />
  )
}

// ── 2. TOAST NOTIFICATION STACK HOOK ──
function useNotifications() {
  const toast = useToast()
  const push = (title, message, tone = 'success') => {
    toast(title, message, tone)
  }
  const dismiss = () => { }
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
        className={`w-full flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 text-left cursor-pointer ${disabled
          ? 'bg-slate-100 dark:bg-slate-800/60 border-emerald-200/80 dark:border-emerald-800/60 text-slate-400 cursor-not-allowed'
          : isOpen
            ? 'border-[#0E5C44] bg-white ring-4 ring-[#0E5C44]/12 dark:border-[#3FBF75] dark:bg-slate-900 dark:ring-[#3FBF75]/20 text-slate-800 dark:text-slate-100 shadow-sm'
            : 'border-emerald-200/90 bg-slate-50/50 hover:bg-white hover:border-emerald-300 dark:border-emerald-800/80 dark:bg-slate-900/50 dark:hover:bg-slate-900 dark:hover:border-emerald-200/80 text-slate-800 dark:text-slate-100'
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
          className={`size-4 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
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
            className="absolute left-0 right-0 top-full mt-1.5 z-[90] overflow-hidden rounded-xl border border-emerald-200/90 bg-white/95 backdrop-blur-md shadow-2xl dark:border-emerald-800/80 dark:bg-[#182232]/95"
          >
            {/* Search Input jika searchable */}
            {searchable && options.length > 5 && (
              <div className="p-2 border-b border-emerald-200/80 dark:border-emerald-800/60">
                <div className="relative">
                  <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Ketik untuk mencari..."
                    className="w-full rounded-lg border-2 border-[#b6f6d9] bg-slate-50/60 pl-8 pr-2.5 py-1.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#0E5C44] focus:outline-none dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100"
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
                      className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors text-left cursor-pointer ${isSelected
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
        <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
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
        className={`h-9 w-full sm:w-auto min-w-[140px] flex items-center justify-between gap-2 rounded-lg border px-3 text-sm font-medium transition-colors cursor-pointer shadow-xs ${isOpen
          ? 'border-emerald-600 bg-white ring-1 ring-emerald-500 dark:border-emerald-400 dark:bg-[#111827] dark:ring-emerald-400 text-slate-900 dark:text-white'
          : value !== '' && value !== undefined && value !== null
            ? 'border-emerald-500/70 bg-emerald-50/40 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 font-semibold'
            : 'border-emerald-200/80 bg-white text-slate-700 hover:bg-slate-50 dark:border-emerald-800/60 dark:bg-[#111827] dark:text-slate-200 dark:hover:bg-slate-800'
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
            className={`absolute left-0 top-full mt-1.5 z-[100] ${popoverWidth} max-w-[92vw] overflow-hidden rounded-lg border border-emerald-200/80 bg-white/98 backdrop-blur-md shadow-2xl dark:border-emerald-800/80 dark:bg-[#182232]/98`}
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
                    className="w-full rounded-lg border-2 border-[#b6f6d9] bg-slate-50/60 pl-8 pr-2.5 py-1 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#0E5C44] focus:outline-none dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100"
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
                      className={`w-full flex items-center justify-between rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors text-left cursor-pointer ${isSelected
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
            kode_soal: (parts[0] || '').replace(/["\r]/g, '').trim(),
            pertanyaan: (parts[1] || '').replace(/["\r]/g, '').trim(),
            tipe_soal: (parts[2] || 'pg').replace(/["\r]/g, '').trim(),
            kunci_jawaban: (parts[3] || 'A').replace(/["\r]/g, '').trim(),
            poin: (parts[4] || '2.5').replace(/["\r]/g, '').trim(),
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
    const headers = ['KODE_SOAL', 'PERTANYAAN', 'TIPE_SOAL', 'KUNCI_JAWABAN', 'POIN', 'TINGKAT_KESULITAN']
    const sampleRows = [
      ['"PPKN-001"', '"Sila pertama Pancasila menekankan nilai apa?"', '"pg"', '"A"', '"2.5"', '"mudah"'],
      ['"PPKN-002"', '"Jelaskan hubungan sila ke-2 dan ke-5 Pancasila!"', '"esai"', '""', '"10"', '"sedang"'],
    ]
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...sampleRows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'template_import_bank_soal.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    notify('Unduh Template', 'Template berkas CSV Bank Soal berhasil diunduh.', 'success')
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
      const res = await lmsBankSoalService.import(formData)
      notify('Impor Berhasil', res?.message || `Berkas ${selectedFile.name} berhasil diimpor ke Bank Soal.`, 'success')
      onImportSuccess?.()
      onClose()
    } catch (err) {
      notify('Impor Gagal', err?.response?.data?.message || err?.message || 'Terjadi kendala saat memproses berkas impor.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Impor Data Butir Bank Soal"
      description="Unggah berkas CSV atau XLSX berisi butir pertanyaan ujian."
      icon={Upload}
      maxWidth="max-w-xl"
      zIndex={60}
      disableBackdropClose={isSubmitting}
      bodyClassName="space-y-5"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-emerald-200/80 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-emerald-800/60 dark:text-slate-300 dark:hover:bg-slate-800 transition-all"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedFile}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all"
          >
            {isSubmitting && <RefreshCw className="h-4 w-4 animate-spin" />}
            <span>{isSubmitting ? 'Memproses Berkas...' : 'Proses Impor Soal'}</span>
          </button>
        </>
      }
    >
      {/* Download Template Card */}
      <div className="flex items-center justify-between rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="h-8 w-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200">Template Berkas Data Soal</p>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-400/80">Format standar untuk pilihan ganda, esai, dan tingkat kesulitan.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="inline-flex items-center gap-1.5 rounded-lg border-2 border-emerald-300/80 bg-white px-3.5 py-2 text-xs font-bold text-emerald-700 shadow-xs dark:border-emerald-700 dark:bg-emerald-600 dark:text-emerald-300 transition-all text-sm font-medium"
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
        className={`cursor-pointer rounded-xl border-2 border-dashed p-7 text-center transition-all ${dragActive
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
        <div className="mx-auto flex h-9 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 mb-3">
          <Upload className="h-6 w-6" />
        </div>
        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
          {selectedFile ? selectedFile.name : 'Tarik & lepas berkas ke sini, atau klik untuk memilih'}
        </p>
        <p className="text-xs text-slate-400 mt-1">Mendukung file .CSV, .XLSX (Maks. 5MB)</p>
      </div>

      {/* Mini Preview Datatable */}
      {previewRows.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
            Pratinjau Butir Soal (5 Baris Pertama)
          </p>
          <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
            <TableRoot className="w-full text-left text-xs">
              <TableHeader className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold border-b border-emerald-200/80">
                <TableRow>
                  <TableHead className="py-2 px-3">No</TableHead>
                  <TableHead className="py-2 px-3">Kode</TableHead>
                  <TableHead className="py-2 px-3">Pertanyaan</TableHead>
                  <TableHead className="py-2 px-3">Tipe</TableHead>
                  <TableHead className="py-2 px-3">Kunci</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-emerald-100/70 dark:divide-emerald-900/40">
                {previewRows.map((r, i) => (
                  <TableRow key={i} className="hover:bg-emerald-50/30">
                    <TableCell className="py-2 px-3 font-semibold text-emerald-600">{i + 1}</TableCell>
                    <TableCell className="py-2 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">{r.kode_soal || '-'}</TableCell>
                    <TableCell className="py-2 px-3 font-medium text-slate-800 dark:text-slate-100 truncate max-w-[200px]">{r.pertanyaan || '-'}</TableCell>
                    <TableCell className="py-2 px-3 text-slate-600 dark:text-slate-300 uppercase">{r.tipe_soal}</TableCell>
                    <TableCell className="py-2 px-3 font-bold text-emerald-700">{r.kunci_jawaban}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableRoot>
          </div>
        </div>
      )}
    </AppModal>
  )
}

// ── 3. HARMONIZED SAVE CONFIRMATION MODAL ──
function HarmonizedSaveModal({ isOpen, onClose, onConfirm, isEdit, title, isSubmitting }) {
  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Konfirmasi Simpan Soal"
      badge={isEdit ? 'Perbarui Soal' : 'Butir Soal Baru'}
      icon={isEdit ? Edit3 : BookOpen}
      variant={isEdit ? 'warning' : 'emerald'}
      maxWidth="max-w-md"
      zIndex={70}
      disableBackdropClose={isSubmitting}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-emerald-200/80 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-emerald-800/60 dark:text-slate-300 dark:hover:bg-slate-800 transition-all"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-md transition-all ${isEdit
              ? 'bg-amber-600 hover:bg-amber-700'
              : 'bg-emerald-600 hover:bg-emerald-700'
              } disabled:opacity-50`}
          >
            {isSubmitting && <RefreshCw className="h-4 w-4 animate-spin" />}
            <span>{isSubmitting ? 'Menyimpan...' : isEdit ? 'Ya, Simpan Perubahan' : 'Ya, Tambahkan Soal'}</span>
          </button>
        </>
      }
    >
      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        Apakah Anda yakin ingin {isEdit ? 'memperbarui butir pertanyaan' : 'menyimpan butir soal baru'} berikut ke bank soal:
      </p>

      <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3.5 dark:border-emerald-800/60 dark:bg-emerald-950/20">
        <p className="text-xs font-black text-emerald-950 dark:text-emerald-100 line-clamp-2">{title || 'Butir Pertanyaan Soal'}</p>
      </div>
    </AppModal>
  )
}

// ── 4. HARMONIZED BATCH EXPORT MODAL ──
function HarmonizedBatchExportModal({
  isOpen,
  onClose,
  onExport,
  isExporting,
  totalCount,
  moduleTitle = 'Bank Soal',
}) {
  const [exportFormat, setExportFormat] = useState('xlsx')

  if (!isOpen) return null

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Export Data ${moduleTitle}`}
      badge="Unduh Data"
      description="Pilih format berkas untuk mengekspor data sesuai filter aktif."
      icon={Download}
      maxWidth="max-w-xl"
      zIndex={50}
      disableBackdropClose={isExporting}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200/90 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs dark:border-emerald-800/60 dark:bg-emerald-600 dark:text-slate-200 transition cursor-pointer text-sm font-medium"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isExporting}
            onClick={() => onExport(exportFormat)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-extrabold shadow-md transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            <Download className="size-4" />
            {isExporting ? 'Menyiapkan...' : 'Unduh Berkas'}
          </button>
        </>
      }
    >
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
            className={`rounded-xl border p-4 text-left transition-all duration-200 cursor-pointer ${exportFormat === value
              ? 'border-emerald-500 bg-emerald-50/70 shadow-sm dark:border-emerald-700 dark:bg-emerald-950/40'
              : 'border-emerald-200/80 bg-white hover:border-emerald-300 dark:border-emerald-800/60 dark:bg-slate-900/40'
              }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Icon
                className={`size-4 ${exportFormat === value ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'
                  }`}
              />
              <span className="text-xs font-black text-slate-900 dark:text-white">{label}</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-snug">{desc}</p>
          </button>
        ))}
      </div>

      <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 dark:bg-amber-950/30 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
        <p className="font-bold flex items-center gap-1.5 mb-0.5">
          <Sparkles className="size-3.5 text-amber-600 dark:text-amber-400" />
          Filter Ekspor Aktif
        </p>
        <p className="text-xs text-amber-800/90 dark:text-amber-300/80">
          Data yang diekspor akan mencakup seluruh entitas terfilter ({totalCount} butir {moduleTitle.toLowerCase()}).
        </p>
      </div>
    </AppModal>
  )
}

// ── 5. HARMONIZED DELETE CONFIRMATION MODAL ──
function HarmonizedDeleteModal({ isOpen, onClose, onConfirm, title, isSubmitting }) {
  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Konfirmasi Hapus Butir Soal"
      badge="Hapus Permanen"
      icon={Trash2}
      variant="danger"
      maxWidth="max-w-md"
      zIndex={70}
      disableBackdropClose={isSubmitting}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-emerald-200/80 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-emerald-800/60 dark:text-slate-300 dark:hover:bg-slate-800 transition-all"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 text-xs font-bold shadow-md hover:brightness-105 disabled:opacity-50 transition-all"
          >
            {isSubmitting && <RefreshCw className="h-4 w-4 animate-spin" />}
            <span>{isSubmitting ? 'Menghapus...' : 'Ya, Hapus Butir Soal'}</span>
          </button>
        </>
      }
    >
      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        Apakah Anda yakin ingin menghapus butir soal berikut dari bank soal? Soal yang dihapus tidak akan muncul pada paket ujian berikutnya.
      </p>

      <div className="rounded-xl border border-rose-200/80 bg-rose-50/50 p-3.5 dark:border-rose-800/60 dark:bg-rose-950/20">
        <p className="text-xs font-black text-rose-950 dark:text-rose-100 line-clamp-2">{title || 'Butir Pertanyaan Soal'}</p>
      </div>
    </AppModal>
  )
}

const getMapelName = (item) => {
  if (!item) return '-'
  const mp = item.kisi_kisi?.mata_pelajaran || item.mata_pelajaran || item.subject || item.kisi_kisi?.subject
  if (typeof mp === 'string') return mp
  if (typeof mp === 'object' && mp !== null) {
    return mp.name || mp.nama || mp.nama_mapel || mp.label || mp.kode_mapel || '-'
  }
  return '-'
}

// ── 5. KOMPONEN UTAMA HALAMAN BANK SOAL ──
export default function LmsBankSoalPage({ embedded = false, hideBreadcrumb = false, hidePageHeader = false, tabNav = null }) {
  const { items: toastItems, push: notify, dismiss: dismissToast } = useNotifications()
  const [searchParams] = useSearchParams()
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

  const [dataList, setDataList] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })
  const [stats, setStats] = useState({
    total_soal: 0,
    total_pg: 0,
    total_esai: 0,
    total_benar_salah: 0,
    total_menjodohkan: 0,
    total_aktif: 0,
  })
  const [options, setOptions] = useState({
    kisi_kisi: [],
    subjects: [],
    kelas: [],
    tipe_soal: [],
    tingkat_kesulitan: [],
  })

  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 350)

  const [filters, setFilters] = useState(() => {
    const urlKisiId = searchParams.get('kisi_id') || sessionStorage.getItem('bankSoal_prefill_kisi_id') || ''
    return {
      mata_pelajaran_id: '',
      kisi_kisi_id: urlKisiId,
      kelas_id: '',
      tipe_soal: '',
      tingkat_kesulitan: '',
      status: '',
    }
  })

  // Print & Import State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  // Modals & Detail State
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [viewingItem, setViewingItem] = useState(null)
  const [rowDetailItem, setRowDetailItem] = useState(null)
  const [showRowDetailModal, setShowRowDetailModal] = useState(false)

  // Delete Modal State
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    id: null,
    title: '',
    isSubmitting: false,
  })

  // Save Modal State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [kpiModalKey, setKpiModalKey] = useState(null)
  const [isExporting, setIsExporting] = useState(false)

  // Layout View Mode State: 'grouped' (per Kisi-kisi & Mapel) | 'flat' (Semua Soal)
  const [viewLayout, setViewLayout] = useState('grouped')
  // Expanded Kisi-kisi Groups in Grouped View (default open)
  const [expandedGroups, setExpandedGroups] = useState({})

  // In-Modal Session Questions
  const [modalSessionQuestions, setModalSessionQuestions] = useState([])
  const [editingModalQuestionId, setEditingModalQuestionId] = useState(null)
  const [loadingModalQuestions, setLoadingModalQuestions] = useState(false)

  // Menjodohkan Pair State
  const [matchingPairs, setMatchingPairs] = useState([
    { kiri: '', kanan: '' },
    { kiri: '', kanan: '' },
  ])

  const [formData, setFormData] = useState({
    kisi_kisi_id: '',
    mata_pelajaran_id: '',
    kode_soal: '',
    pertanyaan: '',
    tipe_soal: 'pg',
    opsi_a: '',
    opsi_b: '',
    opsi_c: '',
    opsi_d: '',
    opsi_e: '',
    kunci_jawaban: 'A',
    pembahasan: '',
    poin: 2.5,
    tingkat_kesulitan: 'sedang',
    indikator: '',
    status: true,
  })

  const selectedKisiObj = useMemo(() => {
    return (options.kisi_kisi || []).find((k) => k.id === formData.kisi_kisi_id)
  }, [options.kisi_kisi, formData.kisi_kisi_id])

  // Memoized grouped questions by Kisi-kisi & Mapel
  const groupedData = useMemo(() => {
    const map = new Map()

    dataList.forEach((item) => {
      const rawKisiId = item.kisi_kisi_id
      const kisiId = rawKisiId ? String(rawKisiId) : 'unassigned'
      if (!map.has(kisiId)) {
        const kisiMeta = (options.kisi_kisi || []).find((k) => String(k.id) === String(kisiId)) || item.kisi_kisi || {}
        map.set(kisiId, {
          kisi_kisi_id: kisiId !== 'unassigned' ? kisiId : '',
          judul_kisi: kisiMeta.judul_kisi || item.kisi_kisi?.judul_kisi || (kisiId === 'unassigned' ? 'Soal Mandiri (Tanpa Kisi-kisi)' : `Kisi-kisi #${kisiId}`),
          mata_pelajaran_id: item.mata_pelajaran_id || kisiMeta.mata_pelajaran_id || '',
          mapel_name: getMapelName(item) || kisiMeta.subject_name || kisiMeta.mata_pelajaran || 'Mata Pelajaran Umum',
          kelas: kisiMeta.kelas_name || kisiMeta.kelas || item.kisi_kisi?.kelas || '',
          jenis_ujian: kisiMeta.jenis_ujian || item.kisi_kisi?.jenis_ujian || '',
          target_jumlah_soal: Number(kisiMeta.jumlah_soal) || null,
          total_poin: 0,
          items: [],
        })
      }
      const grp = map.get(kisiId)
      grp.items.push(item)
      grp.total_poin += Number(item.poin || 0)
    })

    // If filtering a specific single kisi-kisi, ensure that kisi-kisi is included even if it currently has 0 questions
    if (filters.kisi_kisi_id && filters.kisi_kisi_id !== 'Semua') {
      const targetKisiId = String(filters.kisi_kisi_id)
      if (!map.has(targetKisiId)) {
        const k = (options.kisi_kisi || []).find((x) => String(x.id) === targetKisiId)
        if (k) {
          map.set(targetKisiId, {
            kisi_kisi_id: targetKisiId,
            judul_kisi: k.judul_kisi || `Kisi-kisi #${targetKisiId}`,
            mata_pelajaran_id: k.mata_pelajaran_id || '',
            mapel_name: k.subject_name || k.mata_pelajaran || 'Mata Pelajaran Umum',
            kelas: k.kelas_name || k.kelas || '',
            jenis_ujian: k.jenis_ujian || '',
            target_jumlah_soal: Number(k.jumlah_soal) || null,
            total_poin: 0,
            items: [],
          })
        }
      }
    } else if (!debouncedSearch) {
      // If no search filter is active and viewing all kisi-kisi,
      // include available empty kisi-kisi from options so teacher can directly add questions to them
      (options.kisi_kisi || []).forEach((k) => {
        const kId = String(k.id)
        if (!map.has(kId)) {
          if (filters.mata_pelajaran_id && filters.mata_pelajaran_id !== 'Semua' && String(k.mata_pelajaran_id) !== String(filters.mata_pelajaran_id)) {
            return
          }
          map.set(kId, {
            kisi_kisi_id: kId,
            judul_kisi: k.judul_kisi || `Kisi-kisi #${kId}`,
            mata_pelajaran_id: k.mata_pelajaran_id || '',
            mapel_name: k.subject_name || k.mata_pelajaran || 'Mata Pelajaran Umum',
            kelas: k.kelas_name || k.kelas || '',
            jenis_ujian: k.jenis_ujian || '',
            target_jumlah_soal: Number(k.jumlah_soal) || null,
            total_poin: 0,
            items: [],
          })
        }
      })
    }

    return Array.from(map.values()).sort((a, b) => {
      // unassigned placed at bottom
      if (a.kisi_kisi_id === '') return 1
      if (b.kisi_kisi_id === '') return -1
      return b.items.length - a.items.length
    })
  }, [dataList, options.kisi_kisi, debouncedSearch, filters])

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: prev[groupId] === false ? true : false,
    }))
  }

  const expandAllGroups = () => {
    const all = {}
    groupedData.forEach((g) => {
      all[g.kisi_kisi_id || 'unassigned'] = true
    })
    setExpandedGroups(all)
  }

  const collapseAllGroups = () => {
    const all = {}
    groupedData.forEach((g) => {
      all[g.kisi_kisi_id || 'unassigned'] = false
    })
    setExpandedGroups(all)
  }

  useEffect(() => {
    fetchStats()
    fetchOptions()
  }, [userUnitId, activeUnit, selectedUnit])

  useEffect(() => {
    fetchData(page)
  }, [page, perPage, debouncedSearch, filters, userUnitId, activeUnit, selectedUnit])

  // Handle URL or Session storage prefill
  useEffect(() => {
    const urlKisiId = searchParams.get('kisi_id')
    const sessionKisiId = sessionStorage.getItem('bankSoal_prefill_kisi_id')
    const targetKisiId = urlKisiId || sessionKisiId

    if (targetKisiId) {
      const targetMapelId = sessionStorage.getItem('bankSoal_prefill_mapel_id') || ''
      const targetJudul = sessionStorage.getItem('bankSoal_prefill_kisi_judul') || ''

      setFilters((prev) => ({
        ...prev,
        kisi_kisi_id: targetKisiId,
      }))

      const shouldOpenModal = Boolean(sessionKisiId || searchParams.get('action') === 'create')
      if (shouldOpenModal) {
        handleOpenModal(null, {
          kisi_kisi_id: targetKisiId,
          mata_pelajaran_id: targetMapelId,
        })

        if (targetJudul) {
          notify('Prefill Kisi-kisi', `Tambah butir soal untuk: ${targetJudul}`, 'success')
        }
      }

      sessionStorage.removeItem('bankSoal_prefill_kisi_id')
      sessionStorage.removeItem('bankSoal_prefill_kisi_judul')
      sessionStorage.removeItem('bankSoal_prefill_mapel_id')
    }
  }, [searchParams])

  const fetchData = async (targetPage = 1) => {
    setLoading(true)
    try {
      const params = {
        page: targetPage,
        per_page: perPage,
        search: debouncedSearch,
        ...filters,
      }
      const effectiveUnit = canSelectUnit ? (selectedUnit || undefined) : (userUnitId || undefined)
      if (effectiveUnit) params.unit_pendidikan_id = effectiveUnit
      if (activeUnit) params.jenjang = activeUnit

      const response = await lmsBankSoalService.getDaftar(params)
      if (response && response.data) {
        let rawData = Array.isArray(response.data) ? response.data : (response.data?.data || [])
        let filteredData = rawData.filter((item) => {
          if (!item) return false
          const itemUnitId = item.unit_pendidikan_id || item.unit_id || item.kisi_kisi?.unit_pendidikan_id || item.kisi_kisi?.mata_pelajaran?.unit_pendidikan_id || item.mata_pelajaran?.unit_pendidikan_id
          if (!canSelectUnit && userUnitId && itemUnitId) return String(itemUnitId) === String(userUnitId)
          if (canSelectUnit && selectedUnit && itemUnitId) return String(itemUnitId) === String(selectedUnit)
          return true
        })
        setDataList(filteredData)
        setPagination({
          currentPage: response.meta?.current_page || targetPage,
          lastPage: response.meta?.last_page || 1,
          total: response.meta?.total || filteredData.length,
        })
      }
    } catch (error) {
      console.error('Error loading Bank Soal data:', error)
      notify('Gagal Memuat Data', 'Tidak dapat memuat daftar repositori butir soal.', 'error')
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
      const response = await lmsBankSoalService.getStats(params)
      if (response && response.data) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Error loading Bank Soal stats:', error)
    }
  }

  const fetchOptions = async () => {
    try {
      const params = {}
      const effectiveUnit = canSelectUnit ? (selectedUnit || undefined) : (userUnitId || undefined)
      if (effectiveUnit) params.unit_pendidikan_id = effectiveUnit
      if (activeUnit) params.jenjang = activeUnit

      const [resOptions, resSubjects] = await Promise.allSettled([
        lmsBankSoalService.getOptions(params),
        subjectService.getDaftar({ ...params, status: 1, per_page: 100 }),
      ])

      let bankSoalOptions = resOptions.status === 'fulfilled' ? resOptions.value?.data || resOptions.value || {} : {}
      let dbSubjectsRaw = resSubjects.status === 'fulfilled' ? resSubjects.value?.data || resSubjects.value || [] : []
      if (Array.isArray(dbSubjectsRaw?.data)) dbSubjectsRaw = dbSubjectsRaw.data

      let dbSubjects = Array.isArray(dbSubjectsRaw) ? dbSubjectsRaw.filter((s) => {
        if (!s) return false
        const sUnitId = s.unit_pendidikan_id || s.unit_id || s.education_unit_id
        if (!canSelectUnit && userUnitId && sUnitId) return String(sUnitId) === String(userUnitId)
        if (canSelectUnit && selectedUnit && sUnitId) return String(sUnitId) === String(selectedUnit)
        if (activeUnit && s.jenjang) return s.jenjang === activeUnit || s.jenjang === 'All'
        return true
      }) : []

      const kisiList = (bankSoalOptions.kisi_kisi || []).filter((k) => {
        if (!k) return false
        const kUnitId = k.unit_pendidikan_id || k.unit_id || k.mata_pelajaran?.unit_pendidikan_id
        if (!canSelectUnit && userUnitId && kUnitId) return String(kUnitId) === String(userUnitId)
        if (canSelectUnit && selectedUnit && kUnitId) return String(kUnitId) === String(selectedUnit)
        return true
      })

      const kelasList = (bankSoalOptions.kelas || []).filter((c) => {
        if (!c) return false
        const cUnitId = c.unit_pendidikan_id || c.unit_id
        if (!canSelectUnit && userUnitId && cUnitId) return String(cUnitId) === String(userUnitId)
        if (canSelectUnit && selectedUnit && cUnitId) return String(cUnitId) === String(selectedUnit)
        return true
      })

      const scopedSubjects = (bankSoalOptions.subjects && bankSoalOptions.subjects.length > 0)
        ? bankSoalOptions.subjects
        : (dbSubjects.length > 0 ? dbSubjects : (bankSoalOptions.subjects || []))

      setOptions({
        ...bankSoalOptions,
        kisi_kisi: kisiList,
        subjects: scopedSubjects,
        kelas: kelasList,
      })
    } catch (error) {
      console.error('Error loading options:', error)
    }
  }

  const loadExistingQuestionsForKisi = async (kisiId) => {
    if (!kisiId) {
      setModalSessionQuestions([])
      return
    }
    setLoadingModalQuestions(true)
    try {
      const res = await lmsBankSoalService.getDaftar({
        kisi_kisi_id: kisiId,
        per_page: 100,
        order_by: 'created_at',
        order_dir: 'asc',
      })
      let items = []
      if (res && res.data) {
        items = Array.isArray(res.data) ? res.data : (res.data.data || [])
      }
      setModalSessionQuestions(items)
      setFormData((prev) => {
        if (!prev.kode_soal && !editingModalQuestionId && !editingItem) {
          const nextNum = items.length + 1
          return { ...prev, kode_soal: `SOAL-${String(nextNum).padStart(2, '0')}` }
        }
        return prev
      })
    } catch (err) {
      console.error('Error loading existing questions for modal:', err)
      setModalSessionQuestions([])
    } finally {
      setLoadingModalQuestions(false)
    }
  }

  const handleOpenModal = (item = null, prefill = null) => {
    if (item) {
      setEditingItem(item)
      let defaultKunci = item.kunci_jawaban || ''
      let pairs = [
        { kiri: '', kanan: '' },
        { kiri: '', kanan: '' },
      ]
      if (item.tipe_soal === 'menjodohkan' && Array.isArray(item.opsi_menjodohkan)) {
        pairs = item.opsi_menjodohkan.map((p) => ({
          kiri: p.kiri || '',
          kanan: p.kanan || '',
        }))
      }
      setMatchingPairs(pairs)

      setFormData({
        kisi_kisi_id: item.kisi_kisi_id || '',
        mata_pelajaran_id: item.mata_pelajaran_id || '',
        kode_soal: item.kode_soal || '',
        pertanyaan: item.pertanyaan || '',
        tipe_soal: item.tipe_soal || 'pg',
        opsi_a: item.opsi_a || '',
        opsi_b: item.opsi_b || '',
        opsi_c: item.opsi_c || '',
        opsi_d: item.opsi_d || '',
        opsi_e: item.opsi_e || '',
        kunci_jawaban: defaultKunci,
        pembahasan: item.pembahasan || '',
        poin: item.poin || 2.5,
        tingkat_kesulitan: item.tingkat_kesulitan || 'sedang',
        indikator: item.indikator || '',
        status: item.status !== undefined ? item.status : true,
      })

      if (item.kisi_kisi_id) {
        loadExistingQuestionsForKisi(item.kisi_kisi_id)
      } else {
        setModalSessionQuestions([])
      }
    } else {
      setEditingItem(null)
      setEditingModalQuestionId(null)
      const targetKisiId = prefill?.kisi_kisi_id || filters.kisi_kisi_id || (options.kisi_kisi.length > 0 ? options.kisi_kisi[0].id : '')
      const matchedKisi = options.kisi_kisi.find((k) => k.id === targetKisiId)
      const targetMapelId = prefill?.mata_pelajaran_id || matchedKisi?.mata_pelajaran_id || (options.kisi_kisi.length > 0 ? options.kisi_kisi[0].mata_pelajaran_id : '')

      setMatchingPairs([
        { kiri: '', kanan: '' },
        { kiri: '', kanan: '' },
      ])

      setFormData({
        kisi_kisi_id: targetKisiId,
        mata_pelajaran_id: targetMapelId,
        kode_soal: '',
        pertanyaan: '',
        tipe_soal: 'pg',
        opsi_a: '',
        opsi_b: '',
        opsi_c: '',
        opsi_d: '',
        opsi_e: '',
        kunci_jawaban: 'A',
        pembahasan: '',
        poin: 2.5,
        tingkat_kesulitan: 'sedang',
        indikator: '',
        status: true,
      })

      if (targetKisiId) {
        loadExistingQuestionsForKisi(targetKisiId)
      } else {
        setModalSessionQuestions([])
      }
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingItem(null)
    setEditingModalQuestionId(null)
    fetchData(1)
    fetchStats()
  }

  const resetSingleQuestionForm = (customNextNum = null) => {
    setEditingModalQuestionId(null)
    const nextNum = customNextNum !== null ? customNextNum : (modalSessionQuestions.length + 1)
    setFormData((prev) => ({
      ...prev,
      kode_soal: `SOAL-${String(nextNum).padStart(2, '0')}`,
      pertanyaan: '',
      tipe_soal: 'pg',
      opsi_a: '',
      opsi_b: '',
      opsi_c: '',
      opsi_d: '',
      opsi_e: '',
      kunci_jawaban: 'A',
      pembahasan: '',
      poin: 2.5,
      tingkat_kesulitan: 'sedang',
      indikator: '',
      status: true,
    }))
  }

  const handleTypeChange = (newType) => {
    let defaultKunci = ''
    if (newType === 'pg') defaultKunci = 'A'
    if (newType === 'benar_salah') defaultKunci = 'Benar'
    if (newType === 'esai') defaultKunci = ''
    if (newType === 'menjodohkan') defaultKunci = ''

    setFormData((prev) => ({
      ...prev,
      tipe_soal: newType,
      kunci_jawaban: defaultKunci,
    }))
  }

  const handleKisiChange = (kisiId) => {
    const selectedKisi = options.kisi_kisi.find((k) => k.id === kisiId)
    setFormData((prev) => ({
      ...prev,
      kisi_kisi_id: kisiId,
      mata_pelajaran_id: selectedKisi ? selectedKisi.mata_pelajaran_id : prev.mata_pelajaran_id,
      kode_soal: '',
    }))
    if (kisiId) {
      loadExistingQuestionsForKisi(kisiId)
    } else {
      setModalSessionQuestions([])
    }
  }

  const handleAddPair = () => {
    setMatchingPairs((prev) => [...prev, { kiri: '', kanan: '' }])
  }

  const handleRemovePair = (index) => {
    if (matchingPairs.length <= 1) return
    setMatchingPairs((prev) => prev.filter((_, i) => i !== index))
  }

  const handlePairChange = (index, field, value) => {
    setMatchingPairs((prev) => {
      const copy = [...prev]
      copy[index][field] = value
      return copy
    })
  }

  const handleSaveQuestion = async (shouldClose = false) => {
    if (!formData.kisi_kisi_id) {
      notify('Pilih Kisi-kisi', 'Pilih Kisi-kisi Ujian / Mata Pelajaran terlebih dahulu.', 'warning')
      return
    }

    if (!formData.pertanyaan.trim()) {
      notify('Pertanyaan Kosong', 'Teks pertanyaan/soal tidak boleh kosong.', 'warning')
      return
    }

    if (formData.tipe_soal === 'menjodohkan') {
      const validPairs = matchingPairs.filter((p) => p.kiri.trim() && p.kanan.trim())
      if (validPairs.length === 0) {
        notify('Pasangan Tidak Lengkap', 'Masukkan minimal 1 pasangan yang valid untuk tipe Menjodohkan.', 'warning')
        return
      }
    }

    let payload = { ...formData }
    if (formData.tipe_soal === 'menjodohkan') {
      const validPairs = matchingPairs.filter((p) => p.kiri.trim() && p.kanan.trim())
      payload.kunci_jawaban = JSON.stringify(validPairs)
    }

    setIsSubmittingForm(true)
    try {
      if (editingModalQuestionId || editingItem) {
        const targetId = editingModalQuestionId || editingItem.id
        await lmsBankSoalService.update(targetId, payload)

        setModalSessionQuestions((prev) =>
          prev.map((q) => (q.id === targetId ? { ...payload, id: targetId } : q))
        )
        notify('Berhasil Disimpan', 'Butir soal berhasil diperbarui!', 'success')
        setIsSaveModalOpen(false)

        if (editingItem || shouldClose) {
          handleCloseModal()
          fetchData(pagination.currentPage)
          fetchStats()
          return
        }

        resetSingleQuestionForm(modalSessionQuestions.length + 1)
      } else {
        const res = await lmsBankSoalService.create(payload)
        const newItem = res?.data || { ...payload, id: Date.now() + Math.random() }

        const updatedList = [...modalSessionQuestions, newItem]
        setModalSessionQuestions(updatedList)
        setIsSaveModalOpen(false)

        const currentNum = updatedList.length
        const nextNum = currentNum + 1

        notify(
          'Soal Berhasil Disimpan!',
          `Soal #${currentNum} telah berhasil ditambahkan ke bank soal.${shouldClose ? '' : ` Silakan lanjutkan mengisi Soal #${nextNum}.`}`,
          'success'
        )

        if (shouldClose) {
          handleCloseModal()
          fetchData(1)
          fetchStats()
          return
        }

        resetSingleQuestionForm(nextNum)
      }

      fetchData(1)
      fetchStats()
    } catch (error) {
      console.error('Error saving question:', error)
      notify('Gagal Menyimpan', 'Terjadi kesalahan sistem saat menyimpan butir soal.', 'error')
    } finally {
      setIsSubmittingForm(false)
    }
  }

  const handleTriggerSave = (e) => {
    if (e) e.preventDefault()
    handleSaveQuestion(false)
  }

  const handleConfirmSave = async () => {
    await handleSaveQuestion(false)
  }

  const handleEditModalQuestionRow = (item) => {
    setEditingModalQuestionId(item.id)
    let defaultKunci = item.kunci_jawaban || ''
    if (item.tipe_soal === 'pg' && !defaultKunci) defaultKunci = 'A'
    if (item.tipe_soal === 'benar_salah' && !defaultKunci) defaultKunci = 'Benar'

    setFormData({
      kisi_kisi_id: item.kisi_kisi_id || formData.kisi_kisi_id,
      mata_pelajaran_id: item.mata_pelajaran_id || formData.mata_pelajaran_id,
      kode_soal: item.kode_soal || '',
      pertanyaan: item.pertanyaan || '',
      tipe_soal: item.tipe_soal || 'pg',
      opsi_a: item.opsi_a || '',
      opsi_b: item.opsi_b || '',
      opsi_c: item.opsi_c || '',
      opsi_d: item.opsi_d || '',
      opsi_e: item.opsi_e || '',
      kunci_jawaban: defaultKunci,
      pembahasan: item.pembahasan || '',
      poin: item.poin || 2.5,
      tingkat_kesulitan: item.tingkat_kesulitan || 'sedang',
      indikator: item.indikator || '',
      status: item.status !== undefined ? item.status : true,
    })
    const container = document.getElementById('modalFormScrollContainer')
    if (container) container.scrollTop = 0
  }

  const handleDeleteModalQuestionRow = async (id) => {
    try {
      await lmsBankSoalService.delete(id)
      setModalSessionQuestions((prev) => prev.filter((q) => q.id !== id))
      if (editingModalQuestionId === id) resetSingleQuestionForm()
      notify('Soal Dihapus', 'Pertanyaan telah dihapus dari repositori.', 'success')
      fetchData(1)
      fetchStats()
    } catch (err) {
      console.error('Error deleting question:', err)
      notify('Gagal Menghapus', 'Tidak dapat menghapus pertanyaan.', 'error')
    }
  }

  const handleDeletePrompt = (item) => {
    setDeleteModalState({
      isOpen: true,
      id: item.id,
      title: item.pertanyaan,
      isSubmitting: false,
    })
  }

  const handleConfirmDelete = async () => {
    setDeleteModalState((prev) => ({ ...prev, isSubmitting: true }))
    try {
      await lmsBankSoalService.delete(deleteModalState.id)
      notify('Soal Dihapus', 'Butir soal berhasil dihapus!', 'success')
      setDeleteModalState({ isOpen: false, id: null, title: '', isSubmitting: false })
      fetchData(pagination.currentPage)
      fetchStats()
    } catch (error) {
      console.error('Error deleting item:', error)
      notify('Gagal Menghapus', 'Tidak dapat menghapus butir soal.', 'error')
      setDeleteModalState((prev) => ({ ...prev, isSubmitting: false }))
    }
  }

  const handleDuplicate = async (id) => {
    try {
      await lmsBankSoalService.duplicate(id)
      notify('Soal Diduplikasi', 'Butir soal berhasil diduplikasi!', 'success')
      fetchData(pagination.currentPage)
      fetchStats()
    } catch (error) {
      console.error('Error duplicating item:', error)
      notify('Gagal Menduplikasi', 'Tidak dapat menduplikasi butir soal.', 'error')
    }
  }

  const handleToggleStatus = async (item) => {
    try {
      await lmsBankSoalService.update(item.id, { status: !item.status })
      notify('Status Diperbarui', `Status butir soal diubah menjadi ${!item.status ? 'Aktif' : 'Non-Aktif'}`, 'success')
      fetchData(pagination.currentPage)
      fetchStats()
    } catch (error) {
      console.error('Error toggling status:', error)
      notify('Gagal Mengubah Status', 'Terjadi kesalahan sistem.', 'error')
    }
  }

  const handleProcessExport = async (format = 'xlsx') => {
    if (!dataList.length) {
      notify('Data Kosong', 'Tidak ada butir soal untuk diekspor.', 'warning')
      return
    }
    setIsExporting(true)
    try {
      const exportData = dataList.map((item, i) => ({
        'No': i + 1,
        'Kode Soal': item.kode_soal || `SOAL-${item.id || i + 1}`,
        'Pertanyaan': (item.pertanyaan || item.soal || '').replace(/<[^>]*>?/gm, '').trim(),
        'Tipe Soal':
          item.tipe_soal === 'pg'
            ? 'Pilihan Ganda'
            : item.tipe_soal === 'esai'
              ? 'Esai / Uraian'
              : item.tipe_soal === 'benar_salah'
                ? 'Benar / Salah'
                : 'Menjodohkan',
        'Tingkat Kesulitan': (item.tingkat_kesulitan || 'sedang').toUpperCase(),
        'Bobot Poin': item.poin || 2.5,
        'Status': item.status ? 'Aktif' : 'Nonaktif',
      }))

      downloadSpreadsheetTemplate(
        exportData,
        `bank_soal_${new Date().toISOString().slice(0, 10)}`,
        format,
        'Bank Soal'
      )
      setIsExportModalOpen(false)
      notify('Export Berhasil', `Berkas Bank Soal .${format.toUpperCase()} berhasil diunduh.`, 'success')
    } catch (err) {
      notify('Gagal Export', err?.message || 'Terjadi kesalahan saat menyiapkan berkas ekspor.', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const getTipeBadge = (tipe) => {
    switch (tipe) {
      case 'pg':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
            <CheckSquare className="w-3.5 h-3.5" /> Pilihan Ganda
          </span>
        )
      case 'esai':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-2xs">
            <FileText className="w-3.5 h-3.5" /> Essay / Esai
          </span>
        )
      case 'benar_salah':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
            <ToggleLeft className="w-3.5 h-3.5" /> Benar / Salah
          </span>
        )
      case 'menjodohkan':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-2xs">
            <GitCommit className="w-3.5 h-3.5" /> Menjodohkan
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            {tipe}
          </span>
        )
    }
  }

  const getKesulitanBadge = (level) => {
    switch (level) {
      case 'mudah':
        return <span className="px-2 py-0.5 text-xs rounded-md bg-emerald- text-emerald- dark:bg-emerald-/50 dark:text-emerald- font-bold">Mudah</span>
      case 'sedang':
        return <span className="px-2 py-0.5 text-xs rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 font-bold">Sedang</span>
      case 'sulit':
        return <span className="px-2 py-0.5 text-xs rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 font-bold">Sulit</span>
      default:
        return <span className="px-2 py-0.5 text-xs rounded-md bg-slate-100 text-slate-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold">{level}</span>
    }
  }


  // Memoized mapel options for filters
  const filterMapelOptions = useMemo(() => {
    if ((options.subjects || options.mata_pelajaran) && (options.subjects || options.mata_pelajaran).length > 0) {
      return (options.subjects || options.mata_pelajaran).map((m) => ({
        value: m.id,
        label: m.name || m.nama_mapel || m.nama || m.label,
      }))
    }
    return Array.from(
      new Map(
        (options.kisi_kisi || [])
          .filter((k) => k.mata_pelajaran_id || k.mata_pelajaran)
          .map((k) => {
            const id = k.mata_pelajaran_id || k.mata_pelajaran?.id || (typeof k.mata_pelajaran === 'string' ? k.mata_pelajaran : k.id)
            const name = typeof k.mata_pelajaran === 'object' ? (k.mata_pelajaran.name || k.mata_pelajaran.nama) : (k.mata_pelajaran || k.judul_kisi)
            return [id, { id, name }]
          })
      ).values()
    ).map((m) => ({
      value: m.id,
      label: m.name || m.nama_mapel || m.nama || m.label,
    }))
  }, [options.subjects, options.mata_pelajaran, options.kisi_kisi])

  // Canonical Columns for Bank Soal
  const soalColumns = useMemo(() => [
    {
      key: 'kode_soal',
      label: 'Kode & Tipe',
      width: '16%',
      render: (item) => (
        <div>
          <span className="font-mono text-xs font-extrabold text-emerald-800 dark:text-emerald-400 block mb-1">
            {item?.kode_soal || 'SOAL-SYS'}
          </span>
          <div>{getTipeBadge(item?.tipe_soal)}</div>
        </div>
      ),
    },
    {
      key: 'pertanyaan',
      label: 'Pertanyaan / Butir Soal',
      render: (item) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-relaxed group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
            {item?.pertanyaan}
          </p>
          {item?.indikator && (
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 truncate">
              Indikator: {item.indikator}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'kisi_kisi',
      label: 'Kisi-kisi & Mapel',
      width: '18%',
      render: (item) => (
        <div>
          <div className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate max-w-xs flex items-center gap-1.5">
            <span className="truncate">{item?.kisi_kisi?.judul_kisi || 'Umum'}</span>
            {item?.kisi_kisi?.kelas && (
              <span className="inline-flex shrink-0 items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {item.kisi_kisi.kelas}
              </span>
            )}
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-xs">
            {getMapelName(item)}
          </div>
        </div>
      ),
    },
    {
      key: 'poin',
      label: 'Poin & Level',
      width: '10%',
      align: 'center',
      render: (item) => (
        <div className="space-y-1">
          <div>{getKesulitanBadge(item?.tingkat_kesulitan)}</div>
          <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 block tabular-nums">
            {item?.poin} Poin
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '8%',
      align: 'center',
      render: (item) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleToggleStatus(item)
          }}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold transition-all shadow-2xs ${item?.status
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
            : 'bg-slate-100 text-slate-600 dark:bg-sky-950/60 dark:text-sky-300'
            }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${item?.status ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          {item?.status ? 'Aktif' : 'Non-Aktif'}
        </button>
      ),
    },
  ], [options])

  return (
    <PageContainer maxW="7xl">

      {!(embedded || hideBreadcrumb) && (
        <div className="mb-4">
          <AppBreadcrumb
            items={[
              { label: 'LMS & Akademik', href: '/dashboard' },
              { label: 'Bank Soal Ujian' },
            ]}
          />
        </div>
      )}

      <div className="lms-bank-soal-page space-y-6 pb-12">
        {/* Modern Hero Header Card */}
        {!hidePageHeader && (
          <div className="mb-6">
            <HeroUiHeader
              title="Bank Soal & Repositori Ujian"
              subtitle="Kelola repositori butir soal terintegrasi Kisi-kisi Ujian dengan dukungan Pilihan Ganda, Esai, Benar-Salah, dan Menjodohkan."
              badge="Evaluasi & CBT Terpadu"
              icon={Layers}
            />
          </div>
        )}

        {/* Modern Multi-Tone KPI Summary Cards (Interactive Filters) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          <ModernKpiCard
            icon={Layers}
            label="Total Soal"
            value={stats.total_soal}
            tag="Semua Soal"
            subtext={`${stats.total_aktif} Butir Aktif`}
            tone="emerald"
            active={filters.tipe_soal === ''}
            onClick={() => setKpiModalKey('all')}
          />
          <ModernKpiCard
            icon={CheckSquare}
            label="Pilihan Ganda"
            value={stats.total_pg}
            tag="Tipe PG"
            subtext="Opsi A s.d. E"
            tone="sky"
            active={filters.tipe_soal === 'pg'}
            onClick={() => setKpiModalKey('pg')}
          />
          <ModernKpiCard
            icon={FileText}
            label="Essay / Esai"
            value={stats.total_esai}
            tag="Esai Uraian"
            subtext="Rubrik & Penskoran"
            tone="purple"
            active={filters.tipe_soal === 'esai'}
            onClick={() => setKpiModalKey('esai')}
          />
          <ModernKpiCard
            icon={ToggleLeft}
            label="Benar / Salah"
            value={stats.total_benar_salah}
            tag="Tipe B/S"
            subtext="Pernyataan B/S"
            tone="blue"
            active={filters.tipe_soal === 'benar_salah'}
            onClick={() => setKpiModalKey('benar_salah')}
          />
          <ModernKpiCard
            icon={GitCommit}
            label="Menjodohkan"
            value={stats.total_menjodohkan}
            tag="Matching"
            subtext="Pasangan Item"
            tone="amber"
            active={filters.tipe_soal === 'menjodohkan'}
            onClick={() => setKpiModalKey('menjodohkan')}
          />
        </div>

        {/* Tab Navigation (if provided) */}
        {tabNav && <div>{typeof tabNav === 'function' ? tabNav() : tabNav}</div>}

        {/* Master Datatable Panel (Canonical Emerald Datatable Container) */}
        <AppDataTable
          id="tabel-bank-soal"
          title="Daftar Butir Bank Soal Ujian"
          subtitle="Repositori butir pertanyaan ujian berbasis kisi-kisi dan kurikulum aktif."
          icon={FileQuestion}
          countLabel={`${pagination.total} Soal`}
          actions={
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-start sm:self-auto flex-wrap">
              <div className="inline-flex items-center rounded-xl bg-emerald-900/10 dark:bg-emerald-950/60 p-1 border border-emerald-200/80 dark:border-emerald-800/60">
                <button
                  type="button"
                  onClick={() => setViewLayout('grouped')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${viewLayout === 'grouped'
                    ? 'bg-emerald-600 text-white shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                    }`}
                  title="Tampilan Grup per Kisi-kisi & Mapel"
                >
                  <Folder className="h-3.5 w-3.5" />
                  <span>Grup Kisi-kisi</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewLayout('flat')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${viewLayout === 'flat'
                    ? 'bg-emerald-600 text-white shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                    }`}
                  title="Tampilan Tabel Rata Semua Soal"
                >
                  <Table className="h-3.5 w-3.5" />
                  <span>Semua Soal</span>
                </button>
              </div>

              <div className="hidden sm:block h-6 w-px bg-emerald-200 dark:bg-emerald-800" />

              <PageToolbarActions
                onPrint={() => setIsPrintModalOpen(true)}
                printLabel="Cetak & PDF"
                onImport={() => setImportOpen(true)}
                importLabel="Import Data"
                onExport={() => setIsExportModalOpen(true)}
                exportLabel="Export Data"
                onAdd={() => handleOpenModal()}
                addLabel="Tambah Soal Baru"
              />
            </div>
          }
          search={searchInput}
          onSearchChange={(e) => {
            setSearchInput(e.target.value)
            setPage(1)
          }}
          searchPlaceholder="Cari butir soal, kode soal, indikator kompetensi..."
          filters={
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:flex xl:flex-wrap items-center gap-2.5 flex-1 min-w-0">
                {canSelectUnit ? (
                  <HeroUiFilterSelect
                    value={selectedUnit}
                    onChange={(val) => {
                      setSelectedUnit(val)
                      setPage(1)
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
                    title="Unit Terkunci: Menampilkan data khusus unit wewenang Anda"
                    className="inline-flex h-9 items-center justify-between gap-2 rounded-xl border-2 border-emerald-300/80 bg-white/95 dark:bg-emerald-950/60 dark:border-emerald-700/80 px-3.5 text-xs font-bold text-emerald-800 dark:text-emerald-200 shadow-2xs w-full sm:w-auto shrink-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <School className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="truncate max-w-[200px] font-extrabold">{userUnitName || 'Unit Terikat'}</span>
                    </div>
                    <Lock className="size-3 text-emerald-500/80 shrink-0 ml-1" />
                  </div>
                )}

                <HeroUiFilterSelect
                  value={filters.mata_pelajaran_id || ''}
                  onChange={(val) => {
                    setFilters((prev) => ({ ...prev, mata_pelajaran_id: val }))
                    setPage(1)
                  }}
                  placeholder="Semua Mata Pelajaran"
                  icon={BookOpen}
                  popoverWidth="min-w-[240px]"
                  searchable
                  options={[
                    { value: '', label: 'Semua Mata Pelajaran' },
                    ...filterMapelOptions,
                  ]}
                />

                <HeroUiFilterSelect
                  value={filters.kelas_id || ''}
                  onChange={(val) => {
                    setFilters((prev) => ({ ...prev, kelas_id: val }))
                    setPage(1)
                  }}
                  placeholder="Semua Rombel / Kelas"
                  icon={Layers}
                  popoverWidth="min-w-[180px]"
                  options={[
                    { value: '', label: 'Semua Rombel / Kelas' },
                    ...(options.kelas || []).map((c) => ({
                      value: c.id,
                      label: c.nama_kelas || c.name,
                    })),
                  ]}
                />

                <HeroUiFilterSelect
                  value={filters.kisi_kisi_id || ''}
                  onChange={(val) => {
                    setFilters((prev) => ({ ...prev, kisi_kisi_id: val }))
                    setPage(1)
                  }}
                  placeholder="Semua Kisi-kisi Ujian"
                  icon={FileText}
                  popoverWidth="min-w-[260px]"
                  searchable
                  options={[
                    { value: '', label: 'Semua Kisi-kisi Ujian' },
                    ...(options.kisi_kisi || []).map((k) => ({
                      value: k.id,
                      label: `${k.judul_kisi} (${k.jenis_ujian})`,
                    })),
                  ]}
                />

                <HeroUiFilterSelect
                  value={filters.tipe_soal || ''}
                  onChange={(val) => {
                    setFilters((prev) => ({ ...prev, tipe_soal: val }))
                    setPage(1)
                  }}
                  placeholder="Semua Tipe Soal"
                  icon={CheckSquare}
                  popoverWidth="min-w-[170px]"
                  options={[
                    { value: '', label: 'Semua Tipe Soal' },
                    { value: 'pg', label: 'Pilihan Ganda' },
                    { value: 'esai', label: 'Essay / Esai' },
                    { value: 'benar_salah', label: 'Benar / Salah' },
                    { value: 'menjodohkan', label: 'Menjodohkan' },
                  ]}
                />

                <HeroUiFilterSelect
                  value={filters.tingkat_kesulitan || ''}
                  onChange={(val) => {
                    setFilters((prev) => ({ ...prev, tingkat_kesulitan: val }))
                    setPage(1)
                  }}
                  placeholder="Semua Tingkat Kesulitan"
                  icon={Sparkles}
                  popoverWidth="min-w-[190px]"
                  options={[
                    { value: '', label: 'Semua Tingkat Kesulitan' },
                    { value: 'mudah', label: 'Tingkat: Mudah' },
                    { value: 'sedang', label: 'Tingkat: Sedang' },
                    { value: 'sulit', label: 'Tingkat: Sulit' },
                  ]}
                />
              </div>

              {((canSelectUnit && selectedUnit) || searchInput || filters.mata_pelajaran_id || filters.kisi_kisi_id || filters.kelas_id || filters.tipe_soal || filters.tingkat_kesulitan) && (
                <button
                  type="button"
                  onClick={() => {
                    if (canSelectUnit) setSelectedUnit('')
                    setSearchInput('')
                    setFilters({ mata_pelajaran_id: '', kisi_kisi_id: '', kelas_id: '', tipe_soal: '', tingkat_kesulitan: '', status: '' })
                    setPage(1)
                  }}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50/90 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 px-3.5 text-xs font-bold text-rose-700 dark:text-rose-300 transition-all cursor-pointer shrink-0 shadow-2xs hover:scale-102 active:scale-98 self-end xl:self-center"
                  title="Reset Semua Filter"
                >
                  <RotateCcw className="size-3.5 text-rose-600 dark:text-rose-400" />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>
          }
          columns={soalColumns}
          data={dataList}
          isLoading={loading}
          page={pagination.currentPage}
          totalPages={pagination.lastPage}
          onPageChange={setPage}
          onRowClick={(item) => {
            setRowDetailItem(item)
            setShowRowDetailModal(true)
          }}
          onView={(item) => {
            setViewingItem(item)
            setShowDetailModal(true)
          }}
          onEdit={(item) => handleOpenModal(item)}
          onDelete={(item) => handleDeletePrompt(item)}
          extraItems={(item) => [
            {
              label: 'Duplikasi Butir Soal',
              icon: Copy,
              onClick: () => handleDuplicate(item?.id),
            },
          ]}
          renderMobileCard={(item) => (
            <MobileDataCard
              key={item?.id}
              title={item?.pertanyaan || 'Pertanyaan'}
              subtitle={`${item?.kode_soal || 'SOAL-SYS'} • ${getMapelName(item)}`}
              badge={item?.tipe_soal?.toUpperCase()}
              badgeVariant={item?.status ? 'success' : 'neutral'}
              fields={[
                { label: 'Kisi-kisi', value: item?.kisi_kisi?.judul_kisi || 'Umum', icon: FileText },
                { label: 'Poin', value: `${item?.poin || 0} Poin`, icon: Sparkles },
                { label: 'Level', value: item?.tingkat_kesulitan || '-', icon: Layers },
              ]}
              onView={() => {
                setViewingItem(item)
                setShowDetailModal(true)
              }}
              onEdit={() => handleOpenModal(item)}
              onDelete={() => handleDeletePrompt(item)}
              extraActions={[
                {
                  label: 'Duplikasi Soal',
                  icon: Copy,
                  onClick: () => handleDuplicate(item?.id),
                },
              ]}
            />
          )}
          renderTable={viewLayout === 'grouped' ? () => (
            <div className="p-4 sm:p-6 space-y-4">
              {/* Group View Top Summary Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-[#1B2433] dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/40 rounded-xl p-3 sm:px-4 border border-emerald-200/80 dark:border-emerald-800/60">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-black text-xs shadow-2xs">
                    <Folder className="h-4 w-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100">
                    Paket Soal per Kisi-kisi &amp; Mapel
                  </span>
                  <span className="rounded-full bg-emerald-200/70 dark:bg-emerald-900/60 px-2 py-0.5 text-xs font-black text-emerald-800 dark:text-emerald-300">
                    {groupedData.length} Paket
                  </span>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={expandAllGroups}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 transition-colors"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                    <span>Buka Semua</span>
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <button
                    type="button"
                    onClick={collapseAllGroups}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                    <span>Tutup Semua</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="py-14 text-center text-slate-400">
                  <RefreshCw className="h-7 w-7 animate-spin mx-auto mb-2 text-[#0E5C44]" />
                  <p className="text-xs font-semibold">Memuat paket kisi-kisi dan butir soal...</p>
                </div>
              ) : groupedData.length === 0 ? (
                <div className="py-16 text-center text-slate-400 rounded-xl border-2 border-dashed border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/10">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 mb-3">
                    <HelpCircle className="h-7 w-7" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Belum Ada Paket Kisi-kisi &amp; Soal</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Belum ditemukan kisi-kisi atau butir soal sesuai kata kunci pencarian atau filter yang dipilih.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleOpenModal()}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-[#1B2433] px-4 py-2 text-xs font-bold shadow-md shadow-sm hover:brightness-105 transition-all border border-emerald-200/80 dark:border-emerald-800/60"
                  >
                    <Plus className="h-4 w-4" /> Tambah Soal Baru
                  </button>
                </div>
              ) : (
                groupedData.map((group) => {
                  const groupKey = group.kisi_kisi_id || 'unassigned'
                  const isExpanded = expandedGroups[groupKey] !== false
                  const hasTarget = Boolean(group.target_jumlah_soal && group.target_jumlah_soal > 0)
                  const isComplete = hasTarget ? group.items.length >= group.target_jumlah_soal : false
                  const percent = hasTarget
                    ? Math.min(100, Math.round((group.items.length / group.target_jumlah_soal) * 100))
                    : 100

                  return (
                    <div
                      key={groupKey}
                      className="rounded-xl border-2 border-emerald-200/90 dark:border-emerald-800/70 bg-white dark:bg-[#1B2433] shadow-xs overflow-hidden transition-all"
                    >
                      {/* Accordion Group Header */}
                      <div
                        onClick={() => toggleGroup(groupKey)}
                        className="cursor-pointer select-none bg-white dark:bg-[#1B2433] dark:from-emerald-950/50 dark:via-teal-950/20 dark:to-transparent px-4 py-3.5 sm:px-5 border-b border-emerald-200/70 dark:border-emerald-800/60 hover:bg-emerald-50/90 dark:hover:bg-emerald-950/70 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          {/* Left Group Info */}
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="size-9 rounded-xl bg-slate-100 border border-emerald-200/70 text-slate-700 dark:bg-slate-800 dark:border-emerald-800/60 dark:text-slate-300 flex items-center justify-center shrink-0 shadow-2xs mt-0.5 sm:mt-0">
                              <Folder className="h-4.5 w-4.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                                  {group.judul_kisi}
                                </h3>
                                {group.kelas && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald- text-emerald- dark:bg-emerald- dark:text-emerald-">
                                    {group.kelas}
                                  </span>
                                )}
                                {group.jenis_ujian && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                    {group.jenis_ujian}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-xs font-semibold text-slate-600 dark:text-slate-400 flex-wrap">
                                <span className="inline-flex items-center gap-1 text-emerald-800 dark:text-emerald-300 font-bold">
                                  <BookOpen className="h-3.5 w-3.5" />
                                  {group.mapel_name}
                                </span>
                                <span>•</span>
                                <span className="text-slate-500 dark:text-slate-400">
                                  {group.items.length} Soal Terdaftar
                                </span>
                                <span>•</span>
                                <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">
                                  Total {group.total_poin.toFixed(1)} Poin
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right Controls & Target Progress */}
                          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-emerald-100 dark:border-emerald-900/40">
                            {hasTarget && (
                              <div className="flex flex-col gap-1 min-w-[120px] max-w-[150px]">
                                <div className="flex items-center justify-between text-xs font-extrabold">
                                  <span className={isComplete ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}>
                                    {group.items.length}/{group.target_jumlah_soal} Soal
                                  </span>
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                                    {percent}%
                                  </span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${isComplete
                                      ? 'bg-white dark:bg-[#1B2433]'
                                      : 'bg-white dark:bg-[#1B2433]'
                                      }`}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* + Tambah Soal Button directly into this Kisi-kisi */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenModal(null, {
                                  kisi_kisi_id: group.kisi_kisi_id,
                                  mata_pelajaran_id: group.mata_pelajaran_id,
                                })
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-[#1B2433] px-3 py-1.5 text-xs font-bold shadow-xs hover:brightness-105 transition-all border border-emerald-200/80 dark:border-emerald-800/60"
                              title={`Tambah Soal Baru ke ${group.judul_kisi}`}
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Tambah Soal</span>
                            </button>

                            {/* Chevron Toggle Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleGroup(groupKey)
                              }}
                              className="size-8 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center hover:bg-emerald-200/80 dark:hover:bg-emerald-900 transition-colors"
                              title={isExpanded ? 'Tutup Detail Soal' : 'Lihat Butir Soal'}
                            >
                              {isExpanded ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Accordion Group Body */}
                      {isExpanded && (
                        <div>
                          {group.items.length === 0 ? (
                            <div className="p-8 text-center bg-emerald-50/20 dark:bg-emerald-950/10">
                              <div className="mx-auto flex h-9 w-11 items-center justify-center rounded-xl bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-700 mb-2">
                                <FileText className="h-5 w-5" />
                              </div>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                Belum Ada Butir Soal di Paket Ini
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Mulai buat butir soal pertama untuk {group.judul_kisi} {hasTarget ? `(target ${group.target_jumlah_soal} soal)` : ''}.
                              </p>
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenModal(null, {
                                    kisi_kisi_id: group.kisi_kisi_id,
                                    mata_pelajaran_id: group.mata_pelajaran_id,
                                  })
                                }
                                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-[#1B2433] px-3.5 py-1.5 text-xs font-bold shadow-xs hover:brightness-105 transition-all border border-emerald-200/80 dark:border-emerald-800/60"
                              >
                                <Plus className="h-3.5 w-3.5" /> Buat Butir Soal Pertama
                              </button>
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <TableRoot className="w-full text-left text-sm border-collapse">
                                <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/60 dark:text-emerald-100 font-bold text-xs uppercase tracking-wider">
                                  <TableRow className="text-emerald-950 dark:text-emerald-200 text-xs font-black uppercase tracking-wider">
                                    <TableHead className="w-[18%] px-4 py-2.5 text-xs">Kode & Tipe</TableHead>
                                    <TableHead className="w-auto px-4 py-2.5 text-xs">Pertanyaan / Butir Soal</TableHead>
                                    <TableHead className="hidden sm:table-cell w-[14%] px-3 py-2.5 text-center text-xs">Poin & Level</TableHead>
                                    <TableHead className="hidden md:table-cell w-[10%] px-3 py-2.5 text-center text-xs">Status</TableHead>
                                    <TableHead className="w-16 px-3 py-2.5 text-right select-none"></TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-emerald-100/70 dark:divide-emerald-900/40 text-sm">
                                  {group.items.map((item, itemIdx) => (
                                    <TableRow
                                      key={item.id}
                                      onClick={() => {
                                        setRowDetailItem(item)
                                        setShowRowDetailModal(true)
                                      }}
                                      className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors cursor-pointer group"
                                    >
                                      {/* Kode & Tipe */}
                                      <TableCell className="py-3 px-4 align-top">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-xs font-black text-slate-400 dark:text-slate-500 w-5">
                                            #{itemIdx + 1}
                                          </span>
                                          <span className="font-mono text-xs font-extrabold text-emerald-800 dark:text-emerald-400">
                                            {item.kode_soal || `SOAL-${itemIdx + 1}`}
                                          </span>
                                        </div>
                                        <div className="mt-1">{getTipeBadge(item.tipe_soal)}</div>
                                      </TableCell>

                                      {/* Pertanyaan */}
                                      <TableCell className="py-3 px-4 align-top">
                                        <p className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-relaxed group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                                          {item.pertanyaan}
                                        </p>
                                        {item.indikator && (
                                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                            Indikator: {item.indikator}
                                          </p>
                                        )}
                                      </TableCell>

                                      {/* Poin & Level */}
                                      <TableCell className="hidden sm:table-cell py-3 px-3 text-center align-top">
                                        <div className="space-y-1">
                                          <div>{getKesulitanBadge(item.tingkat_kesulitan)}</div>
                                          <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 block tabular-nums">
                                            {item.poin} Poin
                                          </span>
                                        </div>
                                      </TableCell>

                                      {/* Status */}
                                      <TableCell
                                        className="hidden md:table-cell py-3 px-3 text-center align-top"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <button
                                          type="button"
                                          onClick={() => handleToggleStatus(item)}
                                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold transition-all shadow-2xs ${item.status
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                            : 'bg-slate-100 text-slate-600 dark:bg-sky-950/60 dark:text-sky-300'
                                            }`}
                                        >
                                          <span className={`w-1.5 h-1.5 rounded-full ${item.status ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                          {item.status ? 'Aktif' : 'Non-Aktif'}
                                        </button>
                                      </TableCell>

                                      {/* Aksi */}
                                      <TableCell
                                        className="py-3 px-3 text-center align-top"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <ActionDropdown
                                          onView={() => {
                                            setViewingItem(item)
                                            setShowDetailModal(true)
                                          }}
                                          onEdit={() => handleOpenModal(item)}
                                          onDelete={() => handleDeletePrompt(item)}
                                          customActions={[
                                            {
                                              label: 'Duplikasi Butir Soal',
                                              icon: Copy,
                                              onClick: () => handleDuplicate(item.id),
                                            },
                                          ]}
                                        />
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </TableRoot>

                              {/* Footer of Kisi-kisi card */}
                              <div className="bg-white dark:bg-[#1B2433] dark:bg-slate-900/50 p-2.5 px-4 border-t border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                  Menampilkan {group.items.length} butir pertanyaan
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenModal(null, {
                                      kisi_kisi_id: group.kisi_kisi_id,
                                      mata_pelajaran_id: group.mata_pelajaran_id,
                                    })
                                  }
                                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                  <span>Tambah Soal Berikutnya ke Paket Ini</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>

          ) : undefined}
        />

        {/* Print & PDF Modal */}
        <PrintOptionModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title="Bank Soal Ujian"
          onPrint={() => {
            const rowsToPrint = Array.isArray(dataList) ? dataList : []
            printCleanTable({
              title: 'Laporan Repositori Bank Soal Ujian',
              subtitle: 'Daftar Butir Pertanyaan CBT Sekolah Islam Terpadu',
              headers: ['NO', 'KODE SOAL', 'PERTANYAAN', 'TIPE SOAL', 'TINGKAT KESULITAN', 'POIN', 'STATUS'],
              rows: rowsToPrint.map((item, i) => [
                i + 1,
                item.kode_soal || 'SOAL-SYS',
                (item.pertanyaan || item.soal || '').replace(/<[^>]*>?/gm, ''),
                item.tipe_soal || 'pg',
                item.tingkat_kesulitan || 'sedang',
                item.poin || 2.5,
                item.status ? 'Aktif' : 'Nonaktif',
              ]),
            })
          }}
          onDownload={() => {
            const rowsToPrint = Array.isArray(dataList) ? dataList : []
            downloadPdfTable({
              title: 'Laporan Repositori Bank Soal Ujian',
              subtitle: 'Daftar Butir Pertanyaan CBT Sekolah Islam Terpadu',
              headers: ['NO', 'KODE SOAL', 'PERTANYAAN', 'TIPE SOAL', 'TINGKAT KESULITAN', 'POIN', 'STATUS'],
              rows: rowsToPrint.map((item, i) => [
                i + 1,
                item.kode_soal || 'SOAL-SYS',
                (item.pertanyaan || item.soal || '').replace(/<[^>]*>?/gm, ''),
                item.tipe_soal || 'pg',
                item.tingkat_kesulitan || 'sedang',
                item.poin || 2.5,
                item.status ? 'Aktif' : 'Nonaktif',
              ]),
              filename: 'laporan_bank_soal_ujian.pdf',
            })
          }}
        />

        {/* Harmonized Batch Import Modal */}
        <HarmonizedBatchImportModal
          isOpen={importOpen}
          onClose={() => setImportOpen(false)}
          onImportSuccess={() => {
            fetchData(1)
            fetchStats()
          }}
          notify={notify}
        />

        {/* Harmonized Save Confirmation Modal */}
        <HarmonizedSaveModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          onConfirm={handleConfirmSave}
          isEdit={Boolean(editingModalQuestionId || editingItem)}
          title={formData.pertanyaan ? formData.pertanyaan.replace(/<[^>]*>?/gm, '') : 'Butir Pertanyaan Soal'}
          isSubmitting={isSubmittingForm}
        />

        {/* Harmonized Delete Confirmation Modal */}
        <HarmonizedDeleteModal
          isOpen={deleteModalState.isOpen}
          onClose={() => setDeleteModalState({ isOpen: false, id: null, title: '', isSubmitting: false })}
          onConfirm={handleConfirmDelete}
          title={deleteModalState.title}
          isSubmitting={deleteModalState.isSubmitting}
        />

        {/* ROW DETAIL MODAL POPUP — Quick Preview */}
        <AppModal
          isOpen={showRowDetailModal && Boolean(rowDetailItem)}
          onClose={() => setShowRowDetailModal(false)}
          title={rowDetailItem?.pertanyaan}
          description={`${rowDetailItem?.kode_soal || 'SOAL-SYS'} • ${getMapelName(rowDetailItem)}`}
          icon={HelpCircle}
          maxWidth="max-w-lg"
          zIndex={50}
          bodyClassName="space-y-3.5"
          footer={
            <div className="flex items-center justify-between gap-3 w-full">
              <button
                onClick={() => setShowRowDetailModal(false)}
                className="px-4 py-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Tutup
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowRowDetailModal(false)
                    handleDeletePrompt(rowDetailItem)
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus
                </button>
                <button
                  onClick={() => {
                    setShowRowDetailModal(false)
                    handleOpenModal(rowDetailItem)
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Soal
                </button>
              </div>
            </div>
          }
        >
          {rowDetailItem && (
            <>
              <div className="flex flex-wrap gap-2">
                {getTipeBadge(rowDetailItem.tipe_soal)}
                {getKesulitanBadge(rowDetailItem.tingkat_kesulitan)}
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${rowDetailItem.status ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 text-slate-600 dark:bg-sky-950/60 dark:text-sky-300 border border-emerald-200/80 dark:border-emerald-800/60'
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${rowDetailItem.status ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  {rowDetailItem.status ? 'Aktif' : 'Non-Aktif'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-emerald-50/80 dark:bg-emerald-950/30 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/40">
                  <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Poin Bobot</p>
                  <p className="text-base font-black text-emerald-800 dark:text-emerald-300 mt-0.5 tabular-nums">{rowDetailItem.poin} Poin</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 border border-emerald-200/80 dark:border-emerald-800/60">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Kisi-kisi Ujian</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-white mt-0.5 line-clamp-1">{rowDetailItem.kisi_kisi?.judul_kisi || 'Umum'}</p>
                </div>
                {rowDetailItem.kunci_jawaban && (
                  <div className="bg-blue-50/80 dark:bg-blue-950/30 rounded-xl p-3 col-span-2 border border-blue-100 dark:border-blue-900/40">
                    <p className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider">Kunci Jawaban</p>
                    <p className="text-xs font-bold text-blue-900 dark:text-blue-200 mt-0.5">{rowDetailItem.kunci_jawaban}</p>
                  </div>
                )}
              </div>

              {rowDetailItem.indikator && (
                <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 border border-emerald-200/80 dark:border-emerald-800/60">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Indikator Soal</p>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{rowDetailItem.indikator}</p>
                </div>
              )}

              {rowDetailItem.pembahasan && (
                <div className="bg-purple-50/80 dark:bg-purple-950/30 rounded-xl p-3 border border-purple-100 dark:border-purple-900/40">
                  <p className="text-[10px] font-black text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-1">Pembahasan &amp; Keterangan</p>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-4">{rowDetailItem.pembahasan}</p>
                </div>
              )}
            </>
          )}
        </AppModal>

        {/* CRUD Form Modal — Tambah & Kelola Pertanyaan */}
        <AppModal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={editingItem ? 'Edit Butir Soal' : 'Form Tambah & Kelola Pertanyaan Bank Soal'}
          description="Pertanyaan yang disimpan otomatis terdaftar pada kisi-kisi dan dapat diedit langsung di bawah."
          icon={editingItem ? Edit3 : Plus}
          maxWidth="max-w-4xl"
          zIndex={50}
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500 font-medium">
                {modalSessionQuestions.length > 0
                  ? `${modalSessionQuestions.length} pertanyaan telah tersimpan`
                  : 'Siap menginput butir soal baru'}
              </span>
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-5 py-2.5 rounded-lg bg-[#0E5C44] text-white text-xs font-bold shadow-md transition-all cursor-pointer border border-emerald-600 h-9 text-sm font-medium"
              >
                Selesai &amp; Tutup Modal
              </button>
            </div>
          }
        >
          <form id="modalFormScrollContainer" onSubmit={handleTriggerSave} className="space-y-5">
                {/* Active Question Step Indicator (Multi-question builder header) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-[#1B2433] border-2 border-emerald-300/80 dark:border-emerald-700/60 rounded-xl shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] font-black text-sm shadow-md shadow-sm border border-emerald-200/80 dark:border-emerald-800/60">
                      #{editingModalQuestionId ? (modalSessionQuestions.findIndex((q) => q.id === editingModalQuestionId) + 1 || '?') : (modalSessionQuestions.length + 1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                          {editingModalQuestionId ? 'Mengubah Soal Terpilih' : `Mengisi Butir Soal #${modalSessionQuestions.length + 1}`}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {formData.tipe_soal.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        {modalSessionQuestions.length > 0
                          ? `${modalSessionQuestions.length} soal telah tersimpan di kisi-kisi ini. Klik "Simpan & Tambah Soal #${modalSessionQuestions.length + 2}" setelah butir ini selesai.`
                          : 'Mulai buat butir soal pertama untuk kisi-kisi ini, lalu lanjutkan ke soal kedua dan seterusnya.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {editingModalQuestionId ? (
                      <button
                        type="button"
                        onClick={() => resetSingleQuestionForm(modalSessionQuestions.length + 1)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Batal &amp; Tambah Soal Baru</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-white/80 dark:bg-slate-900/80 px-3 py-1 rounded-xl border border-emerald-200/60 shadow-2xs">
                        {modalSessionQuestions.length} Soal Tersimpan
                      </span>
                    )}
                  </div>
                </div>

                {/* Notification Banner when in Edit Mode */}
                {editingModalQuestionId && (
                  <div className="p-3 bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 rounded-xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 font-bold">
                    <span>Anda sedang mengubah butir pertanyaan terpilih dari tabel di bawah.</span>
                    <button
                      type="button"
                      onClick={() => resetSingleQuestionForm(modalSessionQuestions.length + 1)}
                      className="text-xs underline text-amber-950 dark:text-amber-200 hover:opacity-80"
                    >
                      Batal Edit &amp; Tambah Baru
                    </button>
                  </div>
                )}

                {/* Select Kisi-kisi & Kode */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <HeroUiModalSelect
                      label="Kisi-kisi Ujian / Mapel"
                      required
                      value={formData.kisi_kisi_id}
                      onChange={(val) => handleKisiChange(val)}
                      placeholder="-- Pilih Kisi-kisi / Mapel Ujian --"
                      icon={FileText}
                      searchable
                      options={options.kisi_kisi.map((k) => ({
                        value: k.id,
                        label: `${k.judul_kisi} (${k.jenis_ujian} - ${k.subject_name || k.mata_pelajaran})`,
                      }))}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Kode Soal (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: PPKN-001 / SOAL-01"
                      value={formData.kode_soal}
                      onChange={(e) => setFormData((prev) => ({ ...prev, kode_soal: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-lg border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-white dark:bg-slate-900 focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/12 outline-none"
                    />
                  </div>
                </div>

                {/* Tipe Soal Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Tipe Soal <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    {[
                      { id: 'pg', label: 'Pilihan Ganda', icon: CheckSquare },
                      { id: 'esai', label: 'Essay / Esai', icon: FileText },
                      { id: 'benar_salah', label: 'Benar / Salah', icon: ToggleLeft },
                      { id: 'menjodohkan', label: 'Menjodohkan', icon: GitCommit },
                    ].map((t) => {
                      const IconComp = t.icon
                      const isSelected = formData.tipe_soal === t.id
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleTypeChange(t.id)}
                          className={`flex items-center gap-2 p-3 rounded-xl border text-left text-xs font-bold transition-all ${isSelected
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500'
                            : 'border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                            }`}
                        >
                          <IconComp className="w-4 h-4 shrink-0" />
                          <span>{t.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Pertanyaan / Teks Soal */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Teks Pertanyaan / Soal <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tuliskan butir soal atau instruksi pertanyaan di sini..."
                    value={formData.pertanyaan}
                    onChange={(e) => setFormData((prev) => ({ ...prev, pertanyaan: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-lg border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-white dark:bg-slate-900 focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/12 outline-none leading-relaxed"
                    required
                  />
                </div>

                {/* DYNAMIC FORM SECTION BASED ON TIPE_SOAL */}
                {/* 1. PILIHAN GANDA */}
                {formData.tipe_soal === 'pg' && (
                  <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-4.5 rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 space-y-3">
                    <h4 className="text-xs font-black text-[#0E5C44] dark:text-emerald-300 uppercase tracking-wider">
                      Opsi Jawaban &amp; Kunci Pilihan Ganda
                    </h4>

                    {['a', 'b', 'c', 'd', 'e'].map((optKey) => {
                      const fieldKey = `opsi_${optKey}`
                      const isCorrect = formData.kunci_jawaban === optKey.toUpperCase()
                      return (
                        <div key={optKey} className="flex items-center gap-2">
                          <label className="flex items-center gap-2 cursor-pointer shrink-0">
                            <input
                              type="radio"
                              name="kunci_jawaban_pg"
                              checked={isCorrect}
                              onChange={() => setFormData((prev) => ({ ...prev, kunci_jawaban: optKey.toUpperCase() }))}
                              className="w-4 h-4 text-[#0E5C44] focus:ring-[#0E5C44]"
                            />
                            <span
                              className={`w-6 h-6 rounded-full font-black text-xs flex items-center justify-center ${isCorrect
                                ? 'bg-[#0E5C44] text-white'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                            >
                              {optKey.toUpperCase()}
                            </span>
                          </label>
                          <input
                            type="text"
                            placeholder={`Teks Pilihan ${optKey.toUpperCase()}`}
                            value={formData[fieldKey]}
                            onChange={(e) => setFormData((prev) => ({ ...prev, [fieldKey]: e.target.value }))}
                            className="w-full px-3 py-2 text-xs font-semibold rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-white dark:bg-slate-900 outline-none focus:border-[#0E5C44]"
                          />
                        </div>
                      )
                    })}
                    <p className="text-xs text-slate-500 italic mt-1 font-medium">
                      * Tandai radio button pada opsi yang menjadi kunci jawaban benar.
                    </p>
                  </div>
                )}

                {/* 2. ESSAY */}
                {formData.tipe_soal === 'esai' && (
                  <div className="bg-purple-50/60 dark:bg-purple-950/20 p-4.5 rounded-xl border border-purple-200/80 dark:border-purple-900/50 space-y-2">
                    <h4 className="text-xs font-black text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                      Kunci Jawaban / Rubrik Penskoran Essay
                    </h4>
                    <textarea
                      rows={3}
                      placeholder="Tuliskan kata kunci acuan, poin penting, atau kriteria penilaian..."
                      value={formData.kunci_jawaban}
                      onChange={(e) => setFormData((prev) => ({ ...prev, kunci_jawaban: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-white dark:bg-slate-900 outline-none focus:border-purple-500 leading-relaxed"
                    />
                  </div>
                )}

                {/* 3. BENAR SALAH */}
                {formData.tipe_soal === 'benar_salah' && (
                  <div className="bg-blue-50/60 dark:bg-blue-950/20 p-4.5 rounded-xl border border-blue-200/80 dark:border-blue-900/50 space-y-3">
                    <h4 className="text-xs font-black text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                      Pernyataan Kunci Jawaban
                    </h4>
                    <div className="flex gap-4">
                      {['Benar', 'Salah'].map((val) => (
                        <label
                          key={val}
                          className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer font-black text-xs transition-all ${formData.kunci_jawaban === val
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-sm'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-emerald-200/80 dark:border-emerald-800/60'
                            }`}
                        >
                          <input
                            type="radio"
                            name="kunci_bs"
                            checked={formData.kunci_jawaban === val}
                            onChange={() => setFormData((prev) => ({ ...prev, kunci_jawaban: val }))}
                            className="hidden"
                          />
                          {val === 'Benar' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          {val}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. MENJODOHKAN */}
                {formData.tipe_soal === 'menjodohkan' && (
                  <div className="bg-amber-50/60 dark:bg-amber-950/20 p-4.5 rounded-xl border border-amber-200/80 dark:border-amber-900/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                        Daftar Pasangan Menjodohkan
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddPair}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 transition"
                      >
                        <Plus className="w-3.5 h-3.5" /> Tambah Pasangan
                      </button>
                    </div>

                    {matchingPairs.map((pair, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
                        <span className="text-xs font-black text-amber-700 dark:text-amber-400 w-6 text-center">{idx + 1}.</span>
                        <input
                          type="text"
                          placeholder="Pernyataan / Item Kiri"
                          value={pair.kiri}
                          onChange={(e) => handlePairChange(idx, 'kiri', e.target.value)}
                          className="w-1/2 px-3 py-1.5 text-xs font-semibold rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 outline-none"
                        />
                        <ArrowRight className="w-4 h-4 text-amber-500 shrink-0" />
                        <input
                          type="text"
                          placeholder="Pasangan / Item Kanan"
                          value={pair.kanan}
                          onChange={(e) => handlePairChange(idx, 'kanan', e.target.value)}
                          className="w-1/2 px-3 py-1.5 text-xs font-semibold rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 outline-none"
                        />
                        {matchingPairs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePair(idx)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Metadata Fields: Poin, Tingkat Kesulitan, Indikator, Pembahasan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Poin / Bobot Soal
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.poin}
                      onChange={(e) => setFormData((prev) => ({ ...prev, poin: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-lg border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-white dark:bg-slate-900 outline-none focus:border-[#0E5C44]"
                    />
                  </div>

                  <div>
                    <HeroUiModalSelect
                      label="Tingkat Kesulitan"
                      value={formData.tingkat_kesulitan}
                      onChange={(val) => setFormData((prev) => ({ ...prev, tingkat_kesulitan: val }))}
                      placeholder="Pilih Tingkat Kesulitan"
                      options={[
                        { value: 'mudah', label: 'Mudah' },
                        { value: 'sedang', label: 'Sedang' },
                        { value: 'sulit', label: 'Sulit' },
                      ]}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Indikator Soal / Kompetensi
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Peserta didik mampu menganalisis Pancasila Sila I..."
                    value={formData.indikator}
                    onChange={(e) => setFormData((prev) => ({ ...prev, indikator: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-lg border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-white dark:bg-slate-900 outline-none focus:border-[#0E5C44]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Pembahasan / Penjelasan Jawaban
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Tuliskan pembahasan singkat atau alasan kunci jawaban..."
                    value={formData.pembahasan}
                    onChange={(e) => setFormData((prev) => ({ ...prev, pembahasan: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-lg border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-white dark:bg-slate-900 outline-none focus:border-[#0E5C44] leading-relaxed"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="statusToggle"
                      checked={formData.status}
                      onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.checked }))}
                      className="w-4 h-4 text-[#0E5C44] rounded focus:ring-[#0E5C44]"
                    />
                    <label htmlFor="statusToggle" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      Aktifkan Butir Soal ini di Bank Soal
                    </label>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    {editingModalQuestionId ? (
                      <>
                        <button
                          type="button"
                          onClick={() => resetSingleQuestionForm(modalSessionQuestions.length + 1)}
                          className="px-4 py-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                        >
                          Batal Ubah
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveQuestion(false)}
                          disabled={isSubmittingForm}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-[#1B2433] text-xs font-bold shadow-md hover:brightness-105 transition-all cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>Simpan Perubahan Soal</span>
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Simpan & Selesai Button */}
                        <button
                          type="button"
                          onClick={() => handleSaveQuestion(true)}
                          disabled={isSubmittingForm}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-all cursor-pointer"
                          title="Simpan butir soal ini dan tutup form modal"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Simpan &amp; Selesai</span>
                        </button>

                        {/* Primary: Simpan & Tambah Soal Berikutnya */}
                        <button
                          type="button"
                          onClick={() => handleSaveQuestion(false)}
                          disabled={isSubmittingForm}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-[#1B2433] text-xs font-bold shadow-md hover:brightness-105 transition-all cursor-pointer active:scale-95 border border-emerald-200/80 dark:border-emerald-800/60"
                          title={`Simpan soal #${modalSessionQuestions.length + 1} dan langsung siapkan input untuk soal #${modalSessionQuestions.length + 2}`}
                        >
                          {isSubmittingForm ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                          <span>
                            {modalSessionQuestions.length === 0
                              ? 'Simpan & Tambah Soal Kedua (#2)'
                              : `Simpan & Tambah Soal #${modalSessionQuestions.length + 2}`}
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* DATATABLE DALAM MODAL: DAFTAR PERTANYAAN TERSIMPAN */}
                <div className="pt-6 border-t border-emerald-200/80 dark:border-emerald-800/60 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <List className="w-4 h-4 text-[#0E5C44]" />
                        <span>
                          Daftar Butir Soal Terdaftar ({modalSessionQuestions.length}
                          {selectedKisiObj?.jumlah_soal ? ` / ${selectedKisiObj.jumlah_soal}` : ''} Soal)
                        </span>
                      </h3>
                      {selectedKisiObj && (
                        <p className="text-xs font-medium text-slate-500 mt-0.5">
                          {selectedKisiObj.judul_kisi} • {selectedKisiObj.subject_name || selectedKisiObj.mata_pelajaran} ({selectedKisiObj.jenis_ujian})
                        </p>
                      )}
                    </div>
                    {loadingModalQuestions ? (
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                        <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                        Memuat data database...
                      </span>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        {selectedKisiObj?.jumlah_soal > 0 && (
                          <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${modalSessionQuestions.length >= selectedKisiObj.jumlah_soal
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-2 border-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                            }`}>
                            {modalSessionQuestions.length >= selectedKisiObj.jumlah_soal
                              ? 'Target Terpenuhi (100%)'
                              : `Sisa ${selectedKisiObj.jumlah_soal - modalSessionQuestions.length} Soal Lagi`}
                          </span>
                        )}
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-200/60">
                          {modalSessionQuestions.length} Tersimpan
                        </span>
                        <button
                          type="button"
                          onClick={() => resetSingleQuestionForm(modalSessionQuestions.length + 1)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white hover:from-emerald-700 hover:to-teal-800 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60"
                          title="Siapkan form untuk mengisi soal baru berikutnya"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Tambah Soal #{modalSessionQuestions.length + 1}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {loadingModalQuestions ? (
                    <div className="p-8 text-center rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 dark:bg-slate-800/30">
                      <RefreshCw className="w-5 h-5 animate-spin text-emerald-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 font-medium">Memuat butir soal yang tersimpan dari database...</p>
                    </div>
                  ) : modalSessionQuestions.length === 0 ? (
                    <div className="p-6 text-center rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800/60 text-slate-400 text-xs font-medium">
                      Belum ada butir soal yang tersimpan untuk kisi-kisi ini. Gunakan form di atas lalu tekan <strong>"Simpan &amp; Selesai"</strong> atau <strong>"Simpan &amp; Tambah Soal Kedua (#2)"</strong>.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
                      <TableRoot className="w-full text-left text-xs">
                        <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/60 dark:text-emerald-100 font-bold text-xs uppercase tracking-wider">
                          <TableRow>
                            <TableHead className="py-2.5 px-3 w-10 text-center">#</TableHead>
                            <TableHead className="py-2.5 px-3">Kode &amp; Pertanyaan</TableHead>
                            <TableHead className="py-2.5 px-3">Tipe</TableHead>
                            <TableHead className="py-2.5 px-3 text-center">Kunci</TableHead>
                            <TableHead className="py-2.5 px-3 text-center">Poin</TableHead>
                            <TableHead className="py-2.5 px-3 text-right">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-emerald-100/80 dark:divide-slate-800 bg-white dark:bg-slate-900">
                          {modalSessionQuestions.map((q, idx) => (
                            <TableRow
                              key={q.id || idx}
                              className={`hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors ${editingModalQuestionId === q.id ? 'bg-amber-50/80 dark:bg-amber-950/30' : ''
                                }`}
                            >
                              <TableCell className="py-2.5 px-3 text-center font-bold text-slate-500">{idx + 1}</TableCell>
                              <TableCell className="py-2.5 px-3 max-w-xs">
                                <span className="font-mono text-xs font-extrabold text-emerald-700 dark:text-emerald-400 block">
                                  {q.kode_soal || `SOAL-${idx + 1}`}
                                </span>
                                <p className="text-slate-800 dark:text-slate-200 font-medium line-clamp-2">{q.pertanyaan}</p>
                              </TableCell>
                              <TableCell className="py-2.5 px-3">
                                {getTipeBadge(q.tipe_soal)}
                              </TableCell>
                              <TableCell className="py-2.5 px-3 text-center">
                                <span className="inline-block px-2 py-0.5 rounded font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                                  {q.kunci_jawaban || '-'}
                                </span>
                              </TableCell>
                              <TableCell className="py-2.5 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                                {q.poin || 2.5} Poin
                              </TableCell>
                              <TableCell className="py-2.5 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleEditModalQuestionRow(q)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 transition cursor-pointer"
                                    title="Ubah Pertanyaan Ini"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>Ubah</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteModalQuestionRow(q.id)}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 transition cursor-pointer"
                                    title="Hapus Pertanyaan Ini"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Hapus</span>
                                  </button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </TableRoot>
                    </div>
                  )}
                </div>
              </form>
        </AppModal>

        {/* Detail / Preview Modal */}
        <AppModal
          isOpen={showDetailModal && Boolean(viewingItem)}
          onClose={() => setShowDetailModal(false)}
          title="Pratinjau Butir Soal Ujian"
          badge={viewingItem?.kode_soal || 'SOAL-SYS'}
          icon={Eye}
          maxWidth="max-w-xl"
          zIndex={50}
          footer={
            <button
              onClick={() => setShowDetailModal(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            >
              Tutup Pratinjau
            </button>
          }
        >
          {viewingItem && (
            <>
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-2">
                  {getTipeBadge(viewingItem.tipe_soal)}
                  {getKesulitanBadge(viewingItem.tingkat_kesulitan)}
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                    {viewingItem.poin} Poin
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
                  <p className="font-bold text-slate-900 dark:text-slate-100 leading-relaxed text-xs sm:text-sm">
                    {viewingItem.pertanyaan}
                  </p>
                </div>

                {/* RENDER OPTIONS BY TYPE */}
                {viewingItem.tipe_soal === 'pg' && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Opsi Pilihan:</h4>
                    {['a', 'b', 'c', 'd', 'e'].map((optKey) => {
                      const text = viewingItem[`opsi_${optKey}`]
                      if (!text) return null
                      const isKey = viewingItem.kunci_jawaban === optKey.toUpperCase()
                      return (
                        <div
                          key={optKey}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-xs ${isKey
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold'
                            : 'bg-white dark:bg-slate-900 border-emerald-200/80 dark:border-emerald-800/60 text-slate-700 dark:text-slate-300'
                            }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full font-black text-xs flex items-center justify-center ${isKey ? 'bg-[#0E5C44] text-white' : 'bg-slate-200 dark:bg-slate-700'
                              }`}
                          >
                            {optKey.toUpperCase()}
                          </span>
                          <span className="flex-1">{text}</span>
                          {isKey && <CheckCircle2 className="w-4 h-4 ml-auto text-emerald-600" />}
                        </div>
                      )
                    })}
                  </div>
                )}

                {viewingItem.tipe_soal === 'benar_salah' && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-900 dark:text-emerald-200">Kunci Jawaban Benar/Salah:</span>
                    <span className="px-3 py-1 bg-emerald-600 text-white rounded-xl font-bold">{viewingItem.kunci_jawaban}</span>
                  </div>
                )}

                {viewingItem.tipe_soal === 'esai' && (
                  <div className="p-3.5 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800 space-y-1 text-xs">
                    <span className="font-bold text-purple-900 dark:text-purple-200 block">Kunci / Rubrik Jawaban:</span>
                    <p className="text-purple-950 dark:text-purple-300 leading-relaxed font-medium">
                      {viewingItem.kunci_jawaban || 'Penilaian manual oleh guru.'}
                    </p>
                  </div>
                )}

                {viewingItem.tipe_soal === 'menjodohkan' && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">Pasangan Menjodohkan:</h4>
                    <div className="space-y-1.5">
                      {(viewingItem.pasangan_menjodohkan || []).map((p, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2.5 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900 text-xs">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 w-1/2">{p.kiri}</span>
                          <ArrowRight className="w-4 h-4 text-amber-600 shrink-0" />
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 w-1/2">{p.kanan}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viewingItem.pembahasan && (
                  <div className="bg-amber-50/40 dark:bg-amber-950/20 p-3.5 rounded-xl border border-amber-200/70 dark:border-amber-900/40 space-y-1 text-xs">
                    <span className="font-black text-amber-800 dark:text-amber-300 block">Pembahasan:</span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{viewingItem.pembahasan}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </AppModal>

        {/* Harmonized Batch Export Modal */}
        <HarmonizedBatchExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onExport={handleProcessExport}
          isExporting={isExporting}
          totalCount={pagination.total || dataList.length}
          moduleTitle="Bank Soal"
        />

        {/* ── KPI Quick View Pop-up Modal (10/page + Pagination) ── */}
        {(() => {
          const allRows = Array.isArray(dataList) ? dataList : []
          const filterByKpi = (list) => {
            if (kpiModalKey && kpiModalKey !== 'all') return list.filter((s) => s.tipe_soal === kpiModalKey)
            return list
          }
          const metaMap = {
            all: { title: 'Rincian Total Butir Soal', badge: `${stats.total_soal || allRows.length} Soal` },
            pg: { title: 'Rincian Soal Pilihan Ganda', badge: `${stats.total_pg || 0} Soal` },
            esai: { title: 'Rincian Soal Essay / Esai', badge: `${stats.total_esai || 0} Soal` },
            benar_salah: { title: 'Rincian Soal Benar / Salah', badge: `${stats.total_benar_salah || 0} Soal` },
            menjodohkan: { title: 'Rincian Soal Menjodohkan', badge: `${stats.total_menjodohkan || 0} Soal` },
          }
          const meta = kpiModalKey ? metaMap[kpiModalKey] : null
          return (
            <LmsKpiDetailModal
              isOpen={Boolean(kpiModalKey && meta)}
              onClose={() => setKpiModalKey(null)}
              icon={Layers}
              title={meta?.title || 'Rincian Bank Soal'}
              badge={meta?.badge}
              rows={filterByKpi(allRows)}
              fetchRows={async () => {
                const res = await lmsBankSoalService.getDaftar({
                  per_page: 200,
                  ...(kpiModalKey && kpiModalKey !== 'all' ? { tipe_soal: kpiModalKey } : {}),
                })
                const raw = Array.isArray(res?.data) ? res.data : res?.data?.data || []
                return filterByKpi(raw)
              }}
              searchPlaceholder="Cari kode soal, isi pertanyaan, atau tipe soal..."
              searchFilter={(s, q) =>
                [s.kode_soal, String(s.pertanyaan || s.soal || '').replace(/<[^>]+>/g, ''), s.tipe_soal]
                  .filter(Boolean)
                  .join(' ')
                  .toLowerCase()
                  .includes(q)
              }
              emptyText="Tidak ada butir soal pada kategori ini."
              columns={[
                {
                  header: 'Kode',
                  render: (s) => <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">{s.kode_soal || '-'}</span>,
                },
                {
                  header: 'Pertanyaan',
                  render: (s) => (
                    <div className="font-semibold text-slate-900 dark:text-white max-w-md truncate">
                      {String(s.pertanyaan || s.soal || '-').replace(/<[^>]+>/g, '')}
                    </div>
                  ),
                },
                {
                  header: 'Tipe',
                  align: 'center',
                  render: (s) => <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[10px] font-extrabold uppercase">{s.tipe_soal || '-'}</span>,
                },
                {
                  header: 'Status',
                  align: 'center',
                  render: (s) => (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${s.is_active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {s.is_active !== false ? 'Aktif' : 'Nonaktif'}
                    </span>
                  ),
                },
              ]}
            />
          )
        })()}
      </div>
    </PageContainer>
  )
}
