import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Eye,
  Phone,
  MessageSquare,
  GraduationCap,
  MapPin,
  Calendar,
  Layers,
  HeartHandshake,
} from 'lucide-react'
import { Modal } from './ui/modal'
import { Skeleton } from './ui/skeleton'
import { EmptyState } from './ui/empty-state'
import { SquircleActionButton } from './master-data'
import { managementDashboardService } from '../services/managementDashboardService'

const MODAL_CONFIG = {
  total_siswa: {
    title: 'Total Siswa Aktif',
    subtitle: 'Daftar siswa aktif dengan rincian kelas & data orang tua/wali',
    icon: Users,
    summaryKeys: ['total', 'laki_laki', 'perempuan'],
    summaryLabels: { total: 'Total', laki_laki: 'Laki-laki', perempuan: 'Perempuan' },
    columns: [
      { key: 'nama', label: 'Nama Siswa' },
      { key: 'nis', label: 'NIS / NISN' },
      { key: 'kelas', label: 'Kelas / Rombel' },
      { key: 'orang_tua', label: 'Orang Tua / Wali' },
      { key: 'status', label: 'Status' },
    ],
  },
  total_pegawai: {
    title: 'Total Pegawai & Guru',
    subtitle: 'Daftar SDM beserta perbandingan jenis kelamin',
    icon: UserCheck,
    summaryKeys: ['total', 'laki_laki', 'perempuan'],
    summaryLabels: { total: 'Total', laki_laki: 'Laki-laki', perempuan: 'Perempuan' },
    columns: [
      { key: 'nama', label: 'Nama Pegawai' },
      { key: 'niy', label: 'NIY' },
      { key: 'nik', label: 'NIK' },
      { key: 'jenis_kelamin', label: 'Jenis Kelamin' },
      { key: 'jabatan', label: 'Jabatan' },
      { key: 'unit', label: 'Unit' },
    ],
  },
  absensi_hari_ini: {
    title: 'Absensi Terverifikasi Hari Ini',
    subtitle: 'Rekap presensi gerbang siswa dan pegawai',
    icon: CheckCircle2,
    tabs: [
      { id: 'siswa_hadir', label: 'Siswa Hadir' },
      { id: 'siswa_belum_absen', label: 'Belum Absen' },
      { id: 'pegawai', label: 'Guru Hadir' },
    ],
    summaryKeys: ['total_verified', 'siswa_hadir', 'siswa_belum_absen', 'pegawai_hadir'],
    summaryLabels: {
      total_verified: 'Total Terverifikasi',
      siswa_hadir: 'Siswa Hadir',
      siswa_belum_absen: 'Belum Absen',
      pegawai_hadir: 'Guru Hadir',
    },
    columnsByTab: {
      siswa_hadir: [
        { key: 'nama', label: 'Nama Siswa' },
        { key: 'nis', label: 'NIS' },
        { key: 'kelas', label: 'Kelas' },
        { key: 'unit', label: 'Unit' },
        { key: 'status', label: 'Status' },
        { key: 'jam_masuk', label: 'Jam Masuk' },
      ],
      siswa_belum_absen: [
        { key: 'nama', label: 'Nama Siswa' },
        { key: 'nis', label: 'NIS' },
        { key: 'kelas', label: 'Kelas' },
        { key: 'unit', label: 'Unit' },
        { key: 'jenis_kelamin', label: 'Jenis Kelamin' },
        { key: 'status', label: 'Status' },
      ],
      pegawai: [
        { key: 'nama', label: 'Nama Pegawai' },
        { key: 'niy', label: 'NIY' },
        { key: 'jabatan', label: 'Jabatan' },
        { key: 'unit', label: 'Unit' },
        { key: 'status', label: 'Status' },
        { key: 'jam_masuk', label: 'Jam Masuk' },
      ],
    },
  },
  siswa_incomplete: {
    title: 'Siswa Belum Lengkap',
    subtitle: 'Data siswa yang masih perlu dilengkapi (NISN, Tgl Lahir, Wali Murid)',
    icon: AlertTriangle,
    summaryKeys: ['total'],
    summaryLabels: { total: 'Total Perlu Diisi' },
    columns: [
      { key: 'nama', label: 'Nama Siswa' },
      { key: 'nis', label: 'NIS' },
      { key: 'nisn', label: 'NISN' },
      { key: 'kelas', label: 'Kelas' },
      { key: 'keterangan', label: 'Data Kurang' },
    ],
  },
  pegawai_incomplete: {
    title: 'Pegawai Belum Lengkap',
    subtitle: 'Data pegawai yang NIY atau NIK belum terisi',
    icon: AlertTriangle,
    summaryKeys: ['total'],
    summaryLabels: { total: 'Total Perlu Diisi' },
    columns: [
      { key: 'nama', label: 'Nama Pegawai' },
      { key: 'niy', label: 'NIY' },
      { key: 'nik', label: 'NIK' },
      { key: 'jabatan', label: 'Jabatan' },
      { key: 'keterangan', label: 'Data Kurang' },
    ],
  },
}

// ── HEROUI FILTER BAR SELECT DROPDOWN COMPONENT ──
function HeroUiFilterSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Pilih...',
  icon: IconComponent = null,
  className = '',
  popoverWidth = 'w-full',
  searchable = false,
  ariaLabel = '',
  disabled = false,
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
      (opt.label && String(opt.label).toLowerCase().includes(q)) ||
      (opt.subtext && String(opt.subtext).toLowerCase().includes(q))
    )
  }, [options, search, searchable])

  const hasValue = value !== '' && value !== 'semua' && value !== 'all' && value !== undefined && value !== null

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev)
            setSearch('')
          }
        }}
        className={`h-9 w-full flex items-center justify-between gap-2 rounded-xl border px-3 text-xs font-semibold transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
          isOpen
            ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 dark:border-emerald-400 dark:bg-slate-800 dark:ring-emerald-400/20 text-slate-900 dark:text-white shadow-xs'
            : hasValue
            ? 'border-emerald-400/80 bg-emerald-50/80 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200 font-bold'
            : 'border-slate-300 dark:border-slate-700 bg-white text-slate-700 hover:border-emerald-400 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
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
            className={`absolute left-0 top-full mt-1.5 z-[90] ${popoverWidth} min-w-[200px] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 shadow-xl shadow-slate-900/10 dark:shadow-black/40`}
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
                      <div className="truncate pr-2">
                        <div className="truncate">{opt.label}</div>
                        {opt.subtext && (
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal truncate mt-0.5">
                            {opt.subtext}
                          </div>
                        )}
                      </div>
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

function SummaryPills({ summary, keys, labels }) {
  if (!summary) return null

  const colors = {
    total: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    laki_laki: 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
    perempuan: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
    total_verified: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    siswa_hadir: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    siswa_belum_absen: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    pegawai_hadir: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300',
  }

  return (
    <div className="flex flex-wrap gap-2">
      {keys.map((key) => (
        <div
          key={key}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold ${colors[key] || colors.total}`}
        >
          <span className="font-medium opacity-80">{labels[key]}:</span>
          <span>{Number(summary[key] ?? 0).toLocaleString('id-ID')}</span>
        </div>
      ))}
    </div>
  )
}

SummaryPills.propTypes = {
  summary: PropTypes.object,
  keys: PropTypes.arrayOf(PropTypes.string).isRequired,
  labels: PropTypes.object.isRequired,
}

export default function TataUsahaKpiModal({ type, isOpen, onClose, initialTab = null, unitName = null }) {
  const navigate = useNavigate()
  const config = MODAL_CONFIG[type]
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [items, setItems] = useState([])
  const [summary, setSummary] = useState(null)
  const [meta, setMeta] = useState({})
  const [search, setSearch] = useState('')
  const [parentSearch, setParentSearch] = useState('')
  const [selectedKelasId, setSelectedKelasId] = useState('all')
  const [availableClasses, setAvailableClasses] = useState([])
  const [availableParents, setAvailableParents] = useState([])
  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] = useState(initialTab || 'siswa_hadir')
  const [selectedStudent, setSelectedStudent] = useState(null)

  useEffect(() => {
    if (initialTab && type === 'absensi_hari_ini') {
      setActiveTab(initialTab)
    }
  }, [initialTab, type, isOpen])

  const fetchData = useCallback(async () => {
    if (!config || !type) return
    setLoading(true)
    setError(null)
    try {
      const res = await managementDashboardService.getTataUsahaKpiDetail(type, {
        search: search || undefined,
        parent_search: parentSearch || undefined,
        kelas_id: selectedKelasId !== 'all' ? selectedKelasId : undefined,
        page,
        per_page: 50,
        ...(type === 'absensi_hari_ini' ? { tab: activeTab } : {}),
      })
      const payload = res?.data || {}
      setItems(payload.items || [])
      setSummary(payload.summary || null)
      setMeta(payload.meta || {})
      if (Array.isArray(payload.available_classes)) {
        setAvailableClasses(payload.available_classes)
      }
      if (Array.isArray(payload.available_parents)) {
        setAvailableParents(payload.available_parents)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat detail KPI.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [config, type, search, parentSearch, selectedKelasId, page, activeTab])

  useEffect(() => {
    if (isOpen && type) {
      fetchData()
    } else {
      setItems([])
      setSummary(null)
      setMeta({})
      setSearch('')
      setParentSearch('')
      setSelectedKelasId('all')
      setAvailableClasses([])
      setAvailableParents([])
      setPage(1)
      setActiveTab(initialTab || 'siswa_hadir')
      setSelectedStudent(null)
      setError(null)
    }
  }, [isOpen, type, fetchData, initialTab])

  useEffect(() => {
    if (isOpen) setPage(1)
  }, [search, parentSearch, selectedKelasId, activeTab, isOpen])

  if (!isOpen || !config) return null

  const IconComponent = config.icon || Users
  const columns = type === 'absensi_hari_ini'
    ? config.columnsByTab[activeTab]
    : config.columns

  const handleOpenWhatsApp = (phone) => {
    if (!phone || phone === '-' || phone.trim() === '') return
    let cleaned = phone.replace(/[^0-9]/g, '')
    if (cleaned.startsWith('0')) cleaned = '62' + cleaned.slice(1)
    window.open(`https://wa.me/${cleaned}`, '_blank')
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        maxWidth="max-w-4xl"
        title={
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-sm border border-emerald-500/20">
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                  {config.title}
                </h3>
                {unitName && (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60">
                    {unitName}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium dark:text-slate-400">
                {unitName ? `Khusus Unit ${unitName} · ` : ''}{config.subtitle}
              </p>
            </div>
          </div>
        }
        footer={
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500 font-medium">
              Menampilkan <span className="font-bold text-slate-800 dark:text-white">{items.length}</span>
              {meta.total != null && (
                <> dari <span className="font-bold text-slate-800 dark:text-white">{meta.total}</span> data</>
              )}
            </p>
            <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
              <SquircleActionButton
                variant="neutral"
                icon={X}
                label="Tutup"
                onClick={onClose}
              />
              <SquircleActionButton
                variant="restore"
                icon={RefreshCw}
                label="Segarkan"
                onClick={fetchData}
                disabled={loading}
                className={loading ? 'opacity-70' : ''}
              />
            </div>
          </div>
        }
      >
        <div className="space-y-4 p-5">
          <SummaryPills summary={summary} keys={config.summaryKeys} labels={config.summaryLabels} />

          {/* Absensi Tab Switcher */}
          {config.tabs && (
            <div
              role="tablist"
              aria-label="Filter kategori absensi"
              className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-50/50 p-1.5 dark:border-emerald-800/40 dark:bg-emerald-950/30 overflow-x-auto no-scrollbar max-w-full"
            >
              {config.tabs.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-xl px-4 py-2 text-xs font-extrabold whitespace-nowrap transition-all duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25 border border-emerald-400/40 scale-[1.01]'
                        : 'border border-transparent bg-white/80 text-slate-600 hover:bg-emerald-100/80 hover:text-emerald-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 font-bold'
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
          )}

          {/* TOTAL SISWA: Dropdown Filter Bar (Kelas & Orang Tua) */}
          {type === 'total_siswa' && (
            <div className="space-y-3 rounded-2xl border border-emerald-500/20 bg-emerald-50/40 p-4 dark:border-emerald-800/40 dark:bg-emerald-950/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* 1. Dropdown Kelas / Rombel */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1.5">
                    <Layers className="h-3.5 w-3.5" />
                    Filter Kelas / Rombel:
                  </label>
                  <HeroUiFilterSelect
                    value={selectedKelasId}
                    onChange={(val) => {
                      setSelectedKelasId(val)
                      setParentSearch('')
                    }}
                    options={[
                      { value: 'all', label: 'Semua Kelas & Rombel' },
                      ...availableClasses.map((cls) => ({
                        value: String(cls.id),
                        label: cls.nama_kelas,
                        subtext: cls.tingkat ? `Tingkat ${cls.tingkat}` : undefined,
                      })),
                    ]}
                    placeholder="Semua Kelas & Rombel"
                    icon={Layers}
                    searchable={availableClasses.length > 5}
                    ariaLabel="Filter Kelas atau Rombel"
                  />
                </div>

                {/* 2. Dropdown Nama Orang Tua dari Rombel */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-teal-800 dark:text-teal-300 mb-1.5">
                    <HeartHandshake className="h-3.5 w-3.5" />
                    Filter Nama Orang Tua / Wali:
                  </label>
                  <HeroUiFilterSelect
                    value={parentSearch}
                    onChange={(val) => setParentSearch(val)}
                    options={[
                      { value: '', label: `Semua Orang Tua (${availableParents.length} terdata)` },
                      ...availableParents.map((pName) => ({
                        value: pName,
                        label: pName,
                      })),
                    ]}
                    placeholder="Semua Orang Tua / Wali"
                    icon={HeartHandshake}
                    searchable={availableParents.length > 5}
                    ariaLabel="Filter Orang Tua atau Wali"
                  />
                </div>
              </div>

              {/* Search Siswa & Reset Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari spesifik nama siswa / NIS..."
                    className="w-full rounded-xl border border-emerald-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-emerald-600 dark:border-emerald-800 dark:bg-slate-900 dark:text-white"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {(selectedKelasId !== 'all' || parentSearch !== '') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedKelasId('all')
                      setParentSearch('')
                    }}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-emerald-100/90 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-200 transition-all dark:bg-emerald-950/60 dark:text-emerald-300"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Reset Filter Dropdown
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Standard search for other types */}
          {type !== 'total_siswa' && (
            <div className="relative rounded-2xl border border-emerald-500/20 bg-white p-3 shadow-xs dark:border-emerald-800/40 dark:bg-slate-900">
              <Search className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, NIS, NIY..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-emerald-600 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          )}

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <EmptyState title="Gagal memuat data" description={error} />
          ) : items.length === 0 ? (
            <EmptyState title="Tidak ada data" description="Belum ada record yang sesuai filter pencarian." />
          ) : (
            <div className="overflow-x-auto rounded-2xl border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#13221f]">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead className="bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-extrabold uppercase tracking-wider text-white border-b border-emerald-700">
                  <tr>
                    <th className="px-4 py-3.5 w-12 text-center text-white font-extrabold">No</th>
                    {columns.map((col) => (
                      <th key={col.key} className="px-4 py-3.5 text-white font-extrabold">{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((row, idx) => (
                    <tr
                      key={row.id || idx}
                      onClick={() => type === 'total_siswa' && setSelectedStudent(row)}
                      className={`transition-colors ${
                        type === 'total_siswa'
                          ? 'cursor-pointer hover:bg-emerald-50/80 dark:hover:bg-emerald-950/50'
                          : 'hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40'
                      }`}
                      title={type === 'total_siswa' ? 'Klik baris ini untuk melihat rincian siswa & orang tua' : undefined}
                    >
                      <td className="px-4 py-3.5 text-center text-xs font-bold text-slate-400">
                        {((meta.current_page || 1) - 1) * (meta.per_page || 50) + idx + 1}
                      </td>

                      {type === 'total_siswa' ? (
                        <>
                          <td className="px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white min-w-[180px]">
                            <div className="font-extrabold text-slate-900 dark:text-white leading-snug">
                              {row.nama}
                            </div>
                            <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                              {row.jenis_kelamin || '-'} {row.unit ? `• ${row.unit}` : ''}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-[130px]">
                            <div className="font-bold text-slate-800 dark:text-slate-200">NIS: {row.nis || '-'}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">NISN: {row.nisn || '-'}</div>
                          </td>
                          <td className="px-4 py-3.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 min-w-[130px]">
                            <span className="inline-block bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg px-2.5 py-1 text-xs">
                              {row.kelas}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-slate-700 dark:text-slate-300 min-w-[190px]">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {row.orang_tua?.nama || row.orang_tua?.nama_ayah || '-'}
                            </div>
                            {row.orang_tua?.no_hp && row.orang_tua.no_hp !== '-' ? (
                              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                                <span>📞</span> {row.orang_tua.no_hp}
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-400 mt-0.5">Belum ada no. telepon</div>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-xs min-w-[90px]">
                            <span className={`inline-flex rounded-lg px-2.5 py-1 text-[11px] font-extrabold ${
                              row.status === 'Aktif'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                        </>
                      ) : (
                        columns.map((col) => (
                          <td key={col.key} className="px-4 py-3.5 text-xs font-medium text-slate-700 dark:text-slate-200">
                            {row[col.key] ?? '-'}
                          </td>
                        ))
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {meta.last_page > 1 && (
            <div className="flex items-center justify-between pt-2">
              <SquircleActionButton
                variant="neutral"
                icon={ChevronLeft}
                label="Sebelumnya"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
              />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                {page} / {meta.last_page}
              </span>
              <SquircleActionButton
                variant="neutral"
                icon={ChevronRight}
                label="Selanjutnya"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= meta.last_page}
              />
            </div>
          )}
        </div>
      </Modal>

      {/* DETAIL MODAL SISWA & ORANG TUA */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          maxWidth="max-w-xl"
          footer={null}
          title={
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                  {selectedStudent.nama}
                </h3>
                <p className="text-xs text-slate-500 font-medium dark:text-slate-400">
                  NIS: {selectedStudent.nis || '-'} • Kelas: {selectedStudent.kelas || '-'}
                </p>
              </div>
            </div>
          }
        >
          <div className="space-y-4 p-5">
            {/* Bagian 1: Data Identitas Siswa */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/40 p-4 dark:border-emerald-800/40 dark:bg-emerald-950/20">
              <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 pb-2 border-b border-emerald-500/20">
                <Users className="h-4 w-4" />
                Data Pribadi Siswa
              </h4>
              <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
                <div>
                  <span className="block font-medium text-slate-400">Jenis Kelamin</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{selectedStudent.jenis_kelamin || '-'}</span>
                </div>
                <div>
                  <span className="block font-medium text-slate-400">NISN</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{selectedStudent.nisn || '-'}</span>
                </div>
                <div className="col-span-2">
                  <span className="block font-medium text-slate-400">Tempat, Tanggal Lahir</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {selectedStudent.tempat_lahir || '-'}, {selectedStudent.tanggal_lahir || '-'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="block font-medium text-slate-400">Alamat Domisili Siswa</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{selectedStudent.alamat || '-'}</span>
                </div>
              </div>
            </div>

            {/* Bagian 2: Data Orang Tua / Wali */}
            <div className="rounded-2xl border border-teal-500/20 bg-teal-50/40 p-4 dark:border-teal-800/40 dark:bg-teal-950/20">
              <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-teal-800 dark:text-teal-300 pb-2 border-b border-teal-500/20">
                <HeartHandshake className="h-4 w-4" />
                Data Orang Tua & Wali
              </h4>
              <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
                <div>
                  <span className="block font-medium text-slate-400">Nama Ayah</span>
                  <span className="font-black text-slate-900 dark:text-white">
                    {selectedStudent.orang_tua?.nama_ayah || '-'}
                  </span>
                  {selectedStudent.orang_tua?.pekerjaan_ayah && selectedStudent.orang_tua.pekerjaan_ayah !== '-' && (
                    <span className="block text-[11px] text-slate-500">Pekerjaan: {selectedStudent.orang_tua.pekerjaan_ayah}</span>
                  )}
                </div>
                <div>
                  <span className="block font-medium text-slate-400">Nama Ibu</span>
                  <span className="font-black text-slate-900 dark:text-white">
                    {selectedStudent.orang_tua?.nama_ibu || '-'}
                  </span>
                  {selectedStudent.orang_tua?.pekerjaan_ibu && selectedStudent.orang_tua.pekerjaan_ibu !== '-' && (
                    <span className="block text-[11px] text-slate-500">Pekerjaan: {selectedStudent.orang_tua.pekerjaan_ibu}</span>
                  )}
                </div>
                {selectedStudent.orang_tua?.nama_wali && selectedStudent.orang_tua.nama_wali !== '-' && (
                  <div className="col-span-2">
                    <span className="block font-medium text-slate-400">Nama Wali</span>
                    <span className="font-black text-slate-900 dark:text-white">{selectedStudent.orang_tua.nama_wali}</span>
                    {selectedStudent.orang_tua?.pekerjaan_wali && selectedStudent.orang_tua.pekerjaan_wali !== '-' && (
                      <span className="block text-[11px] text-slate-500">Pekerjaan: {selectedStudent.orang_tua.pekerjaan_wali}</span>
                    )}
                  </div>
                )}
                <div className="col-span-2">
                  <span className="block font-medium text-slate-400">Alamat Orang Tua</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {selectedStudent.orang_tua?.alamat || selectedStudent.alamat || '-'}
                  </span>
                </div>
              </div>

              {/* Fast Communication Action */}
              <div className="mt-4 pt-3 border-t border-teal-500/20 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-bold text-teal-800 dark:text-teal-300">
                  Kontak: {selectedStudent.orang_tua?.no_hp || '-'}
                </div>
                <div className="flex items-center flex-wrap gap-2">
                  {/* Chat Langsung via Aplikasi Internal */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudent(null)
                      onClose()
                      navigate('/dashboard/chat-pegawai?mode=teacher', {
                        state: {
                          studentId: selectedStudent.id,
                          studentName: selectedStudent.nama,
                          parentId: selectedStudent.orang_tua?.user_id,
                          parentName:
                            selectedStudent.orang_tua?.nama_ayah ||
                            selectedStudent.orang_tua?.nama_ibu ||
                            selectedStudent.orang_tua?.nama_wali ||
                            'Orang Tua / Wali',
                        },
                      })
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1.5 text-xs font-bold text-white hover:from-emerald-700 hover:to-teal-700 shadow-sm transition-all cursor-pointer"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Chat via Aplikasi
                  </button>

                  {selectedStudent.orang_tua?.no_hp && selectedStudent.orang_tua.no_hp !== '-' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenWhatsApp(selectedStudent.orang_tua.no_hp)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition-all cursor-pointer"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        WhatsApp
                      </button>
                      <a
                        href={`tel:${selectedStudent.orang_tua.no_hp.replace(/[^0-9+]/g, '')}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 border border-blue-200 transition-all dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Telepon
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

TataUsahaKpiModal.propTypes = {
  type: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}
