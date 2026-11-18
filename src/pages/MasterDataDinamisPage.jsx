import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sliders,
  Sparkles,
  Search,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Hash,
  Layers,
  FileCode,
  Tag,
  ArrowUpDown,
  RefreshCw,
  Eye,
  Settings2,
  Save,
  X,
  AlertTriangle,
  BookOpen,
  School,
  Check,
  ChevronDown,
} from 'lucide-react'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppTabs from '../components/app/AppTabs'
import { businessOptionService } from '../services/businessOptionService'
import { codeGeneratorService } from '../services/codeGeneratorService'
import { educationUnitService } from '../services/educationUnitService'
import { useAuthStore } from '../stores/authStore'
import { hasRoleLevel, ROLE_LEVELS, isFoundationUser } from '../auth/portalResolver'
import { SmartScrollFab } from '../components/common'
import Swal from '../components/ui/compat/swal-heroui'
import {
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui/table'

const PRESET_GROUPS = [
  { key: 'parent_occupation', label: 'Pekerjaan Orang Tua / Wali' },
  { key: 'residence_type', label: 'Jenis Tempat Tinggal' },
  { key: 'last_education', label: 'Pendidikan Terakhir' },
  { key: 'marital_status', label: 'Status Pernikahan Wali' },
  { key: 'education_level', label: 'Jenjang Pendidikan' },
  { key: 'student_status', label: 'Status Siswa' },
  { key: 'employee_status', label: 'Status Pegawai' },
  { key: 'alumni_status', label: 'Kategori Alumni' },
]

const ENTITY_TYPE_LABELS = {
  student_nis: 'Nomor Induk Siswa (NIS)',
  employee_niy: 'Nomor Induk Yayasan (NIY)',
  class_code: 'Kode Rombongan Belajar (Kelas)',
  subject_code: 'Kode Mata Pelajaran',
  position_code: 'Kode Jabatan Pegawai',
  modul_code: 'Kode Modul Ajar Semester',
  document_number: 'Nomor Surat / Dokumen Resmi',
  curriculum_code: 'Kode Kurikulum',
  permit_number: 'Nomor Izin Asrama / Santri',
  certificate_number: 'Nomor Sertifikat / Ijazah',
  unit_code: 'Kode Unit Pendidikan',
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
        className={`h-9.5 w-full flex items-center justify-between gap-2 rounded-xl border px-3 text-xs font-semibold transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
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

export default function MasterDataDinamisPage() {
  const user = useAuthStore((state) => state.user)
  const isFoundation = isFoundationUser(user)
  const canManage = !isFoundation && hasRoleLevel(user, ROLE_LEVELS.OPERATOR)

  const [activeTab, setActiveTab] = useState('options') // 'options' | 'generator'
  
  // ── Tab 1: Business Options States ──
  const [options, setOptions] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)
  
  // Modal Business Option Form
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false)
  const [editingOption, setEditingOption] = useState(null)
  const [optionForm, setOptionForm] = useState({
    group: 'parent_occupation',
    custom_group: '',
    name: '',
    code: '',
    order: 0,
    is_active: true,
    description: '',
  })
  const [isSubmittingOption, setIsSubmittingOption] = useState(false)

  // ── Tab 2: Code Generator States ──
  const [generatorConfigs, setGeneratorConfigs] = useState([])
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(false)
  const [units, setUnits] = useState([])

  // Modal Generator Config Form
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState(null)
  const [configForm, setConfigForm] = useState({
    entity_type: 'student_nis',
    prefix: '',
    separator: '',
    padding_length: 4,
    format_pattern: '{YEAR}{UNIT_CODE}{SEQUENCE}',
    is_active: true,
  })
  const [isSubmittingConfig, setIsSubmittingConfig] = useState(false)

  // Live Generator Tester
  const [testEntity, setTestEntity] = useState('student_nis')
  const [testUnitId, setTestUnitId] = useState('')
  const [testExtra, setTestExtra] = useState('')
  const [livePreviewCode, setLivePreviewCode] = useState('')
  const [isTestingCode, setIsTestingCode] = useState(false)

  const groupFilterOptions = useMemo(() => [
    { value: '', label: '-- Semua Kelompok / Grup --' },
    ...PRESET_GROUPS.map((g) => ({
      value: g.key,
      label: g.label,
      subtext: g.key,
    })),
  ], [])

  const entityTypeOptions = useMemo(() => {
    return Object.entries(ENTITY_TYPE_LABELS).map(([k, v]) => ({
      value: k,
      label: v,
    }))
  }, [])

  const unitTestOptions = useMemo(() => [
    { value: '', label: '-- Semua Unit / Tanpa Unit --' },
    ...units.map((u) => ({
      value: String(u.id),
      label: `${u.name} (${u.code || u.level})`,
    })),
  ], [units])

  const optionModalGroupOptions = useMemo(() => [
    ...PRESET_GROUPS.map((g) => ({
      value: g.key,
      label: g.label,
      subtext: g.key,
    })),
    { value: '__custom__', label: '+ Kelompok Kustom Baru' },
  ], [])

  // ── Fetch Options ──
  const fetchOptions = async () => {
    setIsLoadingOptions(true)
    try {
      const res = await businessOptionService.getAll({
        group: selectedGroup || undefined,
        search: searchQuery || undefined,
        per_page: 100,
      })
      if (res?.data && Array.isArray(res.data)) {
        setOptions(res.data)
      } else if (Array.isArray(res)) {
        setOptions(res)
      } else {
        setOptions([])
      }
    } catch (err) {
      console.error('Gagal memuat opsi bisnis', err)
      setOptions([])
    } finally {
      setIsLoadingOptions(false)
    }
  }

  // ── Fetch Generator Configs ──
  const fetchGeneratorConfigs = async () => {
    setIsLoadingConfigs(true)
    try {
      const res = await codeGeneratorService.getConfigs()
      setGeneratorConfigs(Array.isArray(res) ? res : [])
    } catch (err) {
      console.error('Gagal memuat konfigurasi generator', err)
      setGeneratorConfigs([])
    } finally {
      setIsLoadingConfigs(false)
    }
  }

  // ── Fetch Education Units ──
  useEffect(() => {
    educationUnitService.getAll()
      .then(res => {
        if (res?.data && Array.isArray(res.data)) setUnits(res.data)
        else if (Array.isArray(res)) setUnits(res)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (activeTab === 'options') {
      fetchOptions()
    } else {
      fetchGeneratorConfigs()
    }
  }, [activeTab, selectedGroup])

  // Handle Option Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'options') {
        fetchOptions()
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // ── Option Handlers ──
  const handleOpenAddOption = () => {
    if (!canManage) return
    setEditingOption(null)
    setOptionForm({
      group: selectedGroup || 'parent_occupation',
      custom_group: '',
      name: '',
      code: '',
      order: options.length + 1,
      is_active: true,
      description: '',
    })
    setIsOptionModalOpen(true)
  }

  const handleOpenEditOption = (item) => {
    if (!canManage) return
    setEditingOption(item)
    const isPreset = PRESET_GROUPS.some(g => g.key === item.group)
    setOptionForm({
      group: isPreset ? item.group : '__custom__',
      custom_group: isPreset ? '' : item.group,
      name: item.name || '',
      code: item.code || '',
      order: item.order || 0,
      is_active: item.is_active ?? true,
      description: item.description || '',
    })
    setIsOptionModalOpen(true)
  }

  const handleSaveOption = async (e) => {
    e.preventDefault()
    if (!canManage) return
    const targetGroup = optionForm.group === '__custom__' ? optionForm.custom_group.trim() : optionForm.group
    if (!targetGroup) {
      Swal.fire('Validasi Gagal', 'Kelompok / Group opsi bisnis wajib diisi.', 'error')
      return
    }
    if (!optionForm.name.trim()) {
      Swal.fire('Validasi Gagal', 'Nama opsi bisnis wajib diisi.', 'error')
      return
    }

    setIsSubmittingOption(true)
    try {
      const payload = {
        group: targetGroup,
        name: optionForm.name.trim(),
        code: optionForm.code.trim() || undefined,
        order: Number(optionForm.order) || 0,
        is_active: Boolean(optionForm.is_active),
        description: optionForm.description.trim() || undefined,
      }

      if (editingOption) {
        await businessOptionService.update(editingOption.id, payload)
        Swal.fire('Berhasil', 'Opsi bisnis berhasil diperbarui.', 'success')
      } else {
        await businessOptionService.create(payload)
        Swal.fire('Berhasil', 'Opsi bisnis baru berhasil ditambahkan.', 'success')
      }

      setIsOptionModalOpen(false)
      fetchOptions()
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan opsi bisnis.'
      Swal.fire('Gagal Menyimpan', msg, 'error')
    } finally {
      setIsSubmittingOption(false)
    }
  }

  const handleToggleOptionStatus = async (item) => {
    if (!canManage) return
    try {
      await businessOptionService.toggleStatus(item.id)
      setOptions(prev => prev.map(o => o.id === item.id ? { ...o, is_active: !o.is_active } : o))
    } catch (err) {
      Swal.fire('Gagal', 'Tidak dapat mengubah status opsi bisnis.', 'error')
    }
  }

  const handleDeleteOption = async (item) => {
    if (!canManage) return
    const confirm = await Swal.fire({
      title: 'Hapus Opsi Bisnis?',
      text: `Apakah Anda yakin ingin menghapus opsi "${item.name}"? Data yang sudah tersimpan pada riwayat transaksi tidak akan terhapus.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    })

    if (confirm.isConfirmed) {
      try {
        await businessOptionService.delete(item.id)
        Swal.fire('Dihapus', 'Opsi bisnis berhasil dihapus.', 'success')
        fetchOptions()
      } catch (err) {
        Swal.fire('Gagal', 'Terjadi kesalahan saat menghapus opsi bisnis.', 'error')
      }
    }
  }

  // ── Generator Config Handlers ──
  const handleOpenEditConfig = (item) => {
    if (!canManage) return
    setEditingConfig(item)
    setConfigForm({
      entity_type: item.entity_type,
      prefix: item.prefix || '',
      separator: item.separator || '',
      padding_length: item.padding_length || 4,
      format_pattern: item.format_pattern || '{PREFIX}{SEPARATOR}{SEQUENCE}',
      is_active: item.is_active ?? true,
    })
    setIsConfigModalOpen(true)
  }

  const handleSaveConfig = async (e) => {
    e.preventDefault()
    if (!canManage) return
    setIsSubmittingConfig(true)
    try {
      await codeGeneratorService.saveConfig({
        entity_type: configForm.entity_type,
        prefix: configForm.prefix,
        separator: configForm.separator,
        padding_length: Number(configForm.padding_length),
        format_pattern: configForm.format_pattern,
        is_active: Boolean(configForm.is_active),
      })
      Swal.fire('Berhasil', 'Konfigurasi generator kode berhasil disimpan.', 'success')
      setIsConfigModalOpen(false)
      fetchGeneratorConfigs()
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan konfigurasi generator.'
      Swal.fire('Gagal', msg, 'error')
    } finally {
      setIsSubmittingConfig(false)
    }
  }

  // ── Live Code Generator Test ──
  const handleRunLiveTest = async () => {
    setIsTestingCode(true)
    try {
      const res = await codeGeneratorService.preview(testEntity, {
        unit_id: testUnitId || undefined,
        extra: testExtra || undefined,
      })
      setLivePreviewCode(res?.preview_code || res || 'KODE-TIDAK-DAPAT-DIBUAT')
    } catch (err) {
      setLivePreviewCode('ERROR')
    } finally {
      setIsTestingCode(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ── Breadcrumb ── */}
      <AppBreadcrumb
        items={[
          { label: 'Pengaturan', to: '/dashboard/pengaturan' },
          { label: 'Data Dinamis & Generator Kode' },
        ]}
      />

      {/* ── Hero Header Card ── */}
      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
        <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-gradient-to-br from-emerald-400/25 to-teal-400/0 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
              <Sliders className="h-6 w-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Single Source of Truth Engine</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                Master Opsi Bisnis & Generator Kode
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                Pusat pengelolaan pilihan dropdown dinamis, kategori bisnis terkelola, dan engine penomoran resmi Dareliman Edu.
              </p>
            </div>
          </div>

          {/* Tab Selector Buttons */}
          <AppTabs
            tabs={[
              { id: 'options', label: 'Opsi & Dropdown', icon: Tag },
              { id: 'generator', label: 'Generator Kode', icon: FileCode },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            ariaLabel="Navigasi Master Data Dinamis"
          />
        </div>
      </div>

      {/* ── TAB 1: BUSINESS OPTIONS CONTENT ── */}
      {activeTab === 'options' && (
        <div className="space-y-4">
          {/* Toolbar & Filter Bar */}
          <div id="tabel-opsi-bisnis" className="scroll-mt-6 relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-200/90 dark:border-emerald-800/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  Katalog Opsi Bisnis Terkelola
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Seluruh dropdown dan pilihan form akan mengambil data terbaru langsung dari tabel ini.
                </p>
              </div>
              {canManage && (
                <button
                  onClick={handleOpenAddOption}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Opsi Baru</span>
                </button>
              )}
            </div>

            {/* Filter Bar */}
            <div className="p-4 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 border-b border-emerald-200/80 dark:border-emerald-800/60 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama opsi atau kode kanonik..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div className="sm:w-64">
                <HeroUiFilterSelect
                  value={selectedGroup}
                  onChange={(val) => setSelectedGroup(val)}
                  options={groupFilterOptions}
                  placeholder="Semua Kelompok / Grup"
                  icon={Sliders}
                  searchable={true}
                  className="w-full"
                  ariaLabel="Pilih Kelompok Opsi"
                />
              </div>
            </div>

            {/* Datatable */}
            <div className="overflow-x-auto">
              <TableRoot className="w-full text-left border-collapse text-xs sm:text-sm">
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-100">
                    <TableHead className="py-3 px-4 font-bold w-12 text-center">No</TableHead>
                    <TableHead className="py-3 px-4 font-bold">Grup / Kategori</TableHead>
                    <TableHead className="py-3 px-4 font-bold">Nama Pilihan</TableHead>
                    <TableHead className="py-3 px-4 font-bold">Kode Kanonik</TableHead>
                    <TableHead className="py-3 px-4 font-bold text-center w-20">Urutan</TableHead>
                    <TableHead className="py-3 px-4 font-bold text-center w-28">Status</TableHead>
                    {canManage && <TableHead className="py-3 px-4 font-bold text-right w-36">Aksi</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                  {isLoadingOptions ? (
                    <TableRow>
                      <TableCell colSpan={canManage ? 7 : 6} className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                        <span>Memuat data opsi bisnis...</span>
                      </TableCell>
                    </TableRow>
                  ) : options.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={canManage ? 7 : 6} className="py-12 text-center text-slate-400">
                        Belum ada opsi bisnis yang cocok dengan filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    options.map((opt, idx) => (
                      <TableRow key={opt.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
                        <TableCell className="py-3 px-4 text-center font-medium text-slate-400">{idx + 1}</TableCell>
                        <TableCell className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-mono">
                            {opt.group}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100">
                          {opt.name}
                          {opt.description && (
                            <p className="text-[11px] text-slate-400 font-normal">{opt.description}</p>
                          )}
                        </TableCell>
                        <TableCell className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                          {opt.code}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-center font-bold text-slate-600 dark:text-slate-300">
                          {opt.order ?? 0}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-center">
                          {canManage ? (
                            <button
                              onClick={() => handleToggleOptionStatus(opt)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                opt.is_active
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:text-emerald-300'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              {opt.is_active ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Aktif</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Nonaktif</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                opt.is_active
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              {opt.is_active ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Aktif</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Nonaktif</span>
                                </>
                              )}
                            </span>
                          )}
                        </TableCell>
                        {canManage && (
                          <TableCell className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditOption(opt)}
                                className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                                title="Edit Opsi"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteOption(opt)}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                title="Hapus Opsi"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </TableRoot>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: CODE GENERATOR CONFIGURATION CONTENT ── */}
      {activeTab === 'generator' && (
        <div className="space-y-6">
          {/* Live Tester Simulator Card */}
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Simulator & Live Preview Generator Nomor
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Uji format kode yang akan dihasilkan oleh engine backend secara realtime tanpa memutasi sequence di database.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jenis Entitas Kode
                </label>
                <HeroUiFilterSelect
                  value={testEntity}
                  onChange={(val) => setTestEntity(val)}
                  options={entityTypeOptions}
                  placeholder="Pilih Entitas Kode"
                  icon={Tag}
                  className="w-full"
                  ariaLabel="Pilih Jenis Entitas Kode"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Unit Pendidikan (Opsional)
                </label>
                <HeroUiFilterSelect
                  value={testUnitId}
                  onChange={(val) => setTestUnitId(val)}
                  options={unitTestOptions}
                  placeholder="Semua Unit / Tanpa Unit"
                  icon={School}
                  searchable={true}
                  className="w-full"
                  ariaLabel="Pilih Unit Pendidikan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Token Tambahan / Jenjang
                </label>
                <input
                  type="text"
                  placeholder="Contoh: SD, TK, KLS"
                  value={testExtra}
                  onChange={(e) => setTestExtra(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleRunLiveTest}
                  disabled={isTestingCode}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {isTestingCode ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  <span>Uji Generate Preview</span>
                </button>
              </div>
            </div>

            {livePreviewCode ? (
              <div className="mt-4 p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                    Hasil Preview Kode Resmi Backend:
                  </span>
                  <span className="text-lg sm:text-xl font-black font-mono text-emerald-950 dark:text-emerald-100">
                    {livePreviewCode}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-200/60 dark:bg-emerald-800/60 text-emerald-800 dark:text-emerald-200">
                  <Check className="w-3.5 h-3.5" />
                  <span>Preview Valid</span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Configs Table */}
          <div id="tabel-konfigurasi-generator" className="scroll-mt-6 relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-200/90 dark:border-emerald-800/60">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-emerald-600" />
                Aturan & Pola Format Generator Kode
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pola format mendukung token: <code className="font-mono text-emerald-700">{'{PREFIX}'}</code>, <code className="font-mono text-emerald-700">{'{SEPARATOR}'}</code>, <code className="font-mono text-emerald-700">{'{YEAR}'}</code>, <code className="font-mono text-emerald-700">{'{UNIT_CODE}'}</code>, <code className="font-mono text-emerald-700">{'{EXTRA}'}</code>, <code className="font-mono text-emerald-700">{'{SEQUENCE}'}</code>.
              </p>
            </div>

            <div className="overflow-x-auto">
              <TableRoot className="w-full text-left border-collapse text-xs sm:text-sm">
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-100">
                    <TableHead className="py-3 px-4 font-bold">Entitas Bisnis</TableHead>
                    <TableHead className="py-3 px-4 font-bold">Prefix</TableHead>
                    <TableHead className="py-3 px-4 font-bold text-center">Pemisah</TableHead>
                    <TableHead className="py-3 px-4 font-bold text-center">Digit (Padding)</TableHead>
                    <TableHead className="py-3 px-4 font-bold">Pola Format</TableHead>
                    <TableHead className="py-3 px-4 font-bold text-center">Sequence</TableHead>
                    {canManage && <TableHead className="py-3 px-4 font-bold text-right w-24">Aksi</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                  {isLoadingConfigs ? (
                    <TableRow>
                      <TableCell colSpan={canManage ? 7 : 6} className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                        <span>Memuat aturan generator...</span>
                      </TableCell>
                    </TableRow>
                  ) : generatorConfigs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={canManage ? 7 : 6} className="py-12 text-center text-slate-400">
                        Belum ada konfigurasi generator kustom (menggunakan default sistem).
                      </TableCell>
                    </TableRow>
                  ) : (
                    generatorConfigs.map((cfg) => (
                      <TableRow key={cfg.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
                        <TableCell className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100">
                          {ENTITY_TYPE_LABELS[cfg.entity_type] || cfg.entity_type}
                          <span className="block font-mono text-[11px] text-slate-400 font-normal">
                            {cfg.entity_type}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {cfg.prefix || '-'}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-center font-mono text-slate-600 dark:text-slate-300">
                          {cfg.separator || '-'}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                          {cfg.padding_length}
                        </TableCell>
                        <TableCell className="py-3 px-4 font-mono text-xs text-slate-700 dark:text-slate-300">
                          {cfg.format_pattern}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-center font-bold text-slate-800 dark:text-slate-100">
                          {cfg.current_sequence ?? 0}
                        </TableCell>
                        {canManage && (
                          <TableCell className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleOpenEditConfig(cfg)}
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                              title="Edit Format Aturan"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </TableRoot>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL FORM OPSI BISNIS ── */}
      <AnimatePresence>
        {isOptionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/25 shadow-2xl overflow-hidden"
            >
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
                    {editingOption ? 'Ubah Opsi Bisnis' : 'Tambah Opsi Bisnis Baru'}
                  </h3>
                  <button
                    onClick={() => setIsOptionModalOpen(false)}
                    className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveOption} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Kelompok / Grup Opsi
                    </label>
                    <HeroUiFilterSelect
                      value={optionForm.group}
                      onChange={(val) => setOptionForm(prev => ({ ...prev, group: val }))}
                      disabled={!!editingOption}
                      options={optionModalGroupOptions}
                      placeholder="Pilih Kelompok Opsi"
                      icon={Sliders}
                      searchable={true}
                      className="w-full"
                      ariaLabel="Pilih Kelompok / Grup Opsi"
                    />
                  </div>

                  {optionForm.group === '__custom__' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nama Grup Kustom (snake_case)
                      </label>
                      <input
                        type="text"
                        placeholder="contoh: alumni_track_category"
                        value={optionForm.custom_group}
                        onChange={(e) => setOptionForm(prev => ({ ...prev, custom_group: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Opsi / Label Dropdown <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Pegawai Negeri, Asrama, dll."
                      value={optionForm.name}
                      onChange={(e) => setOptionForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Kode Kanonik (Opsional)
                      </label>
                      <input
                        type="text"
                        placeholder="AUTO-SLUG"
                        value={optionForm.code}
                        onChange={(e) => setOptionForm(prev => ({ ...prev, code: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Urutan Tampilan
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={optionForm.order}
                        onChange={(e) => setOptionForm(prev => ({ ...prev, order: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Deskripsi Keterangan
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Keterangan singkat mengenai opsi ini..."
                      value={optionForm.description}
                      onChange={(e) => setOptionForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="opt_active"
                      checked={optionForm.is_active}
                      onChange={(e) => setOptionForm(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="opt_active" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Opsi Aktif (Dapat dipilih di form dan dropdown)
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsOptionModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingOption}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20"
                    >
                      {isSubmittingOption ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>Simpan Opsi</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL FORM GENERATOR CONFIG ── */}
      <AnimatePresence>
        {isConfigModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/25 shadow-2xl overflow-hidden"
            >
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
                    Ubah Pola Generator Kode
                  </h3>
                  <button
                    onClick={() => setIsConfigModalOpen(false)}
                    className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveConfig} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Entitas Bisnis
                    </label>
                    <input
                      type="text"
                      value={ENTITY_TYPE_LABELS[configForm.entity_type] || configForm.entity_type}
                      disabled
                      className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Prefix (Awalan)
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: KLS, MDS"
                        value={configForm.prefix}
                        onChange={(e) => setConfigForm(prev => ({ ...prev, prefix: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Pemisah (Separator)
                      </label>
                      <input
                        type="text"
                        placeholder="-, /, dll"
                        maxLength={5}
                        value={configForm.separator}
                        onChange={(e) => setConfigForm(prev => ({ ...prev, separator: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Panjang Digit Angka (Padding)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={configForm.padding_length}
                      onChange={(e) => setConfigForm(prev => ({ ...prev, padding_length: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Pola Format Template (Pattern)
                    </label>
                    <input
                      type="text"
                      placeholder="{PREFIX}{SEPARATOR}{EXTRA}{SEPARATOR}{SEQUENCE}"
                      value={configForm.format_pattern}
                      onChange={(e) => setConfigForm(prev => ({ ...prev, format_pattern: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsConfigModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingConfig}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20"
                    >
                      {isSubmittingConfig ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>Simpan Pola</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Smart Floating Scroll Navigator */}
      <SmartScrollFab
        targetId={activeTab === 'options' ? 'tabel-opsi-bisnis' : 'tabel-konfigurasi-generator'}
        downTooltip={activeTab === 'options' ? 'Langsung ke Tabel Opsi' : 'Langsung ke Tabel Aturan'}
      />
    </div>
  )
}
