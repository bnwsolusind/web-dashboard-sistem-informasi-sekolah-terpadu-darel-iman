import { useToast } from '../components/app/ToastProvider'
import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'
import {
  BookOpen,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  RefreshCw,
  Eye,
  Layers,
  Download,
  FileText,
  Copy,
  Printer,
  History,
  Send,
  User,
  Pencil,
  Sparkles,
  ShieldCheck,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Save,
  Upload,
  AlertTriangle,
  RotateCcw,
  FileSpreadsheet,
  GraduationCap,
  Calendar,
  Building2,
  Clock,
  Compass,
  FileCheck,
  ArrowUpDown,
  Image as ImageIcon,
  Video as VideoIcon,
  Link as LinkIcon,
  ExternalLink,
  Check,
  Loader2,
  Paperclip,
} from 'lucide-react'
import api from '../services/api'
import { lmsModulAjarService } from '../services/lmsModulAjarService'
import { codeGeneratorService } from '../services/codeGeneratorService'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import ActionDropdown from '../components/app/ActionDropdown'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import { useDebounce } from '../hooks/useDebounce'
import HeroUiFilterSelect from '../components/ui/HeroUiFilterSelect'
import { PrintOptionModal } from '../components/master-data'
import { downloadSpreadsheetTemplate } from '../utils/spreadsheetParser'
import {
  TableRoot,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table'

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
    card: 'border-purple-300/70 bg-gradient-to-br from-purple-50 via-indigo-50/60 to-white hover:border-purple-400 dark:border-purple-700/50 dark:from-purple-950/40 dark:via-indigo-950/20 dark:to-slate-900',
    glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
    iconBox: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-500/30',
    tag: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
    title: 'text-purple-700 dark:text-purple-400',
    val: 'text-purple-700 dark:text-purple-300',
    sub: 'text-purple-600/80 dark:text-purple-400/80',
    cta: 'text-purple-600/60 dark:text-purple-500/60',
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


const JENJANG_FASE_OPTIONS = [
  { value: 'Fase Fondasi', label: 'PAUD / TK / TAUD (Fase Fondasi)', shortLabel: 'PAUD/TK' },
  { value: 'Fase A', label: 'SD Kelas 1 – 2 (Fase A)', shortLabel: 'SD Kls 1-2' },
  { value: 'Fase B', label: 'SD Kelas 3 – 4 (Fase B)', shortLabel: 'SD Kls 3-4' },
  { value: 'Fase C', label: 'SD Kelas 5 – 6 (Fase C)', shortLabel: 'SD Kls 5-6' },
  { value: 'Fase D', label: 'SMP / MTs (Fase D)', shortLabel: 'SMP' },
  { value: 'Fase E', label: 'SMA Kelas 10 (Fase E)', shortLabel: 'SMA Kls 10' },
  { value: 'Fase F', label: 'SMA Kelas 11 – 12 (Fase F)', shortLabel: 'SMA Kls 11-12' },
]

const getJenjangShortLabel = (fase) => {
  const match = JENJANG_FASE_OPTIONS.find((item) => item.value === fase)
  return match ? `${match.shortLabel}` : (fase || '-')
}

const formatFileSize = (bytes) => {
  if (!bytes || isNaN(bytes)) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── HEROUI SELECT DROPDOWN COMPONENT (CLEAN, ACCESSIBLE & ANIMATED) ──
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

const STATUS_LIST = ['Draft', 'Review', 'Publish', 'Arsip']

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
  moduleTitle = 'Modul Ajar',
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
              aria-label="Tutup modal"
              className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer shrink-0 disabled:opacity-50"
            >
              <X className="size-4 text-white" strokeWidth={2.25} />
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

          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2.5 bg-slate-50/50 dark:bg-slate-900/40 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer shadow-sm shadow-rose-500/20"
            >
              <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                <X className="size-3.5 text-white" strokeWidth={2.2} />
              </div>
              <span>Batal</span>
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

// ── 3. KOMPONEN UTAMA HALAMAN MODUL AJAR ──
export default function LmsModulAjarPage({ embedded = false, hideBreadcrumb = false, hidePageHeader = false, tabNav = null }) {
  const queryClient = useQueryClient()
  const { items: toastList, push: pushToast, dismiss: dismissToast } = useNotifications()

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

  const isTeacherOnly = useMemo(() => {
    if (isSupervisor) return false
    const rList = userRoles.map((r) => r.toLowerCase())
    const mainRole = String(user?.role || '').toLowerCase()
    return (
      rList.some((r) => r.includes('guru') || r.includes('wali_kelas') || r.includes('wali kelas')) ||
      mainRole.includes('guru')
    )
  }, [isSupervisor, userRoles, user?.role])

  // State Filter & Pencarian dengan Debounce
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 350)
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('')
  const [selectedMapelFilter, setSelectedMapelFilter] = useState('')
  const [selectedFaseFilter, setSelectedFaseFilter] = useState('')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('')
  const [denganSampahFilter, setDenganSampahFilter] = useState('')
  const [sortDateOrder, setSortDateOrder] = useState('desc') // 'desc' | 'asc'
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // State Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [selectedModul, setSelectedModul] = useState(null)
  const [formStep, setFormStep] = useState(1) // 1: Identitas, 2: Rancangan, 3: Aktivitas, 4: Asesmen

  // Import states
  const [importFile, setImportFile] = useState(null)
  const [importDragging, setImportDragging] = useState(false)
  const [importPreviewData, setImportPreviewData] = useState([])
  const [importLoading, setImportLoading] = useState(false)

  // Form State
  const initialFormState = () => ({
    unit_pendidikan_id: '',
    tahun_ajaran_id: '',
    semester_id: '',
    kurikulum_id: '',
    mata_pelajaran_id: '',
    guru_id: '',
    kelas_id: '',
    rombel_id: '',
    cp_id: '',
    tp_id: '',
    kode_modul: '',
    judul_modul: '',
    fase: 'Fase D',
    semester: 'Ganjil',
    alokasi_waktu_jp: 4,
    tujuan_pembelajaran: '',
    profil_pelajar_pancasila: 'Beriman dan Bertakwa kepada Tuhan YME, Mandiri, Bernalar Kritis',
    target_peserta_didik: 'Peserta Didik Reguler (28-32 Siswa)',
    model_pembelajaran: 'Problem Based Learning (PBL)',
    metode_pembelajaran: 'Diskusi, Ceramah Interaktif, Presentasi Kelompok',
    media_pembelajaran: 'Slide PPT Interaktif, Video Pembelajaran, Canva, LKPD',
    sumber_belajar: 'Buku Cetak Kemendikbudristek & Portal LMS Sekolah',
    kegiatan_pendahuluan: '1. Salam, Doa pembuka, dan apersepsi.\n2. Guru menjelaskan tujuan pembelajaran harian.',
    kegiatan_inti: '1. Siswa membentuk kelompok dan mengamati materi.\n2. Diskusi dan penyusunan laporan kelompok.',
    kegiatan_penutup: '1. Refleksi pembelajaran.\n2. Kesimpulan bersama dan doa penutup.',
    asesmen_awal: 'Kuis diagnosis 5 pertanyaan singkat.',
    asesmen_proses: 'Observasi keaktifan diskusi dan kerja kelompok.',
    asesmen_akhir: 'Penilaian produk LKPD dan tes tertulis.',
    rencana_penilaian: 'Pengetahuan 40%, Keterampilan 40%, Sikap 20%',
    refleksi_guru: '',
    status: 'Draft',
    deskripsi: '',
    versi: '1.0',
    naikkan_versi: false,
    catatan_revisi: '',
    lampiran: [],
  })

  const [formData, setFormData] = useState(initialFormState)

  // Media & Attachment Manager States (Tab 2)
  const [mediaTab, setMediaTab] = useState('dokumen') // 'dokumen' | 'gambar' | 'video' | 'link_dokumen' | 'link_video'
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const [linkInputTitle, setLinkInputTitle] = useState('')
  const [linkInputUrl, setLinkInputUrl] = useState('')
  const mediaFileInputRef = useRef(null)

  // Queries
  const { data: optionsData } = useQuery({
    queryKey: ['lmsModulOptions'],
    queryFn: () => lmsModulAjarService.getOptions(),
  })
  const options = optionsData?.data || {}

  // Filter daftar mapel berdasarkan unit yang dipilih atau grouping nama unik jika "Semua Unit"
  const filteredSubjectOptions = useMemo(() => {
    const rawSubjects = options.subjects || []
    const activeUnitId = selectedUnitFilter || (options.education_units?.length === 1 ? options.education_units[0].id : '')

    // KASUS 1: Jika UNIT SPESIFIK DIPILIH (misal: TAUD SaQu Dar el-Iman)
    if (activeUnitId) {
      const unitMapelList = rawSubjects.filter(
        (s) => s.unit_pendidikan_id === activeUnitId || s.unit_pendidikan?.id === activeUnitId
      )

      // Sortir A-Z menurut nama mapel
      const sortedList = unitMapelList.slice().sort((a, b) => {
        const nameA = (a.nama_mapel || a.name || a.kode_mapel || '').trim().toLowerCase()
        const nameB = (b.nama_mapel || b.name || b.kode_mapel || '').trim().toLowerCase()
        return nameA.localeCompare(nameB, 'id')
      })

      return sortedList.map((s) => ({
        value: s.id,
        label: s.nama_mapel || s.name || s.kode_mapel || s.code,
      }))
    }

    // KASUS 2: Jika "SEMUA UNIT" (Global View)
    // Rapikan: Jangan tampilkan keseluruhan yang double/duplikat!
    // Satukan menurut Nama Mata Pelajaran Unik dan urutkan A-Z.
    const uniqueMapelMap = new Map()
    for (const s of rawSubjects) {
      const cleanName = (s.nama_mapel || s.name || '').trim()
      if (!cleanName) continue
      const lowerKey = cleanName.toLowerCase()
      if (!uniqueMapelMap.has(lowerKey)) {
        uniqueMapelMap.set(lowerKey, {
          value: cleanName,
          label: cleanName,
        })
      }
    }

    return Array.from(uniqueMapelMap.values()).sort((a, b) =>
      a.label.localeCompare(b.label, 'id')
    )
  }, [options.subjects, selectedUnitFilter, options.education_units])

  // Opsi mapel untuk Form Modal Tambah/Edit (hanya mapel dari unit yang dipilih di form)
  const formAvailableSubjects = useMemo(() => {
    const rawSubjects = options.subjects || []
    const selectedUnit = formData.unit_pendidikan_id || (options.education_units?.length === 1 ? options.education_units[0].id : '')

    let list = rawSubjects
    if (selectedUnit) {
      list = rawSubjects.filter(
        (s) => s.unit_pendidikan_id === selectedUnit || s.unit_pendidikan?.id === selectedUnit
      )
    }

    return list.slice().sort((a, b) => {
      const nameA = (a.nama_mapel || a.name || '').trim().toLowerCase()
      const nameB = (b.nama_mapel || b.name || '').trim().toLowerCase()
      return nameA.localeCompare(nameB, 'id')
    })
  }, [options.subjects, formData.unit_pendidikan_id, options.education_units])

  const { data: modulsData, isLoading, refetch } = useQuery({
    queryKey: ['lmsModuls', debouncedSearch, selectedUnitFilter, selectedMapelFilter, selectedFaseFilter, selectedStatusFilter, denganSampahFilter, page, perPage, sortDateOrder],
    queryFn: () =>
      lmsModulAjarService.getAll({
        search: debouncedSearch,
        unit_pendidikan_id: selectedUnitFilter,
        mata_pelajaran_id: selectedMapelFilter,
        fase: selectedFaseFilter,
        status: selectedStatusFilter,
        dengan_sampah: denganSampahFilter,
        page,
        per_page: perPage,
        order_by: 'created_at',
        order_dir: sortDateOrder,
      }),
  })

  const moduls = modulsData?.data || []
  const meta = modulsData?.meta || {}
  const stats = modulsData?.statistik || {}

  const { data: revisionsData } = useQuery({
    queryKey: ['lmsModulRevisions', selectedModul?.id],
    queryFn: () => lmsModulAjarService.getRevisions(selectedModul.id),
    enabled: !!selectedModul?.id && isRevisionModalOpen,
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload) => lmsModulAjarService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['lmsModuls'])
      setIsFormModalOpen(false)
      setShowSaveConfirmModal(false)
      pushToast('Berhasil Disimpan', 'Modul Ajar baru berhasil dibuat.', 'success')
    },
    onError: (err) => {
      setShowSaveConfirmModal(false)
      pushToast('Gagal Menyimpan', err?.response?.data?.message || 'Terjadi kesalahan saat menyimpan modul ajar.', 'error')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => lmsModulAjarService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['lmsModuls'])
      setIsFormModalOpen(false)
      setShowSaveConfirmModal(false)
      pushToast('Berhasil Diperbarui', 'Perubahan Modul Ajar berhasil disimpan.', 'success')
    },
    onError: (err) => {
      setShowSaveConfirmModal(false)
      pushToast('Gagal Memperbarui', err?.response?.data?.message || 'Terjadi kesalahan saat mengedit modul ajar.', 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => lmsModulAjarService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['lmsModuls'])
      setDeleteTarget(null)
      pushToast('Berhasil Dihapus', 'Modul Ajar berhasil dipindahkan ke folder sampah.', 'success')
    },
    onError: (err) => {
      setDeleteTarget(null)
      pushToast('Gagal Menghapus', err?.response?.data?.message || 'Gagal menghapus modul ajar.', 'error')
    },
  })

  const restoreMutation = useMutation({
    mutationFn: (id) => lmsModulAjarService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['lmsModuls'])
      pushToast('Berhasil Dipulihkan', 'Modul Ajar berhasil dipulihkan ke data aktif.', 'success')
    },
    onError: (err) => {
      pushToast('Gagal Memulihkan', err?.response?.data?.message || 'Gagal memulihkan modul ajar.', 'error')
    },
  })

  const publishMutation = useMutation({
    mutationFn: (id) => lmsModulAjarService.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['lmsModuls'])
      pushToast('Dipublikasikan', 'Modul Ajar kini berstatus Publish dan siap digunakan di KBM.', 'success')
    },
    onError: (err) => {
      pushToast('Gagal Publikasi', err?.response?.data?.message || 'Gagal mempublikasikan modul ajar.', 'error')
    },
  })

  const duplicateMutation = useMutation({
    mutationFn: (id) => lmsModulAjarService.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['lmsModuls'])
      pushToast('Berhasil Diduplikasi', 'Salinan Modul Ajar berhasil dibuat sebagai Draft.', 'success')
    },
    onError: (err) => {
      pushToast('Gagal Duplikasi', err?.response?.data?.message || 'Gagal membuat salinan modul ajar.', 'error')
    },
  })

  // Handlers Modals
  const handleOpenAddModal = () => {
    const unitWithSubjects = options.education_units?.find((u) =>
      (options.subjects || []).some((s) => s.unit_pendidikan_id === u.id || s.unit_pendidikan?.id === u.id)
    )
    const defaultUnitId = selectedUnitFilter || unitWithSubjects?.id || options.education_units?.[0]?.id || ''
    const initialMapel = (options.subjects || []).find(
      (s) => s.unit_pendidikan_id === defaultUnitId || s.unit_pendidikan?.id === defaultUnitId
    )

    setFormData({
      ...initialFormState(),
      unit_pendidikan_id: defaultUnitId,
      tahun_ajaran_id: options.academic_years?.[0]?.id || '',
      semester_id: options.semesters?.[0]?.id || '',
      kurikulum_id: options.kurikulums?.[0]?.id || '',
      mata_pelajaran_id: initialMapel?.id || '',
      guru_id: options.teachers?.[0]?.id || '',
      kelas_id: options.classes?.[0]?.id || '',
      cp_id: options.capaian_pembelajaran?.[0]?.id || '',
      tp_id: options.tujuan_pembelajaran?.[0]?.id || '',
      lampiran: [],
    })
    setLinkInputTitle('')
    setLinkInputUrl('')
    setMediaTab('dokumen')

    codeGeneratorService.preview('modul_code', {
      unit_id: defaultUnitId || null,
      academic_year_id: options.academic_years?.[0]?.id || null,
    }).then((res) => {
      if (res?.preview_code) {
        setFormData((prev) => ({ ...prev, kode_modul: res.preview_code }))
      }
    }).catch(() => {})
    setFormStep(1)
    setIsFormModalOpen(true)
  }

  const handleOpenEditModal = (item) => {
    setSelectedModul(item)
    setFormData({
      unit_pendidikan_id: item.unit_pendidikan_id || '',
      tahun_ajaran_id: item.tahun_ajaran_id || '',
      semester_id: item.semester_id || '',
      kurikulum_id: item.kurikulum_id || '',
      mata_pelajaran_id: item.mata_pelajaran_id || '',
      guru_id: item.guru_id || '',
      kelas_id: item.kelas_id || '',
      rombel_id: item.rombel_id || '',
      cp_id: item.cp_id || '',
      tp_id: item.tp_id || '',
      kode_modul: item.kode_modul || '',
      judul_modul: item.judul_modul || '',
      fase: item.fase || 'Fase D',
      semester: item.semester || 'Ganjil',
      alokasi_waktu_jp: item.alokasi_waktu_jp || 4,
      tujuan_pembelajaran: item.tujuan_pembelajaran || '',
      profil_pelajar_pancasila: item.profil_pelajar_pancasila || '',
      target_peserta_didik: item.target_peserta_didik || '',
      model_pembelajaran: item.model_pembelajaran || '',
      metode_pembelajaran: item.metode_pembelajaran || '',
      media_pembelajaran: item.media_pembelajaran || '',
      sumber_belajar: item.sumber_belajar || '',
      kegiatan_pendahuluan: item.kegiatan_pendahuluan || '',
      kegiatan_inti: item.kegiatan_inti || '',
      kegiatan_penutup: item.kegiatan_penutup || '',
      asesmen_awal: item.asesmen_awal || '',
      asesmen_proses: item.asesmen_proses || '',
      asesmen_akhir: item.asesmen_akhir || '',
      rencana_penilaian: item.rencana_penilaian || '',
      refleksi_guru: item.refleksi_guru || '',
      status: item.status || 'Draft',
      deskripsi: item.deskripsi || '',
      versi: item.versi || '1.0',
      naikkan_versi: false,
      catatan_revisi: '',
      lampiran: Array.isArray(item.lampiran) ? item.lampiran : [],
    })
    setLinkInputTitle('')
    setLinkInputUrl('')
    setMediaTab('dokumen')
    setFormStep(1)
    setIsFormModalOpen(true)
  }

  // Media Attachment Upload & Link Handlers (Tab 2)
  const handleUploadMediaFile = async (e, type) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit ukuran: 50MB
    if (file.size > 50 * 1024 * 1024) {
      pushToast('Ukuran Terlalu Besar', 'Maksimal ukuran file lampiran adalah 50MB.', 'warning')
      return
    }

    try {
      setIsUploadingMedia(true)
      const uploadData = new FormData()
      uploadData.append('file', file)
      uploadData.append('folder', 'lms/modul_ajar')

      const res = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const rawUrl = res.data?.url || res.data?.data?.url || ''
      const ext = file.name.split('.').pop()?.toLowerCase() || ''

      const newAttachment = {
        id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        tipe: type, // 'dokumen' | 'gambar' | 'video'
        nama: file.name,
        url: rawUrl,
        ukuran: file.size,
        ekstensi: ext,
        uploaded_at: new Date().toISOString(),
      }

      setFormData((prev) => ({
        ...prev,
        lampiran: [...(prev.lampiran || []), newAttachment],
      }))

      pushToast('Berkas Terlampir', `Berkas "${file.name}" berhasil diunggah dan dilampirkan.`, 'success')
    } catch (err) {
      console.warn('Upload endpoint error, fallback to data url preview:', err)
      const reader = new FileReader()
      reader.onload = (uploadEvt) => {
        const ext = file.name.split('.').pop()?.toLowerCase() || ''
        const newAttachment = {
          id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          tipe: type,
          nama: file.name,
          url: uploadEvt.target.result,
          ukuran: file.size,
          ekstensi: ext,
          uploaded_at: new Date().toISOString(),
        }
        setFormData((prev) => ({
          ...prev,
          lampiran: [...(prev.lampiran || []), newAttachment],
        }))
        pushToast('Berkas Ditambahkan', `Berkas "${file.name}" tersimpan dalam draft modul.`, 'success')
      }
      reader.readAsDataURL(file)
    } finally {
      setIsUploadingMedia(false)
      if (mediaFileInputRef.current) mediaFileInputRef.current.value = ''
    }
  }

  const handleAddMediaLink = (type) => {
    if (!linkInputUrl.trim()) {
      pushToast('Tautan Diperlukan', 'Harap masukkan tautan / URL yang valid!', 'warning')
      return
    }

    const defaultTitle = type === 'link_video' ? 'Tautan Video Pembelajaran' : 'Tautan Dokumen / Modul Online'
    const title = linkInputTitle.trim() || defaultTitle

    const newAttachment = {
      id: `att_link_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      tipe: type, // 'link_video' | 'link_dokumen'
      nama: title,
      url: linkInputUrl.trim(),
      ukuran: null,
      ekstensi: 'link',
      uploaded_at: new Date().toISOString(),
    }

    setFormData((prev) => ({
      ...prev,
      lampiran: [...(prev.lampiran || []), newAttachment],
    }))

    setLinkInputTitle('')
    setLinkInputUrl('')
    pushToast('Tautan Ditambahkan', `Tautan "${title}" berhasil disematkan.`, 'success')
  }

  const handleRemoveAttachment = (id) => {
    setFormData((prev) => ({
      ...prev,
      lampiran: (prev.lampiran || []).filter((item) => item.id !== id),
    }))
    pushToast('Lampiran Dihapus', 'Berkas / tautan lampiran telah dihapus dari modul ini.', 'info')
  }

  const handleTriggerSave = (e) => {
    e?.preventDefault()
    if (!formData.judul_modul?.trim()) {
      pushToast('Peringatan', 'Judul Modul Ajar wajib diisi!', 'warning')
      setFormStep(1)
      return
    }
    setShowSaveConfirmModal(true)
  }

  const handleConfirmSave = () => {
    if (selectedModul) {
      updateMutation.mutate({ id: selectedModul.id, payload: formData })
    } else {
      createMutation.mutate(formData)
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
      const listToExport = moduls || []
      if (listToExport.length === 0) {
        pushToast('Informasi', 'Tidak ada data Modul Ajar untuk diekspor.', 'warning')
        setIsExportModalOpen(false)
        return
      }

      const exportData = listToExport.map((row, i) => ({
        'No': i + 1,
        'Kode Modul': row.kode_modul || `MA-${row.id || i + 1}`,
        'Judul Modul': row.judul_modul || row.nama_modul || '-',
        'Mata Pelajaran': row.subject?.nama_mapel || row.subject?.name || '-',
        'Guru Pengampu': row.guru?.nama_lengkap || row.user?.nama_lengkap || row.teacher?.nama_lengkap || '-',
        'Kelas / Fase': `${row.kelas?.nama_kelas || '-'} (${row.fase || '-'})`,
        'Alokasi Waktu': `${row.alokasi_waktu_jp || row.alokasi_jam || 0} JP`,
        'Status': row.status || 'Draft',
      }))

      downloadSpreadsheetTemplate(
        exportData,
        `modul_ajar_${new Date().toISOString().slice(0, 10)}`,
        format,
        'Modul Ajar'
      )
      setIsExportModalOpen(false)
      pushToast('Export Berhasil', `Berkas Modul Ajar .${format.toUpperCase()} berhasil diunduh.`, 'success')
    } catch (err) {
      pushToast('Gagal Export', err?.message || 'Terjadi kesalahan saat menyiapkan berkas ekspor.', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  // Single Modul Print
  const handlePrintSingleModul = (modul) => {
    if (!modul) return

    let iframe = document.getElementById('dareliman-print-iframe')
    if (iframe) {
      document.body.removeChild(iframe)
    }

    iframe = document.createElement('iframe')
    iframe.id = 'dareliman-print-iframe'
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0px'
    iframe.style.height = '0px'
    iframe.style.border = 'none'
    iframe.style.zIndex = '-9999'

    document.body.appendChild(iframe)

    const doc = iframe.contentWindow.document
    doc.open()
    doc.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Modul Ajar - ${modul.judul_modul || 'RPP'}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm 15mm;
          }
          * { box-sizing: border-box; }
          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            font-size: 10pt;
            color: #0f172a;
            line-height: 1.6;
            padding: 10px;
          }
          .header {
            border-bottom: 2.5px solid #0e5c44;
            padding-bottom: 12px;
            margin-bottom: 20px;
            text-align: center;
          }
          .header h1 {
            font-size: 13pt;
            font-weight: 800;
            color: #0e5c44;
            margin: 0;
            text-transform: uppercase;
          }
          .header h2 {
            font-size: 12pt;
            font-weight: 700;
            color: #1e293b;
            margin: 4px 0;
          }
          .header p {
            font-size: 9pt;
            color: #64748b;
            margin: 0;
          }
          .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .info-table td {
            padding: 8px 12px;
            border: 1px solid #cbd5e1;
            font-size: 9.5pt;
          }
          .info-table td.label {
            background-color: #f1f5f9;
            font-weight: 700;
            color: #334155;
            width: 25%;
          }
          .section-title {
            font-size: 10pt;
            font-weight: 800;
            color: #0e5c44;
            text-transform: uppercase;
            border-bottom: 1.5px solid #0e5c44;
            padding-bottom: 4px;
            margin-top: 16px;
            margin-bottom: 8px;
          }
          .section-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 10px 14px;
            font-size: 9.5pt;
            white-space: pre-line;
            margin-bottom: 12px;
          }
          .grid-3 {
            display: flex;
            gap: 10px;
          }
          .grid-3 > div {
            flex: 1;
          }
          .footer-sig {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
          }
          .sig-box {
            text-align: center;
            width: 40%;
          }
          .sig-box p { margin: 2px 0; font-size: 9pt; }
          .sig-space { height: 60px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PERENCANAAN PELAKSANAAN PEMBELAJARAN (MODUL AJAR)</h1>
          <h2>${modul.judul_modul || '-'}</h2>
          <p>Kode: ${modul.kode_modul || '-'} | Versi: ${modul.versi || '1.0'} | Status: ${modul.status || 'Draft'}</p>
        </div>

        <table class="info-table">
          <tr>
            <td class="label">Satuan Pendidikan</td>
            <td>${modul.unit_pendidikan?.nama || modul.unit_pendidikan?.name || 'Sekolah Terpadu'}</td>
            <td class="label">Mata Pelajaran</td>
            <td>${modul.subject?.nama_mapel || modul.subject?.name || '-'}</td>
          </tr>
          <tr>
            <td class="label">Fase / Kelas</td>
            <td>Fase ${modul.fase || 'A'} (${modul.kelas?.nama_kelas || modul.kelas?.name || '-'})</td>
            <td class="label">Alokasi Waktu</td>
            <td>${modul.alokasi_jam || modul.alokasi_waktu_jp || 2} JP</td>
          </tr>
          <tr>
            <td class="label">Guru Pengampu</td>
            <td>${modul.user?.nama_lengkap || modul.teacher?.nama_lengkap || modul.teacher?.name || modul.guru?.nama_lengkap || '-'}</td>
            <td class="label">Target Peserta Didik</td>
            <td>${modul.target_peserta_didik || 'Reguler'}</td>
          </tr>
        </table>

        <div class="section-title">A. Tujuan Pembelajaran (TP)</div>
        <div class="section-box">${modul.tujuan_pembelajaran || 'Belum diisi.'}</div>

        <div class="section-title">B. Profil Pelajar Pancasila & Rahmatan Lil Alamin</div>
        <div class="section-box">${modul.profil_pelajar_pancasila || '-'}</div>

        <div class="section-title">C. Skenario & Kegiatan Pembelajaran</div>
        <div class="grid-3">
          <div class="section-box">
            <strong>1. Pendahuluan:</strong><br/>
            ${modul.kegiatan_pendahuluan || '-'}
          </div>
          <div class="section-box">
            <strong>2. Kegiatan Inti:</strong><br/>
            ${modul.kegiatan_inti || '-'}
          </div>
          <div class="section-box">
            <strong>3. Penutup:</strong><br/>
            ${modul.kegiatan_penutup || '-'}
          </div>
        </div>

        <div class="footer-sig">
          <div class="sig-box">
            <p>Mengetahui,</p>
            <p><strong>Kepala Sekolah</strong></p>
            <div class="sig-space"></div>
            <p>_______________________</p>
          </div>
          <div class="sig-box">
            <p>Padang, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p><strong>Guru Mata Pelajaran</strong></p>
            <div class="sig-space"></div>
            <p><strong>${modul.user?.nama_lengkap || modul.teacher?.nama_lengkap || modul.teacher?.name || modul.guru?.nama_lengkap || 'Guru Pengampu'}</strong></p>
          </div>
        </div>
      </body>
      </html>
    `)
    doc.close()

    setTimeout(() => {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
    }, 300)
  }

  // Import File Drag & Handlers
  const handleDownloadTemplate = () => {
    const headers = ['KODE MODUL', 'JUDUL MODUL', 'FASE', 'MATA PELAJARAN', 'GURU', 'KELAS', 'ALOKASI JP', 'TUJUAN PEMBELAJARAN', 'STATUS']
    const sample = ['MA-101', 'Toleransi & Keberagaman', 'Fase D', 'Pendidikan Agama Islam', 'Ustadz Ahmad, S.Pd', 'Kelas 7A', '4', 'Memahami konsep toleransi', 'Draft']
    const csvContent = [headers.join(','), sample.map((v) => `"${v}"`).join(',')].join('\n')
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Template_Import_Modul_Ajar.csv'
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
              kode: cols[0] || 'MA-NEW',
              judul: cols[1] || 'Modul Baru',
              fase: cols[2] || 'Fase D',
              mapel: cols[3] || '-',
              guru: cols[4] || '-',
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
      pushToast('Peringatan', 'Silakan pilih berkas spreadsheet terlebih dahulu.', 'warning')
      return
    }
    setImportLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', importFile)
      await lmsModulAjarService.importExcel(formData)
      queryClient.invalidateQueries(['lmsModuls'])
      setIsImportModalOpen(false)
      setImportFile(null)
      setImportPreviewData([])
      pushToast('Import Berhasil', 'Data Modul Ajar berhasil diimpor ke sistem.', 'success')
    } catch (err) {
      pushToast('Gagal Import', err?.response?.data?.message || 'Terjadi kesalahan saat mengunggah berkas modul ajar.', 'error')
    } finally {
      setImportLoading(false)
    }
  }

  const hasActiveFilters = Boolean(searchInput || selectedUnitFilter || selectedMapelFilter || selectedFaseFilter || selectedStatusFilter || denganSampahFilter || sortDateOrder !== 'desc')

  const handleResetFilters = () => {
    setSearchInput('')
    setSelectedUnitFilter('')
    setSelectedMapelFilter('')
    setSelectedFaseFilter('')
    setSelectedStatusFilter('')
    setDenganSampahFilter('')
    setSortDateOrder('desc')
    setPage(1)
    refetch()
  }

  const totalPages = meta.lastPage || meta.last_page || 1
  const totalItems = meta.total ?? moduls.length

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
                { label: 'Modul Ajar' },
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
            {/* Dual Multi-Tone Ambient Glow Blobs */}
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
                      Modul Ajar &amp; RPP Digital
                    </h1>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-0.5 sm:px-3.5 sm:py-1 text-[11px] sm:text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Kurikulum Merdeka &amp; KBM
                    </span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 w-full leading-relaxed">
                    Pusat perencanaan terpadu modul ajar berbasis Capaian Pembelajaran (CP), Alur Tujuan Pembelajaran (ATP/TP), media ajar, dan instrumen asesmen.
                  </p>
                </div>
              </div>

              {/* Right Feature Indicator Badge */}
              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 px-3.5 py-1.5 text-xs font-black text-emerald-900 dark:border-emerald-700 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>LMS &amp; RPP Digital</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── 4 KARTU KPI MODERN (MULTI-TONE) ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
          <ModernKpiCard
            label="Total Modul"
            value={stats.total_modul || 0}
            icon={BookOpen}
            tone="emerald"
            tag={`${stats.total_modul || 0} Modul`}
            subtext="Terdaftar di sistem sekolah"
          />
          <ModernKpiCard
            label="Draft & Review"
            value={(stats.total_draft || 0) + (stats.total_review || 0)}
            icon={FileText}
            tone="amber"
            tag="Penyusunan"
            subtext="Dalam penyusunan guru"
          />
          <ModernKpiCard
            label="Dipublikasikan"
            value={stats.total_published || 0}
            icon={CheckCircle2}
            tone="blue"
            tag="Aktif KBM"
            subtext="Siap digunakan di KBM"
          />
          <ModernKpiCard
            label="TP Ter-cover"
            value={stats.total_tp_tercover || 0}
            icon={Layers}
            tone="purple"
            tag="Tercakup"
            subtext="Terhubung ke silabus TP"
          />
        </motion.div>

        {/* Tab Navigation Slot if provided by Container */}
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
                      Data Modul Ajar (RPP Digital)
                    </h2>
                    <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 dark:text-emerald-200 border border-emerald-300/60">
                      {Number(totalItems).toLocaleString('id-ID')} Modul
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                    Daftar perencanaan aktivitas guru terintegrasi CP, TP, dan capaian kurikulum.
                  </p>
                </div>
              </div>

              {/* 4 Vivid Gradient Squircle Action Buttons (Standar Emas) */}
              <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
                {/* 1. Cetak Datatable Button (Vivid Indigo-Violet Squircle) */}
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

                {/* 2. Import Button (Vivid Sky Blue Squircle) */}
                <div className="group relative inline-flex">
                  <button
                    type="button"
                    title="Import Data Modul Ajar"
                    aria-label="Import Data Modul Ajar"
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

                {/* 3. Export Button (Vivid Amber-Orange Squircle) */}
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

                {/* 4. Tambah Modul Ajar Button (Vivid Emerald-Teal Squircle) */}
                <div className="group relative inline-flex">
                  <button
                    type="button"
                    title="Buat Modul Ajar Baru"
                    aria-label="Buat Modul Ajar Baru"
                    onClick={handleOpenAddModal}
                    className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    <Plus className="size-5 text-white" strokeWidth={2.5} />
                  </button>
                  <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                    <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                    Tambah Modul Ajar
                  </div>
                </div>
              </div>
            </div>

            {/* ── TOOLBAR BARIS 2: Full-Width Search Input dengan Debounce ── */}
            <div className="px-5 pt-4 sm:px-6 md:px-8">
              <div className="relative w-full">
                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center text-slate-400 dark:text-slate-500">
                  <Search className="size-4" />
                </div>
                <input
                  type="text"
                  placeholder="Cari judul modul, kode modul, guru pengampu, atau mata pelajaran..."
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value)
                    setPage(1)
                  }}
                  className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-10 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
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

              {/* Unit Filter: Dropdown jika multi-unit, atau Badge Tetap jika hanya 1 unit */}
              {options.education_units && options.education_units.length > 1 && (
                <HeroUiFilterSelect
                  value={selectedUnitFilter}
                  onChange={(val) => {
                    setSelectedUnitFilter(val)
                    setSelectedMapelFilter('')
                    setPage(1)
                  }}
                  options={[
                    { value: '', label: 'Semua Unit' },
                    ...options.education_units.map((u) => ({
                      value: String(u.id),
                      label: u.name || u.nama,
                    })),
                  ]}
                  placeholder="Semua Unit"
                  icon={Building2}
                  ariaLabel="Pilih Unit Pendidikan"
                  size="sm"
                  searchable
                  className="w-full sm:w-auto min-w-[150px]"
                />
              )}
              {options.education_units && options.education_units.length === 1 && (
                <div className="flex h-9 items-center gap-1.5 rounded-xl border border-emerald-300/80 bg-white dark:bg-[#111827] px-3 text-xs font-bold text-emerald-800 dark:border-emerald-800/80 dark:text-emerald-300 shadow-xs">
                  <Building2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{options.education_units[0].name || options.education_units[0].nama}</span>
                </div>
              )}

              {/* Mapel Dropdown */}
              {filteredSubjectOptions && filteredSubjectOptions.length > 0 && (
                <HeroUiFilterSelect
                  value={selectedMapelFilter}
                  onChange={(val) => {
                    setSelectedMapelFilter(val)
                    setPage(1)
                  }}
                  options={[
                    { value: '', label: `Semua Mapel (${filteredSubjectOptions.length})` },
                    ...filteredSubjectOptions,
                  ]}
                  placeholder="Semua Mapel"
                  icon={BookOpen}
                  ariaLabel="Pilih Mata Pelajaran"
                  size="sm"
                  searchable
                  className="w-full sm:w-auto min-w-[160px]"
                />
              )}

              {/* Jenjang Dropdown */}
              <HeroUiFilterSelect
                value={selectedFaseFilter}
                onChange={(val) => {
                  setSelectedFaseFilter(val)
                  setPage(1)
                }}
                options={[
                  { value: '', label: 'Semua Jenjang' },
                  ...JENJANG_FASE_OPTIONS,
                ]}
                placeholder="Semua Jenjang"
                icon={GraduationCap}
                ariaLabel="Pilih Jenjang Fase"
                size="sm"
                className="w-full sm:w-auto min-w-[140px]"
              />

              {/* Status Dropdown */}
              <HeroUiFilterSelect
                value={selectedStatusFilter}
                onChange={(val) => {
                  setSelectedStatusFilter(val)
                  setPage(1)
                }}
                options={[
                  { value: '', label: 'Semua Status' },
                  ...STATUS_LIST.map((s) => ({ value: s, label: s })),
                ]}
                placeholder="Semua Status"
                icon={CheckCircle2}
                ariaLabel="Pilih Status"
                size="sm"
                className="w-full sm:w-auto min-w-[140px]"
              />

              {/* Data Sampah Dropdown */}
              <HeroUiFilterSelect
                value={denganSampahFilter}
                onChange={(val) => {
                  setDenganSampahFilter(val)
                  setPage(1)
                }}
                options={[
                  { value: '', label: 'Data Aktif' },
                  { value: '1', label: 'Termasuk Sampah' },
                ]}
                placeholder="Data Aktif"
                icon={Trash2}
                ariaLabel="Filter Data Sampah"
                size="sm"
                className="w-full sm:w-auto min-w-[140px]"
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
                placeholder="Urutkan Tanggal"
                icon={Calendar}
                ariaLabel="Urutkan Modul Berdasarkan Tanggal"
                size="sm"
                className="w-full sm:w-auto min-w-[160px]"
              />

              {/* Reset Filter Button */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 h-9 w-full sm:w-auto sm:ml-auto justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                  title="Reset Filter"
                >
                  <RefreshCw className="size-3.5" />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>

            {/* ── LEMBAR DATA TABLE UTAMA ── */}
            <div className="overflow-x-auto">
              <TableRoot className="w-full text-left text-sm" aria-label="Daftar Modul Ajar">
                <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
                  <TableRow className="border-b-2 border-emerald-200/90 dark:border-emerald-800/80 bg-transparent text-emerald-950 dark:text-emerald-200">
                    <TableHead className="w-10 sm:w-12 px-2.5 sm:px-3.5 py-3.5 text-center font-extrabold text-[11px] uppercase tracking-wider">
                      No
                    </TableHead>
                    <TableHead className="w-auto sm:w-[38%] md:w-[42%] px-3.5 sm:px-6 md:px-8 py-3.5 font-extrabold text-[11px] uppercase tracking-wider">
                      Kode &amp; Judul Modul
                    </TableHead>
                    <TableHead className="hidden sm:table-cell w-[24%] px-3.5 py-3.5 font-extrabold text-[11px] uppercase tracking-wider">
                      Mata Pelajaran &amp; Guru
                    </TableHead>
                    <TableHead className="hidden md:table-cell w-[14%] px-3.5 py-3.5 font-extrabold text-[11px] uppercase tracking-wider">
                      Kelas &amp; Fase
                    </TableHead>
                    <TableHead className="hidden lg:table-cell w-[10%] px-2.5 py-3.5 text-center font-extrabold text-[11px] uppercase tracking-wider">
                      Alokasi
                    </TableHead>
                    <TableHead className="hidden xl:table-cell w-[8%] px-2.5 py-3.5 text-center font-extrabold text-[11px] uppercase tracking-wider">
                      Versi
                    </TableHead>
                    <TableHead className="hidden sm:table-cell w-[12%] px-3.5 py-3.5 text-center font-extrabold text-[11px] uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead
                      onClick={() => {
                        setSortDateOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))
                        setPage(1)
                      }}
                      className="hidden xl:table-cell w-[11%] px-3.5 py-3.5 text-center font-extrabold text-[11px] uppercase tracking-wider cursor-pointer hover:bg-emerald-200/50 dark:hover:bg-emerald-900/60 transition select-none"
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
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan="9" className="px-6 py-14 text-center text-slate-400">
                        <div className="flex flex-col justify-center items-center gap-2">
                          <RefreshCw className="h-6 w-6 animate-spin text-[#0E5C44]" />
                          <span className="text-xs font-semibold">Memuat data Modul Ajar...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : moduls.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan="9" className="px-6 py-14 text-center text-slate-400">
                        <div className="flex flex-col justify-center items-center gap-2">
                          <BookOpen className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Tidak ada data Modul Ajar ditemukan</p>
                          <p className="text-xs text-slate-400">Coba ubah kriteria pencarian atau tambahkan modul ajar baru.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    moduls.map((item, idx) => (
                      <TableRow
                        key={item.id}
                        className="group border-b border-emerald-100/90 dark:border-emerald-900/40 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all duration-150"
                      >
                        {/* No */}
                        <TableCell className="px-2.5 sm:px-3.5 py-3.5 text-center text-xs font-bold text-slate-400">
                          {(meta.from || 1) + idx}
                        </TableCell>

                        {/* Kode & Judul Modul */}
                        <TableCell className="px-3.5 sm:px-6 md:px-8 py-3.5">
                          <div
                            onClick={() => {
                              setSelectedModul(item)
                              setIsDetailModalOpen(true)
                            }}
                            className="cursor-pointer group/title"
                          >
                            <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover/title:text-[#0E5C44] dark:group-hover/title:text-[#3FBF75] transition-colors leading-snug">
                              {item.judul_modul || item.nama_modul}
                            </div>
                            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 px-2 py-0.5 rounded-md">
                                {item.kode_modul || 'MA-AUTO'}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                {item.semester ? `Sem. ${item.semester}` : ''}
                              </span>
                            </div>

                            {/* Mobile Compact Metadata Row */}
                            <div className="sm:hidden mt-2 flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-emerald-100/80 dark:border-emerald-900/40">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                                {item.subject?.nama_mapel || item.subject?.name || '-'}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                {item.kelas?.nama_kelas || item.school_class?.name || '-'}
                              </span>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                  item.status === 'Publish'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300'
                                    : item.status === 'Review'
                                    ? 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300'
                                    : item.status === 'Arsip'
                                    ? 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                                    : 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300'
                                }`}
                              >
                                {item.status}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Mapel & Guru */}
                        <TableCell className="hidden sm:table-cell px-3.5 py-3.5">
                          <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                            {item.subject?.nama_mapel || item.subject?.name || '-'}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[9px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                              <User className="size-3" />
                            </span>
                            <span className="truncate">
                              {item.user?.nama_lengkap || item.teacher?.nama_lengkap || item.teacher?.name || item.guru?.nama_lengkap || 'Guru Pengampu'}
                            </span>
                          </div>
                        </TableCell>

                        {/* Kelas & Fase */}
                        <TableCell className="hidden md:table-cell px-3.5 py-3.5">
                          <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                            {item.kelas?.nama_kelas || item.school_class?.name || '-'}
                          </div>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                            {getJenjangShortLabel(item.fase)}
                          </span>
                        </TableCell>

                        {/* Alokasi Jam */}
                        <TableCell className="hidden lg:table-cell px-2.5 py-3.5 text-center text-xs font-bold tabular-nums text-slate-700 dark:text-slate-300">
                          {item.alokasi_jam || item.alokasi_waktu_jp || 2} JP
                        </TableCell>

                        {/* Versi */}
                        <TableCell className="hidden xl:table-cell px-2.5 py-3.5 text-center font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          v{item.versi || '1.0'}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="hidden sm:table-cell px-3.5 py-3.5 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                              item.status === 'Publish'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
                                : item.status === 'Review'
                                ? 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800'
                                : item.status === 'Arsip'
                                ? 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                : 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800'
                            }`}
                          >
                            {item.status}
                          </span>
                        </TableCell>

                        {/* Tanggal */}
                        <TableCell className="hidden xl:table-cell px-3.5 py-3.5 text-center">
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
                                setSelectedModul(item)
                                setIsDetailModalOpen(true)
                              }}
                              onEdit={() => handleOpenEditModal(item)}
                              onDelete={() => setDeleteTarget(item)}
                              extraItems={[
                                {
                                  label: 'Cetak Dokumen RPP',
                                  icon: <Printer className="h-4 w-4 text-indigo-600" />,
                                  onClick: () => handlePrintSingleModul(item),
                                },
                                {
                                  label: 'Salin / Duplikasi',
                                  icon: <Copy className="h-4 w-4 text-blue-600" />,
                                  onClick: () => duplicateMutation.mutate(item.id),
                                },
                                {
                                  label: 'Riwayat Versi',
                                  icon: <History className="h-4 w-4 text-purple-600" />,
                                  onClick: () => {
                                    setSelectedModul(item)
                                    setIsRevisionModalOpen(true)
                                  },
                                },
                                ...(item.status !== 'Publish'
                                  ? [
                                      {
                                        label: 'Publikasikan',
                                        icon: <Send className="h-4 w-4 text-emerald-600" />,
                                        onClick: () => publishMutation.mutate(item.id),
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
                  Menampilkan <strong className="text-slate-900 dark:text-white">{meta.from || 0}</strong> -{' '}
                  <strong className="text-slate-900 dark:text-white">{meta.to || 0}</strong> dari{' '}
                  <strong className="text-slate-900 dark:text-white">{meta.total || 0}</strong> modul
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <HeroUiFilterSelect
                  value={String(perPage)}
                  onChange={(val) => {
                    setPerPage(Number(val))
                    setPage(1)
                  }}
                  options={[
                    { value: '5', label: '5 baris' },
                    { value: '10', label: '10 baris' },
                    { value: '20', label: '20 baris' },
                    { value: '50', label: '50 baris' },
                  ]}
                  placeholder="Baris per halaman"
                  ariaLabel="Pilih baris per halaman"
                  size="sm"
                  className="w-28"
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

        {/* ── MODAL FORM TAMBAH / EDIT MODUL (4-STEP WIZARD) ── */}
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
                className="my-auto flex max-h-[calc(100vh-2.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
              >
                {/* Top Accent Gradient Bar */}
                <div
                  className={`h-1.5 w-full shrink-0 bg-gradient-to-r ${
                    selectedModul
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
                          {selectedModul ? 'Ubah Modul Ajar' : 'Buat Modul Ajar Baru'}
                        </h3>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                          <Sparkles className="size-3" />
                          {selectedModul ? 'Update Modul' : 'Perencanaan KBM'}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        Langkah {formStep} dari 4 ·{' '}
                        {formStep === 1
                          ? 'Identitas & Pemetaan'
                          : formStep === 2
                          ? 'Rancangan & Media Ajar'
                          : formStep === 3
                          ? 'Skenario Aktivitas Belajar'
                          : 'Asesmen & Publikasi'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    aria-label="Tutup modal"
                    className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer shrink-0"
                  >
                    <X className="size-4 text-white" strokeWidth={2.25} />
                  </button>
                </div>

                {/* Stepper Wizard Navigation */}
                <div className="shrink-0 border-b border-slate-100 bg-slate-50/70 p-2.5 sm:px-6 dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                    {[
                      { id: 1, name: 'Identitas & Mapel' },
                      { id: 2, name: 'Rancangan & Media' },
                      { id: 3, name: 'Skenario Aktivitas' },
                      { id: 4, name: 'Asesmen & Status' },
                    ].map((step) => {
                      const isActive = formStep === step.id
                      const isDone = formStep > step.id
                      return (
                        <button
                          key={step.id}
                          type="button"
                          onClick={() => setFormStep(step.id)}
                          className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-bold transition-all cursor-pointer text-left ${
                            isActive
                              ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-700/20 dark:bg-emerald-600'
                              : isDone
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'border border-slate-200/80 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                          }`}
                        >
                          <span
                            className={`flex size-5 items-center justify-center rounded-lg text-[10px] font-black shrink-0 ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : isDone
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                            }`}
                          >
                            {isDone ? '✓' : step.id}
                          </span>
                          <span className="truncate hidden sm:inline">{step.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Form Body Scrollable */}
                <form onSubmit={handleTriggerSave} className="flex min-h-0 flex-1 flex-col">
                  <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                    {/* STEP 1: Identitas & Pemetaan */}
                    {formStep === 1 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Judul Modul Ajar <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative flex items-center">
                            <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400">
                              <BookOpen className="size-4" />
                            </div>
                            <input
                              type="text"
                              required
                              value={formData.judul_modul}
                              onChange={(e) => setFormData({ ...formData, judul_modul: e.target.value })}
                              placeholder="Contoh: Toleransi & Indahnya Keberagaman dalam Islam"
                              className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Kode Modul
                          </label>
                          <input
                            type="text"
                            value={formData.kode_modul}
                            onChange={(e) => setFormData({ ...formData, kode_modul: e.target.value })}
                            className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
                          />
                        </div>

                        <div>
                          <HeroUiModalSelect
                            label="Jenjang Pendidikan (Fase)"
                            value={formData.fase}
                            onChange={(val) => setFormData({ ...formData, fase: val })}
                            options={JENJANG_FASE_OPTIONS.map((j) => ({ value: j.value, label: j.label }))}
                            icon={GraduationCap}
                          />
                        </div>

                        <div>
                          <HeroUiModalSelect
                            label="Unit Pendidikan"
                            value={formData.unit_pendidikan_id || (options.education_units?.length === 1 ? options.education_units[0].id : '')}
                            onChange={(newUnit) => {
                              const newMapels = (options.subjects || []).filter(
                                (s) => s.unit_pendidikan_id === newUnit || s.unit_pendidikan?.id === newUnit
                              )
                              setFormData((prev) => ({
                                ...prev,
                                unit_pendidikan_id: newUnit,
                                mata_pelajaran_id: newMapels[0]?.id || '',
                              }))
                            }}
                            options={(options.education_units || []).map((u) => ({
                              value: u.id,
                              label: u.name || u.nama,
                            }))}
                            placeholder="-- Pilih Unit Pendidikan --"
                            disabled={options.education_units?.length === 1}
                            helperText={options.education_units?.length === 1 ? 'Unit otomatis disesuaikan dengan penugasan mengajar Anda.' : ''}
                            icon={Building2}
                          />
                        </div>

                        <div>
                          <HeroUiModalSelect
                            label="Mata Pelajaran"
                            value={formData.mata_pelajaran_id}
                            onChange={(val) => setFormData({ ...formData, mata_pelajaran_id: val })}
                            options={formAvailableSubjects.map((s) => ({
                              value: s.id,
                              label: s.nama_mapel || s.name || s.kode_mapel || s.code,
                              subtext: s.kode_mapel ? `Kode: ${s.kode_mapel}` : undefined,
                            }))}
                            placeholder={formAvailableSubjects.length === 0 ? '-- Tidak Ada Mapel di Unit Ini --' : '-- Pilih Mata Pelajaran --'}
                            searchable={formAvailableSubjects.length > 5}
                            icon={BookOpen}
                          />
                          {formAvailableSubjects.length === 0 && (
                            <p className="mt-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                              Unit ini belum memiliki mata pelajaran. Silakan pilih unit <strong>SDIT 1</strong> atau <strong>SMAIT</strong>, atau inputkan mapel di Master Mata Pelajaran.
                            </p>
                          )}
                        </div>

                        <div>
                          <HeroUiModalSelect
                            label="Guru Pengampu"
                            value={formData.guru_id}
                            onChange={(val) => setFormData({ ...formData, guru_id: val })}
                            options={(options.teachers || []).map((t) => ({
                              value: t.id,
                              label: t.nama_lengkap || t.nama || t.name || t.full_name,
                              subtext: t.nip ? `NIP: ${t.nip}` : undefined,
                            }))}
                            placeholder="-- Pilih Guru Pengampu --"
                            searchable={(options.teachers || []).length > 5}
                            icon={User}
                          />
                        </div>

                        <div>
                          <HeroUiModalSelect
                            label="Kelas Target"
                            value={formData.kelas_id}
                            onChange={(val) => setFormData({ ...formData, kelas_id: val })}
                            options={(options.classes || []).map((c) => ({
                              value: c.id,
                              label: c.nama_kelas || c.name || c.kode_kelas,
                              subtext: c.tingkat ? `Tingkat ${c.tingkat}` : undefined,
                            }))}
                            placeholder="-- Pilih Kelas Target --"
                            searchable={(options.classes || []).length > 5}
                            icon={Layers}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Alokasi Waktu (JP)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={formData.alokasi_waktu_jp}
                            onChange={(e) => setFormData({ ...formData, alokasi_waktu_jp: parseInt(e.target.value) || 2 })}
                            className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Target Peserta Didik
                          </label>
                          <input
                            type="text"
                            value={formData.target_peserta_didik}
                            onChange={(e) => setFormData({ ...formData, target_peserta_didik: e.target.value })}
                            placeholder="Contoh: Peserta Didik Reguler (28-32 Siswa)"
                            className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
                          />
                        </div>
                      </div>
                    )}

                    {/* STEP 2: Rancangan & Media */}
                    {formStep === 2 && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Alur Tujuan Pembelajaran (TP)
                          </label>
                          <textarea
                            rows="3"
                            value={formData.tujuan_pembelajaran}
                            onChange={(e) => setFormData({ ...formData, tujuan_pembelajaran: e.target.value })}
                            placeholder="Tuliskan tujuan pembelajaran yang ingin dicapai..."
                            className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100 resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Profil Pelajar Pancasila &amp; Rahmatan Lil Alamin
                          </label>
                          <input
                            type="text"
                            value={formData.profil_pelajar_pancasila}
                            onChange={(e) => setFormData({ ...formData, profil_pelajar_pancasila: e.target.value })}
                            className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                              Model Pembelajaran
                            </label>
                            <input
                              type="text"
                              value={formData.model_pembelajaran}
                              onChange={(e) => setFormData({ ...formData, model_pembelajaran: e.target.value })}
                              placeholder="Problem Based Learning (PBL)"
                              className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                              Metode Pembelajaran
                            </label>
                            <input
                              type="text"
                              value={formData.metode_pembelajaran}
                              onChange={(e) => setFormData({ ...formData, metode_pembelajaran: e.target.value })}
                              placeholder="Diskusi, Ceramah Interaktif, Presentasi"
                              className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Ringkasan Media &amp; Sumber Belajar
                          </label>
                          <input
                            type="text"
                            value={formData.media_pembelajaran}
                            onChange={(e) => setFormData({ ...formData, media_pembelajaran: e.target.value })}
                            placeholder="Contoh: Slide PPT Interaktif, Video Pembelajaran YouTube, Canva, LKPD..."
                            className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
                          />
                        </div>

                        {/* ── SEKSI BERKAS LAMPIRAN & TAUTAN MEDIA (HEROUI STYLE) ── */}
                        <div className="rounded-2xl border-2 border-emerald-500/25 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent p-4 sm:p-5 dark:border-emerald-700/40 dark:bg-slate-900/40 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-emerald-200/60 dark:border-emerald-900/50 pb-3">
                            <div className="flex items-center gap-2.5">
                              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs">
                                <Paperclip className="size-4.5" />
                              </div>
                              <div>
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  <span>Media Ajar &amp; Berkas Pendukung</span>
                                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                    {(formData.lampiran || []).length} Terpasang
                                  </span>
                                </h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                  Unggah dokumen, gambar, video langsung atau tautkan link media daring.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Media Type Tabs (HeroUI Segmented Switcher) */}
                          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
                            {[
                              { id: 'dokumen', label: 'Upload Dokumen', icon: FileText, accept: '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx' },
                              { id: 'gambar', label: 'Upload Foto/Gambar', icon: ImageIcon, accept: 'image/*' },
                              { id: 'video', label: 'Upload Video', icon: VideoIcon, accept: 'video/*' },
                              { id: 'link_dokumen', label: 'Link Dokumen', icon: LinkIcon },
                              { id: 'link_video', label: 'Link Video', icon: ExternalLink },
                            ].map((tab) => {
                              const isCurrent = mediaTab === tab.id
                              const Icon = tab.icon
                              return (
                                <button
                                  key={tab.id}
                                  type="button"
                                  onClick={() => setMediaTab(tab.id)}
                                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                                    isCurrent
                                      ? 'bg-white text-emerald-800 shadow-xs dark:bg-[#182232] dark:text-emerald-300'
                                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                                  }`}
                                >
                                  <Icon className="size-3.5" />
                                  <span>{tab.label}</span>
                                </button>
                              )
                            })}
                          </div>

                          {/* Tab Content 1: Upload File (Dokumen / Gambar / Video) */}
                          {['dokumen', 'gambar', 'video'].includes(mediaTab) && (
                            <div className="rounded-xl border border-dashed border-emerald-400/80 dark:border-emerald-600/60 bg-white/60 dark:bg-slate-900/60 p-4 sm:p-5 text-center transition-all hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20">
                              <input
                                ref={mediaFileInputRef}
                                type="file"
                                id="media-file-upload-input"
                                className="hidden"
                                accept={
                                  mediaTab === 'dokumen'
                                    ? '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx'
                                    : mediaTab === 'gambar'
                                    ? 'image/*'
                                    : 'video/*'
                                }
                                onChange={(e) => handleUploadMediaFile(e, mediaTab)}
                                disabled={isUploadingMedia}
                              />
                              <label
                                htmlFor="media-file-upload-input"
                                className="flex flex-col items-center justify-center cursor-pointer group"
                              >
                                {isUploadingMedia ? (
                                  <div className="flex flex-col items-center py-2">
                                    <Loader2 className="size-8 text-emerald-600 animate-spin mb-2" />
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                      Sedang mengunggah berkas ke server...
                                    </p>
                                    <p className="text-[11px] text-slate-400">Mohon tunggu sebentar</p>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 group-hover:scale-110 transition-transform mb-2">
                                      <Upload className="size-5" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                      Klik di sini untuk memilih{' '}
                                      {mediaTab === 'dokumen'
                                        ? 'Berkas Dokumen (PDF, Word, PPT, Excel)'
                                        : mediaTab === 'gambar'
                                        ? 'Foto / Gambar (JPG, PNG, WebP)'
                                        : 'Video Pembelajaran (MP4, WebM)'}
                                    </p>
                                    <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                                      Maksimal ukuran 50MB per berkas. Berkas otomatis tersimpan di penyimpanan modul ajar.
                                    </p>
                                  </>
                                )}
                              </label>
                            </div>
                          )}

                          {/* Tab Content 2: Input Tautan Link (Link Dokumen / Link Video) */}
                          {['link_dokumen', 'link_video'].includes(mediaTab) && (
                            <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4 space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Judul / Nama Materi Tautan
                                  </label>
                                  <input
                                    type="text"
                                    value={linkInputTitle}
                                    onChange={(e) => setLinkInputTitle(e.target.value)}
                                    placeholder={
                                      mediaTab === 'link_video'
                                        ? 'Contoh: Video Eksperimen Sains di YouTube'
                                        : 'Contoh: Modul Canva / Google Docs Ringkasan'
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    URL / Tautan Website <span className="text-rose-500">*</span>
                                  </label>
                                  <div className="relative">
                                    <LinkIcon className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                      type="url"
                                      value={linkInputUrl}
                                      onChange={(e) => setLinkInputUrl(e.target.value)}
                                      placeholder={
                                        mediaTab === 'link_video'
                                          ? 'https://youtube.com/watch?v=...'
                                          : 'https://docs.google.com/document/d/...'
                                      }
                                      className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-2 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleAddMediaLink(mediaTab)}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white transition active:scale-95 cursor-pointer shadow-xs"
                                >
                                  <Plus className="size-3.5" />
                                  <span>Sematkan Tautan</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Live Attachment List (HeroUI Cards) */}
                          <div className="space-y-2 pt-1">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Daftar Lampiran Terpasang:
                            </p>
                            {(!formData.lampiran || formData.lampiran.length === 0) ? (
                              <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-4 text-center text-xs text-slate-400">
                                Belum ada berkas atau tautan media yang dilampirkan pada modul ini.
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {formData.lampiran.map((att) => {
                                  const isLink = att.tipe === 'link_video' || att.tipe === 'link_dokumen'
                                  const isVideo = att.tipe === 'video' || att.tipe === 'link_video'
                                  const isImg = att.tipe === 'gambar'

                                  return (
                                    <div
                                      key={att.id}
                                      className="flex items-center justify-between gap-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#182232] p-2.5 shadow-xs hover:border-emerald-300 transition-colors"
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div
                                          className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-white font-bold text-[10px] ${
                                            isVideo
                                              ? 'bg-rose-500'
                                              : isImg
                                              ? 'bg-teal-500'
                                              : isLink
                                              ? 'bg-sky-500'
                                              : 'bg-indigo-500'
                                          }`}
                                        >
                                          {isVideo ? (
                                            <VideoIcon className="size-4" />
                                          ) : isImg ? (
                                            <ImageIcon className="size-4" />
                                          ) : isLink ? (
                                            <LinkIcon className="size-4" />
                                          ) : (
                                            <FileText className="size-4" />
                                          )}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                            {att.nama}
                                          </p>
                                          <p className="text-[10px] text-slate-400 truncate">
                                            {isLink ? 'Tautan Web Eksternal' : formatFileSize(att.ukuran) || att.ekstensi?.toUpperCase()}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-1 shrink-0">
                                        {att.url && (
                                          <a
                                            href={att.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="Buka / Pratinjau"
                                            className="flex size-7 items-center justify-center rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 dark:bg-slate-800 dark:hover:bg-emerald-950/50 dark:text-slate-300 dark:hover:text-emerald-300 transition"
                                          >
                                            <ExternalLink className="size-3.5" />
                                          </a>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveAttachment(att.id)}
                                          title="Hapus Lampiran"
                                          className="flex size-7 items-center justify-center rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 dark:text-rose-400 transition cursor-pointer"
                                        >
                                          <Trash2 className="size-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Skenario Aktivitas */}
                    {formStep === 3 && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Kegiatan Pendahuluan (Apersepsi)
                          </label>
                          <textarea
                            rows="3"
                            value={formData.kegiatan_pendahuluan}
                            onChange={(e) => setFormData({ ...formData, kegiatan_pendahuluan: e.target.value })}
                            className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100 resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Kegiatan Inti Pembelajaran
                          </label>
                          <textarea
                            rows="4"
                            value={formData.kegiatan_inti}
                            onChange={(e) => setFormData({ ...formData, kegiatan_inti: e.target.value })}
                            className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100 resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Kegiatan Penutup &amp; Refleksi
                          </label>
                          <textarea
                            rows="3"
                            value={formData.kegiatan_penutup}
                            onChange={(e) => setFormData({ ...formData, kegiatan_penutup: e.target.value })}
                            className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100 resize-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* STEP 4: Asesmen & Status */}
                    {formStep === 4 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                              Asesmen Awal
                            </label>
                            <textarea
                              rows="3"
                              value={formData.asesmen_awal}
                              onChange={(e) => setFormData({ ...formData, asesmen_awal: e.target.value })}
                              className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100 resize-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                              Asesmen Proses
                            </label>
                            <textarea
                              rows="3"
                              value={formData.asesmen_proses}
                              onChange={(e) => setFormData({ ...formData, asesmen_proses: e.target.value })}
                              className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100 resize-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                              Asesmen Akhir
                            </label>
                            <textarea
                              rows="3"
                              value={formData.asesmen_akhir}
                              onChange={(e) => setFormData({ ...formData, asesmen_akhir: e.target.value })}
                              className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100 resize-none"
                            />
                          </div>
                        </div>

                        <div>
                          <HeroUiModalSelect
                            label="Status Publikasi Modul"
                            value={formData.status}
                            onChange={(val) => setFormData({ ...formData, status: val })}
                            options={STATUS_LIST.map((st) => ({ value: st, label: st }))}
                            icon={FileCheck}
                          />
                        </div>

                        {selectedModul && (
                          <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.naikkan_versi}
                                onChange={(e) => setFormData({ ...formData, naikkan_versi: e.target.checked })}
                                className="rounded text-[#0E5C44] focus:ring-emerald-500"
                              />
                              Naikkan Versi Modul (Increment Version)
                            </label>
                            {formData.naikkan_versi && (
                              <input
                                type="text"
                                placeholder="Catatan revisi versi baru..."
                                value={formData.catatan_revisi}
                                onChange={(e) => setFormData({ ...formData, catatan_revisi: e.target.value })}
                                className="w-full rounded-xl border border-amber-300 bg-white p-2 text-xs font-medium dark:bg-slate-900"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-white px-5 py-4 sm:px-6 dark:border-slate-800 dark:bg-slate-950">
                    <button
                      type="button"
                      onClick={() => setIsFormModalOpen(false)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer shadow-sm shadow-rose-500/20"
                    >
                      <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                        <X className="size-3.5 text-white" strokeWidth={2.2} />
                      </div>
                      <span>Batal</span>
                    </button>

                    <div className="flex items-center gap-2.5">
                      {formStep > 1 && (
                        <button
                          type="button"
                          onClick={() => setFormStep((s) => s - 1)}
                          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white px-4 py-2.5 text-xs font-extrabold border border-blue-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                        >
                          <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                            <ArrowLeft className="size-3.5" strokeWidth={2.2} />
                          </div>
                          <span>Kembali</span>
                        </button>
                      )}

                      {formStep < 4 ? (
                        <button
                          type="button"
                          onClick={() => setFormStep((s) => s + 1)}
                          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white px-5 py-2.5 text-xs font-extrabold border border-emerald-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 cursor-pointer"
                        >
                          <span>Lanjut Step {formStep + 1}</span>
                          <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                            <ArrowRight className="size-3.5 text-white" strokeWidth={2.2} />
                          </div>
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white px-5 py-2.5 text-xs font-extrabold border border-emerald-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 cursor-pointer shadow-md shadow-emerald-700/20"
                        >
                          <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                            <Save className="size-3.5 text-white" strokeWidth={2.2} />
                          </div>
                          <span>{selectedModul ? 'Simpan Perubahan' : 'Simpan Modul Ajar'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── HARMONIZED SAVE / UPDATE CONFIRMATION MODAL ── */}
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
                    selectedModul
                      ? 'from-amber-400 via-amber-500 to-orange-500'
                      : 'from-emerald-500 via-teal-400 to-emerald-600'
                  }`}
                />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`flex size-11 shrink-0 items-center justify-center rounded-2xl border shadow-md ${
                        selectedModul
                          ? 'bg-gradient-to-br from-amber-50 to-orange-50 text-amber-700 border-amber-200'
                          : 'bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {selectedModul ? <Pencil className="size-5" /> : <BookOpen className="size-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        {selectedModul ? 'Konfirmasi Pembaruan Modul' : 'Konfirmasi Simpan Modul'}
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {selectedModul ? 'Simpan revisi data modul ajar' : 'Tambahkan modul ajar baru ke sistem'}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 space-y-1 dark:border-slate-800 dark:bg-slate-900/50">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{formData.judul_modul}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      Kode: {formData.kode_modul} • {formData.fase} • Alokasi: {formData.alokasi_waktu_jp} JP
                    </p>
                  </div>

                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Pastikan seluruh data tujuan pembelajaran, kegiatan, dan instrumen asesmen telah sesuai sebelum menyimpan.
                  </p>

                  <div className="mt-6 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowSaveConfirmModal(false)}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
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
                      <span>Ya, Simpan Modul</span>
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
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                          Pindahkan ke Sampah?
                        </h4>
                        <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold text-rose-700 dark:bg-rose-950/80 dark:text-rose-300">
                          Soft Delete
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Data dapat dipulihkan kapan saja dari filter sampah
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-3.5 space-y-1 dark:border-rose-900/50 dark:bg-rose-950/20">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {deleteTarget.judul_modul || deleteTarget.nama_modul}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Kode: {deleteTarget.kode_modul || '-'} • Mapel: {deleteTarget.subject?.nama_mapel || deleteTarget.subject?.name || '-'}
                    </p>
                  </div>

                  <p className="mt-3 text-xs text-rose-700/80 dark:text-rose-400 font-medium leading-relaxed">
                    Modul ajar ini akan dinonaktifkan dari jadwal KBM aktif hingga dipulihkan kembali oleh guru pengampu atau kurikulum.
                  </p>

                  <div className="mt-6 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(null)}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
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
                      <span>Ya, Pindahkan</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── MODAL DETAIL OVERVIEW & OPSI AKSI ── */}
        <AnimatePresence>
          {isDetailModalOpen && selectedModul && (
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="my-auto flex max-h-[calc(100vh-2.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
                <div className="bg-[#0E5C44] px-6 py-4 text-white flex items-center justify-between shrink-0">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full font-bold">
                      {selectedModul.fase} • Versi {selectedModul.versi || '1.0'}
                    </span>
                    <h3 className="text-lg font-extrabold mt-1 leading-snug">{selectedModul.judul_modul}</h3>
                    <p className="text-xs text-emerald-100 mt-0.5 font-mono">Kode: {selectedModul.kode_modul || 'MA-AUTO'}</p>
                  </div>
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="rounded-xl p-1.5 text-emerald-100 hover:bg-white/10 hover:text-white cursor-pointer"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {/* Quick Action Toolbar inside Overview */}
                <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-amber-500" />
                    Opsi Tindakan:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDetailModalOpen(false)
                        handleOpenEditModal(selectedModul)
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900/60 transition cursor-pointer"
                    >
                      <Pencil className="size-3.5" /> Edit Modul
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrintSingleModul(selectedModul)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition cursor-pointer"
                    >
                      <Printer className="size-3.5" /> Cetak RPP
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDetailModalOpen(false)
                        duplicateMutation.mutate(selectedModul.id)
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition cursor-pointer"
                    >
                      <Copy className="size-3.5" /> Duplikasi
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDetailModalOpen(false)
                        setIsRevisionModalOpen(true)
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 dark:hover:bg-purple-900/60 transition cursor-pointer"
                    >
                      <History className="size-3.5" /> Riwayat
                    </button>
                    {selectedModul.status !== 'Publish' && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsDetailModalOpen(false)
                          publishMutation.mutate(selectedModul.id)
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition cursor-pointer"
                      >
                        <Send className="size-3.5" /> Publikasi
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setIsDetailModalOpen(false)
                        setDeleteTarget(selectedModul)
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition cursor-pointer"
                    >
                      <Trash2 className="size-3.5" /> Hapus
                    </button>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-6 space-y-5 overflow-y-auto text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Mata Pelajaran</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {selectedModul.subject?.nama_mapel || selectedModul.subject?.name || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Guru Pengampu</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {selectedModul.guru?.nama_lengkap || selectedModul.user?.nama_lengkap || selectedModul.teacher?.nama_lengkap || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Kelas Target</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {selectedModul.kelas?.nama_kelas || selectedModul.kelas?.name || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Alokasi Jam</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {selectedModul.alokasi_waktu_jp || selectedModul.alokasi_jam || 2} JP
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#0E5C44] dark:text-emerald-400 uppercase text-[11px] tracking-wider mb-1.5">
                      Tujuan Pembelajaran (TP)
                    </h4>
                    <p className="whitespace-pre-line text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 leading-relaxed">
                      {selectedModul.tujuan_pembelajaran || 'Belum diisi.'}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#0E5C44] dark:text-emerald-400 uppercase text-[11px] tracking-wider mb-1.5">
                      Profil Pelajar Pancasila
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                      {selectedModul.profil_pelajar_pancasila || '-'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                      <h5 className="font-bold text-[10px] uppercase text-slate-400 mb-1">Pendahuluan</h5>
                      <p className="whitespace-pre-line leading-relaxed">{selectedModul.kegiatan_pendahuluan || '-'}</p>
                    </div>
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                      <h5 className="font-bold text-[10px] uppercase text-slate-400 mb-1">Kegiatan Inti</h5>
                      <p className="whitespace-pre-line leading-relaxed">{selectedModul.kegiatan_inti || '-'}</p>
                    </div>
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                      <h5 className="font-bold text-[10px] uppercase text-slate-400 mb-1">Penutup</h5>
                      <p className="whitespace-pre-line leading-relaxed">{selectedModul.kegiatan_penutup || '-'}</p>
                    </div>
                  </div>

                  {/* Lampiran Media Pembelajaran */}
                  {Array.isArray(selectedModul.lampiran) && selectedModul.lampiran.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-[#0E5C44] dark:text-emerald-400 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                        <Paperclip className="size-3.5" />
                        <span>Lampiran Media Pembelajaran ({selectedModul.lampiran.length})</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {selectedModul.lampiran.map((att, idx) => {
                          const isLink = att.tipe === 'link_video' || att.tipe === 'link_dokumen'
                          const isVideo = att.tipe === 'video' || att.tipe === 'link_video'
                          const isImg = att.tipe === 'gambar'

                          return (
                            <div
                              key={att.id || idx}
                              className="flex items-center justify-between gap-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#182232] p-2.5 shadow-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-white font-bold text-[10px] ${
                                    isVideo
                                      ? 'bg-rose-500'
                                      : isImg
                                      ? 'bg-teal-500'
                                      : isLink
                                      ? 'bg-sky-500'
                                      : 'bg-indigo-500'
                                  }`}
                                >
                                  {isVideo ? (
                                    <VideoIcon className="size-4" />
                                  ) : isImg ? (
                                    <ImageIcon className="size-4" />
                                  ) : isLink ? (
                                    <LinkIcon className="size-4" />
                                  ) : (
                                    <FileText className="size-4" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                    {att.nama}
                                  </p>
                                  <p className="text-[10px] text-slate-400 truncate">
                                    {isLink ? 'Tautan Eksternal' : formatFileSize(att.ukuran) || att.ekstensi?.toUpperCase()}
                                  </p>
                                </div>
                              </div>

                              {att.url && (
                                <a
                                  href={att.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 shrink-0"
                                >
                                  <span>Buka</span>
                                  <ExternalLink className="size-3" />
                                </a>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsDetailModalOpen(false)}
                    className="px-5 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl text-xs font-bold hover:bg-slate-300 cursor-pointer"
                  >
                    Tutup Rincian
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
                        <span>Import Modul Ajar</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-300">
                          <Sparkles className="size-3" /> Batch Import
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Unggah berkas spreadsheet (.xlsx atau .csv) untuk impor data perencanaan modul ajar.
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
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Gunakan berkas template resmi agar pemetaan kolom presisi</p>
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
                    onClick={() => document.getElementById('modul-import-file-input')?.click()}
                  >
                    <input
                      id="modul-import-file-input"
                      type="file"
                      accept=".csv, .xlsx, .xls"
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
                        <p className="text-[10px] text-slate-400 mt-1">Mendukung format .csv, .xlsx, .xls (Maks. 5MB)</p>
                      </div>
                    )}
                  </div>

                  {/* Mini Preview Datatable */}
                  {importPreviewData.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pratinjau Data Impor (5 baris pertama):</p>
                      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                        <TableRoot className="w-full text-left text-[11px]">
                          <TableHeader>
                            <TableRow className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                              <TableHead className="p-2">Kode</TableHead>
                              <TableHead className="p-2">Judul Modul</TableHead>
                              <TableHead className="p-2">Fase</TableHead>
                              <TableHead className="p-2">Mapel</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {importPreviewData.map((row, i) => (
                              <TableRow key={i}>
                                <TableCell className="p-2 font-mono">{row.kode}</TableCell>
                                <TableCell className="p-2 font-semibold">{row.judul}</TableCell>
                                <TableCell className="p-2">{row.fase}</TableCell>
                                <TableCell className="p-2">{row.mapel}</TableCell>
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

        {/* ── HARMONIZED RIWAYAT REVISI MODAL ── */}
        <AnimatePresence>
          {isRevisionModalOpen && selectedModul && (
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="my-auto flex max-h-[calc(100vh-2.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-purple-200 bg-white shadow-2xl dark:border-purple-900/60 dark:bg-slate-950"
              >
                <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600" />
                <div className="bg-gradient-to-br from-purple-700 via-indigo-700 to-purple-900 p-5 text-white flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-white/20 text-white">
                      <History className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">Riwayat Revisi Versi Modul</h3>
                      <p className="text-xs text-purple-200 font-mono">{selectedModul.kode_modul} • {selectedModul.judul_modul}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsRevisionModalOpen(false)}
                    className="rounded-xl p-1 text-purple-200 hover:text-white cursor-pointer"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <div className="p-6 space-y-3.5 max-h-[60vh] overflow-y-auto">
                  {!revisionsData?.data || revisionsData.data.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                      <History className="size-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-xs font-semibold">Belum ada riwayat revisi versi tercatat.</p>
                      <p className="text-[10px] text-slate-400">Centang opsi 'Naikkan Versi' saat menyimpan untuk menambah catatan versi baru.</p>
                    </div>
                  ) : (
                    revisionsData.data.map((rev, idx) => (
                      <div
                        key={rev.id || idx}
                        className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] bg-purple-700 text-white px-2.5 py-0.5 rounded-lg font-bold">
                            v{rev.versi}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">{rev.created_at || 'Tercatat'}</span>
                        </div>
                        <p className="font-bold text-xs text-slate-900 dark:text-white">{rev.judul_modul}</p>
                        <p className="text-xs text-slate-500 italic leading-relaxed">{rev.catatan_revisi || 'Pembaruan isi dan aktivitas modul.'}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsRevisionModalOpen(false)}
                    className="px-5 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl text-xs font-bold hover:bg-slate-300 cursor-pointer"
                  >
                    Tutup
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
          title="Modul Ajar (RPP Digital)"
          onPrint={() => {
            const rowsToPrint = Array.isArray(moduls) ? moduls : []
            printCleanTable({
              title: 'Laporan Data Modul Ajar (RPP Digital)',
              subtitle: 'Daftar Perencanaan Modul Ajar Sekolah Islam Terpadu',
              headers: ['NO', 'KODE MODUL', 'JUDUL MODUL', 'MATA PELAJARAN', 'GURU PENGAMPU', 'ALOKASI WAKTU', 'STATUS'],
              rows: rowsToPrint.map((row, i) => [
                i + 1,
                row.kode_modul || '-',
                row.judul_modul || row.nama_modul || '-',
                row.subject?.nama_mapel || row.subject?.name || '-',
                row.guru?.nama_lengkap || row.user?.nama_lengkap || row.teacher?.nama_lengkap || '-',
                `${row.alokasi_jam || row.alokasi_waktu_jp || 0} JP`,
                row.status || 'Draft',
              ]),
            })
          }}
          onDownload={() => {
            const rowsToPrint = Array.isArray(moduls) ? moduls : []
            downloadPdfTable({
              title: 'Laporan Data Modul Ajar (RPP Digital)',
              subtitle: 'Daftar Perencanaan Modul Ajar Sekolah Islam Terpadu',
              headers: ['NO', 'KODE MODUL', 'JUDUL MODUL', 'MATA PELAJARAN', 'GURU PENGAMPU', 'ALOKASI WAKTU', 'STATUS'],
              rows: rowsToPrint.map((row, i) => [
                i + 1,
                row.kode_modul || '-',
                row.judul_modul || row.nama_modul || '-',
                row.subject?.nama_mapel || row.subject?.name || '-',
                row.guru?.nama_lengkap || row.user?.nama_lengkap || row.teacher?.nama_lengkap || '-',
                `${row.alokasi_jam || row.alokasi_waktu_jp || 0} JP`,
                row.status || 'Draft',
              ]),
              filename: 'laporan_modul_ajar.pdf',
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
          moduleTitle="Modul Ajar"
        />

      </motion.div>
    </PageContainer>
  )
}
