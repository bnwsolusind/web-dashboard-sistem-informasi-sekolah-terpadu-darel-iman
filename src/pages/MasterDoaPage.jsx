import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Search,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Tag,
  X,
  Loader2,
  Layers,
  Eye,
  Hash,
  Bookmark,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Check,
  CheckCircle2,
  Printer,
  Download,
  RotateCcw,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import ActionDropdown from '../components/app/ActionDropdown'
import { equranService } from '../services/equranService'
import PageContainer from '../components/app/PageContainer'
import { useToast } from '../components/app'
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
  MasterFilterSelect,
  SquircleActionButton,
  MasterStatsGrid,
  MasterStatCard,
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

// ── DEFINISI TONE WARNA KARTU KPI MODERN (HEROUI SPEC) ──
const MODERN_CARD_TONES = {
  emerald: {
    card: 'border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
    glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
    iconBox: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/30',
    tag: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
    title: 'text-emerald-700 dark:text-emerald-400',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-slate-600 dark:text-slate-400',
    cta: 'text-emerald-700 dark:text-emerald-400',
  },
  blue: {
    card: 'border-sky-300/70 bg-gradient-to-br from-sky-50 via-blue-50/60 to-white hover:border-sky-400 dark:border-sky-700/50 dark:from-sky-950/40 dark:via-blue-950/20 dark:to-slate-900',
    glow: 'bg-sky-400/20 group-hover:bg-sky-400/30',
    iconBox: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm shadow-sky-500/30',
    tag: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300',
    title: 'text-sky-700 dark:text-sky-400',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-slate-600 dark:text-slate-400',
    cta: 'text-sky-700 dark:text-sky-400',
  },
  purple: {
    card: 'border-purple-300/70 bg-gradient-to-br from-purple-50 via-indigo-50/60 to-white hover:border-purple-400 dark:border-purple-700/50 dark:from-purple-950/40 dark:via-indigo-950/20 dark:to-slate-900',
    glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
    iconBox: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-sm shadow-purple-500/30',
    tag: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300',
    title: 'text-purple-700 dark:text-purple-400',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-slate-600 dark:text-slate-400',
    cta: 'text-purple-700 dark:text-purple-400',
  },
  amber: {
    card: 'border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
    glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
    iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm shadow-amber-500/30',
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
      className={`group relative overflow-hidden rounded-[18px] border-2 p-5 shadow-xs transition-[border-color,box-shadow] duration-150 text-left flex flex-col justify-between h-full ${isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
        } ${t.card}`}
    >
      {/* Ambient Glow */}
      <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all ${t.glow}`} />

      {/* Header dengan Icon Box & Tag */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${t.iconBox}`}>
              {Icon && <Icon className="h-5 w-5" />}
            </div>
            <div>
              <p className={`text-[11px] font-bold uppercase tracking-wider ${t.title}`}>{label}</p>
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
          <p className={`mt-1 text-[11px] font-semibold ${t.sub}`}>
            {subtext}
          </p>
        )}
      </div>

      {/* CTA Footer */}
      {isClickable && (
        <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
          <span className={`text-[11px] font-bold ${t.cta}`}>{ctaText}</span>
          <ChevronRight className={`h-3.5 w-3.5 ${t.cta} transition-transform group-hover:translate-x-1`} />
        </div>
      )}
    </motion.article>
  )
}

const emptyDoa = {
  id: '',
  nama: '',
  grup: 'Doa Harian',
  ar: '',
  tr: '',
  idn: '',
  tentang: '',
  tagInput: '',
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
                Hapus Data Doa?
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            Apakah Anda yakin ingin menghapus doa ini dari database? Tindakan ini tidak dapat dibatalkan.
          </p>

          <div className="rounded-xl border border-rose-200/80 bg-rose-50/50 p-3.5 dark:border-rose-800/60 dark:bg-rose-950/20 mb-5">
            <p className="text-xs font-black text-rose-950 dark:text-rose-100">
              #{item?.id} • {item?.nama}
            </p>
            <p className="text-[11px] text-rose-800/80 dark:text-rose-300/80 mt-0.5">
              Kategori: {item?.grup || 'Doa Harian'}
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
              Hapus Doa
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function HarmonizedDeleteAllModal({ isOpen, onClose, onConfirm, isSubmitting }) {
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
                Kosongkan Database
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                Hapus Seluruh Data Doa?
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            Seluruh data doa dan dzikir lokal akan dihapus dari sistem. Anda dapat mengimpor kembali melalui katalog EQuran.id kapan saja.
          </p>

          <div className="rounded-xl border border-rose-200/80 bg-rose-50/50 p-3.5 dark:border-rose-800/60 dark:bg-rose-950/20 mb-5">
            <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
              Peringatan: Seluruh data doa &amp; dzikir lokal akan dikosongkan.
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
              Ya, Kosongkan Data
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function MasterDoaPage() {
  const user = useAuthStore((state) => state.user)
  const canManageMaster = useMemo(() => {
    if (!user) return false
    const level = getUserRoleLevel(user)
    const perms = Array.isArray(user?.permissions) ? user.permissions : []
    return level <= ROLE_LEVELS.ADMIN || perms.includes('sistem.master_data')
  }, [user])

  const [doas, setDoas] = useState([])
  const pengaturan = usePengaturanStore((state) => state.pengaturan)
  const foundationName = resolveFoundationName(pengaturan)
  const [grupOptions, setGrupOptions] = useState([])
  const [tagOptions, setTagOptions] = useState([])
  const [stats, setStats] = useState({ total_doa: 0, total_grup: 0, total_tag: 0 })
  const [loading, setLoading] = useState(true)
  const [remoteDoas, setRemoteDoas] = useState([])
  const [showRemoteCatalog, setShowRemoteCatalog] = useState(false)
  const [loadingRemote, setLoadingRemote] = useState(false)
  const [importingId, setImportingId] = useState(null)

  // Filters for Master Data
  const [search, setSearch] = useState('')
  const [grupFilter, setGrupFilter] = useState('all')
  const [tagFilter, setTagFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const formattedGrupOptions = useMemo(() => [
    { value: 'all', label: 'Semua Kategori / Grup' },
    ...grupOptions.map((g) => ({ value: g, label: g })),
  ], [grupOptions])

  const formattedTagOptions = useMemo(() => [
    { value: 'all', label: 'Semua Tag' },
    ...tagOptions.map((t) => ({ value: t, label: `#${t}` })),
  ], [tagOptions])

  const perPageOptions = useMemo(() => [
    { value: 10, label: '10 Baris' },
    { value: 25, label: '25 Baris' },
    { value: 50, label: '50 Baris' },
  ], [])

  // Modal State for Add / Edit
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState(emptyDoa)
  const [saving, setSaving] = useState(false)

  // Modal State for Reader Detail Doa
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedDoa, setSelectedDoa] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // Modal State for Delete
  const [deleteItem, setDeleteItem] = useState(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false)
  const [isDeletingAll, setIsDeletingAll] = useState(false)

  // Global Toast
  const { pushToast } = useToast()

  // Fetch Doa list from Backend Database
  const fetchDoas = async () => {
    setLoading(true)
    try {
      const res = await equranService.getDoas({
        grup: grupFilter !== 'all' ? grupFilter : undefined,
        tag: tagFilter !== 'all' ? tagFilter : undefined,
        search: search || undefined,
      })

      if (res && res.data) {
        setDoas(res.data || [])
        setGrupOptions(res.grup_options || [])
        setTagOptions(res.tag_options || [])
        if (res.stats) {
          setStats(res.stats)
        }
      }
    } catch (e) {
      console.error('Failed loading doa data', e)
      pushToast('Gagal memuat data doa dari database', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoas()
  }, [grupFilter, tagFilter])

  // Load source-only catalogue. Nothing is saved until a row is imported.
  const handleOpenRemoteCatalog = async () => {
    setShowRemoteCatalog(true)
    setLoadingRemote(true)
    try {
      const res = await equranService.getRemoteDoaCatalog()
      setRemoteDoas(res.data || [])
    } catch (e) {
      console.error(e)
      pushToast('Gagal memuat katalog dari EQuran.id', 'error')
    } finally {
      setLoadingRemote(false)
    }
  }

  const handleImportRemoteDoa = async (remoteDoa) => {
    setImportingId(remoteDoa.id)
    try {
      await equranService.importRemoteDoa(remoteDoa.id)
      await fetchDoas()
      pushToast(`“${remoteDoa.nama}” telah ditambahkan ke database.`, 'success')
    } catch (e) {
      pushToast(e.response?.data?.message || 'Gagal mengimpor data dari EQuran.id.', 'error')
    } finally {
      setImportingId(null)
    }
  }

  const handleDeleteAll = () => {
    setIsDeleteAllOpen(true)
  }

  const handleConfirmDeleteAll = async () => {
    setIsDeletingAll(true)
    try {
      const res = await equranService.deleteAllDoas()
      setDoas([])
      setGrupOptions([])
      setTagOptions([])
      setStats({ total_doa: 0, total_grup: 0, total_tag: 0 })
      setIsDeleteAllOpen(false)
      pushToast(res.message || 'Seluruh data doa berhasil dikosongkan.', 'success')
    } catch (e) {
      pushToast(e.response?.data?.message || 'Gagal menghapus seluruh data doa.', 'error')
    } finally {
      setIsDeletingAll(false)
    }
  }

  // Open Detail Reader Modal
  const handleOpenDetail = async (doa) => {
    setSelectedDoa(doa)
    setShowDetailModal(true)
    setLoadingDetail(true)

    try {
      const res = await equranService.getDoaDetail(doa.id)
      if (res && res.data) {
        setSelectedDoa(res.data)
      }
    } catch (e) {
      console.error('Failed fetching doa detail:', e)
    } finally {
      setLoadingDetail(false)
    }
  }

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingItem(null)
    const nextId = doas.length > 0 ? Math.max(...doas.map((d) => Number(d.id) || 0)) + 1 : 1
    setFormData({
      ...emptyDoa,
      id: nextId,
    })
    setShowModal(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (doa, e) => {
    e?.stopPropagation()
    setEditingItem(doa)
    const tagsArr = Array.isArray(doa.tag) ? doa.tag : []
    setFormData({
      id: doa.id,
      nama: doa.nama || '',
      grup: doa.grup || 'Doa Harian',
      ar: doa.ar || '',
      tr: doa.tr || '',
      idn: doa.idn || '',
      tentang: doa.tentang || '',
      tagInput: tagsArr.join(', '),
    })
    setShowModal(true)
  }

  // Submit Handler for Modal
  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const tagsArray = formData.tagInput
        ? formData.tagInput.split(',').map((t) => t.trim()).filter(Boolean)
        : []

      const payload = {
        id: Number(formData.id),
        nama: formData.nama,
        grup: formData.grup,
        ar: formData.ar,
        tr: formData.tr,
        idn: formData.idn,
        tentang: formData.tentang,
        tag: tagsArray,
      }

      if (editingItem) {
        await equranService.updateDoa(editingItem.id, payload)
        pushToast('Data doa berhasil diperbarui', 'success')
      } else {
        await equranService.createDoa(payload)
        pushToast('Doa baru berhasil ditambahkan ke database', 'success')
      }

      setShowModal(false)
      fetchDoas()
    } catch (e) {
      console.error(e)
      const errMessage = e.response?.data?.message || 'Gagal menyimpan data doa. Periksa form input.'
      pushToast(errMessage, 'error')
    } finally {
      setSaving(false)
    }
  }

  // Delete Doa
  const handleDelete = (doa, e) => {
    e?.stopPropagation()
    setDeleteItem(doa)
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteItem) return
    setIsDeleting(true)
    try {
      await equranService.deleteDoa(deleteItem.id)
      pushToast('Doa berhasil dihapus dari database', 'success')
      setIsDeleteOpen(false)
      setDeleteItem(null)
      fetchDoas()
    } catch (e) {
      console.error(e)
      pushToast('Gagal menghapus data doa', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  // Debounced search for smooth typing without jitter
  const debouncedSearch = useDebounce(search, 350)

  // Filtered Doa List for Search Input
  const filteredDoas = useMemo(() => {
    const s = debouncedSearch.trim().toLowerCase()
    return doas.filter((d) => {
      const matchSearch =
        !s ||
        d.nama?.toLowerCase().includes(s) ||
        d.grup?.toLowerCase().includes(s) ||
        d.tr?.toLowerCase().includes(s) ||
        d.idn?.toLowerCase().includes(s) ||
        d.tentang?.toLowerCase().includes(s) ||
        String(d.id).includes(s) ||
        (Array.isArray(d.tag) && d.tag.some((t) => t.toLowerCase().includes(s)))

      const matchGrup = grupFilter === 'all' || d.grup?.toLowerCase() === grupFilter.toLowerCase()
      const matchTag = tagFilter === 'all' || (Array.isArray(d.tag) && d.tag.includes(tagFilter))

      return matchSearch && matchGrup && matchTag
    })
  }, [doas, debouncedSearch, grupFilter, tagFilter])

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredDoas.length / perPage))
  const paginatedDoas = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return filteredDoas.slice(start, start + perPage)
  }, [filteredDoas, currentPage, perPage])

  const handleResetFilter = () => {
    setSearch('')
    setGrupFilter('all')
    setTagFilter('all')
    setCurrentPage(1)
  }

  // Computed Stats
  const displayStats = useMemo(() => {
    const totalHadits = doas.filter((d) => d.tentang && d.tentang.trim().length > 0).length
    return {
      totalDoa: doas.length,
      totalGrup: grupOptions.length || [...new Set(doas.map((d) => d.grup).filter(Boolean))].length,
      totalTag: tagOptions.length || [...new Set(doas.flatMap((d) => d.tag || []).filter(Boolean))].length,
      totalHadits,
    }
  }, [doas, grupOptions, tagOptions])

  const filteredRemoteDoas = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return remoteDoas
    return remoteDoas.filter((doa) => [doa.id, doa.nama, doa.grup, doa.kategori, doa.tr, doa.idn]
      .some((value) => String(value || '').toLowerCase().includes(term)))
  }, [remoteDoas, search])

  const importedDoaIds = useMemo(() => new Set(doas.map((doa) => Number(doa.id))), [doas])

  return (
    <PageContainer maxW="7xl">
      <AppBreadcrumb className="mb-6" items={[{ label: 'Master Data', href: '/dashboard' }, { label: 'Doa Harian' }]} />

      {/* Modern Hero Header Banner */}
      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 mb-6">
        <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
              <BookOpen className="size-6 sm:size-7 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                  <Sparkles className="size-3 text-amber-300 animate-pulse" />
                  Master Data Doa & Dzikir
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-100/90 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                  {displayStats.totalDoa} Doa
                </span>
              </div>
              <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Master Doa & Dzikir Yaumiyah
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
                Kumpulan doa harian santri/siswa beserta teks Arab, transliterasi Latin, terjemahan Indonesia, dan referensi hadits.
              </p>
            </div>
          </div>
        </div>
      </div>

      <MasterDataPage className="doa-master-page space-y-6" hideBreadcrumb>
        {/* Summary Cards Grid (ModernKpiCard with MODERN_CARD_TONES & Ambient Glow) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <ModernKpiCard
            label="Total Doa DB"
            value={displayStats.totalDoa}
            subtext="Tersimpan di database"
            tag="Database"
            icon={Layers}
            tone="emerald"
            ctaText="Semua Doa"
            onClick={() => { setGrupFilter('all'); setTagFilter('all'); setCurrentPage(1) }}
          />
          <ModernKpiCard
            label="Kategori / Grup"
            value={displayStats.totalGrup}
            subtext="Grup doa harian santri"
            tag="Grup Doa"
            icon={Bookmark}
            tone="blue"
            ctaText="Daftar Grup"
          />
          <ModernKpiCard
            label="Total Tag Unik"
            value={displayStats.totalTag}
            subtext="Tag kata kunci pencarian"
            tag="Keywords"
            icon={Tag}
            tone="purple"
            ctaText="Semua Tag"
          />
          <ModernKpiCard
            label="Referensi Hadits"
            value={displayStats.totalHadits}
            subtext="Disertai sumber hadits shahih"
            tag="Shahih"
            icon={ShieldCheck}
            tone="amber"
            ctaText="Doa Berhadits"
          />
        </div>

        {/* Master Outer Container Datatable Emerald Zamrud Modern */}
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
          {/* Toolbar Header 3-Baris Terstruktur */}
          <div className="border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-4 sm:p-5 dark:border-emerald-800/40 dark:bg-gradient-to-r dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-transparent space-y-3.5">
            {/* Baris 1: Judul, Subtitle, Count Pill, & 4 Soft Pastel Squircle Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Koleksi Doa & Dzikir Yaumiyah
                  </h3>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                    {filteredDoas.length} Doa
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Katalog doa lengkap dengan transliterasi Latin, arti, dan referensi sanad hadits.
                </p>
              </div>

              {/* 4 Soft Pastel Squircle Action Buttons dengan Floating Tooltip */}
              <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
                {/* Sync / Remote Catalog Button (Vivid Sky Blue Squircle) - Admin/Master Data Only */}
                {canManageMaster && (
                  <div className="group relative inline-flex">
                    <button
                      type="button"
                      title="Pilih dan Impor dari EQuran.id"
                      aria-label="Pilih dan Impor dari EQuran.id"
                      onClick={handleOpenRemoteCatalog}
                      className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white border border-sky-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                    >
                      <RefreshCw className="size-5 text-white" strokeWidth={2.2} />
                    </button>
                    <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                      <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                      Katalog EQuran.id
                    </div>
                  </div>
                )}

                {/* Cetak Doa Button (Pastel Indigo Squircle) */}
                <div className="group relative inline-flex">
                  <button
                    type="button"
                    title="Cetak Kumpulan Doa"
                    aria-label="Cetak Kumpulan Doa"
                    onClick={() => {
                      const rows = (filteredDoas || []).map((d, idx) => [
                        idx + 1,
                        d.judul || '-',
                        d.grup || '-',
                        d.arab || '-',
                        d.terjemah || d.arti || '-',
                        d.sumber || d.riwayat || '-',
                      ])
                      printCleanTable({
                        title: 'KUMPULAN DOA & DZIKIR HARIAN',
                        subtitle: `Data Master Panduan Doa ${foundationName}`,
                        headers: ['No', 'Judul Doa', 'Kategori', 'Lafadz Arab', 'Terjemahan', 'Sumber/Riwayat'],
                        rows,
                        orientation: 'landscape',
                      })
                    }}
                    className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white border border-indigo-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    <Printer className="size-5 text-white" strokeWidth={2.2} />
                  </button>
                  <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                    <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                    Cetak Doa
                  </div>
                </div>

                {/* Export Data Button (Vivid Amber Squircle) */}
                <div className="group relative inline-flex">
                  <button
                    type="button"
                    title="Export Data Doa (JSON)"
                    aria-label="Export Data Doa (JSON)"
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(doas, null, 2))
                      const downloadAnchor = document.createElement('a')
                      downloadAnchor.setAttribute("href", dataStr)
                      downloadAnchor.setAttribute("download", `master_doa_${new Date().toISOString().slice(0, 10)}.json`)
                      document.body.appendChild(downloadAnchor)
                      downloadAnchor.click()
                      downloadAnchor.remove()
                      pushToast('Data doa berhasil diexport', 'success')
                    }}
                    className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white border border-amber-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    <Download className="size-5 text-white" strokeWidth={2.2} />
                  </button>
                  <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                    <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                    Export Data JSON
                  </div>
                </div>

                {/* Tambah Doa Button (Vivid Emerald Squircle) - Admin/Master Data Only */}
                {canManageMaster && (
                  <div className="group relative inline-flex">
                    <button
                      type="button"
                      title="Tambah Doa Baru Manual"
                      aria-label="Tambah Doa Baru Manual"
                      onClick={handleOpenAdd}
                      className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                    >
                      <Plus className="size-5 text-white" strokeWidth={2.5} />
                    </button>
                    <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                      <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                      Tambah Doa
                    </div>
                  </div>
                )}

                {/* Kosongkan Data Button (Vivid Rose Squircle) - Admin/Master Data Only */}
                {canManageMaster && doas.length > 0 && (
                  <div className="group relative inline-flex">
                    <button
                      type="button"
                      title="Kosongkan Seluruh Data Doa"
                      aria-label="Kosongkan Seluruh Data Doa"
                      onClick={handleDeleteAll}
                      className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white border border-rose-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                    >
                      <Trash2 className="size-5 text-white" strokeWidth={2.2} />
                    </button>
                    <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                      <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                      Kosongkan Data
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Baris 2: Full-width Debounced Search Input */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                placeholder="Cari ID, judul doa (contoh: Doa Masuk Masjid), lafadz Arab, transliterasi Latin, terjemahan, atau tag..."
                className="w-full h-11 pl-10 pr-10 bg-white dark:bg-slate-900 border-2 border-emerald-100 dark:border-emerald-900/60 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-xs"
              />
              {search && (
                <button
                  onClick={() => { setSearch(''); setCurrentPage(1) }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Baris 3: Horizontal Responsive Filter Bar dengan Reset Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="text-emerald-700 dark:text-emerald-400">Filter:</span>
                </span>

                {/* Grup/Kategori Filter */}
                <HeroUiFilterSelect
                  value={grupFilter}
                  onChange={(val) => { setGrupFilter(val); setCurrentPage(1) }}
                  options={formattedGrupOptions}
                  placeholder="Kategori / Grup"
                  icon={BookOpen}
                  className="w-full sm:w-auto min-w-[190px]"
                  popoverWidth="w-64"
                  searchable={formattedGrupOptions.length > 5}
                />

                {/* Tag Filter */}
                <HeroUiFilterSelect
                  value={tagFilter}
                  onChange={(val) => { setTagFilter(val); setCurrentPage(1) }}
                  options={formattedTagOptions}
                  placeholder="Pilih Tag"
                  icon={Sparkles}
                  className="w-full sm:w-auto min-w-[150px]"
                  popoverWidth="w-56"
                  searchable={formattedTagOptions.length > 5}
                />

                {/* Per Page Selector */}
                <HeroUiFilterSelect
                  value={perPage}
                  onChange={(val) => { setPerPage(Number(val)); setCurrentPage(1) }}
                  options={perPageOptions}
                  placeholder="Per Halaman"
                  icon={Layers}
                  className="w-full sm:w-auto min-w-[120px]"
                  popoverWidth="w-32"
                />
              </div>

              {/* Reset Filter Button */}
              {(search || grupFilter !== 'all' || tagFilter !== 'all') && (
                <button
                  type="button"
                  onClick={handleResetFilter}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 bg-emerald-50/70 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300 cursor-pointer transition-all self-start sm:self-auto"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>
          </div>

          {/* Table Data Doa */}
          {loading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <span className="text-sm font-medium">Memuat data doa & dzikir dari database...</span>
            </div>
          ) : filteredDoas.length === 0 ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <Layers className="w-12 h-12 text-slate-300 dark:text-slate-600" />
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Tidak ada data doa yang cocok
              </span>
              <span className="text-xs text-slate-400">
                Coba reset filter atau import data dari EQuran.id
              </span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200">
                  <tr className="border-b-2 border-emerald-200/90 dark:border-emerald-800/80 font-extrabold text-[11px] uppercase tracking-wider">
                    <th className="px-4 py-3.5 w-16 text-center">ID</th>
                    <th className="px-4 py-3.5">Judul & Kategori</th>
                    <th className="px-4 py-3.5">Lafadz, Latin & Terjemahan</th>
                    <th className="px-4 py-3.5 w-48 hidden md:table-cell">Tag Terkait</th>
                    <th className="px-4 py-3.5 w-24 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                  {paginatedDoas.map((doa) => (
                    <tr
                      key={doa.id}
                      className="hover:bg-emerald-50/40 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
                      onClick={() => handleOpenDetail(doa)}
                    >
                      <td className="px-4 py-3 text-center font-mono font-bold text-xs text-emerald-800 dark:text-emerald-300">
                        #{doa.id}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-sm">
                          <span>{doa.nama}</span>
                          <Eye className="w-3.5 h-3.5 text-emerald-600 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300">
                            {doa.grup || 'Doa Harian'}
                          </span>
                          {doa.tentang && (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs font-medium">
                              • {doa.tentang}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 max-w-md">
                        <div className="font-serif text-right text-base text-slate-900 dark:text-slate-100 leading-relaxed line-clamp-1 mb-1 font-bold">
                          {doa.ar}
                        </div>
                        <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 italic line-clamp-1 mb-0.5">
                          "{doa.tr}"
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {doa.idn}
                        </div>
                      </td>

                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {Array.isArray(doa.tag) && doa.tag.length > 0 ? (
                            doa.tag.slice(0, 3).map((t, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-md"
                              >
                                #{t}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">-</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-center">
                          <ActionDropdown
                            onView={() => handleOpenDetail(doa)}
                            onEdit={canManageMaster ? (e) => handleOpenEdit(doa, e) : undefined}
                            onDelete={canManageMaster ? (e) => handleDelete(doa, e) : undefined}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* HeroUI Pagination Footer */}
          {filteredDoas.length > perPage && (
            <div className="border-t border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/40 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Menampilkan <span className="font-bold text-slate-800 dark:text-slate-200">{(currentPage - 1) * perPage + 1}</span> - <span className="font-bold text-slate-800 dark:text-slate-200">{Math.min(currentPage * perPage, filteredDoas.length)}</span> dari <span className="font-bold text-slate-800 dark:text-slate-200">{filteredDoas.length}</span> doa
              </div>
              <div className="max-w-xs">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => setCurrentPage(p)}
                  sideLayout="icon"
                />
              </div>
            </div>
          )}
        </div>

        {/* MODAL PILIH & IMPOR KATALOG EQURAN.ID (Harmonized Remote Modal - z-[70]) */}
        {showRemoteCatalog && (
          <div className="fixed inset-0 z-[70] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-sky-950/20 dark:border-slate-800 dark:bg-[#1B2433] flex flex-col"
            >
              {/* Top Sky Accent Line */}
              <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 shrink-0" />

              {/* Header dengan Squircle 3D Icon Badge */}
              <div className="p-5 sm:p-6 border-b border-sky-100/80 dark:border-sky-900/40 bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-transparent flex items-start justify-between gap-4 shrink-0">
                <div className="flex items-start gap-3.5">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30 border border-sky-300/40">
                    <RefreshCw className="size-6 text-white" />
                  </div>
                  <div>
                    <span className="inline-block rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
                      Katalog Sumber EQuran.id
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                      Pilih & Impor Koleksi Doa
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Pilih satu atau sinkronkan seluruh doa resmi ke database sekolah.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={syncingAll || loadingRemote}
                    onClick={handleSyncAllFromCatalog}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-sky-600/25 hover:brightness-105 disabled:opacity-60 transition cursor-pointer"
                  >
                    <RefreshCw className={`size-3.5 ${syncingAll ? 'animate-spin' : ''}`} />
                    {syncingAll ? 'Sinkron Seluruh…' : 'Impor Semua Sekaligus'}
                  </button>
                  <button
                    onClick={() => setShowRemoteCatalog(false)}
                    className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="border-b border-sky-100 bg-sky-50/60 px-5 py-2.5 text-xs font-semibold text-sky-900 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-200 shrink-0">
                {loadingRemote ? 'Mengambil katalog EQuran.id…' : `${filteredRemoteDoas.length} item sumber tersedia. Item yang sudah ada dapat diimpor ulang untuk memperbarui isinya.`}
              </div>

              <div className="overflow-y-auto p-4 sm:p-5 flex-1 bg-slate-50/50 dark:bg-slate-900/30">
                {loadingRemote ? (
                  <div className="flex items-center justify-center gap-2 p-12 text-slate-500">
                    <Loader2 className="size-5 animate-spin text-sky-600" />
                    <span className="text-xs font-medium">Memuat katalog resmi…</span>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1B2433]">
                    {filteredRemoteDoas.map((doa) => {
                      const id = Number(doa.id)
                      const imported = importedDoaIds.has(id)
                      return (
                        <div key={id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-sky-50/30 dark:hover:bg-slate-800/40 transition-colors">
                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-900 dark:text-white text-sm">#{id} · {doa.nama || doa.judul || 'Tanpa judul'}</p>
                            <p className="mt-1 text-xs font-semibold text-sky-700 dark:text-sky-300">{doa.grup || doa.kategori || 'Doa Harian'}</p>
                          </div>
                          <button
                            type="button"
                            disabled={importingId === id}
                            onClick={() => handleImportRemoteDoa(doa)}
                            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 px-3.5 py-2 text-xs font-extrabold text-white transition disabled:cursor-wait disabled:opacity-60 cursor-pointer shadow-xs"
                          >
                            {importingId === id ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                            {imported ? 'Impor Ulang' : 'Impor ke DB'}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-[#1B2433] border-t border-slate-200/80 dark:border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Data resmi Kementerian Agama RI via EQuran.id
                </span>
                <button
                  onClick={() => setShowRemoteCatalog(false)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Tutup Katalog
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL READER DETAIL DOA (Harmonized Reader Detail Modal - z-[70]) */}
        {showDetailModal && selectedDoa && (
          <div className="fixed inset-0 z-[70] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#1B2433] flex flex-col"
            >
              {/* Top Emerald Accent Line */}
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

              {/* Header dengan Squircle 3D Icon Badge */}
              <div className="p-5 sm:p-6 border-b border-emerald-100/80 dark:border-emerald-900/40 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent flex items-start justify-between gap-4 shrink-0">
                <div className="flex items-start gap-3.5">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/30 border border-emerald-300/40">
                    <Bookmark className="size-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        ID Doa #{selectedDoa.id} • {selectedDoa.grup || 'Doa Harian'}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                      {selectedDoa.nama}
                    </h2>
                  </div>
                </div>

                <button
                  onClick={() => setShowDetailModal(false)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/50 dark:bg-slate-900/30">
                {loadingDetail ? (
                  <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    <span className="text-sm font-medium">Memuat rincian doa...</span>
                  </div>
                ) : (
                  <>
                    {/* Teks Arab (Large Right Aligned) */}
                    <div className="bg-white dark:bg-[#1C2637] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs text-right text-3xl font-serif leading-loose text-slate-900 dark:text-white tracking-wide font-medium">
                      {selectedDoa.ar}
                    </div>

                    {/* Transliterasi Latin */}
                    <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border-l-4 border-emerald-500 p-4 rounded-r-2xl text-emerald-900 dark:text-emerald-200 text-sm font-semibold italic shadow-xs">
                      "{selectedDoa.tr}"
                    </div>

                    {/* Terjemahan Indonesia */}
                    <div className="bg-white dark:bg-[#1C2637] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1.5">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Terjemahan Bahasa Indonesia:
                      </div>
                      <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-normal">
                        {selectedDoa.idn}
                      </div>
                    </div>

                    {/* Referensi Sumber Hadits */}
                    {selectedDoa.tentang && (
                      <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 p-4 rounded-2xl text-amber-900 dark:text-amber-200 text-xs leading-relaxed space-y-1 shadow-xs">
                        <div className="font-extrabold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          <span>Referensi Sumber Hadits / Keterangan:</span>
                        </div>
                        <div>{selectedDoa.tentang}</div>
                      </div>
                    )}

                    {/* Tags Badges */}
                    {Array.isArray(selectedDoa.tag) && selectedDoa.tag.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap pt-2">
                        <span className="text-xs font-bold text-slate-400">Tag Keyword:</span>
                        {selectedDoa.tag.map((t, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-lg border border-emerald-200 dark:border-emerald-800/80 shadow-2xs"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-white dark:bg-[#1B2433] border-t border-slate-200/80 dark:border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Konten Referensi Doa Resmi EQuran.id
                </span>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Tutup Pembaca Doa
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL FORM ADD / EDIT DOA (Harmonized Form Modal - z-[70]) */}
        {showModal && (
          <div className="fixed inset-0 z-[70] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#1B2433]"
            >
              {/* Top Accent Line (Amber for edit, Emerald for new) */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${editingItem ? 'from-amber-500 via-amber-600 to-orange-600' : 'from-emerald-500 via-teal-400 to-emerald-600'}`} />

              <div className="p-6">
                {/* Dialog Header dengan Squircle 3D Icon Badge */}
                <div className="flex items-center gap-3.5 mb-5">
                  <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-md ${editingItem ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 shadow-amber-500/30' : 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 shadow-emerald-500/30'}`}>
                    <BookOpen className="size-6 text-white" />
                  </div>
                  <div>
                    <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${editingItem ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'}`}>
                      {editingItem ? 'Perbarui Data' : 'Doa Baru'}
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                      {editingItem ? `Edit Doa: ${editingItem.nama}` : 'Tambah Doa Baru Manual'}
                    </h3>
                  </div>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">ID Doa</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.id}
                        onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori / Grup Doa</label>
                      <input
                        type="text"
                        required
                        value={formData.grup}
                        onChange={(e) => setFormData({ ...formData, grup: e.target.value })}
                        placeholder="Contoh: Doa Sebelum dan Sesudah Tidur"
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Judul Doa</label>
                    <input
                      type="text"
                      required
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      placeholder="Contoh: Doa Sebelum Tidur"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Teks Arab (dengan Harakat)</label>
                    <textarea
                      rows="2"
                      dir="rtl"
                      value={formData.ar}
                      onChange={(e) => setFormData({ ...formData, ar: e.target.value })}
                      placeholder="بِسْمِكَ اللَّهُمَّ..."
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs font-serif font-bold text-right text-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Transliterasi Latin</label>
                    <input
                      type="text"
                      value={formData.tr}
                      onChange={(e) => setFormData({ ...formData, tr: e.target.value })}
                      placeholder="Bismikallāhumma aḥyā..."
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Terjemahan Bahasa Indonesia</label>
                    <textarea
                      rows="2"
                      value={formData.idn}
                      onChange={(e) => setFormData({ ...formData, idn: e.target.value })}
                      placeholder="Dengan nama-Mu ya Allah..."
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Referensi Sumber Hadits (Opsional)</label>
                    <input
                      type="text"
                      value={formData.tentang}
                      onChange={(e) => setFormData({ ...formData, tentang: e.target.value })}
                      placeholder="Contoh: HR. Bukhari no. 6312"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tag Keywords (pisahkan dengan koma)</label>
                    <input
                      type="text"
                      value={formData.tagInput}
                      onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                      placeholder="Contoh: tidur, malam, sebelum tidur"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:brightness-105 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span>{editingItem ? 'Simpan Perubahan' : 'Tambah Doa'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        <HarmonizedDeleteModal
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false)
            setDeleteItem(null)
          }}
          onConfirm={handleConfirmDelete}
          item={deleteItem}
          isSubmitting={isDeleting}
        />

        <HarmonizedDeleteAllModal
          isOpen={isDeleteAllOpen}
          onClose={() => setIsDeleteAllOpen(false)}
          onConfirm={handleConfirmDeleteAll}
          isSubmitting={isDeletingAll}
        />

      </MasterDataPage>
    </PageContainer>
  )
}
