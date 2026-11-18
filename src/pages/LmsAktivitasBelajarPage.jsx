import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  BookOpen,
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
  Eye,
  Clock,
  Layers,
  ListOrdered,
  FileText,
  Tag,
  Check,
  Ban,
  SlidersHorizontal,
} from 'lucide-react'
import Swal from '@/components/ui/compat/swal-heroui'
import { lmsAktivitasBelajarService } from '../services/lmsAktivitasBelajarService'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { useDebounce } from '../hooks/useDebounce'
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
import CsvImportModal from '../components/master-data/CsvImportModal'
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
  }
  const t = tones[tone] || tones.emerald
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={`text-left rounded-2xl border ${t.card} p-5 shadow-xs transition-all hover:shadow-md ${onClick ? 'cursor-pointer' : 'cursor-default'} group`}
    >
      <div className="flex items-center justify-between">
        <p className={`text-xs font-semibold ${t.title}`}>{label}</p>
        <Icon className={`h-4 w-4 ${t.icon} opacity-0 group-hover:opacity-100 transition-opacity`} />
      </div>
      <p className={`mt-2 text-2xl font-extrabold ${t.val}`}>{value ?? 0}</p>
      {subtext && (
        <p className={`mt-1.5 text-[10px] font-bold ${t.sub} flex items-center gap-0.5 truncate`}>
          {subtext}
        </p>
      )}
    </motion.div>
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

export default function LmsAktivitasBelajarPage({ embedded = false, hideBreadcrumb = false, hidePageHeader = false, tabNav = null }) {
  const [dataAktivitas, setDataAktivitas] = useState([])
  const [optionsModulAjar, setOptionsModulAjar] = useState([])
  const [optionsJenis, setOptionsJenis] = useState([
    'Pendahuluan',
    'Inti',
    'Penutup',
    'Diskusi',
    'Kuis',
    'Tugas',
    'Presentasi',
    'Refleksi',
    'Eksperimen',
    'Praktikum',
  ])
  const [stats, setStats] = useState({
    total: 0,
    pendahuluan: 0,
    inti: 0,
    penutup: 0,
    aktif: 0,
    draft: 0,
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
  const [selectedModulAjar, setSelectedModulAjar] = useState('')
  const [selectedJenis, setSelectedJenis] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  })

  const filterModulAjarOptions = useMemo(() => [
    { value: '', label: 'Semua Modul Ajar' },
    ...optionsModulAjar.map((m) => ({ value: String(m.id), label: m.judul_modul })),
  ], [optionsModulAjar])

  const filterJenisOptions = useMemo(() => [
    { value: '', label: 'Semua Jenis' },
    ...optionsJenis.map((j) => ({ value: j, label: j })),
  ], [optionsJenis])

  const filterStatusOptions = useMemo(() => [
    { value: '', label: 'Semua Status' },
    { value: 'aktif', label: 'Aktif' },
    { value: 'draft', label: 'Draft' },
    { value: 'nonaktif', label: 'Nonaktif' },
  ], [])

  const modalModulAjarOptions = useMemo(() => [
    ...optionsModulAjar.map((m) => ({
      value: String(m.id),
      label: m.kode_modul ? `${m.judul_modul} (${m.kode_modul})` : m.judul_modul,
    })),
  ], [optionsModulAjar])

  const modalJenisOptions = useMemo(() => [
    ...optionsJenis.map((j) => ({ value: j, label: j })),
  ], [optionsJenis])

  const modalStatusOptions = useMemo(() => [
    { value: 'aktif', label: 'Aktif' },
    { value: 'draft', label: 'Draft' },
    { value: 'nonaktif', label: 'Nonaktif' },
  ], [])

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [selectedDetail, setSelectedDetail] = useState(null)
  const [editId, setEditId] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  const handleExportCSV = () => {
    const headers = ['NO', 'JUDUL AKTIVITAS', 'JENIS', 'MODUL AJAR', 'DURASI', 'STATUS']
    const rows = (dataAktivitas || []).map((a, i) => [
      i + 1,
      `"${(a.judul_aktivitas || a.nama_aktivitas || '').replace(/"/g, '""')}"`,
      a.jenis_aktivitas || a.jenis || '',
      `"${(a.modul_ajar?.judul_modul || '').replace(/"/g, '""')}"`,
      a.durasi_menit ? `${a.durasi_menit} Menit` : '',
      a.status === 'aktif' ? 'Aktif' : 'Draft',
    ])
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `export_aktivitas_belajar_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImport = async (parsedData) => {
    setSuccessMsg(`Berhasil mengimpor ${parsedData.length} data aktivitas belajar.`)
    fetchDaftarAktivitas()
  }

  const pageActions = (
    <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
      <SquircleActionButton variant="import" label="Import Data" onClick={() => setImportOpen(true)} />
      <SquircleActionButton variant="export" label="Export Data" onClick={handleExportCSV} />
      <SquircleActionButton variant="view" icon={Printer} label="Cetak Data" onClick={() => setIsPrintModalOpen(true)} />
      <SquircleActionButton variant="primary" label="Tambah Aktivitas" onClick={() => handleOpenCreateModal()} />
    </div>
  )

  const [formData, setFormData] = useState({
    modul_ajar_id: '',
    nama_aktivitas: '',
    jenis_aktivitas: 'Inti',
    instruksi: '',
    waktu: 15,
    urutan: 1,
    status: 'aktif',
  })

  useEffect(() => {
    fetchOptions()
    fetchStats()
  }, [])

  useEffect(() => {
    fetchData()
  }, [page, debouncedSearch, selectedModulAjar, selectedJenis, selectedStatus])

  const fetchStats = async () => {
    try {
      const res = await lmsAktivitasBelajarService.getStats()
      if (res.success) {
        setStats(res.data)
      }
    } catch (err) {
      console.error('Gagal mengambil statistik aktivitas:', err)
    }
  }

  const computedStats = useMemo(() => {
    return {
      total: dataAktivitas.length,
      pendahuluan: dataAktivitas.filter((a) => a.jenis_aktivitas === 'Pendahuluan').length,
      inti: dataAktivitas.filter((a) => a.jenis_aktivitas === 'Inti').length,
      penutup: dataAktivitas.filter((a) => a.jenis_aktivitas === 'Penutup' || a.jenis_aktivitas === 'Refleksi').length,
    }
  }, [dataAktivitas])

  const handleOpenKpiModal = (type) => {
    let title = ''
    let items = []

    if (type === 'total') {
      title = 'Total Aktivitas Belajar Terdaftar'
      items = dataAktivitas
    } else if (type === 'pendahuluan') {
      title = 'Daftar Aktivitas Pendahuluan (Orientasi & Apersepsi)'
      items = dataAktivitas.filter((a) => a.jenis_aktivitas === 'Pendahuluan')
    } else if (type === 'inti') {
      title = 'Daftar Aktivitas Kegiatan Inti (Eksplorasi & Praktik)'
      items = dataAktivitas.filter((a) => a.jenis_aktivitas === 'Inti')
    } else if (type === 'penutup') {
      title = 'Daftar Aktivitas Penutup & Refleksi'
      items = dataAktivitas.filter((a) => a.jenis_aktivitas === 'Penutup' || a.jenis_aktivitas === 'Refleksi')
    }

    setKpiModalCategory({ title, items })
    setKpiModalOpen(true)
  }

  const fetchOptions = async () => {
    try {
      const res = await lmsAktivitasBelajarService.getOptions()
      if (res.success) {
        if (res.data.modul_ajar) setOptionsModulAjar(res.data.modul_ajar)
        if (res.data.jenis_aktivitas) setOptionsJenis(res.data.jenis_aktivitas)
      }
    } catch (err) {
      console.error('Gagal mengambil opsi data:', err)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const params = {
        page,
        per_page: 15,
        search: debouncedSearch,
        modul_ajar_id: selectedModulAjar,
        jenis_aktivitas: selectedJenis,
        status: selectedStatus,
      }
      const res = await lmsAktivitasBelajarService.getDaftar(params)
      setDataAktivitas(res.data || [])
      if (res.meta) {
        setPagination({
          current_page: res.meta.current_page,
          last_page: res.meta.last_page,
          total: res.meta.total,
          per_page: res.meta.per_page,
        })
      }
    } catch (err) {
      console.error('Error fetching data aktivitas:', err)
      setErrorMsg('Gagal memuat data aktivitas belajar. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreateModal = () => {
    setEditId(null)
    setFormData({
      modul_ajar_id: optionsModulAjar.length > 0 ? optionsModulAjar[0].id : '',
      nama_aktivitas: '',
      jenis_aktivitas: 'Inti',
      instruksi: '',
      waktu: 15,
      urutan: dataAktivitas.length + 1,
      status: 'aktif',
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (item) => {
    setEditId(item.id)
    setFormData({
      modul_ajar_id: item.modul_ajar_id || '',
      nama_aktivitas: item.nama_aktivitas || '',
      jenis_aktivitas: item.jenis_aktivitas || 'Inti',
      instruksi: item.instruksi || '',
      waktu: item.waktu || 15,
      urutan: item.urutan || 1,
      status: item.status || 'aktif',
    })
    setIsModalOpen(true)
  }

  const handleOpenDetail = (item) => {
    setSelectedDetail(item)
    setIsDetailOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      let res
      if (editId) {
        res = await lmsAktivitasBelajarService.update(editId, formData)
      } else {
        res = await lmsAktivitasBelajarService.create(formData)
      }

      if (res.success) {
        setSuccessMsg(editId ? 'Aktivitas Belajar berhasil diperbarui!' : 'Aktivitas Belajar berhasil dibuat!')
        setIsModalOpen(false)
        fetchData()
        fetchStats()
        setTimeout(() => setSuccessMsg(''), 4000)
      }
    } catch (err) {
      console.error('Error submitting form:', err)
      const errRes = err.response?.data
      if (errRes && errRes.message) {
        setErrorMsg(errRes.message)
      } else {
        setErrorMsg('Terjadi kesalahan saat menyimpan data. Periksa kembali form Anda.')
      }
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id, nama) => {
    const result = await Swal.fire({
      title: 'Hapus Aktivitas Belajar?',
      text: `Apakah Anda yakin ingin menghapus aktivitas "${nama}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0E5C44',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'px-5 py-2.5 rounded-xl text-white font-medium',
        cancelButton: 'px-5 py-2.5 rounded-xl font-medium',
      },
    })

    if (result.isConfirmed) {
      try {
        const res = await lmsAktivitasBelajarService.delete(id)
        if (res.success) {
          Swal.fire({
            title: 'Terhapus!',
            text: 'Aktivitas belajar berhasil dihapus.',
            icon: 'success',
            confirmButtonColor: '#0E5C44',
            customClass: { popup: 'rounded-2xl' },
          })
          fetchData()
          fetchStats()
        }
      } catch (err) {
        console.error('Gagal menghapus aktivitas:', err)
        Swal.fire({
          title: 'Gagal!',
          text: 'Gagal menghapus data aktivitas belajar.',
          icon: 'error',
          confirmButtonColor: '#0E5C44',
        })
      }
    }
  }

  const getJenisBadgeColor = (jenis) => {
    switch (jenis) {
      case 'Pendahuluan':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800'
      case 'Inti':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
      case 'Penutup':
      case 'Refleksi':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800'
      case 'Diskusi':
      case 'Presentasi':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800'
      case 'Kuis':
      case 'Tugas':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800'
      default:
        return 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800'
    }
  }

  return (
    <PageContainer maxW="7xl">
      {!(embedded || hideBreadcrumb) && (
        <AppBreadcrumb items={[{ label: 'LMS & Akademik', href: '/dashboard' }, { label: 'Aktivitas Belajar' }]} />
      )}
      <div className="lms-aktivitas-page space-y-6">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <PrintOptionModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title="Aktivitas Belajar"
          onPrint={() => {
            const rowsToPrint = Array.isArray(dataAktivitas) ? dataAktivitas : []
            printCleanTable({
              title: 'Laporan Data Aktivitas Belajar',
              subtitle: 'Daftar Aktivitas Belajar Sekolah Islam Terpadu',
              headers: ['NO', 'JUDUL AKTIVITAS', 'JENIS', 'MODUL AJAR', 'DURASI', 'STATUS'],
              rows: rowsToPrint.map((row, i) => [
                i + 1,
                row.judul_aktivitas || row.nama_aktivitas || '-',
                row.jenis_aktivitas || row.jenis || '-',
                row.modul_ajar?.judul_modul || '-',
                row.durasi_menit ? `${row.durasi_menit} Menit` : '-',
                row.status === 'aktif' ? 'Aktif' : 'Draft',
              ]),
            })
          }}
          onDownload={() => {
            const rowsToPrint = Array.isArray(dataAktivitas) ? dataAktivitas : []
            downloadPdfTable({
              title: 'Laporan Data Aktivitas Belajar',
              subtitle: 'Daftar Aktivitas Belajar Sekolah Islam Terpadu',
              headers: ['NO', 'JUDUL AKTIVITAS', 'JENIS', 'MODUL AJAR', 'DURASI', 'STATUS'],
              rows: rowsToPrint.map((row, i) => [
                i + 1,
                row.judul_aktivitas || row.nama_aktivitas || '-',
                row.jenis_aktivitas || row.jenis || '-',
                row.modul_ajar?.judul_modul || '-',
                row.durasi_menit ? `${row.durasi_menit} Menit` : '-',
                row.status === 'aktif' ? 'Aktif' : 'Draft',
              ]),
              filename: 'laporan_aktivitas_belajar.pdf',
            })
          }}
        />

        <CsvImportModal
          open={importOpen}
          onClose={() => setImportOpen(false)}
          title="Aktivitas Belajar"
          onImport={handleImport}
          columns={[
            { key: 'modul_ajar_id' },
            { key: 'nama_aktivitas', required: true, example: 'Diskusi Kelompok Fiqih' },
            { key: 'jenis_aktivitas', example: 'Inti' },
            { key: 'durasi_menit', example: '30' },
            { key: 'deskripsi', example: 'Petunjuk aktivitas...' },
            { key: 'status', example: 'aktif' },
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
                  <Activity className="size-6 sm:size-7 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                      <Sparkles className="size-3 text-amber-300 animate-pulse" />
                      LMS — Rencana Aktivitas Belajar
                    </span>
                  </div>
                  <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Aktivitas Belajar
                  </h1>
                  <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 w-full">
                    Kelola alur skenario kegiatan pembelajaran (Pendahuluan, Inti, Penutup, Diskusi, Tugas) terintegrasi Modul Ajar.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <SquircleActionButton
                  variant="primary"
                  icon={Plus}
                  label="Tambah Aktivitas"
                  onClick={handleOpenCreateModal}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Alert Messages */}
      {successMsg && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 shadow-sm dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <span className="text-sm font-medium">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-600 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Cards Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTintedCard
          icon={Activity}
          label="Total Aktivitas"
          value={computedStats.total}
          subtext="Kegiatan Terdaftar"
          tone="emerald"
          onClick={() => handleOpenKpiModal('total')}
        />
        <KpiTintedCard
          icon={Clock}
          label="Pendahuluan"
          value={computedStats.pendahuluan}
          subtext="Orientasi & Apersepsi"
          tone="blue"
          onClick={() => handleOpenKpiModal('pendahuluan')}
        />
        <KpiTintedCard
          icon={Layers}
          label="Kegiatan Inti"
          value={computedStats.inti}
          subtext="Eksplorasi & Praktik"
          tone="emerald"
          onClick={() => handleOpenKpiModal('inti')}
        />
        <KpiTintedCard
          icon={Tag}
          label="Penutup & Refleksi"
          value={computedStats.penutup}
          subtext="Evaluasi & Kesimpulan"
          tone="purple"
          onClick={() => handleOpenKpiModal('penutup')}
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
      <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]" aria-labelledby="aktivitas-table-title">
        {/* Baris 1: Header Judul & Soft Pastel Squircle Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-200/90 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-5 py-4 sm:px-6 md:px-8 dark:border-emerald-800/60 dark:bg-gradient-to-r dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-transparent">
          <div>
            <div className="flex items-center gap-2">
              <h2 id="aktivitas-table-title" className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">Data Aktivitas Belajar</h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/60">
                {pagination.total} Data
              </span>
            </div>
            <p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">Daftar alur skenario kegiatan kelas terpadu per modul ajar.</p>
          </div>
          {pageActions}
        </div>

        {/* Baris 2: Full-Width Search Bar dengan Debounce */}
        <div className="p-3 sm:p-4 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-emerald-950/30 border-b border-emerald-200/80 dark:border-emerald-800/60">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-emerald-600 dark:text-emerald-400" />
            <input
              type="text"
              placeholder="Cari nama aktivitas, instruksi, atau modul..."
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
            value={selectedModulAjar}
            onChange={(val) => {
              setSelectedModulAjar(val)
              setPage(1)
            }}
            options={filterModulAjarOptions}
            placeholder="Semua Modul Ajar"
            icon={BookOpen}
            searchable={true}
            popoverWidth="min-w-[240px]"
          />

          <HeroUiFilterSelect
            value={selectedJenis}
            onChange={(val) => {
              setSelectedJenis(val)
              setPage(1)
            }}
            options={filterJenisOptions}
            placeholder="Semua Jenis"
            icon={Layers}
            popoverWidth="min-w-[180px]"
          />

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

          {(search || selectedModulAjar || selectedJenis || selectedStatus) && (
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setSelectedModulAjar('')
                setSelectedJenis('')
                setSelectedStatus('')
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
                <TableHead className="w-[28%] bg-transparent px-3 py-3.5 font-extrabold text-[11px] uppercase tracking-wider">Nama Aktivitas Belajar</TableHead>
                <TableHead className="hidden w-[14%] bg-transparent px-3 py-3.5 text-center font-extrabold text-[11px] uppercase tracking-wider sm:table-cell">Jenis Kegiatan</TableHead>
                <TableHead className="hidden w-[22%] bg-transparent px-3 py-3.5 font-extrabold text-[11px] uppercase tracking-wider md:table-cell">Modul Ajar</TableHead>
                <TableHead className="hidden w-[10%] bg-transparent px-3 py-3.5 text-center font-extrabold text-[11px] uppercase tracking-wider lg:table-cell">Durasi</TableHead>
                <TableHead className="hidden w-[10%] bg-transparent px-3 py-3.5 text-center font-extrabold text-[11px] uppercase tracking-wider sm:table-cell">Status</TableHead>
                <TableHead className="w-[12%] bg-transparent px-3 py-3.5 text-center font-extrabold text-[11px] uppercase tracking-wider">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-sm">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0E5C44]" />
                    <p className="text-sm">Memuat data aktivitas belajar...</p>
                  </TableCell>
                </TableRow>
              ) : dataAktivitas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-slate-400">
                    <Activity className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="text-base font-semibold text-slate-600 dark:text-slate-300">Tidak ada data aktivitas</p>
                    <p className="text-xs text-slate-400 mt-0.5">Coba ubah kata kunci pencarian atau tambah data baru.</p>
                  </TableCell>
                </TableRow>
              ) : (
                dataAktivitas.map((item, idx) => (
                  <TableRow
                    key={item.id}
                    onClick={() => handleOpenDetail(item)}
                    className="hover:bg-slate-50/90 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                  >
                    <TableCell className="py-3.5 px-5 sm:px-6 md:px-8 text-center font-medium text-slate-400">
                      {(pagination.current_page - 1) * pagination.per_page + idx + 1}
                    </TableCell>
                    <TableCell className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                        #{item.urutan || idx + 1}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-3">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">{item.nama_aktivitas}</p>
                        {item.instruksi ? (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 font-medium">{item.instruksi}</p>
                        ) : (
                          <p className="text-xs text-slate-400 italic mt-0.5">Tanpa instruksi khusus</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden py-3.5 px-3 text-center sm:table-cell">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getJenisBadgeColor(item.jenis_aktivitas)}`}>
                        {item.jenis_aktivitas}
                      </span>
                    </TableCell>
                    <TableCell className="hidden py-3.5 px-3 md:table-cell">
                      {item.modul_ajar ? (
                        <div>
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 line-clamp-1">
                            {item.modul_ajar.judul_modul}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">{item.modul_ajar.kode_modul}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">-</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden py-3.5 px-3 text-center lg:table-cell">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-[#0E5C44]" /> {item.waktu || item.durasi_menit || 0} mnt
                      </span>
                    </TableCell>
                    <TableCell className="hidden py-3.5 px-3 text-center sm:table-cell">
                      {item.status === 'aktif' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <Check className="w-3 h-3" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          Draft
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <ActionDropdown
                        onView={() => handleOpenDetail(item)}
                        onEdit={() => handleOpenEditModal(item)}
                        onDelete={() => handleDelete(item.id, item.nama_aktivitas)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </TableRoot>
        </MasterDataTable>

        {/* Pagination Footer */}
        {pagination.last_page > 1 && (
          <div className="p-4 border-t border-emerald-200/90 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-50/30 via-transparent to-emerald-50/30 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Menampilkan <span className="font-bold text-emerald-700 dark:text-emerald-400">{dataAktivitas.length}</span> dari <span className="font-bold text-slate-900 dark:text-white">{pagination.total}</span> data aktivitas
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                aria-label="Halaman Sebelumnya"
                className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="size-5 text-white" />
              </button>
              <span className="text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800">
                Halaman {pagination.current_page} / {pagination.last_page}
              </span>
              <button
                disabled={page >= pagination.last_page}
                onClick={() => setPage((p) => Math.min(p + 1, pagination.last_page))}
                aria-label="Halaman Selanjutnya"
                className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="size-5 text-white" />
              </button>
            </div>
          </div>
        )}
      </section>
      </motion.div>

      {/* KPI DETAIL MODAL */}
      {kpiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#1B2433] w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-gradient-to-r from-[#0E5C44] to-[#1E8E5A] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                  <Activity className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{kpiModalCategory.title}</h3>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    Menampilkan {kpiModalCategory.items.length} aktivitas terdaftar
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
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-semibold text-sm">Tidak ada data aktivitas dalam kategori ini.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <TableRoot className="w-full text-left border-collapse">
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <TableHead className="py-3 px-4 text-center w-12">No</TableHead>
                        <TableHead className="py-3 px-4">Nama Aktivitas</TableHead>
                        <TableHead className="py-3 px-4">Jenis</TableHead>
                        <TableHead className="py-3 px-4">Modul Ajar</TableHead>
                        <TableHead className="py-3 px-4 text-center">Waktu</TableHead>
                        <TableHead className="py-3 px-4 text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                      {kpiModalCategory.items.map((item, idx) => (
                        <TableRow key={item.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                          <TableCell className="py-3 px-4 text-center text-slate-400 text-xs font-medium">{idx + 1}</TableCell>
                          <TableCell className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">{item.nama_aktivitas}</TableCell>
                          <TableCell className="py-3 px-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${getJenisBadgeColor(item.jenis_aktivitas)}`}>
                              {item.jenis_aktivitas}
                            </span>
                          </TableCell>
                          <TableCell className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                            {item.modul_ajar?.judul_modul || '-'}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-center text-xs font-semibold text-slate-700 dark:text-slate-200">
                            {item.waktu} mnt
                          </TableCell>
                          <TableCell className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setKpiModalOpen(false)
                                handleOpenDetail(item)
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

      {/* Modal Form Tambah / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#1B2433] rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#0E5C44] dark:text-emerald-400 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editId ? 'Edit Aktivitas Belajar' : 'Tambah Aktivitas Belajar'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Isi kelengkapan data alur skenario pembelajaran</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Modul Ajar Dropdown */}
              <div>
                <HeroUiModalSelect
                  label="Modul Ajar"
                  required
                  icon={BookOpen}
                  searchable={true}
                  placeholder="-- Pilih Modul Ajar --"
                  value={formData.modul_ajar_id}
                  onChange={(val) => setFormData({ ...formData, modul_ajar_id: val })}
                  options={modalModulAjarOptions}
                />
              </div>

              {/* Nama Aktivitas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Nama Aktivitas Belajar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Eksplorasi Konsep & Studi Kasus Kelompok"
                  value={formData.nama_aktivitas}
                  onChange={(e) => setFormData({ ...formData, nama_aktivitas: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#111827] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 focus:border-[#0E5C44]"
                />
              </div>

              {/* Jenis Aktivitas & Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <HeroUiModalSelect
                    label="Jenis Kegiatan"
                    required
                    icon={Layers}
                    placeholder="-- Pilih Jenis Kegiatan --"
                    value={formData.jenis_aktivitas}
                    onChange={(val) => setFormData({ ...formData, jenis_aktivitas: val })}
                    options={modalJenisOptions}
                  />
                </div>

                <div>
                  <HeroUiModalSelect
                    label="Status Aktivitas"
                    required
                    placeholder="-- Pilih Status --"
                    value={formData.status}
                    onChange={(val) => setFormData({ ...formData, status: val })}
                    options={modalStatusOptions}
                  />
                </div>
              </div>

              {/* Waktu & Urutan Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Alokasi Waktu (Menit) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="600"
                      required
                      value={formData.waktu}
                      onChange={(e) => setFormData({ ...formData, waktu: parseInt(e.target.value) || 1 })}
                      className="w-full pl-3.5 pr-12 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#111827] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 focus:border-[#0E5C44]"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">menit</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Nomor Urut <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.urutan}
                    onChange={(e) => setFormData({ ...formData, urutan: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#111827] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 focus:border-[#0E5C44]"
                  />
                </div>
              </div>

              {/* Instruksi Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Instruksi / Langkah Kegiatan
                </label>
                <textarea
                  rows="4"
                  placeholder="Tuliskan petunjuk teknis atau instruksi detail bagi guru/siswa dalam aktivitas ini..."
                  value={formData.instruksi}
                  onChange={(e) => setFormData({ ...formData, instruksi: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#111827] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 focus:border-[#0E5C44]"
                ></textarea>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0E5C44] text-white font-semibold text-sm shadow-md hover:bg-[#1E8E5A] disabled:opacity-50 transition-all duration-200"
                >
                  {formLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : editId ? 'Simpan Perubahan' : 'Tambah Aktivitas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail View */}
      {isDetailOpen && selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#1B2433] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#0E5C44]" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Detail Aktivitas Belajar</h3>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getJenisBadgeColor(selectedDetail.jenis_aktivitas)}`}>
                  {selectedDetail.jenis_aktivitas}
                </span>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-2">{selectedDetail.nama_aktivitas}</h4>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#111827] text-xs">
                <div>
                  <span className="text-slate-400 block">Modul Ajar:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedDetail.modul_ajar?.judul_modul || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Alokasi Waktu:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedDetail.waktu} menit</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Nomor Urutan:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Urutan ke-{selectedDetail.urutan}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Status:</span>
                  <span className="font-semibold capitalize text-emerald-600 dark:text-emerald-400">{selectedDetail.status}</span>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Instruksi Kegiatan:</h5>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                  {selectedDetail.instruksi || 'Tidak ada instruksi khusus.'}
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </motion.div>
      </div>
    </PageContainer>
  )
}
