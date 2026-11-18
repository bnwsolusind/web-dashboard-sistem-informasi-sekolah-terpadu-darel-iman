import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, BookOpen, Target, Award, Plus, Search, Edit3, Trash2,
  Copy, CheckCircle2, XCircle, Clock, Sparkles, RefreshCw, X,
  AlertTriangle, ChevronLeft, ChevronRight, ShieldAlert,
  Layers, CheckSquare, ChevronDown, Check, School, Lock,
} from 'lucide-react'
import { lmsKisiKisiService } from '../services/lmsKisiKisiService'
import { subjectService } from '../services/subjectService'
import { useAuthStore } from '../stores/authStore'
import { useUnitStore } from '../stores/unitStore'
import { usePengaturanStore } from '../stores/pengaturanStore'
import ActionDropdown from '../components/app/ActionDropdown'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { useDebounce } from '../hooks/useDebounce'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import { MasterDataTable, SquircleActionButton, PrintOptionModal } from '../components/master-data'
import {
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui/table'
import CsvImportModal from '../components/master-data/CsvImportModal'
import { RotateCcw, Printer } from 'lucide-react'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.02 } } }
const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } } }

// ── PALET WARNA RESMI MODERN KPI CARDS ──
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
  blue: {
    card: 'border-blue-300/70 bg-gradient-to-br from-blue-50 via-indigo-50/60 to-white hover:border-blue-400 dark:border-blue-700/50 dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-slate-900',
    glow: 'bg-blue-400/20 group-hover:bg-blue-400/30',
    iconBox: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/30',
    tag: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
    title: 'text-blue-700 dark:text-blue-400',
    val: 'text-blue-700 dark:text-blue-300',
    sub: 'text-sky-600/80 dark:text-sky-400/80',
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
  amber: {
    card: 'border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
    glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
    iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/30',
    tag: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    title: 'text-amber-700 dark:text-amber-400',
    val: 'text-amber-700 dark:text-amber-300',
    sub: 'text-amber-600/80 dark:text-amber-400/80',
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
      className={`group relative overflow-hidden rounded-[18px] border-2 p-4 sm:p-5 shadow-xs transition-[border-color,box-shadow] duration-150 text-left ${
        isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
      } ${t.card} ${active ? '!ring-2 !ring-emerald-500 !border-emerald-500 shadow-md shadow-emerald-500/20' : ''}`}
    >
      <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all ${t.glow}`} />
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm ${t.iconBox}`}>
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className={`text-xs font-bold ${t.title}`}>{label}</p>
            {tag && (
              <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-extrabold ${t.tag}`}>
                {tag}
              </span>
            )}
          </div>
        </div>
      </div>
      <p className={`text-2xl font-black tabular-nums tracking-tight ${t.val}`}>{value ?? 0}</p>
      {subtext && (
        <p className={`mt-1.5 text-xs font-semibold ${t.sub} truncate`}>
          {subtext}
        </p>
      )}
    </motion.div>
  )
}

function SoalProgressBar({ current, target }) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0
  const color = pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-rose-400'
  const textColor = pct >= 100 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-rose-500'
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{current}/{target} soal</span>
        <span className={`text-[10px] font-black ${textColor}`}>{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

const normalizeArray = (v) => { if (Array.isArray(v)) return v; if (Array.isArray(v?.data)) return v.data; return [] }
const getSubjectLabel = (s) => s?.label || s?.nama_mapel || s?.nama || s?.name || s?.kode_mapel || 'Mata Pelajaran'
const getJenisBadgeColor = (j) => {
  switch (j) {
    case 'UH': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300'
    case 'PTS': case 'UTS': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300'
    case 'PAS': case 'UAS': return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300'
    case 'CBT': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300'
    default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
  }
}
function HarmonizedDeleteModal({ isOpen, onClose, onConfirm, item, isSubmitting }) {
  if (!isOpen || !item) return null
  const cnt = item?.ujian_count || 0
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
                Hapus Kisi-kisi?
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            Apakah Anda yakin ingin menghapus kisi-kisi <strong className="text-slate-900 dark:text-white">"{item.judul_kisi || 'ini'}"</strong>?
          </p>
          {cnt > 0 && (
            <div className="rounded-xl border border-rose-200/80 bg-rose-50/50 p-3 dark:border-rose-900/40 dark:bg-rose-950/20 mb-6">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-rose-800 dark:text-rose-300">
                  Perhatian: Kisi-kisi ini masih dipakai di {cnt} ujian aktif. Menghapus data ini dapat berdampak pada konfigurasi ujian terkait.
                </p>
              </div>
            </div>
          )}
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
              {isSubmitting ? 'Menghapus...' : 'Ya, Hapus'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
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

export default function LmsKisiKisiPage({ embedded, hidePageHeader, tabNav, onNavigateToBankSoal }) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const activeUnit = useUnitStore((s) => s.activeUnit)
  const customLabels = usePengaturanStore((s) => s.customLabels)
  const ujianLabels = customLabels?.ujian || {}

  const getJenisLabel = (j) => {
    switch (j) {
      case 'UH': return ujianLabels.singkatan_uh || 'UH'
      case 'PTS': case 'UTS': return ujianLabels.singkatan_pts || 'PTS'
      case 'PAS': case 'UAS': return ujianLabels.singkatan_pas || 'PAS'
      case 'CBT': return ujianLabels.singkatan_cbt || 'CBT'
      case 'Remedial': return ujianLabels.singkatan_remedial || 'Remedial'
      default: return j || '-'
    }
  }

  const getJenisFullName = (j) => {
    switch (j) {
      case 'UH': return ujianLabels.jenis_uh || 'Ulangan Harian (UH)'
      case 'PTS': case 'UTS': return ujianLabels.jenis_pts || 'Penilaian Tengah Semester (PTS)'
      case 'PAS': case 'UAS': return ujianLabels.jenis_pas || 'Penilaian Akhir Semester (PAS)'
      case 'CBT': return ujianLabels.jenis_cbt || 'Computer Based Test (CBT)'
      case 'Remedial': return ujianLabels.jenis_remedial || 'Ujian Remedial'
      default: return j || '-'
    }
  }

  const getKognitifLabel = (k) => {
    if (!k) return ''
    if (k.startsWith('C1')) return ujianLabels.kognitif_c1 || k
    if (k.startsWith('C2')) return ujianLabels.kognitif_c2 || k
    if (k.startsWith('C3')) return ujianLabels.kognitif_c3 || k
    if (k.startsWith('C4')) return ujianLabels.kognitif_c4 || k
    if (k.startsWith('C5')) return ujianLabels.kognitif_c5 || k
    if (k.startsWith('C6')) return ujianLabels.kognitif_c6 || k
    return k
  }

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, item: null, isSubmitting: false })

  const handleGoToBankSoal = (item) => {
    if (item?.id) {
      sessionStorage.setItem('bankSoal_prefill_kisi_id', item.id)
      sessionStorage.setItem('bankSoal_prefill_kisi_judul', item.judul_kisi || '')
      sessionStorage.setItem('bankSoal_prefill_mapel_id', item.mata_pelajaran_id || '')
    }
    if (typeof onNavigateToBankSoal === 'function') {
      onNavigateToBankSoal(item)
      return
    }
    navigate(`/dashboard/lms/bank-soal?kisi_id=${item?.id || ''}`)
  }

  const userUnitId = useMemo(() => {
    const c = [user?.unit_id, user?.unit_pendidikan_id, user?.education_unit_id, user?.unit?.id, user?.education_unit?.id, user?.unit_pendidikan?.id, user?.employee?.unit_id, user?.employee?.unit_pendidikan_id, user?.employee?.education_unit_id, user?.school_info?.id].filter(Boolean)
    return c.length > 0 ? String(c[0]) : null
  }, [user])

  const userEmployeeId = useMemo(() => {
    const c = [user?.employee_id, user?.employee?.id, user?.unit?.employee_id].filter(Boolean)
    return c.length > 0 ? String(c[0]) : null
  }, [user])

  const userRoles = useMemo(() => {
    const rawRoles = user?.roles || []
    return rawRoles.map((r) => (typeof r === 'string' ? r : r?.name || '')).filter(Boolean)
  }, [user])

  const isSuperAdminOrYayasan = useMemo(() => {
    return userRoles.some((r) => ['super_admin', 'Super Admin', 'super-admin', 'yayasan', 'Yayasan', 'pengurus_yayasan', 'ketua_yayasan'].includes(r))
  }, [userRoles])

  const isDivisiPendidikan = useMemo(() => {
    return userRoles.some((r) => ['Divisi Pendidikan', 'divisi_pendidikan', 'divisi-pendidikan', 'Kepala Bidang Pendidikan', 'kepala_bidang_pendidikan', 'Divisi Kurikulum', 'Divisi Kesiswaan'].includes(r))
  }, [userRoles])

  const canSelectUnit = isSuperAdminOrYayasan || isDivisiPendidikan
  const userUnitName = user?.unit_name || user?.employee?.unit?.nama_unit || user?.employee?.unit?.name || 'Unit Anda'

  const isAdminOrKurikulum = useMemo(() => {
    const normalized = userRoles.map((r) => r.toLowerCase().replace(/[\s_-]+/g, ''))
    return normalized.some((r) =>
      ['superadmin', 'yayasan', 'ketuayayasan', 'pengurusyayasan', 'sekretarisyayasan', 'bendaharayayasan', 'kepalasekolah', 'tatausaha', 'tu', 'divisipendidikan', 'wakakurikulum', 'kurikulum'].includes(r)
    )
  }, [userRoles])

  const currentTeacherName = useMemo(() => {
    return user?.employee?.nama_lengkap || user?.name || user?.username || 'Anda'
  }, [user])

  const [dataList, setDataList] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })
  const [stats, setStats] = useState({ total: 0, aktif: 0, nonaktif: 0, total_soal_target: 0, uh: 0, pts: 0, pas: 0 })
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [options, setOptions] = useState({ subjects: [], kurikulum: [], kelas: [], semesters: [], tahun_ajaran: [], guru: [], capaian_pembelajaran: [], tujuan_pembelajaran: [], jenis_ujian_options: [], level_kognitif_options: [], units: [] })
  const [selectedUnit, setSelectedUnit] = useState(canSelectUnit ? '' : (userUnitId ? String(userUnitId) : ''))
  const [filters, setFilters] = useState({ search: '', mata_pelajaran_id: '', jenis_ujian: '', status: '', kelas_id: '', semester_id: '' })
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 350)

  useEffect(() => {
    setFilters((p) => ({ ...p, search: debouncedSearch }))
  }, [debouncedSearch])

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [viewingItem, setViewingItem] = useState(null)
  const [rowDetailItem, setRowDetailItem] = useState(null)
  const [showRowDetailModal, setShowRowDetailModal] = useState(false)
  const [distribusiError, setDistribusiError] = useState('')
  const [formData, setFormData] = useState({
    judul_kisi: '', mata_pelajaran_id: '', cp_id: '', tp_id: '', kurikulum_id: '',
    kelas_id: '', semester_id: '', tahun_ajaran_id: '', guru_id: '',
    jenis_ujian: '', jumlah_soal: 20, alokasi_waktu_menit: 60,
    kompetensi_dasar: '', level_kognitif: '',
    distribusi_bobot: {}, status: true,
  })

  useEffect(() => { fetchStats(); fetchOptions() }, [userUnitId, activeUnit, selectedUnit])
  useEffect(() => { fetchData(1) }, [filters, userUnitId, activeUnit, selectedUnit])

  // Auto-set default jenis_ujian dan level_kognitif dari opsi pertama backend
  useEffect(() => {
    if (options.jenis_ujian_options.length > 0 && !formData.jenis_ujian) {
      setFormData((p) => ({ ...p, jenis_ujian: options.jenis_ujian_options[0].id }))
    }
  }, [options.jenis_ujian_options])

  useEffect(() => {
    if (options.level_kognitif_options.length > 0 && !formData.level_kognitif) {
      setFormData((p) => ({ ...p, level_kognitif: options.level_kognitif_options[0].id }))
    }
  }, [options.level_kognitif_options])

  const showNotification = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async (page = 1) => {
    setLoading(true)
    try {
      const params = { page, per_page: 10, ...filters }
      const effectiveUnit = canSelectUnit ? (selectedUnit || undefined) : (userUnitId || undefined)
      if (effectiveUnit) params.unit_pendidikan_id = effectiveUnit
      if (activeUnit) params.jenjang = activeUnit
      const response = await lmsKisiKisiService.getDaftar(params)
      if (response?.data) {
        let raw = Array.isArray(response.data) ? response.data : (response.data?.data || [])
        let filtered = raw.filter((item) => {
          if (!item) return false
          const iUnit = item.unit_pendidikan_id || item.unit_id || item.mata_pelajaran?.unit_pendidikan_id
          if (!canSelectUnit && userUnitId && iUnit) return String(iUnit) === String(userUnitId)
          if (canSelectUnit && selectedUnit && iUnit) return String(iUnit) === String(selectedUnit)
          return true
        })
        setDataList(filtered)
        setPagination({ currentPage: response.meta?.current_page || 1, lastPage: response.meta?.last_page || 1, total: response.meta?.total || filtered.length })
      }
    } catch (err) { console.error('Gagal mengambil data kisi-kisi:', err); showNotification('Gagal memuat data kisi-kisi ujian.', 'error') }
    finally { setLoading(false) }
  }

  const fetchStats = async () => {
    try {
      const params = {}
      const effectiveUnit = canSelectUnit ? (selectedUnit || undefined) : (userUnitId || undefined)
      if (effectiveUnit) params.unit_pendidikan_id = effectiveUnit
      if (activeUnit) params.jenjang = activeUnit
      const res = await lmsKisiKisiService.getStats(params)
      if (res?.data) setStats(res.data)
    } catch (err) { console.error('Gagal stats:', err) }
  }

  const fetchOptions = async (mapelId = null, cpId = null) => {
    setLoadingOptions(true)
    try {
      const params = {}
      const effectiveUnit = canSelectUnit ? (selectedUnit || undefined) : (userUnitId || undefined)
      if (effectiveUnit) params.unit_pendidikan_id = effectiveUnit
      if (activeUnit) params.jenjang = activeUnit
      if (mapelId) params.mata_pelajaran_id = mapelId
      if (cpId) params.cp_id = cpId

      const resOpts = await lmsKisiKisiService.getOptions(params)
      const resData = resOpts?.data?.data ?? resOpts?.data ?? resOpts ?? {}

      const rawSubjects = resData.subjects ?? resData.mata_pelajaran ?? resData.mata_pelajarans
      const subjects = normalizeArray(rawSubjects).filter((s) => {
        if (!s) return false
        const sU = s.unit_pendidikan_id || s.unit_id
        if (!canSelectUnit && userUnitId && sU) return String(sU) === String(userUnitId)
        if (canSelectUnit && selectedUnit && sU) return String(sU) === String(selectedUnit)
        return true
      })

      const rawKelas = resData.kelas
      const kelas = normalizeArray(rawKelas).filter((k) => {
        if (!k) return false
        const kU = k.unit_pendidikan_id || k.unit_id
        if (!canSelectUnit && userUnitId && kU) return String(kU) === String(userUnitId)
        if (canSelectUnit && selectedUnit && kU) return String(kU) === String(selectedUnit)
        return true
      })

      setOptions((prev) => ({
        ...prev,
        units: resData.units !== undefined ? normalizeArray(resData.units) : prev.units,
        subjects: rawSubjects !== undefined ? subjects : prev.subjects,
        kurikulum: resData.kurikulum !== undefined ? normalizeArray(resData.kurikulum) : prev.kurikulum,
        kelas: rawKelas !== undefined ? kelas : prev.kelas,
        semesters: resData.semesters !== undefined ? normalizeArray(resData.semesters) : prev.semesters,
        tahun_ajaran: resData.tahun_ajaran !== undefined ? normalizeArray(resData.tahun_ajaran) : prev.tahun_ajaran,
        guru: resData.guru !== undefined ? normalizeArray(resData.guru) : prev.guru,
        capaian_pembelajaran: (resData.capaian_pembelajaran !== undefined || resData.cp !== undefined) ? normalizeArray(resData.capaian_pembelajaran ?? resData.cp) : prev.capaian_pembelajaran,
        tujuan_pembelajaran: (resData.tujuan_pembelajaran !== undefined || resData.tp !== undefined) ? normalizeArray(resData.tujuan_pembelajaran ?? resData.tp) : prev.tujuan_pembelajaran,
        jenis_ujian_options: resData.jenis_ujian_options !== undefined ? normalizeArray(resData.jenis_ujian_options) : prev.jenis_ujian_options,
        level_kognitif_options: resData.level_kognitif_options !== undefined ? normalizeArray(resData.level_kognitif_options) : prev.level_kognitif_options,
      }))
    } catch (err) { console.error('Gagal opsi:', err) }
    finally { setLoadingOptions(false) }
  }

  const handleMataPelajaranChange = async (mapelId) => {
    setFormData((p) => ({ ...p, mata_pelajaran_id: mapelId, cp_id: '', tp_id: '' }))
    setOptions((p) => ({ ...p, capaian_pembelajaran: [], tujuan_pembelajaran: [] }))
    if (!mapelId) return
    await fetchOptions(mapelId, null)
  }

  const handleCpChange = async (cpId) => {
    const selectedCp = options.capaian_pembelajaran.find((c) => String(c.id) === String(cpId))
    setFormData((p) => ({
      ...p,
      cp_id: cpId,
      tp_id: '',
      kompetensi_dasar: p.kompetensi_dasar || selectedCp?.deskripsi || selectedCp?.nama_cp || p.kompetensi_dasar,
    }))
    setOptions((p) => ({ ...p, tujuan_pembelajaran: [] }))
    if (!cpId) return
    await fetchOptions(formData.mata_pelajaran_id, cpId)
  }

  const handleDistribusiChange = (key, val) => {
    const updated = { ...formData.distribusi_bobot, [key]: Number(val) }
    const total = (updated.pg || 0) + (updated.isian || 0) + (updated.esai || 0)
    setDistribusiError(total !== 100 ? `Total bobot harus 100%. Saat ini: ${total}%` : '')
    setFormData((p) => ({ ...p, distribusi_bobot: updated }))
  }

  const handleOpenModal = (item = null) => {
    setDistribusiError('')
    if (item) {
      setEditingItem(item)
      setFormData({
        judul_kisi: item.judul_kisi || '', mata_pelajaran_id: item.mata_pelajaran_id || '',
        cp_id: item.cp_id || '', tp_id: item.tp_id || '', kurikulum_id: item.kurikulum_id || '',
        kelas_id: item.kelas_id || '', semester_id: item.semester_id || '',
        tahun_ajaran_id: item.tahun_ajaran_id || '', guru_id: item.guru_id || userEmployeeId || '',
        jenis_ujian: item.jenis_ujian || '', jumlah_soal: item.jumlah_soal || 20,
        alokasi_waktu_menit: item.alokasi_waktu_menit || 60, kompetensi_dasar: item.kompetensi_dasar || '',
        level_kognitif: item.level_kognitif || '',
        distribusi_bobot: item.distribusi_bobot || {},
        status: item.status !== undefined ? item.status : true,
      })
      fetchOptions(item.mata_pelajaran_id || null, item.cp_id || null)
    } else {
      setEditingItem(null)
      setFormData({
        judul_kisi: '', mata_pelajaran_id: '', cp_id: '', tp_id: '',
        kurikulum_id: '', kelas_id: '', semester_id: '', tahun_ajaran_id: '',
        guru_id: userEmployeeId || '',
        jenis_ujian: '',
        jumlah_soal: 20, alokasi_waktu_menit: 60, kompetensi_dasar: '',
        level_kognitif: '', distribusi_bobot: {}, status: true,
      })
      fetchOptions(null, null)
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.judul_kisi?.trim()) {
      showNotification('Judul Kisi-kisi Ujian wajib diisi.', 'error')
      return
    }
    if (!formData.mata_pelajaran_id) {
      showNotification('Mata Pelajaran wajib dipilih.', 'error')
      return
    }
    if (!formData.jenis_ujian) {
      showNotification('Jenis Ujian wajib dipilih.', 'error')
      return
    }
    const { pg = 0, isian = 0, esai = 0 } = formData.distribusi_bobot || {}
    const totalBobot = pg + isian + esai
    if (totalBobot > 0 && totalBobot !== 100) { setDistribusiError(`Total bobot harus 100%. Saat ini: ${totalBobot}%`); return }
    try {
      const payload = {
        ...formData,
        guru_id: (!isAdminOrKurikulum && userEmployeeId) ? userEmployeeId : formData.guru_id,
      }
      if (editingItem) { await lmsKisiKisiService.update(editingItem.id, payload); showNotification('Kisi-kisi Ujian berhasil diperbarui.') }
      else { await lmsKisiKisiService.create(payload); showNotification('Kisi-kisi Ujian berhasil dibuat.') }
      setShowModal(false); fetchData(pagination.currentPage); fetchStats()
    } catch (err) { showNotification(err?.response?.data?.message || 'Gagal menyimpan kisi-kisi ujian.', 'error') }
  }

  const handleDelete = (id, item) => {
    setDeleteModal({ isOpen: true, id, item, isSubmitting: false })
  }

  const confirmDelete = async () => {
    if (!deleteModal.id) return
    setDeleteModal((prev) => ({ ...prev, isSubmitting: true }))
    try {
      await lmsKisiKisiService.delete(deleteModal.id)
      showNotification('Kisi-kisi Ujian berhasil dihapus.')
      fetchData(pagination.currentPage)
      fetchStats()
    } catch (err) {
      showNotification('Gagal menghapus kisi-kisi.', 'error')
    } finally {
      setDeleteModal({ isOpen: false, id: null, item: null, isSubmitting: false })
    }
  }

  const handleDuplicate = async (id) => {
    try { await lmsKisiKisiService.duplicate(id); showNotification('Kisi-kisi Ujian berhasil diduplikasi.'); fetchData(pagination.currentPage); fetchStats() }
    catch (err) { showNotification('Gagal menduplikasi.', 'error') }
  }

  const handleExportCSV = () => {
    if (!dataList.length) return
    const headers = ['Judul Kisi-kisi', 'Mapel', 'Jenis Ujian', 'Jumlah Soal', 'Soal Tersedia', 'Status']
    const rows = dataList.map((i) => [`"${(i.judul_kisi || '').replace(/"/g, '""')}"`, `"${(i.mata_pelajaran?.name || '').replace(/"/g, '""')}"`, i.jenis_ujian || '-', i.jumlah_soal || 0, i.bank_soal_count ?? 0, i.status ? 'Aktif' : 'Nonaktif'])
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const link = document.createElement('a'); link.href = encodeURI(csv); link.download = `kisi_kisi_ujian_${new Date().toISOString().slice(0, 10)}.csv`; document.body.appendChild(link); link.click(); document.body.removeChild(link)
  }

  const resetFilters = () => {
    if (canSelectUnit) setSelectedUnit('')
    setSearchInput('')
    setFilters({ search: '', mata_pelajaran_id: '', jenis_ujian: '', status: '', kelas_id: '', semester_id: '' })
    fetchData(1)
  }
  const hasActiveFilter = Boolean((canSelectUnit && selectedUnit) || filters.search || filters.mata_pelajaran_id || filters.jenis_ujian || filters.status || filters.kelas_id || filters.semester_id || searchInput)

  const dropdownCls = 'h-9 rounded-xl border border-emerald-200/90 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800/80 dark:bg-[#111827] dark:text-slate-100 transition-all'
  const inputCls = 'w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-600 outline-none transition'
  const labelCls = 'block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5'

  return (
    <PageContainer maxW="7xl">
      {/* Breadcrumb Terpadu */}
      {!embedded && (
        <div className="mb-4">
          <AppBreadcrumb
            items={[
              { label: 'LMS', href: '/dashboard/lms' },
              { label: 'Kisi-kisi Ujian', href: '/dashboard/lms/kisi-kisi' },
            ]}
            pageTitle="Kisi-kisi Ujian"
          />
        </div>
      )}

      <div className="lms-kisi-kisi-page space-y-6 pb-12">
        {/* Modern Hero Header Card (Vivid Emerald Spec) */}
        {!embedded && !hidePageHeader && (
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-4 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
            <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-transparent blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-teal-500/30 via-emerald-400/20 to-transparent blur-3xl" />

            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
                <div className="flex size-11 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                  <FileText className="size-5 sm:size-7 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-0.5 sm:px-3.5 sm:py-1 text-[11px] sm:text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                      <Sparkles className="size-3 text-amber-300 animate-pulse" />
                      Evaluasi &amp; Penilaian LMS
                    </span>
                  </div>
                  <h1 className="mt-1.5 text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Kisi-kisi Ujian (Exam Blueprint)
                  </h1>
                  <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 w-full leading-relaxed">
                    Cetak biru penyelarasan CP, TP, dan Taksonomi Bloom — fondasi utama sebelum menyusun bank soal dan asesmen CBT.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300/80 bg-emerald-50/80 px-3 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-extrabold text-emerald-800 shadow-xs dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
                  Cetak Biru Asesmen
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Modern Multi-Tone KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <ModernKpiCard
            icon={FileText}
            label="Total Kisi-kisi"
            value={stats.total}
            tag="Semua"
            subtext={`${stats.aktif} Status Aktif`}
            tone="emerald"
            active={filters.jenis_ujian === '' && filters.status === ''}
            onClick={() => setFilters((p) => ({ ...p, jenis_ujian: '', status: '' }))}
          />
          <ModernKpiCard
            icon={Target}
            label="Target Butir Soal"
            value={stats.total_soal_target}
            tag="Target Soal"
            subtext="Soal direncanakan"
            tone="blue"
            onClick={() => setFilters((p) => ({ ...p, jenis_ujian: '', status: '' }))}
          />
          <ModernKpiCard
            icon={BookOpen}
            label={`Kisi-kisi ${getJenisLabel('UH')}`}
            value={stats.uh}
            tag="Ulangan Harian"
            subtext={getJenisFullName('UH')}
            tone="purple"
            active={filters.jenis_ujian === 'UH'}
            onClick={() => setFilters((p) => ({ ...p, jenis_ujian: 'UH' }))}
          />
          <ModernKpiCard
            icon={Award}
            label={`${getJenisLabel('PTS')} & ${getJenisLabel('PAS')}`}
            value={(stats.pts || 0) + (stats.pas || 0)}
            tag="Ujian Semester"
            subtext="Asesmen Berkala"
            tone="amber"
            active={filters.jenis_ujian === 'PTS'}
            onClick={() => setFilters((p) => ({ ...p, jenis_ujian: 'PTS' }))}
          />
        </div>

        {/* Tab Nav (if provided) */}
        {tabNav && <div>{typeof tabNav === 'function' ? tabNav() : tabNav}</div>}

        {/* Master Datatable Panel (Canonical Emerald Datatable Container) */}
        <section
          className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]"
          aria-labelledby="kisikisi-table-title"
        >
          {/* Toolbar Baris 1: Header Judul & 4 Tombol Soft Squircle Action */}
          <div className="border-b border-emerald-200/90 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-4 py-3.5 sm:px-6 md:px-8 dark:border-emerald-800/60">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                  <h2 id="kisikisi-table-title" className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    Daftar Kisi-kisi Ujian
                  </h2>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                    {pagination.total} Total
                  </span>
                </div>
                <p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                  Indikator kelengkapan butir soal aktual vs target ditampilkan di setiap baris.
                </p>
              </div>

              {/* 4 Soft Squircle Action Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2 self-start sm:self-auto flex-wrap">
                <SquircleActionButton
                  variant="import"
                  label="Import"
                  onClick={() => setImportOpen(true)}
                />
                <SquircleActionButton
                  variant="export"
                  label="Export"
                  onClick={handleExportCSV}
                />
                <SquircleActionButton
                  variant="view"
                  label="Cetak"
                  icon={Printer}
                  onClick={() => setIsPrintModalOpen(true)}
                />
                <SquircleActionButton
                  variant="primary"
                  label="Buat Kisi-kisi Baru"
                  onClick={() => handleOpenModal()}
                />
              </div>
            </div>
          </div>

          {/* Toolbar Baris 2: Search Input dengan Debounce */}
          <div className="p-3 sm:p-4 border-b border-emerald-200/80 bg-white/70 dark:border-emerald-800/60 dark:bg-[#1B2433]">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari judul kisi-kisi, indikator CP/TP, KD, atau level kognitif..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-emerald-200/90 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/20 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Toolbar Baris 3: Horizontal Filters & Reset Button */}
          <div className="px-3 sm:px-4 py-2.5 border-b border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/40 flex flex-wrap items-center gap-2">
            {/* Unit Dropdown (Divisi Pendidikan / Global) atau Locked Unit Badge */}
            {canSelectUnit ? (
              <HeroUiFilterSelect
                value={selectedUnit}
                onChange={(val) => setSelectedUnit(val)}
                placeholder={`Semua Unit (${options.units?.length || 'SIT'})`}
                icon={School}
                popoverWidth="min-w-[220px]"
                searchable={options.units?.length > 5}
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

            <HeroUiFilterSelect
              value={filters.mata_pelajaran_id}
              onChange={(val) => setFilters((p) => ({ ...p, mata_pelajaran_id: val }))}
              placeholder="Semua Mata Pelajaran"
              icon={BookOpen}
              popoverWidth="min-w-[240px]"
              searchable
              options={[
                { value: '', label: 'Semua Mata Pelajaran' },
                ...options.subjects.map((s) => ({ value: s.id, label: getSubjectLabel(s) })),
              ]}
            />

            <HeroUiFilterSelect
              value={filters.jenis_ujian}
              onChange={(val) => setFilters((p) => ({ ...p, jenis_ujian: val }))}
              placeholder="Semua Jenis Ujian"
              icon={Target}
              popoverWidth="min-w-[220px]"
              options={[
                { value: '', label: 'Semua Jenis Ujian' },
                ...(options.jenis_ujian_options.length > 0
                  ? options.jenis_ujian_options.map((j) => ({ value: j.id, label: getJenisFullName(j.id) || j.nama }))
                  : [
                      { value: 'UH', label: getJenisFullName('UH') },
                      { value: 'PTS', label: getJenisFullName('PTS') },
                      { value: 'PAS', label: getJenisFullName('PAS') },
                      { value: 'CBT', label: getJenisFullName('CBT') },
                      { value: 'Remedial', label: getJenisFullName('Remedial') },
                    ]),
              ]}
            />

            <HeroUiFilterSelect
              value={filters.kelas_id}
              onChange={(val) => setFilters((p) => ({ ...p, kelas_id: val }))}
              placeholder="Semua Kelas"
              icon={Layers}
              popoverWidth="min-w-[170px]"
              options={[
                { value: '', label: 'Semua Kelas' },
                ...options.kelas.map((k) => ({ value: k.id, label: k.nama_kelas || k.tingkat || k.nama })),
              ]}
            />

            <HeroUiFilterSelect
              value={filters.semester_id}
              onChange={(val) => setFilters((p) => ({ ...p, semester_id: val }))}
              placeholder="Semua Semester"
              popoverWidth="min-w-[160px]"
              options={[
                { value: '', label: 'Semua Semester' },
                ...options.semesters.map((s) => ({ value: s.id, label: s.name || s.nama || s.nama_semester })),
              ]}
            />

            <HeroUiFilterSelect
              value={filters.status}
              onChange={(val) => setFilters((p) => ({ ...p, status: val }))}
              placeholder="Semua Status"
              popoverWidth="min-w-[150px]"
              options={[
                { value: '', label: 'Semua Status' },
                { value: '1', label: 'Aktif' },
                { value: '0', label: 'Nonaktif' },
              ]}
            />

            {hasActiveFilter && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ml-auto"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Filter</span>
              </button>
            )}
          </div>

          {/* Datatable Body */}
          <MasterDataTable className="!rounded-none !border-0 !shadow-none">
            <div className="overflow-x-auto min-h-[340px]">
              <TableRoot className="w-full text-left text-sm">
                <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <TableRow>
                    <TableHead className="px-5 py-3.5 whitespace-nowrap">Judul &amp; Mata Pelajaran</TableHead>
                    <TableHead className="px-5 py-3.5 whitespace-nowrap">Capaian (CP / TP)</TableHead>
                    <TableHead className="px-5 py-3.5 whitespace-nowrap">Jenis &amp; Kognitif</TableHead>
                    <TableHead className="px-5 py-3.5 whitespace-nowrap">Soal / Durasi</TableHead>
                    <TableHead className="px-5 py-3.5 whitespace-nowrap">Kelengkapan Soal</TableHead>
                    <TableHead className="px-5 py-3.5 whitespace-nowrap">Status</TableHead>
                    <TableHead className="px-5 py-3.5 text-right whitespace-nowrap">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-sm">
                  {loading ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-14 text-slate-400">
                      <div className="flex flex-col items-center gap-2"><RefreshCw className="w-6 h-6 animate-spin text-emerald-600" /><span className="text-xs">Memuat data kisi-kisi...</span></div>
                    </TableCell></TableRow>
                  ) : dataList.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-14 text-slate-400">
                      <div className="flex flex-col items-center gap-2"><FileText className="w-10 h-10 text-slate-200 dark:text-slate-700" /><span className="text-xs font-medium">Belum ada kisi-kisi ujian ditemukan.</span></div>
                    </TableCell></TableRow>
                  ) : dataList.map((item) => {
                    const bankCount = item.bank_soal_count ?? 0
                    const ujianCount = item.ujian_count ?? 0
                    return (
                      <TableRow key={item.id} className="group hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors cursor-pointer"
                        onClick={(e) => { if (e.target.closest('button, a, [data-no-rowclick]')) return; setRowDetailItem(item); setShowRowDetailModal(true) }}>
                        <TableCell className="px-5 py-4">
                          <div className="font-semibold text-slate-800 dark:text-white leading-snug">{item.judul_kisi}</div>
                          <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">{item.mata_pelajaran?.name || 'Mata Pelajaran N/A'}</div>
                          {(item.kelas || item.semester) && (
                            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                              {item.kelas && <span>{item.kelas.nama_kelas || item.kelas.tingkat}</span>}
                              {item.kelas && item.semester && <span>·</span>}
                              {item.semester && <span>{item.semester.nama_semester || item.semester.name}</span>}
                            </div>
                          )}
                          {ujianCount > 0 && (
                            <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
                              <ShieldAlert className="w-2.5 h-2.5 text-amber-500" />
                              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">Dipakai di {ujianCount} ujian</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="px-5 py-4 max-w-[180px]">
                          {item.cp ? (
                            <div className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-md text-[11px] font-medium mb-1 border border-emerald-100 dark:border-emerald-800">
                              {item.cp.kode_cp ? `CP: ${item.cp.kode_cp}` : item.cp.nama_cp}
                            </div>
                          ) : <div className="text-[11px] text-slate-400 italic">CP belum ditentukan</div>}
                          {item.tp && <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">TP: {item.tp.kode_tp || item.tp.nama_tp}</div>}
                        </TableCell>
                        <TableCell className="px-5 py-4 whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getJenisBadgeColor(item.jenis_ujian)}`}>
                            {getJenisLabel(item.jenis_ujian)}
                          </span>
                          {item.level_kognitif && (
                            <div className="text-[10px] text-slate-400 mt-1">
                              {getKognitifLabel(item.level_kognitif)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="px-5 py-4 whitespace-nowrap">
                          <div className="font-bold text-slate-800 dark:text-white text-sm">{item.jumlah_soal} Soal</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /><span>{item.alokasi_waktu_menit} Menit</span></div>
                        </TableCell>
                        <TableCell className="px-5 py-4 min-w-[140px]">
                          <SoalProgressBar current={bankCount} target={item.jumlah_soal || 0} />
                          {bankCount < (item.jumlah_soal || 0) && (
                            <button
                              type="button"
                              data-no-rowclick
                              onClick={(e) => { e.stopPropagation(); handleGoToBankSoal(item) }}
                              className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer">
                              <Plus className="w-3 h-3" />Tambah Soal<ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </TableCell>
                        <TableCell className="px-5 py-4 whitespace-nowrap">
                          {item.status
                            ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-full text-xs font-medium"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Aktif</span>
                            : <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 rounded-full text-xs font-medium"><span className="w-1.5 h-1.5 rounded-full bg-slate-400" />Nonaktif</span>
                          }
                        </TableCell>
                        <TableCell className="px-5 py-4 text-right">
                          <ActionDropdown
                            onView={() => { setViewingItem(item); setShowRowDetailModal(true); setRowDetailItem(item) }}
                            onEdit={() => handleOpenModal(item)}
                            onDelete={() => handleDelete(item.id, item)}
                            extraItems={[
                              { label: 'Duplikasi Kisi-kisi', icon: <Copy className="size-4 text-emerald-500" />, onClick: () => handleDuplicate(item.id) },
                              { label: 'Buat Soal dari Kisi ini', icon: <ChevronRight className="size-4 text-blue-500" />, onClick: () => handleGoToBankSoal(item) },
                            ]} />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </TableRoot>
            </div>

            {/* Modern Emerald Squircle Pagination Footer */}
            <div className="px-5 py-4 border-t border-emerald-100/60 dark:border-emerald-900/30 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-emerald-950/30 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Halaman <strong className="text-slate-800 dark:text-slate-200">{pagination.currentPage}</strong> dari <strong className="text-slate-800 dark:text-slate-200">{pagination.lastPage}</strong> ({pagination.total} Data Total)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pagination.currentPage <= 1}
                  onClick={() => fetchData(pagination.currentPage - 1)}
                  title="Halaman Sebelumnya"
                  aria-label="Halaman Sebelumnya"
                  className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all duration-150 active:scale-95 disabled:bg-emerald-600/30 disabled:text-white/40 disabled:pointer-events-none dark:bg-emerald-600 dark:hover:bg-emerald-500 cursor-pointer"
                >
                  <ChevronLeft className="size-4 shrink-0 text-white" />
                </button>
                <span className="px-2.5 py-1 text-xs font-black text-slate-700 dark:text-slate-300">
                  {pagination.currentPage} / {pagination.lastPage}
                </span>
                <button
                  type="button"
                  disabled={pagination.currentPage >= pagination.lastPage}
                  onClick={() => fetchData(pagination.currentPage + 1)}
                  title="Halaman Berikutnya"
                  aria-label="Halaman Berikutnya"
                  className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all duration-150 active:scale-95 disabled:bg-emerald-600/30 disabled:text-white/40 disabled:pointer-events-none dark:bg-emerald-600 dark:hover:bg-emerald-500 cursor-pointer"
                >
                  <ChevronRight className="size-4 shrink-0 text-white" />
                </button>
              </div>
            </div>
          </MasterDataTable>
        </section>

          {/* Row Detail Modal */}
          {showRowDetailModal && rowDetailItem && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowRowDetailModal(false)}>
              <div className="bg-white dark:bg-[#1B2433] rounded-[24px] w-full max-w-lg shadow-2xl shadow-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-700/80 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
                <div className="flex items-start justify-between px-6 py-4 border-b border-emerald-100/60 dark:border-slate-700 bg-gradient-to-r from-emerald-50/60 via-teal-50/30 to-transparent dark:from-emerald-950/30">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 shrink-0 mt-0.5"><FileText className="w-5 h-5 text-white" /></div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{rowDetailItem.judul_kisi}</h2>
                      <p className="text-xs text-slate-500 mt-0.5">{rowDetailItem.mata_pelajaran?.name || '-'} · {rowDetailItem.jenis_ujian || '-'}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowRowDetailModal(false)} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getJenisBadgeColor(rowDetailItem.jenis_ujian)}`}>
                      {getJenisFullName(rowDetailItem.jenis_ujian)}
                    </span>
                    {rowDetailItem.status
                      ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Aktif</span>
                      : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200"><span className="w-1.5 h-1.5 rounded-full bg-slate-400" />Nonaktif</span>
                    }
                    {(rowDetailItem.ujian_count || 0) > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><ShieldAlert className="w-3 h-3" />Dipakai di {rowDetailItem.ujian_count} ujian</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-3"><p className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">Target Soal</p><p className="text-sm font-bold text-purple-700 dark:text-purple-400 mt-0.5">{rowDetailItem.jumlah_soal} Soal</p></div>
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3"><p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Soal Tersedia</p><p className="text-sm font-bold text-blue-700 dark:text-blue-400 mt-0.5">{rowDetailItem.bank_soal_count ?? 0} Soal</p></div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3"><p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Waktu</p><p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">{rowDetailItem.alokasi_waktu_menit} Menit</p></div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3"><p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Level Kognitif</p><p className="text-xs font-semibold text-slate-800 dark:text-white mt-0.5">{getKognitifLabel(rowDetailItem.level_kognitif) || '-'}</p></div>
                  </div>
                  <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900">
                    <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-2">Kelengkapan Bank Soal</p>
                    <SoalProgressBar current={rowDetailItem.bank_soal_count ?? 0} target={rowDetailItem.jumlah_soal || 0} />
                  </div>
                  {rowDetailItem.distribusi_bobot && (
                    <div className="rounded-xl p-3 border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Distribusi Bobot Soal</p>
                      <div className="flex items-center gap-4">
                        {Object.entries(rowDetailItem.distribusi_bobot).map(([k, v]) => (
                          <div key={k} className="text-center"><p className="text-[10px] text-slate-400 uppercase">{k}</p><p className="text-sm font-bold text-slate-700 dark:text-slate-200">{v}%</p></div>
                        ))}
                      </div>
                    </div>
                  )}
                  {rowDetailItem.cp && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-3 border border-emerald-100 dark:border-emerald-800">
                      <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">Capaian Pembelajaran (CP)</p>
                      <p className="text-xs text-slate-700 dark:text-slate-300">{rowDetailItem.cp.kode_cp ? `[${rowDetailItem.cp.kode_cp}] ` : ''}{rowDetailItem.cp.nama_cp}</p>
                    </div>
                  )}
                  {rowDetailItem.tp && (
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3 border border-blue-100 dark:border-blue-800">
                      <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider mb-1">Tujuan Pembelajaran (TP)</p>
                      <p className="text-xs text-slate-700 dark:text-slate-300">{rowDetailItem.tp.kode_tp ? `[${rowDetailItem.tp.kode_tp}] ` : ''}{rowDetailItem.tp.nama_tp || rowDetailItem.tp.deskripsi}</p>
                    </div>
                  )}
                  {rowDetailItem.kompetensi_dasar && (
                    <div><p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Indikator / KD</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">{rowDetailItem.kompetensi_dasar}</p>
                    </div>
                  )}
                </div>
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
                  <button onClick={() => setShowRowDetailModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Tutup</button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowRowDetailModal(false); handleGoToBankSoal(rowDetailItem) }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer">
                      <Plus className="w-3.5 h-3.5" />Buat Soal
                    </button>
                    <button onClick={() => { setShowRowDetailModal(false); handleDelete(rowDetailItem.id, rowDetailItem) }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-semibold hover:bg-rose-100 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />Hapus
                    </button>
                    <button onClick={() => { setShowRowDetailModal(false); handleOpenModal(rowDetailItem) }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0E5C44] text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm">
                      <Edit3 className="w-3.5 h-3.5" />Edit Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Create/Edit Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
              <div className="relative w-full max-w-2xl bg-white dark:bg-[#1B2433] rounded-[24px] shadow-2xl shadow-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-700/80 overflow-hidden my-8">
                <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
                <div className="flex items-center justify-between px-6 py-5 border-b border-emerald-100/60 dark:border-slate-700 bg-gradient-to-r from-emerald-50/60 via-teal-50/30 to-transparent dark:from-emerald-950/30">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                      <FileText className="size-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                        {editingItem ? 'Edit Kisi-kisi Ujian' : 'Buat Kisi-kisi Ujian Baru'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {editingItem ? 'Perbarui rincian capaian pembelajaran & sebaran soal' : 'Definisikan kisi-kisi dan distribusi bobot soal ujian'}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition cursor-pointer">
                    <X className="size-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                  <div><label className={labelCls}>Judul Kisi-kisi Ujian *</label>
                    <input type="text" required placeholder="Contoh: Kisi-kisi PTS Gasal Matematika Kelas 8" value={formData.judul_kisi} onChange={(e) => setFormData({ ...formData, judul_kisi: e.target.value })} className={inputCls} /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <HeroUiModalSelect
                      label="Mata Pelajaran"
                      required
                      value={formData.mata_pelajaran_id}
                      onChange={(val) => handleMataPelajaranChange(val)}
                      placeholder="-- Pilih Mata Pelajaran --"
                      icon={BookOpen}
                      searchable
                      options={options.subjects.map((s) => ({ value: s.id, label: getSubjectLabel(s) }))}
                    />
                    <HeroUiModalSelect
                      label="Jenis Ujian"
                      required
                      value={formData.jenis_ujian}
                      onChange={(val) => setFormData((p) => ({ ...p, jenis_ujian: val }))}
                      placeholder="-- Pilih Jenis Ujian --"
                      icon={Target}
                      options={
                        options.jenis_ujian_options.length > 0
                          ? options.jenis_ujian_options.map((j) => ({ value: j.id, label: getJenisFullName(j.id) || j.nama }))
                          : [
                              { value: 'UH', label: getJenisFullName('UH') },
                              { value: 'PTS', label: getJenisFullName('PTS') },
                              { value: 'PAS', label: getJenisFullName('PAS') },
                              { value: 'CBT', label: getJenisFullName('CBT') },
                              { value: 'Remedial', label: getJenisFullName('Remedial') },
                            ]
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <HeroUiModalSelect
                        label="Capaian Pembelajaran (CP)"
                        value={formData.cp_id}
                        disabled={!formData.mata_pelajaran_id}
                        onChange={(val) => handleCpChange(val)}
                        placeholder={
                          !formData.mata_pelajaran_id
                            ? 'Pilih mapel terlebih dahulu'
                            : loadingOptions
                            ? 'Memuat CP...'
                            : options.capaian_pembelajaran.length > 0
                            ? '-- Pilih CP (Opsional) --'
                            : 'Belum ada master CP untuk mapel ini'
                        }
                        icon={Layers}
                        searchable
                        options={options.capaian_pembelajaran.map((cp) => ({
                          value: cp.id,
                          label: cp.label || (cp.kode_cp ? `[${cp.kode_cp}] ${cp.nama_cp}` : cp.nama_cp),
                        }))}
                      />
                      {formData.mata_pelajaran_id && options.capaian_pembelajaran.length === 0 && !loadingOptions && (
                        <p className="mt-1 text-[10px] text-amber-600 dark:text-amber-400">Master CP belum tersedia untuk mapel ini. Anda dapat langsung mengisikan indikator kompetensi pada kolom uraian di bawah.</p>
                      )}
                    </div>
                    <div>
                      <HeroUiModalSelect
                        label="Tujuan Pembelajaran (TP)"
                        value={formData.tp_id}
                        disabled={!formData.cp_id}
                        onChange={(val) => setFormData((p) => ({ ...p, tp_id: val }))}
                        placeholder={
                          !formData.cp_id
                            ? 'Pilih CP terlebih dahulu'
                            : loadingOptions
                            ? 'Memuat TP...'
                            : options.tujuan_pembelajaran.length > 0
                            ? '-- Pilih TP (Opsional) --'
                            : 'Belum ada TP untuk CP ini (Opsional)'
                        }
                        icon={CheckSquare}
                        searchable
                        options={options.tujuan_pembelajaran.map((tp) => ({
                          value: tp.id,
                          label: tp.label || (tp.kode_tp ? `[${tp.kode_tp}] ${tp.nama_tp}` : tp.nama_tp),
                        }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <HeroUiModalSelect
                      label="Kelas"
                      value={formData.kelas_id}
                      onChange={(val) => setFormData((p) => ({ ...p, kelas_id: val }))}
                      placeholder="-- Pilih Kelas --"
                      options={options.kelas.map((k) => ({
                        value: k.id,
                        label: k.nama_kelas || k.tingkat || k.nama,
                      }))}
                    />
                    <HeroUiModalSelect
                      label="Semester"
                      value={formData.semester_id}
                      onChange={(val) => setFormData((p) => ({ ...p, semester_id: val }))}
                      placeholder="-- Pilih Semester --"
                      options={options.semesters.map((s) => ({
                        value: s.id,
                        label: s.name || s.nama || s.nama_semester,
                      }))}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className={labelCls}>Jumlah Soal Target *</label>
                      <input type="number" required min="1" value={formData.jumlah_soal} onChange={(e) => setFormData({ ...formData, jumlah_soal: parseInt(e.target.value) || 0 })} className={inputCls} /></div>
                    <div><label className={labelCls}>Alokasi Waktu (Menit) *</label>
                      <input type="number" required min="5" value={formData.alokasi_waktu_menit} onChange={(e) => setFormData({ ...formData, alokasi_waktu_menit: parseInt(e.target.value) || 0 })} className={inputCls} /></div>
                  </div>
                  <HeroUiModalSelect
                    label="Level Kognitif Bloom"
                    value={formData.level_kognitif}
                    onChange={(val) => setFormData((p) => ({ ...p, level_kognitif: val }))}
                    placeholder="-- Pilih Level Kognitif --"
                    options={options.level_kognitif_options.map((l) => ({
                      value: l.id,
                      label: getKognitifLabel(l.nama || l.id) || l.nama,
                    }))}
                  />
                  <div>
                    <label className={labelCls}>Distribusi Bobot Soal <span className="text-slate-400 font-normal normal-case">(Total harus = 100%)</span></label>
                    <div className="grid grid-cols-3 gap-3">
                      {[{ key: 'pg', label: 'Pilihan Ganda (%)' }, { key: 'isian', label: 'Isian (%)' }, { key: 'esai', label: 'Esai (%)' }].map(({ key, label }) => (
                        <div key={key}>
                          <label className="block text-[10px] font-semibold text-slate-400 mb-1">{label}</label>
                          <input type="number" min="0" max="100" value={formData.distribusi_bobot?.[key] ?? 0} onChange={(e) => handleDistribusiChange(key, e.target.value)}
                            className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl text-sm text-center font-semibold outline-none focus:ring-2 transition ${distribusiError ? 'border-rose-300 focus:ring-rose-400/30' : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500/40 focus:border-emerald-600'}`} />
                        </div>
                      ))}
                    </div>
                    {distribusiError
                      ? <div className="mt-2 flex items-center gap-1.5 text-rose-600 dark:text-rose-400"><AlertTriangle className="w-3.5 h-3.5" /><p className="text-xs font-medium">{distribusiError}</p></div>
                      : (() => { const tot = (formData.distribusi_bobot?.pg || 0) + (formData.distribusi_bobot?.isian || 0) + (formData.distribusi_bobot?.esai || 0); return tot > 0 ? <p className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">✓ Total: {tot}% {tot === 100 ? '— Valid' : ''}</p> : <p className="mt-1 text-[10px] text-slate-400">Kosongkan jika tidak ingin mengatur distribusi bobot</p> })()}
                  </div>
                  <div>
                    {isAdminOrKurikulum ? (
                      <HeroUiModalSelect
                        label="Guru Penyusun"
                        value={formData.guru_id}
                        onChange={(val) => setFormData((p) => ({ ...p, guru_id: val }))}
                        placeholder="-- Pilih Guru --"
                        searchable
                        options={options.guru.map((g) => ({
                          value: g.id,
                          label: `${g.nama_lengkap || g.name || g.nama}${String(g.id) === String(userEmployeeId) ? ' (Anda)' : ''}`,
                        }))}
                      />
                    ) : (
                      <div>
                        <label className={labelCls}>Guru Penyusun</label>
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span className="truncate">{currentTeacherName} (Akun Anda)</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div><label className={labelCls}>Uraian Indikator / Kompetensi Dasar</label>
                    <textarea rows="3" placeholder="Tuliskan materi pokok atau indikator pencapaian..." value={formData.kompetensi_dasar} onChange={(e) => setFormData({ ...formData, kompetensi_dasar: e.target.value })} className={`${inputCls} resize-none`} /></div>
                  <div className="flex items-center gap-3 pt-1">
                    <label className={labelCls + ' mb-0'}>Status</label>
                    <button type="button" onClick={() => setFormData((p) => ({ ...p, status: !p.status }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.status ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${formData.status ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className={`text-xs font-semibold ${formData.status ? 'text-emerald-600' : 'text-slate-400'}`}>{formData.status ? 'Aktif' : 'Nonaktif'}</span>
                  </div>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                    <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl hover:bg-slate-200 transition">Batal</button>
                    <button type="submit" disabled={!!distribusiError} className="px-5 py-2.5 bg-[#0E5C44] text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed">
                      {editingItem ? 'Simpan Perubahan' : 'Buat Kisi-kisi'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <PrintOptionModal isOpen={isPrintModalOpen} onClose={() => setIsPrintModalOpen(false)}
            title="Opsi Cetak Data Kisi-kisi Ujian" subtitle="Pilih metode pencetakan atau unduh cetak biru kisi-kisi"
            onPrintClean={() => { printCleanTable({ title: 'Laporan Kisi-kisi Ujian', data: dataList, columns: [{ header: 'Judul', accessor: (r) => r.judul_kisi || '-' }, { header: 'Mapel', accessor: (r) => getSubjectLabel(r.mata_pelajaran) }, { header: 'Jenis Ujian', accessor: (r) => r.jenis_ujian || '-' }, { header: 'Target Soal', accessor: (r) => r.jumlah_soal || 0 }, { header: 'Soal Tersedia', accessor: (r) => r.bank_soal_count ?? 0 }, { header: 'Status', accessor: (r) => r.status ? 'Aktif' : 'Nonaktif' }] }); setIsPrintModalOpen(false) }}
            onDownloadPdf={() => { downloadPdfTable({ title: 'Laporan Kisi-kisi Ujian', data: dataList, columns: [{ header: 'Judul', accessor: (r) => r.judul_kisi || '-' }, { header: 'Mapel', accessor: (r) => getSubjectLabel(r.mata_pelajaran) }, { header: 'Jenis Ujian', accessor: (r) => r.jenis_ujian || '-' }, { header: 'Target Soal', accessor: (r) => r.jumlah_soal || 0 }, { header: 'Soal Tersedia', accessor: (r) => r.bank_soal_count ?? 0 }, { header: 'Status', accessor: (r) => r.status ? 'Aktif' : 'Nonaktif' }], filename: `laporan_kisi_kisi_ujian_${new Date().toISOString().slice(0, 10)}.pdf` }); setIsPrintModalOpen(false) }} />
          <CsvImportModal isOpen={importOpen} onClose={() => setImportOpen(false)} title="Import Data Kisi-kisi Ujian" onImport={(file) => showNotification(`File ${file.name} berhasil diproses.`)} templateFields={['judul_kisi', 'mata_pelajaran_id', 'jenis_ujian', 'jumlah_soal', 'alokasi_waktu_menit', 'status']} />

          <HarmonizedDeleteModal
            isOpen={deleteModal.isOpen}
            onClose={() => setDeleteModal({ isOpen: false, id: null, item: null, isSubmitting: false })}
            onConfirm={confirmDelete}
            item={deleteModal.item}
            isSubmitting={deleteModal.isSubmitting}
          />
      </div>
    </PageContainer>
  )
}
