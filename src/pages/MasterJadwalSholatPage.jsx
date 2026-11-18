import { useToast } from '../components/app/ToastProvider'
import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Compass,
  Play,
  Save,
  Database,
  RefreshCw,
  Search,
  Trash2,
  Copy,
  Check,
  MapPin,
  Calendar,
  Clock,
  Layers,
  FileCode,
  Globe,
  Sparkles,
  Server,
  Download,
  AlertTriangle,
  X,
  Printer,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Filter,
  Info,
} from 'lucide-react'
import { equranService } from '../services/equranService'
import ActionDropdown from '../components/app/ActionDropdown'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { useDebounce } from '../hooks/useDebounce'
import { Pagination } from '../components/ui/pagination'
import { printCleanTable, resolveFoundationName } from '../utils/printHelper'
import { usePengaturanStore } from '../stores/pengaturanStore'
import { useAuthStore } from '../stores/authStore'
import { getUserRoleLevel, ROLE_LEVELS } from '../auth/portalResolver'
import {
  SquircleActionButton,
  MasterDataPage,
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
            ? 'border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-800/60 cursor-not-allowed'
            : isOpen
              ? 'border-[#0E5C44] bg-white ring-2 ring-[#0E5C44]/15 dark:border-[#3FBF75] dark:bg-[#111827] dark:ring-[#3FBF75]/20 text-slate-900 dark:text-white shadow-xs'
              : value !== '' && value !== undefined && value !== null && value !== 'all'
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
                          : 'text-slate-700 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800/60'
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

// ── HEROUI MODAL/FORM SELECT DROPDOWN COMPONENT ──
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
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
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
        className={`w-full flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-medium transition-all duration-200 text-left cursor-pointer ${disabled
            ? 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed'
            : isOpen
              ? 'border-[#0E5C44] bg-white ring-2 ring-[#0E5C44]/15 dark:border-[#3FBF75] dark:bg-slate-900 dark:ring-[#3FBF75]/20 text-slate-800 dark:text-slate-100 shadow-xs'
              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 text-slate-800 dark:text-slate-100'
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
            className="absolute left-0 right-0 top-full mt-1.5 z-[95] overflow-hidden rounded-xl border border-slate-200/90 bg-white/95 backdrop-blur-md shadow-2xl dark:border-slate-700/80 dark:bg-[#182232]/95"
          >
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
                          : 'text-slate-700 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800/60'
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

const MODERN_CARD_TONES = {
  emerald: {
    card: 'border-emerald-300/80 bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white hover:border-emerald-400 hover:shadow-emerald-500/10 dark:border-emerald-700/60 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-[#1B2433]',
    badgeBg: 'bg-emerald-500/10 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-500/30',
    iconGradient: 'from-emerald-500 via-emerald-600 to-teal-700 shadow-emerald-500/25',
    glow: 'bg-emerald-500/20 group-hover:bg-emerald-500/30',
    title: 'text-emerald-800 dark:text-emerald-300',
    value: 'text-emerald-950 dark:text-emerald-100',
    subtext: 'text-emerald-700/80 dark:text-emerald-400/80',
    cta: 'text-emerald-600 dark:text-emerald-400',
  },
  blue: {
    card: 'border-sky-300/80 bg-gradient-to-br from-sky-50/70 via-blue-50/40 to-white hover:border-sky-400 hover:shadow-sky-500/10 dark:border-sky-700/60 dark:from-sky-950/40 dark:via-blue-950/20 dark:to-[#1B2433]',
    badgeBg: 'bg-sky-500/10 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 border-sky-500/30',
    iconGradient: 'from-sky-500 via-blue-600 to-indigo-700 shadow-sky-500/25',
    glow: 'bg-sky-500/20 group-hover:bg-sky-500/30',
    title: 'text-sky-800 dark:text-sky-300',
    value: 'text-sky-950 dark:text-sky-100',
    subtext: 'text-sky-700/80 dark:text-sky-400/80',
    cta: 'text-sky-600 dark:text-sky-400',
  },
  purple: {
    card: 'border-purple-300/80 bg-gradient-to-br from-purple-50/70 via-violet-50/40 to-white hover:border-purple-400 hover:shadow-purple-500/10 dark:border-purple-700/60 dark:from-purple-950/40 dark:via-violet-950/20 dark:to-[#1B2433]',
    badgeBg: 'bg-purple-500/10 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 border-purple-500/30',
    iconGradient: 'from-purple-500 via-violet-600 to-indigo-700 shadow-purple-500/25',
    glow: 'bg-purple-500/20 group-hover:bg-purple-500/30',
    title: 'text-purple-800 dark:text-purple-300',
    value: 'text-purple-950 dark:text-purple-100',
    subtext: 'text-purple-700/80 dark:text-purple-400/80',
    cta: 'text-purple-600 dark:text-purple-400',
  },
  amber: {
    card: 'border-amber-300/80 bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white hover:border-amber-400 hover:shadow-amber-500/10 dark:border-amber-700/60 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-[#1B2433]',
    badgeBg: 'bg-amber-500/10 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border-amber-500/30',
    iconGradient: 'from-amber-500 via-orange-600 to-amber-700 shadow-amber-500/25',
    glow: 'bg-amber-500/20 group-hover:bg-amber-500/30',
    title: 'text-amber-800 dark:text-amber-300',
    value: 'text-amber-950 dark:text-amber-100',
    subtext: 'text-amber-700/80 dark:text-amber-400/80',
    cta: 'text-amber-600 dark:text-amber-400',
  },
}

function ModernKpiCard({ title, value, subtext, icon: Icon, tone = 'emerald', tag = 'METRIK', onClick }) {
  const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[20px] border-2 p-4.5 sm:p-5 shadow-xs transition-all duration-300 hover:shadow-lg ${t.card} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all duration-500 ${t.glow}`} />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${t.badgeBg}`}>
              {tag}
            </span>
          </div>
          <p className={`text-xs font-bold pt-0.5 ${t.title}`}>{title}</p>
        </div>
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-105 ${t.iconGradient}`}>
          {Icon && <Icon className="size-5 text-white" />}
        </div>
      </div>
      <div className="relative z-10 mt-3 flex items-baseline justify-between gap-2">
        <div>
          <p className={`text-3xl sm:text-4xl font-black tabular-nums tracking-tight ${t.value}`}>
            {value}
          </p>
          {subtext && (
            <p className={`mt-1 text-xs font-medium ${t.subtext}`}>{subtext}</p>
          )}
        </div>
        <div className={`flex items-center gap-1 text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity ${t.cta}`}>
          <span>Detail</span>
          <ChevronRight className="size-3" />
        </div>
      </div>
    </motion.div>
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
                Hapus Jadwal Sholat?
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            Apakah Anda yakin ingin menghapus data jadwal sholat ini dari database? Tindakan ini tidak dapat dibatalkan.
          </p>

          <div className="rounded-xl border border-rose-200/80 bg-rose-50/50 p-3.5 dark:border-rose-800/60 dark:bg-rose-950/20 mb-5">
            <p className="text-xs font-black text-rose-950 dark:text-rose-100">
              {item?.kabkota_name || 'Kab/Kota'} ({item?.provinsi || 'Provinsi'})
            </p>
            <p className="text-[11px] text-rose-800/80 dark:text-rose-300/80 mt-1">
              Tanggal: {item?.tanggal_lengkap || item?.tanggal} ({item?.hari || '-'})
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
              {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Hapus Jadwal
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function HarmonizedSaveConfirmModal({ isOpen, onClose, onConfirm, payload, isSubmitting }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#1B2433]"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
        <div className="p-6">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/30">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Simpan Database
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                Simpan Jadwal Sholat Bulanan?
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            Data jadwal sholat bulanan untuk wilayah ini akan disimpan ke database master aplikasi untuk sinkronisasi otomatis absensi dan ibadah harian santri/siswa.
          </p>

          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3.5 dark:border-emerald-800/60 dark:bg-emerald-950/20 mb-5">
            <p className="text-xs font-black text-emerald-950 dark:text-emerald-100">
              {payload?.kabkota || 'Kota'} ({payload?.provinsi || 'Provinsi'})
            </p>
            <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 mt-1">
              Bulan: {payload?.bulan} / {payload?.tahun} • {payload?.totalDays || '1 Bulan Penuh'}
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
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:brightness-105 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Konfirmasi Simpan
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function MasterJadwalSholatPage() {
  const user = useAuthStore((state) => state.user)
  const canManageMaster = useMemo(() => {
    if (!user) return false
    const level = getUserRoleLevel(user)
    const perms = Array.isArray(user?.permissions) ? user.permissions : []
    return level <= ROLE_LEVELS.ADMIN || perms.includes('sistem.master_data')
  }, [user])

  const pengaturan = usePengaturanStore((state) => state.pengaturan)
  const foundationName = resolveFoundationName(pengaturan)
  // State for Interactive Testing Form
  const [activeEndpoint, setActiveEndpoint] = useState('POST_SHALAT') // GET_PROVINSI | POST_KABKOTA | POST_SHALAT
  const [provinsiList, setProvinsiList] = useState([])
  const [kabkotaList, setKabkotaList] = useState([])
  const [selectedProvinsi, setSelectedProvinsi] = useState('Jawa Barat')
  const [selectedKabkota, setSelectedKabkota] = useState('Kota Bogor')
  const [selectedBulan, setSelectedBulan] = useState(new Date().getMonth() + 1)
  const [selectedTahun, setSelectedTahun] = useState(2026)

  // Testing Response & Loading
  const [loadingTest, setLoadingTest] = useState(false)
  const [apiResponse, setApiResponse] = useState(null)
  const [savingDb, setSavingDb] = useState(false)
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false)

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

  // Master Data DB Viewer State
  const [masterList, setMasterList] = useState([])
  const [masterStats, setMasterStats] = useState({ total_records: 0, total_provinsi: 0, total_kabkota: 0 })
  const [loadingMaster, setLoadingMaster] = useState(false)
  const [filterProvinsi, setFilterProvinsi] = useState('')
  const [filterKabkota, setFilterKabkota] = useState('')
  const [filterSearch, setFilterSearch] = useState('')
  const debouncedSearch = useDebounce(filterSearch, 350)
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 10

  // Load Provinces on mount
  useEffect(() => {
    fetchProvinsi()
    loadMasterFromDb()
  }, [])

  // Load Kabkota when selectedProvinsi changes
  useEffect(() => {
    if (selectedProvinsi) {
      fetchKabkota(selectedProvinsi)
    }
  }, [selectedProvinsi])

  const showToast = (msg, type = 'success') => {
    pushToast(type, type === 'error' ? 'Terjadi Kesalahan' : 'Berhasil', msg)
  }

  const fetchProvinsi = async () => {
    try {
      const res = await equranService.getProvinsi()
      if (res?.data) {
        setProvinsiList(res.data)
      }
    } catch (e) {
      console.error('Failed loading provinsi', e)
    }
  }

  const fetchKabkota = async (prov) => {
    try {
      const res = await equranService.getKabkota(prov)
      if (res?.data) {
        setKabkotaList(res.data)
        if (res.data.length > 0 && !res.data.includes(selectedKabkota)) {
          setSelectedKabkota(res.data[0])
        }
      }
    } catch (e) {
      console.error('Failed loading kabkota', e)
    }
  }

  const loadMasterFromDb = async () => {
    setLoadingMaster(true)
    try {
      const res = await equranService.getMasterShalatList({
        provinsi: filterProvinsi,
        kabkota: filterKabkota,
        search: debouncedSearch,
      })
      if (res?.data) {
        setMasterList(res.data)
        setMasterStats(res.stats || { total_records: res.data.length, total_provinsi: 0, total_kabkota: 0 })
      }
    } catch (e) {
      console.error('Failed loading master shalat from DB', e)
    } finally {
      setLoadingMaster(false)
    }
  }

  // Trigger search on debounce or filter change
  useEffect(() => {
    loadMasterFromDb()
    setCurrentPage(1)
  }, [debouncedSearch, filterProvinsi, filterKabkota])

  const handleRunTest = async () => {
    setLoadingTest(true)
    try {
      let res = null
      if (activeEndpoint === 'GET_PROVINSI') {
        res = await equranService.getProvinsi()
      } else if (activeEndpoint === 'POST_KABKOTA') {
        res = await equranService.getKabkota(selectedProvinsi)
      } else {
        res = await equranService.getJadwalShalatBulanan(
          selectedProvinsi,
          selectedKabkota,
          Number(selectedBulan),
          Number(selectedTahun)
        )
      }
      setApiResponse(res)
      showToast('Uji API berhasil dijalankan!')
    } catch (e) {
      setApiResponse({ code: 500, message: 'Gagal menjalankan uji API', error: e.message })
      showToast('Gagal menjalankan uji API', 'error')
    } finally {
      setLoadingTest(false)
    }
  }

  const handleConfirmSaveToDb = async () => {
    setSavingDb(true)
    try {
      let payload = {}
      if (apiResponse?.data?.jadwal) {
        payload = {
          provinsi: apiResponse.data.provinsi || selectedProvinsi,
          kabkota: apiResponse.data.kabkota || selectedKabkota,
          bulan: Number(apiResponse.data.bulan || selectedBulan),
          tahun: Number(apiResponse.data.tahun || selectedTahun),
          jadwal: apiResponse.data.jadwal,
        }
      } else {
        const fetched = await equranService.getJadwalShalatBulanan(
          selectedProvinsi,
          selectedKabkota,
          Number(selectedBulan),
          Number(selectedTahun)
        )
        payload = {
          provinsi: selectedProvinsi,
          kabkota: selectedKabkota,
          bulan: Number(selectedBulan),
          tahun: Number(selectedTahun),
          jadwal: fetched.data?.jadwal || [],
        }
      }

      const res = await equranService.saveMasterShalat(payload)
      if (res?.success) {
        showToast(res.message || 'Data jadwal sholat berhasil disimpan ke Database!')
        setIsConfirmSaveOpen(false)
        loadMasterFromDb()
      } else {
        showToast(res?.message || 'Gagal menyimpan data ke database', 'error')
      }
    } catch (e) {
      console.error('Error saving to DB:', e)
      const errorMsg = e.response?.data?.message || e.message || 'Gagal menyimpan data ke database'
      showToast(errorMsg, 'error')
    } finally {
      setSavingDb(false)
    }
  }

  const handleDeleteMaster = (row) => {
    setDeleteItem(row)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmHapus = async () => {
    if (!deleteItem) return
    setIsDeleting(true)
    try {
      const res = await equranService.deleteMasterShalat(deleteItem.id)
      if (res?.success) {
        showToast(res.message || 'Data jadwal sholat berhasil dihapus')
        setIsDeleteModalOpen(false)
        setDeleteItem(null)
        loadMasterFromDb()
      }
    } catch (e) {
      showToast('Gagal menghapus data master', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePrint = () => {
    if (!masterList || masterList.length === 0) return
    const rows = masterList.map((m, idx) => [
      idx + 1,
      m.tanggal_lengkap || m.tanggal || '-',
      m.hari || '-',
      m.imsak || '-',
      m.subuh || '-',
      m.terbit || '-',
      m.dhuha || '-',
      m.dzuhur || '-',
      m.ashar || '-',
      m.maghrib || '-',
      m.isya || '-',
    ])
    printCleanTable({
      title: 'JADWAL WAKTU SHOLAT & IMSAKIYAH RESMI',
      subtitle: `Wilayah: ${filterKabkota ? filterKabkota + ', ' : ''}${filterProvinsi || (pengaturan?.province || '-')}${foundationName ? ` (${foundationName})` : ''}`,
      headers: ['No', 'Tanggal', 'Hari', 'Imsak', 'Subuh', 'Terbit', 'Dhuha', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'],
      rows,
      orientation: 'landscape',
    })
  }

  const exportToCsv = () => {
    if (masterList.length === 0) return
    const headers = ['Provinsi', 'KabKota', 'Tanggal', 'Hari', 'Imsak', 'Subuh', 'Terbit', 'Dhuha', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya']
    const rows = masterList.map((m) => [
      m.provinsi || '',
      m.kabkota_name || '',
      m.tanggal_lengkap || m.tanggal || '',
      m.hari || '',
      m.imsak || '',
      m.subuh || '',
      m.terbit || '',
      m.dhuha || '',
      m.dzuhur || '',
      m.ashar || '',
      m.maghrib || '',
      m.isya || '',
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Master_Jadwal_Sholat_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const resetFilters = () => {
    setFilterSearch('')
    setFilterProvinsi('')
    setFilterKabkota('')
    setCurrentPage(1)
  }

  const bulanNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  const provinsiOptions = useMemo(() => provinsiList.map((p) => ({ value: p, label: p })), [provinsiList])
  const kabkotaOptions = useMemo(() => kabkotaList.map((k) => ({ value: k, label: k })), [kabkotaList])
  const bulanOptions = useMemo(() => [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ].map((name, idx) => ({ value: idx + 1, label: `${idx + 1} - ${name}` })), [])
  const filterProvinsiOptions = useMemo(() => [
    { value: '', label: 'Semua Provinsi' },
    ...provinsiList.map((p) => ({ value: p, label: p }))
  ], [provinsiList])

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(masterList.length / perPage))
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return masterList.slice(start, start + perPage)
  }, [masterList, currentPage, perPage])

  return (
    <PageContainer maxW="7xl">
      <div className="mb-4">
        <AppBreadcrumb items={[{ label: 'Master Data', href: '/dashboard' }, { label: 'Jadwal Sholat' }]} />
      </div>

      {/* Modern Hero Header Banner */}
      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 mb-6">
        <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
              <Compass className="size-6 sm:size-7 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                  <Sparkles className="size-3 text-amber-300 animate-pulse" />
                  Master Data Ibadah
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-100/90 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                  Waktu Sholat
                </span>
              </div>
              <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Master Jadwal Sholat
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
                Pengelolaan data jadwal waktu sholat harian per kabupaten/kota seluruh Indonesia terintegrasi API EQuran.id.
              </p>
            </div>
          </div>
        </div>
      </div>

      <MasterDataPage className="sholat-master-page space-y-6" hideBreadcrumb>
        {/* Modern KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ModernKpiCard
            title="Rekord Jadwal Sholat"
            value={`${masterStats.total_records || masterList.length} Hari`}
            subtext="Data jadwal dalam DB"
            icon={Database}
            tone="emerald"
            tag="JADWAL SHOLAT"
          />
          <ModernKpiCard
            title="Provinsi Tercover"
            value={`${masterStats.total_provinsi || 0} / 34`}
            subtext="Seluruh provinsi Indonesia"
            icon={Globe}
            tone="blue"
            tag="WILAYAH"
          />
          <ModernKpiCard
            title="Kab/Kota Tercover"
            value={`${masterStats.total_kabkota || 0} / 517`}
            subtext="Kota dan kabupaten nasional"
            icon={MapPin}
            tone="purple"
            tag="KAB / KOTA"
          />
          <ModernKpiCard
            title="Periode Kalender Uji"
            value={`${bulanNames[selectedBulan - 1]}`}
            subtext={`Tahun ${selectedTahun}`}
            icon={Calendar}
            tone="amber"
            tag="PERIODE"
          />
        </div>

        {/* Interactive Testing & API Pull Panel (Postman-style) */}
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
          <div className="p-5 border-b border-emerald-200/90 dark:border-emerald-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/30">
                <FileCode className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Testing Interaktif & Tarik Data API EQuran.id</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Uji semua endpoint secara real-time dan simpan hasilnya ke database master.</p>
              </div>
            </div>

            {/* Endpoint Selector Tabs */}
            <div className="flex bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl gap-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveEndpoint('GET_PROVINSI')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeEndpoint === 'GET_PROVINSI'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
              >
                Data Provinsi
              </button>
              <button
                type="button"
                onClick={() => setActiveEndpoint('POST_KABKOTA')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeEndpoint === 'POST_KABKOTA'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
              >
                Data Kab/Kota
              </button>
              <button
                type="button"
                onClick={() => setActiveEndpoint('POST_SHALAT')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeEndpoint === 'POST_SHALAT'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
              >
                Data Bulanan
              </button>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Controls */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-50/80 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" /> Parameter Permintaan
                </h3>

                {/* Provinsi Select */}
                {activeEndpoint !== 'GET_PROVINSI' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      Provinsi (Wajib)
                    </label>
                    <HeroUiModalSelect
                      value={selectedProvinsi}
                      onChange={setSelectedProvinsi}
                      options={provinsiOptions}
                      placeholder="Pilih Provinsi..."
                      searchable={true}
                    />
                  </div>
                )}

                {/* Kabkota Select */}
                {activeEndpoint === 'POST_SHALAT' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      Kabupaten / Kota (Wajib)
                    </label>
                    <HeroUiModalSelect
                      value={selectedKabkota}
                      onChange={setSelectedKabkota}
                      options={kabkotaOptions}
                      placeholder="Pilih Kab / Kota..."
                      searchable={true}
                    />
                  </div>
                )}

                {/* Month & Year Select */}
                {activeEndpoint === 'POST_SHALAT' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                        Bulan
                      </label>
                      <HeroUiModalSelect
                        value={selectedBulan}
                        onChange={(val) => setSelectedBulan(Number(val))}
                        options={bulanOptions}
                        placeholder="Pilih Bulan..."
                        searchable={false}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                        Tahun
                      </label>
                      <input
                        type="number"
                        value={selectedTahun}
                        onChange={(e) => setSelectedTahun(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleRunTest}
                    disabled={loadingTest}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs cursor-pointer"
                  >
                    <Play className={`w-3.5 h-3.5 ${loadingTest ? 'animate-spin' : ''}`} />
                    {loadingTest ? 'Memuat Data...' : 'Lihat Data API'}
                  </button>

                  {canManageMaster && (
                    <button
                      type="button"
                      onClick={() => setIsConfirmSaveOpen(true)}
                      disabled={savingDb}
                      className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-teal-600/25 transition-all flex items-center gap-2 disabled:opacity-50 text-xs cursor-pointer"
                      title="Simpan Jadwal Sholat ke Database Master"
                    >
                      <Save className={`w-3.5 h-3.5 ${savingDb ? 'animate-spin' : ''}`} />
                      {savingDb ? 'Menyimpan...' : 'Simpan DB'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Response UI/UX Data Preview */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 flex-1 flex flex-col border border-slate-800 shadow-inner min-h-[340px]">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                    <span className="text-xs font-bold tracking-wider uppercase text-slate-200">
                      PRATINJAU HASIL DATA {apiResponse?.code ? `(Status: ${apiResponse.code})` : ''}
                    </span>
                  </div>
                  {apiResponse && (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                      {apiResponse.message || '200 OK'}
                    </span>
                  )}
                </div>

                <div className="flex-1 overflow-auto max-h-[380px]">
                  {!apiResponse ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-12">
                      <Server className="w-12 h-12 stroke-[1.5] mb-2 opacity-40 text-emerald-500" />
                      <p className="font-semibold text-slate-400 text-xs">Pilih parameter dan klik "Lihat Data API" untuk menguji data.</p>
                    </div>
                  ) : Array.isArray(apiResponse.data) ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs text-slate-400 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                        <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                          <Globe className="w-4 h-4" /> Total Data Ditemukan: {apiResponse.data.length} Wilayah
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {apiResponse.data.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 p-2.5 rounded-xl text-xs font-medium text-slate-200 flex items-center gap-2 transition-all"
                          >
                            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : apiResponse.data?.jadwal ? (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-emerald-900/60 to-teal-900/60 p-3.5 rounded-xl border border-emerald-700/40 flex flex-wrap justify-between items-center gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-emerald-200">
                            {apiResponse.data.provinsi} - {apiResponse.data.kabkota}
                          </h4>
                          <p className="text-xs text-emerald-300/80">
                            Jadwal Shalat Bulanan: {apiResponse.data.bulan_nama || `Bulan ${apiResponse.data.bulan}`} {apiResponse.data.tahun}
                          </p>
                        </div>
                        <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30 font-semibold">
                          {apiResponse.data.jadwal.length} Hari
                        </span>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-800 text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-700 text-[11px]">
                            <tr>
                              <th className="py-2.5 px-3">Tgl</th>
                              <th className="py-2.5 px-3">Hari</th>
                              <th className="py-2.5 px-2 text-center text-slate-400">Imsak</th>
                              <th className="py-2.5 px-2 text-center text-emerald-400">Subuh</th>
                              <th className="py-2.5 px-2 text-center text-amber-400">Dzuhur</th>
                              <th className="py-2.5 px-2 text-center text-indigo-400">Ashar</th>
                              <th className="py-2.5 px-2 text-center text-orange-400">Maghrib</th>
                              <th className="py-2.5 px-2 text-center text-purple-400">Isya</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 font-mono">
                            {apiResponse.data.jadwal.slice(0, 10).map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-800/40 text-slate-300">
                                <td className="py-2 px-3 font-bold text-emerald-400">{row.tanggal}</td>
                                <td className="py-2 px-3 font-sans font-medium">{row.hari}</td>
                                <td className="py-2 px-2 text-center text-slate-400">{row.imsak}</td>
                                <td className="py-2 px-2 text-center font-semibold text-emerald-300">{row.subuh}</td>
                                <td className="py-2 px-2 text-center font-semibold text-amber-300">{row.dzuhur}</td>
                                <td className="py-2 px-2 text-center font-semibold text-indigo-300">{row.ashar}</td>
                                <td className="py-2 px-2 text-center font-semibold text-orange-300">{row.maghrib}</td>
                                <td className="py-2 px-2 text-center font-semibold text-purple-300">{row.isya}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {apiResponse.data.jadwal.length > 10 && (
                          <p className="text-center py-2 text-[11px] text-slate-400 italic bg-slate-800/30">
                            Menampilkan 10 dari {apiResponse.data.jadwal.length} hari...
                            {canManageMaster ? ' (Klik "Simpan DB" untuk memasukkan seluruh data ke Database Master)' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-800 rounded-xl text-xs text-slate-300">
                      <p className="font-semibold text-emerald-400">{apiResponse.message || 'Respon berhasil diterima'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Master Data Datatable Container */}
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
          {/* Toolbar Baris 1 */}
          <div className="p-5 border-b border-emerald-200/90 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent flex flex-col md:flex-row md:items-center justify-between gap-4 dark:border-emerald-800/60 dark:bg-gradient-to-r dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/30 border border-emerald-300/40">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Master Jadwal Sholat</h2>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {masterList.length} Tersimpan
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                  Jadwal sholat harian per wilayah yang siap digunakan modul Absensi & Mutaba'ah.
                </p>
              </div>
            </div>

            {/* 4 Soft Squircle Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
              <SquircleActionButton
                variant="print"
                icon={Printer}
                onClick={handlePrint}
                title="Cetak Jadwal Sholat"
              />
              <SquircleActionButton
                variant="export"
                icon={Download}
                onClick={exportToCsv}
                disabled={masterList.length === 0}
                title="Ekspor Jadwal Sholat ke CSV"
              />
              <SquircleActionButton
                variant="sync"
                icon={RefreshCw}
                onClick={loadMasterFromDb}
                disabled={loadingMaster}
                title="Muat Ulang Data dari Database"
              />
            </div>
          </div>

          {/* Toolbar Baris 2: Full-Width Search Input */}
          <div className="px-5 py-3.5 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:from-slate-900/60 dark:via-emerald-950/20 dark:to-slate-900/60">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-emerald-600/70 dark:text-emerald-400/70" />
              <input
                type="text"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder="Cari berdasarkan nama provinsi, kabupaten/kota, hari, atau tanggal..."
                className="w-full rounded-xl border border-emerald-300/80 bg-white py-2.5 pl-10 pr-10 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700/60 dark:bg-slate-800/90 dark:text-white"
              />
              {filterSearch && (
                <button
                  type="button"
                  onClick={() => setFilterSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>

          {/* Toolbar Baris 3: Horizontal Filters */}
          <div className="px-5 py-3 border-b border-emerald-100 dark:border-emerald-900/50 bg-slate-50/70 dark:bg-slate-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold mr-1">
                <Filter className="size-3.5 text-emerald-600" />
                <span>Filter Wilayah:</span>
              </div>

              {/* Filter Provinsi */}
              <HeroUiFilterSelect
                value={filterProvinsi}
                onChange={(val) => {
                  setFilterProvinsi(val)
                  setCurrentPage(1)
                }}
                options={filterProvinsiOptions}
                placeholder="Semua Provinsi"
                searchable={true}
              />

              {/* Reset Filter Button */}
              {(filterSearch || filterProvinsi || filterKabkota) && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <RotateCcw className="size-3 text-emerald-600" />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>

            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Menampilkan {paginatedList.length} dari {masterList.length} data
            </div>
          </div>

          {/* Master Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
                <tr className="border-b-2 border-emerald-200/90 dark:border-emerald-800/80 bg-transparent text-emerald-950 dark:text-emerald-200 font-extrabold text-[11px] uppercase tracking-wider">
                  <th className="hidden sm:table-cell py-3.5 px-4 bg-transparent">Provinsi</th>
                  <th className="hidden sm:table-cell py-3.5 px-4 bg-transparent">Kab / Kota</th>
                  <th className="py-3.5 px-4 bg-transparent">Tanggal</th>
                  <th className="hidden md:table-cell py-3.5 px-4 bg-transparent">Hari</th>
                  <th className="hidden lg:table-cell py-3.5 px-3 bg-transparent text-center">Imsak</th>
                  <th className="py-3.5 px-3 bg-transparent text-center text-emerald-800 dark:text-emerald-300">Subuh</th>
                  <th className="hidden lg:table-cell py-3.5 px-3 bg-transparent text-center">Terbit</th>
                  <th className="hidden lg:table-cell py-3.5 px-3 bg-transparent text-center">Dhuha</th>
                  <th className="py-3.5 px-3 bg-transparent text-center text-blue-800 dark:text-blue-300">Dzuhur</th>
                  <th className="py-3.5 px-3 bg-transparent text-center text-indigo-800 dark:text-indigo-300">Ashar</th>
                  <th className="py-3.5 px-3 bg-transparent text-center text-orange-800 dark:text-orange-300">Maghrib</th>
                  <th className="py-3.5 px-3 bg-transparent text-center text-purple-800 dark:text-purple-300">Isya</th>
                  {canManageMaster && <th className="py-3.5 px-4 bg-transparent text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                {loadingMaster ? (
                  <tr>
                    <td colSpan={canManageMaster ? 13 : 12} className="py-14 text-center text-slate-400">
                      <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2 text-emerald-600" />
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Memuat data master sholat dari database...</p>
                    </td>
                  </tr>
                ) : paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={canManageMaster ? 13 : 12} className="py-14 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <Compass className="size-10 text-emerald-400/50 mb-2" />
                        <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">Belum ada master data sholat tersimpan</p>
                        <p className="text-xs text-slate-500 max-w-sm mt-1">
                          {canManageMaster
                            ? 'Gunakan panel "Testing Interaktif & Tarik Data API EQuran.id" di atas lalu klik "Simpan DB".'
                            : 'Belum ada data jadwal sholat tersimpan di database master untuk filter yang dipilih.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((row) => (
                    <tr key={row.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
                      <td className="hidden sm:table-cell py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {row.provinsi || 'Jawa Barat'}
                      </td>
                      <td className="hidden sm:table-cell py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {row.kabkota_name || 'Kota Bogor'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {row.tanggal_lengkap || row.tanggal}
                        </div>
                        {/* Compact mobile metadata row */}
                        <div className="sm:hidden mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                          {row.kabkota_name || 'Kota Bogor'} • {row.provinsi || 'Jawa Barat'}
                          <span className="md:hidden"> ({row.hari || '-'})</span>
                        </div>
                      </td>
                      <td className="hidden md:table-cell py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {row.hari || '-'}
                      </td>
                      <td className="hidden lg:table-cell py-3 px-3 text-center font-mono text-slate-500">{row.imsak || '-'}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30">
                        {row.subuh}
                      </td>
                      <td className="hidden lg:table-cell py-3 px-3 text-center font-mono text-slate-500">{row.terbit || '-'}</td>
                      <td className="hidden lg:table-cell py-3 px-3 text-center font-mono text-amber-600 dark:text-amber-400">{row.dhuha || '-'}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30">
                        {row.dzuhur}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-medium text-indigo-600 dark:text-indigo-400">
                        {row.ashar}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/30">
                        {row.maghrib}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-medium text-purple-600 dark:text-purple-400">
                        {row.isya}
                      </td>
                      {canManageMaster && (
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center">
                            <ActionDropdown onDelete={() => handleDeleteMaster(row)} />
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* HeroUI Pagination Footer */}
          {masterList.length > 0 && (
            <div className="px-5 py-3 border-t border-emerald-100 dark:border-emerald-900/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-[#1B2433]">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Menampilkan halaman {currentPage} dari {totalPages} ({masterList.length} total data jadwal)
              </p>
              <div className="flex items-center gap-1">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                  sideLayout="full"
                />
              </div>
            </div>
          )}
        </div>

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

        {/* Harmonized Save Confirmation Modal */}
        <HarmonizedSaveConfirmModal
          isOpen={isConfirmSaveOpen}
          onClose={() => setIsConfirmSaveOpen(false)}
          onConfirm={handleConfirmSaveToDb}
          payload={{
            provinsi: selectedProvinsi,
            kabkota: selectedKabkota,
            bulan: selectedBulan,
            tahun: selectedTahun,
            totalDays: apiResponse?.data?.jadwal?.length ? `${apiResponse.data.jadwal.length} Hari` : null,
          }}
          isSubmitting={savingDb}
        />


      </MasterDataPage>
    </PageContainer>
  )
}
